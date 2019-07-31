
kony.ui.FlexContainer = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("FlexContainer"));

    this.name = "kony.ui.FlexContainer";
    kony.ui.FlexContainer.baseConstructor.call(this, bconfig, lconfig, pspconfig);
    this.wType = "FlexContainer";
    this.allboxes = []; 
    this.autogrowMode = bconfig.autogrowMode;
    this.autogrowHeight = false;
    this.canMeasureChildrenHeight = true;
    this.hBorder = 0;
    this.vBorder = 0;
    
    this.isMaster = bconfig.isMaster === undefined ? false : (bconfig.isMaster && true);
    this.preshow = bconfig.preShow;
    this.postshow = bconfig.postShow;
    this.onhide = bconfig.onHide;
    
    this.addWidgets = bconfig.addWidgets;
    this.onDestroy = bconfig.onDestroy;
    this.init = bconfig.init;
    this.addWidgetsdone = this.initdone = false;
    this.enableonscrollwidgetpositionforsubwidgets = bconfig.enableOnScrollWidgetPositionForSubwidgets || false;
    bconfig.i18n_tabName && (this.i18n_tabname = bconfig.i18n_tabName);

    if(!this.addWidgets) {
        this.addWidgetsdone = true;
    }

    var addWidgets = bconfig.addWidgets;
    defineGetter(this, "addWidgets", function() {
        return addWidgets;
    });
    defineSetter(this, "addWidgets", function(val) {
        addWidgets = val;
        this.addWidgetsdone = false;
    });

    this.retainflowhorizontalalignment = this.retainFlowHorizontalAlignment = lconfig.retainFlowHorizontalAlignment;
    var shouldMirrorLayoutDirection = (bconfig.layoutType === kony.flex.FLOW_HORIZONTAL) && $KW.FlexUtils.shouldApplyRTL(this, "layoutAlignment");
    this.reverselayoutdirection = (shouldMirrorLayoutDirection) ? !bconfig.reverseLayoutDirection : bconfig.reverseLayoutDirection;
    defineGetter(this, "reverseLayoutDirection", function() {
        return this.reverselayoutdirection;
    });
    defineSetter(this, "reverseLayoutDirection", function(val) {
        var oldvalue = this.reverselayoutdirection;
        this.reverselayoutdirection = val;
        $KW.FlexUtils.setChildrenConfig(this, val, oldvalue);
    });

    this.defineContainerGetter = function(parent) {
        if(this.addWidgets) {
            var id = bconfig.id;
            var that = this;
            defineGetter(parent, id, function() {
                $KU.invokeAddWidgets(that);
                $KU.invokeWidgetInit(that);
                return that;
            });
        }
    };

    this.defineContainerSetter = function(parent) {
        if(this.addWidgets) {
            var id = bconfig.id;
            var that = this;
            defineSetter(parent, id, function() {
                return that;
            });
        }
    };
    

    this.layouttype = bconfig.layoutType || kony.flex.FREE_FORM;
    defineGetter(this, "layoutType", function() {
        return this.layouttype;
    });
    defineSetter(this, "layoutType", function(val) {
        var oldvalue = this.layouttype;
        if(val != oldvalue) {
            this.layouttype = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.setChildrenConfig(this, val, oldvalue);
            $KW[this.wType]["updateView"](this, "layouttype", val);
        }
    });

    this.clipbounds = (typeof bconfig.clipBounds == "undefined") ? true : bconfig.clipBounds;
    defineGetter(this, "clipBounds", function() {
        return this.clipbounds;
    });
    defineSetter(this, "clipBounds", function(val) {
        this.clipbounds = val;
        $KW[this.wType]["updateView"](this, "clipbounds", val);
    });



    this.dolayout = bconfig.doLayout;
    defineGetter(this, "doLayout", function() {
        return this.dolayout;
    });
    defineSetter(this, "doLayout", function(val) {
        this.dolayout = val;
    });

    defineGetter(this, "_konyControllerName", function() {
        return this.konyControllerName;
    });
    defineSetter(this, "_konyControllerName", function(val) {
        this.konyControllerName = val;
    });

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

    this.ismodalcontainer = bconfig.isModalContainer;

    defineGetter(this, "isModalContainer", function() {
        return this.ismodalcontainer;
    });
    defineSetter(this, "isModalContainer", function(val) {
        if(val != this.ismodalcontainer) {
            this.ismodalcontainer = val;
            $KU.checkAndReCalculateTopFlexModal(this);
        }
    });
};

