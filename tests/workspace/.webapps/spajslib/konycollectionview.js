
$KW.CollectionView = (function() {
    
    

    var module = {
        CollectionViewCounter: 0,

        initialize: function() {
            kony.events.addEvent("click", "CollectionView", module.eventHandler);
            kony.events.addEvent("onorientationchange", "CollectionView", module.orientationHandler);
        },

        initializeView: function(formId) {
            
            $KW.Scroller.initializeCollectionViewContainers(formId);
            $KW.APIUtils.getModelForContentOffset(formId, "CollectionView");
        },

        initializeNewWidgets: function(node) {
            $KW.Slider && $KW.Slider.initializeView(null, node);
            $KW.Switch && $KW.Switch.initializeView(null, node);
        },

        orientationHandler: function(formId, orientation) {
            $KU.setScrollBoxesHeight(formId, "CollectionView");
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            var options;
            if(!element) {
                return;
            }
            if(!$KG["nativeScroll"]) {
                var scrollerInstance = $KW.Utils.getScrollerInstance(widgetModel);
                if(!scrollerInstance)
                    return;
                options = scrollerInstance.options;
            }
            switch(propertyName) {
                case "itemskin":
                    module.Skin.updateTemplateSkin(widgetModel, element, propertyValue, oldPropertyValue, 'itemBox');
                    break;

                case "itemselectedskin":
                    module.Skin.setSelectedItemSkins(widgetModel, true, propertyValue, oldPropertyValue);
                    break;

                case "skin":
                    element = $KW.Utils.getWidgetNode(widgetModel);
                    $KU.removeClassName(element, oldPropertyValue);
                    $KU.addClassName(element, propertyValue);
                    break;
                case "sectionheaderskin":
                    if(widgetModel.hasSections) module.Skin.updateTemplateSkin(widgetModel, element, propertyValue, oldPropertyValue, 'HeaderBox');
                    break;
                case "sectionfooterskin":
                    if(widgetModel.hasSections) module.Skin.updateTemplateSkin(widgetModel, element, propertyValue, oldPropertyValue, 'FooterBox');
                    break;

                case "selecteditemindex":
                    if(propertyValue && module.Data.isSelectionOutOfBound(widgetModel, propertyValue)) {
                        return;
                    }

                    var _items = null;
                    widgetModel._items = (widgetModel._items) ? widgetModel._items : [];
                    if(propertyValue) {
                        _items = [propertyValue];
                        if(widgetModel.selectionbehavior == kony.collectionview.SINGLE_SELECT) {
                            var arrayIndex = $KU.arrayIndex(widgetModel._items, propertyValue);
                            if(arrayIndex != -1) {
                                _items = null;
                            } else {
                                widgetModel._items = _items;
                            }
                        } else if(widgetModel.selectionbehavior == kony.collectionview.MULTI_SELECT) {
                            var arrayIndex = $KU.arrayIndex(widgetModel._items, propertyValue);
                            if(arrayIndex != -1) {
                                widgetModel._items.splice(arrayIndex, 1);
                            } else {
                                widgetModel._items.push(propertyValue);
                            }
                        }
                    }
                    _items = (!_items) ? null : (_items.length > 0) ? _items : null;
                    module.Skin.adjustGridSkins(widgetModel, _items);

                    (propertyValue && element) && module.Utils.setFocus(widgetModel, element, propertyValue);
                    break;

                case "selecteditemindices":
                    if(propertyValue) {
                        var _items = [];
                        for(var i = 0; i < propertyValue.length; i++) {
                            var secIndex = parseInt(propertyValue[i][0], 10);
                            var rowIndexes = propertyValue[i][1];
                            for(var j = 0; j < rowIndexes.length; j++) {
                                var selection = [secIndex, rowIndexes[j]];
                                if(!module.Data.isSelectionOutOfBound(widgetModel, selection)) {
                                    var arrayIndex = $KU.arrayIndex(widgetModel._items, propertyValue);
                                    _items.push(selection);
                                    if(widgetModel.selectionbehavior == kony.collectionview.MULTI_SELECT) {
                                        if(arrayIndex != -1) {
                                            widgetModel._items.splice(arrayIndex, 1);
                                        } else {
                                            widgetModel._items.push(selection);
                                        }
                                    } else if(widgetModel.selectionbehavior == kony.collectionview.SINGLE_SELECT) {
                                        if(arrayIndex != -1) {
                                            _items = null;
                                        } else {
                                            widgetModel._items.push(propertyValue);
                                        }
                                    }
                                }
                            }
                        }
                        if(widgetModel.selectionbehavior != kony.collectionview.MULTI_SELECT) {
                            _items = (0) ? [null, _items[_items.length - 1]] : [_items[_items.length - 1]];
                        }
                        _items = (_items.length > 0) ? _items : null;
                    } else {
                        var _items = null;
                    }
                    module.Skin.adjustGridSkins(widgetModel, _items);
                    break;

                case "data":
                    if($KU.isArray(propertyValue)) {
                        module.Data.setData(widgetModel, propertyValue);
                    } else if(propertyValue === null) {
                        widgetModel._items = widgetModel.data = null;
                        module.setSelectedItemsAndIndices(widgetModel);
                    }
                    break;

                case "layouttype":
                    element = $KW.Utils.getWidgetNode(widgetModel);
                    if(propertyValue != oldPropertyValue && element) {
                        var parent = element.parentNode;
                        parent.innerHTML = module.generateCollectionView(widgetModel, widgetModel.context);
                        element = $KW.Utils.getContentNodeFromNodeByModel(widgetModel);
                        module.Utils.setCollectionViewHeightAndWidth(widgetModel);
                        module.Data.adjustFlexContainers(widgetModel, 'setdata');
                        module.applyLineSpaceAndItemSpace(widgetModel, element);
                        if($KW.FlexUtils.isFlexContainer(widgetModel.parent)) {
                            widgetModel.layoutConfig.self = true; 
                            
                        }
                        module.Utils.reInitializeScrollerInstace(widgetModel);
                    }
                    break;

                case "selectionbehavior":
                    if(propertyValue != oldPropertyValue) {
                        module.Data.setData(widgetModel, widgetModel.data);
                    }
                    break;

                    
                case "retainselection":
                    if(widgetModel.retainSelection) {
                        module.Skin.adjustGridSkins(widgetModel, widgetModel._items);
                    } else {
                        module.Skin.resetItemSkins(widgetModel);
                    }
                    break;


                case "bounces":
                    var element = $KU.getNodeByModel(widgetModel);
                    if(element && widgetModel.needScroller) {
                        var scrollInstance = $KG[element.id + "_scroller"];
                        if(scrollInstance) {
                            scrollInstance.options.bounce = widgetModel.scrollbounce;
                            scrollInstance.options.hBounce = widgetModel.scrollbounce;
                            scrollInstance.options.vBounce = widgetModel.scrollbounce;
                        }
                    }
                    break;
                case "minLineSpace":
                case "minItemSpace":
                    module.applyLineSpaceAndItemSpace(widgetModel, $KW.Utils.getContentNodeFromNodeByModel(widgetModel));
                    module.Utils.refreshScrollerInstance(widgetModel);
                    break;
                case "reachingBeginningOffset":
                case "reachingEndOffset":
                    module.Utils.updateReachingOffsetValuesInPx(widgetModel);
                    break;
                case "scrollDirection":
                    var scrolldirection = widgetModel.scrolldirection;
                    if($KG["nativeScroll"]) {
                        $KW.Scroller.initializeNativeScroller(widgetModel, element);
                        return;
                    }
                    if(scrolldirection == "vertical") {
                        options.vScroll = true;
                        options.scrollbox = true;
                        options.hScroll = false;
                        
                    } else if(scrolldirection == "horizontal") {
                        options.hScroll = true;
                        options.scrollbox = true;
                        options.vScroll = false;
                        
                    } else if(scrolldirection == "both") {
                        options.vScroll = true;
                        
                        options.hScroll = true;
                        
                        options.scrollbox = true;
                    } else {
                        options.scrollbox = false;
                        options.vScroll = false;
                        options.hScroll = false;
                        scrollerInstance.options.disableUserScroll = true;
                    }
                    
                    scrollerInstance.updatedDirection = true;
                    scrollerInstance._checkDOMChanges();
                    scrollerInstance.updatedDirection = false;
                    break;
                    break;
                case 'pulltorefreshview':
                case 'releasetopullrefreshview':
                case 'pushtorefreshview':
                case 'releasetopushrefreshview':
                    var element = $KU.getNodeByModel(widgetModel);
                    element && module.updatePushPullView(widgetModel, propertyName);
                    break;
            }
        },

        render: function(widgetModel, context) {
            var i, secIndex, rowIndexes, selection, arrayIndex;
            if(!widgetModel.buiskin) widgetModel.buiskin = widgetModel.blockeduiskin;

            widgetModel.selecteditemindex = widgetModel.selecteditemindex || null;
            widgetModel.selecteditems = widgetModel.selecteditems || null;
            widgetModel.selecteditemindices = widgetModel.selecteditemindices || null;
            if(widgetModel.selecteditemindex) {
                setTimeout(function() {
                    module.Utils.setFocus(widgetModel, $KW.Utils.getContentNodeFromNodeByModel(widgetModel), widgetModel.selecteditemindex)
                }, 500);
            }


            $KU.updateScrollFlag(widgetModel);

            widgetModel.context = context;
            widgetModel.selectedState = false;
            var parentModel = widgetModel.parent;
            if($KW.FlexUtils.isFlexContainer(parentModel))
                widgetModel.layoutConfig.self = true;
            var htmlString = module.generateCollectionView(widgetModel, context);

            if(!widgetModel.selecteditemindices && widgetModel.selecteditemindex) {
                widgetModel._items = [widgetModel.selecteditemindex];
                module.setSelectedItemsAndIndices(widgetModel);
            } else if(!widgetModel.selecteditemindex && widgetModel.selecteditemindices) {
                widgetModel._items = (widgetModel._items) ? widgetModel._items : [];
                for(i = 0; i < widgetModel.selecteditemindices.length; i++) {
                    secIndex = parseInt(widgetModel.selecteditemindices[i][0], 10);
                    rowIndexes = widgetModel.selecteditemindices[i][1];
                    for(j = 0; j < rowIndexes.length; j++) {
                        selection = [secIndex, rowIndexes[j]];
                        if(!module.Data.isSelectionOutOfBound(widgetModel, selection)) {
                            arrayIndex = $KU.arrayIndex(widgetModel._items, widgetModel.selecteditemindices);
                            if(widgetModel.selectionbehavior === kony.collectionview.MULTI_SELECT) {
                                if(arrayIndex !== -1) {
                                    widgetModel._items.splice(arrayIndex, 1);
                                } else {
                                    widgetModel._items.push(selection);
                                }
                            } else if(widgetModel.selectionbehavior === kony.collectionview.SINGLE_SELECT) {
                                if(arrayIndex === -1) {
                                    widgetModel._items.push(widgetModel.selecteditemindices);
                                    widgetModel.selecteditemindex = selection;
                                }
                            }
                        }
                    }
                }
                if(widgetModel.selectionbehavior === kony.collectionview.MULTI_SELECT) widgetModel.selecteditemindex = selection;
                module.setSelectedItemsAndIndices(widgetModel);
            }
            if(widgetModel.retainselection && widgetModel.selecteditemindex) {
                setTimeout(function() {
                    module.Skin.setSelectedItemSkins(widgetModel, false)
                }, 100);
            }
            return htmlString;
        },

        getGridStyle: function(widgetModel) {
            var cStyle = "";
            if(widgetModel.layouttype == kony.collectionview.LAYOUT_HORIZONTAL) {
                cStyle = " display: flex; flex-direction: row; justify-content: space-between; flex-wrap: wrap;align-content: flex-start;";
            } else if(widgetModel.layouttype == kony.collectionview.LAYOUT_VERTICAL) {
                cStyle = " display: flex; flex-direction: column; justify-content: space-between; flex-wrap: wrap; align-content: flex-start;";
            } else { 
                cStyle = " position: relative; table-layout:fixed;";
            }
            return cStyle;
        },

        getScrollDirection: function(widgetModel) {
            switch(widgetModel.layouttype) {
                case kony.collectionview.LAYOUT_VERTICAL:
                    return "horizontal";
                case kony.collectionview.LAYOUT_HORIZONTAL:
                    return "vertical";
                case kony.collectionview.LAYOUT_CUSTOM:
                    return widgetModel.scrollDirection; 
            }
        },

        generateCollectionView: function(widgetModel, context) {
            var htmlString = "",
                data = widgetModel.data || [];
            widgetModel._secindex = null;
            var isFlexWidget = $KW.FlexUtils.isFlexWidget(widgetModel);
            var visibility = (!isFlexWidget && (!widgetModel.isvisible || data.length <= 0)) ? "hide" : ""; 

            var widgetSkin = (widgetModel.skin ? widgetModel.skin : "");
            var margin = $KW.skins.getBaseStyle(widgetModel, context);
            var padding = $KW.skins.getPaddingSkin(widgetModel);
            var scrollingevents = widgetModel.scrollingEvents;
            var wID = widgetModel.pf + "_" + widgetModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(widgetModel);
            if(kmasterObj.id != "") {
                wID = kmasterObj.id;
            }
            widgetModel.clonedTemplates = [];
            if(data.length > 0) {
                widgetModel.hasSections = $KU.isArray(data[0]);
            }

            var cStyle = module.getGridStyle(widgetModel);
            var style = '';
            var scrolldirection = module.getScrollDirection(widgetModel);
            module.Skin.applyItemFocusSkin(widgetModel);

            
            htmlString += "<div" + $KW.Utils.getBaseHtml(widgetModel, context) + " style='" + padding + style + "' class='" + widgetSkin + "'>";
            htmlString += "<div  id='" + wID + "_scroller' class='scrollerX " + visibility + "' kwidgettype='KCollectionView' name='touchcontainer_KScroller' swipeDirection ='" + scrolldirection + "' style='" + margin + "height:100%;width:100%;' " + kmasterObj.kmasterid + ">"
            htmlString += "<div id='" + wID + "_scrollee' class='form_scrollee' kwidgettype='KTouchscrollee' " + kmasterObj.kmasterid + ">";
            htmlString += "<div style='' class='pullDown' id= " + wID + "_pullDown>";
            if(widgetModel.layouttype != kony.collectionview.LAYOUT_CUSTOM) {
                htmlString += (scrollingevents && scrollingevents.onPull) ? module.generatePullOrPushViews(widgetModel, 'pull', wID) : "";
            }
            htmlString += "</div>";
            htmlString += "<div style ='" + cStyle + "'>";

            if(data.length > 0) {
                htmlString += module.generateItems(widgetModel, context, data, false, 0, 0);
            }

            htmlString += "</div>";
            htmlString += "<div style='' class='pullUp' id= " + wID + "_pullUp>";
            if(widgetModel.layouttype != kony.collectionview.LAYOUT_CUSTOM)
                htmlString += (scrollingevents && scrollingevents.onPush) ? module.generatePullOrPushViews(widgetModel, 'push', wID) : "";
            htmlString += "</div></div></div>";
            
            htmlString += "</div>";
            return htmlString;
        },

        generateGridHeader: function(model, context, data, template, itemIndex, secIndex, section, noOfItemsToRemove, templateType) {
            var accessAttr = "";
            var headerString = ""
            var trasform = "";
            var secSkin = "";
            var type = "";
            var headerStyle = "";


            if(section || section === "") { 
                var clonedHeaderTemplate;
                if(section instanceof Object) { 

                    if(typeof template == "string") {
                        template = _kony.mvc.initializeSubViewController(template);
                    }
                    $KG.allTemplates[template.id] = template;

                    accessAttr = $KU.getAccessibilityValues(model, section.accessibilityConfig, null, itemIndex);
                    var itemIndex = -1;
                    if(templateType == "Header") {
                        type = "HeaderBox";
                    } else if(templateType == "Footer") {
                        type = "FooterBox";
                        itemIndex = -2;
                    }
                    if(template && $KU.getkeys(section).length > 0) {

                        context.container = model;
                        if(!template.pf) {
                            _konyConstNS.Form2.addHeaderorFooter.call(template, template);
                        }
                        template.isTemplate = true; 
                        kony.enableGettersSetters = true; 
                        clonedTemplate = owl.deepCopy(template, null, false);
                        kony.enableGettersSetters = false; 
                        
                        $KW.FlexUtils.setRTLtoTemplates(clonedTemplate);
                        clonedTemplate.isHeaderOrFooter = true;
                        clonedTemplate.parent = model;
                        sectionHtml = (clonedTemplate.wType == "FlexContainer") ? module.renderFlexContainer(clonedTemplate, context, section, model, itemIndex, secIndex) : "";
                        if(sectionHtml === "") {
                            sectionHtml = " ";
                        }

                        delete context.container;
                        if(clonedTemplate.transform)
                            trasform = $KW.animUtils.applyTransform(clonedTemplate, clonedTemplate.transform);


                        if(model.layouttype == kony.collectionview.LAYOUT_CUSTOM) {
                            headerStyle = "position: absolute; "
                        }
                        headerStyle += trasform ? $KU.cssPrefix + "transform:" + trasform : "" + ";" + $KW.Utils.getAnchorPoint(clonedTemplate);
                    }

                }
                if(sectionHtml) { 
                    
                    secSkin = module.Skin.getSectionSkin(clonedTemplate, model, templateType);

                    headerString += "<div kwidgettype='GridNode' type ='" + type + "' style='" + headerStyle + "' class='" + secSkin + " middleleftalign'  index='" + secIndex + "," + itemIndex + "' secindex='" + secIndex + "," + itemIndex + "'" + " kcontainerID = " + model.id + ">" + sectionHtml + "</div>";
                    
                }
                if(templateType == "Header") {
                    model.clonedTemplates.splice(secIndex, noOfItemsToRemove, [clonedTemplate ? clonedTemplate : section, []]);
                } else {
                    model.clonedTemplates[secIndex].push(clonedTemplate ? clonedTemplate : section);
                }

            }
            return headerString;
        },

        generateItems: function(model, context, data, liExists, rowIndex, secIndex, isNew) {
            var htmlString = "",
                seperator = "",
                sectionRows = 0,
                color = model.separatorcolor;
            
            var secRowIndex = 0,
                section = null,
                sectionHtml = "",
                rowHtml = "";
            var gridSkin = model.itemskin;
            var headertemplate, footertemplate, itemTemplate, boxModel;
            data = module.Utils.invertMapAndData(model, data);
            model.counter = rowIndex;
            var noOfItemsToRemove = (isNew == false) ? 1 : 0;


            for(var i = 0; i < data.length; i++) {
                secRowIndex = (!model.hasSections) ? (i - 0) : (data[i].sectionLabel) ? 0 : (secRowIndex + 1);
                var section;
                if(data[i].template || model.itemtemplate) {
                    
                    var tabpaneID = context.tabpaneID;
                    context.tabpaneID = "";
                }

                
                
                model.seccounter = secIndex;
                model.rowcounter = rowIndex;

                if(model.hasSections) {
                    if(data[i].gridHeader) {
                        headertemplate = data[i].gridHeader.template || model.sectionheadertemplate;
                        if(headertemplate) {
                            section = data[i].gridHeader;
                            if(section) {
                                if(i != 0) {
                                    secIndex++;
                                    rowIndex = 0;
                                }
                                headerString = module.generateGridHeader(model, context, data, headertemplate, rowIndex, secIndex, section, noOfItemsToRemove, "Header");
                                htmlString += headerString;
                            }
                        }
                    } else if(typeof data[i].gridHeader != "undefined") {
                        if(i != 0) {
                            secIndex++;
                            rowIndex = 0;
                        }
                        model.clonedTemplates.splice(secIndex, noOfItemsToRemove, [null, []]);
                    }
                }

                context.topLevelBox = true;
                context.container = model;
                trasform = "";
                itemTemplate = data[i].template || model.itemtemplate;
                if(typeof itemTemplate == "string") {
                    itemTemplate = _kony.mvc.initializeSubViewController(itemTemplate);
                }

                itemTemplate.formPathId = model.formPathId;
                $KG.allTemplates[itemTemplate.id] = itemTemplate;

                if(itemTemplate) {
                    !itemTemplate.pf && _konyConstNS.Form2.addHeaderorFooter.call(itemTemplate, itemTemplate); 
                }

                itemTemplate.isTemplate = true; 
                kony.enableGettersSetters = true; 
                var clonedItemTemplate = owl.deepCopy(itemTemplate, null, false);
                kony.enableGettersSetters = false; 
                
                $KW.FlexUtils.setRTLtoTemplates(clonedItemTemplate);
                clonedItemTemplate.isHeaderOrFooter = false;
                clonedItemTemplate.parent = model;
                accessAttr = $KU.getAccessibilityValues(model, data[i].accessibilityConfig, null, rowIndex);
                rowHtml = (clonedItemTemplate.wType == "FlexContainer") ? module.renderFlexContainer(clonedItemTemplate, context, data[i], model, rowIndex, secIndex) : "";
                if(data[i].template || model.itemtemplate) {
                    context.tabpaneID = tabpaneID; 
                }

                if(model.hasSections) {
                    model.clonedTemplates[secIndex][1].splice(rowIndex, noOfItemsToRemove, clonedItemTemplate);
                } else {
                    model.clonedTemplates.splice(rowIndex, noOfItemsToRemove, clonedItemTemplate);
                }


                delete context.container;
                if(clonedItemTemplate.transform)
                    trasform = $KW.animUtils.applyTransform(clonedItemTemplate, clonedItemTemplate.transform);

                if(rowHtml) {
                    var computedSkin = module.Skin.getItemSkin(model, clonedItemTemplate, secIndex, rowIndex);
                    var positionStyle = "";
                    if(model.layouttype == kony.collectionview.LAYOUT_CUSTOM) {
                        positionStyle = "position: absolute; "
                    }
                    var style = $KW.Utils.getAnchorPoint(clonedItemTemplate) + " " + (trasform ? $KU.cssPrefix + "transform:" + trasform : "") + positionStyle;
                    

                    htmlString += "<div  kwidgettype='GridNode' type ='itemBox' id='flexcontainer_wrapper' style='" + style +
                        "' index=" + rowIndex + (model.hasSections ? " secindex='" + secIndex + "," + rowIndex + "'" : "") +
                        " kcontainerID = " + model.id;
                    htmlString += ">";

                }
                htmlString += rowHtml;
                if(rowHtml) {
                    htmlString += "</div>";
                }

                if(model.hasSections) {
                    if(data[i].gridFooter) {
                        footertemplate = data[i].gridFooter.template || model.sectionfootertemplate;
                        if(footertemplate) {
                            section = data[i].gridFooter;
                            if(section) {
                                htmlString += module.generateGridHeader(model, context, data, footertemplate, rowIndex, secIndex, section, 2, "Footer");
                            }
                        }
                    } else if(typeof data[i].gridFooter != "undefined") {
                        model.clonedTemplates[secIndex].push(null)
                    }
                }
                rowIndex++;
                model.counter++;
            }
            return htmlString;
        },

        renderFlexContainer: function(flexModel, context, rowData, widgetModel, rowIndex, secIndex) {
            var htmlString = "";
            var length;
            var count = 0;
            var style = "";
            var wrapperBegin = "";
            var wrapperClose = "";
            var widgetData = rowData[flexModel.id];
            $KW.Utils.updateChildModel(flexModel, widgetData);

            if(flexModel.pf === flexModel.id) {
                module.Utils.cleanupLayoutProps(flexModel, widgetModel.layouttype);
                module.updateTemplateContext(flexModel, rowIndex, secIndex);
            }
            module.Skin.applyWidgetFocusSkin(widgetData, flexModel, widgetModel);
            if(!flexModel.isvisible)
                return "";

            var computedSkin = $KW.skins.getWidgetSkin(flexModel, context);
            var boxstyle = " position:relative;" + (flexModel.clipbounds == true ? "overflow:hidden;" : "") + (flexModel.zindex ? "z-index:" + flexModel.zindex : "") + $KW.skins.getBaseStyle(flexModel, context);

            if(flexModel.pf !== flexModel.id) {
                htmlString += "<div id='flexcontainer_wrapper'  style='" + $KW.skins.getMarginSkin(flexModel, context) + "'>";
            }
            htmlString += "<div class = 'kwt100 " + computedSkin + "'" + $KW.Utils.getBaseHtml(flexModel, context) + " style='" + boxstyle + "'>";

            var wArrary = flexModel.widgets();
            length = wArrary.length;

            for(var i = 0; i < length; i++) {
                var childModel = wArrary[i];
                var widgetData = rowData[childModel.id];
                $KW.Utils.updateChildModel(childModel, widgetData);
                module.Skin.applyWidgetFocusSkin(widgetData, childModel, widgetModel);
                if(!childModel.isvisible) {
                    continue;
                }

                var css = "kcell " + $KW.skins.getWidgetAlignmentSkin(childModel) + (childModel.wType == "TPW" ? "  konycustomcss " : "");
                var style = $KW.FlexUtils.getFlexLayoutStyle(childModel);
                var boxHTML = "";
                wrapperBegin = "<div class = '" + css + "' style='" + style + ";overflow:hidden'>";
                wrapperClose = "</div>";

                if(childModel.wType == "FlexContainer") {
                    boxHTML = module.renderFlexContainer(childModel, context, rowData, widgetModel, rowIndex, secIndex);

                    if(boxHTML)
                        htmlString += wrapperBegin + boxHTML + wrapperClose;
                    else
                        count++;
                } else {
                    if(typeof widgetData != "undefined" && widgetData != "") {
                        htmlString += wrapperBegin + $KW[childModel.wType].render(childModel, context) + wrapperClose;
                    } else
                        count++;
                }
            }

            if(length == count)
                return "";

            htmlString += "</div>";
            if(flexModel.pf !== flexModel.id) {
                htmlString += "</div>";
            }
            return htmlString;
        },

        updateTemplateContext: function(widgetModel, itemIndex, secIndex) {
            var childList = widgetModel.children;
            var childModel, i;

            widgetModel.rowContext = {
                "itemIndex": itemIndex,
                "sectionIndex": secIndex
            };

            if(childList) {
                for(i = 0; i < childList.length; i++) {
                    childModel = widgetModel[childList[i]];
                    childModel = $KW.Utils.getActualWidgetModel(childModel);
                    if(childModel && childModel.children && childModel.children.length != 0) {
                        module.updateTemplateContext(childModel, itemIndex, secIndex);
                    } else {
                       childModel.rowContext = {
                            "itemIndex": itemIndex,
                            "sectionIndex": secIndex
                        };
                    }
                }
            }
        },

        updateTemplateContextAfterModifyData: function(cvModel) {
            var sec=0;
            var widgetModel, headerData, i, j, size, rowSize;

            if(cvModel.hasSections) {
                size = cvModel.data.length;
                for(i = 0; i < size; i++) {
                    headerData = cvModel.data[i] ? cvModel.data[i][0] : [];
                    if(headerData) {
                        widgetModel = cvModel.clonedTemplates[i][0];
                        module.updateTemplateContext(widgetModel, -1, i);
                    }
                    rowSize = cvModel.data[i][1].length;
                    for(j=0; j < rowSize; j++) {
                        widgetModel = cvModel.clonedTemplates[i][1][j];
                        module.updateTemplateContext(widgetModel, j, i);
                    }
                    if(cvModel.data[i][2]) {
                        widgetModel = cvModel.clonedTemplates[i][2];
                        module.updateTemplateContext(widgetModel, -2, i);
                    }
                }
            } else {
                rowSize = cvModel.data.length;
                for(i = 0; i < rowSize; i++) {
                    widgetModel = cvModel.clonedTemplates[i];
                    module.updateTemplateContext(widgetModel, i, sec);
                }
            }
        },

        generatePullOrPushViews: function(widgetModel, type, wID) {
            var htmlString = '';
            if(type == 'pull') {
                if(widgetModel.pulltorefreshview && widgetModel.releasetopullrefreshview) {
                    htmlString += module.renderPushPullView(widgetModel, 'pulltorefreshview', wID);
                    htmlString += module.renderPushPullView(widgetModel, 'releasetopullrefreshview', wID);
                }
            } else if(type == 'push') {
                if(widgetModel.pushToRefreshView && widgetModel.releaseToPushRefreshView) {
                    htmlString += module.renderPushPullView(widgetModel, 'pushtorefreshview', wID);
                    htmlString += module.renderPushPullView(widgetModel, 'releasetopushrefreshview', wID);
                }
            }
            return htmlString;
        },

        renderPushPullView: function(widgetModel, viewName, wID) {
            var htmlString = '';
            var _createCloneAndAssignBack = function(cvModel, view, wID) {
                kony.enableGettersSetters = true; 
                var clonedView = owl.deepCopy(cvModel[view], null, wID.replace(/_+/g, ''));
                kony.enableGettersSetters = false; 
                cvModel[view] = clonedView;
                $KG.allTemplates[cvModel[view].id] = cvModel[view];
            };
            _createCloneAndAssignBack(widgetModel, viewName, wID);
            widgetModel[viewName].pf = wID;
            if(widgetModel.layout == kony.collectionview.LAYOUT_HORIZONTAL) {
                widgetModel[viewName].width = "100%";
                if(!widgetModel[viewName].height) {
                    widgetModel[viewName].height = "50dp";
                }
            }
            if(widgetModel.layout == kony.collectionview.LAYOUT_VERTICAL) {
                widgetModel[viewName].height = "100%";
                if(!widgetModel[viewName].width) {
                    widgetModel[viewName].width = "50dp";
                }
            }

            htmlString += $KW.FlexContainer.render(widgetModel[viewName], {});
            return htmlString;
        },

        updatePushPullView: function(widgetModel, viewName) {
            var viewHolder = document.createElement('div');
            var scrollerNode = $KW.Utils.getContentNodeFromNodeByModel(widgetModel);
            var scrolleeId = scrollerNode.id;
            var index = scrolleeId.lastIndexOf('scrollee');
            var wID = scrolleeId.slice(0, index - 1);
            var node = null;
            viewHolder.innerHTML = module.renderPushPullView(widgetModel, viewName, wID);

            var pullViewNode = scrollerNode.children[0];
            var pushViewNode = scrollerNode.children[2];
            switch(viewName) {
                case 'pulltorefreshview':
                    pullViewNode.replaceChild(viewHolder.firstChild, pullViewNode.children[0]);
                    node = pullViewNode.children[0];
                    break;
                case 'releasetopullrefreshview':
                    pullViewNode.replaceChild(viewHolder.firstChild, pullViewNode.children[1]);
                    node = pullViewNode.children[1];
                    break;
                case 'pushtorefreshview':
                    pushViewNode.replaceChild(viewHolder.firstChild, pullViewNode.children[0]);
                    node = pushViewNode.children[0];
                    break;
                case 'releasetopushrefreshview':
                    pushViewNode.replaceChild(viewHolder.firstChild, pullViewNode.children[1]);
                    node = pushViewNode.children[1];
                    break;
            };

            widgetModel[viewName].parent = widgetModel;
            $KW.FlexContainer.forceLayout(widgetModel[viewName], node);
            if(['releasetopullrefreshview', 'releasetopushrefreshview'].indexOf(viewName) != -1) {
                $KU.addClassName(node, 'hide');
            }

            if(['releasetopullrefreshview', 'pulltorefreshview'].indexOf(viewName) != -1) {
                pullViewNode.style.width = (widgetModel.pulltorefreshview && widgetModel.pulltorefreshview.frame.width || 0) + 'px';
                pullViewNode.style.height = (widgetModel.pulltorefreshview && widgetModel.pulltorefreshview.frame.height || 0) + 'px';
            } else {
                pushViewNode.style.width = (widgetModel.pushtorefreshview && widgetModel.pushtorefreshview.frame.width || 0) + 'px';
                pushViewNode.style.height = (widgetModel.pushtorefreshview && widgetModel.pushtorefreshview.frame.height || 0) + 'px';
            }
        },

        
        updateData: function(childModel, childNode, widgetModel, row, canExecute, eventType) {
            if(widgetModel && row) {
                var context = module.Utils.getContextByNode(widgetModel, row);
                var itemIndex = context.itemIndex;
                var secIndex = (context.sectionIndex) ? context.sectionIndex : 0;
                var data = widgetModel.data;
                var item = null;
                var returnAfterDataUpdate = 0;

                if(widgetModel.selectionbehavior == kony.collectionview.SINGLE_SELECT && (widgetModel.hasSections ? (widgetModel._secindex == secIndex) && (widgetModel._focusedindex == itemIndex) : (widgetModel._focusedindex == itemIndex))) {
                    returnAfterDataUpdate = 1;
                }

                widgetModel._secindex = secIndex;

                if(itemIndex != -1 && itemIndex != -2) {
                    widgetModel._focusedindex = itemIndex;
                    widgetModel.selecteditemindex = [secIndex, itemIndex];
                }
                widgetModel.currentIndex = [secIndex, itemIndex];

                
                if(widgetModel.hasSections) {
                    if(itemIndex == -1) {
                        item = data[secIndex][0];
                    } else if(itemIndex == -2) {
                        item = data[secIndex][2];
                    } else {
                        var sectionData = data[secIndex][1];
                        item = sectionData[itemIndex];
                    }
                } else {

                    item = widgetModel.data[itemIndex];
                }

                if(item) {
                    item.metainfo = item.metaInfo || item.metainfo;
                }
                var clickable = (item && item.metainfo) ? item.metainfo.clickable : true;

                $KW.Utils.updateContainerMasterData(widgetModel, item, childModel, childNode, eventType);


                if(!returnAfterDataUpdate && itemIndex != -1 && itemIndex != -2) {
                    module.toggleRowSelection(widgetModel, row.parentNode);
                }

                var itemData = module.Data.getRowDataByIndex(widgetModel, [secIndex, itemIndex]);
                var eventRef = itemData ? $KU.returnEventReference(itemData.onitemselect || itemData.onItemSelect || widgetModel.onitemselect) : null;

                if(clickable && canExecute) {
                    if((widgetModel.onitemselect) && !childNode.getAttribute("kcontainerID")) { 
                        widgetModel.blockeduiskin && $KW.skins.applyBlockUISkin(widgetModel);
                        eventRef && $KU.executeWidgetEventHandler(widgetModel, eventRef, secIndex, itemIndex); 
                    } else {
                        var eventExecuted = kony.events.executeBoxEvent(childModel, itemData, widgetModel);
                        if(itemIndex != -1 && itemIndex != -2) { 
                            if(!eventExecuted && eventRef) {
                                widgetModel.blockeduiskin && $KW.skins.applyBlockUISkin(widgetModel);
                                $KU.executeWidgetEventHandler(widgetModel, eventRef, secIndex, itemIndex);
                                $KU.onEventHandler(widgetModel);
                            }
                        }
                    }
                    if(!kony.system.activity.hasActivity())
                        $KW.unLoadWidget();
                }
                
                var childMeta = item[childModel.id];
                if(childMeta && typeof childMeta == "object") {
                    if(childMeta.enable === false)
                        return false;
                }
            }
            return true;
        },

        toggleRowSelection: function(widgetModel, holder) {
            if(typeof widgetModel.selecteditemindex == "undefined") {
                var secIndex = 0;
                var rowIndex = widgetModel._focusedindex;
            } else if(widgetModel.selecteditemindex) {
                var secIndex = widgetModel.selecteditemindex[0];
                var rowIndex = widgetModel.selecteditemindex[1];
            } else {
                var secIndex = widgetModel.selecteditemindices[0][0];
                var rowIndex = widgetModel.selecteditemindices[0][1][0];
            }

            

            widgetModel._items = (widgetModel._items) ? widgetModel._items : [];

            var item = [secIndex, rowIndex];
            var _items = [];
            var arrIndex = $KU.arrayIndex(widgetModel._items, item);
            if(arrIndex != -1) { 
                var selected = false;
                widgetModel._items.splice(arrIndex, 1);
            } else {
                var selected = true;
                if(widgetModel.selectionbehavior == kony.collectionview.MULTI_SELECT) {
                    widgetModel._items.push(item);
                } else {
                    widgetModel._items = [item];
                }
            }
            _items.push(item);
            widgetModel._items = (widgetModel._items && widgetModel._items.length > 0) ? widgetModel._items : null;

            module.Skin.adjustGridSkins(widgetModel, _items);

            widgetModel.onselect && widgetModel.onselect(widgetModel, widgetModel.selectedItemIndex, selected);
            widgetModel.selectedState = selected;
        },

        eventHandler: function(eventObject, target, sourceFormID) {
            var widgetModel = $KU.getModelByNode(target);
            if(target.getAttribute("kwidgettype") != 'CollectionView') {
                $KW.Utils.updateContainerData(widgetModel, target, true);
            }
        },

        setSelectedItemsAndIndices: function(widgetModel, ignoreIndices) {
            if(widgetModel._items) {
                widgetModel.selecteditems = [];
                var sections = {};
                for(var i = 0; i < widgetModel._items.length; i++) {
                    var secIndex = widgetModel._items[i][0];;
                    var rowIndex = widgetModel._items[i][1];
                    if(!ignoreIndices) {
                        if(!sections[secIndex]) sections[secIndex] = [];
                        sections[secIndex].push(rowIndex);
                    }
                    if(widgetModel.hasSections) {
                        var sectionData = widgetModel.data[secIndex][1];
                        var item = sectionData[rowIndex];
                    } else {
                        var item = widgetModel.data[rowIndex];
                    }
                    widgetModel.selecteditems.push(item);
                }
                if(!ignoreIndices) {
                    widgetModel.selecteditemindices = [];
                    for(var k in sections) {
                        var section = (0) ? [null] : [];
                        section.push(parseInt(k, 10));
                        section.push(sections[k]);
                        widgetModel.selecteditemindices.push(section);
                    }
                }
            } else {
                widgetModel._secindex = widgetModel._focusedindex = null;
                widgetModel.selecteditems = null;
                widgetModel.selecteditemindex = null;
                if(!ignoreIndices) {
                    widgetModel.selecteditemindices = null;
                }
            }
        },

        applyLineSpaceAndItemSpace: function(CollecetionViewModel, CollecetionViewNode) {
            var data = CollecetionViewModel.data,
                rowNodes = [],
                _applyMarginForLastItem = function(model, width, height) {
                    var parentValue = 0;
                    var parentNode = $KU.getNodeByModel(model);
                    if(model.layouttype == kony.collectionview.LAYOUT_HORIZONTAL) {
                        var hBorder = parseInt($KU.getStyle(parentNode, "border-left-width"), 10) + parseInt($KU.getStyle(parentNode, "border-right-width"), 10);
                        var cvWidth = model.frame.width - hBorder;
                        prevWidget.flexNode.style.marginRight = cvWidth - width + 'px';
                    } else if(model.layouttype == kony.collectionview.LAYOUT_VERTICAL) {
                        var vBorder = parseInt($KU.getStyle(parentNode, "border-top-width"), 10) + parseInt($KU.getStyle(parentNode, "border-bottom-width"), 10);
                        var cvHeight = model.frame.height - vBorder;
                        prevWidget.flexNode.style.marginBottom = cvHeight - height + 'px';
                    }
                },
                _isItOfNewRow = function(width, currentSum, parentWidth) {
                    return width + currentSum > parentWidth;
                },
                _isItOfNewColumn = function(height, currentSum, parentHieght) {
                    return height + currentSum > parentHieght;
                },
                _getNodeAndModel = function(rowNode) {
                    var secIndex;
                    var flexNode = rowNode.querySelector('div[kwidgettype="FlexContainer"]');
                    if(flexNode) {
                        rowIndex = rowNode.getAttribute('index');
                        if(CollecetionViewModel.hasSections) {
                            secIndex = rowNode.getAttribute('secindex').split(',')[0];
                        }
                        var flexModel = module.Utils.getClonedModel(CollecetionViewModel, rowIndex, secIndex);
                        flexNode = flexNode.parentNode;
                        return {
                            flexNode: flexNode,
                            flexModel: flexModel
                        };
                    }
                },
                _resetMargin = function(wNode) {
                    wNode.style.removeProperty('margin');
                }
            if(data && data.length > 0) {

                var canApplyTop = false 
                    ,
                    canApplyLeft = false 
                    ,
                    cvWidth = CollecetionViewModel.frame.width 
                    ,
                    cvHeight = CollecetionViewModel.frame.height 
                    ,
                    heightSum = 0 
                    ,
                    i = 0,
                    isFirstItem = true,
                    itemSpace = module.Utils.getValueInPxBasedOnLayoutType('minItemSpace', CollecetionViewModel),
                    lineSpace = module.Utils.getValueInPxBasedOnLayoutType('minLineSpace', CollecetionViewModel),
                    WidthSum = 0 
                    ,
                    prevSecIndex = -1,
                    prevWidget = undefined;

                
                itemSpace = (itemSpace < 0) ? 0 : itemSpace;
                lineSpace = (lineSpace < 0) ? 0 : lineSpace;

                rowNodes = module.getCollectionViewBaseNode(CollecetionViewModel, CollecetionViewNode).children;
                for(i = 0; i < rowNodes.length; i++) {
                    var rowNode = rowNodes[i];
                    if(rowNode) {
                        if(CollecetionViewModel.hasSections) {
                            var currSectionIndex = rowNode.getAttribute('secindex').split(',')[0];
                            if(prevSecIndex != currSectionIndex) {
                                prevWidget && _applyMarginForLastItem(CollecetionViewModel, WidthSum, heightSum);
                                prevWidget = undefined;
                                canApplyTop = canApplyLeft = 0;
                                heightSum = WidthSum = 0;
                                isFirstItem = true;
                                prevSecIndex = currSectionIndex;
                            }
                        }
                        if(['HeaderBox', 'FooterBox'].indexOf(rowNode.getAttribute('type')) != -1)
                            continue
                        var currWidget = _getNodeAndModel(rowNode);
                        _resetMargin(currWidget.flexNode);
                        if(CollecetionViewModel.layouttype == kony.collectionview.LAYOUT_HORIZONTAL) {
                            var width = currWidget.flexModel.frame.width;
                            if(prevWidget && _isItOfNewRow(width, WidthSum + itemSpace, cvWidth)) {
                                WidthSum = 0;
                                canApplyTop = true;
                                if(isFirstItem) {
                                    var prevWidth = prevWidget.flexModel.frame.width;
                                    prevWidget.flexNode.style.marginLeft = (cvWidth - prevWidth) / 2 + 'px'; 
                                    prevWidget.flexNode.style.marginRight = (cvWidth - prevWidth) / 2 + 'px';
                                }
                                isFirstItem = true;
                            } else if(prevWidget) {
                                prevWidget.flexNode.style.marginRight = itemSpace + 'px';
                                WidthSum += itemSpace;
                                isFirstItem = false;
                            }
                            WidthSum += width;
                            if(canApplyTop)
                                currWidget.flexNode.style.marginTop = lineSpace + 'px';
                        } else if(CollecetionViewModel.layouttype == kony.collectionview.LAYOUT_VERTICAL) {
                            var height = currWidget.flexModel.frame.height;
                            if(prevWidget && _isItOfNewColumn(height, heightSum + itemSpace, cvHeight)) {
                                heightSum = 0;
                                canApplyLeft = true;
                                if(isFirstItem) {
                                    var prevHeight = prevWidget.flexModel.frame.height;
                                    prevWidget.flexNode.style.marginTop = (cvHeight - prevHeight) / 2 + 'px'; 
                                    prevWidget.flexNode.style.marginBottom = (cvHeight - prevHeight) / 2 + 'px';
                                }
                                isFirstItem = true;
                            } else if(prevWidget) {
                                prevWidget.flexNode.style.marginBottom = itemSpace + 'px';
                                heightSum += itemSpace;
                                isFirstItem = false;
                            }
                            heightSum += height;
                            if(canApplyLeft)
                                currWidget.flexNode.style.marginLeft = lineSpace + 'px';
                        }
                        prevWidget = currWidget;
                    }

                }
                prevWidget && _applyMarginForLastItem(CollecetionViewModel, WidthSum, heightSum);
            }
        },

        getCollectionViewBaseNode: function(wModel, node) {
            node = node || $KW.Utils.getContentNodeFromNodeByModel(wModel);
            node = node.children[1];
            return node;
        },

        adjustPullPushViewsInCollectionView: function(wModel, node) {
            
            var pullViewNode = node.children[0];
            var mainNode = node.children[1];
            var pushViewNode = node.children[2];
            var layouttype = wModel.layouttype;
            if(pullViewNode.children.length) {
                
                wModel.pulltorefreshview.parent = wModel;
                wModel.releasetopullrefreshview.parent = wModel;

                $KW.FlexContainer.forceLayout(wModel.pulltorefreshview, pullViewNode.children[0]);
                $KW.FlexContainer.forceLayout(wModel.releasetopullrefreshview, pullViewNode.children[1]);

                
                $KU.addClassName(pullViewNode.children[1], 'hide');

            }
            if(pushViewNode.children.length) {
                wModel.pushtorefreshview.parent = wModel;
                wModel.releasetopushrefreshview.parent = wModel;

                $KW.FlexContainer.forceLayout(wModel.pushtorefreshview, pushViewNode.children[0]);
                $KW.FlexContainer.forceLayout(wModel.releasetopushrefreshview, pushViewNode.children[1]);

                $KU.addClassName(pushViewNode.children[1], 'hide');
            }
            if(layouttype == kony.collectionview.LAYOUT_HORIZONTAL) {
                node.style.display = "block";
            } else {
                node.style.display = "flex";
            }
            pushViewNode.style.display = 'inline-block';
            pullViewNode.style.display = 'inline-block';

            pullViewNode.style.width = (wModel.pulltorefreshview && wModel.pulltorefreshview.frame.width || 0) + 'px';
            pullViewNode.style.height = (wModel.pulltorefreshview && wModel.pulltorefreshview.frame.height || 0) + 'px';

            pushViewNode.style.width = (wModel.pushtorefreshview && wModel.pushtorefreshview.frame.width || 0) + 'px';
            pushViewNode.style.height = (wModel.pushtorefreshview && wModel.pushtorefreshview.frame.height || 0) + 'px';
        },

        adjustFlexContainersInCollectionView: function(widgetModel, gridNode) {
            var data = widgetModel.data;

            if(data && data.length > 0) {
                itemNodes = module.getCollectionViewBaseNode(widgetModel, gridNode).children;
                for(var i = 0; i < itemNodes.length; i++) {
                    var itemNode = itemNodes[i];
                    var flexNode = itemNode.querySelector('div[kwidgettype="FlexContainer"]');
                    var secIndex, rowIndex, index;
                    if(widgetModel.hasSections) {
                        var index = itemNode.getAttribute("secindex").split(',');
                        secIndex = index[0];
                        rowIndex = index[1];
                    } else {
                        rowIndex = itemNode.getAttribute("index");
                        secIndex = -1;

                    }
                    var type = itemNode.getAttribute("type");

                    if(flexNode) {
                        if(type == "HeaderBox") {
                            var flexModel = module.Utils.getClonedModel(widgetModel, "header", secIndex);
                        } else if(type == "FooterBox") {
                            var flexModel = module.Utils.getClonedModel(widgetModel, "footer", secIndex);
                        } else {
                            var flexModel = module.Utils.getClonedModel(widgetModel, rowIndex, secIndex);
                        }
                        $KW.FlexContainer.forceLayout(flexModel, flexNode.parentNode);
                    }
                }
            }
            if(widgetModel.layouttype != kony.collectionview.LAYOUT_CUSTOM) {
                module.adjustPullPushViewsInCollectionView(widgetModel, gridNode);
            }
        },

        scrollToItemAtIndex: function(CollecetionViewModel, itemObject, animate) {
            var cvNode = $KU.getNodeByModel(CollecetionViewModel);
            var itemIndex = itemObject.itemIndex;
            var sectionIndex = itemObject.sectionIndex;
            var element = null;
            var scrollerInstance
            var _setTopLeftToNode = function(cvModel, cvNode, left, top) {
                $KW.APIUtils.setfocus(cvModel);
                cvNode.scrollLeft = left;
                cvNode.scrollTop = top;
            };
            if(!cvNode)
                return;
            if(!(itemIndex >= 0) || (CollecetionViewModel.hasSections && !(sectionIndex >= 0)))
                return;
            if(CollecetionViewModel.hasSections) {
                element = cvNode.querySelector('[secindex=' + "\"" + sectionIndex + "," + itemIndex + "\"" + ']');
            } else {
                element = cvNode.querySelector('[index=' + "\"" + itemIndex + "\"" + ']');
            }
            if(!$KG["nativeScroll"]) {
                scrollerInstance = $KG[cvNode.id + "_scroller"];
                element && scrollerInstance.scrollTo(-element.offsetLeft, -element.offsetTop, (animate ? 1000 : 0));
            } else {
                scrollerInstance = document.getElementById(cvNode.id + '_scroller');
                element && _setTopLeftToNode(CollecetionViewModel, scrollerInstance, element.offsetLeft, element.offsetTop)
            }
        }
    };

    module.Skin = {
        
        
        applyItemFocusSkin: function(model) {
            var itemTemplate = model.itemtemplate;
            var skin = itemTemplate.focusskin || model.itemselectedskin;
            var gridId = $KW.Utils.getKMasterWidgetID(model);
            if(skin) {
                var classSelector = "";
                classSelector = "#" + gridId + " [index]:active";
                $KW.skins.applyStyle(skin, classSelector, "FlexContainer");
            }
        },

        
        applyWidgetFocusSkin: function(widgetData, childModel, widgetModel) {
            var gridId = $KW.Utils.getKMasterWidgetID(widgetModel);
            var childId = $KW.Utils.getKMasterWidgetID(childModel);
            var focusSkin = childModel.focusskin;

            if(widgetData && widgetData.focusSkin) {
                focusSkin = widgetData.focusSkin;
            }
            if(!focusSkin && childModel.id === childModel.pf) {
                focusSkin = widgetModel.itemselectedskin;
            }
            if(focusSkin) {
                var classSelector = "";
                if(widgetModel.hasSections) {
                    classSelector = "#" + gridId + " div[secindex='" + childModel.rowContext.sectionIndex + "," + childModel.rowContext.itemIndex + "'] #" + childId + ":active";
                } else {
                    classSelector = "#" + gridId + " div[index='" + childModel.rowContext.itemIndex + "'] #" + childId + ":active";

                }
                $KW.skins.applyStyle(focusSkin, classSelector, widgetModel.wType);
            }
        },

        setSelectedItemSkins: function(model, changedItemSelectedSkin, newSkin, oldSkin) {
            var elements = $KU.getNodeByModel(model);
            var selectedIndices = model.selecteditemindices;
            if(selectedIndices) {
                for(var sectionCounter = 0; sectionCounter < selectedIndices.length; sectionCounter++) {
                    var rowLength = selectedIndices[sectionCounter][1].length;
                    var rowItems = selectedIndices[sectionCounter][1];
                    var sectionIndex = selectedIndices[sectionCounter][0];
                    for(var rowCounter = 0; rowCounter < rowLength; rowCounter++) {
                        var selectedNode;
                        if(model.hasSections) {
                            selectedNode = elements.querySelector("div[type = 'itemBox'][index='" + rowItems[rowCounter] + "'][secindex='" + sectionIndex + "," + rowItems[rowCounter] + "']");
                        } else {
                            selectedNode = elements.querySelector("div[type = 'itemBox'][index='" + rowItems[rowCounter] + "']");
                        }
                        if(selectedNode) {
                            var clonedTemplate = module.Utils.getItemTemplateByNode(model, selectedNode);
                            if(changedItemSelectedSkin) {
                                if(!clonedTemplate.skin) {
                                    $KU.removeClassName(selectedNode, oldSkin);
                                    $KU.addClassName(selectedNode, newSkin);
                                }
                            } else {
                                var skin = module.Skin.getItemSkin(model, clonedTemplate);
                                var focusSkin = module.Skin.getItemFocusSkins(model, clonedTemplate);
                                $KU.removeClassName(selectedNode, skin);
                                $KU.addClassName(selectedNode, focusSkin);
                            }
                        }
                    }
                }
            }
        },

        updateTemplateSkin: function(model, element, skin, oldSkin, type) {
            if(element) {
                
                var sections = element.querySelectorAll("div[type = '" + type + "']");
                for(var i = 0; i < sections.length; i++) {
                    if($KU.hasClassName(sections[i], oldSkin)) {
                        var template = module.Utils.getItemTemplateByNode(model, sections[i]);
                        var prevSkin = template.skin;
                        if(prevSkin != oldSkin) {
                            $KU.removeClassName(sections[i], oldSkin);
                            $KU.addClassName(sections[i], skin);
                        }
                    }
                }
            }
        },

        getItemSkin: function(model, itemTemplate) {
            var computedSkin = itemTemplate.skin || model.itemskin;
            return computedSkin;
        },

        getItemFocusSkins: function(model, itemTemplate) {
            var skin = itemTemplate.focusskin || itemTemplate.focusSkin || model.itemselectedskin;
            return skin;
        },

        getSectionSkin: function(template, model, templateType) {
            var computedSkin = "";
            if(template.skin) {
                computedSkin = template.skin;
            } else {
                if(templateType == "Header" && model.sectionheaderskin) {
                    computedSkin = model.sectionheaderskin;
                } else if(templateType == "Footer" && model.sectionfooterskin) {
                    computedSkin = model.sectionfooterskin;
                }
            }
            return computedSkin;
        },

        resetItemSkins: function(model) {
            var wNode = $KU.getNodeByModel(model);
            var listOfItems = wNode.querySelectorAll("div[type = 'itemBox']");
            for(var i = 0; i < listOfItems.length; i++) {
                var clonedTemplate = module.Utils.getItemTemplateByNode(model, listOfItems[i]);
                var skin = module.Skin.getItemSkin(model, clonedTemplate);
                var focusSkin = module.Skin.getItemFocusSkins(model, clonedTemplate);
                $KU.removeClassName(listOfItems[i], focusSkin);
                $KU.addClassName(listOfItems[i], skin);
            }
        },

        
        adjustGridSkins: function(widgetModel, checkedItems) {
            var wNode = $KU.getNodeByModel(widgetModel);
            if(widgetModel.retainselection && wNode && checkedItems) {
                var counterLength = checkedItems.length;
                for(var checkedItemsCounter = 0; checkedItemsCounter < counterLength; checkedItemsCounter++) {
                    var checkedItem;
                    var secIndex = checkedItems[checkedItemsCounter][0];
                    var rowIndex = checkedItems[checkedItemsCounter][1];
                    var selectedModel;
                    var skin, focusSkin;

                    if(widgetModel.hasSections) {
                        checkedItem = wNode.querySelector("div[type = 'itemBox'][secindex='" + secIndex + "," + rowIndex + "']");
                    } else {
                        checkedItem = wNode.querySelector("div[type = 'itemBox'][index='" + rowIndex + "']")
                    }

                    var listOfItems = wNode.querySelectorAll("div[type = 'itemBox']");
                    for(var i = 0; i < listOfItems.length; i++) {
                        if(listOfItems[i] == checkedItem) {
                            selectedModel = module.Utils.getItemTemplateByNode(widgetModel, listOfItems[i]);
                            break;
                        }
                    }

                    skin = module.Skin.getItemSkin(widgetModel, selectedModel);
                    focusSkin = module.Skin.getItemFocusSkins(widgetModel, selectedModel);
                    if(widgetModel.selectionbehavior == kony.collectionview.SINGLE_SELECT) {
                        
                        module.Skin.resetItemSkins(widgetModel)
                        $KU.removeClassName(checkedItem, skin);
                        $KU.addClassName(checkedItem, focusSkin);
                    } else {
                        if($KU.hasClassName(checkedItem, skin)) {
                            $KU.removeClassName(checkedItem, skin);
                            $KU.addClassName(checkedItem, focusSkin);
                        } else {
                            $KU.removeClassName(checkedItem, focusSkin);
                            $KU.addClassName(checkedItem, skin);
                        }
                    }
                }
            }
            module.setSelectedItemsAndIndices(widgetModel);
        }
    };

    module.Data = {
        setData: function(model, data) {
            if($KU.isArray(data)) {
                if(data.length > 0) {
                    model.hasSections = $KU.isArray(data[0]);
                    module.Data.modifyContent(model, data, "setdata", null, null);
                } else {
                    module.Data.removeAll(model);
                }
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        addAll: function(model, data) {
            if($KU.isArray(data)) {
                if(!$KU.isArray(model.data)) {
                    model.data = (0) ? [null] : [];
                }
                if(typeof model.hasSections !== "boolean") model.hasSections = $KU.isArray(data[0]);
                module.Data.modifyContent(model, data, "addall", null, null);
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        removeAll: function(model) {
            module.Data.modifyContent(model, 0 ? [null] : [], "removeall", null, null);
        },

        removeDataAt: function(model, rowIndex, secIndex, count) {
            if(!isNaN(rowIndex) || (secIndex && !isNaN(secIndex))) {
                if(!module.Utils.isIndexAndCountValid(model, rowIndex, secIndex, count, false)) return;
                if(count != 0) {
                    count = (count == null || count == undefined) ? 1 : count;
                    if($KU.isArray(model.data) && model.data.length > 0) {
                        module.Data.modifyContent(model, [], "removedataat", rowIndex, secIndex, count);
                    }
                }
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        setDataAt: function(model, data, rowIndex, secIndex) {
            if($KU.isArray(data) && (!isNaN(rowIndex) || (secIndex && !isNaN(secIndex)))) {
                if(!module.Utils.isIndexAndCountValid(model, rowIndex, secIndex, null, false)) return;
                if($KU.isArray(model.data) && model.data.length > 0) {
                    module.Data.modifyContent(model, data, "setdataat", rowIndex, secIndex);
                }
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        addAt: function(model, data, rowIndex, secIndex) {
            if($KU.isArray(data) && (!isNaN(rowIndex) || (secIndex && !isNaN(secIndex)))) {
                if(!module.Utils.isIndexAndCountValid(model, rowIndex, secIndex, null, false)) return;
                if(!$KU.isArray(model.data)) {
                    model.data = [];
                }
                if(typeof model.hasSections !== "boolean") model.hasSections = $KU.isArray(data[0]);
                module.Data.modifyContent(model, data, "addat", rowIndex, secIndex);
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        addDataAt: function(model, data, rowIndex, secIndex) {
            if($KU.isArray(data) && (!isNaN(rowIndex) || (secIndex && !isNaN(secIndex)))) {
                if(!module.Utils.isIndexAndCountValid(model, rowIndex, secIndex, null, false, "adddataat")) return;
                if(!$KU.isArray(model.data)) {
                    model.data = [];
                }
                if(typeof model.hasSections !== "boolean") model.hasSections = $KU.isArray(data[0]);
                module.Data.modifyContent(model, data, "adddataat", rowIndex, secIndex);
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        setDataWithSections: function(model, data) {
            if($KU.isArray(data) && $KU.isArray(data[0])) {
                module.Data.setData(model, data);
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        addSectionAt: function(model, data, secIndex) {
            if(typeof model.hasSections !== "boolean" && $KU.isArray(data[0])) model.hasSections = true;

            if(model.hasSections === false) {
                throw new KonyError(103, "Error", "Invalid operation.");
            } else if(!$KU.isArray(data[0])) {
                throw new KonyError(102, "Error", "Invalid input.");
            }
            if(!module.Utils.isIndexAndCountValid(model, null, secIndex, null, false, "addsectionat")) return;
            if(model.hasSections === true) {
                if(!$KU.isArray(model.data)) {
                    model.data = (0) ? [null] : [];
                }
                module.Data.modifyContent(model, data, "addsectionat", 0, secIndex);
            }
        },

        setSectionAt: function(model, data, secIndex) {
            if(model.hasSections) {
                if($KU.isArray(data) && !isNaN(secIndex)) {
                    if(!module.Utils.isIndexAndCountValid(model, null, secIndex, null, false)) return;
                    var count = data.length;
                    if($KU.isArray(model.data)) module.Data.modifyContent(model, data, "setsectionat", 0, secIndex, count);
                } else {
                    throw new KonyError(102, "Error", "Invalid input.");
                }
            } else {
                throw new KonyError(103, "Error", "Invalid operation.");
            }
        },

        removeSectionAt: function(model, secIndex, count) {
            if(model.hasSections) {
                if(!isNaN(secIndex)) {
                    if(!module.Utils.isIndexAndCountValid(model, null, secIndex, count, true)) return;
                    if(count != 0) {
                        count = (count == null || count == undefined) ? 1 : count;
                        if($KU.isArray(model.data)) module.Data.modifyContent(model, null, "removesectionat", 0, secIndex, count);
                    }
                } else {
                    throw new KonyError(102, "Error", "Invalid input.");
                }
            } else {
                throw new KonyError(103, "Error", "Invalid operation.");
            }
        },

        modifyContent: function(model, data, action, rowIndex, secIndex, count) {
            var _updateCollectionViewModel = function(model, data, action, rowIndex, secIndex, count) {
                model.canUpdateUI = false;
                $KW.Utils.updateContent(model, "data", data, action, rowIndex, secIndex, count);
                module.Data.adjustAlreadySelectedProperties(model, action, secIndex, rowIndex);
                model.canUpdateUI = true;
            };
            var size, upperLimit, i, j, sectionData;
            var secRowIndexArray = [0, 0],
                boundaryConditionToBeConsidered = false;
            if(action == "addat" || action == "adddataat" || action == "addsectionat") {
                boundaryConditionToBeConsidered = true;
            } else if(action == "setdata" || action == "removeall") {
                boundaryConditionToBeConsidered = secRowIndexArray;
            } else if(action == "addall") {
                boundaryConditionToBeConsidered = (!model.hasSections) ? [0, model.data.length] : [model.data.length, 0];
            }
            secRowIndexArray = module.Data.calculateSectionRowIndex(model, rowIndex, secIndex, boundaryConditionToBeConsidered);

            if(!model || secRowIndexArray === false) return;

            secIndex = secRowIndexArray[0], rowIndex = secRowIndexArray[1];

            var segmentNode = $KU.getNodeByModel(model);

            if(!segmentNode) {
                _updateCollectionViewModel(model, data, action, rowIndex, secIndex, count);
                return; 
            }

            model.context = model.context ? model.context : {};
            model.context.tabpaneID = segmentNode.getAttribute("ktabpaneid") || "";

            
            var isFlexWidget = $KW.FlexUtils.isFlexWidget(model);
            
            if(!isFlexWidget)
                $KU.toggleVisibilty(segmentNode.parentNode.parentNode, model.data, model);

            
            if(model.hasSections === false && !segmentNode.firstChild) {
                var cStyle = module.getGridStyle(model);
                segmentNode.innerHTML = "<div style ='" + cStyle + "'></div>";
            }

            segmentNode = module.getCollectionViewBaseNode(model);

            var rowNode = null,
                secNodes = null,
                secNode = null,
                secInnerNodes = null;
            var newSections = 0,
                sectionStart = 0,
                sectionEnd = 0,
                sectionEndIndex = 0;
            if(model.hasSections) {
                sectionStart = (secIndex == 0) ? 0 : module.Utils.getElementsCountTillSections(model.data, secIndex);
                sectionEndIndex = (action === "removedataat") ? secIndex + 1 : ((count) ? secIndex + count : secIndex + 1);
                sectionEnd = (Object.keys(model.data).length > secIndex) ? module.Utils.getElementsCountTillSections(model.data, sectionEndIndex) : sectionStart;
                secInnerNodes = module.Utils.spliceObjectBasedOnIndex(segmentNode.childNodes, sectionStart, sectionEnd);
            }

            
            _updateCollectionViewModel(model, data, action, rowIndex, secIndex, count);

            if(action == "setdata")
                model.clonedTemplates = [];
            var onRowDisplayInfo;

            switch(action) {
                case "setdata":
                    if(model.hasSections) {
                        segmentNode.innerHTML = module.generateItems(model, model.context, model.data, false, rowIndex, secIndex);
                    } else {
                        segmentNode.innerHTML = module.generateItems(model, model.context, model.data, false, rowIndex, secIndex);
                        module.Utils.refreshScrollerInstance(model);
                    }
                    break;

                case "removeall":
                    segmentNode.innerHTML = "";
                    module.Utils.refreshScrollerInstance(model);
                    break;

                case "setsectionat":
                    var wrapper = document.createElement("div");
                    wrapper.innerHTML = module.generateItems(model, model.context, data, false, rowIndex, secIndex, false);
                    var newSec = wrapper.children;
                    for(var i = 0; i < secInnerNodes.length; i++) {
                        segmentNode.removeChild(secInnerNodes[i]);
                    }
                    var nextNode = segmentNode.childNodes[sectionStart];
                    while(newSec.length > 0) {
                        segmentNode.insertBefore(newSec[0], nextNode);
                    }
                    newSections = count;
                    break;

                case "removesectionat":
                    for(var i = 0; i < secInnerNodes.length; i++) {
                        segmentNode.removeChild(secInnerNodes[i]);
                    }
                    model.clonedTemplates.splice(secIndex, count);
                    break;

                case "addsectionat":
                    var wrapper = document.createElement("div");
                    wrapper.innerHTML = module.generateItems(model, model.context, data, false, rowIndex, secIndex);
                    newSections = wrapper.children;
                    var counter = 0;
                    while(wrapper.children.length > 0) {
                        segmentNode.insertBefore(wrapper.childNodes[0], segmentNode.childNodes[sectionStart + counter]);
                        counter++;
                    }
                    newSections = data.length;
                    break;

                case "addall":
                    var wrapper = document.createElement("div");
                    if(!model.hasSections) {
                        wrapper.innerHTML = module.generateItems(model, model.context, data, false, rowIndex, secIndex);
                        while(wrapper.children.length > 0) {
                            segmentNode.appendChild(wrapper.childNodes[0]);
                        }
                    } else {
                        newSections = data.length;
                        var tempSecIndex = secIndex;
                        for(var i = 0; i < data.length; i++) {
                            wrapper.innerHTML = module.generateItems(model, model.context, (0) ? [null, data[i]] : [data[i]], false, rowIndex, tempSecIndex);
                            while(wrapper.children.length > 0) {
                                segmentNode.appendChild(wrapper.childNodes[0]);
                            }
                            tempSecIndex++;
                        }

                    }
                    break;

                case "setdataat":
                    var wrapper = document.createElement('div');
                    if(!model.hasSections) {
                        var rowNode = module.Utils.spliceObjectBasedOnIndex(segmentNode.childNodes, rowIndex, rowIndex + data.length);
                        
                        wrapper.innerHTML = module.generateItems(model, model.context, data, true, rowIndex, secIndex, false);
                    } else {
                        var headerCount = (model.data[secIndex][0] !== null) ? 1 : 0;
                        var rowNode = secInnerNodes.splice(rowIndex + headerCount, data.length);
                        wrapper.innerHTML = module.generateItems(model, model.context, data, true, rowIndex, secIndex, false);
                    }
                    var rowNodeCount = 0;
                    while(wrapper.children.length > 0) {
                        rowNode[rowNodeCount].replaceWith(wrapper.childNodes[0]);
                        $KU.addAriatoElement(rowNode[rowNodeCount++], data.accessibilityConfig, model);
                    }
                    newSections = data.length;

                    break;

                case "removedataat":
                    if(!model.hasSections) {
                        var itemCounter = 0;
                        while(itemCounter < count) {
                            segmentNode.removeChild(segmentNode.childNodes[rowIndex + itemCounter]);
                            itemCounter++;
                        }
                        model.clonedTemplates.splice(rowIndex, count);
                    } else {
                        var itemCounter = 0;
                        var headerCount = (model.data[secIndex][0] !== null) ? 1 : 0;
                        while(itemCounter < count) {
                            segmentNode.removeChild(secInnerNodes[rowIndex + headerCount + itemCounter]);
                            itemCounter++;
                        }
                        model.clonedTemplates[secIndex][1].splice(rowIndex, count);
                    }
                    break;

                case "addat":
                case "adddataat":
                    for(var i = 0; i < data.length; i++) {
                        var refEl, _html = module.generateItems(model, model.context, (0 ? [null, data[i]] : [data[i]]), false, rowIndex + i, secIndex),
                            newRowHolderNode = document.createElement("div");
                        
                        if(_html) {
                            newRowHolderNode.innerHTML = _html;
                            if(!model.hasSections) {
                                if(segmentNode.style.display === "none") segmentNode.style.display = '';
                                if(segmentNode.parentNode.style.display === "none") segmentNode.parentNode.style.display = '';
                                refEl = segmentNode.childNodes[rowIndex + i] || null;
                                
                                segmentNode.insertBefore(newRowHolderNode.childNodes[0], refEl);
                            } else {
                                if(segmentNode) {
                                    var headerCount = (model.data[secIndex][0] !== null) ? 1 : 0;
                                    segmentNode.insertBefore(newRowHolderNode.childNodes[0], secInnerNodes[rowIndex + headerCount]);
                                }
                            }
                        }
                    }
                    newSections = data.length;
                    break;
            }

            if(action == "addat" || action == "adddataat" || action == "removedataat" || action == "addall" || action == "addsectionat" || action == "removesectionat") {
                if(!model.hasSections) {
                    $KU.adjustNodeIndex(segmentNode, rowIndex, "index");
                } else {
                    module.Data.adjustSectionIndex(model, segmentNode);
                }
            }


            model.context.tabpaneID = ""; 


            model.isvisible && module.Data.adjustFlexContainers(model, action, secIndex, rowIndex, newSections);
            module.updateTemplateContextAfterModifyData(model);

            
            var widgetModel;
            if(model.hasSections) {
                if(action === 'addsectionat' || action === 'setsectionat') {
                    size = secIndex + data.length;
                } else if(action === 'adddataat' || action === 'setdataat') {
                    size = secIndex + 1;
                } else if(action === 'addall' || action === 'setdata') {
                    size = secIndex + data.length;
                } else {
                    size = secIndex;
                }
                for(i = secIndex; i < size; i++) {
                    sectionData = model.clonedTemplates[i];
                    if(['addsectionat', 'setsectionat', 'addall', 'setdata'].indexOf(action) >= 0) {
                        if(sectionData[0]) {
                            widgetModel = sectionData[0];
                            rowNode = module.Utils.getNodeByContext(model, widgetModel.rowContext, widgetModel);
                            $KW.Utils.processContainerGestures(widgetModel, rowNode);
                        }
                        if(sectionData[2]) {
                            widgetModel = sectionData[2];
                            rowNode = module.Utils.getNodeByContext(model, widgetModel.rowContext, widgetModel);
                            rowNode && $KW.Utils.processContainerGestures(widgetModel, rowNode);
                        }
                    }
                    if(action === 'adddataat' || action === 'setdataat') {
                        upperLimit = rowIndex + data.length;
                    } else {
                        upperLimit = sectionData[1].length;
                    }
                    for(j = rowIndex; j < upperLimit; j++) {
                        widgetModel = sectionData[1][j];
                        rowNode = module.Utils.getNodeByContext(model, widgetModel.rowContext, widgetModel);
                        $KW.Utils.processContainerGestures(widgetModel, rowNode);
                    }
                }
            } else {
                if(action ===  'addall' || action === 'setdata') {
                    size = data.length + rowIndex;
                } else if(action === 'adddataat' || action ===  'setdataat') {
                    size = rowIndex + data.length;
                } else {
                    size = rowIndex;
                }
                for(i = rowIndex; i < size; i++) {
                    widgetModel = model.clonedTemplates[i];
                    rowNode = module.Utils.getNodeByContext(model, widgetModel.rowContext, widgetModel);
                    $KW.Utils.processContainerGestures(widgetModel, rowNode);
                }
            }

            module.Animation.handleOnItemDisplay(model);
            module.applyLineSpaceAndItemSpace(model, $KW.Utils.getContentNodeFromNodeByModel(model));
            if(action == "removeall") 
                model.clonedTemplates = [];
            $KW.FlexUtils.updateAutoGrowFlexConfig(model);
        },

        
        adjustFlexContainers: function(model, action, secIndex, rowIndex, newSections) {
            $KU.needOptimization = false;
            var segNode = $KW.Utils.getContentNodeFromNodeByModel(model);
            var type = 'FlexContainer';
            switch(action) {
                case "setdata":
                    module.adjustFlexContainersInCollectionView(model, segNode);
                    module.initializeNewWidgets(segNode);
                    break;

                case "setdataat":
                case "addat":
                case "adddataat":
                    var section = module.getCollectionViewBaseNode(model, segNode).childNodes;
                    var elementIndex = (secIndex === 0) ? rowIndex : (module.Utils.getElementsCountTillSections(model.data, secIndex) + rowIndex);
                    var headerCount = (model.data[secIndex][0]) ? 1 : 0;
                    
                    for(var i = 0; i < newSections; i++) {
                        var row = section[(model.hasSections) ? elementIndex + headerCount + i : elementIndex + i];
                        var flexNode = row.querySelector("div[kwidgettype='" + type + "']");
                        if(flexNode) {
                            var flexModel = module.Utils.getClonedModel(model, rowIndex + i, secIndex);
                            $KW.FlexContainer.forceLayout(flexModel, flexNode.parentNode);
                        }
                        module.initializeNewWidgets(row);
                    }
                    break;

                case "addall":
                    if(model.hasSections) {
                        this.adjustFlexContainerInSection(model, segNode, secIndex, rowIndex, newSections);
                    } else {
                        var section = segNode.childNodes[secIndex];
                        var rows = section.childNodes;
                        for(var i = rowIndex; i < rows.length; i++) {
                            var row = rows[i];
                            var flexNode = row.querySelector("div[kwidgettype='" + type + "']");
                            if(flexNode) {
                                var flexModel = module.Utils.getClonedModel(model, i, secIndex);
                                $KW.FlexContainer.forceLayout(flexModel, flexNode.parentNode);
                            }
                            module.initializeNewWidgets(row);
                        }
                    }
                    break;

                case "addsectionat":
                case "setsectionat":
                    this.adjustFlexContainerInSection(model, segNode, secIndex, rowIndex, newSections);
                    break;
            }
            $KU.needOptimization = true;
            if($KW.FlexUtils.isFlexWidget(model) && !model.needScroller && model.autogrowMode == kony.flex.AUTOGROW_HEIGHT && model.viewtype == constants.SEGUI_VIEW_TYPE_TABLEVIEW) {
                var parent = model.parent;
                parent.layoutConfig.children = true;
            }
        },

        adjustFlexContainerInSection: function(model, segNode, secIndex, rowIndex, newSections) {
            var sections = segNode.childNodes[1].childNodes;
            var data = model.data;
            var startIndex = secIndex;
            var previousElementCount = module.Utils.getElementsCountTillSections(data, secIndex);
            for(var i = 0; i < newSections; i++) {
                var rowItemsCount = data[startIndex + i][1].length;
                var rowStartNumber = previousElementCount;
                var headerFooterCount = (data[secIndex + i][0] !== null) ? ((data[secIndex + i][2] !== null) ? 2 : 1) : ((data[secIndex + i][2] !== null) ? 1 : 0)
                var elementsCount = rowItemsCount + headerFooterCount;
                for(var j = 0; j < elementsCount; j++) {
                    var element = sections[previousElementCount];
                    var flexNode = element.querySelector('div[kwidgettype="FlexContainer"]');
                    if(flexNode) {
                        var flexModel = module.Utils.getItemTemplateByNode(model, element);
                        $KW.FlexContainer.forceLayout(flexModel, flexNode.parentNode);
                    }
                    module.initializeNewWidgets(element);
                    previousElementCount++;
                }
            }
        },

        getAutoGrowSegmentHeight: function(wModel, wNode) {
            var height = 0;
            var data = wModel.data;
            var segNode = $KU.getNodeByModel(wModel);
            if(data && data.length > 0) {
                if(wModel.hasSections) {
                    var secLen = data.length;
                    var sectionNodes = segNode.childNodes;
                    for(var i = 0; i < secLen; i++) {
                        var secHeaderNode = sectionNodes[i].childNodes[0];
                        if(secHeaderNode) {
                            var flexNode = secHeaderNode.querySelector('div[kwidgettype="FlexContainer"]');
                            if(flexNode) {
                                var flexModel = $KU.getModelByNode(flexNode);
                                flexNode = flexNode.parentNode;
                                module.Data.setFlexitemtemplateHeight(flexModel, flexNode);
                            }
                        }
                        module.adjustFlexContainersInRows(wModel, sectionNodes[i], data[i][1], i, true);
                    }
                } else
                    module.adjustFlexContainersInRows(wModel, segNode, data, undefined, true);
                return wNode.offsetHeight;
            }
        },

        setFlexitemtemplateHeight: function(flexModel, flexNode) {
            var containerId = flexNode.childNodes[0].getAttribute("kcontainerID");
            containerId && $KW.Utils.updateContainerDataInDOM(flexNode, containerId);
            $KW.FlexUtils.setFlexContainerStyle(flexModel, flexNode);
        },

        adjustSectionIndex: function(model, node) {
            var data = model.data;
            var sections = node.childNodes;
            var secindex, index, i = 0,
                k = 0;
            for(var i = 0; i < data.length; i++) {
                
                if(data[i][0] != null) {
                    index = i + ",-1";
                    sections[k].setAttribute("index", index);
                    sections[k].setAttribute("secindex", index);
                    k++;
                }

                
                if(data[i][1] != null) {
                    for(var j = 0; j < data[i][1].length; j++) {
                        secindex = i + "," + j;
                        index = j;
                        sections[k].setAttribute("index", index);
                        sections[k].setAttribute("secindex", secindex);
                        k++;
                    }
                }

                
                if(data[i][2] != null) {
                    index = i + ",-2";
                    sections[k].setAttribute("index", index);
                    sections[k].setAttribute("secindex", index);
                    k++;
                }
            }
        },

        adjustAlreadySelectedProperties: function(widgetModel, action, secIndex, rowIndex) {
            if(action != "addall") {
                if(action == "setdata" || action == "removeall") {
                    widgetModel._items = null;
                }
                if(widgetModel._items) {
                    widgetModel._items = module.Data.adjustSelectedRows(widgetModel._items, action, secIndex, rowIndex);
                    widgetModel._items && (widgetModel.selecteditemindex = widgetModel._items[widgetModel._items.length - 1]);
                }
                if(widgetModel.selectedrowindices) {
                    widgetModel.selectedrowindices = module.Data.adjustSelectedRowIndices(widgetModel.selectedrowindices, action, secIndex, rowIndex);
                }
                module.setSelectedItemsAndIndices(widgetModel);
            }
        },

        adjustSelectedRowIndices: function(sIndices, action, secIndex, rowIndex) {
            var sRowArray;
            switch(action) {
                case "addat":
                case "adddataat":
                    for(var i = 0; i < sIndices.length; i++) {
                        sRowArray = sIndices[i][1 + 0];
                        if(sIndices[i][0 + 0] == secIndex) {
                            for(var j = 0; j < sRowArray.length; j++) {

                                if(sRowArray[j] >= rowIndex)
                                    sRowArray[j] = sRowArray[j] + 1;
                            }
                            sIndices[i][1 + 0] = sRowArray;
                        }

                    }

                    break;
                case "setdataat":
                case "removedataat":
                    for(var i = 0; i < sIndices.length; i++) {
                        sRowArray = sIndices[i][1 + 0];
                        if(sIndices[i][0 + 0] == secIndex) {
                            var arrIndex = $KU.arrayIndex(sRowArray, 0 + rowIndex);
                            if(arrIndex != -1) {
                                sRowArray.splice(arrIndex, 1);
                            }
                            if(action === "removedataat") {
                                for(var j = 0; j < sRowArray.length; j++) {
                                    if(sRowArray[j] > rowIndex)
                                        sRowArray[j] = sRowArray[j] - 1;
                                }
                            }
                            sIndices[i][1 + 0] = sRowArray;
                        }
                    }
                    break;
                case "addsectionat":
                    for(var i = 0; i < sIndices.length; i++) {
                        if(sIndices[i][0 + 0] >= secIndex) {
                            sIndices[i][0 + 0] = sIndices[i][0 + 0] + 1;
                        }
                    }
                    break;
                case "removesectionat":
                case "setsectionat":
                    var removeIndexes = [];
                    for(var i = 0; i < sIndices.length; i++) {
                        if(sIndices[i][0 + 0] == secIndex) {
                            removeIndexes.push(i);
                        }
                    }
                    for(var i = 0; i < removeIndexes.length; i++) {
                        sIndices.splice(removeIndexes[i], 1);
                    }
                    if(action == "removesectionat") {
                        for(var i = 0; i < sIndices.length; i++) {
                            if(sIndices[i][0 + 0] > secIndex) {
                                sIndices[i][0 + 0] = sIndices[i][0 + 0] - 1;
                            }
                        }
                    }
                    break;
            }
            return(sIndices.length > 0) ? sIndices : null;
        },

        adjustSelectedRows: function(sRows, action, secIndex, rowIndex) {
            switch(action) {
                case "addat":
                case "adddataat":
                    for(var i = 0; i < sRows.length; i++) {
                        if(sRows[i][0 + 0] == secIndex && sRows[i][1 + 0] >= rowIndex) {
                            sRows[i][1 + 0] = sRows[i][1 + 0] + 1;
                        }
                    }
                    break;
                case "setdataat":
                    var arrIndex = $KU.arrayIndex(sRows, (0) ? [null, secIndex, rowIndex] : [secIndex, rowIndex]);
                    if(arrIndex != -1) {
                        sRows.splice(arrIndex, 1);
                    }
                    break;
                case "removedataat":
                    var arrIndex = $KU.arrayIndex(sRows, (0) ? [null, secIndex, rowIndex] : [secIndex, rowIndex]);
                    if(arrIndex != -1) {
                        sRows.splice(arrIndex, 1);
                    }
                    for(var i = 0; i < sRows.length; i++) {
                        if(sRows[i][0 + 0] == secIndex && sRows[i][1 + 0] > rowIndex) {
                            sRows[i][1 + 0] = sRows[i][1 + 0] - 1;
                        }
                    }
                    break;
                case "addsectionat":
                    for(var i = 0; i < sRows.length; i++) {
                        if(sRows[i][0 + 0] >= secIndex) {
                            sRows[i][0 + 0] = sRows[i][0 + 0] + 1;
                        }
                    }
                    break;
                case "removesectionat":
                case "setsectionat":
                    var removeIndexes = [];
                    for(var i = 0; i < sRows.length; i++) {
                        if(sRows[i][0 + 0] == secIndex) {
                            removeIndexes.push(i);
                        }
                    }
                    for(var i = 0; i < removeIndexes.length; i++) {
                        sRows.splice(removeIndexes[i], 1);
                    }
                    if(action == "removesectionat") {
                        for(var i = 0; i < sRows.length; i++) {
                            if(sRows[i][0 + 0] > secIndex) {
                                sRows[i][0 + 0] = sRows[i][0 + 0] - 1;
                            }
                        }
                    }
                    break;
            }
            return(sRows.length > 0) ? sRows : null;
        },

        calculateSectionRowIndex: function(widgetModel, rowIndex, secIndex, boundaryConditionToBeConsidered) {
            if(typeof boundaryConditionToBeConsidered != "boolean") {
                return boundaryConditionToBeConsidered;
            }
            var result = false;
            rowIndex = (boundaryConditionToBeConsidered && rowIndex < 0) ? 0 : rowIndex;
            if(!widgetModel.hasSections) { 
                if(rowIndex < 0 || rowIndex >= widgetModel.data.length) { 
                    if(boundaryConditionToBeConsidered) {
                        secIndex = 0;
                        rowIndex = (rowIndex < 0) ? 0 : (rowIndex >= widgetModel.data.length) ? widgetModel.data.length : rowIndex;
                        result = [secIndex, rowIndex];
                    }
                } else { 
                    secIndex = 0;
                    result = [secIndex, rowIndex];
                }
            } else { 
                if(typeof secIndex != "number") { 
                    var rowData = null,
                        totalRows = 0,
                        secIndex = 0,
                        tempRowIndex = rowIndex;
                    for(var i = 0; i < widgetModel.data.length; i++) {
                        rowData = widgetModel.data[i][1 + 0];
                        totalRows += rowData.length - 0;
                        if(tempRowIndex >= totalRows + 0) {
                            secIndex++;
                            rowIndex = tempRowIndex - totalRows;
                        } else {
                            break;
                        }
                    }

                    if(secIndex >= widgetModel.data.length) { 
                        if(boundaryConditionToBeConsidered) {
                            secIndex = widgetModel.data.length - 1;
                            result = (widgetModel.data[secIndex]) ? widgetModel.data[secIndex][1 + 0].length : 0;
                            result = [secIndex, rowIndex];
                        }
                    } else { 
                        rowData = widgetModel.data[secIndex][1 + 0];
                        if(rowIndex < 0) {
                            if(boundaryConditionToBeConsidered) {
                                result = [secIndex, 0];
                            }
                        } else if(rowIndex >= rowData.length) { 
                            if(boundaryConditionToBeConsidered) {
                                result = [secIndex, rowData.length];
                            }
                        } else { 
                            result = [secIndex, rowIndex];
                        }
                    }
                } else { 
                    if(secIndex < 0 || secIndex >= widgetModel.data.length) { 
                        if(boundaryConditionToBeConsidered) {
                            if(secIndex < 0) {
                                secIndex = 0;
                                if(!widgetModel.data[secIndex]) { 
                                    rowIndex = 0
                                } else {
                                    var rowData = widgetModel.data[secIndex][1 + 0];
                                    if(rowIndex < 0 || rowIndex >= rowData.length) { 
                                        if(boundaryConditionToBeConsidered) {
                                            rowIndex = (rowIndex < 0) ? 0 : (rowIndex >= widgetModel.data.length) ? widgetModel.data.length : rowIndex;
                                        }
                                    }
                                }
                            } else if(secIndex >= widgetModel.data.length) {
                                secIndex = widgetModel.data.length - 0;
                                rowIndex = (widgetModel.data[secIndex]) ? widgetModel.data[secIndex][1 + 0].length : 0; 
                            }
                            result = [secIndex, rowIndex];
                        }
                    } else { 
                        var rowData = widgetModel.data[secIndex][1 + 0];
                        if(rowIndex < 0 || rowIndex >= rowData.length) { 
                            if(boundaryConditionToBeConsidered) {
                                rowIndex = (rowIndex < 0) ? 0 : (rowIndex >= rowData.length) ? rowData.length : rowIndex;
                                result = [secIndex, rowIndex];
                            }
                        } else {
                            result = [secIndex, rowIndex];
                        }
                    }
                }
            }
            return result;
        },

        updateSectionContent: function(widgetData, dataArray, action, rowIndex, secIndex, count) {
            switch(action) {
                case "setsectionat":
                    for(var i = 0; i < dataArray.length; i++) {
                        widgetData.splice(secIndex++, 1, dataArray[i]);
                    }
                    return;
                    break;
                case "addsectionat":
                    for(var i = 0; i < dataArray.length; i++) {
                        widgetData.splice(secIndex++, 0, dataArray[i]);
                    }
                    return;
                    break;
                case "removesectionat":
                    widgetData.splice(secIndex, count);
                    return;
                    break;
            }
            if(action == "addall") {
                if(dataArray[0] instanceof Array) {
                    $KU.addArray(widgetData, dataArray);
                }
            } else {
                var section = widgetData[secIndex];
                var sectionData = section && section[1];
                if(sectionData) {
                    switch(action) {
                        case "setdataat":
                            for(var i = 0; i < dataArray.length; i++) {
                                sectionData.splice(rowIndex++, 1, dataArray[i]);
                            }
                            break;
                        case "addat":
                        case "adddataat":
                            if($KU.isArray(dataArray)) {
                                for(var i = 0; i < dataArray.length; i++) {
                                    sectionData.splice(rowIndex++, 0, dataArray[i]);
                                }
                            } else
                                sectionData.splice(rowIndex, 0, dataArray);
                            break;
                        case "removedataat":
                            sectionData.splice(rowIndex, count);
                            break;
                    }
                }
            }
        },

        isSelectionOutOfBound: function(widgetModel, selection) {
            var outOfBound = false,
                secIndex = selection[0 + 0],
                rowIndex = selection[1 + 0];
            if(widgetModel.hasSections) {
                if(secIndex >= widgetModel.data.length) {
                    outOfBound = true;
                } else {
                    var rowData = widgetModel.data[secIndex][1 + 0];
                    if(rowIndex > rowData.length) {
                        outOfBound = true;
                    }
                }
            } else {
                if(rowIndex >= widgetModel.data.length) {
                    outOfBound = true;
                }
            }
            return outOfBound;
        },

        getRowDataByIndex: function(widgetModel, index) { 
            if(widgetModel.data.length > 0) {
                if($KU.isArray(widgetModel.data[0])) { 
                    if(index[1] == -1) {
                        return widgetModel.data[index[0]][0];
                    } else if(index[1] == -2) {
                        return widgetModel.data[index[0]][2];
                    } else {
                        return widgetModel.data[index[0]][1][index[1]];
                    }
                } else {
                    return widgetModel.data[index[1]];
                }
            }
        },

        
        appendLayoutDataAt: function(widgetModel, data, itemIndex, sectionIndex) {
            var clonedModel = null;
            var flag = false;
            var selfValueBefore = widgetModel.layoutConfig.self;
            var cvNode = $KU.getNodeByModel(widgetModel);
            if(!data || !$KU.isArray(data)) return;
            data = module.Utils.invertMapAndData(widgetModel, data);
            for(var i = 0; i < data.length; i++) {
                clonedModel = module.Utils.getClonedModel(widgetModel, itemIndex + i, sectionIndex);
                if(!clonedModel) continue;
                for(var widgetId in data[i]) {
                    if(!clonedModel[widgetId]) continue;
                    for(var layoutProperty in data[i][widgetId]) {
                        
                        if(['left', 'right', 'centerX', 'width', 'minWidth', 'maxWidth',
                                'top', 'bottom', 'centerY', 'height', 'minHeight', 'maxHeight', 'zindex'
                            ].indexOf(layoutProperty) != -1) {
                            flag = true;
                            clonedModel[widgetId][layoutProperty] = data[i][widgetId][layoutProperty];
                            $KW.Utils.updateClonedModelData(clonedModel[widgetId], widgetModel, layoutProperty);
                            cvNode && module.Data.adjustFlexContainers(widgetModel, 'adddataat', sectionIndex, itemIndex + i, 1);
                        }
                    }
                }
            }
            if(!selfValueBefore & flag) widgetModel.layoutConfig = {
                self: false,
                children: false
            };
        }
    };

    module.Utils = {
        isIndexAndCountValid: function(model, itemIndex, sectionIndex, count, isSectionCount, action) {
            var itemCount = 0;
            var dataLength = (model.data) ? model.data.length : 0
            var lengthToCheck = (action == "adddataat" || action == "addsectionat") ? dataLength + 1 : dataLength;
            if(sectionIndex && (parseInt(sectionIndex) < 0 || parseInt(sectionIndex) >= lengthToCheck)) {
                kony.web.logger("warn", "Invalid section index");
                return false;
            }
            if(itemIndex) {
                itemCount = (model.hasSections) ? ((model.data) ? model.data[sectionIndex][1].length : model.data.length) : (model.data) ? model.data : 0;
                if(parseInt(itemIndex) < 0 || parseInt(itemIndex) >= itemCount) {
                    kony.web.logger("warn", "Invalid item index");
                    return false;
                }

            }
            if(count && (count < 0 || ((isSectionCount && count + sectionIndex > model.data.length) || (count + itemIndex > ((model.hasSections) ? model.data[sectionIndex][1].length : model.data.length))))) {
                kony.web.logger("warn", "Invalid count");
                return false;
            }
            return true;
        },

        setFocus: function(widgetModel, element, index) {
            var indexStr = (widgetModel.hasSections) ? "secindex='" + index[0 + 0] + "," + index[1 + 0] + "'" : "index='" + index[1 + 0] + "'";
            element = document.querySelector("#" + element.id + " li[" + indexStr + "]");
            element && $KW.Widget.setfocus(widgetModel, null, element);
        },

        refreshScrollerInstance: function(widgetModel) {
            var element = $KU.getNodeByModel(widgetModel);
            if(element && widgetModel.needScroller) {
                var scrollInstance = $KG[element.id + "_scroller"];
                if(!scrollInstance)
                    return;
                scrollInstance.refresh();
            }
        },

        reInitializeScrollerInstace: function(widgetModel) {
            var element = $KU.getNodeByModel(widgetModel);
            if(element && widgetModel.needScroller) {
                var scrollerNode = document.getElementById(element.id + "_scroller");
                scrollerNode && $KW.Scroller.initialize([scrollerNode], "CollectionView");
            }
        },

        getClonedModel: function(cvModel, itemIndex, secIndex) {
            if(cvModel.hasSections) {
                if(itemIndex == "header" || itemIndex == -1 || typeof itemIndex == 'undefined') 
                    return cvModel.clonedTemplates[secIndex][0];
                else if(itemIndex == "footer" || itemIndex == -2)
                    return cvModel.clonedTemplates[secIndex][2];
                else
                    return cvModel.clonedTemplates[secIndex][1][itemIndex];
            } else
                return cvModel.clonedTemplates[itemIndex];
        },

        getContextByNode: function(segModel, wNode) {
            var row = $KU.getParentByAttribute(wNode, "index");
            if(segModel.hasSections) {
                var secIndices = row.getAttribute("secindex").split(',');
                return {
                    sectionIndex: parseInt(secIndices[0]),
                    itemIndex: parseInt(secIndices[1])
                };
            }
            return {
                itemIndex: parseInt(row.getAttribute("index"))
            };
        },

        getClonedModelOfWidget: function(wModel, wNode, containerId) {
            var segModel = $KW.Utils.getContainerModelById(wNode, containerId);
            if(!segModel)
                return;
            var clonedTemp = module.Utils.getItemTemplateByNode(segModel, wNode);
            return clonedTemp[wModel.id];
        },

        
        getNodeByContext: function(segModel, context, wModel) {
            var element = $KU.getNodeByModel(segModel);
            if(!element || !context)
                return;

            var secIndex = context.sectionIndex;
            var itemIndex = context.itemIndex;
            var querySelector;
            if(segModel.hasSections) {
                if($KU.isDefined(secIndex) && $KU.isDefined(itemIndex)) {
                    querySelector = "secindex='" + secIndex + "," + itemIndex + "'";
                } else if($KU.isDefined(secIndex)) {
                    querySelector = "secindex='" + secIndex + ",-1'";
                }
            } else if($KU.isDefined(itemIndex)) {
                querySelector = "index='" + itemIndex + "'";
            }
            if(querySelector) {
                var listItem = element.querySelector("[" + querySelector + "]");
                if(listItem) {
                    if(wModel) {
                        return $KW.Utils.getWidgetNode(wModel, listItem);
                    } else
                        return listItem;
                }
            }
        },

        updateDataByContext: function(context, wData) {
            var segModel = context.containerModel;
            if(!segModel || !context || !wData)
                return;
            var data = segModel.data;
            if(data && data.length > 0) {
                var rowData;
                var secIndex = context.sectionIndex;
                var rowIndex = context.itemIndex;
                if(segModel.hasSections) {
                    if($KU.isDefined(secIndex) && $KU.isDefined(rowIndex)) {
                        rowData = data[secIndex][1][rowIndex];
                    } else if($KU.isDefined(secIndex)) {
                        rowData = data[secIndex][0];
                    }
                } else if($KU.isDefined(rowIndex)) {
                    rowData = data[rowIndex];
                }
                if(rowData) {
                    var wModel = context.widgetModel;
                    if(wModel) {
                        var map = segModel.widgetdatamap;
                        var widgetKey = map ? map[wModel.id] : wModel.id;
                        var content = rowData[widgetKey];
                        if(!(content instanceof Object)) {
                            return;
                        }
                        for(var prop in wData) {
                            if($KU.isDefined(wData[prop]))
                                content[prop] = wData[prop];
                        }
                    }
                }
            }
        },

        setCollectionViewHeightAndWidth: function(wModel) {
            var wNode = module.getCollectionViewBaseNode(wModel);
            var topNode = $KU.getNodeByModel(wModel);
            var hBorder = parseInt($KU.getStyle(topNode, "border-left-width"), 10) + parseInt($KU.getStyle(topNode, "border-right-width"), 10);
            var vBorder = parseInt($KU.getStyle(topNode, "border-top-width"), 10) + parseInt($KU.getStyle(topNode, "border-bottom-width"), 10);
            wNode.style.height = wModel.frame.height - vBorder + 'px';
            wNode.style.width = wModel.frame.width - hBorder + 'px';
        },

        getItemTemplateByNode: function(wModel, itemNode) {
            var context = module.Utils.getContextByNode(wModel, itemNode);
            var itemIndex = context.itemIndex;
            var type = itemNode.getAttribute('type');
            if(type == 'HeaderBox' || itemIndex == -1) itemIndex = 'header';
            else if(type == 'FooterBox' || itemIndex == -2) itemIndex = 'footer';
            return module.Utils.getClonedModel(wModel, itemIndex, context.sectionIndex);
        },

        getElementsCountTillSections: function(data, sectionNumber) {
            var elementCount = 0,
                headerFooterCount = 0; 
            for(var i = 0; i < sectionNumber; i++) {
                headerFooterCount = (data[i][0] !== null) ? ((data[i][2] !== null) ? 2 : 1) : ((data[i][2] !== null) ? 1 : 0)
                elementCount = elementCount + headerFooterCount + data[i][1].length;
            }
            return elementCount;
        },

        spliceObjectBasedOnIndex: function(nodeList, startIndex, endIndex) {
            var nodes = [];
            for(var i = startIndex; i < endIndex; i++) {
                nodes.push(nodeList[i]);
            }
            return nodes;
        },

        invertMapAndData: function(widget, data) {
            function __renderContainer__(data, obj) {
                if(!obj) obj = {};
                for(var sKey in data) {
                    if(newmap[sKey]) {
                        var sValue = data[sKey];
                        if(sValue && typeof sValue == "string" && sValue.toLowerCase().indexOf("i18n.getlocalizedstring") != -1)
                            obj[newmap[sKey]] = $KU.getI18NValue(sValue);
                        else
                            obj[newmap[sKey]] = sValue;
                    }
                }
                data["template"] && (obj["template"] = data["template"]);
                data["accessibilityConfig"] && (obj["accessibilityConfig"] = data["accessibilityConfig"]);
                return obj;
            }

            var map = widget.widgetdatamap;
            if(map) {
                map = $KU.isArray(map) ? map[0] : map;
                var keys = $KU.getkeys(map);
                var newmap = {};
                var newdata = [];

                for(var i = 0; i < keys.length; i++) {
                    newmap[map[keys[i]]] = keys[i];
                }

                var newkeys = $KU.getkeys(newmap);
                if(data[0] instanceof Array) {
                    var index = 0;
                    var headerData, footerData;
                    for(var i = 0; i < data.length; i++) {
                        var innerData = data[i][1];
                        newdata[index] = {};
                        headerData = data[i][0];
                        footerData = data[i][2];
                        var headerindex = index;
                        if(headerData && typeof headerData == "string" && headerData.toLowerCase().indexOf("i18n.getlocalizedstring") != -1)
                            newdata[index]["gridHeader"] = $KU.getI18NValue(headerData);
                        else if(headerData instanceof Object) {
                            newdata[index]["gridHeader"] = __renderContainer__(headerData);
                        } else {
                            newdata[index]["gridHeader"] = headerData;
                        }

                        for(var j = 0; j < innerData.length; j++) {
                            newdata[index] = newdata[index] || {};
                            for(var k = 0; k < newkeys.length; k++) {
                                
                                var value = innerData[j][newkeys[k]];
                                if(value && typeof value == "string" && value.toLowerCase().indexOf("i18n.getlocalizedstring") != -1)
                                    newdata[index][newmap[newkeys[k]]] = $KU.getI18NValue(value);
                                else
                                    newdata[index][newmap[newkeys[k]]] = value;
                            }
                            var metaInfo = innerData[j]["metainfo"] || innerData[j]["metaInfo"];
                            metaInfo && (newdata[index]["metainfo"] = metaInfo);
                            innerData[j]["template"] && (newdata[index]["template"] = innerData[j]["template"]);
                            innerData[j]["accessibilityConfig"] && (newdata[index]["accessibilityConfig"] = innerData[j]["accessibilityConfig"]);
                            index++;
                        }

                        index = (headerindex == index) ? index : index - 1;
                        if(footerData && typeof footerData == "string" && footerData.toLowerCase().indexOf("i18n.getlocalizedstring") != -1)
                            newdata[index]["gridFooter"] = $KU.getI18NValue(footerData);
                        else if(footerData instanceof Object) {
                            newdata[index]["gridFooter"] = __renderContainer__(footerData);
                        } else {
                            newdata[index]["gridFooter"] = footerData;
                        }

                        index++;

                        if(innerData.length == 0)
                            index++;
                    }

                } else {
                    for(var i = 0; i < data.length; i++) {
                        newdata[i] = {};
                        for(var j = 0; j < newkeys.length; j++) {
                            
                            var value = data[i][newkeys[j]];
                            if(value && typeof varlue == "string" && value.toLowerCase().indexOf("i18n.getlocalizedstring") != -1)
                                newdata[i][newmap[newkeys[j]]] = $KU.getI18NValue(value);
                            else
                                newdata[i][newmap[newkeys[j]]] = value;
                        }
                        var metaInfo = data[i]["metainfo"] || data[i]["metaInfo"];
                        if(metaInfo) {
                            newdata[i]["metainfo"] = $KU.cloneObj(metaInfo);
                            for(var j = 0; j < newkeys.length; j++) {
                                if(newdata[i]["metainfo"][newkeys[j]]) {
                                    newdata[i]["metainfo"][newmap[newkeys[j]]] = metaInfo[newkeys[j]];
                                    if(newmap[newkeys[j]] != newkeys[j])
                                        delete newdata[i]["metainfo"][newkeys[j]];
                                }
                            }
                        }
                        if(data[i]["template"])
                            newdata[i]["template"] = data[i]["template"];
                        if(data[i]["accessibilityConfig"])
                            newdata[i]["accessibilityConfig"] = data[i]["accessibilityConfig"];

                    }
                }
                return newdata;
            } else
                return data;
        },

        cleanupLayoutProps: function(model, layouttype) {
            if(layouttype == kony.collectionview.LAYOUT_CUSTOM)
                return;
            model.left = model.right = 0
            model.centerX = model.centerY = undefined;
            model.top = model.bottom = 0;
            if(!model.isHeaderOrFooter)
                return;
            if(layouttype == kony.collectionview.LAYOUT_VERTICAL)
                model.height = '100%';
            else
                model.width = '100%';
        },

        getValueInPxBasedOnLayoutType: function(prop, model, layoutType) {
            var valueObj = $KW.FlexUtils.getValueAndUnit(model, model[prop]);
            var value = valueObj.value;
            var layouttype = layoutType != undefined ? layoutType : model.layouttype;
            if(valueObj.unit == kony.flex.PERCENTAGE) {
                if(layouttype == kony.collectionview.LAYOUT_VERTICAL) {
                    var width = model.frame.width;
                    value = (value * width) / 100;
                } else if(layouttype == kony.collectionview.LAYOUT_HORIZONTAL) {
                    var height = model.frame.height;
                    value = (value * height) / 100;
                }
            }
            return value || 0;
        },

        updateReachingOffsetValuesInPx: function(wModel) {
            switch(wModel.layouttype) {

                case kony.collectionview.LAYOUT_VERTICAL:
                case kony.collectionview.LAYOUT_HORIZONTAL:
                    wModel.reachingbeginningoffsetinPX = 0;
                    wModel.reachingendoffsetinPX = 0;
                    if(wModel.reachingbeginningoffset)
                        wModel.reachingbeginningoffsetinPX = module.Utils.getValueInPxBasedOnLayoutType('reachingbeginningoffset', wModel);
                    if(wModel.reachingendoffset)
                        wModel.reachingendoffsetinPX = module.Utils.getValueInPxBasedOnLayoutType('reachingendoffset', wModel);
                    break;
                case kony.collectionview.LAYOUT_CUSTOM:
                    wModel.reachingbeginningoffsetV = 0;
                    wModel.reachingbeginningoffsetH = 0;
                    wModel.reachingendoffsetV = 0;
                    wModel.reachingendoffsetH = 0;
                    if(wModel.reachingbeginningoffset) {
                        wModel.reachingbeginningoffsetV = module.Utils.getValueInPxBasedOnLayoutType('reachingbeginningoffset', wModel, kony.collectionview.LAYOUT_VERTICAL);
                        wModel.reachingbeginningoffsetH = module.Utils.getValueInPxBasedOnLayoutType('reachingbeginningoffset', wModel, kony.collectionview.LAYOUT_HORIZONTAL);
                    }
                    if(wModel.reachingendoffset) {
                        wModel.reachingendoffsetV = module.Utils.getValueInPxBasedOnLayoutType('reachingendoffset', wModel, kony.collectionview.LAYOUT_VERTICAL);
                        wModel.reachingendoffsetH = module.Utils.getValueInPxBasedOnLayoutType('reachingendoffset', wModel, kony.collectionview.LAYOUT_HORIZONTAL);
                    }
                    break;
            }
        }
    };

    module.Animation = {
        getVisibleItems: function(model) {
            var cvNode = $KU.getNodeByModel(model);
            var items = [];
            if(!cvNode || !model.data || model.data.length == 0)
                return null;
            var itemNodes = this.iterateAllItems(model, cvNode, {
                needVisible: true,
                needHeaderFooter: false
            });
            for(var i = 0; i < itemNodes.length; i++) {
                var clonedModel = module.Utils.getItemTemplateByNode(model, itemNodes[i]);
                if(model.hasSections) {
                    var secindex = itemNodes[i].getAttribute('secindex').split(',');
                    clonedModel.sectionIndex = parseInt(secindex[0]);
                    clonedModel.itemIndex = parseInt(secindex[1]);
                } else {
                    clonedModel.itemIndex = parseInt(itemNodes[i].getAttribute('index'))
                }
                clonedModel.containerType = 'CollectionView';
                clonedModel.cvModel = model;
                items.push(clonedModel);
            };
            return items;
        },

        getIndicesForVisibleItems: function(model) {
            var cvNode = $KU.getNodeByModel(model);
            var itemIndices = [];
            if(!cvNode || !model.data || model.data.length == 0)
                return null;
            var itemNodes = this.iterateAllItems(model, cvNode, {
                needVisible: true,
                needHeaderFooter: false
            });
            for(var i = 0; i < itemNodes.length; i++) {
                var context = module.Utils.getContextByNode(model, itemNodes[i]);
                itemIndices.push(context);
            };
            return itemIndices;
        },

        iterateAllItems: function(model, node, config) {
            var scrollerIns = $KG[node.id + '_scroller'];
            var scrollTop = 0;
            var scrollBottom = 0;
            var scrollLeft = 0;
            var scrollRight = 0;
            var _isBetween = function(value, min, max) {
                return value >= min && value <= max;
            };
            var _isHeaderFooter = function(model, node) {
                var context = module.Utils.getContextByNode(model, node);
                if(context.itemIndex == -1 || context.itemIndex == -2) {
                    return true;
                }
                return false;
            }
            if(scrollerIns) {
                scrollTop = Math.abs(scrollerIns.y);
                scrollBottom = scrollTop + scrollerIns.wrapperH;

                scrollLeft = Math.abs(scrollerIns.x);
                scrollRight = scrollLeft + scrollerIns.wrapperW;
            } else {
                scrollTop = node.scrollTop;
                scrollBottom = scrollTop + node.offsetHeight;

                scrollLeft = node.scrollLeft;
                scrollRight = scrollRight + node.offsetWidth;
            }
            var rows = module.getCollectionViewBaseNode(model).children;
            var items = [];
            for(var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var rowTop = row.offsetTop;
                var rowBottom = rowTop + row.offsetHeight;
                var rowLeft = row.offsetLeft;
                var rowRight = rowLeft + row.offsetWidth;
                if(config.needVisible) {
                    if(!config.needHeaderFooter && _isHeaderFooter(model, row)) {
                        continue;
                    }
                    if((_isBetween(rowTop, scrollTop, scrollBottom) || _isBetween(rowBottom, scrollTop, scrollBottom)) &&
                        (_isBetween(rowLeft, scrollLeft, scrollRight) || _isBetween(rowRight, scrollLeft, scrollRight))) {
                        items.push(row);
                    }
                }
                if(config.needAll) {
                    items.push(row);
                }
            }
            if(config.needVisible || config.needAll)
                return items;
        },

        handleOnItemDisplay: function(wModel) {
            var wNode = $KU.getNodeByModel(wModel);
            if(!wNode)
                return;
            var visibleItems = module.Animation.getVisibleItems(wModel);
            var visibleIndeces = module.Animation.getIndicesForVisibleItems(wModel);
            var allItems = this.iterateAllItems(wModel, wNode, {
                needAll: true,
                needHeaderFooter: false
            });
            var i = 0;
            if(visibleItems) {
                for(var i = 0; i < visibleItems.length; i++) {
                    if(!visibleItems[i].onItemDisplayExecuted) {
                        if(wModel.onitemdisplay) {
                            
                            wModel.onitemdisplay(wModel, visibleIndeces[i].sectionIndex, visibleIndeces[i].itemIndex, visibleItems[i]);
                        }
                        visibleItems[i].onItemDisplayExecuted = true;
                    }
                    i++;
                };
            }
            if(allItems) {
                for(var i = 0; i < allItems.length; i++) {
                    var clonedModel = module.Utils.getItemTemplateByNode(wModel, allItems[i]);
                    if(visibleItems.indexOf(clonedModel) == -1) {
                        clonedModel.onItemDisplayExecuted = false;
                    }
                };
            }
        },

        applyItemAnimation: function(itemModel, animInstance, animationConfig, animCallbackConfig, wModel) {
            var itemNode = module.Utils.getNodeByContext(itemModel.cvModel, {
                itemIndex: itemModel.itemIndex,
                sectionIndex: itemModel.sectionIndex
            }, wModel);
            itemNode.wModel = itemModel;
            itemNode.context = {
                sectionIndex: itemModel.sectionIndex,
                itemIndex: itemModel.itemIndex,
                containerModel: itemModel.cvModel,
                widgetModel: itemModel,
                instance: itemModel,
                animType: 'collectionViewItem'
            };
            animInstance.applyRowAnimation && animInstance.applyRowAnimation(itemNode, animationConfig, animCallbackConfig);
        },

        getAnimationContext: function(clonedModel) {
            var context, flexNode;
            var node = $KW.Utils.getWidgetNode(clonedModel);
            var containerId = node && node.getAttribute("kcontainerID");
            var containerModel = $KW.Utils.getContainerModelById(node, containerId);
            var cvItemContext = {
                itemIndex: clonedModel.rowContext.itemIndex,
                sectionIndex: clonedModel.rowContext.sectionIndex
            };
            var parentModel = clonedModel.parent;
            if(clonedModel.isTemplate && clonedModel.containerType == 'CollectionView') { 
                flexNode = module.getCollectionViewBaseNode(containerModel);
                node = module.Utils.getNodeByContext(containerModel, cvItemContext);
            } else {
                flexNode = module.Utils.getNodeByContext(containerModel, cvItemContext, parentModel);
                node = $KW.Utils.getWidgetNode(clonedModel, flexNode);
            }
            context = {
                node: node,
                flexNode: flexNode,
                containerModel: containerModel,
                widgetModel: clonedModel,
                itemIndex: clonedModel.rowContext.itemIndex,
                sectionIndex: clonedModel.rowContext.sectionIndex
            };
            return context;
        }
    };


    return module;
}());
