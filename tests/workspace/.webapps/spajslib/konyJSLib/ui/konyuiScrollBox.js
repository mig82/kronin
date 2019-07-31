
kony.ui.ScrollBox = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("ScrollBox"));

    kony.ui.ScrollBox.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.totalWt = 0;
    this.position = bconfig.position || constants.BOX_POSITION_AS_NORMAL;
    this.enableScrollByPage = bconfig.enableScrollByPage || false;
    this.scrollDirection = this.scrolldirection = bconfig.scrollDirection || constants.SCROLLBOX_SCROLL_HORIZONTAL;
    this.showscrollbars = bconfig.showScrollbars === undefined ? true : bconfig.showScrollbars;
    this.scrollbar = this.showscrollbars ? "scrollbar" : "none";
    this.containerheight = lconfig.containerHeight;
    this.containerheightreference = lconfig.containerHeightReference;
    this.wType = "ScrollBox";
    this.name = "kony.ui.ScrollBox";

    var scrollArrowConfig = (pspconfig.scrollArrowConfig && (pspconfig.scrollArrowConfig[0] || pspconfig.scrollArrowConfig[1] || pspconfig.scrollArrowConfig[2] || pspconfig.scrollArrowConfig[3])) ? pspconfig.scrollArrowConfig : null;

    if(scrollArrowConfig) {
        this.scrollbar = "arrows";
        if(scrollArrowConfig.length >= 4) {
            this.leftarrowimage = scrollArrowConfig[0];
            this.toparrowimage = scrollArrowConfig[1];
            this.rightarrowimage = scrollArrowConfig[2];
            this.bottomarrowimage = scrollArrowConfig[3];
        }
    }

    this.scrollingevents = bconfig.scrollingEvents || null;
    if(this.scrollingevents) {
        this.scrollingevents.onpush = bconfig.scrollingEvents.onPush;
        this.scrollingevents.onpull = bconfig.scrollingEvents.onPull;
        this.scrollingevents.onreachingbeginning = bconfig.scrollingEvents.onReachingBegining;
        this.scrollingevents.onreachingend = bconfig.scrollingEvents.onReachingEnd
    }

    this.setGetterSetter();
};

kony.inherits(kony.ui.ScrollBox, kony.ui.Box);

kony.ui.ScrollBox.prototype.setGetterSetter = function() {
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

    defineGetter(this, "showScrollbars", function() {
        return this.showscrollbars;
    });
    defineSetter(this, "showScrollbars", function(val) {
        this.showscrollbars = val;
        $KW[this.wType]["updateView"](this, "showscrollbars", val);
    });

    
    defineGetter(this, "scrollingEvents", function() {
        return this.scrollingevents;
    });
    defineSetter(this, "scrollingEvents", function(val) {
        this.scrollingevents = val;
        if(val) {
            this.scrollingevents.onpush = val.onPush;
            this.scrollingevents.onpull = val.onPull;
            this.scrollingevents.onreachingbeginning = val.onReachingBegining;
            this.scrollingevents.onreachingend = val.onReachingEnd;
        }
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

};

kony.ui.ScrollBox.prototype.scrollToBeginning = function() {
    $KW.ScrollBox.scrollToBeginning(this);
};

kony.ui.ScrollBox.prototype.scrollToEnd = function() {
    $KW.ScrollBox.scrollToEnd(this);
};
