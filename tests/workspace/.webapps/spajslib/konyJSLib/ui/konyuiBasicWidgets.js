
kony.ui.Button = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Button"));

    kony.ui.Button.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.displaytext = (lconfig.displayText === undefined) ? true : (lconfig.displayText && true);
    this.rawBytes = bconfig.rawBytes; 

    
    this.canUpdateUI = true;
    this.wType = "Button";
    this.name = "kony.ui.Button"

    this._text = bconfig.text || "";
    defineGetter(this, "text", function() {
        return this._text;
    });
    defineSetter(this, "text", function(val) {
        var oldvalue = this._text;
        this._text = val;
        if(this.canUpdateUI) {
            
            this.i18n_text = "";
            $KW[this.wType]["updateView"](this, "text", val);
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
        }
    });
};

kony.inherits(kony.ui.Button, kony.ui.Widget);


kony.ui.Label = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Label"));

    kony.ui.Label.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    
    this.canUpdateUI = true;
    this.wType = "Label";
    this.name = "kony.ui.Label";

    this._text = bconfig.text || "";
    defineGetter(this, "text", function() {
        return this._text;
    });
    defineSetter(this, "text", function(val) {
        var oldvalue = this._text;
        this._text = val;
        if(this.canUpdateUI) {
            
            this.i18n_text = "";
            $KW[this.wType]["updateView"](this, "text", val);
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
        }
    });

    var textCopyable = pspconfig.textCopyable;
    defineGetter(this, "textCopyable", function() {
        return textCopyable;
    });
    defineSetter(this, "textCopyable", function(val) {
        textCopyable = val;
        $KW[this.wType]["updateView"](this, "textCopyable", val);
    });

    
    this.linespacing = bconfig.lineSpacing;
    defineGetter(this, "lineSpacing", function() {
        return this.linespacing;
    });
    defineSetter(this, "lineSpacing", function(val) {
        this.linespacing = val;
        $KW[this.wType]["updateView"](this, "linespacing", val);
    });
};

kony.inherits(kony.ui.Label, kony.ui.Widget);



kony.ui.Line = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Line"));

    kony.ui.Line.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    
    this.wType = "Line";
    this.name = "kony.ui.Line";

    var thickness = lconfig.thickness;
    defineGetter(this, "thickness", function() {
        return thickness;
    });
    defineSetter(this, "thickness", function(val) {
        thickness = val;
        $KW[this.wType]["updateView"](this, "thickness", val);
    });


};

kony.inherits(kony.ui.Line, kony.ui.Widget);


kony.ui.Link = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Link"));

    kony.ui.Link.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    
    this.canUpdateUI = true;
    this.wType = "Link";
    this.name = "kony.ui.Link";

    this._text = bconfig.text || "";
    defineGetter(this, "text", function() {
        return this._text;
    });
    defineSetter(this, "text", function(val) {
        var oldvalue = this._text;
        this._text = val;
        if(this.canUpdateUI) {
            
            this.i18n_text = "";
            $KW[this.wType]["updateView"](this, "text", val);
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
        }
    });
};

kony.inherits(kony.ui.Link, kony.ui.Widget);



kony.ui.Switch = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Switch"));

    kony.ui.Switch.baseConstructor.call(this, bconfig, lconfig, pspconfig);
    this.skin = bconfig.skin; 
    this.leftsidetext = bconfig.leftSideText || "";
    this.rightsidetext = bconfig.rightSideText || "";
    bconfig.i18n_rightSideText && (this.i18n_rightsidetext = bconfig.i18n_rightSideText);
    bconfig.i18n_leftSideText && (this.i18n_leftsidetext = bconfig.i18n_leftSideText);

    
    this.wType = "Switch";
    this.name = "kony.ui.Switch";

    this.onslide = bconfig.onSlide || null;
    this.selectedindex = (bconfig.selectedIndex == IndexJL) ? IndexJL : IndexJL + 1;

    this.thumbwidth = bconfig.thumbWidth || "";
    this.thumbheight = bconfig.thumbHeight || "";
    this.trackwidth = bconfig.trackWidth || "";
    this.trackheight = bconfig.trackHeight || "";
    this.thumbtext = bconfig.thumbText || "";
    this.thumbskin = bconfig.thumbSkin;

    this.setGetterSetter();
};

kony.inherits(kony.ui.Switch, kony.ui.Widget);

