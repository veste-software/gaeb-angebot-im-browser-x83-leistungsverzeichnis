import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Previews live under https://<owner>.github.io/<repo>/, so the workflow sets SITE_URL and
// SITE_BASE. A local build has neither: base is "/" and no sitemap is written (it needs a site).
const site = process.env.SITE_URL || undefined;
const base = process.env.SITE_BASE || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [preact(), ...(site ? [sitemap()] : [])],
  vite: {
    plugins: [tailwindcss()],
  },
});
