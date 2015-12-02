# Benefits of Types

Large programs in a non-statically typed language will be riddled with bugs (without an intense amount of discipline and code review that is only possible with very large teams). Strong statically typed programming languages enforce correctness, provide documentation, make reuse obvious, and run fast. 

## Correctness

Types enforce logical correctness

```kotlin
// ages have to be numbers
// your age cannot be "carrot"
val age: Int = 34

// in un-typed languages your age can be "carrot"
// that sucks
```

Your compiler reasons about your code. Instead of just you.

This is the obvious one.

## Documentation

Types tell you what your code does
If you change your "documentation", your code won't compile until it matches!

```
// what does this function do?
func concat(x: String, x: String): String

// what does this function do?
func concat(x: [Int], y: [Int]): [Int]
```

If you change code attached to a comment,
the compiler won't stop you

```
/**
 * Concat two strings to make a larger one
 */
var z = x + y
```

Whenever I find myself writing a comment I always think, can I express this clearly with better types or another function?

## Reuse + Testability

Types help you write composable code

In Roll, the we have a step where we prefetch photos for the cards in the feed.

This is what the code used to look like:

```swift
// before
func prefetch(photo: Photo, /*...*/)
```

Handling the prefetch finishing wasn't exposed in the type signature.
We wanted to reuse this logic for getting photos for notifications:

```swift
// after
func prefetch(photo: Photo, /*...*/): Eventually<PrefetchedPhoto>
```

Now we can do whatever we want with the result!

## Performance

How do untyped languages work?

They're actually uni-typed of type: "you can ask me what I really am":

```javascript
var x = 4 // computer: x is a number
var y = x + 1 // computer: is x a number? good. y is a number
println(fib(y)) // computer: is fib a function? does fib return something I can print? good
```

The computer has to do runtime checks all over the place, because you haven't proven anything about your code (for example that `x` is and always will be a `number`).

Types let the computer solve these problems at compile time. So they don't have to do it runtime. The stronger the type-system, the faster your code will execute.

NOTE: In modern interpreters, hot code can be [JITed](https://en.wikipedia.org/wiki/Just-in-time_compilation) to improve performance in dynamically typed languages. However, only code snippets that could have been given static types in the first place will be optimized.

## Types are important for large programs on small teams

The correctness, documentation, reuse, and performance are too useful to pass up. Using strong statically typed languages is important.

