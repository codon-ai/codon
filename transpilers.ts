import type { Node, Literal, Identifier } from "./types";
import generate from "@babel/generator";

export class JSToJTranspiler {
    public transpile(node: Node): string {
        if (!node) return "";

        switch (node.type) {
            case "Program":
                const imports: string[] = [];
                const exports: string[] = [];
                const body: string[] = [];
                for (const n of node.body) {
                    if (n.type === "ImportDeclaration") {
                        const source = String(
                            (n.source as Literal).value,
                        ).replace(/\|/g, "%7C");
                        if (!n.specifiers || n.specifiers.length === 0)
                            imports.push(`S::${source}`);
                        else if (
                            n.specifiers[0].type === "ImportDefaultSpecifier"
                        )
                            imports.push(
                                `D:${(n.specifiers[0] as any).local.name}:${source}`,
                            );
                        else
                            imports.push(
                                `N:${n.specifiers.map((s) => (s as any).imported.name).join(",")}:${source}`,
                            );
                    } else if (n.type === "ExportDefaultDeclaration") {
                        exports.push(`NB. e|${this.transpile(n.declaration)}`);
                    } else {
                        body.push(this.transpile(n));
                    }
                }
                const out = [];
                if (imports.length > 0) out.push(`NB. i|${imports.join("|")}`);
                out.push(...body);
                out.push(...exports);
                return out.filter(Boolean).join("\n\n");

            case "VariableDeclaration":
                return node.declarations
                    .map((d) => {
                        const idStr = this.transpilePattern(d.id);
                        const initStr = d.init ? this.transpile(d.init) : "''";
                        return `${idStr} =: ${initStr}`;
                    })
                    .join("\n");

            case "ExpressionStatement":
                return this.transpile(node.expression);

            case "BlockStatement":
                return node.body.map((n) => this.transpile(n)).join("\n");

            case "FunctionDeclaration":
                const fdParams = node.params
                    .map((p) => this.transpilePattern(p))
                    .join(",");
                return `{{ NB. FD|${node.id.name}|${fdParams}\n${this.transpile(node.body)}\n}}`;

            case "FunctionExpression":
                const feParams = node.params
                    .map((p) => this.transpilePattern(p))
                    .join(",");
                return `({{ NB. FE|${feParams}\n${this.transpile(node.body)}\n}})`;

            case "ArrowFunctionExpression":
                const pStr = node.params
                    .map((p) => this.transpilePattern(p))
                    .join(",");
                const isBlock = node.body.type === "BlockStatement";
                return `({{ NB. ${isBlock ? "pB" : "pE"}|${pStr}\n${this.transpile(node.body)}\n}})`;

            case "ReturnStatement":
                return node.argument ? this.transpile(node.argument) : "";

            case "ArrayExpression":
                if (node.elements.length === 0) return `(0$0)`;
                if (node.elements.length === 1)
                    return `(,${this.transpile(node.elements[0])})`;
                return `(${node.elements.map((n) => this.transpile(n)).join(";")})`;

            case "ObjectExpression":
                if (!node.properties || node.properties.length === 0)
                    return `O''`;
                return `O(${node.properties.map((p) => this.transpile(p)).join(";")})`;

            case "Property":
                const keyStr =
                    node.key.type === "Identifier"
                        ? node.key.name
                        : String((node.key as Literal).value);
                return `'${keyStr}';${this.transpile(node.value)}`;

            case "NewExpression":
                const newArgs = node.arguments
                    .map((a) => this.transpile(a))
                    .join(" ");
                return `(new ${this.transpile(node.callee)}${newArgs ? " " + newArgs : ""})`;

            case "CallExpression":
                if (
                    node.callee.type === "MemberExpression" &&
                    (node.callee.property as Identifier).name === "map" &&
                    node.arguments.length === 1
                ) {
                    return `(${this.transpile(node.arguments[0])}) "0 ${this.transpile(node.callee.object)}`;
                }
                const calleeStr = this.transpile(node.callee);
                if (node.arguments.length === 0) return `${calleeStr}()`;
                return `(${calleeStr} ${node.arguments.map((n) => this.transpile(n)).join(" ")})`;

            case "MemberExpression":
                if (node.computed)
                    return `${this.transpile(node.object)}.${this.transpile(node.property)}`;
                return `${this.transpile(node.object)}.${(node.property as Identifier).name}`;

            case "BinaryExpression":
            case "LogicalExpression":
                return `(${this.transpile(node.left)} ${node.operator} ${this.transpile(node.right)})`;

            case "UnaryExpression":
                return `(${node.operator}${this.transpile(node.argument)})`;

            case "Literal":
                if (node.value === null) return `''`;
                if (typeof node.value === "boolean") return String(node.value);
                return typeof node.value === "string"
                    ? `'${node.value.replace(/'/g, "''")}'`
                    : String(node.value);

            case "Identifier":
                return node.name;

            case "ObjectPattern":
            case "ArrayPattern":
            case "AssignmentPattern":
            case "RestElement":
            case "ExportNamedDeclaration":
            case "JSXElement":
            case "JSXOpeningElement":
            case "JSXAttribute":
            case "JSXExpressionContainer":
            case "JSXText":
                throw new Error(
                    `Node type ${node.type} requires further implementation for J emission.`,
                );

            default:
                const _x: never = node;
                throw new Error(
                    `Unsupported node "${(node as any).type}" at line ${(node as any).loc?.start?.line ?? "?"}`,
                );
        }
    }

    private transpilePattern(node: Node): string {
        if (node.type === "Identifier") return node.name;
        if (node.type === "AssignmentPattern")
            return `${this.transpilePattern(node.left)}=${this.transpile(node.right)}`;
        return "___unsupported_pattern___";
    }
}

export class JToJSTranspiler {
    public transpile(node: Node): string {
        if (!node) return "";

        // Deep clone and transform ESTree into Babel-compatible AST
        const toBabel = (n: any): any => {
            if (Array.isArray(n)) return n.map(toBabel);
            if (!n || typeof n !== "object") return n;

            const res: any = {};
            for (const key in n) {
                res[key] = toBabel(n[key]);
            }

            // Map ESTree 'Literal' to Babel's strict literal types
            if (res.type === "Literal") {
                if (typeof res.value === "string")
                    return { ...res, type: "StringLiteral" };
                if (typeof res.value === "number")
                    return { ...res, type: "NumericLiteral" };
                if (typeof res.value === "boolean")
                    return { ...res, type: "BooleanLiteral" };
                if (res.value === null) return { ...res, type: "NullLiteral" };
            }

            // Map ESTree 'Property' to Babel's 'ObjectProperty'
            if (res.type === "Property") {
                return { ...res, type: "ObjectProperty" };
            }

            return res;
        };

        try {
            const babelAST = toBabel(node);
            const result = generate(babelAST);
            return result.code;
        } catch (e) {
            throw new Error(`Failed to generate JS from AST: ${e}`);
        }
    }
}
