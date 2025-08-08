import { adminGetCourse } from "@/app/data/admin/admin-get-course";

type Params = {
  params: Promise<{ courseid: string }>;
};

export default async function EditRoute({ params }: Params) {
  const { courseid } = await params;
  const data = await adminGetCourse(courseid);
  return (
    <div>
      <h1>
        Edit Course: <span>{data.title}</span>
      </h1>
    </div>
  );
}
