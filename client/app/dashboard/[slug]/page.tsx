import { getCourseSidebarData } from "@/app/data/course/get-course-sidebar-data";
import { redirect } from "next/navigation";

interface iAppProps {
  params: Promise<{ slug: string }>;
}
export default async function CourseSlugRoute({ params }: iAppProps) {
  const { slug } = await params;
  const course = await getCourseSidebarData(slug);

  // Check if course has chapters
  if (!course.course.chapter || course.course.chapter.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold mb-2">No Chapters Available</h2>
        <p className="text-muted-foreground">
          This Course does not have any chapters yet!
        </p>
      </div>
    );
  }

  const firstChapter = course.course.chapter[0];

  // Check if first chapter has lessons
  if (!firstChapter.lesson || firstChapter.lesson.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold mb-2">No Lessons Available</h2>
        <p className="text-muted-foreground">
          This Course does not have any Lessons yet!
        </p>
      </div>
    );
  }

  const firstLesson = firstChapter.lesson[0];
  if (firstLesson) {
    redirect(`/dashboard/${slug}/${firstLesson.id}`);
  }

  return (
    <div className="flex items-center justify-center h-full text-center">
      <h2 className="text-2xl font-bold mb-2">No Lessons Available</h2>
      <p className="text-muted-foreground">
        This Course does not have any Lessons yet!
      </p>
    </div>
  );
}
