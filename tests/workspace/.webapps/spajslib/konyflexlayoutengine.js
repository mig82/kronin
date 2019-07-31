
$KW.FlexLayoutEngine = (function() {
    
    

    var module = {
        
        performFlexLayout: function(layoutType, container, flexNode, widgets) {
            switch(layoutType) {
                case kony.flex.FLOW_HORIZONTAL:
                    this.performHorizontalLayout(container, flexNode, widgets);
                    break;

                case kony.flex.FLOW_VERTICAL:
                    this.performVerticalLayout(container, flexNode, widgets);
                    break;

                default: 
                    this.performFreeFlowLayout(container, flexNode, widgets);
                    break;
            }
        },

        
        performAutogrowFlexLayout: function(container, flexNode, widgets) {
            var flexHeight = this.getAutoGrowFlexHeight(container, flexNode, widgets);
            if(container.canMeasureChildrenHeight) {
                var wrapperNode = $KW.FlexUtils.isFlexWidget(container) ? flexNode.parentNode : flexNode;
                var previousHeight = wrapperNode.style.height;
                wrapperNode.style.height = $KW.FlexUtils.getComputedPreferredHeight(container, flexNode, flexHeight) + 'px';
                container.frame = $KW.FlexUtils.getWidgetFrame(container, wrapperNode);
                container.layoutConfig.children = true;
                if(wrapperNode.style.height != previousHeight && container.parent)
                    container.parent.layoutConfig = {
                        self: true,
                        children: true
                    };
                module.performFlexLayout(container.layouttype, container, flexNode, widgets);
            }
        },

        getAutoGrowFlexHeight: function(flexModel, flexNode, widgets) {
            var layoutType = flexModel.layouttype;
            var parentFrame = flexModel.frame;
            var wModel, wNode;
            var flexHeight = 0;
            flexModel.canMeasureChildrenHeight = true;
            widgets = widgets || flexModel.widgets();

            for(var i = 0; i < widgets.length; i++) {
                wModel = widgets[i];
                wModel = $KW.Utils.getActualWidgetModel(wModel);
                if(!this.isVisible(wModel, flexNode))
                    continue;

                wNode = $KW.Utils.getWidgetNode(wModel, flexNode);
                if(!wNode)
                    continue;

                this.computeLayoutValues(wModel, flexNode, parentFrame);
                
                if(!flexModel.canMeasureChildrenHeight) {
                    var wrapperNode = $KW.FlexUtils.isFlexWidget(flexModel) ? flexNode.parentNode : flexNode;
                    wrapperNode.style.height = $KW.FlexUtils.getComputedPreferredHeight(flexModel, flexNode) + 'px';
                    flexModel.frame = $KW.FlexUtils.getWidgetFrame(flexModel, wrapperNode);
                    flexModel.layoutConfig.children = true;
                    module.performFlexLayout(layoutType, flexModel, flexNode, widgets);
                    return flexModel.frame.height;
                }

                var layoutModel = wModel.layoutModel;
                var wrapperNode = wNode.parentNode;

                
                $KW.FlexUtils.getWidth(wModel, layoutModel, wrapperNode, flexNode);

                var centerY = layoutModel.centerY;
                var top = layoutModel.top;
                var bottom = layoutModel.bottom;
                var height = layoutModel.height;
                var widgetHeight = 0;
                var cph, implicitHeight;

                if(centerY) {
                    if(height) {
                        widgetHeight = centerY.value + (height.value / 2);
                    } else {
                        if(top && layoutType == kony.flex.FREE_FORM) {
                            implicitHeight = (centerY.value - top.value) * 2;
                            widgetHeight = implicitHeight + top.value;
                        } else {
                            cph = $KW.FlexUtils.getChildHeight(wModel, wNode);
                            widgetHeight = centerY.value + (cph / 2);
                        }
                    }
                } else if(top) {
                    if(height) {
                        widgetHeight = top.value + height.value;
                    } else {
                        cph = $KW.FlexUtils.getChildHeight(wModel, wNode);
                        widgetHeight = top.value + cph;
                    }
                } else {
                    if(height) {
                        widgetHeight = height.value;
                    } else {
                        cph = $KW.FlexUtils.getChildHeight(wModel, wNode);
                        widgetHeight = cph;
                    }
                }

                if(bottom) {
                    widgetHeight += bottom.value;
                }

                wrapperNode.style.height = (height ? height.value : (implicitHeight != undefined ? implicitHeight : cph)) + 'px';
                wrapperNode.style.maxWidth = wrapperNode.style.maxHeight = '';
                var dimensions = $KW.FlexUtils.getWidgetDimensions(wModel, wrapperNode);
                wModel.finalFrame = {};

                if(layoutType != kony.flex.FREE_FORM) {
                    var prevModel, prevSibling, prevFrame;
                    var prevWidgetInfo = this.getPreviousNode(wModel, wrapperNode, flexNode)
                    if(prevWidgetInfo) {
                        prevModel = prevWidgetInfo[0];
                        prevSibling = prevWidgetInfo[1];
                    }
                    prevFrame = prevSibling && prevModel.frame;
                }

                if(layoutType == kony.flex.FREE_FORM || layoutType == kony.flex.FLOW_VERTICAL)
                    this.determineX(wModel, dimensions, flexNode, parentFrame);
                else
                    this.determineHorizontalFlowX(wModel, dimensions, prevModel, prevFrame);

                if(layoutType == kony.flex.FREE_FORM || layoutType == kony.flex.FLOW_HORIZONTAL)
                    this.determineY(wModel, dimensions, flexNode, parentFrame);
                else
                    this.determineVerticalFlowY(wModel, dimensions, prevModel, prevFrame);

                $KW.FlexUtils.setWidgetPosition(wModel, wModel.finalFrame, wrapperNode);
                wModel.frame = this.getWidgetFrame(wModel, dimensions, wModel.finalFrame);
                wModel.dolayout && $KU.executeWidgetEventHandler(wModel, wModel.dolayout);
                if(layoutType == kony.flex.FLOW_VERTICAL) {
                    flexHeight += widgetHeight;
                } else { 
                    if(flexHeight < widgetHeight)
                        flexHeight = widgetHeight;
                }
            }
            if(flexModel.vBorder)
                flexHeight += flexModel.vBorder;
            return flexHeight;
        },

        
        performFreeFlowLayout: function(container, flexNode, widgets) {
            var parentFrame = container.frame;
            var wModel, wNode, dimensions;

            for(var i = 0; i < widgets.length; i++) {

                wModel = widgets[i];

                wModel = $KW.Utils.getActualWidgetModel(wModel);

                if(!this.canLayoutUI(container, wModel, flexNode))
                    continue;
                wNode = $KW.Utils.getWidgetNode(wModel, flexNode);

                if(!wNode)
                    continue;

                wNode = wNode.parentNode;
                wModel.finalFrame = {};

                this.computeLayoutValues(wModel, flexNode, parentFrame);
                this.determineSize(flexNode, wModel, wNode);

                dimensions = $KW.FlexUtils.getWidgetDimensions(wModel, wNode);

                this.determineX(wModel, dimensions, flexNode, parentFrame);
                this.determineY(wModel, dimensions, flexNode, parentFrame);

                $KW.FlexUtils.setWidgetPosition(wModel, wModel.finalFrame, wNode);
                if(wModel.parent.wType == "FlexScrollContainer") {
                    $KW.FlexUtils.updateFlexScrollLayout(wModel);
                }
                $KW.FlexUtils.saveWidgetFrame(wModel);
                wModel.frame = this.getWidgetFrame(wModel, dimensions, wModel.finalFrame);
                this.onWidgetLayout(wModel, wNode);
            }
            this.onFlexContainerLayout(container);
        },

        performHorizontalLayout: function(container, flexNode, widgets) {
            var parentFrame = container.frame;
            var wModel, wNode, dimensions, prevFrame;

            for(var i = 0; i < widgets.length; i++) {

                wModel = widgets[i];

                wModel = $KW.Utils.getActualWidgetModel(wModel);

                if(!this.canLayoutUI(container, wModel, flexNode))
                    continue;

                wNode = $KW.Utils.getWidgetNode(wModel, flexNode);

                if(!wNode)
                    continue;

                wNode = wNode.parentNode
                wModel.finalFrame = {};

                this.computeLayoutValues(wModel, flexNode, parentFrame);

                var prevModel, prevSibling;
                var prevWidgetInfo = this.getPreviousNode(wModel, wNode, flexNode)
                if(prevWidgetInfo) {
                    prevModel = prevWidgetInfo[0];
                    prevSibling = prevWidgetInfo[1];
                }
                prevFrame = prevSibling && prevModel.frame;

                this.determineSize(flexNode, wModel, wNode);
                dimensions = $KW.FlexUtils.getWidgetDimensions(wModel, wNode);

                this.determineHorizontalFlowX(wModel, dimensions, prevModel, prevFrame);
                this.determineY(wModel, dimensions, flexNode, parentFrame);

                $KW.FlexUtils.setWidgetPosition(wModel, wModel.finalFrame, wNode);
                if(wModel.parent.wType == "FlexScrollContainer") {
                    $KW.FlexUtils.updateFlexScrollLayout(wModel);
                }
                $KW.FlexUtils.saveWidgetFrame(wModel);
                wModel.frame = this.getWidgetFrame(wModel, dimensions, wModel.finalFrame);
                this.onWidgetLayout(wModel, wNode);
            }
            if(container.reverselayoutdirection) {
                this.applyReverStacking(container, flexNode)
            }
            this.onFlexContainerLayout(container);
        },

        performVerticalLayout: function(container, flexNode, widgets) {
            var parentFrame = container.frame;
            var wModel, wNode, dimensions, prevFrame;

            for(var i = 0; i < widgets.length; i++) {

                wModel = widgets[i];
                wModel = $KW.Utils.getActualWidgetModel(wModel);
                if(!this.canLayoutUI(container, wModel, flexNode))
                    continue;

                wNode = $KW.Utils.getWidgetNode(wModel, flexNode);

                if(!wNode)
                    continue;

                wNode = wNode.parentNode
                wModel.finalFrame = {};

                this.computeLayoutValues(wModel, flexNode, parentFrame);

                var prevModel, prevSibling;
                var prevWidgetInfo = this.getPreviousNode(wModel, wNode, flexNode)
                if(prevWidgetInfo) {
                    prevModel = prevWidgetInfo[0];
                    prevSibling = prevWidgetInfo[1];
                }
                prevFrame = prevSibling && prevModel.frame;

                this.determineSize(flexNode, wModel, wNode);
                dimensions = $KW.FlexUtils.getWidgetDimensions(wModel, wNode);
                this.determineX(wModel, dimensions, flexNode, parentFrame);
                this.determineVerticalFlowY(wModel, dimensions, prevModel, prevFrame);

                $KW.FlexUtils.setWidgetPosition(wModel, wModel.finalFrame, wNode);
                if(wModel.parent.wType == "FlexScrollContainer") {
                    $KW.FlexUtils.updateFlexScrollLayout(wModel);
                }
                $KW.FlexUtils.saveWidgetFrame(wModel);
                wModel.frame = this.getWidgetFrame(wModel, dimensions, wModel.finalFrame);
                this.onWidgetLayout(wModel, wNode);
            }
            if(container.reverselayoutdirection) {
                this.applyReverStacking(container, flexNode)
            }
            this.onFlexContainerLayout(container);
        },

        applyReverStacking: function(containerModel, containerNode) {
            var counter, prevModel, parentFrame = containerModel.frame,
                wModel, widgets = containerModel.widgets(),
                wNode, dimensions, prevFrame, propertyValue, prevWidget;
            for(counter = 0; counter < widgets.length; counter++) {
                wModel = widgets[counter];
                wModel = $KW.Utils.getActualWidgetModel(wModel);
                if(this.canLayoutUI(containerModel, wModel, containerNode)) {
                    wNode = $KW.Utils.getWidgetNode(wModel, containerNode);
                    wNode = wNode.parentNode;
                    prevWidget = this.getPreviousNode(wModel, wNode, containerNode);
                    prevModel = prevWidget ? prevWidget[0] : null;
                    prevFrame = prevWidget ? prevWidget[0].frame : null;
                    propertyValue = this.alignWidgets(wModel, wModel.frame, prevModel, prevFrame, containerModel, containerNode);
                    wModel.finalFrame[propertyValue[0]] = propertyValue[1];
                    $KW.FlexUtils.setWidgetPosition(wModel, wModel.finalFrame, wNode);
                    $KW.FlexUtils.saveWidgetFrame(wModel);
                    wModel.frame = this.getWidgetFrame(wModel, {
                        width: wModel.frame.width,
                        height: wModel.frame.height
                    }, wModel.finalFrame);
                }
            }
        },

        
        alignWidgets: function(wModel, wFrame, prevWModel, prevFrame, containerModel, containerNode) {
            var left, top, border, width, height, centerXvalue, centerYvalue;
            if(containerModel.layouttype == kony.flex.FLOW_HORIZONTAL) {
                border = (containerModel.hBorder) ? containerModel.hBorder : 0;
                
                
                if(containerModel.wType === "FlexContainer") {
                    prevFrame = prevFrame || {
                        x: (containerModel.frame.width - border),
                        y: 0,
                        width: 0,
                        height: 0
                    };
                } else if(containerModel.wType === "FlexScrollContainer") {
                    
                    prevFrame = prevFrame || {
                        x: containerNode.childNodes[0].scrollWidth - border,
                        y: 0,
                        width: 0,
                        height: 0
                    };
                }
                
                left = prevFrame.x;

                
                
                if(typeof wFrame.width == "string" && wFrame.width.indexOf('%') != -1) {
                    left -= $KW.FlexUtils.getValueByParentFrame(wModel, {
                        value: parseInt(wFrame.width, 10),
                        unit: '%'
                    }, 'x');
                } else {
                    left -= parseInt(wFrame.width, 10);
                }

                
                if(wModel.layoutModel && wModel.layoutModel.right) {
                    left -= $KW.FlexUtils.getValueByParentFrame(wModel, wModel.layoutModel.right, 'x');
                }

                
                if(prevWModel && prevWModel.layoutModel && prevWModel.layoutModel.centerX) {
                    centerXvalue = $KW.FlexUtils.getValueByParentFrame(wModel, prevWModel.layoutModel.centerX, 'x');
                    left -= (centerXvalue - (prevWModel.frame.width/2));
                } else if(prevWModel && prevWModel.layoutModel && prevWModel.layoutModel.left) {
                    left -= $KW.FlexUtils.getValueByParentFrame(wModel, prevWModel.layoutModel.left, 'x');
                }
                left = parseInt(left, 10) + kony.flex.PX;
                return ["left", left];
            } else if(containerModel.layouttype == kony.flex.FLOW_VERTICAL) {
                border = (containerModel.vBorder) ? containerModel.vBorder : 0;
                
                
                if(containerModel.wType === "FlexContainer") {
                    prevFrame = prevFrame || {
                        x: 0,
                        y: containerModel.frame.height - border,
                        width: 0,
                        height: 0
                    };
                } else if(containerModel.wType === "FlexScrollContainer") {
                    
                    prevFrame = prevFrame || {
                        x: 0,
                        y: containerNode.childNodes[0].scrollHeight - border,
                        width: 0,
                        height: 0
                    };
                }
                
                top = prevFrame.y;

                
                
                if(typeof wFrame.height == "string" && wFrame.height.indexOf('%') != -1) {
                    top -= $KW.FlexUtils.getValueByParentFrame(wModel, {
                        value: parseInt(wFrame.height, 10),
                        unit: '%'
                    }, 'y');
                } else {
                    top -= parseInt(wFrame.height, 10);
                }

                
                if(wModel.layoutModel && wModel.layoutModel.bottom) {
                    top -= $KW.FlexUtils.getValueByParentFrame(wModel, wModel.layoutModel.bottom, 'y');
                }

                
                if(prevWModel && prevWModel.layoutModel && prevWModel.layoutModel.centerY){
                    centerYvalue = $KW.FlexUtils.getValueByParentFrame(wModel, prevWModel.layoutModel.centerY, 'y');
                    top -= (centerYvalue - (prevWModel.frame.height/2));
                } else if(prevWModel && prevWModel.layoutModel && prevWModel.layoutModel.top) {
                    top -= $KW.FlexUtils.getValueByParentFrame(wModel, prevWModel.layoutModel.top, 'y');
                }
                top = parseInt(top, 10) + kony.flex.PX;
                return ["top", top];
            }
        },

        
        applyAnimationFrameReverseStacking: function(frames, widgetIndex, containerModel, containerNode) {
            var i, frame, prevFrame, counter = 0,
                height, width, frameObj, prop, widgets = containerModel.widgets();
            for(i = widgetIndex; i < widgets.length; i++) {
                frameObj = {};
                
                
                if(widgets[i - 1]) {
                    height = widgets[i - 1].finalFrame.height ? parseInt(widgets[i - 1].finalFrame.height, 10) : widgets[i - 1].frame.height;
                    width = widgets[i - 1].finalFrame.width ? parseInt(widgets[i - 1].finalFrame.width, 10) : widgets[i - 1].frame.width;
                    prevFrame = this.getWidgetFrame(widgets[i - 1], {
                        width: width,
                        height: height
                    }, widgets[i - 1].finalFrame);
                }
                for(prop in frames[counter])
                    frameObj[prop] = frames[counter][prop];
                
                if(!frameObj.width) {
                    frameObj.width = widgets[i].frame.width + kony.flex.PX;
                }
                
                if(!frameObj.height) {
                    frameObj.height = widgets[i].frame.height + kony.flex.PX;
                }
                frame = this.alignWidgets(widgets[i], frameObj, widgets[i - 1], prevFrame, containerModel, containerNode);
                frames[counter++][frame[0]] = frame[1];
                widgets[i].finalFrame[frame[0]] = frame[1];
            }
            return frames;
        },

        onFlexContainerLayout: function(flexModel) {
            flexModel.layoutConfig.children = false;
        },

        onWidgetLayout: function(wModel, wNode) {
            
            if(wModel.wType === 'Image' && wModel.zoomenabled) {
                $KW.Image.adjustImageOverlayWidgets(wModel);
            }
            if(wModel.kComponentModel) {
                wModel.kComponentModel.frame = wModel.frame;
            }
            wModel.dolayout && $KU.executeWidgetEventHandler(wModel, wModel.dolayout);
            if(wModel.wType == "CollectionView") {
                $KW.CollectionView.Utils.setCollectionViewHeightAndWidth(wModel);
                $KW.CollectionView.Utils.updateReachingOffsetValuesInPx(wModel);
            }
            this.compareFrames(wModel);
            this.layoutNestedConatiners(wModel, wNode);
            wModel.layoutConfig.self = false;
        },

        compareFrames: function(wModel) {
            if(wModel.wType == 'FlexContainer' || wModel.wType == 'FlexScrollContainer') {
                var oldFrame = wModel.oldFrame;
                var frame = wModel.frame;
                if(oldFrame.width != frame.width || oldFrame.height != frame.height)
                    wModel.layoutConfig.children = true;
            }
        },

        layoutNestedConatiners: function(wModel, wNode) {
            if(wModel.wType == 'FlexContainer' || wModel.wType == 'FlexScrollContainer')
                $KW.FlexContainer.forceLayout(wModel, wNode ? wNode.childNodes[0] : null);
            if(wModel.wType == 'Segment' || wModel.wType == 'CollectionView') {
                var segNode = $KU.getNodeByModel(wModel);
                if(wModel.wType == 'CollectionView')
                    segNode = $KW.Utils.getContentNodeFromNodeByModel(wModel);
                if(segNode) {
                    
                    if(wModel.layoutConfig.self || !$KG.isUILayedOut) {
                        $KU.needOptimization = false;
                        $KW.FlexContainer.adjustFlexContainers(wModel, segNode);
                        if(wModel.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW)
                            $KW.touch.computeWidths(segNode, wModel);
                        $KU.needOptimization = true;
                    }
                    
                    if(wModel.layoutModel && wModel.autoGrowHeight === true) {
                        var wNode = $KW.Utils.getWidgetNode(wModel);
                        var cph = $KW.FlexUtils.getComputedPreferredHeight(wModel, wNode);
                        wNode.parentNode.style.height = cph + 'px';
                        wModel.frame.height = cph;
                    }
                }
            }
            if(wModel.wType == 'DataGrid') {
                var wNode = $KU.getNodeByModel(wModel);
                if(wModel.layoutConfig.self) {
                    $KU.needOptimization = false;
                    $KW.FlexContainer.adjustFlexContainers(wModel, wNode);
                    $KU.needOptimization = true;
                }
            }
            if(wModel.wType == 'TabPane') {
                var wNode = $KU.getNodeByModel(wModel);
                if(wModel.layoutConfig.self)
                    $KU.needOptimization = false;
                $KW.FlexContainer.adjustFlexContainers(wModel, wNode);
                $KU.needOptimization = true;
                $KW.Form.initializeFlexContainersInBox(wModel);
            }
        },

        
        determineSize: function(flexNode, wModel, wNode, updateUI) {

            
            var parent = wModel.parent;

            if(typeof updateUI == "undefined")
                $KW.FlexUtils.setPaddingByParent(wModel, wNode.childNodes[0]);

            var layoutModel = wModel.layoutModel;
            var wStyle = $KW.FlexUtils.getWidth(wModel, layoutModel, wNode, flexNode, updateUI);
            var hStyle = $KW.FlexUtils.getHeight(wModel, layoutModel, wNode, flexNode, updateUI);

            wNode.style.maxWidth = wNode.style.maxHeight = '';
            if(typeof updateUI == "undefined") {
                $KW.FlexUtils.setDimensions(wModel, wNode, flexNode);
            } else {
                var dimensions = wStyle.concat(hStyle);
                for(var i = 0; i < dimensions.length; i++) {
                    var parts = dimensions[i].split(':');
                    wModel.finalFrame[parts[0]] = parts[1];
                }
            }
        },

        
        determineX: function(wModel, widgetFrame, flexNode, parentFrame) {
            var layoutModel = wModel.layoutModel;
            var finalFrame = wModel.finalFrame;
            var flexContainer = wModel.parent;

            if(layoutModel.centerX) {
                var centerX = layoutModel.centerX.value;
                var parentWidth = parentFrame.width;
                var width = widgetFrame.width;
                if(layoutModel.centerX.unit == kony.flex.PERCENTAGE && flexContainer.layouttype == kony.flex.FREE_FORM) {
                    if(wModel.parent && wModel.parent.hBorder) {
                        parentWidth = parentWidth - wModel.parent.hBorder;
                    }
                    width = Math.floor((width / parentWidth) * 100);
                }
                finalFrame.left = parseInt((centerX - (width / 2)), 10) + layoutModel.centerX.unit;
            } else if(layoutModel.left) {
                finalFrame.left = layoutModel.left.value + layoutModel.left.unit;
            } else if(layoutModel.right) { 
                var parentWidth = flexNode.clientWidth;
                var value = $KW.FlexUtils.getValueByParentFrame(wModel, layoutModel.right, 'x');
                value = parentWidth - parseInt(widgetFrame.width + value, 10);
                finalFrame.left = value + kony.flex.PX;
            }
        },

        
        determineHorizontalFlowX: function(wModel, widgetFrame, prevModel, prevFrame) {
            var layoutModel = wModel.layoutModel;
            var finalFrame = wModel.finalFrame;
            prevFrame = prevFrame || {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
            var left = prevFrame.x + prevFrame.width;

            if(layoutModel.centerX) {
                left += layoutModel.centerX.value - (widgetFrame.width / 2);
            } else if(layoutModel.left) {
                left += layoutModel.left.value;
            }

            if(prevModel && prevModel.layoutModel && prevModel.layoutModel.right) {
                left += prevModel.layoutModel.right.value;
            }

            finalFrame.left = parseInt(left, 10) + kony.flex.PX;
        },

        
        determineY: function(wModel, widgetFrame, flexNode, parentFrame) {
            var layoutModel = wModel.layoutModel;
            var finalFrame = wModel.finalFrame;
            var flexContainer = wModel.parent;

            if(layoutModel.centerY) {
                var centerY = layoutModel.centerY.value;
                var parentHeight = parentFrame.height;
                var height = widgetFrame.height;
                if(layoutModel.centerY.unit == kony.flex.PERCENTAGE && flexContainer.layouttype == kony.flex.FREE_FORM) {
                    if(wModel.parent && wModel.parent.vBorder) {
                        parentHeight = parentHeight - wModel.parent.vBorder;
                    }
                    height = Math.floor((height / parentHeight) * 100);
                }
                finalFrame.top = parseInt(centerY - (height / 2)) + layoutModel.centerY.unit;
            } else if(layoutModel.top) {
                finalFrame.top = layoutModel.top.value + layoutModel.top.unit;
            } else if(layoutModel.bottom) {
                var parentHeight = flexNode.clientHeight;
                var value = $KW.FlexUtils.getValueByParentFrame(wModel, layoutModel.bottom, 'y');
                value = parentHeight - parseInt(widgetFrame.height + value, 10);
                finalFrame.top = value + kony.flex.PX;
            }
        },

        
        determineVerticalFlowY: function(wModel, widgetFrame, prevModel, prevFrame) {
            var layoutModel = wModel.layoutModel;
            var finalFrame = wModel.finalFrame;
            prevFrame = prevFrame || {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
            var top = prevFrame.y + prevFrame.height;

            if(layoutModel.centerY) {
                top += layoutModel.centerY.value - (widgetFrame.height / 2);
            } else if(layoutModel.top) {
                top += layoutModel.top.value;
            }

            if(prevModel && prevModel.layoutModel && prevModel.layoutModel.bottom) {
                top += prevModel.layoutModel.bottom.value;
            }
            finalFrame.top = top + kony.flex.PX;
        },

        
        getComputedValue: function(wModel, parentFrame, value, axis, property) {
            if(!$KU.isValidCSSLength(value))
                return null;
            var resultObj = $KW.FlexUtils.getValueAndUnit(wModel, value);
            var value = resultObj.value;
            var unit = resultObj.unit;
            var parentModel = wModel.parent;
            if(parentModel.wType == 'FlexContainer' && parentModel.autogrowHeight && unit == kony.flex.PERCENTAGE && axis == 'y') {
                parentModel.autogrowHeight = false;
                parentModel.canMeasureChildrenHeight = false;
            }

            if(parentModel.layouttype != kony.flex.FREE_FORM && unit == kony.flex.PERCENTAGE && !property) {
                if(axis == 'x') {
                    var width = parentFrame.width;
                    if(parentModel.wType == 'FlexContainer')
                        width = width - parentModel.hBorder;
                    value = (value * width) / 100;
                } else if(axis == 'y') {
                    var height = parentFrame.height;
                    if(parentModel.wType == 'FlexContainer')
                        height = height - parentModel.vBorder;
                    value = (value * parentFrame.height) / 100;
                }
                unit = kony.flex.PX;
            }
            return {
                value: value,
                unit: unit
            };
        },

        computeLayoutValues: function(wModel, flexNode, parentFrame, frameObj) {
            var model = wModel.layoutModel = {};
            var dataModel = frameObj || wModel;

            model.centerX = this.getComputedValue(wModel, parentFrame, dataModel.centerX, 'x');
            model.centerY = this.getComputedValue(wModel, parentFrame, dataModel.centerY, 'y');
            model.left = this.getComputedValue(wModel, parentFrame, dataModel.left, 'x');
            model.right = this.getComputedValue(wModel, parentFrame, dataModel.right, 'x');
            model.top = this.getComputedValue(wModel, parentFrame, dataModel.top, 'y');
            model.bottom = this.getComputedValue(wModel, parentFrame, dataModel.bottom, 'y');

            model.width = this.getComputedValue(wModel, parentFrame, dataModel.width, 'x', 'width');
            model.minWidth = this.getComputedValue(wModel, parentFrame, dataModel.minWidth, 'x');
            model.maxWidth = this.getComputedValue(wModel, parentFrame, dataModel.maxWidth, 'x');

            model.height = this.getComputedValue(wModel, parentFrame, dataModel.height, 'y', 'height');
            model.minHeight = this.getComputedValue(wModel, parentFrame, dataModel.minHeight, 'y');
            model.maxHeight = this.getComputedValue(wModel, parentFrame, dataModel.maxHeight, 'y');
        },

        computeKeyFrameValues: function(wModel, wNode, flexNode, frameObj) {
            var framesArray = [];
            var result = {};
            if(frameObj) {
                wModel.finalFrame = {};

                
                if(!(wModel.isTemplate && wModel.containerType == 'CollectionView')) {
                    wNode = wNode.parentNode;
                }
                var parentModel = wModel.parent;
                flexNode = flexNode || $KW.Utils.getWidgetNode(parentModel);
                var parentFrame = parentModel.frame;

                this.computeLayoutValues(wModel, flexNode, parentFrame, frameObj);
                this.determineSize(flexNode, wModel, wNode, false);

                var widgetFrame = $KW.FlexUtils.getWidgetFrame(wModel, wNode, false);
                var layoutModel = wModel.layoutModel;

                
                if(wModel.finalFrame.width && (layoutModel.centerX || layoutModel.right)) {
                    var width = wModel.finalFrame.width;
                    var valueObj = {
                        value: parseFloat(width),
                        unit: $KW.FlexUtils.getUnit(width)
                    };
                    widgetFrame.width = $KW.FlexUtils.getValueByParentFrame(wModel, valueObj, 'x');
                }

                if(wModel.finalFrame.height && (layoutModel.centerY || layoutModel.bottom)) {
                    var height = wModel.finalFrame.height;
                    var valueObj = {
                        value: parseFloat(height),
                        unit: $KW.FlexUtils.getUnit(height)
                    };
                    widgetFrame.height = $KW.FlexUtils.getValueByParentFrame(wModel, valueObj, 'y');
                }
                if(wModel.isTemplate && wModel.containerType == 'CollectionView') {
                    this.determineX(wModel, widgetFrame, flexNode, parentFrame);
                    this.determineY(wModel, widgetFrame, flexNode, parentFrame);
                } else {
                    var widgetIndex = $KW.Utils.getWidgetIndex(wModel);
                    var widgets = parentModel.widgets();
                    var prevModel, prevSibling;
                    var prevWidgetInfo = this.getPreviousNode(wModel, wNode, flexNode)
                    if(prevWidgetInfo) {
                        prevModel = prevWidgetInfo[0];
                        prevSibling = prevWidgetInfo[1];
                    }
                    var prevFrame = prevSibling && $KW.FlexUtils.getWidgetFrame(prevModel, prevSibling);

                    if(parentModel.layouttype == kony.flex.FLOW_HORIZONTAL) {
                        this.determineHorizontalFlowX(wModel, widgetFrame, prevModel, prevFrame);
                    } else
                        this.determineX(wModel, widgetFrame, flexNode, parentFrame);

                    if(parentModel.layouttype == kony.flex.FLOW_VERTICAL) {
                        this.determineVerticalFlowY(wModel, widgetFrame, prevModel, prevFrame);
                    } else
                        this.determineY(wModel, widgetFrame, flexNode, parentFrame);
                }
                if(!wModel.finalFrame.left)
                    wModel.finalFrame.left = '0px';

                if(!wModel.finalFrame.top)
                    wModel.finalFrame.top = '0px';

                for(var prop in wModel.finalFrame)
                    result[prop] = wModel.finalFrame[prop];

                framesArray.push(result);
                if(wModel.isTemplate && wModel.containerType == 'CollectionView') return framesArray;
                
                if(parentModel.layouttype == kony.flex.FLOW_HORIZONTAL) {
                    if(result.left || result.width || result["min-width"] || result["max-width"]) {
                        for(var i = widgetIndex + 1; i < widgets.length; i++) {
                            var nextWidget = widgets[i];
                            var prevWidget = widgets[i - 1];
                            var frame = nextWidget.frame;
                            if(nextWidget.isvisible && frame) {
                                var prevFrame = {};
                                var width;

                                prevFrame.x = result.left ? parseInt(result.left, 10) : prevWidget.frame.x;

                                if(result.width) {
                                    if(result.width.indexOf('%') != -1)
                                        width = $KW.FlexUtils.getValueByParentFrame(wModel, {
                                            value: parseInt(result.width, 10),
                                            unit: '%'
                                        }, 'x');
                                    else
                                        width = parseInt(result.width, 10);
                                } else if(result["min-width"]) {
                                    width = parseInt(result["min-width"], 10);
                                    if(width < prevWidget.frame.width) {
                                        width = prevWidget.frame.width;
                                        result["min-width"] = prevWidget.frame.width + 'px';
                                    }
                                } else if(result["max-width"]) {
                                    width = parseInt(result["max-width"], 10);
                                    if(width > prevWidget.frame.width) {
                                        width = prevWidget.frame.width;
                                        result["max-width"] = prevWidget.frame.width + 'px';
                                    }
                                } else
                                    width = prevWidget.frame.width;

                                prevFrame.width = width;
                                this.computeLayoutValues(nextWidget, flexNode, parentFrame);
                                nextWidget.finalFrame && this.determineHorizontalFlowX(nextWidget, frame, prevWidget, prevFrame);
                                if(nextWidget.finalFrame)
                                    result = {
                                        left: nextWidget.finalFrame.left
                                    };
                                framesArray.push(result);
                            }
                        }
                    }
                    if(parentModel.reverselayoutdirection) {
                        framesArray = this.applyAnimationFrameReverseStacking(framesArray, widgetIndex, parentModel, flexNode);
                    }
                }

                if(parentModel.layouttype == kony.flex.FLOW_VERTICAL) {
                    if(result.top || result.height || result["min-height"] || result["max-height"]) {
                        for(var i = widgetIndex + 1; i < widgets.length; i++) {
                            var nextWidget = widgets[i];
                            var prevWidget = widgets[i - 1];
                            var frame = nextWidget.frame;
                            if(nextWidget.isvisible && frame) {
                                var prevFrame = {};
                                var height;

                                prevFrame.y = result.top ? parseInt(result.top, 10) : prevWidget.frame.y;

                                if(result.height) {
                                    if(result.height.indexOf('%') != -1)
                                        height = $KW.FlexUtils.getValueByParentFrame(wModel, {
                                            value: parseInt(result.height, 10),
                                            unit: '%'
                                        }, 'y');
                                    else
                                        height = parseInt(result.height, 10);
                                } else if(result["min-height"]) {
                                    height = parseInt(result["min-height"], 10);
                                    if(height < prevWidget.frame.height) {
                                        height = prevWidget.frame.height;
                                        result["min-height"] = prevWidget.frame.height + 'px';
                                    }
                                } else if(result["max-height"]) {
                                    height = parseInt(result["max-height"], 10);
                                    if(height > prevWidget.frame.height) {
                                        height = prevWidget.frame.height;
                                        result["max-height"] = prevWidget.frame.height + 'px';
                                    }
                                } else
                                    height = prevWidget.frame.height;

                                prevFrame.height = height;
                                this.computeLayoutValues(nextWidget, flexNode, parentFrame);
                                nextWidget.finalFrame && this.determineVerticalFlowY(nextWidget, frame, prevWidget, prevFrame);
                                if(nextWidget.finalFrame) 
                                    result = {
                                        top: nextWidget.finalFrame.top
                                    };
                                framesArray.push(result);
                            }
                        }
                    }
                    if(parentModel.reverselayoutdirection) {
                        framesArray = this.applyAnimationFrameReverseStacking(framesArray, widgetIndex, parentModel, flexNode);
                    }
                }
            }
            return framesArray;
        },

        isAvailable: function(value) {
            return value == undefined ? false : true;
        },

        toPointwidget: function(wModel, parentModel, value, axis) {
            if(!$KU.isValidCSSLength(value))
                return null;
            var resultObj = $KW.FlexUtils.getValueAndUnit(wModel, value);
            var value = resultObj.value;
            var unit = resultObj.unit;

            var wNode = $KW.Utils.getWidgetNode(wModel);
            var elePos = $KW.Utils.getPosition(wNode);
            var parentNode = $KW.Utils.getWidgetNode(parentModel);
            var parPos = $KW.Utils.getPosition(parentNode);

            if(axis == "x") {
                value = parPos.left - elePos.left + value;
            } else if(axis == "y") {
                value = parPos.top - elePos.top + value;
            }

            return {
                value: value,
                unit: unit
            };
        },

        
        getPreviousNode: function(wModel, wNode, flexNode) {
            var widgetIndex = $KW.Utils.getWidgetIndex(wModel);
            if(widgetIndex == 0)
                return null;

            var parentModel = wModel.parent;
            var widgets = parentModel.widgets();
            var prevIndex = widgetIndex - 1;
            var previousNode = wNode.previousSibling;
            if(!previousNode)
                return null;

            for(var i = prevIndex; i >= 0; i--) {
                var prevModel = $KW.Utils.getActualWidgetModel(widgets[i]);
                if(!this.isVisible(prevModel, flexNode)) {
                    if(!flexNode.dataObj) { 
                        
                        var flexNode = $KU.getNodeByModel(parentModel);
                        if(!flexNode.getAttribute("kcontainerID"))
                            previousNode = previousNode.previousSibling;
                    }
                    continue;
                }
                return [prevModel, previousNode];
            }
        },

        
        canLayoutUI: function(flexModel, wModel, flexNode) {
            if(!$KU.needOptimization) {
                if(!this.isVisible(wModel, flexNode)) {
                    return false;
                }

                return true;
            }

            if($KG.isUILayedOut) {
                var widgetConfig = wModel.layoutConfig;
                var containerConfig = flexModel.layoutConfig;
                var layoutType = flexModel.layouttype;

                if(layoutType == kony.flex.FLOW_HORIZONTAL
                || layoutType == kony.flex.FLOW_VERTICAL) {
                    if(widgetConfig.self) {
                        containerConfig.children = true;
                    }
                }

                if(widgetConfig.self || containerConfig.children) {
                    if(!this.isVisible(wModel, flexNode)) { 
                        widgetConfig.self = false;
                        return false;
                    }

                    return true;
                } else if(['FlexContainer', 'FlexScrollContainer', 'Segment', 'CollectionView', 'TabPane'].indexOf(wModel.wType) >= 0) { 
                    this.layoutNestedConatiners(wModel);
                    return false;
                } else {
                    return false;
                }
            } else if(!this.isVisible(wModel, flexNode)) {
                return false;
            }

            return true;
        },

        getWidgetFrame: function(wModel, dimensions, position) {
            var left = position.left || '0px';
            var leftObj = {
                value: parseFloat(left),
                unit: $KW.FlexUtils.getUnit(left)
            };
            left = $KW.FlexUtils.getValueByParentFrame(wModel, leftObj, 'x');
            var top = position.top || '0px';
            var topObj = {
                value: parseFloat(top),
                unit: $KW.FlexUtils.getUnit(top)
            };
            top = $KW.FlexUtils.getValueByParentFrame(wModel, topObj, 'y');
            return {
                x: left,
                y: top,
                width: dimensions.width,
                height: dimensions.height
            };
        },

        isVisible: function(wModel, flexNode) {
            if(flexNode && flexNode.dataObj) {
                
                var dataObj = flexNode.dataObj;
                var rowData = dataObj.data;
                var map = dataObj.map;
                var path = $KW.Utils.getWidgetPathByModel(wModel);
                var data = rowData[map[path]];

                
                if(data && data instanceof Object
                && typeof data.isVisible != "undefined") {
                    return data.isVisible;
                } else if(wModel.wType != 'FlexContainer'
                && (typeof data === "undefined" || data === "")) {
                    return false;
                }

                if(wModel.wType == 'FlexContainer' && wModel.widgets().length == 0) return false;
            }
            return wModel.isvisible;
        }
    };


    return module;
}());
