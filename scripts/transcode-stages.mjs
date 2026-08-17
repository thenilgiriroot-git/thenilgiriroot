/**
 * Transcode the ten manufacturing-stage GIFs to web video + poster frames.
 *
 * The source GIFs total ~44.6 MB, which made /process unusable on mobile.
 * MP4 (H.264) is the universal baseline; WebM (VP9) is smaller where supported.
 * A WebP poster lets the <video> reserve its box and paint something instantly
 * without downloading any video at all until the stage scrolls into view.
 *
 *   node scripts/transcode-stages.mjs
 *
 * Sources live in src/assets/stages/*.gif and are left untouched — they are the
 * masters. Output goes to src/assets/stages/video/.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync, statSync, existsSync } from "node:fs";
import { join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC_DIR = join(ROOT, "src", "assets", "stages");
const OUT_DIR = join(SRC_DIR, "video");

// Even dimensions are required by H.264 (yuv420p chroma subsampling).
// 960px wide covers the largest rendered size (a half-width column on a
// 1920px viewport) at 1x, and 2x on mobile where the column is full width.
const SCALE = "scale=960:-2:flags=lanczos";

if (!existsSync(SRC_DIR)) {
  console.error(`No source directory at ${SRC_DIR}`);
  process.exit(1);
}
mkdirSync(OUT_DIR, { recursive: true });

const gifs = readdirSync(SRC_DIR).filter((f) => extname(f).toLowerCase() === ".gif");
if (gifs.length === 0) {
  console.error("No .gif files found — nothing to transcode.");
  process.exit(1);
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);
const run = (args) => execFileSync(ffmpegPath, args, { stdio: ["ignore", "ignore", "pipe"] });

let srcTotal = 0;
let outTotal = 0;

for (const gif of gifs) {
  const stem = basename(gif, extname(gif));
  const src = join(SRC_DIR, gif);
  const mp4 = join(OUT_DIR, `${stem}.mp4`);
  const webm = join(OUT_DIR, `${stem}.webm`);
  const poster = join(OUT_DIR, `${stem}.webp`);

  const srcSize = statSync(src).size;
  srcTotal += srcSize;

  // H.264 baseline — plays everywhere including older iOS Safari.
  // faststart moves the moov atom to the front so playback can begin
  // before the whole file has arrived.
  run([
    "-y", "-i", src,
    "-movflags", "+faststart",
    "-pix_fmt", "yuv420p",
    "-vf", SCALE,
    "-c:v", "libx264", "-profile:v", "main", "-crf", "28", "-preset", "slow",
    "-an",
    mp4,
  ]);

  // VP9 — roughly 30% smaller than H.264 at equivalent quality.
  run([
    "-y", "-i", src,
    "-vf", SCALE,
    "-c:v", "libvpx-vp9", "-crf", "38", "-b:v", "0", "-row-mt", "1",
    "-an",
    webm,
  ]);

  // Poster: first frame, quality-tuned WebP.
  run([
    "-y", "-i", src,
    "-vf", SCALE,
    "-frames:v", "1",
    "-c:v", "libwebp", "-quality", "72",
    poster,
  ]);

  const outSize = statSync(mp4).size + statSync(webm).size + statSync(poster).size;
  outTotal += outSize;

  const pct = (100 - (statSync(mp4).size / srcSize) * 100).toFixed(1);
  console.log(
    `${stem.padEnd(24)} ${mb(srcSize).padStart(7)} MB gif  ->  ` +
      `${mb(statSync(mp4).size).padStart(6)} MB mp4  ` +
      `${mb(statSync(webm).size).padStart(6)} MB webm  ` +
      `${(statSync(poster).size / 1024).toFixed(0).padStart(4)} KB poster   (-${pct}%)`,
  );
}

console.log("");
console.log(`Source GIFs total:  ${mb(srcTotal)} MB`);
console.log(`Transcoded total:   ${mb(outTotal)} MB  (all three formats)`);
console.log(
  `Delivered per view: browsers fetch ONE video format, so a full scroll of /process ` +
    `now costs well under the ${mb(srcTotal)} MB it used to.`,
);
