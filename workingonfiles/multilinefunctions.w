x = 5

f = fn:
    print 'hello'
    print x # It has no idea what x is, so this would crash
    x = 7

print x

f()

print x # didnt change

x = 5

print x

f()

print x