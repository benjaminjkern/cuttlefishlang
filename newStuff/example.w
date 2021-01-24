print "Hello, world!" # Hello, world!

print 5 + 5 # 10

print 8 * 3 + 2 / 4 - 12 # 12.5

print 4 < 5 # true

print 8 * 8 >= 100 # false

print 5 * 5 == 25 # true

ben = 22
winnie = 12
bill = 57

print ben > winnie # true

print ben == bill # false

josh = ben

print josh == ben # true

print josh # 22

josh += 1

print josh # 23

if josh < 25:
    print "Josh is not 25 yet!"
else:
    print "Josh is getting very old!"


while josh < 25:
    josh += 1
    print "Happy birthday Josh!"

print "Josh died at the ripe old age of " ++ josh





# Add up all the numbers from 1 to 100

sum = 0
counter = 1

while {counter <= 100}:
    sum += counter
    counter += 1

print sum


sum = 0
for (counter = 1, prc: counter <= 100, prc: counter += 1) prc:
    sum += counter

sum = 0
for (1, fn: $ <= 100, fn: $ + 1) prc: counter ->
    sum += counter
print sum

sum = 0
for [1..100] fn: counter ->
    sum += counter

sum = reduce [1..100] (fn: (p,c) -> p + c) 0

print sum [1..100]








# collections
list_of_nums = [1, 2, 3, 4, 5]

print list_of_nums # [1, 2, 3, 4, 5]



Magic 8 ball

Dice roller