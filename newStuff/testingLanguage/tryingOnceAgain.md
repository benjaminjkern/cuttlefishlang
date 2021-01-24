# Ba

## Hello World

```python
print('Hello World') # print is a method in the \_root object but it also has special stuff going on
```

> Hello World

`Powers.ba`

```python
main = prc:
  limit = Number $[0]

  x = 1

  for 0..limit:
    print `2^{$} = {x}`
    x += x
```

Command Line: `ba powers.ba 5`

> 2^0 = 1  
> 2^1 = 2  
> 2^2 = 4  
> 2^3 = 8  
> 2^4 = 16  
> 2^5 = 32

## Types

```python
_type(false)            # Object : Key : Boolean
_type(93.8888)          # Object : Key : Number
_type("Hi")             # Object : Key : String
_type({x: 1, y: 2})     # Object : Collection : Dictionary
_type([1, 2, 3])        # Object : Collection : List
_type(x -> x + 1)       # Object : Function
_type(NaN)              # Object : Number
```

```python
_type(undefined)        # 'undefined' I don't know what to do with this
_type(null)             # 'object' I don't know what to do with this either
_type(/o*h/)            # 'object'
```

## Bindings

TODO Havent figure it out yet

```python
dozen = 3 * 4               # Binds the name dozen to the value 12
favorite = 'Grimes'         # Binds the name favorite to the value "Grimes"
dozen = 2                   # Throws a TypeError because const bindings cannot be updated
print(dozen)                # 12
favorite = 'Austra'         # That's fine! let-bindings can be updated
print(favorite)             # Austra
```

## Objects

TODO: undefined & delete

```python
x = {}
x.age = 17
x.height = 65.3
score = x.age * x[_var(height)]
z = {age: 30, color: "red", total: 3}
z.last = true
rat = {triple: {a: 4, b: undefined, c: {4: null}}, 7: "stuff"}
# I need to figure that out ^
delete z.age # idk mang
```

```python
const a = {x: 3, y: 5}   # The curly braces CREATE a new object
const b = {x: 3, y: 5}   # The curly braces CREATE a new object
const c = b              # Copy the arrow in box b into the box for c
a != b                   # true Because these two arrows point to different things
b == c                   # true Because these two arrows point to the same thing
a === b                  # true Because the objects are deeply equal to each other
b === c                  # true Easy check since they are references to the same object
```

```python
x = 10
c = {x, y: 3}            # c : { 10, y : 3 }
o = {a: 5, b: 4, c}      # {a: 5, b: 4, { 10, y : 3 } }
{b, c: {y}} = o          # I don't think I like this at all
```

## Prototypes

In JavaScript you would have:

```js
const protoCircle = { x: 0, y: 0, radius: 1, color: "black" };
const c1 = Object.create(protoCircle);
c1.x = 4;
c1.color = "green"; // Now c1.y === 0 and c1.radius === 1
```

But in Ba:

```python
Circle => {x: 0, y: 0, radius: 1, color: "black"} # This creates an anonymous function with no needed arguments that returns an object. This is honestly my favorite way of making class objects
c1 = Circle()
c1.x = 4
c1.color = "green"
print(c1)
print(Circle)
```

> { x : 4, y : 0, radius : 1, color : "green" }  
> \<function Circle>

If you wanted to do the proper protoType way, then you could do it as such:

```python
protoCircle = {x: 0, y: 0, radius: 1, color: "black"}
c1 = union (protoCircle) (key -> protoCircle[key]) #honestly not opposed to just having a Object.create() which does exactly this
```

This allows you to change the protocircle and also the inherited components in one SWOOP

## Lists/Collections/Matrices/Tensors

Ba allows for easy iteration and manipulation of ordered (and unordered) collections of objects.

