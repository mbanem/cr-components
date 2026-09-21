// import { sveltekit } from '@sveltejs/kit/vite';
// import { defineConfig } from 'vite';
// import path from 'path';

// export default defineConfig({
// 	plugins: [sveltekit()],
// 	css: {
// 		preprocessorOptions: {
// 			scss: {
// 				// Option A: Map alias directly or allow loadPaths to resolve 'src/styles'
// 				// loadPaths: [path.resolve(__dirname, 'src/styles')],
// 				loadPaths: [path.resolve(import.meta.dirname, 'src/styles')],
// 				// Use relative-style import resolved via loadPaths:
// 				additionalData: `@use "variables.scss" as *;`
// 			}
// 		}
// 	}
// });
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	plugins: [sveltekit()],
	css: {
		preprocessorOptions: {
			scss: {
				// Safely resolve the absolute path to your styles folder
				loadPaths: [path.resolve(__dirname, './src/styles')],
				additionalData: `@use "variables.scss" as *;`
			}
		}
	}
});
