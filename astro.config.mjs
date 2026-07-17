// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

// TODO: swap in the real domain once one is registered.
const SITE_URL = 'https://aleksandarbosnjak.com';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  adapter: netlify(),
  integrations: [sitemap()],
  compressHTML: true,
});
