
set1 = {1, 2, "Spinach"}
set2 = {2, "Carrots", 2}
print set2 # {2, "Carrots"}, not necessarily in that order

print set1 | set2 # {1, 2, "Spinach", "Carrots"}
print set1 & set2 # {2}
print set1 - set2 # {1, "Spinach"}

print set1["Carrots"] # false
print (set2 | set1)["Spinach"] # true

a = Set(1, 2, 3, 4, 5)
b = Set([1, 2, 3, 4, 5])
c = Set [1, 2, 3, 4, 5]
d = {1, 2, 3, 4, 5}

print allEquals(a, b, c, d) # true

allEquals = fn:
    (a, b) -> a == b
    (a, b, c...)
        | a != b -> false
        | -> allEquals (a, ...c)

# == : hash equals
# hash of set : hash of sum of hash of all unique elements
# hash of list : hash of string of joined hashes of all elements
# === : pointer equals (value for primitives)


# == does do deep equals, but if you store an object in a collection then the hash
print {1} == {1, 1} # true
print {{1}} == {{1}, {1}} # true
a = {1}
print {a} == {a, a} # true


# Initialize two sets
ba = {}
pa = {}

for [1..100]:
    ba |= {($ ^ 2) % 100}

for [1..1000]:
    pa |= {($ ^ 2) % 100}

print pa
print ba
print pa == ba # Test deep equality
print pa === ba # Test pointer equality, should be false



