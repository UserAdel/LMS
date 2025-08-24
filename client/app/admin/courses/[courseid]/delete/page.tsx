"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { tryCatch } from "@/hooks/try-catch";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteCourse } from "./actions";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

export default function DeleteCourseRoute() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const params = useParams<{ courseId: string }>();

  console.log(
    "DEBUG DELETE — raw params type:",
    Object.prototype.toString.call(params)
  );
  console.log("DEBUG DELETE — params object:", params);

  try {
    console.log("DEBUG DELETE — params keys:", Object.keys(params ?? {}));
  } catch (e) {
    console.log("DEBUG DELETE — params keys error:", e);
  }

  const courseId =
    params?.courseId ??
    (params as any)?.id ??
    (params && Object.values(params)[0]);

  console.log("DEBUG DELETE — final courseId:", courseId);

  if (!courseId) {
    return <div>Course Not Found</div>;
  }

  const onSubmit = async () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(deleteCourse(courseId));

      if (error) {
        toast.error("An Unexpected error occurred. Please try again");
      }
      if (result?.status === "success") {
        toast.success(result.message);
        router.push("/admin/courses");
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  };
  return (
    <div className="max-w-md mx-auto w-full">
      <Card className="mt-32">
        <CardHeader className="text-center">
          <CardTitle>Are you sure you want to delete this course?</CardTitle>
          <CardDescription>this action can&apos;t be undone.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Link
            className={buttonVariants({
              variant: "outline",
            })}
            href="/admin/courses"
          >
            Cancel
          </Link>
          <Button disabled={pending} variant="destructive" onClick={onSubmit}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-4" /> Delete
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
