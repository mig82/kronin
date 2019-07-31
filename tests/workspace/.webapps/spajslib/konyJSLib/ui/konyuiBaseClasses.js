kony.inherits = function(subClass, baseClass) {
    function inherit() {}

    inherit.prototype = baseClass.prototype;
    subClass.prototype = new inherit();
    subClass.prototype.constructor = subClass;
    subClass.baseConstructor = baseClass;
    subClass.superClass = baseClass.prototype;
};

kony.ui = {
    Widget: function(bconfig, lconfig, pspconfig) {
        
        if(arguments.length < 3)
            throw new KonyError(101, "Error", "Invalid number of arguments"); 

        if(bconfig.id === undefined || bconfig.id === null || bconfig.id === '') {
            throw new KonyError(1102, 'WidgetError', 'Widget cannot be created due to invalid input data.');
        }
        this.constructorList = [bconfig, lconfig, pspconfig];
        this.id = bconfig.id;
        this.focusskin = bconfig.focusSkin;
        this.isvisible = bconfig.isVisible === undefined ? true : (bconfig.isVisible && true);
        bconfig.i18n_text && (this.i18n_text = bconfig.i18n_text);
        this.containerweight = lconfig.containerWeight || 0;

        this.retainflexpositionproperties = this.retainFlexPositionProperties = lconfig.retainFlexPositionProperties;
        this.retaincontentalignment = this.retainContentAlignment = lconfig.retainContentAlignment;

        var requireContentAlignment = $KW.FlexUtils.shouldApplyRTL(this, "contentAligment");

        this.contentalignment = (requireContentAlignment) ? $KW.Utils.getMirrorAlignment(lconfig.contentAlignment) : lconfig.contentAlignment; 
        this.isContentAlignmentMirrored = requireContentAlignment;

        this.widgetalignment = lconfig.widgetAlignment;
        this.marginInPixel = lconfig.marginInPixel;
        this.paddingInPixel = lconfig.paddingInPixel;
        this.blockeduiskin = pspconfig.blockedUISkin;
        this.hexpand = (typeof lconfig.hExpand == "undefined") ? false : lconfig.hExpand;

        this.enabled = false;
        this.canUpdateUI = true;
        this.onclick = bconfig.onClick;


        this.accessibilityconfig = bconfig.accessibilityConfig;
        this.widgetswipemove = bconfig.widgetSwipeMove;

        defineGetter(this, "widgetSwipeMove", function() {
            return this.widgetswipemove;
        });

        defineSetter(this, "widgetSwipeMove", function(val) {
            var oldValue = this.widgetswipemove;
            this.widgetswipemove = val;
            kony.model.updateView(this, "widgetSwipeMove", val, oldValue);
        });

        defineGetter(this, "accessibilityConfig", function() {
            return this.accessibilityconfig;
        });

        defineSetter(this, "accessibilityConfig", function(val) {
            var oldValue = this.accessibilityconfig;
            this.accessibilityconfig = val;
            kony.model.updateView(this, "accessibilityConfig", val, oldValue);

        });

        var requireFlexRTL = $KW.FlexUtils.shouldApplyRTL(this, "flexPosition");
        this._margin = (!lconfig.margin) ? [0, 0, 0, 0] : lconfig.margin;
        defineGetter(this, "margin", function() {
            return this._margin;
        });
        defineSetter(this, "margin", function(val) {
            this._margin = val;
            $KU.isArray(val) && kony.model.updateView(this, "margin", val);
        });

        this._padding = (!lconfig.padding) ? [0, 0, 0, 0] : (requireFlexRTL) ? $KW.Utils.getMirroredMarginPadding(lconfig.padding) : lconfig.padding;
        defineGetter(this, "padding", function() {
            return this._padding;
        });
        defineSetter(this, "padding", function(val) {
            var oldvalue = this._padding;
            this._padding = val;
            $KU.isArray(val) && kony.model.updateView(this, "padding", val);
            var iscontentDriven = $KU.inArray($KU.contentDrivenWidgets, this.wType)[0];
            iscontentDriven && $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
        });

        this._skin = bconfig.skin;
        defineGetter(this, "skin", function() {
            return this._skin;
        });
        defineSetter(this, "skin", function(val) {
            var oldvalue = this._skin;
            this._skin = val;
            if(this.canUpdateUI) { 
                kony.model.updateView(this, "skin", val, oldvalue);
                var iscontentDriven = $KU.inArray($KU.contentDrivenWidgets, this.wType)[0];
                iscontentDriven && $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
                if(this.isImageOverlayWidget) {
                    $KW.Image.adjustImageOverlayWidgets(this.parent);
                }
            }
        });

        this.onDrag = bconfig.onDrag;
        this.frame = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        this.layoutConfig = {
            self: true,
            children: false
        };

        this._left = (requireFlexRTL) ? bconfig.right : bconfig.left;
        defineGetter(this, "left", function() {
            return this._left;
        });
        defineSetter(this, "left", function(val) {
            var oldvalue = this._left;
            this._left = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.handleContainerData(this, val, "left");
            if(this.isImageOverlayWidget) {
                $KW.Image.adjustImageOverlayWidgets(this.parent);
            }
        });

        this._right = (requireFlexRTL) ? bconfig.left : bconfig.right;
        defineGetter(this, "right", function() {
            return this._right;
        });
        defineSetter(this, "right", function(val) {
            var oldvalue = this._right;
            this._right = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.handleContainerData(this, val, "right");
            if(this.isImageOverlayWidget) {
                $KW.Image.adjustImageOverlayWidgets(this.parent);
            }
        });

        this.isFlexPositionPropertiesMirrored = requireFlexRTL;

        this._top = bconfig.top;
        defineGetter(this, "top", function() {
            return this._top;
        });
        defineSetter(this, "top", function(val) {
            var oldvalue = this._top;
            this._top = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.handleContainerData(this, val, "top");
            if(this.isImageOverlayWidget) {
                $KW.Image.adjustImageOverlayWidgets(this.parent);
            }
        });

        this._bottom = bconfig.bottom;
        defineGetter(this, "bottom", function() {
            return this._bottom;
        });
        defineSetter(this, "bottom", function(val) {
            var oldvalue = this._bottom;
            this._bottom = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.handleContainerData(this, val, "bottom");
            if(this.isImageOverlayWidget) {
                $KW.Image.adjustImageOverlayWidgets(this.parent);
            }
        });

        this._width = bconfig.width;
        defineGetter(this, "width", function() {
            return this._width;
        });
        defineSetter(this, "width", function(val) {
            var oldvalue = this._width;
            this._width = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.handleContainerData(this, val, "width");
            if(this.isImageOverlayWidget) {
                $KW.Image.adjustImageOverlayWidgets(this.parent);
            }
        });

        this._height = bconfig.height;
        defineGetter(this, "height", function() {
            return this._height;
        });
        defineSetter(this, "height", function(val) {
            var oldvalue = this._height;
            this._height = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.handleContainerData(this, val, "height");
            if(this.isImageOverlayWidget) {
                $KW.Image.adjustImageOverlayWidgets(this.parent);
            }
        });

        this.minwidth = bconfig.minWidth;
        defineGetter(this, "minWidth", function() {
            return this.minwidth;
        });
        defineSetter(this, "minWidth", function(val) {
            var oldvalue = this.minwidth;
            this.minwidth = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.handleContainerData(this, val, "minWidth");
            if(this.isImageOverlayWidget) {
                $KW.Image.adjustImageOverlayWidgets(this.parent);
            }
        });

        this.maxwidth = bconfig.maxWidth;
        defineGetter(this, "maxWidth", function() {
            return this.maxwidth;
        });
        defineSetter(this, "maxWidth", function(val) {
            var oldvalue = this.maxwidth;
            this.maxwidth = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.handleContainerData(this, val, "maxWidth");
            if(this.isImageOverlayWidget) {
                $KW.Image.adjustImageOverlayWidgets(this.parent);
            }
        });

        this.minheight = bconfig.minHeight;
        defineGetter(this, "minHeight", function() {
            return this.minheight;
        });
        defineSetter(this, "minHeight", function(val) {
            var oldvalue = this.minheight;
            this.minheight = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.handleContainerData(this, val, "minHeight");
            if(this.isImageOverlayWidget) {
                $KW.Image.adjustImageOverlayWidgets(this.parent);
            }
        });

        this.maxheight = bconfig.maxHeight;
        defineGetter(this, "maxHeight", function() {
            return this.maxheight;
        });
        defineSetter(this, "maxHeight", function(val) {
            var oldvalue = this.maxheight;
            this.maxheight = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.handleContainerData(this, val, "maxHeight");
            if(this.isImageOverlayWidget) {
                $KW.Image.adjustImageOverlayWidgets(this.parent);
            }
        });

        this.centerx = bconfig.centerX;
        defineGetter(this, "centerX", function() {
            return this.centerx;
        });
        defineSetter(this, "centerX", function(val) {
            var oldvalue = this.centerx;
            this.centerx = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.handleContainerData(this, val, "centerX");
            if(this.isImageOverlayWidget) {
                $KW.Image.adjustImageOverlayWidgets(this.parent);
            }
        });

        this.centery = bconfig.centerY;
        defineGetter(this, "centerY", function() {
            return this.centery;
        });
        defineSetter(this, "centerY", function(val) {
            var oldvalue = this.centery;
            this.centery = val;
            $KW.FlexUtils.setLayoutConfig(this, val, oldvalue);
            $KW.FlexUtils.handleContainerData(this, val, "centerY");
            if(this.isImageOverlayWidget) {
                $KW.Image.adjustImageOverlayWidgets(this.parent);
            }
        });

        this.zindex = bconfig.zIndex || 1;
        defineGetter(this, "zIndex", function() {
            return this.zindex;
        });
        defineSetter(this, "zIndex", function(val) {
            if(this.zindex !== val) {
                this.zindex = val;
                kony.model.updateView(this, "zindex", val);
                $KU.checkAndReCalculateTopFlexModal(this);
            }
        });

        this.dolayout = bconfig.doLayout;
        defineGetter(this, "doLayout", function() {
            return this.dolayout;
        });
        defineSetter(this, "doLayout", function(val) {
            this.dolayout = val;
        });

        this._opacity = (typeof bconfig.opacity == "undefined") ? 1 : bconfig.opacity;
        defineGetter(this, "opacity", function() {
            return this._opacity;
        });
        defineSetter(this, "opacity", function(val) {
            this._opacity = val;
            kony.model.updateView(this, "opacity", val);
        });

        this._transform = bconfig.transform;
        defineGetter(this, "transform", function() {
            return this._transform;
        });
        defineSetter(this, "transform", function(val) {
            this._transform = val;
            kony.model.updateView(this, "transform", val);
        });

        this.anchorpoint = bconfig.anchorPoint;
        defineGetter(this, "anchorPoint", function() {
            return this.anchorpoint;
        });
        defineSetter(this, "anchorPoint", function(val) {
            anchorpoint = val;
            kony.model.updateView(this, "anchorpoint", val);
        });

        this.backgroundcolor = bconfig.backgroundColor;
        defineGetter(this, "backgroundColor", function() {
            return this.backgroundcolor;
        })
        defineSetter(this, "backgroundColor", function(val) {
            this.backgroundcolor = val;
            kony.model.updateView(this, "backgroundcolor", val);
        });

        this.borderwidth = bconfig.borderWidth;
        defineGetter(this, "borderWidth", function() {
            return this.borderwidth;
        })
        defineSetter(this, "borderWidth", function(val) {
            this.borderwidth = val;
            kony.model.updateView(this, "borderwidth", val);
        });


        this.bordercolor = bconfig.borderColor;
        defineGetter(this, "borderColor", function(val) {
            return this.bordercolor;
        })
        defineSetter(this, "borderColor", function(val) {
            this.bordercolor = val;
            kony.model.updateView(this, "bordercolor", val);
        });

        this.cornerradius = bconfig.cornerRadius;
        defineGetter(this, "cornerRadius", function() {
            return this.cornerradius;
        })
        defineSetter(this, "cornerRadius", function(val) {
            this.cornerradius = val;
            kony.model.updateView(this, "cornerradius", val);
        });

        defineGetter(this, "shadowColor", function() {
            return this.shadowcolor;
        });

        defineSetter(this, "shadowColor", function(val) {
            this.shadowcolor = val;
            kony.model.updateView(this, "shadowcolor", val);
        });

        defineGetter(this, "shadowRadius", function() {
            return this.shadowradius;
        });

        defineSetter(this, "shadowRadius", function(val) {
            this.shadowradius = val;
            kony.model.updateView(this, "shadowradius", val);
        });

        defineGetter(this, "shadowOffset", function() {
            return this.shadowoffset;
        });

        defineSetter(this, "shadowOffset", function(val) {
            this.shadowoffset = val;
            kony.model.updateView(this, "shadowoffset", val);
        });

       this.flexblur = bconfig.blur || {
            enabled: false,
            value: 0
        };
        defineGetter(this, "blur", function() {
            return this.flexblur;
        });
        defineSetter(this, "blur", function(val) {
            var oldVal = this.flexblur;
            this.flexblur = val;
            if(val && (val.enabled == undefined || val.value == undefined)) {
                this.flexblur = oldVal;
                throw new KonyError(102, "Exception", "Invalid input.");
            }
            kony.model.updateView(this, "flexblur", val, oldVal);
        });

        kony.ui.Widget.prototype.setGetterSetter.call(this);

        
        this.onTouchStart = bconfig.onTouchStart;
        this.onTouchMove = bconfig.onTouchMove;
        this.onTouchEnd = bconfig.onTouchEnd;
        this.onscrollwidgetposition = bconfig.onScrollWidgetPosition;
    },

    ContainerWidget: function(bconfig, lconfig, pspconfig) {
        kony.ui.ContainerWidget.baseConstructor.call(this, bconfig, lconfig, pspconfig);

        if(this.name != "kony.ui.FlexContainer")
            this.orientation = bconfig.orientation || constants.BOX_LAYOUT_HORIZONTAL;
        this.percent = (lconfig.percent === undefined) ? true : lconfig.percent;
        if(this.percent === false) this.widgetdirection = lconfig.layoutAlignment; 
        this.isContainerWidget = true;
        
        this.ownchildrenref = [];
        this.children = [];
    },

    GroupWidget: function(bconfig, lconfig, pspconfig) {
        kony.ui.GroupWidget.baseConstructor.call(this, bconfig, lconfig, pspconfig);
        this.onselection = bconfig.onSelection;
        this.masterdata = bconfig.masterData;
        this.masterdatamap = bconfig.masterDataMap;
        this.selectedkeyvalue = null;
        this.selectedkey = bconfig.selectedKey || null;
        kony.ui.GroupWidget.prototype.setGetterSetter.call(this);
    },

    createAnimation: function(animDef) {
        
        $KU.logExecuting('kony.ui.createAnimation');
        $KU.logExecutingWithParams('kony.ui.createAnimation', animDef);
        $KU.logExecutingFinished('kony.ui.createAnimation');
        return new $KW.Animator(animDef);
    },

    makeAffineTransform: function() {
        
        $KU.logExecuting('kony.ui.makeAffineTransform');
        $KU.logExecutingWithParams('kony.ui.makeAffineTransform');
        $KU.logExecutingFinished('kony.ui.makeAffineTransform');
        return new $KW.Transform();
    },

    enableCapturingAnimationRuntimeData: function() {
        $KG.appbehaviors["captureAniamtionData"] = true;
    },

    disableCapturingAnimationRuntimeData: function() {
        $KG.appbehaviors["captureAniamtionData"] = false;
    }

};

