import {svelte} from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';

const partialHydrationPreProcess = {
	markup: async ({content, filename}) => {

		//if (filename.includes('src/islands/')) {
		//	console.log(filename);
		//	console.log(content);
		//}

		if (content.includes('<Island')) {
			//console.log(filename);
			//console.log(content);

			//const matches = content.matchAll(/<Island.+(component=\{([a-zA-Z]+)\})/gim);

			//for (const match of matches) {
			//	console.log('match', match);
			//}

			content = content.replace(/(<Island.+)component=\{([a-zA-Z]+)\}/gim, '$1component={$2} componentName="$2"');

			//console.log(content);
		}

		//console.log(content);

		//const matches = content.matchAll(/<([a-zA-Z]+)\s+interactive:data={(.*)}/gim);

		//for (const match of matches) {
		//	console.log('match', match);
		//	const componentName = match[1];
		//	const dataFunction = match[2];

		//	const replacement = `<div class="needs-hydration" data-component="${componentName}" data-data={JSON.stringify(${dataFunction})}`;
		//	content = content.replace(match[0], replacement);
		//}

		return {code: content};
	}
}

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

function generateVirtualEntryPoints () {

	let config;

	function generateEntryScript (id) {

		//console.log(id);

		const split = id.split('/');
		const filename = split[split.length - 1];
		const componentFile = filename + '.svelte';

		//console.log(componentFile);

		return `
		import PageComponent from '/src/islands/${componentFile}';

		const islandElements = document.querySelectorAll('.island-boi[data-component-name=${filename}]');

		islandElements.forEach((element) => {
			const componentName = element.getAttribute('data-component-name');
			const data = JSON.parse(element.getAttribute('data-json'));
			const islandId = element.getAttribute('data-island-id');

			console.log('hydrating island:', componentName, islandId);

			new PageComponent({
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
				// find the .svelte components in src/pages
				const pagesFilenames = fs.readdirSync('src/pages').filter((filename) => filename.includes('.svelte'));

				// for every .svelte page component return the path of a virtual entry point
				resolvedConfig.build.rollupOptions.input = pagesFilenames.map((pageFilename) => {
					const jsFilename = pageFilename.replace('.svelte', '.js');
					console.log(jsFilename);
					return `VIRTUAL_ENTRY/${jsFilename}`;
				});
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