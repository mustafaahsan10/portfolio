import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Treat empty strings ("") as "not set", otherwise require a valid URL.
const optionalUrl = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().url().optional(),
);

// Each project is a markdown file in src/content/projects/.
// Frontmatter is validated against this schema; the body (problem →
// approach → outcome) is rendered on the project detail page.
const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(), // one-liner shown on the card
    tech: z.array(z.string()),
    role: z.string().optional(),
    outcome: z.string().optional(), // headline impact/result
    demoUrl: optionalUrl,
    githubUrl: optionalUrl,
    youtubeId: z.string().optional(), // 11-char YouTube video id for the walkthrough
    featured: z.boolean().default(false),
    order: z.number().default(999), // lower = shown first
  }),
});

export const collections = { projects };
