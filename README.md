# Fastify + Vite + Svelte with SSR + partial hydration per page

This is a quick (and dirty) proof of concept on how to hook up the different parts to make this work.

This works klike an MPA. Every page first renders HTML via SSR and then only the interactive islands for that page are hydrated.

There's a Vite plugin in `vite.config.js` that generates the virtual entry points on the fly during dev and build. Also a lightweight Svelte preprocessor that does a bit of magic for the `Island` wrapper component to work.

### Styles

This setup solves both using styles from `.svelte` files and global SASS/SCSS styles.

### SSR

The files in the `/ssr-pages` directory will only be rendered in the server. If you want client-side interactivity, add an interactive island. Islands will be first rendered in the server, and then hydrated in the client.

### Interactive islands (partial hydration)

See the `ssr-pages/Home.svelte` file as an example on how to add interactive islands. Basically you need to use the `Island` wrapper component that will set it all up so that the client can hydrate:

```svelte
<Island component={MyComponent}/>
```

The `component` prop is required. It's the Svelte component that will be used to render the island in the server and then hydrate it in the client.

#### Add data to the island

The `data` prop is optional and will only accept JSON-serializable data. Anything else will throw an error.

```svelte
<Island component={MyComponent} data={someData}/>
```

#### Make an island client-side only

You can configure an island to skip SSR and be only hydrated in the client.

```svelte
<Island component={MyComponent} clientOnly/>
```

#### Limitations of islands

* Islands components have to be located in the `/src/islands` directory. You can create subdirectories eg: `/src/islands/home/SomeWidget.svelte`. Islands can import components from other other folders.
* As usual with hydration, islands can only be hydrated with JSON-serializable data.
* You can't use slots to add children to islands.