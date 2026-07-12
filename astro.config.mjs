// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Live on Cloudflare Workers. Swap to a custom domain later if you buy one.
  // Used for canonical URLs, Open Graph, and the sitemap.
  site: 'https://portfolio.mustafaahsan2002.workers.dev',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()]
});