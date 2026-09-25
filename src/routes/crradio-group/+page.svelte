<script lang="ts">
	import CRRadioGroup from './CRRadioGroup.svelte';
	const disabled = true;
	// The value is bound to a selected radio button holding its value
	// If non-empty the button with such a value would be initilly selected
	// The value of a radio button to be disabled if non-empty string
	let disabledButtons = $state(['Pumpernickel', 'Melitta']);

	// Component reports some radio is selected sending its value
	function onValueChange(val: string) {
		console.log('parent onValueChange: ', val);
	}

	// in radio group at most one radio could be selecte
	let selectedValue = $state('Lila');
</script>

<div style="max-width: 18rem; padding: 6px 1rem;">
	<CRRadioGroup
		caption="Select a Product"
		radios={{
			'German bred Pumpernickel': ['Pumpernickel', disabled],
			"Hershey's Chocolate Milk ": 'Hershey',
			'Brasilian French-Roast Coffee Melitta': ['Melitta', disabled],
			'Milka Chocolate Lila': 'Lila',
			'Dove Soap Original Beauty Bar': 'Original Beauty Bar'
		}}
		reportOn="change|focus"
		{onValueChange}
		bind:selectedValue
		bind:disabledButtons
		style="border-color:green;"
		class="main"
	/>
</div>
<p style="margin-left:1rem;">
	At parent. Selected Product <span style="color:crimson;">{selectedValue}</span>
</p>

<style lang="scss">
</style>
