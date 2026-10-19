import { notFound } from "next/navigation";

// Any address no route matches lands here, so it gets the localized
// SLMarket 404 (app/[locale]/not-found.tsx) instead of the framework's bare
// page. The proxy's own 404 rewrites (/<locale>/not-found-404) come here too.
export default function CatchAll() {
  notFound();
}
