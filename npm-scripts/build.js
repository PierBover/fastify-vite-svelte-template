import fs from 'fs';
import rimraf from 'rimraf';

// delete and create the folder again
if (fs.existsSync('src/pages/client-entries')) rimraf.sync('src/pages/client-entries');
fs.mkdirSync('src/pages/client-entries');

import {
	generateAllClientEntryScripts
} from './utils.js';

generateAllClientEntryScripts();