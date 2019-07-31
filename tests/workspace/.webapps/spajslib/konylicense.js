

kony.license = {};
var appConfig = undefined;
kony.license.disableMetricReporting = function() {
    kony.ds.save(["true"], "LicenseDisableFlag");
}

kony.licensevar = {};
kony.licensevar.didAppWentInBackground = false;
kony.license.timeoutValue = 14400 ;
kony.license.version = "8.4.0.6";
kony.licensevar.currentSessionId = "";
kony.licensevar.latestSessionCreationTimestamp = "";
kony.licensevar.maxSessionCountLimit = 100;
kony.licensevar.changeHandlers = [];
kony.licensevar.isLicenseUrlAvailable = true;
kony.licensevar.isISTNetworkCallProcessingInProgress = false;
kony.licensevar.deferredNewSessionsCounter = 0;
kony.licensevar.isInteractive = false;
kony.licensevar.isPostAppInitCalled = false;
kony.licensevar.timesAppBecomeInteractive = 0;
kony.licensevar.maxDeferSessionCount = 15;
kony.licensevar.appLaunch = "appLaunch";

kony.licensevar.appStateCallbackFunction = function () {
    kony.licensevar.timesAppBecomeInteractive++;
    kony.license.log("appStateCallbackFunction:: isPostAppInitCalled :" + kony.licensevar.isPostAppInitCalled + " ,isInteractive :" + kony.licensevar.isInteractive);
    if (kony.licensevar.isInteractive === false) {
        kony.licensevar.isInteractive = true;
        kony.license.log("App is in interactive state");
        if (kony.licensevar.isPostAppInitCalled === true) {
            
            kony.license.log("Creating and sending a new interactive session details.");
            kony.license.sendNewIST();
        }
    }
    else {
        kony.license.log("Warning: appStateCallbackFunction is called "+kony.licensevar.timesAppBecomeInteractive+" times, ignoring the interactive app state event");
    }
};

kony.licensevar.callbacksObjList = {};
kony.licensevar.callbacksObjList.isAppLaunchedForInteraction = {};
kony.licensevar.callbacksObjList.isAppLaunchedForInteraction.appStateCallbackFunction = kony.licensevar.appStateCallbackFunction;

kony.license.maxWaitTimeToHandleMultipleNewSessions = 60;


kony.license.setLogging = function(boolValue){
    if(boolValue === true){
        kony.ds.save([true], "LicenseLoggingFlag");
    }else{
        kony.ds.save([false], "LicenseLoggingFlag");
    }
}

kony.license.log = function(msg){
    try{
        var logCondition = kony.ds.read("LicenseLoggingFlag");
    }catch(e){
        
    }
    if (logCondition != undefined && logCondition[0] != undefined && logCondition[0]!=null && logCondition[0]===true) {
        kony.print("[License] :"+msg);
    }
}

kony.license.isLicenseUrlAvailable = function() {
    return kony.licensevar.isLicenseUrlAvailable;
}

kony.license.setIsLicenseUrlAvailable = function(value) {
    kony.licensevar.isLicenseUrlAvailable = value;
}

kony.license.getSessionId = function() {
    return kony.licensevar.currentSessionId;
}

kony.license.registerChangeListener = function(changeHandler) {

    if (!changeHandler) {
        return;
    }
    
    var changes = {};
    var userId = kony.ds.read("konyUserID");
    changes["sessionId"] = kony.licensevar.currentSessionId;
    if (userId != undefined && userId[0] != undefined && userId[0]!=null) {
        changes["userId"] = userId[0];
    }
    changeHandler(changes);

    
    kony.licensevar.changeHandlers.push(changeHandler);
};

kony.license.notifyChangesToListeners = function() {
    for (var i = 0; i < kony.licensevar.changeHandlers.length; i++) {
        var changes = {};
        var userId = kony.ds.read("konyUserID");
        changes["sessionId"] = kony.licensevar.currentSessionId;
        if (userId != undefined && userId[0] != undefined && userId[0]!=null) {
            changes["userId"] = userId[0];
        }
        var changeHandler = kony.licensevar.changeHandlers[i];
        changeHandler(changes);
    }
};



