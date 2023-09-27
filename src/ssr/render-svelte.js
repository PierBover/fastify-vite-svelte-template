// Vite magic
// find all the .svelte components in the pages directory
// and process them so they can be used in Node
const ssrSvelteModules = import.meta.glob('../pages/**/*.svelte');

//console.log(ssrSvelteModules);

export async function renderSvelte (template, componentFilePath, pageData) {

	// Get the SSR module from the glob import above
	const key = `../pages/${componentFilePath}.svelte`;
	const module = await ssrSvelteModules[key]();

	// Render with Svelte
	const {html, head, css} = module.default.render({
		pageData
	});

	const styles = `<style>${css.code}</style>`;

	// replace all the placeholders in the template
	return template.replace(`<!--SVELTE-SSR-->`, html)
	.replace(`<!--SVELTE-HEAD-->`, head)
	.replace(`<!--SVELTE-CSS-->`, styles);
}