# Portfolio

Personal engineering portfolio for Mustafa Ahsan. Static Astro site on Cloudflare
Workers, with one server-rendered route for the "Ask my portfolio" assistant.

## Running it

```sh
npm install
npx playwright install chromium   # needed once, to render diagrams at build time
npm run dev                       # http://localhost:4321
npm run build
```

`astro dev --background` runs the dev server detached; manage it with
`astro dev stop`, `astro dev status` and `astro dev logs`.

## How it fits together

- **Content lives in two places.** `src/config.ts` holds identity, nav, skills and
  socials. Each project is a Markdown file in `src/content/projects/`, validated
  against the schema in `src/content.config.ts`.
- **Everything is prerendered** except `src/pages/api/chat.ts`, which runs on the
  Cloudflare Workers AI binding declared in `wrangler.jsonc`.
- **Three React islands**: the assistant, the contact form and the command
  palette. Everything else is `.astro` and ships no JavaScript.
- **Architecture diagrams** are ```mermaid fences in the case studies, rendered to
  inline SVG at build time by `rehype-mermaid`, so no mermaid runtime reaches the
  browser. This is why the build needs Chromium. If it is missing, diagrams fall
  back to their source block rather than failing the build.
- **The assistant's knowledge base** is `src/data/assistant.ts`. It runs
  server-side only and must be kept in step with the project Markdown.

## Writing a case study

`docs/case-study-prompt.md` is a prompt to run inside a project repo. It
investigates the codebase, pauses for corrections, then writes a `CASE-STUDY.md`
matching the content schema, including an architecture diagram. It also encodes
the house rules: project altitude rather than bug post-mortems, first person, no
dashes, sections that open on what was built and end on what it achieved.

`docs/effort-audit-prompt.md` ranks a repo's subsystems by git history and churn,
for reconstructing a project you no longer remember in detail.

## Deploying

Cloudflare Workers Builds runs `npm run build`, which installs Chromium before
building. The adapter emits the resolved deploy config into `dist/`, so
`npx wrangler deploy` needs no dashboard changes.
