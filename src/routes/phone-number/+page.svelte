<script lang="ts">
	import PhoneNumberDemo from './PhoneNumberDemo.svelte';

	// Mock phoneFormat for standalone compilation
	const phoneFormat = 'in format xxx-xxx-xxxx, ext. xx';

	function phoneError(value: string): string {
		const digits = value.replace(/\D/g, '');
		const mainDigits = digits.slice(0, 10);
		const extDigits = digits.slice(10);

		if (mainDigits.length === 10 && !value.includes(',')) {
			return '';
		}

		if (mainDigits.length === 10 && value.endsWith(',')) {
			return 'press comma key to enter extension';
		}

		if (value.includes(',')) {
			return extDigits.length > 0 ? '' : phoneFormat;
		}

		return '';
	}

	let phoneNumber = $state('');
	let currentValue = $state('');

	function onValueChange(val: string) {
		currentValue = val;
	}

	let cc = $state(true);
	log('Here we test global log');
</script>

<button onclick={() => (cc = !cc)} class="mb-4 rounded bg-blue-500 px-4 py-2 text-white">
	toggle countryCodes: {cc ? 'ON' : 'OFF'}
</button>

<div class="demo-wrapper">
	<PhoneNumberDemo
		label="phoneNumber"
		reportOn="blur"
		bind:value={phoneNumber}
		{onValueChange}
		isErroneous={phoneError}
		isRequired={true}
		allowCountryCodes={cc}
	/>

	<div class="parent-block mt-4" data-caption="Parent Block">
		<p>(111) 222-3333 x44</p>
		<p>222 444-3331 #44</p>
		<p>333 555-7779 ext 56</p>
		<p class="text-red-600">incorrect 46554 text 9984</p>
		<p>
			<span class="sticky-label">onValueChange</span>
			{currentValue}
		</p>
		<p>
			<span class="sticky-label">reportOn <span class="text-blue-600">blur</span></span>
			{currentValue}
		</p>
	</div>
</div>

<style lang="scss">
	.demo-wrapper {
		max-width: 18rem;
		padding: 6px 1rem;
		margin-left: 1rem;
	}
	.parent-block {
		border: 1px solid #ccc;
		border-radius: 6px;
		padding: 1rem;
		width: 18rem;
		margin-left: 14rem;
		background: #fafafa;
		p {
			padding: 2px 0;
			margin: 0;
		}
	}
	.sticky-label {
		display: inline-block;
		font-size: 13px;
		letter-spacing: -1px;
		font-weight: bold;
	}
</style>
