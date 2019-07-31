
kony.ui.SegmentedUI2 = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("SegmentedUI2"));

    kony.ui.SegmentedUI2.baseConstructor.call(this, bconfig, lconfig, pspconfig);
    this.scrollbounce = (bconfig.enableScrollBounce == undefined) ? true : bconfig.enableScrollBounce;
    this.groupcells = bconfig.groupCells || false;
    this.screenLevelWidget = bconfig.screenLevelWidget || false;
    this.widgetskin = bconfig.widgetSkin;
    this.skin = bconfig.skin;
    this.rowskin = bconfig.rowSkin;
    this.focusskin = bconfig.rowFocusSkin;
    this.askin = bconfig.alternateRowSkin;
    this.sectionheaderskin = bconfig.sectionHeaderSkin;
    this.widgetdatamap = bconfig.widgetDataMap;
    this.rowtemplate = bconfig.rowTemplate;
    this.sectionheadertemplate = bconfig.sectionHeaderTemplate;
    this.separatorrequired = bconfig.separatorRequired || false;
    this.separatorthickness = bconfig.separatorThickness;
    this.separatorcolor = bconfig.separatorColor;
    this.viewtype = bconfig.viewType;
    this.autogrowMode = bconfig.autogrowMode;
    this.onrowclick = bconfig.onRowClick;
    this.onrowdisplay = bconfig.onRowDisplay;
    this.retainselection = bconfig.retainSelection || false;
    this.needpageindicator = bconfig.needPageIndicator || false;
    this.pageondotimage = bconfig.pageOnDotImage || false;
    this.pageoffdotimage = bconfig.pageOffDotImage || false;
    this.onswipe = bconfig.onSwipe;
    this.showscrollbars = bconfig.showScrollbars;
    this.scrollingevents = bconfig.scrollingEvents || false;
    this.contentoffset = bconfig.contentOffset;

    if(this.scrollingevents) {
        this.scrollingevents.onpush = bconfig.scrollingEvents.onPush;
        this.scrollingevents.onpull = bconfig.scrollingEvents.onPull;
        this.scrollingevents.onreachingbeginning = bconfig.scrollingEvents.onReachingBegining;
        this.scrollingevents.onreachingend = bconfig.scrollingEvents.onReachingEnd;
    }
    this.selectionbehavior = bconfig.selectionBehavior || constants.SEGUI_DEFAULT_BEHAVIOR;
    this.selectionbehaviorconfig = bconfig.selectionBehaviorConfig;
    this.selectedindex = bconfig.selectedIndex || null;
    this.selecteditems = null;
    this.selectedindices = bconfig.selectedIndices || null;
    this.selectedrowindex = bconfig.selectedRowIndex || null;
    this.selectedrowindices = bconfig.selectedRowIndices || null;

    this.containerheight = lconfig.containerHeight;
    this.containerheightreference = lconfig.containerHeightReference || constants.CONTAINER_HEIGHT_BY_FORM_REFERENCE;
    
    this.__y = 0;
    var data = bconfig.data;
    defineGetter(this, "data", function() {
        return data;
    });

    defineSetter(this, "data", function(val) {
        data = val;
        this.canUpdateUI && $KW[this.wType]["updateView"](this, "data", val);
    });
    defineGetter(this, "enableScrollBounce", function() {
        return this.scrollbounce;
    });
    defineSetter(this, "enableScrollBounce", function(val) {
        this.scrollbounce = val;
        $KW[this.wType]["updateView"](this, "enableScrollBounce", val);
    });
    defineGetter(this, "contentOffsetMeasured", function() {
        return $KW.APIUtils.getContentOffsetMeasured(this);
    });
    defineGetter(this, "contentOffset", function() {
        return this.contentoffset;
    });
    defineSetter(this, "contentOffset", function(val) {
        this.contentoffset = val;
        if(typeof val === "undefined" || val === null || typeof val.x === "undefined" || typeof val.y === "undefined") {
            return;
        }
        
        this.__y = 0;
        return $KW.APIUtils.setContentOffSet(this, val, true);
    });
    defineGetter(this, "enableScrollBounce", function() {
        return this.scrollbounce;
    });
    defineSetter(this, "enableScrollBounce", function(val) {
        this.scrollbounce = val;
        $KW[this.wType]["updateView"](this, "enableScrollBounce", val);
    });
    
    this.retainscrollpositionmode = bconfig.retainScrollPositionMode || constants.SEGUI_SCROLL_POSITION_DEFAULT;

    this.clonedTemplates = [];
    this.setGetterSetter();

    
    this.wType = "Segment";
    this.name = "kony.ui.SegmentedUI2";
    this.canUpdateUI = true;
};

