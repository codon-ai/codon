export async function retry(fn, options) {
  const { maxRetries, baseDelayMs, backoffFactor = 2 } = options;
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      const delay = baseDelayMs * Math.pow(backoffFactor, attempt++);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}
