

import type { ServerInit } from '@sveltejs/kit';
import { handleTryCatch } from '$lib/utils/helpers';

export const init: ServerInit = () => {
  globalThis.handleTryCatch = handleTryCatch;
};
