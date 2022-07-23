# Venn Diagram Calculator

This was adapted from http://settheoryexplained.com/, to demonstrate to its young
author some of the features of modern Javascript, and some techniques for terser
and cleaner code.  As such, it's _really_ well-commented.

Run the demo with `npm run start` (for which, you'll need [node](https://nodejs.org/en/)).

To start reading the comments, I recommend beginning with [index.html](./src/index.html).

-----

As a challenge to myself after finishing the initial tutorial, I worked out a way to programmatically work out how to produce the [`FORMULAE` array](https://github.com/Fordi/venn-calculator/blob/tutorial/src/getFormula.mjs#L4) on the fly.  This required teaching myself how to simplify logical expressions, which was a fun but _harrowing_ task.

Soon as I've recovered, I'm going to write a parser for translating expressions to the simple RPN structures I've made, and create an NPM library (my first instinct was to look for a lib that does this - nope).

I also want to more heavily comment the simplifier - right now, there's not a whole lot other than some RPN descriptions of what each transform does.