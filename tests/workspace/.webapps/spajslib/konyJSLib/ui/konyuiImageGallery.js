
kony.ui.ImageGallery2 = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("ImageGallery2"));

    kony.ui.ImageGallery2.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.imageWhileDownloading = this.imagewhiledownloading = bconfig.imageWhileDownloading;
    this.imageWhenFailed = this.imagewhenfailed = bconfig.imageWhenFailed;
    this.spaceBetweenImages = this.spacebetweenimages = bconfig.spaceBetweenImages;
    this.selectedindex = bconfig.selectedIndex || null;
    this.onselection = bconfig.onSelection;
    this.referencewidth = lconfig.referenceWidth;
    this.referenceheight = lconfig.referenceHeight;
    this.imagescalemode = lconfig.imageScaleMode;

    
    this.wType = "IGallery";
    this.name = "kony.ui.ImageGallery2";
    this.canUpdateUI = true; 
    this.selecteditem = null; 

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
    kony.ui.ImageGallery2.prototype.setGetterSetter.call(this);
};

kony.inherits(kony.ui.ImageGallery2, kony.ui.Widget);

kony.ui.ImageGallery2.prototype.setGetterSetter = function() {
    defineGetter(this, "selectedIndex", function() {
        return this.selectedindex;
    });
    defineSetter(this, "selectedIndex", function(val) {
        this.selectedindex = val;
        this.canUpdateUI && $KW[this.wType]["updateView"](this, "selectedindex", val);
    });

    defineGetter(this, "onSelection", function() {
        return this.onselection;
    });
    defineSetter(this, "onSelection", function(val) {
        this.onselection = val;
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

    defineGetter(this, "selectedItem", function() {
        return this.selecteditem;
    });
    defineSetter(this, "selectedItem", function() {
        
    });
};

kony.ui.ImageGallery2.prototype.addAll = function(dataarray, key) {
    $KW.IGallery.addAll(this, dataarray, key);
};

kony.ui.ImageGallery2.prototype.setData = function(dataarray, key) {
    $KW.IGallery.setData(this, dataarray, key);
};

kony.ui.ImageGallery2.prototype.setDataAt = function(dataobj, index) {
    $KW.IGallery.setDataAt(this, dataobj, index);
};

kony.ui.ImageGallery2.prototype.addDataAt = function(dataobj, index) {
    $KW.IGallery.addDataAt(this, dataobj, index);
};

kony.ui.ImageGallery2.prototype.removeAt = function(index) {
    $KW.IGallery.removeAt(this, index);
};

kony.ui.ImageGallery2.prototype.removeAll = function() {
    $KW.IGallery.removeAll(this);
};

kony.ui.ImageGallery = function(bconfig, lconfig, pspconfig) {
    kony.ui.ImageGallery.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    
    this.itemsperrow = pspconfig.itemsPerRow;
    this.heightwidth = pspconfig.heightWidth;

    this.name = "kony.ui.ImageGallery";

    this.focuseditem = null; 
    defineGetter(this, "focusedItem", function() {
        return this.focuseditem;
    });

    this.focusedindex = bconfig.focusedIndex || null;
    this.setGetterSetter();
};

kony.ui.ImageGallery.prototype.setGetterSetter = function() {
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
kony.inherits(kony.ui.ImageGallery, kony.ui.ImageGallery2);
