export function pipe(...fns) {
  return (initial) => fns.reduce((acc, fn) => fn(acc), initial);
}

export function compose(...fns) {
  return (initial) => fns.reduceRight((acc, fn) => fn(acc), initial);
}

const double = (x) => x * 2;
const inc = (x) => x + 1;
