
kony.ui.RichText = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("RichText"));

    kony.ui.RichText.baseConstructor.call(this, bconfig, lconfig, pspconfig);

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

    this.linkskin = bconfig.linkSkin;
    this.linkfocusskin = pspconfig.linkFocusSkin;

    defineGetter(this, "linkSkin", function() {
        return this.linkskin;
    });
    defineSetter(this, "linkSkin", function(val) {
        this.linkskin = val;
        $KW[this.wType]["updateView"](this, "linkskin", val);
    });

    defineGetter(this, "linkFocusSkin", function() {
        return this.linkfocusskin;
    });
    defineSetter(this, "linkFocusSkin", function(val) {
        this.linkfocusskin = val;
        $KW[this.wType]["updateView"](this, "linkfocusskin", val);
    });

    
    this.canUpdateUI = true;
    this.wType = "RichText";
    this.name = "kony.ui.RichText";
};

kony.inherits(kony.ui.RichText, kony.ui.Widget);
