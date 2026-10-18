import { AdNotFound } from "@/components/not-found/NotFoundViews";

// A notFound() raised inside the /ads pages (unknown category or
// subcategory). The (root) layout already supplies the header and footer.
export default function AdsNotFound() {
  return <AdNotFound />;
}
