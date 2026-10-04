<script lang="ts">
	import CRPhone from './CRPhone.svelte';
	import ContextMenu, { type ContextAction } from './ContextMenu.svelte';
	import { tick } from 'svelte';

	// Use ReturnType<typeof CRPhone> for proper Svelte 5 component instance typing
	let crphone = $state<ReturnType<typeof CRPhone>>();

	let showMenu = $state(false);
	let menuRef = $state<ReturnType<typeof ContextMenu>>();

	// Wrap the call in an arrow function so 'crphone' is evaluated lazily at click time
	// When you define an arrow function like () => crphone?.reset(), you aren't running
	// crphone.reset(). You are building a small "package" of code to be opened later.
	// The Closure (Capturing the Variable Pointer)
	// A closure means a function "remembers" the variables in its surrounding environment,
	// even after that outer scope has finished executing.
	// Crucially, the arrow function captures the reference to the crphone variable itself,
	// not the value inside it at the moment the function was declared.
	// By wrapping it in an arrow function (action: () => ...), you create deferred/lazy
	// evaluation. The code inside the function body is completely paused and ignored by
	// the browser engine until the exact millisecond action() is invoked by your click handler!
	const actions: ContextAction[] = [
		{
			label: 'Clear Field',
			action: () => crphone?.reset()
		}
	];

	async function handleContextMenu(e: MouseEvent) {
		// make HTML markup with contextmenu available and bind to menuRef
		// so we can call exported function on it, e.g. openMenu
		showMenu = true;
		// important! give DOM/Svelte time to bind to now undefined menuRef
		await tick();
		menuRef?.openMenu(e);
		// now wait as some of actions could be called from ContextMenu
	}
</script>

<div oncontextmenu={handleContextMenu} role="button" aria-haspopup="menu" tabindex={0}>
	<CRPhone label="phoneNumber" bind:this={crphone} />
	<ContextMenu bind:this={menuRef} options={actions} bind:showMenu />
</div>
