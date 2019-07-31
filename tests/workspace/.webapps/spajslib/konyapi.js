
$KI.setappevents = function(eventobj) {
    $KU.logExecuting('kony.application.setApplicationInitializationEvents');
    $KU.logExecutingWithParams('kony.application.setApplicationInitializationEvents', eventobj);
    
    if($KG["appmode"] == constants.APPLICATION_MODE_HYBRID) {
        var initfunc;
        if(IndexJL)
            initfunc = window["appinit"];
        else
            initfunc = window["appInit"];

        initfunc && initfunc();
        $KU.detectDevice();
        $KU.logExecutingFinished('kony.application.setApplicationInitializationEvents VIA $KG["appmode"] == constants.APPLICATION_MODE_HYBRID ');
        return;
    }

    $KG["__konyappevents"] = eventobj;
    
    var preappinit = eventobj["preappinit"] || null;
    var appinit = eventobj["init"] || null;
    var postappinit = eventobj["postappinit"] || null;
    var appservice = eventobj["appservice"] || null;
    var showstartref = eventobj["showstartupform"] || null;
    var deepfunc = eventobj["deeplink"] || null;
    var launchparams = {};
    var startform = null;
    var launchobj = {};
    launchobj["launchparams"] = {};
    var formmodel;
    var testAutomationScriptURL, konyAutomationPath;


    
    if(window.location.hash) {
        
        var formId = kony.bm.getFormId(window.location.hash);
        if(formId) {
            launchparams['formID'] = formId;
            var formState = kony.bm.getBMState(formId);
            if(formState) {
                for(var k in formState) {
                    launchparams[k] = formState[k];
                }
            }
        }
    }

    launchobj["launchmode"] = $KG["__launchmode"];

    if($KG["kdeepobj"]) {
        launchobj["launchparams"] = $KG["kdeepobj"];
    }

    
    
    for(var prop in launchparams) {
        launchobj["launchparams"][prop] = launchparams[prop];
    }
    
    $KU.getInnerHeight($KU.isIDevice ? 0 : 200);
    $KU.isAndroid && setTimeout(function() {
        $KG['__viewportHeight'] = window.innerHeight;
    }, 200);
    preappinit && preappinit(launchobj);

    $KU.detectDevice();



    appinit = $KU.returnEventReference(appinit);
    appinit && appinit(launchparams);

    if(appConfig.testAutomation) {
        testAutomationScriptURL = appConfig.testAutomation.scriptsURL;

        if(testAutomationScriptURL && testAutomationScriptURL.length !== 0
        && testAutomationScriptURL.startsWith('http')) {
            konyAutomationPath = appConfig.testAutomation.scriptsURL;
            if($KU.isMob) {
                konyAutomationPath = appConfig.testAutomation.scriptsURL + "Mobile";
            } else if($KU.isTablet) {
                konyAutomationPath = appConfig.testAutomation.scriptsURL + "Tablet";
            }

            setTimeout(function() {
                $KAR && $KAR.invokeJasmineAutomation(konyAutomationPath);
            }, 1000);
        } else {
            kony.web.logger('log', 'Invalid test automation configuration.');
        }
    }

    kony.appinit.migrateLocalStorage();

    $KG.isMVC = $KG.appbehaviors.isMVC || false;
    launchparams["isRefresh"] = false;
    launchparams["isNewSPASession"] = (kony.appinit.isNewSession == "true") ? true : false;
    if(window.location.hash) {
        var formObj = window[window.location.hash.substring(2)];
        if(formObj && !launchparams["isNewSPASession"]) {
            launchparams["isRefresh"] = true;
            launchparams["refreshForm"] = formObj;
        }
    }
    for(var prop in launchparams) {
        launchobj["launchparams"][prop] = launchparams[prop];
    }



    if(postappinit) {
        startform = postappinit(launchobj);
    }

    if(deepfunc || appservice) {
        
        if(appservice) {
            startform = appservice(launchobj);
        } else if(deepfunc) {
            startform = deepfunc($KG["kdeepobj"]);
        }
    }

    if((startform == null) || (startform.length == 0)) {
        showstartref && showstartref(launchobj);
    } else {
        if(typeof startform == "string") {
            var homeform = $KG.allforms[startform];
            if(homeform) {
                homeform.show();
            } else {
                homeform = new kony.mvc.Navigation(startform);
                homeform.navigate();
            }

        } else {
            formmodel = startform;
            formmodel && formmodel.show();
        }

    }
    
    document.body.setAttribute('aria-busy', 'false');
    if($KG.appbehaviors["responsive"] === true) {
        $KU.addClassName(document.documentElement, 'responsive');
    }
    $KU.logExecutingFinished('kony.application.setApplicationInitializationEvents VIA end of the function ');
};


