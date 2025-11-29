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

    const resolvedParams = await params;
    const quizId = parseInt(resolvedParams.id);
    if (isNaN(quizId)) {
      return NextResponse.json({ error: "Invalid quiz ID" }, { status: 400 });
    }

    // Fetch user's attempts for this quiz
    const attempts = await prisma.studentQuizAttempt.findMany({
      where: {
        quizId: quizId,
        studentId: session.user.id,
      },
      select: {
        id: true,
        score: true,
        finishedAt: true,
        attemptNumber: true,
      },
      orderBy: {
        attemptNumber: "desc",
      },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
