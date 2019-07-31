kony.automation.widget = (function() {

    var module = {

        getWidgetProperty: function(widgetPath, propertyName){

            $KU.logExecuting('kony.automation.widget.getWidgetProperty');
            if(arguments.length !== 2) {
                $KAUtils.throwExceptionInsufficientArguments();
            }

            $KU.logExecutingWithParams('kony.automation.widget.getWidgetProperty', widgetPath, propertyName);
            if(!$KU.isArray(widgetPath) || typeof propertyName !== 'string') {
                $KAUtils.throwExceptionInvalidArgumentType();
            }

            var widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
            var widgetModel = widgetConfig.widgetInstance;
            if(!widgetModel) {
                $KAUtils.throwExceptionWidgetPathNotFound();
            }
            $KU.logExecutingFinished('kony.automation.widget.getWidgetProperty');
            return widgetModel[propertyName];
        },

        getProperty: function(widgetPath, propertyName){

            $KU.logExecuting('kony.automation.widget.getProperty');
            if(arguments.length !== 2) {
                $KAUtils.throwExceptionInsufficientArguments();
            }

            $KU.logExecutingWithParams('kony.automation.widget.getProperty', widgetPath, propertyName);
            if(!$KU.isArray(widgetPath) || typeof propertyName !== 'string') {
                $KAUtils.throwExceptionInvalidArgumentType();
            }

            var widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
            var widgetModel = widgetConfig.widgetInstance;
            if(!widgetModel) {
                $KAUtils.throwExceptionWidgetPathNotFound();
            }
            $KU.logExecutingFinished('kony.automation.widget.getProperty');
            return widgetModel[propertyName];
        },

        
        touch: function(widgetPath, startPoint, movePoint, endPoint) {

            if(arguments.length !== 4) {
                $KAUtils.throwExceptionInsufficientArguments();
            }

            if(!$KU.isArray(widgetPath)
            || (startPoint && (!$KU.isArray(startPoint) || startPoint.length !== 2))
            || (movePoint && (!$KU.isArray(movePoint) || movePoint.length === 0))
            || (endPoint && (!$KU.isArray(endPoint) || endPoint.length !== 2))) {
                $KAUtils.throwExceptionInvalidArgumentType();
            }

            var node = null;
            var widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
            var widgetModel = widgetConfig.widgetInstance;
            if(!widgetModel) {
                $KAUtils.throwExceptionWidgetPathNotFound();
            }
            var scrollerInstance = widgetConfig.widgetInstance.scrollerInstance;
            node = $KAUtils.getNodeByModel(widgetConfig);

            if(startPoint) {
                widgetModel.onTouchStart && widgetModel.onTouchStart(widgetModel, startPoint[0], startPoint[1]);
            }

            if(movePoint) {
                for(var i = 0; i < movePoint.length; i++) {
                    var point = movePoint[i];
                    widgetModel.onTouchMove && widgetModel.onTouchMove(widgetModel, point[0], point[1]);
                }
            }

            if(endPoint) {
                widgetModel.onTouchEnd && widgetModel.onTouchEnd(widgetModel, endPoint[0], endPoint[1]);
            }
        },

        
        scroll: function() {
            if(arguments.length == 2 || arguments.length == 4) {
                if(arguments.length == 4) {
                    this.scrollByPoints(arguments[0], arguments[1], arguments[2], arguments[3]);
                } else {
                    this.scrollByDirection(arguments[0], arguments[1]);
                }
            } else {
                $KAUtils.throwExceptionInsufficientArguments();
            }
        },

        scrollByPoints: function(widgetPath, startPoint, movePoint, endPoint) {

            if(!$KU.isArray(widgetPath)
            || (startPoint && (!$KU.isArray(startPoint) || startPoint.length !== 2))
            || (movePoint && (!$KU.isArray(movePoint) || movePoint.length === 0))
            || (endPoint && (!$KU.isArray(endPoint) || endPoint.length !== 2))) {
                $KAUtils.throwExceptionInvalidArgumentType();
            }

            var node = null;
            var widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
            var widgetModel = widgetConfig.widgetInstance;
            if(!widgetModel) {
                $KAUtils.throwExceptionWidgetPathNotFound();
            }

            var scrollerInstance = $KW.Utils.getScrollerInstance(widgetModel);
            node = $KAUtils.getNodeByModel(widgetConfig);
            if(startPoint) {
                scrollerInstance.animateTo(-startPoint[0], -startPoint[1]);
            }

            if(movePoint) {
                for(var i = 0; i < movePoint.length; i++) {
                    var point = movePoint[i];
                    scrollerInstance.animateTo(-point[0], -point[1]);
                }
            }

            if(endPoint) {
                scrollerInstance.animateTo(-endPoint[0], -endPoint[1]);
            }
        },

        scrollByDirection: function(widgetPath, direction) {

            if(!$KU.isArray(widgetPath) || typeof direction !== 'string') {
                $KAUtils.throwExceptionInvalidArgumentType();
            }

            var node = null;
            var widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
            var widgetModel = widgetConfig.widgetInstance;
            if(!widgetModel) {
                $KAUtils.throwExceptionWidgetPathNotFound();
            }
            var scrollerInstance = $KW.Utils.getScrollerInstance(widgetModel);
            node = $KAUtils.getNodeByModel(widgetConfig);
            

            
            var x = scrollerInstance.x;
            var y = scrollerInstance.y;

            var movement = 100; 

            if(direction == kony.automation.scrollDirection.Bottom) {
                scrollerInstance.animateTo(0, y - movement);
            } else if(direction == kony.automation.scrollDirection.Top) {
                scrollerInstance.animateTo(0, y + movement);
            } else if(direction == kony.automation.scrollDirection.Right) {
                scrollerInstance.animateTo(x - movement, 0);
            } else if(direction == kony.automation.scrollDirection.Left) {
                scrollerInstance.animateTo(x + movement, 0);
            }
        },

        canScroll: function(widgetPath, direction) {

            if(arguments.length !== 2) {
                $KAUtils.throwExceptionInsufficientArguments();
            }

            if(!$KU.isArray(widgetPath) || typeof direction !== 'string') {
                $KAUtils.throwExceptionInvalidArgumentType();
            }

            var node = null;
            var widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
            var widgetModel = widgetConfig.widgetInstance;
            if(!widgetModel) {
                $KAUtils.throwExceptionWidgetPathNotFound();
            }

            node = $KAUtils.getNodeByModel(widgetConfig);
            var sTop = node.scrollTop;
            var sLeft = node.scrollLeft;
            var isScroll = true;

            if(direction == kony.automation.scrollDirection.Bottom) {
                isScroll = node.scrollHeight > (node.clientHeight + node.scrollTop) ? true : false;
            } else if(direction == kony.automation.scrollDirection.Top) {
                isScroll = node.scrollTop > 0 ? true : false;
            } else if(direction == kony.automation.scrollDirection.Right) {
                isScroll = node.scrollWidth > (node.clientWidth + node.scrollLeft) ? true : false;
            } else if(direction == kony.automation.scrollDirection.Left) {
                isScroll = node.scrollLeft > 0 ? true : false;
            }

            return isScroll;

        }
    };

    return module;


}());