$KI.window = {
    openURL: function(url, params, name) {
        
        
        $KU.logExecuting('kony.application.openURL');
        $KU.logExecutingWithParams('kony.application.openURL', url, params, name);
        $KW.unLoadWidget();
        if(!name) name = "_blank";
        $KU.logExecutingFinished('kony.application.openURL');
        window.open(url, name);
    },

    openURLAsync: function(config) {
        $KU.logExecuting('kony.application.openURLAsync');
        var url, callback;
        if(!config) {
            $KU.logErrorMessage('Invalid parameter');
            return;
        }
        $KU.logExecutingWithParams('kony.application.openURLAsync', config);
        url = config.url;
        callback = config.callback;
        window.open(url, "_blank");
        $KU.logExecutingFinished('kony.application.openURLAsync');
        callback && callback(constants.OPEN_URL_UNKNOWN);
    },

    alert: function(message, alertHandler, alertType) {
        if(message === null) return;

        var msgstr = message;
        var hndlr = alertHandler || null;
        var alerttype = alertType || null;

        if(message.message || message.alerttype || message.alertType) {
            alerttype = message.alerttype || message.alertType;
            msgstr = message.message;
            hndlr = message.alerthandler || message.alertHandler || null;
        }

        if(alerttype === constants.ALERT_TYPE_INFO || alerttype === constants.ALERT_TYPE_ERROR || !alerttype) {
            alert(msgstr);
            hndlr && hndlr();
        } else if(alerttype === constants.ALERT_TYPE_CONFIRMATION) {
            var answer = confirm(msgstr);
            hndlr && hndlr(answer);
        }
    },

    openMediaURL: function() {
        $KU.logWarnMessage('openMediaURL not supported in SPA');
    },

    
    showLoadingScreen: function() {
        $KU.logExecuting('kony.application.showLoadingScreen');
        $KU.logExecutingWithParams('kony.application.showLoadingScreen');
        $KG.__dismissed = false;
        var skin = arguments[0];
        var text = arguments[1] || "";
        var position = arguments[2] || constants.LOADING_SCREEN_POSITION_FULL_SCREEN;
        var isBlocked = (arguments[3] === false) ? false : true;
        var showProgressIndicator = (arguments[4] === false) ? false : true;
        var indicator = showProgressIndicator ? "<img src='" + $KU.getImageURL("loading.gif") + "' style='vertical-align:middle'/>" : "";
        text = text ? "<label style='padding:10px; xfont-size: 16px;color:" + (skin ? ' inherit;' : 'white;') + (!showProgressIndicator ? "display: block;" : "") + "'>" + text + "</label>" : "";

        
        $KU.createa11yDynamicElement();

        var loadingDiv = document.getElementById("__loadingScreenDiv");
        var divTag = loadingDiv || document.createElement("div");
        
        if($KU.isWindowsPhone) {
            divTag.onclick = function() {
                var event = window.event;
                if(event) {
                    kony.events.preventDefault(event);
                    kony.events.stopPropagation(event);
                }
            }

        }
        divTag.id = "__loadingScreenDiv";
        divTag.style.zIndex = "100";
        divTag.style.visibility = "hidden";
        divTag.style.backgroundColor = "";
        var topPos = "50%";
        $KG.bgImgHeight = 0;
        divTag.className = "";

        var setLoadingPosition = function(event) {
            if($KG.__dismissed)
                return;

            if(!event)
                event = window.event;
            if(event && event.type == 'error')
                document.body.appendChild(divTag);
            else {
                var tagName, wrapDiv = "";
                if(event && event.type == 'load') {
                    tagName = event.srcElement.tagName;
                    $KG.bgImgHeight = event.srcElement.naturalHeight;
                } else
                    wrapDiv = document.querySelector("div[id='__wrapperDiv']");

                var bgPos, posY, screenH;
                var scrolledHeight = 0;
                if($KG.nativeScroll) {
                    
                    var mainContainerHeight = document.getElementById("__MainContainer").clientHeight;
                    if(mainContainerHeight < (window.innerHeight || document.body.clientHeight))
                        divTag.style.height = (window.innerHeight || document.body.clientHeight) + "px";
                    else
                        divTag.style.height = mainContainerHeight + "px";
                    if($KU.isIDevice)
                        scrolledHeight = document.body.scrollTop || window.pageYOffset; 
                }

                
                document.body.appendChild(divTag);
                
                screenH = $KG["__innerHeight"] || window.innerHeight || document.body.clientHeight;
                divTag.style.display = "";
                divTag.style.visibility = "visible";
                var bias;
                var innerDiv = divTag.firstChild;
                if(tagName && tagName.toLowerCase() == "img") {
                    bias = event.srcElement.naturalHeight;
                } else if(wrapDiv) {
                    
                    if(wrapDiv.firstChild && wrapDiv.firstChild.tagName.toLowerCase() == "img") {
                        bias = wrapDiv.firstChild.naturalHeight;
                    } else { 
                        bias = $KG.bgImgHeight || innerDiv.clientHeight || 0;
                    }
                } else {
                    bias = innerDiv.clientHeight;
                }

                posY = Math.round(scrolledHeight + (screenH - bias) / 2) + "px";
                bgPos = "50% " + parseInt(posY, 10) + "px";
                divTag.style.backgroundPosition = bgPos;
                topPos = posY;
                innerDiv.style.top = posY;
                var labelEle = document.querySelector("#__loadingScreenDiv label");
                labelEle = labelEle && labelEle.textContent;
                labelEle && $KU.changea11yDynamicElement(labelEle);
                
                
            }
        };

        var orientationEvent = ($KU.isOrientationSupported && !$KU.isAndroid) ? "onorientationchange" : "onresize";
        kony.events.addEvent(orientationEvent, "loadingScreen", function() {
            setTimeout(setLoadingPosition, $KU.orientationDelay)
        });
        
        if(position == constants.LOADING_SCREEN_POSITION_FULL_SCREEN || isBlocked) {
            divTag.className = "popuplayer absoluteContainer ";
            if($KG.nativeScroll && !$KU.isIDevice)
                divTag.style.position = "fixed";
            divTag.style.top = 0;
            if(position == constants.LOADING_SCREEN_POSITION_FULL_SCREEN) {
                divTag.style.backgroundPosition = "center";
                divTag.className += skin;
                var bgColor = $KU.getCSSPropertyFromRule(skin, 'background-color');
                if(bgColor && bgColor != "initial" && bgColor != "inherit") {
                    if($KU.isWindowsPhone && bgColor == "transparent") 
                        divTag.style.background = "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)";
                    else
                        divTag.style.backgroundColor = bgColor;
                }
            }
        }

        var wrapperDiv = "<div id ='__wrapperDiv'>";
        
        var style = "xcolor:white;position:absolute;width:100%;z-index:100;text-align:center;";
        if($KG["nativeScroll"] && $KU.isBlackBerryNTH) {
            style = "xcolor:white;position:fixed;width:100%;z-index:100;text-align:center;";
        }
        var className = "";
        if(position == constants.LOADING_SCREEN_POSITION_ONLY_CENTER) {
            var height = $KU.getCSSPropertyFromRule(skin, 'height');
            if(height) {
                height = height.replace("%", "");
                height = parseInt((height * (window.innerHeight) / 100), 10);
                style += "height:" + height + "px !important";
            }
            className = skin;
            style += "background-position: center;";
        }

        divTag.innerHTML = "<div id='__innerDiv' class='" + className + "' style='" + style + "'>" + wrapperDiv + indicator + text + "</div></div>";
        var backgroundImage = "";

        if(showProgressIndicator) {
            
            backgroundImage = $KU.getImageURL("loading.gif");
            $KU.imagePreloader(backgroundImage, setLoadingPosition);
        } else {
            
            backgroundImage = $KU.getCSSPropertyFromRule(skin, 'background-image');
            if(backgroundImage && backgroundImage != "none" && backgroundImage != "initial" && backgroundImage != "inherit") {
                backgroundImage = backgroundImage.split("/").pop().split(')')[0].split('"')[0];
                backgroundImage = $KU.getImageURL(backgroundImage);
                $KU.imagePreloader(backgroundImage, setLoadingPosition);
            } else
                setLoadingPosition();
        }

        
        if(!loadingDiv && $KG["nativeScroll"]) {
            function preventScroll(e) {
                var evt = e || window.event;
                kony.events.preventDefault(evt);
                kony.events.stopPropagation(evt);
                return false;
            }

            kony.events.addEventListener(divTag, $KU.isTouchSupported ? 'touchstart' : 'mousedown', preventScroll);
            kony.events.addEventListener(divTag, $KU.isTouchSupported ? 'touchmove' : 'mousemove', preventScroll);

        }
        $KU.logExecutingFinished('kony.application.showLoadingScreen');
    },

    dismissLoadingScreen: function() {
        $KU.logExecuting('kony.application.dismissLoadingScreen');
        $KU.logExecutingWithParams('kony.application.dismissLoadingScreen');
        var loadingDiv = document.getElementById("__loadingScreenDiv");
        if(loadingDiv)
            loadingDiv.style.display = "none";
        $KG.__dismissed = true;
        $KU.logExecutingFinished('kony.application.dismissLoadingScreen');
    },

};

