<script>
	import HydratedAt from "../components/HydratedAt.svelte";
	export let title;
</script>

<h2>Ibiza: {title}</h2>
<slot></slot>

<HydratedAt/>