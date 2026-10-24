import { describe, test, expect } from "bun:test";
import { JToASTParser } from "../j-parser";
import { JToJSTranspiler, JSToJTranspiler } from "../transpilers";
import * as runtime from "../j-runtime";
import * as parser from "@babel/parser";

describe("J ➔ JS: Trains (Forks & Hooks)", () => {
    test("Fork: (+/ % #) evaluates average in runtime", () => {
        const { fork, sum, tally } = runtime;
        const div = (a: number, b: number) => a / b;
        const avg = fork(sum, div, tally);

        expect(avg([1, 2, 3, 4, 5])).toBe(3);
        expect(avg([10, 20, 30])).toBe(20);
    });

    test("Hook: (f g) monadic and dyadic in runtime", () => {
        const { hook } = runtime;
        const add = (a: number, b: number) => a + b;
        const double = (x: number) => x * 2;
        // hook(add, double) y = add(y, double(y)) = y + 2y = 3y
        const triple = hook(add, double);

        expect(triple(5)).toBe(15);
    });

    test("Transpiles Fork expression to JS", () => {
        const jCode = `avg =: (fork f g h)`;
        const astParser = new JToASTParser();
        const ast = astParser.parse(jCode);
        const transpiler = new JToJSTranspiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("fork(f, g, h)");
    });

    test("Transpiles Hook expression to JS", () => {
        const jCode = `hookFn =: (hook f g)`;
        const astParser = new JToASTParser();
        const ast = astParser.parse(jCode);
        const transpiler = new JToJSTranspiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("hook(f, g)");
    });
});

describe("J ➔ JS: Folds, Scans, and Array Primitives", () => {
    test("Sum fold (+/) and Product fold (*/)", () => {
        const jCode = `
total =: +/ (1;2;3;4)
prod =: */ (1;2;3;4)
`;
        const astParser = new JToASTParser();
        const ast = astParser.parse(jCode);
        const transpiler = new JToJSTranspiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("sum([1, 2, 3, 4])");
        expect(js).toContain("product([1, 2, 3, 4])");
    });

    test("Runtime array primitives: tally, range, head, tail, behead, curtail", () => {
        const { tally, range, head, tail, behead, curtail, take, drop } = runtime;
        const nums = range(5); // [0, 1, 2, 3, 4]

        expect(nums).toEqual([0, 1, 2, 3, 4]);
        expect(tally(nums)).toBe(5);
        expect(head(nums)).toBe(0);
        expect(tail(nums)).toBe(4);
        expect(behead(nums)).toEqual([1, 2, 3, 4]);
        expect(curtail(nums)).toEqual([0, 1, 2, 3]);
        expect(take(2, nums)).toEqual([0, 1]);
        expect(drop(2, nums)).toEqual([2, 3, 4]);
    });
});

describe("J ➔ JS: Control Structures & Classes", () => {
    test("Transpiles class with fields, constructor, methods, getters, setters", () => {
        const jCode = `
class. Counter do.
count =: 0
constructor. initial=0 do.
(this.count = initial)
end.
method. increment step=1 do.
(this.count = (this.count + step))
return. this.count
end.
get. current do.
return. this.count
end.
end.
`;
        const astParser = new JToASTParser();
        const ast = astParser.parse(jCode);
        const transpiler = new JToJSTranspiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("class Counter {");
        expect(js).toContain("count = 0;");
        expect(js).toContain("constructor(initial = 0) {");
        expect(js).toContain("increment(step = 1) {");
        expect(js).toContain("get current() {");

        // Validate that generated JS can be parsed by Babel
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles if-elseif-else control flow", () => {
        const jCode = `
if. (x === 1) do.
(console.log 'one')
elseif. (x === 2) do.
(console.log 'two')
else.
(console.log 'other')
end.
`;
        const astParser = new JToASTParser();
        const ast = astParser.parse(jCode);
        const transpiler = new JToJSTranspiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("if (x === 1) {");
        expect(js).toContain("else if (x === 2) {");
        expect(js).toContain("console.log(\"one\");");
    });

    test("Transpiles for_of loop with destructuring", () => {
        const jCode = `
for_of. [key, value] : entries do.
(console.log key value)
end.
`;
        const astParser = new JToASTParser();
        const ast = astParser.parse(jCode);
        const transpiler = new JToJSTranspiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("for (const [key, value] of entries) {");
        expect(js).toContain("console.log(key, value);");
    });

    test("Transpiles try-catch-finally", () => {
        const jCode = `
try. do.
(riskyOperation())
catch. err do.
(console.error err)
finally. do.
(cleanup())
end.
`;
        const astParser = new JToASTParser();
        const ast = astParser.parse(jCode);
        const transpiler = new JToJSTranspiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("try {");
        expect(js).toContain("catch (err) {");
        expect(js).toContain("finally {");
    });
});

