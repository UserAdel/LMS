"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { createQuizSchema, CreateQuizSchemaType } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";

export async function CreateQuiz(data: CreateQuizSchemaType) {
  try {
    // Verify admin access
    await requireAdmin();

    // Validate the input data
    const validatedData = createQuizSchema.parse(data);

    // Check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: validatedData.quiz.courseId },
    });

    if (!course) {
      return {
        status: "error",
        message: "Selected course not found",
      };
    }

    // Create quiz with questions and options in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the quiz
      const quiz = await tx.quiz.create({
        data: {
          title: validatedData.quiz.title,
          description: validatedData.quiz.description,
          courseId: validatedData.quiz.courseId,
          duration: validatedData.quiz.duration,
          totalMarks: validatedData.quiz.totalMarks,
          startTime: validatedData.quiz.startTime,
          endTime: validatedData.quiz.endTime,
        },
      });

      // Create questions with their options
      for (const questionData of validatedData.questions) {
        const question = await tx.question.create({
          data: {
            quizId: quiz.id,
            questionText: questionData.questionText,
            type: questionData.type,
            marks: questionData.marks,
          },
        });

        // Create options for the question
        await tx.option.createMany({
          data: questionData.options.map((option) => ({
            questionId: question.id,
            optionText: option.optionText,
            isCorrect: option.isCorrect,
          })),
        });
      }

      return quiz;
    });

    // Revalidate the quizzes page
    revalidatePath("/admin/quizzes");

    return {
      status: "success",
      message: "Quiz created successfully!",
      data: result,
    };
  } catch (error) {
    console.error("Error creating quiz:", error);

    if (error instanceof Error) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "error",
      message: "An unexpected error occurred while creating the quiz",
    };
  }
}
