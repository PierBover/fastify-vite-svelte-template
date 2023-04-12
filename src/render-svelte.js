//import Test from './client/Test.svelte';

export async function renderSvelte (template, filename, isProduction) {

	// SSR with svelte
	const module = await import(`./ssr-pages/${filename}.svelte`);
	const {html, head, css} = module.default.render();
	const styles = `<style>${css.code}</style>`;

	// replace all the placeholders in the template
	let finalHtml = template.replace(`<!--SVELTE-SSR-->`, html)
	.replace(`<!--SVELTE-HEAD-->`, head)
	.replace(`<!--SVELTE-CSS-->`, styles);

	// now we need to generate one virtual entry point
	// for every island component we need to hydrate
	// in this page

	// first:
	// get all the values of the data-component-name attribute in the page
	// to find the component names we will need to hydrate

	const regex = /data-component-name="([a-zA-Z\d]+)"/gm;

	const componentNames = []

	let match;

	while (match = regex.exec(finalHtml)) {
		if(match) componentNames.push(match[1]);
	}

	// second:
	// generate the entry script tags for the islands in this page
	// and replace the placeholder

	if (isProduction) {
		//PROUDCTION
		// we need to point to the real .js files
		const scriptTags = componentNames.map((name) => {
			return `<script type="module" src="/${name}.js"></script>`
		}).join('');

		finalHtml = finalHtml.replace('<!--ISLANDS-CLIENT-ENTRY-POINTS-->', scriptTags);
	} else {
		//DEV
		// we need to point to the virtual entry files
		const scriptTags = componentNames.map((name) => {
			return `<script type="module" src="VIRTUAL_ENTRY/${name}"></script>`
		}).join('');

		finalHtml = finalHtml.replace('<!--ISLANDS-CLIENT-ENTRY-POINTS-->', scriptTags);
	}

	return finalHtml
}