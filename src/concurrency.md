# Concurrency Categorization

These days, when writing native mobile applications, there is an expectation that your app should be responsive despite needing to perform massive amounts of slow I/O and other operations. We must offload the slow work from the main thread. There are many ways to offload work from the main thread across the Android and iOS platforms. If you agree with my assumptions that I’ll outline below, I believe that at its core, there are six dimensions to consider when evaluating a method for performing and handling asynchronous work: 

* Is it referentially transparent?
* How is the result returned?
* Is it composable?
* Is the execution context coupled or decoupled?
* Local or non-local scoping?
* How difficult is it to learn?

The assumptions:

* Performance overhead of the primitives themselves is negligible: A lot of concurrent work you do involves I/O or expensive computation (otherwise why not just do it on main thread). For UI related events, you might need to use lightweight callbacks.
* You are writing application-level code (some and perhaps all of these properties also apply in other environments but may require different reasoning for you to be convinced)
* You want a general purpose primitive that can be used in a variety of situations

I’ll talk about how to think about these categories, and then go through various primitives that I have seen across both iOS and Android and comment on where this particular primitive falls in each of the dimensions.

## Referential Transparency

Visible side-effects make code harder to reason over. Google it. Containing no or invisible side-effects (such as memoization) is known as referential transparency. A referentially transparent expression is one that can be replaced by its result without changing the behavior of the program. In this context: Can you replace an expression containing your concurrency primitive with its result. Aka does your concurrency primitive do side-effects when being created or used? Eventually, it must perform side-effects for the concurrency to actually be concurrent. However, the act of starting the concurrent work is decoupled from the work logic. Usually dealing with the primitives that just perform side-effects does make WRITING the code easier, but reasoning over that code is hard.

## One Datum or Many Data or Side-effect Data (Unit)

Do you output data or not? If you don’t output any data (aka you return Unit -- Java’s void or Swift’s Void) the data you’re outputting is implicit and therefore a side-effect.

Do you output one and only one piece of data? vs.
Do you output at least one piece of data (but possibly more)?

If you have many pieces of data, the choice is easy. You want a primitive that can output many pieces of data. Anecdotally, trying to achieve outputting many pieces of data with a primitive that only supports returning one and only one piece of data is error-prone and hard to reason about -- I believe this was due to needing long-living mutable state (in the temporal sense).

If you have one piece of data, on the one hand the types provide more precise documentation (since you can only output one piece of data). However, if your primitive is composable you lose this composability without an extra layer of translation.

## Composability

Composability in the context of programming means that there exists some way to combine two or more entities of some type to create something of that same type. Composability is important for clean, maintainable, and flexible code because we don’t have to understand the details to understand some part of a program. Composition is the essence of abstraction.

For motivation: Most of the time, when you run into the number `2`, you don’t care that this was constructed from `(1 + 1)` and you don’t have to. Moreover, `2` means the same thing if it were constructed via `1 + 1` or `2 x 1`.
(`+`) over the integers and (`x`) over the integers takes two integers and returns an integer. Thus both are composable operators (moreover they are monoids -- Google it).

In the same vein as not needing to care about the provenance of certain operations on integers, we also don’t need to care about subtasks in a larger task most of the time. It would be nice to be able to call `AsyncGetData() -> F<Data>` and not care that under-the hood the function first checks disk asynchronously and then when that finishes hits the network, etc. This is known as sequential composition, since we are sequencing two computations one after another.

We also have parallel composition -- if I can asynchronously get a name, and separately I’ve defined how to asynchronously get an age, I should be able to have one entity that can asynchronously get both a name and an age.

I’m not aware of an argument against composability.

## Execution context

An execution context describes how work is executed when it actually runs. Examples of execution contexts include: Always execute on the main thread, execute on some free thread in a thread pool and spawn a new thread if all are busy, or execute on this same thread.

The execution context is either coupled to the site at which the concurrent work is declared or decoupled and can be provided at a later point (obviously before the work is actually executed).

A decoupled execution context means you can reuse more code since you can change the execution context in multiple places. More code becomes trivially testable since you can provide synchronous execution contexts. Coupling execution context with work description provides none of these benefits.

## Scoping

Mutable state makes code harder to reason over. Non-local mutable state is even worse. This is software engineering 101: Use functions, avoid globals. Some concurrency primitives are inherently unscoped -- in other words, concurrent work can be manipulated and listened to from anywhere in your program. This is a global. This is not good.

## Learning Difficulty

This is a bit subjective -- some primitives are harder to learn than others. Given the time constraints of your project, you may choose to use an easier-to-learn primitive that may not fit your needs as well in order to onboard your team faster.

## In General

#### Callback 

Data is provided to you via the parameter of some function you pass in.

* _Effectful_: The callback you provide will be called when the work is done, but just passing the callback implies your async work has started.
* _Many Data_: If your callback is called at all, it is precisely the parameter of the callback that gets the data each and every time the callback is called.
* _Sort of Composable_: Functions compose, and you could create some operator that takes two callbacks and sequences their execution, or runs both callbacks in parallel. However: Unlike other primitives, the actual asynchronous work doesn’t return some data structure that you can easily manipulate. Composition is not clean.
* _Coupled Execution Context_: The caller choose on which execution context your work will execute.
* _Locally Scoped_: You cannot poke a callback without having reference to it.
* _Easy to Learn_: A callback is just a function.

## On Android

#### AsyncTask (or “Thread” etc)

