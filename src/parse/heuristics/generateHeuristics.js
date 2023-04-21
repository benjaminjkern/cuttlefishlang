import { allowedCharactersHeuristic } from "./allowedDict.js";
import { allowedEndCharactersHeuristic } from "./endDict.js";
import { maxLengthHeuristic } from "./maxLength.js";
import { minLengthHeuristic } from "./minLength.js";
import { allowedStartCharactersHeuristic } from "./startDict.js";

export const generateHeuristics = (rules, generics, parentContexts) => {
    const context = { rules, generics, parentContexts, heuristics: {} };
    for (const heuristic of [
        minLengthHeuristic,
        maxLengthHeuristic,
        allowedCharactersHeuristic,
        allowedStartCharactersHeuristic,
        allowedEndCharactersHeuristic,
    ]) {
        const heuristicObject = heuristic(context);
        context.heuristics[heuristicObject.heuristicName] = heuristicObject;
        delete heuristicObject.heuristicName; // Don't really need this anymore
    }
    context.heuristicsGenerated = true;
    return context.heuristics;
};
