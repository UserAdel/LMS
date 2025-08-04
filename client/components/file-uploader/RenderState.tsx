import { CloudUploadIcon, ImageIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import Image from "next/image";

export function RenderEmptyState({ isDragActive }: { isDragActive: boolean }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mx-auto size-12 rounded-full bg-muted">
        <CloudUploadIcon
          className={cn(
            "size-6 text-muted-foreground",
            isDragActive && "text-primary"
          )}
        />
      </div>
      <p className="text-base font-semibold text-foreground">
        Drop your file here or{" "}
        <span className="text-primary font-bold cursor-pointer">
          click to upload
        </span>
      </p>
      <Button className="mt-4" type="button">
        Select File
      </Button>
    </div>
  );
}

export function RenderErrorState() {
  return (
    <div className=" text-center ">
      <div className="text-center">
        <div className="flex items-center justify-center mx-auto size-12 rounded-full bg-destructive/30 mb-4">
          <ImageIcon className={cn("size-6 text-destructive")} />
        </div>
      </div>
      <p className="text-base font-semibold">Upload failed</p>
      <p className="text-xs mt-1 text-muted-foreground ">Somthing went wrong</p>
      <Button className="mt-4 ">Retry File Selection</Button>
    </div>
  );
}

export function RenderUploadedState({ previewUrl }: { previewUrl: string }) {
  return (
    <div>
      <Image
        src={previewUrl}
        alt="Uploaded File"
        fill
        className="object-contain p-2"
      />
      <Button
        variant="destructive"
        size="icon"
        className={cn("absolute top-4 right-4")}
      >
        <XIcon className="size-4" />
      </Button>
    </div>
  );
}
