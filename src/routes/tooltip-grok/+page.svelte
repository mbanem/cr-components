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
	let pos: CRReactiveTooltip;

	// some (Partial)of tooltip-args used in this page
	const ttOptions = {
		stick: 'left',
		content: 'First tooltip\nhides after 3sec',
		timeout: 3000,
		showOn: 'mouseenter' as TShow,
		userStyles: { color: 'red', backgroundColor: 'cornsilk' }
	} satisfies Partial<ITooltipOptions>;

	const posOptions = {
		stick: 'left',
		content: 'Set to x: 50 y: 200\nhide after 3sec',
		timeout: 3000,
		anchor: { x: 100, y: 200 },
		userStyles: {
			color: 'navy',
			backgroundColor: 'aliceblue',
			width: 'max-content',
			textWrap: 'nowrap',
			padding: '4px 6px',
			border: '1px solid lightgray',
			borderRadius: '4px'
		}
	} satisfies Partial<ITooltipOptions>;
	// $effect will take care of bnt1,btn2,btn3 to be ready
	$effect(() => {
		// shown immediatelly no showOn  as no way for that
		let pos1 = new CRReactiveTooltip(posOptions);
		let pos2 = new CRReactiveTooltip({
			...posOptions,
			anchor: { x: 250, y: 200 },
			timeout: 0,
			content: 'Set to x: 250 y: 200\nhide on manual click'
		});

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

	let timer1: ReturnType<typeof setTimeout>;
	let timer2: ReturnType<typeof setTimeout>;
	function showBoth() {
		clearTimeout(timer1);
		clearTimeout(timer2);
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

		((tip2.timeout = 8000), (tip2.content = 'will hide in 8 seconds'), tip2).show(); // both will be visible at the same time

		// change some options on tip1 when 4 sec elapse
		timer1 = setTimeout(() => {
			tip1.reshape(opt).show();
		}, 4000);

		// revert tooltip to the starting state as hid will not clear tooltip
		timer2 = setTimeout(() => {
			tip1.reverse();
			tip1.reverse();
		}, 8000);
	}
</script>

<div class="wrapper">
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
					timeout: 0,
					anchor: btn1
				})
				.show()}>on mouseenter & on click</button
	>
	<button bind:this={btn2}>on mouseenter & mouseleave</button>
	<button onmouseenter={showBoth}>Show both</button>
</div>
<div class="wrapper">
	<button bind:this={btn3}>on click & close me</button>
</div>
<pre class="tooltip-types">
	Those two CRReactiveTooltips are positoned via coordinates x,y
	and are not connected to anyof HTML elements like buttons and
	are displayed at the instantiating of CRReactiveTooltip class.
	They could be timeout self-fading or static with a close button.
	On the other hand the buttons control when tooltips are
	displayed as they are at page start created via $effect and 
	destroyed when the page is closed, otherwiese that only hide.
	The reshape method saves previous tooltip options and applies 
	the new one changing the content,styles and/or stick position,
	while thr reverse method restores previous tooltip options.
	All mathods could be chained like .restore().restore() as
	they return tooltip element itself for the next step.
</pre>

<style lang="scss">
	.wrapper {
		@include div();
		margin: 4rem auto;
	}
	.tooltip-types {
		margin: -6rem 0 0 2rem;
	}
</style>
