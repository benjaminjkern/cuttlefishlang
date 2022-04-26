assert = fn: false -> throw "Asserted expression is false!"; true -> {}

# Since exceptions are just sorta thrown down the line rather than thrown immediately, you can put a catch block into a function
prebuiltCatcher = catch:
    e | e.message[0] == "A" -> print e

assert 5 < 4
prebuiltCatcher()

throw "Nah"
prebuiltCatcher() # Should halt with thrown error

# The issue with this: This means I would have to call every function down the line
# Or I would have to keep track of which functions can catch and which ones dont
# Or I can keep track of which functions can catch and keep track of what they can catch
# I just dont like try catch statements
# Alternative: Have a catcher type of function

# VVVVVVVVVV
# catch is itself a subtype of fn, which is why you can put a pattern into it, and when returned it gets called with any part of the state that has an exceptions
