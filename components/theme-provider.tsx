"use client";

import type { ComponentProps } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// next-themes renders an inline <script> that sets the theme class before
// first paint. That script only matters in the server HTML. When React 19
// renders the tree on the client (not-found pages, client navigation) it
// warns "Encountered a script tag while rendering React component", so on
// the client the tag gets a non-executable type, which React ignores.
const scriptProps =
  typeof window === "undefined"
    ? undefined
    : ({ type: "application/json" } as const);

export function ThemeProvider(
  props: ComponentProps<typeof NextThemesProvider>,
) {
  return <NextThemesProvider scriptProps={scriptProps} {...props} />;
}
