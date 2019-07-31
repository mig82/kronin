 /*
  * kony-sdk-ide Version 8.4.0
  */
 /**
  * Kony namespace
  * @namespace kony
  */
 if (typeof(kony) === "undefined") {
     kony = {};
 }
 /**
  * Constructor for creating the kony client instance.
  * @class
  * @classdesc kony Class
  * @memberof kony
  */
 kony.sdk = function() {
     var currentObj = this;
     this.mainRef = {};
     var clientParams = {};
     this.tokens = {};
     this.currentClaimToken = null;
     this.globalRequestParams = {
         "headers": {},
         "queryparams": {},
         "bodyparams": {}
     };
     var userId = "";
     this.integrityCustomSecurityKey = null;
     this.reportingheaders_allowed = false;
     if (kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_IDE && typeof(kony.setUserID) === 'function') {
         var userIDflagGet = kony.ds.read("userIDFromLicenseFlag");
         if (kony.sdk.isNullOrUndefined(userIDflagGet)) {
             var userIDflagSet = [];
             userIDflagSet.push("false");
             kony.ds.save(userIDflagSet, "userIDFromLicenseFlag");
         }
     }
     if (kony.internal && kony.internal.sdk && kony.internal.sdk.Services) {
         this.internalSdkObject = new kony.internal.sdk.Services();
     }
     this.getUserId = function() {
         return userId;
     };
     this.setCurrentUserId = function(newUserID) {
         userId = newUserID;
     };
     this.getSessionId = function() {
         if (!konyRef.sessionId) {
             var sessionId = kony.ds.read(kony.sdk.constants.KONYUUID);
             if (sessionId) {
                 konyRef.sessionId = sessionId[0];
             } else {
                 kony.sdk.logsdk.error("Session id is not available");
                 konyRef.sessionId = "";
             }
         }
         return konyRef.sessionId;
     };
     this.setSessionId = function(newSessionId) {
         konyRef.sessionId = newSessionId;
     };
     this.setClientParams = function(clientParamsMap) {
         clientParams = clientParamsMap;
     };
     this.getClientParams = function() {
         return clientParams;
     };
     this.globalRequestParamType = {
         headers: "headers",
         queryParams: "queryparams",
         bodyParams: "bodyparams"
     };
     this.getGlobalRequestParams = function(paramType) {
         kony.sdk.logsdk.trace("Entering getGlobalRequestParams");
         if (kony.sdk.isNullOrUndefined(paramType)) {
             return currentObj.globalRequestParams;
         } else if (paramType === currentObj.globalRequestParamType.headers) {
             return currentObj.globalRequestParams.headers;
         } else if (paramType === currentObj.globalRequestParamType.queryParams) {
             return currentObj.globalRequestParams.queryparams;
         } else if (paramType === currentObj.globalRequestParamType.bodyParams) {
             return currentObj.globalRequestParams.bodyparams;
         }
     };
     this.setGlobalRequestParam = function(paramName, paramValue, paramType) {
         kony.sdk.logsdk.trace("Entering setGlobalRequestParam");
         if (typeof(paramName) === 'string' && typeof(paramValue) === 'string' && typeof(paramType) === 'string') {
             if (paramType === currentObj.globalRequestParamType.headers) {
                 currentObj.globalRequestParams.headers[paramName] = paramValue;
             } else if (paramType === currentObj.globalRequestParamType.queryParams) {
                 currentObj.globalRequestParams.queryparams[paramName] = paramValue;
             } else if (paramType === currentObj.globalRequestParamType.bodyParams) {
                 currentObj.globalRequestParams.bodyparams[paramName] = paramValue;
             }
         }
     };
     this.removeGlobalRequestParam = function(paramName, paramType) {
         kony.sdk.logsdk.trace("Entering removeGlobalRequestParam");
         if (typeof(paramName) === 'string' && typeof(paramType) === 'string') {
             if (paramType.toLowerCase() === currentObj.globalRequestParamType.headers && !kony.sdk.isNullOrUndefined(currentObj.globalRequestParams.headers[paramName])) {
                 delete currentObj.globalRequestParams.headers[paramName];
             } else if (paramType.toLowerCase() === currentObj.globalRequestParamType.queryParams && !kony.sdk.isNullOrUndefined(currentObj.globalRequestParams.queryparams[paramName])) {
                 delete currentObj.globalRequestParams.queryparams[paramName];
             } else if (paramType.toLowerCase() === currentObj.globalRequestParamType.bodyParams && !kony.sdk.isNullOrUndefined(currentObj.globalRequestParams.bodyparams[paramName])) {
                 delete currentObj.globalRequestParams.bodyparams[paramName];
             }
         }
     };
     this.resetGlobalRequestParams = function() {
         kony.sdk.logsdk.trace("Entering resetGlobalRequestParams");
         currentObj.globalRequestParams = {
             "headers": {},
             "queryparams": {},
             "bodyparams": {}
         };
     };
     this.appendGlobalHeaders = function(headers) {
         kony.sdk.logsdk.trace("Entering appendGlobalHeaders");
         var globalHeaders = currentObj.getGlobalRequestParams(currentObj.globalRequestParamType.headers);
         if (!kony.sdk.isNullOrUndefined(globalHeaders)) {
             if (kony.sdk.isNullOrUndefined(headers)) {
                 headers = {};
             }
             for (var obj in globalHeaders) {
                 if (kony.sdk.isNullOrUndefined(headers[obj])) {
                     headers[obj] = globalHeaders[obj];
                 }
             }
         }
     };
     this.appendGlobalBodyParams = function(params) {
         kony.sdk.logsdk.trace("Entering appendGlobalBodyParams");
         var globalBodyParams = currentObj.getGlobalRequestParams(currentObj.globalRequestParamType.bodyParams);
         if (!kony.sdk.isNullOrUndefined(globalBodyParams)) {
             if (kony.sdk.isNullOrUndefined(params)) {
                 params = {};
             }
             for (var obj in globalBodyParams) {
                 if (kony.sdk.isNullOrUndefined(params[obj])) {
                     params[obj] = globalBodyParams[obj];
                 }
             }
         }
     };
     this.appendGlobalQueryParams = function(url) {
         kony.sdk.logsdk.trace("Entering appendGlobalQueryParams");
         var globalQueryParams = currentObj.getGlobalRequestParams(currentObj.globalRequestParamType.queryParams);
         if (!kony.sdk.isNullOrUndefined(globalQueryParams) && Object.keys(globalQueryParams).length !== 0) {
             if (url.indexOf("?") < 0) {
                 url = url + "?" + kony.sdk.util.objectToQueryParams(globalQueryParams);
             } else {
                 url = url + "&" + kony.sdk.util.objectToQueryParams(globalQueryParams);
             }
         }
         return url;
     };
     this.appendGlobalParams = function(url, headers, params) {
         kony.sdk.logsdk.trace("Entering appendGlobalParams");
         currentObj.appendGlobalHeaders(headers);
         currentObj.appendGlobalBodyParams(params);
         return currentObj.appendGlobalQueryParams(url);
     };
     this.setAppSecurityKey = function(customSalt) {
         if (!kony.sdk.isNullOrUndefined(customSalt) && typeof customSalt === 'string') {
             this.integrityCustomSecurityKey = customSalt;
             return true;
         } else {
             var errorObj = {};
             errorObj[kony.sdk.constants.ERR_CODE] = kony.sdk.errorcodes.invalid_security_key;
             errorObj[kony.sdk.constants.ERR_MSG] = kony.sdk.errormessages.invalid_security_key;
             kony.sdk.logsdk.error(kony.sdk.errormessages.invalid_security_key);
             return errorObj;
         }
     };
 };
 kony.mbaas = kony.sdk;
 kony.sdk.isDebugEnabled = true;
 kony.sdk.isInitialized = false;
 kony.sdk.currentInstance = null;
 kony.sdk.isLicenseUrlAvailable = true;
 kony.sdk.constants = kony.sdk.constants || {};
 kony.sdk.version = "8.4.0";
 kony.sdk.logsdk = new konySdkLogger();
 kony.sdk.syncService = null;
 kony.sdk.dataStore = kony.sdk.dataStore || new konyDataStore();
 kony.sdk.skipAnonymousCall = false;
 kony.sdk.getDefaultInstance = function() {
     return kony.sdk.currentInstance;
 };
 // This is to be deprecated with getDefaultInstance
 kony.sdk.getCurrentInstance = function() {
     return kony.sdk.currentInstance;
 };
 // This is to be set by client to skip anonymous login calls.
 kony.sdk.skipAnonymousLoginCall = function(state) {
     // If enabled then client can only access public integration services.
     // If disabled then client can access protected integration services.
     // To access private client needs to get authenticated by an identity service.
     kony.sdk.skipAnonymousCall = state;
 };
 kony.sdk.claimsRefresh = function(callback, failureCallback) {
     kony.sdk.logsdk.trace("Entering kony.sdk.claimsRefresh");
     var konyRef = kony.sdk.getCurrentInstance();
     var networkProvider = new konyNetworkProvider();
     var loginWithAnonymousProvider = function(successCallback, failureCallback) {
         var identityObject = konyRef.getIdentityService("$anonymousProvider");
         identityObject.login(null, function(res) {
             successCallback();
         }, function(res) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getAuthErrObj(res));
         });
     };
     if (konyRef.currentClaimToken === null) {
         kony.sdk.logsdk.warn("claims Token is Unavialable");
         if (konyRef.isAnonymousProvider) {
             loginWithAnonymousProvider(callback, failureCallback);
         } else {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getNullClaimsTokenErrObj());
         }
     } else if (konyRef.claimTokenExpiry && new Date().getTime() > konyRef.claimTokenExpiry) {
         if (konyRef.isAnonymousProvider) {
             loginWithAnonymousProvider(callback, failureCallback);
         } else {
             kony.sdk.fetchClaimsTokenFromServer(false, callback, failureCallback);
         }
     } else {
         callback();
     }
 };
 kony.sdk.claimsAndProviderTokenRefresh = function(callback, failureCallback) {
     kony.sdk.logsdk.trace("Entering kony.sdk.claimsAndProviderTokenRefresh");
     kony.sdk.fetchClaimsTokenFromServer(true, callback, failureCallback);
 };
 /**
  * Checks for the etag in the response data. Gets the service doc & caches it if etag is updated.
  * @param data{JSON} response data from claimsRefresh or login.
  * @param callback{function} callback to be invoked.
  */
 function getLatestServiceDocIfAvailable(data, callback) {
     //Disabling this for phonegap and plain-js as there is not concept of auto-init there
     if (kony.sdk.getSdkType() !== kony.sdk.constants.SDK_TYPE_IDE) {
         kony.sdk.verifyAndCallClosure(callback);
         return;
     }
     var currentETag = kony.sdk.dataStore.getItem("etagID");
     var serverETag = data.service_doc_etag;
     if (!kony.sdk.isNullOrUndefined(serverETag) && (kony.sdk.isNullOrUndefined(currentETag) || currentETag != serverETag)) {
         kony.sdk.logsdk.info("Service doc update found.");
         var networkProvider = new konyNetworkProvider();
         var _serviceUrl = stripTrailingCharacter(konyRef.rec.url, "/") + "/appconfig";
         var headers = {};
         headers[kony.sdk.constants.APP_KEY_HEADER] = konyRef.mainRef.appKey;
         headers[kony.sdk.constants.APP_SECRET_HEADER] = konyRef.mainRef.appSecret;
         headers["X-HTTP-Method-Override"] = "GET";
         populateHeaderWithFabricAppVersion(headers);
         networkProvider.post(_serviceUrl, null, headers, function(successResponse) {
             kony.sdk.dataStore.setItem("etagID", serverETag);
             kony.sdk.logsdk.debug("Update done. Current version = " + currentETag + " Updated to " + serverETag);
             kony.sdk.dataStore.setItem(appConfig.appId + "_mobileFabricServiceDoc", JSON.stringify(successResponse));
             kony.sdk.verifyAndCallClosure(callback);
         }, function(failureResponse) {
             kony.sdk.logsdk.error("Refresh of serviceDoc failed:" + JSON.stringify(failureResponse));
             kony.sdk.verifyAndCallClosure(callback);
         });
     } else {
         kony.sdk.verifyAndCallClosure(callback);
     }
 }
 kony.sdk.fetchClaimsTokenFromServer = function(isBackendTokenRefreshRequired, callback, failureCallback) {
     kony.sdk.logsdk.trace("Entering kony.sdk.fetchClaimsTokenFromServer");
     var konyRef = kony.sdk.getCurrentInstance();
     var networkProvider = new konyNetworkProvider();
     kony.sdk.logsdk.debug("claims token has expired. fetching new token and isBackendTokenRefreshRequired :", isBackendTokenRefreshRequired);
     var _serviceUrl = stripTrailingCharacter(konyRef.rec.url, "/");
     var _url = _serviceUrl + "/claims";
     if (isBackendTokenRefreshRequired) {
         _url = _url + "?refresh=true";
     }
     kony.sdk.logsdk.debug("service url is " + _url);
     if (konyRef.currentRefreshToken === null) {
         kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getNullRefreshTokenErrObj());
     } else {
         var headers = {};
         headers[kony.sdk.constants.AUTHORIZATION_HEADER] = konyRef.currentRefreshToken;
         headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
         networkProvider.post(_url, {}, headers, function(tokens) {
             kony.sdk.logsdk.trace("refresh success..acquiring new tokens");
             var response = kony.sdk.processClaimsSuccessResponse(tokens, konyRef, false);

             function serviceDocCallback() {
                 kony.sdk.verifyAndCallClosure(callback, response);
             }
             getLatestServiceDocIfAvailable(tokens, serviceDocCallback);
         }, function(data) {
             kony.sdk.logsdk.error("failed to acquire refresh token", data);
             kony.sdk.processClaimsErrorResponse(data, konyRef, true, failureCallback);
         });
     }
 };
 kony.sdk.processClaimsSuccessResponse = function(data, konyRef, isAsync, callBack) {
     kony.sdk.logsdk.trace("Entering kony.sdk.processClaimsSuccessResponse");
     data = kony.sdk.formatSuccessResponse(data);
     konyRef.currentClaimToken = data.claims_token.value;
     konyRef.claimTokenExpiry = data.claims_token.exp;
     konyRef.currentRefreshToken = data.refresh_token;
     kony.logger.setClaimsToken();
     //if offline login enabled then updating the claimstoken in the store
     if (kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_IDE && kony.sdk.getAType() === kony.sdk.constants.SDK_ATYPE_NATIVE && kony.sdk.getPlatformName() !== kony.sdk.constants.PLATFORM_WINDOWS) {
         if (kony.sdk.offline.isOfflineEnabled && kony.sdk.offline.isOfflineEnabled == true) {
             kony.sdk.offline.updateAuthToken(data);
         }
         if (kony.sdk.offline.persistToken || kony.sdk.util.isPersistentLoginResponseEnabled()) {
             kony.sdk.offline.updatePersistedToken(data);
         }
     }
     if (!isAsync) {
         return {
             "message": "success"
         };
     } else if (callBack) {
         callBack();
     }
 };
 kony.sdk.processClaimsErrorResponse = function(data, konyRef, isAsync, callBack) {
     kony.sdk.logsdk.trace("Entering kony.sdk.processClaimsErrorResponse");
     /*reset the claims token*/
     konyRef.currentClaimToken = null;
     konyRef.claimTokenExpiry = null;
     konyRef.currentRefreshToken = null;
     //setting the anonymous provider as true to access the public protected urls without any issue
     konyRef.isAnonymousProvider = true;
     if (!isAsync) {
         return kony.sdk.error.getAuthErrObj(data);
     } else if (callBack) {
         kony.sdk.verifyAndCallClosure(callBack, kony.sdk.error.getAuthErrObj(data));
     }
 };
 /**
  * Init success callback method.
  * @callback initSuccessCallback
  * @param {json} mainRef - Application Configuration
  */
 /**
  * Init failure callback method.
  * @callback initFailureCallback
  */
 /**
  * Initialization method for the kony SDK.
  * This method will fetch the app configuration from the kony server and stores in memory.
  * This method has to be invoked before invoking any other SDK methods.
  * @param {string} appKey - Appkey of the kony application
  * @param {string} appSecret - App Secret of the kony application
  * @param {string} serviceUrl - URL of the kony Server
  * @param {initSuccessCallback} successCallback  - Callback method on success
  * @param {initFailureCallback} failureCallback - Callback method on failure
  */
 kony.sdk.prototype.init = function(appKey, appSecret, serviceUrl, successCallback, failureCallback, initOptions) {
     // removing app metadata with key for the latest app metadata
     kony.sdk.logsdk.trace("Entering kony.sdk.prototype.init");
     kony.sdk.deleteMetadatafromDs();
     if (!(appKey && appSecret && serviceUrl)) {
         kony.sdk.logsdk.error("### init:: Invalid credentials passed");
         kony.sdk.verifyAndCallClosure(failureCallback, "Invalid initialization parameters passed. Please check appKey, appSecret and ServiceUrl parameters");
         return;
     }
     var networkProvider = new konyNetworkProvider();
     serviceUrl = serviceUrl.trim();
     this.mainRef.serviceUrl = serviceUrl;
     this.mainRef.appSecret = appSecret;
     konyRef = this;
     KNYMobileFabric = this;
     var options = {};
     options["ignoreintegrity"] = true;
     setIntegrityParams.call(konyRef);
     kony.sdk.logsdk.trace("### init:: calling GET on appConfig to retrieve servicedoc");
     var headers = {};
     headers[kony.sdk.constants.APP_KEY_HEADER] = appKey;
     headers[kony.sdk.constants.APP_SECRET_HEADER] = appSecret;
     headers["X-HTTP-Method-Override"] = "GET";
     //Resetting the value.
     kony.sdk.setFabricAppVersion(null);
     if (!kony.sdk.isNullOrUndefined(initOptions) && initOptions["MFAppVersion"]) {
         kony.sdk.setFabricAppVersion(initOptions["MFAppVersion"]);
     }
     populateHeaderWithFabricAppVersion(headers);
     networkProvider.post(serviceUrl, null, headers, function(data) {
         data = kony.sdk.formatSuccessResponse(data);
         kony.sdk.logsdk.info("### init::_doInit fetched servicedoc successfuly");
         kony.sdk.logsdk.debug("### init:: retrieved data from service doc", data);
         konyRef.mainRef.config = data;
         konyRef.servicedoc = data;
         konyRef.mainRef.appId = data.appId;
         var processServiceDocResult = konyRef.initWithServiceDoc(appKey, appSecret, data);
         if (processServiceDocResult === true) {
             kony.sdk.logsdk.info("### init::_doInit processing service document successful");
             kony.sdk.logsdk.debug("### init::_doInit saving done. Calling success callback", data);
             kony.sdk.initiateSession(konyRef);
             if (typeof(KNYMetricsService) !== "undefined" && kony.sdk.currentInstance.getMetricsService) {
                 KNYMetricsService = kony.sdk.currentInstance.getMetricsService();
                 if (KNYMetricsService && typeof(appConfig) !== "undefined" && kony.sdk.util.isJsonObject(appConfig) && appConfig.hasOwnProperty("eventTypes") && kony.sdk.isArray(appConfig.eventTypes) && appConfig.eventTypes.length !== 0) {
                     KNYMetricsService.setEventTracking(appConfig.eventTypes);
                 }
             }
             if (kony.sdk.skipAnonymousCall) {
                 kony.sdk.logsdk.info("### init::skipping anonymous login call");
                 // Enabling this flag to connect to any protected integration service.
                 konyRef.isAnonymousProvider = true;
                 kony.sdk.verifyAndCallClosure(successCallback, konyRef.mainRef);
             } else {
                 var identityObject = kony.sdk.getCurrentInstance().getIdentityService("$anonymousProvider");
                 identityObject.login(null, function(res) {
                     kony.sdk.verifyAndCallClosure(successCallback, konyRef.mainRef);
                 }, function(res) {
                     kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getAuthErrObj(res));
                 });
             }
         } else {
             kony.sdk.logsdk.error("### init::_doInit processing servicedoc failed. Calling failure callback");
             kony.sdk.verifyAndCallClosure(failureCallback, JSON.stringify(processServiceDocResult));
         }
     }, function(error) {
         kony.sdk.logsdk.error("### init::_doInit fetching service document from Server failed", error);
         kony.sdk.logsdk.info("### init::_doInit  calling failure callback");
         kony.sdk.isInitialized = false;
         kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getAuthErrObj(error));
     }, null, options);
 };
 kony.sdk.prototype.initWithServiceDoc = function(appKey, appSecret, serviceDoc) {
     kony.sdk.logsdk.trace("Entering kony.sdk.prototype.initWithServiceDoc");
     konyRef = this;
     KNYMobileFabric = this;
     kony.sdk.currentInstance = this;
     var unprocessedServiceDoc = kony.sdk.cloneObject(serviceDoc);
     if (kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_IDE) {
         if (!kony.sdk.isNullOrUndefined(serviceDoc)) {
             if (serviceDoc.hasOwnProperty("integrity_check_required") && serviceDoc.integrity_check_required === true) {
                 //MF server >=8.2
                 konyRef.mainRef.integrityKey = true;
             } else {
                 //MF server < 8.2 and integrity is disabled
                 konyRef.mainRef.integrityKey = false;
             }
         }
     } else {
         //platform phonegap and plain-js doesn't support http integrity
         konyRef.mainRef.integrityKey = false;
     }
     if (serviceDoc instanceof kony.sdk.serviceDoc) {
         var servConfig = serviceDoc.toJSON();
         processServiceDocMap(servConfig);
     } else {
         return processServiceDocMap(serviceDoc);
     }

     function processServiceDocMap(servConfig) {
         for (var item in servConfig) {
             if (kony.sdk.isNullOrUndefined(servConfig[item]) || kony.sdk.isEmptyObject(servConfig[item])) {
                 delete servConfig[item];
             }
         }
         kony.sdk.logsdk.debug("### init::_doInit::_processServiceDoc", servConfig);
         try {
             konyRef.mainRef.appKey = appKey;
             konyRef.mainRef.appSecret = appSecret;
             konyRef.mainRef.appId = servConfig.appId;
             konyRef.mainRef.config = serviceDoc;
             /* if (!servConfig.baseId) {
              throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, "invalid baseId " + servConfig.baseId);
              } */
             konyRef.mainRef.baseId = servConfig.baseId;
             /* if (!servConfig.name) {
              throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, "invalid name " + servConfig.name);
              } */
             konyRef.mainRef.name = servConfig.name;
             if (servConfig.login) {
                 konyRef.login = servConfig.login;
             } else {
                 konyRef.login = [];
             }
             var url = servConfig.selflink;
             if (url) {
                 var lastPos = url.indexOf("/appconfig");
                 if (lastPos != -1) {
                     url = url.slice(0, lastPos);
                 } else {
                     throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, "invalid self link");
                 }
                 var anonymousLoginProvider = {};
                 anonymousLoginProvider.type = "anonymous";
                 anonymousLoginProvider.url = url;
                 anonymousLoginProvider.prov = "$anonymousProvider";
                 konyRef.login.push(anonymousLoginProvider);
             }
             if (typeof(servConfig.integsvc) !== 'undefined') {
                 kony.sdk.logsdk.info("### init::_doInit::_processServiceDoc parsing Integration services");
                 konyRef.integsvc = servConfig.integsvc;
                 kony.sdk.logsdk.debug("### init::_doInit::konyRef integration Services", konyRef.integsvc);
             }
             if (typeof(servConfig.services_meta) === 'object') {
                 kony.sdk.logsdk.info("### init::_doInit::_processServiceDoc parsing Object services");
                 kony.sdk.util.populateIndividualServiceLists(servConfig, konyRef);
             }
             if (typeof(servConfig.messagingsvc) !== 'undefined') {
                 kony.sdk.logsdk.info("### init::_doInit::_processServiceDoc parsing Messaging services");
                 konyRef.messagingsvc = servConfig.messagingsvc;
             }
             if (typeof(servConfig.logicsvc) !== 'undefined') {
                 kony.sdk.logsdk.info("### init::_doInit::_processServiceDoc parsing Logic services");
                 konyRef.logicsvc = servConfig.logicsvc;
             }
             if (typeof(servConfig.sync) !== 'undefined') {
                 konyRef.sync = servConfig.sync;
             }
             if (servConfig.identity_features && servConfig.identity_features.reporting_params_header_allowed) {
                 kony.sdk.logsdk.info("### init::_doInit::_processServiceDoc parsing Identity features");
                 konyRef.reportingheaders_allowed = servConfig.identity_features.reporting_params_header_allowed;
             }
             if (kony.sdk.isLicenseUrlAvailable) {
                 if (servConfig.reportingsvc && servConfig.reportingsvc.custom && servConfig.reportingsvc.session) {
                     konyRef.customReportingURL = servConfig.reportingsvc.custom;
                     konyRef.sessionReportingURL = servConfig.reportingsvc.session;
                     if (konyRef.sessionReportingURL && kony.logger.isNativeLoggerAvailable()) {
                         var lastIndex = konyRef.sessionReportingURL.lastIndexOf("/");
                         if (lastIndex !== -1) {
                             var networkUrl = konyRef.sessionReportingURL.substring(0, lastIndex + 1) + kony.logger.networkPersistorUrlEndpoint;
                             var networkPersistor = kony.logger.createNetworkPersistor();
                             networkPersistor.URL = networkUrl;
                             kony.logger.setPersistorConfig(networkPersistor);
                         }
                     }
                 } else {
                     throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, "invalid url for reporting service");
                 }
             }
             if (konyRef.internalSdkObject) {
                 konyRef.internalSdkObject.initWithServiceDoc(appKey, appSecret, servConfig);
                 if (konyRef.internalSdkObject.setClientParams) {
                     if (appConfig) {
                         konyRef.internalSdkObject.setClientParams({
                             "aid": appConfig.appId,
                             "aname": appConfig.appName
                         });
                     } else {
                         konyRef.internalSdkObject.setClientParams(konyRef.getClientParams());
                     }
                 }
                 kony.sdk.logsdk.info("### init::internal sdk object initialized");
             }
             kony.sdk.logsdk.info("### init::_doInit::_processServiceDoc parsing service document done");
             kony.sdk.isInitialized = true;
             if (kony.sdk.metric && kony.os.deviceInfo().name === kony.sdk.constants.PLATFORM_SPA) {
                 kony.sdk.metric.flushEvents();
             }
             if (!kony.sdk.isNullOrUndefined(servConfig.reportingsvc)) {
                 kony.sdk.saveMetadatainDs(appKey, appSecret, unprocessedServiceDoc);
                 kony.sdk.setLicenseCall(appKey, appSecret, unprocessedServiceDoc);
             }
             if (kony.sdk.getPlatformName() === kony.sdk.constants.PLATFORM_ANDROID && (appConfig.isSSOEnabled === true || appConfig.isSSOEnabled === "true")) {
                 kony.sdk.util.initializeSSO();
             }
             var sdkType = kony.sdk.getSdkType();
             var type = kony.sdk.getAType();
             var platformName = kony.sdk.getPlatformName();
             if (sdkType == kony.sdk.constants.SDK_TYPE_IDE && ((type === kony.sdk.constants.SDK_ATYPE_NATIVE) || (type === kony.sdk.constants.SDK_ATYPE_SPA))) {
                 if ((!kony.sdk.isNullOrUndefined(konyRef.offlineObjectsvc)) && !(kony.sdk.isEmptyObject(konyRef.offlineObjectsvc))) {
                     konyRef.OfflineObjects = new kony.sdk.OfflineObjects(konyRef.offlineObjectsvc);
                 }
             }
             if (kony.license) {
                 if (kony.licensevar && kony.licensevar.changeHandlers && kony.licensevar.changeHandlers.length == 0 && kony.license.registerChangeListener) {
                     kony.license.registerChangeListener(konyRef.sessionChangeHandler);
                     konyRef.overrideUserIdFlag = true;
                 }
             }
             if (konyRef.mainRef.integrityKey === true) {
                 setIntegrityParams();
                 try {
                     if (!(kony.sdk.getAType() === kony.sdk.constants.SDK_ATYPE_SPA || kony.sdk.getAType() === "watch")) {
                         //invoke NFI only for android,ios and FFI for windows 
                         kony.sdk.httpIntegrity.setIntegrityCheck(konyRef.mainRef.integrityParams);
                     }
                 } catch (e) {
                     kony.sdk.logsdk.warn("Invalid Integrity properties received");
                     throw new Exception(kony.sdk.errorConstants.INTEGRITY_FAILURE, "Invalid Integrity properties");
                 }
             } else {
                 resetIntegrityParams();
                 if (!(kony.sdk.getAType() === kony.sdk.constants.SDK_ATYPE_SPA || kony.sdk.getAType() === "watch")) {
                     //invoke NFI only for android,ios and FFI for windows 
                     kony.sdk.httpIntegrity.removeIntegrityCheck();
                 }
             }
             return true;
         } catch (err) {
             kony.sdk.logsdk.error("### init::_doInit::_processServiceDoc failed with an exception: ", err);
             return ("processing the ServiceDoc failed with an exception: " + JSON.stringify(err));
         }
     }
 };
 kony.sdk.prototype.sessionChangeHandler = function(changes) {
     kony.sdk.logsdk.trace("Entering kony.sdk.prototype.sessionChangeHandler");
     var konyRef = kony.sdk.getCurrentInstance();
     konyRef.getMetricsService();
     var sessionId = null;
     var userId = null;
     if (changes["sessionId"] != undefined) {
         sessionId = changes["sessionId"];
         konyRef.setSessionId(sessionId);
         if (konyRef.internalSdkObject) {
             sessionId = sessionId + "," + kony.sdk.util.getSessionType();
         }
         if (konyRef.metricsServiceObject && konyRef.metricsServiceObject.setSessionId) {
             konyRef.metricsServiceObject.setSessionId(sessionId);
         }
     }
     if (changes["userId"] != undefined) {
         konyRef.overrideUserIdFlag = true;
         userId = changes["userId"];
         konyRef.setCurrentUserId(userId);
         if (konyRef.metricsServiceObject && konyRef.metricsServiceObject.setUserId) {
             konyRef.metricsServiceObject.setUserId(userId);
         }
     }
 };

 function setIntegrityParams() {
     var integrityParams = {
         "algo": kony.sdk.constants.HASHING_ALGORITHM,
         "headerName": kony.sdk.constants.INTEGRITY_HEADER,
         "validateResp": true
     };
     if (!kony.sdk.isNullOrUndefined(konyRef.integrityCustomSecurityKey)) {
         integrityParams["salt"] = konyRef.integrityCustomSecurityKey;
     } else {
         integrityParams["salt"] = konyRef.mainRef.appSecret;
     }
     konyRef.mainRef.integrityKey = true;
     konyRef.mainRef.integrityParams = integrityParams;
 }

 function resetIntegrityParams() {
     konyRef.mainRef.integrityKey = false;
     konyRef.mainRef.integrityParams = {};
 }
 /**
  * MFSDK
  * Created by KH1969 on 18-01-2018.
  * Copyright © 2018 Kony. All rights reserved.
  */
 /**
  * Constructor for ClientCache service, uses lruCache.js internally to save key, value pairs.
  * This is a singleton class, object gets created for the first time of instantiation and the same object is
  * returned for next initializations.
  *
  * @param size {Number} Maximum size of the cache. It should be non zero positive number.
  * @return {kony.sdk.ClientCache}
  *
  */
 kony.sdk.ClientCache = function(size) {
         if (typeof kony.sdk.ClientCache.instance === 'object') return kony.sdk.ClientCache.instance;
         var lruCacheObj = null;
         if (size === undefined || size === null) lruCacheObj = new lruCache(kony.sdk.constants.DEFAULT_CACHE_SIZE);
         else if (typeof size != 'number' || size <= 0) {
             kony.sdk.logsdk.warn("cache cannot be created of size <= 0");
             return null;
         } else lruCacheObj = new lruCache(size);
         /**
          * Gets the response cached for the key. Returns null if not found.
          * @param key {string}
          * @return {null|object}
          */
         this.get = function(key) {
                 return lruCacheObj.get(key);
             }
             /**
              * Gets the boolean assertion for key existence in the cache.
              * @param key {string}
              * @return {boolean}
              */
         this.has = function(key) {
                 return lruCacheObj.has(key);
             }
             /**
              * Adds the key, value pair to cache.
              * @param key {string}
              * @param value {string}
              * @param expiryTime {number} Expiry time in seconds.
              */
         this.add = function(key, value, expiryTime) {
                 lruCacheObj.add(key, value, expiryTime);
             }
             /**
              * Removes the key, value from cache.
              * @param key {string}
              */
         this.remove = function(key) {
             lruCacheObj.remove(key);
         }
         kony.sdk.ClientCache.instance = this;
     }
     /**
      * MFSDK
      * Created by KH1969 on 18-01-2018.
      * Copyright © 2018 Kony. All rights reserved.
      */
     /**
      * Constructor for standalone LRU page replacement implementation.
      * Implementation is done using a double linked list data structure and a hashmap.
      * Upon every insert & get the head gets updated to the newest element.
      * Cached nodes gets removed if size is more than the requested capacity.
      * Default cache size is 100.
      *
      * Should not be called by the developer.
      *
      *  Below is the list structure if elements are inserted in the order A, B, C & D

      *  Head = D, Tail = A
      *  D--(older)-->C--(older)-->B--(older)-->A--(older)-->NULL
      *  NULL<--(newer)--D<--(newer)--C<--(newer)--B<--(newer)--A
      *
      *  Now if B is accessed the list structure will be modified as,
      *  Head = B, Tail = A
      *
      *  B--(older)-->D--(older)-->C--(older)-->A--(older)-->NULL
      *  NULL<--(newer)--B<--(newer)--D<--(newer)--C<--(newer)--A
      */
 lruCache = function(size) {
         var LOG_PREFIX = "SDK_CACHE ";
         if (size === undefined || size === null) this.capacity = kony.sdk.constants.DEFAULT_CACHE_SIZE;
         else if (typeof size != 'number' || size <= 0) {
             kony.sdk.logsdk.warn("cache cannot be created of size <= 0");
             return null;
         } else this.capacity = size;
         this.length = 0;
         this.map = {};
         // save the head and tail so we can update it easily
         this.head = null;
         this.tail = null;
         /**
          * Gets the current time in seconds.
          * @returns {number}
          */
         function getCurrentTimeInSeconds() {
             return Math.floor(new Date().getTime() / 1000);
         }
         /**
          * Double linked list data structure.
          * @param key
          * @param value
          */
         function cacheNode(key, value, expiry) {
             this.key = key;
             this.val = value;
             this.newer = null; // Next newer node
             this.older = null; // Previous older node
             this.expiryTime = 0;
             if (expiry !== undefined && typeof expiry === 'number' && expiry != 0) {
                 this.expiryTime = getCurrentTimeInSeconds() + expiry;
             }
         }
         /**
          * Shuffles the cache by last recently used.
          * @param key
          */
         function shuffleLRUCache(key) {
             var node = this.map[key];
             if (this.head === node) {
                 // No need to shuffle the cache, as the head itself is the recently accessed node.
                 return;
             }
             // Head will not have newer node.
             if (node.newer) {
                 node.newer.older = node.older;
             } else {
                 this.head = node.older;
             }
             // Tail will not have older node.
             if (node.older) {
                 node.older.newer = node.newer;
             } else {
                 this.tail = node.newer;
             }
             // Now node is detached. Place it at head.
             // Updates are done in this way
             // 1: node--(older)-->head
             // 2: null<--(newer)--node
             // 3: node<--(newer)--head
             // 4: node is assigned to head. So current head got updated to node.
             node.older = this.head;
             node.newer = null;
             if (this.head) {
                 this.head.newer = node;
             }
             this.head = node;
         }
         /**
          * Returns the current size of the cache.
          * @returns {number}
          */
         this.getSize = function() {
                 return this.length;
             }
             /**
              * Adds the key value pair to the cache.
              * Key gets removed upon expiry, expiry time is calculated by currentTimeInSeconds + expiryTime.
              * If no expiryTime is specified then key will not expire.
              * @param key {String}
              * @param value {Object}
              * @param expiryTime {Number}
              */
         this.add = function(key, value, expiryTime) {
                 if (key === undefined || value === undefined || key === null || value === null) return;
                 // update the value for existing entries
                 if (this.has(key)) {
                     this.map[key].val = value;
                     kony.sdk.logsdk.debug(LOG_PREFIX + "Key: " + key + " updated");
                     shuffleLRUCache.call(this, key);
                     return;
                 }
                 if (this.length >= this.capacity) {
                     // remove the least recently used item
                     this.remove(this.tail.key)
                 }
                 var node = new cacheNode(key, value, expiryTime);
                 // Additions are done in this way
                 // 1: node--(older)-->head
                 // 2: node<--(newer)--head
                 // 3: node is assigned to head. So current head got updated to node.
                 // 4: tail = node, if there is no tail node then current node is tail node. This happens only for the first add.
                 node.older = this.head;
                 // if have head, we need re-connect node with other nodes older than head
                 if (this.head) {
                     this.head.newer = node;
                 }
                 this.head = node;
                 // if no tail which means first insert, set the tail to node too
                 if (!this.tail) {
                     this.tail = node;
                 }
                 this.map[key] = node;
                 this.length++;
                 kony.sdk.logsdk.debug(LOG_PREFIX + "Key: " + key + " added");
             }
             /**
              * Gets the cached node by key. Returns null if key is not found.
              * The key is removed if it is expired, returns null here as well.
              * @param key {String}
              * @returns {Object}
              */
         this.get = function(key) {
                 if (this.has(key)) {
                     if (this.map[key].expiryTime != 0 && getCurrentTimeInSeconds() > this.map[key].expiryTime) {
                         this.remove(key);
                         kony.sdk.logsdk.debug(LOG_PREFIX + "Key: " + key + " expired");
                         return null;
                     }
                     shuffleLRUCache.call(this, key);
                     return this.map[key].val;
                 } else {
                     return null;
                 }
             }
             /**
              * Removes the key, value from the cache by key.
              * @param key {String} Key to delete from the cache
              */
         this.remove = function(key) {
                 if (this.has(key)) {
                     var node = this.map[key];
                     // Head node will not have newer node.
                     if (node.newer) {
                         node.newer.older = node.older;
                     } else {
                         this.head = node.older;
                     }
                     // Tail node will not have older node.
                     if (node.older) {
                         node.older.newer = node.newer;
                     } else {
                         this.tail = node.newer;
                     }
                     delete this.map[key];
                     node = null;
                     this.length--;
                 }
             }
             /**
              * Clears the cache.
              */
         this.clear = function() {
                 this.map = {};
                 this.length = 0;
             }
             /**
              * Check if key exists.
              * @param key {string} Key to be found in the cache
              * @returns {boolean}
              */
         this.has = function(key) {
                 return this.map.hasOwnProperty(key);
             }
             /**
              * Updates the cache size.
              * @param size {number}
              */
         this.setMaxCacheSize = function(size) {
             //    Todo: If requested size < capacity remove the last (N - size) nodes from tail.
             kony.sdk.logsdk.debug(LOG_PREFIX + "updating cache size from " + this.capacity + " to " + size);
             this.capacity = size;
         }
     }
     /**
      * Method to create the configuration service instance
      * @returns {ConfigurationService} Configuration service instance
      */
 kony.sdk.prototype.getConfigurationService = function() {
     kony.sdk.logsdk.trace("Entering kony.sdk.prototype.getConfigurationService")
     if (!kony.sdk.isInitialized) {
         throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, kony.sdk.constants.INIT_FAILURE_MESSAGE + " Configuration service.");
     }
     var configObj = new ConfigurationService(this);
     if (configObj) {
         return configObj;
     } else {
         throw new Exception(kony.sdk.errorConstants.CONFIGURATION_FAILURE, "Error in creating configuration object");
     }
 };
 /**
  * Should not be called by the developer.
  * @class
  * @classdesc Configuration service instance for fetching client app properties.
  */
 function ConfigurationService(konyRef) {
     var istUrl = konyRef.mainRef.config.reportingsvc.session.split("/IST")[0];
     kony.sdk.logsdk.debug("IST url fetched from service doc is :" + istUrl);
     var configUrl = istUrl + kony.sdk.constants.GET_CLIENT_PROPERTY_URL;
     kony.sdk.logsdk.debug("Configuration url formed is :" + configUrl);
     var networkProvider = new konyNetworkProvider();
     /**
      * Configuration svc method to get all the client app properties which is configured in admin console.
      * @successCallback this is called on successfull retrieval of properties
      * @failureCallback this is called on failure in retrieving properties
      * @returns {json} key value pair of all client app properties
      */
     this.getAllClientAppProperties = function(successCallback, failureCallback) {
         function fetchClientPropertiesHandler() {
             _getAllClientAppProperties(successCallback, failureCallback);
         }
         kony.sdk.claimsRefresh(fetchClientPropertiesHandler, failureCallback);
     };

     function _getAllClientAppProperties(successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering into _getAllClientAppProperties");
         var defaultHeaders = {};
         var token = konyRef.currentClaimToken;
         if (!token) {
             token = kony.sdk.getCurrentInstance().currentClaimToken;
         }
         defaultHeaders[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = token;
         var options = {};
         options["disableIntegrity"] = true;
         networkProvider.get(configUrl, null, defaultHeaders, function(res) {
             kony.sdk.logsdk.trace("Entering Configuration service network success");
             kony.sdk.logsdk.debug("response from server for client properties is :" + JSON.stringify(res));
             var tempArray = ["httpresponse", kony.sdk.constants.MF_OPSTATUS];
             var tempJSON = {};
             for (var key in res) {
                 if (tempArray.indexOf(key.toLowerCase()) > -1) {
                     continue;
                 }
                 tempJSON[key] = res[key];
             }
             kony.sdk.verifyAndCallClosure(successCallback, tempJSON);
         }, function(xhr, status, err) {
             kony.sdk.logsdk.trace("Entering Configuration service network error");
             if (xhr && !(status && err)) {
                 err = xhr;
             }
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getObjectServiceErrObj(err));
         }, null, options);
     }
 }
 kony.sdk.constants = {
     /**Logger Constants**/
     LOGGER_NAME: "MFSDK",
     SYNC_LOGGER_NAME: "SYNCV1",
     APP_LOGGER_NAME: "KonyLogger",
     /**Network constants**/
     LAUNCHMODE_DEEPLINK: 3,
     DEEPLINK_VALID_PARAM: "code",
     HASHING_ALGORITHM: "SHA256",
     REMOVE_INTEGRITY_CHECK: "removeIntegrityCheck",
     SET_INTEGRITY_CHECK: "setIntegrityCheck",
     DEFAULT_CACHE_SIZE: 100,
     GET_CLIENT_PROPERTY_URL: "/metadata/configurations/client/properties",
     DEFAULT_CACHE_EXPIRY_TIME: 0, //Which means it doesn't expire in the application session.
     /**Service ID's for Identity Calls**/
     GET_BACKEND_TOKEN: "getBackendToken",
     GET_SECURITY_ATTRIBUTES: "getSecurityAttributes",
     GET_USER_ATTRIBUTES: "getUserAttributes",
     GET_USER_DATA: "getUserData",
     GET_PROFILE: "getProfile",
     /** Identity Options**/
     OAUTH_REDIRECT_SUCCESS_URL: "success_url",
     //OAuth for IE11 Workaround Constants, MFSDK-3657
     IE11_CROSS_DOMAIN_OAUTH_BASE_URL: "IE11CrossDomainOAuthBaseUrl",
     KNY_OAUTH_REDIRECT_HTML: "KNYOAuthRedirect.html",
     KNY_OAUTH_CALLBACK_HTML: "KNYOAuthCallback.html",
     KNY_OAUTH_REDIRECT_URL: "kny_oauth_redirect_url",
     /**HttpMethods and header constants**/
     HTTP_METHOD_GET: "GET",
     HTTP_METHOD_POST: "POST",
     HTTP_METHOD_DELETE: "DELETE",
     HTTP_CONTENT_HEADER: "Content-Type",
     HTTP_REQUEST_HEADER_ACCEPT: "Accept",
     /**Content Type Value Constants**/
     CONTENT_TYPE_FORM_URL_ENCODED: "application/x-www-form-urlencoded",
     CONTENT_TYPE_JSON: "application/json",
     //Added a new content-type based on the bug MFSDK-4096
     CONTENT_TYPE_JSON_CHARSET_UTF8: "application/json;charset=utf-8",
     CONTENT_TYPE_OCTET_STREAM: "application/octet-stream",
     CONTENT_TYPE_TEXT_HTML: "text/html",
     CONTENT_TYPE_TEXT_PLAIN: "text/plain",
     /**SDK Plugin Type**/
     SDK_TYPE_IDE: "js",
     SDK_TYPE_PHONEGAP: "phonegap",
     SDK_TYPE_PLAIN_JS: "plain-js",
     /**APP Session Type**/
     APP_SESSION_INTERACTIVE: "I",
     APP_SESSION_NON_INTERACTIVE: "NI",
     /**SDK Architecture Type**/
     SDK_ATYPE_NATIVE: "native",
     SDK_ATYPE_SPA: "spa",
     /**Device platform**/
     PLATFORM_WINDOWS: "windows",
     PLATFORM_ANDROID: "android",
     PLATFORM_IOS: "ios",
     //kony.os.device.info() for SPA returns thinclient
     PLATFORM_SPA: "thinclient",
     /***Metrics Constants**/
     REPORTING_PARAMS: "konyreportingparams",
     KEY_DEVICE_ID: "deviceID",
     /**Headers**/
     APP_KEY_HEADER: "X-Kony-App-Key",
     APP_SECRET_HEADER: "X-Kony-App-Secret",
     KONY_AUTHORIZATION_HEADER: "X-Kony-Authorization",
     AUTHORIZATION_HEADER: "Authorization",
     REPORTING_HEADER: "X-Kony-ReportingParams",
     INTEGRITY_HEADER: "X-Kony-Integrity",
     DEVICEID_HEADER: "X-Kony-DeviceId",
     API_VERSION_HEADER: "X-Kony-API-Version",
     APP_VERSION_HEADER: "X-Kony-App-Version",
     SDK_TYPE_HEADER: "X-Kony-SDK-Type",
     SDK_VERSION_HEADER: "X-Kony-SDK-Version",
     PLATFORM_TYPE_HEADER: "X-Kony-Platform-Type",
     HTTP_OVERRIDE_HEADER: "X-HTTP-Method-Override",
     /**Mobilefabric constants**/
     HTTP_STATUS_CODE: "httpStatusCode",
     MF_OPSTATUS: "opstatus",
     MF_CODE: "mfcode",
     MF_ERROR_MSG: "errmsg",
     MF_ERROR_CODE: "errcode",
     MF_SERVICE: "service",
     /**Engagement service API constants**/
     SUBSCRIBE_AUDIENCE: "/subscribeaudience",
     BEACON_UPDATE: "/beaconupdate",
     RICH_PUSH_MESSAGE: "/messages/rich/",
     LAST_ACTIVE_DATE: "lastActiveDate",
     KSID: "ksid",
     AUTH_TOKEN: "authToken",
     DEVICE_AUTHTOKEN_HEADER: "X-Device-AuthToken",
     /**Parsed Template Constants**/
     PROCESSED_TEMPLATE: "processedTemplate",
     MISSING_VARIABLES: "missingVariables",
     /**Mandatory Binary Params**/
     FILE_PATH: "FilePath",
     RAW_BYTES: "rawBytes",
     FILE_OBJECT: "fileObject",
     FILE_NAME: "fileName",
     /**Miscellaneous**/
     SSO_TOKEN_KEY: "ssoTokenKey",
     KONYUUID: "konyUUID",
     BROWSER_WIDGET: "browserWidget",
     INIT_FAILURE_MESSAGE: "SDK is not initialized, call init before invoking any operation on",
     DISABLE_INTEGRITY: "disableIntegrity",
     PASSTHROUGH: "passthrough",
     BINARY_DATATYPE: "binary",
     JSON_DATA: "jsondata",
     /** License Constants **/
     LICENSE_SESSION_TIMEOUT_IN_MILLIS: 14400000,
     LICENSE_BG_TO_FG_SESSION_TIMEOUT_IN_MILLIS: 1800000
 };
 if (typeof(kony.sdk) === "undefined") {
     kony.sdk = {};
 }
 if (typeof(kony.sdk.error) === "undefined") {
     kony.sdk.error = {};
 }
 kony.sdk.error.getAuthErrObj = function(errResponse) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getAuthErrObj");
     if (errResponse && errResponse.httpresponse) {
         delete errResponse.httpresponse;
     }
     if (errResponse && errResponse[kony.sdk.constants.MF_ERROR_MSG]) {
         errResponse["message"] = errResponse[kony.sdk.constants.MF_ERROR_MSG];
         delete errResponse.errmsg;
     }
     try {
         var mfcode = errResponse[kony.sdk.constants.MF_CODE];
         var message = errResponse["message"];
         var details = errResponse["details"];
         if (mfcode) {
             return kony.sdk.error.getMFcodeErrObj(mfcode, message, details, "");
         }
         return errResponse;
     } catch (err) {
         return errResponse;
     }
 }
 kony.sdk.error.getNullClaimsTokenErrObj = function() {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getNullClaimsTokenErrObj");
     var errorObj = {};
     errorObj.opstatus = kony.sdk.errorcodes.cliams_token_null
     errorObj.message = kony.sdk.errormessages.cliams_token_null
     errorObj.details = {};
     errorObj.mfcode = "";
     return errorObj;
 }
 kony.sdk.error.getIdentitySessionInactiveErrObj = function() {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getIdentitySessionInactiveErrObj");
     var errorObj = {};
     errorObj.opstatus = kony.sdk.errorcodes.identity_session_inactive
     errorObj.message = kony.sdk.errormessages.identity_session_inactive
     errorObj.details = {};
     errorObj.mfcode = "";
     return errorObj;
 }
 kony.sdk.error.getNullRefreshTokenErrObj = function() {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getNullRefreshTokenErrObj");
     var errorObj = {};
     errorObj.opstatus = kony.sdk.errorcodes.invalid_session_or_token_expiry
     errorObj.message = kony.sdk.errormessages.invalid_session_or_token_expiry
     errorObj.details = {};
     errorObj.mfcode = "";
     return errorObj;
 }
 kony.sdk.error.getIntegrationErrObj = function(errResponse) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getIntegrationErrObj");
     try {
         var mfcode = errResponse[kony.sdk.constants.MF_CODE];
         var message = errResponse[kony.sdk.constants.MF_ERROR_MSG];
         var details = errResponse["mferrmsg"];
         var service = errResponse[kony.sdk.constants.MF_SERVICE];
         if (!service) {
             service = "";
         }
         if (!details) {
             details = "";
         }
         var errorMessagePrefixForIntegration = "";
         if (service) {
             errorMessagePrefixForIntegration = "Integration Service Request Failed for " + service + ":";
         } else {
             errorMessagePrefixForIntegration = "Integration Service Request Failed:";
         }
         if (mfcode) {
             return kony.sdk.error.getMFcodeErrObj(mfcode, message, details, errorMessagePrefixForIntegration);
         }
         return errResponse;
     } catch (err) {
         return errResponse;
     }
 }
 kony.sdk.error.getLogicErrObj = function(errResponse) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getLogicErrObj");
     try {
         var mfcode = errResponse[kony.sdk.constants.MF_CODE];
         var message = errResponse[kony.sdk.constants.MF_ERROR_MSG];
         var details = errResponse["mferrmsg"];
         var service = errResponse[kony.sdk.constants.MF_SERVICE];
         if (!service) {
             service = "";
         }
         if (!details) {
             details = "";
         }
         var errorMessagePrefixForLogic = "";
         if (service) {
             errorMessagePrefixForLogic = "Logic Service Request Failed for " + service + ":";
         } else {
             errorMessagePrefixForLogic = "Logic Service Request Failed:";
         }
         if (mfcode) {
             return kony.sdk.error.getMFcodeErrObj(mfcode, message, details, errorMessagePrefixForLogic);
         }
         return errResponse;
     } catch (err) {
         return errResponse;
     }
 }
 kony.sdk.error.getMFcodeErrObj = function(mfcode, message, details, errMessagePrefix) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getMFcodeErrObj");
     var errorObj = {};
     errorObj.details = {};
     if (details) {
         errorObj.details = details;
     }
     errorObj.mfcode = mfcode;
     if (mfcode === "Auth-4") {
         if (!message) {
             message = kony.sdk.errormessages.invalid_user_credentials
         }
         errorObj.opstatus = kony.sdk.errorcodes.invalid_user_credentials
         errorObj.message = errMessagePrefix + message;
     } else if (mfcode === "Auth-9") {
         if (!message) {
             message = kony.sdk.errormessages.invalid_app_credentials
         }
         errorObj.opstatus = kony.sdk.errorcodes.invalid_app_credentials
         errorObj.message = errMessagePrefix + message;
     } else if (mfcode === "Auth-3") {
         if (!message) {
             message = kony.sdk.errormessages.invalid_user_app_credentials
         }
         errorObj.opstatus = kony.sdk.errorcodes.invalid_user_app_credentials
         errorObj.message = errMessagePrefix + message;
     } else if ((mfcode === "Auth-5") || (mfcode === "Auth-6") || (mfcode === "Gateway-31") || (mfcode === "Gateway-33") || (mfcode === "Gateway-35") || (mfcode === "Gateway-36") || (mfcode === "Auth-46") || (mfcode === "Auth-55")) {
         errorObj.opstatus = kony.sdk.errorcodes.invalid_session_or_token_expiry
         errorObj.message = errMessagePrefix + kony.sdk.errormessages.invalid_session_or_token_expiry
     } else if (mfcode === "Auth-7" || mfcode === "Auth-27") {
         if (!message) {
             message = errMessagePrefix + kony.sdk.errormessages.invalid_user_app_services
         }
         errorObj.opstatus = kony.sdk.errorcodes.invalid_user_app_services
         errorObj.message = message;
     } else {
         errorObj.opstatus = kony.sdk.errorcodes.default_code
         errorObj.message = errMessagePrefix + kony.sdk.errormessages.default_message
     }
     return errorObj;
 }

 function getAuthErrorMessage(mfcode) {
     kony.sdk.logsdk.trace("Entering into getAuthErrorMessage");
     if (mfcode === "Auth-4") {
         return kony.sdk.errormessages.invalid_user_credentials
     } else if (mfcode === "Auth-9") {
         return kony.sdk.errormessages.invalid_app_credentials
     } else if (mfcode === "Auth-3") {
         return kony.sdk.errormessages.invalid_user_app_credentials
     } else if ((mfcode === "Auth-5") || (mfcode === "Auth-6") || (mfcode === "Gateway-31") || (mfcode === "Gateway-33") || (mfcode === "Gateway-35") || (mfcode === "Gateway-36") || (mfcode === "Auth-46") || (mfcode === "Auth-55")) {
         return kony.sdk.errormessages.invalid_session_or_token_expiry
     } else if (mfcode === "Auth-7" || mfcode === "Auth-27") {
         return kony.sdk.errormessages.invalid_user_app_services
     } else {
         return mfcode + ":" + kony.sdk.errormessages.default_message
     }
 }
 kony.sdk.error.getObjectServiceErrObj = function(errResponse) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getObjectServiceErrObj");
     try {
         var mfcode = errResponse[kony.sdk.constants.MF_CODE];
         var message = errResponse[kony.sdk.constants.MF_ERROR_MSG];
         var details = errResponse["mferrmsg"];
         var service = errResponse[kony.sdk.constants.MF_SERVICE];
         if (!service) {
             service = "";
         }
         if (!details) {
             details = "";
         }
         var errorMessagePrefixForIntegration = "";
         if (service) {
             errorMessagePrefixForIntegration = "Object Service Request Failed for " + service + ":";
         } else {
             errorMessagePrefixForIntegration = "Object Service Request Failed:";
         }
         if (mfcode) {
             return kony.sdk.error.getMFcodeErrObj(mfcode, message, details, errorMessagePrefixForIntegration);
         }
         return errResponse;
     } catch (err) {
         return errResponse;
     }
 }
 kony.sdk.error.getClientErrObj = function(errCode, errMsg) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getClientErrObj");
     var errObj = new Object();
     errObj.opstatus = kony.sdk.errorcodes.clientvalidation_error_opstatus;
     errObj.errmsg = errMsg;
     errObj.errcode = errCode;
     return errObj;
 }
 kony.sdk.error.getMessagingError = function(errMsg) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getMessagingError");
     var errObj = new Object();
     errObj.opstatus = kony.sdk.errorcodes.messaging_service_fail;
     errObj.errmsg = kony.sdk.errormessages.messaging_service_fail + errMsg;
     errObj.errcode = kony.sdk.errorcodes.messaging_service_fail;
     return errObj;
 }
 kony.sdk.error.getConfigServiceErrObject = function(errResponse) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getConfigServiceErrObject");
     try {
         var mfcode = errResponse[kony.sdk.constants.MF_CODE];
         var message = errResponse[kony.sdk.constants.MF_ERROR_MSG];
         var details = errResponse["mferrmsg"];
         var service = errResponse[kony.sdk.constants.MF_SERVICE];
         if (!service) {
             service = "";
         }
         if (!details) {
             details = "";
         }
         var errorMessagePrefixForIntegration = "";
         if (service) {
             errorMessagePrefixForIntegration = "Configuration Service Request Failed for " + service + ":";
         } else {
             errorMessagePrefixForIntegration = "Configuration Service Request Failed:";
         }
         if (mfcode) {
             return kony.sdk.error.getMFcodeErrObj(mfcode, message, details, errorMessagePrefixForIntegration);
         }
         return errResponse;
     } catch (err) {
         return errResponse;
     }
 };
 kony.sdk.error.getIntegrityErrorMessage = function(httpRequest, url) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getIntegrityErrorMessage");
     var errorMessage = {};
     errorMessage.httpresponse = {};
     errorMessage[kony.sdk.constants.MF_OPSTATUS] = kony.sdk.errorcodes.integrity_check_failed;
     errorMessage[kony.sdk.constants.MF_ERROR_MSG] = kony.sdk.errormessages.integrity_check_failed;
     errorMessage[kony.sdk.constants.MF_ERROR_CODE] = kony.sdk.errorcodes.integrity_check_failed;
     errorMessage[kony.sdk.constants.HTTP_STATUS_CODE] = httpRequest.status.toString();
     errorMessage.httpresponse["response"] = httpRequest.response;
     errorMessage.httpresponse.headers = httpRequest.getAllResponseHeaders();
     errorMessage.httpresponse.url = url;
     errorMessage.httpresponse.responsecode = httpRequest.status.toString();
     return errorMessage;
 };
 kony.sdk.error.getOperationFailedErrorMessage = function(httpRequest, url) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.error.getOperationFailedErrorMessage");
     var errorMessage = {};
     errorMessage[kony.sdk.constants.MF_OPSTATUS] = httpRequest.response.opstatus;
     errorMessage[kony.sdk.constants.MF_ERROR_MSG] = kony.sdk.errormessages.server_operation_failed;
     errorMessage[kony.sdk.constants.MF_ERROR_CODE] = kony.sdk.errorcodes.server_operation_failed;
     errorMessage[kony.sdk.constants.HTTP_STATUS_CODE] = httpRequest.status.toString();
     var httpResponse = {};
     httpResponse.response = httpRequest.response;
     httpResponse.headers = httpRequest.getAllResponseHeaders();
     httpResponse.responsecode = httpRequest.status.toString();
     httpResponse.url = url;
     errorMessage.httpResponse = httpResponse;
     return errorMessage;
 };
 if (typeof(kony.sdk) === "undefined") {
     kony.sdk = {};
 }
 if (typeof(kony.sdk.errorcodes) === "undefined") {
     kony.sdk.errorcodes = {};
 }
 if (typeof(kony.sdk.errormessages) === "undefined") {
     kony.sdk.errormessages = {};
 }
 kony.sdk.errorcodes.invalid_user_credentials = 101;
 kony.sdk.errormessages.invalid_user_credentials = "Invalid User Credentials.";
 kony.sdk.errorcodes.invalid_app_credentials = 102;
 kony.sdk.errormessages.invalid_app_credentials = "Invalid App Credentials.";
 kony.sdk.errorcodes.invalid_user_app_credentials = 103;
 kony.sdk.errormessages.invalid_user_app_credentials = "Invalid User/App Credentials.";
 kony.sdk.errorcodes.invalid_session_or_token_expiry = 104;
 kony.sdk.errormessages.invalid_session_or_token_expiry = "Session/Token got invalidated in the backend.Please login.";
 kony.sdk.errorcodes.invalid_user_app_services = 105;
 kony.sdk.errormessages.invalid_user_app_services = "Invalid provider in appServices.";
 kony.sdk.errorcodes.cliams_token_null = 106;
 kony.sdk.errormessages.cliams_token_null = "Claims Token is Unavialable";
 kony.sdk.errorcodes.identity_session_inactive = 107;
 kony.sdk.errormessages.identity_session_inactive = "Identity Provider's sessions is not active. Please login";
 kony.sdk.errorcodes.default_code = 100;
 kony.sdk.errormessages.default_message = "UnhandledMFcode";
 kony.sdk.errorcodes.unknown_error_code = 1000;
 kony.sdk.errormessages.unknown_error_message = "An unknown error has occured";
 kony.sdk.errorcodes.connectivity_error_code = 1011;
 kony.sdk.errormessages.connectivity_error_message = "An error occurred while making the request. Please check device connectivity, server url and request parameters";
 kony.sdk.errorcodes.invalid_json_code = 1013;
 kony.sdk.errormessages.invalid_json_message = "Invalid Json response was returned";
 kony.sdk.errorcodes.request_timed_out_code = 1014;
 kony.sdk.errormessages.request_timed_out_message = "Request to server has timed out";
 kony.sdk.errorcodes.offline_auth_failed = 1015;
 kony.sdk.errormessages.offline_auth_failed = "Offline Authentication failed, User should atleast login once when network connectivity is available.";
 kony.sdk.errorcodes.servicedoc_unavailable = 1016;
 kony.sdk.errormessages.servicedoc_unavailable = "MBAAS app is not initialized properly. Service document is unavailable.";
 kony.sdk.errorcodes.transient_login_fail = 1017;
 kony.sdk.errormessages.transient_login_fail = "Transient Login failed, Previous Identity Token expired in backend.";
 kony.sdk.errorcodes.messaging_service_fail = 1018;
 kony.sdk.errormessages.messaging_service_fail = "Failure in Messaging Service. ";
 kony.sdk.errorcodes.integrity_check_failed = 1019;
 kony.sdk.errormessages.integrity_check_failed = "Http message Body Integrity Check failed.";
 kony.sdk.errorcodes.invalid_security_key = 1023;
 kony.sdk.errormessages.invalid_security_key = "Security key should be a non empty string.";
 kony.sdk.errorcodes.server_operation_failed = 1020;
 kony.sdk.errormessages.server_operation_failed = "Operation Failed on server";
 kony.sdk.errorcodes.populating_template_failed = 1021;
 kony.sdk.errormessages.populating_template_failed = "Template population failed, template parameters are invalid or template is malformed";
 kony.sdk.errorcodes.service_unavailable = 1022;
 kony.sdk.errormessages.service_unavailable_message = "Service unavailable or cannot connect to host";
 kony.sdk.errorcodes.clientvalidation_error_opstatus = 112233;
 //Invaild API's for phonegap and plain-js
 kony.sdk.errorcodes.invalid_api = 7000;
 kony.sdk.errormessages.invalid_api = "Invalid Operation name, Operation Failed.";
 //Object Service Error Messages
 kony.sdk.errorcodes.invalid_dataobject_instance = 90001;
 kony.sdk.errormessages.invalid_dataobject_instance = "Provided dataobject is invalid and should be instance of kony.sdk.dto.DataObject";
 kony.sdk.errorcodes.primarykey_unavailable = 90002;
 kony.sdk.errormessages.primarykey_unavailable = "Primary Keys missing, Operation Failed";
 kony.sdk.errorcodes.null_or_undefined = 90003;
 kony.sdk.errormessages.null_or_undefined = " cannot be null or undefined";
 kony.sdk.errorcodes.transaction_failed = 90004;
 kony.sdk.errormessages.transaction_failed = "Some error occurred, Operation Failed";
 kony.sdk.errorcodes.norecords_to_delete = 90005;
 kony.sdk.errormessages.norecords_to_delete = "No records deleted with the specified criteria";
 kony.sdk.errorcodes.invalid_queryparams_instance = 90006;
 kony.sdk.errormessages.invalid_queryparams_instance = "Provided queryParams is invalid and should be a json object";
 kony.sdk.errorcodes.invalid_params_instance = 90007;
 kony.sdk.errormessages.invalid_params_instance = "Provided params are invalid";
 kony.sdk.errorcodes.invalid_object = 90008;
 kony.sdk.errormessages.invalid_object = "Invalid object name, Operation Failed.";
 kony.sdk.errorcodes.invalid_blob = 90009;
 kony.sdk.errormessages.invalid_blob = "Failed to read from binary file, either the file does not exist or invalid";
 kony.sdk.errorConstants = {
     INIT_FAILURE: "INIT_FAILURE",
     DATA_STORE_EXCEPTION: "DATASTORE_FAILURE",
     AUTH_FAILURE: "AUTH_FAILURE",
     INTEGRATION_FAILURE: "INTEGRATION_FAILURE",
     MESSAGING_FAILURE: "MESSAGING_FAILURE",
     SYNC_FAILURE: "SYNC_FAILURE",
     METRICS_FAILURE: "METRICS_FAILURE",
     MISC_FAILURE: "MISCELLANEOUS_FAILURE",
     OBJECT_FAILURE: "OBJECT_FAILURE",
     LOGIC_SERVICE_FAILURE: "LOGIC_SERVICE_FAILURE",
     SYNC_V2_FAILURE: "SYNC_V2_FAILURE",
     CONFIGURATION_URL_FAILURE: "CONFIGURATION_URL_FAILURE",
     CONFIGURATION_FAILURE: "CONFIGURATION_FAILURE",
     INTEGRITY_FAILURE: "INTEGRITY_FAILURE",
     INVALID_API_FAILURE: "INVALID_API_FAILURE"
 };
 /**
  * Method to create the Identity service instance with the provided provider name.
  * @param {string} providerName - Name of the provider
  * @returns {IdentityService} Identity service instance
  */
 kony.sdk.offline = kony.sdk.offline || {};
 kony.sdk.sso = kony.sdk.sso || {};
 kony.sdk.isSSOLoginSuccess = kony.sdk.isSSOLoginSuccess || true;
 kony.sdk.prototype.getIdentityService = function(providerName) {
     kony.sdk.logsdk.trace("Entering kony.sdk.prototype.getIdentityService");
     if (!kony.sdk.isInitialized) {
         throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, kony.sdk.constants.INIT_FAILURE_MESSAGE + " Identity service.");
     }
     var provider = null;
     if (providerName) {
         if (this.login != null) {
             for (var i = 0; i < this.login.length; i++) {
                 var rec = this.login[i];
                 if ((rec.alias && rec.alias.toUpperCase() === providerName.toUpperCase()) || (rec.prov.toUpperCase() === providerName.toUpperCase())) {
                     provider = new IdentityService(this, rec);
                     break;
                 }
             }
             if (provider === null) {
                 throw new Exception(kony.sdk.errorConstants.AUTH_FAILURE, "Invalid providerName");
             }
             //TODO: what if the providerName is not passed by the user? 
             kony.sdk.logsdk.debug("### auth:: returning authService for providerName = " + provider.getProviderName());
             return provider;
         }
     } else {
         throw new Exception(kony.sdk.errorConstants.AUTH_FAILURE, "Invalid providerName");
     }
 };
 /**
  * Should not be called by the developer.
  * @class
  * @classdesc Identity service instance for handling login/logout calls.
  */
 function IdentityService(konyRef, rec) {
     kony.sdk.logsdk.trace("Entering IdentityService");
     var networkProvider = new konyNetworkProvider();
     var dataStore = new konyDataStore();
     var serviceObj = rec;
     konyRef.rec = rec;
     var mainRef = konyRef.mainRef;
     var user_attributes = {};
     var offlineEnabled = false;
     var persistToken = false;
     if (serviceObj === undefined || serviceObj.prov == undefined || serviceObj.type == undefined) {
         throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, "Invalid service url and service type");
     }
     var _type = serviceObj.type;
     var _serviceUrl = stripTrailingCharacter(serviceObj.url, "/");
     var _providerName = serviceObj.prov;
     kony.sdk.logsdk.debug("### AuthService:: initialized for provider " + _providerName + " with type " + _type);

     function isLoggedIn() {
         if (kony.sdk.getCurrentInstance() && kony.sdk.getCurrentInstance().tokens && kony.sdk.getCurrentInstance().tokens.hasOwnProperty(_providerName) && !kony.sdk.isNullOrUndefined(kony.sdk.getCurrentInstance().tokens[_providerName]) && Object.keys(kony.sdk.getCurrentInstance().tokens[_providerName]).length !== 0) {
             return true;
         }
         return false;
     }
     var dsKey = _serviceUrl + "::" + _providerName + "::" + _type + "::RAW";

     function resetAllCurrentTokens(konyRef, _providerName) {
         kony.sdk.resetProviderKeys(konyRef, _providerName);
     }
     /**
      * Login with the given credentials asynchronously and executes the given callback.
      * @param {object} options - User name and password
      * @param {function} successCallback  - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      */
     this.login = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering Login");
         var continueOnRefreshError = true;
         var reportingData = kony.sdk.getEncodedReportingParamsForSvcid("login_" + _providerName);
         kony.sdk.logsdk.debug("### AuthService::login Invoked login for provider " + _providerName + " of type " + _type);
         if (typeof(options) == 'undefined') {
             throw new Exception(kony.sdk.errorConstants.AUTH_FAILURE, "Missing required number of arguments to login function");
         }
         if (options && options["loginOptions"] && options["loginOptions"]["continueOnRefreshError"] === false) {
             continueOnRefreshError = false;
         }
         if (options && options["loginOptions"]) {
             offlineEnabled = options["loginOptions"]["isOfflineEnabled"] || false;
             kony.sdk.offline.isOfflineEnabled = kony.sdk.offline.isOfflineEnabled || offlineEnabled;
             kony.sdk.sso.isSSOEnabled = options["loginOptions"]["isSSOEnabled"] || false;
         } else {
             kony.sdk.sso.isSSOEnabled = false;
         }

         function invokeAjaxCall(url, params, headers) {
             if (!headers) {
                 headers = {};
             }
             if (!kony.sdk.isNullOrUndefined(konyRef.currentClaimToken) && (new Date().getTime() < konyRef.claimTokenExpiry)) {
                 headers[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = konyRef.currentClaimToken;
             }
             headers[kony.sdk.constants.APP_KEY_HEADER] = mainRef.appKey;
             headers[kony.sdk.constants.APP_SECRET_HEADER] = mainRef.appSecret;
             headers[kony.sdk.constants.SDK_TYPE_HEADER] = kony.sdk.getSdkType();
             headers[kony.sdk.constants.SDK_VERSION_HEADER] = kony.sdk.version;
             headers[kony.sdk.constants.PLATFORM_TYPE_HEADER] = kony.sdk.getPlatformName();
             headers[kony.sdk.constants.HTTP_REQUEST_HEADER_ACCEPT] = kony.sdk.constants.CONTENT_TYPE_JSON;
             headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
             populateHeaderWithFabricAppVersion(headers);
             if (konyRef.reportingheaders_allowed) {
                 if (reportingData != null && reportingData != undefined) {
                     try {
                         headers[kony.sdk.constants.REPORTING_HEADER] = reportingData;
                     } catch (error) {
                         kony.sdk.logsdk.error("### login::error while parsing metrics payload" + error);
                     }
                 }
             }
             if (kony.sdk.sso.isSSOEnabled === true) {
                 var ssotoken = kony.sdk.util.getSSOTokenForProvider(_providerName);
                 if (!kony.sdk.util.isNullOrEmptyString(ssotoken)) {
                     headers[kony.sdk.constants.AUTHORIZATION_HEADER] = ssotoken;
                 }
             }
             var endPointUrl = null;
             if (_type === "anonymous") {
                 endPointUrl = _serviceUrl + url;
             } else {
                 endPointUrl = _serviceUrl + url + "?provider=" + _providerName;
                 params["provider"] = _providerName;
             }
             if (options && options["include_profile"]) {
                 params["include_profile"] = params["include_profile"] ? params["include_profile"] : options["include_profile"];
             }
             var networkOptions = {};
             if (options && options["httpRequestOptions"] && options["httpRequestOptions"] instanceof Object) {
                 networkOptions["httpRequestOptions"] = options["httpRequestOptions"];
             }
             networkProvider.post(endPointUrl, params, headers, function(data) {
                 var response = processLoginSuccessResponse(data, konyRef, false);

                 function serviceDocCallback() {
                     kony.sdk.verifyAndCallClosure(successCallback, response);
                 }
                 getLatestServiceDocIfAvailable(data, serviceDocCallback);
             }, function(data) {
                 processLoginErrorResponse(data, konyRef, true, failureCallback)
             }, null, networkOptions);
         }

         function loginHelper(url, params, headers, isError) {
             if (isError) {
                 var error = {};
                 err.message = "Login Failed";
                 err.opstatus = kony.sdk.errorcodes.transient_login_fail;
                 err.code = (params && params.error) ? params.error : "";
                 kony.sdk.verifyAndCallClosure(failureCallback, err);
                 return;
             }
             kony.sdk.logsdk.trace("Entering loginHelper");
             if (!kony.sdk.isNullOrUndefined(konyRef.currentClaimToken) && !konyRef.isAnonymousProvider) {
                 kony.sdk.claimsRefresh(function(res) {
                     invokeAjaxCall(url, params, headers)
                 }, function(err) {
                     if (continueOnRefreshError) {
                         kony.sdk.logsdk.error("### AuthService::login claimsRefresh failed, performing force login");
                         invokeAjaxCall(url, params, headers);
                     } else {
                         kony.sdk.logsdk.error("### AuthService::login claimsRefresh failed, invoking failurecallback");
                         err.message = kony.sdk.errormessages.transient_login_fail;
                         err.opstatus = kony.sdk.errorcodes.transient_login_fail;
                         kony.sdk.verifyAndCallClosure(failureCallback, err);
                     }
                 })
             } else {
                 kony.sdk.logsdk.info("### AuthService::login Claims token unavailable, performing regular login");
                 invokeAjaxCall(url, params, headers);
             }
         }
         /**
          * Login once the deeplink redirection is done. .
          * @param {map} options
          */
         function loginForDeeplink(options) {
             kony.sdk.logsdk.trace("Entering loginForDeeplink");
             if (options) {
                 var code = options[kony.sdk.constants.DEEPLINK_VALID_PARAM];
                 var urlType = options["urlType"];
                 try {
                     kony.sdk.logsdk.debug("### AuthService::login received authorization code");
                     loginHelper("/" + urlType + "/" + "token", {
                         code: code
                     }, {});
                 } catch (err) {
                     kony.sdk.logsdk.error("exception ::" + err);
                     failureCallback();
                 }
             }
         }
         if (_type === "anonymous") {
             konyRef.isAnonymousProvider = true;
             kony.sdk.logsdk.info("### AuthService::login Adapter type is anonymous");
             loginHelper("/login", {}, {});
         } else if (_type == "basic") {
             var mandatory_fields = ["userid", "password"];
             if (kony.sdk.sso.isSSOEnabled === false) {
                 if (serviceObj.mandatory_fields && kony.sdk.isArray(serviceObj.mandatory_fields)) {
                     mandatory_fields = serviceObj.mandatory_fields;
                 }
                 for (var i = 0; i < mandatory_fields.length; ++i) {
                     if (kony.sdk.isNullOrUndefined(options[mandatory_fields[i]])) {
                         throw new Exception(kony.sdk.errorConstants.AUTH_FAILURE, " Require " + mandatory_fields[i]);
                     }
                 }
             }
             var payload = {};
             var encryptedStorage = {};
             if (options != null && options != undefined) {
                 for (var option in options) {
                     payload[option] = options[option];
                 }
             }
             payload["provider"] = _providerName;
             kony.sdk.logsdk.info("### AuthService::login Adapter type is basic");
             loginHelper("/login", payload, {});
         } else {
             if (options && options.userid && options.password) {
                 var payload = {};
                 for (var option in options) {
                     payload[option] = options[option];
                 }
                 payload["provider"] = _providerName;
                 loginHelper("/login", payload);
             } else {
                 kony.sdk.logsdk.debug("### AuthService::login Adapter type is " + _type);
                 if (kony.sdk.isSSOLoginSuccess && kony.sdk.sso.isSSOEnabled == true && kony.sdk.util.getSSOToken() != null && kony.sdk.util.getSSOToken() != "" && kony.sdk.util.getSSOToken() != undefined) {
                     if (_type === "oauth2") {
                         loginHelper("/oauth2/token", {}, {});
                     } else if (_type === "saml") {
                         loginHelper("/saml/token", {}, {});
                     } else {
                         loginHelper("/login", {}, {});
                     }
                 } else {
                     //To provide backward compatibility, if MF is an older it will not have the changes for blocking the popup or opening the login url in the native browser.
                     //Identity will add a new tuple in the service doc "identity_meta". SDK will validate the compatibility with the existance of serviceDoc["identity_meta"][<priovider_name>]["success_url"]
                     var isMFVersionCompatible = false;
                     var oauthOptions = {};
                     if (options && options["loginOptions"] && options["loginOptions"]["customQueryParamsForOAuth"] && options["loginOptions"]["customQueryParamsForOAuth"] instanceof Object) {
                         oauthOptions["customQueryParamsForOAuth"] = options["loginOptions"]["customQueryParamsForOAuth"];
                     }
                     if (mainRef && mainRef.config && mainRef.config.identity_meta && mainRef.config.identity_meta[_providerName] && mainRef.config.identity_meta[_providerName].success_url) {
                         isMFVersionCompatible = true;
                     }
                     if (kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_PLAIN_JS) {
                         //Case to handle plain-js OAuth flow.
                         // Popup needs to be blocked for oauth2 type & redirect to the url "success_url" if provided in query params else the default one declared in the MF application.
                         if (options && options["noPopup"]) {
                             oauthOptions["noPopup"] = true
                         }
                         if (options && options[kony.sdk.constants.DEEPLINK_VALID_PARAM] && options["urlType"]) {
                             //Validating the identity service once after deeplink is redirected. Params "code" & "urlType" are mandatory and are used to distinguish the request.
                             loginForDeeplink(options);
                         } else {
                             oauthOptions["appSecret"] = mainRef.appSecret;
                             oauthOptions["serviceDoc"] = mainRef.config;
                             if (options && options["include_profile"]) {
                                 oauthOptions["include_profile"] = options["include_profile"]
                             }
                             OAuthHandler(_serviceUrl, _providerName, mainRef.appKey, loginHelper, _type, oauthOptions, isMFVersionCompatible);
                         }
                     } else {
                         if (kony.sdk.util.hasBrowserWidget(options)) {
                             //Case to handle OAuth for IDE
                             oauthOptions[kony.sdk.constants.BROWSER_WIDGET] = options[kony.sdk.constants.BROWSER_WIDGET];
                         } else {
                             //Default case if param browserWidget and UseDeviceBrowser not present. We create one browser widget and open the url in it.
                             if (options && options["UseDeviceBrowser"]) {
                                 //Validating to check the existence of param "UseDeviceBrowser".
                                 // if found login url will be opened in device native broser, else in browser widget.
                                 oauthOptions["UseDeviceBrowser"] = options["UseDeviceBrowser"];
                             }
                             if (options && options[kony.sdk.constants.OAUTH_REDIRECT_SUCCESS_URL]) {
                                 //Validating to check the existence of param "success_url".
                                 // if found after login success we will redirect to the url specified in param "success_url".
                                 var success_url = options[kony.sdk.constants.OAUTH_REDIRECT_SUCCESS_URL];
                                 //Encoding is being done specifically for android because, in android kony.application.openUrl is not
                                 // opening the url without encoding where as in ios its encoding and opening.
                                 if (kony.sdk.getPlatformName() === kony.sdk.constants.PLATFORM_ANDROID) {
                                     //decoding and encoding, to handle the case where in the user himself is giving us the encoded value.
                                     success_url = encodeURIComponent(decodeURIComponent(options[kony.sdk.constants.OAUTH_REDIRECT_SUCCESS_URL]));
                                 }
                                 oauthOptions[kony.sdk.constants.OAUTH_REDIRECT_SUCCESS_URL] = success_url;
                             }
                         }
                         if (options && kony.sdk.util.isValidString(options[kony.sdk.constants.IE11_CROSS_DOMAIN_OAUTH_BASE_URL])) {
                             oauthOptions[kony.sdk.constants.IE11_CROSS_DOMAIN_OAUTH_BASE_URL] = options[kony.sdk.constants.IE11_CROSS_DOMAIN_OAUTH_BASE_URL];
                         }
                         OAuthHandler(_serviceUrl, _providerName, mainRef.appKey, loginHelper, _type, oauthOptions, isMFVersionCompatible);
                     }
                 }
             }
         }
     };
     /**
      * validateMfa validates the multi factor authentication parameters
      * @param {object} mfaParams- 2nd factor authentic param
      * @param {function} successCallback  - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      */
     this.validateMfa = function(mfaParams, successCallback, failureCallback, options) {
         kony.sdk.logsdk.debug("AuthService::validateMfa Invoked login for provider " + _providerName + " of type " + _type);

         function performValidateCall(urlMFA, params) {
             var headers = {};
             headers[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = konyRef.currentClaimToken;
             headers[kony.sdk.constants.APP_KEY_HEADER] = mainRef.appKey;
             headers[kony.sdk.constants.APP_SECRET_HEADER] = mainRef.appSecret;
             headers[kony.sdk.constants.SDK_TYPE_HEADER] = kony.sdk.getSdkType();
             headers[kony.sdk.constants.SDK_VERSION_HEADER] = kony.sdk.version;
             headers[kony.sdk.constants.PLATFORM_TYPE_HEADER] = kony.sdk.getPlatformName();
             headers[kony.sdk.constants.HTTP_REQUEST_HEADER_ACCEPT] = kony.sdk.constants.CONTENT_TYPE_JSON;
             headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
             populateHeaderWithFabricAppVersion(headers);
             if (konyRef.reportingheaders_allowed) {
                 headers[kony.sdk.constants.REPORTING_HEADER] = kony.sdk.getEncodedReportingParamsForSvcid("login_" + _providerName);
             }
             var endPointUrl = _serviceUrl + urlMFA + "?provider=" + _providerName;
             var networkOptions = kony.sdk.util.checkAndFetchNetworkProviderOptions(options);
             networkProvider.post(endPointUrl, params, headers, function(data) {
                 var response = processLoginSuccessResponse(data, konyRef, false);
                 kony.sdk.verifyAndCallClosure(successCallback, response);
             }, function(data) {
                 processLoginErrorResponse(data, konyRef, true, failureCallback)
             }, null, networkOptions);
         }
         if (kony.sdk.isNullOrUndefined(mfaParams)) {
             throw new Exception(kony.sdk.errorConstants.AUTH_FAILURE, " mfaParams are null");
         }
         var payload = {};
         payload["provider"] = _providerName;
         for (var key in mfaParams) {
             payload[key] = mfaParams[key];
         }
         if (!kony.sdk.isNullOrUndefined(konyRef.currentClaimToken) && !konyRef.isAnonymousProvider) {
             kony.sdk.claimsRefresh(function(res) {
                 performValidateCall("/login/MFA", payload)
             }, function(err) {
                 kony.sdk.logsdk.error("AuthService::validateMfa claimsRefresh failed, invoking failurecallback");
                 err.message = kony.sdk.errormessages.transient_login_fail;
                 err.opstatus = kony.sdk.errorcodes.transient_login_fail;
                 kony.sdk.verifyAndCallClosure(failureCallback, err);
             })
         } else {
             kony.sdk.logsdk.error("AuthService::validateMfa Claims token unavailable, please login");
             err.message = kony.sdk.errormessages.offline_auth_failed;
             err.opstatus = kony.sdk.errorcodes.offline_auth_failedl;
             kony.sdk.verifyAndCallClosure(failureCallback, err);
         }
     };
     /**
      * getMfaDetails functions lets the user to know whether 2factor security is enabled
      * @return {boolean}
      **/
     this.getMfaDetails = function() {
         var mfaDetails = {};
         mfaDetails[kony.sdk.constants.IS_MFA_ENABLED] = is_mfa_enabled;
         mfaDetails[kony.sdk.constants.MFA_META] = mfa_meta;
         return mfaDetails;
     };
     var processMultipleProvidersResponse = function(data, providerName) {
         if (data && data.profiles) {
             konyRef.isAnonymousProvider = false;
             for (var provider in data.profiles) {
                 if (!konyRef.tokens[provider]) {
                     konyRef.tokens[provider] = {};
                 }
                 konyRef.tokens[provider].profile = data.profiles[provider];
             }
         } else if (data && providerName && data.profile) {
             konyRef.isAnonymousProvider = false;
             konyRef.tokens[providerName].profile = data.profile;
         }
         if (data && data.provider_tokens) {
             for (var provider in data.provider_tokens) {
                 if (!konyRef.tokens[provider]) {
                     konyRef.tokens[provider] = {};
                 }
                 if (!konyRef.tokens[provider].provider_token) {
                     konyRef.tokens[provider].provider_token = {}
                 }
                 konyRef.tokens[provider].provider_token.value = data.provider_tokens[provider];
             }
         }
         if (data && providerName && data.provider_token) {
             konyRef.tokens[providerName].provider_token = data.provider_token;
         }
         konyRef.currentClaimToken = data.claims_token.value;
         konyRef.claimTokenExpiry = data.claims_token.exp;
         konyRef.currentRefreshToken = data.refresh_token;
         if (!konyRef.isAnonymousProvider && !kony.sdk.isNullOrUndefined(data.claims_token[kony.sdk.constants.IS_MFA_ENABLED])) {
             for (var providerPosition = 0; providerPosition < konyRef.login.length; providerPosition++) {
                 if (konyRef.login[providerPosition].prov === providerName) {
                     //we are doing this so that if user makes anoher identity object with same provider , is_mfa_enabled value can be available
                     konyRef.login[providerPosition][kony.sdk.constants.IS_MFA_ENABLED] = data.claims_token[kony.sdk.constants.IS_MFA_ENABLED];
                     konyRef.login[providerPosition][kony.sdk.constants.MFA_META] = data.claims_token[kony.sdk.constants.MFA_META];
                     var result = {};
                     result[kony.sdk.constants.IS_MFA_ENABLED] = data.claims_token[kony.sdk.constants.IS_MFA_ENABLED];
                     result[kony.sdk.constants.MFA_META] = data.claims_token[kony.sdk.constants.MFA_META];
                     return result;
                 }
             }
         }
     };
     var processLoginSuccessResponse = function(data, konyRef, isAsync, callBack) {
         kony.sdk.logsdk.trace("Entering processLoginSuccessResponse");
         data = kony.sdk.formatSuccessResponse(data);
         if (_type !== "anonymous" && !konyRef.tokens[_providerName]) {
             konyRef.tokens[_providerName] = {};
         }
         kony.sdk.logsdk.info("### AuthService::login successful. Retrieved Data::");
         processMultipleProvidersResponse(data, _providerName);
         kony.sdk.logsdk.info("### AuthService::login extracted token. Calling success callback");
         if (kony.sdk.sso.isSSOEnabled === true) {
             if (data.sso_token) {
                 var isSSOSaved = kony.sdk.util.saveSSOToken(kony.sdk.util.addOrUpdateSSOTokenWithProvider(data.sso_token, _providerName));
                 if (isSSOSaved === true) {
                     kony.sdk.isSSOLoginSuccess = true;
                     kony.sdk.logsdk.info("### SSOLoginService::SSOToken being saved successfully.");
                 } else {
                     kony.sdk.logsdk.info("### SSOLoginService::Failed to save SSOToken.This might result in failure of corresponding sso Logins. Please check the configuration params");
                 }
             } else {
                 kony.sdk.logsdk.info("### SSOLoginService::Unable to fetch sso token.");
             }
         }
         if (data.profile && data.profile != undefined && data.profile.user_attributes != undefined) {
             user_attributes = data.profile.user_attributes;
         }
         if (data.profile) {
             kony.sdk.overrideUserId(data.profile.userid);
         }
         if (kony.sdk.getPlatformName() !== kony.sdk.constants.PLATFORM_WINDOWS && kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_IDE) {
             //We store the user credentials and the success auth response only on successful online login.
             if (kony.sdk.offline.isOfflineEnabled === true) {
                 if (kony.sdk.isNetworkAvailable() && offlineEnabled && _type === "basic") {
                     kony.sdk.offline.updateSuccessUserCredentials(_providerName);
                 }
                 kony.sdk.offline.saveUserAuthInformation("authResponse", data);
             }
         }
         kony.logger.setClaimsToken();
         if (!isAsync) {
             return {};
         } else if (callBack) {
             kony.sdk.verifyAndCallClosure(callBack, {});
         }
     };
     var processLoginErrorResponse = function(data, konyRef, isAsync, callBack) {
         kony.sdk.logsdk.trace("Entering processLoginErrorResponse");
         kony.sdk.logsdk.info("### AuthService::login Calling failure callback");
         /*resetting all the token in case of error */
         resetAllCurrentTokens(konyRef, _providerName);
         if (kony.sdk.sso.isSSOEnabled === true) {
             if (data.mfcode == "Auth-55") {
                 kony.sdk.util.deleteSSOToken();
             }
             kony.sdk.isSSOLoginSuccess = false;
         }
         if (!isAsync) {
             return kony.sdk.error.getAuthErrObj(data);
         } else if (callBack) {
             callBack(kony.sdk.error.getAuthErrObj(data));
         }
     };
     /**
      * Login anonymous with the given credentials synchronously and executes the given callback.
      * @param {object} options - User name and password
      */
     this.anonymousLoginSync = function(options) {
         kony.sdk.logsdk.trace("Entering anonymousLoginSync");
         konyRef.isAnonymousProvider = false;
         var reportingData = kony.sdk.getEncodedReportingParamsForSvcid("login_" + _providerName);
         kony.sdk.logsdk.debug("### AuthService::login Invoked login for provider " + _providerName + " of type " + _type);
         if (typeof(options) == 'undefined') {
             throw new Exception(kony.sdk.errorConstants.AUTH_FAILURE, "Missing required number of arguments to login function");
         }

         function invokeAjaxCall(url, params, headers) {
             if (!headers) {
                 headers = {};
             }
             headers[kony.sdk.constants.APP_KEY_HEADER] = mainRef.appKey;
             headers[kony.sdk.constants.APP_SECRET_HEADER] = mainRef.appSecret;
             headers[kony.sdk.constants.HTTP_REQUEST_HEADER_ACCEPT] = kony.sdk.constants.CONTENT_TYPE_JSON;
             if (konyRef.reportingheaders_allowed) {
                 if (reportingData != null && reportingData != undefined) {
                     try {
                         headers[kony.sdk.constants.REPORTING_HEADER] = reportingData;
                     } catch (error) {
                         kony.sdk.logsdk.error("### anonymousLoginSync::error while parsing metrics payload" + error);
                     }
                 }
             }
             var endPointUrl = null;
             if (_type === "anonymous") {
                 endPointUrl = _serviceUrl + url;
             } else {
                 endPointUrl = _serviceUrl + url + "?provider=" + _providerName;
                 params["provider"] = _providerName;
             }
             var data = networkProvider.postSync(endPointUrl, params, headers);
             if (data.opstatus == 0) {
                 return processLoginSuccessResponse(data, konyRef, false);
             } else {
                 return processLoginErrorResponse(data, konyRef, false);
             }
         }
         konyRef.isAnonymousProvider = true;
         kony.sdk.logsdk.info("### AuthService::login Adapter type is anonymous");
         var headers = {};
         headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
         return invokeAjaxCall("/login", {}, headers);
     };
     /**
      * Logout and executes the given callback.
      * @param {function} successCallback  - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      * @param {object} options - additional options for logout
      */
     this.logout = function(successCallback, failureCallback, options) {
         kony.sdk.logsdk.trace("Entering logout");

         function logoutHandler() {
             _logout(successCallback, failureCallback, options);
         }
         if (kony.sdk.getPlatformName() !== kony.sdk.constants.PLATFORM_WINDOWS) {
             //if the user logged in using offline logout
             if (offlineEnabled == true && kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_IDE && _type === "basic" && !kony.sdk.isNetworkAvailable()) {
                 logoutHandler();
             } else {
                 kony.sdk.claimsRefresh(logoutHandler, failureCallback);
             }
         } else {
             kony.sdk.claimsRefresh(logoutHandler, failureCallback);
         }
     };

     function _logout(successCallback, failureCallback, options) {
         function invokeLogoutHelper(formData, invokeLogoutSuccess, invokeLogoutFailure) {
             var claimsTokenValue = null;
             var reportingData = kony.sdk.getEncodedReportingParamsForSvcid("logout_" + _providerName);
             if (!kony.sdk.isNullOrUndefined(konyRef.currentClaimToken)) {
                 claimsTokenValue = konyRef.currentClaimToken;
             }
             formdata.provider = _providerName;
             var url = "";
             if (_type == "oauth2" && kony.sdk.getSdkType() == kony.sdk.constants.SDK_TYPE_IDE) {
                 url = _serviceUrl + "/oauth2/logout?provider=" + _providerName;
             } else {
                 url = _serviceUrl + "/logout?provider=" + _providerName;
             }
             var headers = {};
             headers[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = claimsTokenValue;
             headers[kony.sdk.constants.HTTP_REQUEST_HEADER_ACCEPT] = "*/*";
             headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
             if (konyRef.reportingheaders_allowed) {
                 if (reportingData != null && reportingData != undefined) {
                     try {
                         headers[kony.sdk.constants.REPORTING_HEADER] = reportingData;
                     } catch (error) {
                         kony.sdk.logsdk.error("### login::error while parsing metrics payload" + error);
                     }
                 }
             }
             populateHeaderWithFabricAppVersion(headers);
             networkProvider.post(url, formdata, headers, function(data) {
                 kony.sdk.logsdk.info("AuthService::logout successfully logged out. Calling success callback");

                 function serviceDocCallback() {
                     logoutSuccess(data);
                     return;
                 }
                 getLatestServiceDocIfAvailable(data, serviceDocCallback);
             }, function(err) {
                 kony.sdk.logsdk.error("### AuthService::logout logged out Failed. Calling failure callback");
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getAuthErrObj(err));
             });
         }

         function logoutSuccess(data) {
             kony.sdk.logsdk.trace("Entering logoutSuccess");
             data = kony.sdk.formatSuccessResponse(data);
             delete konyRef.tokens[_providerName];
             //reset all current keys
             kony.sdk.resetCurrentKeys(konyRef, _providerName);
             //processing multiple profiles
             if (data && data.claims_token) {
                 processMultipleProvidersResponse(data);
                 konyRef.isAnonymousProvider = false;
             }
             if (slo === true) {
                 kony.sdk.util.deleteSSOTokenForProvider(_providerName);
             }
             kony.sdk.verifyAndCallClosure(successCallback, {});
         }
         kony.sdk.logsdk.debug("### AuthService::logout invoked on provider " + _providerName + " of type " + _type);
         var slo = false;
         if (!kony.sdk.isNullOrUndefined(options) && (options["slo"] === true || options["slo"] === false)) {
             slo = options["slo"];
         }
         var formdata = {};
         formdata = {
             "slo": slo
         };
         if (!isLoggedIn()) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getIdentitySessionInactiveErrObj());
         } else if (_type == "oauth2" && kony.sdk.getSdkType() == kony.sdk.constants.SDK_TYPE_IDE) {
             var callback_invoke = true;
             var oauth_status;

             function oAuthCallback(status) {
                 oauth_status = status;
                 //Workaround to get around redirects
                 if (callback_invoke) {
                     callback_invoke = false;
                     kony.timer.schedule("oAuthCallbackHandle", function() {
                         if (oauth_status) invokeLogoutHelper(formdata, logoutSuccess, failureCallback);
                         else kony.sdk.verifyAndCallClosure(failureCallback, {});
                     }, 3, false);
                 }
             }
             var oauthOptions = {};
             oauthOptions["logout"] = true;
             oauthOptions["slo"] = slo;
             if (kony.sdk.util.hasBrowserWidget(options)) {
                 oauthOptions[kony.sdk.constants.BROWSER_WIDGET] = options[kony.sdk.constants.BROWSER_WIDGET];
             }
             OAuthHandler(_serviceUrl, _providerName, mainRef.appKey, oAuthCallback, _type, oauthOptions);
         } else {
             if (kony.sdk.getPlatformName() !== kony.sdk.constants.PLATFORM_WINDOWS) {
                 //if the user logged in using offline login
                 if (kony.sdk.offline.isOfflineEnabled == true && kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_IDE && _type === "basic" && !kony.sdk.isNetworkAvailable()) {
                     kony.sdk.logsdk.info("AuthService::offline logout successfully logged out. Calling success callback");
                     logoutSuccess();
                     return;
                 }
             }
             invokeLogoutHelper(formdata, logoutSuccess, failureCallback);
         }
     }
     /**
      * Fetch the backend datasource token.
      * @param {boolean} fromserver - Flag to force fetch from server only.
      * @param {object} options - Options
      * @param {function} successCallback  - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      */
     this.getBackendToken = function(fromserver, options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering getBackendToken");

         function _claimsRefreshSuccess(token) {
             kony.sdk.logsdk.trace("Entering _claimsRefreshSuccess with valid token");
             processMultipleProvidersResponse(token);
             //konyRef.currentBackEndToken = token.provider_token;
             //if offline login enabled then updating the backend token in the store
             if (kony.sdk.getPlatformName() !== kony.sdk.constants.PLATFORM_WINDOWS && kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_IDE) {
                 if (kony.sdk.offline.isOfflineEnabled && kony.sdk.offline.isOfflineEnabled == true) {
                     kony.sdk.offline.updateAuthToken(token);
                 }
             }
             kony.sdk.verifyAndCallClosure(successCallback, konyRef.tokens[_providerName].provider_token);
         }

         function _claimsRefreshFailure(error) {
             kony.sdk.logsdk.trace("Entering _claimsRefreshFailure");
             kony.sdk.logsdk.info("### AuthService::getBackendToken fetching refresh failed. Calling failure callback");
             // konyRef.tokens[_providerName] = null;
             // konyRef.currentBackEndToken = null;
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getAuthErrObj(error));
         }
         kony.sdk.logsdk.debug("### AuthService::getBackendToken called for provider " + _providerName + " of type " + _type);
         if (!isLoggedIn()) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getIdentitySessionInactiveErrObj());
         }
         var claimsOptions = null;
         if (options && options.refresh && options.refresh === true) {
             claimsOptions = {
                 "requestParams": {
                     "refresh": "true"
                 }
             };
         }
         if (fromserver != undefined && fromserver === true) {
             kony.sdk.logsdk.info("### AuthService::getBackendToken fromserver is enabled. Trying to login");
             _claimsRefresh(claimsOptions, _claimsRefreshSuccess, _claimsRefreshFailure);
         } else {
             if (konyRef.tokens[_providerName]) {
                 var val = konyRef.tokens[_providerName];
                 var _exp = val.provider_token.exp;
                 kony.sdk.logsdk.debug("token expiry time: " + _exp);
                 kony.sdk.logsdk.debug("Current time: " + (new Date().getTime()));
                 if (_exp && _exp < (new Date().getTime())) {
                     kony.sdk.logsdk.info("### AuthService::getBackendToken Token expired. Fetching refresh from claims api");
                     _claimsRefresh(claimsOptions, _claimsRefreshSuccess, _claimsRefreshFailure);
                 } else {
                     kony.sdk.logsdk.info("### AuthService::getBackendToken present token is valid/doesn't have expiry time. Calling success callback");
                     //konyRef.currentBackEndToken = val.provider_token;
                     kony.sdk.verifyAndCallClosure(successCallback, konyRef.tokens[_providerName].provider_token);
                 }
             } else {
                 kony.sdk.logsdk.info("### AuthService::getBackendToken failed for find info for key " + dsKey + "in database. calling failure callback");
                 kony.sdk.verifyAndCallClosure(failureCallback, null);
             }
         }
     };
     /**
      * Get profile.
      * @param {boolean} fromserver - Flag to force fetch from server only.
      * @param {function} successCallback  - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      */
     this.getProfile = function(fromserver, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering getProfile");
         if (!isLoggedIn()) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getIdentitySessionInactiveErrObj());
         } else if (fromserver && fromserver == true) {
             profileRefresh(function(token) {
                 konyRef.tokens[_providerName].profile = token;
                 kony.sdk.verifyAndCallClosure(successCallback, token);
             }, failureCallback)
         } else {
             if (konyRef.tokens[_providerName]) {
                 var val = konyRef.tokens[_providerName];
                 kony.sdk.verifyAndCallClosure(successCallback, val.profile);
             } else {
                 kony.sdk.verifyAndCallClosure(failureCallback, null);
             }
         }
     };
     /**
      * Get the provider name.
      * @returns {string} Provider name.
      */
     this.getProviderName = function() {
         return _providerName;
     };
     /**
      * Get the provider type.
      * @returns {string} Provider type.
      */
     this.getProviderType = function() {
         return _type;
     };
     /**
      * Get the generic session data type.
      * @returns {string} session data.
      */
     this.getUserData = function(successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering getUserData (Get the generic session data type)");
         if (!isLoggedIn()) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getIdentitySessionInactiveErrObj());
         } else {
             var userDataUrl = _serviceUrl + "/session/user_data";
             var options = {};
             options["invokedFrom"] = kony.sdk.constants.GET_USER_DATA;
             getSessionData(userDataUrl, successCallback, failureCallback, options);
         }
     };
     /**
      * Get the user attributes returned by a provider
      * @returns {string} user attributes.
      */
     this.getUserAttributes = function(successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering getUserAttributes");
         if (!isLoggedIn()) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getIdentitySessionInactiveErrObj());
         } else if (user_attributes && Object.keys(user_attributes).length === 0) {
             var userAttributesUrl = _serviceUrl + "/session/user_attributes?provider=" + _providerName;
             var options = {};
             options["invokedFrom"] = kony.sdk.constants.GET_USER_ATTRIBUTES;
             getSessionData(userAttributesUrl, function(res) {
                 user_attributes = res;
                 kony.sdk.verifyAndCallClosure(successCallback, user_attributes);
             }, failureCallback, options);
         } else {
             if (konyRef.currentClaimToken === null) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getNullClaimsTokenErrObj());
             } else {
                 kony.sdk.verifyAndCallClosure(successCallback, user_attributes);
             }
         }
     };
     /**
      * Get the security attributes returned by a provider
      * @returns {string} security attributes.
      */
     this.getSecurityAttributes = function(successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering getSecurityAttributes");
         if (!isLoggedIn()) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getIdentitySessionInactiveErrObj());
         } else {
             var securityAttributesUrl = _serviceUrl + "/session/security_attributes?provider=" + _providerName;
             var options = {};
             options["invokedFrom"] = kony.sdk.constants.GET_SECURITY_ATTRIBUTES;
             getSessionData(securityAttributesUrl, successCallback, failureCallback, options);
         }
     };
     /**
     	utility method to get session data
     	@private
     */
     var getSessionData = function(sessionAttributesEndPointUrl, successCallback, failureCallback, options) {
         var svcid = null;
         if (options["invokedFrom"] == kony.sdk.constants.GET_USER_ATTRIBUTES) {
             svcid = kony.sdk.constants.GET_USER_ATTRIBUTES;
         } else if (options["invokedFrom"] == kony.sdk.constants.GET_SECURITY_ATTRIBUTES) {
             svcid = kony.sdk.constants.GET_SECURITY_ATTRIBUTES;
         } else {
             svcid = kony.sdk.constants.GET_USER_DATA;
         }
         var reportingData = kony.sdk.getEncodedReportingParamsForSvcid(svcid);
         if (konyRef.currentClaimToken === null) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getNullClaimsTokenErrObj());
         } else {
             var headers = {};
             headers[kony.sdk.constants.AUTHORIZATION_HEADER] = konyRef.currentClaimToken;
             if (konyRef.reportingheaders_allowed) {
                 if (reportingData != null && reportingData != undefined) {
                     try {
                         headers[kony.sdk.constants.REPORTING_HEADER] = reportingData;
                     } catch (error) {
                         kony.sdk.logsdk.error("### getSessionData::error while parsing metrics payload" + error);
                     }
                 }
             }
             populateHeaderWithFabricAppVersion(headers);
             networkProvider.get(sessionAttributesEndPointUrl, {}, headers, function(data) {
                 data = kony.sdk.formatSuccessResponse(data);
                 kony.sdk.verifyAndCallClosure(successCallback, data);
             }, function(err) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getAuthErrObj(err));
             });
         }
     };
     /**
      * Method to refresh the claims token.
      * @private
      */
     var _claimsRefresh = function(options, success, failure) {
         kony.sdk.logsdk.debug("### AuthService::_claimsRefresh fetching claims from server for provider " + _providerName);
         var refreshToken = null;
         var reportingData = kony.sdk.getEncodedReportingParamsForSvcid(kony.sdk.constants.GET_BACKEND_TOKEN);
         if (!kony.sdk.isNullOrUndefined(konyRef.currentRefreshToken)) {
             refreshToken = konyRef.currentRefreshToken;
         }
         var _url = _serviceUrl + "/claims";
         if (options && options.requestParams != null) {
             _url = _url + "?";
             for (var i in options.requestParams) {
                 if (options.requestParams.hasOwnProperty(i) && typeof(i) !== 'function') {
                     _url = _url + (i + "=" + options.requestParams[i] + "&");
                 }
             }
             _url = stripTrailingCharacter(_url, "&");
         }
         if (refreshToken) {
             kony.sdk.logsdk.info("### AuthService::_claimsRefresh making POST request to claims endpoint");
             var headers = {};
             headers[kony.sdk.constants.AUTHORIZATION_HEADER] = refreshToken;
             headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
             if (konyRef.reportingheaders_allowed) {
                 if (reportingData != null && reportingData != undefined) {
                     try {
                         headers[kony.sdk.constants.REPORTING_HEADER] = reportingData;
                     } catch (error) {
                         kony.sdk.logsdk.error("### _claimsRefresh::error while parsing metrics payload" + error);
                     }
                 }
             }
             populateHeaderWithFabricAppVersion(headers);
             networkProvider.post(_url, {}, headers, function(data) {
                 data = kony.sdk.formatSuccessResponse(data);
                 kony.sdk.logsdk.info("### AuthService::_claimsRefresh Fetching claims succcessfull");
                 processMultipleProvidersResponse(data);
                 kony.sdk.logsdk.info("### AuthService::_claimsRefresh saved locally. Calling success callback");
                 kony.sdk.verifyAndCallClosure(success, data);
             }, function(xhr, status, err) {
                 kony.sdk.logsdk.error("### AuthService::_claimsRefresh fetching claims failed. Calling failure callback");
                 kony.sdk.verifyAndCallClosure(failure, kony.sdk.error.getAuthErrObj(err));
             });
         } else {
             kony.sdk.logsdk.info("### AuthService::_claimsRefresh no refreshtoken found. calling failure callback");
             kony.sdk.verifyAndCallClosure(failure, kony.sdk.error.getNullRefreshTokenErrObj());
         }
     };
     var profileRefresh = function(success, failure) {
         kony.sdk.logsdk.trace("Entering profileRefresh");
         kony.sdk.logsdk.debug("### AuthService::profileRefresh fetching profile from server for provider " + _providerName);
         var reportingData = kony.sdk.getEncodedReportingParamsForSvcid(kony.sdk.constants.GET_PROFILE);
         var refreshToken = null;
         if (!kony.sdk.isNullOrUndefined(konyRef.currentRefreshToken)) {
             refreshToken = konyRef.currentRefreshToken;
         }
         var _url = _serviceUrl + "/profile?provider=" + _providerName;
         if (refreshToken) {
             kony.sdk.logsdk.info("### AuthService::profileRefresh making POST request to profile endpoint");
             var headers = {};
             headers[kony.sdk.constants.AUTHORIZATION_HEADER] = refreshToken;
             headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
             if (konyRef.reportingheaders_allowed) {
                 if (reportingData != null && reportingData != undefined) {
                     try {
                         headers[kony.sdk.constants.REPORTING_HEADER] = reportingData;
                     } catch (error) {
                         kony.sdk.logsdk.error("### profileRefresh::error while parsing metrics payload" + error);
                     }
                 }
             }
             populateHeaderWithFabricAppVersion(headers);
             networkProvider.get(_url, null, headers, function(data) {
                 data = kony.sdk.formatSuccessResponse(data);
                 konyRef.tokens[_providerName].profile = data;
                 kony.sdk.logsdk.info("### AuthService::profileRefresh Fetching profile succcessfull, Calling success callback");
                 kony.sdk.verifyAndCallClosure(success, data);
             }, function(xhr, status, err) {
                 kony.sdk.logsdk.error("### AuthService::profileRefresh fetching profile failed. Calling failure callback");
                 kony.sdk.verifyAndCallClosure(failure, kony.sdk.error.getAuthErrObj(err));
             });
         } else {
             kony.sdk.logsdk.info("### AuthService::profileRefresh no refreshtoken found. calling failure callback");
             kony.sdk.verifyAndCallClosure(failure, kony.sdk.error.getNullRefreshTokenErrObj());
         }
     };
 }

 function konySdkLogger() {
     this.INDIRECTIONLEVEL = 1;
     this.trace = function(msg, params) {
         this.getInstance().trace(msg, params);
     };
     this.debug = function(msg, params) {
         this.getInstance().debug(msg, params);
     };
     this.info = function(msg, params) {
         this.getInstance().info(msg, params);
     };
     this.perf = function(msg, params) {
         this.getInstance().perf(msg, params);
     };
     this.warn = function(msg, params) {
         this.getInstance().warn(msg, params);
     };
     this.error = function(msg, params) {
         this.getInstance().error(msg, params);
     };
     this.fatal = function(msg, params) {
         this.getInstance().fatal(msg, params);
     };
     this.loggerEngineInit = function() {
         KonySDKLoggerObj = kony.logger.createNewLogger(kony.sdk.constants.LOGGER_NAME, null);
         KonySDKLoggerObj.setIndirectionLevel = this.INDIRECTIONLEVEL;
     };
     this.getInstance = function() {
         if (typeof(KonySDKLoggerObj) === 'undefined') this.loggerEngineInit();
         return KonySDKLoggerObj;
     }
 }
 /**
  * Method to create the logic service instance with the provided service name.
  * @param {string} serviceName - Name of the service
  * @returns The url to connect to the logic service
  * @throws Exception if the serviceName or access is invalid.
  */
 kony.sdk.prototype.getLogicService = function(serviceName) {
     if (!kony.sdk.isInitialized) {
         throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, kony.sdk.constants.INIT_FAILURE_MESSAGE + " Logic service - " + serviceName);
     }
     if (this.logicsvc != null) {
         if (this.logicsvc[serviceName] != null) {
             kony.sdk.logsdk.debug("### getLogicService::found Logic service" + this.logicsvc[serviceName]);
             return new kony.sdk.LogicService(this, serviceName);
         }
     }
     throw new Exception(kony.sdk.errorConstants.LOGIC_SERVICE_FAILURE, "Invalid serviceName:" + serviceName);
 };
 kony.sdk.LogicService = function(konyRef, serviceName) {
     this.konyRef = konyRef;
     this.serviceName = serviceName;
     this.logicServiceUrl = null;
     this.getLogicServiceUrl = function() {
         if (this.logicServiceUrl == null) {
             this.logicServiceUrl = stripTrailingCharacter(konyRef.logicsvc[serviceName], "/");
         }
         return this.logicServiceUrl;
     };
     kony.sdk.logsdk.info(" ###LogicService Created & LogicService Url = " + this.getLogicServiceUrl());
     var networkProvider = new konyNetworkProvider();
     this.invokeOperation = function(serviceName, path, methodType, headers, data, successCallback, failureCallback, options) {
         function invokeOperationHandler() {
             _invokeOperation(serviceName, path, methodType, headers, data, true, successCallback, failureCallback, options);
         }
         kony.sdk.claimsRefresh(invokeOperationHandler, failureCallback);
     };

     function invokeOperationRetry(serviceName, path, methodType, headers, data, successCallback, failureCallback, options) {
         function invokeOperationRetryHandler() {
             _invokeOperation(serviceName, path, methodType, headers, data, false, successCallback, failureCallback, options);
         }
         kony.sdk.claimsAndProviderTokenRefresh(invokeOperationRetryHandler, failureCallback);
     }

     function retryServiceCall(errorResponse) {
         if (errorResponse[kony.sdk.constants.MF_CODE]) {
             // check for the mf code for which,
             // retry should be done.
         } else {
             if (errorResponse[kony.sdk.constants.HTTP_STATUS_CODE] && errorResponse[kony.sdk.constants.HTTP_STATUS_CODE] === 401) {
                 return true;
             }
         }
     }

     function _invokeOperation(serviceName, path, methodType, headers, data, isRetryNeeded, successCallback, failureCallback, options) {
         var requestData = {};
         kony.sdk.logsdk.trace("Entered into _invokeOperation servicePath: " + serviceName + ", methodType: " + methodType + ", path" + path + ", isRetryNeeded: " + isRetryNeeded);
         var reportingData = kony.sdk.getPayload(konyRef);
         var sessionId = kony.ds.read(kony.sdk.constants.KONYUUID);
         if (sessionId) {
             reportingData.rsid = sessionId[0];
         }
         if (!reportingData.rsid) {
             kony.sdk.logsdk.warn("rsid is either empty,null or undefined");
         }
         if (kony.sdk.metric) {
             if (kony.sdk.metric.reportEventBufferBackupArray.length === 0) {
                 kony.sdk.metric.readFromDS();
             }
             kony.sdk.metric.pushEventsToBufferArray();
             requestData.events = kony.sdk.metric.reportEventBufferBackupArray;
         }
         for (var key in data) {
             requestData[key] = data[key];
         }
         reportingData.svcid = serviceName;
         requestData[kony.sdk.constants.REPORTING_PARAMS] = JSON.stringify(reportingData);
         var defaultHeaders = {};
         defaultHeaders[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
         defaultHeaders[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = konyRef.currentClaimToken;
         if (typeof(svcObj) === 'object' && svcObj.version) {
             defaultHeaders[kony.sdk.constants.API_VERSION_HEADER] = svcObj.version;
         }
         // if the user has defined his own headers, use them
         if (headers) {
             for (var header in headers) {
                 defaultHeaders[header] = headers[header];
             }
         }

         function networkSuccessCallback(response) {
             if (kony.sdk.metric) {
                 kony.sdk.metric.clearBufferEvents();
             }
             kony.sdk.verifyAndCallClosure(successCallback, response);
         }

         function networkFailureCallback(xhr, status, err) {
             if (isRetryNeeded === true && retryServiceCall(xhr) === true) {
                 invokeOperationRetry(serviceName, path, methodType, headers, data, successCallback, failureCallback, options);
                 return;
             }
             kony.sdk.processLogicErrorResponse(xhr, true, failureCallback);
         }
         switch (methodType) {
             case "GET":
                 networkProvider.get(konyRef.logicsvc[serviceName] + path, requestData, defaultHeaders, networkSuccessCallback, networkFailureCallback, null, options);
                 break;
             case "PUT":
                 networkProvider.put(konyRef.logicsvc[serviceName] + path, requestData, defaultHeaders, networkSuccessCallback, networkFailureCallback, null, options);
                 break;
             case "DELETE":
                 networkProvider.invokeDeleteRequest(konyRef.logicsvc[serviceName] + path, requestData, defaultHeaders, networkSuccessCallback, networkFailureCallback, null, options);
                 break;
             default:
                 networkProvider.post(konyRef.logicsvc[serviceName] + path, requestData, defaultHeaders, networkSuccessCallback, networkFailureCallback, null, options);
                 break;
         }
     }
     kony.sdk.processLogicErrorResponse = function(err, isAsync, callBack) {
         if (kony.sdk.metric) {
             if (kony.sdk.metric.errorCodeMap[err.opstatus]) {
                 kony.sdk.metric.saveInDS();
             }
         }
         if (err[kony.sdk.constants.MF_CODE]) {
             var konyRef = kony.sdk.getCurrentInstance();
             //clear the cache if the error code related to session/token expiry
             if (kony.sdk.isSessionOrTokenExpired(err[kony.sdk.constants.MF_CODE])) {
                 kony.sdk.logsdk.warn("###LogicService::invokeOperationFailure  Session/Token expired. Authenticate and Try again");
                 //kony.sdk.resetCacheKeys(konyRef);
             }
         }
         if (!isAsync) {
             return kony.sdk.error.getLogicErrObj(err);
         } else if (callBack) {
             kony.sdk.verifyAndCallClosure(callBack, kony.sdk.error.getLogicErrObj(err));
         }
     };
 };
 kony.sdk.prototype.registerObjectService = function(objectServiceType, objectServiceClass) {
     kony.sdk.logsdk.trace("Entering kony.sdk.prototype.registerObjectService");
     kony.sdk.registeredobjsvcs = kony.sdk.registeredobjsvcs || {};
     kony.sdk.registeredobjsvcs[objectServiceType] = objectServiceClass;
 };
 /**
  * Method to create the object service instance with the provided service name.
  * @param {string} serviceName - Name of the service
  * @param {map} options - Map of key values like {"access":"offline"/"online"/"registered Object Service Name"}
  * @returns {@link kony.sdk.OnlineObjectService / @link kony.sdk.OfflineObjectService} Object service instance
  * @throws Exception if the serviceName or access is invalid.
  */
 kony.sdk.prototype.getObjectService = function(serviceName, options) {
     kony.sdk.logsdk.trace("Entering kony.sdk.prototype.getObjectService");
     if (!kony.sdk.isInitialized) {
         throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, kony.sdk.constants.INIT_FAILURE_MESSAGE + " Object service - " + serviceName);
     }
     var access;
     if (!kony.sdk.isNullOrUndefined(options)) {
         access = options["access"];
     }
     if (this.objectsvc != null && this.objectsvc[serviceName] != null) {
         kony.sdk.logsdk.debug("### getObjectService::found Object service" + this.objectsvc[serviceName]);
         if (kony.sdk.util.isNullOrEmptyString(access) || access.toLowerCase() === "online") {
             return new kony.sdk.OnlineObjectService(this, serviceName, this.objectsvc[serviceName]);
         } else if (access.toLowerCase() === "offline") {
             //This returns SyncV1 object service
             return new kony.sdk.OfflineObjectService(this, serviceName);
         }
     } else if (this.offlineObjectsvc != null) {
         if (this.offlineObjectsvc[serviceName] != null) {
             if (kony.sdk.util.isNullOrEmptyString(access) || access.toLowerCase() === "online") {
                 // This returns Online Object Service Instance
                 return new kony.sdk.OnlineObjectService(this, serviceName, this.offlineObjectsvc[serviceName]);
             } else if (access.toLowerCase() === "offline") {
                 //This returns Offline Enabled or SyncV2 object service
                 return new kony.sdk.OfflineEnabledObjectService(this, serviceName);
             }
         }
     }
     kony.sdk.registeredobjsvcs = kony.sdk.registeredobjsvcs || {};
     //verifying if the servicetype available in registeredservices if available initialize and return
     if (kony.sdk.registeredobjsvcs[access] != null && kony.sdk.registeredobjsvcs[access] != undefined) {
         return new kony.sdk.registeredobjsvcs[access](this, serviceName);
     }
     throw new Exception(kony.sdk.errorConstants.OBJECT_FAILURE, "Invalid serviceName:" + serviceName + "or access type:" + access);
 };
 /**
  * Method which returns the online ObjectService object
  * @param konyRef
  * @param serviceName
  * @constructor
  */
 kony.sdk.OnlineObjectService = function(konyRef, serviceName, serviceInfo) {
     kony.sdk.logsdk.trace("Entering kony.sdk.OnlineObjectService");
     this.konyRef = konyRef;
     this.serviceName = serviceName;
     this.serviceInfo = serviceInfo;
     this.dataUrl = null;
     this.binaryUrl = null;
     this.fileStorageObjectServiceUrl = null;
     this.operationsUrl = null;
     this.metadataUrl = null;
     this.version = null;
     var currentObject = this;
     /**
      * This method is used to create a record on the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject),"headers":<map of http headers>}
      * @param successCallback
      * @param failureCallback
      */
     this.create = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OnlineObjectService.create");
         if (options == null || options == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         if (!(options["dataObject"] instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         if (!(options["queryParams"] == null || options["queryParams"] == undefined)) {
             if (!(options["queryParams"] instanceof Object)) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_queryparams_instance, kony.sdk.errormessages.invalid_queryparams_instance));
             }
         }
         var tmpDataUrl = this.getDataUrl();
         var objName = options["dataObject"].objectName;

         function createOperationHandler() {
             currentObject.getMetadataOfObject(objName, {}, function(result) {
                 _create(options, tmpDataUrl, successCallback, failureCallback);
             }, function(error) {
                 kony.sdk.logsdk.error("### OnlineObjectService::create Error:", error);
                 kony.sdk.verifyAndCallClosure(failureCallback, error);
             });
         }
         if (kony.sdk.skipAnonymousCall) {
             createOperationHandler();
         } else {
             kony.sdk.claimsRefresh(createOperationHandler, failureCallback);
         }
     };
     /**
      * This method is used to fetch a record on the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject),"headers":<map of http headers>}
      * @param successCallback
      * @param failureCallback
      */
     this.fetch = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OnlineObjectService.fetch");
         if (options == null || options == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         if (!(options["dataObject"] instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         if (!(options["queryParams"] == null || options["queryParams"] == undefined)) {
             if (!(options["queryParams"] instanceof Object)) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_queryparams_instance, kony.sdk.errormessages.invalid_queryparams_instance));
             }
         }
         var tmpDataUrl = this.getDataUrl();
         var objName = options["dataObject"].objectName;

         function fetchOperationHandler() {
             currentObject.getMetadataOfObject(objName, {}, function(result) {
                 _fetch(options, tmpDataUrl, successCallback, failureCallback);
             }, function(error) {
                 kony.sdk.logsdk.error("### OnlineObjectService::fetch Error:", error);
                 kony.sdk.verifyAndCallClosure(failureCallback, error);
             });
         }
         if (kony.sdk.skipAnonymousCall) {
             fetchOperationHandler();
         } else {
             kony.sdk.claimsRefresh(fetchOperationHandler, failureCallback);
         }
     };
     /**
      * This method is used to update a record on the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject),"headers":<map of http headers>}
      * @param successCallback
      * @param failureCallback
      */
     this.update = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OnlineObjectService.update");
         if (options == null || options == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         if (!(options["dataObject"] instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         if (!(options["queryParams"] == null || options["queryParams"] == undefined)) {
             if (!(options["queryParams"] instanceof Object)) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_queryparams_instance, kony.sdk.errormessages.invalid_queryparams_instance));
                 return;
             }
         }
         var tmpDataUrl = this.getDataUrl();
         var objName = options["dataObject"].objectName;

         function updateOperationHandler() {
             currentObject.getMetadataOfObject(objName, {}, function(result) {
                 _update(options, tmpDataUrl, successCallback, failureCallback);
             }, function(error) {
                 kony.sdk.logsdk.error("### OnlineObjectService::update Error:", error);
                 kony.sdk.verifyAndCallClosure(failureCallback, error);
             });
         }
         if (kony.sdk.skipAnonymousCall) {
             updateOperationHandler();
         } else {
             kony.sdk.claimsRefresh(updateOperationHandler, failureCallback);
         }
     };
     /**
      * This method is used to partial update a record on the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject),"headers":<map of http headers>}
      * @param successCallback
      * @param failureCallback
      */
     this.partialUpdate = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OnlineObjectService.partialUpdate");
         if (options == null || options == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         if (!(options["dataObject"] instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         if (!(options["queryParams"] == null || options["queryParams"] == undefined)) {
             if (!(options["queryParams"] instanceof Object)) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_queryparams_instance, kony.sdk.errormessages.invalid_queryparams_instance));
                 return;
             }
         }
         var tmpDataUrl = this.getDataUrl();
         var objName = options["dataObject"].objectName;

         function partialUpdateOperationHandler() {
             currentObject.getMetadataOfObject(objName, {}, function(result) {
                 _partialUpdate(options, tmpDataUrl, successCallback, failureCallback);
             }, function(error) {
                 kony.sdk.logsdk.error("### OnlineObjectService::partialUpdate Error:", error);
                 kony.sdk.verifyAndCallClosure(failureCallback, error);
             });
         }
         if (kony.sdk.skipAnonymousCall) {
             partialUpdateOperationHandler();
         } else {
             kony.sdk.claimsRefresh(partialUpdateOperationHandler, failureCallback);
         }
     };
     /**
      * This method is used to delete a record on the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject),"headers":<map of http headers>}
      * @param successCallback
      * @param failureCallback
      */
     this.deleteRecord = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OnlineObjectService.deleteRecord");
         if (options == null || options == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         if (!(options["dataObject"] instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         if (!(options["queryParams"] == null || options["queryParams"] == undefined)) {
             if (!(options["queryParams"] instanceof Object)) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_queryparams_instance, kony.sdk.errormessages.invalid_queryparams_instance));
                 return;
             }
         }
         var tmpDataUrl = this.getDataUrl();
         var objName = options["dataObject"].objectName;

         function deleteOperationHandler() {
             currentObject.getMetadataOfObject(objName, {}, function(result) {
                 _deleteRecord(options, tmpDataUrl, successCallback, failureCallback);
             }, function(error) {
                 kony.sdk.logsdk.error("### OnlineObjectService::delete Error:", error);
                 kony.sdk.verifyAndCallClosure(failureCallback, error);
             });
         }
         if (kony.sdk.skipAnonymousCall) {
             deleteOperationHandler();
         } else {
             kony.sdk.claimsRefresh(deleteOperationHandler, failureCallback);
         }
     };
     /**
      * This method is used to for performing custom operation
      * @param {string} verbName -  custom verb identifier
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject),"headers":<map of http headers>}
      * @param successCallback
      * @param failureCallback
      */
     this.customVerb = function(verbName, options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OnlineObjectService.customVerb");
         if (verbName == null || verbName == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "verbName" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         if (options == null || options == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         if (!(options["dataObject"] instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         if (!(options["queryParams"] == null || options["queryParams"] == undefined)) {
             if (!(options["queryParams"] instanceof Object)) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_queryparams_instance, kony.sdk.errormessages.invalid_queryparams_instance));
                 return;
             }
         }
         var tmpDataUrl = this.getOperationsUrl();
         var objName = options["dataObject"].objectName;

         function customVerbHandler() {
             currentObject.getMetadataOfObject(objName, {}, function(result) {
                 _customverb(verbName, options, tmpDataUrl, successCallback, failureCallback);
             }, function(error) {
                 kony.sdk.logsdk.error("### OnlineObjectService::customverb Error:", error);
                 kony.sdk.verifyAndCallClosure(failureCallback, error);
             });
         }
         if (kony.sdk.skipAnonymousCall) {
             customVerbHandler();
         } else {
             kony.sdk.claimsRefresh(customVerbHandler, failureCallback);
         }
     };
     /**
      * This method is used to retrive metadata of all objects
      * @param {map} options - includes {"getFromServer":boolean,"headers":<map of http headers>}
      * @param successCallback
      * @param failureCallback
      */
     this.getMetadataOfAllObjects = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OnlineObjectService.getMetadataOfAllObjects");
         _getMetadataForObjectsOrServiceOnlineUtil(konyRef, serviceName, null, options, successCallback, failureCallback);
         kony.sdk.logsdk.trace("Exiting kony.sdk.OnlineObjectService.getMetadataOfAllObjects");
     };
     /**
      * This method is used to retrive metadata of a specific object
      * @param objectName
      * @param {map} options - includes {"getFromServer":boolean,"headers":<map of http headers>}
      * @param successCallback
      * @param failureCallback
      */
     this.getMetadataOfObject = function(objectName, options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OnlineObjectService.getMetadataOfObject");
         _getMetadataForObjectsOrServiceOnlineUtil(konyRef, serviceName, objectName, options, successCallback, failureCallback);
         kony.sdk.logsdk.trace("Exiting kony.sdk.OnlineObjectService.getMetadataOfObject");
     };
     this.getDataUrl = function() {
         if (kony.sdk.isNullOrUndefined(currentObject.dataUrl)) {
             currentObject.dataUrl = encodeURI(stripTrailingCharacter(currentObject.serviceInfo["url"] + "/objects/", "/"));
         }
         return currentObject.dataUrl;
     };
     this.getFileStorageObjectServiceUrl = function() {
         if (kony.sdk.isNullOrUndefined(currentObject.fileStorageObjectServiceUrl)) {
             currentObject.fileStorageObjectServiceUrl = encodeURI(stripTrailingCharacter(currentObject.serviceInfo["url"], "/"));
         }
         return currentObject.fileStorageObjectServiceUrl;
     };
     this.getBinaryUrl = function() {
         if (kony.sdk.isNullOrUndefined(currentObject.binaryUrl)) {
             currentObject.binaryUrl = encodeURI(stripTrailingCharacter(currentObject.serviceInfo["url"] + "/binary/", "/"));
         }
         return currentObject.binaryUrl;
     };
     this.getOperationsUrl = function() {
         if (kony.sdk.isNullOrUndefined(currentObject.operationsUrl)) {
             currentObject.operationsUrl = encodeURI(stripTrailingCharacter(currentObject.serviceInfo["url"] + "/operations/", "/"));
         }
         return currentObject.operationsUrl;
     };
     this.getMetadataUrl = function() {
         if (kony.sdk.isNullOrUndefined(currentObject.metadataUrl)) {
             currentObject.metadataUrl = encodeURI(stripTrailingCharacter(currentObject.serviceInfo["metadata_url"], "/"));
         }
         return currentObject.metadataUrl;
     };
     this.getVersion = function() {
         if (kony.sdk.isNullOrUndefined(currentObject.version)) {
             currentObject.version = currentObject.serviceInfo["version"];
         }
         return currentObject.version;
     };
     /*
      *  API for uploading binary data (either file or raw bytes) to backend
      */
     this.uploadBinaryData = function(options, onFileUploadStartedCallback, onChunkUploadCompletedCallback, onFileUploadCompletedCallback, onFileUploadFailureCallback) {
         var fileUploadStartedCallback = null;
         var chunkUploadCompletedCallback = null;
         var fileUploadCompletedCallback = null;
         var fileUploadFailureCallback = null;
         var uploadParams = null;
         /* validations for callbacks */
         // validation for onFileUploadStartedCallback
         if (kony.sdk.isNullOrUndefined(onFileUploadStartedCallback) || (typeof(onFileUploadStartedCallback) !== 'function')) {
             kony.sdk.logsdk.warn("### OnlineObjectService::uploadBinaryData onFileUploadStartedCallback is null or undefined or not a function");
         } else {
             fileUploadStartedCallback = onFileUploadStartedCallback;
         }
         // validation for onChunkUploadCompletedCallback
         if (kony.sdk.isNullOrUndefined(onChunkUploadCompletedCallback) || (typeof(onChunkUploadCompletedCallback) !== 'function')) {
             kony.sdk.logsdk.warn("### OnlineObjectService::uploadBinaryData onChunkUploadCompletedCallback is null or undefined or not a function");
         } else {
             chunkUploadCompletedCallback = onChunkUploadCompletedCallback;
         }
         // validation for onFileUploadCompletedCallback
         if (kony.sdk.isNullOrUndefined(onFileUploadCompletedCallback) || (typeof(onFileUploadCompletedCallback) !== 'function')) {
             kony.sdk.logsdk.warn("### OnlineObjectService::uploadBinaryData onFileUploadCompletedCallback is null or undefined or not a function");
         } else {
             fileUploadCompletedCallback = onFileUploadCompletedCallback;
         }
         // validation for onFileUploadFailureCallback
         if (kony.sdk.isNullOrUndefined(onFileUploadFailureCallback) || (typeof(onFileUploadFailureCallback) !== 'function')) {
             kony.sdk.logsdk.warn("### OnlineObjectService::uploadBinaryData onFileUploadFailureCallback is null or undefined or not a function");
         } else {
             fileUploadFailureCallback = onFileUploadFailureCallback;
         }
         // validation for options
         if (kony.sdk.isNullOrUndefined(options)) {
             kony.sdk.logsdk.error("### OnlineObjectService::uploadBinaryData options is null or undefined");
             kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options " + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         var dataObject = options["dataObject"];
         if (kony.sdk.isNullOrUndefined(dataObject)) {
             kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         if (!(dataObject instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         var objName = dataObject.getObjectName();
         var mfEndpointUrl = this.getDataUrl() + "/" + objName;
         if (kony.sdk.isNullOrUndefined(dataObject.getRecord())) {
             kony.sdk.logsdk.error("### OnlineObjectService::uploadBinaryData Error: Please provide record to upload Binary content.");
             kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
             return;
         }
         uploadParams = dataObject.getRecord();
         var errorObj = kony.sdk.binary.validateUploadParams(uploadParams);
         if (errorObj) {
             kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, errorObj);
             return;
         }
         // if rawbytes are provided, converting to base64 string as FFI can only receive base datatypes
         if (!kony.sdk.isNullOrUndefined(uploadParams[kony.sdk.constants.RAW_BYTES])) {
             var base64String = kony.convertToBase64(uploadParams[kony.sdk.constants.RAW_BYTES]);
             uploadParams[kony.sdk.constants.RAW_BYTES] = base64String;
         }

         function uploadBinaryDataOperationHandler() {
             currentObject.getMetadataOfObject(objName, {}, function(response) {
                 _uploadBinaryData(mfEndpointUrl, uploadParams, fileUploadStartedCallback, chunkUploadCompletedCallback, fileUploadCompletedCallback, fileUploadFailureCallback);
             }, function(error) {
                 kony.sdk.logsdk.error("### OnlineObjectService::uploadBinaryData Error:", error);
                 kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, error);
             });
         }
         if (kony.sdk.skipAnonymousCall) {
             uploadBinaryDataOperationHandler();
         } else {
             kony.sdk.claimsRefresh(uploadBinaryDataOperationHandler, fileUploadFailureCallback);
         }
     };
     /*
      * Helper method to perform file upload
      */
     function _uploadBinaryData(mfEndpointUrl, uploadParams, fileUploadStartedCallback, chunkUploadCompletedCallback, fileUploadCompletedCallback, fileUploadFailureCallback) {
         var uploadOptions = {};
         if (uploadParams) {
             //Extracting Mandatory Params from uploadParams before fetching template
             if (uploadParams[kony.sdk.constants.FILE_PATH]) {
                 uploadOptions[kony.sdk.constants.FILE_PATH] = uploadParams[kony.sdk.constants.FILE_PATH];
                 delete uploadParams[kony.sdk.constants.FILE_PATH];
             } else if (uploadParams[kony.sdk.constants.RAW_BYTES]) {
                 uploadOptions[kony.sdk.constants.RAW_BYTES] = uploadParams[kony.sdk.constants.RAW_BYTES];
                 delete uploadParams[kony.sdk.constants.RAW_BYTES];
             } else if (uploadParams[kony.sdk.constants.FILE_OBJECT]) {
                 uploadOptions[kony.sdk.constants.FILE_OBJECT] = uploadParams[kony.sdk.constants.FILE_OBJECT];
                 delete uploadParams[kony.sdk.constants.FILE_OBJECT]
             }
             uploadOptions["uploadParams"] = uploadParams;
         }
         var headers = {};
         if (!kony.sdk.skipAnonymousCall) {
             headers[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = kony.sdk.getCurrentInstance().currentClaimToken;
         }
         uploadOptions["headers"] = headers;
         uploadOptions["URL"] = mfEndpointUrl;
         kony.sdk.binary.uploadBinaryData(uploadOptions, fileUploadStartedCallback, chunkUploadCompletedCallback, fileUploadCompletedCallback, fileUploadFailureCallback);
     }
     this.getBinaryData = function(options, arg1, arg2, arg3, arg4, arg5) {
         var externalSource = true;
         var fileDownloadStartedCallback = null;
         var chunkDownloadCompletedCallback = null;
         var fileDownloadCompletedCallback = null;
         var downloadFailureCallback = null;
         var binaryAttributeName = null;
         if (kony.sdk.isNullOrUndefined(arg5)) {
             if (kony.sdk.isNullOrUndefined(arg1)) {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData fileDownloadStartedCallback is null or undefined");
             } else if (typeof(arg1) === 'function') {
                 fileDownloadStartedCallback = arg1;
             } else {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData invalid param provided for fileDownloadStartedCallback");
             }
             if (kony.sdk.isNullOrUndefined(arg2)) {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData chunkDownloadCompletedCallback is null or undefined");
             } else if (typeof(arg2) === 'function') {
                 chunkDownloadCompletedCallback = arg2;
             } else {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData invalid param provided for chunkDownloadCompletedCallback");
             }
             if (kony.sdk.isNullOrUndefined(arg3)) {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData fileDownloadCompletedCallback is null or undefined");
             } else if (typeof(arg3) === 'function') {
                 fileDownloadCompletedCallback = arg3;
             } else {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData invalid param provided for fileDownloadCompletedCallback");
             }
             if (kony.sdk.isNullOrUndefined(arg4)) {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData downloadFailureCallback is null or undefined");
             } else if (typeof(arg4) === 'function') {
                 downloadFailureCallback = arg4;
             } else {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData invalid param provided for downloadFailureCallback");
             }
         } else {
             binaryAttributeName = arg1;
             externalSource = false;
             if (kony.sdk.isNullOrUndefined(arg2)) {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData fileDownloadStartedCallback is null or undefined");
             } else if (typeof(arg2) === 'function') {
                 fileDownloadStartedCallback = arg2;
             } else {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData invalid param provided for fileDownloadStartedCallback");
             }
             if (kony.sdk.isNullOrUndefined(arg3)) {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData chunkDownloadCompletedCallback is null or undefined");
             } else if (typeof(arg3) === 'function') {
                 chunkDownloadCompletedCallback = arg3;
             } else {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData invalid param provided for chunkDownloadCompletedCallback");
             }
             if (kony.sdk.isNullOrUndefined(arg4)) {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData fileDownloadCompletedCallback is null or undefined");
             } else if (typeof(arg4) === 'function') {
                 fileDownloadCompletedCallback = arg4;
             } else {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData invalid param provided for fileDownloadCompletedCallback");
             }
             if (kony.sdk.isNullOrUndefined(arg5)) {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData downloadFailureCallback is null or undefined");
             } else if (typeof(arg5) === 'function') {
                 downloadFailureCallback = arg5;
             } else {
                 kony.sdk.logsdk.warn("### OnlineObjectService::getBinaryData invalid param provided for downloadFailureCallback");
             }
         }
         if (kony.sdk.getSdkType() !== kony.sdk.constants.SDK_TYPE_IDE && kony.sdk.getAType() !== kony.sdk.constants.SDK_ATYPE_NATIVE) {
             kony.sdk.verifyAndCallClosure(downloadFailureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_api, kony.sdk.errormessages.invalid_api + "platform :" + kony.sdk.getSdkType().toString()));
             return;
         }
         if (kony.sdk.isNullOrUndefined(options)) {
             kony.sdk.verifyAndCallClosure(downloadFailureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         var tmpDataUrl = null;
         if (externalSource) {
             tmpDataUrl = this.getDataUrl();
         } else {
             tmpDataUrl = this.getBinaryUrl();
         }
         var dataObject = options["dataObject"];
         if (!(dataObject instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(downloadFailureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         if (!(kony.sdk.isNullOrUndefined(options["queryParams"]))) {
             if (!(options["queryParams"] instanceof Object)) {
                 kony.sdk.verifyAndCallClosure(downloadFailureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_queryparams_instance, kony.sdk.errormessages.invalid_queryparams_instance));
                 return;
             }
         }
         var objName = dataObject.getObjectName();
         var streamingFlag = false;
         if (!kony.sdk.isNullOrUndefined(options["streaming"]) && options["streaming"] === true) {
             streamingFlag = true;
         }
         if (!externalSource) {
             if (kony.sdk.isNullOrUndefined(binaryAttributeName) || typeof(binaryAttributeName) !== "string") {
                 kony.sdk.logsdk.error("### OnlineObjectService::getBinaryData Error: Please provide column name to fetch binary content");
                 kony.sdk.verifyAndCallClosure(downloadFailureCallback, kony.sdk.error.getClientErrObj("90000", "Please provide column name to fetch binary content"));
                 return;
             } else {
                 options["binaryAttrName"] = binaryAttributeName;
             }
         }
         if (kony.sdk.isNullOrUndefined(dataObject.getRecord())) {
             kony.sdk.logsdk.error("### OnlineObjectService::_getBinaryData Error: Please provide primary key details or fileParams to get Binary content.");
             kony.sdk.verifyAndCallClosure(downloadFailureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
             return;
         }

         function getBinaryDataOperationHandler() {
             currentObject.getMetadataOfObject(objName, {}, function(response) {
                 _getBinaryData(options, tmpDataUrl, externalSource, streamingFlag, fileDownloadStartedCallback, chunkDownloadCompletedCallback, fileDownloadCompletedCallback, downloadFailureCallback);
             }, function(error) {
                 kony.sdk.logsdk.error("### OnlineObjectService::getBinaryData Error:", error);
                 kony.sdk.verifyAndCallClosure(downloadFailureCallback, error);
             });
         }
         if (kony.sdk.skipAnonymousCall) {
             getBinaryDataOperationHandler();
         } else {
             kony.sdk.claimsRefresh(getBinaryDataOperationHandler, downloadFailureCallback);
         }
     };
     /**
      * Helps to get the binary content of the specified column on the Object
      * @param {map} options - includes {"dataObject":{@link kony.sdk.dto.DataObject}, "binaryAttrName":columnName}
      * @param successCallback
      * @param failureCallback
      */
     this.getBinaryContent = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OnlineObjectService.getBinaryContent");
         if (options == null || options == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         var tmpDataUrl = this.getBinaryUrl();
         var dataObject = options["dataObject"];
         if (!(dataObject instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         if (!(options["queryParams"] == null || options["queryParams"] == undefined)) {
             if (!(options["queryParams"] instanceof Object)) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_queryparams_instance, kony.sdk.errormessages.invalid_queryparams_instance));
                 return;
             }
         }
         var objName = dataObject.getObjectName();
         var binaryColName = options["binaryAttrName"];
         if (binaryColName == null || binaryColName == undefined) {
             kony.sdk.logsdk.error("### OnlineObjectService::getBinaryContent Error: Please provide column name to fetch binary content");
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj("90000", "Please provide column name to fetch binary content"));
             return;
         }

         function getBinaryContentOperationHandler() {
             currentObject.getMetadataOfObject(objName, {}, function(response) {
                 _getBinaryContent(options, tmpDataUrl, successCallback, failureCallback);
             }, function(error) {
                 kony.sdk.logsdk.error("### OnlineObjectService::getBinaryContent Error:", error);
                 kony.sdk.verifyAndCallClosure(failureCallback, error);
             });
         }
         if (kony.sdk.skipAnonymousCall) {
             getBinaryContentOperationHandler();
         } else {
             kony.sdk.claimsRefresh(getBinaryContentOperationHandler, failureCallback);
         }
     };
     /**
      * Helps to create the binary content of the specified column on the Object
      * @param {map} options - includes {"dataObject": {@link kony.sdk.dto.DataObject}, "binaryAttrName":columnName}
      * @param successCallback
      * @param failureCallback
      */
     this.createBinaryContent = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OnlineObjectService.createBinaryContent");
         var tmpDataUrl = this.getBinaryUrl();
         if (options == null || options == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         var dataObject = options["dataObject"];
         if (!(dataObject instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         if (!(options["queryParams"] == null || options["queryParams"] == undefined)) {
             if (!(options["queryParams"] instanceof Object)) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_queryparams_instance, kony.sdk.errormessages.invalid_queryparams_instance));
                 return;
             }
         }
         var objName = dataObject.getObjectName();
         var binaryColName = options["binaryAttrName"];
         if (binaryColName == null || binaryColName == undefined) {
             kony.sdk.logsdk.error("### OnlineObjectService::createBinaryContent Error: Please provide column name to create binary content");
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj("900000", "Please provide column name to create binary content"));
             return;
         }

         function createBinaryContentOperationHandler() {
             currentObject.getMetadataOfObject(objName, {}, function(response) {
                 _createBinaryContent(options, tmpDataUrl, successCallback, failureCallback);
             }, function(error) {
                 kony.sdk.logsdk.error("### OnlineObjectService::createBinaryContent Error:", error);
                 kony.sdk.verifyAndCallClosure(failureCallback, error);
             });
         }
         if (kony.sdk.skipAnonymousCall) {
             createBinaryContentOperationHandler();
         } else {
             kony.sdk.claimsRefresh(createBinaryContentOperationHandler, failureCallback);
         }
     };
     /**
      * Helps to update the binary content of the specified column on the Object
      * @param {map} options - includes {"dataObject": {@link kony.sdk.dto.DataObject}, "binaryAttrName":columnName}
      * @param successCallback
      * @param failureCallback
      */
     this.updateBinaryContent = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OnlineObjectService.updateBinaryContent");
         var tmpDataUrl = this.getBinaryUrl();
         if (options == null || options == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         var dataObject = options["dataObject"];
         if (!(dataObject instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         if (!(options["queryParams"] == null || options["queryParams"] == undefined)) {
             if (!(options["queryParams"] instanceof Object)) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_queryparams_instance, kony.sdk.errormessages.invalid_queryparams_instance));
                 return;
             }
         }
         var objName = dataObject.getObjectName();
         var binaryColName = options["binaryAttrName"];
         if (binaryColName == null || binaryColName == undefined) {
             kony.sdk.logsdk.error("### OnlineObjectService::updateBinaryContent Error: Please provide column name to create binary content");
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj("90000", "Please provide column name to create binary content"));
             return;
         }

         function updateBinaryContentOperationHandler() {
             currentObject.getMetadataOfObject(objName, {}, function(response) {
                 _updateBinaryContent(options, tmpDataUrl, successCallback, failureCallback);
             }, function(error) {
                 kony.sdk.logsdk.error("### OnlineObjectService::updateBinaryContent Error:", error);
                 kony.sdk.verifyAndCallClosure(failureCallback, error);
             });
         }
         if (kony.sdk.skipAnonymousCall) {
             updateBinaryContentOperationHandler();
         } else {
             kony.sdk.claimsRefresh(updateBinaryContentOperationHandler, failureCallback);
         }
     };

     function _getBinaryContent(options, tmpDataUrl, successCallback, failureCallback) {
         var dataObject = options["dataObject"];
         var headers = options["headers"];
         var binaryColName = options["binaryAttrName"];
         var objName = dataObject.getObjectName();
         var queryParams = options["queryParams"];
         var url = tmpDataUrl + "/" + objName;
         var objMetadata = kony.sdk.ObjectServiceUtil.getCachedObjectMetadata(serviceName, objName);
         if (objMetadata.primaryKey != undefined && objMetadata.primaryKey != null) {
             var pkCount = objMetadata.primaryKey.length;
             if (pkCount == 0) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                 return;
             }
             //reading primarykey and framing filter clause
             var pkey = objMetadata.primaryKey[0];
             if (dataObject.getRecord()[pkey] == undefined || dataObject.getRecord()[pkey] == null) {
                 kony.sdk.logsdk.error("### OnlineObjectService::_getBinaryContent Error: Please provide primary key details to get Binary content.");
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                 return;
             }
             url = url + "?" + pkey + "=" + dataObject.getRecord()[pkey];
             //passing binary column name to server
             if (binaryColName != null && binaryColName != undefined) {
                 url = url + "&fieldName=" + binaryColName;
             }
             if (queryParams != undefined && queryParams != null) {
                 url = url + "&" + kony.sdk.util.objectToQueryParams(queryParams);
             }
         } else {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
             return;
         }
         if (!headers) {
             //if headers not sent by the deveolper
             headers = {};
         }
         var isKonyApiVersionAvailable = false;
         if (typeof(headers) !== 'undefined' && headers !== null) {
             //check for x-kony-api-version case insensitive
             for (var header in headers) {
                 if (header !== null && header !== 'undefined') {
                     if (header.toLowerCase() === kony.sdk.constants.API_VERSION_HEADER.toLowerCase()) isKonyApiVersionAvailable = true
                 }
             }
             if (!isKonyApiVersionAvailable) {
                 headers[kony.sdk.constants.API_VERSION_HEADER] = currentObject.getVersion();
             }
         }

         function invokeSuccessCallback(response) {
             kony.sdk.logsdk.debug("### OnlineObjectService::_getBinaryContent::invokeSuccessCallback Response:", response);
             kony.sdk.verifyAndCallClosure(successCallback, response["data"]);
         }

         function invokeFailureCallback(error) {
             kony.sdk.logsdk.error("### OnlineObjectService::_getBinaryContent::invokeFailureCallback Error:", error);
             kony.sdk.verifyAndCallClosure(failureCallback, error);
         }
         invokeObjectOperation(url, dataObject.getObjectName(), headers, null, kony.sdk.constants.HTTP_METHOD_GET, invokeSuccessCallback, invokeFailureCallback, checkAndFetchNetworkProviderOptions(options));
     }

     function _getBinaryData(options, tmpDataUrl, externalSource, streamingFlag, fileDownloadStartedCallback, chunkDownloadCompletedCallback, fileDownloadCompletedCallback, downloadFailureCallback) {
         var dataObject = options["dataObject"];
         var headers = options["headers"];
         var binaryColName = options["binaryAttrName"];
         var objName = dataObject.getObjectName();
         var queryParams = options["queryParams"];
         var url = tmpDataUrl + "/" + objName;
         var objMetadata = kony.sdk.ObjectServiceUtil.getCachedObjectMetadata(serviceName, objName);
         if (!externalSource) {
             if (!kony.sdk.isNullOrUndefined(objMetadata.primaryKey)) {
                 var pkCount = objMetadata.primaryKey.length;
                 if (pkCount == 0) {
                     kony.sdk.verifyAndCallClosure(downloadFailureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                     return;
                 }
                 //reading primarykey and framing filter clause
                 var pkey = objMetadata.primaryKey[0];
                 if (kony.sdk.isNullOrUndefined(dataObject.getRecord()[pkey])) {
                     kony.sdk.logsdk.error("### OnlineObjectService::_getBinaryData Error: Please provide primary key details to get Binary content.");
                     kony.sdk.verifyAndCallClosure(downloadFailureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                     return;
                 }
                 url = url + "?" + pkey + "=" + dataObject.getRecord()[pkey];
                 //passing binary column name to server
                 if (!kony.sdk.isNullOrUndefined(binaryColName)) {
                     url = url + "&fieldName=" + binaryColName;
                 }
                 url = url + "&type=bytes";
                 if (!kony.sdk.isNullOrUndefined(queryParams)) {
                     url = url + "&" + kony.sdk.util.objectToQueryParams(queryParams);
                 }
             } else {
                 kony.sdk.verifyAndCallClosure(downloadFailureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                 return;
             }
         }
         if (!headers) {
             //if headers not sent by the deveolper
             headers = {};
         }
         var isKonyApiVersionAvailable = false;
         if (typeof(headers) !== 'undefined' && headers !== null) {
             //check for x-kony-api-version case insensitive
             for (var headerKey in headers) {
                 if (!kony.sdk.isNullOrUndefined(headerKey)) {
                     if (headerKey.toLowerCase() === kony.sdk.constants.API_VERSION_HEADER.toLowerCase()) {
                         isKonyApiVersionAvailable = true;
                         headers[kony.sdk.constants.API_VERSION_HEADER] = headers[headerKey];
                     }
                 }
             }
             if (!isKonyApiVersionAvailable) {
                 headers[kony.sdk.constants.API_VERSION_HEADER] = currentObject.getVersion();
             }
         }

         function invokeSuccessCallback(response) {
             kony.sdk.logsdk.debug("### OnlineObjectService::_getBinaryData::invokeSuccessCallback Response:", response);
             var downloadConfig = response["records"][0];
             downloadConfig.httpStatusCode = response.httpStatusCode;
             if (options && options["ChunkSize"]) {
                 downloadConfig.ChunkSize = options["ChunkSize"];
             }
             var fileParams = dataObject.getRecord();
             if (kony.sdk.isNullOrUndefined(fileParams["fileId"])) {
                 fileParams["fileId"] = new Date().getTime().toString();
             }
             kony.sdk.binary.getBinaryData(fileParams, streamingFlag, downloadConfig, fileDownloadStartedCallback, chunkDownloadCompletedCallback, fileDownloadCompletedCallback, downloadFailureCallback);
         }

         function invokeFailureCallback(error) {
             kony.sdk.logsdk.error("### OnlineObjectService::_getBinaryData::invokeFailureCallback Error:", error);
             kony.sdk.verifyAndCallClosure(downloadFailureCallback, error);
         }
         if (externalSource) {
             invokeObjectOperation(url, dataObject.getObjectName(), headers, null, kony.sdk.constants.HTTP_METHOD_GET, invokeSuccessCallback, invokeFailureCallback, checkAndFetchNetworkProviderOptions(options));
         } else {
             var fileParams = dataObject.getRecord();
             if (kony.sdk.isNullOrUndefined(fileParams["fileId"])) {
                 fileParams["fileId"] = dataObject.getRecord()[pkey];
             }
             if (!kony.sdk.skipAnonymousCall) {
                 headers[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = kony.sdk.getCurrentInstance().currentClaimToken;
             }
             var downloadConfig = {};
             downloadConfig["endpointUrl"] = url;
             downloadConfig["headers"] = headers;
             //for bypasing template call we need to add method and httpstatus code 309
             downloadConfig.method = kony.sdk.constants.HTTP_METHOD_GET;
             downloadConfig.httpStatusCode = kony.sdk.binary.constants.VALID_HTTP_REDIRECT_CODE;
             if (options && options["ChunkSize"]) {
                 downloadConfig.ChunkSize = options["ChunkSize"];
             }
             kony.sdk.binary.getBinaryData(fileParams, streamingFlag, downloadConfig, fileDownloadStartedCallback, chunkDownloadCompletedCallback, fileDownloadCompletedCallback, downloadFailureCallback);
         }
     }

     function _createBinaryContent(options, tmpDataUrl, successCallback, failureCallback) {
         var dataObject = options["dataObject"];
         var headers = options["headers"];
         var binaryColName = options["binaryAttrName"];
         var objName = dataObject.getObjectName();
         var queryParams = options["queryParams"];
         var url = tmpDataUrl + "/" + objName;
         var objMetadata = kony.sdk.ObjectServiceUtil.getCachedObjectMetadata(serviceName, objName);
         var jsonPayload = {};
         var pkey;
         if (objMetadata.primaryKey != undefined && objMetadata.primaryKey != null) {
             var pkCount = objMetadata.primaryKey.length;
             if (pkCount == 0) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                 return;
             }
             //reading primarykey and framing filter clause
             pkey = objMetadata.primaryKey[0];
             if (dataObject.getRecord()[pkey] == undefined || dataObject.getRecord()[pkey] == null) {
                 kony.sdk.logsdk.error("### OnlineObjectService::_createBinaryContent Error: Please provide primary key details to create Binary content.");
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                 return;
             }
             jsonPayload[pkey] = dataObject.getRecord()[pkey];
             jsonPayload["data"] = dataObject.getRecord()[binaryColName];
             jsonPayload["fieldName"] = binaryColName;
         } else {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
             return;
         }
         if (!headers) {
             //if headers not sent by the deveolper
             headers = {};
         }
         var isKonyApiVersionAvailable = false;
         if (typeof(headers) !== 'undefined' && headers !== null) {
             //check for x-kony-api-version case insensitive
             for (var header in headers) {
                 if (header !== null && header !== 'undefined') {
                     if (header.toLowerCase() === kony.sdk.constants.API_VERSION_HEADER.toLowerCase()) isKonyApiVersionAvailable = true
                 }
             }
             if (!isKonyApiVersionAvailable) {
                 headers[kony.sdk.constants.API_VERSION_HEADER] = currentObject.getVersion();
             }
         }
         var formData = new kony.sdk.getFormData(jsonPayload);
         if (!kony.sdk.isNullOrUndefined(queryParams)) {
             kony.sdk.updateFormData(formData, "queryparams", queryParams);
         }

         function invokeSuccessCallback(response) {
             kony.sdk.logsdk.debug("### OnlineObjectService::_createBinaryContent::invokeSuccessCallback Response:", response);
             kony.sdk.verifyAndCallClosure(successCallback, response[pkey]);
         }

         function invokeFailureCallback(error) {
             kony.sdk.logsdk.error("### OnlineObjectService::_createBinaryContent::invokeFailureCallback Error:", error);
             kony.sdk.verifyAndCallClosure(failureCallback, error);
         }
         invokeObjectOperation(url, dataObject.getObjectName(), headers, formData, null, invokeSuccessCallback, invokeFailureCallback, checkAndFetchNetworkProviderOptions(options));
     }

     function _updateBinaryContent(options, tmpDataUrl, successCallback, failureCallback) {
         var dataObject = options["dataObject"];
         var headers = options["headers"];
         var binaryColName = options["binaryAttrName"];
         var objName = dataObject.getObjectName();
         var queryParams = options["queryParams"];
         var url = tmpDataUrl + "/" + objName;
         var objMetadata = kony.sdk.ObjectServiceUtil.getCachedObjectMetadata(serviceName, objName);
         var jsonPayload = {};
         var pkey;
         if (objMetadata.primaryKey != undefined && objMetadata.primaryKey != null) {
             var pkCount = objMetadata.primaryKey.length;
             if (pkCount == 0) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                 return;
             }
             //reading primarykey and framing filter clause
             pkey = objMetadata.primaryKey[0];
             if (dataObject.getRecord()[pkey] == undefined || dataObject.getRecord()[pkey] == null) {
                 kony.sdk.logsdk.error("### OnlineObjectService::_updateBinaryContent Error: Please provide primary key details to create Binary content.");
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                 return;
             }
             jsonPayload[pkey] = dataObject.getRecord()[pkey];
             jsonPayload["data"] = dataObject.getRecord()[binaryColName];
             jsonPayload["fieldName"] = binaryColName;
         } else {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
             return;
         }
         if (!headers) {
             //if headers not sent by the deveolper
             headers = {};
         }
         headers["X-HTTP-Method-Override"] = "PUT";
         var isKonyApiVersionAvailable = false;
         if (typeof(headers) !== 'undefined' && headers !== null) {
             //check for x-kony-api-version case insensitive
             for (var header in headers) {
                 if (header !== null && header !== 'undefined') {
                     if (header.toLowerCase() === kony.sdk.constants.API_VERSION_HEADER.toLowerCase()) isKonyApiVersionAvailable = true
                 }
             }
             if (!isKonyApiVersionAvailable) {
                 headers[kony.sdk.constants.API_VERSION_HEADER] = currentObject.getVersion();
             }
         }
         var formData = new kony.sdk.getFormData(jsonPayload);
         if (queryParams != undefined && queryParams != null) {
             kony.sdk.updateFormData(formData, "queryparams", queryParams);
         }

         function invokeSuccessCallback(response) {
             kony.sdk.logsdk.debug("### OnlineObjectService::_updateBinaryContent::invokeSuccessCallback Response:", response);
             kony.sdk.verifyAndCallClosure(successCallback, response[pkey]);
         }

         function invokeFailureCallback(error) {
             kony.sdk.logsdk.error("### OnlineObjectService::_updateBinaryContent::invokeFailureCallback Error:", error);
             kony.sdk.verifyAndCallClosure(failureCallback, error);
         }
         invokeObjectOperation(url, dataObject.getObjectName(), headers, formData, null, invokeSuccessCallback, invokeFailureCallback, checkAndFetchNetworkProviderOptions(options));
     }

     function _create(options, tmpDataUrl, successCallback, failureCallback) {
         var dataObject = options["dataObject"];
         var headers = options["headers"];
         var url = tmpDataUrl + "/" + dataObject.objectName;
         var record = dataObject.getRecord();
         var queryParams = options["queryParams"];
         if (record == null || record == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "record " + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         if (!headers) {
             //if headers not sent by the deveolper
             headers = {};
         }
         var isKonyApiVersionAvailable = false;
         if (typeof(headers) !== 'undefined' && headers !== null) {
             //check for x-kony-api-version case insensitive
             for (var header in headers) {
                 if (header !== null && header !== 'undefined') {
                     if (header.toLowerCase() === kony.sdk.constants.API_VERSION_HEADER.toLowerCase()) isKonyApiVersionAvailable = true
                 }
             }
             if (!isKonyApiVersionAvailable) {
                 headers[kony.sdk.constants.API_VERSION_HEADER] = currentObject.getVersion();
             }
         }
         var formData = new kony.sdk.getFormData(record);
         if (queryParams != undefined && queryParams != null) {
             kony.sdk.updateFormData(formData, "queryparams", queryParams);
         }

         function invokeSuccessCallback(response) {
             kony.sdk.logsdk.debug("### OnlineObjectService::_create::invokeSuccessCallback Response:", response);
             kony.sdk.verifyAndCallClosure(successCallback, response);
         }

         function invokeFailureCallback(error) {
             kony.sdk.logsdk.error("### OnlineObjectService::_create::invokeFailureCallback Error:", error);
             kony.sdk.verifyAndCallClosure(failureCallback, error)
         }
         invokeObjectOperation(url, dataObject.objectName, headers, formData, null, invokeSuccessCallback, invokeFailureCallback, checkAndFetchNetworkProviderOptions(options));
     }

     function _fetch(options, tmpDataUrl, successCallback, serviceErrorCallback) {
         var dataObject = options["dataObject"];
         var odataqueryStr = dataObject.getOdataUrl();
         var headers = options["headers"];
         var queryParams = options["queryParams"];
         var url = tmpDataUrl + "/" + dataObject.objectName;
         if (odataqueryStr != undefined && odataqueryStr != null) {
             url = url + "?" + encodeURI(odataqueryStr);
             if (queryParams != undefined && queryParams != null) {
                 url = url + "&" + kony.sdk.util.objectToQueryParams(queryParams);
             }
         } else if (queryParams != undefined && queryParams != null) {
             url = url + "?" + kony.sdk.util.objectToQueryParams(queryParams);
         }
         if (!headers) {
             //if headers not sent by the deveolper
             headers = {};
         }
         var isKonyApiVersionAvailable = false;
         if (typeof(headers) !== 'undefined' && headers !== null) {
             //check for x-kony-api-version case insensitive
             for (var header in headers) {
                 if (header !== null && header !== 'undefined') {
                     if (header.toLowerCase() === kony.sdk.constants.API_VERSION_HEADER.toLowerCase()) isKonyApiVersionAvailable = true
                 }
             }
             if (!isKonyApiVersionAvailable) {
                 headers[kony.sdk.constants.API_VERSION_HEADER] = currentObject.getVersion();
             }
         }
         // If useCache is enabled and cacheID is present then network call will be skipped and cached response will be returned.
         if (options && options["useCache"] && options["cacheID"]) {
             var cacheResponse = new kony.sdk.ClientCache().get(options["cacheID"]);
             if (cacheResponse) {
                 kony.sdk.logsdk.debug("### OnlineObjectService::_fetch:: key found in cache, invokeSuccessCallback Response:", cacheResponse);
                 kony.sdk.verifyAndCallClosure(successCallback, cacheResponse);
                 return;
             }
         }

         function invokeSuccessCallback(response) {
             kony.sdk.logsdk.debug("### OnlineObjectService::_fetch::invokeSuccessCallback Response:", response);
             // If useCache is enabled then the response is cached and returned.
             if (options && options["useCache"]) {
                 cacheResponseForKey(options, url, {
                     "objectName": dataObject.objectName
                 }, response);
             }
             kony.sdk.verifyAndCallClosure(successCallback, response);
         }

         function invokeFailureCallback(error) {
             kony.sdk.logsdk.error("### OnlineObjectService::_fetch::invokeFailureCallback Error:", error);
             kony.sdk.verifyAndCallClosure(serviceErrorCallback, error);
         }
         invokeObjectOperation(url, dataObject.objectName, headers, null, kony.sdk.constants.HTTP_METHOD_GET, invokeSuccessCallback, invokeFailureCallback, checkAndFetchNetworkProviderOptions(options));
     }

     function _update(options, tmpDataUrl, updateServiceCallback, serviceErrorCallback) {
         var dataObject = options["dataObject"];
         var headers = options["headers"];
         var url = tmpDataUrl + "/" + dataObject.objectName;
         var queryParams = options["queryParams"];
         if (!headers) {
             //if headers not sent by the deveolper
             headers = {};
         }
         var isKonyApiVersionAvailable = false;
         if (typeof(headers) !== 'undefined' && headers !== null) {
             //check for x-kony-api-version case insensitive
             for (var header in headers) {
                 if (header !== null && header !== 'undefined') {
                     if (header.toLowerCase() === kony.sdk.constants.API_VERSION_HEADER.toLowerCase()) isKonyApiVersionAvailable = true
                 }
             }
             if (!isKonyApiVersionAvailable) {
                 headers[kony.sdk.constants.API_VERSION_HEADER] = currentObject.getVersion();
             }
         }
         headers["X-HTTP-Method-Override"] = "PUT";
         var formData = new kony.sdk.getFormData(dataObject.getRecord());
         if (queryParams != undefined && queryParams != null) {
             kony.sdk.updateFormData(formData, "queryparams", queryParams);
         }

         function invokeSuccessCallback(response) {
             kony.sdk.logsdk.debug("### OnlineObjectService::_update::invokeSuccessCallback Response:", response);
             kony.sdk.verifyAndCallClosure(updateServiceCallback, response);
         }

         function invokeFailureCallback(error) {
             kony.sdk.logsdk.error("### OnlineObjectService::_update::invokeFailureCallback Error:", error);
             kony.sdk.verifyAndCallClosure(serviceErrorCallback, error);
         }
         invokeObjectOperation(url, dataObject.objectName, headers, formData, null, invokeSuccessCallback, invokeFailureCallback, checkAndFetchNetworkProviderOptions(options));
     }

     function _partialUpdate(options, tmpDataUrl, partialUpdateServiceCallback, serviceErrorCallback) {
         var dataObject = options["dataObject"];
         var headers = options["headers"];
         var url = tmpDataUrl + "/" + dataObject.objectName;
         var queryParams = options["queryParams"];
         if (!headers) {
             //if headers not sent by the deveolper
             headers = {};
         }
         headers["X-HTTP-Method-Override"] = "PATCH";
         var isKonyApiVersionAvailable = false;
         if (typeof(headers) !== 'undefined' && headers !== null) {
             //check for x-kony-api-version case insensitive
             for (var header in headers) {
                 if (header !== null && header !== 'undefined') {
                     if (header.toLowerCase() === kony.sdk.constants.API_VERSION_HEADER.toLowerCase()) isKonyApiVersionAvailable = true
                 }
             }
             if (!isKonyApiVersionAvailable) {
                 headers[kony.sdk.constants.API_VERSION_HEADER] = currentObject.getVersion();
             }
         }
         var formData = new kony.sdk.getFormData(dataObject.getRecord());
         if (queryParams != undefined && queryParams != null) {
             kony.sdk.updateFormData(formData, "queryparams", queryParams);
         }

         function invokeSuccessCallback(response) {
             kony.sdk.logsdk.debug("### OnlineObjectService::_partialUpdate::invokeSuccessCallback Success Response:", response);
             kony.sdk.verifyAndCallClosure(partialUpdateServiceCallback, response);
         }

         function invokeFailureCallback(error) {
             kony.sdk.logsdk.error("### OnlineObjectService::_partialUpdate::invokeFailureCallback Error:", error);
             kony.sdk.verifyAndCallClosure(serviceErrorCallback, error);
         }
         invokeObjectOperation(url, dataObject.objectName, headers, formData, null, invokeSuccessCallback, invokeFailureCallback, checkAndFetchNetworkProviderOptions(options));
     }

     function _deleteRecord(options, tmpDataUrl, deleteSuccessCallback, serviceErrorCallback) {
         var dataObject = options["dataObject"];
         var headers = options["headers"];
         var objMetadata = kony.sdk.ObjectServiceUtil.getCachedObjectMetadata(serviceName, dataObject.objectName);
         var url = tmpDataUrl + "/" + dataObject.objectName;
         var queryParams = options["queryParams"];
         var odataUrl = "";
         if (objMetadata.primaryKey != undefined && objMetadata.primaryKey != null) {
             var pkCount = objMetadata.primaryKey.length;
             for (var i = 0; i < pkCount; i++) {
                 //reading primarykey and framing filter clause
                 var pkey = objMetadata.primaryKey[i];
                 if (dataObject.getRecord()[pkey] == undefined || dataObject.getRecord()[pkey] == null) {
                     kony.sdk.logsdk.error("### OnlineObjectService::_delete Error: Please provide all primary keys to process the request");
                     kony.sdk.verifyAndCallClosure(serviceErrorCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                     return;
                 }
                 if (i == 0) {
                     odataUrl = "?$filter=" + pkey + " eq '" + dataObject.getRecord()[pkey] + "'";
                 } else {
                     //appending the condition incase of composite primary key
                     odataUrl = odataUrl + " and " + pkey + " eq '" + dataObject.getRecord()[pkey] + "'";
                 }
             }
         }
         url = url + encodeURI(odataUrl);
         if (queryParams != undefined && queryParams != null) {
             if (odataUrl && odataUrl.length != 0) {
                 url = url + "&" + kony.sdk.util.objectToQueryParams(queryParams);
             } else {
                 url = url + "?" + kony.sdk.util.objectToQueryParams(queryParams);
             }
         }
         if (!headers) {
             //if headers not sent by the deveolper
             headers = {};
         }
         var isKonyApiVersionAvailable = false;
         if (typeof(headers) !== 'undefined' && headers !== null) {
             //check for x-kony-api-version case insensitive
             for (var header in headers) {
                 if (header !== null && header !== 'undefined') {
                     if (header.toLowerCase() === kony.sdk.constants.API_VERSION_HEADER.toLowerCase()) isKonyApiVersionAvailable = true
                 }
             }
             if (!isKonyApiVersionAvailable) {
                 headers[kony.sdk.constants.API_VERSION_HEADER] = currentObject.getVersion();
             }
         }
         headers["X-HTTP-Method-Override"] = "DELETE";

         function invokeSuccessCallback(response) {
             kony.sdk.logsdk.debug("### OnlineObjectService::_delete::invokeSuccessCallback Response:", response);
             kony.sdk.verifyAndCallClosure(deleteSuccessCallback, response);
         }

         function invokeFailureCallback(error) {
             kony.sdk.logsdk.error("### OnlineObjectService::_delete::invokeFailureCallback Error:", error);
             kony.sdk.verifyAndCallClosure(serviceErrorCallback, error);
         }
         invokeObjectOperation(url, dataObject.objectName, headers, null, kony.sdk.constants.HTTP_METHOD_GET, invokeSuccessCallback, invokeFailureCallback, checkAndFetchNetworkProviderOptions(options));
     }

     function _customverb(verbName, options, tmpDataUrl, customVerbServiceCallback, serviceErrorCallback) {
         var dataObject = options["dataObject"];
         var headers = options["headers"];
         var url = tmpDataUrl + "/" + dataObject.objectName + "/" + verbName;
         var queryParams = options["queryParams"];
         if (!headers) {
             //if headers not sent by the deveolper
             headers = {};
         }
         var isKonyApiVersionAvailable = false;
         if (typeof(headers) !== 'undefined' && headers !== null) {
             //check for x-kony-api-version case insensitive
             for (var header in headers) {
                 if (header !== null && header !== 'undefined') {
                     if (header.toLowerCase() === kony.sdk.constants.API_VERSION_HEADER.toLowerCase()) isKonyApiVersionAvailable = true
                 }
             }
             if (!isKonyApiVersionAvailable) {
                 headers[kony.sdk.constants.API_VERSION_HEADER] = currentObject.getVersion();
             }
         }
         var formData = new kony.sdk.getFormData(dataObject.getRecord());
         if (queryParams != undefined && queryParams != null) {
             kony.sdk.updateFormData(formData, "queryparams", queryParams);
         }

         function invokeSuccessCallback(response) {
             kony.sdk.logsdk.debug("### OnlineObjectService::_customverb::invokeSuccessCallback Success Response:", response);
             kony.sdk.verifyAndCallClosure(customVerbServiceCallback, response);
         }

         function invokeFailureCallback(error) {
             kony.sdk.logsdk.error("### OnlineObjectService::_customverb::invokeFailureCallback Error:", error);
             kony.sdk.verifyAndCallClosure(serviceErrorCallback, error);
         }
         invokeObjectOperation(url, dataObject.objectName, headers, formData, null, invokeSuccessCallback, invokeFailureCallback, checkAndFetchNetworkProviderOptions(options));
     }
     this.getFileStorage = function() {
         // TODO : Fix this as there are issues with getMetadataOfAllObjects call - that was hanging	
         return kony.sdk.FileStorageClasses.import(this.getFileStorageObjectServiceUrl());
     };
 };

 function _getMetadataUrl(konyRef, serviceName) {
     var metadataUrl = null;
     if (konyRef.objectsvc[serviceName]) {
         metadataUrl = encodeURI(stripTrailingCharacter(konyRef.objectsvc[serviceName]["metadata_url"], "/"));
     } else if (konyRef.offlineObjectsvc[serviceName]) {
         metadataUrl = encodeURI(stripTrailingCharacter(konyRef.offlineObjectsvc[serviceName]["metadata_url"], "/"));
     }
     return metadataUrl;
 }

 function _getVersion(konyRef, serviceName) {
     var version = null;
     if (konyRef.objectsvc[serviceName]) {
         version = konyRef.objectsvc[serviceName]["version"];
     } else if (konyRef.offlineObjectsvc[serviceName]) {
         version = konyRef.offlineObjectsvc[serviceName]["version"];
     }
     return version;
 }
 /*This method is used to fetch metadata for Object/Objectservice.
  * It is fetched from cache first, if it not available in cache then fetches method data from metadata URL.
  */
 function _getMetadataForObjectsOrServiceOnlineUtil(konyRef, serviceName, objectName, options, successCallback, failureCallback) {
     var tmpMetadataUrl = _getMetadataUrl(konyRef, serviceName);;
     if (!(kony.sdk.isNullOrUndefined(options)) && !(options["queryParams"] == null || options["queryParams"] == undefined)) {
         if (!(options["queryParams"] instanceof Object)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_queryparams_instance, kony.sdk.errormessages.invalid_queryparams_instance));
         }
     }

     function getMetadataOfObjectOperationHandler() {
         _getMetadataForObjectOrService(konyRef, serviceName, objectName, options, tmpMetadataUrl, successCallback, failureCallback);
     }
     if (kony.sdk.skipAnonymousCall) {
         getMetadataOfObjectOperationHandler();
     } else {
         kony.sdk.claimsRefresh(getMetadataOfObjectOperationHandler, failureCallback);
     }
 }

 function _getMetadataForObjectOrService(konyRef, serviceName, objectName, options, tmpMetadataUrl, successCallback, failureCallback) {
     //if the getFromServer flag is true then get metadata from server even though its available in cache
     var getFromServer = false;
     var headers = null;
     var queryParams = null;
     if (options != null && options != undefined) {
         getFromServer = options["getFromServer"];
         headers = options["headers"];
         queryParams = options["queryParams"];
     }
     var tmpObjOrSvcMetadata = null;
     if (objectName) {
         tmpObjOrSvcMetadata = kony.sdk.ObjectServiceUtil.getCachedObjectMetadata(serviceName, objectName);
     } else {
         tmpObjOrSvcMetadata = kony.sdk.ObjectServiceUtil.getCachedMetadata(serviceName);
     }
     if (getFromServer != true && tmpObjOrSvcMetadata != null && tmpObjOrSvcMetadata != undefined) {
         kony.sdk.logsdk.debug("### OnlineObjectService::_getMetadataOfObject from KonyStore:", tmpObjOrSvcMetadata);
         kony.sdk.verifyAndCallClosure(successCallback, tmpObjOrSvcMetadata);
     } else {
         if (!headers) {
             //if headers not sent by the deveolper
             headers = {};
         }
         var isKonyApiVersionAvailable = false;
         if (typeof(headers) !== 'undefined' && headers !== null) {
             //check for x-kony-api-version case insensitive
             for (var header in headers) {
                 if (header !== null && header !== 'undefined') {
                     if (header.toLowerCase() === kony.sdk.constants.API_VERSION_HEADER.toLowerCase()) isKonyApiVersionAvailable = true
                 }
             }
             if (!isKonyApiVersionAvailable) {
                 headers[kony.sdk.constants.API_VERSION_HEADER] = _getVersion(konyRef, serviceName);
             }
         }
         var url = tmpMetadataUrl;
         var svcid = "metadata";
         if (objectName) {
             url = url + "/" + objectName;
             svcid = svcid + "_" + objectName;
         }
         if (queryParams != undefined && queryParams != null) {
             url = url + "?" + kony.sdk.util.objectToQueryParams(queryParams);
         }

         function invokeSuccessCallback(result) {
             kony.sdk.logsdk.debug("### OnlineObjectService::_getMetadataForObjectOrService::invokeSuccessCallback Response:", result);
             if (objectName) {
                 var table = result["Metadata"]["table"];
                 kony.sdk.ObjectServiceUtil.cacheObjectMetadata(serviceName, table);
                 var tmpObjMetadata = kony.sdk.ObjectServiceUtil.getCachedObjectMetadata(serviceName, objectName);
                 kony.sdk.verifyAndCallClosure(successCallback, tmpObjMetadata);
             } else {
                 var tableArray = result["Metadata"]["tables"];
                 kony.sdk.ObjectServiceUtil.cacheMetadata(serviceName, tableArray);
                 var tmpMetadata = kony.sdk.ObjectServiceUtil.getCachedMetadata(serviceName);
                 kony.sdk.verifyAndCallClosure(successCallback, tmpMetadata);
             }
         }

         function invokeFailureCallback(error) {
             kony.sdk.logsdk.error("### OnlineObjectService::_getMetadataForObjectOrService::invokeFailureCallback Error:", error);
             kony.sdk.verifyAndCallClosure(failureCallback, error);
         }
         invokeObjectOperation(url, svcid, headers, null, kony.sdk.constants.HTTP_METHOD_GET, invokeSuccessCallback, invokeFailureCallback, checkAndFetchNetworkProviderOptions(options));
     }
 }

 function checkAndFetchNetworkProviderOptions(options) {
     var providerOptions = {};
     //Fetching httpRequestOptions
     if (options && options["httpRequestOptions"] && options["httpRequestOptions"] instanceof Object) {
         providerOptions["httpRequestOptions"] = options["httpRequestOptions"];
     }
     //Fetching XMLHttpRequestOptions
     if (options && options["xmlHttpRequestOptions"] && options["xmlHttpRequestOptions"] instanceof Object) {
         providerOptions["xmlHttpRequestOptions"] = options["xmlHttpRequestOptions"];
     }
     return providerOptions;
 }
 //Method is used to send http request for ObjectService operations
 function invokeObjectOperation(url, svcid, headers, formData, httpMethod, successCallback, failureCallback, networkProviderOptions) {
     kony.sdk.logsdk.trace("Entering invokeObjectOperation");
     var networkProvider = new konyNetworkProvider();
     var reportingData = kony.sdk.getEncodedReportingParamsForSvcid(svcid);
     var defaultHeaders = {};
     if (!httpMethod) {
         //default http method is post
         httpMethod = "POST";
     }
     if (!kony.sdk.skipAnonymousCall) {
         // Check to find if the service is public or not, in case of public service no token is required.
         defaultHeaders[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = konyRef.currentClaimToken;
     }
     defaultHeaders[kony.sdk.constants.HTTP_REQUEST_HEADER_ACCEPT] = kony.sdk.constants.CONTENT_TYPE_JSON;
     defaultHeaders[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_JSON;
     var deviceId = kony.sdk.getDeviceId();
     if (!kony.sdk.isNullOrUndefined(deviceId)) {
         defaultHeaders[kony.sdk.constants.DEVICEID_HEADER] = deviceId;
     }
     if (reportingData != null && reportingData != undefined) {
         try {
             defaultHeaders[kony.sdk.constants.REPORTING_HEADER] = reportingData;
         } catch (error) {
             kony.sdk.logsdk.error("### invokeObjectOperation::error while parsing metrics payload" + error);
         }
     }
     // if the user has defined his own headers, use them
     if (headers) {
         var tempHeader = "";
         for (var header in headers) {
             if (kony.sdk.constants.HTTP_REQUEST_HEADER_ACCEPT.toLowerCase() === header.toLowerCase()) {
                 //Accept can be multiple
                 //Reason being client can be programmed to accept more than one type of content from server.
                 tempHeader = kony.sdk.constants.HTTP_REQUEST_HEADER_ACCEPT;
                 if (defaultHeaders[tempHeader].toLowerCase() !== headers[header].toLowerCase()) {
                     defaultHeaders[header] = defaultHeaders[tempHeader] + "," + headers[header];
                 }
             } else if (kony.sdk.constants.KONY_AUTHORIZATION_HEADER.toLowerCase() === header.toLowerCase()) {
                 tempHeader = kony.sdk.constants.KONY_AUTHORIZATION_HEADER;
                 if (defaultHeaders[tempHeader] !== headers[header]) {
                     defaultHeaders[tempHeader] = headers[header];
                 }
             } else if ("content-type" === header.toLowerCase()) {
                 tempHeader = kony.sdk.constants.HTTP_CONTENT_HEADER;
                 //Content-type can and should be a single value.
                 //Reason being client can only send a single kind of content at a single instance
                 if (defaultHeaders[tempHeader].toLowerCase() !== headers[header].toLowerCase()) {
                     defaultHeaders[tempHeader] = headers[header];
                 }
             } else {
                 if (defaultHeaders[header] !== headers[header]) {
                     defaultHeaders[header] = headers[header];
                 }
             }
         }
     }

     function networksuccess(res) {
         kony.sdk.logsdk.trace("Entering networksuccess");
         kony.sdk.verifyAndCallClosure(successCallback, res);
     }

     function networkerror(xhr, status, err) {
         kony.sdk.logsdk.trace("Entering networkerror");
         if (xhr && !(status && err)) {
             err = xhr;
         }
         if (err[kony.sdk.constants.MF_CODE]) {
             var konyRef = kony.sdk.getCurrentInstance();
             //clear the cache if the error code related to session/token expiry
             if (kony.sdk.isSessionOrTokenExpired(err[kony.sdk.constants.MF_CODE])) {
                 kony.sdk.logsdk.warn("###ObjectService::invokeObjectOperationFailure  Session/Token expired. Authenticate and Try again");
                 //kony.sdk.resetCacheKeys(konyRef);
             }
         }
         kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getObjectServiceErrObj(err));
     }
     if (httpMethod === "GET") {
         networkProvider.get(url, null, defaultHeaders, networksuccess, networkerror, "formdata", networkProviderOptions);
     } else {
         networkProvider.post(url, formData, defaultHeaders, networksuccess, networkerror, "formdata", networkProviderOptions);
     }
 }
 kony.sdk.util = kony.sdk.util || {};
 kony.sdk.ObjectServiceUtil = kony.sdk.ObjectServiceUtil || {};
 kony.sdk.dto = kony.sdk.dto || {};
 kony.sdk.constants.DateTimeType = {
     TODAY: "TODAY",
     YESTERDAY: "YESTERDAY",
     TOMORROW: "TOMORROW",
     CURRENTWEEK: "CURRENTWEEK",
     LASTWEEK: "LASTWEEK",
     NEXTWEEK: "NEXTWEEK",
     CURRENTMONTH: "CURRENTMONTH",
     LASTMONTH: "LASTMONTH",
     NEXTMONTH: "NEXTMONTH"
 };
 kony.sdk.constants.Aggregation = {
     NONE: "",
     COUNT: "COUNT",
     SUM: "SUM",
     MAX: "MAX",
     MIN: "MIN",
     AVG: "AVG"
 };
 kony.sdk.constants.OrderType = {
     ASCENDING: "ASC",
     DESCENDING: "DESC"
 };
 kony.sdk.constants.MatchType = {
     EQUALS: {
         value: "=",
         name: "EQUALS"
     },
     GREATER: {
         value: ">",
         name: "GREATER"
     },
     GREATEREQUAL: {
         value: ">=",
         name: "GREATEREQUAL"
     },
     LESS: {
         value: "<",
         name: "LESS"
     },
     LESSEQUAL: {
         value: "<=",
         name: "LESSEQUAL"
     },
     STARTSWITH: {
         value: "LIKE",
         name: "STARTSWITH"
     },
     CONTAINS: {
         value: "LIKE",
         name: "CONTAINS"
     },
     LIKE: {
         value: "LIKE",
         name: "LIKE"
     },
     ENDSWITH: {
         value: "LIKE",
         name: "ENDSWITH"
     },
     NOTEQUAL: {
         value: "<>",
         name: "NOTEQUAL"
     },
     ISNULL: {
         value: "IS NULL",
         name: "ISNULL"
     },
     ISNOTNULL: {
         value: "IS NOT NULL",
         name: "ISNOTNULL"
     }
 };
 kony.sdk.constants.JoinType = {
     INNER: "INNER",
     LEFT: "LEFT",
     RIGHT: "RIGHT"
 };
 kony.sdk.constants.Operator = {
     AND: "AND",
     OR: "OR"
 };
 kony.sdk.constants.ObjectServiceConstants = {
     DATAOBJECT: "dataObject",
     QUERYPARAMS: "queryParams"
 };
 /**
  * This is a utility function used to check whether the two strings provided
  * would match with each other.
  * @param string1
  * @param string2
  * @return boolean
  */
 kony.sdk.util.matchIgnoreCase = function(string1, string2) {
     if (string1 === null || string2 === null || string1 === undefined || string2 === undefined) {
         return false;
     }
     return (string1.toUpperCase() === string2.toUpperCase());
 };
 kony.sdk.util.isNull = function(val) {
     if (val === null || val === undefined) return true;
     val = val + "";
     return (kony.sdk.util.matchIgnoreCase(val, "null"));
 };
 kony.sdk.util.isValidNumberType = function(val) {
     if (kony.sdk.util.matchIgnoreCase(typeof val, "number")) return true;
     else if (kony.sdk.util.matchIgnoreCase(typeof val, "string") && null != kony.sdk.util.toNumber(val)) return true;
     else return false;
 };
 kony.sdk.util.toNumber = function(arg) {
     if (arguments.length != 1) {
         throw new Error("Invalid argument to kony.sdk.util.toNumber");
     }
     if (typeof(arg) === "number") {
         return arg;
     } else if (typeof(arg) === "string") {
         var str = arg.replace(/^\s*/, '').replace(/\s*$/, '');
         if (str === '') {
             return null;
         } else {
             var num = str - 0;
             return (isNaN(num) ? null : num);
         }
     } else {
         return null;
     }
 };
 kony.sdk.util.validateCriteriaObject = function(criteria) {
     if (criteria !== null && criteria !== undefined) {
         return (criteria instanceof kony.sdk.dto.Criteria || criteria instanceof kony.sdk.dto.Match || criteria instanceof kony.sdk.dto.Between || criteria instanceof kony.sdk.dto.LogicGroup || criteria instanceof kony.sdk.dto.And || criteria instanceof kony.sdk.dto.Or || criteria instanceof kony.sdk.dto.Not || criteria instanceof kony.sdk.dto.Expression || criteria instanceof kony.sdk.dto.InCriteria || criteria instanceof kony.sdk.dto.Exists || criteria instanceof kony.sdk.dto.Join);
     } else {
         return false;
     }
 };
 kony.sdk.ObjectServiceUtil.cacheMetadata = function(serviceName, objects) {
     if (objects !== undefined && objects !== null) {
         kony.sdk.dataStore.removeItem(serviceName);
         for (var i = 0; i < objects.length; i++) {
             var object = objects[i];
             //clearing the existing metadata of service and updating it with the latest metadata
             kony.sdk.ObjectServiceUtil.cacheObjectMetadata(serviceName, object);
         }
     }
 };
 kony.sdk.ObjectServiceUtil.cacheObjectMetadata = function(serviceName, object) {
     if (object !== undefined && object !== null) {
         //getting metadata of servicename
         var metadataOfAllObjs = kony.sdk.dataStore.getItem(serviceName);
         var jsonObject = JSON.parse('{}');
         //if metadata available get it
         if (metadataOfAllObjs !== null && metadataOfAllObjs !== undefined && metadataOfAllObjs !== "{}") {
             jsonObject = JSON.parse(metadataOfAllObjs);
         }
         //adding metadata of object to the existing metadata
         jsonObject[object.name] = object;
         var jsonStr = JSON.stringify(jsonObject);
         kony.sdk.dataStore.setItem(serviceName, jsonStr);
     }
 };
 kony.sdk.ObjectServiceUtil.getCachedMetadata = function(serviceName) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.ObjectServiceUtil.getCachedMetadata");
     var appMetadata = kony.sdk.util.getPackagedMetadata();
     if (appMetadata != null && appMetadata != undefined) {
         if (serviceName != undefined && serviceName != null) return appMetadata[serviceName];
     } else {
         //reading metadata from the store
         var jsonObject = null;
         var metadataOfAllObjs = kony.sdk.dataStore.getItem(serviceName);
         if (metadataOfAllObjs !== null && metadataOfAllObjs !== undefined && metadataOfAllObjs !== "{}") {
             jsonObject = JSON.parse(metadataOfAllObjs);
         }
         return jsonObject;
     }
     return null;
 };
 kony.sdk.ObjectServiceUtil.getCachedObjectMetadata = function(serviceName, objectName) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.ObjectServiceUtil.getCachedObjectMetadata");
     var objectMetadata;
     if (objectName !== undefined && objectName !== null) {
         var metadataOfAllObjs = kony.sdk.ObjectServiceUtil.getCachedMetadata(serviceName);
         var jsonObject = null;
         if (metadataOfAllObjs !== null && metadataOfAllObjs !== undefined && metadataOfAllObjs !== "{}") {
             jsonObject = metadataOfAllObjs;
             //getting the object's metadata from the stored metadata
             objectMetadata = jsonObject[objectName];
         }
     }
     return objectMetadata;
 };
 /**
  * An object used to perform CRUD operations on objects
  * @param objectName
  * @param record
  * @constructor
  */
 kony.sdk.dto.DataObject = function(objectName, record) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.DataObject");
     this.objectName = objectName;
     if (record != null && record != undefined) {
         this.record = record;
     } else {
         this.record = {};
     }
     this.odataUrl = null;
     this.selectQueryObject = null;
     this.offlineObjectsOptions = {};
     this.setOfflineObjectsOptions = function(offlineObjectsOptions) {
         this.offlineObjectsOptions = offlineObjectsOptions;
     };
     this.getOfflineObjectsOptions = function() {
         return this.offlineObjectsOptions;
     };
     /**
      * This function is used to add fields and their values to the dataobject
      * @param fieldName
      * @param value
      */
     this.addField = function(fieldName, value) {
         this.record[fieldName] = value;
     };
     /**
      * This function is used to set a map of records to the dataobject
      * @param fieldValuesMap
      */
     this.setRecord = function(fieldValuesMap) {
         this.record = fieldValuesMap;
     };
     /**
      * This function is used to get the map of records present in the DataObject
      * @returns {JSON} record
      */
     this.getRecord = function() {
         return this.record;
     };
     /**
      * This function is used to add a child Dataobject into the data object
      * @param  childDataObject {@link kony.sdk.dto.DataObject}
      */
     this.addChildDataObject = function(childDataObject) {
         if (this.record[childDataObject.objectName] == null || this.record[childDataObject.objectName] == undefined) {
             this.record[childDataObject.objectName] = [];
         }
         this.record[childDataObject.objectName].push(childDataObject.getRecord());
     };
     /**
      * This function is used to set the odata url to query
      * @param odataUrl
      */
     this.setOdataUrl = function(odataUrl) {
         this.odataUrl = odataUrl;
     };
     /**
      * This function is used to get the odata url to query
      * @returns {null}
      */
     this.getOdataUrl = function() {
         return this.odataUrl;
     };
     /**
      * This function is used to set a SelectQueryObject {@link kony.sdk.dto.SelectQuery}
      * @param selectQueryObject {@link kony.sdk.dto.SelectQuery}
      */
     this.setSelectQueryObject = function(selectQueryObject) {
         this.selectQueryObject = selectQueryObject;
     };
     /**
      * This function is used to get a SelectQueryObject {@link kony.sdk.dto.SelectQuery}
      * @returns selectQueryObject {@link kony.sdk.dto.SelectQuery}
      */
     this.getSelectQueryObject = function() {
         return this.selectQueryObject;
     };
     /**
      * This function is used to get the object name
      * @returns objectName {string}
      */
     this.getObjectName = function() {
         return this.objectName;
     };
 };
 /**
  * This object is used to define a record object used in Offline CRUD
  * @constructor
  */
 kony.sdk.dto.RecordObject = function() {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.RecordObject");
     this.tableName = "";
     this.columnValues = {};
     this.childRecords = [];
 };
 kony.sdk.util.getSyncDbName = function() {
     return kony.sync.getDBName();
 };
 kony.sdk.util.getPrimarykeysFromMetadata = function(objMetadata) {
     var tmpSrcAttributes = null;
     if (objMetadata.primaryKey != null && objMetadata.primaryKey != undefined && objMetadata.primaryKey.length > 0) {
         tmpSrcAttributes = {};
         var pkLen = objMetadata.primaryKey.length;
         for (var indx = 0; indx < pkLen; indx++) {
             var pKey = objMetadata.primaryKey[indx];
             //adding primarykey column names in srcattributes which will be useful while deleting children
             tmpSrcAttributes[pKey] = pKey;
         }
     }
     return tmpSrcAttributes;
 };
 /**
  * This is a replaceAll utility function
  * @param string
  * @param toReplace
  * @param replaceWith
  * @return String temp
  */
 kony.sdk.util.replaceAll = function(string, toReplace, replaceWith) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.util.replaceAll");
     var temp = string;
     var index = temp.indexOf(toReplace);
     while (index != -1) {
         temp = temp.replace(toReplace, replaceWith);
         index = temp.indexOf(toReplace);
     }
     return temp;
 };
 kony.sdk.util.validateDateTypeInput = function(dateType) {
     return (kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.TODAY) || kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.TOMORROW) || kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.YESTERDAY) || kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.CURRENTWEEK) || kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.NEXTWEEK) || kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.LASTWEEK) || kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.CURRENTMONTH) || kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.NEXTMONTH) || kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.LASTMONTH));
 };
 kony.sdk.util.getDateRange = function(dateType) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.util.getDateRange");
     var result = [];
     var currentDate = new Date();
     var formattedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds(), currentDate.getMilliseconds());
     var start;
     var end;
     if (kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.TODAY)) {
         end = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 23, 59, 59);
         start = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 0, 0, 0);
     } else if (kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.TOMORROW)) {
         formattedDate.setDate(formattedDate.getDate() + 1);
         end = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 23, 59, 59);
         start = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 0, 0, 0);
     } else if (kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.YESTERDAY)) {
         formattedDate.setDate(formattedDate.getDate() - 1);
         end = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 23, 59, 59);
         start = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 0, 0, 0);
     } else if (kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.CURRENTWEEK)) {
         var firstDayofWeek = formattedDate.getDate() - formattedDate.getDay();
         var lastDayofWeek = firstDayofWeek + 6;
         formattedDate.setDate(firstDayofWeek);
         start = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 0, 0, 0);
         formattedDate.setDate(lastDayofWeek);
         end = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 23, 59, 59);
     } else if (kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.LASTWEEK)) {
         formattedDate.setDate(formattedDate.getDate() - 7);
         var firstDayofWeek = formattedDate.getDate() - formattedDate.getDay();
         var lastDayofWeek = firstDayofWeek + 6;
         formattedDate.setDate(firstDayofWeek);
         start = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 0, 0, 0);
         formattedDate.setDate(lastDayofWeek);
         end = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 23, 59, 59);
     } else if (kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.NEXTWEEK)) {
         formattedDate.setDate(formattedDate.getDate() + 7);
         var firstDayofWeek = formattedDate.getDate() - formattedDate.getDay();
         var lastDayofWeek = firstDayofWeek + 6;
         formattedDate.setDate(firstDayofWeek);
         start = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 0, 0, 0);
         formattedDate.setDate(lastDayofWeek);
         end = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), formattedDate.getDate(), 23, 59, 59);
     } else if (kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.CURRENTMONTH)) {
         start = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), 1, 0, 0, 0);
         end = new Date(formattedDate.getFullYear(), formattedDate.getMonth() + 1, 0, 23, 59, 59);
     } else if (kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.LASTMONTH)) {
         start = new Date(formattedDate.getFullYear(), formattedDate.getMonth() - 1, 1, 0, 0, 0, 0);
         end = new Date(formattedDate.getFullYear(), formattedDate.getMonth(), 0, 23, 59, 59, 999);
     } else if (kony.sdk.util.matchIgnoreCase(dateType, kony.sdk.constants.DateTimeType.NEXTMONTH)) {
         start = new Date(formattedDate.getFullYear(), formattedDate.getMonth() + 1, 1, 0, 0, 0, 0);
         end = new Date(formattedDate.getFullYear(), formattedDate.getMonth() + 2, 0, 23, 59, 59, 999);
     } else {
         start = 0;
         end = 0;
     }
     result.push(start);
     result.push(end);
     return result;
 };
 //Helps to prepare the primary condition to get binary data
 kony.sdk.util.getPkTableForBinary = function(objMetadata, columnValues, failureCallback) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.util.getPkTableForBinary");
     var pkTable = {};
     var whereClause = [];
     if (!kony.sdk.isNullOrUndefined(objMetadata.primaryKey)) {
         for (var indx = 0; indx < objMetadata.primaryKey.length; indx++) {
             var pKey = objMetadata.primaryKey[indx];
             var pKeyValue = columnValues[pKey];
             if (kony.sdk.isNullOrUndefined(pKeyValue)) {
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                 return;
             }
             pkTable[pKey] = pKeyValue;
         }
         return pkTable;
     } else {
         kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
     }
 };
 //Helps to provide the Metadata of column in a Object
 kony.sdk.util.getMetadataOfColumn = function(objMetadata, colName) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.util.getMetadataOfColumn");
     if (objMetadata != null && objMetadata != undefined) {
         var columns = objMetadata["columns"];
         if (columns != null && columns != undefined) {
             for (var indx in columns) {
                 var colMeta = columns[indx];
                 if (colMeta["name"] == colName) {
                     return colMeta;
                 }
             }
         }
     }
     return null;
 };
 //Helps in generating kony.sdk.dto.RecordObject from a given complex record
 kony.sdk.util.populateColumnValues = function(record, childRecords) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.util.populateColumnValues");
     var columnValues = {};
     var recordsLength = Object.keys(record).length;
     for (var index = 0; index < recordsLength; index++) {
         var colName = Object.keys(record)[index];
         var colVal = record[colName];
         if (colVal instanceof Array) {
             for (var tempIndex = 0; tempIndex < colVal.length; tempIndex++) {
                 var tempRecord = new kony.sdk.dto.RecordObject();
                 tempRecord.tableName = colName;
                 tempRecord.columnValues = kony.sdk.util.populateColumnValues(record[colName][tempIndex], tempRecord.childRecords);
                 childRecords.push(tempRecord);
             }
         } else {
             columnValues[colName] = colVal;
         }
     }
     return columnValues;
 };
 //Helps in getting the relationship data of an entity from a given relationship list
 kony.sdk.util.getRelationOfEntity = function(relationshipList, entityName) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.util.getRelationOfEntity");
     var i = 0;
     for (; i < relationshipList.length; i++) {
         //considering only OneToMany relationships as it will have parent and child hierarchy
         if (relationshipList[i] != null && relationshipList[i]["relationshipType"] == "OneToMany" && relationshipList[i].relatedEntity.localeCompare(entityName) == 0) {
             return relationshipList[i];
         }
     }
     return null;
 };
 //Helps in finding if a given column name is a primary key
 kony.sdk.util.isPrimaryKey = function(primaryKeyList, columnValue) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.util.isPrimaryKey");
     for (var i = 0; i < primaryKeyList.length; i++) {
         if (primaryKeyList[i] == columnValue) return true;
     }
     return false;
 };
 kony.sdk.util.objectToQueryParams = function(valueObject) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.util.objectToQueryParams ");
     var queryParams = "";
     if (!kony.sdk.isNullOrUndefined(valueObject) && valueObject instanceof Object && Object.keys(valueObject).length > 0) {
         var objCount = Object.keys(valueObject).length;
         for (var i = 0; i < objCount; i++) {
             var tempKey = Object.keys(valueObject)[i];
             if (queryParams.length === 0) queryParams = encodeURIComponent(tempKey) + "=" + encodeURIComponent(valueObject[tempKey]);
             else queryParams = queryParams + "&" + encodeURIComponent(tempKey) + "=" + encodeURIComponent(valueObject[tempKey]);
         }
     }
     return queryParams;
 };
 kony.sdk.util.getPackagedMetadata = function() {
     kony.sdk.logsdk.trace("Entering into   kony.sdk.util.getPackagedMetadata");
     if (kony.sdk.APP_META === undefined || kony.sdk.APP_META === null) {
         kony.sdk.APP_META = {};
     }
     return kony.sdk.APP_META["objectsvc_meta"];
 };
 /**
  User needs to call this API to prepackage the metadata of the app. The data needs to be passed as json object or a stringified version of json object
  */
 kony.sdk.util.setPackagedMetadata = function(metadataJson) {
     kony.sdk.logsdk.trace("Entering into   kony.sdk.util.setPackagedMetadata");
     try {
         if (typeof metadataJson == "object") {
             kony.sdk.APP_META = metadataJson;
         } else if (typeof metadataJson == "string") {
             var parsedMetadata = JSON.parse(metadataJson);
             kony.sdk.APP_META = parsedMetadata;
         }
     } catch (error) {
         kony.sdk.logsdk.error("### kony.sdk.setPackagedMetadata::error while validating the input packaged metadata", error);
     }
 };
 stripTrailingCharacter = function(str, character) {
     kony.sdk.logsdk.trace("Entering into stripTrailingCharacter");
     if (str.substr(str.length - 1) === character) {
         return str.substr(0, str.length - 1);
     }
     return str;
 };
 kony.sdk.setLogLevelFromServerResponse = function(responseHeaders) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.setLogLevelFromServerResponse");
     var sdkRef = kony.sdk.getCurrentInstance();
     if (responseHeaders && responseHeaders[kony.logger.deviceLogLevelHeader]) {
         logLevel = responseHeaders[kony.logger.deviceLogLevelHeader].toUpperCase();
         if (!logLevel.localeCompare(kony.logger.logLevel.NONE.code) && kony.logger.currentLogLevel !== kony.logger.logLevel.NONE) kony.logger.currentLogLevel = kony.logger.logLevel.NONE;
         else if (!logLevel.localeCompare(kony.logger.logLevel.FATAL.code) && kony.logger.currentLogLevel !== kony.logger.logLevel.FATAL) kony.logger.currentLogLevel = kony.logger.logLevel.FATAL;
         else if (!logLevel.localeCompare(kony.logger.logLevel.ERROR.code) && kony.logger.currentLogLevel !== kony.logger.logLevel.ERROR) kony.logger.currentLogLevel = kony.logger.logLevel.ERROR;
         else if (!logLevel.localeCompare(kony.logger.logLevel.WARN.code) && kony.logger.currentLogLevel !== kony.logger.logLevel.WARN) kony.logger.currentLogLevel = kony.logger.logLevel.WARN;
         else if (!logLevel.localeCompare(kony.logger.logLevel.PERF.code) && kony.logger.currentLogLevel !== kony.logger.logLevel.PERF) kony.logger.currentLogLevel = kony.logger.logLevel.PERF;
         else if (!logLevel.localeCompare(kony.logger.logLevel.INFO.code) && kony.logger.currentLogLevel !== kony.logger.logLevel.INFO) kony.logger.currentLogLevel = kony.logger.logLevel.INFO;
         else if (!logLevel.localeCompare(kony.logger.logLevel.DEBUG.code) && kony.logger.currentLogLevel !== kony.logger.logLevel.DEBUG) kony.logger.currentLogLevel = kony.logger.logLevel.DEBUG;
         else if (!logLevel.localeCompare(kony.logger.logLevel.TRACE.code) && kony.logger.currentLogLevel !== kony.logger.logLevel.TRACE) kony.logger.currentLogLevel = kony.logger.logLevel.TRACE;
         else if (!logLevel.localeCompare(kony.logger.logLevel.ALL.code) && kony.logger.currentLogLevel !== kony.logger.logLevel.ALL) kony.logger.currentLogLevel = kony.logger.logLevel.ALL;
         else if (!logLevel.localeCompare('OFF')) {
             kony.logger.deactivatePersistors(kony.logger.networkPersistor);
             kony.logger.currentLogLevel = kony.logger.logLevel.NONE;
             sdkRef.removeGlobalRequestParam(kony.logger.deviceLogLevelHeader, sdkRef.globalRequestParamType.headers);
             return;
         } else {
             return;
         }
         sdkRef.setGlobalRequestParam(kony.logger.deviceLogLevelHeader, logLevel, sdkRef.globalRequestParamType.headers);
         kony.logger.activatePersistors(kony.logger.networkPersistor);
     }
 };
 kony.sdk.prototype.enableDebug = function() {
     kony.sdk.logsdk.trace("Entering into kony.sdk.prototype.enableDebug");
     kony.sdk.isDebugEnabled = true;
 };
 kony.sdk.prototype.disableDebug = function() {
     kony.sdk.logsdk.trace("Entering into kony.sdk.prototype.disableDebug");
     kony.sdk.isDebugEnabled = false;
 };

 function Exception(name, message) {
     kony.sdk.logsdk.error("Exception --> " + name + ": " + message);
     return {
         code: name,
         message: message
     };
 }
 kony.sdk.verifyAndCallClosure = function(closure, params) {
     if (typeof(closure) === 'function') {
         closure(params);
     } else {
         kony.sdk.logsdk.warn("invalid callback", JSON.stringify(closure));
     }
 };
 kony.sdk.overrideUserId = function(userId) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.overrideUserId");
     if (kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_IDE && typeof(kony.setUserID) === 'function') {
         kony.setUserID(userId, true);
     } else {
         konyRef.setCurrentUserId(userId);
     }
 };
 kony.sdk.formatCurrentDate = function(inputDateString) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.formatCurrentDate");
     var dateObj = new Date(inputDateString);
     var year = dateObj.getUTCFullYear();
     var month = kony.sdk.formatDateComponent(dateObj.getUTCMonth() + 1);
     var date = kony.sdk.formatDateComponent(dateObj.getUTCDate());
     var hours = kony.sdk.formatDateComponent(dateObj.getUTCHours());
     var minutes = kony.sdk.formatDateComponent(dateObj.getUTCMinutes());
     var seconds = kony.sdk.formatDateComponent(dateObj.getUTCSeconds());
     var dateSeparator = "-";
     var timeSeparator = ":";
     var dateString = year + dateSeparator + month + dateSeparator + date + " " + hours + timeSeparator + minutes + timeSeparator + seconds;
     return dateString;
 };
 kony.sdk.formatDateComponent = function(dateComponent) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.formatDateComponent");
     if (dateComponent < 10) {
         dateComponent = "0" + dateComponent;
     }
     return dateComponent;
 };
 kony.sdk.isNullOrUndefined = function(val) {
     if (val === null || val === undefined) {
         return true;
     } else {
         return false;
     }
 };
 kony.sdk.constants.reportingType = {
     session: "session",
     custom: "custom"
 };
 kony.sdk.isEmptyObject = function(obj) {
     if (typeof(obj) === "boolean" || typeof(obj) === "number") {
         return false;
     } else if (typeof(obj) === "string") {
         return obj.trim().length === 0;
     }
     for (var prop in obj) {
         return false;
     }
     return true;
 };
 kony.sdk.isArray = function(data) {
     if (data && Object.prototype.toString.call(data) === '[object Array]') {
         return true;
     }
     return false;
 };
 kony.sdk.formatSuccessResponse = function(data) {
     if (data && data.httpresponse) {
         delete data.httpresponse;
     }
     return data;
 };
 kony.sdk.isJson = function(str) {
     try {
         JSON.parse(str);
     } catch (e) {
         return false;
     }
     return true;
 };
 kony.sdk.util.getString = function(val) {
     if (!kony.sdk.isNullOrUndefined(val) && (val.toString()).toLocaleLowerCase() !== "null") {
         return val.toString();
     }
     return "";
 };
 //private method to identify whether session/token expired or not based on error code
 kony.sdk.isSessionOrTokenExpired = function(mfcode) {
     if (mfcode && (mfcode === "Auth-5" || mfcode === "Auth-6" || mfcode === "Gateway-31" || mfcode === "Gateway-33" || mfcode === "Gateway-35" || mfcode === "Gateway-36" || mfcode === "Auth-46" || mfcode === "Auth-55")) {
         return true;
     }
     return false;
 };
 //private method to clear cache
 kony.sdk.resetProviderKeys = function(konyRef, _providerName) {
     try {
         if (konyRef) {
             if (_providerName) {
                 if (konyRef.tokens.hasOwnProperty(_providerName)) {
                     konyRef.tokens[_providerName] = null;
                 }
             }
         }
     } catch (e) {
         kony.sdk.logsdk.error("Error while clearing the cache..");
     }
 };
 //private method to clear cache
 kony.sdk.resetCurrentKeys = function(konyRef, _providerName) {
     try {
         if (konyRef) {
             konyRef.currentClaimToken = null;
             konyRef.currentBackEndToken = null;
             konyRef.claimTokenExpiry = null;
             konyRef.currentRefreshToken = null;
             //setting the anonymous provider as true to access the public protected urls without any issue
             konyRef.isAnonymousProvider = true;
             if (_providerName) {
                 if (konyRef.tokens.hasOwnProperty(_providerName)) {
                     konyRef.tokens[_providerName] = null;
                 }
             }
         }
     } catch (e) {
         kony.sdk.logsdk.error("Error while clearing the cache..");
     }
 };
 kony.sdk.util.populateIndividualServiceLists = function(serviceConfig, objectToPopulate) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.util.populateIndividualServiceLists");
     var svcMeta = serviceConfig["services_meta"];
     if (kony.sdk.isNullOrUndefined(objectToPopulate["objectsvc"])) {
         objectToPopulate["objectsvc"] = {};
     }
     if (kony.sdk.isNullOrUndefined(objectToPopulate["offlineObjectsvc"])) {
         objectToPopulate["offlineObjectsvc"] = {};
     }
     if (svcMeta) {
         for (var svc in svcMeta) {
             if (svcMeta.hasOwnProperty(svc)) {
                 var svcObj = svcMeta[svc];
                 if (svcObj && svcObj["type"] === "objectsvc") {
                     if (!kony.sdk.isNullOrUndefined(svcObj["offline"])) {
                         if (svcObj["offline"] === false) {
                             objectToPopulate["objectsvc"][svc] = svcObj;
                         } else if (svcObj["offline"] === true) {
                             objectToPopulate["offlineObjectsvc"][svc] = svcObj;
                         }
                     } else {
                         objectToPopulate["objectsvc"][svc] = svcObj;
                         objectToPopulate["offlineObjectsvc"][svc] = svcObj;
                     }
                 } else if (svcObj && svcObj["type"] === "integsvc") {
                     objectToPopulate["integsvc"][svc] = svcObj;
                 }
             }
         }
     }
 };
 /**
  * Generates hash code for the URL by sha512 algorithm
  * @param url
  * @param requestParams
  * @return {*}
  */
 kony.sdk.util.generateHashcodeForURL = function(url, requestParams) {
     var concatenatedResult = "";
     var hashID = null;
     if (!kony.sdk.isNullOrUndefined(url)) concatenatedResult += url;
     if (!kony.sdk.isNullOrUndefined(requestParams)) {
         concatenatedResult += JSON.stringify(requestParams);
     }
     if (kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_IDE && !kony.sdk.util.isNullOrEmptyString(concatenatedResult)) {
         hashID = kony.crypto.createHash("sha512", concatenatedResult);
     }
     return hashID;
 };
 /**
  * Utility function to save the response in the cache.
  * @param options {object} save the response with key options["cacheID"]. If not provided then we will calculate hashcode by url and requestData.
  * @param url {string}
  * @param requestData {object}
  * @param response {object}
  */
 function cacheResponseForKey(options, url, requestData, response) {
     var hashCode = null;
     if (options["cacheID"]) hashCode = options["cacheID"];
     else hashCode = kony.sdk.util.generateHashcodeForURL(url, requestData);
     if (hashCode) {
         if (typeof(hashCode) !== "string") {
             hashCode = hashCode.toString();
         }
         var expiry = options["expiryTime"] ? options["expiryTime"] : kony.sdk.constants.DEFAULT_CACHE_EXPIRY_TIME;
         response["cacheID"] = hashCode;
         new kony.sdk.ClientCache().add(hashCode, response, expiry);
     }
 }
 kony.sdk.util.isNullOrEmptyString = function(val) {
     if (kony.sdk.isNullOrUndefined(val) || (typeof(val) === "string" && val.trim() === "")) {
         return true;
     }
     return false;
 };

 function doesMFSupportsAppversioning() {
     // In case of IDE platforms we will check the existence of appConfig.svcDoc.service_doc_etag for compatibility of app version with the MF.
     // In case of plain-js & phone gap initOptions should not be sent during init call.
     if (kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_IDE && !kony.sdk.isNullOrUndefined(appConfig) && !kony.sdk.isNullOrUndefined(appConfig.svcDoc) && !kony.sdk.isNullOrUndefined(appConfig.svcDoc.service_doc_etag)) {
         return true;
     } else if (kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_PLAIN_JS || kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_PHONEGAP) {
         return true;
     } else {
         return false;
     }
 }

 function populateHeaderWithFabricAppVersion(headers) {
     if (doesMFSupportsAppversioning() && !kony.sdk.isNullOrUndefined(headers) && !kony.sdk.isNullOrUndefined(kony.sdk.getFabricAppVersion())) {
         headers[kony.sdk.constants.APP_VERSION_HEADER] = kony.sdk.getFabricAppVersion();
     }
 }
 /*
  * Utility method to check whether options has browserWidget or not
  * @return true if it supports
  * */
 kony.sdk.util.hasBrowserWidget = function(options) {
     return options && options[kony.sdk.constants.BROWSER_WIDGET] && kony.sdk.util.type(options[kony.sdk.constants.BROWSER_WIDGET]) === "kony.ui.Browser";
 };
 /*
  * Utility method to check whether binary is supported
  * @return true if it supports
  * */
 kony.sdk.util.isBinarySupported = function() {
     return kony.sdk.getSdkType() === kony.sdk.constants.SDK_TYPE_IDE && kony.sdk.getAType() === kony.sdk.constants.SDK_ATYPE_NATIVE;
 };
 /*
  ** Intializing SSO FFI's with null implementation
  *  Supporting platforms like IDE has sso_handler which has implementation.
  */
 kony.sdk.util.saveSSOToken = function() {
     kony.sdk.logsdk.warn("kony.sdk.util.saveSSOToken:: SSO is not supported.");
     return null;
 };
 kony.sdk.util.getSSOToken = function() {
     kony.sdk.logsdk.warn("kony.sdk.util.getSSOToken:: SSO is not supported.");
     return null;
 };
 kony.sdk.util.deleteSSOToken = function() {
     kony.sdk.logsdk.warn("kony.sdk.util.deleteSSOToken:: SSO is not supported.");
     return null;
 };
 kony.sdk.util.initializeSSO = function() {
     // STUB code returns nothing
 };
 /*
  ** Utility method to clone any object
  *  @return cloned object
  */
 kony.sdk.cloneObject = function(obj) {
     var clonedObject;
     try {
         clonedObject = JSON.parse(JSON.stringify(obj));
     } catch (err) {
         kony.sdk.logsdk.error("cloning object failed, reverting back to copy");
         clonedObject = obj;
     }
     return clonedObject;
 };
 /**
  * Utility method to check if a given variable is JSON Object
  * @param obj
  * @returns {boolean}
  */
 kony.sdk.util.isJsonObject = function(obj) {
     if (obj === null || obj === undefined) {
         return false;
     }
     return obj.constructor === {}.constructor;
 };
 /**
  * Utility method to check whether the given variable is a valid string
  * @param str
  * @returns {boolean}
  */
 kony.sdk.util.isValidString = function(str) {
     if (str === null || str === undefined || str.constructor !== "".constructor) {
         return false;
     }
     return str.trim() !== ""
 };
 /**
  * Utility method to convert JSON object keys to lower case
  * @param obj {Object} - JSON object
  * @returns convertedJSON {Object} - JSON object keys in lower case and values assigned to respective keys.
  */
 kony.sdk.util.convertJsonKeysToLowerCase = function(obj) {
     var convertedJSON = {};
     if (!kony.sdk.util.isJsonObject(obj)) {
         return obj;
     }
     var keys = Object.keys(obj);
     for (var i = 0; i < keys.length; i++) {
         convertedJSON[keys[i].toLowerCase()] = obj[keys[i]];
     }
     return convertedJSON;
 };
 /**
  * Utility method to get JSON property case-insensitively
  * @param {Object} jsonObject
  * @param {String} key
  * @returns {*}
  */
 kony.sdk.util.getValueForKeyAndIgnoreCase = function(jsonObject, key) {
     var keysInJSON = Object.keys(jsonObject);
     var index = 0;
     for (var jsonKey in keysInJSON) {
         if (keysInJSON[jsonKey].toLocaleLowerCase() === key.toLocaleLowerCase()) {
             return Object.values(jsonObject)[index];
         } else {
             index++
         }
     }
     return null;
 };
 /**
  * Utility method to populate JSON Template
  * @param {String} template
  * @param {Object} templateParams : Input Params provided by the User
  * @return Object containing processed template and missing variables
  */
 kony.sdk.util.populateTemplate = function(template, templateParams) {
     if (kony.sdk.util.isNullOrEmptyString(template) || !kony.sdk.util.isJsonObject(templateParams)) {
         kony.sdk.logsdk.error(kony.sdk.errorConstants.populating_template_failed + " " + kony.sdk.errormessages.populating_template_failed);
         return null;
     }
     var DOLLAR_VARIABLE_PATTERN = /(\${)+(\w.*?)+(})/g;
     var templateVariables = [];
     var missingVariables = [];
     var resultSet = {};
     var populatedTemplate = kony.sdk.cloneObject(template);
     var inputTemplateVariables = populatedTemplate.match(DOLLAR_VARIABLE_PATTERN);
     //Match returns Array of all the matches.
     //Iterating over the array and extracting all template variables.
     for (var iteratorVariable in inputTemplateVariables) {
         var inputVariable = inputTemplateVariables[iteratorVariable].toString();
         var templateParameter = inputVariable.slice(2, (inputVariable.length) - 1);
         templateVariables.push(templateParameter);
     }
     //Populating the template with user inputs.
     for (var iterateVariable = 0; iterateVariable < templateVariables.length; iterateVariable++) {
         var inputParameter = templateVariables[iterateVariable];
         if (templateParams.hasOwnProperty(inputParameter)) {
             populatedTemplate = populatedTemplate.replace("${" + inputParameter + "}", templateParams[inputParameter]);
         } else {
             missingVariables.push(inputParameter);
         }
     }
     resultSet[kony.sdk.constants.PROCESSED_TEMPLATE] = populatedTemplate;
     resultSet[kony.sdk.constants.MISSING_VARIABLES] = missingVariables;
     return resultSet;
 };
 /**
  * Checks if the browser is IE11
  * @returns {boolean}
  */
 kony.sdk.util.checkForIE11 = function() {
     //Checking if this is being run in DesktopWeb
     if (typeof(XMLHttpRequest) !== 'undefined') {
         var ua = window.navigator.userAgent;
         var trident = ua.indexOf('Trident/');
         if (trident > 0) {
             // IE 11 => return version number
             var rv = ua.indexOf('rv:');
             return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10) === 11;
         }
     }
     return false;
 };
 /**
  * Utility method to get persistToken flag from data store
  *
  * @returns {boolean}
  */
 kony.sdk.util.isPersistentLoginResponseEnabled = function() {
         var dataStore = new konyDataStore();
         var persistTokenFlag = dataStore.getItem("persistLoginResponseFlag");
         if (!kony.sdk.isNullOrUndefined(persistTokenFlag) && persistTokenFlag === true) {
             return true;
         }
         return false;
     }
     /**
      * Based on interactive or non-interactive session info from license, returning session type
      * @return {string}
      */
 kony.sdk.util.getSessionType = function() {
     var sessionType;
     if (kony.licensevar && kony.licensevar.isInteractive != undefined) {
         sessionType = kony.licensevar.isInteractive ? kony.sdk.constants.APP_SESSION_INTERACTIVE : kony.sdk.constants.APP_SESSION_NON_INTERACTIVE;
     } else {
         /**
          *In case of phonegap and plain js, we are sending interacting session.
          */
         kony.sdk.logsdk.trace("Updating interacting session in kony reporting params by default");
         sessionType = kony.sdk.constants.APP_SESSION_INTERACTIVE;
     }
     return sessionType;
 };
 /**
  * Utility method to get kony reporting params in encoded string
  * @return {string}
  */
 kony.sdk.getEncodedReportingParamsForSvcid = function(svcid) {
     var reportingData = kony.sdk.getPayload(konyRef);
     reportingData.rsid = kony.sdk.currentInstance.getSessionId();
     if (svcid) {
         reportingData.svcid = svcid;
     } else {
         kony.sdk.logsdk.warn("### kony.sdk.getEncodedReportingParamsForSvcid:: svcid is either null or undefined");
     }
     return encodeURI(JSON.stringify(reportingData));
 };
 kony.sdk.serviceDoc = function() {
     kony.sdk.logsdk.trace("Entering into kony.sdk.serviceDoc");
     var appId = "";
     var baseId = "";
     var services_meta = {};
     var name = "";
     var selflink = "";
     var login = null;
     var integsvc = {};
     var reportingsvc = {};
     var messagingsvc = {};
     var sync = {};
     var objectsvc = {};
     var logicsvc = {};
     this.toJSON = function() {
         servConfig = {};
         servConfig.appId = this.getAppId();
         servConfig.baseId = this.getBaseId();
         servConfig.name = this.getAppName();
         servConfig.selflink = this.getSelfLink();
         servConfig.services_meta = this.getServicesMeta();
         servConfig.login = this.getAuthServices();
         servConfig.integsvc = this.getIntegrationServices();
         servConfig.messagingsvc = this.getMessagingServices();
         servConfig.sync = this.getSyncServices();
         servConfig.reportingsvc = this.getReportingServices();
         servConfig.objectsvc = this.getObjectServices();
         servConfig.logicsvc = this.getLogicServices();
         kony.sdk.util.populateIndividualServiceLists(this, servConfig);
         return servConfig;
     }
     this.setAppId = function(appIdStr) {
         appId = appIdStr;
     };
     this.getAppId = function() {
         return appId;
     };
     this.setBaseId = function(baseIdStr) {
         baseId = baseIdStr;
     };
     this.getBaseId = function() {
         return baseId;
     };
     this.setAppName = function(appName) {
         name = appName;
     };
     this.getAppName = function() {
         return name;
     };
     this.setSelfLink = function(selfLinkStr) {
         selflink = selfLinkStr;
     };
     this.getSelfLink = function() {
         return selflink;
     };

     function setEndPoints(providerType, providerValues) {
         for (var provider in providerValues) {
             providerType[provider] = providerValues[provider];
         }
     }
     this.setAuthService = function(loginProvider) {
         if (login === null) {
             login = [];
         }
         login.push(loginProvider);
     };
     //what will this return? name?
     this.getAuthServiceByName = function(authServiceProvider) {
         if (login === null) {
             return null;
         }
         for (var i in login) {
             var provider = login[i];
             if (provider.prov == authServiceProvider) {
                 return provider;
             }
         }
     };
     this.getAuthServices = function() {
         return login;
     };
     this.setIntegrationService = function(providerName, endPointUrl) {
         integsvc[providerName] = endPointUrl;
     };
     this.getIntegrationServiceByName = function(integrationServiceProviderName) {
         return integsvc[integrationServiceProviderName];
     };
     this.getIntegrationServices = function() {
         return integsvc;
     };
     this.setObjectService = function(providerName, endPointUrl) {
         objectsvc[providerName] = endPointUrl;
     };
     this.getObjectServiceByName = function(objectServiceProviderName) {
         return objectsvc[objectServiceProviderName];
     };
     this.getObjectServices = function() {
         return objectsvc;
     };
     this.getLogicServices = function() {
         return logicsvc;
     };
     this.getServicesMeta = function() {
         return services_meta;
     };
     this.setReportingService = function(reportingType, url) {
         if (reportingType == kony.sdk.constants.reportingType.session || reportingType == kony.sdk.constants.reportingType.custom) {
             reportingsvc[reportingType] = url;
         } else {
             throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, "invalid reporting type " + reportingType);
         }
     }
     this.getReportingServiceByType = function(reportingServiceProviderType) {
         return reportingsvc[reportingServiceProviderType];
     };
     this.getReportingServices = function() {
         return reportingsvc;
     };
     this.setMessagingService = function(appId, url) {
         messagingsvc[appId] = url;
     };
     this.getMessagingServiceByName = function(messagingServiceProviderName) {
         return messagingsvc[messagingServiceProviderName];
     };
     this.getMessagingServices = function() {
         return messagingsvc;
     }
     this.setSyncService = function(syncServiceProvider) {
         sync = syncServiceProvider;
     };
     this.getSyncServices = function() {
         return sync;
     };
 };
 kony.logger = kony.logger || {};
 kony.logger = {
     // Logger constants
     networkPersistorUrlEndpoint: "deviceLogs",
     deviceLogLevelHeader: "X-KONY-DEVICE-LOG-LEVEL",
     filePersistor: 1,
     consolePersistor: 2,
     networkPersistor: 4,
     // Log Level Block which gives all the handle for setting and getting
     //ALL(0) < TRACE(1) < DEBUG(2) < INFO(4) < PEF(8) < WARN(16) < ERROR(32) < FATAL(64) < NONE(127)
     logLevel: {
         NONE: {
             value: 127,
             name: "none",
             code: "NONE"
         },
         FATAL: {
             value: 64,
             name: "fatal",
             code: "FATAL"
         },
         ERROR: {
             value: 32,
             name: "error",
             code: "ERROR"
         },
         WARN: {
             value: 16,
             name: "warn",
             code: "WARN"
         },
         PERF: {
             value: 8,
             name: "perf",
             code: "PERF"
         },
         INFO: {
             value: 4,
             name: "info",
             code: "INFO"
         },
         DEBUG: {
             value: 2,
             name: "debug",
             code: "DEBUG"
         },
         TRACE: {
             value: 1,
             name: "trace",
             code: "TRACE"
         },
         ALL: {
             value: 0,
             name: "all",
             code: "ALL"
         }
     },
     get currentLogLevel() {
         if (typeof(currentLevel) === 'undefined') currentLevel = kony.logger.logLevel.NONE;
         if (kony.logger.isNativeLoggerAvailable()) {
             var logLevelValue = KonyLogger.getLogLevel();
             for (var key in kony.logger.logLevel) {
                 if (kony.logger.logLevel.hasOwnProperty(key)) {
                     if (kony.logger.logLevel[key].value == logLevelValue) {
                         currentLevel = kony.logger.logLevel[key];
                         break;
                     }
                 }
             }
         }
         return currentLevel;
     },
     set currentLogLevel(level) {
         currentLevel = level;
         if (kony.logger.isNativeLoggerAvailable()) KonyLogger.setLogLevel(currentLevel.value);
     },
     isNativeLoggerAvailable: function() {
         if (typeof(KonyLogger) === 'undefined') return false;
         else return true;
     },
     flush: function() {
         if (kony.logger.isNativeLoggerAvailable()) KonyLogger.flush();
     },
     // Persister block for activating and deactivating
     activatePersistors: function(activatedList) {
         if (kony.logger.isNativeLoggerAvailable()) KonyLogger.activatePersistors(activatedList);
     },
     deactivatePersistors: function(deactivatedList) {
         if (kony.logger.isNativeLoggerAvailable()) KonyLogger.deactivatePersistors(deactivatedList);
     },
     //setting claims token after referesh
     setClaimsToken: function() {
         var token = kony.sdk.getCurrentInstance().currentClaimToken;
         if (kony.logger.isNativeLoggerAvailable()) KonyLogger.setClaimsToken(token);
     },
     setConfig: function(loggerConfig) {
         if (kony.logger.isNativeLoggerAvailable()) {
             KonyLogger.setConfig(loggerConfig.getLoggerConfig());
         }
     },
     setPersistorConfig: function(persistor) {
         if (kony.logger.isNativeLoggerAvailable()) {
             KonyLogger.setPersistorConfig(persistor.getPersistorConfig());
         }
     },
     createLoggerObject: function(loggerName, loggerConfig) {
         var loggerObj = {};
         loggerObj.config = parseConfig(loggerConfig);
         loggerObj.trace = function(msg, params) {
             logMessage(loggerObj, kony.logger.logLevel.TRACE, msg, params);
         };
         loggerObj.debug = function(msg, params) {
             logMessage(loggerObj, kony.logger.logLevel.DEBUG, msg, params);
         };
         loggerObj.info = function(msg, params) {
             logMessage(loggerObj, kony.logger.logLevel.INFO, msg, params);
         };
         loggerObj.perf = function(msg, params) {
             logMessage(loggerObj, kony.logger.logLevel.PERF, msg, params);
         };
         loggerObj.warn = function(msg, params) {
             logMessage(loggerObj, kony.logger.logLevel.WARN, msg, params);
         };
         loggerObj.error = function(msg, params) {
             logMessage(loggerObj, kony.logger.logLevel.ERROR, msg, params);
         };
         loggerObj.fatal = function(msg, params) {
             logMessage(loggerObj, kony.logger.logLevel.FATAL, msg, params);
         };
         var indirectionLevel = 0;
         loggerObj.setIndirectionLevel = function(_indirectionLevel) {
             indirectionLevel = _indirectionLevel;
         }
         loggerObj.getIndirectionLevel = function() {
             return indirectionLevel;
         }
         loggerObj.loggerName = loggerName;
         return loggerObj;
     },
     createLoggerConfig: function() {
         var formatC = {};
         var logFilterC = {};
         var accConfig = {};
         var overrideConfig = null;
         var persistorList = [];
         var config = {
             //formatterConfig
             //timeformat
             set timeFormat(val) {
                 formatC.timeFormat = val;
             },
             //timeZone
             set timeZone(val) {
                 formatC.timeZone = val;
             },
             //FilterConfig
             //logLevel
             set logLevel(val) {
                 logFilterC.logLevel = val;
             },
             //accumulatorConfig
             //bytesLimit
             set bytesLimit(val) {
                 accConfig.bytesLimit = val;
             },
             //statementsLimit
             set statementsLimit(val) {
                 accConfig.statementsLimit = val;
             },
             //overrideConfig
             set overrideConfig(val) {
                 overrideConfig = val;
             },
             //peristorList
             get persistorList() {
                 return persistorList;
             },
             addPersistor: function(val) {
                 persistorList.push(val.getPersistorConfig());
             },
             getLoggerConfig: function() {
                 var loggerConfig = {};
                 if (Object.keys(formatC).length > 0) loggerConfig.formatterConfig = formatC;
                 if (Object.keys(logFilterC).length > 0) loggerConfig.logFilterConfig = logFilterC;
                 if (Object.keys(accConfig).length > 0) loggerConfig.accumulatorConfig = accConfig;
                 if (overrideConfig !== null) loggerConfig.overrideConfig = overrideConfig;
                 loggerConfig.persistors = persistorList;
                 return loggerConfig;
             }
         };
         return config;
     },
     createFilePersistor: function() {
         var prop = {};
         var persistorProperties = {
             //Persistor properites
             get persistorType() {
                 return kony.logger.filePersistor;
             },
             //maxNumberOfLogFiles
             set maxNumberOfLogFiles(val) {
                 prop.maxNumberOfLogFiles = val;
             },
             //maxFileSize
             set maxFileSize(val) {
                 prop.maxFileSize = val;
             },
             getPersistorConfig: function() {
                 var perConfig = {};
                 perConfig.type = this.persistorType;
                 if (Object.keys(prop).length > 0) perConfig.properties = prop;
                 return perConfig;
             }
         };
         return persistorProperties;
     },
     createNetworkPersistor: function() {
         var prop = {};
         var persistorProperties = {
             //persistorType
             get persistorType() {
                 return kony.logger.networkPersistor;
             },
             //URL
             set URL(val) {
                 prop.URL = val;
             },
             getPersistorConfig: function() {
                 var perConfig = {};
                 perConfig.type = this.persistorType;
                 if (Object.keys(prop).length > 0) perConfig.properties = prop;
                 return perConfig;
             }
         };
         return persistorProperties;
     },
     appLoggerInitialisation: function() {
         var loggerObj = {};
         loggerObj = new kony.logger.createNewLogger(kony.sdk.constants.APP_LOGGER_NAME, null);
         return loggerObj;
     },
     isValidJSTable: function(inputTable) {
         if (kony.sdk.isNullOrUndefined(inputTable)) {
             return false;
         }
         if (typeof inputTable === "object" || typeof inputTable === "Object" || typeof inputTable === "Array" || typeof inputTable === "array") {
             return true;
         } else {
             return false;
         }
     }
 };
 kony.sdk.FileStorageClasses = (function() {
     var instance = null;
     var LOG_PREFIX = "kony.FileStorageAdapter";
     "use strict";

     function createInstance(url) {
         kony.sdk.logsdk.trace(LOG_PREFIX + ": Creating instance of FileStorageClasses");
         var obj = {};
         obj.listFiles = function(filter, headers, successCallback, failureCallback, options) {
             kony.sdk.logsdk.trace("Invoking list files");
             kony.sdk.claimsRefresh(function() {
                 //claims refresh success callback
                 kony.sdk.logsdk.info("listFiles : Refresh claims token SUCCESS");
                 var headers = kony.sdk.FileStorageClasses.addTokenToHeaders(headers, kony.sdk.getCurrentInstance().currentClaimToken);
                 //Calling FileStorage listFiles API.
                 kony.sdk.FileStorageClasses.listFiles(url, filter, headers, successCallback, failureCallback, options);
             }.bind(this), function(error) {
                 //claims refresh failure callback
                 kony.sdk.logsdk.error("listFiles : Refresh claims token FAILED");
                 failureCallback(error);
             });
         };
         obj.upload = function(uploadInputType, uploadParams, successCallback, failureCallback, options) {
             kony.sdk.logsdk.trace("Invoking upload");
             kony.sdk.claimsRefresh(function() {
                 //claims refresh success callback
                 kony.sdk.logsdk.info("upload : Refresh claims token SUCCESS");
                 var headers = uploadParams["headers"];
                 headers = kony.sdk.FileStorageClasses.addTokenToHeaders(headers, kony.sdk.getCurrentInstance().currentClaimToken);
                 uploadParams["headers"] = headers;
                 //Calling FileStorage upload API.
                 kony.sdk.FileStorageClasses.upload(url, uploadInputType, uploadParams, successCallback, failureCallback, options);
             }.bind(this), function(error) {
                 //claims refresh failure callback
                 kony.sdk.logsdk.error("upload : Refresh claims token FAILED");
                 failureCallback(error);
             });
         };
         obj.download = function(downloadParams, successCallback, failureCallback, options) {
             kony.sdk.logsdk.trace("Invoking downloadFile");
             kony.sdk.claimsRefresh(function() {
                 //claims refresh success callback
                 kony.sdk.logsdk.info("downloadFile : Refresh claims token SUCCESS");
                 var headers = downloadParams["headers"];
                 headers = kony.sdk.FileStorageClasses.addTokenToHeaders(headers, kony.sdk.getCurrentInstance().currentClaimToken);
                 downloadParams["headers"] = headers;
                 kony.sdk.FileStorageClasses.download(url, downloadParams, successCallback, failureCallback, options);
             }.bind(this), function(error) { //claims refresh failure callback
                 kony.sdk.logsdk.error("upload : Refresh claims token FAILED");
                 failureCallback(error);
             });
         };
         obj.deleteById = function(fileId, deleteParams, headers, successCallback, failureCallback, options) {
             kony.sdk.logsdk.trace("Invoking deleteById");
             kony.sdk.claimsRefresh(function() {
                 //claims refresh success callback
                 kony.sdk.logsdk.info("deleteById : Refresh claims token SUCCESS");
                 var headers = kony.sdk.FileStorageClasses.addTokenToHeaders(headers, kony.sdk.getCurrentInstance().currentClaimToken);
                 kony.sdk.FileStorageClasses.deleteById(url, fileId, deleteParams, headers, successCallback, failureCallback, options);
             }.bind(this), function(error) {
                 //claims refresh failure callback
                 kony.sdk.logsdk.error("deleteById : Refresh claims token FAILED");
                 failureCallback(error);
             });
         };
         obj.deleteByCriteria = function(deleteParams, headers, successCallback, failureCallback, options) {
             kony.sdk.logsdk.trace("Invoking deleteByCriteria");
             kony.sdk.claimsRefresh(function() {
                 //claims refresh success callback
                 kony.sdk.logsdk.info("deleteByCriteria : Refresh claims token SUCCESS");
                 var headers = kony.sdk.FileStorageClasses.addTokenToHeaders(headers, kony.sdk.getCurrentInstance().currentClaimToken);
                 kony.sdk.FileStorageClasses.deleteByCriteria(url, deleteParams, headers, successCallback, failureCallback, options);
             }.bind(this), function(error) {
                 //claims refresh failure callback
                 kony.sdk.logsdk.error("deleteByCriteria : Refresh claims token FAILED");
                 failureCallback(error);
             });
         };
         obj.update = function(updateParams, successCallback, failureCallback, options) {
             kony.sdk.logsdk.trace("Invoking update");
             kony.sdk.claimsRefresh(function() {
                 //claims refresh success callback
                 kony.sdk.logsdk.info("update : Refresh claims token SUCCESS");
                 var headers = updateParams["headers"];
                 headers = kony.sdk.FileStorageClasses.addTokenToHeaders(headers, kony.sdk.getCurrentInstance().currentClaimToken);
                 updateParams["headers"] = headers;
                 kony.sdk.FileStorageClasses.update(url, updateParams, successCallback, failureCallback, options);
             }.bind(this), function(error) {
                 //claims refresh failure callback
                 kony.sdk.logsdk.error("deleteByCriteria : Refresh claims token FAILED");
                 failureCallback(error);
             });
         };
         obj.abort = function(fileId, abortParams, headers, successCallback, failureCallback, options) {
             kony.sdk.logsdk.trace("Invoking abort");
             kony.sdk.claimsRefresh(function() {
                 //claims refresh success callback
                 kony.sdk.logsdk.info("abort : Refresh claims token SUCCESS");
                 var headers = kony.sdk.FileStorageClasses.addTokenToHeaders(headers, kony.sdk.getCurrentInstance().currentClaimToken);
                 kony.sdk.FileStorageClasses.abort(url, fileId, abortParams, headers, successCallback, failureCallback, options);
             }.bind(this), function(error) {
                 //claims refresh failure callback
                 kony.sdk.logsdk.error("abort : Refresh claims token FAILED");
                 failureCallback(error);
             });
         };
         return obj;
     }
     return {
         import: function(url) {
             kony.sdk.logsdk.trace(LOG_PREFIX + ": Importing native FileStorageClasses");
             if (instance === null) {
                 instance = createInstance(url);
             }
             return instance;
         }
     };
 })();
 // Add token to headers
 kony.sdk.FileStorageClasses.addTokenToHeaders = function(headers, token) {
     if (kony.sdk.isNullOrUndefined(headers)) {
         headers = {};
     }
     headers["X-Kony-Authorization"] = token;
     return headers;
 };
 kony.sdk.KNYObj = function(name, objectServiceName, namespace) {
     var LOG_PREFIX = "KNYObj";
     kony.sdk.logsdk.info(LOG_PREFIX + ": Creating KNYObj with name " + name);
     var sdkObjectSync = kony.sdk.KNYObj.createSDKObjectSync(name, objectServiceName, namespace);
     this.name = name;
     this.getSdkObjectSync = function() {
         return sdkObjectSync;
     }
     this.startSync = function(syncConfig, successCallback, failureCallback, progressCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Starting sync on " + this.name + " object");
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Refreshing claims token");
         kony.sdk.claimsRefresh(function() { //claims refresh success callback
             kony.sdk.logsdk.info(LOG_PREFIX + ": Refresh claims token SUCCESS");
             var token = kony.sdk.getCurrentInstance().currentClaimToken;
             kony.sdk.OfflineObjects.setToken(token);
             kony.sdk.OfflineObjects.setReportingParams(kony.sdk.getReportingParamsForOfflineObjects());
             kony.sdk.KNYObj.startSync(this, syncConfig, successCallback, failureCallback, progressCallback)
         }.bind(this), function(error) { //claims refresh failure callback
             kony.sdk.logsdk.info(LOG_PREFIX + ": Refresh claims token FAILED");
             failureCallback(error);
         });
     };
     this.getPendingRecordsForUpload = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Fetching PendingEditSyncRecords in " + this.name + " object");
         kony.sdk.KNYObj.getPendingRecordsForUpload(this, options, successCallback, failureCallback);
     };
     this.create = function(record, options, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Create record in " + this.name + " object");
         kony.sdk.KNYObj.create(this, record, options, successCallback, failureCallback);
     };
     this.update = function(record, options, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Update record in " + this.name + " object");
         kony.sdk.KNYObj.update(this, record, options, successCallback, failureCallback);
     };
     this.updateByPK = function(record, options, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Update record by PK in " + this.name + " object");
         kony.sdk.KNYObj.updateByPK(this, record, options, successCallback, failureCallback);
     };
     this.delete = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Delete record in " + this.name + " object");
         kony.sdk.KNYObj.delete(this, options, successCallback, failureCallback);
     };
     this.deleteByPK = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Delete record by PK in " + this.name + " object");
         kony.sdk.KNYObj.deleteByPK(this, options, successCallback, failureCallback);
     };
     this.get = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Get record from " + this.name + " object");
         kony.sdk.KNYObj.get(this, options, successCallback, failureCallback);
     };
     this.getBinary = function(options, fileDownloadStartedCallback, chunkDownloadCompletedCallback, streamDownloadCompletedCallback, fileDownloadCompletedCallback, downloadFailureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Get binary for " + this.name + " object");
         kony.sdk.KNYObj.getBinary(this, options, fileDownloadStartedCallback, chunkDownloadCompletedCallback, streamDownloadCompletedCallback, fileDownloadCompletedCallback, downloadFailureCallback);
     };
     this.getBinaryStatus = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": getBinaryStatus for " + this.name + " object");
         kony.sdk.KNYObj.getBinaryStatus(this, options, successCallback, failureCallback);
     };
     this.rollback = function(primaryKeyValueMap, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Rollback for " + this.name + " object");
         kony.sdk.KNYObj.rollback(this, primaryKeyValueMap, successCallback, failureCallback);
     };
     this.markForUpload = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": MarkForUpload for " + this.name + " object");
         kony.sdk.KNYObj.markForUpload(this, options, successCallback, failureCallback);
     };
     this.getUploadDeferredRecordKeys = function(successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Get deferred record primary keys in " + this.name + " object");
         kony.sdk.KNYObj.getUploadDeferredRecordKeys(this, successCallback, failureCallback);
     };
     this.cancelSync = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Cancel for " + this.name + " object");
         kony.sdk.KNYObj.cancelSync(this, options, successCallback, failureCallback);
     };
 };
 kony.sdk.KNYObjSvc = function(name) {
     var LOG_PREFIX = "KNYObjSvc";
     kony.sdk.logsdk.debug(LOG_PREFIX + ": Creating KNYObjSvc with name " + name);
     var sdkObjectServiceSync = kony.sdk.KNYObjSvc.createSDKObjectServiceSync(name);
     this.name = name;
     this.getSdkObjectServiceSync = function() {
         return sdkObjectServiceSync;
     }
     this.getSdkObjectByName = function(name) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Creating KNYObj with name " + name + " and objectServiceName " + this.name);
         return new kony.sdk.KNYObj(name, this.name);
     }
     this.startSync = function(syncConfig, successCallback, failureCallback, progressCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Starting sync on " + this.name + " object service");
         kony.sdk.logsdk.trace(LOG_PREFIX + ": Refreshing claims token");
         kony.sdk.claimsRefresh(function() { //claims refresh success callback
             kony.sdk.logsdk.info(LOG_PREFIX + ": Refresh claims token SUCCESS");
             var token = kony.sdk.getCurrentInstance().currentClaimToken;
             kony.sdk.OfflineObjects.setToken(token);
             kony.sdk.OfflineObjects.setReportingParams(kony.sdk.getReportingParamsForOfflineObjects());
             kony.sdk.KNYObjSvc.startSync(this, syncConfig, successCallback, failureCallback, progressCallback)
         }.bind(this), function(error) { //claims refresh failure callback
             kony.sdk.logsdk.error(LOG_PREFIX + ": Refresh claims token FAILED");
             failureCallback(error);
         });
     };
     this.rollback = function(successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Rollback on " + this.name + " object service");
         kony.sdk.KNYObjSvc.rollback(this, successCallback, failureCallback)
     }
     this.cancelSync = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Cancel for " + this.name + " object service");
         kony.sdk.KNYObjSvc.cancelSync(this, options, successCallback, failureCallback);
     }
     this.clearOfflineData = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.debug(LOG_PREFIX + ": Clearing Offline Data for " + this.name + " object service.");
         kony.sdk.KNYObjSvc.clearOfflineData(this, options, successCallback, failureCallback);
     }
 };
 kony.sdk.OfflineObjects = function(objServiceList) {
     var LOG_PREFIX = "OfflineObjects";
     kony.sdk.logsdk.trace(LOG_PREFIX + ": Creating OfflineObjects");
     this.setup = function(options, successCallback, failureCallback) {
         // This check is required for app upgrade from 8.0 to 8.1
         var argSuccessCallback = successCallback;
         var argFailueCallback = failureCallback;
         var setupOptions = (typeof arguments[0] != "function") ? options : null;
         if (setupOptions === null) {
             argSuccessCallback = options;
             argFailueCallback = successCallback;
         }
         kony.sdk.logsdk.trace(LOG_PREFIX + ": OfflineObjects.setup() called");
         kony.sdk.logsdk.trace(LOG_PREFIX + ": Refreshing claims token");
         kony.sdk.claimsRefresh(function() { //claims refresh success callback
             kony.sdk.logsdk.trace(LOG_PREFIX + ": Refresh claims token SUCCESS");
             var token = kony.sdk.getCurrentInstance().currentClaimToken;
             //kony.sdk.logsdk.debug(LOG_PREFIX+": Token : "+token);
             kony.sdk.OfflineObjects.setToken(token);
             kony.sdk.OfflineObjects.setReportingParams(kony.sdk.getReportingParamsForOfflineObjects());
             kony.sdk.OfflineObjects.setup(objServiceList, setupOptions, argSuccessCallback, argFailueCallback);
         }, function() { //claims refresh failure callback
             kony.sdk.logsdk.error(LOG_PREFIX + ": Refresh claims token FAILED. Setup offline started.");
             kony.sdk.OfflineObjects.setup(objServiceList, setupOptions, argSuccessCallback, argFailueCallback);
         });
     };
     this.incrementalSetup = function(options, successCallback, failureCallback) {
         if (!options) {
             options = {};
         }
         options.incrementalSetup = true;
         this.setup(options, successCallback, failureCallback);
     }
     this.drop = function(options, successCallback, failureCallback) {
         // This change is required for app upgrade from 8.0 to 8.1
         var argSuccessCallback = successCallback;
         var argFailueCallback = failureCallback;
         var dropOptions = (typeof arguments[0] != "function") ? options : null;
         if (dropOptions === null) {
             argSuccessCallback = options;
             argFailueCallback = successCallback;
         }
         kony.sdk.logsdk.trace(LOG_PREFIX + ": OfflineObjects.drop() called");
         kony.sdk.OfflineObjects.drop(dropOptions, argSuccessCallback, argFailueCallback);
     }
     this.reset = function(options, successCallback, failureCallback) {
         // This change is required for app upgrade from 8.0 to 8.1
         var argSuccessCallback = successCallback;
         var argFailueCallback = failureCallback;
         var resetOptions = (typeof arguments[0] != "function") ? options : null;
         if (resetOptions === null) {
             argSuccessCallback = options;
             argFailueCallback = successCallback;
         }
         kony.sdk.logsdk.trace(LOG_PREFIX + ": OfflineObjects.reset called");
         kony.sdk.logsdk.trace(LOG_PREFIX + ": Refreshing claims token");
         kony.sdk.claimsRefresh(function() { //claims refresh success callback
             kony.sdk.logsdk.trace(LOG_PREFIX + ": Refresh claims token SUCCESS");
             var token = kony.sdk.getCurrentInstance().currentClaimToken;
             //kony.sdk.logsdk.debug(LOG_PREFIX+": Token : "+token);
             kony.sdk.OfflineObjects.setToken(token);
             kony.sdk.OfflineObjects.setReportingParams(kony.sdk.getReportingParamsForOfflineObjects());
             kony.sdk.OfflineObjects.reset(objServiceList, resetOptions, argSuccessCallback, argFailueCallback);
         }, function(error) { //claims refresh failure callback
             kony.sdk.logsdk.error(LOG_PREFIX + ": Refresh claims token FAILED");
             failureCallback(error);
         });
     }
     this.rollback = function(successCallback, failureCallback) {
         kony.sdk.logsdk.trace(LOG_PREFIX + ": OfflineObjects.rollback() called");
         kony.sdk.OfflineObjects.rollback(successCallback, failureCallback);
     }
     this.executeSelectQuery = function(query, successCallback, failureCallback) {
         kony.sdk.logsdk.trace(LOG_PREFIX + ": OfflineObjects.executeSelectQuery() called");
         kony.sdk.OfflineObjects.executeSelectQuery(query, successCallback, failureCallback);
     }
     this.startSync = function(options, successCallback, failureCallback, progressCallback) {
         kony.sdk.logsdk.trace(LOG_PREFIX + ": OfflineObjects.startSync called");
         kony.sdk.logsdk.trace(LOG_PREFIX + ": Refreshing claims token");
         kony.sdk.claimsRefresh(function() { //claims refresh success callback
             kony.sdk.logsdk.trace(LOG_PREFIX + ": Refresh claims token SUCCESS");
             var token = kony.sdk.getCurrentInstance().currentClaimToken;
             kony.sdk.OfflineObjects.setToken(token);
             kony.sdk.OfflineObjects.setReportingParams(kony.sdk.getReportingParamsForOfflineObjects());
             kony.sdk.OfflineObjects.startSync(options, successCallback, failureCallback, progressCallback);
         }, function(error) { //claims refresh failure callback
             kony.sdk.logsdk.error(LOG_PREFIX + "Application Sync : Refresh claims token FAILED");
             failureCallback(error);
         });
     }
 };
 kony.sdk.OfflineObjects.BinaryStatus = {
         "pending": 2,
         "completed": 4,
         "errored": 8
     }
     //
     //Binary FFI related functions
     //
 if (kony.sdk) {
     kony.sdk.binary = {};
 }
 kony.sdk.binary.constants = {
     ENDPOINT_URL: "endpointUrl",
     DOMAIN: "domain",
     RELATIVE_PATH: "relativepath",
     URL: "URL",
     HEADERS: "headers",
     METHOD: "method",
     UPLOAD_MODE: "uploadMode",
     BLOB: "blob",
     FILE_CONTENT: "${fileContent}",
     FILE: "file",
     HTTP_STATUS_CODE: "httpStatusCode",
     VALID_HTTP_REDIRECT_CODE: "309",
     UPLOAD_MODE_BINARY: "binary",
     UPLOAD_MODE_MULTIPART: "multipart",
     UPLOAD_PARAMS: "uploadParams",
     BLOB_ID: "BlobID",
     CONTEXT: "Context",
     SESSION_ID: "SessionID",
     BLOB_OBJECT: "BlobObject",
     ERROR: "Error",
     FILE_DETAILS: "FileDetails"
 };
 kony.sdk.binary.addMandatoryInternalOptions = function(options) {
     if (kony.sdk.isNullOrUndefined(options)) {
         options = {};
     }
     options[kony.sdk.binary.constants.DOMAIN] = konyRef.sessionReportingURL.split("/IST")[0];
     if (!kony.sdk.isNullOrUndefined(konyRef.currentClaimToken)) {
         options[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = konyRef.currentClaimToken;
     }
     return options;
 };
 kony.sdk.binary.validateUploadParams = function(uploadParams) {
     //Validating user input.
     if (!kony.sdk.util.isJsonObject(uploadParams)) {
         kony.sdk.logsdk.error("### kony.sdk.binary.validateUploadParams :: Error: Upload params should be supplied as valid JSON object");
         return kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_params_instance, "Invalid datatype of uploadParams " + kony.sdk.util.type(uploadParams) + " " + kony.sdk.errormessages.invalid_params_instance)
     }
     // check for fileName
     if (!kony.sdk.util.isValidString(uploadParams[kony.sdk.constants.FILE_NAME])) {
         kony.sdk.logsdk.error("### kony.sdk.binary.validateUploadParams :: Error: fileName : expected string not found");
         return kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_params_instance, "" + "Invalid datatype of fileName " + kony.sdk.util.type(uploadParams[kony.sdk.constants.FILE_NAME]) + " " + kony.sdk.errormessages.invalid_params_instance);
     }
     // Check if fileObject is provided by user
     if (kony.sdk.isNullOrUndefined(uploadParams[kony.sdk.constants.FILE_OBJECT])) {
         kony.sdk.logsdk.error("### kony.sdk.binary.validateUploadParams :: Error: fileObject is not provided - please provide");
         return kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_params_instance, "fileObject is not provided " + kony.sdk.errormessages.invalid_params_instance);
     }
     // check if the fileObject provided by user is browser file object
     if (uploadParams[kony.sdk.constants.FILE_OBJECT].constructor !== File) {
         kony.sdk.logsdk.error("### kony.sdk.binary.validateUploadParams :: Error: fileObject : expected File Object and found " + kony.sdk.util.type(uploadParams[kony.sdk.constants.FILE_OBJECT]));
         return kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_params_instance, "Invalid datatype of fileObject " + kony.sdk.util.type(uploadParams[kony.sdk.constants.FILE_OBJECT]) + " " + kony.sdk.errormessages.invalid_params_instance);
     }
     return null;
 };
 kony.sdk.binary.networkHandler = function(requestUrl, method, headers, requestBody, successCallback, failureCallback) {
     var xmlHttpRequest = new XMLHttpRequest();
     var successCB = successCallback;
     var failureCB = failureCallback;
     if (kony.sdk.constants.HTTP_METHOD_GET === method) {
         xmlHttpRequest.open(kony.sdk.constants.HTTP_METHOD_GET, requestUrl, true);
         xmlHttpRequest.responseType = kony.sdk.binary.constants.BLOB;
     } else {
         // The responseType for the post request will be undefined hence default, which is "text" will be considered
         xmlHttpRequest.open(kony.sdk.constants.HTTP_METHOD_POST, requestUrl, true);
     }
     for (var header in headers) {
         if (headers.hasOwnProperty(header)) {
             xmlHttpRequest.setRequestHeader(header, headers[header]);
         }
     }

     function localRequestCallback() {
         var readyState = 0;
         var response = "";
         var status = xmlHttpRequest.status;
         switch (xmlHttpRequest.readyState) {
             case 0: // UNINITIALIZED
             case 1: // LOADING
             case 2: // LOADED
             case 3: // INTERACTIVE
                 readyState = xmlHttpRequest.readyState;
                 response = "";
                 break;
             case 4: // COMPLETED
                 readyState = xmlHttpRequest.readyState;
                 //Not using hasOwnProperty because its not available on browser generated objects like XMLHTTPRequest
                 if (xmlHttpRequest.response) {
                     response = xmlHttpRequest.response;
                 } else if (xmlHttpRequest.responseText) {
                     response = xmlHttpRequest.responseText;
                 }
                 if (status >= 200 && status <= 300) {
                     kony.sdk.verifyAndCallClosure(successCB, response);
                 } else {
                     kony.sdk.verifyAndCallClosure(failureCB, response);
                 }
                 break;
             default:
                 kony.sdk.logsdk.error("Unknown Error : XMLHttpRequest Error");
         }
     }
     xmlHttpRequest.onreadystatechange = localRequestCallback;
     xmlHttpRequest.send(requestBody);
 };
 kony.sdk.binary.getRequestParamsFromTemplate = function(template, templateParams, options) {
     var requestParamsForBinaryCall = {};
     var parsedTemplateData = kony.sdk.util.populateTemplate(JSON.stringify(template), templateParams);
     var parsedTemplate = JSON.parse(parsedTemplateData[kony.sdk.constants.PROCESSED_TEMPLATE]);
     requestParamsForBinaryCall[kony.sdk.constants.PROCESSED_TEMPLATE] = parsedTemplateData[kony.sdk.constants.PROCESSED_TEMPLATE];
     // TODO: Validate missing variables
     requestParamsForBinaryCall[kony.sdk.constants.MISSING_VARIABLES] = parsedTemplateData[kony.sdk.constants.MISSING_VARIABLES];
     var additionalParams = kony.sdk.binary.addMandatoryInternalOptions(options);
     //Fetching headers from template
     var headers = {};
     if (parsedTemplate.hasOwnProperty(kony.sdk.binary.constants.HEADERS) && kony.sdk.util.isJsonObject(parsedTemplate[kony.sdk.binary.constants.HEADERS]) && Object.keys(parsedTemplate[kony.sdk.binary.constants.HEADERS] > 0)) {
         headers = parsedTemplate[kony.sdk.binary.constants.HEADERS];
     }
     //Parsing the Backend Url from template
     var url = "";
     if (parsedTemplate.hasOwnProperty(kony.sdk.binary.constants.ENDPOINT_URL)) {
         url = parsedTemplate[kony.sdk.binary.constants.ENDPOINT_URL];
     } else if (parsedTemplate.hasOwnProperty(kony.sdk.binary.constants.DOMAIN) && parsedTemplate.hasOwnProperty(kony.sdk.binary.constants.RELATIVE_PATH)) {
         var domain = "";
         if (parsedTemplate[kony.sdk.binary.constants.DOMAIN] === "#middlewaredomain") {
             headers[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = additionalParams[kony.sdk.constants.KONY_AUTHORIZATION_HEADER];
             domain = additionalParams[kony.sdk.binary.constants.DOMAIN];
         } else {
             domain = parsedTemplate[kony.sdk.binary.constants.DOMAIN];
         }
         url = domain + parsedTemplate[kony.sdk.binary.constants.RELATIVE_PATH];
     }
     requestParamsForBinaryCall[kony.sdk.binary.constants.URL] = url;
     requestParamsForBinaryCall[kony.sdk.binary.constants.METHOD] = parsedTemplate[kony.sdk.binary.constants.METHOD];
     requestParamsForBinaryCall[kony.sdk.binary.constants.HEADERS] = headers;
     return requestParamsForBinaryCall;
 };
 kony.sdk.binary.getBinaryData = function(inputParams, streaming, downloadConfig, fileDownloadStartedCallback, chunkDownloadCompletedCallback, fileDownloadCompletedCallback, fileDownloadFailureCallback, options) {
     if (kony.sdk.isNullOrUndefined(downloadConfig[kony.sdk.binary.constants.ENDPOINT_URL]) && kony.sdk.isNullOrUndefined(downloadConfig[kony.sdk.binary.constants.DOMAIN]) && kony.sdk.isNullOrUndefined(downloadConfig[kony.sdk.binary.constants.RELATIVE_PATH])) {
         kony.sdk.verifyAndCallClosure(fileDownloadFailureCallback, "endpointUrl or domain and relative path is required in order to download a file");
         return;
     }
     var fileId = new Date().getTime().toString();
     kony.sdk.verifyAndCallClosure(fileDownloadStartedCallback, {
         "BlobID": fileId,
         "Context": inputParams
     });
     var requestParams = kony.sdk.binary.getRequestParamsFromTemplate(downloadConfig, inputParams, options);
     var parsedTemplate = JSON.parse(requestParams[kony.sdk.constants.PROCESSED_TEMPLATE]);
     if (parsedTemplate[kony.sdk.binary.constants.HTTP_STATUS_CODE] == kony.sdk.binary.constants.VALID_HTTP_REDIRECT_CODE) {
         kony.sdk.binary.networkHandler(requestParams[kony.sdk.binary.constants.URL], requestParams[kony.sdk.binary.constants.METHOD].toLocaleUpperCase(), requestParams[kony.sdk.binary.constants.HEADERS], null, function(blobObject) {
             var successObject = {};
             if (kony.sdk.isNullOrUndefined(inputParams["fileId"])) {
                 successObject[kony.sdk.binary.constants.BLOB_ID] = fileId;
             } else {
                 successObject[kony.sdk.binary.constants.BLOB_ID] = inputParams["fileId"];
             }
             successObject[kony.sdk.binary.constants.BLOB_OBJECT] = blobObject;
             successObject[kony.sdk.binary.constants.CONTEXT] = inputParams;
             kony.sdk.verifyAndCallClosure(fileDownloadCompletedCallback, successObject);
         }, function(networkError) {
             var errorObject = {};
             if (kony.sdk.isNullOrUndefined(inputParams["fileId"])) {
                 errorObject[kony.sdk.binary.constants.BLOB_ID] = fileId;
             } else {
                 errorObject[kony.sdk.binary.constants.BLOB_ID] = inputParams["fileId"];
             }
             errorObject[kony.sdk.binary.constants.CONTEXT] = inputParams;
             errorObject[kony.sdk.binary.constants.ERROR] = networkError;
             kony.sdk.verifyAndCallClosure(fileDownloadFailureCallback, errorObject);
         });
     } else {
         //TODO: Handle http status which is not 309
         kony.sdk.verifyAndCallClosure(fileDownloadFailureCallback, "Unhandled httpStatusCode received: " + parsedTemplate[kony.sdk.binary.constants.HTTP_STATUS_CODE]);
     }
 };
 kony.sdk.binary.uploadBinaryData = function(uploadParams, fileUploadStartedCallback, chunkUploadCompletedCallback, fileUploadCompletedCallback, fileUploadFailureCallback, options) {
     function templateFetchSuccess(uploadConfig) {
         if (kony.sdk.isNullOrUndefined(uploadConfig[kony.sdk.binary.constants.ENDPOINT_URL]) && kony.sdk.isNullOrUndefined(uploadConfig[kony.sdk.binary.constants.DOMAIN]) && kony.sdk.isNullOrUndefined(uploadConfig[kony.sdk.binary.constants.RELATIVE_PATH])) {
             kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, "endpointUrl or domain and relative path is required in order to upload a file");
             return;
         }
         var sessionId = new Date().getTime().toString();
         kony.sdk.verifyAndCallClosure(fileUploadStartedCallback, {
             "SessionID": sessionId,
             "Context": uploadParams[kony.sdk.binary.constants.UPLOAD_PARAMS]
         });
         var requestParams = kony.sdk.binary.getRequestParamsFromTemplate(uploadConfig, uploadParams[kony.sdk.binary.constants.UPLOAD_PARAMS], options);
         var parsedTemplate = JSON.parse(requestParams[kony.sdk.constants.PROCESSED_TEMPLATE]);
         if (parsedTemplate[kony.sdk.binary.constants.HTTP_STATUS_CODE] == kony.sdk.binary.constants.VALID_HTTP_REDIRECT_CODE) {
             var requestBody;
             var fileObject;
             var requestBodyTemplateVariable = kony.sdk.util.getValueForKeyAndIgnoreCase(parsedTemplate, "requestBody");
             if (parsedTemplate[kony.sdk.binary.constants.UPLOAD_MODE].toLowerCase() === kony.sdk.binary.constants.UPLOAD_MODE_BINARY) {
                 if (requestBodyTemplateVariable === kony.sdk.binary.constants.FILE_CONTENT) {
                     requestBody = uploadParams[kony.sdk.constants.FILE_OBJECT];
                 } else if (kony.sdk.isValidString(requestBodyTemplateVariable) && requestBodyTemplateVariable.indexOf(kony.sdk.binary.constants.FILE_CONTENT) !== -1) {
                     //TODO - handling substituting fileContent in the template variable
                     kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, "Received request body structure is not supported");
                 } else {
                     kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, "Unhandled request body format received");
                 }
             } else if (parsedTemplate[kony.sdk.binary.constants.UPLOAD_MODE].toLowerCase() === kony.sdk.binary.constants.UPLOAD_MODE_MULTIPART) {
                 var formData = new FormData();
                 for (var key in requestBodyTemplateVariable) {
                     if (requestBodyTemplateVariable.hasOwnProperty(key) && kony.sdk.util.isJsonObject(requestBodyTemplateVariable)) {
                         if (requestBodyTemplateVariable[key] === kony.sdk.binary.constants.FILE_CONTENT) {
                             fileObject = uploadParams[kony.sdk.constants.FILE_OBJECT];
                         } else if (kony.sdk.util.isJsonObject(requestBodyTemplateVariable[key])) {
                             formData.append(key, JSON.stringify(requestBodyTemplateVariable[key]));
                         } else {
                             kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, "Unhandled request body format received");
                         }
                     }
                 }
                 formData.append(kony.sdk.binary.constants.FILE, fileObject);
                 requestBody = formData;
             }
             kony.sdk.binary.networkHandler(requestParams[kony.sdk.binary.constants.URL], requestParams[kony.sdk.binary.constants.METHOD].toLocaleUpperCase(), requestParams[kony.sdk.binary.constants.HEADERS], requestBody, function(networkResponse) {
                 var successObject = {};
                 successObject[kony.sdk.binary.constants.SESSION_ID] = sessionId;
                 successObject[kony.sdk.binary.constants.CONTEXT] = uploadParams[kony.sdk.binary.constants.UPLOAD_PARAMS];
                 successObject[kony.sdk.binary.constants.FILE_DETAILS] = networkResponse;
                 kony.sdk.verifyAndCallClosure(fileUploadCompletedCallback, successObject);
             }, function(networkError) {
                 var errorObject = {};
                 errorObject[kony.sdk.binary.constants.SESSION_ID] = sessionId;
                 errorObject[kony.sdk.binary.constants.CONTEXT] = uploadParams[kony.sdk.binary.constants.UPLOAD_PARAMS];
                 errorObject[kony.sdk.binary.constants.ERROR] = networkError;
                 kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, errorObject);
             });
         } else {
             //TODO: Handle http status which is not 309
             kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, "Unhandled httpStatusCode received: " + parsedTemplate[kony.sdk.binary.constants.HTTP_STATUS_CODE]);
         }
     }
     //Invoking the template call
     var networkProvider = new konyNetworkProvider();
     networkProvider.post(uploadParams[kony.sdk.binary.constants.URL], uploadParams[kony.sdk.binary.constants.UPLOAD_PARAMS], uploadParams[kony.sdk.binary.constants.HEADERS], templateFetchSuccess, fileUploadFailureCallback)
 };
 if (typeof(kony.sdk.metric) === "undefined") {
     kony.sdk.metric = {};
 }
 kony.sdk.metric.eventFlowTag = "";
 kony.sdk.metric.eventConfig = {
     "confType": "BUFFER",
     "eventBufferAutoFlushCount": kony.sdk.metric.eventBufferAutoFlushValue,
     "eventBufferMaxCount": kony.sdk.metric.eventBufferMaxValue
 };
 kony.sdk.metric.eventBufferMaxValue = 1000;
 kony.sdk.metric.eventBufferAutoFlushValue = 15;
 kony.sdk.metric.characterLengthLimit = 256;
 kony.sdk.metric.reportEventBufferArray = [];
 kony.sdk.metric.reportEventBufferBackupArray = [];
 kony.sdk.metric.retrievedDS = false;
 kony.sdk.metric.eventBufferCount = 0;
 kony.sdk.metric.eventTypeMap = {
     "formentry": "FormEntry",
     "touch": "Touch",
     "servicecall": "ServiceCall",
     "gesture": "Gesture",
     "orientation": "Orientation",
     "custom": "Custom"
 };
 kony.sdk.metric.errorCodeMap = {
     "1000": true,
     "1011": true,
     "1012": true,
     "1014": true,
     "1015": true,
     "1016": true
 };
 kony.sdk.metric.setEventFlowTag = function(flowTag) {
     if (kony.sdk.isNullOrUndefined(flowTag)) {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Invalid value for event flow tag");
     } else if (flowTag.length <= kony.sdk.metric.characterLengthLimit) {
         kony.sdk.metric.eventFlowTag = flowTag;
     } else {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Length exceeded, Maximum length of event flow tag is " + kony.sdk.metric.characterLengthLimit + " characters");
     }
 };
 kony.sdk.metric.clearEventFlowTag = function() {
     kony.sdk.metric.eventFlowTag = "";
 };
 kony.sdk.metric.getEventFlowTag = function() {
     return kony.sdk.metric.eventFlowTag;
 };
 kony.sdk.metric.setEventConfig = function(confType, eventBufferAutoFlushCount, eventBufferMaxCount) {
     if (kony.sdk.isNullOrUndefined(confType)) {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Config Type can not be null");
     } else {
         confType = confType.toUpperCase();
     }
     if (confType === "BUFFER") {
         kony.sdk.metric.eventConfig["confType"] = confType;
     } else {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Invalid value for config type");
     }
     if (!kony.sdk.isNullOrUndefined(eventBufferMaxCount) && typeof(eventBufferMaxCount) === "number" && eventBufferMaxCount > 0) {
         kony.sdk.metric.eventConfig["eventBufferMaxCount"] = eventBufferMaxCount;
     } else {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "eventBufferMaxCount has to be a Number and greater than 0");
     }
     if (!kony.sdk.isNullOrUndefined(eventBufferAutoFlushCount) && typeof(eventBufferAutoFlushCount) === "number" && eventBufferAutoFlushCount > 0 && eventBufferAutoFlushCount <= eventBufferMaxCount) {
         kony.sdk.metric.eventConfig["eventBufferAutoFlushCount"] = eventBufferAutoFlushCount;
     } else if (eventBufferAutoFlushCount >= eventBufferMaxCount) {
         kony.sdk.metric.eventConfig["eventBufferMaxCount"] = 1000;
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "eventBufferAutoFlushCount can not be greater than eventBufferMaxCount");
     } else {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "eventBufferAutoFlushCount has to be a Number and greater than 0");
     }
 };
 kony.sdk.metric.reportEvent = function(evttype, evtSubType, formID, widgetID, flowTag) {
     if (kony.sdk.metric.reportEventBufferBackupArray.length === 0) {
         kony.sdk.metric.readFromDS();
     }
     kony.sdk.metric.eventBufferCount = kony.sdk.metric.reportEventBufferBackupArray.length + kony.sdk.metric.reportEventBufferArray.length;
     if (kony.sdk.metric.eventBufferCount === kony.sdk.metric.eventConfig["eventBufferMaxCount"]) {
         throw new Exception(kony.sdk.errorConstants.DATA_STORE_EXCEPTION, "Reached maximum limit to store events");
         return;
     }
     var reportEventMap = {};
     reportEventMap.ts = kony.sdk.formatCurrentDate(new Date());
     evttype = evttype.toLowerCase();
     if (kony.sdk.isNullOrUndefined(kony.sdk.metric.eventTypeMap[evttype])) {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Invalid value for event type");
         return;
     } else {
         reportEventMap["evttype"] = kony.sdk.metric.eventTypeMap[evttype];
     }
     if (kony.sdk.isNullOrUndefined(evtSubType)) {
         reportEventMap["evtSubType"] = "";
     } else if (evtSubType.length <= kony.sdk.metric.characterLengthLimit) {
         reportEventMap["evtSubType"] = evtSubType;
     } else {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Length exceeded, Maximum length of event flow tag is " + kony.sdk.metric.characterLengthLimit + " characters");
         return;
     }
     if (kony.sdk.isNullOrUndefined(formID)) {
         reportEventMap["formID"] = kony.application.getCurrentForm().id;
     } else if (formID.length <= kony.sdk.metric.characterLengthLimit) {
         reportEventMap["formID"] = formID;
     } else {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Length exceeded, Maximum length of event flow tag is " + kony.sdk.metric.characterLengthLimit + " characters");
         return;
     }
     if (kony.sdk.isNullOrUndefined(widgetID)) {
         reportEventMap["widgetID"] = "";
     } else if (widgetID.length <= kony.sdk.metric.characterLengthLimit) {
         reportEventMap["widgetID"] = widgetID;
     } else {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Length exceeded, Maximum length of event flow tag is " + kony.sdk.metric.characterLengthLimit + " characters");
         return;
     }
     if (kony.sdk.isNullOrUndefined(flowTag)) {
         reportEventMap["flowTag"] = kony.sdk.metric.getEventFlowTag();
     } else if (flowTag.length <= kony.sdk.metric.characterLengthLimit) {
         reportEventMap["flowTag"] = flowTag;
     } else {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Length exceeded, Maximum length of event flow tag is " + kony.sdk.metric.characterLengthLimit + " characters");
         return;
     }
     reportEventMap.SID = kony.ds.read(kony.sdk.constants.KONYUUID)[0];
     kony.sdk.metric.reportEventBufferArray.push(reportEventMap);
     if (kony.sdk.metric.reportEventBufferArray.length % kony.sdk.metric.eventConfig["eventBufferAutoFlushCount"] === 0) {
         kony.sdk.metric.flushEvents();
     }
 };
 kony.sdk.metric.flushEvents = function() {
     if (kony.sdk.metric.reportEventBufferBackupArray.length === 0) {
         kony.sdk.metric.readFromDS();
     }
     if (kony.sdk.metric.reportEventBufferBackupArray.length === 0 && kony.sdk.metric.reportEventBufferArray.length === 0) {
         kony.sdk.logsdk.warn("There are no events to flush");
         return;
     }
     var payload = kony.sdk.getPayload(kony.sdk.getCurrentInstance());
     var params = {};
     if (kony.sdk.metric.reportEventBufferArray.length !== 0) {
         kony.sdk.metric.pushEventsToBufferArray();
     }
     var headers = {};
     headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
     params.httpheaders = headers;
     payload.events = kony.sdk.metric.reportEventBufferBackupArray;
     payload.svcid = "SendEvents";
     payload.rsid = kony.sdk.metric.reportEventBufferBackupArray[0].SID;
     params[kony.sdk.constants.REPORTING_PARAMS] = JSON.stringify(payload);
     kony.net.invokeServiceAsync(kony.sdk.currentInstance.customReportingURL, params, flushCallback);

     function flushCallback(status, response) {
         if (status === 400) {
             if (response.opstatus == 0) {
                 kony.sdk.metric.clearBufferEvents();
             } else if (kony.sdk.metric.errorCodeMap[response.opstatus]) {
                 kony.sdk.metric.saveInDS();
             } else {
                 kony.sdk.metric.clearBufferEvents();
             }
         } else if (status === 300) {
             kony.sdk.metric.saveInDS();
         }
     }
 };
 /*Stores event data in Data Store on failure of service Call*/
 kony.sdk.metric.saveInDS = function() {
     if (!kony.sdk.isNullOrUndefined(kony.sdk.metric.reportEventBufferBackupArray) && kony.sdk.metric.reportEventBufferBackupArray.length > 0) {
         var eventsToSave = [];
         eventsToSave.push(JSON.stringify(kony.sdk.metric.reportEventBufferBackupArray));
         kony.ds.save(eventsToSave, "konyMetricsBuffer");
         kony.sdk.metric.reportEventBufferBackupArray = [];
     }
 };
 /*Clearing events sent to server */
 kony.sdk.metric.clearBufferEvents = function() {
     kony.sdk.metric.reportEventBufferBackupArray = [];
     kony.ds.remove("konyMetricsBuffer");
 };
 /*Reading any pending events from Data Store */
 kony.sdk.metric.readFromDS = function() {
     var eventsFromDS = kony.ds.read("konyMetricsBuffer");
     if (eventsFromDS !== null) {
         var pushToArray = [];
         pushToArray.push(JSON.parse(eventsFromDS[0]));
         kony.sdk.metric.reportEventBufferBackupArray.push.apply(kony.sdk.metric.reportEventBufferBackupArray, pushToArray);
     }
 };
 /*Pushes events received from user to BufferBackupArray which will be flushed to server */
 kony.sdk.metric.pushEventsToBufferArray = function() {
     kony.sdk.metric.reportEventBufferBackupArray.push.apply(kony.sdk.metric.reportEventBufferBackupArray, kony.sdk.metric.reportEventBufferArray);
     kony.sdk.metric.reportEventBufferArray = [];
 };
 kony.sdk.metric.getEventsInBuffer = function() {
     var eventsFromDS = kony.ds.read("konyMetricsBuffer");
     var eventsToReturn = [];
     if (!kony.sdk.isNullOrUndefined(eventsFromDS)) {
         eventsToReturn.push(JSON.parse(eventsFromDS[0]));
     }
     if (kony.sdk.metric.reportEventBufferArray.length !== 0) {
         eventsToReturn.push.apply(eventsToReturn, kony.sdk.metric.reportEventBufferArray);
     }
     if (eventsToReturn.length !== 0) {
         return eventsToReturn;
     } else {
         return null;
     }
 };
 kony.logger = kony.logger || {};
 kony.logger.createNewLogger = function(loggerName, loggerConfig) {
     parseConfig = function(loggerConfig) {
         //private methods
         if (loggerConfig === null || typeof(loggerConfig) === 'undefined') {
             loggerConfig = {};
         } else {
             loggerConfig = loggerConfig.getLoggerConfig();
         }
         if (typeof(appConfig) != 'undefined') {
             appDetails = {
                 appID: appConfig.appId,
                 appVersion: appConfig.appVersion,
                 sessionID: kony.license.getSessionId()
             };
             //appInfo
             loggerConfig.appInfo = appDetails;
         }
         return loggerConfig;
     };
     logMessage = function(loggerObj, logLevel, msg, params) {
         logMessageInFFI = function(NativeLoggerObject, logLevel, message) {
             switch (logLevel) {
                 case kony.logger.logLevel.TRACE:
                     NativeLoggerObject.logTrace(message);
                     break;
                 case kony.logger.logLevel.DEBUG:
                     NativeLoggerObject.logDebug(message);
                     break;
                 case kony.logger.logLevel.INFO:
                     NativeLoggerObject.logInfo(message);
                     break;
                 case kony.logger.logLevel.PERF:
                     NativeLoggerObject.logPerf(message);
                     break;
                 case kony.logger.logLevel.WARN:
                     NativeLoggerObject.logWarning(message);
                     break;
                 case kony.logger.logLevel.ERROR:
                     NativeLoggerObject.logError(message);
                     break;
                 case kony.logger.logLevel.FATAL:
                     NativeLoggerObject.logFatal(message);
                     break;
                 default:
                     kony.print("Implementation not found for the specified log level " + logLevel);
                     return;
             }
         };
         formatLineInfo = function(callerInformation) {
             if (callerInformation.length == 3) {
                 return callerInformation[1];
             }
             // MFSDK-3910
             // Temporary Fix to send line number as null if not present instead of undefined(<null>)
             return "";
         };
         formatFileInfo = function(callerInformation) {
             if (callerInformation.length >= 1) {
                 callerInformation = callerInformation[callerInformation.length - 1];
                 callerInformation = callerInformation.replace("(", "");
                 callerInformation = callerInformation.replace(")", "");
                 callerInformation = callerInformation.split(":");
                 if (callerInformation.length == 3) {
                     return callerInformation[0];
                 }
             }
         };
         formatMethodInformation = function(callerInformation) {
             if (callerInformation.length > 1) return callerInformation[callerInformation.length - 2];
         };
         formatCallerInformation = function(callerInformation) {
             //JSCore syntax: <methodName>@<fileName>:<row>:<col>
             //V8 syntax: at <methodName> (<fileName>:<row>:<col>)
             //Chakra syntax: at (<methodURL> <fileURL>:<row>:<col>)
             if (callerInformation !== null) {
                 var seperator = " ";
                 formattedCallerInformation = callerInformation.split(seperator);
                 return formattedCallerInformation;
             }
             return [];
         };
         getCallerInformationFromCallStack = function(callStack, indirectionLevel) {
             var index = 5;
             index += indirectionLevel;
             if (callStack.length >= index) return callStack[index];
             return null;
         };
         generateCallerInformation = function(indirectionLevel) {
             var errorObject = new Error();
             var callStack;
             // In IE, Error object doesn't contain stack information, hence can't provide caller info
             if (errorObject.hasOwnProperty("stack")) {
                 callStack = errorObject.stack.split("\n");
             } else {
                 callStack = [];
             }
             var callerInformation = getCallerInformationFromCallStack(callStack, indirectionLevel);
             return formatCallerInformation(callerInformation);
         };
         parseMessage = function(loggerObj, logLevel, msg, params) {
             var logLevelVal = (kony.logger.isNativeLoggerAvailable()) ? KonyLogger.getLogLevel() : kony.logger.currentLogLevel.value;
             if (logLevel.value >= logLevelVal) {
                 var metaData = {};
                 params = (typeof(params) === "undefined") ? "" : params;
                 //Stringify object
                 if (kony.logger.isValidJSTable(params)) {
                     params = JSON.stringify(params, null, " ");
                 }
                 metaData.message = msg + params;
                 metaData.callerInformation = generateCallerInformation(loggerObj.getIndirectionLevel());
                 metaData.methodName = formatMethodInformation(metaData.callerInformation);
                 metaData.fileName = formatFileInfo(metaData.callerInformation);
                 metaData.lineNo = formatLineInfo(metaData.callerInformation);
                 if (kony.logger.isNativeLoggerAvailable()) {
                     if (!loggerObj.NativeLoggerObject) {
                         loggerObj.NativeLoggerObject = new KonyLogger.InitializeLogger(loggerObj.loggerName);
                         KonyLogger.setConfig(loggerObj.config);
                     }
                     if (loggerObj.NativeLoggerObject) {
                         logMessageInFFI(loggerObj.NativeLoggerObject, logLevel, metaData);
                     } else {
                         var date = new Date().toLocaleDateString();
                         var time = new Date().toLocaleTimeString();
                         var level = logLevel.code;
                         var formattedMessage = "[" + loggerObj.loggerName + "][" + level + "][" + date + " " + time + "][" + metaData.fileName + "][" + metaData.methodName + "][" + metaData.lineNo + "] : " + metaData.message;
                         kony.print(formattedMessage);
                     }
                 } else {
                     var date = new Date().toLocaleDateString();
                     var time = new Date().toLocaleTimeString();
                     var level = logLevel.code;
                     var formattedMessage = "[" + loggerObj.loggerName + "][" + level + "][" + date + " " + time + "][" + metaData.fileName + "][" + metaData.methodName + "][" + metaData.lineNo + "] : " + metaData.message;
                     kony.print(formattedMessage);
                 }
             }
         };
         parseMessage(loggerObj, logLevel, msg, params);
     };
     //Exposed object and it's methods
     var loggerObj = kony.logger.createLoggerObject(loggerName, loggerConfig);
     //Native object creation
     if (kony.logger.isNativeLoggerAvailable()) {
         loggerObj.NativeLoggerObject = new KonyLogger.InitializeLogger(loggerName);
         KonyLogger.setConfig(loggerObj.config);
     }
     return loggerObj;
 }
 kony.logger["appLogger"] = kony.logger.appLoggerInitialisation();
 /**
  * MFSDK
  * Created by KH2204.
  * Copyright © 2018 Kony. All rights reserved.
  */
 /**
  * Method to create the integration service instance with the provided service name.
  * @param {string} serviceName - Name of the service
  * @returns {IntegrationService} Integration service instance
  */
 kony.sdk.prototype.getIntegrationService = function(serviceName) {
     if (!kony.sdk.isInitialized) {
         throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, kony.sdk.constants.INIT_FAILURE_MESSAGE + "integration service :" + serviceName);
     }
     var konyRef = kony.sdk.getCurrentInstance();
     if (!kony.sdk.skipAnonymousCall && !this.currentClaimToken && !konyRef.isAnonymousProvider) {
         throw new Exception(kony.sdk.errorConstants.AUTH_FAILURE, "Valid claims token is not found, login using identity service before performing an operation on this integration service :" + serviceName);
     }
     if (this.integsvc != null) {
         if (this.integsvc[serviceName] != null) {
             kony.sdk.logsdk.debug("found integration service" + this.integsvc[serviceName]);
             return new IntegrationService(this, serviceName);
         }
     }
     throw new Exception(kony.sdk.errorConstants.INTEGRATION_FAILURE, "Integration service is not found or invalid :" + serviceName);
 };
 /**
  * Method should not be called by developer.
  * @class
  * @classdesc Integration service instance for invoking the integration services.
  */
 function IntegrationService(konyRef, serviceName) {
     var serviceUrl = "";
     var svcObj = konyRef.integsvc[serviceName];
     if (typeof(svcObj) === "object") {
         serviceUrl = svcObj["url"];
     } else {
         serviceUrl = svcObj;
     }
     var networkProvider = new konyNetworkProvider();
     if (kony.sdk.util.isNullOrEmptyString(serviceName) || kony.sdk.util.isNullOrEmptyString(serviceUrl)) {
         throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, "Invalid serviceUrl and serviceName");
     }
     serviceUrl = stripTrailingCharacter(serviceUrl, "/");
     this.getUrl = function() {
         return serviceUrl;
     };
     /**
      * Integration service success callback method.
      * @callback integrationSuccessCallback
      * @param {json} response - Integration service response
      */
     /**
      * Integration service failure callback method.
      * @callback integrationFailureCallback
      * @param {json} error - Error information
      */
     /**
      * invoke the specified operation
      * @param {string} operationName - Name of the operation
      * @param {object} headers - Input headers for the operation
      * @param {object} data - Input data for the operation
      * @param {integrationSuccessCallback} successCallback  - Callback method on success
      * @param {integrationFailureCallback} failureCallback - Callback method on failure
      * @param {object} options - XMLHttpRequest options like withCredentials value.
      */
     this.invokeOperation = function(operationName, headers, data, successCallback, failureCallback, options) {
         function invokeOperationHandler() {
             _invokeOperation(operationName, headers, data, true, successCallback, failureCallback, options);
         }
         if (kony.sdk.skipAnonymousCall) {
             invokeOperationHandler();
         } else {
             kony.sdk.claimsRefresh(invokeOperationHandler, failureCallback);
         }
     };
     /**
      * Integration service API to upload binaries based on adapter template
      * @param {string} operationName - Name of the operation
      * @param {Object} uploadParams - InputContext or template variables
      * @param {callback} fileUploadStartedCallback - Callback which is invoked on start of file upload
      * @param {callback} chunkUploadCompletedCallback - Callback which is invoked on chunk upload
      * @param {callback} fileUploadCompletedCallback - Callback which is invoked on complete of file upload
      * @param {callback} fileUploadFailureCallback - Callback which is invoked in case of error during upload
      * @param {Object} options - Provision for user to send additional options
      */
     this.uploadBinaryData = function(operationName, uploadParams, fileUploadStartedCallback, chunkUploadCompletedCallback, fileUploadCompletedCallback, fileUploadFailureCallback, options) {
         var errorObj = kony.sdk.binary.validateUploadParams(uploadParams);
         if (errorObj) {
             kony.sdk.verifyAndCallClosure(fileUploadFailureCallback, errorObj);
             return;
         }
         // if rawbytes are provided, converting to base64 string as can only receive base datatypes
         if (!kony.sdk.isNullOrUndefined(uploadParams[kony.sdk.constants.RAW_BYTES])) {
             var base64String = kony.convertToBase64(uploadParams[kony.sdk.constants.RAW_BYTES]);
             uploadParams[kony.sdk.constants.RAW_BYTES] = base64String;
         }

         function uploadBinaryDataHandler() {
             var uploadOptions = {};
             uploadOptions["URL"] = serviceUrl + "/" + operationName;
             var headers = {};
             if (!kony.sdk.skipAnonymousCall) {
                 headers[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = kony.sdk.getCurrentInstance().currentClaimToken;
             }
             uploadOptions["headers"] = headers;
             //Extracting Mandatory Params from uploadParams before fetching template
             if (uploadParams[kony.sdk.constants.FILE_PATH]) {
                 uploadOptions[kony.sdk.constants.FILE_PATH] = uploadParams[kony.sdk.constants.FILE_PATH];
                 delete uploadParams[kony.sdk.constants.FILE_PATH];
             } else if (uploadParams[kony.sdk.constants.RAW_BYTES]) {
                 uploadOptions[kony.sdk.constants.RAW_BYTES] = uploadParams[kony.sdk.constants.RAW_BYTES];
                 delete uploadParams[kony.sdk.constants.RAW_BYTES];
             } else if (uploadParams[kony.sdk.constants.FILE_OBJECT]) {
                 uploadOptions[kony.sdk.constants.FILE_OBJECT] = uploadParams[kony.sdk.constants.FILE_OBJECT];
                 delete uploadParams[kony.sdk.constants.FILE_OBJECT]
             }
             uploadOptions["uploadParams"] = uploadParams;
             kony.sdk.binary.uploadBinaryData(uploadOptions, fileUploadStartedCallback, chunkUploadCompletedCallback, fileUploadCompletedCallback, fileUploadFailureCallback, options);
         }
         if (kony.sdk.skipAnonymousCall) {
             uploadBinaryDataHandler();
         } else {
             kony.sdk.claimsRefresh(uploadBinaryDataHandler, fileUploadFailureCallback);
         }
     };
     /**
      * Integration service API to download binaries based on adapter template
      * @param {string} operationName - Name of the operation
      * @param {Object} fileparams - InputContext or template variables
      * @param {boolean} streaming - Boolean value to determine, whether chunks need to be saved to file or sent in callbacks
      * @param {Object} headers - Provision for custom headers
      * @param {callback} fileDownloadStartedCallback - Callback which is invoked on start of file download
      * @param {callback} chunkDownloadCompletedCallback - Callback which is invoked on stream/chunk download
      * @param {callback} fileDownloadCompletedCallback - Callback which is invoked on complete of file download
      * @param {callback} downloadFailureCallback - Callback which is invoked in case of error during download
      * @param {Object} options - Provision for user to send additional options
      */
     this.getBinaryData = function(operationName, fileparams, streaming, headers, fileDownloadStartedCallback, chunkDownloadCompletedCallback, fileDownloadCompletedCallback, downloadFailureCallback, options) {
         function getBinaryDataHandler() {
             _invokeOperation(operationName, headers, fileparams, true, function(downloadConfig) {
                 if (kony.sdk.isNullOrUndefined(downloadConfig)) {
                     downloadConfig = {};
                 }
                 if (options && options["ChunkSize"]) {
                     downloadConfig.ChunkSize = options["ChunkSize"];
                 }
                 if (headers) {
                     if (kony.sdk.isNullOrUndefined(downloadConfig.headers)) {
                         downloadConfig.headers = {};
                     }
                     for (var header in headers) {
                         if (headers.hasOwnProperty(header)) {
                             downloadConfig.headers[header] = headers[header];
                         }
                     }
                 }
                 kony.sdk.binary.getBinaryData(fileparams, streaming, downloadConfig, fileDownloadStartedCallback, chunkDownloadCompletedCallback, fileDownloadCompletedCallback, downloadFailureCallback, options);
             }, downloadFailureCallback, options);
         }
         if (kony.sdk.skipAnonymousCall) {
             // Check to find if the service is public or not, in case of public service anonymous login is not required.
             getBinaryDataHandler();
         } else {
             kony.sdk.claimsRefresh(getBinaryDataHandler, downloadFailureCallback);
         }
     };

     function invokeOperationRetry(operationName, headers, data, successCallback, failureCallback, options) {
         function invokeOperationRetryHandler() {
             _invokeOperation(operationName, headers, data, false, successCallback, failureCallback, options);
         }
         if (kony.sdk.skipAnonymousCall) {
             invokeOperationRetryHandler();
         } else {
             kony.sdk.claimsAndProviderTokenRefresh(invokeOperationRetryHandler, failureCallback);
         }
     }

     function retryServiceCall(errorResponse) {
         if (errorResponse[kony.sdk.constants.MF_CODE]) {
             // check for the mfcode for which,
             // retry should be done.
         } else {
             if (errorResponse[kony.sdk.constants.HTTP_STATUS_CODE] && errorResponse[kony.sdk.constants.HTTP_STATUS_CODE] === 401) {
                 kony.sdk.logsdk.debug("### IntegrationService::retryServiceCall received 401 from fabric, trying to refresh backend token");
                 return true;
             }
         }
     }

     function _invokeOperation(operationName, headers, data, isRetryNeeded, successCallback, failureCallback, options) {
         var requestData = kony.sdk.getEncodedReportingParamsForSvcid(operationName);
         var dataToSend = {};
         for (var key in data) {
             if (data.hasOwnProperty(key)) {
                 dataToSend[key] = data[key];
             }
         }
         var defaultHeaders = {};
         defaultHeaders[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
         defaultHeaders["X-Kony-ReportingParams"] = requestData;
         if (!kony.sdk.skipAnonymousCall) {
             // Check to find if the service is public or not, in case of public service no token is required.
             var token = konyRef.currentClaimToken;
             if (!token) {
                 token = kony.sdk.getCurrentInstance().currentClaimToken;
             }
             defaultHeaders[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = token;
         }
         var deviceId = kony.sdk.getDeviceId();
         if (!kony.sdk.isNullOrUndefined(deviceId)) {
             defaultHeaders["X-Kony-DeviceId"] = deviceId;
         }
         if (typeof(svcObj) === 'object' && svcObj.version) {
             defaultHeaders["X-Kony-API-Version"] = svcObj.version;
         }
         // if the user has defined his own headers, use them
         if (!kony.sdk.isNullOrUndefined(headers)) {
             if ((Object.keys(headers)).length !== 0 && typeof(headers) === "object") {
                 var defaultKeys = Object.keys(defaultHeaders);
                 var lowerCaseHeaders = defaultKeys.map(function(x) {
                     return x.toLowerCase()
                 });
                 for (var header in headers) {
                     var headerConst = header;
                     if (lowerCaseHeaders.indexOf(headerConst.toLowerCase()) !== -1) {
                         for (var i = 0; i < defaultKeys.length; i++) {
                             var tempKey = defaultKeys[i];
                             if (tempKey.toLowerCase() === headerConst.toLowerCase()) {
                                 defaultHeaders[tempKey] = headers[header];
                             }
                         }
                     } else {
                         defaultHeaders[header] = headers[header];
                     }
                 }
             }
         }
         // If useCache is enabled and cacheID is present then network call will be skipped and cached response will be returned.
         if (options && options["useCache"] && options["cacheID"]) {
             var cacheResponse = new kony.sdk.ClientCache().get(options["cacheID"]);
             if (cacheResponse) {
                 kony.sdk.logsdk.debug("Key found in hash, returning cached response.");
                 kony.sdk.verifyAndCallClosure(successCallback, cacheResponse);
                 return;
             }
         }

         function networkSuccessCallback(res) {
             // If useCache is enabled then the response is cached and returned.
             if (options && options["useCache"]) {
                 cacheResponseForKey(options, serviceUrl + "/" + operationName, requestData, res);
             }
             kony.sdk.verifyAndCallClosure(successCallback, res);
         }

         function networkFailureCallback(xhr, status, err) {
             if (xhr && !(status && err)) {
                 err = xhr;
             }
             if (isRetryNeeded === true && retryServiceCall(err) === true) {
                 kony.sdk.logsdk.debug("errorCallback, retrying the operation: " + operationName);
                 invokeOperationRetry(operationName, headers, data, successCallback, failureCallback);
                 return;
             }
             kony.sdk.processIntegrationErrorResponse(err, true, failureCallback);
         }
         networkProvider.post(serviceUrl + "/" + operationName, dataToSend, defaultHeaders, networkSuccessCallback, networkFailureCallback, null, options);
     }
     kony.sdk.processIntegrationErrorResponse = function(err, isAsync, callBack) {
         if (err[kony.sdk.constants.MF_CODE]) {
             //clear the cache if the error code related to session/token expiry
             if (kony.sdk.isSessionOrTokenExpired(err[kony.sdk.constants.MF_CODE])) {
                 kony.sdk.logsdk.info("###IntegrationService::invokeOperationFailure  Session/Token expired. Authenticate and Try again");
                 //TODO: Start a conversation with Suhas and Krishna regarding the scenario wherein one auth session expired and other is still valid.
             }
         }
         if (!isAsync) {
             return kony.sdk.error.getIntegrationErrObj(err);
         } else if (callBack) {
             kony.sdk.verifyAndCallClosure(callBack, kony.sdk.error.getIntegrationErrObj(err));
         }
     };
     //This is an internal api to invoke an service synchronously
     this.invokeOperationSync = function(operationName, headers, data) {
         var res = null;
         res = kony.sdk.claimsRefreshSync();
         if (res && res.message && res.message === "success") {
             return _invokeOperationSync(operationName, headers, data);
         } else {
             return res;
         }
     };

     function _invokeOperationSync(operationName, headers, data) {
         var requestData = {};
         var konyRef = kony.sdk.getCurrentInstance();
         var reportingData = kony.sdk.getEncodedReportingParamsForSvcid(operationName);
         for (var key in data) {
             if (data.hasOwnProperty(key)) {
                 requestData[key] = data[key];
             }
         }
         var token;
         for (var tempToken in konyRef.tokens) {
             if (konyRef.tokens.hasOwnProperty(tempToken) && typeof(tempToken) !== 'function') {
                 token = konyRef.tokens[tempToken];
                 break;
             }
         }
         requestData[kony.sdk.constants.REPORTING_PARAMS] = reportingData;
         var defaultHeaders = {}
         defaultHeaders[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
         defaultHeaders[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = konyRef.currentClaimToken;
         if (typeof(svcObj) === 'object' && svcObj.version) {
             defaultHeaders["X-Kony-API-Version"] = svcObj.version;
         }
         // if the user has defined his own headers, use them
         if ((Object.keys(headers)).length !== 0) {
             var defaultKeys = [];
             defaultKeys = Object.keys(defaultHeaders);
             var defaultkeyLower = {};
             defaultkeyLower = defaultKeys.map(function(x) {
                 return x.toLowerCase()
             });
             for (var header in headers) {
                 var headerConst = header;
                 if (defaultkeyLower.indexOf(headerConst.toLowerCase()) !== -1) {
                     for (var i = 0; i < defaultKeys.length; i++) {
                         var tempKey = defaultKeys[i];
                         if (tempKey.toLowerCase() === headerConst.toLowerCase()) {
                             defaultHeaders[tempKey] = headers[header];
                         }
                     }
                 } else {
                     defaultHeaders[header] = headers[header];
                 }
             }
         }
         var res = null;
         res = networkProvider.postSync(serviceUrl + "/" + operationName, requestData, defaultHeaders);
         if (res.opstatus == 0) {
             return res;
         } else {
             return kony.sdk.processIntegrationErrorResponse(res, false);
         }
     }
 }
 kony.sdk.claimsRefreshSync = function() {
     var konyRef = kony.sdk.getCurrentInstance();
     var networkProvider = new konyNetworkProvider();
     var loginWithAnonymousProvider = function() {
         var identityObject = konyRef.getIdentityService("$anonymousProvider");
         var res = identityObject.anonymousLoginSync(null);
         if (res && JSON.stringify(res) == "{}") {
             return {
                 "message": "success"
             };
         } else {
             return kony.sdk.error.getAuthErrObj(res);
         }
     };
     if (konyRef.currentClaimToken === null) {
         kony.sdk.logsdk.info("claims Token is Unavialable");
         if (konyRef.isAnonymousProvider) {
             return loginWithAnonymousProvider();
         } else {
             return kony.sdk.error.getNullClaimsTokenErrObj();
         }
     } else if (konyRef.claimTokenExpiry && new Date().getTime() > konyRef.claimTokenExpiry) {
         if (konyRef.isAnonymousProvider) {
             return loginWithAnonymousProvider();
         } else {
             kony.sdk.logsdk.info("claims token has expired. fetching new token..");
             var _serviceUrl = stripTrailingCharacter(konyRef.rec.url, "/");
             var _url = _serviceUrl + "/claims";
             kony.sdk.logsdk.debug("service url is " + _url);
             if (konyRef.currentRefreshToken === null) {
                 return kony.sdk.error.getNullRefreshTokenErrObj();
             } else {
                 var headers = {};
                 headers[kony.sdk.constants.AUTHORIZATION_HEADER] = konyRef.currentRefreshToken;
                 headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
                 var data = networkProvider.postSync(_url, {}, headers);
                 if (data.opstatus == 0) {
                     kony.sdk.logsdk.info("refresh success..acquiring new tokens");
                     return kony.sdk.processClaimsSuccessResponse(data, konyRef, false);
                 } else {
                     kony.sdk.logsdk.info("failed to acquire refresh token");
                     return kony.sdk.processClaimsErrorResponse(data, konyRef, false);
                 }
             }
         }
     } else {
         return {
             "message": "success"
         };
     }
 };
 /**
  * Method to create the messaging service instance.
  * @returns {MessagingService} Messaging service instance
  */
 kony.sdk.prototype.getMessagingService = function() {
     if (!kony.sdk.isInitialized) {
         throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, kony.sdk.constants.INIT_FAILURE_MESSAGE + " Messaging service.");
     }
     return new MessagingService(this);
 };
 /**
  * Should not be called by the developer.
  * @class
  * @classdesc Messaging service instance for invoking the Messaging services.
  * @param konyRef - reference to kony object
  */
 function MessagingService(konyRef) {
     var homeUrl = konyRef.messagingsvc.url;
     var appId = konyRef.messagingsvc.appId;
     var networkProvider = new konyNetworkProvider();
     var dsKey_KSID = appId + "_KSID";
     var dsKey_authToken = appId + "_AUTHTOKEN";
     var currentObject = this;
     var geoBoundaryData;
     var KSID;
     var AUTHTOKEN;
     this.getUrl = function() {
         return homeUrl;
     };
     this.setKSID = function(ksid) {
         kony.sdk.dataStore.setItem(dsKey_KSID, ksid);
         KSID = ksid;
     };
     this.getKSID = function() {
         if (!KSID) {
             KSID = kony.sdk.dataStore.getItem(dsKey_KSID);
         }
         return KSID;
     };
     this.setAuthToken = function(authToken) {
         kony.sdk.dataStore.setItem(dsKey_authToken, authToken);
         AUTHTOKEN = authToken
     };
     this.getAuthToken = function(options) {
         if (options && options[kony.sdk.constants.AUTH_TOKEN]) {
             AUTHTOKEN = options[kony.sdk.constants.AUTH_TOKEN];
         } else {
             //retrieving from local store if user given token is null
             AUTHTOKEN = kony.sdk.dataStore.getItem(dsKey_authToken);
         }
         return AUTHTOKEN;
     };
     var setGeoBoundaryData = function(data) {
         kony.sdk.dataStore.setItem("geoBoundaryData", data);
         geoBoundaryData = data;
     };
     var getGeoBoundaryDataForBoundaryId = function(boundaryId) {
         if (!geoBoundaryData) {
             geoBoundaryData = kony.sdk.dataStore.getItem("geoBoundaryData")
         }
         return geoBoundaryData[boundaryId];
     };
     this.setKmsAppId = function(id) {
         appId = id;
     };
     this.getKmsAppId = function() {
         return appId;
     };
     KSID = currentObject.getKSID();
     AUTHTOKEN = currentObject.getAuthToken();
     var registerForMessagingService = function(osType, deviceId, pnsToken, email, authToken, successCallback, failureCallback) {
         var uri = homeUrl + "/subscribers";
         var subscribeParamsJson = {
             "sid": pnsToken,
             "appId": appId,
             "ufid": email,
             "osType": osType,
             "deviceId": deviceId
         };
         if (authToken != undefined && authToken != null) {
             subscribeParamsJson[kony.sdk.constants.AUTH_TOKEN] = authToken;
         }
         var jsonParam = {
             "subscriptionService": {
                 "subscribe": subscribeParamsJson
             }
         };
         var headers = {};
         headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_JSON_CHARSET_UTF8;
         var payload = {
             postdata: JSON.stringify(jsonParam)
         };
         var networkOptions = {};
         networkOptions["disableIntegrity"] = true;
         networkProvider.post(uri, payload, headers, function(data) {
             currentObject.setKSID(data.id);
             currentObject.setAuthToken(authToken);
             kony.sdk.verifyAndCallClosure(successCallback, data);
         }, function(data, status, error) {
             kony.sdk.logsdk.error("ERROR: Failed to register device for KMS");
             var errorObj = {};
             errorObj.data = data;
             errorObj.status = status;
             errorObj.error = error;
             kony.sdk.verifyAndCallClosure(failureCallback, errorObj);
         }, null, networkOptions);
     };
     var subscribeAudienceOrUpdate = function(firstName, lastName, emailId, mobileNumber, country, state, options, successCallback, failureCallback) {
         var uri = homeUrl + kony.sdk.constants.SUBSCRIBE_AUDIENCE;
         var subscribeAudienceJson = {
             "ksid": KSID,
             "firstName": firstName,
             "lastName": lastName,
             "email": emailId,
             "mobileNumber": mobileNumber,
             "country": country,
             "state": state
         };
         var currentdate = new Date();
         //toLocaleString gives current time in below format
         //6/25/2018, 12:38:21 PM
         var datetime = currentdate.toLocaleString('en-US', {
             timeZone: 'UTC'
         });
         //remove , in the current UTC time
         datetime = datetime.replace(",", "");
         subscribeAudienceJson[kony.sdk.constants.LAST_ACTIVE_DATE] = datetime;
         if (!kony.sdk.isNullOrUndefined(options)) {
             for (var key in options) {
                 if (options.hasOwnProperty(key)) {
                     if (key === kony.sdk.constants.AUTH_TOKEN) {
                         subscribeAudienceJson[key] = currentObject.getAuthToken(options);
                     } else {
                         subscribeAudienceJson[key] = options[key];
                     }
                 }
             }
         }
         var headers = {};
         headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_JSON_CHARSET_UTF8;
         var payload = {
             postdata: JSON.stringify(subscribeAudienceJson)
         };
         var networkOptions = {};
         networkOptions[kony.sdk.constants.DISABLE_INTEGRITY] = true;
         networkProvider.post(uri, payload, headers, function(data) {
             //override data store auth token with user given token
             overrideAuthToken(options);
             kony.sdk.verifyAndCallClosure(successCallback, data);
         }, function(data, status, error) {
             kony.sdk.logsdk.error("ERROR: Failed to create or update audience", errorObj);
             var errorObj = {};
             errorObj.data = data;
             errorObj.status = status;
             errorObj.error = error;
             kony.sdk.verifyAndCallClosure(failureCallback, errorObj);
         }, null, networkOptions);
     };
     /**
     * register to messaging service
     * @param {string} osType - Type of the operating system
     * @param {string} deviceId - Device Id
     * @param {string} pnsToken - Token value
     * @param {string} ufid - UFID can be email-id,mobile number or
	 						any dynamic attribute configured as reconciliation key in Engagement console
     * @param {function} successCallback - Callback method on success
     * @param {function} failureCallback - Callback method on failure
     * @param {dictionary} options - {authToken: <Auth Token>}
     */
     this.register = function(osType, deviceId, pnsToken, ufid, successCallback, failureCallback, options) {
         var authToken = null;
         if (kony.sdk.isNullOrUndefined(pnsToken)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid pnsToken/sId, it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(osType)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid osType, it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(deviceId)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid deviceId, it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(ufid)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid email, it cannot be null");
         }
         authToken = currentObject.getAuthToken(options);
         registerForMessagingService(osType, deviceId, pnsToken, ufid, authToken, function(data) {
             //override data store auth token with user given token
             overrideAuthToken(options);
             kony.sdk.verifyAndCallClosure(successCallback, data);
         }, function(errorObj) {
             kony.sdk.logsdk.error("Register :: Register for messaging service failed with error", errorObj);
             kony.sdk.verifyAndCallClosure(failureCallback, errorObj);
         });
     };
     /**
      * register to messaging service
      * @param {string} osType - Type of the operating system
      * @param {string} deviceId - Device Id
      * @param {string} authToken - Authorization Token
      * @param {string} pnsToken - Token value
      * @param {string} email - email
      * @param {function} successCallback - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      */
     /**
      * @deprecated This method is deprecated because authToken can be given as input through options param of
      * register method.
      */
     this.registerWithAuthToken = function(osType, deviceId, pnsToken, email, authToken, successCallback, failureCallback) {
         if (kony.sdk.isNullOrUndefined(pnsToken)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid pnsToken/sId,it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(osType)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid osType, it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(deviceId)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid deviceId, it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(email)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid email, it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(authToken)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid authToken, it cannot be null");
         }
         registerForMessagingService(osType, deviceId, pnsToken, email, authToken, function(data) {
             kony.sdk.verifyAndCallClosure(successCallback, data)
         }, function(errorObj) {
             kony.sdk.verifyAndCallClosure(failureCallback, errorObj);
         });
     };
     var unregisterFromMessagingService = function(authToken, successCallback, failureCallback) {
         var uri = homeUrl + "/subscribers";
         var unsubscribeObj = {
             "ksid": currentObject.getKSID()
         };
         if (authToken != undefined && authToken != null) {
             unsubscribeObj[kony.sdk.constants.AUTH_TOKEN] = authToken;
         }
         var inp = {
             "subscriptionService": {
                 "unsubscribe": unsubscribeObj
             }
         };
         var headers = {};
         headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_JSON_CHARSET_UTF8;
         var payload = {
             postdata: JSON.stringify(inp)
         };
         kony.sdk.logsdk.info("unsubscribe uri:" + uri);
         var networkOptions = {};
         networkOptions[kony.sdk.constants.DISABLE_INTEGRITY] = true;
         networkProvider.post(uri, payload, headers, function(data) {
             kony.sdk.dataStore.removeItem(dsKey_KSID);
             kony.sdk.dataStore.removeItem(dsKey_authToken);
             kony.sdk.verifyAndCallClosure(successCallback, data);
         }, function(data, status, error) {
             kony.sdk.logsdk.error("ERROR: Failed to unregister device for KMS");
             var errorObj = {};
             errorObj.data = data;
             errorObj.status = status;
             errorObj.error = error;
             kony.sdk.verifyAndCallClosure(failureCallback, errorObj);
         }, null, networkOptions);
     };
     /**
      * unregister to messaging service
      * @param {dictionary} options - {authToken: <Auth Token>}
      * @param {function} successCallback - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      */
     this.unregister = function(successCallback, failureCallback, options) {
         var tempKSID = currentObject.getKSID();
         var authToken = null;
         if (typeof(tempKSID) === 'undefined' || tempKSID === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "KSID not available, Register and try again.");
         }
         authToken = currentObject.getAuthToken(options);
         unregisterFromMessagingService(authToken, successCallback, failureCallback);
     };
     /**
      * unregister to messaging service
      * @param {string} authToken - Authorization Token
      * @param {function} successCallback - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      */
     /**
      * @deprecated This method is deprecated because authToken can be given as input through options param of
      * unregister method.
      */
     this.unregisterWithAuthToken = function(authToken, successCallback, failureCallback) {
         var tempKSID = currentObject.getKSID();
         if (typeof(tempKSID) === 'undefined' || tempKSID === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "KSID not available, Register and try again.");
         }
         if (typeof(authToken) === 'undefined' || authToken === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid authToken.");
         }
         unregisterFromMessagingService(authToken, successCallback, failureCallback);
     };
     /**
      * Fetch all messages
      * @param {number} startIndex - starting index
      * @param {number} pageSize - page size
      * @param {function} successCallback - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      * @param {dictionary} options - {authToken: <Auth Token>}
      */
     this.fetchAllMessages = function(startIndex, pageSize, successCallback, failureCallback, options) {
         var tempKSID = currentObject.getKSID();
         if (typeof(tempKSID) === 'undefined' || tempKSID === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "KSID not available, Register and try again.");
         }
         var uri = homeUrl + "/messages/fetch";
         var data = {
             "ksid": tempKSID,
             "startElement": startIndex,
             "elementsPerPage": pageSize
         };
         data[kony.sdk.constants.AUTH_TOKEN] = currentObject.getAuthToken(options);
         var headers = {};
         headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_JSON_CHARSET_UTF8;
         var payload = {
             postdata: JSON.stringify(data)
         };
         var networkOptions = {};
         networkOptions[kony.sdk.constants.DISABLE_INTEGRITY] = true;
         networkProvider.post(uri, payload, headers, function(data) {
             overrideAuthToken(options);
             kony.sdk.verifyAndCallClosure(successCallback, data);
         }, function(errorObj) {
             kony.sdk.logsdk.error("FetchAllMessages :: FetchAllMessages for messaging service failed with error", errorObj);
             kony.sdk.verifyAndCallClosure(failureCallback, errorObj);
         }, null, networkOptions);
     };
     var updateGeoLocationForMessagingService = function(latitude, longitude, locationName, authToken, successCallback, failureCallback) {
         var uri = homeUrl + "/location";
         var data = {
             "ksid": currentObject.getKSID(),
             "latitude": latitude,
             "longitude": longitude
         };
         if (typeof(locationName) === "string") {
             data["locname"] = locationName;
         }
         if (authToken != null && authToken != undefined) {
             data[kony.sdk.constants.AUTH_TOKEN] = authToken;
         }
         var headers = {};
         headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_JSON_CHARSET_UTF8;
         var payload = {
             postdata: JSON.stringify(data)
         };
         var networkOptions = {};
         networkOptions[kony.sdk.constants.DISABLE_INTEGRITY] = true;
         networkProvider.post(uri, payload, headers, function(data) {
             //override data store auth token with user given token
             currentObject.setAuthToken(authToken);
             kony.sdk.verifyAndCallClosure(successCallback, data);
         }, function(errorObj) {
             kony.sdk.logsdk.error("UpdateGeoLocation :: UpdateGeoLocation for messaging service failed with error", errorObj);
             kony.sdk.verifyAndCallClosure(failureCallback, errorObj);
         }, null, networkOptions);
     };
     /**
      * Update the location
      * @param {string} latitude - Latitude value
      * @param {string} longitude - Longitude value
      * @param {string} locationName - Location name
      * @param {function} successCallback - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      * @param {dictionary} options - {authToken: <Auth Token>}
      */
     this.updateGeoLocation = function(latitude, longitude, locationName, successCallback, failureCallback, options) {
         var tempKSID = currentObject.getKSID();
         var authToken = null;
         if (typeof(tempKSID) === 'undefined' || tempKSID === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "KSID not available, Register and try again.");
         }
         if (typeof(latitude) === 'undefined' || latitude === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid latitude.");
         }
         if (typeof(longitude) === 'undefined' || longitude === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid longitude.");
         }
         authToken = currentObject.getAuthToken(options);
         updateGeoLocationForMessagingService(latitude, longitude, locationName, authToken, successCallback, failureCallback);
     };
     /**
      * Update the location
      * @param {string} latitude - Latitude value
      * @param {string} longitude - Longitude value
      * @param {string} locationName - Location name
      * @param {string} authToken - Authorization Token
      * @param {function} successCallback - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      */
     /**
      * @deprecated This method is deprecated because authToken can be given as a input through options param of
      * updateGeoLocation method
      */
     this.updateGeoLocationWithAuthToken = function(latitude, longitude, locationName, authToken, successCallback, failureCallback) {
         var tempKSID = currentObject.getKSID();
         if (typeof(tempKSID) === 'undefined' || tempKSID === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "KSID not available, Register and try again.");
         }
         if (typeof(latitude) === 'undefined' || latitude === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid latitude.");
         }
         if (typeof(longitude) === 'undefined' || longitude === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid longitude.");
         }
         if (typeof(authToken) === 'undefined' || authToken === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid authToken.");
         }
         updateGeoLocationForMessagingService(latitude, longitude, locationName, authToken, successCallback, failureCallback);
     };
     /**
      * Mark the message as read for a given message id
      * @param {string} fetchId - Message id
      * @param {function} successCallback - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      * @param {dictionary} options - {authToken: <Auth Token>}
      */
     this.markMessageRead = function(fetchId, successCallback, failureCallback, options) {
         if (typeof(fetchId) === 'undefined' || fetchId === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid FetchId, it cannot be null");
         }
         var headers = {};
         headers["X-HTTP-Method-Override"] = "get";
         headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_JSON_CHARSET_UTF8;
         var uri = homeUrl + "/messages/open/" + fetchId;
         headers[kony.sdk.constants.DEVICE_AUTHTOKEN_HEADER] = currentObject.getAuthToken(options);
         var networkOptions = {};
         networkOptions[kony.sdk.constants.DISABLE_INTEGRITY] = true;
         networkProvider.get(uri, null, headers, function(data) {
             //override data store auth token with user given token
             overrideAuthToken(options);
             kony.sdk.verifyAndCallClosure(successCallback, data);
         }, function(errorObj) {
             kony.sdk.logsdk.error("MarkMessageRead :: MarkMessageRead for messaging service failed with error", errorObj);
             kony.sdk.verifyAndCallClosure(failureCallback, errorObj);
         }, null, networkOptions);
     };
     /**
      * Fetches the message conetent for a given message id
      * @param {string} fetchId - Message id
      * @param {function} successCallback - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      * @param {dictionary} options - {authToken: <Auth Token>}
      */
     this.fetchMessageContent = function(fetchId, successCallback, failureCallback, options) {
         if (typeof(fetchId) === 'undefined' || fetchId === null) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid FetchId, it cannot be null");
         }
         var uri = homeUrl + "/messages/content/" + fetchId;
         var headers = {};
         headers[kony.sdk.constants.DEVICE_AUTHTOKEN_HEADER] = currentObject.getAuthToken(options);
         var networkOptions = {};
         networkOptions[kony.sdk.constants.DISABLE_INTEGRITY] = true;
         networkProvider.get(uri, null, headers, function(data) {
             //override data store auth token with user given token
             overrideAuthToken(options)
             kony.sdk.verifyAndCallClosure(successCallback, data);
         }, function(errorObj) {
             kony.sdk.logsdk.error("FetchMessageContent :: FetchMessageContent for messaging service failed with error", errorObj);
             kony.sdk.verifyAndCallClosure(failureCallback, errorObj);
         }, null, networkOptions);
     };
     /**
      * subscribeAudience to create a audience for subscribed device
      * @param {string} firstName - audience firstName
      * @param {string} lastName - audience lastName
      * @param {string} emailId - audience emailId
      * @param {string} mobileNumber - audience mobileNumber
      * @param {string} country - country
      * @param {string} state - state
      * @param {Object] options - {authToken: <Auth Token>} and user defined attributes like PAN no,SSN.
      * @param {function} successCallback - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      */
     this.subscribeAudience = function(firstName, lastName, emailId, mobileNumber, country, state, successCallback, failureCallback, options) {
         if (kony.sdk.isNullOrUndefined(KSID)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Register for messaging service before creating or updating");
         }
         if (kony.sdk.isNullOrUndefined(firstName)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid first name, it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(lastName)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid last name, it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(mobileNumber)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid mobile number, it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(emailId)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid email Id, it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(country)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid country, it cannot be null");
         }
         subscribeAudienceOrUpdate(firstName, lastName, emailId, mobileNumber, country, state, options, successCallback, failureCallback);
     };
     /**
      * delete subscribed audience
      * @param {function} successCallback - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      * @param {dictionary} options - {authToken: <Auth Token>}
      **/
     this.unSubscribeAudience = function(successCallback, failureCallback, options) {
         if (kony.sdk.isNullOrUndefined(KSID)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Register for messaging service before unsubscribe audience");
         }
         var uri = homeUrl + kony.sdk.constants.SUBSCRIBE_AUDIENCE + "/" + KSID;
         var headers = {};
         headers[kony.sdk.constants.HTTP_OVERRIDE_HEADER] = kony.sdk.constants.HTTP_METHOD_DELETE;
         headers[kony.sdk.constants.DEVICE_AUTHTOKEN_HEADER] = currentObject.getAuthToken(options);
         var networkOptions = {};
         networkOptions[kony.sdk.constants.DISABLE_INTEGRITY] = true;
         networkProvider.post(uri, null, headers, function(data) {
             //override data store auth token with user given token
             overrideAuthToken(options);
             kony.sdk.verifyAndCallClosure(successCallback, data);
         }, function(err) {
             kony.sdk.logsdk.error("### MessagingService::unSubscribeAudience failed to unsubscribe audience", err);
             kony.sdk.verifyAndCallClosure(failureCallback, err);
         }, null, networkOptions);
     };
     /*
      * get subscribed audience details
      * @param {function} successCallback - Callback method on success
      * @param {function} failureCallback - Callback method on failure
      * @param {dictionary} options - {authToken: <Auth Token>}
      */
     this.getSubscribedAudienceDetails = function(successCallback, failureCallback, options) {
             if (kony.sdk.isNullOrUndefined(KSID)) {
                 throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Register for messaging service before get subscribed audience details");
             }
             var uri = homeUrl + kony.sdk.constants.SUBSCRIBE_AUDIENCE + "/" + KSID;
             var headers = {};
             headers[kony.sdk.constants.HTTP_OVERRIDE_HEADER] = kony.sdk.constants.HTTP_METHOD_GET;
             headers[kony.sdk.constants.DEVICE_AUTHTOKEN_HEADER] = currentObject.getAuthToken(options);
             var networkOptions = {};
             networkOptions[kony.sdk.constants.DISABLE_INTEGRITY] = true;
             networkProvider.get(uri, null, headers, function(data) {
                 //override data store auth token with user given token
                 overrideAuthToken(options);
                 kony.sdk.verifyAndCallClosure(successCallback, data);
             }, function(err) {
                 kony.sdk.logsdk.error("### MessagingService::getSubscribedAudienceDetails failed to get audience details", err);
                 kony.sdk.verifyAndCallClosure(failureCallback, err);
             }, null, networkOptions);
         }
         /*
          * get rich push content
          * @param pushId {string} - pushId for getting rich push content.Which we get after registering
          * for push notifications.
          * @param {function} successCallback - Callback method on success
          * @param {function} failureCallback - Callback method on failure
          * @param {dictionary} options - {authToken: <Auth Token>}
          */
     this.getRichPushContent = function(pushId, successCallback, failureCallback, options) {
         if (kony.sdk.isNullOrUndefined(KSID)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Register for messaging service to get rich push content");
         }
         if (kony.sdk.isNullOrUndefined(pushId)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid PushId,it cannot be null");
         }
         var uri = homeUrl + kony.sdk.constants.RICH_PUSH_MESSAGE + pushId;
         var headers = {};
         headers[kony.sdk.constants.HTTP_OVERRIDE_HEADER] = kony.sdk.constants.HTTP_METHOD_GET;
         headers[kony.sdk.constants.DEVICE_AUTHTOKEN_HEADER] = currentObject.getAuthToken(options);
         var networkOptions = {};
         networkOptions[kony.sdk.constants.DISABLE_INTEGRITY] = true;
         networkProvider.get(uri, null, headers, function(data) {
             //override data store auth token with user given token
             overrideAuthToken(options);
             kony.sdk.verifyAndCallClosure(successCallback, data);
         }, function(err) {
             kony.sdk.logsdk.error("MESSAGING SERVICE :: getRichPushContent failed to get rich content with error", err);
             kony.sdk.verifyAndCallClosure(failureCallback, err);
         }, null, networkOptions);
     };
     /*
      * Update the list of beacons
      * @param {string} uuId - Universally Unique Identifier to identify a beacon in a network
      * @param {string} major - major id to identity and distinguish a group
      * @param {string} minor - distinguishing individual beacons within a group of beacons assigned a major value.
      * @param {function} successCallback - Callback method called on success.
      * @param {function} failureCallback - Callback method called on failure.
      * @param {object} options - options which accepts optional parameters such as ufid,appid and {authToken: <Auth Token>}
      */
     this.updateListOfBeacons = function(uuId, major, minor, successCallback, failureCallback, options) {
         if (kony.sdk.isNullOrUndefined(KSID)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Register for messaging service before updating list of beacons");
         }
         if (kony.sdk.isNullOrUndefined(uuId)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid UUID,it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(major)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid major,it cannot be null");
         }
         if (kony.sdk.isNullOrUndefined(minor)) {
             throw new Exception(kony.sdk.errorConstants.MESSAGING_FAILURE, "Invalid minor,it cannot be null");
         }
         var uri = homeUrl + kony.sdk.constants.BEACON_UPDATE;
         var payload = {};
         payload[kony.sdk.constants.KSID] = KSID;
         var beaconsList = {};
         //beacon object has beacon details like uuid,major and minor
         var beacon = {};
         beacon["uuid"] = uuId;
         beacon["major"] = major;
         beacon["minor"] = minor;
         beaconsList["beacon"] = beacon;
         payload["beacons"] = beaconsList;
         payload[kony.sdk.constants.AUTH_TOKEN] = currentObject.getAuthToken(options);
         //appid and ufid are optional
         if (options && options["ufid"]) {
             payload["ufid"] = options["ufid"];
         }
         if (options && options["appid"]) {
             payload["appid"] = options["appid"];
         }
         var payload = {
             postdata: JSON.stringify(payload)
         }
         var headers = {};
         headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_JSON_CHARSET_UTF8;
         var networkOptions = {};
         networkOptions[kony.sdk.constants.DISABLE_INTEGRITY] = true;
         networkProvider.post(uri, payload, headers, function(data) {
             //override data store auth token with user given token
             overrideAuthToken(options);
             kony.sdk.verifyAndCallClosure(successCallback, data);
         }, function(err) {
             kony.sdk.logsdk.error("MESSAGING SERVICE :: updateListOfBeacons failed to update with error", err);
             kony.sdk.verifyAndCallClosure(failureCallback, err);
         }, null, networkOptions);
     };
     /*
      * Utility method to override datastore authtoken with user given auth token.
      */
     var overrideAuthToken = function(options) {
         var authToken;
         if (options && options[kony.sdk.constants.AUTH_TOKEN]) {
             currentObject.setAuthToken(options[kony.sdk.constants.AUTH_TOKEN]);
         }
     };
 }
 /**
  * Method to create the Metrics service instance with the provided service name.
  * @returns {MetricsService} Metrics service instance
  */
 kony.sdk.prototype.getMetricsService = function() {
     if (!kony.sdk.isInitialized) {
         throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, kony.sdk.constants.INIT_FAILURE_MESSAGE + " Metrics service.");
     }
     if (!kony.sdk.isLicenseUrlAvailable) {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "metrics is not enabled");
     }
     //var metricsServiceObject = null;
     if (this.metricsServiceObject) {
         return this.metricsServiceObject;
     }
     if (this.internalSdkObject) {
         //framework implementation
         this.metricsServiceObject = this.internalSdkObject.getMetricsService();
     } else {
         //sdk local implementation
         this.metricsServiceObject = new MetricsService(this);
     }
     return this.metricsServiceObject;
 };
 /**
  * Should not be called by the developer.
  * @class
  * @classdesc Metrics service instance for invoking the Metrics services.
  */
 function MetricsService(konyRef) {
     var url = konyRef.customReportingURL;
     if (typeof(url) === 'undefined') {
         throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "reporting url is undefined");
     }
     var networkProvider = new konyNetworkProvider();
     /**
      * invoke the getUserId operation
      */
     this.getUserId = function() {
         return konyRef.getUserId();
     };
     //start of event api
     var eventFlowTag = "";
     var eventBufferMaxValue = 1000;
     var eventBufferAutoFlushValue = 15;
     var characterLengthLimit = 256;
     var eventConfig = {
         "confType": "BUFFER",
         "eventBufferAutoFlushCount": eventBufferAutoFlushValue,
         "eventBufferMaxCount": eventBufferMaxValue
     };
     var reportEventBufferArray = [];
     var reportEventBufferBackupArray = [];
     var retrievedDS = false;
     var eventBufferCount = 0;
     var eventTypeMap = {
         "formentry": "FormEntry",
         "formexit": "FormExit",
         "touch": "Touch",
         "servicerequest": "ServiceRequest",
         "serviceresponse": "ServiceResponse",
         "gesture": "Gesture",
         "orientation": "Orientation",
         "error": "Error",
         "exception": "Exception",
         "crash": "Crash",
         "custom": "Custom",
         "servicecall": "ServiceCall",
         "apptransition": "AppTransition",
         "appload": "AppLoad",
         "component": "Component"
     };
     var errorCodeMap = {
         "1000": true,
         "1011": true,
         "1012": true,
         "1014": true,
         "1015": true,
         "1016": true
     };
     /**
      * This method will take the a String to set a Flow Tag for the reported events.
      * @param {string} flowTag - sets flow tag for reporting the events.
      */
     this.setFlowTag = function(flowTag) {
         if (kony.sdk.isNullOrUndefined(flowTag)) {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Invalid value for event flow tag");
         } else if (flowTag.length <= characterLengthLimit) {
             eventFlowTag = flowTag;
         } else {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Length exceeded, Maximum length of event flow tag is " + characterLengthLimit + " characters");
         }
     };
     /**
      * This method will clear the flow tag set by the user previously.
      */
     this.clearFlowTag = function() {
         eventFlowTag = "";
     };
     /**
      * This method will return the a String to set a Flow Tag for the reported events.
      * @return {string} flowTag - flow tag set by the user for reporting the events.
      */
     this.getFlowTag = function() {
         return eventFlowTag;
     };
     /**
      * This method will take the required values to set the event Configuration values.
      * @param {string} confType - sets the Current Configuration Type
      * 					possible values BUFFER or INSTANT.
      * @param {number} eventBufferAutoFlushCount - event buffer count to auto flush the events
      * 								possible values any positive integer
      * 								Default value 15
      * @param {number} eventBufferMaxCount - Maximum event buffer count to store the events
      * 								possible values any positive integer
      * 								Default value 1000
      */
     this.setEventConfig = function(confType, eventBufferAutoFlushCount, eventBufferMaxCount) {
         if (kony.sdk.isNullOrUndefined(confType)) {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Config Type can not be null");
         } else {
             confType = confType.toUpperCase();
         }
         if (confType === "BUFFER") {
             eventConfig["confType"] = confType;
         } else {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Invalid value for config type");
         }
         if (!kony.sdk.isNullOrUndefined(eventBufferMaxCount) && typeof(eventBufferMaxCount) === "number" && eventBufferMaxCount > 0) {
             eventConfig["eventBufferMaxCount"] = eventBufferMaxCount;
         } else {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "eventBufferMaxCount has to be a Number and greater than 0");
         }
         if (!kony.sdk.isNullOrUndefined(eventBufferAutoFlushCount) && typeof(eventBufferAutoFlushCount) === "number" && eventBufferAutoFlushCount > 0 && eventBufferAutoFlushCount <= eventBufferMaxCount) {
             eventConfig["eventBufferAutoFlushCount"] = eventBufferAutoFlushCount;
         } else if (eventBufferAutoFlushCount >= eventBufferMaxCount) {
             eventConfig["eventBufferMaxCount"] = 1000;
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "eventBufferAutoFlushCount can not be greater than eventBufferMaxCount");
         } else {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "eventBufferAutoFlushCount has to be a Number and greater than 0");
         }
     };
     /**
      * This method takes the event details from the developer and schedule it for sending to server as per Configuration values set by the developer.
      * @param {string} evttype - Event Type for the reported event.
      * @param {string} evtSubType - string literal for eventSubType(max 256 Chars)
      * @param {string} formID -   string literal for formID(max 256 Chars)
      * @param {string} widgetID - string literal for widgetID(max 256 Chars)
      * @param {string} flowTag - string literal to override flow tag (max 256 Chars)
      * @param {string} metaData - string to describe metaData
      * @throws Exception
      */
     this.sendEvent = function(evttype, evtSubType, formID, widgetID, flowTag, metaData) {
         if (reportEventBufferBackupArray.length === 0) {
             this.readFromDS();
         }
         eventBufferCount = reportEventBufferBackupArray.length + reportEventBufferArray.length;
         if (eventBufferCount === eventConfig["eventBufferMaxCount"]) {
             throw new Exception(kony.sdk.errorConstants.DATA_STORE_EXCEPTION, "Reached maximum limit to store events");
         }
         var reportEventMap = {};
         reportEventMap.ts = kony.sdk.formatCurrentDate(new Date());
         evttype = evttype.toLowerCase();
         if (kony.sdk.isNullOrUndefined(eventTypeMap[evttype])) {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Invalid value for event type");
         } else {
             reportEventMap["evttype"] = eventTypeMap[evttype];
         }
         if (kony.sdk.isNullOrUndefined(evtSubType)) {
             reportEventMap["evtSubType"] = "";
         } else if (evtSubType.length <= characterLengthLimit) {
             reportEventMap["evtSubType"] = evtSubType;
         } else {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Length exceeded, Maximum length of event evtSubType is " + characterLengthLimit + " characters");
         }
         if (kony.sdk.isNullOrUndefined(formID)) {
             reportEventMap["formID"] = kony.application.getCurrentForm().id;
         } else if (formID.length <= characterLengthLimit) {
             reportEventMap["formID"] = formID;
         } else {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Length exceeded, Maximum length of event formID is " + characterLengthLimit + " characters");
         }
         if (kony.sdk.isNullOrUndefined(widgetID)) {
             reportEventMap["widgetID"] = "";
         } else if (widgetID.length <= characterLengthLimit) {
             reportEventMap["widgetID"] = widgetID;
         } else {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Length exceeded, Maximum length of event widgetID is " + characterLengthLimit + " characters");
         }
         if (kony.sdk.isNullOrUndefined(flowTag)) {
             reportEventMap["flowTag"] = this.getFlowTag();
         } else if (flowTag.length <= characterLengthLimit) {
             reportEventMap["flowTag"] = flowTag;
         } else {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Length exceeded, Maximum length of event flowTag is " + characterLengthLimit + " characters");
         }
         reportEventMap.SID = this.getSessionId();
         reportEventMap.metaData = metaData;
         //checking each event data is a proper json or not
         // 	throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Invalid json string passed for events data");
         // }
         reportEventBufferArray.push(reportEventMap);
         if (reportEventBufferArray.length % eventConfig["eventBufferAutoFlushCount"] === 0) {
             this.flushEvents();
         }
     };
     /**
      * This method will send the buffered events to the server at once.
      */
     this.flushEvents = function() {
         var url = kony.sdk.currentInstance.customReportingURL;
         var ref = this;
         if (reportEventBufferBackupArray.length === 0) {
             ref.readFromDS();
         }
         if (reportEventBufferBackupArray.length === 0 && reportEventBufferArray.length === 0) {
             kony.sdk.logsdk.warn("There are no events to flush");
             return;
         }
         var payload = kony.sdk.getPayload(kony.sdk.getCurrentInstance());
         var params = {};
         if (reportEventBufferArray.length !== 0) {
             ref.pushEventsToBufferArray();
         }
         var headers = {};
         headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
         payload.events = reportEventBufferBackupArray;
         payload.svcid = "SendEvents";
         payload.rsid = this.getSessionId();
         params[kony.sdk.constants.REPORTING_PARAMS] = JSON.stringify(payload);
         var options = {};
         options["disableIntegrity"] = true;
         networkProvider.post(url, params, headers, flushSuccessCallback, flushErrorCallback, null, options);

         function flushSuccessCallback(response) {
             if (response.opstatus == 0) {
                 ref.clearBufferEvents();
             } else if (errorCodeMap[response.opstatus]) {
                 ref.saveInDS();
             } else {
                 ref.clearBufferEvents();
             }
         }

         function flushErrorCallback(response) {
             kony.sdk.logsdk.error("Unable to flush events");
             ref.saveInDS();
         }
     };
     /*Stores event data in Data Store on failure of service Call*/
     this.saveInDS = function() {
         var eventsToSave = [];
         eventsToSave.push(JSON.stringify(reportEventBufferBackupArray));
         kony.ds.save(eventsToSave, "konyMetricsBuffer");
         reportEventBufferBackupArray = [];
     };
     /*Clearing events sent to server */
     this.clearBufferEvents = function() {
         reportEventBufferBackupArray = [];
         kony.ds.remove("konyMetricsBuffer");
     };
     /*Reading any pending events from Data Store */
     this.readFromDS = function() {
         var eventsFromDS = kony.ds.read("konyMetricsBuffer");
         if (eventsFromDS !== null) {
             var pushToArray = [];
             pushToArray.push(JSON.parse(eventsFromDS[0]));
             reportEventBufferBackupArray.push.apply(reportEventBufferBackupArray, pushToArray);
         }
     };
     /*Pushes events received from user to BufferBackupArray which will be flushed to server */
     this.pushEventsToBufferArray = function() {
         reportEventBufferBackupArray.push.apply(reportEventBufferBackupArray, reportEventBufferArray);
         reportEventBufferArray = [];
     };
     /**
      * This method will return the a List of the buffered events.
      * @return {object} events - list of events stored in buffer.
      */
     this.getEventsInBuffer = function() {
         var eventsFromDS = kony.ds.read("konyMetricsBuffer");
         var eventsToReturn = [];
         if (!kony.sdk.isNullOrUndefined(eventsFromDS)) {
             eventsToReturn.push(JSON.parse(eventsFromDS[0]));
         }
         if (reportEventBufferArray.length !== 0) {
             eventsToReturn.push.apply(eventsToReturn, reportEventBufferArray);
         }
         if (eventsToReturn.length !== 0) {
             return eventsToReturn;
         } else {
             return null;
         }
     };
     /**
      * invoke the sendCustomMetrics operation
      * @param {string} reportingGroupID - reporting Group ID
      * @param {object} metrics - metrics being reported
      */
     this.sendCustomMetrics = function(reportingGroupID, metrics) {
         if (typeof(metrics) !== "object") {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Invalid type for metrics data.");
         }
         var reportData = kony.sdk.dataStore.getItem("konyCustomReportData");
         if (!reportData) {
             reportData = [];
         } else {
             reportData = JSON.parse(reportData);
         }
         kony.sdk.dataStore.removeItem("konyCustomReportData");
         var currentData = {};
         currentData.ts = kony.sdk.formatCurrentDate(new Date().toString());
         currentData.fid = reportingGroupID;
         currentData.metrics = metrics;
         currentData.rsid = this.getSessionId();
         reportData.push(currentData);
         //nyRef.getDataStore().setItem("konyCustomReportData",JSON.stringify(reportData));
         var payload = kony.sdk.getPayload(konyRef);
         if (kony.sdk.metric) {
             if (kony.sdk.metric.reportEventBufferBackupArray.length === 0) {
                 kony.sdk.metric.readFromDS();
             }
             kony.sdk.metric.pushEventsToBufferArray();
             payload.events = kony.sdk.metric.reportEventBufferBackupArray;
         }
         payload.reportData = reportData;
         payload.rsid = this.getSessionId();
         payload.svcid = "CaptureKonyCustomMetrics";
         var newData = {};
         newData[kony.sdk.constants.REPORTING_PARAMS] = JSON.stringify(payload);
         var options = {};
         options["disableIntegrity"] = true;
         var headers = {};
         headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
         networkProvider.post(url, newData, headers, function(res) {
             //successcallback
             //konyRef.getDataStore().removeItem("konyCustomReportData");
             if (kony.sdk.metric) {
                 kony.sdk.metric.clearBufferEvents();
             }
             kony.sdk.logsdk.info("metric data successfully sent" + JSON.stringify(res));
         }, function(res) {
             var storeData = kony.sdk.dataStore.getItem("konyCustomReportData");
             if (!storeData) {
                 storeData = reportData;
             } else {
                 storeData = JSON.parse(storeData);
                 reportData.forEach(function(e) {
                     storeData.push(e);
                 });
             }
             if (kony.sdk.metric) {
                 if (kony.sdk.metric.errorCodeMap[res.opstatus]) {
                     kony.sdk.metric.saveInDS();
                 }
             }
             kony.sdk.dataStore.setItem("konyCustomReportData", JSON.stringify(storeData));
             kony.sdk.logsdk.error("Unable to send metric report" + JSON.stringify(res));
         }, true, options);
     };
     /**
      * This method takes the event details from the developer and schedule it for sending to server as per Configuration values set by the developer.
      * @param {string} errorCode - errorCode of the reported error. Can be empty if not applicable
      * @param {string} errorType -   errorType of the reported error. Can be empty if not applicable
      * @param {string} errorMessage - errorMessage of the reported error. Can be empty if not applicable
      * @param {json} errorDetails - errorDetails of the reported error as a json string that can have key-value pairs for the following
     				keys errfile, errmethod, errline, errstacktrace, formID, widgetID, flowTag.
      * @throws Exception
      */
     this.reportError = function(errorCode, errorType, errorMessage, errorDetails) {
         var metaData = {};
         metaData.errcode = errorCode ? errorCode : "";
         metaData.errmsg = errorMessage ? errorMessage : "";
         if (errorDetails && kony.sdk.isJson(errorDetails)) {
             metaData.errfile = errorDetails.errfile ? errorDetails.errfile : "";
             metaData.errmethod = errorDetails.errmethod ? errorDetails.errmethod : "";
             metaData.errline = errorDetails.errline ? errorDetails.errline : "";
             metaData.errstacktrace = errorDetails.errstacktrace ? errorDetails.errstacktrace : "";
             metaData.errcustommsg = errorDetails.errcustommsg ? errorDetails.errcustommsg : "";
             var formID = errorDetails.formID ? errorDetails.formID : "";
             var widgetID = errorDetails.widgetID ? errorDetails.widgetID : "";
             var flowTag = errorDetails.flowTag ? errorDetails.flowTag : "";
             var evtSubType = errorType ? errorType : "";
             this.sendEvent("Error", evtSubType, formID, widgetID, flowTag, JSON.stringify(metaData));
         } else {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Invalid json string passed for error details.");
         }
     };
     /**
      * This method takes the event details from the developer and schedule it for sending to server as per Configuration values set by the developer.
      * @param {string} exceptionCode - Code for the reported exception. Can be empty if not applicable
      * @param {string} exceptionType -   Type of the reported exception. Can be empty if not applicable
      * @param {string} exceptionMessage - Message of the reported exception. Can be empty if not applicable
      * @param {json}   exceptionDetails - Details of the reported exception as a JSON string that can have key-value pairs for the
     				following keys exceptioncode, exceptionfile, exceptionmethod, exceptionline,
     				exceptionstacktrace, formID, widgetID, flowTag.
      * @throws Exception
      */
     this.reportHandledException = function(exceptionCode, exceptionType, exceptionMessage, exceptionDetails) {
         var metaData = {};
         metaData.exceptioncode = exceptionCode ? exceptionCode : "";
         metaData.exceptionmsg = exceptionMessage ? exceptionMessage : "";
         if (exceptionDetails && kony.sdk.isJson(exceptionDetails)) {
             metaData.exceptionfile = exceptionDetails.errfile ? exceptionDetails.errfile : "";
             metaData.exceptionmethod = exceptionDetails.errmethod ? exceptionDetails.errmethod : "";
             metaData.exceptionline = exceptionDetails.errline ? exceptionDetails.errline : "";
             metaData.exceptionstacktrace = exceptionDetails.errstacktrace ? exceptionDetails.errstacktrace : "";
             metaData.exceptioncustommsg = exceptionDetails.errcustommsg ? exceptionDetails.errcustommsg : "";
             var formID = exceptionDetails.formID ? exceptionDetails.formID : "";
             var widgetID = exceptionDetails.widgetID ? exceptionDetails.widgetID : "";
             var flowTag = exceptionDetails.flowTag ? exceptionDetails.flowTag : "";
             var evtSubType = exceptionType ? exceptionType : "";
             this.sendEvent("Exception", evtSubType, formID, widgetID, flowTag, JSON.stringify(metaData));
         } else {
             throw new Exception(kony.sdk.errorConstants.METRICS_FAILURE, "Invalid json string passed for exception details.");
         }
     };
     /**
      * sets the current sessionId
      * @param {string} sessionId
      */
     this.setSessionId = function(sessionId) {
         if (sessionId) {
             kony.sdk.currentInstance.setSessionId(sessionId);
         }
     };
     /**
      * get the current sessionID
      *
      */
     this.getSessionId = function() {
         return kony.sdk.currentInstance.getSessionId();
     };
     /**
      * stub method used for event tracking
      *
      */
     this.setEventTracking = function(eventTypes) {
         // Stub.  This is implemented in native->js binding
     }
 }
 kony.sdk.initiateSession = function() {};
 /**
  * Method which returns the offline enabled ObjectService object
  * @param konyRef
  * @param serviceName
  * @constructor
  */
 kony.sdk.OfflineEnabledObjectService = function(konyRef, serviceName) {
     this.serviceName = serviceName;
     this.konyRef = konyRef;
     /**
      * This method is used to fetch records on the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject)}
      * @param successCallback
      * @param failureCallback
      */
     this.fetch = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineEnabledObjectService.fetch");
         if (!areOptionsValid(options, failureCallback)) {
             return;
         }
         try {
             var dataObject = options[kony.sdk.constants.ObjectServiceConstants.DATAOBJECT];
             var objectName = dataObject.getObjectName();

             function fetchHandler(objMetadata) {
                 var obj = new kony.sdk.KNYObj(objectName);
                 var readOptions = dataObject.getOfflineObjectsOptions();
                 /* If read options are not supplied, caller such as fetchDataForColumns model API would provide a select query object and some callers provide query params.
                  *  We parse the select query or queryParams to suite offline objects read API.
                  */
                 if (!readOptions || Object.keys(readOptions).length == 0) {
                     var selectQueryObject = dataObject.getSelectQueryObject();
                     var queryParams = options[kony.sdk.constants.ObjectServiceConstants.QUERYPARAMS];
                     if (selectQueryObject) {
                         readOptions.projectionColumns = [];
                         var columns = selectQueryObject.getColumns();
                         for (var column in columns) {
                             readOptions.projectionColumns.push(columns[column].getName());
                         }
                         var criteriaList = selectQueryObject.getCriterias();
                         var primaryKeys = {};
                         for (var criteria in criteriaList) {
                             var colObj = criteriaList[criteria].getColumn();
                             if (colObj) {
                                 primaryKeys[colObj.getName()] = criteriaList[criteria].getValue();
                             }
                         }
                         readOptions.primaryKeys = primaryKeys;
                     } else if (queryParams) {
                         var primaryKeys = {};
                         if (objMetadata.primaryKey != null && objMetadata.primaryKey != undefined) {
                             for (var indx = 0; indx < objMetadata.primaryKey.length; indx++) {
                                 var pKey = objMetadata.primaryKey[indx];
                                 var pKeyValue = queryParams[pKey];
                                 if (pKeyValue == null || pKeyValue == undefined || pKeyValue == "") {
                                     kony.sdk.logsdk.error("### OfflineEnabledObjectService:: fetch Error: Primarykey details missing so unable to fetch");
                                     kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                                     return;
                                 }
                                 primaryKeys[pKey] = pKeyValue;
                             }
                             readOptions.primaryKeys = primaryKeys;
                         } else {
                             kony.sdk.logsdk.error("### OfflineEnabledObjectService:: fetch Error: Primarykey details missing so unable to fetch");
                             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                             return;
                         }
                     }
                 }

                 function fetchSuccessHandler(res) {
                     var response = {};
                     response.records = res;
                     successCallback(response);
                 }
                 obj.get(readOptions, fetchSuccessHandler, failureCallback);
             }
             this.getMetadataOfObject(objectName, {}, fetchHandler, failureCallback);
         } catch (error) {
             kony.sdk.logsdk.error("Fetch on offline enabled object failed with error: " + error);
             kony.sdk.verifyAndCallClosure(failureCallback, error);
         }
     };
     /**
      * This method is used to create a record on the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject)}
      * @param successCallback
      * @param failureCallback
      */
     this.create = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineEnabledObjectService.create");
         if (!areOptionsValid(options, failureCallback)) {
             return;
         }
         try {
             var dataObject = options[kony.sdk.constants.ObjectServiceConstants.DATAOBJECT];
             var objectName = dataObject.getObjectName();
             var obj = new kony.sdk.KNYObj(objectName);
             var createOptions = dataObject.getOfflineObjectsOptions();
             var records = dataObject.getRecord();
             obj.create(records, createOptions, successCallback, failureCallback);
         } catch (error) {
             kony.sdk.logsdk.error("Create on offline enabled object failed with error: " + error);
             kony.sdk.verifyAndCallClosure(failureCallback, error);
         }
     };
     /**
      * This method is used to update a record on the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject)}
      * @param successCallback
      * @param failureCallback
      */
     this.update = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineEnabledObjectService.update");
         if (!areOptionsValid(options, failureCallback)) {
             return;
         }
         try {
             var dataObject = options[kony.sdk.constants.ObjectServiceConstants.DATAOBJECT];
             var objectName = dataObject.getObjectName();

             function updateHandler(objMetadata) {
                 var obj = new kony.sdk.KNYObj(objectName);
                 var updateOptions = dataObject.getOfflineObjectsOptions();
                 var records = dataObject.getRecord();
                 // If primary keys are not supplied through options, they are picked from the user supplied record.
                 if (!updateOptions || Object.keys(updateOptions).length == 0 || !updateOptions['primaryKeys']) {
                     if (records) {
                         var primaryKeys = {};
                         if (objMetadata.primaryKey != null && objMetadata.primaryKey != undefined) {
                             for (var indx = 0; indx < objMetadata.primaryKey.length; indx++) {
                                 var pKey = objMetadata.primaryKey[indx];
                                 var pKeyValue = records[pKey];
                                 if (pKeyValue == null || pKeyValue == undefined || pKeyValue == "") {
                                     kony.sdk.logsdk.error("### OfflineEnabledObjectService:: Update Error: Primarykey details missing so unable to update");
                                     kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                                     return;
                                 }
                                 primaryKeys[pKey] = pKeyValue;
                             }
                             updateOptions.primaryKeys = primaryKeys;
                         } else {
                             kony.sdk.logsdk.error("### OfflineEnabledObjectService:: Update Error: Primarykey details missing so unable to update");
                             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                             return;
                         }
                     } else {
                         kony.sdk.logsdk.error("Update Failed: primaryKeys key missing. Please use dataObject setOfflineObjectsOptions to set primaryKeys for update operation.");
                         kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                         return;
                     }
                 }
                 obj.updateByPK(records, updateOptions, successCallback, failureCallback);
             }
             this.getMetadataOfObject(objectName, {}, updateHandler, failureCallback);
         } catch (error) {
             kony.sdk.logsdk.error("Update on offline enabled object failed with error: " + error);
             kony.sdk.verifyAndCallClosure(failureCallback, error);
         }
     };
     /**
      * This method is used to delete a record on the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject)}
      * @param successCallback
      * @param failureCallback
      */
     this.deleteRecord = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineEnabledObjectService.deleteRecord");
         if (!areOptionsValid(options, failureCallback)) {
             return;
         }
         try {
             var dataObject = options[kony.sdk.constants.ObjectServiceConstants.DATAOBJECT];
             var objectName = dataObject.getObjectName();

             function deleteHandler(objMetadata) {
                 var obj = new kony.sdk.KNYObj(objectName);
                 var deleteOptions = dataObject.getOfflineObjectsOptions();
                 // If primary keys are not supplied through options, they are picked from the user supplied record
                 if (!deleteOptions || Object.keys(deleteOptions).length == 0 || !deleteOptions['primaryKeys']) {
                     var records = dataObject.getRecord();
                     if (records) {
                         var primaryKeys = {};
                         if (objMetadata.primaryKey != null && objMetadata.primaryKey != undefined) {
                             for (var indx = 0; indx < objMetadata.primaryKey.length; indx++) {
                                 var pKey = objMetadata.primaryKey[indx];
                                 var pKeyValue = records[pKey];
                                 if (pKeyValue == null || pKeyValue == undefined || pKeyValue == "") {
                                     kony.sdk.logsdk.error("### OfflineEnabledObjectService:: Delete Error: Primarykey details missing so unable to delete");
                                     kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                                     return;
                                 }
                                 primaryKeys[pKey] = pKeyValue;
                             }
                             deleteOptions.primaryKeys = primaryKeys;
                         } else {
                             kony.sdk.logsdk.error("### OfflineEnabledObjectService:: Delete Error: Primarykey details missing so unable to delete");
                             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                             return;
                         }
                     } else {
                         kony.sdk.logsdk.error("Delete Failed: primaryKeys key missing. Please use dataObject setOfflineObjectsOptions to set primaryKeys for delte operation.");
                         kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                         return;
                     }
                 }
                 obj.deleteByPK(deleteOptions, successCallback, failureCallback);
             }
             this.getMetadataOfObject(objectName, {}, deleteHandler, failureCallback);
         } catch (error) {
             kony.sdk.logsdk.error("Delete on offline enabled object failed with error: " + error);
             kony.sdk.verifyAndCallClosure(failureCallback, error);
         }
     };
     /**
      * This method is used to retrieve metadata of all objects
      * @param options
      * @param successCallback
      * @param failureCallback
      */
     this.getMetadataOfAllObjects = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineEnabledObjectService.getMetadataOfAllObjects");
         _getMetadataForObjectsOrServiceOnlineUtil(konyRef, serviceName, null, options, successCallback, failureCallback);
         kony.sdk.logsdk.trace("EXiting kony.sdk.OfflineEnabledObjectService.getMetadataOfAllObjects");
     };
     /**
      * This method is used to retrive metadata of a specific object
      * @param objectName
      * @param options
      * @param successCallback
      * @param failureCallback
      */
     this.getMetadataOfObject = function(objectName, options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineEnabledObjectService.getMetadataOfObject");
         _getMetadataForObjectsOrServiceOnlineUtil(konyRef, serviceName, objectName, options, successCallback, failureCallback);
         kony.sdk.logsdk.trace("Exiting kony.sdk.OfflineEnabledObjectService.getMetadataOfObject");
     };
     /**
      * This method is used to validate options
      * @param options
      * @param failureCallback
      */
     function areOptionsValid(options, failureCallback) {
         if (options == null || options == undefined) {
             kony.sdk.logsdk.error("### OfflineEnabledObjectService:: Options Validity check: options null or undefined");
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return false;
         }
         if (!(options[kony.sdk.constants.ObjectServiceConstants.DATAOBJECT] instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.logsdk.error("### OfflineEnabledObjectService:: Options Validity check: invalid data object");
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return false;
         }
         var dataObject = options[kony.sdk.constants.ObjectServiceConstants.DATAOBJECT];
         var objectName = dataObject.getObjectName();
         if (objectName == null || objectName == undefined) {
             kony.sdk.logsdk.error("### OfflineEnabledObjectService:: Options Validity check: objectname null or undefined");
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "objectName" + kony.sdk.errormessages.null_or_undefined));
             return false;
         }
         return true;
     };
 };
 /**
  * Method which returns the offline ObjectService object
  * @param konyRef
  * @param serviceName
  * @constructor
  */
 kony.sdk.OfflineObjectService = function(konyRef, serviceName) {
     kony.sdk.logsdk.trace("Entering kony.sdk.OfflineObjectService");
     this.konyRef = konyRef;
     this.serviceName = serviceName;
     /**
      * This method is used to create a record on the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject)}
      * @param successCallback
      * @param failureCallback
      */
     this.create = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineObjectService.create");
         if (options == null || options == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         if (!(options["dataObject"] instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         var dataObject = options["dataObject"];

         function createHandler(objMetadata) {
             _invokeOfflineCreate(dataObject, successCallback, failureCallback, options);
         }
         this.getMetadataOfObject(dataObject.getObjectName(), {}, createHandler, failureCallback);
     };
     /**
      * This method is used to fetch records from the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject)}
      * @param successCallback
      * @param failureCallback
      */
     this.fetch = function(options, successCallback, failureCallback) {
         throw "This method is not implemented.Instead use executeSelectQuery";
     };
     /**
      * This method is used to update a record in the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject)}
      * @param successCallback
      * @param failureCallback
      */
     this.update = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineObjectService.update");
         if (options == null || options == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         if (!(options["dataObject"] instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         var dataObject = options["dataObject"];

         function updateHandler(objMetadata) {
             function updateSuccessCallback(response) {
                 kony.sdk.verifyAndCallClosure(successCallback, response);
             }

             function updateFailureCallback(error) {
                 if (error != null && error != undefined) {
                     //if the errorcode is equivalent to transaction failed then giving some generic error message to the client.
                     if (error["errorCode"] == 7010) {
                         kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.transaction_failed, kony.sdk.errormessages.transaction_failed));
                         return;
                     }
                 }
                 kony.sdk.verifyAndCallClosure(failureCallback, error);
             }
             _invokeOfflineUpdate(dataObject, updateSuccessCallback, updateFailureCallback, options);
         }
         this.getMetadataOfObject(dataObject.getObjectName(), {}, updateHandler, failureCallback);
     };
     /**
      * This method is used to delete a record in the object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject)}
      * @param successCallback
      * @param failureCallback
      */
     this.deleteRecord = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineObjectService.deleteRecord");
         if (options == null || options == undefined) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         if (!(options["dataObject"] instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         var dataObject = options["dataObject"];

         function deleteHandler(objMetadata) {
             function deleteSuccessCallback(response) {
                 //verifying delete response contains deleted records count as 0
                 if (response != null && response != undefined) {
                     if (response["rowsdeleted"] == 0) {
                         kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.norecords_to_delete, kony.sdk.errormessages.norecords_to_delete));
                         return;
                     }
                 }
                 kony.sdk.verifyAndCallClosure(successCallback, response);
             }

             function deleteFailureCallback(error) {
                 kony.sdk.verifyAndCallClosure(failureCallback, error);
             }
             _invokeOfflineDelete(dataObject, deleteSuccessCallback, deleteFailureCallback, options);
         }
         this.getMetadataOfObject(dataObject.getObjectName(), {}, deleteHandler, failureCallback);
     };
     /**
      * This method is used to retrieve metadata of all objects
      * @param options
      * @param successCallback
      * @param failureCallback
      */
     this.getMetadataOfAllObjects = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineObjectService.getMetadataOfAllObjects");
         _getMetadataForObjectsOrServiceOnlineUtil(konyRef, serviceName, null, options, successCallback, failureCallback);
         kony.sdk.logsdk.trace("Exiting kony.sdk.OfflineObjectService.getMetadataOfAllObjects");
     };
     /**
      * This method is used to retrive metadata of a specific object
      * @param objectName
      * @param options
      * @param successCallback
      * @param failureCallback
      */
     this.getMetadataOfObject = function(objectName, options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineObjectService.getMetadataOfObject");
         _getMetadataForObjectsOrServiceOnlineUtil(konyRef, serviceName, objectName, options, successCallback, failureCallback);
         kony.sdk.logsdk.trace("Exiting kony.sdk.OfflineObjectService.getMetadataOfObject");
     };
     /**
      * This method is used to execute an sql query
      * @param queryStr
      * @param successCallback
      * @param failureCallback
      */
     this.executeSelectQuery = function(queryStr, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineObjectService.executeSelectQuery");

         function selctSuccess(response) {
             kony.sdk.logsdk.debug("### OfflineObjectService::executeSelectQuery::selectSuccess Response:", response);
             kony.sdk.verifyAndCallClosure(successCallback, response);
         }

         function selectError(error) {
             kony.sdk.logsdk.error("### OfflineObjectService::executeSelectQuery::selectError Error:", error);
             kony.sdk.verifyAndCallClosure(failureCallback, error);
         }
         kony.sync.single_select_execute(kony.sdk.util.getSyncDbName(), queryStr, null, selctSuccess, selectError);
     };
     /**
      * Helps to get the binary content of the specified column on the Object
      * @param {map} options - includes {"dataObject":(@link kony.sdk.dto.DataObject), "responsetype":"base64string/filepath(Default)", "binaryAttrName":columnName}
      * @param successCallback
      * @param failureCallback
      */
     this.getBinaryContent = function(options, successCallback, failureCallback) {
         kony.sdk.logsdk.trace("Entering kony.sdk.OfflineObjectService.getBinaryContenttion");
         if (kony.sdk.isNullOrUndefined(options)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.null_or_undefined, "options" + kony.sdk.errormessages.null_or_undefined));
             return;
         }
         var dataObject = options["dataObject"];
         if (!(dataObject instanceof kony.sdk.dto.DataObject)) {
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.invalid_dataobject_instance, kony.sdk.errormessages.invalid_dataobject_instance));
             return;
         }
         var binaryColName = options["binaryAttrName"];
         if (kony.sdk.isNullOrUndefined(binaryColName)) {
             kony.sdk.logsdk.error("### OfflineObjectService::getBinaryContent Error: Please provide column name to fetch binary content");
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj("90000", "Please provide column name to fetch binary content"));
             return;
         }
         var getBase64 = options["responsetype"] === "base64string" ? true : false;
         var config = options["config"];

         function getBinaryDataHandler(objMetadata) {
             function selectSuccessCallback(response) {
                 kony.sdk.logsdk.debug("### OfflineObjectService::getBinaryContent::selectSuccessCallback Response", response);
                 var result;
                 if (getBase64) {
                     //get base64 from response
                     var tempFile = new kony.io.File(response["FilePath"]);
                     if (!kony.sdk.isNullOrUndefined(tempFile) && tempFile.exists() && tempFile.readable) {
                         var tempRawBytes = tempFile.read();
                         result = kony.convertToBase64(tempRawBytes);
                     } else {
                         kony.sdk.logsdk.error("Error in reading binary file from filepath ", response["FilePath"]);
                         var errorCode = kony.sdk.errorcodes.invalid_blob;
                         var errorMessage = kony.sdk.errormessages.invalid_blob;
                         kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(errorCode, errorMessage));
                     }
                 } else {
                     //get filepath from response
                     result = response["FilePath"];
                 }
                 kony.sdk.verifyAndCallClosure(successCallback, result);
             }

             function selectErrorCallback(error) {
                 kony.sdk.logsdk.error("### OfflineObjectService::getBinaryContent::selectErrorCallback Error:", error);
                 _invokeOfflineErrorCallback(failureCallback, error);
             }
             var dbName = kony.sdk.util.getSyncDbName();
             var objName = dataObject.getObjectName();
             var columnValues = kony.sdk.util.populateColumnValues(dataObject.getRecord(), null);
             var colMeta = kony.sdk.util.getMetadataOfColumn(objMetadata, binaryColName);
             if (kony.sdk.isNullOrUndefined(colMeta)) {
                 kony.sdk.logsdk.warn("### OfflineObjectService::getBinaryContent Error: Invalid binary attribute name.");
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj("90000", "Invalid binary attribute name."));
                 return;
             }
             if (colMeta["datatype"] !== kony.sdk.constants.BINARY_DATATYPE) {
                 kony.sdk.logsdk.warn("### OfflineObjectService::getBinaryContent Error: Datatype is not binary for the specified binary attribute name");
                 kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj("90000", "Datatype is not binary for the specified binary attribute name"));
                 return;
             }
             var pkTable = kony.sdk.util.getPkTableForBinary(objMetadata, columnValues, failureCallback);
             kony.sync.getBinary(dbName, objName, binaryColName, pkTable, config, selectSuccessCallback, selectErrorCallback);
         }
         this.getMetadataOfObject(dataObject.getObjectName(), {}, getBinaryDataHandler, failureCallback);
     };

     function _invokeOfflineErrorCallback(failureCallback, errorObject) {
         //call the failureCallback after adding opstatus to the errorObject.
         var errorCode, errorMessage;
         if (errorObject) {
             errorCode = (errorObject.hasOwnProperty("errorCode")) ? errorObject["errorCode"] : kony.sdk.errorcodes.transaction_failed;
             errorMessage = (errorObject.hasOwnProperty("errorMessage")) ? errorObject["errorMessage"] : kony.sdk.errormessages.transaction_failed;
         } else {
             errorCode = kony.sdk.errorcodes.transaction_failed;
             errorMessage = kony.sdk.errormessages.transaction_failed;
         }
         kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(errorCode, errorMessage));
     }

     function _invokeOfflineCreate(dataObject, successCallback, failureCallback, options) {
         var dbname = kony.sdk.util.getSyncDbName();
         kony.sync.single_insert_execute(dbname, dataObject.getObjectName(), dataObject.getRecord(), successCallback, function(err) {
             _invokeOfflineErrorCallback(failureCallback, err);
         }, true, options);
     }

     function _invokeOfflineUpdate(dataObject, successCallback, failureCallback, options) {
         var objectName = dataObject.getObjectName();
         var columnValues = dataObject.getRecord();
         var objMetadata = kony.sdk.ObjectServiceUtil.getCachedObjectMetadata(serviceName, objectName);
         var pkTable = {};
         var whereClause = [];
         if (objMetadata.primaryKey != null && objMetadata.primaryKey != undefined) {
             for (var indx = 0; indx < objMetadata.primaryKey.length; indx++) {
                 var pKey = objMetadata.primaryKey[indx];
                 var pKeyValue = columnValues[pKey];
                 if (pKeyValue == null || pKeyValue == undefined || pKeyValue == "") {
                     //TODO change to error object
                     kony.sdk.logsdk.error("### OfflineObjectService::_invokeOfflineUpdate Error: Primarykey details missing so unable to update");
                     kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                     return;
                 }
                 pkTable.pKey = {
                     "key": pKey,
                     "value": pKeyValue
                 };
                 var condition = {};
                 condition.key = pKey;
                 condition.value = pKeyValue;
                 whereClause.push(condition);
             }
         } else {
             //TODO change to error object
             kony.sdk.logsdk.error("### OfflineObjectService::_invokeOfflineUpdate Error: Primarykey details missing so unable to update");
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
             return;
         }
         var dbName = kony.sdk.util.getSyncDbName();
         kony.sync.single_update_execute(dbName, objectName, columnValues, whereClause, successCallback, function(err) {
             _invokeOfflineErrorCallback(failureCallback, err);
         }, false, true, null, options);
     }

     function _invokeOfflineDelete(dataObject, successCallback, failureCallback, options) {
         var isError = false;
         var markForUpload = false;
         var tbname = dataObject.getObjectName();
         var errMsg = null;
         var wcs = [];
         var objMetadata = kony.sdk.ObjectServiceUtil.getCachedObjectMetadata(serviceName, dataObject.getObjectName());
         var dbName = kony.sdk.util.getSyncDbName();
         var srcAttributes = kony.sdk.util.getPrimarykeysFromMetadata(objMetadata);
         if (srcAttributes != null && srcAttributes != undefined) {
             var pkLen = Object.keys(srcAttributes).length;
             for (var indx = 0; indx < pkLen; indx++) {
                 var pKey = Object.keys(srcAttributes)[indx];
                 var pKeyValue = dataObject.getRecord()[pKey];
                 if (pKeyValue == null || pKeyValue == undefined || pKeyValue == "") {
                     //TODO
                     //throw error
                     kony.sdk.logsdk.error("### _invokeOfflineDelete:: Error Primarykey details missing so unable to delete");
                     kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
                     return;
                 }
                 var whereClause = {};
                 whereClause.key = pKey;
                 whereClause.value = pKeyValue;
                 kony.table.insert(wcs, whereClause);
             }
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### _invokeOfflineDelete:: Error Primarykey details missing so unable to delete");
             kony.sdk.verifyAndCallClosure(failureCallback, kony.sdk.error.getClientErrObj(kony.sdk.errorcodes.primarykey_unavailable, kony.sdk.errormessages.primarykey_unavailable));
             return;
         }
         kony.sync.single_delete_execute(dbName, tbname, wcs, successCallback, function(err) {
             _invokeOfflineErrorCallback(failureCallback, err);
         }, false, false, true, options);
     }
 };
 //Utils specific to MVVM/MDA/MVC SDK
 // This function is responsible for checking if the array contains the object based on object's name property.
 // returns the array element if the object matches
 kony.sdk.util.getExtendedFieldsFromArray = function(array, object) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.util.getExtendedFieldsFromArray");
     if (array instanceof Array) {
         for (var i = 0; i < array.length; i++) {
             if (array[i] instanceof kony.sdk.dto.FieldMetadata && object instanceof kony.sdk.dto.Column) {
                 if (kony.sdk.util.matchIgnoreCase(array[i].name, object.getName()) && kony.sdk.util.matchIgnoreCase(array[i].type, "extendedfield")) {
                     return array[i];
                 }
             }
         }
         return null;
     }
 };
 /**
  * This Object represent picklist values
  * @constructor
  */
 kony.sdk.dto.PickList = function() {
         kony.sdk.logsdk.trace("Entering into kony.sdk.dto.PickList");
         this.id = null;
         this.active = null;
         this.label = null;
         this.value = null;
         this.validFor = null;
         this.defaultValue = null;
         this.fieldMappingId = null;
         this.setId = function(id) {
             this.id = id;
         }
         this.getId = function() {
             return this.id;
         }
         this.setActive = function(active) {
             this.active = active;
         }
         this.isActive = function() {
             return this.active;
         }
         this.setLabel = function(label) {
             this.label = label;
         }
         this.getLabel = function() {
             return this.label;
         }
         this.setValue = function(value) {
             this.value = value;
         }
         this.getValue = function() {
             return this.value;
         }
         this.setValidFor = function(validFor) {
             this.validFor = validFor;
         }
         this.getValidFor = function() {
             return this.validFor;
         }
         this.setDefaultValue = function(defaultValue) {
             this.defaultValue = defaultValue;
         }
         this.getDefaultValue = function() {
             return this.defaultValue;
         }
         this.setFieldMappingId = function(fieldMappingId) {
             this.fieldMappingId = fieldMappingId;
         }
         this.getFieldMappingId = function() {
             return this.fieldMappingId;
         }
     }
     /**
      * The structure of Object Metadata obtained from server
      * @constructor
      */
 kony.sdk.dto.ObjectMetadata = function() {
         //variables to store metadata of the object.
         this.custom;
         this.customizable;
         this.displayName;
         this.entityTypeID;
         this.columns;
         this.junction;
         this.name;
         this.primaryKey;
         this.relationshipList;
         this.sourceEntityName;
         this.updateable;
         this.uniqueKeys;
     }
     /**
      * The structure of Field Metadata obtained from server
      * @constructor
      */
 kony.sdk.dto.FieldMetadata = function() {
         this.auditColumn;
         this.createable;
         this.custom;
         this.customizable;
         this.type;
         this.defaultValue;
         this.displayName;
         this.fieldMappingId;
         this.hasIndex;
         this.name;
         this.nameField;
         this.nullable;
         this.primaryKey;
         this.sourceFieldName;
         this.table;
         this.updateable;
         // array of picklistValueDto objects to hold the pick list values. This will be populated only when the data type is of picklist type
         this.pickListValues;
     }
     /**
      * The structure of Object Relationship in metadata obtained from server
      * @constructor
      */
 kony.sdk.dto.ObjectRelationship = function() {
         this.entityName;
         this.entityPageTemplateId;
         this.id;
         this.junctionTableName;
         this.operationType;
         this.relatedEntity;
         this.relationshipFields;
         this.relationshipName;
         this.relationshipType;
         this.custom;
     }
     /**
      * The Object used to define select query object, in order to fetch data
      * @param serviceName
      * @param tableObj {@link kony.sdk.dto.Table}
      * @constructor
      */
 kony.sdk.dto.SelectQuery = function(serviceName, tableObj) {
     this.tables = [];
     this.columnList = [];
     this.criteriaList = [];
     this.isDistinct = false;
     this.orderList = [];
     this.joinList = [];
     this.groupList = [];
     this.limit = null;
     this.skip = null;
     this.oDataURL = null;
     if (tableObj instanceof kony.sdk.dto.Table) {
         this.tables.push(tableObj);
     }
     /**
      * This function is used to set Limit value
      * @param val
      */
     this.setLimit = function(val) {
         this.limit = val;
     };
     /**
      * This function is used to set Skip value
      * @param val
      */
     this.setSkip = function(val) {
         this.skip = val;
     };
     /**
      * This function is used to get the Limit Value
      * @returns {integer} limit
      */
     this.getLimit = function() {
         return this.limit;
     };
     /**
      * This function is used to get the Skip Value
      * @returns {integer} skip
      */
     this.getSkip = function() {
         return this.skip;
     };
     /**
      * This function is used to add a column object into the select query
      * @param columnObj {@Link kony.sdk.dto.Column}
      * @returns {Array}
      */
     this.addColumn = function(columnObj) {
         if (columnObj instanceof kony.sdk.dto.Column) {
             this.columnList.push(columnObj);
             return this.columnList;
         }
     };
     /**
      * This function is used to add a criteria object to the select query
      * @param criteriaObj
      * @returns {Array}
      */
     this.addCriteria = function(criteriaObj) {
         if (kony.sdk.util.validateCriteriaObject(criteriaObj)) {
             this.criteriaList.push(criteriaObj);
             return this.criteriaList;
         }
     };
     /**
      * This function is used to add a group object to select query
      * @param groupObj
      */
     this.addGroup = function(groupObj) {
         if (groupObj instanceof kony.sdk.dto.Group) {
             this.groupList.push(groupObj);
             for (var i = 0; i < this.tables.length; i++) {
                 if (this.tables[i].getName().toUpperCase() === groupObj.getColumn().getTable().getName().toUpperCase()) {
                     return;
                 }
             }
             this.tables.push(groupObj.getColumn().getTable());
         }
     };
     /**
      * This function is used to add a join object
      * @param joinObj
      */
     this.addJoin = function(joinObj) {
         if (joinObj instanceof kony.sdk.dto.Join) {
             this.joinList.push(joinObj);
             for (var i = 0; i < this.tables.length; i++) {
                 if (this.tables[i].getName().toUpperCase() === joinObj.getTable().getName().toUpperCase()) {
                     if (this.tables[i].getAlias() != null || joinObj.getTable().getAlias() != null || this.tables[i].getAlias() != undefined || joinObj.getTable().getAlias() != undefined) {
                         if (this.tables[i].getAlias().toUpperCase() === joinObj.getTable().getAlias().toUpperCase()) {
                             return;
                         } else {
                             this.tables.push(joinObj.getTable());
                             return;
                         }
                     } else {
                         return;
                     }
                 }
             }
             this.tables.push(joinObj.getTable());
         }
     };
     /**
      * This function is used to add order object to a select query
      * @param orderObj
      */
     this.addOrder = function(orderObj) {
         var currentobject = this;
         if (orderObj instanceof kony.sdk.dto.Order) {
             this.orderList.push(arguments[0]);
             for (var i = 0; i < this.tables.length; i++) {
                 if (this.tables[i].getName().toUpperCase() === arguments[0].getColumn().getTable().getName().toUpperCase()) {
                     return;
                 }
             }
             this.tables.push(orderObj.getColumn().getTable());
         }
     };
     /**
      * This function is used to return tables in select query
      * @returns {Array} Tables
      */
     this.getTables = function() {
         return this.tables;
     };
     /**
      * This function is used to get isDistinct flag
      * @returns {boolean}
      */
     this.getDistinct = function() {
         return this.isDistinct;
     };
     /**
      * This function is used to return columns in select query
      * @returns {Array} Columns
      */
     this.getColumns = function() {
         return this.columnList;
     };
     /**
      * This function is used to get criteria objects in the select query
      * @returns {Array} Criterias
      */
     this.getCriterias = function() {
         return this.criteriaList;
     };
     /**
      * This function is used to get the group objects in the select query
      * @returns {Array} GroupObjs
      */
     this.getGroups = function() {
         return this.groupList;
     };
     /**
      * This function is used to get the Join objects in the select query
      * @returns {Array} Joins
      */
     this.getJoins = function() {
         return this.joinList;
     };
     /**
      * This function is used to get the Order Objects in the select query
      * @returns {Array} OrderObjs
      */
     this.getOrders = function() {
         return this.orderList;
     };
     /**
      * This function is used to remove columnobject set in select query
      * @param columnObj {@link kony.sdk.dto.Column}
      */
     this.removeColumn = function(columnObj) {
         if (columnObj instanceof kony.sdk.dto.Column) {
             this.columnList.splice(this.columnList.indexOf(columnObj), 1);
         }
     };
     /**
      * This function is used to remove criteriaObject from select query
      * @param criteriaObj
      */
     this.removeCriteria = function(criteriaObj) {
         if (criteriaObj instanceof Criteria) {
             this.criteriaList.splice(this.criteriaList.indexOf(criteriaObj), 1);
         }
     };
     /**
      * This function is used to remove group set from select query
      * @param groupObj
      */
     this.removeGroup = function(groupObj) {
         if (groupObj instanceof kony.sdk.dto.Group) {
             this.groupList.splice(this.groupList.indexOf(groupObj), 1);
         }
     };
     /**
      * This function is used to remove Join set in select query
      * @param joinObj
      */
     this.removeJoin = function(joinObj) {
         if (joinObj instanceof kony.sdk.dto.Criteria) {
             this.joinList.splice(this.joinList.indexOf(joinObj), 1);
         }
     };
     /**
      * This function is used to remove OrderObj set in SelectQuery
      * @param orderObj
      */
     this.removeOrder = function(orderObj) {
         if (orderObj instanceof kony.sdk.dto.Order) {
             this.orderList.splice(this.orderList.indexOf(orderObj), 1);
         }
     };
     /**
      * This function is used to set isDistinct
      * @param isDistinct
      */
     this.setDistinct = function(isDistinct) {
         this.isDistinct = isDistinct;
     };
     /**
      * This function is used to get the select query in the form of a string
      * @returns {string}
      */
     this.toString = function() {
         var selectQueryDto = this;
         var query = "";
         query = query + "SELECT ";
         if (this.getDistinct() == true || this.getDistinct() == "true") {
             query = query + " DISTINCT ";
         }
         // Fetch the metadata for the base table and see if there are any extended fields associated with it
         // If there are any, create a join between the base table and the corresponding parent table and fetch it
         var columns = this.columnList;
         var extendedFields = [];
         var columnsArr = [];
         var extendedJoins = [];
         var baseTable = this.getTables()[0];
         var objectMetadata = kony.sdk.ObjectServiceUtil.getCachedObjectMetadata(serviceName, baseTable.getName());
         if (columns.length !== 0) {
             var field = null;
             for (var colIndex = 0; colIndex < columns.length; colIndex++) {
                 field = kony.sdk.util.getExtendedFieldsFromArray(objectMetadata.columns, columns[colIndex]);
                 if (field !== null && field !== undefined) {
                     selectQueryDto.columnList[colIndex].dataType = field.type;
                     selectQueryDto.columnList[colIndex].parentFieldName = field.parentFieldName;
                     extendedFields.push(field);
                     field = null;
                 } else {
                     columnsArr.push(columns[colIndex]);
                 }
             }
         } else {
             var col = null;
             var field = null;
             for (var colIndex = 0; colIndex < objectMetadata.columns.length; colIndex++) {
                 field = objectMetadata.columns[colIndex];
                 col = new kony.sdk.dto.Column(baseTable, field.name);
                 col.dataType = field.type;
                 col.parentFieldName = field.parentFieldName;
                 selectQueryDto.columnList.push(col);
                 if (field !== null && field !== undefined && kony.sdk.util.matchIgnoreCase(field.type, "extendedfield")) {
                     extendedFields.push(field);
                     field = null;
                 } else {
                     columnsArr.push(columns[colIndex]);
                 }
             }
         }
         var columnStr = selectQueryDto.appendListToQuery(columnsArr, ", ", 0);
         if (columnStr !== null && columnStr !== "") {
             query = query + columnStr;
         }
         //TODO have to modify the code based on latest metadata
         if (extendedFields !== null && extendedFields !== undefined && extendedFields.length !== 0) {
             var join = null;
             var table = null;
             var srcCol = null;
             var destCol = null;
             var joinType = kony.sdk.constants.JoinType.LEFT;
             var col = null;
             var colList = [];
             var extendedTablesAdded = {};
             for (var extIndex = 0; extIndex < extendedFields.length; extIndex++) {
                 if (extendedTablesAdded !== null && extendedTablesAdded.hasOwnProperty(extendedFields[extIndex].parentTableName)) {
                     extendedTablesAdded["" + extendedFields[extIndex].parentTableName] = ++extendedTablesAdded["" + extendedFields[extIndex].parentTableName];
                 } else {
                     extendedTablesAdded["" + extendedFields[extIndex].parentTableName] = 0;
                 }
                 table = new kony.sdk.dto.Table(extendedFields[extIndex].parentTableName);
                 // Now add all extended field columns to the query
                 col = new kony.sdk.dto.Column(table, extendedFields[extIndex].parentFieldName);
                 colList.push(col);
                 // Need to fetch the source table's primary key name from the metadata. For now hard coding it to 'id'
                 //TODO
                 srcCol = new kony.sdk.dto.Column(baseTable, extendedFields[extIndex].foreignKeyFieldName);
                 destCol = new kony.sdk.dto.Column(table, extendedFields[extIndex].referencedField || "id");
                 join = new kony.sdk.dto.Join(table, srcCol, destCol, joinType);
                 if (join !== null && join !== undefined && extendedTablesAdded["" + extendedFields[extIndex].parentTableName] === 0) {
                     extendedJoins.push(join);
                 }
             }
             var extColStr = "";
             for (var i = 0; i < colList.length; i++) {
                 extColStr = extColStr + colList[i].toString();
                 if (i < colList.length - 1) {
                     extColStr = extColStr + ",";
                 }
             }
             if (extColStr !== null && extColStr !== "") {
                 query = query + "," + extColStr;
             }
             if (extendedJoins !== null && extendedJoins !== undefined) {
                 for (var joinIndex = 0; joinIndex < extendedJoins.length; joinIndex++) {
                     selectQueryDto.addJoin(extendedJoins[joinIndex]);
                 }
             }
         }
         query = query + " FROM ";
         query = query + selectQueryDto.getTables()[0].toString();
         if (selectQueryDto.getJoins().length !== 0) {
             var joinStr = selectQueryDto.appendListToQuery(selectQueryDto.joinList, " ", -1);
             query = query + joinStr;
         }
         if (!(selectQueryDto.criteriaList.length == 0)) {
             query = query + " WHERE ";
             query = query + selectQueryDto.appendListToQuery(selectQueryDto.criteriaList, " AND ", -1);
         }
         if (!(selectQueryDto.groupList.length == 0)) {
             query = query + " GROUP BY ";
             query = query + selectQueryDto.appendListToQuery(selectQueryDto.groupList, ", ", -1);
         }
         if (!(selectQueryDto.orderList.length == 0)) {
             query = query + " ORDER BY ";
             query = query + selectQueryDto.appendListToQuery(selectQueryDto.orderList, " ,", -1);
         }
         if (selectQueryDto.limit !== null && selectQueryDto.limit !== undefined && kony.sdk.util.isValidNumberType(selectQueryDto.limit) && selectQueryDto.limit !== 0) {
             query = query + " LIMIT " + selectQueryDto.limit;
         }
         if (selectQueryDto.skip !== null && selectQueryDto.skip !== undefined && kony.sdk.util.isValidNumberType(selectQueryDto.skip) && selectQueryDto.skip !== 0) {
             query = query + " OFFSET " + selectQueryDto.skip;
         }
         return query;
     };
     this.appendListToQuery = function(objectList, seperator, mode) {
         kony.sdk.logsdk.trace("Entering into kony.sdk.dto.appendListToQuery");
         var listBuffer = "";
         for (var i = 0; i < objectList.length; i++) {
             var obj = objectList[i];
             if (mode > -1) {
                 if (obj !== null) {
                     if (obj instanceof kony.sdk.dto.Column) {
                         listBuffer = listBuffer.concat(obj.toString());
                     } else {
                         listBuffer = listBuffer.concat(obj.toString());
                     }
                 }
             } else if (obj !== null && obj !== undefined) {
                 listBuffer = listBuffer.concat(obj.toString());
             }
             if (i < objectList.length - 1) {
                 listBuffer = listBuffer.concat(seperator);
             }
         }
         return listBuffer;
     };
 };
 /**
  * This function is the Table constructor.
  * @param tableName
  * @param tableAlias
  * @param junctionType
  * @constructor
  */
 kony.sdk.dto.Table = function(tableName, tableAlias, junctionType) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.Table");
     this.name = tableName;
     this.alias = tableAlias;
     this.isjunction = junctionType;
     this.getAlias = function() {
         return this.alias;
     };
     /**
      * This function is used to set alias.
      *
      * @param alias
      */
     this.setAlias = function(alias) {
         this.alias = alias;
     };
     this.getName = function() {
         return this.name;
     };
     /**
      * This function is used to set name.
      *
      * @param name
      */
     this.setName = function(name) {
         this.name = name;
     };
     /**
      * This function is used to check object equality.
      *
      * @param obj
      * @return Boolean
      */
     this.equals = function(obj) {
         var areObjectsEqual = false;
         if (obj === null || obj === undefined) {
             areObjectsEqual = false;
         } else if (typeof(this) === typeof(obj)) {
             areObjectsEqual = true;
             if (this.hasAlias() && obj.hasAlias()) {
                 areObjectsEqual = this.getAlias() === obj.getAlias();
             } else {
                 areObjectsEqual = this.getName() === obj.getName();
             }
         } else {
             areObjectsEqual = false;
         }
         return areObjectsEqual;
     };
     this.getColumn = function(columnName) {
         return new kony.sdk.dto.Column(this, columnName);
     };
     /**
      * This function is used to check if alias is present or not.
      *
      * @return Boolean
      */
     this.hasAlias = function() {
         return (this.alias !== null && this.alias !== undefined);
     };
     /**
      * This function is used to convert to String.
      *
      * @return string
      */
     this.toString = function() {
         return this.getName() + (this.hasAlias() ? " " + this.getAlias() : "");
     };
     /**
      * This function is used to return if the table is a junction table.
      *
      * @return boolean
      */
     this.isJunction = function() {
         return (this.isjunction && this.isjunction == true);
     };
     /**
      * This function is used to set the type of table junction/non-junction table.
      *
      * @param junctionType
      */
     this.setJunction = function(junctionType) {
         this.isjunction = junctionType;
     };
 };
 /**
  * This function is a Column constructor
  * @param tableObj {@link kony.sdk.dto.Table}
  * @param colName
  * @constructor
  */
 kony.sdk.dto.Column = function(tableObj, colName) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.Column");
     if (tableObj instanceof kony.sdk.dto.Table) {
         this.aggregation = null;
         this.alias = null;
         this.dataType = null;
         this.name = null;
         this.table = null;
         if (colName !== undefined && colName !== null && typeof(colName) === "string") {
             this.name = colName;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Column:: Error: colName is undefined");
         }
         this.table = tableObj;
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.Column:: Error: tableObj is not an instance of kony.sdk.dto.Table");
     }
     this.getAggregation = function() {
         return this.aggregation;
     };
     this.setAggregation = function(aggregation) {
         this.aggregation = aggregation;
     };
     this.getAlias = function() {
         return this.alias;
     };
     this.setAlias = function(alias) {
         this.alias = alias;
     };
     this.getDataType = function() {
         return this.dataType;
     };
     this.setDataType = function(dataType) {
         this.dataType = dataType;
     };
     this.isComputedField = function() {
         return this.fieldComputed;
     };
     this.setComputedField = function(fieldComputed) {
         this.fieldComputed = fieldComputed;
     };
     this.getName = function() {
         return this.name;
     };
     this.setName = function(name) {
         if (name !== undefined && name !== null && typeof(name) === "string") {
             this.name = name;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Column::setName:: Error: name is undefined");
         }
     };
     this.getTable = function() {
         return this.table;
     };
     this.setTable = function(table) {
         if (table instanceof kony.sdk.dto.Table) {
             this.table = table;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Column:: Error: setTable is undefined");
         }
     };
     this.toStringByMode = function(mode) {
         var tableName = (this.getTable().getAlias() !== null && this.getTable().getAlias() !== undefined) ? this.getTable().getAlias() : this.getTable().getName();
         var constructedColumn = null;
         var constructDataType = null;
         var constructAlias = null;
         var constructAggregation = null;
         switch (mode) {
             case 0:
                 if (this.getDataType() !== null && this.getDataType() !== undefined) {
                     if (kony.sdk.util.matchIgnoreCase(this.getDataType(), "Integer")) {
                         constructDataType = "CAST (" + tableName + "." + this.getName() + " AS INTEGER)";
                     } else if (kony.sdk.util.matchIgnoreCase(this.getDataType(), "Numeric")) {
                         constructDataType = "CAST (" + tableName + "." + this.getName() + " AS NUMERIC)";
                     } else if (kony.sdk.util.matchIgnoreCase(this.getDataType(), "Date")) {
                         constructDataType = "date(" + tableName + "." + this.getName() + ")";
                     } else {
                         constructDataType = tableName + "." + this.getName();
                     }
                 } else {
                     constructDataType = tableName + "." + this.getName();
                 }
                 constructAlias = (this.getAlias() !== null && this.getAlias() !== undefined && this.getAlias() !== "") ? " AS " + this.getAlias() : "";
                 constructAggregation = (this.getAggregation() === kony.sdk.constants.Aggregation.NONE || (this.getAggregation() === null || this.getAggregation() === undefined)) ? constructDataType : (this.isComputedField() ? this.getAggregation() : this.getAggregation() + "(" + constructDataType + ")");
                 constructedColumn = constructAggregation + constructAlias;
                 break;
             case 1:
                 if (this.getDataType() !== null && this.getDataType() !== undefined) {
                     if (kony.sdk.util.matchIgnoreCase(this.getDataType(), "STRING")) this.setDataType("text");
                 }
                 constructDataType = (this.getDataType() !== null && this.getDataType() !== undefined) ? "CAST (" + tableName + "." + this.getName() + " AS " + this.getDataType() + ")" : tableName + "." + this.getName();
                 constructAggregation = (this.getAggregation() === kony.sdk.constants.Aggregation.NONE || (this.getAggregation() === null || this.getAggregation() === undefined)) ? constructDataType : (this.isComputedField() ? this.getAggregation() : this.getAggregation() + "(" + constructDataType + ")");
                 constructedColumn = constructAggregation;
                 break;
             case 2:
                 constructedColumn = this.getName();
                 break;
             case 3:
                 constructedColumn = this.getName();
                 break;
             default:
                 if (this.getDataType() !== null && this.getDataType() !== undefined) {
                     if (kony.sdk.util.matchIgnoreCase(this.getDataType(), "STRING")) this.setDataType("text");
                 }
                 constructDataType = (this.getDataType() !== null && this.getDataType() !== undefined) ? "CAST (" + tableName + "." + this.getName() + " AS " + this.getDataType() + ")" : tableName + "." + this.getName();
                 constructAlias = (this.getAlias() !== null && this.getAlias() !== undefined) ? " AS " + this.getAlias() : "";
                 constructAggregation = (this.getAggregation() === kony.sdk.constants.Aggregation.NONE || (this.getAggregation() === null || this.getAggregation() === undefined)) ? constructDataType : (this.isComputedField() ? this.getAggregation() : this.getAggregation() + "(" + constructDataType + ")");
                 constructedColumn = constructAggregation + constructAlias;
                 break;
         }
         return constructedColumn;
     };
     this.toString = function() {
         // To be removed later from here
         if (this.getDataType() !== null && this.getDataType() !== undefined) {
             if (kony.sdk.util.matchIgnoreCase(this.getDataType(), "STRING")) dataType = "text";
         }
         var tableName = (this.getTable().getAlias() !== null && this.getTable().getAlias() !== undefined && this.getTable().getAlias() !== "") ? this.getTable().getAlias() : this.getTable().getName();
         var constructedColumn = null;
         var constructDataType = null;
         var constructAggregation = null;
         if (this.getDataType() !== null && this.getDataType() !== undefined) {
             if (kony.sdk.util.matchIgnoreCase(this.getDataType(), "Integer")) {
                 constructDataType = "CAST (" + tableName + "." + this.getName() + " AS INTEGER)";
             } else if (kony.sdk.util.matchIgnoreCase(this.getDataType(), "Numeric")) {
                 constructDataType = "CAST (" + tableName + "." + this.getName() + " AS NUMERIC)";
             } else if (kony.sdk.util.matchIgnoreCase(this.getDataType(), "Date")) {
                 constructDataType = "date(" + tableName + "." + this.getName() + ")";
             } else {
                 if (!this.isComputedField()) constructDataType = tableName + "." + this.getName();
             }
         } else {
             if (!this.isComputedField()) constructDataType = tableName + "." + this.getName();
         }
         var constructAlias = (this.getAlias() !== null && this.getAlias() !== undefined && this.getAlias() !== "") ? " AS " + this.getAlias() : "";
         constructAggregation = (this.getAggregation() === kony.sdk.constants.Aggregation.NONE || (this.getAggregation() === null || this.getAggregation() === undefined)) ? constructDataType : (this.isComputedField() ? this.getAggregation() : this.getAggregation() + "(" + constructDataType + ")");
         constructedColumn = constructAggregation + constructAlias;
         return constructedColumn;
     };
     this.toStringByTablePrefix = function(includeTablePrefix) {
         if (includeTablePrefix) {
             return this.toString();
         } else {
             return this.getName();
         }
     }
 };
 /**
  * This Object represents a groupby clause in select query
  * @param columnObj {@link kony.sdk.dto.Column}
  * @constructor
  */
 kony.sdk.dto.Group = function(columnObj) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.Group");
     if (columnObj instanceof kony.sdk.dto.Column) {
         this.column = columnObj;
     }
     this.getColumn = function() {
         return this.column;
     };
     this.setColumn = function(column) {
         if (column instanceof kony.sdk.dto.Column) {
             this.column = column;
         }
     };
     this.toString = function() {
         var tableName = (this.column.getTable().getAlias() !== null && this.column.getTable().getAlias() !== undefined) ? this.column.getTable().getAlias() : this.column.getTable().getName();
         return tableName + "." + this.column.getName();
     };
 };
 /**
  * This Object represents JOINS used in kony.sdk.dto.SelectQuery
  * @constructor
  */
 kony.sdk.dto.Join = function() {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.Join");
     this.criteria;
     this.table;
     this.joinType;
     var currentObject = this;
     if (arguments.length === 3) {
         getJoinByTableCriteriaAndJoinType(arguments[0], arguments[1], arguments[2]);
     } else if (arguments.length === 4) {
         getJoinByDestTableAndSrcColumnAndDestColumnAndJoinType(arguments[0], arguments[1], arguments[2], arguments[3]);
     }
     /**
      * This function is the Join constructor which has 3 arguments.
      *
      * @param table
      * @param criteria
      * @param joinType
      */
     function getJoinByTableCriteriaAndJoinType(table, criteria, joinType) {
         kony.sdk.logsdk.trace("Entering into getJoinByTableCriteriaAndJoinType");
         if (table instanceof kony.sdk.dto.Table && kony.sdk.util.validateCriteriaObject(criteria) && joinType !== null && joinType !== undefined && (joinType === kony.sdk.constants.JoinType.INNER || joinType === kony.sdk.constants.JoinType.LEFT)) {
             currentObject.table = table;
             currentObject.joinType = joinType;
             currentObject.criteria = criteria;
             return currentObject;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Join::getJoinByTableCriteriaAndJoinType:: Error: Validation error at getJoinByTableCriteriaAndJoinType");
         }
     }
     /**
      * This function is the Join constructor which has 4 arguments.
      *
      * @param destTable
      * @param srcColumn
      * @param destColumn
      * @param joinTypeObj
      */
     function getJoinByDestTableAndSrcColumnAndDestColumnAndJoinType(destTable, srcColumn, destColumn, joinTypeObj) {
         kony.sdk.logsdk.trace("Entering into getJoinByDestTableAndSrcColumnAndDestColumnAndJoinType");
         if (destTable instanceof kony.sdk.dto.Table && srcColumn instanceof kony.sdk.dto.Column && destColumn instanceof kony.sdk.dto.Column && joinTypeObj !== null && joinTypeObj !== undefined && joinTypeObj !== '' && (joinTypeObj === kony.sdk.constants.JoinType.INNER || joinTypeObj === kony.sdk.constants.JoinType.LEFT)) {
             currentObject.table = destTable;
             currentObject.joinType = joinTypeObj;
             var criteria = new kony.sdk.dto.Match(srcColumn, kony.sdk.constants.MatchType.EQUALS, destColumn);
             currentObject.criteria = criteria;
             return currentObject;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Join::getJoinByDestTableAndSrcColumnAndDestColumnAndJoinType:: Error: Validation error at getJoinByDestTableAndSrcColumnAndDestColumnAndJoinType");
         }
     }
     this.getCriteria = function() {
         return this.criteria;
     };
     this.setCriteria = function(criteria) {
         if (kony.sdk.util.validateCriteriaObject(criteria)) {
             this.criteria = criteria;
         }
     };
     this.getTable = function() {
         return this.table;
     };
     this.setTable = function(table) {
         if (table instanceof kony.sdk.dto.Table) {
             this.table = table;
         }
     };
     this.getJoinType = function() {
         return this.joinType;
     };
     this.setJoinType = function(joinType) {
         if (joinType !== null) {
             this.joinType = joinType;
         }
     };
     this.initCriteria = function(srcColumn, destColumn) {
         if ((srcColumn instanceof kony.sdk.dto.Column) && (destColumn instanceof kony.sdk.dto.Column)) {
             var criteria = new kony.sdk.dto.Match(srcColumn, kony.sdk.constants.MatchType.EQUALS, destColumn);
             this.setCriteria(criteria);
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Join::initCriteria:: Error: srcColumn or destColumn is not an isntanceof kony.sdk.dto.Column");
         }
     };
     this.toString = function() {
         var returnString = null;
         var temp = null;
         var join;
         if (kony.sdk.constants.JoinType.INNER == this.getJoinType()) {
             join = "INNER";
         } else if (kony.sdk.constants.JoinType.LEFT == this.getJoinType()) {
             join = "LEFT";
         } else if (kony.sdk.constants.JoinType.RIGHT == this.getJoinType()) {
             join = "RIGHT";
         }
         returnString = " " + join + " JOIN " + this.getTable().toString() + " ON ";
         temp = this.getCriteria().toString();
         returnString = returnString + temp;
         return returnString;
     };
 };
 /**
  * This function is the Order constructor.
  * @param columnObj
  * @param orderTypeObj
  */
 kony.sdk.dto.Order = function(columnObj, orderTypeObj) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.Order");
     if ((columnObj instanceof kony.sdk.dto.Column) && (orderTypeObj == kony.sdk.constants.OrderType.ASCENDING || orderTypeObj == kony.sdk.constants.OrderType.DESCENDING)) {
         this.column = columnObj;
         this.type = orderTypeObj;
         return this;
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.Order:: Error: Validation error")
     }
     this.getColumn = function() {
         return this.column;
     };
     /**
      * This function is used to set column.
      *
      * @param column
      */
     this.setColumn = function(column) {
         if (column instanceof kony.sdk.dto.Column) {
             this.column = column;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Order::setColumn: Error: column is not an instance of kony.sdk.dto.Column");
         }
     };
     this.getType = function() {
         return this.type;
     };
     /**
      * This function is used to set type.
      *
      * @param type
      */
     this.setType = function(type) {
         this.type = type;
     };
     /**
      * This function is used to convert to String.
      *
      * @return string
      */
     this.toString = function() {
         return this.column.toString() + " " + (this.type);
     };
 };
 /**
  * This function is used to check the range of values of columnObj
  * @param columnObj {@link kony.sdk.dto.Column}
  * @param colRange
  * @constructor
  */
 kony.sdk.dto.Between = function(columnObj, colRange) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.Between");
     this.column;
     this.range;
     if (columnObj instanceof kony.sdk.dto.Column && (colRange instanceof kony.sdk.dto.DateRange || colRange instanceof kony.sdk.dto.StringRange || colRange instanceof kony.sdk.dto.IntegerRange || colRange instanceof kony.sdk.dto.FloatRange)) {
         this.column = columnObj;
         this.range = colRange;
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.Between:: Error: Vaildation error");
     }
     this.quote = function(str) {
         if (kony.sdk.util.isNull(str)) {
             return "null";
         }
         // var str1 = new String(str);
         var strBuf = [];
         strBuf.push('\'');
         for (var index = 0; index < str.length; index++) {
             var charItem = str.charAt(index);
             if (charItem == '\\' || charItem == '\"' || charItem == '\'') {
                 // strBuf.concat('\\');
                 strBuf.push('\\');
             }
             strBuf.push(charItem);
         }
         strBuf.push('\'');
         return strBuf.join("");
     };
     this.setColumn = function(column) {
         if (column instanceof kony.sdk.dto.Column) {
             this.column = column;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Between::setColumn: Error:column is not an instance of kony.sdk.dto.Column");
         }
     };
     this.setRange = function(range) {
         if (range instanceof kony.sdk.dto.DateRange || range instanceof kony.sdk.dto.StringRange || range instanceof kony.sdk.dto.IntegerRange || range instanceof kony.sdk.dto.FloatRange) {
             this.range = range;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Between::setRange: Error: Validation Error");
         }
     };
     this.getColumn = function() {
         return this.column;
     };
     this.getRange = function() {
         return this.range;
     };
     this.toString = function() {
         var returnStr = "";
         returnStr = this.getColumn().toString() + " Between " + this.getRange().toString();
         return returnStr;
     };
 };
 /**
  * This function is the DateRange constructor.
  * @param startDate
  * @param endDate
  */
 kony.sdk.dto.DateRange = function() {
     this.end;
     this.start;
     if (arguments.length === 2) {
         var startDate = arguments[0];
         var endDate = arguments[1];
         if (startDate instanceof Date && endDate instanceof Date) {
             this.start = startDate;
             this.end = endDate;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.DataRange:: Error: startDate or endDate is not an instance of Date");
         }
     } else if (arguments.length === 1) {
         var dateType = arguments[0];
         if (kony.sdk.util.validateDateTypeInput(dateType)) {
             var range = kony.sdk.util.getDateRange(dateType);
             if (range.length !== 2 || range[0] === 0 || range[1] === 0) {
                 //TODO
                 //throw error
                 kony.sdk.logsdk.error("### kony.sdk.dto.DateRange:: Error: Validation Error");
             } else {
                 this.start = range[0];
                 this.end = range[1];
             }
         }
     }
     this.getEnd = function() {
         return this.end;
     };
     /**
      * This function is used to set End value.
      *
      * @param end
      */
     this.setEnd = function(end) {
         if (end instanceof Date) {
             var month = end.getMonth() + 1;
             var date = end.getDate();
             var hr = end.getHours();
             var min = end.getMinutes();
             var sec = end.getSeconds();
             if (month < 10) {
                 month = "0" + month;
             }
             if (date < 10) {
                 date = "0" + date;
             }
             if (hr < 10) {
                 hr = "0" + hr;
             }
             if (min < 10) {
                 min = "0" + min;
             }
             if (sec < 10) {
                 sec = "0" + sec;
             }
             var endDate = end.getFullYear() + "-" + month + "-" + date + " " + hr + ":" + min + ":" + sec;
             this.end = endDate;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.DateRange::setEnd:: Error: end is not an instance of Date");
         }
     };
     this.getStart = function() {
         return this.start;
     };
     /**
      * This function is used to set start value.
      *
      * @param start
      */
     this.setStart = function(start) {
         if (start instanceof Date) {
             var month = start.getMonth() + 1;
             var date = start.getDate();
             var hr = start.getHours();
             var min = start.getMinutes();
             var sec = start.getSeconds();
             if (month < 10) {
                 month = "0" + month;
             }
             if (date < 10) {
                 date = "0" + date;
             }
             if (hr < 10) {
                 hr = "0" + hr;
             }
             if (min < 10) {
                 min = "0" + min;
             }
             if (sec < 10) {
                 sec = "0" + sec;
             }
             var startDate = start.getFullYear() + "-" + month + "-" + date + " " + hr + ":" + min + ":" + sec;
             this.start = startDate;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.DateRange::setStart:: Error: start is not an instance of Date");
         }
     };
     /**
      * This function is used to convert to String.
      *
      * @return string
      */
     this.toString = function() {
         var returnString = null;
         returnString = "'" + this.start + "'" + " AND " + "'" + this.end + "'";
         return returnString;
     };
 };
 /**
  * This function is the DecimalRange constructor.
  * @param startDecimal
  * @param endDecimal
  */
 kony.sdk.dto.DecimalRange = function(startDecimal, endDecimal) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.DecimalRange");
     if ((endDecimal !== null && endDecimal !== undefined && typeof endDecimal === 'number') && (startDecimal !== null && startDecimal !== undefined && typeof startDecimal === 'number')) {
         this.end = endDecimal;
         this.start = startDecimal;
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.DecimalRange:: Error: Validation Error");
     }
     this.getEnd = function() {
         return this.end;
     };
     /**
      * This function is used to set End value.
      *
      * @param end
      */
     this.setEnd = function(end) {
         if (end !== null && end !== undefined && typeof end === 'number') {
             this.end = end;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.DecimalRange::setEnd:: Error: Validation Error");
         }
     };
     this.getStart = function() {
         return this.start;
     };
     /**
      * This function is used to set start value.
      *
      * @param start
      */
     this.setStart = function(start) {
         if (start !== null && start !== undefined && typeof start === 'number') {
             this.start = start;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.DecimalRange::setStart:: Error: Validation Error");
         }
     };
     /**
      * This function is used to convert to String.
      *
      * @return string
      */
     this.toString = function() {
         var returnString = null;
         returnString = this.start + " AND " + this.end;
         return returnString;
     };
 };
 /**
  * This function is the FloatRange constructor.
  * @param startFloat
  * @param endFloat
  */
 kony.sdk.dto.FloatRange = function(startFloat, endFloat) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.FloatRange");
     this.end = endFloat;
     this.start = startFloat;
     this.getEnd = function() {
         return this.end;
     };
     /**
      * This function is used to set End value.
      *
      * @param end
      */
     this.setEnd = function(end) {
         if (end !== null && end !== undefined && typeof end === 'number') {
             this.end = end;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.FloatRange::setEnd:: Error: Validation Error");
         }
     };
     this.getStart = function() {
         return this.start;
     };
     /**
      * This function is used to set start value.
      *
      * @param start
      */
     this.setStart = function(start) {
         if (start !== null && start !== undefined && typeof start === 'number') {
             this.start = start;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.FloatRange::setStart:: Error: Validation Error");
         }
     };
     /**
      * This function is used to convert to String.
      *
      * @return string
      */
     this.toString = function() {
         var returnString = null;
         returnString = this.start + " AND " + this.end;
         return returnString;
     };
 };
 /**
  * This function is the IntegerRange constructor.
  * @param startInt
  * @param endInt
  */
 kony.sdk.dto.IntegerRange = function(startInt, endInt) {
     if ((endInt !== null && endInt !== undefined && typeof endInt === 'number') && (startInt !== null && startInt !== undefined && typeof startInt === 'number')) {
         this.end = endInt;
         this.start = startInt;
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.IntegerRange:: Error: Validation Error");
     }
     this.getEnd = function() {
         return this.end;
     };
     /**
      * This function is used to set End value.
      *
      * @param end
      */
     this.setEnd = function(end) {
         if (end !== null && end !== undefined && typeof end === 'number') {
             this.end = end;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.IntegerRange::setEnd:: Error: Validation Error");
         }
     };
     this.getStart = function() {
         return this.start;
     };
     /**
      * This function is used to set start value.
      *
      * @param start
      */
     this.setStart = function(start) {
         if (start !== null && start !== undefined && typeof start === 'number') {
             this.start = start;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.IntegerRange::setStart:: Error: Validation Error");
         }
     };
     /**
      * This function is used to convert to String.
      *
      * @return string
      */
     this.toString = function() {
         var returnString = null;
         returnString = this.start.toFixed() + " AND " + this.end.toFixed();
         return returnString;
     };
 };
 /**
  * This function is the StringRange constructor.
  * @param startString
  * @param endString
  */
 kony.sdk.dto.StringRange = function(startString, endString) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.StringRange");
     if ((endString !== null && endString !== undefined && typeof endString === 'string') && (startString !== null && startString !== undefined && typeof startString === 'string')) {
         this.end = endString;
         this.start = startString;
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.StringRange:: Error: Validation Error");
     }
     this.getEnd = function() {
         return this.end;
     };
     /**
      * This function is used to set End value.
      *
      * @param end
      */
     this.setEnd = function(end) {
         if (end !== null && end !== undefined && typeof end === 'string') {
             this.end = end;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.StringRange::setEnd:: Error: Validation Error");
         }
     };
     this.getStart = function() {
         return this.start;
     };
     /**
      * This function is used to set start value.
      *
      * @param start
      */
     this.setStart = function(start) {
         if (start !== null && start !== undefined && typeof start === 'string') {
             this.start = start;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.StringRange::setStart:: Error: Validation Error");
         }
     };
     /**
      * This function is used to convert to String.
      *
      * @return string
      */
     this.toString = function() {
         var returnString = null;
         var crit = new kony.sdk.dto.Criteria();
         returnString = crit.quote(this.start) + " AND " + crit.quote(this.end);
         return returnString;
     };
 };
 /**
  * This function helps in preparing And {@link kony.sdk.dto.And} and Or {@Link kony.sdk.dto.Or} clauses
  * @param operatorLg
  * @param leftOp
  * @param rightOp
  * @constructor
  */
 kony.sdk.dto.LogicGroup = function(operatorLg, leftOp, rightOp) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.LogicGroup");
     this.left = leftOp;
     this.operator = operatorLg;
     this.right = rightOp;
     /**
      * This function is used to initialize LogicGroup.
      *
      * @param operator
      * @param left
      * @param right
      */
     this.initializeLogicGroup = function(operator, left, right) {
         this.left = left;
         this.operator = operator;
         this.right = right;
     };
     this.getLeft = function() {
         return this.left;
     };
     /**
      * This function is used to set left.
      *
      * @param val
      */
     this.setLeft = function(val) {
         this.val = val;
     };
     this.getOperator = function() {
         return this.operator;
     };
     /**
      * This function is used to set Operator.
      *
      * @param val
      */
     this.setOperator = function(val) {
         this.operator = val;
     };
     this.getRight = function() {
         return this.right;
     };
     /**
      * This function is used to set Right.
      *
      * @param val
      */
     this.setRight = function(val) {
         this.right = val;
     };
     /**
      * This function is used to convert to String.
      *
      * @return string
      */
     this.toString = function() {
         var leftOperator = (this.getLeft() !== null && this.getLeft !== undefined) ? this.getLeft().toString() : "";
         var rightOperator = (this.getRight() !== null && this.getRight() !== undefined) ? this.getRight().toString() : "";
         return "(" + leftOperator + " " + this.getOperator() + " " + rightOperator + ")";
     };
 };
 /**
  * This function is the And constructor.
  *
  * @param left
  * @param right
  */
 kony.sdk.dto.And = function(left, right) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.And");
     if (arguments.length !== 2) {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.And:: Error: invalid number of arguments, expected are left and right");
     }
     if ((right !== null && left !== null && right !== undefined && left !== undefined && kony.sdk.util.validateCriteriaObject(left) && kony.sdk.util.validateCriteriaObject(right))) {
         kony.sdk.dto.LogicGroup.call(this, 'AND', left, right);
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.And:: Error: Validation Error");
     }
     this.initializeAnd = function(left, right) {
         kony.sdk.dto.LogicGroup.call(this, 'AND', left, right);
     };
 };
 /**
  * This function is the Or constructor.
  *
  * @param left
  * @param right
  */
 kony.sdk.dto.Or = function(left, right) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.Or");
     if (arguments.length !== 2) {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.Or:: Error: invalid number of arguments, expected are left and right");
     }
     if ((right !== null && left !== null && right !== undefined && left !== undefined && kony.sdk.util.validateCriteriaObject(left) && kony.sdk.util.validateCriteriaObject(right))) {
         kony.sdk.dto.LogicGroup.call(this, 'OR', left, right);
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.Or:: Error: Validation Error");
     }
     this.initializeOr = function(left, right) {
         kony.sdk.dto.LogicGroup.call(this, 'OR', left, right);
     };
 };
 /**
  * This function is the Not constructor.
  *
  * @param right
  */
 kony.sdk.dto.Not = function(right) {
     if (arguments.length !== 1) {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.Not:: Error: invalid number of arguments, expected right");
     }
     if (right !== null && right !== undefined && kony.sdk.util.validateCriteriaObject(right)) {
         kony.sdk.dto.LogicGroup.call(this, 'NOT', null, right);
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.Not:: Error: Validation Error");
     }
     this.initializeNot = function(right) {
         kony.sdk.dto.LogicGroup.call(this, 'NOT', null, right);
     };
 };
 /**
  * This function is a constructor for Expression Object
  * @constructor
  */
 kony.sdk.dto.Expression = function() {
     this.term;
     this.operator;
     this.expression;
     var currentExpObj = this;
     if (arguments.length === 1) {
         if (kony.sdk.util.validateCriteriaObject(arguments[0])) {
             setTerm(arguments[0]);
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Expression:: Error: Validation Error");
         }
     } else if (arguments.length === 2) {
         initExpression(arguments[0], arguments[1]);
     } else if (arguments.length === 3) {
         initExpressionByExpression(arguments[0], arguments[1], arguments[2]);
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.Expression:: Error: invalid number of arguments, atleast 'term' is expected");
     }
     /**
      * Recursively generates a Expression from a given list of
      * criteria and an infix operator to join each criteria with the
      * next in the list. Operator AND or Operator OR that joins each
      * criteria term with the next in the list.
      *
      * @param criterias
      *            the list of criteria terms from which the
      *            constructor generates the new criteria expression.
      * @param operator
      *            the infix operator
      */
     function initExpression(criterias, operator) {
         if (operator === kony.sdk.constants.Operator.OR) {
             setOperator(kony.sdk.constants.Operator.OR);
         } else if (operator === kony.sdk.constants.Operator.AND) {
             setOperator(kony.sdk.constants.Operator.AND);
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Expression::initExpression:: Error: Invalid Operator");
         }
         if (criterias !== null && criterias !== undefined && criterias instanceof Array && criterias.length > 0) {
             if (kony.sdk.util.validateCriteriaObject(criterias[0])) {
                 setTerm(criterias[0]);
             }
             if (criterias.length > 1) {
                 var tmpOperator = operator;
                 criterias.shift();
                 setExpression(new kony.sdk.dto.Expression(criterias, tmpOperator));
             }
         } else {
             if (kony.sdk.util.validateCriteriaObject(criterias)) {
                 setTerm(criterias);
                 // return currentExpObj;
             } else {
                 //TODO
                 //throw error
                 kony.sdk.logsdk.error("### kony.sdk.dto.Expression::initExpression:: Error: Validation Error");
             }
         }
     }

     function setExpression(expression) {
         if (expression instanceof kony.sdk.dto.Expression) {
             currentExpObj.expression = expression;
             // return currentExpObj;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Expression::setExpression:: Error: expression not an instance of kony.sdk.do.Expression");
         }
     }

     function setTerm(term) {
         if (kony.sdk.util.validateCriteriaObject(term)) {
             currentExpObj.term = term;
             // return currentExpObj;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Expression::setTerm:: Error: Validation Error");
         }
     }
     /**
      * Initializes a Expression with an initial criteria term, an
      * operator, and a another trailing criteria expression.
      *
      * @param criterias
      *            the starting criteria to assign to the new
      *            criteria expression.
      * @param operator
      *            the infix operator
      * @param expression
      *            the trailing expression to assign to the new
      *            criteria expression.
      */
     function initExpressionByExpression(criterias, operator, expression) {
         if (operator === kony.sdk.constants.Operator.OR) {
             initExpression(criterias, kony.sdk.constants.Operator.OR);
         } else if (operator === kony.sdk.constants.Operator.AND) {
             initExpression(criterias, kony.sdk.constants.Operator.AND);
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Expression::initExpressionByExpression:: Error: Invalid Operator");
         }
         setExpression(expression);
         // return currentExpObj;
     }

     function setOperator(operator) {
         currentExpObj.operator = operator;
     }
     this.getTerm = function() {
         return this.term;
     };
     this.getOperator = function() {
         return this.operator;
     };
     this.getExpression = function() {
         return this.expression;
     };
     this.toString = function() {
         var returnString = null;
         if ((this.getTerm() === null || this.getTerm() === undefined) && (this.getExpression() === null || this.getExpression() === undefined)) {
             returnString = "";
         } else if (this.getExpression() === null || this.getExpression() === undefined) {
             returnString = this.getTerm().toString();
         } else if (this.getOperator() === kony.sdk.constants.Operator.AND) {
             returnString = (new kony.sdk.dto.And(this.getTerm(), this.getExpression())).toString();
         } else if (this.getOperator() === kony.sdk.constants.Operator.OR) {
             returnString = (new kony.sdk.dto.Or(this.getTerm(), this.getExpression())).toString();
         }
         return returnString;
     }
 };
 /**
  * This function is a constructor for InCriteria Object
  * @constructor
  */
 kony.sdk.dto.InCriteria = function() {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.InCriteria");
     this.column;
     this.values;
     var currentInCriteriaObj = this;
     if (arguments.length === 2) {
         getInCriteriaByColumnAndCollection(arguments[0], arguments[1]);
     } else if (arguments.length === 3) {
         getInCriteriaByTableAndCollection(arguments[0], arguments[1], arguments[2]);
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.InCriteria:: Error: invalid number of arguments, atleast column,values are expected");
     }
     /**
      * This function is the InCriteria constructor which has 3
      * arguments.
      *
      * @param table
      * @param columnname
      * @param values
      */
     function getInCriteriaByTableAndCollection(table, columnname, values) {
         kony.sdk.logsdk.trace("Entering into getInCriteriaByTableAndCollection");
         if (table instanceof kony.sdk.dto.Table) {
             currentInCriteriaObj.column = new kony.sdk.dto.Column(table, columnname);
             currentInCriteriaObj.values = values;
             return currentInCriteriaObj;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.InCriteria::getInCriteriaByTableAndCollection:: Error: table is not an instance of kony.sdk.dto.Table");
         }
     }
     /**
      * This function is the InCriteria constructor which has 2
      * arguments.
      *
      * @param column
      * @param values
      */
     function getInCriteriaByColumnAndCollection(column, values) {
         kony.sdk.logsdk.trace("Entering into getInCriteriaByColumnAndCollection");
         if (column instanceof kony.sdk.dto.Column && values instanceof Array && values.length > 0) {
             currentInCriteriaObj.column = column;
             currentInCriteriaObj.values = values;
             return currentInCriteriaObj;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.InCriteria::getInCriteriaByColumnAndCollection:: Error: Validation Error");
         }
     }
     this.getColumnForTable = function(table, columnName) {
         if (table instanceof kony.sdk.dto.Table) {
             var column = new kony.sdk.dto.Column(table, columnName);
             return column;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.InCriteria::getColumnForTable:: Error: table not an instance of kony.sdk.dto.Table");
         }
     };
     this.getColumn = function() {
         return this.column;
     };
     this.setColumn = function(column) {
         if (column instanceof kony.sdk.dto.Column) {
             this.column = column;
         }
     };
     this.setValues = function(valuesCollection) {
         this.values = valuesCollection;
     };
     this.getValues = function() {
         return this.values;
     };
     this.toString = function() {
         var result = "";
         result = this.column.toString() + " IN (";
         if (this.values !== null && this.values !== undefined && this.values.length > 0) {
             for (var index = 0; index < this.values.length; index++) {
                 var value;
                 var criteria = new kony.sdk.dto.Criteria();
                 if (typeof(this.values[index]) === "string") {
                     value = criteria.quote(this.values[index]);
                 } else {
                     value = this.values[index];
                 }
                 result = result + value;
                 if (index !== (this.values.length - 1)) {
                     result = result + ", ";
                 }
             }
         }
         /*
          * else if (this.subSelect !== null && this.subSelect !==
          * undefined) { result = result + this.subSelect; }
          */
         result = result + ")";
         return result;
     };
 };
 /**
  * This function is used to in set Exists param in select query
  * @param subSelectQuery {@link kony.sdk.dto.SelectQuery}
  * @constructor
  */
 kony.sdk.dto.Exists = function(subSelectQuery) {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.Exists");
     if (subSelectQuery instanceof kony.sdk.dto.SelectQuery) {
         this.subSelect = subSelectQuery;
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.Exists:: Error: subSelectQuery is not an instance of kony.sdk.dto.SelectQuery");
     }
     this.getSubSelect = function() {
         return this.subSelect;
     };
     this.setSubSelect = function(subSelect) {
         if (subSelect instanceof kony.sdk.dto.SelectQuery) {
             this.subSelect = subSelect;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Exists::subSelectQuery:: Error: subSelectQuery is not an instance of kony.sdk.dto.SelectQuery");
         }
     };
     this.toString = function() {
         return "EXISTS ( " + this.subSelect.toString() + " )";
     };
 };
 /**
  * This is Interface to define where clauses
  * @constructor
  */
 kony.sdk.dto.Criteria = function() {
     kony.sdk.logsdk.trace("Entering into kony.sdk.dto.Criteria");
     this.quote = function(str) {
         if (str === null || str === undefined) {
             return "null";
         }
         // var str1 = new String(str);
         var strBuf = [];
         strBuf.push('\'');
         for (var index = 0; index < str.length; index++) {
             var charItem = str.charAt(index);
             if (charItem == '\\' || charItem == '\"' || charItem == '\'') {
                 // strBuf.concat('\\');
                 strBuf.push('\\');
             }
             strBuf.push(charItem);
         }
         strBuf.push('\'');
         return strBuf.join("");
     };
 };
 /**
  * This function is used to define where clause
  * @constructor
  */
 kony.sdk.dto.Match = function() {
     this.column;
     this.matchType;
     this.value;
     var currentMatchObj = this;
     if (arguments.length === 3) {
         initMatchByColumn(arguments[0], arguments[1], arguments[2]);
     } else if (arguments.length === 4) {
         initMatchByTableAndColName(arguments[0], arguments[1], arguments[2], arguments[3]);
     } else {
         //TODO
         //throw error
         kony.sdk.logsdk.error("### kony.sdk.dto.Match:: Error: Invalid number of arguments, atleast columnObj,matchType,value is required")
     }
     /**
      * This function is the Match constructor which has 3 arguments.
      *
      * @param columnObj
      * @param matchType
      * @param value
      */
     function initMatchByColumn(columnObj, matchType, value) {
         if (columnObj instanceof kony.sdk.dto.Column) {
             currentMatchObj.column = columnObj;
             if (matchType !== kony.sdk.constants.MatchType.EQUALS && matchType !== kony.sdk.constants.MatchType.GREATER && matchType !== kony.sdk.constants.MatchType.GREATEREQUAL && matchType !== kony.sdk.constants.MatchType.LESS && matchType !== kony.sdk.constants.MatchType.LESSEQUAL && matchType !== kony.sdk.constants.MatchType.STARTSWITH && matchType !== kony.sdk.constants.MatchType.CONTAINS && matchType !== kony.sdk.constants.MatchType.LIKE && matchType !== kony.sdk.constants.MatchType.ENDSWITH && matchType !== kony.sdk.constants.MatchType.NOTEQUAL && matchType !== kony.sdk.constants.MatchType.ISNULL && matchType !== kony.sdk.constants.MatchType.ISNOTNULL) {
                 //TODO
                 //throw error
                 kony.sdk.logsdk.error("### kony.sdk.dto.Match::initMatchByColumn:: Error: Invalid MatchType");
             } else {
                 if (matchType !== kony.sdk.constants.MatchType.ISNULL && matchType !== kony.sdk.constants.MatchType.ISNOTNULL) {
                     // check if the value is passed or not except
                     // for NULL and NOT NULL cases.
                     if (value !== null && value !== undefined) {
                         if (value instanceof Array && value.length <= 0) {
                             //TODO
                             //throw error
                             kony.sdk.logsdk.error("### kony.sdk.dto.Match::initMatchByColumn:: Error: value is undefined ,null or empty object");
                         }
                         currentMatchObj.value = value;
                     } else {
                         //TODO
                         //throw error
                         kony.sdk.logsdk.error("### kony.sdk.dto.Match::initMatchByColumn:: Error: Invalid MatchType");
                     }
                 }
                 currentMatchObj.matchType = matchType;
                 return currentMatchObj;
             }
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Match::initMatchByColumn:: Error: columnObj is not an instance of kony.sdk.dto.Column");
         }
     }
     /**
      * This function is the Match constructor which has 4 arguments.
      *
      * @param tableObj
      * @param columnName
      * @param matchType
      * @param value
      */
     function initMatchByTableAndColName(tableObj, columnName, matchType, value) {
         // check for validity of tableObj
         if (tableObj instanceof kony.sdk.dto.Table) {
             // columnName should not empty or null or undefined.
             if (columnName !== null && columnName !== undefined && typeof(columnName) === 'string' && columnName.trim().length > 0) {
                 currentMatchObj.column = tableObj.getColumn(columnName);
                 if (matchType !== kony.sdk.constants.MatchType.EQUALS && matchType !== kony.sdk.constants.MatchType.GREATER && matchType !== kony.sdk.constants.MatchType.GREATEREQUAL && matchType !== kony.sdk.constants.MatchType.LESS && matchType !== kony.sdk.constants.MatchType.LESSEQUAL && matchType !== kony.sdk.constants.MatchType.STARTSWITH && matchType !== kony.sdk.constants.MatchType.CONTAINS && matchType !== kony.sdk.constants.MatchType.LIKE && matchType !== kony.sdk.constants.MatchType.ENDSWITH && matchType !== kony.sdk.constants.MatchType.NOTEQUAL && matchType !== kony.sdk.constants.MatchType.ISNULL && matchType !== kony.sdk.constants.MatchType.ISNOTNULL) {
                     //TODO
                     //throw error
                     kony.sdk.logsdk.error("### kony.sdk.dto.Match::initMatchByTableAndColName:: Error: Invalid MatchType");
                 } else {
                     if (matchType !== kony.sdk.constants.MatchType.ISNULL && matchType !== kony.sdk.constants.MatchType.ISNOTNULL) {
                         // check if the value is passed or not
                         // except for NULL and NOT NULL cases.
                         if (value !== null && value !== undefined) {
                             currentMatchObj.value = value;
                         } else {
                             //TODO
                             //throw error
                             kony.sdk.logsdk.error("### kony.sdk.dto.Match::initMatchByTableAndColName:: Error: value is undefined ,null or empty object");
                         }
                     }
                     currentMatchObj.matchType = matchType;
                 }
                 return currentMatchObj;
             } else {
                 //TODO
                 //throw error
                 kony.sdk.logsdk.error("### kony.sdk.dto.Match::initMatchByTableAndColName:: Error: Invalid MatchType");
             }
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Match:: Error: columnObj is not an instance of kony.sdk.dto.Column");
         }
     }
     this.getColumn = function() {
         if (this.column !== null && this.column !== undefined) {
             return this.column;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Match::getColumn:: Error: column is null or undefined");
         }
     };
     this.getMatchType = function() {
         if (this.matchType !== null && this.matchType !== undefined) {
             return this.matchType;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Match::getMatchType:: Error: matchType is null or undefined");
         }
     };
     /**
      * This function is used to set match type.
      *
      * @param matchType
      */
     this.setMatchType = function(matchType) {
         this.matchType = matchType;
     };
     this.getValue = function() {
         return this.value;
     };
     /*
      * quote=function(value){ return "'"+value+"'"; }
      */
     /**
      * This function is used to convert to String.
      *
      * @return string
      */
     this.toString = function() {
         if (this.matchType !== null && this.matchType !== undefined && this.column !== null && this.column !== undefined) {
             var constructedMatch = null;
             var constructedValue = null;
             var type = this.matchType;
             var val = this.matchType.name;
             if (this.value instanceof Date) {
                 var dateStr = "";
                 var month = this.getValue().getMonth() + 1;
                 var date = this.getValue().getDate();
                 if (month < 10) {
                     month = "0" + month;
                 }
                 if (date < 10) {
                     date = "0" + date;
                 }
                 dateStr = this.getValue().getFullYear() + "-" + month + "-" + date;
                 constructedMatch = "date(substr(" + this.getColumn().toString() + ",0,11)) " + this.getMatchType().value + "'" + dateStr + "'";
                 return constructedMatch;
             }
             if (typeof(this.getValue()) === 'boolean') {
                 if (this.getValue() === true) {
                     return "(" + this.getColumn().toString() + " = 'true' OR " + this.getColumn().toString() + " = 1)";
                 } else if (this.getValue() === false) {
                     return "(" + this.getColumn().toString() + " = 'false' OR " + this.getColumn().toString() + " = 0)";
                 } else {
                     this.value = "'" + this.value + "'";
                 }
             }
             constructedMatch = this.getColumn().toString() + " " + this.getMatchType().value + " ";
             if (typeof(this.getValue()) === 'string') {
                 constructedValue = kony.sdk.util.replaceAll(this.getValue(), "'", "");
                 if (kony.sdk.util.matchIgnoreCase(type.name, "STARTSWITH")) {
                     constructedValue = constructedValue + "%";
                 } else if (kony.sdk.util.matchIgnoreCase(type.name, "CONTAINS")) {
                     constructedValue = "%" + constructedValue + "%";
                 } else if (kony.sdk.util.matchIgnoreCase(type.name, "ENDSWITH")) {
                     constructedValue = "%" + constructedValue;
                 } else if (kony.sdk.util.matchIgnoreCase(type.name, "ISNULL")) {
                     return "(lower(" + this.getColumn().toString() + ") = 'null' OR " + this.getColumn().toString() + " IS NULL)";
                 } else if (kony.sdk.util.matchIgnoreCase(type.name, "ISNOTNULL")) {
                     return "(lower(" + this.getColumn().toString() + ") != 'null' OR " + this.getColumn().toString() + " IS NOT NULL)";
                 }
                 constructedValue = new kony.sdk.dto.Criteria().quote(constructedValue);
             } else {
                 if (kony.sdk.util.matchIgnoreCase(type.name, "ISNULL")) {
                     return "(lower(" + this.getColumn().toString() + ") = 'null' OR " + this.getColumn().toString() + " IS NULL)";
                 } else if (kony.sdk.util.matchIgnoreCase(type.name, "ISNOTNULL")) {
                     return "(lower(" + this.getColumn().toString() + ") != 'null' OR " + this.getColumn().toString() + " IS NOT NULL)";
                 }
                 constructedValue = this.getValue().toString();
             }
             if (!(kony.sdk.util.matchIgnoreCase(type.name, "ISNULL") || kony.sdk.util.matchIgnoreCase(type.name, "ISNOTNULL"))) {
                 constructedMatch = constructedMatch + constructedValue;
             }
             return constructedMatch;
         } else {
             //TODO
             //throw error
             kony.sdk.logsdk.error("### kony.sdk.dto.Match::toString:: Error: matchType is undefined");
         }
     }
 };

 function OAuthHandler(serviceUrl, providerName, appkey, callback, type, options, isMFVersionCompatible) {
     var urlType = "/" + type + "/";
     var isSuccess = true;
     var isLogout = false;
     // This will make sure the scheduler to request tokens will be instantiated only once in the method handleRequestCallback.
     // In case of Google OAuth changes Identity returns the success_url, so page gets refreshed twice which will fail in instantiating the scheduler twice.
     var isLoginCallbackInvoked = false;
     if (options && options.hasOwnProperty("logout") && options["logout"] === true) {
         isLogout = true;
     }
     var slo = false;
     if (options && options.hasOwnProperty("slo") && options["slo"] === true) {
         slo = options["slo"];
     }
     var customQueryParamsForOAuth;
     if (options && options.hasOwnProperty("customQueryParamsForOAuth")) {
         customQueryParamsForOAuth = kony.sdk.util.objectToQueryParams(options["customQueryParamsForOAuth"]);
     }
     var requestUrl;

     function appendCustomOAuthParamsToURL(url) {
         if (!kony.sdk.util.isNullOrEmptyString(customQueryParamsForOAuth)) {
             url = url + "&" + customQueryParamsForOAuth;
         }
         return url;
     }

     function constructURLIE11(crossPlatformBaseURL, identityOAuthUrl) {
         //Identity Server will route the final result be it success or error to Injected callback page
         identityOAuthUrl = identityOAuthUrl + "&" + kony.sdk.constants.OAUTH_REDIRECT_SUCCESS_URL + "=" + encodeURIComponent(crossPlatformBaseURL + "/" + kony.sdk.constants.KNY_OAUTH_CALLBACK_HTML);
         //Invoking the identity through the injected Redirect Page to overcome IE imposed cross domain security restrictions.
         var finalRequestUrl = crossPlatformBaseURL + "/" + kony.sdk.constants.KNY_OAUTH_REDIRECT_HTML + "?" + kony.sdk.constants.KNY_OAUTH_REDIRECT_URL + "=" + encodeURIComponent(identityOAuthUrl);
         return finalRequestUrl;
     }
     if (typeof(XMLHttpRequest) !== 'undefined') {
         var _window = window;
         var _popup = null;
         var _listener = function(event) {
             var _contents = event.data;
             /**
              MFSDK-3431 - Recieving post message event from other endpoints.
              This is a short term fix. Currently Identity sends us only string in post message event, later on they have to
              send json with some more keys giving us the knowledge of source
              */
             if (kony.sdk.util.isValidString(_contents) && !kony.sdk.isJson(_contents)) {
                 _popup.close();
                 _detachEvent();
                 try {
                     kony.sdk.logsdk.debug("### OAuthHandler::_listener received authorization code as " + _contents);
                     var headers = {};
                     if (type === "oauth2" || type === "saml") {
                         headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED
                     }
                     callback(urlType + "token", {
                         code: _contents
                     }, headers);
                 } catch (err) {
                     kony.sdk.logsdk.error("exception ::" + err);
                     failureCallback();
                 }
             } else if (kony.sdk.isJson(_contents) || kony.sdk.util.isJsonObject(_contents)) {
                 kony.sdk.logsdk.debug("### OAuthHandler::_listener received event.data in unknown format as " + JSON.stringify(_contents));
                 //TODO - After Identity changes check for desired key in the json.
             }
         };
         var _attachEvent = function() {
             if (_window.addEventListener) {
                 _window.addEventListener('message', _listener, false);
             } else if (_window.attachEvent) {
                 _window.attachEvent('message', _listener);
             } else {
                 throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, "environment doesn't support event attaching");
             }
         };
         var _detachEvent = function() {
             if (_window.detachEvent) {
                 _window.detachEvent('message', _listener);
             } else if (_window.removeEventListener) {
                 _window.removeEventListener('message', _listener);
             } else {
                 throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, "environment doesn't support detaching an event");
             }
         };
         _attachEvent();
         if (isLogout) {
             requestUrl = serviceUrl + urlType + "logout?provider=" + providerName + "&appkey=" + appkey + "&slo=" + slo;
         } else {
             requestUrl = serviceUrl + urlType + "login?provider=" + providerName + "&appkey=" + appkey;
             requestUrl = appendCustomOAuthParamsToURL(requestUrl);
             //Checking whether server is compatable to redirect to user defined callback url
             //Changes to support OAuth on IE11, MFSDK-3657
             if (isMFVersionCompatible && kony.sdk.util.checkForIE11() && kony.sdk.util.isJsonObject(options) && options.hasOwnProperty(kony.sdk.constants.IE11_CROSS_DOMAIN_OAUTH_BASE_URL)) {
                 requestUrl = constructURLIE11(stripTrailingCharacter(options[kony.sdk.constants.IE11_CROSS_DOMAIN_OAUTH_BASE_URL], "/"), requestUrl);
             }
         }
         _popup = _window.open(requestUrl);
     } else {
         var browserSF = null;
         var userDefined = false;
         if (kony.sdk.util.hasBrowserWidget(options)) {
             browserSF = options[kony.sdk.constants.BROWSER_WIDGET];
             userDefined = true;
         } else if (options && options["UseDeviceBrowser"] && isMFVersionCompatible) {
             kony.sdk.util.OAuthCallback = callback;
             kony.sdk.util.OAuthType = type;
         } else {
             var formBasic = {
                 id: "popUp",
                 skin: null,
                 isModal: false,
                 transparencyBehindThePopup: 80,
                 "needAppMenu": false
             };
             var formLayout = {
                 containerWeight: 100,
                 padding: [5, 5, 5, 5],
                 "paddingInPixel": true
             };
             var formPSP = {
                 "titleBar": true,
                 "titleBarConfig": {
                     "renderTitleText": true,
                     "prevFormTitle": false,
                     "titleBarLeftSideView": "button",
                     "labelLeftSideView": "Back",
                     "titleBarRightSideView": "none"
                 },
                 "titleBarSkin": "slTitleBar"
             };
             //to do.. this is a workaround for android browser issue.. need to refactor this code
             browserSF = new kony.ui.Browser({
                 "id": "browserSF",
                 "text": "Browser",
                 "isVisible": true,
                 "detectTelNumber": true,
                 "screenLevelWidget": true,
                 "enableZoom": false
             }, {
                 "margin": [0, 0, 0, 0],
                 "marginInPixel": true,
                 "paddingInPixel": true,
                 "containerWeight": 100
             }, {});
             var prevForm = kony.application.getCurrentForm();
             var oauthForm = new kony.ui.Form2(formBasic, formLayout, formPSP);
             oauthForm.add(browserSF);
             oauthForm.show();
         }
         var urlConf;
         var headersConf = {};
         if (!kony.sdk.isNullOrUndefined(konyRef.currentClaimToken)) {
             headersConf[kony.sdk.constants.KONY_AUTHORIZATION_HEADER] = konyRef.currentClaimToken;
         }
         konyRef.appendGlobalHeaders(headersConf);
         requestUrl = serviceUrl + urlType;
         if (isLogout) {
             requestUrl += "logout?provider=" + providerName + "&appkey=" + appkey + "&slo=" + slo;
         } else {
             requestUrl += "login?provider=" + providerName + "&appkey=" + appkey;
         }
         if (!kony.sdk.isNullOrUndefined(kony.sdk.getFabricAppVersion())) {
             requestUrl += "&app_version=" + kony.sdk.getFabricAppVersion();
         }
         if (isLogout) {
             browserSF.onSuccess = handleOAuthLogoutSuccessCallback;
             browserSF.onFailure = handleOAuthLogoutFailureCallback;
         } else {
             if (options && options["success_url"] && isMFVersionCompatible) requestUrl += "&success_url=" + options["success_url"];
             if (options && options["UseDeviceBrowser"] && isMFVersionCompatible) {
                 kony.application.openURL(requestUrl);
                 return;
             } else {
                 isLoginCallbackInvoked = false;
                 browserSF.handleRequest = handleRequestCallback;
                 requestUrl = appendCustomOAuthParamsToURL(requestUrl);
             }
         }
         urlConf = {
             URL: requestUrl,
             requestMethod: constants.BROWSER_REQUEST_METHOD_GET
         };
         if (Object.keys(headersConf).length > 0) {
             urlConf["headers"] = headersConf;
         }
         browserSF.requestURLConfig = urlConf;

         function handleOAuthLogoutSuccessCallback() {
             if (!userDefined) {
                 var prevFormPostShow = prevForm.postShow;

                 function postShowOverride() {
                     oauthForm.destroy();
                     if (prevFormPostShow) {
                         prevFormPostShow();
                     }
                     prevForm.postShow = prevFormPostShow;
                 }
                 prevForm.postShow = postShowOverride;
                 prevForm.show();
             }
             callback(isSuccess);
         }

         function handleOAuthLogoutFailureCallback() {
             isSuccess = false;
         }

         function handleRequestCallback(browserWidget, params) {
             var originalUrl = params["originalURL"];
             if (!isLoginCallbackInvoked && typeof(params.queryParams) !== "undefined" && typeof(params.queryParams.code) !== "undefined") {
                 if (!userDefined) {
                     var prevFormPostShow = prevForm.postShow;
                     prevForm.postShow = postShowOverride;

                     function postShowOverride() {
                         oauthForm.destroy();
                         if (prevFormPostShow) {
                             prevFormPostShow();
                         }
                         prevForm.postShow = prevFormPostShow;
                     }
                     prevForm.show();
                 }
                 var headers = {};
                 if (type === "oauth2" || type === "saml") {
                     headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
                 }
                 if (!isLoginCallbackInvoked) {
                     // make request for tokens
                     kony.timer.schedule(new Date().getTime().toString(), function(url, callback, code, headers) {
                         return function() {
                             callback(url, {
                                 code: code
                             }, headers);
                         };
                     }(urlType + "token", callback, decodeURIComponent(params.queryParams.code), headers), 1, false);
                     isLoginCallbackInvoked = true;
                 }
             }
             return false;
         }
     }
 }
 /**
  * Handles the deeplink callback, this needs to be called once deep link redirection is done.
  * @param {json} params parameters from Identity service - "code": HashValue
  */
 function handleDeeplinkCallback(params) {
     if (params && kony.sdk.isValidDeeplinkCallback(params)) {
         var headers = {};
         var requestUrl;
         if (kony.sdk.util.OAuthType === "oauth2" || kony.sdk.util.OAuthType === "saml") {
             headers[kony.sdk.constants.HTTP_CONTENT_HEADER] = kony.sdk.constants.CONTENT_TYPE_FORM_URL_ENCODED;
         }
         if (kony.sdk.util.OAuthType === "oauth2") {
             requestUrl = "/oauth2/token";
         } else if (kony.sdk.util.OAuthType === "saml") {
             requestUrl = "/saml/token";
         } else {
             requestUrl = "/login";
         }
         // make request for tokens
         kony.sdk.util.OAuthCallback(requestUrl, {
             code: decodeURIComponent(params.launchparams.code)
         }, headers);
     }
 }
 if (kony.sdk) {
     kony.sdk.offline = {};
 }
 /**
  * Created by Tharalika Palakurthy
  */
 var KNYMobileFabric = null;
 var KNYMetricsService = null;
 kony.setupsdks = function(initConfig, successCallBack, errorCallBack) {
     var dsAppMetaData = null;
     var AppServiceDoc = null;
     var dsAppData;
     var dsAppServiceDoc;
     var serviceDocTimerId = null;
     var getServiceDocNonMFApp = function(initConfig) {
         var serviceDoc = new kony.sdk.serviceDoc();
         serviceDoc.setAppId(initConfig.appConfig.appId);
         serviceDoc.setBaseId(initConfig.appConfig.appId);
         serviceDoc.setAppName(initConfig.appConfig.appName);
         serviceDoc.setReportingService(kony.sdk.constants.reportingType.session, getLicenseUrl(initConfig.appConfig));
         serviceDoc.setReportingService(kony.sdk.constants.reportingType.custom, getMetricsUrl(initConfig.appConfig));
         return serviceDoc.toJSON();
     };
     // Comparing the older etag vs current etag sent by tools, if mismatch considering the service doc from tools is latest.
     if (initConfig.appConfig.svcDoc && initConfig.appConfig.svcDoc.service_doc_etag) {
         var currentToolsEtag = initConfig.appConfig.svcDoc.service_doc_etag;
         var cachedToolsEtag = kony.sdk.dataStore.getItem("tools_etagID");
         if (currentToolsEtag !== cachedToolsEtag) {
             kony.print("New etag set from the app/visulizer");
             kony.sdk.dataStore.setItem("tools_etagID", currentToolsEtag);
             kony.sdk.dataStore.setItem(appConfig.appId + "_mobileFabricServiceDoc", JSON.stringify(initConfig.appConfig.svcDoc));
         }
     }
     dsAppData = kony.sdk.dataStore.getItem(appConfig.appId);
     if (!kony.sdk.isNullOrUndefined(dsAppData)) {
         dsAppMetaData = JSON.parse(dsAppData);
     }
     dsAppServiceDoc = kony.sdk.dataStore.getItem(appConfig.appId + "_mobileFabricServiceDoc");
     if (!kony.sdk.isNullOrUndefined(dsAppServiceDoc)) {
         AppServiceDoc = JSON.parse(dsAppServiceDoc);
     }
     var getLicenseUrl = function(appConfig) {
         var url = "";
         if (appConfig.isturlbase) {
             url = appConfig.isturlbase + "/IST";
         } else if (appConfig.secureurl) {
             url = getFromServerUrl(appConfig.secureurl, "IST");
         } else if (appConfig.url) {
             url = getFromServerUrl(appConfig.url, "IST");
         }
         return url;
     };
     var getMetricsUrl = function(appConfig) {
         var url = "";
         if (appConfig.isturlbase) {
             url = appConfig.isturlbase + "/CMS";
         } else if (appConfig.secureurl) {
             url = getFromServerUrl(appConfig.secureurl, "CMS");
         } else if (appConfig.url) {
             url = getFromServerUrl(appConfig.url, "CMS");
         }
         return url;
     };
     var getFromServerUrl = function(url, path) {
         // ServerURL for non-mf has /mwservlet appended after the context path.
         // We need to remove it to get the base server url
         //url = url.replace(/mwservlet\/*$/i, "");
         //return url + path;
         var newUrl = "";
         var exactSubString = url.match(/mwservlet/i);
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
     };
     var konyAPMSuccessCallBack = function(metricsObject, initConfig) {
         kony.print("Initializing event tracking");
         KNYMetricsService = metricsObject;
         if (KNYMetricsService) {
             KNYMetricsService.setEventTracking(initConfig.eventTypes);
         }
     };
     var initKNYMobileFabric = function(initConfig) {
         KNYMobileFabric = new kony.sdk();
         clientParams = {};
         clientParams.aid = appConfig.appId;
         clientParams.aname = appConfig.appName;
         KNYMobileFabric.setClientParams(clientParams);
     };
     var sdkInit = function(initConfig, successcallback, failurecallback) {
         var isInvalidConfig = false;
         var networkProvider = new konyNetworkProvider();
         if (!kony.sdk.isNullOrUndefined(dsAppMetaData) && !kony.sdk.isNullOrUndefined(dsAppServiceDoc)) {
             if (dsAppMetaData.appId === appConfig.appId && dsAppMetaData.appVersion === appConfig.appVersion) {
                 appConfig.appKey = dsAppMetaData.appKey;
                 appConfig.appSecret = dsAppMetaData.appSecret;
                 appConfig.serviceUrl = dsAppMetaData.serviceUrl;
                 var reportingServiceUrl = dsAppMetaData.licenseUrl;
                 appConfig.isturlbase = reportingServiceUrl.replace("/IST", "");
                 appConfig.svcDoc = AppServiceDoc;
                 sdkInitConfig.appKey = dsAppMetaData.appKey;
                 sdkInitConfig.appSecret = dsAppMetaData.appSecret;
                 sdkInitConfig.serviceUrl = dsAppMetaData.serviceUrl;
             }
         }
         var refreshServiceDoc = function() {
             var networkProvider = new konyNetworkProvider();
             if (!kony.sdk.isNullOrUndefined(dsAppMetaData) && !kony.sdk.isNullOrUndefined(dsAppServiceDoc)) {
                 if (dsAppMetaData.appId === appConfig.appId && dsAppMetaData.appVersion === appConfig.appVersion) {
                     initConfig.appKey = dsAppMetaData.appKey;
                     initConfig.appSecret = dsAppMetaData.appSecret;
                     initConfig.serviceUrl = dsAppMetaData.serviceUrl;
                 }
             }
             var headers = {};
             headers[kony.sdk.constants.APP_KEY_HEADER] = initConfig.appKey;
             headers[kony.sdk.constants.APP_SECRET_HEADER] = initConfig.appSecret;
             networkProvider.get(initConfig.serviceUrl, null, headers, function(data) {
                 kony.sdk.dataStore.setItem(appConfig.appId + "_mobileFabricServiceDoc", JSON.stringify(data));
             }, function(data) {
                 kony.sdk.logsdk.warn("Refresh of serviceDoc failed:" + data);
             });
         };
         if (KNYMobileFabric == null) {
             initKNYMobileFabric(initConfig);
         }
         if (initConfig && initConfig.appConfig && (getLicenseUrl(initConfig.appConfig) === "")) {
             if (kony.license && kony.license.setIsLicenseUrlAvailable) {
                 kony.license.setIsLicenseUrlAvailable(false);
                 kony.sdk.isLicenseUrlAvailable = false;
             }
         }
         if (kony.sdk.isLicenseUrlAvailable && kony.license && kony.license.createSession) {
             kony.license.createSession();
         }
         if (!initConfig.isMFApp) {
             initWithServiceDocHelper(initConfig, successcallback, failurecallback, getServiceDocNonMFApp(initConfig));
         } else {
             if (!initConfig.appConfig.svcDocRefresh) {
                 if (initConfig.appConfig.svcDoc) {
                     initWithServiceDocHelper(initConfig, successcallback, failurecallback, initConfig.appConfig.svcDoc);
                 } else {
                     isInvalidConfig = true;
                 }
             }
             if (isInvalidConfig || initConfig.appConfig.svcDocRefresh) {
                 var cachedServiceDoc = kony.sdk.dataStore.getItem(appConfig.appId + "_mobileFabricServiceDoc");
                 if (cachedServiceDoc) {
                     try {
                         cachedServiceDoc = JSON.parse(cachedServiceDoc);
                     } catch (err) {
                         cachedServiceDoc = "";
                         kony.sdk.logsdk.error("cached service doc corrupted:" + err);
                     }
                 }
                 //Todo: Dead code, remove this refresh service doc logic. (MFSDK-2084)
                 var headers = {};
                 headers[kony.sdk.constants.APP_KEY_HEADER] = initConfig.appKey;
                 headers[kony.sdk.constants.APP_SECRET_HEADER] = initConfig.appSecret;
                 if (initConfig.appConfig.svcDocRefreshTimeSecs && !isInvalidConfig) {
                     if (cachedServiceDoc || initConfig.appConfig.svcDoc) {
                         var offlineServiceDoc = cachedServiceDoc ? cachedServiceDoc : initConfig.appConfig.svcDoc;
                         initWithServiceDocHelper(initConfig, successcallback, failurecallback, offlineServiceDoc);
                         serviceDocTimerId = Date.now().toString();
                         kony.timer.schedule(serviceDocTimerId, refreshServiceDoc, initConfig.appConfig.svcDocRefreshTimeSecs, true);
                     } else {
                         networkProvider.get(initConfig.serviceUrl, null, headers, function(res) {
                             res = kony.sdk.formatSuccessResponse(res);
                             initWithServiceDocHelper(initConfig, successcallback, failurecallback, res);
                         }, function(res) {
                             failurecallback(res);
                         });
                     }
                 } else {
                     networkProvider.get(initConfig.serviceUrl, null, headers, function(res) {
                         res = kony.sdk.formatSuccessResponse(res);
                         initWithServiceDocHelper(initConfig, successcallback, failurecallback, res);
                     }, function(res) {
                         if (cachedServiceDoc || initConfig.appConfig.svcDoc) {
                             var offlineServiceDoc = cachedServiceDoc ? cachedServiceDoc : initConfig.appConfig.svcDoc;
                             initWithServiceDocHelper(initConfig, successcallback, failurecallback, offlineServiceDoc);
                         } else {
                             failurecallback(res);
                         }
                     });
                 }
             }
         }
     };
     var initWithServiceDocHelper = function(initConfig, successcallback, failurecallback, serviceDoc) {
         try {
             if (!kony.sdk.isNullOrUndefined(initConfig) && !kony.sdk.isNullOrUndefined(initConfig["appMetadata"])) {
                 kony.sdk.util.setPackagedMetadata(initConfig["appMetadata"]);
             }
             KNYMobileFabric.initWithServiceDoc(initConfig.appKey, initConfig.appSecret, serviceDoc);
             var MetricsService = null;
             if (kony.sdk.isLicenseUrlAvailable) {
                 MetricsService = KNYMobileFabric.getMetricsService();
             }
             if (initConfig.isMFApp) {
                 konyRef.isAnonymousProvider = true;
             }
             if (successcallback) {
                 successcallback(MetricsService, initConfig);
             }
         } catch (error) {
             if (failurecallback) failurecallback(error);
         }
     };
     /*
      * isMFApp -- boolean to indicate app is being built for MFapp as backend or plain Konyserver
      * appConfig -- set to appConfig of startup.js
      *
      * --MF Parameters--
      * serviceUrl -- mf appconfig url
      * appKey -- set to App Key for MF app scenario
      * appSecret -- set to App Secret for MF app scenario
      *
      * -- For APM --
      * eventTypes -- This should be set to comma separated values chosen in the IDE for events chosen for automatic tracking
      *
      * Examples
      * var sdkInitConfigForMF = {
      *    "isMFApp": true,
           "appConfig" : appconfig,

           "appKey" :"<appkey fetched from MF>",
           "appSecret":"<appsecret fetched from MF>",
           "serviceUrl" : "<appconfig url of the form https://100000013.auth.sit2-konycloud.com/appconfig>",
           "eventTypes" :   ["FormEntry","FormExit","Touch","ServiceRequest","ServiceResponse","Gesture","Orientation","Error","Crash"]
           }
      * var sdkInitConfigForNonMF = {
           "isMFApp": false,
           "appConfig" : appconfig

           "eventTypes" :   ["FormEntry","FormExit","Touch","ServiceRequest","ServiceResponse","Gesture","Orientation","Error","Crash"]
           }
      */
     sdkInit(initConfig, function(metricsObject, initConfig) {
         kony.print("sdk initialization done");
         konyAPMSuccessCallBack(metricsObject, initConfig);
         if (successCallBack) successCallBack(KNYMobileFabric);
     }, function(errorObj) {
         var errorMsg = errorObj ? errorObj.toString() : "";
         kony.print("Error in setup " + errorMsg);
         if (errorCallBack) errorCallBack(errorObj);
     });
 };
 kony.sdk.util = kony.sdk.util || {};

 function konyLogger() {
     this.log = function(text) {
         if (kony.sdk.isDebugEnabled) {
             kony.print(text);
         }
     }
 }
 /**
  * Flag used to override the network availability api for automation testing.
  * @type {boolean}
  */
 overrideNetworkFlag = false;
 /**
  *	Utility Method for the application to check the network availability.
  */
 kony.sdk.isNetworkAvailable = function() {
     //Check the network flag if set for testing. This would mandate the application to be offline if device has network connectivity.
     if (overrideNetworkFlag !== undefined && overrideNetworkFlag !== null && overrideNetworkFlag && overrideNetworkFlag === true) return false;
     return kony.net.isNetworkAvailable(constants.NETWORK_TYPE_ANY);
 };
 /**
  *	Utility method to set the network flag for offline testing.
  */
 kony.sdk.overrideNetworkFlag = function() {
     overrideNetworkFlag = true;
 };
 /**
  *	Utility method to reset the network flag set for offline testing.
  */
 kony.sdk.resetNetworkFlag = function() {
     overrideNetworkFlag = false;
     overrideNetworkFlag = undefined;
 };
 kony.sdk.overrideAnonymousLoginFlag = function() {
     kony.sdk.skipAnonymousCall = true;
 };
 kony.sdk.resetAnonymousLoginFlag = function() {
     kony.sdk.skipAnonymousCall = false;
 };

 function konyNetworkProvider() {
     this.post = function(url, params, headers, successCallback, failureCallback, konyContentType, options) {
         if (kony.sdk.util.isNullOrEmptyString(url)) {
             kony.sdk.verifyAndCallClosure(failureCallback, "url cannot be null or empty");
             return;
         }
         //Appending global params
         if (kony.sdk.isNullOrUndefined(params)) {
             params = {};
         }
         if (!kony.sdk.isNullOrUndefined(kony.sdk.currentInstance)) {
             url = kony.sdk.currentInstance.appendGlobalParams(url, headers, params);
         }
         konyNetHttpRequest(url, params, headers, "POST", konyContentType, successCallback, failureCallback, options);
     };
     this.put = function(url, params, headers, successCallback, failureCallback, konyContentType, options) {
         if (kony.sdk.util.isNullOrEmptyString(url)) {
             kony.sdk.verifyAndCallClosure(failureCallback, "url cannot be null or empty");
             return;
         }
         //Appending global params
         if (kony.sdk.isNullOrUndefined(params)) {
             params = {};
         }
         if (!kony.sdk.isNullOrUndefined(kony.sdk.currentInstance)) {
             url = kony.sdk.currentInstance.appendGlobalParams(url, headers, params);
         }
         konyNetHttpRequest(url, params, headers, "PUT", konyContentType, successCallback, failureCallback, options);
     };
     this.invokeDeleteRequest = function(url, params, headers, successCallback, failureCallback, konyContentType, options) {
         if (kony.sdk.util.isNullOrEmptyString(url)) {
             kony.sdk.verifyAndCallClosure(failureCallback, "url cannot be null or empty");
             return;
         }
         //Appending global params
         if (kony.sdk.isNullOrUndefined(params)) {
             params = {};
         }
         if (!kony.sdk.isNullOrUndefined(kony.sdk.currentInstance)) {
             url = kony.sdk.currentInstance.appendGlobalParams(url, headers, params);
         }
         konyNetHttpRequest(url, params, headers, "DELETE", konyContentType, successCallback, failureCallback, options);
     };
     //postSync will only work for Richclients like Android,IOS
     this.postSync = function(url, params, headers) {
         if (kony.sdk.util.isNullOrEmptyString(url)) {
             kony.sdk.verifyAndCallClosure(failureCallback, "url cannot be null or empty");
             return;
         }
         //Appending global params
         if (kony.sdk.isNullOrUndefined(params)) {
             params = {};
         }
         if (!kony.sdk.isNullOrUndefined(kony.sdk.currentInstance)) {
             url = kony.sdk.currentInstance.appendGlobalParams(url, headers, params);
         }
         return konyNetHttpRequestSync(url, params, headers);
     };
     this.get = function(url, params, headers, successCallback, failureCallback, konyContentType, options) {
         if (kony.sdk.util.isNullOrEmptyString(url)) {
             kony.sdk.verifyAndCallClosure(failureCallback, "url cannot be null or empty");
             return;
         }
         //Appending global params
         if (kony.sdk.isNullOrUndefined(params)) {
             params = {};
         }
         if (!kony.sdk.isNullOrUndefined(kony.sdk.currentInstance)) {
             url = kony.sdk.currentInstance.appendGlobalParams(url, headers, params);
         }
         konyNetHttpRequest(url, null, headers, "GET", konyContentType, successCallback, failureCallback, options);
     }
 }

 function konyNetHttpRequest(url, params, headers, httpMethod, konyContentType, successCallback, failureCallback, options) {
     var paramsTable = null;
     var httpRequest;
     if (options && options["httpRequestOptions"] && options["httpRequestOptions"] instanceof Object) {
         httpRequest = new kony.net.HttpRequest(options["httpRequestOptions"]);
     } else {
         httpRequest = new kony.net.HttpRequest();
     }
     if (options && options["responseType"]) {
         httpRequest.responseType = options["responseType"];
     }
     // check for the deprecated property if set in appmiddlewaresecureinvokerasync() API
     if (options && options["httpconfig_old"]) {
         if (options["httpconfig_old"]["timeout"]) {
             httpRequest.timeout = options["httpconfig_old"]["timeout"] * 1000;
         }
     }
     // As older versions of IE doesn't have xmlHttpRequest2, and it doesn't support "withCredentials" property
     // We put a check to handle a crash. Cookies will not be transferred in CORS request for IE due to this restriction
     if (typeof(XMLHttpRequest) !== "undefined" && "withCredentials" in (new XMLHttpRequest()) && options && options["xmlHttpRequestOptions"] && options["xmlHttpRequestOptions"]["enableWithCredentials"] === true) {
         httpRequest.enableWithCredentials = true;
     }
     var isInvalidResponse = false;
     //if httpmethod is not provided falling back to POST
     if (!httpMethod) {
         httpMethod = constants.HTTP_METHOD_POST;
     }
     httpRequest.open(httpMethod, url);

     function localRequestCallback(result) {
         var readyState = Number(httpRequest.readyState.toString());
         var status = Number(httpRequest.status.toString());
         var response = {};
         if (readyState === 4) {
             //If option "passthrough" is enabled then SDK will not parse the result from backend.
             if (options && options[kony.sdk.constants.PASSTHROUGH]) {
                 response.rawResponse = result.response;
             } else {
                 //parseHttpResponse parse response based on the content-type response header
                 var parsedResp = parseHttpResponse(httpRequest);
                 if (parsedResp.isRawResponse) {
                     response.rawResponse = parsedResp.response;
                 } else {
                     response = parsedResp.response;
                 }
                 isInvalidResponse = parsedResp.isInvalidResponse;
             }
             kony.sdk.setLogLevelFromServerResponse(httpRequest.getAllResponseHeaders());
             if (response && !isInvalidResponse) {
                 response.httpresponse = {};
                 response.httpresponse.headers = httpRequest.getAllResponseHeaders();
                 response.httpresponse.url = url;
                 response.httpresponse.responsecode = status;
             }
             if (isInvalidResponse || (!response && status >= 200 && status < 300)) {
                 var errorMessage = {};
                 errorMessage.httpresponse = {};
                 errorMessage[kony.sdk.constants.MF_OPSTATUS] = kony.sdk.errorcodes.invalid_json_code;
                 errorMessage[kony.sdk.constants.MF_ERROR_MSG] = kony.sdk.errormessages.invalid_json_message;
                 errorMessage[kony.sdk.constants.MF_ERROR_CODE] = kony.sdk.errorcodes.invalid_json_code;
                 errorMessage[kony.sdk.constants.HTTP_STATUS_CODE] = status;
                 errorMessage.httpresponse["response"] = parsedResp.response;
                 errorMessage.httpresponse.headers = httpRequest.getAllResponseHeaders();
                 errorMessage.httpresponse.url = url;
                 errorMessage.httpresponse.responsecode = status;
                 failureCallback(errorMessage);
             } else if (status >= 200 && status < 300) {
                 if (!response.opstatus) {
                     response.opstatus = 0;
                 }
                 if (response.opstatus == 0 || (response.opstatus >= 500100 && response.opstatus <= 500200)) {
                     if (options && (options[kony.sdk.constants.DISABLE_INTEGRITY] || options[kony.sdk.constants.PASSTHROUGH])) {
                         successCallback(response);
                     } else {
                         if (typeof(konyRef) !== "undefined" && konyRef && konyRef.mainRef.integrityKey === true) {
                             if (response.httpresponse.headers.hasOwnProperty(kony.sdk.constants.INTEGRITY_HEADER) || response.httpresponse.headers.hasOwnProperty(kony.sdk.constants.INTEGRITY_HEADER.toLowerCase())) {
                                 if (!(kony.sdk.isNullOrUndefined(httpRequest.integrityStatus))) {
                                     var integrityStatus = parseInt(httpRequest["integrityStatus"].toString());
                                     switch (integrityStatus) {
                                         case constants.HTTP_INTEGRITY_CHECK_NOT_DONE:
                                             failureCallback(kony.sdk.error.getIntegrityErrorMessage(httpRequest, url));
                                             break;
                                         case constants.HTTP_INTEGRITY_CHECK_SUCCESSFUL:
                                             successCallback(response);
                                             break;
                                         case constants.HTTP_INTEGRITY_CHECK_FAILED:
                                             failureCallback(kony.sdk.error.getIntegrityErrorMessage(httpRequest, url));
                                             break;
                                     }
                                 } else {
                                     failureCallback(kony.sdk.error.getIntegrityErrorMessage(httpRequest, url));
                                 }
                             } else if (options && options != null && options["ignoreintegrity"]) {
                                 successCallback(response);
                             } else {
                                 failureCallback(kony.sdk.error.getIntegrityErrorMessage(httpRequest, url));
                             }
                         } else {
                             successCallback(response);
                         }
                     }
                 } else {
                     failureCallback(response);
                 }
             } else {
                 invokeNetworkErrorCallback(url, httpRequest, response, status);
             }

             function invokeNetworkErrorCallback(url, httpRequest, response, status) {
                 var errorObj = {};
                 errorObj.httpresponse = {};
                 if (status == 408) {
                     errorObj[kony.sdk.constants.MF_OPSTATUS] = kony.sdk.errorcodes.request_timed_out_code;
                     errorObj[kony.sdk.constants.MF_ERROR_CODE] = kony.sdk.errorcodes.request_timed_out_code;
                     errorObj[kony.sdk.constants.MF_ERROR_MSG] = kony.sdk.errormessages.request_timed_out_message;
                 } else if (status == 503) {
                     errorObj[kony.sdk.constants.MF_OPSTATUS] = kony.sdk.errorcodes.service_unavailable;
                     errorObj[kony.sdk.constants.MF_ERROR_CODE] = kony.sdk.errorcodes.service_unavailable;
                     errorObj[kony.sdk.constants.MF_ERROR_MSG] = kony.sdk.errormessages.service_unavailable_message;
                 } else if (response) {
                     errorObj = response;
                 } else {
                     errorObj[kony.sdk.constants.MF_OPSTATUS] = kony.sdk.errorcodes.connectivity_error_code;
                     errorObj[kony.sdk.constants.MF_ERROR_CODE] = kony.sdk.errorcodes.connectivity_error_code;
                     errorObj[kony.sdk.constants.MF_ERROR_MSG] = kony.sdk.errormessages.connectivity_error_message;
                 }
                 errorObj[kony.sdk.constants.HTTP_STATUS_CODE] = status;
                 errorObj.httpresponse.headers = httpRequest.getAllResponseHeaders();
                 errorObj.httpresponse.url = url;
                 failureCallback(errorObj);
             }
         }
     }
     if (konyContentType === "application/json") {
         if (params) {
             paramsTable = JSON.stringify(params);
         }
     } else if (konyContentType == undefined || konyContentType == null || konyContentType != 'formdata') {
         //preparing params for other than object services
         var firstKey = true;
         for (var key in params) {
             if (firstKey) {
                 paramsTable = new kony.net.FormData();
                 firstKey = false;
             }
             if (typeof(params[key]) != "undefined") {
                 if (typeof(params[key]) !== "string") {
                     params[key] = JSON.stringify(params[key]);
                 }
                 paramsTable.append((key), (params[key]));
             }
         }
     } else if (konyContentType == "formdata") {
         //for specific requests like object services we will send formdata through form encoding mechanism.
         if (params) {
             //for object services we are getting kony.net.FormData so using the same.
             paramsTable = params;
         }
     }
     if (headers) {
         for (var key in headers) {
             httpRequest.setRequestHeader(key, headers[key]);
         }
     } else {
         httpRequest.setRequestHeader(kony.sdk.constants.HTTP_CONTENT_HEADER, kony.sdk.constants.CONTENT_TYPE_JSON);
     }
     httpRequest.onReadyStateChange = localRequestCallback;
     if (options && (options[kony.sdk.constants.DISABLE_INTEGRITY] || options[kony.sdk.constants.PASSTHROUGH])) {
         //mesasging service and pass through enabled integration svc doesn't support http message body integrity
         //if integrity is enabled earlier,remove integrity
         //check is for windows 8.x and Kiosk platforms,which doesn't support integrity
         if (kony.sdk.constants.REMOVE_INTEGRITY_CHECK in kony.net) {
             kony.net.removeIntegrityCheck();
         }
         if (paramsTable) {
             httpRequest.send(paramsTable);
         } else {
             httpRequest.send();
         }
     } else {
         if (typeof(konyRef) !== "undefined" && konyRef && konyRef.mainRef.integrityKey === true) {
             var properties = konyRef.mainRef.integrityParams;
             try {
                 //check is for windows 8.x and Kiosk platforms,which doesn't support integrity
                 if (kony.sdk.constants.SET_INTEGRITY_CHECK in kony.net) {
                     kony.net.setIntegrityCheck(properties);
                 }
             } catch (e) {
                 kony.sdk.logsdk.warn("Invalid Integrity properties received");
                 throw "Invalid Integrity properties received";
             }
         } else {
             //check is for windows 8.x and Kiosk platforms,which doesn't support integrity
             if (kony.sdk.constants.REMOVE_INTEGRITY_CHECK in kony.net) {
                 kony.net.removeIntegrityCheck();
             }
         }
         if (paramsTable) {
             httpRequest.send(paramsTable);
         } else {
             httpRequest.send();
         }
     }
 }

 function konyNetHttpRequestSync(url, params, headers) {
     var paramsTable = null;
     var httpRequest = new kony.net.HttpRequest();
     var isInvalidJSON = false;
     httpRequest.open(constants.HTTP_METHOD_POST, url, false);
     var firstKey = true;
     for (var key in params) {
         if (firstKey) {
             paramsTable = new kony.net.FormData();
             firstKey = false;
         }
         if (typeof(params[key]) != "undefined") {
             if (typeof(params[key]) !== "string") {
                 params[key] = JSON.stringify(params[key]);
             }
             paramsTable.append((key), (params[key]));
         }
     }
     if (headers) {
         for (var key in headers) {
             httpRequest.setRequestHeader(key, headers[key]);
         }
     } else {
         httpRequest.setRequestHeader(kony.sdk.constants.HTTP_CONTENT_HEADER, kony.sdk.constants.CONTENT_TYPE_JSON);
     }
     //httpRequest.onReadyStateChange = localRequestCallback;
     httpRequest.send(paramsTable);
     var response = null;
     var status = Number(httpRequest.status.toString());
     kony.sdk.setLogLevelFromServerResponse(httpRequest.getAllResponseHeaders());
     if (httpRequest.response) {
         response = httpRequest.response;
     }
     if (response && typeof(response) === 'string') {
         if (kony.sdk.isJson(response)) {
             response = JSON.parse(response);
         } else {
             isInvalidJSON = true;
         }
     }
     if (response && !(isInvalidJSON)) {
         response.httpresponse = {};
         response.httpresponse.headers = httpRequest.getAllResponseHeaders();
         response.httpresponse.url = url;
         response.httpresponse.responsecode = status;
     }
     if (isInvalidJSON || (!response && status >= 200 && status < 300)) {
         var errorMessage = {};
         errorMessage.httpresponse = {};
         errorMessage[kony.sdk.constants.MF_OPSTATUS] = kony.sdk.errorcodes.invalid_json_code;
         errorMessage[kony.sdk.constants.MF_ERROR_MSG] = kony.sdk.errormessages.invalid_json_message;
         errorMessage[kony.sdk.constants.MF_ERROR_CODE] = kony.sdk.errorcodes.invalid_json_code;
         errorMessage[kony.sdk.constants.HTTP_STATUS_CODE] = status;
         errorMessage.httpresponse["response"] = response;
         errorMessage.httpresponse.headers = httpRequest.getAllResponseHeaders();
         errorMessage.httpresponse.url = url;
         errorMessage.httpresponse.responsecode = status;
         return errorMessage;
     } else if (status >= 200 && status < 300) {
         if (!response.opstatus) {
             response.opstatus = 0;
         }
         return response;
     } else {
         var resultTable = {};
         if (response) {
             resultTable = response;
             resultTable.httpStatusCode = httpRequest.status.toString();
         } else {
             resultTable[kony.sdk.constants.MF_OPSTATUS] = kony.sdk.errorcodes.connectivity_error_code;
             resultTable[kony.sdk.constants.MF_ERROR_CODE] = kony.sdk.errorcodes.connectivity_error_code;
             resultTable[kony.sdk.constants.MF_ERROR_MSG] = kony.sdk.errormessages.connectivity_error_message;
         }
         return resultTable;
     }
 }

 function konyDataStore() {
     //kony.sdk.logsdk.trace("Setting konyDataStore");
     this.setItem = function(key, value) {
         if (typeof(key) !== "string") {
             throw new Exception(kony.sdk.errorConstants.DATA_STORE_EXCEPTION, "Invalid Key");
         } else {
             try {
                 key = key.replace(/\//gi, "");
                 kony.store.setItem(key, value);
             } catch (e) {
                 kony.sdk.logsdk.error("Failed to set item in dtastore:" + e);
             }
         }
     };
     this.getItem = function(key) {
         kony.sdk.logsdk.debug("Getting item for key:" + key);
         if (typeof(key) !== "string") {
             throw new Exception(kony.sdk.errorConstants.DATA_STORE_EXCEPTION);
         } else {
             key = key.replace(/\//gi, "");
             var value = kony.store.getItem(key);
             if (value === null || value === undefined) {
                 kony.sdk.logsdk.debug("No value found with key:" + key);
                 return null;
             } else {
                 return value;
             }
         }
     };
     this.removeItem = function(key) {
         kony.sdk.logsdk.debug("Removing item for key:" + key);
         if (typeof(key) !== "string") {
             throw new Exception(Error.DATA_STORE_EXCEPTION);
         } else {
             key = key.replace(/\//gi, "");
             kony.store.removeItem(key); //If no item with that key exists, the method does not perform any action. Thus no need to check for key availablity.
         }
     };
     this.destroy = function() {
         kony.sdk.logsdk.info("Destroying data store for this app");
         kony.store.clear();
     };
     this.getAllItems = function() {
         kony.sdk.logsdk.info("Getting all item from data store");
         var items = {};
         var len = kony.store.length(); //get key length
         for (var i = 0; i < len; i++) {
             var key = kony.store.key(i); //get ith key
             var value = kony.store.getItem(key); //get value
             items[key] = value; //prepare itemset
         }
         return items;
     }
 }

 function parseHttpResponse(httpRequest) {
     var isInvalidResponse = false;
     var isJsonResponse = false;
     var parsedResponse = {};
     parsedResponse.isRawResponse = false;
     var value = "";
     var response = null;
     if (kony.sdk.isNullOrUndefined(httpRequest) || kony.sdk.isNullOrUndefined(httpRequest.response)) {
         kony.sdk.logsdk.warn("parseHttpResponse :: Null or Invalid response received");
     } else if (httpRequest.responseType && httpRequest.responseType === "blob") {
         parsedResponse.response = httpRequest.response;
         parsedResponse.isRawResponse = true;
     } else {
         response = kony.sdk.cloneObject(httpRequest.response);
         kony.sdk.logsdk.debug("parseHttpResponse :: Network response :", response);
         //Defaulting to JSON format
         if (kony.sdk.util.isJsonObject(response)) {
             parsedResponse.response = response;
             isJsonResponse = true;
         } else if (kony.sdk.util.isValidString(response)) {
             if (kony.sdk.isJson(response)) {
                 parsedResponse.response = JSON.parse(response);
                 isJsonResponse = true;
             }
         }
         //Handling when response is not json
         if (!isJsonResponse) {
             if (kony.sdk.util.isValidString(httpRequest.response)) {
                 parsedResponse.response = response;
             } else {
                 parsedResponse.response = httpRequest.response;
             }
             var lowerCaseHeaders = kony.sdk.util.convertJsonKeysToLowerCase(httpRequest.getAllResponseHeaders());
             //value variable contains response header in lower case
             if (!kony.sdk.isNullOrUndefined(lowerCaseHeaders)) {
                 value = lowerCaseHeaders[kony.sdk.constants.HTTP_CONTENT_HEADER.trim().toLowerCase()];
             } else {
                 kony.sdk.logsdk.warn("parseHttpResponse :: received null response headers  " + lowerCaseHeaders);
             }
             kony.sdk.logsdk.warn("parseHttpResponse :: content-type of response " + value);
             //MFSDK-3525 Adding an additional check to see if content type is present.
             if (kony.sdk.util.isValidString(value) && value.startsWith(kony.sdk.constants.CONTENT_TYPE_JSON)) {
                 kony.sdk.logsdk.warn("parseHttpResponse :: Unhandled content received for content-type application/json");
                 isInvalidResponse = true;
             } else {
                 parsedResponse.isRawResponse = true;
             }
         }
     }
     parsedResponse.isInvalidResponse = isInvalidResponse;
     return parsedResponse;
 }
 kony.sdk.getSdkType = function() {
     return kony.sdk.constants.SDK_TYPE_IDE;
 };
 kony.sdk.getPayload = function(konyRef) {
     var payload = {};
     payload.os = kony.os.deviceInfo().version + "";
     payload.dm = kony.os.deviceInfo().model;
     payload.did = kony.sdk.getDeviceId();
     payload.ua = kony.os.userAgent();
     if (appConfig) {
         payload.aid = appConfig.appId;
         payload.aname = appConfig.appName;
     } else {
         var clientParams = konyRef.getClientParams();
         payload.aid = clientParams.aid ? clientParams.aid : konyRef.mainRef.baseId;
         payload.aname = clientParams.aname ? clientParams.aname : konyRef.mainRef.name;
     }
     payload.chnl = kony.sdk.getChannelType();
     payload.plat = kony.sdk.getPlatformName();
     if (payload.plat === kony.sdk.constants.PLATFORM_IOS && kony.os.deviceInfo().name !== kony.sdk.constants.PLATFORM_SPA) {
         payload.did = getDeviceIdForIOSPlatform();
     }
     if (payload.plat === kony.sdk.constants.PLATFORM_IOS && payload.dm.toLowerCase().indexOf("ipod") !== -1) {
         payload.chnl = "ipod";
     }
     payload.aver = appConfig.appVersion;
     payload.atype = kony.sdk.getAType();
     payload.stype = "b2c";
     payload.kuid = konyRef.getUserId();
     payload.mfaid = konyRef.mainRef.appId;
     payload.mfbaseid = konyRef.mainRef.baseId;
     payload.mfaname = konyRef.mainRef.name;
     payload.sdkversion = kony.sdk.version;
     payload.sdktype = kony.sdk.getSdkType();
     if (kony.application.getCurrentForm()) {
         var fid = kony.application.getCurrentForm().id;
         if (fid) {
             payload.fid = fid;
         }
     }
     payload.sessiontype = kony.sdk.util.getSessionType();
     return payload;
 };
 /**
  * Returns unique identifier for a device.
  * In case of Android & Windows the API kony.os.deviceInfo().deviceid is guaranteed to provide unique identifier for a device.
  * In case of iOS the API kony.os.deviceInfo().identifierForVendor is guaranteed to provide unique key per vendor.
  * A different value is returned for apps on the same device that come from different vendors, and for apps on different devices regardless of vendor
  * @return {string}
  */
 kony.sdk.getDeviceId = function() {
     var name = kony.os.deviceInfo().name;
     if (name === kony.sdk.constants.PLATFORM_SPA) {
         var deviceID = kony.ds.read(kony.sdk.constants.KEY_DEVICE_ID);
         if (!deviceID) {
             deviceID = kony.license.generateUUID().toString();
             kony.ds.save(deviceID, kony.sdk.constants.KEY_DEVICE_ID);
         }
         return deviceID;
     } else {
         // For Android & Windows platforms.
         return kony.os.deviceInfo().deviceid;
     }
 };
 kony.sdk.getChannelType = function() {
     var returnVal = "";
     returnVal = "mobile";
     return returnVal;
 };
 kony.sdk.getPlatformName = function() {
     var returnVal = "";
     returnVal = kony.sdk.constants.PLATFORM_ANDROID;
     return returnVal;
 };
 kony.sdk.util.createSessionAndSendIST = function() {
     kony.license.createSession();
     kony.license.captureKonyLicenseUsage(true);
 }
 kony.mbaas.invokeMbaasServiceFromKonyStudio = function(url, inputParam, serviceID, operationID, callBack, infoObject) {
     var currentInstance = kony.sdk.getCurrentInstance();
     if (!currentInstance) {
         throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, kony.sdk.constants.INIT_FAILURE_MESSAGE + "this service.");
     }
     var integrationService = currentInstance.getIntegrationService(serviceID);
     var options = {};
     if (inputParam && inputParam["httpconfig"]) {
         options["httpconfig_old"] = inputParam["httpconfig"];
         delete inputParam["httpconfig"];
     }
     if (inputParam && inputParam["httpRequestOptions"] && inputParam["httpRequestOptions"] instanceof Object) {
         options["httpRequestOptions"] = inputParam["httpRequestOptions"];
         delete inputParam["httpRequestOptions"];
     }
     var headers = null;
     if (inputParam && inputParam["httpheaders"]) {
         headers = inputParam["httpheaders"];
         delete inputParam["httpheaders"];
     }
     integrationService.invokeOperation(operationID, headers, inputParam, function(res) {
         if (typeof(callBack) === 'function') {
             callBack(400, res, infoObject);
         }
     }, function(res) {
         if (typeof(callBack) === 'function') {
             callBack(400, res, infoObject);
         }
     }, options);
 };
 kony.mbaas.invokeMbaasServiceFromKonyStudioSync = function(url, inputParam, serviceID, operationID) {
     var currentInstance = kony.sdk.getCurrentInstance();
     if (!currentInstance) {
         throw new Exception(kony.sdk.errorConstants.INIT_FAILURE, kony.sdk.constants.INIT_FAILURE_MESSAGE + "this service.");
     }
     var integrationService = currentInstance.getIntegrationService(serviceID);
     var headers = null;
     if (inputParam && inputParam["httpheaders"]) {
         headers = inputParam["httpheaders"];
         delete inputParam["httpheaders"];
     }
     return integrationService.invokeOperationSync(operationID, headers, inputParam);
 };
 kony.mbaas.invokeMbaasServiceFromKonyStudioAsync = function(url, inputParam, serviceID, operationID, callBack, info) {
     kony.mbaas.invokeMbaasServiceFromKonyStudio(url, inputParam, serviceID, operationID, callBack, info);
 };

 function getDeviceIdForIOSPlatform() {
     if (kony.os.deviceInfo().osversion >= 6.0) {
         return kony.os.deviceInfo().identifierForVendor;
     }
     return kony.os.deviceInfo().customdeviceid;
 }
 //Helps to prepare the input wrapped into kony.net.FormData
 kony.sdk.getFormData = function(payload) {
     var formData = new kony.net.FormData();
     formData.append(kony.sdk.constants.JSON_DATA, JSON.stringify(payload));
     return formData;
 };
 //Helps to update prepare the input wrapped into kony.net.FormData
 kony.sdk.updateFormData = function(formData, key, value) {
     formData.append(key, JSON.stringify(value));
     return formData;
 };
 //Helps to get the atype for Spa and DesktopWeb applications it would be kony.sdk.constants.SDK_ATYPE_SPA ,for android wear applications it would be "watch" and remaining it would be "native"
 kony.sdk.getAType = function() {
     var returnVal = kony.sdk.constants.SDK_ATYPE_NATIVE;
     returnVal = kony.sdk.constants.SDK_ATYPE_SPA;
     return returnVal;
 };
 kony.sdk.setLicenseCall = function(appKey, appSecret, data) {
     //checking if new MF app is connected
     var reportingServiceUrl = data.reportingsvc.session;
     if (typeof(appConfig) != "undefined") {
         if ((appKey === appConfig.appKey) && (appSecret === appConfig.appSecret) && (typeof(appConfig.svcDoc) !== "undefined" && reportingServiceUrl === appConfig.svcDoc.reportingsvc.session)) {
             return; //user is doing init on same environment and same MF-app
         } else {
             appConfig.isturlbase = reportingServiceUrl.replace("/IST", "");
             appConfig.appKey = appKey;
             appConfig.appSecret = appSecret;
             appConfig.serviceUrl = data.selflink;
             appConfig.svcDoc = data;
             // IST is triggered with new sid and new MF app on the same or different IST server based on how isturlbase is populated
             kony.sdk.util.createSessionAndSendIST();
         }
     }
 };
 kony.sdk.saveMetadatainDs = function(appKey, appSecret, servConfig) {
     // Saving App metadata in storage for Persistence.
     kony.sdk.isLicenseUrlAvailable = true;
     var appId = {
         "appKey": appKey,
         "appSecret": appSecret,
         "serviceUrl": servConfig.selflink,
         "appVersion": appConfig.appVersion,
         "licenseUrl": servConfig.reportingsvc.session
     };
     if (typeof(sdkInitConfig) !== "undefined") {
         sdkInitConfig.appKey = appKey;
         sdkInitConfig.appSecret = appSecret;
         sdkInitConfig.serviceUrl = servConfig.selflink;
     }
     kony.sdk.dataStore.setItem(appConfig.appId + "_mobileFabricServiceDoc", JSON.stringify(servConfig));
     kony.sdk.dataStore.setItem(appConfig.appId, JSON.stringify(appId));
 };
 kony.sdk.deleteMetadatafromDs = function() {
     kony.sdk.dataStore.removeItem(appConfig.appId);
 };
 /**
  * Validates the deeplink params. A valid deeplink redirection will contain params "code" & "launchmode" is 3.
  * @param {map} params  - query parameters from the deeplink redirection
  */
 kony.sdk.isValidDeeplinkCallback = function(params) {
     if (params && params.launchmode == kony.sdk.constants.LAUNCHMODE_DEEPLINK && params.launchparams.code) return true;
     else return false;
 };
 kony.sdk.getReportingParamsForOfflineObjects = function() {
     var reportingData = kony.sdk.getPayload(konyRef);
     reportingData.xmode = "offline";
     reportingData.rsid = kony.sdk.currentInstance.getSessionId();
     return JSON.stringify(reportingData);
 };
 var MFAppVersion;
 kony.sdk.setFabricAppVersion = function(version) {
     MFAppVersion = version;
 };
 /**
  * Returns the SSO token for the provider.
  *
  * @return SSO token
  */
 kony.sdk.util.getSSOTokenForProvider = function(_providerName) {
     kony.sdk.logsdk.trace("### kony.sdk.util.getSSOTokenForProvider:: Entered Method.");
     var tokenString = kony.sdk.util.getSSOToken();
     if (kony.sdk.util.isNullOrEmptyString(tokenString)) {
         kony.sdk.logsdk.warn("### kony.sdk.util.getSSOTokenForProvider:: SSO token is either empty,null or undefined for provider:" + _providerName);
         return null;
     }
     var tokenJSON = JSON.parse(tokenString);
     return tokenJSON[_providerName.toLowerCase()];
 };
 /**
  * Add/Replace and Returns the stringified SSO JSON with
  * the new token and provider or
  * updates the existing one.
  *
  * @return  Stringified SSO token JSON"{*}"
  */
 kony.sdk.util.addOrUpdateSSOTokenWithProvider = function(ssoToken, _providerName) {
     kony.sdk.logsdk.trace("### kony.sdk.util.addOrUpdateSSOTokenWithProvider:: Entered Method.");
     var tokenJSON = {};
     var tokenString = kony.sdk.util.getSSOToken();
     if (!kony.sdk.util.isNullOrEmptyString(tokenString)) {
         tokenJSON = JSON.parse(tokenString);
     }
     tokenJSON[_providerName.toLowerCase()] = ssoToken;
     return JSON.stringify(tokenJSON);
 };
 /**
  * Deletes the SSO Token for the
  * provider passed
  */
 kony.sdk.util.deleteSSOTokenForProvider = function(_providerName) {
     kony.sdk.logsdk.trace("### kony.sdk.util.deleteSSOTokenForProvider:: Entered Method.");
     var tokenString = kony.sdk.util.getSSOToken();
     if (kony.sdk.util.isNullOrEmptyString(tokenString)) {
         kony.sdk.logsdk.warn("### kony.sdk.util.getSSOTokenForProvider:: SSO token is either empty,null or undefined for provider:" + _providerName);
         return null;
     }
     var tokenJSON = JSON.parse(tokenString);
     delete tokenJSON[_providerName.toLowerCase()];
     kony.sdk.util.saveSSOToken(JSON.stringify(tokenJSON));
 };
 /**
  * Returns the default fabric application version. For auto init app version will be available in appConfig,
  * for manual init developer has to send fabric version explicitly.
  *
  * Fabric version in manual init has more priority over one specified in visualizer.
  * @return {*}
  */
 kony.sdk.getFabricAppVersion = function() {
     if (!kony.sdk.isNullOrUndefined(MFAppVersion)) {
         return MFAppVersion;
     } else if (!kony.sdk.isNullOrUndefined(appConfig) && !kony.sdk.isNullOrUndefined(appConfig.runtimeAppVersion)) {
         return appConfig.runtimeAppVersion;
     }
 };
 /**
  * Generates key to encrypt/decrypt any text.
  * @param salt {Array}
  * @returns string
  */
 kony.sdk.generateSecureKeyFromText = function(salt) {
     var secureKey = "";
     if (!kony.sdk.isNullOrUndefined(salt) && kony.sdk.isArray(salt)) {
         secureKey = kony.crypto.newKey("passphrase", 128, {
             passphrasetext: salt,
             subalgo: "aes",
             passphrasehashalgo: "md5"
         });
     } else {
         throw new Exception(kony.sdk.errorConstants.CONFIGURATION_FAILURE, "Invalid param. salt cannot be null, should be of type Array");
     }
     return secureKey;
 };
 /**
  * Encrypts text with the given salt and encryptionAlgo.
  * @param text {string}
  * @param salt {Array}
  * @param encryptionAlgo {text}
  * @returns {string}
  */
 kony.sdk.encryptText = function(text, salt, encryptionAlgo) {
     var encryptionKey = kony.sdk.generateSecureKeyFromText(salt);
     var encryptedText = kony.crypto.encrypt(encryptionAlgo, encryptionKey, text, {});
     return kony.convertToBase64(encryptedText);
 };
 /**
  * Decrypts text with the given salt and encryptionAlgo.
  * @param text {string}
  * @param salt {Array}
  * @param encryptionAlgo {text}
  * @returns {string}
  */
 kony.sdk.decryptText = function(text, salt, decryptionAlgo) {
     var decryptionKey = kony.sdk.generateSecureKeyFromText(salt);
     var rawText = kony.convertToRawBytes(text)
     return kony.crypto.decrypt(decryptionAlgo, decryptionKey, rawText, {});
 };
 /**
  * Returns type of object
  * framework api kony.type is not supported by Phonegap and plain-js platforms
  * @return {*}
  */
 kony.sdk.util.type = function(objectVar) {
     if (kony.sdk.getAType() === kony.sdk.constants.SDK_ATYPE_NATIVE) {
         return kony.type(objectVar)
     } else {
         return typeof(objectVar)
     }
 };