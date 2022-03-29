1. Static Compiler-time Parsing
   - Type checking
2. Figure out types overall
   - I'm not sure about tuples existing
   - I'm not sure about dictionaries vs. just everything being an object that can have attributes
   - I'm not sure about explicit typing of lists
   - I'm not sure about processes
     - The only concrete difference between them would be laziness of execution and caching of return values, but only if they dont draw from outside sources
       - Maybe cache can keep track of all used outside states
   - I'm not sure how to allow for type creation if at all
3. Finish Script Running
   - Expression parsing
     - Numbers being polymorphous types in an elegant way
     - Operator precedence and associativity, especially across polymorphous types
     - Numbers being able to be put next to each other as multiplication
     - Functions
4. Capability for passing references to objects explicitly through cuttlefish and not just through js
5. Multiple arity inputs in functions, optional inputs, keyword arguments, default arguments
6. Think about nondeterministic / deterministic scope

# Wanted but not needed features

6. Flesh out switch statement
   - Idk if I want to do raw patterns
7. Flesh out catch statement
8. ElementOf is just not working
9. Ability to dynamically create patterns
   - Ability to store these preparsed patterns in the Compiled AST
10. Keyword arguments

# Far down line (NOT NECESSARY FOR MVP)

- Generics in type checking
- AST Optimization and pruning
  - if true / ternary trues and falses
  - add zeros
  - multiply by zero or 1
  - concatenate empty strings or empty lists or union with empty sets
  - or/and with constant booleans
  - GENERALLY: If all values of an expression are constant they can be pre-ran
- Colorizer
- Autoformatter / Prettier
- CLI
- Real website
- Patreon
- Tests
- Organize Repo
- Write documentation

- Lists of a forced type ?
