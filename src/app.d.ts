// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {

	export type TSingleReportOn = 'Enter' | 'input' | 'change' | 'keyup' | 'keypress' | 'keydown' | 'blur' | 'focus' | 'paste';
	export type TReportOnUnion<T extends string = TSingleReportOn> =
		| T
		| `${T}|${T}`
		| `${T}|${T}|${T}`
	export type TReportOn = TReportOnUnion | TSingleReportOn[];

	// Allows single triggers, pipe-separated triggers (e.g. "paste|keyup|Enter"), or arrays
	// export type TReportOnInput = TReportOn | (string & {}) | TReportOn[];

	export type TCallback = (value: string) => void;

	type TTimer = ReturnType<typeof setTimeout>;
	export type TRCValue = [value: string, checked?: boolean]
	export type TChRbGroup = Record<string, string | TCRValue>
	export type TCheckboxGroup = string[]

	interface String {
		/**
		 * Pretvara prvo slovo stringa u veliko.
		 */
		capitalize(): string
	}
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
