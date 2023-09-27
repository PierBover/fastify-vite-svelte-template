import {svelte} from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import {globSync} from 'glob';


// Vite config

export default {
	plugins: [
		svelte({
			//preprocess: [partialHydrationPreProcess],
			compilerOptions: {
				hydratable: true
			}
		}),
		generateWrapper(),
		generateHydrationScripts()
	],
	build: {
		manifest: true,
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true
			}
		}
	},
	resolve: {
		alias: {
			'@pages': fileURLToPath(new URL('./src/pages', import.meta.url))
		}
	}
}

// plugin to generate the virtual hydration scripts
// for the .svelte files in the src/pages directory
// this is triggered by the fake URLs starting with hydration-script:

function generateHydrationScripts () {

	let config;

	function generateScript (id) {

		id = id.replace('hydration-script/', '').replace('.js', '.svelte');

		const importPath = '/src/pages' + id;

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
		load (id) {
			if (id.includes('hydration-script/')) return generateScript(id);
		}
	}
}

// plugin to generate a component wrapper so we can automate
// creating the page data context

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