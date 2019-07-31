kony.nosql = (function() {
    var module = {}, _validTypes = [], _validOrders = [], _validOperators = [];

    var _deleteAllByIndex =  function(objectStore, index, keyRangeValue) {
        return new Promise(function(resolve, reject) {
            var cursor, i, recordToDelete = [], recordCount = 0, record, successCallback;

            successCallback = function(event) {
                recordCount++;
                if(recordCount === recordToDelete.length) {
                    resolve();
                }
            };

            cursor = index.openCursor(keyRangeValue);
            cursor.onsuccess = function(event) {
                var cursor = event.target.result, request;
                if(cursor) {
                    if(kony.appinit.isSafari) {
                        record = cursor.primaryKey;
                        recordToDelete.push(record);
                    } else {
                        request = cursor.delete();
                        request.onsuccess = function(event) {
                            
                        };
                        request.onerror = function(event) {
                            reject(event);
                        };
                    }
                    cursor.continue();
                } else {
                    if(recordToDelete.length == 0) { 
                        resolve();
                    } else {
                        for(i = 0; i< recordToDelete.length; i++) {
                            request = objectStore.delete(recordToDelete[i]);
                            request.onsuccess = successCallback.bind(this, recordCount, recordToDelete);
                            request.onerror = function(event) {
                                reject(event);
                            };
                        }
                    }
                }
            };
            cursor.onerror = function(event) {
                reject(event);
            };
        });
    };

    var _evaluate = function(record, rule) {
        var result = false, col = record[rule.column], val = rule.value;

        switch(rule.operator) {
            case module.ENDS_WITH:
                result = (col.indexOf(val) === (col.length - val.length)) ? true : false;
                break;
            case module.EQ:
                result = (col === val);
                break;
            case module.GT:
                result = (col > val);
                break;
            case module.GTE:
                result = (col >= val);
                break;
            case module.CONTAINS:
                result = (col.indexOf(val) >= 0) ? true : false;
                break;
            case module.LT:
                result = (col < val);
                break;
            case module.LTE:
                result = (col <= val);
                break;
            case module.NEQ:
                result = (col !== val);
                break;
            case module.NOT_CONTAINS:
                result = (col.indexOf(val) >= 0) ? false : true;
                break;
            case module.NOT_ENDS_WITH:
                result = (col.indexOf(val) === (col.length - val.length)) ? false : true;
                break;
            case module.NOT_STARTS_WITH:
                result = (col.indexOf(val) === 0) ? false : true;
                break;
            case module.STARTS_WITH:
                result = (col.indexOf(val) === 0) ? true : false;
                break;
            default:
                break;
        }

        return result;
    };

    var _expression = function(record, condition) {
        var str = '', c = 0, clen = condition.length;

        for(c=0; c<clen; c++) {
            if(condition[c] instanceof Array) {
                str += _expression(record, condition[c]);
            } else if(typeof condition[c] === 'string') {
                str += (' ' + condition[c] + ' ');
            } else if(typeof condition[c] === 'object' && condition[c]) {
                str += _evaluate(record, condition[c]);
            }
        }

        return ('(' + str + ')');
    }; 

    var _filterRecords = function(records, condition) {
        return records.filter(function(record){
            return _isConditionMatched(record, condition);
        });
    };
    
    var _getAll =  function(objectStore) {
        var records = [];
        return new Promise(function(resolve, reject) {
            var cursor = objectStore.openCursor();
            cursor.onsuccess = function(event) {
                var cursor = event.target.result, record;
                if(cursor) {
                    record = cursor.value;
                    records.push(record);
                    cursor.continue();
                } else {
                    resolve(records);
                }
            };
            cursor.onerror = function(event) {
                reject(event);
            };
        });
    };

    var _getAllByIndex =  function(index, keyRangeValue) {
        var records = [];
        return new Promise(function(resolve, reject) {
            var cursor = index.openCursor(keyRangeValue);
            cursor.onsuccess = function(event) {
                var cursor = event.target.result, record;
                if(cursor) {
                    record = cursor.value;
                    records.push(record);
                    cursor.continue();
                } else {
                    resolve(records);
                }
            };
            cursor.onerror = function(event) {
                reject(event);
            };
        });
    };

    var _getDataBaseName = function(dbName) {
        return kony.globals.appid + '_' + dbName;
    };

    var _getKeyRangeValue = function(data) {
        var keyRangeValue;
        switch(data.operator) {
            case module.EQ:
                keyRangeValue = IDBKeyRange.only(data.value);
            break;
            case module.GT:
                keyRangeValue = IDBKeyRange.lowerBound(data.value, true);
            break;
            case module.GTE:
                keyRangeValue = IDBKeyRange.lowerBound(data.value);
            break;
            case module.LT:
                keyRangeValue = IDBKeyRange.upperBound(data.value, true);
            break;
            case module.LTE:
                keyRangeValue = IDBKeyRange.upperBound(data.value);
            break;
            
        }
        return keyRangeValue;
    };

    var _getObjectValues= function(obj) {
        var values = [], key;

        for(key in obj) {
            if(obj.hasOwnProperty(key)) {
                values.push(obj[key]);
            }
        }
        return values;
    };

    var _isConditionOptimizable = function(conditionInstance, objectStore) {
        var canOperatorFitInKeyRange, column,isColumnIndexed, operator, isValueBoolean;

        if(!(conditionInstance instanceof kony.nosql.Condition)
        || conditionInstance.data.length !== 1) {
            return false;
        }

        column = conditionInstance.data[0].column;
        operator = conditionInstance.data[0].operator;
        isColumnIndexed = objectStore.indexNames.contains(column);
        canOperatorFitInKeyRange = (operator !== module.NEQ);
        isValueBoolean = (typeof conditionInstance.data[0].value === "boolean")

        return isColumnIndexed && canOperatorFitInKeyRange && !isValueBoolean;
    };

    var _isConditionMatched = function(record, condition) {
        return eval(_expression(record, condition));
    };

    var _notSupported = function() {
        kony.web.logger('error', 'Your browser doesn\'t support a stable version of IndexedDB.');
    };

    var _replaceRecordValues = function(record, valueObject, includeKeys) {
        var key;

        for(key in valueObject) {
            if(includeKeys instanceof Array) {
                if(includeKeys.indexOf(key) != -1) {
                    record[key] = valueObject[key];
                }
            } else {
                record[key] = valueObject[key];
            }
        }

        return record;
    };

    var _updateAllByIndex =  function(objectStore, index, keyRangeValue, updateObject) {
        return new Promise(function(resolve, reject) {
            var cursor, i, recordCount = 0, request, recordsToAdd = [], successCallback;

            successCallback = function(event) {
                recordCount++;
                if(recordCount === recordsToAdd.length) {
                    resolve();
                }
            };

            cursor = index.openCursor(keyRangeValue);
            cursor.onsuccess = function(event) {
                var cursor = event.target.result, record, request;
                if(cursor) {
                    record = cursor.value;
                    record = _replaceRecordValues(record, updateObject);
                    if(kony.appinit.isSafari) {
                        recordsToAdd.push(record);
                    } else {
                        request = cursor.update(record);
                        request.onsuccess = function(event) {
                            
                        };
                        request.onerror = function(event) {
                            reject();
                        };
                    }
                    cursor.continue();
                } else {
                    if(recordsToAdd.length == 0) {
                        resolve();
                    } else {
                        for(i = 0; i < recordsToAdd.length; i++) {
                            request = objectStore.put(recordsToAdd[i]);
                            request.onsuccess = successCallback.bind(this, recordCount, recordsToAdd);
                            request.onerror = function(event) {
                                reject(event);
                            };
                        }
                    }
                }
            };
            cursor.onerror = function(event) {
                reject(event);
            };
        });
    };


    var Condition = function(ruleOrCondition) {
        var data = [];

        if(this instanceof Condition) {
            Object.defineProperty(this, 'data', {
                configurable: true,
                enumerable: false,
                get: function() {
                    return (this.passReference) ? data : data.slice(0);
                }
            });
            Object.defineProperty(this, 'data', {
                configurable: false,
                enumerable: false,
                set: function(value) {}
            });

            if(ruleOrCondition instanceof Rule) {
                data.push({
                    "column":   ruleOrCondition.column,
                    "operator": ruleOrCondition.operator,
                    "value":    ruleOrCondition.value
                });
            } else if(ruleOrCondition instanceof Condition) {
                data.push(ruleOrCondition.data);
            } else {
                
            }
        } else {
            
        }
    };

    Object.defineProperty(Condition.prototype, 'addCondition', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function(type, condition) {
            if(_validTypes.indexOf(type) >= 0 && condition instanceof Condition) {
                this.passReference = true;
                this.data.push(type);
                this.data.push(condition.data);
                delete this.passReference;
            } else {
                
            }

            return this;
        }
    });

    Object.defineProperty(Condition.prototype, 'addRule', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function(type, rule) {
            if(_validTypes.indexOf(type) >= 0 && rule instanceof Rule) {
                this.passReference = true;
                this.data.push(type);
                this.data.push({
                    "column":   rule.column,
                    "operator": rule.operator,
                    "value":    rule.value
                });
                delete this.passReference;
            } else {
                
            }

            return this;
        }
    });

    
    Object.defineProperty(Condition.prototype, 'toString', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function() {
            var text = '';

            var stringifyCondition = function(condition) {
                var str = '', c = 0, clen = condition.length;

                for(c=0; c<clen; c++) {
                    if(condition[c] instanceof Array) {
                        str += stringifyCondition(condition[c]);
                    } else if(typeof condition[c] === 'string') {
                        str += (' ' + condition[c] + ' ');
                    } else if(typeof condition[c] === 'object' && condition[c]) {
                        str += stringifyRule(condition[c]);
                    }
                }

                return ('(' + str + ')');
            };

            var stringifyRule = function(rule) {
                var str = rule.column + ' ' + rule.operator + ' ';

                if(typeof rule.value === 'string') {
                    
                    str += ('"' + rule.value + '"');
                } else {
                    str += rule.value;
                }

                return str;
            };

            return stringifyCondition(this.data);
        }
    });

    var DataBase = function(db, dbType) {
        Object.defineProperty(this, 'db', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: db
        });
        Object.defineProperty(this, 'dbType', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: dbType
        });
    };

    var Transaction = function(tx) {
        Object.defineProperty(this, 'tx', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: tx
        });
    };

    var Result = function(data) {
        var index = -1, length = -1;

        data = (data instanceof Array) ? data : [];

        Object.defineProperty(this, 'data', {
            configurable: true,
            enumerable: false,
            get: function() {
                return (this.passReference) ? data : data.slice(0);
            }
        });
        Object.defineProperty(this, 'data', {
            configurable: false,
            enumerable: false,
            set: function(value) {}
        });


        Object.defineProperty(this, 'length', {
            configurable: true,
            enumerable: false,
            get: function() {
                if(length === -1) {
                    length = data.length;
                }

                return length;
            }
        });
        Object.defineProperty(this, 'length', {
            configurable: false,
            enumerable: false,
            set: function(value) {}
        });


        Object.defineProperty(this, 'next', {
            configurable: true,
            enumerable: false,
            get: function() {
                ++index;
                return (index >= 0 && index < data.length) ? true : false;
            }
        });
        Object.defineProperty(this, 'next', {
            configurable: false,
            enumerable: false,
            set: function(value) {}
        });


        Object.defineProperty(this, 'record', {
            configurable: true,
            enumerable: false,
            get: function() {
                return (index >= 0 && index < data.length) ? data[index] : null;
            }
        });
        Object.defineProperty(this, 'record', {
            configurable: false,
            enumerable: false,
            set: function(value) {}
        });
    };

    Object.defineProperty(Result.prototype, 'groupBy', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function(columnNames, index) {
            var data = null;

            this.passReference = true;
            data = this.data;
            delete this.passReference;
            var result  = {};

            function __prepareMap() {
                var row, name, i, j;
                for(i = 0; i < data.length; i++) {
                    row = data[i];
                    name = "";
                    for(j = 0; j < columnNames.length; j++) {
                        name += row[columnNames[j]];
                        if(j < columnNames.length -1) {
                            name += "&_"
                        }
                    }

                    if(name in result) {
                        result[name].push(row);
                    } else {
                        result[name] = [row];
                    }
                }
                
            }

            function __prepareResults() {
                var resultSet = [], i, key, finalResult = [];
                for(key in result) {
                    resultSet.push(result[key]);
                }

                if(typeof index === 'number') {
                    for(i = 0; i < resultSet.length; i++) {
                        if(index >= 0) {
                            finalResult.push(resultSet[i][index]);
                        } else {
                            key = resultSet[i].length + index
                            finalResult.push(resultSet[i][key]);
                        }
                    }
                    return finalResult
                } else {
                    return resultSet;
                }
            }

            if(columnNames instanceof Array) {
                try {
                    __prepareMap();
                    return __prepareResults();
                }
                catch (e) {
                    throw e;
                }
            }
        }
    });

    Object.defineProperty(Result.prototype, 'limit', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function(startIndex, recordCount) {
            var data = null, copy = null, c = 0, clen = 0;

            if(typeof startIndex === 'number'
            && typeof recordCount === 'number'
            && startIndex >= 0 && recordCount >= 0) {
                this.passReference = true;
                data = this.data;
                delete this.passReference;

                copy = data.splice(0);
                clen = copy.length;

                for(c=startIndex; c<=recordCount; c++) {
                    if(c < clen) {
                        data.push(copy[c]);
                    } else {
                        break;
                    }
                }
            } else {
                
            }

            return this;
        }
    });

    Object.defineProperty(Result.prototype, 'sort', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function(columnName, order) {
            var data = null;

            this.passReference = true;
            data = this.data;
            delete this.passReference;

            if(typeof columnName === 'function') {
                data.sort(columnName);
            } else if(typeof columnName === 'string'
            && _validOrders.indexOf(order) >= 0) {
                data.sort(function(a, b) {
                    a = a[columnName];
                    b = b[columnName];

                    if(order === kony.nosql.ASCENDING) {
                        return (a > b) ? 1 : (a < b) ? -1 : 0;
                    } else {
                        return (a > b) ? -1 : (a < b) ? 1 : 0;
                    }
                });
            } else if(columnName instanceof Array
            && _validOrders.indexOf(order) >= 0) {
                var i, sortedData = [];

                function __localsort(data, name, order) {
                    data.sort(function(a, b) {
                        a = a[name];
                        b = b[name];
                        if(order === kony.nosql.ASCENDING) {
                            return (a > b) ? 1 : (a < b) ? -1 : 0;
                        } else {
                            return (a > b) ? -1 : (a < b) ? 1 : 0;
                        }
                    });
                }

                function __groupByName(data, name) {
                    var i, result = [], temp = [], value;
                    temp.push(data[0]);
                    value = data[0][name];
                    for(i = 1; i < data.length; i++) {
                        if(data[i][name] == value) {
                            temp.push(data[i]);
                        } else {
                            if(temp.length == 1) {
                                result.push(temp[0]);
                            } else {
                                result.push(temp);
                            }
                            temp = [];
                            value = data[i][name];
                            temp.push(data[i]);
                        }
                    }
                    result.push(temp);
                    return result;
                }

                function __createFlatArray(result) {
                    var i, len, temp = [];
                    for( i = 0; i < result.length; i++) {
                        if(result[i] instanceof Array) {
                            for(len = 0; len < result[i].length; len++) {
                                temp.push(result[i][len]);
                            }
                        } else {
                            temp.push(result[i]);
                        }
                    }
                    return temp;
                }

                function __orderBY(data, index, order) {
                    var i, result = [], result1 = [];
                    if(index >= columnName.length) {
                        return data;
                    }

                    __localsort(data, columnName[index], order);
                    result = __groupByName(data, columnName[index]);
                    for(i = 0; i < result.length; i++) {
                       if(result[i] instanceof Array) {
                            result1 = __orderBY(result[i], index+1, order);
                            result[i] = result1;
                        }
                    }
                    result =  __createFlatArray(result);
                    return result;
                }

                sortedData = this.data;
                sortedData = __orderBY(sortedData, 0, order);
                data.splice(0, data.length);
                for(i =0; i < sortedData.length; i++) {
                    data.push(sortedData[i]);
                }

            } else {
                
            }

            return this;
        }
    });

    

    var Rule = function(column, operator, value) {
        if(this instanceof Rule) {
            if(arguments.length === 3
            && typeof column === 'string' && column
            && _validOperators.indexOf(operator) >= 0) {
                Object.defineProperty(this, 'column', {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                        return column;
                    }
                });
                Object.defineProperty(this, 'column', {
                    configurable: false,
                    enumerable: true,
                    set: function(val) {
                        column = val;
                    }
                });


                Object.defineProperty(this, 'operator', {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                        return operator;
                    }
                });
                Object.defineProperty(this, 'operator', {
                    configurable: false,
                    enumerable: true,
                    set: function(val) {
                        operator = val;
                    }
                });


                Object.defineProperty(this, 'value', {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                        return value;
                    }
                });
                Object.defineProperty(this, 'value', {
                    configurable: false,
                    enumerable: true,
                    set: function(val) {
                        value = val;
                    }
                });
            } else {
                
            }
        } else {
            
        }
    };

    var iDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    var indexedDB = {

        openDB : function (databaseName, version, upgradeCallback) {
            $KU.logExecuting('kony.nosql.openDatabase');
            $KU.logExecutingWithParams('kony.nosql.openDatabase', databaseName, version, upgradeCallback);
            return new Promise(function(resolve, reject) {
                var request, kdb;

                if(version) {
                    request = iDB.open(_getDataBaseName(databaseName), version);
                } else {
                    request = iDB.open(_getDataBaseName(databaseName));
                }
                request.onerror = function(event) {
                    reject(event.target.error);
                };
                request.onsuccess = function(event) {
                    var db = request.result;

                    kdb = kdb || new DataBase(db, 'indexedDB');
                    $KU.logExecutingFinished('kony.nosql.openDatabase');
                    resolve(kdb);
                };
                request.onupgradeneeded = function(event) {
                    var db = event.target.result;

                    kdb = new DataBase(db, 'indexedDB');
                    upgradeCallback && upgradeCallback(kdb);
                };
            });
        },

        createTable: function (kdb, tableName, config) {
            $KU.logExecuting('kony.nosql.createTable');
            $KU.logExecutingWithParams('kony.nosql.createTable', kdb, tableName, config);
            var i = 0, indexes = config.indexes || {}, db = kdb.db,
                primaryKey = config.primaryKey, index,
                autoIncrement = $KU.isArray(primaryKey) ? false : config.autoIncrement,
                objectStore = db.createObjectStore(tableName, {keyPath: primaryKey, autoIncrement: autoIncrement});

            for(index in indexes){
                objectStore.createIndex(index, index, indexes[index]);
            }
            $KU.logExecutingFinished('kony.nosql.createTable');
        },

        openTransaction: function (kdb, tableNames, accessType, callback) {
            $KU.logExecuting('kony.nosql.openTransaction');
            $KU.logExecutingWithParams('kony.nosql.openTransaction', kdb, tableNames, accessType, callback);
            return new Promise(function(resolve, reject) {
                var db = kdb.db, tx = db.transaction(tableNames, accessType),
                    ktx = new Transaction(tx);

                callback(ktx);
                tx.oncomplete = function(e){
                    $KU.logExecutingFinished('kony.nosql.openTransaction');
                    resolve(ktx);
                }
                tx.onerror = function(e) {
                    $KU.logErrorMessage('unknown error' + e);
                    reject(e.target.error);
                }
                tx.onabort = function(e) {
                    $KU.logErrorMessage('unknown error' + e);
                    reject(e.target.error);
                }
            });
        },

        addRecords: function (ktx, tableName, data) {
            $KU.logExecuting('kony.nosql.addRecords');
            $KU.logExecutingWithParams('kony.nosql.addRecords', ktx, tableName, data);
            return new Promise(function(resolve, reject) {
                var i = 0, storeReq = null, tx = ktx.tx,
                    store = tx.objectStore(tableName),
                    onerrorcb = function(event) {
                        $KU.logErrorMessage('unknown error' + event.target.error);
                        reject(event.target.error);
                    },
                    addNext = function() {
                        if(i < data.length) {
                            storeReq = store.add(data[i]);
                            storeReq.onsuccess = addNext;
                            storeReq.onerror = onerrorcb;
                            ++i;
                        } else {
                            $KU.logExecutingFinished('kony.nosql.addRecords');
                            resolve();
                        }
                    };

                addNext();
            });
        },

        fetchRecords: function(transactionObject, tableName, conditionInstance) {
            $KU.logExecuting('kony.nosql.fetchRecords');
            $KU.logExecutingWithParams('kony.nosql.fetchRecords', transactionObject, tableName, conditionInstance);
            return new Promise(function(resolve, reject) {
                var resultSet = null, objectStore, transaction, data, keyRangeValue, index;
                var successCallback = function(records) {
                    if(conditionInstance instanceof kony.nosql.Condition) {
                        records = _filterRecords(records, conditionInstance.data);
                    }
                    resultSet = new Result(records);
                    $KU.logExecutingFinished('kony.nosql.fetchRecords');
                    resolve(resultSet);
                };
                var errorCallback = function(event) {
                    kony.web.logger('error', 'unknown error' + event.target.error);
                    reject(event.target.error);
                };

                if(!transactionObject instanceof Transaction) {
                    $KU.logErrorMessage('Pass  proper transaction object');
                    reject({"errorMsg": "Pass  proper transaction object"});
                }

                transaction = transactionObject.tx;
                objectStore = transaction.objectStore(tableName);
                if(_isConditionOptimizable(conditionInstance, objectStore)) {
                    data = conditionInstance.data[0];
                    keyRangeValue = _getKeyRangeValue(data);
                    index = objectStore.index(data.column);
                    if(keyRangeValue) {
                        _getAllByIndex(index, keyRangeValue).then(function(records) {
                            resultSet = new Result(records);
                            resolve(resultSet);
                        }).catch(function(event) {
                            reject(event.target.error);
                        });
                    }

                } else {
                    if(objectStore.getAll) {
                        objectStore = objectStore.getAll();
                    } else {
                        _getAll(objectStore).then(function(records) {
                            successCallback(records);
                        }).catch(function(errorObj) {
                            errorCallback(errorObj);
                        });
                    }
                    objectStore.onsuccess = function(event){
                        successCallback(event.target.result);
                    };
                    objectStore.onerror = errorCallback;
                }
            });
        },

        updateRecords: function(transactionObject, tableName, updateObject, conditionInstance) {
            $KU.logExecuting('kony.nosql.updateRecords');
            $KU.logExecutingWithParams('kony.nosql.updateRecords', transactionObject, tableName, updateObject, conditionInstance);
            return new Promise(function(resolve, reject) {
                var index, objectStore, transaction, data, keyRangeValue;


                if(!transactionObject instanceof Transaction) {
                    $KU.logErrorMessage('Pass  proper transaction object');
                    reject({"errorMsg": "Pass  proper transaction object"});
                }

                transaction = transactionObject.tx;
                objectStore = transaction.objectStore(tableName);

                if(_isConditionOptimizable(conditionInstance, objectStore)) {
                    data = conditionInstance.data[0];
                    index = objectStore.index(data.column);
                    keyRangeValue = _getKeyRangeValue(data);
                    if(keyRangeValue) {
                        _updateAllByIndex(objectStore, index, keyRangeValue, updateObject).then(function() {
                            $KU.logExecutingFinished('kony.nosql.updateRecords');
                            resolve();
                        }).catch(function(event) {
                            $KU.logErrorMessage('unknown' + event.message);
                            reject({errorMsg: event.message});
                        });
                    }
                } else {
                    objectStore.openCursor().onsuccess = function(event) {
                        var cursor = event.target.result, record, request;

                        if(cursor) {
                            record = cursor.value;
                            if(!conditionInstance || _isConditionMatched(record, conditionInstance.data)) {

                                record = _replaceRecordValues(record, updateObject);
                                request = cursor.update(record);
                                request.onsuccess = function(event) {
                                    
                                };
                                request.onerror = function(event) {
                                    reject();
                                };
                            }
                            cursor.continue();
                        } else {
                            resolve();
                        }
                    };
                }
            });
        },

        deleteRecords: function(transactionObject, tableName, conditionInstance) {
            $KU.logExecuting('kony.nosql.deleteRecords');
            $KU.logExecutingWithParams('kony.nosql.deleteRecords', transactionObject, tableName, conditionInstance);
            return new Promise(function(resolve, reject) {
                var transaction, objectStore, data, keyRangeValue, index;

                if(!transactionObject instanceof Transaction) {
                    $KU.logErrorMessage('Pass  proper transaction object');
                    reject({"errorMsg": "Pass  proper transaction object"});
                }

                transaction = transactionObject.tx;
                objectStore = transaction.objectStore(tableName);

                if(_isConditionOptimizable(conditionInstance, objectStore)) {
                    data = conditionInstance.data[0];
                    keyRangeValue = _getKeyRangeValue(data);
                    index = objectStore.index(data.column);
                    if(keyRangeValue) {
                        _deleteAllByIndex(objectStore, index, keyRangeValue).then(function() {
                            $KU.logExecutingFinished('kony.nosql.deleteRecords');
                            resolve();
                        }).catch(function(event) {
                            $KU.logErrorMessage('unknown error' + event.message);
                            reject({errorMsg: event.message});
                        });
                    }
                } else {
                    objectStore.openCursor().onsuccess = function(event) {
                        var cursor = event.target.result, request;

                        if(cursor) {
                            if(!conditionInstance || _isConditionMatched(cursor.value, conditionInstance.data)) {
                                request = cursor.delete();

                                request.onsuccess = function(event) {
                                    
                                };
                                request.onerror = function(event) {
                                    reject(event.target.error);
                                };
                            }
                            cursor.continue();
                        } else {
                            resolve();
                        }
                    };
                }
            });
        },

        databaseExists: function(databaseName) {
            $KU.logExecuting('kony.nosql.databaseExists');
            $KU.logExecutingWithParams('kony.nosql.databaseExists', databaseName);
            return new Promise(function(resolve, reject) {
                var request = iDB.open(_getDataBaseName(databaseName));

                request.onupgradeneeded = function (event) {
                    event.target.transaction.abort();
                    $KU.logExecutingFinished('kony.nosql.databaseExists VIA from request.upgradeneeded ');
                    resolve(false);
                };
                request.onsuccess = function(event) {
                    var database = event.target.result;
                    $KU.logExecutingFinished('kony.nosql.databaseExists VIA from request.onsuccess');
                    resolve(true);
                    database.close();
                };
                request.onerror = function(event) {
                    $KU.logErrorMessage('unknown error' + event.target.error);
                    reject(event.target.error);
                };
            });
        },

        databaseVersion: function(databaseName) {
            return new Promise(function(resolve, reject) {
                var request = iDB.open(_getDataBaseName(databaseName));

                request.onupgradeneeded = function (event) {
                    event.target.transaction.abort();
                    resolve(0);
                };
                request.onsuccess = function(event) {
                    var database = event.target.result;
                    resolve(database.version);
                    database.close();
                };
                request.onerror = function(event) {
                    reject(event.target.error);
                };
            });
        },

        closeDatabase: function(databaseObject) {
            $KU.logExecuting('kony.nosql.closeDatabase');
            $KU.logExecutingWithParams('kony.nosql.closeDatabase', databaseObject);
            return new Promise(function(resolve, reject) {
                var db;

                if(databaseObject instanceof DataBase) {
                    db = databaseObject.db;
                    try {
                        db.close();
                        $KU.logExecutingFinished('kony.nosql.closeDatabase');
                        resolve();
                    } catch(error) {
                        $KU.logErrorMessage('unknown error' + error);
                        reject(error);
                    }
                } else {
                    $KU.logErrorMessage('Pass proper database object.');
                    reject({"errorMsg": "Pass proper database object."});
                }
            });
        },

        getTables: function(databaseObject) {
            $KU.logExecuting('kony.nosql.getTables');
            $KU.logExecutingWithParams('kony.nosql.getTables', databaseObject);
            return new Promise(function(resolve, reject) {
                var db;

                if(databaseObject instanceof DataBase) {
                    db = databaseObject.db;
                    $KU.logExecutingFinished('kony.nosql.getTables');
                    resolve(_getObjectValues(db.objectStoreNames));
                } else {
                    $KU.logErrorMessage('Pass proper database object.');
                    reject({errorMsg: 'Pass proper database object.'});
                }
            });
        },

        tableExists: function(databaseObject, tableName) {
            $KU.logExecuting('kony.nosql.tableExists');
            $KU.logExecutingWithParams('kony.nosql.tableExists', databaseObject, tableName);
            return new Promise(function(resolve, reject) {
                var tables, tableExists;

                if(databaseObject instanceof DataBase) {
                    kony.nosql.getTables(databaseObject).then(function(tables) {
                        if(tables.indexOf(tableName) != -1) {
                            tableExists = true;
                        } else {
                            tableExists = false;
                        }
                        $KU.logExecutingFinished('kony.nosql.tableExists');
                        resolve(tableExists);
                    }).catch(function(error) {
                        reject(error);
                    });
                } else {
                    $KU.logErrorMessage('Pass proper database object.');
                    reject({errorMsg: 'Pass proper database object.'});
                }
            });
        },

        getPrimaryKeys: function(databaseObject, tableName, transaction) {
            $KU.logExecuting('kony.nosql.getPrimaryKeys');
            $KU.logExecutingWithParams('kony.nosql.getPrimaryKeys', databaseObject, tableName, transaction);
            return new Promise(function(resolve, reject){
                var primaryKeys, objectStore;
                var _getPrimaryKeys = function(transactionObject) {
                    var primaryKeys = [];
                    transactionObject = transactionObject.tx;
                    objectStore = transactionObject.objectStore(tableName);
                    primaryKeys = (typeof objectStore.keyPath === 'string') ? [objectStore.keyPath] : objectStore.keyPath;
                    return primaryKeys;
                };
                kony.nosql.tableExists(databaseObject, tableName).then(function(exists) {
                    if(exists) {
                        if(!transaction) {
                            kony.nosql.openTransaction(databaseObject, [tableName], kony.nosql.READ_WRITE, function(transactionObject) {
                                primaryKeys =  _getPrimaryKeys(transactionObject);
                            }).then(function() {
                                $KU.logExecutingFinished('kony.nosql.getPrimaryKeys VIA if !transaction is true');
                                resolve(primaryKeys);
                            }).catch(function(error) {
                                reject(error);
                            });
                        } else {
                            $KU.logExecutingFinished('kony.nosql.getPrimaryKeys VIA !transaction is false');
                            resolve(_getPrimaryKeys(transaction));
                        }
                    } else {
                        $KU.logErrorMessage('Table doesn\'t exists.');
                        reject({errorMsg: 'Table doesn\'t exists.'});
                    }
                }).catch(function(error) {
                    reject(error);
                });
            });
        },

        deleteDatabase: function(databaseName) {
            $KU.logExecuting('kony.nosql.deleteDatabase');
            $KU.logExecutingWithParams('kony.nosql.deleteDatabase', databaseName);
            return new Promise(function(resolve, reject) {
                var request = iDB.deleteDatabase(_getDataBaseName(databaseName));

                request.onsuccess = function(event) {
                    $KU.logExecutingFinished('kony.nosql.deleteDatabase');
                    resolve();
                };
                request.onerror = function(event) {
                    $KU.logErrorMessage('unknown error' + event.target.error);
                    reject(event.target.error);
                };
            });
        },

        deleteTable: function(databaseObject, tableName) {
            $KU.logExecuting('kony.nosql.deleteTable');
            $KU.logExecutingWithParams('kony.nosql.deleteTable', databaseObject, tableName);
            return new Promise(function(resolve, reject) {
                var db;

                if(databaseObject instanceof DataBase) {
                    db = databaseObject.db;
                    db.deleteObjectStore(tableName);
                    $KU.logExecutingFinished('kony.nosql.deleteTable');
                    resolve();
                } else {
                    $KU.logErrorMessage('Pass proper database object.');
                    reject({errorMsg: 'Pass proper database object.'});
                }
            });
        },

        clearTable: function(transactionObject, tableName) {
            $KU.logExecuting('kony.nosql.clearTable');
            $KU.logExecutingWithParams('kony.nosql.clearTable', transactionObject, tableName);
            return new Promise(function(resolve, reject) {
                var objectStore, transaction, request;

                if(transactionObject instanceof Transaction) {
                    transaction = transactionObject.tx;
                    objectStore = transaction.objectStore(tableName);
                    request = objectStore.clear();

                    request.onsuccess = function(event) {
                        $KU.logExecutingFinished('kony.nosql.clearTable');
                        resolve();
                    };
                    request.onerror = function(event) {
                        reject(event.target.error);
                    };

                } else {
                    $KU.logErrorMessage('Pass proper transaction object.');
                    reject({errorMsg: 'Pass proper transaction object.'});
                }
            });
        },

        addOrReplaceRecords: function(transactionObject, tableName, records) {
            $KU.logExecuting('kony.nosql.addOrReplaceRecords');
            $KU.logExecutingWithParams('kony.nosql.addOrReplaceRecords', transactionObject, tableName, records);
            return new Promise(function(resolve, reject) {
                var i = 0, storeReq = null, transaction, store,
                onerrorcb = function(event) {
                    reject(event.target.error);
                },
                replaceNext = function() {
                    if(i < records.length) {
                        storeReq = store.put(records[i]);
                        storeReq.onsuccess = replaceNext;
                        storeReq.onerror = onerrorcb;
                        ++i;
                    } else {
                        $KU.logExecutingFinished('kony.nosql.addOrReplaceRecords');
                        resolve();
                    }
                };

                if(!transactionObject instanceof Transaction) {
                    $KU.logErrorMessage('Pass proper transaction object.');
                    reject({"errorMsg": "Pass proper transaction object."});
                }

                transaction = transactionObject.tx;
                store = transaction.objectStore(tableName);

                replaceNext();
            });
        },

        replaceRecords: function(transactionObject, tableName, replaceObject, conditionInstance) {
            $KU.logExecuting('kony.nosql.replaceRecords');
            $KU.logExecutingWithParams('kony.nosql.replaceRecords', transactionObject, tableName, replaceObject, conditionInstance);
            return new Promise(function(resolve, reject) {
                kony.nosql.fetchRecords(transactionObject, tableName, conditionInstance).then(function(resultSet) {
                    var i = 0, storeReq = null, transaction, store, records = resultSet.data,
                    onerrorcb = function(event) {
                        reject(event.target.error);
                    },
                    replaceNext = function() {
                        var record, primaryKeys;
                        if(i < records.length) {
                            record = records[i];
                            primaryKeys = (typeof store.keyPath === 'string') ? [store.keyPath] : store.keyPath;

                            record = _replaceRecordValues(replaceObject, record, primaryKeys);

                            storeReq = store.put(record);
                            storeReq.onsuccess = replaceNext;
                            storeReq.onerror = onerrorcb;
                            ++i;
                        } else {
                            $KU.logExecutingFinished('kony.nosql.replaceRecords');
                            resolve();
                        }
                    };

                    if(!transactionObject instanceof Transaction) {
                        $KU.logErrorMessage('Pass proper transaction object.');
                        reject({"errorMsg": "Pass proper transaction object."});
                    }

                    transaction = transactionObject.tx;
                    store = transaction.objectStore(tableName);

                    replaceNext();
                }).catch(function(error) {
                    kony.web.logger('error','unknown error' + error);
                    reject(error);
                })
            });
        }

    };
    Object.defineProperty(module, 'Condition', {configurable:false, enumerable:false, writable:false, value: Condition});
    Object.defineProperty(module, 'Rule', {configurable:false, enumerable:false, writable:false, value: Rule});

    Object.defineProperty(module, 'AND', {configurable:false, enumerable:false, writable:false, value: '&&'});
    Object.defineProperty(module, 'ASCENDING', {configurable:false, enumerable:false, writable:false, value: 'ASC'});
    Object.defineProperty(module, 'DESCENDING', {configurable:false, enumerable:false, writable:false, value: 'DESC'});
    Object.defineProperty(module, 'EQ', {configurable:false, enumerable:false, writable:false, value: '='});
    Object.defineProperty(module, 'GT', {configurable:false, enumerable:false, writable:false, value: '>'});
    Object.defineProperty(module, 'GTE', {configurable:false, enumerable:false, writable:false, value: '>='});
    Object.defineProperty(module, 'LT', {configurable:false, enumerable:false, writable:false, value: '<'});
    Object.defineProperty(module, 'LTE', {configurable:false, enumerable:false, writable:false, value: '<='});
    Object.defineProperty(module, 'NEQ', {configurable:false, enumerable:false, writable:false, value: '!='});
    Object.defineProperty(module, 'OR', {configurable:false, enumerable:false, writable:false, value: '||'});

    
    Object.defineProperty(module, 'READ', {configurable:false, enumerable:false, writable:false, value: 'read'});
    Object.defineProperty(module, 'READ_WRITE', {configurable:false, enumerable:false, writable:false, value: 'readwrite'});

    _validTypes.push(module.AND);
    _validTypes.push(module.OR);

    _validOrders.push(module.ASCENDING);
    _validOrders.push(module.DESCENDING);

    _validOperators.push(module.EQ);
    _validOperators.push(module.GT);
    _validOperators.push(module.GTE);
    _validOperators.push(module.LT);
    _validOperators.push(module.LTE);
    _validOperators.push(module.NEQ);

    module.openDatabase = (iDB) ? indexedDB.openDB : _notSupported;
    module.createTable = (iDB) ? indexedDB.createTable : _notSupported;
    module.openTransaction = (iDB) ? indexedDB.openTransaction : _notSupported;
    module.addRecords = (iDB) ? indexedDB.addRecords : _notSupported;
    module.fetchRecords = (iDB) ? indexedDB.fetchRecords : _notSupported;
    module.updateRecords = (iDB) ? indexedDB.updateRecords : _notSupported;
    module.deleteRecords = (iDB) ? indexedDB.deleteRecords : _notSupported;
    module.databaseExists = (iDB) ? indexedDB.databaseExists : _notSupported;
    module.databaseVersion = (iDB) ? indexedDB.databaseVersion : _notSupported;
    module.closeDatabase = (iDB) ? indexedDB.closeDatabase : _notSupported;
    module.getTables = (iDB) ? indexedDB.getTables : _notSupported;
    module.tableExists = (iDB) ? indexedDB.tableExists : _notSupported;
    module.getPrimaryKeys = (iDB) ? indexedDB.getPrimaryKeys : _notSupported;
    module.deleteDatabase = (iDB) ? indexedDB.deleteDatabase : _notSupported;
    module.deleteTable = (iDB) ? indexedDB.deleteTable : _notSupported;
    module.clearTable = (iDB) ? indexedDB.clearTable : _notSupported;
    module.addOrReplaceRecords = (iDB) ? indexedDB.addOrReplaceRecords : _notSupported;
    module.replaceRecords = (iDB) ? indexedDB.replaceRecords : _notSupported;


    return module;
}());
