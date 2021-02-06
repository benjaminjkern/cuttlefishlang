const { Types, Ops } = require("./default_types");

const ASTNodeTypeChecks = {
    Program: (node, scope = {}) => {},
    Assignment: (node, scope) => {},
    SingleAssignment: (node, scope) => {},
    Reassignment: (node, scope) => {},
    Print: (node, scope) => {},
    If: (node, scope) => {},
    Catch: (node, scope) => {},
    While: (node, scope) => {},
    Repeat: (node, scope) => {},
    For: (node, scope) => {},
    Put: (node, scope) => {},
    Return: (node, scope) => {},
    Break: (node, scope) => {},
    Continue: (node, scope) => {},

    Ternary: (node, scope) => {
        verifyType(node.test, "Bool", scope);
        return largestSuperType(scope, node.ifTrue, node.ifFalse);
    },
    BinaryOp: (node, scope) => {
        if (!Ops[node.op]) throw `Unrecognized operation: ${node.op}`
        for (const pattern of Ops[node.op]) {
            try {
                verifyType(node.left, pattern.left, scope);
                verifyType(node.right, pattern.right, scope);
            } catch (e) {}
            return pattern.returns;
        }
        throw "Did not match any patterns";
    },
    Application: (node, scope) => {
        verifyType(node.func, { type: "Function", input: { id: "A" }, output: { id: "B" } }, scope);
        verifyType(node.input[0], { id: "A" }, scope);
    },
    List: (node, scope) => ({ type: "List", listType: largestSuperType(scope, ...node.values) }),
    Tuple: (node, scope) => ({ type: "Tuple", values: node.values.map(value => getType(value, scope)) }),
    Set: (node, scope) => ({ type: "Set", listType: largestSuperType(scope, ...node.values) }),
    Map: (node, scope) => {},
    DiscreteRange: (node, scope) => {},
    ContinuousRange: (node, scope) => {},
    Function: (node, scope) => ({ type: "Function", input: largestSuperType() }),
    Process: (node, scope) => {},
    Pattern: (node, scope) => {},
    Case: (node, scope) => {},
    PatternElem: (node, scope) => {},
    ListType: (node, scope) => verify(node.type, scope),
    Bool: (node, scope) => "Bool",
    Num: (node, scope) => {
        if (node.value === Math.floor(node.value)) return "Int";
        return "Num";
    },
    String: (node, scope) => "String",
    Concat: (node, scope) => "String",
    ElementOf: (node, scope) => {
        verify(node.parent, scope);
        verify(node.childId, scope);
        return scope;
    },
    Ref: (node, scope) => {
        if (scope[node.id]) return scope[node.id];
        if (BASE_SCOPE[node.id]) return BASE_SCOPE[node.id];
        throw `AST Error: ID ${node.id} not found`;
    }
}

const getType = (node, scope) => {
    if (!node) return undefined;
    if (!node.ASTType) throw "cannot verify node without ASTType!";
    return ASTNodeTypeChecks[node.ASTType](node, scope);
}

const verifyType = (node, expected, scope) => {
    if (!node || !expected) return true;
    if (!node.ASTType) throw "Cannot verify node without ASTType!";

    const type = getType(node, scope);

    if (!matches(type, expected)) return true;
    throw `Type ${type} did not match Type $`
}

const matches = (type, expected) => {
    if (typeof type === 'string') type = { type };
    if (typeof expected === 'string') expected = { type: expected };

    if (type.type === expected.type) return true;
    const subtypes = getSubtypes(expected);
    if (subtypes.some(subtype => matches(type, subtype))) return true;

    return false;
}

const getSubtypes = (type) => {
    if (!Types[type.type]) throw `Type ${type.type} is not recognized`;
    if (Types[type.type].subtypes)
}

const makeAST = require("./make_AST");

const BASE_SCOPE = { Int: "Type", Num: "Type", Bool: "Type", String: "Type", true: "Bool", false: "Bool" };

module.exports = text => verify(makeAST(text), {});

require('./run_file')(module);


const getType = (node, scope) => {

}