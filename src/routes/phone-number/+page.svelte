<script lang="ts">
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

	import PhoneNumber, { phoneFormat } from './PhoneNumber.svelte';
	let phoneNumber = $state('');
	let currentValue = $state('');
	function onValueChange(val: string) {
		currentValue = val;
	}
	let sticky = 'display:inline-block;font-size:13px;letter-spacing:-1px;';
</script>

<div class="demo-wrapper">
	<PhoneNumber
		label="phoneNumber"
		reportOn="blur"
		bind:value={phoneNumber}
		{onValueChange}
		isErroneous={phoneError}
		isRequired={true}
	/>
	<div class="parent-block" data-caption="Parent Block">
		<p style="margin-top:-6px;paddin:0;margin:0;">(111) 222-3333 x44</p>
		<p style="paddin:0;margin:0;">222 444-3331 #44</p>
		<p style="paddin:0;margin:0;">333 555-7779 ext 56</p>
		<p>
			<span style:sticky>onValueChange</span>
			{currentValue}
		</p>
		<p>
			<span style:sticky>reportOn <span style="color:blue;font-size:16px">blur</span></span>
			{currentValue}
		</p>
	</div>
</div>

<style lang="scss">
	.demo-wrapper {
		max-width: 18rem;
		padding: 6px 1rem;
		margin-left: 20rem;
	}
	.parent-block {
		@include container($caption-color: rgb(101, 96, 96));
		padding: 1rem;
		width: 18rem;
		p {
			padding: 2px 0;
			margin: 0;
		}
	}
	.report-on {
		display: inline-block;
		font-size: 12px !important;
		letter-spacing: -1px !important;
		color: green !important;
		// line-height: 16px ;
		// padding: 0;
		// margin: 0;
	}
</style>