```python
a = []
b = [1, 5, 25]
[d, e, f] = b                 # d=1, e=5, f=25 (destructuring)
[c, b] = [b, false]           # c=[1, 5, 25], b=false --------- (not sure if I like this tbh)

g = [1, true, [1,2], {x:5, y:6}, "Hi"];
h = {triple: {a:4, b:"dog", c:[1,null (need to figure out)]}, 7: "stuff"};

g[1]           # true
g[2][0]        # 1
g.length       # 5
g[10] = 100    # g[5] through g[9] are empty cells
g.length       # 11
g.length = 2   # Now g is just [1, true] --------- (not sure if I like this)
```

```python
# Construction
a = [300, 900, 200, 400, 300, 700]
b = [500, 300]
c = [95, 33, 'dog', false]
d = 'dog'.split()                   # ['d', 'o', 'g']
e = [5, ...b, -10]                  # [5, 500, 300, -10] (note the spread operator) ------ not sure if I like this
f = [b, ...b]                       # [[500, 300], 500, 300]

# Tests
_type(['x', true, 3]) == Type.Collection.List            # true
_type({0: 'x', 1: true, 2: 3}) == Type.Collection.List   # false

# Accessors (these do not change their operands)
a.includes(400)      # true
a.includes(7)        # false
a.indexOf(300)       # 0
a.lastIndexOf(300)   # 4
a.indexOf(2500)      # -1
a[2:5]        # [200, 400, 300]
a ++ b          # [300, 900, 200, 400, 300, 700, 500, 300]
a.join('--')         # "300--900--200--400--300--700"
a.toString()         # '300,900,200,400,300,700', automatically gets called when put into print() (OR WHEN IMPLICITLY CASTED AS STRING MAYBE)

# Mutators
a ++= 3              # a is now [300, 900, 200, 400, 300, 700, 3]
a.reverse()          # a is now [ 700, 300, 400, 200, 900, 300 ]
a.sort()             # a is now [ 200, 300, 300, 400, 700, 900 ]
a.fill(9)            # a is now [ 9, 9, 9, 9, 9, 9 ] -------- to be fair you could just use a=[9]*6
e.splice(1, 2, 90, 70, 200, 6, 17);
                     # At position 1, remove 2 elements, and insert the others
                     # e is now [ 5, 90, 70, 200, 6, 17, -10 ] ---------- I don't like how these are set up and also I dont think I need either of them
e.copyWithin(1, 4, 6)
                     # shallow copy elements at positions [4, 6) to position 1
                     # e is now [ 5, 6, 17, 200, 6, 17, -10 ]

# Really Cool stuff
c.keys()             # An iterator that goes through 0, 1, 2, 3
[...c.keys()]        # [0, 1, 2, 3]
[...c.entries()]     # [[0, 95], [1, 33], [2, 'dog'], [3, false]]

for (c.entries()) [i, x] -> print(`{i} -> {x}`)
```

> 0 -> 95  
> 1 -> 33  
> 2 -> dog  
> 3 -> false

## Functions

```python
(x -> x * 2 + 1)(20)           # evaluates to 41
square = x -> x * x            # can also use let or var
now = fn: Date()
now = -> Date()
now => Date()                  # These are all the same, I love this
average = (x, y) -> (x + y) / 2
average(3, -4)                 # -0.5


now := Date()





fn: $ * 2 + 1: 20 #

# These can be rewritten
[x] {x * 2 + 1} (20)
square = [x] x * x
square(x) => x * x              # This will make math people happy
now = [] {Date()}
now = {Date()}                 # Also works since [] is empty
average = [x,y] {(x+y) / 2}
```

Notice `[x] {x * 2 + 1}` is different than `(x) -> {x * 2 + 1}`, this returns a new object. the -> is sort of a return operator except actually yeah thats exactly what it is. Idk why I just dont like stuff like the word return when it can be an operator

```python
successor(x) => x + 1

sum = [x,y] {x + y}

x = {
  f: a -> a * 3              # arrow function
  g: [a] a * 3               # NOT an arrow function, this is how it actually gets stored anyways I just kinda like how the arrow looks
  h(a) => a * 3              # Use which every ya want honestly I kinda like all of these
}

print(x)
```

> { f : [a] { a _ 3 }, g : [a] { a _ 3 }; h(a) => a \_ 3 }

