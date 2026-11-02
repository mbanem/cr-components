
/* try/catch block sends error object and a function name, in
  which it is defined, to the handleTryCatch function, which
  outputs via console.log the function name and error message
  to reveal the function in which the error occured.
*/

export type THandleTryCatch = (err: any, info?: string) => void;
export const handleTryCatch = (err: unknown, info?: string) => {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(info, msg)
}


