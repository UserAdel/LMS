"use client";

import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import {
  RenderEmptyState,
  RenderErrorState,
  RenderUploadedState,
  RenderUploadingState,
} from "./RenderState";
import { FileRejection } from "react-dropzone";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useContructUrl } from "@/hooks/use-construct";

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

interface iAppProps {
  value?: string;
  onChange: (value: string) => void;
}

export function Uploader({ value, onChange }: iAppProps) {
  const fileUrl = useContructUrl(value || "");
  const [fileState, setFileState] = React.useState<UploaderState>({
    error: false,
    file: null,
    id: null,
    uploading: false,
    progress: 0,
    isDeleting: false,
    fileType: "image",
    key: value,
    objectURL: fileUrl,
  });

  async function UploadFile(file: File) {
    setFileState((prev) => ({
      ...prev,
      file: file,
      uploading: true,
      progress: 0,
    }));
    try {
      //step 1 get presigned URL
      const presignedResponse = await fetch("/api/s3/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
          isImage: true,
        }),
      });
      if (!presignedResponse.ok) {
        toast.error("Failed to upload file");
        setFileState((prev) => ({
          ...prev,
          uploading: false,
          progress: 0,
          error: true,
        }));
        return;
      }
      const { presignedUrl, key } = await presignedResponse.json();
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const precentageCompleted = (event.loaded / event.total) * 100;
            setFileState((prev) => ({
              ...prev,
              progress: Math.round(precentageCompleted),
            }));
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFileState((prev) => ({
              ...prev,
              progress: 100,
              uploading: false,
              key: key,
            }));
            onChange(key);
            toast.success("File uploaded successfully");

            resolve();
          } else {
            reject(new Error("Failed to upload file"));
          }
        };
        xhr.onerror = () => {
          reject(new Error("Failed to upload file"));
        };
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });
    } catch (error) {
      toast.error("Something went wrong");
      setFileState((prev) => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: true,
      }));
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        if (fileState.objectURL && !fileState.objectURL.startsWith("http")) {
          URL.revokeObjectURL(fileState.objectURL);
        }
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
        UploadFile(file);
      }
      console.log(acceptedFiles);
    },
    [fileState.objectURL]
  );

  async function handleRemoveFile() {
    if (fileState.isDeleting || !fileState.objectURL) return;

    try {
      setFileState((prev) => ({
        ...prev,
        isDeleting: true,
      }));
      const response = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileState.key }),
      });
      if (!response.ok) {
        toast.error("Failed to delete file");
        setFileState((prev) => ({
          ...prev,
          isDeleting: true,
          error: true,
        }));
        return;
      }
      if (fileState.objectURL && !fileState.objectURL.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectURL);
      }
      onChange?.("");
      setFileState((prev) => ({
        ...prev,
        file: null,
        uploading: false,
        progress: 0,
        objectURL: undefined,
        error: false,
        fileType: "image",
        id: null,
        isDeleting: false,
      }));
      toast.success("File Removed successfully");
    } catch (error) {
      toast.error("Failed to delete file");
      setFileState((prev) => ({
        ...prev,
        isDeleting: false,
        error: true,
      }));
    }
  }

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

  function RenderContent() {
    if (fileState.uploading) {
      return (
        <RenderUploadingState
          progress={fileState.progress}
          file={fileState.file as File}
        />
      );
    }
    if (fileState.error) {
      return <RenderErrorState />;
    }
    if (fileState.objectURL) {
      return (
        <RenderUploadedState
          previewUrl={fileState.objectURL}
          handleRemoveFile={handleRemoveFile}
          isDeleting={fileState.isDeleting}
        />
      );
    }
    return <RenderEmptyState isDragActive={isDragActive} />;
  }

  useEffect(() => {
    return () => {
      if (fileState.objectURL && !fileState.objectURL.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectURL);
      }
    };
  }, [fileState.objectURL]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 1024 * 1024 * 5, //5mb calculation
    onDropRejected: rejectedFiles,
    disabled:
      fileState.uploading || fileState.isDeleting || !!fileState.objectURL,
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
        {RenderContent()}
      </CardContent>
    </Card>
  );
}
