import {svelte} from '@sveltejs/vite-plugin-svelte';
import {globSync} from 'glob';

// Vite config

export default {
	plugins: [
		svelte({
			compilerOptions: {
				hydratable: true
			}
		}),
		generateWrapper(),
		generateHydrationScripts(),
		addScss()
	],
	build: {
		cssCodeSplit: false,
		manifest: true,
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true
			}
		}
	}
}

// Plugin to generate the virtual hydration scripts
// for the .svelte files in the src/pages directory.
// During dev, is triggered by the fake URLs starting with hydration-script:
// which are in the SSR'd HTML.
// During build, we add Rollup entry points.

function generateHydrationScripts () {

	function generateScript (id) {

		id = id.replace('hydration-script/', '').replace('.js', '.svelte');

		const importPath = '/src/pages/' + id;

		console.log(importPath);

		return `
			import Page from '${importPath}';
			const pageData = JSON.parse(document.getElementById('hydration-data-json').text);

			const props = {}
			if (pageData) props.pageData = pageData;

			new Page({
				target: document.getElementById('svelte-app'),
				hydrate: true,
				props
			});
		`;
	}

	return {
		name: 'generate-hydration-scripts',
		configResolved(config) {

			if (config.command === 'build') {
				// find the .svelte components src/pages
				const pageComponents = globSync('src/pages/**/*.svelte');

				// for every .svelte page component return the path of a virtual entry point
				config.build.rollupOptions.input = pageComponents.map((filePath) => {
					const jsPath = filePath.replace('.svelte', '.js').replace('src/pages/', '');
					console.log(jsPath);
					return `hydration-script/${jsPath}`;
				});
			}
		},
		load (id) {
			if (id.includes('hydration-script/')) return generateScript(id);
		},
		resolveId (id) {
			// not sure why but we always need to return an id
			// otherwise Rollup will look for hydration-script/ in the file system
			//instead of using the virtual file
			return id;
		}
	}
}

// Plugin to generate component wrappers so we can automate
// creating the page data context.
// We add the ?no_wrap to prevent infinite import recursion

function generateWrapper () {

	function generatePageWrapper (id) {

		return `
			<script>
				import {setContext} from 'svelte';
				import Page from '${id}?no_wrap';
				export let pageData = null;
				if (pageData) setContext('pageData', pageData);
			</script>

			{#if pageData}
				<Page {pageData}/>
			{:else}
				<Page/>
			{/if}
		`;
	}

	return {
		name: 'generate-wrapper',
		load (id) {
			if (id.includes('pages/') && !id.includes('?no_wrap')) {
				return generatePageWrapper(id);
			}
		}
	}
}

// For some reason Rollup ignores index.scss when adding it directly in the config...
// but it works when adding it via a plugin ¯\_(ツ)_/¯

function addScss () {
	return {
		name: 'add-scss',
		configResolved(config) {
			if (config.command === 'build') {
				config.build.rollupOptions.input.push('src/client/index.scss');
			}
		}
	}
}