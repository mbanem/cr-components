<script lang="ts">
	import { tick } from 'svelte';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import CRCheckboxGroup from './CRCheckboxGroup.svelte';
	import type { CheckboxItem } from './types';

	// will be built by child component based on the sent checkboxes prop
	let itemMap = new SvelteMap<string, CheckboxItem>();
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
	async function onValueChange(val: SvelteSet<string>) {
		// console.log('parent onValueChange:', val.size);
		await tick();
		selectedCheckButtons = val;
		// console.log('onValueChange', val);
	}
	// Example: Remote function to mutate child state from the parent code
	function remotelyToggleCheckbox() {
		const pn = itemMap.get('Pumpernickel');

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

<div style="max-width: 18rem; padding: 6px 1rem;">
	<CRCheckboxGroup
		caption="Select Products"
		checkboxes={{
			'German bred Pumpernickel': 'Pumpernickel',
			"Hershey's Chocolate Milk": 'Hershey',
			'Brasilian French-Roast Coffee Melitta': 'Melitta',
			'Milka Chocolate Lila': ['Lila', true],
			'Dove Soap Original Beauty Bar': 'Original Beauty Bar'
		}}
		reportOn="change"
		{onValueChange}
		bind:this={checkboxGroupComponent}
		bind:selectedCheckButtons
		bind:disabledButtons
		bind:itemMap
		style="border-color:green;"
		class="main"
	/>
</div>

<p>selectedCheckButtons at parent <span style="color:red;">{selectedCheckButtons.size}</span></p>
<p>disabledButtons at parent <span style="color:red;">{disabledButtons.size}</span></p>
<div class="controls">
	<button onclick={remotelyToggleCheckbox}>Toggle Pumpernickel From Parent</button>
	<button onclick={remotelyDisableCoffee}>Toggle Disable Melitta From Parent</button>
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
		margin: 0;
	}
</style>
