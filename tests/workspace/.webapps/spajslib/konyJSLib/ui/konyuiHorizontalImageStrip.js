
kony.ui.HorizontalImageStrip2 = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("HorizontalImageStrip2"));

    kony.ui.HorizontalImageStrip2.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.imageWhileDownloading = this.imagewhiledownloading = bconfig.imageWhileDownloading;
    this.imageWhenFailed = this.imagewhenfailed = bconfig.imageWhenFailed;
    this.spaceBetweenImages = this.spacebetweenimages = bconfig.spaceBetweenImages;
    this.showArrows = this.showarrows = bconfig.showArrows || false;
    this.showScrollbars = this.showscrollbars = bconfig.showScrollbars || false;
    this.viewtype = bconfig.viewType || constants.HORIZONTAL_IMAGESTRIP_VIEW_TYPE_STRIPVIEW;
    this.referencewidth = lconfig.referenceWidth;
    this.referenceheight = lconfig.referenceHeight;
    this.imagescalemode = lconfig.imageScaleMode;
    this.selectedindex = bconfig.selectedIndex;
    this.selecteditem = null; 

    var arrowConfig = bconfig.arrowConfig || null;
    if(arrowConfig) {
        this.leftarrowimage = arrowConfig.leftArrowImage || "";
        this.rightarrowimage = arrowConfig.rightArrowImage || "";
    }

    
    this.wType = "HStrip";
    this.name = "kony.ui.HorizontalImageStrip2";
    this.canUpdateUI = true; 
    this.onselection = bconfig.onSelection;
    var data = bconfig.data;
    if(data) {
        this.masterdata = data[0];
        this.key = data[1];
    }
    defineGetter(this, "data", function() {
        return data;
    });
    defineSetter(this, "data", function(val) {
        data = val;
        this.canUpdateUI && $KW[this.wType]["updateView"](this, "data", val);
    });

    this.viewconfig = bconfig.viewConfig || null;
    this.scrollbounce = this.viewconfig && this.viewconfig.stripviewConfig && this.viewconfig.stripviewConfig.enableScrollBounce;

    kony.ui.HorizontalImageStrip2.prototype.setGetterSetter.call(this);
};

kony.inherits(kony.ui.HorizontalImageStrip2, kony.ui.Widget);

kony.ui.HorizontalImageStrip2.prototype.setGetterSetter = function() {
    defineGetter(this, "selectedIndex", function() {
        return this.selectedindex;
    });
    defineSetter(this, "selectedIndex", function(val) {
        this.selectedindex = val;
        $KW[this.wType]["updateView"](this, "selectedindex", val);
    });

    defineGetter(this, "selectedItem", function() {
        return this.selecteditem;
    });
    defineSetter(this, "selectedItem", function() {
        
    });

    defineGetter(this, "onSelection", function() {
        return this.onselection;
    });
    defineSetter(this, "onSelection", function(val) {
        this.onselection = val;
    });

    defineGetter(this, "viewType", function() {
        return this.viewtype;
    });
    defineSetter(this, "viewType", function(val) {
        this.viewtype = val;
        $KW[this.wType]["updateView"](this, "viewtype", val);
    });

    defineGetter(this, "viewConfig", function() {
        return this.viewconfig;
    });
    defineSetter(this, "viewConfig", function(val) {
        this.viewconfig = val;
        $KW[this.wType]["updateView"](this, "viewconfig", val);
    });

    defineGetter(this, "referenceWidth", function() {
        return this.referencewidth;
    });
    defineSetter(this, "referenceWidth", function(val) {
        this.referencewidth = val;
        $KW[this.wType]["updateView"](this, "referencewidth", val);
    });

    defineGetter(this, "referenceHeight", function() {
        return this.referenceheight;
    });
    defineSetter(this, "referenceHeight", function(val) {
        this.referenceheight = val;
        $KW[this.wType]["updateView"](this, "referenceheight", val);
    });

    defineGetter(this, "imageScaleMode", function() {
        return this.imagescalemode;
    });
    defineSetter(this, "imageScaleMode", function(val) {
        this.imagescalemode = val;
        $KW[this.wType]["updateView"](this, "imagescalemode", val);
    });
};

kony.ui.HorizontalImageStrip2.prototype.addAll = function(dataarray, key) {
    $KW.HStrip.addAll(this, dataarray, key);
};

kony.ui.HorizontalImageStrip2.prototype.removeAt = function(index) {
    $KW.HStrip.removeAt(this, index);
};

kony.ui.HorizontalImageStrip2.prototype.removeAll = function() {
    $KW.HStrip.removeAll(this);
};

kony.ui.HorizontalImageStrip2.prototype.setData = function(dataarray, key) {
    $KW.HStrip.setData(this, dataarray, key);
};

kony.ui.HorizontalImageStrip2.prototype.setDataAt = function(dataobj, index) {
    $KW.HStrip.setDataAt(this, dataobj, index);
};

kony.ui.HorizontalImageStrip2.prototype.addDataAt = function(dataobj, index) {
    $KW.HStrip.addDataAt(this, dataobj, index);
};

kony.ui.HorizontalImageStrip = function(bconfig, lconfig, pspconfig) {
    kony.ui.HorizontalImageStrip.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    
    this.viewtype = this.view = pspconfig.view || constants.HORIZONTAL_IMAGESTRIP_VIEW_TYPE_STRIPVIEW;
    this.showArrows = this.showarrows = pspconfig.showArrows;
    this.scrollBounce = this.scrollbounce = pspconfig.scrollBounce;
    this.heightWidth = this.heightwidth = pspconfig.heightWidth;
    this.imageWhenFailed = this.imagewhenfailed = pspconfig.imageWhenFailed;
    this.imageWhileDownloading = this.imagewhiledownloading = pspconfig.imageWhileDownloading;
    this.spaceBetweenImages = this.spacebetweenimages = pspconfig.spaceBetweenImages;
    this.name = "kony.ui.HorizontalImageStrip";
    this.focuseditem = null; 
    this.focusedindex = bconfig.focusedIndex || null;
    this.setGetterSetter();
};
kony.inherits(kony.ui.HorizontalImageStrip, kony.ui.HorizontalImageStrip2);

kony.ui.HorizontalImageStrip.prototype.setGetterSetter = function() {
    defineGetter(this, "focusedIndex", function() {
        return this.focusedindex;
    });
    defineSetter(this, "focusedIndex", function(val) {
        this.focusedindex = val;
        $KW[this.wType]["updateView"](this, "focusedindex", val);
    });

    defineGetter(this, "focusedItem", function() {
        return this.focuseditem;
    });
};
