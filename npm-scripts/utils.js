import fs from 'fs';
import rimraf from 'rimraf';

export function generateClientEntryScript (filename) {

	console.log('Generating client entry script for', filename);

	const fileContents = `
		import PageComponent from '../../pages/${filename}';
		// const pageData = JSON.parse(document.getElementById('hydration-data-json').text);

		new PageComponent({
			target: document.getElementById('svelte-app'),
			hydrate: true,
			props: {}
		});
	`;

	const componentName = filename.replace('.svelte', '');

	fs.writeFileSync(`src/.generated/entry-scripts/${componentName}.js`, fileContents, 'utf8');
}

export function generateAllClientEntryScripts () {

	console.log('Generating all client entry scripts...');

	// delete and create the folder again
	if (fs.existsSync('src/.generated/entry-scripts')) rimraf.sync('src/.generated/entry-scripts');
	fs.mkdirSync('src/.generated/entry-scripts');

	// create the entry scripts for all the .svelte files
	const filenames = fs.readdirSync('src/pages').filter((filename) => filename.includes('.svelte'));
	filenames.forEach((filename) => generateClientEntryScript(filename));
}