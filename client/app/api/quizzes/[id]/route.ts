import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
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
    const quizId = parseInt(id);

    // Get quiz with questions but without correct answers
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
            options: {
              select: {
                id: true,
                optionText: true,
                // Don't include isCorrect for security
              },
            },
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

    // Check if quiz is available (started but not ended)
    const now = new Date();
    if (quiz.startTime > now) {
      return NextResponse.json(
        { error: "Quiz has not started yet" },
        { status: 400 }
      );
    }

    if (quiz.endTime < now) {
      return NextResponse.json({ error: "Quiz has ended" }, { status: 400 });
    }

    // Check if user has any existing attempts
    const existingAttempts = await prisma.studentQuizAttempt.findMany({
      where: {
        quizId: quizId,
        studentId: user.id,
      },
      select: {
        id: true,
        finishedAt: true,
        attemptNumber: true,
      },
      orderBy: {
        attemptNumber: "desc",
      },
    });

    return NextResponse.json({
      ...quiz,
      existingAttempts: existingAttempts.length,
      hasUnfinishedAttempt: existingAttempts.some(
        (attempt) => !attempt.finishedAt
      ),
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
