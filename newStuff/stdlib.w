# Bools, Nums, and Strings are built in
# Functions and Processes are also built in
# Iterables, Lists, Tuples, Sets, Dicts are also built in


while = prc: Process condition, !':', Process loop
    | condition() ->
        loop()
        while condition: loop
    | -> return

for = prc:
    [], Process loop -> return
    Iterable value:rest, Process loop ->
        loop(value)
        for rest loop
    (Process assignment, Process condition, Process next), !':', Process loop ->
        assignment()
        while condition:
            loop()
            next()
    (Object start, Function condition, Function next), !':', Process loop ->
        i = start
        while condition(start):
            loop()
            i = next(i)

if = prc:
    Bool condition, !':', Process ifTrue, !'else', !':', Process ifFalse
        | condition -> ifTrue()
        | -> ifFalse()
    Bool condition, !':', Process ifTrue
        | condition -> ifFalse()
        | -> return

!`{Bool condition} ? {A a} : {A b}` = (fn: | $ -> a; | -> b) condition