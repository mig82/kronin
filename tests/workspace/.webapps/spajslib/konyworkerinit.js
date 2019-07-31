
kony = $KI = {};
$KIO = {};
kony.os = new Object();
kony.system = new Object();
var releasemode = false;
var IndexJL = 0;

kony.print = function(msg) {
    if(typeof console !== "undefined")
        console.log(msg);
};


KonyError = function(errorcode, name, message) {
    this.errorCode = this.errorcode = errorcode;
    this.name = name;
    this.message = message;
};
KonyError.prototype = new Error();
KonyError.prototype.constructor = KonyError;

kony.getError = function(e) {
    return e;
};


onmessage = function(oEvent) {
    var data = oEvent.data;

    if(typeof data.moduleName === "undefined")
        return;

    $KG = {
        "appmode": data.kgAppMode,
        "appid": data.kgAppID,
        "rcid": data.kgRcid,
        "skipproxy": data.kgSkipProxy
    };
    window = self;
    nestedWorker = true;

    if(releasemode) {
        importScripts('../jslib/konywebworkermin.js');
    } else {
        importScripts('konylibrary.js', '../jslib/konytimerapi.js', '../jslib/konyconstants.js', '../jslib/konyosapi.js', '../jslib/konysystem.js', '../jslib/konynetwork.js');
        importScripts('../jslib/konyworker.js', '../jslib/konydatabaseapi.js', '../jslib/konycrypto.js', '../jslib/tparty/crypto/cryptojslib.js');
        if(data.isFMSupported) {
            importScripts('konyFunctionalModules.js', '../jslib/konymodule.js', '../jslib/tparty/requirejs/require.js');
        }
    }

    
    if($KI.db) {
        kony.db = {
            openDatabase: $KI.db.opendatabase,
            transaction: $KI.db.transaction,
            readTransaction: $KI.db.readtransaction,
            executeSql: $KI.db.executesql,
            sqlResultsetRowItem: $KI.db.sqlresultsetrowitem,
            changeVersion: $KI.db.changeversion
        }
    }


    
    if($KI.os) {
        kony.os = {
            toNumber: $KI.os.tonumber,
            toCurrency: $KI.os.tocurrency,
            freeMemory: $KI.os.freememory,
            userAgent: function() {
                return data.kgUserAgent;
            }
        }
    }


    
    if($KI.net) {
        kony.net = {
            HttpRequest: $KI.net.HttpRequest,
            invokeServiceAsync: $KI.net.invokeserviceasync,
            invokeService: $KI.net.invokeService,
            cancel: $KI.net.cancel,
            isNetworkAvailable: $KI.net.isNetworkAvailable,
            
            getActiveNetworkType: $KI.net.getActiveNetworkType,
            checkOriginandPostOrigin: $KI.net.checkOriginandPostOrigin,
            postdataparams: $KI.net.postdataparams
        }
    }

    
    if($KI.crypto) {
        kony.crypto = {
            newKey: $KI.crypto.newkey,
            
            stringify: $KI.crypto.stringify,
            parse: $KI.crypto.parse,
            createHash: $KI.crypto.createhash,
            retrievePublicKey: $KI.crypto.retrievepublickey,
            
            
            encrypt: $KI.crypto.encrypt,
            decrypt: $KI.crypto.decrypt
        }
    }

    
    if($KI.timer) {
        kony.timer = {
            schedule: $KI.timer.schedule,
            cancel: $KI.timer.cancel,
            setCallBack: $KI.timer.setcallback,
            callbackclosure: $KI.timer.callbackclosure,
            timerinfo: $KI.timer.timerinfo
        }
    }

    
    if(kony.worker) {
        kony.worker = {
            WorkerThread: kony.worker.WorkerThread
        }
    }

    
    _importScripts = importScripts;
    _addEventListener = addEventListener;
    _removeEventListener = removeEventListener;
    _postMessage = postMessage;

    importScripts = function() {
        for(i = 0; i < arguments.length; i++) {
            if(typeof arguments[i] !== "string") {
                throw new KonyError(3002, "WorkerThreadError", "importScripts: InvalidParameter. Invalid script name.");
            }
            try {
                _importScripts(arguments[i]);
            } catch(e) {
                if((e.name && e.name == "NetworkError") || (e.message && (/network/i).test(e.message)) || (e.message && (/Script file not found/i).test(e.message))) {
                    throw new KonyError(3002, "WorkerThreadError", "importScripts: InvalidParameter. Unable to import script. " + arguments[i]);
                } else {
                    throw e;
                }
            }
        }
    }

    addEventListener = function(sName, fListener) {
        if(arguments.length < 2) {
            throw new KonyError(3001, "WorkerThreadError", "addEventListener: MissingMandatoryParameter. Mandatory arguments missing"); 
        }
        if(typeof arguments[0] != "string" || typeof arguments[1] != "function") {
            throw new KonyError(3002, "WorkerThreadError", "addEventListener: InvalidParameter. Invalid arguments");
        }
        if(sName != "message" && sName != "error") {
            throw new KonyError(3002, "WorkerThreadError", "addEventListener: InvalidParameter. Invalid arguments");
        }
        _addEventListener(sName, fListener);
    }

    removeEventListener = function(sName, fListener) {
        if(arguments.length < 2) {
            throw new KonyError(3001, "WorkerThreadError", "removeEventListener: MissingMandatoryParameter. Mandatory arguments missing"); 
        }
        if(typeof arguments[0] != "string" || typeof arguments[1] != "function") {
            throw new KonyError(3002, "WorkerThreadError", "removeEventListener: InvalidParameter. Invalid arguments");
        }
        if(sName != "message" && sName != "error") {
            throw new KonyError(3002, "WorkerThreadError", "removeEventListener: InvalidParameter. Invalid arguments");
        }
        _removeEventListener(sName, fListener);
    }

    postMessage = function(vMsg) {
        if(vMsg === undefined || vMsg === null || vMsg === '') {
            throw new KonyError(3001, "WorkerThreadError", "postMessage: MissingMandatoryParameter. Message undefined");
        }
        if(typeof vMsg === "number" || typeof vMsg === "boolean" || typeof vMsg === "function") {
            throw new KonyError(3002, "WorkerThreadError", "postMessage: InvalidParameter. Invalid Message");
        }
        try {
            _postMessage(vMsg);
        } catch(err) {
            kony.print("Error occured in WorkerThread postMessage: " + err.message);
            throw new KonyError(3002, "WorkerThreadError", "postMessage: InvalidParameter. Invalid Message");
        }
    }

    try {
        if(data.moduleName.indexOf(".js") > 0) {
            _importScripts(data.moduleName);
        } else {
            var modLoaded = false;
            if(data.isFMSupported) {
                modLoaded = kony.modules.loadFunctionalModule(data.moduleName);
            }
            
            if(!modLoaded) {
                throw new Error("WorkerThread: InvalidParameter. WorkerThread script not found");
            }
        }
    } catch(e) {
        if((e.name && e.name == "NetworkError") || (e.message && (/network/i).test(e.message)) || (e.message && (/Script file not found/i).test(e.message))) {
            throw new Error("WorkerThread: InvalidParameter. WorkerThread script not found");
        } else {
            throw e;
        }
    }
    self.onmessage = null;
};
