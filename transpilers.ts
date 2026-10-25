import type {
    Node,
    Program,
    Literal,
    Identifier,
    VariableDeclaration,
    VariableDeclarator,
    FunctionDeclaration,
    FunctionExpression,
    ArrowFunctionExpression,
    ClassDeclaration,
    ClassExpression,
    ClassBody,
    MethodDefinition,
    PropertyDefinition,
    ClassProperty,
    ClassMethod,
    IfStatement,
    ForOfStatement,
    ForInStatement,
    ForStatement,
    WhileStatement,
    DoWhileStatement,
    TryStatement,
    ThrowStatement,
    SwitchStatement,
    BlockStatement,
    CallExpression,
    OptionalCallExpression,
    NewExpression,
    MemberExpression,
    OptionalMemberExpression,
    ChainExpression,
    ObjectExpression,
    Property,
    SpreadElement,
    ArrayExpression,
    BinaryExpression,
    LogicalExpression,
    AssignmentExpression,
    UnaryExpression,
    UpdateExpression,
    ConditionalExpression,
    SequenceExpression,
    AwaitExpression,
    TemplateLiteral,
    ObjectPattern,
    ArrayPattern,
    AssignmentPattern,
    RestElement,
    JSXElement,
    JSXOpeningElement,
    JSXClosingElement,
    JSXAttribute,
    JSXExpressionContainer,
    JSXText,
    JSXIdentifier,
    JSXMemberExpression,
    JSXFragment,
    CodonTrainExpression,
    CodonFoldExpression,
    CodonRankExpression,
} from "./types";
import generate from "@babel/generator";
import * as fs from "fs";
import * as path from "path";
import { macroDictionary, resolveScopes, normalizeSubtree, type ScopeResolution } from "./macro-dict";

export interface CompilerOptions {
    rewriteImportExtensions?: boolean;
    rootDir?: string;
    currentFilePath?: string;
    targetFilePath?: string;
    outDir?: string;
    autoImportRuntime?: boolean;
    runtimeModule?: string;
}

export class JSToCodonTranslator {
    private resolution?: ScopeResolution;

    public tryMacroMatch(node: Node): string | null {
        try {
            if (macroDictionary.size === 0) macroDictionary.load();
            if (macroDictionary.entriesForNodeType(node.type).length === 0) {
                return null;
            }

            const { canonical, hash, placeholderArgs } = normalizeSubtree(node as any, this.resolution);
            const macro = macroDictionary.lookupByHash(hash);
            if (!macro) return null;
            if (macro.canonical && macro.canonical !== canonical) return null;

            const args: string[] = [];
            for (const param of macro.parameters) {
                const argNode = placeholderArgs[param.name];
                if (!argNode) {
                    args.push(param.kind === "literal" ? "null" : "undefined");
                    continue;
                }
                if (argNode.type === "Identifier") {
                    args.push(argNode.name);
                } else if (
                    argNode.type === "Literal" ||
                    argNode.type === "StringLiteral" ||
                    argNode.type === "NumericLiteral" ||
                    argNode.type === "BooleanLiteral" ||
                    argNode.type === "NullLiteral"
                ) {
                    if (typeof argNode.value === "string") {
                        args.push(`'${argNode.value}'`);
                    } else {
                        args.push(String(argNode.value));
                    }
                } else {
                    args.push(this.transpile(argNode));
                }
            }

            if (args.length === 0) {
                return `M!${macro.name}()`;
            }
            return `M!${macro.name}(${args.join(";")})`;
        } catch {
            return null;
        }
    }

