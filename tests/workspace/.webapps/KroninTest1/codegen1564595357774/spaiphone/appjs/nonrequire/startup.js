kony.globals["appid"] = "KroninTest1";
kony.globals["build"] = "debug";
kony.globals["locales"] = [];
kony.globals["i18nArray"] = [];
//startup.js
var appConfig = {
    appId: "KroninTest1",
    appName: "KroninTest1",
    appVersion: "1.0.0",
    isDebug: true,
    isMFApp: false,
    eventTypes: [],
};
sessionID = "";

function setAppBehaviors() {
    kony.application.setApplicationBehaviors({
        applyMarginPaddingInBCGMode: false,
        adherePercentageStrictly: true,
        retainSpaceOnHide: true,
        isMVC: true,
        responsive: true,
        APILevel: 8400
    })
};

function themeCallBack() {
    initializeGlobalVariables();
    requirejs.config({
        baseUrl: kony.appinit.getStaticContentPath() + 'spaiphone/appjs'
    });
    require(['kvmodules'], function() {
        applicationController = require("applicationController");
        callAppMenu();
        kony.application.setApplicationInitializationEvents({
            init: applicationController.appInit,
            postappinit: applicationController.postAppInitCallBack,
            showstartupform: function() {
                new kony.mvc.Navigation("Form1").navigate();
            }
        });
    });
};

function loadResources() {
    kony.theme.packagedthemes(["defaultTheme"]);
    globalhttpheaders = {};
    sdkInitConfig = {
        "appConfig": appConfig,
        "isMFApp": appConfig.isMFApp,
        "eventTypes": appConfig.eventTypes,
    }
    kony.theme.setCurrentTheme("default", themeCallBack, themeCallBack);
};

function initializeApp() {
    kony.application.setApplicationMode(constants.APPLICATION_MODE_NATIVE);
    //This is the entry point for the application.When Locale comes,Local API call will be the entry point.
    loadResources();
};
debugger;