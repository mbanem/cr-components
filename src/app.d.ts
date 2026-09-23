// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {

	export type TReportOn = 'Enter' | 'input' | 'change' | 'keyup' | 'keypress' | 'keydown' | 'blur' | 'focus' | 'paste';
	// Allows single triggers, pipe-separated triggers (e.g. "paste|keyup|Enter"), or arrays
	export type TReportOnInput = TReportOn | (string & {}) | TReportOn[];
	export type TCallback = (value: string) => void;

	export type TRadioGroup = Record<string, string>

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