    public transpile(node: Node | null | undefined): string {
        if (!node) return "";

        if (node.type === "Program") {
            this.resolution = resolveScopes(node);
        } else {
            const macroMatch = this.tryMacroMatch(node);
            if (macroMatch !== null) {
                return macroMatch;
            }
        }

        switch (node.type) {
            case "Program": {
                const imports: string[] = [];
                const exports: string[] = [];
                const body: string[] = [];

                for (const n of node.body) {
                    if (n.type === "ImportDeclaration") {
                        const src = String((n.source as Literal).value);
                        if (!n.specifiers || n.specifiers.length === 0) {
                            imports.push(`import. '${src}'`);
                        } else {
                            let defaultSpec = "";
                            let namespaceSpec = "";
                            const namedSpecs: string[] = [];

                            for (const s of n.specifiers) {
                                if (s.type === "ImportDefaultSpecifier") {
                                    defaultSpec = s.local.name;
                                } else if (s.type === "ImportNamespaceSpecifier") {
                                    namespaceSpec = `* as ${s.local.name}`;
                                } else if (s.type === "ImportSpecifier") {
                                    const imported = s.imported.name;
                                    const local = s.local ? s.local.name : imported;
                                    namedSpecs.push(local !== imported ? `${imported} as ${local}` : imported);
                                }
                            }

                            const specParts: string[] = [];
                            if (defaultSpec) specParts.push(defaultSpec);
                            if (namespaceSpec) specParts.push(namespaceSpec);
                            if (namedSpecs.length > 0) specParts.push(`{${namedSpecs.join(",")}}`);

                            imports.push(`import. ${specParts.join(",")} from '${src}'`);
                        }
                    } else if (n.type === "ExportDefaultDeclaration") {
                        exports.push(`export. default ${this.transpile(n.declaration)}`);
                    } else if (n.type === "ExportAllDeclaration") {
                        const source = String((n.source as Literal).value);
                        if ((n as any).exported) {
                            exports.push(`export. * as ${(n as any).exported.name} from '${source}'`);
                        } else {
                            exports.push(`export. * from '${source}'`);
                        }
                    } else if (n.type === "ExportNamedDeclaration") {
                        if (n.declaration) {
                            body.push(`export. ` + this.transpile(n.declaration));
                        } else if (n.specifiers && n.specifiers.length > 0) {
                            const hasNamespace = n.specifiers.find((s: any) => s.type === "ExportNamespaceSpecifier");
                            if (hasNamespace) {
                                const source = String((n.source as Literal).value);
                                exports.push(`export. * as ${hasNamespace.exported.name} from '${source}'`);
                            } else {
                                const specList = n.specifiers
                                    .map((s: any) => {
                                        const local = s.local ? s.local.name : (s.exported ? s.exported.name : s.name);
                                        const exp = s.exported ? s.exported.name : (s.local ? s.local.name : s.name);
                                        return local !== exp ? `${local} as ${exp}` : local;
                                    })
                                    .join(", ");
                                if (n.source) {
                                    const source = String((n.source as Literal).value);
                                    exports.push(`export. { ${specList} } from '${source}'`);
                                } else {
                                    exports.push(`export. { ${specList} }`);
                                }
                            }
                        }
                    } else {
                        body.push(this.transpile(n));
                    }
                }

                const out: string[] = [];
                out.push(...imports);
                out.push(...body);
                out.push(...exports);
                return out.filter(Boolean).join("\n\n");
            }

            case "VariableDeclaration":
                return node.declarations
                    .map((d) => {
                        const idStr = this.transpilePattern(d.id);
                        let initStr = d.init ? this.transpile(d.init) : "''";
                        if (d.init?.type === "AwaitExpression" && initStr.startsWith("(@ ") && initStr.endsWith(")")) {
                            initStr = "@ " + initStr.slice(3, -1);
                        }
                        return `${idStr} =: ${initStr}`;
                    })
                    .join("\n");

            case "ExpressionStatement":
                if (node.expression.type === "AwaitExpression") {
                    const argStr = this.transpile((node.expression as any).argument);
                    return `@ ${argStr}`;
                }
                if (node.expression.type === "AssignmentExpression") {
                    const assignNode = node.expression as AssignmentExpression;
                    let rightStr = this.transpile(assignNode.right);
                    if (assignNode.right.type === "AwaitExpression" && rightStr.startsWith("(@ ") && rightStr.endsWith(")")) {
                        rightStr = "@ " + rightStr.slice(3, -1);
                    }
                    return `${this.transpile(assignNode.left)} ${assignNode.operator} ${rightStr}`;
                }
                return this.transpile(node.expression);

            case "BlockStatement":
                return node.body.map((n) => this.transpile(n)).join("\n");

            case "IfStatement": {
                const testStr = this.transpile(node.test);
                const consStr = this.transpile(node.consequent);
                if (node.alternate) {
                    if (node.alternate.type === "IfStatement") {
                        let cur: any = node.alternate;
                        let chain = `if. ${testStr} do.\n${consStr}\n`;
                        while (cur && cur.type === "IfStatement") {
                            chain += `elseif. ${this.transpile(cur.test)} do.\n${this.transpile(cur.consequent)}\n`;
                            cur = cur.alternate;
                        }
                        if (cur) {
                            chain += `else.\n${this.transpile(cur)}\n`;
                        }
                        chain += "end.";
                        return chain;
                    }
                    const altStr = this.transpile(node.alternate);
                    return `if. ${testStr} do.\n${consStr}\nelse.\n${altStr}\nend.`;
                }
                return `if. ${testStr} do.\n${consStr}\nend.`;
            }

            case "ForOfStatement": {
                const leftStr =
                    node.left.type === "VariableDeclaration" && node.left.declarations[0]
                        ? this.transpilePattern(node.left.declarations[0].id)
                        : this.transpilePattern(node.left);
                const rightStr = this.transpile(node.right);
                return `for_of. ${leftStr} : ${rightStr} do.\n${this.transpile(node.body)}\nend.`;
            }

            case "ForInStatement": {
                const leftStr =
                    node.left.type === "VariableDeclaration" && node.left.declarations[0]
                        ? this.transpilePattern(node.left.declarations[0].id)
                        : this.transpilePattern(node.left);
                const rightStr = this.transpile(node.right);
                return `for_in. ${leftStr} : ${rightStr} do.\n${this.transpile(node.body)}\nend.`;
            }

            case "ForStatement": {
                const initStr = node.init ? this.transpile(node.init) : "";
                const testStr = node.test ? this.transpile(node.test) : "";
                const updateStr = node.update ? this.transpile(node.update) : "";
                return `for. ${initStr} ; ${testStr} ; ${updateStr} do.\n${this.transpile(node.body)}\nend.`;
            }

            case "WhileStatement":
                return `while. ${this.transpile(node.test)} do.\n${this.transpile(node.body)}\nend.`;

            case "DoWhileStatement":
                return `whilst. ${this.transpile(node.test)} do.\n${this.transpile(node.body)}\nend.`;

            case "TryStatement": {
                const blockStr = this.transpile(node.block);
                const catchStr = node.handler
                    ? `catch. ${node.handler.param ? this.transpilePattern(node.handler.param) : "err"} do.\n${this.transpile(node.handler.body)}\n`
                    : "";
                const finStr = node.finalizer ? `finally. do.\n${this.transpile(node.finalizer)}\n` : "";
                return `try. do.\n${blockStr}\n${catchStr}${finStr}end.`;
            }

            case "ThrowStatement":
                return `throw. ${this.transpile(node.argument)}`;

            case "ReturnStatement": {
                if (!node.argument) return "return.";
                let argStr = this.transpile(node.argument);
                if (node.argument.type === "AwaitExpression" && argStr.startsWith("(@ ") && argStr.endsWith(")")) {
                    argStr = "@ " + argStr.slice(3, -1);
                }
                return `return. ${argStr}`;
            }

            case "YieldExpression":
                return (node as any).argument ? `yield. ${this.transpile((node as any).argument)}` : "yield.";

            case "BreakStatement":
                return "break.";

            case "ContinueStatement":
                return "continue.";

            case "EmptyStatement":
                return "";

            case "SwitchStatement": {
                const discStr = this.transpile(node.discriminant);
                const casesStr = node.cases
                    .map((c) => {
                        const body = c.consequent.map((s) => this.transpile(s)).join("\n");
                        return c.test ? `case. ${this.transpile(c.test)} do.\n${body}` : `else. do.\n${body}`;
                    })
                    .join("\n");
                return `select. ${discStr}\n${casesStr}\nend.`;
            }

            case "ClassDeclaration": {
                const nameStr = node.id ? ` ${node.id.name}` : "";
                const superStr = node.superClass ? ` extends ${this.transpile(node.superClass)}` : "";
                const bodyStr = this.transpile(node.body);
                return `class.${nameStr}${superStr} do.\n${bodyStr}\nend.`;
            }

            case "ClassExpression": {
                const nameStr = node.id ? ` ${node.id.name}` : "";
                const superStr = node.superClass ? ` extends ${this.transpile(node.superClass)}` : "";
                const bodyStr = this.transpile(node.body);
                return `(class.${nameStr}${superStr} do.\n${bodyStr}\nend.)`;
            }

            case "ClassBody": {
                return node.body.map((item) => this.transpile(item)).join("\n");
            }

            case "PropertyDefinition":
            case "ClassProperty": {
                const pNode = node as PropertyDefinition | ClassProperty;
                const keyStr = (pNode.key as any).type === "Identifier" ? (pNode.key as any).name : this.transpile(pNode.key);
                let initStr = pNode.value ? this.transpile(pNode.value) : "''";
                if (pNode.value?.type === "AwaitExpression" && initStr.startsWith("(@ ") && initStr.endsWith(")")) {
                    initStr = "@ " + initStr.slice(3, -1);
                }
                return `${pNode.static ? "static " : ""}${keyStr} =: ${initStr}`;
            }

            case "MethodDefinition":
            case "ClassMethod": {
                const mNode = node as MethodDefinition | ClassMethod;
                const keyStr = (mNode.key as any).type === "Identifier" ? (mNode.key as any).name : this.transpile(mNode.key);
                const params = (mNode.value?.params || (mNode as any).params || []).map((p: any) => this.transpilePattern(p)).join(",");
                const body = this.transpile(mNode.value?.body || (mNode as any).body);
                const isAsync = mNode.value?.async || (mNode as any).async;
                const kind = (mNode as any).kind || "method";

                if (kind === "constructor") {
                    return `constructor. ${params} do.\n${body}\nend.`;
                }
                if (kind === "get") {
                    return `get. ${keyStr} do.\n${body}\nend.`;
                }
                if (kind === "set") {
                    return `set. ${keyStr} ${params} do.\n${body}\nend.`;
                }
                return `${isAsync ? "async_method." : "method."} ${keyStr} ${params} do.\n${body}\nend.`;
            }

            case "ImportDeclaration": {
                const src = String((node.source as Literal).value);
                const attrStr = (node as any).attributes && (node as any).attributes.length > 0
                    ? ` with { ${(node as any).attributes.map((a: any) => `${a.key.name || a.key.value}:'${a.value.value}'`).join(", ")} }`
                    : "";
                if (!node.specifiers || node.specifiers.length === 0) {
                    return `import. '${src}'${attrStr}`;
                }
                let defaultSpec = "";
                let namespaceSpec = "";
                const namedSpecs: string[] = [];

                for (const s of node.specifiers) {
                    if (s.type === "ImportDefaultSpecifier") {
                        defaultSpec = s.local.name;
                    } else if (s.type === "ImportNamespaceSpecifier") {
                        namespaceSpec = `* as ${s.local.name}`;
                    } else if (s.type === "ImportSpecifier") {
                        const imported = s.imported.name;
                        const local = s.local ? s.local.name : imported;
                        namedSpecs.push(local !== imported ? `${imported} as ${local}` : imported);
                    }
                }

                const specParts: string[] = [];
                if (defaultSpec) specParts.push(defaultSpec);
                if (namespaceSpec) specParts.push(namespaceSpec);
                if (namedSpecs.length > 0) specParts.push(`{${namedSpecs.join(",")}}`);

                return `import. ${specParts.join(",")} from '${src}'${attrStr}`;
            }

            case "ImportExpression": {
                const src = this.transpile((node as any).source);
                return `(import ${src})`;
            }

            case "ExportDefaultDeclaration":
                return `export. default ${this.transpile((node as any).declaration)}`;

            case "ExportAllDeclaration": {
                const src = String(((node as any).source as Literal).value);
                if ((node as any).exported) {
                    return `export. * as ${(node as any).exported.name} from '${src}'`;
                }
                return `export. * from '${src}'`;
            }

            case "ExportNamedDeclaration": {
                const n = node as any;
                if (n.declaration) {
                    return `export. ${this.transpile(n.declaration)}`;
                }
                if (n.specifiers && n.specifiers.length > 0) {
                    const hasNamespace = n.specifiers.find((s: any) => s.type === "ExportNamespaceSpecifier");
                    if (hasNamespace) {
                        const src = String((n.source as Literal).value);
                        return `export. * as ${hasNamespace.exported.name} from '${src}'`;
                    }
                    const specList = n.specifiers
                        .map((s: any) => {
                            const local = s.local ? s.local.name : (s.exported ? s.exported.name : s.name);
                            const exp = s.exported ? s.exported.name : (s.local ? s.local.name : s.name);
                            return local !== exp ? `${local} as ${exp}` : local;
                        })
                        .join(", ");
                    if (n.source) {
                        const src = String((n.source as Literal).value);
                        return `export. { ${specList} } from '${src}'`;
                    }
                    return `export. { ${specList} }`;
                }
                return "";
            }

            case "FunctionDeclaration": {
                const fdParams = node.params.map((p) => this.transpilePattern(p)).join(",");
                const fnName = node.id ? node.id.name : "";
                const prefix = node.async
                    ? (node.generator ? "async_gen_fn." : "async_fn.")
                    : (node.generator ? "gen_fn." : "fn.");
                const header = fnName ? (fdParams ? `${fnName} ${fdParams}` : fnName) : (fdParams || "");
                return `${prefix}${header ? " " + header : ""} do.\n${this.transpile(node.body)}\nend.`;
            }

            case "FunctionExpression": {
                const feParams = node.params.map((p) => this.transpilePattern(p)).join(",");
                const fnHeader = node.async ? (feParams ? `async fn ${feParams}` : "async fn") : (feParams ? `fn ${feParams}` : "fn");
                return `{{${fnHeader} => do.\n${this.transpile(node.body)}\n}}`;
            }

            case "ArrowFunctionExpression": {
                const pStr = node.params.map((p) => this.transpilePattern(p)).join(",");
                const isBlock = node.body.type === "BlockStatement";
                const pHeader = node.async ? (pStr ? `async ${pStr}` : "async") : pStr;
                if (isBlock) {
                    return `{{${pHeader} => do.\n${this.transpile(node.body)}\n}}`;
                }
                let bodyStr = this.transpile(node.body);
                if (node.body.type === "AwaitExpression" && bodyStr.startsWith("(@ ") && bodyStr.endsWith(")")) {
                    bodyStr = "@ " + bodyStr.slice(3, -1);
                }
                return `{{${pHeader} => ${bodyStr}}}`;
            }

            case "ThisExpression":
                return "this";

            case "Super":
                return "super";

            case "ArrayExpression": {
                if (node.elements.length === 0) return `[]`;
                if (node.elements.length === 1) {
                    return `[${this.transpile(node.elements[0])}]`;
                }
                return `[${node.elements.map((n) => (n ? this.transpile(n) : "''")).join(",")}]`;
            }

            case "ObjectExpression": {
                if (!node.properties || node.properties.length === 0) return `O''`;
                const props = node.properties.map((p) => this.transpile(p)).join(";");
                return `O(${props})`;
            }

            case "Property":
            case "ObjectProperty" as any: {
                const p = node as any;
                const keyStr = p.key.type === "Identifier" ? p.key.name : String(p.key.value ?? this.transpile(p.key));
                if (p.method) {
                    const fnVal = p.value;
                    const pStr = fnVal.params.map((param: any) => this.transpilePattern(param)).join(",");
                    const fnHeader = fnVal.async ? (pStr ? `async fn ${pStr}` : "async fn") : (pStr ? `fn ${pStr}` : "fn");
                    const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(keyStr) ? keyStr : `'${keyStr}'`;
                    return `${formattedKey}:{{${fnHeader} => do.\n${this.transpile(fnVal.body)}\n}}`;
                }
                if (p.shorthand || (p.key.type === "Identifier" && p.value.type === "Identifier" && p.key.name === p.value.name)) {
                    return keyStr;
                }
                const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(keyStr) ? keyStr : `'${keyStr}'`;
                return `${formattedKey}:${this.transpile(p.value)}`;
            }

            case "ObjectMethod" as any: {
                const p = node as any;
                const keyStr = p.key.type === "Identifier" ? p.key.name : String(p.key.value ?? this.transpile(p.key));
                const pStr = p.params.map((param: any) => this.transpilePattern(param)).join(",");
                const fnHeader = p.async ? (pStr ? `async fn ${pStr}` : "async fn") : (pStr ? `fn ${pStr}` : "fn");
                const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(keyStr) ? keyStr : `'${keyStr}'`;
                return `${formattedKey}:{{${fnHeader} => do.\n${this.transpile(p.body)}\n}}`;
            }

            case "SpreadElement":
                return `...${this.transpile(node.argument)}`;

            case "NewExpression": {
                const newArgs = node.arguments.map((a) => this.transpile(a)).join(" ");
                return `(new ${this.transpile(node.callee)}${newArgs ? " " + newArgs : ""})`;
            }

            case "OptionalCallExpression":
            case "CallExpression": {
                const cNode = node as CallExpression | OptionalCallExpression;
                const isOpt = Boolean(cNode.optional) || cNode.type === "OptionalCallExpression";
                const calleeStr = this.transpile(cNode.callee);
                if (isOpt) {
                    if (cNode.arguments.length === 0) return calleeStr.endsWith("?.") ? `${calleeStr}()` : `${calleeStr}?.()`;
                    return calleeStr.endsWith("?.")
                        ? `(${calleeStr} ${cNode.arguments.map((n) => this.transpile(n)).join(" ")})`
                        : `(${calleeStr}?. ${cNode.arguments.map((n) => this.transpile(n)).join(" ")})`;
                }
                if (cNode.arguments.length === 0) return `${calleeStr}()`;
                return `(${calleeStr} ${cNode.arguments.map((n) => this.transpile(n)).join(" ")})`;
            }

            case "OptionalMemberExpression":
            case "MemberExpression": {
                const mNode = node as MemberExpression | OptionalMemberExpression;
                const isOpt = Boolean(mNode.optional) || mNode.type === "OptionalMemberExpression";
                const rawObj = this.transpile(mNode.object);
                const objStr = (mNode.object.type === "CallExpression" && !rawObj.startsWith("("))
                    ? `(${rawObj})`
                    : rawObj;
                const optDot = isOpt ? "?." : ".";
                if (mNode.computed) {
                    const propStr = this.transpile(mNode.property);
                    return isOpt ? `${objStr}?. [${propStr}]` : `${objStr}.[${propStr}]`;
                }
                const propName = (mNode.property as Identifier).name || this.transpile(mNode.property);
                return `${objStr}${optDot}${propName}`;
            }

            case "ChainExpression":
                return this.transpile(node.expression);

            case "AssignmentExpression":
            case "BinaryExpression":
            case "LogicalExpression":
                return `(${this.transpile(node.left)} ${node.operator} ${this.transpile(node.right)})`;

            case "UnaryExpression":
                if (node.operator === "!") {
                    return `!${this.transpile(node.argument)}`;
                }
                return `(${node.operator} ${this.transpile(node.argument)})`;

            case "UpdateExpression":
                return node.prefix
                    ? `${node.operator}${this.transpile(node.argument)}`
                    : `${this.transpile(node.argument)}${node.operator}`;

            case "ConditionalExpression":
                return `(${this.transpile(node.test)} ? ${this.transpile(node.consequent)} : ${this.transpile(node.alternate)})`;

            case "SequenceExpression": {
                const exprs = node.expressions.map((e) => this.transpile(e)).join(", ");
                return `(${exprs})`;
            }

            case "AwaitExpression":
                return `(@ ${this.transpile(node.argument)})`;

            case "TemplateLiteral": {
                let tpl = "`";
                for (let i = 0; i < node.quasis.length; i++) {
                    const quasi = node.quasis[i];
                    if (quasi) tpl += quasi.value.raw;
                    const expr = node.expressions[i];
                    if (expr) {
                        tpl += "${" + this.transpile(expr) + "}";
                    }
                }
                tpl += "`";
                return tpl;
            }

            case "TaggedTemplateExpression":
                return `${this.transpile(node.tag)}${this.transpile(node.quasi)}`;

            case "Literal":
                if (node.value === null) return `''`;
                if (typeof node.value === "boolean") return String(node.value);
                if (typeof node.value === "number") return String(node.value);
                if (node.regex) return `/${node.regex.pattern}/${node.regex.flags}`;
                if (typeof node.value === "string" && (node.value.includes("\n") || node.value.includes("\r") || node.value.includes("\t"))) {
                    return JSON.stringify(node.value);
                }
                return `'${String(node.value).replace(/'/g, "''")}'`;

            case "StringLiteral" as any: {
                const val = (node as any).value;
                if (typeof val === "string" && (val.includes("\n") || val.includes("\r") || val.includes("\t"))) {
                    return JSON.stringify(val);
                }
                return `'${String(val).replace(/'/g, "''")}'`;
            }

            case "NumericLiteral" as any:
            case "BooleanLiteral" as any:
                return String((node as any).value);

            case "NullLiteral" as any:
                return `''`;

            case "RegExpLiteral" as any:
                return `/${(node as any).pattern}/${(node as any).flags}`;

            case "Identifier":
                return node.name;

            case "JSXElement": {
                return `(${generate(node as any).code})`;
            }

            case "JSXFragment": {
                const children = node.children.map((c) => this.transpile(c)).join("");
                return `<>${children}</>`;
            }

            case "JSXText":
                return node.value;

            case "JSXExpressionContainer":
                return `{${this.transpile(node.expression)}}`;

            default:
                throw new Error(`Unsupported AST node type: ${(node as any).type}`);
        }
    }

