<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import type { TCheckboxItem, TEntryMap } from './types';

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
	let labelForCheckbox = $state('');
	let valueForCheckbox = $state('');
	let selectedForCheckbox = $state(false);
	let isZoomed = $state(false);

	// 1. Initialize & sync items from 'checkboxes' prop into itemMap without wiping existing proxies
	$effect(() => {
		// Only track the 'checkboxes' prop explicitly
		const entries = Array.from(checkboxes);

		untrack(() => {
			const currentKeys = new Set<string>();

			for (const [label, val] of entries) {
				const value = Array.isArray(val) ? val[0] : val;
				const explicitDisabled = Array.isArray(val) ? val[1] : false;
				currentKeys.add(value);

				const initialChecked = selectedCheckButtons.has(value);
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
			selectedCheckButtons.clear();
			currentSelected.forEach((v) => selectedCheckButtons.add(v));

			disabledButtons.clear();
			currentDisabled.forEach((v) => disabledButtons.add(v));

			if (reportOn === 'change') {
				onValueChange?.(selectedCheckButtons);
			}
		});
	});

	// 3. Dynamic derived set for lookup validations
	let validValues = $derived(new SvelteSet(itemMap.keys()));

	// Handlers
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

	export function addItem(label: string, value: string, selected = false) {
		if (itemMap.has(value)) {
			removeItemByValue(value);
			return;
		}
		let newItem = $state({ label, selected, disabled: false });
		itemMap.set(value, newItem);
	}

	export function removeItemByValue(value: string) {
		itemMap.delete(value);
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
