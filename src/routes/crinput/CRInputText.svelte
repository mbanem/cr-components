<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type TCapitalize = 'lowercase' | 'uppercase' | 'capitalize' | 'none';

	interface PROPS extends Partial<HTMLInputAttributes> {
		label: string;
		reportOn?: 'Enter' | 'keyup' | 'blur' | 'focus';
		onValueChange?: (val: string) => void;
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
		class: className = '',
		isDisabled = false,
		allowedChars = '',
		isErroneous,

		...restProps
	}: PROPS = $props();

	let inputElement: HTMLInputElement;
	let errorMessage = $derived(isErroneous ? isErroneous(value) : '');
	let hasError = $derived(Boolean(errorMessage));
	let hasValue = $derived(value.length > 0);

	function reportValue() {
		onValueChange?.(value);
	}

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement;

		let newValue = target.value;

		if (allowedChars) {
			const expression = new RegExp(`[^${allowedChars}]`, 'g');
			newValue = newValue.replace(expression, '');
		}

		if (capitalize === 'lowercase') {
			newValue = newValue.toLowerCase();
		} else if (capitalize === 'uppercase') {
			newValue = newValue.toUpperCase();
		} else if (capitalize === 'capitalize') {
			newValue = newValue.replace(/\b\w/g, (char) => char.toUpperCase());
		}

		value = newValue;
		if (target.value !== newValue) {
			target.value = newValue;
		}
		if (reportOn === 'keyup') {
			reportValue();
		}
	}

	function handleKeyup() {
		if (reportOn === 'keyup') {
			reportValue();
		}
	}

	function handleBlur() {
		if (reportOn === 'blur') {
			reportValue();
		}
	}

	function handleFocus() {
		if (reportOn === 'focus') {
			reportValue();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (reportOn === 'Enter' && event.key === 'Enter') {
			reportValue();
		}
	}
</script>

<div class={`cr-input-container ${className} ${isDisabled ? 'disabled' : ''}`}>
	<div class="input-wrapper">
		<input
			bind:this={inputElement}
			bind:value
			class:has-error={hasError}
			class="cr-input"
			disabled={isDisabled}
			{...restProps}
			oninput={handleInput}
			onkeyup={handleKeyup}
			onblur={handleBlur}
			onfocus={handleFocus}
			onkeydown={handleKeydown}
		/>

		<label for="idSpan" class:floating={hasValue || hasError} class="floating-label">
			<span id="idSpan" class="label-text">
				{label}
			</span>
		</label>

		{#if errorMessage}
			<div class="error-text">
				{errorMessage}
			</div>
		{/if}
	</div>
</div>
