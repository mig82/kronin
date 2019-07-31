kony.events = {
    widgetEventMap: {},
    hiddenIFrame: null,
    isFrameworkEventsRegistered: false,

    addEvent: function(kEventType, kWidgetType, kEventHandler) {
        kony.events.widgetEventMap[kWidgetType] = kony.events.widgetEventMap[kWidgetType] || {};
        kony.events.widgetEventMap[kWidgetType][kEventType] = kEventHandler;
    },

    getEventHandler: function(eventObject) {
        eventObject = eventObject || window.event;
        var targetWidget = eventObject.target || eventObject.srcElement;
        var preventDefault = true, widget;
        var eventData, cellTemplateNode = null;

        
        if($KG["__idletimeout"] && $KG["__idletimeout"]["enabled"]) {
            var reset = $KI.appevents.resettimer();
            if(reset === false) return;
        }

        $KW.Appmenu && $KW.Appmenu.hidemoreappmenuitems();


        cellTemplateNode = $KU.getParentByAttribute(targetWidget, 'kcelltemplate');
        if(cellTemplateNode != null) {
            targetWidget = cellTemplateNode.parentElement;
        }

        
        if(targetWidget.getAttribute('w-type') != "Calendar" && targetWidget.getAttribute('kwidgettype') != "Calendar") {
            $KW.Calendar && $KW.Calendar.destroyCalendar(null, null, targetWidget);
        }
        if(targetWidget.getAttribute('w-type-inactive')) {
            return;
        }

        widget = $KU.getParentByAttribute(targetWidget, kony.constants.KONY_WIDGET_TYPE);
        if(widget && widget.hasAttribute('overlay')) {
            $KW.Image.onClickHandler(widget);
            return;
        }


        
        if(eventObject.type == "click" && typeof cvox == "undefined" && ($KU.isTouchSupported || $KU.isPointerSupported) && $KG["targetWidget"] && ($KG["moved"] || ($KG["targetWidget"] && targetWidget != $KG["targetWidget"] && (targetWidget.getAttribute('w-type') != "Calendar")))) {
            
            if(targetWidget.tagName == 'A' && targetWidget.getAttribute('href')) {
                kony.events.stopPropagation(eventObject);
                kony.events.preventDefault(eventObject);
            }
            
            $KG["targetWidget"] = "";
            $KG["moved"] = false;

            var src = eventObject.srcElement;
            
            if((src.getAttribute && src.getAttribute("kwidgettype") == "Calendar") || (src.parentNode && src.parentNode.getAttribute && src.parentNode.getAttribute("kwidgettype") == "Calendar")) {
                
            } else {
                return;
            }
        }

        if(targetWidget) {
            var targetWidgetType = targetWidget.getAttribute(kony.constants.KONY_WIDGET_TYPE);

            if(targetWidget.tagName == 'A')
                eventData = [targetWidget.innerText, targetWidget.getAttribute('href')];

            if(targetWidget.getAttribute('tpwidgettype')) {
                $KW.Popup && $KW.Popup.dismissPopup();
                return;
            } else if(!targetWidgetType) {
                
                var targetChild = targetWidget.childNodes[0];
                if(targetWidget.getAttribute("index") && targetChild && targetChild.getAttribute("kwidgettype") == "Segment") {
                    targetWidget = targetChild;
                    targetWidgetType = "Segment";
                } else {
                    
                    var konyWidget = $KU.getParentByAttribute(targetWidget, kony.constants.KONY_WIDGET_TYPE);
                    
                    if(targetWidget && targetWidget.tagName == "CANVAS" && $KU.isIE11 && konyWidget && konyWidget.getAttribute("kwidgettype") == "googlemap") {
                        return;
                    }
                    var thirdPartyWidget = $KU.getParentByAttribute(targetWidget, 'tpwidgettype');
                    targetWidget = konyWidget;
                    
                    if(!targetWidget || thirdPartyWidget) {
                        $KW.Popup && $KW.Popup.dismissPopup();
                        return;
                    }
                    targetWidgetType = targetWidget.getAttribute(kony.constants.KONY_WIDGET_TYPE);
                }
            }

            if(targetWidgetType == 'RadioButtonGroup' || targetWidgetType == 'CheckBoxGroup' || targetWidgetType == 'ComboBox' || targetWidgetType == 'ListBox') {
                
                if($KU.preventClickEvent(eventObject, targetWidget))
                    return;
            }

            
            var pf = $KU.getContainerForm(targetWidget);

            if($KW.Popup && $KW.Popup.dismissPopup(pf))
                return;



            
            var widgetModel = $KU.getModelByNode(targetWidget);
            if(widgetModel && widgetModel.disabled)
                return;

            var widgetEventObj = kony.events.widgetEventMap[targetWidgetType];
            if(widgetEventObj && widgetEventObj[eventObject.type]) {
                

                
                if(!$KW.Utils.isWidgetInteractable(targetWidget, true)) {
                    return;
                }

                
                var eventHandler = widgetEventObj[eventObject.type];
                if(targetWidgetType == 'RichText') {
                    
                    if(!widgetModel.onclick)
                        preventDefault = false;
                }
                var target = eventObject.target || eventObject.srcElement;
                if(!(targetWidgetType == "TextField" || targetWidgetType == "CheckBoxGroup" || targetWidgetType == "TextArea" ||
                        targetWidgetType == "RadioButtonGroup" || targetWidgetType == "ListBox" || (targetWidgetType == "DataGrid" && target.type == "checkbox"))) {
                    if(preventDefault) {
                        kony.events.stopPropagation(eventObject);
                        kony.events.preventDefault(eventObject);
                    }
                }

                var editableCombos = document.querySelectorAll("div[name='SelectOptions']");
                if(editableCombos) {
                    for(var i = 0; i < editableCombos.length; i++) {
                        if(editableCombos[i].style.display == "block") {
                            if(targetWidget.id != editableCombos[i].parentNode.id)
                                editableCombos[i].style.display = "none";
                        }
                    }
                }

                
                
                if(targetWidgetType == 'RichText' && eventData) 
                    eventHandler(eventObject, targetWidget, eventData);
                else
                    eventHandler(eventObject, targetWidget, target);

                if(!kony.system.activity.hasActivity()) {
                    $KW.skins.removeBlockUISkin();
                    $KW.unLoadWidget();
                }
            }
        }
    },

    addEventListener: function(object, type, listener, bCapture) {
        if(!object)
            return;
        if(!listener)
            listener = kony.events.getEventHandler;
        if(!bCapture)
            bCapture = false;

        if(object.addEventListener)
            object.addEventListener(type, listener, bCapture); 
        else if(object.attachEvent)
            object.attachEvent('on' + type, listener); 
    },

    removeEventListener: function(object, type, listener, bCapture) {
        if(!object)
            return;
        if(!listener)
            listener = kony.events.getEventHandler;
        if(!bCapture)
            bCapture = false;

        if(object.removeEventListener)
            object.removeEventListener(type, listener, bCapture); 
        else if(object.attachEvent)
            object.detachEvent('on' + type, listener); 
    },

    preventDefault: function(eventObject) {
        if(!eventObject)
            return;

        if(eventObject.preventDefault)
            eventObject.preventDefault();
        else
            eventObject.returnValue = false;
    },

    stopPropagation: function(eventObject) {
        if(!eventObject)
            return;
        
        var isNonModelPopupDismissEvent = arguments[1];
        if(kony.touchClickNotifier && !isNonModelPopupDismissEvent)
            kony.touchClickNotifier.handleEvent(eventObject);
        if(eventObject.stopPropagation) {
            eventObject.stopPropagation();
            eventObject.stopImmediatePropagation && eventObject.stopImmediatePropagation();
        } else
            eventObject.cancelBubble = true;
    },

    ontouchstartHandler: function(e) {
        if(($KU.isIE || $KU.isPointerSupported ? e : e.changedTouches)) {
            var target = e.changedTouches ? (e.changedTouches[0].target || e.changedTouches[0].srcElement) : (e.target || e.srcElement);
            var widgetNode;
            if(target.nodeType == 3)
                target = target.parentNode;
            $KG["targetWidget"] = target;
            $KG["moved"] = false;
            if($KU.isIE || $KU.isPointerSupported) { 
                var touch = e.touches && e.touches[0] || e;
                $KG.pointX = touch.pageX;
                $KG.pointY = touch.pageY;
            }
            
            if($KU.isiPhone) {
                this.allowUp = (this.scrollTop > 0);
                this.allowDown = (this.scrollTop < this.scrollHeight - this.clientHeight);
                if(typeof e.pageY === 'number') this.slideBeginY = e.pageY;
            }
            widgetNode = $KU.getParentByAttribute(e.target, kony.constants.KONY_WIDGET_TYPE);
            if($KW.Utils.belongsToSegment(widgetNode)) {
                $KW.Segment.resetSwipeMoveConfigOnTouchStart(widgetNode);
            }
        }
    },

    ontouchmoveHandler: function(e) {
        var up = false;
        var down = false;
        
        
        

        if($KU.isIE || $KU.isPointerSupported || $KU.isAndroid) {
            var touch = e.touches && e.touches[0] || e;
            var deltaX = touch.pageX - $KG.pointX,
                deltaY = touch.pageY - $KG.pointY;
            if(Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
                $KG["moved"] = true;
            }
        } else {
            $KG["moved"] = true;
        }
        
        if($KU.isiPhone) {
            if(typeof e.pageY === 'number') {
                up = (e.pageY > this.slideBeginY);
                down = (e.pageY < this.slideBeginY);
                this.slideBeginY = e.pageY;
            }
            if(!((up && this.allowUp) || (down && this.allowDown))) {
                e.preventDefault();
            }
        }

    },

    registerDocumentEvents: function() {
        var main = ($KU.isWindowsPhone && $KU.isIE9) ? document : document.getElementById("__MainContainer");
        if(kony.touchClickNotifier) {
            var reqEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'click'];
            for(var i = 0; i < reqEvents.length; i++)
                kony.events.addEventListener(main, reqEvents[i], kony.touchClickNotifier, false);
        }

        kony.events.addEventListener(main, 'click');
        kony.events.addEventListener(main, 'input');
        kony.events.addEventListener(main, 'change');
        kony.events.addEventListener(main, 'keydown');
        kony.events.addEventListener(main, 'keyup');
        if($KG["useNativeScroll"]) {
            kony.events.addEventListener(main, 'touchstart', function() {});
            kony.events.addEventListener(main, 'touchmove', function() {});
        }
        else {
            if($KU.isTouchSupported) {
                kony.events.addEventListener(main, 'touchstart', kony.events.ontouchstartHandler);
                kony.events.addEventListener(main, 'touchmove', kony.events.ontouchmoveHandler);
            } else if($KU.isPointerSupported) {
                kony.events.addEventListener(main, 'MSPointerDown', kony.events.ontouchstartHandler);
                kony.events.addEventListener(main, 'MSPointerMove', kony.events.ontouchmoveHandler);
            }
        }
        kony.appinit.initializeWidgets();
        kony.events.orientationregistration();
        kony.events.addEventListener(window, 'unload', kony.events.unregisterListeners);
        kony.events.isFrameworkEventsRegistered = true;
    },


    unregisterListeners: function(formID) {
        var main = $KU.isWindowsPhone ? document : document.getElementById("__MainContainer");
        kony.events.removeEventListener(main, 'click');
        kony.events.removeEventListener(main, 'touchstart');
        kony.events.removeEventListener(main, 'touchmove');
        kony.events.removeEventListener(main, 'change');
        kony.events.removeEventListener(main, 'keydown');
        kony.events.removeEventListener(main, 'keyup');
        kony.events.removeEventListener(main, 'touchstart');

        if(kony.touchClickNotifier) {
            var reqEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'click'];
            for(var i = 0; i < reqEvents.length; i++)
                kony.events.removeEventListener(main, reqEvents[i], kony.touchClickNotifier, false);
        }


        
        if($KU.hashChange) {
            kony.events.removeEventListener(window, 'hashchange');
        }

        
        $KW.Form.delistSystemTimerActions();
    },

    

    windowOrientationChange: function() {
        var event = window.event;
        var orientation = $KU.detectOrientation();
        var winNewWidth = $KU.getWindowWidth();
        var winNewHeight = $KU.getWindowHeight();

        if(orientation != undefined && orientation == $KG["__orientation"] && event && event.type == 'resize') {
            
            window.clearTimeout(kony.events.resizeTimeoutId);
            kony.events.resizeTimeoutId = setTimeout(function() {
                if($KG.activeInput && !$KG["nativeScroll"] && winNewHeight > $KG['__viewportHeight']) {
                    
                    if(kony.appinit.isChrome && $KU.isAndroid && $KG["__orientation"] == "portrait" && (winNewHeight - $KG['__viewportHeight']) > 50) {
                        if($KG.appbehaviors.disableScrollOnInputFocus == true) {
                            $KG.activeInput.blur();
                        }
                    } else if(!kony.appinit.isChrome) {
                        if($KG.appbehaviors.disableScrollOnInputFocus == true) {
                            $KG.activeInput.blur();
                        }
                    }

                    $KU.onHideKeypad();
                } else {
                    $KU.adjustScrollBoxesOnResize(true);
                }
                $KG['__viewportHeight'] = winNewHeight;
            }, $KU.orientationDelay);
            return;
        }
        else
            $KG["__orientation"] = orientation;
        if($KG["__currentForm"]) {
            if($KU.isOrientationSupported && $KU.isAndroid) {
                if(event && event.type == 'resize')
                    return;
            }
            
            $KU.getInnerHeight($KU.orientationDelay);
            $KU.setActiveInput();
            $KG['__viewportHeight'] = winNewHeight;

            
            window.clearTimeout(kony.events.orientationTimeoutId);
            kony.events.orientationTimeoutId = setTimeout(function() {
                
                var eventList = kony.events.widgetEventMap || {};
                for(var k in eventList) {
                    var widgetType = eventList[k];
                    var eventHandler = widgetType["onorientationchange"] || widgetType["onresize"];
                    eventHandler && eventHandler($KG["__currentForm"].id, $KG["__orientation"]);
                }

                $KW.Form.resizeForm($KG["__currentForm"].id, true);

            }, $KU.orientationDelay);
        }
        

    },

    orientationregistration: function() {
        $KG["__orientation"] = $KU.detectOrientation();
        var orientationEvent = ($KU.isOrientationSupported && !$KU.isAndroid) ? "orientationchange" : "resize";
        kony.events.addEventListener(window, orientationEvent, kony.events.windowOrientationChange);
        if($KU.isOrientationSupported && $KU.isAndroid)
            kony.events.addEventListener(window, "orientationchange", kony.events.windowOrientationChange);
    },

    canExecuteEventHandler: function(widgetModel, event) {
        if(widgetModel[event]) {
            return true;
        }
        return false;
    },

    executeBoxEvent: function(wModel, rowdata, containerModel) {
        if(rowdata && containerModel) { 
            var rowModelData = null,
                clickHandler = null,
                extendedModel = null,
                context;

            if(containerModel.wType == 'Segment' || containerModel.wType == "CollectionView") {
                var sectionIndex = containerModel.currentIndex[0];
                var rowIndex = containerModel.currentIndex[1];
                var clonedTemplate = $KW.Utils.getClonedModelByContainerUsingIndex(containerModel, rowIndex, sectionIndex);

                if(!clonedTemplate) {
                    return false;
                }
                wModel = $KU.getValueFromObjectByPath($KW.Utils.getWidgetPathByModel(wModel), clonedTemplate);
                if(containerModel.wType == 'Segment') {
                    context = {
                        sectionIndex: sectionIndex,
                        rowIndex: rowIndex,
                        widgetInfo: containerModel
                    };
                } else {
                    context = {
                        sectionIndex: sectionIndex,
                        itemIndex: rowIndex,
                        widgetInfo: containerModel
                    };
                }
            }

            parentModel = wModel;

            while(parentModel) {
                var widgetData = containerModel.widgetdatamap ? rowdata[containerModel.widgetdatamap[parentModel.id]] : rowdata[parentModel.id];

                if(widgetData && (containerModel.wType != 'Segment') && (containerModel.wType != 'CollectionView')) {
                    rowModelData = $KU.cloneObj(widgetData);
                    if(typeof rowModelData === 'string') {
                        rowModelData = (parentModel.wType === 'Image') ? {
                            "src": rowModelData
                        } : {
                            "text": rowModelData
                        };
                    }
                    if(!IndexJL) {
                        for(var p in rowModelData) {
                            if(rowModelData.hasOwnProperty(p) && p !== p.toLowerCase()) {
                                rowModelData[p.toLowerCase()] = rowModelData[p];
                            }
                        }
                    }

                    clickHandler = rowModelData.onclick || parentModel.onclick;
                    if(clickHandler && rowModelData.enable !== false) {
                        extendedModel = $KU.extend(rowModelData, parentModel);
                        this.fireBoxEvent(extendedModel, context);
                        return true;
                    }
                } else if(this.canExecuteEventHandler(parentModel, "onclick") && parentModel.enable !== false) {
                    this.fireBoxEvent(parentModel, context);
                    return true;
                }

                parentModel = parentModel.parent;
                if(!parentModel) return false;
            }
        } else {
            var formId = wModel.pf;
            var pModel = wModel;
            var form = $KG.allforms[formId] || $KG.allTemplates[formId] || $KG.__currentForm;
            while(pModel) {
                
                if(this.canExecuteEventHandler(pModel, "onclick") || (pModel.parent && formId == pModel.parent.id && pModel.parent.wType != 'HBox') || pModel.id == form.id) {
                    if(this.canExecuteEventHandler(pModel, "onclick")) {
                        this.fireBoxEvent(pModel);
                        return true;
                    }
                    return false;
                }
                
                if(form.topLayerFCModal && pModel === form.topLayerFCModal) {
                    return true;
                }
                pModel = pModel.parent;
            }
            return false;
        }
    },



    
    fireBoxEvent: function(widgetModel, context) {
        var eventReference = $KU.returnEventReference(widgetModel.onclick);

        if(eventReference && widgetModel.blockeduiskin) {
            $KW.skins.applyBlockUISkin(widgetModel);
        }
        if(!widgetModel.containerID && widgetModel.wType != "Segment" && (widgetModel.parent && widgetModel.parent.wType != "TabPane")) {
            var widgetNode = $KU.getNodeByModel(widgetModel);
            $KW.HBox.setProgressIndicator(widgetNode);
        }

        eventReference && (context ? $KU.executeWidgetEventHandler(widgetModel, eventReference, context) : $KU.executeWidgetEventHandler(widgetModel, eventReference));
        $KU.onEventHandler(widgetModel);
    },

    
    executeActionOnContainer: function(containerModel, action, execActionBeforeChildFlag) {
        for(var i = 0; i < containerModel.children.length; i++) {
            var childModel = containerModel[containerModel.children[i]];
            childModel = $KW.Utils.getActualWidgetModel(childModel);

            if(childModel.isContainerWidget) {
                if(execActionBeforeChildFlag)
                    this.executeActionEvt(childModel, childModel[action]);
                this.executeActionOnContainer(childModel, action, execActionBeforeChildFlag);
                if(!execActionBeforeChildFlag)
                    this.executeActionEvt(childModel, childModel[action]);
            }
        }
    },

    executeActionEvt: function(widgetModel, actionEvt) {
        if(!actionEvt) return;
        if(widgetModel.isMaster) {
            var actionref = $KU.returnEventReference(actionEvt);
            actionref && $KU.executeWidgetEventHandler(widgetModel, actionref);
        }
    },

    browserback: {
        currentHash: window.location.hash,

        HASH_PREFIX: '#_',

        handleBrowserBackEvent: function() {
            
            if($KG["__idletimeout"] && $KG["__idletimeout"]["enabled"])
                $KI.appevents.resettimer();
            
            
            if((window.location.hash || window.location.hash === "") && kony.events.browserback.currentHash && window.location.hash !== kony.events.browserback.currentHash) {
                var formModel = $KG["__currentForm"];
                var ondeviceback = $KU.returnEventReference(formModel.ondeviceback);
                if(ondeviceback) {
                    
                    
                    kony.events.browserback.updateURLWithLocation(formModel.id);
                    $KU.executeWidgetEventHandler(formModel, ondeviceback);
                    return;
                }
                $KI.window.dismissLoadingScreen();
                $KW.Calendar && $KW.Calendar.destroyCalendar();
                var previousFormID = window.location.hash.substr(kony.events.browserback.HASH_PREFIX.length);
                var popup = document.querySelector("form[kwidgettype='Popup']");
                popup && $KW.Popup.dismiss();
                if(popup) {
                    previousFormID = formModel.id;
                }
                if(previousFormID === "") {
                    
                    
                    window.history.go(-1);
                    return;
                }
                kony.events.browserback.updateURLWithLocation(previousFormID);
                
                var previousFormModel = $KG.allforms[previousFormID];
                if(previousFormModel && previousFormModel.wType == "Form" && previousFormID !== formModel.id) {
                    previousFormModel["isfromBrowserBack"] = true;
                    $KW.Form.show(previousFormModel);
                }
                
            }
        },

        
        
        updateURLWithLocation: function(formID) {

            if(formID) {
                window.location.hash = kony.events.browserback.currentHash = this.HASH_PREFIX + formID;
            }
        }
    }
};


window.onload = function() {
    setTimeout(function() {
        window.scrollTo(0, 1);
    }, 100);
};

window.onbeforeprint = function(e) {
    var formModel = kony.application.getCurrentForm(),
        formNode = $KU.getNodeByModel(formModel);

    formModel.media = {type:'print', height:formNode.style.height, width:document.body.style.width};
    formNode.style.height = formNode.scrollHeight + 'px';
    document.body.style.width = formModel.media.width;
};

window.onafterprint = function(e) {
    var formModel = kony.application.getCurrentForm(),
        formNode = $KU.getNodeByModel(formModel);

    document.body.style.width = formModel.media.width;
    formNode.style.height = formModel.media.height;
    delete formModel.media;
};
