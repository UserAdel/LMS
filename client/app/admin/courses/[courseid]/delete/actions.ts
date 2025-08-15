"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { tryCatch } from "@/hooks/try-catch";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/type";
import { revalidatePath } from "next/cache";

export async function deleteCourse(courseId: string): Promise<ApiResponse> {
  await requireAdmin();
  try {
    await prisma.course.delete({
      where: {
        id: courseId,
      },
    });
    revalidatePath("/admin/courses");
    return {
      status: "success",
      message: "Course Deleted Successfully",
    };
  } catch (error) {
    console.log(error);
    console.error(error);
    return {
      status: "error",
      message: "Error while deleting the Course",
    };
  }
}
