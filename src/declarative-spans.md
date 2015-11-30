# Declarative Android Spans with Function Composition

Making spannable text using the normal Android APIs is pretty cumbersome especially for our use-case of server-sent strings. Through the power of Kotlin and function composition we can make a cleaner API! In this post, we'll describe the motivation behind and implementation of a declarative wrapper around Android's CharSequence spans.

On Android, a `CharSequence` is an interface `String` and String-like classes implement that provides information about how to style a sequence of characters. Most (if not all) standard UI views that take text take it in the form of `CharSequence`. A span applies a style to a portion of text.

Most of our strings originate from or are overridable by our server, but sometimes we also want the server to tell us where a style is applied. The style is very specific to the where we're using the string, and is sometimes to complex to represent solely in HTML. So we decided to mark sections of the string we want to be styled with `*` characters and then specify how they should be styled in each place that they're used.

For example in `"knows *bkase* and *7 others*"` we want to bold `bkase` and `7 others`. In the string `"Check out the *Terms of service* for more information"`, we want to color the `Terms of service` and apply the behavior that on click we want to open our ToS page.

Here is some code from Roll using the Formatting library:

```kotlin
val str = "Check out the *Terms of service* and *Privacy Policy*"

val tosStrategy =
    Formatting.linkStrategy(this, "https://www.tryroll.com/static/tos.html")
val privacyStrategy =
    Formatting.linkStrategy(this, "https://www.tryroll.com/static/privacy_policy.html")

Formatting.applyToStarred(str,
  listOf(
    tosStrategy o Formatting.boldStrategy,
    privacyStrategy o Formatting.boldStrategy
  ))
```

For reference, this is an example of how you would go about applying that styling using standard Android APIs (with some helper functions elided)

```
val str = "Check out the *Terms of service* and *Privacy Policy*"

val (tosIdxBegin, tosIdxEnd, rest) = findTwoStars(str)
val (privacyIdxBegin, privacyIdxEnd, _) = findTwoStars(rest)

val noStars = removeStarsInStr(str)
val (tosIdxBeginFix, tosIdxEndFix, privacyIdxBeginFix, privacyIdxEndFix) = nastyMathToGetRidOfStars(tosIdxBegin, tosIdxEnd, privacyIdxBegin, privacyIdxEnd)

var spannable = SpannableString(str)
spannable.setSpan(StyleSpan(Typeface.BOLD), tosIdxBeginFix, tosIdxEndFix - tosIdxBeginFix + 1, 0)
spannable.setSpan(ClickOnLink(ctx, "https://www.tryroll.com/static/tos.html"), tosIdxBeginFix, tosIdxEndFix - tosIdxBeginFix + 1, 0)

spannable.setSpan(StyleSpan(Typeface.BOLD), privacyIdxBeginFix, privacyIdxEndFix - privacyIdxBeginFix + 1, 0)
spannable.setSpan(ClickOnLink(ctx, "https://www.tryroll.com/static/privacy_policy.html"), privacyIdxBeginFix, privacyIdxEndFix - privacyIdxBeginFix + 1, 0)

// You also need this class

class ClickOnLink(val ctx: Context, val url: String): ClickableSpan() {
  override fun updateDrawState(ds: TextPaint) { }
  override fun onClick(widget: View) {
    val intent = Intent(Intent.ACTION_VIEW)
    intent.setData(Uri.parse())
    ctx.startActivity(intent)
  }
})
```

Imagine trying to apply a span strategy to an unknown number of starred sections this way!

Here's how you can do that with our Formatting library:

```
Formatting.applyToStarred(str, always(Formatting.boldStrategy))

// where `always` takes a `v: T` and produces an infinite stream of `v`s
// (one of the functions in our toolbox of helpers)
fun always<T>(t: T): Iterable<T> {
  return object: Iterable<T> {
    override fun iterator(): Iterator<T> = 
        object: Iterator<T> {
            override fun next(): T = t
            override fun hasNext(): Boolean = true
        }
  }
}
```

### How to use?

First let's break this down:

```
Formatting.applyToStarred(str,
  listOf(
    tosStrategy o Formatting.boldStrategy,
    privacyStrategy o Formatting.boldStrategy
  ))
```

`Formatting.applyToStarred` takes the string that the formatting is applied to, and an iterable of `CharSequence` transformation functions (which we call strategies) and applies each strategy from the iterable to each section of starred text to return a fully styled `CharSequence`. See the type signature:

```
fun applyToStarred(s: String, spanStrategies: Iterable<(CharSequence) -> CharSequence>): CharSequence
```

Take a look at one of the strategies we pass in the list in our example:

```
tosStrategy o Formatting.boldStrategy
```

Here is the implementation of the `o` operator in Kotlin

```
// Usage: f1 o f2 = { x -> f2(f1(x)) }
fun <A, B, C> Function1<A, B>.o(g: (B) -> C): (A) -> C {
  return { g(this.invoke(it)) }
}
```

We're actually passing the composition of two strategies. Since strategies are functions, they can be composed with function composition!

Exploiting the behavior of functions like this is an example of denotational design -- the familiar "function" datastructure completely defines a span strategy. If you understand function composition, you immediately understand span strategy composition.

### How does it work?

At a high-level, what we're doing is splitting our input by the `*` character. With regards to whether or not a section should be styled, the split string list is an alternating pattern of No-Yes-No-Yes-No.

Thus, we transform our `spanStrategies` input to include `identity` stratgies in the No sections of the list. This can be done with a simple left-fold that concats [elem, identity] to a list starting with [identity].

Then you can zip the modified strategies with the No-Yes-No-Yes-No list and apply the strategies to each chunk, then combine them all together into a `SpannableStringBuilder` which implements the `CharSequence` interface.

Full implementation:

```
fun applyToStarred(s: String, spanStrategies: Iterable<(CharSequence) -> CharSequence>): CharSequence {
    val sb: SpannableStringBuilder = SpannableStringBuilder()

    return s.split('*').zip(
          spanStrategies.fold(listOf(identityStrategy)) { strats, strat -> strats + strat + identityStrategy }
      ).mapPair{ str, strat -> strat(str) } 
      .fold(sb) { sb, c -> sb.append(c); sb }
    
    // where Iterable<T>.mapPair<U>(f: T -> U) = this.map{ p -> val (a, b) = p; f(a, b) }
  }
```

A subtle benefit with implementing the function in precisely this way:

* By zipping over the split string instead of the strategies, we allow an input of `spanStrategies` that are optionally MORE than the number of starred sections our string has.

In fact, you can even pass an infinite stream of strategies which we do often in our Android code base to ensure that there is always a strategy no matter how many starred sections our server sends in a string.

Note that an imperative implementation that indexes into the split string and the strategies would not work with infinite streams (at least with Iterables) because there is no random access only a way to get the "next" element.

Functional programming!

### Conclusion

The Formatting library makes it easy to manage applying spans to CharSequences in Android. Try to apply this way of thinking whenver you encounter awkward APIs!

