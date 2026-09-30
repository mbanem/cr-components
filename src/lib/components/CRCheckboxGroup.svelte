<script lang="ts">
	// WORKS WELL
	import { untrack } from 'svelte';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import type { TBoxItem, TEntryMap, value } from '$lib/types';

	type Props = {
		caption?: string;
		checkboxes: TEntryMap;
		selectedButtons: SvelteSet<string>;
		disabledButtons?: SvelteSet<string>;
		reportOn?: 'change' | 'input';
		onValueChange?: (val: SvelteSet<string>) => void;
		itemMap?: SvelteMap<value, TBoxItem>;
		style?: string;
		class?: string;
	};

	let {
		caption,
		checkboxes,
		reportOn = 'change',
		selectedButtons = $bindable(),
		disabledButtons = $bindable<SvelteSet<string>>(), // set generic type to avoid undefined
		onValueChange,
		itemMap = $bindable<SvelteMap<value, TBoxItem>>(), // set generic type to avoid undefined
		style = '',
		class: className = ''
	}: Props = $props();

	let imgPath = '/CRCheckboxGroup-setup.png';
	let timer: ReturnType<typeof setTimeout>;
	let checkboxValue = $state('');
	let labelForCheckbox = $state('Vanilla Ice Cream Crougger');
	let valueForCheckbox = $state('Ice Cream-V Crougger');
	let selectedForCheckbox = $state(false);
	let isZoomed = $state(false);

	$effect(() => {
		// Only track the 'checkboxes' prop explicitly
		const boxes = Array.from(checkboxes);

		untrack(() => {
			const currentKeys = new Set<string>();

			for (const [label, val] of boxes) {
				const value = Array.isArray(val) ? val[0] : val;
				const explicitDisabled = Array.isArray(val) ? val[1] : false;
				currentKeys.add(value);

				const initialChecked = selectedButtons.has(value);
				const initialDisabled = explicitDisabled || disabledButtons.has(value);

				if (itemMap.has(value)) {
					// Update existing proxy properties
					const existing = itemMap.get(value)!;
					existing.label = label;
				} else {
					// Create a new $state reactive proxy
					let itemState = $state({
						label,
						selected: initialChecked,
						disabled: initialDisabled
					});
					itemMap.set(value, itemState);
				}
			}

			// Cleanup removed items
			for (const key of Array.from(itemMap.keys())) {
				if (!currentKeys.has(key)) {
					itemMap.delete(key);
				}
			}
		});
	});

	// 2. Synchronize itemMap selection & disabled state outwards to Parent Sets
	$effect(() => {
		const currentSelected = new Set<string>();
		const currentDisabled = new Set<string>();

		for (const [value, item] of itemMap.entries()) {
			if (item.selected) currentSelected.add(value);
			if (item.disabled) currentDisabled.add(value);
		}

		untrack(() => {
			selectedButtons.clear();
			currentSelected.forEach((v) => selectedButtons.add(v));

			disabledButtons.clear();
			currentDisabled.forEach((v) => disabledButtons.add(v));

			if (reportOn === 'change') {
				onValueChange?.(selectedButtons);
			}
		});
	});

	let validValues = $derived(new SvelteSet(itemMap.keys()));

	// Handlers

	export function reset() {
		for (const [key, val] of Array.from(itemMap.entries())) {
			if (val.selected) {
				const state = $state({ ...val, selected: false });
				itemMap.set(key, state);
			}
		}
	}

	function toggleDisabledByValue() {
		if (!validValues.has(checkboxValue)) {
			console.warn('Value matching key not found in Registry:', checkboxValue);
			return;
		}
		const item = itemMap.get(checkboxValue);
		if (item) {
			item.disabled = !item.disabled;
		}
	}

	export function removeItemByValue(value: string) {
		itemMap.delete(value);
	}

	export function addItem(label: string, value: string, selected = false) {
		if (itemMap.has(value)) {
			removeItemByValue(value);
			return;
		}
		let newItem = $state({ label, selected, disabled: false });
		itemMap.set(value, newItem);
	}

	export function invertSelections() {
		for (const [key, val] of Array.from(itemMap.entries())) {
			const selected = !val.selected;
			const state = $state({ ...val, selected });
			itemMap.set(key, state);
		}
	}

	export function toggleCheckListByValue() {
		if (!labelForCheckbox || !valueForCheckbox) return;
		addItem(labelForCheckbox, valueForCheckbox, selectedForCheckbox);
	}