$KI.exit = function() {
    $KU.logExecuting('kony.application.exit');
    $KU.logExecutingWithParams('kony.application.exit');
    if($KU.isIDevice || !$KU.isMob) {
        window.open('', '_self', '');
        $KU.logExecutingFinished('kony.application.exit');
        window.close();
    }
};

$KI.appreset = function() {
    kony.web.logger("warn", "appreset not supported in SPA");
};

$KI.assert = function(arg1, arg2) {
    if(null === args1 || false === args2) {
        if(arguments.length > 1) {
            if(typeof(args2) === "string") {
                throw new Error(args2);
            } else {
                throw new Error("Invalid argument to assert");
            }
        } else {
            throw new Error("Assertion failed");
        }
    } else {
        return arg1;
    }
};

$KI.type = function(arg) {
    var result;

    if(typeof(arg) == "undefined" || arg + "" == "null") {
        result = IndexJL ? "nil" : "null";
    } else
    if(typeof(arg) === "boolean") {
        result = "boolean";
    } else
    if(typeof(arg) === "number") {
        result = "number";
    } else
    if(typeof(arg) === "string") {
        result = "string";
    } else
    if(typeof(arg) === "function") {
        result = "function";
    } else {
        result = IndexJL ? "table" : "object";
    }
    return result;
};

