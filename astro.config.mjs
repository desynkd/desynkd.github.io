// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://desynkd.github.io',
  vite: {
    plugins: [tailwindcss()]
  }
});