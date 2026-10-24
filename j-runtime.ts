/**
 * J-Runtime: Lightweight combinators and array primitives supporting J semantics in JavaScript.
 */

// --- Combinators (Trains) ---

export function fork(f: any, g: any, h: any) {
    return function (...args: any[]) {
        if (args.length <= 1) {
            const y = args[0];
            const left = typeof f === "function" ? f(y) : f;
            const right = typeof h === "function" ? h(y) : h;
            return typeof g === "function" ? g(left, right) : g;
        } else {
            const [x, y] = args;
            const left = typeof f === "function" ? f(x, y) : f;
            const right = typeof h === "function" ? h(x, y) : h;
            return typeof g === "function" ? g(left, right) : g;
        }
    };
}

export function hook(f: any, g: any) {
    return function (...args: any[]) {
        if (args.length <= 1) {
            const y = args[0];
            const right = typeof g === "function" ? g(y) : g;
            return typeof f === "function" ? f(y, right) : f;
        } else {
            const [x, y] = args;
            const right = typeof g === "function" ? g(y) : g;
            return typeof f === "function" ? f(x, right) : f;
        }
    };
}

export function atop(f: any, g: any) {
    return function (...args: any[]) {
        const inner = typeof g === "function" ? g(...args) : g;
        return typeof f === "function" ? f(inner) : f;
    };
}

export function rank(fn: any, k: number = 0) {
    return function (target: any) {
        if (!Array.isArray(target)) return fn(target);
        if (k === 0) {
            return target.map((item) => (Array.isArray(item) ? rank(fn, 0)(item) : fn(item)));
        }
        return target.map(fn);
    };
}

// --- Folds & Scans ---

export function fold(fn: any, target: any[], init?: any) {
    if (!Array.isArray(target) || target.length === 0) return init;
    if (init === undefined) {
        return target.reduce((acc, val) => fn(acc, val));
    }
    return target.reduce((acc, val) => fn(acc, val), init);
}

export function scan(fn: any, target: any[], init?: any) {
    if (!Array.isArray(target) || target.length === 0) return [];
    const results: any[] = [];
    let acc = init !== undefined ? init : target[0];
    const startIdx = init !== undefined ? 0 : 1;
    if (init === undefined) results.push(acc);
    for (let i = startIdx; i < target.length; i++) {
        acc = fn(acc, target[i]);
        results.push(acc);
    }
    return results;
}

export function sum(target: number[]): number {
    if (!Array.isArray(target) || target.length === 0) return 0;
    return target.reduce((a, b) => a + b, 0);
}

export function product(target: number[]): number {
    if (!Array.isArray(target) || target.length === 0) return 1;
    return target.reduce((a, b) => a * b, 1);
}

export function div(a: any, b: any): any {
    if (Array.isArray(a) && typeof b === "number") {
        return a.map((x) => x / b);
    }
    if (typeof a === "number" && Array.isArray(b)) {
        return b.map((x) => a / x);
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        return a.map((x, i) => x / b[i]);
    }
    return a / b;
}

// --- Array Primitives ---

export function tally(target: any): number {
    if (Array.isArray(target) || typeof target === "string") return target.length;
    if (target === null || target === undefined) return 0;
    return 1;
}

export function shape(target: any): number[] {
    const dims: number[] = [];
    let cur = target;
    while (Array.isArray(cur)) {
        dims.push(cur.length);
        cur = cur[0];
    }
    return dims;
}

export function head(target: any): any {
    if (Array.isArray(target) || typeof target === "string") return target[0];
    return target;
}

export function tail(target: any): any {
    if (Array.isArray(target) || typeof target === "string") return target[target.length - 1];
    return target;
}

export function behead(target: any): any {
    if (Array.isArray(target)) return target.slice(1);
    if (typeof target === "string") return target.slice(1);
    return [];
}

export function curtail(target: any): any {
    if (Array.isArray(target)) return target.slice(0, -1);
    if (typeof target === "string") return target.slice(0, -1);
    return [];
}

export function take(n: number, target: any): any {
    if (Array.isArray(target) || typeof target === "string") {
        if (n >= 0) return target.slice(0, n);
        return target.slice(target.length + n);
    }
    return target;
}

export function drop(n: number, target: any): any {
    if (Array.isArray(target) || typeof target === "string") {
        if (n >= 0) return target.slice(n);
        return target.slice(0, target.length + n);
    }
    return target;
}

export function range(n: number): number[] {
    return Array.from({ length: Math.max(0, n) }, (_, i) => i);
}

export function from(indices: any, target: any[]): any {
    if (!Array.isArray(target)) return target;
    if (Array.isArray(indices)) {
        return indices.map((idx) => target[idx < 0 ? target.length + idx : idx]);
    }
    return target[indices < 0 ? target.length + indices : indices];
}

export function gradeUp(target: any[]): number[] {
    if (!Array.isArray(target)) return [];
    return target
        .map((val, idx) => ({ val, idx }))
        .sort((a, b) => (a.val < b.val ? -1 : a.val > b.val ? 1 : 0))
        .map((item) => item.idx);
}

export function gradeDown(target: any[]): number[] {
    if (!Array.isArray(target)) return [];
    return target
        .map((val, idx) => ({ val, idx }))
        .sort((a, b) => (a.val > b.val ? -1 : a.val < b.val ? 1 : 0))
        .map((item) => item.idx);
}

export function box(val: any): any {
    return { __j_box__: true, value: val };
}

export function open(val: any): any {
    if (val && typeof val === "object" && val.__j_box__) return val.value;
    return val;
}