    private transpileJSXName(node: JSXIdentifier | JSXMemberExpression): string {
        if (node.type === "JSXIdentifier") return node.name;
        return `${this.transpileJSXName(node.object)}.${node.property.name}`;
    }

    private transpileJSXAttr(attr: JSXAttribute | SpreadElement): string {
        if (attr.type === "SpreadElement") {
            return ` {...${this.transpile(attr.argument)}}`;
        }
        const name = attr.name.name;
        if (!attr.value) return ` ${name}`;
        const valObj = attr.value as any;
        if (valObj.type === "Literal" || valObj.type === "StringLiteral") {
            return ` ${name}=${JSON.stringify(valObj.value)}`;
        }
        if (valObj.type === "JSXExpressionContainer") {
            return ` ${name}={${this.transpile(valObj.expression)}}`;
        }
        return ` ${name}={${this.transpile(valObj)}}`;
    }

    public transpilePattern(node: Node): string {
        if (!node) return "";
        if (node.type === "Identifier") return node.name;
        if (node.type === "AssignmentPattern") {
            return `${this.transpilePattern(node.left)}=${this.transpile(node.right)}`;
        }
        if (node.type === "RestElement") {
            return `...${this.transpilePattern(node.argument)}`;
        }
        if (node.type === "ArrayPattern") {
            return `[${node.elements.map((e) => (e ? this.transpilePattern(e) : "")).join(",")}]`;
        }
        if (node.type === "ObjectPattern") {
            const props = node.properties.map((p: any) => {
                if (p.type === "RestElement") return `...${this.transpilePattern(p.argument)}`;
                if (p.shorthand) return this.transpilePattern(p.value);
                const k = p.key.type === "Identifier" ? p.key.name : this.transpile(p.key);
                const v = this.transpilePattern(p.value);
                return k === v ? k : `${k}:${v}`;
            });
            return `{${props.join(",")}}`;
        }
        return (node as any).name || "___pattern___";
    }
}

