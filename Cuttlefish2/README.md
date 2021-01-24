# Lambda++

This is a Lambda Calculus Programming language that is fully functioning, but it has some extra stuff added to it to make programming in Lambda Calculus (albeit marginally) viable!

[Click here to learn about Lambda Calculus](https://en.wikipedia.org/wiki/Lambda_calculus)

### The base language

```
# Variable Assignment
I = λx.λx;

# You can also use lower case and upper case l's instead of a lambda, in any combination!
K = lx.ly.x;
S = Lx.ly.λz.x z (y z);

# You can apply lambda expressions to each other
KIK = K I K;

# Printing of entire lambda expressions
print KIK;
```

> λx.λx

## This is all standard Lambda, so what's new?

This is an entire Lambda++ program:

```
print add 2 2;
```

> 4

But where are the lambda expressions? What happened to them?

- `2`, and all other whole numbers, get internaly parsed as their Church Numeral encoding, so for the case of `2`, it would be `λf.λx.f (f x)`

- `add` is recognized by the language as `λm.λn.λf.λx.m f (n f x)`

- When printing to console, Lambda++ tries to recognize numbers, and recognizes that the resulting expression matches the Church encoding of 4, so it prints the number `4`

This allows for addition of any numbers!

Booleans expressions are also recognized by the language!

```
print and true true;
print and true false;
print and false true;
print and false false;
```

> true

> false

> false

> false

Check out the [Example Code](https://github.com/benjaminjkern/side-projects/blob/master/js-projects/lambda%2B%2B/example.lpp)!

## How to install

1. Clone this repo.
2. Run `npm init`
3. Run `node lambdaplusplus.js [Your Program name]`

That's it! Simple!
