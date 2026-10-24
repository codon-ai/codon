import * as fs from "fs";
import * as path from "path";
import * as parser from "@babel/parser";
import { CodonToASTParser } from "./codon-parser";
import { CodonToJSCompiler, JSToCodonTranslator } from "./transpilers";

const BABEL_PARSER_OPTIONS: parser.ParserOptions = {
    sourceType: "module",
    plugins: [
        "jsx",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "classProperties",
        "classPrivateProperties",
        "classPrivateMethods",
    ],
    errorRecovery: true,
};

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("Usage:\n  bun run cli.ts <direction: compile | translate> <file>\n  bun run cli.ts verify");
    process.exit(1);
}

const command = args[0];

if (command === "verify") {
    runBenchmarkVerification();
} else if (command === "compile" || command === "translate") {
    if (args.length < 2) {
        console.error(`Usage: bun run cli.ts ${command} <file>`);
        process.exit(1);
    }
    const filePath = args[1];
    transpileSingleFile(command, filePath);
} else {
    console.error("Invalid command. Use 'compile', 'translate', or 'verify'.");
    process.exit(1);
}

function transpileSingleFile(direction: "compile" | "translate", filePath: string): string {
    const code = fs.readFileSync(path.resolve(filePath), "utf-8");
    try {
        if (direction === "compile") {
            const astParser = new CodonToASTParser();
            const ast = astParser.parse(code);
            const compiler = new CodonToJSCompiler();
            const jsCode = compiler.transpile(ast);
            const outPath = filePath.endsWith(".cdn") ? filePath.replace(/\.cdn$/, ".js") : `${filePath}.js`;
            fs.writeFileSync(outPath, jsCode, "utf-8");
            console.log(`✅ Successfully compiled ${filePath} to JS -> ${outPath}`);
            return jsCode;
        } else {
            const ast = parser.parse(code, BABEL_PARSER_OPTIONS);
            const translator = new JSToCodonTranslator();
            const codonCode = translator.transpile(ast.program as any);
            const outPath = filePath.replace(/\.jsx?$/, ".cdn");
            fs.writeFileSync(outPath, codonCode, "utf-8");
            console.log(`✅ Successfully translated ${filePath} to Codon -> ${outPath}`);
            return codonCode;
        }
    } catch (error: any) {
        console.error(`❌ Operation failed for ${filePath}:`);
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
    const codonDir = path.resolve("benchmark/codon");
    if (!fs.existsSync(codonDir)) {
        fs.mkdirSync(codonDir, { recursive: true });
    }
    const files = fs.readdirSync(benchDir).filter((f) => f.endsWith(".js") || f.endsWith(".jsx"));

    console.log(`\n=================================================`);
    console.log(`   Running Benchmark Verification (${files.length} suites)`);
    console.log(`=================================================\n`);

    let passed = 0;
    let failed = 0;

    for (const file of files) {
        const jsPath = path.join(benchDir, file);
        const codonFile = file.replace(/\.jsx?$/, ".cdn");
        const codonPath = path.join(codonDir, codonFile);

        try {
            process.stdout.write(`Testing ${file} ... `);
            const originalJs = fs.readFileSync(jsPath, "utf-8");

            // Step 1: JS -> Codon (Translate)
            const jsAst = parser.parse(originalJs, BABEL_PARSER_OPTIONS);
            const jsToCodon = new JSToCodonTranslator();
            const codonCode = jsToCodon.transpile(jsAst.program as any);
            fs.writeFileSync(codonPath, codonCode, "utf-8");

            // Step 2: Codon -> JS (Compile)
            const codonToAst = new CodonToASTParser();
            const parsedCodonAST = codonToAst.parse(codonCode);
            const codonToJs = new CodonToJSCompiler();
            const roundtrippedJs = codonToJs.transpile(parsedCodonAST);

            // Step 3: Validate generated JS parses with Babel
            parser.parse(roundtrippedJs, BABEL_PARSER_OPTIONS);

            console.log(`✅ PASSED (JS ➔ Codon ➔ JS)`);
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
