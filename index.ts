#!/usr/bin/env bun
import * as fs from "fs";
import * as path from "path";
import * as parser from "@babel/parser";
import { CodonToASTParser } from "./codon-parser";
import { CodonToJSCompiler, JSToCodonTranslator } from "./transpilers";
import {
    compileProject,
    watchProject,
    initProject,
    printCompileSummary,
    type CodonCompilerOptions,
} from "./project-compiler";

const BABEL_PARSER_OPTIONS: parser.ParserOptions = {
    sourceType: "module",
    plugins: [
        "jsx",
        "exportDefaultFrom",
    ],
    errorRecovery: true,
};

function printUsage(): void {
    console.log(`
Codon Compiler & Translator CLI

Usage:
  codon build [dir] [options]       Compile an entire Codon project directory to JavaScript (like tsc)
  codon init [dir]                  Bootstrap a package.json, codon.json, and starter src/index.cdn
  codon compile <file.cdn>          Compile a single .cdn file to .js
  codon translate <file.js>         Translate a JavaScript/JSX file to Codon notation
  codon verify                      Run benchmark roundtrip suite verification

Options for 'build':
  -o, --outDir <dir>                Output directory (default: "dist")
  -r, --rootDir <dir>               Source root directory (default: "src")
  -p, --project <path>              Path to codon.json
  -w, --watch                       Watch mode: recompile modified files incrementally
  --clean                           Clean output directory before building
  --no-copy-assets                  Disable copying static assets (CSS, JSON, etc.)
  --no-bundle-runtime               Disable bundling codon-runtime.js into outDir
  -h, --help                        Show this help message
`);
}

const args = process.argv.slice(2);

// If no arguments provided, check if codon.json exists in current directory; if so, run build.
if (args.length === 0) {
    if (fs.existsSync("codon.json")) {
        runProjectBuild(["."]);
    } else {
        printUsage();
        process.exit(1);
    }
} else {
    const command = args[0];

    if (command === "-h" || command === "--help" || command === "help") {
        printUsage();
        process.exit(0);
    } else if (command === "init") {
        const targetDir = args[1] && !args[1].startsWith("-") ? args[1] : ".";
        runProjectInit(targetDir);
    } else if (command === "build") {
        runProjectBuild(args.slice(1));
    } else if (command === "verify") {
        runBenchmarkVerification();
    } else if (command === "compile" || command === "translate") {
        if (args.length < 2) {
            console.error(`Usage: codon ${command} <file>`);
            process.exit(1);
        }
        const filePath = args[1];
        transpileSingleFile(command, filePath);
    } else if (!command.startsWith("-") && fs.existsSync(command) && fs.statSync(command).isDirectory()) {
        // If passed a directory directly: codon my-project [options] -> build that directory
        runProjectBuild(args);
    } else {
        console.error(`Unknown command: '${command}'`);
        printUsage();
        process.exit(1);
    }
}

function runProjectInit(targetDir: string): void {
    const resolved = path.resolve(targetDir);
    console.log(`\n🚀 Initializing new Codon project in ${resolved} ...\n`);
    const res = initProject(resolved);
    console.log(`✅ Project initialization complete:`);
    console.log(`   ${res.packageJsonCreated ? "✨ Created" : "📝 Updated"} package.json (type: module, scripts: build, dev, start)`);
    console.log(`   ${res.codonJsonCreated ? "✨ Created" : "ℹ️ Preserved"} codon.json compiler configuration`);
    console.log(`   ${res.starterCreated ? "✨ Created" : "ℹ️ Preserved"} src/index.cdn starter entrypoint`);
    console.log(`\nNext steps:`);
    console.log(`   1. Install packages if needed: bun add <pkg> or npm install <pkg>`);
    console.log(`   2. Compile project:            bun run build  or npm run build`);
    console.log(`   3. Run application:            bun start      or npm start\n`);
}

function runProjectBuild(buildArgs: string[]): void {
    let targetDir = ".";
    const overrides: CodonCompilerOptions = {};
    let watchMode = false;

    for (let i = 0; i < buildArgs.length; i++) {
        const arg = buildArgs[i];
        if (arg === "-w" || arg === "--watch") {
            watchMode = true;
        } else if (arg === "-o" || arg === "--outDir") {
            overrides.outDir = buildArgs[++i];
        } else if (arg === "-r" || arg === "--rootDir") {
            overrides.rootDir = buildArgs[++i];
        } else if (arg === "-p" || arg === "--project") {
            targetDir = buildArgs[++i];
        } else if (arg === "--clean") {
            overrides.clean = true;
        } else if (arg === "--no-copy-assets") {
            overrides.copyAssets = false;
        } else if (arg === "--no-bundle-runtime") {
            overrides.bundleRuntime = false;
        } else if (!arg.startsWith("-")) {
            targetDir = arg;
        }
    }

    if (watchMode) {
        watchProject(targetDir, overrides);
    } else {
        const res = compileProject(targetDir, overrides);
        printCompileSummary(res);
        if (!res.success) {
            process.exit(1);
        }
    }
}

function transpileSingleFile(direction: "compile" | "translate", filePath: string): string {
    const code = fs.readFileSync(path.resolve(filePath), "utf-8");
    try {
        if (direction === "compile") {
            const astParser = new CodonToASTParser();
            const ast = astParser.parse(code);
            const compiler = new CodonToJSCompiler();
            const jsCode = compiler.transpile(ast, {
                rewriteImportExtensions: true,
                currentFilePath: path.resolve(filePath),
            });
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
