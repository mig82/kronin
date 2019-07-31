
kony.ui.MenuContainer = function(bconfig, lconfig, pspconfig) {
    kony.ui.MenuContainer.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.viewtype = pspconfig.viewType;
    this.menutemplate = bconfig.menuItemTemplate;
    this.widgetdatamap = bconfig.widgetDataMap || null;
    this.data = bconfig.data || null;
    this.selectedindex = bconfig.selectedMenuIndex || null;
    this.selecteditem = bconfig.selectedMenuItem || null;
    this.activeskin = bconfig.activeSkin || '';
    this.hoverskin = bconfig.hoverSkin || '';
    this.onclick = bconfig.onClick || null;
    this.expandedimage = pspconfig.expandedImage;
    this.collapsedimage = pspconfig.collapsedImage;
    var data = bconfig.data;
    defineGetter(this, "data", function() {
        return data;
    });
    defineSetter(this, "data", function(val) {
        data = val;
        this.canUpdateUI && $KW[this.wType]["updateView"](this, "data", val);
    });

    var orientation = pspconfig.orientation;
    defineGetter(this, "orientation", function() {
        return orientation;
    });
    defineSetter(this, "orientation", function(val) {
        var oldvalue = orientation;
        orientation = val;
        $KW[this.wType]["updateView"](this, "orientation", val, oldvalue);
    });

    var info = bconfig.info || null;
    defineGetter(this, "info", function() {
        return info;
    });
    defineSetter(this, "info", function(val) {
        var oldvalue = info;
        info = val;
        $KW[this.wType]["updateView"](this, "info", val, oldvalue);
    });

    this.setGetterSetter();

    
    this.wType = "MenuContainer";
    this.name = "kony.ui.MenuContainer";
    this.canUpdateUI = true;
};

kony.inherits(kony.ui.MenuContainer, kony.ui.Widget);

kony.ui.MenuContainer.prototype.setGetterSetter = function() {
    defineGetter(this, "viewType", function() {
        return this.viewtype;
    });
    defineSetter(this, "viewType", function(val) {
        var oldvalue = this.viewtype;
        this.viewtype = val;
        $KW[this.wType]["updateView"](this, "viewtype", val, oldvalue);
    });

    defineGetter(this, "menuItemTemplate", function() {
        return this.menutemplate;
    });
    defineSetter(this, "menuItemTemplate", function(val) {
        var oldvalue = this.menutemplate;
        this.menutemplate = val;
        $KW[this.wType]["updateView"](this, "menutemplate", val, oldvalue);
    });

    defineGetter(this, "widgetDataMap", function() {
        return this.widgetdatamap;
    });
    defineSetter(this, "widgetDataMap", function(val) {
        var oldvalue = this.widgetdatamap;
        this.widgetdatamap = val;
    });

    defineGetter(this, "selectedMenuIndex", function() {
        return this.selectedindex;
    });
    defineSetter(this, "selectedMenuIndex", function(val) {
        var oldvalue = this.selectedindex;
        this.selectedindex = val;
        $KW[this.wType]["updateView"](this, "selectedindex", val, oldvalue);
    });

    defineGetter(this, "selectedMenuItem", function() {
        return this.selecteditem;
    });

    defineGetter(this, "onClick", function() {
        return this.onclick;
    });
    defineSetter(this, "onClick", function(val) {
        this.onclick = val;
    });

    defineGetter(this, "activeSkin", function() {
        return this.activeskin;
    });
    defineSetter(this, "activeSkin", function(val) {
        var oldvalue = this.activeskin;
        this.activeskin = val;
        $KW[this.wType]["updateView"](this, "activeskin", val, oldvalue);
    });

    defineGetter(this, "hoverSkin", function() {
        return this.hoverskin;
    });
    defineSetter(this, "hoverSkin", function(val) {
        var oldvalue = this.hoverskin;
        this.hoverskin = val;
        $KW[this.wType]["updateView"](this, "hoverskin", val, oldvalue);
    });
};



kony.ui.MenuContainer.prototype.setData = function(dataArray) {
    $KW.MenuContainer.setData(this, dataArray);
};

kony.ui.MenuContainer.prototype.setDataAt = function(dataObj, index) {
    $KW.MenuContainer.setDataAt(this, dataObj, index);
};

kony.ui.MenuContainer.prototype.addAll = function(dataArray) {
    $KW.MenuContainer.addAll(this, dataArray);
};

kony.ui.MenuContainer.prototype.addDataAt = function(dataObj, index) {
    $KW.MenuContainer.addDataAt(this, dataObj, index);
};

kony.ui.MenuContainer.prototype.removeAll = function() {
    $KW.MenuContainer.removeAll(this);
};

kony.ui.MenuContainer.prototype.removeAt = function(index) {
    $KW.MenuContainer.removeAt(this, index);
};
