# Cuttlefish will automatically evaluate anything that doesn't call upon a scope (constants)

# All of these are preparsed and evaluated before cuttlefish even sees it

###
print 8 * (4 + 5) # should precompile to 72

print true || false # should precompile to true

print 5 in [5, 4] and 6 < 100 - 54 # should precompile to true

print 'hello' ++ ' hi' ++ ` what's {'up'} my {12 + 2} friends!` # Should precompile to "hello hi what's up my 14 friends!"

print `{`{`{`{`{`{`{`{`hello`}`}`}`}`}`}`}`}` # Should precompile to "hello"
###

# Can parse this very fast!!!!!
# print 5 + 10 * 9 - 2 / 4 + 6 * 8 ^ (-1) * 4 + (3 - 12 % 2 / 7 / 5 + 10 * 9) - 2 // (4 + 6 * 8 ^ (-1))^(12 - 9) * 4 + 3 - 12 + 0 / 7
# print 5 + 90 - 0.5 + 3 + (3 + 90) + 3

print 12 % 2 / 7 / 5

# This is still very slow sadly but I dont really know what to do about this honestly
# print --------------------------------------10

###

x = 10

print x + 5 # should precompile to 15, since x is determined here

x -= 5

print x + 5 # should not precompile, x is no longer determined

