export async function resolveWithin<T>(operation: () => Promise<T>, fallback: T, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => resolve(fallback), timeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve().then(operation).catch(() => fallback), timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
