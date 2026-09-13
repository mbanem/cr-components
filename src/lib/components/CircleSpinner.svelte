<script lang="ts">
	type ARGS = {
		color: string
		duration?: string
		size?: string
		top?: string
	}
	let { color = `black`, duration = `1.5s`, size = `1em`, top = `20%` }: ARGS = $props()
</script>

<!-- border-color for every side top right bottom left 
	NOTE: dynamic style
-->
<div
	class="comrunner-div"
	style:border-color="{color} transparent {color}
	{color}"
	style="--duration: {duration}"
	style:width={size}
	style:height={size}
	style:top
></div>

<style>
	.comrunner-div {
		display: inline-block;
		vertical-align: middle;
		margin: 0 4pt;
		border-width: calc(1em / 5);
		border-style: solid;
		border-radius: 50%;
		animation: var(--duration) infinite rotate;
		position: absolute;
		left: 0;
		top: 4px;
		color: black;
	}
	@keyframes rotate {
		100% {
			transform: rotate(360deg);
		}
	}
</style>
