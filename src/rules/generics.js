import { OR, type } from "../parse/ruleUtils.js";
import cleanRuleSet from "./cleanRuleSet.js";
import { objectGenerics } from "./expressions/object.js";

const generateGenericParents = (allGenerics) => {
    const genericParents = {};
    for (const parentType of Object.keys(allGenerics)) {
        for (const childType of allGenerics[parentType]) {
            if (!genericParents[childType])
                genericParents[childType] = [parentType];
            else genericParents[childType].push(parentType);
        }
    }
    return genericParents;
};

const generateGenericSubtypeRules = (allGenerics) => {
    const genericTypes = {};
    for (const genericType of Object.keys(allGenerics)) {
        genericTypes[genericType] = [
            // Needs to be in list so the cleanRuleSet works
            {
                pattern: [
                    OR(
                        ...allGenerics[genericType].map((typeName) =>
                            type(typeName)
                        )
                    ),
                ],
            },
        ];
    }
    return genericTypes;
};

/***********************************
 * Add more generic children here
 ***********************************/

const genericChildren = {
    Object: objectGenerics,
};

export default {
    genericChildren,
    genericSubtypeRules: cleanRuleSet(
        generateGenericSubtypeRules(genericChildren)
    ),
    genericParents: generateGenericParents(genericChildren),
};
