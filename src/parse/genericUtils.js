import { consoleWarn } from "../util/environment.js";
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

const replaceGenericTypesInRule = ({ pattern, ...rule }, typeToken) => {
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
    if (context.generics.subtypeLengths[typeToken.type]) {
        for (const subtypeName of context.generics.genericChildren["Object"]) {
            // Default subtypes
            returnRules.push({
                pattern: [
                    {
                        ...typeToken,
                        subtypes: Array(
                            context.generics.subtypeLengths[typeToken.type] || 0
                        )
                            .fill()
                            .map(() => type(subtypeName)),
                    }, // TODO: GO through all combinations for multiple subtypes
                ],
            });
        }
        return returnRules;
    }

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

    return returnRules
        .flatMap((rule) => replaceGenericTypesInRule(rule, typeToken, context))
        .filter(
            ({ allowedSubtypes }) =>
                !allowedSubtypes ||
                allowedSubtypes.length === 0 ||
                allowedSubtypes.every((allowedSubtype, i) =>
                    allowedSubtype.some(
                        (subtype) => subtype === typeToken.subtypes[i].type
                    )
                )
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

export const fillDefaultSubtypes = (typeToken, context) => {
    return {
        ...typeToken,
        subtypes: Array(context.generics.subtypeLengths[typeToken.type] || 0)
            .fill()
            .map(
                (_, i) =>
                    typeToken.subtypes[i] ||
                    context.generics.defaultSubtypes?.[typeToken.type]?.[i] ||
                    type("Object")
            ),
    };
};
