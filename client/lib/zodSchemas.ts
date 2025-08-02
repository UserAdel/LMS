import { z } from "zod";
export const CourseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
export const couresStatus = ["Draft", "Published", "Archived"] as const;
export const couresCategories = [
  "Development",
  "Business",
  "Finance",
  "It & Software",
  "Office Productivity",
  "Design",
  "Marketing",
  "Health & Fitness",
  "Music",
  "Teaching & Academics",
] as const;
export const courseSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long" })
    .max(100, { message: "Title must be at most 100 characters long" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters long" }),
  fileKey: z.string().min(1, { message: "File is required" }),
  price: z.coerce.number().min(1, { message: "Price must be at least 1" }),
  duration: z.coerce
    .number()
    .min(1, { message: "Duration must be at least 1 minute" })
    .max(500, { message: "Duration must be at most 500 minutes" }),
  level: z.enum(CourseLevels, {
    message: "Please select a valid course level",
  }),
  category: z.enum(couresCategories, {
    message: "Please select a valid course category",
  }),
  smallDescription: z
    .string()
    .min(1, { message: "Short description is required" })
    .max(200, {
      message: "Short description must be at most 200 characters long",
    }),
  slug: z.string().min(3, { message: "Slug is required" }),
  status: z.enum(couresStatus, { message: "Please select a valid status" }),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
