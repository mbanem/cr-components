import type { ClientInit } from '@sveltejs/kit';
import { handleTryCatch } from '$lib/utils/helpers';

export const init: ClientInit = () => {
  globalThis.handleTryCatch = handleTryCatch;
  globalThis.log = console.log;
  (
    globalThis as typeof globalThis & {
      log: typeof console.log;
    }
  ).log = console.log;
};