Notice that the 3rd line was not stored, it is viewed as "unrun code". As are both of the { a \_ 3 } "objects".

## Higher Order Functions

```python
plusSix = x -> x + 6
squared = x -> x * x
squared = {$ ^ 2}
twice = (f, x) -> f(f(x))
twice(plusSix, 5)                                   # 17
twice(squared, 4)                                   # 256
compose = (f, g) -> (x -> g(f(x)))
compose = [f, g] [x] g(f(x))                        # Both work
squareThenPlusSix = compose(squared, plusSix)
squareThenPlusSix(10)                               # 106
compose(plusSix, squared) (5)                       # 121
`twice expects {twice.length} arguments`;           # 'twice expects 2 arguments' I dont think I like this
```

Can use `$` or `$[number]` to declare a function with anonymous variables.  
Passing a function into a list creates a new list that has every item function'd upon

```python
a = [3, 5, 2, 8, 21, 72]
a($ / 2)                         # [ 1.5, 2.5, 1, 4, 10.5, 36 ]
a ./ 2                           # This also works
a[a($ % 2 == 0)]                 # [ 2, 8, 72 ]
a[a .% 2 .== 0]                  # This also works a.%2 applies %2 to all of them
filter(a, $ % 2 == 0)            # This also works

all(a($ < 20))                   # false
all(a .< 20)                     # also works, generally the period applies to all elements
any(a($ < 25))                   # true
first($ > 7)(a)                  # 3
a[first($ > 7)(a)]               # 8
find($ > 7)(a)                   # same as last, cleanest code
last($ > 7)(a)                   # 5
a[last($ > 7)(a)]                # 72
findLast($ > 7)(a)               # 72

a.reduce((x, y) -> x + y, 0);         # 111 I'm not sure what this does
a.reduce($0 + $1, 0)
```

## Parameter passing

```python
f(x, y, z) => [x, y, z]
f(3, 1, 8, 5, 9)                            # [3, 1, 8]
```

```python
f(x : 1, y, z : 3) => [x, y, z]
f(x, y, z) => [x ? 1, y, z ? 3] # Also works but technically this means something different
f()                             # [1, undefined, 3]
f(5)                            # [5, undefined, 3]
f(5, 1)                         # [5, 1, 3]
f(5, 10, 13)                    # [5, 10, 13]
f(undefined, 2)                 # [1, 2, 3]
f(undefined, 2, 100)            # [1, 2, 100]
```

`a ? b` is the same as `if a != undefined -> a else -> b`  
`a ? b : c` is the same as `if a -> b else -> c`

```python
f(x, ...y) => [x, y]
f()               # [undefined, []]
f(1)              # [1, []]
f(1, 2)           # [1, [2]]
f(1, 2, 3)        # [1, [2, 3]]
f(1, 2, 3, 4, 5)  # [1, [2, 3, 4, 5]]
```

```python
line (x1, y1, x2, y2, style:'solid', thickness:1, color:'black') = {
  `Drawing a {color} {style} line from ({x1},{y1}) to ({x2},{y2}) with weight {thickness}`
}
line {x2: 5, x1: 4, color: 'green', y1: 6, y2: 10}
    # 'Drawing a green solid line from (4,6) to (5,10) with weight 1'
```

## Scope

```python
a = 1
# b and c are not in scope here
example = {
  print(b) # undefined
  b = 3
  print(c) # undefined
  if (true) {
    c = 5
    print(a, b, c)
  }
  print(c) # 5
}
# Only a and b are in scope here; c, d, e and f are no longer in scope
example()
```

```python
a = 0 : 10
for (0 : 10) ([i] -> {a[i] => i})
a[3]()                                            # 3, YES I EXPECTED THAT
```

## Closures

```python
nextFib = {
  [a, b] = [0, 1]
  return {
    [a, b] = [b, a + b]
    return a
  }
}()


nextFib()    // 1
nextFib()    // 1
nextFib()    // 2
nextFib()    // 3
nextFib()    // 5
nextFib()    // 8
```

Lets unpack that.

Ugh I dont like this

```js
fib(n) = { /* penis

}
```
