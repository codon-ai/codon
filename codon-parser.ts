import type {
    Node,
    Program,
    Identifier,
    BlockStatement,
    ClassDeclaration,
    ClassBody,
    MethodDefinition,
    PropertyDefinition,
    ForOfStatement,
    ForInStatement,
    ForStatement,
    WhileStatement,
    DoWhileStatement,
    TryStatement,
    CatchClause,
    ThrowStatement,
    SwitchStatement,
    SwitchCase,
    IfStatement,
    VariableDeclaration,
    FunctionDeclaration,
    FunctionExpression,
    ArrowFunctionExpression,
    CallExpression,
    MemberExpression,
    ObjectExpression,
    ArrayExpression,
    Literal,
    JSXElement,
    JSXOpeningElement,
    JSXClosingElement,
    JSXAttribute,
    JSXExpressionContainer,
    JSXText,
    JSXIdentifier,
    CodonTrainExpression,
    CodonFoldExpression,
    CodonRankExpression,
    RestElement,
    ObjectPattern,
    ArrayPattern,
    AssignmentPattern,
} from "./types";

export function splitCodonStatements(code: string): string[] {
    const statements: string[] = [];
    let current = "";
    let parenDepth = 0;
    let braceDepth = 0;
    let bracketDepth = 0;
    let blockDepth = 0;
    let inString = false;
    let inTpl = false;
    let i = 0;

    const blockOpeners = [
        "if.",
        "class.",
        "for_of.",
        "for_in.",
        "for.",
        "while.",
        "whilst.",
        "try.",
        "select.",
        "constructor.",
        "async_method.",
        "method.",
        "get.",
        "set.",
    ];

    while (i < code.length) {
        const char = code[i];

        // Comments: NB.
        if (!inString && !inTpl && code.startsWith("NB.", i)) {
            while (i < code.length && code[i] !== "\n") {
                current += code[i++];
            }
            if (i < code.length && code[i] === "\n") {
                current += code[i++];
                if (parenDepth === 0 && braceDepth === 0 && bracketDepth === 0 && blockDepth === 0) {
                    if (current.trim()) {
                        statements.push(current.trim());
                        current = "";
                    }
                }
            }
            continue;
        }

        // Strings: '...' with '' escape
        if (!inTpl && char === "'") {
            current += char;
            i++;
            while (i < code.length) {
                current += code[i];
                if (code[i] === "'") {
                    if (code[i + 1] === "'") {
                        current += code[++i];
                    } else {
                        i++;
                        break;
                    }
                }
                i++;
            }
            continue;
        }

        // Template literals: `...`
        if (char === "`") {
            current += char;
            i++;
            while (i < code.length && code[i] !== "`") {
                if (code[i] === "\\" && i + 1 < code.length) {
                    current += code[i++];
                }
                current += code[i++];
            }
            if (i < code.length) current += code[i++];
            continue;
        }

        // Depth tracking
        if (char === "(") parenDepth++;
        else if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
        else if (char === "{") braceDepth++;
        else if (char === "}") braceDepth = Math.max(0, braceDepth - 1);
        else if (char === "[") bracketDepth++;
        else if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);

        // Check for block openers
        for (const opener of blockOpeners) {
            if (code.startsWith(opener, i)) {
                const prev = i > 0 ? code[i - 1] : " ";
                if (/[\s\n;]/.test(prev)) {
                    blockDepth++;
                    break;
                }
            }
        }

        // Check for end.
        if (code.startsWith("end.", i)) {
            const prev = i > 0 ? code[i - 1] : " ";
            if (/[\s\n;]/.test(prev)) {
                blockDepth = Math.max(0, blockDepth - 1);
                current += "end.";
                i += 4;
                if (parenDepth === 0 && braceDepth === 0 && bracketDepth === 0 && blockDepth === 0) {
                    if (current.trim()) {
                        statements.push(current.trim());
                        current = "";
                    }
                }
                continue;
            }
        }

        current += code[i];

        if (parenDepth === 0 && braceDepth === 0 && bracketDepth === 0 && blockDepth === 0 && code[i] === "\n") {
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

export function splitAtLevel(str: string, delimiter: string): string[] {
    const args: string[] = [];
    let depth = 0;
    let braceDepth = 0;
    let bracketDepth = 0;
    let current = "";
    let inString = false;
    let inTpl = false;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === "'" && !inTpl) {
            inString = !inString;
            current += char;
            continue;
        }
        if (char === "`" && !inString) {
            inTpl = !inTpl;
            current += char;
            continue;
        }
        if (!inString && !inTpl) {
            if (char === "(") depth++;
            else if (char === ")") depth = Math.max(0, depth - 1);
            else if (char === "{") braceDepth++;
            else if (char === "}") braceDepth = Math.max(0, braceDepth - 1);
            else if (char === "[") bracketDepth++;
            else if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);

            if (
                str.startsWith(delimiter, i) &&
                depth === 0 &&
                braceDepth === 0 &&
                bracketDepth === 0
            ) {
                args.push(current.trim());
                current = "";
                i += delimiter.length - 1;
                continue;
            }
        }
        current += char;
    }
    if (current.trim()) args.push(current.trim());
    return args;
}

export function isFullyWrapped(
    str: string,
    open: string = "(",
    close: string = ")",
): boolean {
    str = str.trim();
    if (!str.startsWith(open) || !str.endsWith(close)) return false;
    let d = 0;
    let inString = false;
    let inTpl = false;
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (char === "'" && !inTpl) {
            inString = !inString;
            continue;
        }
        if (char === "`" && !inString) {
            inTpl = !inTpl;
            continue;
        }
        if (inString || inTpl) continue;
        if (char === open) d++;
        if (char === close) d--;
        if (d === 0 && i !== str.length - 1) return false;
    }
    return d === 0;
}

export class CodonToASTParser {
    public parse(code: string): Program {
        const normalized = code.replace(/\r\n/g, "\n");
        const blocks = splitCodonStatements(normalized);
        const body: Node[] = [];

        for (let idx = 0; idx < blocks.length; idx++) {
            const b = blocks[idx].trim();
            if (!b) continue;

            if (b.startsWith("NB. i|")) {
                body.push(...this.parseImports(b));
            } else if (b.startsWith("NB. export")) {
                const remainder = b.slice("NB. export".length).trim();
                if (remainder) {
                    const parsed = this.parseStatement(remainder);
                    if (parsed) body.push({ type: "ExportNamedDeclaration", declaration: parsed, specifiers: [] });
                } else if (idx + 1 < blocks.length) {
                    idx++;
                    const nextStmt = this.parseStatement(blocks[idx]);
                    if (nextStmt) {
                        body.push({ type: "ExportNamedDeclaration", declaration: nextStmt, specifiers: [] });
                    }
                }
            } else if (b.startsWith("NB. ex|")) {
                const specifiers = b
                    .slice(7)
                    .split(",")
                    .map((s) => ({
                        type: "ExportSpecifier",
                        exported: { type: "Identifier", name: s.trim() },
                        local: { type: "Identifier", name: s.trim() },
                    }));
                body.push({ type: "ExportNamedDeclaration", declaration: null, specifiers });
            } else if (b.startsWith("NB. e|")) {
                body.push({
                    type: "ExportDefaultDeclaration",
                    declaration: this.parseExpression(b.substring(6).trim()),
                });
            } else {
                const parsed = this.parseStatement(b);
                if (parsed) body.push(parsed);
            }
        }

        return { type: "Program", body, sourceType: "module" };
    }

