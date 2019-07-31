

$KW.formTransitionsMatrix = {
    "topCenter": "slidetopin",
    "bottomCenter": "slidebottomin",
    "rightCenter": "sliderightin",
    "leftCenter": "slideleftin",
    "fadeAnimation": "fadein",
    "anim1": "slidetopin",
    "anim2": "sliderightin",
    "anim3": "slideleftin",
    "anim4": "sliderightout",
    "anim5": "slideleftout",
    "anim6": "scalein",
    "anim7": "slidetoprightin",
    "anim8": "slidebottomleftin",
    "anim9": "expandvertically",
    "anim10": "slidebottomin"
};
$KW.formEndTransitionsMatrix = {
    "rightCenter": "sliderightout",
    "leftCenter": "slideleftout",
    "topCenter": "slidetopout",
    "bottomCenter": "slidebottomout",
    "fadeAnimation": "fadeout",
    "anim1": "slidetopout",
    "anim2": "sliderightout",
    "anim3": "slideleftout",
    "anim4": "sliderightin",
    "anim5": "slideleftin",
    "anim6": "scaleout",
    "anim7": "slidetoprightout",
    "anim8": "slidebottomleftout",
    "anim9": "shrinkvertically",
    "anim10": "slidebottomout"
};
$KW.stringifyScrolldirection = {
    1: "horizontal",
    2: "vertical",
    3: "both",
    4: "none"
};

$KW.Widget = {
    
    addgesturerecognizer: function(widgetModel, gestureType, gestureObj, callback) {
        if(!widgetModel)
            return null;

        var gestureEventObject = $KW.Utils.updateModelWithGesture(widgetModel, gestureType, gestureObj, callback);
        return(new $KW.touch.gesture(widgetModel, gestureEventObject)).gestureIdentifier;
    },
    
    setgesturerecognizer: function(widgetModel, gestureType, gestureObj, callback) {
        if(!widgetModel)
            return null;

        
        var _gestureType = (gestureType == 1 ? (gestureObj.taps == 1 ? 10 : 11) : gestureType);
        $KW.Widget.removegesturerecognizer(widgetModel, _gestureType);
        var gestureEventObject = $KW.Utils.updateModelWithGesture(widgetModel, gestureType, gestureObj, callback);
        return(new $KW.touch.gesture(widgetModel, gestureEventObject)).gestureIdentifier;
    },

    removegesturerecognizer: function(widgetModel, gestureType) {
        var identifier = gestureType;
        if(typeof(gestureType) === "string") {
            var gestureIdentifier = ($KG.gestures && $KG.gestures[gestureType]) ? $KG.gestures[gestureType] : null;
            if(!gestureIdentifier) return;
            widgetModel = gestureIdentifier.widgetModel;
            gestureType = gestureIdentifier.gestureType;
            delete $KG.gestures[identifier];
        }

        if(!widgetModel)
            return;

        if(gestureType == constants.GESTURE_TYPE_TAP) {
            
            $KW.Utils.removegesture(widgetModel, 10, true, identifier);
            $KW.Utils.removegesture(widgetModel, 11, true, identifier);
        } else
            $KW.Utils.removegesture(widgetModel, gestureType, true, identifier);
    },

    setgesturerecognizerforallforms: function(gestureType, gestureObj, callback) {
        $KU.logExecuting('kony.application.setGestureRecognizerForAllForms');
        $KU.logExecutingWithParams('kony.application.setGestureRecognizerForAllForms', gestureType, gestureObj, callback);
        var _gestureType = (gestureType == 1 ? (gestureObj.taps == 1 ? 10 : 11) : gestureType);
        $KW.Widget.removegesturerecognizerforallforms(_gestureType);
        var gestureEventObject = $KW.Utils.updateModelWithGesture("", gestureType, gestureObj, callback);
        $KU.logExecutingFinished('kony.application.setGestureRecognizerForAllForms');
        return(new $KW.touch.gesture("", gestureEventObject)).gestureIdentifier;
    },

    addgesturerecognizerforallforms: function(gestureType, gestureObj, callback) {
        var gestureEventObject = $KW.Utils.updateModelWithGesture("", gestureType, gestureObj, callback);
        return(new $KW.touch.gesture("", gestureEventObject)).gestureIdentifier;
    },

    removegesturerecognizerforallforms: function(gestureType) {
        $KU.logExecuting('kony.application.removeGestureRecognizerForAllForms');
        if(typeof gestureType == "string") {
            var gestureIdentifier = ($KG.gestures && $KG.gestures[gestureType]) ? $KG.gestures[gestureType] : null;
            if(!gestureIdentifier) {
                $KU.logErrorMessage('Invalid gestureType');
                return;
            }
            var identifier = gestureType;
            gestureType = gestureIdentifier.gestureType;
            delete $KG.gestures[identifier];
        }
        $KU.logExecutingWithParams('kony.application.removeGestureRecognizerForAllForms', gestureType);
        $KW.Widget.removegesturerecognizer($KG, gestureType);
        $KU.logExecutingFinished('kony.application.removeGestureRecognizerForAllForms');
    },
};


