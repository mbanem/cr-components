<script lang="ts">
	import Child from './Child.svelte';
</script>

<!-- Parent.svelte -->
<Child bgTheme="purple">
	<p
		style="padding:1rem 2rem;color:white;width:20rem;height:6rem;display:flex;justify-content: center;align-items: start;"
	>
		Clean property passing
	</p>
</Child>
