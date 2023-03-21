import fs from 'fs';

export function generateClientEntryScript (filename) {

	console.log('Generating client entry script for', filename);

	const fileContents = `
		import PageComponent from '../${filename}';
		// const pageData = JSON.parse(document.getElementById('hydration-data-json').text);

		new PageComponent({
			target: document.getElementById('svelte-app'),
			hydrate: true,
			props: {}
		});
	`;

	const componentName = filename.replace('.svelte', '');

	fs.writeFileSync(`src/pages/client-entries/${componentName}.js`, fileContents, 'utf8');
}

export function generateAllClientEntryScripts () {

	console.log('Generating all client entry scripts...');

	// create the entry scripts for all the .svelte files
	const filenames = fs.readdirSync('src/pages').filter((filename) => filename.includes('.svelte'));
	filenames.forEach((filename) => generateClientEntryScript(filename));
}