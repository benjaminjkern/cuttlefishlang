# Implemented

# Not implemented but definitely want to add

- Generally, as little parentheses as possible
  - No need to show code for this, but the idea is that repeated function calls will be handled by either the pattern-based parsing or through funcitonal operators such as map, filter, reduce.
- Generally, tab based formatting, but allow for closure based formatting as well so that people can make one-liners
  - Also: Semicolons only are necessary for separating statements in the same line.
```yml
# Everywhere that this is acceptable:
instantiator:
    doSomething()
    doSomethingElse()
    insideInstantiator:
        doAThirdThing()

# Can also be written as:

instantiator: doSomething(); doSomethingElse(); insideInstantiator: doAThirdThing()

# But if you want something more complicated also in one line, then you can use curly braces.
instantiator:
    doSomething()
    insideInstantiator:
        doAThirdThing()
    doSomethingElse()
outsideDoSomething()
outsideInstantiator:
    doYetAnotherThing()

# Can be written as:
instantiator: { doSomething(); insideInstantiator: {doAThirdThing()}; doSomethingElse()}; outsideDoSomething(); outsideInstantiator: doYetAnotherThing();
# The reason it needs to be like this is because semicolons, just like newlines, actually only delimit the inside-most block TODO: Make linter throw warning here

# Basically indent and dedent are equivalent to an open and close curly brace. TODO: FIGURE OUT IF THIS IS CONFUSING DUE TO WANTING SETS AND WHATNOT

# You can also use the curly braces to get away from tabbing over stuff
instantiator: {
doSomething()
insideInstantiator: doAThirdThing()
}
```
- Standard control flow
```yml
if x < 3:
    print "x < 3!" # Allowed on one line, REQUIRED TO BE TABBED HERE
else:
    print "x >= 3!"


if james == "Cool": # Not necessary to use a pass statement! Although I think a code linter should yell at something like this
else if james == "Not Cool":
    print
while true:
    print "I love you!"
    x += 1
    break
```
- Repeat loop, honestly idk how useful this is since we have a nice for loop but its nice to have
```yml
repeat 8:
    print "I love you 8 times!"

# Allows for expressions (Must cast to int)
x = 3
repeat x + x:
    print "I love you 6 times!"

# Same as while true
repeat:
    print "I love you forever!"

# i refers to loop iteration
repeat: i -> print `I love you {i}`
```
- Standard unary and binary operations
```yml
print 1 + 1 # 2
print 1 * 1 # 1
print 1 - 1 # 0
print 1 / 0 # TODO: Figure out if NaN or throw exception

print -(1 + 1) # -2

print 2 ^ 3 # exponentiation

print true and false
print true or false
print true && false
print true || false

# Equality
print a == b
```
- Sets! (And Set operations)
```yml
mySet = {1, 2, 3}
mySet2 = {3, 4, 5}

print mySet | mySet2 # {1, 2, 3, 4, 5}
print mySet & mySet2 # {3}
print mySet - mySet2 # {1, 2}
print mySet ! mySet2 # {1, 2, 4, 5} I want to have this in but ! seems like a weird operator to use
```
- Automatically assumed types of variables
```yml
x = 5 # x is a number
y = "Hello!" # y is a string
z = false # z is a boolean
```
- Print automatically toStrings everything, but every other case of strings have to be explicitly casted to strings (Or they have to add a string cast function)
- "Nice" for loops
```yml
list = [1, 5, "Hello"]
for list:
    x -> print x

# Can also do pattern matching here, you can kinda do it anywhere
```
- "Nice" Strings
```yml
print "Hello"
print 'Also this way!' # TODO: I am considering doing away with the ability to ambiguously use either ' and " as the same thing, there should be a difference between them I think. At the same time, maybe not.
print `Interpolated! {4 + 4}`
print `Interpolated inside of {`interpolated inside of {`interpolated`} because`} python doesnt let you do that lol`
```
- Regex
```yml
# Honestly I just want to implement the regexes themselves exactly the same way js does it, I just would wanna change how to matching stuff works
regex = /Hello?/g
myString = "Hello Hell"

myString.findFirst regex # RegexMatch: startIndex = 0; matchString = "Hello"; groups = []
myString.findLast regex # RegexMatch: startIndex = 6; matchString = "Hell"; groups = []
# finds all
myString.find regex # [RegexMatch: startIndex = 0; matchString = "Hello"; groups = [], RegexMatch: startIndex = 6; matchString = "Hell"; groups = []]

myString.replaceFirst regex "Hiiiii" # "Hiiiii Hell"
myString.replaceLast regex "Hiiiii" # "Hello Hiiiii"
# replaces all, or replaces conditionally if passed a function
myString.replace regex "Hiiiii" # "Hiiiii Hiiiii"
# No matches are turned into undefined (TODO FIGURE THAT <---- Out) and just dont get replaced
myString.replace regex fn: {startIndex, matchString} | startIndex == 0 -> "Hiiiii" # "Hiiiii Hell"

# The replace and find methods also work without regexes, it just returns indices
myString.findFirst "Hell" # 0
myString.findLast "Hell" # 6
myString.find "Hell" # [0, 6]
myString.repalce

regex2 = /(\w+)@(\w+(\.\w+)*)/g

# Showing how groups work

```
- Ranges
```yml
# ranges are either continuous or discrete. Discrete ranges are:
print [0..10] # [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print [0..0.5..10] # [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]
# If the step does not go over the endpoint, then it skips it
print [0..0.9..10] # [0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4, 6.3, 7.2, 8.1, 9, 9.9]

# Can also have exclusive bounds
print [0..10) # [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
# Include neither side, this is interesting because it looks like it is a 0..10 wrapped in a (), but it is not. TODO: Look into this.
print (0..10) # [1, 2, 3, 4, 5, 6, 7, 8, 9]

# Exclusive bounds will NEVER include the bound but stop the range when goes out of it, inclusive bounds will ONLY include when the iterator steps on it.

# If it is done this way, it has to be done differently, it should count down from 10 rather than count up from 0 and then not include zero. This is to ensure that the 10 itself is always included.
(0..0.9..10] # [0.1, 1, 1.9, 2.8, 3.7, 4.6, 5.5, 6.4, 7.3, 8.2, 9.1, 10]

# Note: These can be printed and casted to real lists, but they are a separate data type, only storing their beginning, end and stepsize
# Infinite discrete ranges:
print [0..] # Could have also done [0..), doesnt matter



```
- "Nice" coallescing of numbers
```yml
# TODO: Document
```
- Function / Instantiator pattern matching
```yml
# I think this is probably one of the coolest things in cuttlefish
```

# Considering adding, needs to good justification / figuring out
- Pattern-based compile-time parsing
```yml
print can be stored as

f = fn: x -> x + 7
print f 8 # 15
print f f 8 # 
```

- Names of functions and attributes and types should make sense
  - includes, in, contains
  - add, append, push (list)
  - pop, remove, delete (anything)
  - length, size, len (Size could maybe mean memory size and length could be virtual size, not sure how useful it is)
  - some / oneof / any
  - every / allof / all

- Relation of attributes to object should make sense
  - Size / length of object should be a property (list.length, set.size)
  - Array methods (map, filter, some, every) Are not properties of the original array and therefor should be an outside operator (Or a syntactic sugar operator)

# Shot in the dark features (Not sure if I want to add at all but good to consider)