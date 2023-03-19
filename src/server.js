import Fastify from 'fastify';
import {createServer as createViteServer} from 'vite';
import fs from 'fs';
// we need middie to enable middlware support to connect Fastify with Vite
import middie from '@fastify/middie';

const fastify = Fastify({
	logger: true
});

await fastify.register(middie);

const vite = await createViteServer({
	server: {middlewareMode: true},
	appType: 'custom'
});

fastify.use(vite.middlewares);

fastify.get('/', async function (request, reply) {
	const html = await renderVite();
	reply.header('content-type', 'text/html');
	reply.send(html);
});

fastify.listen({ port: 3000 }, function (err, address) {
	if (err) {
		fastify.log.error(err)
		process.exit(1)
	}
});

async function renderVite () {
	let template = fs.readFileSync('src/client/index.html','utf-8');
	template = await vite.transformIndexHtml('/', template);
	const module = await vite.ssrLoadModule('src/client/Test.svelte');
	const {html, head, css} = module.default.render();
	const styles = `<style>${css.code}</style>`
	const finalHtml = template.replace(`<!--SVELTE-SSR-->`, html).replace(`<!--SVELTE-HEAD-->`, head).replace(`<!--SVELTE-CSS-->`, styles);
	return finalHtml;
}