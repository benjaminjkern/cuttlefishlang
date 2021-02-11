const Types = {
    Object: {
        subtypes: ["Method", "Collection", "Num", "Bool", "Type"]
    },
    Collection: {
        subtypes: ["Testable", "Iterable", "String"]
    },
    Iterable: {
        subtypes: ["List", "DiscreteRange"]
    },
    Testable: {
        subtypes: ["Set", "ContinuousRange"]
    },
    List: {
        generics: ["listType"],
    },
    Set: {
        generics: ["setType"],
    },
    Method: {
        abstract: true,
        subtypes: ["Function", "Process"],
        generics: ["input", "output"]
    },
    Num: {
        subtypes: ["Real", "Imaginary"]
    },
    Real: {
        subtypes: ["Int"]
    },
}