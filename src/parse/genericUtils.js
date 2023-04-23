import { consoleWarn } from "../util/environment.js";
import { inspect } from "../util/index.js";
import { type } from "./ruleUtils.js";

const replaceGenericTypesInToken = (patternToken, typeName, genericTypeMap) => {
    if (patternToken.metaType) {
        switch (patternToken.metaType) {
            case "or":
                return {
                    ...patternToken,
                    patterns: patternToken.patterns.map((orPattern) =>
                        replaceGenericTypesInPattern(
                            orPattern,
                            typeName,
                            genericTypeMap
                        )
                    ),
                };
            case "multi":
                return {
                    ...patternToken,
                    pattern: replaceGenericTypesInPattern(
                        patternToken.pattern,
                        typeName,
                        genericTypeMap
                    ),
                };
            case "anychar":
                return patternToken;
            case "subcontext":
                return {
                    ...patternToken,
                    pattern: replaceGenericTypesInPattern(
                        patternToken.pattern,
                        typeName,
                        genericTypeMap
                    ),
                };
        }
        throw `Invalid metatype: ${patternToken.metaType}`;
    }

    if (patternToken.genericType) {
        if (!genericTypeMap[patternToken.genericType])
            throw `Error: Replacing generic type ${patternToken.genericType}, which isnt listed in genericTypeMap`;
        return type(genericTypeMap[patternToken.genericType]);
    }
    if (patternToken.thisType) return type(typeName);
    if (patternToken.subtypes)
        return {
            ...patternToken,
            subtypes: patternToken.subtypes.map((subtypeToken) =>
                replaceGenericTypesInToken(
                    subtypeToken,
                    typeName,
                    genericTypeMap
                )
            ),
        };

    // This includes raw types and terminal tokens
    return patternToken;
};

const replaceGenericTypesInPattern = (
    pattern,
    typeName,
    genericTypeMap = {}
) => {
    return pattern.map((token) =>
        replaceGenericTypesInToken(token, typeName, genericTypeMap)
    );
};

const replaceGenericTypesInRule = (
    { pattern, genericTypes, ...rule },
    typeName,
    context
) => {
    if (genericTypes) {
        const genericsToReplace = {};
        for (const genericType in genericTypes) {
            const matchType = genericTypes[genericType];

            // Only do the replacement if this generic type shows up multiple times in the pattern
            if (
                context.generics.genericChildren[matchType] &&
                pattern.reduce(
                    (count, token) =>
                        count +
                        (token.genericType === genericType ||
                            token.subtypes?.filter(subtype)),
                    0
                ).length > 1
            )
                genericsToReplace[genericType] =
                    context.generics.genericChildren[matchType];
            else {
                if (!context.generics.genericChildren[matchType])
                    consoleWarn(
                        `Warning: ${matchType} was listed as a possible match type for generic ${genericType} in type ${typeName}, but it is not listed as a generic type`
                    );
                genericsToReplace[genericType] = [matchType];
            }
        }
        return allMapCombinations(genericsToReplace).map((genericTypeMap) => ({
            ...rule,
            pattern: replaceGenericTypesInPattern(
                pattern,
                typeName,
                genericTypeMap
            ),
        }));
    }
    return {
        ...rule,
        pattern: replaceGenericTypesInPattern(pattern, typeName),
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

    // Add in the normal rules for this type, replace all thistypes and generic types
    returnRules.push(
        ...context.rules[typeName].flatMap((rule) =>
            replaceGenericTypesInRule(rule, typeName, context)
        )
    );

    // Parse any generic rules, determined by which rules this type falls under (i.e. A -> '(' A ')' )
    if (context.generics.genericParents[typeName])
        returnRules.push(
            ...context.generics.genericParents[typeName].flatMap((parentType) =>
                context.rules[parentType].flatMap((rule) =>
                    replaceGenericTypesInRule(rule, typeName, context)
                )
            )
        );

    inspect(returnRules);

    return returnRules;
};

const allMapCombinations = (mapPossibilities) => {
    const keys = Object.keys(mapPossibilities);
    if (keys.length === 0) return [{}];
    return allMapCombinations(
        keys.slice(1).reduce((p, c) => ({ ...p, [c]: mapPossibilities[c] }), {})
    ).flatMap((subPossibility) =>
        mapPossibilities[keys[0]].map((item) => ({
            ...subPossibility,
            [keys[0]]: item,
        }))
    );
};
