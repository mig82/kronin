
$KA = {};
$KA.Utils = {
    trackEvents: [],
    apmEnabled: false,

    
    eventExists: function(widgetType) {
        var supportedEvents = {
            'Button': ['onclick'],
            'Calendar': ['onclick', 'onselection'],
            'CheckBoxGroup': ['onclick', 'onselection'],
            'ComboBox': ['onclick', 'onselection'],
            'DataGrid': ['onrowselected'],
            'Image2': [],
            'Link': ['onclick'],
            'RadioButtonGroup': ['onclick', 'onselection'],
            'RichText': ['onclick'],
            'Slider': ['onslide', 'onselection'],
            'TextField': ['ontextchange', 'ondone', 'onbeginediting', 'onendediting', 'onclick'],
            'TextArea2': ['ontextchange', 'ondone', 'onbeginediting', 'onendediting', 'onkeyup'],
            'Form': ['onorientationchange', 'onhide'],
            'HBox': ['onclick'],
            'VBox': ['onclick'],
            'TabPane': ['onclick', 'ontabclick'],
            'ScrollBox': ['onclick'],
            'Segment': ['onrowclick', 'onswipe'],
            'Switch': ['onslide'],
            'ListBox': ['onclick', 'onselection'],
            'FlexContainer': ['onclick'],
            'FlexScrollContainer': ['onclick']
        };

        
        return true;
    },

    doNotTrack: function(eName) {
        if(this.trackEvents.length < 1)
            return true;

        if(eName == "show" && this.trackEvents.indexOf("FormEntry") > -1)
            return false;

        if(eName == "onhide" && this.trackEvents.indexOf("FormExit") > -1)
            return false;

        if(eName == "onorientationchange" && this.trackEvents.indexOf("Orientation") > -1)
            return false;

        if((["Gesture Tap", "Gesture Swipe", "Gesture LongPress", "Gesture Pan", "Gesture Rotation", "Gesture Pinch", "onswipe"].indexOf(eName) > -1) && this.trackEvents.indexOf("Gesture") > -1)
            return false;

        if((["onclick", "onselection", "onrowselected", "ontabclick", "onbeginediting", "onrowclick", "onslide", "TouchEvent"].indexOf(eName) > -1) && this.trackEvents.indexOf("Touch") > -1)
            return false;

        if(eName == "servicerequest" && this.trackEvents.indexOf("ServiceRequest") > -1)
            return false;

        if(eName == "serviceresponse" && this.trackEvents.indexOf("ServiceResponse") > -1)
            return false;

        if(eName == "error" && this.trackEvents.indexOf("Error") > -1)
            return false;

        if(eName == "exception" && this.trackEvents.indexOf("Exception") > -1)
            return false;

        if(eName == "AppTransition" && this.trackEvents.indexOf("AppTransition") > -1)
            return false;

        if(eName == "AppLoad" && this.trackEvents.indexOf("AppLoad") > -1)
            return false;


        return true;
    },

    init: function() {
        try {
            var konySdkInstance = kony.sdk.getDefaultInstance();
            spaAPM.metricsServiceObj = konySdkInstance.getMetricsService();
            $KG['foreGroundStartTime'] = 0;
            window.addEventListener('focus', function() {
                if($KG['foreGroundStartTime'] == 0) {
                    spaAPM && spaAPM.sendMsg($KG["__currentForm"], 'AppTransition', {
                        "status": 'Foreground',
                        "foredur": 0
                    });
                    spaAPM && spaAPM.sendMsg($KG["__currentForm"], 'show');
                    $KG['foreGroundStartTime'] = new Date().getTime();
                }
            });

            window.addEventListener('blur', function() {
                var curTime = new Date().getTime();
                var timeDiff = curTime - $KG['foreGroundStartTime'];
                spaAPM && spaAPM.sendMsg($KG["__currentForm"], 'AppTransition', {
                    "status": 'Background',
                    "foredur": timeDiff
                });
                spaAPM && spaAPM.sendMsg($KG["__currentForm"], 'onhide');
                $KG['foreGroundStartTime'] = 0;
            });
            return true;
        } catch(e) {
            kony.print("MetricsService can be initialize due to some issue in MBAAS SDK. " + e.message);
            return false;
        }
    }
};

