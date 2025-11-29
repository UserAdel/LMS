import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    // Get all published quizzes with user's attempt data
    const quizzes = await prisma.quiz.findMany({
      where: {
        startTime: {
          lte: new Date(), // Quiz has started
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        attempts: {
          where: {
            studentId: user.id,
          },
          select: {
            id: true,
            score: true,
            finishedAt: true,
            attemptNumber: true,
          },
          orderBy: {
            score: "desc", // Get best score first
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to include attempt status and best score
    const quizzesWithStatus = quizzes.map((quiz) => {
      const now = new Date();
      const isActive = quiz.startTime <= now && quiz.endTime >= now;
      const isExpired = quiz.endTime < now;
      const hasAttempts = quiz.attempts.length > 0;
      const bestScore = hasAttempts
        ? Math.max(...quiz.attempts.map((a) => a.score))
        : 0;
      const totalAttempts = quiz.attempts.length;
      const lastAttempt = quiz.attempts.find((a) => a.finishedAt);

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        course: quiz.course,
        startTime: quiz.startTime,
        endTime: quiz.endTime,
        duration: quiz.duration,
        totalQuestions: quiz._count.questions,
        status: isExpired ? "expired" : isActive ? "active" : "upcoming",
        hasAttempts,
        bestScore,
        totalAttempts,
        lastAttemptDate: lastAttempt?.finishedAt,
      };
    });

    return NextResponse.json(quizzesWithStatus);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
