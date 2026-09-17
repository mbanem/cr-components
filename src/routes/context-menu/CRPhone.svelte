<script lang="ts" module>
	// Pure helper function to split camelCase/PascalCase and capitalize tokens
	// e.g., "phoneNumber" -> "Phone Number"
	// It tries to convert any char, event non-letter, preceding with witespace
	export function capitalizeText(str: string): string {
		return (
			str
				// Insert space before capital letters and lowercase letters following digits
				.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
				// Capitalize the first letter of every word
				.replace(/\b\w/g, (char) => char.toUpperCase())
		);
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
		console.log('inside CRPhone reset');
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

		// Perform your state update or value transformation
		value = input.value;

		// Force Svelte 5 to flush the DOM change, then restore the cursor position
		tick().then(() => {
			input.setSelectionRange(start, end);
		});
	}

	function handleKeyup(e: KeyboardEvent) {
		if (e.key === 'Backspace') {
			return;
		}
		if (value.length === 12) {
			errorMessage = commaKeyMessage;
		}
		tick().then(() => {
			return new Promise((resolve) => setTimeout(resolve, 100));
		});

		if (isErroneous && errorMessage !== commaKeyMessage) {
			errorMessage = isErroneous(value);
		}
		value = formatPhoneNumber(value);

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
		if (value.length === 12 && e.key !== ',') {
			e.preventDefault(); // Suppress the invalid key injection natively
			return;
		}
		// Build a safe regex tester from the allowedChars string parameter
		const regex = new RegExp(`^[0-9-,x]$`);
		if (!regex.test(e.key)) {
			console.log('invalid key');
			e.preventDefault(); // Suppress the invalid key injection natively
		}
	}

	function dispatchValue(triggerEvent: typeof reportOn) {
		// Trigger callback if the event matches user requirements
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
<button onclick={reset}>reset</button>
