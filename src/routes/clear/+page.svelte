<script lang="ts">
	import ClearInput from './ClearInput.svelte';
	import { tick } from 'svelte';

	let showMenu = $state(false);
	let inputEl = $state<HTMLInputElement>();

	// Use ReturnType<typeof ClearInput> for the instance ref
	let clearInput = $state<ReturnType<typeof ClearInput>>();

	let { value = $bindable(''), onClear = () => {} } = $props<{
		value?: string;
		onClear?: () => void;
	}>();

	async function handleRightClick(e: MouseEvent) {
		e.preventDefault();
		showMenu = true; // Mounts <ClearInput />

		await tick(); // Waits for DOM/Svelte to mount the child and attach bind:this
		clearInput?.openMenu(e); // Calls exported method safely
	}
</script>

<div class="input-container">
	<input
		type="text"
		bind:this={inputEl}
		bind:value
		oncontextmenu={handleRightClick}
		placeholder="Right-click me..."
	/>

	{#if showMenu}
		<ClearInput bind:this={clearInput} {inputEl} bind:showMenu />
	{/if}
</div>
