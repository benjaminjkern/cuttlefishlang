const ASTNodeVerifications = {
    Program: (node, scope = {}) => node.statements.reduce((pscope, statement) => verify(statement, pscope), scope),
    Assignment: (node, scope) => node.assignments.reduce((ascope, assignment) => verify(assignment, scope), scope),
    SingleAssignment: (node, scope) => {
        verify(node.value, scope);
        if (node.assignee.ASTType == 'ElementOf') {
            verify(node.assignee.parent, scope);
            verify(node.assignee.childId, scope);
            return scope;
        } else if (node.assignee.ASTType == 'Ref') {
            return {...scope,
                [node.assignee.id]: {}
            };
        }
        throw new Error("ASTError: SingleAssignments can only be ElementOf or Ref! Received: " + )
    },
    Reassignment: (node, scope) => {
        verify(node.assignee, scope);
        verify(node.value, scope);
        return scope;
    },
    Print: (node, scope) => {
        verify(node.value, scope);
        return scope;
    },
    If: (node, scope) => {
        verify(node.test, scope);
        verify(node.ifTrue, scope);
        verify(node.ifFalse, scope);
        return scope;
    },
    Catch: (node, scope) => {
        node.patterns.forEach((pattern) => verify(pattern, scope));
        return scope;
    },
    While: (node, scope) => {
        verify(node.test, scope);
        node.statements.reduce((pscope, statement) => verify(statement, pscope), scope);
        return scope;
    },
    Repeat: (node, scope) => {
        node.statements.reduce((pscope, statement) => verify(statement, pscope), scope);
        return scope;
    },
    For: (node, scope) => {
        verify(node.collection);
        node.patterns.forEach((pattern) => verify(pattern, scope));
        return scope;
    },
    Return: (node, scope) => {
        verify(node.value, scope);
        return scope;
    },
    Put: (node, scope) => {
        verify(node.value, scope);
        return scope;
    },
    Break: (node, scope) => scope,
    Continue: (node, scope) => scope,

    Ternary: (node, scope) => {
        verify(node.test, scope);
        verify(node.ifTrue, scope);
        verify(node.ifFalse, scope);
        return scope;
    },
    BinaryOp: (node, scope) => {
        verify(node.left, scope);
        verify(node.right, scope);
        return scope;
    },
    Application: (node, scope) => {
        verify(node.func, scope);
        verify(node.input, scope);
        return scope;
    },
    List: (node, scope) => {
        node.values.forEach(value => verify(value, scope));
        return scope;
    },
    Tuple: (node, scope) => {
        node.values.forEach(value => verify(value, scope));
        return scope;
    },
    Set: (node, scope) => {
        node.values.forEach(value => verify(value, scope));
        return scope;
    },
    Map: (node, scope) => {
        node.patterns.forEach(pattern => verify(pattern, scope));
        return scope;
    },
    DiscreteRange: (node, scope) => {
        verify(node.start, scope);
        verify(node.end, scope);
        verify(node.step, scope);
        return scope;
    },
    ContinuousRange: (node, scope) => {
        verify(node.start, scope);
        verify(node.end, scope);
        return scope;
    },
    Function: (node, scope) => {
        node.patterns.forEach(pattern => verify(pattern, scope));
        node.output.reduce((pscope, statement) => verify(statement, pscope), scope);
        return scope;
    },
    Process: (node, scope) => {
        node.patterns.forEach(pattern => verify(pattern, scope));
        node.output.reduce((pscope, statement) => verify(statement, pscope), scope);
        return scope;
    },
    Pattern: (node, scope) => {
        const pscope = node.input.reduce((passScope, patternelem) => verify(patternelem, scope), scope);
        node.cases.forEach(pcase => verify(pcase, pscope));
        node.output.reduce((sscope, statement) => verify(statement, sscope), pscope);
        return scope;
    },
    Case: ["test", "cases", "output"],
    PatternElem: ["id", "type", "optional", "multiple", "default"],
    ListType: ["type"],

    Bool: ["value"],
    Num: ["value"],
    String: ["value"],
    ExpressionString: ["strings", "expressions"],

    ElementOf: ["parent", "childId"],
    Ref: ["id"],
}

const verify = (node, scope) => node.ASTType ? ASTNodeVerifications[node.ASTType](node, scope) : scope;