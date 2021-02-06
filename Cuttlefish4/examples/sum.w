sum = fn:
    [] -> []
    [Num] nums -> nums[0] + sum nums[1..]

###

Should Shrink to just []