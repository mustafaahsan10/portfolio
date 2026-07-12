// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // TODO: update to your final domain once chosen (e.g. https://mustafa-ahsan.pages.dev
  // or a custom domain). Used for canonical URLs, Open Graph, and the sitemap.
  site: 'https://mustafa-ahsan.pages.dev',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()],
  adapter: cloudflare()
});