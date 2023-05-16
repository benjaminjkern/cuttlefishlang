These are some basic notes as to how everything is set up and how it all works:

- Indent tree `src/indentTree`
    - Pretty general, basically just splits file into lines and makes a very loose tree based entirely on indentation
        - When I say general I mean this could theoretically be used for other indent-blocked programming languages but it might not be super useful, as it doesn't even match to something like python (Mostly because of the comments and tabspace counting)
        - The idea is to deal with each line individually and imperatively
    - Some special processing goes on here to account for:
        - Comments (Both inline and block comments)
            - Comments can be pretty loosely placed anywhere and don't really pay attention to tab rules
        - Empty lines and trailing whitespace
        - Tab counting + Impossible tabbing
    - This module splits up lines into instantiators (Name subject to change) and statements (Name probably not subject to change)
        - Statements are single lines that should be able to be parsed on their own
            - I might run into issues with wanting to wrap statements on to new lines but we'll tackle that when we get to it (I don't think this will be too hard to do with the way its set up)
        - Instantiators are the bit before an indented block of code, with the idea that the instantiator controls the logic for how that inside code runs

- Parser module `src/parse`
    - I tried to make this as general as possible, basically just a parser. You give it a list of rules and then you tell it to parse
    - What's interesting is that the rules can also be given specific evaluation instructions (And instructions for during parsing) and this is where the programming language really comes to life
    - It can handle:
        - Parse any expression as a specific nonterminal type
        - Parse all possible trees from a given expression (Can be slow by the nature of it)
            - Can also just return if there is more than 1 possible tree so that you know if the parse is ambiguous
        - Metatypes: `OR`, `MULTI`, `OPTIONAL`, `ANYCHAR`, `NOTCHAR`
            - I hope `OR` `MULTI` and `OPTIONAL` are straightforward, `ANYCHAR` means create a whitelist of characters (Does not work with nonterminals), and `NOTCHAR` means create a blacklist of characters
        - Attach whatever semantics and context necessary to the returned tree
    - Not SUPER important but the way this works is using a novel parsing method that I used to call "min regex parse" but i dont really like that name anymore because that's not really what it is doing anyways
        - The way it works is it generates a list of constant heuristics first for each possible nonterminal token, then uses those heuristics as lookup tables when doing the parse. The heuristics are:
            - Min length of possible strings the nonterminal can lead to
            - Max length of possible strings the nonterminal can lead to
            - The set of all possible characters that the nonterminal can start with
            - The set of all possible characters that the nonterminal can end with
            - The set of all possible characters that the nonterminal can contain
        - Using these heuristics, it basically takes the input expression and quickly matches it against the input rule (Or list of rules, if givena a nonterminal type ot match it to) by breaking it up into every possible partition. It can quickly go through the partitions because the heuristics allow you to pretty succinctly determine if a partition or even an entire set of partitions is valid really early on
        - I have not done any sort of proofing to make sure its good but I was able to make it pretty robust with some usecases that I had and it's pretty speedy

- Rules module `src/rules`
    - Basically the list of cuttlefish-specific parser rules
    - A submodule called `expressions` holds the list of all the different "native types" to cuttlefish
        - boolean
        - dictionary
        - iterable
        - number
        - object
        - string
    - There are also the rules for instantiators and statements in here, this is where the juice of control flow and scope sorta happens
    - Still working on this though, the goal is to make it in such a way that adding features to the LANGUAGE is really easy.
        - I specify language because adding features to the compiler is likely always going to be difficult. I would want it really easy for example to declare a new operator or even a new type of instantiator
            - A good example would be like declared types, I dont know how I want them to be in cuttlefish or even if I want them but I want it to be easy for me to add them if I do decide on that at some point

- Evaluate module `src/evaluate`
    - Evalute a parsed tree:
        - Right now the way this works is it parses every statement in order, including inside instantiators, then just runs through everything and evaluates. If something affects the context or control flow, it deals with it but its all preparsed and ran through.
        - Variables are declared as a RULE within a given type (Kind of unsure about this but also I sort of like it)
            - i.e. `x = 4` literally puts a new rule: `{ pattern: ['x'], evaluate: () => 4 }` inside the `Number` ruleset, at which point it would need to re-run all the heuristics before it can move on to the next statement to parse
                - Iffy about this mostly because it could be very slow to have to rerun the heuristics every time you set a variable
                - The other way to do it though is to generalize the parsing at some point and have it just always accept things that look like variables and then inject types and values later (This is how other languages do it)
    - Or you can interpret an unparsed indentTree
        - This would likely just parse and evaluate at every step
        - One big thing for this owuld be what to do in loops, i.e. reparsing every statement is needlessly slow
            - It could store the old parse since most of it isn't gonna change each loop
    - Still working on this
        - I also have no idea how either of these ways are going to work when it comes to functions

- Utils module `src/utils`
    - It's just utils
    - The only thing somewhat interesting here is the setUtils which just implements set operations
        - Mostly used in the tokensets for the heuristics generation within the parser, but nice to have
        - Will likely get directly implemented as something you can just do within cuttlefish

- Entrypoint `src/index.js`
    - Right now you just need to run `node src/index.js [filename].w` to run cuttlefish, but theoretically you will be able to just do `cuttlefish [filename].w` or `cuttle [filename].w` (lol)

- Test files `test` and `workingonfiles` directories
    - Right now just a loose list of cuttlefish files, some of which are supposed to compile all the way and others are only supposed to make it through a couple of the steps. Right now it's unlabeled and I dont exactly remember which ones are which but I'm certain I could guess
    - Ideally the test folder will just hold a bunch of examples and some registry of what the expectation of each files output will be