before = "before"

main = prc:
    inside = "inside"

    print before
    print inside
    print after

    jake = fn: k ->
        print k
        print inside
        print after
        print insideafter

    insideafter = "whoah"
    # print hello

after = "after"

main = prc: j ->
    print after
    # print inside
    print before

# print j

while true:
    print "I'm doing something else here"


### 


This will all work, since functions are verified in a callback at the end of the target scope. Works with multiple callbacks