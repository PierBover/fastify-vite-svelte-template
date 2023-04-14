import fs from 'fs';
import {vite} from './server.js';
import path from 'path';
import {fileURLToPath} from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEV = process.env.DEV === 'true';
const PRODUCTION = !DEV;

let manifest;

// in production get the json manifest produced by Vite
// so we know the assets we need for every page
if (PRODUCTION) manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, './vite/client/manifest.json')));

export async function renderSsr (filename) {
	if (DEV) {
		let template = getPageTemplateDev(filename);
		// inject vite dev features
		template = await vite.transformIndexHtml('/', template);
		// vite magic
		const {renderSvelte} = await vite.ssrLoadModule('/src/render-svelte.js');
		const html = await renderSvelte(template, filename);
		return addIslandEntryScripts(html);
	} else {
		let template = getPageTemplateProd(filename);
		const {renderSvelte} = await import('./vite/server/render-svelte.js');
		const html = await renderSvelte(template, filename);
		return addIslandEntryScripts(html);
	}
}

function getPageTemplateDev () {
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<link rel="stylesheet" href="src/index.scss">
			<!--SVELTE-CSS-->
			<!--SVELTE-HEAD-->
		</head>
		<body>
			<div id="svelte-app"><!--SVELTE-SSR--></div>
			<!--ISLANDS-CLIENT-ENTRY-POINTS-->
		</body>
		</html>
	`;
}

function getPageTemplateProd (filename) {

	const cssFiles = getPageCssFilesFromManifest(filename);

	const cssTags = cssFiles.map((filePath) => `<link rel="stylesheet" href="/${filePath}" />`).join('');

	// the path of script file must be for the browser!
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<!--SVELTE-HEAD-->
			${cssTags}
			<!--ISLANDS-CSS-->
		</head>
		<body>
			<div id="svelte-app"><!--SVELTE-SSR--></div>
			<!--ISLANDS-CLIENT-ENTRY-POINTS-->
		</body>
		</html>
	`;
}

function getAssets (filename) {
	const [assetKey] = Object.keys(manifest).filter((key) => key.includes(`${filename}.js`));
	const asset = manifest[assetKey];

	return {
		js: asset.file,
		css: asset.css
	}
}

function addIslandEntryScripts (html) {

	// first:
	// get all the values of the data-component-name attribute in the page
	// to find the component names we will need to hydrate

	const regex = /data-component-name="([a-zA-Z\d]+)"/gm;

	const islandsComponentNames = []

	let match;

	while (match = regex.exec(html)) {
		if(match) islandsComponentNames.push(match[1]);
	}

	// second:
	// generate one entry script tags for every island in this page
	// and replace the placeholder <!--ISLANDS-CLIENT-ENTRY-POINTS-->

	if (DEV) {
		// during dev we need to point Vite to the virtual entry files
		// using the fake VIRTUAL_ENTRY/ path
		// the virtual entry script is generated in the Vite plugin in vite.config.js
		const islandScripTags = islandsComponentNames.map((name) => {
			return `<script type="module" src="VIRTUAL_ENTRY/${name}"></script>`
		}).join('');

		return html.replace('<!--ISLANDS-CLIENT-ENTRY-POINTS-->', islandScripTags);
	} else {
		// in production we need to point to the real .js files generated by Vite

		// for every island we've found in the HTML
		// get the assets

		const scriptTags = [];
		const styleTags = [];

		islandsComponentNames.forEach((componentName) => {
			const assets = getIslandAssetsFromManifest(componentName);

			if (assets.js) scriptTags.push(`<script async type="module" src="/${assets.js}"></script>`);

			if (assets.css) {
				const tags = assets.css.map((cssPath) => `<link rel="stylesheet" href="/${cssPath}" />`);
				styleTags.push(...tags);
			}
		});

		 html = html.replace('<!--ISLANDS-CLIENT-ENTRY-POINTS-->', scriptTags.join(''));
		 html = html.replace('<!--ISLANDS-CSS-->', styleTags.join(''));

		 return html;
	}
}

function getIslandAssetsFromManifest (islandComponentName) {
	const key = Object.keys(manifest).filter((key) => key === `VIRTUAL_ENTRY/${islandComponentName}`);
	const entry = manifest[key];

	const assets = {
		js: entry.file
	};

	if (entry.css) assets.css = entry.css;

	return assets;
}

function getPageCssFilesFromManifest (pageComponentPath) {
	const cssFiles = [manifest['src/index.scss'].file];
	const key = Object.keys(manifest).filter((key) => key === `src/ssr-pages/${pageComponentPath}.css`);
	if (key) cssFiles.push(manifest[key].file);
	return cssFiles;
}