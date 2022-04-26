# selection from a list can be done in a couple ways

my_list = [5, 3, 0, 2, 0, 1]

my_list[0]    # 5
my_list[1,2]  # [3, 0]
my_list[0..3]  # [5, 3, 0, 2]
my_list[0..<3] # [5, 3, 0]
my_list[my_list] # [1, 2, 5, 0, 5, 3]
my_list[my_list[my_list]] # [3, 0, 1, 5, 1, 2]
my_list[my_list][my_list] # [3, 0, 1, 5, 1, 2], I thought it was interesting that these end up being the same
my_list[12]   # Error : Index out of bounds
my_list[-1]   # 1
my_list[-12]  # Error : Index out of bounds
my_list[0..-2] # [5, 3, 0, 2, 0] # Kinda weird, but it starts at 0 and keeps going until it matches -2 (second to last)
my_list[..-1] # [1, 0, 2, 0, 3, 5] # Easy way of reversing lists, since the .. operator doesnt have a start, it is forced to count backwards from -1 until it breaks, which happens at -7
my_list[..3]  # [2, 0, 3, 5, 1, 0, 2, 0, 3, 5] # If you do this this way though, its a little weird

[..-1] # [-1, -2, -3, -4, -5, -6, -7, -8, ...]
[..-1][..-1] # this will run forever since the second list needs to wait for the first one to have an end. Theoretically this is the same as
[-Infinity..] # [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity] # Which I think is kinda funny but it makes sense
# A better way of doing this might be
[Int MIN..] # [-2147483648, -2147483647, -2147483646, -2147483645, -2147483644, ...]
Set([Int MIN..Int MAX]) == Set(Int) # This will take a long time but this is technically true hahahaha
# In general please dont call Set(Int) (The set of all valid ints)

# Anyways
my_list 0       # 5
my_list 0 2     # 10, since there is no "[Num] Num Num" pattern, it parses as ([Num] Num) Num -> Num Num -> Num
my_list[0, 2] 2 # Error, There is no 2-element



# I AM ACTUALLY NOT SURE aboUT THIS since you can always just run the specific indices and it would be faster. Actually fuck it you cant do this
my_list[true, false, true, false, true, true] # Error
my_list[true, false, true] # Error
my_list[true, false, true, false, true, true, false, true] # Error

my_list[fn: $ %= 2]          # [0, 2, 0],          filter since return type is boolean
my_list[fn: $ % 2]           # [1, 1, 0, 0, 0, 1]  map since input type matches list type
my_list[fn: $] == my_list    # true
my_list[fn: true] == my_list # true
# As of right now you cannot map a list to a list of booleans because of this

[a %= 2 : a in my_list]