<script>
    const isClient = !import.meta.env.SSR;
</script>

{#if isClient}
    <p>Hydrated at: {Date.now()}</p>
{/if}