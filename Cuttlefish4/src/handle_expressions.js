const parseExpression = (atoms, scope) => {
    const RULES = scope.patterns;

    Object.keys(scope.vars).forEach(variable => {
        const type = scope.vars[variable].type;
        if (!RULES[type]) RULES[type] = [];
        RULES[type].push({ pattern: [variable], evaluate: () => scope.vars[variable], hardEval: !scope.vars[variable].constant && !scope.vars[variable].determined });
    })
    Object.keys(TYPES).forEach(type => {
        if (!TYPES[type].subtypes) return;
        if (!RULES[type]) RULES[type] = [];
        TYPES[type].subtypes.forEach(subtype => {
            RULES[type].unshift({ pattern: [{ type: subtype }] });
        });
    });

    // scope = { patterns, heuristics, types, vars, }


    return parseType(atoms, scope.expectedType);
};


const evaluate = (node) => {
    if (!node.unevaluated) return node;
    const evaluatedArgs = node.unevaluated.args.map(evaluate);
    return node.unevaluated.evaluate(...evaluatedArgs);
}



const stringExp = (exp) => '[ ' + exp.map(v => v.type ? "(" + v.type + (v.value !== undefined ? " : " + v.value : "") + ")" : inspect(v)).join(" ") + ' ]';