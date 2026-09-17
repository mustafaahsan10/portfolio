// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';
import rehypeMermaid from 'rehype-mermaid';

// https://astro.build/config
export default defineConfig({
  // Live on Cloudflare Workers. Swap to a custom domain later if you buy one.
  // Used for canonical URLs, Open Graph, and the sitemap.
  site: 'https://portfolio.mustafaahsan2002.workers.dev',

  vite: {
    plugins: [tailwindcss()]
  },

  markdown: {
    // Shiki claims every fenced block before rehype plugins run, so ```mermaid
    // has to opt out of highlighting for rehype-mermaid to see it at all.
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    // Only used by `npm run diagrams`, which renders diagrams locally so their
    // SVG can be committed. The deployed build needs no browser: published case
    // studies carry their SVG inline, with the mermaid source in a comment.
    rehypePlugins: [
      [
        rehypeMermaid,
        {
          strategy: 'inline-svg',
          // Load the real font into the headless browser. Without this, boxes
          // are measured in Chromium's fallback font and then displayed in
          // Geist Mono, which is wider — so labels overflow their boxes.
          css: new URL(
            './node_modules/@fontsource-variable/geist-mono/index.css',
            import.meta.url
          ).href,
          mermaidConfig: {
            // 'base' is the only built-in theme that honours themeVariables.
            // These mirror the tokens in src/styles/global.css so diagrams
            // look native rather than pasted in.
            theme: 'base',
            flowchart: { wrappingWidth: 320, padding: 12 },
            themeVariables: {
              background: '#0a0a0b',
              primaryColor: '#0a0a0b',
              primaryTextColor: '#f2f2f2',
              primaryBorderColor: '#3f3f46',
              secondaryColor: '#0a0a0b',
              tertiaryColor: '#0a0a0b',
              lineColor: '#8b8b8b',
              textColor: '#f2f2f2',
              edgeLabelBackground: '#141417',
              fontFamily: '"Geist Mono Variable", ui-monospace, SFMono-Regular, monospace'
            }
          }
        }
      ]
    ]
  },

  integrations: [react()],
  // remoteBindings:false — don't open a remote proxy session at build time.
  // Our static pages don't use the AI binding; it's live only in production
  // for /api/chat. This lets the build run without CLOUDFLARE_API_TOKEN.
  adapter: cloudflare({ remoteBindings: false })
});