export type Node =
    | Program
    | VariableDeclaration
    | VariableDeclarator
    | Identifier
    | Literal
    | ArrayExpression
    | ImportDeclaration
    | ImportSpecifier
    | ImportDefaultSpecifier
    | ExportDefaultDeclaration
    | ExportNamedDeclaration
    | ArrowFunctionExpression
    | CallExpression
    | MemberExpression
    | JSXElement
    | JSXOpeningElement
    | JSXAttribute
    | JSXExpressionContainer
    | JSXText
    | ObjectExpression
    | Property
    | NewExpression
    | ExpressionStatement
    | BlockStatement
    | FunctionExpression
    | FunctionDeclaration
    | ReturnStatement
    | BinaryExpression
    | LogicalExpression
    | UnaryExpression
    | ObjectPattern
    | ArrayPattern
    | AssignmentPattern
    | RestElement;

export interface Program {
    type: "Program";
    body: Node[];
}
export interface VariableDeclaration {
    type: "VariableDeclaration";
    declarations: VariableDeclarator[];
    kind: string;
}
export interface VariableDeclarator {
    type: "VariableDeclarator";
    id: Node; // Support Patterns
    init: Node | null;
}
export interface Identifier {
    type: "Identifier";
    name: string;
}
export interface Literal {
    type: "Literal";
    value: string | number | boolean | null;
    regex?: { pattern: string; flags: string };
    bigint?: string;
}
export interface ArrayExpression {
    type: "ArrayExpression";
    elements: Node[];
}
export interface ImportDeclaration {
    type: "ImportDeclaration";
    specifiers: Node[];
    source: Literal;
}
export interface ImportSpecifier {
    type: "ImportSpecifier";
    imported: Identifier;
}
export interface ImportDefaultSpecifier {
    type: "ImportDefaultSpecifier";
    local: Identifier;
}
export interface ExportDefaultDeclaration {
    type: "ExportDefaultDeclaration";
    declaration: Node;
}
export interface ExportNamedDeclaration {
    type: "ExportNamedDeclaration";
    declaration: Node | null;
    specifiers: any[];
}
export interface ArrowFunctionExpression {
    type: "ArrowFunctionExpression";
    params: Node[];
    body: Node;
}
export interface CallExpression {
    type: "CallExpression";
    callee: Node;
    arguments: Node[];
}
export interface MemberExpression {
    type: "MemberExpression";
    object: Node;
    property: Node;
    computed: boolean;
}
export interface JSXElement {
    type: "JSXElement";
    openingElement: JSXOpeningElement;
    children: Node[];
}
export interface JSXOpeningElement {
    type: "JSXOpeningElement";
    name: Identifier;
    attributes: JSXAttribute[];
}
export interface JSXAttribute {
    type: "JSXAttribute";
    name: Identifier;
    value: Literal | JSXExpressionContainer;
}
export interface JSXExpressionContainer {
    type: "JSXExpressionContainer";
    expression: Node;
}
export interface JSXText {
    type: "JSXText";
    value: string;
}
export interface ObjectExpression {
    type: "ObjectExpression";
    properties: Property[];
}
export interface Property {
    type: "Property";
    key: Identifier | Literal;
    value: Node;
    kind: "init";
    computed: boolean;
}
export interface NewExpression {
    type: "NewExpression";
    callee: Node;
    arguments: Node[];
}
export interface ExpressionStatement {
    type: "ExpressionStatement";
    expression: Node;
}
export interface BlockStatement {
    type: "BlockStatement";
    body: Node[];
}
export interface FunctionExpression {
    type: "FunctionExpression";
    id: Identifier | null;
    params: Node[];
    body: BlockStatement;
}
export interface FunctionDeclaration {
    type: "FunctionDeclaration";
    id: Identifier;
    params: Node[];
    body: BlockStatement;
}
export interface ReturnStatement {
    type: "ReturnStatement";
    argument: Node | null;
}
export interface BinaryExpression {
    type: "BinaryExpression";
    operator: string;
    left: Node;
    right: Node;
}
export interface LogicalExpression {
    type: "LogicalExpression";
    operator: string;
    left: Node;
    right: Node;
}
export interface UnaryExpression {
    type: "UnaryExpression";
    operator: string;
    prefix: boolean;
    argument: Node;
}
export interface ObjectPattern {
    type: "ObjectPattern";
    properties: any[];
}
export interface ArrayPattern {
    type: "ArrayPattern";
    elements: Node[];
}
export interface AssignmentPattern {
    type: "AssignmentPattern";
    left: Node;
    right: Node;
}
export interface RestElement {
    type: "RestElement";
    argument: Node;
}
