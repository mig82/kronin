kony.visualizer = {};
kony.visualizer.actions = {};

function displayMWError() {
    kony.ui.Alert("Middleware Error ", null, "error", null, null);
};

function displaySessionError() {
    kony.ui.Alert("Session Expired .. Please re-login", null, "error", null, null);
};

function displayError(code, msg) {
    // Commented for SWA: kony.ui.Alert("Error Code: "..code .." Message: " ..msg,null,"error",null,null);
    kony.ui.Alert(code + "- " + msg, null, "error", null, null);
};
var mergeHeaders = function(httpHeaders, globalHeaders) {
    for (var attrName in globalHeaders) {
        httpHeaders[attrName] = globalHeaders[attrName];
    }
    return httpHeaders;
};

function appmiddlewareinvokerasync(inputParam, callBack) {
    var url = appConfig.url;
    var sessionIdKey = "cacheid";
    inputParam.appID = appConfig.appId;
    inputParam.appver = appConfig.appVersion;
    inputParam["channel"] = "wap";
    inputParam["platform"] = kony.os.deviceInfo().name;
    inputParam[sessionIdKey] = sessionID;
    if (globalhttpheaders) {
        if (inputParam["httpheaders"]) {
            inputParam.httpheaders = mergeHeaders(inputParam.httpheaders, globalhttpheaders);
        } else {
            inputParam.httpheaders = globalhttpheaders;
        };
    };
    var connHandle = _invokeServiceAsyncForMF_(url, inputParam, callBack);
    return connHandle;
};

function appmiddlewaresecureinvokerasync(inputParam, callBack) {
    var url = appConfig.secureurl;
    var sessionIdKey = "cacheid";
    inputParam.appID = appConfig.appId;
    inputParam.appver = appConfig.appVersion;
    inputParam["channel"] = "wap";
    inputParam["platform"] = kony.os.deviceInfo().name;
    inputParam[sessionIdKey] = sessionID;
    if (globalhttpheaders) {
        if (inputParam["httpheaders"]) {
            inputParam.httpheaders = mergeHeaders(inputParam.httpheaders, globalhttpheaders);
        } else {
            inputParam["httpheaders"] = globalhttpheaders;
        };
    };
    var connHandle = _invokeServiceAsyncForMF_(url, inputParam, callBack);
    return connHandle;
};

function mfgetidentityservice(idProviderName) {
    var currentInstance = kony.sdk.getCurrentInstance();
    if (!currentInstance) {
        throw new Exception("INIT_FAILURE", "Please call init before getting identity provider");
    }
    return currentInstance.getIdentityService(idProviderName);
};
/**
 * @function mfidentityserviceinvoker
 * @description Invokes identity service
 * @public
 * @param {string} idProviderName
 * @param {object} params {userid : <userid>, password : <password>, browserWidget : <browserwidget>, operation : "login/logout"}
 * and other optional params like callerID and custom params in case of custom provider.
 * @param {function} successCallback
 * @param {function} failureCallback
 */
function mfidentityserviceinvoker(idProviderName, params, successCallback, failureCallback) {
    var authorizationClient = mfgetidentityservice(idProviderName);
    kony.print("Invoking identity service " + idProviderName + " through Kony Fabric.");
    if (!params.operation || params.operation == "login") {
        authorizationClient.login(params, successCallback, failureCallback);
    } else {
        authorizationClient.logout(successCallback, failureCallback, params);
    }
};

function mfintegrationsecureinvokerasync(inputParam, serviceID, operationID, callBack) {
    var url = appConfig.secureurl;
    var sessionIdKey = "cacheid";
    inputParam.appID = appConfig.appId;
    inputParam.appver = appConfig.appVersion;
    inputParam["channel"] = "wap";
    inputParam["platform"] = kony.os.deviceInfo().name;
    inputParam[sessionIdKey] = sessionID;
    if (globalhttpheaders) {
        if (inputParam["httpheaders"]) {
            inputParam.httpheaders = mergeHeaders(inputParam.httpheaders, globalhttpheaders);
        } else {
            inputParam["httpheaders"] = mergeHeaders({}, globalhttpheaders);
        };
    };
    kony.print("Async : Invoking service through Kony Fabric with url : " + url + " service id : " + serviceID + " operationid : " + operationID + "\n input params" + JSON.stringify(inputParam));
    if (kony.mbaas) {
        kony.mbaas.invokeMbaasServiceFromKonyStudio(url, inputParam, serviceID, operationID, callBack);
    } else {
        alert("Unable to find the Kony Fabric SDK for KonyStudio. Please download the SDK from the Kony Cloud Console and add as module to the Kony Project.");
    }
};

