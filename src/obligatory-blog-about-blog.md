# Obligatory Blog Post about Blog 

Many times when people roll their own blogs, they begin with a post describing their blog. I spent a _lot_ of time thinking about and working on this site, so if you are considering building a blog this post may save you some time. I'm breaking this post down into the design constraints, design, and implementation of my site.


## Design Constraints

These constraints are listed in order of importance for me. Anything not listed, I didn't consciously think about during the creation of this blog.

I want readers of this blog to experience a website that is:

* **Minimal** -- I hate when articles I read are cluttered with links or ads. I believe that there should be content with very few distractions.
* **Beautiful** -- The colors and layout should look good. Designers know how to make something look good and why something looks good. Everyone else just knows _if_ it looks good. Most people can tell whether or not a website looks good.
* **Optimized visually for both Desktop and Mobile** -- Sometimes when I am browsing HackerNews on my phone, I follow a link to an article that is absolutely horrible, and no matter what I do, I can't get it to work. Sometimes it's perfect on page-load. Many times it's somewhere in between (maybe I have to zoom or unzoom on load and then it's fine). I want this site to be perfect on page load.
* **Fast** -- Content should load in the shortest wall-clock time possible. 

On the other side, post composition should be:

* **Easy** -- Just write. Little extra thinking necessary.
* **Powerful** -- It should be possible to express anything.

## Frontend Design and Implementation

The first thing I did was pick [Solarized](http://ethanschoonover.com/solarized) for the color palette -- I tweaked the background color to be slightly lighter -- and use [Lato](https://www.google.com/fonts/specimen/Lato) for the typeface. In my opinion, Lato looks best with a very light weight, so I went with that as well. Additonally, I feel that the default font-size is way too small on many articles I read (requiring zoom), so I like a larger font-size: all Lato content is at least 14pt. I picked Solarized and Lato because in my opinion, they are both beautiful.

My friend, Dillon Grove, helped me design the site in Photoshop. He stressed to me the importants of aligning the baseline of sidebar and article text content. Even a couple pixels does really make a difference between a website that looks "good" and one that looks off. Together we came up with a nice minimal blog design:

* A sidebar with just the title, subtitle, an avatar, and links to various accounts. And then just content.
* On phones and tablets (or small browser viewports), bring the most useful parts of the sidebar (aka drop the avatar) up above the content to make space.

I used [SCSS](http://sass-lang.com/) instead of writing pure CSS. SCSS just makes it easier to develop styles in my opinion. 

I used [DustJS](https://github.com/linkedin/dustjs) templates instead of writing pure HTML. Not only does this reduce the amount of boiler-plate on each page, but some sort of templating system is basically necessary in order to structure pages upon Markdown compilation. Dust makes it easy to ensure that we have the same sidebar, scripts, and styles on every blog post.

For the responsive grid, I used [Ribs](http://nickpack.github.io/Ribs/), an evolution of [Skeleton](http://www.getskeleton.com/), built on SCSS. I wouldn't recommend going with Ribs on a new project unless you grab an old stable version somewhere. When I first started working it was fine, but last time I checked, it was broken on [bower](http://bower.io/). For a lot of my development, I had to manually move around this library dependency whenever I copied my source code around.

Syntax highlighting styles are custom -- I couldn't use default solarized themes since they clashed with the rest of the page. Here's a brief code example:

```scss
.hljs-comment { color: $base1; }
.hljs-type { color: $orange; }
.hljs-number { color: $blue; }
```

Currently I'm using [highlight.js](http://highlightjs.org/) since the markdown parser I used originally did not support an easy way to do syntax highlighting at compile time. I will likely move to [pygments](http://pygments.org/).

I spent a considerable amount of time on the _Read more_ button that you likely clicked if you came here from the homepage; here it is embedded in this post:

<a href="javascript://" class="read-more">Read More</a>

It's flat (minimal), but functional. If you look closely, `:hover` (you're hovering over the button) is a slightly lighter violet than the default state, and `:active` (you're clicking down on the button) is a little lighter still. There is also a subtle animation in between each state.

There's not much more to say other than I spent a lot of time pushing pixels to make sure that baselines lined up and there was an appropriate yet pixel-perfectly consistent amount of space between different components on each page.


## Backend Design and Implementation

Posts are composed in [Markdown](http://daringfireball.net/projects/markdown/). Markdown is both easy to use, and powerful. It's free of markup distractions; it's mostly just writing. However, when necessary, you can break into raw HTML. This gives Markdown a lot of power as well.

The backend should be a "static site generator" -- it shouldn't actually do anything on each request, but it should pre-render all the static assets necessary before any requests come in. It's better to delegate that work to highly optimized static webservers. _Fast_ is more important than some features you might be able to get with a dynamic site.

In order to optimize visually for desktop and mobile, I chose to use a responsive grid. Alternatives include using flex-box (hopefully with a polyfill, if a good one is ever created).

The entire backend is a ~35 line NodeJS script that compiles the markdown with [marked](https://github.com/chjj/marked) -- chosen for it's speed and extensibility -- and sticks the rendered content into the proper dust template. In the future, I may tweak the renderer to support high-dpi versions of image assets.

Everytime I add a new post, I add it to the front of an array on line 1 of the node script and either recompile by running the script or let grunt catch the change.

In the future, I plan to make post adding/modifying more automatic.

The backend is very simple right now.


## Lessons Learned

* Just fucking release, don't perfect

Rather than writing blog posts for the past 7 months, I have been just tweaking this site on and off. Next time that I'm in a similar situation, I'll get something out faster so I can start producing content -- or use something like [Jekyll](http://jekyllrb.com/) until I'm satisfied enough with the frontend.

