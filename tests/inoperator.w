x = [2, 5, 8, 9, 2]

print 5 in x # true 
print 4 in x # false


y = [4..]
print 4 in y # true
print 5 in y # true
print 3 in y # false
print 8.5 in y # false
print 10000000 in y # true

z = [0..-1..]
print 0 in z # true
print 1 in z # false
print -1 in z # true
print -100000 in z # true


w = [8..0.5..20]
print 11.5 in w # true
print 21 in w # false