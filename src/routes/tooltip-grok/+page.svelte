<script lang="ts">
	import { CRReactiveTooltip } from './CRReactiveTooltip';
	import type {
		ITooltipOptions,
		TStick,
		TLaunchEvent,
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
		stick: 'above',
		content: 'First tooltip,can stay open',
		timeout: 0,
		showOn: 'mouseenter' as TShow,
		hideOn: 'mouseleave' as THide,
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
			hideOn: 'mouseleave',
			userStyles: { color: 'navy', backgroundColor: 'aliceblue' }
		});
	});

	function showBoth() {
		// adjust
		((tip1.timeout = 8000), tip1).show();
		((tip2.timeout = 4000), tip2).show(); // both will be visible at the same time

		// change some options on tip1 when 4 sec elapse
		setTimeout(() => {
			(((tip1.userStyles = { color: 'green', border: '3px solid green' }), (tip1.stick = 'below')),
			tip1).show();
		}, 4000);
	}
</script>

<div class="wrapper">
	<button bind:this={btn1} onclick={() => tip1.show()}>Tooltip 1</button>
	<button bind:this={btn2}>Tooltip 2</button>
	<button onmouseenter={showBoth}>Show both</button>
</div>
<div class="wrapper">
	<button bind:this={btn3}>Tooltip 3</button>
</div>

<style lang="scss">
	.wrapper {
		@include div();
		margin: 4rem auto;
	}
</style>
