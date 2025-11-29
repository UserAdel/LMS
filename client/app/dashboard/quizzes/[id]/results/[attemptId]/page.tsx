"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircleIcon,
  XCircleIcon,
  TrophyIcon,
  ClockIcon,
  BookOpenIcon,
  ArrowLeftIcon,
  RefreshCwIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Option {
  id: number;
  optionText: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  questionText: string;
  type: "MCQ" | "TRUE_FALSE";
  marks: number;
  options: Option[];
}

interface QuizResult {
  id: number;
  score: number;
  finishedAt: string;
  quiz: {
    id: number;
    title: string;
    description: string | null;
    course: {
      title: string;
    };
    questions: Question[];
  };
  answers: Array<{
    questionId: number;
    selectedOptionId: number;
    isCorrect: boolean;
  }>;
}

export default function QuizResultsPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(
        `/api/quizzes/${quizId}/results/${attemptId}`
      );
      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        toast.error("Results not found");
        router.push("/dashboard/quizzes");
      }
    } catch (error) {
      toast.error("Error loading results");
      router.push("/dashboard/quizzes");
    } finally {
      setLoading(false);
    }
  };

  const getUserAnswerForQuestion = (questionId: number) => {
    return result?.answers.find((answer) => answer.questionId === questionId);
  };

  const isQuestionCorrect = (question: Question) => {
    const userAnswer = getUserAnswerForQuestion(question.id);
    if (!userAnswer) return false;

    return userAnswer.isCorrect;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircleIcon className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Results Not Found</h3>
            <p className="text-muted-foreground text-center mb-4">
              The quiz results you're looking for don't exist or are no longer
              available.
            </p>
            <Button onClick={() => router.push("/dashboard/quizzes")}>
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const correctAnswers = result.quiz.questions.filter((q) =>
    isQuestionCorrect(q)
  ).length;
  const totalQuestions = result.quiz.questions.length;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/quizzes">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Link>
        </Button>

        <div className="text-center">
          <TrophyIcon
            className={`w-16 h-16 mx-auto mb-4 ${getScoreColor(result.score)}`}
          />
          <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
          <p className="text-muted-foreground">{result.quiz.title}</p>
        </div>
      </div>

      {/* Score Summary */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center">Your Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div>
              <div
                className={`text-6xl font-bold ${getScoreColor(result.score)}`}
              >
                {result.score}%
              </div>
              <p className="text-muted-foreground">Final Score</p>
            </div>

            <Progress value={result.score} className="h-3" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold text-green-600">
                  {correctAnswers}
                </div>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div>
                <div className="text-2xl font-semibold text-red-600">
                  {totalQuestions - correctAnswers}
                </div>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
              <div>
                <div className="text-2xl font-semibold">
                  {result.score}/{100}
                </div>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
              <div>
                <div className="text-2xl font-semibold">{totalQuestions}</div>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ClockIcon className="w-4 h-4" />
              <span>
                Completed on {new Date(result.finishedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Question Review</h2>
          <Badge variant={getScoreBadgeVariant(result.score)}>
            {result.score >= 80
              ? "Excellent"
              : result.score >= 60
                ? "Good"
                : "Needs Improvement"}
          </Badge>
        </div>

        {result.quiz.questions.map((question, index) => {
          const userAnswer = getUserAnswerForQuestion(question.id);
          const isCorrect = isQuestionCorrect(question);
          const correctOptions = question.options.filter(
            (opt) => opt.isCorrect
          );

          return (
            <Card
              key={question.id}
              className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Question {index + 1}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {question.questionText}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-500" />
                    )}
                    <Badge variant="outline">
                      {question.marks} {question.marks === 1 ? "mark" : "marks"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const isUserSelected =
                      userAnswer?.selectedOptionId === option.id;
                    const isCorrectOption = option.isCorrect;

                    return (
                      <div
                        key={option.id}
                        className={`p-4 rounded-xl border-2 hover:shadow-md transition-all duration-200 ${
                          isUserSelected && isCorrectOption
                            ? "bg-green-700 border-green-600 text-white"
                            : isUserSelected && !isCorrectOption
                              ? "bg-red-900 border-red-800 text-white"
                              : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                              {String.fromCharCode(65 + optionIndex)}
                            </div>
                            <span className="text-lg font-medium text-gray-800 leading-relaxed">
                              {option.optionText}
                            </span>
                          </div>
                          <div className="flex gap-2 ">
                            {isUserSelected && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-500 text-white border-blue-500 shadow-sm"
                              >
                                Your Answer
                              </Badge>
                            )}
                            {/* {isCorrectOption && (
                              <Badge
                                variant="default"
                                className="text-xs bg-green-500 text-white shadow-sm"
                              >
                                ✓ Correct
                              </Badge>
                            )} */}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!isCorrect && (
                  <div className="bg-green-50 border border-green-500 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Correct Answer:</strong>{" "}
                      {correctOptions.map((opt) => opt.optionText).join(", ")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline">
          <Link href={`/dashboard/quizzes/${quizId}`}>
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Retake Quiz
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/quizzes">
            <BookOpenIcon className="w-4 h-4 mr-2" />
            Browse More Quizzes
          </Link>
        </Button>
      </div>
    </div>
  );
}
