$KI.ds = (function() {
    var module = null;

    var _clear = function() {
        localStorage.clear(); 
        localStorage.setItem(kony.globals.appid, JSON.stringify($KU.createBlankLocalStorage()));
    };

    var _getItem = function(key) {
        var store = $KU.getLocalStorage(),
            data = store.data,
            i = 0,
            item = null,
            len = data.length;

        for(i = 0; i < len; i++) {
            if(data[i].key === key) {
                item = data[i].value;
                break;
            }
        }

        return item;
    };

    var _getKeyAt = function(index) {
        var store = $KU.getLocalStorage(),
            data = store.data[index];
        return(data) ? data.key : null;
    };

    var _getLength = function() {
        var store = $KU.getLocalStorage();
        return store.data.length;
    };

    var _getValueAt = function(index) {
        var store = $KU.getLocalStorage(),
            data = store.data[index];
        return(data) ? data.value : null;
    };

    var _removeItem = function(key) {
        var store = $KU.getLocalStorage(),
            data = store.data,
            i = 0,
            index = -1,
            len = data.length;

        for(i = 0; i < len; i++) {
            if(data[i].key === key) {
                index = i;
                break;
            }
        }
        
        if(index >= 0) {
            store.data.splice(index, 1);
            localStorage.setItem(kony.globals.appid, JSON.stringify(store));
        }
    };

    var _setItem = function(key, value) {
        var store = $KU.getLocalStorage(),
            data = store.data,
            i = 0,
            index = -1,
            len = data.length;

        for(i = 0; i < len; i++) {
            if(data[i].key === key) {
                index = i;
                break;
            }
        }

        if(index === -1) { 
            store.data.push({
                key: key,
                value: value
            });
        } else { 
            store.data[index].value = value;
        }

        localStorage.setItem(kony.globals.appid, JSON.stringify(store));
    };

    try {
        if(typeof(localStorage) === "object") {
            module = {
                save: function(tbl, dbname, metainfo) {
                    $KU.logExecuting('kony.ds.save');
                    if(localStorage) {
                        try {
                            $KU.logExecutingWithParams('kony.ds.save', tbl, dbname, metainfo);
                            _setItem(dbname, tbl);
                        } catch(e) {
                            if(e.name == "QUOTA_EXCEEDED_ERR") {
                                var errcode = 0,
                                    errmsg = "";

                                if(localStorage.length === 0) {
                                    $KU.logErrorMessage('Private Browsing is switched ON');
                                    errcode = 707;
                                    errmsg = "Private Browsing is switched ON";
                                } else {
                                    $KU.logErrorMessage('Data storage limit has exceeded');
                                    errcode = 708;
                                    errmsg = "Data storage limit has exceeded";
                                }
                                return {
                                    "errcode": errcode,
                                    "errmsg": errmsg
                                };
                            }
                        }
                    } else {
                        $KU.logWarnMessage('localstorage is not supported');
                        kony.print("localStorage not supported");
                    }
                    $KU.logExecutingFinished('kony.ds.save');
                },

                read: function(dbname) {
                    $KU.logExecuting('kony.ds.read');
                    $KU.logExecutingWithParams('kony.ds.read', dbname);
                    if(localStorage) {
                        $KU.logExecutingFinished('kony.ds.read');
                        return _getItem(dbname);
                    } else {
                        $KU.logWarnMessage('localStorage readitem failed');
                        kony.print("localStorage readitem failed");
                        return null;
                    }
                },

                Delete: function(dbname) {
                    if(localStorage) {
                        _removeItem(dbname);
                        return true;
                    } else {
                        kony.print("localStorage delete failed");
                        return false;
                    }
                }
            };

            $KI.localstorage = {
                key: function(index) {
                    $KU.logExecuting('kony.store.key');
                    $KU.logExecutingWithParams('kony.store.key', index);
                    $KU.logExecutingFinished('kony.store.key');
                    return _getKeyAt(index);
                },

                getitem: function(keyname) {
                    $KU.logExecuting('kony.store.getItem');
                    $KU.logExecutingWithParams('kony.store.getItem', keyname);
                    $KU.logExecutingFinished('kony.store.getItem');
                    return _getItem(keyname);
                },

                setitem: function(keyname, value) {
                    $KU.logExecuting('kony.store.setitem');
                    $KU.logExecutingWithParams('kony.store.setitem', keyname, value);
                    try {
                        _setItem(keyname, value);
                    } catch(e) {
                        if(e.name == "QUOTA_EXCEEDED_ERR") {
                            if(localStorage.length === 0) {
                                kony.web.logger("warn", "Private Browsing is switched ON");
                            } else {
                                kony.web.logger("warn", "Data storage limit has exceeded");
                            }
                        }
                    }
                    $KU.logExecutingFinished('kony.store.setitem');
                },

                removeitem: function(keyname) {
                    $KU.logExecuting('kony.store.removeitem');
                    $KU.logExecutingWithParams('kony.store.removeitem', keyname);
                    $KU.logExecutingFinished('kony.store.removeitem');
                    _removeItem(keyname);
                },

                clear: function() {
                    _clear();
                },

                length: function() {
                    $KU.logExecuting('kony.store.length');
                    $KU.logExecutingWithParams('kony.store.length');
                    $KU.logExecutingFinished('kony.store.length');
                    return _getLength();
                }
            };
        } else {
            kony.print("localStorage not supported");
        }
    } catch(e) {
        module = {
            save: function() {},
            read: function(dbname) {},
            Delete: function(dbname) {}
        };
    }


    return module;
}());
