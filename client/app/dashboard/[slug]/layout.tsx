import { getCourseSidebarData } from "@/app/data/course/get-course-sidebar-data";
import { CourseSidebar } from "../_components/CourseSidebar";

interface iAppProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}
export default async function CourseLayout({ children, params }: iAppProps) {
  const { slug } = await params;
  const course = await getCourseSidebarData(slug);

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      {/* siderbar-30% */}
      <div className="order-2 md:order-1 w-full md:w-80 md:border-r border-border shrink-0">
        <CourseSidebar course={course.course} />
      </div>
      {/* main-content-70% */}
      <div className="order-1 md:order-2 w-full md:flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
