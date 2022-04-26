MainClass = class:
    constructor:
        Int i, SubClass subclass ->
            boolField = i > 0
            subClassField = subclass
        Int i ->
            boolField = i > 0
            subClassField = SubClass 0

    function1 = fn:
        if subClassField.byteArrayField == null:
            return 0

        return subClassField.byteArrayField.length

    function2 = fn:
        Int i ->
            returnValue = SubClass 2
            repeat 5: index ->
                returnValue.byteArrayField[index] = i;
            return returnValue
        [Int] shortArray -> 'A'

    function3 = fn: Int i ->
        stringField = 'Value {i} was passed'
    
    function4 = fn: SubClass s1, String s2 ->
        stringField = s2
        return s1.byteArrayField
        

