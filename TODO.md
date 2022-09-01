1. Instantiator parsing to build the full AST
2. Evaluate a full AST
3. Add meta-types (OR, NOT, MULTI) to make rule making easier
    1. These need to be included in the heuristics which is going to be complicated
4. Add check for ambiguous parse
    1. Literally just check if there is a second parse
    2. Add option to turn this into an error, warning, or dont check this at all (Probably faster to not check for this at all but can lead to confusing code)
