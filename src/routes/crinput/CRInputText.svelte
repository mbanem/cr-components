<script lang="ts" module>
	// Pure helper function to split camelCase/PascalCase and capitalize tokens
	// e.g., "firstName" -> "First Name"
	export function capitalizeText(str: string): string {
		return str.replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
		// return str
		// 	.replace(/([A-Z])/g, ' $1')
		// 	.replace(/^./, (str) => str.toUpperCase())
		// 	.trim();
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type TCapitalize = 'lowercase' | 'uppercase' | 'capitalize' | 'none';
	type PropType = 'text'; // Scalable if you introduce 'textarray' later

	interface PROPS extends Partial<HTMLInputAttributes> {
		label: string; // e.g., "firstName"
		reportOn?: 'Enter' | 'keyup' | 'blur' | 'focus';
		onValueChange?: (val: string) => void;
		capitalize?: TCapitalize;
		value?: string;
		isDisabled?: boolean;
		allowedChars?: string; // e.g., "0-9" or "a-zA-Z " (regex string)
		isErroneous?: (val: string) => string;
	}
	// & Omit<HTMLInputAttributes, 'value' | 'type' | 'disabled' | 'placeholder'>;

	// Capture custom props and group classes/styles into ...restProps
	let {
		label,
		reportOn = 'keyup',
		onValueChange,
		capitalize = 'none',
		value = $bindable(''),
		isDisabled = false,
		allowedChars = '',
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
		if (!allowedChars) return;

		// Allow control keys (Backspace, Delete, Arrows, Tab, Enter)
		if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;

		// Build a safe regex tester from the allowedChars string parameter
		const regex = new RegExp(`^[${allowedChars}]$`);
		if (!regex.test(e.key)) {
			e.preventDefault(); // Suppress the invalid key injection natively
		}
	}

	// 2. Format inputs dynamically on change before emitting to parents
	// function applyCapitalization(val: string): string {
	// 	if (capitalize === 'lowercase') return val.toLowerCase();
	// 	if (capitalize === 'uppercase') return val.toUpperCase();
	// 	if (capitalize === 'capitalize') {
	// 		// Capitalize first letter and any letter following whitespace
	// 		return val.replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
	// 	}
	// 	return val;
	// }
	export function applyCapitalization(str: string) {
		switch (capitalize) {
			case 'lowercase':
				return str.replace(/./g, (str) => str.toLowerCase());

			case 'uppercase':
				return str.replace(/./g, (str) => str.toUpperCase());
			case 'capitalize':
				return (str = capitalizeText(str));
			default:
				return str;
		}
	}

	// 3. Central reporter pipeline mapping string events to callback triggers
	function dispatchValue(triggerEvent: typeof reportOn) {
		value = applyCapitalization(value);

		// Trigger callback if the event matches user requirements
		if (reportOn === triggerEvent && onValueChange) {
			onValueChange(value);
		}
	}

	function handleInput(e: Event) {
		const input = e.target as HTMLInputElement;
		value = applyCapitalization(input.value);
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
	function handleKeyUp(e: KeyboardEvent) {
		const input = e.target as HTMLInputElement;
		value = applyCapitalization(input.value);
		if (e.key === 'Enter') {
			dispatchValue('Enter');
		}
	}
</script>

<!-- Outer element captures class/style overrides via standard rest extraction -->
<div class="cr-input-container" class:disabled={isDisabled} {...restProps}>
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
		/>

		<!-- Floating Label Container -->
		<label for={label} class="floating-label" class:floating={isLabelFloating}>
			<span class="label-text">{prettyLabel}</span>

			{#if errorMessage}
				<span class="error-text" title={errorMessage}>
					&nbsp; {errorMessage}
				</span>
			{/if}
		</label>
	</div>
</div>

<style>
	/* Native CSS variables keep all parallel elements securely scoped */
	.cr-input-container {
		display: inline-block;
		font-family: system-ui, sans-serif;
		width: 100%;
		margin-bottom: 1rem;
	}

	.input-wrapper {
		position: relative;
		margin-top: 1.25rem; /* Leaves reliable headroom for the floating action */
	}

	input {
		width: 100%;
		box-sizing: border-box;
		padding: 0.75rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		background: transparent;
		outline: none;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	input:focus {
		border-color: #0066cc;
		box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
	}

	.error-text {
		color: tomato;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.error-text input.has-error {
		color: tomato;
	}

	input::placeholder {
		/* color: #aa0000; */
		opacity: 0.7;
		font-size: 0.9rem;
	}

	/* CSS Floating Label Layer Calculations */
	.floating-label {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
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

	/* Raised / Anchored style above input element boundary rules */
	.floating-label.floating {
		top: 0;
		font-size: 0.85rem;
		opacity: 1;
		color: #0066cc;
	}

	/* input.has-error ~ .floating-label.floating {
		color: #cc0000;
	} */

	.label-text {
		flex-shrink: 0;
	}

	/* Auto truncation logic for overflow error text layouts */
	.error-text {
		color: tomato;
		/* font: 12px italic !important; */
		font:
			italic 10px/1.5 Arial,
			sans-serif;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		pointer-events: auto; /* Re-enable pointer events for native browser hover title tooltip */
		cursor: help;
	}

	.disabled {
		opacity: 0.5;
		pointer-events: none;
	}
</style>
