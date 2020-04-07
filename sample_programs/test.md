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

    for [0..limit]:
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
[Num] quickSort = fn:
    [] -> []
    [Num] x:xs -> quickSort xs[fn: $ < x] ++ x ++ quickSort xs[fn: $ >= x]

print quickSort [2,4,5,3,6,1]
```

> [1,2,3,4,5,6]

```hs
map = fn:
    A => A fun, [] -> []
    fun, [A] head:tail -> fun head ++ map fun tail

filter = fn:
    A => Bool fun, [] -> []
    A => Bool fun, [A] head:tail | fun head -> head ++ filter fun tail
    A => Bool fun, [A] head:tail -> filter fun tail
```

Primes less than 100

```hs
primeFilter := [Int] p:xs -> p ++ primeFilter xs[$ !%= p]

primes = primeFilter [2..]

print primes[fn: $ < 100]
```

> [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]

# Servers

Non-Deterministic

```py
proc = prc: x ->
    x = x + 1
    put x
    self x

my_server = srv:
    () ->
        self ++ proc 0
        self ++ proc 0
        self ++ proc 0
    1 -> put "Hello"
    2 -> put "World"
    x -> put `{x} Potato`

s = my_server()

s.inbox # []
s.procbox # {Process[1, proc 1], Process[1, proc 1], Process[1, proc 1]}

print s() # 'Hello'
s.procbox # {Process[2, proc 2], Process[1, proc 1], Process[1, proc 1]}
print s() # 'World'
s.procbox # {Process[3, proc 3], Process[1, proc 1], Process[1, proc 1]}
print s() # 'Hello'
s.procbox # {Process[3, proc 3], Process[1, proc 1], Process[2, proc 2]}
print s() # '3 Potato'
s.procbox # {Process[4, proc 4], Process[1, proc 1], Process[2, proc 2]}
```

```hs
twoSum := [Number] nums, Number target ->
    hashTable = Dict()
    for nums: n ->
        complement = target - n
        if hashTable has complement:
            put (hashTable[complement], complement)
        hashTable[n] = complement
    put None
```

Factorial, done in the lame way and the cool way

```hs
factorial = fn: x ->
    n = x
    p = 1
    while n > 0 do
        p = n
        n -= 1
    put p

factorial :=
    0 -> 1
    x -> x * factorial x - 1
```

Implementation of the while loop

```hs
while = prc:
    A value, A => Bool test, A => A process -> fn:
        () -> process value
        true -> while (process value) test process
        false -> put()

while 5 fn: i -> i > 0; prc: print $, put $ - 1);


while = fn:


while = srv:
    State => Bool test, State => State process ->
        store process state
        if test(state): self test process

```

Implementation of the for loop

```hs
for = fn:
    [] -> # No op
    [A] head:tail, A => _ process ->
        put process head
        for tail process
```

```
x = 2

for [0..] prc:
    y = x * $ ^ x
    x = $
```

Processes both implicitly get passed the state as well as implicitly have the state stored in their inbox

```python
f = fn: put 1, put 2, put 3, put 4, put 5
p = prc: put 1, put 2, put 3, put 4, put 5
s = srv: put 1, put 2, put 3, put 4, put 5

j = f() # j = 1
k = f() # k = 1
print j() # Error
print k() # Error

j = p() # j = Process p
k = p() # k = Process p
print j() # 1
print k() # 1
print j() # 2
print j() # 3
print k() # 2
print j() # 4
print j() # 5
print k() # 3
print j() # None

j = s() # j = Server s
print j() # (anything from {1, 2, 3, 4, 5})


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
f = fn: x, y -> x + y

g = fn: z -> 8 * z

f 3 g 3

# f is of arity 2, g is of arity 1, and 3 is of arity 0 or 1. This can be parsed a whole asortment of ways

f(3)(g 3) which would be fine
```

Analog Clock Problem

```hs
for [0..10]:
  t = floor ($ + 0.5) * 43200 / 11
  h = t // 3600
  m = t % 3600
  print `{(h - 1) % 12 + 1}:{m // 60}:{m % 60}`
end
```

```py
factorial = fn:
    0 -> 1
    Int x | x > 0 -> x * factorial (x - 1)
```

```hs
firstFib = fn: n -> # first fibonacci greater than or equal to n
    a, b = 1, 1
    while a < n:
        a, b = b, a + b
    put a

print firstFib(12) # 13
print firstFib(28) # 34
```

```py
fibGen = prc:
    () -> self(1, 1)
    (a, b) -> put a, self(b, a+b)

donovan = fibGen()
print donovan() # 1
print donovan() # 1
print donovan() # 2
print donovan() # 3
print donovan() # 5
print donovan() # 8
```

```
num doTwice(num f:(num z), num x):
    return f(f(x))

Num doTwice := Num => Num f, Num x -> f(f(x))

doTwice := f, x -> f(f(x))

(f^2)(x)

```

```hs
num largestNum(num x, num y, num z):
    if (x >= y and x >= z):
        return x
    else if (y >= x and y >= z):
        return y
    else:
        return z
```

```hs
Num sum :=
    [] -> 0
    [Num] x:xs -> x + sum xs
```

(sum 23 45 1 8 23)()

```hs
sum :=
    Num x -> fn:
        () -> 0
        y -> x + sum y
```

```hs
sum_of_digits = fn: n
    | n < 0 -> sum_of_digits(-n)
    | n < 10 -> n
    | _ -> return sum_of_digits(n / 10) + (n % 10)

print sum_of_digits 8835299
```
