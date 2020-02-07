# Stuff we like

```python
print 'Hello world!'
```

> Hello world!

`powers.w`

```python
main = prc:
    limit = Number $[0]

    x = 1

    for 0..limit:
        # Interpolate with `` and {}
        print `2^{$} = {x}`
        x += x
```

`$` refers to the argument object, and for the `main` process this refers to parsed command line arguments. Additionally, anything returned by the `main` process is automatically printed. This is because the overarching system runs: `print main(args)`

`cuttlefish powers.w 5`

> 2^0 = 1  
> 2^1 = 2  
> 2^2 = 4  
> 2^3 = 8  
> 2^4 = 16  
> 2^5 = 32

Higher Order functions

```python
plusSix = fn: x -> x + 6
squared := x -> x * x
squared := $ ^ 2
twice := (f,x) -> f(f(x))
print twice(plusSix, 5)                             # 17
print twice(squared, 4)                             # 256
plusSixThenSquare = squared * plusSix               # compose operator
print plusSixThenSquare 10                          # 256
print plusSix * squared 5                           # 31
timesOfPlusSixAndSquare := plusSix $ * squared $

print timesOfPlusSixAndSquare 7                       # 62
```

Can use `$` which is just the argument tuple

Quick Sort

```hs
quickSort :=
    [] -> []
    [Num] x:xs -> quickSort xs[fn: $ < x] ++ [x] ++ quickSort xs[fn: $ >= x]

print quickSort [2,4,5,3,6,1]
```

> [1,2,3,4,5,6]

Primes less than 100

```hs
primeFilter := [Int] p:xs -> p ++ primeFilter xs[fn: $ % p != 0]

primes = primeFilter [2..]

print primes[fn: $ < 100]
```

> [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]

# Servers

Non-Deterministic

```py
proc = prc: x ->
    x = x+1
    put x
    self x


my_server = srv:
    () ->
        self ++ proc(0)
        self ++ proc(0)
        self ++ proc(0)
    1 -> put "Hello"
    2 -> put "World"
    x -> put `{x} Potato`


base 16 '1bc01259'

s = my_server()

print s() # 'Hello'
print s() # 'Hello' or 'World'
print s() # 'Hello' or 'World' or '3 Potato'
print s() # 'Hello' or 'World' or '3 Potato' or '4 Potato'
```

```hs
twoSum := List nums, Number target ->
    hashTable = Dict()
    for nums: n ->
        complement = target - n
        if hashTable has complement:
            return (hashTable[complement], complement)
        hashTable[n] = complement
    return None
```

Factorial, done in the lame way and the cool way

```hs

factorial := 0 -> 1; x -> x * factorial x - 1
```

```hs
gcd :=
    x, 0 -> x
    x, y -> gcd(y, x % y)
```

Operators

```hs
#! NOSPACEOPS = [!, \nambla]

! = postfix op: factorial
```

```py
f = fn: x -> fn: y -> x + y

g = fn: z -> 8 * z

(3 * g)(8)

(g + 3)(3)


f 3 g 3

# left: f(3)(g)(3) -> (function that returns 3 + the input)(g)(3) -> (g + 3)(3)

# right: f(3(g(3))) -> f(3(24)) -> f(72) -> a function that returns 72 + the input


f * 3 g 3

# left: f(3(g)(3)) -> f( (3 * g)(3) )

# right: f(3(g(3))) -> f(3(24)) -> f(72) -> a function that returns 72 + the input


f 3 * g 3

# left: f(3)(g(3)) -> (function that returns 3 + the input)(24) -> 27

# right: " "


f 3 g * 3

# left: f(3)(g)(3) -> (function that returns 3 + the input)(g)(3) -> (g + 3)(3)

# right: f(3(g))(3) -> f(3 * g)(3)
```
