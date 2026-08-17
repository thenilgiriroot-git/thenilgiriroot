/**
 * legal:check — lists every organisation-specific fact still outstanding in
 * the legal pages.
 *
 * These are facts about the business that cannot be derived from the codebase
 * and must not be guessed: an invented registered name, retention period or
 * grievance officer would be a false statutory declaration, not a placeholder.
 *
 * Run it before any deploy that publishes the legal pages. Exits non-zero
 * while anything is outstanding, so it can gate a release pipeline once the
 * values are filled in.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const TARGETS = [
  { file: "src/data/legalEntity.ts", label: "Legal entity & processing register" },
  { file: "supabase/migrations/20260816090000_dpdp_compliance.sql", label: "Processing activities (DB seed)" },
];

let total = 0;

console.log("");
console.log("  Outstanding legal facts");
console.log("  " + "─".repeat(60));

for (const target of TARGETS) {
  const path = join(ROOT, target.file);
  let src;
  try {
    src = await readFile(path, "utf8");
  } catch {
    console.log(`\n  ${target.label}\n    (file not found: ${target.file})`);
    continue;
  }

  const lines = src.split(/\r?\n/);
  const hits = [];
  lines.forEach((line, i) => {
    // Only count TODOs inside a string literal — the value actually published.
    // The `TodoValue` type declaration (`\`TODO:${string}\``) and prose in
    // comments are machinery, not outstanding facts, and were being reported
    // as work to do.
    const m = line.match(/["'`]TODO:\s*([^"'`]+)["'`]/);
    if (!m) return;
    const text = m[1].trim().replace(/[,;]$/, "");
    if (text === "${string}") return;
    hits.push({ line: i + 1, text });
  });

  console.log(`\n  ${target.label}  ${hits.length === 0 ? "— complete" : `— ${hits.length} outstanding`}`);
  for (const h of hits) {
    console.log(`    ${String(h.line).padStart(4)}  ${h.text}`);
  }
  total += hits.length;
}

console.log("");
console.log("  " + "─".repeat(60));

if (total === 0) {
  console.log("  All facts supplied.");
  console.log("");
  console.log("  This checks completeness, NOT legal accuracy. The drafting still");
  console.log("  requires review by qualified Indian counsel before publication.");
  console.log("");
  process.exit(0);
}

console.log(`  ${total} item(s) must be supplied before the legal pages are published.`);
console.log("");
console.log("  Until then the pages render these as visible red markers, so an");
console.log("  incomplete policy cannot be mistaken for a finished one.");
console.log("");
process.exit(1);
