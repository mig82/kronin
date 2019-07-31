
$KW.Scroller = (function() {
    
    

    var module = {
        initializeFormScroller: function(formId) {
            var scrollerNodes = document.querySelectorAll("#" + formId + "[kwidgettype='KFormScroller'] ,#" + formId + " div[kwidgettype='KFormScroller']");
            scrollerNodes && this.initialize(scrollerNodes, "Form");
        },

        initializeScrollBoxes: function(formId) {
            var scrollerNodes = document.querySelectorAll("#" + formId + " div[kwidgettype='KScrollBox']");
            scrollerNodes && this.initialize(scrollerNodes, "ScrollBox");
        },

        initializeFlexScrollContainers: function(formId) {
            var scrollerNodes = document.querySelectorAll("#" + formId + " div[kwidgettype='KFlexScrollContainer']");
            scrollerNodes && this.initialize(scrollerNodes, "FlexScrollContainer");
        },

        initializeCollectionViewContainers: function(formId) {
            var scrollerNodes = document.querySelectorAll("#" + formId + " div[kwidgettype='KCollectionView']");
            scrollerNodes && this.initialize(scrollerNodes, "CollectionView");
        },

        initialize: function(scrollerNodes, type) {
            var _setOnScrollStart = function(widgetModel, options) {
                options.onScrollStart = function() {
                    var options = this.options;
                    options.widgetModel.contentoffset = {
                        x: -this.x,
                        y: -this.y
                    };
                    options.widgetModel.onscrollstart && $KU.executeWidgetEventHandler(options.widgetModel, options.widgetModel.onscrollstart);
                };
            };
            var _setOnScrolling = function(widgetModel, options) {
                options.onScrollMove = function() {
                    var options = this.options;
                    options.widgetModel.contentoffset = {
                        x: -this.x,
                        y: -this.y
                    };
                    options.widgetModel.onscrolling && $KU.executeWidgetEventHandler(options.widgetModel, options.widgetModel.onscrolling);
                };
            };
            var _setOnScrollTouchReleased = function(widgetModel, options) {
                options.onScrollTouchReleased = function() {
                    var options = this.options;
                    options.widgetModel.contentoffset = {
                        x: -this.x,
                        y: -this.y
                    };
                    options.widgetModel.onscrolltouchreleased && $KU.executeWidgetEventHandler(options.widgetModel, options.widgetModel.onscrolltouchreleased);
                };
            };
            var _setonScrollEnd = function(widgetModel, options) {
                options.onScrollEnd = function() {
                    var options = this.options;
                    options.widgetModel.contentoffset = {
                        x: -this.x,
                        y: -this.y
                    };
                    options.widgetModel.onscrollend && $KU.executeWidgetEventHandler(options.widgetModel, options.widgetModel.onscrollend);
                };
            };

            if($KG["stickyScroll"]) {
                var scrollerInstance = new $KW.touch.StickyScroller();
                $KG[$KG["__currentForm"] + '_scroller'] = scrollerInstance;
                return;
            } else if($KG["nativeScroll"] && type == "Form") {
                var forms = document.forms;
                var curForm = forms[0];
                if(forms.length == 2)
                    curForm = forms[1]; 
                
                var formModel = $KG.allforms[curForm.id];
                if(formModel && $KW.FlexUtils.isFlexContainer(formModel)) {
                    this.initializeNativeScroller(formModel, curForm);
                }
                return;
            }


            for(var i = 0; i < scrollerNodes.length; i++) {
                var _scrollerId = scrollerNodes[i].id;
                var scrollerId = _scrollerId.substring(0, _scrollerId.lastIndexOf("_"));

                
                var _scrollerDOMNode = scrollerNodes[i];
                var scrollerDOMNode = document.getElementById(scrollerId);
                var widgetType = _scrollerDOMNode.getAttribute("widgetType");
                var swipeDirection = _scrollerDOMNode.getAttribute("swipeDirection");

                var widgetModel;
                if(type == 'Form')
                    widgetModel = $KG.allforms[scrollerId];
                else
                    widgetModel = $KU.getModelByNode(scrollerDOMNode);

                var formModel;
                widgetModel.pf && (formModel = $KG.allforms[widgetModel.pf]);

                var options = {};
                options.checkDOMChanges = true;
                options.widgetModel = widgetModel;

                if(type == 'Form' && $KW.FlexUtils.isFlexContainer(widgetModel))
                    swipeDirection = "vertical";

                if(swipeDirection == "vertical") {
                    options.vScroll = true;
                    options.scrollbox = true;
                } else if(swipeDirection == "horizontal") {
                    options.hScroll = true;
                    options.scrollbox = true;
                } else if(swipeDirection == "both") 
                {
                    options.vScroll = true;
                    options.hScroll = true;
                    options.scrollbox = true;
                } else if(type !== "FlexScrollContainer") {
                    
                    options.vScroll = true;
                    options.hScroll = true;
                    options.scrollbox = true;
                }

                if(widgetModel.wType == 'Segment') {
                    var listAnimation = widgetModel.listAnimation;
                    if(listAnimation && !listAnimation.initialized) {
                        listAnimation.init();
                    }
                }

                if(type == 'Form')
                    options.scrollbox = false;

                if(type == "FlexScrollContainer" || (type == 'Form' && $KW.FlexUtils.isFlexContainer(widgetModel))) {
                    if($KG["nativeScroll"]) {
                        this.initializeNativeScroller(widgetModel, _scrollerDOMNode.childNodes[0].childNodes[0]);
                        continue;
                    }
                    (type == 'Form') && module.setHeight(scrollerId);
                    
                    options.formid = widgetModel.pf;

                    options.vBounce = widgetModel.allowverticalbounce;
                    options.hBounce = widgetModel.allowhorizontalbounce;
                    options.bounce = widgetModel.bounces;

                    
                    options.disableUserScroll = !widgetModel.enablescrolling;
                    
                    options.hideScrollbar = true;

                    if(swipeDirection == "horizontal")
                        options.hScrollbar = widgetModel.horizontalscrollindicator;
                    else if(swipeDirection == "vertical")
                        options.vScrollbar = widgetModel.verticalscrollindicator;
                    else if(swipeDirection == "both") {
                        options.hScrollbar = widgetModel.horizontalscrollindicator;
                        options.vScrollbar = widgetModel.verticalscrollindicator;
                    } else {
                        options.hScrollbar = false;
                        options.vScrollbar = false;
                    }

                    
                    if(widgetModel.scrollingevents) {
                        _setOnScrollStart(widgetModel, options);
                        _setOnScrollTouchReleased(widgetModel, options);
                        module.initializeFlexScrollEvents(widgetModel, options);
                    } else {
                        
                        _setOnScrollStart(widgetModel, options);
                        _setOnScrolling(widgetModel, options);
                        _setOnScrollTouchReleased(widgetModel, options);
                        _setonScrollEnd(widgetModel, options);
                    }

                } else if(widgetType == "form") {
                    module.setHeight(scrollerId);
                    options.vScrollbar = true;
                    options.formid = scrollerId;
                    options.scrollbox = false;
                    options.bounce = (widgetModel.scrollbounce != undefined) ? widgetModel.scrollbounce : true;
                    if($KG.nativeScroll && (widgetModel.wType === 'Popup')) {
                        _scrollerDOMNode.style.overflowY = 'auto';
                        continue;
                    }
                } else 
                {
                    var widgetModel = $KU.getModelByNode(scrollerDOMNode);

                    if(widgetModel.needScroller == false && widgetModel.screenLevelWidget != true)
                        continue;

                    if(widgetModel.needScroller == false && widgetModel.screenLevelWidget == true && (formModel.id != widgetModel.parent.id))
                        continue;
                    
                    if($KG["nativeScroll"] && widgetModel) {
                        var overflowX, overflowY;
                        switch(widgetModel.scrollDirection) {
                            case 1:
                                overflowX = "auto";
                                overflowY = "hidden";
                                break;
                            case 2:
                                overflowX = "hidden";
                                overflowY = "auto";
                                break;
                            case 3:
                                overflowX = "auto";
                                overflowY = "auto";
                                break;
                            case 4:
                                overflowX = "hidden";
                                overflowY = "hidden";
                            default:
                                overflowX = "";
                                overflowY = "";
                        }
                        var scrollerStyle = _scrollerDOMNode.style;
                        scrollerStyle.overflowX = overflowX;
                        scrollerStyle.overflowY = overflowY;


                        this.initializeNativeScroller(widgetModel, _scrollerDOMNode);
                        continue;
                    }

                    options.scrollbox = true;
                    options.formid = widgetModel.pf;
                    if(widgetModel.screenLevelWidget) {
                        var hasScroll = formModel.wType == "Popup" ? formModel.enableScroll : true;
                        var formScroller = document.getElementById(options.formid + "_scroller");
                        if(hasScroll && formScroller) {
                            _scrollerDOMNode.style.height = formScroller.offsetHeight + "px";
                            module.setSLWHeight(formModel, _scrollerDOMNode);
                        }
                    }
                    options.bounce = widgetModel.scrollbounce != undefined ? widgetModel.scrollbounce : true;
                    options.disableUserScroll = (widgetModel.scrolldirection == constants.SCROLLBOX_SCROLL_NONE);
                    

                    if(widgetModel.scrollbar == "arrows") {
                        options.showImages = true;
                        options.widgetID = widgetModel.id;
                    } else if(widgetModel.scrollbar == "scrollbar") {
                        if(widgetModel.autohidescrollbar === false)
                            options.hideScrollbar = false;
                        if(swipeDirection == "horizontal")
                            options.hScrollbar = true;
                        else if(swipeDirection == "vertical")
                            options.vScrollbar = true;
                        else if(swipeDirection == "both") {
                            options.hScrollbar = true;
                            options.vScrollbar = true;
                        }
                    }
                    if(type == 'CollectionView' && widgetModel.showScrollbars) {
                        if(swipeDirection == "horizontal")
                            options.hScrollbar = true;
                        else if(swipeDirection == "vertical")
                            options.vScrollbar = true;
                        else if(swipeDirection == "both") {
                            options.hScrollbar = true;
                            options.vScrollbar = true;
                        }
                    }

                    
                    var scrollingEvents = widgetModel.scrollingevents;
                    if(scrollingEvents) {
                        var pullDownEl, pullUpEl, pullInitFlag, pushInitFlag;
                        var pullDownOffset = 0,
                            pullUpOffset = 0;
                        var onRefresh = "",
                            onScrollStart = "",
                            onScrollMove = "",
                            onScrollEnd = "";
                        var pullDownId = "#" + $KW.Utils.getKMasterWidgetID(widgetModel) + "_pullDown";
                        var pullUpId = "#" + $KW.Utils.getKMasterWidgetID(widgetModel) + "_pullUp";

                        pullDownEl = document.querySelector(pullDownId);
                        pullUpEl = document.querySelector(pullUpId);
                        if(widgetModel.wType == 'CollectionView' && widgetModel.layouttype == kony.collectionview.LAYOUT_VERTICAL) {
                            pullDownEl && (pullDownOffset = pullDownEl.offsetWidth);
                            pullUpEl && (pullUpOffset = pullUpEl.offsetWidth);
                        } else {
                            pullDownEl && (pullDownOffset = pullDownEl.offsetHeight);
                            pullUpEl && (pullUpOffset = pullUpEl.offsetHeight);
                        }

                        !scrollingEvents.onpull && (pullInitFlag = true);
                        !scrollingEvents.onpush && (pushInitFlag = true);

                        onRefresh = function() {
                            var pullDownEl = this.options.pullDownEl;
                            var pullUpEl = this.options.pullUpEl;
                            var widgetModel = this.options.widgetModel;
                            if(pullDownEl && pullDownEl.className.match('loading')) {
                                pullDownEl.className = '';
                                if(widgetModel.wType == 'CollectionView') {
                                    pullDownEl.children[0] && $KU.removeClassName(pullDownEl.children[0], 'hide');
                                    pullDownEl.children[1] && $KU.addClassName(pullDownEl.children[1], 'hide');
                                } else {
                                    pullDownEl.querySelector(".pullDownLabel").innerHTML = "Pull down to refresh..";
                                }
                            } else if(pullUpEl && pullUpEl.className.match('loading')) {
                                pullUpEl.className = '';
                                if(widgetModel.wType == 'CollectionView') {
                                    pullUpEl.children[0] && $KU.removeClassName(pullUpEl.children[0], 'hide');
                                    pullUpEl.children[1] && $KU.addClassName(pullUpEl.children[1], 'hide');
                                } else {
                                    pullUpEl.querySelector(".pullUpLabel").innerHTML = "Pull up to refresh..";
                                }
                            }
                        };
                        onScrollStart = function() {
                            this.options.widgetModel.wType == 'Segment' && $KW.Segment.handleLazyLoadingOnScrollStart(this.options.widgetModel);
                        }
                        onScrollMove = function() {
                            var pullDownEl = this.options.pullDownEl;
                            var pullUpEl = this.options.pullUpEl;
                            var widgetModel = this.options.widgetModel;
                            if(widgetModel.wType == 'Segment') {
                                $KW.Segment.updateScrollTopOnScroll(widgetModel);
                                $KW.Segment.handleLazyLoadingOnScrollMove(widgetModel);
                            }
                            if(pullDownEl) {
                                if(((this.options.vScroll && this.y > 5) || (this.options.hScroll && this.x > 5)) && !pullDownEl.className.match('flip')) {
                                    pullDownEl.className = 'flip';
                                    pullInitFlag = false;
                                    if(widgetModel.wType == 'CollectionView') {
                                        pullDownEl.children[1] && $KU.removeClassName(pullDownEl.children[1], 'hide');
                                        pullDownEl.children[0] && $KU.addClassName(pullDownEl.children[0], 'hide');
                                    } else {
                                        pullDownEl.querySelector(".pullDownLabel").innerHTML = "Release to refresh..";
                                    }
                                    if(this.options.vScroll)
                                        this.minScrollY = 0;
                                    else
                                        this.minScrollX = 0;
                                } else if(((this.options.vScroll && this.y < 5) || (this.options.hScroll && this.x < 5)) && pullDownEl.className.match('flip')) {
                                    if(this.options.vScroll)
                                        this.minScrollY = -this.pullDownOffset;
                                    else
                                        this.minScrollX = -this.pullDownOffset;
                                }
                            }
                            if(pullUpEl) {
                                if(((this.options.vScroll && this.y < (this.maxScrollY - 5 - this.pullUpOffset)) || (this.options.hScroll && this.x < (this.maxScrollX - 5 - this.pullUpOffset))) && !pullUpEl.className.match('flip')) {
                                    pullUpEl.className = 'flip';
                                    pushInitFlag = false;
                                    if(widgetModel.wType == 'CollectionView') {
                                        pullUpEl.children[1] && $KU.removeClassName(pullUpEl.children[1], 'hide');
                                        pullUpEl.children[0] && $KU.addClassName(pullUpEl.children[0], 'hide');
                                    } else {
                                        pullUpEl.querySelector(".pullUpLabel").innerHTML = "Release to refresh..";
                                    }
                                    if(this.options.vScroll)
                                        this.maxScrollY -= this.pullUpOffset;
                                    else
                                        this.maxScrollX -= this.pullUpOffset;
                                } else if(((this.options.vScroll && this.y > (this.maxScrollY + 5)) || (this.options.hScroll && this.x > (this.maxScrollX + 5))) && pullUpEl.className.match('flip')) {
                                    this.maxScrollY = this.maxScrollY  ;
                                }
                            }
                            if(this.options.widgetModel.wType == 'CollectionView') {
                                var model = $KU.getModelByScroller(this.wrapper.id);
                                var handler = model && $KU.returnEventReference(model.onscrolling);
                                handler && $KU.executeWidgetEventHandler(model, handler);
                                $KW.CollectionView.Animation.handleOnItemDisplay(model);
                            }
                        };
                        onScrollEnd = function() {
                            var pullDownEl = this.options.pullDownEl;
                            var pullUpEl = this.options.pullUpEl;
                            var reachingbeginningoffset = 0;
                            var reachingendoffset = 0;
                            var widgetModel = this.options.widgetModel;
                            if(widgetModel.wType == 'Segment') {
                                $KW.Segment.updateScrollTopOnScroll(widgetModel);
                                $KW.Segment.handleLazyLoadingOnScrollEnd(widgetModel);
                            }
                            if(this.options.widgetModel.wType == 'CollectionView') {
                                var wModel = this.options.widgetModel;
                                if(wModel.layouttype != kony.collectionview.LAYOUT_CUSTOM) {
                                    reachingbeginningoffset = wModel.reachingbeginningoffsetinPX;
                                    reachingendoffset = wModel.reachingendoffsetinPX;
                                } else {
                                    if(this.direction == $KW.touch.TouchContext.UP || this.direction == $KW.touch.TouchContext.DOWN) {
                                        reachingbeginningoffset = wModel.reachingbeginningoffsetV;
                                        reachingendoffset = wModel.reachingendoffsetV;
                                    } else { 
                                        reachingbeginningoffset = wModel.reachingbeginningoffsetH;
                                        reachingendoffset = wModel.reachingendoffsetH;
                                    }

                                }
                            }
                            if(((this.options.vScroll && this.y >= this.minScrollY - reachingbeginningoffset) ||
                                    (this.options.hScroll && this.x >= this.minScrollX - reachingbeginningoffset)) && this.options.pullInitFlag) {
                                var model = $KU.getModelByScroller(this.wrapper.id);
                                if(typeof model === "undefined")
                                    return;
                                
                                if(this.scrollerH > 0) {
                                    kony.web.logger("log", "On Reach beginning");
                                    
                                    var handler = $KU.returnEventReference(model.scrollingevents.onreachingbeginning);
                                    if(model.wType == 'CollectionView') {
                                        if(!this.options.onreachingbeginningVFired || !this.options.onreachingbeginningHFired) {
                                            var scrollDirection = kony.collectionview.SCROLL_DIRECTION_HORIZONTAL;
                                            if(this.direction == $KW.touch.TouchContext.UP || this.direction == $KW.touch.TouchContext.DOWN) {
                                                scrollDirection = kony.collectionview.SCROLL_DIRECTION_VERTICAL;
                                                if(!this.options.onreachingbeginningVFired) {
                                                    if(this.options.vScroll && this.y >= this.minScrollY - reachingbeginningoffset) {
                                                        handler && $KU.executeWidgetEventHandler(model, handler, scrollDirection, model.contentOffsetMeasured);
                                                        this.options.onreachingbeginningVFired = true;
                                                    }
                                                }
                                            } else {
                                                if(!this.options.onreachingbeginningHFired) {
                                                    if(this.options.hScroll && this.x >= this.minScrollX - reachingbeginningoffset) {
                                                        handler && $KU.executeWidgetEventHandler(model, handler, scrollDirection, model.contentOffsetMeasured);
                                                        this.options.onreachingbeginningHFired = true;
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        handler && $KU.executeWidgetEventHandler(model, handler);
                                    }
                                }
                            }
                            if((this.options.vScroll && this.y < this.minScrollY - reachingbeginningoffset) ||
                                (this.options.hScroll && this.x < this.minScrollX - reachingbeginningoffset)) {
                                if(this.direction == $KW.touch.TouchContext.UP || this.direction == $KW.touch.TouchContext.DOWN)
                                    this.options.onreachingbeginningVFired = false;
                                else
                                    this.options.onreachingbeginningHFired = false;
                            }
                            if(pullDownEl && pullDownEl.className.match('flip')) {
                                pullDownEl.className = 'loading';
                                if(widgetModel.wType == 'CollectionView') {
                                    
                                } else {
                                    pullDownEl.querySelector(".pullDownLabel").innerHTML = 'Loading..';
                                }
                                module.pullAction.call(this, "DOWN"); 
                            }

                            if(((this.options.vScroll && this.y <= this.maxScrollY + reachingendoffset) ||
                                    (this.options.hScroll && this.x <= this.maxScrollX + reachingendoffset)) && this.options.pushInitFlag) {
                                var model = $KU.getModelByScroller(this.wrapper.id);
                                if(typeof model === "undefined")
                                    return;
                                
                                if((this.options.vScroll && Math.abs(this.y) >= 20) || (this.options.hScroll && Math.abs(this.x) >= 20)) {
                                    kony.web.logger("log", "On Reach end");
                                    
                                    var handler = $KU.returnEventReference(model.scrollingevents.onreachingend);
                                    if(model.wType == 'CollectionView') {
                                        if(!this.options.onreachingendVFired || !this.options.onreachingendHFired) {
                                            var scrollDirection = kony.collectionview.SCROLL_DIRECTION_HORIZONTAL;
                                            if(this.direction == $KW.touch.TouchContext.UP || this.direction == $KW.touch.TouchContext.DOWN) {
                                                scrollDirection = kony.collectionview.SCROLL_DIRECTION_VERTICAL;
                                                if(!this.options.onreachingendVFired) {
                                                    if(this.options.vScroll && this.y <= this.maxScrollY + reachingendoffset) {
                                                        handler && $KU.executeWidgetEventHandler(model, handler, scrollDirection, model.contentOffsetMeasured);
                                                        this.options.onreachingendVFired = true;
                                                    }
                                                }
                                            } else {
                                                if(!this.options.onreachingendHFired) {
                                                    if(this.options.hScroll && this.x <= this.maxScrollX + reachingendoffset) {
                                                        handler && $KU.executeWidgetEventHandler(model, handler, scrollDirection, model.contentOffsetMeasured);
                                                        this.options.onreachingendHFired = true;
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        handler && $KU.executeWidgetEventHandler(model, handler);
                                    }
                                }
                            }
                            if((this.options.vScroll && this.y > this.maxScrollY + reachingendoffset) ||
                                (this.options.hScroll && this.x > this.maxScrollX + reachingendoffset)) {
                                if(this.direction == $KW.touch.TouchContext.UP || this.direction == $KW.touch.TouchContext.DOWN)
                                    this.options.onreachingendVFired = false;
                                else
                                    this.options.onreachingendHFired = false;
                            }
                            if(pullUpEl && pullUpEl.className.match('flip')) {
                                pullUpEl.className = 'loading';
                                if(widgetModel.wType == 'CollectionView') {
                                    
                                } else {
                                    pullUpEl.querySelector(".pullUpLabel").innerHTML = 'Loading..';
                                }
                                module.pullAction.call(this, "UP"); 
                            }

                            
                            if(!this.options.pullInitFlag)
                                this.options.pullInitFlag = true;
                            if(!this.options.pushInitFlag)
                                this.options.pushInitFlag = true;
                            if(this.options.widgetModel.wType == 'CollectionView') {
                                var model = $KU.getModelByScroller(this.wrapper.id);
                                var handler = model && $KU.returnEventReference(model.onscrollend);
                                handler && $KU.executeWidgetEventHandler(model, handler);
                            }

                        };
                        if(widgetModel.wType == 'CollectionView') {
                            _setOnScrollTouchReleased(widgetModel, options);
                            _setOnScrollStart(widgetModel, options);
                        } else if(widgetModel.wType == 'Segment') {
                            options.onScrollStart = onScrollStart;
                        }
                        
                        $KU.extend(options, {
                            topOffset: pullDownOffset,
                            bottomOffset: pullUpOffset,
                            onRefresh: onRefresh,
                            onScrollMove: onScrollMove,
                            onScrollEnd: onScrollEnd,
                            pullDownEl: pullDownEl,
                            pullUpEl: pullUpEl,
                            pullInitFlag: pullInitFlag,
                            pushInitFlag: pushInitFlag
                        });
                    }
                }

                
                if(widgetType == "vbox") 
                    options.onBeforeScrollStart = module.onBeforeScrollStartHandler();

                
                if(formModel && typeof(formModel.useTransform) == 'boolean')
                    options.useTransform = formModel.useTransform;

                var selects = document.querySelectorAll("#" + $KG["__currentForm"].id + " select");
                if(selects.length > 0 && widgetType == "form") {
                    
                    options.useTransform = false;
                }

                if((type == "ScrollBox" && $KW.FlexUtils.isFlexContainer(formModel)) || $KW.FlexUtils.isFlexContainer(formModel) || (type == "FlexScrollContainer" && (widgetModel.parent.wType === "FlexScrollContainer" || widgetModel.parent.wType == "FlexContainer"))) {
                    options.bubbleEvents = true;
                }

                
                var scrollerInstance = new $KW.touch.konyScroller(_scrollerDOMNode, options);


                if(widgetType == "form") {
                    var headerId = $KG.allforms[scrollerId].header;
                    var footerId = $KG.allforms[scrollerId].footer;

                    
                    $KG.allforms[scrollerId].scrollerTimer = setInterval(function(sID) {
                        return function() {
                            module.checkDOMChanges(sID + "_scroller", headerId, footerId);
                        };
                    }(scrollerId), 1000);

                }

                if(swipeDirection == "horizontal" || swipeDirection == "both") {
                    if(_scrollerDOMNode.children[0].scrollWidth != 0) {
                        _scrollerDOMNode.children[0].style.width = _scrollerDOMNode.children[0].scrollWidth + "px";
                        scrollerInstance.refresh();
                    }
                }
                if(type == 'CollectionView' && (swipeDirection == "vertical" || swipeDirection == "both") && scrollHeight != 0) {
                    if(_scrollerDOMNode.children[0].scrollHeight != 0) {
                        _scrollerDOMNode.children[0].style.height = _scrollerDOMNode.children[0].scrollHeight + "px";
                        scrollerInstance.refresh();
                    }
                }

                if(type == "FlexScrollContainer" || (type == 'Form' && $KW.FlexUtils.isFlexContainer(widgetModel))) {
                    var scrollHeight;
                    if(type == 'Form') {
                        $KW.Form.setFormDimensions(widgetModel);
                        var formNode = document.getElementById(widgetModel.id);
                        scrollHeight = formNode.scrollHeight;
                    } else {
                        var contentNode, pushNode;
                        var sEvents = widgetModel.scrollingevents;
                        var scrolldirection = $KW.stringifyScrolldirection[widgetModel.scrolldirection];
                        contentNode = _scrollerDOMNode.children[0].children[0];
                        if(sEvents) {
                            if(sEvents.onpull) {
                                contentNode = _scrollerDOMNode.children[0].children[1];
                            }
                            if(sEvents.onpull && sEvents.onpush) {
                                pushNode = _scrollerDOMNode.children[0].children[2]
                            }
                            else if(sEvents.onpush) {
                              pushNode = _scrollerDOMNode.children[0].children[1];
                            }
                        }

                        scrollHeight = contentNode.scrollHeight;
                        
                        if(options.hScroll == true) {
                            contentNode.style.width = _scrollerDOMNode.clientWidth + "px";
                        }
                        contentNode.style.height = _scrollerDOMNode.clientHeight + "px";
                        contentNode.style.flexShrink = 0;
                        if(pushNode) {
                            if(scrolldirection == "vertical") {
                                pushNode.style.marginTop = contentNode.scrollHeight -contentNode.offsetHeight + "px"
                            }
                            else {
                                pushNode.style.marginLeft = contentNode.scrollWidth - contentNode.offsetWidth + "px"
                            }
                        }

                    }

                    if((swipeDirection == "vertical" || swipeDirection == "both") && scrollHeight != 0) {
                        var parentModel = widgetModel.parent;
                        if(!parentModel || (parentModel && parentModel.wType !== "FlexScrollContainer" && parentModel.wType !== "FlexContainer"))
                            _scrollerDOMNode.children[0].style.height = scrollHeight + "px";
                        scrollerInstance.refresh();
                    }
                    $KW.FlexScrollContainer.setContentOffSet(widgetModel, widgetModel.contentoffset, 0, scrollerInstance);
                    widgetModel.scrollerInstance = scrollerInstance;
                }

                
                $KG[scrollerId + '_scroller'] = scrollerInstance;
            }
        },


        
        initializeFlexScrollEvents: function(widgetModel, options) {


            var scrollingEvents = widgetModel.scrollingevents;

            var pullDownEl, pullUpEl, pullInitFlag, pushInitFlag;
            var pullDownOffset = 0,
                pullUpOffset = 0;
            var onRefresh = "",
                onScrollStart = "",
                onScrollMove = "",
                onScrollEnd = "";
            var widgetNode = $KU.getNodeByModel(widgetModel);
            var pullDownId = "#" + $KW.Utils.getKMasterWidgetID(widgetModel) + "_pullDown";
            var pullUpId = "#" + $KW.Utils.getKMasterWidgetID(widgetModel) + "_pullUp";
            var scrolldirection = $KW.stringifyScrolldirection[widgetModel.scrolldirection];

            pullDownEl = document.querySelector(pullDownId);
            pullUpEl = document.querySelector(pullUpId);

            if(scrolldirection == "horizontal") {
                pullDownEl && (pullDownOffset = pullDownEl.offsetWidth);
                pullUpEl && (pullUpOffset = pullUpEl.offsetWidth);
            } else {
                pullDownEl && (pullDownOffset = pullDownEl.offsetHeight);
                pullUpEl && (pullUpOffset = pullUpEl.offsetHeight);
            }




            !scrollingEvents.onpull && (pullInitFlag = true);
            !scrollingEvents.onpush && (pushInitFlag = true);

            onRefresh = function() {
                var pullDownEl = this.options.pullDownEl;
                var pullUpEl = this.options.pullUpEl;
                var widgetModel = this.options.widgetModel;
                var contentNode =$KU.getNodeByModel(widgetModel);
                if(pullDownEl && pullDownEl.className.match('loading')) {
                    pullDownEl.className = '';
                    if(widgetModel._pullPreference == "text") {
                        var pullText = widgetModel.pullkey || "Pull to refresh" ;
                        pullDownEl.querySelector(".pullDownLabel").innerHTML = pullText;
                    }

                } else if(pullUpEl && pullUpEl.className.match('loading')) {
                    pullUpEl.className = '';
                    if(widgetModel._pushPreference == "text") {
                        var pushText = widgetModel.pushkey || "Push to refresh" ;
                        pullUpEl.querySelector(".pullUpLabel").innerHTML = pushText;
                    }

                }
                if(pullUpEl) {
                    pullUpEl.style.marginTop = contentNode.scrollHeight - contentNode.offsetHeight + "px";
                }
            };

            onScrollMove = function() {
                var options = this.options;
                options.widgetModel.contentoffset = {
                    x: -this.x,
                    y: -this.y
                };
                options.widgetModel.onscrolling && $KU.executeWidgetEventHandler(options.widgetModel, options.widgetModel.onscrolling);

                var pullDownEl = this.options.pullDownEl;
                var pullUpEl = this.options.pullUpEl;
                var widgetModel = this.options.widgetModel;

                if(pullDownEl) {
                    if(((this.options.vScroll && this.y > 5) || (this.options.hScroll && this.x > 5)) && !pullDownEl.className.match('flip')) {
                        pullDownEl.className = 'flip';
                        pullInitFlag = false;
                        if(widgetModel._pullPreference == "text") {
                            var releasetext = widgetModel.releasepullkey || "Release to refresh";
                            pullDownEl.querySelector(".pullDownLabel").innerHTML = releasetext;
                        }

                        if(this.options.vScroll)
                            this.minScrollY = 0;
                        else
                            this.minScrollX = 0;
                    } else if(((this.options.vScroll && this.y < 5) || (this.options.hScroll && this.x < 5)) && pullDownEl.className.match('flip')) {
                        if(this.options.vScroll)
                            this.minScrollY = -this.pullDownOffset;
                        else
                            this.minScrollX = -this.pullDownOffset;
                    }
                }
                if(pullUpEl) {
                    if(((this.options.vScroll && this.y < (this.maxScrollY - 5 - this.pullUpOffset)) || (this.options.hScroll && this.x < (this.maxScrollX - 5 - this.pullUpOffset))) && !pullUpEl.className.match('flip')) {
                        pullUpEl.className = 'flip';
                        pushInitFlag = false;
                        if(widgetModel._pushPreference == "text") {
                            var releasetext = widgetModel.releasepushkey || "Release to refresh";
                            pullUpEl.querySelector(".pullUpLabel").innerHTML = releasetext;
                        }

                        if(this.options.vScroll)
                            this.maxScrollY -= this.pullUpOffset;
                        else
                            this.maxScrollX -= this.pullUpOffset;
                    } else if(((this.options.vScroll && this.y > (this.maxScrollY + 5)) || (this.options.hScroll && this.x > (this.maxScrollX + 5))) && pullUpEl.className.match('flip')) {
                        this.maxScrollY = this.maxScrollY  ;
                    }
                }
            };

            onScrollEnd = function() {
                var options = this.options;
                options.widgetModel.contentoffset = {
                    x: -this.x,
                    y: -this.y
                };
                options.widgetModel.onscrollend && $KU.executeWidgetEventHandler(options.widgetModel, options.widgetModel.onscrollend);

                var pullDownEl = this.options.pullDownEl;
                var pullUpEl = this.options.pullUpEl;
                var reachingbeginningoffset = 0;
                var reachingendoffset = 0;
                var widgetModel = this.options.widgetModel;

                if(((this.options.vScroll && this.y >= this.minScrollY - reachingbeginningoffset) ||
                        (this.options.hScroll && this.x >= this.minScrollX - reachingbeginningoffset)) && this.options.pullInitFlag) {

                    if(this.scrollerH > 0) {
                        kony.web.logger("log", "On Reach beginning");
                        var handler = $KU.returnEventReference(widgetModel.scrollingevents.onreachingbeginning);
                        handler && $KU.executeWidgetEventHandler(widgetModel, handler);
                    }
                }

                if((this.options.vScroll && this.y < this.minScrollY - reachingbeginningoffset) ||
                    (this.options.hScroll && this.x < this.minScrollX - reachingbeginningoffset)) {
                    if(this.direction == $KW.touch.TouchContext.UP || this.direction == $KW.touch.TouchContext.DOWN)
                        this.options.onreachingbeginningVFired = false;
                    else
                        this.options.onreachingbeginningHFired = false;
                }
                if(pullDownEl && pullDownEl.className.match('flip')) {
                    pullDownEl.className = 'loading';
                    module.pullAction.call(this, "DOWN"); 
                }

                if(((this.options.vScroll && this.y <= this.maxScrollY + reachingendoffset) ||
                        (this.options.hScroll && this.x <= this.maxScrollX + reachingendoffset)) && this.options.pushInitFlag) {
                    if((this.options.vScroll && Math.abs(this.y) >= 20) || (this.options.hScroll && Math.abs(this.x) >= 20)) {
                        kony.web.logger("log", "On Reach end");
                        
                        var handler = $KU.returnEventReference(widgetModel.scrollingevents.onreachingend);
                        handler && $KU.executeWidgetEventHandler(widgetModel, handler);

                    }
                }
                if((this.options.vScroll && this.y > this.maxScrollY + reachingendoffset) ||
                    (this.options.hScroll && this.x > this.maxScrollX + reachingendoffset)) {
                    if(this.direction == $KW.touch.TouchContext.UP || this.direction == $KW.touch.TouchContext.DOWN)
                        this.options.onreachingendVFired = false;
                    else
                        this.options.onreachingendHFired = false;
                }
                if(pullUpEl && pullUpEl.className.match('flip')) {
                    pullUpEl.className = 'loading';
                    module.pullAction.call(this, "UP"); 
                }

                
                if(!this.options.pullInitFlag)
                    this.options.pullInitFlag = true;
                if(!this.options.pushInitFlag)
                    this.options.pushInitFlag = true;
            };

            
            $KU.extend(options, {
                topOffset: pullDownOffset,
                bottomOffset: pullUpOffset,
                onRefresh: onRefresh,
                onScrollMove: onScrollMove,
                onScrollEnd: onScrollEnd,
                pullDownEl: pullDownEl,
                pullUpEl: pullUpEl,
                pullInitFlag: pullInitFlag,
                pushInitFlag: pushInitFlag
            });


        },

        initializeNativeScroller: function(widgetModel, _scrollerDOMNode) {
            var overflowX, overflowY;
            var scrollerStyle = _scrollerDOMNode.style;
            
            if($KW.FlexUtils.isFlexContainer(widgetModel) && !widgetModel.enableScrolling) {
                scrollerStyle.overflow = "hidden";
                return;
            }
            var direction = widgetModel.needScroller ? 2 : widgetModel.scrollDirection;
            switch(direction) {
                case 1:
                    overflowX = "auto";
                    overflowY = "hidden";
                    break;
                case 2:
                    overflowX = "hidden";
                    overflowY = "auto";
                    break;
                case 3:
                    overflowX = "auto";
                    overflowY = "auto";
                    break;
                case 4:
                    overflowX = "hidden";
                    overflowY = "hidden";
                default:
                    overflowX = "";
                    overflowY = "";
            }
            scrollerStyle.overflowX = overflowX;
            scrollerStyle.overflowY = overflowY;
            scrollerStyle['-webkit-overflow-scrolling'] = 'touch';
        },

        destroyFormScroller: function(formId) {
            if($KG["stickyScroll"]) {
                var scrollerInstance = $KG[formId + '_scroller'];
                scrollerInstance && scrollerInstance.destroy();
                $KG[formId + '_scroller'] = "";
            }

            var scrollerNodes = document.querySelectorAll("#" + formId + "[kwidgettype='KFormScroller'] ,#" + formId + " div[kwidgettype='KFormScroller']")
            for(var i = 0; i < scrollerNodes.length; i++) {
                module.destroyInstance(scrollerNodes[i]);
            }
        },

        destroyScrollBoxes: function(formId) {
            var scrollerNodes = document.querySelectorAll("#" + formId + " div[kwidgettype='KScrollBox']")
            for(var i = 0; i < scrollerNodes.length; i++) {
                module.destroyInstance(scrollerNodes[i]);
            }
        },

        destroyCollectionViewScroller: function(formId) {
            var scrollerNodes = document.querySelectorAll("#" + formId + " div[kwidgettype='KCollectionView']")
            for(var i = 0; i < scrollerNodes.length; i++) {
                module.destroyInstance(scrollerNodes[i]);
            }
        },


        destroyInstance: function(scrollerNode) {
            if(!scrollerNode) {
                kony.web.logger("warn", "it should not happen");
                return;
            }
            var _scrollerId = scrollerNode.id;
            var scrollerInstance = $KG[_scrollerId];
            scrollerInstance && scrollerInstance.destroy();
            $KG[_scrollerId] = "";
        },

        destroyImageStripStripViews: function(formId) {
            var stripNodes = document.querySelectorAll("#" + formId + " div[name='ImageStrip_StripView']");
            for(var i = 0; i < stripNodes.length; i++) {
                var widgetModel = $KU.getModelByNode(stripNodes[i]);
                if(widgetModel) {
                    var scrollerInstance = widgetModel.scrollInstance;
                    if(scrollerInstance) {
                        scrollerInstance.destroy();
                        
                        widgetModel.scrollInstance = null;
                    }
                }
            }
        },

        initializePageViews: function(formId) {
            
            if($KG["disableTransition"])
                return;
            var swipeElements = document.querySelectorAll("#" + formId + " div[name='touchcontainer_HStrip'], #" + formId + " div[name='touchcontainer_Segment']");
            for(var i = 0; i < swipeElements.length; i++) {
                var swipeElement = swipeElements[i];
                var widgetModel = $KU.getModelByNode(swipeElement);
                
                var options = {};
                options.widgetModel = widgetModel;
                options.bounce = widgetModel.enableScrollBounce;
                options.hBounce = widgetModel.enableScrollBounce;
                var formModel = $KG.allforms[formId];
                var type = widgetModel.wType;
                if((type == "ScrollBox" && $KW.FlexUtils.isFlexContainer(formModel)) || $KW.FlexUtils.isFlexContainer(formModel) || (type == "FlexScrollContainer" && (widgetModel.parent.wType === "FlexScrollContainer" || widgetModel.parent.wType == "FlexContainer"))) {
                    options.bubbleEvents = true;
                }
                var pScrollerInstance = new $KW.touch.pageviewScroller(swipeElement, options);
                $KG[swipeElement.id] = pScrollerInstance;
            }
        },

        destroyPageViews: function(formId) {
            var scrollerNodes = document.querySelectorAll("#" + formId + " div[name='touchcontainer_HStrip'], #" + formId + " div[name='touchcontainer_Segment']");
            for(var i = 0; i < scrollerNodes.length; i++) {
                module.destroyInstance(scrollerNodes[i]);
            }
        },

        checkDOMChanges: function(_scrollerId, headerId, footerId) {
            var headerNode = document.getElementById(headerId);
            var footerNode = document.getElementById(footerId);
            var appmenuNode = document.getElementById("konyappmenudiv");

            var formModel = $KG.allforms[_scrollerId.split("_")[0]];
            var heightChanged = false;

            if(headerNode && (this.headerH != headerNode.offsetHeight) && formModel.dockableheader) {
                var _scrollerDOMNode = document.getElementById(_scrollerId);
                var scrollerInstance = $KG[_scrollerId];

                if(_scrollerDOMNode && scrollerInstance) {
                    this.headerH = headerNode.offsetHeight;
                    _scrollerDOMNode.style.top = headerNode.offsetHeight + "px";
                    scrollerInstance.refresh();
                    module.setSLWHeight(formModel, _scrollerDOMNode);
                    heightChanged = true;
                }
            }
            if(footerNode && (this.footerH != footerNode.offsetHeight) && formModel.dockablefooter) {
                var _scrollerDOMNode = document.getElementById(_scrollerId);
                var scrollerInstance = $KG[_scrollerId];

                if(_scrollerDOMNode && scrollerInstance) {
                    this.footerH = footerNode.offsetHeight;
                    _scrollerDOMNode.style.bottom = footerNode.offsetHeight + "px";
                    scrollerInstance.refresh();
                    module.setSLWHeight(formModel, _scrollerDOMNode);
                    heightChanged = true;
                }
            }
            if(formModel.wType != "Popup" && appmenuNode && (this.appmenuH != appmenuNode.offsetHeight) && formModel.dockableappmenu) {
                var _scrollerDOMNode = document.getElementById(_scrollerId);
                var scrollerInstance = $KG[_scrollerId];

                if(_scrollerDOMNode && scrollerInstance) {
                    this.appmenuH = appmenuNode.offsetHeight;
                    _scrollerDOMNode.style.bottom = appmenuNode.offsetHeight + "px";
                    scrollerInstance.refresh();
                    module.setSLWHeight(formModel, _scrollerDOMNode);
                    heightChanged = true;
                }
            }
            
            if(formModel.wType == 'Form' && $KW.FlexUtils.isFlexContainer(formModel)) {
                var _scrollerDOMNode = document.getElementById(_scrollerId);
                var formNode = document.getElementById(formModel.id);
                if(formNode && formNode.clientHeight != _scrollerDOMNode.clientHeight) {
                    formNode.style.height = _scrollerDOMNode.clientHeight + 'px';
                    $KU.needOptimization = false;
                    formModel.forceLayout();
                    $KU.needOptimization = true;
                }
            }

            heightChanged && $KW.ScrollBox.adjustBoxDimensions(formModel.id);

            if(!$KG["nativeScroll"] && $KU.isIOS7) {
                if(!$KG.activeInput && window.pageYOffset > 0) {
                    window.scrollTo(0, 0);
                }

                
                if($KG["__currentForm"] && $KG["__orientation"] == "landscape" && !$KG.activeInput) {
                    var main = $KU.getElementById($KG["__currentForm"].id + "_container");
                    if(main && main.offsetHeight > window.innerHeight) {
                        main.style.height = window.innerHeight + "px";
                        var scrollerInstance = $KG[_scrollerId];
                        scrollerInstance.refresh();
                        $KW.ScrollBox.adjustBoxDimensions(_scrollerId);
                        var popup = document.querySelector("div[class~='popupmain']");
                        if(popup) {
                            var id = popup.id;
                            popup = popup.children[1];
                            var model = window[id.substr(0, id.indexOf("_"))];
                            if(model && model.wType == 'Popup') {
                                var scrollModel = window[scrollerInstance.options.formid];
                                if(scrollModel) {
                                    scrollerInstance = (scrollModel.wType == 'Form') ? $KG[model.id + "_scroller"] : $KG[$KG["__currentForm"].id + "_scroller"];
                                    scrollerInstance && scrollerInstance.refresh();
                                }
                                $KW.Popup.adjustPopupDimensions(model, popup);
                            }
                        }
                        var _scrollerDOMNode = document.getElementById(_scrollerId);
                        if(_scrollerDOMNode) {
                            module.setSLWHeight(formModel, _scrollerDOMNode, true);
                        }
                    }
                }
            }
            if($KG._domchanges) {
                $KU.onEventHandler();
                $KG._domchanges = false;
            }
        },

        setSLWHeight: function(formModel, _scrollerDOMNode, needRefresh) {
            var slwModel = $KU.getScreenLevelWidgetModel(formModel);
            if(slwModel) {
                var sLWidget = $KU.getNodeByModel(slwModel);
                if(sLWidget) {
                    
                    var segPageViewFooterHeight = 0;
                    
                    if(slwModel.wType == 'Segment') {
                        sLWidget = sLWidget.parentNode.parentNode;
                        segPageViewFooterHeight = (slwModel.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW) ? (slwModel.needpageindicator ? sLWidget.nextSibling.offsetHeight : 0) : 0;
                    }
                    
                    var formScroller = document.getElementById(formModel.id + "_scroller");
                    sLWidget.style.height = (formScroller.offsetHeight - segPageViewFooterHeight) + 'px';
                    
                    if(!$KG["nativeScroll"] && $KU.isIOS7 && needRefresh) {
                        var scrollerInstance = $KG[sLWidget.id];
                        scrollerInstance && scrollerInstance.refresh();
                    }
                }
            }
        },

        setHeight: function(scrollerId, nativeScroll) {
            

            var _scrollerDOMNode;
            if(nativeScroll)
                _scrollerDOMNode = document.getElementById(scrollerId);
            else
                _scrollerDOMNode = document.getElementById(scrollerId + "_scroller");
            if(!_scrollerDOMNode)
                return;

            this.headerH = 0;
            this.footerH = 0;
            this.appmenuH = 0;


            var formModel = $KG.allforms[scrollerId];
            var headerId = formModel.header;
            var footerId = formModel.footer;
            var appmenuId = "konyappmenudiv";

            header = $KG.needScroller ? $KU.getElementById(scrollerId + "_header") : $KU.getElementById("header_container");
            footer = $KG.needScroller ? $KU.getElementById(scrollerId + "_footer") : $KU.getElementById("footer_container");

            var appmenu = document.getElementById(appmenuId);

            if(header && formModel.dockableheader)
                this.headerH = header.offsetHeight;

            if(formModel.wType != "Popup" && appmenu && formModel.dockableappmenu) {
                this.appmenuH = appmenu.offsetHeight;
            }
            if(footer && formModel.dockablefooter) {
                this.footerH = footer.offsetHeight;
                footer.style.bottom = this.appmenuH + "px";
            }

            _scrollerDOMNode.style.top = this.headerH + 'px';
            _scrollerDOMNode.style.bottom = this.footerH + this.appmenuH + 'px';
            $KW.Form.setFormDimensions(formModel);

            module.setSLWHeight(formModel, _scrollerDOMNode);

            nativeScroll && (_scrollerDOMNode.style.paddingBottom = this.footerH + this.appmenuH + 'px');

            $KW.ScrollBox.adjustBoxDimensions(formModel.id)
        },

        onBeforeScrollStartHandler: function() {
            return function(e) {
                
                kony.events.stopPropagation(e); 
            }
        },

        pullAction: function(dir) {
            var that = this;
            that.refreshDisabled = true;
            setTimeout(function() {
                var model = $KU.getModelByScroller(that.wrapper.id);
                if(typeof model === "undefined")
                    return;
                
                if(model.scrollingevents) {
                    var handler;
                    if(dir == "UP") {
                        kony.web.logger("log", "On Push");
                        handler = $KU.returnEventReference(model.scrollingevents.onpush);
                        if(model.wType === 'Segment') {
                            $KAR && $KAR.sendRecording(model, 'push', {'eventType': 'uiAction'});
                        }
                    } else {
                        kony.web.logger("log", "On Pull");
                        handler = $KU.returnEventReference(model.scrollingevents.onpull);
                        if(model.wType === 'Segment') {
                            $KAR && $KAR.sendRecording(model, 'pull', {'eventType': 'uiAction'});
                        }
                    }
                    handler && $KU.executeWidgetEventHandler(model, handler);
                    that.refreshDisabled = false;
                }
                that.refresh();
            }, 500);
        }
    };


    return module;
}());
