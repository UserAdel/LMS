export default function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      {/* siderbar-30% */}
      <div className="w-80 border-r border-border shrink-0 ">
        <h1>SideBar</h1>
      </div>
      {/* main-content-70% */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
