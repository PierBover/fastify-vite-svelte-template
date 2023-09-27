import path from 'path';
import Fastify from 'fastify';
import {createServer as createViteServer} from 'vite';
import {initSsr, renderSsr} from './ssr/render-ssr.js';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEV = process.env.DEV === 'true';

const fastify = Fastify({
	logger: true
});

// VITE and SSR stuff

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
		root: path.join(__dirname, '.vite/client/assets'),
		prefix: '/assets/',
	});
}

await initSsr();

fastify.decorateReply('renderPage', async function (page, data = null) {
	const html = await renderSsr(page, data);
	this.header('content-type', 'text/html');
	this.send(html);
});

// ROUTES

fastify.get('/', async function (request, reply) {
	await reply.renderPage('Home', {
		message: 'Hello world'
	});
});

fastify.get('/about', async function (request, reply) {
	await reply.renderPage('deep/nested/About');
});

fastify.get('/another', async function (request, reply) {
	await reply.renderPage('Another');
});

fastify.listen({ port: 3000 }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
});

// SHUTDOWN

async function closeGracefully () {
	// close the Vite server during DEV
	if (vite) await vite.close();
	await app.close();
	// close db client and other stuff
}

process.once('SIGTERM', closeGracefully);