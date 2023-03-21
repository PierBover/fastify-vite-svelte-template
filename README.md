# Fastify + Vite + Svelte doing SSR + hydration per page

This is a quick (and dirty) proof of concept on how to hook up the different parts to make this work.

This works kinda like an MPA. Every page has its own hydration script.

There's a Vite plugin in `vite.config.js` that generates the virtual entry points on the fly during dev and build.