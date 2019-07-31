
kony.ui.Browser = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Browser"));

    kony.ui.Browser.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.onSuccess = bconfig.onSuccess; 
    this.onFailure = bconfig.onFailure; 
    this.screenLevelWidget = bconfig.screenLevelWidget; 
    this.enableZoom = bconfig.enableZoom; 
    this.detectTelNumber = bconfig.detectTelNumber; 

    this.readconfig = function(val) {
        this.url = val.URL;
        this.method = val.requestMethod;
        this.data = val.requestData;
    }

    bconfig.requestURLConfig && this.readconfig(bconfig.requestURLConfig);
    this.requesturlconfig = bconfig.requestURLConfig;
    this.htmlstring = bconfig.htmlString;


    this.containerheight = lconfig.containerHeight;
    this.containerheightreference = lconfig.containerHeightReference || constants.CONTAINER_HEIGHT_BY_FORM_REFERENCE;

    this.enablenativecommunication = bconfig.enableNativeCommunication ? true : false;


    
    this.wType = "Browser";
    this.name = "kony.ui.Browser";

    this.setGetterSetter();
};

kony.inherits(kony.ui.Browser, kony.ui.Widget);

kony.ui.Browser.prototype.setGetterSetter = function() {
    defineGetter(this, "htmlString", function() {
        return this.htmlstring;
    });
    defineSetter(this, "htmlString", function(val) {
        this.htmlstring = val;
        $KW[this.wType]["updateView"](this, "htmlstring", val);
    });

    defineGetter(this, "requestURLConfig", function() {
        return this.requesturlconfig;
    });
    defineSetter(this, "requestURLConfig", function(val) {
        this.requesturlconfig = val;
        this.readconfig(val);
        $KW[this.wType]["updateView"](this, "requesturlconfig", val);
    });
    defineGetter(this, "containerHeight", function() {
        return this.containerheight;
    });

    defineSetter(this, "containerHeight", function(val) {
        this.containerheight = val;
        kony.model.updateView(this, "containerheight", val);
    });

    defineGetter(this, "containerHeightReference", function() {
        return this.containerheightreference;
    });

    defineSetter(this, "containerHeightReference", function(val) {
        this.containerheightreference = val;
        kony.model.updateView(this, "containerheightreference", val);
    });

    defineGetter(this, "enableNativeCommunication", function() {
        return this.enablenativecommunication;
    });

};


kony.ui.Browser.prototype.isCordovaAppsEnabled =
    kony.ui.Browser.prototype.isHtmlPreviewEnabled =
    kony.ui.Browser.prototype.isWebAppDevelopmentEnabled =
    kony.ui.Browser.prototype.loadData =
    kony.ui.Browser.prototype.getHTMLFilesInWebFolder =
    kony.ui.Browser.prototype.canGoBack =
    kony.ui.Browser.prototype.canGoForward =
    kony.ui.Browser.prototype.clearHistory = function() {
        kony.web.logger("warn", "This Browser method is not supported in SPA");
    };

kony.ui.Browser.prototype.evaluateJavaScript = function(jscript) {
    $KW.Browser.evaluateJavaScript(this, jscript);
};

kony.ui.Browser.prototype.evaluateJavaScriptdepri = function(jscript) {
    kony.web.logger("log", "executing javascript in " + this.id + " window handler");
    var scr = document.createElement('script');
    scr.innerHTML = this.id + "Err = null; try{" + jscript + "}catch(e){" + this.id + "Err=e" + "}";
    if($KG["webView" + this.id] && !$KG["webView" + this.id].closed) {
        
        var anchor = document.createElement('a');
        anchor.href = this.url;
        if(window.location.origin != anchor.origin) {
            throw {
                "errorCode": "104",
                "name": "Not supported Error",
                "message": "Not supported Error"
            }
        }
        $KG["webView" + this.id].document.head.appendChild(scr);
        if($KG["webView" + this.id][this.id + "Err"] != null) { 
            throw {
                "errorCode": "106",
                "name": "Unknown Error",
                "message": "Unknown Error"
            }
        }
    } else {
        document.head.appendChild(scr);
        if(window[this.id + "Err"] != null) { 
            throw {
                "errorCode": "106",
                "name": "Unknown Error",
                "message": "Unknown Error"
            }
        }
    }

    return null;
};

kony.ui.Browser.prototype.evaluateJavaScriptAsync = function(jscript) {
    return null;
};

kony.ui.Browser.prototype.setResponse =
kony.ui.Browser.prototype.requestURLConfig = function() {
    kony.web.logger("warn", "This Browser method is not supported in SPA");
};

kony.ui.Browser.prototype.goBack = function() {
    $KW.Browser.goBack(this);
};

kony.ui.Browser.prototype.goForward = function() {
    $KW.Browser.goForward(this);
};

kony.ui.Browser.prototype.reload = function() {
    $KW.Browser.reload(this);
};
