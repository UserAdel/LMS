"use client";

import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, PlusIcon, SparkleIcon } from "lucide-react";

import { useForm } from "react-hook-form";
import {
  CourseLevels,
  courseSchema,
  couresCategories,
  couresStatus,
  CourseSchemaType,
} from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import slugify from "slugify";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/components/file-uploader/Uploader";
import { toast } from "sonner";

import { useTransition } from "react";
import { tryCatch } from "@/hooks/try-catch";
import { useRouter } from "next/navigation";
import editCourse from "../actions/action";
import { AdminCourseSingularType } from "@/app/data/admin/admin-get-courses";

interface iAppProps {
  data: AdminCourseSingularType;
}
export function EditCourseForm({ data }: iAppProps) {
  const router = useRouter();
  const [Pending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: data.title,
      description: data.description,
      fileKey: data.fileKey,
      price: data.price,
      duration: data.duration,
      level: data.level,
      category: data.category as CourseSchemaType["category"],
      status: data.status,
      slug: data.slug,
      smallDescription: data.smallDescription,
    },
  });
  const onSubmit = async (values: z.infer<typeof courseSchema>) => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        editCourse(values, data.id)
      );

      if (error) {
        toast.error("An Unexpected error occurred. Please try again");
      }
      if (result?.status === "success") {
        toast.success(result.message);
        form.reset();
        router.push("/admin/courses");
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field}></Input>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="flex gap-4 items-end">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="Slug" {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button
            type="button"
            className="w-fit"
            onClick={() => {
              const titleValue = form.getValues("title");
              const slug = slugify(titleValue, {
                lower: true,
                strict: true,
              });
              form.setValue("slug", slug, {
                shouldValidate: true,
              });
            }}
          >
            Generate Slug <SparkleIcon className="ml-1" size={16} />
          </Button>
        </div>
        <FormField
          control={form.control}
          name="smallDescription"
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <FormLabel>Small Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Small Description"
                    className="min-h-[120px]"
                    {...field}
                  ></Textarea>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <RichTextEditor field={field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="fileKey"
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <FormLabel>Thumbnail Image</FormLabel>
                <FormControl>
                  <Uploader onChange={field.onChange} value={field.value} />
                  {/* <Input placeholder="thumbnail url " {...field}></Input> */}
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {couresCategories.map((category: string) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CourseLevels.map((level: string) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Duration"
                      type="number"
                      {...field}
                      value={field.value?.toString() || ""}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => {
              return (
                <FormItem className="w-full">
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Price"
                      type="number"
                      {...field}
                      value={field.value?.toString() || ""}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => {
            return (
              <FormItem className="w-full">
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {couresStatus.map((status: string) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <Button type="submit" disabled={Pending}>
          {Pending ? (
            <>
              Creating...
              <Loader2 className="animate-spin mr-2" size={16} />
            </>
          ) : (
            <>
              Edit Course <PlusIcon className="ml-1" size={16} />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
