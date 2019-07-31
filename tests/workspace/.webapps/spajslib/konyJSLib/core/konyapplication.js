kony.application = {

    
    createAppMenu:$KW.Appmenu && $KW.Appmenu.createappmenu,
    setCurrentAppMenu:$KW.Appmenu && $KW.Appmenu.setcurrentappmenu,
    getCurrentAppMenu:$KW.Appmenu && $KW.Appmenu.getcurrentappmenu,
    setAppMenuFocusByID:$KW.Appmenu && $KW.Appmenu.setappmenufocusbyid,
    addAppMenuItemAt:$KW.Appmenu && $KW.Appmenu.addappmenuitemat,
    removeAppMenuItemAt:$KW.Appmenu && $KW.Appmenu.removeappmenuitemat,
    setAppMenu: $KW.Appmenu && $KW.Appmenu.setappmenu,
    setAppMenuFocusIndex: $KW.Appmenu && $KW.Appmenu.setappmenufocusindex,
    showAppMenuItems: $KW.Appmenu && $KW.Appmenu.showappmenuitems,
    hideAppMenuItems: $KW.Appmenu && $KW.Appmenu.hideappmenuitems,
    
    setBMState   : kony.bm.setBMState,
    resetBMState : kony.bm.resetBMState,
    getBMState   : kony.bm.getBMState,
    getFormId    : kony.bm.getFormId,
    addBMState   : kony.bm.addBMState,
    removeBMState: kony.bm.removeBMState,

    exit: $KI.exit,

    getPreviousForm: $KW.Form && $KW.Form.getPreviousForm,
    getCurrentForm: $KW.Form && $KW.Form.getCurrentForm,
    getCurrentBreakpoint: $KW.Form && $KW.Form.getCurrentBreakpoint,

    removeGestureRecognizerForAllForms: $KW.Widget && $KW.Widget.removegesturerecognizerforallforms,
    setGestureRecognizerForAllForms: $KW.Widget && $KW.Widget.setgesturerecognizerforallforms,
    addGestureRecognizerForAllForms: $KW.Widget && $KW.Widget.addgesturerecognizerforallforms,

    getApplicationMode: $KI.os && $KI.os.getapplicationmode,
    setApplicationMode: $KI.os && $KI.os.setapplicationmode,
    setApplicationInitializationEvents: $KI.setappevents,

    registerForIdleTimeout: $KI.appevents && $KI.appevents.registerforidletimeout,
    unregisterForIdleTimeout:$KI.appevents && $KI.appevents.unregisterforidletimeout,

    
    setApplicationBadgeValue: tobeimplemented,
    getApplicationBadgeValue: tobeimplemented,
    setAppMenuBadgeValue: tobeimplemented,
    getAppMenuBadgeValue: tobeimplemented,

    appReset: $KI.appreset,

    setAppHeaders: $KI.setappheaders,
    setAppFooters: $KI.setappfooters,
    setApplicationCallbacks: $KI.setapplicationcallbacks,
    addApplicationCallbacks: $KI.addapplicationcallbacks,
    removeApplicationCallbacks: $KI.removeapplicationcallbacks,
    setApplicationBehaviors: $KI.setapplicationbehaviors,
    getApplicationBehavior: $KI.getapplicationbehavior,

    
    registerUserWidget: $KW.KComponent.registerComponent,
    registerMaster: $KW.KComponent.registerComponent,

    showLoadingScreen : $KI.window && $KI.window.showLoadingScreen,
    dismissLoadingScreen : $KI.window && $KI.window.dismissLoadingScreen,
    setupWidgetDataRecording :  $KI.setupWidgetDataRecording,
    setSeoDataReadyFlag :  $KI.setSeoDataReadyFlag,
    removeSeoDataReadyFlag :  $KI.removeSeoDataReadyFlag,
    openURL: $KI.window.openURL,
    openURLAsync: $KI.window.openURLAsync,

    
    PERMISSION_DENIED  : 0,
    PERMISSION_GRANTED : 1,
    PERMISSION_RESTRICTED : 2,
    RESOURCE_NOT_SUPPORTED : 3,
    
    checkPermission: function(resourceId, options){
        $KU.logExecuting('kony.application.checkPermission');
        if(arguments.length < 1){
            $KU.logErrorMessage('Invalid no of arguments');
            throw new KonyError(101, "Error", "Invalid number of arguments");
            return;
        }
        $KU.logExecutingWithParams('kony.application.checkPermission', resourceId, options);
        switch (resourceId) {
            case kony.os.RESOURCE_LOCATION :
            case kony.os.RESOURCE_CAMERA :
            case kony.os.RESOURCE_PHOTO_GALLERY :
            case kony.os.RESOURCE_CALENDAR :
                $KU.logExecutingFinished('kony.application.checkPermission VIA if resource permission granted ');
                return {status:kony.application.PERMISSION_GRANTED, canRequestPermission: false };
            case kony.os.RESOURCE_CONTACTS :
            case kony.os.RESOURCE_EXTERNAL_STORAGE :
            default:
                $KU.logExecutingFinished('kony.application.checkPermission VIA if resource permission is not granted or resource is not supported');
                return {status:kony.application.RESOURCE_NOT_SUPPORTED, canRequestPermission: false };
        }
    },

    
    requestPermission: function(resourceId, callback, options){
        $KU.logExecuting('kony.application.requestPermission');
        $KU.logExecutingWithParams('kony.application.requestPermission', resourceId, callback, options);
        if(arguments.length < 2){
            $KU.logErrorMessage('Invalid no of arguments');
            throw new KonyError(101, "Error", "Invalid number of arguments");
            return;
        }
        if(!( typeof callback === "function")){
            $KU.logErrorMessage('Invalid callback function');
            throw new KonyError(102, "Error", "Invalid input.");
            return;
        }

        switch (resourceId) {
            case kony.os.RESOURCE_LOCATION :
            case kony.os.RESOURCE_CAMERA :
            case kony.os.RESOURCE_PHOTO_GALLERY :
            case kony.os.RESOURCE_CALENDAR :
                $KU.logExecutingFinished('kony.application.requestPermission VIA if resource permission granted');
                callback({status:kony.application.PERMISSION_GRANTED, canRequestPermission: false });
                break;
            case kony.os.RESOURCE_CONTACTS :
            case kony.os.RESOURCE_EXTERNAL_STORAGE :
            default:
                $KU.logExecutingFinished('kony.application.requestPermission VIA if if resource permission is not granted or resource is not supported');
                callback({status:kony.application.RESOURCE_NOT_SUPPORTED, canRequestPermission: false });
        }
    },
    
    openApplicationSettings: function(){
        $KU.logWarnMessage("openApplicationSettings API is not supported.");
    },

    isPopupBlocked: function(cb) {
        $KU.logExecuting('kony.application.isPopupBlocked');
        $KU.logExecutingWithParams('kony.application.isPopupBlocked', cb);
        var test;
        setTimeout(function() {
            test = window.open(null);
            try {
                test.close();
                $KU.logExecutingFinished('kony.application.isPopupBlocked VIA enabling popups');
                cb && cb(false); 
            } catch (e) {
                $KU.logExecutingFinished('kony.application.isPopupBlocked VIA disabling popups');
                cb && cb(true); 
            }
        }, 2000);
    },

    isImageTurnedOff: function(cb) {
        $KU.logExecuting('kony.application.isImageTurnedOff');
        $KU.logExecutingWithParams('kony.application.isImageTurnedOff', cb);
        var isCompleted;
        var __kspaimage = document.createElement("img");
        __kspaimage.src = $KU.getImageURL('slider.png');
        __kspaimage.id = "__kspaimage";
        __kspaimage.style.visibility="hidden";
        document.body.appendChild(__kspaimage);
        setTimeout(function() {
            isCompleted =  __kspaimage.complete;
            if(!isCompleted) {
                $KU.logExecutingFinished('kony.application.isImageTurnedOff VIA !isCompleted == true');
                cb && cb(true);
            } else {
                $KU.logExecutingFinished('kony.application.isImageTurnedOff VIA !isCompleted == false');
                cb && cb(false);
            }
            document.body.removeChild(__kspaimage);
        }, 1000);
    },

    addSettingsMenuItemAt                      : tobeimplemented,
    beginBackgroundTask                        : tobeimplemented,
    createSettingsMenu                            : tobeimplemented,
    destroyForm                                : tobeimplemented,
    disableZoomedOutView                         : tobeimplemented,
    endBackgroundTask                            : tobeimplemented,
    getApplicationState                        : tobeimplemented,
    getAppWindow                                : tobeimplemented,
    getCurrentSettingsMenu                        : tobeimplemented,
    getPreviousSessionParams                    : tobeimplemented,
    invalidateSession                            : tobeimplemented,
    launchApp                                    : tobeimplemented,
    registerOnKeyPress                            : tobeimplemented,
    removeSecondaryTile                        : tobeimplemented,
    removeSettingsMenuItemAt                    : tobeimplemented,
    setApplicationLayout                        : tobeimplemented,
    setApplicationProperties                    : tobeimplemented,
    setAppTile                                    : tobeimplemented,
    setCheckBoxSelectionImageAlignment            : tobeimplemented,
    setCurrentSettingsMenu                        : tobeimplemented,
    setDefaultTextboxPadding                    : tobeimplemented,
    setRespectImageSizeForImageWidgetAlignment : tobeimplemented,
    setSecondaryTile                           : tobeimplemented,
    setZoomedOutView                            : tobeimplemented,
    zoomIn                                        : tobeimplemented
};

function tobeimplemented() {
    kony.web.logger("warn", "API to be implemented Yet");
};

kony.application.settings = {
    read : tobeimplemented ,
    write : tobeimplemented
};
