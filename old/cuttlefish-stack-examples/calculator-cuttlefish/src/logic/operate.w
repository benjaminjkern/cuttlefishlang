Big = import 'Big'

export operate = fn: numberOne, numberTwo, operation ->
    one = Big(numberOne || "0")
    two = Big(numberTwo || (operation == "÷" || operation == 'x' ? "1": "0")) # If dividing or multiplying, then 1 maintains current value in cases of null

    return (
        switch operation:
            "+" -> one.plus(two)
            "-" -> one.minus(two)
            "x" -> one.times(two)
            "÷" ->
                if two == "0":
                    throw "Divide by 0 error"
                    "0"
                else:
                    one.div(two)
            _ -> throw `Unknown operation {operation}`
    ).toString()