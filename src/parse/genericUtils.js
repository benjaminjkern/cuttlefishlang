import { OR, type } from "./ruleUtils.js";

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
            }
            throw `Invalid metatype: ${patternToken.metaType}`;
        }
        if (patternToken.thisType) return typeName;
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
    // Need this to catch the raw rules that still have thisType() in them
    const cleanedRules = context.rules[typeName].map((rule) =>
        replaceThisTypeInRule(rule, typeName)
    );

    // Add extra subtype rule to prevent parsing loops
    if (context.generics.genericSubtypeRules[typeName])
        cleanedRules.push(context.generics.genericSubtypeRules[typeName][0]); // [0]: Take out of list, it was in a list because I needed it to be to get the cleanRuleset to work

    if (!context.generics.genericParents[typeName]) return cleanedRules;
    return [
        // First parse any generic rules, determined by which rules this type falls under (i.e. A -> '(' A ')' ), then parse the others
        ...context.generics.genericParents[typeName].flatMap((parentType) =>
            context.rules[parentType].map((rule) =>
                replaceThisTypeInRule(rule, typeName)
            )
        ),
        ...cleanedRules,
    ];
};
