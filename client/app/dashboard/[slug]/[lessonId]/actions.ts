"use server";

import { requireUser } from "@/app/data/user/require-users";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { revalidatePath } from "next/cache";

export async function MarkLessonAsComplete(
  lessonId: string,
  slug: string
): Promise<ApiResponse> {
  const session = await requireUser();
  try {
    await prisma.lessonProgess.upsert({
      where: {
        userId_lessonId: {
          userId: session.id,
          lessonId: lessonId,
        },
      },
      update: {
        completed: true,
      },
      create: {
        lessonId: lessonId,
        userId: session.id,
        completed: true,
      },
    });
    revalidatePath(`/dashboard/${slug}`);
    return {
      status: "success",
      message: "Progress updated",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to mark lesson as complete",
    };
  }
}
