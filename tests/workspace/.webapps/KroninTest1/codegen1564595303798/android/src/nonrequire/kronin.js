(function() {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = "function" == typeof require && require;
                    if (!f && c) return c(i, !0);
                    if (u) return u(i, !0);
                    var a = new Error("Cannot find module '" + i + "'");
                    throw a.code = "MODULE_NOT_FOUND", a
                }
                var p = n[i] = {
                    exports: {}
                };
                e[i][0].call(p.exports, function(r) {
                    var n = e[i][1][r];
                    return o(n || r)
                }, p, p.exports, r, e, n, t)
            }
            return n[i].exports
        }
        for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
        return o
    }
    return r
})()({
    1: [function(require, module, exports) {
        (function(global, undefined) {
            var slice = [].slice,
                subscriptions = {};
            var duplicatesAllowed = false;

            function equalsFunction(f1, f2) {
                //If both are anonymous functions.
                if (f1.name === "" && f2.name === "") {
                    //Stringify the bodies and compare.
                } else {
                    return f1 === f2;
                }
            }

            function getFunctionBody(func) {
                var funcString = func.toString();
                var funcBody = funcString.substring(funcString.indexOf("{"));
                //funcBody = funcBody.replace(/\n/g, '').replace(/\s{2}/g, ' ');
                return funcBody;
            }
            /*exported amplify*/
            var amplify = global.amplify = {
                allowDuplicates: function(allow) {
                    duplicatesAllowed = allow;
                },
                getSubscriptions: function(topic) {
                    //Generate a read-only copy of the subscriptions.
                    return JSON.parse(JSON.stringify(subscriptions[topic]));
                },
                isSubscribed: function(topic, callback) {
                    var found = false;
                    for (var i = subscriptions[topic].length - 1; i >= 0; i--) {
                        var existingSubscriptor = subscriptions[topic][i].callback;
                        //For named functions, compare them directly.
                        if (typeof callback.name === "string" && callback.name.length > 0) {
                            if (existingSubscriptor === callback) {
                                found = true;
                                break;
                            }
                        }
                        //For unnamed functions stringify, remove anything before the curlys and compare.
                        else {
                            if (getFunctionBody(existingSubscriptor) === getFunctionBody(callback)) {
                                found = true;
                                break;
                            }
                        }
                    }
                    return found;
                },
                publish: function(topic) {
                    if (typeof topic !== "string") {
                        throw new Error("You must provide a valid topic to publish.");
                    }
                    var args = slice.call(arguments, 1),
                        topicSubscriptions,
                        subscription,
                        length,
                        i = 0,
                        ret;
                    if (!subscriptions[topic]) {
                        return true;
                    }
                    topicSubscriptions = subscriptions[topic].slice();
                    for (length = topicSubscriptions.length; i < length; i++) {
                        subscription = topicSubscriptions[i];
                        ret = subscription.callback.apply(subscription.context, args);
                        if (ret === false) {
                            break;
                        }
                    }
                    return ret !== false;
                },
                subscribe: function(topic, context, callback, priority) {
                    if (typeof topic !== "string") {
                        throw new Error("You must provide a valid topic to create a subscription.");
                    }
                    if (arguments.length === 3 && typeof callback === "number") {
                        priority = callback;
                        callback = context;
                        context = null;
                    }
                    if (arguments.length === 2) {
                        callback = context;
                        context = null;
                    }
                    priority = priority || 10;
                    var topicIndex = 0,
                        topics = topic.split(/\s/),
                        topicLength = topics.length,
                        added;
                    for (; topicIndex < topicLength; topicIndex++) {
                        topic = topics[topicIndex];
                        added = false;
                        if (!subscriptions[topic]) {
                            subscriptions[topic] = [];
                        }
                        if (duplicatesAllowed || !this.isSubscribed(topic, callback)) {
                            var i = subscriptions[topic].length - 1,
                                subscriptionInfo = {
                                    callback: callback,
                                    context: context,
                                    priority: priority
                                };
                            for (; i >= 0; i--) {
                                if (subscriptions[topic][i].priority <= priority) {
                                    subscriptions[topic].splice(i + 1, 0, subscriptionInfo);
                                    added = true;
                                    break;
                                }
                            }
                            if (!added) {
                                subscriptions[topic].unshift(subscriptionInfo);
                            }
                        }
                    }
                    return callback;
                },
                unsubscribe: function(topic, context, callback) {
                    if (typeof topic !== "string") {
                        throw new Error("You must provide a valid topic to remove a subscription.");
                    }
                    if (arguments.length === 2) {
                        callback = context;
                        context = null;
                    }
                    if (!subscriptions[topic]) {
                        return;
                    }
                    var length = subscriptions[topic].length,
                        i = 0;
                    for (; i < length; i++) {
                        if (subscriptions[topic][i].callback === callback) {
                            if (!context || subscriptions[topic][i].context === context) {
                                subscriptions[topic].splice(i, 1);
                                // Adjust counter and length for removed item
                                i--;
                                length--;
                            }
                        }
                    }
                }
            };
        }(kony));
    }, {}],
    2: [function(require, module, exports) {
        /**
         * setAppBarColor - Sets the background color of the Android status bar.
         *
         * @param  {String} color An RGA hex-based color code —e.g. #cc0000 for a dark red.
         * @author Miguelángel Fernández
         */
        (() => {
            function setAppBarColor(color) {
                kony.application.setApplicationProperties({
                    statusBarColor: color
                });
            }
            kony.application.setAppBarColor = setAppBarColor;
        })();
    }, {}],
    3: [function(require, module, exports) {
        /**
         * getLocalizedString2 - Get the localised string for an i18n key or return the key itself
         * if no localised string is found for the current locale. This is useful because if there
         * are gaps in a language bundle, seeing the actual key on screen is useful to quickly determine
         * what translations are missing — as opposed to just seeing a blank label and wondering what
         * that is for.
         * This function also supports substitution variables specified with curly brackets — e.g.:
         * If the localised string of an i18n key <em>"LABELS.GREETING"</em> is <em>"Hello {name}"</em>, then the example
         * below will render <em>"Hello Miguel"</em>.
         * @example kony.i18n.getLocalizedString2("LABELS.GREETING", {"name": "Miguel"});
         *
         * @name getLocalizedString2
         * @namespace kony.i18n
         *
         * @author Miguelángel Fernández
         *
         */
        ((definition) => {
            kony.i18n.getLocalizedString2 = definition;
        })(
            /** @lends getLocalizedString2
             * @param  {String} key   The i18n key to be localised.
             * @param  {Object} scope Any substitution variables required for the placeholders in the localised string.
             * @return {String}       The localised string.
             **/
            function getLocalizedString2(key, scope) {
                var s = kony.i18n.getLocalizedString(key);
                if (!s) return key;
                for (var property in scope) {
                    if (scope.hasOwnProperty(property)) {
                        s = s.replace(new RegExp("\\{" + property + "\\}", "g"), scope[property]);
                    }
                }
                return s;
            });
    }, {}],
    4: [function(require, module, exports) {
        require("./amplify.js");
        require("./application.setAppBarColor.js");
        require("./i18n.getLocalizedString2.js");
        require("./main.js");
        require("./mvc.genAccessors.js");
        require("./mvc.patch.js");
        require("./mvc.router.js");
        require("./os.js");
        require("./ui.getDescendants.js");
    }, {
        "./amplify.js": 1,
        "./application.setAppBarColor.js": 2,
        "./i18n.getLocalizedString2.js": 3,
        "./main.js": 4,
        "./mvc.genAccessors.js": 5,
        "./mvc.patch.js": 6,
        "./mvc.router.js": 7,
        "./os.js": 8,
        "./ui.getDescendants.js": 9
    }],
    5: [function(require, module, exports) {
        /*
         * Define a component's setters and getters in one line by just listing the fields -e.g.:
         * initGettersSetters: function() {kony.mvc.genAccessors(this, ["foo","bar"]);}
         */
        ((definition) => {
            kony.mvc.genAccessors = definition;
        })((compCtrl, fields) => {
            fields.forEach((fieldName) => {
                //The internal field name is prefixed with underscore -e.g.: "_foo" for field "foo"
                var internalFieldName = "_" + fieldName;
                defineGetter(compCtrl, fieldName, function() {
                    return compCtrl[internalFieldName];
                });
                defineSetter(compCtrl, fieldName, function(message) {
                    compCtrl[internalFieldName] = message;
                });
            });
        });
    }, {}],
    6: [function(require, module, exports) {
        ((definition) => {
            kony.mvc.patch = definition;
        })((controller, bindComponents) => {
            if (!controller.constructor || controller.constructor.name !== "BaseController") {
                throw new Error("Cannot use extension kony.mvc.patch on anything other than a form controller");
            }
            const events = [ //Form events.
                "init",
                //"onDestroy" //Controllers already have their own onDestroy event.
                "preShow", "postShow", "onHide"
            ];
            var view = controller.view;
            events.forEach((eventName) => {
                if (typeof controller[eventName] === "function") {
                    view[eventName] = function() {
                        try {
                            //kony.print(`*******Event fired: ${view.id}.${eventName}`);
                            controller[eventName]();
                        } catch (e) {
                            alert(e);
                        }
                    };
                }
            });
            /*global amplify*/
            if (bindComponents) {
                if (typeof amplify !== "undefined" && typeof kony.ui.getDescendants !== "undefined") {
                    var components = kony.ui.getDescendants(controller.view, false, (child) => {
                        return child.name === "kony.ui.KComponent";
                    });
                    //kony.print(`Found ${components.length} components in form ${view.id}*******`);
                    components.forEach((component) => {
                        events.forEach((event) => {
                            if (typeof component[event] === "function") {
                                amplify.subscribe(`${view.id}.${event}`, component[event]);
                            } else {
                                kony.print(`${view.id}.${component.id}.${event} is either ` + "not defined or not exposed. Expose it as a custom method.");
                            }
                        });
                    });
                } else {
                    kony.print("Cannot bind component events to form events " + "without amplify and extension kony.ui.getDescendants");
                }
            }
            //TODO: Make this a require module so it can be applied to the component like: return kony.mvc.patch({controller here})
            /*var ctrlEvents = ["onNavigate", "onDestroy"];
            ctrlEvents.forEach((eventName) => {
            	if(typeof controller[eventName] === "function"){
            		controller[eventName] = function(){
            			try{
            				kony.print(`*******Controller event fired: ${controller.view.id}.${eventName}`);
            				controller[eventName]();
            			}
            			catch(e){
            				alert(e);
            			}
            		};
            	}
            });

            return controller;*/
        });
    }, {}],
    7: [function(require, module, exports) {
        /*exported $router*/
        var $router = (function() {
            var history = [];
            var maxH = 5;

            function _initHistory() {
                if (typeof history === "undefined") {
                    history = [];
                } else if (history.length >= 1) {
                    history = [history[0]];
                }
            }

            function _init(maxHistory) {
                _initHistory();
                if (typeof maxHistory !== "undefined" && !isNaN(maxHistory)) {
                    maxH = maxHistory;
                }
            }

            function _addToHistory(priorForm) {
                if (typeof priorForm === "undefined") {
                    return;
                }
                var priorId = priorForm.id;
                //If the latest is not already the prior one, then add it.
                if (history.length === 0 || history[history.length - 1] !== priorId) {
                    //If there's no more roon in the history, remove the oldest after home.
                    if (history.length >= maxH) {
                        history = history.slice(0, 1).concat(history.slice(2));
                    }
                    history.push(priorId);
                    kony.print(`********Added ${priorId} to history. length ${history.length}`);
                }
            }

            function _getCurrent() {
                return history[history.length - 1];
            }

            function _goBack(context) {
                if (history.length === 0) {
                    return;
                } else if (history.length === 1) {
                    _goTo(history[0], context, true);
                } else {
                    _goTo(history.pop(), context, true);
                }
            }

            function _goHome(context) {
                _goTo(history[0], context, true);
                _initHistory();
            }

            function _getHistory() {
                return JSON.parse(JSON.stringify(history));
            }

            function _goTo(friendlyName, context, isGoingBack) {
                try {
                    (new kony.mvc.Navigation(friendlyName)).navigate(context);
                    var priorForm = kony.application.getPreviousForm();
                    if (!isGoingBack) _addToHistory(priorForm);
                } catch (e) {
                    let message = "Can't navigate to form ";
                    message += `by friendly name '${friendlyName}'\nError: ${e}`;
                    //alert(message);
                    if (typeof kony.ui.Toast === "undefined") {
                        alert(message);
                    } else {
                        var toast = new kony.ui.Toast({
                            text: message,
                            duration: constants.TOAST_LENGTH_LONG
                        });
                        toast.show();
                    }
                }
            }
            return {
                init: _init,
                goto: _goTo,
                goTo: _goTo,
                getCurrent: _getCurrent,
                goBack: _goBack,
                goHome: _goHome,
                getHistory: _getHistory
            };
        })();
    }, {}],
    8: [function(require, module, exports) {
        (() => {
            const OS_ANDROID = "android";
            const OS_IOS = "ios";
            const MOBILE_WEB = "mobile_web";
            var os;
            var deviceInfo = kony.os.deviceInfo();
            //TODO: Break this module into one per function.
            function getOs() {
                os = OS_ANDROID;
                kony.print("ifdef android: true");
                //alert("ifdef android: true");
                if (typeof os === "undefined") {
                    // Mobile web -> kony.os.deviceInfo().name === thinclient.
                    var message1 = `kony.os.deviceInfo().name: ${deviceInfo.name}\n` + `kony.os.deviceInfo().osname: ${deviceInfo.osname}`;
                    kony.print(message1);
                    //alert(message1);
                    os = deviceInfo.name /*android*/ || deviceInfo.osname /*iPhone*/ ;
                    if (os === "i-phone" || os === "i-pad") {
                        os = OS_IOS;
                    } else if (os === "thinclient") {
                        os = MOBILE_WEB;
                    }
                }
                var message2 = `os: ${os}`;
                kony.print(message2);
                //alert(message2);
                return os;
            }

            function isIos() {
                return getOs() === OS_IOS;
            }

            function isAndroid() {
                return getOs() === OS_ANDROID;
            }

            function isWeb() {
                //TODO: Determine which other values other than thinclient mean it's a web app -e.g. responsive, PWA, desktop web, etc.
                return getOs() === MOBILE_WEB;
            }
            kony.os.isIos = isIos;
            kony.os.isAndroid = isAndroid;
            kony.os.isWeb = isWeb;
        })();
    }, {}],
    9: [function(require, module, exports) {
        /**
         * getDescendants - Returns an array containing all the widgets nested within a form or container widget.
         * The container widget may be a Form, a Flex Container, Scroll Flex Container or any other widget capable
         * of containing other widgets.
         *
         * @param  {FlexForm|FlexContainer|FlexFormContainer|Segment} containerWidget The parent form or container widget
         * for which you wish to get all descendants.
         * @param  {Boolean} includeParent   Whether to include the parent container widget in the
         * resulting array.
         * @param  {Function} test   A function used to determine which children must be included in the result.
         * @return {Array} An array containing all widgets within a form or container widget.
         *
         * @author Miguelángel Fernández
         */
        ((definition) => {
            kony.ui.getDescendants = definition;
        })(function getDescendants(containerWidget, includeParent, test) {
            //A function that given a widget, returns its children matching a test
            function getChildren(parent, t) {
                var filtered = typeof t === "function";
                var descendants = [];
                if (typeof parent.widgets === "function") {
                    let children = parent.widgets();
                    if (filtered) children = children.filter(t);
                    descendants = descendants.concat(children);
                }
                return descendants;
            }
            //If a widget is considered a descendant of itself, then start by putting it in the array.
            var descendants = includeParent ? [containerWidget] : [];
            if (typeof test === "function") descendants = descendants.filter(test);
            //Then add the children of the parent.
            descendants = getChildren(containerWidget, test);
            //Then add the children of each child already known.
            for (var k = 0; k < descendants.length; k++) {
                descendants = getChildren(descendants[k], test);
            }
            return descendants;
        });
    }, {}]
}, {}, [4]);