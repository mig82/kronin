kony.model = (function() {
    
    

    var module = {
        
        update: function(model, prop, value) {
            if(model == undefined || model == null) {
                kony.print("kony.model.update:Error in Model,value is undefined or null");
                return;
            }
            if(model["wType"] == undefined || (model[prop] && model[prop]["wType"])) {
                model[prop] = value;
            } else {
                var widgetModel = model;
                var wType = widgetModel.wType;
                if(wType == "TPW") {
                    var nsArr = widgetModel.widgetName.split('.');
                    var namespace = window;
                    for(var j = 0; j < nsArr.length; j++) {
                        namespace = namespace[nsArr[j]];
                    }
                    namespace["modelChange"] && namespace["modelChange"](model, prop, value);
                } else {
                    var oldValue = widgetModel[prop];
                    $KI.i18n && $KI.i18n.checkI18nStatus(widgetModel, prop);
                    widgetModel[prop] = value;
                    this.updateView(widgetModel, prop, value, oldValue);
                }
            }
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element;
            if(widgetModel.wType == "Form")
                element = document.getElementById(widgetModel.id);
            else if(widgetModel.wType == "ScrollBox")
                element = document.getElementById(widgetModel.pf + "_" + widgetModel.id + "_parent");
            else
                element = $KU.getNodeByModel(widgetModel);

            if(widgetModel.wType == "TabPane" && widgetModel.viewtype == constants.TABPANE_VIEW_TYPE_TABVIEW)
                element = document.getElementById(widgetModel.pf + "_" + widgetModel.id + "_Body"); 

            element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);

            switch(propertyName) {
                case "onhover":
                    new $KI.HoverInit(widgetModel);
                    break;

                case "skin":
                    this.updateWidgetSkin(widgetModel, element, propertyValue, oldPropertyValue);
                    break;

                case "focusskin":
                case "rowfocusskin":
                case "activefocusskin":
                    $KW.skins.updateFocusSkin(widgetModel, widgetModel.rowfocusskin ? "rowfocusskin" : "focusskin");
                    break;

                case "isvisible":
                    $KW.APIUtils.setvisibility(widgetModel, propertyValue);
                    break;

                case "margin":
                    if(element && !$KW.FlexUtils.isFlexWidget(widgetModel)) {
                        $KW.skins.setMarginPadding(element, propertyName, widgetModel, propertyValue);
                        if(widgetModel.wType == "ScrollBox") {
                            var scrollerInstance = $KG[widgetModel.pf + "_" + widgetModel.id + "_scroller"];
                            scrollerInstance && scrollerInstance.refresh();
                        }
                    }
                    break;

                case "padding":
                    this.updateWidgetPadding(widgetModel, element, propertyValue, oldPropertyValue);
                    break;

                case "containerweight":
                    this.updateWidgetContainerWeight(widgetModel, element, propertyValue, oldPropertyValue);
                    break;

                case "containerheightreference":
                case "containerheight":
                    this.updateContainerHeight(widgetModel, element, propertyValue, oldPropertyValue);
                    break;

                case "backgroundimage":
                    $KW.Utils.updateNormalImage(widgetModel);
                    break;

                case "contentalignment":
                    this.updateWidgetContentAlignment(widgetModel, element, propertyValue, oldPropertyValue);
                    break;

                case "accessibilityConfig":
                    if(element && (widgetModel.wType == 'Link' || widgetModel.wType == 'Label'))
                        element = element.firstChild;
                    if(!element || widgetModel.wType == "RadioButtonGroup" || widgetModel.wType == "CheckBoxGroup") return;

                    $KU.addAriatoElement(element, propertyValue, widgetModel, oldPropertyValue);

                    break;

                case "zindex":
                case "opacity":
                case "transform":
                case "anchorpoint":
                case "backgroundcolor":
                case "bordercolor":
                    this.updateLayoutProps(widgetModel, propertyName, propertyValue);
                    break;

                
                case "touchstart":
                case "touchmove":
                case "touchend":
                    if(widgetModel.touches && widgetModel.touches[propertyName] && widgetModel.touches[propertyName].callback === propertyValue)
                        break;
                    $KW.Utils.removetouch(widgetModel, propertyName, false);
                    $KW.Utils.updateModelWithTouches(widgetModel, propertyName, propertyValue);
                    var element = $KW.Utils.getWidgetNode(widgetModel);
                    if(element && widgetModel.touches[propertyName]) {
                        
                        if(element.id && element.id.indexOf("_scroller") > 0) {
                            element = element.childNodes[0];
                        }
                        widgetModel.touches[propertyName]["instance"] = new $KW.touch.TouchEvents(widgetModel, element, propertyName, propertyValue);
                    }
                    break;

                case "borderwidth":
                case "cornerradius":
                    var element = $KW.Utils.getWidgetNode(widgetModel);
                    element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);
                    if(propertyName == "borderwidth")
                        element && (element.style.borderWidth = propertyValue + "px");
                    if(propertyName == "cornerradius")
                        element && (element.style.borderRadius = propertyValue + "px");
                    break;

                case "shadowcolor":
                case "shadowoffset":
                case "shadowradius":
                    this.updateShadowProps(widgetModel, propertyName);
                    break;

                case "cursortype":
                    element && this.updateWidgetCursor(widgetModel, element);
                    break;
                case "flexblur":
                    if($KW.FlexUtils.isFlexWidget(widgetModel)) {
                        if(widgetModel.wType == "FlexContainer") element = element.parentNode;

                        var blur = $KW.skins.getBlurStyle(widgetModel);

                        if(blur) {
                            blur = blur.replace('filter:', '').replace(';', '');
                            element.style.filter = blur;
                        } else {
                            element.style.removeProperty('filter');
                        }
                    }
                    break;
                case "widgetSwipeMove":
                    element && $KW.Utils.applyGesturestoDOM(widgetModel, element);
                    break;

                default:
                    var wType = (widgetModel.wType == "Tab") ? "TabPane" : widgetModel.wType;
                    var widget = $KW[wType];
                    widget["updateView"] && widget["updateView"](widgetModel, propertyName, propertyValue, oldPropertyValue);
            }
        },

        updateWidgetCursor: function(widgetModel, element) {
            var cursor = $KW.Utils.getCursorStyle(widgetModel);
            if(cursor) {
                element.style.cursor = cursor;
            }
        },

        updateShadowProps: function(widgetModel, propertyName) {
            var element = $KW.Utils.getWidgetNode(widgetModel);
            if(!element)
                return;
            element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);
            var boxStyle = $KW.Utils.getBoxShadowStyle(widgetModel);

            if($KW.FlexUtils.isFlexWidget(widgetModel))
                element.parentNode.style["box-shadow"] = boxStyle;
            else
                element.style["box-shadow"] = boxStyle;
        },

        updateLayoutProps: function(widgetModel, propertyName, propertyValue, node, animType) {
            var element = node || $KW.Utils.getWidgetNode(widgetModel);
            element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);
            switch(propertyName) {
                case "zindex":
                    if(element) {
                        if($KW.FlexUtils.isFlexWidget(widgetModel))
                            element.parentNode.style.zIndex = propertyValue;
                        else
                            element.style.zIndex = propertyValue;
                    }
                    break;

                case "opacity":
                    if(element) {
                        if($KW.FlexUtils.isFlexWidget(widgetModel))
                            element.parentNode.style.opacity = propertyValue;
                        else
                            element.style.opacity = propertyValue;
                    }
                    break;

                case "transform":
                    if(element) {
                        var style = $KW.animUtils.applyTransform(widgetModel, propertyValue);
                        var target;
                        if(animType == 'segmentRow')
                            target = element;
                        else {
                            if($KW.FlexUtils.isFlexWidget(widgetModel))
                                target = element.parentNode;
                            else
                                target = element;
                        }

                        target.style[vendor + "Transform"] = style;
                        target.style["transform"] = style;
                    }
                    break;

                case "anchorpoint":
                    if(element) {
                        var target;
                        if(animType == 'segmentRow')
                            target = element;
                        else {
                            if($KW.FlexUtils.isFlexWidget(widgetModel))
                                target = element.parentNode;
                            else
                                target = element;
                        }
                        if(propertyValue) {
                            if((propertyValue.x < 0) || (propertyValue.x > 1) || (propertyValue.y < 0) || (propertyValue.y > 1))
                                return;
                            target.style[vendor + "TransformOrigin"] = (propertyValue.x * 100) + "% " + (propertyValue.y * 100) + "% ";
                        } else {
                            target.style[vendor + "TransformOrigin"] = "50% 50%";
                        }
                    }
                    break;

                case "backgroundcolor":
                case "bordercolor":
                    var validate = $KW.skins.validateHexValue(propertyValue);
                    if(validate) {
                        var result = $KW.skins.convertHexValuetoRGBA(propertyValue);
                    }
                    var element = $KW.Utils.getWidgetNode(widgetModel);
                    element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);
                    if(propertyName == "backgroundcolor")
                        element && (element.style.background = result);
                    else if(propertyName == "bordercolor")
                        element && (element.style.borderColor = result);
                    break;
            }
        },

        
        updateWidgetSkin: function(widgetModel, element, propertyValue, oldPropertyValue) {
            if(widgetModel.wType == "Form") {
                var formNode;
                if(!$KG.needScroller && !$KU.isBlackBerryNTH)
                    document.body.className = propertyValue || "";
                else if($KU.isBlackBerryNTH)
                    formNode = document.getElementById(widgetModel.id + "_container");
                else
                    formNode = document.getElementById(widgetModel.id + "_scroller");

                if(formNode) {
                    $KU.removeClassName(formNode, oldPropertyValue);
                    $KU.addClassName(formNode, propertyValue);
                }
            } else if(widgetModel.wType == "Tab")
                element = $KU.getElementById(widgetModel.pf + '_' + widgetModel.id + '_Body');
            else if(element && widgetModel.wType == "Image")
                element = element.parentNode;
            if(element) {
                var widgets = ["Phone", "Switch", "ScrollBox"];
                var wType = widgetModel.wType;
                if((widgets.indexOf(wType)) == -1) {
                    var defaultSkin = $KW.skins.getDefaultSkin(widgetModel);
                    $KU.removeClassName(element, oldPropertyValue || defaultSkin);
                    $KU.addClassName(element, propertyValue || defaultSkin);

                    if(widgetModel.wType == "Line")
                        $KW.Line.applySkin(element, propertyValue);
                    if(widgetModel.wType == "Calendar")
                        element.children[0].style.color = "inherit";

                    if($KW.FlexUtils.isFlexWidget(widgetModel) && !(widgetModel.wType == 'FlexContainer' && !widgetModel.clipbounds)) {
                        element = $KW.Utils.getWidgetNodeFromNodeByModel(widgetModel, element).parentNode;
                        if(!element) return;
                        $KU.removeClassName(element, oldPropertyValue || defaultSkin);
                        $KU.addClassName(element, propertyValue || defaultSkin);
                    }
                } else {
                    $KW.skins.updateDOMSkin(widgetModel, propertyValue, oldPropertyValue, element);
                }
            }

            
            if(widgetModel.wType == "Label") {
                $KW.Label.updateView(widgetModel, "linespacing", widgetModel.linespacing);
            }
        },

        
        updateWidgetPadding: function(widgetModel, element, propertyValue, oldPropertyValue) {
            if($KW.FlexUtils.isFlexContainer(widgetModel) || widgetModel.wType == 'Slider' || widgetModel.wType == 'Switch')
                return;
            var propertyName = "padding";
            if(widgetModel.wType == "Segment") {
                if(widgetModel.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW && element) {
                    var segRows = element.childNodes[0].childNodes;
                    
                    for(var i = IndexJL; i < segRows.length; i++) {
                        element = segRows[i].childNodes[0];
                        element.style[propertyName] = $KU.joinArray(propertyValue, "% ") + "%";
                    }
                    return; 
                }
            }
            if(widgetModel.wType == "DataGrid" && element) {
                var isFlexWidget = $KW.FlexUtils.isFlexWidget(widgetModel);
                var rows = element.rows;
                for(var i = 0; i < rows.length; i++) {
                    for(var j = 0; j < rows[i].cells.length; j++) {
                        if(isFlexWidget)
                            $KW.FlexUtils.setPaddingByParent(widgetModel, rows[i].cells[j]);
                        else
                            rows[i].cells[j].style[propertyName] = $KU.joinArray(propertyValue, "% ") + "%";
                    }
                }
                return;
            }

            if(widgetModel.wType == "Image" && element)
                element = element.parentNode;
            if(element) {
                if($KW.FlexUtils.isFlexWidget(widgetModel))
                    $KW.FlexUtils.setPaddingByParent(widgetModel, element);
                else
                    element.style[propertyName] = $KU.joinArray(propertyValue, "% ") + "%";

                if(widgetModel.wType == "ScrollBox") { 
                    
                    if(widgetModel.scrollDirection == constants.SCROLLBOX_SCROLL_VERTICAL || widgetModel.scrollDirection == constants.SCROLLBOX_SCROLL_BOTH)
                        $KU.setScrollHeight(widgetModel);
                }
                if(widgetModel.wType == "VBox" || widgetModel.wType == "HBox") { 
                    var currentMargin = element.style["margin"];
                    
                    element.style["margin"] = "1px";
                    setTimeout(function() {
                        element.style["margin"] = currentMargin;
                    }, 10);

                }
            }
        },

        
        updateWidgetContainerWeight: function(widgetModel, element, propertyValue, oldPropertyValue) {
            if(element) {
                element = element.parentNode;
                if(widgetModel.wType == "Image") {
                    element = element.parentNode; 
                }
                if(widgetModel.wType == "Slider") {
                    element = element.parentNode.parentNode; 
                }
                if(widgetModel.wType == "HStrip") {
                    if(element.parentNode.parentNode.parentNode && element.parentNode.parentNode.parentNode.className.indexOf("kcell") != -1)
                        element = element.parentNode.parentNode.parentNode;
                }
                $KU.removeClassName(element, "kwt" + oldPropertyValue);
                $KU.addClassName(element, "kwt" + propertyValue);

                
                if($KG.appbehaviors.adherePercentageStrictly == true) {
                    var parentmodel = module.getWidgetModel(widgetModel.pf, widgetModel.parent && widgetModel.parent.id);
                    if(parentmodel && parentmodel.wType == "HBox") {
                        $KU.removeClassName(element.parentNode.lastChild, "kwt" + parentmodel.dummyNodeWidth);
                        parentmodel.dummyNodeWidth = $KW.HBox.getExtraNodeWidth(parentmodel);
                        $KU.addClassName(element.parentNode.lastChild, "kwt" + parentmodel.dummyNodeWidth);

                    }
                }
                if(widgetModel.wType == "HStrip") {
                    var row = element.parentNode;
                    if(row.childNodes.length == 1)
                        cell.style.display = "inline-block"; 
                } else if(widgetModel.wType == "Switch") {
                    (function(parentForm) {
                        var delay = window.setTimeout(function() {
                            $KW.Switch.adjustSwitchWidth(parentForm);
                            $KW.Switch.adjustSwitchHeight(parentForm);
                            window.clearTimeout(delay);
                            delete delay;
                        }, 0);
                    })(widgetModel.pf);
                } else if(widgetModel.wType == "ScrollBox") {
                    var parentId = element.childNodes[0].id;
                    var scrollboxId = parentId.substring(0, parentId.lastIndexOf("_"));
                    $KW.ScrollBox.adjustArrowPosition(scrollboxId);
                } else if(widgetModel.wType == "Slider") {
                    $KW[widgetModel.wType]["updateView"](widgetModel, "containerweight");
                }
            }
            var formModel = $KG.allforms[widgetModel.pf];
            
            if(!formModel)
                return;
            var parentModel = widgetModel.parent;
            if(parentModel && parentModel.wType == "ScrollBox") {
                $KW.ScrollBox.recalculateScrollBoxWidth(parentModel);
            }
        },

        updateContainerHeight: function(widgetModel, element, propertyValue, oldPropertyValue) {
            var hasScroller = widgetModel.needScroller;
            $KU.updateScrollFlag(widgetModel);
            
            if((!hasScroller || !widgetModel.needScroller) && widgetModel.screenLevelWidget) {
                var formModel = $KG.allforms[widgetModel.pf];
                $KW.Form.addChild(formModel, formModel.ownchildrenref, true);
            }
            var node = $KU.getNodeByModel(widgetModel);

            if(node) {
                if(widgetModel.wType == "Popup") {
                    var conatiner = document.getElementById(widgetModel.id + "_container");
                    var group = $KU.getElementById(widgetModel.id + "_group");
                    var scroller = $KU.getElementById(widgetModel.id + "_scroller");
                    if(!widgetModel.ismodal) {
                        if(widgetModel.containerheight || widgetModel.containerheight == 0) {
                            group.style.height = '100%';
                            scroller.style.overflow = 'hidden';
                        } else {
                            group.style.height = 'auto';
                            scroller.style.overflow = 'visible';
                        }
                    }
                    node = widgetModel.ismodal ? group : conatiner;
                }
                $KU.setScrollHeight(widgetModel, node);
                if(widgetModel.needScroller && !$KG[node.id + "_scroller"] && widgetModel.wType != 'Map') {
                    var node = (widgetModel.wType == "Popup") ? $KU.getElementById(widgetModel.id + "_scroller") : node.parentNode.parentNode;
                    $KW.Scroller.initialize([node], "ScrollBox");
                }
                if(widgetModel.wType == "Popup") {
                    $KW.Popup.adjustPopupDimensions(widgetModel, conatiner.childNodes[1] || conatiner.childNodes[0]);
                }
            }
        },

        updateWidgetContentAlignment: function(widgetModel, element, propertyValue, oldPropertyValue) {
            var cAlign = $KW.skins.getContentAlignment(widgetModel);
            if(element) {
                if(['Calendar', 'Label'].indexOf(widgetModel.wType) != -1 && $KW.FlexUtils.isFlexWidget(widgetModel)) {
                    var oldAlignClass = $KW.skins.getFlexContentAlignmentSkin(oldPropertyValue);
                    var newAlignClass = $KW.skins.getFlexContentAlignmentSkin(propertyValue);
                    if($KU.hasClassName(element, oldAlignClass)) {
                        $KU.removeClassName(element, oldAlignClass);
                    }
                    $KU.addClassName(element, newAlignClass);
                } else {
                    element.style.textAlign = cAlign;
                }
            }
        },

        
        getWidgetModel: function(formID, widgetID, immediateParentID) {
            if(!formID)
                return null;

            var formModel = module.getWidgetRef(formID); 
            if(immediateParentID && formModel) {
                if(widgetID) {
                    var widgetModel = formModel[immediateParentID];
                    return widgetModel[widgetID];
                }
            }

            if(widgetID && formID != widgetID) {
                var widgetModel = formModel[widgetID];
                return widgetModel;
            }

            return formModel;
        },

        getWidgetRef: function(widgetID) {
            var obj = $KG.allforms[widgetID];
            if(obj && ["Form", "Form2"].contains(obj.wType))
                return obj;
            else
                return($KG[widgetID] || window[widgetID] || $KG.allTemplates[widgetID]);
        }
    };


    return module;
}());
