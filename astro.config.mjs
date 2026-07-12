// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Live on Cloudflare Workers. Swap to a custom domain later if you buy one.
  // Used for canonical URLs, Open Graph, and the sitemap.
  site: 'https://portfolio.mustafaahsan2002.workers.dev',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()],
  // remoteBindings:false — don't open a remote proxy session at build time.
  // Our static pages don't use the AI binding; it's live only in production
  // for /api/chat. This lets the build run without CLOUDFLARE_API_TOKEN.
  adapter: cloudflare({ remoteBindings: false })
});