
$KW.FlexContainer = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "FlexContainer", this.eventHandler);
            kony.events.addEvent("onorientationchange", "FlexContainer", this.orientationHandler);
        },

        initializeView: function(formId) {
            
            this.attachResizeEvent(formId, "FlexContainer");
        },

        orientationHandler: function(formId, orientation) {
            
        },

        
        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;

            switch(propertyName) {
                case "clipbounds":
                    var isFlexWidget = $KW.FlexUtils.isFlexWidget(widgetModel);
                    element = isFlexWidget ? element.parentNode.parentNode : element;
                    var wrapperNode = isFlexWidget ? element.parentNode.parentNode : element;
                    if(propertyValue == false) {
                        element.style.overflow = "visible";
                        wrapperNode.style.overflow = "visible";
                    } else {
                        element.style.overflow = "hidden";
                        element.style.boxShadow = "none";
                        wrapperNode.style.overflow = "hidden";
                    }
                    break;
                case "layouttype":
                    module.adjustFlexContainer(widgetModel);
                    break;
            }
        },

        render: function(flexModel, context) {
            if(flexModel.isMaster) {
                $KI.i18n && $KI.i18n.translateFormModel(flexModel);
            }
            return this.renderTableLayout(flexModel, context);
        },

        renderTableLayout: function(flexModel, context) {
            var computedSkin = $KW.skins.getWidgetSkinList(flexModel, context);
            var isFlexWidget = $KW.FlexUtils.isFlexContainer(flexModel);
            var overflow = "";
            if(isFlexWidget && (flexModel.clipbounds == true)) {
                overflow = "overflow:hidden;box-shadow:none";
            }
            var boxstyle = " position:relative;" + overflow + (flexModel.zindex ? "z-index:" + flexModel.zindex : "");
            var style = (flexModel.parent && flexModel.parent.wType == 'TabPane') ? '' : $KW.skins.getBaseStyle(flexModel, context);

            var htmlString = "";
            htmlString += "<div id='flexcontainer_wrapper' class=' ' style='width:100%; " + style + "'>";
            htmlString += "<div class = 'kwt100 " + computedSkin + "'" + $KW.Utils.getBaseHtml(flexModel, context) + " style='" + boxstyle + "'>";


            var wArrary = flexModel.widgets();
            if(wArrary.length > 0) {
                htmlString += this.renderChildren(flexModel, wArrary, context);
            }

            htmlString += "</div></div>";
            return htmlString;
        },

        renderChildren: function(flexModel, wArrary, context) {
            var htmlString = "";
            for(var i = 0; i < wArrary.length; i++) {
                var childModel = wArrary[i];
                var css = "kcell " + (childModel.wType == "TPW" ? "konycustomcss " : "") + (childModel.isvisible ? "" : "hide ");
                var style = $KW.FlexUtils.getFlexLayoutStyle(childModel);
                var overflow = "";
                if((childModel.wType == 'FlexContainer' || childModel.wType == 'FlexScrollContainer') && !childModel.clipbounds) {
                    overflow = ';overflow:visible';
                } else {
                    overflow = ';overflow:hidden';
                    overflow += ((childModel.wType == 'FlexContainer' || childModel.wType == 'FlexScrollContainer') && childModel.clipbounds) ? ";" + $KU.cssPrefix + "box-shadow:none" : "";
                    css += childModel.skin;
                }
                htmlString += "<div class = '" + css + "' style='" + style + overflow + ((childModel.wType == 'TextArea' || childModel.wType == 'Switch' || childModel.wType == 'Image') ? 'font-size:0px' : '') + "'>";
                if(childModel.wType == "HBox" || childModel.wType == "VBox") {
                    context.topLevelBox = true;
                }
                htmlString += $KW[childModel.wType].render(childModel, context);
                htmlString += "</div>";
            }
            return htmlString;
        },

        adjustFlexContainers: function(containerModel, containerNode) {
            if(containerModel.wType == 'Segment') {
                $KW.Segment.adjustFlexContainersInSegment(containerModel, containerNode);
            }
            if(containerModel.wType == 'CollectionView') {
                $KW.CollectionView.adjustFlexContainersInCollectionView(containerModel, containerNode);
                if(containerModel.layouttype != kony.collectionview.LAYOUT_CUSTOM)
                    $KW.CollectionView.applyLineSpaceAndItemSpace(containerModel, containerNode);
            }
        },

        adjustFlexContainer: function(flexModel, flexNode) {
            if(!flexNode) {
                if(flexModel.wType == 'Form' || flexModel.wType == 'Popup')
                    flexNode = document.getElementById(flexModel.id + "_scroller") || document.getElementById(flexModel.id);
                else
                    flexNode = flexNode || $KW.Utils.getWidgetNode(flexModel);
            }
            if(!flexNode)
                return;
            if(flexModel.wType == 'FlexContainer' && flexModel.autogrowHeight) {
                flexModel.layoutConfig.children = true;
            }
            var widgets = flexModel.widgets();
            $KW.FlexLayoutEngine.performFlexLayout(flexModel.layouttype, flexModel, flexNode, widgets);
        },

        forceLayout: function(flexModel, flexNode) {
            if(flexModel.wType == 'Form' || flexModel.wType == 'Popup')
                flexNode = document.getElementById(flexModel.id + "_scroller") || document.getElementById(flexModel.id);
            else
                flexNode = flexNode || $KW.Utils.getWidgetNode(flexModel);

            if(flexNode && flexModel.isvisible) {
                var containerId = (flexModel.wType == 'FlexContainer') ? flexNode.childNodes[0].getAttribute("kcontainerID") : flexNode.getAttribute("kcontainerID");
                containerId && $KW.Utils.updateContainerDataInDOM(flexNode, containerId);

                if((flexModel.parent && !$KW.FlexUtils.isFlexWidget(flexModel) && flexModel.wType != 'Form') || (flexModel.wType == 'FlexContainer' && !flexModel.parent)) {
                    var containerModel = flexNode.dataObj && flexNode.dataObj.containerModel;
                    if(containerModel && containerModel.wType == 'CollectionView' && containerModel.layouttype == kony.collectionview.LAYOUT_CUSTOM) {
                        flexModel.finalFrame = {};
                        $KW.FlexLayoutEngine.computeLayoutValues(flexModel, flexNode, containerModel.frame);
                        $KW.FlexLayoutEngine.determineSize($KU.getNodeByModel(containerModel), flexModel, flexNode);
                        var dimensions = $KW.FlexUtils.getWidgetDimensions(flexModel, flexNode);
                        $KW.FlexLayoutEngine.determineX(flexModel, dimensions, flexNode, containerModel.frame);
                        $KW.FlexLayoutEngine.determineY(flexModel, dimensions, flexNode, containerModel.frame);
                        $KW.FlexUtils.setWidgetPosition(flexModel, flexModel.finalFrame, flexNode);
                        flexModel.frame = $KW.FlexLayoutEngine.getWidgetFrame(flexModel, dimensions, flexModel.finalFrame);
                    } else {
                        $KW.FlexUtils.setFlexContainerStyle(flexModel, flexNode);
                        flexModel.frame = $KW.FlexUtils.getWidgetFrame(flexModel, flexNode);
                    }
                    flexModel.dolayout && $KU.executeWidgetEventHandler(flexModel, flexModel.dolayout);
                }
                if(flexModel.wType == 'Form') {
                    flexModel.frame = $KW.FlexUtils.getWidgetFrame(flexModel, flexNode);
                }
                if(flexModel.wType == 'FlexContainer') {
                    var computedStyle = $KU.getComputedStyle(flexNode);
                    if(computedStyle) {
                        flexModel.hBorder = parseInt(computedStyle["border-left-width"], 10) + parseInt(computedStyle["border-right-width"], 10);
                        flexModel.vBorder = parseInt(computedStyle["border-top-width"], 10) + parseInt(computedStyle["border-bottom-width"], 10);
                    }
                    
                    
                }
                this.adjustFlexContainer(flexModel, flexNode);
            }
        },

        eventHandler: function(eventObject, target) {
            var widgetModel = $KU.getModelByNode(target),
            containerId = target.getAttribute("kcontainerID");
            widgetModel = $KW.Utils.getActualWidgetModel(widgetModel);

            widgetModel.blockeduiskin && $KW.skins.applyBlockUISkin(widgetModel);

            $KAR && $KAR.sendRecording(widgetModel, 'click', {'target': target, 'eventType': 'uiAction'});

            spaAPM && spaAPM.sendMsg(widgetModel, 'onclick');
            
            if(containerId) {
                $KW.Utils.updateContainerData(widgetModel, target, true);
            } else {
                var executed = kony.events.executeBoxEvent(widgetModel);
                var tabId = target.getAttribute("ktabid");
                if(!executed && tabId) {
                    $KW.TabPane && $KW.TabPane.executeTabEvent(widgetModel, target, true);
                }
            }
        },

        attachResizeEvent: function(formId, type) {
            var flexContainers = document.querySelectorAll("#" + formId + " div[kwidgettype='" + type + "']");
            for(var i = 0; i < flexContainers.length; i++) {
                var flexModel = $KU.getModelByNode(flexContainers[i]);
                var flexNode = flexContainers[i];
                flexModel.onDrag && new $KW.touch.Drag(flexModel, flexNode, flexNode, '', this.dragEvent, flexNode);
                var children = flexModel.children;
                for(var j = 0; children && j < children.length; j++) {
                    var wModel = flexModel[children[j]];
                    this.attachDragEvent(wModel);
                }
            }
        },

        attachDragEvent: function(wModel) {
            if(wModel.onDrag) {
                var node = $KU.getNodeByModel(wModel);
                node = node.parentNode;
                new $KW.touch.Drag(wModel, node, node, '', this.dragEvent, node);
            }
        },

        dragEvent: function(dragNode, x, y, type) {
            dragNode = dragNode.getAttribute("kwidgettype") ? dragNode : dragNode.childNodes[0];
            var flexModel = $KU.getModelByNode(dragNode);
            flexModel.onDrag && flexModel.onDrag(flexModel, x, y, type);
        },

        executeOnParent: function(flexModel, callback, args) {
            if(!flexModel._konyControllerName)
                return;
            var formModel = $KG["__currentForm"];
            if($KU.checkHeaderFooterTemplate(formModel, flexModel)) {
                var parentModel = formModel;
            } else {
                var widgetModel = $KU.getWidgetModelByID(flexModel.formPathId);
                if(!widgetModel) {
                    kony.web.logger("warn", "widgetModel is not available");
                    return;
                } else {
                    var parentModel = widgetModel;
                    while(parentModel) {
                        parentModel = parentModel.parent;
                        if(parentModel._konyControllerName)
                            break;
                    }
                }
            }
            _kony.mvc.executeInJsContext(parentModel, callback, args);
        }
    };


    return module;
}());
