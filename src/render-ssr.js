import {vite} from './server.js';

export async function renderSsr (filename) {
	let template = getPageTemplateDev(filename);
	// inject vite dev features
	template = await vite.transformIndexHtml('/', template);
	const {renderSvelte} = await vite.ssrLoadModule('/src/render-svelte.js');
	return await renderSvelte(template, filename);
}

function getPageTemplateDev (filename) {

	filename.replace('.svelte','.js');

	// the path of the entry file must be in relation to the Vite root
	return `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<!--SVELTE-CSS-->
			<!--SVELTE-HEAD-->
		</head>
		<body>
			<div id="svelte-app"><!--SVELTE-SSR--></div>
			<script type="module" src="/src/.generated/entry-scripts/${filename}"></script>
		</body>
		</html>
	`;
}