
kony.gestures = (function() {
    var _getDistance = function(a, b) {
        var x, y;
        x = a.pageX - b.pageX;
        y = a.pageY - b.pageY;
        return Math.sqrt(x * x + y * y);
    };

    var _getDelta = function(a, b) {
        return [a.pageX - b.pageX, a.pageY - b.pageY];
    };

    var _getAnchorPoints = function(clientRects, touches) {
        var x3 = (touches[0].pageX + touches[1].pageX) /2,
            y3 = (touches[0].pageY + touches[1].pageY) /2,
            x1 = clientRects.x,
            y1 = clientRects.y,
            x2 = x1 + clientRects.width,
            y2 = y1 + clientRects.height;

        var anchorPoint = [Math.abs((x3 - x1)/(x2 - x1)), Math.abs((y3 - y1)/(y2 - y1))];

        return anchorPoint;
    };
    var _arrangeOverlayWidgets = function(imageNode, imageModel, scaleValue, clientRects, checkDiff, copyFrameToOriginal) {
        var overlayWidgets = imageModel.overlayWidgets || [], i, wModel, diff, wNode,
        widgetRects = imageNode.parentNode.getBoundingClientRect(), frame;

        if(checkDiff) {
            diff = [
                clientRects.x - widgetRects.x,
                clientRects.y - widgetRects.y
            ];
        } else {
            diff = [0, 0];
        }

        imageNode = $KW.Utils.getWidgetNodeFromNodeByModel(imageModel, imageNode);
        for(i = 0; i < overlayWidgets.length; i++) {
            wModel = overlayWidgets[i];
            wNode = imageNode.querySelector('#' + wModel.id);
            wNode = $KW.Utils.getWidgetNodeFromNodeByModel(wModel, wNode);
            if(!wNode) {
                continue;
            }
            wNode = wNode.parentNode;
            frame = {
                'x': wModel.originalFrame.x,
                'y': wModel.originalFrame.y,
                'height': wModel.originalFrame.height,
                'width': wModel.originalFrame.width
            };
            wModel.finalFrame = {
                'left': (frame.x * scaleValue) - diff[0] + kony.flex.PX,
                'top': (frame.y * scaleValue) - diff[1] + kony.flex.PX,
                'height': frame.height + kony.flex.PX,
                'width': frame.width + kony.flex.PX
            };
            $KW.FlexUtils.setWidgetPosition(wModel, wModel.finalFrame, wNode);
            wModel.frame = $KW.FlexLayoutEngine.getWidgetFrame(wModel, {
                width: frame.width,
                height: frame.height
            }, wModel.finalFrame);
        }
    };

    var _setTransitionValues = function(delta, scaleValue) {
        var clientFrame = this.widgetModel.originalFrame,
            x = (clientFrame.x * scaleValue) + delta[0],
            y = (clientFrame.y * scaleValue) + delta[1],
            _x = x + this.offset.x,
            _y = y + this.offset.y;

        if(delta[0] > 0) {
            _x += clientFrame.width;
        }
        if(delta[1] > 0) {
            _y += clientFrame.height;
        }
        if( _x < 0 || _x > this.boundingFrame.x
        || _y < 0 || _y > this.boundingFrame.y) {
            x = clientFrame.x * scaleValue;
            y = clientFrame.y * scaleValue;
            this.longPressTriggered = null;
        }
        this.widgetModel.finalFrame.left = x + 'px';
        this.widgetModel.finalFrame.top = y + 'px';
        $KW.FlexUtils.setWidgetPosition(this.widgetModel, this.widgetModel.finalFrame, this.widgetNode.parentNode);
        this.widgetModel.frame = $KW.FlexLayoutEngine.getWidgetFrame(this.widgetModel, {
            width: this.widgetModel.frame.width,
            height: this.widgetModel.frame.height
        }, this.widgetModel.finalFrame);
    };
    var module = {
        imagePinchZoom: function() {
            this.transformProp1 = kony.ui.makeAffineTransform();
            this.clientRects =  [];
            this.finalScale = this.completeScale = 1;
            this.registerPinch = function(imageModel) {
                this.finalScale = this.completeScale = imageModel.zoomvalue;
                this.addGestureRecognizer(imageModel);
            };

            this.addGestureRecognizer = function(widgetModel) {
                var widgetNode = (widgetModel ? document.querySelector('#' + $KW.Utils.getKMasterWidgetID(widgetModel)) : document);
                this.widgetNode = widgetNode;
                this.widgetModel = widgetModel;
                kony.events.addEventListener(widgetNode, "touchstart", this, false);
                kony.events.addEventListener(widgetNode, "touchmove", this, false);
                kony.events.addEventListener(widgetNode, "touchend", this, false);
            };
        },
        longPress: function() {
            this.longPressDelay = 1000;
            this.registerLongPress = function(wNode, wModel) {
                this.widgetNode = wNode;
                this.widgetModel = wModel;
                kony.events.addEventListener(wNode, "touchstart", this, false);
                kony.events.addEventListener(wNode, "touchmove", this, false);
                kony.events.addEventListener(wNode, "touchend", this, false);
                kony.events.addEventListener(wNode, "contextmenu", this, false);
            }
        },
        pan: function() {
            this.registerPan = function(wModel, widgetNode) {
                this.widgetNode = widgetNode;
                this.widgetModel = wModel;
                kony.events.addEventListener(widgetNode, "touchstart", this, false);
                kony.events.addEventListener(widgetNode, "touchmove", this, false);
                kony.events.addEventListener(widgetNode, "touchend", this, false);
            }
        }
    };

    module.imagePinchZoom.prototype = {

        handleEvent: function(event) {
            switch(event.type) {
                case "touchstart":
                    this.onTouchStart(event);
                    break;
                case "touchmove":
                    this.onTouchMove(event);
                    break;
                case "touchend":
                    this.onTouchEnd(event);
                    break;
            }
        },

        onTouchStart: function(event) {
            var gestureInfo = {
                    'scale': 1,
                    'gestureState': 1
                };
        },

        onTouchMove: function(event) {
            var gestureInfo, touches = event.touches, targetPinchDistance, targetScale;
            if(touches.length >= 2) {
                this.capture = 1;
                targetPinchDistance = _getDistance(touches[0], touches[1]);
                if(!this.initialPinchDistance) {
                    this.initialPinchDistance = targetPinchDistance;
                    gestureInfo = {
                        'gestureState': 1
                    };
                    this.perFormPinchAndZoom(this.widgetModel, gestureInfo);
                } else if(Math.abs(this.initialPinchDistance - targetPinchDistance) > 1) {
                    this.scale = targetPinchDistance / this.initialPinchDistance;
                    gestureInfo = {
                        'scale': this.scale,
                        'touches': touches,
                        'gestureState': 2
                    };
                    this.perFormPinchAndZoom(this.widgetModel, gestureInfo);
                }
            }
        },

        onTouchEnd: function(event) {
            var gestureInfo = {
                'scale': this.scale,
                'gestureState': 3
            };
            delete this.initialPinchDistance;
            delete this.capture;
            this.perFormPinchAndZoom(this.widgetModel, gestureInfo);
        },

        perFormPinchAndZoom: function(widgetModel, gestureInfo) {
            var scaleValue = gestureInfo.scale, widgetNode = $KU.getNodeByModel(widgetModel),
                style, scrollerInstance, options, anchorPoint, imageRects, originalHeight, originalWidth,
                clientRects, newContentOffset, imgTagRects;

            if(gestureInfo.gestureState === 1) {
                this.clientRects = widgetNode.parentNode.getBoundingClientRect();
            } else if(gestureInfo.gestureState === 2) {
                if(this.completeScale * scaleValue <= 20 && this.completeScale * scaleValue >= 1
                && this.finalScale * scaleValue <= 20 && this.finalScale * scaleValue >=1) {
                    scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(widgetModel) + '_scroller'];
                    options = scrollerInstance.options;
                    options.disableUserScroll = true;
                    options.vScroll = false;
                    options.hScroll = false;
                    scrollerInstance.refresh();

                    this.transformProp1.scale(scaleValue, scaleValue);
                    style = $KW.animUtils.applyTransform(widgetModel, this.transformProp1);

                    
                    widgetNode.parentNode.style[vendor + "Transform"] = style;
                    widgetNode.parentNode.style["transform"] = style;
                    this.triggeredPinch = true;

                    
                    anchorPoint = _getAnchorPoints(this.clientRects, gestureInfo.touches);
                    widgetNode.parentNode.style[vendor + "TransformOrigin"] = (anchorPoint[0] * 100) + "% " + (anchorPoint[1] * 100) + "% ";

                    this.completeScale = this.finalScale * scaleValue;

                    _arrangeOverlayWidgets(widgetNode, widgetModel, this.completeScale, this.clientRects, true, false);

                }
            } else {
                if(this.triggeredPinch) {
                    imageRects = widgetNode.parentNode.getBoundingClientRect();
                    originalHeight = imageRects.height;
                    originalWidth = imageRects.width;

                    imgTagRects = widgetNode.getBoundingClientRect();

                    widgetNode.parentNode.style.removeProperty(vendor + "Transform");
                    widgetNode.parentNode.style.removeProperty("transform");
                    widgetNode.parentNode.style.removeProperty("transform-origin");
                    widgetNode.parentNode.style.height = originalHeight + 'px';
                    widgetNode.parentNode.style.width = originalWidth + 'px';

                    widgetNode.style.height = imgTagRects.height + 'px';
                    widgetNode.style.width = imgTagRects.width + 'px';

                    clientRects = $KW.Utils.getWidgetNodeFromNodeByModel(widgetModel, widgetNode).getBoundingClientRect();
                    newContentOffset = {
                        x : imageRects.x - clientRects.x,
                        y : imageRects.y - clientRects.y
                    };

                    scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(widgetModel) + '_scroller'];
                    options = scrollerInstance.options;
                    options.disableUserScroll = false;
                    options.vScroll = true;
                    options.hScroll = true;

                    scrollerInstance.contentoffsetmove = true;
                    scrollerInstance.refresh();
                    scrollerInstance.scrollTo(newContentOffset.x, newContentOffset.y, 0);
                    scrollerInstance.moved = false;
                    scrollerInstance.contentoffsetmove = false;

                    _arrangeOverlayWidgets(widgetNode, widgetModel, this.completeScale, clientRects, false, true);

                    this.finalScale = this.completeScale;
                    this.widgetModel.zoomvalue = this.finalScale;

                    delete this.triggeredPinch;
                }
            }
        },

        removePinch: function(widgetNode) {
            var widgetNode = widgetNode || this.widgetNode;
            kony.events.removeEventListener(widgetNode, 'touchstart', this, false);
            kony.events.removeEventListener(widgetNode, 'touchmove', this, false);
            kony.events.removeEventListener(widgetNode, 'touchend', this, false);
        }
    };

    module.longPress.prototype = {
        handleEvent: function(event) {
            switch(event.type) {
                case "touchstart":
                    this.onTouchStart(event);
                    break;
                case "touchmove":
                    this.onTouchMove(event);
                    break;
                case "touchend":
                    this.onTouchEnd(event);
                    break;
                case "contextmenu":
                    return false;
                    break;
            }
        },

        onTouchStart: function(event) {
            var now = new Date().valueOf(), that, scrollerInstance, options, bounder, _scrolleeRects,
                _widgetNode, _scrollerRects, clientRects;

            this.last = this.doubleTimer = now;
            this.curTarget = event.currentTarget;

            that = this;
            if(this.widgetModel.wType === 'Image') { 
                event.preventDefault && event.preventDefault();
                event.stopPropagation && event.stopPropagation();
                event.cancelBubble = true;
                event.returnValue = false;
            }
            scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(this.widgetModel.parent) + '_scroller'];
            options = scrollerInstance.options;
            options.disableUserScroll = true;
            options.vScroll = false;
            options.hScroll = false;
            scrollerInstance.refresh();
            this.startTouch = event.touches[0];

            bounder = this.widgetModel.parent.frame;
            _widgetNode = $KU.getNodeByModel(this.widgetModel.parent);
            _scrolleeRects =_widgetNode.parentNode.getBoundingClientRect();
            _scrollerRects = $KW.Utils.getWidgetNodeFromNodeByModel(this.widgetModel.parent, _widgetNode).getBoundingClientRect();

            this.offset = {
                x: _scrolleeRects.x - _scrollerRects.x,
                y: _scrolleeRects.y - _scrollerRects.y
            }
            this.boundingFrame = {
                x: bounder.width,
                y: bounder.height
            };
            clientRects = $KU.getNodeByModel(this.widgetModel.parent);
            this.longPressTimer = setTimeout(function() {
                that.onLongPress(event);
            }, this.longPressDelay);
            if(this.widgetModel.ontouchstart) {
                $KU.executeWidgetEventHandler(this.widgetModel, this.widgetModel.ontouchstart);
            }
            if(this.widgetModel.wType === 'Image') { 
                return false;
            }
        },

        onTouchMove: function(event) {
            var distance, delta, transition;

            if(this.widgetModel.wType === 'Image') { 
                event.preventDefault && event.preventDefault();
                event.stopPropagation && event.stopPropagation();
                event.cancelBubble = true;
                event.returnValue = false;
            }
            this.endTouch = event.touches[0];
            distance = _getDistance(this.startTouch, this.endTouch);
            if(distance > 10 && !this.longPressTriggered) {
                if(this.longPressTimer) {
                    clearTimeout(this.longPressTimer);
                    this.longPressTimer = null;
                    this.longPressTriggered = false;
                }
            } else if(this.longPressTriggered) {
                    delta = _getDelta(this.endTouch, this.startTouch);
                    transition = _setTransitionValues.call(this, delta, this.widgetModel.parent.zoomvalue);
            }
            if(this.widgetModel.wType === 'Image') { 
                return false;
            }
        },

        onTouchEnd: function(event) {
            var scrollerInstance, options, zoomValue;

            if(this.widgetModel.wType === 'Image') { 
                event.preventDefault && event.preventDefault();
                event.stopPropagation && event.stopPropagation();
                event.cancelBubble = true;
                event.returnValue = false;
            }

            scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(this.widgetModel.parent) + '_scroller'];
            options = scrollerInstance.options;
            options.disableUserScroll = false;
            options.vScroll = true;
            options.hScroll = true;
            scrollerInstance.refresh();

            if(this.longPressTriggered) {
                this.longPressTimer = null;
                this.longPressTriggered = false;
                zoomValue = this.widgetModel.parent.zoomvalue;
                this.widgetModel.originalFrame.x = this.widgetModel.frame.x / zoomValue;
                this.widgetModel.originalFrame.y = this.widgetModel.frame.y / zoomValue;
            }

            if(this.widgetModel.ontouchend) {
                $KU.executeWidgetEventHandler(this.widgetModel, this.widgetModel.ontouchend);
            }

            if(this.widgetModel.wType === 'Image') { 
                return false;
            }
        },

        onLongPress: function(event) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
            this.longPressTriggered = true;
        }
    };
    module.pan.prototype = {
        handleEvent: function(event) {
            switch(event.type) {
                case "touchstart":
                    this.onTouchStart(event);
                    break;
                case "touchmove":
                    this.onTouchMove(event);
                    break;
                case "touchend":
                    this.onTouchEnd(event);
                    break;
                case "contextmenu":
                    return false;
                    break;
            }
        },

        onTouchStart: function(event) {
            var panContext = {}

            this.startTouch = event.touches[0];

            panContext.x1 = this.startTouch.pageX;
            panContext.y1 = this.startTouch.pageY;
            panContext.widgetModel = this.widgetModel;
            panContext.widgetNode = event.currentTarget;

            if(this.widgetModel.widgetswipemove) {
                this.widgetModel.swipeConfig.gestureStart.call(this.widgetModel.swipeConfig, this.widgetModel, panContext);
            }
        },

        onTouchMove: function(event) {
            var panContext = {}

            this.moveTouch = event.touches[0];

            panContext.x2 = this.moveTouch.pageX;
            panContext.y2 = this.moveTouch.pageY;
            panContext.widgetModel = this.widgetModel;
            panContext.widgetNode = event.currentTarget;

            if(this.widgetModel.widgetswipemove) {
                this.widgetModel.swipeConfig.gestureMove.call(this.widgetModel.swipeConfig, this.widgetModel, panContext);
            }
        },

        onTouchEnd: function(event) {
            var panContext = {}

            this.endTouch = event.changedTouches[0];

            panContext.x2 = this.endTouch.pageX;
            panContext.y2 = this.endTouch.pageY;
            panContext.widgetModel = this.widgetModel;
            panContext.widgetNode = event.currentTarget;

            if(this.widgetModel.widgetswipemove) {
                this.widgetModel.swipeConfig.gestureEnd.call(this.widgetModel.swipeConfig, this.widgetModel, panContext);
            }
        },

        removePan: function(widgetNode) {
            var widgetNode = widgetNode || this.widgetNode;
            kony.events.removeEventListener(widgetNode, 'touchstart', this, false);
            kony.events.removeEventListener(widgetNode, 'touchmove', this, false);
            kony.events.removeEventListener(widgetNode, 'touchend', this, false);
        }
    };

    return module;
}());