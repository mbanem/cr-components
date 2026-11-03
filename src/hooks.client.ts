import type { ClientInit } from '@sveltejs/kit';
import { handleTryCatch } from '$lib/utils/helpers';

export const init: ClientInit = () => {
  globalThis.handleTryCatch = handleTryCatch;
  globalThis.log = console.log
};

