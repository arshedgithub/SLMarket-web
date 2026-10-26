// Pure string helper — safe to import from client or server components.
// Inserts a transformation string (e.g. "f_auto,q_auto,w_400") right after
// "/upload/" so delivery is resized/re-encoded by Cloudinary, not re-processed
// again by Next's image optimizer.
export function cldTransform(url: string, transformation: string): string {
  // The host itself must be Cloudinary's, not just appear somewhere in the
  // URL. Relative paths (local images) are left as they are.
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return url;
  }
  if (host !== "res.cloudinary.com") return url;
  return url.replace("/upload/", `/upload/${transformation}/`);
}
