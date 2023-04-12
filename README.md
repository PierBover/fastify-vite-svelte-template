# Fastify + Vite + Svelte with SSR + partial hydration per page

This is a quick (and dirty) proof of concept on how to hook up the different parts to make this work.

This works klike an MPA. Every page first renders simple HTML via SSR and then only the interactive islands for that page are hydrated.

There's a Vite plugin in `vite.config.js` that generates the virtual entry points on the fly during dev and build.

### SSR

The files in the `/pages` directory will only be rendered in the server. If you want hydration, add an island.

### Islands

See the `ssr-pages/Home.svelte` file as an example on how to add interactive islands. Basically you need to use the `<Island>` wrapper component that will set it all up:

```svelte
<Island component={Mallorca} componentName="Mallorca" data={hydrationData}/>
```

Islands have some limitations:

* Islands components have to be in the `/islands` directory
* You can only send JSON-seriazable data using the `data` prop (as usual with hydration)
* You can't send children to the island via slots
* You need to manually (ugh) set the component name via the `componentName` prop