import { EmptyState } from "@/components/general/EmptyState";
import { getAllCourses } from "../data/course/get-all-courses";
import { getEnrolledCourses } from "../data/user/get-enrolled-courses";
import { PublicCourseCard } from "../(public)/_components/PublicCourseCard";
import Link from "next/link";
import { Key } from "lucide-react";

export default async function DashboardPage() {
  const [courses, enrollendCourses] = await Promise.all([
    getAllCourses(),
    getEnrolledCourses(),
  ]);
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className=" text-3xl font-bold">Enrolled Courses</h1>
        <p className="text-muted-foreground">
          Here you can see all the courses you have access to
        </p>
      </div>
      {enrollendCourses.length === 0 ? (
        <EmptyState
          title={"No coueses purchased"}
          description={"you have not purchased any courses yet"}
          buttonText={"Browse Course"}
          href={"/courses"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {enrollendCourses.map((course) => (
            <Link
              href={`/dashboard/${course.Course.slug}`}
              key={course.Course.id}
            >
              {course.Course.title}
            </Link>
          ))}
        </div>
      )}
      <section className="mt-10">
        <div className="flex flex-col gap-2 mb-5">
          <h1 className=" text-3xl font-bold">Avaliable Courses</h1>
          <p className="text-muted-foreground">
            Here you can see all the courses you can purchase
          </p>
        </div>
        {courses.filter(
          (course) =>
            !enrollendCourses.some(
              (enrolled) => enrolled.Course.id === course.id
            )
        ).length === 0 ? (
          <EmptyState
            title="No Courses available"
            description="you have already purchases all available courses"
            buttonText="Browse courses"
            href="/courses"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {courses
              .filter(
                (course) =>
                  !enrollendCourses.some(
                    (enrolled) => enrolled.Course.id === course.id
                  )
              )
              .map((course) => (
                <PublicCourseCard key={course.id} data={course} />
              ))}
          </div>
        )}
      </section>
    </>
  );
}
