<script>
	export let component;
	export let data;
	export let componentName;
	export let clientOnly = false;

	const isServer = import.meta.env.SSR;
	const islandId = (Math.random() + 1).toString(36).substring(7);

	let dataJson;

	try {
		dataJson = JSON.stringify(data);
	} catch (error) {
		throw `Data for ${componentName} is not JSON serializable!`;
	}

</script>

<div class="island-boi" data-component-name={componentName} data-island-id={islandId} data-json={dataJson}>
	{#if isServer && !clientOnly}
		<svelte:component this={component} {...data}>
			<slot></slot>
		</svelte:component>
	{/if}
</div>