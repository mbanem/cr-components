<script lang="ts">
	import { CRReactiveTooltip } from './CRReactiveTooltip';
	import type {
		ITooltipOptions,
		TStick,
		TUserStyles,
		TShow,
		THide,
		TOnClose,
		THovered
	} from '$lib/types/tooltip-args';

	// let btn1: HTMLButtonElement;
	// let btn2: HTMLButtonElement;
	// let btn3: HTMLButtonElement;

	let tip1: CRReactiveTooltip;
	// let tip2: CRReactiveTooltip;
	// let tip3: CRReactiveTooltip;

	// some (Partial)of tooltip-args used in this page
	const ttOptions = {
		stick: 'left',
		content: 'First tooltip\nhides after 3sec',
		timeout: 3000,
		anchor: { x: 50, y: 150 },
		userStyles: {
			color: 'navy',
			backgroundColor: 'aliceblue',
			padding: '4px 6px',
			border: '1px solid lightgray',
			borderRadius: '4px'
		}
	} satisfies Partial<ITooltipOptions>;

	// $effect will take care of bnt1,btn2,btn3 to be ready
	$effect(() => {
		tip1 = new CRReactiveTooltip(ttOptions);
		let tip2 = new CRReactiveTooltip({ ...ttOptions, timeout: 0, anchor: { x: 250, y: 150 } });
		// tip2 = new CRReactiveTooltip({
		// 	...ttOptions,
		// 	anchor: btn2,
		// 	stick: 'below',
		// 	content: 'Second tooltip,different style',
		// 	showOn: 'mouseenter',
		// 	hideOn: 'mouseleave',
		// 	userStyles: { backgroundColor: 'aliceblue' }
		// });
		// tip3 = new CRReactiveTooltip({
		// 	...ttOptions,
		// 	anchor: btn3,
		// 	stick: 'left',
		// 	content: 'Third tooltip,different style',
		// 	timeout: 0,
		// 	showOn: 'click',
		// 	userStyles: { color: 'navy', backgroundColor: 'aliceblue' }
		// });
	});

	function showBoth() {
		tip1
			.reshape({
				timeout: 8000,
				content: 'First tooltip will change\nposition in 4 sec',
				userStyles: { color: 'red', backgroundColor: 'cornsilk' },
				stick: 'above'
			})
			.show();

		const opt = {
			timeout: 4000,
			content: 'Second position\nmoved from above',
			userStyles: { color: 'green', border: '3px solid green' },
			stick: 'below',
			hideOn: undefined
		} as Partial<ITooltipOptions>;

		// setTimeout(() => {
		// 	tip1.reshape(opt).show();
		// }, 4000);
		// ((tip1.timeout = 4000),
		// (tip1.content = 'Second position\nmved from above'),
		// (tip1.userStyles = { color: 'blue', backgroundColor: 'lightgreen', stick: 'above' }),
		// tip1).show();
		// ((tip2.timeout = 8000), (tip2.content = 'will hide in 8 seconds'), tip2).show(); // both will be visible at the same time
		// reveert tooltip to the starting state as hid will not clear tooltip

		// change some options on tip1 when 4 sec elapse
		setTimeout(() => {
			tip1.reshape(opt).show();
		}, 4000);
		setTimeout(() => {
			tip1.reverse();
			tip1.reverse();
		}, 8000);
	}
</script>

<!-- <div class="wrapper">
	<button
		bind:this={btn1}
		onmouseenter={() =>
			tip1
				.reshape({
					...ttOptions,
					anchor: btn1
				})
				.show()}
		onclick={() =>
			tip1
				.reshape({
					...ttOptions,
					anchor: btn1
				})
				.show()}>on mouseenter & close me</button
	>
	<button bind:this={btn2}>on mouseenter & mouseleave</button>
	<button onmouseenter={showBoth}>Show both</button>
</div>
<div class="wrapper">
	<button bind:this={btn3}>on click & close me</button>
</div> -->

<style lang="scss">
	.wrapper {
		@include div();
		margin: 4rem auto;
	}
</style>
