# Hello world

print "hello world"

# Simple Functions

sphere_vol = fn: r -> 4/3*pi*r^3

quadratic = fn: (a, sqr_term, b) -> (-b + sqr_term) / 2a

quadratic2 = fn: (Float64 a, FLoat64 b, Float64 c) ->
    sqr_term = sqrt(b^2-4a*c)
    r1 = quadratic(a, sqr_term, b)
    r2 = quadratic(a, -sqr_term, b)
    r1, r2

vol = sphere_vol(3)

printf "volume = %0.3f\n" vol

quad1, quad2 = quadratic2(2.0, -2.0, -12.0)

print "result 1: " ++ quad1
print "result 2: " ++ quad2

### Important to notice: Using tuples and not using tuples drastically changes how functions work

quadratic3 = uncurry quadratic2
# would be the same as
quadratic3 = Float64 a, Float64 b, Float64 c ->
    # same code as before

### I don't know how I feel about Float64 versus just doing numbers, maybe specify integers when necessary

### Important to note here so I dont forget, Python breaks if you dont put anything on the next line after an indent, we can fix that

# Strings Basics

s1 = "The quick brown fox jumps over the lazy dog α,β,γ"
print s1

printn "this"
printn " and"
printn " that.\n"

### printn is print without a newline, I feel like its more intuitive

c1 = 'a'
print c1

### Can use double or single quotes for Strings

import ascii
### ascii might just be ok to be in standard lib

print c1 ++ " ascii value = " ++ ascii c1

print "ascii 

### Have things like ascii recognize the shape of the input, if its a string have it return a list of ints with their ascii values

### I think I would want them all to be strings, so maybe the ascii function should always return a list but thats kinda annoying

### another alternative is I dont need an ascii function

s1_caps = uppercase s1
s1_lower = lowercase s1

s1_caps = s1.toUpperCase()
s1_lower = s1.toLowerCase()

print s1[11]
print s1[1..10]

### the whole show thing is dumb I think
### 1-indexing is also dumb

print s1[-10..]

a = "welcome"
b = "julia"
print `{a} to {b}.`

print `1 + 2 = {1 + 2}`

s2 = "this" ++ " and" ++ " that"
s3 = String("this", " and", " that")

# String: Converting and formatting

e_str1 = "2.718"
e = Number e_str1
print 5e # 13.59
num_15 = Integer "15"
print 3num_15

e_str2 = String.format "%0.3f" e

### A bunch of printf stuff that I dont mind keeping

# String Manipulations
i = s1.findFirst 'b'

### Julia uses nospacesandnocaps, I like camel toLowerCase

replace s1






reverse a list

a = scramble [1..20]