function mfintegrationsecureinvokersync(inputParam, serviceID, operationID) {
    var url = appConfig.secureurl;
    var sessionIdKey = "cacheid";
    var resulttable;
    inputParam.appID = appConfig.appId;
    inputParam.appver = appConfig.appVersion;
    inputParam["channel"] = "wap";
    inputParam["platform"] = kony.os.deviceInfo().name;
    inputParam[sessionIdKey] = sessionID;
    if (globalhttpheaders) {
        if (inputParam["httpheaders"]) {
            inputParam.httpheaders = mergeHeaders(inputParam.httpheaders, globalhttpheaders);
        } else {
            inputParam["httpheaders"] = mergeHeaders({}, globalhttpheaders);
        };
    };
    kony.print("Invoking service through Kony Fabric with url : " + url + " service id : " + serviceID + " operationid : " + operationID + "\n input params" + JSON.stringify(inputParam));
    if (kony.mbaas) {
        resulttable = kony.mbaas.invokeMbaasServiceFromKonyStudioSync(url, inputParam, serviceID, operationID);
        kony.print("Result table for service id : " + serviceID + " operationid : " + operationID + " : " + JSON.stringify(resulttable));
    } else {
        alert("Unable to find the Kony Fabric SDK for KonyStudio. Please download the SDK from the Kony Cloud Console and add as module to the Kony Project.");
    }
    return resulttable;
};
/*
   Sample invocation code
   var inputparam = {};
   inputparam.options = {
       "access": "online",
       "CRUD_TYPE": "get",//get/create..
       "odataurl": "$filter=UserId eq xxx",
       "data" : {a:1,b:2}//in case of create/update
   };
*/
function mfobjectsecureinvokerasync(inputParam, serviceID, objectID, callBack) {
    var options = {
        "access": inputParam.options.access
    };
    var serviceObj = kony.sdk.getCurrentInstance().getObjectService(serviceID, options);
    var CRUD_TYPE = inputParam.options.CRUD_TYPE;
    switch (CRUD_TYPE) {
        case 'get':
            var dataObject = new kony.sdk.dto.DataObject(objectID);
            var headers = inputParam.httpheaders || {};
            if (inputParam.options && inputParam.options.odataurl) dataObject.setOdataUrl(inputParam.options.odataurl.toString());
            options = {
                "dataObject": dataObject,
                "headers": headers
            };
            serviceObj.fetch(options, callBack, callBack);
            break;
        case 'create':
            var dataObject = new kony.sdk.dto.DataObject(objectID);
            var headers = inputParam.httpheaders || {};
            var data = inputParam.options && inputParam.options.data || {};
            var key;
            for (key in data) {
                dataObject.addField(key, data[key]);
            }
            options = {
                "dataObject": dataObject,
                "headers": headers
            };
            serviceObj.create(options, callBack, callBack);
            break;
        case 'update':
            var dataObject = new kony.sdk.dto.DataObject(objectID);
            var headers = inputParam.httpheaders || {};
            var data = inputParam.options && inputParam.options.data || {};
            var key;
            for (key in data) {
                dataObject.addField(key, data[key]);
            }
            options = {
                "dataObject": dataObject,
                "headers": headers
            };
            serviceObj.update(options, callBack, callBack);
            break;
        case 'partialupdate':
            var dataObject = new kony.sdk.dto.DataObject(objectID);
            var headers = inputParam.httpheaders || {};
            var data = inputParam.options && inputParam.options.data || {};
            var key;
            for (key in data) {
                dataObject.addField(key, data[key]);
            }
            options = {
                "dataObject": dataObject,
                "headers": headers
            };
            serviceObj.partialUpdate(options, callBack, callBack);
            break;
        case 'delete':
            var dataObject = new kony.sdk.dto.DataObject(objectID);
            var headers = inputParam.httpheaders || {};
            var data = inputParam.options && inputParam.options.data || {};
            var key;
            for (key in data) {
                dataObject.addField(key, data[key]);
            }
            options = {
                "dataObject": dataObject,
                "headers": headers
            };
            serviceObj.deleteRecord(options, callBack, callBack);
            break;
        default:
    }
};

function callAppMenu() {
    applicationController = require("applicationController");
    var appMenu = [
        ["appmenuitemid1", "Item 1", "option1.png", applicationController.appmenuseq, {}],
        ["appmenuitemid2", "Item 2", "option2.png", applicationController.appmenuseq, {}],
        ["appmenuitemid3", "Item 3", "option3.png", applicationController.appmenuseq, {}],
        ["appmenuitemid4", "Item 4", "option4.png", applicationController.appmenuseq, {}]
    ];
    kony.application.createAppMenu("sampAppMenu", appMenu, "", "");
    kony.application.setCurrentAppMenu("sampAppMenu");
};

function makeCall(eventobject) {
    kony.phone.dial(eventobject.text);
};

