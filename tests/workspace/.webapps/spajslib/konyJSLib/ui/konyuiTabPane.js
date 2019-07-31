
kony.ui.TabPane = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("TabPane"));

    kony.ui.TabPane.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    
    this.wType = "TabPane";
    this.name = "kony.ui.TabPane";
    this.screenLevelWidget = bconfig.screenLevelWidget || false;
    this.isMaster = true; 
    this.activeskin = bconfig.activeSkin;
    this.activefocusskin = bconfig.activeFocusSkin;
    this.inactiveskin = bconfig.inactiveSkin;
    this.viewtype = bconfig.viewType; 
    this.viewconfig = bconfig.viewConfig; 
    if(bconfig.viewConfig && bconfig.viewConfig.collapsibleViewConfig) {
        this.viewconfig.collapsibleviewconfig = this.viewconfig.collapsibleViewConfig;
        this.viewconfig.collapsibleviewconfig.onclick = this.viewconfig.collapsibleviewconfig.onClick;
        this.viewconfig.collapsibleviewconfig.expandedimage = this.viewconfig.collapsibleviewconfig.expandedImage;
        this.viewconfig.collapsibleviewconfig.collapsedimage = this.viewconfig.collapsibleviewconfig.collapsedImage;
        this.viewconfig.collapsibleviewconfig.imageposition = this.viewconfig.collapsibleviewconfig.imagePosition;
        this.viewconfig.collapsibleviewconfig.tabnamealignment = this.viewconfig.collapsibleviewconfig.tabNameAlignment;
        this.viewconfig.collapsibleviewconfig.toggletabs = this.viewconfig.collapsibleviewconfig.toggleTabs;
    }
    this.ontabclick = bconfig.onTabClick;
    this.retainpositionintab = bconfig.retainPositionInTab; 
    this.needpageindicator = bconfig.needPageIndicator;
    this.selectedtabindex = bconfig.selectedTabIndex;

    this.containerheight = lconfig.containerHeight;
    this.containerheightreference = lconfig.containerHeightReference || constants.CONTAINER_HEIGHT_BY_FORM_REFERENCE;
    if(bconfig.viewConfig && bconfig.viewConfig.collapsibleViewConfig) {
        var configparams = bconfig.viewConfig.collapsibleViewConfig;
        
        this.collapsedimage = configparams.expandedImage;
        this.expandedimage = configparams.collapsedImage;
        this.toggletabs = configparams.toggleTabs;
        this.imageposition = configparams.imagePosition;
        this.tabnamealignment = configparams.tabNameAlignment;
    }
    if(bconfig.viewConfig && bconfig.viewConfig.pageViewConfig) {
        var pvconfigparams = bconfig.viewConfig.pageViewConfig;
        this.pageondotimage = pvconfigparams.pageOnDotImage;
        this.pageoffdotimage = pvconfigparams.pageOffDotImage;
        this.needpageindicator = pvconfigparams.needPageIndicator;
    }

    this.activetabs = bconfig.activeTabs;
    if((this.viewtype == constants.TABPANE_VIEW_TYPE_TABVIEW || this.viewtype == constants.TABPANE_VIEW_TYPE_PAGEVIEW) && (!this.activetabs || (this.activetabs && this.activetabs.length == 0))) {
        this.activetabs = [0];
        this.activetab = 0;
    }
    if(this.activetabs && this.activetabs.length > 0)
        this.activetab = this.activetabs[0];

    this.setGetterSetter();
};

kony.inherits(kony.ui.TabPane, kony.ui.ContainerWidget);

