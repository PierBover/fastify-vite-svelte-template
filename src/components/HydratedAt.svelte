<script>
	const isClient = !import.meta.env.SSR;
</script>

{#if isClient}
	<p>Hydrated at: {Date.now()}</p>
{:else}
	<p>Rendered on the server (SSR)</p>
{/if}