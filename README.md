# Krōnin

A collection of Rōnin extensions to enhance the Kony SDK.

## Build

Krōnin is an NPM project built by [Browserify](http://browserify.org/). Build it
by running:

```
browserify src/main.js -o bin/kronin.js
```

## Develop

To see Krōnin in action, open Visualizer and switch workspace to
`tests/workspace`. Then open project **KroninTest1** and run the live preview.
```
watchify src/main.js -o tests/workspace/KroninTest1/modules/kronin.js
```

## Size

Once minified by Visualizer, Krōnin is tiny. Check out the size of minified
Krōnin by running:

```
browserify -p tinyify src/main.js -o bin/kronin.js
```

## Disclaimer

Krōnin is meant as a community project. It is **Not** part of the Kony Platform
and it's not supported by Kony Inc. in any way.
