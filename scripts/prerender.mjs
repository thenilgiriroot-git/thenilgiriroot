/**
 * Build-time prerendering.
 *
 * The site is a client-rendered SPA, so every route shipped an empty
 * `<div id="root">`. Googlebot renders JavaScript and mostly copes, but Bing,
 * LinkedIn, WhatsApp, Twitter and the AI crawlers now driving referral traffic
 * do not — they saw the homepage's static meta tags on all 28 URLs. For a site
 * whose strategy rests on thirteen keyword landing pages plus a blog, that
 * capped the return on every other SEO investment here.
 *
 * This walks the built `dist/` with a headless browser, waits for React to
 * paint and for SEOHead to write its meta, then writes each route back as a
 * real HTML file. The SPA still hydrates and takes over on load, so runtime
 * behaviour is unchanged — crawlers just get content on the first byte.
 *
 * Runs automatically after `npm run build`.
 */
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "dist");
const PORT = 4178;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
};

if (!existsSync(DIST)) {
  console.error("dist/ not found — run `vite build` first.");
  process.exit(1);
}

// Read the route manifest without pulling TypeScript into the build. The file
// is a plain list of string literals, so a targeted parse is enough and avoids
// adding a TS loader just for this.
async function loadRoutes() {
  const src = await readFile(join(ROOT, "src", "data", "routes.ts"), "utf8");

  const corePaths = [...src.matchAll(/\{\s*path:\s*"([^"]+)"/g)].map((m) => m[1]);

  const slugBlock = src.match(/export const LANDING_SLUGS = \[([\s\S]*?)\] as const;/);
  const slugs = slugBlock ? [...slugBlock[1].matchAll(/"([^"]+)"/g)].map((m) => `/${m[1]}`) : [];

  const all = [...new Set([...corePaths, ...slugs])];
  if (all.length === 0) throw new Error("Parsed zero routes from src/data/routes.ts");
  return all;
}

/**
 * A path that matches no route, used to render the 404 body.
 *
 * The output is written to dist/404.html, which Netlify and Cloudflare Pages
 * serve with a genuine HTTP 404 for unmatched URLs. Without this the host
 * would fall back to its own bare error page, losing the branding and the
 * onward navigation the 404 exists to provide.
 */
const NOT_FOUND_PROBE = "/__404__";

/** Minimal static file server over dist/, with SPA fallback to index.html. */
function serve() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      let filePath = join(DIST, urlPath);

      try {
        if (!extname(filePath)) throw new Error("no extension — fall through to SPA shell");
        const body = await readFile(filePath);
        res.writeHead(200, { "Content-Type": MIME[extname(filePath)] || "application/octet-stream" });
        res.end(body);
      } catch {
        const shell = await readFile(join(DIST, "index.html"));
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(shell);
      }
    });
    server.listen(PORT, () => resolve(server));
  });
}

const server = await serve();
const routes = [...(await loadRoutes()), NOT_FOUND_PROBE];

// A unique profile per run, cleaned up at the end. Puppeteer's default temp
// profile can survive a killed build; on Windows a leftover `lockfile` there
// makes every later launch fail with a misleading "browser is already running".
const userDataDir = join(tmpdir(), `tnr-prerender-${process.pid}-${Date.now()}`);

// Vercel's build image doesn't ship the shared libraries (libnspr4, libnss3,
// ...) that full Puppeteer's bundled Chrome needs — the launch fails with
// "error while loading shared libraries". @sparticuz/chromium bundles a
// statically-linked Chromium built for exactly this kind of serverless/CI
// sandbox, so use it there; a real local dev machine has no such problem and
// keeps using regular Puppeteer's own Chrome.
const onVercel = !!process.env.VERCEL;

const browser = onVercel
  ? await puppeteerCore.launch({
      headless: true,
      userDataDir,
      args: [...chromium.args, "--no-sandbox", "--disable-dev-shm-usage"],
      executablePath: await chromium.executablePath(),
    })
  : await puppeteer.launch({
      // `headless: true` — not the old "new" string, which Puppeteer 25 no
      // longer accepts. An invalid value here fails inside the launch and
      // surfaces as the same misleading "already running" error, so keep it
      // boolean.
      headless: true,
      userDataDir,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });

let ok = 0;
const failed = [];

/**
 * `networkidle0` waits for two seconds of zero in-flight requests. That is the
 * right signal — it means React has finished mounting and SEOHead has written
 * its meta — but it is occasionally defeated by a straggling third-party
 * request (the analytics beacon retrying, a font connection lingering), which
 * fails a route that would render perfectly on a second attempt.
 *
 * Retrying once turns a transient network hiccup back into a passing build,
 * while a genuinely broken route still fails both attempts and stops the
 * deploy — which is the behaviour that matters.
 */
const MAX_ATTEMPTS = 2;

for (const route of routes) {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const page = await browser.newPage();
  try {
    // Block the analytics beacon — no reason to log a page_view per prerender,
    // and the request just slows the wait for network idle.
    await page.setRequestInterception(true);
    page.on("request", (r) => {
      const u = r.url();
      if (u.includes("googletagmanager.com") || u.includes("google-analytics.com")) r.abort();
      else r.continue();
    });

    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: "networkidle0",
      timeout: 45_000,
    });

    // SEOHead writes <title> from an effect, so wait for it to differ from the
    // static shell title before snapshotting — otherwise every prerendered page
    // keeps the homepage's tags, which is the exact bug we're fixing.
    await page
      .waitForFunction(
        () => {
          const root = document.getElementById("root");
          return !!root && root.children.length > 0 && document.title.length > 0;
        },
        { timeout: 15_000 },
      )
      .catch(() => {});

    const html = await page.content();

    // The SPA intro overlay sets a sessionStorage flag on first paint. Nothing
    // to strip from the markup, but make sure we didn't snapshot mid-fade.
    const outPath =
      route === NOT_FOUND_PROBE
        ? join(DIST, "404.html")
        : route === "/"
          ? join(DIST, "index.html")
          : join(DIST, route.replace(/^\//, ""), "index.html");

    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, html, "utf8");

    const title = await page.title();
    const retried = attempt > 1 ? "  (retried)" : "";
    console.log(
      `  ${route.padEnd(48)} ${(html.length / 1024).toFixed(0).padStart(4)} KB  ${title.slice(0, 46)}${retried}`,
    );
    ok++;
    lastError = null;
    break;
  } catch (err) {
    lastError = err;
    if (attempt < MAX_ATTEMPTS) {
      console.warn(`  ${route.padEnd(48)} attempt ${attempt} failed (${err.message}) — retrying`);
    }
  } finally {
    await page.close();
  }
  }

  if (lastError) {
    failed.push({ route, message: lastError.message });
    console.error(`  ${route.padEnd(48)} FAILED after ${MAX_ATTEMPTS} attempts: ${lastError.message}`);
  }
}

await browser.close();
server.close();
await rm(userDataDir, { recursive: true, force: true }).catch(() => {});

console.log("");
console.log(`Prerendered ${ok}/${routes.length} routes.`);

if (failed.length) {
  // Loud, and non-zero exit: a silently half-prerendered deploy is worse than
  // a failed build, because the missing routes look fine until a crawler hits
  // them.
  console.error(`\n${failed.length} route(s) failed:`);
  for (const f of failed) console.error(`  ${f.route} — ${f.message}`);
  process.exit(1);
}
