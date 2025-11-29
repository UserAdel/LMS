import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, Clock, Users, BookOpen, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns/format";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";

export default async function QuizzesPage() {
  await requireAdmin();

  const quizzes = await prisma.quiz.findMany({
    include: {
      course: {
        select: {
          title: true,
        },
      },
      questions: {
        select: {
          id: true,
        },
      },
      attempts: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">
            Manage your course quizzes and assessments
          </p>
        </div>
        <Link className={buttonVariants()} href="/admin/quizzes/create">
          <PlusIcon className="size-4 mr-2" />
          Create Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quizzes yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first quiz to start assessing your students
            </p>
            <Link className={buttonVariants()} href="/admin/quizzes/create">
              <PlusIcon className="size-4 mr-2" />
              Create Quiz
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </>
  );
}

function QuizCard({ quiz }: { quiz: any }) {
  const isActive = new Date() >= quiz.startTime && new Date() <= quiz.endTime;
  const isUpcoming = new Date() < quiz.startTime;


  const getStatusBadge = () => {
    if (isActive) {
      return <Badge className="bg-green-500">Active</Badge>;
    } else if (isUpcoming) {
      return <Badge variant="secondary">Upcoming</Badge>;
    } else {
      return <Badge variant="destructive">Expired</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-2">{quiz.title}</CardTitle>
            <CardDescription className="line-clamp-1">
              {quiz.course.title}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quiz.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {quiz.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              <span>{quiz.questions.length} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span>{quiz.attempts.length} attempts</span>
            </div>
            {quiz.duration && (
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span>{quiz.duration} min</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {quiz.totalMarks} marks
              </Badge>
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="size-3" />
              <span>Start: {format(quiz.startTime, "MMM dd, yyyy HH:mm")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-3" />
              <span>End: {format(quiz.endTime, "MMM dd, yyyy HH:mm")}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/admin/quizzes/${quiz.id}/edit`}>Edit</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/admin/quizzes/${quiz.id}/results`}>Results</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