kony.inherits(kony.ui.SegmentedUI2, kony.ui.Widget);

kony.ui.SegmentedUI2.prototype.setGetterSetter = function() {
    defineGetter(this, "widgetSkin", function() {
        return this.widgetskin;
    });
    defineSetter(this, "widgetSkin", function(val) {
        var oldvalue = this.widgetskin;
        this.widgetskin = val;
        $KW[this.wType]["updateView"](this, "widgetskin", val, oldvalue);
    });

    defineGetter(this, "rowSkin", function() {
        return this.rowskin;
    });
    defineSetter(this, "rowSkin", function(val) {
        var oldvalue = this.skin;
        this.rowskin = val;
        $KW[this.wType]["updateView"](this, "rowskin", val, oldvalue);
    });

    defineGetter(this, "rowFocusSkin", function() {
        return this.focusskin;
    });
    defineSetter(this, "rowFocusSkin", function(val) {
        var oldvalue = this.focusskin;
        this.focusskin = val;
        kony.model.updateView(this, "focusskin", val);
    });

    defineGetter(this, "alternateRowSkin", function() {
        return this.askin;
    });
    defineSetter(this, "alternateRowSkin", function(val) {
        var oldvalue = this.askin;
        this.askin = val;
        $KW[this.wType]["updateView"](this, "askin", val, oldvalue);
    });

    defineGetter(this, "sectionHeaderSkin", function() {
        return this.sectionheaderskin;
    });
    defineSetter(this, "sectionHeaderSkin", function(val) {
        var oldvalue = this.sectionheaderskin
        this.sectionheaderskin = val;
        $KW[this.wType]["updateView"](this, "sectionskin", val, oldvalue);
    });

    defineGetter(this, "widgetDataMap", function() {
        return this.widgetdatamap;
    });
    defineSetter(this, "widgetDataMap", function(val) {
        this.widgetdatamap = val;
    });

    defineGetter(this, "rowTemplate", function() {
        return this.rowtemplate;
    });
    defineSetter(this, "rowTemplate", function(val) {
        this.rowtemplate = val;
    });

    defineGetter(this, "sectionHeaderTemplate", function() {
        return this.sectionheadertemplate;
    });
    defineSetter(this, "sectionHeaderTemplate", function(val) {
        this.sectionheadertemplate = val;
    });

    defineGetter(this, "separatorRequired", function() {
        return this.separatorrequired;
    });
    defineSetter(this, "separatorRequired", function(val) {
        this.separatorrequired = val;
        $KW[this.wType]["updateView"](this, "separatorrequired", val);
    });

    defineGetter(this, "separatorThickness", function() {
        return this.separatorthickness;
    });
    defineSetter(this, "separatorThickness", function(val) {
        this.separatorthickness = val;
        $KW[this.wType]["updateView"](this, "separatorthickness", val);
    });

    defineGetter(this, "separatorColor", function() {
        return this.separatorcolor;
    });
    defineSetter(this, "separatorColor", function(val) {
        this.separatorcolor = val;
        $KW[this.wType]["updateView"](this, "separatorcolor", val);
    });

    defineGetter(this, "viewType", function() {
        return this.viewtype;
    });
    defineSetter(this, "viewType", function(val) {
        var oldvalue = this.viewtype
        this.viewtype = val;
        $KW[this.wType]["updateView"](this, "viewtype", val, oldvalue);
    });

    defineGetter(this, "onRowClick", function() {
        return this.onrowclick;
    });

    defineSetter(this, "onRowClick", function(val) {
        this.onrowclick = val;
    });

    defineGetter(this, "onRowDisplay", function() {
        return this.onrowdisplay;
    });

    defineSetter(this, "onRowDisplay", function(val) {
        this.onrowdisplay = val;
        $KW.Segment.onRowDisplay(this);
    });

    defineGetter(this, "retainSelection", function() {
        return this.retainselection;
    });
    defineSetter(this, "retainSelection", function(val) {
        this.retainselection = val;
    });

    defineGetter(this, "needPageIndicator", function() {
        return this.needpageindicator;
    });
    defineSetter(this, "needPageIndicator", function(val) {
        this.needpageindicator = val;
        $KW[this.wType]["updateView"](this, "needpageindicator", val);
    });

    defineGetter(this, "pageOnDotImage", function() {
        return this.pageondotimage;
    });
    defineSetter(this, "pageOnDotImage", function(val) {
        this.pageondotimage = val;
        $KW[this.wType]["updateView"](this, "pageondotimage", val);
    });

    defineGetter(this, "pageOffDotImage", function() {
        return this.pageoffdotimage;
    });
    defineSetter(this, "pageOffDotImage", function(val) {
        this.pageoffdotimage = val;
        $KW[this.wType]["updateView"](this, "pageoffdotimage", val);
    });

    defineGetter(this, "onSwipe", function() {
        return this.onswipe;
    });
    defineSetter(this, "onSwipe", function(val) {
        this.onswipe = val;
    });

    defineGetter(this, "showScrollbars", function() {
        return this.showscrollbars;
    });
    defineSetter(this, "showScrollbars", function(val) {
        this.showscrollbars = val;
    });

    defineGetter(this, "scrollingEvents", function() {
        return this.scrollingevents;
    });
    defineSetter(this, "scrollingEvents", function(val) {
        this.scrollingevents = val;
        $KW[this.wType]["updateView"](this, "scrollingevents", val);
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

    defineGetter(this, "selectionBehavior", function() {
        return this.selectionbehavior;
    });
    defineSetter(this, "selectionBehavior", function(val) {
        var oldvalue = this.selectionbehavior;
        this.selectionbehavior = val;
        $KW[this.wType]["updateView"](this, "selectionbehavior", val, oldvalue);
    });

    defineGetter(this, "selectionBehaviorConfig", function() {
        return this.selectionbehaviorconfig;
    });
    defineSetter(this, "selectionBehaviorConfig", function(val) {
        this.selectionbehaviorconfig = val;
        $KW[this.wType]["updateView"](this, "selectionbehaviorconfig", val);
    });

    defineGetter(this, "selectedIndex", function() {
        return this.selectedindex;
    });
    defineSetter(this, "selectedIndex", function(val) {
        this.selectedindex = val;
        $KW[this.wType]["updateView"](this, "selectedindex", val);
    });

    defineGetter(this, "selectedItems", function() {
        return this.selecteditems;
    });

    defineGetter(this, "selectedRowItems", function() {
        return this.selecteditems;
    });

    defineGetter(this, "selectedIndices", function() {
        return this.selectedindices;
    });
    defineSetter(this, "selectedIndices", function(val) {
        this.selectedindices = val;
        $KW[this.wType]["updateView"](this, "selectedindices", val);
    });

    defineGetter(this, "selectedRowIndex", function() {
        return this.selectedrowindex;
    });

    defineSetter(this, "selectedRowIndex", function(val) {
        this.selectedrowindex = val;
        $KW[this.wType]["updateView"](this, "selectedindex", val);
    });

    defineGetter(this, "selectedRowIndices", function() {
        return this.selectedrowindices;
    });

    defineSetter(this, "selectedRowIndices", function(val) {
        this.selectedrowindices = val;
        $KW[this.wType]["updateView"](this, "selectedindices", val);
    });


    this.scrollingevents = this.scrollingevents || {};
    this.scrollingevents.scrollObj = this;
    if(this.scrollingevents) {
        defineGetter(this.scrollingEvents, "onPush", function() {
            return this.onpush;
        });
        defineSetter(this.scrollingEvents, "onPush", function(val) {
            this.onpush = val;
            $KW[this.scrollObj.wType]["updateView"](this.scrollObj, "onpush", val);
        });

        defineGetter(this.scrollingEvents, "onPull", function() {
            return this.onpull;
        });
        defineSetter(this.scrollingEvents, "onPull", function(val) {
            this.onpull = val;
            $KW[this.scrollObj.wType]["updateView"](this.scrollObj, "onpull", val);
        });
        defineGetter(this.scrollingEvents, "onReachingBegining", function() {
            return this.onreachingbeginning;
        });
        defineSetter(this.scrollingEvents, "onReachingBegining", function(val) {
            this.onreachingbeginning = val;
            $KW[this.scrollObj.wType]["updateView"](this.scrollObj, "onreachingbeginning", val);
        });

        defineGetter(this.scrollingEvents, "onReachingEnd", function() {
            return this.onreachingend;
        });
        defineSetter(this.scrollingEvents, "onReachingEnd", function(val) {
            this.onreachingend = val;
            $KW[this.scrollObj.wType]["updateView"](this.scrollObj, "onreachingend", val);
        });
    }

    defineGetter(this, "retainScrollPositionMode", function() {
        return this.retainscrollpositionmode;
    });

    defineSetter(this, "retainScrollPositionMode", function(val) {
        var oldvalue = this.retainscrollpositionmode;
        if(oldvalue != val) {
            this.retainscrollpositionmode = val;
            this.__y = 0;
        }
    });
}

kony.ui.SegmentedUI2.prototype.addAll = function(dataArray, animObj) {
    $KW.Segment.addAll(this, dataArray, animObj);
};

kony.ui.SegmentedUI2.prototype.addDataAt = function(dataArray, rowIndex, sectionIndex, animObj) {
    $KW.Segment.addDataAt(this, dataArray, rowIndex, sectionIndex, animObj);
};

kony.ui.SegmentedUI2.prototype.addSectionAt = function(dataArray, sectionIndex, animObj) {
    $KW.Segment.addSectionAt(this, dataArray, sectionIndex, animObj);
};

kony.ui.SegmentedUI2.prototype.removeAll = function(animObj) {
    $KW.Segment.removeAll(this, animObj);
};

kony.ui.SegmentedUI2.prototype.removeAt = function(rowIndex, sectionIndex, animObj) {
    $KW.Segment.removeAt(this, rowIndex, sectionIndex, animObj);
};

kony.ui.SegmentedUI2.prototype.removeSectionAt = function(sectionIndex, animObj) {
    $KW.Segment.removeSectionAt(this, sectionIndex, animObj);
};

kony.ui.SegmentedUI2.prototype.setData = function(dataArray, animObj) {
    $KW.Segment.setData(this, dataArray, animObj);
};

kony.ui.SegmentedUI2.prototype.setDataAt = function(dataObj, rowIndex, sectionIndex, animObj) {
    $KW.Segment.setDataAt(this, dataObj, rowIndex, sectionIndex, animObj);
};

kony.ui.SegmentedUI2.prototype.setSectionAt = function(dataArray, sectionIndex, animObj) {
    $KW.Segment.setSectionAt(this, dataArray, sectionIndex, animObj);
};


kony.ui.SegmentedUI2.prototype.setDataWithSections = function(dataArray) {
    $KW.Segment.setDataWithSections(this, dataArray);
};

kony.ui.SegmentedUI2.prototype.animateRows = function(animContext) {
    new $KW.Segment.animateRows(this, animContext);
};

kony.ui.SegmentedUI2.prototype.setAnimations = function(animObj) {
    if(this.listAnimation) 
        this.listAnimation.destroy();
    this.listAnimation = new $KW.Segment.setAnimations(this, animObj);
};

kony.ui.SegmentedUI2.prototype.getFirstVisibleRow = function() {
    return $KW.Segment.getFirstVisibleRow(this);
};

kony.ui.SegmentedUI2.prototype.getLastVisibleRow = function() {
    return $KW.Segment.getLastVisibleRow(this);
};

kony.ui.SegmentedUI2.prototype.searchText = function(searchCondition, config) {
    return $KW.Segment.searchText(searchCondition, config, this);
};

kony.ui.SegmentedUI2.prototype.getUpdatedSearchResults = function() {
    return $KW.Segment.getUpdatedSearchResults(this);
};

kony.ui.SegmentedUI2.prototype.clearSearch = function() {
    return $KW.Segment.clearSearch(this);
};
kony.ui.SegmentedUI2.prototype.resetSwipeMove = function(rowContext) {
    return $KW.Segment.resetSwipe(this, rowContext);
};

kony.ui.SegmentedUI = function(bconfig, lconfig, pspconfig) {
    kony.ui.SegmentedUI.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.skin = bconfig.skin;

    this.askin = bconfig.aSkin;

    this.sectionheaderskin = pspconfig.secSkin;

    this.name = "kony.ui.SegmentedUI";

    retainSelection = pspconfig.retainSelection || false;
    viewType = this.viewtype = pspconfig.view;
    selectionBehavior = this.selectionbehavior = pspconfig.behavior || constants.SEGUI_DEFAULT_BEHAVIOR;
    separatorThickness = this.separatorthickness = pspconfig.sepThickness;
    separatorColor = this.separatorcolor = pspconfig.sepColor;
    onRowClick = this.onrowclick = bconfig.onClick;
    this.separatorrequired = true;

    this.focuseditem = null; 
    defineGetter(this, "focusedItem", function() {
        return this.focuseditem;
    });

    this.focusedindex = bconfig.focusedIndex || null;
    defineGetter(this, "focusedIndex", function() {
        return this.focusedindex;
    });
    defineSetter(this, "focusedIndex", function(val) {
        this.focusedindex = val;
        $KW[this.wType]["updateView"](this, "focusedindex", val);
    });

    this.needpageindicator = pspconfig.isPageIndicatorNeeded || null;
    defineGetter(this, "isPageIndicatorNeeded", function() {
        return this.needpageindicator;
    });
    defineSetter(this, "isPageIndicatorNeeded", function(val) {
        this.needpageindicator = val;
        $KW[this.wType]["updateView"](this, "needpageindicator", val);
    });
};
kony.inherits(kony.ui.SegmentedUI, kony.ui.SegmentedUI2);
