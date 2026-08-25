// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import r2Assets from './src/integrations/r2-assets';

// R2 credentials are read via `process.env` by code that runs in Node (the
// content loader and the asset-sync integration), not through `import.meta.env`.
// Hydrate `process.env` from `.env` so local builds work the same way CI does,
// where the values arrive as GitHub Actions secrets.
Object.assign(process.env, loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), ''));

// https://astro.build/config
export default defineConfig({
  site: 'https://desynkd.github.io',
  integrations: [react(), mdx(), sitemap(), r2Assets()],
  markdown: {
    shikiConfig: {
      // Outputs --shiki-* CSS variables instead of baked-in colors, so code
      // blocks can be themed to the monochrome palette (see global.css).
      theme: 'css-variables',
    },
  },
  vite: {
    plugins: [tailwindcss()]
  }
});
