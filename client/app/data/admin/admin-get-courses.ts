import "server-only";
import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetCourses() {
  await requireAdmin();
  const data = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      smallDescription: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      slug: true,
      category: true,
      chapter: {
        select: {
          id: true,
          title: true,
          position: true,
          lesson: {
            select: {
              id: true,
              title: true,
              position: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return data;
}

export type AdminCourseSingularType = Awaited<
  ReturnType<typeof adminGetCourses>
>[0];
