import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import {
    initProject,
    loadCodonConfig,
    compileProject,
    findProjectFiles,
} from "../project-compiler";
import { CodonToASTParser } from "../codon-parser";
import { CodonToJSCompiler } from "../transpilers";

describe("Codon Project Compiler & Tooling (`codon build` / `codon init`)", () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "codon-project-test-"));
    });

    afterEach(() => {
        if (fs.existsSync(tmpDir)) {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    });

    test("`codon init` bootstraps package.json with Method B scripts, codon.json, and starter src/index.cdn", () => {
        const res = initProject(tmpDir, { projectName: "my-test-app" });

        expect(res.packageJsonCreated).toBe(true);
        expect(res.codonJsonCreated).toBe(true);
        expect(res.starterCreated).toBe(true);

        // Verify package.json
        const pkgJson = JSON.parse(fs.readFileSync(path.join(tmpDir, "package.json"), "utf-8"));
        expect(pkgJson.name).toBe("my-test-app");
        expect(pkgJson.type).toBe("module");
        expect(pkgJson.main).toBe("dist/index.js");
        expect(pkgJson.scripts.build).toBe("codon build");
        expect(pkgJson.scripts.dev).toBe("codon build --watch");
        expect(pkgJson.scripts.start).toBe("node dist/index.js");

        // Verify codon.json
        const codonJson = JSON.parse(fs.readFileSync(path.join(tmpDir, "codon.json"), "utf-8"));
        expect(codonJson.compilerOptions.rootDir).toBe("src");
        expect(codonJson.compilerOptions.outDir).toBe("dist");
        expect(codonJson.compilerOptions.rewriteImportExtensions).toBe(true);
        expect(codonJson.compilerOptions.bundleRuntime).toBe(true);

        // Verify src/index.cdn exists and is non-empty
        const starter = fs.readFileSync(path.join(tmpDir, "src", "index.cdn"), "utf-8");
        expect(starter).toContain("greet");
        expect(starter).toContain("calculateAverage");
    });

    test("`loadCodonConfig` finds and merges configuration", () => {
        initProject(tmpDir);
        const { config, projectRoot } = loadCodonConfig(tmpDir);

        expect(projectRoot).toBe(tmpDir);
        expect(config.compilerOptions?.rootDir).toBe("src");
        expect(config.compilerOptions?.outDir).toBe("dist");
        expect(config.compilerOptions?.rewriteImportExtensions).toBe(true);
    });

    test("Rewrites inter-.cdn relative imports to .js upon compilation", () => {
        const codonCode = `
import. { add, multiply } from './math.cdn'
import. * as helpers from '../utils/helpers.cdn'
import. App from './components/App.cdn'

res =: (add 10 20)
`;
        const parser = new CodonToASTParser();
        const ast = parser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(ast, { rewriteImportExtensions: true });

        expect(js).toContain('import { add, multiply } from "./math.js";');
        expect(js).toContain('import * as helpers from "../utils/helpers.js";');
        expect(js).toContain('import App from "./components/App.js";');
    });

    test("Transpiles and rewrites re-exports between .cdn files", () => {
        const codonCode = `
export. * from './math.cdn'
export. * as mathUtils from './utils.cdn'
export. { add, multiply as mult } from './calculator.cdn'
export. { localA, localB }
`;
        const parser = new CodonToASTParser();
        const ast = parser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(ast, { rewriteImportExtensions: true });

        expect(js).toContain('export * from "./math.js";');
        expect(js).toContain('export * as mathUtils from "./utils.js";');
        expect(js).toContain('export { add, multiply as mult } from "./calculator.js";');
        expect(js).toContain('export { localA, localB };');
    });

    test("Transpiles dynamic imports and rewrites .cdn specifier", () => {
        const codonCode = `
async_fn. loadModule do.
  mod =: @ (import './heavy.cdn')
  return. mod
end.
`;
        const parser = new CodonToASTParser();
        const ast = parser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(ast, { rewriteImportExtensions: true });

        expect(js).toContain('await import("./heavy.js")');
    });

    test("Transpiles static imports with attributes/assertions and side-effects", () => {
        const codonCode = `
import. './styles/global.css'
import. config from './config.json' with { type: 'json' }
`;
        const parser = new CodonToASTParser();
        const ast = parser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(ast, { rewriteImportExtensions: true });

        expect(js).toContain('import "./styles/global.css";');
        expect(js).toContain('import config from "./config.json" with {');
        expect(js).toContain('type: "json"');
    });

    test("Auto-imports runtime functions from codon-runtime.js when autoImportRuntime is enabled", () => {
        const codonCode = `
fn. computeAverage nums do.
  return. (+/ nums % #nums)
end.
`;
        const parser = new CodonToASTParser();
        const ast = parser.parse(codonCode);
        const compiler = new CodonToJSCompiler();
        const js = compiler.transpile(ast, {
            autoImportRuntime: true,
            runtimeModule: "./codon-runtime.js",
        });

        expect(js).toContain('import { sum } from "./codon-runtime.js";');
        expect(js).toContain('sum(nums) / nums.length');
    });

    test("End-to-end multi-file project compilation and execution in Node/Bun", async () => {
        // Setup realistic project in tmpDir
        initProject(tmpDir, { projectName: "multi-file-demo" });

        const srcDir = path.join(tmpDir, "src");
        const utilsDir = path.join(srcDir, "utils");
        const stylesDir = path.join(srcDir, "styles");
        fs.mkdirSync(utilsDir, { recursive: true });
        fs.mkdirSync(stylesDir, { recursive: true });

        // 1. src/utils/math.cdn
        fs.writeFileSync(
            path.join(utilsDir, "math.cdn"),
            `export. fn. sumList nums do.
  return. (+/ nums)
end.

export. fn. multiply a,b do.
  return. (a * b)
end.
`,
            "utf-8"
        );

        // 2. src/config.json (static asset)
        fs.writeFileSync(
            path.join(srcDir, "config.json"),
            JSON.stringify({ appName: "CodonApp", multiplier: 10 }),
            "utf-8"
        );

        // 3. src/styles/main.css (static asset)
        fs.writeFileSync(
            path.join(stylesDir, "main.css"),
            "body { font-family: sans-serif; }",
            "utf-8"
        );

        // 4. src/index.cdn (main entrypoint importing math.cdn and config.json)
        fs.writeFileSync(
            path.join(srcDir, "index.cdn"),
            `import. { sumList, multiply } from './utils/math.cdn'
import. config from './config.json' with { type: 'json' }
import. './styles/main.css'

export. fn. runCalculation nums do.
  total =: (sumList nums)
  scaled =: (multiply total config.multiplier)
  return. O(appName:config.appName;total;scaled)
end.

result =: (runCalculation [1, 2, 3, 4])
(console.log (JSON.stringify result))
`,
            "utf-8"
        );

        // Compile project
        const compileResult = compileProject(tmpDir);

        expect(compileResult.success).toBe(true);
        expect(compileResult.errors.length).toBe(0);

        // Verify output in dist/
        const distDir = path.join(tmpDir, "dist");
        expect(fs.existsSync(path.join(distDir, "index.js"))).toBe(true);
        expect(fs.existsSync(path.join(distDir, "utils", "math.js"))).toBe(true);
        expect(fs.existsSync(path.join(distDir, "config.json"))).toBe(true);
        expect(fs.existsSync(path.join(distDir, "styles", "main.css"))).toBe(true);
        expect(fs.existsSync(path.join(distDir, "codon-runtime.js"))).toBe(true);

        // Verify index.js imports math.js and codon-runtime.js
        const indexJs = fs.readFileSync(path.join(distDir, "index.js"), "utf-8");
        expect(indexJs).toContain('from "./utils/math.js"');
        expect(indexJs).toContain('from "./config.json"');

        // Execute dist/index.js using Bun subprocess to ensure 100% runtime validity!
        const proc = Bun.spawn(["bun", path.join(distDir, "index.js")], {
            cwd: tmpDir,
            stdout: "pipe",
            stderr: "pipe",
        });

        const stdout = await new Response(proc.stdout).text();
        const exitCode = await proc.exited;

        expect(exitCode).toBe(0);
        const parsedOutput = JSON.parse(stdout.trim());
        expect(parsedOutput.appName).toBe("CodonApp");
        expect(parsedOutput.total).toBe(10); // 1 + 2 + 3 + 4 = 10
        expect(parsedOutput.scaled).toBe(100); // 10 * 10 = 100
    });
});
