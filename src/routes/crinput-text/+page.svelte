<script lang="ts">
	import { fade } from 'svelte/transition';
	import CRInputText from './CRInputText.svelte';
	import Tooltip from '$lib/components/CReactiveTooltip.svelte';

	let inputValue = $state('');
	let isZoomed = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined = undefined;
	const imgPath = '/CRInputText.png';
	let tooltip = $state<Tooltip>();
	let notAllowedChar = $state('');

	function onValueChange(val: string) {
		// console.log('Parent onValueChange: ', val);
	}

	function isErroneous(value: string): string {
		return value.length > 1 ? '' : 'must have at least two chars\nin length and not less than that';
	}
	let wrongChartimer: ReturnType<typeof setTimeout>;
	$effect(() => {
		if (notAllowedChar === '') {
			return;
		}
		clearTimeout(wrongChartimer);
		wrongChartimer = setTimeout(() => {
			notAllowedChar = '';
		}, 800);
	});
</script>

<div style="max-width: 18rem; padding: 6px 1rem;">
	<CRInputText
		label="firstName"
		reportOn="paste|keyup|Enter"
		bind:value={inputValue}
		minLength="2"
		maxLength="24"
		allowedChars="[a-zA-z -]"
		bind:notAllowedChar
		capitalize="capitalize"
		{isErroneous}
		isDisabled={false}
		{onValueChange}
	/>
	<div class="thumbnail-wrapper" data-caption="Input Text">
		<img
			src={imgPath}
			alt="Instantiation snippet summary"
			width="100"
			height="auto"
			class="thumbnail-img"
			onmouseenter={() => {
				timer = setTimeout(() => {
					isZoomed = true;
				}, 600);
			}}
			onmouseleave={() => clearTimeout(timer)}
		/>
		<p style="padding;0;margin:0 0 0 -8rem;">inputValue {inputValue}</p>
		<p style="padding;0;margin:0 0 0 -8rem;">non-alowed char {notAllowedChar}</p>
		{#if isZoomed}
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img
				src={imgPath}
				alt="Full code preview"
				class="overlay-img"
				transition:fade={{ duration: 250 }}
			/>
			<div class="hitbox-mask" onmouseleave={() => (isZoomed = false)} aria-hidden={true}></div>
		{/if}
	</div>
</div>
<Tooltip bind:this={tooltip} />

<!-- <Tooltip /> -->

<style lang="scss">
	.thumbnail-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		margin: 2rem 0 0 23rem;
		position: relative;
		display: inline-block;
	}
	.thumbnail-img {
		margin: 0 0 0 4rem;
		border-radius: 3px;
		cursor: zoom-in;
		display: block;
	}
	%overlay-dimensions {
		position: absolute;
		top: 0px;
		left: -314px;
		width: 479px;
		height: auto;
		aspect-ratio: 400 / 300;
		border-radius: 8px;
	}
	.overlay-img {
		@extend %overlay-dimensions;
		z-index: 100;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
		border: 1px solid #ccc;
		background-color: #1e1e1e;
	}
	.hitbox-mask {
		@extend %overlay-dimensions;
		z-index: 101;
		background: transparent;
		cursor: zoom-out;
	}
</style>
