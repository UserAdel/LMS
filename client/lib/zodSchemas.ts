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
      message: "Short description must be at most 200 cha racters long",
    }),
  slug: z.string().min(3, { message: "Slug is required" }),
  status: z.enum(couresStatus, { message: "Please select a valid status" }),
});

export const chpaterSchema = z.object({
  name: z
    .string()
    .min(3, { message: "name must be at least 3 characters long" }),
  courseId: z.string().uuid({ message: "course id is required" }),
});
export const lessonSchema = z.object({
  name: z
    .string()
    .min(3, { message: "name must be at least 3 characters long" }),
  courseId: z.string().uuid({ message: "course id is required" }),
  chapterId: z.string().uuid({ message: "chapter id is required" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters long" })
    .optional(),
  thumnailKey: z.string().optional(),
  videoKey: z.string().optional(),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
export type ChapterSchemaType = z.infer<typeof chpaterSchema>;
export type lessonSchemaType = z.infer<typeof lessonSchema>;

export const QuestionTypes = ["MCQ", "TRUE_FALSE"] as const;

export const quizSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 characters long" })
      .max(100, { message: "Title must be at most 100 characters long" }),
    description: z.string().optional(),
    courseId: z.string().uuid({ message: "Course selection is required" }),
    duration: z
      .number()
      .min(1, { message: "Duration must be at least 1 minute" })
      .max(300, { message: "Duration must be at most 300 minutes" })
      .optional(),
    totalMarks: z
      .number()
      .min(1, { message: "Total marks must be at least 1" })
      .optional(),
    startTime: z.date({ message: "Start time is required" }),
    endTime: z.date({ message: "End time is required" }),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const questionSchema = z.object({
  questionText: z
    .string()
    .min(10, { message: "Question must be at least 10 characters long" }),
  type: z.enum(QuestionTypes, { message: "Please select a question type" }),
  marks: z
    .number()
    .min(1, { message: "Marks must be at least 1" })
    .max(100, { message: "Marks must be at most 100" }),
  options: z
    .array(
      z.object({
        optionText: z.string().min(1, { message: "Option text is required" }),
        isCorrect: z.boolean(),
      })
    )
    .min(2, { message: "At least 2 options are required" })
    .refine((options) => options.some((option) => option.isCorrect), {
      message: "At least one option must be marked as correct",
    }),
});

export const createQuizSchema = z.object({
  quiz: quizSchema,
  questions: z
    .array(questionSchema)
    .min(1, { message: "At least one question is required" }),
});

export type QuizSchemaType = z.infer<typeof quizSchema>;
export type QuestionSchemaType = z.infer<typeof questionSchema>;
export type CreateQuizSchemaType = z.infer<typeof createQuizSchema>;
