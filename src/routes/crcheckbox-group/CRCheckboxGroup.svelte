<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';

	export interface CheckboxItem {
		label: string;
		selected: boolean;
		disabled: boolean;
	}

	type Props = {
		caption?: string;
		checkboxes: Record<string, string | [string, boolean]>;
		selectedCheckButtons: SvelteSet<string>;
		disabledButtons?: SvelteSet<string>;
		reportOn?: 'change' | 'input';
		onValueChange?: (val: SvelteSet<string>) => void;
		itemMap?: SvelteMap<string, CheckboxItem>; // Fix type to match SvelteMap
		style?: string;
		class?: string;
	};

	let {
		caption,
		checkboxes,
		reportOn = 'change',
		selectedCheckButtons = $bindable(),
		disabledButtons = $bindable(new SvelteSet()), // Ensure safe default initializer
		onValueChange,
		itemMap = $bindable(new SvelteMap()),
		style = '',
		class: className = ''
	}: Props = $props();

	let imgPath = '/CRCheckboxGroup-setup.png';
	let timer: ReturnType<typeof setTimeout>;
	let checkboxValue = $state('');
	let isZoomed = $state(false);

	// ✅ Fix 1: Properly isolate state instantiation inside a single clean initialization effect
	$effect(() => {
		// We explicitly untrack everything except the primary "checkboxes" data change trigger
		checkboxes;
		untrack(() => {
			itemMap.clear();
			Object.entries(checkboxes).forEach(([label, val]) => {
				const value = Array.isArray(val) ? val[0] : val;
				const explicitDisabled = Array.isArray(val) ? val[1] : false;

				const initialChecked = selectedCheckButtons.has(value);
				const initialDisabled = explicitDisabled || disabledButtons.has(value);

				// Svelte 5 parses local variable assignment rules perfectly
				let itemState = $state({
					label,
					selected: initialChecked,
					disabled: initialDisabled
				});

				itemMap.set(value, itemState);
			});
		});
	});

	// ✅ Fix 2: Bi-directional synchronization using structured internal side effects
	// This syncs deep properties (item.selected / item.disabled) back to the Parent's SvelteSets
	$effect(() => {
		const currentSelected = new Set<string>();
		const currentDisabled = new Set<string>();

		for (const [value, item] of itemMap.entries()) {
			if (item.selected) currentSelected.add(value);
			if (item.disabled) currentDisabled.add(value);
		}

		// Mutate rather than re-assign to retain parent proxy linkage
		untrack(() => {
			// Synchronize selected keys
			selectedCheckButtons.clear();
			currentSelected.forEach((v) => selectedCheckButtons.add(v));

			// Synchronize disabled keys
			disabledButtons.clear();
			currentDisabled.forEach((v) => disabledButtons.add(v));

			if (reportOn === 'change') {
				onValueChange?.(selectedCheckButtons);
			}
		});
	});

	// ✅ Fix 3: Sync external parent set mutations downwards into our granular item map entries
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

	// Lookups stay reactive dynamically via modern $derived structures
	let validValues = $derived(new SvelteSet(itemMap.keys()));

	// ✅ Fix 4: Removed the breaking global container onclick handler.
	// Standard HTML input element checked state bindings handle clicks perfectly now.
	function handleCheckboxChange(value: string) {
		if (reportOn === 'change') {
			onValueChange?.(selectedCheckButtons);
		}
	}

	function toggleDisabledByValue() {
		if (!validValues.has(checkboxValue)) {
			console.warn('Value matching key not found in Registry:', checkboxValue);
			return;
		}
		const item = itemMap.get(checkboxValue);
		if (item) {
			item.disabled = !item.disabled; // Directly update deep entry! UI reacts immediately.
		}
	}
	// ✅ Utility 1: Reset all selections to false (Respects nothing, clears all)
	export function reset() {
		for (const item of itemMap.values()) {
			item.selected = false;
		}
	}

	// ✅ Utility 2: Inverts selection of all active checkboxes, skipping any disabled ones
	export function invertSelections() {
		for (const item of itemMap.values()) {
			// Only invert if the checkbox is not disabled
			if (!item.disabled) {
				item.selected = !item.selected;
			}
		}
	}
</script>

<div class="grid-container">
	<!-- Left Side: Radio Group -->
	<div class="cr-input-container {className}" {style}>
		<!-- Caption text slot layout -->
		{#if caption}<h3>{caption}</h3>{/if}

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
				transition:fade={{ duration: 150 }}
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
		<button onclick={toggleDisabledByValue}>Toggle disabled by radiobox value</button>
		<!-- <pre>At child. Number of disabled checkbox buttons: {disabledButtons.size}</pre> -->
	</div>
</div>

<style lang="scss">
	/* Your exact styles retained unchanged */
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
		cursor: zoom-in;
		display: block;
	}
	%overlay-dimensions {
		position: absolute;
		top: 0px;
		left: -320px;
		width: 420px;
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
