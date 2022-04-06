# This doesnt work yet but it should

moduloSquared = fn: Num z -> (real z) ^ 2 + (imag z) ^ 2

Mandelbrot = type Testable: Int limit | limit > 0 ->

    # test is required when instantiating a Testable
    test = fn: Num c ->
        z = 0
        repeat limit:
            if moduloSquared z >= 4:
                return false
            z = z ^ 2 + c
        return true

mandelbrot = Mandelbrot 100 # Declares a mandelbrot set with step limit of 100

print 1 in mandelbrot

print 0 in mandelbrot

print 1i in mandelbrot

print -0.5 + 0.5i in mandelbrot

# WIP: Importing
import Graphics

# As long as importing works, this will produce a black and white image of the mandelbrot set on whatever screen
# It will simply be black where it is in the set, and white where it is not
# The viewwindow x:[-2...2] by y:[-2...2] of the mandelbrot set gets stretched to fit the screen,
# and the pixel size is given by the screen

# the only reason I gave that much information is so I can verify this is what the code does when I get around to making complex numbers and imports work

for [0..screen.width]: x ->
    for [0..screen.height]: y ->
        z = (2 * x / screen.width - 1) + (2 * y / screen.height - 1) * i
        if z in mandelbrot:
            drawPixel(x, y, Color.BLACK)
        else:
            drawPixel(x, y, Color.BLACK)
