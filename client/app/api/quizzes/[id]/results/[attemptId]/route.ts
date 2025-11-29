import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attemptId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;
    const { id, attemptId } = await params;

    const quizAttempt = await prisma.studentQuizAttempt.findUnique({
      where: {
        id: parseInt(attemptId),
        studentId: user.id, // Ensure user can only see their own results
      },
      include: {
        quiz: {
          include: {
            course: {
              select: {
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
        },
        answers: {
          select: {
            questionId: true,
            selectedOptionId: true,
            isCorrect: true,
          },
        },
      },
    });

    if (!quizAttempt) {
      return NextResponse.json({ error: "Results not found" }, { status: 404 });
    }

    // Verify the quiz ID matches
    if (quizAttempt.quiz.id !== parseInt(id)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    return NextResponse.json(quizAttempt);
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
