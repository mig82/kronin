




$KI.crypto = (function() {
    
    var _generateRandomNumber = function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var _generateRandomString = function() {
        var randomLength = 0, randomString = '', i = 0,
            possibleString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        randomLength = _generateRandomNumber(8, 16);
        for(i = 0; i < randomLength; i++) {
          randomString += possibleString.charAt(Math.floor(Math.random() * possibleString.length));
        }
        return randomString;
    };

    var _createHashToUpperCase = function(algo, toHash) {
        var hashValueToUpperCase = $KI.crypto.createhash(algo, toHash);

        if(typeof hashValueToUpperCase == 'string') {
            hashValueToUpperCase = hashValueToUpperCase.toUpperCase();
        }
        return hashValueToUpperCase;
    };
    
    
    var module = {
        stringify: function(cipherParams) {
            
            var jsonObj = {
                ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
            };
            
            if(cipherParams.iv) {
                jsonObj.iv = cipherParams.iv.toString();
            }
            if(cipherParams.salt) {
                jsonObj.s = cipherParams.salt.toString();
            }
            
            return JSON.stringify(jsonObj);
        },

        parse: function(jsonStr) {
            
            var jsonObj = JSON.parse(jsonStr);
            
            var cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
            });
            
            if(jsonObj.iv) {
                cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv)
            }
            if(jsonObj.s) {
                cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s)
            }
            return cipherParams;
        },

        
        createhash: function(algotype, inputmessage) {
            var msg;
            var statuscode;
            $KU.logExecuting('kony.crypto.createhash');
            if(typeof(inputmessage) != "string") {
                $KU.logErrorMessage('invalid input ' + inputmessage);
                return {
                    errcode: 100,
                    errmessage: "invalid input parameters"
                };
            }
            $KU.logExecutingWithParams('kony.crypto.createhash', algotype, inputmessage);
            try {
                switch(algotype.toLowerCase()) {
                    case "md5":
                        msg = CryptoJS.MD5(inputmessage);
                        break;
                    case "sha256":
                        msg = CryptoJS.SHA256(inputmessage);
                        break;
                    case "sha1":
                        msg = CryptoJS.SHA1(inputmessage);
                        break;
                    case "sha512":
                        msg = CryptoJS.SHA512(inputmessage);
                        break;
                    default:
                        $KU.logErrorMessage('unsupported algorithm');
                        msg = {
                            errcode: 101,
                            errmessage: "unsupported algorithm"
                        }
                        break;
                }
                if(typeof msg != 'string') {
                    msg = msg.toString(CryptoJS.enc.UTF8);
                }
                $KU.logExecutingFinished('kony.crypto.createhash');
                return msg;
            } catch(ex) {
                $KU.logErrorMessage('unknown error' + ex);
                return {
                    errcode: 102,
                    errmessage: "unknown  error"
                };
            }
        },

        encrypt: function(algo, generatedkey, inputstring, propertiesTable) {
            $KU.logExecuting('kony.crypto.encrypt');
            if(typeof(algo) != "string" && inputstring && generatedkey) {
                $KU.logErrorMessage('invalid input parameters');
                return {
                    errcode: 100,
                    errmessage: "invalid input parameters"
                };
            }
            $KU.logExecutingWithParams('kony.crypto.encrypt', algo, generatedkey, inputstring, propertiesTable);
            var mode = CryptoJS.mode.CBC;
            var padding = CryptoJS.pad.Pkcs7;
            try {
                if(propertiesTable) {
                    if(propertiesTable.mode) {
                        switch(propertiesTable.mode.toLowerCase()) {
                            case 'cfb':
                                mode = CryptoJS.mode.CFB;
                                break;
                            case 'ctr':
                                mode = CryptoJS.mode.CTR;
                                break;
                            case 'ofb':
                                mode = CryptoJS.mode.OFB;
                                break;
                            case 'ecb':
                                mode = CryptoJS.mode.ECB;
                                break;
                        }
                    }
                    if(propertiesTable.padding) {
                        switch(propertiesTable.padding.toLowerCase()) {
                            case 'iso97971':
                                padding = CryptoJS.pad.Iso97971;
                                break;
                            case 'iso10126':
                                padding = CryptoJS.pad.Iso10126;
                                break;
                            case 'zeropadding':
                                padding = CryptoJS.pad.ZeroPadding;
                                break;
                            case 'nopadding':
                                padding = CryptoJS.pad.NoPadding;
                                break;
                        }
                    }
                }
                if(algo.toLowerCase() == "aes") {
                    var encryptedObj = CryptoJS.AES.encrypt(inputstring, generatedkey, {
                        mode: mode,
                        padding: padding
                    });
                    $KU.logExecutingFinished('kony.crypto.encrypt VIA encrypting using AES algorithm');
                    return module.stringify(encryptedObj);
                } else if(algo.toLowerCase() == "tripledes") {
                    var encryptedObj = CryptoJS.TripleDES.encrypt(inputstring, generatedkey, {
                        mode: mode,
                        padding: padding,
                        format: module.JsonFormatter
                    });
                    $KU.logExecutingFinished('kony.crypto.encrypt VIA encrypting using TripleDES algorithm');
                    return module.stringify(encryptedObj);
                } else {
                    $KU.logErrorMessage('unsupported algorithm');
                    return {
                        errcode: 101,
                        errmessage: "unsupported algorithm"
                    };
                }
            } catch(ex) {
                $KU.logErrorMessage('unknown error');
                return {
                    errcode: 102,
                    errmessage: "unknown  error"
                };
            }
        },

        decrypt: function(algo, generatedkey, inputstring, propertiesTable) {
            $KU.logExecuting('kony.crypto.decrypt');
            if(typeof(algo) != "string" && inputstring && generatedkey) {
                $KU.logErrorMessage('invalid input parameters');
                return {
                    errcode: 100,
                    errmessage: "invalid input parameters"
                };
            }
            $KU.logExecutingWithParams('kony.crypto.decrypt', algo, generatedkey, inputstring, propertiesTable);
            var mode = CryptoJS.mode.CBC;
            var padding = CryptoJS.pad.Pkcs7;
            try {
                if(propertiesTable) {
                    if(propertiesTable.mode) {
                        switch(propertiesTable.mode.toLowerCase()) {
                            case 'cfb':
                                mode = CryptoJS.mode.CFB;
                                break;
                            case 'ctr':
                                mode = CryptoJS.mode.CTR;
                                break;
                            case 'ofb':
                                mode = CryptoJS.mode.OFB;
                                break;
                            case 'ecb':
                                mode = CryptoJS.mode.ECB;
                                break;
                        }
                    }
                    if(propertiesTable.padding) {
                        switch(propertiesTable.padding.toLowerCase()) {
                            case 'iso97971':
                                padding = CryptoJS.pad.Iso97971;
                                break;
                            case 'iso10126':
                                padding = CryptoJS.pad.Iso10126;
                                break;
                            case 'zeropadding':
                                padding = CryptoJS.pad.ZeroPadding;
                                break;
                            case 'nopadding':
                                padding = CryptoJS.pad.NoPadding;
                                break;
                        }
                    }
                }
                inputstring = module.parse(inputstring);
                if(algo.toLowerCase() == "aes") {
                    var message = CryptoJS.AES.decrypt(inputstring, generatedkey, {
                        mode: mode,
                        padding: padding
                    });
                    $KU.logExecutingFinished('kony.crypto.decrypt VIA decryting using AES algorithm');
                    return message.toString(CryptoJS.enc.Utf8)
                } else if(algo.toLowerCase() == "tripledes") {
                    var message = CryptoJS.TripleDES.decrypt(inputstring, generatedkey, {
                        mode: mode,
                        padding: padding
                    });
                    $KU.logExecutingFinished('kony.crypto.decrypt VIA decryting using TripleDES algorithm');
                    return message.toString(CryptoJS.enc.Utf8)
                } else {
                    $KU.logErrorMessage('unsupported algorithm');
                    return {
                        errcode: 101,
                        errmessage: "unsupported algorithm"
                    }
                }
            } catch(ex) {
                $KU.logErrorMessage('unknown  error' + ex);
                return {
                    errcode: 102,
                    errmessage: "unknown  error"
                }
            }
        },

        retrievepublickey: function() {
            $KU.logWarnMessage('retrievepublickey is not supported in SPA');
            return;
        },

        newkey: function(passphrase, optionalBits, algoObject) {
            $KU.logExecuting('kony.crypto.newKey');
            try {
                if(passphrase != "passphrase") {
                    $KU.logErrorMessage('invalid input parameters');
                    return {
                        errcode: 100,
                        errmessage: "invalid input parameters"
                    };
                } else if(!algoObject.subalgo) {
                    $KU.logErrorMessage('subalgo parameter is missing');
                    return {
                        errcode: 105,
                        errmessage: "subalgo parameter is missing"
                    };
                }
                $KU.logExecutingWithParams('kony.crypto.newKey', passphrase, optionalBits, algoObject);
                if(algoObject.subalgo.toLowerCase() == "aes" || algoObject.subalgo.toLowerCase() == "tripledes") {
                    $KU.logExecutingFinished('kony.crypto.newKey');
                    return algoObject.passphrasetext[IndexJL];
                } else {
                    $KU.logErrorMessage('unsupported algorithm');
                    return {
                        errcode: 101,
                        errmessage: "unsupported algorithm"
                    };
                }
            } catch(ex) {
                $KU.logErrorMessage('unknown error' + ex);
                return {
                    errcode: 102,
                    errmessage: "unknown error"
                };
            }
        },

        savekey: function(name, key, metainfo) {
            $KU.logExecuting('kony.crypto.saveKey');
            if(name == undefined || key == undefined) {
                $KU.logErrorMessage('Invalid input parameters');
                return {
                    "errcode": 100,
                    "errmsg": "Invalid input parameters"
                };
            }
            $KU.logExecutingWithParams('kony.crypto.saveKey', name, key, metainfo);
            try {
                if(localStorage) {
                    try {
                        localStorage.setItem(name, JSON.stringify(key));
                        $KU.logExecutingFinished('kony.crypto.saveKey');
                        return name;
                    } catch(e) {
                        if(e.name == "QUOTA_EXCEEDED_ERR") {
                            var errcode = 0,
                                errmsg = "";
                            if(localStorage.length === 0) {
                                $KU.logErrorMessage('Private Browsing is switched ON');
                                errcode = 102;
                                errmsg = "Private Browsing is switched ON";
                            } else {
                                $KU.logErrorMessage('unable to save the key with the specified name');
                                errcode = 101;
                                errmsg = "unable to save the key with the specified name";
                            }
                            
                            return {
                                "errcode": errcode,
                                "errmsg": errmsg
                            };
                        }
                    }
                } else {
                    $KU.logErrorMessage('unknown error, storage not supported');
                    return {
                        "errcode": 102,
                        "errmsg": "unknown error, storage not supported"
                    };
                }
            } catch(err) {
                $KU.logErrorMessage('unknown error ' + err);
            }
        },

        readkey: function(uniqid) {
            $KU.logExecuting('kony.crypto.readKey');
            if(uniqid == undefined) {
                $KU.logErrorMessage('Invalid input parameters');
                return {
                    "errcode": 100,
                    "errmsg": "Invalid input parameters"
                };
            }
            $KU.logExecutingWithParams('kony.crypto.readKey', uniqid);
            try {
                if(localStorage) {
                    var dataobj = JSON.parse(localStorage.getItem(uniqid) || "null");
                    if(dataobj == null) {
                        $KU.logErrorMessage('unable to find the key with the specified unique ID');
                        return {
                            "errcode": 101,
                            "errmsg": "unable to find the key with the specified unique ID"
                        };
                    } else
                        $KU.logExecutingFinished('kony.crypto.readKey');
                        return dataobj;
                } else {
                    kony.print("crypto readkey failed");
                    $KU.logErrorMessage('unknown error, storage not supported');
                    return {
                        "errcode": 102,
                        "errmsg": "unknown error, storage not supported"
                    };
                }

            } catch(err) {
                $KU.logErrorMessage('unknown error ' + err);
            }
        },

        deletekey: function(uniqid) {
            $KU.logExecuting('kony.crypto.deleteKey');
            $KU.logExecutingWithParams('kony.crypto.deleteKey', uniqid);
            try {
                if(localStorage)
                    localStorage.removeItem(uniqid);
                else
                    kony.print("crypto delete failed");
                $KU.logExecutingFinished('kony.crypto.deleteKey');
            } catch(err) {
                $KU.logErrorMessage('unknown error' + err);
            }
        },

        createHMacHash: function() {
            kony.web.logger("warn", "The createHMacHash API is not supported.");
        },

        createPBKDF2Key: function() {
            kony.web.logger("warn", "The createPBKDF2Key API is not supported.");
        },

        getRandomNumber: function(min, max) {
            return _generateRandomNumber(min, max);
        },

        generateRandomString: function() {
            return _generateRandomString();
        },

        createHashToUpperCase: function(algo, toHash) {
            return _createHashToUpperCase(algo, toHash);
        }
    };

    return module;
}());