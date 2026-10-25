import * as fs from "fs";
import * as path from "path";
import * as babelParser from "@babel/parser";
import generate from "@babel/generator";
import { CodonToASTParser } from "./codon-parser";
import { CodonToJSCompiler, type CompilerOptions } from "./transpilers";

export interface CodonCompilerOptions {
    rootDir?: string;
    outDir?: string;
    target?: string;
    module?: string;
    rewriteImportExtensions?: boolean;
    copyAssets?: boolean;
    bundleRuntime?: boolean;
    autoImportRuntime?: boolean;
    clean?: boolean;
    watch?: boolean;
}

export interface CodonProjectConfig {
    compilerOptions?: CodonCompilerOptions;
    include?: string[];
    exclude?: string[];
}

export interface CompileResult {
    success: boolean;
    totalFiles: number;
    compiledFiles: string[];
    copiedAssets: string[];
    errors: { file: string; message: string; loc?: { line: number; column: number } }[];
    durationMs: number;
}

const DEFAULT_CONFIG: CodonProjectConfig = {
    compilerOptions: {
        rootDir: "src",
        outDir: "dist",
        rewriteImportExtensions: true,
        copyAssets: true,
        bundleRuntime: true,
        autoImportRuntime: true,
        clean: false,
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist", "**/*.test.*"],
};

/**
 * Finds and loads codon.json starting from searchDirOrFile and walking up parent directories.
 */
export function loadCodonConfig(searchDirOrFile: string): {
    config: CodonProjectConfig;
    configPath?: string;
    projectRoot: string;
} {
    const resolved = path.resolve(searchDirOrFile);
    let startDir = resolved;
    let explicitConfigFile: string | undefined;

    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
        if (resolved.endsWith(".json")) {
            explicitConfigFile = resolved;
            startDir = path.dirname(resolved);
        } else {
            startDir = path.dirname(resolved);
        }
    }

    if (explicitConfigFile && fs.existsSync(explicitConfigFile)) {
        try {
            const raw = JSON.parse(fs.readFileSync(explicitConfigFile, "utf-8"));
            return {
                config: mergeConfig(DEFAULT_CONFIG, raw),
                configPath: explicitConfigFile,
                projectRoot: startDir,
            };
        } catch (e: any) {
            throw new Error(`Failed to parse config at ${explicitConfigFile}: ${e.message}`);
        }
    }

    // Traverse upwards searching for codon.json
    let cur = startDir;
    while (true) {
        const candidate = path.join(cur, "codon.json");
        if (fs.existsSync(candidate)) {
            try {
                const raw = JSON.parse(fs.readFileSync(candidate, "utf-8"));
                return {
                    config: mergeConfig(DEFAULT_CONFIG, raw),
                    configPath: candidate,
                    projectRoot: cur,
                };
            } catch (e: any) {
                throw new Error(`Failed to parse config at ${candidate}: ${e.message}`);
            }
        }
        const parent = path.dirname(cur);
        if (parent === cur) break;
        cur = parent;
    }

    return {
        config: { ...DEFAULT_CONFIG },
        projectRoot: startDir,
    };
}

function mergeConfig(base: CodonProjectConfig, override: any): CodonProjectConfig {
    return {
        compilerOptions: {
            ...base.compilerOptions,
            ...(override.compilerOptions || {}),
        },
        include: override.include || base.include,
        exclude: override.exclude || base.exclude,
    };
}

/**
 * Initializes a new Codon project in targetDir (Method B):
 * - Creates/updates package.json with "type": "module", "main": "dist/index.js", and build/dev/start scripts.
 * - Creates codon.json with recommended compiler options.
 * - Creates a starter src/index.cdn file.
 */
export function initProject(targetDir: string, options?: { projectName?: string }): {
    packageJsonCreated: boolean;
    codonJsonCreated: boolean;
    starterCreated: boolean;
} {
    const projectDir = path.resolve(targetDir);
    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
    }

    const projectName = options?.projectName || path.basename(projectDir);

    // 1. package.json
    const pkgPath = path.join(projectDir, "package.json");
    let packageJsonCreated = false;
    let pkgData: any = {};

    if (fs.existsSync(pkgPath)) {
        try {
            pkgData = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        } catch {
            pkgData = {};
        }
    } else {
        packageJsonCreated = true;
        pkgData = {
            name: projectName,
            version: "1.0.0",
            description: "A Codon application",
            dependencies: {},
            devDependencies: {},
        };
    }

    pkgData.type = "module";
    pkgData.main = "dist/index.js";
    pkgData.scripts = {
        ...(pkgData.scripts || {}),
        build: "codon build",
        dev: "codon build --watch",
        start: "bun dist/index.js",
    };

    fs.writeFileSync(pkgPath, JSON.stringify(pkgData, null, 2) + "\n", "utf-8");

    // 2. codon.json
    const codonJsonPath = path.join(projectDir, "codon.json");
    let codonJsonCreated = false;
    if (!fs.existsSync(codonJsonPath)) {
        codonJsonCreated = true;
        const configContent = {
            compilerOptions: {
                rootDir: "src",
                outDir: "dist",
                rewriteImportExtensions: true,
                copyAssets: true,
                bundleRuntime: true,
                autoImportRuntime: true,
                clean: false,
            },
            include: ["src/**/*"],
            exclude: ["node_modules", "dist", "**/*.test.*"],
        };
        fs.writeFileSync(codonJsonPath, JSON.stringify(configContent, null, 2) + "\n", "utf-8");
    }

    // 3. src/index.cdn starter
    const srcDir = path.join(projectDir, "src");
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
    }
    const starterPath = path.join(srcDir, "index.cdn");
    let starterCreated = false;
    if (!fs.existsSync(starterPath)) {
        starterCreated = true;
        const starterCode = `NB. Welcome to your Codon project!
import. * as path from 'node:path'

export. fn. greet name='World' do.
  message =: \`Hello, \${name} from Codon!\`
  (console.log message)
  return. message
end.

export. fn. calculateAverage nums do.
  return. ((+/ nums) / (# nums))
end.

NB. Run when executed directly
(greet 'Codon Developer')
avg =: (calculateAverage [10, 20, 30, 40, 50])
(console.log \`Average calculation: \${avg}\`)
`;
        fs.writeFileSync(starterPath, starterCode, "utf-8");
    }

    return { packageJsonCreated, codonJsonCreated, starterCreated };
}

