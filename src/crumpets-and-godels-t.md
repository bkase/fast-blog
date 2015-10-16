# Crumpets and Gödel's T

Gödel's T is a simple, but extremely powerful language that really excited me when I first learned about it in [Bob Harper's 15-312 class at CMU](TODO). I think even those unfamiliar with programming language theory could still benefit from understanding how Gödel's T works. In this post, I'll assume minimal familarity with formal PL theory and explain how this language works and show how to use it. Hopefully you'll find it fascinating too! 

At that point in time when Gödel published his first paper on his System T (1958!), type theory as we know it today did not exist, 
so I'll be explaining Bob Harper's definition from [Practical Foundations for Programming Languages](http://www.cs.cmu.edu/~rwh/plbook/book.pdf).

For a more formal and rigorous explanation check out Chapter 9 of [Practical Foundations for Programming Languages](http://www.cs.cmu.edu/~rwh/plbook/book.pdf). (Review the earlier chapters if necessary)

## How the language works

Gödel's T is composed of natural numbers, anonymous functions, and a special operator called primitive recursion. In this language, all functions are total, an infinite loop cannot be programmed, Gödel's T is _not_ a Turing complete language. Even so, you can do a lot!

### Natural Numbers

The natural numbers in Gödel's T are formed via construction.
A natural number is either zero, `Z`, or the successor of some other natural number `x`, written as `S(x)`.
It's type is `Nat`

Here's how you would declare it in a modern programming language:

```
enum Nat {
  case Z // 0
  case S(Nat) // 1 + x
}
```

In Gödel's T, the natural number 3 is declared like this:

```
S(S(S(Z)))
```

and the number zero is declared like this:

```
Z
```

### Variables

Variables in this language, despite the name, do not vary. They are immutable. 
There is no assignment operator. The only way to introduce a variable is through a function or the recursor (which will soon be described).

### Functions

Functions in Gödel's T are of type `τ1 -> τ2` for any two types `τ1` and `τ2`.

For example:

`Nat -> Nat` is the type of a function that takes one `Nat` and returns another `Nat`.

`(Nat -> Nat) -> Nat` is the type of a function that takes a function `Nat -> Nat` and returns a single `Nat`.

Functions are anonymous lambda expressions of the form:

`λ(x: τ)e` where `x` is some variable of some type `τ` and `e` is any expression.

`λ(x: Nat)x` is of type `Nat -> Nat`.

a function can be eliminated through application:

```
λ(x: Nat)x(Z) => Z
```

Here we're passing `Z` into the function `λ(x: Nat)x` (the identity function) and get back `Z` as a result.

### Primitive Recursor

The recursor is by far the most complicated and interesting part of Gödel's T.

The idea is that given some expression `e` of type `Nat`, if `e` evaluates to zero return some base case `e0`. 
If `e` does not evaluate to zero, it must be some number greater than or equal to 1 (since natural numbers count up from zero).
If this is the case, the number can be expressed in the form `S(x)` where `x` is some other natural number.

In this `S(x)` case bind `x` (`e` minus 1) to a variable and bind the result of this same recursion to a variable `y` and then use `x` and `y` in some other expression `e1` which is returned.

In a modern language (for instance Swift) it might look something like this:

```
func rec<U>(e: Int, e0: U, e1: (Int, U) -> U) -> U {
  if e == 0 { // e = Z
    return e0
  } else { // e = S(x)
    let x: Int = e - 1
    let y: U = rec(e - 1, e0, e1)
    return e1(x, y)
  }
}
```

In Gödel's T it is written like this: 

```
rec e { Z => e0 | S(x) with y => e1 }
```

## Cool functions

With just these tools, we can build many functions.

Here is `plus`:

```
λ(a: Nat)λ(b: Nat)rec a { Z => b | S(x) with y => S(y) }
```

NOTE: Since we don't have [product types](http://en.wikipedia.org/wiki/Product_type) primitives, the function is [curried](http://en.wikipedia.org/wiki/Currying).

We take two parameters `a` and `b`, and recurse on `a`. If `a` is zero, `0 + b = b` so we can just return `b`.
If `a` is greater than zero, recurse and bind it to `y` (so `y = (a - 1) + b`. Notice that: `S(y) = 1 + y = 1 + (a-1) + b = a + b` so we're done.

=======================

TODO more functions

