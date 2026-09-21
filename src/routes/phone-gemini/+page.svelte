<script lang="ts">
	import CRPhone, { phoneFormat } from './CRPhone.svelte';

	let phone = $state('');

	function handleApiReport(val: string) {
		console.log('parent onValueChange: ', val);
	}

	function phoneError(value: string): string {
		const digits = value.replace(/\D/g, '');
		const mainDigits = digits.slice(0, 10);
		const extDigits = digits.slice(10);

		// 1. Incomplete main phone number (1 to 9 digits)
		if (mainDigits.length > 0 && mainDigits.length < 10) {
			return phoneFormat;
		}

		// 2. Exactly 10 digits without an extension block
		if (mainDigits.length === 10 && !value.includes(',')) {
			return '';
		}

		// 3. User typed comma at the end of 10 digits -> show green instruction hint
		if (mainDigits.length === 10 && value.endsWith(',')) {
			return 'press comma key to enter extension';
		}

		// 4. Extension block exists:
		// - ", ext. " with NO extension digits yet -> show red error format message
		// - ", ext. X" with at least 1 extension digit -> error cleared (returns empty string)
		if (value.includes(',')) {
			return extDigits.length > 0 ? '' : phoneFormat;
		}

		return '';
	}
</script>

<div style="max-width: 16rem; padding: 6px 1rem;">
	<CRPhone
		label="phoneNumber"
		reportOn="blur"
		bind:value={phone}
		onValueChange={handleApiReport}
		isErroneous={phoneError}
		class="main"
	/>
	<p style="margin-top:-6px;paddin:0;margin:0;">(111) 222-3333 x44</p>
	<p style="paddin:0;margin:0;">222 444-3331 #44</p>
	<p style="paddin:0;margin:0;">333 555-7779 ext 56</p>
</div>
