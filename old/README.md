# ![logo](etc/logo.png "Look at how cool this language is!") The Cuttlefish Programming Language ![logo](etc/logo.png "Look at how cool this language is!")

![cuttlefish](etc/cuttlefish.png "Cuttlefish!")

Cuttlefish is a strong, statically typed language designed to empower its users to write elegant, safe, and functional code for concurrent systems.

Cuttlefish as a language structurally draws from many aspects of Haskell and Elixir, as well as stylistically from Python, with indentation based closure.

Cuttlefish strives to allow its users to have immense power over the style of their code, as long as it is falls into what is considered clean, cohesive, "Cuttly" code.

Cuttlefish also strives to achieve Alan Kay's ideas of ideal Object Oriented Programming which still being a functional programming language.

[Here is our website! (Click me!) (Please!)](https://benjaminjkern.github.io/cuttlefishlang)

# Routines

There are three types of Routines that Cuttlefish can handle, all equipped with immersive pattern matching and precise functional capabilities.

| Routine        | Functions `fn:`                                                              | Processes `prc:`                                                                                | Servers `srv:`                                                                                                   |
| -------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Description    | Regular functions, lazily evaluated, can be passed around like objects       | Act like generator functions, meant to eagerly run until they are terminated                    | Used for organized distribution and interconnection of processes, eagerly run all child processes asynchronously |
| Can call       | Functions                                                                    | Functions and Processes                                                                         | Functions, Processes, and Servers                                                                                |
| Internal state | Any internal state is immediately deleted upon return                        | Have an outbox and store internal state until process is completed                              | Have an inbox and outbox, internal state is stored until server forcefully ended                                 |
| Scope          | Inherit scope at definition time (for constants and internal function calls) | Inherit scope at creation time, can edit state of anything it knows is in its scope or subscope | Inherit scope similar to processes                                                                               |

# Functions

Here is an example function.

```py
plusSix = fn: x -> x + 6

print plusSix 12 # prints 18

# This would be the same as running this.
print (plusSix(12))
```

One of the things that we did not like about Haskell is the idea that every function is unary and single arity. In order to have an all consuming function such as the print function, you would need to pass a `$` argument, which makes the code more terse and it becomes a problem.

This lends itself nicely to higher-order functions:

```py
twice = fn: (f, x) -> f(f(x))

print twice (plusSix, 7) # prints 19
```

This could have also been accomplished with the following:

```py
print (plusSix * plusSix)(7) # still 19
```

More on this later.

## Pattern matching

Pattern matching is fully implemented in all Routines. The compiler tests for patterns in the order defined at compile time, so that the abstract syntax tree does not have to do any pattern matching.

Here is an example with the factorial function:

```py
factorial = fn:
    0 -> 1
    Int x | x > 0 -> x * factorial (x - 1)
```

The `|` is a guard, and it reads as "such that". In words, the function says:
"Factorial is a function, if the input is a `0` it returns `1`, otherwise if the input is an integer `x` such that `x` is greater than `0`, then it returns `x` times the factorial of `x - 1`. If the input does not match any above patterns, the function will throw an error. If the input is anything else, the function will throw an error."

Here are map and filter implemented in Cuttlefish:

```py
map = fn:
    A => A fun, [] -> []
    fun, [A] head:tail -> fun head ++ map fun tail

filter = fn:
    A => Bool fun, [] -> []
    A => Bool fun, [A] head:tail | fun head -> head ++ filter fun tail
    A => Bool fun, [A] head:tail -> filter fun tail
```

Pattern matching can be incredibly expressive for exactly which cases you want to run and how your processes should respond. The patterns are tested against the argument in definition order:

```py
doTaxes = prc:
    Person p | p.debt > 1000 or p.name == 'Karen' ->
        print 'Aint nothin I can do about that'
    Person p ->
        p.debt = 0

    Monster m | m.color == 'green' -> m.eyeballs = 1
    Monster m | m.hasFur -> m.scream()

    Dog d ->
        print 'Dogs dont have to do taxes!'
        d.love += 1

    # This will never match, since every dog matches above
    Dog d | d.love > 100 ->
        d.love -= 1
```

# Expression Operators

The following operators are built in to the language:

| Operator        | Operator Name                                                                                 | Defined For        |
| --------------- | --------------------------------------------------------------------------------------------- | ------------------ |
| `+`/`-`         | Addition and Subtraction                                                                      | Numbers            |
| `*`             | Composition, Multiplication                                                                   | Numbers, Functions |
| `^`             | Compound Composition, Exponentiation                                                          |                    |
| `/`             | Division                                                                                      |                    |
| `++`            | Concatenation                                                                                 |                    |
| `**`            | Compound Concatenation                                                                        |                    |
| `==`            | Equivalence                                                                                   |                    |
| `===`           | Pointer equivalence                                                                           |                    |
| `&`/`|`/`^`/`-` | Intersection, Union, Xor, and Difference set operators (`^` and `-` are used in two patterns) |                    |

As seen in the functions section, the `twice` function is not actually necessary to implement in Cuttlefish, as this code can be written:

```py
print (plusSix * plusSix)(7) # prints 19
```

Similarly, you could also do

```py
print (plusSix * plusSix * plusSix * plusSix)(7) # prints 31
```

This is because `*` is the composition operator. This is the same as running:

```py
print plusSix(plusSix(plusSix(plusSix(7)))) # still 31
```

I know what you're thinking, "But how do you multiply then?"
It's simple. Also with `*`. And it lends itself very nicely to being able to "compose" two numbers together:

```py
print 5(5)   == 25
print (5)5   == 25
print (5)(5) == 25
print 5 5    == 25
print 5 * 5  == 25
# All True

print 55     != 25 # 55 is just 55, so duh its False
```

`^`, then, if we allow to be an exponentiation operator, would make sense to be compounding multiple `*` compositions together!

```py
print 5 ^ 4 == 5 * 5 * 5 * 5
print (f ^ 4)(2) == (f * f * f * f)(2) # Which would also be equal to f(f(f(f(2))))
print 5 ^ 2.5 # 55.90169943749474
# It still works for regular floating point exponentiation!
```

# Types

Since Cuttlefish is statically typed, types are very important.

# Macros

Using macros, Cuttlefish can become an extremely expressive and customizable language.

```

```
