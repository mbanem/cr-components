import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Pass style options directly to vitePreprocess
  preprocess: vitePreprocess({
    script: true,
    style: {
      css: {
        preprocessorOptions: {
          scss: {
            api: 'modern-compiler' // Enforces Dart Sass modern API
          }
        }
      }
    }
  }),
  kit: {
    adapter: adapter(),
    alias: {
      $lib: './src/lib',
      $styles: './src/styles'
    }
  },
  compilerOptions: {
    runes: true
  }
};

export default config;