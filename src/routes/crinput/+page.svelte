<script lang="ts">
	import CRInputText from './CRInputText.svelte';

	let first = $state('');
	let phone = $state('');
	let formValue = $state('');
	// 1. Create a variable typed to the component instance interface
	let nameInputRef: ReturnType<typeof CRInputText> | undefined = $state();
	let phoneInputRef: ReturnType<typeof CRInputText> | undefined = $state();
	function handleFormReset() {
		// 2. Call the child's reset method safely if the reference is bound
		phoneInputRef?.reset();
		nameInputRef?.reset();

		console.log(nameInputRef?.applyCapitalization('matia isakovic'));
	}

	function handleApiReport(val: string) {
		console.log('Parent hook triggered with processed string: ', val);
	}
	function phoneError(value: string): string {
		const fmt = /\d{3,3}-\d{3,3}-\d{4,4}/.test(phone);
		return fmt ? '' : 'in format xxx-xxx-xxxx';
	}
	function firstNameError(value: string): string {
		return value.length > 1 ? '' : 'must have at least two chars';
	}
</script>

<div style="max-width: 400px; padding: 20px;">
	<!-- Instance 1: Only numbers allowed, filters input text directly inside keydown -->
	<CRInputText
		label="phoneNumber"
		allowedChars="0-9\-"
		reportOn="blur"
		bind:value={phone}
		bind:this={phoneInputRef}
		onValueChange={handleApiReport}
		isErroneous={phoneError}
	/>

	<p>formValue {formValue}</p>
	<!-- 3. Attach the instance reference using bind:this -->
	<CRInputText
		label="firstName"
		bind:value={formValue}
		bind:this={nameInputRef}
		capitalize="capitalize"
		isErroneous={firstNameError}
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
