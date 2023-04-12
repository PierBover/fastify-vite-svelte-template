import fs from 'fs';
import {vite} from './server.js';
import path from 'path';
import {fileURLToPath} from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEV = process.env.DEV === 'true';

let manifest;

if (!DEV) manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, './vite/client/manifest.json')));

export async function renderSsr (filename) {
	if (DEV) {
		let template = getPageTemplateDev(filename);
		// inject vite dev features
		template = await vite.transformIndexHtml('/', template);
		// vite magic
		const {renderSvelte} = await vite.ssrLoadModule('/src/render-svelte.js');
		return await renderSvelte(template, filename);
	} else {
		let template = getPageTemplateProd(filename);
		const {renderSvelte} = await import('./vite/server/render-svelte.js');
		return await renderSvelte(template, filename, true);
	}
}

function getPageTemplateDev (filename) {

	filename.replace('.svelte','.js');

	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
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

	const {css, js} = getAssets(filename);

	const cssTags = css.map((path) => `<link rel="stylesheet" href="/${path}" />`).join('');

	// the path of script file must be for the browser!
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<!--SVELTE-HEAD-->
			${cssTags}
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