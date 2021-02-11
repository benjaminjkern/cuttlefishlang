// This is assuming that everything has been verified already

const getTypes = {
    Ternary: (node, scope) => {
        const trueType = getType(node.ifTrue, scope);
        const falseType = getType(node.ifFalse, scope);
        if (matches(trueType, falseType)) return falseType;
        if (matches(falseType, trueType)) return trueType;
        throw "Mismatching types: I should make it return a compound type here but whatever";
    },
    BinaryOp: (node, scope) => {

        return [node.left, node.right].reduce((pScope, n) => verify(n, pScope), scope);
    },
    Application: (node, scope) => {

        return [node.func, ...node.input].reduce((pScope, n) => verify(n, pScope), scope);
    },
    List: (node, scope) => {
        return node.values.reduce((pScope, n) => verify(n, pScope), scope);
    },
    Tuple: (node, scope) => {
        return node.values.reduce((pScope, n) => verify(n, pScope), scope);
    },
    Set: (node, scope) => {
        return node.values.reduce((pScope, n) => verify(n, pScope), scope);
    },
    Map: (node, scope) => {
        node.patterns.forEach(pattern => verify(pattern, scope));
        return scope;
    },
    DiscreteRange: (node, scope) => {
        return [node.values, node.end, node.step].reduce((pScope, n) => verify(n, pScope), scope);
    },
    ContinuousRange: (node, scope) => {
        return [node.values, node.end].reduce((pScope, n) => verify(n, pScope), scope);
    },
    Function: (node, scope) => {
        return {...scope,
            callback: [...(scope.callback || []), (callbackScope) => {
                node.patterns.forEach(pattern => verify(pattern, {...callbackScope, inFunction: true, loopCount: 0 }));
                verify(node.output, {...callbackScope, inFunction: true, loopCount: 0 });
            }]
        }
    },
    Process: (node, scope) => {
        return {...scope,
            callback: [...(scope.callback || []), (callbackScope) => {
                node.patterns.forEach(pattern => verify(pattern, {...callbackScope, inFunction: true, loopCount: 0 }));
                verify(node.output, {...callbackScope, inFunction: true, loopCount: 0 });
            }]
        }
    },
    Pattern: (node, scope) => {
        const pscope = node.input.reduce((passScope, patternelem) => verify(patternelem, passScope), scope);
        node.cases.forEach(pcase => verify(pcase, pscope));
        verify(node.output, pscope);
        return scope;
    },
    Case: (node, scope) => {
        node.cases.forEach(pcase => verify(pcase, scope));
        verify(node.output, scope);
        return verify(node.test, scope);
    },
    PatternElem: (node, scope) => {
        let newScope = scope;
        if (node.type) newScope = verify(node.type, scope);
        if (node.default) newScope = verify(node.default, scope);
        return {...newScope,
            vars: {...scope.vars, [node.id]: true }
        }
    },
    ListType: (node, scope) => verify(node.type, scope),
    Bool: (node, scope) => {
        if (![true, false].includes(node.value)) throw "AST Error: Received Number ASTNode with non-Number value";
        return scope;
    },
    Num: (node, scope) => {
        if (Number.isNaN(node.value)) throw "AST Error: Received Number ASTNode with non-Number value";
        return scope;
    },
    String: (node, scope) => {
        if (typeof node.value !== 'string') throw "AST Error: Received String ASTNode with non-String value";
        return scope;
    },
    Concat: (node, scope) => {
        node.strings.forEach(string => verify(string, scope));
        return scope;
    },
    ElementOf: (node, scope) => {
        verify(node.parent, scope);
        verify(node.childId, scope);
        return scope;
    },
    Ref: (node, scope) => {
        if ((scope.vars && scope.vars[node.id]) || BASE_SCOPE[node.id]) return scope;
        throw `AST Error: ID ${node.id} not found`;
    }
}

const BINARY_OPS = require("./default_ops");
const { BASE_SCOPE } = require("./default_scope");

const getType = (node, scope) => {

}

const matches = (subtype, supertype) => true;