
$KW.touch = (function() {
    
    

    var module = {
        
        computeSnapWidths: function(formId, widgetType, initialize) {
            
            var swipeElements = document.querySelectorAll("#" + formId + " div[name='touchcontainer_" + widgetType + "']");
            for(var i = 0; i < swipeElements.length; i++) {
                var swipeElement = swipeElements[i];
                var widgetModel = $KU.getModelByNode(swipeElement);
                module.computeWidths(swipeElement, widgetModel);
            }
        },

        computeWidths: function(swipeElement, widgetModel) {
            var imgsElement = swipeElement.children[0];
            var slides = imgsElement.children;
            var noOfSwipePages = slides.length;
            imgsElement.style.width = noOfSwipePages * 100 + "%";
            var widthRatio = 0;
            var IMG_WIDTH = 0;
            var percent = 100 / noOfSwipePages;

            if(slides.length > 0) {
                for(var j = 0; j < slides.length; j++) {
                    slides[j].style.display = "inline";


                    if(widgetModel.wType == "Segment") {
                        slides[j].style.width = percent + "%"; 
                    } else {
                        slides[j].style.width = Math.floor(slides[j].offsetWidth / noOfSwipePages) + 'px';
                    }
                }
                slides[0].style.display = "block";
                IMG_WIDTH = slides[0].offsetWidth;
            }

            if(window.orientation === 90 || window.orientation === -90) { 
                widthRatio = IMG_WIDTH / screen.height;
            } else if(window.orientation === 0 || window.orientation === 180) { 
                widthRatio = IMG_WIDTH / screen.width;
            }
            swipeElement.setAttribute("imageWidth", IMG_WIDTH);
            swipeElement.setAttribute("ratio", widthRatio);

            
            if(!widgetModel.swipeContext) widgetModel.swipeContext = {};
            var swipeContext = widgetModel.swipeContext;
            swipeContext.imageWidth = IMG_WIDTH;
            swipeContext.widthRatio = widthRatio;
            swipeContext.wType = widgetModel.wType;

            if(widgetModel.focusedindex) {
                if(widgetModel.wType === "Segment") {
                    swipeContext.currentPage = widgetModel.focusedindex - IndexJL;
                } else {
                    swipeContext.currentPage = Math.ceil(widgetModel.focusedindex / widgetModel.recperpage) - IndexJL;
                }
            } else {
                swipeContext.currentPage = 0;
            }


            module.scrollImages(imgsElement, swipeContext.imageWidth * swipeContext.currentPage, $KU.swipeDuration, true);
            module.updatePageIndicator(swipeElement, swipeContext, widgetModel);
            if(widgetModel.wType == 'Segment') {
                module.updateFocusedIndex(widgetModel);
            }
        },

        updateFocusedIndex: function(widgetModel, dir) {
            
            widgetModel.focusedindex = widgetModel.swipeContext.currentPage + IndexJL;
            widgetModel.focuseditem = (widgetModel.data && widgetModel.data[widgetModel.focusedindex]) || (widgetModel.masterdata && widgetModel.masterdata[widgetModel.focusedindex]);
            if(widgetModel.wType == 'Segment') {
                widgetModel.selecteditems = (IndexJL) ? [null, widgetModel.focuseditem] : [widgetModel.focuseditem];
            }

            if(dir && widgetModel.ongesture) {
                var ongestureEventHandler = $KU.returnEventReference(widgetModel.ongesture);
                var gesturecode = (dir == "next" ? 1 : (dir == "previous" ? 2 : -1));
                $KU.executeWidgetEventHandler(widgetModel, ongestureEventHandler);
            }
        },

        updatePageIndicator: function(touchContainerElement, swipeContext, widgetModel) {
            var index = swipeContext.currentPage;
            var navTable = kony.utils.getElementById(touchContainerElement.id + "_footer");
            if(navTable && navTable.childNodes[0]) {
                var row = navTable.childNodes[0];
                var cell = row.childNodes[0];
                var spans = cell.childNodes;
                for(var j = 0; j < spans.length; j++) {
                    var img = spans[j].childNodes[0];
                    var src = (j == index) ? (widgetModel.pageondotimage ? widgetModel.pageondotimage : "whitedot.gif") : (widgetModel.pageoffdotimage ? widgetModel.pageoffdotimage : "blackdot.gif");
                    if(img.src && img.src.substring(img.src.lastIndexOf("/") + 1) == src) continue;
                    img.src = $KU.getImageURL(src);
                }
            }
            (widgetModel.wType == "HStrip") && module.updateArrows(touchContainerElement, swipeContext, widgetModel);
        },

        updateArrows: function(swipeElement, swipeContext, widgetModel) {
            var arrows = swipeElement.childNodes[1];
            if(arrows) {
                var leftImg = arrows.childNodes[0];
                var rightImg = arrows.childNodes[1];
                var noOfImgs = swipeElement.childNodes[0].childNodes.length;
                if(swipeContext.currentPage == IndexJL)
                    leftImg.style.display = "none";
                else
                    leftImg.style.display = "";
                if(swipeContext.currentPage == (IndexJL ? noOfImgs : noOfImgs - 1))
                    rightImg.style.display = "none";
                else
                    rightImg.style.display = "";
            }

        },

        previousPage: function(src) {
            var wType = src.parentNode.getAttribute("wType");
            var widgetID = src.id.substr(0, src.id.lastIndexOf('_'));
            var node = (wType == "HStrip") ? src.parentNode.parentNode : document.getElementById(widgetID);
            var wModel = $KU.getModelByNode(node);
            var scroller = src.parentNode.parentNode.childNodes[1];
            var vScroll = src.childNodes[0].getAttribute("type") == "VImg" ? true : false;
            var sInstance = wModel.scrollInstance || $KG[scroller.id];
            if(sInstance) {
                var scrolle = scroller.childNodes[0];
                if(vScroll) {
                    var y = Math.abs(sInstance.y) < scroller.clientHeight ? 0 : (sInstance.y + scroller.clientHeight);
                    sInstance.animateTo(0, y);
                } else {
                    var x = Math.abs(sInstance.x) < scroller.clientWidth ? 0 : (sInstance.x + scroller.clientWidth);
                    sInstance.animateTo(x, 0);
                }
            }
        },

        nextPage: function(src) {
            var wType = src.parentNode.getAttribute("wType");
            var widgetID = src.id.substr(0, src.id.lastIndexOf('_'));
            var node = (wType == "HStrip") ? src.parentNode.parentNode : document.getElementById(widgetID);
            var wModel = $KU.getModelByNode(node);
            var scroller = src.parentNode.parentNode.childNodes[1];
            var vScroll = src.childNodes[0].getAttribute("type") == "VImg" ? true : false;
            var sInstance = wModel.scrollInstance || $KG[scroller.id];
            if(sInstance) {
                var scrolle = scroller.childNodes[0];
                scrolle.style[$KU.transition] = $KU.cssPrefix + "transform " + "0.5s ";
                if(vScroll) {
                    var delta = scrolle.clientHeight - Math.abs(sInstance.y) - scroller.clientHeight;
                    var y = delta < scroller.clientHeight ? (sInstance.y - delta) : (sInstance.y - scroller.clientHeight);
                    sInstance.animateTo(0, y);
                } else {
                    var delta = scrolle.clientWidth - Math.abs(sInstance.x) - scroller.clientWidth;
                    var x = delta < scroller.clientWidth ? (sInstance.x - delta) : (sInstance.x - scroller.clientWidth);
                    sInstance.animateTo(x, 0);
                }
            }
        },

        fadeHImages: function(boxModel) {
            var style = "display:none;";
            var leftSrc = $KU.getImageURL(boxModel.leftarrowimage);
            var rightSrc = $KU.getImageURL(boxModel.rightarrowimage);
            var wID = $KW.Utils.getKMasterWidgetID(boxModel);

            var str = "<div id='" + wID + "_scrollFades_H' class='scroll_view' wType='" + boxModel.wType + "'>" +
                "<div id='" + wID + "_leftimg' class='scroll_fades leftfade' style='" + style + "'" + (($KU.isBlackBerryNTH || ($KU.isWindowsPhone && $KU.isIE9)) ? " onclick='module.previousPage(this)'" : "") +
                "><img type='HImg' src='" + leftSrc + "' onload='module.setHeight(this)' >" +
                "</div>" +
                "<div id='" + wID + "_rightimg' class='scroll_fades rightfade' style='" + style + "'" + (($KU.isBlackBerryNTH || ($KU.isWindowsPhone && $KU.isIE9)) ? " onclick='module.nextPage(this)'" : "") + "><img type='HImg' src='" + rightSrc + "' onload='module.setHeight(this)' >" +
                "</div>" +
                "</div>";
            return str;
        },

        fadeVImages: function(boxModel) {
            var style = "display:none;";
            var topSrc = $KU.getImageURL(boxModel.toparrowimage);
            var bottomSrc = $KU.getImageURL(boxModel.bottomarrowimage);
            var wID = $KW.Utils.getKMasterWidgetID(boxModel);
            var str = "<div id='" + wID + "_scrollFades_V' class='scroll_view' style='height:inherit;' wType='" + boxModel.wType + "'>" +
                "<div id='" + wID + "_topimg' class='scroll_fades topfade' style='" + style + "'" + (($KU.isBlackBerryNTH || ($KU.isWindowsPhone && $KU.isIE9)) ? " onclick='module.previousPage(this)'" : "") +
                "><img type='VImg' src='" + topSrc + "' onload='module.setHeight(this)' >" +
                "</div>" +
                "<div id='" + wID + "_bottomimg' class='scroll_fades bottomfade' style='" + style + "'" + (($KU.isBlackBerryNTH || ($KU.isWindowsPhone && $KU.isIE9)) ? " onclick='module.nextPage(this)'" : "") +
                "><img type='VImg' src='" + bottomSrc + "' onload='module.setHeight(this)' >" +
                "</div>" +
                "</div>";
            return str;
        },

        setHeight: function(src) {
            var parentDiv = src.parentNode;
            src.naturalHeight = src.naturalHeight || src.height;
            src.naturalWidth = src.naturalWidth || src.width;
            parentDiv.style.height = src.naturalHeight + "px";
            parentDiv.style.width = src.naturalWidth + "px";
            var type = src.getAttribute("type");
            if(type == 'HImg')
                parentDiv.style.top = Math.floor((parentDiv.parentNode.offsetHeight - src.naturalHeight) / 2) + "px";
            else
                parentDiv.style.left = Math.floor((parentDiv.parentNode.offsetWidth - src.naturalWidth) / 2) + "px";
        },

        orientationHandler: function(formId, orientation, widgetType) {
            var swipeElements = document.querySelectorAll("#" + formId + " div[name='touchcontainer_" + widgetType + "']");
            var platform = $KU.getPlatform().name;
            for(var i = 0; i < swipeElements.length; i++) {
                var swipeElement = swipeElements[i];
                var id = swipeElement.id;
                var widgetModel = $KU.getModelByNode(swipeElement);
                var swipeContext = widgetModel.swipeContext;

                if(!swipeContext) continue;

                var imgsElement = swipeElement.children[0];
                
                var individualImages = imgsElement.children;
                var noOfSwipePages = individualImages.length;
                if(noOfSwipePages > 0) {
                    imgsElement.style.width = noOfSwipePages * 100 + "%";
                    var IMG_WIDTH = 0;

                    
                    for(var j = 0; j < individualImages.length; j++) {
                        if(j != (swipeContext.currentPage + 1)) {
                            individualImages[j].style.display = "none";
                        }

                    }

                    var pageWidthInLandScape = screen.height * swipeContext.widthRatio + 'px';
                    var pageWidthInPortrait = screen.width * swipeContext.widthRatio + 'px';


                    for(var k = 0; k < individualImages.length; k++) {
                        if(platform == "android" || platform == "blackberry") {
                            if(orientation === "landscape")
                                individualImages[k].style.width = pageWidthInPortrait;
                            else if(orientation === "portrait")
                                individualImages[k].style.width = pageWidthInPortrait;
                        } else {
                            if(orientation === "landscape")
                                individualImages[k].style.width = pageWidthInLandScape;
                            else if(orientation === "portrait")
                                individualImages[k].style.width = pageWidthInPortrait;
                        }
                    }

                    IMG_WIDTH = individualImages[0].parentNode.clientWidth / noOfSwipePages;
                    swipeContext.imageWidth = IMG_WIDTH;
                    swipeElement.setAttribute("imageWidth", IMG_WIDTH);

                    if(swipeContext.currentPage === (noOfSwipePages - 1)) {
                        module.previousImage(swipeElement, swipeContext, true);
                        module.nextImage(swipeElement, swipeContext, true);
                    } else {
                        module.nextImage(swipeElement, swipeContext, true);
                        module.previousImage(swipeElement, swipeContext, true);
                    }

                    for(var j = 0; j < individualImages.length; j++) {
                        individualImages[j].style.display = "inline";
                    }
                }
            }
        },

        
        previousImage: function(touchContainerElement, swipeContext, orientationChanged) {
            var imgsElement = touchContainerElement.children[0];
            swipeContext.currentPage = Math.max(swipeContext.currentPage - 1, 0);
            module.scrollImages(imgsElement, swipeContext.imageWidth * swipeContext.currentPage, $KU.swipeDuration, orientationChanged);
        },

        
        nextImage: function(touchContainerElement, swipeContext, orientationChanged) {
            var elem = touchContainerElement.children[0];
            var noOfSwipePages = elem.children.length;
            swipeContext.currentPage = Math.min(swipeContext.currentPage + 1, noOfSwipePages - 1);
            module.scrollImages(elem, swipeContext.imageWidth * swipeContext.currentPage, $KU.swipeDuration, orientationChanged);
        },

        
        scrollImages: function(elem, distance, duration, isOriented, isTabContext) {
            if(!isOriented)
                elem.style[$KU.transition] = $KU.cssPrefix + "transform " + (duration / 1000).toFixed(1) + "s ";
            else
                elem.style[$KU.transition] = $KU.cssPrefix + "transform 0 0";

            
            var value = (distance < 0 ? "" : "-") + Math.abs(distance).toString();
            elem.style[$KU.transform] = translateOpen + value + "px,0" + translateClose;
        },

        navigationDotsHandler: function(src) {
            
            var index = parseInt(src.getAttribute("index"), 10);
            var id = src.parentNode.parentNode.parentNode.getAttribute('id');
            id = id.substr(0, id.lastIndexOf("_footer"));
            var widElement = $KU.getElementById(id);
            var widgetModel = $KU.getModelByNode(widElement);
            if(!widgetModel)
                return;
            var imgsElement = null;
            if(widgetModel.wType == 'Segment') {
                if(!$KW.Utils.isWidgetInteractable(widElement, true)) {
                    return;
                }
                imgsElement = widElement.children[0];
                widgetModel.selectedRows = (IndexJL) ? [null, [null, IndexJL, index]] : [
                    [IndexJL, index]
                ];
                $KW.Segment.setSelectedItemsAndIndices(widgetModel);
            } else if(widgetModel.wType == 'HStrip') {
                imgsElement = widElement.children[0];
                index -= 1;
            } else {
                imgsElement = widElement.children[1].children[0];
                widgetModel.activetab = widgetModel.currentPage;
                widgetModel.activetabs[IndexJL] = widgetModel.activetab;
            }
            var swipeContext = widgetModel.swipeContext;
            swipeContext.currentPage = parseInt(index) - IndexJL;
            module.scrollImages(imgsElement, swipeContext.imageWidth * swipeContext.currentPage, $KU.swipeDuration, false);
            module.updatePageIndicator(widElement, swipeContext, widgetModel);

            
            if(widgetModel.wType == "Segment" && widgetModel.viewType == constants.SEGUI_VIEW_TYPE_PAGEVIEW) {
                widgetModel.onswipe && widgetModel.onswipe(widgetModel, -1, widgetModel.focusedindex, widgetModel.selectedState); 
            }
        },

        events: {},

        
        TouchContext: {
            UP: "UP",
            DOWN: "DOWN",
            LEFT: "LEFT",
            RIGHT: "RIGHT"
        },

        preventDefault: function(e) {
            kony.events.preventDefault(e);
        },

        
        pageviewScroller: function(element, options) {
            this.element = element;

            
            if('ontouchstart' in window)
                kony.events.addEventListener(element, "touchstart", this, false);
            else if($KU.isPointerSupported) {
                if("onpointerdown" in window)
                    kony.events.addEventListener(element, "pointerdown", this, false);
                else
                    kony.events.addEventListener(element, "MSPointerDown", this, false);
            } else {
                kony.events.addEventListener(element, "mousedown", this, false);
            }

            this.widgetModel = options.widgetModel;
            this.scroller = this.element.children[0];
            this.options = {
                bounce: true,
                hBounce: true,
            };
            this.options.bounce = options.bounce;
            this.options.hBounce = options.bounce;
            this.options.bubbleEvents = options.bubbleEvents;
            this.refresh();
        },

        
        
        
        konyScroller: function(el, options) {
            var that = this;
            that.wrapper = el; 
            var widgetModel = options.widgetModel;
            that.scroller = that.wrapper.children[0];

            
            that.options = {
                hScroll: false,
                vScroll: false,

                
                hScrollbar: false,
                vScrollbar: false,
                bounce: true,
                hBounce: true,
                vBounce: true,

                fixedScrollbar: !$KU.isIDevice, 
                hideScrollbar: true,
                fadeScrollbar: $KU.isIDevice && $KU.has3d,
                scrollbarClass: '',
                checkDOMChanges: false, 

                useTransform: true, 

                x: 0,
                y: 0,
                topOffset: 0,
                bottomOffset: 0,

                
                onBeforeScrollStart: function(e) {  },
                onRefresh: null,
                onScrollStart: null,
                onScrollMove: null,
                onScrollEnd: null
            };

            
            for(var i in options) that.options[i] = options[i];

            
            that.x = that.options.x;
            that.y = that.options.y;
            that.pullDownOffset = that.options.topOffset || 0;
            that.pullUpOffset = that.options.bottomOffset || 0;
            
            that.options.hBounce = that.options.bounce ? (typeof options.hBounce === "undefined" ? true : options.hBounce) : false;
            that.options.vBounce = that.options.bounce ? (typeof options.vBounce === "undefined" ? true : options.vBounce) : false;

            that.options.vScrollbar = that.options.vScroll && that.options.vScrollbar;
            that.options.hScrollbar = that.options.hScroll && that.options.hScrollbar;

            that.options.useTransform = $KU.hasTransform ? that.options.useTransform : false;

            

            that.scroller.style[$KU.transitionProperty] = that.options.useTransform ? ($KU.cssPrefix + 'transform') : 'top left';
            that.scroller.style[$KU.transitionDuration] = '0';
            that.scroller.style[$KU.transformOrigin] = '0 0';

            

            if(that.options.useTransform) {
                that.scroller.style[$KU.transform] = translateOpen + (that.x - (that.options.hScroll ? that.pullDownOffset : 0)) + "px," + (that.y - (that.options.vScroll ? that.pullDownOffset : 0)) + "px" + translateClose;
                if(!that.options.scrollbox)
                    that.scroller.style.position = "absolute";
            } else {
                

                that.scroller.style.cssText += ';position:absolute;top:' + (that.y - (that.options.vScroll ? that.pullDownOffset : 0)) + 'px;left:' + (that.x - (that.options.hScroll ? that.pullDownOffset : 0)) + 'px';
            }
            that.refresh();

            if(that.options.showImages) {
                
                
                if(that.options.hScroll)
                    that.toggleFadeImgs();
            }


            
            var isPopup = that.wrapper.getAttribute("kformname");
            if(!isPopup && !that.options.scrollbox)
                kony.events.addEventListener(document, 'touchmove', module.preventDefault);

            
            if(!that.options.disableUserScroll) {
                if($KU.isTouchSupported) 
                    kony.events.addEventListener(that.scroller, "touchstart", that, false);
                else if($KU.isPointerSupported) {
                    if("onpointerdown" in window) {
                        kony.events.addEventListener(that.scroller, "pointerdown", that, false);
                    } else {
                        kony.events.addEventListener(that.scroller, "MSPointerDown", that, false);
                    }
                } else {
                    kony.events.addEventListener(that.scroller, "mousedown", that);
                    kony.events.addEventListener(that.scroller, "mouseout", that);
                }
            }

            if($KU.isOrientationSupported && !$KU.isAndroid) {
                kony.events.addEventListener(window, "orientationchange", that, false);
            } else {
                kony.events.addEventListener(window, "resize", that);
            }

            if(that.options.checkDOMChanges) that.checkDOMTime = setInterval(function() {
                that._checkDOMChanges();
            }, 1000);
        },

        
        StickyScroller: function() {
            var that = this;

            var forms = document.forms;
            var curForm = forms[0];
            if(forms.length == 2)
                curForm = forms[1]; 
            var wrapperId = curForm.id;


            var headerId = $KG["__currentForm"].header;
            var footerId = $KG["__currentForm"].footer;
            var appmenuId = "konyappmenudiv";

            this.wrapper = document.getElementById(wrapperId);
            this.header = document.getElementById(headerId);
            this.footer = document.getElementById(footerId);
            this.appmenu = document.getElementById(appmenuId);

            if(this.appmenu && this.footer) {
                this.footer.style.bottom = this.appmenu.clientHeight + 'px';
            }

            setTimeout(function() {
                that.follow();
            }, 0);

            kony.events.addEventListener(window, 'scroll', this, false);
        },

        
        
        
        
        
        gesture: function(widgetModel, gestureEventObject) {
            var gestureType = gestureEventObject.gestureType,
            gestureObj = gestureEventObject.gestureObj,
            callback = gestureEventObject.callback;
            var widget = (widgetModel ? document.querySelectorAll('#' + $KW.Utils.getKMasterWidgetID(widgetModel)) : document);
            if(["Form", "Form2"].contains(widgetModel.wType)) {
                if($KG["nativeScroll"])
                    widget = document.getElementById(widgetModel.id);
                else
                    widget = document.querySelector('div[id="' + widgetModel.id + '_scroller"]');
            }

            if(!widgetModel)
                widgetModel = $KG;

            if(!$KG.gestures) $KG.gestures = {};
            this.gestureIdentifier = gestureEventObject.gestureIdentifier;
            $KG.gestures[this.gestureIdentifier] = {
                "widgetModel": widgetModel,
                "gestureType": gestureType
            };

            this.widgetModel = widgetModel;
            this.gestureType = gestureType;

            switch(this.gestureType) {
                case constants.GESTURE_TYPE_TAP:
                case 10:
                case 11:
                    this.TAP = true;
                    break;
                case constants.GESTURE_TYPE_SWIPE:
                    this.SWIPE = true;
                    break;
                case constants.GESTURE_TYPE_LONGPRESS:
                    this.LONGPRESS = true;
                    break;
                case constants.GESTURE_TYPE_PAN:
                    this.PAN = true;
                    break;
                case constants.GESTURE_TYPE_ROTATION:
                    this.ROTATION = true;
                    break;
                case constants.GESTURE_TYPE_PINCH:
                    this.PINCH = true;
                    break;
            }

            this.gestureObj = gestureObj;
            this.callback = callback;

            
            this.fingers = gestureObj.fingers || 1;

            this.taps = gestureObj.taps || 1;
            this.longTapDelay = parseInt(gestureObj.pressDuration, 10) * 1000 || 1000; 
            this.swipedistance = (gestureObj.swipedistance || 50) * $KU.dpi;
            this.continuousEvents = gestureObj.continuousEvents || false;
            gestureEventObject["instance"] = this;

            if(!widget || (typeof widget.length == 'number' && widget.length == 0))
                return this.gestureIdentifier;

            
            if(typeof widget.length != 'number' || ($KG["nativeScroll"] && ["Form", "Form2"].contains(widgetModel.wType)))
                this.widget = [widget];
            else
                this.widget = widget;

            for(var i = 0; i < this.widget.length; i++) {
                if(this.gestureType === constants.GESTURE_TYPE_PAN ||
                    this.gestureType === constants.GESTURE_TYPE_ROTATION ||
                    this.gestureType === constants.GESTURE_TYPE_PINCH) {
                    kony.events.addEventListener(this.widget[i], "gesturestart", this, false);
                } else {
                    if($KU.isPointerSupported)
                        if("onpointerdown" in window)
                            kony.events.addEventListener(this.widget[i], "pointerdown", this, false);
                        else
                            kony.events.addEventListener(this.widget[i], "MSPointerDown", this, false);
                    else
                        kony.events.addEventListener(this.widget[i], "touchstart", this, false);
                }
            }
            return this.gestureIdentifier;
        },

        TouchEvents: function(widgetModel, widgetNode, eventType, callback) {
            var touchEvent = module.events.touchstart;
            var mouseEvent = module.events.mousestart;
            switch(eventType) {
                case "touchstart":
                    touchEvent = module.events.touchstart;
                    mouseEvent = module.events.mousestart;
                    break;
                case "touchmove":
                    touchEvent = module.events.touchmove;
                    mouseEvent = module.events.mousemove;
                    break;
                case "touchend":
                    touchEvent = module.events.touchend;
                    mouseEvent = module.events.mouseend;
                    break;
                case "touchcancel":
                    touchEvent = module.events.touchcancel;
                    mouseEvent = module.events.mousecancel;
                    break;
                case "scroll":
                    touchEvent = "scroll"
                    break;
            }

            if(callback || eventType == 'scroll') {
                if(callback)
                    this.callback = callback;
                this.widgetModel = widgetModel;
                this.widgetNode = widgetNode;
                this.widgetTopNode = $KW.Utils.getWidgetNodeFromNodeByModel(widgetModel, widgetNode) || widgetNode;
                this.handleEventListener = this.handleEvent.bind(this);

                if(eventType == "scroll") {
                    kony.events.addEventListener(widgetNode, "scroll", this.handleEventListener, false);
                    this.isScrolling = false;
                } else {
                    
                    kony.events.addEventListener(widgetNode, touchEvent, this.handleEventListener, false);
                }
            } else {
                kony.events.removeEventListener(widgetNode, touchEvent, this.handleEventListener, false);
            }
        },

        Drag: function(model, widget, dragableElement, containerElement, dragEvent, moveElement) {
            this.model = model;
            this.widget = widget;
            this.dragEvent = dragEvent;
            this.dragableElement = dragableElement;
            this.containerElement = containerElement || document;
            this.moveElement = moveElement || dragableElement;

            if(dragableElement) {
                kony.events.addEventListener(dragableElement, module.events.touchstart, this.handleEvent.bind(this));
            }
        }
    };

    module.pageviewScroller.prototype = {
        
        handleEvent: function(e) {
            switch(e.type) {
                case "touchstart":
                case "mousedown":
                case "MSPointerDown":
                case "pointerdown":
                    this.onTouchStart(e);
                    break;
                case "touchmove":
                case "mousemove":
                case "MSPointerMove":
                case "pointermove":
                    this.onTouchMove(e);
                    break;
                case "touchend":
                case "touchcancel":
                case "mouseup":
                case "MSPointerUp":
                case "MSPointerCancel":
                case "pointerup":
                case "pointercancel":
                    this.onTouchEnd(e);
                    break;
                case 'mouseout':
                    this.onMouseOut(e);
                    break;
            }
        },

        refresh: function() {
            var that = this;

            if(this.refreshDisabled)
                return;

            that.wrapperW = that.element.clientWidth || 1;
            that.minScrollX = 0;
            that.scrollerW = Math.round(that.minScrollX + that.scroller.scrollWidth);
            that.maxScrollX = (that.wrapperW - that.scrollerW) + that.minScrollX;
            that.scroller.style[$KU.transitionDuration] = '0';
        },

        
        onTouchStart: function(event) {
            

            var touch = event.touches && event.touches[0] || event;
            if($KU.isTouchSupported) {
                kony.events.addEventListener(this.element, "touchmove", this, false);
                kony.events.addEventListener(this.element, "touchend", this, false);
                kony.events.addEventListener(this.element, "touchcancel", this, false);
            } else if($KU.isPointerSupported) {
                if("onpointerdown" in window) {
                    kony.events.addEventListener(this.element, "pointermove", this, false);
                    kony.events.addEventListener(this.element, "pointerup", this, false);
                    kony.events.addEventListener(this.element, "pointercancel", this, false);
                } else {
                    kony.events.addEventListener(this.element, "MSPointerMove", this, false);
                    kony.events.addEventListener(this.element, "MSPointerUp", this, false);
                    kony.events.addEventListener(this.element, "MSPointerCancel", this, false);
                }
            } else {
                kony.events.addEventListener(this.element, "mousemove", this, false);
                kony.events.addEventListener(this.element, "mouseup", this, false);
                kony.events.addEventListener(this.element, "mouseout", this, false);
            }

            
            this.x = this.lastx = this.startX = touch.pageX;
            this.y = this.lasty = this.startY = touch.pageY;

            var swipeContext = this.widgetModel.swipeContext;
            if(!swipeContext) {
                swipeContext = new Object();
                swipeContext.imageWidth = this.element.getAttribute("imageWidth");
                swipeContext.widthRatio = this.element.getAttribute("ratio");
                swipeContext.currentPage = 0;
            }
        },

        
        onTouchMove: function(event) {
            var touch = event.touches && event.touches[0] || event;
            var newX = touch.pageX;
            var newY = touch.pageY;

            var deltaX = newX - this.startX;
            var deltaY = newY - this.startY;

            this.lastx = this.x;
            this.lasty = this.y;
            this.x = newX;
            this.y = newY;

            var direction = $KU.getSwipeDirection(deltaX, deltaY);
            var distance = $KU.getDistanceMoved(deltaX, deltaY);
            var imgsElement = this.element.children[0];
            var swipeContext = this.widgetModel.swipeContext;

            if($KG["nativeScroll"]) {
                
                if(Math.abs(deltaX) >= Math.abs(deltaY))
                    kony.events.preventDefault(event);
                else
                    return;
            } else
                kony.events.preventDefault(event);
            if(typeof this.options.bubbleEvents != "undefined" && this.options.bubbleEvents) {
                if((this.options.hBounce && (direction == module.TouchContext.LEFT || direction == module.TouchContext.RIGHT))) {

                    kony.events.stopPropagation(event);
                }
            }

            var cWidth = swipeContext.imageWidth * (swipeContext.currentPage);
            if(!this.options.hBounce && ((direction == module.TouchContext.LEFT && (cWidth - deltaX) > this.maxScrollX) ||
                    (direction == module.TouchContext.RIGHT && (cWidth + deltaX) > this.minScrollX))) {
                return;
            }

            if(direction == module.TouchContext.LEFT)
                module.scrollImages(imgsElement, (swipeContext.imageWidth * swipeContext.currentPage) + distance, 0);
            else if(direction == module.TouchContext.RIGHT)
                module.scrollImages(imgsElement, (swipeContext.imageWidth * swipeContext.currentPage) - distance, 0);

            module.updateFocusedIndex(this.widgetModel);
        },

        onTouchEnd: function(event) {
            
            this.detachEvents();
            var touch = event.changedTouches && event.changedTouches[0] || event;

            var newX = touch.pageX;
            var newY = touch.pageY;

            var deltaX = newX - this.startX;
            var deltaY = newY - this.startY;


            var swipeContext = this.widgetModel.swipeContext;
            var dir;
            


            if(Math.abs(deltaX) > Math.abs(deltaY)) {
                if(deltaX <= -7) {
                    module.nextImage(this.element, swipeContext, false);
                    dir = "next";
                } else if(deltaX >= 7) {
                    module.previousImage(this.element, swipeContext, false);
                    dir = "previous";
                }
            }

            module.updatePageIndicator(this.element, swipeContext, this.widgetModel);
            module.updateFocusedIndex(this.widgetModel, dir);

            if(dir) {
                if(this.widgetModel.wType == "Segment" && this.widgetModel.viewType == constants.SEGUI_VIEW_TYPE_PAGEVIEW) {
                    this.widgetModel.onswipe && this.widgetModel.onswipe(this.widgetModel, -1, this.widgetModel.focusedindex, this.widgetModel.selectedState); 
                } else {
                    this.widgetModel.onswipe && this.widgetModel.onswipe(this.widgetModel); 
                }
            }
        },


        detachEvents: function() {
            
            if($KU.isTouchSupported) {
                kony.events.removeEventListener(this.element, "touchmove", this, false);
                kony.events.removeEventListener(this.element, "touchend", this, false);
                kony.events.removeEventListener(this.element, "touchcancel", this, false);
            } else if($KU.isPointerSupported) {
                if("onpointerdown" in window) {
                    kony.events.removeEventListener(this.element, "pointermove", this, false);
                    kony.events.removeEventListener(this.element, "pointerup", this, false);
                    kony.events.removeEventListener(this.element, "pointercancel", this, false);
                } else {
                    kony.events.removeEventListener(this.element, "MSPointerMove", this, false);
                    kony.events.removeEventListener(this.element, "MSPointerUp", this, false);
                    kony.events.removeEventListener(this.element, "MSPointerCancel", this, false);
                }

            } else {
                kony.events.removeEventListener(this.element, "mousemove", this, false);
                kony.events.removeEventListener(this.element, "mouseup", this, false);
                kony.events.removeEventListener(this.element, "mouseout", this, false);
            }
        },

        onMouseOut: function(event) {
            this.onTouchEnd(event);
        },

        destroy: function() {
            
            if(this.element) {
                if($KU.isTouchSupported) {
                    kony.events.removeEventListener(this.element, "touchstart", this, false);
                    kony.events.removeEventListener(this.element, "touchcancel", this, false);
                } else if($KU.isPointerSupported) {
                    if("onpointerdown" in window) {
                        kony.events.removeEventListener(this.element, "pointerdown", this, false);
                        kony.events.removeEventListener(this.element, "pointercancel", this, false);
                    } else {
                        kony.events.removeEventListener(this.element, "MSPointerDown", this, false);
                        kony.events.removeEventListener(this.element, "MSPointerCancel", this, false);
                    }
                } else {
                    kony.events.removeEventListener(this.element, "mousedown", this, false);
                    kony.events.removeEventListener(this.element, "mouseout", this, false);
                }
            }
        }
    };

    module.konyScroller.prototype = {
        x: 0,
        y: 0,
        steps: [],
        aniTime: null,

        _checkDOMChanges: function() {
            var scroller = document.getElementById(this.scroller.id);
            if(scroller === null) {
                return;
            }
            
            
            var contentHeight, contentWidth;
            var wModel = this.options.widgetModel;
            var wType = wModel.wType;
            var formAsFlex = ((wType == 'Form' || wType == 'Popup') && $KW.FlexUtils.isFlexContainer(wModel));
            if(formAsFlex) {
                var formNode = document.getElementById(wModel.id);
                contentHeight = formNode.scrollHeight;
                contentWidth = formNode.scrollWidth;
            } else if(wType == 'FlexScrollContainer') {
                if(this.options.pullDownEl) {
                    contentHeight = scroller.childNodes[1].scrollHeight;
                    contentWidth = scroller.childNodes[1].scrollWidth;
                }
                else {
                    contentHeight = scroller.childNodes[0].scrollHeight;
                    contentWidth = scroller.childNodes[0].scrollWidth;
                }
            }
            else if (wType == 'Image' && wModel.zoomenabled) {
                contentHeight = scroller.childNodes[0].scrollHeight;
                contentWidth = scroller.childNodes[0].scrollWidth;

            } else if(wType == 'CollectionView') {
                var cvNode = $KW.CollectionView.getCollectionViewBaseNode(wModel, scroller);
                contentHeight = cvNode.scrollHeight;
                if(wModel.layouttype == kony.collectionview.LAYOUT_HORIZONTAL)
                    contentHeight += scroller.children[0].offsetHeight;
                contentWidth = cvNode.scrollWidth;
                if(wModel.layouttype == kony.collectionview.LAYOUT_VERTICAL)
                    contentWidth += scroller.children[0].offsetWidth;
            } else {
                contentHeight = scroller.offsetHeight;
                contentWidth = scroller.offsetWidth;
            }

            if(this.moved || this.animating || (this.scrollerW == contentWidth * 1 && this.scrollerH == contentHeight * 1))
                return;

            if(this.options.hScroll == true) {
                if(formAsFlex || wType == 'FlexScrollContainer' || wType == 'CollectionView') {
                    
                    scroller.style.width = (contentWidth / scroller.parentNode.offsetWidth) * 100 + "%";
                } else
                    scroller.style.width = (scroller.scrollWidth / scroller.parentNode.offsetWidth) * 100 + "%"; 

                if(wType == 'Image' && wModel.zoomenabled) {
                    scroller.style.width = contentWidth + "px";
                }
                if(wType == 'CollectionView') {
                    scroller.children[2].style.marginLeft = contentWidth - wModel.frame.width - scroller.children[0].offsetWidth + 'px';
                }
            }

            if(this.options.vScroll == true) {
                if(formAsFlex || wType == 'FlexScrollContainer' || wType == 'CollectionView' || (wType == 'Image' && wModel.zoomenabled)) {
                    if(wType == 'CollectionView') {
                        scroller.children[2].style.marginTop = contentHeight - wModel.frame.height - scroller.children[0].offsetHeight + 'px';
                    }
                    scroller.style.height = contentHeight + "px";
                }
            }
            this.refresh();
        },

        
        refresh: function() {
            var that = this;

            if(this.refreshDisabled)
                return;

            
            that.wrapperW = that.wrapper.clientWidth || 1;
            that.wrapperH = that.wrapper.clientHeight || 1;

            that.minScrollY = that.options.vScroll ? -that.pullDownOffset : 0;
            that.maxBiasY = that.options.vScroll ? -that.pullUpOffset : 0;
            that.minScrollX = that.options.hScroll ? -that.pullDownOffset : 0;
            that.maxBiasX = that.options.hScroll ? -that.pullUpOffset : 0;

            
            that.scrollerW = Math.round(that.minScrollX + that.scroller.scrollWidth + that.maxBiasX);
            
            that.scrollerH = Math.round(that.minScrollY + that.scroller.scrollHeight + +that.maxBiasY);

            var wModel = that.options.widgetModel;
            var right = 0;
            var bottom = 0;
            var parentFrame = wModel.frame;
            
            if(wModel.wType == 'FlexScrollContainer' && parentFrame) {
                var widgets = wModel.widgets();
                if(widgets.length > 0) {
                    var lastWidget = widgets[widgets.length - 1];
                    if(wModel.layouttype == kony.flex.FLOW_HORIZONTAL) {
                        var valueObj = $KW.FlexLayoutEngine.getComputedValue(lastWidget, parentFrame, lastWidget.right, 'x');
                        if(valueObj)
                            right = $KW.FlexUtils.getValueByParentFrame(lastWidget, valueObj, 'x');
                    }
                    if(wModel.layouttype == kony.flex.FLOW_VERTICAL) {
                        var valueObj = $KW.FlexLayoutEngine.getComputedValue(lastWidget, parentFrame, lastWidget.bottom, 'y');
                        if(valueObj)
                            bottom = $KW.FlexUtils.getValueByParentFrame(lastWidget, valueObj, 'y');
                    }
                }
            }

            that.maxScrollX = (that.wrapperW - that.scrollerW) + that.minScrollX - right;
            that.maxScrollY = (that.wrapperH - that.scrollerH) + that.minScrollY - bottom;

            that.dirX = 0;
            that.dirY = 0;

            if(that.options.onRefresh) that.options.onRefresh.call(that);

            that.hScroll = that.options.hScroll && that.maxScrollX < 0;
            that.vScroll = that.options.vScroll && (!that.hScroll || that.scrollerH > that.wrapperH);

            that.hScrollbar = that.hScroll && that.options.hScrollbar;
            that.vScrollbar = that.vScroll && that.options.vScrollbar && that.scrollerH > that.wrapperH;

            var offset = that._offset(that.wrapper);
            that.wrapperOffsetLeft = -offset.left;
            that.wrapperOffsetTop = -offset.top;

            that.scroller.style[$KU.transitionDuration] = '0';

            
            that._scrollbar('h');
            that._scrollbar('v');


            
            that._resetPos(200);

            if(that.options.showImages) {
                if(that.options.vScroll)
                    that.toggleVFadeImgs();
                if(that.options.hScroll)
                    that.toggleFadeImgs();
            }
        },

        
        handleEvent: function(e) {
            var that = this;
            
            if($KG["__idletimeout"] && $KG["__idletimeout"].enabled) {
                $KI.appevents.resettimer();
            }

            
            

            if($KG.activeInput && $KG.appbehaviors.disableScrollOnInputFocus == true && e.type != 'resize')
                return;

            
            if(e.type != "orientationchange" && e.type != "resize") {
                
                if(e && e.target && e.target.getAttribute && (e.target.getAttribute("kwidgettype") == "Khstrip" || e.target.getAttribute("kwidgettype") == "ScrollBox"))
                    this.angularDirection = true;
            } else
                this.angularDirection = false;

            switch(e.type) {
                case "touchstart":
                case "mousedown":
                case "MSPointerDown":
                case "pointerdown":
                    that.onTouchStart(e);
                    break;
                case "touchmove":
                case "mousemove":
                case "MSPointerMove":
                case "pointermove":
                    that.onTouchMove(e);
                    break;
                case "touchend":
                case "touchcancel":
                case "mouseup":
                case "MSPointerUp":
                case "MSPointerCancel":
                case "pointerup":
                case "pointercancel":
                    that.onTouchEnd(e);
                    break;
                case 'mouseout':
                    that.onMouseOut(e);
                    break;
                case 'orientationchange':
                case 'resize':
                    that.resize(e);
                    break;
            }
        },

        
        resize: function() {
            var that = this;
            if(!that.options.scrollbox) {
                $KW.Scroller.setHeight(that.options.formid);
                
                if(!$KG["nativeScroll"] && $KU.isIOS7) {
                    window.scrollTo(0, 0);
                    if($KG["__currentForm"])
                        $KU.getElementById($KG["__currentForm"].id + "_container").style.height = "100%";
                    var formModel = $KG.allforms[that.options.formid];
                    formModel && $KW.Scroller.setSLWHeight(formModel, that.wrapper, true);
                }
            }
            setTimeout(function() {
                that.refresh();
            }, $KU.isAndroid ? 200 : 0);
            if($KU.isAndroid && !$KU.isTablet && !that.options.scrollbox) {
                window.clearTimeout(that.resizeTimeoutId);
                that.resizeTimeoutId = setTimeout(function() {
                    if(document.activeElement) {
                        var inputModel = $KU.getModelByNode(document.activeElement);
                        if(inputModel && (inputModel.wType == "TextField" || inputModel.wType == "TextArea")) {
                            var winNewHeight = $KU.getWindowHeight();
                            var screenHeight = $KU.getPlatformVersion("android").startsWith("2") ? window.outerHeight : screen.height;
                            if($KG["__orientation"] == "landscape" && screenHeight - winNewHeight < 100) 
                                return;
                            that.refresh();



                        }
                    }
                }, $KU.orientationDelay);
            }
        },

        
        onTouchStart: function(event) {
            var targetWidget = event.target || event.srcElement;
            targetWidget = $KU.getParentByAttribute(targetWidget, kony.constants.KONY_WIDGET_TYPE);

            if(targetWidget && targetWidget.hasAttribute('overlay')) {
                $KW.Image.overlayWidgetTouchHandler(event, targetWidget);
                return;
            }

            if(targetWidget) {
                var pf = $KU.getContainerForm(targetWidget) || (targetWidget.getAttribute && targetWidget.getAttribute("kformname"));
                if($KW.Popup && $KW.Popup.dismissPopup(pf)) {
                    
                    
                    kony.events.stopPropagation(event, true);
                    kony.events.preventDefault(event);
                    return;
                }
            }
            
            var touch = event.touches && event.touches[0] || event;
            $KG.disableViewPortScroll && $KU.setPointerEvents(event.srcElement, "auto");
            if(this.options.scrollbox) {
                kony.events.ontouchstartHandler(event);
                if(!this.options.HStrip && (typeof this.options.bubbleEvents == "undefined" ||
                        !this.options.bubbleEvents))
                    kony.events.stopPropagation(event); 
            }
            
            if(this.options.onBeforeScrollStart)
                this.options.onBeforeScrollStart.call(this, event);

            this.extendTouchStart(touch);
            this.dragging = false;
            this.startfired = false;
            this.tracking = true;

        },

        
        onTouchMove: function(event) {

            this.dragging = true;
            this.tracking = true;
            

            var touch = event.touches && event.touches[0] || event;
            $KG.disableViewPortScroll && $KU.setPointerEvents(event.srcElement, "none");
            if(this.options.scrollbox)
                kony.events.ontouchmoveHandler(event);
            this.extendTouchMove(touch, event);
        },

        onTouchEnd: function(event) {
            this.dragging = false;
            this.tracking = false;
            
            var touch = event.touches && event.touches[0] || event;
            this.extendTouchEnd(touch);
        },

        onMouseOut: function(e) {
            var t = e.relatedTarget || e.srcElement;
            if(!t) {
                this.onTouchEnd(e);
                return;
            }
            while(t = t.parentNode)
                if(t == this.wrapper) return;

            this.onTouchEnd(e);
        },

        extendTouchStart: function(touch) {
            
            this.moved = false;
            this.animating = false;
            this.distX = 0;
            this.distY = 0;
            this.absDistX = 0;
            this.absDistY = 0;

            var x, y;

            if(this.options.useTransform) {
                
                
                var matrix = getComputedStyle(this.scroller, null)[$KU.transform].replace(/[^0-9-.,]/g, '').split(',');
                x = matrix[4] * 1; 
                y = matrix[5] * 1;
            } else {
                x = getComputedStyle(this.scroller, null).left.replace(/[^0-9-]/g, '') * 1;
                y = getComputedStyle(this.scroller, null).top.replace(/[^0-9-]/g, '') * 1;
            }

            this.startX = this.x;
            this.startY = this.y;

            
            this.pointX = touch.pageX;
            this.pointY = touch.pageY;

            this.startTime = new Date().valueOf();

            if($KU.isTouchSupported) {
                kony.events.addEventListener(this.scroller, "touchmove", this, false);
                kony.events.addEventListener(this.scroller, "touchend", this, false);
                kony.events.addEventListener(this.scroller, "touchcancel", this, false);
            } else if($KU.isPointerSupported) {
                if("onpointerdown" in window) {
                    kony.events.addEventListener(window, "pointermove", this, false);
                    kony.events.addEventListener(window, "pointerup", this, false);
                    kony.events.addEventListener(window, "pointercancel", this, false);
                } else {
                    kony.events.addEventListener(window, "MSPointerMove", this, false);
                    kony.events.addEventListener(window, "MSPointerUp", this, false);
                    kony.events.addEventListener(window, "MSPointerCancel", this, false);
                }
            } else {
                kony.events.addEventListener(this.scroller, "mousemove", this, false);
                kony.events.addEventListener(this.scroller, "mouseup", this, false);
            }
            this.startEventFired = false;
            this.direction = "";
        },

        extendTouchMove: function(touch, event) {
            event = event || touch;
            var deltaX = touch.pageX - this.pointX,
                deltaY = touch.pageY - this.pointY,
            newX = this.x + deltaX,
                newY = this.y + deltaY,
                c1, c2,
                timestamp = new Date().valueOf();

            var direction = $KU.getSwipeDirection(deltaX, deltaY);
            
            if(this.angularDirection) {
                
                if((this.vScroll && (direction != module.TouchContext.UP && direction != module.TouchContext.DOWN)) || (this.hScroll && (direction != module.TouchContext.LEFT && direction != module.TouchContext.RIGHT)))
                    return;
            }

            if(this.options.onScrollStart && !this.startEventFired && ((this.vScroll && (direction == module.TouchContext.UP || direction == module.TouchContext.DOWN)) ||
                    (this.hScroll && (direction == module.TouchContext.LEFT || direction == module.TouchContext.RIGHT)))) {
                this.options.onScrollStart.call(this, event);
            }
            this.startEventFired = true;

            if(typeof this.options.bubbleEvents != "undefined" && this.options.bubbleEvents) {
                if((this.options.vBounce && this.vScroll && (direction == module.TouchContext.UP || direction == module.TouchContext.DOWN)) ||
                    (this.options.hBounce && this.hScroll && (direction == module.TouchContext.LEFT || direction == module.TouchContext.RIGHT))) {

                    kony.events.stopPropagation(event);
                }
            }

            if($KG["nativeScroll"]) {
                
                if(Math.abs(deltaX) >= Math.abs(deltaY))
                    kony.events.preventDefault(touch);
                else
                    return;
            } else
                kony.events.preventDefault(event);


            if($KG.appbehaviors[constants.API_LEVEL] >= constants.API_LEVEL_6000 && !this.vScroll && !this.hScroll) {
                
                return;
            }

            this.direction = direction;

            this.pointX = touch.pageX;
            this.pointY = touch.pageY;


            
            if(newX > this.minScrollX || newX < this.maxScrollX) {
                newX = this.options.hBounce ? this.x + (deltaX / 2) : newX >= this.minScrollX || this.maxScrollX >= 0 ? this.minScrollX : this.maxScrollX;
            } else if(!this.options.hBounce && (direction == module.TouchContext.LEFT || direction == module.TouchContext.RIGHT)) {
                kony.events.stopPropagation(event);
            }

            if(newY > this.minScrollY || newY < this.maxScrollY) {
                newY = this.options.vBounce ? this.y + (deltaY / 2) : newY >= this.minScrollY || this.maxScrollY >= 0 ? this.minScrollY : this.maxScrollY;
            } else if(!this.options.vBounce && (direction == module.TouchContext.UP || direction == module.TouchContext.DOWN)) {
                kony.events.stopPropagation(event);
            }

            

            var isABSorDeltaScrollingEnabled = ($KG.appbehaviors && $KG.appbehaviors["minTouchDisplacementScroll"] == true) ? true : false;
            
            var valX = 0;
            var valY = 0;
            if(isABSorDeltaScrollingEnabled) {
                valX = this.absDistX || Math.abs(deltaX);
                valY = this.absDistY || Math.abs(deltaY);
            } else {
                valX = this.absDistX;
                valY = this.absDistY;
            }
            if(valX < $KU.minTouchMoveDisplacement && valY < $KU.minTouchMoveDisplacement) {
                this.distX += deltaX;
                this.distY += deltaY;
                this.absDistX = Math.abs(this.distX);
                this.absDistY = Math.abs(this.distY);

                return;
            }

            
            if(this.absDistX > this.absDistY + 5) {
                newY = this.y;
                deltaY = 0;
            } else if(this.absDistY > this.absDistX + 5) {
                newX = this.x;
                deltaX = 0;
            }

            
            

            this.moved = true;
            this.animateTo(newX, newY);

            if(timestamp - this.startTime > 300) {
                this.startTime = timestamp;
                this.startX = this.x;
                this.startY = this.y;
            }

            if(this.options.onScrollMove &&
                ((this.vScroll && (direction == module.TouchContext.UP || direction == module.TouchContext.DOWN)) ||
                    (this.hScroll && (direction == module.TouchContext.LEFT || direction == module.TouchContext.RIGHT)))
            ) {

                this.options.onScrollMove.call(this, event);
            }

        },

        extendTouchEnd: function(touch) {
            
            if($KU.isTouchSupported) {
                kony.events.removeEventListener(this.scroller, "touchmove", this, false);
                kony.events.removeEventListener(this.scroller, "touchend", this, false);
                kony.events.removeEventListener(this.scroller, "touchcancel", this, false);
            } else if($KU.isPointerSupported) {
                if("onpointerdown" in window) {
                    kony.events.removeEventListener(window, "pointermove", this, false);
                    kony.events.removeEventListener(window, "pointerdown", this, false);
                    kony.events.removeEventListener(window, "pointercancel", this, false);
                } else {
                    kony.events.removeEventListener(window, "MSPointerMove", this, false);
                    kony.events.removeEventListener(window, "MSPointerDown", this, false);
                    kony.events.removeEventListener(window, "MSPointerCancel", this, false);
                }
            } else {
                kony.events.removeEventListener(this.scroller, "mousemove", this, false);
                kony.events.removeEventListener(this.scroller, "mouseup", this, false);
            }
            
            if(this.moved && this.options.onScrollTouchReleased && ((this.vScroll && (this.direction == module.TouchContext.UP || this.direction == module.TouchContext.DOWN)) ||
                    (this.hScroll && (this.direction == module.TouchContext.LEFT || this.direction == module.TouchContext.RIGHT)))) {
                this.options.onScrollTouchReleased.call(this);
            }

            var momentumX = {
                    dist: 0,
                    time: 0
                },
                momentumY = {
                    dist: 0,
                    time: 0
                },
                duration = (new Date().valueOf()) - this.startTime,
                newPosX = this.x,
                newPosY = this.y,
                newDuration;

            
            
            var direction = this.direction;

            if(this.angularDirection) {
                
                if((this.vScroll && (direction != module.TouchContext.UP && direction != module.TouchContext.DOWN)) || (this.hScroll && (direction != module.TouchContext.LEFT && direction != module.TouchContext.RIGHT)))
                    return;
            }

            this.direction = direction;

            
            if(duration < 300) {
                
                momentumX = newPosX ? this._momentum(newPosX - this.startX, duration, -this.x, (this.maxScrollX < 0 ? this.scrollerW - this.wrapperW + this.x - this.minScrollX : 0), this.options.hBounce ? this.wrapperW : 0) : momentumX;
                momentumY = newPosY ? this._momentum(newPosY - this.startY, duration, -this.y, (this.maxScrollY < 0 ? this.scrollerH - this.wrapperH + this.y - this.minScrollY : 0), this.options.vBounce ? this.wrapperH : 0) : momentumY;

                newPosX = this.x + momentumX.dist;
                newPosY = this.y + momentumY.dist;

                if((this.x > this.minScrollX && newPosX > this.minScrollX) || (this.x < this.maxScrollX && newPosX < this.maxScrollX))
                    momentumX = {
                        dist: 0,
                        time: 0
                    };
                if((this.y > this.minScrollY && newPosY > this.minScrollY) || (this.y < this.maxScrollY && newPosY < this.maxScrollY))
                    momentumY = {
                        dist: 0,
                        time: 0
                    };
            }

            if(momentumX.dist || momentumY.dist) {
                newDuration = Math.max(Math.max(momentumX.time, momentumY.time), 10);
                this.scrollTo(Math.round(newPosX), Math.round(newPosY), newDuration);
                return;
            }

            this._resetPos(200);
        },

        
        animateTo: function(offsetX, offsetY) {
            var x = (this.options.hScroll || this.contentoffsetmove) && !isNaN(offsetX) ? offsetX : 0;
            var y = (this.options.vScroll || this.contentoffsetmove) && !isNaN(offsetY) ? offsetY : 0;

            x = Math.round(x);
            y = Math.round(y);

            if(this.x === x && this.y === y) return;

            if(this.options.useTransform) {
                this.scroller.style[$KU.transform] = translateOpen + x + "px," + y + "px" + translateClose;
            } else {
                this.scroller.style.left = x + 'px';
                this.scroller.style.top = y + 'px';
            }

            this.x = x;
            this.y = y;

            if(this.options.showImages) {
                if(this.options.vScroll)
                    this.toggleVFadeImgs();
                if(this.options.hScroll)
                    this.toggleFadeImgs();
            }

            
            this._scrollbarPos('h');
            this._scrollbarPos('v');

            if(this.options.onScrollMove) this.options.onScrollMove.call(this);

            
            if(this.options.widgetModel.enableonscrollwidgetpositionforsubwidgets) {
                $KW.APIUtils.executeOnScrollingWidgetPosition(this.options.widgetModel);
            }
        },

        toggleFadeImgs: function() {
            
            var id = this.options.widgetID;
            var formId = this.options.formid;
            var wID = formId + "_" + id;
            var sn = $KU.getElementById(wID + "_scrollee");
            if(!sn)
                return;

            
            var w = sn.scrollWidth + sn.offsetLeft + (sn.offsetWidth - sn.clientWidth);
            var right = Math.min(0, $KU.getElementById(wID + "_scroller").clientWidth - w);
            var leftImg = $KU.getElementById(wID + "_leftimg");
            var rightImg = $KU.getElementById(wID + "_rightimg");
            leftImg && module.setHeight(leftImg.childNodes[0]); 
            rightImg && module.setHeight(rightImg.childNodes[0]);
            var l = -this.x;
            if(l > sn.offsetLeft)
                leftImg && $KU.applyFade(leftImg, "fadeIn", 500);
            else
                leftImg && $KU.applyFade(leftImg, "fadeOut", 1000);

            if(l < -right)
                rightImg && $KU.applyFade(rightImg, "fadeIn", 500);
            else
                rightImg && $KU.applyFade(rightImg, "fadeOut", 1000);
        },

        toggleVFadeImgs: function() {
            
            var id = this.options.widgetID;
            var formId = this.options.formid;
            var wID = formId + "_" + id;
            var sn = $KU.getElementById(wID + "_scrollee");
            
            var h = sn.scrollHeight + sn.offsetTop + (sn.offsetHeight - sn.clientHeight);
            var bottom = Math.min(0, $KU.getElementById(wID + "_scroller").clientHeight - h);
            var topImg = $KU.getElementById(wID + "_topimg");
            var bottomImg = $KU.getElementById(wID + "_bottomimg");
            var l = -this.y;
            if(l > sn.offsetTop)
                topImg && $KU.applyFade(topImg, "fadeIn", 500);
            else
                topImg && $KU.applyFade(topImg, "fadeOut", 1000);
            if(l < -bottom)
                bottomImg && $KU.applyFade(bottomImg, "fadeIn", 500);
            else
                bottomImg && $KU.applyFade(bottomImg, "fadeOut", 1000);

        },

        
        _scrollbarPos: function(dir, hidden) {
            var that = this,
                pos = dir == 'h' ? that.x : that.y,
                size;

            if(!that[dir + 'Scrollbar'] || ((this.direction == "LEFT" || this.direction == "RIGHT") && !this.options.scrollbox)) return;

            pos = that[dir + 'ScrollbarProp'] * pos;

            if(pos < 0) {
                if(!that.options.fixedScrollbar) {
                    size = that[dir + 'ScrollbarIndicatorSize'] + Math.round(pos * 3);
                    if(size < 8) size = 8;
                    that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
                }
                pos = 0;
            } else if(pos > that[dir + 'ScrollbarMaxScroll']) {
                if(!that.options.fixedScrollbar) {
                    size = that[dir + 'ScrollbarIndicatorSize'] - Math.round((pos - that[dir + 'ScrollbarMaxScroll']) * 3);
                    if(size < 8) size = 8;
                    that[dir + 'ScrollbarIndicator'].style[dir == 'h' ? 'width' : 'height'] = size + 'px';
                    pos = that[dir + 'ScrollbarMaxScroll'] + (that[dir + 'ScrollbarIndicatorSize'] - size);
                } else {
                    pos = that[dir + 'ScrollbarMaxScroll'];
                }
            }

            that[dir + 'ScrollbarWrapper'].style[$KU.transitionDelay] = '0';
            that[dir + 'ScrollbarWrapper'].style.opacity = hidden && that.options.hideScrollbar ? '0' : '1';
            if(that.options.useTransform)
                that[dir + 'ScrollbarIndicator'].style[$KU.transform] = translateOpen + (dir == 'h' ? pos + 'px,0' : '0,' + pos + 'px') + translateClose;
            else {
                if(dir == 'h') {
                    that[dir + 'ScrollbarIndicator'].style.left = pos + 'px';
                    that[dir + 'ScrollbarIndicator'].style.top = 0;
                } else {
                    that[dir + 'ScrollbarIndicator'].style.left = 0;
                    that[dir + 'ScrollbarIndicator'].style.top = pos + 'px';
                }
            }
        },

        
        _scrollbar: function(dir) {
            var that = this,
                doc = document,
                bar;

            if(!that[dir + 'Scrollbar']) {
                if(that[dir + 'ScrollbarWrapper']) {
                    if($KU.hasTransform)
                        that[dir + 'ScrollbarIndicator'].style[$KU.transform] = '';
                    that[dir + 'ScrollbarWrapper'].parentNode.removeChild(that[dir + 'ScrollbarWrapper']);
                    that[dir + 'ScrollbarWrapper'] = null;
                    that[dir + 'ScrollbarIndicator'] = null;
                }

                return;
            }

            if(!that[dir + 'ScrollbarWrapper']) {
                
                bar = doc.createElement('div');

                if(that.options.scrollbarClass) bar.className = that.options.scrollbarClass + dir.toUpperCase();
                else bar.style.cssText = 'position:absolute;z-index:100;' + (dir == 'h' ? 'height:7px;bottom:1px;left:2px;right:' + (that.vScrollbar ? '7' : '2') + 'px' : 'width:7px;bottom:' + (that.hScrollbar ? '7' : '2') + 'px;top:2px;right:1px');

                bar.style.cssText += ';pointer-events:none;' + $KU.cssPrefix + 'transition-property:opacity;' + $KU.cssPrefix + 'transition-duration:' + (that.options.fadeScrollbar ? '350ms' : '0') + ';overflow:hidden; opacity:' + (that.options.hideScrollbar ? '0' : '1');

                that.wrapper.appendChild(bar);
                that[dir + 'ScrollbarWrapper'] = bar;

                
                bar = doc.createElement('div');
                if(!that.options.scrollbarClass) {
                    bar.style.cssText = 'position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9); ' + $KU.cssPrefix + 'background-clip:padding-box;' + $KU.cssPrefix + 'box-sizing:border-box; ' + (dir == 'h' ? 'height:100%' : 'width:100%') + '; ' + $KU.cssPrefix + 'border-radius:3px;border-radius:3px';
                }

                if(that.options.useTransform)
                    bar.style.cssText += ';pointer-events:none;' + $KU.cssPrefix + 'transition-property:' + $KU.cssPrefix + 'transform; ' + $KU.cssPrefix + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);' + $KU.cssPrefix + 'transition-duration:0;' + $KU.cssPrefix + 'transform:' + translateOpen + '0,0' + translateClose;

                

                that[dir + 'ScrollbarWrapper'].appendChild(bar);
                that[dir + 'ScrollbarIndicator'] = bar;
            }

            if(dir == 'h') {
                that.hScrollbarSize = that.hScrollbarWrapper.clientWidth;
                that.hScrollbarIndicatorSize = Math.max(Math.round(that.hScrollbarSize * that.hScrollbarSize / that.scrollerW), 8);
                that.hScrollbarIndicator.style.width = that.hScrollbarIndicatorSize + 'px';
                that.hScrollbarMaxScroll = that.hScrollbarSize - that.hScrollbarIndicatorSize;
                that.hScrollbarProp = that.hScrollbarMaxScroll / that.maxScrollX;
            } else {
                that.vScrollbarSize = that.vScrollbarWrapper.clientHeight;
                that.vScrollbarIndicatorSize = Math.max(Math.round(that.vScrollbarSize * that.vScrollbarSize / that.scrollerH), 8);
                that.vScrollbarIndicator.style.height = that.vScrollbarIndicatorSize + 'px';
                that.vScrollbarMaxScroll = that.vScrollbarSize - that.vScrollbarIndicatorSize;
                that.vScrollbarProp = that.vScrollbarMaxScroll / that.maxScrollY;
            }

            
            that._scrollbarPos(dir, true);
        },

        
        _resetPos: function(time) {
            var that = this,
                resetX = that.x >= that.minScrollX ? that.minScrollX : that.x < that.maxScrollX ? that.maxScrollX : that.x,
                resetY = that.y >= that.minScrollY || that.maxScrollY > 0 ? that.minScrollY : that.y < that.maxScrollY ? that.maxScrollY : that.y;

            if(resetX == that.x && resetY == that.y) {
                if(that.moved) {
                    that.moved = false;
                    if(that.options.onScrollEnd && !that.contentoffsetmove && ((this.vScroll && (this.direction == module.TouchContext.UP || this.direction == module.TouchContext.DOWN)) ||
                            (this.hScroll && (this.direction == module.TouchContext.LEFT || this.direction == module.TouchContext.RIGHT)))) {
                        that.options.onScrollEnd.call(that);
                    }
                }

                if(that.hScrollbar && that.options.hideScrollbar) {
                    that.hScrollbarWrapper.style[$KU.transitionDelay] = '100ms';
                    that.hScrollbarWrapper.style.opacity = '0';
                }
                if(that.vScrollbar && that.options.hideScrollbar) {
                    that.vScrollbarWrapper.style[$KU.transitionDelay] = '100ms';
                    that.vScrollbarWrapper.style.opacity = '0';
                }
                return;
            }

            that.scrollTo(resetX, resetY, time || 0);
        },

        scrollTo: function(x, y, time, relative) {
            var that = this,
                step = x,
                i, l;

            that.stop();

            if(!step.length) step = [{
                x: x,
                y: y,
                time: time,
                relative: relative
            }];

            for(i = 0, l = step.length; i < l; i++) {
                if(step[i].relative) {
                    step[i].x = that.x - step[i].x;
                    step[i].y = that.y - step[i].y;
                }
                that.steps.push({
                    x: step[i].x,
                    y: step[i].y,
                    time: step[i].time || 0
                });
            }

            that._startAni();
        },

        
        scrollToElement: function(el, time, returnTop, isFlex, needToSetCursor) {
            if(!el) return;
            if(!time) time = 1000; 

            var that = this;

            pos = that._offset(el);
            pos.left += that.wrapperOffsetLeft;
            pos.top += that.wrapperOffsetTop;

            pos.left = pos.left >= that.minScrollX ? that.minScrollX : pos.left <= that.maxScrollX ? that.maxScrollX : pos.left;
            pos.top = pos.top >= that.minScrollY ? that.minScrollY : pos.top <= that.maxScrollY ? that.maxScrollY : pos.top;
            time = time === undefined ? Math.max(Math.abs(pos.left) * 2, Math.abs(pos.top) * 2) : time;

            
            if(this.scrollerH > this.wrapperH || this.scrollerW > this.wrapperW) {
                var scrolly = 0;
                var scrollx = 0;
                var updateScrollPosition = false;
                
                if(((Math.abs(this.y) + this.wrapperH) < (el.offsetTop + el.offsetHeight)) || (el.offsetTop < Math.abs(this.y)) || (($KU.isWindowsPhone || $KU.isEdge) && !returnTop && !isFlex)) {
                    if(returnTop)
                        return pos.top;
                    scrolly = pos.top;
                    updateScrollPosition = true;
                }
                if(((Math.abs(this.x) + this.wrapperW) < (el.offsetLeft + el.offsetWidth)) || (el.offsetLeft < Math.abs(this.x)) || (($KU.isWindowsPhone || $KU.isEdge) && !isFlex)) {
                    scrollx = pos.left;
                    updateScrollPosition = true;
                }
                if(updateScrollPosition)
                    that.scrollTo(scrollx, scrolly, time);
                
                var widgetType = el.getAttribute("kWidgetType");
                if(kony.appinit.isiPhone && (widgetType == "TextField" || widgetType == "TextArea")) {
                    el.focus();
                    needToSetCursor && $KW.TextField.setCaretPosition(el);
                } else {
                    setTimeout(function() {
                        try {
                            
                            el.focus();
                            needToSetCursor && $KW.TextField.setCaretPosition(el);
                        } catch(e) {}
                    }, time);
                }
            } else if($KU.isWindowsTablet) {

                
                setTimeout(function() {
                    try {
                        el.focus();
                        needToSetCursor && $KW.TextField.setCaretPosition(el);
                    } catch(e) {}
                }, 0);
            } else {
                try {
                    el.focus();
                    needToSetCursor && $KW.TextField.setCaretPosition(el);
                } catch(e) {}
            }
            if(returnTop) {
                return null;
            }
            return pos;
        },

        
        stop: function() {
            cancelFrame(this.aniTime);
            this.steps = [];
            this.moved = false;
            this.animating = false;
        },

        _startAni: function() {
            var that = this,
                startX = that.x,
                startY = that.y,
                startTime = new Date().valueOf(),
                step, easeOut;

            if(that.animating) return;

            if(!that.steps.length) {
                that._resetPos(400);
                return;
            }

            step = that.steps.shift();

            if(step.x == startX && step.y == startY) step.time = 0;

            that.animating = true;
            that.moved = true;

            (function animate() {
                var now = new Date().valueOf(),
                    newX, newY;

                if(now >= startTime + step.time) {
                    that.animateTo(step.x, step.y);
                    that.animating = false;
                    that._startAni();
                    return;
                }
                
                if(now === startTime) now++;
                now = (now - startTime) / step.time - 1;
                easeOut = Math.sqrt(1 - now * now);
                newX = (step.x - startX) * easeOut + startX;
                newY = (step.y - startY) * easeOut + startY;
                that.animateTo(newX, newY);
                if(that.animating) that.aniTime = nextFrame(animate);
            })();
        },

        
        _momentum: function(dist, time, maxDistUpper, maxDistLower, size) {
            var factor = ($KU.isWindowsTouch ? 4 : 1);
            var deceleration = 0.0006,
                speed = Math.abs(dist) / time * factor,
                
                newDist = (speed * speed) / (2 * deceleration),
                newTime = 0,
                outsideDist = 0;

            
            if(dist > 0 && newDist > maxDistUpper) {
                outsideDist = size / (6 / (newDist / speed * deceleration));
                maxDistUpper = maxDistUpper + outsideDist;
                speed = speed * maxDistUpper / newDist;
                newDist = maxDistUpper;
            } else if(dist < 0 && newDist > maxDistLower) {
                outsideDist = size / (6 / (newDist / speed * deceleration));
                maxDistLower = maxDistLower + outsideDist;
                speed = speed * maxDistLower / newDist;
                newDist = maxDistLower;
            }

            newDist = newDist * (dist < 0 ? -1 : 1);
            newTime = speed / deceleration;

            return {
                dist: newDist,
                time: Math.round(newTime)
            };
        },

        _offset: function(el) {
            var left = -el.offsetLeft,
                top = -el.offsetTop;

            try { 
                while(el = el.offsetParent) {
                    if(this.options.useTransform == false && el.id && el.id.lastIndexOf("_scrollee") != -1)
                        continue;
                    left -= el.offsetLeft;
                    top -= el.offsetTop;
                }
            } catch(err) {};

            return {
                left: left,
                top: top
            };
        },

        destroy: function() {
            
            
            this.hScrollbar = false;
            this.vScrollbar = false;
            this._scrollbar('h');
            this._scrollbar('v');
            
            if(this.scroller) {
                if($KU.isTouchSupported) {
                    kony.events.removeEventListener(this.scroller, "touchstart", this, false);
                    kony.events.removeEventListener(this.scroller, "touchcancel", this, false);
                } else if($KU.isPointerSupported) {
                    if("onpointerdown" in window) {
                        kony.events.removeEventListener(this.scroller, "pointerdown", this, false);
                        kony.events.removeEventListener(this.scroller, "pointercancel", this, false);
                    } else {
                        kony.events.removeEventListener(this.scroller, "MSPointerDown", this, false);
                        kony.events.removeEventListener(this.scroller, "MSPointerCancel", this, false);
                    }
                } else {
                    kony.events.removeEventListener(this.scroller, "mousedown", this);
                    kony.events.removeEventListener(this.scroller, "mouseout", this);
                }
            }

            if($KU.isOrientationSupported)
                kony.events.removeEventListener(window, "orientationchange", this, false);
            else
                kony.events.removeEventListener(window, "resize", this);


            if(this.options.checkDOMChanges) clearInterval(this.checkDOMTime);
            var wModel = this.options.widgetModel;
            if(wModel && wModel.wType == 'Segment') {
                var listAnimation = wModel.listAnimation;
                listAnimation && listAnimation.destroy();
            }

            var isPopup = this.wrapper.getAttribute("kformname");
            if(!isPopup && !this.options.scrollbox)
                kony.events.removeEventListener(document, "touchmove", module.preventDefault);
        }
    };

    module.StickyScroller.prototype = {
        handleEvent: function(e) {
            switch(e.type) {
                case "scroll":
                    this.follow(e);
                    break;
            }
        },

        follow: function() {
            

            var scrollX = window.scrollX || document.documentElement.scrollLeft;
            var scrollY = window.scrollY || document.documentElement.scrollTop;

            this.headerH = this.header ? this.header.clientHeight : 0;
            this.footerH = this.footer ? this.footer.clientHeight : 0;
            this.appmenuH = this.appmenu ? this.appmenu.clientHeight : 0;

            this.wrapper.style.top = -(this.footerH + this.appmenuH) + 'px';
            

            if(this.header) {
                var scrollY_h = scrollY;
                this.header.style[$KU.transform] = translateOpen + scrollX + 'px,' + scrollY_h + 'px' + translateClose;
            }
            if(this.footer) {
                var scrollY_f = (window.innerHeight || document.body.clientHeight) + scrollY - (this.footerH) - (this.headerH);
                this.footer.style.bottom = this.y1 + this.appmenuH + 'px';
                this.footer.style[$KU.transform] = translateOpen + scrollX + 'px,' + scrollY_f + 'px' + translateClose;
            }
            if(this.appmenu) {
                var scrollY_a = (window.innerHeight || document.body.clientHeight) + scrollY - (this.footerH) - (this.headerH) - (this.appmenuH);
                this.appmenu.style[$KU.transform] = translateOpen + scrollX + 'px,' + scrollY_a + 'px' + translateClose;
            }
        },

        destroy: function() {
            kony.events.removeEventListener(window, 'scroll', this, false);
        }
    };

    module.gesture.prototype = {
        removeGesture: function(gestureType, updateModel) {
            
            clearTimeout(this.touchTimer);
            clearTimeout(this.longPressTimer);

            if(updateModel != false)
                this.widgetModel.gestures[gestureType] = "";

            var widget = this.widget;

            for(var i = 0; widget && i < widget.length; i++) {
                
                if($KU.isPointerSupported) {
                    if("onpointerdown" in window) {
                        kony.events.removeEventListener(widget[i], "pointerdown", this, false);
                        kony.events.removeEventListener(widget[i], "pointermove", this, false);
                        kony.events.removeEventListener(widget[i], "pointerup", this, false);
                        kony.events.removeEventListener(widget[i], "pointercancel", this, false);

                    } else {
                        kony.events.removeEventListener(widget[i], "MSPointerDown", this, false);
                        kony.events.removeEventListener(widget[i], "MSPointerMove", this, false);
                        kony.events.removeEventListener(widget[i], "MSPointerUp", this, false);
                        kony.events.removeEventListener(widget[i], "MSPointerCancel", this, false);
                    }

                    
                } else {
                    kony.events.removeEventListener(widget[i], "touchstart", this, false);
                    kony.events.removeEventListener(widget[i], "touchmove", this, false);
                    kony.events.removeEventListener(widget[i], "touchend", this, false);
                    kony.events.removeEventListener(widget[i], "gesturestart", this, false);
                    kony.events.removeEventListener(widget[i], "gesturechange", this, false);
                    kony.events.removeEventListener(widget[i], "gestureend", this, false);
                    kony.events.removeEventListener(widget[i], "touchcancel", this, false);
                }
            }

            
        },

        handleEvent: function(e) {
            switch(e.type) {
                case "touchstart":
                case "MSPointerDown":
                case "pointerdown":
                    this.onTouchStart(e);
                    break;
                case "touchmove":
                case "MSPointerMove":
                case "pointermove":
                    this.onTouchMove(e);
                    break;
                case "touchend":
                case "MSPointerUp":
                case "pointerup":
                case "touchcancel":
                case "MSPointerCancel":
                case "pointercancel":
                    
                    
                    this.onTouchEnd(e);
                    break;
                case "gesturestart":
                    this.onGestureStart(e);
                    break;
                case "gesturechange":
                    this.onGestureChange(e);
                    break;
                case "gestureend":
                    this.onGestureEnd(e);
                    break;
            }
        },

        onTouchStart: function(event) {
            var touch = event.touches && event.touches[0] || event;
            this.currentTouch = event;

            if($KU.isPointerSupported) {
                if("onpointerdown" in window) {
                    kony.events.addEventListener(event.currentTarget, "pointermove", this, false);
                    kony.events.addEventListener(event.currentTarget, "pointerup", this, false);
                    kony.events.addEventListener(event.currentTarget, "pointercancel", this, false);
                } else {
                    kony.events.addEventListener(event.currentTarget, "MSPointerMove", this, false);
                    kony.events.addEventListener(event.currentTarget, "MSPointerUp", this, false);
                    kony.events.addEventListener(event.currentTarget, "MSPointerCancel", this, false);
                }
            } else {
                kony.events.addEventListener(event.currentTarget, "touchmove", this, false);
                kony.events.addEventListener(event.currentTarget, "touchend", this, false);
                kony.events.addEventListener(event.currentTarget, "touchcancel", this, false);
            }

            this.x1 = touch.pageX;
            this.y1 = touch.pageY;

            var now = new Date().valueOf();
            var delta = now - (this.doubleTimer || now);
            this.last = this.doubleTimer = now;

            
            if(delta > 0 && delta <= 250) 
                this.isDoubleTap = true;
            else
                this.isDoubleTap = false;
            
            this.touchTimer && clearTimeout(this.touchTimer);
            this.curTarget = event.currentTarget;
            
            var that = this;
            this.LONGPRESS && (this.longPressTimer = setTimeout(function() {
                that.onLongTap(that.curTarget);
            }, this.longTapDelay));
        },

        onTouchMove: function(event) {
            var touch = event.touches && event.touches[0] || event;
            this.x2 = touch.pageX;
            this.y2 = touch.pageY;
        },

        onTouchEnd: function(event) {
            var touch = event.touches && event.touches[0] || event;

            var that = this;
            this.currentTouch = event;

            if($KU.isPointerSupported) {
                if("onpointerdown" in window) {
                    kony.events.removeEventListener(event.currentTarget, "pointermove", this, false);
                    kony.events.removeEventListener(event.currentTarget, "pointerup", this, false);
                    kony.events.removeEventListener(event.currentTarget, "pointercancel", this, false);
                } else {
                    kony.events.removeEventListener(event.currentTarget, "MSPointerMove", this, false);
                    kony.events.removeEventListener(event.currentTarget, "MSPointerUp", this, false);
                    kony.events.removeEventListener(event.currentTarget, "MSPointerCancel", this, false);

                }
            } else {
                kony.events.removeEventListener(event.currentTarget, "touchmove", this, false);
                kony.events.removeEventListener(event.currentTarget, "touchend", this, false);
                kony.events.removeEventListener(event.currentTarget, "touchcancel", this, false);
            }

            if(this.isDoubleTap && this.TAP && this.taps == 2) {
                kony.print("DOUBLE TAP");
                spaAPM && spaAPM.sendMsg(event.currentTarget, 'Gesture Tap');
                this.executeCallback(event.currentTarget);
                delete this.doubleTimer;
            }

            var deltaX = (this.x2 ? this.x2 : this.x1) - this.x1;
            var deltaY = (this.y2 ? this.y2 : this.y1) - this.y1;

            if((this.x2 > 0 && deltaX != 0) || (this.y2 > 0 && deltaY != 0)) {
                if(this.SWIPE) {

                    var absDeltaX = Math.abs(deltaX);
                    var absDeltaY = Math.abs(deltaY);

                    if(absDeltaX > this.swipedistance || absDeltaY > this.swipedistance) 
                    {
                        var dir = $KU.getSwipeDirection(deltaX, deltaY);
                        kony.print("SWIPE: " + dir);
                        spaAPM && spaAPM.sendMsg(event.currentTarget, 'Gesture Swipe', {
                            "swipeDirection": dir
                        });
                        
                        this.executeCallback(event.currentTarget, dir);
                    }
                }
                
                this.x1 = this.x2 = this.y1 = this.y2 = 0;
            } else if(this.last) {
                if(this.TAP && this.taps == 1) {
                    if(this.widgetModel.gestures && this.widgetModel.gestures[10] && this.widgetModel.gestures[11]) {
                        this.touchTimer = setTimeout(function() {
                            if($KG.gestures[that.gestureIdentifier]) {
                                var isDoubleTapFired = false;
                                var doubleTapInstances = that.widgetModel.gestures[11];
                                for(var prop in doubleTapInstances) {
                                    isDoubleTapFired = doubleTapInstances[prop].instance.isDoubleTap;
                                }
                                if(!isDoubleTapFired)
                                    spaAPM && spaAPM.sendMsg(event.currentTarget, 'Gesture Tap');
                                that.executeCallback(event.currentTarget);
                                
                            }
                        }, 250);
                    } else if($KG.gestures[that.gestureIdentifier]) {
                        kony.print("TAP");
                        spaAPM && spaAPM.sendMsg(event.currentTarget, 'Gesture Tap');
                        that.executeCallback(event.currentTarget);
                        
                    }
                }
            }
            this.last = 0;
        },

        onTouchCancel: function() {
            
        },

        
        onGestureStart: function(event) {
            var touch = event.touches && event.touches[0] || event;
            this.currentTouch = event;

            kony.events.addEventListener(event.currentTarget, "gesturechange", this, false);
            kony.events.addEventListener(event.currentTarget, "gestureend", this, false);

            this.x1 = touch.pageX;
            this.y1 = touch.pageY;

            this.gestureStartTime = new Date().valueOf();

            this.excecuteGestureEvent(event, 1);
        },

        onGestureChange: function(event) {
            if(!event) return;

            if(this.continuousEvents) {
                var touch = event.touches && event.touches[0] || event;
                this.x2 = touch.pageX;
                this.y2 = touch.pageY;

                this.excecuteGestureEvent(event, 2);

            }
        },

        onGestureEnd: function(event) {
            kony.events.removeEventListener(event.currentTarget, "gesturechange", this, false);
            kony.events.removeEventListener(event.currentTarget, "gestureend", this, false);

            var touch = event.touches && event.touches[0] || event;
            this.x2 = touch.pageX;
            this.y2 = touch.pageY;

            this.excecuteGestureEvent(event, 3);
        },

        excecuteGestureEvent: function(event, gestureState) {

            if(this.ROTATION) {
                this.rotation = event.rotation;
                spaAPM && spaAPM.sendMsg(event.currentTarget, 'Gesture Rotation');
                
                this.executeCallback(event.currentTarget, null, gestureState);
            }

            this.scale = event.scale;

            
            if(this.PINCH && event.scale !== 1) {

                if(gestureState && gestureState > 1) {
                    var now = new Date().valueOf();
                    var secElapsed = (now - this.gestureStartTime) / 1000;
                    
                    this.velocity = (1 - event.scale) / secElapsed
                    this.velocityX = (this.x2 - this.x1) / secElapsed;
                    this.velocityY = (this.y2 - this.y1) / secElapsed;
                }
                try {
                    spaAPM && spaAPM.sendMsg(event.currentTarget, 'Gesture Pinch');
                    
                    this.executeCallback(event.currentTarget, null, gestureState);

                } catch(e) {
                    
                }
            }

            if(this.PAN) {
                spaAPM && spaAPM.sendMsg(event.currentTarget, 'Gesture Pan');
                
                this.executeCallback(event.currentTarget, null, gestureState);
            }
        },

        onLongTap: function(curTarget) {
            if(this.last && this.LONGPRESS) {
                var duration = new Date().valueOf() - this.last;
                if(duration >= this.longTapDelay) {
                    if($KG.gestures[this.gestureIdentifier]) {
                        kony.print("LONGPRESS: " + this.longTapDelay + "ms");
                        spaAPM && spaAPM.sendMsg(curTarget, 'Gesture LongPress');
                        
                        this.executeCallback(curTarget);
                    }
                }
            }
        },

        executeCallback: function(curTarget, dir, gestureState) {
            if(this.callback) {
                var gestureInfoObj = {};

                var setupParams = $KU.cloneObj(this.gestureObj);
                gestureInfoObj.gestureType = this.gestureType;
                gestureInfoObj.gesturesetUpParams = setupParams;

                
                gestureInfoObj.gestureState = gestureState;
                gestureInfoObj.rotation = this.rotation ? (-this.rotation) : 0;
                gestureInfoObj.velocity = this.velocity || 0;
                gestureInfoObj.velocityX = this.velocityX || 0;
                gestureInfoObj.velocityY = this.velocityY || 0;
                gestureInfoObj.scale = this.scale || 1;

                
                var widget = curTarget && (curTarget !== document) ? curTarget : (this.widget.length ? this.widget[0] : this.widget);

                var coords = $KW.Utils.getOffset(widget);
                
                var touch = (this.currentTouch.touches && this.currentTouch.touches[0]) || this.currentTouch;
                gestureInfoObj.gesturePosition = $KU.getgesturePosition(touch.pageX, touch.pageY, widget.clientWidth, widget.clientHeight, coords.left, coords.top);

                if(gestureInfoObj.gestureType == constants.GESTURE_TYPE_SWIPE)
                    gestureInfoObj.swipeDirection = $KU.getIntegerDirection(dir);

                gestureInfoObj.gestureX = this.x2 || this.x1;
                gestureInfoObj.gestureY = this.y2 || this.y1;

                gestureInfoObj.widgetWidth = widget.clientWidth;
                gestureInfoObj.widgetHeight = widget.clientHeight;
                if(gestureInfoObj.gestureType == constants.GESTURE_TYPE_PAN) {
                    gestureInfoObj.translationX = Math.abs(gestureInfoObj.gestureX - this.x1);
                    gestureInfoObj.translationY = Math.abs(gestureInfoObj.gestureY - this.y1);
                }
                var widgetModel = this.widgetModel;
                if(curTarget && (curTarget !== document)) {
                    var containerID = curTarget.getAttribute('kcontainerid');
                    if(containerID) {
                        var segmentModel = $KW.Utils.getContainerModelById(curTarget, containerID);
                        var context = {};
                        if(segmentModel.wType === "Segment") {
                            if(segmentModel.viewtype == "pageview") {
                                var targetNode = $KU.getParentByAttribute(curTarget, "index");
                            } else {
                                var targetNode = $KU.getParentByTagName(curTarget, 'li');
                            }
                            

                            var rowData;
                            context.widgetInfo = segmentModel;
                            if(segmentModel.hasSections) {
                                var secIndices = targetNode.getAttribute("secindex").split(',');
                                context.rowIndex = +secIndices[1];
                                context.sectionIndex = +secIndices[0];
                                rowdata = segmentModel.data[context.sectionIndex][IndexJL + 1][context.rowIndex];
                            } else {
                                context.rowIndex = +targetNode.getAttribute('index');
                                context.sectionIndex = 0;
                                rowdata = segmentModel.data[context.rowIndex];
                            }
                            var rowModelData = rowdata && rowdata[segmentModel.widgetdatamap[this.widgetModel.id]];
                            widgetModel = $KU.extend({}, this.widgetModel);
                            if(rowModelData)
                                widgetModel = $KU.extend(widgetModel, rowModelData);
                        }
                    }
                }
                var currentForm = this.widgetModel["__currentForm"];
                if(currentForm) {
                    
                    $KU.executeWidgetEventHandler(currentForm, this.callback, gestureInfoObj);
                } else {
                    if(curTarget) {
                        
                        $KU.executeWidgetEventHandler(widgetModel, this.callback, gestureInfoObj, context);
                    } else {
                        
                        $KU.executeWidgetEventHandler(this.widgetModel, this.callback, gestureInfoObj);
                    }
                }
            }
        }
    };

    (function(pkg) {
        pkg.events.touchstart = "touchstart";
        pkg.events.touchmove = "touchmove";
        pkg.events.touchend = "touchend";
        pkg.events.touchcancel = "touchcancel";

        pkg.events.mousestart = "mousedown";
        pkg.events.mousemove = "mousemove";
        pkg.events.mouseend = "mouseup";
        pkg.events.mousecancel = "mouseout";

        if(document.addEventListener) {
            pkg.events.eventListener = "addEventListener";
        } else {
            pkg.events.eventListener = "attachEvent";
            pkg.events.touchstart = "mousedown";
            pkg.events.touchmove = "mousemove";
            pkg.events.touchend = "mouseup";
            pkg.events.touchcancel = "mouseout";
        }

        var isPointerSupported = navigator.msPointerEnabled;
        if(isPointerSupported) {
            if("onpointerdown" in window) {
                pkg.events.touchstart = "pointerdown";
                pkg.events.touchmove = "pointermove";
                pkg.events.touchend = "pointerup";

            } else {
                pkg.events.touchstart = "MSPointerDown";
                pkg.events.touchmove = "MSPointerMove";
                pkg.events.touchend = "MSPointerUp";
            }
        }
        if(document.removeEventListener) {
            pkg.events.removeEventListener = "removeEventListener";
        } else {
            pkg.events.removeEventListener = "detachEvent";
        }
    })(module);

    module.TouchEvents.prototype = {
        removeTouch: function(eventType, updateModel) {
            if(updateModel != false)
                this.widgetModel.touches[eventType] = "";

            var widgetNode = this.widgetNode;
            var touchEvent = module.events.touchstart;
            var mouseEvent = module.events.mousestart;
            switch(eventType) {
                case "touchstart":
                    touchEvent = module.events.touchstart;
                    mouseEvent = module.events.mousestart;
                    break;
                case "touchmove":
                    touchEvent = module.events.touchmove;
                    mouseEvent = module.events.mousemove;
                    break;
                case "touchend":
                    touchEvent = module.events.touchend;
                    mouseEvent = module.events.mouseend;
                    break;
                case "touchcancel":
                    touchEvent = module.events.touchcancel;
                    mouseEvent = module.events.mousecancel;
                    break;
            }
            kony.events.removeEventListener(widgetNode, touchEvent, this.handleEventListener, false);
            kony.events.removeEventListener(widgetNode, mouseEvent, this.handleEventListener, false);

        },

        handleEvent: function(event) {
            var widgetModel, containerId;

            if(event.type == "scroll" || event.type == "mousewheel" || event.type == "DOMMouseScroll") {
                this.handleScrollEvent(event);
            } else {
                
                var touch = (event.touches && event.touches[0]) || (event.changedTouches && event.changedTouches[0]) || event;
                var x1 = touch.pageX || touch.clientX;
                var y1 = touch.pageY || touch.clientY;

                
                if(event.type == "touchstart" || event.type == "pointerdown") {
                    this.touchStartFired = true;
                }
                if(event.type == "touchend" || event.type == "pointerup") {
                    this.touchEndFired = true;
                }

                if(this.touchStartFired && event.type == 'mousedown') {
                    this.touchStartFired = false;
                    return;
                }
                if(this.touchEndFired && event.type == 'mouseup') {
                    this.touchEndFired = false;
                    return;
                }

                
                var coords = $KW.Utils.getPosition(this.widgetTopNode);
                x1 = x1 - coords.left;
                y1 = y1 - coords.top;

                widgetModel = this.widgetModel;
                spaAPM && spaAPM.sendMsg(widgetModel, 'TouchEvent', {
                    "eventtype": event.type
                });
                $KAR && $KAR.sendRecording(widgetModel, event.type, {
                    'target': this.widgetNode,
                    'eventObject': event,
                    'eventType': 'touch',
                    'x': x1,
                    'y': y1
                });
                this.callback && $KU.executeWidgetEventHandler(widgetModel, this.callback, x1, y1);
            }
        },

        handleScrollEvent: function(eventObject) {
            var widgetModel = this.widgetModel;
            if(!widgetModel.enableScrolling)
                return;

            var frame = widgetModel.frame;
            var target = this.widgetNode;
            var width = frame.width;
            var height = frame.height;
            var scrolldirection = (widgetModel.wType == "Form") ? "vertical" : $KW.stringifyScrolldirection[widgetModel.scrolldirection];
            var isScrollingAllowed = true;
            var scrolledWidth = width + target.scrollLeft;
            var scrolledHeight = height + target.scrollTop;
            var scrolledUp = false;

            if((eventObject.wheelDelta && eventObject.wheelDelta > 0) || (eventObject.detail && eventObject.detail < 0)) {
                scrolledUp = true;
            }

            var reachedTop = (target.scrollTop == 0 && scrolledUp);
            var reachedLeft = (target.scrollLeft == 0 && scrolledUp);

            if(scrolldirection == "horizontal") {
                if(scrolledWidth >= target.scrollWidth || reachedLeft) {
                    isScrollingAllowed = false;
                }
            } else if(scrolldirection == "vertical") {
                if(scrolledHeight >= target.scrollHeight || reachedTop) {
                    isScrollingAllowed = false;
                }
            } else if(scrolldirection == "both") {
                if(scrolledWidth >= target.scrollWidth && scrolledHeight >= target.scrollHeight || (reachedTop && reachedLeft)) {
                    isScrollingAllowed = false;
                }
            } else if(scrolldirection == "none") {
                isScrollingAllowed = false;
            }

            if(isScrollingAllowed) {

                
                if(this.widgetModel.enableonscrollwidgetpositionforsubwidgets) {
                    $KW.APIUtils.executeOnScrollingWidgetPosition(this.widgetModel);
                }

                if(!this.isScrolling) {
                    var scrollStartEvent = widgetModel.onScrollStart;
                    if(scrollStartEvent) {
                        scrollStartEvent && $KU.executeWidgetEventHandler(widgetModel, scrollStartEvent);
                    }
                    this.isScrolling = true;
                }
                var scrollingEvent = widgetModel.onScrolling;
                scrollingEvent && $KU.executeWidgetEventHandler(widgetModel, scrollingEvent);
                if(widgetModel.wType == 'CollectionView') {
                    $KW.CollectionView.Animation.handleOnItemDisplay(widgetModel);
                }
                if(widgetModel && widgetModel.wType == 'Segment') {
                    $KW.Segment.updateScrollTopOnScroll(widgetModel);
                }
                this.timer && clearTimeout(this.timer);
                this.timer = setTimeout(this.scrollEndCaller.bind(this), 100);
            }
        },

        scrollEndCaller: function() {
            var widgetModel = this.widgetModel;
            this.isScrolling = false;
            var onScrollEnd = widgetModel.onScrollEnd;
            
            onScrollEnd && $KU.executeWidgetEventHandler(widgetModel, onScrollEnd);
            if(widgetModel && widgetModel.wType == 'Segment') {
                var handler;
                $KW.Segment.updateScrollTopOnScroll(widgetModel);
                if(this.widgetNode.scrollTop == 0) {
                    handler = $KU.returnEventReference(widgetModel.scrollingevents.onreachingbeginning);
                    handler && $KU.executeWidgetEventHandler(widgetModel, handler);
                }
                if(Math.round(this.widgetNode.scrollTop + this.widgetNode.offsetHeight) >= this.widgetNode.scrollHeight) {
                    handler = $KU.returnEventReference(widgetModel.scrollingevents.onreachingend);
                    handler && $KU.executeWidgetEventHandler(widgetModel, handler);
                }
            }
            
        }
    };

    module.Drag.prototype = {
        addDrag: function() {
            if(this.dragableElement) {
                kony.events.addEventListener(this.dragableElement, module.events.touchstart, this.handleEvent.bind(this));
            }
        },

        removeDrag: function() {
            
            this.dragableElement[kony.widgets.touch.events.removeEventListener](module.events.touchstart, this, false);
        },

        handleEvent: function(e) {
            switch(e.type) {
                case module.events.touchstart:
                    return this.onTouchStart(e);
                    break;
                case module.events.touchmove:
                    return this.onTouchMove(e);

                    break;
                case module.events.touchend:
                    return this.onTouchEnd(e);
                    break;
                case module.events.touchcancel:
                    return this.onTouchCancel(e);
                    break;
            }
        },

        onTouchStart: function(event) {
            var touch = event.touches && event.touches[0] || event;

            this.x1 = touch.pageX || touch.clientX;
            this.y1 = touch.pageY || touch.clientY;

            if(this.model && this.model.wType == 'Popup') {
                if(this.dragableElement.className == "resizearea") {
                    this.offsetX = this.moveElement.offsetWidth;
                    this.offsetY = this.moveElement.childNodes[0].children[1].clientHeight;
                } else {
                    this.dragableElement.style.cursor = "move";
                    this.offsetX = $KU.getInt(this.moveElement.offsetLeft);
                    this.offsetY = $KU.getInt(this.moveElement.offsetTop);
                }
                this.dragEvent(this, module.events.touchstart);
            } else {
                kony.events.stopPropagation(event);
                this.dragEvent(this.moveElement, this.x1, this.y1, "1");
            }

            this.handleEventListener = this.handleEvent.bind(this);
            kony.events.addEventListener(this.containerElement, module.events.touchmove, this.handleEventListener);
            kony.events.addEventListener(this.containerElement, module.events.touchend, this.handleEventListener);
            kony.events.addEventListener(document, kony.widgets.touch.events.touchcancel, this.handleEventListener);

            
            document.onselectstart = function() {
                return false;
            };
            
            this.dragableElement.ondragstart = function() {
                return false;
            };

            
            return false;
        },

        onTouchMove: function(event) {
            var touch = event.touches && event.touches[0] || event;
            this.x2 = touch.pageX || touch.clientX;
            this.y2 = touch.pageY || touch.clientY;

            if(this.model && this.model.wType == 'Popup') {
                var horizontalMoveDistance = this.offsetX + this.x2 - this.x1;
                var verticalMoveDistance = this.offsetY + this.y2 - this.y1;
                var verticalAvailableDistance = (document.documentElement.clientHeight || window.innerHeight || document.body.clientHeight) - this.widget.clientHeight;
                var horizontalAvailableDistance = (document.documentElement.clientWidth || window.innerWidth || document.body.clientWidth) - this.widget.clientWidth;

                if(this.dragableElement.className == "resizearea") {
                    this.moveElement.style.width = Math.max(horizontalMoveDistance, 150) + "px";
                    this.moveElement.childNodes[0].children[1].style.height = Math.max(verticalMoveDistance, 100) + "px";
                } else {
                    if(horizontalMoveDistance < 0)
                        this.moveElement.style.left = '0px';
                    else if(horizontalMoveDistance > horizontalAvailableDistance)
                        this.moveElement.style.left = horizontalAvailableDistance + 'px';
                    else
                        this.moveElement.style.left = (this.offsetX + this.x2 - this.x1) + 'px';

                    if(verticalMoveDistance < 0)
                        this.moveElement.style.top = '0px';
                    else if(verticalMoveDistance > verticalAvailableDistance)
                        this.moveElement.style.top = verticalAvailableDistance + 'px';
                    else
                        this.moveElement.style.top = (this.offsetY + this.y2 - this.y1) + 'px';
                }

                this.dragEvent(this, module.events.touchmove);
            } else
                this.dragEvent(this.moveElement, this.x2, this.y2, "2");
        },

        onTouchEnd: function(event) {
            var touch = event.touches && event.touches[0] || event;
            this.x3 = touch.pageX || touch.clientX;
            this.y3 = touch.pageY || touch.clientY;

            if(this.model && this.model.wType == 'Popup')
                this.dragEvent(this, module.events.touchend);
            else
                this.dragEvent(this.moveElement, this.x3, this.y3, "3");
            document.onselectstart = null;
            this.dragableElement.ondragstart = null;
            this.removeEvents();
        },

        onTouchCancel: function(event) {
            this.dragEvent(this, module.events.touchend);
            var from = event.relatedTarget || event.toElement;
            if(!from || from.nodeName == "HTML")
                this.removeEvents();
        },

        removeEvents: function() {
            
            kony.events.removeEventListener(this.containerElement, kony.widgets.touch.events.touchmove, this.handleEventListener);
            kony.events.removeEventListener(this.containerElement, kony.widgets.touch.events.touchend, this.handleEventListener);
            kony.events.removeEventListener(document, kony.widgets.touch.events.touchcancel, this.handleEventListener);
        }
    };

    var isWinPhone = /Windows Phone/gi.test(navigator.userAgent);
    if((typeof $KU !== 'undefined') && $KU.iOS || (!isWinPhone) && /ip(od|ad|hone)/gi.test(navigator.userAgent)) {
        var TouchClick = (function() {
            function TouchClick() {
                
                this.trackingClick = false;
                
                this.trackingClickStart = 0;
                
                this.targetElement = null;
                
                this.touchStartY = 0;
                
                this.lastTouchIdentifier = 0;
                
                this.touchBoundary = 10;
                
                this.tapDelay = 200;
                
                this.tapTimeout = 700;
                
                this.deviceIsWindowPhone = navigator.userAgent.indexOf('Windows Phone') >= 0;
                
                this.deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !this.deviceIsWindowPhone;
                
                this.deviceIsIOS = /ip(od|ad|hone)/gi.test(navigator.userAgent) && !this.deviceIsWindowPhone;
                this.deviceIsIOS4 = this.deviceIsIOS && (/OS 4_\d(_\d)?/.test(navigator.userAgent));
                this.deviceIsIOSWithBadTarget = this.deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);
                this.deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;
                this.cancelNextClick = false;
                this.lastClickTime = 0;
            }
            
            TouchClick.prototype.needsClick = function(target) {
                var nodeName = target.nodeName.toLocaleLowerCase();
                switch(nodeName) {
                    case 'button':
                    case 'select':
                    case 'textarea':
                        if(target.disabled)
                            return true;
                        break;
                    case 'input':
                        
                        if((this.deviceIsIOS && target.type === 'file') || (target.disabled))
                            return true;
                        break;
                        
                    case 'iframe':
                    case 'video':
                        return true;
                }
                return false;
            };
            
            TouchClick.prototype.needsFocus = function(target) {
                var targetName = target.nodeName.toLocaleLowerCase();
                var targetInputElement = target;
                switch(targetName) {
                    case 'textarea':
                        return true;
                    case 'select':
                        return !this.deviceIsAndroid;
                    case 'input':
                        switch(target.type) {
                            case 'button':
                            case 'checkbox':
                            case 'file':
                            case 'image':
                            case 'radio':
                            case 'submit':
                                return false;
                        }
                        
                        return !target.disabled && !targetInputElement.readOnly;
                }
                return false;
            };
            
            TouchClick.prototype.sendClick = function(target, ev) {
                var clickEvent, touch;
                
                if(document.activeElement && document.activeElement != target)
                    document.activeElement.blur();
                touch = ev.changedTouches[0];
                
                clickEvent = document.createEvent('MouseEvents');
                clickEvent.initMouseEvent('click', true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
                clickEvent.forwardedTouchEvent = true;
                target.dispatchEvent(clickEvent);
            };
            
            TouchClick.prototype.focus = function(target) {
                
                
                
                
                var targetInputElement = target;
                var isTypeDateElement = target.type && target.type.indexOf('date') === 0;
                var isTimeElement = target.type && target.type.indexOf('time') === 0;
                var isMonthElement = target.type && target.type.indexOf('month') === 0;
                var result = this.deviceIsIOS && targetInputElement.setSelectionRange && !isTypeDateElement && !isTimeElement && !isMonthElement;
                if(result) {
                    var length = targetInputElement.value.length;
                    targetInputElement.setSelectionRange(length, length);
                    return;
                }
                targetInputElement.focus();
            };

            TouchClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
                
                if(eventTarget.nodeType === Node.TEXT_NODE)
                    return eventTarget.parentNode;
                return eventTarget;
            };
            
            TouchClick.prototype.onTouchStart = function(event) {
                
                if(event.targetTouches.length > 1)
                    return true;
                var targetElement = this.getTargetElementFromEventTarget(event.target);
                var touch = event.targetTouches[0];
                if(this.deviceIsIOS) {
                    
                    var selection = window.getSelection();
                    if(selection.rangeCount && !selection.isCollapsed)
                        return true;
                    if(!this.deviceIsIOS4) {
                        
                        
                        
                        
                        
                        
                        
                        
                        if(touch.identifier && (touch.identifier == this.lastTouchIdentifier)) {
                            event.preventDefault();
                            return false;
                        }
                        this.lastTouchIdentifier = touch.identifier;
                    }
                }
                this.trackingClick = true;
                this.trackingClickStart = event.timeStamp;
                this.targetElement = targetElement;
                this.touchStartX = touch.pageX;
                this.touchStartY = touch.pageY;
                
                if((event.timeStamp - this.lastClickTime) < this.tapDelay)
                    event.preventDefault();
                return true;
            };
            
            TouchClick.prototype.touchHasMoved = function(e) {
                var touch = e.changedTouches[0];
                var r1 = Math.abs(touch.pageX - this.touchStartX) > this.touchBoundary;
                var r2 = Math.abs(touch.pageY - this.touchStartY) > this.touchBoundary;
                if(r1 || r2)
                    return true;
                return false;
            };
            
            TouchClick.prototype.onTouchMove = function(e) {
                if(!this.trackingClick)
                    return true;
                
                if(this.targetElement != this.getTargetElementFromEventTarget(e.target) || (this.touchHasMoved(e))) {
                    this.trackingClick = false;
                    this.targetElement = null;
                }
                return true;
            };
            
            TouchClick.prototype.findControl = function(el) {
                
                if(el.control)
                    return el.control;
                
                if(el.htmlFor)
                    return document.getElementById(el.htmlFor);
                
                
                return el.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
            };
            
            TouchClick.prototype.onTouchEnd = function(e) {
                var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;
                if(!this.trackingClick)
                    return true;
                
                if((e.timeStamp - this.lastClickTime) < this.tapDelay) {
                    this.cancelNextClick = true;
                    return true;
                }
                if((e.timeStamp - this.trackingClickStart) > this.tapTimeout)
                    return true;
                
                this.cancelNextClick = false;
                this.lastClickTime = e.timeStamp;
                trackingClickStart = this.trackingClickStart;
                this.trackingClick = false;
                this.trackingClickStart = 0;
                
                
                
                
                if(this.deviceIsIOSWithBadTarget) {
                    touch = e.changedTouches[0];
                    
                    targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
                }
                targetTagName = targetElement.tagName.toLocaleLowerCase();
                if(targetTagName === 'label') {
                    forElement = this.findControl(targetElement);
                    if(forElement) {
                        this.focus(targetElement);
                        targetElement = forElement;
                    }
                } else if(this.needsFocus(targetElement)) {
                    
                    
                    
                    
                    
                    
                    var r1 = (e.timeStamp - trackingClickStart) > 100;
                    var r2 = this.deviceIsIOS && (window.top !== window) && (targetTagName === 'input');
                    if(r1 || r2) {
                        this.targetElement = null;
                        return false;
                    }
                    this.focus(targetElement);
                    this.sendClick(targetElement, e);
                    
                    
                    if(!this.deviceIsIOS || (targetTagName !== 'select')) {
                        this.targetElement = null;
                        e.preventDefault();
                    }
                    return false;
                }
                if(this.deviceIsIOS && !this.deviceIsIOS4) {
                    
                    
                    
                    scrollParent = targetElement['fastClickScrollParent'];
                    if(scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop)
                        return true;
                }
                
                
                if(!this.needsClick(targetElement)) {
                    e.preventDefault();
                    this.sendClick(targetElement, e);
                }
                return false;
            };
            
            TouchClick.prototype.onTouchCancel = function(e) {
                this.trackingClick = false;
                this.targetElement = null;
            };
            


            TouchClick.prototype.preventDefault = function(e) {
                if(e.type === 'touchstart' || e.type === 'touchend') {
                    this.trackingClick = false;
                    this.targetElement = null;
                }
            };
            
            TouchClick.prototype.onMouse = function(e) {
                
                if(!this.targetElement)
                    return true;
                if(e.forwardedTouchEvent)
                    return true;
                
                if(!e.cancelable)
                    return true;
                
                
                
                var r1 = this.needsClick(this.targetElement);
                if(!r1 || this.cancelNextClick) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }
                
                return true;
            };
            
            TouchClick.prototype.onClick = function(e) {
                var permitted;
                
                
                if(this.trackingClick) {
                    this.targetElement = null;
                    this.trackingClick = false;
                    return true;
                }
                
                
                
                var target = e.target;
                if((target.type === 'submit') && (e.detail === 0))
                    return true;
                permitted = this.onMouse(e);
                
                
                if(!permitted)
                    this.targetElement = null;
                
                return permitted;
            };
            TouchClick.prototype.handleEvent = function(e) {
                
                if(!TouchClick.isAppBehaviourVerified) {
                    TouchClick.isAppBehaviourVerified = true;
                    
                    
                    if(!($KG && $KG.appbehaviors['handleClickWithTap'])) {
                        TouchClick.prototype.handleEvent = function() {};
                        if(console && console.log)
                            kony.web.logger("log", 'unregistering fast click');
                        return;
                    }
                }
                switch(e.type) {
                    case 'click':
                        this.onClick(e);
                        break;
                    case 'touchstart':
                        this.onTouchStart(e);
                        break;
                    case 'touchmove':
                        this.onTouchMove(e);
                        break;
                    case 'touchcancel':
                        this.onTouchCancel(e);
                        break;
                    case 'touchend':
                        this.onTouchEnd(e);
                        break;
                    default:
                        break;
                }
            };
            return TouchClick;
        })();

        kony.touchClickNotifier = new TouchClick();
    };


    return module;
}());
