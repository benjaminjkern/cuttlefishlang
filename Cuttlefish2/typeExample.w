


ben = fn: 5 (usePlus ? + : -) 5
ben() # Error : usePlus is not defined

usePlus = true
ben() # 10

usePlus = false
ben() # 0