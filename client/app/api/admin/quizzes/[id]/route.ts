import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const quizId = parseInt(id);

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const quizId = parseInt(id);

    const body = await request.json();
    const { quiz: quizData, questions } = body;

    // Update quiz and questions in a transaction
    const updatedQuiz = await prisma.$transaction(async (tx) => {
      // Update quiz basic info
      const quiz = await tx.quiz.update({
        where: { id: quizId },
        data: {
          title: quizData.title,
          description: quizData.description,
          courseId: quizData.courseId,
          duration: quizData.duration,
          totalMarks: quizData.totalMarks,
          startTime: new Date(quizData.startTime),
          endTime: new Date(quizData.endTime),
        },
      });

      // Delete existing questions and options
      await tx.option.deleteMany({
        where: {
          question: {
            quizId: quizId,
          },
        },
      });

      await tx.question.deleteMany({
        where: {
          quizId: quizId,
        },
      });

      // Create new questions and options
      for (const questionData of questions) {
        const question = await tx.question.create({
          data: {
            quizId: quizId,
            questionText: questionData.questionText,
            type: questionData.type,
            marks: questionData.marks,
          },
        });

        // Create options for this question
        for (const optionData of questionData.options) {
          await tx.option.create({
            data: {
              questionId: question.id,
              optionText: optionData.optionText,
              isCorrect: optionData.isCorrect,
            },
          });
        }
      }

      return quiz;
    });

    return NextResponse.json({
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const quizId = parseInt(id);

    // Delete quiz and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete student answers
      await tx.studentAnswer.deleteMany({
        where: {
          question: {
            quizId: quizId,
          },
        },
      });

      // Delete quiz attempts
      await tx.studentQuizAttempt.deleteMany({
        where: {
          quizId: quizId,
        },
      });

      // Delete options
      await tx.option.deleteMany({
        where: {
          question: {
            quizId: quizId,
          },
        },
      });

      // Delete questions
      await tx.question.deleteMany({
        where: {
          quizId: quizId,
        },
      });

      // Delete quiz
      await tx.quiz.delete({
        where: {
          id: quizId,
        },
      });
    });

    return NextResponse.json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
