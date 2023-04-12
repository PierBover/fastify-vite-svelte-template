<script>
	import Menu from '../components/Menu.svelte';
	import Island from '../components/Island.svelte';
	import Mallorca from '../islands/Mallorca.svelte';
	import Ibiza from '../islands/Ibiza.svelte';

	const hydrationData = {
		title: 'Hello Island!'
	}
</script>

<h1>Home</h1>

<Menu/>

<!-- you can't send anything to the island other than through the data prop  -->
<!-- everything in the data prop must be JSON serializable -->
<!-- no slots! -->
<Island component={Mallorca} componentName="Mallorca" data={hydrationData}/>
<Island component={Ibiza} componentName="Ibiza" data={hydrationData}/>
<Island component={Mallorca} componentName="Mallorca" data={hydrationData}/>

<style>
	h1 {
		color: tomato;
	}
</style>