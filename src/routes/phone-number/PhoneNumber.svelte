<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import type { HTMLInputAttributes } from 'svelte/elements';
	// import { phoneFormat } from '$lib/constants';
	// import { setCssVarColor, formatPhoneNumber } from '$lib/utils/client-helpers';
	import { setCssVarColor, formatPhoneNumber, isPhoneFormatOK, capitalizeText } from '$lib/utils';
	import { getCountryCodesMap, type TCountryName, type TCountryCodes } from './country-codes';

	const commaKeyMessage = 'press comma key for extension';
	const phoneFormat =
		'in format xxx-xxx-xxxx, ext. xx\nwith text-overflow: ellipsis;\nfor demonstration purposes';
	export const REFORMAT = 'DONE? Hit Enter to reformat';
	export const WRONGDROPMSG = 'dropped data invalid';
	export const isGreen = new RegExp(/(press comma|DONE\?)/);
	export const noPhoneDialRequired = 'No phone Dial Code required';
	export const MAXLENGTHMSG = 'maximum length reached';
	export const MAXLENGTH = 24;

	interface PROPS extends Partial<HTMLInputAttributes> {
		label: string;
		reportOn?: TReportOn;
		onValueChange?: (val: string) => void;
		value?: string;
		isDisabled?: boolean;
		isRequired?: boolean;
		isErroneous?: (val: string) => string;
		allowCountryCodes?: boolean;
		countryCode?: string;
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
		label, // sent by parent as phoneNumber but capitalized into Phone Number
		reportOn = 'keyup|Enter|blur', //['keyup', 'Enter', 'blur'],
		onValueChange,
		value = $bindable(''),
		class: className = '',
		isDisabled = false,
		isRequired = false,
		isErroneous,
		allowCountryCodes = false,
		countryCode = '',

		...restProps
	}: PROPS = $props();
	let inputEl: HTMLInputElement | undefined = undefined;
	let countryCodesEl: HTMLInputElement | undefined = undefined;
	export type CountrySelection = {
		countryName: string;
		dialCode: string;
	};
	let countryCodesRequired = $derived(allowCountryCodes);

	let REQUIRED = $derived(isRequired ? 'Entry is required' : '');
	let REQUIRED_CODEBOX = $derived.by(() => {
		// await tick();
		if (!allowCountryCodes) {
			// await tick();
			return REQUIRED;
		}
		inputEl?.offsetHeight;
		return REQUIRED + ' (Ctrl+C for DialCode)';
	});

	let countryCodesMap: SvelteMap<TCountryName, TCountryCodes>;
	let selectionStart = $derived.by(() => {
		if (!inputEl) {
			return 0;
		}
		return inputEl?.selectionStart as number;
	});
	export type TS = {
		isFocused: boolean;
		isDirty: boolean;
		placeholder: string;
		reformat: string;
	};
	const s = $state({
		isFocused: false,
		isDirty: false,
		placeholder: '',
		reformat: ''
	});

	let isCountryCodeSearchOn = $state(false);
	let countrySearchName = $state('');
	let maxLengthMsg = $state('');
	let wrongActionMsg = $state('');
	const log = console.log;
	let imgPath = '/phone-number-setup.png';
	let timer: ReturnType<typeof setTimeout>;
	let isZoomed = $state(false);
	let isInTheMiddle = $state(false);

	let valueBeforeInTheMiddle = '';

	function checkCaretPosition() {
		if (!inputEl) {
			return;
		}

		const start = inputEl.selectionStart ?? 0;
		const end = inputEl.selectionEnd ?? 0;
		const len = value.length;

		// Caret is in the middle if selection is anywhere before the very end of the text
		isInTheMiddle = start < len || end < len;
		if (isInTheMiddle) {
			if (!valueBeforeInTheMiddle) {
				valueBeforeInTheMiddle = value;
			} else if (valueBeforeInTheMiddle !== value) {
				s.reformat = isPhoneFormatOK(value, s) ? '' : REFORMAT;
			}
			s.isDirty = true;
		} else {
			valueBeforeInTheMiddle = '';
		}
	}
	function clearMaxLengthMsg() {
		maxLengthMsg = wrongActionMsg = '';
	}

	let errorMessage = $derived.by(() => {
		if (!s.isDirty && !s.isFocused && !wrongActionMsg) {
			return '';
		}

		if (value.length === 12 && inputEl?.selectionStart === 12) {
			return s.isFocused ? commaKeyMessage : '';
		}
		if (s.isDirty && s.isFocused && !value && !(maxLengthMsg || wrongActionMsg)) {
			return '';
		}
		if (s.reformat) {
			// 			log('errorMessage REFORMAT');
			return isPhoneFormatOK(value, s) ? '' : REFORMAT;
		}
		if ((value.length === MAXLENGTH && maxLengthMsg) || wrongActionMsg) {
			console.log('maxLength?', value.length);
			setTimeout(() => {
				clearMaxLengthMsg();
			}, 2000);
			console.log('replacement', maxLengthMsg ?? wrongActionMsg);
			return wrongActionMsg || maxLengthMsg; // precedence
		}
		return s.reformat ? s.reformat : isErroneous ? isErroneous(value) : '';
	}) as string;

	function countryCodesToOpen() {
		return !s.isDirty && !s.isFocused && !value ? ' (Ctrl+C for DialCode)' : '';
	}
	let prettyLabel = $derived.by(() => {
		if (isCountryCodeSearchOn) {
			return 'Country Name -> Phone Dial';
		}
		// prop got from parent as 'phoneNumber' capitalized into Phone Number
		return capitalizeText(label) + countryCodesToOpen();
	});
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

	function handleDragover(e: DragEvent) {
		e.preventDefault();
	}
	function setPlaceholder(color: string = 'chrimson') {
		setCssVarColor('--cr-input-placeholder-color', color);
		s.placeholder = REQUIRED_CODEBOX;
		// inputEl?.blur();
		// inputEl?.focus();
	}
	async function handleDrop(e: DragEvent) {
		inputEl?.focus();
		console.log('handleDrop entry');
		// 1. Get plain text from clipboard
		const droppedText = e.dataTransfer?.getData('text') || '';
		console.log('droppedText', droppedText);
		// 2. Extract digits only
		const digits = droppedText.replace(/\D/g, '');
		if (!digits) {
			e.preventDefault();
			setPlaceholder();
			wrongActionMsg = WRONGDROPMSG;
			return;
		}

		s.isDirty = true;
		let value = formatPhoneNumber(digits, s);
		if (reportOn.includes('paste')) {
			dispatchValue('paste' as TSingleReportOn);
		}
	}
	function handleInput(e: KeyboardEvent) {
		// console.log('handleInput', e.type, inputEl?.value, value);
		// console.log('handleInput entry', value);

		const el = e.target as HTMLInputElement;
		const rawValue = el.value;
		// console.log(rawValue.startsWith(' '));
		const oldCursor = el.selectionStart || 0;

		const digitsBeforeCursor = rawValue.slice(0, oldCursor).replace(/\D/g, '').length;
		console.log('handleInput rawValue', rawValue);
		const formatted = formatPhoneNumber(rawValue, s);
		console.log(formatted.startsWith(' '));
		console.log('handleInput formatted', formatted);

		if (isInTheMiddle && !'Backspace|Delete'.includes(e.key)) {
			return;
		}
		if (!isInTheMiddle) {
			value = formatted;
			console.log('formatted--> value', value);
		}
		if (value.length > 0) {
			s.isDirty = true;
		}

		tick().then(() => {
			let newCursor = 0;

			// Case A: Just appended ", ext. " -> jump cursor to the very end
			if (value.endsWith(', ext. ')) {
				newCursor = formatted.length;
				console.log('ends with , ext. new caret', newCursor);
			}
			// Case B: General digit-mapping cursor tracking
			else {
				console.log('does not ends with ext');
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
		// console.log('handleKeydown', e.type, e.key, e.ctrlKey);
		maxLengthMsg = '';
		if (e.ctrlKey && 'cC'.includes(e.key)) {
			console.log('Ctrl+C  handler');
			if (allowCountryCodes) {
				log('allowCountryCodes', allowCountryCodes);
				activateCountryCodesBox();
			} else {
				log('allowCountryCodes', allowCountryCodes);
				// maxLengthMsg = '';
				wrongActionMsg = noPhoneDialRequired;
			}
		}
		// log('handleKetdown entry', value);
		const el = e.target as HTMLInputElement;

		// if maximum number of characters is reached ignore keystrokes
		if (value.length === MAXLENGTH && !'Backspace|ArrowLeft|ArrowRight|Delete'.includes(e.key)) {
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
			value = formatPhoneNumber(el.value, s);
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
				value += ' ext. ';
				// log('handleKeydown comma in right place');
				return; // Allow comma insertion
			}
			// log('handleKeydown prevent comma not right place');
			e.preventDefault(); // Block comma everywhere else
		}

		// 1. Atomic Backspacing for ", ext. "
		if ('Backspace|Delete'.includes(e.key)) {
			// log('handleKeydown backspace');
			if ((el.selectionStart as number) <= 12) {
				if (el.value.length > 12) {
					if (isPhoneFormatOK(value, s)) {
						// log('handleKeydown clear reformat');
						s.reformat = '';
					} else {
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
		if ('Backspace|Delete'.includes(e.key)) {
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
			console.log(value.startsWith(' '));
			value = formatPhoneNumber(value, s);
			console.log(value.startsWith(' '));
		}

		onValueChange?.(value);

		if (reportOn.includes(e.key as TSingleReportOn)) {
			dispatchValue(e.key as TSingleReportOn);
		}
		// log('handleKeyup exit', value);
	}

	async function handleBlur(e: FocusEvent) {
		// log('handleBlur');
		s.isFocused = false;
		s.isDirty = true; // at this state do not show message
		tick().then(() => {
			const input = e.target as HTMLInputElement;
			input.setSelectionRange(value.length, value.length);
		});
		if (!value) {
			// 			log('blur set REQUIRED');
			s.placeholder = REQUIRED_CODEBOX;
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
		s.isFocused = true;
		if (value.length === 12 && inputEl?.selectionStart === 12) {
			s.isDirty = true;
		}

		// const color = !value ? 'crimson' : '0066cc';
		setPlaceholder(!value ? 'crimson' : '0066cc');

		tick().then(() => {
			return new Promise((resolve) => setTimeout(resolve, 300));
		});

		if (reportOn.includes(e.type as TSingleReportOn)) {
			dispatchValue(e.type as TSingleReportOn);
		}
		// log('fandleFocus isDirty?', s.isDirty);
	}
	let selectedCode = $state('+381');

	function handleCountrySelect(code: string) {
		selectedCode = code;
		console.log('code', code);
	}
	onMount(() => {
		console.log(!s.isDirty, !s.isFocused, !value);
	});

	let countryCandidates = $derived.by(() => {
		if (!countrySearchName || countrySearchName.length === 1) {
			console.log('$derived -- no search', value);
			return '';
		}
		return Array.from(countryCodesMap.keys()).filter((countryName) =>
			countryName.toLowerCase().startsWith(countrySearchName.toLowerCase())
		);
	}) as string[];
	function searchCountryName() {
		// console.log('searchCountry');
		if (!countryCandidates) {
			console.log('no countryCandidates');
			return;
		}
		// console.log('countryCandidates', countryCandidates);
		if (countryCandidates.length > 1) {
			countryCandidates.forEach((countryName) => {
				const d = countryCodesMap.get(countryName);
				// console.log(countryName, countryCodesMap.get(countryName));
			});
		} else {
			const dial = countryCodesMap.get(countryCandidates[0]);
			// console.log(countryCandidates[0], dial);
			wrongActionMsg = 'DielCode for ' + countryCandidates[0];
			countryCodesEl!?.blur();
			value = (dial?.dialCode as string) + ' ' + value;
		}
	}
	function countryCodesKeyup(e: KeyboardEvent) {
		if (countrySearchName.length === 1) {
			return;
		}
	}
	function countryCodesBlur(e: FocusEvent) {
		isCountryCodeSearchOn = false;
		countryCodesEl!.style.zIndex = '-1';
		countryCodesEl!.style.opacity = '0';
		// inputEl!.style.opacity = '1';
	}
	async function activateCountryCodesBox() {
		console.log('activateCountryCodesBox');
		if (!countryCodesMap) {
			countryCodesMap = getCountryCodesMap();
		}
		// inputEl!.style.opacity = '0';
		await tick();
		countryCodesEl!.style.opacity = '1';
		isCountryCodeSearchOn = true;
		await tick();
		// countryCodesEl!.style.zIndex = '101';
		countryCodesEl?.focus();
	}
</script>

<p>
	middle {isInTheMiddle} value {value} cc required {countryCodesRequired} searchOn {isCountryCodeSearchOn}
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
				ondragover={handleDragover}
				ondrop={async (e) => {
					inputEl?.focus();
					await tick();
					handleDrop(e);
				}}
				onblur={handleBlur}
				onfocus={(e) => {
					checkCaretPosition();
					handleFocus(e);
				}}
				placeholder={s.placeholder}
			/>
			<input
				class="country-codes"
				class:allow-codes={isCountryCodeSearchOn}
				bind:value={countrySearchName}
				bind:this={countryCodesEl}
				type="text"
				placeholder="Start entering country name"
				onkeyup={countryCodesKeyup}
				oninput={searchCountryName}
				onblur={countryCodesBlur}
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

	<div class="thumbnail-wrapper" data-caption="Parent Block">
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
	/* redefined out from components.scss*/
	.input-wrapper {
		position: relative;
		.cc-wrapper {
			position: absolute;
			top: 0;
			left: 0;
		}
	}
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
	.label-text {
		display: inline-block;
		width: max-content;
		background-color: white;
		z-index: 10;
		&.counntry-codes {
			display: none;
		}
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
	.cr-input {
		position: relative;
		opacity: 1;
		z-index: 2;
	}
	.cr-input.allow-codes {
		opacity: 0;
		z-index: 0;
	}
	.country-codes {
		position: absolute;
		top: -2.1rem;
		left: 0;
		opacity: 0;
		width: 18rem;
		position: relative;
		// padding-left: 0;
		// border: 3px solid blue;
		padding-left: 1rem;
		border: 1px solid gray;
		// z-index: -1;
		// &::before {
		// 	position: absolute;
		// 	content: var(--country-candidates);
		// 	top: 2rem;
		// 	left: 0;
		// }
		&::placeholder {
			color: lightgreen;
		}
	}
	.country-codes.allow-codes {
		opacity: 1;
		z-index: 3;
		// &::before {
		// }
	}
</style>
