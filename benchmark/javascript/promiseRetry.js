export async function retry(fn, options) {
  const factor = options.backoffFactor !== undefined ? options.backoffFactor : 2;
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= options.maxRetries) {
        throw err;
      }
      const delay = options.baseDelayMs * Math.pow(factor, attempt);
      attempt++;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}
