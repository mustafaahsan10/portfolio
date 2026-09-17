// Re-inlines build-rendered Mermaid SVGs back into the case study Markdown.
//
// Diagrams are rendered at author time rather than build time, because the
// Cloudflare build image has no Chromium and a failed render silently produced
// pages with no body at all. Run `npm run diagrams` after editing a diagram.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const PROJECTS = "src/content/projects";
let changed = 0;

for (const file of readdirSync(PROJECTS).filter((f) => f.endsWith(".md"))) {
  const slug = file.replace(/\.md$/, "");
  const md = join(PROJECTS, file);
  let source = readFileSync(md, "utf8");
  if (!source.includes("```mermaid")) continue;

  let html;
  try {
    html = readFileSync(`dist/client/projects/${slug}/index.html`, "utf8");
  } catch {
    console.warn(`  skipped ${slug}: no build output, run astro build first`);
    continue;
  }

  const start = html.indexOf("<svg");
  const end = html.indexOf("</svg>", start);
  if (start === -1 || end === -1) {
    console.warn(`  skipped ${slug}: no rendered svg found`);
    continue;
  }
  const svg = html.slice(start, end + "</svg>".length);

  // Replace the previously inlined SVG that follows the diagram comment.
  const next = source.replace(/(-->\n\n)<svg[\s\S]*?<\/svg>/, `$1${svg}`);
  if (next !== source) {
    writeFileSync(md, next);
    console.log(`  updated ${slug} (${svg.length} bytes)`);
    changed++;
  }
}
console.log(changed ? `\n${changed} diagram(s) updated.` : "\nNo diagrams changed.");
