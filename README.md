Why?
=======

Someone said that [Node.js was too slow and had a low memory limit so you should really use Go](https://hackernoon.com/i-wrote-some-golang-and-it-felt-great-3c3367a67db5). I felt like there must have been something fundamentally wrong with his implementation, so I wrote this sample to show that you can really crunch some stuff in Node.

What is this?
================

It's just basically a garbage text generator using [faker.js](https://github.com/marak/Faker.js/). I generate boatloads of text and then map/reduce them into word counts like every trite example you've ever seen about Hadoop or Big Data.

I don't know what the author of the post above was doing and he doesn't seem willing to post his Node vs Go code. His implementation seemed to have something to do with mapping dictionary words into big-old-objects. So here we are!

Running this sample
======================

You'll need least Node.js v4+

```
> git clone [mine] [yours]
> cd [yours]
> npm install
> npm start
```

What I found
===============

- Node processes just fine in parallel. I used the `worker-farm` module and child processes here for heavy lifting.
- There is no practical memory limit I could find. Adjust `--max_old_space_size=[____MB]` in `package.json` to try it yourself. Adjust `const ITERATIONS` in the progaram and rerun it to push the limit. Consider generating more garbage (extra objects, arrays, etc...) to push it further.
- No exponential performance degredation seems to happen when "lots of objects" are loaded into memory. This is of course not true when your machine runs out of memory and starts swapping, but that happens everywhere... The garbage collector seems to have nothing to do with it.
- My implementation of this changed a lot over time as I went for more performance and efficiency via pipelining, but by all means please generate more objects and try it yourself. There's plenty of data being generated that you can mangle it into new arrays, objects, functions, anything you need.
- Support for async/await and generators is lackluster even today (May 2017) - even with transpilers. I experimented with them and found either missing support, or complicated compilation processes hidden under flags, polyfills, and magic tricks. Promises are still the best and most stable way to go in my mind.
- Promises **can** be hard to reason about and work with. [Bluebird](http://bluebirdjs.com) REALLY helps. It's substantially better than native promises - read the docs to see what I'm talking about. Concurrency controls, promise reducing, etc...

Conclusion
============

Is Go(lang) faster? Sure it is! It's probably 3 times faster due to the static nature and compilation of the language.

But it's highly unlikely that Golang is going to be 6250% faster unless ***you're doing something very wrong***.

1. Memory **can* leak in any language
2. Bad data structures and excess allocations **are going to hurt performance** in any language
3. Careless functional programming **will be slower** in any language. Imperitive programming is generally faster, but it has its own set of tradeoffs (scope, mutability). You have to understand your tools.
