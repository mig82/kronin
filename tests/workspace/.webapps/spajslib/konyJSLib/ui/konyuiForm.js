
kony.ui.Form2 = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Form2"));

    this.layouttype = bconfig.layoutType || lconfig.layoutType || kony.flex.VBOX_LAYOUT;
    if(this.layouttype == kony.flex.VBOX_LAYOUT || this.layouttype == constants.CONTAINER_LAYOUT_GRID)
        kony.ui.Form2.baseConstructor.call(this, bconfig, lconfig, pspconfig);
    else {
        kony.ui.FlexScrollContainer.call(this, bconfig, lconfig, pspconfig);
        $KU.extend(Object.getPrototypeOf ? Object.getPrototypeOf(this) : this.constructor.prototype, kony.ui.FlexScrollContainer.prototype);
    }

    this.type = bconfig.type; 
    this.needAppMenu = this.needappmenu = bconfig.needAppMenu === undefined ? true : (bconfig.needAppMenu && true);
    this.enabledForIdleTimeout = this.enabledforidletimeout = bconfig.enabledForIdleTimeout || pspconfig.enabledForIdleTimeout || false;
    bconfig.i18n_title && (this.i18n_title = bconfig.i18n_title);
    this.headers = bconfig.headers && bconfig.headers.splice(0);
    this.footers = bconfig.footers && bconfig.footers.splice(0);
    this.addWidgets = bconfig.addWidgets;
    this.onDestroy = bconfig.onDestroy;
    this.init = bconfig.init;
    this.preshow = bconfig.preShow;
    this.postshow = bconfig.postShow;
    this.onhide = bconfig.onHide || pspconfig.onHide;
    this.onorientationchange = bconfig.onOrientationChange;
    this.preorientationchange = bconfig.preOrientationChange;

    defineGetter(this, "layoutType", function() {
        return this.layouttype;
    });

    this.addWidgetsEventWidgetsList = [];
    this.initEventWidgetsList = [];
    this.displayOrientation = lconfig.displayOrientation || constants.FORM_DISPLAY_ORIENTATION_BOTH; 
    this.resetFocusToTop = pspconfig.resetFocusToTop;
    this.useTransform = pspconfig.useTransform;
    this.retainScrollPosition = this.retainscrollposition = pspconfig.retainScrollPosition || false;
    this.dockableAppmenu = this.dockableappmenu = pspconfig.dockableAppmenu;
    this.dockableHeader = this.dockableheader = pspconfig.dockableHeader;
    this.dockableFooter = this.dockablefooter = pspconfig.dockableFooter;
    this.intransitionconfig = pspconfig.inTransitionConfig;
    this.outtransitionconfig = pspconfig.outTransitionConfig;
    this._konyControllerName = bconfig._konyControllerName;

    this.allboxes = [];
    this.wType = "Form";
    this.addWidgetsdone = this.initdone = false;
    if(!this.addWidgets) {
        this.addWidgetsdone = true;
    }
    this.name = "kony.ui.Form2";
    $KG.allforms[this.id] = this;

    defineGetter(this, "layoutType", function() {
        return this.layouttype;
    });

    var title = bconfig.title;
    defineGetter(this, "title", function() {
        if(this.i18n_title && this.i18n_title.toLowerCase().indexOf("i18n.getlocalizedstring") != -1) {
            return $KU.getI18NValue(this.i18n_title);
        } else
            return title;
    });
    defineSetter(this, "title", function(val) {
        var oldvalue = title;
        title = val;
        if(this.canUpdateUI) {
            
            this.i18n_title = "";
            $KW[this.wType]["updateView"](this, "title", val);

        }
    });


    kony.ui.Form2.prototype.setGetterSetter();

    this.headers && this.commonHeaderFooterSetup("headers");
    this.footers && this.commonHeaderFooterSetup("footers");
    var addWidgets = bconfig.addWidgets;
    defineGetter(this, "addWidgets", function() {
        return addWidgets;
    });
    defineSetter(this, "addWidgets", function(val) {
        addWidgets = val;
        this.addWidgetsdone = false;

    });

    this.formgetter = function() {
        var id = bconfig.id;
        var that = this;
        if(!this._konyControllerName) {
            defineGetter(window, id, function() {
                if(!that.addWidgetsdone) {
                    that.addWidgetsdone = true;
                    that.ownchildrenref = [];
                    that.children = [];
                    that.addWidgets && that.addWidgets(that);
                    
                    $KU.widgets.invokeAddWidgetsEventForInternalWidgets(that.addWidgetsEventWidgetsList);
                }
                return that;
            });
        } else {
            if(!that.addWidgetsdone) {
                that.addWidgetsdone = true;
                that.ownchildrenref = [];
                that.children = [];
                that.addWidgets && that.addWidgets(that);
                
                $KU.widgets.invokeAddWidgetsEventForInternalWidgets(that.addWidgetsEventWidgetsList);
            }
            return that;
        }

    };

    this.formsetter = function() {
        var id = bconfig.id;
        var that = this;
        defineSetter(window, id, function() {
            return that;
        });
    };
    this.formgetter();
    if(!this._konyControllerName) {
        this.formsetter();
    }

    this.ondeviceback = pspconfig.onDeviceBack;
    defineGetter(this, "onDeviceBack", function() {
        return this.ondeviceback;
    });

    defineSetter(this, "onDeviceBack", function(val) {
        this.ondeviceback = val;
    });

    Object.defineProperty(this, "topLayerFCModal", {
        configurable: true,
        enumerable: false,
        get: function() {
            return this._topLayerFCModal;
        },
        set: function(val) {
            this._topLayerFCModal = val;
        }
    });
};

