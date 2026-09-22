/**
 * Assembles Vercel's Build Output API (v3) directory from an already-built,
 * fully prerendered `dist/`, so CI can `vercel deploy --prebuilt` it straight
 * to production without Vercel's own build step ever running (its build
 * image can't run Puppeteer — see scripts/prerender.mjs).
 *
 * The routes below are a hand-translated copy of vercel.json's `rewrites`
 * and `headers`. There is no generic path-to-regexp-to-PCRE converter here
 * on purpose — the pattern set is small and fixed, so a lookup table is
 * more reliable than a general converter. If vercel.json's rewrites/headers
 * change, update the `routes` array below to match.
 */
import { cp, rm, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "dist");
const OUTPUT = join(ROOT, ".vercel", "output");

const SECURITY_HEADERS = {
  "x-frame-options": "DENY",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()",
  "content-security-policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' blob:; connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://api.indexnow.org; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://wa.me; frame-ancestors 'none'; upgrade-insecure-requests",
};

const config = {
  version: 3,
  routes: [
    { src: "^/assets/(.*)$", headers: { "cache-control": "public, max-age=31536000, immutable" }, continue: true },
    { src: "^/(.*)\\.(webp|jpg|jpeg|png|ico|svg|pdf)$", headers: { "cache-control": "public, max-age=2592000" }, continue: true },
    { src: "^/(.*)$", headers: SECURITY_HEADERS, continue: true },
    { handle: "filesystem" },
    { src: "^/blog/[^/]+$", dest: "/index.html" },
    { src: "^/admin(?:/.*)?$", dest: "/index.html" },
    { src: "^/auth(?:/.*)?$", dest: "/index.html" },
    { src: "^/whatsapp-sent$", dest: "/index.html" },
    { src: "^/privacy-dashboard$", dest: "/index.html" },
    { src: "^/(.*)$", dest: "/index.html" },
  ],
};

if (!existsSync(DIST)) {
  console.error(`dist/ not found at ${DIST} — run \`npm run build\` first.`);
  process.exit(1);
}

await rm(OUTPUT, { recursive: true, force: true });
await mkdir(OUTPUT, { recursive: true });
await cp(DIST, join(OUTPUT, "static"), { recursive: true });
await writeFile(join(OUTPUT, "config.json"), JSON.stringify(config, null, 2));

console.log(`Wrote ${join(OUTPUT, "config.json")} and copied dist/ -> ${join(OUTPUT, "static")}`);
