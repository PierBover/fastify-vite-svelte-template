<script>
	import HydratedAt from "../components/HydratedAt.svelte";
	export let title;
</script>

<h2>{title}</h2>
<slot></slot>

<HydratedAt/>

<style>
	h2 {
		color: blueviolet;
	}
</style>