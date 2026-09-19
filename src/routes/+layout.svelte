<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	let { children } = $props();
	import '../styles/components.scss';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<nav>
	<a href="/crinput">CRInput</a>
	<a href="/crphone">CRPhone</a>
	<a href="/phone-gemini">Phone Gemini</a>
	<a href="/clear">Clear</a>
	<a href="/styling-child">Styling Child</a>
</nav>
{@render children()}

<style lamg="scss">
	a {
		display: inline-block;
		padding: 0 1px;
		text-decoration: nobe;
		color: navy;
		&:hover {
			color: gray;
		}
	}
</style>
