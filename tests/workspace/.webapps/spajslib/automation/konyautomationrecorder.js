
$KAR = (function() {
    
    var connection, runMode, lastGUID, lastWidget, lastAction,
    jasmineResults = {
        'messageType': 'jasmineEvent',
        'messageData': {
            'DeviceID': 'web'
        }
    };
    var reporter = {
        jasmineStarted: function(suiteInfo) {
            jasmineResults.messageData.jasmineStage = 'jasmineStarted';
            jasmineResults.UUID = _generateGUID();
            connection && connection.send(JSON.stringify(jasmineResults));
        },
        suiteStarted: function(result) {
            jasmineResults.messageData.jasmineStage = 'suiteStarted';
            jasmineResults.UUID = _generateGUID();
            jasmineResults.messageData.metadata = JSON.stringify(result);
            connection && connection.send(JSON.stringify(jasmineResults));
        },
        specStarted:function (result) {
            jasmineResults.messageData.jasmineStage = 'specStarted';
            jasmineResults.UUID = _generateGUID();
            jasmineResults.messageData.metadata = JSON.stringify(result);
            connection && connection.send(JSON.stringify(jasmineResults));
        },
        specDone: function(result) {
            var expectation = {
                messageType: 'jasmineResult',
                messageData: {
                    'DeviceID': 'web',
                    'result': result.status
                }
            };
            jasmineResults.messageData.jasmineStage = 'specDone';
            jasmineResults.UUID = _generateGUID();
            jasmineResults.messageData.metadata = JSON.stringify(result);
            connection && connection.send(JSON.stringify(jasmineResults));
            connection && connection.send(JSON.stringify(expectation));
        },

        suiteDone: function(result) {
            jasmineResults.messageData.jasmineStage = 'suiteDone';
            jasmineResults.UUID = _generateGUID();
            jasmineResults.messageData.metadata = JSON.stringify(result);
            connection && connection.send(JSON.stringify(jasmineResults));
        },

        jasmineDone: function() {
            jasmineResults.messageData.jasmineStage = 'jasmineDone';
            jasmineResults.UUID = _generateGUID();
            connection && connection.send(JSON.stringify(jasmineResults));
            connection.close();
        }
    };

    var _getClickableParentInfo = function(widgetModel, metaInfo, widgetType) {
        var parentInfo, parentNode, parentModel;
        switch(widgetType) {
            case 'image':
            case 'label':
                parentModel = _getClickableParent(widgetModel);
                if(parentModel) {
                    metaInfo.target = $KU.getNodeByModel(parentModel);
                    parentInfo = {
                        'metaInfo': metaInfo,
                        'widgetModel': parentModel,
                        'widgetType': parentModel.wType.toLowerCase()
                    };
                }
            break;
            default:
                parentInfo = {
                    'widgetModel': widgetModel,
                    'metaInfo': metaInfo,
                    'widgetType': widgetType
                };
            break;
        }

        return parentInfo;
    };

    var _getClickableParent= function(widgetModel) {
        var parentModel = widgetModel.parent, clickableParent;

        while(parentModel.wType !== 'Form') {
            if(parentModel.wType.toLowerCase() === 'flexcontainer') {
                clickableParent = parentModel;
                break;
            } else {
                parentModel = parentModel.parent;
            }
        }

        return clickableParent;
    };

    var _generateGUID = function() {
        var date = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
            date += performance.now();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (arg) {
            var random = (date + Math.random() * 16) % 16 | 0;
            date = Math.floor(date / 16);
            return (arg === 'x' ? random : (random & 0x3 | 0x8)).toString(16);
        });
    };

    var _getGUID = function(widgetModel, actionType, widgetType, metaInfo) {
        var guid, generateNewGUID;
        var sameGUIDWidgetsList = ['textbox', 'textarea', 'slider'];

        if(actionType === 'touch') {
            if(metaInfo.type === 'start') {
                generateNewGUID = true;
                actionType = 'start';
            } else if(metaInfo.type ==='move') {
                if(widgetModel.onTouchStart && widgetModel === lastWidget && lastAction === 'start') {
                    generateNewGUID = false;
                } else {
                    if(widgetModel === lastWidget && lastAction === 'move') {
                        generateNewGUID = false;
                    } else {
                        generateNewGUID = true;
                    }
                }
                actionType = 'move';
            } else {
                if(widgetModel.onTouchStart || widgetModel.onTouchMove) {
                    generateNewGUID = false;
                } else {
                    generateNewGUID = true;
                }
                actionType = 'end';
            }
        } else {
            if(widgetModel === lastWidget && actionType === lastAction && sameGUIDWidgetsList.indexOf(widgetType) >= 0) {
                generateNewGUID = false;
            } else {
                generateNewGUID = true;
            }
        }

        if(generateNewGUID) {
            guid = _generateGUID();
            lastWidget = widgetModel;
            lastAction = actionType;
            lastGUID = guid;
        } else {
            guid = lastGUID;
            lastAction = actionType; 
        }
        return guid;
    };

    
    var _getPostData = function(widgetPath, widgetType, actionType, metaInfo, widgetModel) {
        var widgetTypeMap = {
            'igallery': 'imagegallery',
            'hstrip': 'horizontalimagestrip',
            'segment': 'segmentedui',
            'textfield': 'textbox'
        }, postData,
        touchMap = {
            'touchstart': 'start',
            'mousedown': 'start',
            'touchmove': 'move',
            'mousemove': 'move',
            'touchend': 'end',
            'mouseup': 'end'
        };

        widgetType = widgetTypeMap[widgetType] || widgetType;

        var uiActions = {
            'button': {
                click: function(postData, metaInfo) {
                    return postData;
                }
            },
            'textarea': {
                enterText: function(postData, metaInfo) {
                    postData.messageData.metadata = {
                        'text': metaInfo.text
                    };

                    return postData;
                }
            },
            'textbox': {
                enterText: function(postData, metaInfo) {
                    postData.messageData.metadata = {
                        'text': metaInfo.text
                    };

                    return postData;
                }
            },
            'box': {
                click: function(postData, metaInfo) {
                    return postData;
                }
            },
            'flexcontainer': {
                click: function(postData, metaInfo) {
                    return postData; 
                }
            },
            'richtext': {
                click: function(postData, metaInfo) {
                    if(metaInfo.data && metaInfo.data[0]) {
                        postData.messageData.metadata = {
                            'linkText': metaInfo.data[0]
                        };
                    } else if(metaInfo.data && metaInfo.data.childNodes[0]) {
                        postData.messageData.metadata = {
                            'linkText': metaInfo.data.childNodes[0].textContent
                        };
                    }
                    return postData;
                }
            },
            'link': {
                click: function(postData, metaInfo) {
                    return postData;
                }
            },
            'checkboxgroup': {
                click: function(postData, metaInfo) {
                    postData.messageData.metadata = {
                        'selection': metaInfo.selection
                    };

                    return postData;
                }
            },
            'radiobuttongroup': {
                click: function(postData, metaInfo) {
                    postData.messageData.metadata = {
                        'selection': metaInfo.key
                    };

                    return postData;
                }
            },
            'listbox': {
                selectItem: function(postData, metaInfo) {
                    postData.messageData.metadata = {
                        'selection': metaInfo.selection
                    };

                    return postData;
                }
            },
            'combobox': {
                selectItem: function(postData, metaInfo) {
                    postData.messageData.metadata = {
                        'selection': parseInt(metaInfo.selection)
                    };

                    return postData;
                }
            },
            'appmenu': {
                click: function(postData, metaInfo) {
                    postData.messageData.metadata = {
                        'menuItemId': metaInfo.appmenuId
                    };

                    return postData;
                }
            },
            'imagegallery': {
                click: function(postData, metaInfo) {
                    var widgetPath = postData.messageData.widgetPath;
                    postData.messageData.metadata = {
                        'selection': metaInfo.selection
                    };
                    postData.messageData.widgetPath = widgetPath.substr(0, widgetPath.lastIndexOf('.') - 1);

                    return postData;
                }
            },
            'horizontalimagestrip': {
                click: function(postData, metaInfo) {
                    var widgetPath = postData.messageData.widgetPath;
                    postData.messageData.metadata = {
                        'selection': metaInfo.selection
                    };
                    postData.messageData.widgetPath = widgetPath.substr(0, widgetPath.lastIndexOf('.') - 1);

                    return postData;
                }
            },
            'switch': {
                toggle: function(postData, metaInfo) {
                    return postData;
                }
            },
            'calendar': {
                selectDate: function(postData, metaInfo) {
                    var dateComponents = metaInfo.selection,
                    expectedFormat = [dateComponents[1], dateComponents[0], dateComponents[2]];

                    postData.messageData.metadata = {
                        'selection': expectedFormat
                    };

                    return postData;
                }
            },
            'datagrid': {
                click: function(postData, metaInfo) {
                    var index = metaInfo.colIndex.split(',');
                    postData.messageData.metadata = {
                        'pinData': {
                            'row': parseInt(index[0]),
                            'col': parseInt(index[1])
                        }
                    };

                    return postData;
                }
            },
            'menucontainer': {
                click: function(postData, metaInfo) {
                    
                }
            },
            'browser': {
                onSuccess: function(postData, metaInfo) {

                },
                onFailure: function(postData, metaInfo) {

                }
            },
            'alert': {
                click: function(postData, metaInfo) {

                }
            },
            'map': {
                click: function(postData, metaInfo) {
                    var pointData = metaInfo.clickData;

                    postData.messageData.metadata = {
                        'pinData': {
                            'lat': pointData.latLng && pointData.latLng.lat(),
                            'lon': pointData.latLng && pointData.latLng.lng()
                        }
                    };

                    return postData;
                },
                clickOnPin: function(postData, metaInfo) {
                    postData.messageData.metadata = {
                        'pinData': {
                            'lat': metaInfo.locationData.lat,
                            'lon': metaInfo.locationData.lon
                        }
                    };

                    return postData;
                },
                clickOnPinCallout: function(postData, metaInfo) {
                    postData.messageData.metadata = {
                        'pinData': {
                            'lat': metaInfo.locationData.lat,
                            'lon': metaInfo.locationData.lon
                        }
                    };
                    return postData;
                }
            },
            'segmentedui': {
                click: function(postData, metaInfo) {
                    postData.messageData.metadata = metaInfo;

                    return postData;
                },
                getItem: function(postData, metaInfo) {

                },
                pull: function(postData, metaInfo) {
                    return postData;
                },
                push: function(postData, metaInfo) {
                    return postData;
                },
                scrollToBottom: function(postData, metaInfo) {

                },
                scrollToRow: function(postData, metaInfo) {

                },
                scrollToTop: function(postData, metaInfo) {

                }
            },
            'collectionview': {
                onItemSelect: function(postData, metaInfo) {

                },
                scrolltoItem: function(postData, metaInfo) {

                }
            },
            'tabpane': {
                click: function(postData, metaInfo) {
                    var widgetPath = postData.messageData.widgetPath;
                    postData.messageData.metadata = {
                        'tabID': metaInfo.tabID
                    };
                    widgetPath = widgetPath.substr(0, widgetPath.lastIndexOf('.'));

                    postData.messageData.widgetPath = widgetPath.substr(0, widgetPath.lastIndexOf('.'));


                    return postData;
                }
            },
            'slider': {
                slide: function(postData, metaInfo) {
                    postData.messageData.metadata = {
                        'selection': metaInfo.selectedValue
                    };

                    return postData;
                }
            }
        };

        var gestures = {
            scroll: function(postData, metaInfo) {
                return postData;
            },
            longPress: function(postData, metaInfo){
                return postData;
            },
            swipe: function(postData, metaInfo){
                return postData;
            },
            tap: function(postData, metaInfo){
                return postData;
            },
            rotate: function(postData, metaInfo){
                return postData;
            },
            pinch: function(postData, metaInfo){
                return postData;
            },
            pan: function(postData, metaInfo){
                return postData;
            },
            longpress: function(postData, metaInfo){
                return postData;
            }
        };

        var device = {
            deviceback: function(postData, metaInfo) {
                return postData;
            },
            orientation: function(postData, metaInfo) {
                return postData
            }
        };

        if(metaInfo.eventType === 'uiAction') {
            postData = {
                'messageType': 'Record',
                'messageData': {
                    'DeviceID': 'web',
                    'widgetPath': widgetPath,
                    'widgetType': widgetType,
                    'actionType': actionType
                }
            };
            postData = uiActions[widgetType][actionType](postData, metaInfo);
        } else if(metaInfo.eventType === 'gesture') {
            postData = {
                'messageType': 'Record',
                'messageData': {
                    'DeviceID': 'web',
                    'widgetPath': widgetPath,
                    'widgetType': 'gesture',
                    'actionType': actionType
                }
            };
            postData = gestures[actionType](postData, metaInfo);
        } else if(metaInfo.eventType === 'device') {
            postData = {
                'messageType': 'Record',
                'messageData': {
                    'DeviceID': 'web',
                    'actionType': actionType
                }
            };
            postData = device[actionType](postData, metaInfo);
        } else if(metaInfo.eventType === 'touch') {
            actionType = touchMap[actionType];
            postData = {
                'messageType': 'Record',
                'messageData': {
                    'widgetPath': widgetPath,
                    'widgetType': 'widget',
                    'actionType': 'touch',
                    'metadata': {
                        'touchEvent': actionType,
                        'point': [parseInt(metaInfo.x), parseInt(metaInfo.y)]
                    }
                }
            };
            metaInfo.type = actionType;
            actionType = 'touch';
        }
        postData.UUID = _getGUID(widgetModel, actionType, widgetType, metaInfo);

        return postData;
    };

    var _getMinimalPath = function(widgetModel, metaInfo) {
        var widgetFullId = _getWidgetPath(widgetModel, metaInfo),
            widgetPath = widgetFullId.split('_').join('.');

        return widgetPath;
    };

    var _getWidgetPathInContainer = function(childNode) {
        var row = $KU.getParentByAttribute(childNode, 'index');
        if(row) {
            var container = row.parentNode.parentNode;
            if(row.getAttribute('kwidgettype') == 'GridNode') {
                container = container.parentNode.parentNode;
            }
            var containerModel = $KU.getModelByNode(container), index;
            if(containerModel.hasSections) {
                index = row.getAttribute('secindex');
            } else {
                index = row.getAttribute('index');
            }
            var id = childNode.getAttribute('id').split(/_(.+)/)[1];
            var containerId = container.getAttribute('id') + '[' + index + ']';

            return containerId + '_' + id;

        }
    };

    var _getWidgetPath = function(widgetModel, metaInfo) {
        var id, widgetModel;

        if(metaInfo.target && metaInfo.target.getAttribute('kcontainerID')) {
            id = _getWidgetPathInContainer(metaInfo.target);
        } else {
            if(metaInfo.target) {
                id = metaInfo.target.getAttribute('id');
            } else {
                widgetNode = $KU.getNodeByModel(widgetModel);
                id = widgetNode.getAttribute('id');
            }
        }

        return id;
    };
    

    var module = {
        initializeConnection: function() {
            
                var testAutomationConfig = appConfig.testAutomation;
                var ipAddress = testAutomationConfig.scriptsURL.split('://')[1].split(':')[0];
                var portNumber = parseInt(testAutomationConfig.webSocketPort);
                window.WebSocket = window.WebSocket || window.MozWebSocket;

                if(!isNaN(portNumber)) {
                    kony.web.logger('log', 'Invalid value provided for test automation web socket client port number. Continuing with default port 9111.');
                    portNumber = 9111;
                }

                connection = new WebSocket('ws://'+ ipAddress + ':' + portNumber);

                connection.onopen = function() {
                    var device = {
                        'messageType': 'DeviceInit',
                        'messageData': {
                            'DeviceID': 'web'
                        },
                        'UUID': _generateGUID()
                    };
                    
                    console.log('JasmineAutomation: Socket open');
                    connection.send(JSON.stringify(device));
                };

                connection.onerror = function (error) {
                    
                    console.log('JasmineAutomation: Socket error');
                    if(this.close) {
                        this.close();
                    }
                    connection = null;
                };

                connection.onmessage = function (message) {
                    
                    console.log('JasmineAutomation: Socket message');
                    var data = JSON.parse(message.data);
                    runMode = data.messageData.Action;

                    switch(runMode) {
                        case 'Record':
                            
                            break;

                        case 'Play':
                            module.runPlayback(data.messageData.AutomationScript);
                            break;

                        case 'Stop':
                            this.close();
                            break;
                    }
                };

                connection.onclose = function(message) {
                    connection = null;
                    console.log('JasmineAutomation: Socket close');
                };
            
        },
        sendRecording: function(widgetModel, actionType, metaInfo) {
            var widgetPath, postData, nonClickableWidgets, widgetType, clickableWidgetInfo, isRecordable = true;

            if(connection && runMode === 'Record') {
                widgetType = (widgetModel.wType || metaInfo.wType).toLowerCase();
                nonClickableWidgets = ['image', 'label'];
                if(metaInfo.eventType === 'uiAction' && nonClickableWidgets.indexOf(widgetType) !== -1) {
                    clickableWidgetInfo = _getClickableParentInfo(widgetModel, metaInfo, widgetType);
                    if(!clickableWidgetInfo) {
                        isRecordable = false;
                    } else {
                        widgetModel = clickableWidgetInfo.widgetModel;
                        widgetType = clickableWidgetInfo.widgetType;
                        metaInfo = clickableWidgetInfo.metaInfo;
                    }
                }
                if(isRecordable) {
                    widgetPath = widgetModel && _getMinimalPath(widgetModel, metaInfo);
                    postData = _getPostData(widgetPath, widgetType, actionType, metaInfo, widgetModel);
                    connection.send(JSON.stringify(postData));
                }
            }
        },
        runRegularAutomation: function(konyAutomationPath) {
            requirejs.config({
                 paths: {"testScripts": konyAutomationPath}
            });
            require(["testScripts/customReporter"], function() {
                jasmine.getEnv().addReporter(userReporter);
                jasmine.getEnv().randomizeTests(false);
                require(["testScripts/automationStartup"], function() {
                });
            });
        },
        runPlayback: function(data) {
            jasmine.getEnv().addReporter(reporter);
            jasmine.getEnv().randomizeTests(false);
            eval(data);
            jasmine.getEnv().execute();
        },
        invokeJasmineAutomation: function(konyAutomationPath) {
            var metaInfoURL = konyAutomationPath + "/metaInfo.json";
            var metaInfoRequest = new kony.net.HttpRequest();

            try {
                metaInfoRequest.timeout = 10000; 
                metaInfoRequest.open(constants.HTTP_METHOD_GET, metaInfoURL, false);
                metaInfoRequest.onReadyStateChange = function () {
                    var automationConfig, enableRecording;
                    if(metaInfoRequest.readyState === constants.HTTP_READY_STATE_DONE) {
                        if(metaInfoRequest.status === 200) {
                            try {
                                if(metaInfoRequest.response && metaInfoRequest.response.length !== 0) {
                                    automationConfig = JSON.parse(metaInfoRequest.response);
                                    enableRecording = automationConfig.automationWindowOpened;
                                    if(enableRecording) {
                                        
                                        module.initializeConnection();
                                    } else {
                                        
                                        module.runRegularAutomation(konyAutomationPath);
                                    }
                                } else {
                                    kony.web.logger('log', 'Invalid meta information found. Continuing with automation scripts playback');
                                }
                            } catch(exception) {
                                kony.web.logger('log', 'Unable to read file metaInfo.json');
                                kony.web.logger('log', 'Exception in metaInfo.json: ' + exception.message);
                            }
                        } else if(metaInfoRequest.status == 404) {
                            kony.web.logger('log', 'No meta information found. There are no automation scripts deployed.');
                        } else {
                            kony.web.logger('log', 'Failed to start automation. Request status: ' + metaInfoRequest.status);
                        }
                    } else {
                        kony.web.logger('log', 'Invoke jasmine automation request readyState: ' +
                                        metaInfoRequest.readyState  + ' request status: ' + metaInfoRequest.status);
                    }
                };
                metaInfoRequest.send();
            } catch(exception) {
                kony.web.logger('log', 'Jasmine metaInfo file request error: ' + exception.message);
            }

        }
    };

 return module;
}());

