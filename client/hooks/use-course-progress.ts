"use client";
import { getCourseSidebarDataType } from "@/app/data/course/get-course-sidebar-data";
import { useMemo } from "react";

interface iAppProps {
  courseData: getCourseSidebarDataType["course"];
}
interface CourseProgressResult {
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}
export function useCourseProgress({
  courseData,
}: iAppProps): CourseProgressResult {
  return useMemo(() => {
    let totalLessons = 0;
    let completedLessons = 0;
    courseData.chapter.forEach((chapter) => {
      chapter.lesson.forEach((lesson) => {
        totalLessons++;
        const isCompleted = lesson.lessonProgess.some(
          (progress) => progress.lessonId === lesson.id && progress.completed
        );
        if (isCompleted) {
          completedLessons++;
        }
      });
    });
    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
    return { totalLessons, completedLessons, progressPercentage };
  }, [courseData]);
}
