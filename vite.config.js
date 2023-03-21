import {svelte} from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import glob from 'glob';

export default {
	plugins: [
		svelte({
			compilerOptions: {
				hydratable: true
			}
		})
	],
	build: {
		manifest: true,
		rollupOptions: {
			input: glob.sync(path.resolve(__dirname, 'src/pages/client-entries', '*.js'))
		}
	}
}