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
import { ChapterSchemaType, chpaterSchema } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogDescription,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { Loader2, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form"; // Remove Form import from react-hook-form
import { createChapter } from "../actions/action";
import { tryCatch } from "@/hooks/try-catch";
import { toast } from "sonner";

export function NewChapterModal({ courseId }: { courseId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  async function onSubmit(values: ChapterSchemaType) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(createChapter(values));
      if (result?.status === "success") {
        toast.success("chapter created successfully");
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
  const form = useForm<ChapterSchemaType>({
    resolver: zodResolver(chpaterSchema),
    defaultValues: {
      name: "",
      courseId: courseId,
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="size-4" />
          New Chapter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] ">
        <DialogHeader>
          <DialogTitle>Create new chapter</DialogTitle>
          <DialogDescription>
            What Woould you like to name your chpater
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
                    <FormLabel>Chapter Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Chapter Name" {...field}></Input>
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