kony.inherits(kony.ui.GroupWidget, kony.ui.Widget);
kony.inherits(kony.ui.ContainerWidget, kony.ui.Widget);


kony.ui.Widget.prototype.setVisibility = function(isvisible) {
    $KW.APIUtils.setvisibility(this, isvisible);
    $KU.checkAndReCalculateTopFlexModal(this);
};

kony.ui.Widget.prototype.setFocus = function() {
    $KW.APIUtils.setfocus(this);
};

kony.ui.Widget.prototype.setEnabled = function(isenabled) {
    $KW.APIUtils.setenabled(this, isenabled);
};

kony.ui.Widget.prototype.addGestureRecognizer = function(gesturetype, setupparams, gesturehandler) {
    return($KW.Widget.addgesturerecognizer(this, gesturetype, setupparams, gesturehandler));
};

kony.ui.Widget.prototype.setGestureRecognizer = function(gesturetype, setupparams, gesturehandler) {
    return($KW.Widget.setgesturerecognizer(this, gesturetype, setupparams, gesturehandler));
};

kony.ui.Widget.prototype.removeGestureRecognizer = function(gesturetype) {
    $KW.Widget.removegesturerecognizer(this, gesturetype);
};


kony.ui.Widget.prototype.toString = function() {
    return JSON.stringify(this, $KU.jsonReplacer);
};