kony.automation.gesture = (function() {

    var module = {};

    module.tap = function(widgetPath, gestureInfo) {
        if(arguments.length !== 2) {
            $KAUtils.throwExceptionInsufficientArguments();
        }

        if(!$KU.isArray(widgetPath) || typeof gestureInfo !== 'object') {
            $KAUtils.throwExceptionInvalidArgumentType();
        }

        var gestureInfoObj = {};
        var widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
        var widgetModel = widgetConfig.widgetInstance;
        if(!widgetModel) {
            $KAUtils.throwExceptionWidgetPathNotFound();
        }

        node = $KAUtils.getNodeByModel(widgetConfig);

        gestureInfoObj = this.getGestureInfoObj(gestureInfo, 1, node);
        var callback = this.getCallbackFunc(widgetModel, gestureInfoObj)
        if(callback) {
            this.executeCallback(widgetModel, callback, gestureInfoObj);
        }
    };

    module.swipe = function(widgetPath, gestureInfo) {
        if(arguments.length !== 2) {
            $KAUtils.throwExceptionInsufficientArguments();
        }

        if(!$KU.isArray(widgetPath) || typeof gestureInfo !== 'object') {
            $KAUtils.throwExceptionInvalidArgumentType();
        }

        var gestureInfoObj = {};
        var widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
        var widgetModel = widgetConfig.widgetInstance;
        if(!widgetModel) {
            $KAUtils.throwExceptionWidgetPathNotFound();
        }

        node = $KAUtils.getNodeByModel(widgetConfig);
        gestureInfoObj = this.getGestureInfoObj(gestureInfo, 2, node);
        var callback = this.getCallbackFunc(widgetModel, gestureInfoObj)
        if(callback) {
            this.executeCallback(widgetModel, callback, gestureInfoObj);
        }
    };


    module.longpress = function(widgetPath, gestureInfo) {
        if(arguments.length !== 2) {
            $KAUtils.throwExceptionInsufficientArguments();
        }

        if(!$KU.isArray(widgetPath) || typeof gestureInfo !== 'object') {
            $KAUtils.throwExceptionInvalidArgumentType();
        }

        var gestureInfoObj = {};
        var widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
        var widgetModel = widgetConfig.widgetInstance;
        if(!widgetModel) {
            $KAUtils.throwExceptionWidgetPathNotFound();
        }
        node = $KAUtils.getNodeByModel(widgetConfig);
        gestureInfoObj = this.getGestureInfoObj(gestureInfo, 3, node);
        var callback = this.getCallbackFunc(widgetModel, gestureInfoObj)
        if(callback) {
            this.executeCallback(widgetModel, callback, gestureInfoObj);
        }
    };

    
    module.rightTap = function(widgetPath, gestureInfo) {

    };

    module.pan = function(widgetPath, startPointGestureInfo, movePointGestureInfo, endPointGestureInfo) {
        if(arguments.length !== 4) {
            $KAUtils.throwExceptionInsufficientArguments();
        }

        if(!$KU.isArray(widgetPath) || typeof startPointGestureInfo !== 'object' || typeof movePointGestureInfo !== 'object' || typeof endPointGestureInfo !== 'object') {
            $KAUtils.throwExceptionInvalidArgumentType();
        }

        var gestureInfoObj = {};
        var widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
        var widgetModel = widgetConfig.widgetInstance;
        if(!widgetModel) {
            $KAUtils.throwExceptionWidgetPathNotFound();
        }

        node = $KAUtils.getNodeByModel(widgetConfig);
        
        gestureInfoObj = this.getGestureInfoObj(startPointGestureInfo, 4, node, 1);
        var callback = this.getCallbackFunc(widgetModel, gestureInfoObj)
        if(callback) {
            this.executeCallback(widgetModel, callback, gestureInfoObj);
        }

        gestureInfoObj = this.getGestureInfoObj(movePointGestureInfo, 4, node, 2);
        var callback = this.getCallbackFunc(widgetModel, gestureInfoObj)
        if(callback) {
            this.executeCallback(widgetModel, callback, gestureInfoObj);
        }

        gestureInfoObj = this.getGestureInfoObj(endPointGestureInfo, 4, node, 3);
        var callback = this.getCallbackFunc(widgetModel, gestureInfoObj)
        if(callback) {
            this.executeCallback(widgetModel, callback, gestureInfoObj);
        }
    };

    module.rotation = function(widgetPath, startPointGestureInfo, movePointGestureInfo, endPointGestureInfo) {
        if(arguments.length !== 4) {
            $KAUtils.throwExceptionInsufficientArguments();
        }

        if(!$KU.isArray(widgetPath) || typeof startPointGestureInfo !== 'object' || typeof movePointGestureInfo !== 'object' || typeof endPointGestureInfo !== 'object') {
            $KAUtils.throwExceptionInvalidArgumentType();
        }

        var gestureInfoObj = {};
        var widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
        var widgetModel = widgetConfig.widgetInstance;
        if(!widgetModel) {
            $KAUtils.throwExceptionWidgetPathNotFound();
        }

        node = $KAUtils.getNodeByModel(widgetConfig);
        gestureInfoObj = this.getGestureInfoObj(startPointGestureInfo, 5, node, 1);
        var callback = this.getCallbackFunc(widgetModel, gestureInfoObj)
        if(callback) {
            this.executeCallback(widgetModel, callback, gestureInfoObj);
        }

        gestureInfoObj = this.getGestureInfoObj(movePointGestureInfo, 5, node, 2);
        var callback = this.getCallbackFunc(widgetModel, gestureInfoObj)
        if(callback) {
            this.executeCallback(widgetModel, callback, gestureInfoObj);
        }

        gestureInfoObj = this.getGestureInfoObj(endPointGestureInfo, 5, node, 3);
        var callback = this.getCallbackFunc(widgetModel, gestureInfoObj)
        if(callback) {
            this.executeCallback(widgetModel, callback, gestureInfoObj);
        }
    };

    module.pinch = function(widgetPath, startPointGestureInfo, movePointGestureInfo, endPointGestureInfo) {
        if(arguments.length !== 4) {
            $KAUtils.throwExceptionInsufficientArguments();
        }

        if(!$KU.isArray(widgetPath) || typeof startPointGestureInfo !== 'object' || typeof movePointGestureInfo !== 'object' || typeof endPointGestureInfo !== 'object') {
            $KAUtils.throwExceptionInvalidArgumentType();
        }

        var gestureInfoObj = {};
        var widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
        var widgetModel = widgetConfig.widgetInstance;

        if(!widgetModel) {
            $KAUtils.throwExceptionWidgetPathNotFound();
        }
        node = $KAUtils.getNodeByModel(widgetConfig);
        gestureInfoObj = this.getGestureInfoObj(startPointGestureInfo, 6, node, 1);
        var callback = this.getCallbackFunc(widgetModel, gestureInfoObj)
        if(callback) {
            this.executeCallback(widgetModel, callback, gestureInfoObj);
        }

        gestureInfoObj = this.getGestureInfoObj(movePointGestureInfo, 6, node, 2);
        var callback = this.getCallbackFunc(widgetModel, gestureInfoObj)
        if(callback) {
            this.executeCallback(widgetModel, callback, gestureInfoObj);
        }

        gestureInfoObj = this.getGestureInfoObj(endPointGestureInfo, 6, node, 3);
        var callback = this.getCallbackFunc(widgetModel, gestureInfoObj)
        if(callback) {
            this.executeCallback(widgetModel, callback, gestureInfoObj);
        }
    };

    module.getGestureInfoObj = function(gestureInfo, gestureType, widgetNode, gestureState) {
        var gestureInfoObj = {};
        gestureInfoObj.gesturePosition = gestureInfoObj.gesturePosition ? gestureInfoObj.gesturePosition : 10; 
        gestureInfoObj.gestureType = gestureInfo.gestureType ? gestureInfo.gestureType : gestureType;
        gestureInfoObj.gesturesetUpParams = this.getGestureParams(gestureInfo, gestureType);
        gestureInfoObj.scale = gestureInfo.scale ? gestureInfo.scale : 1
        if(gestureType == 2) {
            gestureInfoObj.swipeDirection = gestureInfo.swipeDirection ? gestureInfo.swipeDirection : 1; 
        }
        if(gestureType == 4) {
            gestureInfoObj.gestureState = gestureInfo.gestureState ? gestureInfo.gestureState : gestureState;
            gestureInfoObj.translationX = gestureInfo.translationX ? gestureInfo.translationX : 0;
            gestureInfoObj.translationY = gestureInfo.translationY ? gestureInfo.translationY : 0;
        }
        if(gestureType == 5 || gestureType == 6) {
            gestureInfoObj.gestureState = gestureInfo.gestureState ? gestureInfo.gestureState : gestureState;
            gestureInfoObj.velocity = gestureInfo.velocity ? gestureInfo.velocity : 0;
            gestureInfoObj.velocityX = gestureInfo.velocityX ? gestureInfo.velocityX : 0;
            gestureInfoObj.velocityY = gestureInfo.velocityY ? gestureInfo.velocityY : 0;
        }
        if(gestureType == 5) {
            gestureInfoObj.rotation = gestureInfoObj.rotation ? gestureInfoObj.rotation : 0;
        }
        gestureInfoObj.gestureX = gestureInfo.gestureX ? gestureInfo.gestureX : 0;
        gestureInfoObj.gestureY = gestureInfo.gestureY ? gestureInfo.gestureY : 0;
        gestureInfoObj.widgetWidth = gestureInfo.widgetWidth ? gestureInfo.widgetWidth : node.clientWidth;
        gestureInfoObj.widgetHeight = gestureInfo.widgetHeight ? gestureInfo.widgetHeight : node.clientHeight;
        
        
        return gestureInfoObj;
    };

    module.getGestureParams = function(gestureInfo, gestureType) {
        var setupParams = {};

        if(gestureInfo.gesturesetUpParams && (gestureType == 1 || gestureType == 2)) {
            setupParams.fingers = gestureInfo.gesturesetUpParams.fingers ? gestureInfo.gesturesetUpParams.fingers : 1;
            if(gestureType == 2) {
                if($KU.isAndroid) {
                    setupParams.swipeDistance = gestureInfo.getDefaultSetupParams.swipeDistance ? gestureInfo.getDefaultSetupParams.swipeDistance : 50;
                    setupParams.swipeVelocity = gestureInfo.getDefaultSetupParams.swipeVelocity ? gestureInfo.getDefaultSetupParams.swipeVelocity : 75;
                }
                return setupParams;
            }
            setupParams.taps = gestureInfo.gesturesetUpParams.taps ? gestureInfo.gesturesetUpParams.taps : 1;
        } else if(gestureInfo.gesturesetUpParams && gestureType == 3) {
            setupParams.pressDuration = gestureInfo.gesturesetUpParams.pressDuration ? gestureInfo.gesturesetUpParams.pressDuration : 1;
        } else if(gestureInfo.gesturesetUpParams && (gestureType == 4 || gestureType == 5 || gestureType == 6)) {
            setupParams.fingers = gestureInfo.gesturesetUpParams.fingers ? gestureInfo.gesturesetUpParams.fingers : 1;
            setupParams.continuousEvents = gestureInfo.gesturesetUpParams.continuousEvents ? estureInfo.gesturesetUpParams.continuousEvents : false;
        } else {
            setupParams = this.getDefaultSetupParams(gestureType);
        }

        return setupParams;
    };

    module.getDefaultSetupParams = function(gestureType) {
        var defaultParams = {};
        switch(gestureType) {
            case 1:
                defaultParams = {
                    fingers: 1,
                    taps: 1
                };
                break;
            case 2:
                defaultParams = {
                    fingers: 1
                };
                if($KU.isAndroid) {
                    defaultParams = {
                        fingers: 1,
                        swipeDistance: 50,
                        swipeVelocity: 75
                    };
                }
                break;
            case 3:
                defaultParams = {
                    pressDuration: 1
                };
                break;
            case 4:
                defaultParams = {
                    fingers: 1,
                    continuousEvents: false
                };
                break;
            case 5:
                defaultParams = {
                    fingers: 1,
                    continuousEvents: false
                };
                break;
            case 6:
                defaultParams = {
                    fingers: 1,
                    continuousEvents: false
                };
                break;
        }
        return defaultParams;
    };

    module.getCallbackFunc = function(widgetModel, gestureInfoObj) {
        var gestureType = (gestureInfoObj.gestureType == 1 ? (gestureInfoObj.gesturesetUpParams.taps == 1 ? 10 : 11) : gestureInfoObj.gestureType);
        if(widgetModel.gestures[gestureType]) {
            var gestureIdentifier = Object.keys(widgetModel.gestures[gestureType])[0];
            return widgetModel.gestures[gestureType][gestureIdentifier].callback;
        }
    };

    module.executeCallback = function(widgetModel, callback, gestureInfoObj) {

        var currentForm = widgetModel["__currentForm"];
        if(currentForm) {
            $KU.executeWidgetEventHandler(currentForm, callback, gestureInfoObj);
        } else {
            $KU.executeWidgetEventHandler(widgetModel, callback, gestureInfoObj);
        }
    };

    return module;

}());

