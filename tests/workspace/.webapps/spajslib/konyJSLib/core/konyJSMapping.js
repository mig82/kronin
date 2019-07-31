
if($KI.crypto) {
    kony.crypto = {
            newKey: $KI.crypto.newkey,
            saveKey: $KI.crypto.savekey,
            createHash: $KI.crypto.createhash,
            retrievePublicKey: $KI.crypto.retrievepublickey,
            deleteKey: $KI.crypto.deletekey,
            readKey: $KI.crypto.readkey,
            encrypt: $KI.crypto.encrypt,
            decrypt: $KI.crypto.decrypt,
            createHMacHash: $KI.crypto.createHMacHash,
            createPBKDF2Key: $KI.crypto.createPBKDF2Key
    };
}


if ($KI.db) {
    kony.db = {
        openDatabase: $KI.db.opendatabase,
        transaction: $KI.db.transaction,
        readTransaction: $KI.db.readtransaction,
        executeSql: $KI.db.executesql,
        sqlResultsetRowItem:$KI.db.sqlresultsetrowitem,
        changeVersion: $KI.db.changeversion
    };
}


if($KI.ds) {
    kony.ds = {
        "delete" : $KI.ds.Delete,
        remove: $KI.ds.Delete,
        read : $KI.ds.read,
        save : $KI.ds.save
    };
}


if($KI.i18n) {
    kony.i18n = {
        deleteResourceBundle: $KI.i18n.deleteresourcebundle,
        getLocalizedString: $KI.i18n.getlocalizedstring,
        getCurrentLocale: $KI.i18n.getcurrentlocale,
        isResourceBundlePresent: $KI.i18n.isresourcebundlepresent,
        setCurrentLocale: $KI.i18n.setcurrentlocale,
        setCurrentLocaleAsync: $KI.i18n.setcurrentlocaleasync,
        setDefaultLocale: $KI.i18n.setdefaultlocale,
        setDefaultLocaleAsync: $KI.i18n.setdefaultlocaleasync,
        setResourceBundle: $KI.i18n.setresourcebundle,
        updateResourceBundle:$KI.i18n.updateresourcebundle,
        getCurrentDeviceLocale:$KI.i18n.getcurrentdevicelocale,
        getSupportedLocales:$KI.i18n.getsupportedlocales,
        isLocaleSupportedByDevice:$KI.i18n.islocalesupportedbydevice,
        setLocaleLayoutConfig:$KI.i18n.setlocalelayoutconfig
    };
}


if($KI.localstorage) {
    kony.store = {
        key: $KI.localstorage.key,
        getItem: $KI.localstorage.getitem,
        removeItem: $KI.localstorage.removeitem,
        setItem: $KI.localstorage.setitem,
        clear: $KI.localstorage.clear,
        length: $KI.localstorage.length
    };
}


if($KI.geolocation) {
    kony.location = {
        clearWatch: $KI.geolocation.clearwatch,
        getCurrentPosition: $KI.geolocation.getcurrentposition,
        watchPosition: $KI.geolocation.watchposition,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
    };
}




