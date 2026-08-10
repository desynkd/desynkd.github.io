// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://desynkd.github.io',
  integrations: [react(), mdx(), sitemap()],
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