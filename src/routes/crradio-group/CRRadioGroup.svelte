<script lang="ts" module>
	export function capitalizeText(str: string): string {
		return str
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/\b\w/g, (char) => char.toUpperCase());
	}
</script>

<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { fade } from 'svelte/transition';

	interface PROPS extends Partial<HTMLInputAttributes> {
		caption?: string;
		radios: TRadioGroup;
		reportOn?: TReportOnInput;
		value?: string;
		onValueChange?: TCallback;
		disabledButtons?: string[];
		style?: string;
	}

	let {
		caption = '',
		radios = {},
		reportOn = 'change|focus|keypress',
		value = $bindable(''),
		onValueChange,
		disabledButtons = $bindable(['Lila']),
		style = '',
		class: className = '',

		...restProps
	}: PROPS = $props();

	let radioValue = $state(''); // from input box to find radio box by value
	// Svelte 5 Reactive State for managing the zoomed image overlay
	let isZoomed = $state(false);
	// Parse radios object into a clean array, replacing empty keys with values
	let radioList = $derived(
		Object.entries(radios).map(([labelKey, val]) => ({
			label: labelKey.trim() === '' ? val : labelKey,
			value: val,
			isDisabled: disabledButtons.includes(val)
		}))
	);

	let radioValueSet = $derived(new Set(Object.values(radioList).map((el) => el.value)));
	type TRadioBundle = {
		isFocused: boolean;
		redios: Array<HTMLInputElement> | [];
		selected: HTMLInputElement | undefined;
	};
	let s = $state({
		isFocused: false,
		isDisabled: false,
		radios: [],
		selected: undefined
	});

	let prettyCaption = $derived(capitalizeText(caption));

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
			onValueChange(value);
		}
	}
	function handleChange(e: Event) {
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
		console.log(disabledButtons);
	}
</script>

<div class="grid-container">
	<!-- Left Side: Radio Group -->
	<div class="cr-input-container {className} {s.isDisabled ? 'disabled' : ''}">
		<div class="radio-wrapper" role="presentation">
			{#key radioList}
				{#each radioList as item (item.value)}
					<label class="radio-label" class:isDisabled={item.isDisabled}>
						<input
							type="radio"
							name="cr-radio-group"
							value={item.value}
							bind:group={value}
							checked={value === item.value}
							disabled={item.isDisabled}
							onchange={handleChange}
						/>
						<span>{item.label}</span>
					</label>
				{/each}
			{/key}
		</div>
	</div>

	<!-- Right Side: Thumbnail & Dynamic Popout Overlay -->
	<div class="thumbnail-wrapper">
		<!-- Small base thumbnail -->
		<img
			src="/CRIRadioGroup-instantiation.png"
			alt="Instantiation code snippet summary"
			width="100"
			height="auto"
			class="thumbnail-img"
			onmouseenter={() => (isZoomed = true)}
		/>

		<!-- Svelte 5 conditional render: Large overlapping image copy -->
		{#if isZoomed}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img
				src="/CRIRadioGroup-instantiation.png"
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
		margin-top: 1.3rem;
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
