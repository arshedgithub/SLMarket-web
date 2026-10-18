// MapLibre runs its map engine in a web worker, and that worker is a
// separate module file that the app bundler doesn't serve correctly. Copy it
// (and the shared chunk it imports) to public/vendor/maplibre so the map can
// load it with setWorkerUrl(). Runs on install, dev and build.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "node_modules", "maplibre-gl", "dist");
const to = join(root, "public", "vendor", "maplibre");

if (!existsSync(from)) {
  console.warn("[maplibre] node_modules/maplibre-gl not installed yet, skipping worker copy");
  process.exit(0);
}
mkdirSync(to, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(from, file), join(to, file));
}
console.log("[maplibre] worker files copied to public/vendor/maplibre");
