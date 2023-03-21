//import Test from './client/Test.svelte';

export async function renderSvelte (template, filename) {
	const module = await import(`./pages/${filename}.svelte`);
	const {html, head, css} = module.default.render();
	const styles = `<style>${css.code}</style>`
	let finalHtml = template.replace(`<!--SVELTE-SSR-->`, html)
	.replace(`<!--SVELTE-HEAD-->`, head)
	.replace(`<!--SVELTE-CSS-->`, styles);


	return finalHtml
}