kony.ui.KMasterTemplate = function(bconfig, lconfig, pspconfig, template) {
    var args = [];
    if(arguments.length < 3) {
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("UserWidget"));
        args.push(bconfig);
    } else {
        args.push(bconfig);
        args.push(lconfig);
        args.push(pspconfig);
    }

    var wModel = _kony.mvc.initializeMasterController(template, bconfig.id, args);

    var requireFlexRTL = $KW.FlexUtils.shouldApplyRTL(wModel, "flexPosition");
    for(var prop in bconfig) {
        if(requireFlexRTL) {
            if(prop == "left") {
                wModel["right"] = bconfig["left"];
            } else if(prop == "right") {
                wModel["left"] = bconfig["right"];
            } else {
                wModel[prop] = bconfig[prop];
            }
        } else {
            wModel[prop] = bconfig[prop];
        }
    }
    wModel.isMaster = true;
    
    if(wModel.children) {
        for(var i = 0; i < wModel.children.length; i++) {
            var childModel = wModel[wModel.children[i]];
            updateImmediateMasterToChilds(childModel, wModel);
        }
    }
    _kony.mvc.setMasterContract(wModel, wModel.id, template);
    return wModel;
};

kony.ui.KComponentTemplate = function(bconfig, lconfig, pspconfig, template) {
    var args = [];
    if(arguments.length < 3) {
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("KComponent"));
        args.push(bconfig);
    } else {
        args.push(bconfig);
        args.push(lconfig);
        args.push(pspconfig);
    }
    var userWidgetinstance = new kony.ui.KComponent(bconfig, lconfig, pspconfig);
    var userWidgetobj = _kony.mvc.initializeMasterController(template, userWidgetinstance.id, args);
    var requireFlexRTL = $KW.FlexUtils.shouldApplyRTL(userWidgetobj, "flexPosition");
    var doNotOverrideProps = ['preShow', 'postShow', 'destroy', 'onHide']; 

    for(var prop in bconfig) {
        if(doNotOverrideProps.indexOf(prop) == -1) {
            if(requireFlexRTL) {
                if(prop == "left") {
                    userWidgetobj["right"] = bconfig["left"]; 
                } else if(prop == "right") {
                    userWidgetobj["left"] = bconfig["right"];
                } else {
                    userWidgetobj[prop] = bconfig[prop];
                }
            } else {
                userWidgetobj[prop] = bconfig[prop];
            }
        }
	}
    userWidgetobj['height'] = bconfig['height']; 
    userWidgetobj._userWidget = true;
    userWidgetobj.isMaster = true;
    userWidgetinstance.userWidgetProxyObject = userWidgetobj;
    userWidgetinstance._konyControllerName = userWidgetobj._konyControllerName;
    $KU.invokeAddWidgets(userWidgetobj);

    var overrideProps = ["accessibilityConfig", "margin", "padding", "skin", "left", "right", "top", "bottom", "width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight", "centerX", "centerY", "zIndex", "doLayout", "opacity", "transform", "anchorPoint", "backgroundColor", "borderWidth", "borderColor", "cornerRadius", "enableScrolling", "scrollDirection", "contentOffset", "contentSize", "contentOffsetMeasured", "contentSizeMeasured", "bounces", "allowHorizontalBounce", "allowVerticalBounce", "horizontalScrollIndicator", "verticalScrollIndicator", "pagineEnabled", "dragging", "tracking", "decelerating", "onScrollStart", "onScrollTouchReleased", "onScrolling", "onDecelerationStarted", "onScrollEnd", "layoutType", "clipBounds", "contentAlignment", "containerWeight", "focusSkin", "isVisible", "blockedUISkin", "onClick", "onTouchStart", "onTouchMove", "onTouchEnd"];
    for(var val in overrideProps) {
        (function(prop) {
            Object.defineProperty(userWidgetinstance, prop, {
                get: function() {
                    return userWidgetinstance.userWidgetProxyObject[prop];
                },
                set: function(newVal) {
                    userWidgetinstance.userWidgetProxyObject[prop] = newVal;
                }
            });
        })(overrideProps[val]);
    }

    _kony.mvc.setMasterContract(userWidgetinstance, userWidgetinstance.id, template);

    return userWidgetinstance;
};


kony.ui.KComponent = function(bconfig, lconfig, pspconfig) {

    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("KComponent"));

    kony.ui.KComponent.baseConstructor.call(this, bconfig, lconfig, pspconfig);
    this.wType = "KComponent";
    this.name = "kony.ui.KComponent";

    
    this.ownchildrenref = [];
    this.children = [];
    this.allboxes = [];

};

kony.inherits(kony.ui.KComponent, kony.ui.FlexContainer);

kony.ui.KComponent.prototype.forceLayout = function() {
    $KW.KComponent.forceLayout(this);
};
