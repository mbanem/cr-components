<script lang="ts">
	import { onMount, tick } from 'svelte';

	import type { HTMLInputAttributes } from 'svelte/elements';
	import { fade } from 'svelte/transition';

	type TRadioList = { label: string; value: string; checked: boolean; isDisabled: boolean };
	interface PROPS extends Partial<HTMLInputAttributes> {
		caption?: string;
		radios: TChRbGroup;
		reportOn?: TReportOn;
		selectedValue?: string;
		onValueChange?: TCallback;
		disabledButtons?: string[];
		style?: string;
		class?: string;
	}

	let {
		caption = '',
		radios = {},
		reportOn = 'change|focus|keypress',
		selectedValue = $bindable(''),
		onValueChange,
		disabledButtons = $bindable(['Lila']),
		style = '',
		class: className = '',

		...restProps
	}: PROPS = $props();

	let timer: TTimer;
	// as selectedValue is bound to currenly checked radio so, at rendering
	// it will be cleared by the next loop rendering new radio so keep it and
	// set checked when all renderings are done at onMount
	let imgPath = '/CRRadioGroup-setup.png';
	let selected = selectedValue;
	let crInputContainer: HTMLDivElement;
	let radioValue = $state(''); // from input box to find radio box by value
	// Svelte 5 Reactive State for managing the zoomed image overlay
	let isZoomed = $state(false);
	// Parse radios object into a clean array, replacing empty keys with values
	let radioList = $derived(
		Object.entries(radios).map(([labelKey, rawVal]) => {
			// 1. Check if rawVal is a tuple [value, checked] or a plain string value
			const isTuple = Array.isArray(rawVal);
			const val = isTuple ? rawVal[0] : rawVal;
			const isChecked = isTuple ? (rawVal[1] ?? false) : false;
			return {
				label: labelKey.trim() === '' ? val : labelKey,
				value: val,
				checked: isChecked,
				isDisabled: disabledButtons.includes(val)
			} as TRadioList;
		})
	);
	let radioValueSet = $derived(new Set(radioList.map((item) => item.value)));

	type TRadioBundle = {
		isFocused: boolean;
		radios: TChRbGroup;
		selected: HTMLInputElement | undefined;
	};
	let s = $state({
		isFocused: false,
		isDisabled: false,
		radios: [],
		selected: undefined
	});

	export function reset() {
		for (const radio of s.radios as HTMLInputElement[]) {
			radio.checked = false;
		}
	}

	function dispatchValue(triggerEvent: TReportOn) {
		if (!onValueChange) {
			return;
		}
		let triggers: string[] = [];
		if (Array.isArray(reportOn)) {
			triggers = reportOn;
		} else if (typeof reportOn === 'string') {
			triggers = reportOn.split('|').map((t) => t.trim());
		}

		if (triggers.includes(triggerEvent)) {
			onValueChange(selectedValue);
		}
	}
	function handleChange(e: Event) {
		selectedValue = (e.target as HTMLInputElement).value;
		if (reportOn.includes('change')) {
			dispatchValue('change');
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (reportOn.includes(e.key as TReportOn)) {
			dispatchValue(e.key as TReportOn);
		}
	}

	function handleFocusBlur(e: FocusEvent) {
		s.isFocused = e.type === 'focus';

		if (reportOn.includes(e.type as TReportOn)) {
			dispatchValue(e.type as TReportOn);
		}
	}
	function disableRadio() {
		if (!radioValue || !radioValueSet.has(radioValue)) {
			console.log('not a valid name');
			return;
		}
		if (disabledButtons.includes(radioValue)) {
			disabledButtons = disabledButtons.filter((rb) => rb !== radioValue);
		} else {
			disabledButtons.push(radioValue);
		}
	}
	onMount(async () => {
		await tick();
		const el = document.querySelector(
			`input[type='radio'][value='${selected}']` // Removed :checked
		) as HTMLInputElement;

		if (el) el.checked = true;
	});
</script>

<div class="grid-container">
	<!-- Left Side: Radio Group -->
	<div
		bind:this={crInputContainer}
		class="cr-input-container {className} {s.isDisabled ? 'disabled' : ''}"
	>
		<div class="radio-wrapper" role="presentation">
			<!-- {#key radioList} -->
			{#each radioList as item (item.value)}
				<label class="radio-label" class:isDisabled={item.isDisabled}>
					<input
						type="radio"
						name="cr-radio-group"
						value={item.value}
						bind:group={selectedValue}
						checked={item.checked}
						disabled={item.isDisabled}
						onchange={handleChange}
					/>
					<span>{item.label}</span>
				</label>
			{/each}
			<!-- {/key} -->
		</div>
	</div>

	<!-- Right Side: Thumbnail & Dynamic Popout Overlay -->
	<div class="thumbnail-wrapper">
		<!-- Small base thumbnail -->
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

		<!-- Svelte 5 conditional render: Large overlapping image copy -->
		{#if isZoomed}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
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
		<input type="text" bind:value={radioValue} placeholder="Radio value string" />
		<button onclick={disableRadio}>toggle disabled by name</button>
		<pre>At child. Disabled radio buttons
{JSON.stringify(disabledButtons, null, 2)}
</pre>
	</div>
</div>

<style lang="scss">
	.radio-label {
		cursor: pointer;
	}
	.grid-container {
		display: grid;
		grid-template-columns: 18rem 6.5rem;
		align-items: start;
		column-gap: 2rem;
	}
	.below {
		grid-column: 1 / span 2;
	}

	/* Wrapper keeps the absolute overlay anchored to the second column slot */
	.thumbnail-wrapper {
		margin-top: 0.9rem;
		position: relative;
		display: inline-block;
	}

	.thumbnail-img {
		cursor: zoom-in;
		display: block;
	}

	/* Shared dimensions configuration for perfect tracking alignment */
	%overlay-dimensions {
		position: absolute;
		top: 0px;
		left: -320px;
		width: 420px; /* Your new target width */
		height: auto;
		aspect-ratio: 400 / 300; /* Force aspect ratio matching the source snippet */
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
		z-index: 101; /* Sits directly on top of the image */
		background: transparent; /* Totally hidden to the eye */
		cursor: zoom-out;
	}
</style>
