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

	let btn1: HTMLButtonElement;
	let btn2: HTMLButtonElement;
	let btn3: HTMLButtonElement;

	let tip1: CRReactiveTooltip;
	let tip2: CRReactiveTooltip;
	let tip3: CRReactiveTooltip;

	// some (Partial)of tooltip-args used in this page
	const ttOptions = {
		stick: 'left',
		content: 'First tooltip,can stay open',
		timeout: 0,
		showOn: 'mouseenter' as TShow,
		userStyles: { color: 'red', backgroundColor: 'cornsilk' }
	} satisfies Partial<ITooltipOptions>;

	// $effect will take care of bnt1,btn2,btn3 to be ready
	$effect(() => {
		tip1 = new CRReactiveTooltip({
			...ttOptions,
			anchor: btn1
		});
		tip2 = new CRReactiveTooltip({
			...ttOptions,
			anchor: btn2,
			stick: 'below',
			content: 'Second tooltip,different style',
			showOn: 'mouseenter',
			hideOn: 'mouseleave',
			userStyles: { backgroundColor: 'aliceblue' }
		});
		tip3 = new CRReactiveTooltip({
			...ttOptions,
			anchor: btn3,
			stick: 'left',
			content: 'Third tooltip,different style',
			timeout: 0,
			showOn: 'click',
			userStyles: { color: 'navy', backgroundColor: 'aliceblue' }
		});
	});

	function showBoth() {
		// adjust
		// ((tip1.timeout = 0),
		// (tip1.content = 'First tooltip,can stay open'),
		// (tip1.userStyles = { color: 'red', backgroundColor: 'cornsilk' }),
		// (tip1.stick = 'above'),
		// tip1).show();
		const opt = {
			timeout: 0,
			content: 'First tooltip,can stay open',
			userStyles: { color: 'red', backgroundColor: 'cornsilk', stick: 'above' }
		} as Partial<ITooltipOptions>;
		tip1.reshape(opt).show();
		((tip2.timeout = 0), (tip1.content = 'chenges position\nafter 4 seconds'), tip2).show(); // both will be visible at the same time
		// reveert tooltip to the starting state as hid will not clear tooltip

		// change some options on tip1 when 4 sec elapse
		setTimeout(() => {
			(((tip1.userStyles = { color: 'green', border: '3px solid green' }), (tip1.stick = 'below')),
			(tip1.hideOn = undefined),
			tip1).show();
		}, 4000);
	}
</script>

<div class="wrapper">
	<button bind:this={btn1} onclick={() => tip1.show()}>on mouseenter & close me</button>
	<button bind:this={btn2}>on mouseenter & mouseleave</button>
	<button onmouseenter={showBoth}>Show both</button>
</div>
<div class="wrapper">
	<button bind:this={btn3}>on click & close me</button>
</div>

<style lang="scss">
	.wrapper {
		@include div();
		margin: 4rem auto;
	}
</style>