kony.inherits(kony.ui.Form2, kony.ui.ContainerWidget);

kony.ui.Form2.prototype.add = function() {
    var widgetarray = [].slice.call(arguments);
    formWidgetExtendAdd.call(this, widgetarray);
    $KU.checkAndReCalculateTopFlexModal(this, this);
};

kony.ui.Form2.prototype.addAt = function(widgetref, index) {
    formWidgetExtendAddAt.call(this, widgetref, index);
    $KU.checkAndReCalculateTopFlexModal(this, this);
};

kony.ui.Form2.prototype.destroy = function() {
    this._destroy({"isMVC": false});
};

kony.ui.Form2.prototype._destroy = function(destroyparam) {
    if($KG["__currentForm"].id === this.id) {
        kony.web.logger("warn", "Current form destroy can not be done");
        return;
    }
    var widgets = this.widgets();
    for(var i = 0; i < widgets.length; i++) {
        removeAllReferences(widgets[i]);
        if(widgets[i] instanceof _konyConstNS.ContainerWidget) {
            widgets[i] = $KW.Utils.getActualWidgetModel(widgets[i]);
            if(widgets[i].wType === "FlexContainer")
                widgets[i].destroy();
            delete this[widgets[i].id];
        }
    }
    this.onDestroy && this.onDestroy(this);
    this.addWidgetsdone = false;
    this.initdone = false;
    this.ownchildrenref = [];
    this.children = [];
    if(destroyparam.isMVC) delete $KG.allforms[this.id];
};

kony.ui.Form2.prototype.remove = function(widgetref) {
    formWidgetExtendRemove.call(this, widgetref);
    $KU.checkAndReCalculateTopFlexModal(this, this);
};

kony.ui.Form2.prototype.removeAt = function(index) {
    var removedWidget = formWidgetExtendRemoveAt.call(this, index);

    $KU.checkAndReCalculateTopFlexModal(this, this);
    return removedWidget;
};

kony.ui.Form2.prototype.removeAll = function() {
    formWidgetExtendRemoveAll.call(this);
    $KU.checkAndReCalculateTopFlexModal(this, this);
};

kony.ui.Form2.prototype.show = function() {
    if(!this._konyControllerName) {
        this._show();
    } else {
        throw new Error("this API is not applicable on Form " + this.id);
    }
};

kony.ui.Form2.prototype.closeNavigationDrawer =
    kony.ui.Form2.prototype.openNavigationDrawer =
    kony.ui.Form2.prototype.setBackgroundImageForNavbar =
    kony.ui.Form2.prototype.setLeftBarButtonItems =
    kony.ui.Form2.prototype.setRightBarButtonItems =
    kony.ui.Form2.prototype.setTitleVerticalPositionAdjustment =
    kony.ui.Form2.prototype.hideTitleBar =
    kony.ui.Form2.prototype.replaceAt =
    kony.ui.Form2.prototype.setTitleBarLeftSideButtonSkin =
    kony.ui.Form2.prototype.setTitleBarRightSideButtonSkin =
    kony.ui.Form2.prototype.setPreviewActionItems =
    kony.ui.Form2.prototype.setZoomScale =
    kony.ui.Form2.prototype.showTitleBar = function() {
        kony.web.logger("warn", "This form method is not supported in SPA");
    };

kony.ui.Form2.prototype._show = function() {
    if(!this.addWidgetsdone) {
        this.addWidgetsdone = true;
        this.ownchildrenref = [];
        this.children = [];
        if(this.addWidgets) {
            if(typeof this.addWidgets == "string") {
                window[this.addWidgets](this);
            } else if(typeof this.addWidgets == "function") {
                this.addWidgets(this);
            }
        }
        
        $KU.widgets.invokeAddWidgetsEventForInternalWidgets(this.addWidgetsEventWidgetsList);
    }
    $KG.allforms[this.id] = this;

    if(this.name == "kony.ui.Form") {
        !this.masterdataloaddone && this.masterdataload && this.masterdataload.call(this);
        !this.transactionaldataloaddone && this.transactionaldataload && this.transactionaldataload.call(this);
        this.transactionaldataloaddone = this.masterdataloaddone = true;
    } else {
        if(!this.initdone && this.init) {
            $KU.executeWidgetEventHandler(this, this.init);
        }
        
        $KU.widgets.invokeInitEventForInternalWidgets(this.initEventWidgetsList);
        this.initdone = true;
    }
    $KU.setActiveInput();
    if($KU.isAndroid && $KG.activeInput)
        $KU.hideKeyboard($KW.Form.show, this);
    else
        $KW.Form.show(this);
};

