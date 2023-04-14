import path from 'path';
import Fastify from 'fastify';
import {createServer as createViteServer} from 'vite';
import {renderSsr} from './render-ssr.js';
import {fileURLToPath} from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEV = process.env.DEV === 'true';

const fastify = Fastify({
	logger: true
});

export let vite;

if (DEV) {
	// DEV
	// we need middie to enable middlware support for Fastify
	// so that we can connect it with Vite during dev
	await fastify.register(import('@fastify/middie'));

	// generate the dev server
	vite = await createViteServer({
		server: {middlewareMode: true},
		appType: 'custom'
	});

	fastify.use(vite.middlewares);
} else {
	// PROD
	// just serve the assets built by Vite
	await fastify.register(import('@fastify/static'), {
		root: path.join(__dirname, 'vite/client/assets'),
		prefix: '/assets/',
	});
}

fastify.get('/', async function (request, reply) {
	const html = await renderSsr('Home');
	reply.header('content-type', 'text/html');
	reply.send(html);
});

fastify.get('/about', async function (request, reply) {
	const html = await renderSsr('nested/About');
	reply.header('content-type', 'text/html');
	reply.send(html);
});

fastify.get('/another', async function (request, reply) {
	const html = await renderSsr('Another');
	reply.header('content-type', 'text/html');
	reply.send(html);
});

fastify.listen({ port: 3000 }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
});