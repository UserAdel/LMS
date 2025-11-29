"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  LoaderIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createQuizSchema, CreateQuizSchemaType } from "@/lib/zodSchemas";

interface Course {
  id: string;
  title: string;
}

interface QuizData {
  id: number;
  title: string;
  description: string | null;
  courseId: string;
  duration: number;
  totalMarks: number;
  startTime: string;
  endTime: string;
  course: {
    id: string;
    title: string;
  };
  questions: Array<{
    id: number;
    questionText: string;
    type: "MCQ" | "TRUE_FALSE";
    marks: number;
    options: Array<{
      id: number;
      optionText: string;
      isCorrect: boolean;
    }>;
  }>;
}

export default function EditQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [quizData, setQuizData] = useState<QuizData | null>(null);

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
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      questions: [],
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
    replace: replaceQuestions,
  } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  // Fetch quiz data and courses on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesResponse = await fetch("/api/courses");
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData);
        }

        // Fetch quiz data
        const quizResponse = await fetch(`/api/admin/quizzes/${quizId}`);
        if (quizResponse.ok) {
          const quiz = await quizResponse.json();
          setQuizData(quiz);

          // Populate form with existing data
          form.reset({
            quiz: {
              title: quiz.title,
              description: quiz.description || "",
              courseId: quiz.courseId,
              duration: quiz.duration,
              totalMarks: quiz.totalMarks,
              startTime: new Date(quiz.startTime),
              endTime: new Date(quiz.endTime),
            },
            questions: quiz.questions.map((q: any) => ({
              questionText: q.questionText,
              type: q.type,
              marks: q.marks,
              options: q.options.map((opt: any) => ({
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
              })),
            })),
          });
        } else {
          toast.error("Failed to load quiz data");
          router.push("/admin/quizzes");
        }
      } catch (error) {
        toast.error("Error loading data");
        router.push("/admin/quizzes");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [quizId, form, router]);

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
      const response = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Quiz updated successfully");
        router.push("/admin/quizzes");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update quiz");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoaderIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quiz data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Quiz not found</p>
          <Button asChild>
            <Link href="/admin/quizzes">Back to Quizzes</Link>
          </Button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">Edit Quiz</h1>
          <p className="text-muted-foreground">
            Update quiz details, questions, and scheduling options
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
                        value={field.value}
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
                    Edit questions and their options for the quiz
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
              {isLoading ? "Updating..." : "Update Quiz"}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MCQ">Multiple Choice</SelectItem>
                      <SelectItem value="TRUE_FALSE">True/False</SelectItem>
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

          {questionType === "TRUE_FALSE" ? (
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
