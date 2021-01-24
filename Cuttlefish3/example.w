Double = type:
    (Bool,) ** 64 value

Integer = type:
    (Bool,) ** 32 value

Double ++= fn:
    Integer a ->
        # Code that turns an integer into a double

Integer ++= fn:
    Double a ->
        # Code that turns a double into an integer

Number = type (Double | Integer)

add = fn:
    Double a, Double b ->
        # Code that adds two doubles
    Double a, Integer b ->
        add a (Double b)

