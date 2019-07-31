
$KW.FlexScrollContainer = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "FlexScrollContainer", this.eventHandler);
            kony.events.addEvent("onorientationchange", "FlexScrollContainer", this.orientationHandler);
        },

        initializeView: function(formId) {
            
            $KW.FlexContainer.attachResizeEvent(formId, "FlexScrollContainer");
            $KW.Scroller.initializeFlexScrollContainers(formId);
            var scrollNodes = document.querySelectorAll("#" + formId + " div[kwidgettype='FlexScrollContainer']");
            $KW.Utils.initializeScrollEvents(scrollNodes);
            $KW.APIUtils.getModelForContentOffset(formId, "FlexScrollContainer");
            setTimeout(function() {
                for(var i = 0; i < scrollNodes.length; i++) {
                    var model = $KU.getModelByNode(scrollNodes[i]);
                    if(model.reverselayoutdirection) {
                        model.scrollToEnd();
                    }
                }
            }, 0);
        },

        orientationHandler: function(formId, orientation) {
            
        },

        adjustFlexContainer: function(formId) {
            $KW.FlexContainer.adjustFlexContainer(formId);
        },

        renderChildren: function(flexModel, wArrary, context) {
            return $KW.FlexContainer.renderChildren(flexModel, wArrary, context);
        },

        
        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;

            var options;
            if(!$KG["nativeScroll"]) {
                var scrollerInstance = $KW.Utils.getScrollerInstance(widgetModel);
                if(!scrollerInstance)
                    return;
                options = scrollerInstance.options;

                var wId = $KW.Utils.getKMasterWidgetID(widgetModel);
                var _scrolleeId = wId + "_scrollee";
                var _scrollerId = wId + "_scroller";

                var scrolleeNode = $KU.getElementById(_scrolleeId);
                var scrollerNode = document.getElementById(_scrollerId);
            }

            switch(propertyName) {
                case "clipbounds":
                    element = element.parentNode.parentNode;
                    if(propertyValue == false) {
                        element.style.overflow = "visible";
                        element.parentElement.style.overflow = "visible";
                    } else {
                        element.style.overflow = "hidden";
                        element.parentElement.style.overflow = "hidden";
                    }
                    break;
                case "enableScrolling":
                    if($KG["nativeScroll"]) {
                        $KW.Scroller.initializeNativeScroller(widgetModel, element);
                    } else {
                        options.disableUserScroll = !widgetModel.enablescrolling;
                        if(options.disableUserScroll) {
                            options.vScroll = false;
                            options.hScroll = false;
                        } else {
                            options.vScroll = true;
                            options.hScroll = true;
                        }
                    }
                    break;
                case "scrollDirection":
                    if($KG["nativeScroll"]) {
                        $KW.Scroller.initializeNativeScroller(widgetModel, element);
                        return;
                    }
                    var scrolldirection = $KW.stringifyScrolldirection[widgetModel.scrolldirection];
                    if(widgetModel.wType == 'Form')
                        scrolldirection = "vertical";
                    if(scrolldirection == "vertical") {
                        options.vScroll = true;
                        options.scrollbox = true;
                        options.hScroll = false;
                        
                    } else if(scrolldirection == "horizontal") {
                        options.hScroll = true;
                        options.scrollbox = true;
                        options.vScroll = false;
                        
                    } else if(scrolldirection == "both") 
                    {
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
                case "bounces":
                case "allowHorizontalBounce":
                case "allowVerticalBounce":
                    if(options) {
                        options.bounce = widgetModel.bounce;
                        options.hBounce = widgetModel.bounce ? widgetModel.allowhorizontalbounce : false;
                        options.vBounce = widgetModel.bounce ? widgetModel.allowverticalbounce : false;
                    }
                    break;
                case "horizontalScrollIndicator":
                    if(options)
                        options.hScrollbar = widgetModel.horizontalscrollindicator;
                    break;
                case "verticalScrollIndicator":
                    if(options)
                        options.vScrollbar = widgetModel.verticalscrollindicator;
                    break;
                case "onDecelerationStarted":
                    break;
                case "contentOffset":
                    module.setContentOffSet(widgetModel, widgetModel.contentOffset, true, scrollerInstance)
                    break;

                case "scrollingevents":
                        if(!$KG["nativeScroll"] && propertyValue) {
                            var div = document.createElement('div');
                            if(widgetModel.scrollingevents.onpull) {
                                var pullDownEl = scrollerNode.querySelector("#" + wId + "_pullDown");
                                if(!pullDownEl) {
                                    div.innerHTML = $KU.getFSCPullString(widgetModel);
                                    scrolleeNode.insertAdjacentElement("afterBegin", div.childNodes[0]); 
                                }
                            }

                            if(widgetModel.scrollingevents.onpush) {
                                var pullUpEl = scrollerNode.querySelector("#" + wId + "_pullUp");
                                if(!pullUpEl) {
                                    div.innerHTML = $KU.getFSCPushString(widgetModel);
                                    scrolleeNode.insertAdjacentElement("beforeend", div.childNodes[0]); 
                                }
                            }
                        } else {
                            var pullDownEl = scrollerNode.querySelector("#" + wId + "_pullDown");
                            var pullUpEl = scrollerNode.querySelector("#" + wId + "_pullUp");
                            
                            if(pullUpEl) {
                                scrolleeNode.removeChild(scrolleeNode.childNodes[2]);
                            }
                            if(pullDownEl) {
                                scrolleeNode.removeChild(scrolleeNode.childNodes[0]);
                            }

                        }
                        var scrollerInstance = $KG[_scrollerId];
                        scrollerInstance && scrollerInstance.destroy();
                        $KW.Scroller.initialize([scrollerNode], "FlexScrollContainer");

                break;
                case "pullkey":
                case "releasepullkey":
                case "pullicon":
                case "pullskin":
                        if(!$KG["nativeScroll"] && widgetModel.scrollingevents && widgetModel.scrollingevents.onpull) {
                            var pullDownEl = scrollerNode.querySelector("#" + wId + "_pullDown");
                            if(pullDownEl) {
                                scrolleeNode.removeChild(scrolleeNode.childNodes[0]);
                            }
                            var div = document.createElement('div');
                            div.innerHTML = $KU.getFSCPullString(widgetModel);
                            scrolleeNode.insertAdjacentElement("afterBegin", div.childNodes[0]); 

                            var scrollerInstance = $KG[_scrollerId];
                            scrollerInstance && scrollerInstance.destroy();
                            $KW.Scroller.initialize([scrollerNode], "FlexScrollContainer");
                        }
                break;

                case "pushkey":
                case "releasepushkey":
                case "pushicon":
                case "pushskin":
                        if(!$KG["nativeScroll"] && widgetModel.scrollingevents && widgetModel.scrollingevents.onpush) {
                            var pullUpEl = scrollerNode.querySelector("#" + wId + "_pullUp");
                            if(pullUpEl) {
                                scrolleeNode.removeChild(scrolleeNode.childNodes[2]);
                            }
                            var div = document.createElement('div');
                            div.innerHTML = $KU.getFSCPushString(widgetModel);
                            scrolleeNode.insertAdjacentElement("beforeend", div.childNodes[0]); 

                            
                            var scrollerInstance = $KG[_scrollerId];
                            scrollerInstance && scrollerInstance.destroy();
                            $KW.Scroller.initialize([scrollerNode], "FlexScrollContainer");
                        }
                break;

                case "animateicons":
                    if(widgetModel.scrollingevents) {
                        var pullDownEl = scrollerNode.querySelector("#" + wId + "_pullDown");
                        var pullUpEl = scrollerNode.querySelector("#" + wId + "_pullUp");
                        if(widgetModel.animateicons) {
                            pullDownEl && pullDownEl.setAttribute("name", "pullDownAnimate");
                            pullUpEl && pullUpEl.setAttribute("name", "pullUpAnimate");
                        }
                        else {
                            pullDownEl && pullDownEl.setAttribute("name", "pullDown");
                            pullUpEl && pullUpEl.setAttribute("name", "pullUp");
                        }
                    }
                break;

            }
            scrollerInstance && scrollerInstance.refresh();
        },

        render: function(flexModel, context) {
            return this.renderTableLayout(flexModel, context);
        },

        renderTableLayout: function(flexModel, context) {
            var topLevel = context.topLevelBox;
            var computedSkin = "kwt100 " + " ";
            computedSkin += $KW.skins.getWidgetAlignmentSkin(flexModel);
            var css = (flexModel.skin || "") + $KW.skins.getVisibilitySkin(flexModel);
            var boxstyle = " table-layout:fixed;position:relative;height:100%"
            var overflow = (flexModel.clipbounds ? "overflow:hidden;boxShadow:none" : "overflow:visible");

            var htmlString = "";
            var wID = flexModel.pf + "_" + flexModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(flexModel);
            if(kmasterObj.id != "") {
                wID = kmasterObj.id;
            }
            var scrolldirection = $KW.stringifyScrolldirection[flexModel.scrolldirection];
            var scrollingevents = flexModel.scrollingevents;

            htmlString += "<div id='" + wID + "_scroller' kwidgettype='KFlexScrollContainer' name='touchcontainer_KScroller' widgetType='hbox'  swipeDirection='" + scrolldirection + "' class =' scrollerX " + css + "' style='" + $KW.skins.getBaseStyle(flexModel, context) + ";" + overflow + ";width:100%;height:100%;' " + kmasterObj.kmasterid + " >";
            var height = "height:100%;";
            if(flexModel.parent.wType == 'Form' && (flexModel.parent.layoutType == kony.flex.FLOW_VERTICAL ||
                    flexModel.parent.layoutType == kony.flex.FREE_FORM) ||
                flexModel.parent.wType === "FlexScrollContainer" || flexModel.parent.wType === "FlexContainer") {
                height = "height:100%;";
            }
            var display = "display: inline-block;"
            if(scrolldirection == "horizontal") {
                display = "display: inline-flex;"
            }

            htmlString += "<div style='width:100%;" + display + height + ";' id='" + wID + "_scrollee' kwidgettype='KTouchscroller' class='' " + kmasterObj.kmasterid + ">";


            htmlString += (scrollingevents && scrollingevents.onpull) ? $KU.getFSCPullString(flexModel) : "";


            htmlString += "<div  kformname='" + flexModel.pf + "' class = 'kwt100'" + $KW.Utils.getBaseHtml(flexModel, context) + " style='" + boxstyle + "'>";


            var wArrary = flexModel.widgets();
            if(wArrary.length > 0) {
                htmlString += $KW.FlexContainer.renderChildren(flexModel, wArrary, context);
            }

            htmlString += "</div>";


            htmlString += (scrollingevents && scrollingevents.onpush) ? $KU.getFSCPushString(flexModel) : "";


            htmlString += "</div></div>";
            return htmlString;
        },

        forceLayout: function(flexModel, flexNode) {
            $KW.FlexContainer.forceLayout(flexModel, flexNode);
            var scrollerInstance = $KW.Utils.getScrollerInstance(flexModel);
            if(!scrollerInstance || scrollerInstance.dragging)
                return;
            
            
            scrollerInstance.refresh();

        },

        eventHandler: function(eventObject, target) {
            $KW.FlexContainer.eventHandler(eventObject, target);
        },

        getContentSizeMeasured: function(flexModel) {
            var contentSize = {
                width: 0,
                height: 0
            };
            if($KG["nativeScroll"]) {
                var flexNode = $KU.getNodeByModel(flexModel);
                if(flexNode) {
                    contentSize.width = flexNode.scrollWidth;
                    contentSize.height = flexNode.scrollHeight;
                }
            } else {
                var scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(flexModel) + '_scroller'];
                if(scrollerInstance) {
                    contentSize.width = scrollerInstance.scrollerW;
                    contentSize.height = scrollerInstance.scrollerH;
                }
            }
            return contentSize;
        },

        setContentOffSet: function(flexModel, contentOffSet, animate, scrollerInstance) {
            if($KG["nativeScroll"]) {
                var flexNode = $KU.getNodeByModel(flexModel);
                if(flexNode) {
                    $KW.APIUtils.setfocus(flexModel);
                    var offsetX = $KW.FlexUtils.getValueByParentFrame(flexModel, $KW.FlexUtils.getValueAndUnit(flexModel, contentOffSet.x), 'x', flexModel.frame);
                    var offsetY = $KW.FlexUtils.getValueByParentFrame(flexModel, $KW.FlexUtils.getValueAndUnit(flexModel, contentOffSet.y), 'y', flexModel.frame);
                    flexNode.scrollLeft = offsetX;
                    flexNode.scrollTop = offsetY;
                }
            } else {
                if(typeof contentOffSet === "undefined" || contentOffSet === null ||
                    typeof contentOffSet.x === "undefined" ||
                    typeof contentOffSet.y === "undefined") {
                    return;
                }
                if(!scrollerInstance)
                    scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(flexModel) + '_scroller'];
                var that = scrollerInstance;
                var left = 0,
                    top = 0;

                left = $KW.FlexUtils.getValueByParentFrame(flexModel, $KW.FlexUtils.getValueAndUnit(flexModel, contentOffSet.x), 'x', flexModel.frame);
                top = $KW.FlexUtils.getValueByParentFrame(flexModel, $KW.FlexUtils.getValueAndUnit(flexModel, contentOffSet.y), 'y', flexModel.frame);

                var pos = {
                    left: -left,
                    top: -top
                };
                pos.left = pos.left >= that.minScrollX ? that.minScrollX : pos.left <= that.maxScrollX ? that.maxScrollX : pos.left;
                pos.top = pos.top >= that.minScrollY ? that.minScrollY : pos.top <= that.maxScrollY ? that.maxScrollY : pos.top;
                scrollerInstance.contentoffsetmove = true;
                scrollerInstance.scrollTo(pos.left, pos.top, (animate ? 1000 : 0));
                scrollerInstance.moved = false;
                scrollerInstance.contentoffsetmove = false;
            }
        },

        scrollToWidget: function(flexModel, widget, animate) {
            if(widget.parent !== flexModel)
                return;

            if($KG["nativeScroll"]) {
                var flexNode = $KU.getNodeByModel(flexModel);
                if(flexNode) {
                    $KW.APIUtils.setfocus(flexModel);
                    var wFrame = widget.frame;
                    flexNode.scrollLeft = wFrame.x;
                    flexNode.scrollTop = wFrame.y;
                }
            } else {
                var scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(flexModel) + '_scroller'];
                var widgetHTMLObj = $KW.Utils.getWidgetNode(widget);
                if(!widgetHTMLObj)
                    return;
                scrollerInstance.contentoffsetmove = true;
                var pos = scrollerInstance.scrollToElement(widgetHTMLObj.parentNode, (animate ? 1000 : 0));
                scrollerInstance.moved = false;
                scrollerInstance.contentoffsetmove = false;
                
            }
        },

        scrollToEnd: function(flexModel, animate) {
            var flexNode = $KU.getNodeByModel(flexModel);
            if(flexNode) {
                $KW.APIUtils.setfocus(flexModel);
                if($KG["nativeScroll"]) {
                    switch(flexModel.scrolldirection) {
                        case kony.flex.SCROLL_HORIZONTAL:
                            flexNode.scrollLeft = flexNode.scrollWidth;
                            break;
                        case kony.flex.SCROLL_VERTICAL:
                            flexNode.scrollTop = flexNode.scrollHeight;
                            break;
                        case kony.flex.SCROLL_BOTH:
                            flexNode.scrollLeft = flexNode.scrollWidth;
                            flexNode.scrollTop = flexNode.scrollHeight;
                            break;
                    }
                } else {
                    var scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(flexModel) + '_scroller'];
                    scrollerInstance.contentoffsetmove = true;
                    if(scrollerInstance) {
                        switch(flexModel.scrolldirection) {
                            case kony.flex.SCROLL_HORIZONTAL:
                                scrollerInstance.scrollTo(scrollerInstance.maxScrollX, 0, 500);
                                break;
                            case kony.flex.SCROLL_VERTICAL:
                                scrollerInstance.scrollTo(0, scrollerInstance.maxScrollY, 500);
                                break;
                            case kony.flex.SCROLL_BOTH:
                                scrollerInstance.scrollTo(scrollerInstance.maxScrollX, scrollerInstance.maxScrollY, 500);
                                break;
                        }
                    }
                    scrollerInstance.moved = false;
                    scrollerInstance.contentoffsetmove = false;
                }
            }
        }
    };


    return module;
}());
