import type { SpotlightImage } from "./types";

/*
 * One master image (at least 2000px wide) serves every slot size: Cloudinary
 * crops it around the admin's focal point. g_xy_center takes pixel
 * coordinates, hence the stored master size. A crop the admin replaced
 * (cropOverrides) is filled as is. Site paths and other URLs are used
 * uncropped, positioned with CSS object-position.
 */

export const CROPS = {
  grid: { w: 1000, h: 800 }, // 5:4
  wide: { w: 1600, h: 800 }, // 2:1
  list: { w: 1960, h: 392 }, // 5:1
} as const;

export type Crop = keyof typeof CROPS;
export type CropOverrides = Partial<Record<Crop, string>>;

const isCloudinaryId = (id: string) => !/^(https?:)?\//.test(id);

export function cloudinaryUrl(publicId: string, transform: string): string {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloud}/image/upload/${transform}/${publicId}`;
}

export function cropUrl(
  imageId: string,
  crop: Crop,
  focal: { x: number; y: number },
  size: { width: number | null; height: number | null },
): string {
  if (!isCloudinaryId(imageId)) return imageId;
  const { w, h } = CROPS[crop];
  const gravity =
    size.width && size.height
      ? `g_xy_center,x_${Math.round(focal.x * size.width)},y_${Math.round(focal.y * size.height)}`
      : "g_auto";
  return cloudinaryUrl(
    imageId,
    `c_fill,w_${w},h_${h},${gravity},f_auto,q_auto`,
  );
}

export function spotlightImage(
  imageId: string,
  focal: { x: number; y: number },
  size: { width: number | null; height: number | null },
  overrides: CropOverrides = {},
): SpotlightImage {
  const one = (crop: Crop) => {
    const replaced = overrides[crop];
    if (replaced) {
      const { w, h } = CROPS[crop];
      return isCloudinaryId(replaced)
        ? cloudinaryUrl(replaced, `c_fill,w_${w},h_${h},g_auto,f_auto,q_auto`)
        : replaced;
    }
    return cropUrl(imageId, crop, focal, size);
  };
  return {
    grid: one("grid"),
    wide: one("wide"),
    list: one("list"),
    position: `${Math.round(focal.x * 100)}% ${Math.round(focal.y * 100)}%`,
  };
}

// A small square of an image (logos, thumbnails).
export function squareUrl(imageId: string, px: number): string {
  return isCloudinaryId(imageId)
    ? cloudinaryUrl(imageId, `c_fill,w_${px},h_${px},g_auto,f_auto,q_auto`)
    : imageId;
}
