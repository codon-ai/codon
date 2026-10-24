import { describe, test, expect } from "bun:test";
import { CodonToASTParser } from "../codon-parser";
import { CodonToJSCompiler, JSToCodonTranslator } from "../transpilers";
import * as runtime from "../codon-runtime";
import * as parser from "@babel/parser";

describe("Codon ➔ JS: Trains (Forks & Hooks)", () => {
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
        const codonCode = `avg =: (fork f g h)`;
        const astParser = new CodonToASTParser();
        const ast = astParser.parse(codonCode);
        const transpiler = new CodonToJSCompiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("fork(f, g, h)");
    });

    test("Transpiles Hook expression to JS", () => {
        const codonCode = `hookFn =: (hook f g)`;
        const astParser = new CodonToASTParser();
        const ast = astParser.parse(codonCode);
        const transpiler = new CodonToJSCompiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("hook(f, g)");
    });
});

describe("Codon ➔ JS: Folds, Scans, and Array Primitives", () => {
    test("Sum fold (+/) and Product fold (*/)", () => {
        const codonCode = `
total =: +/ (1;2;3;4)
prod =: */ (1;2;3;4)
`;
        const astParser = new CodonToASTParser();
        const ast = astParser.parse(codonCode);
        const transpiler = new CodonToJSCompiler();
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

describe("Codon ➔ JS: Control Structures & Classes", () => {
    test("Transpiles class with fields, constructor, methods, getters, setters", () => {
        const codonCode = `
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
        const astParser = new CodonToASTParser();
        const ast = astParser.parse(codonCode);
        const transpiler = new CodonToJSCompiler();
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
        const codonCode = `
if. (x === 1) do.
(console.log 'one')
elseif. (x === 2) do.
(console.log 'two')
else.
(console.log 'other')
end.
`;
        const astParser = new CodonToASTParser();
        const ast = astParser.parse(codonCode);
        const transpiler = new CodonToJSCompiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("if (x === 1) {");
        expect(js).toContain("else if (x === 2) {");
        expect(js).toContain("console.log(\"one\");");
    });

    test("Transpiles for_of loop with destructuring", () => {
        const codonCode = `
for_of. [key, value] : entries do.
(console.log key value)
end.
`;
        const astParser = new CodonToASTParser();
        const ast = astParser.parse(codonCode);
        const transpiler = new CodonToJSCompiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("for (const [key, value] of entries) {");
        expect(js).toContain("console.log(key, value);");
    });

    test("Transpiles try-catch-finally", () => {
        const codonCode = `
try. do.
(riskyOperation())
catch. err do.
(console.error err)
finally. do.
(cleanup())
end.
`;
        const astParser = new CodonToASTParser();
        const ast = astParser.parse(codonCode);
        const transpiler = new CodonToJSCompiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("try {");
        expect(js).toContain("catch (err) {");
        expect(js).toContain("finally {");
    });
});

describe("JS ➔ Codon ➔ JS Roundtrip Fidelity", () => {
    test("Object spread and destructuring roundtrip", () => {
        const jsCode = `
const { a, b = 1, ...rest } = options;
const merged = { ...defaultConfig, ...options, active: true };
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const jsToCodon = new JSToCodonTranslator();
        const codonCode = jsToCodon.transpile(ast.program as any);

        const codonToAst = new CodonToASTParser();
        const codonAst = codonToAst.parse(codonCode);
        const codonToJs = new CodonToJSCompiler();
        const roundtripped = codonToJs.transpile(codonAst);

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
        const jsToCodon = new JSToCodonTranslator();
        const codonCode = jsToCodon.transpile(ast.program as any);

        const codonToAst = new CodonToASTParser();
        const codonAst = codonToAst.parse(codonCode);
        const codonToJs = new CodonToJSCompiler();
        const roundtripped = codonToJs.transpile(codonAst);

        expect(() => parser.parse(roundtripped, { sourceType: "module" })).not.toThrow();
        expect(roundtripped).toContain("async function fetchUser(id)");
        expect(roundtripped).toContain("await api.get(id)");
    });
});

describe("Codon ➔ JS: Lists, Order of Operations & Average", () => {
    test("ARCHIVE/average.cdn: Transpiles average function and vector correctly", () => {
        const codonCode = `
numbers = 1 2 3 4 5
average = +/ numbers % #numbers
`;
        const astParser = new CodonToASTParser();
        const ast = astParser.parse(codonCode);
        const transpiler = new CodonToJSCompiler();
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

    test("Codon Space-Separated Numeric Vectors & Negative Sign _", () => {
        const codonCode = `
integers = 10 20 30 40
negatives = _1 _2 3 _4
floats = 1.5 2.5 3.5
mixed = _ 10 20
singleNeg = _42
`;
        const astParser = new CodonToASTParser();
        const ast = astParser.parse(codonCode);
        const transpiler = new CodonToJSCompiler();
        const js = transpiler.transpile(ast);

        expect(js).toContain("const integers = [10, 20, 30, 40];");
        expect(js).toContain("const negatives = [-1, -2, 3, -4];");
        expect(js).toContain("const floats = [1.5, 2.5, 3.5];");
        expect(js).toContain("const mixed = [Infinity, 10, 20];");
        expect(js).toContain("const singleNeg = -42;");
    });

    test("Codon Right-to-Left Order of Operations (No Operator Precedence)", () => {
        const codonCode = `
res1 = 2 * 3 + 4
res2 = 10 - 4 - 3
res3 = 20 % 2 + 3
res4 = 10 - 5 - 2
`;
        const astParser = new CodonToASTParser();
        const ast = astParser.parse(codonCode);
        const transpiler = new CodonToJSCompiler();
        const js = transpiler.transpile(ast);

        // In Codon: 2 * (3 + 4) = 14
        // In Codon: 10 - (4 - 3) = 9
        // In Codon: 20 % (2 + 3) = 20 / 5 = 4
        // In Codon: 10 - (5 - 2) = 7
        const fn = new Function(`${js}; return { res1, res2, res3, res4 };`);
        const result = fn();
        expect(result.res1).toBe(14);
        expect(result.res2).toBe(9);
        expect(result.res3).toBe(4);
        expect(result.res4).toBe(7);
    });

    test("Codon Monadic Verbs: Tally (#), Reciprocal (%), Sqrt (%:), Abs (|)", () => {
        const codonCode = `
len1 = # numbers
len2 = # (10;20;30)
recip = % 4
sq = %: 25
ab = | _10
`;
        const astParser = new CodonToASTParser();
        const ast = astParser.parse(codonCode);
        const transpiler = new CodonToJSCompiler();
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

describe("SequenceExpression Support", () => {
    test("Transpiles and roundtrips SequenceExpression in return statements", () => {
        const jsCode = `
function compute() {
  return a(), b(), c();
}
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("return. (a(), b(), c())");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
        expect(roundtrippedJs).toContain("return a(), b(), c();");
    });

    test("Transpiles SequenceExpression evaluation and assignment", () => {
        const jsCode = `
const result = (a = 1, a = a + 2, a * 10);
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
        const fn = new Function(`let a = 0; ${js}; return result;`);
        expect(fn()).toBe(30);
    });

    test("Transpiles ForStatement with sequence update and init", () => {
        const jsCode = `
for (let i = 0, j = 10; i < j; i++, j--) {
  console.log(i, j);
}
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("((i++), (j--))");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
        expect(roundtrippedJs).toContain("i++, j--");
    });
});

describe("ClassExpression & Re-exports Support", () => {
    test("Transpiles and roundtrips anonymous ClassExpression assigned to variable", () => {
        const jsCode = `
const Counter = class {
  count = 0;
  constructor(initial = 0) {
    this.count = initial;
  }
  inc() {
    this.count++;
  }
};
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("Counter =: (class. do.");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
        const fn = new Function(`${roundtrippedJs}; const c = new Counter(5); c.inc(); return c.count;`);
        expect(fn()).toBe(6);
    });

    test("Transpiles and roundtrips named ClassExpression with inheritance", () => {
        const jsCode = `
class Animal {
  constructor(name) {
    this.name = name;
  }
}
const Dog = class Canine extends Animal {
  bark() {
    return "Woof " + this.name;
  }
};
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("Dog =: (class. Canine extends Animal do.");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
        const fn = new Function(`${roundtrippedJs}; const d = new Dog("Buddy"); return d.bark();`);
        expect(fn()).toBe("Woof Buddy");
    });

    test("Transpiles and roundtrips ExportAllDeclaration and re-exports", () => {
        const jsCode = `
export * from "./utils";
export { a, b } from "./math";
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("NB. exAll|./utils");
        expect(codonCode).toContain("NB. ex|a,b:./math");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
        expect(roundtrippedJs).toContain('export * from "./utils";');
        expect(roundtrippedJs).toContain('export { a, b } from "./math";');
    });
});

describe("Monadic @ and @: Await Verb Support", () => {
    test("Transpiles @ expr and @: expr to JavaScript await", () => {
        const codonCode = `
res1 =: @ (fetch url)
res2 =: @: (api.get id)
res3 =: (@ task())
res4 =: (await legacyCall())
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("const res1 = await fetch(url);");
        expect(js).toContain("const res2 = await api.get(id);");
        expect(js).toContain("const res3 = await task();");
        expect(js).toContain("const res4 = await legacyCall();");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles standalone statement await @ expr", () => {
        const codonCode = `
@ (delay 50)
(@ cleanup())
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("await delay(50);");
        expect(js).toContain("await cleanup();");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Roundtrips JS await expressions using @ notation", () => {
        const jsCode = `
async function loadData(endpoint) {
  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
}
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("@");
        expect(codonCode).not.toContain("(await");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
        expect(roundtrippedJs).toContain("await fetch(endpoint)");
        expect(roundtrippedJs).toContain("await response.json()");
    });
});

describe("Concise Object Expressions (Colon Key-Value, Shorthand, Spread)", () => {
    test("Transpiles shorthand property O(counter) to { counter }", () => {
        const codonCode = `
payload =: O(counter)
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("counter");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles colon key-value pairs and multiple shorthand properties", () => {
        const codonCode = `
todo =: O(id;title;completed:0;active:true)
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("id");
        expect(js).toContain("title");
        expect(js).toContain("completed: 0");
        expect(js).toContain("active: true");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles nested objects with spread O(...rest;headers:O('Content-Type':'application/json'))", () => {
        const codonCode = `
opts =: O(...rest;headers:O('Content-Type':'application/json';...defaultHeaders))
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("...rest");
        expect(js).toContain("...defaultHeaders");
        expect(js).toContain('"Content-Type": "application/json"');
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Retains backward compatibility with legacy alternating O('key';val)", () => {
        const codonCode = `
legacy =: O('name';'Alice';'age';30;'...';extra)
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain('name: "Alice"');
        expect(js).toContain("age: 30");
        expect(js).toContain("...extra");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Roundtrips JS object literals with shorthand, colon syntax, and spread", () => {
        const jsCode = `
const channel = "chat";
const data = { msg: "hi" };
const payload = { channel, data, status: 200, ...metadata };
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("channel");
        expect(codonCode).toContain("data");
        expect(codonCode).toContain("status:200");
        expect(codonCode).toContain("...metadata");
        expect(codonCode).not.toContain("'channel';channel");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
        expect(roundtrippedJs).toContain("channel");
        expect(roundtrippedJs).toContain("status: 200");
        expect(roundtrippedJs).toContain("...metadata");
    });
});