$KI.converttobase64 = function(rawbytes) {
    $KU.logExecuting('kony.convertToBase64');
    $KU.logExecutingWithParams('kony.convertToBase64', rawbytes);
    $KU.logExecutingFinished('kony.convertToBase64');
    return $KU.getBase64(rawbytes);
};

$KI.converttorawbytes = function() {
    $KU.logWarnMessage('converttorawbytes api not supported in SPA');
};

$KI.setappheaders = function(headers) {
    kony.app.headers = {};

    if(IndexJL) headers.splice(0, 1);

    for(i = 0; i < headers.length; i++) {
        kony.app.headers[headers[i].id] = headers[i];
        _konyConstNS.Form2.prototype.createFormLevelHierarchy.call(headers[i], headers[i].ownchildrenref);
    }
};

$KI.setappfooters = function(footers) {
    kony.app.footers = {};

    if(IndexJL) footers.splice(0, 1);

    for(i = 0; i < footers.length; i++) {
        kony.app.footers[footers[i].id] = footers[i];
        _konyConstNS.Form2.prototype.createFormLevelHierarchy.call(footers[i], footers[i].ownchildrenref);
    }
};

$KI.setapplicationcallbacks = function() {
    kony.web.logger("warn", "setApplicationCallbacks API is not supported on SPA, DesktopWeb and Responsive Web");
};

$KI.addapplicationcallbacks = function() {
    kony.web.logger("warn", "addApplicationCallbacks API is not supported on SPA, DesktopWeb and Responsive Web");
};

$KI.removeapplicationcallbacks = function() {
    kony.web.logger("warn", "removeApplicationCallbacks API is not supported on SPA, DesktopWeb and Responsive Web");
};

