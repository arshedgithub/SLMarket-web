import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadFolder =
  | "listings"
  | "profiles"
  | "banners"
  | "documents"
  | "reels";

export function buildUploadFolder(
  folder: UploadFolder,
  userId: string,
): string {
  return `slmarket/${folder}/${userId}`;
}

// Cloudinary signed uploads: the browser uploads straight to Cloudinary,
// so the server only ever signs the param set, never touches file bytes.
export function signUploadParams(
  params: Record<string, string | number>,
): string {
  return cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!,
  );
}

export async function deleteAsset(
  url: string,
  resourceType: "image" | "video" = "image",
): Promise<void> {
  const publicId = extractPublicId(url);
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

// Cloudinary delivery URLs: https://res.cloudinary.com/{cloud}/image/upload/v169.../slmarket/listings/{userId}/{name}.jpg
// The public_id is everything after the optional version segment, minus the extension.
function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+(?:\?.*)?$/);
  return match ? match[1] : null;
}
