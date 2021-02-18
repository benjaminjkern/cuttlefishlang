ba = {}

for [1..100]:
    ba |= {($ ^ 2) % 100}

pa = {}

for [1..1000]:
    pa |= {($ ^ 2) % 100}

print pa
print ba
print pa == ba
print pa === ba