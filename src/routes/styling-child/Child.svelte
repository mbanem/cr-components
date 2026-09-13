<!-- Child.svelte -->
<script lang="ts">
	// Capture it cleanly via $props
	let { bgTheme = 'gray', children } = $props();
</script>

<!-- Apply it safely to the local element styling -->
<div class="card" style:background-color={bgTheme}>
	{@render children?.()}
</div>

<style>
	.card {
		width: 20rem;
		height: 6rem;
		display: flex;
		justify-content: center;
		align-content: end;
	}
</style>
