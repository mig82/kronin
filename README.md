# Krōnin

A collection of [Rōnin](https://en.wikipedia.org/wiki/R%C5%8Dnin) extensions to enhance the Kony SDK.

### Install

[Krōnin is published to the NPM Registry](https://www.npmjs.com/package/kronin) so you can just install it into your project using the NPM command line by stepping into the project's root directory and running:

```bash
npm install kronin --prefix modules
```

This will install Krōnin into `[project_root]/modules/node_modules/kronin`. Then in Visualizer click *Project/Refresh*. Visualizer will pick up the `node_modules` and `kronin` directories as [*application groups*](https://docs.kony.com/konylibrary/visualizer/visualizer_user_guide/Content/OrganizingAppElementsInGroups.htm).

![node_modules and Krōnin as Vis app groups](./pics/kronin_app_group.png "node_modules and Krōnin as Vis app groups").


## kony.amplify

An adaptation of [AmplifyJS's PubSub Core](http://amplifyjs.com/api/pubsub/), this namespace allows you to leverage the PubSub
pattern in your applications. Like AmplifyJS, this supports these three functions:

* publish
* subscribe
* unsubscribe

Additionally, this adaptation offers these three additional methods:

### allowDuplicates(boolean)

Set whether or not to allow the same function to subscribe more than once to a topic. By default this is set to `false`.

### getSubscriptions(string)

Returns an array of all the functions subscribed to a topic.

```javascript
function onFoo(){}
function onFoo2(){}
kony.amplify.subscribe("foo", onFoo);
kony.amplify.subscribe("foo", onFoo2);
kony.amplify.getSubscriptions("foo");
//[onFoo, onFoo2]
```

### isSubscribed(string, function)

Returns whether a specific function is subscribed to a topic.

```javascript
function onFoo(){}
kony.amplify.subscribe("foo", onFoo);
kony.amplify.isSubscribed("foo", onFoo);
//true
```

## kony.application

### setAppBarColor(string)

Sets the color of the Android application bar at the top on the screen.

```javascript
kony.application.setAppBarColor("cc0000");
```

## kony.os

* getOs()
* isAndroid()
* isIos()
* isWeb()

## kony.i18n

### getLocalizedString2(string, object)

Get the localised string for an i18n key or return the key itself if none exists for the current locale. This is useful because if there are gaps in a language bundle, seeing the actual key on screen helps identify the missing translations — as opposed to just seeing a blank and wondering what the key is.

This function also supports substitution variables specified with curly brackets — e.g.:
If the localised string of an i18n key `message.greeting` is `Hello {name}, count to {count}!`, then:

```javascript
kony.i18n.getLocalizedString2("message.greeting", {
	"name": "Miguel",
	"count": 3
});
//Hello Miguel, count to 3!
```

## kony.mvc

### genAccessors(controller, Array)

Define a component's setters and getters for any custom fields in one line by just listing the fields -e.g. This could be the body of a component's controller.:

```javascript
define(function() {
	return{
		constructor: function() {/*...*/},
		initGettersSetters: function() {
			kony.mvc.genAccessors(this, ["foo","bar"]);
			//Defines accessors getFoo, setFoo, getBar and setBar
		}
	}
}
```

### patch(controller)

Binds any `init`, `preShow`, `postShow` or `onHide` functions defined in the current controller to the corresponding view's life cycle events, without having to use actions or additional code to do it.
These functions are also bound with a wrapping `try/catch` statement, so that if there are syntax errors in the functions defined, they'll be easier to debug -e.g. This could be the body of a forms's controller.:

```javascript
define(function(){

	return{
		init: function(){/*...*/},
		preShow: function(){/*...*/},
		postShow: function(){/*...*/},
		onHide: function(){/*...*/},
		onNavigate: function(){
			kony.mvc.patch(this);
			//Now init, preShow, postShow, onHide are all bound.
		}
	};
});
```

## router

A convenient way to do all the navigations from a centralised place, which also provides
a history of the navigations, allowing you to go back in a logical way.
When used along with `kony.mvc.patch` this router also allows you to query which the current form is — something that's not readily possible in MVC projects.

* init(maxHistorySize)
* goTo(formIdOrFriendlyName, context, isGoingBack)
* getCurrent()
* goBack(context)
* goHome(context)
* getHistory()

## kony.ui

### getDescendants(containerWidget, includeParent, function)

Returns an array containing all the widgets nested within a form or container widget. The container widget may be a Form, a Flex Container, Scroll Flex Container or any other widget capable of containing other widgets.

It also allows you to specify a function to filter which children should be included in the result. The filtering function must be one returning a `boolean`.

```javascript
kony.ui.getDescendants(this.view.flxTop, true, (child) => {
	return child.id.substring(0,3) === "flx";
});
//[flxTop, ...] including any child of flxTop named with an "flx" prefix.
```

### getComponents(containerWidget, includeParent)

A convenience function equivalent to using `getDescendants` with a filter to select component instances only.

## Disclaimer

Krōnin is meant as a community project. It is **Not** part of the Kony Platform
and it's not supported by Kony Inc. in any way — Hence the *Rōnin* bit ;)

## Contribute

To figure out how to build Krōnin for development check out [CONTRIBUTE.md](./CONTRIBUTE.md).