kony.inherits(kony.ui.FlexContainer, kony.ui.ContainerWidget);


kony.ui.FlexContainer.prototype.destroy = function() {
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
};

kony.ui.FlexContainer.prototype.add = function() {
    var widgetarray = [].slice.call(arguments);
    boxWidgetExtendAdd.call(this, widgetarray);
    $KU.checkAndReCalculateTopFlexModal(this);
};

kony.ui.FlexContainer.prototype.addAt = function(widgetref, index) {
    boxWidgetExtendAddAt.call(this, widgetref, index);
    $KU.checkAndReCalculateTopFlexModal(this);
};

kony.ui.FlexContainer.prototype.addAll = function(widgetref, index) {
    boxWidgetExtendAddAt.call(this, widgetref, index);
    $KU.checkAndReCalculateTopFlexModal(this);
};

kony.ui.FlexContainer.prototype.remove = function(widgetref) {
    boxWidgetExtendRemove.call(this, widgetref);
    $KU.checkAndReCalculateTopFlexModal(this);
};

kony.ui.FlexContainer.prototype.removeAt = function(index) {
    var removedWidget = boxWidgetExtendRemoveAt.call(this, index);

    $KU.checkAndReCalculateTopFlexModal(this);
    return removedWidget;
};

kony.ui.FlexContainer.prototype.removeAll = function() {
    boxWidgetExtendRemoveAll.call(this);
    $KU.checkAndReCalculateTopFlexModal(this);
};

kony.ui.FlexContainer.prototype.widgets = function() {
    return kony.ui.ContainerWidget.prototype.widgets.call(this);
};

kony.ui.FlexContainer.prototype.forceLayout = function() {
    $KW.FlexContainer.forceLayout(this);
};

kony.ui.FlexContainer.prototype.setDefaultUnit = function(unit) {
    this.defaultunit = unit;
};

kony.ui.FlexContainer.prototype.executeOnParent = function() {
    if(arguments.length >= 1) {
        var callback = arguments[0];
        var args = [];
        if(arguments.length >= 2) {
            args = [].slice.call(arguments);
            args = args.slice(1, args.length);
        }
        $KW.FlexContainer.executeOnParent(this, callback, args);

    }
};

kony.ui.FlexContainer.prototype._registerForAddWidgetsEvent = function(widgetarray) {
    
};

kony.ui.FlexContainer.prototype._unRegisterForAddWidgetsEvent = function(widgetarray) {
    
};

kony.ui.FlexContainer.prototype._registerForInitEvent = function(widgetarray) {
    
};

kony.ui.FlexContainer.prototype._unRegisterForInitEvent = function(widgetarray) {
    
};

