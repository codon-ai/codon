export function throttle(fn, limitMs) {
  let inThrottle = false;
  let lastArgs = null;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(function next() {
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
          setTimeout(next, limitMs);
        } else {
          inThrottle = false;
        }
      }, limitMs);
    } else {
      lastArgs = args;
    }
  };
}
