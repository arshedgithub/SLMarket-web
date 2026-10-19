import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildUploadFolder, signUploadParams } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/redis";
import { getReelQuotaStatus } from "@/lib/reelQuota";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const DOCUMENT_TYPES = [...IMAGE_TYPES, "application/pdf", "image/tiff"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;
const SPOTLIGHT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SPOTLIGHT_BYTES = 2 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { allowed: withinRateLimit } = await rateLimit(
    `upload:${session.user.id}`,
    20,
    60,
  );
  if (!withinRateLimit) {
    return NextResponse.json(
      { message: "Too many uploads. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  const { contentType, folder = "listings", sizeBytes } = await req.json();

  // Spotlight campaign images: admins only, JPG, PNG or WebP under 2 MB
  // (the form also checks the master is at least 2000px wide).
  if (folder === "spotlight") {
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }
    if (!SPOTLIGHT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { message: "Use a JPG, PNG or WebP image" },
        { status: 400 },
      );
    }
    if (sizeBytes && sizeBytes > MAX_SPOTLIGHT_BYTES) {
      return NextResponse.json(
        { message: "Images must be under 2 MB" },
        { status: 400 },
      );
    }
  } else if (folder === "reels") {
    const baseContentType =
      typeof contentType === "string" ? contentType.split(";")[0] : "";
    if (!VIDEO_TYPES.includes(baseContentType)) {
      return NextResponse.json(
        { message: "Only MP4, MOV, and WebM videos are allowed" },
        { status: 400 },
      );
    }
    if (sizeBytes && sizeBytes > MAX_VIDEO_SIZE_BYTES) {
      return NextResponse.json(
        { message: "Video exceeds the 50 MB limit" },
        { status: 400 },
      );
    }
    const quota = await getReelQuotaStatus(session.user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          message:
            quota.maxPerMonth === 0
              ? "Upgrade your plan to upload reels"
              : "You've used this month's reel upload allowance",
        },
        { status: 403 },
      );
    }
  } else {
    const allowed = folder === "documents" ? DOCUMENT_TYPES : IMAGE_TYPES;
    if (!allowed.includes(contentType)) {
      return NextResponse.json(
        {
          message:
            folder === "documents"
              ? "Only JPEG, PNG, WebP, AVIF, TIFF, and PDF files are allowed"
              : "Only JPEG, PNG, WebP, and AVIF images are allowed",
        },
        { status: 400 },
      );
    }

    if (sizeBytes && sizeBytes > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { message: "File exceeds the 10 MB limit" },
        { status: 400 },
      );
    }
  }

  // Only sign the params the client actually sends back — Cloudinary requires
  // every non-file param in the signature, in this exact set.
  const timestamp = Math.round(Date.now() / 1000);
  const uploadFolder = buildUploadFolder(folder, session.user.id);
  const signature = signUploadParams({ timestamp, folder: uploadFolder });

  return NextResponse.json({
    timestamp,
    signature,
    folder: uploadFolder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
