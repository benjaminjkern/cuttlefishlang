addSix = fn: x -> x + 6

x = 12

print 5(x)                    # 60
print x(5)                    # 60

print 5 addSix x              # 90

print (addSix * addSix) 10    # 22

print (addSix ^ 4) 10         # 34


f = fn: x -> x - 8
g = fn: x, y -> x + y

print f g 8 f 8

# f  g  8   f  8
# f (g (8) (f (8)))