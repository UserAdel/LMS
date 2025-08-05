"use server";
import { prisma } from "@/lib/db";
import { CourseSchemaType, courseSchema } from "@/lib/zodSchemas";
import { ApiResponse } from "@/lib/type";
export async function CreateCource(
  data: CourseSchemaType
): Promise<ApiResponse> {
  try {
    const validation = courseSchema.safeParse(data);

    if (!validation.success) {
      return { status: "error", message: "Invalid Form Data" };
    }

    await prisma.course.create({
      data: { ...validation.data, userId: "54564145" },
    });

    return { status: "success", message: "Course Created Successfully" };
  } catch (error) {
    return { status: "error", message: "Failed to create course" };
  }
}
