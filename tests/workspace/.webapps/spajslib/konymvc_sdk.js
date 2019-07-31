kony.mvc = kony.mvc || {};
kony.mvc.BaseController = function() {
    function BaseController(viewId1) {
        this.viewId = viewId1;
        var viewModel;
        defineGetter(this, "view", function() {
            if (viewModel === undefined) {
                viewModel = this.__initializeView(this);
                if (Object.prototype.hasOwnProperty.call(this, "onViewCreated")) {
                    this["onViewCreated"].apply(this)
                }
            }
            return viewModel
        });
        defineSetter(this, "view", function(val) {
            viewModel = val
        })
    }
    BaseController.prototype.destroy = function() {
        if (this.onDestroy) {
            this.onDestroy()
        }
        this.view = null;
        this.viewId = null
    };
    return BaseController
}();
kony.mvc = kony.mvc || {};
inheritsFrom = function(child, parent) {
    child.prototype = Object.create(parent.prototype)
};
kony.mvc.FormController = function() {
    function FormController(viewId1) {
        var navContext;
        this.navigationMode = 0;
        this.__initializeView = function(objController) {
            var retForm = null;
            var viewFileName = objController.viewId;
            if (Object.prototype.hasOwnProperty.call(this, "onCreateView")) {
                viewFileName = this["onCreateView"].apply(this, null);
                if (typeof viewFileName === "object" && Object.prototype.hasOwnProperty.call(viewFileName, "id")) {
                    retForm = viewFileName
                } else {
                    formCreateFunc = require(viewFileName);
                    var formConfig = formCreateFunc(objController);
                    if (Object.prototype.toString.call(formConfig) === "[object Array]") {
                        formConfig[0]._konyControllerName = objController.Name;
                        retForm = new _kony.mvc.Form2(formConfig[0], formConfig[1], formConfig[2])
                    } else {
                        formConfig._konyControllerName = objController.Name;
                        retForm = new _kony.mvc.Form2(formConfig)
                    }
                }
            } else {
                formCreateFunc = require(viewFileName);
                var formConfig = formCreateFunc(objController);
                if (Object.prototype.toString.call(formConfig) === "[object Array]") {
                    formConfig[0]._konyControllerName = objController.Name;
                    retForm = new _kony.mvc.Form2(formConfig[0], formConfig[1], formConfig[2])
                } else {
                    formConfig._konyControllerName = objController.Name;
                    retForm = new _kony.mvc.Form2(formConfig)
                }
            }
            retForm.mvcInitializeView = false;
            retForm._konyControllerName = objController.Name;
            _kony.mvc.ctrlname2ControllerMap[retForm._konyControllerName] = objController;
            _kony.mvc.viewId2ControllerNameMap[retForm.id] = objController.Name;
            _kony.mvc.viewName2viewId[objController.viewId] = retForm.id;
            retForm.mvcInitializeView = true;
            return retForm
        };
        this.__showView = function(param) {
            if (null != this.view) {
                navContext = param;
                _kony.mvc.showForm(this.view)
            }
        };
        defineGetter(this, "navigationContext", function() {
            return navContext
        });
        defineSetter(this, "navigationContext", function(val) {
            throw new Error("Setter for Navigation context is not allowed.")
        });
        kony.mvc.BaseController.call(this, viewId1)
    }
    inheritsFrom(FormController, kony.mvc.BaseController);
    FormController.prototype.pauseNavigation = function() {
        if (this.navigationMode == 1) {
            this.navigationMode = 2
        } else {
            kony.print("No form navigation is in progress hence cannot be paused.")
        }
    };
    FormController.prototype.resumeNavigation = function() {
        if (this.navigationMode == 2) {
            this.navigationMode = 0;
            this.__showView()
        } else {
            kony.print("No form navigation is in paused state hence cannot be resumed.")
        }
    };
    FormController.prototype.show = function(param, isBackNavigation) {
        this.navigationMode = 1;
        if (this.onNavigate) {
            this.onNavigate.call(this, param, isBackNavigation)
        }
        if (this.navigationMode == 1) {
            this.navigationMode = 0;
            this.__showView(param)
        }
    };
    FormController.prototype.getPreviousForm = function() {
        var prevForm = kony.application.getPreviousForm();
        if (null != prevForm) {
            if (prevForm._konyControllerName) return prevForm.id;
            else return prevForm
        }
        return null
    };
    FormController.prototype.getPreviousFormFriendlyName = function() {
        var prevForm = kony.application.getPreviousForm();
        if (null != prevForm) {
            var fName = kony.mvc.registry.getFriendlyName(prevForm.id);
            if (null != fName) return fName;
            else return prevForm.id
        }
        return null
    };
    FormController.prototype.getCurrentForm = function() {
        var currForm = kony.application.getCurrentForm();
        if (null != currForm) {
            if (currForm._konyControllerName) return currForm.id;
            else return currForm
        }
        return null
    };
    FormController.prototype.getCurrentFormFriendlyName = function() {
        var currForm = kony.application.getCurrentForm();
        var fName = kony.mvc.registry.getFriendlyName(currForm.id);
        if (null != fName) return fName;
        else return currForm.id;
        return null
    };
    FormController.prototype.destroy = function() {
        if (null != this.view) {
            if (this.view.onDestroy) {
                var destroyFunc = this.view.onDestroy;
                this.view.onDestroy = null;
                destroyFunc.call(this)
            }
            _kony.mvc.destroyForm(this.view)
        }
        kony.mvc.BaseController.prototype.destroy.call(this)
    };
    return FormController
}();
_kony = _kony || {};
_kony.mvc = _kony.mvc || {};
kony.mvc = kony.mvc || {};
kony.utils = kony.utils || {};

function accessorDescriptor(field, fun) {
    var desc = {
        enumerable: true,
        configurable: true
    };
    desc[field] = fun;
    return desc
}

function defineGetter(obj, prop, get) {
    if (Object.defineProperty) return Object.defineProperty(obj, prop, accessorDescriptor("get", get));
    if (Object.prototype.__defineGetter__) return obj.__defineGetter__(prop, get);
    throw new Error("browser does not support getters")
}

