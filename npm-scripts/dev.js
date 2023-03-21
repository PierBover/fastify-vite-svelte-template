import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import chokidar from 'chokidar';

import {
	generateAllClientEntryScripts,
	generateClientEntryScript
} from './utils.js';

generateAllClientEntryScripts();

const chokidarWatcher = chokidar.watch('src/pages/**/*.svelte', {
	ignored: /(^|[\/\\])\../,
	ignoreInitial: true
});

console.log('Chokidar is watching for changes to /src/pages 👀');

chokidarWatcher
.on('add', (addedPath) => {
	const filename = path.basename(addedPath);
	generateClientEntryScript(filename);
})
.on('unlink', (deletedPath) => {
	const filename = path.basename(deletedPath).replace('.svelte','.js');
	fs.unlinkSync('src/.generated/entry-scripts/' + filename);
	console.log('Deleted ', deletedPath);
})
.on('rename', (renamedPath, other) => {
	const filename = path.basename(renamedPath);
	generateClientEntryScript(filename);
});