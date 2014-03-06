# Moving ADB to the Firefox Process

This summer, as an intern on the Firefox OS Simulator team at Mozilla, I started moving ADB, the Android Debug Bridge, (also used by Firefox OS) into the Firefox process. This post will give an overview of the Firefox OS simulator add-on and ADB, as well as talk about motivations for doing the ADB move.

## Background

### What is the Firefox OS Simulator Add-on?

Back in the summer, the Firefox Simulator Add-on was the best way to work with and manage FxOS apps. You could add apps to a dashboard, and deploy apps on a FirefoxOS phone simulator. You could even debug apps running on the simulator from the add-on! The features that I spent most of the summer working with were the interactions with physical FxOS devices from the add-on.

First, I spent a week or so fixing a few bugs related to the use of the Android Debug Bridge, and then most of the summer creating [libadb.js](https://github.com/mozilla/libadb.js) -- a refactor of ADB for better use as a library (especially in the context of the simulator add-on). Libadb.js still isn't quite stable enough for inclusion in the stable add-on yet, but it is very close. 

By the way, the add-on is now being replaced by the new [App Manager](https://hacks.mozilla.org/2013/10/introducing-the-firefox-os-app-manager/) which is heavily based on the simulator add-on. Eventually libadb.js will be an optional add-on for the App Manager as well. This is the current best way to work with and manage Firefox OS apps. Make sure to check it out!

### What is ADB?

The Android Debug Bridge is a commandline tool used by Android and Firefox OS developers to communicate with their phones or tablets from their PC. It's also the canonical portal for other applications to communicate with phones (like the Android plugin in Eclipse or IntelliJ).

This is how ADB works at the highest level:

<img src="/diagram2-@2x.png" width="620px" height="300px"/>

## Motivations for libadb.js

For use as an API, however, we would really prefer a system like this instead:

<img src="/diagram1-@2x.png" width="620px" height="300px"/>

For the following reasons:

* Process management is complex and error-prone. Firefox has only limited ways to spawn subprocesses and it's especially tricky to start a process that itself starts a process.
* Additionally, dealing with another process that may or may not exist at the start ends up being messy. Do you kill the ADB daemon process at the end of a session, or not? Probably you would want to remember if you started it, and if so you should kill it. But what if the user starts ADB from the commandline while a program is using ADB. Do you kill the ADB daemon process?
* Building ADB as a shared library enables us to remove code and share resources with the Firefox executable -- thus reducing the size of ADB.
* Also, Mozilla is a JavaScript shop -- not a C shop, but ADB is written in C. In the future, you could imagine that FirefoxOS devices might rely on a slightly different method for communicating with PCs, let's say if Google suddenly changes the way ADB works upstream in the Android open source project. A Mozilla fork of ADB would be more easily maintained if it were in JavaScript. Libadb.js, parts of which are already written in JavaScript, is a stepping stone to a pure-JS implementation of ADB.
* And it turns out that a lot of ADB fits in easily into JavaScript's programming model (for example there is an event loop in the core of ADB). Of course, it also needs to talk to the USB block device on whichever OS you're using in order to communicate with the physical device so that lends itself to native code.

Since Firefox has a [JavaScript-C api](http://developer.mozilla.org/en-US/docs/Mozilla/js-ctypes) we can actually interact with the native code from JavaScript!  

So for the Firefox OS Simulator (a consumer of ADB's API) we decided that it would be better to go this route and create [libadb.js](https://github.com/mozilla/libadb.js).

For now, we have a hybrid solution -- a lot of the lower-level platform-specific code is still in C and the higher-level stuff is in JavaScript (or in the process of becoming JavaScript).

## Conclusion

One of the many reasons why Mozilla is so great is that everything is open. There are not many places that would let me go into all this detail over what I worked on and let me share code and presentations! I had a great time as an intern at Mozilla and would recommend the internship to anyone that is given the opportunity.

Definitely play with Firefox OS app development with the [App Manager](https://hacks.mozilla.org/2013/10/introducing-the-firefox-os-app-manager/), and check out my final intern presentation [video](https://air.mozilla.org/bringing-adb-into-the-firefox-process/) and [slides](http://slid.es/bkase/adb-firefox-process) for a more in-depth look as to what I worked on. Also, if you want to see some code, check out GitHub at [libadb.js](https://github.com/mozilla/libadb.js) and [r2d2b2g](https://github.com/mozilla/r2d2b2g).

