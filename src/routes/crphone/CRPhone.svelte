<script lang="ts" module>
	export const phoneFormat = 'in format xxx-xxx-xxxx, ext. xx';
	export function capitalizeText(str: string): string {
		return str
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/\b\w/g, (char) => char.toUpperCase());
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import formatPhoneNumber from '$lib/utils/phone-number';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface PROPS extends Partial<HTMLInputAttributes> {
		label: string;
		reportOn?: 'Enter' | 'keyup' | 'blur' | 'focus';
		onValueChange?: (val: string) => void;
		value?: string;
		isDisabled?: boolean;
		isErroneous?: (val: string) => string;
	}

	let {
		label,
		reportOn = 'keyup',
		onValueChange,
		value = $bindable(''),
		class: className = '',
		isDisabled = false,
		isErroneous,

		...restProps
	}: PROPS = $props();

	let isFocused = $state(false);
	let isDirty = $state(false);
	let errorMessage = $derived.by(() => {
		if (!isDirty) return '';
		return isErroneous ? isErroneous(value) : '';
	});

	let prettyLabel = $derived(capitalizeText(label));
	const commaKeyMessage = 'press comma key to enter extension';
	// let isLabelFloating = $state(true);
	let isLabelFloating = $derived(isFocused || value.length > 0 || errorMessage.length > 0);
	let computedPlaceholder = $derived(
		!isFocused && value.length === 0 && isDirty ? `${prettyLabel} is required` : ''
	);

	export function reset() {
		value = ''; // Reset the bindable state
		isDirty = false; // Reset the visited flag
		errorMessage = ''; // Wipe away layout error traces
		isFocused = false; // Force focus state down
	}

	let hasError = $derived(Boolean(errorMessage));
	let hasValue = $derived(value.length > 0);

	function reportValue() {
		onValueChange?.(value);
	}

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		if (value.length > 0) isDirty = true;
		dispatchValue('keyup');

		// Capture the selection intervals before Svelte updates the DOM
		const start = input.selectionStart;
		const end = input.selectionEnd;

		value = input.value;

		tick().then(() => {
			input.setSelectionRange(start, end);
		});
	}

	function handleKeyup(e: KeyboardEvent) {
		if (e.key === 'Backspace') {
			if (value.endsWith(', ')) {
				value = value.slice(0, -2);
			}
			return;
		}
		if (value.length === 12) {
			errorMessage = commaKeyMessage;
		} else if (value.length === 13) {
			isErroneous?.(value);
		}

		value = formatPhoneNumber(value);

		onValueChange?.(value);

		if (e.key === 'Enter') {
			dispatchValue('Enter');
		}
	}

	function handleBlur() {
		isFocused = false;
		isDirty = true; // 👈 Element has officially been visited/blurred

		dispatchValue('blur');
	}

	function handleFocus() {
		isFocused = true;
		if (reportOn === 'focus') {
			reportValue();
		}
		dispatchValue('focus');
	}

	// Intercept keystrokes BEFORE they hit the input if restriction criteria exists
	function handleKeydown(e: KeyboardEvent) {
		// Allow control keys (Backspace, Delete, Arrows, Tab, Enter)
		if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) {
			return;
		}
		// Build a safe regex tester from the allowedChars string parameter
		if (value.length === 12 && e.key === ',') {
			return;
		}
		const regex = new RegExp(`^[0-9-,x]$`);
		if (!regex.test(e.key)) {
			e.preventDefault(); // Suppress the invalid key injection natively
		}
	}
	function dispatchValue(triggerEvent: typeof reportOn) {
		if (reportOn === triggerEvent && onValueChange) {
			onValueChange(value);
		}
	}
</script>

<div class={`cr-input-container ${className} ${isDisabled ? 'disabled' : ''}`}>
	<div class="input-wrapper">
		<input
			type="tel"
			class="cr-input"
			class:has-error={hasError}
			disabled={isDisabled}
			bind:value
			{...restProps}
			oninput={handleInput}
			onkeyup={handleKeyup}
			onblur={handleBlur}
			onfocus={handleFocus}
			onkeydown={handleKeydown}
		/>

		<label for="idSpan" class="floating-label" class:floating={isLabelFloating}>
			<span id="idSpan" class="label-text">
				{prettyLabel}
			</span>

			{#if errorMessage}
				<span
					class="error-text"
					title={errorMessage}
					style:color={errorMessage === commaKeyMessage ? 'green' : 'crimson'}
				>
					&nbsp;{errorMessage}
				</span>
			{/if}
		</label>
	</div>
</div>