$KW.Utils = {
    isWidgetInteractable: function(widgetNode, forced) {
        var interactable = true;

        if((($KG.appbehaviors[constants.API_LEVEL] >= constants.API_LEVEL_8300 || forced)
        && widgetNode.getAttribute('kdisabled') === 'true')
        || widgetNode.getAttribute('notinmodal') === 'true') {
            interactable = false;
        }

        return interactable;
    },

    getBaseHtml: function(widgetModel, context, type, accessObj, rowIndex) {
        var id = type ? widgetModel.id : (widgetModel.pf + "_" + widgetModel.id);
        var tabpaneID = context.tabpaneID || "";
        var containerID = (context.container && context.container.id) || "";
        var toolTip = widgetModel.tooltip || "";
        var isDisabled = this.isWidgetDisabled(widgetModel, context) || false;
        if(tabpaneID)
            widgetModel.tabpaneId = tabpaneID;
        if(containerID)
            widgetModel.containerId = containerID;
        var disable = isDisabled ? (" kdisabled='true' " + ((widgetModel.wType != "Image" && widgetModel.wType != "HBox" && widgetModel.wType != "VBox" && widgetModel.wType != "Link" && widgetModel.wType != "Label") ? "disabled=" + isDisabled : "")) : "";
        var contextmenu = widgetModel.contextmenu || "";

        
        var kmasterObj = this.getMasterIDObj(widgetModel);
        if(widgetModel.isImageOverlayWidget) {
            id = widgetModel.id;
        } else {
            if(kmasterObj.id != "") {
                id = kmasterObj.id;
            }
        }
        if(widgetModel.wType == "Segment") {
            
            widgetModel.formPathId = id;
        }
        
        var accessAttr = "";
        if(widgetModel.wType != "Link" && widgetModel.wType != "Label" && widgetModel.wType != "ScrollBox" && widgetModel.wType != "RadioButtonGroup")
            accessAttr = $KU.getAccessibilityValues(widgetModel, accessObj, null, rowIndex);

        
        if((widgetModel.wType == "HBox" || widgetModel.wType == "Segment" || widgetModel.wType == "VBox" || widgetModel.wType == "HStrip") && (accessAttr.indexOf("aria-hidden")) > 0) {
            accessAttr = "";
        }

        var overlay = "";
        if(widgetModel.isImageOverlayWidget) {
            overlay = "overlay=true";
        }

        return accessAttr + " id='" + id + "' kwidgettype='" + widgetModel.wType + "' kformname='" + widgetModel.pf + "'" + (tabpaneID && " ktabpaneid='" + tabpaneID + "'") + kmasterObj.kmasterid + (containerID && " kcontainerID = '" + containerID + "'") + disable + (toolTip ? " title= '" + toolTip + "'" : "") + " " + overlay + " ";
    },

    
    getMasterIDObj: function(widgetModel) {
        var kmasterid = widgetModel.kmasterid;
        var id = "";
        if(kmasterid && kmasterid != "") {
            widgetModel.kmasterid = kmasterid;
            id = widgetModel.pf + "_" + kmasterid + "_" + widgetModel.id;
            kmasterid = " kmasterid = '" + kmasterid + "' ";
        } else {
            kmasterid = "";
        }
        return {
            id: id,
            kmasterid: kmasterid
        };
    },

    getWidgetPathByModel: function(model) {
        var path = model.id;

        if(model.kmasterid) {
            path = model.kmasterid.split('_').join('.') + '.' + path;
        }

        return path;
    },

    getMasterWidgetModel: function(widgetModel) {
        while(widgetModel) {
            if(widgetModel.isMaster) {
                return widgetModel;
            }
            widgetModel = widgetModel.parent;
        }
    },

    getKMasterWidgetID: function(widgetModel) {
        var id = widgetModel.pf + "_" + widgetModel.id;
        if(widgetModel.kmasterid && widgetModel.kmasterid != "") {
            id = widgetModel.pf + "_" + widgetModel.kmasterid + "_" + widgetModel.id;
        }
        return id;
    },
    
    getActualWidgetModel: function(givenWidgetModel, updateUDWChildsPFFlag) {
        if(givenWidgetModel.wType == 'KComponent') {
            var proxyModel = givenWidgetModel.userWidgetProxyObject;
            if(updateUDWChildsPFFlag) {
                proxyModel.kComponentModel = givenWidgetModel;
                this.updatePFForUDWChilds(proxyModel, givenWidgetModel.pf);
            }
            return proxyModel;
        }
        return givenWidgetModel;
    },

    updatePFForUDWChilds: function(widgetModel, pf) {
        widgetModel.pf = pf;
        if(widgetModel.isContainerWidget) {
            for(var i = 0; i < widgetModel.children.length; i++) {
                var childModel = widgetModel[widgetModel.children[i]];
                this.updatePFForUDWChilds(childModel, pf);
            }
        }
    },

    isWidgetDisabled: function(wModel, context) {
        if(context && context.container && context.container.widgetsData)
            return this.isContainerWidgetDisabled(wModel, context);
        if(wModel.disabled)
            return true;
        var formId = wModel.pf;
        var pModel = wModel.parent;
        while(pModel) {
            if(pModel.disabled || (formId == (pModel.parent && pModel.parent.id))) {
                return pModel.disabled;
            }
            pModel = pModel.parent;
        }
    },

    isContainerWidgetDisabled: function(wModel, context) {

        var data = context.container.widgetsData;
        var wData = data[wModel.id];
        if(wData && wData.enable != undefined && wData.enable == false)
            return true;
        var formId = wModel.pf;
        var pData, pDisabled;
        var pModel = wModel.parent;
        while(pModel) {
            pData = data[pModel.id];
            pDisabled = (pData && pData.enable != undefined && pData.enable == false);
            if(pDisabled || (context.container.id == pModel.id)) {
                return pDisabled;
            }
            pModel = pModel.parent;
        }
    },

    isWidgetVisible: function(wModel, context) {
        if(context && context.container && context.container.widgetsData) {
            var data = context.container.widgetsData;
            var wData = data[wModel.id];
            if(wData)
                return(wData.visible != undefined ? wData.visible : wModel.isvisible);
        }
        return wModel.isvisible;
    },

    
    initializeNewWidgets: function(wArray) {


        if(wArray && wArray.length > 0) {
            for(var i = 0; i < wArray.length; i++) {
                var widgetModel = wArray[i];
                widgetModel = $KW.Utils.getActualWidgetModel(widgetModel);
                var wType = widgetModel.wType;
                switch(wType) {
                    case "Segment":
                        var segment = $KU.getNodeByModel(widgetModel);
                        if(segment) {
                            if(widgetModel.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW) {
                                $KG[segment.id] = new $KW.touch.pageviewScroller(segment, {
                                    widgetModel: widgetModel
                                });
                                $KW.touch.computeWidths(segment, widgetModel);
                            }
                            if(widgetModel.screenLevelWidget || widgetModel.needScroller) {
                                widgetModel.needScroller && $KU.setScrollHeight(widgetModel, segment);
                                var pNode = segment.parentNode.parentNode;
                                $KW.Scroller.initialize([pNode], "Segment");
                            }
                            $KW.Segment.initializeNewWidgets(segment);
                        }
                        break;
                    case "CollectionView":
                        var cvNode = $KU.getNodeByModel(widgetModel);
                        if(cvNode) {
                            if(widgetModel.needScroller) {
                                $KU.setScrollHeight(widgetModel, cvNode);
                                var pNode = cvNode.firstChild;
                                $KW.Scroller.initialize([pNode], "CollectionView");
                            }
                            $KW.CollectionView.initializeNewWidgets(cvNode);
                        }
                        break;

                    case "HStrip":
                        var strip = $KU.getNodeByModel(widgetModel);
                        if(strip) {
                            if(widgetModel.viewtype == constants.HORIZONTAL_IMAGESTRIP_VIEW_TYPE_STRIPVIEW) {
                                $KW.HStrip.initializeStripView(strip);
                            }
                            if(widgetModel.viewtype == constants.HORIZONTAL_IMAGESTRIP_VIEW_TYPE_PAGEVIEW) {
                                $KG[strip.id] = new $KW.touch.pageviewScroller(strip, {
                                    widgetModel: widgetModel
                                });
                                $KW.HStrip.initializePageView(widgetModel, false, strip);
                                $KW.touch.computeWidths(strip, widgetModel);
                            }
                            if(widgetModel.viewtype == constants.HORIZONTAL_IMAGESTRIP_VIEW_TYPE_SLOTVIEW) {
                                $KW.HStrip.initializeSlotView(widgetModel);
                            }
                        }
                        break;

                    case "ScrollBox":
                        var scrollBox = $KU.getNodeByModel(widgetModel);
                        if(scrollBox) {
                            var pNode = scrollBox.parentNode.parentNode;
                            $KW.Scroller.initialize([pNode], "ScrollBox");
                            $KU.setScrollHeight(widgetModel, scrollBox);
                        }
                        break;

                    case "FlexScrollContainer":
                        var scrollBox = $KU.getNodeByModel(widgetModel);
                        if(scrollBox) {
                            var pNode = scrollBox.parentNode.parentNode;
                            $KW.Scroller.initialize([pNode], "FlexScrollContainer");
                            
                            if(widgetModel.reverselayoutdirection) {
                                $KW.FlexScrollContainer.scrollToEnd(widgetModel);
                            }
                        }
                        break;

                    case "Slider":
                        var slider = $KU.getNodeByModel(widgetModel);
                        if(slider) {
                            $KW.Slider.attachSliderEvents(slider.childNodes[0]);
                            kony.events.addEventListener(slider.parentNode, "click", $KW.Slider.slideClick);
                        }
                        break;

                    case "Switch":
                        var switchNode = $KU.getNodeByModel(widgetModel);
                        if(switchNode) {
                            $KW.Switch.adjustWidth(widgetModel, switchNode, true);
                            $KW.Switch.adjustHeight(widgetModel, switchNode);
                        }
                        break;

                    case "Video":
                        if($KU.isAndroid) {
                            var video = $KU.getNodeByModel(widgetModel);
                            kony.events.addEventListener(video, 'click', function(event) {
                                event = event || window.event;
                                event.srcElement.play();
                            }, false);
                        }
                        break

                    case "TabPane":
                        var tabPane = $KU.getNodeByModel(widgetModel);
                        tabPane && $KW.TabPane.setTabsHeight(tabPane.id);
                        if(widgetModel.needScroller && tabPane) {
                            $KU.setScrollHeight(widgetModel, tabPane);
                            var pNode = tabPane.parentNode.parentNode;
                            $KW.Scroller.initialize([pNode], "TabPane");
                        }
                        break

                    case "Map":
                        $KW.Map.loadMapScripts();
                        $KW.Map.setUpInteractiveCanvasMap();
                        $KW.Map.setMapsHeight(widgetModel.pf);
                        break

                    case "Browser":
                        var browser = $KU.getNodeByModel(widgetModel);
                        if(browser && widgetModel.needScroller)
                            $KU.setScrollHeight(widgetModel, browser);
                        break
                        
                    case "Label":
                        var label = $KU.getNodeByModel(widgetModel);
                        if(label && widgetModel.linespacing)
                            $KW.Label.updateLineHeight(widgetModel, label);
                        break;
                }

                
                $KW.Utils.initializeGesturesForWidget(widgetModel);
                if(widgetModel.ownchildrenref) {
                    this.initializeNewWidgets(widgetModel.ownchildrenref);
                }

            }
        }
        
    },

    
    reinitializeWidgets: function(containerModel) {

        var wArray = containerModel.ownchildrenref;
        for(var i = 0; i < wArray.length; i++) {
            var widgetModel = wArray[i];
            var wType = widgetModel.wType;
            switch(wType) {
                case "ScrollBox":
                    var scrollBox = $KU.getNodeByModel(widgetModel);
                    $KW["ScrollBox"]["updateView"](widgetModel, "totalWt", widgetModel.totalWt);
                    $KU.setScrollHeight(widgetModel, scrollBox);
                    break;

                case "Slider":
                    var slider = $KU.getNodeByModel(widgetModel);
                    $KW.Slider.imgLoad(slider.childNodes[0]);
                    
                    break;

                case "Calendar":
                    var calendar = $KU.getNodeByModel(widgetModel);
                    $KW.Calendar.setCalElementStyle(calendar.childNodes[0], true);
                    break;

                case "Switch":
                    var element = $KU.getNodeByModel(widgetModel);
                    $KW.Switch.adjustWidth(widgetModel, element, false);
                    $KW.Switch.adjustHeight(widgetModel, element);
                    break;

            }

            if(widgetModel.ownchildrenref) {
                this.reinitializeWidgets(widgetModel);
            }
        }
    },

    
    resizeMap: function(wModel) {
        var map = document.querySelector("#" + wModel.pf + " div[kwidgettype='googlemap']");
        if(map) {
            var mapModel = $KU.getModelByNode(map);
            if(mapModel.mapSource == "non-native")
                google.maps.event.trigger($KW.Map.map, 'resize');
        }
    },

    updateContent: function(widgetModel, property, dataArray, action, index, secIndex, count) {
        
        var widgetData = widgetModel[property];

        if(widgetModel.wType == "Segment" && widgetModel.hasSections && widgetData && !["setdata", "removeall"].contains(action)) {
            $KW.Segment.updateSectionContent(widgetData, dataArray, action, index, secIndex);
            return;
        }

        if(widgetModel.wType == "CollectionView" && widgetModel.hasSections && widgetData && !["setdata", "removeall"].contains(action)) {
            $KW.CollectionView.Data.updateSectionContent(widgetData, dataArray, action, index, secIndex, count);
            return;
        }

        switch(action) {
            case "setdata":
                widgetModel.canUpdateUI = false;
                widgetModel[property] = dataArray;
                widgetModel.canUpdateUI = true;
                break;

            case "setdataat":
                widgetModel[property] && widgetModel[property].length > index
                if(widgetModel.wType == "CollectionView") {
                    for(var i = 0; i < dataArray.length; i++) {
                        widgetModel[property].splice(index++, 1, dataArray[i]);
                    }
                } else {
                    widgetModel[property].splice(index, 1, dataArray)
                }
                break;

            case "addall":
                var fillarray = IndexJL ? [null] : [];
                var newDataArray;
                widgetModel.canUpdateUI = false
                widgetModel[property] = widgetModel[property] || fillarray;

                
                
                if(IndexJL && !dataArray[0] && (dataArray[1] && !dataArray[1].template)) {
                    newDataArray = $KU.cloneObj(dataArray);
                    newDataArray.shift();
                }
                widgetModel.canUpdateUI = true
                $KU.addArray(widgetModel[property], newDataArray || dataArray);
                break;

            case "addat":
            case "adddataat":
                if(widgetModel[property]) {
                    var noOfRows = widgetModel[property].length - IndexJL;
                    index = (index <= IndexJL) ? IndexJL : (index > noOfRows ? noOfRows + 1 : index);
                    if($KU.isArray(dataArray)) {
                        for(var i = IndexJL; i < dataArray.length; i++) {
                            widgetModel[property].splice(index++, 0, dataArray[i]);
                        }
                    } else {
                        if(!widgetModel[property] || widgetModel[property].length <= IndexJL) {
                            widgetModel[property] = (IndexJL) ? [null] : [];
                            widgetModel[property].push(dataArray);
                        } else {
                            widgetModel[property].splice(index, 0, dataArray);
                        }
                    }
                }
                break;

            case "removeall":
                widgetModel.canUpdateUI = false;
                widgetModel[property] = dataArray;
                widgetModel.canUpdateUI = true;
                if(widgetModel.wType == "Segment" && widgetModel.behavior != "default")
                    widgetModel.selectedindices = null;
                break;

            case "removeat":
                (widgetModel[property] && widgetModel[property].length >= index && widgetModel[property][index]) && widgetModel[property].splice(index, 1);
                break;

            case "removedataat":
                if(widgetModel.wType == "CollectionView") {
                    (widgetModel[property] && widgetModel[property].length >= index && widgetModel[property][index]) && widgetModel[property].splice(index, count);
                }
                break;

        }
    },
    updateContainerData: function(childModel, childNode, canExecute, eventType) {
        var row = $KU.getParentByAttribute(childNode, "index");
        if(row) {
            var container = row.parentNode.parentNode;
            if(row.getAttribute('kwidgettype') == 'GridNode') {
                container = container.parentNode.parentNode;
            }
            var containerModel = $KU.getModelByNode(container);
            $KW[containerModel.wType].updateData(childModel, childNode, containerModel, row, canExecute, eventType);
        } else {
            $KW.MenuContainer && $KW.MenuContainer.eventHandler(childModel, childNode);
        }
    },

    
    updateContainerMasterData: function(containerModel, item, childModel, childNode, eventType) {
        var map = containerModel.widgetdatamap; 
        var context;
        
        if(map) {
            map = $KU.isArray(map) ? map[IndexJL] : map;
        }
        var clonedModel = childModel;
        if(containerModel.wType == 'Segment' || containerModel.wType == 'CollectionView') {
            context = {};
            var sectionIndex = context.sectionIndex = containerModel.currentIndex[0];
            var clonedTemplate;
            if(containerModel.wType == 'Segment') {
                var rowIndex = context.rowIndex = containerModel.currentIndex[1];
                clonedTemplate = $KW.Segment.getClonedModel(containerModel, rowIndex, sectionIndex);
            } else {
                var itemIndex = context.itemIndex = containerModel.currentIndex[1];
                clonedTemplate = $KW.CollectionView.Utils.getClonedModel(containerModel, itemIndex, sectionIndex);
            }
            if(!clonedTemplate) {
                return;
            }
            clonedModel = $KU.getValueFromObjectByPath($KW.Utils.getWidgetPathByModel(childModel), clonedTemplate);
            context.widgetInfo = containerModel;
        }
        var childMap = map ? map[$KW.Utils.getWidgetPathByModel(childModel)] : $KW.Utils.getWidgetPathByModel(childModel);
        var content = item[childMap];
        if(content instanceof Object) {
            if(childModel.wType == "Calendar") {
                if($KW.Calendar.isMultiRangeCalendar(childModel)) {
                    content.selectedDates = childModel.selecteddates;
                } else {
                    content.dateComponents = childModel.datecomponents;
                }
            } else if(childModel.wType == "CheckBoxGroup") {
                $KW.Utils.setSelectedKeys(content, childNode.checked, (content.selectedkeys || content.selectedKeys) || (IndexJL == 1 ? [null] : []), childNode.value);
                $KW.Utils.setSelectedValueProperty(content, (content.masterData || content.masterdata), "selectedkeys");
                content.selectedKeys = content.selectedkeys;
                content.selectedKeyValues = content.selectedkeyvalues;
            } else if(childModel.wType == "RadioButtonGroup" || childModel.wType == "ComboBox") {
                content.selectedkey = childModel.selectedkey;
                content.selectedKey = childModel.selectedkey;
                $KW.Utils.setSelectedValueProperty(content, content.masterData || content.masterdata, "selectedkey");
            } else if(childModel.wType == 'TextField' || childModel.wType == 'TextArea'){ 
                if(clonedModel.restrictcharactersset && eventType == "input"){
                    content.text = $KW.Utils.restrictCharactersSet(childNode, clonedModel);
                } else{
                    content.text = childModel.text;
                }
            }
            else if(childModel.wType == 'Switch')
                content.selectedIndex = childModel.selectedindex;
            else if(childModel.wType == 'Slider')
                content.selectedValue = childModel.selectedvalue;
            else if(childModel.wType == 'ListBox') {
                if(clonedModel.multiple == true) {
                    $KW.Utils.setSelectedKeysListBox(content, childNode);
                    $KW.Utils.setSelectedValueProperty(content, (content.masterData || content.masterdata), "selectedkeys");
                    content.selectedKeys = content.selectedkeys;
                    content.selectedKeyValues = content.selectedkeyvalues;
                } else {
                    content.selectedkey = childModel.selectedkey;
                    content.selectedKey = childModel.selectedkey;
                    $KW.Utils.setSelectedValueProperty(content, content.masterData || content.masterdata, "selectedkey");
                }
               if(clonedModel.viewType == constants.LISTBOX_VIEW_TYPE_EDITVIEW){
                   
               }
            }
            this.updateChildModel(clonedModel, content);
        } else {
            if(childModel.wType != 'Link' && (childModel.wType == 'TextField' || childModel.wType == 'TextArea')) {
                item[childMap] = childModel.text;
            } else if(childModel.wType == 'Switch') {
                item[childMap] = childModel.selectedindex;
            } else if(childModel.wType == 'Slider') {
                item[childMap] = childModel.selectedvalue;
            } else if(childModel.wType == "Calendar") {
                if($KW.Calendar.isMultiRangeCalendar(childModel)) {
                    item[childMap] = {
                        selectedDates: childModel.selecteddates,
                        dateFormat: childModel.dateformat
                    };
                } else {
                    item[childMap] = {
                        dateComponents: childModel.datecomponents,
                        dateFormat: childModel.dateformat
                    };
                }
            }
            this.updateChildModel(clonedModel, item[childMap]);
        }
        
        if(clonedModel.wType == "ComboBox")
            $KW.ComboBox.resetOption(clonedModel, childNode, clonedModel.masterdata);

        var callback;
        if(clonedModel.onSelection || clonedModel.onselection) {
            callback = $KU.returnEventReference(clonedModel.onselection || clonedModel.onSelection); 
        } else {
            callback = eventType && $KU.returnEventReference(clonedModel[eventType]);
        }

        if(callback) {
            if(context) {
                $KU.executeWidgetEventHandler(clonedModel, callback, context);
            } else {
                $KU.executeWidgetEventHandler(clonedModel, callback);
            }

        }
    },
    
    
    updateContainerDataInDOM: function(node, containerId) {
        
        var containerModel = $KW.Utils.getContainerModelById(node, containerId);
        if(containerModel) {
            if(containerModel.wType == 'Segment' || containerModel.wType == 'CollectionView') {
                var rowData;
                var row = $KU.getParentByAttribute(node, "index");
                var index = parseInt(row.getAttribute("index"));
                if(containerModel.hasSections) {
                    var secIndices = row.getAttribute("secindex").split(',');
                    var secIndex = parseInt(secIndices[0]);
                    var rowIndex = parseInt(secIndices[1]);
                    if(containerModel.wType == 'Segment') {
                        rowData = (rowIndex == -1) ? containerModel.data[secIndex][IndexJL] : containerModel.data[secIndex][IndexJL + 1][rowIndex];
                    } else {
                        if(node.getAttribute('type') == 'HeaderBox') {
                            rowData = containerModel.data[secIndex][IndexJL];
                        } else if(node.getAttribute('type') == 'FooterBox') {
                            rowData = containerModel.data[secIndex][IndexJL + 2];
                        } else {
                            rowData = containerModel.data[secIndex][IndexJL + 1][rowIndex];
                        }
                    }
                } else
                    rowData = containerModel.data[index];

                node.dataObj = {
                    data: rowData,
                    map: containerModel.widgetdatamap,
                    containerModel: containerModel
                };
            }
        }
    },

    getContainerNodeByparent: function(node, containerId) {
        var cur = node;
        if(containerId) {
            var id;
            while(cur) {
                id = cur.id;
                if(id) {
                    id = id.substring(id.lastIndexOf("_") + 1);
                }
                if(id == containerId) {
                    break
                }
                cur = cur.parentNode;
            }
        }
        return cur;

    },

    getContainerModelById: function(node, containerId) {
        var model = '';
        var cur = this.getContainerNodeByparent(node, containerId);
        while(cur) {
            model = $KU.getModelByNode(cur);
            if(model.wType == "Segment" || model.wType == "CollectionView") {
                break;
            } else {
                cur = this.getContainerNodeByparent(cur.parentNode, containerId);

            }
        }
        return model;
    },


    getSegProperty: function(prop) {
        var key = $KU.segmentKeyMap[prop];
        return key || prop;
    },
    getScrollerInstance: function(widgetModel) {
        var scrollerId = (widgetModel.pf ? widgetModel.pf + "_" : "") + widgetModel.id + "_scroller";
        if(widgetModel.kmasterid) {
            scrollerId = $KW.Utils.getKMasterWidgetID(widgetModel) + "_scroller"; 
        }
        return $KG[scrollerId];
    },



    
    updateChildModel: function(childModel, data) {
        childModel.canUpdateUI = false;

        if(data instanceof Object) {
            if(childModel.wType == "ListBox") {
                childModel.masterdata = "";
                childModel.masterdatamap = "";
                childModel.selectedkeys = null;
                !IndexJL && (data.selectedkeys = data.selectedKeys);
            }
            if(data instanceof Array) {
                if(childModel.wType == "Calendar") {
                    if($KW.Calendar.isMultiRangeCalendar(childModel)) {
                        if($KW.Calendar.isSelectedDatesValid(childModel, data)) {
                            childModel.selecteddates = $KW.Calendar.setTimeInDateComponents(data);
                        } else {
                            kony.web.logger("error", "Invalid date selection");
                        }
                    } else {
                        childModel.datecomponents = data;
                        childModel.date = data.slice(0, 3);
                    }
                }
            } else {
                for(var prop in data) {
                    var key = $KW.Utils.getSegProperty(prop).toLowerCase();
                    if(key == "disabled")
                        childModel[key] = !data[prop];
                    else {
                        if(childModel.wType == "Calendar" && key == "selecteddates" &&
                            $KW.Calendar.isMultiRangeCalendar(childModel)) {
                            if($KW.Calendar.isSelectedDatesValid(childModel, data[prop])) {
                                childModel.selecteddates = $KW.Calendar.setTimeInDateComponents(data[prop]);
                            } else {
                                kony.web.logger("error", "Invalid date selection");
                            }
                        } else {
                            childModel[key] = data[prop];
                        }
                    }

                    if(childModel.wType == "Image") {
                        if(prop == "base64")
                            childModel.srcType = 2;
                        else if(prop == "src")
                            childModel.srcType = 1;
                    }
                    if(childModel.wType == "HBox" || childModel.wType == "VBox") {
                        if(data.isVisible != undefined)
                            childModel.isvisible = data.isVisible;
                    }
                    if(childModel.wType == "Calendar" && key == "datecomponents") {
                        if(data[prop] == null) {
                            childModel.date = data[prop];
                        } else {
                            childModel.date = data[prop].slice(0, 3);
                        }
                    }
                }
            }
            
            if(childModel.text) {
                var textValue = childModel.text;
                var isI18NCallExists = /i18n.getlocalizedstring/gi.test(textValue);
                if(isI18NCallExists)
                    childModel.text = $KU.getI18NValue(textValue);
            }
        } else if(childModel.wType == "Slider") {
            childModel.selectedvalue = data;
        } else if(childModel.wType == "Switch") {
            childModel.selectedindex = data;
        } else if(childModel.wType != "Image") { 
            childModel.text = data;
        } else { 
            childModel.src = data;
            childModel.srcType = 1;
        }
        childModel.canUpdateUI = true;
    },

    
    updateLayoutData: function(container, layoutModel, data) {
        if(data instanceof Object) {
            for(var ele in data) {
                if(ele != 'template' && ele != 'children' && ele != 'metaInfo') {
                    var mapkey = ele;
                    if(container.widgetdatamap) mapkey = kony.utils.getKey(container.widgetdatamap, ele);
                    var tempModel = layoutModel.parent; 
                    var eleModel = tempModel ? tempModel[mapkey] : layoutModel[mapkey];
                    if(eleModel) {
                        this.updateChildModel(eleModel, data[ele]);
                    }
                }
            }
        }
    },

    
    getClonedTemplateNode: function(element, widgetModel, propertyName) {
        var containerId = element && element.getAttribute("kcontainerID");
        if(containerId) {
            var containerModel = $KW.Utils.getContainerModelById(element, containerId);
            if(containerModel.wType == "CollectionView") {
                var context = widgetModel.rowContext;
                element = $KW.CollectionView.Utils.getNodeByContext(containerModel, {
                    "sectionIndex": context.secIndex,
                    "itemIndex": context.itemIndex
                }, widgetModel);
                propertyName && $KW.Utils.updateClonedModelData(widgetModel, containerModel, propertyName);
            }
            if(containerModel.wType =="Segment") {
                var context = widgetModel.rowContext;
                element = $KW.Segment.getNodeByContext(containerModel, {
                    "sectionIndex": context.secIndex,
                    "rowIndex": context.rowIndex
                }, widgetModel);
            }
        }
        return element;
    },

    updateClonedModelData: function(widgetModel, containerModel, propertyName) {
        var context, itemData;
        if(containerModel.wType != "CollectionView") {
            return;
        }
        context = widgetModel.rowContext;
        var itemData = $KW.CollectionView.Data.getRowDataByIndex(containerModel, [context.secIndex, context.itemIndex]);
        var widgetData = itemData[widgetModel.id];
        if(typeof widgetData == "object") {
            if((widgetModel.wTpe == "FlexContainer" || widgetModel.wTpe == "FlexScrollContainer") && (!widgetData)) {
                widgetData = {};
            }
            widgetData[propertyName] = widgetModel[propertyName];
        } else {
            var newData = {};
            var defaultProp = this.getDefaultProperyForContanierWidgets(widgetModel);
            newData[defaultProp] = widgetData;
            newData[propertyName] = widgetModel[propertyName];

            itemData[widgetModel.id] = newData;
        }

    },

    getDefaultProperyForContanierWidgets: function(model) {
        var defaultProperty = "text";
        if(model.wType == "Image") {
            defaultProperty = "src";
        } else if(model.wType == "Switch") {
            defaultProperty = "selectedIndex";
        } else if(model.wType == "Slider") {
            defaultProperty = "selectedValue";
        } else if(model.wType == "Calendar") {
            defaultProperty = "dateComponents";
        } else if(this.isGroupWidget(model)) {
            defaultProperty = "masterdata";
        }
        return defaultProperty;
    },

    isGroupWidget: function(model) {
        return(['CheckBoxGroup', 'RadioButtonGroup', 'ComboBox', 'ListBox'].contains(model.wType));
    },

    setSelectedKeys: function(widgetModel, checked, keys, value) {

        var result = $KU.inArray(keys, value);
        if(checked && !result[0]) {
            keys.push(value);
        } else if(result[0]) {
            keys.splice(result[1], 1);
        }
        widgetModel.selectedkeys = keys.length > IndexJL ? keys : null;
    },
    setSelectedKeysListBox: function(widgetModel, node) {
        var keys = [];
        for(var i = 0; i < node.children.length; i++) {
            if(node.children[i].selected) {
                keys.push(node.children[i].value);
            }
        }
        widgetModel.selectedkeys = keys.length > IndexJL ? keys : null;
    },
    

    setSelectedValueProperty: function(widgetModel, choices, property, value) {

        switch(property) {

            case "selectedkey":
                var selectedKey = value || widgetModel.selectedkey;
                for(var i = IndexJL; i < (choices.length); i++) {
                    var key = choices[i][IndexJL];
                    if(selectedKey == key) {
                        widgetModel["selectedkeyvalue"] = choices[i];
                        break;
                    }
                }
                break;

            case "selectedkeys":
                var retVal = [];
                var selectedKeys = value || widgetModel.selectedkeys;
                var flag = false;
                if(IndexJL == 1) retVal = [null]; 

                for(i = IndexJL; i < (choices.length); i++) {
                    var key = choices[i][IndexJL];
                    if($KU.inArray(selectedKeys, key)[0]) {
                        retVal.push(choices[i]);
                        flag = true
                    }
                }
                widgetModel["selectedkeyvalues"] = flag ? retVal : null;
                break;
        }
    },

    restrictCharactersSet: function(target, textModel) {
        var restrictCharactersSet = "";
        var pos = target.selectionStart;
        var data = target.value[pos-1];
        restrictCharactersSet = textModel.restrictcharactersset;
        if(restrictCharactersSet) {
            if(restrictCharactersSet.indexOf(data) != -1) {
                target.value = target.value.slice(0, pos-1) + target.value.slice(pos, target.value.length);
                target.selectionStart = target.selectionEnd = pos-1;
            }
        }
        return target.value;
    },

    getMasterData: function(widgetModel) {

        var choices = $KU.cloneObj(widgetModel.masterdata);
        if(!choices || (choices && choices.length == 0)) {
            var map = widgetModel.masterdatamap;
            if(map)
                choices = this.convertmap(widgetModel.masterdatamap);
        }
        if(choices) {
            var data;
            if(widgetModel.needsectionheaders) {
                var innerChoices;
                for(var i = IndexJL; i < choices.length; i++) {
                    innerChoices = choices[i][1 + IndexJL];
                    for(var j = IndexJL; j < innerChoices.length; j++) {
                        if(choices[i][1 + IndexJL] && typeof(data) != "number" && choices[i][1 + IndexJL].toLowerCase().indexOf("i18n.getlocalizedstring") != -1)
                            choices[i][1 + IndexJL] = $KU.getI18NValue(choices[i][1 + IndexJL]);
                    }
                }
            } else {
                for(var i = IndexJL; i < choices.length; i++) {
                    if(choices[i][1 + IndexJL] && typeof(choices[i][1 + IndexJL]) != "number" && choices[i][1 + IndexJL].toLowerCase().indexOf("i18n.getlocalizedstring") != -1)
                        choices[i][1 + IndexJL] = $KU.getI18NValue(choices[i][1 + IndexJL]);
                }
            }
        }
        return choices || [];
    },

    
    convertmap: function(map) {

        var len = map.length;
        var key = map[len - 2];
        var value = map[len - 1];
        var innerMap = map[IndexJL];
        var choices = [];

        if(IndexJL == 1) 
            choices = [null];

        for(var i = IndexJL; i < (innerMap.length); i++) {
            var key1 = innerMap[i][key];
            var displayValue1 = innerMap[i][value];
            var accessConfig = innerMap[i]['accessibilityConfig'];
            if(displayValue1 != "" && key1 != "") {
                if(IndexJL == 1) 
                    choices.push([null, key1, displayValue1]);
                else
                    choices.push(accessConfig ? [key1, displayValue1, accessConfig] : [key1, displayValue1]);
            }
        }
        return choices;
    },




    
    getScrolledHeight: function() {
        var isNetScape = (navigator.appName.indexOf("Netscape") != -1);
        var scrolledHeight = isNetScape ? pageYOffset : document.documentElement && document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
        return scrolledHeight;
    },

    
    getViewPortHeight: function() {
        var isNetScape = (navigator.appName.indexOf("Netscape") != -1);
        var viewportHeight = isNetScape ? innerHeight : document.documentElement && document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;
        return viewportHeight;
    },

    
    getViewPortWidth: function() {
        var isNetScape = (navigator.appName.indexOf("Netscape") != -1);
        var viewportWidth = isNetScape ? innerWidth : document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth;
        return viewportWidth;
    },


    setProgressIndicator: function(node, model) {
        var progressdivcontainer = $KU.getElementById("__progressdiv");
        if(progressdivcontainer)
            progressdivcontainer.parentNode.removeChild(progressdivcontainer);
        var konymodel = $KU.getModelByNode(node);
        var skin = (model && model.skin) || (konymodel && konymodel.skin);
        var progressdiv = document.createElement('div');
        progressdiv.setAttribute('id', '__progressdiv');
        progressdiv.setAttribute("progressindicator", "true");
        progressdiv.setAttribute("progressskin", skin);
        progressdiv.setAttribute('style', 'width:' + node.clientWidth + 'px' + ';height:' + node.clientHeight + 'px' + ';position:absolute;opacity:0.6;');
        return progressdiv;
    },

    updateNormalImage: function(model) {
        var node = $KU.getNodeByModel(model);
        if(!node || !model.backgroundimage)
            return;

        
        var backgroundimage = model.backgroundimage;
        var style = $KW.Utils.getNormalImageStyle(model);
        
        if(backgroundimage.index)
            node = document.querySelectorAll("#" + node.id)[backgroundimage.index - 1];

        var imagesrc = $KU.getImageURL(backgroundimage.imageurl);
        $KU.imagePreloader(imagesrc, function(node, style) {
            return function(event) {
                event = event || window.event;
                var srcElement = event.target || event.srcElement;

                var model = $KU.getModelByNode(node);
                var backgroundimage = model.backgroundimage;

                if(event.type == "error") {
                    if(backgroundimage.imagewhenfailed) {
                        var imagesrc = $KU.getImageURL(backgroundimage.imagewhenfailed);
                        var heightwidth = backgroundimage.heightwidth;
                        node.style.background = "url(" + imagesrc + ") no-repeat center center";

                        if(heightwidth) {
                            
                            node.style.height = heightwidth[1] + 'px';
                        }
                        return;
                    }
                }

                node.setAttribute('style', style);
                
                node.style.display = (model.isvisible ? "" : "none");

                if(backgroundimage && backgroundimage.maintainaspectratio) {
                    var naturalHeight = srcElement.naturalHeight || srcElement.height;
                    var naturalWidth = srcElement.naturalWidth || srcElement.width;
                    var aspectratio = naturalWidth / naturalHeight;
                    if(!isNaN(aspectratio)) {
                        node.setAttribute('aspect-ratio', aspectratio);
                        var width = node.clientWidth;
                        var newHeight = Math.round(1 / aspectratio * width);
                        node.style.height = newHeight + 'px';
                    }
                }
            }
        }(node, style));
    },

    
    getNormalImageStyle: function(model) {
        var style = '';
        var backgroundimage = model.backgroundimage;
        if(backgroundimage) {
            var maintainaspectratio = backgroundimage.maintainaspectratio;
            var heightwidth = backgroundimage.heightwidth;
            var imagesrc = $KU.getImageURL(backgroundimage.imageurl);
            style += 'background-image: url(' + imagesrc + '); background-repeat: no-repeat; ';
        }
        if(maintainaspectratio)
            style += 'background-size:contain; ';

        if(heightwidth)
            style += (maintainaspectratio ? '' : ' width:' + heightwidth[2] + 'px;') + 'height:' + heightwidth[1] + 'px;';
        return style;
    },

    convertPhoneAlphabetToNumber: function(input) {
        var inputlength = input.length;
        input = input.toLowerCase();
        var phonenumber = "";
        for(var i = 0; i < inputlength; i++) {
            var character = input.charAt(i);
            if(phonenumber.length > 10)
                break;
            switch(character) {
                case '0':
                    phonenumber += "0";
                    break;
                case '1':
                    phonenumber += "1";
                    break;
                case '2':
                    phonenumber += "2";
                    break;
                case '3':
                    phonenumber += "3";
                    break;
                case '4':
                    phonenumber += "4";
                    break;
                case '5':
                    phonenumber += "5";
                    break;
                case '6':
                    phonenumber += "6";
                    break;
                case '7':
                    phonenumber += "7";
                    break;
                case '8':
                    phonenumber += "8";
                    break;
                case '9':
                    phonenumber += "9";
                    break;
                    
                case 'a':
                case 'b':
                case 'c':
                    phonenumber += "2";
                    break;
                case 'd':
                case 'e':
                case 'f':
                    phonenumber += "3";
                    break;
                case 'g':
                case 'h':
                case 'i':
                    phonenumber += "4";
                    break;
                case 'j':
                case 'k':
                case 'l':
                    phonenumber += "5";
                    break;
                case 'm':
                case 'n':
                case 'o':
                    phonenumber += "6";
                    break;
                case 'p':
                case 'q':
                case 'r':
                case 's':
                    phonenumber += "7";
                    break;
                case 't':
                case 'u':
                case 'v':
                    phonenumber += "8";
                    break;
                case 'w':
                case 'x':
                case 'y':
                case 'z':
                    phonenumber += "9";
                    break;
            }
        }
        return phonenumber;
    },

    
    scrollToElement: function(el, duration, startY, stopY, needToSetCursor) {
        if(stopY == undefined && (el && (el.tagName == "INPUT" || el.tagName == "SELECT" || el.tagName == "TEXTAREA"))) {
            try {
                el.focus();
                needToSetCursor && $KW.TextField.setCaretPosition(el);

            } catch(e) {}
            return;
        }
        var elemDim = el && el.getBoundingClientRect(); 
        if(!(elemDim && elemDim.top >= 0 && elemDim.bottom <= (window.innerHeight || document.documentElement.clientHeight))) {

            var displacement, start, end, delta, isForward = true;
            if(!duration)
                duration = 1000; 
            if(!startY)
                startY = document.body.scrollTop;
            if(!stopY)
                stopY = (el && $KW.Utils.getOffset(el).top) || 0;

            start = startY;
            end = stopY;
            displacement = stopY - startY;

            if(Math.abs(displacement) < 50) {
                window.scrollTo(0, end);
                try {
                    if(el) {
                        el.focus();
                        needToSetCursor && $KW.TextField.setCaretPosition(el);
                    }
                } catch(e) {}
                return;
            }

            
            delta = Math.round((displacement * 100) / duration);
            if(startY >= stopY)
                isForward = false;

            var timerId = setInterval(function(isForward, start, end, delta) {
                return function() {
                    start = start + delta;

                    
                    if((!isForward && start <= end) || (isForward && start >= end)) {
                        window.scrollTo(0, end);
                        try {
                            if(el) {
                                el.focus();
                                needToSetCursor && $KW.TextField.setCaretPosition(el);
                            }
                        } catch(e) {}
                        clearInterval(timerId);
                        return;
                    }
                    window.scrollTo(0, start);
                }
            }(isForward, start, end, delta), 100);
        }
    },

    getOffset: function(el) {
        var left = el.offsetLeft,
            top = el.offsetTop;

        while(el = el.offsetParent) {
            left += el.offsetLeft;
            top += el.offsetTop;
        }

        return {
            left: left,
            top: top
        };
    },

    initializeFormGestures: function(formModel) {
        var i;

        
        if(formModel.headers && formModel.headers.length > 0) {
            for(i = 0; i < formModel.headers.length; i++) {
                $KW.Utils.initializeGestures(formModel.headers[i]);
            }
        }
        
        $KW.Utils.initializeGestures(formModel);
        
        if(formModel.footers && formModel.footers.length > 0) {
            for(i = 0; i < formModel.footers.length; i++) {
                $KW.Utils.initializeGestures(formModel.footers[i]);
            }
        }

    },

    initializeGestures: function(containerModel) {

        $KW.Utils.initializeGesturesForWidget(containerModel);
        var childList = containerModel.children;
        for(var i = 0; i < childList.length; i++) {
            var childModel = containerModel[childList[i]];
            childModel = $KW.Utils.getActualWidgetModel(childModel);

            if(childModel && childModel.children && childModel.children.length != 0) {
                $KW.Utils.initializeGestures(childModel);
            } else {
                $KW.Utils.initializeGesturesForWidget(childModel);
            }
        }
    },

    initializeGesturesForWidget: function(widgetModel) {
        if(widgetModel.wType == "Segment" || widgetModel.wType == "CollectionView") {
            $KW.Utils.initializeContainerGestures(widgetModel);
        } else {
            var element = $KU.getNodeByModel(widgetModel)
            $KW.Utils.addGesturesToWidget(widgetModel, element);
        }
    },

    initializeContainerGestures: function(widgetModel) {
        var clonedTemplates = widgetModel.clonedTemplates;
        var template, rowNode;
        
        if(widgetModel.hasSections) {
            
            for( var i = 0; i < clonedTemplates.length; i++) {
                var sectionData = clonedTemplates[i];
                if(sectionData[0]){
                    template = sectionData[0];
                    if(widgetModel.wType === 'Segment') {
                        rowNode = $KW.Segment.getNodeByContext(widgetModel, template.rowContext, template);
                    } else if(widgetModel.wType === 'CollectionView') {
                        rowNode = $KW.CollectionView.Utils.getNodeByContext(widgetModel, template.rowContext, template);
                    }
                    rowNode && $KW.Utils.processContainerGestures(template, rowNode);
                }

                for(var j = 0; j< sectionData[1].length; j++) {
                    template = sectionData[1][j];
                    if(widgetModel.wType === 'Segment') {
                        rowNode = $KW.Segment.getNodeByContext(widgetModel, template.rowContext, template);
                    } else if(widgetModel.wType === 'CollectionView') {
                        rowNode = $KW.CollectionView.Utils.getNodeByContext(widgetModel, template.rowContext, template);
                    }
                    rowNode && $KW.Utils.processContainerGestures(template, rowNode);
                }
                if(widgetModel.wType === 'CollectionView' && sectionData[2]) {
                    template = sectionData[2];
                    rowNode = $KW.CollectionView.Utils.getNodeByContext(widgetModel, template.rowContext, template);
                    rowNode && $KW.Utils.processContainerGestures(template, rowNode);
                }
            }
        }
        else {
            for( var i = 0; i < clonedTemplates.length; i++) {
                template = clonedTemplates[i];
                if(widgetModel.wType === 'Segment') {
                    rowNode = $KW.Segment.getNodeByContext(widgetModel, template.rowContext, template);
                } else if(widgetModel.wType === 'CollectionView') {
                    rowNode = $KW.CollectionView.Utils.getNodeByContext(widgetModel, template.rowContext, template);
                }
                rowNode && $KW.Utils.processContainerGestures(template, rowNode);
            }
        }
    },

    processContainerGestures: function(containerModel, rowNode) {
        var element =  rowNode.querySelector('#' + $KW.Utils.getKMasterWidgetID(containerModel));
        if(element) {
            
            $KW.Utils.addGesturesToWidget(containerModel, element);
        }

        var childList = containerModel.children;
        for(var i = 0; i < childList.length; i++) {
            var childModel = containerModel[childList[i]];
            childModel = $KW.Utils.getActualWidgetModel(childModel);

            if(childModel && childModel.children && childModel.children.length != 0) {
                $KW.Utils.processContainerGestures(childModel, rowNode);
            } else {
                if(childModel.wType == "Calendar") {
                    element = rowNode.querySelector("div[kwidgetid = " + $KW.Utils.getKMasterWidgetID(childModel) + "]");
                } else {
                    element = rowNode.querySelector('#' + $KW.Utils.getKMasterWidgetID(childModel));
                }

                if(element) {
                    $KW.Utils.addGesturesToWidget(childModel, element);
                }
            }
        }
    },

    addGesturesToWidget: function(widgetModel, element) {
        $KW.Utils.applyGesturestoDOM(widgetModel, element);
        $KW.Utils.applyTouchestoDOM(widgetModel, element);
    },

    applyGesturestoDOM: function(widgetModel, widgetNode){
        var gestures = widgetModel.gestures;
        if(widgetModel.wType === 'Image' && widgetModel.zoomenabled) {
            if(widgetModel.pinchRecognizer) {
                widgetModel.pinchRecognizer.instance.removePinch();
                delete widgetModel.pinchRecognizer;
            }
            widgetModel.pinchRecognizer = {
                instance : new kony.gestures.imagePinchZoom()
            };
            widgetModel.pinchRecognizer.instance.registerPinch(widgetModel);
            $KW.Image.registerLongPress(widgetModel);
        } else if(widgetModel.widgetswipemove) {
            if(widgetModel.panRecognizer) {
                widgetModel.panRecognizer.instance.removePan();
                delete widgetModel.panRecognizer;
            }
            widgetModel.swipeConfig = new $KW.Segment.registerSwipeGesture(widgetModel, widgetNode);
            widgetModel.panRecognizer = {
                instance : new kony.gestures.pan()
            };
            widgetModel.panRecognizer.instance.registerPan(widgetModel, widgetNode);
        }
        if(gestures) {
            for(var k in gestures) {
                var gesture = gestures[k];
                if(gesture) {
                    for(var i in gesture) {
                        var gEObj = gesture[i];
                        $KW.Utils.removegesture(widgetModel, gEObj.gestureType, false,
                            gEObj.gestureIdentifier, gEObj.gestureObj);
                        new $KW.touch.gesture(widgetModel, gEObj);
                    }
                }
            }
        }
    },

    applyTouchestoDOM: function(widgetModel, element) {
        var touches = widgetModel.touches;
        if(element && touches) {
            for(var k in touches) {
                var touch = touches[k];
                if(touch) {
                    if(widgetModel.wType == "DataGrid" ) {
                        var elements = document.querySelectorAll('#' + $KW.Utils.getKMasterWidgetID(widgetModel));
                        for (var i = 0; i < elements.length; i++) {
                            if(i == 0) {
                                continue;
                            }
                            $KW.Utils.removetouch(widgetModel, k, false);
                            widgetModel.touches[k]["instance"] = new $KW.touch.TouchEvents(widgetModel, elements[i], k, touch.callback);
                        }
                    } else {
                        $KW.Utils.removetouch(widgetModel, k, false);
                        widgetModel.touches[k]["instance"] = new $KW.touch.TouchEvents(widgetModel, element, k, touch.callback);
                    }
                }
            }
        }
    },

    updateModelWithGesture: function(widgetModel, gestureType, gestureObj, callback) {
        
        if(!widgetModel)
            widgetModel = $KG;
        if(!widgetModel.gestures)
            widgetModel.gestures = {};
        var _gestureType = (gestureType == 1 ? (gestureObj.taps == 1 ? 10 : 11) : gestureType);
        if(!widgetModel.gestures[_gestureType])
            widgetModel.gestures[_gestureType] = [];
        var gestureEventObject = {
            gestureObj: gestureObj,
            callback: callback,
            gestureType: gestureType
        }
        gestureEventObject.gestureIdentifier = (Math.round(new Date().valueOf() * Math.random())) + "";

        widgetModel.gestures[_gestureType][gestureEventObject.gestureIdentifier] = gestureEventObject;
        return gestureEventObject;
    },

    removegesture: function(widgetModel, gestureType, updateModel, gestureIdentifier, gestureObj) {
        var _gestureType = (gestureType == 1 ? (gestureObj.taps == 1 ? 10 : 11) : gestureType);
        if(widgetModel.gestures && widgetModel.gestures[_gestureType]) {
            var gestureList = widgetModel.gestures[_gestureType];
            if(gestureIdentifier && typeof(gestureIdentifier) === "string") {
                gestureList[gestureIdentifier]["instance"].removeGesture(gestureType, updateModel);
                if(updateModel)
                    delete gestureList[gestureIdentifier];
                return;
            }
            for(var k in gestureList) {
                try {
                    gestureList[k]["instance"].removeGesture(gestureType, updateModel);
                } catch(e) {
                    if(console && console.error)
                        kony.web.logger("error", 'unable to remove Gesture ' + e);
                }
            }
            if(updateModel)
                widgetModel.gestures[_gestureType] = [];
        }
    },

    updateModelWithTouches: function(widgetModel, touchEventType, callback) {
        
        if(!widgetModel)
            widgetModel = $KG;
        if(!widgetModel.touches)
            widgetModel.touches = {};
        if(callback)
            widgetModel.touches[touchEventType] = {
                callback: callback
            };
        else
            widgetModel.touches[touchEventType] = undefined;
    },

    removetouch: function(widgetModel, touchEventType, updateModel) {
        if(widgetModel.touches && widgetModel.touches[touchEventType] && widgetModel.touches[touchEventType]["instance"])
            widgetModel.touches[touchEventType]["instance"].removeTouch && widgetModel.touches[touchEventType]["instance"].removeTouch(touchEventType, updateModel);
    },

    initializeScrollEvents: function(scrollNodes, model) {
        var wModel = null;
        for(var i = 0; i < scrollNodes.length; i++) {
            var scrollNode = scrollNodes[i];
            wModel = model || $KU.getModelByNode(scrollNode);
            wModel.scrollInstance = new $KW.touch.TouchEvents(wModel, scrollNode, "scroll");
        }
    },

    scrollInterface: (function() {
        var global = this;
        var notSetUp = true;
        var readScroll = {
            scrollLeft: NaN,
            scrollTop: NaN,
            clientHeight: NaN,
            clientWidth: NaN
        };
        var readScrollX = 'scrollLeft';
        var readScrollY = 'scrollTop';
        var readClientH = 'clientHeight';
        var readClientW = 'clientWidth';

        var itrface = {
            getScrollX: function() {
                return readScroll[readScrollX];
            },
            getScrollY: function() {
                return readScroll[readScrollY];
            },
            getClientH: function() {
                return readScroll[readClientH];
            },
            getClientW: function() {
                return readScroll[readClientW];
            }
        };

        function setUp() {
            if(typeof global.pageXOffset == 'number') {
                readScroll = global;
                readScrollY = 'pageYOffset';
                readScrollX = 'pageXOffset';
                readClientH = 'innerHeight';
                readClientW = 'innerWidth';
            } else {
                if((typeof document.compatMode == 'string') &&
                    (document.compatMode.indexOf('CSS') >= 0) &&
                    (document.documentElement) &&
                    (typeof document.documentElement.scrollLeft == 'number')) {
                    readScroll = document.documentElement;
                } else if((document.body) &&
                    (typeof document.body.scrollLeft == 'number')) {
                    readScroll = document.body;
                }
            }
            notSetUp = false; 
        }
        return(function() {
            if(notSetUp) { 
                setUp(); 
            }
            return itrface; 
        });
    })()(),

    handleLayout: function(container, boxModel, layoutData) {
        var context = container.context;
        var tabpaneID = context.tabpaneID; 
        context.container = container;
        context.template_generator = boxModel;
        context.tabpaneID = "";
        if(!boxModel.pf) {
            _konyConstNS.Form2.addHeaderorFooter.call(boxModel, boxModel);
        }
        boxModel.isTemplate = true; 
        var clonedBoxModel = owl.deepCopy(boxModel, null, false);
        $KW.Utils.updateLayoutData(container, clonedBoxModel, layoutData);
        context.setTopLevelBox(true);
        var htmlString = $KW[clonedBoxModel.wType].render(clonedBoxModel, context);
        context.setTopLevelBox(false);
        context.tabpaneID = tabpaneID;
        context.container = "";
        context.template_generator = "";
        return htmlString;
    },

    
    getContainerModel: function(widgetModel, element) {
        if(!(widgetModel || element)) {
            return null;
        }
        var containerId = null;
        var containerModel = null;
        if(!element) {
            element = $KU.getNodeByModel(widgetModel);
        }
        containerId = element && element.getAttribute("kcontainerID");
        containerModel = $KW.Utils.getContainerModelById(element, containerId);

        return containerModel;
    },

    belongsToSegment: function(element) {
        var containerId = element && element.getAttribute("kcontainerID");
        if(containerId) {
            var containerModel = $KW.Utils.getContainerModelById(element, containerId);
            if(containerModel.wType == "Segment") return true;
        }
        return false;
    },

    isBelongsToCollectionView: function(wModel, element) {
        element = element || $KU.getNodeByModel(wModel);
        var containerId = element && element.getAttribute("kcontainerID");
        if(containerId) {
            var containerModel = $KW.Utils.getContainerModelById(element, containerId);
            if(containerModel.wType == "CollectionView") return true;
        }
        return false;
    },

    setScrollWidth: function(widgetModel, element) {
        var scroller = (widgetModel.scrollbar == "arrows") ? element.childNodes[1] : element.childNodes[0];

        scroller.style.width = (scroller.clientWidth - parseInt($KU.getStyle(element, "padding-right").replace("px", ""), 10) - parseInt($KU.getStyle(element, "padding-left").replace("px", ""), 10)) + "px";
        var scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(widgetModel) + "_scroller"];
        scrollerInstance && scrollerInstance.refresh();
    },

    getTemplateByContainerModelAndRowData: function(model, rowdata, isSection, index) {
        if(model.wType == "MenuContainer") {
            return rowdata.template || model.menutemplate;
        } else if(model.wType == "Segment") {
            if(isSection) {
                return model.sectionheadertemplate;
            } else {
                return rowdata.template || model.rowtemplate;
            }
        } else if(model.wType == "DataGrid") {
            if(model.selectedIndex >= IndexJL) {
                var colConfig = model.columnheadersconfig[model.selectedcellindex[0]];
                if(index == '0') {
                    return colConfig.columnheadertemplate.template;
                }
                return colConfig.columndatatemplate;
            }
        }
    },

    getRowDataByContainerModelAndIndex: function(model, index) { 
        if(model.wType === "MenuContainer") {
            return $KW.MenuContainer.getDetails(model, index, 'item');
        } else if(model.wType === "Segment") {
            return $KW.Segment.getRowDataByIndex(model, index);
        } else if(model.wType === "DataGrid") {
            
        }
    },

    getIndexAttrNameByContainerModel: function(model) {
        if(model.wType === "MenuContainer") {
            return 'menuindex';
        } else if(model.wType === "Segment") {
            return 'index';
        } else if(model.wType === "DataGrid") {
            return 'index';
        }
    },

    getOffsetParent: function(elem) {
        var offsetParent = elem.offsetParent || document.documentElement;
        while(offsetParent && (!(elem.nodeName && elem.nodeName.toLowerCase() == "html") && $KU.getStyle(elem, "position") === "static")) {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || document.documentElement;
    },

    
    getOffset: function(elem) {
        var offsetParent, offset, parentOffset = {
            top: 0,
            left: 0
        };
        offsetParent = this.getOffsetParent(elem);
        offset = this.getPosition(elem);
        parentOffset = this.getPosition(offsetParent);
        
        parentOffset.top += $KU.getStyle(offsetParent, "borderTopWidth");
        parentOffset.left += $KU.getStyle(offsetParent, "borderLeftWidth");

        return {
            top: offset.top + offsetParent.scrollTop - parentOffset.top,
            left: offset.left + offsetParent.scrollLeft - parentOffset.left
        };
    },

    
    getPosition: function(elem) {
        var box = {
                top: 0,
                left: 0
            },
            docElem = document.documentElement;
        if(typeof elem.getBoundingClientRect !== "undefined") {
            box = elem.getBoundingClientRect();
        }
        return {
            top: box.top + window.pageYOffset - docElem.clientTop,
            left: box.left + window.pageXOffset - docElem.clientLeft
        };
    },
    
    resetScrollTopToContainer: function(eventObject) {
        if($KG.nativeScroll) { 
            return;
        }

        var targetobj = eventObject ? eventObject.target : document.activeElement;
        var scrollBox = $KU.closestElement(targetobj, 'kwidgettype', 'KFlexScrollContainer');
        if(!scrollBox) {
            scrollBox = $KU.closestElement(targetobj, 'kwidgettype', 'KFormScroller');
        }
        if(scrollBox && scrollBox.scrollTop > 0) {
            var scrollerInstance = $KG[scrollBox.id];
            var scrollY = scrollBox.scrollTop;
            scrollBox.scrollTop = 0;
            scrollerInstance.animateTo(scrollerInstance.x, -scrollY);
        }
    },

    focusBringToView: function(eventObject) {
        if(!$KG["nativeScroll"] && !$KU.isIDevice) {
            var targetobj = eventObject ? eventObject.target : document.activeElement;
            this.bringToView(targetobj);
        }
    },

    bringToView: function(el, isOnKeyboardPopup) {
        if(!el) {
            return; 
        }

        var scrollSelector = $KW.FlexUtils.isFlexWidget($KU.getModelByNode(el)) ? 'FlexScrollContainer' : 'ScrollBox';

        
        var Rectangle = kony.utils.Rectangle;

        var scrollerID = $KG["__currentForm"].id;
        var headerId = $KG.allforms[scrollerID].header;
        var footerId = $KG.allforms[scrollerID].footer;
        if(isOnKeyboardPopup)
            $KW.Scroller.checkDOMChanges(scrollerID + "_scroller", headerId, footerId);

        kony.web.logger("log", $KG[$KG["__currentForm"].id + "_scroller"].wrapperH);



        var target = el;
        var middlY = 0;
        var middleX = 0;


        while(true) {
            var scrollBox = $KU.closestElement(target, 'kwidgettype', scrollSelector);
            var scrollerInstance = scrollBox ? $KG[scrollBox.id + "_scroller"] : ($KG["__currentForm"] ? $KG[$KG["__currentForm"].id + "_scroller"] : "");
            if(!scrollerInstance)
                return;
            if(isOnKeyboardPopup) {
                scrollerInstance._checkDOMChanges();
                scrollerInstance.refresh();
            }
            kony.web.logger("log", 'found');
            var parentEL = scrollerInstance.wrapper;
            if(parentEL.scrollTop > 0) {
                kony.web.logger("log", 'scrolltop value found');
                parentEL.scrollTop = 0;
            }
            if(parentEL.scrollLeft > 0) {
                parentEL.scrollLeft = 0;
            }
            var parentBox = parentEL.getBoundingClientRect();

            var targetBox = el.getBoundingClientRect();

            var parentR = new Rectangle(parentBox.left, parentBox.top, parentBox.width, parentBox.height);
            var targetR = new Rectangle(targetBox.left, targetBox.top, targetBox.width, targetBox.height);

            
            if(!parentR.contains(targetR)) {

                var diffY = 0,
                    diffX = 0;


                diffY = targetBox.top - parentBox.top;
                if(diffY > 0) {
                    diffY = scrollerInstance.y - diffY + middlY;
                    diffY = Math.max(scrollerInstance.maxScrollY, diffY);

                } else {

                    diffY = scrollerInstance.y - diffY + middlY;
                    diffY = Math.min(diffY, 0);
                }

                
                
                diffX = targetBox.left - parentBox.left;
                if(diffX > 0) {
                    diffX = scrollerInstance.x - diffX + middleX;
                    diffX = Math.max(scrollerInstance.maxScrollX, diffX);
                } else {
                    diffX = scrollerInstance.x - diffX + middleX;
                    diffX = Math.min(diffX, 0);
                }

                scrollerInstance.scrollTo(diffX, diffY);

            }

            if(!scrollBox)
                return;
            target = parentEL;

        }
    },
    getCursorStyle: function(widgetModel) {
        var value = widgetModel.cursortype;
        if(value) {
            if(value.match(/([.]+)/) != null) {
                return "url(" + $KU.getImageURL(value) + ") ,auto";
            } else {
                return value;
            }
        }
    },

    getBoxShadowStyle: function(wModel) {
        var shadowColor = "#000000";
        if(wModel.shadowradius == undefined && (wModel.shadowoffset == undefined ||
                (wModel.shadowoffset && wModel.shadowoffset.x == undefined && wModel.shadowoffset.y == undefined))) {
            return ""
        }
        var shadowOffsetX = (wModel.shadowoffset && wModel.shadowoffset.x || 0) + "px ";
        var shadowOffsetY = (wModel.shadowoffset && wModel.shadowoffset.y || 0) + "px ";
        var shadowRadius = (wModel.shadowradius || 0) + "px ";

        if(wModel.shadowcolor) {
            var validate = $KW.skins.validateHexValue(wModel.shadowcolor);
            if(validate) {
                shadowColor = $KW.skins.convertHexValuetoRGBA(wModel.shadowcolor);
            }
        }
        return shadowOffsetX + shadowOffsetY + shadowRadius + shadowColor;
    },

    getAnchorPoint: function(wModel) {
        if(wModel && wModel.anchorpoint) {
            var value = wModel.anchorpoint;
            if(value) {
                if((value.x < 0) || (value.x > 1) || (value.y < 0) || (value.y > 1))
                    return '';
                return $KU.cssPrefix + "transform-origin:" + (value.x * 100) + "% " + (value.y * 100) + "%; ";
            }
        }
        return '';
    },

    

    getView: function(model, parentNode) {

        
        if(!model)
            return null;

        var widgetID;
        var widgetTabId = model.tabId;
        var wID = model.id;
        if(model.kmasterid) {
            
            widgetID = model.pf + "_" + model.kmasterid + "_" + wID;
        } else if(widgetTabId) {
            widgetID = model.pf + "_" + widgetTabId + "_" + wID;
        } else {
            widgetID = (model.pf ? model.pf + "_" : "") + wID;
        }

        if(model.wType == 'Calendar')
            return parentNode ? parentNode.querySelector('div[kwidgetid=' + widgetID + ']') : document.querySelector('div[kwidgetid=' + widgetID + ']');
        var node = parentNode ? parentNode.querySelector('#' + widgetID) : document.getElementById(widgetID);
        
        if(!node && $KU.isAndroid)
            node = parentNode ? parentNode.querySelectorAll('#' + widgetID)[0] : document.getElementById(widgetID);
        return node;
    },


    getWidgetNode: function(model, parentNode) {
        
        if(!model)
            return null;

        var widgetID;
        var widgetTabId = model.tabId;
        var wID = model.id;
        if(model.kmasterid) {
            
            widgetID = model.pf + "_" + model.kmasterid + "_" + wID;
        } else if(widgetTabId) {
            widgetID = model.pf + "_" + widgetTabId + "_" + wID;
        } else {
            widgetID = (model.pf ? model.pf + "_" : "") + wID;
        }

        if(model.wType == 'Calendar')
            return parentNode ? parentNode.querySelector('div[kwidgetid=' + widgetID + ']') : document.querySelector('div[kwidgetid=' + widgetID + ']');
        var node = parentNode ? parentNode.querySelector('#' + widgetID) : document.getElementById(widgetID);
        
        if(!node && $KU.isAndroid)
            node = parentNode ? parentNode.querySelectorAll('#' + widgetID)[0] : document.getElementById(widgetID);
        return $KW.Utils.getWidgetNodeFromNodeByModel(model, node);
    },

    
    getWidgetNodeFromNodeByModel: function(model, node) {
        if(node) {
            var map = {
                ScrollBox: 3,
                TabPane: 2,
                Segment: 2,
                Image: 1,
                Slider: 2,
                FlexContainer: 1,
                FlexScrollContainer: 2
            };

            if(model.wType == 'Segment' && model.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW)
                map.Segment = 3;

            if(model.wType == 'Image' && model.zoomenabled) {
                map.Image = 3;
            }

            for(var i = typeof map[model.wType] == 'undefined' ? 0 : map[model.wType]; i > 0; --i)
                node = node.parentNode;
            return node;
        } else
            return null;
    },

    getContentNodeFromNodeByModel: function(model) {
        var widgetNode = $KU.getNodeByModel(model);
        if(widgetNode) {
            var contentNode = widgetNode;
            var map = {
                CollectionView: 2,
                Browser: 2
            };
            for(var i = typeof map[model.wType] == 'undefined' ? 0 : map[model.wType]; i > 0; --i)
                contentNode = contentNode.firstChild;
            return contentNode;
        }
    },

    getWidgetIndex: function(wModel) {
        var parentModel = wModel.parent;
        if(parentModel) {
            var widgets = parentModel.widgets();
            for(var i = 0; i < widgets.length; i++) {
                if(wModel.id == widgets[i].id) {
                    return i;
                }
            }
        }
        return -1;
    },

    getClonedModelByContainer: function(model, node, containerId) {
        var clonedModel;
        var containerModel = $KW.Utils.getContainerModelById(node, containerId);
        if(containerModel.wType == "CollectionView") {
            clonedModel = $KW.CollectionView.Utils.getClonedModelOfWidget(model, node, containerId);
        } else {
            clonedModel = $KW.Segment.getClonedModelOfWidget(model, node, containerId);
        }
        return clonedModel;
    },

    getClonedModelByContainerUsingIndex: function(containerModel, rowIndex, secIndex) {
        if(containerModel.wType == "CollectionView") {
            clonedModel = $KW.CollectionView.Utils.getClonedModel(containerModel, rowIndex, secIndex);
        } else {
            clonedModel = $KW.Segment.getClonedModel(containerModel, rowIndex, secIndex);
        }
        return clonedModel;
    },

    
    getMirrorAlignment: function(alignmentType) {
        var mirrorMap = {
                '1': constants.CONTENT_ALIGN_TOP_RIGHT,
                '2': constants.CONTENT_ALIGN_TOP_CENTER,
                '3': constants.CONTENT_ALIGN_TOP_LEFT,
                '4': constants.CONTENT_ALIGN_MIDDLE_RIGHT,
                '5': constants.CONTENT_ALIGN_CENTER,
                '6': constants.CONTENT_ALIGN_MIDDLE_LEFT,
                '7': constants.CONTENT_ALIGN_BOTTOM_RIGHT,
                '8': constants.CONTENT_ALIGN_BOTTOM_CENTER,
                '9': constants.CONTENT_ALIGN_BOTTOM_LEFT
            },
            mirroredAlignment;
        mirroredAlignment = mirrorMap[alignmentType]
        return mirroredAlignment;
    },

    
    getMirroredMarginPadding: function(marginPaddingValue) {
        var temp;
        temp = marginPaddingValue[0];
        marginPaddingValue[0] = marginPaddingValue[2];
        marginPaddingValue[2] = temp;
        return marginPaddingValue;
    }
};