$KI.setapplicationbehaviors = function(appbehavior) {
    var key, FORMCONTROLLERSYNCLOAD = 'FormControllerSyncLoad';
    $KU.logExecuting('kony.application.setApplicationBehaviors');
    $KU.logExecutingWithParams('kony.application.setApplicationBehaviors', appbehavior);
    if(!$KG.appbehaviors) {
        $KG.appbehaviors = appbehavior;
    } else {
        for(key in appbehavior) {
            if(FORMCONTROLLERSYNCLOAD === key && undefined === $KG.appbehaviors[key]) {
                Object.defineProperty($KG.appbehaviors, FORMCONTROLLERSYNCLOAD, {
                    value: appbehavior[key],
                    writable: false
                });
            } else {
                $KG.appbehaviors[key] = appbehavior[key];
            }
        }
    }
    $KU.logExecutingFinished('kony.application.setApplicationBehaviors');
};

$KI.getapplicationbehavior = function(key) {
    return $KG.appbehaviors && $KG.appbehaviors[key];
};

$KI.setupWidgetDataRecording = function() {
    
    $KG.appbehaviors["recording"] = true;
};

$KI.setSeoDataReadyFlag = function() {
    $KU.logExecuting('kony.application.setSeoDataReadyFlag');
    $KU.logExecutingWithParams('kony.application.setSeoDataReadyFlag');
    document.body.setAttribute('data-ready', 1);
    $KU.logExecutingFinished('kony.application.setSeoDataReadyFlag');
};

$KI.removeSeoDataReadyFlag = function() {
    $KU.logExecuting('kony.application.removeSeoDataReadyFlag');
    $KU.logExecutingWithParams('kony.application.removeSeoDataReadyFlag');
    document.body.removeAttribute('data-ready');
    $KU.logExecutingFinished('kony.application.removeSeoDataReadyFlag');
};

function tobeimplemented(str) {
    str = (typeof str === 'string') ? str : "";
    kony.web.logger("warn", str + "  API is either not implemented or unsupported");
}

KonyError = function(errorcode, name, message) {
    this.errorCode = this.errorcode = errorcode;
    this.name = name;
    this.message = message;
};


KonyError.prototype = new Error();
KonyError.prototype.constructor = KonyError;

kony.getError = function(e) {
    $KU.logExecuting('kony.getError');
    $KU.logExecutingWithParams('kony.getError', e);
    $KU.logExecutingFinished('kony.getError');
    return e;
};

