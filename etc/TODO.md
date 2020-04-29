# Stuff to think about ![logo](logo.png "Look at how cool this language is!")

1. Maps / Sets : Either implement from the grammar/language level or figure out EXPLICITLY how to implement them in stdlib
2. Types / Type Inference : Fully fleshed out and come up with a good syntax that is "cuddly"
3. Function Arity / Arity directionality : I dont want to write down all the specific cases for this but this will be an issue in the future. This will help when we are making arbitrary operations (different from functions?)
4. Keyword arguments : I really want these in but they were hard to effectively implement on the grammar level, even if I try to make it so the semantic checker checks whether or not they are valid and the grammar just passes them as an argument. This extends to being about to have an expression that extends to another line, which at the moment is not implemented.
   I was thinking:

```
method = fn: a, b, c, d -> a + b + c + d

method 5 8 7 9

# would be the same as
method
    a: 5
    b: 8
    d: 9
    c: 7

# obviously this needs to be fleshed out
```

5. Repeated patterns/guards : I really want to do this too but like the kwargs, they proved to be difficult to effectively implement, and I figured its easier to leave it out for now until we get the ast and stuff working.

```
[Object] filter = fn:
    [], Object => Bool fun -> []
    [Object] head:tail, Object => Bool fun | fun head -> head ++ filter fun tail
    [Object] head:tail, Object => Bool fun -> filter tail fun

# could be (potentially) shortened to

[Object] filter = fn:
    [], Object => Bool fun -> []

    [Object] head:tail, fun | fun head -> head ++ filter fun tail
    # the type of fun is inhereted from the previous case

        | true -> filter tail fun
        # head, tail, and fun are all inhereted from the previous case and the guard of always true is passed in
```

6. List comprehension : I wanna implement this in the mathy list/set comprehension way (essentially using guards as such as), I don't know if this would be able to be done in macros though since we dont really have any solid examples of using macros.
   Something like:

```
evens = [a : a in [1..] | a % 2 == 0]

# notice this can already be done using map and/or filter

evens = [1..][fn: $ %= 2]
# or
evens = filter [1..] fn: x -> x % 2 == 0

# but I WANT to be able to use this kind of thing in code if I really wanna. This is why we need to flesh out macros
```

7. Macros : need to be fleshed out. More examples that are concrete. Because honestly at this point I'm not entirely convinced we need them in the language, as they appear to be a lot of extra work for something that is for a grade.
8. Scope/State/Context : To my knowledge this was not fleshed out. I don't love the idea of relying on macros to do something that a user of cuttlefish might assume would be default behavior. That actually applies to the previous point as well. hahaha
9. Processes/Servers : I'd like more concrete examples of processes and servers, because at the moment I honestly don't fully understand how they work and how processes in particular differ from functions. Obviously I understand the details of how they are different, but I don't yet see a reason for me to use processes when I can just make a filter function and apply it to an list of inputs, for example.
   In the super program, I have:

```
[Int] fibs = fn:
    () -> fibs (1,1)
    (Int a, Int b) -> a ++ fibs (b, a + b)

fibs() # [1, 1, 2, 3, 5, 8, 13, 21, 34, 55...]

# sort of effectively the same thing

Int fibGen = prc:
    () -> self (1, 1)
    (Int a, Int b) -> put a, self (b, a + b)

f = fibGen()
print f() # 1
print f() # 1
print f() # 2
print f() # 3
print f() # 5
print f() # 8
```

11. Standard Library : More stuff. all of the above should affect how the standard library turns out

# Big picture stuff that needs to get done ![logo](logo.png "Look at how cool this language is!")

1. Website for Cuttlefish
2. Readme fleshing out and prettifying
3. AST parsing
4. Semantic Analysis
5. Optimization
6. Unit Tests
