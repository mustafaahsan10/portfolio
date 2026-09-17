// Checks that built case study pages actually RENDERED, rather than leaking raw
// Markdown or HTML as literal text. Byte counts and grepping the source are not
// enough: a page can be the right size and contain the right strings while
// showing them to the reader as plain text.
//
// Usage: node scripts/check-pages.mjs [baseUrl]   (omit for the local build)
import { readFileSync, readdirSync } from "node:fs";

const base = process.argv[2];
const slugs = readdirSync("src/content/projects")
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.replace(/\.md$/, ""));

const get = async (slug) =>
  base
    ? await (await fetch(`${base}/projects/${slug}/`)).text()
    : readFileSync(`dist/client/projects/${slug}/index.html`, "utf8");

let failures = 0;
for (const slug of slugs) {
  const html = await get(slug);
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? "";
  // Visible text only: drop the SVG, then tags, then decode entities.
  const visible = main
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");

  const problems = [];
  for (const [label, re] of [
    ["raw HTML tag as text", /<(div|table|svg|dl|tr|td|p)\b/],
    ["markdown heading as text", /(^| )## /],
    ["markdown bold as text", /\*\*/],
    ["code fence as text", /```/],
    ["mermaid source as text", /flowchart (TD|LR)/],
    ["html comment marker", /-->/],
  ]) if (re.test(visible)) problems.push(label);

  const h2 = (main.match(/<h2/g) || []).length;
  const svg = (main.match(/<svg/g) || []).length;
  if (h2 < 2) problems.push(`only ${h2} rendered headings`);

  const status = problems.length ? "FAIL  " + problems.join(", ") : "ok";
  if (problems.length) failures++;
  console.log(
    `  ${slug.padEnd(32)} h2:${String(h2).padEnd(3)} svg:${svg}  ${status}`
  );
}
console.log(failures ? `\n${failures} page(s) FAILED` : "\nAll pages rendered correctly.");
process.exit(failures ? 1 : 0);
