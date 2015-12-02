# Kotlin

We built [Roll for Android](http://tryroll.com) in Kotlin -- we've written ~30k lines and have been working on it since this Spring. We wanted to iterate on a lot of the software structure we came up with for our Swift iOS app, and for a bunch of pieces we needed a powerful type system. So rather than just stick with Java -- it's way too verbose -- we started looking at alternatives. We wanted a strong static type system. Scala has too much overhead for Android. Kotlin really stood out for us. [This document by Jake Wharton at Square](https://docs.google.com/document/d/1ReS3ep-hjxWA8kZi0YqDbEhCqTt29hG8P44aA9W0DM8/edit?hl=en&forcehl=1) made the decision easier. So we took the risk.

## Great Features

* [Null type safety!](https://kotlinlang.org/docs/reference/null-safety.html)

* [Lambdas can be inlined!](https://kotlinlang.org/docs/reference/inline-functions.html)

No need to be afraid of anonymous inner class overhead on Android when using map/filter/fold on iterables.

* [Reified generics!](https://kotlinlang.org/docs/reference/inline-functions.html#reified-type-parameters)

* [Statically resolved extension functions!](https://kotlinlang.org/docs/reference/extensions.html)

* [Algebraic data types and pattern matching!](https://kotlinlang.org/docs/reference/classes.html#sealed-classes)

* Single-method interfaces/classes can be represented as lambdas! aka

```kotlin
  view.setOnClickListener(new View.OnClickListener() {
      @Override public void onClick(View v) { /* do something */ }
  });
```

  becomes

```
    view.setOnClickListener { /* do something */ }
```

This is great for things like RxJava.

Speaking of which, the Java interoperability is fantastic. Any Android Java libraries we've tried work great from Kotlin.

## Libraries Created

Using these features, we've built:

* a simple dependency injection framework
* a handful of really useful extensions on things like T? (for example monadic bind)
* a hack for algebraic data types and pattern matching (before `sealed class` was released)
* a single-atom-state functional reactive UI component framework
* and of course a fairly complex app.

Android Studio's Kotlin support is fantastic (good job JetBrains!) -- it's a pleasure to use.

## Build Time

The biggest issue for us is the build time. Gradle builds used to take around 5-10 minutes. We invested a week of engineering time in getting a Buck build working alongside gradle. Buck builds are 3minutes max and usually are around 45 seconds. With the most recent Android Studio update, incremental Gradle builds are back down to 20 seconds. I've found that the type system is strong enough that you don't have to do too many build-change a line-rebuild cycles.

## Use Kotlin!

Kotlin is great! The time saved due to the benefits of kotlin make up for any time lost optimizing build times.

(this post was adapted from my [Hackernews comment](https://news.ycombinator.com/item?id=9947020))
