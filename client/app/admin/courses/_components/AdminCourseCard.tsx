import { Card, CardContent } from "@/components/ui/card";
import { AdminCourseSingularType } from "@/app/data/admin/admin-get-courses";
import Image from "next/image";
import { useContructUrl } from "@/hooks/use-construct";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  MoreVertical,
  PencilIcon,
  School,
  TimerIcon,
  Trash2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
interface iAppProps {
  data: AdminCourseSingularType;
}
export function AdminCourseCard({ data }: iAppProps) {
  const thumbnailUrl = useContructUrl(data.fileKey);
  console.log(thumbnailUrl);
  return (
    <Card className="group relative py-0 gap-0">
      {/* absolute dropdown */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href={`/admin/courses/${data.id}/edit`}>
                <PencilIcon className="size-4 mr-2" />
                Edit Course
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/courses/${data.slug}`}>
                <Eye className="size-4 mr-2" />
                Preview
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/courses/${data.id}/delete`}>
                <Trash2 className="size-4 mr-2 text-destructive" />
                Delete Course
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Image
        src={thumbnailUrl || "/Logo.png"}
        alt={data.title}
        width={600}
        height={400}
        className="w-full rounded-t-lg aspect-video h-full object-cover"
      />

      <CardContent className="p-4">
        <Link
          href={`/admin/courses/${data.id}`}
          className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
        >
          {data.title}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2">
          {data.smallDescription}
        </p>
        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <TimerIcon className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-xm text-muted-foreground">{data.duration}h</p>
          </div>
          <div className="flex items-center gap-x-2">
            <School className="size-6 p-1 rounded-md text-primary bg-primary/10" />
            <p className="text-xm text-muted-foreground">{data.level}</p>
          </div>
        </div>
        <Link
          className={buttonVariants({
            className: "w-full mt-4",
          })}
          href={`/admin/courses/${data.id}/edit`}
        >
          Edit Cource <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export function AdminCourseCardSkeleton() {
  return (
    <Card className="group relative py-0 gap-0">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="size-8 rounded-md" />
      </div>
      <div className="w-full relative h-fit">
        <Skeleton className="w-full rounded-t-lg aspect-video h-[250px] object-cover " />
      </div>
      <CardContent className="p-4">
        <Skeleton className="w-3/4 h-6 mb-2 rounded" />
        <Skeleton className="w-full h-4 mb-2 rounded" />
        <div className="flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="w-10 h-4 rounded" />
          </div>
          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="w-10 h-4 rounded" />
          </div>
        </div>
        <Skeleton className="mt-4 h-10 w-full rounded" />
      </CardContent>
    </Card>
  );
}
