import fs from 'fs';
import {vite} from '../main.js';
import path from 'path';
import {fileURLToPath} from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const templateDev = fs.readFileSync(path.resolve(__dirname, './index-dev.html'), 'utf8');
const templateProduction = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

const DEV = process.env.DEV === 'true';
const PRODUCTION = !DEV;

let manifest = {}, renderSvelte;

export async function initSsr () {
	// Get the Svelte SSR function
	// in DEV we get it from the Vite magic
	if (DEV) renderSvelte = (await vite.ssrLoadModule('/src/ssr/render-svelte.js')).renderSvelte;
	// in PRODUCTION we get it from the Vite server build
	if (PRODUCTION) renderSvelte = (await import('../.vite/server/render-svelte.js')).renderSvelte;

	// In production get the json manifests produced by Vite
	// so we know the assets we need for every page
	if (PRODUCTION) {
		manifest.client = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.vite/client/manifest.json')));
		manifest.server = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.vite/server/manifest.json')));
	}
}

export async function renderSsr (sveltePageComponent, pageData) {
	if (DEV) {
		// inject Vite dev features for HMR etc
		let viteHtml = await vite.transformIndexHtml('/', templateDev);

		// render Svelte SSR and inject stuff into the HTML
		let pageHtml = await renderSvelte(viteHtml, sveltePageComponent, pageData);
		pageHtml = addHydrationData(pageHtml, pageData);
		pageHtml = addHydrationScript(pageHtml, sveltePageComponent);
		return pageHtml;
	}

	if (PRODUCTION) {
		// render Svelte SSR and inject stuff into the HTML
		let pageHtml = await renderSvelte(templateProduction, sveltePageComponent, pageData);
		pageHtml = addStyles(pageHtml, sveltePageComponent);
		pageHtml = addHydrationData(pageHtml, pageData);
		pageHtml = addHydrationScript(pageHtml, sveltePageComponent);
		pageHtml = addPrefetchTags(pageHtml);
		return pageHtml;
	}
}

function addHydrationData (html, data) {
	const script = `<script id="hydration-data-json" type="application/json">${JSON.stringify(data || null)}</script>`;
	return html.replace('<!--HYDRATION-DATA-->', script);
}

function addHydrationScript (html, sveltePageComponent) {

	const file = `/hydration-script/${sveltePageComponent}.js`;
	let script;

	if (DEV) {
		// during dev we need to point Vite to the virtual entry files
		// using the fake hydration-script/ path
		// the virtual entry script is generated in the Vite plugin in vite.config.js
		script = `<script type="module" src="${file}"></script>`;
	}

	if (PRODUCTION) {
		// in production we need to get the hydration .js file from the manifest
		script = `<script type="module" src="${manifest.client[file].file}"></script>`;
	}

	return html.replace('<!--HYDRATION-SCRIPT-->', script);
}

function addStyles (html, sveltePageComponent) {
	const file = manifest.client['style.css'].file;
	const tag = `<link rel="stylesheet" href="/${file}" />`;
	return html.replace('<!--CSS-TAGS-->', tag);
}

function addPrefetchTags (html) {
	const keys = Object.keys(manifest.client).filter((key) => key.endsWith('.js'));
	const files = keys.map((key) => {
		return manifest.client[key].file
	});
	const tags = files.map((file) => {
		return `<link rel="prefetch" href="${file}"></link>`
	}).join('');

	return html.replace('<!--PREFETCH-TAGS-->', tags);
}