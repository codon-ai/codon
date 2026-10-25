import * as fs from "fs";
import * as path from "path";
import * as babelParser from "@babel/parser";

export interface MacroParameter {
    name: string;
    kind: "capture" | "literal";
    literalKind?: string;
}

export interface MacroLocal {
    name: string;
    example: string;
}

export interface MacroEntry {
    hash: string;
    name: string;
    nodeType: string;
    category: "statement" | "expression" | "declaration";
    template: string;
    templateReady: boolean;
    parameters: MacroParameter[];
    locals: MacroLocal[];
    size: number;
    depth: number;
    count: number;
    score: number;
    canonical: string;
}

export interface ScopeBinding {
    name: string;
    scope: Scope;
}

export interface Scope {
    parent?: Scope;
    varScope: Scope;
    values: Map<string, ScopeBinding>;
    types: Map<string, ScopeBinding>;
}

export interface ScopeResolution {
    scopeOf: WeakMap<any, Scope>;
    declarations: WeakMap<any, ScopeBinding>;
    declsByBinding: Map<ScopeBinding, any[]>;
}

const SCALAR_FIELDS = new Set([
    "name", "value", "operator", "kind", "computed", "optional", "prefix",
    "async", "generator", "static", "method", "shorthand", "delegate",
    "expression", "await", "readonly", "abstract", "declare", "definite",
    "accessibility", "importKind", "exportKind", "variance", "const",
    "override", "global", "flags", "rawName", "selfClosing", "tail",
]);

const FIXED_COMMON_VALUES = new Set<unknown>([
    0, 1, -1, 2, "", "use strict", "utf-8", "UTF-8",
    true, false, null, undefined,
    "GET", "POST", "PUT", "DELETE", "PATCH",
    "application/json", "text/plain", "text/html",
]);

function scalar(value: unknown): unknown {
    if (typeof value === "bigint") return `bigint:${value.toString()}`;
    if (value instanceof RegExp) return `regexp:${value.source}/${value.flags}`;
    if (typeof value === "number" && !Number.isFinite(value)) return String(value);
    if (Array.isArray(value)) return value.map(scalar);
    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([key, item]) => [key, scalar(item)])
        );
    }
    return value;
}

function literalKind(value: unknown): string {
    if (value === null) return "null";
    if (value instanceof RegExp) return "regexp";
    return typeof value;
}

function fixedLiteral(parent: any, field: string | undefined, value: unknown): boolean {
    if (!parent) return false;
    if (field === "key" && !parent.computed) return true;
    if (field === "source" && /^(Import|Export)/.test(parent.type)) return true;
    if (parent.type === "JSXAttribute" && field === "value") return true;
    if (parent.type === "ExpressionStatement" && parent.directive) return true;
    if (FIXED_COMMON_VALUES.has(value)) return true;
    return false;
}

function fixedIdentifier(parent: any, field: string | undefined): boolean {
    if (!parent) return false;
    if (parent.type === "MemberExpression" || parent.type === "OptionalMemberExpression") {
        return field === "property" && !parent.computed;
    }
    if (
        parent.type === "Property" ||
        parent.type === "ObjectProperty" ||
        parent.type === "MethodDefinition" ||
        parent.type === "PropertyDefinition" ||
        parent.type === "ClassProperty" ||
        parent.type === "ClassMethod"
    ) {
        return field === "key" && !parent.computed;
    }
    if (parent.type === "ImportSpecifier") return field === "imported";
    if (parent.type === "ExportSpecifier") return field === "exported";
    if (parent.type === "MetaProperty") return true;
    if (parent.type === "LabeledStatement") return field === "label";
    if (parent.type === "BreakStatement" || parent.type === "ContinueStatement") return field === "label";
    return false;
}

function isNode(val: unknown): val is { type: string; [key: string]: any } {
    return val !== null && typeof val === "object" && typeof (val as any).type === "string";
}

