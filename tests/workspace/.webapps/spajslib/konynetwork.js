$KI.net = {

	integrityCheckRequired: false,
    integrityProperties: [],

    postdataparams: function(postobj) {
        var postdata = "",
            value;

        for(var i in postobj) {

            if(postobj.hasOwnProperty(i) && i != "httpheaders") {
                value = postobj[i];
                kony.print("postdataparams:key  = " + i + "  value  =  " + value);
                postdata += i + '=' + encodeURIComponent(value);
                postdata += "&";
            }
        }
        return postdata;
    },
    
    FormData: function(formdataparam) {

        function makeIterator(_formdata, arg) {
            var arrKey = Object.keys(_formdata);
            var index =0;
            var index1=0;
            if(arg == "entries") {
                return {
                    next: function() {
                        if(index < arrKey.length && index1 >= _formdata[arrKey[index]].length) {
                            index1 = 0;
                            index++;
                        }
                        return (index < arrKey.length)? {done: false, value: [arrKey[index],_formdata[arrKey[index]][index1++]]} : {done: true, value: undefined};
                    }
                };
            } else if (arg == "keys") {
                return {
                    next: function() {
                        return (index < arrKey.length)? {done: false, value: arrKey[index++]} : {done: true, value: undefined};
                    }
                };
            } else if(arg == "values") {
                return {
                    next: function() {
                        if(index < arrKey.length && index1 >= _formdata[arrKey[index]].length) {
                            index1 = 0;
                            index++;
                        }
                        return (index < arrKey.length)? {done: false, value: _formdata[arrKey[index]][index1++]} : {done: true, value: undefined};
                    }
                };
            }
        }
        $KU.logExecuting('kony.net.FormData');
        if(formdataparam && formdataparam.isMultiPart && (window.FormData != undefined)) {
            $KU.logExecutingWithParams('kony.net.FormData', formdataparam);
            $KU.logExecutingFinished('kony.net.FormData VIA if (formdataparam && formdataparam.isMultiPart && (window.FormData != undefined)) is true');
            return new FormData();
        } else {
            $KU.logExecutingWithParams('kony.net.FormData', formdataparam);
            var _formdata = {},
            that = this;
            that.append = function(key, value) {
                if(key == "undefined" || key == "") {
                    $KU.logErrorMessage('FormData append Error: key cannot be empty');
                    throw new Error("FormData append Error: key cannot be empty");
                }
                
                
                if(!$KG.appbehaviors.doNotEncodeFormValue) {
                    value = encodeURIComponent(value);
                }
                if(!_formdata[key]) {
                    _formdata[key] = [value];
                } else {
                    _formdata[key].push(value);
                }
            },
            that.toString = function() {
                var formdata = "";
                for(var key in _formdata) {
                    if(formdata == "") {
                        formdata = key + '=' + _formdata[key].join('&' + key + '=');
                    } else {
                        formdata += '&' + key + '=' + _formdata[key].join('&' + key + '=');
                    }
                }
                return formdata;
            },
            that.delete = function(key) {
                delete _formdata[key];
            },
            that.entries = function() {
                return makeIterator(_formdata, "entries");
            },
            that.get = function(key) {
                return _formdata[key][0];
            },
            that.getAll = function(key) {
                return _formdata[key];
            },
            that.has = function(key) {
                return _formdata.hasOwnProperty(key);
            },
            that.keys = function() {
                return makeIterator(_formdata, "keys");
            },
            that.set = function(key, value) {
                if(_formdata.hasOwnProperty(key)) {
                    delete _formdata[key];
                }
                _formdata[key] = [value];
            },
            that.values = function() {
                return makeIterator(_formdata, "values");
            }
            $KU.logExecutingFinished('kony.net.FormData VIA VIA if (formdataparam && formdataparam.isMultiPart && (window.FormData != undefined)) is false');
        }
    },

    HttpRequest: function() {
        var _openflag = false,
            _requestMethod = null,
            _sendcount = 0,
            that = this,
            _xhr = null,
            _xhrtimeout = null;
        $KU.logExecuting('kony.net.HttpRequest');
        $KU.logExecutingWithParams('kony.net.HttpRequest');
        if(window.XMLHttpRequest) {
            _xhr = new XMLHttpRequest();
        } else {
            _xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }

        that.onReadyStateChange = null;
        that.readyState = undefined;
        that.response = "";
        that.responseType = "";
        that.status = null;
        that.statusText = null;
        that.timeout = 0;
        that.enableWithCredentials = false; 
        that.randomString = '';
        that.integrityStatus = constants.HTTP_INTEGRITY_CHECK_NOT_DONE;

        _xhr.onreadystatechange = function() {
            
            that.status = _xhr.status;
            switch(_xhr.readyState) {
                case 0: 
                case 1: 
                case 2: 
                case 3: 
                    that.readyState = _xhr.readyState;
                    that.response = "";
                    !!that.onReadyStateChange && that.onReadyStateChange(that);
                    break;

                case 4: 
                    that.statusText = "Request Completed";
                    that.readyState = _xhr.readyState;
                    if(_xhr.responseType == "" || _xhr.responseType == "text") {
                        that.response = _xhr.responseText;
                    } else {
                        that.response = _xhr.response;
                    }
                    if($KI.net.integrityCheckRequired) {
                        $KI.net.generateResponseCheckSumAndCheckIntegrity($KI.net.integrityProperties, that, that.response);
                    }
                    if(_xhr.status === 200) {
                        that.statusText += ": OK";
                        if(_xhrtimeout) clearTimeout(_xhrtimeout);
                    }
                    if(_xhr.status === 400) {
                        that.statusText += ": Error";
                        if(_xhrtimeout) clearTimeout(_xhrtimeout);
                    }!!that.onReadyStateChange && that.onReadyStateChange(that); 
                    break;

                default:
                    $KU.logErrorMessage('Unknown Error : XMLHttpRequest error');
                    throw new Error("Unknown Error : XMLHttpRequest Error");
            }
        };

        that.timeoutFunction = function() {
            that.abort();
            that.readyState = _xhr.readyState;
            that.status = 0;
            that.statusText = "Request timed out";
            that.response = "";
            !!that.onReadyStateChange && that.onReadyStateChange();
        };

        that.open = function(requestMethod, url, async, username, password) {
            if(!requestMethod && requestMethod !== "GET" && requestMethod !== "POST") {
                $KU.logErrorMessage('Syntax Error : Request Method is not defined');
                throw new Error("Syntax Error : Request Method is not defined");
                return;
            }
            if(!url) {
                $KU.logErrorMessage('Syntax Error : URL is not defined');
                throw new Error("Syntax Error : URL is not defined");
                return;
            }
            async = ((async === true) || (async === false)) && async || true;
            _requestMethod = requestMethod;
            _openflag = true;
            _xhr.open(_requestMethod, url, async, username, password);
        };

        that.send = function(data) {
            if(_openflag === false) {
                $KU.logErrorMessage("InvalidStateError : 'send' called before 'open'");
                throw new Error("InvalidStateError : 'send' called before 'open' ");
                return;
            }

            if(_sendcount > 1) {
                $KU.logErrorMessage("InvalidStateError : 'send' called more than once ");
                throw new Error("InvalidStateError : 'send' called more than once ");
                return;
            }

            if(data instanceof kony.net.FormData) {
                data = data.toString(); 
            } else if(!data) {
                data = "";
            }
            if(that.enableWithCredentials) {
                _xhr.withCredentials = true;
            }
            _sendcount++;
            _xhr.timeout = !!that.timeout && that.timeout;
            if(_xhr.timeout) {
                _xhrtimeout = setTimeout(that.timeoutFunction, that.timeout);
            }
            _xhr.responseType = that.responseType;
    	    if($KI.net.integrityCheckRequired) {
                if($KI.net.integrityProperties) {
                    $KI.net.generateRequestCheckSumAndSetRequestHeader($KI.net.integrityProperties, that, data);
                }
            }
            _xhr.send(data);
        };

        that.abort = function() {
            _xhr.abort();
        };

        that.setRequestHeader = function(header, value) {
            if(_openflag === false) {
                $KU.logErrorMessage("InvalidStateError : 'setRequestHeader' called before 'open' ");
                throw new Error("InvalidStateError : 'setRequestHeader' called before 'open' ");
                return;
            }
            if(_sendcount > 1) {
                $KU.logErrorMessage("InvalidStateError : 'setRequestHeader' called after 'send' ");
                throw new Error("InvalidStateError : 'setRequestHeader' called after 'send' ");
                return;
            }

            _xhr.setRequestHeader(header, value);

        };
        that.getResponseHeader = function(headerfield) {
            return !!_xhr.getResponseHeader(headerfield) && _xhr.getResponseHeader(headerfield) || null;
        };
        that.getAllResponseHeaders = function() {
            var headers, arr, parts, header, value, line, count = 0,
                headerMap = {}; 
            headers = !!_xhr.getAllResponseHeaders() && _xhr.getAllResponseHeaders() || null;
            if($KG.appbehaviors.isResponseHeaderString) {
                return headers;
            }
            
            
            if(headers) {
                arr = headers.trim().split(/[\r\n]+/);
                for(count = 0; count < arr.length; count++) {
                    line = arr[count];
                    parts = line.split(': ');
                    header = parts.shift();
                    value = parts.join(': ');
                    headerMap[header] = value;
                }
            }
            return headerMap;
        };
        $KU.logExecutingFinished('kony.net.HttpRequest');
    },

    generateRequestCheckSumAndSetRequestHeader: function(integrityProperties, ajaxobj, data) {
        var algo = integrityProperties.algo,
            salt = integrityProperties.salt,
            headerName = integrityProperties.headerName,
            requestChecksum = '',
            headerValue = '';

        requestChecksum = $KI.net.generateRequestCheckSum(algo, salt, data, ajaxobj);
        headerValue = ajaxobj.randomString + ";" + requestChecksum;
        ajaxobj.setRequestHeader(headerName, headerValue);
    },

    generateResponseCheckSumAndCheckIntegrity: function(integrityProperties, ajaxobj, response) {
        var responseChecksum = '',
            headers = {},
            checkSum = '';

        responseChecksum = $KI.net.generateResponseCheckSum(integrityProperties.algo, integrityProperties.salt, response, ajaxobj.randomString);
        headers = ajaxobj.getAllResponseHeaders();
        if(headers.hasOwnProperty(integrityProperties.headerName)
        || headers.hasOwnProperty(integrityProperties.headerName.toLowerCase())) {
            checkSum = ajaxobj.getResponseHeader(integrityProperties.headerName);
            $KI.net.setIntegrityStatus(responseChecksum, checkSum, ajaxobj);
        }
    },

    setIntegrityStatus: function(responseChecksum, checkSum, ajaxobj) {
        if(responseChecksum == checkSum) {
            kony.print("Integrity Successful");
            ajaxobj.integrityStatus = constants.HTTP_INTEGRITY_CHECK_SUCCESSFUL;
        } else {
            ajaxobj.integrityStatus = constants.HTTP_INTEGRITY_CHECK_FAILED;
        }
    },

    checkIntegrityPropertyType: function(propertyName, propertyValue, propertyType) {
        if(typeof propertyValue != propertyType) {
            throw new KonyError("100", "Error", "Invalid argument" + propertyName);
        }
        return true;
    },
    validateIntegrityParams: function(properties) {
        var algoList;

        if(Object.keys(properties).length > 0) {
            if(($KI.net.checkIntegrityPropertyType('validateResp', properties.validateResp, 'boolean'))
            &&($KI.net.checkIntegrityPropertyType('algo', properties.algo, 'string'))
            &&($KI.net.checkIntegrityPropertyType('salt', properties.salt, 'string'))
            &&($KI.net.checkIntegrityPropertyType('headerName', properties.headerName, 'string'))) {

                algoList = ["md5", "sha1", "sha256", "sha512"];
                if((algoList.indexOf(properties.algo.toLowerCase())) == -1) {
                    throw new KonyError("100", "Error", "Invalid argumment" + properties.algo);
                }

                if(properties.salt.length > 1024) {
                    properties.salt = properties.salt.substring(0, 1024);
                }

                if(properties.headerName.length > 64) {
                    properties.headerName = properties.headerName.substring(0, 64);
                }
            }

        } else {
            throw new KonyError("101", "Error", "Invalid number of arguments");
        }
        return true;
    },

    generateRequestCheckSum: function(algo, salt, requestBody, ajaxobj) {
      var requestCheckSum, toHash,
          requestBodyHash = 'EMPTY_BODY';

      ajaxobj.randomString = $KI.crypto.generateRandomString();
      if(requestBody) {
          requestBodyHash = $KI.crypto.createHashToUpperCase(algo, requestBody);
      }
      toHash = "Request:" + salt + ":" + ajaxobj.randomString + ":" + requestBodyHash;
      requestCheckSum = $KI.crypto.createHashToUpperCase(algo, toHash);
      return requestCheckSum;
    },

    generateResponseCheckSum: function(algo, salt, responseBody, randomString) {
      var responseBodyHash, responseCheckSum, toHash,
          responseBodyHash = 'EMPTY_BODY';

      if(responseBody) {
          responseBodyHash = $KI.crypto.createHashToUpperCase(algo, responseBody);
      }
      toHash = "Response:" + salt + ":" + randomString + ":" + responseBodyHash;
      responseCheckSum = $KI.crypto.createHashToUpperCase(algo, toHash);
      return responseCheckSum;
    },

    setIntegrityCheck: function(properties) {
        var checkIntegrityParams = $KI.net.validateIntegrityParams(properties);
        $KU.logExecuting('kony.net.setIntegrityCheck');
        if(checkIntegrityParams) {
            $KU.logExecutingWithParams('kony.net.setIntegrityCheck', properties);
            $KI.net.integrityCheckRequired = properties.validateResp;
            if($KI.net.integrityCheckRequired) {
                $KI.net.integrityProperties = properties;
            }
        }
        $KU.logExecutingFinished('kony.net.setIntegrityCheck');
    },

    removeIntegrityCheck: function() {
        $KU.logExecuting('kony.net.removeIntegrityCheck');
        $KU.logExecutingWithParams('kony.net.removeIntegrityCheck');
        $KI.net.integrityCheckRequired = false;
        $KI.net.integrityProperties = null;
        $KU.logExecutingFinished('kony.net.removeIntegrityCheck');
    },

    sethttpheaders: function(ajaxobj, headers) {

        var headerdata = [],
            value, index = 0;

        for(var i in headers) {
            if(headers.hasOwnProperty(i) && headers[i]) {
                value = headers[i] ? headers[i] : "";
                headerdata.push(i);
                kony.print("sethttpheaders: key: " + i + "value: " + value);
                ajaxobj.setRequestHeader(i, value);
            }
        }
        return headerdata;
    },

    loadJSFile: function(fileurl, async, callback) {
        var status = 0;
        var timeout = 30000;
        var options = {
            type: "GET",
            url: fileurl,
            timeout: timeout,
            paramstr: null,
            callback: callback,
            info: ""
        };
        kony.print("loadJSFile: options: " + options);

        return(function ajax() {

            function invokecallback(callback) {
                if(callback) callback();
            };

            var requestDone = false; 
            var ajaxobj = new XMLHttpRequest(); 
            ajaxobj.open(options.type, options.url, async);
            ajaxobj.onLoaded = function() {
                if(this.userCancelled) {
                    kony.print(" onLoaded: on Abort Mission");
                    this.onAbort();
                }
            };

            ajaxobj.onInteractive = function() {
                if(this.userCancelled) {
                    kony.print(" onInteractive: on Abort Mission");
                    this.onAbort();
                } else
                if(!this.firstByte) {
                    this.firstByte = true;
                }
            };

            
            ajaxobj.onAbort = function(transport) {

                
                kony.print(" onInteractive: <- Abort Mission");
                if(this.userCancelled) {

                    this.userCancelled = false;
                    this.ignoreCallback = true;
                    rettable = {
                        "opstatus": 1,
                        "errcode": 1022,
                        "errmsg": "Request cancelled by user"
                    };
                    kony.print(" onInteractive: Abort Mission Success");
                }
                kony.print(" onInteractive: -> Abort Mission");
            };

            ajaxobj.onTimeout = function() {

                requestDone = true;
                rettable = {
                    "opstatus": 1,
                    "errcode": 1014,
                    "errmsg": "Request timed out"
                };
                kony.print("Request timed out.");
            };

            ajaxobj.onreadystatechange = function() {
                
                switch(!this.ignoreCallback && ajaxobj.readyState) {

                    case 1:
                        kony.print("onreadystatechange: ReadyState 1");
                        ajaxobj.onLoaded(ajaxobj);
                        break;

                    case 2:
                        kony.print("onreadystatechange: ReadyState 2");
                        ajaxobj.onInteractive(ajaxobj);
                        break;

                    case 3:
                        kony.print("onreadystatechange: ReadyState 3");
                        ajaxobj.onAbort(ajaxobj);
                        break;

                    case 4:
                        kony.print("onreadystatechange: ReadyState 4");
                        if(!requestDone) {
                            ajaxobj.onComplete(ajaxobj);
                            
                            ajaxobj = null;
                        }
                        break;

                    default:
                        kony.print("onreadystatechange: ReadyState Invalid: " + ajaxobj.readyState);
                }
            };

            ajaxobj.addResponseText = function(transport) {
                
                rettable = transport.responseText;
                
                if(typeof document != "undefined") {
                    var script = document.createElement('script');
                    script.type = "text/javascript";
                    script.text = transport.responseText;
                    document.getElementsByTagName('head')[0].appendChild(script);
                    if(options.callback) options.callback();
                    document.getElementsByTagName('head')[0].removeChild(script);
                }
            };

            ajaxobj.onComplete = function(transport) {

                
                window.clearTimeout(transport.timeoutid);
                kony.print("status: " + transport.status + "readystate: " + transport.readyState);

                this.firstByte = false;

                if(this.userCancelled) {
                    kony.print(" onComplete: on Abort Mission");
                    this.onAbort();
                    return;
                }

                if(transport.status == 200) {
                    if(transport.responseText && transport.responseText.length > 0) {
                        if(options.callback) {
                            options.callback(transport.responseText);
                        }
                    }
                    
                    else {
                        kony.print("errcode: 1013, No JS Code");
                        rettable = {
                            "opstatus": "1",
                            "errcode": "1013",
                            "errmsg": "Request returned no JS code"
                        };
                    }
                } else {
                    
                    if(transport.status == 0 || (/5+/.test(transport.status.toString()) == true)) {
                        
                        if(transport.responseText && transport.responseText.length > 0) {
                            if(options.callback) {
                                options.callback(transport.responseText);
                            }
                            return;
                        }
                        kony.print("errcode: 1012, Request Failed");
                        rettable = {
                            "opstatus": 1,
                            "errcode": "1012",
                            "errmsg": "Request Failed"
                        };
                    } else {
                        
                        if(/4+/.test(transport.status.toString()) == true) {
                            kony.print("errcode: 1012, Request Failed");
                            rettable = {
                                "opstatus": 1,
                                "errcode": "1015",
                                "errmsg": "Request Failed"
                            };
                        } else {
                            if(transport.responseText != "") {
                                kony.print("Status != 200 but response exists");
                                rettable = transport.responseText;
                            } else
                                kony.print("Empty response received.");
                        }
                    }
                }
            };

            
            ajaxobj.timeoutid = setTimeout(ajaxobj.onTimeout, options.timeout);
            ajaxobj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            
            if(typeof(headerobj) == "object")
                options.httpheaders = $KI.net.sethttpheaders(ajaxobj, headerobj);

            
            ajaxobj.send(options.paramstr);

            return ajaxobj;
        })();
    },

    invokeserviceasync: function(posturl, postdata, Callback, info, method, timeout) {
        var status = 0;
        var rettable = null;
        var usertimeout = timeout || 60000; 
        var origin = window.location.protocol + "//" + window.location.host;
        var proxyurl = "";
        var postorigin = "";
        var appmode = $KG["appmode"];
        var middlewarecontext = $KI.props.getProperty(null, 'appmiddlewarecontext') || ((typeof appConfig != "undefined") && appConfig && appConfig.middlewareContext) || ((typeof config != "undefined") && config && config.middlewarecontext) || "middleware";

        kony.print("invokeServiceAsync<- " + posturl);
        kony.print("middlewarecontext<- " + middlewarecontext);
        if(appmode == constants.APPLICATION_MODE_NATIVE) {

            var i = posturl.indexOf(middlewarecontext);
            if(i != -1) {
                postorigin = posturl.slice(0, i);
            }
            
            if($KG["skipproxy"] || ($KI.net.checkOriginandPostOrigin(origin, postorigin) && posturl)) {
                proxyurl = origin + "/" + middlewarecontext + "/MWServlet"; 
            } else {
                proxyurl = origin + "/" + $KG["appid"] + "/spa";
                kony.print("using proxy: URL " + proxyurl);

                if(postdata) {
                    postdata["_desturl"] = posturl;
                } else {
                    postdata = {};
                    postdata["_desturl"] = posturl;
                    kony.print("Without postdata " + posturl);
                }
            }
            postdata["rcid"] = $KG["rcid"] || "";
        }

        var headerobj = postdata && postdata["httpheaders"];
        var postdatastr = (postdata && $KI.net.postdataparams(postdata)) || "";

        kony.print("invokeServiceAsync: URL: " + posturl);
        kony.print("invokeServiceAsync: Args are: " + postdatastr);
        kony.print("middleware origin: " + postorigin);
        kony.print("location origin: " + origin);

        
        if(posturl && posturl.indexOf("/IST") != -1 || posturl.indexOf("/CMS") != -1) {
            proxyurl = posturl;
        } else if(posturl) {
            if(typeof document != "undefined") {
                var anchor = document.createElement('a');
                anchor.href = posturl;
                
                var posturlorigin = anchor.protocol + "//" + anchor.host;
                if($KI.net.checkOriginandPostOrigin(posturlorigin, origin)) {
                    proxyurl = posturl;
                }
            }
        }

        if(appmode == constants.APPLICATION_MODE_HYBRID || appmode == constants.APPLICATION_MODE_WRAPPER) {
            proxyurl = posturl;
            kony.print("!!!!!!!!!!appmode hybrid/wrapper: " + proxyurl);
        }

        var httpconfig = postdata && postdata["httpconfig"];
        if(httpconfig && httpconfig.timeout && !isNaN(httpconfig.timeout))
            usertimeout = parseInt(httpconfig.timeout) * 1000;

        var options = {
            type: "POST",
            url: proxyurl,
            timeout: usertimeout,
            paramstr: postdatastr,
            callback: Callback,
            info: info || null
        };

        if(method && typeof method != "undefined" && "GET".toLowerCase() === method.toLowerCase()) {
            options.type = "GET";
            options.url = options.url + "?" + postdatastr;
        }

        kony.print("invokeServiceAsync: options: " + options);
        kony.system.activity.increment();

        return(function ajax() {

            
            if(spaAPM !== null) {
                var timeTaken = new Date().getTime();
                var urlOrID = null;
                if(postdata["serviceID"])
                    urlOrID = postdata["serviceID"];
                else
                    urlOrID = options.url;
                spaAPM.sendMsg(urlOrID, 'servicerequest');
            }

            function invokecallback(callback, status, rettable, info) {
                
                kony.system.activity.decrement();
                if(!kony.system.activity.hasActivity()) {
                    if(typeof $KW !== "undefined") {
                        $KW.skins.removeBlockUISkin();
                        $KW.unLoadWidget();
                    }
                }
                
                if(callback) {
                    callback(status, rettable, info);
                    $KU.onEventHandler();
                }

                
                if(spaAPM !== null) {
                    if(timeTaken)
                        var ts = new Date().getTime() - timeTaken;
                    else
                        var ts = null;
                    spaAPM.sendMsg(urlOrID, 'serviceresponse', {
                        "opstatus": (rettable && rettable.opstatus) ? rettable.opstatus : null,
                        "httpcode": status ? status : null,
                        "resptime": ts
                    });
                }
            };

            var requestDone = false; 
            var ajaxobj = new XMLHttpRequest(); 
            ajaxobj.open(options.type, options.url, true);
            ajaxobj.onLoaded = function() {
                if(this.userCancelled) {
                    kony.print(" onLoaded: on Abort Mission");
                    this.onAbort();
                } else
                    invokecallback(options.callback, 100, null);
            };

            ajaxobj.onInteractive = function() {
                if(this.userCancelled) {
                    kony.print(" onInteractive: on Abort Mission");
                    this.onAbort();
                } else
                if(!this.firstByte) {
                    this.firstByte = true;
                    invokecallback(options.callback, 200, null);
                }
            };

            
            ajaxobj.onAbort = function(transport) {

                
                kony.print(" onInteractive: <- Abort Mission");
                if(this.userCancelled) {

                    this.userCancelled = false;
                    this.ignoreCallback = true;
                    rettable = {
                        "opstatus": 1,
                        "errcode": 1022,
                        "errmsg": "Request cancelled by user"
                    };
                    invokecallback(options.callback, 300, rettable);
                    kony.print(" onInteractive: Abort Mission Success");
                }
                kony.print(" onInteractive: -> Abort Mission");
            };

            ajaxobj.onTimeout = function() {
                if(ajaxobj.userCancelled) {
                    ajaxobj.onAbort();
                } else {
                    requestDone = true;
                    rettable = {
                        "opstatus": 1,
                        "errcode": 1014,
                        "errmsg": "Request timed out"
                    };
                    invokecallback(options.callback, 400, rettable);
                }
            };

            ajaxobj.onreadystatechange = function() {
                
                switch(!this.ignoreCallback && ajaxobj.readyState) {

                    case 1:
                        kony.print("onreadystatechange: ReadyState 1");
                        ajaxobj.onLoaded(ajaxobj);
                        break;

                    case 2:
                        kony.print("onreadystatechange: ReadyState 2");
                        ajaxobj.onInteractive(ajaxobj);
                        break;

                    case 3:
                        kony.print("onreadystatechange: ReadyState 3");
                        ajaxobj.onAbort(ajaxobj);
                        break;

                    case 4:
                        kony.print("onreadystatechange: ReadyState 4");
                        if(!requestDone) {
                            ajaxobj.onComplete(ajaxobj);
                            
                            ajaxobj = null; 
                        }
                        break;

                    default:
                        kony.print("onreadystatechange: ReadyState Invalid: " + ajaxobj.readyState);
                }
            };

            ajaxobj.onComplete = function(transport) {

                
                window.clearTimeout(transport.timeoutid);
                kony.print("status: " + transport.status + "readystate: " + transport.readyState + "res: " + transport.response);

                this.firstByte = false;

                if(this.userCancelled) {
                    kony.print(" onComplete: on Abort Mission");
                    this.onAbort();
                    return;
                }

                if(transport.status == 200) {
                    if(transport.responseText && transport.responseText.length > 0) {
                        
                        rettable = transport.responseText;
                        try {
                            if(IndexJL == 1)
                                rettable = $KU.convertjsontoluaobject(rettable);
                            else
                                rettable = JSON.parse(rettable);
                        } catch(error) {
                            kony.print("errcode: 1013, Invalid JSON string - Unable to parse the returned JSON from server");
                            
                            rettable = {
                                "opstatus": "1",
                                "errcode": "1013",
                                "errmsg": "Middleware returned invalid JSON string",
                                "response": rettable
                            };
                        }
                        

                    }
                    
                    else {
                        kony.print("errcode: 1013, Invalid JSON string");
                        rettable = {
                            "opstatus": "1",
                            "errcode": "1013",
                            "errmsg": "Middleware returned invalid JSON string"
                        };
                    }
                } else {
                    
                    
                    if(transport.status == 0 || transport.status == 12200 || (/5+/.test(transport.status.toString()) == true)) {
                        if(typeof navigator.onLine !== "undefined" && !navigator.onLine) {
                            kony.print("errcode: 1011, Device has no WIFI or mobile connectivity. Please try the operation after establishing connectivity.");
                            rettable = {
                                "opstatus": 1,
                                "errcode": "1011",
                                "errmsg": "Device has no WIFI or mobile connectivity. Please try the operation after establishing connectivity."
                            };
                        } else {
                            kony.print("errcode: 1012, Request Failed");
                            rettable = {
                                "opstatus": 1,
                                "errcode": "1012",
                                "errmsg": "Request Failed"
                            };
                        }
                    } else {
                        
                        if(/4+/.test(transport.status.toString()) == true) {
                            kony.print("errcode: 1015, Cannot find host");
                            rettable = {
                                "opstatus": 1,
                                "errcode": "1015",
                                "errmsg": "Cannot find host"
                            };
                        } else {
                            if(transport.responseText != "") {
                                kony.print("Status != 200 but response exists");
                                rettable = transport.responseText;
                            } else
                                kony.print("Empty response received.");
                        }
                    }
                }
                invokecallback(options.callback, 400, rettable, options.info);
            };

            
            ajaxobj.timeoutid = setTimeout(ajaxobj.onTimeout, options.timeout);
            
            if(typeof(headerobj) == "object") {
                if(options.url.indexOf("/spa") > 0) {
                    ajaxobj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                    var contentType = headerobj["Content-Type"];
                    if(typeof contentType != "undefined")
                        delete headerobj["Content-Type"];
                } else {
                    if(typeof headerobj["Content-Type"] == "undefined") {
                        headerobj["Content-Type"] = "application/x-www-form-urlencoded";
                    }
                }
                options.httpheaders = $KI.net.sethttpheaders(ajaxobj, headerobj);
                if(options.httpheaders.length > 0 && options.url.indexOf("/spa") > 0) {
                    if(typeof contentType != "undefined") {
                        options.httpheaders["Content-Type"] = contentType;
                    }
                    options.paramstr = options.paramstr + "kCustomHeaders=" + options.httpheaders;
                }
            }


            if("POST".toLowerCase() === (options.type).toLowerCase()) {
                
                ajaxobj.send(options.paramstr);
            } else {
                ajaxobj.send();
            }

            return ajaxobj;
        })();
        kony.print("invokeServiceAsync-> ");
    },
    
    invokeService: function(posturl, postdata, Callback, info, timeout) {
        var status = 0;
        var rettable = null;
        var usertimeout = timeout || 60000; 
        var origin = window.location.protocol + "//" + window.location.host;
        var proxyurl = "";
        var postorigin = "";
        var appmode = $KG["appmode"];
        var middlewarecontext = $KI.props.getProperty(null, 'appmiddlewarecontext') || ((typeof appConfig != "undefined") && appConfig && appConfig.middlewareContext) || ((typeof config != "undefined") && config && config.middlewarecontext) || "middleware";

        kony.print("invokeServiceAsync<- ");
        if(appmode == constants.APPLICATION_MODE_NATIVE) {

            var i = posturl.indexOf(middlewarecontext);
            if(i != -1) {
                postorigin = posturl.slice(0, i);
            }
            
            if($KG["skipproxy"] || ($KI.net.checkOriginandPostOrigin(origin, postorigin) && posturl)) {
                proxyurl = origin + "/" + middlewarecontext + "/MWServlet"; 
            } else {
                proxyurl = origin + "/" + $KG["appid"] + "/spa";
                kony.print("using proxy: URL " + proxyurl);

                if(postdata) {
                    postdata["_desturl"] = posturl;
                } else {
                    postdata = {};
                    postdata["_desturl"] = posturl;
                    kony.print("Without postdata " + posturl);
                }
            }
            postdata["rcid"] = $KG["rcid"] || "";
        }

        var headerobj = postdata && postdata["httpheaders"];
        var postdatastr = (postdata && $KI.net.postdataparams(postdata)) || "";

        
        if(posturl.indexOf("/IST") != -1 || posturl.indexOf("/CMS") != -1) {
            proxyurl = posturl;
        }

        kony.print("invokeServiceAsync: URL: " + posturl);
        kony.print("invokeServiceAsync: Args are: " + postdatastr);
        kony.print("middleware origin: " + postorigin);
        kony.print("location origin: " + origin);

        if(appmode == constants.APPLICATION_MODE_HYBRID || appmode == constants.APPLICATION_MODE_WRAPPER) {
            proxyurl = posturl;
            kony.print("!!!!!!!!!!appmode hybrid/wrapper: " + proxyurl);
        }

        var options = {
            type: "POST",
            url: proxyurl,
            timeout: usertimeout,
            paramstr: postdatastr,
            callback: Callback,
            info: info || null
        };

        kony.system.activity.increment();


        var requestDone = false; 
        var ajaxobj = new XMLHttpRequest(); 
        ajaxobj.open(options.type, options.url, false);

        if(typeof(headerobj) == "object") {
            if(options.url.indexOf("/spa") > 0) {
                ajaxobj.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                var contentType = headerobj["Content-Type"];
                if(typeof contentType != "undefined")
                    delete headerobj["Content-Type"];
            } else {
                if(typeof headerobj["Content-Type"] == "undefined") {
                    headerobj["Content-Type"] = "application/x-www-form-urlencoded";
                }
            }
            options.httpheaders = $KI.net.sethttpheaders(ajaxobj, headerobj);
            if(options.httpheaders.length > 0 && options.url.indexOf("/spa") > 0) {
                if(typeof contentType != "undefined") {
                    options.httpheaders["Content-Type"] = contentType;
                }
                options.paramstr = options.paramstr + "kCustomHeaders=" + options.httpheaders;
            }
        }

        
        if(spaAPM !== null) {
            var timeTaken = new Date().getTime();
            var urlOrID = null;
            if(postdata["serviceID"])
                urlOrID = postdata["serviceID"];
            else
                urlOrID = options.url;
            spaAPM.sendMsg(urlOrID, 'servicerequest');
        }

        
        ajaxobj.send(options.paramstr);

        kony.print("status: " + ajaxobj.status + "readystate: " + ajaxobj.readyState + "res: " + ajaxobj.response);

        if(ajaxobj.status == 200) {
            if(ajaxobj.responseText && ajaxobj.responseText.length > 0) {
                kony.print(" onComplete: JSON obj: " + ajaxobj.responseText);
                rettable = ajaxobj.responseText;
                try {
                    if(IndexJL == 1)
                        rettable = $KU.convertjsontoluaobject(rettable);
                    else
                        rettable = JSON.parse(rettable);

                    kony.print(" onComplete: Lua obj: " + JSON.stringify(rettable));
                } catch(error) {
                    kony.print("errcode: 1013, Invalid JSON string - Unable to parse the returned JSON from server");
                    
                    rettable = {
                        "opstatus": "1",
                        "errcode": "1013",
                        "errmsg": "Middleware returned invalid JSON string",
                        "response": rettable
                    };
                }
            }
            
            else {
                kony.print("errcode: 1013, Invalid JSON string");
                rettable = {
                    "opstatus": "1",
                    "errcode": "1013",
                    "errmsg": "Middleware returned invalid JSON string"
                };
            }
        } else {
            
            if(ajaxobj.status == 0 || (/5+/.test(ajaxobj.status.toString()) == true)) {
                if(typeof navigator.onLine !== "undefined" && !navigator.onLine) {
                    kony.print("errcode: 1011, Device has no WIFI or mobile connectivity. Please try the operation after establishing connectivity.");
                    rettable = {
                        "opstatus": 1,
                        "errcode": "1011",
                        "errmsg": "Device has no WIFI or mobile connectivity. Please try the operation after establishing connectivity."
                    };
                } else {
                    kony.print("errcode: 1012, Request Failed");
                    rettable = {
                        "opstatus": 1,
                        "errcode": "1012",
                        "errmsg": "Request Failed"
                    };
                }
            } else {
                
                if(/4+/.test(ajaxobj.status.toString()) == true) {
                    kony.print("errcode: 1015, Cannot find host");
                    rettable = {
                        "opstatus": 1,
                        "errcode": "1015",
                        "errmsg": "Cannot find host"
                    };
                } else {
                    if(ajaxobj.responseText != "") {
                        kony.print("Status != 200 but response exists");
                        rettable = ajaxobj.responseText;
                    } else
                        kony.print("Empty response received.");
                }
            }
        }

        if(typeof $KW !== "undefined") {
            $KW.skins.removeBlockUISkin();
            $KW.unLoadWidget();
        }
        
        if(spaAPM !== null) {
            if(timeTaken)
                var ts = new Date().getTime() - timeTaken;
            else
                var ts = null;
            spaAPM.sendMsg(urlOrID, 'serviceresponse', {
                "opstatus": (rettable && rettable.opstatus) ? rettable.opstatus : null,
                "httpcode": status ? status : null,
                "resptime": ts
            });
        }

        return rettable;
    },

    cancel: function(nwhndl) {
        $KU.logExecuting('kony.net.cancel');
        kony.print("networkcancel<- ");
        
        if(nwhndl) {
            
            $KU.logExecutingWithParams('kony.net.cancel', nwhndl);
            nwhndl.userCancelled = true;
            nwhndl.abort();
            $KU.logWarnMessage('Request aborted on user request');
            kony.print("Request aborted on user request");
        }
        kony.print("networkcancel-> ");
        $KU.logExecutingFinished('kony.net.cancel');
    },

    checkOriginandPostOrigin: function(origin, postorigin) {
        return origin.replace(/([^=]*):(80|443){1}(.*)/, '$1$3') == postorigin.replace(/([^=]*):(80|443){1}(.*)/, '$1$3') ? true : false;
    },

    
    isNetworkAvailable: function(connectionType) {
        $KU.logExecuting('kony.net.isNetworkAvailable');
        if(!!connectionType) {
            $KU.logExecutingWithParams('kony.net.isNetworkAvailable', connectionType);
            if(connectionType === constants.NETWORK_TYPE_ANY) {
                if(typeof navigator.onLine !== "undefined") {
                    $KU.logExecutingFinished('kony.net.isNetworkAvailable');
                    return navigator.onLine;
                } else {
                    $KU.logWarnMessage('navigator.online is undefined');
                    return false;
                }
            } else if(connectionType === constants.NETWORK_TYPE_3G ||connectionType === constants.NETWORK_TYPE_WIFI || connectionType === constants.NETWORK_TYPE_ETHERNET) {
                $KU.logWarnMessage('Invalid connectionType');
                return false;
            } else {
                $KU.logErrorMessage('Invalid Network Type or connectionType');
                throw new Error("Invalid Network Type");
            }
        } else {
            $KU.logErrorMessage('Invalid arguments');
            throw new Error("Invalid Network Type");
        }
    },

    setNetworkCallbacks: function(config) {
        $KU.logExecuting('kony.net.setNetworkCallbacks');
        if(config && config.statusChange) {
            $KU.logExecutingWithParams('kony.net.setNetworkCallbacks', config);
            if(typeof window.ononline === "object") {
                window.addEventListener("online", function() {
                    config.statusChange(navigator.onLine)
                }, false);
            }
            if(typeof window.onoffline === "object") {
                window.addEventListener("offline", function() {
                    config.statusChange(navigator.onLine)
                }, false);
            }
            $KU.logExecutingFinished('kony.net.setNetworkCallbacks');
        } else {
            $KU.logErrorMessage('Invalid argument or argument is not of valid type');
            throw new Error("Invalid Input : config is not of valid type");
        }
    },

    getActiveNetworkType: function() {
        $KU.logExecuting('kony.net.getActiveNetworkType');
        $KU.logExecutingWithParams('kony.net.getActiveNetworkType');
        $KU.logExecutingFinished('kony.net.getActiveNetworkType');
        if(typeof navigator.onLine === "undefined") {
            return constants.NETWORK_TYPE_ANY;
        } else {
            if(navigator.onLine) {
                return constants.NETWORK_TYPE_ANY;
            } else {
                $KU.logWarnMessage('problem with network status');
                return null;
            }
        }
    },

    
    getCookies: function(url) {
        $KU.logExecuting('kony.net.getCookies');
        if(url) {
            $KU.logExecutingWithParams('kony.net.getCookies', url);
            if(window && url.indexOf(window.location.origin) != -1) {
                var allCookies = document && document.cookie;
                if(allCookies && allCookies.length > 0) {
                    $KU.logExecutingFinished('kony.net.getCookies');
                    return allCookies.split(";");
                }
            }
        }
        $KU.logWarnMessage('Invalid argument');
        return null;
    },

    clearCookies: function(url, cookies) {
        $KU.logExecuting('kony.net.clearCookies');
        var allCookies = document && document.cookie.split(";");
        url = url || document.URL;
        if(window && url.indexOf(window.location.origin) != -1) {
            cookies = cookies || allCookies;
            if(cookies) {
                $KU.logExecutingWithParams('kony.net.clearCookies', url, cookies);
                var pathBits = window.location.pathname.split("/");
                for(var i = 0; i < cookies.length; i++) {
                    var pathCurrent = "/";
                    var cookieName = cookies[i].trim();
                    if(document.cookie.indexOf(cookieName) != -1)
                        for(var j = 0; j < pathBits.length; j++) {
                            pathCurrent += ((pathCurrent.substr(-1) != '/') ? '/' : '') + pathBits[j];
                            if(cookieName.indexOf('=') != -1) {
                                document.cookie = cookieName + '; expires=Thu, 01-Jan-1970 00:00:01 GMT;path=' + pathCurrent + ';';
                            } else
                                document.cookie = cookieName + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT;path=' + pathCurrent + ';';
                            if(document.cookie.indexOf(cookieName) == -1)
                                break;
                        }
                }
            }
            $KU.logExecutingFinished('kony.net.clearCookies');
        } else {
            $KU.logErrorMessage('Invalid input url');
            throw new KonyError(1005, "invalid input url", "invalid input url");
        }
    },

    loadClientCertificate: function() {
        $KU.logWarnMessage('The loadClientCertificate API is not supported.');
    },

    removeClientCertificate: function() {
        $KU.logWarnMessage('The removeClientCertificate API is not supported.');
    },

    removeAllCachedResponses: function() {
        $KU.logWarnMessage('The removeAllCachedResponses API is not supported.');
    },

    urlDecode: function() {
        $KU.logWarnMessage('The urlDecode API is not supported.');
    },

    urlEncode: function() {
        $KU.logWarnMessage('The urlEncode API is not supported.');
    }
};


$KI.props = {
    getProperty: function(group, key) {
        $KU.logExecuting('kony.props.getProperty');
        $KU.logExecutingWithParams('kony.props.getProperty', group, key);
        if(typeof _konyAppProperties != "undefined" && _konyAppProperties != null && key) {
            $KU.logExecutingFinished('kony.props.getProperty');
            return _konyAppProperties[key] || null;
        }
    }
};
