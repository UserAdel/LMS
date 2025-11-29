"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Trophy, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Quiz {
  id: number;
  title: string;
  description: string | null;
  course: {
    id: string;
    title: string;
  };
  startTime: string;
  endTime: string;
  duration: number;
  totalQuestions: number;
  status: "active" | "upcoming" | "expired";
  hasAttempts: boolean;
  bestScore: number;
  totalAttempts: number;
  lastAttemptDate: string | null;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes");
      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }
      const data = await response.json();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600";
      case "upcoming":
        return "bg-blue-500 hover:bg-blue-600";
      case "expired":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "upcoming":
        return "Upcoming";
      case "expired":
        return "Expired";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={fetchQuizzes} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Available Quizzes</h1>
        <p className="text-muted-foreground">
          Take quizzes to test your knowledge and track your progress
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No quizzes available</h3>
          <p className="text-muted-foreground">
            Check back later for new quizzes or contact your instructor.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{quiz.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {quiz.course.title}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(quiz.status)}>
                    {getStatusText(quiz.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {quiz.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {quiz.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {quiz.totalQuestions} questions
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {quiz.duration} minutes
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ends{" "}
                    {formatDistanceToNow(new Date(quiz.endTime), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                {quiz.hasAttempts && (
                  <div className="bg-muted rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                        Best Score: {quiz.bestScore}%
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {quiz.totalAttempts} attempts
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {quiz.status === "active" && (
                    <Button asChild className="flex-1">
                      <Link href={`/dashboard/quizzes/${quiz.id}`}>
                        {quiz.hasAttempts ? "Retake Quiz" : "Start Quiz"}
                      </Link>
                    </Button>
                  )}

                  {quiz.hasAttempts && (
                    <Button variant="outline" asChild className="flex-1">
                      <Link href={`/dashboard/quizzes/${quiz.id}/results`}>
                        View Results
                      </Link>
                    </Button>
                  )}

                  {quiz.status === "upcoming" && (
                    <Button disabled className="flex-1">
                      Not Started Yet
                    </Button>
                  )}

                  {quiz.status === "expired" && !quiz.hasAttempts && (
                    <Button disabled className="flex-1">
                      Expired
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
