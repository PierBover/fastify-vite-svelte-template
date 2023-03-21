# Fastify + Vite + Svelte doing SSR + hydration per page

This is a quick (and dirty) proof of concept on how to hook up the different parts to make this work.

This works kinda like an MPA. Every page has its own hydration script.

I couldn't find a way to generate dynamic virtual entry points for Vite so I hacked a quick solution that generates the files automatically into `src/pages/client-entries`. During dev, Chokidar is watching the `src/pages` directory for `.svelte` files and generates the necessary client entry points.

It's a rudimentary solution but it works and it's easy to modify for future projects.