export class CodonToJSCompiler {
    public transpile(node: Node, options?: CompilerOptions): string {
        if (!node) return "";

        const rewriteModuleSpecifier = (spec: string): string => {
            if (options?.rewriteImportExtensions === false) return spec;
            if (typeof spec !== "string") return spec;
            if (spec.startsWith("./") || spec.startsWith("../")) {
                if (spec.endsWith(".cdn")) {
                    return spec.slice(0, -4) + ".js";
                }
                if (options?.currentFilePath && !path.extname(spec)) {
                    const dir = path.dirname(options.currentFilePath);
                    const cdnTarget = path.resolve(dir, spec + ".cdn");
                    if (fs.existsSync(cdnTarget)) {
                        return spec + ".js";
                    }
                }
            }
            return spec;
        };

        const RUNTIME_FUNCS = new Set([
            "fork", "hook", "atop", "rank", "sum", "product", "fold", "scan",
            "div", "tally", "shape", "head", "tail", "behead", "curtail",
            "take", "drop", "range", "from", "gradeUp", "gradeDown", "box", "open",
        ]);
        const usedRuntime = new Set<string>();

        const toBabel = (n: any): any => {
            if (Array.isArray(n)) return n.map(toBabel);
            if (!n || typeof n !== "object") return n;

            // Handle Codon Train Expression (Forks and Hooks)
            if (n.type === "CodonTrainExpression") {
                if (n.kind === "fork" && n.verbs.length === 3) {
                    usedRuntime.add("fork");
                    return {
                        type: "CallExpression",
                        callee: { type: "Identifier", name: "fork" },
                        arguments: n.verbs.map(toBabel),
                    };
                }
                if (n.kind === "hook" && n.verbs.length === 2) {
                    usedRuntime.add("hook");
                    return {
                        type: "CallExpression",
                        callee: { type: "Identifier", name: "hook" },
                        arguments: n.verbs.map(toBabel),
                    };
                }
            }

            // Handle Codon Fold / Reduction
            if (n.type === "CodonFoldExpression") {
                const verbName = n.scan ? "scan" : "fold";
                usedRuntime.add(verbName);
                return {
                    type: "CallExpression",
                    callee: { type: "Identifier", name: verbName },
                    arguments: [toBabel(n.verb), toBabel(n.target)],
                };
            }

            // Handle Codon Rank
            if (n.type === "CodonRankExpression") {
                usedRuntime.add("rank");
                return {
                    type: "CallExpression",
                    callee: {
                        type: "CallExpression",
                        callee: { type: "Identifier", name: "rank" },
                        arguments: [toBabel(n.verb), { type: "NumericLiteral", value: Number(n.rank) || 0 }],
                    },
                    arguments: [toBabel(n.target)],
                };
            }

            // Handle ImportDeclaration
            if (n.type === "ImportDeclaration") {
                const specifiers = (n.specifiers || []).map((s: any) => {
                    if (s.type === "ImportDefaultSpecifier") {
                        return {
                            type: "ImportDefaultSpecifier",
                            local: { type: "Identifier", name: s.local ? s.local.name : s.name },
                        };
                    }
                    if (s.type === "ImportNamespaceSpecifier") {
                        return {
                            type: "ImportNamespaceSpecifier",
                            local: { type: "Identifier", name: s.local ? s.local.name : s.name },
                        };
                    }
                    return {
                        type: "ImportSpecifier",
                        imported: { type: "Identifier", name: s.imported ? s.imported.name : s.name },
                        local: { type: "Identifier", name: s.local ? s.local.name : (s.imported ? s.imported.name : s.name) },
                    };
                });

                let sourceVal = String(n.source ? (n.source.value ?? n.source) : "");
                sourceVal = rewriteModuleSpecifier(sourceVal);

                const attributes = (n.attributes || []).map((a: any) => ({
                    type: "ImportAttribute",
                    key: { type: "Identifier", name: a.key.name || a.key.value },
                    value: { type: "StringLiteral", value: String(a.value.value) },
                }));

                return {
                    type: "ImportDeclaration",
                    specifiers,
                    source: { type: "StringLiteral", value: sourceVal },
                    attributes: attributes.length > 0 ? attributes : undefined,
                };
            }

            // Handle ExportAllDeclaration
            if (n.type === "ExportAllDeclaration") {
                let sourceVal = String(n.source ? (n.source.value ?? n.source) : "");
                sourceVal = rewriteModuleSpecifier(sourceVal);
                return {
                    type: "ExportAllDeclaration",
                    source: { type: "StringLiteral", value: sourceVal },
                    exported: n.exported ? { type: "Identifier", name: n.exported.name } : null,
                };
            }

            // Handle ExportNamedDeclaration
            if (n.type === "ExportNamedDeclaration") {
                const sourceVal = n.source ? rewriteModuleSpecifier(String(n.source.value ?? n.source)) : null;
                const specifiers = (n.specifiers || []).map((s: any) => {
                    if (s.type === "ExportNamespaceSpecifier") {
                        return {
                            type: "ExportNamespaceSpecifier",
                            exported: { type: "Identifier", name: s.exported.name },
                        };
                    }
                    return {
                        type: "ExportSpecifier",
                        local: { type: "Identifier", name: s.local ? s.local.name : s.name },
                        exported: { type: "Identifier", name: s.exported ? s.exported.name : (s.local ? s.local.name : s.name) },
                    };
                });

                return {
                    type: "ExportNamedDeclaration",
                    declaration: n.declaration ? toBabel(n.declaration) : null,
                    specifiers,
                    source: sourceVal ? { type: "StringLiteral", value: sourceVal } : null,
                };
            }

            // Handle ImportExpression (dynamic import)
            if (n.type === "ImportExpression" || (n.type === "CallExpression" && n.callee && n.callee.name === "import")) {
                const srcNode = n.type === "ImportExpression" ? n.source : n.arguments[0];
                const optNode = n.type === "ImportExpression" ? n.options : n.arguments[1];
                let babelSrc = toBabel(srcNode);
                if (babelSrc.type === "StringLiteral" || babelSrc.type === "Literal") {
                    babelSrc = { type: "StringLiteral", value: rewriteModuleSpecifier(String(babelSrc.value)) };
                }
                return {
                    type: "ImportExpression",
                    source: babelSrc,
                    options: optNode ? toBabel(optNode) : null,
                };
            }

            if (n.type === "CallExpression" && n.callee && n.callee.type === "Identifier" && RUNTIME_FUNCS.has(n.callee.name)) {
                usedRuntime.add(n.callee.name);
            }

            const res: any = {};
            for (const key in n) {
                res[key] = toBabel(n[key]);
            }

            // Convert ESTree Literals to Babel Literals
            if (res.type === "Literal") {
                if (typeof res.value === "string") return { ...res, type: "StringLiteral" };
                if (typeof res.value === "number") return { ...res, type: "NumericLiteral" };
                if (typeof res.value === "boolean") return { ...res, type: "BooleanLiteral" };
                if (res.value === null) return { ...res, type: "NullLiteral" };
                if (res.regex) {
                    return {
                        type: "RegExpLiteral",
                        pattern: res.regex.pattern,
                        flags: res.regex.flags,
                    };
                }
            }

            // Convert ESTree Property to Babel ObjectProperty or ObjectMethod
            if (res.type === "Property") {
                if (res.method && res.value && (res.value.type === "FunctionExpression" || res.value.type === "ArrowFunctionExpression")) {
                    return {
                        type: "ObjectMethod",
                        kind: "method",
                        key: res.key,
                        params: res.value.params || [],
                        body: res.value.body.type === "BlockStatement" ? res.value.body : { type: "BlockStatement", body: [{ type: "ReturnStatement", argument: res.value.body }] },
                        computed: res.computed || false,
                        async: res.value.async || false,
                    };
                }
                return { ...res, type: "ObjectProperty" };
            }

            // Convert optional member and call expressions
            if (res.type === "MemberExpression" && res.optional) {
                return { ...res, type: "OptionalMemberExpression" };
            }
            if (res.type === "CallExpression" && res.optional) {
                return { ...res, type: "OptionalCallExpression" };
            }

            // Unwrap ExpressionStatement in ForStatement init if present
            if (res.type === "ForStatement" && res.init && res.init.type === "ExpressionStatement") {
                res.init = res.init.expression;
            }

            // Convert MethodDefinition to Babel ClassMethod
            if (res.type === "MethodDefinition") {
                return {
                    type: "ClassMethod",
                    kind: res.kind || "method",
                    key: res.key,
                    params: res.value ? res.value.params : [],
                    body: res.value ? res.value.body : { type: "BlockStatement", body: [] },
                    computed: res.computed || false,
                    static: res.static || false,
                    async: res.value ? res.value.async : false,
                };
            }

            // Convert PropertyDefinition to Babel ClassProperty
            if (res.type === "PropertyDefinition") {
                return {
                    type: "ClassProperty",
                    key: res.key,
                    value: res.value,
                    computed: res.computed || false,
                    static: res.static || false,
                };
            }

            return res;
        };

        try {
            const babelAST = toBabel(node);
            if (babelAST.type === "Program" && options?.autoImportRuntime && usedRuntime.size > 0) {
                const hasRuntimeImport = babelAST.body.some((stmt: any) =>
                    stmt.type === "ImportDeclaration" &&
                    (stmt.source.value.includes("codon-runtime") || stmt.source.value === options?.runtimeModule)
                );
                if (!hasRuntimeImport) {
                    let runtimePath = options?.runtimeModule || "./codon-runtime.js";
                    if (!options?.runtimeModule && options?.outDir) {
                        let targetDir = path.resolve(options.outDir);
                        if (options.targetFilePath) {
                            targetDir = path.dirname(path.resolve(options.targetFilePath));
                        } else if (options.rootDir && options.currentFilePath) {
                            const relFromRoot = path.relative(path.resolve(options.rootDir), path.dirname(path.resolve(options.currentFilePath)));
                            targetDir = path.resolve(options.outDir, relFromRoot);
                        } else if (options.currentFilePath) {
                            targetDir = path.dirname(path.resolve(options.currentFilePath));
                        }
                        const rel = path.relative(targetDir, path.resolve(options.outDir, "codon-runtime.js")).replace(/\\/g, "/");
                        runtimePath = rel.startsWith(".") ? rel : "./" + rel;
                    }
                    const runtimeSpecs = Array.from(usedRuntime).sort().map((name) => ({
                        type: "ImportSpecifier",
                        imported: { type: "Identifier", name },
                        local: { type: "Identifier", name },
                    }));
                    babelAST.body.unshift({
                        type: "ImportDeclaration",
                        specifiers: runtimeSpecs,
                        source: { type: "StringLiteral", value: runtimePath },
                    });
                }
            }
            const result = generate(babelAST);
            return result.code;
        } catch (e) {
            throw new Error(`Failed to generate JS from AST: ${e}`);
        }
    }
}

export { CodonToJSCompiler as CodonToJSTranspiler };
export { JSToCodonTranslator as JSToCodonTranspiler };