kony.bm = {
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    
    
    FORM_PREFIX: '#_',
    GSTATE_PREFIX: '/',

    __global_state__: {},
    __check_args__: function(args, count) {
        if(args.length != count) {
            $KU.logErrorMessage("Invalid number of arguments. Expected: " + count + ", Given: " + args.length);
            throw new Error("Invalid number of arguments. Expected: " + count + ", Given: " + args.length);
        }

        
        
        
        for(var i in args) {
            if(typeof(args[i]) === 'undefined') {
                throw new Error("Invalid arg[" + i + "] in " + args);
            }
        }
    },

    


    __initialized__: false,
    
    
    __init__: function() {
        var hp = window.location.href;
        if(hp.indexOf("http") == 0) {
            hp = kony.bm.__get_hash__(hp);
        }
        var stateStr = kony.bm.__get_raw_state__(hp);
        if(stateStr) {
            kony.bm.__global_state__ = JSON.parse(decodeURI(stateStr));
        }
        kony.bm.__initialized__ = true;
    },

    
    
    __update_hash__: function() {
        var jsonStr = JSON.stringify(kony.bm.__global_state__);
        var currentFormId = kony.bm.getFormId(window.location.hash);
        window.location.hash = kony.bm.FORM_PREFIX + currentFormId + kony.bm.GSTATE_PREFIX + encodeURI(jsonStr);
    },

    __get_hash__: function(href) {
        return href.substr(href.indexOf(kony.bm.FORM_PREFIX));
    },

    __get_raw_state__: function(hash_part) {
        var hp = hash_part; 
        var indexOfStateBegin = hp.indexOf(kony.bm.GSTATE_PREFIX);
        var rawState = ""; 
        if(indexOfStateBegin > 0) { 
            rawState = hp.substr(hp.indexOf(kony.bm.GSTATE_PREFIX) + kony.bm.GSTATE_PREFIX.length);
        }
        return rawState;
    },


    
    

    getFormId: function(hash_part) {
        var hp = hash_part; 
        if(!hp) { 
            hp = location.hash;
        }
        var formAndState = hp.substr(hp.indexOf(kony.bm.FORM_PREFIX) + kony.bm.FORM_PREFIX.length);
        var indexOfStateBegin = formAndState.indexOf(kony.bm.GSTATE_PREFIX);

        var formId;
        if(indexOfStateBegin < 0) { 
            formId = formAndState;
        } else {
            formId = formAndState.substr(0, indexOfStateBegin);
        }
        return formId;
    },

    
    

    
    
    
    
    
    setBMState: function(formId, json) {
        $KU.logExecuting('kony.application.setBMState');
        $KU.logExecutingWithParams("kony.application.setBMState", formId, json);
        kony.bm.__check_args__(arguments, 2);
        if(!kony.bm.__initialized__) {
            kony.bm.__init__();
        }
        kony.bm.__global_state__[formId] = json;
        kony.bm.__update_hash__();
        $KU.logExecutingFinished('kony.application.setBMState');
    },

    
    
    resetBMState: function(formId) {
        $KU.logExecuting('kony.application.resetBMState');
        $KU.logExecutingWithParams('kony.application.resetBMState', formId);
        kony.bm.__check_args__(arguments, 1);
        if(!kony.bm.__initialized__) {
            kony.bm.__init__();
        }
        delete kony.bm.__global_state__[formId];
        kony.bm.__update_hash__();
        $KU.logExecutingFinished('kony.application.resetBMState');
    },

    
    
    
    
    
    
    addBMState: function(formId, name, value) {
        $KU.logExecuting('kony.application.addBMState');
        kony.bm.__check_args__(arguments, 3);
        if(!kony.bm.__initialized__) {
            kony.bm.__init__();
        }
        $KU.logExecutingWithParams('kony.application.addBMState', formId, name, value);
        var s = kony.bm.getBMState(formId);
        if(!s) {
            s = {};
            kony.bm.setBMState(formId, s);
        }
        s[name] = value;
        kony.bm.__update_hash__();
        $KU.logExecutingFinished('kony.application.addBMState');
    },

    
    
    
    removeBMState: function(formId, name) {
        $KU.logExecuting('kony.application.removeBMState');
        $KU.logExecutingWithParams('kony.application.removeBMState', formId, name);
        kony.bm.__check_args__(arguments, 2);

        if(!kony.bm.__initialized__) {
            kony.bm.__init__();
        }
        var s = kony.bm.getBMState(formId);
        if(s) {
            delete s[name];
            kony.bm.__update_hash__();
        }
        $KU.logExecutingFinished('kony.application.removeBMState');
    },

    
    
    getBMState: function(formId) {
        $KU.logExecuting('kony.application.getBMState');
        $KU.logExecutingWithParams('kony.application.getBMState', formId);
        kony.bm.__check_args__(arguments, 1);

        if(!kony.bm.__initialized) {
            kony.bm.__init__();
        }
        $KU.logExecutingFinished('kony.application.getBMState');
        return kony.bm.__global_state__[formId];
    }
};

$KI.setUncaughtExceptionHandler = function(uncaughtExceptionHandler) {
    if(uncaughtExceptionHandler === null) {
        $KI.uncaughtExceptionHandler = null;
    } else if(typeof uncaughtExceptionHandler === 'function') {
        $KI.uncaughtExceptionHandler = uncaughtExceptionHandler;
    }
};

$KI.getUncaughtExceptionHandler = function() {
    return $KI.uncaughtExceptionHandler;
};

window.onerror = function(message, url, line, column, error) {
    var exceptionObject, stack;

    if($KI.uncaughtExceptionHandler) {
        exceptionObject = {
            "message": message,
            "sourceURL": url,
            "line": line,
            "column": column,
            "error": error
        };

        $KI.uncaughtExceptionHandler(exceptionObject);
    } else if(spaAPM) {
        spaAPM.apmErrorHandler(message, url, line, column, error);
    }

    if(appConfig.isDebug && appConfig.testAutomation && window.jasmineOnError) {
        if(arguments instanceof KonyError) {
            window.jasmineOnError(arguments);
        } else {
            stack = error ? error.stack : null;
            window.jasmineOnError({
                'name': 'jasmineException',
                'errorCode': '200', 
                'message': message,
                'sourceURL': url,
                'line': line,
                'stack': stack
            });
        }
    }
};



