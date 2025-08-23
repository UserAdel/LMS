"use server";
import { prisma } from "@/lib/db";
import { CourseSchemaType, courseSchema } from "@/lib/zodSchemas";
import { ApiResponse } from "@/lib/type";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";
import { stripe } from "@/lib/stripe";

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    })
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    })
  );

export async function CreateCource(
  values: CourseSchemaType
): Promise<ApiResponse> {
  const session = await requireAdmin();
  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: session?.user.id as string,
    });
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return {
          status: "error",
          message: "you have been blocked due to rate limiting",
        };
      } else {
        return {
          status: "error",
          message: "you are a bot! if this is a mistake contact our support",
        };
      }
    }
    const validation = courseSchema.safeParse(values);

    if (!validation.success) {
      return { status: "error", message: "Invalid Form Data" };
    }

    const data = await stripe.products.create({
      name: validation.data.title,
      description: validation.data.smallDescription,
      default_price_data: {
        currency: "usd",
        unit_amount: validation.data.price * 100,
      },
    });
    await prisma.course.create({
      data: {
        ...validation.data,
        userId: session?.user.id as string,
        stripePriceId: data.default_price as string,
      },
    });

    return { status: "success", message: "Course Created Successfully" };
  } catch {
    return { status: "error", message: "Failed to create course" };
  }
}
