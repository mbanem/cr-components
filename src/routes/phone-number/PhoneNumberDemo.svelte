<script lang="ts">
	import { fade } from 'svelte/transition';
	import PhoneNumber, {
		type PROPS as PhoneNumberProps,
		type TValueAttrs
	} from './PhoneNumber.svelte';

	let {
		value = $bindable(''),
		// Provide a default state object here so it's never undefined
		v = $bindable({
			dialCode: '',
			get dialCodeLength() {
				return this.dialCode.length;
			},
			caretStart: 0,
			caretEnd: 0,
			valueLength: 0,
			get phoneLength() {
				return this.valueLength - this.dialCodeLength;
			},
			inTheMiddle: false
		}),
		...restProps
	}: PhoneNumberProps = $props();

	let isZoomed = $state(false);
	let timer: ReturnType<typeof setTimeout>;
	const imgPath = '/phone-number-setup.png';
</script>

<!-- Live Debug State Preview -->
<pre class="rounded bg-gray-100 p-3 text-xs mb-4">
value {value}
$effect v {JSON.stringify(v, null, 2)}
</pre>

<div class="demo-wrapper">
	<div class="phone-wrapper">
		<PhoneNumber bind:value bind:v {...restProps} />
	</div>
	<!-- Thumbnail & Hover Preview Widget -->
	<div class="thumbnail-wrapper" data-caption="Parent Block">
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

<style lang="scss">
	.rounded {
		margin: -1rem 0 0 16rem;
	}
	.demo-wrapper {
		position: relative;
		max-width: 18rem;
		padding: 6px 1rem;
	}
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
