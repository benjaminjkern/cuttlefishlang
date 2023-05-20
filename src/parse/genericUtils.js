import { consoleWarn } from "../util/environment.js";
import { inspect } from "../util/index.js";
import { stringifyPattern, stringifyToken } from "./parsingUtils.js";
import { type } from "./ruleUtils.js";

const replaceGenericTypesInToken = (patternToken, typeToken) => {
    if (patternToken.metaType) {
        switch (patternToken.metaType) {
            case "or":
                return {
                    ...patternToken,
                    patterns: patternToken.patterns.map((orPattern) =>
                        replaceGenericTypesInPattern(orPattern, typeToken)
                    ),
                };
            case "multi":
                return {
                    ...patternToken,
                    pattern: replaceGenericTypesInPattern(
                        patternToken.pattern,
                        typeToken
                    ),
                };
            case "anychar":
                return patternToken;
            case "subcontext":
                return {
                    ...patternToken,
                    pattern: replaceGenericTypesInPattern(
                        patternToken.pattern,
                        typeToken
                    ),
                };
        }
        throw `Invalid metatype: ${patternToken.metaType}`;
    }

    // if (patternToken.genericType) {
    //     if (!genericTypeMap[patternToken.genericType])
    //         throw `Error: Replacing generic type ${patternToken.genericType}, which isnt listed in genericTypeMap`;
    //     return type(genericTypeMap[patternToken.genericType]);
    // }
    if (patternToken.thisType) return typeToken;
    if (patternToken.thisSubtype !== undefined) {
        if (typeToken.subtypes[patternToken.thisSubtype] === undefined)
            consoleWarn(
                "Warning: Accessing raw type (Should have added subtypes)"
            );
        return typeToken.subtypes[patternToken.thisSubtype] || type("Object");
        // return typeToken.subtypes[patternToken.thisSubtype] || patternToken;
    }
    if (patternToken.subtypes)
        return {
            ...patternToken,
            subtypes: patternToken.subtypes.map((subtypeToken) =>
                replaceGenericTypesInToken(subtypeToken, typeToken)
            ),
        };

    // This includes raw types and terminal tokens
    return patternToken;
};

const replaceGenericTypesInPattern = (pattern, typeToken) => {
    return pattern.map((token) => replaceGenericTypesInToken(token, typeToken));
};

// const allMapCombinations = (mapPossibilities) => {
//     const keys = Object.keys(mapPossibilities);
//     if (keys.length === 0) return [{}];
//     return allMapCombinations(
//         keys.slice(1).reduce((p, c) => ({ ...p, [c]: mapPossibilities[c] }), {})
//     ).flatMap((subPossibility) =>
//         mapPossibilities[keys[0]].map((item) => ({
//             ...subPossibility,
//             [keys[0]]: item,
//         }))
//     );
// };

// const atLeast2GenericsInToken = (patternToken, genericType) => {
//     if (patternToken.metaType) {
//         switch (patternToken.metaType) {
//             case "or":
//                 // Just for optimization, should count separately
//                 let max = 0;
//                 for (const pattern of patternToken.patterns) {
//                     max = Math.max(
//                         atLeast2GenericsInPattern(pattern, genericType),
//                         max
//                     );
//                     if (max >= 2) break;
//                 }
//                 return max;
//             case "multi":
//                 return atLeast2GenericsInPattern(
//                     patternToken.pattern,
//                     genericType
//                 );
//             case "anychar":
//                 return 0;
//             case "subcontext":
//                 // Honestly shouldnt really use generics across subcontexts but eh
//                 return atLeast2GenericsInPattern(
//                     patternToken.pattern,
//                     genericType
//                 );
//         }
//         throw `Invalid metatype: ${patternToken.metaType}`;
//     }

//     if (patternToken.genericType === genericType) return 1;
//     if (patternToken.subtypes) {
//         let count = 0;
//         for (const token of patternToken.subtypes) {
//             count += atLeast2GenericsInToken(token, genericType);
//             if (count >= 2) break;
//         }
//         return count;
//     }

//     return 0;
// };

// const atLeast2GenericsInPattern = (pattern, genericType) => {
//     let count = 0;
//     for (const token of pattern) {
//         count += atLeast2GenericsInToken(token, genericType);
//         if (count >= 2) break;
//     }
//     return count;
// };

const replaceGenericTypesInRule = ({ pattern, ...rule }, typeToken) => {
    // if (genericTypes) {
    //     const genericsToReplace = {};
    //     for (const genericType in genericTypes) {
    //         const matchType = genericTypes[genericType];

    //         // Only do the replacement if this generic type shows up multiple times in the pattern
    //         if (
    //             context.generics.genericChildren[matchType] &&
    //             atLeast2GenericsInPattern(pattern, genericType) >= 2
    //         )
    //             genericsToReplace[genericType] =
    //                 context.generics.genericChildren[matchType];
    //         else {
    //             if (!context.generics.genericChildren[matchType])
    //                 consoleWarn(
    //                     `Warning: ${matchType} was listed as a possible match type for generic ${genericType} in type ${typeToken.type}, but it is not listed as a generic type`
    //                 );
    //             else
    //                 consoleWarn(
    //                     `Warning: ${genericType} is only listed once in rule for type ${typeToken.type}, this probably doesn't need to be a generic`
    //                 );
    //             genericsToReplace[genericType] = [matchType];
    //         }
    //     }
    //     return allMapCombinations(genericsToReplace).map((genericTypeMap) => ({
    //         ...rule,
    //         pattern: replaceGenericTypesInPattern(
    //             pattern,
    //             typeToken,
    //             genericTypeMap
    //         ),
    //     }));
    // }
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
    // Add extra generic children rule to prevent parsing loops (i.e. Object -> Number | List | etc...)
    if (context.generics.genericSubtypeRules[typeName])
        returnRules.push(context.generics.genericSubtypeRules[typeName][0]); // [0]: Take out of list, it was in a list because I needed it to be to get the cleanRuleset to work

    // Add in the normal rules for this type
    returnRules.push(...context.rules[typeName]);

    // Add any generic rules, determined by which rules this type falls under (i.e. A -> '(' A ')' )
    if (context.generics.genericParents[typeName])
        returnRules.push(
            ...context.generics.genericParents[typeName].flatMap(
                (parentType) => context.rules[parentType]
            )
        );
    return returnRules.flatMap((rule) =>
        replaceGenericTypesInRule(rule, typeToken, context)
    );
};

export const makeTypeKey = (typeToken) => {
    if (!typeToken.subtypes?.length) {
        if (typeToken.genericType) return typeToken.genericType;
        if (typeToken.thisType) return "this";
        if (typeToken.thisSubtype !== undefined)
            return `this[${typeToken.thisSubtype}]`;
        if (typeToken.inputType !== undefined)
            return `input[${typeToken.inputType}]`;

        return typeToken.type;
    }
    return `${typeToken.type}<${typeToken.subtypes
        .map(makeTypeKey)
        .join(",")}>`;
};
