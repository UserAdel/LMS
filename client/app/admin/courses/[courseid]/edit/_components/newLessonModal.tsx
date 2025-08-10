import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Fix import source for Form
import { Input } from "@/components/ui/input";
import {
  ChapterSchemaType,
  chpaterSchema,
  lessonSchema,
  lessonSchemaType,
} from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogDescription,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { Loader2, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form"; // Remove Form import from react-hook-form
import { createLesson } from "../actions/action";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";

export function NewLessonModal({
  courseId,
  chapterId,
}: {
  courseId: string;
  chapterId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  async function onSubmit(values: ChapterSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(createLesson(values));
      if (result?.status === "success") {
        toast.success("lesson created successfully");
        form.reset();
        setIsOpen(false);
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
      if (error) {
        toast.error("An unexpected errpr pccurred. Please try again.");
        return;
      }
    });
    console.log(values.courseId);
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };
  const form = useForm<lessonSchemaType>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: "",
      courseId: courseId,
      chapterId: chapterId,
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center gap-1"
        >
          <Plus className="size-4" />
          New Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] ">
        <DialogHeader>
          <DialogTitle>Create new lesson</DialogTitle>
          <DialogDescription>
            What Woould you like to name your lesson
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Lesson Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Lesson Name" {...field}></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <DialogFooter>
              <Button disabled={pending} type="submit">
                {pending ? <Loader2 className="size-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