    private parseImports(stmt: string): Node[] {
        const declarations: Node[] = [];
        const imports = stmt.substring(6).split("|");
        for (const imp of imports) {
            const parts = imp.split(":");
            const specifiers: any[] = [];
            const src = parts[2].replace(/%7C/g, "|").replace(/%3A/g, ":");

            if (parts[0] === "D") {
                specifiers.push({
                    type: "ImportDefaultSpecifier",
                    local: { type: "Identifier", name: parts[1] },
                });
            } else if (parts[0] === "A") {
                specifiers.push({
                    type: "ImportNamespaceSpecifier",
                    local: { type: "Identifier", name: parts[1] },
                });
            } else if (parts[0] === "N" && parts[1]) {
                parts[1].split(",").forEach((item) => {
                    if (item.includes(" as ")) {
                        const [imported, local] = item.split(" as ");
                        specifiers.push({
                            type: "ImportSpecifier",
                            imported: { type: "Identifier", name: imported.trim() },
                            local: { type: "Identifier", name: local.trim() },
                        });
                    } else {
                        specifiers.push({
                            type: "ImportSpecifier",
                            imported: { type: "Identifier", name: item.trim() },
                        });
                    }
                });
            }
            declarations.push({
                type: "ImportDeclaration",
                specifiers,
                source: { type: "Literal", value: src },
            });
        }
        return declarations;
    }

    public parseBlock(bodyStr: string): BlockStatement {
        const stmts = splitCodonStatements(bodyStr);
        const body: Node[] = [];
        for (const s of stmts) {
            const stmt = this.parseStatement(s);
            if (stmt) body.push(stmt);
        }
        return { type: "BlockStatement", body };
    }