kony.ui.Widget.prototype.removeFromParent = function() {
    
    if(!this.parent)
        return;
    if(this.parent.id == this.pf)
        formWidgetExtendRemove.call(this.parent, this);
    else
        boxWidgetExtendRemove.call(this.parent, this);
};

kony.ui.Widget.prototype.setWidgetFrame = function(frame, wNode) {
    $KW.Utils.setWidgetFrame(this, frame, wNode);
};

kony.ui.Widget.prototype.animate = function(animInstance, animationConfig, animCallbackConfig) {
    if(animInstance) {
        
        animInstance.animate && animInstance.animate(this, animationConfig, animCallbackConfig);
    }
};

kony.ui.Widget.prototype.getPreferredSize = function(frame) {
    return $KW.FlexUtils.getPreferredSize(this, frame);
};

kony.ui.Widget.prototype.convertPointToWidget = function(point, toWidget) {
    return $KW.FlexUtils.convertPointToWidget(this, point, toWidget);
};

kony.ui.Widget.prototype.convertPointFromWidget = function(point, fromWidget) {
    return $KW.FlexUtils.convertPointFromWidget(this, point, fromWidget);
};


kony.ui.Widget.prototype.clone = function(newidPrefix) {
    return owl.deepCopy(this, undefined, newidPrefix || "");
};


