export type TSafeCall = <T>(fn: () => Promise<T>) => Promise<{ data?: T; error?: Error }>;
// While the function is async it handles synchronous call immediatelly
// depending on what fn callback return type is Promise<T> or T (line 6)
export async function safeCall<T>(
  fn: () => T | Promise<T>
): Promise<{ data?: T; error?: Error }> {
  try {
    // 'await' safely handles Promises, and instantly resolves sync values.
    // If fn() throws synchronously, the try block catches it immediately.
    const data = await fn();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error(String(error))
    };
  }
}
/*usage
  import { safeCall } from '$lib/utils/halpers'
  ...
  const { data, error } = await safeCall(reference of a targetFunction);
*/