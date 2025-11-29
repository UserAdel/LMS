
import { prisma } from "./lib/db";

async function main() {
  console.log("Starting reproduction script...");
  try {
    const userId = "test-user-id";
    console.log("Querying quizzes...");
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
            studentId: userId,
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
    console.log("Query successful. Found quizzes:", quizzes.length);
    console.log(JSON.stringify(quizzes, null, 2));
  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