kony.ui.Widget.prototype.unregisterForPeekandPop
kony.ui.Widget.prototype.setOnPop =
    kony.ui.Widget.prototype.setOnPeek =
    kony.ui.Widget.prototype.registerForPeekandPop =
    kony.ui.Widget.prototype.setBadge =
    kony.ui.Widget.prototype.getBadge = function() {
        kony.web.logger("warn", "This method is not supported in SPA");
    };

kony.ui.Widget.prototype.setGetterSetter = function() {
    defineGetter(this, "contentAlignment", function() {
        return this.contentalignment;
    });
    defineSetter(this, "contentAlignment", function(val) {
        var oldvalue = this.contentalignment;
        this.contentalignment = val;
        kony.model.updateView(this, "contentalignment", val, oldvalue);
    });

    defineGetter(this, "containerWeight", function() {
        return this.containerweight;
    });
    defineSetter(this, "containerWeight", function(val) {
        var oldvalue = this.containerweight;
        this.containerweight = val;
        kony.model.updateView(this, "containerweight", val, oldvalue);
    });

    defineGetter(this, "focusSkin", function() {
        return this.focusskin;
    });
    defineSetter(this, "focusSkin", function(val) {
        var oldvalue = this.focusskin;
        this.focusskin = val;
        kony.model.updateView(this, "focusskin", val, oldvalue);
    });
    defineGetter(this, "isVisible", function() {
        return this.isvisible;
    });
    defineSetter(this, "isVisible", function(val) {
        var oldValue = this.isvisible;
        this.isvisible = val;
        if(oldValue != val) {
            kony.model.updateView(this, "isvisible", val);
            $KU.checkAndReCalculateTopFlexModal(this);
        }
    });

    defineGetter(this, "blockedUISkin", function() {
        return this.blockeduiskin;
    });
    defineSetter(this, "blockedUISkin", function(val) {
        this.blockeduiskin = val;
    });

    defineGetter(this, "onClick", function() {
        return this.onclick;
    });

    defineSetter(this, "onClick", function(val) {
        this.onclick = val;
    });

    defineGetter(this, "onTouchStart", function() {
        return this.ontouchstart;
    });

    defineSetter(this, "onTouchStart", function(val) {
        this.ontouchstart = val;
        kony.model.updateView(this, "touchstart", val);
    });

    defineGetter(this, "onScrollWidgetPosition", function() {
        return this.onscrollwidgetposition;
    });

    defineSetter(this, "onScrollWidgetPosition", function(val) {
        this.onscrollwidgetposition = val;
    });

    defineGetter(this, "onTouchMove", function() {
        return this.ontouchmove;
    });

    defineSetter(this, "onTouchMove", function(val) {
        this.ontouchmove = val;
        kony.model.updateView(this, "touchmove", val);
    });

    defineGetter(this, "onTouchEnd", function() {
        return this.ontouchend;
    });

    defineSetter(this, "onTouchEnd", function(val) {
        this.ontouchend = val;
        kony.model.updateView(this, "touchend", val);
    });
};