</script>

<div class="grid-container">
	<div class="cr-input-container {className}" {style} data-caption={caption}>
		<div class="radio-wrapper" role="presentation">
			{#each Array.from(itemMap.entries()) as [value, item] (value)}
				<label class="checkbox-label">
					<input type="checkbox" {value} bind:checked={item.selected} disabled={item.disabled} />
					<span class:item-disabled={item.disabled}>{item.label}</span>
				</label>
			{/each}
		</div>
	</div>

	<!-- Right Side: Thumbnail & Dynamic Popout Overlay -->
	<div class="thumbnail-wrapper">
		<img
			src={imgPath}
			alt="Instantiation code snippet summary"
			width="100"
			height="auto"
			class="thumbnail-img"
			onmouseenter={() => {
				timer = setTimeout(() => {
					isZoomed = true;
				}, 600);
			}}
			onmouseleave={() => clearTimeout(timer)}
		/>

		{#if isZoomed}
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img
				src={imgPath}
				alt="Full instantiation code snippet"
				class="overlay-img"
				transition:fade={{ duration: 250 }}
			/>
			<div class="hitbox-mask" onmouseleave={() => (isZoomed = false)} aria-hidden={true}></div>
		{/if}
	</div>

	<!-- Bottom Row: Demonstration Controls -->
	<div class="below">
		<input
			type="text"
			bind:value={checkboxValue}
			placeholder="Radio value string"
			style="width:12.2rem !important;"
		/>
		<button onclick={toggleDisabledByValue}> Toggle disabled by checklist value </button>
		<pre>At child. Number of disabled checkbox buttons: {disabledButtons.size}</pre>
		<div class="wrapper">
			<div class="single-row">
				<label for="lbl" style="display:block">
					Label for new checkbox
					<input
						id="lbl"
						type="text"
						bind:value={labelForCheckbox}
						placeholder="label for new checkbox"
						style="width:12.2rem !important;"
					/>
				</label>
				<label for="val" style="display:block">
					Value for new checkbox
					<input
						id="val"
						type="text"
						bind:value={valueForCheckbox}
						placeholder="Value for new checkbox"
						style="width:12.2rem !important;"
					/>
				</label>
				<label for="sel" style="display:block;margin-left:-6px;">
					Selected
					<input
						id="sel"
						type="checkbox"
						bind:checked={selectedForCheckbox}
						style="margin-top:8px;"
					/>
				</label>
			</div>
			<button onclick={toggleCheckListByValue} style="margin-top:0.7rem;">
				Add new or remove a checkbox from the list
			</button>
		</div>
	</div>
</div>

<style lang="scss">
	.cr-input-container {
		@include container();
		width: 30.8rem;
		.radio-wrapper {
			width: 22.4rem;
		}
		padding: 0 0 10px 1rem;
		margin-top: 1rem;
	}

	.wrapper {
		@include container($caption: 'Add new or Remove Checkbox from the List', $caption-color: navy);
		padding: 10px 6px;
		margin: 0;
		.single-row {
			display: flex;
			gap: 1rem;
			align-items: flex-end;

			label {
				font-size: 0.9rem;
				font-weight: 500;
			}

			input {
				display: block;
				margin-top: 0.25rem;
			}
		}
	}

	.checkbox-label {
		cursor: pointer;
		display: block;
		margin-bottom: 0.4rem;
	}
	.grid-container {
		display: grid;
		grid-template-columns: 18rem 6.5rem;
		align-items: start;
		column-gap: 2rem;
	}
	.below {
		grid-column: 1 / span 2;
		margin-top: 10px;
	}
	.thumbnail-wrapper {
		margin-top: 1.3rem;
		position: relative;
		display: inline-block;
	}
	.item-disabled {
		color: gray;
		text-decoration: line-through;
	}
	.thumbnail-img {
		margin: 1.1rem 0 0 4rem;
		border-radius: 3px;
		cursor: zoom-in;
		display: block;
	}
	%overlay-dimensions {
		position: absolute;
		top: 0px;
		left: -314px;
		width: 479px;
		height: auto;
		aspect-ratio: 400 / 300;
		border-radius: 8px;
	}
	.overlay-img {
		@extend %overlay-dimensions;
		z-index: 100;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
		border: 1px solid #ccc;
		background-color: #1e1e1e;
	}
	.hitbox-mask {
		@extend %overlay-dimensions;
		z-index: 101;
		background: transparent;
		cursor: zoom-out;
	}
</style>
