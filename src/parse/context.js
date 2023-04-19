import generateHeuristics from "../parse/heuristics.js";
import { deepCopy } from "../util/index.js";

export const newContext = (rules, generics, parentContexts = {}) => {
    return {
        rules: deepCopy(rules),
        generics: deepCopy(generics),
        heuristics: generateHeuristics(rules, generics, parentContexts),
        parentContexts: deepCopy(parentContexts),
    };
};
