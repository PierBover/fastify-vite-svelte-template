<script>
	import Menu from '../components/Menu.svelte';
	import HydratedAt from '../components/HydratedAt.svelte';
	import {getContext} from 'svelte';
	export let pageData;

	console.log(getContext('pageData'));

</script>

<h1>Home</h1>

<Menu/>

<p>{pageData.message}</p>

<HydratedAt/>

<style>
	h1 {
		color: tomato;
	}
</style>