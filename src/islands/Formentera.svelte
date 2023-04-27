<script>
	import {count} from '../client/home.js';

	function add () {
		$count = $count + 1;
	}
</script>

<h4>Island Formentera</h4>
<button on:click={add}>Add</button>

