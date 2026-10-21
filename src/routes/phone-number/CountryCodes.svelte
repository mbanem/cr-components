<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { sixHash } from '$lib/utils';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { firstStep } from '$lib/constants';
	// type TCountryCodes = { dialCode: string, code: string }
	import { getCountryCodesMap, type TCountryName, type TCountryCodes } from './country-codes';

	// let ccCode = $state<ReturnType<typeof import('./CountryCodes.svelte').default> | null>(null);
	let countryCodesMap: SvelteMap<TCountryName, TCountryCodes>;
	const maxInputElWidth = '16rem';
	interface PROPS extends Partial<HTMLInputAttributes> {
		countryCode: string;
		isExpanded: boolean;
		loadCountryMap: boolean;
	}
	let {
		countryCode = $bindable(''),
		isExpanded = $bindable(false),
		loadCountryMap = false,
		...restProps
	}: PROPS = $props();

	let caption = $state('');
	let value = $state('');
	let inputEl = $state<HTMLInputElement>();
	if (countryCode && loadCountryMap) {
		countryCodesMap = getCountryCodesMap();
		console.log('countryCodesMap', countryCodesMap.size);
		loadCountryMap = false;
	}
	// let inputEl: HTMLInputElement | null = null;

	export const codesMap = new SvelteMap();

	let countryCandidates = $derived.by(() => {
		if (!value || value.length === 1) {
			console.log('$derived -- no search', value);
			return '';
		}
		return Array.from(countryCodesMap.keys()).filter((countryName) =>
			countryName.toLowerCase().startsWith(value.toLowerCase())
		);
	}) as string[];

	function searchCountry(e: Event | KeyboardEvent) {
		console.log('searchCountry');
		if (!countryCandidates) {
			console.log('no countryCandidates');
			return;
		}
		console.log('countryCandidates', countryCandidates);
		if (countryCandidates.length > 1) {
			countryCandidates.forEach((countryName) => {
				const d = countryCodesMap.get(countryName);
				console.log(countryName, countryCodesMap.get(countryName));
			});
		} else {
			const dial = countryCodesMap.get(countryCandidates[0]);
			console.log(countryCandidates[0], dial);
			inputEl!?.blur();
			value = dial?.dialCode as string;
		}
	}
	function setCountryCode() {
		console.log('setCountryCode');
		countryCode = sixHash();
		console.log('setCountryCode', countryCode);
	}

	function handleKeyup(e: KeyboardEvent) {
		console.log('handleKeyup', e.key);
	}
	function hideCountyCodesBox(e: FocusEvent) {
		console.log('on blur hide box');
		countryCode = value;
		inputEl.style.opacity = '0';
	}
</script>

<!-- <button onclick={setCountryCode}>set country code</button> -->
<!-- bind:value={countryCode} 
class:--country-candidates={`"${countryCandidates}"`}
 
onblur={hideCountyCodesBox}
-->

<input
	bind:value
	bind:this={countryCodesEl}
	class="country-codes"
	type="text"
	placeholder="Start entering country name"
	onkeyup={countryCodesKeyup}
	oninput={searchCountryName}
/>

<style lang="scss">
	.country-wrapper {
		border: 1px solid lightgray;
	}
	.country-codes {
		width: 18rem;
		position: relative;
		padding-left: 0;
		border: 3px solid blue;
		z-index: 101;
		&::before {
			position: absolute;
			content: var(--country-candidates);
			top: 2rem;
			left: 0;
		}
	}
</style>
