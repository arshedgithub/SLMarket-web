"use client";

/*
 * Photo rules at upload: at least 800 x 600 (smaller looks blurry on a
 * card), and never more than 1600px on the long side (bigger only costs
 * upload time and Cloudinary bandwidth). Resized in the browser.
 */

export const MIN_PHOTO = { long: 800, short: 600 };
export const MAX_PHOTO_EDGE = 1600;

export class PhotoTooSmallError extends Error {}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file is not an image we can read."));
    };
    img.src = url;
  });
}

export async function preparePhoto(file: File): Promise<File> {
  const img = await loadImage(file);
  const { naturalWidth: w, naturalHeight: h } = img;
  URL.revokeObjectURL(img.src);
  if (Math.max(w, h) < MIN_PHOTO.long || Math.min(w, h) < MIN_PHOTO.short) {
    throw new PhotoTooSmallError(`${w} x ${h}`);
  }
  if (Math.max(w, h) <= MAX_PHOTO_EDGE) return file;

  const scale = MAX_PHOTO_EDGE / Math.max(w, h);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const source = await loadImage(file);
  canvas.getContext("2d")!.drawImage(source, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(source.src);
  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, "image/jpeg", 0.86),
  );
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}
