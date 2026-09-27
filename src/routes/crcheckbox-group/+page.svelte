<script lang="ts">
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import CRCheckboxGroup from './CRCheckboxGroup.svelte';
	import type { TCheckboxItem, TEntryValue, TEntryMap } from './types';

	// Reactive entry list in Svelte 5
	let entryMap: TEntryMap = new SvelteMap<string, TEntryValue>([
		['German bred Pumpernickel', 'Pumpernickel'],
		["Hershey's Chocolate Milk", 'Hershey'],
		['Brasilian French-Roast Coffee Melitta', 'Melitta'],
		['Milka Chocolate Lila', ['Lila', true]],
		['Dove Soap Original Beauty Bar', 'Original Beauty Bar']
	]);
	// will be built by child component based on the sent checkboxes prop
	let itemMap = new SvelteMap<string, TCheckboxItem>();
	// ✅ Create a variable to reference the child component instance
	let checkboxGroupComponent: ReturnType<typeof CRCheckboxGroup>;

	function handleReset() {
		// Call the exported child method
		checkboxGroupComponent?.reset();
	}

	function handleInvert() {
		// Call the exported child method
		checkboxGroupComponent?.invertSelections();
	}
	function onValueChange(val: SvelteSet<string>) {
		selectedCheckButtons = val;
	}
	// Example: Remote function to mutate child state from the parent code
	function remotelyToggleCheckbox() {
		const pn = itemMap.get('Pumpernickel');
		if (pn) {
		}
		// ✅ Guard: Only toggle selection if the checkbox exists AND is NOT currently disabled
		if (pn && !pn.disabled) {
			pn.selected = !pn.selected;
		} else if (pn?.disabled) {
			console.warn('Cannot toggle "Pumpernickel": Button is disabled.');
		}
	}

	function remotelyDisableCoffee() {
		const mel = itemMap.get('Melitta');
		if (mel) {
			// This change will instantly gray out and disable the coffee checkbox!
			mel.disabled = !mel.disabled;
		}
	}
	let selectedCheckButtons = new SvelteSet<string>(['Pumpernickel', 'Melitta']);
	let disabledButtons = new SvelteSet<string>(['Hershey']);
</script>

<div class="controls">
	<p>selectedCheckButtons at parent <span style="color:red;">{selectedCheckButtons.size}</span></p>
	<p>disabledButtons at parent <span style="color:red;">{disabledButtons.size}</span></p>
	<br />
	<button onclick={remotelyToggleCheckbox}>Toggle Pumpernickel From Parent</button>
	<button onclick={remotelyDisableCoffee}>Toggle Disable Melitta From Parent</button>
</div>
<div style="max-width: 18rem; padding: 6px 1rem;">
	<CRCheckboxGroup
		caption="Select Products"
		// goes into @mixin container caption arg
		checkboxes={entryMap}
		reportOn="change"
		{onValueChange}
		// bind CRCheckboxGrpup instance to call exported child functions
		bind:this={checkboxGroupComponent}
		bind:selectedCheckButtons
		bind:disabledButtons
		bind:itemMap
		style="border-color:green;"
		class="main"
	/>
</div>

<div style="margin: 0.5rem 0 0 1rem;">
	At parent. Selecteded Products
	{#each Array.from(selectedCheckButtons.keys()) as product (product)}
		<p class="product">{product}</p>
	{/each}
</div>

<style lang="scss">
	.product {
		display: block;
		color: blue;
		padding: 1px 0;
		margin: 0 0 0 1rem;
	}
	p {
		display: inline-block;
		padding: 1px;
		margin: 0 1.8rem 0 0;
	}
	.controls {
		padding: 0;
		margin: 1rem 0 0 1rem;
	}
</style>