    public parseStatement(stmt: string): Node | null {
        stmt = stmt.trim();
        if (!stmt) return null;
        if (stmt.endsWith(";")) stmt = stmt.slice(0, -1).trim();

        // Export Default
        if (stmt.startsWith("NB. e|")) {
            return {
                type: "ExportDefaultDeclaration",
                declaration: this.parseExpression(stmt.substring(6).trim()),
            };
        }

        // Class Declaration: class. Name [extends Super] do. ... end.
        if (stmt.startsWith("class.")) {
            const doIdx = stmt.indexOf(" do.");
            if (doIdx !== -1 && stmt.endsWith("end.")) {
                const header = stmt.substring("class.".length, doIdx).trim();
                const innerBody = stmt.substring(doIdx + 4, stmt.length - 4).trim();
                const match = header.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)(?:\s+extends\s+([a-zA-Z_$][a-zA-Z0-9_$]*))?$/);
                if (match) {
                    const className = match[1];
                    const superClass = match[2] ? { type: "Identifier" as const, name: match[2] } : null;
                    const classBody = this.parseClassBody(innerBody);
                    return {
                        type: "ClassDeclaration",
                        id: { type: "Identifier", name: className },
                        superClass: superClass as any,
                        body: classBody,
                    };
                }
            }
        }

        // ForOf Statement: for_of. pattern : collection do. ... end.
        if (stmt.startsWith("for_of.")) {
            const doIdx = stmt.indexOf(" do.");
            if (doIdx !== -1 && stmt.endsWith("end.")) {
                const header = stmt.substring("for_of.".length, doIdx).trim();
                const colonIdx = header.indexOf(":");
                const leftStr = header.substring(0, colonIdx).trim();
                const rightStr = header.substring(colonIdx + 1).trim();
                const mBody = stmt.substring(doIdx + 4, stmt.length - 4).trim();
                return {
                    type: "ForOfStatement",
                    left: {
                        type: "VariableDeclaration",
                        kind: "const",
                        declarations: [{ type: "VariableDeclarator", id: this.parsePattern(leftStr), init: null }],
                    },
                    right: this.parseExpression(rightStr),
                    body: this.parseBlock(mBody),
                };
            }
        }

        // ForIn Statement: for_in. pattern : object do. ... end.
        if (stmt.startsWith("for_in.")) {
            const doIdx = stmt.indexOf(" do.");
            if (doIdx !== -1 && stmt.endsWith("end.")) {
                const header = stmt.substring("for_in.".length, doIdx).trim();
                const colonIdx = header.indexOf(":");
                const leftStr = header.substring(0, colonIdx).trim();
                const rightStr = header.substring(colonIdx + 1).trim();
                const mBody = stmt.substring(doIdx + 4, stmt.length - 4).trim();
                return {
                    type: "ForInStatement",
                    left: {
                        type: "VariableDeclaration",
                        kind: "const",
                        declarations: [{ type: "VariableDeclarator", id: this.parsePattern(leftStr), init: null }],
                    },
                    right: this.parseExpression(rightStr),
                    body: this.parseBlock(mBody),
                };
            }
        }

        // For Statement: for. init ; test ; update do. ... end.
        if (stmt.startsWith("for.")) {
            const doIdx = stmt.indexOf(" do.");
            if (doIdx !== -1 && stmt.endsWith("end.")) {
                const header = stmt.substring("for.".length, doIdx).trim();
                const parts = splitAtLevel(header, ";");
                const init = parts[0] ? this.parseStatement(parts[0]) : null;
                const test = parts[1] ? this.parseExpression(parts[1]) : null;
                const update = parts[2] ? this.parseExpression(parts[2]) : null;
                const mBody = stmt.substring(doIdx + 4, stmt.length - 4).trim();
                return {
                    type: "ForStatement",
                    init: init as any,
                    test,
                    update,
                    body: this.parseBlock(mBody),
                };
            }
        }

        // While Statement: while. test do. ... end.
        if (stmt.startsWith("while.")) {
            const doIdx = stmt.indexOf(" do.");
            if (doIdx !== -1 && stmt.endsWith("end.")) {
                const testStr = stmt.substring("while.".length, doIdx).trim();
                const mBody = stmt.substring(doIdx + 4, stmt.length - 4).trim();
                return {
                    type: "WhileStatement",
                    test: this.parseExpression(testStr),
                    body: this.parseBlock(mBody),
                };
            }
        }

        // DoWhile Statement: whilst. test do. ... end.
        if (stmt.startsWith("whilst.")) {
            const doIdx = stmt.indexOf(" do.");
            if (doIdx !== -1 && stmt.endsWith("end.")) {
                const testStr = stmt.substring("whilst.".length, doIdx).trim();
                const mBody = stmt.substring(doIdx + 4, stmt.length - 4).trim();
                return {
                    type: "DoWhileStatement",
                    test: this.parseExpression(testStr),
                    body: this.parseBlock(mBody),
                };
            }
        }

        // Try / Catch / Finally Statement: try. do. ... catch. err do. ... finally. do. ... end.
        if (stmt.startsWith("try.")) {
            if (stmt.endsWith("end.")) {
                const inner = stmt.substring("try.".length, stmt.length - 4).trim();
                let tryBlockStr = "";
                let catchParam = "";
                let catchBlockStr = "";
                let finallyBlockStr = "";

                const catchIdx = inner.indexOf("catch.");
                const finallyIdx = inner.indexOf("finally.");

                if (catchIdx !== -1) {
                    tryBlockStr = inner.substring(0, catchIdx).trim();
                    if (tryBlockStr.startsWith("do.")) tryBlockStr = tryBlockStr.substring(3).trim();

                    const catchPart = finallyIdx !== -1 ? inner.substring(catchIdx, finallyIdx).trim() : inner.substring(catchIdx).trim();
                    const catchDoIdx = catchPart.indexOf(" do.");
                    if (catchDoIdx !== -1) {
                        catchParam = catchPart.substring("catch.".length, catchDoIdx).trim();
                        catchBlockStr = catchPart.substring(catchDoIdx + 4).trim();
                    }

                    if (finallyIdx !== -1) {
                        let finPart = inner.substring(finallyIdx).trim();
                        if (finPart.startsWith("finally. do.")) finPart = finPart.substring("finally. do.".length).trim();
                        else if (finPart.startsWith("finally.")) finPart = finPart.substring("finally.".length).trim();
                        finallyBlockStr = finPart;
                    }
                } else if (finallyIdx !== -1) {
                    tryBlockStr = inner.substring(0, finallyIdx).trim();
                    if (tryBlockStr.startsWith("do.")) tryBlockStr = tryBlockStr.substring(3).trim();
                    let finPart = inner.substring(finallyIdx).trim();
                    if (finPart.startsWith("finally. do.")) finPart = finPart.substring("finally. do.".length).trim();
                    finallyBlockStr = finPart;
                } else {
                    tryBlockStr = inner;
                    if (tryBlockStr.startsWith("do.")) tryBlockStr = tryBlockStr.substring(3).trim();
                }

                return {
                    type: "TryStatement",
                    block: this.parseBlock(tryBlockStr),
                    handler: catchParam || catchBlockStr
                        ? {
                              type: "CatchClause",
                              param: catchParam ? (this.parsePattern(catchParam) as any) : null,
                              body: this.parseBlock(catchBlockStr),
                          }
                        : null,
                    finalizer: finallyBlockStr ? this.parseBlock(finallyBlockStr) : null,
                };
            }
        }

        // If / Elseif / Else Statement
        if (stmt.startsWith("if.")) {
            return this.parseIfStatement(stmt);
        }

        // Switch / Select: select. disc case. val do. ... else. do. ... end.
        if (stmt.startsWith("select.")) {
            const lines = splitCodonStatements(stmt);
            if (stmt.endsWith("end.")) {
                const firstNl = stmt.indexOf("\n");
                const discStr = stmt.substring("select.".length, firstNl).trim();
                const innerCases = stmt.substring(firstNl + 1, stmt.length - 4).trim();
                const caseBlocks = splitCodonStatements(innerCases);
                const cases: SwitchCase[] = [];
                for (const cb of caseBlocks) {
                    if (cb.startsWith("case.")) {
                        const doIdx = cb.indexOf(" do.");
                        if (doIdx !== -1) {
                            const valStr = cb.substring("case.".length, doIdx).trim();
                            const cBody = cb.substring(doIdx + 4).trim();
                            cases.push({
                                type: "SwitchCase",
                                test: this.parseExpression(valStr),
                                consequent: this.parseBlock(cBody).body,
                            });
                        }
                    } else if (cb.startsWith("else.")) {
                        let cBody = cb.substring(5).trim();
                        if (cBody.startsWith("do.")) cBody = cBody.substring(3).trim();
                        cases.push({
                            type: "SwitchCase",
                            test: null,
                            consequent: this.parseBlock(cBody).body,
                        });
                    }
                }
                return { type: "SwitchStatement", discriminant: this.parseExpression(discStr), cases };
            }
        }

        // Throw Statement: throw. expr
        if (stmt.startsWith("throw.")) {
            return {
                type: "ThrowStatement",
                argument: this.parseExpression(stmt.slice(6).trim()),
            };
        }

        // Return Statement: return. [expr]
        if (stmt.startsWith("return.")) {
            const argStr = stmt.slice(7).trim();
            return {
                type: "ReturnStatement",
                argument: argStr ? this.parseExpression(argStr) : null,
            };
        }

        // Break & Continue
        if (stmt === "break.") return { type: "BreakStatement" };
        if (stmt === "continue.") return { type: "ContinueStatement" };

        // Destructuring / Variable Assignment: pattern =: expr or pattern =. expr or pattern = expr
        // Crucial: Only match unparenthesized declarations at depth 0 (outside {}, [], ())!
        if (!stmt.startsWith("(") && !stmt.startsWith("{{") && !stmt.startsWith("class.")) {
            let depth = 0;
            let braceDepth = 0;
            let bracketDepth = 0;
            let inStr = false;
            let inTpl = false;
            let assignIdx = -1;
            let assignOpLen = 0;

            for (let i = 0; i < stmt.length; i++) {
                const char = stmt[i];
                if (char === "'" && !inTpl) { inStr = !inStr; continue; }
                if (char === "`" && !inStr) { inTpl = !inTpl; continue; }
                if (inStr || inTpl) continue;

                if (char === "(") depth++;
                else if (char === ")") depth = Math.max(0, depth - 1);
                else if (char === "{") braceDepth++;
                else if (char === "}") braceDepth = Math.max(0, braceDepth - 1);
                else if (char === "[") bracketDepth++;
                else if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);

                if (depth === 0 && braceDepth === 0 && bracketDepth === 0) {
                    if (stmt.startsWith("=:", i) || stmt.startsWith("=.", i)) {
                        assignIdx = i;
                        assignOpLen = 2;
                        break;
                    }
                    if (char === "=") {
                        if (i > 0 && (stmt[i - 1] === "=" || stmt[i - 1] === "!" || stmt[i - 1] === "<" || stmt[i - 1] === ">")) continue;
                        if (stmt[i + 1] === "=" || stmt[i + 1] === ":" || stmt[i + 1] === ".") continue;
                        assignIdx = i;
                        assignOpLen = 1;
                        break;
                    }
                }
            }

            if (assignIdx !== -1) {
                const leftStr = stmt.substring(0, assignIdx).trim();
                const rightStr = stmt.substring(assignIdx + assignOpLen).trim();
                const patternNode = this.parsePattern(leftStr);
                return {
                    type: "VariableDeclaration",
                    kind: "const",
                    declarations: [
                        {
                            type: "VariableDeclarator",
                            id: patternNode,
                            init: this.parseExpression(rightStr),
                        },
                    ],
                };
            }
        }

        const expr = this.parseExpression(stmt);
        if (expr.type === "FunctionDeclaration") return expr;
        return { type: "ExpressionStatement", expression: expr };
    }

    private parseIfStatement(stmt: string): IfStatement {
        const doIdx = stmt.indexOf(" do.");
        if (doIdx === -1) throw new Error(`Invalid if statement syntax: ${stmt}`);

        const testStr = stmt.substring("if.".length, doIdx).trim();
        let rest = stmt.substring(doIdx + 4).trim();
        if (rest.endsWith("end.")) rest = rest.slice(0, -4).trim();

        // Find matching else. or elseif. at depth 0
        let depth = 0;
        let inStr = false;
        let inTpl = false;

        for (let i = 0; i < rest.length; i++) {
            if (rest[i] === "'" && !inTpl) inStr = !inStr;
            if (rest[i] === "`" && !inStr) inTpl = !inTpl;
            if (inStr || inTpl) continue;

            if (rest.startsWith("if.", i) || rest.startsWith("class.", i) || rest.startsWith("for.", i) || rest.startsWith("for_of.", i) || rest.startsWith("while.", i) || rest.startsWith("try.", i)) {
                depth++;
            }
            if (rest.startsWith("end.", i)) {
                depth--;
            }
            if (depth === 0) {
                if (rest.startsWith("elseif.", i)) {
                    const consStr = rest.substring(0, i).trim();
                    const altStr = "if." + rest.substring(i + 7).trim() + "\nend.";
                    return {
                        type: "IfStatement",
                        test: this.parseExpression(testStr),
                        consequent: this.parseBlock(consStr),
                        alternate: this.parseIfStatement(altStr),
                    };
                }
                if (rest.startsWith("else if.", i)) {
                    const consStr = rest.substring(0, i).trim();
                    const altStr = "if." + rest.substring(i + 8).trim() + "\nend.";
                    return {
                        type: "IfStatement",
                        test: this.parseExpression(testStr),
                        consequent: this.parseBlock(consStr),
                        alternate: this.parseIfStatement(altStr),
                    };
                }
                if (rest.startsWith("else.", i)) {
                    const consStr = rest.substring(0, i).trim();
                    const altStr = rest.substring(i + 5).trim();
                    return {
                        type: "IfStatement",
                        test: this.parseExpression(testStr),
                        consequent: this.parseBlock(consStr),
                        alternate: this.parseBlock(altStr),
                    };
                }
            }
        }

        return {
            type: "IfStatement",
            test: this.parseExpression(testStr),
            consequent: this.parseBlock(rest),
            alternate: null,
        };
    }

    private parseClassBody(bodyStr: string): ClassBody {
        const statements = splitCodonStatements(bodyStr);
        const body: (MethodDefinition | PropertyDefinition)[] = [];

        for (const s of statements) {
            const trimmed = s.trim();
            if (!trimmed) continue;

            // Constructor: constructor. params do. ... end.
            if (trimmed.startsWith("constructor.")) {
                const doIdx = trimmed.indexOf(" do.");
                if (doIdx !== -1 && trimmed.endsWith("end.")) {
                    const paramsStr = trimmed.substring("constructor.".length, doIdx).trim();
                    const mBody = trimmed.substring(doIdx + 4, trimmed.length - 4).trim();
                    body.push({
                        type: "MethodDefinition",
                        key: { type: "Identifier", name: "constructor" },
                        value: {
                            type: "FunctionExpression",
                            id: null,
                            params: this.parseParamList(paramsStr),
                            body: this.parseBlock(mBody),
                        },
                        kind: "constructor",
                        computed: false,
                        static: false,
                    });
                    continue;
                }
            }

            // Getter: get. name do. ... end.
            if (trimmed.startsWith("get.")) {
                const doIdx = trimmed.indexOf(" do.");
                if (doIdx !== -1 && trimmed.endsWith("end.")) {
                    const keyName = trimmed.substring("get.".length, doIdx).trim();
                    const mBody = trimmed.substring(doIdx + 4, trimmed.length - 4).trim();
                    body.push({
                        type: "MethodDefinition",
                        key: { type: "Identifier", name: keyName },
                        value: {
                            type: "FunctionExpression",
                            id: null,
                            params: [],
                            body: this.parseBlock(mBody),
                        },
                        kind: "get",
                        computed: false,
                        static: false,
                    });
                    continue;
                }
            }

            // Setter: set. name param do. ... end.
            if (trimmed.startsWith("set.")) {
                const doIdx = trimmed.indexOf(" do.");
                if (doIdx !== -1 && trimmed.endsWith("end.")) {
                    const header = trimmed.substring("set.".length, doIdx).trim();
                    const spaceIdx = header.indexOf(" ");
                    const keyName = spaceIdx !== -1 ? header.substring(0, spaceIdx).trim() : header;
                    const paramsStr = spaceIdx !== -1 ? header.substring(spaceIdx + 1).trim() : "";
                    const mBody = trimmed.substring(doIdx + 4, trimmed.length - 4).trim();
                    body.push({
                        type: "MethodDefinition",
                        key: { type: "Identifier", name: keyName },
                        value: {
                            type: "FunctionExpression",
                            id: null,
                            params: this.parseParamList(paramsStr),
                            body: this.parseBlock(mBody),
                        },
                        kind: "set",
                        computed: false,
                        static: false,
                    });
                    continue;
                }
            }

            // Method / AsyncMethod: [async_]method. name params do. ... end.
            const isAsyncMethod = trimmed.startsWith("async_method.");
            const isMethod = trimmed.startsWith("method.");
            if (isAsyncMethod || isMethod) {
                const prefix = isAsyncMethod ? "async_method." : "method.";
                const doIdx = trimmed.indexOf(" do.");
                if (doIdx !== -1 && trimmed.endsWith("end.")) {
                    const header = trimmed.substring(prefix.length, doIdx).trim();
                    const spaceIdx = header.indexOf(" ");
                    const keyName = spaceIdx !== -1 ? header.substring(0, spaceIdx).trim() : header;
                    const paramsStr = spaceIdx !== -1 ? header.substring(spaceIdx + 1).trim() : "";
                    const mBody = trimmed.substring(doIdx + 4, trimmed.length - 4).trim();
                    body.push({
                        type: "MethodDefinition",
                        key: { type: "Identifier", name: keyName },
                        value: {
                            type: "FunctionExpression",
                            id: null,
                            params: this.parseParamList(paramsStr),
                            body: this.parseBlock(mBody),
                            async: isAsyncMethod,
                        },
                        kind: "method",
                        computed: false,
                        static: false,
                    });
                    continue;
                }
            }

            // Property: [static] key =: init or key = init
            const propMatch = trimmed.match(/^(static\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:=:|=\.|=(?!=))\s*([\s\S]*)$/);
            if (propMatch) {
                body.push({
                    type: "PropertyDefinition",
                    key: { type: "Identifier", name: propMatch[2] },
                    value: this.parseExpression(propMatch[3].trim()),
                    computed: false,
                    static: Boolean(propMatch[1]),
                });
                continue;
            }
        }

        return { type: "ClassBody", body };
    }

    public parsePattern(patStr: string): Node {
        patStr = patStr.trim();
        if (!patStr) return { type: "Identifier", name: "___empty___" };

        if (patStr.startsWith("{") && patStr.endsWith("}")) {
            const inner = patStr.slice(1, -1).trim();
            const parts = splitAtLevel(inner, ",");
            const properties = parts.map((part) => {
                if (part.startsWith("...")) {
                    return {
                        type: "RestElement" as const,
                        argument: { type: "Identifier" as const, name: part.slice(3).trim() },
                    };
                }
                if (part.includes("=")) {
                    const eqIdx = part.indexOf("=");
                    const left = part.substring(0, eqIdx).trim();
                    const right = part.substring(eqIdx + 1).trim();
                    return {
                        type: "Property" as const,
                        key: { type: "Identifier" as const, name: left },
                        value: {
                            type: "AssignmentPattern" as const,
                            left: { type: "Identifier" as const, name: left },
                            right: this.parseExpression(right),
                        },
                        kind: "init" as const,
                        computed: false,
                        shorthand: true,
                    };
                }
                if (part.includes(":")) {
                    const colonIdx = part.indexOf(":");
                    const k = part.substring(0, colonIdx).trim();
                    const v = part.substring(colonIdx + 1).trim();
                    return {
                        type: "Property" as const,
                        key: { type: "Identifier" as const, name: k },
                        value: this.parsePattern(v),
                        kind: "init" as const,
                        computed: false,
                    };
                }
                return {
                    type: "Property" as const,
                    key: { type: "Identifier" as const, name: part.trim() },
                    value: { type: "Identifier" as const, name: part.trim() },
                    kind: "init" as const,
                    computed: false,
                    shorthand: true,
                };
            });
            return { type: "ObjectPattern", properties };
        }

        if (patStr.startsWith("[") && patStr.endsWith("]")) {
            const inner = patStr.slice(1, -1).trim();
            const parts = splitAtLevel(inner, ",");
            const elements = parts.map((part) => {
                const p = part.trim();
                if (!p) return null;
                if (p.startsWith("...")) {
                    return {
                        type: "RestElement" as const,
                        argument: { type: "Identifier" as const, name: p.slice(3).trim() },
                    };
                }
                if (p.includes("=")) {
                    const eqIdx = p.indexOf("=");
                    const left = p.substring(0, eqIdx).trim();
                    const right = p.substring(eqIdx + 1).trim();
                    return {
                        type: "AssignmentPattern" as const,
                        left: { type: "Identifier" as const, name: left },
                        right: this.parseExpression(right),
                    };
                }
                return this.parsePattern(p);
            });
            return { type: "ArrayPattern", elements };
        }

        if (patStr.startsWith("...")) {
            return {
                type: "RestElement",
                argument: { type: "Identifier", name: patStr.slice(3).trim() },
            };
        }

        if (patStr.includes("=")) {
            const eqIdx = patStr.indexOf("=");
            const left = patStr.substring(0, eqIdx).trim();
            const right = patStr.substring(eqIdx + 1).trim();
            return {
                type: "AssignmentPattern",
                left: { type: "Identifier", name: left },
                right: this.parseExpression(right),
            };
        }

        return { type: "Identifier", name: patStr };
    }

    private parseParamList(paramsStr: string): Node[] {
        if (!paramsStr.trim()) return [];
        return splitAtLevel(paramsStr, ",").map((p) => this.parsePattern(p));
    }

    private parseNumericVector(str: string): Node | null {
        const trimmed = str.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("'") || trimmed.startsWith('"') || trimmed.startsWith("`") || trimmed.startsWith("{{")) return null;

        const tokens = trimmed.split(/\s+/);
        if (tokens.length < 2) return null;

        const jNumRegex = /^(_|__|[_-]?\d+(\.\d+)?([eE][+-]?\d+)?)$/;
        for (const t of tokens) {
            if (!jNumRegex.test(t)) return null;
        }

        const elements = tokens.map((t) => {
            let val: number;
            if (t === "_") val = Infinity;
            else if (t === "__") val = -Infinity;
            else if (t.startsWith("_")) val = Number("-" + t.slice(1));
            else val = Number(t);
            return { type: "Literal" as const, value: val };
        });

        return {
            type: "ArrayExpression",
            elements,
        };
    }

    private parseBinaryOrAssignment(str: string): Node | null {
        // Tiers from lowest precedence (splits first, forms AST root) to highest precedence:
        // Tier 0: Assignment: = (right-associative: pick leftmost)
        // Tier 1: Logical OR / Coalescing: ||, ?? (left-associative: pick rightmost)
        // Tier 2: Logical AND: && (left-associative: pick rightmost)
        // Tier 3: Equality: ===, !==, ==, != (left-associative: pick rightmost)
        // Tier 4: Relational: <=, >=, <, > (left-associative: pick rightmost)
        // Tier 5: Codon Arithmetic Verbs: +, -, *, /, %, | (strictly right-to-left evaluation: pick leftmost!)

        const tiers = [
            { ops: ["="], rightAssoc: true },
            { ops: ["||", "??"], rightAssoc: false },
            { ops: ["&&"], rightAssoc: false },
            { ops: ["===", "!==", "==", "!="], rightAssoc: false },
            { ops: ["<=", ">=", "<", ">"], rightAssoc: false },
            { ops: ["+", "-", "*", "/", "%", "|"], rightAssoc: true },
        ];

        for (const tier of tiers) {
            let depth = 0;
            let inStr = false;
            let inTpl = false;
            let matchIdx = -1;
            let matchedOp = "";

            for (let i = 0; i < str.length; i++) {
                if (str[i] === "'" && !inTpl) inStr = !inStr;
                if (str[i] === "`" && !inStr) inTpl = !inTpl;
                if (inStr || inTpl) continue;

                if (str[i] === "(" || str[i] === "[" || str[i] === "{") depth++;
                if (str[i] === ")" || str[i] === "]" || str[i] === "}") depth--;

                if (depth === 0) {
                    for (const op of tier.ops) {
                        if (str.startsWith(op, i)) {
                            // A binary operator cannot have an empty left operand
                            if (str.substring(0, i).trim().length === 0) continue;
                            // An operator immediately followed by Codon adverb / or \ is a fold/scan
                            if (str[i + op.length] === "/" || str[i + op.length] === "\\") continue;
                            // Boundary checks: do not match inside larger operators or Codon adverbs
                            if (op === "=") {
                                if (i > 0 && (str[i - 1] === "=" || str[i - 1] === "!" || str[i - 1] === "<" || str[i - 1] === ">")) continue;
                                if (str[i + 1] === "=" || str[i + 1] === ":" || str[i + 1] === ".") continue;
                            }
                            if (op === "==") {
                                if (i > 0 && (str[i - 1] === "=" || str[i - 1] === "!")) continue;
                                if (str[i + 2] === "=") continue;
                            }
                            if (op === "!=") {
                                if (str[i + 2] === "=") continue;
                            }
                            if (op === "<" || op === ">") {
                                if (str[i + 1] === "=") continue;
                            }
                            if (op === "/") {
                                if (i > 0 && ["+", "*", "<", ">", "-", "%", "|", "."].includes(str[i - 1])) continue;
                                if (str[i + 1] === "/" || str[i + 1] === ".") continue;
                            }

                            // For right-associative (Tier 0 '=' and Tier 5 Codon verbs): pick FIRST occurrence
                            if (tier.rightAssoc) {
                                if (matchIdx === -1) {
                                    matchIdx = i;
                                    matchedOp = op;
                                }
                            } else {
                                // For left-associative: pick LAST occurrence
                                matchIdx = i;
                                matchedOp = op;
                            }
                        }
                    }
                }
            }

            if (matchIdx !== -1) {
                const leftStr = str.substring(0, matchIdx).trim();
                const rightStr = str.substring(matchIdx + matchedOp.length).trim();

                if (matchedOp === "=") {
                    return {
                        type: "AssignmentExpression",
                        operator: "=",
                        left: this.parseExpression(leftStr),
                        right: this.parseExpression(rightStr),
                    };
                } else if (["&&", "||", "??"].includes(matchedOp)) {
                    return {
                        type: "LogicalExpression",
                        operator: matchedOp,
                        left: this.parseExpression(leftStr),
                        right: this.parseExpression(rightStr),
                    };
                } else {
                    // Map Codon primitive verbs to JS operators:
                    // In Codon, % is division (/ in JS)
                    // In Codon, | is residue/modulo (% in JS)
                    let jsOp = matchedOp;
                    if (matchedOp === "%") jsOp = "/";
                    else if (matchedOp === "|") jsOp = "%";

                    return {
                        type: "BinaryExpression",
                        operator: jsOp,
                        left: this.parseExpression(leftStr),
                        right: this.parseExpression(rightStr),
                    };
                }
            }
        }

        return null;
    }

    public parseExpression(expr: string): Node {
        expr = expr.trim();
        let strippedExpr = expr;
        let wasWrapped = false;

        if (isFullyWrapped(strippedExpr)) {
            strippedExpr = strippedExpr.slice(1, -1).trim();
            wasWrapped = true;
        }

        // Update Expression: (++x), (--x), (x++), (x--)
        if (wasWrapped) {
            if (strippedExpr.endsWith("++")) {
                return {
                    type: "UpdateExpression",
                    operator: "++",
                    argument: this.parseExpression(strippedExpr.slice(0, -2).trim()),
                    prefix: false,
                };
            }
            if (strippedExpr.endsWith("--")) {
                return {
                    type: "UpdateExpression",
                    operator: "--",
                    argument: this.parseExpression(strippedExpr.slice(0, -2).trim()),
                    prefix: false,
                };
            }
            if (strippedExpr.startsWith("++")) {
                return {
                    type: "UpdateExpression",
                    operator: "++",
                    argument: this.parseExpression(strippedExpr.slice(2).trim()),
                    prefix: true,
                };
            }
            if (strippedExpr.startsWith("--")) {
                return {
                    type: "UpdateExpression",
                    operator: "--",
                    argument: this.parseExpression(strippedExpr.slice(2).trim()),
                    prefix: true,
                };
            }
        }

        // JSX Element check BEFORE binary/operators
        if (strippedExpr.startsWith("<") && strippedExpr.endsWith(">")) {
            try {
                const babelParser = require("@babel/parser");
                return babelParser.parseExpression(strippedExpr, { plugins: ["jsx"] });
            } catch {
                // fall through
            }
        }

        // Conditional / Ternary Expression: (test ? cons : alt)
        if (wasWrapped && strippedExpr.includes("?") && strippedExpr.includes(":")) {
            const qParts = splitAtLevel(strippedExpr, "?");
            if (qParts.length === 2) {
                const colonParts = splitAtLevel(qParts[1], ":");
                if (colonParts.length === 2) {
                    return {
                        type: "ConditionalExpression",
                        test: this.parseExpression(qParts[0]),
                        consequent: this.parseExpression(colonParts[0]),
                        alternate: this.parseExpression(colonParts[1]),
                    };
                }
            }
        }

        // Codon Numeric Vector: 1 2 3 4 5 or _1 2 3
        const vecNode = this.parseNumericVector(strippedExpr);
        if (vecNode) return vecNode;

        // Single Codon numbers with negative sign _ or infinity
        if (strippedExpr === "_") {
            return { type: "Identifier", name: "Infinity" };
        }
        if (strippedExpr === "__") {
            return {
                type: "UnaryExpression",
                operator: "-",
                argument: { type: "Identifier", name: "Infinity" },
                prefix: true,
            };
        }
        if (/^_\d+(\.\d+)?([eE][+-]?\d+)?$/.test(strippedExpr)) {
            return { type: "Literal", value: Number("-" + strippedExpr.slice(1)) };
        }

        // Binary or Assignment Expression
        const binNode = this.parseBinaryOrAssignment(strippedExpr);
        if (binNode) return binNode;

        // Monadic Codon verbs: #, %, %:, |, +/, */
        if (strippedExpr === "#") return { type: "Identifier", name: "tally" };
        if (strippedExpr === "+/") return { type: "Identifier", name: "sum" };
        if (strippedExpr === "*/") return { type: "Identifier", name: "product" };
        if (strippedExpr === "%") return { type: "Identifier", name: "div" };

        if (strippedExpr.startsWith("#") && strippedExpr.length > 1) {
            const innerArg = strippedExpr.slice(1).trim();
            return {
                type: "MemberExpression",
                object: this.parseExpression(innerArg),
                property: { type: "Identifier", name: "length" },
                computed: false,
            };
        }

        if (strippedExpr.startsWith("%:")) {
            const innerArg = strippedExpr.slice(2).trim();
            return {
                type: "CallExpression",
                callee: {
                    type: "MemberExpression",
                    object: { type: "Identifier", name: "Math" },
                    property: { type: "Identifier", name: "sqrt" },
                    computed: false,
                },
                arguments: innerArg ? [this.parseExpression(innerArg)] : [],
            };
        }

        if (strippedExpr.startsWith("% ") || (strippedExpr.startsWith("%") && strippedExpr.length > 1 && !strippedExpr.startsWith("%:"))) {
            const innerArg = strippedExpr.slice(1).trim();
            return {
                type: "BinaryExpression",
                operator: "/",
                left: { type: "Literal", value: 1 },
                right: this.parseExpression(innerArg),
            };
        }

        if (strippedExpr.startsWith("| ") || (strippedExpr.startsWith("|") && strippedExpr.length > 1 && !strippedExpr.startsWith("||"))) {
            const innerArg = strippedExpr.slice(1).trim();
            return {
                type: "CallExpression",
                callee: {
                    type: "MemberExpression",
                    object: { type: "Identifier", name: "Math" },
                    property: { type: "Identifier", name: "abs" },
                    computed: false,
                },
                arguments: innerArg ? [this.parseExpression(innerArg)] : [],
            };
        }

        // Await Expression: (await expr)
        if (wasWrapped && strippedExpr.startsWith("await ")) {
            return {
                type: "AwaitExpression",
                argument: this.parseExpression(strippedExpr.slice(6).trim()),
            };
        }

        // Unary Expression: (!expr), (-expr), (+expr), (typeof expr)
        if (wasWrapped) {
            const unaryPrefixes = ["!", "-", "+", "~", "typeof ", "delete ", "void "];
            for (const prefix of unaryPrefixes) {
                if (strippedExpr.startsWith(prefix)) {
                    return {
                        type: "UnaryExpression",
                        operator: prefix.trim(),
                        argument: this.parseExpression(strippedExpr.slice(prefix.length).trim()),
                        prefix: true,
                    };
                }
            }
        }

        // Direct Definition: {{ ... }}
        if (strippedExpr.startsWith("{{") && strippedExpr.endsWith("}}")) {
            const inner = strippedExpr.slice(2, -2).trim();
            const nlIdx = inner.indexOf("\n");
            const firstLine = nlIdx !== -1 ? inner.substring(0, nlIdx).trim() : inner;
            const bodyStr = nlIdx !== -1 ? inner.substring(nlIdx + 1).trim() : "";

            const isAsync = firstLine.includes("async ");

            if (firstLine.includes("FD|")) {
                const parts = firstLine.split("FD|")[1].trim().split("|");
                return {
                    type: "FunctionDeclaration",
                    id: { type: "Identifier", name: parts[0] },
                    params: parts[1] ? this.parseParamList(parts[1]) : [],
                    body: this.parseBlock(bodyStr),
                    async: isAsync,
                };
            }
            if (firstLine.includes("FE|")) {
                const paramsStr = firstLine.split("FE|")[1].trim();
                return {
                    type: "FunctionExpression",
                    id: null,
                    params: paramsStr ? this.parseParamList(paramsStr) : [],
                    body: this.parseBlock(bodyStr),
                    async: isAsync,
                };
            }
            if (firstLine.includes("pB|")) {
                const paramsStr = firstLine.split("pB|")[1].trim();
                return {
                    type: "ArrowFunctionExpression",
                    params: paramsStr ? this.parseParamList(paramsStr) : [],
                    body: this.parseBlock(bodyStr),
                    async: isAsync,
                };
            }
            if (firstLine.includes("pE|")) {
                const paramsStr = firstLine.split("pE|")[1].trim();
                return {
                    type: "ArrowFunctionExpression",
                    params: paramsStr ? this.parseParamList(paramsStr) : [],
                    body: this.parseExpression(bodyStr),
                    async: isAsync,
                };
            }
            if (firstLine.includes("method|")) {
                const paramsStr = firstLine.split("method|")[1].trim();
                return {
                    type: "FunctionExpression",
                    id: null,
                    params: paramsStr ? this.parseParamList(paramsStr) : [],
                    body: this.parseBlock(bodyStr),
                    async: isAsync,
                };
            }

            return {
                type: "FunctionExpression",
                id: null,
                params: [{ type: "Identifier", name: "y" }, { type: "Identifier", name: "x" }],
                body: this.parseBlock(inner),
            };
        }

        // Object Expression: O(...) or O''
        if (/^O[ (]/.test(strippedExpr) || strippedExpr === "O''") {
            if (strippedExpr === "O''") return { type: "ObjectExpression", properties: [] };
            let strippedO = strippedExpr.startsWith("O(")
                ? strippedExpr.substring(1).trim()
                : strippedExpr.substring(2).trim();
            if (isFullyWrapped(strippedO)) strippedO = strippedO.slice(1, -1);

            const parts = splitAtLevel(strippedO, ";");
            const properties: any[] = [];
            for (let i = 0; i < parts.length; i += 2) {
                const keyPart = parts[i].trim();
                if (keyPart === "'...'" || keyPart === "...") {
                    properties.push({
                        type: "SpreadElement",
                        argument: this.parseExpression(parts[i + 1]),
                    });
                    continue;
                }
                const keyNode = this.parseExpression(keyPart);
                const keyName = keyNode.type === "Literal" ? String(keyNode.value) : (keyNode as Identifier).name;
                const valNode = i + 1 < parts.length ? this.parseExpression(parts[i + 1]) : { type: "Identifier", name: keyName };
                const isMethod = valNode.type === "FunctionExpression" || (valNode as any).type === "ObjectMethod";
                properties.push({
                    type: "Property",
                    key: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(keyName)
                        ? { type: "Identifier", name: keyName }
                        : { type: "Literal", value: keyName },
                    value: valNode,
                    kind: "init",
                    computed: false,
                    method: isMethod,
                });
            }
            return { type: "ObjectExpression", properties };
        }

        // Codon Rank Operator: (verb) "0 target at depth 0
        const rankParts = splitAtLevel(strippedExpr, '"0');
        if (rankParts.length === 2 && rankParts[0].startsWith("(") && rankParts[0].endsWith(")")) {
            const verbNode = this.parseExpression(rankParts[0].slice(1, -1).trim());
            const targetNode = this.parseExpression(rankParts[1].trim());
            return {
                type: "CallExpression",
                callee: {
                    type: "MemberExpression",
                    object: targetNode,
                    property: { type: "Identifier", name: "map" },
                    computed: false,
                },
                arguments: [verbNode],
            };
        }

        // Codon Fold / Reduction: +/ arr, */ arr
        const foldMatch = strippedExpr.match(/^([+*<>|%a-zA-Z0-9_.]+)\/\s+([\s\S]*)$/);
        if (foldMatch) {
            const verbStr = foldMatch[1];
            const targetNode = this.parseExpression(foldMatch[2]);
            if (verbStr === "+") {
                if (targetNode.type === "BinaryExpression" && targetNode.operator === "/") {
                    return {
                        type: "BinaryExpression",
                        operator: "/",
                        left: {
                            type: "CallExpression",
                            callee: { type: "Identifier", name: "sum" },
                            arguments: [targetNode.left],
                        },
                        right: targetNode.right,
                    };
                }
                return {
                    type: "CallExpression",
                    callee: { type: "Identifier", name: "sum" },
                    arguments: [targetNode],
                };
            }
            if (verbStr === "*") {
                return {
                    type: "CallExpression",
                    callee: { type: "Identifier", name: "product" },
                    arguments: [targetNode],
                };
            }
            return {
                type: "CodonFoldExpression",
                verb: { type: "Identifier", name: verbStr },
                target: targetNode,
                scan: false,
            };
        }

        // Codon Scan: +\ arr
        const scanMatch = strippedExpr.match(/^([+*<>|%a-zA-Z0-9_.]+)\\\s+([\s\S]*)$/);
        if (scanMatch) {
            return {
                type: "CodonFoldExpression",
                verb: { type: "Identifier", name: scanMatch[1] },
                target: this.parseExpression(scanMatch[2]),
                scan: true,
            };
        }

        // Function Calls, New, or Codon Verb Trains (Forks & Hooks)
        if (wasWrapped) {
            const spaceParts = splitAtLevel(strippedExpr, " ");
            if (spaceParts.length > 1) {
                if (spaceParts[0] === "new") {
                    return {
                        type: "NewExpression",
                        callee: this.parseExpression(spaceParts[1]),
                        arguments: spaceParts.slice(2).map((a) => this.parseExpression(a)),
                    };
                }

                if (spaceParts[0] === "fork" && spaceParts.length === 4) {
                    return {
                        type: "CodonTrainExpression",
                        kind: "fork",
                        verbs: spaceParts.slice(1).map((p) => this.parseExpression(p)),
                    };
                }
                if (spaceParts[0] === "hook" && spaceParts.length === 3) {
                    return {
                        type: "CodonTrainExpression",
                        kind: "hook",
                        verbs: spaceParts.slice(1).map((p) => this.parseExpression(p)),
                    };
                }

                // Known Codon verbs for tacit trains
                const codonVerbs = new Set([
                    "+", "-", "*", "%", "^", "|", "<", ">", "=", "~:",
                    "{.", "}.", "{:", ":}", ",", ";,", "#", "$", "i.",
                    "|:", "/:", "\\:", "+/", "*/", "+./", "*./", ">./", "<./"
                ]);

                // Fork check: 3 verbs where none are string/object literals or member calls
                const isFork = spaceParts.length === 3 &&
                    (codonVerbs.has(spaceParts[1]) || (codonVerbs.has(spaceParts[0]) && codonVerbs.has(spaceParts[2]))) &&
                    !spaceParts[0].includes(".") &&
                    !spaceParts[1].startsWith("'") &&
                    !spaceParts[2].startsWith("'");

                if (isFork) {
                    return {
                        type: "CodonTrainExpression",
                        kind: "fork",
                        verbs: spaceParts.map((p) => this.parseExpression(p)),
                    };
                }

                // Hook check: 2 verbs
                const isHook = spaceParts.length === 2 &&
                    codonVerbs.has(spaceParts[0]) &&
                    codonVerbs.has(spaceParts[1]);

                if (isHook) {
                    return {
                        type: "CodonTrainExpression",
                        kind: "hook",
                        verbs: spaceParts.map((p) => this.parseExpression(p)),
                    };
                }

                // Otherwise: Function / Method Call
                const calleePart = spaceParts[0];
                const isOptCall = calleePart.endsWith("?.");
                const calleeNode = this.parseExpression(isOptCall ? calleePart.slice(0, -2) : calleePart);
                return {
                    type: "CallExpression",
                    callee: calleeNode,
                    arguments: spaceParts.slice(1).map((a) => this.parseExpression(a)),
                    optional: isOptCall,
                };
            }
        }

        // Array Expression: (0$0), (,x), (a;b;c)
        if (strippedExpr === "0$0") return { type: "ArrayExpression", elements: [] };
        if (strippedExpr.startsWith(",") && wasWrapped) {
            return {
                type: "ArrayExpression",
                elements: [this.parseExpression(strippedExpr.slice(1).trim())],
            };
        }
        const semiParts = splitAtLevel(strippedExpr, ";");
        if (semiParts.length > 1) {
            const elements = semiParts.map((part) => {
                const p = part.trim();
                if (p.startsWith("...")) {
                    return {
                        type: "SpreadElement" as const,
                        argument: this.parseExpression(p.slice(3).trim()),
                    };
                }
                return this.parseExpression(p);
            });
            return { type: "ArrayExpression", elements };
        }

        // 0-argument calls: callee() or callee?.()
        if (strippedExpr.endsWith("()")) {
            const calleeStr = strippedExpr.slice(0, -2);
            if (calleeStr.endsWith("?.")) {
                return {
                    type: "CallExpression",
                    callee: this.parseExpression(calleeStr.slice(0, -2)),
                    arguments: [],
                    optional: true,
                };
            }
            return {
                type: "CallExpression",
                callee: this.parseExpression(calleeStr),
                arguments: [],
            };
        }

        // Literals & Keywords
        if (strippedExpr === "true" || strippedExpr === "false") {
            return { type: "Literal", value: strippedExpr === "true" };
        }
        if (strippedExpr === "null" || strippedExpr === "undefined") {
            return { type: "Identifier", name: strippedExpr };
        }
        if (strippedExpr === "this") return { type: "ThisExpression" };
        if (strippedExpr === "super") return { type: "Super" };

        // Template Literals: `...`
        if (strippedExpr.startsWith("`") && strippedExpr.endsWith("`")) {
            return this.parseTemplateLiteral(strippedExpr);
        }

        // String Literals: '...' or "..."
        if (strippedExpr.startsWith('"') && strippedExpr.endsWith('"')) {
            try {
                return { type: "Literal", value: JSON.parse(strippedExpr) };
            } catch {
                return { type: "Literal", value: strippedExpr.slice(1, -1) };
            }
        }
        if (strippedExpr.startsWith("'") && strippedExpr.endsWith("'")) {
            return {
                type: "Literal",
                value: strippedExpr.slice(1, -1).replace(/''/g, "'"),
            };
        }

        // Number Literals
        if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(strippedExpr)) {
            return { type: "Literal", value: Number(strippedExpr) };
        }

        // Member Expression: optional chaining ?. and computed .[prop]
        if (strippedExpr.includes("?.")) {
            const optParts = splitAtLevel(strippedExpr, "?.");
            if (optParts.length > 1) {
                let node: Node = this.parseExpression(optParts[0]);
                for (let i = 1; i < optParts.length; i++) {
                    const seg = optParts[i].trim();
                    if (seg.startsWith("[") && seg.endsWith("]")) {
                        node = {
                            type: "MemberExpression",
                            object: node,
                            property: this.parseExpression(seg.slice(1, -1).trim()),
                            computed: true,
                            optional: true,
                        };
                    } else {
                        node = {
                            type: "MemberExpression",
                            object: node,
                            property: { type: "Identifier", name: seg },
                            computed: false,
                            optional: true,
                        };
                    }
                }
                return node;
            }
        }

        // Computed Member Expression: obj.[prop]
        const compDotMatch = strippedExpr.match(/^([\s\S]+?)\.\[([\s\S]+)\]$/);
        if (compDotMatch) {
            return {
                type: "MemberExpression",
                object: this.parseExpression(compDotMatch[1]),
                property: this.parseExpression(compDotMatch[2]),
                computed: true,
            };
        }

        // Standard Member Expression: obj.prop
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

        // JSX Element
        if (strippedExpr.startsWith("<") && strippedExpr.endsWith(">")) {
            return this.parseJSXElement(strippedExpr);
        }

        return { type: "Identifier", name: strippedExpr };
    }

    private parseTemplateLiteral(contentStr: string): Node {
        const content = contentStr.slice(1, -1);
        const quasis: any[] = [];
        const expressions: Node[] = [];
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
                expressions.push(this.parseExpression(content.substring(i + 2, j - 1)));
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

    private parseJSXElement(jsxStr: string): JSXElement {
        const tagMatch = jsxStr.match(/^<([a-zA-Z0-9_$.]+)([\s\S]*?)(\/?>)([\s\S]*)$/);
        if (!tagMatch) {
            throw new Error(`Invalid JSX syntax: ${jsxStr}`);
        }

        const tagName = tagMatch[1];
        const rawAttrs = tagMatch[2].trim();
        const tagClosing = tagMatch[3];
        const remaining = tagMatch[4];

        const attributes = this.parseJSXAttributes(rawAttrs);

        if (tagClosing === "/>") {
            return {
                type: "JSXElement",
                openingElement: {
                    type: "JSXOpeningElement",
                    name: { type: "JSXIdentifier", name: tagName },
                    attributes,
                    selfClosing: true,
                },
                closingElement: null,
                children: [],
            };
        }

        const closeTag = `</${tagName}>`;
        const closeIdx = remaining.lastIndexOf(closeTag);
        const innerContent = closeIdx !== -1 ? remaining.substring(0, closeIdx) : remaining;

        const children = this.parseJSXChildren(innerContent);

        return {
            type: "JSXElement",
            openingElement: {
                type: "JSXOpeningElement",
                name: { type: "JSXIdentifier", name: tagName },
                attributes,
                selfClosing: false,
            },
            closingElement: {
                type: "JSXClosingElement",
                name: { type: "JSXIdentifier", name: tagName },
            },
            children,
        };
    }

    private parseJSXAttributes(attrsStr: string): JSXAttribute[] {
        if (!attrsStr) return [];
        const attrs: JSXAttribute[] = [];
        const regex = /([a-zA-Z0-9_$]+)(?:=(?:"([^"]*)"|'([^']*)'|{([\s\S]*?)}))?/g;
        let m;
        while ((m = regex.exec(attrsStr)) !== null) {
            const name = m[1];
            let value: any = null;
            if (m[2] !== undefined || m[3] !== undefined) {
                value = { type: "Literal", value: m[2] !== undefined ? m[2] : m[3] };
            } else if (m[4] !== undefined) {
                value = {
                    type: "JSXExpressionContainer",
                    expression: this.parseExpression(m[4]),
                };
            }
            attrs.push({
                type: "JSXAttribute",
                name: { type: "JSXIdentifier", name },
                value,
            });
        }
        return attrs;
    }

    private parseJSXChildren(innerStr: string): Node[] {
        const children: Node[] = [];
        let i = 0;
        let textBuf = "";

        while (i < innerStr.length) {
            if (innerStr[i] === "<") {
                if (textBuf.trim()) {
                    children.push({ type: "JSXText", value: textBuf });
                    textBuf = "";
                }
                let d = 1;
                let j = i + 1;
                while (j < innerStr.length && d > 0) {
                    if (innerStr[j] === "<") d++;
                    if (innerStr[j] === ">") d--;
                    j++;
                }
                const tag = innerStr.substring(i, j);
                children.push(this.parseJSXElement(tag));
                i = j;
                continue;
            } else if (innerStr[i] === "{") {
                if (textBuf.trim()) {
                    children.push({ type: "JSXText", value: textBuf });
                    textBuf = "";
                }
                let d = 1;
                let j = i + 1;
                while (j < innerStr.length && d > 0) {
                    if (innerStr[j] === "{") d++;
                    if (innerStr[j] === "}") d--;
                    j++;
                }
                children.push({
                    type: "JSXExpressionContainer",
                    expression: this.parseExpression(innerStr.substring(i + 1, j - 1)),
                });
                i = j;
                continue;
            } else {
                textBuf += innerStr[i];
                i++;
            }
        }
        if (textBuf.trim()) {
            children.push({ type: "JSXText", value: textBuf });
        }
        return children;
    }
}

export { CodonToASTParser as CodonParser };
