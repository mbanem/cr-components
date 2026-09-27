import { SvelteMap } from 'svelte/reactivity';
export type TCheckboxItem = {
  label: string;
  selected: boolean;
  disabled: boolean;
}

// Option tuple: [value, checked] as non-checked is a default we make
// checked mandatory so TypeScript does not ask for casting
export type TEntryValue = string | [value: string, checked: boolean];
// Type-safe SvelteMap mapping Label -> [value, checked?]
export type TEntryMap = SvelteMap<string, TEntryValue>;

