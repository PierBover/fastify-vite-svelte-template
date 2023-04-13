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

<Island component={Mallorca} data={hydrationData}/>
<!-- SSR only -->
<Ibiza/>
<!-- SRR + hydration -->
<Island component={Ibiza}/>
<!-- Client only -->
<Island component={Ibiza} clientOnly/>

<style>
	h1 {
		color: tomato;
	}
</style>