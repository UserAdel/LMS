import "server-only";
import { requireUser } from "../user/require-users";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getLessonContent(lessonId: string) {
  const session = await requireUser();
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      thumnailKey: true,
      videoKey: true,
      position: true,
      Chapter: {
        select: {
          courseId: true,
        },
      },
    },
  });
  if (!lesson) {
    return notFound();
  }
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.id,
        courseId: lesson.Chapter.courseId,
      },
    },
    select: {
      status: true,
    },
  });
  if (!enrollment || enrollment.status !== "Active") {
    return notFound();
  }
  return lesson;
}

export type getLessonContentType = Awaited<ReturnType<typeof getLessonContent>>;
