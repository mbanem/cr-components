<script lang="ts">
	import { tick } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { setCssVarColor, capitalizeText } from '$lib/utils';
	import { getCountryCodesMap, type TCountryName, type TCountryCodes } from './countryCodesMap';

	const commaKeyMessage = 'press comma key for extension';
	const phoneFormat = 'in format xxx-xxx-xxxx, ext. xx\nwith text-overflow: ellipsis;';
	export const REFORMAT = 'DONE? Hit Enter to reformat';
	export const isGreen = /(press comma|DONE\?)/;
	export const noPhoneDialRequired = 'No phone Dial Code required';
	export const MAXLENGTHMSG = 'maximum length reached';
	export const MAXLENGTH = 24;

	export type TSingleReportOn = 'keyup' | 'Enter' | 'blur' | 'paste' | 'focus';
	export type TReportOn = string;

	export type TValueAttrs = {
		dialCode: string;
		readonly dialCodeLength: number;
		caretStart: number;
		caretEnd: number;
		valueLength: number;
		readonly phoneLength: number;
		inTheMiddle: boolean;
	};

	export interface PROPS extends Partial<HTMLInputAttributes> {
		label: string;
		reportOn?: TReportOn;
		onValueChange?: (val: string) => void;
		value?: string;
		isDisabled?: boolean;
		isRequired?: boolean;
		isErroneous?: (val: string) => string;
		allowCountryCodes?: boolean;
		v?: TValueAttrs;
	}

	let {
		label,
		reportOn = 'keyup|Enter|blur',
		onValueChange,
		value = $bindable(''),
		class: className = '',
		isDisabled = false,
		isRequired = false,
		isErroneous,
		allowCountryCodes = false,
		v = $bindable({
			dialCode: '',
			get dialCodeLength() {
				return this.dialCode.length;
			},
			caretStart: 0,
			caretEnd: 0,
			valueLength: 0,
			get phoneLength() {
				return this.valueLength - this.dialCodeLength;
			},
			inTheMiddle: false
		}),
		...restProps
	}: PROPS = $props();

	let inputEl: HTMLInputElement | undefined = $state();
	let countryCodesEl: HTMLInputElement | undefined = $state();
	let ddEl: HTMLDivElement | undefined = $state();

	let isCountryCodeSearchOn = $state(false);
	let countryNameSearch = $state('');
	let maxLengthMsg = $state('');
	let timeoutActionMsg = $state('');

	let countryCodesMap: SvelteMap<TCountryName, TCountryCodes>;

	export type TInputElState = {
		isFocused: boolean;
		isDirty: boolean;
		placeholder: string;
		reformat: string;
	};

	const s = $state<TInputElState>({
		isFocused: false,
		isDirty: false,
		placeholder: '',
		reformat: ''
	});

	const phoneRegex = /^(\+\d{1,4})?\s*(\d{3}-\d{3}-\d{4})(,\s*ext\.\s*\d{1,5})?$/;

	function isPhoneFormatOK(str: string): boolean {
		try {
			if (phoneRegex.test(str)) {
				s.reformat = '';
				return true;
			}
		} catch (err: unknown) {
			handleTryCatch(err, 'isPhoneFormatOK');
		}

		return false;
	}

	export function formatPhoneNumber(val: string): string {
		if (val.endsWith('ext. ') || s.reformat) return val;

		try {
			let dialCode = '';
			const m = val.trim().match(/[^-\s ]+/g);
			if (m && m[0].startsWith('+')) {
				dialCode = m.splice(0, 1)[0].trim();
				val = m.join('');
			}

			const digits = val.replace(/\D/g, '');
			const mainDigits = digits.slice(0, 10);
			const extDigits = digits.slice(10, 15);

			let formatted = mainDigits;
			if (mainDigits.length >= 6) {
				formatted = `${mainDigits.slice(0, 3)}-${mainDigits.slice(3, 6)}-${mainDigits.slice(6)}`;
			} else if (mainDigits.length >= 3) {
				formatted = `${mainDigits.slice(0, 3)}-${mainDigits.slice(3)}`;
			}

			if ((digits.length === 10 && val.includes(', ext. ')) || extDigits.length > 0) {
				formatted += `, ext. ${extDigits}`;
			}

			s.reformat = '';
			return dialCode ? `${dialCode} ${formatted}` : formatted;
		} catch (err) {
			handleTryCatch(err, 'formatPhoneNumber');
		}

		return val;
	}

	function updateStates() {
		try {
			if (!inputEl) return;
			v.valueLength = value.length;

			const m = inputEl.value.trim().match(/[^-\s ]+/g);
			v.dialCode = m && m[0].startsWith('+') ? m[0].trim() : '';

			v.caretStart = inputEl.selectionStart || 0;
			v.caretEnd = inputEl.selectionEnd || 0;
			v.inTheMiddle = v.caretStart < value.length && v.caretEnd < value.length;
		} catch (err: unknown) {
			handleTryCatch(err, 'updateStates');
		}
	}

	const REQUIRED = $derived(isRequired ? 'Entry is required' : '');
	const REQUIRED_CODEBOX = $derived.by(() => {
		try {
			if (!allowCountryCodes) return REQUIRED;
			inputEl?.offsetHeight;
			return REQUIRED + ' (Ctrl+C for DialCode)';
		} catch (err: unknown) {
			handleTryCatch(err, '$derived.by() callback');
		}
	}) as string;

	let timer: ReturnType<typeof setTimeout>;
	const clearTimeoutMsgs = () => {
		try {
			// clearTimeout(timer!);
			timeoutActionMsg = maxLengthMsg = '';
		} catch (err: unknown) {
			handleTryCatch(err, 'clearTimeoutMsgs');
		}
	};
	const errorMessage = $derived.by(() => {
		if (!s.isDirty && !s.isFocused && !timeoutActionMsg) return '';

		if ((v.phoneLength === MAXLENGTH && maxLengthMsg) || timeoutActionMsg) {
			setTimeout(() => {
				clearTimeoutMsgs();
			}, 2500);
			return timeoutActionMsg || maxLengthMsg;
		}
		if (v.phoneLength > 0 && v.phoneLength < 10 && !isCountryCodeSearchOn) return phoneFormat;
		if (v.phoneLength === 12 && v.caretStart === 12) return s.isFocused ? commaKeyMessage : '';
		if (s.isDirty && s.isFocused && !value && !maxLengthMsg && !timeoutActionMsg) return '';
		if (s.reformat) return isPhoneFormatOK(value) ? '' : REFORMAT;
		return s.reformat ? s.reformat : isErroneous ? isErroneous(value) : '';
	});

	const prettyLabel = $derived(
		isCountryCodeSearchOn
			? 'Country Name -> Phone Dial'
			: capitalizeText(label) +
					(!s.isDirty && !s.isFocused && !value && allowCountryCodes
						? ' (Ctrl+C for DialCode)'
						: '')
	);

	const isLabelFloating = $derived(
		s.isFocused || value.length > 0 || errorMessage.length > 0 || Boolean(s.placeholder)
	);

	const hasError = $derived(
		(Boolean(errorMessage) && errorMessage !== commaKeyMessage && errorMessage !== REFORMAT) ||
			(!s.isFocused && !value) ||
			errorMessage.length > 31
	);

	function dispatchValue(eventType: TSingleReportOn) {
		try {
			if (reportOn.includes(eventType) && onValueChange) {
				onValueChange(value);
			}
		} catch (err: unknown) {
			handleTryCatch(err, 'dispatchValue');
		}
	}

	function setPlaceholder(color = 'crimson') {
		setCssVarColor('--cr-input-placeholder-color', color);
		s.placeholder = REQUIRED_CODEBOX;
	}

	async function handleDrop(e: DragEvent) {
		try {
			e.preventDefault();
			const droppedText = e.dataTransfer?.getData('text') || '';
			const digits = droppedText.replace(/\D/g, '');
			if (!digits) {
				setPlaceholder();
				timeoutActionMsg = 'dropped data invalid';
				return;
			}
			s.isDirty = true;
			value = formatPhoneNumber(digits);
			if (reportOn.includes('paste')) dispatchValue('paste');
		} catch (err: unknown) {
			handleTryCatch(err, 'handleDrop');
		}
	}

	function handleInput(e: Event) {
		try {
			updateStates();
			const el = e.target as HTMLInputElement;
			const formatted = formatPhoneNumber(el.value);

			if (!v.inTheMiddle) {
				value = formatted;
			}
			if (value.length > 0) s.isDirty = true;
			if (reportOn.includes('input')) dispatchValue('input' as TSingleReportOn);
		} catch (err) {
			console.log('handleInput', err);
		}
	}

	async function handleKeydown(e: KeyboardEvent) {
		// console.log('at caret', value.slice(v.caretStart - 3, v.caretStart - 1));
		try {
			maxLengthMsg = '';
			if (
				(e.ctrlKey && 'cC'.includes(e.key)) ||
				(v.dialCodeLength > 0 && v.caretStart === v.dialCodeLength + 1 && e.key === 'Backspace')
			) {
				if (allowCountryCodes) {
					timeoutActionMsg = '-- new dialCode';
					await activateCountryCodesBox();
					return;
				} else {
					timeoutActionMsg = noPhoneDialRequired;
				}
			}

			// if Backspace is to delete dash delete on more character
			if (e.key && e.key === 'Backspace') {
				console.log('deleting a dash', value, v.caretStart);
			}
			// When caret is at the end of PhoneNumber only comma is allowed
			if (
				errorMessage === commaKeyMessage &&
				!['Backspace', 'ArrowLeft', 'Home'].includes(e.key) &&
				e.key !== ','
			) {
				// e.preventDefault();
				timeoutActionMsg = 'comma key expected...';
				return;
			}

			if (
				value.length === MAXLENGTH &&
				!['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)
			) {
				maxLengthMsg = MAXLENGTHMSG;
				await tick();
				e.preventDefault();
				return;
			}

			if (e.key === 'Enter' && s.reformat) {
				s.reformat = '';
				value = formatPhoneNumber(value);
				inputEl?.setSelectionRange(value.length, value.length);
				return;
			}

			if (e.key === ',') {
				const isAtEnd = v.caretStart === value.length;
				if (v.phoneLength === 12 && isAtEnd && !value.endsWith(',')) {
					e.preventDefault();
					value += ' ext. ';
					return;
				}
			}

			if (['Backspace', 'Delete'].includes(e.key)) {
				if (v.caretStart <= 12 && v.phoneLength > 12) {
					s.reformat = isPhoneFormatOK(value) ? '' : REFORMAT;
					s.isDirty = true;
					return;
				}
				const extIndex = value.indexOf(', ext. ');
				if (extIndex !== -1 && v.caretStart === extIndex + 7) {
					e.preventDefault();
					value = value.slice(0, extIndex);
					return;
				}
				if (e.key === 'Backspace') {
					if (v.dialCodeLength && v.dialCodeLength === v.caretStart) {
						v.dialCode = '';
						value = value.slice(v.dialCodeLength + 1);
					} else if (v.inTheMiddle) {
						s.reformat = REFORMAT;
					}
				}
			}
		} catch (err) {
			console.log('handleKeydown', err);
		}
	}

	function handleKeyup(e: KeyboardEvent) {
		try {
			updateStates();

			let cpos = v.caretStart;
			console.log(v.caretStart, (value as string)[v.caretStart - 2]);
			cpos += e.key === 'ArowLeft' ? -1 : e.key === 'ArrowRight' ? +5 : 0;
			try {
				if (['Backspace', 'Delete'].includes(e.key)) {
					value = /(, |-)$/.test(value) ? value.slice(0, -2) : inputEl?.value || '';
					if (!value) setCssVarColor('--cr-input-placeholder-color', 'crimson');
					dispatchValue('keyup');
					return;
				}
			} catch (err) {
				console.log('catch', err);
			}
			if (s.reformat) return;

			if (!v.inTheMiddle) {
				value = formatPhoneNumber(value);
			}
			onValueChange?.(value);
			if (reportOn.includes(e.key)) dispatchValue('keyup');
		} catch (err) {
			console.log('handleKeyup', err);
		}
	}

	async function handleBlur(e: FocusEvent) {
		try {
			s.isFocused = false;
			s.isDirty = true;
			await tick();
			inputEl?.setSelectionRange(value.length, value.length);
			if (!value) {
				s.placeholder = REQUIRED_CODEBOX;
				setCssVarColor('--cr-input-placeholder-color', 'crimson');
			}
			if (reportOn.includes('blur')) dispatchValue('blur');
		} catch (err: unknown) {
			handleTryCatch(err, 'handleBlur');
		}
	}

	function handleFocus(e: FocusEvent) {
		try {
			s.isFocused = true;
			if (v.phoneLength === 12 && v.caretStart === 12) s.isDirty = true;
			setPlaceholder(!value ? 'crimson' : '0066cc');
			if (reportOn.includes('focus')) dispatchValue('focus');
		} catch (err: unknown) {
			handleTryCatch(err, 'handleFocus');
		}
	}

	const countryCandidates = $derived.by(() => {
		if (!countryNameSearch || countryNameSearch.length === 1) return [];
		return Array.from(countryCodesMap.keys()).filter((c) =>
			c.toLowerCase().startsWith(countryNameSearch.toLowerCase())
		);
	});

	let dropdownMarginLeft = $state('50px'); // 34 max

	function countrySelected(e: MouseEvent) {
		if (!ddEl) return;
		const cName = (e.target as HTMLLIElement).innerText;
		const dial = countryCodesMap.get(cName)?.dialCode || '';
		value = `${dial} ${value.replace(/^\+\S+ /, '')}`;
		countryNameSearch = '';
	}

	function searchCountryName() {
		let maxLength = 0;

		// console.log('searchCountry', countryNameSearch);

		if (!countryCandidates || countryCandidates.length < 2) {
			// console.log('no countryCandidates');
			return;
		}

		// console.log('countryCandidates', countryNameSearch, countryCandidates);

		if (countryCandidates.length > 1) {
			// console.log('more then 1 candidate', countryCandidates.length);
			countryCandidates.forEach((countryName) => {
				if (countryName.length > maxLength) {
					maxLength = countryName.length;
				}
				const d = countryCodesMap.get(countryName);
				// console.log(countryName, countryCodesMap.get(countryName));
			});
			// if there are countryCandidates render a list
			countryCandidates.join('\n');
		} else {
			const dial = countryCodesMap.get(countryCandidates[0]);
			v.dialCode = dial?.dialCode as string;
			console.log(countryCandidates[0], dial);
			timeoutActionMsg = 'DialCode for ' + countryCandidates[0];
			countryCodesEl!?.blur();
			value = (dial?.dialCode as string) + ' ' + value;
		}

		dropdownMarginLeft = `${(34 - maxLength) * 4}px`;
		console.log('dropdownMarginLeft', dropdownMarginLeft);
		// console.log('leftMargin', maxLength, maxLength / 4, dropdownMarginLeft);
	}

	async function activateCountryCodesBox() {
		if (!countryCodesMap) countryCodesMap = getCountryCodesMap();
		await tick();
		isCountryCodeSearchOn = true;
		await tick();
		countryCodesEl?.focus();
	}
</script>

<div class="grid-container">
	<div class={`cr-input-container ${className} ${isDisabled ? 'disabled' : ''}`}>
		<div class="input-wrapper">
			<input
				bind:this={inputEl}
				type="tel"
				class="cr-input"
				class:has-error={hasError}
				disabled={isDisabled}
				bind:value
				{...restProps}
				oninput={handleInput}
				onkeydown={handleKeydown}
				onkeyup={handleKeyup}
				onclick={updateStates}
				ondragover={(e) => e.preventDefault()}
				ondrop={handleDrop}
				onblur={handleBlur}
				onfocus={handleFocus}
				placeholder={s.placeholder}
			/>
			<input
				class="country-codes"
				class:allow-codes={isCountryCodeSearchOn}
				class:candidates-list-ready={countryCandidates.length}
				bind:value={countryNameSearch}
				bind:this={countryCodesEl}
				type="text"
				placeholder="Start entering country name"
				oninput={searchCountryName}
				onblur={() => (isCountryCodeSearchOn = false)}
			/>

			<label for="idSpan" class="floating-label" class:floating={isLabelFloating}>
				<span id="idSpan" class="label-text" class:floating={isLabelFloating}>{prettyLabel}</span>
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
</div>

{#if countryCandidates.length > 0}
	<div class="keep-centered">
		<div bind:this={ddEl} class="candidates-dropdown" onclick={countrySelected} aria-hidden={true}>
			<ul>
				{#each countryCandidates as candidate}
					<li>{candidate}</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}

<style lang="scss">
	.input-wrapper {
		position: relative;
	}
	input::placeholder {
		color: var(--cr-input-placeholder-color);
	}
	.cr-input {
		position: absolute;
		top: 0;
		left: 0;
		opacity: 1;
		z-index: 2;
		&.allow-codes {
			opacity: 0;
			z-index: 0;
		}
	}
	.country-codes {
		opacity: 0;
		width: 18rem;
		padding-left: 1rem;
		border: 1px solid gray;
		&::placeholder {
			opacity: 0.4 !important;
			color: black;
		}
	}
	.keep-centered {
		@include container($caption: 'Select Country', $caption-color: navy);

		width: 18rem;
		display: flex;
		justify-content: center;
		border: 1px solid gray;
		padding: 0;
		margin: 1.8rem 0 0 0;

		.candidates-dropdown {
			display: block;
			width: 100%; // <--- Change this from max-content to 100%
			opacity: 1;
			z-index: 12;

			ul {
				list-style: none;
				padding: 0;
				margin: 0;
				width: 100%;
			}

			li {
				list-style: none;
				padding: 0.2rem 1rem; // Add horizontal padding so hover doesn't touch the absolute edges
				margin: 0;
				color: rgb(47, 47, 156);
				cursor: pointer;
				text-align: center; // Centers the text across the full-width highlight
			}

			li:hover {
				background-color: cornsilk;
			}
		}
	}
</style>