function defineSetter(obj, prop, set) {
    if (Object.defineProperty) return Object.defineProperty(obj, prop, accessorDescriptor("set", set));
    if (Object.prototype.__defineSetter__) return obj.__defineSetter__(prop, set);
    throw new Error("browser does not support setters")
}
inheritsFrom = function(child, parent) {
    child.prototype = Object.create(parent.prototype)
};
_kony.mvc.ctrlname2ControllerMap = {};
_kony.mvc.viewId2ControllerNameMap = {};
_kony.mvc.formNavigateInProgress = [];
_kony.mvc.viewName2viewId = {};
kony.utils.LoadJSFile = function(fileName) {
    var retForm = null;
    controllerConfig = require(fileName); {
        retForm = controllerConfig
    }
    return retForm
};
kony.application.destroyForm = function(formFriendlyName) {
    var tmpController = null;
    var formID = formFriendlyName;
    var tmpFormName = kony.mvc.registry.get(formID);
    if (null != tmpFormName) {
        formID = tmpFormName
    }
    var fileName = formID;
    if (formID in _kony.mvc.viewName2viewId) {
        formID = _kony.mvc.viewName2viewId[formID]
    }
    if (null != formID) {
        if (formID in _kony.mvc.viewId2ControllerNameMap) {
            var ctrlName = _kony.mvc.viewId2ControllerNameMap[formID];
            if (ctrlName in _kony.mvc.ctrlname2ControllerMap) {
                tmpController = _kony.mvc.ctrlname2ControllerMap[ctrlName];
                if (null != tmpController) tmpController.destroy();
                delete _kony.mvc.ctrlname2ControllerMap[ctrlName];
                delete _kony.mvc.viewId2ControllerNameMap[formID];
                if (fileName in _kony.mvc.viewName2viewId) {
                    delete _kony.mvc.viewName2viewId[fileName]
                }
            }
        }
    }
};
konyNavigate2Form = function(formFriendlyName) {
    var deeplinkFormNav = new kony.mvc.Navigation(formFriendlyName);
    deeplinkFormNav.navigate()
};
_kony.mvc.navigateBack2Form = function(formFriendlyName) {
    var controller = _kony.mvc.GetController(formFriendlyName, true);
    if (!controller) {
        kony.print("########## No controller is found to navigate #####");
        throw "Controller Not Found"
    }
    controller.show.call(controller, null, true)
};
_kony.mvc.destroyController = function(konyControllerName) {
    var tmpController = null;
    if (konyControllerName in _kony.mvc.ctrlname2ControllerMap) {
        tmpController = _kony.mvc.ctrlname2ControllerMap[konyControllerName];
        if (null != tmpController) {
            tmpController.destroy()
        }
        tmpController = null;
        delete _kony.mvc.ctrlname2ControllerMap[konyControllerName]
    }
};
_kony.mvc.executeInJsContext = function(templateView, functionName, subargs) {
    if (templateView._konyControllerName in _kony.mvc.ctrlname2ControllerMap) {
        var viewName = templateView._konyControllerName;
        var tmpController = _kony.mvc.ctrlname2ControllerMap[viewName];
        if (null != tmpController) {
            if (typeof functionName === "string" || functionName instanceof String) {
                tmpController[functionName].apply(tmpController, subargs)
            } else {
                functionName.apply(tmpController, subargs)
            }
        }
    } else {
        var eventobject = null;
        if (subargs.length > 0) {
            var tempCallerObject = subargs[0];
            if (typeof tempCallerObject === "object" && Object.prototype.hasOwnProperty.call(tempCallerObject, "id")) {
                eventobject = tempCallerObject;
                subargs.shift()
            }
        }
        if (null != eventobject) {
            functionName.apply(eventobject, subargs)
        } else {
            if (typeof templateView === "object" && Object.prototype.hasOwnProperty.call(templateView, "id")) {
                functionName.apply(templateView, subargs)
            } else {
                subargs.unshift(templateView);
                functionName.apply(null, subargs)
            }
        }
    }
};
_kony.mvc.assignFunctions2Controller = function(tmpController, controllers) {
    if (controllers.length > 1) {
        var allFunctions = {};
        for (var i = 0; i < controllers.length; i++) {
            var extensionLevel = "extensionLevel" + i;
            tmpController[extensionLevel] = {};
            if (i == 0) tmpController["parent"] = {};
            for (var key in controllers[i]) {
                if (i < controllers.length && _kony.mvc.isValidControllerKey(key)) {
                    if (typeof controllers[i][key] === "function") {
                        tmpController[extensionLevel][key] = controllers[i][key].bind(tmpController);
                        if (i == 0) tmpController["parent"][key] = controllers[i][key].bind(tmpController)
                    } else {
                        tmpController[extensionLevel][key] = controllers[i][key];
                        if (i == 0) tmpController["parent"][key] = controllers[i][key]
                    }
                }
                allFunctions[key] = controllers[i][key]
            }
        }
        for (var key in allFunctions) {
            if (_kony.mvc.isValidControllerKey(key)) {
                if (typeof allFunctions[key] === "function") {
                    tmpController[key] = allFunctions[key].bind(tmpController)
                } else {
                    tmpController[key] = allFunctions[key]
                }
            }
        }
    } else {
        var config2 = controllers[0];
        for (var key in config2) {
            if (_kony.mvc.isValidControllerKey(key) && typeof config2 === "object" && Object.prototype.hasOwnProperty.call(config2, key)) {
                if (typeof config2[key] === "function") {
                    tmpController[key] = config2[key].bind(tmpController)
                } else {
                    tmpController[key] = config2[key]
                }
            }
        }
    }
};
_kony.mvc.isValidControllerKey = function(key) {
    return key != "prototype" && key != "view" && key != "viewId" && key != "userWidgetName" && key != "__initializeView" && key != "name"
};
_konyControllerCounter = 0;
globalObj = this;
var stringToFunction = function(str) {
    var arr = str.split(".");
    var fn = globalObj || this;
    for (var i = 0, len = arr.length; i < len; i++) {
        fn = fn[arr[i]]
    }
    if (typeof fn !== "function") {
        throw new Error("function not found")
    }
    return fn
};
_kony.mvc.GetControllerAsync = function(formFriendlyName, successCallBack, errorCallback) {
    var tmpController = null,
        ctrlName = null,
        levels = null,
        i = 0,
        formID = formFriendlyName,
        requireFileList = [],
        controllerTypePath = null,
        tmpControllerName = null,
        controllerType = null,
        controllerTypeFile = null,
        extensionControllersList = null,
        tmpFormName = kony.mvc.registry.get(formID);
    if (null != tmpFormName) {
        formID = tmpFormName
    }
    if (formID in _kony.mvc.viewName2viewId) {
        formID = _kony.mvc.viewName2viewId[formID]
    }
    if (null != formID) {
        if (formID in _kony.mvc.viewId2ControllerNameMap) {
            ctrlName = _kony.mvc.viewId2ControllerNameMap[formID];
            if (ctrlName in _kony.mvc.ctrlname2ControllerMap) {
                tmpController = _kony.mvc.ctrlname2ControllerMap[ctrlName]
            }
            successCallBack(tmpController)
        } else {
            requireFileList = [];
            tmpControllerName = kony.mvc.registry.getControllerName(formFriendlyName);
            controllerType = kony.mvc.registry.getControllerType(formFriendlyName);
            controllerTypeFile = kony.mvc.registry.getControllerTypeFile(formFriendlyName);
            extensionControllersList = kony.mvc.registry.getControllerExtName(formFriendlyName);
            if (null == tmpControllerName) {
                tmpControllerName = formID + "Controller"
            }
            requireFileList.push(tmpControllerName);
            if (null != controllerType) {
                if (null == controllerTypeFile) {
                    controllerTypePath = controllerType.replace(/\./g, "/")
                } else {
                    controllerTypePath = controllerTypeFile.replace(/\./g, "/")
                }
                requireFileList.push(controllerTypePath)
            }
            if (null != extensionControllersList) {
                if (typeof extensionControllersList === "string") {
                    requireFileList.push(extensionControllersList)
                } else {
                    levels = extensionControllersList.length;
                    for (i = 0; i < levels; i++) {
                        if (null != extensionControllersList[i]) {
                            requireFileList.push(extensionControllersList[i])
                        } else {
                            break
                        }
                    }
                }
            }
            requireFileList.push(_kony.mvc.registryMap[formFriendlyName].name);
            require(requireFileList, function(config) {
                var ctor = null;
                if (null == controllerType) {
                    tmpController = new kony.mvc.FormController(formID)
                } else {
                    ctor = stringToFunction(controllerType);
                    tmpController = new ctor(formID)
                }
                tmpController.Name = tmpControllerName + "_" + (++_konyControllerCounter).toString();
                _kony.mvc.loadAllExtensionControllers(tmpController, config, formFriendlyName);
                successCallBack(tmpController)
            }, function(err) {
                errorCallback(err)
            })
        }
    }
};
_kony.mvc.GetController = function(formFriendlyName, isForm) {
    var tmpController = null;
    var formID = formFriendlyName;
    var tmpFormName = kony.mvc.registry.get(formID);
    if (null != tmpFormName) {
        formID = tmpFormName
    }
    if (formID in _kony.mvc.viewName2viewId) {
        formID = _kony.mvc.viewName2viewId[formID]
    }
    if (null != formID) {
        if (isForm && formID in _kony.mvc.viewId2ControllerNameMap) {
            var ctrlName = _kony.mvc.viewId2ControllerNameMap[formID];
            if (ctrlName in _kony.mvc.ctrlname2ControllerMap) {
                tmpController = _kony.mvc.ctrlname2ControllerMap[ctrlName]
            }
        } else {
            var tmpControllerName = kony.mvc.registry.getControllerName(formFriendlyName);
            if (null == tmpControllerName) {
                tmpControllerName = formID + "Controller"
            }
            var config = kony.utils.LoadJSFile(tmpControllerName);
            if (isForm) {
                var controllerType = kony.mvc.registry.getControllerType(formFriendlyName);
                if (null == controllerType) {
                    tmpController = new kony.mvc.FormController(formID)
                } else {
                    var controllerTypeFile = kony.mvc.registry.getControllerTypeFile(formFriendlyName);
                    var controllerTypePath = null;
                    if (null == controllerTypeFile) {
                        controllerTypePath = controllerType.replace(/\./g, "/")
                    } else {
                        controllerTypePath = controllerTypeFile.replace(/\./g, "/")
                    }
                    kony.utils.LoadJSFile(controllerTypePath);
                    var ctor = stringToFunction(controllerType);
                    tmpController = new ctor(formID)
                }
            } else {
                var controllerType = kony.mvc.registry.getControllerType(formFriendlyName);
                if (null == controllerType) {
                    tmpController = new kony.mvc.TemplateController(formID)
                } else {
                    var controllerTypeFile = kony.mvc.registry.getControllerTypeFile(formFriendlyName);
                    var controllerTypePath = null;
                    if (null == controllerTypeFile) {
                        controllerTypePath = controllerType.replace(/\./g, "/")
                    } else {
                        controllerTypePath = controllerTypeFile.replace(/\./g, "/")
                    }
                    kony.utils.LoadJSFile(controllerTypePath);
                    var ctor = stringToFunction(controllerType);
                    tmpController = new ctor(formID)
                }
            }
            tmpController.Name = tmpControllerName + "_" + (++_konyControllerCounter).toString();
            _kony.mvc.loadAllExtensionControllers(tmpController, config, formFriendlyName);
            var x = tmpController.view
        }
    }
    return tmpController
};
_kony.mvc.loadAllExtensionControllers = function(tmpController, config, formFriendlyName) {
    var controllers = [];
    controllers.push(config);
    var config2 = {};
    var tmpControllerName2 = kony.mvc.registry.getControllerExtName(formFriendlyName);
    if (null != tmpControllerName2) {
        if (typeof tmpControllerName2 === "string") {
            config2 = kony.utils.LoadJSFile(tmpControllerName2);
            controllers.push(config2)
        } else {
            var levels = tmpControllerName2.length;
            for (var i = 0; i < levels; i++) {
                if (null != tmpControllerName2[i]) {
                    config2 = kony.utils.LoadJSFile(tmpControllerName2[i]);
                    controllers.push(config2)
                } else {
                    break
                }
            }
        }
    }
    _kony.mvc.assignFunctions2Controller(tmpController, controllers)
};
_kony.mvc.CreateMasterWidgetController = function(userWidgetName, uwInstanceName, args) {
    var tmpController = null;
    var formID = userWidgetName;
    var tmpFormName = kony.mvc.registry.get(formID);
    if (null != tmpFormName) {
        formID = tmpFormName
    }
    if (null != formID) {
        var tmpControllerName = kony.mvc.registry.getControllerName(userWidgetName);
        if (null == tmpControllerName) {
            tmpControllerName = formID + "Controller"
        }
        var uwPath = userWidgetName.replace(/\./g, "/");
        var config = kony.utils.LoadJSFile(uwPath + "/" + tmpControllerName);
        var controllerType = kony.mvc.registry.getControllerType(userWidgetName);
        if (null == controllerType) {
            tmpController = new kony.mvc.MasterController(userWidgetName, formID, uwInstanceName)
        } else {
            var controllerTypeFile = kony.mvc.registry.getControllerTypeFile(userWidgetName);
            var controllerTypePath = null;
            if (null == controllerTypeFile) {
                controllerTypePath = controllerType.replace(/\./g, "/")
            } else {
                controllerTypePath = controllerTypeFile.replace(/\./g, "/")
            }
            kony.utils.LoadJSFile(controllerTypePath);
            var ctor = stringToFunction(controllerType);
            tmpController = new ctor(userWidgetName, formID, uwInstanceName)
        }
        tmpController.args = args;
        tmpController.Name = tmpControllerName + "_" + (++_konyControllerCounter).toString();
        var masterType = constants.MASTER_TYPE_USERWIDGET;
        if (Object.prototype.toString.call(args) === "[object Array]") {
            if (null != args[0]["masterType"]) {
                masterType = args[0]["masterType"]
            }
        } else {
            masterType = args["masterType"]
        }
        tmpController.masterType = masterType;
        if (masterType == constants.MASTER_TYPE_USERWIDGET) {
            _kony.mvc.loadAllExtensionControllers(tmpController, config, userWidgetName)
        } else {
            var controllers = [];
            controllers.push(config);
            _kony.mvc.assignFunctions2Controller(tmpController, controllers)
        }
        if (tmpController.initializeProperties) {
            tmpController.initializeProperties()
        }
        if (Object.prototype.hasOwnProperty.call(tmpController, "constructor")) {
            tmpController["constructor"].apply(tmpController, args)
        }
    }
    return tmpController
};
_kony.mvc.initializeSubViewController = function(friendlyName) {
    var tmpController = _kony.mvc.GetController(friendlyName, false);
    return tmpController.view
};
_kony.mvc.initializeMasterController = function(userWidgetName, uwInstanceName, args) {
    var tmpController = _kony.mvc.CreateMasterWidgetController(userWidgetName, uwInstanceName, args);
    return tmpController.view
};
_kony.mvc.initializeFormViewController = function(friendlyName) {
    var tmpController = _kony.mvc.GetController(friendlyName, true);
    return tmpController.view
};
_kony = _kony || {};
_kony.mvc = _kony.mvc || {};
_kony.mvc.setData2UserWidget = function(userWidgetInstance, newClonedRowView, data, isSetViewProps) {
    var controllerName = userWidgetInstance._konyControllerName;
    if (controllerName in _kony.mvc.ctrlname2ControllerMap) {
        var tmpController = _kony.mvc.ctrlname2ControllerMap[controllerName];
        if (null == tmpController) return;
        var tempView = tmpController.view;
        tmpController.view = newClonedRowView;
        var xx = tmpController.view.bottom;
        if (typeof data === "object") {
            for (var m in data) {
                if (Object.prototype.hasOwnProperty.call(tmpController, m)) {
                    tmpController[m] = data[m]
                } else if (isSetViewProps) {
                    tempView[m] = data[m]
                }
            }
        }
        tmpController.view = tempView
    }
};
_kony.mvc.setMasterWidgetContract = function(userWidgetInstance, tmpController) {
    var lstFunctions = Object.getOwnPropertyNames(tmpController).filter(function(p) {
        return typeof tmpController[p] === "function" && p != "__initializeView"
    });
    _kony.mvc.setFunctions(userWidgetInstance, lstFunctions, tmpController);
    var lstProperties = Object.getOwnPropertyNames(tmpController).filter(function(p) {
        return typeof tmpController[p] != "function" && p != "viewId" && p != "view" && p != "userWidgetName"
    });
    _kony.mvc.setProperties(userWidgetInstance, lstProperties, tmpController);
    var view111 = tmpController.view;
    var lstFunctionsOnMaster = _kony.mvc.getMethods(userWidgetInstance);
    var lstFunctions = _kony.mvc.getMethods(view111).filter(function(p) {
        return lstFunctionsOnMaster.indexOf(p) <= -1
    });
    _kony.mvc.setFunctions(userWidgetInstance, lstFunctions, view111, true);
    var lstPropertiesOnMaster = _kony.mvc.getProperties(userWidgetInstance);
    var lstProperties = _kony.mvc.getProperties(view111).filter(function(p) {
        return lstPropertiesOnMaster.indexOf(p) <= -1
    });
    _kony.mvc.setProperties(userWidgetInstance, lstProperties, view111);
    var children = _kony.mvc.getAllChildren(view111);
    _kony.mvc.setProperties(userWidgetInstance, children, view111)
};
_kony.mvc.getAllChildren = function(viewInstance) {
    var childIds = [];
    if (viewInstance.widgets) {
        var children = viewInstance.widgets();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            childIds.push(child.id);
            if (child._konyControllerName == null) {
                var grandChildren = _kony.mvc.getAllChildren(child);
                for (var j = 0; j < grandChildren.length; j++) {
                    childIds.push(grandChildren[j])
                }
            }
        }
    }
    return childIds
};
_kony.mvc.getMethods = function(obj) {
    var res = Object.getOwnPropertyNames(obj).filter(function(p) {
        return typeof obj[p] === "function"
    });
    for (var m in obj) {
        if (typeof obj[m] == "function") {
            res.push(m)
        }
    }
    return res
};
_kony.mvc.getProperties = function(obj) {
    var res = Object.getOwnPropertyNames(obj).filter(function(p) {
        return typeof obj[p] != "function"
    });
    for (var m in obj) {
        if (typeof obj[m] != "function") {
            res.push(m)
        }
    }
    return res
};
_kony.mvc.setMasterContract = function(userWidgetInstance) {
    var config = {};
    if (null == userWidgetInstance || userWidgetInstance._konyInitialized) return;
    var usInstanceName = userWidgetInstance._konyControllerName;
    if (usInstanceName in _kony.mvc.ctrlname2ControllerMap) {
        var tmpController = _kony.mvc.ctrlname2ControllerMap[usInstanceName];
        if (null == tmpController) return;
        var xx = tmpController.view.bottom;
        if (tmpController.masterType == constants.MASTER_TYPE_USERWIDGET) {
            if (appConfig && appConfig.testAutomation && appConfig.testAutomation.scriptsURL) {
                _kony.mvc.setMasterWidgetContract(userWidgetInstance, tmpController)
            }
            _kony.mvc.setUserWidgetContract(userWidgetInstance, tmpController)
        } else {
            _kony.mvc.setMasterWidgetContract(userWidgetInstance, tmpController)
        }
        userWidgetInstance._konyInitialized = true
    }
};
_kony.mvc.setUserWidgetContract = function(userWidgetInstance, tmpController) {
    var userWidgetName = tmpController.userWidgetName;
    var uwPath = userWidgetName;
    var n = userWidgetName.lastIndexOf(".");
    var configFileName = userWidgetName + "Config";
    if (n >= 0) {
        configFileName = configFileName.substring(n + 1);
        uwPath = userWidgetName.replace(/\./g, "/")
    }
    var configFileName = uwPath + "/" + configFileName;
    var master = require(configFileName);
    if (null == master) return;
    if (null != master["properties"]) {
        var propertiesOnMaster = master["properties"];
        _kony.mvc.setProperties(userWidgetInstance, propertiesOnMaster, tmpController)
    }
    if (null != master["apis"]) {
        var apisOnMaster = master["apis"];
        _kony.mvc.setFunctions(userWidgetInstance, apisOnMaster, tmpController)
    }
    if (null != master["events"]) {
        var eventsOnMaster = master["events"];
        _kony.mvc.setEvents(userWidgetInstance, eventsOnMaster, tmpController)
    }
    return
};
_kony.mvc.setProperties = function(userWidgetInstance, properties, tmpController) {
    if (null == properties || null == userWidgetInstance || null == tmpController) return;
    if (userWidgetInstance === tmpController) return;
    for (i = 0; i < properties.length; i++) {
        var oneProperty = properties[i];
        if (typeof oneProperty === "string") {
            oneProperty = {
                name: oneProperty,
                writable: true,
                enumerable: true,
                configurable: true
            }
        }
        var propName = oneProperty["name"];
        defineGetter(userWidgetInstance, propName, function(propertyName) {
            return function() {
                return tmpController[propertyName]
            }
        }(propName));
        if (null != oneProperty["writable"] && oneProperty["writable"]) {
            defineSetter(userWidgetInstance, propName, function(propertyName) {
                return function(val) {
                    tmpController[propertyName] = val
                }
            }(propName))
        }
    }
};
_kony.mvc.setFunctions = function(userWidgetInstance, lstAPIs, tmpController, isView) {
    if (null == lstAPIs || null == userWidgetInstance || null == tmpController) return;
    for (i = 0; i < lstAPIs.length; i++) {
        var propName = lstAPIs[i];
        if (isView) {
            userWidgetInstance[propName] = function(propertyName) {
                return function() {
                    tmpController[propertyName].apply(tmpController, arguments)
                }
            }(propName)
        } else {
            userWidgetInstance[propName] = tmpController[propName].bind(tmpController)
        }
    }
};
_kony.mvc.setEvents = function(userWidgetInstance, lstEvents, tmpController) {
    if (null == lstEvents || null == userWidgetInstance || null == tmpController) return;
    if (userWidgetInstance === tmpController) return;
    for (i = 0; i < lstEvents.length; i++) {
        var propName = lstEvents[i];
        defineGetter(userWidgetInstance, propName, function(propertyName) {
            return function() {
                return tmpController[propertyName]
            }
        }(propName));
        defineSetter(userWidgetInstance, propName, function(propertyName) {
            return function(val) {
                tmpController[propertyName] = val
            }
        }(propName))
    }
};
kony.mvc = kony.mvc || {};
kony.utils = kony.utils || {};
kony.mvc.Navigation = function() {
    function Navigation(formname, objModel) {
        var model = objModel;
        this.getModel = function() {
            if (null == model) {
                var controller = _kony.mvc.GetController(formFriendlyName, true);
                if (!controller) {
                    kony.print("########## No controller is found to navigate #####");
                    throw "Controller Not Found"
                }
                if (controller.getModel) model = controller.getModel()
            }
            return model
        };
        this.setModel = function(objModel) {
            model = objModel
        };
        var formFriendlyName = formname;
        this.navigate = function(param) {
            var syncLoad = kony.application.getApplicationBehavior("FormControllerSyncLoad");
            if (null == syncLoad || true == syncLoad) {
                var controller = _kony.mvc.GetController(formFriendlyName, true);
                if (!controller) {
                    kony.print("########## No controller is found to navigate for form " + formFriendlyName);
                    throw "Controller Not Found"
                }
                if (null == model) {
                    if (controller.getModel) model = controller.getModel.call(controller)
                }
                if (controller.setModel) controller.setModel.call(controller, model);
                controller.show.call(controller, param, false)
            } else {
                var navigateCounter = _kony.mvc.formNavigateInProgress.length;
                _kony.mvc.formNavigateInProgress.push("Form" + navigateCounter);
                if (navigateCounter == 0) {
                    navigateCallback(formFriendlyName, param, navigateCounter)
                } else {
                    kony.timer.schedule("Form" + navigateCounter, function() {
                        if (_kony.mvc.formNavigateInProgress.indexOf("Form" + (navigateCounter - 1)) < 0) {
                            kony.timer.cancel("Form" + navigateCounter);
                            navigateCallback(formFriendlyName, param, navigateCounter)
                        }
                    }, 1, true)
                }
            }
        };
        var navigateCallback = function(formFriendlyName, param, navigateCounter) {
            _kony.mvc.GetControllerAsync(formFriendlyName, function(controller) {
                var index;
                if (!controller) {
                    kony.print("########## No controller is found to navigate for form " + formFriendlyName);
                    throw "Controller Not Found"
                }
                if (null == model) {
                    if (controller.getModel) model = controller.getModel.call(controller)
                }
                if (controller.setModel) controller.setModel.call(controller, model);
                controller.show.call(controller, param, false);
                index = _kony.mvc.formNavigateInProgress.indexOf("Form" + navigateCounter);
                _kony.mvc.formNavigateInProgress.splice(index, 1)
            }, function(err) {
                kony.print("Error: Unable to load Form Controller -" + err);
                throw "Controller or Form Not Found"
            })
        }
    }
    return Navigation
}();
kony.mvc = kony.mvc || {};
inheritsFrom = function(child, parent) {
    child.prototype = Object.create(parent.prototype)
};
kony.mvc.TemplateController = function(viewId1) {
    this.__initializeView = function(objController) {
        var retForm = null;
        var viewFileName = objController.viewId;
        if (Object.prototype.hasOwnProperty.call(this, "onCreateView")) {
            viewFileName = this["onCreateView"].apply(this, null);
            if (typeof viewFileName === "object" && Object.prototype.hasOwnProperty.call(viewFileName, "id")) {
                retForm = viewFileName
            } else {
                formCreateFunc = require(viewFileName);
                retForm = formCreateFunc(objController)
            }
        } else {
            formCreateFunc = require(viewFileName);
            retForm = formCreateFunc(objController)
        }
        retForm._konyControllerName = objController.Name;
        _kony.mvc.ctrlname2ControllerMap[retForm._konyControllerName] = objController;
        _kony.mvc.viewId2ControllerNameMap[retForm.id] = objController.Name;
        _kony.mvc.viewName2viewId[objController.viewId] = retForm.id;
        return retForm
    };
    kony.mvc.BaseController.call(this, viewId1);
    this.executeOnParent = function(callback, args) {
        this.view.executeOnParent(callback, args)
    };
    this.getCurrentView = function(childWidget) {
        while (childWidget.parent != null) {
            if (childWidget.id == this.view.id) break;
            childWidget = childWidget.parent
        }
        return childWidget
    }
};
inheritsFrom(kony.mvc.TemplateController, kony.mvc.BaseController);
kony.mvc.MasterController = function(uwName, viewId1, newID) {
    this.__initializeView = function(objController) {
        var retForm = null;
        var uwPath = this.userWidgetName.replace(/\./g, "/");
        var viewFileName = objController.viewId;
        if (Object.prototype.hasOwnProperty.call(this, "onCreateView")) {
            viewFileName = this["onCreateView"].apply(this, null);
            if (typeof viewFileName === "object" && Object.prototype.hasOwnProperty.call(viewFileName, "id")) {
                retForm = viewFileName
            } else {
                var formCreateFunc = kony.utils.LoadJSFile(uwPath + "/" + viewFileName);
                retForm = formCreateFunc(objController)
            }
        } else {
            var formCreateFunc = kony.utils.LoadJSFile(uwPath + "/" + viewFileName);
            retForm = formCreateFunc(objController)
        }
        retForm._konyControllerName = objController.Name;
        _kony.mvc.ctrlname2ControllerMap[retForm._konyControllerName] = objController;
        if (newID != null) {
            _kony.mvc.viewId2ControllerNameMap[newID] = objController.Name;
            _kony.mvc.viewName2viewId[objController.viewId] = newID
        } else {
            _kony.mvc.viewId2ControllerNameMap[retForm.id] = objController.Name;
            _kony.mvc.viewName2viewId[objController.viewId] = retForm.id
        }
        return retForm
    };
    this.userWidgetName = uwName;
    this.getCurrentView = function(childWidget) {
        while (childWidget.parent != null) {
            if (childWidget.id == this.view.id) break;
            childWidget = childWidget.parent
        }
        return childWidget
    };
    kony.mvc.BaseController.call(this, viewId1)
};
inheritsFrom(kony.mvc.MasterController, kony.mvc.BaseController);
_kony = _kony || {};
_kony.mvc = _kony.mvc || {};
if (kony.mvc == undefined) kony.mvc = {};
if (kony.mvc.registry == undefined) kony.mvc.registry = {};
_kony.mvc.registryMap = {};
kony.mvc.registry.add = function(friendlyName, formid, formCtrllrName, formCtrllrExtName) {
    if (friendlyName in _kony.mvc.registryMap) {
        kony.print("########## A form with friendly name " + friendlyName + " is already exists in registry.")
    } else {
        var formProps = {};
        formProps["name"] = formid;
        if (typeof formCtrllrName === "string") {
            formProps["controllerName"] = formCtrllrName;
            formProps["controllerExtName"] = formCtrllrExtName
        } else {
            for (var propName in formCtrllrName) {
                if (propName != "name") {
                    formProps[propName] = formCtrllrName[propName]
                }
            }
        }
        _kony.mvc.registryMap[friendlyName] = formProps
    }
};
kony.mvc.registry.remove = function(friendlyName) {
    if (friendlyName in _kony.mvc.registryMap) {
        delete _kony.mvc.registryMap[friendlyName]
    } else {
        kony.print("########## No form with friendly name " + friendlyName + " is found in registry")
    }
};
kony.mvc.registry.get = function(friendlyName) {
    if (friendlyName in _kony.mvc.registryMap) {
        var formProps = _kony.mvc.registryMap[friendlyName];
        if (null != formProps) {
            return formProps["name"]
        }
    } else {
        kony.print("########## No form with friendly name " + friendlyName + " is found in registry");
        return null
    }
};
kony.mvc.registry.getFriendlyName = function(formID) {
    for (var friendlyName in _kony.mvc.registryMap) {
        if (_kony.mvc.registryMap.hasOwnProperty(friendlyName)) {
            var formProps = _kony.mvc.registryMap[friendlyName];
            if (null != formProps) {
                if (formID == formProps["name"]) return friendlyName
            }
        }
    }
    return null
};
kony.mvc.registry.getControllerName = function(friendlyName) {
    if (friendlyName in _kony.mvc.registryMap) {
        var formProps = _kony.mvc.registryMap[friendlyName];
        if (null != formProps) {
            return formProps["controllerName"]
        }
    } else {
        kony.print("########## No form with friendly name " + friendlyName + " is found in registry");
        return null
    }
};
kony.mvc.registry.getControllerType = function(friendlyName) {
    if (friendlyName in _kony.mvc.registryMap) {
        var formProps = _kony.mvc.registryMap[friendlyName];
        if (null != formProps) {
            return formProps["controllerType"]
        }
    } else {
        kony.print("########## No form with friendly name " + friendlyName + " is found in registry");
        return null
    }
};
kony.mvc.registry.getControllerTypeFile = function(friendlyName) {
    if (friendlyName in _kony.mvc.registryMap) {
        var formProps = _kony.mvc.registryMap[friendlyName];
        if (null != formProps) {
            return formProps["controllerTypeFileName"]
        }
    } else {
        kony.print("########## No form with friendly name " + friendlyName + " is found in registry");
        return null
    }
};
kony.mvc.registry.getControllerExtName = function(friendlyName) {
    if (friendlyName in _kony.mvc.registryMap) {
        var formProps = _kony.mvc.registryMap[friendlyName];
        if (null != formProps) {
            return formProps["controllerExtName"]
        }
    } else {
        kony.print("########## No form with friendly name " + friendlyName + " is found in registry");
        return null
    }
};
kony = kony || {};
kony.model = kony.model || {};
kony.model.Util = kony.model.Util || {};
kony.model.Util.perfStats = [];
kony.model.Util.perftimecal = function(startTag, endTag, startTS, endTS) {
    if (kony.model.Util.isPerfTestReq === false) return;
    var formattedStartTS = startTS.getMinutes() + ":" + startTS.getSeconds() + ":" + startTS.getMilliseconds();
    var formattedEndTS = endTS.getMinutes() + ":" + endTS.getSeconds() + ":" + endTS.getMilliseconds();
    var starttime = startTS.getTime();
    var endtime = endTS.getTime();
    var res = endtime - starttime;
    var caliculatedTS = new Date;
    caliculatedTS.setTime(res);
    var formattedCalicutedTS = caliculatedTS.getUTCMinutes() + ":" + caliculatedTS.getUTCSeconds() + ":" + caliculatedTS.getUTCMilliseconds();
    kony.model.Util.perfStats.push(startTag + " " + formattedStartTS);
    kony.model.Util.perfStats.push(endTag + " " + formattedEndTS);
    kony.model.Util.perfStats.push("Total time taken is >> " + formattedCalicutedTS)
};
kony.model.Util.perlogout = function() {
    if (kony.model.Util.isPerfTestReq === false) return;
    for (var i = 0; i < kony.model.Util.perfStats.length; i++) {
        kony.model.log.info("[PERF][INFO] :" + kony.model.Util.perfStats[i])
    }
    kony.model.Util.perfStats = []
};
kony.model.Util.matchIgnoreCase = function(string1, string2) {
    if (string1 === null || string2 === null || string1 === undefined || string2 === undefined) {
        return false
    } else if (string1.toUpperCase() === string2.toUpperCase()) {
        return true
    } else {
        return false
    }
};
kony.model.Util.clone = function(src) {
    return clone(src);

    function clone(src) {
        function mixin(dest, source, copyFunc) {
            var name, s, i, empty = {};
            for (name in source) {
                s = source[name];
                if (!(name in dest) || dest[name] !== s && (!(name in empty) || empty[name] !== s)) {
                    dest[name] = copyFunc ? copyFunc(s) : s
                }
            }
            return dest
        }
        if (!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]") {
            return src
        }
        if (src.nodeType && "cloneNode" in src) {
            return src.cloneNode(true)
        }
        if (src instanceof Date) {
            return new Date(src.getTime())
        }
        if (src instanceof RegExp) {
            return new RegExp(src)
        }
        var r, i, l;
        if (src instanceof Array) {
            r = [];
            for (i = 0, l = src.length; i < l; ++i) {
                if (i in src) {
                    r.push(clone(src[i]))
                }
            }
        } else {
            r = src.constructor ? new src.constructor : {}
        }
        return mixin(r, src, clone)
    }
};
kony.model.Util.mergeJSONs = function(json1, json2) {
    if (!json1) return json2;
    if (!json2) return json1;
    var result = {};
    for (var key in json1) {
        result[key] = json1[key]
    }
    for (var key in json2)
        if (!result.hasOwnProperty(key)) result[key] = json2[key];
    return result
};
kony = kony || {};
kony.model = kony.model || {};
kony.model.log = kony.model.log || {};
kony.model.constants = kony.model.constants || {};
kony.model.constants.isForTesting = undefined;
kony.model.constants.TestConstants = {};
kony.model.constants["picklist"] = "picklist";
kony.model.constants["reference"] = "reference";
kony.model.constants["picklistmultiselect"] = "picklistmultiselect";
kony.model.constants["extendedfield"] = "extendedfield";
kony.model.constants["entityMetadataMap"] = {};
kony.model.constants["INTEGER_MIN_VALUE"] = -2147483648;
kony.model.constants["INTEGER_MAX_VALUE"] = 2147483647;
kony.model.constants.credStoreUsername = "username";
kony.model.constants.credStorePassword = "password";
kony.model.constants.credStoreOptions = "options";
kony.model.constants.credStoreIdentityService = "identityServiceName";
kony.model.constants.credStoreName = "credentials";
kony.model.constants.OperationType = {
    NO_FILTER: 1,
    FILTER_BY_PRIMARY_KEY: 2,
    ADD: 3
};
kony.model.constants.ValidationType = {
    CREATE: 1,
    UPDATE: 1
};
kony.model.constants.MatchType = {
    EQUALS: {
        value: "=",
        name: "EQUALS"
    },
    GREATER: {
        value: ">",
        name: "GREATER"
    },
    GREATEREQUAL: {
        value: ">=",
        name: "GREATEREQUAL"
    },
    LESS: {
        value: "<",
        name: "LESS"
    },
    LESSEQUAL: {
        value: "<=",
        name: "LESSEQUAL"
    },
    STARTSWITH: {
        value: "LIKE",
        name: "STARTSWITH"
    },
    CONTAINS: {
        value: "LIKE",
        name: "CONTAINS"
    },
    LIKE: {
        value: "LIKE",
        name: "LIKE"
    },
    ENDSWITH: {
        value: "LIKE",
        name: "ENDSWITH"
    },
    NOTEQUAL: {
        value: "<>",
        name: "NOTEQUAL"
    },
    ISNULL: {
        value: "IS NULL",
        name: "ISNULL"
    },
    ISNOTNULL: {
        value: "IS NOT NULL",
        name: "ISNOTNULL"
    }
};
kony = kony || {};
kony.model = kony.model || {};
kony.model.DataStore = function() {
    function DataStore() {
        var inMemoryData = {};
        this.getDataByKey = function(key) {
            if (inMemoryData.hasOwnProperty(key)) return inMemoryData[key]
        };
        this.setDataByKey = function(key, data) {
            inMemoryData[key] = data
        }
    }
    DataStore.prototype.storeData = function(key, data, inMemory) {
        if (inMemory == true) this.setDataByKey(key, data);
        else kony.store.setItem(key, data)
    };
    DataStore.prototype.getData = function(key, inMemory) {
        if (inMemory == true) return this.getDataByKey(key);
        else return kony.store.getItem(key)
    };
    return DataStore
}();
kony.model.AuthenticationManager = function() {
    function AuthenticationManager() {}
    AuthenticationManager.prototype.authenticate = function(params, successCallback, errorCallback) {
        try {
            var appFactoryInstance = kony.model.ApplicationContext.getFactorySharedInstance();
            var authParams = params["authParams"];
            var options = params["options"];
            var identityServiceName = params["identityServiceName"];
            var appLoginDetails = {
                authParams: authParams,
                options: options,
                identityServiceName: identityServiceName
            };
            var dataStoreObj = kony.model.ApplicationContext.getFactorySharedInstance().createDataStoreObject();
            dataStoreObj.storeData("UserCredentials", appLoginDetails, true);
            kony.model.ApplicationContext.setUserCredentialObj(dataStoreObj);
            authenticateService()
        } catch (e) {
            kony.model.log.error("Error while authentication: " + e.toString());
            var exception = appFactoryInstance.createExceptionObject(kony.model.ExceptionCode.CD_ERROR_OFFLINE_LOGIN_FAILURE, kony.model.ExceptionCode.MSG_ERROR_OFFLINE_LOGIN_FAILURE);
            errorCallback(exception)
        }

        function authenticateService() {
            kony.model.log.info("Getting SDK IdentityService");
            var identityClient = kony.sdk.getCurrentInstance().getIdentityService(identityServiceName);
            kony.model.ApplicationContext.setIdentityService(identityClient);
            kony.model.log.info("Making SDK login Call");
            identityClient.login(authParams, authSuccess, authError)
        }

        function authSuccess() {
            kony.model.log.info("SDK login Success");
            var isAppSyncEnabled = options["access"] === "offline" ? true : false;
            kony.model.ApplicationContext.setOnlineStatus(!isAppSyncEnabled);
            successCallback()
        }

        function authError(err) {
            kony.model.log.error("SDK login Failed " + err);
            var exception = appFactoryInstance.createExceptionObject(kony.model.ExceptionCode.CD_ERROR_LOGIN_FAILURE, kony.model.ExceptionCode.MSG_ERROR_LOGIN_FAILURE, err);
            errorCallback(exception)
        }
    };
    AuthenticationManager.prototype.saveUserDetails = function() {
        var storeObj = kony.model.ApplicationContext.getFactorySharedInstance().createDataStoreObject();
        var credentialObj = kony.model.ApplicationContext.getUserCredentialObj().getData("UserCredentials", true);
        var authParams = credentialObj["authParams"];
        var username = authParams["userid"];
        var options = credentialObj["options"];
        var identityServiceName = credentialObj["identityServiceName"];
        var credentials_store = {};
        credentials_store[kony.model.constants.credStoreUsername] = username;
        credentials_store[kony.model.constants.credStoreOptions] = options;
        credentials_store[kony.model.constants.credStoreIdentityService] = identityServiceName;
        storeObj.storeData(kony.model.constants.credStoreName, credentials_store)
    };
    AuthenticationManager.prototype.getSavedUserDetails = function() {
        var storeObj = kony.model.ApplicationContext.getFactorySharedInstance().createDataStoreObject();
        var credentialObj = storeObj.getData(kony.model.constants.credStoreName);
        return credentialObj
    };
    AuthenticationManager.prototype.execute = function(params, success, error) {
        this.authenticate(params, success, error)
    };
    return AuthenticationManager
}();
kony = kony || {};
kony.model = kony.model || {};
kony.model.AppFactory = function() {
    function AppFactory() {}
    AppFactory.prototype.createExceptionObject = function(errCode, errMsg, errorObj) {
        return new kony.model.Exception(errCode, errMsg, errorObj)
    };
    AppFactory.prototype.createSyncManagerObject = function() {
        return new kony.model.SyncManagerMF
    };
    AppFactory.prototype.createDataObject = function(data) {
        return new kony.model.Data(data)
    };
    AppFactory.prototype.createModelObject = function(context, entityName, serviceName, options) {
        if (entityName) {
            var modelObj;
            var modelHandler = kony.model[serviceName][entityName + "Model"];
            var modelExtensionHandler = kony.model[serviceName][entityName + "ModelExtension"];
            var metadataStore = context.getMetadataStore();
            var entityMetadata = metadataStore.getEntityMetadata(entityName, serviceName, options);
            if (entityMetadata) {
                var configOptions = {};
                configOptions["serviceName"] = serviceName;
                configOptions["options"] = options;
                modelObj = new modelHandler(context, entityMetadata, configOptions)
            } else {
                kony.model.log.error("error in entity controller factory, entity meta data for " + entityName + " undefined")
            }
            if (modelExtensionHandler !== undefined && typeof modelExtensionHandler === "function") {
                modelExtensionObj = new modelExtensionHandler(modelObj);
                modelObj.setControllerExtensionObject(modelExtensionObj)
            } else {
                kony.model.log.error("error in entity controller factory, model Extension Object for " + entityName + " is undefined")
            }
            return modelObj
        }
    };
    AppFactory.prototype.createViewObject = function(modelConfig, konyForm) {
        return new kony.model.View(modelConfig, konyForm)
    };
    AppFactory.prototype.createConfigClassObject = function(configObj) {
        return new kony.model.ConfigClass(configObj)
    };
    AppFactory.prototype.createAuthenticationManager = function() {
        var authManager = new kony.model.AuthenticationManager;
        if (kony.model.ApplicationContext) kony.model.ApplicationContext.setAuthManager(authManager);
        return authManager
    };
    AppFactory.prototype.getAuthManager = function() {
        if (kony.model.ApplicationContext && kony.model.ApplicationContext.getAuthManager()) return kony.model.ApplicationContext.getAuthManager();
        else return this.createAuthManager()
    };
    AppFactory.prototype.createDataStoreObject = function() {
        return new kony.model.DataStore
    };
    AppFactory.prototype.createAppInitManagerObject = function() {
        return new kony.model.AppInitManager
    };
    AppFactory.prototype.createMetadataServiceManagerObject = function() {
        return new kony.model.MetadataServiceManagerMF
    };
    AppFactory.prototype.createSegmentFieldObject = function(widgetid, fieldInfo) {
        return new kony.model.SegmentField(widgetid, fieldInfo)
    };
    AppFactory.prototype.createSearchInfoObject = function(widgetid, searchVal) {
        return new kony.model.searchInfo(widgetid, searchVal)
    };
    AppFactory.prototype.createSegmentWidgetConfigObject = function(widgetid, widgetConfig) {
        return new kony.model.SegmentWidgetConfig(widgetid, widgetConfig)
    };
    AppFactory.prototype.createWidgetConfigObject = function(widgetid, widgetConfig) {
        return new kony.model.widgetConfig(widgetid, widgetConfig)
    };
    AppFactory.prototype.createORMControllerObject = function(appContext, options) {
        return new kony.model.persistent.ORMControllerMFAPP(appContext, options)
    };
    AppFactory.prototype.createORMControllerOdataObject = function(applicationContext) {
        return new kony.model.persistent.ORMControllerMFAPPOData(applicationContext)
    };
    AppFactory.prototype.createORMControllerOdataExpandObject = function(applicationContext) {
        return new kony.model.persistent.ORMControllerMFAPPODataExpand(applicationContext)
    };
    AppFactory.prototype.createORMControllerSQLObject = function(applicationContext) {
        return new kony.model.persistent.ORMControllerMFAPPSQL(applicationContext)
    };
    AppFactory.prototype.createGroupWidgetsContextOffline = function(config, contextData) {
        return new kony.model.persistent.GroupWidgetsContextOffline(config, contextData)
    };
    AppFactory.prototype.createGroupWidgetsContextOnline = function(config, contextData) {
        return new kony.model.persistent.GroupWidgetsContextOnline(config, contextData)
    };
    AppFactory.prototype.createGroupWidgetsContextCommon = function(config, contextData) {
        return new kony.model.persistent.GroupWidgetsContextCommon(config, contextData)
    };
    AppFactory.prototype.createMetadataStore = function() {
        return new kony.model.MetadataStore
    };
    return AppFactory
}();
kony = kony || {};
kony.model = kony.model || {};
kony.model.ApplicationContext = function() {
    function ApplicationContext() {
        var storedCredentialObj;
        this.formObjects = undefined;
        this.metadataStore = undefined;
        this.configParams = undefined;
        this.modelObjects = {};
        this.authManager = undefined;
        this.metadataOptions = {};
        this.setCredentialObj = function(obj) {
            storedCredentialObj = obj
        };
        this.getCredentialObj = function() {
            return storedCredentialObj
        }
    }
    var appContextInstance = new ApplicationContext;
    var factoryObj;
    var IS_ONLINE = true;
    var identityService = undefined;
    var metaDataServiceManager = undefined;
    ApplicationContext.prototype.getAppInstance = function() {
        if (!appContextInstance) appContextInstance = new ApplicationContext;
        return appContextInstance
    };
    ApplicationContext.prototype.getFactorySharedInstance = function() {
        if (!factoryObj) factoryObj = new kony.model.AppFactory;
        return factoryObj
    };
    ApplicationContext.prototype.getMetadataServiceManager = function() {
        if (!metaDataServiceManager) {
            metaDataServiceManager = new kony.model.MetadataServiceManagerMF
        }
        return metaDataServiceManager
    };
    ApplicationContext.prototype.isAppsFirstLogin = function(params) {
        var username = params["username"];
        if (!username && params["authParams"]) {
            username = params["authParams"]["userid"]
        }
        var options = params["options"];
        var identityServiceName = params["identityServiceName"];
        var credStore = kony.store.getItem(kony.model.constants.credStoreName);
        if (credStore !== null && credStore !== undefined) {
            var storedOptions = credStore[kony.model.constants.credStoreOptions];
            var storedIdentityServiceName = credStore[kony.model.constants.credStoreIdentityService];
            var storedUsername = credStore[kony.model.constants.credStoreUsername];
            if (storedUsername !== undefined && storedOptions !== undefined && kony.model.Util.matchIgnoreCase(storedUsername, username) && kony.model.Util.matchIgnoreCase(storedOptions.access, options.access) && kony.model.Util.matchIgnoreCase(storedIdentityServiceName, identityServiceName)) {
                return false
            }
        }
        return true
    };
    ApplicationContext.prototype.appServicesLogin = function(params, loginSuccessCallback, loginErrorCallback) {
        try {
            var options = params["options"];
            var syncOptions = params["syncOptions"];
            var isOffline = options["access"] === "offline" ? true : false;
            var configParams = params["configParams"];
            var metadataOptions = params["metadataOptions"];
            var syncParams = {
                syncOptions: syncOptions
            };
            var authConfig = {};
            authConfig["authParams"] = params["authParams"];
            authConfig["options"] = params["options"];
            authConfig["identityServiceName"] = params["identityServiceName"];
            authConfig["showLoadingscreen"] = true;
            var appfactoryInstance = this.getFactorySharedInstance();
            if (configParams && configParams.constructor === Object && Object.keys(configParams).length > 0) {
                kony.model.ApplicationContext.setConfigParams(configParams)
            }
            var initManager = appfactoryInstance.createAppInitManagerObject();
            initManager.registerService("AuthenticationServiceManager", {
                object: appfactoryInstance.createAuthenticationManager(),
                params: authConfig
            });
            initManager.registerService("MetadataServiceManager", {
                object: appfactoryInstance.createMetadataServiceManagerObject(),
                params: {
                    options: options,
                    metadataOptions: metadataOptions
                }
            });
            if (isOffline) {
                initManager.registerService("SyncManager", {
                    object: appfactoryInstance.createSyncManagerObject(),
                    params: syncParams
                })
            }
            initManager.executeRegistedServices(loginSuccessCallback, loginErrorCallback)
        } catch (err) {
            var exception;
            kony.model.ApplicationContext.dismissLoadingScreen();
            kony.model.log.error("Error while authentication: " + err.toString());
            if (err !== undefined && err !== null) {
                exception = this.getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_APP_INITIALIZATION_FAILED, kony.model.ExceptionCode.MSG_ERROR_APP_INITIALIZATION_FAILED)
            } else exception = this.getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_APP_INITIALIZATION_FAILED, kony.model.ExceptionCode.MSG_ERROR_APP_INITIALIZATION_FAILED);
            loginErrorCallback(exception)
        }
    };
    ApplicationContext.prototype.getObjectService = function(options, objectServiceName) {
        try {
            var objectService;
            if (options.hasOwnProperty("mock") && options["mock"] == true) {
                kony.model.log.info("Initialising mocked object service");
                kony.model.log.info("Getting SDK ObjectService");
                objectService = kony.sdk.getCurrentInstance().getObjectService(objectServiceName, {
                    access: objectServiceName
                })
            } else {
                kony.model.log.info("Getting SDK ObjectService");
                objectService = kony.sdk.getCurrentInstance().getObjectService(objectServiceName, options)
            }
            return objectService
        } catch (error) {
            throw this.getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_INITIALIZING_METADATA_PROVIDER, kony.model.ExceptionCode.MSG_ERROR_INITIALIZING_METADATA_PROVIDER + " -- " + error.message)
        }
    };
    ApplicationContext.prototype.logout = function(logoutSucCallback, logoutErrCallback) {
        var logoutTS = new Date;
        try {
            this.reset();
            var identityService = kony.model.ApplicationContext.getIdentityService();
            if (identityService) {
                identityService.logout(success, logoutErrCallback)
            } else {
                success()
            }

            function success() {
                var logoutEndTS = new Date;
                kony.model.Util.perftimecal("Logout >>", "Logout Ended >>", logoutTS, logoutEndTS);
                kony.model.Util.perlogout();
                logoutSucCallback()
            }
        } catch (err) {
            logoutErrCallback(this.getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_FAILED_TO_LOGOUT, kony.model.ExceptionCode.MSG_ERROR_FAILED_TO_LOGOUT + " : " + err.toString(), err))
        }
    };
    ApplicationContext.prototype.showLoadingScreen = function(text) {
        var configParams = kony.model.ApplicationContext.getConfigParams();
        if (configParams && configParams["ShowLoadingScreenFunction"]) {
            var userDefinedLoadingScreen = configParams["ShowLoadingScreenFunction"];
            userDefinedLoadingScreen(text)
        } else {
            text = " " + text + " \n";
            kony.application.showLoadingScreen(null, text, constants.LOADING_SCREEN_POSITION_ONLY_CENTER, true, true, null)
        }
    };
    ApplicationContext.prototype.showSyncLoadingScreen = function(text) {
        var configParams = kony.model.ApplicationContext.getConfigParams();
        if (configParams && configParams["ShowSyncLoadingScreenFunction"]) {
            var userDefinedLoadingScreen = configParams["ShowSyncLoadingScreenFunction"];
            userDefinedLoadingScreen(text)
        } else {
            text = " " + text + " \n";
            kony.application.showLoadingScreen(null, text, constants.LOADING_SCREEN_POSITION_ONLY_CENTER, true, true, null)
        }
    };
    ApplicationContext.prototype.dismissLoadingScreen = function() {
        var configParams = kony.model.ApplicationContext.getConfigParams();
        if (configParams && configParams["DismissLoadingScreenFunction"]) {
            var userDefinedLoadingScreen = configParams["DismissLoadingScreenFunction"];
            userDefinedLoadingScreen()
        } else {
            kony.application.dismissLoadingScreen()
        }
    };
    ApplicationContext.prototype.dismissSyncLoadingScreen = function() {
        var configParams = kony.model.ApplicationContext.getConfigParams();
        if (configParams && configParams["DismissSyncLoadingScreenFunction"]) {
            var userDefinedLoadingScreen = configParams["DismissSyncLoadingScreenFunction"];
            userDefinedLoadingScreen()
        } else {
            kony.application.dismissLoadingScreen()
        }
    };
    ApplicationContext.prototype.getAuthManager = function() {
        return this.authManager
    };
    ApplicationContext.prototype.setAuthManager = function(authManager) {
        this.authManager = authManager
    };
    ApplicationContext.prototype.setUserCredentialObj = function(obj) {
        this.setCredentialObj(obj)
    };
    ApplicationContext.prototype.getUserCredentialObj = function() {
        return this.getCredentialObj()
    };
    ApplicationContext.prototype.setOnlineStatus = function(isOnline) {
        IS_ONLINE = isOnline === true ? true : false
    };
    ApplicationContext.prototype.isAppSyncEnabled = function() {
        return IS_ONLINE === false ? true : false
    };
    ApplicationContext.prototype.getMetadataStore = function() {
        if (!this.metadataStore) this.metadataStore = new kony.model.MetadataStore;
        return this.metadataStore
    };
    ApplicationContext.prototype.getSyncManager = function() {
        if (!this.syncManager) this.syncManager = this.getFactorySharedInstance().createSyncManagerObject();
        return this.syncManager
    };
    ApplicationContext.prototype.reset = function() {
        this.metadataStore = undefined;
        this.formObjects = undefined
    };
    ApplicationContext.prototype.setConfigParams = function(params) {
        if (this.configParams) {
            for (var key in params) this.configParams[key] = params[key]
        } else this.configParams = params
    };
    ApplicationContext.prototype.getConfigParams = function() {
        return this.configParams
    };
    ApplicationContext.prototype.getModel = function(entityName, serviceName, options) {
        var modelName = serviceName + "." + entityName;
        if (!this.modelObjects[modelName]) {
            this.modelObjects[modelName] = this.getFactorySharedInstance().createModelObject(this, entityName, serviceName, options)
        }
        this.modelObjects[modelName].setOptions(options);
        return this.modelObjects[modelName]
    };
    ApplicationContext.prototype.setIdentityService = function(identservice) {
        identityService = identservice
    };
    ApplicationContext.prototype.getIdentityService = function() {
        return identityService
    };
    ApplicationContext.prototype.login = function(params, loginSucCallback, loginErrCallback) {
        var authenticationManager = this.getFactorySharedInstance().createAuthenticationManager();
        authenticationManager.execute(params, loginSucCallback, loginErrCallback)
    };
    ApplicationContext.prototype.createModel = function(entityName, serviceName, options, metadataOptions, successCallback, errorCallback) {
        var model = serviceName + "." + entityName;
        var scopeObj = this;
        var modelObj;
        try {
            var modelHandler = kony.model[serviceName][entityName + "Model"];
            var modelExtensionHandler = kony.model[serviceName][entityName + "ModelExtension"];
            if (metadataOptions.getFromServer) {
                kony.model.ApplicationContext.getMetadataServiceManager().fetchForObject(serviceName, entityName, options, metadataOptions, metadataSuccCallback.bind(this), metadataErrCallback.bind(this))
            } else {
                if (scopeObj.modelObjects.hasOwnProperty(model)) {
                    scopeObj.modelObjects[model].setOptions(options);
                    successCallback(scopeObj.modelObjects[model])
                } else {
                    var metadataStore = scopeObj.getMetadataStore();
                    try {
                        if (!metadataStore.getEntityMetadata(entityName, serviceName, options)) {
                            kony.model.ApplicationContext.getMetadataServiceManager().fetchForObject(serviceName, entityName, options, metadataOptions, metadataSuccCallback, metadataErrCallback)
                        } else {
                            metadataSuccCallback()
                        }
                    } catch (err) {
                        kony.model.log.error("Error in fetching metadata for object service : " + objServiceName, err);
                        errorCallback.call(err)
                    }
                }
            }

            function metadataSuccCallback() {
                var metadataStore = scopeObj.getMetadataStore();
                var entityMetadata = metadataStore.getEntityMetadata(entityName, serviceName, options);
                if (entityMetadata) {
                    var configOptions = {};
                    configOptions["serviceName"] = serviceName;
                    configOptions["options"] = options;
                    modelObj = new modelHandler(scopeObj, entityMetadata, configOptions)
                } else {
                    kony.model.log.error("error in entity controller factory, entity meta data for " + entityName + " undefined")
                }
                if (modelExtensionHandler !== undefined && typeof modelExtensionHandler === "function") {
                    modelExtensionObj = new modelExtensionHandler(modelObj);
                    modelObj.setControllerExtensionObject(modelExtensionObj)
                } else {
                    kony.model.log.error("error in entity controller factory, model Extension Object for " + entityName + " is undefined")
                }
                scopeObj.modelObjects[model] = modelObj;
                scopeObj.modelObjects[model].setOptions(options);
                successCallback(scopeObj.modelObjects[model])
            }

            function metadataErrCallback(err) {
                kony.model.log.error("Error in fetching metadata for object service : " + objServiceName);
                errorCallback(err)
            }
        } catch (err) {
            errorCallback.call(err)
        }
    };
    ApplicationContext.prototype.initializeObjectServices = function(serviceEntityMap, successCallback, errorCallback) {
        var scopeObj = this;
        var indx1 = 0;
        var services = Object.keys(serviceEntityMap);
        initialiseServices();

        function initialiseServices() {
            if (indx1 >= services.length) {
                successCallback();
                return
            }
            var indx2 = 0;
            var entities;
            var options = serviceEntityMap[services[indx1]]["options"];
            var serviceName = services[indx1];
            var serviceMetadataOptions = serviceEntityMap[services[indx1]]["metadataOptions"];
            if (serviceEntityMap[services[indx1]]["entities"]) {
                entities = Object.keys(serviceEntityMap[services[indx1]]["entities"]);
                initialiseObject()
            } else {
                initialiseService()
            }

            function initialiseObject() {
                if (indx2 >= entities.length) {
                    metaSuccess();
                    return
                }
                var entityName = entities[indx2];
                var metadataOptions = serviceEntityMap[services[indx1]]["entities"][entities[indx2]]["metadataOptions"];
                if (!metadataOptions) metadataOptions = serviceMetadataOptions;
                if (metadataOptions.getFromServer) {
                    var model = serviceName + "." + entityName;
                    scopeObj.modelObjects[model] = null
                }
                kony.model.ApplicationContext.getMetadataServiceManager().fetchForObject(serviceName, entityName, options, metadataOptions, successCbk, errorCbk);

                function successCbk(data) {
                    indx2++;
                    initialiseObject()
                }

                function errorCbk(err) {
                    metaError(err)
                }
            }

            function initialiseService() {
                kony.model.ApplicationContext.getMetadataServiceManager().fetchForObjectService(serviceName, options, serviceMetadataOptions, metaSuccess, metaError)
            }

            function metaSuccess() {
                indx1++;
                initialiseServices()
            }

            function metaError(err) {
                errorCallback(err)
            }
        }
    };
    return appContextInstance
}();
kony = kony || {};
kony.model = kony.model || {};
kony.model.BaseModel = function() {
    function BaseModel(applicationContext, entityMetaData, configOptions) {
        var appContext = applicationContext;
        var entityMetadata = entityMetaData;
        var fields = entityMetaData.fields;
        var columnsMap = entityMetaData.columnsMap;
        var relatedEntities = entityMetaData.relatedEntities;
        var entityDefinition = undefined;
        var controllerExtensionObject = undefined;
        var serviceName = configOptions.serviceName;
        var options = configOptions.options;
        this.getServiceName = function() {
            return serviceName
        }, this.setServiceName = function(serviceNameVal) {
            serviceName = serviceNameVal
        }, this.getOptions = function() {
            return options
        }, this.setOptions = function(optionsObj) {
            options = optionsObj
        }, this.getObjectService = function() {
            return this.getApplicationContext().getObjectService(this.getOptions(), this.getServiceName())
        }, this.getControllerExtensionObject = function() {
            return controllerExtensionObject
        };
        this.setControllerExtensionObject = function(controllerExtension) {
            controllerExtensionObject = controllerExtension
        };
        this.getApplicationContext = function() {
            return appContext
        };
        this.getEntityMetaData = function() {
            return entityMetadata
        };
        this.getFields = function() {
            return fields
        };
        this.getColumnsMap = function() {
            return columnsMap
        };
        this.getRelatedEntities = function() {
            return relatedEntities
        };
        this.getAccessType = function() {
            if (options && options.hasOwnProperty("access") && options.access.toLowerCase() === "offline") return "offline";
            else return "online"
        };
        this.getDataObjectOnline = function(columnNames, dataModel) {
            var entityName = this.getValueForProperty("name");
            var self = this;
            var columnNamesString = "*";
            var primaryKeyColumns = this.getValueForProperty("primaryKey");
            for (var i = 0; i < primaryKeyColumns.length; i++) {
                if (columnNames.indexOf(primaryKeyColumns[i]) === -1) {
                    columnNames.push(primaryKeyColumns[i])
                }
            }
            for (var column in columnNames) {
                if (columnNamesString === "*") {
                    columnNamesString = columnNames[column]
                } else {
                    columnNamesString = columnNamesString + "," + columnNames[column]
                }
            }
            var queryStr = "$select=" + columnNamesString;
            kony.model.log.info("columnNamesString : " + columnNamesString);
            if (dataModel) {
                kony.model.log.info("DataModel object --\x3e ", dataModel);
                var primaryKeyValueMap = dataModel.getPrimaryKeyValueMap();
                if (primaryKeyValueMap) {
                    queryStr = queryStr.concat("&$filter=");
                    var primaryKeyValuesArr = Object.keys(primaryKeyValueMap);
                    for (var j = 1; j < primaryKeyValuesArr.length; j++) {
                        queryStr = queryStr.concat(primaryKeyValuesArr[j - 1] + " eq " + primaryKeyValueMap[primaryKeyValuesArr[j - 1]] + " and ")
                    }
                    queryStr = queryStr.concat(primaryKeyValuesArr[j - 1] + " eq " + primaryKeyValueMap[primaryKeyValuesArr[j - 1]])
                }
            }
            var dataObject = new kony.sdk.dto.DataObject(self.getValueForProperty("name"));
            dataObject.setOdataUrl(queryStr);
            return dataObject
        };
        this.getDataObjectOffline = function(columnNames, dataModel) {
            var self = this;
            var entityName = this.getValueForProperty("name");
            var tblDto = new kony.sdk.dto.Table(entityName, entityName, false);
            var selQuery = new kony.sdk.dto.SelectQuery(self.getServiceName(), tblDto);
            var primaryKeyColumns = this.getValueForProperty("primaryKey");
            for (var i = 0; i < primaryKeyColumns.length; i++) {
                if (columnNames.indexOf(primaryKeyColumns[i]) === -1) {
                    columnNames.push(primaryKeyColumns[i])
                }
            }
            for (var index in columnNames) {
                var colObj = new kony.sdk.dto.Column(tblDto, columnNames[index]);
                selQuery.addColumn(colObj)
            }
            if (dataModel) {
                var primaryKeyValueMap = dataModel.getPrimaryKeyValueMap();
                if (primaryKeyValueMap) {
                    var primaryKeyValuesArr = Object.keys(primaryKeyValueMap);
                    for (var j = 0; j < primaryKeyValuesArr.length; j++) {
                        var colObj = new kony.sdk.dto.Column(tblDto, primaryKeyValuesArr[j]);
                        var crtObj = new kony.sdk.dto.Match(colObj, kony.sdk.constants.MatchType.EQUALS, primaryKeyValueMap[primaryKeyValuesArr[j]]);
                        selQuery.addCriteria(crtObj)
                    }
                }
            }
            var dataObject = new kony.sdk.dto.DataObject(self.getValueForProperty("name"));
            dataObject.setSelectQueryObject(selQuery);
            return dataObject
        };
        this.getRequestOptions = function(options) {
            if (options && !options.hasOwnProperty("dataObject")) {
                var newOptions = {};
                newOptions["dataObject"] = options;
                return newOptions
            } else {
                return options
            }
        }
    }
    BaseModel.prototype.getValueForColumnProperty = function(columnName, key) {
        var propertyVal = null;
        if (columnName && key) {
            propertyVal = this.getColumnInfo(columnName)[key]
        }
        return propertyVal
    };
    BaseModel.prototype.getColumnNames = function() {
        var columnNames = [];
        for (var key in this.getColumnsMap()) {
            columnNames.push(key)
        }
        return columnNames
    };
    BaseModel.prototype.getValueForProperty = function(propertyName) {
        return this.getEntityMetaData()[propertyName]
    };
    BaseModel.prototype.getColumnInfo = function(columnName) {
        return this.getColumnsMap()[columnName]
    };
    BaseModel.prototype.getFieldPickListValues = function(columnName) {
        return this.getColumnInfo(columnName)["pickListValues"]
    };
    BaseModel.prototype.getChildRelationshipList = function(successCallback, errorCallback) {
        var scopeObj = this;
        var childRelationships = this.getValueForProperty("relationshipList");
        successCallback.call(scopeObj, childRelationships)
    };
    BaseModel.prototype.getRelationshipForChildEntityName = function(childEntityName, successCallback, errorCallback) {
        var scopeObj = this;
        var relatedEntities = this.getValueForProperty("relatedEntities");
        if (relatedEntities) {
            successCallback.call(scopeObj, relatedEntities[childEntityName])
        } else {
            errorCallback.call(scopeObj, relatedEntities)
        }
    };
    BaseModel.prototype.fetchDataForColumns = function(columnNames, onSuccess, onError, dataModel) {
        try {
            var self = this;
            var dataObject;
            if (this.getAccessType() === "offline") dataObject = this.getDataObjectOffline(columnNames, dataModel);
            else dataObject = this.getDataObjectOnline(columnNames, dataModel);
            this.fetch(dataObject, success, error)
        } catch (err) {
            kony.model.log.error("Error fetching data for columns in entity controller");
            var exception;
            exception = self.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_FETCHING_DATA_FOR_COLUMNS, kony.model.ExceptionCode.MSG_ERROR_FETCHING_DATA_FOR_COLUMNS, err);
            onError(exception)
        }

        function success(response) {
            kony.model.log.info("Success fetching data for columns in entity controller");
            onSuccess(response)
        }

        function error(err) {
            kony.model.log.error("Error fetching data for columns in entity controller");
            var exception = self.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_FETCHING_DATA_FOR_COLUMNS, kony.model.ExceptionCode.MSG_ERROR_FETCHING_DATA_FOR_COLUMNS, err);
            onError(exception)
        }
    };
    BaseModel.prototype.fetch = function(options, onSuccess, onError) {
        this.fetchResponseWithRecords(options, success, onError);

        function success(response) {
            response = response["records"];
            onSuccess(response)
        }
    };
    BaseModel.prototype.create = function(options, onSuccess, onError) {
        try {
            var scopeObj = this;
            var requestOptions = scopeObj.getRequestOptions(options);
            if (false === this.validate(requestOptions["dataObject"], kony.model.constants.ValidationType.CREATE)) {
                var exception = this.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_VALIDATION_CREATE, kony.model.ExceptionCode.MSG_ERROR_VALIDATION_CREATE);
                throw exception
            }
            var createInEntityCntrlTS = new Date;
            kony.model.log.info("Making SDK create Call");
            scopeObj.getObjectService().create(requestOptions, success, error)
        } catch (e) {
            var exception = scopeObj.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_CREATE, kony.model.ExceptionCode.MSG_ERROR_CREATE, e);
            onError(exception)
        }

        function success(response) {
            kony.model.log.info("SDK create Success");
            var createEndInEntityCntrlTS = new Date;
            kony.model.Util.perftimecal("Create in entity controller >>", "Create in entity controller done >>", createInEntityCntrlTS, createEndInEntityCntrlTS);
            onSuccess(response)
        }

        function error(e) {
            kony.model.log.error("SDK create Failed " + e);
            var exception = scopeObj.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_CREATE, kony.model.ExceptionCode.MSG_ERROR_CREATE, e);
            onError(exception)
        }
    };
    BaseModel.prototype.update = function(options, onSuccess, onError) {
        var updateInEntityCntrlTS = new Date;
        try {
            var scopeObj = this;
            var requestOptions = scopeObj.getRequestOptions(options);
            if (false === this.validate(requestOptions["dataObject"], kony.model.constants.ValidationType.UPDATE)) {
                var exception = this.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_VALIDATION_UPDATE, kony.model.ExceptionCode.MSG_ERROR_VALIDATION_UPDATE);
                throw exception
            }
            if (this.getAccessType() === "offline") {
                kony.model.log.info("Making SDK update Call");
                scopeObj.getObjectService().update(requestOptions, success, error)
            } else {
                kony.model.log.info("Making SDK partialUpdate Call");
                scopeObj.getObjectService().partialUpdate(requestOptions, success, error)
            }
        } catch (err) {
            var exception = scopeObj.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_UPDATE, kony.model.ExceptionCode.MSG_ERROR_UPDATE, err);
            onError(exception)
        }

        function success(response) {
            kony.model.log.info("SDK update Success");
            var updateEndInEntityCntrlTS = new Date;
            kony.model.Util.perftimecal("Update in entity controller >>", "Update in entity controller done >>", updateInEntityCntrlTS, updateEndInEntityCntrlTS);
            onSuccess(response)
        }

        function error(err) {
            kony.model.log.error("SDK update Failed " + err);
            var exception = scopeObj.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_UPDATE, kony.model.ExceptionCode.MSG_ERROR_UPDATE, err);
            onError(exception)
        }
    };
    BaseModel.prototype.partialUpdate = function(options, onSuccess, onError) {
        var scopeObj = this;
        scopeObj.update(options, onSuccess, onError)
    };
    BaseModel.prototype.completeUpdate = function(options, onSuccess, onError) {
        var updateInEntityCntrlTS = new Date;
        try {
            var scopeObj = this;
            var requestOptions = scopeObj.getRequestOptions(options);
            if (false === this.validate(requestOptions["dataObject"], kony.model.constants.ValidationType.UPDATE)) {
                var exception = this.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_VALIDATION_UPDATE, kony.model.ExceptionCode.MSG_ERROR_VALIDATION_UPDATE);
                throw exception
            }
            kony.model.log.info("Making SDK update Call");
            scopeObj.getObjectService().update(requestOptions, success, error)
        } catch (err) {
            var exception = scopeObj.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_UPDATE, kony.model.ExceptionCode.MSG_ERROR_UPDATE, err);
            onError(exception)
        }

        function success(response) {
            kony.model.log.info("SDK update Success");
            var updateEndInEntityCntrlTS = new Date;
            kony.model.Util.perftimecal("Update in entity controller >>", "Update in entity controller done >>", updateInEntityCntrlTS, updateEndInEntityCntrlTS);
            onSuccess(response)
        }

        function error(err) {
            kony.model.log.error("SDK update Failed " + err);
            var exception = scopeObj.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_UPDATE, kony.model.ExceptionCode.MSG_ERROR_UPDATE, err);
            onError(exception)
        }
    };
    BaseModel.prototype.remove = function(options, onSuccess, onError) {
        try {
            var scopeObj = this;
            var removeInEntityCntrlTS = new Date;
            var requestOptions = scopeObj.getRequestOptions(options);
            kony.model.log.info("Making SDK deleteRecord Call");
            scopeObj.getObjectService().deleteRecord(requestOptions, success, error)
        } catch (err) {
            var exception = scopeObj.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_DELETE, kony.model.ExceptionCode.MSG_ERROR_DELETE, err);
            onError(exception)
        }

        function success(response) {
            kony.model.log.info("SDK deleteRecord Success");
            var removeEndInEntityCntrlTS = new Date;
            kony.model.Util.perftimecal("Remove in entity controller >>", "Remove in entity controller done >>", removeInEntityCntrlTS, removeEndInEntityCntrlTS);
            onSuccess(response)
        }

        function error(err) {
            kony.model.log.error("SDK deleteRecord Failed " + err);
            var exception = scopeObj.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_DELETE, kony.model.ExceptionCode.MSG_ERROR_DELETE, err);
            onError(exception)
        }
    };
    BaseModel.prototype.removeByPrimaryKey = function(primaryKeyValueMap, onSuccess, onError) {
        try {
            var scopeObj = this;
            var entityName = this.getValueForProperty("name");
            var dataObject = new kony.sdk.dto.DataObject(scopeObj.getValueForProperty("name"));
            dataObject.setRecord(primaryKeyValueMap);
            this.remove(dataObject, success, error)
        } catch (err) {
            var exception = scopeObj.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_DELETE_BY_PRIMARY_KEY, kony.model.ExceptionCode.MSG_ERROR_DELETE_BY_PRIMARY_KEY, err);
            onError(exception)
        }

        function success(response) {
            kony.model.log.info("Record with primaryFieldValue - " + primaryKeyValueMap + " - of entity '" + entityName + "' deleted successfully");
            onSuccess(response)
        }

        function error(err) {
            var exception = scopeObj.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_DELETE_BY_PRIMARY_KEY, kony.model.ExceptionCode.MSG_ERROR_DELETE_BY_PRIMARY_KEY, err);
            onError(exception)
        }
    };
    BaseModel.prototype.executeSelectQuery = function(query, succCallback, errCallback) {
        try {
            var self = this;
            kony.model.log.info("Making SDK executeSelectQuery Call");
            this.getObjectService().executeSelectQuery(query, success, error);

            function success(response) {
                kony.model.log.info("SDK executeSelectQuery Call Success");
                var primaryKeyColumns = self.getValueForProperty("primaryKey");
                if (response && response.length > 0) {
                    for (var key in response) {
                        var primaryKeyValueMap = {};
                        for (var i = 0; i < primaryKeyColumns.length; i++) {
                            if (response[key].hasOwnProperty(primaryKeyColumns[i])) {
                                primaryKeyValueMap[primaryKeyColumns[i]] = response[key][primaryKeyColumns[i]]
                            }
                        }
                        response[key]["primaryKeyValueMap"] = primaryKeyValueMap
                    }
                }
                succCallback(response)
            }

            function error(err) {
                kony.model.log.error("SDK executeSelectQuery Call Failed " + err);
                var exception = self.getApplicationContext().getFactorySharedInstance().createExceptionObject(-1, "Error executing executeSelectQuery", err);
                errCallback(exception)
            }
        } catch (err) {
            kony.model.log.error("Error fetching data for columns in entity controller");
            var exception = self.getApplicationContext().getFactorySharedInstance().createExceptionObject(-1, "Error executing executeSelectQuery", err);
            errCallback(exception)
        }
    };
    BaseModel.prototype.fetchResponse = function(options, onSuccess, onError) {
        var fetchInEntityCntrlTS = new Date;
        try {
            var self = this;
            var requestOptions = self.getRequestOptions(options);
            kony.model.log.info("Making SDK fetch Call");
            self.getObjectService().fetch(requestOptions, success, error)
        } catch (e) {
            var exception;
            if (e instanceof kony.model.Exception) exception = self.getApplicationContext().getFactorySharedInstance().createExceptionObject(e.code, e.message, e);
            else exception = self.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_FETCH, kony.model.ExceptionCode.MSG_ERROR_FETCH, e);
            onError(exception)
        }

        function success(response) {
            kony.model.log.info("SDK fetch Success");
            var records = response["records"];
            var primaryKeyColumns = self.getValueForProperty("primaryKey");
            if (records && records.length > 0) {
                for (var key in records) {
                    var primaryKeyValueMap = {};
                    for (var i = 0; i < primaryKeyColumns.length; i++) {
                        if (records[key].hasOwnProperty(primaryKeyColumns[i])) {
                            primaryKeyValueMap[primaryKeyColumns[i]] = records[key][primaryKeyColumns[i]]
                        }
                    }
                    records[key]["primaryKeyValueMap"] = primaryKeyValueMap
                }
            }
            var fetchEndInEntityCntrlTS = new Date;
            kony.model.Util.perftimecal("Fetch in entity controller >>", "Fetch in entity controller done >>", fetchInEntityCntrlTS, fetchEndInEntityCntrlTS);
            onSuccess(response)
        }

        function error(err) {
            kony.model.log.error("Error in fetching data for given query", err);
            var exception = self.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_FETCH, kony.model.ExceptionCode.MSG_ERROR_FETCH, err);
            onError(exception)
        }
    };
    BaseModel.prototype.fetchResponseWithRecords = function(options, onSuccess, onError) {
        var self = this;
        this.fetchResponse(options, success, onError);

        function success(response) {
            if (!response.hasOwnProperty("records")) {
                for (var key in response) {
                    if (response[key] instanceof Array) {
                        response["records"] = response[key];
                        break
                    }
                }
                var records = response["records"];
                var primaryKeyColumns = self.getValueForProperty("primaryKey");
                if (records && records.length > 0) {
                    for (var key in records) {
                        var primaryKeyValueMap = {};
                        for (var i = 0; i < primaryKeyColumns.length; i++) {
                            if (records[key].hasOwnProperty(primaryKeyColumns[i])) {
                                primaryKeyValueMap[primaryKeyColumns[i]] = records[key][primaryKeyColumns[i]]
                            }
                        }
                        records[key]["primaryKeyValueMap"] = primaryKeyValueMap
                    }
                }
            }
            onSuccess(response)
        }
    };
    BaseModel.prototype.customVerb = function(verbName, options, success, error) {
        var customVerbStartInEntityCtrlTS = new Date;
        try {
            var self = this;
            var requestOptions = self.getRequestOptions(options);
            kony.model.log.info("Making SDK custom verb Call");
            this.getApplicationContext().getObjectService({
                access: "online"
            }, this.getServiceName()).customVerb(verbName, options, onSuccess, onError)
        } catch (e) {
            var exception;
            if (e instanceof kony.model.Exception) exception = self.getApplicationContext().getFactorySharedInstance().createExceptionObject(e.code, e.message, e);
            else exception = self.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_CUSTOMVERB, kony.model.ExceptionCode.MSG_ERROR_CUSTOMVERB, e);
            onError(exception)
        }

        function onSuccess(response) {
            kony.model.log.info("SDK fetch Success");
            var records = response["records"];
            var primaryKeyColumns = self.getValueForProperty("primaryKey");
            if (records && records.length > 0) {
                for (var key in records) {
                    var primaryKeyValueMap = {};
                    for (var i = 0; i < primaryKeyColumns.length; i++) {
                        if (records[key].hasOwnProperty(primaryKeyColumns[i])) {
                            primaryKeyValueMap[primaryKeyColumns[i]] = records[key][primaryKeyColumns[i]]
                        }
                    }
                    records[key]["primaryKeyValueMap"] = primaryKeyValueMap
                }
            }
            var customVerbEndInEntityCtrlTS = new Date;
            kony.model.Util.perftimecal("Customverb call in entity controller >>", "CustomVerb call in entity controller done >>", customVerbStartInEntityCtrlTS, customVerbEndInEntityCtrlTS);
            success(response)
        }

        function onError(err) {
            kony.model.log.error("Error in custom verb call", err);
            var exception = self.getApplicationContext().getFactorySharedInstance().createExceptionObject(kony.model.ExceptionCode.CD_ERROR_CUSTOMVERB, kony.model.ExceptionCode.MSG_ERROR_CUSTOMVERB, err);
            error(exception)
        }
    };
    BaseModel.prototype.validate = function(dataObject, validationType) {
        return this.getControllerExtensionObject().validate(dataObject, validationType)
    };
    return BaseModel
}();
kony = kony || {};
kony.model = kony.model || {};
kony.model.MetadataServiceManagerMF = function() {
    function MetadataServiceManagerMF() {}
    MetadataServiceManagerMF.prototype.fetch = function(options, serviceName, metadataOptions, successcallback, errorCallback) {
        var objectService = kony.model.ApplicationContext.getObjectService(options, serviceName);
        kony.model.log.info("Making SDK metadata Call");
        objectService.getMetadataOfAllObjects(metadataOptions, successcallback, errorCallback)
    };
    MetadataServiceManagerMF.prototype.apply = function(response, options, serviceName, successcallback, errorCallback) {
        var entityMetaDataMap = {};
        for (var objectName in response) {
            var metadata = response[objectName];
            entityMetaDataMap[objectName] = metadata;
            var fields = metadata.columns;
            entityMetaDataMap[objectName]["columnsMap"] = {};
            for (var j = 0; j < fields.length; j++) {
                var field = fields[j];
                entityMetaDataMap[objectName]["columnsMap"][field.name] = field
            }
            setRelatedEntities(metadata);
            if (kony.model.ApplicationContext) {
                var metadataStore = kony.model.ApplicationContext.getMetadataStore();
                metadataStore.setEntityMetadata(entityMetaDataMap[objectName], objectName, serviceName, options)
            }
        }

        function setRelatedEntities(metadata) {
            var relationList = metadata["relationshipList"];
            var relatedEntities = {};
            for (var idx in relationList) {
                var relation = relationList[idx];
                var relatedEntity = {};
                relatedEntity["relationshipFields"] = relation.relationshipFields;
                relatedEntity["relationshipType"] = relation.relationshipType;
                relatedEntity["relationshipName"] = relation.relationshipName;
                relatedEntities[relation.relatedEntity] = relatedEntity
            }
            metadata["relatedEntities"] = relatedEntities
        }
        var result = {};
        result["dataModel"] = entityMetaDataMap;
        if (successcallback) successcallback(result)
    };
    MetadataServiceManagerMF.prototype.fetchForAllObjectServices = function(options, metadataOptions, success, error) {
        var self = this;

        function getAllObjectServicesFromSdk() {
            var objectServicesMapFromSdk = kony.model.Util.clone(kony.sdk.getCurrentInstance().objectsvc);
            if (kony.sdk.registeredobjsvcs)
                if (objectServicesMapFromSdk) objectServicesMapFromSdk = kony.model.Util.mergeJSONs(objectServicesMapFromSdk, kony.sdk.registeredobjsvcs);
                else objectServicesMapFromSdk = kony.sdk.registeredobjsvcs;
            var objectServicesNames = [];
            for (var key in objectServicesMapFromSdk) {
                if (key.indexOf("_metadata") === -1) {
                    objectServicesNames.push(key)
                }
            }
            return objectServicesNames
        }
        var objectServicesList = getAllObjectServicesFromSdk();
        var osvIndx = 0;
        self.fetch(options, objectServicesList[osvIndx], metadataOptions, successCbk, errorCbk);

        function successCbk(response) {
            kony.model.log.info("SDK metadata Call Success for ObjectService " + objectServicesList[osvIndx]);
            self.apply(response, options, objectServicesList[osvIndx]);
            osvIndx++;
            if (osvIndx >= objectServicesList.length) {
                success(response);
                return
            }
            self.fetch(options, objectServicesList[osvIndx], metadataOptions, successCbk, errorCbk)
        }

        function errorCbk(err) {
            kony.model.log.error("error fetching metadata" + JSON.stringify(err));
            error(err)
        }
    };
    MetadataServiceManagerMF.prototype.fetchForObjectService = function(serviceName, options, metadataOptions, success, error) {
        var self = this;
        self.fetch(options, serviceName, metadataOptions, successCbk, errorCbk);

        function successCbk(response) {
            self.apply(response, options, serviceName);
            success(response)
        }

        function errorCbk(err) {
            kony.model.log.error("error fetching metadata" + JSON.stringify(err));
            error(err)
        }
    };
    MetadataServiceManagerMF.prototype.fetchForObject = function(serviceName, entityName, options, metadataOptions, success, error) {
        var self = this;
        var objectService = kony.model.ApplicationContext.getObjectService(options, serviceName);
        kony.model.log.info("Making SDK metadata Call");
        objectService.getMetadataOfObject(entityName, metadataOptions, successCbk, errorCbk);

        function successCbk(response) {
            kony.model.log.info("SDK metadata Call Success for Object " + entityName);
            var res = {};
            res[entityName] = response;
            self.apply(res, options, serviceName);
            success(response)
        }

        function errorCbk(err) {
            kony.model.log.error("error fetching metadata" + JSON.stringify(err));
            error(err)
        }
    };
    MetadataServiceManagerMF.prototype.execute = function(params, success, error) {
        var scopeObj = this;
        this.fetchForAllObjectServices(params["options"], params["metadataOptions"], fetchSuccess, fetchError);

        function fetchSuccess(response) {
            success(response);
            return
        }

        function fetchError(err) {
            error(err);
            return
        }
    };
    return MetadataServiceManagerMF
}();
kony = kony || {};
kony.model = kony.model || {};
kony.model.MetadataStore = function() {
    function MetadataStore() {
        var serviceMetadata = {};
        this.getServiceMetadata = function(serviceName, options) {
            return serviceMetadata[serviceName]
        };
        this.setServiceMetadata = function(metadata, serviceName, options) {
            serviceMetadata[serviceName] = metadata
        }
    }
    MetadataStore.prototype.getEntityMetadata = function(entity, serviceName, options) {
        var svcMetadata = this.getServiceMetadata(serviceName, options);
        if (svcMetadata && svcMetadata[entity]) return svcMetadata[entity]
    };
    MetadataStore.prototype.setEntityMetadata = function(metadata, entity, serviceName, options) {
        var svcMetadata = this.getServiceMetadata(serviceName, options);
        if (!svcMetadata) svcMetadata = {};
        svcMetadata[entity] = metadata;
        this.setServiceMetadata(svcMetadata, serviceName, options)
    };
    return MetadataStore
}();
kony = kony || {};
kony.model = kony.model || {};
kony.model.log = kony.model.log || {};
kony.model.Util = kony.model.Util || {};
if (typeof kony.model.log === "undefined") {
    kony.model.log = {}
}
kony.model.log.NONE = {
    value: 0,
    name: "none",
    code: "NONE"
};
kony.model.log.FATAL = {
    value: 1,
    name: "fatal",
    code: "FATAL"
};
kony.model.log.ERROR = {
    value: 2,
    name: "error",
    code: "ERROR"
};
kony.model.log.WARN = {
    value: 3,
    name: "warn",
    code: "WARN"
};
kony.model.log.INFO = {
    value: 4,
    name: "info",
    code: "INFO"
};
kony.model.log.DEBUG = {
    value: 5,
    name: "debug",
    code: "DEBUG"
};
kony.model.log.TRACE = {
    value: 6,
    name: "trace",
    code: "TRACE"
};
kony.model.currentLogLevel = kony.model.log.INFO;
kony.model.log.trace = function(msg, params) {
    kony.model.logger(kony.model.log.TRACE, "MVVM", msg, params)
};
kony.model.log.debug = function(msg, params) {
    kony.model.logger(kony.model.log.DEBUG, "MVVM", msg, params)
};
kony.model.log.info = function(msg, params) {
    kony.model.logger(kony.model.log.INFO, "MVVM", msg, params)
};
kony.model.log.warn = function(msg, params) {
    kony.model.logger(kony.model.log.WARN, "MVVM", msg, params)
};
kony.model.log.error = function(msg, params) {
    kony.model.logger(kony.model.log.ERROR, "MVVM", msg, params)
};
kony.model.log.fatal = function(msg, params) {
    kony.model.logger(kony.model.log.FATAL, "MVVM", msg, params)
};
kony.model.log.setLogLevel = function(level, logSuccessCallback, logFailureCallback) {
    switch (level) {
        case kony.model.log.NONE:
            kony.model.currentLogLevel = kony.model.log.NONE;
            break;
        case kony.model.log.TRACE:
            kony.model.currentLogLevel = kony.model.log.TRACE;
            break;
        case kony.model.log.INFO:
            kony.model.currentLogLevel = kony.model.log.INFO;
            break;
        case kony.model.log.WARN:
            kony.model.currentLogLevel = kony.model.log.WARN;
            break;
        case kony.model.log.ERROR:
            kony.model.currentLogLevel = kony.model.log.ERROR;
            break;
        case kony.model.log.FATAL:
            kony.model.currentLogLevel = kony.model.log.FATAL;
            break;
        case kony.model.log.DEBUG:
            kony.model.currentLogLevel = kony.model.log.DEBUG;
            break;
        default:
            kony.model.log.error("Failed in setting log level " + level);
            logFailureCallback("Failed in setting log level " + level);
            return
    }
    kony.model.log.info("Log Level successfully set to " + kony.model.currentLogLevel.name);
    logSuccessCallback("Log Level successfully set to " + kony.model.currentLogLevel.name)
};
kony.model.log.isDebugEnabled = function() {
    return kony.model.currentLogLevel.value >= kony.model.log.DEBUG.value
};
kony.model.log.isTraceEnabled = function() {
    return kony.model.currentLogLevel.value >= kony.model.log.TRACE.value
};
kony.model.log.isInfoEnabled = function() {
    return kony.model.currentLogLevel.value >= kony.model.log.INFO.value
};
kony.model.log.isWarnEnabled = function() {
    return kony.model.currentLogLevel.value >= kony.model.log.WARN.value
};
kony.model.log.isFatalEnabled = function() {
    return kony.model.currentLogLevel.value >= kony.model.log.FATAL.value
};
kony.model.log.isErrorEnabled = function() {
    return kony.model.currentLogLevel.value >= kony.model.log.ERROR.value
};
kony.model.log.isNoneEnabled = function() {
    return kony.model.currentLogLevel.value === kony.model.log.NONE.value
};
kony.model.log.getCurrentLogLevel = function() {
    return kony.model.currentLogLevel
};
kony.model.Util.isNullOrUndefined = function(val) {
    if (val === null || val === undefined) {
        return true
    } else {
        return false
    }
};
kony.model.Util.isValidJs = function(inputTable) {
    if (kony.model.Util.isNullOrUndefined(inputTable)) {
        return false
    }
    return kony.type(inputTable) === "object" || kony.type(inputTable) === "Object" || kony.type(inputTable) === "Array"
};
kony.model.logger = function(logLevel, tag, msg, params) {
    if (logLevel.value <= kony.model.currentLogLevel.value) {
        params = typeof params === "undefined" ? "" : params;
        if (tag === undefined || tag === null) {
            tag = "AFN"
        }
        if (kony.model.Util.isValidJs(params)) {
            params = kony.model.Util.stringifyObject(params)
        }
        var date = (new Date).toLocaleDateString();
        var time = (new Date).toLocaleTimeString();
        var level = logLevel.code;
        var formattedMessage = "[" + date + "][" + time + "][" + tag + "][" + level + "] : " + msg + " " + params;
        if (kony.model.error_alert && logLevel.value == kony.model.log.ERROR.value) alert(formattedMessage);
        kony.print(formattedMessage)
    }
};
kony.model.Util.stringifyObject = function(obj) {
    var str;
    try {
        if (obj instanceof Error || obj instanceof kony.model.Exception) {
            str = obj.toString()
        } else {
            str = JSON.stringify(obj)
        }
    } catch (e) {
        str = ""
    }
    return str
};
kony.model.print = function(statement) {
    if (typeof kony !== "undefined" && typeof kony.print === "function") {
        kony.print(statement)
    } else if (typeof console !== "undefined" && typeof console.log === "function") {
        console.log(statement)
    }
};
kony = kony || {};
kony.model = kony.model || {};
kony.model.DataAccessAppsExceptionCode = {
    CD_ERROR_10000: 1e4,
    CD_ERROR_10001: 10001,
    CD_ERROR_10002: 10002,
    CD_ERROR_10003: 10003,
    CD_ERROR_10004: 10004,
    CD_ERROR_10005: 10005,
    CD_ERROR_10006: 10006,
    CD_ERROR_10007: 10007,
    CD_ERROR_10008: 10008,
    CD_ERROR_10009: 10009,
    CD_ERROR_10010: 10010,
    CD_ERROR_10011: 10011,
    CD_ERROR_10012: 10012,
    CD_ERROR_10013: 10013,
    CD_ERROR_10014: 10014,
    CD_ERROR_10015: 10015,
    CD_ERROR_10016: 10016,
    CD_ERROR_10017: 10017,
    CD_ERROR_10018: 10018,
    CD_ERROR_10019: 10019,
    CD_ERROR_10020: 10020,
    CD_ERROR_10021: 10021,
    CD_ERROR_10022: 10022,
    CD_ERROR_10023: 10023,
    CD_ERROR_10024: 10024,
    CD_ERROR_10025: 10025,
    CD_ERROR_10026: 10026,
    CD_ERROR_10027: 10027,
    CD_ERROR_10028: 10028,
    CD_ERROR_10029: 10029,
    CD_ERROR_10030: 10030,
    CD_ERROR_10031: 10031,
    CD_ERROR_10032: 10032,
    CD_ERROR_10033: 10033,
    CD_ERROR_10034: 10034,
    CD_ERROR_10035: 10035,
    CD_ERROR_10036: 10036,
    CD_ERROR_10037: 10037,
    CD_ERROR_10038: 10038,
    CD_ERROR_10039: 10039,
    CD_ERROR_10040: 10040,
    CD_ERROR_10041: 10041,
    CD_ERROR_10042: 10042,
    CD_ERROR_10043: 10043,
    CD_ERROR_10044: 10044,
    CD_ERROR_10045: 10045,
    CD_ERROR_10046: 10046,
    CD_ERROR_10047: 10047,
    CD_ERROR_10048: 10048,
    CD_ERROR_10049: 10049,
    CD_ERROR_10050: 10050,
    CD_ERROR_10051: 10051,
    CD_ERROR_10052: 10052,
    CD_ERROR_10053: 10053,
    CD_ERROR_10054: 10054,
    CD_ERROR_10055: 10055,
    CD_ERROR_10056: 10056,
    CD_ERROR_10057: 10057,
    CD_ERROR_10058: 10058,
    CD_ERROR_10059: 10059,
    CD_ERROR_10060: 10060,
    CD_ERROR_10061: 10061,
    CD_ERROR_10062: 10062,
    CD_ERROR_10063: 10063,
    CD_ERROR_10064: 10064,
    CD_ERROR_10065: 10065,
    CD_ERROR_10066: 10066,
    CD_ERROR_10067: 10067,
    CD_ERROR_10068: 10068,
    CD_ERROR_10069: 10069,
    CD_ERROR_10070: 10070,
    CD_ERROR_10071: 10071,
    CD_ERROR_10072: 10072,
    CD_ERROR_10073: 10073,
    CD_ERROR_10074: 10074,
    CD_ERROR_10075: 10075,
    CD_ERROR_10076: 10076,
    CD_ERROR_10077: 10077,
    CD_ERROR_10078: 10078,
    CD_ERROR_10079: 10079,
    CD_ERROR_10080: 10080,
    CD_ERROR_10081: 10081,
    CD_ERROR_10082: 10082,
    CD_ERROR_10083: 10083,
    CD_ERROR_10084: 10084,
    CD_ERROR_10085: 10085,
    CD_ERROR_10086: 10086,
    CD_ERROR_10087: 10087,
    CD_ERROR_10088: 10088,
    CD_ERROR_10089: 10089,
    CD_ERROR_10090: 10090,
    CD_ERROR_10091: 10091,
    CD_ERROR_10092: 10092,
    CD_ERROR_10094: 10094,
    CD_ERROR_10095: 10095,
    CD_ERROR_10096: 10096,
    CD_ERROR_10097: 10097,
    CD_ERROR_10098: 10098,
    CD_ERROR_10099: 10099,
    CD_ERROR_10100: 10100,
    CD_ERROR_10101: 10101,
    CD_ERROR_10102: 10102,
    CD_ERROR_10104: 10104,
    CD_ERROR_10105: 10105,
    CD_ERROR_10106: 10106,
    CD_ERROR_10108: 10108,
    CD_ERROR_10109: 10109,
    CD_ERROR_10110: 10110,
    CD_ERROR_10111: 10111,
    CD_ERROR_10112: 10112,
    CD_ERROR_10113: 10113,
    CD_ERROR_10114: 10114,
    CD_ERROR_10115: 10115,
    CD_ERROR_10116: 10116,
    CD_ERROR_10117: 10117,
    CD_ERROR_10118: 10118,
    CD_ERROR_10119: 10119,
    CD_ERROR_10120: 10120,
    CD_ERROR_10121: 10121,
    CD_ERROR_10122: 10122,
    CD_ERROR_10123: 10123,
    CD_ERROR_10124: 10124,
    CD_ERROR_10125: 10125,
    CD_ERROR_10126: 10126,
    CD_ERROR_10127: 10127,
    CD_ERROR_10128: 10128,
    CD_ERROR_10129: 10129,
    CD_ERROR_10130: 10130,
    CD_ERROR_10131: 10131,
    CD_ERROR_10132: 10132,
    CD_ERROR_10133: 10133,
    CD_ERROR_10134: 10134,
    CD_ERROR_10135: 10135,
    CD_ERROR_10136: 10136,
    CD_ERROR_10137: 10137,
    CD_ERROR_10138: 10138,
    CD_ERROR_10139: 10139,
    CD_ERROR_10140: 10140,
    CD_ERROR_10141: 10141,
    CD_ERROR_10142: 10142,
    CD_ERROR_10143: 10143,
    CD_ERROR_10144: 10144,
    CD_ERROR_10145: 10145,
    CD_ERROR_10146: 10146,
    CD_ERROR_10147: 10147,
    CD_ERROR_10148: 10148,
    CD_ERROR_10149: 10149,
    MSG_ERROR_10000: "Unable to execute delete query",
    MSG_ERROR_10001: "SQLLite Error occurred",
    MSG_ERROR_10002: "Invalid Table configuration in the Database",
    MSG_ERROR_10003: "Entity does not exist in the Database",
    MSG_ERROR_10004: "There is no relationship/definiton defined for the Entity in Enterprise DB",
    MSG_ERROR_10005: "Invalid column name",
    MSG_ERROR_10006: "Column does not exist in the Database",
    MSG_ERROR_10007: "Unable to execute Insert query",
    MSG_ERROR_10008: "Specified column datatype doesnot match with datatype from field mapping",
    MSG_ERROR_10009: "Unique constraint check failed as the data already exist in DB",
    MSG_ERROR_10010: "Specified foreign key is not found",
    MSG_ERROR_10011: "Unable to execute Select query",
    MSG_ERROR_10012: "Invalid Meta Column Name Usage. Correct usage is COLUMNNAME__f",
    MSG_ERROR_10013: "Invalid Meta Column Name Usage in Join Clause. Correct usage is COLUMNNAME__f",
    MSG_ERROR_10014: "Unable to execute update query",
    MSG_ERROR_10015: "No columns specified for updating",
    MSG_ERROR_10016: "Column name either null or empty in update builder",
    MSG_ERROR_10017: "Specified foreign key is not found, Rolled back transaction",
    MSG_ERROR_10018: "Value is null",
    MSG_ERROR_10019: "Column data type does not match the value",
    MSG_ERROR_10020: "No columns specified for update",
    MSG_ERROR_10021: "Invalid table name",
    MSG_ERROR_10022: "Connection NOT created from pool",
    MSG_ERROR_10023: "User id invalid",
    MSG_ERROR_10024: "Invalid arguments to com.kony.common.DataAccess.Query.Between Constructor",
    MSG_ERROR_10025: "Invalid arguments to setColumn of com.kony.common.DataAccess.Query.Between",
    MSG_ERROR_10026: "Invalid arguments to setRange of com.kony.common.DataAccess.Query.Between",
    MSG_ERROR_10027: "Invalid Column name passed to com.kony.common.DataAccess.Query.Column Constructor .\nExpected:Table\nActual:",
    MSG_ERROR_10028: "Invalid data type for the attribute in com.kony.common.DataAccess.Query.Column Constructor",
    MSG_ERROR_10029: "Invalid ColumnName to SetName of com.kony.common.DataAccess.Query.Column",
    MSG_ERROR_10030: "Invalid arguments to setTable of com.kony.common.DataAccess.Query.Column",
    MSG_ERROR_10031: "Invalid arguments to com.kony.common.DataAccess.Query.Range.DateRange Constructor",
    MSG_ERROR_10032: "Invalid arguments to setEnd of com.kony.common.DataAccess.Query.Range.DateRange",
    MSG_ERROR_10033: "Invalid arguments to setStart of com.kony.common.DataAccess.Query.Range.DateRange",
    MSG_ERROR_10034: "Invalid arguments to com.kony.common.DataAccess.Query.Range.DecimalRange Constructor",
    MSG_ERROR_10035: "Invalid arguments to setEnd of com.kony.common.DataAccess.Query.Range.DecimalRange",
    MSG_ERROR_10036: "Invalid arguments to setStart of com.kony.common.DataAccess.Query.Range.DecimalRange",
    MSG_ERROR_10037: "Invalid data type for the attribute subSelect in com.kony.common.DataAccess.Query.Exists Constructor \nExpected:SelectQuery\nActual:",
    MSG_ERROR_10038: "Invalid data type for the attribute subSelect in com.kony.common.DataAccess.Query.Exists.prototype.setSubSelect \nExpected:SelectQuery\nActual:",
    MSG_ERROR_10039: "Invalid arguments to com.kony.common.DataAccess.Query.Expression Constructor",
    MSG_ERROR_10040: "Invalid number of arguments to com.kony.common.DataAccess.Query.Expression",
    MSG_ERROR_10041: "Invalid Operator type passed to com.kony.common.DataAccess.Query.Expression",
    MSG_ERROR_10042: "Invalid arguments for the attribute com.kony.common.DataAccess.Query.Expression initExpression",
    MSG_ERROR_10043: "Invalid arguments for the attribute com.kony.common.DataAccess.Query.Expression setExpression",
    MSG_ERROR_10044: "Invalid arguments for the attribute com.kony.common.DataAccess.Query.Expression setTerm",
    MSG_ERROR_10045: "Invalid arguments to setEnd of com.kony.common.DataAccess.Query.Range.FloatRange",
    MSG_ERROR_10046: "Invalid arguments to setStart of com.kony.common.DataAccess.Query.Range.FloatRange",
    MSG_ERROR_10047: "Invalid argument for the attribute in com.kony.common.DataAccess.Query.Group",
    MSG_ERROR_10048: "Invalid arguments for the attribute in com.kony.common.DataAccess.Query.Group.prototype.setColumn",
    MSG_ERROR_10049: "Invalid number of arguments passed to com.kony.common.DataAccess.Query.InCriteria",
    MSG_ERROR_10050: "Invalid arguments for getInCriteriaByTableAndCollection in com.kony.common.DataAccess.Query.InCriteria",
    MSG_ERROR_10051: "Invalid arguments for getInCriteriaByColumnAndCollection in com.kony.common.DataAccess.Query.InCriteria",
    MSG_ERROR_10052: "Invalid arguments for getColumnForTable in com.kony.common.DataAccess.Query.InCriteria",
    MSG_ERROR_10053: "Invalid arguments to com.kony.common.DataAccess.Query.Range.IntegerRange Constructor",
    MSG_ERROR_10054: "Invalid arguments to setEnd of com.kony.common.DataAccess.Query.Range.IntegerRange",
    MSG_ERROR_10055: "Invalid arguments to setStart of com.kony.common.DataAccess.Query.Range.IntegerRange",
    MSG_ERROR_10056: "Invalid arguments passed for  com.kony.common.DataAccess.Query.Join",
    MSG_ERROR_10057: "Invalid arguments passed for the method in com.kony.common.DataAccess.Query.Join",
    MSG_ERROR_10058: "Invalid arguments passed for the method setCriteria in com.kony.common.DataAccess.Query.Join",
    MSG_ERROR_10059: "Invalid arguments passed for the method setTable in com.kony.common.DataAccess.Query.Join",
    MSG_ERROR_10060: "Invalid arguments passed for the method setJoinType in com.kony.common.DataAccess.Query.Join",
    MSG_ERROR_10061: "Invalid arguments passed for the method initCriteria in com.kony.common.DataAccess.Query.Join",
    MSG_ERROR_10062: "Insufficient input passed to com.kony.common.DataAccess.Query.And Constructor",
    MSG_ERROR_10063: "Invalid data type for com.kony.common.DataAccess.Query.And Expected value Criteria",
    MSG_ERROR_10064: "Insufficient input passed to com.kony.common.DataAccess.Query.Or Constructor",
    MSG_ERROR_10065: "Invalid data type for com.kony.common.DataAccess.Query.Or Expected value Criteria",
    MSG_ERROR_10066: "Insufficient input passed to com.kony.common.DataAccess.Query.Not Constructor",
    MSG_ERROR_10067: "Invalid data type for com.kony.common.DataAccess.Query.Not Expected value Criteria",
    MSG_ERROR_10068: "Invalid match type passed in com.kony.common.DataAccess.Query.Match.prototype.initMatchByColumn",
    MSG_ERROR_10069: "Invalid value passed in com.kony.common.DataAccess.Query.Match.prototype.initMatchByColumn",
    MSG_ERROR_10070: "Invalid arguments passed for the method initMatchByColumn in com.kony.common.DataAccess.Query.Match.prototype.initMatchByColumn.",
    MSG_ERROR_10071: "Invalid match type passed in com.kony.common.DataAccess.Query.Match.prototype.initMatchByTableAndColName",
    MSG_ERROR_10072: "Invalid value passed in com.kony.common.DataAccess.Query.Match.prototype.initMatchByTableAndColName",
    MSG_ERROR_10073: "Invalid columnName passed in com.kony.common.DataAccess.Query.Match.prototype.initMatchByTableAndColName",
    MSG_ERROR_10074: "Invalid arguments passed for the method initMatchByTableAndColName in com.kony.common.DataAccess.Query.Match",
    MSG_ERROR_10075: "Match object not initialized properly  in com.kony.common.DataAccess.Query.Match",
    MSG_ERROR_10076: "Invalid arguments passed for the constructor in com.kony.common.DataAccess.Query.Order",
    MSG_ERROR_10077: "Invalid arguments for the method setColumn in com.kony.common.DataAccess.Query.Order",
    MSG_ERROR_10078: "Invalid arguments to com.kony.common.DataAccess.Query.Range.StringRange Constructor",
    MSG_ERROR_10079: "Invalid arguments to setEnd of com.kony.common.DataAccess.Query.Range.StringRange",
    MSG_ERROR_10080: "Invalid arguments to setStart of com.kony.common.DataAccess.Query.Range.StringRange",
    MSG_ERROR_10081: "Invalid Arguments passed to DeleteBuilder.addCriteria",
    MSG_ERROR_10082: "Invalid data type for the attribute in DeleteBuilder.addCriteria. Expected: Criteria | Actual:",
    MSG_ERROR_10083: "Invalid data type for the attribute in DeleteBuilder . Expected: Table | Actual:",
    MSG_ERROR_10084: "Invalid data type for the attribute in com.kony.common.DataAccess.Query.InsertQuery .\nExpected:Table\nActual:",
    MSG_ERROR_10085: "Invalid data type for the attribute in com.kony.common.DataAccess.Query.InsertQuery.prototype.addColumn .\nExpected:Column\nActual:",
    MSG_ERROR_10086: "Invalid data type for the attribute in com.kony.common.DataAccess.Query.InsertQuery.prototype.addColumnToTable .\nExpected:String\nActual:",
    MSG_ERROR_10087: "Invalid data type for the attribute in com.kony.common.DataAccess.Query.InsertQuery.prototype.addColumnToTable .\nExpected:Table\nActual:",
    MSG_ERROR_10088: "Invalid data type for the attribute in com.kony.common.DataAccess.Query.InsertQuery.prototype.removeColumn .\nExpected:Table\nActual:",
    MSG_ERROR_10089: "Invalid Arguments passed to SelectBuilder",
    MSG_ERROR_10090: "Invalid data type for the attribute in SelectBuilder .\nExpected:Table\nActual:",
    MSG_ERROR_10091: "Invalid Arguments passed to selectBuilder.addColumn",
    MSG_ERROR_10092: "Invalid data type for the attribute in selectBuilder.addColumn .\nExpected:Column\nActual:",
    MSG_ERROR_10094: "Invalid data type for the attribute in SelectBuilder.\nExpected:Table\nActual:",
    MSG_ERROR_10095: "Invalid Arguments of Alias passed to selectBuilder ",
    MSG_ERROR_10096: "Invalid data type for the attribute in selectBuilder.\nExpected:Table\nActual:",
    MSG_ERROR_10097: "Invalid Arguments passed to selectBuilder.addCriteria",
    MSG_ERROR_10098: "Invalid data type for the attribute in selectBuilder.addCriteria .\nExpected:Criteria\nActual:",
    MSG_ERROR_10099: "Invalid Arguments passed to selectBuilder.addGroup",
    MSG_ERROR_10100: "Invalid data type for the attribute in selectBuilder.addGroup .\nExpected:Group\nActual:",
    MSG_ERROR_10101: "Invalid Arguments passed to selectBuilder.addJoin",
    MSG_ERROR_10102: "Invalid data type for the attribute in SelectBuilder.addJoin .\nExpected:Criteria\nActual:",
    MSG_ERROR_10104: "Invalid data type for the attribute in SelectBuilder",
    MSG_ERROR_10105: "Invalid Arguments passed to selectBuilder.addOrder",
    MSG_ERROR_10106: "Invalid data type for the attribute in selectBuilder.addOrder \nExpected:Order\nActual:",
    MSG_ERROR_10108: "Invalid data type for the attribute in SelectBuilder \nExpected:Table\nActual:",
    MSG_ERROR_10109: "Invalid Arguments passed to selectBuilder.removeColumn",
    MSG_ERROR_10110: "Invalid data type for the attribute in selectBuilder.removeColumn \nExpected:Column\nActual:",
    MSG_ERROR_10111: "Invalid Arguments passed to selectBuilder.removeCriteria",
    MSG_ERROR_10112: "Invalid data type for the attribute in selectBuilder.removeCriteria \nExpected:Criteria\nActual:",
    MSG_ERROR_10113: "Invalid Arguments passed to selectBuilder.removeGroup",
    MSG_ERROR_10114: "Invalid data type for the attribute in selectBuilder.removeGroup \nExpected:Group\nActual:",
    MSG_ERROR_10115: "Invalid Arguments passed to selectBuilder.removeJoin",
    MSG_ERROR_10116: "Invalid data type for the attribute in selectBuilder.removeJoin \nExpected:Group\nActual:",
    MSG_ERROR_10117: "Invalid data type for the attribute in SelectBuilder \nExpected:Group\nActual:",
    MSG_ERROR_10118: "Invalid Arguments passed to UpdateQuery",
    MSG_ERROR_10119: "Invalid data type for the attribute in UpdateQuery .\nExpected:Table\nActual:",
    MSG_ERROR_10120: "Invalid Arguments passed to UpdateBuilder.addColumn method",
    MSG_ERROR_10121: "Invalid data type for the attribute in UpdateBuilder.addColumn method",
    MSG_ERROR_10122: "Invalid Arguments passed to UpdateBuilder.addColumnByColumnNameAndValue",
    MSG_ERROR_10123: "Invalid data type for the attribute in UpdateBuilder.addColumnByColumnNameAndValue",
    MSG_ERROR_10124: "Invalid Arguments passed to UpdateBuilder.addCriteria",
    MSG_ERROR_10125: "Invalid data type for the attribute in UpdateBuilder.addCriteria .\nExpected:Criteria\nActual:",
    MSG_ERROR_10126: "Invalid Arguments passed to UpdateBuilder.removeCriteria",
    MSG_ERROR_10127: "Invalid data type for the attribute in UpdateBuilder.removeCriteria .\nExpected:Criteria\nActual:",
    MSG_ERROR_10128: "Invalid Arguments passed to UpdateBuilder",
    MSG_ERROR_10129: "Invalid data type for the attribute in UpdateBuilder .\nExpected:Table\nActual:",
    MSG_ERROR_10130: "Invalid number of arguments to com.kony.common.DataAccess.Query.InsertQuery.prototype.addColumn",
    MSG_ERROR_10131: "unknown database error occured. please verify the table and columns names.",
    MSG_ERROR_10132: "No parent keys found.",
    MSG_ERROR_10133: "field object is empty",
    MSG_ERROR_10134: "Given JoinType doesn't support",
    MSG_ERROR_10135: "Cannot insert record as the integrity failed with",
    MSG_ERROR_10136: "error occurred during language fetch",
    MSG_ERROR_10137: "No logical fields exist for the table",
    MSG_ERROR_10138: "unknown database error occured. please verify the table and column names/values.",
    MSG_ERROR_10139: "Invalid number of arguments to com.kony.common.DataAccess.Query.Match",
    MSG_ERROR_10140: "Invalid number of arguments to com.kony.common.DataAccess.Query.Join",
    MSG_ERROR_10141: "Entity with name doesn't exist",
    MSG_ERROR_10142: "Invalid Meta Column Name Usage, Correct usage COLUMNNAME__f",
    MSG_ERROR_10143: "Table does not exist in the database",
    MSG_ERROR_10144: "Column does not exist in table",
    MSG_ERROR_10145: "Table is undefined.Please provide valid table name",
    MSG_ERROR_10146: "Invalid Arguments passed to DeleteBuilder",
    MSG_ERROR_10147: "Invalid Arguments passed to InsertBuilder",
    MSG_ERROR_10148: "No data found to update with the selected criteria",
    MSG_ERROR_10149: "The request could not be completed."
};
kony.model.Exception = function() {
    function toStringRecursive(exception, output) {
        var intermOutput;
        if (exception == undefined) return output.append("");
        if (exception.getErrorObj()) {
            if (exception.getErrorObj().name && exception.getErrorObj().message) output.append(exception.getErrorObj().name + ": " + exception.getErrorObj().message + ": " + exception.getErrorObj().sourceURL);
            else output.append(JSON.stringify(exception.getErrorObj()));
            output.append("\n");
            return output.append(exception.code + ":" + exception.message + "\n")
        }
        intermOutput = toStringRecursive(exception.exceptionObj, output);
        intermOutput.append(exception.code + ":" + exception.message);
        intermOutput.append("\n");
        return intermOutput
    }

    function getRootErrObj(exception) {
        if (exception && exception.exceptionObj != undefined && exception.getErrorObj() == undefined) {
            var intermErrObj = getRootErrObj(exception.exceptionObj);
            return intermErrObj
        } else if (exception && exception.exceptionObj == undefined && exception.getErrorObj() != undefined) {
            return exception.getErrorObj()
        } else {
            return undefined
        }
    }

    function Exception(code, message, exceptionObj) {
        this.code = typeof code === "number" ? code : -1;
        this.message = typeof message === "string" ? message : "";
        this.name = "Exception";
        var actualErrorObj;
        if (exceptionObj instanceof kony.model.Exception) {
            this.exceptionObj = exceptionObj;
            actualErrorObj = undefined
        } else {
            actualErrorObj = exceptionObj;
            this.exceptionObj = undefined
        }
        this.getErrorObj = function() {
            return actualErrorObj
        };
        this.getParentException = function() {
            return this.exceptionObj
        }
    }
    inheritsFrom(Exception, Error);
    Exception.prototype.toString = function() {
        var output = new kony.model.Util.StringBuffer;
        output = toStringRecursive(this, output);
        return output.toString()
    };
    Exception.prototype.alert = function(full) {
        if (full === true) {
            var output = new kony.model.Util.StringBuffer;
            output = toStringRecursive(this, output);
            alert(output.toString())
        } else alert(this.code + ":" + this.name + ":" + this.message)
    };
    Exception.prototype.setSyncResponse = function(response) {
        this.syncresponse = response
    };
    Exception.prototype.getRootErrorObj = function() {
        var rootErrObj = getRootErrObj(this);
        return rootErrObj
    };
    return Exception
}();
kony.model.ExceptionCode = {
    CD_ERROR_LOADING_TEMPLATES: 3,
    CD_ERROR_FAILED_TO_CREATE_RECORD: 9,
    CD_ERROR_FAILED_TO_UPDATE_RECORD: 10,
    CD_ERROR_CALLBACK_NOT_A_FUNCTION: 11,
    CD_ERROR_LOGIN_FAILURE: 12,
    CD_ERROR_SESSION_TOKEN_INVALID: 13,
    CD_ERROR_FAILED_TO_SAVE_FORM: 14,
    CD_ERROR_FAILED_TO_FETCH_DATA: 15,
    CD_ERROR_FAILED_TO_INITIALIZE_FORM: 16,
    CD_ERROR_FETCHING_METADATA: 17,
    CD_ERROR_MORE_RECORDS_FOUND: 18,
    CD_ERROR_FETCHING_TEMPLATES: 19,
    CD_ERROR_FETCHING_FORMS: 20,
    CD_ERROR_INITIALIZING_UI_CONFIG_DATA_PROVIDER: 21,
    CD_ERROR_INITIALIZING_METADATA_PROVIDER: 22,
    CD_ERROR_INITIALIZING_DATA_PROVIDER: 23,
    CD_ERROR_FAILED_TO_LOAD_APPLICATION: 24,
    CD_ERROR_APP_INITIALIZATION_FAILED: 25,
    CD_ERROR_INITIALIZING_SAAS_APP: 26,
    CD_ERROR_FORMVIEWCONTROLLER_NOT_FOUND: 27,
    CD_ERROR_NAVIGATION_STACK_EMPTY: 28,
    CD_ERROR_FORM_NOT_FOUND: 29,
    CD_ERROR_METADATA_FOR_ENTITY_NOT_FOUND: 30,
    CD_ERROR_NO_FIELDS_MODIFIED_UPDATE_FAILED: 31,
    CD_ERROR_PRIMARY_FIELD_VALUE_NOT_FOUND: 32,
    CD_ERROR_UNDEFINED_WIDGET_CONTROLLER: 33,
    CD_ERROR_FAILED_TO_LOGOUT: 35,
    CD_ERROR_FAILED_LOADING_MASTER_DATA: 36,
    CD_ERROR_FAILED_TO_NAVIGATE_TO_FORM: 37,
    CD_ERROR_PARSING_JSONS: 38,
    CD_ERROR_FAILED_LOADING_FORMS: 39,
    CD_ERROR_FAILED_FORM_INIT_WHILE_CALLBACK: 40,
    CD_ERROR_KONY_FORM_OBJECT_UNDEFINED: 41,
    CD_ERROR_SAVE_CANNOT_SET_PRIMARY_KEY: 42,
    CD_ERROR_FETCH_FAILED_FOR_CHILD_ENTITY: 43,
    CD_ERROR_GET_NEXT_LIST: 44,
    CD_ERROR_UNSUPPORTED_SEGMENT_TYPE: 45,
    CD_ERROR_NOT_INHERITING_VIEW_CONTROLLER: 46,
    CD_ERROR_NOT_INHERITING_WIDGET_CONTROLLER: 47,
    CD_ERROR_FAILED_BINDING_DATA_TO_WIDGET: 48,
    CD_ERROR_PAGINATION_NOT_ENABLED_FOR_SEGMENT: 49,
    CD_ERROR_PARAM_VALUE_NOT_DEFINED_IN_QUERYPARAM: 50,
    CD_ERROR_BRACES_ARE_NOT_DEFINED_PROPERLY: 51,
    CD_ERROR_ADDITIONAL_FIELDS_ARE_NOT_DEFINED_PROPERLY: 52,
    CD_ERROR_QUERY_NOT_DEFINED_PROPERLY: 53,
    CD_ERROR_QUERYPARAMS_NOT_DEFINED_PROPERLY: 54,
    CD_ERROR_MATCHOPERATOR_NOT_DEFINED_PROPERLY: 55,
    CD_ERROR_DATA_VALIDATION_FIELD_NOT_CREATEABLE: 56,
    CD_ERROR_DATA_VALIDATION_FIELD_NOT_UPDATEABLE: 57,
    CD_ERROR_DATA_VALIDATION_FIELD_NOT_NULLABLE: 58,
    CD_ERROR_DATA_VALIDATION_INVALID_INPUT_DATA: 59,
    CD_ERROR_DATA_VALIDATION_INVALID_MODEL: 60,
    CD_ERROR_DATA_VALIDATION_INVALID_ENTITY: 61,
    CD_ERROR_DATA_VALIDATION_ENTITYMETADATA_NOTFOUND: 62,
    CD_ERROR_CREATING_APPMENU: 63,
    CD_ERROR_FETCHING_APPMENU_DATA: 64,
    CD_ERROR_FIELD_NOT_PRESENT: 65,
    cd_ERROR_ENITTY_NOT_PRESENT: 66,
    CD_TENANT_NOT_SYNC_ENABLED: 67,
    CD_INVALID_QUERY: 68,
    CD_ERROR_FETCH_USER_PROFILE_FAILURE: 69,
    CD_RESOURCE_NO_CREATE_PERMISSION: 74,
    CD_RESOURCE_NO_READ_PERMISSION: 75,
    CD_RESOURCE_NO_UPDATE_PERMISSION: 76,
    CD_RESOURCE_NO_DELETE_PERMISSION: 77,
    CD_ERROR_OFFLINE_LOGIN_FAILURE: 70,
    CD_ERROR_UNABLE_TO_SYNC: 71,
    CD_ERROR_UNABLE_TO_GET_SYNC_CONFIG: 72,
    CD_ERROR_UNABLE_TO_RESET_SYNC: 73,
    CD_ERROR_NO_RESPONSE_RECEIVED: 78,
    CD_ERROR_NETWORK_UNAVAILABLE: 79,
    CD_ERROR_IN_SET_ADDITIONAL_FIELDS: 80,
    CD_ERROR_IN_SET_QUERY: 81,
    CD_ERROR_IN_SET_QUERY_PARAMS: 82,
    CD_ERROR_ENTER_VALID_TENANT_NAME: 83,
    CD_ERROR_NAVIGATION_CONTROLLER_NOT_DEFINED: 84,
    CD_ERROR_ENTITY_NOT_SPECIFIED: 85,
    CD_ERROR_FORMTYPE_NOT_SPECIFIED: 86,
    CD_ERROR_FORM_NOT_DEFINED_FOR_RECORDTYPE: 87,
    CD_ERROR_RECORDTYPES_NOT_AVAILABLE: 88,
    CD_ERROR_FORMSFORRECORDTYPES_MAP_NOT_DEFINED: 89,
    CD_ERROR_SAAS_INSTANCE_NOTDEFINED: 90,
    CD_ERROR_INVALID_ENTITY: 91,
    CD_VERSION_UNSUPPORTED_ERROR: 92,
    CD_ERROR_ASSOCIATING_RECORD: 93,
    CD_ERROR_DISOCIATING_RECORD: 94,
    CD_ERROR_NOT_INSTANCE_OF_CUSTOMINFO: 95,
    CD_ERROR_FORM_ENTITY_NOT_FOUND: 96,
    CD_ERROR_FORM_PRIMARY_FIELDVALUE_NOT_FOUND: 97,
    CD_ERROR_CANNOT_ASSOCIATE_DISSOCIATE_OF_SAME_ENTITY: 98,
    CD_ERROR_SAVING_MULTI_ENTITY_LABEL: 99,
    CD_ERROR_SAVING_CHILD_CONTAINER: 100,
    CD_ERROR_DECODING_BASE64_FORMJS: 102,
    CD_ERROR_BATCH_INSERT: 103,
    CD_ERROR_LOCAL_DB_CONNECTION: 104,
    CD_ERROR_EXECUTE_SINGLE_SQL_QUERY: 105,
    CD_UPGRADE_UNAVAILABLE: 106,
    CD_ERROR_I18N: 107,
    CD_INVALID_LOGIN_HANDLER_RESPONSE: 108,
    CD_ERROR_FAILED_TO_QUERY_DATA: 109,
    CD_ERROR_LOADING_THEME: 110,
    CD_ERROR_SETTING_THEME: 111,
    CD_ERROR_FETCHING_THEME: 112,
    CD_ERROR_MULTIPLE_DEFAULT_THEME: 113,
    CD_ERROR_CREATING_THEME: 114,
    CD_ERROR_METHOD_INVALID: 115,
    CD_ERROR_INVALID_HTTPCUSTOMREQUEST_INPUT: 116,
    CD_ERROR_INVALID_INPUT: 117,
    CD_ERROR_INVALID_INPUT_TYPE: 118,
    CD_ERROR_INVALID_PAYLOAD: 119,
    CD_ERROR_INVALID_DATAPROVIDER_TYPE: 120,
    CD_ERROR_DATAPROVIDER_NOT_INTIALIZED: 121,
    CD_ERROR_INVALID_CUSTOMSERVICE_INPUT_PARAM: 122,
    CD_ERROR_UNEXPECTED_CUSTOMRESPONSE: 123,
    CD_CLOUD_UNAUTHORISED_FOR_DATAPROVIDER: 124,
    CD_CREDSTORE_NOT_FOUND: 125,
    CD_CREDENTIAL_MISMATCH_WITH_CREDSTORE: 126,
    CD_ERROR_TENANT_NOT_SPECIFIED: 50003,
    CD_ERROR_UNABLE_TO_CONNECT: 50004,
    CD_ERROR_SYNC_FAILURE: 50005,
    CD_ERROR_LANDING_PAGE_NOT_DEFINED: 50007,
    CD_ERROR_INVALID_PARAM1: 50008,
    CD_ERROR_ENTITY_CONTROLLER_NOT_DEFINED: 10001,
    CD_ERROR_IN_ENTITY_DEFINITION: 10002,
    CD_ERROR_IN_RETREIVNING_CHILD_RELATIONSHIPLIST: 10003,
    CD_ERROR_FETCHING_DATA_FOR_COLUMNS: 10004,
    CD_ERROR_FETCHING_CHILD_RELATIONSHP_FOR_ENTITY: 10005,
    CD_ERROR_PROCESSING_CHILD_RELATIONSHIPLIST: 10006,
    CD_ERROR_FETCH: 10007,
    CD_ERROR_CREATE: 10008,
    CD_ERROR_UPDATE: 10009,
    CD_ERROR_UPDATE_BY_PRIMARY_KEY: 10010,
    CD_ERROR_DELETE: 10011,
    CD_ERROR_DELETE_BY_PRIMARY_KEY: 10012,
    CD_ERROR_VALIDATION_UPDATE: 10013,
    CD_ERROR_VALIDATION_CREATE: 10014,
    CD_ERROR_GET_WIDGET_DATA_FORMMODEL: 20001,
    CD_ERROR_SET_WIDGET_DATA_FORMMODEL: 20002,
    CD_ERROR_FORMMODEL_PROPERTY_VALUE_CHANGED: 20003,
    CD_ERROR_FORMMODEL_CLEAR: 20004,
    CD_ERROR_FORMMODEL_DESTROY: 20005,
    CD_ERROR_FORMMODEL_UPDATE: 20006,
    CD_ERROR_FORMMODEL_SHOWVIEW: 20007,
    CD_ERROR_FORMMODEL_SET_MASTERDATA: 20008,
    CD_ERROR_FORMMODEL_GET_MASTERDATA: 20009,
    CD_ERROR_FORMMODEL_SET_VIEW_ATTRIBUTE: 20010,
    CD_ERROR_FORMMODEL_GET_VIEW_ATTRIBUTE: 20011,
    CD_ERROR_FORMMODEL_PERFORM_ACTION_ONVIEW: 20012,
    CD_ERROR_FORMMODEL_PERFORM_ACTION: 20013,
    CD_ERROR_NOTIFYING_OBSERVERS: 20014,
    CD_ERROR_FORMMODEL_PROPERTIES_INIT: 20015,
    CD_ERROR_FETCH_IN_CONTROLLER: 30001,
    CD_ERROR_BIND_IN_CONTROLLER: 30002,
    CD_ERROR_SAVE_IN_CONTROLLER: 30003,
    CD_ERROR_DELETE_IN_CONTROLLER: 30004,
    CD_ERROR_LOADDATA_SHOWFORM_CONTROLLER: 30005,
    CD_ERROR_GETTING_ENTITY_CONTROLLER: 30006,
    CD_ERROR_GETTING_ENTITY_METADATA: 30007,
    CD_ERROR_FETCH_IN_BASE_CONTROLLER_EXTENSION: 30008,
    CD_ERROR_BIND_IN_BASE_CONTROLLER_EXTENSION: 30009,
    CD_ERROR_SAVE_IN_BASE_CONTROLLER_EXTENSION: 30010,
    CD_ERROR_ACTION_NOT_FOUND_IN_CONTROLLER: 30011,
    CD_ERROR_FORMATDATA_IN_BASE_CONTROLLER_EXTENSION: 30012,
    CD_ERROR_FORMATDATA_IN_CONTROLLER: 30013,
    CD_ERROR_DELETE_IN_BASE_CONTROLLER_EXTENSION: 30014,
    CD_ERROR_GENERATE_RECORDS_IN_BASE_CONTROLLER_EXTENSION: 30015,
    CD_ERROR_FETCH_IN_CONTROLLER_EXTENSION: 40013,
    CD_ERROR_BINDDATA_IN_CONTROLLER_EXTENSION: 40014,
    CD_ERROR_SAVEDATA_IN_CONTROLLER_EXTENSION: 40015,
    CD_ERROR_DELETEDATA_IN_CONTROLLER_EXTENSION: 40016,
    CD_ERROR_PROCESSDATA_IN_CONTROLLER_EXTENSION: 40017,
    CD_ERROR_SHOWFORM_IN_CONTROLLER_EXTENSION: 40018,
    CD_ERROR_GET_DATA_WIDGETS_OF_FORM: 60001,
    CD_ERROR_GETTING_QUERY_WIDGETS_MAPPING: 60002,
    CD_ERROR_ORM_CONTROLLER_FETCH_RECORDS: 70001,
    CD_ERROR_ORM_CONTROLLER_FETCH_RECORDS_QUERIES_NOT_DEFINED: 70002,
    CD_ERROR_ORM_CONTROLLER_FETCH_RECORD_PK_NOT_DEFINED: 70003,
    CD_ERROR_ORM_CONTROLLER_FETCH_RECORD_PK: 70004,
    CD_ERROR_ORM_CONTROLLER_FETCH_RECORDS_BY_NATIVE_QUERY: 70005,
    CD_ERROR_ORM_CONTROLLER_FETCH_RECORDS_BY_COLUMN_DEFINITION: 70006,
    CD_ERROR_ORM_CONTROLLER_SAVE_RECORD: 70007,
    CD_ERROR_ORM_CONTROLLER_SAVE_RECORDS: 70008,
    CD_ERROR_ORM_CONTROLLER_REMOVE_RECORD: 70009,
    CD_ERROR_ORM_CONTROLLER_REMOVE_RECORDS: 70010,
    CD_ERROR_ORM_CONTROLLER_FETCH_CHILD_RELATIONSHIP: 70011,
    CD_ERROR_ORM_CONTROLLER_RESULTSET_TO_OBJECT_CONVERSION: 70012,
    CD_ERROR_ORM_CONTROLLER_PREPARE_FETCH_QUERY: 70013,
    CD_ERROR_ORM_CONTROLLER_UNMARSHALL_TO_MODEL_OBJECT: 70014,
    CD_ERROR_ORM_CONTROLLER_FETCH_AND_BIND_DATA_STRATEGY: 70015,
    CD_ERROR_PREPARING_QUERY_STRING: 90001,
    CD_ERROR_APP_INIT_FORMS: 90002,
    CD_ERROR_INVALID_DATA_OBJECT: 90003,
    CD_ERROR_CUSTOMVERB: 90004,
    MSG_ERROR_CUSTOMVERB: "Error while invoking custom verb",
    MSG_ERROR_SAAS_INSTANCE_NOTDEFINED: "kony.model.ApplicationContext.INSTANCE is not defined",
    MSG_ERROR_FORMSFORRECORDTYPES_MAP_NOT_DEFINED: "FormsForRecordTypes map is not defined or it has no entities",
    MSG_ERROR_RECORDTYPES_NOT_AVAILABLE: "No record types available from service",
    MSG_ERROR_FORM_NOT_DEFINED_FOR_RECORDTYPE: "no default forms for given formType ",
    MSG_ERROR_FORMTYPE_NOT_SPECIFIED: "Please specify formType for record type",
    MSG_ERROR_ENTITY_NOT_SPECIFIED: "Please specify entity to get record types",
    MSG_ERROR_MATCHOPERATOR_NOT_DEFINED_PROPERLY: "Match Operator is not mentioned properly in the query",
    MSG_ERROR_QUERYPARAMS_NOT_DEFINED_PROPERLY: "Queryparams are not defined properly",
    MSG_ERROR_QUERY_NOT_DEFINED_PROPERLY: "Query is not defined properly",
    MSG_ERROR_ADDITIONAL_FIELDS_ARE_NOT_DEFINED_PROPERLY: "Additinal Fields should be described in an Array Format Only",
    MSG_ERROR_BRACES_ARE_NOT_DEFINED_PROPERLY: "Braces are not defined properly in the query",
    MSG_ERROR_PARAM_VALUE_NOT_DEFINED_IN_QUERYPARAM: "Parameter value is not defined for this parameter",
    MSG_ERROR_DATA_VALIDATION_FIELD_NOT_CREATEABLE: "Form Validation Error- Field is not createable",
    MSG_ERROR_DATA_VALIDATION_FIELD_NOT_UPDATEABLE: "Form Validation Error - Field is not updateable",
    MSG_ERROR_DATA_VALIDATION_FIELD_NOT_NULLABLE: "Form Validation Error - Field is not nullable",
    MSG_ERROR_DATA_VALIDATION_INVALID_INPUT_DATA: "Form Validation Error - Invalid input data",
    MSG_ERROR_DATA_VALIDATION_INVALID_MODEL: "Form Validation Error - Invalid Model",
    MSG_ERROR_DATA_VALIDATION_INVALID_ENTITY: "Form Validation Error - Invalid Entity",
    MSG_ERROR_DATA_VALIDATION_ENTITYMETADATA_NOTFOUND: "Form Validation Error - EntityMetaData Not Found",
    MSG_ERROR_FETCHING_APPMENU_DATA: "Error fetching data for app menu",
    MSG_ERROR_CREATING_APPMENU: "Error creating app menu",
    CD_ERROR_WIDGETID_NOT_DEFINED: 50,
    CD_ERROR_PROCESSING_FORMCONFIG: 51,
    CD_ERROR_TAGNAME_NOTVALID: 52,
    CD_ERROR_EVENTNAME_NOT_DEFINED: 53,
    CD_ERROR_WIDGET_INSTANCE_NOT: 54,
    CD_ERROR_WHILE_PROCESSING_WIDGETCONFIG: 55,
    CD_ERROR_PRESAVECALLBACK_NOT_A_FUNCTION: 56,
    CD_ERROR_IN_DATACALLBACK: 57,
    CD_ERROR_IN_PRESAVECALLBACK: 58,
    CD_ERROR_NOT_MODEL_INSTANCE: 59,
    MSG_ERROR_NOT_MODEL_INSTANCE: "result of callback is not a model instance",
    MSG_ERROR_IN_PRESAVECALLBACK: "PreSave callback execution got failed",
    MSG_ERROR_IN_DATACALLBACK: "Data Call Back Execution got failed",
    MSG_ERROR_PRESAVECALLBACK_NOT_A_FUNCTION: "presave call back is not a function",
    MSG_ERROR_WHILE_PROCESSING_WIDGETCONFIG: "error while processing widget config of ",
    MSG_ERROR_WIDGET_INSTANCE_NOT: "it should be instance of kony.model.widgetConfig",
    MSG_ERROR_EVENTNAME_NOT_DEFINED: "event name is not defined",
    MSG_ERROR_WIDGETID_NOT_DEFINED: "Widget id is not specifed",
    MSG_ERROR_PROCESSING_FORMCONFIG: "error while processing form config",
    MSG_ERROR_TAGNAME_NOTVALID: "specified tag name not valid ",
    MSG_ERROR_PAGINATION_NOT_ENABLED_FOR_SEGMENT: "Pagination not enabled for this segment",
    MSG_ERROR_FAILED_BINDING_DATA_TO_WIDGET: "Failed to bind data to widget",
    MSG_ERROR_NOT_INHERITING_WIDGET_CONTROLLER: "Does not inherit WidgetController class ",
    MSG_ERROR_NOT_INHERITING_VIEW_CONTROLLER: "Does not inherit ViewController class ",
    MSG_ERROR_UNSUPPORTED_SEGMENT_TYPE: "segment widget type is not yet supported",
    MSG_ERROR_GET_NEXT_LIST: "Get next list error - Data Records recieved < 0 ",
    MSG_ERROR_FETCH_FAILED_FOR_CHILD_ENTITY: "failed to get data for child entity",
    MSG_ERROR_SAVE_CANNOT_SET_PRIMARY_KEY: "cannot save form, cannot explicitly set primary key value",
    MSG_ERROR_KONY_FORM_OBJECT_UNDEFINED: "kony form object is undefined",
    MSG_ERROR_FAILED_FORM_INIT_WHILE_CALLBACK: "failed to initilaize the form while executing datacallback",
    MSG_ERROR_FAILED_LOADING_FORMS: "Failed to load form",
    MSG_ERROR_PARSING_JSONS: "Error while parsing forms JSON",
    MSG_ERROR_FAILED_TO_NAVIGATE_TO_FORM: "failed to navigate to form ",
    MSG_ERROR_FAILED_LOADING_MASTER_DATA: "failed to laod master data",
    MSG_ERROR_FAILED_TO_LOGOUT: "Failed to logout",
    MSG_ERROR_UNDEFINED_WIDGET_CONTROLLER: "Undefined widget controller",
    MSG_ERROR_PRIMARY_FIELD_VALUE_NOT_FOUND: "cannot save form, primary field value not found",
    MSG_ERROR_NO_FIELDS_MODIFIED_UPDATE_FAILED: "Cannot save form, no fields are modified",
    MSG_ERROR_METADATA_FOR_ENTITY_NOT_FOUND: "metadata could not found for entity ",
    MSG_ERROR_FORM_NOT_FOUND: "Form not found",
    MSG_ERROR_EXPECTED_BOOLEAN: "First parameter must be boolean",
    MSG_ERROR_NAVIGATION_STACK_EMPTY: "Navigation stack is empty",
    MSG_ERROR_FORMVIEWCONTROLLER_NOT_FOUND: "form view controller not found",
    MSG_ERROR_INITIALIZING_SAAS_APP: "Error Initializing SaaS Application",
    MSG_ERROR_APP_INITIALIZATION_FAILED: "Application initialization failed",
    MSG_ERROR_FAILED_TO_LOAD_APPLICATION: "Failed to Load Application",
    MSG_ERROR_INITIALIZING_DATA_PROVIDER: "Unable to initialize data provider",
    MSG_ERROR_INITIALIZING_METADATA_PROVIDER: "Unable to initialize meta data provider",
    MSG_ERROR_INITIALIZING_UI_CONFIG_DATA_PROVIDER: "Unable to initialize UI Config data provider",
    MSG_ERROR_FETCHING_FORMS: "Error fetching forms",
    MSG_ERROR_FETCHING_TEMPLATES: "Error fetching templates",
    MSG_ERROR_MORE_RECORDS_FOUND: "Expected one record but found more than one",
    MSG_ERROR_FETCHING_METADATA: "Error fetching metadata for entity",
    MSG_ERROR_FAILED_TO_INITIALIZE_FORM: "Failed to initialize form",
    MSG_ERROR_FAILED_TO_FETCH_DATA: "Failed to fetch data for form",
    MSG_ERROR_FAILED_TO_SAVE_FORM: "Failed to save form",
    MSG_ERROR_SESSION_TOKEN_INVALID: "Invalid session token",
    MSG_ERROR_LOGIN_FAILURE: "Login failure",
    MSG_ERROR_OFFLINE_LOGIN_FAILURE: "Login failure in offline mode",
    MSG_ERROR_CALLBACK_NOT_A_FUNCTION: "Callbacks not a function",
    MSG_ERROR_FAILED_TO_CREATE_RECORD: "Failed to create record",
    MSG_ERROR_FAILED_TO_UPDATE_RECORD: "Failed to update record",
    MSG_ERROR_LOADING_TEMPLATES: "Error loading templates",
    MSG_ERROR_FIELD_NOT_PRESENT: "Invalid field mapped",
    MSG_ERROR_ENITTY_NOT_PRESENT: "Invalid Entity mapped",
    MSG_TENANT_NOT_SYNC_ENABLED: "Cloud is not sync enabled",
    MSG_INVALID_QUERY: "Query framed is invalid",
    MSG_ERROR_FETCH_USER_PROFILE_FAILURE: "Unable to fetch the user profile",
    MSG_ERROR_UNABLE_TO_SYNC: "Sync failed",
    MSG_ERROR_UNABLE_TO_GET_SYNC_CONFIG: "Unable to get sync configuration",
    MSG_ERROR_NETWORK_UNAVAILABLE: "Device is not connected to network. Please check your connection and try again.",
    MSG_ERROR_UNABLE_TO_RESET_SYNC: "Sync reset failed",
    MSG_HAMBURGER_MENU_WRONG_CONFIG: "Wrong Hamburger Menu config",
    MSG_HAMBURGER_MENU_INITIALIZATION_FAILED: "Failed to initialize Hamburger Menu",
    MSG_HAMBURGER_MENU_WRONG_FORM_TYPE: "Hamburger Menu wrong form type",
    MSG_HAMBURGER_MENU_WRONG_SKIN: "Main flex form skin is not provided with form bg color",
    MSG_RESOURCE_NO_CREATE_PERMISSION: "User does not have permission to create {}",
    MSG_RESOURCE_NO_READ_PERMISSION: "User does not have permission to read{}",
    MSG_RESOURCE_NO_UPDATE_PERMISSION: "User does not have permission to update {}",
    MSG_RESOURCE_NO_DELETE_PERMISSION: "User does not have permission to delete {}",
    MSG_NETWORK_UNAVAILABLE: "Network unavailable or disconnected",
    MSG_ERROR_NO_RESPONSE_RECEIVED: "No response received",
    MSG_ERROR_IN_SET_ADDITIONAL_FIELDS: "Error in setAdditionalFields",
    MSG_ERROR_IN_SET_QUERY: "Error in setQuery",
    MSG_ERROR_IN_SET_QUERY_PARAMS: "Error in setQueryParams",
    MSG_ERROR_ENTER_VALID_TENANT_NAME: "Enter a valid cloud name",
    MSG_ERROR_NAVIGATION_CONTROLLER_NOT_DEFINED: "Navigation controller not defined",
    MSG_ERROR_INVALID_ENTITY: "Invalid Entity Name",
    MSG_VERSION_UNSUPPORTED_ERROR: " You are trying to connect to older version of the Kony MobileFabric App Services. This app requires Kony MobileFabric App Services version to be $VERSION or greater ",
    MSG_ERROR_ASSOCIATING_RECORD: "Error associating record",
    MSG_ERROR_DISOCIATING_RECORD: "Error dissociating record",
    MSG_ERROR_NOT_INSTANCE_OF_CUSTOMINFO: "info object not an instance of kony.model.CustomInfo class",
    MSG_ERROR_FORM_ENTITY_NOT_FOUND: "Entity of form not found",
    MSG_ERROR_FORM_PRIMARY_FIELDVALUE_NOT_FOUND: "Primary field value for form is not found",
    MSG_ERROR_CANNOT_ASSOCIATE_DISSOCIATE_OF_SAME_ENTITY: "Cannot associate/dissociate records of same entity",
    MSG_ERROR_SAVING_MULTI_ENTITY_LABEL: "Error saving mutli entity label data",
    MSG_ERROR_SAVING_CHILD_CONTAINER: "Error saving child container data",
    MSG_UPGRADE_UNAVAILABLE: "upgraded version of this cloud is not available, please try diabling connect to upgraded version",
    MSG_ERROR_I18N: "I18n Error ",
    MSG_INVALID_LOGIN_HANDLER_RESPONSE: "invalid response object returned by login handler",
    MSG_ERROR_FAILED_TO_QUERY_DATA: "failed to query data for the widget",
    MSG_ERROR_BATCH_INSERT: "Exception occurred while batchInsert",
    MSG_ERROR_LOCAL_DB_CONNECTION: "Error in getting localdb connection",
    MSG_ERROR_EXECUTE_SINGLE_SQL_QUERY: "Exception occurred while executeSingleSqlQuery",
    MSG_ERROR_DECODING_BASE64_FORMJS: "Error while decoding base64 formJS",
    MSG_ERROR_LOADING_THEME: "error loading theme",
    MSG_ERROR_SETTING_THEME: "error setting theme to the application",
    MSG_ERROR_FETCHING_THEME: "error fetching theme from datasource",
    MSG_ERROR_MULTIPLE_DEFAULT_THEME: "error, more than once default themes returned",
    MSG_ERROR_CREATING_THEME: "error while creating theme",
    MSG_ERROR_METHOD_INVALID: "method type invalid , should be either GET/POST/PUT/DELETE",
    MSG_ERROR_INVALID_HTTPCUSTOMREQUEST_INPUT: "method type expected, httpcustomrequest accepts a string parameter of the method type",
    MSG_ERROR_INVALID_INPUT: "expected two string inputs",
    MSG_ERROR_INVALID_INPUT_TYPE: "expected string type as input",
    MSG_ERROR_INVALID_PAYLOAD: "invalid payload, expected only one parameter",
    MSG_ERROR_INVALID_DATAPROVIDER_TYPE: "expected rest dataprovider object",
    MSG_ERROR_DATAPROVIDER_NOT_INTIALIZED: "dataprovider object not intialized",
    MSG_ERROR_INVALID_CUSTOMSERVICE_INPUT_PARAM: "expected httpcustomrequest input param",
    MSG_ERROR_UNEXPECTED_CUSTOMRESPONSE: "expected customresponse key in response",
    MSG_CLOUD_UNAUTHORISED_FOR_DATAPROVIDER: "Invalid dataProviderKey or Present cloud is not authorised for the suggested data provider",
    MSG_CREDSTORE_NOT_FOUND: "Login failure in offline mode. CredStore is not created yet",
    MSG_CREDENTIAL_MISMATCH_WITH_CREDSTORE: "Login failure in offline mode. User Credentials did not match with credStore",
    MSG_ERROR_IN_ENTITY_DEFINITION: "Error in getting entity definition in model",
    MSG_ERROR_IN_RETREIVNING_CHILD_RELATIONSHIPLIST: "Error in retreiving child relationship list in model",
    MSG_ERROR_FETCHING_DATA_FOR_COLUMNS: "Error fetching data for columns in model",
    MSG_ERROR_FETCHING_CHILD_RELATIONSHP_FOR_ENTITY: "Error fetching relationship for child entity in model",
    MSG_ERROR_PROCESSING_CHILD_RELATIONSHIPLIST: "Error processing child relationship list in getRelationshipForChildEntityName in model",
    MSG_ERROR_FETCH: "Error in fetching data in model",
    MSG_ERROR_CREATE: "Error in create in model",
    MSG_ERROR_UPDATE: "Error in update in model",
    MSG_ERROR_UPDATE_BY_PRIMARY_KEY: "Error in update by primarykey in model",
    MSG_ERROR_DELETE: "Error in delete in model",
    MSG_ERROR_DELETE_BY_PRIMARY_KEY: "Error in delete by primarykey in model",
    MSG_ERROR_FETCH_IN_CONTROLLER_EXTENSION: "Error in fetch in controller extension",
    MSG_ERROR_BINDDATA_IN_CONTROLLER_EXTENSION: "Error in bindData in controller extension",
    MSG_ERROR_SAVEDATA_IN_CONTROLLER_EXTENSION: "Error in saveData in controller extension",
    MSG_ERROR_DELETEDATA_IN_CONTROLLER_EXTENSION: "Error in deleteData in controller extension",
    MSG_ERROR_ENTITY_CONTROLLER_NOT_DEFINED: "Model is not defined",
    MSG_ERROR_FETCH_IN_BASE_CONTROLLER_EXTENSION: "Error in fetchData of BaseControllerExtension",
    MSG_ERROR_BIND_IN_BASE_CONTROLLER_EXTENSION: "Error in bindData of BaseControllerExtension",
    MSG_ERROR_SAVE_IN_BASE_CONTROLLER_EXTENSION: "Error in saveData of BaseControllerExtension",
    MSG_ERROR_DELETE_IN_BASE_CONTROLLER_EXTENSION: "Error in saveData of BaseControllerExtension",
    MSG_ERROR_GENERATE_RECORDS_IN_BASE_CONTROLLER_EXTENSION: "Error in generateRecords of BaseControllerExtension",
    MSG_ERROR_ACTION_NOT_FOUND_IN_CONTROLLER: "Error action not found in controller for actionName",
    MSG_ERROR_APP_INIT_FORMS: "Error in application init forms",
    MSG_ERROR_ORM_CONTROLLER_FETCH_RECORDS: "Error in persistent controller's fetch records",
    MSG_ERROR_ORM_CONTROLLER_FETCH_RECORDS_QUERIES_NOT_DEFINED: "Error in persistent controller's fetch records, odata queries not defined",
    MSG_ERROR_ORM_CONTROLLER_FETCH_RECORD_PK_NOT_DEFINED: "Error in persistent controller's fetch by PK, PK not defined",
    MSG_ERROR_ORM_CONTROLLER_FETCH_RECORD_PK: "Error in persistent controller's fetch by PK",
    MSG_ERROR_ORM_CONTROLLER_FETCH_RECORDS_BY_NATIVE_QUERY: "Error in persistent controller's fetch with native query",
    MSG_ERROR_ORM_CONTROLLER_FETCH_RECORDS_BY_COLUMN_DEFINITION: "Error in persistent controller's fetch by columns",
    MSG_ERROR_ORM_CONTROLLER_SAVE_RECORD: "Error in persistent controller's save record",
    MSG_ERROR_ORM_CONTROLLER_SAVE_RECORDS: "Error in persistent controller's save records",
    MSG_ERROR_ORM_CONTROLLER_REMOVE_RECORD: "Error in persistent controller's remove record",
    MSG_ERROR_ORM_CONTROLLER_REMOVE_RECORDS: "Error in persistent controller's remove records",
    MSG_ERROR_ORM_CONTROLLER_FETCH_CHILD_RELATIONSHIP: "Error in persistent controller's fetch child relationship",
    MSG_ERROR_ORM_CONTROLLER_RESULTSET_TO_OBJECT_CONVERSION: "Error in persistent controller's resultset to record object conversion",
    MSG_ERROR_ORM_CONTROLLER_PREPARE_FETCH_QUERY: "Error in persistent controller's prepare fetch query",
    MSG_ERROR_ORM_CONTROLLER_UNMARSHALL_TO_MODEL_OBJECT: "Error in persistent controller's unmarshall record object to form model object",
    MSG_ERROR_ORM_CONTROLLER_FETCH_AND_BIND_DATA_STRATEGY: "Error in persistent controller's fetch and bind data strategy",
    MSG_ERROR_GET_DATA_WIDGETS_OF_FORM: "Error getting data widgets of form",
    MSG_ERROR_GETTING_QUERY_WIDGETS_MAPPING: "Error getting queryWidgetsMapping",
    MSG_ERROR_PREPARING_QUERY_STRING: "Error in preparing query string",
    MSG_ERROR_NOTIFYING_OBSERVERS: "Error notifying observers of formmodel",
    MSG_ERROR_GET_WIDGET_DATA_FORMMODEL: "Error getting widget data of formmodel",
    MSG_ERROR_SET_WIDGET_DATA_FORMMODEL: "Error setting widget data of formmodel",
    MSG_ERROR_FORMMODEL_PROPERTY_VALUE_CHANGED: "Error in propertyValueChanged of formmodel",
    MSG_ERROR_FORMMODEL_CLEAR: "Error in clear of formmodel",
    MSG_ERROR_FORMMODEL_DESTROY: "Error in destroy of formmodel",
    MSG_ERROR_FORMMODEL_UPDATE: "Error in update of formmodel",
    MSG_ERROR_FORMMODEL_SET_MASTERDATA: "Error in setMasterData of formmodel",
    MSG_ERROR_FORMMODEL_GET_MASTERDATA: "Error in getMasterData of formmodel",
    MSG_ERROR_FORMMODEL_SET_VIEW_ATTRIBUTE: "Error settingView attribute by property in formmodel",
    MSG_ERROR_FORMMODEL_GET_VIEW_ATTRIBUTE: "Error gettingView attribute by property in formmodel",
    MSG_ERROR_FORMMODEL_PERFORM_ACTION_ONVIEW: "Error in performActionOnView of formmodel",
    MSG_ERROR_FORMMODEL_PERFORM_ACTION: "Error in performAction of formmodel",
    MSG_ERROR_FORMMODEL_PROPERTIES_INIT: "Error in initialization of formmodel properties",
    MSG_ERROR_FETCH_IN_CONTROLLER: "Error in fetch of controller",
    MSG_ERROR_BIND_IN_CONTROLLER: "Error in bind of controller",
    MSG_ERROR_SAVE_IN_CONTROLLER: "Error in save of controller",
    MSG_ERROR_DELETE_IN_CONTROLLER: "Error in delete of controller",
    MSG_ERROR_LOADDATA_SHOWFORM_CONTROLLER: "Error in load data and show form of controller",
    MSG_ERROR_GETTING_ENTITY_CONTROLLER: "Error getting model from formcontroller",
    MSG_ERROR_GETTING_ENTITY_METADATA: "Error getting entity metadata from formcontroller",
    MSG_ERROR_INVALID_DATA_OBJECT: "Error while reading data, expected data object",
    MSG_ERROR_PROCESSDATA_IN_CONTROLLER_EXTENSION: "Error while formatting data in controller extension",
    MSG_ERROR_FORMATDATA_IN_BASE_CONTROLLER_EXTENSION: "Error while formatting data in base controller extension",
    MSG_ERROR_FORMATDATA_IN_CONTROLLER: "Error while formatting data in controller",
    MSG_ERROR_VALIDATION_UPDATE: "Error validating data in update model",
    MSG_ERROR_VALIDATION_CREATE: "Error validating data in create model",
    MSG_ERROR_SHOWFORM_IN_CONTROLLER_EXTENSION: "Error in showForm in controller extension"
};