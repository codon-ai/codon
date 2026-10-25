export function throttle(fn, limitMs) {
  let inThrottle = false;
  let lastArgs = null;
  return function (...args) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
          setTimeout(() => {
            inThrottle = false;
          }, limitMs);
        } else {
          inThrottle = false;
        }
      }, limitMs);
    } else {
      lastArgs = args;
    }
  };
}
