$KI.db = {
    changeversion: function(db, oldver, newver, transcb, ecb, vcb) {
        $KU.logExecuting('kony.db.changeVersion');
        $KU.logExecutingWithParams('kony.db.changeVersion', db, oldver, newver, transcb, ecb, vcb);
        if(window.openDatabase) {
            if(db) {
                db.changeVersion(oldver, newver, transcb, ecb, vcb);
            }
        } else {
            $KU.logWarnMessage('Web Databases not supported');
            kony.print("Web Databases not supported");
        }
        $KU.logExecutingFinished('kony.db.changeVersion');
    },

    executesql: function(transid, sqlstmt, args, scb, ecb) {
        $KU.logExecuting('kony.db.executeSql');
        $KU.logExecutingWithParams('kony.db.executeSql', transid, sqlstmt, args, scb, ecb);
        if(window.openDatabase) {
            if(transid) {
                if(args && args[0] === null) {
                    args = args.slice(1);
                }
                transid.executeSql(sqlstmt, args, scb, ecb);
            }
        } else {
            $KU.logWarnMessage('Web Databases not supported');
            kony.print("Web Databases not supported");
        }
        $KU.logExecutingFinished('kony.db.executeSql');
    },

    opendatabase: function(name, version, dname, size, cb) {
        var db = this.db || null;
        cb = cb || kony_dummyForDBCallback;
        $KU.logExecuting('kony.db.openDatabase');
        $KU.logExecutingWithParams('kony.db.openDatabase', name, version, dname, size, cb);
        try {
            if(window.openDatabase) {
                if(!db) {
                    db = openDatabase(name, version, dname, size, cb);
                    this.db = db;
                }
            } else {
                $KU.logWarnMessage('Web Databases not supported');
                kony.print("Web Databases not supported");
            }
        } catch(e) {
            if(e == 2) {
                
                $KU.logErrorMessage('opendatabase:Invalid database version.');
                kony.print("opendatabase:Invalid database version.");
            } else {
                $KU.logErrorMessage('opendatabase:Unknown error ' + e + '.');
                kony.print("opendatabase:Unknown error " + e + ".");
            }
            $KU.logErrorMessage('Invalid database version or Unknown error');
            return null;
        }
        $KU.logExecutingFinished('kony.db.openDatabase');
        return db;
    },

    readtransaction: function(db, transcb, ecb, vcb) {
        $KU.logExecuting('kony.db.readTransaction');
        $KU.logExecutingWithParams('kony.db.readTransaction', db, transcb, ecb, vcb);
        if(window.openDatabase) {
            if(db) {
                db.readTransaction(transcb, ecb, vcb);
            }
        } else {
            $KU.logWarnMessage('Web Databases not supported');
            kony.print("Web Databases not supported");
        }
        $KU.logExecutingFinished('kony.db.readTransaction');
    },

    sqlresultsetrowitem: function(transid, sqlresultset, index) {
        $KU.logExecuting('kony.db.sqlResultsetRowItem');
        $KU.logExecutingWithParams('kony.db.sqlResultsetRowItem', transid, sqlresultset, index);
        if(window.openDatabase) {
            
            if(index < sqlresultset.rows.length) {
                $KU.logExecutingFinished('kony.db.sqlResultsetRowItem VIA if index < sqlresultset.rows.length');
                return sqlresultset.rows.item(index);
            } else {
                $KU.logErrorMessage('Index position exceeds row length');
                return null;
            }
        } else {
            $KU.logWarnMessage('Web Databases not supported');
            kony.print("Web Databases not supported");
        }
        $KU.logExecutingFinished('kony.db.sqlResultsetRowItem VIA end of the function');
    },

    transaction: function(db, transcb, ecb, vcb) {
        $KU.logExecuting('kony.db.transaction');

        if(window.openDatabase) {
            if(db) {
                $KU.logExecutingWithParams('kony.db.transaction', db, transcb, ecb, vcb);
                db.transaction(transcb, ecb, vcb);
            }
        } else {
            $KU.logWarnMessage('Web Databases not supported');
            kony.print("Web Databases not supported");
        }
        $KU.logExecutingFinished('kony.db.transaction');
    }
};

function kony_dummyForDBCallback() {}
