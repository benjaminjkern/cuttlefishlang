import { type } from "./ruleUtils.js";

const replaceThisTypeInPattern = (pattern, typeName) => {
    return pattern.map((patternToken) => {
        if (patternToken.metaType) {
            switch (patternToken.metaType) {
                case "or":
                    return {
                        ...patternToken,
                        patterns: patternToken.patterns.map((orPattern) =>
                            replaceThisTypeInPattern(orPattern, typeName)
                        ),
                    };
                case "multi":
                    return {
                        ...patternToken,
                        pattern: replaceThisTypeInPattern(
                            patternToken.pattern,
                            typeName
                        ),
                    };
                case "anychar":
                    return patternToken;
                case "subcontext":
                    return {
                        ...patternToken,
                        pattern: replaceThisTypeInPattern(
                            patternToken.pattern,
                            typeName
                        ),
                    };
            }
            throw `Invalid metatype: ${patternToken.metaType}`;
        }
        if (patternToken.thisType) return type(typeName);
        // This includes raw types and terminal tokens
        return patternToken;
    });
};

const replaceThisTypeInRule = ({ pattern, ...rule }, typeName) => {
    return {
        ...rule,
        pattern: replaceThisTypeInPattern(pattern, typeName),
    };
};

/**
 * Generates generic rules on the fly based on the previously established genericParents
 */
export const getAllRules = (typeName, context) => {
    const returnRules = [];
    // Add extra subtype rule to prevent parsing loops
    if (context.generics.genericSubtypeRules[typeName])
        returnRules.push(context.generics.genericSubtypeRules[typeName][0]); // [0]: Take out of list, it was in a list because I needed it to be to get the cleanRuleset to work

    returnRules.push(
        ...context.rules[typeName].map((rule) =>
            replaceThisTypeInRule(rule, typeName)
        )
    );

    // Parse any generic rules, determined by which rules this type falls under (i.e. A -> '(' A ')' ), then parse the others
    if (context.generics.genericParents[typeName])
        returnRules.push(
            ...context.generics.genericParents[typeName].flatMap((parentType) =>
                context.rules[parentType].map((rule) =>
                    replaceThisTypeInRule(rule, typeName)
                )
            )
        );

    return returnRules;
};
