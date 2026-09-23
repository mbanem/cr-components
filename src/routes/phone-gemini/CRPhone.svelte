<script lang="ts" module>
	const commaKeyMessage = 'press comma key for extension';
	export const phoneFormat = 'in format xxx-xxx-xxxx, ext. xx';
	export const REFORMAT = 'DONE? Hit Enter to reformat';
	export const isGreen = new RegExp(/(press comma|DONE\?)/);

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
		reportOn?: TReportOn;
		onValueChange?: (val: string) => void;
		value?: string;
		isDisabled?: boolean;
		isErroneous?: (val: string) => string;
	}

	let {
		label,
		reportOn = 'keyup|Enter|blur',
		onValueChange,
		value = $bindable(''),
		class: className = '',
		isDisabled = false,
		isErroneous,
		...restProps
	}: PROPS = $props();

	let s = $state({
		isFocused: false,
		isDirty: false,
		placeholder: '',
		reformat: ''
	});

	let errorMessage = $derived.by(() => {
		if (!s.isDirty && !s.isFocused) return '';
		if (value.length === 12) {
			return commaKeyMessage;
		}
		if (s.reformat) {
			return REFORMAT;
		}
		return s.reformat ? s.reformat : isErroneous ? isErroneous(value) : '';
	});

	let prettyLabel = $derived(capitalizeText(label));
	let isLabelFloating = $derived(
		s.isFocused || value.length > 0 || errorMessage.length > 0 || s.placeholder
	);
	let hasError = $derived(
		Boolean(errorMessage) && errorMessage !== commaKeyMessage && errorMessage !== REFORMAT
	);

	export function reset() {
		value = '';
		s.isDirty = false;
		s.isFocused = false;
	}

	function dispatchValue(triggerEvent: TReportOn) {
		if (reportOn.includes(triggerEvent) && onValueChange) {
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
		s.isDirty = true;

		// 6. Move cursor to the end of the newly formatted string
		tick().then(() => {
			const input = e.target as HTMLInputElement;
			input.setSelectionRange(value.length, value.length);
		});
		if (reportOn.includes('paste')) {
			dispatchValue('paste' as TReportOn);
		}
	}
	function handleInput(e: Event) {
		if (s.reformat) {
			// console.log('handleInput reformat');
			return;
		}
		const el = e.target as HTMLInputElement;
		const rawValue = el.value;
		const oldCursor = el.selectionStart || 0;

		const digitsBeforeCursor = rawValue.slice(0, oldCursor).replace(/\D/g, '').length;
		const formatted = formatPhoneNumber(rawValue);

		value = formatted;
		if (value.length > 0) s.isDirty = true;

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

			el.setSelectionRange(newCursor, newCursor);
		});
		if (reportOn.includes(e.type)) {
			dispatchValue(e.type as TReportOn);
		}
	}

	function handleKeyup(e: KeyboardEvent) {
		if (s.reformat) {
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

		if (reportOn.includes(e.key)) {
			dispatchValue(e.key as TReportOn);
		}
	}
	function handleKeydown(e: KeyboardEvent) {
		const el = e.target as HTMLInputElement;
		if (e.key === 'Enter' && s.reformat) {
			s.reformat = '';
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
					s.reformat = REFORMAT;
					s.isDirty = true;
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
				// dispatchValue('keyup');
				return;
			}
		}

		// 2. Allow Navigation / System keys
		if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) {
			// if (e.key === 'Enter') dispatchValue('Enter');
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

	function handleBlur(e: FocusEvent) {
		// console.log('handleBlur');
		s.isFocused = false;
		// s.isDirty = true;  // at this state do not show message
		if (!value) {
			s.placeholder = 'Entry is required';
			setCssVarColor('--cr-input-placeholder-color', 'crimson');
		}
		tick().then(() => {
			return new Promise((resolve) => setTimeout(resolve, 300));
		});
		if (reportOn.includes(e.type)) {
			dispatchValue(e.type as TReportOn);
		}
	}

	function handleFocus(e: FocusEvent) {
		// console.log('handleFocus');
		// if (s.placeholder) {
		s.isDirty = false;
		console.log('still placeholder?', s.placeholder);
		setCssVarColor('--cr-label-focus-color', '0066cc');
		tick().then(() => {
			return new Promise((resolve) => setTimeout(resolve, 300));
		});

		s.isFocused = true;
		if (reportOn.includes(e.type)) {
			dispatchValue(e.type as TReportOn);
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
			{value}
			{...restProps}
			oninput={handleInput}
			onkeyup={handleKeyup}
			onkeydown={handleKeydown}
			onpaste={handlePaste}
			onblur={handleBlur}
			onfocus={handleFocus}
			placeholder={s.placeholder}
		/>

		<label for="idSpan" class="floating-label" class:floating={isLabelFloating}>
			<span id="idSpan" class="label-text" class:floating={isLabelFloating}>
				{prettyLabel}
			</span>

			{#if errorMessage}
				<span title={errorMessage} style:color={isGreen.test(errorMessage) ? 'green' : 'crimson'}>
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
