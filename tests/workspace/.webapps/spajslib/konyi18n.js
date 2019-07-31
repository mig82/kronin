
$KI.i18n = (function() {
    
    

    var module = {
        setcurrentlocaleasync: function(locale, onsuccess, onfailure, info) {
            $KU.logExecuting('kony.i18n.setCurrentLocaleAsync');
            if(!locale) {
                $KU.logWarnMessage('No locale specified');
                return;
            }
            $KU.logExecutingWithParams('kony.i18n.setCurrentLocaleAsync', locale, onsuccess, onfailure, info);
            $KG["oldlocale"] = module.getcurrentlocale();
            
            module.initializeI18n(locale, null, onsuccess, onfailure, info);
            $KU.logExecutingFinished('kony.i18n.setCurrentLocaleAsync');
        },

        setdefaultlocaleasync: function(locale, onsuccess, onfailure, info) {
            $KU.logExecuting('kony.i18n.setDefaultLocaleAsync');
            if(!locale) {
                $KU.logWarnMessage('No locale specified');
                return;
            }
            $KU.logExecutingWithParams('kony.i18n.setDefaultLocaleAsync', locale, onsuccess, onfailure, info);
            try {
                var localeVersion = (localStorage && localStorage.getItem($KG["appid"] + "_" + "i18nVersion")) || "";
                if(!$KG["i18nVersion"] || localeVersion != $KG["i18nVersion"]) {
                    try {
                        localStorage.setItem($KG["appid"] + "_" + "i18nVersion", $KG["i18nVersion"]);
                    } catch(e) {
                        if(localStorage && (e.name == "QUOTA_EXCEEDED_ERR" || e.name == "QuotaExceededError")) {
                            if(localStorage.length === 0) {
                                $KU.logWarnMessage('Private Browsing is switched ON');
                            } else {
                                $KU.logWarnMessage('Data storage limit has exceeded');
                            }
                        } else
                            $KU.logWarnMessage('localStorage is not available');
                    }
                    module.cleanupI18nCache();
                }
            } catch(err) {
                $KU.logErrorMessage('unknown error' + err);
            }

            $KG["oldlocale"] = $KG["defaultlocale"];
            $KG["defaultlocale"] = locale;

            
            var locale = module.determineCurrentLocale();
            module.initializeI18n(locale, null, onsuccess, onfailure, info);
            $KU.logExecutingFinished('kony.i18n.setDefaultLocaleAsync');
        },

        setdefaultlocale: function() {
            $KU.logExecuting('kony.i18n.setDefaultLocale');
            var locale = arguments[0] || null,
                successcallback = arguments[1] || null,
                errorcallback = arguments[2] || null,
                initializeFn = arguments[3] || null;
            $KU.logExecutingWithParams('kony.i18n.setDefaultLocale');
            if(!locale) {
                kony.web.logger("warn", "No locale specified");
                return;
            }
            if(initializeFn) {
                $KG["locales"] = $KG["locales"].split(",");
                try {
                    var localeVersion = (localStorage && localStorage.getItem($KG["appid"] + "_" + "i18nVersion")) || "";
                    if(!$KG["i18nVersion"] || localeVersion != $KG["i18nVersion"]) {
                        try {
                            localStorage.setItem($KG["appid"] + "_" + "i18nVersion", $KG["i18nVersion"]);
                        } catch(e) {
                            if(localStorage && (e.name == "QUOTA_EXCEEDED_ERR" || e.name == "QuotaExceededError")) {
                                if(localStorage.length === 0) {
                                    kony.web.logger("warn", "Private Browsing is switched ON");
                                } else {
                                    kony.web.logger("warn", "Data storage limit has exceeded");
                                }
                            } else
                                kony.web.logger("warn", "localStorage is not available");
                        }
                        module.cleanupI18nCache();
                    }
                } catch(err) {
                    kony.web.logger('error', 'unknown error' + err);
                }
            }

            
            var locale = module.determineCurrentLocale();
            module.initializeI18n(locale, initializeFn, successcallback, errorcallback);
            $KU.logExecutingFinished('kony.i18n.setDefaultLocale');
        },

        setcurrentlocale: function(locale) {
            $KU.logExecuting('kony.i18n.setCurrentLocale');
            if(!locale)
                return;
            $KU.logExecutingWithParams('kony.i18n.setCurrentLocale', locale);
            
            module.initializeI18n(locale);
            $KU.logExecutingFinished('kony.i18n.setCurrentLocale');
        },

        getcurrentlocale: function() {
            $KU.logExecuting('kony.i18n.getCurrentLocale');
            $KU.logExecutingWithParams('kony.i18n.getCurrentLocale');
            $KU.logExecutingFinished('kony.i18n.getCurrentLocale');
            return $KG["currentlocale"];
        },

        getsupportedlocales: function() {
            $KU.logExecuting('kony.i18n.getSupportedLocales');
            $KU.logExecutingWithParams('kony.i18n.getSupportedLocales');
            $KU.logWarnMessage(' getSupportedLocales is not supported');
            var lang = $KU.getBrowserLanguage();
            $KU.logExecutingFinished('kony.i18n.getSupportedLocales');
            return IndexJL ? [null, lang] : [lang];
        },

        getcurrentdevicelocale: function() {
            $KU.logExecuting('kony.i18n.getCurrentDeviceLocale');
            $KU.logExecutingWithParams('kony.i18n.getCurrentDeviceLocale');
            var lang = $KU.getBrowserLanguage();
            var languageArr = lang.split("-");
            var retObj = {};
            retObj.language = languageArr[0];
            retObj.country = languageArr[1];
            retObj.name = lang;
            $KU.logExecutingFinished('kony.i18n.getCurrentDeviceLocale');
            return retObj;
        },

        updateresourcebundle: function(bundle, locale) {
            
            
            $KU.logExecuting('kony.i18n.updateResourceBundle');
            if(!locale || !bundle) {
                $KU.logErrorMessage('Invaid bundle and loacale as arguments');
                return;
            }
            $KU.logExecutingWithParams('kony.i18n.updateResourceBundle', bundle, locale);
            var existingBundle = {};
            var lsKey = $KG["appid"] + "_" + locale;

            try {
                if($KG[lsKey]) {
                    existingBundle = $KG[lsKey];
                } else if(localStorage) {
                    var strRetrieved = localStorage.getItem(lsKey);
                    if(strRetrieved)
                        existingBundle = JSON.parse(strRetrieved);
                }
            } catch(err) {
                $KU.logErrorMessage('unknown error ' + err);
            }

            $KU.mergeObjects(existingBundle, bundle);

            try {
                try {
                    if(!$KG[lsKey]) {
                        var bundleString = JSON.stringify(existingBundle);
                        localStorage.setItem(lsKey, bundleString);
                    }
                } catch(e) {
                    $KG[lsKey] = existingBundle;
                    if(localStorage && (e.name == "QUOTA_EXCEEDED_ERR" || e.name == "QuotaExceededError")) {
                        if(localStorage.length === 0) {
                            $KU.logWarnMessage('Private Browsing is switched ON');
                        } else {
                            $KU.logWarnMessage('Data storage limit has exceeded');
                        }
                    } else
                        $KU.logWarnMessage('localStorage is not available');
                }
            } catch(err) {
                $KU.logErrorMessage('unknown error' + err);
            }

            if($KG[lsKey]) {
                $KG[lsKey] = existingBundle;
            }
            if($KG["currentlocale"] == locale)
                $KG["i18nArray"] = $KU.convertObjectToArray(existingBundle);
            var locales = $KG["locales"];
            if(!$KU.inArray(locales, locale, true))
                locales.push(locale);
            $KU.logExecutingFinished('kony.i18n.updateResourceBundle');
        },

        setresourcebundle: function(bundle, locale) {
            
            $KU.logExecuting('kony.i18n.setResourceBundle');
            if(!locale || !bundle) {
                $KU.logErrorMessage('Invaid bundle and loacale as arguments');
                return;
            }
            $KU.logExecutingWithParams('kony.i18n.setResourceBundle', bundle, locale);
            var bundleString = JSON.stringify(bundle);

            var lsKey = $KG["appid"] + "_" + locale;
            try {
                try {
                    localStorage.setItem(lsKey, bundleString); 
                } catch(e) {
                    $KG[lsKey] = bundle;
                    if(localStorage && (e.name == "QUOTA_EXCEEDED_ERR" || e.name == "QuotaExceededError")) {
                        if(localStorage.length === 0) {
                            $KU.logWarnMessage('Privatebrowsing is Switched on');
                        } else {
                            $KU.logWarnMessage('Data storage limit has exceeded');
                        }
                    } else
                        $KU.logWarnMessage('localStorage is not available');

                }
            } catch(err) {
                $KU.logErrorMessage('unknown error' + err);
            }

            if($KG["currentlocale"] == locale) {
                var JSONObj = JSON.parse(bundleString);
                $KG["i18nArray"] = $KU.convertObjectToArray(JSONObj);
            }
            var locales = $KG["locales"];
            if(!$KU.inArray(locales, locale, true))
                locales.push(locale);
            $KU.logExecutingFinished('kony.i18n.setResourceBundle');
        },

        deleteresourcebundle: function(locale) {
            
            $KU.logExecuting('kony.i18n.deleteResourceBundle');
            var lsKey = $KG["appid"] + "_" + locale;
            try {
                localStorage && localStorage.removeItem(lsKey);
            } catch(err) {
                $KU.logErrorMessage('unknown error' + err);
            }
            $KG[lsKey] = "";
            $KU.logExecutingWithParams('kony.i18n.deleteResourceBundle', locale);
            if($KG["currentlocale"] == locale) {
                $KG["i18nArray"] = [];
            }
            $KU.removeArray($KG["locales"], locale);
            $KU.logExecutingFinished('kony.i18n.deleteResourceBundle');
        },

        isresourcebundlepresent: function(locale) {
            
            $KU.logExecuting('kony.i18n.isResourceBundlePresent');
            if(!locale) {
                $KU.logErrorMessage('Invalid arguments');
                return false;
            }
            $KU.logExecutingWithParams('kony.i18n.isResourceBundlePresent', locale);
            var res = $KU.inArray($KG["locales"], locale, true);
            if(res)
            {
                $KU.logExecutingFinished('kony.i18n.isResourceBundlePresent VIA if it is a pre-defined locale bundle');
                return true;
            }
            else {
                
                var lsKey = $KG["appid"] + "_" + locale;
                var strRetrieved = null;
                try {
                    strRetrieved = (localStorage && localStorage.getItem(lsKey)) || $KG[lsKey];
                } catch(err) {
                    kony.web.logger('error', 'unknown error' + err);
                }
                $KU.logExecutingFinished('kony.i18n.isResourceBundlePresent VIA if locale bundle is dynamically handled');
                if(strRetrieved)
                    return true;
                else {
                    $KU.logErrorMessage('String not recieved');
                    return false;
                }
            }
        },

        islocalesupportedbydevice: function(locale) {
            $KU.logWarnMessage('islocalesupportedbydevice: Method Not supported');
            return false;
        },

        getlocalizedstring: function(i18nkey) {
            
            $KU.logExecuting('kony.i18n.getLocalizedString');
            var i18nValue = $KG["i18nArray"][i18nkey];
            $KU.logExecutingWithParams('kony.i18n.getLocalizedString', i18nkey);
            $KU.logExecutingFinished('kony.i18n.getLocalizedString');
            return typeof(i18nValue) == "undefined" ? null : i18nValue;
        },

        
        determineCurrentLocale: function() {
            var supportedLocales = $KG["locales"];
            var defaultlocale = $KG["defaultlocale"];
            var lang = $KU.getBrowserLanguage();
            var deviceLocale = lang.replace("-", "_");
            var currentLocale = "";

            var res = $KU.inArray(supportedLocales, deviceLocale, true);
            if(res)
                currentLocale = deviceLocale;
            else {
                var lang = deviceLocale.split("_")[0];
                var res2 = $KU.inArray(supportedLocales, lang, true);
                if(res2)
                    currentLocale = lang;
                else
                    currentLocale = defaultlocale;
            }
            return currentLocale;
        },

        initializeI18n: function(locale, initializeFn, successcallback, errorcallback, info) {
            if(!$KG["i18nArray"])
                $KG["i18nArray"] = [];

            var lsKey = $KG["appid"] + "_" + locale;
            var strRetrieved;

            try {
                if(localStorage)
                    strRetrieved = localStorage.getItem(lsKey);
            } catch(err) {}

            if(!strRetrieved)
                module.getResource(locale, initializeFn, successcallback, errorcallback, info);
            else {
                var JSONObj = JSON.parse(strRetrieved);
                $KG["i18nArray"] = $KU.convertObjectToArray(JSONObj);
                $KG["i18nInitialized"] = true;
                $KG["currentlocale"] = locale;
                initializeFn && initializeFn();
                successcallback && successcallback($KG["oldlocale"], locale, info);
            }
        },

        
        getResource: function(locale, initializeFn, successcallback, errorcallback, info) {
            var filePath = "";

            if($KG["appmode"] == constants.APPLICATION_MODE_NATIVE)
                filePath = kony.appinit.getStaticContentPath() + $KG["platformver"] + kony.constants.RESOURCES_PATH + "/" + kony.constants.TRANSLATION_PATH + "/" + locale + "." + kony.constants.TRANSLATION_EXT + "?ver=" + $KG["version"];
            else
                filePath = kony.constants.RESOURCES_PATH + "/" + kony.constants.TRANSLATION_PATH + "/" + locale + "." + kony.constants.TRANSLATION_EXT + "?ver=" + $KG["version"];

            
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.src = filePath;

            var timer = setTimeout(function() {
                kony.web.logger("error", "Timeout while loading resource bundle.");
                $KG["i18nInitialized"] = true;
                initializeFn && initializeFn();
            }, 60000);

            var sCallback = function() {
                
                kony.print("i18n resource loaded successfully");
                clearTimeout(timer);
                $KG.i18nInitialized = true;
                $KG["currentlocale"] = locale;
                if(typeof i18nObject != "undefined" && i18nObject) {
                    module.insertDB(i18nObject, locale);
                    i18nObject = "";
                }
                initializeFn && initializeFn();
                successcallback && successcallback($KG["oldlocale"], module.getcurrentlocale(), info);
            };

            var eCallback = function() {
                kony.web.logger("error", "An error has occurred while loading i18 locales");
                clearTimeout(timer);
                $KG.i18nInitialized = true;
                initializeFn && initializeFn();
                errorcallback && errorcallback($KG["oldlocale"], module.getcurrentlocale(), info);
            };

            if(!script.addEventListener) {
                script.onreadystatechange = function() {
                    if(this.readyState == 'complete' || this.readyState == 'loaded') {
                        script.onreadystatechange = null;
                        sCallback();
                    }
                }
            } else {
                script.onload = sCallback;
                script.onerror = eCallback;
            }
            head.appendChild(script);
        },

        insertDB: function(JSONData, locale) {
            var lsKey = $KG["appid"] + "_" + locale;
            var JSONObj, lsStr;
            if(typeof JSONData == "string") {
                JSONObj = JSON.parse(JSONData);
                lsStr = JSONData;
            } else {
                JSONObj = JSONData;
                lsStr = JSON.stringify(JSONData);
            }

            try {
                try {
                    localStorage.setItem(lsKey, lsStr);
                } catch(e) {

                    $KG[lsKey] = JSONObj;
                    localStorage && localStorage.removeItem($KG["appid"] + "_" + "i18nVersion");
                    if(localStorage && (e.name == "QUOTA_EXCEEDED_ERR" || e.name == "QuotaExceededError")) {
                        if(localStorage.length === 0) {
                            kony.web.logger("warn", "Private Browsing is switched ON");
                        } else {
                            kony.web.logger("warn", "Data storage limit has exceeded");
                        }
                    } else
                        kony.web.logger("warn", "localStorage is not available");
                }
            } catch(err) {}
            $KG["i18nArray"] = $KU.convertObjectToArray(JSONObj);
        },

        _addi18nPropsForWidget: function(widgetModel) {
            if($KU.inArray($KU.translatableWidgets, widgetModel.wType, true)) {
                widgetModel.canUpdateUI = false;
                var widget_i18n_properties = [];
                switch(widgetModel.wType) {
                    case "Switch":
                        i18n_properties = ["leftsidetext", "rightsidetext"];
                        break;
                    case "Form":
                    case "Popup":
                        i18n_properties = ["title"];
                        break;
                    case "FlexContainer":
                    case "Box":
                        i18n_properties = ["tabname"];
                    default:
                        i18n_properties = ["text", "placeholder"];

                }
                this._updateWidgetModelWithi18n(widgetModel, i18n_properties);
                widgetModel.canUpdateUI = true;
            }
        },

        _updateWidgetModelWithi18n: function(widgetModel, i18n_properties) {
            for(var val in i18n_properties) {
                var property = i18n_properties[val];
                var i18n_property = "i18n_" + property
                if(widgetModel[i18n_property] && widgetModel[i18n_property].toLowerCase().indexOf("i18n.getlocalizedstring") != -1) {
                    widgetModel[property] = $KU.getI18NValue(widgetModel[i18n_property]);
                }
            }
        },


        _addi18nPropsForContainer: function(containerModel, childList) {
            for(var child in childList) {
                var widget = childList[child];
                var i18n_properties = [];
                var widgetModel = containerModel[widget];
                if(!widgetModel) {
                    continue;
                }
                if(widgetModel && widgetModel.children && widgetModel.children.length != 0) {
                    this._addi18nPropsForContainer(widgetModel, widgetModel.children);
                }
                this._addi18nPropsForWidget(widgetModel);
            }
        },

        
        translateFormModel: function(containerModel) {
            var childList = containerModel.children;
            if(!childList) {
                this._addi18nPropsForWidget(containerModel);
            } else {
                this._addi18nPropsForContainer(containerModel, childList);
            }
        },

        
        checkI18nStatus: function(widgetModel, attribute) {
            if(!$KG["localization"] || typeof widgetModel != "object" || $KU.isArray(widgetModel))
                return;

            if(attribute == "text" && widgetModel.i18n_text) {
                widgetModel.i18n_text = "";
            }
        },

        cleanupI18nCache: function() {
            var supportedLocales = $KG["locales"];
            for(var i = 0; i < supportedLocales.length; i++) {
                var locale = supportedLocales[i];
                var lsKey = $KG["appid"] + "_" + locale;
                try {
                    localStorage && localStorage.removeItem(lsKey);
                } catch(err) {}
                $KG[lsKey] = "";
            }
        },

        getI18nTitle: function(formModel) {
            var title = formModel.title;
            if(formModel.i18n_title && formModel.i18n_title.toLowerCase().indexOf("i18n.getlocalizedstring") != -1) {
                return $KU.getI18NValue(formModel.i18n_title);
            } else
                return title;
        },

        
        setlocalelayoutconfig: function(localeConfigObject) {
            $KU.logExecuting('kony.i18n.setLocaleLayoutConfig');
            $KU.logExecutingWithParams('kony.i18n.setLocaleLayoutConfig', localeConfigObject);
            if(localeConfigObject && localeConfigObject instanceof Object) {
                $KG['localeLayoutConfig'] = localeConfigObject;
            }
            $KU.logExecutingFinished('kony.i18n.setLocaleLayoutConfig');
        }
    };


    return module;
}());
