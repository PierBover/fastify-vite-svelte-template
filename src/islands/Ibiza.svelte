<script>
	import HydratedAt from "../components/HydratedAt.svelte";
	const isServer = import.meta.env.SSR;
</script>

<h2>
	Island

	{#if isServer}
		rendered on the server
	{:else}
		rendered on the client
	{/if}

</h2>

<HydratedAt/>