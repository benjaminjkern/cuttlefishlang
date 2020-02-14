1. #!ZeroSpaceOps = []
1. #!Sequences = [(start,stop,operation)]
1. #!RawSequences = []
1. #!InheritScope / NOT NECESSARY
1. #!Generics = []
1. Types
2. Method Concatanation
3. Top level is omnipresent


Dog = type:
    String name
    () => String speak

myDog = Dog:
    name -> "Max"
    speak -> () -> "Woof"
