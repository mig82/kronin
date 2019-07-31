
kony.ui.Slider = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Slider"));

    kony.ui.Slider.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.min = bconfig.min;
    this.max = bconfig.max;
    this.step = bconfig.step;

    this.onslide = bconfig.onSlide;
    this.onselection = bconfig.onSelection;
    this.leftskin = bconfig.leftSkin;
    this.rightskin = bconfig.rightSkin;
    this.thumbimage = bconfig.thumbImage;
    this.focusthumbimage = bconfig.focusThumbImage;
    if(bconfig.selectedValue == "undefined" || bconfig.selectedValue == null) {
        this.selectedvalue = Math.abs((bconfig.min + (bconfig.min - bconfig.max) / 2))
    } else {
        this.selectedvalue = bconfig.selectedValue;
    }


    this.widgetalignment = lconfig.widgetAlignment;
    var margin = (!lconfig.margin) ? [0, 0, 0, 0] : lconfig.margin;
    this.margin = margin;

    this.minlabel = pspconfig.minLabel;
    this.maxlabel = pspconfig.maxLabel;
    this.minlabelskin = pspconfig.minLabelSkin;
    this.maxlabelskin = pspconfig.maxLabelSkin;
    this.thickness = pspconfig.thickness;
    this.orientation = "horizontal";
    
    this.wType = "Slider";
    this.name = "kony.ui.Slider";

    this.setGetterSetter();
};

kony.inherits(kony.ui.Slider, kony.ui.Widget);

kony.ui.Slider.prototype.setGetterSetter = function() {
    defineGetter(this, "selectedValue", function() {
        return this.selectedvalue;
    });
    defineSetter(this, "selectedValue", function(val) {
        this.selectedvalue = val;
        $KW[this.wType]["updateView"](this, "selectedvalue", val);
    });

    defineGetter(this, "focusThumbImage", function() {
        if($KU.isIOS7) return null;
        return this.focusthumbimage;
    });
    defineSetter(this, "focusThumbImage", function(val) {
        if($KU.isIOS7) return;
        this.focusthumbimage = val;
        $KW[this.wType]["updateView"](this, "focusthumbimage", val);
    });

    defineGetter(this, "thumbImage", function() {
        if($KU.isIOS7) return null;
        return this.thumbimage;
    });
    defineSetter(this, "thumbImage", function(val) {
        if($KU.isIOS7) return;
        this.thumbimage = val;
        $KW[this.wType]["updateView"](this, "thumbimage", val);
    });

    defineGetter(this, "rightSkin", function() {
        return this.rightskin;
    });
    defineSetter(this, "rightSkin", function(val) {
        
        $KW[this.wType]["updateView"](this, "rightskin", val, this.rightskin);
    });

    defineGetter(this, "leftSkin", function() {
        return this.leftskin;
    });
    defineSetter(this, "leftSkin", function(val) {
        $KW[this.wType]["updateView"](this, "leftskin", val, this.leftskin);
        
    });

    defineGetter(this, "minLabel", function() {
        return this.minlabel;
    });
    defineSetter(this, "minLabel", function(val) {
        
        $KW[this.wType]["updateView"](this, "minlabel", val, this.minlabel);
    });

    defineGetter(this, "maxLabel", function() {
        return this.maxlabel;
    });
    defineSetter(this, "maxLabel", function(val) {
        
        $KW[this.wType]["updateView"](this, "maxlabel", val, this.maxlabel);
    });

    defineGetter(this, "maxLabelSkin", function() {
        return this.maxlabelskin;
    });
    defineSetter(this, "maxLabelSkin", function(val) {
        
        $KW[this.wType]["updateView"](this, "maxlabelskin", val, this.maxlabelskin);
    });

    defineGetter(this, "minLabelSkin", function() {
        return this.minlabelskin;
    });
    defineSetter(this, "minLabelSkin", function(val) {
        
        $KW[this.wType]["updateView"](this, "minlabelskin", val, this.minlabelskin);
    });

    defineGetter(this, "onSelection", function() {
        return this.onselection;
    });
    defineSetter(this, "onSelection", function(val) {
        this.onselection = val;
    });

    defineGetter(this, "onSlide", function() {
        return this.onslide;
    });
    defineSetter(this, "onSlide", function(val) {
        this.onslide = val;
    });
};
