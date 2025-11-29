"use client";
import { getLessonContentType } from "@/app/data/course/get-lesson-content";
import { RenderDescription } from "@/components/rich-text-editor/RenderDescription";
import { Button } from "@/components/ui/button";
import { tryCatch } from "@/hooks/try-catch";
import { useConfetti } from "@/hooks/use-confetti";
import { useContructUrl } from "@/hooks/use-construct";
import { BookIcon, CheckCircle } from "lucide-react";
import { useTransition } from "react";

import { toast } from "sonner";
import { MarkLessonAsComplete } from "../actions";

interface iAppProps {
  data: getLessonContentType;
}
export function CourseContent({ data }: iAppProps) {
  function VideoPlayer({
    thumbnail,
    videoKey,
  }: {
    thumbnail: string;
    videoKey: string;
  }) {
    const videoUrl = useContructUrl(videoKey, true); // Explicitly mark as video
    const thumbnailUrl = useContructUrl(thumbnail);
    if (!videoKey)
      return (
        <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center">
          <BookIcon className="size-16 mx-auto mb-4 text-primary" />
          <p>This Lesson does not have a video yet</p>
        </div>
      );
    return (
      <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
        <video
          className="w-full  h-full object-cover "
          poster={thumbnailUrl ?? undefined}
          controls
          controlsList="nodownload"
          crossOrigin="anonymous"
          preload="metadata"
        >
          <source src={videoUrl || ""} type="video/mp4" />
          Your Browser does not support the video tag.
        </video>
      </div>
    );
  }

  const { triggerConfetti } = useConfetti();
  const [Pending, startTransition] = useTransition();
  const onSubmit = async () => {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        MarkLessonAsComplete(data.id, data.Chapter.Course.slug)
      );

      if (error) {
        toast.error("An Unexpected error occurred. Please try again");
      }
      if (result?.status === "success") {
        toast.success(result.message);
        triggerConfetti();
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  };
  return (
    <div className="flex flex-col h-full bg-background pl-0 md:pl-6">
      <VideoPlayer
        thumbnail={data.thumnailKey ?? ""}
        videoKey={data.videoKey ?? ""}
      />
      <div className="py-4 border-b">
        {data.lessonProgess.length > 0 ? (
          <Button
            variant="outline"
            className="bg-green-500/10 text-green-500 hover:text-green-600"
          >
            <CheckCircle className="size-4 mr-2 text-green-500 " />
            Completed
          </Button>
        ) : (
          <Button variant="outline" onClick={onSubmit} disabled={Pending}>
            <CheckCircle className="size-4 mr-2 text-green-500" />
            Mark As Complete
          </Button>
        )}
      </div>
      <div className="space-y-3 pt-3">
        <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
        <p>
          {data.description && (
            <RenderDescription json={JSON.parse(data.description)} />
          )}
        </p>
      </div>
    </div>
  );
}
