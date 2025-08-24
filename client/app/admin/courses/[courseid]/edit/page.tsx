import { adminGetCourse } from "@/app/data/admin/admin-get-course";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { EditCourseForm } from "./_components/EditCourseForm";
import CourseStructure from "./_components/CourseStructure";

export default async function EditRoute({ params }: any) {
  const isPromise = !!params && typeof (params as any).then === "function";
  console.log(
    "DEBUG ROUTE — raw params type:",
    Object.prototype.toString.call(params)
  );
  console.log("DEBUG ROUTE — params isPromise:", isPromise);

  let resolved: any;
  try {
    resolved = await params;
  } catch (err) {
    console.log("DEBUG ROUTE — await params threw:", err);
    resolved = params;
  }

  try {
    console.log("DEBUG ROUTE — resolved keys:", Object.keys(resolved ?? {}));
  } catch (e) {
    console.log("DEBUG ROUTE — resolved keys error:", e);
  }

  const courseId =
    resolved?.courseId ??
    resolved?.courseid ??
    resolved?.id ??
    (resolved && Object.values(resolved)[0]);

  console.log("DEBUG ROUTE — resolved object:", resolved);
  console.log("DEBUG ROUTE — final courseId:", courseId);

  if (!courseId) {
    return <div>Course Not Found</div>;
  }
  const data = await adminGetCourse(courseId);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Edit Course:
        <span className="text-primary underline ml-2">{data.title}</span>
      </h1>
      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="course-structure">Course Structure</TabsTrigger>
        </TabsList>
        <TabsContent value="basic-info">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide Basic Information About The Course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditCourseForm data={data} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="course-structure">
          <Card>
            <CardHeader>
              <CardTitle>Course Structure</CardTitle>
              <CardDescription>
                Here You Can Update Your Course Structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseStructure data={data} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
