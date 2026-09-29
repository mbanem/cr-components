// import { SvelteMap } from 'svelte/reactivity';
// export type value = string
// export type TBoxItem = {
//   label: string;
//   selected: boolean;
//   disabled: boolean;
// }

// // Option tuple: [value, checked] as non-checked is a default we make
// // checked mandatory so TypeScript does not ask for casting
// export type TEntryValue = string | [value: string, checked: boolean];
// // Type-safe SvelteMap mapping Label -> [value, checked?]
// export type TEntryMap = SvelteMap<string, TEntryValue>;

import { SvelteMap } from 'svelte/reactivity';

export type value = string;

export type TRadioItem = {
  label: string;
  selected: boolean;
  disabled: boolean;
};

// Value of checkbox/radio element is used as a key to access SvelteMap<value, item>
export type TEntryValue = string | [value: string, disabled?: boolean];

// Type-safe SvelteMap mapping value -> [label, disabled?]
export type TEntryMap = SvelteMap<string, TEntryValue>;