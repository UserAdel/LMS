"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { RenderEmptyState, RenderErrorState } from "./RenderState";
import { FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface UploaderState {
  id: string | null;
  file: File | null;
  uploading: boolean;
  progress: number;
  key?: string;
  isDeleting: boolean;
  error: boolean;
  objectURL?: string;
  fileType: "image" | "video";
}

export function Uploader() {
  const [fileState, setFileState] = React.useState<UploaderState>({
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: "image",
  });

  function UploadFile(file: File) {
    setFileState((prev) => ({
      ...prev,
      file: file,
      uploading: true,
      progress: 0,
    }));
    try {
    } catch (error) {}
  }
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileState({
        file: file,
        uploading: true,
        progress: 0,
        error: false,
        id: uuidv4(),
        isDeleting: false,
        fileType: "image",
        objectURL: URL.createObjectURL(file),
      });
    }
    console.log(acceptedFiles);
  }, []);

  function rejectedFiles(fileRejections: FileRejection[]) {
    if (fileRejections.length) {
      const tooManyFiles = fileRejections.find(
        (rejection) => rejection.errors[0].code === "too-many-files"
      );
      const tooLargeFiles = fileRejections.find(
        (rejection) => rejection.errors[0].code === "file-too-large"
      );
      // const invalidTypeFiles = fileRejections.find((rejection) =>
      //   rejection.errors[0].code === "file-invalid-type"
      // );

      if (tooManyFiles) {
        toast.error("Too many files selected, max is 1");
      }
      if (tooLargeFiles) {
        toast.error("File too large, max is 5mb");
      }
      // if (invalidTypeFiles) {
      //   toast.error("Invalid file type");
      // }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 1024 * 1024 * 5, //5mb calculation
    onDropRejected: rejectedFiles,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary"
      )}
    >
      <CardContent className="flex items-center justify-center h-full w-full p-4">
        <input {...getInputProps()} />
        <RenderEmptyState isDragActive={isDragActive} />
        {/* <RenderErrorState /> */}
      </CardContent>
    </Card>
  );
}
