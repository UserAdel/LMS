import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "@/lib/S3Client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { env } from "@/lib/env";

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "http://localhost:3000",
    "https://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean);

  const corsOrigin = allowedOrigins.includes(origin || "") ? origin : null;

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": corsOrigin || "null",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Authorization, Cookie",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ file: string[] }> }
) {
  try {
    // Get authentication session
    let session;
    try {
      session = await auth.api.getSession({
        headers: await headers(),
      });
    } catch (authError) {
      return new NextResponse("Authentication service unavailable", {
        status: 503,
      });
    }

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { file } = await params;
    const filePath = file.join("/");

    if (!filePath) {
      return new NextResponse("File path is required", { status: 400 });
    }

    const bucket =
      env.NEXT_PUBLIC_S3_BUCKET_NAME_VIDEOS ||
      env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES;

    const possibleKeys = [
      filePath,
      `${filePath}.mp4`,
      filePath.replace(/-$/, ".mp4"),
    ];

    // Use HeadObject for HEAD requests
    const { HeadObjectCommand } = await import("@aws-sdk/client-s3");

    for (const key of possibleKeys) {
      try {
        const headCommand = new HeadObjectCommand({
          Bucket: bucket,
          Key: key,
        });
        const headResponse = await S3.send(headCommand);

        const getContentType = (key: string) => {
          if (key.includes(".webm")) return "video/webm";
          if (key.includes(".ogg")) return "video/ogg";
          if (key.includes(".avi")) return "video/x-msvideo";
          if (key.includes(".mov")) return "video/quicktime";
          return "video/mp4";
        };

        return new NextResponse(null, {
          status: 200,
          headers: {
            "Content-Type": headResponse.ContentType || getContentType(key),
            "Content-Length": (headResponse.ContentLength || 0).toString(),
            "Accept-Ranges": "bytes",
            "Cache-Control": "private, max-age=3600",
            "Cross-Origin-Resource-Policy": "cross-origin",
          },
        });
      } catch (error: any) {
        if (error.name !== "NoSuchKey") {
          throw error;
        }
      }
    }

    return new NextResponse("Video not found", { status: 404 });
  } catch (error) {
    console.error("Error in HEAD request:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string[] }> }
) {
  try {
    // Origin validation
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      "http://localhost:3000",
      "https://localhost:3000",
      "https://lms-azure-tau.vercel.app",
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean);

    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Authentication check
    const sessionToken = request.cookies.get(
      "better-auth.session_token"
    )?.value;
    if (!sessionToken) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { file } = await params;
    
    console.log(`🔍 Raw file array:`, JSON.stringify(file));
    console.log(`🔍 File array length:`, file.length);
    console.log(`🔍 Request URL:`, request.url);
    
    // Properly decode URL-encoded components and join
    const decodedFile = file.map(segment => decodeURIComponent(segment));
    const filePath = decodedFile.join("/");

    const bucket =
      env.NEXT_PUBLIC_S3_BUCKET_NAME_VIDEOS ||
      env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES;

    console.log(`🔍 Decoded file segments:`, decodedFile);
    console.log(`🔍 Final file path: ${filePath}`);
    console.log(`📁 Using bucket: ${bucket}`);

    if (!filePath) {
      return new NextResponse("File path is required", { status: 400 });
    }

    // Try different possible keys and generate signed URL
    const possibleKeys = [
      filePath,
      `${filePath}.mp4`,
      filePath.replace(/-$/, ".mp4"),
    ];

    for (const key of possibleKeys) {
      try {
        // First check if the object exists
        const headCommand = new HeadObjectCommand({
          Bucket: bucket,
          Key: key,
        });
        await S3.send(headCommand);

        // If exists, generate signed URL
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        });

        const signedUrl = await getSignedUrl(S3, command, {
          expiresIn: 3600, // 1 hour
        });

        console.log(`✅ Video found and signed URL generated for: ${key}`);
        return NextResponse.redirect(signedUrl);
      } catch (error: any) {
        if (error.name === "NoSuchKey" || error.name === "NotFound") {
          console.log(`❌ Video not found with key: ${key}`);
          continue;
        }
        console.error(`🚨 Error accessing video ${key}:`, error);
        throw error;
      }
    }

    return new NextResponse("Video not found", { status: 404 });
  } catch (error) {
    console.error("Error streaming video:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
