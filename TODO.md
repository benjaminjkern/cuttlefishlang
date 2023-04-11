# Working on/Test

2. Evaluation of metatypes
    1. As in, being able to grab evaluated subtokens from within OR's and MULTI's (I think this is happening in commaSeparatedValues)
5. Different types of errors
    1. Parse errors (Rule errors, heuristic errors)
7. Flesh out check for generating heuristics twice on the same ruleset

# Important

3. Non-list iterables (Ranges & generator functions)
4. Functions
5. Patterns
9. Add the rest of the rules
    1. Add inherited rules
        1. i.e. All objects have a rule of A -> '(' A ')'
11. Object ownership `parent.child`
12. Selection `parent[child]`
14. Control structure
    3. `throw`, `catch`
    4. `assert`
10. Random numbers
15. Better errors, example of bad one right now:

```
print y
# 1: 'y' is not in the set of end tokens for type: Statement!
```
16. Keyboard input
17. String templates
18. Map & filter

# Medium important

2. Spaces within metatypes
    1. Right now you have to specify the spaces even if the rule's space rule is ignore, which is moderately annoying and messes with that stuff^^^
5. Static initial parsing & Optimizations
6. Good tests for all steps of the process
7. Add ability for grouped patterns within patterns
    1. This refers to like lists within lists within the patterns but honestly there shouldnt be a need for this, the only reason to group is to either apply a `MULTI` or an `OR` to it
    2. This will also make having super-meta-types easier, such as `LISTOF` or `LOOKAHEAD`s
8. Inheritance for patterns
    1. Make iterable be able to just say oh yeah I'm part of the object ruleset so I dont have to add it to the object ruleset separately

# Less Important

1. Instantiators fitting on one line
2. Figure out a nice way to dynamically scope sub-rules used for types (numlit, endbit)
3. Switch to es modules instead of commonjs
4. Add a function to clean a parse tree and turn it into an AST
5. Make all contexts (Rules, heuristics) work in a modular fashion
6. Built in terminal colors because I like it

# Not Super important

1. Positive and negative lookaheads
2. Add nice associativity (Although the reverse search order trick is honestly pretty good)
3. Think about space rules: `ignore-outside` and `require-outside`
4. Catch "Dumb" warnings like a `MULTI` within a `MULTI` or an `OR` within an `OR`
6. Add check for ambiguous parse
    1. Literally just check if there is a second parse and dont check any further
    2. Add option to turn this into an error, warning, or dont check this at all (Probably faster to not check for this at all but can lead to confusing code)
8. Add meta type: `CASE_INSENSITIVE`

# Really not important at all

1. Write a script that translates into a ruleset to make things a little easier
