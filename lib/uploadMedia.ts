/*
 * Browser-side signed upload to Cloudinary. The server only signs the
 * request; the file bytes go straight from the browser to Cloudinary.
 * Shared by the ad-posting flow and any other client uploader.
 */

interface SignResponse {
  timestamp?: number;
  signature?: string;
  folder?: string;
  apiKey?: string;
  cloudName?: string;
  message?: string;
}

async function getUploadSignature(
  file: File,
  folder: string,
): Promise<Required<Omit<SignResponse, "message">>> {
  const signRes = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: file.type,
      folder,
      sizeBytes: file.size,
    }),
  });

  let signData: SignResponse = {};
  const ct = signRes.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    signData = await signRes.json();
  }

  if (!signRes.ok) {
    throw new Error(signData.message ?? `Upload failed (${signRes.status})`);
  }

  const {
    timestamp,
    signature,
    folder: cloudFolder,
    apiKey,
    cloudName,
  } = signData;
  if (!timestamp || !signature || !apiKey || !cloudName || !cloudFolder) {
    throw new Error("No upload credentials received from server");
  }

  return { timestamp, signature, folder: cloudFolder, apiKey, cloudName };
}

type CloudinaryUpload = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
};

async function uploadRaw(
  file: File,
  folder: string,
  resourceType: "image" | "video",
): Promise<CloudinaryUpload> {
  const {
    timestamp,
    signature,
    folder: cloudFolder,
    apiKey,
    cloudName,
  } = await getUploadSignature(file, folder);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", cloudFolder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData },
  );

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(
      uploadData.error?.message ?? "Failed to upload file to Cloudinary",
    );
  }

  return uploadData as CloudinaryUpload;
}

async function uploadToCloudinary(
  file: File,
  folder: string,
  resourceType: "image" | "video",
): Promise<string> {
  return (await uploadRaw(file, folder, resourceType)).secure_url;
}

export async function uploadImage(
  file: File,
  folder: "listings" | "documents" = "listings",
): Promise<string> {
  return uploadToCloudinary(file, folder, "image");
}

export async function uploadVideo(
  file: File,
  folder: "reels" = "reels",
): Promise<string> {
  return uploadToCloudinary(file, folder, "video");
}

// Spotlight campaign images (admins): the public id and pixel size, which
// the focal-point crops need.
export async function uploadSpotlightImage(
  file: File,
): Promise<{ publicId: string; width: number; height: number; url: string }> {
  const d = await uploadRaw(file, "spotlight", "image");
  return {
    publicId: d.public_id,
    width: d.width,
    height: d.height,
    url: d.secure_url,
  };
}
