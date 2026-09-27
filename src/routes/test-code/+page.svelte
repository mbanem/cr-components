<script lang="ts">
	const log = console.log;
	import { SvelteMap } from 'svelte/reactivity';

	// Option tuple or string: string | [value, checked?]
	type TEntryValue = string | [value: string, checked: boolean];

	// Type-safe SvelteMap mapping Label -> [value, checked?]
	type TEntryMap = SvelteMap<string, TEntryValue>;

	let entryMapStr: TEntryMap = new SvelteMap([
		['German bred Pumpernickel', 'Pumpernickel'],
		["Hershey's Chocolate Milk", 'Hershey']
	]);
	let entryMapStrTuple: TEntryMap = new SvelteMap<string, TEntryValue>([
		['German bred Pumpernickel', 'Pumpernickel'],
		["Hershey's Chocolate Milk", 'Hershey'],
		['Milka Chocolate Lila', ['Lila', true]],
		['Vanilla Ice Cream', ['Cogger-V', true]],
		['Chocolate Ice Cream', ['Cogger-C', true]],
		['Blyeberry Ice Cream', ['Cogger-B', true]]
	]);

	for (const [value, item] of entryMapStrTuple.entries()) {
		log(value, item);
	}
</script>
