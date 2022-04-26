# BA Programming Language (🅱️🅰️)

By Ben Kern

## Key points

Here are a few things that I like and dislike about each of my favorite languages:

|            | Likes                                                                                   | Don't Likes                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Java       | How it looks, Readable for the most part                                                | How verbose it is and how you basically need a for loop for everything, also the fact that you need to build a class and give in to the object oriented aspect in order to do anything |
| Haskell    | Pure functionality, I really like lazy computation and infinite lists                   | No assigning of variables, I hate the \$ operator                                                                                                                                      |
| JavaScript | Style of coding                                                                         | Inconsistency of operators and discrepency between look of code between different people coding, omg also {} can be runnable code or an object                                         |
| Python     | Cleanliness and readability of code, also I really like the idea of function generators | I hate tabs, among other things                                                                                                                                                        |
| Matlab     | Matrices and proficiency in math in general                                             | Only uses matrices, no other types of lists                                                                                                                                            |

## Stuff that's definitely going in

number operations

```py
print(5+4)
print(5-4)
print(12035891325123519832601325-12)
print(30.5*2)
print(12.9392e-12)
print(5*9)
print(12/9)
print(12\9) # I actually dont love this but it should be in

print('5'+'4')
print('5'-'4')
print('5'*'9')
print('12'/'9')
print('10'+10)
print(18-'24')
print('2000000000000000000'/2)

print(5++4)
print(12//9)
print(12%9)
print(10 ^ 5)
```

> 9  
> 1  
> 12035891325123519832601313  
> 61  
> 12.9392e-12
> 45  
> 1.3333333333333333  
> 4\3  
> 9  
> 1  
> 45  
> 20  
> -6  
> 1000000000000000000  
> 54  
> 1  
> 3  
> 100000

Everything is either runnable or not runnable

Examples of runnables:

```py
x = 12 # assignment
print(x) # application
-> x # returning and break from current scope
a => 5 # assignment to something that immediately returns! (function)
{x = 5} # arbitrary runnable with assignment in it
```

Examples of non-runnables (objects):

```py
12
[12, 2, 3, 4]
[8: 9, 10: 'a']
x
x.y
x[12]
8 : 2
[x = 5] # objects can have runnables in them, the outside object is not runnable but the inside is!
0::10
```

And notice this is lazily evaluated

### Objects

```py
a = [x : 3, y : 5]   # Create new object
b = [x : 3, y : 5]   # Create new object
c = b                # Copy the arrow in box b into the box for c
a != b               # true Because these two arrows point to different things
b == c               # true Because these two arrows point to the same thing
a === b              # true Because the objects are deeply equal to each other
b === c              # true Easy check since they are references to the same object
```

```python
x = 10
c = [x, y = 3]
o = [a = 5, c, x : 5, x = 7, _root.x : 5]

print(x)
print(c)
print(c[0])
print(c[1])
print(c.y) # equivalent to {c -> y}()
print(y)
c[1]() # this pulls it out to the root object
print(y)
print(o)
```

> 10  
> [10, y = 3]  
> 10  
> y = 3
> 3
> undefined
> 3
> [a = 5, [10, y = 3], 7 : 5, x = 7, 10 : 5]

`powers.ba`

```py
limit = input() # input is a method of the _root object

x = 1

# for is a method in the _root object that takes in a collection and then a function that iterates over that collection
for (0 : limit) i -> {

    # using `` lets you interpolate with {}. If you want to use {} just use '' or "".
    print(`2^{i} = {x}`)

    x += x # x is not within this scope so it looks outside and finds it
}
```

### Prototypes

```python
Circle = [x : 0, y : 0, radius : 1, color : "black"] -> self() # This creates an anonymous function with no needed arguments that returns an object. This is honestly my favorite way of making class objects
c1 = Circle()
c1.x = 4
c1.color = "green"
print(c1) # [x : 4, y : 0, radius : 1, color : "black"]
print(Circle)
```

> [ x = 4, y = 0, radius = 1, color = "green" ]  
> -> [{...}, {...}, {...}, {...}]

## Stuff that I'm tinkering with

### Operators

