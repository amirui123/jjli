// @ts-check
import { defineConfig } from 'astro/config';

// Static output, deployed to GitHub Pages at oddurs.github.io/einstein.
// `base` is why every in-page URL must go through `import.meta.env.BASE_URL`
// rather than being written as a root-absolute path.
export default defineConfig({
  site: 'https://oddurs.github.io',
  base: '/einstein',
  output: 'static',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
