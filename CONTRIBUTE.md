## Build

Krōnin is an NPM project built by [Browserify](http://browserify.org/). Build it
by running:

```
browserify src/main.js -o bin/kronin.js
```

Or minified...

```
browserify -p tinyify src/main.js -o bin/kronin.js
```

**Note:** That the version of [Krōnin published to the NPM Registry](https://www.npmjs.com/package/kronin) is not minified intentionally so that code completion in Visualizer will make more human-friendly suggestions. Visualizer's build process will minify all libraries anyway when the project is built in *Release Mode*.

## Develop

First run:

```
watchify src/main.js -o tests/workspace/KroninTest1/modules/kronin.js
```

Then, open Visualizer and switch workspace to `tests/workspace`, open project **KroninTest1** and run the live preview.
