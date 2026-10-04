<script lang="ts">
	// Destructure defaults/bindables on the LEFT side of the colon
	// bindables cannot be defined with let props = $props()
	// props.showMenu it is not bindable now

	// parent recides when context menu should be displayed
	let noop = () => {};
	let {
		showMenu = $bindable(false)
	}: {
		showMenu?: boolean;
	} = $props();

	// make readable x,y positions
	let menuPos = $state({ x: 0, y: 0 });

	// will be found via e:MouseEvent
	let inputEl: HTMLInputElement;

	// Component exported method called by parent
	export async function openMenu(e: MouseEvent) {
		e.preventDefault();

		// get target element for action and where to position menu block
		inputEl = e.target as HTMLInputElement;
		menuPos = { x: e.clientX, y: e.clientY };
		// open context menu
		showMenu = true;
	}

	function handleClear() {
		if (inputEl) {
			inputEl.value = '';
		}
		closeMenu();
	}

	function closeMenu() {
		showMenu = false;
	}
</script>

<svelte:window onclick={closeMenu} onkeydown={(e) => e.key === 'Escape' && closeMenu()} />

<!-- render a context menu list with buttons-->
<!-- <div class="context-menu" style="top: {menuPos.y}px; left: {menuPos.x}px;">
	<button type="button" onclick={handleClear}>Clear</button>
	<button type="button" onclick={closeMenu}>Cancel</button>
</div> -->
<ul class="context-menu" style="top: {menuPos.y}px; left: {menuPos.x}px;" onmouseleave={closeMenu}>
	<a href="#0" onclick={handleClear} onkeydown={noop} role="button" tabindex={0}>Clear</a>
	<a href="#0" onclick={closeMenu} onkeydown={noop} role="button" tabindex={0}>Cancel</a>
</ul>

<style>
	a {
		all: unset;
		display: inline-block;
		padding: 1px 5px 0 1rem;
		&:hover {
			background-color: lightgray;
			cursor: pointer;
		}
	}
	.context-menu {
		position: fixed;
		z-index: 1000;
		background: #ffffff;
		border: 1px solid #ccc;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		border-radius: 4px;
		padding: 4px 0;
		display: flex;
		flex-direction: column;
		min-width: 100px;
	}

	.context-menu button {
		background: none;
		border: none;
		padding: 8px 16px;
		text-align: left;
		cursor: pointer;
		font-size: 14px;
	}

	.context-menu button:hover {
		background-color: #f0f0f0;
	}
</style>
