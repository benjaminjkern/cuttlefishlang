# Important

1. Functions
2. Static initial parsing & Optimizations
5. Good tests for all steps of the process
6. Add the rest of the rules
    1. Add inherited rules
        1. i.e. All objects have a rule of A -> '(' A ')'
7. Random numbers
8. Object ownership `parent.child`
9. Selection `parent[child]`
10. Lists
11. Control structure
    1. `break`
    2. `continue`
    3. `throw`
    4. `assert`
12. Better errors, example of bad one right now:
```
print y
# 1: 'y' is not in the set of end tokens for type: Statement!
```

# Less Important

1. Instantiators fitting on one line
2. Figure out a nice way to dynamically scope sub-rules used for types (numlit, endbit)
3. Switch to es modules instead of commonjs
4. Add a function to clean a parse tree and turn it into an AST
5. Make all contexts (Rules, heuristics) work in a modular fashion

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
