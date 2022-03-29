LivingThing = type: String name, (Int age | 0)

Person = type LivingThing

Dog = (type LivingThing): Person? owner

ben = Person "Ben" 22

winnie = Dog "Winnie" 14 ben

# instantiating
diego = Person:
    name = "Diego"
    age = 22
    hobbies = ["Jousting", "Video Games"]

# can be done out of order when done this way
taluse = Dog:
    age = 9
    owner = diego
    name = "Taluse"

# TODO: FIgure out if they should use this / self / (self reference)

evan = Person
    "E" ++ "v" ++ "a" ++ "n"
    46 // 2

# This is the same as putting parentheses around the terms

###
evan = Person
    "E" ++ "v" ++ "a" ++ "n"
        46 // 2

# Note, this is a parse error

this is the same as writing

evan = Person ("E" ++ "v" ++ "a" ++ "n" (46 // 2))

it will have no problem bringing the 46 // 2 to a 23, but there is no pattern that recognizes a series of string concatenations followed by a number

###

# I think if you want to do keyword arguments you have to do the colon block





# Here is a nice example of types: ADT implementations

Queue = type Collection: type T || Object ->
    head = null

    add = fn: T data, node = QueueNode data
        | head == null -> head = node
        | -> head.add node
    
    # Normally this is called poll but Collection requires a next function if you want this to
    # be used in the cuttlefish control structures such as for
    next = fn:
        put head
        head = head.next

    peek = fn: head

QueueNode = Type: value ->
    QueueNode next = null
    add = fn: QueueNode node
        | next == null -> next = node
        | next.add node

myQueue = Queue()

for [1..10]: num -> myQueue.add 11 - num

for myQueue: print $

# prints the numbers 1 to 10



pig = Iterator:
    done = false
    hasNext = fn: done
    next = fn:
        put a = random() * 6 |> floor
        if a == 1: done = true


A = type:
    print_A = fn: print "Class A"

B = (type A):
    print_B = fn: print "Class B"

main = fn:
    obj_B = B()
    obj_B.print_A()




class A {
    public void print_A() { System.out.println("Class A"); }
}
 
class B extends A {
    public void print_B() { System.out.println("Class B"); }
}
 
class C extends A {
    public void print_C() { System.out.println("Class C"); }
}
 
// Driver Class
public class Test {
    public static void main(String[] args)
    {
        B obj_B = new B();
        obj_B.print_A();
        obj_B.print_B();
 
        C obj_C = new C();
        obj_C.print_A();
        obj_C.print_C();
    }
}