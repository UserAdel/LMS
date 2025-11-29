"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  ClockIcon,
  CalendarIcon,
  BookOpenIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createQuizSchema, CreateQuizSchemaType } from "@/lib/zodSchemas";
import { CreateQuiz } from "./actions";

interface Course {
  id: string;
  title: string;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateQuizSchemaType>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      quiz: {
        title: "",
        description: "",
        courseId: "",
        duration: 60,
        totalMarks: 0,
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
      questions: [
        {
          questionText: "",
          type: "MCQ",
          marks: 1,
          options: [
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
          ],
        },
      ],
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (response.ok) {
          const coursesData = await response.json();
          setCourses(coursesData);
        } else {
          toast.error("Failed to fetch courses");
        }
      } catch (error) {
        toast.error("Error fetching courses");
      }
    };

    fetchCourses();
  }, []);

  // Calculate total marks whenever questions change
  useEffect(() => {
    const questions = form.watch("questions");
    const totalMarks = questions.reduce(
      (sum, question) => sum + (question.marks || 0),
      0
    );
    form.setValue("quiz.totalMarks", totalMarks);
  }, [form.watch("questions")]);

  const addQuestion = () => {
    appendQuestion({
      questionText: "",
      type: "MCQ",
      marks: 1,
      options: [
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ],
    });
  };

  const addOption = (questionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    form.setValue(`questions.${questionIndex}.options`, [
      ...currentOptions,
      { optionText: "", isCorrect: false },
    ]);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`questions.${questionIndex}.options`);
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter(
        (_, index) => index !== optionIndex
      );
      form.setValue(`questions.${questionIndex}.options`, newOptions);
    }
  };

  const onSubmit = async (data: CreateQuizSchemaType) => {
    setIsLoading(true);
    try {
      const result = await CreateQuiz(data);

      if (result.status === "success") {
        toast.success(result.message);
        router.push("/admin/quizzes");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/quizzes">
            <ArrowLeftIcon className="size-4 mr-2" />
            Back to Quizzes
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Quiz</h1>
          <p className="text-muted-foreground">
            Create a new quiz with questions and set scheduling options
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Quiz Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenIcon className="size-5" />
                Quiz Details
              </CardTitle>
              <CardDescription>
                Basic information about your quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quiz.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiz Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter quiz title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quiz.courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="quiz.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter quiz description (optional)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quiz.duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ClockIcon className="size-4" />
                        Duration (minutes)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quiz.startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarIcon className="size-4" />
                        Start Time
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value
                              ? new Date(field.value).toISOString().slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quiz.endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarIcon className="size-4" />
                        End Time
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={
                            field.value
                              ? new Date(field.value).toISOString().slice(0, 16)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="outline">
                  Total Marks: {form.watch("quiz.totalMarks")}
                </Badge>
                <Badge variant="outline">
                  Questions: {questionFields.length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <CardDescription>
                    Add questions and their options for the quiz
                  </CardDescription>
                </div>
                <Button type="button" onClick={addQuestion} variant="outline">
                  <PlusIcon className="size-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questionFields.map((field, questionIndex) => (
                <QuestionCard
                  key={field.id}
                  questionIndex={questionIndex}
                  form={form}
                  onRemove={() => removeQuestion(questionIndex)}
                  onAddOption={() => addOption(questionIndex)}
                  onRemoveOption={(optionIndex) =>
                    removeOption(questionIndex, optionIndex)
                  }
                  canRemove={questionFields.length > 1}
                />
              ))}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/quizzes">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function QuestionCard({
  questionIndex,
  form,
  onRemove,
  onAddOption,
  onRemoveOption,
  canRemove,
}: {
  questionIndex: number;
  form: any;
  onRemove: () => void;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  canRemove: boolean;
}) {
  const questionType = form.watch(`questions.${questionIndex}.type`);
  const options = form.watch(`questions.${questionIndex}.options`);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Question {questionIndex + 1}
          </CardTitle>
          {canRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <TrashIcon className="size-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name={`questions.${questionIndex}.questionText`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your question"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name={`questions.${questionIndex}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MCQ">Multiple Choice</SelectItem>
                      <SelectItem value="TrueFalse">True/False</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`questions.${questionIndex}.marks`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marks</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Options</h4>
            {questionType === "MCQ" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddOption}
              >
                <PlusIcon className="size-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          {questionType === "TrueFalse" ? (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.options.0.isCorrect`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          form.setValue(
                            `questions.${questionIndex}.options.0.optionText`,
                            "True"
                          );
                          form.setValue(
                            `questions.${questionIndex}.options.1.isCorrect`,
                            !checked
                          );
                          form.setValue(
                            `questions.${questionIndex}.options.1.optionText`,
                            "False"
                          );
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>True</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`questions.${questionIndex}.options.1.isCorrect`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          form.setValue(
                            `questions.${questionIndex}.options.1.optionText`,
                            "False"
                          );
                          form.setValue(
                            `questions.${questionIndex}.options.0.isCorrect`,
                            !checked
                          );
                          form.setValue(
                            `questions.${questionIndex}.options.0.optionText`,
                            "True"
                          );
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>False</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-2">
                Select the correct answer(s):
              </div>
              {options.map(
                (
                  _: { optionText: string; isCorrect: boolean },
                  optionIndex: number
                ) => (
                  <div key={optionIndex} className="flex items-center gap-3">
                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.options.${optionIndex}.optionText`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder={`Option ${optionIndex + 1}`}
                              {...field}
                              className={
                                form.watch(
                                  `questions.${questionIndex}.options.${optionIndex}.isCorrect`
                                )
                                  ? "border-green-500 bg-green-50"
                                  : ""
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRemoveOption(optionIndex)}
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
