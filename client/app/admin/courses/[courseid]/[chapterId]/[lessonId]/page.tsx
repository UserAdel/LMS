import { adminGetLesson } from "@/app/data/admin/admin-get-lesson";
import LessonForm from "./_componenets/LessonForm";

type Params = Promise<{
  courseid: string;
  chapterId: string;
  lessonId: string;
}>;
export default async function LessonIdPageP({ params }: { params: Params }) {
  const { chapterId, courseid, lessonId } = await params;
  const data = await adminGetLesson(lessonId);
  return <LessonForm data={data} chapterId={chapterId} courseId={courseid} />;
}
