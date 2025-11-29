import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PublicCoursesType } from "@/app/data/course/get-all-courses";
import Image from "next/image";
import { useContructUrl } from "@/hooks/use-construct";
import Link from "next/link";
import { School, TimerIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
interface iAppProps {
  data: PublicCoursesType;
}

export function PublicCourseCard({ data }: iAppProps) {
  const thumbnailUrl = useContructUrl(data.fileKey);
  return (
    <Card className="group relative py-0 gap-0">
      <Badge className="absolute top-2 right-2 z-10">{data.level}</Badge>

      <Image
        src={thumbnailUrl || "/Logo.png"}
        alt={data.title}
        className="w-full rounded-t-xl aspect-video h-full object-cover"
        width={600}
        height={400}
      />
      <CardContent className="p-4">
        <Link
          className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
          href={`/courses/${data.slug}`}
        >
          {data.title}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2">
          {data.smallDescription}
        </p>
        <div className="flex mt-4 items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <TimerIcon className="size-6 p-1 rounded-md text-primary bg-primary/10 " />
            <p className="text-sm text-muted-foreground">{data.duration}h</p>
          </div>
          <div className="flex items-center gap-x-2">
            <School className="size-6 p-1 rounded-md text-primary bg-primary/10 " />
            <p className="text-sm text-muted-foreground">{data.category}</p>
          </div>
        </div>
        <Link
          className={buttonVariants({
            className: "w-full mt-4",
          })}
          href={`/courses/${data.slug}`}
        >
          Learn More
        </Link>
      </CardContent>
    </Card>
  );
}

export function PublicCourseCardSkeleton() {
  return (
    <Card className="group relative py-0 gap-0">
      <div className="absolute top-2 right-2 z-10 flex items-center">
        <Skeleton className=" h-6 w-20 rounded-full" />
      </div>
      <div className="w-full relative h-fit ">
        <Skeleton className="w-full rounded-t-xl aspect-video" />
      </div>
      <CardContent className="p-4 ">
        <div className="space-y-2 ">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="mt-4 flex items-center gap-x-5">
          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="flex items-center gap-x-2">
            <Skeleton className="size-6 rounded-md" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
        <Skeleton className="mt-4 w-full h-10 rounded-md" />
      </CardContent>
    </Card>
  );
}
