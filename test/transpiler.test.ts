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

        expect(codonCode).toContain("(i++, j--)");

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

        expect(codonCode).toContain("export. * from './utils'");
        expect(codonCode).toContain("export. { a, b } from './math'");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
        expect(roundtrippedJs).toContain('export * from "./utils";');
        expect(roundtrippedJs).toContain('export { a, b } from "./math";');
    });

    test("Retains backward compatibility with legacy NB. exAll| and NB. ex| comments", () => {
        const codonCode = `
NB. exAll|./utils
NB. ex|a,b:./math
`;
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

describe("Concise Direct Definition (Arrow & Anonymous Functions) Support", () => {
    test("Transpiles concise arrow expressions {{params => expr}} to JS", () => {
        const codonCode = `
double =: {{x => (x * 2)}}
add =: {{a, b => (a + b)}}
constant =: {{=> 42}}
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("x => x * 2");
        expect(js).toContain("(a, b) => a + b");
        expect(js).toContain("() => 42");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles concise block arrow functions {{params => do. ... }} to JS", () => {
        const codonCode = `
processItem =: {{x => do.
(console.log x)
return. (x + 1)
}}
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("console.log(x)");
        expect(js).toContain("return x + 1");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles async arrow functions {{async params => expr}} and block forms", () => {
        const codonCode = `
fetchData =: {{async url => @ (fetch url)}}
delayTask =: {{async ms => do.
@ (delay ms)
return. 1
}}
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("async url => await fetch(url)");
        expect(js).toContain("await delay(ms)");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles anonymous function expressions {{fn params => do. ... }} to JS", () => {
        const codonCode = `
handler =: {{fn req, res => do.
(res.json O(ok:true))
}}
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("function (req, res)");
        expect(js).toContain("ok: true");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles arrow function with pattern destructuring", () => {
        const codonCode = `
calc =: {{[x, y] => (x * y)}}
getName =: {{({name}) => name}}
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("([x, y]) => x * y");
        expect(js).toContain("name");
        expect(js).toContain("=> name");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Roundtrips JS arrow functions and anonymous function expressions", () => {
        const jsCode = `
const double = x => x * 2;
const add = (a, b) => a + b;
const run = async () => {
  await delay(10);
  return 42;
};
const handler = function (req, res) {
  res.json({ ok: true });
};
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("{{x => (x * 2)}}");
        expect(codonCode).toContain("{{a,b => (a + b)}}");
        expect(codonCode).toContain("{{async => do.");
        expect(codonCode).toContain("{{fn req,res => do.");
        expect(codonCode).not.toContain("NB. pE|");
        expect(codonCode).not.toContain("NB. pB|");
        expect(codonCode).not.toContain("NB. FE|");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
        expect(roundtrippedJs).toContain("x => x * 2");
        expect(roundtrippedJs).toContain("(a, b) => a + b");
        expect(roundtrippedJs).toContain("function (req, res)");
    });

    test("Retains backward compatibility with legacy NB. pE| and NB. pB| forms", () => {
        const codonCode = `
delay =: ({{ NB. pE|ms
(new Promise ({{ NB. pE|resolve
(setTimeout resolve ms)
}}))
}})
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("ms => new Promise");
        expect(js).toContain("setTimeout(resolve, ms)");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });
});

describe("Concise Function Declarations (fn. and async_fn.) Support", () => {
    test("Transpiles synchronous function declarations fn. name params do. ... end.", () => {
        const codonCode = `
fn. addTodo title do.
return. (Number title)
end.

fn. getTodos do.
return. (0$0)
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("function addTodo(title)");
        expect(js).toContain("function getTodos()");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();

        const fn = new Function(`${js}; return { add: addTodo("42"), list: getTodos() };`);
        const res = fn();
        expect(res.add).toBe(42);
        expect(res.list).toEqual([]);
    });

    test("Transpiles asynchronous function declarations async_fn. name params do. ... end.", async () => {
        const codonCode = `
async_fn. fetchUser id do.
return. O(id;name:'Alice')
end.

async_fn. noop do.
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("async function fetchUser(id)");
        expect(js).toContain("async function noop()");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();

        const fn = new Function(`${js}; return fetchUser(101);`);
        const res = await fn();
        expect(res).toEqual({ id: 101, name: "Alice" });
    });

    test("Transpiles exported function declarations with NB. export and export.", () => {
        const codonCode = `
NB. export
fn. parseData raw do.
return. (raw.trim())
end.

export. async_fn. sendMsg msg do.
return. true
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("export function parseData(raw)");
        expect(js).toContain("export async function sendMsg(msg)");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles function declarations with destructuring and default params", () => {
        const codonCode = `
fn. greet name='world' do.
return. \`Hello \${name}\`
end.

fn. handleItem {id,val} do.
return. (id + val)
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain('function greet(name = "world")');
        expect(js).toContain("function handleItem");
        expect(js).toContain("id");
        expect(js).toContain("val");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();

        const fn = new Function(`${js}; return { g1: greet(), g2: greet("Bob"), h: handleItem({ id: 10, val: 5 }) };`);
        const res = fn();
        expect(res.g1).toBe("Hello world");
        expect(res.g2).toBe("Hello Bob");
        expect(res.h).toBe(15);
    });

    test("Roundtrips JS function declarations with fn. and async_fn.", () => {
        const jsCode = `
function add(a, b) {
  return a + b;
}
async function fetchData(url) {
  return await fetch(url);
}
export function getStatus() {
  return 200;
}
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("fn. add a,b do.");
        expect(codonCode).toContain("async_fn. fetchData url do.");
        expect(codonCode).toContain("fn. getStatus do.");
        expect(codonCode).not.toContain("NB. FD|");
        expect(codonCode).not.toContain("NB. async FD|");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
        expect(roundtrippedJs).toContain("function add(a, b)");
        expect(roundtrippedJs).toContain("async function fetchData(url)");
        expect(roundtrippedJs).toContain("export function getStatus()");
    });

    test("Retains backward compatibility with legacy NB. FD| and NB. async FD| forms", () => {
        const codonCode = `
{{ NB. FD|addTodo|title
result =: (insertStmt.run title)
return. (Number result.lastInsertRowid)
}}

{{ NB. async FD|scanDir|dir,extension
entries =: @ (fs.readdir dir)
return. entries
}}
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("function addTodo(title)");
        expect(js).toContain("async function scanDir(dir, extension)");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });
});

describe("Concise Module Imports and Exports (import. and export.) Support", () => {
    test("Transpiles import. declarations with default, named, namespace, and side-effect specifiers", () => {
        const codonCode = `
import. express from 'express'
import. React,{useState,useRef} from 'react'
import. * as path from 'path'
import. 'style.css'
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain('import express from "express";');
        expect(js).toContain('import React, { useState, useRef } from "react";');
        expect(js).toContain('import * as path from "path";');
        expect(js).toContain('import "style.css";');
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles import. with colon separator and aliased specifiers", () => {
        const codonCode = `
import. express : 'express'
import. {read as readFile,write as writeFile} from 'fs'
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain('import express from "express";');
        expect(js).toContain('import { read as readFile, write as writeFile } from "fs";');
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles export. declarations and export. default", () => {
        const codonCode = `
export. fn. add a,b do.
return. (a + b)
end.

export. class. User do.
end.

export. default (add 1 2)
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("export function add(a, b)");
        expect(js).toContain("export class User");
        expect(js).toContain("export default add(1, 2);");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Roundtrips JS import and export declarations with import. and export.", () => {
        const jsCode = `
import express from "express";
import React, { useState, useRef } from "react";
import * as path from "node:path";
import "reset.css";

export function handleRequest(req, res) {
  return res.json({ ok: true });
}

export class ServiceClient {
  constructor(url) {
    this.url = url;
  }
}
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("import. express from 'express'");
        expect(codonCode).toContain("import. React,{useState,useRef} from 'react'");
        expect(codonCode).toContain("import. * as path from 'node:path'");
        expect(codonCode).toContain("import. 'reset.css'");
        expect(codonCode).toContain("export. fn. handleRequest req,res do.");
        expect(codonCode).toContain("export. class. ServiceClient do.");
        expect(codonCode).not.toContain("NB. i|");
        expect(codonCode).not.toContain("NB. export\n");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
        expect(roundtrippedJs).toContain('import express from "express";');
        expect(roundtrippedJs).toContain('import React, { useState, useRef } from "react";');
        expect(roundtrippedJs).toContain('import * as path from "node:path";');
        expect(roundtrippedJs).toContain('import "reset.css";');
        expect(roundtrippedJs).toContain("export function handleRequest(req, res)");
        expect(roundtrippedJs).toContain("export class ServiceClient");
    });

    test("Retains backward compatibility with legacy NB. i| and NB. export forms", () => {
        const codonCode = `
NB. i|D:express:express|N:useState,useRef:react
NB. export
fn. legacyHandler do.
return. 1
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain('import express from "express";');
        expect(js).toContain('import { useState, useRef } from "react";');
        expect(js).toContain("export function legacyHandler()");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });
});

describe("Concise Array Expressions (Bracket Notation [...], [], Spread) Support", () => {
    test("Transpiles empty array [] and single-element array [elem]", () => {
        const codonCode = `
empty =: []
single =: [42]
objItem =: [O(id:1;title:'first')]
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("const empty = [];");
        expect(js).toContain("const single = [42];");
        expect(js).toContain('const objItem = [{\n  id: 1,\n  title: "first"\n}];');
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles multi-element arrays with comma and semicolon separators", () => {
        const codonCode = `
nums =: [1, 2, 3]
semiList =: ['a'; 'b'; 'c']
mixed =: [1, 2; 3, 4]
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("const nums = [1, 2, 3];");
        expect(js).toContain('const semiList = ["a", "b", "c"];');
        expect(js).toContain("const mixed = [1, 2, 3, 4];");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles prefix spread inside arrays and nested arrays", () => {
        const codonCode = `
combined =: [...prev, newItem]
multiSpread =: [...header, ...rows, footer]
matrix =: [[1, 2], [3, 4]]
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("const combined = [...prev, newItem];");
        expect(js).toContain("const multiSpread = [...header, ...rows, footer];");
        expect(js).toContain("const matrix = [[1, 2], [3, 4]];");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles array expressions in React hook initializers, state updaters, and return statements", () => {
        const codonCode = `
fn. ChatApp do.
[messages,setMessages] =: (useState [O(id:1;user:'Alice';text:'Hello world!')])
[items,setItems] =: (useState [])
addItem =: {{item => (setItems {{prev => [...prev, item]}})}}
return. []
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("const [items, setItems] = useState([]);");
        expect(js).toContain("const addItem = item => setItems(prev => [...prev, item]);");
        expect(js).toContain("return [];");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Roundtrips JS array literals, spreads, and empty arrays with bracket notation", () => {
        const jsCode = `
const empty = [];
const single = [1];
const items = [1, 2, 3];
const appended = [...prev, { id: 1, text: "hi" }];
const grid = [[1, 2], [3, 4]];
export default items;
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("empty =: []");
        expect(codonCode).toContain("single =: [1]");
        expect(codonCode).toContain("items =: [1,2,3]");
        expect(codonCode).toContain("appended =: [...prev,O(id:1;text:'hi')]");
        expect(codonCode).toContain("grid =: [[1,2],[3,4]]");
        expect(codonCode).toContain("export. default items");
        expect(codonCode).not.toContain("(0$0)");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
        expect(roundtrippedJs).toContain("const empty = [];");
        expect(roundtrippedJs).toContain("const single = [1];");
        expect(roundtrippedJs).toContain("const items = [1, 2, 3];");
        expect(roundtrippedJs).toContain("const appended = [...prev, {\n  id: 1,\n  text: \"hi\"\n}];");
        expect(roundtrippedJs).toContain("const grid = [[1, 2], [3, 4]];");
        expect(roundtrippedJs).toContain("export default items;");
    });

    test("Retains backward compatibility with legacy (0$0), (,x), and (a;b;c) forms", () => {
        const codonCode = `
legacyEmpty =: (0$0)
legacySingle =: (,42)
legacyMulti =: ('foo';'bar';'baz')
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("const legacyEmpty = [];");
        expect(js).toContain("const legacySingle = [42];");
        expect(js).toContain('const legacyMulti = ["foo", "bar", "baz"];');
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });
});

describe("Subtree Hashing Macro System (dict.json Level-2 Clone Compaction) Support", () => {
    test("Transpiles expression-level macro invocation M!m_call_expr_11 to JS", () => {
        const codonCode = `idx =: M!m_call_expr_11(items)`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("Math.floor(Math.random() * items.length)");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles statement-level macro invocation M!m_expression_stmt_17 to JS", () => {
        const codonCode = `M!m_expression_stmt_17(Child;Parent)`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("Child.prototype = Object.create(Parent.prototype)");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles arrow function macro with literal and capture parameters M!m_arrow_function_expr_5", () => {
        const codonCode = `testFn =: M!m_arrow_function_expr_5('js';'file.js';getLanguage)`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toMatch(/expect\(getLanguage\(["']file\.js["']\)\)\.toBe\(["']js["']\)/);
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles parameterless macro invocation M!m_variable_decl_4", () => {
        const codonCode = `M!m_variable_decl_4()`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("var");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Throws error on unknown macro invocation", () => {
        const codonCode = `bad =: M!nonexistent_macro_xyz(foo)`;
        const astParser = new CodonToASTParser();
        expect(() => astParser.parse(codonCode)).toThrow("Unknown macro");
    });

    test("Roundtrips JS functions containing popular clone subtrees via macro compaction", () => {
        const jsCode = `
function pickRandom(items) {
  return Math.floor(Math.random() * items.length);
}
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("M!m_call_expr_11(items)");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(roundtrippedJs).toContain("Math.floor(Math.random() * items.length)");
        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
    });

    test("Roundtrips statement-level prototype inheritance clone via macro compaction", () => {
        const jsCode = `
function Curve() {}
function TorusKnotCurve() {}
TorusKnotCurve.prototype = Object.create(Curve.prototype);
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("M!m_expression_stmt_17(TorusKnotCurve;Curve)");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(roundtrippedJs).toContain("TorusKnotCurve.prototype = Object.create(Curve.prototype)");
        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles string capitalization binary expression macro M!m_binary_expr_32", () => {
        const codonCode = `capitalized =: M!m_binary_expr_32(word)`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("word.charAt(0).toUpperCase() + word.slice(1)");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles object expression macro M!m_object_expr_1 with numeric literals", () => {
        const codonCode = `loc =: M!m_object_expr_1(10;20)`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain('"line": 1');
        expect(js).toContain('"column": 10');
        expect(js).toContain('"column": 20');
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });
});

describe("Concise Unparenthesized Member & Compound Assignment Support", () => {
    test("Transpiles unparenthesized member assignment this.prop = val and this.prop =: val", () => {
        const codonCode = `
class. Client do.
  constructor. do.
    this.socket = ''
    this.retryCount =: 0
    this.isClosedManually = false
  end.
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain('this.socket = "";');
        expect(js).toContain("this.retryCount = 0;");
        expect(js).toContain("this.isClosedManually = false;");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles unparenthesized property assignment on objects headers.host and res.statusCode", () => {
        const codonCode = `
fn. handle req,res do.
  headers.host = 'localhost:8080'
  res.statusCode =: 200
  memoized.cache = cache
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain('headers.host = "localhost:8080";');
        expect(js).toContain("res.statusCode = 200;");
        expect(js).toContain("memoized.cache = cache;");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles computed property assignments this.heap.[idx] = tmp and records[id] = row", () => {
        const codonCode = `
fn. swap idx,parentIdx do.
  this.heap.[idx] = this.heap.[parentIdx]
  this.heap[parentIdx] = tmp
  records.[id] = row
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("this.heap[idx] = this.heap[parentIdx];");
        expect(js).toContain("this.heap[parentIdx] = tmp;");
        expect(js).toContain("records[id] = row;");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles unparenthesized compound assignments count += 1, len -= 1, total *= factor", () => {
        const codonCode = `
fn. update do.
  count += 1
  this.retryCount += 1
  len -= 1
  total *= 2
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("count += 1;");
        expect(js).toContain("this.retryCount += 1;");
        expect(js).toContain("len -= 1;");
        expect(js).toContain("total *= 2;");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Roundtrips JS member assignments and compound mutations using unparenthesized notation", () => {
        const jsCode = `
export class WebSocketWrapper {
  constructor(url) {
    this.url = url;
    this.retryCount = 0;
    this.isClosed = false;
    this.socket = null;
  }
  reconnect() {
    this.retryCount += 1;
    this.isClosed = true;
  }
}
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("this.url = url");
        expect(codonCode).toContain("this.retryCount = 0");
        expect(codonCode).toContain("this.retryCount += 1");
        expect(codonCode).toContain("this.isClosed = true");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(roundtrippedJs).toContain("this.url = url;");
        expect(roundtrippedJs).toContain("this.retryCount = 0;");
        expect(roundtrippedJs).toContain("this.retryCount += 1;");
        expect(roundtrippedJs).toContain("this.isClosed = true;");
        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
    });

    test("Retains backward compatibility with parenthesized assignment expressions (this.prop = val)", () => {
        const codonCode = `
class. Legacy do.
  constructor. do.
    (this.count = 0)
    (this.total = (this.total + 10))
  end.
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("this.count = 0;");
        expect(js).toContain("this.total = this.total + 10;");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });
});

describe("Concise Unparenthesized Logical NOT & Update Expressions Support", () => {
    test("Transpiles unparenthesized logical NOT !expr and !obj.method()", () => {
        const codonCode = `
fn. check input,isValid,cache,key do.
  if. !input.trim() do.
    return.
  end.

  if. !isValid do.
    return. false
  end.

  if. !cache.has(key) do.
    return. null
  end.
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("if (!input.trim())");
        expect(js).toContain("if (!isValid)");
        expect(js).toContain("if (!cache.has(key))");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles unparenthesized update expressions expr++, expr--, ++expr, --expr", () => {
        const codonCode = `
i++
len--
++step
--remaining
nextId.current++
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("i++;");
        expect(js).toContain("len--;");
        expect(js).toContain("++step;");
        expect(js).toContain("--remaining;");
        expect(js).toContain("nextId.current++;");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles update expressions in object properties and for loops", () => {
        const codonCode = `
item =: O(id:nextId.current++; user:'Me')
for. i =: 0 ; i < 10 ; i++ do.
  (console.log i)
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("id: nextId.current++");
        expect(js).toContain("user: \"Me\"");
        expect(js).toContain("for (const i = 0; i < 10; i++)");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Transpiles compound logical conditions with ! without ambiguity", () => {
        const codonCode = `
valid =: !error && !loading
canSubmit =: !isSubmitting && hasChanges
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("const valid = !error && !loading;");
        expect(js).toContain("const canSubmit = !isSubmitting && hasChanges;");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });

    test("Roundtrips JS logical NOT and update expressions using concise notation", () => {
        const jsCode = `
function process(input, nextId) {
  if (!input.trim()) {
    return null;
  }
  const item = {
    id: nextId.current++,
    text: input
  };
  let count = 0;
  count++;
  return item;
}
`;
        const ast = parser.parse(jsCode, { sourceType: "module" });
        const translator = new JSToCodonTranslator();
        const codonCode = translator.transpile(ast.program as any);

        expect(codonCode).toContain("!input.trim()");
        expect(codonCode).toContain("id:nextId.current++");
        expect(codonCode).toContain("count++");

        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const roundtrippedJs = compiler.transpile(parsedAst);

        expect(roundtrippedJs).toContain("!input.trim()");
        expect(roundtrippedJs).toContain("id: nextId.current++");
        expect(roundtrippedJs).toContain("count++;");
        expect(() => parser.parse(roundtrippedJs, { sourceType: "module" })).not.toThrow();
    });

    test("Retains backward compatibility with legacy parenthesized forms (! expr) and (x++)", () => {
        const codonCode = `
fn. check input do.
  if. (! input.trim()) do.
    return.
  end.
  (x++)
  todo =: O(id:(nextId.current++); text:'Test')
  return. todo
end.
`;
        const astParser = new CodonToASTParser();
        const parsedAst = astParser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(parsedAst);

        expect(js).toContain("if (!input.trim())");
        expect(js).toContain("x++;");
        expect(js).toContain("id: nextId.current++");
        expect(() => parser.parse(js, { sourceType: "module" })).not.toThrow();
    });
});


