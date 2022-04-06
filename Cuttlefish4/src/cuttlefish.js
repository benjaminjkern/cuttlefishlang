require('colors');

const ASTNodeEvals = {
    Program: (node, scope) => {
        const vars = Object.keys(scope.vars);
        for (const statement of node.statements) {
            if (new Date().getTime() > scope.endTime) {
                scope.error = "Timeout";
                return;
            }
            evaluate(statement, scope);
            if (scope.return || scope.break || scope.continue || scope.error) break;
        }
        // purge any in-scope variables - need to fix
        // scope.vars = Object.keys(scope.vars).filter(v => vars[v]).reduce((p, c) => ({...p, [c]: vars[c] }), {});
    },
    Assignment: (node, scope) => {
        // explicitly de-reference the vars so that you don't rewrite it
        let prevScope = {...scope, vars: {...scope.vars } };

        for (const assignment of node.assignments) {
            const value = evaluate(assignment, prevScope);
            if (!isOfType(value, "Method")) scope.vars = {...scope.vars, [assignment.assignee]: value };
            else {
                const returnType = "Int";
                const inputType = "Object";
                scope.patterns[returnType].push({
                    pattern: [assignment.assignee, { type: inputType }],
                    evaluate: (input) => {
                        const oldArg = scope.vars.$
                        scope.vars.$ = input || { type: "Undefined" };
                        const val = evaluate(value.patterns, scope);
                        scope.vars.$ = oldArg || { type: "Undefined" };
                        return val;
                    },
                })
            }
        }
    },
    SingleAssignment: (node, scope) => {
        // need to do type check in parser
        // console.log(evaluate(node.value, scope));

        // console.log(node.value);
        return evaluate(node.value, scope);
    },
    Reassignment: (node, scope) => {
        //need to fix
        scope.vars = {...scope.vars, [node.assignee]: evaluate({ ASTType: "UnparsedExp", atoms: [node.assignee, node.op, node.value] }, scope) };
    },
    Print: (node, scope) => {
        // need to do type check
        // need to abstract this to a toString method
        print(evaluate(node.value, scope));
    },
    If: (node, scope) => {
        // type check
        // console.log(scope.vars);
        if (evaluate(node.test, scope, "Bool").value)
            evaluate(node.ifTrue, scope);
        else evaluate(node.ifFalse, scope);
    },
    Switch: (node, scope) => {

    },
    Catch: (node, scope) => {
        if (scope.error) {
            const oldArg = scope.vars.$;
            scope.vars.$ = scope.error || { type: "Undefined" };
            evaluate(node.patterns, scope);
            scope.error = undefined;
            scope.vars.$ = oldArg || { type: "Undefined" };
        }
    },
    For: (node, scope) => {
        // typecheck for iterable
        let iterator = evaluate(node.collection, scope);
        if (iterator.type === "List") iterator = makeIterator(iterator);
        const oldArg = scope.vars.$;
        while (iterator.hasNext) {
            scope.vars.$ = deepCopy(iterator.next().current) || { type: "Undefined" };
            evaluate(node.patterns, scope);
            if (scope.break || scope.return || scope.error) break;
        }
        scope.break = false;
        scope.vars.$ = oldArg || { type: "Undefined" };
    },
    While: (node, scope) => {
        while (evaluate(node.test, {...scope, expectedType: "Bool" }).value) {
            evaluate(node.statements, scope);
            if (scope.break || scope.return || scope.error) break;
        }
        scope.break = false;
    },
    Repeat: (node, scope) => {
        const count = evaluate(node.count, {...scope, expectedType: "Int" }) || { value: -1 };
        let i = count.value;
        // type check int greater than 0
        while (i !== 0) {
            evaluate(node.statements, scope);
            if (scope.break) break;
            if (scope.return) return scope.put[scope.put.length - 1];
            i--;
        }
    },
    Put: (node, scope) => {
        const value = evaluate(node.value, scope);
        if (scope.put)
            scope.put.push(value);
        else scope.put = [value];
    },
    Return: (node, scope) => {
        if (node.value) {
            const value = evaluate(node.value, scope);
            if (scope.put)
                scope.put.push(value);
            else scope.put = [value];
        }
        scope.return = true;
    },
    Break: (node, scope) => {
        scope.break = true;
    },
    Continue: (node, scope) => {
        scope.continue = true;
    },

    UnparsedExp: (node, scope) => {
        const evaluatedAtoms = node.atoms.map(atom => evaluate(atom, scope));
        const exp = parseExpression(evaluatedAtoms, scope);

        if (exp.error) {
            throw exp.error;
        }

        return evaluateExpression(exp);
    },

    List: (node, scope) => {
        // need to do type check
        return { type: "List", values: node.values.map(value => evaluate(value, scope)) };
    },
    Tuple: (node, scope) => {
        return { type: "Tuple", values: node.values.map(value => evaluate(value, scope)) };
    },
    Set: (node, scope) => {
        return {
            type: "Set",
            values: node.values.reduce((set, value) => {
                const evaluated = evaluate(value, scope);
                return {...set, [hash(evaluated)]: evaluated }
            }, {})
        };
    },
    DiscreteRange: (node, scope) => {
        const start = evaluate(node.start, scope, "Num");
        const step = evaluate(node.step, scope, "Num") || { type: "Int", value: 1 };
        const end = evaluate(node.end, scope, "Num") || { type: "Int", value: Number.MAX_SAFE_INTEGER };

        if (end.value === start.value || step.value === 0) throw "UHHHH I CAN PROBABLY MAKE THIS WORK AT SOME POINT";

        const iterator = {
            type: "Iterable",
            next() {
                if (!this.hasNext) {
                    console.log("Does not have a next!");
                    return;
                }
                if (!this.current) { // this might be able to be cleaned up
                    this.current = start;
                    if (!node.includeStart) this.current.value += step.value;
                } else this.current.value += step.value;
                this.hasNext = node.includeEnd ? (this.current.value + step.value) * step.value <= step.value * end.value : (this.current.value + step.value) * step.value < step.value * end.value;
                return { current: this.current, hasNext: this.hasNext };
            }
        };

        if (node.includeStart) iterator.hasNext = true;
        else if ((end.value - start.value) * step.value < 0)
            iterator.hasNext = false;
        else iterator.hasNext = node.includeEnd ? (start.value + step.value) * step.value <= step.value * end.value : (start.value + step.value) * step.value < step.value * end.value;

        return iterator;
    },
    ContinuousRange: (node, scope) => {
        return {
            type: "Testable",
            test: value => {
                // this can be shrunk
                if (node.start) {
                    if (node.includeStart && value.value < evaluate(node.start, scope).value)
                        return false;
                    if (!node.includeStart && value.value <= evaluate(node.start, scope).value)
                        return false;
                }

                if (node.end) {
                    if (node.includeEnd && value.value > evaluate(node.end, scope).value)
                        return false;
                    if (!node.includeEnd && value.value >= evaluate(node.end, scope).value)
                        return false;
                }

                return true;
            }
        }
    },
    Function: (node, scope) => {
        return { type: "Function", patterns: node.patterns };
    },
    Process: (node, scope) => {
        return { type: "Process", patterns: node.patterns };
    },
    PatternBlock: (node, scope) => {
        for (const pattern of node.patterns) {
            const pscope = deepCopy(scope);
            // console.log(inspect(scope, true));
            const evaluated = pattern.input.every(input => input.ASTType === 'PatternElem' ?
                evaluate(input, pscope) :
                deepEquals(pscope.vars.$, evaluate(input, pscope)));
            // console.log(scope.vars);
            if (!pattern.input.length || (evaluated && pattern.tests.every(test => {
                    const result = evaluate(test, {...pscope, expectedType: "Bool" }).value;
                    // console.log(test, result);
                    return result;
                }))) {
                scope.vars = pscope.vars;
                evaluate(pattern, scope);
                if (scope.put && scope.put.length)
                    return scope.put.shift();
                return { type: "Undefined" }
            }
        }
        scope.error = { type: "PatternMatchException", message: `Argument ${inspect(scope.vars.$)} did not match any pattern` };
    },
    Pattern: (node, scope) => {
        evaluate(node.output, scope);
    },
    PatternElem: (node, scope) => {
        // const type = evaluate(node.type, scope);
        // const default = evaluate(node.default, scope);
        // TODO: FIX
        // console.log("$" + scope.vars.$)
        const type = evaluate(node.type, scope, "Type");

        if (!node.type || isOfType(scope.vars.$, type)) {
            scope.vars[node.id] = scope.vars.$;
            return true;
        }
        return false;
    },
    Bool: (node, scope) => {
        return { type: "Bool", value: node.value };
    },
    Num: (node, scope) => {
        return readjustNum(node.value);
    },
    String: (node, scope) => {
        return { type: "String", value: node.value };
    },
    Concat: (node, scope) => {
        return { type: "String", value: node.strings.reduce((p, string) => p + evaluate(string, {...scope, expectedType: "String" }).value, '') };
    },
    ElementOf: (node, scope) => {
        // i have no idea
        verify(node.parent, scope);
        verify(node.childId, scope);
        return scope;
    },
}

const BASE_SCOPE = { vars: require('./default_vars'), patterns: require('./default_patterns') };

const { isOfType, readjustNum } = require('./default_types');
const { hash, deepCopy, makeIterator, inspect, toString, print, deepEquals } = require('./utils');
const { parseExpression, evaluateExpression } = require('./parse_expression');

const makeAST = require("./make_AST");
const verifyScope = require('./verify_scope');

const evaluate = (node, scope, expectedType = "Object") => {
    if (!node) return undefined;
    // console.log(node);
    // console.log(scope);
    scope.expectedType = expectedType;
    if (node.ASTType) return ASTNodeEvals[node.ASTType](node, scope);
    return node;
};

module.exports = (text, timeout = Number.POSITIVE_INFINITY) => {
    const now = new Date().getTime();

    const ast = makeAST(text);
    verifyScope(ast);
    const scope = {...BASE_SCOPE, endTime: now + timeout };
    evaluate(ast, scope);

    if (scope.error) return scope.error.magenta + '\n';
    return '';
}

require('./run_file')(module);