kony.ui.Form2.prototype.scrollToWidget = function(widgetref) {
    $KW.Form.scrollToWidget(this, widgetref);
};

kony.ui.Form2.prototype.scrollToBeginning = function() {
    $KW.Form.scrollToBeginning(this);
};

kony.ui.Form2.prototype.scrollToEnd = function() {
    $KW.Form.scrollToEnd(this);
};

kony.ui.Form2.prototype.widgets = function() {
    return kony.ui.ContainerWidget.prototype.widgets.call(this);
};


kony.ui.Form2.prototype.createFormLevelHierarchy = function(widgetarray) {
    formWidgetExtendCreateFormLevelHierarchy.call(this, widgetarray);
};

kony.ui.Form2.prototype.commonHeaderFooterSetup = function(containertype) {
    formWidgetExtendCommonHeaderFooterSetup.call(this, containertype);
};

kony.ui.Form2.prototype._registerForAddWidgetsEvent = function(widgetarray) {
    this.addWidgetsEventWidgetsList.push(widgetarray);
};

kony.ui.Form2.prototype._unRegisterForAddWidgetsEvent = function(widgetarray) {
    
};

kony.ui.Form2.prototype._registerForInitEvent = function(widgetarray) {
    this.initEventWidgetsList.push(widgetarray);
};

kony.ui.Form2.prototype._unRegisterForInitEvent = function(widgetarray) {
    
};

kony.ui.Form2.prototype.setGetterSetter = function() {
    defineGetter(this, "preShow", function() {
        return this.preshow;
    });
    defineSetter(this, "preShow", function(val) {
        this.preshow = val;
    });

    defineGetter(this, "postShow", function() {
        return this.postshow;
    });
    defineSetter(this, "postShow", function(val) {
        this.postshow = val;
    });

    defineGetter(this, "onHide", function() {
        return this.onhide;
    });
    defineSetter(this, "onHide", function(val) {
        this.onhide = val;
    });
    defineGetter(this, "onOrientationChange", function() {
        return this.onorientationchange;
    });
    defineSetter(this, "onOrientationChange", function(val) {
        this.onorientationchange = val;
    });
    defineGetter(this, "inTransitionConfig", function() {
        return this.intransitionconfig;
    });
    defineSetter(this, "inTransitionConfig", function(val) {
        this.intransitionconfig = val;
    });

    defineGetter(this, "outTransitionConfig", function() {
        return this.outtransitionconfig;
    });
    defineSetter(this, "outTransitionConfig", function(val) {
        this.outtransitionconfig = val;
    });
    defineGetter(this, "_konyControllerName", function() {
        return this.konyControllerName;
    });
    defineSetter(this, "_konyControllerName", function(val) {
        this.konyControllerName = val;
    });


};


kony.ui.Form2.getallboxes = function(widgetarray) {
    var wArray = widgetarray;
    if(!(widgetarray instanceof Array))
        wArray = [widgetarray];
    formWidgetExtendGetAllBoxes.call(this, wArray);
};

kony.ui.Form2.addHeaderorFooter = function() {
    formWidgetExtendaddHeaderorFooter.call(this, arguments);
};

kony.ui.Form = function(bconfig, lconfig, pspconfig) {
    kony.ui.Form.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.transactionaldataload = bconfig.transactionalDataLoad;
    this.masterdataload = bconfig.masterDataLoad;
    this.transactionaldataloaddone = this.masterdataloaddone = false;

    this.type = pspconfig.formType; 
    this.preShow = this.preshow = pspconfig.preShow;
    this.postShow = this.postshow = pspconfig.postShow;
    this.onHide = this.onhide = pspconfig.onHide;
    this.needAppMenu = this.needappmenu = pspconfig.needAppLevelMenu === undefined ? true : (pspconfig.needAppLevelMenu && true);

    this.headers = pspconfig.globalHeaders && pspconfig.globalHeaders.splice(0);
    this.footers = pspconfig.globalFooters && pspconfig.globalFooters.splice(0);

    this.headers && this.commonHeaderFooterSetup("headers");
    this.footers && this.commonHeaderFooterSetup("footers");

    this.name = "kony.ui.Form";
};

kony.inherits(kony.ui.Form, kony.ui.Form2);
