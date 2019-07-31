
$KW.Segment = (function() {
    
    var _setModalAttributeToSegmentNodes= function(segmentModel, segmentNode, newChildNodes) {
        var nonModalNodes = [], formModel, popupModelID;

        if(segmentNode.getAttribute('notinmodal') == 'true') {
            formModel = $KG.allforms[segmentModel.pf];
            popupModelID = $KU.getPopupModalID(formModel);
            $KU.nodeIterator(newChildNodes, nonModalNodes, popupModelID);
            if(nonModalNodes.length > 0) {
                $KU.setFlexModalAttribute(nonModalNodes, true);
            }
        }
    };
    

    var module = {
        segmentCounter: 0,

        initialize: function() {
            kony.events.addEvent("click", "Segment", this.eventHandler);
            kony.events.addEvent("onorientationchange", "Segment", this.orientationHandler);
        },

        initializeView: function(formId) {
            
            $KU.setScrollBoxesHeight(formId, "Segment");
            $KW.APIUtils.getModelForContentOffset(formId, "Segment");
        },


        orientationHandler: function(formId, orientation) {
            
            $KU.setScrollBoxesHeight(formId, "Segment");
            
        },

        adjustFooter: function(formId) {
            var segments = document.querySelectorAll("#" + formId + " div[kwidgettype='Segment']");
            for(var i = 0; i < segments.length; i++) {
                var segmentModel = $KU.getModelByNode(segments[i]);
                var footer = document.getElementById($KW.Utils.getKMasterWidgetID(segmentModel) + "_footer");
                footer && (footer.style.width = window.innerWidth);
            }
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            switch(propertyName) {
                case "skin":
                case "askin":
                case "rowskin":
                case "alternaterowskin":
                    if(element) {
                        if(propertyName == "skin") {
                            var skin = propertyValue;
                            var oldSkin = oldPropertyValue;
                            $KU.removeClassName(element, oldSkin);
                            $KU.addClassName(element, skin);
                            break;
                        }

                        if(widgetModel.hasSections)
                            this.applySectionRowSkin(widgetModel, element);
                        else {
                            element = element.childNodes[0];
                            this.applyRowSkin(widgetModel, element);
                        }

                    }
                    break;

                case "widgetskin":
                    var element = $KW.Utils.getWidgetNode(widgetModel);
                    if(element) {
                        $KU.removeClassName(element, oldPropertyValue || (widgetModel.skin ? widgetModel.skin : ""));
                        $KU.addClassName(element, propertyValue);
                    }
                    break;

                case "sectionskin":
                case "sectionheaderskin":
                    if(widgetModel.hasSections) module.applySectionHeaderSkin(widgetModel, propertyValue);
                    break;

                case "focusedindex":
                case "selectedindex":
                    if(propertyValue && this.isSelectionOutOfBound(widgetModel, propertyValue)) {
                        return;
                    }
                    
                    widgetModel.__y = 0;
                    if(propertyName == "focusedindex") {
                        propertyValue = IndexJL ? [null, 0, propertyValue] : [0, propertyValue];
                    }
                    if(widgetModel.selectionbehavior != constants.SEGUI_DEFAULT_BEHAVIOR &&
                        widgetModel.viewtype != constants.SEGUI_VIEW_TYPE_PAGEVIEW) {
                        var selectedRows = null;
                        widgetModel.selectedRows = (widgetModel.selectedRows) ? widgetModel.selectedRows : (IndexJL) ? [null] : [];
                        if(propertyValue) {
                            if(widgetModel.selectionbehavior == constants.SEGUI_SINGLE_SELECT_BEHAVIOR) {
                                selectedRows = (IndexJL) ? [null, propertyValue] : [propertyValue];
                                var arrayIndex = $KU.arrayIndex(widgetModel.selectedRows, propertyValue);
                                if(arrayIndex != -1) {
                                    selectedRows.splice(arrayIndex, 1);
                                } else {
                                    selectedRows = selectedRows;
                                }
                            } else if(widgetModel.selectionbehavior == constants.SEGUI_MULTI_SELECT_BEHAVIOR) {
                                var arrayIndex = $KU.arrayIndex(widgetModel.selectedRows, propertyValue);
                                if(arrayIndex != -1) {
                                    widgetModel.selectedRows.splice(arrayIndex, 1);
                                } else {
                                    widgetModel.selectedRows.push(propertyValue);
                                }
                                selectedRows = widgetModel.selectedRows;
                            }
                        }
                        selectedRows = (!selectedRows) ? null : (selectedRows.length > IndexJL) ? selectedRows : null;
                        this.setImages(widgetModel, selectedRows);
                    } else if(widgetModel.selectionbehavior == constants.SEGUI_DEFAULT_BEHAVIOR) {
                        widgetModel.selectedRows = (!propertyValue) ? null : (IndexJL) ? [null, propertyValue] : [propertyValue];
                        this.setSelectedItemsAndIndices(widgetModel);
                    }

                    if(widgetModel.viewtype === constants.SEGUI_VIEW_TYPE_PAGEVIEW) {
                        var swipeContext = widgetModel.swipeContext;
                        if(element) {
                            var imgsElement = element.children[0];
                            var findex = propertyValue[IndexJL + 1];
                            if((findex - IndexJL) <= imgsElement.children.length) {
                                swipeContext.currentPage = parseInt(findex) - IndexJL;
                                $KW.touch.scrollImages(imgsElement, swipeContext.imageWidth * swipeContext.currentPage, $KU.swipeDuration, false);
                                $KW.touch.updatePageIndicator(element, swipeContext, widgetModel);
                            }
                        }
                    } else { 
                        if(element && module.isLazyLoadingApplicable(widgetModel) && module.isSegmentVisible(widgetModel)) {
                            module.generateAndAdjustSegmentTillGivenIndexReached(widgetModel, element, widgetModel.selectedindex);
                            module.renderSegmentTillGivenHeight(widgetModel, element, true, module.getHeightByNumberOfPortions(widgetModel, 3));
                        }
                        (propertyValue && element) && this.setFocus(widgetModel, element, propertyValue);
                    }
                    break;

                case "selectedsectionindex":
                    if(widgetModel.hasSections) {
                        var index = IndexJL ? propertyValue : (propertyValue + 1);
                        if(element) {
                            element = document.querySelector("#" + element.id + " ul:nth-child(" + index + ")");
                            element && $KW.APIUtils.setfocus(widgetModel, null, element);
                        }
                    }
                    break;

                case "selectedindices":
                    if(propertyValue) {
                        var selectedRows = (IndexJL) ? [null] : [];
                        for(var i = IndexJL; i < propertyValue.length; i++) {
                            var secIndex = parseInt(propertyValue[i][0 + IndexJL], 10);
                            var rowIndexes = propertyValue[i][1 + IndexJL];
                            for(var j = IndexJL; j < rowIndexes.length; j++) {
                                var selection = (IndexJL) ? [null, secIndex, rowIndexes[j]] : [secIndex, rowIndexes[j]];
                                if(!this.isSelectionOutOfBound(widgetModel, selection)) {
                                    selectedRows.push(selection);
                                }
                            }
                        }
                        if(widgetModel.selectionbehavior != constants.SEGUI_MULTI_SELECT_BEHAVIOR) {
                            selectedRows = (IndexJL) ? [null, selectedRows[selectedRows.length - 1]] : [selectedRows[selectedRows.length - 1]];
                        }
                        selectedRows = (selectedRows.length > IndexJL) ? selectedRows : null;
                    } else {
                        var selectedRows = null;
                    }
                    if(widgetModel.selectionbehavior == constants.SEGUI_DEFAULT_BEHAVIOR) {
                        widgetModel.selectedRows = selectedRows;
                        this.setSelectedItemsAndIndices(widgetModel);
                    } else {
                        this.setImages(widgetModel, selectedRows);
                    }
                    break;

                case "paginationconfig":
                    module.updatePageFooter(widgetModel);
                    break;

                case "septhickness":
                case "separatorthickness":
                case "sepcolor":
                case "separatorcolor":
                case "separatorrequired":
                    if(element) {
                        var thickness = widgetModel.separatorthickness || widgetModel.septhickness;
                        var color = widgetModel.separatorcolor || widgetModel.sepcolor;
                        var querySelector = "[id='" + element.id + "'] li[index" + (widgetModel.hasSections ? "$='-1']" : "]");
                        var nodes = document.querySelectorAll(querySelector);
                        for(var i = 0; i < nodes.length; ++i) {
                            var node = nodes[i];
                            node.style.border = "none";
                            if(!widgetModel.separatorrequired)
                                continue;
                            var r = parseInt(color.substring(0, 2), 16),
                                g = parseInt(color.substring(2, 4), 16),
                                b = parseInt(color.substring(4, 6), 16);
                            var o = 1 - (parseInt(color.substring(6, 8), 16) / 100);
                            node.style.borderBottom = thickness + "px solid rgba(" + r + "," + g + "," + b + "," + o + ")";
                        }
                    }
                    break;

                case "needpageindicator":
                    if(widgetModel.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW) {
                        var element = document.getElementById($KW.Utils.getKMasterWidgetID(widgetModel) + '_footer');
                        if(element) {
                            if(propertyValue)
                                $KU.removeClassName(element, "hide");
                            else
                                $KU.addClassName(element, "hide");
                        }
                    }
                    break;

                case "pageondotimage":
                case "pageoffdotimage":
                    var element = document.getElementById($KW.Utils.getKMasterWidgetID(widgetModel) + '_footer');
                    if(element)
                        element.innerHTML = module.generatePageFooter(widgetModel, (widgetModel.data || []));
                    break;

                case "data":
                    if($KU.isArray(propertyValue)) {
                        this.setData(widgetModel, propertyValue);
                    } else if(propertyValue === null) {
                        widgetModel.selectedRows = widgetModel.data = null;
                        this.setSelectedItemsAndIndices(widgetModel);
                    }
                    break;

                case "viewtype":
                    var element = $KU.getNodeByModel(widgetModel);
                    if(propertyValue != oldPropertyValue && element) {
                        var parent = element.parentNode;
                        if(oldPropertyValue == constants.SEGUI_VIEW_TYPE_PAGEVIEW)
                            parent = parent.parentNode;
                        parent.innerHTML = this.generateSegment(widgetModel, widgetModel.context);
                        element = $KU.getNodeByModel(widgetModel);
                        if(propertyValue == constants.SEGUI_VIEW_TYPE_PAGEVIEW) {
                            widgetModel.selectionbehavior = constants.SEGUI_DEFAULT_BEHAVIOR;
                            $KW.touch.computeWidths(element, widgetModel);
                            var pScrollerInstance = new $KW.touch.pageviewScroller(element, {
                                widgetModel: widgetModel
                            });
                            $KG[element.id] = pScrollerInstance;
                        }
                        this.adjustFlexContainers(widgetModel, 'setdata');
                    }
                    break;

                case "selectionbehavior":
                    if(propertyValue != oldPropertyValue) {
                        this.setData(widgetModel, widgetModel.data);
                    }
                    break;

                case "selectionbehaviorconfig":
                    if(propertyValue instanceof Object) {
                        widgetModel.selectionindicator = propertyValue.imageIdentifier || propertyValue.imageidentifier;
                        widgetModel.selectimage = propertyValue.selectedStateImage || propertyValue.selectedstateimage;
                        widgetModel.unselectimage = propertyValue.unselectedStateImage || propertyValue.unselectedstateimage;
                    }

                    if(widgetModel.selectionbehavior != constants.SEGUI_DEFAULT_BEHAVIOR) {
                        this.setData(widgetModel, widgetModel.data);
                    }
                    break;
                case "enableScrollBounce":
                    var element = $KU.getNodeByModel(widgetModel);
                    if(element && widgetModel.needScroller) {
                        var scrollInstance = $KG[element.id + "_scroller"];
                        if(scrollInstance) {
                            scrollInstance.options.bounce = widgetModel.scrollbounce;
                            scrollInstance.options.hBounce = widgetModel.scrollbounce;
                            scrollInstance.options.vBounce = widgetModel.scrollbounce;
                        }
                        if(widgetModel.viewtype == "pageview") {
                            var pageScrollInstance = $KG[element.id];
                            if(pageScrollInstance) {
                                pageScrollInstance.options.bounce = widgetModel.scrollbounce;
                                pageScrollInstance.options.hBounce = widgetModel.scrollbounce;
                            }
                        }
                    }
                    break;
            }
        },

        setFocus: function(widgetModel, element, selectedindex) {
            var indexStr = (widgetModel.hasSections) ? "secindex='" + selectedindex[0 + IndexJL] + "," + selectedindex[1 + IndexJL] + "'" : "index='" + selectedindex[1 + IndexJL] + "'";
            element = document.querySelector("#" + element.id + " li[" + indexStr + "]");
            element && $KW.APIUtils.setfocus(widgetModel, null, element);
        },

        render: function(segmentModel, context) {
            var ignoreRetainSelection = false;
            var __y = 0;
            if(!segmentModel.buiskin) segmentModel.buiskin = segmentModel.blockeduiskin;
            
            if(segmentModel.retainscrollpositionmode === constants.SEGUI_SCROLL_POSITION_RETAIN
            || (segmentModel.retainscrollpositionmode == constants.SEGUI_SCROLL_POSITION_TOP && segmentModel.contentOffset)) {
                    ignoreRetainSelection = true;
            }
            if(segmentModel.retainscrollpositionmode === constants.SEGUI_SCROLL_POSITION_RETAIN) {
                __y = segmentModel.__y;
                if(segmentModel.__y >= 0) {
                    
                    setTimeout(function() {
                        $KW.APIUtils.setContentOffSet(segmentModel, {x:0, y:__y}, false);
                    }, 500);
                }
            }
            if(!segmentModel.retainselection) {
                segmentModel.selectedRows = segmentModel.selectedindices = segmentModel.focusedindex = segmentModel.focuseditem = segmentModel.selectedindex = segmentModel.selecteditems = segmentModel.selectedsectionindex = segmentModel.selectedrowindex = segmentModel.selectedrowindices = null;
            } else if(!ignoreRetainSelection) {
                segmentModel.focusedindex = (segmentModel.focusedindex || segmentModel.focusedindex == 0) ? segmentModel.focusedindex : null;
                segmentModel.selectedindex = segmentModel.selectedindex || null;
                segmentModel.focuseditem = segmentModel.focuseditem || null;
                segmentModel.selecteditems = segmentModel.selecteditems || null;
                segmentModel.selectedsectionindex = (segmentModel.selectedsectionindex || segmentModel.selectedsectionindex == 0) ? segmentModel.selectedsectionindex : null;
                segmentModel.selectedindices = segmentModel.selectedindices || null;
                segmentModel.selectedRows = segmentModel.selectedRows || null;
                if(segmentModel.selectedindex && segmentModel.viewtype == constants.SEGUI_VIEW_TYPE_TABLEVIEW) {
                    setTimeout(function() {
                        module.setFocus(segmentModel, $KU.getNodeByModel(segmentModel), segmentModel.selectedindex)
                    }, 500);
                }
            }

            $KU.updateScrollFlag(segmentModel);

            var sConfig = segmentModel.selectionbehaviorconfig;
            if(sConfig && sConfig instanceof Object) {
                segmentModel.selectionindicator = sConfig.imageIdentifier || sConfig.imageidentifier;
                segmentModel.selectimage = sConfig.selectedStateImage || sConfig.selectedstateimage;
                segmentModel.unselectimage = sConfig.unselectedStateImage || sConfig.unselectedstateimage;
            }

            segmentModel.context = context;
            segmentModel.selectedState = false;
            var parentModel = segmentModel.parent;
            if($KW.FlexUtils.isFlexContainer(parentModel))
                segmentModel.layoutConfig.self = true;
            var listAnimation = segmentModel.listAnimation;
            if(listAnimation)
                listAnimation.initialized = false;
            return this.generateSegment(segmentModel, context);
        },

        generateSegment: function(segmentModel, context) {
            var htmlString = "",
                segData = segmentModel.data || [];
            var pageView = (segmentModel.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW) ? true : false;
            segmentModel.selectedsectionindex = IndexJL;
            var isFlexWidget = $KW.FlexUtils.isFlexWidget(segmentModel);
            var visibility = (!isFlexWidget && (!segmentModel.isvisible || segData.length <= IndexJL)) ? "hide" : ""; 
            
            var widgetSkin = (segmentModel.name == "kony.ui.SegmentedUI2") ? (segmentModel.widgetskin ? segmentModel.widgetskin : "") : (segmentModel.skin ? segmentModel.skin : "");
            var margin = $KW.skins.getBaseStyle(segmentModel, context);
            var padding = $KW.skins.getPaddingSkin(segmentModel);
            var scrollingevents;
            var isSLW = segmentModel.screenLevelWidget && (segmentModel.parent.id == segmentModel.pf);
            if(isSLW || (isFlexWidget && segmentModel.autogrowMode != kony.flex.AUTOGROW_HEIGHT)) {
                scrollingevents = segmentModel.scrollingEvents;
            }
            var wID = segmentModel.pf + "_" + segmentModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(segmentModel);
            if(kmasterObj.id != "") {
                wID = kmasterObj.id;
            }
            context.topLevelBox = true;
            
            if(pageView) {
                var rowSkin = segmentModel.rowSkin || "";
                htmlString += "<div id='" + wID + "_wrapper' style='" + margin + ";position:relative' class='" + visibility + " " + widgetSkin + "' " + kmasterObj.kmasterid + ">";
                htmlString += "<div  id='" + wID + "_scroller' class='scrollerX' kwidgettype='KScrollBox' name='touchcontainer_KScroller' swipeDirection ='vertical' " + kmasterObj.kmasterid + ">" + "<div id='" + wID + "_scrollee' class='form_scrollee' kwidgettype='KTouchscrollee' " + kmasterObj.kmasterid + ">";
                htmlString += "<div" + $KW.Utils.getBaseHtml(segmentModel, context);
                htmlString += "name='touchcontainer_Segment' class='kstripcontainer " + " " + rowSkin + "'";
                
                htmlString += ">";
                htmlString += "<div id='imgs' class='kstrip' style='" + (!kony.appinit.useTransition ? "position:relative" : "") + "'>";
            } else {
                htmlString += "<div  id='" + wID + "_scroller' class='scrollerX " + visibility + " " + widgetSkin + "' kwidgettype='KScrollBox' name='touchcontainer_KScroller' swipeDirection ='vertical' style='" + margin + "' " + kmasterObj.kmasterid + ">" + "<div id='" + wID + "_scrollee' class='form_scrollee' kwidgettype='KTouchscrollee' " + kmasterObj.kmasterid + ">";
                htmlString += (scrollingevents && scrollingevents.onPull) ? $KU.getPullString(segmentModel) : "";
                htmlString += "<div" + $KW.Utils.getBaseHtml(segmentModel, context);
                htmlString += " style='" + padding + "'>";
            }

            if(segData.length > IndexJL) {
                if(!pageView)
                    segmentModel.hasSections = $KU.isArray(segData[IndexJL]);
                if(!pageView && segmentModel.hasSections === false) {
                    htmlString += "<ul style='list-style:none'>";
                }
                if(!module.isLazyLoadingApplicable(segmentModel))
                    htmlString += this.generateRows(segmentModel, context, segData, false, IndexJL, IndexJL);
            }

            
            if(pageView) {
                var footer = module.renderPageFooter(segmentModel);
                if(segmentModel.paginationconfig && segmentModel.paginationconfig.position == "top") {
                    htmlString = footer + htmlString;
                    htmlString += "</div></div>";
                } else {
                    htmlString += "</div></div>";
                    htmlString += "</div></div>";
                    htmlString += footer;
                }
                htmlString += '</div>';
            } else {
                if(segmentModel.hasSections === false) { 
                    htmlString += "</ul></div>";
                } else {
                    htmlString += "</div>";
                }
                htmlString += (scrollingevents && scrollingevents.onPush) ? $KU.getPushString(segmentModel) : "";
                htmlString += "</div></div>";
            }
            return htmlString;
        },

        renderPageFooter: function(segmentModel) {
            
            
            var segData = segmentModel.data || [];
            var visibility = (!segmentModel.isvisible || segData.length <= 1 || !segmentModel.needpageindicator) ? "hide" : "";
            
            var position = $KW.FlexUtils.isFlexWidget(segmentModel) ? 'position:absolute;bottom:0px;' : '';
            var footer = "<div class='ktable kwt100 " + visibility + "' style='" + position + module.getPageFooterStyle(segmentModel) + "' id='" + $KW.Utils.getKMasterWidgetID(segmentModel) + "_footer'>" + this.generatePageFooter(segmentModel, segData) + "</div>";
            return footer;
        },

        getPageFooterStyle: function(segmentModel) {
            var segpag = segmentModel.paginationconfig;
            var top = (segpag && segpag.vdistance) || 30,
                left = (segpag && segpag.hdistance) || 0;
            top = (segpag && segpag.position == "top") ? top : -top;
            return segpag ? ("position: relative;z-index: 999;top: " + top + "px; left: " + left + "px;") : "";
        },

        updatePageFooter: function(segmentModel) {
            var footer = document.getElementById($KW.Utils.getKMasterWidgetID(segmentModel) + '_footer');
            if(footer) {
                footer.setAttribute('style', module.getPageFooterStyle(segmentModel));
                var newfooter = footer.cloneNode(true);
                var parentNode = footer.parentNode;
                if(segmentModel.paginationconfig && segmentModel.paginationconfig.position == "top") {
                    parentNode.removeChild(footer);
                    parentNode.insertBefore(newfooter, document.getElementById($KW.Utils.getKMasterWidgetID(segmentModel)));
                }
            }
        },

        
        generateRows: function(model, context, data, liExists, rowIndex, secIndex, isNew) {
            var htmlString = "",
                seperator = "",
                sectionRows = 0,
                color = model.separatorcolor;
            
            var secRowIndex = 0,
                section = null,
                sectionHtml = "",
                rowHtml = "";
            var secSkin = model.sectionheaderskin || model.sectionskin || "",
                rowSkin = "";
            var rskin = model.rowskin || model.skin || "",
                askin = model.alternaterowskin || model.askin || "";
            var headertemplate, boxModel;
            var pageView = (model.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW) ? true : false;
            data = this.invertMapAndData(model, data);
            model.counter = rowIndex;
            var noOfItemsToRemove = (isNew == false) ? 1 : 0;

            if(color && model.separatorrequired) {
                var r = parseInt(color.substring(0, 2), 16),
                    g = parseInt(color.substring(2, 4), 16),
                    b = parseInt(color.substring(4, 6), 16),
                    o = 1 - (parseInt(color.substring(6, 8), 16) / 100);
                var border = model.separatorthickness + "px solid rgba(" + r + "," + g + "," + b + "," + o + ")";
                
                seperator = "background-clip:padding-box;border-bottom:" + border + ";" + (rowIndex > IndexJL ? "border-top:" + border : "") + ";";

            }

            for(var i = IndexJL; i < data.length; i++) {
                this.segmentCounter = i;
                secRowIndex = (!model.hasSections) ? (i - IndexJL) : (data[i].sectionLabel) ? 0 : (secRowIndex + 1);
                rowSkin = (secRowIndex % 2 == 1 && askin) ? askin : rskin;
                if(data[i].metainfo && data[i].metainfo.skin) rowSkin = data[i].metainfo.skin;
                if(data[i].template || model.rowtemplate) {
                    
                    var tabpaneID = context.tabpaneID;
                    context.tabpaneID = "";
                }

                var accessAttr = "";
                var trasform = "";
                section = data[i].sectionLabel;
                if(section || section === "") { 
                    var clonedHeaderTemplate;
                    if(section instanceof Object) { 
                        headertemplate = section.template || model.sectionheadertemplate;
                        if(typeof headertemplate == "string") {
                            headertemplate = _kony.mvc.initializeSubViewController(headertemplate);
                        }
                        $KG.allTemplates[headertemplate.id] = headertemplate;
                        headertemplate.formPathId = model.formPathId;

                        accessAttr = $KU.getAccessibilityValues(model, section.accessibilityConfig, null, rowIndex);
                        if(headertemplate && $KU.getkeys(section).length > 0) {
                            context.topLevelBox = true;
                            context.container = model;
                            if(!headertemplate.pf) {
                                _konyConstNS.Form2.addHeaderorFooter.call(headertemplate, headertemplate);
                            }
                            headertemplate.isTemplate = true; 
                            clonedHeaderTemplate = owl.deepCopy(headertemplate, null, false);

                            
                            $KW.FlexUtils.setRTLtoTemplates(clonedHeaderTemplate);
                            sectionHtml = (clonedHeaderTemplate.wType == "FlexContainer")
                                ? this.renderFlexContainer(clonedHeaderTemplate, context, section, model, rowIndex, secIndex)
                                : this.renderHBox(clonedHeaderTemplate, context, section, model, rowIndex);

                            if(sectionHtml === "") {
                                sectionHtml = " ";
                            }
                            context.topLevelBox = false;
                            delete context.container;
                            if(clonedHeaderTemplate.transform)
                                trasform = $KW.animUtils.applyTransform(clonedHeaderTemplate, clonedHeaderTemplate.transform);
                        }

                    } else if(section === "") {
                        sectionHtml = " ";
                    } else { 
                        sectionHtml = "<div " + $KW.Utils.getBaseHtml(model, context) + ">" + section + "</div>";
                    }
                    if(sectionHtml) { 
                        if(i == IndexJL) {
                            htmlString += "<ul style='list-style:none'>";
                        } else if(sectionRows == i - IndexJL) {
                            secIndex++;
                            rowIndex = IndexJL;
                            htmlString += "</ul><ul style='list-style:none'>";
                        }

                        sectionRows += model.data[secIndex][1 + IndexJL].length > IndexJL ? model.data[secIndex][1 + IndexJL].length - IndexJL : 1;
                        htmlString += "<li style='" + seperator + (trasform ? $KU.cssPrefix + "transform:" + trasform : "") + ";" + $KW.Utils.getAnchorPoint(clonedHeaderTemplate) + "' class='" + secSkin + " middleleftalign'  index='" + secIndex + ",-1' secindex='" + secIndex + ",-1'>" + sectionHtml + "</li>";
                    }
                    model.clonedTemplates.splice(secIndex, noOfItemsToRemove, [clonedHeaderTemplate ? clonedHeaderTemplate : section, []]);
                }
                
                
                model.seccounter = secIndex;
                model.rowcounter = rowIndex;

                context.topLevelBox = true;
                context.container = model;
                trasform = "";
                boxModel = data[i].template || model.rowtemplate || model;
                if(typeof boxModel == "string") {
                    boxModel = _kony.mvc.initializeSubViewController(boxModel);
                }

                boxModel.formPathId = model.formPathId;
                $KG.allTemplates[boxModel.id] = boxModel;
                if(boxModel) {
                    !boxModel.pf && _konyConstNS.Form2.addHeaderorFooter.call(boxModel, boxModel); 
                }
                boxModel.isTemplate = true; 
                var clonedBoxModel = owl.deepCopy(boxModel, null, false);
                
                $KW.FlexUtils.setRTLtoTemplates(clonedBoxModel);
                accessAttr = $KU.getAccessibilityValues(model, data[i].accessibilityConfig, null, rowIndex);
                rowHtml = (clonedBoxModel.wType == "FlexContainer") ? this.renderFlexContainer(clonedBoxModel, context, data[i], model, rowIndex, secIndex) : (clonedBoxModel.wType == "HBox" || clonedBoxModel.orientation == "horizontal") ? this.renderHBox(clonedBoxModel, context, data[i], model, rowIndex) : this.renderVBox(clonedBoxModel, context, data[i], model, rowIndex);
                if(data[i].template || model.rowtemplate) context.tabpaneID = tabpaneID; 
                if(typeof attachEvents == "function") {
                    
                }
                if(model.hasSections) {
                    model.clonedTemplates[secIndex][IndexJL + 1].splice(rowIndex, noOfItemsToRemove, clonedBoxModel);
                } else {
                    model.clonedTemplates.splice(rowIndex, noOfItemsToRemove, clonedBoxModel);
                }
                context.topLevelBox = false;
                delete context.container;
                if(clonedBoxModel.transform)
                    trasform = $KW.animUtils.applyTransform(clonedBoxModel, clonedBoxModel.transform);

                if(!liExists && rowHtml) {
                    if(pageView) {
                        htmlString += "<div index=" + rowIndex + " kwidgettype='KTouchsegment' style='display:none;float: left;width:100%'>";
                    } else {
                        var rowSeperator = '';
                        if(i < data.length - 1) {
                            if(model.hasSections && rowIndex != model.data[secIndex][1 + IndexJL].length - 1)
                                rowSeperator = seperator;
                            else if(!model.hasSections)
                                rowSeperator = seperator;
                        }
                        htmlString += "<li kwidgettype='Segment' style='" + rowSeperator + (trasform ? $KU.cssPrefix + "transform:" + trasform : "") + ";" + $KW.Utils.getAnchorPoint(clonedBoxModel) + "' index=" + rowIndex + " class='" + rowSkin + "'" + (model.hasSections ? " secindex='" + secIndex + "," + rowIndex + "'" : "");
                        htmlString += ">";
                    }
                }
                htmlString += rowHtml;
                if(!liExists && rowHtml) htmlString += pageView ? "</div>" : "</li>";
                if(data.length - IndexJL == i && model.hasSections) htmlString += "</ul>";
                rowIndex++;
                model.counter++;
            }
            return htmlString;
        },

        generatePageFooter: function(segmentModel, data) {
            var htmlString = "";
            var src = "";
            var segpag = segmentModel.paginationconfig;
            var left = (segpag && segpag.hdistance) || 0;
            if(data.length > IndexJL) {
                var alignment = !left || (left == 0);
                var htmlattrs = alignment ? "align='center'" : "style='text-align: left;'";
                htmlString += "<div class='krow kwt100' " + htmlattrs + "><div class='kcell'>";
                segmentModel.pageondotimage = segmentModel.pageondotimage || "whitedot.gif";
                segmentModel.pageoffdotimage = segmentModel.pageoffdotimage || "blackdot.gif";
                for(var i = IndexJL; i < data.length; i++) {
                    var isAriaHidden = data[i].accessibilityConfig && data[i].accessibilityConfig.a11yHidden;
                    var hiddenAttr = isAriaHidden ? " aria-hidden='true'" : " ";
                    src = (typeof segmentModel.focusedindex != "number" && i == IndexJL) ? segmentModel.pageondotimage : (segmentModel.focusedindex == i) ? segmentModel.pageondotimage : segmentModel.pageoffdotimage;
                    htmlString += "<span  " + hiddenAttr + " onclick='$KW.touch.navigationDotsHandler(this)' index='" + i + "'><img style='padding-left:4px' src='" + $KU.getImageURL(src) + "' /></span>";
                }
                htmlString += "</div></div>";
            }
            return htmlString;
        },

        
        setData: function(model, data, animObj) {
            if($KU.isArray(data)) {
                if(data.length > IndexJL) {
                    model.hasSections = $KU.isArray(data[IndexJL]);
                    this.modifyContent(model, data, "setdata", null, null, animObj);
                } else {
                    this.removeAll(model);
                }
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        
        addAll: function(model, data, animObj) {
            if($KU.isArray(data)) {
                if(!$KU.isArray(model.data)) {
                    model.data = (IndexJL) ? [null] : [];
                }
                if(typeof model.hasSections !== "boolean") model.hasSections = $KU.isArray(data[IndexJL]);
                this.modifyContent(model, data, "addall", null, null, animObj);
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        
        removeAll: function(model, animObj) {
            this.modifyContent(model, IndexJL ? [null] : [], "removeall", null, null, animObj);
        },

        
        removeAt: function(model, rowIndex, secIndex, animObj) {
            if(!isNaN(rowIndex) || (secIndex && !isNaN(secIndex))) {
                if($KU.isArray(model.data) && model.data.length > IndexJL) {
                    this.modifyContent(model, [], "removeat", rowIndex, secIndex, animObj);
                }
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        
        setDataAt: function(model, data, rowIndex, secIndex, animObj) {
            if(data instanceof Object && (!isNaN(rowIndex) || (secIndex && !isNaN(secIndex)))) {
                if($KU.isArray(model.data) && model.data.length > IndexJL) {
                    this.modifyContent(model, data, "setdataat", rowIndex, secIndex, animObj);
                }
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        
        addAt: function(model, data, rowIndex, secIndex) {
            if(model.viewtype === constants.SEGUI_VIEW_TYPE_PAGEVIEW && $KU.isArray(data)) {
                throw new KonyError(103, "Error", "Invalid operation.");
            }

            if(data instanceof Object && (!isNaN(rowIndex) || (secIndex && !isNaN(secIndex)))) {
                if(!$KU.isArray(model.data)) {
                    model.data = (IndexJL) ? [null] : [];
                }
                if(typeof model.hasSections !== "boolean") model.hasSections = $KU.isArray(data);
                this.modifyContent(model, data, "addat", rowIndex, secIndex);
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        
        addDataAt: function(model, data, rowIndex, secIndex, animObj) {
            if(model.viewtype === constants.SEGUI_VIEW_TYPE_PAGEVIEW && $KU.isArray(data)) {
                throw new KonyError(103, "Error", "Invalid operation.");
            }

            if(data instanceof Object && (!isNaN(rowIndex) || (secIndex && !isNaN(secIndex)))) {
                if(!$KU.isArray(model.data)) {
                    model.data = (IndexJL) ? [null] : [];
                }
                if(typeof model.hasSections !== "boolean") model.hasSections = $KU.isArray(data);
                this.modifyContent(model, data, "adddataat", rowIndex, secIndex, animObj);
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        
        setDataWithSections: function(model, data) {
            if($KU.isArray(data) && $KU.isArray(data[IndexJL])) {
                this.setData(model, data);
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        
        addSectionAt: function(model, data, secIndex, animObj) {
            if(typeof model.hasSections !== "boolean" && $KU.isArray(data[IndexJL])) model.hasSections = true;

            if(model.hasSections === false || model.viewtype === constants.SEGUI_VIEW_TYPE_PAGEVIEW) {
                throw new KonyError(103, "Error", "Invalid operation.");
            } else if(!$KU.isArray(data[IndexJL])) {
                throw new KonyError(102, "Error", "Invalid input.");
            }

            if(model.hasSections === true) {
                if(!$KU.isArray(model.data)) {
                    model.data = (IndexJL) ? [null] : [];
                }
                this.modifyContent(model, data, "addsectionat", IndexJL, secIndex, animObj);
            }
        },

        
        setSectionAt: function(model, data, secIndex, animObj) {
            if(model.hasSections) {
                if($KU.isArray(data) && !isNaN(secIndex)) {
                    if($KU.isArray(model.data)) this.modifyContent(model, data, "setsectionat", IndexJL, secIndex, animObj);
                } else {
                    throw new KonyError(102, "Error", "Invalid input.");
                }
            } else {
                throw new KonyError(103, "Error", "Invalid operation.");
            }
        },

        
        removeSectionAt: function(model, secIndex, animObj) {
            if(model.hasSections) {
                if(!isNaN(secIndex)) {
                    if($KU.isArray(model.data)) this.modifyContent(model, null, "removesectionat", IndexJL, secIndex, animObj);
                } else {
                    throw new KonyError(102, "Error", "Invalid input.");
                }
            } else {
                throw new KonyError(103, "Error", "Invalid operation.");
            }
        },

        
        refreshScrollerInstance: function(widgetModel) {
            var element = $KU.getNodeByModel(widgetModel);
            if(element && widgetModel.needScroller) {
                var scrollInstance = $KG[element.id + "_scroller"];
                if(!scrollInstance)
                    return;
                scrollInstance.refresh();
                if(widgetModel.viewtype == "pageview") {
                    var pageScrollInstance = $KG[element.id];
                    if(!pageScrollInstance)
                        return;
                    pageScrollInstance.refresh();
                }
            }
        },

        
        modifyContent: function(model, data, action, rowIndex, secIndex, animObj) {
            var secRowIndexArray = [IndexJL, IndexJL],
                boundaryConditionToBeConsidered = false;


            if(action == "addat" || action == "adddataat" || action == "addsectionat") {
                boundaryConditionToBeConsidered = true;
            } else if(action == "setdata" || action == "removeall") {
                boundaryConditionToBeConsidered = secRowIndexArray;
            } else if(action == "addall") {
                boundaryConditionToBeConsidered = (!model.hasSections) ? [IndexJL, model.data.length] : [model.data.length, IndexJL];
            }
            secRowIndexArray = this.calculateSectionRowIndex(model, rowIndex, secIndex, boundaryConditionToBeConsidered);

            if(!model || secRowIndexArray === false) return;

            secIndex = secRowIndexArray[0], rowIndex = secRowIndexArray[1];

            
            model.canUpdateUI = false;
            $KW.Utils.updateContent(model, "data", data, action, rowIndex, secIndex);
            this.adjustAlreadySelectedProperties(model, action, secIndex, rowIndex);
            model.canUpdateUI = true;
            var segmentNode = $KU.getNodeByModel(model);
            if(model.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW && model.data && model.data.length > IndexJL && action == "setdata") {
                
                
                model.focusedindex = IndexJL; 
                model.selectedindex = (IndexJL) ? [null, IndexJL, IndexJL] : [IndexJL, IndexJL]; 
                model.focuseditem = model.data[model.focusedindex];
                model.selecteditems = model.data[model.selectedindex[1 + IndexJL]];
            }
            if(action === "removeall" || action === "setdata") {
                
                model.__y = 0;
            }
            if(!segmentNode) return; 
            if(module.isLazyLoadingApplicable(model) && ['setdata', 'removeall'].indexOf(action) == -1) { 
                if(!module.isSegmentVisible(model)) return;
                if(!module.isRenderRequired(model, segmentNode, action, {rowIndex: rowIndex, sectionIndex: secIndex})){
                    return;
                }
            }
            model.context = model.context ? model.context : {};
            model.context.tabpaneID = segmentNode.getAttribute("ktabpaneid") || "";

            
            var isFlexWidget = $KW.FlexUtils.isFlexWidget(model);
            
            if(!isFlexWidget)
                $KU.toggleVisibilty(segmentNode.parentNode.parentNode, model.data, model);

            
            if(model.hasSections === false && !segmentNode.firstChild) {
                segmentNode.innerHTML = "<ul style='list-style:none'></ul>";
            }
            if(model.hasSections === false || model.viewtype === constants.SEGUI_VIEW_TYPE_PAGEVIEW)
                segmentNode = segmentNode.childNodes[0]; 

            var rowNode = null,
                secNodes = null,
                secNode = null,
                secInnerNodes = null;
            var newSections = 0
            if(model.hasSections) {
                secNodes = segmentNode.childNodes;
                secNode = secNodes[secIndex - IndexJL];
                secInnerNodes = secNode ? secNode.childNodes : null;
            }
            if(action == "setdata")
                model.clonedTemplates = [];
            var onRowDisplayInfo;

            switch(action) {
                case "setdata":
                    if(model.viewtype === constants.SEGUI_VIEW_TYPE_PAGEVIEW || model.hasSections) {
                        segmentNode.innerHTML = this.generateRows(model, model.context, model.data, false, rowIndex, secIndex);
                        _setModalAttributeToSegmentNodes(model, segmentNode, segmentNode);
                    } else {
                        segmentNode.innerHTML = "";
                        this.refreshScrollerInstance(model);
                        var htmlString = '';
                        if(!module.isLazyLoadingApplicable(model))
                            htmlString = this.generateRows(model, model.context, model.data, false, rowIndex, secIndex);
                        segmentNode.parentNode.innerHTML = "<ul style='list-style:none'>" + htmlString + "</ul>";
                        _setModalAttributeToSegmentNodes(model, segmentNode, segmentNode);
                    }
                    if(animObj) {
                        new module.applyRowsAnimationByAPI(model, 'setdata', segmentNode, 0, 0, animObj);
                    }
                    break;

                case "removeall":
                    if(animObj) {
                        new module.applyRowsAnimationByAPI(model, 'removeall', segmentNode, 0, 0, animObj);
                    } else {
                        segmentNode.innerHTML = "";
                        this.refreshScrollerInstance(model);
                    }
                    break;

                case "setsectionat":
                    var wrapper = document.createElement("div");
                    wrapper.innerHTML = this.generateRows(model, model.context, (IndexJL ? [null, data] : [data]), false, rowIndex, secIndex, false);
                    _setModalAttributeToSegmentNodes(model, segmentNode, wrapper);
                    var newSec = wrapper.children[0];
                    new module.applyRowsAnimationByAPI(model, 'setsectionat', newSec, rowIndex, secIndex, animObj);
                    segmentNode.replaceChild(newSec, secNode);
                    break;

                case "removesectionat":
                    if(animObj && animObj.definition) {
                        new module.applyRowsAnimationByAPI(model, 'removesectionat', secNode, rowIndex, secIndex, animObj);
                    } else {
                        segmentNode.removeChild(secNode);
                        model.clonedTemplates.splice(secIndex, 1);
                    }
                    break;

                case "addsectionat":
                    var wrapper = document.createElement("div");
                    wrapper.innerHTML = this.generateRows(model, model.context, data, false, rowIndex, secIndex);
                    _setModalAttributeToSegmentNodes(model, segmentNode, wrapper);
                    newSections = wrapper.children.length;
                    new module.applyRowsAnimationByAPI(model, 'addsectionat', wrapper.childNodes, rowIndex, secIndex, animObj);
                    while(wrapper.children.length > 0) {
                        segmentNode.insertBefore(wrapper.childNodes[0], secNode);
                    }
                    break;

                case "addall":
                    var wrapper = document.createElement("div");
                    if(!model.hasSections) {
                        wrapper.innerHTML = this.generateRows(model, model.context, data, false, rowIndex, secIndex);
                        _setModalAttributeToSegmentNodes(model, segmentNode, wrapper);
                        new module.applyRowsAnimationByAPI(model, 'addall', wrapper.childNodes, rowIndex, secIndex, animObj);
                        while(wrapper.children.length > 0) {
                            segmentNode.appendChild(wrapper.childNodes[0]);
                        }
                    } else {
                        newSections = data.length;
                        var tempSecIndex = secIndex;
                        for(var i = IndexJL; i < data.length; i++) {
                            wrapper.innerHTML = this.generateRows(model, model.context, (IndexJL) ? [null, data[i]] : [data[i]], false, rowIndex, tempSecIndex);
                            _setModalAttributeToSegmentNodes(model, segmentNode, wrapper);
                            new module.applyRowsAnimationByAPI(model, 'addall', wrapper.childNodes, rowIndex, tempSecIndex, animObj);
                            while(wrapper.children.length > 0) {
                                segmentNode.appendChild(wrapper.childNodes[0]);
                            }
                            tempSecIndex++;
                        }
                        
                    }
                    break;

                case "setdataat":
                    if(!model.hasSections) {
                        var rowNode = segmentNode.childNodes[rowIndex - IndexJL];
                        
                        rowNode.innerHTML = this.generateRows(model, model.context, (IndexJL ? [null, data] : [data]), true, rowIndex, secIndex, false);
                        _setModalAttributeToSegmentNodes(model, segmentNode, rowNode);
                    } else {
                        rowNode = secInnerNodes[rowIndex - IndexJL + 1];
                        rowNode.innerHTML = this.generateRows(model, model.context, (IndexJL ? [null, data] : [data]), true, rowIndex, secIndex, false);
                        _setModalAttributeToSegmentNodes(model, segmentNode, rowNode);
                    }
                    if(rowNode) {
                        new module.applyRowsAnimationByAPI(model, 'setdataat', rowNode, rowIndex, secIndex, animObj);
                    }

                    $KU.addAriatoElement(rowNode.firstChild, data.accessibilityConfig, model);

                    break;

                case "removeat":
                    if(animObj && animObj.definition) {
                        var nodeToRemove = model.hasSections ? secInnerNodes[rowIndex + 1] : segmentNode.childNodes[rowIndex];
                        nodeToRemove.setAttribute('nodeToBeRemoved', 'true');
                        new module.applyRowsAnimationByAPI(model, 'removeat', nodeToRemove, rowIndex, secIndex, animObj);
                    } else {
                        if(!model.hasSections) {
                            segmentNode.removeChild(segmentNode.childNodes[rowIndex - IndexJL]);
                            model.clonedTemplates.splice(rowIndex, 1);
                        } else {
                            secNode.removeChild(secInnerNodes[rowIndex - IndexJL + 1]);
                            model.clonedTemplates[secIndex][1].splice(rowIndex, 1);
                        }
                    }
                    if(model.hasSections && model._searchCondition) {
                        module.toggleHeaderVisibility(model, secNode);
                    }
                    break;

                case "addat":
                case "adddataat":
                    var refEl, _html = this.generateRows(model, model.context, (IndexJL ? [null, data] : [data]), false, rowIndex, secIndex),
                        newRowHolderNode = document.createElement("div");
                    var showHeaderFooterForAddDataat = true;
                    
                    if(_html) {
                        newRowHolderNode.innerHTML = _html;
                        _setModalAttributeToSegmentNodes(model, segmentNode, newRowHolderNode);
                        new module.applyRowsAnimationByAPI(model, 'adddataat', newRowHolderNode.childNodes[0], rowIndex, secIndex, animObj);
                        if(!model.hasSections) {
                            if(segmentNode.style.display === "none") segmentNode.style.display = '';
                            if(segmentNode.parentNode.style.display === "none") segmentNode.parentNode.style.display = '';
                            refEl = segmentNode.childNodes[rowIndex - IndexJL] || null;
                            
                            segmentNode.insertBefore(newRowHolderNode.childNodes[0], refEl);
                        } else {
                            if(secNode) {
                                if(secNode.style.display === "none") secNode.style.display = '';
                                if(secNode.parentNode.style.display === "none") secNode.parentNode.style.display = '';
                                secNode.insertBefore(newRowHolderNode.childNodes[0], secInnerNodes[rowIndex - IndexJL + 1]);
                            }
                        }
                    }
                    break;
            }

            var needToUpdateDOM = true;
            if((action == 'removeat' || action == 'removeall' || action == 'removesectionat') && animObj)
                needToUpdateDOM = false;
            if((action == "addat" || action == "adddataat" || action == "removeat" || action == "addall" || action == "addsectionat" || action == "removesectionat") && needToUpdateDOM) {
                if(!model.hasSections) {
                    $KU.adjustNodeIndex(segmentNode, rowIndex, "index");
                    this.applyRowSkin(model, segmentNode);
                } else {
                    this.adjustSectionIndex(segmentNode);
                    this.applySectionRowSkin(model, segmentNode);
                }
            }

            if(model.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW) {
                model.isvisible && (model.data.length > IndexJL) && $KW.touch.computeWidths(segmentNode.parentNode, model);
                if(model.needpageindicator) {
                    var footerHolderNode = $KU.getElementById($KW.Utils.getKMasterWidgetID(model) + "_footer");
                    footerHolderNode.innerHTML = this.generatePageFooter(model, model.data);
                }
            }
            
            model.context.tabpaneID = ""; 
            
            if($KW.Line && model.data && model.data.length > IndexJL) $KW.Line.initializeView($KW.Utils.getKMasterWidgetID(model));

            var segData = model.data;

            model.isvisible && this.adjustFlexContainers(model, action, secIndex, rowIndex, newSections, showHeaderFooterForAddDataat);
            module.updateTemplateContextAfterModifyData(model);

            
            var size, upperLimit, i, j, sectionData, widgetModel;
            if(model.clonedTemplates.length) {
                if(model.hasSections) {
                    if(['addsectionat', 'setsectionat', 'adddataat', 'setdataat'].indexOf(action) >= 0) {
                        size = secIndex + 1;
                    } else if(action === 'addall' || action === 'setdata') {
                        size = model.clonedTemplates.length;
                    } else {
                        size = secIndex;
                    }
                    for(i = secIndex; i < size; i++) {
                        sectionData = model.clonedTemplates[i];
                        if(['addsectionat', 'setsectionat', 'addall', 'setdata'].indexOf(action) >= 0) {
                            widgetModel = sectionData[0];
                            rowNode = $KW.Segment.getNodeByContext(model, widgetModel.rowContext, widgetModel);
                            rowNode && $KW.Utils.processContainerGestures(widgetModel, rowNode);
                        }
                        if(action === 'adddataat' || action === 'setdataat') {
                            upperLimit = rowIndex + 1;
                        } else {
                            upperLimit = sectionData[1].length;
                        }
                        for(j = rowIndex; j < upperLimit; j++) {
                            widgetModel= sectionData[1][j];
                            rowNode = $KW.Segment.getNodeByContext(model, widgetModel.rowContext, widgetModel);
                            rowNode && $KW.Utils.processContainerGestures(widgetModel, rowNode);
                        }
                    }
                } else {
                    if(action ===  'addall' || action === 'setdata') {
                        size = model.clonedTemplates.length;
                    } else if(action === 'adddataat' || action ===  'setdataat') {
                        size = rowIndex + 1;
                    } else {
                        size = rowIndex;
                    }
                    for(i = rowIndex; i < size; i++) {
                        widgetModel = model.clonedTemplates[i];
                        rowNode = $KW.Segment.getNodeByContext(model, widgetModel.rowContext, widgetModel);
                        rowNode && $KW.Utils.processContainerGestures(widgetModel, rowNode);
                    }
                }
            }
             
            var listAnimation = model.listAnimation;
            var needToSyncList = true;
            if(listAnimation) {
                
                if((action == 'removeat' || action == 'removeall' || action == 'removesectionat') && animObj)
                    needToSyncList = false;
                needToSyncList && listAnimation.syncList();
                if(model.onrowdisplay && animObj) {
                    onRowDisplayInfo = {
                        action: action,
                        rowIndex: rowIndex,
                        sectionIndex: secIndex,
                        newItems: data ? data.length : null
                    };
                    listAnimation.onRowDisplayHandler(onRowDisplayInfo);
                }
            }
            if(action == "removeall") 
                model.clonedTemplates = [];
            $KW.FlexUtils.updateAutoGrowFlexConfig(model);
        },

        
        adjustFlexContainers: function(model, action, secIndex, rowIndex, newSections, showHeaderFooterForAddDataat) {
            $KU.needOptimization = false;
            var segNode = $KU.getNodeByModel(model);
            var type = 'FlexContainer';
            var rowNodes, rowLen, visibility, i, j;
            switch(action) {
                case "setdata":
                    this.adjustFlexContainersInSegment(model, segNode);
                    this.initializeNewWidgets(segNode);
                    break;

                case "setdataat":
                case "addat":
                case "adddataat":
                    
                    var row = module.getNodeByContext(model, {
                        rowIndex: rowIndex,
                        sectionIndex: secIndex
                    });
                    if(row) {
                        var flexNode = row.querySelector("div[kwidgettype='" + type + "']");
                        if(flexNode) {
                            var flexModel = this.getClonedModel(model, rowIndex, secIndex);
                            $KW.FlexContainer.forceLayout(flexModel, flexNode.parentNode);
                        }
                        this.initializeNewWidgets(row);

                        if(model._searchCondition && model._config.updateSegment) {
                            visibility = module.isRowVisible(model, row, rowIndex, secIndex);
                            if(model.hasSections && model._config.showSectionHeaderFooter) {
                                if(action === "setdataat" || (action === "adddataat" && showHeaderFooterForAddDataat)) {
                                    module.toggleHeaderVisibility(model, segNode.childNodes[secIndex]);
                                }
                            }
                        }

                    }
                    break;

                case "addall":
                    if(model.hasSections) {
                        var sections = segNode.childNodes;
                        var startIndex = secIndex;
                        var data = model.data;
                        for(var i = 0; i < newSections; i++) {
                            var section = sections[startIndex];
                            var flexNode = section.querySelector('[secIndex="' + startIndex + ',-1"] div[kwidgettype="FlexContainer"]');
                            if(flexNode) {
                                var flexModel = this.getClonedModel(model, -1, startIndex);
                                $KW.FlexContainer.forceLayout(flexModel, flexNode.parentNode);
                            }
                            this.adjustFlexContainersInRows(model, section, data[startIndex][1], startIndex);
                            this.initializeNewWidgets(section);

                            if(model._searchCondition && model._config.updateSegment) {
                                rowNodes = section.childNodes;
                                rowLen = rowNodes.length;

                                for(j = 0; j < rowLen; j++) {
                                    if(!rowNodes[j+1]) break;
                                    rowIndex = rowNodes[j+1].getAttribute("index");
                                    rowIndex = parseInt(rowIndex);
                                    visibility = module.isRowVisible(model, rowNodes[j+1], rowIndex, startIndex);
                                }

                                if(model._config.showSectionHeaderFooter) {
                                    module.toggleHeaderVisibility(model, section);
                                }
                            }

                            startIndex++;
                        }
                    } else {
                        var section = segNode.childNodes[secIndex];
                        var rows = section.childNodes;
                        for(var i = rowIndex; i < rows.length; i++) {
                            var row = rows[i];
                            var flexNode = row.querySelector("div[kwidgettype='" + type + "']");
                            if(flexNode) {
                                var flexModel = this.getClonedModel(model, i, secIndex);
                                $KW.FlexContainer.forceLayout(flexModel, flexNode.parentNode);
                            }
                            this.initializeNewWidgets(row);

                            if(model._searchCondition && model._config.updateSegment) {
                                visibility = module.isRowVisible(model, row, i, secIndex);
                            }

                        }
                    }
                    break;

                case "addsectionat":
                case "setsectionat":
                    var sections = segNode.childNodes;
                    var startIndex = secIndex;
                    if(action == 'setsectionat')
                        newSections = 1;
                    var data = model.data;
                    for(var i = 0; i < newSections; i++) {
                        var section = sections[startIndex];
                        var flexNode = section.querySelector('[secIndex="' + startIndex + ',-1"] div[kwidgettype="FlexContainer"]');
                        if(flexNode) {
                            var flexModel = this.getClonedModel(model, -1, startIndex);
                            $KW.FlexContainer.forceLayout(flexModel, flexNode.parentNode);
                        }
                        this.adjustFlexContainersInRows(model, section, data[startIndex][1], startIndex);
                        this.initializeNewWidgets(section);

                        if(model._searchCondition && model._config.updateSegment) {
                            rowNodes = section.childNodes;
                            rowLen = rowNodes.length;

                            for(j = 0; j < rowLen; j++) {
                                if(!rowNodes[j+1]) break;
                                rowIndex = rowNodes[j+1].getAttribute("index");
                                rowIndex = parseInt(rowIndex);
                                visibility = module.isRowVisible(model, rowNodes[j+1], rowIndex, startIndex);
                            }

                            if(model._config.showSectionHeaderFooter) {
                                module.toggleHeaderVisibility(model, section);
                            }
                        }

                        startIndex++;
                    }
                    break;
            }
            $KU.needOptimization = true;
            if($KW.FlexUtils.isFlexWidget(model) && !model.needScroller && model.autogrowMode == kony.flex.AUTOGROW_HEIGHT && model.viewtype == constants.SEGUI_VIEW_TYPE_TABLEVIEW) {
                var parent = model.parent;
                parent.layoutConfig.children = true;
            }
        },

        initializeNewWidgets: function(node) {
            $KW.Slider && $KW.Slider.initializeView(null, node);
            $KW.Switch && $KW.Switch.initializeView(null, node);
        },

        adjustFlexContainersInSegment: function(segmentModel, segNode) {
            var data = segmentModel.data;

            if(data && data.length > 0) {
                
                if(module.isLazyLoadingApplicable(segmentModel)) {
                    if(!module.isSegmentVisible(segmentModel) || !segmentModel.frame.height) {
                        return;
                    }

                    
                    if((!segmentModel.hasSections && segNode.children[0].children.length == 0)
                    || (segmentModel.hasSections && segNode.children.length == 0)) {
                        segmentModel.clonedTemplates = [];
                        module.adjustFlexContainersInSegmentAtRenderTime(segmentModel, segNode);
                        
                        segmentModel.previousHeight = segmentModel.frame.height;
                        return;
                    } else {
                        if(segmentModel.previousHeight && segmentModel.previousHeight < segmentModel.frame.height) {
                            segmentModel.needToRenderMore = true;
                        }
                        segmentModel.previousHeight = segmentModel.frame.height;
                        segmentModel.currentPortion =  module.getPortionNumber(segmentModel);
                    }
                }

                if(segmentModel.hasSections) {
                    var secLen = data.length;
                    var sectionNodes = segNode.childNodes;
                    for(var i = 0; i < secLen; i++) {
                        var secHeaderNode = module.getNodeByContext(segmentModel, {
                            rowIndex: -1,
                            sectionIndex: i
                        });

                        if(secHeaderNode) {
                            var flexNode = secHeaderNode.querySelector('div[kwidgettype="FlexContainer"]');
                            if(flexNode) {
                                var flexModel = this.getClonedModel(segmentModel, -1, i);
                                $KW.FlexContainer.forceLayout(flexModel, flexNode.parentNode);
                            }
                        }
                        this.adjustFlexContainersInRows(segmentModel, sectionNodes[i], data[i][1], i);
                    }

                    if(segmentModel._searchCondition && segmentModel._config.updateSegment) {
                        module.setFilterResultOnRenderedData(segmentModel, segNode);
                        module.setResultOnSegmentHeader(segmentModel);
                    }

                } else {
                    this.adjustFlexContainersInRows(segmentModel, segNode, data);
                }

                if(segmentModel._searchCondition && segmentModel._config.updateSegment) {
                    module.setFilterResultOnRenderedData(segmentModel, segNode);
                }

            }
            if(module.isLazyLoadingApplicable(segmentModel) && segmentModel.needToRenderMore) {
                segmentModel.currentPortion =  module.getPortionNumber(segmentModel);
                module.renderSegmentTillGivenHeight(segmentModel, segNode, true, module.getHeightByNumberOfPortions(segmentModel, 4));
                segmentModel.needToRenderMore = false;
            } else if(segmentModel.autogrowMode == kony.flex.AUTOGROW_HEIGHT
            && segmentModel.viewtype == constants.SEGUI_VIEW_TYPE_TABLEVIEW
            && $KW.FlexUtils.isFlexWidget(segmentModel) && segmentModel.previousHeight) {
                
                module.onHeightChangedToPreferredFromFixed(segmentModel, segNode);
            }
        },

        adjustFlexContainersInRows: function(segmentModel, segNode, rows, secIndex, needHeight) {
            if(rows && rows.length > 0) {
                var len = rows.length;

                for(var i = 0; i < len; i++) {
                    var rowNode = module.getNodeByContext(segmentModel, {
                        rowIndex: i,
                        sectionIndex: secIndex
                    });
                    
                    if(rowNode) {
                        var flexNode = rowNode.querySelector('div[kwidgettype="FlexContainer"]');

                        if(flexNode) {
                            var flexModel = this.getClonedModel(segmentModel, i, secIndex);
                            flexNode = flexNode.parentNode;

                            if(needHeight) {
                                this.setFlexRowTemplateHeight(flexModel, flexNode);
                            } else{
                                $KW.FlexContainer.forceLayout(flexModel, flexNode);
                            }
                        }
                    }
                }
            }
        },

        getClonedModel: function(segModel, rowIndex, secIndex) {
            if(segModel.hasSections) {
                if(rowIndex == -1 || typeof rowIndex == 'undefined') 
                    return segModel.clonedTemplates[secIndex][0];
                else
                    return segModel.clonedTemplates[secIndex][IndexJL + 1][rowIndex];
            } else
                return segModel.clonedTemplates[rowIndex];
        },

        getContextByNode: function(segModel, wNode) {
            var row = $KU.getParentByAttribute(wNode, "index");
            if(segModel.hasSections) {
                var secIndices = row.getAttribute("secindex").split(',');
                return {
                    sectionIndex: parseInt(secIndices[0]),
                    rowIndex: parseInt(secIndices[1])
                };
            }
            return {
                rowIndex: parseInt(row.getAttribute("index"))
            };
        },

        getClonedModelOfWidget: function(wModel, wNode, containerId) {
            var segModel = $KW.Utils.getContainerModelById(wNode, containerId);
            if(!segModel)
                return;
            var context = module.getContextByNode(segModel, wNode);
            var clonedTemp = module.getClonedModel(segModel, context.rowIndex, context.sectionIndex);
            return clonedTemp[wModel.id];
        },

        
        getNodeByContext: function(segModel, context, wModel) {
            var element = $KU.getNodeByModel(segModel);
            if(!element || !context)
                return;

            var secIndex = context.sectionIndex;
            var rowIndex = context.rowIndex;
            var querySelector;
            if(segModel.hasSections) {
                if($KU.isDefined(secIndex) && $KU.isDefined(rowIndex)) {
                    querySelector = "secindex='" + secIndex + "," + rowIndex + "'";
                } else if($KU.isDefined(secIndex)) {
                    querySelector = "secindex='" + secIndex + ",-1'";
                }
            } else if($KU.isDefined(rowIndex)) {
                querySelector = "index='" + rowIndex + "'";
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
                var rowIndex = context.rowIndex;
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
                                this.setFlexRowTemplateHeight(flexModel, flexNode);
                            }
                        }
                        this.adjustFlexContainersInRows(wModel, sectionNodes[i], data[i][1], i, true);
                    }
                } else {
                    this.adjustFlexContainersInRows(wModel, segNode, data, undefined, true);
                }

                return wNode.offsetHeight;
            }
        },

        setFlexRowTemplateHeight: function(flexModel, flexNode) {
            var containerId = flexNode.childNodes[0].getAttribute("kcontainerID");
            containerId && $KW.Utils.updateContainerDataInDOM(flexNode, containerId);
            $KW.FlexUtils.setFlexContainerStyle(flexModel, flexNode);
        },

        adjustSectionIndex: function(node) {
            var sections = node.childNodes;
            var secindex, index;
            for(var i = 0; i < sections.length; i++) {
                var rows = sections[i].childNodes;
                
                for(var j = 1; j < rows.length; j++) {
                    secindex = (i + IndexJL) + "," + (j + IndexJL - 1);
                    index = (j + IndexJL - 1);
                    rows[j].setAttribute("index", index);
                    rows[j].setAttribute("secindex", secindex);
                }
                if(rows[0]) {
                    rows[0].setAttribute("index", (i + IndexJL) + ",-1");
                    rows[0].setAttribute("secindex", (i + IndexJL) + ",-1");
                }
            }
        },

        applySectionRowSkin: function(widgetModel, holder, startRowIndex, startSectionIndex) {
            
            var sections = holder.childNodes;
            var askin = widgetModel.alternaterowskin || widgetModel.askin || "";
            var rowSkin = widgetModel.rowskin || widgetModel.skin || "";
            var rowData, skin = "";
            var firstTimeRowCheck = true;
            startSectionIndex = startSectionIndex || 0;
            for(var i = startSectionIndex; i < sections.length; i++) {
                var rows = sections[i].childNodes;
                var rowIndex = 1;
                if(firstTimeRowCheck) {
                    firstTimeRowCheck = false;
                    if(startRowIndex && startRowIndex != -1)
                        rowIndex = startRowIndex;
                }
                for(var j = rowIndex; j < rows.length; j++) {
                    var context = module.getContextByNode(widgetModel, rows[j]);
                    rowData = widgetModel.data[i + IndexJL][j];
                    if(rowData) {
                        rowData.metainfo = rowData.metaInfo || rowData.metainfo;
                    }
                    skin = (rowData && rowData.metainfo && rowData.metainfo.skin) || ((j % 2 == 0 && askin) ? askin : rowSkin);
                    rows[j].className = skin;
                    if(widgetModel.separatorthickness && widgetModel.separatorcolor) {
                        if(!widgetModel.separatorrequired) {
                            rows[j].style.borderBottom = "none";
                            continue;
                        }
                        if(context.rowIndex == widgetModel.data[context.sectionIndex][1]) 
                            continue;
                        var r = parseInt(widgetModel.separatorcolor.substring(0, 2), 16),
                            g = parseInt(widgetModel.separatorcolor.substring(2, 4), 16),
                            b = parseInt(widgetModel.separatorcolor.substring(4, 6), 16);
                        var o = 1 - (parseInt(widgetModel.separatorcolor.substring(6, 8), 16) / 100);
                        rows[j].style.borderBottom = widgetModel.separatorthickness + "px solid rgba(" + r + "," + g + "," + b + "," + o + ")";
                    }
                }
            }
        },

        
        invertMapAndData: function(widget, data) {
            var map = widget.widgetdatamap;
            if(map) {
                map = $KU.isArray(map) ? map[IndexJL] : map;
                var keys = $KU.getkeys(map);
                var newmap = {};
                var newdata = IndexJL ? [null] : [];

                for(var i = 0; i < keys.length; i++) {
                    newmap[map[keys[i]]] = keys[i];
                }

                var newkeys = $KU.getkeys(newmap);
                if(data[IndexJL] instanceof Array) {
                    var index = IndexJL;
                    var sectionData;
                    for(var i = IndexJL; i < data.length; i++) {

                        var innerData = data[i][1 + IndexJL];
                        newdata[index] = {};
                        sectionData = data[i][IndexJL];

                        if(sectionData && typeof sectionData == "string" && sectionData.toLowerCase().indexOf("i18n.getlocalizedstring") != -1)
                            newdata[index]["sectionLabel"] = $KU.getI18NValue(sectionData);
                        else if(sectionData instanceof Object) {
                            newdata[index]["sectionLabel"] = {};
                            for(var sKey in sectionData) {
                                if(newmap[sKey]) {
                                    var sValue = sectionData[sKey];
                                    if(sValue && typeof sValue == "string" && sValue.toLowerCase().indexOf("i18n.getlocalizedstring") != -1)
                                        newdata[index]["sectionLabel"][newmap[sKey]] = $KU.getI18NValue(sValue);
                                    else
                                        newdata[index]["sectionLabel"][newmap[sKey]] = sValue;
                                }
                            }
                            sectionData["template"] && (newdata[index]["sectionLabel"]["template"] = sectionData["template"]);
                            sectionData["accessibilityConfig"] && (newdata[index]["sectionLabel"]["accessibilityConfig"] = sectionData["accessibilityConfig"]);
                        } else
                            newdata[index]["sectionLabel"] = sectionData;

                        for(var j = IndexJL; j < innerData.length; j++, index++) {
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
                        }

                        if(innerData.length == IndexJL)
                            index++;
                    }

                } else {
                    for(var i = IndexJL; i < data.length; i++) {
                        newdata[i] = {};

                        for(var j = 0; j < newkeys.length; j++) {
                            
                            var value = data[i][newkeys[j]];

                            if(value && typeof value == "string"
                            && value.toLowerCase().indexOf("i18n.getlocalizedstring") != -1) {
                                newdata[i][newmap[newkeys[j]]] = $KU.getI18NValue(value);
                            } else {
                                newdata[i][newmap[newkeys[j]]] = value;
                            }
                        }
                        var metaInfo = data[i]["metainfo"] || data[i]["metaInfo"];
                        if(metaInfo) {
                            newdata[i]["metainfo"] = $KU.cloneObj(metaInfo);

                            for(var j = 0; j < newkeys.length; j++) {
                                if(newdata[i]["metainfo"][newkeys[j]]) {
                                    newdata[i]["metainfo"][newmap[newkeys[j]]] = metaInfo[newkeys[j]];

                                    if(newmap[newkeys[j]] != newkeys[j]) {
                                        delete newdata[i]["metainfo"][newkeys[j]];
                                    }
                                }
                            }
                        }
                        if(data[i]["template"]) {
                            newdata[i]["template"] = data[i]["template"];
                        }

                        if(data[i]["accessibilityConfig"]) {
                            newdata[i]["accessibilityConfig"] = data[i]["accessibilityConfig"];
                        }

                    }
                }

                return newdata;
            } else {
                return data;
            }
        },

        updateImageIdentifier: function(imageModel, container) {
            if(container.wType == "Segment" && container.selectionindicator == imageModel.id && container.behavior != "default" && container.selectimage && container.unselectimage) {
                var indicator = $KU.inArray(container.selectedRows, (IndexJL) ? [null, container.seccounter, container.rowcounter] : [container.seccounter, container.rowcounter])[0] ? container.selectimage : container.unselectimage;
                imageModel.src = indicator;
            }
        },

        renderFlexContainer: function(flexModel, context, rowData, segmentModel, rowIndex, secIndex) {
            var htmlString = "";
            var boxHTML = "";
            var length;
            var count = 0;
            var style = "";
            var wrapperBegin = "";
            var wrapperClose = "";
            var widgetData = rowData[$KW.Utils.getWidgetPathByModel(flexModel)];
            $KW.Utils.updateChildModel(flexModel, widgetData);
            if(!flexModel.isvisible)
                return "";
            if(flexModel.pf === flexModel.id) {
                module.updateTemplateContext(flexModel, rowIndex, secIndex);
            }
            this.applyWidgetFocusSkin(widgetData, flexModel, segmentModel);
            var computedSkin = $KW.skins.getWidgetSkinList(flexModel, context);
            var boxstyle = " position:relative;" + (flexModel.clipbounds == true ? "overflow:hidden;" : "") + (flexModel.zindex ? "z-index:" + flexModel.zindex : "") + $KW.skins.getBaseStyle(flexModel, context);

            htmlString += "<div id='flexcontainer_wrapper' class=' ' style='" + $KW.skins.getMarginSkin(flexModel, context) + "'>";
            htmlString += "<div class = 'kwt100 " + computedSkin + "'" + $KW.Utils.getBaseHtml(flexModel, context) + " style='" + boxstyle + "'>";

            var wArrary = flexModel.widgets();
            length = wArrary.length;

            for(var i = 0; i < length; i++) {
                var childModel = wArrary[i];
                var widgetData = rowData[$KW.Utils.getWidgetPathByModel(childModel)];
                $KW.Utils.updateChildModel(childModel, widgetData);
                if(childModel.wType == "Image") {
                    module.updateImageIdentifier(childModel, context.container);
                }
                if(!childModel.isvisible) {
                    continue;
                }

                this.applyWidgetFocusSkin(widgetData, childModel, segmentModel);

                var css = "kcell " + $KW.skins.getWidgetAlignmentSkin(childModel) + (childModel.wType == "TPW" ? "  konycustomcss " : "");
                var style = $KW.FlexUtils.getFlexLayoutStyle(childModel);
                var overflow = " ";

                if((childModel.wType == 'FlexContainer' || childModel.wType == 'FlexScrollContainer') && !childModel.clipbounds) {
                    overflow = ';overflow:visible';
                } else {
                    overflow = ';overflow:hidden';
                    overflow += (childModel.wType == 'FlexContainer' ) ? ";" + $KU.cssPrefix + "box-shadow:none" : "";
                    css += childModel.skin;
                }

                wrapperBegin = "<div class = '" + css + "' style='" + style + overflow +"'>";
                wrapperClose = "</div>";

                if(childModel.wType == "FlexContainer" || childModel.wType == "HBox" || childModel.wType == "VBox") {
                    context.topLevelBox = true;
                    if(childModel.wType == "FlexContainer")
                        boxHTML = this.renderFlexContainer(childModel, context, rowData, segmentModel, rowIndex, secIndex);
                    else if(childModel.wType == "HBox")
                        boxHTML = this.renderHBox(childModel, context, rowData, segmentModel);
                    else
                        boxHTML = this.renderVBox(childModel, context, rowData, segmentModel);

                    if(boxHTML)
                        htmlString += wrapperBegin + boxHTML + wrapperClose;
                    else
                        count++;
                } else {
                    if((typeof widgetData != "undefined" && widgetData != "") || childModel.wType == "Line") {
                        htmlString += wrapperBegin + $KW[childModel.wType].render(childModel, context) + wrapperClose;
                    } else
                        count++;
                }
            }

            if(length == count)
                return "";

            htmlString += "</div></div>";
            return htmlString;
        },

        updateTemplateContext: function(widgetModel, rowIndex, secIndex) {
            var childList = widgetModel.children;
            var childModel, i;

            widgetModel.rowContext = {
                "rowIndex": rowIndex,
                "sectionIndex": secIndex
            };

            if(childList) {
                for(i = 0; i < childList.length; i++) {
                    childModel = widgetModel[childList[i]];
                    childModel = $KW.Utils.getActualWidgetModel(childModel);
                    if(childModel && childModel.children && childModel.children.length != 0) {
                        module.updateTemplateContext(childModel, rowIndex, secIndex);
                    } else {
                       childModel.rowContext = {
                            "rowIndex": rowIndex,
                            "sectionIndex": secIndex
                        };
                    }
                }
            }
        },

        updateTemplateContextAfterModifyData: function(segModel){
            var sec = 0;
            var template, i, j, size, rowSize;
            var clonedTemplates = segModel.clonedTemplates;
            var length = segModel.clonedTemplates.length;

            if(segModel.hasSections) {
                for(i = 0; i < length; i++) {
                    var sectionData = clonedTemplates[i];
                    template = sectionData[0];
                    module.updateTemplateContext(template, -1, i);

                    for(j=0; j < sectionData[1].length; j++) {
                        template = sectionData[1][j];
                        module.updateTemplateContext(template, j, i);
                    }
                }
            } else {
                for(i = 0; i < length; i++) {
                    template = clonedTemplates[i];
                    module.updateTemplateContext(template, i, sec);
                }
            }
        },

        renderHBox: function(widgetModel, context, rowData, segmentModel, rowIndex) {
            
            
            var topLevelBox = context.topLevelBox;
            var layoutDirection = $KW.skins.getWidgetAlignmentSkin(widgetModel);
            var htmlString = "";
            var boxHTML = "";
            var length;
            var count = 0;
            var style = "";
            var segmentPadding = ""; 
            var widgetData = rowData[widgetModel.id];
            $KW.Utils.updateChildModel(widgetModel, widgetData);
            if(!widgetModel.isvisible) return "";

            var computedSkin = "";
            var accessAttr = "";
            if(topLevelBox) {
                computedSkin = "kwt100 kbasemargin";
                if(segmentModel.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW) {
                    segmentPadding = $KW.skins.getPaddingSkin(segmentModel);
                }
                accessAttr = $KU.getAccessibilityValues(widgetModel, rowData.accessibilityConfig, null, rowIndex);
            } else {
                htmlString += "<div class = 'krow kwt100' ><div class = 'kcell kwt100'>";
            }
            computedSkin += $KW.skins.getWidgetSkinList(widgetModel, context);
            computedSkin += " " + $KW.skins.getWidgetAlignmentSkin(widgetModel);
            style = $KW.skins.getMarginSkin(widgetModel, context) + ((segmentPadding == "") ? $KW.skins.getPaddingSkin(widgetModel) : segmentPadding);
            htmlString += "<div class = 'ktable " + computedSkin + "'" + accessAttr + $KW.Utils.getBaseHtml(widgetModel, context) + "style='table-layout:fixed;" + style + "'><div class = 'krow " + layoutDirection + " kwt100'>";

            if(widgetModel.children) {
                length = widgetModel.children.length;
                var startIndex = 0;
                var endIndex = widgetModel.children.length;
                for(var i = startIndex;
                    (startIndex == 0 ? (i < endIndex) : (i >= endIndex));
                    (startIndex == 0 ? i++ : i--)) {
                    var childModel = widgetModel[widgetModel.children[i]];
                    context.vLine = (childModel.wType == "Line") ? true : false;
                    var childWidgetID = childModel.id;
                    context.ispercent = widgetModel.percent;
                    var widgetData = rowData[childWidgetID];
                    this.applyWidgetFocusSkin(widgetData, childModel, segmentModel);
                    $KW.Utils.updateChildModel(childModel, widgetData);
                    if(childModel.wType == "Image") {
                        module.updateImageIdentifier(childModel, context.container);
                    }
                    if(!childModel.isvisible) continue;
                    if((childModel.wType == "HBox" || childModel.wType == "VBox")) {
                        context.topLevelBox = false;
                        if(childModel.wType == "HBox")
                            boxHTML = this.renderHBox(childModel, context, rowData, segmentModel);
                        else
                            boxHTML = this.renderVBox(childModel, context, rowData, segmentModel);

                        if(boxHTML)
                            htmlString += boxHTML;
                        else
                            count++;
                    } else {
                        
                        context.ispercent = widgetModel.percent;
                        var alignment = $KW.skins.getWidgetAlignmentSkin(childModel)
                        
                        var containerWeight;
                        if(childModel.containerweight)
                            containerWeight = "kwt" + childModel.containerweight;
                        else
                            containerWeight = "auto";
                        if(childModel.wType == "Line")
                            containerWeight = "auto";
                        var computedSkin = alignment + " " + containerWeight;
                        if((widgetModel.wType == "Segment") || (!(widgetModel.wType == "Segment") && widgetModel.percent == true)) {
                            htmlString += "<div class = 'kcell " + computedSkin + "' style='" + $KW.skins.getChildMarginAsPaddingSkin(childModel) + "'>";
                        }
                        if((typeof widgetData != "undefined" && widgetData != "") || childModel.wType == "Line" || childModel.wType == "FlexContainer") {
                            htmlString += (childModel.wType == "FlexContainer") ? this.renderFlexContainer(childModel, context, rowData, segmentModel) : $KW[childModel.wType].render(childModel, context);
                        } else
                            count++;
                        if((widgetModel.wType == "Segment") || (!(widgetModel.wType == "Segment") && widgetModel.percent == true)) {
                            htmlString += "</div>";
                        }
                    }
                }
            }

            if($KG.appbehaviors.adherePercentageStrictly == true && widgetModel.percent === true) {
                widgetModel.dummyNodeWidth = $KW.HBox.getExtraNodeWidth(widgetModel);
                htmlString += "<div class = 'kcell kwt" + widgetModel.dummyNodeWidth + "'  ></div>";
            }

            if(length == count)
                return "";

            htmlString += "</div></div>";
            if(!topLevelBox) {
                htmlString += "</div></div>";
            }
            return htmlString;
        },

        renderVBox: function(widgetModel, context, rowData, segmentModel, rowIndex) {
            
            
            var topLevelBox = context.topLevelBox;
            var layoutDirection = $KW.skins.getWidgetAlignmentSkin(widgetModel);
            var htmlString = "";
            var style = "";
            var boxHTML = "";
            var length;
            var count = 0;
            var segmentPadding = ""; 

            var widgetData = rowData[widgetModel.id];
            $KW.Utils.updateChildModel(widgetModel, widgetData);
            if(!widgetModel.isvisible)
                return "";

            if(topLevelBox) {
                if(segmentModel.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW) {
                    segmentPadding = $KW.skins.getPaddingSkin(segmentModel);
                }
                htmlString += "<div  class = 'kwt100 kbasemargin ktable'" + $KW.Utils.getBaseHtml(widgetModel, context, null, rowData.accessibilityConfig, rowIndex) + " style='table-layout:fixed;" + segmentPadding + "'>";
            } else {
                var computedSkin = "kwt" + widgetModel.containerweight + " " + layoutDirection;
                
                htmlString += "<div class = ' kcell " + computedSkin + "' style='" + $KW.skins.getChildMarginAsPaddingSkin(widgetModel) + "' >";
                computedSkin = $KW.skins.getWidgetSkinList(widgetModel, context);
                style = $KW.skins.getMarginSkin(widgetModel, context) + $KW.skins.getPaddingSkin(widgetModel, context);
                htmlString += "<div class = ' ktable " + computedSkin + "'" + $KW.Utils.getBaseHtml(widgetModel, context) + "style= 'table-layout:fixed;" + style + "'>";
            }

            if(widgetModel.children) {
                length = widgetModel.children.length;
                for(var i = 0; i < widgetModel.children.length; i++) {
                    var childModel = widgetModel[widgetModel.children[i]];
                    
                    {
                        var childWidgetID = childModel.id;
                        var widgetData = rowData[childWidgetID];
                        this.applyWidgetFocusSkin(widgetData, childModel, segmentModel);
                        $KW.Utils.updateChildModel(childModel, widgetData);
                        if(childModel.wType == "Image") {
                            module.updateImageIdentifier(childModel, context.container);
                        }
                        if(!childModel.isvisible)
                            continue;
                        if((childModel.wType == "VBox" || childModel.wType == "HBox")) {
                            context.topLevelBox = false;
                            if(childModel.wType == "HBox")
                                boxHTML = this.renderHBox(childModel, context, rowData, segmentModel);
                            else
                                boxHTML = this.renderVBox(childModel, context, rowData, segmentModel);

                            if(boxHTML)
                                htmlString += boxHTML;
                            else
                                count++;
                        } else {
                            htmlString += "<div class = 'krow kwt100' >";
                            layoutDirection = $KW.skins.getWidgetAlignmentSkin(childModel);
                            computedSkin = "kwt100";
                            computedSkin += " " + layoutDirection;
                            htmlString += "<div class = 'kcell " + computedSkin + "'>";
                            if((typeof widgetData != "undefined" && widgetData != "") || childModel.wType == "Line" || childModel.wType == "FlexContainer") {
                                htmlString += (childModel.wType == "FlexContainer") ? this.renderFlexContainer(childModel, context, rowData, segmentModel) : $KW[childModel.wType].render(childModel, context);
                            } else {
                                count++;
                            }
                            htmlString += "</div></div>";
                        }

                    }
                }
            }
            if(length == count) return "";

            htmlString += "</div>";
            if(!topLevelBox) {
                htmlString += "</div>";
            }

            return htmlString;
        },

        applyWidgetFocusSkin: function(widgetData, childModel, segmentModel) {
            var segID = $KW.Utils.getKMasterWidgetID(segmentModel);
            var segChildID = $KW.Utils.getKMasterWidgetID(childModel);
            if(widgetData && widgetData.focusSkin) {
                var classSelector = "";
                if(segmentModel.hasSections) {
                    classSelector = "#" + segID + " li[secindex='" + segmentModel.seccounter + "," + segmentModel.rowcounter + "'] #" + segChildID + ":active";
                } else {
                    classSelector = "#" + segID + " li[index='" + segmentModel.rowcounter + "'] #" + segChildID + ":active";

                }
                $KW.skins.applyStyle(widgetData.focusSkin, classSelector, segmentModel.wType);
            }
        },

        applyRowSkin: function(segmentModel, holder, startRowIndex) {
            
            var rows = holder.childNodes;
            var askin = segmentModel.alternaterowskin || segmentModel.askin || "";
            var rowSkin = segmentModel.rowskin || segmentModel.skin || "";
            var rowData, skin = "";
            if(segmentModel.viewType == "pageview") {
                holder.parentElement.className = "kstripcontainer" + " " + rowSkin;
                return;
            }
            startRowIndex = startRowIndex || 0;
            for(var i = startRowIndex; i < rows.length; i++) {
                rowData = segmentModel.data[i + IndexJL];
                if(rowData) {
                    rowData.metainfo = rowData.metaInfo || rowData.metainfo;
                }
                skin = (rowData && rowData.metainfo && rowData.metainfo.skin) || ((i % 2 != 0 && askin) ? askin : rowSkin);
                rows[i].className = skin;
                if(i < rows.length - 1 && segmentModel.separatorthickness && segmentModel.separatorcolor) {
                    if(!segmentModel.separatorrequired) {
                        rows[i].style.borderBottom = "none";
                        continue;
                    }
                    var r = parseInt(segmentModel.separatorcolor.substring(0, 2), 16),
                        g = parseInt(segmentModel.separatorcolor.substring(2, 4), 16),
                        b = parseInt(segmentModel.separatorcolor.substring(4, 6), 16);
                    var o = 1 - (parseInt(segmentModel.separatorcolor.substring(6, 8), 16) / 100);
                    rows[i].style.borderBottom = segmentModel.separatorthickness + "px solid rgba(" + r + "," + g + "," + b + "," + o + ")";
                }
            }
        },

        applySectionHeaderSkin: function(segmentModel, skin) {
            var element = $KU.getNodeByModel(segmentModel);
            if(element) {
                var id = element.id;
                var headers = document.querySelectorAll("#" + id + ">ul>li:first-child");
                for(var i = 0; i < headers.length; i++) {
                    var header = headers[i];
                    header.style.border = "none";
                    header.className = skin + ' middleleftalign';
                }
            }
        },

        isClickableWidget: function(childModel) {
            if(childModel.isContainerWidget || childModel.wType == "Label" || childModel.wType == "Image" || childModel.wType == "RichText") {
                return false;
            } else {
                return true;
            }
        },

        
        updateData: function(childModel, childNode, segmentModel, row, canExecute, eventType) {
            if(segmentModel && row) {
                var index = parseInt(row.getAttribute("index"));
                var secIndex = 0 + IndexJL;
                var data = segmentModel.data;
                var item = null;
                var secIndices;
                var previousRowIndex = segmentModel.selectedrowindex;

                if(segmentModel.hasSections) {
                    secIndices = row.getAttribute("secindex").split(',');
                    secIndex = parseInt(secIndices[0]);
                }
                
                
                if(segmentModel.selectionbehavior == constants.SEGUI_SINGLE_SELECT_BEHAVIOR && (segmentModel.hasSections ? (segmentModel.selectedsectionindex == secIndex) && (segmentModel.focusedindex == index) : (segmentModel.focusedindex == index))) {
                    return;
                }

                if(segmentModel.hasSections) { 
                    segmentModel.selectedsectionindex = secIndex;
                    index = parseInt(secIndices[1]);
                    if(index != -1) {
                        var sectionData = data[secIndex][1 + IndexJL];
                        item = sectionData[index];
                    } else {
                        item = data[secIndex][0 + IndexJL];
                    }
                } else {
                    segmentModel.selectedsectionindex = secIndex;
                    item = segmentModel.data[index];
                }

                if(index != -1) {
                    segmentModel.focusedindex = index;
                    segmentModel.selectedindex = (IndexJL) ? [null, secIndex, index] : [secIndex, index];
                    segmentModel.focuseditem = item;
                    segmentModel.selectedrowindex = (IndexJL) ? [null, secIndex, index] : [secIndex, index];
                    if(!segmentModel.selectionindicator || segmentModel.selectionbehavior == constants.SEGUI_DEFAULT_BEHAVIOR) {
                        segmentModel.selecteditems = (IndexJL) ? [null, item] : [item];
                    }
                }

                segmentModel.currentIndex = [secIndex, index];

                if(item) {
                    item.metainfo = item.metaInfo || item.metainfo;
                }
                var clickable = (item && item.metainfo) ? item.metainfo.clickable : true;
                
                if(segmentModel.selectionindicator && segmentModel.selectionbehavior != constants.SEGUI_DEFAULT_BEHAVIOR && index != -1) {
                    if(!this.isClickableWidget(childModel)) {
                        this.toggleRowSelection(segmentModel, row.parentNode);
                    } else {
                        if(segmentModel.selectionbehavior == constants.SEGUI_SINGLE_SELECT_BEHAVIOR) {

                            segmentModel.focusedindex = previousRowIndex;
                            segmentModel.selectedrowindex = previousRowIndex;
                        }
                    }
                }

                if(segmentModel.selectionbehavior == constants.SEGUI_DEFAULT_BEHAVIOR) {
                    var selectedRows = IndexJL ? [null] : [];
                    var selectedData = IndexJL ? [null, segmentModel.selectedsectionindex, index] : [segmentModel.selectedsectionindex, index];
                    selectedRows.push(selectedData);
                    segmentModel.selectedRows = (selectedRows && selectedRows.length > IndexJL) ? selectedRows : null;
                    this.setSelectedItemsAndIndices(segmentModel);
                }
                
                segmentModel.selectedrowindices = segmentModel.selectedindices;

                $KW.Utils.updateContainerMasterData(segmentModel, item, childModel, childNode, eventType);
                segmentModel.currentIndex = [secIndex, index];

                if(clickable && canExecute) {
                    this.setProgressIndicator(row, segmentModel);
                    if((segmentModel.onclick || segmentModel.onrowclick) && !childNode.getAttribute("kcontainerID")) { 

                        segmentModel.blockeduiskin && $KW.skins.applyBlockUISkin(segmentModel);
                        spaAPM && spaAPM.sendMsg(segmentModel, 'onrowclick');

                        var itemData = module.getRowDataByIndex(segmentModel, (IndexJL) ? [null, secIndex, index] : [secIndex, index]);
                        var segmentref = $KU.returnEventReference(itemData.onclick || itemData.onrowclick || segmentModel.onclick || segmentModel.onrowclick);
                        segmentref && $KU.executeWidgetEventHandler(segmentModel, segmentref, secIndex, index, segmentModel.selectedState); 
                        
                    } else {
                        var clickedIndex = (IndexJL) ? [null, secIndex, index] : [secIndex, index];
                        var eventExecuted = kony.events.executeBoxEvent(childModel, module.getRowDataByIndex(segmentModel, clickedIndex), segmentModel);

                        if(index != -1) { 
                            var itemData = module.getRowDataByIndex(segmentModel, (IndexJL) ? [null, secIndex, index] : [secIndex, index]);
                            if(itemData) {
                                var segmentref = $KU.returnEventReference(itemData.onClick || itemData.onclick || itemData.onRowClick || itemData.onrowclick || segmentModel.onclick || segmentModel.onrowclick);
                            }
                            if(!eventExecuted && segmentref) {
                                segmentModel.blockeduiskin && $KW.skins.applyBlockUISkin(segmentModel);
                                if(segmentModel.selectionbehavior == constants.SEGUI_DEFAULT_BEHAVIOR) {
                                    $KU.executeWidgetEventHandler(segmentModel, segmentref, secIndex, index); 
                                } else {
                                    $KU.executeWidgetEventHandler(segmentModel, segmentref, secIndex, index, segmentModel.selectedState); 
                                }
                                $KU.onEventHandler(segmentModel);
                                
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

        toggleRowSelection: function(segmentModel, holder) {
            if(typeof segmentModel.selectedindex == "undefined") {
                var secIndex = 0 + IndexJL;
                var rowIndex = segmentModel.focusedindex;
            } else if(segmentModel.selectedindex) {
                var secIndex = segmentModel.selectedindex[0 + IndexJL];
                var rowIndex = segmentModel.selectedindex[1 + IndexJL];
            } else {
                var secIndex = segmentModel.selectedindices[0 + IndexJL][0 + IndexJL];
                var rowIndex = segmentModel.selectedindices[0 + IndexJL][1 + IndexJL][0 + IndexJL];
            }

            

            if(segmentModel.selectionbehavior == constants.SEGUI_MULTI_SELECT_BEHAVIOR) {
                segmentModel.selectedRows = (segmentModel.selectedRows) ? segmentModel.selectedRows : (IndexJL) ? [null] : [];
            } else if(segmentModel.selectionbehavior == constants.SEGUI_SINGLE_SELECT_BEHAVIOR) {
                segmentModel.selectedRows = segmentModel.selectedRows ? segmentModel.selectedRows : (IndexJL) ? [null] : [];
            }
            var data = (IndexJL) ? [null, secIndex, rowIndex] : [secIndex, rowIndex];
            var arrIndex = $KU.arrayIndex(segmentModel.selectedRows, data);
            if(arrIndex != -1) { 
                var selected = false;
                segmentModel.selectedRows.splice(arrIndex, 1);
            } else {
                var selected = true;
                if(segmentModel.selectionbehavior == constants.SEGUI_MULTI_SELECT_BEHAVIOR) {
                    segmentModel.selectedRows.push(data);
                } else {
                    segmentModel.selectedRows = (IndexJL) ? [null, data] : [data];
                }
            }
            segmentModel.selectedRows = (segmentModel.selectedRows && segmentModel.selectedRows.length > IndexJL) ? segmentModel.selectedRows : null;
            this.setSelectedItemsAndIndices(segmentModel);
            var element = $KU.getNodeByModel(segmentModel);
            var itemData = module.getRowDataByIndex(segmentModel, (IndexJL) ? [null, secIndex, rowIndex] : [secIndex, rowIndex]);
            var rowTemplate = itemData.template || itemData.rowtemplate || segmentModel.rowTemplate;
            if(typeof rowTemplate == "string") {
                rowTemplate = _kony.mvc.initializeSubViewController(rowTemplate);
            }
            var imgID = (rowTemplate ? rowTemplate.id : segmentModel.pf) + "_" + segmentModel.selectionindicator;
            var query = " [index='{index}'] [id='" + imgID + "']";
            query = segmentModel.hasSections ? (" ul:nth-child(" + (IndexJL ? secIndex : secIndex + 1) + ") " + query) : query;
            query = "#" + element.id + query;

            if(segmentModel.selectionindicator) {
                var childNode = document.querySelector(query.replace(/\{index\}/g, rowIndex));
                var src = (childNode && childNode.src) || "";
                src = src.substring(src.lastIndexOf("/") + 1, src.length);
                var img;
                var indicator = selected ? segmentModel.selectimage : segmentModel.unselectimage;
                src && (childNode.src = $KU.getImageURL(indicator));
                var rowEle = $KU.getParentByAttribute(childNode, "index");
                if(rowEle) {
                    rowEle.firstChild.setAttribute('aria-selected', selected);
                    selected ? rowEle.firstChild.setAttribute('role', "option") : rowEle.firstChild.removeAttribute('role', "option");
                }
            }
            if(segmentModel.selectionbehavior == constants.SEGUI_SINGLE_SELECT_BEHAVIOR) {
                if(segmentModel.selectionindicator) {
                    this.setImages(segmentModel, segmentModel.selectedRows);
                }
            }
            segmentModel.onselect && segmentModel.onselect(segmentModel, segmentModel.focusedindex, selected);
            segmentModel.selectedState = selected;
        },

        eventHandler: function(eventObject, target, sourceFormID) {
            var segWidgetModel = $KU.getModelByNode(target);
            if(target.getAttribute("kwidgettype") != 'Segment') {
                $KW.Utils.updateContainerData(segWidgetModel, target, true);
            }
        },

        setProgressIndicator: function(link, model) {
            var progressdiv = $KW.Utils.setProgressIndicator($KU.getParentByAttribute(link, kony.constants.KONY_WIDGET_TYPE), model);
            link.insertBefore(progressdiv, link.childNodes[0]);
        },

        setSelectedItemsAndIndices: function(segmentModel, ignoreIndices) {
            if(segmentModel.selectedRows) {
                segmentModel.selecteditems = (IndexJL) ? [null] : [];
                var sections = {};
                for(var i = IndexJL; i < segmentModel.selectedRows.length; i++) {
                    var segIndex = segmentModel.selectedRows[i][0 + IndexJL];;
                    var rowIndex = segmentModel.selectedRows[i][1 + IndexJL];
                    if(!ignoreIndices) {
                        if(!sections[segIndex]) sections[segIndex] = (IndexJL) ? [null] : [];
                        sections[segIndex].push(rowIndex);
                    }
                    if(segmentModel.hasSections) {
                        var sectionData = segmentModel.data[segIndex][1 + IndexJL];
                        var item = sectionData[rowIndex];
                    } else {
                        var item = segmentModel.data[rowIndex];
                    }
                    segmentModel.selecteditems.push(item);
                }
                if(!ignoreIndices) {
                    segmentModel.selectedindices = (IndexJL) ? [null] : [];
                    for(var k in sections) {
                        var section = (IndexJL) ? [null] : [];
                        section.push(parseInt(k, 10));
                        section.push(sections[k]);
                        segmentModel.selectedindices.push(section);
                    }
                }
                segmentModel.selectedindex = segmentModel.selectedRows[segmentModel.selectedRows.length - 1];
                segmentModel.selectedsectionindex = segmentModel.selectedindex[0 + IndexJL];
                segmentModel.focusedindex = segmentModel.selectedindex[1 + IndexJL];
                segmentModel.focuseditem = segmentModel.selecteditems[segmentModel.selecteditems.length - 1];
            } else {
                segmentModel.focusedindex = segmentModel.focuseditem = segmentModel.selectedsectionindex = segmentModel.selectedindex = segmentModel.selecteditems = null;
                if(!ignoreIndices) {
                    segmentModel.selectedindices = null;
                }
            }
        },

        setImages: function(widgetModel, selectedRows) {
            if(widgetModel.selectionbehavior != constants.SEGUI_DEFAULT_BEHAVIOR) {
                var element = $KU.getNodeByModel(widgetModel);
                if(element) {
                    
                    var src = $KU.getImageURL(widgetModel.selectimage);
                    var selectedImages = document.querySelectorAll('#' + element.id + ' li img[src="' + src + '"]');
                    for(var i = 0; i < selectedImages.length; i++) {
                        src = $KU.getImageURL(widgetModel.unselectimage);
                        selectedImages[i].setAttribute('src', src);
                        var rowEle = $KU.getParentByAttribute(selectedImages[i], "index");
                        if(rowEle) {
                            rowEle.firstChild.removeAttribute('aria-selected');
                            rowEle.firstChild.removeAttribute('role', "option");
                        }
                    }

                    if(selectedRows) {
                        if(widgetModel.selectionbehavior == constants.SEGUI_SINGLE_SELECT_BEHAVIOR) {
                            selectedRows = (IndexJL) ? [null, selectedRows[selectedRows.length - 1]] : [selectedRows[selectedRows.length - 1]];
                        }

                        
                        for(var i = IndexJL; i < selectedRows.length; i++) {
                            var itemData = module.getRowDataByIndex(widgetModel, [selectedRows[i][0], selectedRows[i][1]]);
                            var rowTemplate = itemData.template || itemData.rowtemplate || widgetModel.rowTemplate;
                            if(typeof rowTemplate == "string") {
                                rowTemplate = _kony.mvc.initializeSubViewController(rowTemplate);
                            }
                            if(widgetModel.hasSections) {
                                selectedImages = document.querySelectorAll('#' + element.id + ' li[secindex="' + selectedRows[i][0 + IndexJL] + ',' + selectedRows[i][1 + IndexJL] + '"] img#' + rowTemplate.id + '_' + widgetModel.selectionindicator);
                            } else {
                                selectedImages = document.querySelectorAll('#' + element.id + ' li[index="' + selectedRows[i][1 + IndexJL] + '"] img#' + rowTemplate.id + '_' + widgetModel.selectionindicator);
                            }
                            var src = $KU.getImageURL(widgetModel.selectimage);
                            for(var j = 0; j < selectedImages.length; j++) {
                                selectedImages[j].setAttribute('src', src);
                                var rowEle = $KU.getParentByAttribute(selectedImages[i], "index");
                                if(rowEle) {
                                    rowEle.firstChild.setAttribute('aria-selected', true);
                                    rowEle.firstChild.setAttribute('role', "option")
                                }
                            }
                        }
                    }
                }
                widgetModel.selectedRows = selectedRows;
                this.setSelectedItemsAndIndices(widgetModel);
            }
        },

        adjustAlreadySelectedProperties: function(widgetModel, action, secIndex, rowIndex) {
            if(action != "addall") {
                if(action == "setdata" || action == "removeall") {
                    widgetModel.selectedRows = null;
                }
                if(widgetModel.selectedRows) {
                    widgetModel.selectedRows = this.adjustSelectedRows(widgetModel.selectedRows, action, secIndex, rowIndex);
                    widgetModel.selectedRows && (widgetModel.selectedrowindex = widgetModel.selectedRows[widgetModel.selectedRows.length - 1]);
                }
                if(widgetModel.selectedrowindices) {
                    widgetModel.selectedrowindices = this.adjustSelectedRowIndices(widgetModel.selectedrowindices, action, secIndex, rowIndex);
                }
                this.setSelectedItemsAndIndices(widgetModel);
            }
        },

        adjustSelectedRowIndices: function(sIndices, action, secIndex, rowIndex) {
            var sRowArray;
            switch(action) {
                case "addat":
                case "adddataat":
                    for(var i = IndexJL; i < sIndices.length; i++) {
                        sRowArray = sIndices[i][1 + IndexJL];
                        if(sIndices[i][0 + IndexJL] == secIndex) {
                            for(var j = IndexJL; j < sRowArray.length; j++) {

                                if(sRowArray[j] >= rowIndex)
                                    sRowArray[j] = sRowArray[j] + 1;
                            }
                            sIndices[i][1 + IndexJL] = sRowArray;
                        }

                    }

                    break;
                case "setdataat":
                case "removeat":
                    for(var i = IndexJL; i < sIndices.length; i++) {
                        sRowArray = sIndices[i][1 + IndexJL];
                        if(sIndices[i][0 + IndexJL] == secIndex) {
                            var arrIndex = $KU.arrayIndex(sRowArray, IndexJL + rowIndex);
                            if(arrIndex != -1) {
                                sRowArray.splice(arrIndex, 1);
                            }
                            if(action === "removeat") {
                                for(var j = IndexJL; j < sRowArray.length; j++) {
                                    if(sRowArray[j] > rowIndex)
                                        sRowArray[j] = sRowArray[j] - 1;
                                }
                            }
                            sIndices[i][1 + IndexJL] = sRowArray;
                        }
                    }
                    break;
                case "addsectionat":
                    for(var i = IndexJL; i < sIndices.length; i++) {
                        if(sIndices[i][0 + IndexJL] >= secIndex) {
                            sIndices[i][0 + IndexJL] = sIndices[i][0 + IndexJL] + 1;
                        }
                    }
                    break;
                case "removesectionat":
                case "setsectionat":
                    var removeIndexes = [];
                    for(var i = IndexJL; i < sIndices.length; i++) {
                        if(sIndices[i][0 + IndexJL] == secIndex) {
                            removeIndexes.push(i);
                        }
                    }
                    for(var i = 0; i < removeIndexes.length; i++) {
                        sIndices.splice(removeIndexes[i], 1);
                    }
                    if(action == "removesectionat") {
                        for(var i = IndexJL; i < sIndices.length; i++) {
                            if(sIndices[i][0 + IndexJL] > secIndex) {
                                sIndices[i][0 + IndexJL] = sIndices[i][0 + IndexJL] - 1;
                            }
                        }
                    }
                    break;
            }
            return(sIndices.length > IndexJL) ? sIndices : null;
        },

        adjustSelectedRows: function(sRows, action, secIndex, rowIndex) {
            switch(action) {
                case "addat":
                case "adddataat":
                    for(var i = IndexJL; i < sRows.length; i++) {
                        if(sRows[i][0 + IndexJL] == secIndex && sRows[i][1 + IndexJL] >= rowIndex) {
                            sRows[i][1 + IndexJL] = sRows[i][1 + IndexJL] + 1;
                        }
                    }
                    break;
                case "setdataat":
                    var arrIndex = $KU.arrayIndex(sRows, (IndexJL) ? [null, secIndex, rowIndex] : [secIndex, rowIndex]);
                    if(arrIndex != -1) {
                        sRows.splice(arrIndex, 1);
                    }
                    break;
                case "removeat":
                    var arrIndex = $KU.arrayIndex(sRows, (IndexJL) ? [null, secIndex, rowIndex] : [secIndex, rowIndex]);
                    if(arrIndex != -1) {
                        sRows.splice(arrIndex, 1);
                    }
                    for(var i = IndexJL; i < sRows.length; i++) {
                        if(sRows[i][0 + IndexJL] == secIndex && sRows[i][1 + IndexJL] > rowIndex) {
                            sRows[i][1 + IndexJL] = sRows[i][1 + IndexJL] - 1;
                        }
                    }
                    break;
                case "addsectionat":
                    for(var i = IndexJL; i < sRows.length; i++) {
                        if(sRows[i][0 + IndexJL] >= secIndex) {
                            sRows[i][0 + IndexJL] = sRows[i][0 + IndexJL] + 1;
                        }
                    }
                    break;
                case "removesectionat":
                case "setsectionat":
                    var removeIndexes = [];
                    for(var i = IndexJL; i < sRows.length; i++) {
                        if(sRows[i][0 + IndexJL] == secIndex) {
                            removeIndexes.push(i);
                        }
                    }
                    for(var i = 0; i < removeIndexes.length; i++) {
                        sRows.splice(removeIndexes[i], 1);
                    }
                    if(action == "removesectionat") {
                        for(var i = IndexJL; i < sRows.length; i++) {
                            if(sRows[i][0 + IndexJL] > secIndex) {
                                sRows[i][0 + IndexJL] = sRows[i][0 + IndexJL] - 1;
                            }
                        }
                    }
                    break;
            }
            return(sRows.length > IndexJL) ? sRows : null;
        },

        
        calculateSectionRowIndex: function(widgetModel, rowIndex, secIndex, boundaryConditionToBeConsidered) {
            if(typeof boundaryConditionToBeConsidered != "boolean") {
                return boundaryConditionToBeConsidered;
            }
            var result = false;
            rowIndex = (boundaryConditionToBeConsidered && rowIndex < IndexJL) ? IndexJL : rowIndex;
            if(!widgetModel.hasSections) { 
                if(rowIndex < IndexJL || rowIndex >= widgetModel.data.length) { 
                    if(boundaryConditionToBeConsidered) {
                        secIndex = IndexJL;
                        rowIndex = (rowIndex < IndexJL) ? IndexJL : (rowIndex >= widgetModel.data.length) ? widgetModel.data.length : rowIndex;
                        result = [secIndex, rowIndex];
                    }
                } else { 
                    secIndex = IndexJL;
                    result = [secIndex, rowIndex];
                }
            } else { 
                if(typeof secIndex != "number") { 
                    var rowData = null,
                        totalRows = 0,
                        secIndex = IndexJL,
                        tempRowIndex = rowIndex;
                    for(var i = IndexJL; i < widgetModel.data.length; i++) {
                        rowData = widgetModel.data[i][1 + IndexJL];
                        totalRows += rowData.length - IndexJL;
                        if(tempRowIndex >= totalRows + IndexJL) {
                            secIndex++;
                            rowIndex = tempRowIndex - totalRows;
                        } else {
                            break;
                        }
                    }

                    if(secIndex >= widgetModel.data.length) { 
                        if(boundaryConditionToBeConsidered) {
                            secIndex = widgetModel.data.length - 1;
                            result = (widgetModel.data[secIndex]) ? widgetModel.data[secIndex][1 + IndexJL].length : IndexJL;
                            result = [secIndex, rowIndex];
                        }
                    } else { 
                        rowData = widgetModel.data[secIndex][1 + IndexJL];
                        if(rowIndex < IndexJL) {
                            if(boundaryConditionToBeConsidered) {
                                result = [secIndex, IndexJL];
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
                    if(secIndex < IndexJL || secIndex >= widgetModel.data.length) { 
                        if(boundaryConditionToBeConsidered) {
                            if(secIndex < IndexJL) {
                                secIndex = IndexJL;
                                if(!widgetModel.data[secIndex]) { 
                                    rowIndex = IndexJL
                                } else {
                                    var rowData = widgetModel.data[secIndex][1 + IndexJL];
                                    if(rowIndex < IndexJL || rowIndex >= rowData.length) { 
                                        if(boundaryConditionToBeConsidered) {
                                            rowIndex = (rowIndex < IndexJL) ? IndexJL : (rowIndex >= widgetModel.data.length) ? widgetModel.data.length : rowIndex;
                                        }
                                    }
                                }
                            } else if(secIndex >= widgetModel.data.length) {
                                secIndex = widgetModel.data.length - IndexJL;
                                rowIndex = (widgetModel.data[secIndex]) ? widgetModel.data[secIndex][1 + IndexJL].length : IndexJL; 
                            }
                            result = [secIndex, rowIndex];
                        }
                    } else { 
                        var rowData = widgetModel.data[secIndex][1 + IndexJL];
                        if(rowIndex < IndexJL || rowIndex >= rowData.length) { 
                            if(boundaryConditionToBeConsidered) {
                                rowIndex = (rowIndex < IndexJL) ? IndexJL : (rowIndex >= rowData.length) ? rowData.length : rowIndex;
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

        updateSectionContent: function(widgetData, dataArray, action, rowIndex, secIndex) {
            switch(action) {
                case "setsectionat":
                    widgetData.splice(secIndex, 1, dataArray);
                    return;
                    break;
                case "addsectionat":
                    for(var i = IndexJL; i < dataArray.length; i++) {
                        widgetData.splice(secIndex++, 0, dataArray[i]);
                    }
                    return;
                    break;
                case "removesectionat":
                    widgetData.splice(secIndex, 1);
                    return;
                    break;
            }
            if(action == "addall") {
                if(dataArray[IndexJL] instanceof Array) {
                    $KU.addArray(widgetData, dataArray);
                }
            } else {
                var section = widgetData[secIndex];
                var sectionData = section && section[1 + IndexJL];
                if(sectionData) {
                    switch(action) {
                        case "setdataat":
                            sectionData.splice(rowIndex, 1, dataArray);
                            break;
                        case "addat":
                        case "adddataat":
                            if($KU.isArray(dataArray)) {
                                for(var i = IndexJL; i < dataArray.length; i++) {
                                    sectionData.splice(rowIndex++, 0, dataArray[i]);
                                }
                            } else
                                sectionData.splice(rowIndex, 0, dataArray);
                            break;
                        case "removeat":
                            sectionData.splice(rowIndex, 1);
                            break;
                    }
                }
            }
        },

        isSelectionOutOfBound: function(widgetModel, selection) {
            var outOfBound = false,
                secIndex = selection[0 + IndexJL],
                rowIndex = selection[1 + IndexJL];
            if(widgetModel.hasSections) {
                if(secIndex >= widgetModel.data.length) {
                    outOfBound = true;
                } else {
                    var rowData = widgetModel.data[secIndex][1 + IndexJL];
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
            if(widgetModel.data.length > IndexJL) {
                if($KU.isArray(widgetModel.data[0])) { 
                    if(index[IndexJL + 1] == -1) {
                        return widgetModel.data[index[0]][IndexJL];
                    } else {
                        return widgetModel.data[index[0]][IndexJL + 1][index[1]];
                    }
                } else {
                    return widgetModel.data[index[1]];
                }
            }
        },

        animateRows: function(segmentModel, animContext) {
            var element = $KU.getNodeByModel(segmentModel);
            if(!element)
                return;

            if(animContext) {
                var rows = animContext.context || animContext.rows;
                var animInfo = animContext.animation;
                if(!rows || !$KU.isArray(rows) || !animInfo || !animInfo.definition)
                    return;

                var widgetId = animContext.widgetID;
                var widgets = animContext.widgets || [];

                if(widgetId)
                    widgets.push(widgetId);

                this.animatableNodesCounter = 0;
                this.startEventCounter = 0;
                this.endEventCounter = 0;

                if(widgets && widgets.length > 0) {
                    var widgetRef;
                    for(var i = 0; i < rows.length; i++) {
                        var rowContext = rows[i];
                        var secIndex = rowContext.sectionIndex;
                        var rowIndex = rowContext.rowIndex;

                        var clonedTemplate = module.getClonedModel(segmentModel, rowIndex, secIndex);
                        if(!(clonedTemplate instanceof Object))
                            continue;
                        for(var j = 0; j < widgets.length; j++) {
                            widgetRef = clonedTemplate[widgets[j]];
                            if(widgetRef) {
                                var parentModel = widgetRef.parent;
                                if($KW.FlexUtils.isFlexContainer(parentModel)) {
                                    var listItem = module.getNodeByContext(segmentModel, rowContext);
                                    if(module.isTemplateVisible(segmentModel, listItem)) {
                                        var wNode = $KW.Utils.getWidgetNode(widgetRef, listItem);
                                        
                                        if(wNode) {
                                            var animDef = animInfo.definition;
                                            if(animDef.animate) {
                                                this.animatableNodesCounter++;
                                                var flexNode = $KW.Utils.getWidgetNode(parentModel, listItem);
                                                animDef.animate && animDef.animate(widgetRef, animInfo.config, animInfo.callbacks, {
                                                    node: wNode,
                                                    sectionIndex: secIndex,
                                                    rowIndex: rowIndex,
                                                    flexNode: flexNode,
                                                    containerModel: segmentModel,
                                                    widgetModel: widgetRef,
                                                    instance: this
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    for(var i = 0; i < rows.length; i++) {
                        var rowContext = rows[i];
                        var listItem = module.getNodeByContext(segmentModel, rowContext);
                        if(listItem && module.isTemplateVisible(segmentModel, listItem) && !listItem.getAttribute('nodeToBeRemoved')) {
                            var secIndex = rowContext.sectionIndex;
                            var rowIndex = rowContext.rowIndex;
                            var clonedTemplate = module.getClonedModel(segmentModel, rowIndex, secIndex);
                            if(!(clonedTemplate instanceof Object))
                                continue;
                            var animDef = animInfo.definition;
                            if(animDef.applyRowAnimation) {
                                this.animatableNodesCounter++;
                                listItem.firstChild.wModel = clonedTemplate;
                                listItem.firstChild.context = {
                                    sectionIndex: secIndex,
                                    rowIndex: rowIndex,
                                    containerModel: segmentModel,
                                    widgetModel: clonedTemplate,
                                    instance: this,
                                    animType: 'segmentRow'
                                };
                                animDef.applyRowAnimation(listItem.firstChild, animInfo.config, animInfo.callbacks);

                            }
                        }
                    }
                }
            }
        },

        isTemplateVisible: function(segmentModel, listItem) {
            var scrollInstance = $KG[$KW.Utils.getKMasterWidgetID(segmentModel) + "_scroller"];
            if(scrollInstance) {
                var scrollTop = Math.abs(scrollInstance.y);
                var scrollBottom = scrollTop + scrollInstance.wrapperH;
                var tempHeight = listItem.offsetHeight;
                var tempTop = listItem.offsetTop;
                var tempBottom = tempTop + tempHeight;
                if(!(scrollBottom < tempTop || scrollTop > tempBottom))
                    return true;
                else
                    return false;
            }
            return true;
        },

        getFirstVisibleRow: function(segModel) {
            var row = this.iterateSegment(segModel, {
                needTopRow: true
            });
            if(row) {
                var context = this.getContextByNode(segModel, row);
                if(context.rowIndex == -1)
                    delete context.rowIndex;
                return context;
            }
            return null;
        },

        getLastVisibleRow: function(segModel) {
            var row = this.iterateSegment(segModel, {
                needBottomRow: true
            });
            if(row) {
                var context = this.getContextByNode(segModel, row);
                if(context.rowIndex == -1)
                    delete context.rowIndex;
                return context;
            }
            return null;
        },

        iterateSegment: function(segModel, config) {
            var node = $KU.getNodeByModel(segModel);
            var data = segModel.data;
            if(!node || !data || data.length == 0 || segModel.viewtype != constants.SEGUI_VIEW_TYPE_TABLEVIEW)
                return null;

            if(segModel.hasSections) {
                var sections = node.children;
                var sec;
                for(var i = 0; i < sections.length; i++) {
                    sec = sections[i];
                    var row = this.iterateAllItems(node, sec, config);
                    if(row)
                        return row;
                }
                return sec.children[sec.children.length - 1];
            } else {
                var ul = node.childNodes[0];
                var row = this.iterateAllItems(node, ul, config);
                if(row)
                    return row;
                else
                    return ul.children[ul.children.length - 1]
            }
        },

        iterateAllItems: function(node, ul, config) {
            var scrollerIns = $KG[node.id + '_scroller'];
            var scrollTop = 0;
            var scrollBottom = 0;
            if(scrollerIns) {
                scrollTop = Math.abs(scrollerIns.y);
                scrollBottom = scrollTop + scrollerIns.wrapperH;
            } else {
                scrollTop = node.scrollTop;
                scrollBottom = scrollTop + node.offsetHeight;
            }
            var rows = ul.children;
            for(var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var rowTop = row.offsetTop;
                var rowBottom = rowTop + row.offsetHeight;
                
                if(config.needTopRow) {
                    if(scrollTop < rowBottom)
                        return row;
                }
                if(config.needBottomRow) {
                    if(scrollBottom < rowTop || scrollBottom <= rowBottom)
                        return row;
                }
            }
        },

        onRowDisplay: function(segModel) {
            var onRowDisplay = segModel.onrowdisplay;
            var listAnimation = segModel.listAnimation;
            if(!listAnimation && onRowDisplay) {
                segModel.listAnimation = new module.setAnimations(segModel);
            }
            if(listAnimation && !onRowDisplay) {
                if(!listAnimation.visibleAnimName && !listAnimation.inVisibleAnimName) {
                    listAnimation.cancelAnim();
                }
            }
        },

        getPortionNumber: function(segModel) {
            var portions = kony.segment.PORTIONS_PER_SEGMENT;
            return parseInt((portions * (segModel.contentOffsetMeasured.y)) / segModel.frame.height);
        },

        isLazyLoadingApplicable: function(segmentModel) {
            return segmentModel.autogrowMode != kony.flex.AUTOGROW_HEIGHT && segmentModel.viewtype == constants.SEGUI_VIEW_TYPE_TABLEVIEW && $KW.FlexUtils.isFlexWidget(segmentModel);
        },

        handleLazyLoadingOnScrollStart: function(segmentModel) {
            return; 
            var currentPortion = module.getPortionNumber(segmentModel);
            if(!segmentModel.currentPortion && currentPortion >= 0) {
                
                segmentModel.currentPortion = currentPortion;
            }
        },

        handleLazyLoadingOnScrollMove: function(segmentModel) {
            if(!module.isLazyLoadingApplicable(segmentModel))
                return;
            var currentPortion = module.getPortionNumber(segmentModel, 2);
            if(currentPortion > segmentModel.currentPortion) {
                
                segmentModel.currentPortion = currentPortion;
                module.renderSegmentTillGivenHeight(segmentModel, $KU.getNodeByModel(segmentModel), true, module.getHeightByNumberOfPortions(segmentModel, 1));
            }
        },

        handleLazyLoadingOnScrollEnd: function(segmentModel) {
            if(!module.isLazyLoadingApplicable(segmentModel))
                return;
            currentPortion = module.getPortionNumber(segmentModel);
            if(currentPortion > segmentModel.currentPortion) {
                
                segmentModel.currentPortion = currentPortion;
                module.renderSegmentTillGivenHeight(segmentModel, $KU.getNodeByModel(segmentModel), true, module.getHeightByNumberOfPortions(segmentModel, 3));
            }
            return true;
        },

        
        generateAndAdjustRow: function(segmentModel, segmentNode, rowIndex, secIndex) {
            var rowNode;

            var data = segmentModel.hasSections ? segmentModel.data[secIndex][1][rowIndex] : segmentModel.data[rowIndex];
            var _html = module.generateRows(segmentModel, segmentModel.context, [data], false, rowIndex, secIndex, false);
            if(!_html) {
                return 0;
            }
            var newRowHolderNode = document.createElement("div");
            newRowHolderNode.innerHTML = _html;
            var sectionNode = segmentModel.hasSections ? segmentNode.children[secIndex] : segmentNode.firstChild;
            _setModalAttributeToSegmentNodes(segmentModel, segmentNode, newRowHolderNode);
            sectionNode.appendChild(newRowHolderNode.firstChild);
            module.adjustFlexContainers(segmentModel, 'adddataat', secIndex, rowIndex);
            var clonedModel = module.getClonedModel(segmentModel, rowIndex, secIndex);
            rowNode = $KW.Segment.getNodeByContext(segmentModel, clonedModel.rowContext, clonedModel);
            rowNode && $KW.Utils.processContainerGestures(clonedModel, rowNode);

            if(segmentModel._searchCondition) {
                if(rowNode.parentNode.style.display == "none")
                    return 0;
            }

            return clonedModel.frame.height;
        },

        
        getLastRenderedRowOfSegment: function(segModel, segNode) {
            var row = {}, lastSectionIndex;
            if(segModel.hasSections) {
                if(segModel.clonedTemplates.length == 0) {
                    row = {sectionIndex: 0, rowIndex : 0};
                } else {
                    lastSectionIndex = segModel.clonedTemplates.length - 1;
                    row.sectionIndex = lastSectionIndex;
                    if(segModel.clonedTemplates[lastSectionIndex][1].length) {
                        row.rowIndex = segModel.clonedTemplates[lastSectionIndex][1].length - 1;
                    } else {
                        row.rowIndex = 0;
                    }
                }
            } else {
                if(segModel.clonedTemplates.length == 0) {
                    row = {rowIndex : 0};
                } else {
                    row.rowIndex = segModel.clonedTemplates.length - 1;
                }
            }
            return row;
        },

        
        generateAndAdjustHeader: function(segmentModel, segmentNode, secIndex) {
            if(module.isRenderedAllRows(segmentModel, -1, secIndex))
                return 0;
            var data = segmentModel.data[secIndex][0];
            var _html = module.generateRows(segmentModel, segmentModel.context, [
                [data, []]
            ], false, -1, secIndex, false);
            if(!_html) {
                return 0;
            }
            var newRowHolderNode = document.createElement("div");
            newRowHolderNode.innerHTML = _html;
            _setModalAttributeToSegmentNodes(segmentModel, segmentNode, newRowHolderNode);
            segmentNode.appendChild(newRowHolderNode.firstChild);
            secHeaderNode = segmentNode.lastChild;
            var flexNode = secHeaderNode.querySelector('div[kwidgettype="FlexContainer"]');
            if(flexNode) {
                var flexModel = module.getClonedModel(segmentModel, -1, secIndex);
                $KW.FlexContainer.forceLayout(flexModel, flexNode.parentNode);
                $KW.Utils.processContainerGestures(flexModel, flexNode);
            }

            if(segmentModel._searchCondition) {
                module.toggleHeaderVisibility(segmentModel, segmentNode.children[secIndex]);
                return 0;
            }

            return flexModel.frame.height;
        },

        
        generateAndAdjustSegmentTillContentOffSetReached: function(segmentModel, segmentNode, contentOffsetTopValue) {
            var renderedHeight = segmentNode.scrollHeight;
            var heightToBeRendered = contentOffsetTopValue + module.getHeightByNumberOfPortions(segmentModel, 3) - renderedHeight; 
            heightToBeRendered > 0 && module.renderSegmentTillGivenHeight(segmentModel, segmentNode, true, heightToBeRendered);
        },
        
        generateAndAdjustSegmentTillGivenIndexReached: function(segmentModel, segmentNode, selectedIndex) { 
            var rowIndex = selectedIndex[1];
            var sectionIndex = selectedIndex[0];
            var lastRow = module.getLastRenderedRowOfSegment(segmentModel, segmentNode);
            var renderedSpecifiedRow = false;
            if(segmentModel.hasSections) {
                if(sectionIndex < lastRow.sectionIndex || (sectionIndex == lastRow.sectionIndex && rowIndex <= lastRow.rowIndex)) {
                    renderedSpecifiedRow = true;
                }
            } else {
                if(rowIndex <= lastRow.rowIndex) {
                    renderedSpecifiedRow = true;
                }
            }
            if(renderedSpecifiedRow) {
                return;
            }
            module.renderSegmentTillGivenHeight(segmentModel, segmentNode, false);
            module.generateAndAdjustSegmentTillGivenIndexReached(segmentModel, segmentNode, selectedIndex);
        },

        thingsToDoAfterSegmentRendering: function(segModel, segNode, row, refreshScrollerInstance) {
            refreshScrollerInstance && module.refreshScrollerInstance(segModel);
            if(!segModel.hasSections) {
                module.applyRowSkin(segModel, segNode.childNodes[0], row.rowIndex);
            } else {
                module.applySectionRowSkin(segModel, segNode, row.rowIndex, row.sectionIndex);
            }
            segModel.listAnimation && segModel.listAnimation.initialized && segModel.listAnimation.syncList();

        },

        renderSegmentTillGivenHeight: function(segModel, segNode, refreshScrollerInstance, height) {
            var row = module.getLastRenderedRowOfSegment(segModel, segNode);
            
            if(module.isRenderedAllRows(segModel, row.rowIndex + 1, row.sectionIndex)) {
                return;
            }
            module.adjustFlexContainersInSegmentPage(segModel, segNode, row.rowIndex + 1, row.sectionIndex || 0, height);
            module.thingsToDoAfterSegmentRendering(segModel, segNode, row, refreshScrollerInstance);
            
            segModel.handleForceDragTimeout && clearTimeout(segModel.handleForceDragTimeout);
            segModel.handleForceDragTimeout = setTimeout(function() {
                var currentPortion = module.getPortionNumber(segModel);
                segModel.handleForceDragTimeout = null;
                if(currentPortion > segModel.currentPortion) {
                    segModel.currentPortion = currentPortion;
                    module.renderSegmentTillGivenHeight(segModel, segNode, false, height);
                }
            }, 500);
        },

        
        isRenderedAllRows: function(segModel, rowIndex, secIndex) {
            if(segModel.hasSections) {
                return segModel.data.length <= secIndex;
            } else {
                return segModel.data.length <= rowIndex;
            }
        },

        
        adjustFlexContainersInSegmentPage: function(segModel, segNode, rowIndex, secIndex, height) {
            var heightPending = height || segModel.frame.height;
            var heightSum = 0;
            var rowsData = [];
            if(segModel.hasSections)
                rowsData = segModel.data[secIndex] ? segModel.data[secIndex][1] : [];
            else
                rowsData = segModel.data;

            for(var i = rowIndex; i < rowsData.length; i++) {
                
                if(i == -1) {
                    heightSum += module.generateAndAdjustHeader(segModel, segNode, secIndex);
                } else {
                    heightSum += module.generateAndAdjustRow(segModel, segNode, i, secIndex);
                }
                if(heightSum >= heightPending) {
                    if(i === -1) {
                        module.generateAndAdjustRow(segModel, segNode, 0, secIndex);
                    }
                    break;
                }
            }

            if(segModel.hasSections && segModel._searchCondition) {
                module.toggleHeaderVisibility(segModel, segNode.children[secIndex]);
            }

            if(heightSum < heightPending && segModel.hasSections && !module.isRenderedAllRows(segModel, -1, secIndex + 1)) {
                module.adjustFlexContainersInSegmentPage(segModel, segNode, -1, secIndex + 1, heightPending - heightSum);
            }
        },

        adjustFlexContainersInSegmentAtRenderTime: function(segmentModel, segNode) {
            var row = module.getLastRenderedRowOfSegment(segmentModel, segNode);
            if(segmentModel.hasSections) {
                module.adjustFlexContainersInSegmentPage(segmentModel, segNode, -1, 0);
            } else {
                module.adjustFlexContainersInSegmentPage(segmentModel, segNode, 0, 0);
            }

            module.thingsToDoAfterSegmentRendering(segmentModel, segNode, row, false);
            module.renderSegmentTillGivenHeight(segmentModel, segNode, false, segmentModel.frame.height * 2);
            if(segmentModel.retainselection && segmentModel.selectedindex) {
                module.generateAndAdjustSegmentTillGivenIndexReached(segmentModel, segNode, segmentModel.selectedindex);
                module.renderSegmentTillGivenHeight(segmentModel, segNode, true, module.getHeightByNumberOfPortions(segmentModel, 3));
            }
            segmentModel.currentPortion = 0;
        },

        clearSearch: function(segmentModel) {
            var segNode, sectionNodes, rowNodes, secLen, rowLen, i, j;

            segmentModel._searchCondition = [];
            segmentModel._config = {};
            segNode = $KU.getNodeByModel(segmentModel);
            sectionNodes = segNode.children;
            secLen = sectionNodes.length;
            if(segmentModel.hasSections) {
                for(i = 0; i < secLen; i++) {
                    rowNodes = sectionNodes[i].childNodes;
                    rowLen = rowNodes.length;
                    for(j = 0; j < rowLen; j++) {
                        rowNodes[j].style.display = "block";
                    }
                }
            } else {
                rowNodes = sectionNodes[0].childNodes;
                rowLen = rowNodes.length;
                for(i = 0; i < rowLen; i++) {
                    rowNodes[i].style.display = "block";
                }
            }
        },

        getUpdatedSearchResults: function(segmentModel) {
            return module.getFilteredData(segmentModel);
        },

        searchText: function(searchCondition, config, segmentModel) {
            var callback = null, segNode = null, updateSegment = true, l = 0,
                filteredResult, lis = [], llen = 0;

            if(typeof config.updateSegment === 'boolean') {
                updateSegment = config.updateSegment;
            }

            if(typeof config.showSectionHeaderFooter != 'boolean') {
                config.showSectionHeaderFooter = true;
            }

            segmentModel._searchCondition = searchCondition;
            segmentModel._config = config;
            filteredResult = module.getFilteredData(segmentModel);
            if(updateSegment) {
                module.setResultOnSegmentUI(segmentModel);
            }
            return filteredResult;
        },

        getFilteredData: function(segmentModel) {
            var result = [], i = 0, j = 0, matched = false;
            var masterData = segmentModel.data;

            if(!segmentModel._searchCondition) return;

            if(segmentModel.hasSections) {
                for(i = 0; i < masterData.length; i++) {
                    for(j = 0; j < masterData[i][1].length; j++) {
                        matched = module.isRowMatchingSearchCriteria(segmentModel, masterData[i][1][j]);

                        if(matched) {
                            result.push([i, j]);
                        }

                    }
                }
            } else {
                for(i = 0; i < masterData.length; i++) {
                    matched = module.isRowMatchingSearchCriteria(segmentModel, masterData[i]);

                    if(matched) {
                        result.push([0, i]);
                    }

                }
            }

            return result;
        },

        isRowMatchingSearchCriteria : function(segmentModel, rowData) {
            var string, matched;
            var searchCondition = segmentModel._searchCondition;

            string = module.generateExpression(segmentModel, rowData, searchCondition);
            matched = eval(string);

            return matched;
        },

        generateExpression: function(segmentModel, rowData, searchCondition) {
            var string = '', i;
            var len = searchCondition.length;

            if(typeof searchCondition === 'object' && searchCondition.length == 1) {
                string += module.isOperandPassed(segmentModel, rowData, searchCondition[0]);
                return ('(' + string + ')');
            }

            for(i = 0; i < len; i++) {
                if(searchCondition[i] instanceof Array) {
                    string += module.generateExpression(segmentModel, rowData, searchCondition[i]);
                } else if(typeof searchCondition[i] === 'string') {
                    if(searchCondition[i] === constants.SEGUI_SEARCH_CRITERIA_OPERATOR_AND) {
                        operator = "&&";
                    } else {
                        operator = "||";
                    }

                    string += (' ' + operator + ' ');
                } else if(typeof searchCondition[i] === 'object' && searchCondition[i]) {
                    string += module.isOperandPassed(segmentModel, rowData, searchCondition[i]);
                }
            }
            return ('(' + string + ')');
        },

        isOperandPassed: function(segmentModel, rowData, searchCondition) {
            var caseSensitive, widgetList, caseSensitive, searchType,
                searchText, i, ilen, passed = false;

            if(typeof searchCondition.caseSensitive !== 'boolean') caseSensitive = true;
            caseSensitive = searchCondition.caseSensitive;

            if(searchCondition.searchableWidgets) {
                widgetList = searchCondition.searchableWidgets;
            } else {
                widgetList = module.getWidgetIdsFromRowData(segmentModel, rowData);
            }

            ilen = widgetList.length
            searchText = searchCondition.textToSearch;
            searchType = searchCondition.searchType ? searchCondition.searchType
                                                    : constants.SEGUI_SEARCH_CRITERIA_CONTAINS;

            for(i = 0; i < ilen; i++) {
                if(module.isOperandPassedByWidgetId(
                    segmentModel,
                    rowData,
                    widgetList[i],
                    caseSensitive,
                    searchType,
                    searchText
                )) {
                    passed = true;
                    break;
                }
            }

            return passed;
        },

        getWidgetIdsFromRowData: function(segmentModel, rowData) {
           var rowDataIds = Object.keys(rowData), r = 0,
               widgetdatamap = segmentModel.widgetdatamap,
               rlen = rowDataIds.length, widgetId = '',
               invertedDataMap = {}, widgetIds = [], rowDataId = '';

           for(widgetId in widgetdatamap) {
               if(widgetdatamap.hasOwnProperty(widgetId)) {
                   rowDataId = widgetdatamap[widgetId];
                   invertedDataMap[rowDataId] = widgetId;
               }
           }

           for(r = 0; r < rlen; r++) {
               widgetIds.push(invertedDataMap[rowDataIds[r]]);
           }

           return widgetIds;
        },

        isOperandPassedByWidgetId: function(segmentModel, rowData, widgetId, caseSensitive, searchType, searchText) {
            var passed = false, rowDataId = segmentModel.widgetdatamap[widgetId],
                info = module.infoOfSearchableWidgetInRow(
                    segmentModel, rowData, rowDataId, widgetId
                );

            if(info.isValid) {
                passed = module.matchWithConditionalOperator(
                    info.widgetType,
                    searchType,
                    searchText,
                    info.widgetText,
                    caseSensitive
                );
            }

            return passed;
        },

        infoOfSearchableWidgetInRow: function(segmentModel, rowData, rowDataId, widgetId) {
            var info = {isValid: false}, templateModel = null, widget = null, widgetData = null,
                validWidgetList = ['Button', 'Label', 'TextArea', 'TextField', 'Calendar'],
                validTextPropWidgetList = ['Button', 'Label', 'TextArea', 'TextField'];

            if(typeof rowDataId === 'string' && rowDataId
            && typeof widgetId === 'string' && widgetId
            && rowData.hasOwnProperty(rowDataId)) {
                widgetData = rowData[rowDataId];
                templateModel = rowData.template || segmentModel.rowtemplate;

                if(typeof templateModel === 'string') {
                    templateModel = _kony.mvc.initializeSubViewController(templateModel);
                }

                if(templateModel) {
                    !templateModel.pf && _konyConstNS.Form2.addHeaderorFooter.call(templateModel, templateModel);
                }

                widget = $KU.getValueFromObjectByPath(widgetId, templateModel);

                if(widget) {
                    info.widgetType = widget = widget.wType;

                    if(validWidgetList.indexOf(widget) !== -1) {
                        if(validTextPropWidgetList.indexOf(widget) !== -1) {
                            info.isValid = true;
                            info.widgetText = (typeof widgetData === 'string')
                                             ? widgetData : widgetData.text;
                        } else if(widget === 'Calendar') {
                            info.isValid = true;
                            info.widgetText = (widgetData instanceof Array)
                                             ? widgetData : widgetData.dateComponents;
                        }
                    }
                }
            }

            return info;
        },

        matchWithConditionalOperator: function(widgetType, searchType, searchText, widgetText, caseSensitive) {
            var matched = false, substring = '';

            if(!caseSensitive && typeof searchText === 'string') {
                searchText = searchText.toUpperCase();
            }

            if(!caseSensitive && typeof widgetText === 'string') {
                widgetText = widgetText.toUpperCase();
            }

            switch(searchType) {
                case constants.SEGUI_SEARCH_CRITERIA_CONTAINS :
                    if(typeof widgetText === 'string'
                    && widgetText.indexOf(searchText) !== -1) {
                        matched = true;
                    }
                break;

                case constants.SEGUI_SEARCH_CRITERIA_ENDSWITH :
                    substring = typeof widgetText === 'string'
                              ? widgetText.substr(-searchText.length) : null;

                    if(searchText === substring) {
                        matched = true;
                    }
                break;

                case constants.SEGUI_SEARCH_CRITERIA_STARTSWITH :
                    substring = typeof widgetText === 'string'
                              ? widgetText.substr(0, searchText.length) : null;

                    if(searchText === substring) {
                        matched = true;
                    }
                break;

                case constants.SEGUI_SEARCH_CRITERIA_GREATER :
                    if(widgetType === 'Calendar' && searchText instanceof Array) {
                        widgetText = module.convertDateToNumber(widgetText);
                        searchText = module.convertDateToNumber(searchText);

                        if(typeof widgetText === 'number' && typeof searchText === 'number') {
                            matched = (widgetText > searchText) ? true : false;
                        }
                    } else {
                        widgetText = module.convertStringToNumber(widgetText);
                        searchText = module.convertStringToNumber(searchText);

                        if(typeof widgetText === 'number' && typeof searchText === 'number') {
                            matched = (widgetText > searchText) ? true : false;
                        }
                    }
                break;

                case constants.SEGUI_SEARCH_CRITERIA_GREATER_EQUAL :
                    if(widgetType === 'Calendar' && searchText instanceof Array) {
                        widgetText = module.convertDateToNumber(widgetText);
                        searchText = module.convertDateToNumber(searchText);

                        if(typeof widgetText === 'number' && typeof searchText === 'number') {
                            matched = (widgetText >= searchText) ? true : false;
                        }
                    } else {
                        widgetText = module.convertStringToNumber(widgetText);
                        searchText = module.convertStringToNumber(searchText);

                        if(typeof widgetText === 'number' && typeof searchText === 'number') {
                            matched = (widgetText >= searchText) ? true : false;
                        }
                    }
                break;

                case constants.SEGUI_SEARCH_CRITERIA_LESSER :
                    if(widgetType === 'Calendar' && searchText instanceof Array) {
                        widgetText = module.convertDateToNumber(widgetText);
                        searchText = module.convertDateToNumber(searchText);

                        if(typeof widgetText === 'number' && typeof searchText === 'number') {
                            matched = (widgetText < searchText) ? true : false;
                        }
                    } else {
                        widgetText = module.convertStringToNumber(widgetText);
                        searchText = module.convertStringToNumber(searchText);

                        if(typeof widgetText === 'number' && typeof searchText === 'number') {
                            matched = (widgetText < searchText) ? true : false;
                        }
                    }
                break;

                case constants.SEGUI_SEARCH_CRITERIA_LESSER_EQUAL :
                    if(widgetType === 'Calendar' && searchText instanceof Array) {
                        widgetText = module.convertDateToNumber(widgetText);
                        searchText = module.convertDateToNumber(searchText);

                        if(typeof widgetText === 'number' && typeof searchText === 'number') {
                            matched = (widgetText <= searchText) ? true : false;
                        } else matched = true;
                    } else {
                        widgetText = module.convertStringToNumber(widgetText);
                        searchText = module.convertStringToNumber(searchText);

                        if(typeof widgetText === 'number' && typeof searchText === 'number') {
                            matched = (widgetText <= searchText) ? true : false;
                        }
                    }
                break;

                case constants.SEGUI_SEARCH_CRITERIA_STRICT_EQUAL :
                    if(widgetType === 'Calendar' && searchText instanceof Array) {
                        widgetText = module.convertDateToNumber(widgetText);
                        searchText = module.convertDateToNumber(searchText);

                        if(typeof widgetText === 'number' && typeof searchText === 'number') {
                            matched = (widgetText === searchText) ? true : false;
                        } else matched = true;
                    } else {
                        widgetText = module.convertStringToNumber(widgetText);
                        searchText = module.convertStringToNumber(searchText);

                        matched = (widgetText === searchText) ? true : false;
                    }
                break;

                case constants.SEGUI_SEARCH_CRITERIA_NOT_EQUAL :
                    if(widgetType === 'Calendar' && searchText instanceof Array) {
                        widgetText = module.convertDateToNumber(widgetText);
                        searchText = module.convertDateToNumber(searchText);

                        if(typeof widgetText === 'number' && typeof searchText === 'number') {
                            matched = (widgetText === searchText) ? true : false;
                        } else matched = true;
                    } else {
                        widgetText = module.convertStringToNumber(widgetText);
                        searchText = module.convertStringToNumber(searchText);

                        matched = (widgetText !== searchText) ? true : false;
                    }
                break;

                case constants.SEGUI_SEARCH_CRITERIA_NOT_CONTAINS :
                    if(typeof widgetText === 'string'
                    && widgetText.indexOf(searchText) === -1) {
                        matched = true;
                    }
                break;

                case constants.SEGUI_SEARCH_CRITERIA_NOT_ENDSWITH :
                    substring = typeof widgetText === 'string' ?
                                widgetText.substr(-searchText.length) : null;

                    if(searchText !== substring) {
                        matched = true;
                    }
                break;

                case constants.SEGUI_SEARCH_CRITERIA_NOT_STARTSWITH :
                    substring = typeof widgetText === 'string' ?
                                widgetText.substr(searchText.length) : null;

                    if(searchText !== substring) {
                        matched = true;
                    }
                break;
            }

            return matched;
        },

        convertStringToNumber: function(widgetData){
            var regx = new RegExp(/^\s*((\d+(\.\d+)?)|(\.\d+))\s*$/);

            if(regx.test(widgetData)) {
                widgetData = parseFloat(widgetData);
            }

            return widgetData;
        },

        convertDateToNumber: function(dc) {
            var dateNumber, valid = false;

            var isLeapYear = function(year) {
                var date = new Date(year, 1, 29, 0, 0, 0);
                return (date.getMonth() === 2) ? false : true;
            };

            var isValidDate = function(date, month, year) {
                if([1, 3, 5, 7, 8, 10, 12].indexOf(month) != -1
                && date >= 1 && date <= 31) {
                    return true;
                } else if([4, 6, 9, 11].indexOf(month) != -1
                && date >= 1 && date <= 30) {
                    return true;
                } else if(month === 2 && date >= 1) {
                    if(isLeapYear(year)) {
                        if(date <= 29) return true;
                    } else {
                        if(date <= 28) return true;
                    }
                } else {
                    return false;
                }
            };

            if($KU.isArray(dc) && [0, 3, 6].indexOf(dc.length) >= 0) {
                if(dc.length === 0) {
                    return 0;
                }

                
                if(typeof dc[2] === 'number' && dc[2] >= 1900 && dc[2] <= 2099
                && typeof dc[1] === 'number' && dc[1] >= 1 && dc[1] <= 12
                && isValidDate(dc[0], dc[1], dc[2])) {
                    valid = true;
                    dateNumber = new Date(dc[2], dc[1], dc[0]).getTime();
                } else return null;

                if(valid && dc.length === 6
                && typeof dc[3] === 'number' && dc[3] >= 0 && dc[3] <= 23
                && typeof dc[4] === 'number' && dc[4] >= 0 && dc[4] <= 59
                && typeof dc[5] === 'number' && dc[5] >= 0 && dc[5] <= 59) {
                    dateNumber = new Date(dc[2], dc[1], dc[0], dc[3], dc[4], dc[5]).getTime();
                }
            } else if(dc === null) {
                return 0;
            } else return null;

            return dateNumber;
        },

        setResultOnSegmentUI: function(segmentModel) {
            module.setFilterResultOnRenderedData(segmentModel);
            if(segmentModel.hasSections) module.setResultOnSegmentHeader(segmentModel);
            module.renderSegmentTillGivenHeight(segmentModel, $KU.getNodeByModel(segmentModel), true, module.getHeightByNumberOfPortions(segmentModel, 4));
        },

        setFilterResultOnRenderedData: function(segmentModel, segmentNode) {
            var segNode, visibility, secLen, rowLen, i, j;
            var sectionNodes, rowNodes, rowIndex;

            segNode = segmentNode || $KU.getNodeByModel(segmentModel);
            sectionNodes = segNode.children;
            secLen = sectionNodes.length;

            if(segmentModel.hasSections) {
                for(i = 0; i < secLen; i++) {
                    rowNodes = sectionNodes[i].childNodes;
                    rowLen = rowNodes.length;
                    for(j = 0; j < rowLen; j++) {
                        if(!rowNodes[j+1]) break;
                        rowIndex = rowNodes[j+1].getAttribute("index");
                        rowIndex = parseInt(rowIndex);
                        visibility = module.isRowVisible(segmentModel, rowNodes[j+1], rowIndex, i);
                    }
                }
            } else {
                rowNodes = sectionNodes[0].childNodes;
                rowLen = rowNodes.length;
                for(i = 0; i < rowLen; i++) {
                    rowIndex = rowNodes[i].getAttribute("index");
                    rowIndex = parseInt(rowIndex);
                    visibility = module.isRowVisible(segmentModel, rowNodes[i], rowIndex, 0);
                }
            }

        },

        isRowVisible: function (segmentModel, rowNode, rowIndex, sectionIndex) {
            var rowData = {};
            var matched = false;

            if(segmentModel.hasSections) rowData = segmentModel.data[sectionIndex][1][rowIndex];
            else rowData = segmentModel.data[rowIndex];

            matched = module.isRowMatchingSearchCriteria(segmentModel, rowData);

            if(matched) {
                rowNode.style.display = "block";
                return true;
            } else {
                rowNode.style.display = "none";
                return false;
            }

        },

        setResultOnSegmentHeader: function(segmentModel) {
            var segNode, sectionNodes, secLen, i;

            segNode = $KU.getNodeByModel(segmentModel);
            sectionNodes = segNode.children;
            secLen = sectionNodes.length;

            for(i = 0; i < secLen; i++) {
                module.toggleHeaderVisibility(segmentModel, sectionNodes[i]);
            }

        },

        toggleHeaderVisibility: function(segmentModel, sectionNode) {
            var headerNode, rowNodes;

            headerNode = sectionNode.childNodes[0];
            headerNode.style.display = "none";

            if(segmentModel._config.showSectionHeaderFooter) {
                rowNodes = sectionNode.querySelector(
                    'li:not([style*="display:none"]):not([style*="display: none"])'
                );
                if(rowNodes) headerNode.style.display = "block";
            }

        },

    
    onHeightChangedToPreferredFromFixed: function(segmentModel, segNode) {
        var lastRowIndex = [],
            lastSectionIndex;
        segmentModel.previousHeight = undefined;
        if(segmentModel.hasSections) {
            lastSectionIndex = segmentModel.data.length - 1;
            lastRowIndex[0] = lastSectionIndex;
            lastRowIndex[1] = segmentModel.data[lastSectionIndex][1].length - 1;
        } else {
            lastRowIndex[0] = 0;
            lastRowIndex[1] = segmentModel.data.length - 1;
        }
        module.generateAndAdjustSegmentTillGivenIndexReached(segmentModel, segNode, lastRowIndex);
    },

    getHeightByNumberOfPortions: function(segmentModel, numberOfPortions) {
        var portionSize = segmentModel.frame.height / kony.segment.PORTIONS_PER_SEGMENT;
        return portionSize * numberOfPortions;
    },

    isSegmentVisible: function(segmentModel) {
        var pModel = null;
        if(!segmentModel.isvisible) {
            return false;
        }
        pModel = segmentModel.parent;
        while(pModel) {
            if (!pModel.isvisible) {
                return false;
            }
            pModel = pModel.parent;
        }
        return true;
    },
    
    isRenderRequired: function(segModel, segNode, action, row) {
        var lastRow = module.getLastRenderedRowOfSegment(segModel, segNode);
        var rowIndexCheckNeeded = false, sectionIndexCheckNeeded = false;
        var rowContext;
        var _getRowContextToCompare = function() {
            var results = {};
            if(['setdataat', 'setsectionat', 'removeat', 'removesectionat'].indexOf(action) != -1){
                return lastRow;
            }
            if(segModel.hasSections) {
                
                if(sectionIndexCheckNeeded && segModel.data[lastRow.sectionIndex][1].length == lastRow.rowIndex + 1) {
                    results.sectionIndex = lastRow.sectionIndex + 1;
                    results.rowIndex = 0;
                } else {
                    results.sectionIndex = lastRow.sectionIndex;
                    results.rowIndex = lastRow.rowIndex + 1;
                }

            } else {
                results.rowIndex = lastRow.rowIndex + 1;
            }
            return results;
        };
        if(['setdataat', 'removeat', 'addat', 'adddataat', 'addall'].indexOf(action) != -1) {
            rowIndexCheckNeeded = true;
        }
        if(['setsectionat', 'removesectionat', 'addsectionat', 'addall'].indexOf(action)!= -1) {
            sectionIndexCheckNeeded = true;
        }
        rowContext = _getRowContextToCompare();
        if(segModel.hasSections) {
            if(sectionIndexCheckNeeded) {
                if(row.sectionIndex > rowContext.sectionIndex) return false;
            } else {
                if(row.sectionIndex > rowContext.sectionIndex
                || (row.sectionIndex == lastRow.sectionIndex && row.rowIndex > rowContext.rowIndex)) {
                    return false;
                }
            }
        } else {
            if(rowIndexCheckNeeded && row.rowIndex > rowContext.rowIndex) return false;
        }
       
        if(['setdataat','setsectionat','removeat', 'removesectionat'].indexOf(action) != -1) {
            segModel.currentPortion =  module.getPortionNumber(segModel);
            module.renderSegmentTillGivenHeight(segModel, segNode, true, module.getHeightByNumberOfPortions(segModel, 4));
        }
        return true;
    },
    
    updateScrollTopOnScroll: function(segModel) {
        segModel.__y = segModel.contentOffsetMeasured.y;
    },

    registerSwipeGesture: function(widgetModel, widgetNode) {
        this.translateX = 0;
        this.transformProperty = kony.ui.makeAffineTransform();
        this.containerModel = widgetModel.containerId && $KW.Utils.getContainerModelById(widgetNode, widgetModel.containerId);
        this.useTranslate = widgetModel.widgetswipemove.translate;
        if(typeof widgetModel.widgetswipemove.minDeltaToInitiateSwipe === "undefined") {
            this.minDeltaToInitiateSwipe = 30;
        } else {
            this.minDeltaToInitiateSwipe = this.getValue(widgetModel, widgetModel.widgetswipemove.minDeltaToInitiateSwipe);
        }
        this.boundaryMin = this.getValue(widgetModel, widgetModel.widgetswipemove.Xboundaries[0]);
        this.boundaryMax = this.getValue(widgetModel, widgetModel.widgetswipemove.Xboundaries[1]);
    },

    resetSwipe: function(segmentModel, rowContext) {
        var _resetTranslateX = function(widgetModel, widgetNode) {
            var transformProperty = kony.ui.makeAffineTransform();
            var style, panInstance = widgetModel.swipeConfig;
            if(!panInstance) return;
            transformProperty.translate(0, 0);
            style = $KW.animUtils.applyTransform(widgetModel, transformProperty);
            widgetNode.style["transition"] = "transform 0.5s";
            widgetNode.style[vendor + "Transform"] = style;
            widgetNode.style["transform"] = style;
            panInstance.translateX = 0;
            panInstance.useTranslate = widgetModel.widgetswipemove.translate;
            panInstance.boundaryMin = panInstance.getValue(widgetModel, widgetModel.widgetswipemove.Xboundaries[0]);
            panInstance.boundaryMax = panInstance.getValue(widgetModel, widgetModel.widgetswipemove.Xboundaries[1]);
        };
        var _resetSwipeOnModel = function(wModel, wNode) {
            var i, widgets, childModel, childNode;
            if(wModel.widgetswipemove) {
                _resetTranslateX(wModel, wNode);
            }
            if($KW.FlexUtils.isFlexContainer(wModel)) {
                widgets = wModel.widgets();
                for(i = 0; i < widgets.length; i++) {
                    childModel = $KW.Utils.getActualWidgetModel(widgets[i]);
                    childNode = $KW.Utils.getWidgetNode(childModel, wNode);
                    childNode && _resetSwipeOnModel(childModel, childNode);
                }
            }
        };
        var rowModel, rowNode;
        if(segmentModel.clonedTemplates && segmentModel.clonedTemplates.length) {
            if(!segmentModel.hasSections || (segmentModel.hasSections && segmentModel.clonedTemplates.length >= rowContext.secIndex)) {
                rowModel = module.getClonedModel(segmentModel, rowContext.rowIndex, rowContext.secIndex);
                rowNode = module.getNodeByContext(segmentModel, rowContext);
                rowNode && _resetSwipeOnModel(rowModel, rowNode);
            }
        }
    },

    resetSwipeMoveConfigOnTouchStart: function(widgetNode) {
        var _compareRowContexts = function(rowContext1, rowContext2) {
            if(rowContext1 && rowContext2) {
                if((rowContext1.sectionIndex === rowContext2.sectionIndex)
                && (rowContext1.rowIndex === rowContext2.rowIndex)) {
                    return true;
                }
            }
            return false;
        };
        var containerId = widgetNode && widgetNode.getAttribute("kcontainerID");
        var segmentModel = $KW.Utils.getContainerModelById(widgetNode, containerId);
        var context = module.getContextByNode(segmentModel, widgetNode);
        if(segmentModel.swipeSelectedConfig) {
             var currentRowContext = {
                'rowIndex': context.rowIndex,
                'sectionIndex': context.sectionIndex || 0
             }
            if(!_compareRowContexts(currentRowContext, segmentModel.swipeSelectedConfig.rowContext)) {
                module.resetSwipe(segmentModel, segmentModel.swipeSelectedConfig.rowContext);
                segmentModel.swipeSelectedConfig = null;
            }
        }
    }
};

    module.setAnimations = function(segModel, animInfo) {
        this.widgetModel = segModel;
        if(animInfo) {
            var visibleAnim = animInfo.visible;
            if(visibleAnim) {
                var animDef = visibleAnim.definition;
                if(animDef && animDef.getAnimationName) {
                    this.visibleAnimName = animDef.getAnimationName(visibleAnim.config, 'visible');
                }
            }
            var inVisibleAnim = animInfo.invisible;
            if(inVisibleAnim) {
                var animDef = inVisibleAnim.definition;
                if(animDef && animDef.getAnimationName) {
                    this.inVisibleAnimName = animDef.getAnimationName(inVisibleAnim.config, 'invisible');
                }
            }
        }
        this.animInfo = animInfo;
        this.initialized = false;
        this.init();
    };

    module.setAnimations.prototype = {
        init: function() {
            var wModel = this.widgetModel;
            var node = $KU.getNodeByModel(wModel);
            if(!node)
                return;
            this.node = node;
            if(this.visibleAnimName || this.inVisibleAnimName || wModel.onrowdisplay) {
                this.syncList();
                this.animateList(true);
                this.startAnim();
                this.initialized = true;
            }
        },

        startAnim: function() {
            var that = this;
            (function animate() {
                that.animateList();
                that.animCallback = nextFrame(animate);
            })();
        },

        destroy: function() {
            this.initialized = false;
            this.cancelAnim();
        },

        cancelAnim: function() {
            cancelFrame(this.animCallback);
        },

        syncList: function() {
            var wModel = this.widgetModel;
            this.items = [];
            var data = wModel.data;
            if(!data || data.length == 0)
                return;

            if(wModel.hasSections) {
                var sections = this.node.children;
                for(var i = 0; i < sections.length; i++) {
                    var sec = sections[i];
                    var rows = sec.children;
                    this.saveContext(wModel, rows);
                    for(var j = 0; j < rows.length; j++)
                        this.items.push(rows[j]);
                }
            } else {
                var rows = this.node.children[0].children;
                this.saveContext(wModel, rows);
                this.items = rows;
            }

            this.scrollTop = 0;
            this.scrollBottom = 0;
            var scrollerIns = $KG[$KW.Utils.getKMasterWidgetID(wModel) + '_scroller'];
            if(scrollerIns) {
                this.scrollTop = Math.abs(scrollerIns.y);
                this.scrollBottom = this.scrollTop + scrollerIns.wrapperH;
            } else {
                this.scrollTop = this.node.scrollTop;
                this.scrollBottom = this.scrollTop + this.node.offsetHeight;
            }

            var item;
            
            for(var i = 0, len = this.items.length; i < len; i++) {
                item = this.items[i];
                item._offsetHeight = item.offsetHeight;
                item._offsetTop = item.offsetTop;
                item._offsetBottom = item._offsetTop + item._offsetHeight;

                
                if(item._offsetBottom < this.scrollTop) {
                    item._state = 'past';
                }
                
                else if(item._offsetTop > this.scrollBottom) {
                    item._state = 'future';
                }
                
                else {
                    item._state = '';
                }
            }
        },

        saveContext: function(wModel, rows) {
            for(var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var rowContext = module.getContextByNode(wModel, row);
                var rowIndex = rowContext.rowIndex;
                var secIndex = rowContext.sectionIndex;
                var clonedTemplate = module.getClonedModel(wModel, rowIndex, secIndex);
                row.itemContext = {
                    sectionIndex: secIndex,
                    rowIndex: rowIndex,
                    containerModel: wModel,
                    widgetModel: clonedTemplate,
                    animType: 'segmentRow'
                };
                if(clonedTemplate instanceof Object) {
                    row.wModel = clonedTemplate;
                    var visibleInfo = this.animInfo;
                    if(this.visibleAnimName) {
                        var animInfo = visibleInfo.visible;
                        var animDef = animInfo.definition;
                        row.wModel.originalFrames = animDef.animationDef;
                        animDef.saveWidgetState(row.wModel, row, animInfo.config, 'segmentRow');
                    }
                }
            }
        },

        animateList: function(force) {
            var wModel = this.widgetModel;
            this.scrollTop = 0;
            this.scrollBottom = 0;
            var scrollerIns = $KG[$KW.Utils.getKMasterWidgetID(wModel) + '_scroller'];
            if(scrollerIns) {
                this.scrollTop = Math.abs(scrollerIns.y);
                this.scrollBottom = this.scrollTop + scrollerIns.wrapperH;
                var maxScrollY = Math.abs(scrollerIns.maxScrollY);
                
                if(this.scrollTop >= maxScrollY || scrollerIns.y > 0)
                    return;
            } else {
                this.scrollTop = this.node.scrollTop;
                this.scrollBottom = this.scrollTop + this.node.offsetHeight;
            }

            if(this.scrollTop !== this.lastTop || force) {
                this.lastTop = this.scrollTop;
                var visible = this.visibleAnimName;
                var inVisible = this.inVisibleAnimName;
                var animInfo = this.animInfo;

                
                for(var i = 0, len = this.items.length; i < len; i++) {
                    var item = this.items[i];

                    
                    if(item._offsetBottom < this.scrollTop) {
                        item._state = 'past';
                    }
                    
                    else if(item._offsetTop > this.scrollBottom) {
                        item._state = 'future';
                    }
                    
                    else {
                        
                        if(item._state) {
                            if(wModel.onrowdisplay) {
                                if(this.initialized) {
                                    if(item._state == 'future') {
                                        var startRow = this.getFirstVisibleRowByIndex(i);
                                        this.executeRowDisplay(item, kony.segment.VISIBLE, startRow, item);
                                        this.executeRowDisplay(startRow, kony.segment.INVISIBLE, startRow, item);
                                    }
                                    if(item._state == 'past') {
                                        var endRow = this.getBottomVisibleRowByIndex(i);
                                        this.executeRowDisplay(item, kony.segment.VISIBLE, item, endRow);
                                        this.executeRowDisplay(endRow, kony.segment.INVISIBLE, item, endRow);
                                    }
                                }
                            } else if(visible) {
                                this.applyItemAnimation(item, animInfo.visible, visible);
                            }
                            item._state = '';
                        }
                    }
                }
            }
        },

        applyItemAnimation: function(item, animInfo, animName) {
            var animDef = animInfo.definition;
            var animKey = $KU.animation;
            animDef.getAnimConfig(animInfo.config, item);
            item.context = item.itemContext;
            
            item.style[animKey] = animName;
            animDef.registerAnimCallbacks(item, animInfo.callbacks);
        },

        executeRowDisplay: function(item, state, startRow, endRow) {
            var wModel = this.widgetModel;
            var startContext = {};
            var endContext = {};
            var itemContext = item.itemContext;
            var context = {
                sectionIndex: itemContext.sectionIndex,
                rowIndex: itemContext.rowIndex
            };
            if(startRow) {
                var startRowContext = startRow.itemContext;
                startContext = {
                    sectionIndex: startRowContext.sectionIndex,
                    rowIndex: startRowContext.rowIndex
                };
            }
            if(endRow) {
                var endRowContext = endRow.itemContext;
                endContext = {
                    sectionIndex: endRowContext.sectionIndex,
                    rowIndex: endRowContext.rowIndex
                };
            }
            wModel.onrowdisplay.call(wModel, wModel, state, context, startContext, endContext);
        },

        
        onRowDisplayHandler: function(eventInfo) {
            if(!eventInfo)
                return;
            var action = eventInfo.action;
            var newItems = eventInfo.newItems;
            var rowIndex = eventInfo.rowIndex;
            var secIndex = eventInfo.sectionIndex;
            var wModel = this.widgetModel;
            var node = this.node;
            var state = '';
            if(action == 'setdata' || action == 'setsectionat' || action == 'setdataat') {
                state = kony.segment.UPDATE;
            } else if(action == 'addall' || action == 'addsectionat' || action == 'adddataat') {
                state = kony.segment.ADD;
            } else {
                state = kony.segment.REMOVE;
            }
            switch(action) {
                case "setdata":
                case "addall":
                case "addsectionat":
                case "setsectionat":
                    
                    if(action == 'removeall')
                        newItems = wModel.hasSections ? this.node.childNodes.length : this.node.childNodes[0].childNodes.length;
                    if(wModel.hasSections) {
                        if(action == 'setsectionat' || action == 'removesectionat')
                            newItems = 1;
                        this.onRowDisplayForSections(state, secIndex, newItems);
                    } else {
                        var ul = node.childNodes[0];
                        this.onRowDisplayForRows(state, ul, rowIndex, newItems);
                    }
                    break;
                case "adddataat":
                case "setdataat":
                    
                    newItems = 1;
                    var wrapper = wModel.hasSections ? node.childNodes[secIndex] : node.childNodes[0];
                    this.onRowDisplayForRows(state, wrapper, rowIndex, newItems);
                    break;
            }
        },

        onRowDisplayForSections: function(state, secIndex, newItems) {
            var tempSecIndex = secIndex;
            for(var i = 0; i < newItems; i++) {
                var sec = this.node.childNodes[tempSecIndex];
                sec && this.onRowDisplayForRows(state, sec);
                tempSecIndex++;
            }
        },

        
        onRowDisplayForRows: function(state, wrapperNode, startIndex, noOfItems) {
            var wModel = this.widgetModel;
            var rows = wrapperNode.childNodes;
            if(!rows)
                return;
            var len = (typeof noOfItems != "undefined") ? noOfItems : rows.length;
            
            startIndex = (typeof startIndex != "undefined") ? (wModel.hasSections ? startIndex + 1 : startIndex) : 0;
            var item;
            for(var i = 0; i < len; i++) {
                item = rows[startIndex];
                if(module.isTemplateVisible(wModel, item)) {
                    var startRow = this.getFirstVisibleRowByIndex(len);
                    var endRow = this.getBottomVisibleRowByIndex(0);
                    this.executeRowDisplay(item, state, startRow, endRow);
                }
                startIndex++;
            }
        },

        getFirstVisibleRowByIndex: function(index) {
            for(var i = 0; i < index; i++) {
                var item = this.items[i];
                if(this.scrollTop <= item._offsetBottom)
                    return item;
            }
        },

        getBottomVisibleRowByIndex: function(index) {
            var len = this.items.length;
            for(var i = index; i < len; i++) {
                var item = this.items[i];
                if(this.scrollBottom <= item._offsetBottom)
                    return item;
            }
            return this.items[len - 1]; 
        }
    };

    module.applyRowsAnimationByAPI = function(segModel, action, listItems, rowIndex, secIndex, animObj) {
        if(!animObj || !animObj.definition || !animObj.definition.applyRowAnimation)
            return;

        var animDef = animObj.definition;
        this.action = action;
        this.wModel = segModel;
        this.animObj = animObj;

        switch(action) {
            case "adddataat":
            case "addat":
            case "setdataat":
            case "removeat":
                var row = listItems.firstChild;
                var clonedTemplate = module.getClonedModel(segModel, rowIndex, secIndex);
                if(!(clonedTemplate instanceof Object))
                    return;
                row.wModel = clonedTemplate;
                row.context = {
                    sectionIndex: secIndex,
                    rowIndex: rowIndex,
                    containerModel: segModel,
                    widgetModel: clonedTemplate,
                    instance: this,
                    animType: 'segmentRow'
                };
                animDef.applyRowAnimation(row, animObj.config, animObj.callbacks);
                break;

            case "addall":
                if(segModel.hasSections) {
                    this.animateSections(listItems, secIndex);
                } else
                    this.animateRows(listItems, rowIndex, secIndex);
                break;

            case "removeall":
            case "setdata":
                if(action == 'setdata') {
                    var segNode = $KU.getNodeByModel(segModel);
                    if(segModel.hasSections === false || segModel.viewtype === constants.SEGUI_VIEW_TYPE_PAGEVIEW)
                        segNode = segNode.childNodes[0];
                } else
                    var segNode = listItems;

                if(segModel.hasSections) {
                    this.animateSections(segNode.childNodes, 0);
                } else {
                    var rows = segNode.childNodes;
                    this.animateRows(rows, 0);
                }
                break;

            case "setsectionat":
            case "removesectionat":
                this.animateSections([listItems], secIndex);
                break;

            case "addsectionat":
                this.animateSections(listItems, secIndex);
                break;

        }
    };

    module.applyRowsAnimationByAPI.prototype = {
        animateSections: function(secs, secIndex) {
            for(var i = 0; i < secs.length; i++) {
                var sec = secs[i];
                var rows = sec.childNodes;
                
                this.animateRows([rows[0]], -1, secIndex);
                this.animateRows(rows, 0, secIndex, 1);
                secIndex++;
            }
        },

        animateRows: function(rows, rowIndex, secIndex, startIndex) {
            startIndex = startIndex || 0;
            var rowIndex = rowIndex;
            var secIndex = secIndex;
            var animObj = this.animObj;
            var animDef = animObj.definition;
            for(var i = startIndex; i < rows.length; i++) {
                var row = rows[i].firstChild;
                var clonedTemplate = module.getClonedModel(this.wModel, rowIndex, secIndex);
                if(!(clonedTemplate instanceof Object))
                    return;

                row.wModel = clonedTemplate;
                row.context = {
                    sectionIndex: secIndex,
                    rowIndex: rowIndex,
                    containerModel: this.wModel,
                    widgetModel: clonedTemplate,
                    instance: this,
                    animType: 'segmentRow'
                };
                animDef.applyRowAnimation(row, animObj.config, animObj.callbacks);
                rowIndex++;
            }
        },

        onAnimationEnd: function(row) {
            var segModel = this.wModel;
            var segNode = $KU.getNodeByModel(segModel);
            if(!segNode)
                return;

            if(this.action == 'removeall') {
                if(segModel.hasSections === false || segModel.viewtype === constants.SEGUI_VIEW_TYPE_PAGEVIEW)
                    segNode = segNode.childNodes[0];
                segNode.innerHTML = '';
            }

            if(this.action == 'removeat') {
                var context = module.getContextByNode(segModel, row);
                var secIndex = context.sectionIndex;
                var rowIndex = context.rowIndex;

                
                if(segModel.hasSections) {
                    var secNode = segNode.childNodes[secIndex];
                    secNode.removeChild(secNode.childNodes[rowIndex + 1]);
                    segModel.clonedTemplates[secIndex][1].splice(rowIndex, 1);
                } else {
                    var wrapperNode = segNode.childNodes[0];
                    wrapperNode.removeChild(wrapperNode.childNodes[rowIndex]);
                    segModel.clonedTemplates.splice(rowIndex, 1);
                }
            }

            if(this.action == "removesectionat") {
                var context = module.getContextByNode(segModel, row);
                var secIndex = context.sectionIndex;
                var secNode = segNode.childNodes[secIndex];
                if(!secNode || !(row.parentNode && row.parentNode.parentNode))
                    return;
                segNode.removeChild(secNode);
                segModel.clonedTemplates.splice(secIndex, 1);
            }

            if(this.action == 'removeall' || this.action == 'removeat' || this.action == 'removesectionat') {
                if(this.action != 'removeall') {
                    if(segModel.hasSections) {
                        module.adjustSectionIndex(segNode);
                        module.applySectionRowSkin(segModel, segNode);

                    } else {
                        var wrapper = segNode.childNodes[0];
                        $KU.adjustNodeIndex(wrapper, 0, "index");
                        module.applyRowSkin(segModel, wrapper);
                    }
                }
                var listAnimation = segModel.listAnimation;
                listAnimation && listAnimation.syncList();
            }
        }
    };
    module.registerSwipeGesture.prototype = {
        resetTransition: function(widgetNode) {
            widgetNode.parentNode.style.removeProperty('transition');
        },
        applyTransform: function(widgetModel, widgetNode, value, animate) {
            var style;
            this.transformProperty.translate(value, 0);
            style = $KW.animUtils.applyTransform(widgetModel, this.transformProperty);
            console.log('translating ', style);
            if(animate) widgetNode.parentNode.style["transition"] = "transform 0.5s";
            widgetNode.parentNode.style[vendor + "Transform"] = style;
            widgetNode.parentNode.style["transform"] = style;
        },
        getDirection: function(currentPosition) {
            if(this.startPosition > currentPosition)
                return 'RTL';
            return 'LTR';
        },
        getValue: function(widgetModel, value) {
            var valueObj = {}, valueInPx;
            valueObj = $KW.FlexUtils.getValueAndUnit(widgetModel, value);
            valueInPx = $KW.FlexUtils.getValueByParentFrame(widgetModel, valueObj, 'x');
            return valueInPx;
        },
        enforceTranslateValue: function(value, minValue, maxValue) {
            if(value < minValue)
                value = minValue;
            if(value > maxValue)
                value = maxValue;
            return value;
        },
        getResultFromConfig: function(widgetModel, direction, translateXValue, config) {
            var result = null;
            var configs, start, end;
            configs = (direction === 'RTL' ? config.swipeLeft : config.swipeRight);
            configs = configs || [];
            for(i = 0; i < configs.length; i++) {
                start = this.getValue(widgetModel, configs[i].translateRange[0]);
                end = this.getValue(widgetModel, configs[i].translateRange[1]);
                if(start < translateXValue && translateXValue < end) {
                    result = configs[i];
                    break;
                }
            }
            return result;
        },
        compareRowContexts: function(rowContext1, rowContext2) {
            if(rowContext1 && rowContext2) {
                if((rowContext1.sectionIndex === rowContext2.sectionIndex)
                && (rowContext1.rowIndex === rowContext2.rowIndex)) {
                    return true;
                }
            }
            return false;
        },
        resetSwipeCofigIfNeeded: function(widgetModel) {
            if(!this.compareRowContexts(widgetModel.rowContext, this.containerModel.swipeSelectedConfig.rowContext)) {
                $KW.Segment.resetSwipe(this.containerModel, this.containerModel.swipeSelectedConfig.rowContext);
            }
        },
        gestureStart: function(widgetModel, context) {
            this.startPosition = context.x1;
            this.resetTransition(context.widgetNode);
            this.containerModel && this.containerModel.swipeSelectedConfig && this.resetSwipeCofigIfNeeded(widgetModel);
            if(this.containerModel) {
                this.containerModel.swipeSelectedConfig = {rowContext: widgetModel.rowContext};
            }
        },
        gestureMove: function(widgetModel, context) {
            var direction, panDistance;

            if(Math.abs(context.x2 - this.startPosition) <= this.minDeltaToInitiateSwipe) {
                return;
            }
            direction = this.getDirection(context.x2);
            panDistance = this.translateX + context.x2 - this.startPosition;
            panDistance = this.enforceTranslateValue(panDistance, this.boundaryMin, this.boundaryMax);
            if(this.useTranslate) {
                this.applyTransform(widgetModel, context.widgetNode, panDistance);
            }
        },
        gestureEnd: function(widgetModel, context) {
            var callbackContext = {}, matchedConfig, direction, panDistance;

            if(Math.abs(context.x2 - this.startPosition) <= this.minDeltaToInitiateSwipe) {
                return;
            }
            direction = this.getDirection(context.x2);
            panDistance = this.translateX + context.x2 - this.startPosition;
            panDistance = this.enforceTranslateValue(panDistance, this.boundaryMin, this.boundaryMax);
            matchedConfig = this.getResultFromConfig(widgetModel,direction, panDistance, widgetModel.widgetswipemove);
            if(matchedConfig == null) {
                this.applyTransform(widgetModel, context.widgetNode, this.translateX, true);
            } else {
                this.translateX = this.getValue(widgetModel, matchedConfig.translatePos);
                this.applyTransform(widgetModel, context.widgetNode, this.translateX, true);
                this.useTranslate = matchedConfig.translate;
                if(matchedConfig.callback) {
                    callbackContext.widgetInfo = this.containerModel;
                    callbackContext.rowIndex = widgetModel.rowContext.rowIndex;
                    callbackContext.sectionIndex  = widgetModel.rowContext.sectionIndex ;
                    matchedConfig.callback.call(widgetModel, widgetModel, callbackContext);
                }
            }
        }
    };

    return module;
}());
