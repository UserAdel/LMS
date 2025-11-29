import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "@/lib/S3Client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { env } from "@/lib/env";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string[] }> }
) {
  try {
    // Get authentication session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user is authenticated and is admin
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== "admin") {
      return new NextResponse("Forbidden - Admin access required", { status: 403 });
    }

    const { file } = await params;
    const filePath = file.join("/");

    if (!filePath) {
      return new NextResponse("File path is required", { status: 400 });
    }

    // Get video from Tigris S3
    const command = new GetObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_VIDEOS || env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: filePath,
    });

    const response = await S3.send(command);

    if (!response.Body) {
      return new NextResponse("Video not found", { status: 404 });
    }

    // Convert the stream to a buffer
    const chunks: Uint8Array[] = [];
    const reader = response.Body.transformToWebStream().getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);

    // Set appropriate headers for video streaming
    const responseHeaders = new Headers({
      "Content-Type": response.ContentType || "video/mp4",
      "Content-Length": buffer.length.toString(),
      "Accept-Ranges": "bytes",
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": `inline; filename="${filePath.split("/").pop()}"`,
    });

    // Handle range requests for video seeking
    const range = request.headers.get("range");
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : buffer.length - 1;
      const chunksize = end - start + 1;

      return new NextResponse(buffer.slice(start, end + 1), {
        status: 206,
        headers: {
          ...Object.fromEntries(responseHeaders.entries()),
          "Content-Range": `bytes ${start}-${end}/${buffer.length}`,
          "Content-Length": chunksize.toString(),
        },
      });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error streaming admin video:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
