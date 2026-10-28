// $lib/utils/handleTryCatch.ts
export async function handleTryCatch<T>(
  fn: () => Promise<T>
): Promise<{ data?: T; error?: Error }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
}