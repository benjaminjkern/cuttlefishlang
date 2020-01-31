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
timesPlusSixAndSquare := plusSix $ * squared $s

print timesPlusSixAndSquare 7                       # 62
```

Can use `$` which is just the argument tuple

# Stuff we need to figure out

a = [1,3,4,6]

a(fn: $ + 5)
map a fn: $ + 5

a[fn: $ < 4]
filter a fn: \$ + 5

quickSort = fn [a] => [a]:
[] -> [][x]:xs -> quickSort xs[fn: $ < 5] ++ [x] ++ quickSort xs[fn: $ >= 5]

main = prc:
if quickSort [5,3,4,1,2,6] === [1..6]:
print 'yeet'
else:
error 'fail'

filterPrime := [p]:xs -> p ++ filterPrime xs[fn: $ % p != 0]
primes = filterPrime [2..]
main = print primes[fn: $ < 100]
