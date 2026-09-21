<script lang="ts">
	import CRInputText from './CRInputText.svelte';
	import Tooltip from '$lib/components/CReactiveTooltip.svelte';

	let first = $state('');
	let phone = $state('');
	let formValue = $state('');
	let tooltip = $state<Tooltip>();
	// 1. Create a variable typed to the component instance interface
	let nameInputRef: ReturnType<typeof CRInputText> | undefined = $state();
	function handleFormReset() {
		// 2. Call the child's reset method safely if the reference is bound
		nameInputRef?.reset();
	}

	function handleApiReport(val: string) {
		console.log('Parent hook triggered with processed string: ', val);
	}

	function firstNameError(value: string): string {
		return value.length > 1 ? '' : 'must have at least two chars in\nlength and not less than that';
	}
</script>

<div style="max-width: 16rem; padding: 20px;">
	<!-- 3. Attach the instance reference using bind:this -->
	<CRInputText
		label="firstName"
		bind:value={formValue}
		bind:this={nameInputRef}
		allowedChars="[a-zA-z -]"
		capitalize="capitalize"
		isErroneous={firstNameError}
		isDisabled={false}
		reportOn="Enter"
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
<Tooltip bind:this={tooltip} />
