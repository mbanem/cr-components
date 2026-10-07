<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	let { children } = $props();
	import '$styles/components.scss';
	// src/hooks.client.ts
	(globalThis as typeof globalThis & { log: typeof console.log }).log = console.log;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<nav>
	<a href="/crinput-text">CRInputText</a>
	<a href="/phone-gemini">Phone Gemini</a>
	<a href="/crradio-group">CRRadioGroup</a>
	<a href="/crcheckbox-group">CRCheckboxGroup</a>
	<a href="/crcontext-menu">CRContextMenu</a>
	<a href="/styling-child">Styling Child</a>
	<a href="/t-css-vars-from-markup">Markup css var</a>
	<a href="/test-page">Test Page</a>
	<a href="/tooltip">Reactive Tooltip</a>
	<a href="/tooltip-grok">Reactive Grok Tooltip</a>
</nav>
{@render children()}

<style lamg="scss">
	a {
		display: inline-block;
		padding: 0 1px;
		text-decoration: none;
		color: navy;
		&:hover {
			color: gray;
		}
	}
</style>
