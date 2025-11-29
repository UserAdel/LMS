import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Debug environment variables
    if (!process.env.BETTER_AUTH_SECRET) {
      console.error("BETTER_AUTH_SECRET is missing");
    }
    if (!process.env.BETTER_AUTH_URL) {
      console.error("BETTER_AUTH_URL is missing");
    }

    let session;
    try {
      session = await auth.api.getSession({
        headers: request.headers,
      });
      console.log("Session retrieved:", session ? "Yes" : "No");
      if (session?.user) {
        console.log("User ID:", session.user.id);
      }
    } catch (authError) {
      console.error("Error retrieving session:", authError);
      return NextResponse.json({ error: "Authentication failed", details: String(authError) }, { status: 500 });
    }

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let quizzes;
    try {
      // Get all published quizzes with user's attempt data
      quizzes = await prisma.quiz.findMany({
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
              studentId: session.user.id,
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
    } catch (dbError) {
      console.error("Database error fetching quizzes:", dbError);
      return NextResponse.json({ error: "Database error", details: String(dbError) }, { status: 500 });
    }

    console.log(`Found ${quizzes.length} quizzes`);

    // Transform data to include attempt status and best score
    const quizzesWithStatus = quizzes.map((quiz) => {
      const now = new Date();
      const startTime = new Date(quiz.startTime);
      const endTime = new Date(quiz.endTime);
      
      const isActive = startTime <= now && endTime >= now;
      const isExpired = endTime < now;
      const attempts = quiz.attempts || [];
      const hasAttempts = attempts.length > 0;
      const bestScore = hasAttempts
        ? Math.max(...attempts.map((a) => a.score))
        : 0;
      const totalAttempts = attempts.length;
      const lastAttempt = attempts.find((a) => a.finishedAt);

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        course: quiz.course,
        startTime: startTime,
        endTime: endTime,
        duration: quiz.duration,
        totalQuestions: quiz._count?.questions ?? 0,
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
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