function initializeGlobalVariables() {};
kony.visualizer.toBoolean = function(output) {
    try {
        if (typeof output === "string") {
            if (output && output.toLowerCase() === "true") {
                output = true;
            } else {
                output = false;
            }
        } else if (typeof output === "number") {
            output = Boolean(output);
        }
    } catch (e) {
        kony.print('Error while converting the value to boolean datatype: ' + e);
    }
    return output;
};
kony.visualizer.toNumber = function(output) {
    try {
        if (typeof output === "string") {
            if (!output || isNaN(Number(output))) {
                kony.print('The value [' + output + '] after data type conversion is not a number(NaN)');
            } else {
                output = Number(output);
            }
        } else if (typeof output === "boolean") {
            output = Number(output);
        }
    } catch (e) {
        kony.print('Error while converting the value to number datatype: ' + e);
    }
    return output;
};
/**
 * Util to return value of the widget property with the {propertyName}
 * @param {Object/String} output
 * @param {String} propertyName
 * @returns {Object/String} - Returns value of {propertyName} if present, else it returns {output} as it is.
 */
kony.visualizer.getPropertyValue = function(output, propertyName) {
    if (typeof output === "object") {
        if (output.hasOwnProperty(propertyName)) {
            return output[propertyName];
        } else {
            kony.print(JSON.stringify(output) + ' does not have ' + propertyName + ' property');
        }
    }
    return output;
};
/*
	This API is used to merge User controller and controller action of Form.
 */
kony.visualizer.mixinControllerActions = function(controller, controllerActions) {
    for (var i = 0; i < controllerActions.length; i++) {
        var actions = require(controllerActions[i]);
        for (var key in actions) {
            /*If the user has defined action in formController then that takes priority 
            	over the action generated in controllerActions.
            	Example: onNavigate
            */
            if (typeof controller[key] === "undefined") {
                controller[key] = actions[key];
            }
        }
    }
    return controller;
};
kony.visualizer.i18nKeyObject = {
    "text": "i18n_text",
    "placeholder": "i18n_placeholder",
    "tabName": "i18n_tabName",
    "leftSideText": "i18n_leftSideText",
    "rightSideText": "i18n_rightSideText"
};
kony.visualizer.getI18nAttrb = function(property) {
    return kony.visualizer.i18nKeyObject[property];
};
//To set the passthrough properties at constructor level
function extendConfig(config, controllerConfig, id) {
    var __extendOverrides__ = function(config, currentOverrides, isTopLevelSrc) {
        Object.keys(currentOverrides).forEach(function(property) {
            var FLEX_PROPS_SANS_ZINDEX = ["left", "right", "top", "bottom", "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight", "centerX", "centerY"];
            /*If height is preferred,
                For autogrowmode supported widgets, set autogrowmode and delete height from config.
                For other widgets, delete height from config.
            */
            if (property === "autogrowMode" && isTopLevelSrc) {
                delete config["height"];
                config[property] = currentOverrides[property];
            } else if (FLEX_PROPS_SANS_ZINDEX.indexOf(property) !== -1 && isTopLevelSrc) {
                if (currentOverrides[property] == 'viz.val_cleared' || (property === "height" && currentOverrides.hasOwnProperty(property) && currentOverrides[property] == kony.flex.USE_PREFFERED_SIZE)) {
                    delete config[property];
                } else {
                    config[property] = currentOverrides[property];
                }
            } else if (config[kony.visualizer.getI18nAttrb(property)] && isTopLevelSrc) {
                delete config[kony.visualizer.getI18nAttrb(property)];
                config[property] = currentOverrides[property];
            } else {
                config[property] = currentOverrides[property];
            }
        });
    };
    var __parseComponentId__ = function(wgtOverrideId) {
        //sample wgtOverrideId: "comp2.comp1.btnId"
        var parentIdArr = wgtOverrideId.split('.');
        return {
            rootId: parentIdArr.splice(0, 1)[0],
            childId: parentIdArr.join(".")
        };
    };
    var widgetsOverrides = (controllerConfig && controllerConfig.overrides);
    for (var wgtOverrides in widgetsOverrides) {
        var currentOverrides = widgetsOverrides[wgtOverrides];
        var idObj = __parseComponentId__(wgtOverrides);
        var rootId = idObj.rootId;
        var childId = idObj.childId;
        if (rootId === id) {
            if (config.overrides && childId) {
                if (config.overrides[childId]) {
                    __extendOverrides__(config.overrides[childId], currentOverrides);
                } else {
                    config.overrides[childId] = currentOverrides;
                }
            } else {
                //isTopLevelSrc is to indicate that this is the root source widget (without any nesting)
                var isTopLevelSrc = true;
                __extendOverrides__(config, currentOverrides, isTopLevelSrc);
            }
        }
    }
    return config;
};