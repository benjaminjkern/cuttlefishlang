import generateHeuristics from "../parse/heuristics.js";
import { deepCopy } from "../util/index.js";

export const newContext = (rules) => {
    return { rules: deepCopy(rules), heuristics: generateHeuristics(rules) };
};
