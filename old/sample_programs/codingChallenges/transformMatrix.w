transformMatrix = fn: arr ->
    # Matrix.size gets the matrix size of arr if it can be converted to a matrix and returns it as a tuple
    size = Matrix.size arr
    newMatrix = 0 ** size

    repeat size[0]: i ->
        repeat size[1]: j ->
            repeat size[0]: i2 | i2 != i ->
                newMatrix[i, j] += arr[i2, j]
            repeat size[1]: j2 | j2 != j ->
                newMatrix[i, j] += arr[i, j2]

    return newMatrix