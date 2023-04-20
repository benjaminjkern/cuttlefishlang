x = fn: 5

y = x 4

print y # Prints 10

x = fn: $ + 5

print x 4

y = fn: $ * 10 # Was parsing this as (fn: $ * 1)(0) earlier, hopefully this should be fixed

print y 5 # 50

# Can also put statements
x = fn: print 'test'
x()