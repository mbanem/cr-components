<script lang="ts">
	// Destructure defaults/bindables on the LEFT side of the colon
	let {
		inputEl,
		showMenu = $bindable(false)
	}: {
		inputEl?: HTMLInputElement;
		showMenu?: boolean;
	} = $props();

	let menuPos = $state({ x: 0, y: 0 });

	// Component exported method
	export function openMenu(e: MouseEvent) {
		e.preventDefault();
		menuPos = { x: e.clientX, y: e.clientY };
		showMenu = true;
	}

	function handleClear() {
		if (inputEl) inputEl.value = '';
		closeMenu();
	}

	function closeMenu() {
		showMenu = false;
	}
</script>

<svelte:window onclick={closeMenu} onkeydown={(e) => e.key === 'Escape' && closeMenu()} />

<div class="context-menu" style="top: {menuPos.y}px; left: {menuPos.x}px;">
	<button type="button" onclick={handleClear}>Clear</button>
	<button type="button" onclick={closeMenu}>Cancel</button>
</div>

<style>
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
