<script lang="ts" module>
	const commaKeyMessage = 'press comma key for extension';
	export const phoneFormat =
		'in format xxx-xxx-xxxx, ext. xx\nwith text-overflow: ellipsis;\nfor demonstration purposes';
	export const REFORMAT = 'DONE? Hit Enter to reformat';
	export const REQUIRED = 'Entry is required';
	export const isGreen = new RegExp(/(press comma|DONE\?)/);
	export const MAXLENGTHMSG = 'maximum length reached';
	export const MAXLENGTH = 24;

	export function capitalizeText(str: string): string {
		return str
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/\b\w/g, (char) => char.toUpperCase());
	}

	// export function formatPhoneNumber(rawValue: string): string {
	// 	const digits = rawValue.replace(/\D/g, '');
	// 	const mainDigits = digits.slice(0, 10);
	// 	const extDigits = digits.slice(10, 15);

	// 	let formatted = mainDigits;

	// 	// Progressive formatting: append dash as soon as 3 or 6 digits are reached
	// 	if (mainDigits.length >= 6) {
	// 		formatted = `${mainDigits.slice(0, 3)}-${mainDigits.slice(3, 6)}-${mainDigits.slice(6)}`;
	// 	} else if (mainDigits.length >= 3) {
	// 		formatted = `${mainDigits.slice(0, 3)}-${mainDigits.slice(3)}`;
	// 	}

	// 	// Handle extension triggering
	// 	if (rawValue.includes(',') || extDigits.length > 0) {
	// 		formatted += `, ext. ${extDigits}`;
	// 	}

	// 	return formatted;
	// }
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { setCssVarColor, formatPhoneNumber } from '$lib/utils/client-helpers';

	interface PROPS extends Partial<HTMLInputAttributes> {
		label: string;
		reportOn?: TReportOn;
		onValueChange?: (val: string) => void;
		value?: string;
		isDisabled?: boolean;
		isRequired?: boolean;
		isErroneous?: (val: string) => string;
	}

	// 	// ✅ Valid: Piped string formats
	// const singleEvent: TReportOn = 'Enter';
	// const multipleEvents: TReportOn = 'input|change|blur';

	// // ✅ Valid: Array formats
	// const arrayEvents: TReportOn = ['Enter', 'input', 'change'];
	// const singleEventArray: TReportOn = ['blur'];

	// const badString: TReportOn = 'Enter|imput|change';
	// const badArray: TReportOn = ['Enter', 'imput', 'change'];
	let {
		label,
		reportOn = 'keyup|Enter|blur', //['keyup', 'Enter', 'blur'],
		onValueChange,
		value = $bindable(''),
		class: className = '',
		isDisabled = false,
		isRequired = false,
		isErroneous,
		...restProps
	}: PROPS = $props();
	let inputEl: HTMLInputElement | undefined = undefined;

	let selectionStart = $derived.by(() => {
		if (!inputEl) return 0;
		return inputEl?.selectionStart as number;
	});
	// let selectionEnd = $derived.by(() => {
	// 	if (!inputEl) return 0;
	// 	return inputEl?.selectionStart as number;
	// });
	// $effect(() => {
	// 	selectionStart = inputEl?.selectionStart as number;
	// 	selectionEnd = inputEl?.selectionEnd as number;
	// });
	// states for managing what CSS classes become active
	// like label translating up/down based on  isFocused
	// message apperance based on isDirty
	// placehodler holding tetxt or being empty and
	// reformat forcing special message when updating in the
	// middle part of phone number destroying the format
	let s = $state({
		isFocused: false,
		isDirty: false,
		placeholder: '',
		reformat: ''
	});
	let maxLengthMsg = $state(MAXLENGTHMSG);
	const log = console.log;
	let imgPath = '/phone-number-setup.png';
	let timer: ReturnType<typeof setTimeout>;
	let isZoomed = $state(false);
	let isInTheMiddle = $state(false);

	let valueBeforeInTheMiddle = '';

	function checkCaretPosition() {
		if (!inputEl) return;

		const start = inputEl.selectionStart ?? 0;
		const end = inputEl.selectionEnd ?? 0;
		const len = value.length;

		// Caret is in the middle if selection is anywhere before the very end of the text
		isInTheMiddle = start < len || end < len;
		if (isInTheMiddle) {
			if (!valueBeforeInTheMiddle) {
				valueBeforeInTheMiddle = value;
			} else if (valueBeforeInTheMiddle !== value) {
				s.reformat = REFORMAT;
			}
			s.isDirty = true;
		} else {
			valueBeforeInTheMiddle = '';
		}
	}
	function isValid() {
		return /^(\d{3})-\d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}, ext\. \d{1,5}$/.test(value);
	}
	function clearMaxLengthMsg() {
		maxLengthMsg = '';
	}
	let errorMessage = $derived.by(() => {
		if (!s.isDirty && !s.isFocused) return ''; // inital page state
		if (value.length === 12 && inputEl?.selectionStart === 12) {
			return s.isFocused ? commaKeyMessage : '';
		}
		if (s.isDirty && s.isFocused && !value) {
			return '';
		}
		if (s.reformat) {
			// 			log('errorMessage REFORMAT');
			return REFORMAT;
		}
		if (value.length === MAXLENGTH && maxLengthMsg) {
			// log('trying maxlength');
			setTimeout(() => {
				clearMaxLengthMsg();
			}, 2000);

			return maxLengthMsg;
		}
		return s.reformat ? s.reformat : isErroneous ? isErroneous(value) : '';
	}) as string;

	let prettyLabel = $derived(capitalizeText(label));
	let isLabelFloating = $derived(
		s.isFocused || value.length > 0 || errorMessage.length > 0 || s.placeholder
	);
	let hasError = $derived(
		(Boolean(errorMessage) && errorMessage !== commaKeyMessage && errorMessage !== REFORMAT) ||
			(!s.isFocused && !value) ||
			errorMessage.length > 31
	);

	export function reset() {
		value = '';
		s.isDirty = false;
		s.isFocused = false;
	}

	function dispatchValue(eventType: TSingleReportOn) {
		if (reportOn.includes(eventType as TSingleReportOn) && onValueChange) {
			// log('dipatch for', eventType);
			onValueChange(value);
		} else {
			// log('no dispatch', eventType);
		}
	}

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();

		// 1. Get plain text from clipboard
		const pastedText = e.clipboardData?.getData('text') || '';
		s.isDirty = true;
		// log('pastedText', pastedText);
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

		// 6. Move cursor to the end of the newly formatted string
		tick().then(() => {
			const input = e.target as HTMLInputElement;
			input.setSelectionRange(value.length, value.length);
		});
		if (reportOn.includes('paste')) {
			dispatchValue('paste' as TSingleReportOn);
		}
	}
	function handleInput(e: Event | KeyboardEvent) {
		// log('handleInput entry', value);
		// if (isInTheMiddle) return;
		// if (s.reformat) {
		// 	// log('handleInput reformat');
		// 	return;
		// }
		const el = e.target as HTMLInputElement;
		const rawValue = el.value;
		const oldCursor = el.selectionStart || 0;

		const digitsBeforeCursor = rawValue.slice(0, oldCursor).replace(/\D/g, '').length;
		const formatted = formatPhoneNumber(rawValue);

		if (isInTheMiddle && e.key !== 'Backspace') {
			return;
		}
		if (!isInTheMiddle) {
			value = formatted;
		}
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

		if (reportOn.includes(e.type as TSingleReportOn)) {
			dispatchValue(e.type as TSingleReportOn);
		}
		// log('handleInput exit', value);
	}

	function handleKeydown(e: KeyboardEvent) {
		// log('handleKetdown entry', value);
		const el = e.target as HTMLInputElement;

		// if maximum number of characters is reached ignore keystrokes
		if (value.length === MAXLENGTH && e.key !== 'Backspace') {
			maxLengthMsg = MAXLENGTHMSG;
			e.preventDefault();
			return;
		}
		if (e.key === 'Enter' && s.reformat) {
			// log('reformating');
			s.reformat = '';
			// setCssVarColor('--cr-input-placeholder-color', 'crimson');
			tick().then(() => {
				return new Promise((resolve) => setTimeout(resolve, 300));
			});
			// log('enter & reformat');
			value = formatPhoneNumber(el.value);
			const pos = el.value.length;
			el.setSelectionRange(pos, pos);
			return;
		}
		const digits = el.value.replace(/\D/g, '');
		// Inside handleKeydown in CRPhone.svelte
		if (e.key === ',') {
			// log('comma entered');
			const isAtEnd = el.selectionStart === value.length;
			// Only allow comma if we have 10 digits and the cursor is at the very end
			if (digits.length === 10 && isAtEnd && !value.endsWith(',')) {
				// log('handleKeydown comma in right place');
				return; // Allow comma insertion
			}
			// log('handleKeydown prevent comma not right place');
			e.preventDefault(); // Block comma everywhere else
		}

		// 1. Atomic Backspacing for ", ext. "
		if (e.key === 'Backspace') {
			// log('handleKeydown backspace');
			if ((el.selectionStart as number) <= 12) {
				if (el.value.length > 12) {
					if (isValid()) {
						// log('handleKeydown clear reformat');
						s.reformat = '';
					} else {
						// 						log('keydown inside number REFORMAT');
						s.reformat = REFORMAT;
						s.isDirty = true;
					}
					tick().then(() => {
						return new Promise((resolve) => setTimeout(resolve, 300));
					});
					setCssVarColor('--cr-input-placeholder-color', 'green');
					tick().then(() => {
						return new Promise((resolve) => setTimeout(resolve, 300));
					});
					return;
				} else if (!value) {
					// setCssVarColor('--cr-input-placeholder-color', 'crimson'); 1)
					s.reformat = '';
				}
			}
			const extIndex = value.indexOf(', ext. ');
			if (extIndex !== -1 && el.selectionStart === extIndex + 7) {
				e.preventDefault();
				// log('handleKeydown slice too long');
				value = value.slice(0, extIndex);
				// dispatchValue('keyup');
				return;
			}
		}

		// 2. Allow Navigation / System keys
		if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) {
			// log('handleKeydown contole keys');
			// if (e.key === 'Enter') dispatchValue('Enter');
			return;
		}

		// 3. Prevent non-numeric key inputs except comma on 10-digit boundaries
		// const digits = value.replace(/\D/g, '');
		if (e.key === ',' && digits.length >= 10 && !value.includes(',')) {
			// log('handleKeydown comma already used');
			return; // Allow comma insertion
		}

		if (!/^[0-9]$/.test(e.key)) {
			e.preventDefault();
		}
		// log('handleKeydown exit', value);
	}

	function handleKeyup(e: KeyboardEvent) {
		// log('handleKeyup entry', value);
		// if (isInTheMiddle) return;
		if (s.reformat) {
			// log('handleKeyup reformat');
			return;
		}
		if (e.key === 'Backspace') {
			// log('handleKeyup backspace');
			if (/(, |-)$/.test(value)) {
				// log('backspace 2 chars');
				value = value.slice(0, -2);
				// log('handleKeyup clear 2 chars');
			} else {
				// log('we copy input inti value??');
				value = inputEl?.value as string;
			}
			if (!value) {
				setCssVarColor('--cr-input-placeholder-color', 'crimson');
			}
			dispatchValue(e.type as TSingleReportOn);
			return;
		}
		if (value.length === 12) {
			// errorMessage = commaKeyMessage;
		} else if (value.length === 13) {
			isErroneous?.(value);
		}
		if (!isInTheMiddle) {
			// log('handleKeyup format');
			value = formatPhoneNumber(value);
		}

		onValueChange?.(value);

		if (reportOn.includes(e.key as TSingleReportOn)) {
			dispatchValue(e.key as TSingleReportOn);
		}
		// log('handleKeyup exit', value);
	}

	function handleBlur(e: FocusEvent) {
		// log('handleBlur');
		s.isFocused = false;
		s.isDirty = true; // at this state do not show message
		tick().then(() => {
			const input = e.target as HTMLInputElement;
			input.setSelectionRange(value.length, value.length);
		});
		if (!value) {
			// 			log('blur set REQUIRED');
			s.placeholder = REQUIRED;
			setCssVarColor('--cr-input-placeholder-color', 'crimson');
		}
		tick().then(() => {
			return new Promise((resolve) => setTimeout(resolve, 300));
		});
		if (reportOn.includes(e.type as TSingleReportOn)) {
			dispatchValue(e.type as TSingleReportOn);
		}
	}

	function handleFocus(e: FocusEvent) {
		// log('handleFocus');
		// if (s.placeholder) {
		// s.isDirty = false;
		s.isFocused = true;
		if (value.length === 12 && inputEl?.selectionStart === 12) {
			// log('focus 12');
			s.isDirty = true;
		}
		setCssVarColor('--cr-label-focus-color', '0066cc');
		tick().then(() => {
			return new Promise((resolve) => setTimeout(resolve, 300));
		});

		if (reportOn.includes(e.type as TSingleReportOn)) {
			dispatchValue(e.type as TSingleReportOn);
		}
		// log('fandleFocus isDirty?', s.isDirty);
	}
