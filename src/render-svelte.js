// find all the .svelte components in ssr-pages
const ssrSvelteModules = import.meta.glob('./ssr-pages/**/*.svelte');

console.log(ssrSvelteModules);

export async function renderSvelte (template, componentFilePath, isProduction) {

	// Get the SSR module
	const key = `./ssr-pages/${componentFilePath}.svelte`;
	const module = await ssrSvelteModules[key]();

	// Render with Svelte
	const {html, head, css} = module.default.render();
	const styles = `<style>${css.code}</style>`;

	// replace all the placeholders in the template
	return template.replace(`<!--SVELTE-SSR-->`, html)
	.replace(`<!--SVELTE-HEAD-->`, head)
	.replace(`<!--SVELTE-CSS-->`, styles);
}