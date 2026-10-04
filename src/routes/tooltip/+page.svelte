<script lang="ts">
	import { onMount } from 'svelte';
	import { CRReactiveTooltip } from './CRReactiveTooltip';
	import type { ITooltipOptions } from './CRReactiveTooltip';
	import type {
		TShowHide,
		THovered,
		TStick,
		TLaunchEvent,
		TOnClose,
	} from './CRReactiveTooltip';

	// ---------- CRREactiveTooltip.ts ------------------
	let tip1: CRReactiveTooltip | undefined = undefined;
	let tip2: CRReactiveTooltip | undefined = undefined;
	let tip3: CRReactiveTooltip | undefined = undefined;
	let tipT1: CRReactiveTooltip | undefined = undefined;
	let tipT2: CRReactiveTooltip | undefined = undefined;
	let tippos: CRReactiveTooltip | undefined = undefined;

	// Create as many independent tooltips as you want
	let btn1: HTMLButtonElement;
	let btn2: HTMLButtonElement;
	let btn3: HTMLButtonElement;

	let btnt1: HTMLButtonElement;
	let btnt2: HTMLButtonElement;

	onMount(() => {
		const tooltipOptions = {
			content: 'First mouseenter tooltip open until mouseleave',
			showHide: 0, // stays until mouseleave
			stick: 'above' as TStick,
			userStyles: { backgroundColor: '#fff0f0', color: 'crimson', border: '1px solid crimson' }
		} satisfies ITooltipOptions;

		const ttOptions = {
			anchor: btnt1!,
			content: 'First mouseenter tooltip open until mouseleave',
			showHide: 1000000, // stays until mouseleave
			stick: 'above' as TStick,
			userStyles: { backgroundColor: '#fff0f0', color: 'crimson', border: '1px solid crimson' }
		} satisfies ITooltipOptions;

		tip1 = new CRReactiveTooltip(tooltipOptions);
		tip2 = new CRReactiveTooltip({ ...tooltipOptions, stick: 'below', anchor: btn2 });

		tip3 = new CRReactiveTooltip({ ...ttOptions, anchor: { x: 100, y: 50 } });

		tipT1 = new CRReactiveTooltip(ttOptions);
		tipT2 = new CRReactiveTooltip({ ...ttOptions, anchor: btnt2 });
		tippos = new CRReactiveTooltip({ ...tooltipOptions, anchor: { x: 200, y: 200 } });
	});
	function show1() {
		tip1?.show();
	}

	function show2() {
		tip2?.show();
	}

	function showBoth() {
		tip1?.show();
		tip2?.show();
	}
	function showT1(e: MouseEvent) {
		if (e.type === 'mouseenter') {
			console.log('mouseenter showT1');
			tipT1?.show();
		} else {
			console.log('mouseleave showT1');
			tipT1?.hide();
		}
	}
	function showT2(e: MouseEvent) {
		if (e.type === 'mouseenter') {
			tipT2?.show();
		} else {
			tipT2?.hide();
		}
	}
	function divOnMouseOver(e: MouseEvent | FocusEvent) {
		console.log('divOnMouseOver');
		// tippos?.show('mouseover' as TLaunchEvent);
		tippos?.show();
	}
</script>

<!-- CRReactiveTooltip.ts start -->
<div class="main">
	<div class="buttons-wrapper">
		<button bind:this={btn1} onclick={show1}>click to show tooltip</button>
		<button bind:this={btn2} onclick={show2}>click to show tooltip</button>
		<button bind:this={btn3} onclick={showBoth}>Show both</button>
	</div>
	<div class="buttons-wrapper">
		<button bind:this={btnt1} onmouseenter={showT1} onmouseleave={showT1}>mouse enter/leave</button>
		<button bind:this={btnt2} onmouseenter={showT2} onmouseleave={showT2}>mouse enter/leave</button>
	</div>
	<div class="div-mouse-over" onmouseover={divOnMouseOver} onfocus={divOnMouseOver} role="note">
		on mouse over
	</div>
</div>

<!-- CRReactiveTooltip.ts end -->

<style lang="scss">
	.main {
		margin: 3rem auto;
		border: 1px solid gray;
		border-radius: 10px;
		width: max-content;
		padding: 0.5rem 1rem;
		.buttons-wrapper {
			width: max-content;
			button {
				margin-top: 0.5rem;
				padding: 0.4rem 1rem;
			}
		}
	}
	.div-mouse-over {
		border: 1px solid gray;
		border-radius: 5px;
		width: max-content;
		padding: 3px 1rem;
		cursor: pointer;
	}
	:global(.dynamic-tooltip) {
		width: 6rem;
		height: 4rem;
		border: 1px solid blue;
		border-radius: 6px;
		color: blue;
		background-color: aliceblue;
	}
</style>
