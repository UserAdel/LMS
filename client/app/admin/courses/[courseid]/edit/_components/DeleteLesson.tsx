import {
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteLessonAction } from "../actions/action";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";

export default function DeleteLesson({
  chapterId,
  CourseId,
  lessonId,
}: {
  lessonId: string;
  CourseId: string;
  chapterId: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  async function onSumbit() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        deleteLessonAction({ chapterId, CourseId, lessonId })
      );

      if (result?.status === "success") {
        toast.success(result.message);
        setOpen(false);
      } else if (result?.status === "error") {
        toast.error(result?.message);
      }

      if (error) {
        toast.error("An unexpected error occurred. Please try again.");
        return;
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2Icon className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>you are absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            this action cannot be undone. this will permanently delete this
            lesson.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={onSumbit} disabled={pending}>
            {pending ? "Deleteing..." : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
