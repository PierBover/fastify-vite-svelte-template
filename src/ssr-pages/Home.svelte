<script>
	import Menu from '../components/Menu.svelte';
	import Island from '../components/Island.svelte';
	import Mallorca from '../islands/Mallorca.svelte';
	import Ibiza from '../islands/Ibiza.svelte';
	import Menorca from '../islands/Menorca.svelte';
	import Formentera from '../islands/Formentera.svelte';

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

<h2>Communication between islands</h2>

<Island component={Menorca}/>
<Island component={Formentera}/>

<style>
	h1 {
		color: tomato;
	}
</style>