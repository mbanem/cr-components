<script lang="ts">
	import { onMount } from 'svelte';
	import { ReactiveTooltip } from './ReactiveTooltip';
	import type {
		TTooltipOptions,
		TStick,
		TUserStyles,
		TShow,
		THide,
		TOnClose,
		THovered
	} from '$lib/types/tooltip-args';

	// the anchers that fire events for displaying tooltip
	let btn1: HTMLButtonElement;
	let btn2: HTMLButtonElement;
	let btn3: HTMLButtonElement;

	let tip1: ReactiveTooltip;
	let tip2: ReactiveTooltip;
	let tip3: ReactiveTooltip;
	let pos1: ReactiveTooltip;
	let pos2: ReactiveTooltip;

	// some of Partial tooltip-args used in this page
	const ttOptions = {
		stick: 'left',
		content: 'First tooltip\nhides after 3sec',
		timeout: 3000,
		showOn: 'mouseenter' as TShow,
		userStyles: { color: 'red', backgroundColor: 'cornsilk' }
	} satisfies Partial<TTooltipOptions>;

	const posOptions1 = {
		stick: 'left',
		anchor: { x: 100, y: 200 },
		timeout: 3000,
		content: 'opt1: Set to x: 100 y: 200\nhide after 3sec',
		onClose: wakeUp,
		userStyles: {
			color: 'navy',
			backgroundColor: 'aliceblue',
			width: 'max-content',
			textWrap: 'nowrap',
			padding: '4px 6px',
			border: '1px solid lightgray',
			borderRadius: '4px'
		}
	} satisfies Partial<TTooltipOptions>;
	const posOptions2 = {
		stick: 'left',
		anchor: { x: 280, y: 200 },
		timeout: 0,
		content: `opt2: Set to x: 280 y: 200\nhide on manual click`,
		onClose: wakeUp,
		userStyles: {
			color: 'navy',
			backgroundColor: 'aliceblue',
			width: 'max-content',
			textWrap: 'nowrap',
			padding: '4px 6px',
			border: '1px solid lightgray',
			borderRadius: '4px'
		}
	} satisfies Partial<TTooltipOptions>;

	// $effect will take care that bnt1,vbtn2,vbtn3 are ready
	$effect(() => {
		tip1 = new ReactiveTooltip({
			...ttOptions,
			anchor: btn1
		});
		tip2 = new ReactiveTooltip({
			...ttOptions,
			anchor: btn2,
			stick: 'below',
			content: 'Second tooltip,different style',
			showOn: 'mouseenter',
			hideOn: 'mouseleave',
			onClose: wakeUp,
			userStyles: { backgroundColor: 'aliceblue' }
		});
		tip3 = new ReactiveTooltip({
			...ttOptions,
			anchor: btn3,
			stick: 'right',
			content: 'Stacked to the right and\n, closed when x icon is clicked',
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
			showOn: 'mouseenter' as TShow,
			timeout: 4000,
			content: 'Second position\nmoved from above',
			userStyles: { color: 'green', border: '3px solid green' },
			stick: 'below' as TStick
		} as Partial<TTooltipOptions>;

		((tip2.timeout = 8000), (tip2.content = 'will hide in 8 seconds'), tip2).show(); // both will be visible at the same time

		// change some options on tip1 when 4 sec elapse
		timer1 = setTimeout(() => {
			tip1.reshape(opt).show();
		}, 4000);

		// reverse tooltip to the starting state as hid will not clear tooltip
		timer2 = setTimeout(() => {
			tip1.reverse();
			tip1.reverse();
		}, 8000);
	}
	let f = true; // after tooltip closes set flag to change button caption
	// to 'wake up tooltip'
	let optButton: HTMLButtonElement | undefined = undefined;

	function wakeUp(eventStr?: string, inners?: string) {
		log('wakeUp called', eventStr, inners);
		if (optButton) {
			optButton.innerText = 'wake up tooltip';
			Object.assign(optButton.style, { color: 'white', backgroundColor: 'navy' });
		} else {
			log('no optButton');
		}
	}

	// tooltip to be show at a fix point givennx,y coordinates
	function showOpt(e: MouseEvent) {
		if (f) {
			pos1 = new ReactiveTooltip(posOptions1);
			pos2 = new ReactiveTooltip(posOptions2);
			optButton = e.target as HTMLButtonElement;
			f = false;
		} else {
			pos1.wakeUp();
			pos2.wakeUp();
		}
	}
	let explanation = $state(false);
	function toggleExplanation() {
		if (explanation) {
			log('calling true');
			ReactiveTooltip.optionsToClipboard(true);
		} else {
			log('calling false');
			ReactiveTooltip.optionsToClipboard();
		}
		explanation = !explanation;
	}
	function reshapeOpt1() {
		tip1
			.reshape({
				...posOptions1,
				anchor: { x: 480, y: 120 },
				content: 'reshaped options opt1\ncolor border and content',
				userStyles: {
					color: 'blue',
					border: '3px solid red',
					textWrap: 'nowrap',
					width: 'max-content',
					padding: '3px 1rem'
				}
			})
			.show();
	}
	onMount(() => {
		toggleExplanation();
	});
</script>

<button onclick={toggleExplanation}>toggle explanation</button>
<div class="wrapper" data-caption="Testing Tooltip">
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
<div class="button">
	<button bind:this={btn3}>on click & close me</button>
</div>
<pre class="tooltip-types">

	 <button onclick={showOpt} class="show-opt">show options</button> <button
		onclick={() => {
			pos1.destroy();
			pos2.destroy();
		}}
		class="destroy">destroy tooltup</button
	><button onclick={reshapeOpt1} class="reshaped-opt">reshape</button>

	Those two CRReactiveTooltips are positoned via coordinates x,y
	and are not connected to anyof HTML elements like buttons and
	are displayed at the instantiating of ReactiveTooltip class.
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
		@include container($caption-color: navy);
		margin: 2rem 0 0 6rem;
	}
	.button {
		margin: 1rem 0 0 9rem;
	}
	.tooltip-types {
		margin: 4rem 0 0 2rem;
	}
	.show-opt,
	.destroy,
	.reshaped-opt {
		color: navy;
		background-color: skyblue;
		border: 1px solid gray;
		border-radius: 6px;
		outline: none;
		width: 8rem;
		text-align: center;
		padding: 4px 1rem;
		cursor: pointer;
	}
	.reshaped-opt {
		color: black;
		background-color: lightgreen;
		margin-left: 0.5rem;
	}
	.destroy {
		color: cornsilk;
		background-color: tomato;
	}
</style>
