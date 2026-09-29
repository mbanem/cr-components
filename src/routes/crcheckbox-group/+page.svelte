<script lang="ts">
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import CRCheckboxGroup from '$lib/components/CRCheckboxGroup.svelte';
	import type { TBoxItem, TEntryValue, TEntryMap, value } from '$lib/types';
	import { tick } from 'svelte';

	const disabled = true;
	let msg: HTMLParagraphElement;
	let timer: ReturnType<typeof setTimeout>;
	let placeholder = 'message placeholder';
	let placeholderIn = $state(true);

	async function logm(message: string) {
		await tick();
		if (msg === undefined || msg.innerText === '') {
			log(msg, msg.innerText);
		} else {
			msg.innerText = message;
		}
		placeholderIn = false;
		clearTimeout(timer);
		timer = setTimeout(() => {
			msg.innerText = placeholder;
			placeholderIn = true;
		}, 3000);
	}
	// Reactive entry list in Svelte 5
	let entryMap: TEntryMap = new SvelteMap<value, TEntryValue>([
		['German bred Pumpernickel', 'Pumpernickel'],
		["Hershey's Chocolate Milk", 'Hershey'],
		['Brasilian French-Roast Coffee Melitta', 'Melitta'],
		['Milka Chocolate Lila', ['Lila', disabled]],
		['Dove Soap Original Beauty Bar', 'Original Beauty Bar']
	]);
	// will be built by child component based on the sent checkboxes prop
	let itemMap = new SvelteMap<value, TBoxItem>();
	// ✅ Create a variable to reference the child component instance
	let groupComponent: ReturnType<typeof CRCheckboxGroup>;

	function handleReset() {
		groupComponent?.reset();
	}

	function handleInvert() {
		groupComponent?.invertSelections();
	}
	function onValueChange(val: SvelteSet<string>) {
		selectedButtons = val;
	}
	let affectByValue = $state('');
	async function remotelyToggleCheckbox() {
		await tick();
		try {
			const item = itemMap.get(affectByValue);
			// ✅ Guard: Only toggle selection if the checkbox exists AND is NOT currently disabled
			if (item) {
				if (item.disabled) {
					logm(`Cannot toggle ${affectByValue}: Button is disabled.`);
				} else {
					item.selected = !item.selected;
				}
			} else {
				// NOTE does not accept templated string -- logm(`Checkbox by name ${affectByValue} not found.`);
				logm('Incorrect name specified');
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			log(msg);
		}
	}

	async function remotelyDisable() {
		await tick();
		try {
			const item = itemMap.get(affectByValue);
			if (item) {
				item.disabled = !item.disabled;
			} else {
				// NOTE does not accept templated string -- const m = `Checkbox by name ${affectByValue} not found.` as string;
				logm('Incorrect name specified');
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			log(msg);
		}
	}
	let selectedButtons = new SvelteSet<string>(['Pumpernickel', 'Melitta']);
	let disabledButtons = new SvelteSet<value>(['Hershey']);
</script>

<p>input {affectByValue}</p>
<div class="controls">
	<p>selectedButtons at parent <span style="color:red;">{selectedButtons.size}</span></p>
	<p>disabledButtons at parent <span style="color:red;">{disabledButtons.size}</span></p>
	<br />
	<input type="text" bind:value={affectByValue} placeholder="affect checkbox (its value)" />
	<button onclick={remotelyToggleCheckbox}>parent: Toggle selected</button>
	<button onclick={remotelyDisable}>parent: Toggle disabled</button>
</div>
<div class="controls" style="margin-top:6px;">
	<button onclick={handleReset}>reset seleced</button>
	<button onclick={handleInvert}>invert selections</button>
	<p bind:this={msg} class="message" style={`color:${placeholderIn ? 'gray' : 'crimson'}`}>
		{placeholder}
	</p>
</div>
<div style="max-width: 18rem; padding: 6px 1rem;">
	<CRCheckboxGroup
		caption="Select Products"
		// goes into @mixin container caption arg
		checkboxes={entryMap}
		reportOn="change"
		{onValueChange}
		bind:this={groupComponent}
		bind:selectedButtons
		bind:disabledButtons
		bind:itemMap
		style="border-color:green;"
		class="main"
	/>
</div>

<div style="margin: 0.5rem 0 0 1rem;">
	At parent. Selecteded Products
	{#each Array.from(selectedButtons.keys()) as product (product)}
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
	.message {
		font-size: 13px;
		font-style: italic;
		color: crimson;
		border: 1px solid lightgray;
		border-radius: 3px;
		width: 16rem;
		padding: 3px 0 0 0.5rem;
	}

	.controls {
		padding: 0;
		margin: 1rem 0 0 1rem;
	}
</style>