$KW.WidgetGenerationContext = function(formID) {
    this.formID = formID;
    this.topLevelBox = null;
};

$KW.WidgetGenerationContext.prototype.setTopLevelBox = function(topLevel) {
    this.topLevelBox = topLevel;
};

$KW.unLoadWidget = function() {
    
    var progressnode = document.querySelector('[selected="progress"]') || document.querySelector('[selected="progressindtr"]');
    if(progressnode)
        progressnode.removeAttribute("selected");
    progressnode = document.querySelector('[progressindicator="true"]');
    if(progressnode)
        progressnode.parentNode.removeChild(progressnode);
    $KW.skins.removeBlockUISkin()
    var selectedItem = $KG[kony.constants.SELECTED_ITEM];
    if(selectedItem) {
        var selectedWidget = $KU.getElementById(selectedItem.kWidgetID);
        var widgetEventHandler = selectedItem.kEventHandler;
        widgetEventHandler && widgetEventHandler(selectedWidget)
    }
    
    delete $KG[kony.constants.SELECTED_ITEM];
};


$KW.Advertisement = {
    render: function(widgetID, context) {
        return "";
    }
};

$KW.SeatMap = {
    render: function(widgetID, context) {
        return "";
    }
};

$KW.MenuItem = {
    render: function(widgetID, context) {
        return "";
    }
};

