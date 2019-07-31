
kony.ui.Popup = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Popup"));

    kony.ui.Popup.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.wType = "Popup";
    this.name = "kony.ui.Popup";
    this.containerheight = lconfig.containerHeight;
    this.containerheightreference = lconfig.containerHeightReference || constants.CONTAINER_HEIGHT_BY_FORM_REFERENCE;
    var inTrans_ = this.inTransitionConfig || this.intransitionconfig,
        outTrans_ = this.outTransitionConfig || this.outtransitionconfig;

    if(inTrans_)
        this.ptranIn = this.ptran = inTrans_.popupTransition;
    else
        this.ptranIn = this.ptran = "none";

    if(outTrans_)
        this.ptranOut = outTrans_.popupTransition;
    else
        this.ptranOut = "none";

    this.ismodal = bconfig.isModal;
    this.transparencybehindthepopup = bconfig.transparencyBehindThePopup;

    this.setGetterSetter();
};

kony.inherits(kony.ui.Popup, kony.ui.Form2);

kony.ui.Popup.prototype.setGetterSetter = function() {
    defineGetter(this, "isModal", function() {
        return this.ismodal;
    });
    defineSetter(this, "isModal", function(val) {
        this.ismodal = val;
        $KW[this.wType]["updateView"](this, "ismodal", val);
    });

    defineGetter(this, "transparencyBehindThePopup", function() {
        return this.transparencybehindthepopup;
    });
    defineSetter(this, "transparencyBehindThePopup", function(val) {
        this.transparencybehindthepopup = val;
        $KW[this.wType]["updateView"](this, "transparencybehindthepopup", val);
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
};


kony.ui.Popup.prototype.destroy = function() {
    this.onDestroy && this.onDestroy(this);
    $KW.Popup.dismiss(this);
    var widgets = this.widgets();
    for(var i = 0; i < widgets.length; i++) {
        removeAllReferences(widgets[i]);
        if(widgets[i] instanceof _konyConstNS.ContainerWidget)
            delete this[widgets[i].id];
    }
    this.addWidgetsdone = false;
    this.initdone = false;
    this.ownchildrenref = [];
    this.children = [];
};

kony.ui.Popup.prototype.dismiss = function() {
    $KW.Popup.dismiss(this);
};

kony.ui.Popup.prototype.show = function() {

    if(!this.addWidgetsdone) {
        this.addWidgetsdone = true;
        this.addWidgets && this.addWidgets(this);
    }
    !this.initdone && this.init && this.init(this);
    this.initdone = true;
    $KW.Popup.show(this);
};

kony.ui.Popup.prototype.setContext = function(context) {
    $KW.Popup.setcontext(this, context);
};

kony.ui.Popup.prototype.scrollToBeginning = function() {
    $KW.Popup.scrollToBeginning(this);
};

kony.ui.Popup.prototype.scrollToEnd = function() {
    $KW.Popup.scrollToEnd(this);
};

kony.ui.Popup.prototype.scrollToWidget = function(widgetref) {
    $KW.Popup.scrollToWidget(this, widgetref);
};

kony.ui.Popup.prototype.navigateTo =
kony.ui.Popup.prototype.showTitleBar =
kony.ui.Popup.prototype.hideTitleBar =
kony.ui.Popup.prototype.setTitleBarSkin =
kony.ui.Popup.prototype.setTitleBarLeftSideButtonSkin =
kony.ui.Popup.prototype.setTitleBarRightSideButtonSkin = function() {
    kony.web.logger("warn", "This popup API is not supported.");
};
