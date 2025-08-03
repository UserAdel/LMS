import { CloudUploadIcon, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

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