function createScope(parent?: Scope, varBoundary = false): Scope {
    const scope: Scope = {
        parent,
        varScope: undefined as unknown as Scope,
        values: new Map(),
        types: new Map(),
    };
    scope.varScope = !parent || varBoundary ? scope : parent.varScope;
    return scope;
}

function lookup(scope: Scope, name: string): ScopeBinding | undefined {
    for (let cur: Scope | undefined = scope; cur; cur = cur.parent) {
        const b = cur.values.get(name);
        if (b) return b;
    }
    return undefined;
}

export function resolveScopes(program: any): ScopeResolution {
    const scopeOf = new WeakMap<any, Scope>();
    const declarations = new WeakMap<any, ScopeBinding>();
    const declsByBinding = new Map<ScopeBinding, any[]>();
    const rootScope = createScope();

    function declare(id: any, scope: Scope): void {
        if (!id || id.type !== "Identifier") return;
        const b: ScopeBinding = { name: id.name, scope };
        scope.values.set(id.name, b);
        declarations.set(id, b);
        const list = declsByBinding.get(b) || [];
        list.push(id);
        declsByBinding.set(b, list);
    }

    function declarePattern(node: any, scope: Scope): void {
        if (!node) return;
        if (node.type === "Identifier") {
            declare(node, scope);
        } else if (node.type === "ArrayPattern") {
            (node.elements || []).forEach((e: any) => declarePattern(e, scope));
        } else if (node.type === "ObjectPattern") {
            (node.properties || []).forEach((p: any) =>
                declarePattern(p.type === "RestElement" ? p.argument : p.value, scope)
            );
        } else if (node.type === "AssignmentPattern") {
            declarePattern(node.left, scope);
        } else if (node.type === "RestElement") {
            declarePattern(node.argument, scope);
        }
    }

    function visit(node: any, scope: Scope): void {
        if (!node || typeof node !== "object") return;
        scopeOf.set(node, scope);

        switch (node.type) {
            case "Program":
                (node.body || []).forEach((n: any) => visit(n, scope));
                break;
            case "FunctionDeclaration":
            case "FunctionExpression": {
                if (node.id) {
                    declare(node.id, node.type === "FunctionDeclaration" ? scope : createScope(scope, true));
                }
                const fnScope = createScope(scope, true);
                (node.params || []).forEach((p: any) => declarePattern(p, fnScope));
                if (node.body && node.body.type === "BlockStatement") {
                    scopeOf.set(node.body, fnScope);
                    (node.body.body || []).forEach((s: any) => visit(s, fnScope));
                } else if (node.body) {
                    visit(node.body, fnScope);
                }
                break;
            }
            case "ArrowFunctionExpression": {
                const fnScope = createScope(scope, true);
                (node.params || []).forEach((p: any) => declarePattern(p, fnScope));
                if (node.body && node.body.type === "BlockStatement") {
                    scopeOf.set(node.body, fnScope);
                    (node.body.body || []).forEach((s: any) => visit(s, fnScope));
                } else if (node.body) {
                    visit(node.body, fnScope);
                }
                break;
            }
            case "BlockStatement": {
                const bScope = createScope(scope);
                (node.body || []).forEach((s: any) => visit(s, bScope));
                break;
            }
            case "VariableDeclaration": {
                const target = node.kind === "var" ? scope.varScope : scope;
                (node.declarations || []).forEach((d: any) => {
                    declarePattern(d.id, target);
                    if (d.init) visit(d.init, scope);
                });
                break;
            }
            case "ClassDeclaration":
            case "ClassExpression": {
                if (node.id) declare(node.id, scope);
                const classScope = createScope(scope);
                if (node.body && Array.isArray(node.body.body)) {
                    node.body.body.forEach((m: any) => visit(m, classScope));
                }
                break;
            }
            case "ImportDeclaration": {
                (node.specifiers || []).forEach((s: any) => {
                    if (s.local) declare(s.local, scope);
                });
                break;
            }
            default:
                for (const k of Object.keys(node)) {
                    const v = node[k];
                    if (isNode(v)) visit(v, scope);
                    else if (Array.isArray(v)) {
                        v.forEach((item) => {
                            if (isNode(item)) visit(item, scope);
                        });
                    }
                }
        }
    }

    visit(program, rootScope);
    return { scopeOf, declarations, declsByBinding };
}

