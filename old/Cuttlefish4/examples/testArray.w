print 'Enter the array elements:'
n = Int input()

arr = [
    repeat n: i ->
        print 'Enter [{ i + 1 }] element :'
        Int input()
]
2values = for values: x -> 2 * x
hello = [for values: x -> 2 * x]

max = arr.max()
min = arr.min()

print 'Maximum value in the array is: {max}'
print 'Minimum value in the array is: {min}'
print 'Difference between max and min elements is : {max - min}'