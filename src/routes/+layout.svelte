<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<nav>
	<a href="/crinput">CRInput</a>
	<a href="/styling-child">Styling Child</a>
</nav>
{@render children()}