function encodeFields(node: any, child: (childNode: any, key: string) => unknown): unknown {
    let type = node.type;
    if (
        type === "NumericLiteral" ||
        type === "StringLiteral" ||
        type === "BooleanLiteral" ||
        type === "NullLiteral" ||
        type === "RegExpLiteral"
    ) {
        type = "Literal";
    }

    const fields: [string, unknown][] = [];
    for (const [key, value] of Object.entries(node).sort(([a], [b]) => a.localeCompare(b))) {
        if (
            [
                "type",
                "start",
                "end",
                "loc",
                "range",
                "raw",
                "extra",
                "parent",
                "comments",
                "leadingComments",
                "trailingComments",
                "innerComments",
                "directives",
            ].includes(key)
        ) {
            continue;
        }

        if (isNode(value)) {
            fields.push([key, child(value, key)]);
        } else if (Array.isArray(value)) {
            fields.push([
                key,
                value.map((item) => (isNode(item) ? child(item, key) : scalar(item))),
            ]);
        } else if (SCALAR_FIELDS.has(key)) {
            fields.push([key, scalar(value)]);
        }
    }

    if (type === "CallExpression" && !node.hasOwnProperty("optional")) {
        fields.push(["optional", false]);
        fields.sort(([a], [b]) => a.localeCompare(b));
    }
    if (type === "MemberExpression" && !node.hasOwnProperty("optional")) {
        fields.push(["optional", false]);
        fields.sort(([a], [b]) => a.localeCompare(b));
    }
    if (type === "ArrowFunctionExpression" && !node.hasOwnProperty("expression")) {
        fields.push(["expression", node.body && node.body.type !== "BlockStatement"]);
        fields.sort(([a], [b]) => a.localeCompare(b));
    }

    return [type, fields];
}

export function normalizeSubtree(
    root: any,
    resolution?: ScopeResolution
): { canonical: string; hash: string; placeholderArgs: Record<string, any> } {
    const nameByBinding = new Map<any, string>();
    let captureCount = 0;
    let localCount = 0;
    let literalCount = 0;
    const placeholderArgs: Record<string, any> = {};

    function encode(node: any, parent?: any, field?: string): unknown {
        if (node.type === "Identifier") {
            const name = node.name;
            if (fixedIdentifier(parent, field)) return [node.type, `fixed:${name}`];

            if (resolution) {
                const scope = resolution.scopeOf.get(node);
                const binding = resolution.declarations.get(node) ?? (scope ? lookup(scope, name) : undefined);
                if (!binding) return [node.type, `fixed:${name}`];

                let placeholder = nameByBinding.get(binding);
                if (!placeholder) {
                    const decls = resolution.declsByBinding.get(binding) || [];
                    const isLocal = decls.some(
                        (id) =>
                            root.start !== undefined &&
                            root.end !== undefined &&
                            id.start >= root.start &&
                            id.end <= root.end
                    );
                    if (isLocal) {
                        placeholder = `__clone_local${localCount++}`;
                    } else {
                        placeholder = `__clone_arg${captureCount++}`;
                        placeholderArgs[placeholder] = node;
                    }
                    nameByBinding.set(binding, placeholder);
                }
                return [node.type, placeholder];
            } else {
                const placeholder = `__clone_arg${captureCount++}`;
                placeholderArgs[placeholder] = node;
                return [node.type, placeholder];
            }
        }

        if (
            node.type === "Literal" ||
            node.type === "NumericLiteral" ||
            node.type === "StringLiteral" ||
            node.type === "BooleanLiteral" ||
            node.type === "NullLiteral"
        ) {
            const val = node.value !== undefined ? node.value : null;
            const kind = literalKind(val);
            if (fixedLiteral(parent, field, val)) {
                return ["Literal", kind, "fixed", scalar(val)];
            }
            const placeholder = `__clone_lit${literalCount++}`;
            placeholderArgs[placeholder] = node;
            return ["Literal", kind, "parameter"];
        }

        return encodeFields(node, (child, key) => encode(child, node, key));
    }

    const canonical = JSON.stringify(encode(root));
    const hash = Bun.hash(canonical).toString();
    return { canonical, hash, placeholderArgs };
}