kony.license.processDeferredNewSessions = function () {
    kony.license.log("sending deferred launch date - "+kony.licensevar.currentSessionId);
    kony.licensevar.isISTNetworkCallProcessingInProgress = false;
    kony.licensevar.deferredNewSessionsCounter = 0;
    kony.license.pushKonySessionsToServer(true);
}



kony.license.startLicenseService = function() {
        "use strict";
        var deviceInfo = kony.os.deviceInfo();
        kony.license.log("startLicenseService deviceInfo " + JSON.stringify(deviceInfo));
        

        function getLicenseUrl() {
            var url = "";
            if (appConfig.isturlbase) {
                url = appConfig.isturlbase + "/IST";
            } else if (appConfig.secureurl) {
                url = getFromServerUrl(appConfig.secureurl, "IST");
            } else if (appConfig.url) {
                url = getFromServerUrl(appConfig.url, "IST");
            }
            return url;
        }

       
        

        function getFromServerUrl(url, path) {
            if (!url) {
                return null;
            }
            
            
            kony.license.log("Entering into getfromserverurl when IST-base url is not defined");
            if (deviceInfo.name === "thinclient") {
                url = url.replace(/mwservlet\/*$/i, "");
                return url + path;
            } else {
                var exactSubString = url.match(/mwservlet/i);
                var newUrl = null;
                if (exactSubString) {
                    var exactSubStringLength = "mwservlet".length;
                    var lastSubStringIndex = url.lastIndexOf(exactSubString);
                    var subString = url.slice(0, lastSubStringIndex);
                    var index = (lastSubStringIndex + exactSubStringLength);
                    var subString2 = url.slice(index, url.length);
                    var has = /[a-zA-Z0-9]/.test(subString2);
                    if (!has) {
                        newUrl = subString;
                    } else {
                        newUrl = url;
                    }
                } else {
                    newUrl = url;
                }
                return newUrl + path;
            }
        }

        function getApplicationType(name) {
            if (name === "thinclient") {
                return "spa";
            }
            var appMode = kony.application.getApplicationMode();
            if (appMode === constants.APPLICATION_MODE_NATIVE) {
                return "native";
            } else if (appMode === constants.APPLICATION_MODE_HYBRID) {
                return "hybrid";
            } else if (appMode === constants.APPLICATION_MODE_WRAPPER) {
                return "mixedmode";
            } else {
                return "";
            }
        }

        

        kony.setUserID = function(userId,fromLoginFlag) {
            
			if(fromLoginFlag == undefined || fromLoginFlag == null){
				fromLoginFlag = false;
			}
            var user = new Array;
            user.push(userId);
            var userIDflagGet = kony.ds.read("userIDFromLicenseFlag");
             
            if(userIDflagGet && (userIDflagGet[0] == "true") && fromLoginFlag) {
                return;
            }

            

            
            if(!fromLoginFlag) {
                var userIDflagSet = new Array;
                userIDflagSet.push("true");
                kony.ds.save(userIDflagSet,"userIDFromLicenseFlag");
            }

            
            kony.ds.save(user, "konyUserID");
            kony.license.notifyChangesToListeners();
        }

        kony.license.generateUUID = function() {
                var S4 = function() {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                };
                return (new Date().getTime() + '-' + S4() + '-' + S4() + '-' + S4());
        }
        
        kony.license.isCloud = function() {
                
                

                var isLicenseEnabled = true;
                var LicenseCheck = kony.ds.read("LicenseDisableFlag");
                if (LicenseCheck && (LicenseCheck[0] === "true" || LicenseCheck === "true" ))  {
                    isLicenseEnabled = false;
                }
                if (kony.license.isLicenseUrlAvailable() === false) {
                    isLicenseEnabled = false;
                }
                return isLicenseEnabled;
        }

        
        kony.license.getCurrentDateTime = function() {
                kony.license.log("getCurrentDateTime..");
                var nowDate, month, formatDate;
                nowDate = new Date();
                month = nowDate.getUTCMonth() + 1;
                formatDate = (("00" + nowDate.getUTCFullYear()).slice(-4)) + "-" + (("00" + month).slice(-2)) + "-" + (("00" + nowDate.getUTCDate()).slice(-2)) + " " + (("00" + nowDate.getUTCHours()).slice(-2)) + ":" + (("00" + nowDate.getUTCMinutes()).slice(-2)) + ":" + (("00" + nowDate.getUTCSeconds()).slice(-2));
                return formatDate;
        }

        

        kony.license.appendLicenseTrackingKeys = function(requestType,reportData) {
                kony.license.log("appendLicenseTrackingKeys deviceinfo ---> " + JSON.stringify(deviceInfo));
                var inputParams = {};
                 if (kony.license.isCloud() === true) {
                    inputParams.plat = deviceInfo.name;
                    if (typeof(kony.sdk) !== "undefined"){
                        inputParams.chnl = kony.sdk.getChannelType();
                        inputParams.did = kony.sdk.getDeviceId();
                        inputParams.plat = kony.sdk.getPlatformName();    
                    }
                    else{
                        
                        
                        
                        inputParams.chnl = "fpApp";
                        inputParams.did = "fp-"+kony.license.generateUUID();
                        inputParams.plat = "fp";
                    }
                    
                    inputParams.aid = appConfig.appId;
                    inputParams.aver = appConfig.appVersion;
                    inputParams.aname = appConfig.appName;
                    
                    if (typeof konyRef !== "undefined" && konyRef != null && konyRef.mainRef) {
                        inputParams.mfaid = konyRef.mainRef.appId;
                        inputParams.mfbaseid = konyRef.mainRef.baseId;
                        inputParams.mfaname = konyRef.mainRef.name;
                    }
                    if (kony.application.getCurrentForm()) {
                        var fid = kony.application.getCurrentForm().id;
                        if (fid) {
                            inputParams.fid = fid;
                        }
                    }
                    inputParams.atype = getApplicationType(deviceInfo.name);
                    inputParams.os = deviceInfo.version;
                    inputParams.stype = "b2c";
                    inputParams.dm = deviceInfo.model;
                    inputParams.ua = kony.os.userAgent();
                    inputParams.sessiontype = kony.licensevar.isInteractive === true ? "I" : "NI";
                    var userId = kony.ds.read("konyUserID");
                    if (userId !== undefined && userId !== null && userId.length > 0) {
                        inputParams.kuid = userId[0];
                    } else {
                        inputParams.kuid = "";
                    }
                    if (requestType === "session") {
                        kony.license.checkAndCreateSession();
                        if(kony.licensevar.isISTNetworkCallProcessingInProgress === true || kony.licensevar.deferredNewSessionsCounter > 0){
                            
                            if(kony.licensevar.deferredNewSessionsCounter > 0) {
                                try{
                                    kony.license.log("cancelling the previous timer, as in span of "
                                        +kony.license.maxWaitTimeToHandleMultipleNewSessions+ " seconds, a new IST was fired immediately");
                                    kony.timer.cancel("konySession"+(kony.licensevar.deferredNewSessionsCounter-1));
                                } catch(erObj) {
                                    kony.license.log("error - "+JSON.stringify(erObj)+",  while cancelling the deferred session timer" +
                                        " to send launch dates with timer id"+(kony.licensevar.deferredNewSessionsCounter-1));
                                }
                            }
                            kony.timer.schedule(("konySession"+(kony.licensevar.deferredNewSessionsCounter++)),
                                kony.license.processDeferredNewSessions, kony.license.maxWaitTimeToHandleMultipleNewSessions, false);
                                kony.license.log("another session is in progress , we will try again");
                            return {}; 
                        }
                        
                        var offlineData = kony.license.getStoredSession();
                        inputParams.launchDates = offlineData;
                        kony.licensevar.isISTNetworkCallProcessingInProgress = true;
                        inputParams.svcid = "RegisterKonySession";
                        kony.license.log("---------->LaunchDates : " + inputParams.launchDates);
                    } else {
                        var uuid = kony.ds.read("konyUUID");
                        if (uuid !== undefined && uuid !== null && uuid.length > 0) {
                            inputParams.rsid = uuid[0];
                        } else {
                            inputParams.rsid = kony.license.generateUUID().toString();
                        }
                    }
                }
                kony.license.log("input params in appendLicenseTrackingKeys are " + JSON.stringify(inputParams));
                return inputParams;
            
        }

        
        kony.license.checkAndCreateSession = function() {
                kony.license.log("check and create session..");
                var uuid = kony.ds.read("konyUUID");
                if (uuid !== undefined && uuid !== null && uuid.length > 0) {
                   kony.licensevar.currentSessionId = uuid[0];
                } else {
                   kony.license.createSession();
                } 
        }

        
        var sdkTimerCounter = 0 ;
        kony.license.createSession = function() {
            
            if(sdkTimerCounter != 0) {
                try{
                    kony.timer.cancel("konyLicenseTimeout"+(sdkTimerCounter-1));
                } catch(erObj) {
                    kony.license.log("the error object while cancelling the timer is"+ erObj);
                }
            }
            var uuid = new Array();
            kony.licensevar.currentSessionId = kony.license.generateUUID().toString();
            kony.licensevar.latestSessionCreationTimestamp = kony.license.getCurrentDateTime();
            uuid.push(kony.licensevar.currentSessionId);
            kony.ds.save(uuid, "konyUUID");
            kony.license.storeSession();
            kony.license.notifyChangesToListeners();
            kony.timer.schedule(("konyLicenseTimeout"+(sdkTimerCounter++)),kony.license.sendNewIST,kony.license.timeoutValue,false);
        }

        kony.license.storeSession = function(){
            var uuid = kony.licensevar.currentSessionId;
            var offlineData = kony.license.getStoredSession();
            if (offlineData === undefined || offlineData === null) {
                offlineData = new Array();
            }
            var currentSession = new Array();
            currentSession.push(uuid);
            currentSession.push(kony.licensevar.latestSessionCreationTimestamp);
            var sessionType = kony.licensevar.isInteractive === true ? "I" : "NI";
            currentSession.push(sessionType);

            if(offlineData.length === 0 || offlineData[(offlineData.length-1)][0] !== currentSession[0]){
                if(offlineData.length > 0 && kony.licensevar.deferredNewSessionsCounter > 0){
                    
                    offlineData.pop();
                }
                offlineData.push(currentSession);
            }else{
                kony.license.log("Ignoring duplicate session: "+JSON.stringify(currentSession));
                offlineData[offlineData.length - 1][2] = kony.licensevar.isInteractive.toString();
            }
            if(offlineData.length > kony.licensevar.maxSessionCountLimit){
                kony.license.log("Trimming to latest " + kony.licensevar.maxSessionCountLimit + " records, total records found - " + offlineData.length);
                var sliceValue = offlineData.length - kony.licensevar.maxSessionCountLimit;
                offlineData = offlineData.slice(sliceValue);
            }
            kony.ds.save(offlineData, "konyOfflineAccessData");
            kony.license.log("offlineData saved");
        };

        kony.license.getStoredSession = function(){
            return kony.ds.read("konyOfflineAccessData");
        };
            
        kony.license.sendNewIST = function() {
            kony.license.createSession();
            kony.license.pushKonySessionsToServer(true);           
        }

        
        kony.license.handleISTInvocation = function(sessionURL, input, options) {
            if((!kony.licensevar.isInteractive && (kony.license.getStoredSession().length >= kony.licensevar.maxDeferSessionCount)) || kony.licensevar.isInteractive) {
                kony.license.invokeIST(sessionURL, input, kony.license.licenseUsageServiceSuccessCallback, kony.license.licenseUsageServiceFailureCallback, options);
            } else {
                kony.licensevar.isISTNetworkCallProcessingInProgress = false;
            }
        }
        
        
        kony.license.licenseUsageServiceSuccessCallback = function (result){
                kony.licensevar.isISTNetworkCallProcessingInProgress = false;
                kony.license.log("launch dates sent successfully. result - "+JSON.stringify(result));
                
                kony.ds.remove("konyOfflineAccessData");
                kony.ds.remove("konyOfflineSessionsCount");
        }

        
        kony.license.licenseUsageServiceFailureCallback = function(result)
        {       
                kony.licensevar.isISTNetworkCallProcessingInProgress = false;
                kony.license.log("launch dates weren't sent successfully. result - "+JSON.stringify(result));
                
                var count, offlineCount;
                
                offlineCount = kony.ds.read("konyOfflineSessionsCount");
                if (offlineCount === undefined || offlineCount === null || offlineCount.length < 1) {
                    offlineCount = new Array();
                    offlineCount.push(1);
                } else if (!(offlineCount[0] >= 500)) {
                    
                    count = offlineCount[0] + 1;
                    offlineCount[0] = count;
                }
                kony.ds.save(offlineCount, "konyOfflineSessionsCount");
            }

        kony.license.captureKonyLicenseUsage = function(newLaunch) {
            
            kony.license.pushKonySessionsToServer(newLaunch);
        }

        
        kony.license.pushKonySessionsToServer = function(newLaunch) {
                kony.license.log("capturing license information..");
                
                var nowDate, lastDate, diff, sessionURL;
                var timeCheck = 1800000;
                var isNewSession = true;
                if (newLaunch === undefined || newLaunch === null) {
                    newLaunch = false;
                } else if (newLaunch !== true) {
                    newLaunch = false;
                }
                if (kony.license.isCloud() === false) {
                    kony.license.log("session tracking is turned off");
                    isNewSession = false;
                }
                if (kony.ds.read("konyLastAccessTime") !== undefined && kony.ds.read("konyLastAccessTime") !== null) {
                    nowDate = new Date();
                    lastDate = new Date(kony.ds.read("konyLastAccessTime")[0]);
                    diff = nowDate.getTime() - lastDate.getTime();
                    if (diff < timeCheck && newLaunch === false) {
                        isNewSession = false;
                    } else {
                        kony.ds.remove("konyLastAccessTime");
                    }
                }

                if (isNewSession === true) {
                    var input = {};
                    var options = {};
                    if (deviceInfo.name !== "thinclient") {
                        options["httpRequestOptions"] = [];
                        options["httpRequestOptions"]["timeoutIntervalForRequest"]=60;  
                    }
                    sessionURL = getLicenseUrl();
                    input.konyreportingparams = JSON.stringify(kony.license.appendLicenseTrackingKeys("session"),null);
                    options["disableIntegrity"] = true;
                    if(input.konyreportingparams !== "{}"){
                    	kony.license.handleISTInvocation(sessionURL, input, options);
                    }
                }
        }

        
        kony.license.backgroundTimeCapture = function() {
                kony.license.log("app is going to background..");
                if (kony.license.isCloud() === true) {
                    var accessDetails = new Array();
                    accessDetails.push(new Date().toString());
                    kony.ds.save(accessDetails, "konyLastAccessTime");
                }
        }

        
        kony.license.clearLastAccess = function() {
                kony.license.log("clear last access..");
                if (kony.license.isCloud() === true) {
                    kony.ds.remove("konyLastAccessTime");
                }
        }

        
        kony.license.setAppCallbacksOverride = function() {
                kony.license.log("overriding kony.application.setApplicationCallbacks..");
                var oldImplementation = kony.application.setApplicationCallbacks;

                function newImplementation(eventsDefinition) {
                    if (kony.license.isCloud() === true) {
                        if (eventsDefinition !== undefined && eventsDefinition !== null) {
                            if (eventsDefinition.onforeground !== undefined && eventsDefinition.onforeground !== null) {
                                var userForeFunction = eventsDefinition.onforeground;
                                var newForeFunction = function() {
                                    if(kony.licensevar.didAppWentInBackground === true){
                                        kony.license.pushKonySessionsToServer(false);
                                    }
                                    if (deviceInfo.name !== "thinclient " && typeof(kony.sync) !== "undefined") {
                                        kony.sync.isAppInBackground = false;
                                    }
                                    kony.licensevar.didAppWentInBackground = false;
                                    userForeFunction();
                                };
                                eventsDefinition.onforeground = newForeFunction;
                            }
                            if (eventsDefinition.onbackground !== undefined && eventsDefinition.onbackground !== null) {
                                var userBackFunction = eventsDefinition.onbackground;
                                var newBackFunction = function() {
                                    kony.licensevar.didAppWentInBackground = true;
                                    kony.license.backgroundTimeCapture();
                                    if (typeof(kony.sdk) !== "undefined" && typeof(kony.sdk.metric) !== "undefined") {
                                        kony.sdk.metric.saveInDS();
                                    }
                                    if (deviceInfo.name !== "thinclient " && typeof(kony.sync) !== "undefined") {
                                        kony.sync.isAppInBackground = true;
                                    }
                                    userBackFunction();
                                };
                                eventsDefinition.onbackground = newBackFunction;
                            }
                            if (eventsDefinition.onappterminate !== undefined && eventsDefinition.onappterminate !== null) {
                                var userTerminateFunction = eventsDefinition.onappterminate;
                                var newTerminateFunction = function() {
                                    kony.license.clearLastAccess();
                                    if (typeof(kony.sdk) !== "undefined" && typeof(kony.sdk.metric) !== "undefined") {
                                        kony.sdk.metric.saveInDS();
                                    }
                                    userTerminateFunction();
                                };
                                eventsDefinition.onappterminate = newTerminateFunction;
                            }
                        }
                    }
                    return oldImplementation(eventsDefinition);
                }
                kony.application.setApplicationCallbacks = newImplementation;
                if (deviceInfo.name !== "thinclient ") {
                    var callbackEvents = {
                        onforeground: function() {},
                        onbackground: function() {},
                        onappterminate: function() {}
                    };

                    kony.application.setApplicationCallbacks(callbackEvents);
                }
        }

        
        kony.license.invokeServiceAsyncOverride = function() {
                kony.license.log("overriding kony.net.invokeServiceAsync..");
                var oldImplementation = kony.net.invokeServiceAsync;

                function newImplementation(url, input, callback, config, requestType, reportData) {
                    if (kony.license.isCloud() === true) {
                        if (input === undefined || input === null) {
                            input = {};
                        }
                        if (input !== undefined && input !== null && !isGetRequest(input)) {
                            if (requestType !== undefined && requestType !== null) {
                                input.konyreportingparams = processKonyReportingParams(input.konyreportingparams, requestType, reportData);
                            } else {
                                input.konyreportingparams = processKonyReportingParams(input.konyreportingparams, null, null);
                            }
                        }
                    }
                    return oldImplementation(url, input, callback, config);

                    function processKonyReportingParams(params, requestType, reportData) {
                        var params2 = kony.license.appendLicenseTrackingKeys(requestType, reportData);
                        if (!params) {
                            return JSON.stringify(params2);
                        } else {
                            try {
                                if (typeof(params) === "string") {
                                    params = JSON.parse(params);
                                }
                                for (var key in params2) {
                                    if (typeof(params[key]) === "undefined") {
                                        params[key] = params2[key];
                                    }
                                }
                                return JSON.stringify(params);
                            } catch (e) {
                                kony.license.log("unable to parse params " + params);
                                return JSON.stringify(params2);
                            }


                        }
                    }

                    function isGetRequest(inputParams) {
                        if (inputParams && inputParams.httpconfig && inputParams.httpconfig.method && inputParams.httpconfig.method === "get") {
                            return true;
                        }
                        return false;
                    }
                }
                kony.net.invokeServiceAsync = newImplementation;
        }

        
        kony.license.invokeServiceSyncOverride = function() {
                kony.license.log("overriding kony.net.invokeServiceSync..");
                var oldImplementation = kony.net.invokeServiceSync;

                function newImplementation(url, input, isblocking) {
                    if (kony.license.isCloud() === true) {
                        if (input === undefined || input === null) {
                            input = {};
                        }
                        if (input !== undefined && input !== null) {
                            input.konyreportingparams = JSON.stringify(kony.license.appendLicenseTrackingKeys(null));
                        }
                    }
                    return oldImplementation(url, input, isblocking);
                }
                kony.net.invokeServiceSync = newImplementation;
        }

        
        kony.license.setAppInitializationEventsOverride = function() {
                var oldImplementation = kony.application.setApplicationInitializationEvents;
                function newImplementation(eventsDefinition) {
                    kony.license.log("setApplicationInitializationEvents events " + eventsDefinition);
                    kony.licensevar.isPostAppInitCalled = true;
                    if (kony.license.isCloud() === true) {
                        if (eventsDefinition !== undefined && eventsDefinition !== null) {
                            if (eventsDefinition.postappinit !== undefined && eventsDefinition.postappinit !== null) {
                                var userFunction = eventsDefinition.postappinit;
                                var newFunction = function() {
                                    kony.license.pushKonySessionsToServer(true);
									
									
									kony.ds.save([true], kony.licensevar.appLaunch);
									
                                    var userForm = userFunction.apply(this,arguments);
                                    if (userForm !== undefined || userForm !== null) {
                                        return userForm;
                                    }
                                };
                                eventsDefinition.postappinit = newFunction;
                            } else {
                                var newFunction = function() {
                                    kony.license.pushKonySessionsToServer(true);
									kony.ds.save([true], kony.licensevar.appLaunch);
                                };
                                eventsDefinition.postappinit = newFunction;
                            }
                        }
                    }
                    return oldImplementation(eventsDefinition);
                }
                kony.application.setApplicationInitializationEvents = newImplementation;
        }
        
       kony.license.apiOverride =function() {
                kony.license.log("Entering apiOverride..");
                
                if (deviceInfo.name !== "thinclient") {
                    kony.license.setAppCallbacksOverride();
                } else {
                    
                    kony.licensevar.isInteractive = true;
                }
                kony.license.invokeServiceAsyncOverride();
                kony.license.invokeServiceSyncOverride();
                kony.license.setAppInitializationEventsOverride();
        }

        kony.license.apiOverride();
        kony.application.addApplicationCallbacks(kony.licensevar.callbacksObjList);
        if (deviceInfo.name !== "thinclient") {
            Object.seal(kony.license);
            Object.freeze(kony.license);
        }
        kony.license.log("license loading completed");
}


kony.license.invokeIST = function(url, params, successCallback, failureCallback, options) {
    if(typeof(url)==="undefined" || url === undefined || url === null || url === ""){
        failureCallback("license url can't be null or empty");
        return;
    }

    var headers = {"Content-Type":"application/x-www-form-urlencoded"};
    
    if(kony.hasOwnProperty("sdk") && kony.sdk.getCurrentInstance && kony.sdk.getCurrentInstance()){
        url = kony.sdk.getCurrentInstance().appendGlobalParams(url, headers, params);
    }

    var httpRequest = new kony.net.HttpRequest();
    if(options && options["httpRequestOptions"] && options["httpRequestOptions"] instanceof Object && options["httpRequestOptions"]["timeoutIntervalForRequest"]){
        httpRequest.timeout = options["httpRequestOptions"]["timeoutIntervalForRequest"] * 1000;
    }
    httpRequest.open("POST", url);

    function localRequestCallback(result) {
        var readyState = Number(httpRequest.readyState.toString());
        var status = Number(httpRequest.status.toString());
        kony.license.log("localRequestCallback in state :"+readyState+" with status :"+status);
        var response = null;
        if (readyState === 4) {
            var isFailure = true;
            if ((status >= 200 && status < 300)|| status === 504) {
                if (status!== 504){
                    try{
                        response = JSON.parse(JSON.stringify(httpRequest.response)); 
                        if(typeof(response) === "string"){
                            response = JSON.parse(response);	
                        }
                        response.url = url;
                        if(response && (typeof(response.opstatus) === "undefined" || response.opstatus == 0)){
                            isFailure = false;
                        }
                    } catch (e){
                        kony.license.log("error while extracting response :"+e);
                    } 
                } else{
                    isFailure = false;
                }
            }
            if( isFailure === true){
                var errorResponse = {
                    "error": "failure in sending IST call with status as :" + status,
                    "url" : url
                };
                failureCallback(errorResponse);
            } else{
                successCallback(response);
            }
        }
    }

    
    paramsTable = new kony.net.FormData();
    for (var key in params) {
        if (typeof(params[key]) != "undefined") {
            if (typeof(params[key]) !== "string") {
                params[key] = JSON.stringify(params[key]);
            }
            paramsTable.append((key), (params[key]));
        }
    }
    kony.license.log("paramsTable formed is "+paramsTable.toString());
    
    for (var headerKey in headers ) {
        if(headers.hasOwnProperty(headerKey)){
            httpRequest.setRequestHeader(headerKey , headers[headerKey]);
        }
    }   
    
    httpRequest.onReadyStateChange = localRequestCallback;
    
    httpRequest.send(paramsTable);
    
}


function cloudSessionCallback() {
    kony.license.log("Cloud session timed out.");
    kony.ds.remove("konyLastAccessTime");
    kony.ds.remove("konyUUID");
    kony.ds.remove("konyCustomReportData");
    kony.ds.remove("konyOfflineAccessData");
    kony.license.pushKonySessionsToServer();
    kony.cloud.appevents.unregisterforidletimeout();
    kony.cloud.appevents.registerforidletimeout(30, cloudSessionCallback);
}

kony.license.startLicenseService();