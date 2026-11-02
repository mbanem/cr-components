// src/lib/types/global.d.ts (or inside app.d.ts)
// import type { HandleTryCatchType } from '$lib/utils/helpers';
// import { type THandleTryCatch } from '$lib/utils/helpers';

// declare global {
//   type THandleTryCatch = typeof import('$lib/utils/helpers.ts').handleTryCatch;
//   // This tells TS that globalThis has this property
//   var handleTryCatch: THandleTryCatch;
// }

// export { };