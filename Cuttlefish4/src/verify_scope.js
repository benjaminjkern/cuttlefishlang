const ASTNodeVerifications = {
    Program: (node, scope = { vars: {}, patterns: {} }) => {
        let prevScope = scope;
        for (const statement of node.statements) {
            prevScope = verify(statement, prevScope) || prevScope;
        }
        if (prevScope.callback) {
            const { callback, ...withoutCallback } = prevScope;
            prevScope = withoutCallback;
            callback.filter(c => c).forEach(callbackFn => callbackFn(prevScope));
        }
        return prevScope;
    },
    Assignment: (node, scope) => {
        let prevScope = scope;
        let addedVars = {};
        for (const assignment of node.assignments) {
            if (addedVars[assignment.assignee]) throw "Cannot set the same var twice!";
            addedVars[assignment.assignee] = true;
            prevScope = verify(assignment, prevScope) || prevScope;
        }
        return prevScope;
    },
    SingleAssignment: (node, scope) => {
        return {...verify(node.value, scope),
            vars: {...scope.vars, [node.assignee]: true },
        };
    },
    Reassignment: (node, scope) => {
        verify(node.assignee, scope);
        return verify(node.value, scope);
    },
    Print: (node, scope) => {
        return verify(node.value, scope);
    },
    If: (node, scope) => {
        verify(node.ifTrue, scope);
        verify(node.ifFalse, scope);
        return verify(node.test, scope);
    },
    Switch: (node, scope) => {
        verify(node.patterns, scope);
        return verify(node.object, scope);
    },
    Catch: (node, scope) => {
        verify(node.patterns, scope);
    },
    For: (node, scope) => {
        verify(node.patterns, {...scope, loopCount: scope.loopCount ? scope.loopCount + 1 : 1 });
        return verify(node.collection, scope);
    },
    While: (node, scope) => {
        verify(node.statements, {...scope, loopCount: scope.loopCount ? scope.loopCount + 1 : 1 });
        return scope;
    },
    Repeat: (node, scope) => {
        if (node.count) verify(node.count, scope);
        verify(node.statements, {...scope, loopCount: scope.loopCount ? scope.loopCount + 1 : 1 });
        return scope;
    },
    Put: (node, scope) => {
        return verify(node.value, scope);
    },
    Return: (node, scope) => {
        if (!scope.inFunction) throw "AST Error: Can only return from inside of a method!";
        return verify(node.value, scope);
    },
    Break: (node, scope) => {
        if (!scope.loopCount) throw "AST Error: Can only break from inside of a loop!";
    },
    Continue: (node, scope) => {
        if (!scope.loopCount) throw "AST Error: Can only continue from inside of a loop!";
    },



    // pattern matching
    PatternBlock: (node, scope) => {
        node.patterns.forEach(pattern => verify(pattern, {...scope, inPattern: true }));
    },
    Pattern: (node, scope) => {
        const pscope = node.input.reduce((passScope, patternelem) => verify(patternelem, passScope), scope);
        verify(node.output, pscope);
        return node.tests.reduce((passScope, test) => verify(test, passScope), pscope);
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



    // pre-defined objects
    List: (node, scope) => {
        return node.values.reduce((pScope, n) => verify(n, pScope), scope);
    },
    Tuple: (node, scope) => {
        return node.values.reduce((pScope, n) => verify(n, pScope), scope);
    },
    Set: (node, scope) => {
        return node.values.reduce((pScope, n) => verify(n, pScope), scope);
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
                verify(node.patterns, {...callbackScope, inFunction: true, loopCount: 0 });
            }]
        }
    },
    Process: (node, scope) => {
        return {...scope,
            callback: [...(scope.callback || []), (callbackScope) => {
                verify(node.patterns, {...callbackScope, inFunction: true, loopCount: 0 });
            }]
        }
    },
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
    UnparsedExp: (node, scope) => {
        return node.atoms.reduce((pScope, n) => verify(n, pScope), scope);
    }
}

const verify = (node, scope) => {
    if (!node) return scope;
    if (node.ASTType) return ASTNodeVerifications[node.ASTType](node, scope);
    if (typeof node !== 'string') throw "Received node without ASTType! This shouldn't have happened!";

    if (scope.vars[node] || (scope.inPattern && node === "$") || findVar(scope.patterns, node)) return scope;
    throw `AST Error: ID ${node} not found`;
}

const BASE_SCOPE = { vars: require('./default_vars'), patterns: require('./default_patterns') };

const findVar = (patterns, id) => {
    for (const type of Object.keys(patterns)) {
        for (const pattern of patterns[type]) {
            if (pattern.pattern.includes(id)) return true;
        }
    }
    return false;
}

const makeAST = require("./make_AST");

module.exports = input => {
    if (typeof input === 'string')
        return verify(makeAST(input), BASE_SCOPE);
    if (typeof input === 'object')
        return verify(input, BASE_SCOPE);
    throw "Error: Please only give me a script or an AST";
}

require('./run_file')(module);