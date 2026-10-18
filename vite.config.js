import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		preprocessorOptions: {
			scss: {
				// Automatically injects mixins & variables into every Svelte component
				additionalData: `@use "$styles/index.scss" as *;`
			}
		}
	}
});