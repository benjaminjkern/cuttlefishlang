# Important

2. Evaluate a full AST
    1. Static initial parsing
3. Instantiator parsing to build the full AST
4. Good tests for all steps of the process

# Less Important

1. Figure out a nice way to dynamically scope sub-rules used for types (numlit, endbit)
2. Switch to es modules instead of commonjs
3. Add a function to clean a parse tree and turn it into an AST

# Not Super important

1. Positive and negative lookaheads
2. Add nice associativity (Although the reverse search order trick is honestly pretty good)
3. Add ability for grouped patterns within patterns
    1. This refers to like lists within lists within the patterns but honestly there shouldnt be a need for this, the only reason to group is to either apply a `MULTI` or an `OR` to it
4. Think about space rules: `ignore-outside` and `require-outside`
5. Catch "Dumb" warnings like a `MULTI` within a `MULTI` or an `OR` within an `OR`
6. Different types of errors
    1. Parse errors (Rule errors, heuristic errors)
7. Add check for ambiguous parse
    1. Literally just check if there is a second parse and dont check any further
    2. Add option to turn this into an error, warning, or dont check this at all (Probably faster to not check for this at all but can lead to confusing code)
8. Flesh out check for generating heuristics twice on the same ruleset
9. Add meta type: `CASE_INSENSITIVE`

# Really not important at all

1. Write a script that translates into a ruleset to make things a little easier
