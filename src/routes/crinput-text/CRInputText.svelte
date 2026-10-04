<script lang="ts" module>
	export function capitalizeText(str: string): string {
		return str
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/\b\w/g, (char) => char.toUpperCase());
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { setCssVarColor } from '$lib/utils/client-helpers';

	type TCapitalize =
		'lowercase' | 'uppercase' | 'capitalize' | 'paste' | 'keyup' | 'keydown' | 'none';

	interface PROPS extends Partial<HTMLInputAttributes> {
		label: string;
		reportOn?: TReportOnInput;
		onValueChange?: (val: string) => void;
		minLength?: string;
		maxLength?: string;
		capitalize?: TCapitalize;
		isDisabled?: boolean;
		allowedChars?: string;
		isErroneous?: (val: string) => string;
	}

	let {
		label,
		reportOn = 'keyup',
		onValueChange,
		capitalize = 'none',
		value = $bindable(''),
		minLength = '2',
		maxLength = '24',
		class: className = '',
		isDisabled = false,
		allowedChars = '',
		isErroneous,

		...restProps
	}: PROPS = $props();

	// derived.by is an arrow function and so it is reactive
	// for all its variables involved
	const rxAllowed = $derived.by(() => {
		const all = allowedChars?.replace(/[\[\]]/g, '');
		return new RegExp(`[${all}]`);
	});

	let s = $state({
		isFocused: false,
		placeholder: '',
		isDirty: value.length > 0 && value.length < 2,
		minLength: Number(minLength),
		maxLength: Number(maxLength)
	});
	const minLengthError = `Must be at least ${s.minLength} characters`;
	const maxLengthError = `Must be at most ${s.maxLength} characters`;
	let errorMessage = $derived.by(() => {
		if (!s.isDirty && !s.isFocused) return '';
		if (s.isFocused && !value) {
			return '';
		}
		return value.length <= s.minLength - 1
			? minLengthError
			: value.length > s.maxLength - 1
				? maxLengthError
				: '';
	});

	let prettyLabel = $derived(capitalizeText(label));
	let isLabelFloating = $derived(value || s.isFocused || errorMessage.length > 0 || s.placeholder);
	let hasError = $derived(Boolean(errorMessage) && errorMessage === minLengthError);

	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();

		// 1. Get plain text from clipboard
		const pastedText = e.clipboardData?.getData('text') || '';

		// 5. Update Svelte state
		const cap = capitalizeText(pastedText);

		value = capitalizeText(value + cap);
		s.isDirty = true;
		dispatchValue('paste' as TReportOn);
	}
	function dispatchValue(triggerEvent: TReportOn) {
		if (!onValueChange) return;

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

	function handleInput(e: Event) {
		const el = e.target as HTMLInputElement;

		let newValue = el.value;

		if (capitalize === 'lowercase') {
			newValue = newValue.toLowerCase();
		} else if (capitalize === 'uppercase') {
			newValue = newValue.toUpperCase();
		} else if (capitalize === 'capitalize') {
			newValue = capitalizeText(newValue);
		}

		if (value !== newValue) {
			value = newValue;
		}
		// if (reportOn.includes(e.type)) {
		dispatchValue(e.type as TReportOn);
		// }
	}

	function handleKeyup(e: KeyboardEvent) {
		dispatchValue(e.type as TReportOn);
	}

	function handleBlur(e: FocusEvent) {
		s.isFocused = false;
		if (!value) {
			s.placeholder = 'Entry is required';
			setCssVarColor('--cr-input-placeholder-color', 'crimson');
		}
		tick().then(() => {
			return new Promise((resolve) => setTimeout(resolve, 300));
		});

		dispatchValue(e.type as TReportOn);
	}

	function handleFocus(e: FocusEvent) {
		s.isDirty = false;
		setCssVarColor('--cr-label-focus-color', '0066cc');
		tick().then(() => {
			return new Promise((resolve) => setTimeout(resolve, 300));
		});
		s.isFocused = true;
		dispatchValue(e.type as TReportOn);
	}

	function handleKeydown(e: KeyboardEvent) {
		if ((!rxAllowed.test(e.key) || value.length === s.maxLength) && e.key !== 'Backspace') {
			e.preventDefault();
			return;
		}

		dispatchValue(e.type as TReportOn);
	}
</script>

<div class={`cr-input-container ${className} ${isDisabled ? 'disabled' : ''}`}>
	<div class="input-wrapper">
		<input
			type="text"
			bind:value
			class="cr-input"
			class:has-error={hasError}
			disabled={isDisabled}
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
				<span class="error-text" title={errorMessage} style:color={'crimson'}>
					&nbsp;{errorMessage}
				</span>
			{/if}
		</label>
	</div>
</div>
