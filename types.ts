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
    | ImportNamespaceSpecifier
    | ExportDefaultDeclaration
    | ExportNamedDeclaration
    | ExportAllDeclaration
    | ArrowFunctionExpression
    | CallExpression
    | MemberExpression
    | ChainExpression
    | JSXElement
    | JSXOpeningElement
    | JSXClosingElement
    | JSXAttribute
    | JSXExpressionContainer
    | JSXText
    | JSXIdentifier
    | JSXMemberExpression
    | JSXFragment
    | JSXOpeningFragment
    | JSXClosingFragment
    | ObjectExpression
    | Property
    | SpreadElement
    | NewExpression
    | ExpressionStatement
    | BlockStatement
    | FunctionExpression
    | FunctionDeclaration
    | ReturnStatement
    | IfStatement
    | ForOfStatement
    | ForInStatement
    | ForStatement
    | WhileStatement
    | DoWhileStatement
    | TryStatement
    | CatchClause
    | ThrowStatement
    | SwitchStatement
    | SwitchCase
    | BreakStatement
    | ContinueStatement
    | EmptyStatement
    | ClassDeclaration
    | ClassExpression
    | ClassBody
    | MethodDefinition
    | PropertyDefinition
    | ClassProperty
    | ClassMethod
    | OptionalCallExpression
    | OptionalMemberExpression
    | ThisExpression
    | Super
    | BinaryExpression
    | LogicalExpression
    | AssignmentExpression
    | UnaryExpression
    | UpdateExpression
    | ConditionalExpression
    | SequenceExpression
    | AwaitExpression
    | TemplateLiteral
    | TemplateElement
    | TaggedTemplateExpression
    | ObjectPattern
    | ArrayPattern
    | AssignmentPattern
    | RestElement
    | CodonTrainExpression
    | CodonFoldExpression
    | CodonRankExpression;

export interface Program {
    type: "Program";
    body: Node[];
    sourceType?: "module" | "script";
}

export interface VariableDeclaration {
    type: "VariableDeclaration";
    declarations: VariableDeclarator[];
    kind: "const" | "let" | "var";
}

export interface VariableDeclarator {
    type: "VariableDeclarator";
    id: Node;
    init: Node | null;
}

export interface Identifier {
    type: "Identifier";
    name: string;
}

export interface Literal {
    type: "Literal";
    value: string | number | boolean | null | RegExp;
    raw?: string;
    regex?: { pattern: string; flags: string };
    bigint?: string;
}

export interface ArrayExpression {
    type: "ArrayExpression";
    elements: (Node | null)[];
}

export interface ImportDeclaration {
    type: "ImportDeclaration";
    specifiers: (ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier)[];
    source: Literal;
}

export interface ImportSpecifier {
    type: "ImportSpecifier";
    imported: Identifier;
    local?: Identifier;
}

export interface ImportDefaultSpecifier {
    type: "ImportDefaultSpecifier";
    local: Identifier;
}

export interface ImportNamespaceSpecifier {
    type: "ImportNamespaceSpecifier";
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
    source?: Literal | null;
}

export interface ExportAllDeclaration {
    type: "ExportAllDeclaration";
    source: Literal;
}

export interface ArrowFunctionExpression {
    type: "ArrowFunctionExpression";
    params: Node[];
    body: Node;
    async?: boolean;
    expression?: boolean;
}

export interface CallExpression {
    type: "CallExpression";
    callee: Node;
    arguments: Node[];
    optional?: boolean;
}

export interface MemberExpression {
    type: "MemberExpression";
    object: Node;
    property: Node;
    computed: boolean;
    optional?: boolean;
}

export interface ChainExpression {
    type: "ChainExpression";
    expression: CallExpression | MemberExpression;
}

export interface JSXElement {
    type: "JSXElement";
    openingElement: JSXOpeningElement;
    closingElement?: JSXClosingElement | null;
    children: Node[];
}

export interface JSXOpeningElement {
    type: "JSXOpeningElement";
    name: JSXIdentifier | JSXMemberExpression;
    attributes: (JSXAttribute | SpreadElement)[];
    selfClosing?: boolean;
}

export interface JSXClosingElement {
    type: "JSXClosingElement";
    name: JSXIdentifier | JSXMemberExpression;
}

export interface JSXAttribute {
    type: "JSXAttribute";
    name: JSXIdentifier;
    value: Literal | JSXExpressionContainer | null;
}

export interface JSXExpressionContainer {
    type: "JSXExpressionContainer";
    expression: Node;
}

export interface JSXText {
    type: "JSXText";
    value: string;
    raw?: string;
}

export interface JSXIdentifier {
    type: "JSXIdentifier";
    name: string;
}

export interface JSXMemberExpression {
    type: "JSXMemberExpression";
    object: JSXMemberExpression | JSXIdentifier;
    property: JSXIdentifier;
}

export interface JSXFragment {
    type: "JSXFragment";
    openingFragment: JSXOpeningFragment;
    closingFragment: JSXClosingFragment;
    children: Node[];
}

export interface JSXOpeningFragment {
    type: "JSXOpeningFragment";
}

export interface JSXClosingFragment {
    type: "JSXClosingFragment";
}

export interface ObjectExpression {
    type: "ObjectExpression";
    properties: (Property | SpreadElement)[];
}

export interface Property {
    type: "Property";
    key: Identifier | Literal | Node;
    value: Node;
    kind: "init" | "get" | "set";
    computed: boolean;
    method?: boolean;
    shorthand?: boolean;
}