if($KI.os) {
    kony.os = {
        toNumber: $KI.os.tonumber,
        toCurrency: $KI.os.tocurrency,
        freeMemory: $KI.os.freememory,
        userAgent: $KI.os.useragent,
        deviceInfo: $KI.os.platform,  
        hasGPSSupport: $KI.os.hasgpssupport,  
        hasCameraSupport: $KI.os.hascamerasupport,
        hasTouchSupport: $KI.os.hastouchsupport,
        hasOrientationSupport: $KI.os.hasorientationsupport,
        hasAccelerometerSupport: $KI.os.hasaccelerometersupport,
        getDeviceCurrentOrientation: $KI.os.getdevicecurrentorientation,
        httpheaders: $KI.os.httpheaders,
        getApplicationMode : $KI.os.getapplicationmode,
        setApplicationMode : $KI.os.setapplicationmode,
        setApplicationScrollMode : $KI.os.setapplicationscrollmode,
        getAppContext: $KI.os.getappcontext,
        print: tobeimplemented,
        addHiddenField : tobeimplemented,
        getBatteryLevel : tobeimplemented,
        getBatteryState : tobeimplemented,
        readHiddenField : tobeimplemented,
        registerBatteryChange : tobeimplemented,
        removeAllMetaTags : tobeimplemented,
        removeMetaTag  : tobeimplemented,
        startSecureTransaction : tobeimplemented,
        unregisterBatteryChange : tobeimplemented,

        
        RESOURCE_LOCATION : 0,
        RESOURCE_CAMERA : 1,
        RESOURCE_PHOTO_GALLERY : 2,
        RESOURCE_CONTACTS : 3,
        RESOURCE_CALENDAR : 4,
        RESOURCE_EXTERNAL_STORAGE : 5
    };
}


if($KI.net) {
    kony.net = {
        HttpRequest : $KI.net.HttpRequest,
        FormData : $KI.net.FormData,
        MultipartFormData : $KI.net.MultipartFormData,
        invokeServiceAsync : $KI.net.invokeserviceasync,
        invokeService : $KI.net.invokeService,
        cancel : $KI.net.cancel,
        isNetworkAvailable : $KI.net.isNetworkAvailable,
        setNetworkCallbacks : $KI.net.setNetworkCallbacks,
        getActiveNetworkType : $KI.net.getActiveNetworkType,
        getCookies : $KI.net.getCookies,
        clearCookies : $KI.net.clearCookies,
        loadClientCertificate : $KI.net.loadClientCertificate,
        removeAllCachedResponses : $KI.net.removeAllCachedResponses,
        removeIntegrityCheck : $KI.net.removeIntegrityCheck,
        setIntegrityCheck : $KI.net.setIntegrityCheck,
        urlDecode : $KI.net.urlDecode,
        urlEncode : $KI.net.urlEncode
    };
}


if($KI.phone) {
    kony.phone = {
        dial: $KI.phone.dial,
        openMediaGallery: $KI.phone.openmediagallery, 
        addCalendarEvent: $KI.phone.addCalendarEvent,
        findCalendarEvents: $KI.phone.findCalendarEvents,
        openEmail: $KI.phone.openEmail,
        removeCalendarEvent: $KI.phone.removeCalendarEvent,
        sendSMS: $KI.phone.sendSMS
    };
}


if($KI.string) {
    kony.string = {
        rep: $KI.string.rep,
        reverse: $KI.string.reverse,
        trim: $KI.string.trim,
        equalsIgnoreCase: $KI.string.equalsignorecase,
        startsWith: $KI.string.startswith,
        endsWith: $KI.string.endswith,
        isNumeric: $KI.string.isnumeric,
        containsChars: $KI.string.containschars,
        containsOnlyGivenChars: $KI.string.containsonlygivenchars,
        containsNoGivenChars: $KI.string.containsnogivenchars,
        isAsciiAlpha: $KI.string.isasciialpha,
        isAsciiAlphaNumeric: $KI.string.isasciialphanumeric,
        isValidEmail: $KI.string.isvalidemail
    };
}


if($KI.timer) {
    kony.timer = {
        schedule: $KI.timer.schedule,
        cancel: $KI.timer.cancel,
        setCallBack: $KI.timer.setcallback
    };
}


if($KI.themes) {
    kony.theme = {
        createTheme: $KI.themes.createtheme,
        deleteTheme: $KI.themes.deletetheme,
        getCurrentThemeData: $KI.themes.getcurrentthemedata,
        getCurrentTheme: $KI.themes.getcurrenttheme,
        getAllThemes: $KI.themes.allthemes,
        isThemePresent: $KI.themes.isthemepresent,
        setCurrentTheme: $KI.themes.setcurrenttheme,
        packagedthemes:$KI.themes.packagedthemes
    };
}

