
$KW.ScrollBox = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "ScrollBox", this.eventHandler);
            kony.events.addEvent("onorientationchange", "ScrollBox", this.adjustBoxDimensions);
        },

        initializeView: function(formId) {
            this.adjustBoxDimensions(formId);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            switch(propertyName) {
                case "heightreference":
                case "containerheightreference":
                    if(propertyValue > 0) {
                        widgetModel.containerheightreference = widgetModel.heightreference = propertyValue;
                        var boxNode = $KU.getNodeByModel(widgetModel);
                        boxNode && $KU.setScrollHeight(widgetModel, boxNode);
                    }
                    break;

                case "container_height":
                case "containerheight":
                    widgetModel.containerheight = widgetModel.container_height = propertyValue;
                    var boxNode = $KU.getNodeByModel(widgetModel);
                    boxNode && $KU.setScrollHeight(widgetModel, boxNode);
                    break;

                case "totalWt":
                    var boxNode = $KU.getNodeByModel(widgetModel);
                    if(boxNode && widgetModel.orientation == constants.BOX_LAYOUT_HORIZONTAL) {
                        
                        boxNode.parentNode.style.width = propertyValue + "%";
                        var scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(widgetModel) + '_scroller'];
                        scrollerInstance && scrollerInstance.refresh();
                    }
                    break;

                case "showscrollbars":
                    if(widgetModel.scrollArrowConfig || widgetModel.scrollarrowconfig)
                        return;

                    var scrollerId = $KW.Utils.getKMasterWidgetID(widgetModel) + "_scroller";
                    var scrollerInstance = $KG[scrollerId];
                    if(!scrollerInstance)
                        return;

                    if(scrollerInstance.hScroll) {
                        scrollerInstance.hScrollbar = propertyValue;
                        !!propertyValue && scrollerInstance._scrollbar('h');
                    }
                    if(scrollerInstance.vScroll) {
                        scrollerInstance.vScrollbar = propertyValue;
                        !!propertyValue && scrollerInstance._scrollbar('v');
                    }
                    break;

                    
                case "scrollingevents":
                    
                    break;

                case "onpull":
                case "onpush":
                    
                    
                    var wId = $KW.Utils.getKMasterWidgetID(widgetModel);
                    var _scrolleeId = wId + "_scrollee";
                    var _scrollerId = wId + "_scroller";
                    var wId = wId;
                    var scrolleeNode = $KU.getElementById(_scrolleeId);
                    if(!scrolleeNode)
                        return;

                    var div = document.createElement('div');

                    if(propertyName == "onpull") {
                        var pullDownEl = document.querySelector("#" + wId + "_pullDown");
                        if(pullDownEl)
                            return;

                        div.innerHTML = $KU.getPullString(widgetModel);
                        scrolleeNode.insertAdjacentElement("afterBegin", div.childNodes[0]); 
                    } else {
                        var pullUpEl = document.querySelector("#" + wId + "_pullUp");
                        if(pullUpEl)
                            return;

                        div.innerHTML = $KU.getPushString(widgetModel);
                        scrolleeNode.insertAdjacentElement("afterEnd", div.childNodes[0]); 
                    }

                    
                case "onreachingbeginning":
                case "onreachingend":
                    var _scrollerId = $KW.Utils.getKMasterWidgetID(widgetModel) + "_scroller";
                    var scrollerNode = document.getElementById(_scrollerId);
                    if(!scrollerNode)
                        return;

                    
                    var scrollerInstance = $KG[_scrollerId];
                    scrollerInstance && scrollerInstance.destroy();

                    
                    $KW.Scroller.initialize([scrollerNode]);
                    break;
            }
        },

        render: function(widgetModel, context) {
            var htmlString = "";
            context.scrollBoxID = widgetModel.id; 

            if(IndexJL) this.setarrowconfigs(widgetModel);
            if($KU.isBlackBerryNTH || ($KU.isWindowsPhone && $KU.isIE9)) {
                widgetModel.scrollbar = "arrows";
                if(widgetModel.orientation == constants.BOX_LAYOUT_HORIZONTAL) {
                    widgetModel.leftarrowimage = widgetModel.leftarrowimage || "prvarw.png";
                    widgetModel.rightarrowimage = widgetModel.rightarrowimage || "nxtarw.png";
                } else {
                    widgetModel.toparrowimage = widgetModel.toparrowimage || "toparw.png";
                    widgetModel.bottomarrowimage = widgetModel.bottomarrowimage || "botarw.png";
                }
            }

            var accessAttr = $KU.getAccessibilityValues(widgetModel);

            
            if(accessAttr.indexOf("aria-hidden") > 0) {
                accessAttr = "";
            }

            if(widgetModel.orientation == constants.BOX_LAYOUT_HORIZONTAL)
                htmlString = module.renderHBox(widgetModel, context, accessAttr);
            else 
                htmlString = module.renderVBox(widgetModel, context, accessAttr);

            context.scrollBoxID = "";
            return htmlString;
        },

        
        renderHBox: function(boxModel, context, accessAttr) {
            var parentModel = kony.model.getWidgetModel(boxModel.pf, context.tabpaneID);
            var htmlString = "";
            var layoutDirection = $KW.skins.getWidgetAlignmentSkin(boxModel);
            var wID = boxModel.pf + "_" + boxModel.id;
            var scrollingevents = boxModel.scrollingevents;
            var cellWidth = "";
            var kmasterObj = $KW.Utils.getMasterIDObj(boxModel);
            if(kmasterObj.id != "") {
                wID = kmasterObj.id;
            }

            var computedSkin = "",
                marginpadding = "";
            marginpadding += $KW.skins.getBaseStyle(boxModel, context);


            if(context.topLevelBox) {
                var skinArray = $KW.skins.getSplitSkinsBetweenWidgetAndParentDiv(boxModel, context);
                computedSkin = skinArray[2];
                computedSkin += " " + $KW.skins.getWidgetAlignmentSkin(boxModel);
            } else {
                htmlString += "<div class = 'krow kwt100' >";
                htmlString += "<div class = 'kcell kwt100' >";
                skinArray = $KW.skins.getSplitSkinsBetweenWidgetAndParentDiv(boxModel, context);
                computedSkin = skinArray[2];
                computedSkin += " " + $KW.skins.getWidgetAlignmentSkin(boxModel);
            }
            computedSkin += (!$KW.Utils.isWidgetVisible(boxModel, context)) ? " hide" : "";
            
            var scrollBoxAlignment = boxModel.percent ? "text-align: left; vertical-align:top;" : "";
            htmlString += "<div " + accessAttr + " id='" + wID + "_parent' class ='scrollerX " + computedSkin + "' style='" + marginpadding + scrollBoxAlignment + "' " + kmasterObj.kmasterid + ">";


            if(boxModel.scrollbar == "arrows" && boxModel.leftarrowimage && boxModel.rightarrowimage)
                htmlString += $KW.touch.fadeHImages(boxModel);

            
            var scrolldirection = $KW.stringifyScrolldirection[boxModel.scrolldirection];
            
            
            {
                
                
                if(boxModel.totalWt < 100) boxModel.totalWt = 100;
                htmlString += "<div id='" + wID + "_scroller' kwidgettype='KScrollBox' name='touchcontainer_KScroller' widgetType='hbox'  swipeDirection='" + scrolldirection + "' class ='kwt100 scrollerX' kformname='" + boxModel.pf + "' " + kmasterObj.kmasterid + ">";
                htmlString += "<div style='display:inline-block;xheight:100%;width:" + boxModel.totalWt + "%' id='" + wID + "_scrollee' kwidgettype='KTouchscroller' class='scrolleeX' " + kmasterObj.kmasterid + ">";

                computedSkin = "kwt100";
            }

            if(scrolldirection == 'vertical')
                htmlString += (scrollingevents && scrollingevents.onpull) ? $KU.getPullString(boxModel) : "";

            htmlString += "<div style='table-layout:fixed' class = 'ktable kwt100'" + $KW.Utils.getBaseHtml(boxModel, context) + ">";
            htmlString += "<div class = 'krow " + layoutDirection + " kwt100' >";

            
            

            var len = boxModel.children ? boxModel.children.length : 0;
            for(var i = 0; i < len; i++) {
                var childModel = parentModel[boxModel.children[i]];
                context.vLine = (childModel.wType == "Line") ? true : false;
                if(childModel.wType === "HBox" || childModel.wType === "VBox" || childModel.wType === "ScrollBox") {
                    context.topLevelBox = false;
                    if(childModel.wType == "HBox")
                        htmlString += $KW["HBox"].render(childModel, context);
                    else
                        htmlString += $KW["VBox"].render(childModel, context);
                } else {
                    
                    if(boxModel.percent == true) {
                        context.ispercent = true;
                        cellWidth = childModel.containerweight;
                        if(boxModel.totalWt && kony.appinit.isIE) 
                            cellWidth = Math.floor((100 * childModel.containerweight) / boxModel.totalWt);
                        var containerWt = "kwt" + cellWidth; 
                        $KW.skins.addWidthRule(cellWidth);
                        var alignment = $KW.skins.getWidgetAlignmentSkin(childModel);
                        
                        htmlString += "<div class = 'kcell " + containerWt + " " + alignment + "' style='" + $KW.skins.getChildMarginAsPaddingSkin(childModel) + "' >";
                    } else {
                        context.ispercent = false;
                    }

                    htmlString += $KW[childModel.wType].render(childModel, context);
                    if(boxModel.percent)
                        htmlString += "</div>";
                }
            }
            
            if($KG.appbehaviors.adherePercentageStrictly == true && boxModel.percent === true) {
                boxModel.dummyNodeWidth = $KW.HBox.getExtraNodeWidth(boxModel);
                htmlString += "<div class = 'kcell kwt" + boxModel.dummyNodeWidth + "'  ></div>";
            }

            
            

            htmlString += "</div></div>"

            if(scrolldirection == 'vertical')
                htmlString += (scrollingevents && scrollingevents.onpush) ? $KU.getPushString(boxModel) : "";

            
            htmlString += "</div></div>";
            htmlString += "</div>";
            if(!context.topLevelBox)
                htmlString += "</div></div>";

            return htmlString;
        },

        
        renderVBox: function(boxModel, context, accessAttr) {
            var parentModel = kony.model.getWidgetModel(boxModel.pf, context.tabpaneID);
            var topLevelBox = context.toplevel;
            var layoutDirection = $KW.skins.getWidgetAlignmentSkin(boxModel);
            var htmlString = "";
            var wID = boxModel.pf + "_" + boxModel.id;
            var computedSkin = $KW.skins.getWidgetSkin(boxModel, context) + " " + $KW.skins.getWidgetWeight(boxModel, context);
            var scrollingevents = boxModel.scrollingevents;
            var kmasterObj = $KW.Utils.getMasterIDObj(boxModel);
            if(kmasterObj.id != "") {
                wID = kmasterObj.id;
            }
            var marginpadding = "";
            marginpadding += " " + $KW.skins.getBaseStyle(boxModel, context);

            computedSkin += (!$KW.Utils.isWidgetVisible(boxModel, context) ? " hide" : "");
            htmlString += "<div " + accessAttr + " id='" + wID + "_parent' class ='scrollerX " + computedSkin + "' style='" + marginpadding + "' " + kmasterObj.kmasterid + ">";

            if(boxModel.scrollbar == "arrows" && boxModel.bottomarrowimage && boxModel.toparrowimage)
                htmlString += $KW.touch.fadeVImages(boxModel);

            
            var scrolldirection = $KW.stringifyScrolldirection[boxModel.scrolldirection];
            
            {
                htmlString += "<div id='" + wID + "_scroller' kwidgettype='KScrollBox' name='touchcontainer_KScroller' widgetType='vbox' swipeDirection='" + scrolldirection + "' class ='scrollerX' kformname='" + boxModel.pf + "' " + kmasterObj.kmasterid + ">";
                htmlString += "<div id='" + wID + "_scrollee' style='xheight:100%;" + (scrolldirection == "vertical" ? "white-space: pre-line;" : "") + "' kwidgettype='KTouchscroller' class='scrolleeX' " + kmasterObj.kmasterid + ">";
            }

            if(scrolldirection == 'vertical')
                htmlString += (scrollingevents && scrollingevents.onpull) ? $KU.getPullString(boxModel) : "";

            if(topLevelBox) {
                htmlString += "<div style='table-layout:fixed' class = '" + computedSkin + "' id='" + wID + "' kformname='" + boxModel.pf + "'>";
            } else {
                
                var vboxComputedSkin = "kwt100" + " " + layoutDirection + (!$KW.Utils.isWidgetVisible(boxModel, context) ? " hide" : "");
                var skinArray = $KW.skins.getSplitSkinsBetweenWidgetAndParentDiv(boxModel, context);
                vboxComputedSkin = skinArray[2];
                htmlString += "<div style='table-layout:fixed' class='ktable kwt100'" + $KW.Utils.getBaseHtml(boxModel, context) + ">";
            }

            var len = boxModel.children ? boxModel.children.length : 0;
            for(var i = 0; i < len; i++) {
                var childModel = parentModel[boxModel.children[i]];
                if(childModel.wType === "HBox" || childModel.wType === "VBox" || childModel.wType === "ScrollBox") {
                    context.topLevelBox = false;

                    if(childModel.wType == "HBox") {
                        context.ispercent = boxModel.percent;
                        htmlString += $KW["HBox"].render(childModel, context);
                    } else {
                        htmlString += $KW["VBox"].render(childModel, context);
                    }
                } else {
                    vboxComputedSkin = " krow kwt100 ";
                    htmlString += "<div class = '" + vboxComputedSkin + "' >";
                    layoutDirection = $KW.skins.getWidgetAlignmentSkin(childModel)
                    vboxComputedSkin = $KW.skins.getMarAdjustedContainerWeightSkin(childModel, "100");
                    vboxComputedSkin += " kcell " + layoutDirection;
                    htmlString += "<div class = '" + vboxComputedSkin + "' >";
                    htmlString += $KW[childModel.wType].render(childModel, context);
                    htmlString += "</div></div>";
                }
            }

            htmlString += "</div>";
            if(topLevelBox)
                htmlString += "</div>";

            if(scrolldirection == 'vertical')
                htmlString += (scrollingevents && scrollingevents.onpush) ? $KU.getPushString(boxModel) : "";

            
            htmlString += "</div></div>";

            htmlString += "</div>";

            return htmlString;
        },

        eventHandler: function(eventObject, target, sourceFormID) {
            var scrollModel = $KU.getModelByNode(target);
            spaAPM && spaAPM.sendMsg(scrollModel, 'onclick');
            var scrollboxref = $KU.returnEventReference(scrollModel.onclick);
            if(scrollboxref) {
                $KU.executeWidgetEventHandler(scrollModel, scrollboxref);
            }
        },

        adjustBoxDimensions: function(formId) {
            $KU.setScrollBoxesHeight(formId, "ScrollBox");
        },

        adjustArrowPosition: function(id) {
            var vFades = document.querySelectorAll("#" + id + "_scrollFades_V > div");
            var hFades = document.querySelectorAll("#" + id + "_scrollFades_H > div");

            if(hFades.length > 0) {

                hFades[0].style.top = Math.floor((hFades[0].parentNode.offsetHeight - (hFades[0].childNodes[0].naturalHeight || hFades[0].childNodes[0].height)) / 2) + "px";
                hFades[1].style.top = Math.floor((hFades[1].parentNode.offsetHeight - (hFades[1].childNodes[0].naturalHeight ||
                    hFades[1].childNodes[0].height)) / 2) + "px";
            }
            if(vFades.length > 0) {
                vFades[0].style.left = Math.floor((vFades[0].parentNode.offsetWidth - (vFades[0].childNodes[0].naturalHeight || vFades[0].childNodes[0].height)) / 2) + "px";
                vFades[1].style.left = Math.floor((vFades[1].parentNode.offsetWidth - (vFades[1].childNodes[0].naturalHeight ||
                    vFades[0].childNodes[0].height)) / 2) + "px";
            }
        },

        setarrowconfigs: function(widgetModel) {
            var scrollArrowConfig = widgetModel.scrollarrowconfig;
            if(scrollArrowConfig)
                widgetModel.scrollbar = "arrows";
            if(scrollArrowConfig && scrollArrowConfig.length >= 4) {
                widgetModel.leftarrowimage = scrollArrowConfig[IndexJL];
                widgetModel.toparrowimage = scrollArrowConfig[IndexJL + 1];
                widgetModel.rightarrowimage = scrollArrowConfig[IndexJL + 2];
                widgetModel.bottomarrowimage = scrollArrowConfig[IndexJL + 3];
            }
        },

        scrollToBeginning: function(widgetModel) {
            
            var node = $KU.getNodeByModel(widgetModel);
            if(node) {
                if($KG.nativeScroll) {
                    var scrollableElement = document.getElementById(node.id + "_scroller");
                    scrollableElement.scrollLeft = 0;
                    scrollableElement.scrollTop = 0;
                } else {
                    var scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(widgetModel) + '_scroller'];
                    if(scrollerInstance) {
                        if(widgetModel.orientation == constants.BOX_LAYOUT_HORIZONTAL)
                            scrollerInstance.scrollTo(scrollerInstance.minScrollX, 0, 500);
                        else
                            scrollerInstance.scrollTo(0, scrollerInstance.minScrollY, 500);
                    }
                }
            }
        },

        scrollToEnd: function(widgetModel) {
            
            var node = $KU.getNodeByModel(widgetModel);
            if(node) {
                if($KG.nativeScroll) {
                    var scrollableElement = document.getElementById(node.id + "_scroller");
                    scrollableElement.scrollLeft = node.scrollWidth;
                    scrollableElement.scrollTop = node.scrollHeight;
                } else {
                    var scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(widgetModel) + '_scroller'];
                    if(scrollerInstance) {
                        if(widgetModel.orientation == constants.BOX_LAYOUT_HORIZONTAL)
                            scrollerInstance.scrollTo(scrollerInstance.maxScrollX, 0, 500);
                        else
                            scrollerInstance.scrollTo(0, scrollerInstance.maxScrollY, 500);
                    }
                }
            }
        },

        adjustScrollChildrenWidth: function(boxModel) {
            var boxNode = $KU.getNodeByModel(boxModel);
            if(boxModel.percent && boxModel.totalWt && kony.appinit.isIE) {
                var row = boxNode.firstChild;
                var cells = row.childNodes;
                var totalWidth = boxModel.totalWt || 0;
                for(var i = 0; i < cells.length; i++) {
                    var childModel = boxModel[cells[i].firstChild.id.split("_")[1]];
                    var cellWt = Math.floor((100 * childModel.containerweight) / boxModel.totalWt);
                    var newWt = kony.widgets.skins.getMarAdjustedContainerWeightSkin(childModel, cellWt || "");
                    cells[i].className = cells[i].className.replace(new RegExp("(^|\\s+)kwt([0-9]+)(\\s+|$)"), ' ');
                    $KU.addClassName(cells[i], newWt);
                }
            }
        },

        recalculateScrollBoxWidth: function(boxModel) {
            if(boxModel.orientation != constants.BOX_LAYOUT_HORIZONTAL)
                return;

            var children = boxModel.ownchildrenref;
            var totalWt = 0;
            for(var i = 0; i < children.length; i++) {
                totalWt += children[i].containerweight;
            }

            boxModel.totalWt = totalWt;
            
            var boxNode = $KU.getNodeByModel(boxModel);
            if(boxNode == null)
                return;
            boxNode.parentNode.style.width = totalWt + "%";
            var scrollerInstance = $KG[boxModel.pf + "_" + boxModel.id + '_scroller'];
            scrollerInstance && scrollerInstance.refresh();
        }
    };


    return module;
}());
