Big = import 'Big'

{ operate, isNumber } = import './'

###
  Given a button name and a calculator data object, return an updated
  calculator data object.

  Calculator data object contains:
    total:String      the running total
    next:String       the next number to be operated on with the total
    operation:String  +, -, etc.
###

export calculate = fn: obj, buttonName
    | buttonName == "AC" -> obj:
        total = null
        next = null
        operation = null
    | isNumber buttonName
        | buttonName == "0" and obj.next == "0" -> obj()
        | obj.operation
            | obj.next -> obj: next = obj.next ++ buttonName
            | -> obj: next = buttonName
        | obj.next -> obj:
            next = obj.next == "0" ? buttonName : obj.next + buttonName
            total = null
        | -> obj:
            next = buttonName
            total = null
    | buttonName == "%"
        | obj.operation and obj.next ->
            result = operate obj.total obj.next obj.operation
            return obj:
                total = (Big result).div(Big "100").toString()
                next = null
                operation = null
        | obj.next -> obj:
            next = (Big obj.next).div(Big "100").toString()
        | -> obj()
    | buttonName == "."
        | obj.next
            | obj.next.includes "." -> obj()
            | -> obj: next = obj.next ++ "."
        | -> obj: next = "0."
    | buttonName == "="
        | obj.next and obj.operation -> obj:
            total = operate obj.total obj.next obj.operation
            next = null
            operation = null
        | -> obj()
    | buttonName == "+/-"
        | obj.next -> obj: next = (- Num obj.next).toString()
        | obj.total -> obj: total = (- Num obj.total).toString()
        | -> obj()
    | obj.operation -> obj:
        total = operate obj.total obj.next obj.operation
        next = null
        operation = buttonName
    | !obj.next -> obj: operation = buttonName
    | -> obj:
        total = obj.next
        next = null
        operation = buttonName