kony.ui.Switch.prototype.setGetterSetter = function() {
    defineGetter(this, "leftSideText", function() {
        return this.leftsidetext;
    });
    defineSetter(this, "leftSideText", function(val) {
        var oldvalue = this.leftsidetext;
        this.leftsidetext = val;
        if(this.canUpdateUI) {
            
            this.i18n_leftSideText = "";
            $KW[this.wType]["updateView"](this, "leftsidetext", val);
        }
    });

    defineGetter(this, "rightSideText", function() {
        return this.rightsidetext;
    });
    defineSetter(this, "rightSideText", function(val) {
        var oldvalue = this.rightsidetext;
        if(oldvalue != val) {
            this.rightsidetext = val;
            if(this.canUpdateUI) {
                
                this.i18n_rightSideText = "";
                $KW[this.wType]["updateView"](this, "rightsidetext", val);
            }
        }
    });

    defineGetter(this, "onSlide", function() {
        return this.onslide;
    });
    defineSetter(this, "onSlide", function(val) {
        this.onslide = val;
    });

    defineGetter(this, "selectedIndex", function() {
        return this.selectedindex;
    });
    defineSetter(this, "selectedIndex", function(val) {
        var oldvalue = this.selectedindex;
        if(oldvalue != val) {
            this.selectedindex = val;
            $KW[this.wType]["updateView"](this, "selectedindex", val, oldvalue);
        }
    });

    defineGetter(this, "thumbWidth", function() {
        return this.thumbwidth;
    });
    defineSetter(this, "thumbWidth", function(val) {
        var oldvalue = this.thumbwidth;
        if(oldvalue != val) {
            this.thumbwidth = val;
            if(this.canUpdateUI) {
                $KW[this.wType]["updateView"](this, "thumbwidth", val);
            }
        }
    });

    defineGetter(this, "thumbHeight", function() {
        return this.thumbheight;
    });
    defineSetter(this, "thumbHeight", function(val) {
        var oldvalue = this.thumbheight;
        if(oldvalue != val) {
            this.thumbheight = val;
            if(this.canUpdateUI) {
                $KW[this.wType]["updateView"](this, "thumbheight", val);
            }
        }
    });

    defineGetter(this, "trackHeight", function() {
        return this.trackheight;
    });
    defineSetter(this, "trackHeight", function(val) {
        var oldvalue = this.trackheight;
        if(oldvalue != val) {
            this.trackheight = val;
            if(this.canUpdateUI) {
                $KW[this.wType]["updateView"](this, "trackheight", val);
            }
        }
    });

    defineGetter(this, "trackWidth", function() {
        return this.trackwidth;
    });
    defineSetter(this, "trackWidth", function(val) {
        var oldvalue = this.trackwidth;
        if(oldvalue != val) {
            this.trackwidth = val;
            if(this.canUpdateUI) {
                $KW[this.wType]["updateView"](this, "trackwidth", val);
            }
        }
    });

    defineGetter(this, "thumbText", function() {
        return this.thumbtext;
    });
    defineSetter(this, "thumbText", function(val) {
        var oldvalue = this.thumbtext;
        if(oldvalue != val) {
            this.thumbtext = val;
            if(this.canUpdateUI) {
                $KW[this.wType]["updateView"](this, "thumbtext", val);
            }
        }
    });

    defineGetter(this, "thumbSkin", function() {
        return this.thumbskin;
    });
    defineSetter(this, "thumbSkin", function(val) {
        var oldvalue = this.thumbskin;
        if(oldvalue != val) {
            this.thumbskin = val;
            if(this.canUpdateUI) {
                $KW[this.wType]["updateView"](this, "thumbskin", val, oldvalue);
            }
        }
    });

};


kony.ui.Phone = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Phone"));

    kony.ui.Phone.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    
    this.canUpdateUI = true;
    this.wType = "Phone";
    this.name = "kony.ui.Phone";

    this._text = bconfig.text || "";
    defineGetter(this, "text", function() {
        return this._text;
    });
    defineSetter(this, "text", function(val) {
        var oldvalue = this._text;
        this._text = val;
        if(this.canUpdateUI) {
            
            this.i18n_text = "";
            $KW[this.wType]["updateView"](this, "text", val);
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
        }
    });
};

kony.inherits(kony.ui.Phone, kony.ui.Widget);


kony.ui.CustomWidget = function(bconfig, lconfig, pspconfig) {
    kony.ui.CustomWidget.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    var defineGettersAndSetters = function(instance, property, pspconfig) {
        defineGetter(instance, property, function() {
            
            return pspconfig[property];
        });
        defineSetter(instance, property, function(value) {
            var oldVal = pspconfig[property];
            pspconfig[property] = value;
            
            var nsArr = pspconfig.widgetName.split('.'),
                namespace = window;
            for(var j = 0; j < nsArr.length; j++) {
                namespace = namespace[nsArr[j]];
            }
            namespace["modelChange"](instance, property, pspconfig[property]);
        });
    };

    
    this.wType = "TPW";
    for(var k in pspconfig) {
        defineGettersAndSetters(this, k, pspconfig);
    }

};

kony.inherits(kony.ui.CustomWidget, kony.ui.Widget);



kony.ui.Alert = function(param1, param2, param3) {
    $KU.logExecuting('kony.ui.Alert');
    $KU.logExecutingWithParams('kony.ui.Alert', param1, param2, param3);
    $KU.logExecutingFinished('kony.ui.Alert');
    $KI.window.alert(param1, param2, param3);
};