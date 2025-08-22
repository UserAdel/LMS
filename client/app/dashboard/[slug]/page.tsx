type Params = Promise<{ slug: string }>;
export default async function CourseSlugRoute({ params }: { params: Params }) {
  const { slug } = await params;
  return <h1>hello world {slug}</h1>;
}
