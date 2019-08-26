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

## Develop

First run:

```
watchify src/main.js -o tests/workspace/KroninTest1/modules/kronin.js
```

Then, open Visualizer and switch workspace to `tests/workspace`, open project **KroninTest1** and run the live preview.
