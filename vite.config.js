import {svelte} from '@sveltejs/vite-plugin-svelte'

export default {
	manifest: true,
	plugins: [
		svelte({
			compilerOptions: {
				hydratable: true
			}
		})
	]
}