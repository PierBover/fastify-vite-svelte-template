import {svelte} from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';
import {globSync} from 'glob';

// this pre-processor adds some stuff to the Island component for hydration

const partialHydrationPreProcess = {
	markup: async ({content, filename}) => {
		if (content.includes('<Island')) {
			// add the name of the component file so that when hydrating we know what class to use
			// componentName="MyComponent"
			content = content.replace(/(<Island.+)component=\{([a-zA-Z]+)\}/gim, '$1component={$2} componentName="$2"');
		}
		return {code: content};
	}
}


// Vite config

export default {
	plugins: [
		svelte({
			preprocess: [partialHydrationPreProcess],
			compilerOptions: {
				hydratable: true
			}
		}),
		generateVirtualEntryPoints()
	],
	build: {
		manifest: true
	}
}

// Vite plugin to generate virtual entry points for hydration

function generateVirtualEntryPoints () {

	let config;

	function generateEntryScript (id) {

		console.log(id);

		const split = id.split('/');
		const filename = split[split.length - 1];
		const componentFile = filename + '.svelte';

		//console.log(componentFile);

		return `
			import IslandComponent from '/src/islands/${componentFile}';

			const islandElements = document.querySelectorAll('.island-boi[data-component-name=${filename}]');

			islandElements.forEach((element) => {
				const componentName = element.getAttribute('data-component-name');
				const data = JSON.parse(element.getAttribute('data-json'));
				const islandId = element.getAttribute('data-island-id');

				console.log('hydrating island:', componentName, islandId);

				new IslandComponent({
					target: element,
					hydrate: true,
					props: data
				});
			});
		`;
	}

	return {
		name: 'test',
		configResolved(resolvedConfig) {
			config = resolvedConfig;

			if (config.command === 'build') {

				// Islands
				// find the .svelte components in src/islands
				const islandsFilenames = globSync('src/islands/*.svelte').map((filePath) => filePath.replace('src/islands/', ''));

				// for every .svelte island component return the path of a virtual entry point
				resolvedConfig.build.rollupOptions.input = islandsFilenames.map((pageFilename) => {
					const jsFilename = pageFilename.replace('.svelte', '');
					return `VIRTUAL_ENTRY/${jsFilename}`;
				});

				// Pages
				// we need to also build the SSR pages so that Vite generates the .css files
				// for the <style> tags in the components
				const pagesFilenames =  globSync('src/ssr-pages/**/*.svelte');
				resolvedConfig.build.rollupOptions.input.push(...pagesFilenames);

				// finally add the index.scss
				resolvedConfig.build.rollupOptions.input.push('src/index.scss');
			}
		},
		load (id) {
			if (id.includes('VIRTUAL_ENTRY')) return generateEntryScript(id);
		},
		resolveId (id) {
			// not sure why but we always need to return an id
			// otherwise Rollup will look for VIRTUAL_ENTRY in the file system
			return id;
		}
	}
}