kony.convertToBase64 = $KI.converttobase64;
kony.convertToRawBytes = $KI.converttorawbytes;

kony.print = $KI.print;
kony.props = {};
kony.props.getProperty = $KI.props.getProperty;



if(!kony.stream) kony.stream = {};

kony.stream.registerDataStream = tobeimplemented;
kony.stream.deregisterDataStream = tobeimplemented;
kony.stream.setCallback = tobeimplemented;


if(!kony.accelerometer) kony.accelerometer = {};

kony.accelerometer.registerAccelerationEvents = tobeimplemented;
kony.accelerometer.retrieveCurrentAcceleration = tobeimplemented;
kony.accelerometer.startMonitoringAcceleration = tobeimplemented;
kony.accelerometer.stopMonitoringAcceleration = tobeimplemented;
kony.accelerometer.unregisterAccelerationEvents = tobeimplemented;


if(!kony.forcetouch) kony.forcetouch = {};

kony.forcetouch.getQuickActionItems = tobeimplemented;
kony.forcetouch.getStaticQuickActionItems = tobeimplemented;
kony.forcetouch.removeQuickActionItems = tobeimplemented;
kony.forcetouch.removeQuickActionItems = tobeimplemented;
kony.forcetouch.setQuickActionItems = tobeimplemented;


if(!kony.keychain) kony.keychain = {};

kony.keychain.remove = tobeimplemented;
kony.keychain.retrieve = tobeimplemented;
kony.keychain.save = tobeimplemented;


if(!kony.localAuthentication) kony.localAuthentication = {};

kony.localAuthentication.authenticate = tobeimplemented;
kony.localAuthentication.getBiometryType = tobeimplemented;
kony.localAuthentication.cancelAuthentication = tobeimplemented;
kony.localAuthentication.getStatusForAuthenticationMode = tobeimplemented;


if(!kony.media) kony.media = {};

kony.media.createFromFile = tobeimplemented;
kony.media.createFromUri = tobeimplemented;
kony.media.record = tobeimplemented;


if(!kony.localnotifications) kony.localnotifications = {};

kony.localnotifications.cancel = tobeimplemented;
kony.localnotifications.create = tobeimplemented;
kony.localnotifications.getNotifications = tobeimplemented;
kony.localnotifications.setCallbacks = tobeimplemented;


if(!kony.notificationsettings) kony.notificationsettings = {};

kony.notificationsettings.createAction = tobeimplemented;
kony.notificationsettings.createCategory = tobeimplemented;
kony.notificationsettings.registerCategory = tobeimplemented;


if(!kony.push) kony.push = {};
kony.push.deRegister = tobeimplemented;
kony.push.register = tobeimplemented;
kony.push.setCallbacks = tobeimplemented;

if(!kony.contact) kony.contact = {};

kony.contact.add = tobeimplemented;
kony.contact.details = tobeimplemented;
kony.contact.find = tobeimplemented;
kony.contact.remove = tobeimplemented;


if(!kony.lang) kony.lang = {};

kony.lang.setUncaughtExceptionHandler = $KI.setUncaughtExceptionHandler;
kony.lang.getUncaughtExceptionHandler = $KI.getUncaughtExceptionHandler;


if(!kony.map) kony.map = {};

kony.map.containsLocation  = tobeimplemented;
kony.map.distanceBetween = tobeimplemented;
kony.map.decode = tobeimplemented;
kony.map.searchRoutes = tobeimplemented;


if(!kony.filter) kony.filter = {};

kony.filter.createFilter = tobeimplemented;


if(!kony.image) kony.image = {};

kony.image.createImage = tobeimplemented;
kony.image.createImageFromSnapShot = tobeimplemented;
kony.image.cropImageInTiles = tobeimplemented;
kony.image.cropImageInTilesForRects = tobeimplemented;


if(!kony.camera) kony.camera = {};