kony.automation.playback = (function() {

    var _waitForElement = function(widgetPath, timeOut, resolve, reject) {
        var waitTime;

        if(typeof timeOut !== 'undefined' && timeOut !== null) {
            waitTime = (timeOut < 1000) ? timeOut : 1000;
            timeOut = (timeOut < 1000) ? timeOut : (timeOut - 1000);
        } else {
            waitTime = 1000;
        }
        setTimeout(function() {
            var node = null, widgetConfig, formID;

            var id = widgetPath[0];
            var formModel = $KG.allforms[id];
            if(!formModel) {
                formID = kony.mvc.registry.get(id);
                if(formID) {
                    formID = formID.split("/");
                    formID = formID[formID.length - 1];
                    formModel = $KG.allforms[formID];
                }
            }

            if(formModel && formModel.id === $KG.__currentForm.id) {
                widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
                if(widgetConfig.widgetInstance) {
                    node = $KAUtils.getNodeByModel(widgetConfig);
                }
            }

            if(node) {
                resolve(true);
            } else {
                if(typeof timeOut !== 'undefined' && timeOut !== null  && timeOut === 0) {
                    resolve(false);
                } else {
                    _waitForElement(widgetPath, timeOut, resolve, reject);
                }
            }
        }, waitTime);
    };

    var module = {};
    module.wait = function(delaytime) {
        $KU.logExecuting('kony.automation.playback.wait');
        if(arguments.length !== 1) {
            $KAUtils.throwExceptionInsufficientArguments();
        }

        $KU.logExecutingWithParams('kony.automation.playback.wait', delaytime);
        if(typeof delaytime !== 'number') {
            $KAUtils.throwExceptionInvalidArgumentType();
        }
        $KU.logExecutingFinished('kony.automation.playback.wait');

        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve();
            }, delaytime);
        });
    };

    module.waitFor = function(widgetPath, timeOut) {

        $KU.logExecuting('kony.automation.playback.waitFor');
        if(arguments.length !== 1 && arguments.length !== 2) { 
            $KAUtils.throwExceptionInsufficientArguments();
        }

        $KU.logExecutingWithParams('kony.automation.playback.waitFor', widgetPath, timeOut);
        if(!$KU.isArray(widgetPath) || (timeOut && typeof timeOut !== 'number')) {
            $KAUtils.throwExceptionInvalidArgumentType();
        }
        $KU.logExecutingFinished('kony.automation.playback.waitFor');

        return new Promise(function(resolve, reject) {
            widgetPath = $KAUtils.getAllowedLeafWidgetPath(widgetPath);
            _waitForElement(widgetPath, timeOut, resolve, reject);
        });
    };

    module.waitForAlert = function() {

    };



    return module;
}());

kony.automation.device = (function() {

    var module = {};

    module.deviceBack = function() {
        history.go(-1);

        return kony.automation.playback.wait(100);
    };

    module.rotate = function(newOrientation) {
    };
    return module;

}());




kony.automation.capture = (function() {

}());


kony.automation.scrollDirection = {
    Top: "top",
    Bottom: "bottom",
    Left: "left",
    Right: "right"
};

kony.automation.scrollToWidget = function(widgetPath) {
    var widgetConfig;
    var scrollToWidget;

    if(arguments.length !== 1) {
        $KAUtils.throwExceptionInsufficientArguments();
    }

    if(!$KU.isArray(widgetPath)) {
        $KAUtils.throwExceptionInvalidArgumentType();
    }

    widgetPath = $KAUtils.getAllowedLeafWidgetPath(widgetPath);
    widgetConfig = $KAUtils.getWidgetInstance(widgetPath);
    scrollToWidget = widgetConfig.widgetInstance;

    if(!scrollToWidget) {
        $KAUtils.throwExceptionWidgetPathNotFound();
    }

    $KAUtils.scrollToWidgetRecursively(scrollToWidget);

    return kony.automation.playback.wait(100);

};
