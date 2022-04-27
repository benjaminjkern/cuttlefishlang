const RULES = {
    String: [
        {
            pattern: ['"', MULTI(NOT('"')), '"'],
            spaces: "dont-ignore",
            evaluate: ({ sourcestring }) =>
                sourcestring.substring(0, sourcestring.length - 1),
        },
        {
            pattern: ["print", type("String")],
            evaluate: ({ tokens: [_, string] }) => {
                const stringValue = string.evaluate();
                console.log(stringValue);
                return stringValue;
            },
        },
    ],
};

const attachReturnType = (rulesList, returnType) => {
    rulesList.forEach((rule, index) => {
        rulesList[index] = { ...rule, returnType };
    });
};

attachReturnType(RULES, "String");

module.exports = { RULES };
