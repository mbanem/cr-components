<script lang="ts">
	import CRInputText from './CRInputText.svelte';
	import Tooltip from '$lib/components/CReactiveTooltip.svelte';

	let inputValue = $state('');
	// let tooltip = $state<Tooltip>();

	function onValueChange(val: string) {
		// console.log('Parent onValueChange: ', val);
	}

	function isErroneous(value: string): string {
		return value.length > 1 ? '' : 'must have at least two chars in\nlength and not less than that';
	}
</script>

<div style="max-width: 18rem; padding: 6px 1rem;">
	<CRInputText
		label="firstName"
		reportOn="paste|keyup|Enter"
		bind:value={inputValue}
		minLength="2"
		maxLength="24"
		allowedChars="[a-zA-z -]"
		capitalize="capitalize"
		{isErroneous}
		isDisabled={false}
		{onValueChange}
	/>
</div>
<!-- <Tooltip bind:this={tooltip} /> -->
<Tooltip />
<p style="padding;0;margin:0 0 0 1rem;">inputValue {inputValue}</p>
<p style="padding;0;margin-left:1rem;">johnDoe</p>
