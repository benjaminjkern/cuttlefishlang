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

# Stuff we need to figure out

Quick Sort

```hs
quickSort :=
    [] -> [];
    List [x]:xs -> quickSort xs[fn: $ < x] ++ [x] ++ quickSort xs[fn: $ >= x]

print quickSort [2,4,5,3,6,1]
```

> [1,2,3,4,5,6]

Primes less than 100

```hs
primeFilter := List [p]:xs -> p ++ primeFilter xs[fn: $ % p != 0]

primes = primeFilter [2..]

print primes[fn: $ < 100]
```

> [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]
