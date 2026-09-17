<script lang="ts" module>
	// Pure helper function to split camelCase/PascalCase and capitalize tokens
	// e.g., "phoneNumber" -> "Phone Number"
	// It tries to convert any char, event non-letter, preceding with witespace
	export function capitalizeText(str: string): string {
		return str.replace(/(?:^|\s)\S/g, (match) => match.toUpperCase()).replace(/\s{2,}/g, ' ');
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import formatPhoneNumber from '$lib/utils/phone-number';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface PROPS extends Partial<HTMLInputAttributes> {
		label: string; // e.g., "phoneNumber"
		reportOn?: 'Enter' | 'keyup' | 'blur' | 'focus';
		onValueChange?: (val: string) => void;
		value?: string;
		isDisabled?: boolean;
		isErroneous?: (val: string) => string;
	}
	// Capture custom props and group classes/styles into ...restProps
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

	// --- Internal Component State ---
	let isFocused = $state(false);
	let isDirty = $state(false);

	// 🎯 Reactive Validation Evaluation via $derived.by ---
	let errorMessage = $derived.by(() => {
		// 1. Never show errors on a clean, unvisited input
		if (!isDirty) return '';

		// 2. Fallback rule: Required check if field is completely blank
		if (value.trim() === '') {
			return 'input is missing';
		}

		// 3. Parent-driven custom validation check
		if (isErroneous) {
			return isErroneous(value);
		}

		return '';
	});

	// --- Derived Computations ---
	let prettyLabel = $derived(capitalizeText(label));
	const commaKeyMessage = 'press comma key to enter extension';

	// Computes whether the floating label should sit high up (active state)
	let isLabelFloating = $derived(isFocused || value.length > 0 || errorMessage.length > 0);

	// Computes placeholder string dynamically on blur
	let computedPlaceholder = $derived(
		!isFocused && value.length === 0 && isDirty ? `${prettyLabel} is required` : ''
	);

	export function reset() {
		value = ''; // Reset the bindable state
		isDirty = false; // Reset the visited flag
		errorMessage = ''; // Wipe away layout error traces
		isFocused = false; // Force focus state down
	}
	// --- Event Handling and Suppression Pipeline ---

	// 1. Intercept keystrokes BEFORE they hit the input if restriction criteria exists
	function handleKeyDown(e: KeyboardEvent) {
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

	// 3. Central reporter pipeline mapping string events to callback triggers
	function dispatchValue(triggerEvent: typeof reportOn) {
		// Trigger callback if the event matches user requirements
		if (reportOn === triggerEvent && onValueChange) {
			onValueChange(value);
		}
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

	function handleFocus() {
		isFocused = true;
		dispatchValue('focus');
	}
	function handleBlur() {
		isFocused = false;
		isDirty = true; // 👈 Element has officially been visited/blurred

		dispatchValue('blur');
	}
	function handlePhoneNumber() {
		if (isErroneous) {
			``;
			errorMessage = isErroneous(value);
		}
		// if (errorMessage){
		// 	return
		// }
		(value = value.replace(/[,-x]/g, '')).replace(
			/(\d{3,3})(\d{3,3})?(\d{4,4})?(\d{2,3})/,
			'$1-$2-$3,x$4'
		);
	}
	function handleKeyUp(e: KeyboardEvent) {
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
</script>

<!-- Outer element captures class/style overrides via standard rest extraction -->
<div class={`cr-input-container, ${className}`} class:disabled={isDisabled}>
	<div class="input-wrapper">
		<input
			type="text"
			id={label}
			disabled={isDisabled}
			{value}
			placeholder={computedPlaceholder}
			onkeydown={handleKeyDown}
			oninput={handleInput}
			onkeyup={handleKeyUp}
			onblur={handleBlur}
			onfocus={handleFocus}
			class:has-error={errorMessage.length > 0}
			{...restProps}
		/>

		<!-- Floating Label Container -->
		<label for={label} class="floating-label" class:floating={isLabelFloating}>
			<span class="label-text">{prettyLabel}</span>

			{#if errorMessage}
				<span
					class="error-text"
					title={errorMessage}
					style:color={errorMessage === commaKeyMessage ? 'green' : 'crimson'}
				>
					&nbsp; {errorMessage}
				</span>
			{/if}
		</label>
	</div>
</div>

<style lang="scss">
	:global(.main) {
		&.cr-input-container {
			display: inline-block;
			font-family: system-ui, sans-serif;
			width: 100%;
			margin-bottom: 1rem;
		}

		:global(.input-wrapper) {
			position: relative;
			margin-top: 1.25rem;
			:global(input) {
				width: 100%;
				box-sizing: border-box;
				padding: 6px 1rem;
				font-size: 1rem;
				border: 1px solid gray;
				border-radius: 4px;

				outline: none;
				transition:
					border-color 0.2s,
					box-shadow 0.2s;
			}

			:global(input:focus) {
				border-color: #0066cc;
				box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
			}

			:global(.error-text) {
				color: tomato;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: pre-wrap;
			}

			:global(.error-text input.has-error) {
				color: tomato;
			}

			:global(input::placeholder) {
				color: crimson;
				opacity: 0.5;
				font-size: 0.9rem;
				font-weight: 400;
			}
			:global(.floating-label) {
				position: absolute;
				left: 0.75rem;
				top: 50%;
				transform: translateY(-70%);
				background: white;
				padding: 0 0.25rem;
				color: #777;
				opacity: 0.6;
				pointer-events: none;
				transition:
					transform 0.2s ease,
					top 0.2s ease,
					font-size 0.2s ease,
					opacity 0.2s ease;
				max-width: calc(100% - 1.5rem);
				display: flex;
				white-space: nowrap;
			}

			:global(.floating-label.floating) {
				top: 0;
				font-size: 0.85rem;
				opacity: 1;
				color: #0066cc;
			}

			:global(.label-text) {
				flex-shrink: 0;
			}

			:global(.error-text) {
				color: tomato;
				font:
					italic 10px/1.5 Arial,
					sans-serif;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				pointer-events: auto;
				cursor: help;
			}

			:global(.disabled) {
				opacity: 0.5;
				pointer-events: none;
			}
		}
	}
</style>
