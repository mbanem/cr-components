<script lang="ts">
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	let { children } = $props();
	import '$styles/components.scss';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<nav>
	<a href={resolve('/crinput-text')}>CRInputText</a>
	<a href={resolve('/phone-number')}>Phone Number</a>
	<a href={resolve('/crradio-group')}>CRRadioGroup</a>
	<a href={resolve('/crcheckbox-group')}>CRCheckboxGroup</a>
	<a href={resolve('/crcontext-menu')}>CRContextMenu</a>
	<a href={resolve('/styling-child')}>Styling Child</a>
	<a href={resolve('/t-css-vars-from-markup')}>Markup css var</a>
	<a href={resolve('/test-page')}>Test Page</a>
	<a href={resolve('/test-orm-one')}>Test OrmOne</a>
	<a href={resolve('/orm-one')}>Orm One</a>
	<a href={resolve('/orm-three')}>Orm Three</a>
	<a href={resolve('/config-required')}>Config Required</a>
	<!-- <a href={resolve('/tooltip')}>Reactive Tooltip</a> -->
	<!-- <a href={resolve('/tooltip-grok')}>Reactive Grok Tooltip</a> -->
	<a href={resolve('/models-handler')}>Models Handler</a>
</nav>
<hr />
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
	a {
		border: 1px solid gray;
		border-radius: 4px;
		margin-right: 5px;
		padding: 0 5px;
	}
</style>
