import { allowedCharactersHeuristic } from "./allowedDict";
import { allowedEndCharactersHeuristic } from "./endDict";
import { maxLengthHeuristic } from "./maxLength";
import { minLengthHeuristic } from "./minLength";
import { allowedStartCharactersHeuristic } from "./startDict";

export const generateHeuristics = (rules, generics, parentContexts) => {
    const context = { rules, generics, parentContexts };

    const heuristics = {};
    for (const heuristic of [
        minLengthHeuristic,
        maxLengthHeuristic,
        allowedCharactersHeuristic,
        allowedStartCharactersHeuristic,
        allowedEndCharactersHeuristic,
    ]) {
        const heuristicObject = heuristic(context);
        heuristics[heuristicObject.heuristicName] = heuristicObject;
        delete heuristicObject.heuristicName; // Don't really need this anymore
    }
    return heuristics;
};
