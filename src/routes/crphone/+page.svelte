<script lang="ts">
	import CRPhone, { phoneFormat } from './CRPhone.svelte';

	let first = $state('');
	let phone = $state('');

	function onPhoneValueChange(val: string) {
		console.log('Parent hook triggered with processed string: ', val);
	}

	function phoneError(value: string): string {
		const digits = value.replace(/\D/g, '').slice(0, 13);

		const val = digits.replace(
			/^(\d{1,3})?(\d{1,3})?(\d{1,4})?(\d{1,3})?$/,
			(_match, g1 = '', g2 = '', g3 = '', g4 = '') => {
				let res = g1;
				if (g2) res += `-${g2}`;
				if (g3) res += `-${g3}`;
				if (g4) res += ` .ext ${g4}`;
				return res;
			}
		);
		if (val.length === 12) {
			return phoneFormat;
		}
		if (val.length === 12 || val.length >= 19) {
			return '';
		}
		return phoneFormat;
	}
</script>

<div style="max-width: 16rem; padding: 6px 1rem;">
	<CRPhone
		label="phoneNumber"
		reportOn="blur"
		bind:value={phone}
		onValueChange={onPhoneValueChange}
		isErroneous={phoneError}
		class="main"
	/>
</div>
