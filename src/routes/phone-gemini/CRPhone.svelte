<script lang="ts" module>
	const commaKeyMessage = 'press comma key to enter extension';
	export const phoneFormat = 'in format xxx-xxx-xxxx, ext. xx';

	export function capitalizeText(str: string): string {
		return str
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/\b\w/g, (char) => char.toUpperCase());
	}

	export function formatPhoneNumber(rawValue: string): string {
		const digits = rawValue.replace(/\D/g, '');
		const mainDigits = digits.slice(0, 10);
		const extDigits = digits.slice(10, 15);

		let formatted = mainDigits;

		// Progressive formatting: append dash as soon as 3 or 6 digits are reached
		if (mainDigits.length >= 6) {
			formatted = `${mainDigits.slice(0, 3)}-${mainDigits.slice(3, 6)}-${mainDigits.slice(6)}`;
		} else if (mainDigits.length >= 3) {
			formatted = `${mainDigits.slice(0, 3)}-${mainDigits.slice(3)}`;
		}

		// Handle extension triggering
		if (rawValue.includes(',') || extDigits.length > 0) {
			formatted += `, ext. ${extDigits}`;
		}

		return formatted;
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { setCssVarColor } from '$lib/utils/client-helpers';

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
	let placeholder = $state('');
	const REFORMAT = 'DONE? Hit Enter to reformat';
	let reformat = $state('');

	let errorMessage = $derived.by(() => {
		if (!isDirty && !isFocused) return '';
		if (value.length === 12) {
			return commaKeyMessage;
		}
		if (reformat) {
			return REFORMAT;
		}
		return reformat ? reformat : isErroneous ? isErroneous(value) : '';
	});

	let prettyLabel = $derived(capitalizeText(label));
	let isLabelFloating = $derived(
		isFocused || value.length > 0 || errorMessage.length > 0 || placeholder
	);
	let hasError = $derived(Boolean(errorMessage) && errorMessage !== commaKeyMessage);

	export function reset() {
		value = '';
		isDirty = false;
		isFocused = false;
	}

	function dispatchValue(triggerEvent: typeof reportOn) {
		if (reportOn === triggerEvent && onValueChange) {
			onValueChange(value);
		}
	}

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();

		// 1. Get plain text from clipboard
		const pastedText = e.clipboardData?.getData('text') || '';
		// console.log('pastedText', pastedText);
		// 2. Extract digits only
		const digits = pastedText.replace(/\D/g, '');
		if (!digits) return;

		const mainDigits = digits.slice(0, 10);
		const extDigits = digits.slice(10, 15);

		// 3. Format the main phone number
		let formatted = mainDigits;
		if (mainDigits.length >= 6) {
			formatted = `${mainDigits.slice(0, 3)}-${mainDigits.slice(3, 6)}-${mainDigits.slice(6)}`;
		} else if (mainDigits.length >= 3) {
			formatted = `${mainDigits.slice(0, 3)}-${mainDigits.slice(3)}`;
		}

		// 4. Attach extension if more than 10 digits were pasted or if 'ext' was in the text
		const hasExtKeyword = /ext|x|,/i.test(pastedText);
		if (extDigits.length > 0 || (mainDigits.length === 10 && hasExtKeyword)) {
			formatted += `, ext. ${extDigits}`;
		}

		// 5. Update Svelte state
		value = formatted;
		isDirty = true;

		// 6. Move cursor to the end of the newly formatted string
		tick().then(() => {
			const input = e.target as HTMLInputElement;
			input.setSelectionRange(value.length, value.length);
		});

		dispatchValue('keyup');
	}
	function handleInput(e: Event) {
		if (reformat) {
			// console.log('handleInput reformat');
			return;
		}
		const input = e.target as HTMLInputElement;
		const rawValue = input.value;
		const oldCursor = input.selectionStart || 0;

		const digitsBeforeCursor = rawValue.slice(0, oldCursor).replace(/\D/g, '').length;
		const formatted = formatPhoneNumber(rawValue);

		value = formatted;
		if (value.length > 0) isDirty = true;

		tick().then(() => {
			let newCursor = 0;

			// Case A: Just appended ", ext. " -> jump cursor to the very end
			if (formatted.endsWith(', ext. ')) {
				newCursor = formatted.length;
			}
			// Case B: General digit-mapping cursor tracking
			else {
				let digitCount = 0;
				for (let i = 0; i < formatted.length; i++) {
					if (/\d/.test(formatted[i])) digitCount++;
					if (digitCount === digitsBeforeCursor) {
						newCursor = i + 1;
						break;
					}
				}

				// Check if a dash immediately follows the current cursor position and jump over it
				if (formatted[newCursor] === '-') {
					newCursor++;
				}

				if (digitsBeforeCursor === 0) newCursor = 0;
				else if (digitCount < digitsBeforeCursor) newCursor = formatted.length;
			}

			input.setSelectionRange(newCursor, newCursor);
		});

		dispatchValue('keyup');
	}

	function handleKeyup(e: KeyboardEvent) {
		if (reformat) {
			// console.log('handleKeyup reformat');
			return;
		}
		if (e.key === 'Backspace') {
			if (/(, |-)$/.test(value)) {
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
	function handleKeydown(e: KeyboardEvent) {
		const el = e.target as HTMLInputElement;
		if (e.key === 'Enter' && reformat) {
			reformat = '';
			setCssVarColor('--cr-input-placeholder-color', 'crimson');
			tick().then(() => {
				return new Promise((resolve) => setTimeout(resolve, 300));
			});
			value = formatPhoneNumber(el.value);
			const pos = el.value.length;
			el.setSelectionRange(pos, pos);
		}
		const digits = el.value.replace(/\D/g, '');
		// Inside handleKeydown in CRPhone.svelte
		if (e.key === ',') {
			const isAtEnd = el.selectionStart === value.length;
			// Only allow comma if we have 10 digits and the cursor is at the very end
			if (digits.length === 10 && isAtEnd && !value.endsWith(',')) {
				return; // Allow comma insertion
			}
			e.preventDefault(); // Block comma everywhere else
		}

		// 1. Atomic Backspacing for ", ext. "
		if (e.key === 'Backspace') {
			// console.log('it is backspace');
			if ((el.selectionStart as number) <= 12) {
				if (el.value.length > 12) {
					// console.log('keydown inside number');
					reformat = REFORMAT;
					isDirty = true;
					tick().then(() => {
						return new Promise((resolve) => setTimeout(resolve, 300));
					});
					setCssVarColor('--cr-input-placeholder-color', 'green');
					tick().then(() => {
						return new Promise((resolve) => setTimeout(resolve, 300));
					});
					return;
				}
			}
			const extIndex = value.indexOf(', ext. ');
			if (extIndex !== -1 && el.selectionStart === extIndex + 7) {
				e.preventDefault();
				value = value.slice(0, extIndex);
				dispatchValue('keyup');
				return;
			}
		}

		// 2. Allow Navigation / System keys
		if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) {
			if (e.key === 'Enter') dispatchValue('Enter');
			return;
		}

		// 3. Prevent non-numeric key inputs except comma on 10-digit boundaries
		// const digits = value.replace(/\D/g, '');
		if (e.key === ',' && digits.length >= 10 && !value.includes(',')) {
			return; // Allow comma insertion
		}

		if (!/^[0-9]$/.test(e.key)) {
			e.preventDefault();
		}
	}

	function handleBlur() {
		// console.log('handleBlur');
		isFocused = false;
		// isDirty = true;  // at this state do not show message
		if (!value) {
			placeholder = 'Entry is required';
			setCssVarColor('--cr-input-placeholder-color', 'crimson');
		}
		tick().then(() => {
			return new Promise((resolve) => setTimeout(resolve, 300));
		});
		dispatchValue('blur');
	}

	function handleFocus() {
		// console.log('handleFocus');
		if (placeholder) {
			isDirty = false;
			// console.log('still placeholder?', placeholder);
			setCssVarColor('--cr-label-focus-color', '0066cc');
			tick().then(() => {
				return new Promise((resolve) => setTimeout(resolve, 300));
			});
		}
		isFocused = true;
		dispatchValue('focus');
	}
</script>

<div class={`cr-input-container ${className} ${isDisabled ? 'disabled' : ''}`}>
	<div class="input-wrapper">
		<input
			type="tel"
			class="cr-input"
			class:has-error={hasError}
			disabled={isDisabled}
			{value}
			{...restProps}
			oninput={handleInput}
			onkeyup={handleKeyup}
			onkeydown={handleKeydown}
			onpaste={handlePaste}
			onblur={handleBlur}
			onfocus={handleFocus}
			{placeholder}
		/>

		<label for="idSpan" class="floating-label" class:floating={isLabelFloating}>
			<span id="idSpan" class="label-text">{prettyLabel}</span>

			{#if errorMessage}
				<span
					class="error-text"
					title={errorMessage}
					style:color={errorMessage.includes('press comma') ? 'green' : 'crimson'}
				>
					&nbsp;{errorMessage}
				</span>
			{/if}
		</label>
	</div>
</div>

<style lang="scss">
	input::placeholder {
		color: var(--cr-input-placeholder-color);
	}
</style>
