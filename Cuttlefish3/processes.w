testProcess = prc:
    i = 0
    while i < 10
        put i
        i += 1

print testProcess # <Process>
print testProcess() # [0,1,2,3,4,5,6,7,8,9]
print testProcess()() # 0

testProcess2 = prc:
    i = 0
    while i < 10
        return i
        i += 1

print testProcess2 # <Process>
print testProcess2() # 0
print testProcess2()() # 0()