
$KW.FlexUtils = (function() {
    
    

    var module = {
        
        
        getPreferredSize: function(widgetModel, conf) {
            var preferredSize = {
                width: 0,
                height: 0
            };
            var element = $KW.Utils.getWidgetNode(widgetModel);
            if(element && conf) {
                preferredSize.width = this.getPreferredWidth(widgetModel, element, conf.width);
                preferredSize.height = this.getPreferredHeight(widgetModel, element, conf.height);
                var wrapper = element.parentNode;
                wrapper.style.maxWidth = wrapper.style.maxHeight = '';
            }
            return preferredSize;
        },

        getPreferredWidth: function(widgetModel, element, maxWidth, updateUI) {
            var wrapper = element.parentNode;
            var initialWidth = wrapper.style.width;

            if(widgetModel.wType == 'Label')
                element = element.childNodes[0];

            var defaultWidth = module.getDefaultWidth(widgetModel);
            wrapper.style.width = defaultWidth ? defaultWidth : 'auto';

            if(maxWidth != Number.MAX_VALUE)
                wrapper.style.maxWidth = maxWidth + 'px';

            if(!defaultWidth) { 
                var initialWrap = element.style.whiteSpace;
                element.style.whiteSpace = 'nowrap';
                element.style.whiteSpace = (wrapper.offsetWidth >= Math.floor(maxWidth)) ? 'pre-wrap' : 'nowrap';
            }

            var finalWidth = wrapper.offsetWidth;
            if(updateUI == false) {
                wrapper.style.width = initialWidth;
                if(!defaultWidth)
                    element.style.whiteSpace = initialWrap;
            }
            return finalWidth;
        },

        getPreferredHeight: function(widgetModel, element, maxHeight, updateUI) {
            var imgWidth, imgHeight, flexHeight;
            var wrapper = element.parentNode;
            var initialHeight = wrapper.style.height;
            var defaultHeight = module.getDefaultHeight(widgetModel);
            if(widgetModel.wType == "Segment" && widgetModel.viewtype == constants.SEGUI_VIEW_TYPE_TABLEVIEW) {
                if(widgetModel.autogrowMode == kony.flex.AUTOGROW_HEIGHT) {
                    defaultHeight = 'auto';
                    if(maxHeight == Number.MAX_VALUE) {
                        widgetModel.needScroller = false;
                        var scrollerInstance = $KG[element.id];
                        scrollerInstance && scrollerInstance.destroy();
                    }
                }
            }
            if(widgetModel.wType == "FlexContainer" && widgetModel.autogrowMode == kony.flex.AUTOGROW_HEIGHT && widgetModel.canMeasureChildrenHeight) {
                
                widgetModel.autogrowHeight = true;
                var pModel = widgetModel.parent;
                if(pModel && pModel.autogrowHeight && pModel.canMeasureChildrenHeight)
                    return wrapper.offsetHeight;
                flexHeight = $KW.FlexLayoutEngine.getAutoGrowFlexHeight(widgetModel, element, widgetModel.widgets());
                defaultHeight =  module.getComputedPreferredHeight(widgetModel, element, flexHeight) + 'px';
            }
            wrapper.style.height = defaultHeight ? defaultHeight : "auto";

            if(widgetModel.wType == 'Image') {
                var imgNode = element.childNodes[0];
                if(updateUI == false) {
                    imgWidth = imgNode.style.width;
                    imgHeight = imgNode.style.height;
                }
                imgNode.style.height = imgNode.style.width = 'auto';
            }

            if(maxHeight != Number.MAX_VALUE)
                wrapper.style.maxHeight = maxHeight + "px";

            var finalHeight = wrapper.offsetHeight;
            if(updateUI == false) {
                if(widgetModel.wType == 'Image') {
                    imgNode.style.width = imgWidth;
                    imgNode.style.height = imgHeight;
                }
                wrapper.style.height = initialHeight;
            }
            return finalHeight;
        },

        convertPointToWidget: function(containerModel, point, toWidget) {
            var x = $KW.FlexLayoutEngine.toPointwidget(toWidget, containerModel, point.x, "x");
            var y = $KW.FlexLayoutEngine.toPointwidget(toWidget, containerModel, point.y, "y");

            return {
                "x": x.value + x.unit,
                "y": y.value + y.unit
            };
        },

        convertPointFromWidget: function(containerModel, point, fromWidget) {
            var x = $KW.FlexLayoutEngine.toPointwidget(containerModel, fromWidget, point.x, "x");
            var y = $KW.FlexLayoutEngine.toPointwidget(containerModel, fromWidget, point.y, "y");

            return {
                "x": x.value + x.unit,
                "y": y.value + y.unit
            };
        },

        
        setFlexContainerStyle: function(flexModel, flexNode) {
            var value, unit, parentNode, containerModel, viewportHeight;
            var width = flexModel.width;

            width = $KU.isValidCSSLength(width) ? width : module.getDefaultWidth(flexModel, false);
            var parentModel = flexModel.parent;

            
            var containerId = (flexModel.wType == 'FlexContainer') ? flexNode.childNodes[0].getAttribute("kcontainerID") : '';

            if(!parentModel && (flexNode.dataObj || containerId)) {
                if(containerId) {
                    containerModel = $KW.Utils.getContainerModelById(flexNode, containerId);
                    parentModel = containerModel.parent;
                } else {
                    containerModel = flexNode.dataObj.containerModel;
                    parentModel = containerModel.parent;
                }
                parentNode = $KW.Utils.getWidgetNode(containerModel);
            } else if(!parentModel) { 
                parentNode = flexNode.parentNode;
                if(flexModel.isheader) {
                    viewportHeight = $KU.getWindowHeight();
                }
            } else
                parentNode = $KW.Utils.getWidgetNode(parentModel);

            if(!parentNode)
                return;

            if(parentModel && parentModel.wType == 'TabPane' && module.isFlexWidget(parentModel)) {
                containerModel = parentModel;
                parentModel = parentModel.parent;
            }

            var node = flexNode;

            if(parentModel && width) {
                var obj = module.getValueAndUnit(flexModel, width);
                value = obj.value;
                unit = obj.unit;
                if(unit == kony.flex.PERCENTAGE) {
                    value = (value * parentNode.offsetWidth) / 100;
                }

                if(parentModel.percent == false || (containerModel && containerModel.wType == "CollectionView")) {
                    node.style.width = value + 'px';
                    module.updateWidthOnFrame(flexModel, value);
                }
                else if(flexModel.hexpand == false) {
                    var targetParentNode = node.parentNode;
                    
                    if(targetParentNode.tagName == 'LI') {
                        targetParentNode = targetParentNode.parentNode.parentNode;
                    }
                    var delta = Math.abs(value - targetParentNode.offsetWidth);
                    
                    if(value <= targetParentNode.offsetWidth || delta == 1) {
                        node.style.width = value + 'px';
                        module.updateWidthOnFrame(flexModel, value);
                    }
                }
            }

            var height = flexModel.height;
            if(!$KU.isValidCSSLength(height)) {
                
                if(flexModel.wType == 'FlexContainer' && flexModel.autogrowMode == kony.flex.AUTOGROW_HEIGHT) {
                    flexModel.layoutModel = {};
                    flexModel.autogrowHeight = true;
                    height = this.getComputedPreferredHeight(flexModel, flexNode, $KW.FlexLayoutEngine.getAutoGrowFlexHeight(flexModel, flexNode)) + 'dp';
                } else
                    height = module.getDefaultHeight(flexModel, false);
            }

            if(height) {
                var obj = module.getValueAndUnit(flexModel, height);
                value = obj.value;
                unit = obj.unit;
                if(unit == kony.flex.PERCENTAGE) {
                    if(containerModel && containerModel.wType == 'Segment' && containerModel.autoGrowHeight) {
                        
                        value = 100;
                    } else if(parentModel && (module.isFlexContainer(parentModel) || parentModel.wType == 'CollectionView'))
                        value = (value * parentNode.offsetHeight) / 100;
                    else if(viewportHeight)
                        value = (value * viewportHeight) / 100;
                    else
                        value = (value * parentNode.offsetWidth) / 100;
                }
                if(containerModel && containerModel.wType == 'Segment' && containerModel.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW && containerModel.needpageindicator) {
                    var calHeight = value;
                    if(unit == kony.flex.PERCENTAGE) {
                        var border = parseInt($KU.getStyle(parentNode, "border-top-width"), 10) + parseInt($KU.getStyle(parentNode, "border-bottom-width"), 10);
                        calHeight = (value - parentNode.childNodes[1].offsetHeight - border);
                    }
                    node.style.height = calHeight + 'px';

                } else if(containerModel && (containerModel.wType == 'TabPane') && (!(containerModel.viewconfig.tabViewConfig) || (containerModel.viewconfig.tabViewConfig && (containerModel.viewconfig.tabViewConfig.headerPosition == constants.TAB_HEADER_POSITION_TOP || containerModel.viewconfig.tabViewConfig.headerPosition == constants.TAB_HEADER_POSITION_BOTTOM)))) {
                    var headerHeight = 0, footerHeight = 0, footer = null;
                    if(containerModel.viewtype === 'tabview' || containerModel.viewtype === 'pageview') {
                        var header = $KU.getElementById($KW.Utils.getKMasterWidgetID(containerModel) + "_Header");
                        headerHeight = header.offsetHeight;
                        if(containerModel.viewtype === 'pageview'
                        && $KG.appbehaviors[constants.API_LEVEL] >= constants.API_LEVEL_8400) {
                            footer = $KU.getElementById($KW.Utils.getKMasterWidgetID(containerModel) + "_footer");
                            footerHeight = footer.offsetHeight;
                        }
                    } else {
                        var header = $KU.getElementById($KW.Utils.getKMasterWidgetID(flexModel) + "_Header");
                        headerHeight = header.offsetHeight;
                    }
                    node.style.height = (value - headerHeight - footerHeight) + 'px';
                } else
                    node.style.height = value + 'px';
            }

            
            if(flexModel.wType == 'FlexScrollContainer' && !$KG["nativeScroll"]) {
                var contentNode = node.childNodes[0].childNodes[0];
                contentNode.style.width = node.clientWidth + 'px';
                contentNode.style.height = node.clientHeight + 'px';
            }
            if(flexModel.wType == 'FlexContainer') {
                node.childNodes[0].style.height = '100%';
            }
        },

        getFlexLayoutStyle: function(wModel) {
            var style = [];
            
            style.push('position:absolute');
            wModel.zindex && style.push('z-index:' + wModel.zindex);
            if($KU.hasTransform) {
                if($KU.hasWebkitTransform)
                    style.push("-webkit-transform:" + $KW.animUtils.applyTransform(wModel, wModel.transform));
                else
                    style.push("transform:" + $KW.animUtils.applyTransform(wModel, wModel.transform));
            }
            (typeof wModel.opacity != 'undefined') && style.push('opacity:' + wModel.opacity);
            if(wModel.wType != 'FlexContainer' || wModel.clipbounds) {
                style.push('border: 0px !important');
                style.push('background: transparent !important');
            }

            if(module.isFlexWidget(wModel)) {
                var boxShadow = $KW.Utils.getBoxShadowStyle(wModel);
                if(boxShadow.length > 0) {
                    style.push("box-shadow: " + boxShadow);
                }

            }

            return style.join(";");
        },

        
        getWidth: function(wModel, layoutModel, wNode, flexNode, updateUI) {
            var flexContainer = wModel.parent;
            var isWidthSet = false;
            var width;

            var widthObj = layoutModel.width;

            if(widthObj) {
                width = (widthObj.value < 0 ? 0 : widthObj.value) + widthObj.unit;
                isWidthSet = true;
                var w = module.getValueByParentFrame(wModel, widthObj, 'x');
                if(w) module.updateWidthOnFrame(wModel, w);
            }

            if(!isWidthSet) {
                var implicitWidth;
                var minWidth = 0;
                var maxWidth = Number.MAX_VALUE;
                var minWidthObj = layoutModel.minWidth;
                var maxWidthObj = layoutModel.maxWidth;

                if(minWidthObj) {
                    minWidth = module.getValueByParentFrame(wModel, minWidthObj, 'x');
                    minWidth = minWidth < 0 ? 0 : minWidth;
                }
                if(maxWidthObj) {
                    maxWidth = module.getValueByParentFrame(wModel, maxWidthObj, 'x');
                    maxWidth = maxWidth < 0 ? 0 : maxWidth;
                }

                
                if(flexContainer.layouttype == kony.flex.FREE_FORM) {
                    var flexWidth = flexContainer.frame.width;
                    var centerX, left, right;

                    if(layoutModel.centerX) {
                        centerX = module.getValueByParentFrame(wModel, layoutModel.centerX, 'x');
                    }
                    if(layoutModel.left) {
                        left = module.getValueByParentFrame(wModel, layoutModel.left, 'x');
                    }
                    if(layoutModel.right) {
                        right = module.getValueByParentFrame(wModel, layoutModel.right, 'x');
                    }
                    if(layoutModel.centerX && layoutModel.left)
                        implicitWidth = (centerX - left) * 2;
                    else if(layoutModel.centerX && layoutModel.right)
                        implicitWidth = (flexWidth - centerX - right) * 2;
                    else if(layoutModel.left && layoutModel.right)
                        implicitWidth = flexWidth - left - right;

                    if(implicitWidth != undefined) {
                        var border = parseInt($KU.getStyle(flexNode, "border-right-width"), 10);
                        implicitWidth = implicitWidth - border;
                        implicitWidth = (implicitWidth < 0 ? 0 : implicitWidth);
                    }
                }
                var calWidth = (implicitWidth != undefined) ? implicitWidth : module.getPreferredWidth(wModel, wNode.childNodes[0], maxWidth, updateUI);
                module.updateWidthOnFrame(wModel, calWidth);
                width = this.enforceGivenDimension(calWidth, minWidth, maxWidth) + 'px';
            }
            if(widthObj || implicitWidth != undefined)
                module.setPreferredWidth(wModel, wNode);

            if(updateUI == undefined)
                wNode.style.width = width;
            else {
                var style = [];
                style.push('width:' + width);
                return style;
            }
        },

        getHeight: function(wModel, layoutModel, wNode, flexNode, updateUI) {
            var flexContainer = wModel.parent;
            var isHeightSet = false;
            var height;

            if(wModel.wType == 'FlexContainer')
                wModel.autogrowHeight = false;

            var heightObj = layoutModel.height;
            if(heightObj) {
                height = (heightObj.value < 0 ? 0 : heightObj.value) + heightObj.unit;
                isHeightSet = true;
            }

            if(!isHeightSet) {
                var implicitHeight;
                var minHeight = 0;
                var maxHeight = Number.MAX_VALUE;

                var minHeightObj = layoutModel.minHeight;
                var maxHeightObj = layoutModel.maxHeight;

                if(minHeightObj) {
                    minHeight = module.getValueByParentFrame(wModel, minHeightObj, 'y');
                    minHeight = minHeight < 0 ? 0 : minHeight;
                }

                if(maxHeightObj) {
                    maxHeight = module.getValueByParentFrame(wModel, maxHeightObj, 'y');
                    maxHeight = maxHeight < 0 ? 0 : maxHeight;
                }

                if(flexContainer.layouttype == kony.flex.FREE_FORM) {
                    var flexHeight = flexContainer.frame.height;
                    var centerY, top, bottom;

                    if(layoutModel.centerY) {
                        centerY = module.getValueByParentFrame(wModel, layoutModel.centerY, 'y');
                    }
                    if(layoutModel.top) {
                        top = module.getValueByParentFrame(wModel, layoutModel.top, 'y');
                    }
                    if(layoutModel.bottom) {
                        bottom = module.getValueByParentFrame(wModel, layoutModel.bottom, 'y');
                    }

                    if(layoutModel.centerY && layoutModel.top)
                        implicitHeight = (centerY - top) * 2;
                    else if(layoutModel.centerY && layoutModel.bottom)
                        implicitHeight = (flexHeight - centerY - bottom) * 2;
                    else if(layoutModel.top && layoutModel.bottom)
                        implicitHeight = flexHeight - top - bottom;

                    if(typeof implicitHeight != 'undefined') {
                        var border = parseInt($KU.getStyle(flexNode, "border-bottom-width"), 10);
                        implicitHeight = implicitHeight - border;
                        height = (implicitHeight < 0 ? 0 : implicitHeight);
                    }
                }
                var calHeight = (typeof implicitHeight != "undefined") ? implicitHeight : module.getPreferredHeight(wModel, wNode.childNodes[0], maxHeight, updateUI);

                if(wModel.wType == 'Image' && wModel.imagescalemode == constants.IMAGE_SCALE_MODE_MAINTAIN_ASPECT_RATIO) {
                    if(typeof implicitHeight == 'undefined') {
                        var span = wNode.childNodes[0];
                        var dimensions = {
                            width: span.offsetWidth + 'px',
                            height: span.offsetHeight + 'px'
                        };
                        dimensions = $KU.setImgAspectRatio(wModel, span.childNodes[0], dimensions, false);
                        calHeight = parseInt(dimensions.height, 10);
                    }
                }
                height = this.enforceGivenDimension(calHeight, minHeight, maxHeight) + 'px';
            }

            if(updateUI == undefined) {
                wNode.style.height = height;
                if(wModel.wType == "Segment" && wModel.viewtype == constants.SEGUI_VIEW_TYPE_TABLEVIEW) {
                    if(isHeightSet || typeof implicitHeight != "undefined") {
                        wModel.autoGrowHeight = false;
                    } else {
                        wModel.autoGrowHeight = true;
                    }
                    if(!wModel.needScroller && (isHeightSet || typeof implicitHeight != "undefined" || maxHeightObj)) {
                        wModel.needScroller = true;
                        $KW.Scroller.initialize([wNode.childNodes[0]], "Segment");
                    }
                }
            } else {
                var style = [];
                style.push('height:' + height);
                return style;
            }
        },

        enforceGivenDimension: function(givenDimension, minDimension, maxDimension) {
            var returnDimension = givenDimension;
            if(minDimension <= maxDimension) {
                if(givenDimension < minDimension) {
                    returnDimension = minDimension;
                }
                if(givenDimension > maxDimension) {
                    returnDimension = maxDimension;
                }
            }
            return returnDimension;
        },

        setDimensions: function(wModel, wNode, flexNode) {
            if(wNode) {
                wNode = wNode.childNodes[0]; 
                var parentModel = wModel.parent;
                if(wNode && wModel.wType != 'Switch') {
                    wNode.style.width = '100%';
                    wNode.style.height = '100%';
                    if(wModel.wType == 'FlexContainer' && !(wModel.isTemplate && wModel.containerType == 'CollectionView')) {
                        wNode.childNodes[0].style.height = '100%'
                    }
                    if(wModel.wType == 'FlexScrollContainer' && !$KG["nativeScroll"]) {
                        var scrollerInstance = $KG[wNode.id];
                        var contentNode;
                        if(wModel.scrollingevents && wModel.scrollingevents.onpull) {
                            contentNode = wNode.children[0].children[1];
                        }
                        else {
                            contentNode = wNode.children[0].children[0];
                        }
                        
                        if(scrollerInstance && scrollerInstance.hScroll)
                            contentNode.style.width = wNode.clientWidth + 'px';
                        contentNode.style.height = wNode.clientHeight + 'px';
                    }
                    if(wModel.wType == 'Segment' && wModel.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW) {
                        var contentNode = wNode.childNodes[0];
                        var height = '100%';
                        if(wModel.needpageindicator) {
                            var border = parseInt($KU.getStyle(wNode, "border-top-width"), 10) + parseInt($KU.getStyle(wNode, "border-bottom-width"), 10);
                            height = (wNode.offsetHeight - wNode.childNodes[1].offsetHeight - border) + 'px';
                        }
                        contentNode.style.width = '100%';
                        contentNode.style.height = height;
                    }
                }

                if(wModel.wType == 'Image') {
                    
                    wNode.style.display = 'block';

                    var imgNode = wNode.childNodes[0];
                    var dimensions = {
                        width: wNode.offsetWidth + 'px',
                        height: wNode.offsetHeight + 'px'
                    };

                    this.handleImageScaleMode(wModel, imgNode, dimensions);
                } else if(wModel.wType == 'Switch') {
                    $KW.Switch.adjustWidth(wModel, wNode, true);
                    $KW.Switch.adjustHeight(wModel, wNode);
                } else if(wModel.wType == "Slider") {
                    var slider = $KU.getNodeByModel(wModel);
                    $KW.Slider.imgLoad(slider.childNodes[0]);
                }
                else if(wModel.needScroller || wModel.wType == 'FlexScrollContainer') {
                    if(wModel.wType == 'CollectionView' || wModel.wType == 'Browser') {
                        wNode = wNode.children[0];
                    }
                    var scrollerInstance = $KG[wNode.id];
                    if(scrollerInstance && kony.isformRendered) {
                        scrollerInstance.refresh();
                    }
                }
            }
        },

        
        getDefaultWidth: function(wModel, needComplutedValue) {
            if(wModel.wType == 'Browser' && !wModel.htmlstring)
                return "";

            var defaultWidth = $KU.widgetsWidthMap[wModel.wType];
            if(defaultWidth)
                return(needComplutedValue == false) ? defaultWidth : module.getComputedValue(wModel, defaultWidth);

            return "";
        },

        
        getDefaultHeight: function(wModel, needComplutedValue) {
            var defaultHeight = $KU.widgetsHeightMap[wModel.wType];
            if(defaultHeight)
                return(needComplutedValue == false) ? defaultHeight : module.getComputedValue(wModel, defaultHeight);

            return "";
        },

        
        setPreferredWidth: function(wModel, wNode) {
            var iscontentDriven = $KU.inArray($KU.contentDrivenWidgets, wModel.wType)[0];
            if(iscontentDriven) {
                var node;
                if(wModel.wType == 'Label')
                    node = wNode.childNodes[0].childNodes[0];
                else
                    node = wNode.childNodes[0];
                node.style.whiteSpace = 'pre-wrap';
            }
        },

        getChildHeight: function(wModel, wNode) {
            var maxHeight, defaultHeight = 'auto';
            if(wModel.autogrowMode == kony.flex.AUTOGROW_HEIGHT) {
                if(wModel.wType == "FlexContainer") {
                    wModel.autogrowHeight = true;
                    var containerId = wNode.childNodes[0].getAttribute("kcontainerID");
                    containerId && $KW.Utils.updateContainerDataInDOM(wNode, containerId);
                    return this.getComputedPreferredHeight(wModel, wNode, $KW.FlexLayoutEngine.getAutoGrowFlexHeight(wModel, wNode));
                } else if(wModel.wType == "Segment") {
                    if(wModel.layoutModel.maxHeight) {
                        maxHeight = module.getValueByParentFrame(wModel, wModel.layoutModel.maxHeight, 'y');
                        if(wNode.scrollHeight > maxHeight) {
                            defaultHeight = maxHeight + 'px';
                        }
                    }
                    wNode.parentNode.style.height = defaultHeight;
                    return this.getComputedPreferredHeight(wModel, wNode, $KW.Segment.getAutoGrowSegmentHeight(wModel, wNode));
                }
            } else {
                
                module.setPaddingByParent(wModel, wNode);
                return this.getComputedPreferredHeight(wModel, wNode);
            }

        },

        getComputedPreferredHeight: function(wModel, wNode, computedheight) {
            if(wModel.wType == 'Image') {
                var imgNode = wNode.childNodes[0];
                imgNode.autoGrowHeight = true;
                if(!wNode.childNodes[0].complete)
                    return 0;
            }
            var layoutModel = wModel.layoutModel;
            var minHeight = 0;
            var maxHeight = Number.MAX_VALUE;

            var minHeightObj = layoutModel.minHeight;
            var maxHeightObj = layoutModel.maxHeight;

            if(minHeightObj) {
                minHeight = module.getValueByParentFrame(wModel, minHeightObj, 'y');
                minHeight = minHeight < 0 ? 0 : minHeight;
            }

            if(maxHeightObj) {
                maxHeight = module.getValueByParentFrame(wModel, maxHeightObj, 'y');
                maxHeight = maxHeight < 0 ? 0 : maxHeight;
            }

            if(typeof computedheight == "undefined") {
                computedheight = module.getPreferredHeight(wModel, wNode, maxHeight);
                if(wModel.wType == 'Image' && wModel.imagescalemode == constants.IMAGE_SCALE_MODE_MAINTAIN_ASPECT_RATIO) {
                    var dimensions = {
                        width: wNode.offsetWidth + 'px',
                        height: wNode.offsetHeight + 'px'
                    };
                    var img = wNode.childNodes[0];
                    dimensions = $KU.setImgAspectRatio(wModel, img, dimensions, false);
                    computedheight = parseInt(dimensions.height, 10);
                    if(img) {
                        img.style.width = dimensions.width;
                        img.style.height = dimensions.height;
                    }
                }
            }
            return this.enforceGivenDimension(computedheight, minHeight, maxHeight);
        },

        getWidgetDimensions: function(wModel, wNode) {
            var parentModel = wModel.parent;
            if(parentModel && parentModel.frame && typeof parentModel.frame.x != 'undefined') {
                var width = wNode.style.width;
                var widthObj = {
                    value: parseFloat(width),
                    unit: module.getUnit(width)
                };
                width = module.getValueByParentFrame(wModel, widthObj, 'x');
                var height = wNode.style.height;
                var heightObj = {
                    value: parseFloat(height),
                    unit: module.getUnit(height)
                };
                height = module.getValueByParentFrame(wModel, heightObj, 'y');
            } else {
                var width = wNode.offsetWidth;
                var height = wNode.offsetHeight;
            }
            return {
                width: width,
                height: height
            };
        },

        getWidgetFrame: function(wModel, wNode, needOffset) {
            var offset = (typeof needOffset == "undefined") ? $KW.Utils.getOffset(wNode) : {
                top: 0,
                left: 0
            };
            var dimensions = this.getWidgetDimensions(wModel, wNode);
            return {
                x: parseInt(offset.left, 10),
                y: parseInt(offset.top, 10),
                width: dimensions.width,
                height: dimensions.height
            };
        },

        setWidgetPosition: function(wModel, frame, wNode) {
            wNode = wNode || $KU.getNodeByModel(wModel);
            wNode.style.left = wNode.style.right = wNode.style.top = wNode.style.bottom = "";
            for(var pos in frame) {
                wNode.style[pos] = frame[pos]; 
            }
            if(!wNode.style.left)
                wNode.style.left = '0%';
            if(!wNode.style.top)
                wNode.style.top = '0%';
        },

        getPercentValue: function(wModel, value, prop) {
            var parent = wModel.parent;
            if(!parent)
                return;
            if(typeof value != 'undefined' && value.indexOf('px') != -1 && prop == 'left') {
                var pFrame = parent.frame;
                var refValue;
                if(prop == 'left') {
                    var width = pFrame.width;
                    if(parent.wType == 'FlexContainer')
                        width = width - parent.hBorder;
                    refValue = width;
                } else if(prop == 'top') {
                    refValue = pFrame.height;
                }
                if(refValue) {
                    var result = (parseInt(value, 10) * 100) / refValue;
                    return isNaN(result) ? '0%' : (result.toFixed(1) + '%');
                }
            } else
                return value;
        },

        saveWidgetFrame: function(wModel) {
            if(wModel.wType == 'FlexContainer' || wModel.wType == 'FlexScrollContainer') {
                wModel.oldFrame = owl.deepCopy(wModel.frame);
            }
        },

        updateWidthOnFrame: function(wModel, width) {
            var layoutModel = wModel.layoutModel || {};
            var minWidth = 0;
            var maxWidth = Number.MAX_VALUE;
            var minWidthObj = layoutModel.minWidth;
            var maxWidthObj = layoutModel.maxWidth;

            if(minWidthObj) {
                minWidth = module.getValueByParentFrame(wModel, minWidthObj, 'x');
                minWidth = minWidth < 0 ? 0 : minWidth;
            }
            if(maxWidthObj) {
                maxWidth = module.getValueByParentFrame(wModel, maxWidthObj, 'x');
                maxWidth = maxWidth < 0 ? 0 : maxWidth;
            }
            if(!wModel.width) {
                width = module.enforceGivenDimension(width, minWidth, maxWidth);
            }
            wModel.frame = {x: wModel.frame.x, y: wModel.frame.y, width: width, height: wModel.frame.height};
        },

        setPaddingByParent: function(wModel, wNode) {
            if(module.isFlexContainer(wModel) || wModel.wType == 'Slider' || wModel.wType == 'Switch')
                return;
            var parent = wModel.parent;
            var padding = wModel.padding;
            if(parent && padding && $KU.isArray(padding)) {
                var result = '';
                var parentWidth = parent.frame.width;
                for(var i = 1; i < padding.length; i++) {
                    result += parseInt((padding[i] * parentWidth) / 100, 10) + 'px ';
                }
                result += parseInt((padding[0] * parentWidth) / 100, 10) + 'px ';
                wNode.style.padding = result;
            }
        },

        
        isFlexWidget: function(wModel) {
            var parentModel = wModel.parent;
            if(parentModel) {
                var wType = parentModel.wType;
                if(wType == "FlexContainer" || wType == "FlexScrollContainer" || (wType == 'Form' && parentModel.layouttype && parentModel.layouttype != kony.flex.VBOX_LAYOUT && parentModel.layouttype != constants.CONTAINER_LAYOUT_GRID))
                    return true;

                if(wType == "Image" && wModel.isImageOverlayWidget) {
                    return true;
                }
            }
            return false;
        },

        isFlexContainer: function(wModel) {
            if(wModel) {
                var wType = wModel.wType;
                if(wType == "FlexContainer" || wType == "FlexScrollContainer" || (wType == 'Form' && wModel.layouttype && wModel.layouttype != kony.flex.VBOX_LAYOUT && wModel.layouttype != constants.CONTAINER_LAYOUT_GRID))
                    return true;
            }
            return false;
        },

        canContainFlexModel: function(wModel) {
            var isFlexModelContainer = false;

            if(wModel.wType === 'Form' || wModel.wType === 'FlexContainer'
            || wModel.wType === 'FlexScrollContainer' || wModel.wType === 'Tab'
            || wModel.wType === 'TabPane' || wModel.wType === 'KComponent') {
                isFlexModelContainer = true;
            }
            return isFlexModelContainer;
        },

        getComputedValue: function(wModel, value) {
            if(!$KU.isValidCSSLength(value))
                return null;
            var obj = this.getValueAndUnit(wModel, value);
            return obj.value + obj.unit;
        },

        splitValueAndUnit: function(value) {
            if(value && typeof value == 'string') {
                var units = $KU.flexUnits;
                for(var i = 0; i < units.length; i++) { 
                    if(value.lastIndexOf(units[i]) != -1) {
                        value = parseFloat(value);
                        unit = units[i];
                        break;
                    }
                }
            }
            return {
                value: value,
                unit: unit
            };
        },

        getValueAndUnit: function(wModel, value) {
            var flexModel = module.isFlexContainer(wModel) ? wModel : wModel.parent;
            var unit = flexModel.defaultunit || kony.flex.DEFAULT_UNIT;
            if(value && typeof value == 'string') {
                var units = $KU.flexUnits;
                for(var i = 0; i < units.length; i++) { 
                    if(value.lastIndexOf(units[i]) != -1) {
                        value = parseFloat(value);
                        unit = units[i];
                        break;
                    }
                }
            }
            value = parseFloat(value); 
            if(unit == kony.flex.PX) {
                value = value / $KU.dpi;
            }
            if(unit == kony.flex.DP) {
                
                unit = 'px';
            }
            return {
                value: value,
                unit: unit
            };
        },

        getUnit: function(value) {
            var units = $KU.flexUnits;
            for(var i = 0; i < units.length; i++) { 
                if(value.lastIndexOf(units[i]) != -1) {
                    unit = units[i];
                    return unit;
                }
            }
        },

        getValueByParentFrame: function(wModel, valueObj, axis, exisitinsParentFrame) {
            var parentFrame = exisitinsParentFrame || wModel.parent.frame;
            var value = valueObj.value;
            var unit = valueObj.unit;
            var pModel = wModel.parent;
            if(unit == kony.flex.PERCENTAGE && parentFrame) {
                if(axis == 'x') {
                    var width = parentFrame.width;
                    if(pModel && pModel.wType == 'FlexContainer')
                        width = width - pModel.hBorder;
                    value = (value * width) / 100;
                } else if(axis == 'y') {
                    var height = parentFrame.height;
                    if(pModel && pModel.wType == 'FlexContainer')
                        height = height - pModel.vBorder;
                    value = (value * height) / 100;
                }
            }
            return value;
        },

        setLayoutConfig: function(wModel, val, oldValue) {
            if(val != oldValue) {
                wModel.layoutConfig = {
                    self: true,
                    children: false
                };

                this.updateAutoGrowFlexConfig(wModel);
            }
        },

        handleContainerData: function(widgetModel, value, propertyName) {
            var wNode, containerModel, containerId;

            if(widgetModel.isCloned == true) {
                containerId = widgetModel.containerId;

                if(containerId) {
                    wNode = $KW.Utils.getWidgetNode(widgetModel);

                    if(wNode) {
                        containerModel = $KW.Utils.getContainerModelById(wNode, containerId);
                    }

                    if(containerModel && containerModel.wType == "CollectionView") {
                        containerModel.layoutConfig = {
                            self: true,
                            children: false
                        };

                        $KW.Utils.updateClonedModelData(widgetModel, containerModel, propertyName);
                    }
                }
            }
        },

        setChildrenConfig: function(wModel, val, oldValue) {
            if(val != oldValue
            && (wModel.layouttype === kony.flex.FLOW_VERTICAL
            || wModel.layouttype === kony.flex.FLOW_HORIZONTAL)) {
                this.setLayoutConfig(wModel, val, oldValue);
                wModel.layoutConfig.children = true;
            }
        },

        updateAutoGrowFlexConfig: function(wModel) {
            var pModel = wModel.parent;

            if(pModel && pModel.autogrowMode
            && ['FlexContainer', 'FlexScrollContainer'].indexOf(pModel.wType) >= 0) {
                pModel.layoutConfig = {
                    self: true,
                    children: true
                };

                this.updateAutoGrowFlexConfig(pModel);
            }
        },

        getAutoGrowFlexConfigContainer: function(wModel) {
            var pModel = wModel;
            while(pModel.parent) {
                pModel = pModel.parent;
                if((pModel.wType == 'FlexContainer' || pModel.wType == 'FlexScrollContainer') && pModel.autogrowHeight) {
                    pModel.layoutConfig = {
                        self: true,
                        children: true
                    };
                } else {
                    break;
                }
            }
            return pModel;
        },

        
        updateLayoutConfig: function(wModel) {
            wModel.layoutConfig = {
                self: true,
                children: false
            };
        },

        updateFlexScrollLayout: function(wModel) {
            var widgetModel, widgetNode, widgets, parentModel, parentNode;
            parentModel = wModel.parent;
            parentNode = $KU.getNodeByModel(parentModel);
            if((parentNode.offsetHeight != parentNode.scrollHeight) || (parentNode.offsetWidth != parentNode.scrollWidth)) {
                widgets = parentModel.widgets();
                for(i = 0; i < widgets.length; i++) {
                    widgetModel = widgets[i];
                    widgetModel = $KW.Utils.getActualWidgetModel(widgetModel);
                    widgetNode = $KU.getNodeByModel(widgetModel);
                    module.updateLayoutConfig(widgetModel, widgetNode);
                }
            }
        },

        
        updateWidgetsConfig: function(boxModel, wArray) {
            if(wArray && wArray.length > 0) {
                for(var i = 0; i < wArray.length; i++) {
                    var wModel = wArray[i];
                    wModel = $KW.Utils.getActualWidgetModel(wModel);
                    var isFlexWidget = module.isFlexWidget(wModel);
                    (isFlexWidget || wModel.wType == "Segment") && this.updateLayoutConfig(wModel);
                    if(wModel.wType == "FlexContainer" || wModel.wType == "FlexScrollContainer")
                        wModel.layoutConfig.children = true;
                    wModel.ownchildrenref && this.updateWidgetsConfig(wModel, wModel.ownchildrenref);
                }
            }
        },

        
        onWidgetRemove: function(boxModel, index) {
            if(module.isFlexContainer(boxModel) && boxModel.layouttype) {
                if(boxModel.layouttype != kony.flex.FREE_FORM) {
                    var nextSibiling = boxModel.ownchildrenref[index];
                    if(nextSibiling) {
                        nextSibiling = $KW.Utils.getActualWidgetModel(nextSibiling);
                        this.updateLayoutConfig(nextSibiling);
                        
                    }
                }
                this.updateLayoutConfig(boxModel);
                this.updateAutoGrowFlexConfig(boxModel);
            }
        },

        
        shouldApplyRTL: function(widgetModel, propertyName) {
            var currentlocale = $KI.i18n && $KG["currentlocale"],
                layoutConfig = $KG['localeLayoutConfig'],
                appPropertyName, widgetPropertyName, localeLevelPropertyMap = {
                    'flexPosition': 'mirrorFlexPositionProperties',
                    'contentAligment': 'mirrorContentAlignment',
                    'layoutAlignment': 'mirrorFlowHorizontalAlignment'
                },
                widgetLevelPropertyMap = {
                    'flexPosition': 'retainFlexPositionProperties',
                    'contentAligment': 'retainContentAlignment',
                    'layoutAlignment': 'retainFlowHorizontalAlignment'
                };
            if($KG.appbehaviors['isI18nLayoutConfigEnabled'] && layoutConfig 
                &&
                currentlocale && layoutConfig[currentlocale]) { 
                layoutConfig = layoutConfig[currentlocale];
                appPropertyName = localeLevelPropertyMap[propertyName];
                widgetPropertyName = widgetLevelPropertyMap[propertyName];
                if(layoutConfig[appPropertyName] && !widgetModel[widgetPropertyName]) {
                    return true;
                }
            }
            return false;
        },

        
        resetRTL: function(widgetModel) {
            var requireFlexRTL = module.shouldApplyRTL(widgetModel, "flexPosition"),
                requireContentAlignment = module.shouldApplyRTL(widgetModel, "contentAligment"),
                temp;
            if((widgetModel.isContentAlignmentMirrored && !requireContentAlignment) ||
                (!widgetModel.isContentAlignmentMirrored && requireContentAlignment)) {
                widgetModel.contentalignment = $KW.Utils.getMirrorAlignment(widgetModel.contentAlignment);
                widgetModel.isContentAlignmentMirrored = true;
            }
            if((widgetModel.isFlexPositionPropertiesMirrored && !requireFlexRTL) ||
                (!widgetModel.isFlexPositionPropertiesMirrored && requireFlexRTL)) {
                temp = widgetModel.left;
                widgetModel.left = widgetModel.right;
                widgetModel.right = temp;
                widgetModel.padding = $KW.Utils.getMirroredMarginPadding(widgetModel.padding);
                widgetModel.margin = $KW.Utils.getMirroredMarginPadding(widgetModel.margin);
                widgetModel.isFlexPositionPropertiesMirrored = true;
            }
        },

        
        setRTLtoTemplates: function(templateModel) {
            var childrenList, childrenLength, childCount = 0,
                childModel, containerChild;

            if(templateModel.widgets) {
                childrenList = templateModel.widgets();
            }
            if(childrenList) {
                childrenLength = childrenList.length;
                for(childCount = 0; childCount < childrenLength; childCount++) {
                    childModel = childrenList[childCount];
                    module.setRTLtoTemplates(childModel);
                    module.resetRTL(childModel);
                }
            }
        },

        handleImageScaleMode: function(imageModel, imageNode, imageSize) {
            if(imageModel.imagescalemode === constants.IMAGE_SCALE_MODE_MAINTAIN_ASPECT_RATIO) {
                $KU.setImgAspectRatio(imageModel, imageNode, imageSize);
                $KU.getImageCenterAlign(imageNode, true);
            } else if(imageModel.imagescalemode === constants.IMAGE_SCALE_MODE_FIT_TO_DIMENSIONS) {
                $KU.setImgDimensions(imageModel, imageNode, imageSize);
            }
        }
    };


    return module;
}());
