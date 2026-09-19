<script lang="ts">
	import ContextMenu from './ContextMenu.svelte';
	import { tick } from 'svelte';

	let showMenu = $state(false);
	// let inputEl = $state<HTMLInputElement>();

	// Use ReturnType<typeof ContextMenu> for the instance ref
	let contextMenu = $state<ReturnType<typeof ContextMenu>>();

	let { value = $bindable(''), onClear = () => {} } = $props<{
		value?: string;
		onClear?: () => void;
	}>();

	// async function handleRightClick(e: MouseEvent) {
	// 	e.preventDefault();
	// 	showMenu = true; // Mounts <ContextMenu />

	// 	await tick(); // Waits for DOM/Svelte to mount the child and attach bind:this
	// 	ContextMenu?.openMenu(e); // Calls exported method safely
	// }
	const handleRightClick = async (e: MouseEvent) => {
		e.preventDefault();
		showMenu = true; // Mounts <ContextMenu />

		await tick(); // Waits for DOM/Svelte to mount the child and attach bind:this
		contextMenu?.openMenu(e); // Calls exported method safely
	};
</script>

<div class="input-container">
	<input
		type="text"
		oncontextmenu={(e: MouseEvent) => handleRightClick(e)}
		placeholder="Right-click me..."
	/>
	<input
		type="text"
		oncontextmenu={(e: MouseEvent) => handleRightClick(e)}
		placeholder="Right-click me..."
	/>

	{#if showMenu}
		<ContextMenu bind:this={contextMenu} bind:showMenu />
	{/if}
</div>
