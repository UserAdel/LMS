import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3 } from "@/lib/S3Client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { env } from "@/lib/env";

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
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean);

    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Authentication check
    const sessionToken = request.cookies.get('better-auth.session_token')?.value;
    if (!sessionToken) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { file } = await params;
    // Properly decode URL-encoded components and join
    const decodedFile = file.map(segment => decodeURIComponent(segment));
    const filePath = decodedFile.join("/");

    if (!filePath) {
      return new NextResponse("File path is required", { status: 400 });
    }

    // Generate signed URL and redirect
    const command = new GetObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: filePath,
    });

    const signedUrl = await getSignedUrl(S3, command, { 
      expiresIn: 3600 // 1 hour
    });
    
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Error streaming image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
