# Production-Ready Native Single-Atom-State Purely Functional Reactive Composable UI Components, or PRNSAASPFRUICC

The native UI toolkits on Android and iOS are frustratingly imperative. Unfortunately, there has been little architecture evolution (unlike the web). However, nothing(ish) is stopping us from bolting something "nice" on top. By nice I mean single-atom-state purely functional reactive composable UI components. In this post, I'll explain what this title means, the inspiration behind the design of the framework, an example component, and dive a little into the framework's implementation.

Right now, there only exists a Kotlin (Android) implementation, but a Swift port will be relatively straightforward and will happen soon.

### Let's break down the title:

* Production-Ready

We need something contained enough that it can be used in production immediately. I hacked this up over the weekend and we built our first large component during the next work week.

More radical approaches are promising, but I wanted something we could use in production now. Rather than opting to support the entire program -- [like what soundcloud is exploring](https://www.youtube.com/watch?v=SsH_rByBbq4), I wanted to come up with a solution just for UI components. The components can then be dropped into any mobile app. (Also, I built this framework many months before this video was released).

* Native

This framework is for native mobile apps. Android and iOS. Therefore, we can't use a web framework. We need to build this using native code.

* Single-Atom-State

Single-Atom-State means all of a components' state is visible at the top level of the component in one struct. Nested components' states are exposed as fields in the top-level struct.

Single-atom-state enforces pure functional components.
See ... and ... which will be discussed in more detail later.

* Purely Functional

The UI component should be a pure function of some state. No side-effects. Pure functions are testable, readable, and maintainable. Side-effects cause bugs. We need to minimize the surface area of side-effecting code.

If the framework does all the side-effects, we only have to deal with those side-effects once. Every time we write a component, we get testability, readability, and maintainabililty.

* Reactive

Reactive UIs update whenever the underlying state updates. You never have to explicitly refresh.

Users don't use slow-feeling apps. Apps that wait on server response or explicit refreshes seem slow. We want an app that seems fast. Reactive UIs feel fast.

* Composable UI Components

UI Components are views and their controllers. By composable I mean we should be able to have a complex UI component made up of smaller inner components.

### Why not React Native?

[React Native](linktoreactnative) is really cool. [React](linktoreact) is really cool. However:

React native is not native. It is JavaScript. [There are still some things that they need to work out there](linktobadstuff). In order to build a large project in a non-statically-typed language, you and all of your team need to be EXTREMELY disciplined in order for it not to become a gigantic mess, and even then people still make mistakes. Compilers don't make mistakes, humans do. I do find [Purescript](http://www.purescript.org/)'s (react native thing see twitter) and the [Elm-react-native](https://github.com/ohanhi/elm-native) VERY interesting.

React does not have Single-Atom-State out-of-the box, however something like [Redux](linktoredux) fixes this for you. React is not purely functional, but again you can fix this with various extensions.

Not being designed to support Single-Atom-State leads to a framework broken by design. Hacking stuff on top of it does not prevent clients from using it in a broken way. Besides, we need something that works with native code.

## Let's try and learn from the web

On the web, due to a lack of standardization, there has always been this crazy iteration of UI frameworks and architectures. [React](https://facebook.github.io/react/) was a major leap forward and paved the way for functional applications with unidirectional dataflow.

### The Elm Architecture

At around the same time as React, Evan Czaplicki was working on the [Elm language](http://elm-lang.org/), a purely-functional statically typed compile-to-js language (with an extremely powerful type system). Evan believes that a new language must lead with useful features. Thus, Elm needed a way to express UI components in a clean way.
The Elm architecture is composed of some underlying model state, and actions that you can take to change the model.  Various input events or ajax calls for example can cause actions. You must provide an update function for each action you specify. Each update function looks something this:

```elm
update action state = /* produce newState from action and current state */
```

Elm then does "magic" and delivers you a stream of model states changing over time. You then transform the stream and produce a [virtual DOM](https://github.com/Matt-Esch/virtual-dom) representation of what you want to render at that moment.

### Cycle.js and the Dialogue Architecture

A little later Andre Staltz noticed that React's model was that of, but needed "Flux" which he argues is unecessarily complex. Instead, let's make the UI _actually_ a pure function of inputs, stream composition can replace Flux entirely. He then created the [Dialogue architecture](http://cycle.js.org/dialogue.html) and the [Cycle.js framework](http://cycle.js.org/) (an implementation of that architecutre).

A Cycle.js program is a function that takes a stream of side-effect producing outputs and must return inputs to these side-effect drivers as output. Usually, one of the inputs will be DOM events and one of the outputs will be the next virtual DOM to be diffed and applied. Other drivers include ajax requests and local storage.

Since programs usually are not actually one function, Cycle.js encourages you to use the model/view/intent decomposition of your UI component. 
The intent takes the raw driver outputs and transforms them into more meaningful inputs for your program. For example, extracting click events for a specific button you care about.

The model function takes the intent and transforms those event streams into the model state of your component. It seems to be almost convention to use elm-style model update here to eventually output your model state stream. In this layer, you can also output instructions to other drivers, for example if you want to make an ajax request.

The view function takes your model state and renders it to the virtual dom.

In the simple case, your main function is then just the composition of view model and intent if you're only using the DOM driver.

Like in Elm components, in the dialogue architecture side-effects are also on the side. All side-effecting operations are relegated to drivers, thus your application code becomes one big pure function.

### Streams?

When I say stream, I'm talking about functional reactive signals or push streams -- you can think of them as local composable event buses. You can't ask an event bus for all the clicks that will ever happen, but you can listen to the bus and do something whenever a click occurs. These streams are superior to event buses in that you can transform them functionally. I can turn a stream of clicks into a stream of throttled x-positions from only the lower right quadrant of the screen, for example.

Elm signals and operators are essentially a language primitive.

In Cycle.js, these streams are concretely realized as [RxJS](linktorxjs) observables. RxJS is [port of Erik Meijer's Rx.NET framework](reactivex). RxSwift (and the fork, ReactiveCocoa), and RxJava are also implementations of the Rx framework.

Elm signals encourage dynamic reconfiguration of components with higher-order functions, whereas Rx observables allow dynamic reconfiguration through higher-order observables (streams containing streams).

### Single-atom App-state

Both Elm and Cycle have Single-atom app state.

### Restrictions from native land

* Virtual View Hiearchy with diff/match/patch

Unfortunately, we do not have virtual view hiearchy diffing in our imperative native UI APIs ([anvil](linktoanvil) is promising on Android and [something](linktoiosthing) is promising on iOS but those are not close to being production ready.

* Threads

In JavaScript, everything is evented and single-threaded. In native world, we need to care about where our code is executed since mostly all I/O APIs in native land are blocking.

### What to take

* Rx observables

Although, we live in this great new world where we can use lambdas and higher-order functions (swift and kotlin), it definitely makes more sense to stick with Rx on these platforms. There are robust industry-adopted implemenations of Rx on both native platforms. Also, Rx implementations give you ways to manage (and decouple) the scheduling of your asynchronous work from what the work actually does and which streams are composed.

* Everything is a stream

The elegance here is important

* Enforce elm-style model with view and intent from Cycle.js

I've found that MVI is a great way to decompose components and redundant to keep reimplementing the same combinator over and over (the elm "magic" state fold). 

Structure enforces clean and readable code (therefore working code).

## The Framework

### High level

At a high level, UI components' state is managed through `MVm` component logic, with a callback to imperatively change the view (in place of virtual DOM diffing). View intention input is passed as a struct of input streams. So rather than declaring a Cycle.js intent function, you just create a `ViewIntention` struct as input.
(also I carefully refer to what is called "intent" in Cycle.js as "view intentions" because Android has an "Intent" and it means something completely different).

When I say `MVm`, I mean `model` and `view-model`. I found it more clean to decompose the model and view-model layers due to a lack of a view function (since there is no DOM diffing). The model state represents the state of your component (and enough information to produce the next state upon a new action); the view model state is only and exactly what you need to render the view imperatively.

The model returns a stream of `State -> State` functions rather than one `(State, Action) -> State` function like in Elm because if you return `State -> State` functions you get more flexibility in your model logic, with little cost in complexity.

Minimizing the logic in the imperative view update callback is important as these are all side-effecting operations.

When I set out to build this framework, I had a suspicion that performance may end up being an issue; however, I decided to revisit performance only if necessary. It turned out that even on old phones (4.1+ phones are supported), there is no noticeable slowdown.

### Real example

I think it would be best to show a real example, before diving deeper into the framework.

Evidence of production-readiness: We have 4 components currently in use in our production Android app. One of them is composed within another. One component is used as a RecyclerView cell on Android.

#### High-level strategy

Here's a strategy for building real UI components that works for us:

* Ingest your spec
* Determine the view model ViewState
* Determine the model State
* Transform the State into the ViewState
* Determine the ViewIntentions
* Bind ViewIntentions to model state updates
* Wire it all together
* Add, compile, and run

#### Your spec

Talk to your designer(s), and thouroughly ingest the component spec. If you find edge cases, it's best to catch them here, your component will not even _compile_ if you miss any edge cases.

For particularly complicated components, it will help to draw a big dataflow graph (stay tuned to see another post about that).

#### What we're building

A button. This button:

(( insert spec for profile button))

This button represents provides information and function. The function/information differs depending on if you're viewing your profile, a friends' profile, a non-friends' private, or a non-friends' public profile.

On your profile, the button shows an indicator if there are new status on your friends.

#### Determine the ViewState

Given the spec, look at what varies in the different situations:

We can determine this pretty easily:

```kotlin
data class ViewState(
    val buttonText: String,
    val showCheckmark: Boolean,
    val hollowButton: Boolean,
    // NOTE: on Android, color resources are provided via Int constants
    val buttonColorID: Int,
    val textColorID: Int,
    val showNewFriendsIndicator: Boolean
)
```

#### Determine the model State

Now we need to take a step back and consider what information we would need to determine the view state for the different possibilities in the [spec](link back up to the spec).

One of the states shows a number, so we'll need that -- and everything else is determined from the follow state between the user viewing the profile and the user whom the profile is about.

```kotlin
val followState: FollowState
val numFriends: Int?
```

NOTE: `FollowState` is defined elsewhere as follows:
(some unnecessary code elided)

```kotin
sealed abstract class FollowState {
  case Block
  case Following
  case Pending
  case Invited
  case Sent
  case NotFollowing
  case Self
  case None
}
```

We also need to decide how we want to persist state across component mounts and unmounts and app opens.
Here, we want to persist the state across mounts and unmounts (on Android this is usually between the `pause` and `resume` lifecycle events), but we don't need to persist it across app opens (on Android this is equivalent to storing state in the `savedInstanceState` bundle).

Thus, we tell the framework that we want to persist both pieces of info in `Ram`, and we have no volatile or disk state to persist:

```kotlin
data class Ram(
    val followState: FollowState,
    val numFriends: Int?
)

data class State(
    val v: Ram
): RamState<Ram>(v)
```

We also need to decide on some initial state:

```kotlin
val initialState = State(
    Ram(
        FollowState.self,
        0
    )
)
```

#### Transform the model's State into the view model's ViewState

This logic should be an extremely straightforward translation of the spec. This is where you usually find missing cases in your feature spec.

```kotlin
object ViewModel {
  val viewModel: (Observable<State>) -> Observable<ViewState> = { stateStream ->
    stateStream.map{ state ->
```

We need to export a function from the `State` stream to the `ViewState` stream.
Since we're just transforming state, we map over the model state stream.

In the future, clients of this framework may be asked to provide the inner `State -> ViewState` transform function rather than have to deal with this boilerplate.

```kotlin
      state.v.followState.match(
```

The transform is a simple case-analysis on the follow state. If we forget a case, the code will not compile. No runtime exceptions possible.

```kotlin
          self = {
            state.v.numFriends.bind{ num ->
              ViewState(
                  "%d Friends".format(num),
                  false,
                  false,
                  R.color.btn_grey,
                  R.color.white,
                  state.v.isNew
              )
            }.getOrElse{
              ViewState(
                  "Your Friends",
                  false,
                  false,
                  R.color.btn_grey,
                  R.color.white,
                  state.v.isNew
              )
            }
          },
```

((show spec screenshot))
Here, we also found an edge case -- if numFriends is not yet set here, we'll need to show something. "Your Friends" seems appropriate.

```kotlin
          following = {
            ViewState(
                "Friends",
                true,
                false,
                R.color.mintgreen,
                R.color.white,
                false
            )
          },
```

((show spec screenshot))

```kotlin
          none = {
            ViewState(
                "Add Friend",
                false,
                true,
                R.color.mintgreen,
                R.color.mintgreen,
                false
            )
          },
```

((show spec screenshot))

```kotlin
          pending = {
            ViewState(
                "Requested",
                false,
                false,
                R.color.btn_grey,
                R.color.white,
                false
            )
          },
          // (...)
      )
    }
  }
}
```

((show spec screenshot))

Other follow state cases lead to buttons that look similar to ones we have already gone over, so those are skipped.

#### Determine the ViewIntentions

What sources of input do we need for our component to correctly function?

Put another way: What are all the triggers that can change our model state?

For this component there is actually quite a bit:
((look at this in android studio to explain))

```kotlin
data class ViewIntentions(
    val followType: Observable<FollowState>,
    val numFriends: Observable<Int>,
    // taps on the button
    val clicks: Observable<Any>,
    // a push notification can update the viewcount or followstate
    val notifs: Observable<Pair<String, String>>,
    // users can be blocked from the menu 
    val menu: Observable<Pair<String, String>>,
    // (implementation detail) is this my profile, or someone elses'
    val instructionType: ProfileTarget.Type.Sum,
    // whose profile are we looking at
    val profileUsers: Observable<SlimUser>
)
```

#### Bind ViewIntentions to model state updates

Since this is a component with lots of moving parts, we map over each of the ViewIntentions' input streams to produces model updates to express the changes to our model state (think of an elm-style updates on an `action`). 

```kotlin
object Model {
  val initialState = // ...
  val createState = // ...

  val model: (ViewIntentions) -> Observable<(State) -> State> = { intentions: ViewIntentions -> {
```

Necessary boilerplate

```kotlin
    val followUpdateFromClick = // ...
```

We're going to make a `val` for each kind of update. Elided is a stream from clicks. It is important to update the UI component from clicks so we don't have to wait for a server roundtrip. This allows our UI to be reactive.

```kotlin
    val followUpdateFromServer = intentions.followType.map{ newFollowType ->
        { state: State ->
          State(Ram(newFollowType, state.v.numFriends))
        }
    }
```

Whenever a server response tells us that there is a new follow state for this user, update the model state with the new follow state and the old numFriends.

```kotlin
    val followUpdateFromNotifs = // ...
```

```kotlin
    val followUpdateFromMenu = intentions.menu
        .withLatestFrom(intentions.profileUsers)
        .mapPair{ action, userId ->
          { state: State ->
            // only update user tied to this menu action
            if(currUser.id == userId) {
                when(action){
                  TakeActionRequest.BLOCK ->
                    State(Ram(FollowState.block, state.v.numFriends))
                  TakeActionRequest.UNFOLLOW ->
                    State(Ram(FollowState.none, state.v.numFriends))
                  else -> { state }
                }
            } else {
              state
            }
          }
        }
```
  
Here we are binding to menu actions. Whenever the user taps something on the menu, we also want to grab the user associated with the current profile shown. If the action in the menu is a `block` or `unfollow` on the current user shown, we want to adjust the FollowState reactively.

```kotlin
    val numFriendsUpdate = intentions.numFriends.map{ num ->
      { state: State ->
        State(Ram(state.v.followState, num))
      }
    }
```

This stream updates the `numFriends` part of our state, but leaves the follow state unchanged.

```kotlin
    Observable.merge(
        followUpdateFromClick,
        followUpdateFromServer,
        followUpdateFromNotifs,
        followUpdateFromMenu,
        numFriendsUpdate
    )
  }
```

Finally, we merge the `update` functions together to return a single stream of `State -> State` functions. The framework will take care of collapsing the update functions into a stream of the changing state over time.

NOTE: In our production code we also have our side-effect logic baked into our observable pipeline (via [doOnNext](http://reactivex.io/documentation/operators/do.html)), but I'm skipping over that since it is irrelevant to the understanding of building a UI component.

#### Wire it all together

```kotlin
class ButtonComponent(
    activityLifecycle: Observable<LifecycleEvent>,
    viewIntentions: ViewIntentions,
    val view: FriendsBtnView
): StartStopComponent
```

We are making a `ButtonComponent` which we want to bind to the activity lifecycle (you almost always want that) given some `ViewIntentions` input sources and the Android view we are imperatively updating.

```
  private val component =
      LifeCycleComponent(
         activityLifecycle,
```

a `LifeCycleComponent` takes the lifecycle stream and the component you want to mount and unmount based on the changing lifecycle events of your activity

```
          Component(
              ViewDriver<ViewIntentions, ViewState>(
                  intention = viewIntentions,
                  onViewState = { old, state ->
                    if (old?.hollowButton != state.hollowButton || old?.buttonColorID != state.buttonColorID){
                      view.setBackgroundRectWithRadius(state.hollowButton, state.buttonColorID)
                    }

                    if(old?.buttonText != state.buttonText) {
                      view.setText(state.buttonText, state.textColorID)
                    }

                    if(old?.showCheckmark != state.showCheckmark) {
                      view.setCheckVisibility(state.showCheckmark)
                    }

                    if(old?.showCheckmark != state.showCheckmark) {
                      view.setNewFriendsIndicator(state.showNewFriendsIndicator)
                    }
                  }
              ),
```

The first argument to our `Component` is the `ViewDriver` which imperatively updates are view. We found it useful to bind the imperative modifications to the view as methods in an Android view subclass (here the `FriendsBtnView` class).
The if-old-x-is-not-different-from-new-x is a workaround the lack of a virtual view heirarchy.

```
              model = ViewDriver.makeModel(
                  initialState = Model.initialState,
                  createState = Model.createState,
                  model = Model.model,
                  viewModel = ViewModel.viewModel
              )
          )
      )
```

The `Component` also takes a model function of the form `ViewIntention -> Observable<Pair<ViewState?, ViewState>>`. Or in English, a function from the streams in our `ViewIntentions` to a stream of `ViewState`s we can use . For efficiency, we return the prior state as well (so we only have to imperatively modify the view if something really changed).

For complex components, a static method in `ViewDriver` creates this model function for you by composing the model and viewModel functions and doing some "magic" which will be explained below.

The `createState` is unfortunately needed to help the type-system understand our component.

For this component, `val createState: (Any?, Ram?, Any?) -> State = { a, v, b -> State(v!!) }`

```
  override fun start() {
    component.start()
  }

  override fun stop() {
    component.stop()
  }
}
```

Finally, we delegate to the start and stop methods of the `Component` object we created.

#### Add, compile, and run!

To add the component to your Activity or Fragment, just instantiate it in `onCreate` and `start()` it. The `activityLifecycle` will ensure that you don't leak memory or keep the CPU active when the activity is paused.

Due to the heavy use of types, if the code compiles it is _very_ likely to work on the first try. Due to the heavy use of algebraic data types or sum types, if you forget an edge case, your code won't compile!

### Deeper

Each UI component defines `ViewIntentions`, `ViewState`, and `State` (the model state) data classes. `State` must subclass `ModelState` in order to specify how you want the state to persist. (there are instances for all combinations of volatile, ram and disk).

You then construct a `Component` objects than can be started and stopped.

This component is made up of one or many driver(s) and a model function.

```kotlin
class Component<T, U, D1: Driver<T, U>>(
    val driver: D1,
    private val model: (T) -> Observable<U>
): StartStopComponent
```
 
Usually, your driver is the `ViewDriver`:

```kotlin
class ViewDriver<ViewIntention, ViewState: Any>(
    private val intention: ViewIntention,
    // TODO: Figure out how to make this not a var
    var onViewState: (ViewState?, ViewState) -> Unit
): Driver<ViewIntention, Pair<ViewState?, ViewState>>
```

A view driver needs a the `ViewIntention` input to your component, and a callback that gives you the prior and current state. In this callback you do the dirty work that in a perfect world would be replaced by a virtual view hiearchy.

For `ViewDriver`s, your component's model function is created from some initial state, an elm-style merged update function, and a viewModel function.

```kotlin
fun makeModel<ViewIntention, ViewState: Any, State: ModelState<N,P,C>, N: Any, P: Any, C: Parcelable>(
    initialState: State,
    createState: (N?, P?, C?) -> State,
    model: (ViewIntention) -> Observable<(State)->State>,
    viewModel: (Observable<State>) -> Observable<ViewState>
): (ViewIntention) -> Observable<Pair<ViewState?, ViewState>>
```

Ignore the scary generics before the parameters in the function signature -- this function needs the initial state, a way to construct a state object from the volatile, ram, and disk pieces, the model function (return an elm-style update stream), and a view-model function to turn the model state into view state.
This `makeModel` returns a valid component model function -- `ViewIntentions -> Observable<(ViewState?, ViewState)>`

In Rx, you can perform a higher order scan (link), over the model's output (the update function stream) and just apply the function at each step!

```kotlin
  val state = model(v)
    .scan(startState, 
          { currState: State, t -> t(currState) })
```

All the work is in the scan!

### Other drivers

The design theoretically supports other drivers (see the first parameter of `Component`), however, the types become very messy. I'm not happy with the current implementation.

For now, we're sticking most of our side-effect code in [doOnNext](http://reactivex.io/documentation/operators/do.html) calls.

### Component wrappers

Components are extended via composition. 

The `LifeCycleComponent` makes a component automatically pause on an Android lifecycle pause event and resume on a resume event.

```kotlin
class LifeCycleComponent<C: StartStopComponent>(
    private val pauseResumeCycle: Observable<LifecycleEvent>,
    val inner: C
): StartStopComponent
```

## Conclusion (probably needs more)

By taking an incremental step of just making UI components purely fucntional reactive and composable with single-atom-state, frontend programming on Android has become much more enjoyable. Less time is spent battling bugs, more time is spent making stuff.

Making stuff is important.

We'll be open-sourcing it soon.

