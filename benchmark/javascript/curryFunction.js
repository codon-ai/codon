export function curry(targetFn) {
  function curried(...args) {
    if (args.length >= targetFn.length) {
      return targetFn(...args);
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  }
  return curried;
}

const add3 = (a, b, c) => a + b + c;
const curriedAdd = curry(add3);
