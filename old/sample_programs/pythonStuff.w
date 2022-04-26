# from https://wiki.python.org/moin/SimplePrograms

# 1 line: Output
print 'Hello, world!'

# 2 lines: Input, assignment
print 'What is your name?'
name = input()
print 'Hi, {name}.'
# Not actually 3 lines, I dont like the input(promptstring) format.

# 3 lines: For loop, built-in enumerate function, new style formatting
friends = ['john', 'pat', 'gary', 'michael']
for friends: name, i -> print 'iteration {i} is {name}'
# I dont like the enumerate function, I think the javascript way of optional iteration is the best

# 4 lines: Fibonacci, tuple assignment
parents, babies = 1
while babies < 100:
    print 'This generation has {babies} babies'
    parents, babies = babies, parents + babies
# I hate the python .format method, its dumb. Also the tuple assignment is covered in cuttlefish

# 5 lines: Functions
greet = fn: name -> print 'Hello {name}'

greet 'Jack'
greet 'Jill'
greet 'Bob'
# I dont like the print with a tuple and multiple arguments just appending a space between them. It should either print on a different line, or the second argument in a tuple should mean the delimiter or the endline or something

# 6 lines: Import, regular expressions
for ['555-1212', 'ILL-EGAL']:
    /^\d{3}-\d{4}$/ test_string -> print '{test_string} is a valid US local phone number'
    _ -> print '{test_string} rejected'
# Regexes are built in as a pseudo-type, no need for import.
# Could have also been down with test_string.match(/^\d{3}-\d{4}$/) (Parantheses are probably optional)
# for is a reducer

# 7 lines: Dictionaries, generator expressions
prices = dict:
    'apple' -> 0.4
    'banana' -> 0.5

my_purchase = dict:
    'apple' -> 1
    'banana' -> 6

grocery_bill = sum my_purchase: fruit -> prices[fruit] * my_purchase[fruit]

print 'I owe the grocer ${grocery_bill.floor 0.01}'
# dict is a reducer
# sum is a built in reducer
# numbers all have a .floor method with a granularity to round to (granularity centered around 0)
# There is also a Num.floor(num) which acts the same as the python floor() method and allow syou to pass in the same granularity

# 8 lines: Command line arguments, exception handling
main = args ->
    total = sum args: arg -> Int arg
    print 'sum = {total}'
    catch: CastException -> print 'Please supply integer arguments'
# A few differences: Int actually works with any real number, and only throws a CastException if it isnt a number
# Int truncates regular numbers
# Secondly, the catch does not need a corresponding try statement, As long as the exception was created within the same scope, the catch will catch it.
# Thirdly, command line arguments are exclusively passed to the main function, so no need for importing sys
# Fourthly, The catch actually isnt necessary here, since you could just have a pattern matcher. In general I think I will include the catch statement (no try), but I would like to encourage people to not use it.

# 9 lines: Opening files
cuttlefish_files = getAllFilesInCurrentDirectory[fn: fileName -> fileName.endswitch '.w']
for cuttlefish_files.sorted(): fileName ->
    print '    ------{fileName}'
    f = open fileName
    for f.lines(): print

# glob can be a secondary library, idc
# Still working on the filter idea