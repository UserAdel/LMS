import "server-only";
import { requireUser } from "./require-users";
import { prisma } from "@/lib/db";
export async function getEnrolledCourses() {
  const user = await requireUser();

  const data = prisma.enrollment.findMany({
    where: {
      userId: user.id,
      status: "Active",
    },
    select: {
      Course: {
        select: {
          id: true,
          smallDescription: true,
          title: true,
          fileKey: true,
          level: true,
          slug: true,
          duration: true,
          chapter: {
            select: {
              id: true,
              lesson: {
                select: {
                  id: true,
                  lessonProgess: {
                    where: {
                      userId: user.id,
                    },
                    select: {
                      id: true,
                      lessonId: true,
                      completed: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  return data;
}

export type EnrolledCoursesType = Awaited<
  ReturnType<typeof getEnrolledCourses>
>[0];
