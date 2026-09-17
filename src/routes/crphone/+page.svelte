<script lang="ts">
	import CRPhone from './CRPhone.svelte';

	let first = $state('');
	let phone = $state('');
	let formValue = $state('');
	// 1. Create a variable typed to the component instance interface
	let phoneInputRef: ReturnType<typeof CRPhone> | undefined = $state();
	function handleFormReset() {
		// 2. Call the child's reset method safely if the reference is bound
		phoneInputRef?.reset();
	}

	function handleApiReport(val: string) {
		console.log('Parent hook triggered with processed string: ', val);
	}
	function phoneError(value: string): string {
		const digits = value.replace(/\D/g, '').slice(0, 13);

		// Match 3, 3, 4, and up to 3 extension digits conditionally
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
		return val.length == 12 || val.length > 18
			? ''
			: 'in format xxx-xxx-xxxx, ext. xx\nand this is addition for ellipses';
	}
</script>

<div style="max-width: 16rem; padding: 6px 1rem;">
	<!-- Instance 1: Only numbers allowed, filters input text directly inside keydown -->
	<CRPhone
		label="phoneNumber"
		reportOn="blur"
		bind:value={phone}
		bind:this={phoneInputRef}
		onValueChange={handleApiReport}
		isErroneous={phoneError}
		class="main"
	/>

	<div style="margin-top: 1rem; display: flex; gap: 10px;">
		<button
			onclick={handleFormReset}
			style="background: #ddd; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;"
		>
			Clear Form
		</button>
	</div>
</div>
