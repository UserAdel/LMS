import { env } from "@/lib/env";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { S3 } from "@/lib/S3Client";

export async function DELETE(Request: Request) {
  try {
    const body = await Request.json();
    const { key } = body;
    if (!key) {
      return NextResponse.json(
        { error: "Missing or Invalid object key" },
        { status: 400 }
      );
    }
    const command = new DeleteObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
    });
    await S3.send(command);
    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
