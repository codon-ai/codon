export function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...next) => curried(...args, ...next);
  };
}
const add3 = (a, b, c) => a + b + c;
const curriedAdd = curry(add3);
console.log(curriedAdd(1)(2)(3) === 6 && curriedAdd(1, 2)(3) === 6);