export class MacroDictionary {
    private byName: Map<string, MacroEntry> = new Map();
    private byHash: Map<string, MacroEntry> = new Map();
    private byNodeType: Map<string, MacroEntry[]> = new Map();
    private loaded = false;

    public load(): void {
        if (this.loaded) return;
        const dictPath = path.resolve(process.cwd(), "dict.json");
        if (!fs.existsSync(dictPath)) {
            this.loaded = true;
            return;
        }

        const raw = JSON.parse(fs.readFileSync(dictPath, "utf-8"));
        for (const [key, item] of Object.entries(raw) as [string, any][]) {
            if (!item.name || !item.templateReady) continue;
            const macro: MacroEntry = {
                hash: item.hash || key,
                name: item.name,
                nodeType: item.nodeType,
                category: item.category || "expression",
                template: item.template,
                templateReady: item.templateReady,
                parameters: item.parameters || [],
                locals: item.locals || [],
                size: item.size || 0,
                depth: item.depth || 0,
                count: item.count || 0,
                score: item.score || 0,
                canonical: item.canonical || "",
            };

            this.byName.set(macro.name, macro);
            this.byHash.set(macro.hash, macro);
            const list = this.byNodeType.get(macro.nodeType) ?? [];
            list.push(macro);
            this.byNodeType.set(macro.nodeType, list);
        }
        this.loaded = true;
    }

    public lookupByName(name: string): MacroEntry | undefined {
        this.load();
        return this.byName.get(name);
    }

    public lookupByHash(hash: string): MacroEntry | undefined {
        this.load();
        return this.byHash.get(hash);
    }

    public entriesForNodeType(nodeType: string): MacroEntry[] {
        this.load();
        return this.byNodeType.get(nodeType) ?? [];
    }

    public get size(): number {
        this.load();
        return this.byName.size;
    }

    public expandTemplate(macro: MacroEntry, args: string[]): string {
        let code = macro.template;

        for (let i = 0; i < macro.parameters.length; i++) {
            const param = macro.parameters[i];
            if (!param) continue;
            const arg = args[i] !== undefined && args[i] !== null ? args[i]! : param.kind === "literal" ? "null" : "undefined";
            code = code.replaceAll(param.name, arg);
        }

        for (let i = 0; i < macro.locals.length; i++) {
            const loc = macro.locals[i];
            if (!loc) continue;
            code = code.replaceAll(loc.name, `_${loc.example || "loc"}_${i}`);
        }

        return code;
    }

    public expandToAST(macro: MacroEntry, args: string[]): any {
        const expandedCode = this.expandTemplate(macro, args);
        const parseTarget = macro.category === "expression" ? `(${expandedCode})` : expandedCode;

        const parsed = babelParser.parse(parseTarget, {
            sourceType: "module",
            plugins: ["jsx"],
            errorRecovery: true,
        });

        const body = parsed.program.body;
        if (body.length === 0) {
            throw new Error(`Macro ${macro.name} expanded to empty AST`);
        }

        const first = body[0];
        if (first && macro.category === "expression" && first.type === "ExpressionStatement") {
            return (first as any).expression;
        }

        return first;
    }
}

export const macroDictionary = new MacroDictionary();