export interface SpreadElement {
    type: "SpreadElement";
    argument: Node;
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
    async?: boolean;
    generator?: boolean;
}

export interface FunctionDeclaration {
    type: "FunctionDeclaration";
    id: Identifier | null;
    params: Node[];
    body: BlockStatement;
    async?: boolean;
    generator?: boolean;
}

export interface ReturnStatement {
    type: "ReturnStatement";
    argument: Node | null;
}

export interface IfStatement {
    type: "IfStatement";
    test: Node;
    consequent: Node;
    alternate: Node | null;
}

export interface ForOfStatement {
    type: "ForOfStatement";
    left: VariableDeclaration | Node;
    right: Node;
    body: Node;
    await?: boolean;
}

export interface ForInStatement {
    type: "ForInStatement";
    left: VariableDeclaration | Node;
    right: Node;
    body: Node;
}

export interface ForStatement {
    type: "ForStatement";
    init: VariableDeclaration | Node | null;
    test: Node | null;
    update: Node | null;
    body: Node;
}

export interface WhileStatement {
    type: "WhileStatement";
    test: Node;
    body: Node;
}

export interface DoWhileStatement {
    type: "DoWhileStatement";
    body: Node;
    test: Node;
}

export interface TryStatement {
    type: "TryStatement";
    block: BlockStatement;
    handler: CatchClause | null;
    finalizer: BlockStatement | null;
}

export interface CatchClause {
    type: "CatchClause";
    param: Node | null;
    body: BlockStatement;
}

export interface ThrowStatement {
    type: "ThrowStatement";
    argument: Node;
}

export interface SwitchStatement {
    type: "SwitchStatement";
    discriminant: Node;
    cases: SwitchCase[];
}

export interface SwitchCase {
    type: "SwitchCase";
    test: Node | null;
    consequent: Node[];
}

export interface BreakStatement {
    type: "BreakStatement";
    label?: Identifier | null;
}

export interface ContinueStatement {
    type: "ContinueStatement";
    label?: Identifier | null;
}

export interface EmptyStatement {
    type: "EmptyStatement";
}

export interface ClassDeclaration {
    type: "ClassDeclaration";
    id: Identifier | null;
    superClass: Node | null;
    body: ClassBody;
}

export interface ClassExpression {
    type: "ClassExpression";
    id: Identifier | null;
    superClass: Node | null;
    body: ClassBody;
}

export interface ClassBody {
    type: "ClassBody";
    body: (MethodDefinition | PropertyDefinition)[];
}

export interface MethodDefinition {
    type: "MethodDefinition";
    key: Identifier | Literal | Node;
    value: FunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: boolean;
}

export interface PropertyDefinition {
    type: "PropertyDefinition";
    key: Identifier | Literal | Node;
    value: Node | null;
    computed: boolean;
    static: boolean;
}

export interface ClassProperty {
    type: "ClassProperty";
    key: Identifier | Literal | Node;
    value: Node | null;
    computed?: boolean;
    static?: boolean;
}

export interface ClassMethod {
    type: "ClassMethod";
    key: Identifier | Literal | Node;
    value?: FunctionExpression;
    params?: Node[];
    body?: BlockStatement;
    kind?: "constructor" | "method" | "get" | "set";
    computed?: boolean;
    static?: boolean;
    async?: boolean;
}

export interface OptionalCallExpression {
    type: "OptionalCallExpression";
    callee: Node;
    arguments: Node[];
    optional?: boolean;
}

export interface OptionalMemberExpression {
    type: "OptionalMemberExpression";
    object: Node;
    property: Node;
    computed?: boolean;
    optional?: boolean;
}

export interface ThisExpression {
    type: "ThisExpression";
}

export interface Super {
    type: "Super";
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

export interface AssignmentExpression {
    type: "AssignmentExpression";
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

export interface UpdateExpression {
    type: "UpdateExpression";
    operator: "++" | "--";
    argument: Node;
    prefix: boolean;
}

export interface ConditionalExpression {
    type: "ConditionalExpression";
    test: Node;
    consequent: Node;
    alternate: Node;
}

export interface SequenceExpression {
    type: "SequenceExpression";
    expressions: Node[];
}

export interface AwaitExpression {
    type: "AwaitExpression";
    argument: Node;
}

export interface TemplateLiteral {
    type: "TemplateLiteral";
    quasis: TemplateElement[];
    expressions: Node[];
}

export interface TemplateElement {
    type: "TemplateElement";
    value: { raw: string; cooked?: string };
    tail: boolean;
}

export interface TaggedTemplateExpression {
    type: "TaggedTemplateExpression";
    tag: Node;
    quasi: TemplateLiteral;
}

export interface ObjectPattern {
    type: "ObjectPattern";
    properties: (Property | RestElement)[];
}

export interface ArrayPattern {
    type: "ArrayPattern";
    elements: (Node | null)[];
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

// Codon Specific AST extensions
export interface CodonTrainExpression {
    type: "CodonTrainExpression";
    kind: "fork" | "hook";
    verbs: Node[];
}

export interface CodonFoldExpression {
    type: "CodonFoldExpression";
    verb: Node;
    target: Node;
    scan?: boolean;
}

export interface CodonRankExpression {
    type: "CodonRankExpression";
    verb: Node;
    rank: number | string;
    target: Node;
}
