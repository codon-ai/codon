import type { Node, Program, Identifier, BlockStatement } from "./types";

function indexAtLevel(str: string, token: string): number {
    let depth = 0,
        inString = false;
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === "'") inString = !inString;
        if (inString) continue;
        if (c === "(" || c === "{") depth++;
        else if (c === ")" || c === "}") depth--;
        else if (depth === 0 && str.startsWith(token, i)) return i;
    }
    return -1;
}

function splitAtLevel(str: string, delimiter: string): string[] {
    let args = [],
        depth = 0,
        current = "",
        inString = false;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === "'") inString = !inString;
        if (!inString) {
            if (char === "(" || char === "{") depth++;
            if (char === ")" || char === "}") depth--;
            if (char === delimiter && depth === 0) {
                args.push(current.trim());
                current = "";
                continue;
            }
        }
        current += char;
    }
    if (current.trim()) args.push(current.trim());
    return args;
}

function isFullyWrapped(
    str: string,
    open: string = "(",
    close: string = ")",
): boolean {
    if (!str.startsWith(open) || !str.endsWith(close)) return false;
    let d = 0,
        inString = false,
        bal = true;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === "'") inString = !inString;
        if (inString) continue;
        if (str[i] === open) d++;
        if (str[i] === close) d--;
        if (d === 0 && i !== str.length - 1) bal = false;
    }
    return bal;
}

export class JToASTParser {
    public parse(code: string): Program {
        const normalized = code.replace(/\r\n/g, "\n");
        const blocks = splitAtLevel(normalized, "\n\n");
        const body: Node[] = [];
        for (const b of blocks) {
            if (b.startsWith("NB. i|"))
                body.push(...this.parseImports(b.trim()));
            else {
                const parsed = this.parseStatement(b.trim());
                if (parsed) body.push(parsed);
            }
        }
        return { type: "Program", body };
    }

    private parseImports(stmt: string): Node[] {
        const declarations: Node[] = [];
        const imports = stmt.substring(6).split("|");
        for (const imp of imports) {
            const parts = imp.split(":");
            const specifiers: Node[] = [];
            const src = parts[2].replace(/%7C/g, "|");
            if (parts[0] === "D")
                specifiers.push({
                    type: "ImportDefaultSpecifier",
                    local: { type: "Identifier", name: parts[1] },
                });
            else if (parts[0] === "N" && parts[1])
                parts[1]
                    .split(",")
                    .forEach((n) =>
                        specifiers.push({
                            type: "ImportSpecifier",
                            imported: { type: "Identifier", name: n },
                        }),
                    );
            declarations.push({
                type: "ImportDeclaration",
                specifiers,
                source: { type: "Literal", value: src },
            });
        }
        return declarations;
    }

    private parseBlock(bodyStr: string): BlockStatement {
        const stmts = splitAtLevel(bodyStr, "\n");
        const body: Node[] = [];
        for (const s of stmts) {
            const stmt = this.parseStatement(s.trim());
            if (stmt) body.push(stmt);
        }
        return { type: "BlockStatement", body };
    }

    private parseStatement(stmt: string): Node | null {
        if (!stmt) return null;
        if (stmt.startsWith("NB. e|"))
            return {
                type: "ExportDefaultDeclaration",
                declaration: this.parseExpression(stmt.substring(6).trim()),
            };

        const assignIdx = indexAtLevel(stmt, " =: ");
        if (
            assignIdx !== -1 &&
            !stmt.startsWith("{{") &&
            !stmt.startsWith("({{")
        ) {
            return {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                    {
                        type: "VariableDeclarator",
                        id: {
                            type: "Identifier",
                            name: stmt.substring(0, assignIdx).trim(),
                        },
                        init: this.parseExpression(
                            stmt.substring(assignIdx + 4).trim(),
                        ),
                    },
                ],
            };
        }

