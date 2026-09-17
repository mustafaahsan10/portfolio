// Renders each src/diagrams/<slug>.mmd into the matching case study Markdown as
// inline SVG.
//
// Diagrams are rendered here, at author time, rather than during the deployed
// build. Cloudflare's build image has no Chromium, and a failed render does not
// fail the build: it silently produces pages with no body. Keeping the render
// local means the deploy never needs a browser.
//
// The Markdown holds only the rendered <svg>. The mermaid source lives in
// src/diagrams/, because a fenced block inside an HTML comment does not survive
// the Markdown processor: the blank line ends the comment and the rest of the
// document leaks out as literal text.
//
// Usage: npm run diagrams
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const SVG_RE = /<svg[\s\S]*?<\/svg>/;
const jobs = readdirSync("src/diagrams")
  .filter((f) => f.endsWith(".mmd"))
  .map((f) => f.replace(/\.mmd$/, ""))
  .filter((slug) => existsSync(`src/content/projects/${slug}.md`));

if (!jobs.length) {
  console.log("No diagrams to render.");
  process.exit(0);
}

const originals = new Map();
try {
  // Put the mermaid fences back temporarily so rehype-mermaid can render them.
  for (const slug of jobs) {
    const path = `src/content/projects/${slug}.md`;
    const md = readFileSync(path, "utf8");
    originals.set(path, md);
    const fence = "```mermaid\n" + readFileSync(`src/diagrams/${slug}.mmd`, "utf8").trim() + "\n```";
    if (!SVG_RE.test(md)) throw new Error(`${slug}: no <svg> placeholder to replace`);
    writeFileSync(path, md.replace(SVG_RE, fence));
  }

  console.log("Rendering diagrams in headless Chromium...");
  execFileSync("npx", ["astro", "build"], { stdio: "inherit" });

  for (const slug of jobs) {
    const path = `src/content/projects/${slug}.md`;
    const html = readFileSync(`dist/client/projects/${slug}/index.html`, "utf8");
    const svg = html.match(SVG_RE);
    if (!svg) throw new Error(`${slug}: build produced no SVG, is Chromium installed?`);
    const fenced = readFileSync(path, "utf8");
    writeFileSync(path, fenced.replace(/```mermaid[\s\S]*?```/, svg[0]));
    originals.delete(path);
    console.log(`  ${slug}: ${svg[0].length} bytes inlined`);
  }
} finally {
  // Never leave a Markdown file holding a fence that the deployed build cannot render.
  for (const [path, md] of originals) {
    writeFileSync(path, md);
    console.error(`  restored ${path} after failure`);
  }
}
console.log("\nRebuild to pick the diagrams up: npm run build");