kony.camera.releaseRawBytes = tobeimplemented;


if(!kony.backgroundtasks) kony.backgroundtasks = {};

kony.backgroundtasks.startTask = tobeimplemented;
kony.backgroundtasks.stopTask = tobeimplemented;
kony.backgroundtasks.getTaskDetails = tobeimplemented;


if(!kony.shareExtensions) kony.shareExtensions = {};

kony.shareExtensions.popConfigurationViewController = tobeimplemented;
kony.shareExtensions.pushConfigurationViewController = tobeimplemented;
kony.shareExtensions.setExtensionsCallbacks = tobeimplemented;

if(!kony.todayExtension) kony.todayExtension = {};
kony.todayExtension.setExtensionsCallbacks = tobeimplemented ;

if(!kony.actionExtension) kony.actionExtension = {};
kony.actionExtension.setExtensionsCallbacks = tobeimplemented ;

if(!kony.intentExtension) kony.intentExtension = {};
kony.intentExtension.setExtensionsCallbacks = tobeimplemented ;

if(!kony.iMessageExtensions) kony.iMessageExtensions = {};
kony.iMessageExtensions.setExtensionsCallbacks = tobeimplemented ;

if(!kony.notificationContentExtension) kony.notificationContentExtension = {};
kony.notificationContentExtension.setExtensionsCallbacks = tobeimplemented ;


kony.runOnMainThread = tobeimplemented ;
kony.runOnWorkerThread = tobeimplemented ;

if(!com) com = {};
if(!com.kony) com.kony = {};

com.kony.Beacon = tobeimplemented;
com.kony.BeaconManager = tobeimplemented;
com.kony.BeaconRegion = tobeimplemented;
com.kony.PeripheralManager = tobeimplemented;
com.kony.isPassLibraryAvailable = tobeimplemented;
com.kony.PassLibrary = tobeimplemented;

com.kony.Beacon.prototype.getrssi =
com.kony.Beacon.prototype.getMajor =
com.kony.Beacon.prototype.getMinor =
com.kony.Beacon.prototype.getAccuracy =
com.kony.Beacon.prototype.getProximity =
com.kony.Beacon.prototype.getProximityUUIDString =

com.kony.BeaconManager.prototype.getRangedRegions =
com.kony.BeaconManager.prototype.authorizationStatus =
com.kony.BeaconManager.prototype.getMonitoredRegions =
com.kony.BeaconManager.prototype.requestStateForRegion =
com.kony.BeaconManager.prototype.stopRangingBeaconsInRegion =
com.kony.BeaconManager.prototype.startMonitoringBeaconRegion =
com.kony.BeaconManager.prototype.startRangingBeaconsInRegion =
com.kony.BeaconManager.prototype.stopMonitoringBeaconsRegion =
com.kony.BeaconManager.prototype.isRangingAvailableForBeaconRegions =
com.kony.BeaconManager.prototype.setAuthorizationStatusChangedCallback =
com.kony.BeaconManager.prototype.setMonitoringStartedForRegionCallback =
com.kony.BeaconManager.prototype.isMonitoringAvailableForBeaconRegions =

com.kony.PeripheralManager.prototype.isAdvertising =
com.kony.PeripheralManager.prototype.stopAdvertising =
com.kony.PeripheralManager.prototype.authorizationStatus =
com.kony.PeripheralManager.prototype.startAdvertisingWithMeasuredPower =

com.kony.PassLibrary.prototype.addPassWithCompletionCallback =
com.kony.PassLibrary.prototype.addPassesWithCompletionCallback =
com.kony.PassLibrary.prototype.containsPass =
com.kony.PassLibrary.prototype.getPassWithTypeIdentifierAndSerialNumber =
com.kony.PassLibrary.prototype.getPasses =
com.kony.PassLibrary.prototype.removePass =
com.kony.PassLibrary.prototype.replacePassWithPass = tobeimplemented;