        const expr = this.parseExpression(stmt);
        if (expr.type === "FunctionDeclaration") return expr;
        return { type: "ExpressionStatement", expression: expr };
    }

    private parseExpression(expr: string): Node {
        expr = expr.trim();
        let strippedExpr = expr;
        let wasWrapped = false;

        if (isFullyWrapped(strippedExpr)) {
            strippedExpr = strippedExpr.slice(1, -1).trim();
            wasWrapped = true;
        }

        // Functions
        if (strippedExpr.startsWith("{{") && strippedExpr.endsWith("}}")) {
            const inner = strippedExpr.slice(2, -2).trim();
            const nlIdx = inner.indexOf("\n");
            const firstLine = inner.substring(0, nlIdx).trim();
            const bodyStr = inner.substring(nlIdx + 1).trim();
            let params: Identifier[] = [];

            const parseParams = (str: string) =>
                str
                    .split(",")
                    .filter(Boolean)
                    .map(
                        (p) =>
                            ({
                                type: "Identifier",
                                name: p.trim(),
                            }) as Identifier,
                    );

            if (firstLine.includes("NB. FD|")) {
                const parts = firstLine.split("NB. FD|")[1].trim().split("|");
                return {
                    type: "FunctionDeclaration",
                    id: { type: "Identifier", name: parts[0] },
                    params: parts[1] ? parseParams(parts[1]) : [],
                    body: this.parseBlock(bodyStr),
                };
            }
            if (firstLine.includes("NB. FE|"))
                return {
                    type: "FunctionExpression",
                    id: null,
                    params: parseParams(firstLine.split("NB. FE|")[1].trim()),
                    body: this.parseBlock(bodyStr),
                };
            if (firstLine.includes("NB. pB|"))
                return {
                    type: "ArrowFunctionExpression",
                    params: parseParams(firstLine.split("NB. pB|")[1].trim()),
                    body: this.parseBlock(bodyStr),
                };
            if (firstLine.includes("NB. pE|"))
                return {
                    type: "ArrowFunctionExpression",
                    params: parseParams(firstLine.split("NB. pE|")[1].trim()),
                    body: this.parseExpression(bodyStr),
                };
        }

        // Objects
        if (/^O[ (]/.test(strippedExpr) || strippedExpr === "O''") {
            if (strippedExpr === "O''")
                return { type: "ObjectExpression", properties: [] };
            let strippedO = strippedExpr.startsWith("O(")
                ? strippedExpr.substring(1).trim()
                : strippedExpr.substring(2).trim();
            if (isFullyWrapped(strippedO)) strippedO = strippedO.slice(1, -1);

            const parts = splitAtLevel(strippedO, ";");
            const properties: any[] = [];
            for (let i = 0; i < parts.length; i += 2) {
                const keyNode = this.parseExpression(parts[i]);
                const keyName =
                    keyNode.type === "Literal"
                        ? String(keyNode.value)
                        : (keyNode as Identifier).name;
                const keyAST = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(keyName)
                    ? { type: "Identifier", name: keyName }
                    : { type: "Literal", value: keyName };
                properties.push({
                    type: "Property",
                    key: keyAST,
                    value: this.parseExpression(parts[i + 1]),
                    kind: "init",
                    computed: false,
                });
            }
            return { type: "ObjectExpression", properties };
        }

        if (strippedExpr.endsWith("()") && !/^O[ (]/.test(strippedExpr)) {
            return {
                type: "CallExpression",
                callee: this.parseExpression(strippedExpr.slice(0, -2)),
                arguments: [],
            };
        }

        const mapMatch = strippedExpr.match(/^\(([\s\S]*)\)\s+"0\s+([\s\S]*)$/);
        if (mapMatch) {
            return {
                type: "CallExpression",
                callee: {
                    type: "MemberExpression",
                    object: this.parseExpression(mapMatch[2]),
                    property: { type: "Identifier", name: "map" },
                    computed: false,
                },
                arguments: [this.parseExpression(mapMatch[1])],
            };
        }

        // Single-element Arrays
        if (strippedExpr.startsWith(",") && wasWrapped) {
            return {
                type: "ArrayExpression",
                elements: [this.parseExpression(strippedExpr.slice(1).trim())],
            };
        }

        if (strippedExpr === "0$0")
            return { type: "ArrayExpression", elements: [] };
        const semiParts = splitAtLevel(strippedExpr, ";");
        if (semiParts.length > 1)
            return {
                type: "ArrayExpression",
                elements: semiParts.map((e) => this.parseExpression(e)),
            };

        if (wasWrapped) {
            const spaceParts = splitAtLevel(strippedExpr, " ");
            if (spaceParts.length > 1) {
                if (spaceParts[0] === "new")
                    return {
                        type: "NewExpression",
                        callee: this.parseExpression(spaceParts[1]),
                        arguments: spaceParts
                            .slice(2)
                            .map((a) => this.parseExpression(a)),
                    };
                return {
                    type: "CallExpression",
                    callee: this.parseExpression(spaceParts[0]),
                    arguments: spaceParts
                        .slice(1)
                        .map((a) => this.parseExpression(a)),
                };
            }
        }

        if (strippedExpr === "true" || strippedExpr === "false")
            return { type: "Literal", value: strippedExpr === "true" };
        if (strippedExpr.startsWith("'") && strippedExpr.endsWith("'"))
            return {
                type: "Literal",
                value: strippedExpr.slice(1, -1).replace(/''/g, "'"),
            };
        if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(strippedExpr))
            return { type: "Literal", value: Number(strippedExpr) };

        const dotParts = splitAtLevel(strippedExpr, ".");
        if (dotParts.length > 1) {
            let node: Node = this.parseExpression(dotParts[0]);
            for (let i = 1; i < dotParts.length; i++) {
                node = {
                    type: "MemberExpression",
                    object: node,
                    property: { type: "Identifier", name: dotParts[i] },
                    computed: false,
                };
            }
            return node;
        }

        return { type: "Identifier", name: strippedExpr };
    }
}
