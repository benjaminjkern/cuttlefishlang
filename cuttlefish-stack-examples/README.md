My overall goal with this project is to have an all-in-one framework, written in cuttlefish, that ships as an API backend and webserver.

Cuttlefish is a programming language that is designed to do everything well, including readability, learnability, and enjoyability when coding.
Some dogma when making cuttlefish:
    - There should be several ways to solve a given problem, but one should try to never give the option to solve it poorly.
    - People comfortable with programming (In particular, Javascript ES6) should be able to use it and intuitively assume what is going on underneath the hood without having to see the code. (Although the code should be available to check out just in case)
    - People brand new to programming should be able to learn cuttlefish with relative ease just be reading the code, and continue to be astonished at how much is going on behind the scenes to make it all work
    - Everything is an object with a type, including functions and types themselves.
    - Fail fast and fail early, but most default cuttlefish things shouldnt fail.
    - Where there might be a debate for good practice, we will throw in warnings at compile time rather than enforcing an arbitrary rule
    - If a programming pattern/solution is very reusable elsewhere, it should be abstracted and ported with cuttlefish.
    - If a programming pattern/solution is even remotely reusable elsewhere, it should be abstracted and made usable to the whole Cuttlefish community with the cuttle packager
    - Types should never HAVE to be written down, but at runtime the compiler should have marked every object with their minimum possible type that makes the existing program work.
      - If types ARE written down, then the program will likely run smoother due to failing out at type match errors


Some things I like the idea of but havent fully worked out:
    - Parsing is done in such a way that it requires little to no parentheses
      - Uses type inference to assign a type to all possible methods and patterns then parses as such, and throws warnings when there are ambiguous patterns
      - Examples: Given `f = (fn: Num x, Num y -> x + y)`
        - No warning: `print f 6 f 9 6 # this works totally fine because there is only one possible parse`
          - Also notice this works without needing parentheses after `print` because print expects one object
        - Warning, assumes one of many possible parses and throws a compile time warning of severity HIGH: `print f 6 f 9 6 + 4`
    - Importing should be as easy and intuitive and flexible as possible, but still required.
      - `import {String filepath}` returns an object that can be put into a variable, but if called without putting to a variable, then it just takes all exported objects and puts them into 
        - Should return an empty object if file exists but nothing is exported
        - Should throw an error if no file exists
    - Exporting should be done underneath the hood, following specific rules, but by no means impossible to use
      - The "under the hood" rule as stands is: Whatever object is named the same name as the file (without the .w) is exported
      - If multiple `export`s exist in a file then all of them are put into an object with keys that match the variable name
      - Can also use `exportGlobal {String filepath} {Object}` to basically put an auto-import at the top of every file in `filepath`
    - Use javascript deconstruction for variable and argument assignment
    - Most things can be done elementwise if you put them into a tuple
      - `a = obj: { foo = 1; bar = 3 } print a.(foo, bar) + (9, -1)
    - A typical pattern for doing things is:
```yaml
variable = instantiator:
    Type1 var_1 ->
        Do or return something here
    Type2 var_1 #didnt match to type1
        | Bool#1
            | Bool#2 -> matches 1 and 2
            | -> matches 1 but not 2
        | Bool#3 -> does not match 1 but matches 3
        | -> does not match 1 or 3

variable2 = instantiator parameters:
    0, 1 -> return something
    Type x, Type y -> Matches to x and y but not specifically 0 and 1

instantiator parameter:
    Do something, dont need a pattern to match to since no arguments
    But if you do it this way you can use $ to access the implicit argument
```
    - Pretty much everything follows these patterns
```yaml
x = 5
if x > 4:
    print `{x} is greater than 4!`

fib = fn: 0 -> 1; Num x | x > 0 -> x * fib (x - 1)
```





# Some dogma for cuttlefish-UI
  - Allow the ability to do everything that html and css and javascript can do, without needing to touch those.
  - Theoretically this will allow for ports of cuttlefish-UI code to any platform with the right utilities
    - That being said, it will be built mainly for web and mobile based applications as those are definitely the most popular
  - I would rather overwrite everything that html and css can do and provide clear one-to-one mappings of how to do it in the cuttlefish way than allow for direct html and css access.
  - Have common things built in: Pagination, fetching (without complicated other shit)
  - Common packages that could be useful: authentication
  - I want to deal primarily in json but allow for the ability to talk to outside APIs so we can't force json
  - State management should be SO easy and also separated from the rendering, for the sake of having explicit rendering hooks. I dont like the way react forces a re-render of an entire component when that component's state changes, its an unintuitive and obscured away for the sake of new people getting on the platform

# Some dogma for cuttlefish-express
  - Basically just express but written for cuttlefish
  - Allow for a TON of packages that make dealing with databases and common API logic (searching, sorting, connections to other APIs) VERY easy

# Some dogma for cuttle (Package manager)
  - Should just be really easy to use
  - Allow for testing and stuff lol