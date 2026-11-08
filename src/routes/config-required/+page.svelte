<script lang="ts">
	import ConfigurationRequired from '$lib/components/ConfigurationRequired.svelte';
</script>

<div class="conf-required">
	<ConfigurationRequired></ConfigurationRequired>
</div>

<style lang="scss">
	.conf-required {
		position: absolute;
		top: 2rem;
		left: 1rem;
	}
</style>
