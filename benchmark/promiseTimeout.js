export function withTimeout(promise, timeoutMs, errorMessage = "Operation timed out") {
  const timeoutPromise = new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    promise.finally(() => clearTimeout(timer));
  });
  return Promise.race([promise, timeoutPromise]);
}