spaAPM = {
    metricsServiceObj: null,
    timer: null,
    eventTypeMap: [
        "FormEntry",
        "FormExit",
        "Touch",
        "ServiceRequest",
        "ServiceResponse",
        "Gesture",
        "Orientation",
        "Error",
        "Exception",
        "Crash",
        "Custom",
        "ServiceCall",
        "AppTransition",
        "AppLoad"
    ],

    startTracking: function(eventList) {
        if(!eventList && !(eventList instanceof Array) && !appConfig.eventTypes)
            return;

        $KA.Utils.trackEvents = eventList ? eventList : appConfig.eventTypes;
        $KA.Utils.apmEnabled = !this.metricsServiceObj && $KA.Utils.init();
        if(this.metricsServiceObj) {
            this.metricsServiceObj.setEventTracking = this.setEventTracking.bind(this);
        }
    },

    setEventTracking: function(eventTypes) {
        var validEventTypes = [],
            i;
        if(eventTypes && eventTypes instanceof Array) {
            for(i = 0; i < eventTypes.length; i++) {
                if(this.eventTypeMap.indexOf(eventTypes[i]) > -1) {
                    validEventTypes.push(eventTypes[i]);
                }
            }
            $KA.Utils.trackEvents = validEventTypes;
        }
    },

    
    sendMsg: function(widget, eventName, objectParams) {
        if(!$KA.Utils.apmEnabled)
            return;

        if($KA.Utils.doNotTrack(eventName))
            return;


        var widgetID = widget.id;

        var currFrm = kony.application.getCurrentForm();
        var formID = currFrm ? currFrm.id : "";
        var evtSubType = null;
        var flowTag = "";
        kony.web.logger("log", "#######APM msg sent : ID : " + widgetID + "  eventname: " + eventName + " formID: " + formID);

        
        switch(eventName) {

            case 'onorientationchange':
                if(objectParams.orientation == "landscape")
                    this.metricsServiceObj.sendEvent("Orientation", "PORTRAIT_TO_LANDSCAPE", widgetID, null, flowTag, null);
                if(objectParams.orientation == "portrait")
                    this.metricsServiceObj.sendEvent("Orientation", "LANDSCAPE_TO_PORTRAIT", widgetID, null, flowTag, null);
                break;

            case 'show':
                this.timer = new Date().getTime(); 
                this.metricsServiceObj.sendEvent("FormEntry", widgetID, widgetID, null, flowTag, null);
                break;
            case 'onhide':
                if(this.timer)
                    this.timer = new Date().getTime() - this.timer; 

                this.metricsServiceObj.sendEvent("FormExit", widgetID, widgetID, null, flowTag, {
                    "formdur": this.timer
                });
                break;

            case 'Gesture Tap':
                this.metricsServiceObj.sendEvent("Gesture", "TAP_1", formID, widgetID, flowTag, null);
                break;

            case 'onswipe':
            case 'Gesture Swipe':
                if(objectParams && objectParams.swipeDirection) {
                    var dir = "";
                    switch(objectParams.swipeDirection) {
                        case $KW.touch.TouchContext.LEFT:
                            dir = "_LEFT";
                            break;
                        case $KW.touch.TouchContext.RIGHT:
                            dir = "_RIGHT";
                            break;
                        case $KW.touch.TouchContext.UP:
                            dir = "_UP";
                            break;
                        case $KW.touch.TouchContext.DOWN:
                            dir = "_DOWN";
                            break;
                    }
                    evtSubType = "SWIPE_1" + dir;
                } else {
                    evtSubType = "SWIPE_1";
                }
                this.metricsServiceObj.sendEvent("Gesture", evtSubType, formID, widgetID, flowTag, null);
                break;

            case 'Gesture LongPress':
                this.metricsServiceObj.sendEvent("Gesture", "LONGPRESS_1", formID, widgetID, flowTag, null);
                break;

            case 'Gesture Pan':
                this.metricsServiceObj.sendEvent("Gesture", "PAN_1", formID, widgetID, flowTag, null);
                break;

            case "Gesture Rotation":
                this.metricsServiceObj.sendEvent("Gesture", "ROTATION_2", formID, widgetID, flowTag, null);
                break;

            case 'Gesture Pinch':
                this.metricsServiceObj.sendEvent("Gesture", "PINCH_2", formID, widgetID, flowTag, null);
                break;

            case 'onbeginediting':
                evtSubType = widget.wType + "_Edit";
                this.metricsServiceObj.sendEvent("Touch", evtSubType, formID, widgetID, flowTag, null);
                break;

            case 'onslide':
                evtSubType = widget.wType + "_Slide";
                this.metricsServiceObj.sendEvent("Touch", evtSubType, formID, widgetID, flowTag, null);
                break;

            case 'onrowclick':
                evtSubType = widget.wType + "_Row_Click";
                this.metricsServiceObj.sendEvent("Touch", evtSubType, formID, widgetID, flowTag, null);
                break;

            case 'onrowselected':
                evtSubType = widget.wType + "_Row_Selected";
                this.metricsServiceObj.sendEvent("Touch", evtSubType, formID, widgetID, flowTag, null);
                break;

            case 'onselection':
                evtSubType = widget.wType + "_Selection";
                this.metricsServiceObj.sendEvent("Touch", evtSubType, formID, widgetID, flowTag, null);
                break;

            case 'ontabclick':
            case 'onclick':
                evtSubType = widget.wType + "_Click";
                this.metricsServiceObj.sendEvent("Touch", evtSubType, formID, widgetID, flowTag, null);
                break;

            case 'servicerequest':
                this.metricsServiceObj.sendEvent("ServiceRequest", widget, formID, null, flowTag, null);
                break;

            case 'serviceresponse':
                this.metricsServiceObj.sendEvent("ServiceResponse", widget, formID, null, flowTag, objectParams);
                break;

            case 'error':
                this.metricsServiceObj.sendEvent("Error", widget, formID, null, flowTag, objectParams);
                break;

            case 'exception':
                this.metricsServiceObj.sendEvent("Exception", widget, formID, null, flowTag, objectParams);
                break;

            case 'TouchEvent':
                if(objectParams.eventtype == 'mousedown' || objectParams.eventtype == 'touchstart') {
                    this.metricsServiceObj.sendEvent("Touch", 'onTouchStart', formID, widgetID, flowTag, null);
                } else if(objectParams.eventtype == 'touchend' || objectParams.eventtype == 'mouseup') {
                    this.metricsServiceObj.sendEvent("Touch", 'onTouchMove', formID, widgetID, flowTag, null);
                }
                break;
            case 'AppTransition':
                this.metricsServiceObj.sendEvent("AppTransition", objectParams.status, widgetID, null, flowTag, {
                    "foredur": objectParams.foredur
                });
                break;

            case 'AppLoad':
                this.metricsServiceObj.sendEvent("AppLoad", $KG['appid'], null, null, flowTag, {
                    "loaddur": objectParams.loaddur
                });
                break;
        }

        


    },

    apmErrorHandler: function(message, url, line, columnNo, error) {
        var errInfo = {};
        try {
            if(error && error.errorcode) { 
                errInfo["exceptioncode"] = error.errorcode;
                if(error && error.name) {
                    errInfo["exceptionmsg"] = error.name;
                }
                if(error && error.stack) {
                    errInfo["exceptionstacktrace"] = error.stack;
                }
                if(url) {
                    errInfo["exceptionfile"] = error.url;
                } else if(error && error.fileName) {
                    errInfo["exceptionfile"] = error.fileName;
                }
                if(line) {
                    errInfo["exceptionline"] = line;
                } else if(error && error.lineNumber) {
                    errInfo["exceptionline"] = error.lineNumber;
                }
                if(message) {
                    errInfo["exceptioncustommsg"] = message;
                } else if(error && error.message) {
                    errInfo["exceptioncustommsg"] = error.message;
                }

                spaAPM && spaAPM.sendMsg(errInfo["exceptioncode"], "exception", errInfo);
            } else { 
                errInfo["errcode"] = "";
                if(error && error.name) {
                    errInfo["errmsg"] = error.name;
                }
                if(error && error.stack) {
                    errInfo["errstacktrace"] = error.stack;
                }
                if(url) {
                    errInfo["errfile"] = error.url;
                } else if(error && error.fileName) {
                    errInfo["errfile"] = error.fileName;
                }
                if(line) {
                    errInfo["errline"] = line;
                } else if(error && error.lineNumber) {
                    errInfo["errline"] = error.lineNumber;
                }
                if(message) {
                    errInfo["errcustommsg"] = message;
                } else if(error && error.message) {
                    errInfo["errcustommsg"] = error.message;
                }

                spaAPM && spaAPM.sendMsg(errInfo["errcode"], "error", errInfo);
            }
        } catch(e) {
            kony.print("Some issue in window.onerror " + e.message);
        }
        return false;
    }
};