kony.ui.FlexScrollContainer = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("FlexScrollContainer"));

    this.name = "kony.ui.FlexScrollContainer";
    kony.ui.FlexScrollContainer.baseConstructor.call(this, bconfig, lconfig, pspconfig);
    this.wType = "FlexScrollContainer";
    this.allboxes = []; 

    this.enablescrolling = (typeof bconfig.enableScrolling == "undefined") ? true : bconfig.enableScrolling;
    defineGetter(this, "enableScrolling", function() {
        return this.enablescrolling;
    });
    defineSetter(this, "enableScrolling", function(val) {
        this.enablescrolling = val;
        $KW[this.wType]["updateView"](this, "enableScrolling", val);
    });

    this.scrolldirection = (typeof bconfig.scrollDirection == "undefined") ? kony.flex.SCROLL_HORIZONTAL : bconfig.scrollDirection;
    defineGetter(this, "scrollDirection", function() {
        return this.scrolldirection;
    });
    defineSetter(this, "scrollDirection", function(val) {
        this.scrolldirection = val;
        $KW[this.wType]["updateView"](this, "scrollDirection", val);
    });
    this.contentoffset = bconfig.contentOffset;
    defineGetter(this, "contentOffset", function() {
        return this.contentoffset;
    });
    defineSetter(this, "contentOffset", function(val) {
        this.contentoffset = val;
        $KW.FlexScrollContainer.updateView(this, "contentOffset", val);
    });

    this.contentsize = bconfig.contentSize;
    defineGetter(this, "contentSize", function() {
        return this.contentsize;
    });
    defineSetter(this, "contentSize", function(val) {
        this.contentsize = val;
    });

    defineGetter(this, "enableOnScrollWidgetPositionForSubwidgets", function() {
        return this.enableonscrollwidgetpositionforsubwidgets;
    });
    defineSetter(this, "enableOnScrollWidgetPositionForSubwidgets", function(val) {
        this.enableonscrollwidgetpositionforsubwidgets = val;
    });

    defineGetter(this, "contentOffsetMeasured", function() {
        return $KW.APIUtils.getContentOffsetMeasured(this);
    });

    this.contentsize = bconfig.contentSize;
    defineGetter(this, "contentSizeMeasured", function() {
        return $KW.FlexScrollContainer.getContentSizeMeasured(this);
    });
    defineSetter(this, "contentSizeMeasured", function(val) {});



    this.bounce = (typeof bconfig.bounces == "undefined") ? true : bconfig.bounces;
    defineGetter(this, "bounces", function() {
        return this.bounce;
    });
    defineSetter(this, "bounces", function(val) {
        this.bounce = val;
        $KW[this.wType]["updateView"](this, "bounces", val);
    });

    this.allowhorizontalbounce = (typeof bconfig.allowHorizontalBounce == "undefined") ? true : bconfig.allowHorizontalBounce;
    defineGetter(this, "allowHorizontalBounce", function() {
        return this.allowhorizontalbounce;
    });
    defineSetter(this, "allowHorizontalBounce", function(val) {
        this.allowhorizontalbounce = val;
        $KW[this.wType]["updateView"](this, "allowHorizontalBounce", val);
    });

    this.allowverticalbounce = (typeof bconfig.allowVerticalBounce == "undefined") ? true : bconfig.allowVerticalBounce;
    defineGetter(this, "allowVerticalBounce", function() {
        return this.allowverticalbounce;
    });
    defineSetter(this, "allowVerticalBounce", function(val) {
        this.allowverticalbounce = val;
        $KW[this.wType]["updateView"](this, "allowVerticalBounce", val);
    });

    this.horizontalscrollindicator = (typeof bconfig.horizontalScrollIndicator == "undefined") ? true : bconfig.horizontalScrollIndicator;
    defineGetter(this, "horizontalScrollIndicator", function() {
        return this.horizontalscrollindicator;
    });
    defineSetter(this, "horizontalScrollIndicator", function(val) {
        this.horizontalscrollindicator = val;
        $KW[this.wType]["updateView"](this, "horizontalScrollIndicator", val);
    });

    this.verticalscrollindicator = (typeof bconfig.verticalScrollIndicator == "undefined") ? true : bconfig.verticalScrollIndicator;
    defineGetter(this, "verticalScrollIndicator", function() {
        return this.verticalscrollindicator;
    });
    defineSetter(this, "verticalScrollIndicator", function(val) {
        this.verticalscrollindicator = val;
        $KW[this.wType]["updateView"](this, "verticalScrollIndicator", val);
    });


    this.pagineenabled = (typeof bconfig.pagineEnabled == "undefined") ? false : bconfig.pagineEnabled;
    defineGetter(this, "pagineEnabled", function() {
        return this.pagineenabled;
    });
    defineSetter(this, "pagineEnabled", function(val) {
        this.pagineenabled = val;
    });

    this.dragg = false;
    defineGetter(this, "dragging", function() {
        var scrollerId = $KW.Utils.getKMasterWidgetID(this) + "_scroller";
        if($KG[scrollerId]) {
            return $KG[scrollerId].dragging;
        }
        return false;
    });
    defineSetter(this, "dragging", function(val) {
        
    });

    defineGetter(this, "tracking", function() {
        var scrollerId = $KW.Utils.getKMasterWidgetID(this) + "_scroller";
        if($KG[scrollerId]) {
            return $KG[scrollerId].tracking;
        }
        return false;
    });
    defineSetter(this, "tracking", function(val) {
        
    });


    defineGetter(this, "decelerating", function() {
        var scrollerId = $KW.Utils.getKMasterWidgetID(this) + "_scroller";
        if($KG[scrollerId]) {
            return !this.tracking && $KG[scrollerId].animating;
        }
        return false;
    });
    defineSetter(this, "decelerating", function(val) {
        
    });



    this.onscrollstart = bconfig.onScrollStart;
    defineGetter(this, "onScrollStart", function() {
        return this.onscrollstart;
    });
    defineSetter(this, "onScrollStart", function(val) {
        this.onscrollstart = val;
        $KW[this.wType]["updateView"](this, "onScrollStart", val);
    });

    this.onscrolltouchreleased = bconfig.onScrollTouchReleased;
    defineGetter(this, "onScrollTouchReleased", function() {
        return this.onscrolltouchreleased;
    });
    defineSetter(this, "onScrollTouchReleased", function(val) {
        this.onscrolltouchreleased = val;
        $KW[this.wType]["updateView"](this, "onScrollTouchReleased", val);
    });

    this.onscrolling = bconfig.onScrolling;
    defineGetter(this, "onScrolling", function() {
        return this.onscrolling;
    });
    defineSetter(this, "onScrolling", function(val) {
        this.onscrolling = val;
        $KW[this.wType]["updateView"](this, "onScrolling", val);
    });

    this.ondecelerationstarted = bconfig.onDecelerationStarted;
    defineGetter(this, "onDecelerationStarted", function() {
        return this.ondecelerationstarted;
    });
    defineSetter(this, "onDecelerationStarted", function(val) {
        this.ondecelerationstarted = val;
        $KW[this.wType]["updateView"](this, "onDecelerationStarted", val);
    });

    this.onscrollend = bconfig.onScrollEnd;
    defineGetter(this, "onScrollEnd", function() {
        return this.onscrollend;
    });
    defineSetter(this, "onScrollEnd", function(val) {
        this.onscrollend = val;
        $KW[this.wType]["updateView"](this, "onScrollEnd", val);
    });

    this.scrollingevents = bconfig.scrollingEvents || null;
    if(this.scrollingevents) {
        this.scrollingevents.onpush = bconfig.scrollingEvents.onPush;
        this.scrollingevents.onpull = bconfig.scrollingEvents.onPull;
        this.scrollingevents.onreachingbeginning = bconfig.scrollingEvents.onReachingBegining;
        this.scrollingevents.onreachingend = bconfig.scrollingEvents.onReachingEnd;
    }

    this.pullkey = bconfig.pullToRefreshI18NKey || "";
    this.releasepullkey = bconfig.releaseToPullRefreshI18NKey || "";
    this.pushkey = bconfig.pushToRefreshI18NKey || "";
    this.releasepushkey = bconfig.releaseToPushRefreshI18NKey || "";

    this.pullskin = bconfig.pullToRefreshSkin || "";
    this.pushskin = bconfig.pushToRefreshSkin || "";

    this.pullicon = bconfig.pullToRefreshIcon || "";
    this.pushicon = bconfig.pushToRefreshIcon || "";
    this.animateicons = bconfig.animateIcons || "";

    defineGetter(this, "scrollingEvents", function() {
        return this.scrollingevents;
    });
    defineSetter(this, "scrollingEvents", function(val) {
        this.scrollingevents = val;
        if(this.scrollingevents) {
            this.scrollingevents.onpush = this.scrollingevents.onPush;
            this.scrollingevents.onpull = this.scrollingevents.onPull;
            this.scrollingevents.onreachingbeginning = this.scrollingevents.onReachingBegining;
            this.scrollingevents.onreachingend = this.scrollingevents.onReachingEnd;
        }
        $KW[this.wType]["updateView"](this, "scrollingevents", val);
    });

    
    defineGetter(this, "pullToRefreshI18NKey", function() {
        return this.pullkey;
    });
    defineSetter(this, "pullToRefreshI18NKey", function(val) {
        this.pullkey = val;
        $KW[this.wType]["updateView"](this, "pullkey", val);
    });

    
    defineGetter(this, "releaseToPullRefreshI18NKey", function() {
        return this.releasepullkey;
    });
    defineSetter(this, "releaseToPullRefreshI18NKey", function(val) {
        this.releasepullkey = val;
        $KW[this.wType]["updateView"](this, "releasepullkey", val);
    });

    
    defineGetter(this, "pushToRefreshI18NKey", function() {
        return this.pushkey;
    });
    defineSetter(this, "pushToRefreshI18NKey", function(val) {
        this.pushkey = val;
        $KW[this.wType]["updateView"](this, "pushkey", val);
    });

    
    defineGetter(this, "releaseToPushRefreshI18NKey", function() {
        return this.releasepushkey;
    });
    defineSetter(this, "releaseToPushRefreshI18NKey", function(val) {
        this.releasepushkey = val;
        $KW[this.wType]["updateView"](this, "releasepushkey", val);
    });

    
    defineGetter(this, "pullToRefreshSkin", function() {
        return this.pullskin;
    });
    defineSetter(this, "pullToRefreshSkin", function(val) {
        this.pullskin = val;
        $KW[this.wType]["updateView"](this, "pullskin", val);
    });

    
    defineGetter(this, "pushToRefreshSkin", function() {
        return this.pushskin;
    });
    defineSetter(this, "pushToRefreshSkin", function(val) {
        this.pushskin = val;
        $KW[this.wType]["updateView"](this, "pushskin", val);
    });

    
    defineGetter(this, "pullToRefreshIcon", function() {
        return this.pullicon;
    });
    defineSetter(this, "pullToRefreshIcon", function(val) {
        this.pullicon = val;
        $KW[this.wType]["updateView"](this, "pullicon", val);
    });

    defineGetter(this, "pushToRefreshIcon", function() {
        return this.pushicon;
    });
    defineSetter(this, "pushToRefreshIcon", function(val) {
        this.pushicon = val;
        $KW[this.wType]["updateView"](this, "pushicon", val);
    });

    defineGetter(this, "animateIcons", function() {
        return this.animateicons;
    });
    defineSetter(this, "animateIcons", function(val) {
        this.animateicons = val;
        $KW[this.wType]["updateView"](this, "animateicons", val);
    });
};

kony.inherits(kony.ui.FlexScrollContainer, kony.ui.FlexContainer);

kony.ui.FlexScrollContainer.prototype.forceLayout = function() {
    $KW.FlexScrollContainer.forceLayout(this);
};

kony.ui.FlexScrollContainer.prototype.setContentOffset = function(contentOffSet, animate) {
    $KW.FlexScrollContainer.setContentOffSet(this, contentOffSet, animate);
};

kony.ui.FlexScrollContainer.prototype.scrollToWidget = function(widget, animate) {
    $KW.FlexScrollContainer.scrollToWidget(this, widget, animate);
};

kony.ui.FlexScrollContainer.prototype.scrollToEnd = function() {
    $KW.FlexScrollContainer.scrollToEnd(this);
};

kony.ui.FlexScrollContainer.prototype.setZoomScale = function() {
    kony.web.logger("warn", "This FlexScrollContainer method is not supported in SPA");
};
