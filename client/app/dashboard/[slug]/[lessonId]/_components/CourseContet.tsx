import { getLessonContentType } from "@/app/data/course/get-lesson-content";
import { RenderDescription } from "@/components/rich-text-editor/RenderDescription";
import { Button } from "@/components/ui/button";
import { useContructUrl } from "@/hooks/use-construct";
import { BookIcon, CheckCircle } from "lucide-react";

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
    const videoUrl = useContructUrl(videoKey);
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
          poster={thumbnailUrl}
          controls
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Your Browser does not support the video tag.
        </video>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full bg-background pl-6">
      <VideoPlayer
        thumbnail={data.thumnailKey ?? ""}
        videoKey={data.videoKey ?? ""}
      />
      <div className="py-4 border-b">
        <Button variant="outline">
          <CheckCircle className="size-4 mr-2 text-green-500" />
          Mark As Complete
        </Button>
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
