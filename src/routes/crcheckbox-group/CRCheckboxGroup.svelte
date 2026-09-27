<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import type { TCheckboxItem, TEntryMap } from './types';

	const log = console.log;
	type Props = {
		caption?: string;
		checkboxes: TEntryMap;
		selectedCheckButtons: SvelteSet<string>;
		disabledButtons?: SvelteSet<string>;
		reportOn?: 'change' | 'input';
		onValueChange?: (val: SvelteSet<string>) => void;
		itemMap?: SvelteMap<string, TCheckboxItem>;
		style?: string;
		class?: string;
	};

	let {
		caption,
		checkboxes,
		reportOn = 'change',
		selectedCheckButtons = $bindable(),
		disabledButtons = $bindable(new SvelteSet()),
		onValueChange,
		itemMap = $bindable(new SvelteMap()),
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

	// 1. One-time or prop-change initialization into SvelteMap
	$effect(() => {
		checkboxes;
		untrack(() => {
			itemMap.clear();
			for (const [label, val] of checkboxes) {
				const value = Array.isArray(val) ? val[0] : val;
				const explicitDisabled = Array.isArray(val) ? val[1] : false;

				itemMap.set(value, {
					label,
					selected: selectedCheckButtons.has(value),
					disabled: explicitDisabled || disabledButtons.has(value)
				});
			}
		});
	});

	// 2. Synchronize itemMap changes outwards to selectedCheckButtons & disabledButtons
	$effect(() => {
		const currentSelected = new Set<string>();
		const currentDisabled = new Set<string>();

		for (const [value, item] of itemMap.entries()) {
			if (item.selected) currentSelected.add(value);
			if (item.disabled) currentDisabled.add(value);
		}

		untrack(() => {
			selectedCheckButtons.clear();
			currentSelected.forEach((v) => selectedCheckButtons.add(v));

			disabledButtons.clear();
			currentDisabled.forEach((v) => disabledButtons.add(v));

			if (reportOn === 'change') {
				onValueChange?.(selectedCheckButtons);
			}
		});
	});

	// 3. React to parent set updates (External -> Local Map)
	$effect(() => {
		for (const [value, item] of itemMap.entries()) {
			const shouldBeSelected = selectedCheckButtons.has(value);
			if (item.selected !== shouldBeSelected) {
				item.selected = shouldBeSelected;
			}
		}
	});

	$effect(() => {
		for (const [value, item] of itemMap.entries()) {
			const shouldBeDisabled = disabledButtons.has(value);
			if (item.disabled !== shouldBeDisabled) {
				item.disabled = shouldBeDisabled;
			}
		}
	});

	let validValues = $derived(new SvelteSet(itemMap.keys()));

	// Event handlers & Clean State Actions
	function handleCheckboxChange(value: string) {
		if (selectedCheckButtons.has(value)) {
			selectedCheckButtons.delete(value);
		} else {
			selectedCheckButtons.add(value);
		}
		if (reportOn === 'change') {
			onValueChange?.(selectedCheckButtons);
		}
	}

	function toggleDisabledByValue() {
		if (!validValues.has(checkboxValue)) {
			console.warn('Value matching key not found in Registry:', checkboxValue);
			return;
		}
		log('found in validValues', checkboxValue, validValues);
		const item = itemMap.get(checkboxValue);
		log('is item found?', item);
		if (item) {
			itemMap.set(checkboxValue, {
				...item,
				disabled: !item.disabled
			});
		}
		log('now is disabled?', item?.disabled);
	}

	export function reset() {
		for (const item of itemMap.values()) {
			item.selected = false;
		}
	}

	export function invertSelections() {
		for (const item of itemMap.values()) {
			if (!item.disabled) {
				item.selected = !item.selected;
			}
		}
	}

	// Vanilla Ice Cream Crougger  Ice Cream-V Crougger
	// Fully Declarative Add/Remove
	export function addItem(label: string, value: string, selected = false) {
		if (itemMap.has(value)) {
			removeItemByValue(value);
			return;
		}
		// Svelte 5 SvelteMap triggers UI updates automatically on .set()
		itemMap.set(value, { label, selected, disabled: false });
	}

	export function removeItemByValue(value: string) {
		// Standard map delete triggers template #each re-render cleanly
		itemMap.delete(value);
		if (selectedCheckButtons.has(value)) {
			selectedCheckButtons.delete(value);
		}
	}

	export function toggleCheckListByValue() {
		if (!labelForCheckbox || !valueForCheckbox) return;
		addItem(labelForCheckbox, valueForCheckbox, selectedForCheckbox);
	}
	// const caption = 'Ah a new caption';
</script>

<div class="grid-container">
	<!-- Left Side: Checkbox Group -->
	<div class="cr-input-container {className}" {style} data-caption={caption ?? 'Select a Product'}>
		<div class="radio-wrapper" role="presentation">
			{#each Array.from(itemMap.entries()) as [value, item] (value)}
				<label class="checkbox-label">
					<input
						type="checkbox"
						{value}
						bind:checked={item.selected}
						disabled={item.disabled}
						onchange={() => handleCheckboxChange(value)}
					/>
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
		<button onclick={toggleDisabledByValue}>Toggle disabled by checklist value</button>
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
		padding: 10px;
		padding-top: 1px;
		margin-top: 1rem;
		.radio-wrapper {
			width: 22rem;
		}
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
		margin: 2.4rem 0 0 3.4rem;
		position: relative;
		display: inline-block;
	}
	.item-disabled {
		color: gray;
		text-decoration: line-through;
	}
	.thumbnail-img {
		cursor: zoom-in;
		display: block;
	}
	%overlay-dimensions {
		position: absolute;
		top: 0px;
		left: -360px;
		width: 460px;
		height: auto;
		aspect-ratio: 400 / 300;
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
