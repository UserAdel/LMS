import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface UserAnswer {
  questionId: number;
  selectedOptionId: number | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    const { id } = await params;

    const { answers }: { answers: UserAnswer[] } = await request.json();

    // Fetch quiz with questions and correct answers
    const quiz = await prisma.quiz.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Check if quiz is still available
    const now = new Date();
    if (now < quiz.startTime || now > quiz.endTime) {
      return NextResponse.json(
        { error: "Quiz is no longer available" },
        { status: 403 }
      );
    }

    // Calculate score
    let totalMarks = 0;
    let earnedMarks = 0;
    const questionResults: Array<{
      questionId: string;
      isCorrect: boolean;
      marks: number;
      earnedMarks: number;
    }> = [];

    for (const question of quiz.questions) {
      totalMarks += question.marks;

      const userAnswer = answers.find((a) => a.questionId === question.id);
      const correctOptions = question.options.filter((opt) => opt.isCorrect);
      const correctOptionIds = correctOptions.map((opt) => opt.id);

      let isCorrect = false;
      let questionEarnedMarks = 0;

      if (userAnswer && userAnswer.selectedOptionId !== null) {
        // Check if the selected option is correct
        isCorrect = correctOptionIds.includes(userAnswer.selectedOptionId);

        if (isCorrect) {
          questionEarnedMarks = question.marks;
          earnedMarks += question.marks;
        }
      }

      questionResults.push({
        questionId: question.id.toString(),
        isCorrect,
        marks: question.marks,
        earnedMarks: questionEarnedMarks,
      });
    }

    const scorePercentage =
      totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;

    // Save quiz attempt to database
    const quizAttempt = await prisma.$transaction(async (tx) => {
      // Create quiz attempt
      const attempt = await tx.studentQuizAttempt.create({
        data: {
          studentId: user.id,
          quizId: parseInt(id),
          score: scorePercentage,
          finishedAt: new Date(),
        },
      });

      // Save individual answers
      for (const answer of answers) {
        if (answer.selectedOptionId !== null) {
          const questionResult = questionResults.find(
            (qr) => parseInt(qr.questionId) === answer.questionId
          );

          await tx.studentAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId: answer.questionId,
              selectedOptionId: answer.selectedOptionId,
              isCorrect: questionResult?.isCorrect || false,
            },
          });
        }
      }

      return attempt;
    });

    return NextResponse.json({
      attemptId: quizAttempt.id,
      score: scorePercentage,
      earnedMarks,
      totalMarks,
      questionResults,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
