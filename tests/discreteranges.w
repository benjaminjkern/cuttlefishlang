x = [1..10]

print x # [1, 2, 3, 4, 5, 6, 7, 8, 9]

x = [0..5] ++ [0..10]

print x # [ 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]

print [0..-1..-10] # [ 0, -1, -2, -3, -4, -5, -6, -7, -8, -9 ]

print [0..0.7..9] # [ 0, 0.7, 1.4, 2.0999999999999996, 2.8, 3.5, 4.2, 4.9, 5.6000000000000005, 6.300000000000001, 7.000000000000001, 7.700000000000001, 8.4 ]

print [-10 .. (10 + 10)] # [ -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ]

print [0 .. -1] # [] ( step is 1 here )

print [7..0..10] # [] (I didnt mean to do this but I actually kind of like it, since the other option is a weird infinite loop)
# print [7..0..] # Prints 7 forever (I kind of like this although I could see someone thinking this is inconsistent)

# print [0..] # Prints forever

# print [0..-1..] # Prints forever in the other direction

# Works for for loops as well
for [1..20]:
    print $