// utils.ts

// The result type stays the same
export type SafeResult<T> =
  | { data: T; error?: never }
  | { data?: never; error: Error };

// 🎯 Overload 1: No argument
export async function safeCall<T>(
  fn: () => T | Promise<T>
): Promise<SafeResult<T>>;

// 🎯 Overload 2: With a single argument (any type, typically an object)
export async function safeCall<T, A>(
  fn: (arg: A) => T | Promise<T>,
  arg: A
): Promise<SafeResult<T>>;

// 🔧 The actual implementation
export async function safeCall<T, A>(
  fn: (arg?: A) => T | Promise<T>,
  arg?: A
): Promise<SafeResult<T>> {
  try {
    const data = await fn(arg);
    return { data };
  } catch (err) {
    return {
      error: err instanceof Error ? err : new Error(String(err))
    };
  }
}

// --- Mock functions for testing ---

// A function that takes NO argument
export function getUserName(): string {
  const mr = Math.random()
  console.log(mr)
  if (mr < 0.5) {
    // console.log('says less than 0.5')
    return "Matia & Filip Isakovic";
  }
  // console.log('throw does not work?')
  throw new Error("Name service unavailable");
  // return new Error("Name service unavailable");
}

// A function that takes ONE object argument
export type GetUserParams = { id: number; includeAvatar: boolean };
export async function getUser(params: GetUserParams): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.5) {
        const avatar = params.includeAvatar ? " 🖼️" : "";
        resolve(`User #${params.id} Matia Isakovic ${avatar}`);
      } else {
        reject(new Error(`Failed to load user #${params.id}`));
      }
    }, 800);
  });
}