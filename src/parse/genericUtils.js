import { consoleWarn } from "../util/environment.js";
import { inspect } from "../util/index.js";
import { stringifyPattern } from "./parsingUtils.js";
import { type } from "./ruleUtils.js";

const replaceGenericTypesInToken = (
    patternToken,
    typeToken,
    genericTypeMap
) => {
    if (patternToken.metaType) {
        switch (patternToken.metaType) {
            case "or":
                return {
                    ...patternToken,
                    patterns: patternToken.patterns.map((orPattern) =>
                        replaceGenericTypesInPattern(
                            orPattern,
                            typeToken,
                            genericTypeMap
                        )
                    ),
                };
            case "multi":
                return {
                    ...patternToken,
                    pattern: replaceGenericTypesInPattern(
                        patternToken.pattern,
                        typeToken,
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
                        typeToken,
                        genericTypeMap
                    ),
                };
        }
        throw `Invalid metatype: ${patternToken.metaType}`;
    }

    if (patternToken.genericType) {
        if (!genericTypeMap[patternToken.genericType])
            throw `Error: Replacing generic type ${patternToken.genericType}, which isnt listed in genericTypeMap`;
        return genericTypeMap[patternToken.genericType];
    }
    if (patternToken.thisType) return typeToken;
    if (patternToken.thisSubtype !== undefined)
        return (
            typeToken.subtypes[typeToken.index] ||
            type("Object") ||
            patternToken
        ); // TODO: getDefaultSubtype(typeToken.type);
    if (patternToken.subtypes)
        return {
            ...patternToken,
            subtypes: patternToken.subtypes.map((subtypeToken) =>
                replaceGenericTypesInToken(
                    subtypeToken,
                    typeToken,
                    genericTypeMap
                )
            ),
        };

    // This includes raw types and terminal tokens
    return patternToken;
};

const replaceGenericTypesInPattern = (
    pattern,
    typeToken,
    genericTypeMap = {}
) => {
    return pattern.map((token) =>
        replaceGenericTypesInToken(token, typeToken, genericTypeMap)
    );
};

const atLeast2GenericsInToken = (patternToken, genericType) => {
    if (patternToken.metaType) {
        switch (patternToken.metaType) {
            case "or":
                // Just for optimization, should count separately
                let max = 0;
                for (const pattern of patternToken.patterns) {
                    max = Math.max(
                        atLeast2GenericsInPattern(pattern, genericType),
                        max
                    );
                    if (max >= 2) break;
                }
                return max;
            case "multi":
                return atLeast2GenericsInPattern(
                    patternToken.pattern,
                    genericType
                );
            case "anychar":
                return 0;
            case "subcontext":
                // Honestly shouldnt really use generics across subcontexts but eh
                return atLeast2GenericsInPattern(
                    patternToken.pattern,
                    genericType
                );
        }
        throw `Invalid metatype: ${patternToken.metaType}`;
    }

    if (patternToken.genericType === genericType) return 1;
    if (patternToken.subtypes) {
        let count = 0;
        for (const token of patternToken.subtypes) {
            count += atLeast2GenericsInToken(token, genericType);
            if (count >= 2) break;
        }
        return count;
    }

    return 0;
};

const atLeast2GenericsInPattern = (pattern, genericType) => {
    let count = 0;
    for (const token of pattern) {
        count += atLeast2GenericsInToken(token, genericType);
        if (count >= 2) break;
    }
    return count;
};

const replaceGenericTypesInRule = (
    { pattern, genericTypes, ...rule },
    typeToken,
    context
) => {
    if (genericTypes) {
        const genericsToReplace = {};
        for (const genericType in genericTypes) {
            const matchType = genericTypes[genericType];

            // Only do the replacement if this generic type shows up multiple times in the pattern
            if (
                context.generics.genericChildren[matchType] &&
                atLeast2GenericsInPattern(pattern, genericType) >= 2
            )
                genericsToReplace[genericType] =
                    context.generics.genericChildren[matchType];
            else {
                if (!context.generics.genericChildren[matchType])
                    consoleWarn(
                        `Warning: ${matchType} was listed as a possible match type for generic ${genericType} in type ${typeToken.type}, but it is not listed as a generic type`
                    );
                genericsToReplace[genericType] = [matchType];
            }
        }
        return allMapCombinations(genericsToReplace).map((genericTypeMap) => ({
            ...rule,
            pattern: replaceGenericTypesInPattern(
                pattern,
                typeToken,
                genericTypeMap
            ),
        }));
    }
    return {
        ...rule,
        pattern: replaceGenericTypesInPattern(pattern, typeToken),
    };
};

/**
 * Generates generic rules on the fly based on the previously established genericParents
 */
export const getAllRules = (typeToken, context) => {
    const typeName = typeToken.type;

    const returnRules = [];
    // Add extra generic children rule to prevent parsing loops
    if (context.generics.genericSubtypeRules[typeName])
        returnRules.push(context.generics.genericSubtypeRules[typeName][0]); // [0]: Take out of list, it was in a list because I needed it to be to get the cleanRuleset to work

    console.log(typeToken);
    // Add in the normal rules for this type, replace all thistypes and generic types
    returnRules.push(...context.rules[typeName]);

    // Parse any generic rules, determined by which rules this type falls under (i.e. A -> '(' A ')' )
    if (context.generics.genericParents[typeName])
        returnRules.push(
            ...context.generics.genericParents[typeName].flatMap(
                (parentType) => context.rules[parentType]
            )
        );

    // console.log(
    //     returnRules
    //         .flatMap((rule) =>
    //             replaceGenericTypesInRule(rule, typeToken, context)
    //         )
    //         .map((rule) => stringifyPattern(rule.pattern, false))
    // );

    return returnRules.flatMap((rule) =>
        replaceGenericTypesInRule(rule, typeToken, context)
    );
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

export const makeTypeKey = (typeToken) => {
    if (!typeToken.subtypes?.length) {
        if (typeToken.genericType) return typeToken.genericType;
        if (typeToken.thisType) return "this";
        if (typeToken.thisSubtype !== undefined)
            return `this[${typeToken.thisSubtype}]`;
        return typeToken.type;
    }
    return `${typeToken.type}<${typeToken.subtypes
        .map(makeTypeKey)
        .join(",")}>`;
};
