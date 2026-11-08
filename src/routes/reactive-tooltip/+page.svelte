<script lang="ts">
	import Tooltip from '$lib/utils/reactive-tooltip';
	let tooltip: Tooltip = new Tooltip();
	let togglingEl: HTMLDivElement;
	let validateDbParams: HTMLDivElement;
	function showTooltip() {
		tooltip.show(togglingEl as HTMLElement, validateDbParams, -1, 'below', {
			color: 'navy',
			backgroundColor: 'aliceblue'
		});
	}
	function hideTooltip() {
		tooltip.hide();
	}
</script>

<div
	class="toggling-div"
	bind:this={togglingEl}
	onmouseenter={showTooltip}
	onmouseleave={hideTooltip}
	aria-hidden={true}
>
	toggling tooltip on enter/leave
</div>
<div class="mandatory-entries" bind:this={validateDbParams} style="opacity:0;">
	<p>All DB Params are specified</p>
	<p>Click 'Verify Params with Postgres'</p>
	<p>to see if that can be done and if not</p>
	<p>modify some Params and repeat</p>
</div>

<style lang="scss">
	.toggling-div {
		width: 18rem;
		padding: 4px 1rem;
		border: 1px solid gray;
		border-radius: 4px;
		color: navy;
		text-align: center;
		margin: 4rem 0 0 10rem;
		&:hover {
			cursor: pointer;
			color: crimson;
		}
	}
</style>