```py
print(25 -- 5) # should equal 2 but idk its weird
print(25 -- 4) # like idk what to do in this situation
print(8 ** 4) # I dunno what this should be
```

### Objects

```python
x = []
x.age = 17
x.height = 65.3
print(x)
score = x.age * x[_var("height")] # both work
print(score)
z = [age = 30, color = "red", total = 3]
z.last = true
print(z)
rat = [triple = [a = 4, b = undefined, c = [4: null]], 7: "stuff"]
print(rat)
z.delete("age") # will throw an error if it doesnt find it
z.color = undefined # will not throw an error if it doesnt find it
print(z)
```

I don't know what I wanna do with Strings

### Prototypes

If you wanted to do the proper protoType way, then you could do it as such:

```python
protoCircle = {x: 0, y: 0, radius: 1, color: "black"}
c1 = union (protoCircle) (key -> protoCircle[key]) #honestly not opposed to just having a Object.create() which does exactly this
```

### Lists/Tuples

Ba allows for easy iteration and manipulation of ordered (and unordered) collections of objects.

```python
a = []
b = [1, 5, 25]
[d, e, f] = b                 # d=1, e=5, f=25 (destructuring)
[c, b] = [b, false]           # c=[1, 5, 25], b=false --------- (not sure if I like this tbh)

g = [1, true, [1,2], [x=5, y=6], "Hi"];
h = [triple= [a=4, b="dog", c=[1,null]], 7: "stuff"};

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
_type(['x', true, 3]) == Type.Collection.List            # true hol up I dont know if I like this
_type([0: 'x', 1: true, 2: 3]) == Type.Collection.List   # false hol up I dont know if I like this

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
a ++= 3              # a is now [300, 900, 200, 400, 300, 700, 3] I dont know if this should be a ++= [3] instead I feel like it should
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

## Functions

```python
(x -> x * 2 + 1)(20)           # evaluates to 41
square = x -> x * x
now = () -> Date()
now = -> Date()
now => Date()                  # These are all the same, I love this idea and its stayin
average = (x, y) -> (x + y) / 2   # I need to figure this out
average(3, -4)                 # -0.5
```

```python
successor(x) => x + 1        # this is beautiful
successor(12) = 2            # I like it

print(successor)

sum = (x,y) -> x + y

x = [
  f = a -> a * 3              # arrow function
  h(a) => a * 3              # Use which every ya want honestly I kinda like all of these
]

print(x)
print(x.h)
```

> [12 : 2, \$ + 1][f = {...}, h = {...}]  
> {\$ \* 3}

### Higher Order functions

```python
plusSix = x -> x + 6
squared = x -> x * x
squared => $ ^ 2
twice = (f, x) -> f(f(x))
twice(plusSix, 5)                                   # 17
twice(squared, 4)                                   # 256
compose = (f, g) -> x -> g(f(x))
squareThenPlusSix = compose(squared, plusSix)
squareThenPlusSix(10)                               # 106
compose(plusSix, squared) (5)                       # 121
`twice expects {twice.length} arguments`;           # 'twice expects 2 arguments' I dont think I like this
```

Can use `$` or `$[integer]` to declare a function with anonymous variables.  
Passing a function into a list creates a new list that has every item function'd upon

```python
a = [3, 5, 2, 8, 21, 72]
a(-> $ / 2)                         # [ 1.5, 2.5, 1, 4, 10.5, 36 ]
a ./ 2                           # This also works but is a special case
a[a(-> $ % 2 == 0)]                 # [ 2, 8, 72 ]
a[a .% 2 .== 0]                  # This also works a.%2 applies %2 to all of them
filter(a, -> $ % 2 == 0)            # This also works

all(a(-> $ < 20))                   # false
all(a .< 20)                     # also works, generally the period applies to all elements
any(a(-> $ < 25))                   # true
first(-> $ > 7)(a)                  # 3
a[first(-> $ > 7)(a)]               # 8
find(-> $ > 7)(a)                   # same as last, cleanest code
last(-> $ > 7)(a)                   # 5
a[last(-> $ > 7)(a)]                # 72
findLast(-> $ > 7)(a)               # 72

a.reduce([x, y] -> x + y, 0);         # 111 I'm not sure what this does
a.reduce($0 + $1, 0)
```