/**
 * Recursively walks a directory and returns all files, categorizing them into .cdn and assets.
 */
export function findProjectFiles(
    rootDir: string,
    includePatterns?: string[],
    excludePatterns?: string[]
): { codonFiles: string[]; assetFiles: string[] } {
    const codonFiles: string[] = [];
    const assetFiles: string[] = [];

    const defaultExcludes = new Set(["node_modules", "dist", ".git", ".next", ".cache", ".turbo"]);

    function walk(dir: string): void {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (defaultExcludes.has(entry.name) || entry.name.startsWith(".")) {
                    continue;
                }
                walk(fullPath);
            } else if (entry.isFile()) {
                if (entry.name.startsWith(".")) continue;
                if (entry.name.endsWith(".cdn")) {
                    codonFiles.push(fullPath);
                } else if (!entry.name.endsWith(".js.map") && !entry.name.endsWith(".d.ts")) {
                    assetFiles.push(fullPath);
                }
            }
        }
    }

    walk(rootDir);
    return { codonFiles, assetFiles };
}

function stripTypeScriptTypes(node: any): void {
    if (!node || typeof node !== "object") return;
    delete node.typeAnnotation;
    delete node.returnType;
    delete node.typeParameters;
    delete node.optional;
    for (const key of Object.keys(node)) {
        if (Array.isArray(node[key])) {
            node[key].forEach(stripTypeScriptTypes);
        } else if (typeof node[key] === "object") {
            stripTypeScriptTypes(node[key]);
        }
    }
}

/**
 * Transpiles codon-runtime.ts into standalone vanilla JavaScript suitable for output into dist/codon-runtime.js.
 */
