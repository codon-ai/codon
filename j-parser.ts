import type { Node, Program, Identifier, BlockStatement } from "./types";

export function splitJStatements(code: string): string[] {
    const statements: string[] = [];
    let current = "";
    let parenDepth = 0;
    let ifDepth = 0;
    let i = 0;

    while (i < code.length) {
        // Strings
        if (code[i] === "'") {
            current += code[i++];
            while (i < code.length) {
                current += code[i];
                if (code[i] === "'" && code[i + 1] !== "'") {
                    i++;
                    break;
                }
                if (code[i] === "'" && code[i + 1] === "'") {
                    current += code[++i];
                }
                i++;
            }
            continue;
        }

        // Template Literals
        if (code[i] === "`") {
            current += code[i++];
            while (i < code.length && code[i] !== "`") current += code[i++];
            if (i < code.length) current += code[i++];
            continue;
        }

        if (code[i] === "(" || code[i] === "{" || code[i] === "[") parenDepth++;
        if (code[i] === ")" || code[i] === "}" || code[i] === "]") parenDepth--;

        if (code.startsWith("if.", i)) ifDepth++;
        if (code.startsWith("end.", i)) {
            ifDepth = Math.max(0, ifDepth - 1);
            current += "end.";
            i += 4;
            if (parenDepth === 0 && ifDepth === 0) {
                statements.push(current.trim());
                current = "";
            }
            continue;
        }

        current += code[i];

        if (parenDepth === 0 && ifDepth === 0 && code[i] === "\n") {
            if (current.trim()) {
                statements.push(current.trim());
                current = "";
            }
        }
        i++;
    }
    if (current.trim()) statements.push(current.trim());
    return statements;
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
        const blocks = splitJStatements(normalized);
        const body: Node[] = [];
        for (const b of blocks) {
            if (b.startsWith("NB. i|"))
                body.push(...this.parseImports(b.trim()));
            else {
                const parsed = this.parseStatement(b);
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
        const stmts = splitJStatements(bodyStr);
        const body: Node[] = [];
        for (const s of stmts) {
            const stmt = this.parseStatement(s);
            if (stmt) body.push(stmt);
        }
        return { type: "BlockStatement", body };
    }

    private parseStatement(stmt: string): Node | null {
        stmt = stmt.trim();
        if (!stmt) return null;
        if (stmt.endsWith(";")) stmt = stmt.slice(0, -1).trim();

        if (stmt.startsWith("NB. e|"))
            return {
                type: "ExportDefaultDeclaration",
                declaration: this.parseExpression(stmt.substring(6).trim()),
            };

        const ifRegex =
            /^if\.\s*([\s\S]*?)\s*do\.\s*([\s\S]*?)(?:\s*else\.\s*([\s\S]*?))?\s*end\.$/;
        const matchIf = stmt.match(ifRegex);
        if (matchIf) {
            const test = this.parseExpression(matchIf[1]);
            const consequent = this.parseBlock(matchIf[2]);
            const alternate = matchIf[3] ? this.parseBlock(matchIf[3]) : null;
            return { type: "IfStatement", test, consequent, alternate };
        }

        // Recover from JS-style constant blocks
        const varMatch = stmt.match(
            /^(const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([\s\S]*)$/,
        );
        if (varMatch) {
            return {
                type: "VariableDeclaration",
                kind: varMatch[1],
                declarations: [
                    {
                        type: "VariableDeclarator",
                        id: { type: "Identifier", name: varMatch[2] },
                        init: this.parseExpression(varMatch[3]),
                    },
                ],
            };
        }

        const assignMatch = stmt.match(
            /^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:=:|=.)\s*([\s\S]*)$/,
        );
        if (assignMatch && !stmt.startsWith("{{") && !stmt.startsWith("({{")) {
            return {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                    {
                        type: "VariableDeclarator",
                        id: { type: "Identifier", name: assignMatch[1] },
                        init: this.parseExpression(assignMatch[2]),
                    },
                ],
            };
        }

        const expr = this.parseExpression(stmt);
        if (expr.type === "FunctionDeclaration") return expr;
        return { type: "ExpressionStatement", expression: expr };
    }

    private parseBinaryOrAssignment(str: string): Node | null {
        let depth = 0,
            inStr = false,
            inTpl = false;
        let lowestPrec = -1;
        let opIdx = -1;
        let foundOp = "";

        const ops = [
            ["="],
            ["||", "??"],
            ["&&"],
            ["===", "!==", "==", "!="],
            ["<=", ">=", "<", ">"],
            ["+", "-"],
            ["*", "/", "%"],
        ];

        const getPrec = (op: string) =>
            ops.findIndex((list) => list.includes(op));

        for (let i = 0; i < str.length; i++) {
            if (str[i] === "'" && !inTpl) inStr = !inStr;
            if (str[i] === "`" && !inStr) inTpl = !inTpl;
            if (inStr || inTpl) continue;
            if (str[i] === "(" || str[i] === "[" || str[i] === "{") depth++;
            if (str[i] === ")" || str[i] === "]" || str[i] === "}") depth--;

            if (depth === 0) {
                for (const opGroup of ops) {
                    for (const op of opGroup) {
                        if (str.startsWith(op, i)) {
                            // Ensure we don't accidentally match partial operators
                            if (
                                op === "=" &&
                                (str[i + 1] === "=" ||
                                    str[i + 1] === ":" ||
                                    str[i + 1] === ".")
                            )
                                continue;
                            if (
                                (op === "<" ||
                                    op === ">" ||
                                    op === "!" ||
                                    op === "=") &&
                                str[i + 1] === "="
                            )
                                continue;

                            const p = getPrec(op);
                            if (p >= lowestPrec) {
                                lowestPrec = p;
                                opIdx = i;
                                foundOp = op;
                            }
                        }
                    }
                }
            }
        }

        if (opIdx !== -1) {
            const leftStr = str.substring(0, opIdx).trim();
            const rightStr = str.substring(opIdx + foundOp.length).trim();

            if (foundOp === "=") {
                return {
                    type: "AssignmentExpression",
                    operator: "=",
                    left: this.parseExpression(leftStr),
                    right: this.parseExpression(rightStr),
                };
            } else if (["&&", "||", "??"].includes(foundOp)) {
                return {
                    type: "LogicalExpression",
                    operator: foundOp,
                    left: this.parseExpression(leftStr),
                    right: this.parseExpression(rightStr),
                };
            } else {
                return {
                    type: "BinaryExpression",
                    operator: foundOp,
                    left: this.parseExpression(leftStr),
                    right: this.parseExpression(rightStr),
                };
            }
        }
        return null;
    }

    private parseExpression(expr: string): Node {
        expr = expr.trim();
        let strippedExpr = expr;
        let wasWrapped = false;

        if (isFullyWrapped(strippedExpr)) {
            strippedExpr = strippedExpr.slice(1, -1).trim();
            wasWrapped = true;
        }

        const binNode = this.parseBinaryOrAssignment(strippedExpr);
        if (binNode) return binNode;

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

        if (strippedExpr.startsWith("`") && strippedExpr.endsWith("`")) {
            const content = strippedExpr.slice(1, -1);
            const quasis = [];
            const expressions = [];
            let i = 0;
            let lastIdx = 0;
            while (i < content.length) {
                if (content.substring(i, i + 2) === "${") {
                    quasis.push({
                        type: "TemplateElement",
                        value: {
                            raw: content.substring(lastIdx, i),
                            cooked: content.substring(lastIdx, i),
                        },
                        tail: false,
                    });
                    let depth = 1;
                    let j = i + 2;
                    while (j < content.length && depth > 0) {
                        if (content[j] === "{") depth++;
                        else if (content[j] === "}") depth--;
                        j++;
                    }
                    expressions.push(
                        this.parseExpression(content.substring(i + 2, j - 1)),
                    );
                    lastIdx = j;
                    i = j;
                } else {
                    i++;
                }
            }
            quasis.push({
                type: "TemplateElement",
                value: {
                    raw: content.substring(lastIdx),
                    cooked: content.substring(lastIdx),
                },
                tail: true,
            });
            return { type: "TemplateLiteral", quasis, expressions };
        }

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
