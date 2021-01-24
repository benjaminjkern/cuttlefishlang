# package main and import fmt are unecessary in cuttlefish

###
package main
import "fmt"
Here’s a function that will take an arbitrary number of ints as arguments.

func sum(nums ...int) {
    fmt.Print(nums, " ")
    total := 0
    for _, num := range nums {
        total += num
    }
    fmt.Println(total)
}
func main() {
Variadic functions can be called in the usual way with individual arguments.

    sum(1, 2)
    sum(1, 2, 3)
If you already have multiple args in a slice, apply them to a variadic function using func(slice...) like this.

    nums := []int{1, 2, 3, 4}
    sum(nums...)
}
###

sum = fn: Int* nums ->
    print join nums " "
    total = 0
    for num in nums:
        total += num
    print total

sum2 = fn: (Int,) ** (Int n) nums ->
    sum ...nums

main = prc:
    sum 1 2
    sum 1 2 3
    nums = [1, 2, 3, 4]
    sum ...nums

###
package main
import "fmt"
This function intSeq returns another function, which we define anonymously in the body of intSeq. The returned function closes over the variable i to form a closure.

func intSeq() func() int {
    i := 0
    return func() int {
        i++
        return i
    }
}
func main() {
We call intSeq, assigning the result (a function) to nextInt. This function value captures its own i value, which will be updated each time we call nextInt.

    nextInt := intSeq()
See the effect of the closure by calling nextInt a few times.

    fmt.Println(nextInt())
    fmt.Println(nextInt())
    fmt.Println(nextInt())
To confirm that the state is unique to that particular function, create and test a new one.

    newInts := intSeq()
    fmt.Println(newInts())
}
###

intSeq = fn:
    i = 0
    return prc:
        i++
        return i

main = prc:
    nextInt = intSeq()
    print nextInt() # 1
    print nextInt() # 2
    print nextInt() # 3

    newInts = intSeq()
    print newInts() # 1

###
package main
import "fmt"
This fact function calls itself until it reaches the base case of fact(0).

func fact(n int) int {
    if n == 0 {
        return 1
    }
    return n * fact(n-1)
}
func main() {
    fmt.Println(fact(7))
}
###

fact = fn:
    0 -> 1
    Int n -{Int}-> n * fact (n - 1)
    # Putting the {Int} in there is not necessary, but it speeds up compile time because it has less options to search through

main = prc: print fact 7