* _Referentially Transparent_: You must `execute()` or `run()` the AsyncTask or thread explicitly
* _Side-effect Data_: Threads and AsyncTasks don’t return any result when they complete. If you do want to do some work in the background that produces data, that data that is produced needs to be via side-effects.
* _Not Composable_: You cannot combine two AsyncTasks to produce a new AsyncTask. You cannot combine two Threads to produce a new thread.
* _Coupled Execution Context_: Execution context is the Thread. In an AsyncTask, the background work is done in a background thread, the foreground work is done in a UI thread.
* _Locally Scoped_: You cannot easily poke a thread or an async task without an instance of the asynctask or thread object.
* _Easy to Learn_: Good documentation, simple.

#### Java Future

* _Effectful_: The mere existence of a future implies it is running
* _One Datum_: a Future returns exactly one piece of information when the work completes or it will throw an exception.
* _Not Composable_: You cannot combine two Java Futures to produce a new Java Future.
* _Coupled Execution Context_: The Java Future is the result of adding some piece of work to an Executor, the executor determines the execution context. Therefore, the existence of a Future is coupled to the execution context.
Also: Getting data out of a Java Future requires potentially blocking some execution context.
* _Locally Scoped_: You cannot poke a future from afar.
* _Easyish to Learn_: A Future is just an asynchronous value.

#### EventBus (like Guava’s; greenrobot/EventBus; Otto)

* _Effectful_: The bus can produce messages -- in order to listen you must attach callbacks.
* _Many Data_: The bus can fire many times.
* _Not Composable_: You cannot easily combine two or more buses to make a new bus.
* _Usually Decoupled Execution Context_: A good event bus library lets you supply some executor or handler that is in charge of scheduling the work. However, the scheduling is tied to the bus, not the individual atom of work.
* _Locally Scoped_: You cannot poke an eventbus without a reference to it, unless you purposefully make it globally accessible.
* _Easy to Learn_: Simply a bus to send and receive events

#### ListenableFuture (Guava)

_Effectful_: The mere existence of a future implies it is running.
_One Datum_: a ListenableFuture returns exactly one piece of information when the work completes or fails with an exception.
_Composable_: Transform (flatmap), AllAsList (sequence), etc. allow for the composition of ListenableFutures.
_Coupled Execution Context_: The existence of a future implies it has already started in some context. See Java Future.
_Locally Scoped_: You cannot poke it with a reference to the object
_Easy-ish to Learn_: Slightly more features than a Java Future, but uses common functional programming idioms like `map`.

#### RxJava (reactive streams)

* _Referentially Transparent_: Doesn’t start until you start it.
* _Many Data_: An Rx Stream can fire many times before completing or failing
* _Composable_: Rx Streams compose in many many ways in sequence and in parallel and with interleaving.
* _Decoupled Execution Context_: Execution contexts of the work and of listeners can be independently changed and chained on async work.
* _Locally Scoped_: You cannot poke a react stream without a reference to it.
* _Hard to Learn_: There are many operators to learn, and you must understand how the streams work in order to avoid overflowing buffers.

## On iOS

#### Dispatch_async work

* _Effectful_: When work is dispatched, it will eventually run.
* _Side-effect Data_: Dispatched work does not return a value explicitly.
* _Not Composable_: If you’ve dispatched work twice, you cannot combine them into one thing.
* _Coupled execution context_: The execution context is precisely the dispatch queue you chose when you queue work.
* _Locally Scoped_: You can prod work only if you have a reference to the work.
* _Easy to learn_: Give the dispatch_async a block, and it will run asynchronously.

#### NSOperation

* _Referentially Transparent_: An NSOperation must explicitly be started (usually with the help of an NSOperationQueue).
* _Side-effect Data_: NSOperations don’t return values, so in order to get information you must perform side-effects.
* _Not Composable, but can declare dependencies_: You can add dependencies to NSOperations, but you must do so through an NSOperationQueue via side-effects.
* _Decoupled Execution Context_: The execution context depends on the NSOperationQueue you add the work to.
* _Locally Scoped_: You need an NSOperation in order to poke it.
* _Hardish to Learn_: NSOperation and NSOperationQueue have a lot of power, but that power comes with more learning necessary to understand its use.

#### NSNotifications

* _Effectful_: When a notification is scheduled, the listeners will eventually be called.
* _Side-Effect Data_: Notification handlers do not return a value when they are done.
* _Not Composable_: Two notifications cannot be combined.
* _Coupled Execution Context_: NSNotificationCenter will call your work on the same dispatch queue that you sent the notification on.
* _Globally Scoped_: You can listen to an NSNotification from anywhere you register.
* _Easy to Learn_: It’s just an event bus that is implicitly instantiated in the global scope.

#### Futures (via BrightFutures)

Exactly like ListenableFutures except the Error parameter is also generic to allow for more type-safety (and you can use zero case enums to forbid errors statically).

#### RxSwift (similarly ReactiveCocoa)

Exactly like RxJava.

## The Dream

For some reason, there doesn’t exist a simple one-datum concurrency primitive on iOS or Android that is referentially transparent, composable, has a decoupled execution context, and is locally scoped. You shouldn’t have to use Rx for tasks that logically need to complete once. Scala has a few implementations of such a primitive: `Task`, but both the iOS and Android communities should get on this!

## In Summary

These six categories define a concurrency primitive: Referential transparency, returned data, composability, the coupling of execution context, scoping, and learning difficulty.

My advice: Avoid side-effects, avoid global state, decouple execution context, prefer composable primitives. Choosing fire once or fire many should depend on the problem you are trying to solve. Choosing an easy or hard to learn primitive should depend on how much time you are willing to invest in learning before getting work done.

This post should give you some idea of how to categorize your concurrency primitives if I did not cover it myself, and should help you analyze other concurrency options for your platform. Your choice of concurrency primitive matters: In a modern application, you will be using this primitive all over your codebase -- utilizing the right concurrency primitive will let you and your team achieve both a maintainable and performant application.