kony.ui.TabPane.prototype.setGetterSetter = function() {
    defineGetter(this, "activeSkin", function() {
        return this.activeskin;
    });
    defineSetter(this, "activeSkin", function(val) {
        var oldval = this.activeskin;
        this.activeskin = val;
        $KW[this.wType]["updateView"](this, "activeskin", val, oldval);
    });

    defineGetter(this, "activeFocusSkin", function() {
        return this.activefocusskin;
    });
    defineSetter(this, "activeFocusSkin", function(val) {
        var oldval = this.activefocusskin;
        this.activefocusskin = val;
        kony.model.updateView(this, "activefocusskin", val, oldval);
    });

    defineGetter(this, "inactiveSkin", function() {
        return this.inactiveskin;
    });
    defineSetter(this, "inactiveSkin", function(val) {
        var oldval = this.inactiveskin;
        this.inactiveskin = val;
        $KW[this.wType]["updateView"](this, "inactiveskin", val, oldval);
    });

    defineGetter(this, "viewType", function() {
        return this.viewtype;
    });
    defineSetter(this, "viewType", function(val) {
        this.viewtype = val;
        if((this.viewtype == constants.TABPANE_VIEW_TYPE_TABVIEW || this.viewtype == constants.TABPANE_VIEW_TYPE_PAGEVIEW) && (!this.activetabs || (this.activetabs && this.activetabs.length == 0))) {
            this.activetabs = [0];
            this.activetab = 0;
        }
        if(this.activetabs && this.activetabs.length > 0)
            this.activetab = this.activetabs[0];
        $KW[this.wType]["updateView"](this, "viewtype", val);
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

    defineGetter(this, "viewConfig", function() {
        return this.viewconfig;
    });
    defineSetter(this, "viewConfig", function(val) {
        this.viewconfig = val;
        this.viewconfig.collapsibleviewconfig = this.viewconfig.collapsibleViewConfig;
        this.viewconfig.collapsibleviewconfig.onclick = this.viewconfig.collapsibleviewconfig.onClick;
        this.expandedimage = this.viewconfig.collapsibleviewconfig.expandedimage = this.viewconfig.collapsibleviewconfig.expandedImage;
        this.collapsedimage = this.viewconfig.collapsibleviewconfig.collapsedimage = this.viewconfig.collapsibleviewconfig.collapsedImage;
        this.imageposition = this.viewconfig.collapsibleviewconfig.imageposition = this.viewconfig.collapsibleviewconfig.imagePosition;
        this.tabnamealignment = this.viewconfig.collapsibleviewconfig.tabnamealignment = this.viewconfig.collapsibleviewconfig.tabNameAlignment;
        this.toggletabs = this.viewconfig.collapsibleviewconfig.toggletabs = this.viewconfig.collapsibleviewconfig.toggleTabs;
        $KW[this.wType]["updateView"](this, "viewconfig", val);
    });

    defineGetter(this, "onTabClick", function() {
        return this.ontabclick;
    });
    defineSetter(this, "onTabClick", function(val) {
        this.ontabclick = val;
        $KW[this.wType]["updateView"](this, "ontabclick", val);
    });

    defineGetter(this, "retainPositionInTab", function() {
        return this.retainpositionintab;
    });
    defineSetter(this, "retainPositionInTab", function(val) {
        this.retainpositionintab = val;
        $KW[this.wType]["updateView"](this, "retainpositionintab", val);
    });

    defineGetter(this, "needPageIndicator", function() {
        return this.needpageindicator;
    });
    defineSetter(this, "needPageIndicator", function(val) {
        this.needpageindicator = val;
        $KW[this.wType]["updateView"](this, "needpageindicator", val);
    });

    defineGetter(this, "selectedTabIndex", function() {
        return this.selectedtabindex;
    });
    defineSetter(this, "selectedTabIndex", function(val) {
        this.selectedtabindex = val;
        $KW[this.wType]["updateView"](this, "selectedtabindex", val);
    });

    defineGetter(this, "activeTabs", function() {
        return this.activetabs;
    });
    defineSetter(this, "activeTabs", function(val) {
        this.activetabs = val;
        if((this.viewtype == constants.TABPANE_VIEW_TYPE_TABVIEW || this.viewtype == constants.TABPANE_VIEW_TYPE_PAGEVIEW) && (!val || (val && val.length == 0))) {
            this.activetabs = [0];
            this.activetab = 0;
        }
        if(this.activetabs && this.activetabs.length > 0)
            this.activetab = this.activetabs[0];
        $KW[this.wType]["updateView"](this, "activetabs", val);
    });

    defineGetter(this, "activeTab", function() {
        return this.activetabs[0];
    });
    defineSetter(this, "activeTab", function(val) {
        this.activetabs[0] = val;
        $KW[this.wType]["updateView"](this, "activetab", val);
    });
};


kony.ui.TabPane.prototype.addTab = function(tabId, tabName, tabImage, box, masterDataLoad) {
    var widgetref = box;
    widgetref.id = tabId;
    widgetref.tabname = tabName;
    widgetref.image = tabImage;
    widgetref.oninit = masterDataLoad;
    this.allboxes = [];
    widgetref.name = "kony.ui.Tab";

    var addChild = "true";
    if(addChild == "true") {
        kony.ui.ContainerWidget.prototype.add.call(this, [widgetref]);
    }

    kony.ui.Form2.prototype.createFormLevelHierarchy.call(this, [widgetref]);
    
    if($KG.allforms[this.pf]) {
        kony.ui.Form2.prototype.createFormLevelHierarchy.call($KG.allforms[this.pf], [widgetref]);
    }
    kony.ui.ContainerWidget.prototype.createhierarchy.call(this, widgetref.ownchildrenref);
    $KW.TabPane.addChildTab(this, widgetref);
    $KU.checkAndReCalculateTopFlexModal(this);
};

kony.ui.TabPane.prototype.addTabAt = function(tabId, tabName, tabImage, box, index) {
    var widgetref = box;
    widgetref.id = tabId;
    widgetref.tabname = tabName;
    widgetref.image = tabImage;
    this.allboxes = [];
    widgetref.name = "kony.ui.Tab";

    var addChildAt = "true";

    if(addChildAt == "true") {
        kony.ui.ContainerWidget.prototype.addAt.call(this, widgetref, index);
    }

    kony.ui.Form2.prototype.createFormLevelHierarchy.call(this, [widgetref]);
    
    if($KG.allforms[this.pf]) {
        kony.ui.Form2.prototype.createFormLevelHierarchy.call($KG.allforms[this.pf], [widgetref]);
    }
    kony.ui.ContainerWidget.prototype.createhierarchy.call(this, widgetref.ownchildrenref);
    $KW.TabPane.addChildTabAt(this, widgetref, index);
    $KU.checkAndReCalculateTopFlexModal(this);
};

kony.ui.TabPane.prototype.removeTabAt = function(index) {
    $KW.TabPane.removeTabAt(this, index);
    $KU.checkAndReCalculateTopFlexModal(this);
};

kony.ui.TabPane.prototype.removeTabById = function(tabId) {
    $KW.TabPane.removeTabById(this, tabId);
    $KU.checkAndReCalculateTopFlexModal(this);
};

kony.ui.TabPane.prototype.setTabName = function(tabId, tabName) {
    $KW.TabPane.setTabName(this, tabId, tabName);
};

kony.ui.TabPane.prototype.setTabImage = function(tabId, tabImage) {
    $KW.TabPane.setTabImage(this, tabId, tabImage);
};