$KW.TPW = {
    render: function(widgetModel, context) {
        var html = "";
        if(typeof widgetModel == 'object') {
            
            var id = widgetModel.pf + '_' + widgetModel.id;
            $KU.addThirdPartyMeta({
                id: id,
                tpwModel: widgetModel
            });
            var tpwidgettype = $KU.getWidgetTypeByNameSapce(widgetModel.widgetName);
            var computedSkin = $KW.skins.getWidgetSkin(widgetModel, context) + " " + $KW.skins.getMarPadAdjustedContainerWeightSkin(widgetModel, 100);
            var marginpaddingvisible = "";
            marginpaddingvisible += $KW.skins.getMarginSkin(widgetModel, context) + " " + $KW.skins.getPaddingSkin(widgetModel);
            
            
            if(widgetModel.isvisible == false || !widgetModel.isvisible == "false" || widgetModel.isVisible == false || !widgetModel.isVisible == "false")
                marginpaddingvisible += "display:none;";
            html += "<div id='" + id + "' class='" + computedSkin + "' tpwidgettype='" + tpwidgettype + "' style='" + marginpaddingvisible + "'></div>";
            return html;
        }
    },

    renderWidget: function(formOrPopup) {
        if($KG.thirdPartyWidgetsMeta) {
            for(var key in $KG.thirdPartyWidgetsMeta) {
                var placeholder = document.getElementById($KG.thirdPartyWidgetsMeta[key].id);
                
                if(placeholder && $KG.thirdPartyWidgetsMeta[key].tpwModel.pf == formOrPopup) {
                    var tpwModel = $KG.thirdPartyWidgetsMeta[key].tpwModel;
                    var nsArr = tpwModel.widgetName.split('.');
                    var namespace = window;
                    for(var j = 0; j < nsArr.length; j++) {
                        namespace = namespace[nsArr[j]];
                    }
                    if(namespace && typeof namespace['initializeWidget'] == 'function') {
                        namespace['initializeWidget'](placeholder, tpwModel);
                    } else {
                        
                    }
                }
            }
        }
    }
};

if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, fromIndex) {
        if(fromIndex == null) {
            fromIndex = 0;
        } else if(fromIndex < 0) {
            fromIndex = Math.max(0, this.length + fromIndex);
        }
        for(var i = fromIndex, j = this.length; i < j; i++) {
            if(this[i] === obj)
                return i;
        }
        return -1;
    };
}
