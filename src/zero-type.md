# The Zero Type

Zero, the type containing zero values, has only recently entered mainstream languages (like Swift and Kotlin). You can use Zero to provide contracts about the behavior of your code concisely. Zero's actual applications are not obvious. In this post, I'll explain what the zero type is and how you can use it useful ways.

## What is it?

Zero aka ((bottomsymbol)) (pronounced bottom) aka void is type that contains no values.

You cannot write a terminating program (that compiles) whose control flow passes over a value of type Zero.

```kotlin
val x: Zero = // ???
```

It is worth noting Zero is not what many older mainstream languages call void. "Void" used in C or C-like languages actually means One or Unit. There is exactly one value contained in that type. C and it's derivatives are wrong. [Void actually means zero](linktoreputablesourceaboutzero).

```java
// Java using void to mean unit
public static void main(String[] args) {
  System.out.println("Hello world");
  return;
}
```

Here the function returns what Java calls `void`. Returning nothing is implicitly returning the one value that is inhabited in that type. If this function actually returned `Zero` it would need to diverge (infinite loop) or else it would not compile.

## How do I define it?

In Swift:

```swift
enum Zero
```

Zero is an algebraic sum type (or Swift enum) with no cases.

## How do we use it?

Before we talk about that. Let's talk about `Either`.

```swift
enum Either<T, R> {
  case Left(T)
  case Right(R)
}
```

Either is the dual of a 2-tuple or pair.

Rather than providing two pieces of information during the introduction, and one projection in the elimination (in the case of a pair):

```swift
// introduction
val numAndStr = (1, "hello")

// elimination
numAndStr.left // get the num
```

We provide one piece of information during introduction and two when we extract the information.

```swift
// introduction
val numOrStr = Left(1)

// elimination
switch numOrStr {
  case .Left(let num): // do something with num
  case .Right(let str): // do something with str
}
```

Let's say I'm making a function that will either complete, or fail with some error message. A good way to do that is with an error message.

```swift
func TryToUnwrapInt(iOpt: Int?): Either<Int, String> {
  if let i = iOpt {
    return .Left(i)
  } else {
    return .Right("Bad int")
  }
}
```

However, what if we were trying to conform to some protocol that allowed for a failable method -- and you needed to implement some concrete specialization of a function that looks like this:

```swift
// try to do some work and give back a T if successful or an Error if failed
func TryWork<T, Error>(): Either<T, Error>
```

Now what if your piece of work will _never_ fail.
With `Zero` you can do something like this:

```swift
func TryWork<Int, Zero>(): Either<Int, Zero> {
  return .Left(5)
}
```

You cannot construct something of type zero, so it is _impossible_ to provide an error with compiling code. Cool right?

## Futures

That's cool, but maybe it's still a little abstract.

Futures are values that are possibly not yet computed.

Consider the [BrightFutures](brightfutureslink) library:

```swift
// find fib(20) in the background
val fib20 = future { fib(20) }
fib20.onComplete { println("It's done (this prints later)") }
println("this prints immediately")
```

BrightFutures' `Future` objects are actually `Future<T, Error>` aka either some long computation that eventually returns a value of type `T` or some error of type `Error`.

You cannot construct a future without it knowing what error type you want.

```swift
val fib20: Future<Int, Zero> = future{ fib(20) }
```

`fib(20)` cannot fail so we can ensure this by passing `Zero` into the error parameter!

By returning a `Future<T, Zero>` you've created a contract with the compiler that your future will never fail. And conversely, by consuming a `Future<T, Zero>` as input you don't need to handle any errors because there won't be any!

Alternatively, you can create a future that _always_ fails by defining a value of type `Future<Zero, T>`.

`Signal`s in [ReactiveCocoa](linktoreactivecocoa) are also built in the same way as [BrightFuture](link)'s futures.

## Use Zero!

Zero lifts what traditionally would be a runtime assertion into a type-safe contract. Your coworkers and you yourself can never have compiling code that breaks the contract.

Any abstract type whose meaning can contains something like either I return some A or some B, you can potentially use Zero.