export function getCodonRuntimeJS(): string {
    const runtimePath = path.resolve(__dirname, "codon-runtime.ts");
    if (fs.existsSync(runtimePath)) {
        try {
            const tsCode = fs.readFileSync(runtimePath, "utf-8");
            const ast = babelParser.parse(tsCode, {
                sourceType: "module",
                plugins: ["typescript"],
            });
            stripTypeScriptTypes(ast);
            return generate(ast).code;
        } catch {
            // fallback if babel parse fails
        }
    }
    // Fallback minimal runtime implementation
    return `// Codon Runtime (zero-dependency combinators & array primitives)
export function fork(f, g, h) {
  return function (...args) {
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
export function hook(f, g) {
  return function (...args) {
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
export function sum(target) {
  return Array.isArray(target) ? target.reduce((a, b) => a + b, 0) : 0;
}
export function product(target) {
  return Array.isArray(target) ? target.reduce((a, b) => a * b, 1) : 1;
}
export function tally(target) {
  if (Array.isArray(target) || typeof target === "string") return target.length;
  if (target === null || target === undefined) return 0;
  return 1;
}
export function range(n) {
  return Array.from({ length: Math.max(0, n) }, (_, i) => i);
}
export function from(indices, target) {
  if (!Array.isArray(target)) return target;
  if (Array.isArray(indices)) return indices.map(idx => target[idx < 0 ? target.length + idx : idx]);
  return target[indices < 0 ? target.length + indices : indices];
}
export function fold(fn, target, init) {
  if (!Array.isArray(target) || target.length === 0) return init;
  return init === undefined ? target.reduce((a, b) => fn(a, b)) : target.reduce((a, b) => fn(a, b), init);
}
export function scan(fn, target, init) {
  if (!Array.isArray(target) || target.length === 0) return [];
  const results = [];
  let acc = init !== undefined ? init : target[0];
  if (init === undefined) results.push(acc);
  for (let i = init !== undefined ? 0 : 1; i < target.length; i++) {
    acc = fn(acc, target[i]);
    results.push(acc);
  }
  return results;
}
`;
}

/**
 * Compiles a single Codon file to JavaScript, rewriting module specifiers.
 */
export function compileFile(
    sourcePath: string,
    targetPath: string,
    options: CompilerOptions
): { success: boolean; jsCode?: string; error?: string; loc?: { line: number; column: number } } {
    try {
        const codonCode = fs.readFileSync(sourcePath, "utf-8");
        const parser = new CodonToASTParser();
        const ast = parser.parse(codonCode);
        const compiler = new CodonToJSCompiler();

        const jsCode = compiler.transpile(ast, {
            ...options,
            currentFilePath: sourcePath,
            targetFilePath: targetPath,
        });

        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.writeFileSync(targetPath, jsCode, "utf-8");
        return { success: true, jsCode };
    } catch (e: any) {
        return {
            success: false,
            error: e.message,
            loc: e.loc,
        };
    }
}

/**
 * Compiles an entire Codon project directory to JavaScript according to codon.json.
 */
export function compileProject(
    projectPathOrDir: string = ".",
    overrides?: CodonCompilerOptions
): CompileResult {
    const startTime = Date.now();
    const { config, projectRoot } = loadCodonConfig(projectPathOrDir);
    const compilerOpts = { ...config.compilerOptions, ...(overrides || {}) };

    const rootDir = path.resolve(projectRoot, compilerOpts.rootDir || "src");
    const outDir = path.resolve(projectRoot, compilerOpts.outDir || "dist");

    // Clean outDir if requested
    if (compilerOpts.clean && fs.existsSync(outDir)) {
        fs.rmSync(outDir, { recursive: true, force: true });
    }

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    // Bundle / emit codon-runtime.js into outDir if enabled
    if (compilerOpts.bundleRuntime) {
        const runtimeOut = path.join(outDir, "codon-runtime.js");
        const runtimeCode = getCodonRuntimeJS();
        fs.writeFileSync(runtimeOut, runtimeCode, "utf-8");
    }

    const { codonFiles, assetFiles } = findProjectFiles(rootDir);
    const compiledFiles: string[] = [];
    const copiedAssets: string[] = [];
    const errors: { file: string; message: string; loc?: { line: number; column: number } }[] = [];

    // Compile all .cdn files
    for (const sourceFile of codonFiles) {
        const relPath = path.relative(rootDir, sourceFile);
        const targetPath = path.join(outDir, relPath.replace(/\.cdn$/, ".js"));

        const res = compileFile(sourceFile, targetPath, {
            ...compilerOpts,
            rootDir,
            outDir,
            currentFilePath: sourceFile,
        });

        if (res.success) {
            compiledFiles.push(targetPath);
        } else {
            errors.push({
                file: sourceFile,
                message: res.error || "Unknown compilation error",
                loc: res.loc,
            });
        }
    }

    // Copy static assets
    if (compilerOpts.copyAssets !== false) {
        for (const assetFile of assetFiles) {
            const relPath = path.relative(rootDir, assetFile);
            const targetPath = path.join(outDir, relPath);
            const targetDir = path.dirname(targetPath);

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            fs.copyFileSync(assetFile, targetPath);
            copiedAssets.push(targetPath);
        }
    }

    const durationMs = Date.now() - startTime;
    return {
        success: errors.length === 0,
        totalFiles: codonFiles.length + copiedAssets.length,
        compiledFiles,
        copiedAssets,
        errors,
        durationMs,
    };
}

