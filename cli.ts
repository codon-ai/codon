import * as fs from "fs";
import * as path from "path";
import * as parser from "@babel/parser";
import { JToASTParser } from "./j-parser";
import { JToJSTranspiler, JSToJTranspiler } from "./transpilers";

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("Usage:\n  bun run cli.ts <direction: j2js | js2j> <file>\n  bun run cli.ts verify");
    process.exit(1);
}

const command = args[0];

if (command === "verify") {
    runBenchmarkVerification();
} else if (command === "j2js" || command === "js2j") {
    if (args.length < 2) {
        console.error(`Usage: bun run cli.ts ${command} <file>`);
        process.exit(1);
    }
    const filePath = args[1];
    transpileSingleFile(command, filePath);
} else {
    console.error("Invalid command. Use 'j2js', 'js2j', or 'verify'.");
    process.exit(1);
}

function transpileSingleFile(direction: "j2js" | "js2j", filePath: string): string {
    const code = fs.readFileSync(path.resolve(filePath), "utf-8");
    try {
        if (direction === "j2js") {
            const astParser = new JToASTParser();
            const ast = astParser.parse(code);
            const transpiler = new JToJSTranspiler();
            const jsCode = transpiler.transpile(ast);
            const outPath = filePath.replace(/\.j$/, ".js");
            fs.writeFileSync(outPath, jsCode, "utf-8");
            console.log(`✅ Successfully transpiled ${filePath} to JS -> ${outPath}`);
            return jsCode;
        } else {
            const ast = parser.parse(code, {
                sourceType: "module",
                plugins: ["jsx"],
            });
            const transpiler = new JSToJTranspiler();
            const jCode = transpiler.transpile(ast.program as any);
            const outPath = filePath.replace(/\.jsx?$/, ".j");
            fs.writeFileSync(outPath, jCode, "utf-8");
            console.log(`✅ Successfully transpiled ${filePath} to J -> ${outPath}`);
            return jCode;
        }
    } catch (error: any) {
        console.error(`❌ Transpilation failed for ${filePath}:`);
        console.error(
            error.loc
                ? `Error at line ${error.loc.line}, col ${error.loc.column}: ${error.message}`
                : error.message,
        );
        process.exit(1);
    }
}

function runBenchmarkVerification() {
    const benchDir = path.resolve("benchmark/javascript");
    const jDir = path.resolve("benchmark/j");
    const files = fs.readdirSync(benchDir).filter((f) => f.endsWith(".js") || f.endsWith(".jsx"));

    console.log(`\n=================================================`);
    console.log(`   Running Benchmark Verification (${files.length} suites)`);
    console.log(`=================================================\n`);

    let passed = 0;
    let failed = 0;

    for (const file of files) {
        const jsPath = path.join(benchDir, file);
        const jFile = file.replace(/\.jsx?$/, ".j");
        const jPath = path.join(jDir, jFile);

        try {
            process.stdout.write(`Testing ${file} ... `);
            const originalJs = fs.readFileSync(jsPath, "utf-8");

            // Step 1: JS -> J
            const jsAst = parser.parse(originalJs, {
                sourceType: "module",
                plugins: ["jsx"],
            });
            const jsToJ = new JSToJTranspiler();
            const jCode = jsToJ.transpile(jsAst.program as any);
            fs.writeFileSync(jPath, jCode, "utf-8");

            // Step 2: J -> JS
            const jToAst = new JToASTParser();
            const parsedJAST = jToAst.parse(jCode);
            const jToJs = new JToJSTranspiler();
            const roundtrippedJs = jToJs.transpile(parsedJAST);

            // Step 3: Validate generated JS parses with Babel
            parser.parse(roundtrippedJs, {
                sourceType: "module",
                plugins: ["jsx"],
            });

            console.log(`✅ PASSED (JS ➔ J ➔ JS)`);
            passed++;
        } catch (err: any) {
            console.log(`❌ FAILED: ${err.message}`);
            failed++;
        }
    }

    console.log(`\n=================================================`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log(`=================================================\n`);

    if (failed > 0) process.exit(1);
}