describe("JS ➔ J ➔ JS Roundtrip Fidelity", () => {
    test("Object spread and destructuring roundtrip", () => {
        const jsCode = `
const { a, b = 1, ...rest } = options;
const merged = { ...defaultConfig, ...options, active: true };
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const jsToJ = new JSToJTranspiler();
        const jCode = jsToJ.transpile(ast.program as any);

        const jToAst = new JToASTParser();
        const jAst = jToAst.parse(jCode);
        const jToJs = new JToJSTranspiler();
        const roundtripped = jToJs.transpile(jAst);

        expect(() => parser.parse(roundtripped, { sourceType: "module" })).not.toThrow();
        expect(roundtripped).toContain("const {");
        expect(roundtripped).toContain("...rest");
    });

    test("Async/Await and Promise roundtrip", () => {
        const jsCode = `
async function fetchUser(id) {
  const res = await api.get(id);
  return res.data;
}
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const jsToJ = new JSToJTranspiler();
        const jCode = jsToJ.transpile(ast.program as any);

        const jToAst = new JToASTParser();
        const jAst = jToAst.parse(jCode);
        const jToJs = new JToJSTranspiler();
        const roundtripped = jToJs.transpile(jAst);

        expect(() => parser.parse(roundtripped, { sourceType: "module" })).not.toThrow();
        expect(roundtripped).toContain("async function fetchUser(id)");
        expect(roundtripped).toContain("await api.get(id)");
    });
});

describe("J ➔ JS: Lists, Order of Operations & Average", () => {
    test("ARCHIVE/average.j: Transpiles average function and vector correctly", () => {
        const jCode = `
numbers = 1 2 3 4 5
average = +/ numbers % #numbers
`;
        const astParser = new JToASTParser();
        const ast = astParser.parse(jCode);
        const transpiler = new JToJSTranspiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("const numbers = [1, 2, 3, 4, 5];");
        expect(js).toContain("const average = sum(numbers) / numbers.length;");

        // Verify AST can be parsed by Babel
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();

        // Verify runtime execution
        const { sum } = runtime;
        const fn = new Function("sum", `${js}; return { numbers, average };`);
        const result = fn(sum);
        expect(result.numbers).toEqual([1, 2, 3, 4, 5]);
        expect(result.average).toBe(3);
    });

    test("J Space-Separated Numeric Vectors & Negative Sign _", () => {
        const jCode = `
integers = 10 20 30 40
negatives = _1 _2 3 _4
floats = 1.5 2.5 3.5
mixed = _ 10 20
singleNeg = _42
`;
        const astParser = new JToASTParser();
        const ast = astParser.parse(jCode);
        const transpiler = new JToJSTranspiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("const integers = [10, 20, 30, 40];");
        expect(js).toContain("const negatives = [-1, -2, 3, -4];");
        expect(js).toContain("const floats = [1.5, 2.5, 3.5];");
        expect(js).toContain("const mixed = [Infinity, 10, 20];");
        expect(js).toContain("const singleNeg = -42;");
    });

    test("J Right-to-Left Order of Operations (No Operator Precedence)", () => {
        const jCode = `
res1 = 2 * 3 + 4
res2 = 10 - 4 - 3
res3 = 20 % 2 + 3
res4 = 10 - 5 - 2
`;
        const astParser = new JToASTParser();
        const ast = astParser.parse(jCode);
        const transpiler = new JToJSTranspiler();
        const js = transpiler.transpile(ast);

        // In J: 2 * (3 + 4) = 14
        // In J: 10 - (4 - 3) = 9
        // In J: 20 % (2 + 3) = 20 / 5 = 4
        // In J: 10 - (5 - 2) = 7
        const fn = new Function(`${js}; return { res1, res2, res3, res4 };`);
        const result = fn();
        expect(result.res1).toBe(14);
        expect(result.res2).toBe(9);
        expect(result.res3).toBe(4);
        expect(result.res4).toBe(7);
    });

    test("J Monadic Verbs: Tally (#), Reciprocal (%), Sqrt (%:), Abs (|)", () => {
        const jCode = `
len1 = # numbers
len2 = # (10;20;30)
recip = % 4
sq = %: 25
ab = | _10
`;
        const astParser = new JToASTParser();
        const ast = astParser.parse(jCode);
        const transpiler = new JToJSTranspiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("const len1 = numbers.length;");
        expect(js).toContain("const len2 = [10, 20, 30].length;");
        expect(js).toContain("const recip = 1 / 4;");
        expect(js).toContain("const sq = Math.sqrt(25);");
        expect(js).toContain("const ab = Math.abs(-10);");

        const fn = new Function("numbers", `${js}; return { len1, len2, recip, sq, ab };`);
        const result = fn([1, 2, 3, 4, 5]);
        expect(result.len1).toBe(5);
        expect(result.len2).toBe(3);
        expect(result.recip).toBe(0.25);
        expect(result.sq).toBe(5);
        expect(result.ab).toBe(10);
    });
});
