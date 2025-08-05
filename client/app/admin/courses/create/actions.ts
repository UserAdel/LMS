"use server";
import { prisma } from "@/lib/db";
import { CourseSchemaType, courseSchema } from "@/lib/zodSchemas";
import { ApiResponse } from "@/lib/type";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
export async function CreateCource(
  data: CourseSchemaType
): Promise<ApiResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const validation = courseSchema.safeParse(data);

    if (!validation.success) {
      return { status: "error", message: "Invalid Form Data" };
    }

    await prisma.course.create({
      data: { ...validation.data, userId: session?.user.id as string },
    });

    return { status: "success", message: "Course Created Successfully" };
  } catch (error) {
    return { status: "error", message: "Failed to create course" };
  }
}
