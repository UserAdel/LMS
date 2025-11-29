"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

export default function QuizResultsRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  useEffect(() => {
    fetchLatestAttempt();
  }, [quizId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLatestAttempt = async () => {
    try {
      // Fetch the user's attempts for this quiz
      const response = await fetch(`/api/quizzes/${quizId}/attempts`);

      if (response.ok) {
        const attempts = await response.json();

        if (attempts.length > 0) {
          // Redirect to the latest attempt's results
          const latestAttempt = attempts[0]; // Assuming attempts are sorted by date desc
          router.replace(
            `/dashboard/quizzes/${quizId}/results/${latestAttempt.id}`
          );
        } else {
          toast.error("No quiz attempts found");
          router.push("/dashboard/quizzes");
        }
      } else {
        toast.error("Error fetching quiz attempts");
        router.push("/dashboard/quizzes");
      }
    } catch {
      toast.error("Error loading quiz attempts");
      router.push("/dashboard/quizzes");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    </div>
  );
}
