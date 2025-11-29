"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Clock, ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Option {
  id: number;
  optionText: string;
}

interface Question {
  id: number;
  questionText: string;
  type: "MCQ" | "TRUE_FALSE";
  marks: number;
  options: Option[];
}

interface Quiz {
  id: number;
  title: string;
  description: string | null;
  duration: number;
  course: {
    id: string;
    title: string;
  };
  questions: Question[];
  existingAttempts: number;
  hasUnfinishedAttempt: boolean;
}

interface Answer {
  questionId: number;
  selectedOptionId: number | null;
}

export default function QuizTakingPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeLeft]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch quiz");
      }
      const data = await response.json();
      setQuiz(data);
      setTimeLeft(data.duration * 60); // Convert minutes to seconds

      // Initialize answers array
      const initialAnswers = data.questions.map((q: Question) => ({
        questionId: q.id,
        selectedOptionId: null,
      }));
      setAnswers(initialAnswers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    toast.success("Quiz started! Good luck!");
  };

  const handleAnswerChange = (questionId: number, optionId: number) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, selectedOptionId: optionId }
          : answer
      )
    );
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      const result = await response.json();
      toast.success("Quiz submitted successfully!");
      router.push(`/dashboard/quizzes/${quizId}/results/${result.attemptId}`);
    } catch (err) {
      toast.error("Failed to submit quiz. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getAnsweredCount = () => {
    return answers.filter((answer) => answer.selectedOptionId !== null).length;
  };

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const currentAnswer = answers.find(
    (answer) => answer.questionId === currentQuestion?.id
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Quiz not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
            <p className="text-muted-foreground">{quiz.course.title}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz.description && (
              <p className="text-muted-foreground">{quiz.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Questions:</strong> {quiz.questions.length}
              </div>
              <div>
                <strong>Duration:</strong> {quiz.duration} minutes
              </div>
              <div>
                <strong>Previous Attempts:</strong> {quiz.existingAttempts}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Instructions:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>You have {quiz.duration} minutes to complete this quiz</li>
                <li>
                  You can navigate between questions using the navigation
                  buttons
                </li>
                <li>Make sure to answer all questions before submitting</li>
                <li>The quiz will auto-submit when time runs out</li>
              </ul>
            </div>

            <Button onClick={startQuiz} className="w-full" size="lg">
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with timer and progress */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.course.title}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4" />
            <span
              className={`font-mono text-lg ${timeLeft < 300 ? "text-red-500" : ""}`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {getAnsweredCount()} of {quiz.questions.length} answered
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <Progress
          value={(getAnsweredCount() / quiz.questions.length) * 100}
          className="h-2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question navigation sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                {quiz.questions.map((_, index) => {
                  const isAnswered = answers[index]?.selectedOptionId !== null;
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <Button
                      key={index}
                      variant={
                        isCurrent
                          ? "default"
                          : isAnswered
                            ? "secondary"
                            : "outline"
                      }
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(index)}
                      className="w-full justify-start"
                    >
                      {index + 1}
                      {isAnswered && <Flag className="h-3 w-3 ml-1" />}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main question area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </CardTitle>
                <Badge variant="secondary">
                  {currentQuestion?.marks} marks
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg">{currentQuestion?.questionText}</p>

              <RadioGroup
                value={currentAnswer?.selectedOptionId?.toString() || ""}
                onValueChange={(value: any) =>
                  handleAnswerChange(currentQuestion!.id, parseInt(value))
                }
              >
                {currentQuestion?.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.id.toString()}
                      id={`option-${option.id}`}
                    />
                    <Label
                      htmlFor={`option-${option.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option.optionText}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex(
                      Math.max(0, currentQuestionIndex - 1)
                    )
                  }
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {submitting ? "Submitting..." : "Submit Quiz"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        setCurrentQuestionIndex(
                          Math.min(
                            quiz.questions.length - 1,
                            currentQuestionIndex + 1
                          )
                        )
                      }
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