/**
 * Runs the project compiler in watch mode (similar to `tsc -w`).
 */
export function watchProject(
    projectPathOrDir: string = ".",
    overrides?: CodonCompilerOptions,
    onRebuild?: (result: CompileResult) => void
): { close: () => void } {
    const { config, projectRoot } = loadCodonConfig(projectPathOrDir);
    const compilerOpts = { ...config.compilerOptions, ...(overrides || {}) };
    const rootDir = path.resolve(projectRoot, compilerOpts.rootDir || "src");
    const outDir = path.resolve(projectRoot, compilerOpts.outDir || "dist");

    console.log(`\n🔍 [Codon Watch] Watching ${rootDir} for changes... (Output: ${outDir})\n`);

    // Initial build
    const initialResult = compileProject(projectPathOrDir, overrides);
    printCompileSummary(initialResult);
    if (onRebuild) onRebuild(initialResult);

    let debounceTimer: any = null;

    const watcher = fs.watch(rootDir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        const fullPath = path.join(rootDir, filename);

        // Ignore temporary/dist/hidden files
        if (filename.includes("node_modules") || filename.includes("dist") || filename.startsWith(".")) {
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const timeStr = new Date().toLocaleTimeString();
            if (fs.existsSync(fullPath)) {
                if (fullPath.endsWith(".cdn")) {
                    const relPath = path.relative(rootDir, fullPath);
                    const targetPath = path.join(outDir, relPath.replace(/\.cdn$/, ".js"));
                    const start = Date.now();
                    const res = compileFile(fullPath, targetPath, {
                        ...compilerOpts,
                        rootDir,
                        outDir,
                        currentFilePath: fullPath,
                    });
                    if (res.success) {
                        console.log(`[${timeStr}] ⚡ Recompiled ${relPath} ➔ ${path.relative(projectRoot, targetPath)} (${Date.now() - start}ms)`);
                    } else {
                        console.error(`[${timeStr}] ❌ Error in ${relPath}: ${res.error}`);
                    }
                } else {
                    const relPath = path.relative(rootDir, fullPath);
                    const targetPath = path.join(outDir, relPath);
                    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
                    fs.copyFileSync(fullPath, targetPath);
                    console.log(`[${timeStr}] 📋 Synced asset ${relPath}`);
                }
            } else {
                // File deleted
                const relPath = path.relative(rootDir, fullPath);
                const targetJs = path.join(outDir, relPath.replace(/\.cdn$/, ".js"));
                if (fs.existsSync(targetJs)) {
                    fs.unlinkSync(targetJs);
                    console.log(`[${timeStr}] 🗑️ Removed ${path.relative(projectRoot, targetJs)}`);
                }
            }
        }, 50);
    });

    return {
        close: () => {
            watcher.close();
            clearTimeout(debounceTimer);
        },
    };
}

export function printCompileSummary(result: CompileResult): void {
    if (result.success) {
        console.log(`✅ [Codon Build] Compiled ${result.compiledFiles.length} files (${result.copiedAssets.length} assets copied) in ${result.durationMs}ms`);
    } else {
        console.error(`❌ [Codon Build] Build failed with ${result.errors.length} error(s):`);
        for (const err of result.errors) {
            console.error(`   - ${err.file}: ${err.message}`);
        }
    }
}