kony.ui.ContainerWidget.prototype.add = function(widgetarray) {
    containerWidgetExtendAdd.call(this, widgetarray);
};

kony.ui.ContainerWidget.prototype.addAt = function(widgetref, index) {
    containerWidgetExtendAddAt.call(this, widgetref, index);
};

kony.ui.ContainerWidget.prototype.remove = function(widgetref) {
    containerWidgetExtendRemove.call(this, widgetref);
};

kony.ui.ContainerWidget.prototype.removeAt = function(index) {
    return containerWidgetExtendRemoveAt.call(this, index);
};

kony.ui.ContainerWidget.prototype.removeAll = function(index) {
    return containerWidgetExtendRemoveAll.call(this, index);
};

kony.ui.ContainerWidget.prototype.widgets = function() {
    return this.ownchildrenref;
};


kony.ui.ContainerWidget.prototype.setparent = function(widgetarray) {
    containerWidgetExtendSetParent.call(this, widgetarray);
};

kony.ui.ContainerWidget.prototype.createhierarchy = function(widgetarray) {
    containerWidgetExtendCreateHierarchy.call(this, widgetarray);
};

kony.ui.ContainerWidget.prototype.removeReferences = function(widgetref) {
    containerWidgetExtendRemoveReferences.call(this, widgetref);
};

kony.ui.GroupWidget.prototype.setGetterSetter = function() {
    defineGetter(this, "onSelection", function() {
        return this.onselection;
    });
    defineSetter(this, "onSelection", function(val) {
        this.onselection = val;
    });

    defineGetter(this, "masterData", function() {
        return this.masterdata;
    });
    defineSetter(this, "masterData", function(val) {
        this.masterdata = val;
        $KW[this.wType]["updateView"](this, "masterdata", val);
    });

    defineGetter(this, "masterDataMap", function() {
        return this.masterdatamap;
    });
    defineSetter(this, "masterDataMap", function(val) {
        this.masterdatamap = val;
        $KW[this.wType]["updateView"](this, "masterdatamap", val);
    });

    defineGetter(this, "selectedKey", function() {
        return this.selectedkey;
    });
    defineSetter(this, "selectedKey", function(val) {
        this.selectedkey = val;
        $KW[this.wType]["updateView"](this, "selectedkey", val);
    });

    
    defineGetter(this, "selectedKeyValue", function() {
        return this.selectedkeyvalue;
    });
    defineSetter(this, "selectedKeyValue", function() {});

};

_konyConstNS = IndexJL ? konyLua : kony.ui;
