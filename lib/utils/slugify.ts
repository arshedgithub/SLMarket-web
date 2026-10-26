export default function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      // Runs of "-" are single by now, so one at each end is all there is
      // (and /-+$/ would take quadratic time on a long run of dashes).
      .replace(/^-/, "")
      .replace(/-$/, "")
  );
}
