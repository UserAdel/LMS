import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";

export async function GET() {
  try {
    // Verify admin access
    await requireAdmin();

    // Fetch all published courses
    const courses = await prisma.course.findMany({
      where: {
        status: "Published",
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
