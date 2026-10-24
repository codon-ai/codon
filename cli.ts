import * as fs from "fs";
import * as path from "path";
import * as parser from "@babel/parser";
import { JToASTParser } from "./j-parser";
import { JToJSTranspiler, JSToJTranspiler } from "./transpilers";

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error("Usage: bun run cli.ts <direction: j2js | js2j> <file>");
    process.exit(1);
}

const [direction, filePath] = args;
const code = fs.readFileSync(path.resolve(filePath), "utf-8");

try {
    if (direction === "j2js") {
        const astParser = new JToASTParser();
        const ast = astParser.parse(code);
        const transpiler = new JToJSTranspiler();
        const jsCode = transpiler.transpile(ast);
        fs.writeFileSync(filePath.replace(/\.j$/, ".js"), jsCode, "utf-8");
        console.log(`✅ Successfully transpiled ${filePath} to JS.`);
    } else if (direction === "js2j") {
        const ast = parser.parse(code, {
            sourceType: "module",
            plugins: ["jsx", "estree"],
        });
        const transpiler = new JSToJTranspiler();
        const jCode = transpiler.transpile(ast.program as any);
        fs.writeFileSync(filePath.replace(/\.jsx?$/, ".j"), jCode, "utf-8");
        console.log(`✅ Successfully transpiled ${filePath} to J.`);
    } else {
        console.error("Invalid direction. Use 'j2js' or 'js2j'.");
    }
} catch (error: any) {
    console.error("❌ Transpilation failed:");
    console.error(
        error.loc
            ? `Error at line ${error.loc.line}, col ${error.loc.column}: ${error.message}`
            : error.message,
    );
    process.exit(1);
}
