
type THandleTryCatch = typeof handleTryCatch;
export type { THandleTryCatch };

export function handleTryCatch(err: unknown, info?: string) {
	console.error(`[Error Context: ${info || 'Unknown'}]`, err);
	// Add custom Svelte 5 / UI notification frameworks here if needed
}
