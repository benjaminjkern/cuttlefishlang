# Cuttlefish will automatically purge unreachable code

if true:
    print "hi"
else:
    print "goodbye"

###
f = fn:
    print "this should be in"
    return 5
    print "this shouldn't"
###

x = 0

repeat:
    print "hello"
    x += 1
    if x > 10: break

print "This should be in"


###

TODO: keep track of whether or not variables have changed

while x < 100:
    print "x isnt changing in loop so it should count as an infinite loop"

###

while true:
    print "hello"
    continue
    print "goodbye"

print "This is also unreachable"