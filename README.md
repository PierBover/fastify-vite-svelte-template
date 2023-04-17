# Fastify + Vite + Svelte with SSR + partial hydration per page

I'm still working on this.

This is a quick (and dirty) proof of concept on how to hook up the different parts to make this work.

This works like an MPA. Every page first renders HTML via SSR and then only the interactive islands for that page are hydrated.

There's a Vite plugin in `vite.config.js` that generates the virtual entry points on the fly during dev and build. Also a lightweight Svelte preprocessor that does a bit of magic for the `Island` wrapper component to work.

## Styles

This setup solves both using styles from the `.svelte` files and global SASS/SCSS styles.

## SSR

The `.svelte` files in the `/ssr-pages` directory will be used for rendering HTML in the server. If you want client-side interactivity, add an interactive island to your page. Islands will be first rendered in the server, and then hydrated in the client.

Check the `server.js` file to see how to render a Svelte module. In your Fastify code first import the `renderSsr()` function:

```js
import {renderSsr} from './render-ssr.js';
```

Then in your route use it like this:
```js
const html = await renderSsr('MyComponent');
```

`MyComponent` would be the `ssr-pages/MyComponent.svelte` file.

You can use nested folders in the `ssr-pages` directory and then reference the component like this:
```js
const html = await renderSsr('nested/folder/Component');
```

## Interactive islands (partial hydration)

See the `ssr-pages/Home.svelte` file as an example on how to add interactive islands. Basically you need to use the `Island` wrapper component that will set it all up so that the client can hydrate:

```svelte
<Island component={MyComponent}/>
```

The `component` prop is required. It's the Svelte component that will be used to render the island in the server and then hydrate it in the client.

### Add data to the island

You can add data to an island using the optional `data` prop. As usual with hydration, this only accepts JSON-serializable data. Anything else will throw an error.

```svelte
<Island component={MyComponent} data={someDataObject}/>
```

The data needs to be encapsulated into an object. The key/values of the object will be passed as props to the hydrated component like this:

```svelte
<MyComponent {...data}/>
```

If this doesn't work for your use case, the wrapper component `/src/components/Island.svelte` is simple enough that you can adapt it to fit your needs.

### Make an island client-side only

You can configure an island to skip SSR so that it is only hydrated in the client.

```svelte
<Island component={MyComponent} clientOnly/>
```

### Limitations of islands

* Islands components have to be located in the `/src/islands` directory.
* Unfortunately you **cannot** create subdirectories in the `/src/islands` directory since all the island filenames have to be unique for this to work.
* As usual with hydration, islands can only be hydrated with JSON-serializable data.
* You can't use slots to add children to islands.