import { getLessonContent } from "@/app/data/course/get-lesson-content";
import { CourseContent } from "./_components/CourseContet";
type Params = Promise<{ lessonId: string }>;
export default async function LessonPage({ params }: { params: Params }) {
  const { lessonId } = await params;
  const data = await getLessonContent(lessonId);
  return (
    <div>
      <CourseContent data={data} />
    </div>
  );
}
