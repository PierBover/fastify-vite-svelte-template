import Fastify from 'fastify';
import {createServer as createViteServer} from 'vite';
// we need middie to enable middlware support and connect Fastify with Vite during dev
import middie from '@fastify/middie';
import {renderSsr} from './render-ssr.js';

const fastify = Fastify({
	logger: true
});

await fastify.register(middie);

export const vite = await createViteServer({
	server: {middlewareMode: true},
	appType: 'custom'
});

fastify.use(vite.middlewares);

fastify.get('/', async function (request, reply) {
	const html = await renderSsr('Home');
	reply.header('content-type', 'text/html');
	reply.send(html);
});

fastify.get('/about', async function (request, reply) {
	const html = await renderSsr('About');
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