</script>

<p>
	middle {isInTheMiddle} value {value}
</p>
<div class="grid-container">
	<div class={`cr-input-container ${className} ${isDisabled ? 'disabled' : ''}`}>
		<div class="input-wrapper">
			<input
				bind:this={inputEl}
				type="tel"
				class="cr-input"
				class:has-error={hasError}
				disabled={isDisabled}
				{value}
				{...restProps}
				oninput={(e) => {
					checkCaretPosition();
					handleInput(e);
				}}
				onkeydown={(e) => {
					checkCaretPosition();
					handleKeydown(e);
				}}
				onkeyup={(e) => {
					checkCaretPosition();
					handleKeyup(e);
				}}
				onpaste={handlePaste}
				onblur={handleBlur}
				onfocus={(e) => {
					checkCaretPosition();
					handleFocus(e);
				}}
				placeholder={s.placeholder}
			/>

			<label for="idSpan" class="floating-label" class:floating={isLabelFloating}>
				<span id="idSpan" class="label-text" class:floating={isLabelFloating}>
					{prettyLabel}
				</span>
				<!-- class error-text controlls ellipses -->
				{#if errorMessage}
					<span
						class="error-text"
						title={errorMessage}
						style:color={isGreen.test(errorMessage) ? 'green' : 'crimson'}
					>
						&nbsp;{errorMessage}
					</span>
				{/if}
			</label>
		</div>
	</div>

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
				transition:fade={{ duration: 250 }}
			/>
			<div class="hitbox-mask" onmouseleave={() => (isZoomed = false)} aria-hidden={true}></div>
		{/if}
	</div>
</div>

<style lang="scss">
	input::placeholder {
		color: var(--cr-input-placeholder-color);
	}
	.thumbnail-wrapper {
		margin: 0 0 0 7.75rem;
		position: relative;
		display: inline-block;
	}
	.item-disabled {
		color: gray;
		text-decoration: line-through;
	}
	.thumbnail-img {
		margin: 0 0 0 4rem;
		border-radius: 3px;
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
