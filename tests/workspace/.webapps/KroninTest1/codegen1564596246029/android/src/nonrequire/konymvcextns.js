//release/tool
//ver 1.6.2
;
(function() {
    var BusinessController_Command, BusinessController_CommandResponse, BusinessController_CommandHandler, commonUtils_ExtensibilityApi, BusinessController_CommandExecutionEngine, BusinessController_BusinessController, BusinessController_BusinessDelegator, DataModel_QueryBuilder, DataModel_constants, DataModel_Error, DataModel_DBAssembler, DataModel_DataSource, DataModel_BaseRepository, DataModel_RepositoryManager, PresentationController_MDABasePresenter, BaseNavigator_MDABaseNavigator, ModuleManager_MDAModule, ModuleManager_MDAModuleManager, UIBinder_UIBinder, UIBinder_PropertyDataMapper_GenericProperties, UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom, UIBinder_PropertyDataMapper_ImageProperties, UIBinder_WidgetDataMapper_ImageWidgetDataMapper, UIBinder_PropertyDataMapper_TextboxProperties, UIBinder_WidgetDataMapper_TextboxWidgetDataMapper, UIBinder_PropertyDataMapper_LabelProperties, UIBinder_WidgetDataMapper_LabelWidgetDataMapper, UIBinder_PropertyDataMapper_TextAreaProperties, UIBinder_WidgetDataMapper_TextAreaWidgetDataMapper, UIBinder_PropertyDataMapper_SwitchProperties, UIBinder_WidgetDataMapper_SwitchWidgetDataMapper, UIBinder_PropertyDataMapper_SliderProperties, UIBinder_WidgetDataMapper_SliderWidgetDataMapper, UIBinder_PropertyDataMapper_RichTextProperties, UIBinder_WidgetDataMapper_RichTextWidgetDataMapper, UIBinder_PropertyDataMapper_ButtonProperties, UIBinder_WidgetDataMapper_ButtonWidgetDataMapper, UIBinder_WidgetDataMapper_SegmentWidgetDataMapper, UIBinder_PropertyDataMapper_ListboxProperties, UIBinder_WidgetDataMapper_ListboxWidgetDataMapper, UIBinder_WidgetDataMapper_FlexContainerWidgetDataMapper, UIBinder_PropertyDataMapper_CalendarProperties, UIBinder_WidgetDataMapper_CalendarWidgetDataMapper, UIBinder_UIBinderBuilder, commonUtils_MDAApplication, commonUtils_Logger, commonUtils_InitializeForms, commonUtils_ProcessorUtils, ParallelCommandExecuter_ParallelCommandExecuter, DataModel_ModelRelation, DataModel_BaseModel, DataModel_ORMSession, DataModel_Expression, FormController_MDAFormController, commonUtils_ControllerGetterAPI, main, konymvcMDAFormController, kony_mvc_MDAFormController, MDAFormController;
    BusinessController_Command = function() {
        function Command(id, context, completionCallback, alias) {
            //kony.print("In Command: " + id + "  callback is: " + completionCallback);
            this.id = id;
            this.headers = context.headers;
            delete context.headers;
            this.context = context;
            this.completionCallback = completionCallback;
            this.alias = alias ? alias : id;
        }
        Command.prototype.execute = function() {};
        Command.prototype.getCompletionCallback = function() {
            return this.completionCallback;
        };
        Command.prototype.setCompletionCallback = function(completionCallback) {
            this.completionCallback = completionCallback;
        };
        Command.prototype.getContext = function() {
            return this.context;
        };
        Command.prototype.setContext = function(context) {
            this.context = context;
        };
        Command.prototype.getId = function() {
            return this.id;
        };
        Command.prototype.setId = function(id) {
            this.id = id;
        };
        Command.prototype.getAlias = function() {
            return this.alias;
        };
        Command.prototype.setAlias = function(alias) {
            this.alias = alias;
        };
        return Command;
    }();
    BusinessController_CommandResponse = function() {
        function CommandResponse(commandId, status, data, alias) {
            this.commandId = commandId;
            this.status = status;
            this.data = data;
            this.alias = alias ? alias : commandId;
        }
        return CommandResponse;
    }();
    BusinessController_CommandHandler = function(Command, CommandResponse) {
        function CommandHandler(commandId) {
            this.commandId = commandId;
            this.commandHandlerExtension = null;
            this.businessController = null;
        }
        CommandHandler.prototype.execute = function(command) {};
        CommandHandler.prototype.validate = function() {};
        CommandHandler.prototype.sendResponse = function(command, responseCode, responseData) {
            var response = new CommandResponse(command.id, responseCode, responseData, command.alias);
            command.completionCallback.call(this, response);
        };
        return CommandHandler;
    }(BusinessController_Command, BusinessController_CommandResponse);
    commonUtils_ExtensibilityApi = function() {
        function ClassExtensionUtility() {
            //This json Object is used for deregister purpose by holding the key as function name and value as JSONObject
            jsonForFunction = {};
            /**
             * This Api is the skeleton for addAfter logic
             *
             * @param {function} invoke  - The existing original function.
             * @param {function} newMeth - The new function which has to be executed later in the sequence.
             * @return           retX    - The result after execution of the latest method.
             */
            addAfterWrapper = function(invoke, newMeth) {
                    return {
                        diy: function() {
                            return function() {
                                var retX = invoke.apply(this, arguments);
                                retX = newMeth.apply(this, arguments);
                                return retX;
                            };
                        }
                    };
                },
                /**
                 * This Api is the skeleton for addBefore logic
                 *
                 * @param {function} invoke  - The existing original function.
                 * @param {function} newMeth - The new function which has to be executed prior to the sequence.
                 * @return           retX    - The result after execution of the latest method.
                 */
                addBeforeWrapper = function(invoke, newMeth) {
                    return {
                        diy: function() {
                            return function() {
                                var retX = newMeth.apply(this, arguments);
                                if (retX !== false) {
                                    retX = invoke.apply(this, arguments);
                                }
                                return retX;
                            };
                        }
                    };
                },
                /**
                 * This Api calls the function  which constructs the body for anonymous functions either addAfter or addBefore
                 *
                 * @param {String} key                 - The name of the anonymous function
                 * @param {boolean}flag                - Used to decide addAfter or addBefore
                 */
                makeAnonymousFuncBody = function(key, flag) {
                    if (flag === 1) {
                        makeAnonyAddAfterBody(key);
                    } else {
                        makeAnonyAddBeforeBody(key);
                    }
                },
                /**
                 * This function constructs the body for anonymous function in the scenario  of addAfter
                 *
                 * @param {string} key                 - The existing original function.
                 */
                makeAnonyAddAfterBody = function(key) {
                    var obj = jsonForFunction[key];
                    if (obj[key]['after']) {
                        var afterArray = obj[key]['after'];
                        for (var index = 0; index < afterArray.length; index++) {
                            var invoker = eval(key);
                            meth = eval(afterArray[index]);
                            methObj = addAfterWrapper(invoker, meth);
                        }
                        eval(key + '=methObj.diy();');
                    }
                },
                /**
                 * This function constructs the body for anonymous function in the scenario  of addBefore
                 *
                 * @param {string} key                 - The existing original function.
                 */
                makeAnonyAddBeforeBody = function(key) {
                    var obj = jsonForFunction[key];
                    var beforeArray = obj[key]['before'];
                    for (var index = 0; index < beforeArray.length; index++) {
                        var invoker = eval(key);
                        meth = eval(beforeArray[index]);
                        methObj = addBeforeWrapper(invoker, meth);
                    }
                    eval(key + '=methObj.diy();');
                },
                /**
                 * This Api calls the method which constructs the body for anonymous function in the scenario  of deRegistering a method
                 *
                 * @param {string} key                 - The existing original function.
                 */
                makeAnonymousFuncDeRegisterBody = function(key) {
                    makeAnonyAddAfterDeRegister(key);
                    makeAnonyAddBeforeDeRegister(key);
                },
                /**
                 * This function reconstructs the body after deregistering a particular method
                 *
                 * @param {string} key                 - The existing original function.
                 */
                makeAnonyAddBeforeDeRegister = function(key) {
                    var obj = jsonForFunction[key];
                    var beforeArray = obj[key]['before'];
                    for (var index = 0; index < beforeArray.length; index++) {
                        var invoker = eval(key);
                        meth = eval(beforeArray[index]);
                        var methObj = addBeforeWrapper(invoker, meth);
                        eval(key + '=methObj.diy();');
                    }
                },
                /**
                 * This function reconstructs the body after deRegistering a particular method
                 *
                 * @param {string} key                 - The existing original function.
                 */
                makeAnonyAddAfterDeRegister = function(key) {
                    var obj = jsonForFunction[key];
                    var afterArray = obj[key]['after'];
                    for (var index = 0; index < afterArray.length; index++) {
                        var invoker = eval(key);
                        meth = eval(afterArray[index]);
                        var methObj = addAfterWrapper(invoker, meth);
                        eval(key + '=methObj.diy();');
                    }
                },
                /**
                 * This Api calls the method which constructs the body for class in the scenario  of addAfter or addBefore of a member		
                 *
                 * @param {class} refClass             - The copy of the original class
                 * @param {string} key                 - The existing original function.
                 * @param {boolean} flag               - factor to call addAfter or addBefore.
                 */
                makeClassFunctionBody = function(refClass, key, flag) {
                    if (flag === 1) {
                        makeClassAddAfterFunctionBody(refClass, key);
                    } else {
                        makeClassAddBeforeFunctionBody(refClass, key);
                    }
                },
                /**
                 * This function constructs the body for Class in the scenario  of addAfter
                 *
                 * @param {class} refClass             - The copy of the original class
                 * @param {string} key                 - The existing original function.
                 */
                makeClassAddAfterFunctionBody = function(refClass, key) {
                    var obj = refClass[key + '_orig' + 1];
                    var afterArray = obj[key]['after'];
                    for (var index = 0; index < afterArray.length; index++) {
                        for (var keyValue in afterArray[index]) {
                            var invoker = refClass[key];
                            meth = afterArray[index][keyValue];
                            var methObj = addAfterWrapper(invoker, meth);
                        }
                    }
                    refClass[key] = methObj.diy();
                },
                /**
                 * This function constructs the body for Class in the scenario  of addBefore
                 *
                 * @param {class} refClass             - The copy of the original class
                 * @param {string} key                 - The existing original function.
                 */
                makeClassAddBeforeFunctionBody = function(refClass, key) {
                    var obj = refClass[key + '_orig' + 1];
                    var beforeArray = obj[key]['before'];
                    for (var index = 0; index < beforeArray.length; index++) {
                        for (var keyValue in beforeArray[index]) {
                            var invoker = refClass[key];
                            meth = beforeArray[index][keyValue];
                            var methObj = addBeforeWrapper(invoker, meth);
                        }
                    }
                    refClass[key] = methObj.diy();
                },
                /**
                 * This Api calls the method which constructs the body for class in the scenario  of deRegistering a method	
                 *
                 * @param {class} refClass             - The copy of the original class
                 * @param {string} key                 - The existing original function.
                 */
                makeClassDeRegisterFunctionBody = function(refClass, key) {
                    makeClassAddAfterBody(refClass, key);
                    makeClassAddBeforeBody(refClass, key);
                },
                /**
                 * This function reconstructs the body after deRegistering a particular method
                 *
                 * @param {class} refClass             - The copy of the original class
                 * @param {string} key                 - The existing original function.
                 */
                makeClassAddAfterBody = function(refClass, key) {
                    var obj = refClass[key + '_orig' + 1];
                    var afterArray = obj[key]['after'];
                    for (var index = 0; index < afterArray.length; index++) {
                        for (var keyValue in afterArray[index]) {
                            var invoker = refClass[key];
                            meth = afterArray[index][keyValue];
                            var methObj = addAfterWrapper(invoker, meth);
                        }
                        refClass[key] = methObj.diy();
                    }
                },
                /**
                 * This function reconstructs the body after deRegistering a particular method
                 *
                 * @param {class} refClass             - The copy of the original class
                 * @param {string} key                 - The existing original function.
                 */
                makeClassAddBeforeBody = function(refClass, key) {
                    var obj = refClass[key + '_orig' + 1];
                    var beforeArray = obj[key]['before'];
                    for (var index = 0; index < beforeArray.length; index++) {
                        for (var keyValue in beforeArray[index]) {
                            var invoker = refClass[key];
                            meth = beforeArray[index][keyValue];
                            var methObj = addBeforeWrapper(invoker, meth);
                        }
                        refClass[key] = methObj.diy();
                    }
                },
                /**
                 * This method is used to set the required assets for calling addAfter method to construct the body for anonymous function
                 *
                 * @param {class}    refClass - The prototype of the original class
                 * @param {JSON}     method   - The existing original function and new function as value.
                 * @param {boolean}  flag     - deciding factor to construct JSON Object for before or after methods
                 */
                anonymousFuncAdd = function(claz, method, flag) {
                    var method = claz;
                    for (var key in method) {
                        if (!jsonForFunction[key]) {
                            jsonForFunction[key] = {};
                        }
                        var dummyObject = jsonForFunction[key];
                        var meth = method[key];
                        if (dummyObject[key] === undefined) {
                            makeJsonObject(flag, meth, key);
                        } else {
                            makeJsonObjectComplete(flag, meth, key);
                        }
                        if (flag == 1) {
                            makeAnonymousFuncBody(key, 1);
                        } else {
                            makeAnonymousFuncBody(key, 0);
                        }
                    }
                },
                /**
                 * This Api is used to construct the json for addAfter and addBefore scenarios
                 *
                 * @param {boolean} flag     - deciding factor to construct JSON Object for before or after methods
                 * @param {function} meth    - new method
                 * @param {string} key       - original function
                 */
                makeJsonObject = function(flag, meth, key) {
                    var innerLevelObject = {};
                    innerLevelObject['after'] = [];
                    innerLevelObject['before'] = [];
                    if (flag === 1) {
                        innerLevelObject['after'].push(meth.name);
                    } else {
                        innerLevelObject['before'].push(meth.name);
                    }
                    var dummyObject = jsonForFunction[key];
                    dummyObject[key] = innerLevelObject;
                    jsonForFunction[key + 1] = eval(key);
                    jsonForFunction[key] = dummyObject;
                },
                /**
                 * This Api is used to construct the json for addAfter and addBefore scenarios
                 *
                 * @param {boolean} flag     - deciding factor to construct JSON Object for before or after methods
                 * @param {function} meth    - new method
                 * @param {string} key       - original function
                 */
                makeJsonObjectComplete = function(flag, meth, key) {
                    var dummyObject = jsonForFunction[key];
                    if (dummyObject[key]['after'] == undefined || dummyObject[key]['before'] == undefined) {
                        var innerLevelObject = {};
                        innerLevelObject['after'] = [];
                        innerLevelObject['before'] = [];
                        if (flag === 1) {
                            innerLevelObject['after'].push(meth.name);
                        } else {
                            innerLevelObject['before'].push(meth.name);
                        }
                        dummyObject[key] = innerLevelObject;
                        jsonForFunction[key + 1] = eval(key);
                    } else {
                        if (flag === 1) {
                            dummyObject[key]['after'].push(meth.name);
                        } else {
                            dummyObject[key]['before'].push(meth.name);
                        }
                    }
                    jsonForFunction[key] = dummyObject;
                },
                /**
                 * This method is used to set the required assets for calling addAfter method to construct the body for class
                 *
                 * @param {class}      claz - The prototype of the original class
                 * @param {function} meth    - new method
                 * @param {boolean}  flag     - deciding factor to construct JSON Object for before or after methods
                 */
                classMemberAdd = function(claz, method, flag) {
                    var innerLevelObject = {};
                    var refClass = claz;
                    var methodsList = [];
                    for (var key in method) {
                        if (!refClass[key + '_orig' + 1]) {
                            refClass[key + '_orig' + 1] = {};
                        }
                        var dummyObject = refClass[key + '_orig' + 1];
                        var meth = method[key];
                        if (refClass[key]) {
                            if (dummyObject[key] == undefined) {
                                makeClassJson(key, flag, method, refClass);
                            } else {
                                makeClassJsonComplete(key, flag, method, refClass);
                            }
                            if (flag == 1) {
                                makeClassFunctionBody(refClass, key, 1);
                            } else {
                                makeClassFunctionBody(refClass, key, 0);
                            }
                        }
                    }
                },
                /**
                 * This Api is used to construct the json for addAfter and addBefore scenarios
                 *
                 * @param {string} key       - original function
                 * @param {boolean} flag     - deciding factor to construct JSON Object for before or after methods
                 * @param {function} meth    - new method
                 * @param {class}   refClass- The class which contains prototype of the original class.
                 */
                makeClassJson = function(key, flag, method, refClass) {
                    var dummyObject = refClass[key + '_orig' + 1];
                    var innerLevelObject = {};
                    innerLevelObject['after'] = [];
                    innerLevelObject['before'] = [];
                    innerinnerObject = {};
                    innerinnerObject[method[key].name] = method[key];
                    if (flag == 1) {
                        innerLevelObject['after'].push(innerinnerObject);
                    } else {
                        innerLevelObject['before'].push(innerinnerObject);
                    }
                    dummyObject[key] = innerLevelObject;
                    refClass[key + '_orig'] = refClass[key];
                    refClass[key + '_orig' + 1] = dummyObject;
                },
                /**
                 * This Api is used to construct the json for addAfter and addBefore scenarios
                 *
                 * @param {string} key       - original function
                 * @param {boolean} flag     - deciding factor to construct JSON Object for before or after methods
                 * @param {function} meth    - new method
                 * @param {class}   refClass- The class which contains prototype of the original class.
                 */
                makeClassJsonComplete = function(key, flag, method, refClass) {
                    var dummyObject = refClass[key + '_orig' + 1];
                    if (dummyObject[key]['after'] == undefined || dummyObject[key]['before'] == undefined) {
                        innerLevelObject = {};
                        innerLevelObject['after'] = [];
                        innerLevelObject['before'] = [];
                        innerinnerObject = {};
                        innerinnerObject[method[key].name] = method[key];
                        if (flag == 1) {
                            innerLevelObject['after'].push(innerinnerObject);
                        } else {
                            innerLevelObject['before'].push(innerinnerObject);
                        }
                        dummyObject[key] = innerLevelObject;
                        refClass[key + '_orig'] = refClass[key];
                    } else {
                        innerinnerObject = {};
                        innerinnerObject[method[key].name] = method[key];
                        if (flag == 1) {
                            dummyObject[key]['after'].push(innerinnerObject);
                        } else {
                            dummyObject[key]['before'].push(innerinnerObject);
                        }
                    }
                    refClass[key + '_orig' + 1] = dummyObject;
                },
                /**
                 * This Api is used to call the methods for deRegistering purpose
                 *
                 * @param {class}    claz    - The class which contains various methods
                 * @param {function} meth    - new method
                 */
                deRegisterAnonyFunc = function(claz, method) {
                    method = claz;
                    for (var key in method) {
                        var meth = method[key];
                        var dummyObject = jsonForFunction[key];
                        afterArrayProcessing(key, meth);
                        beforeArrayProcessing(key, meth);
                        eval(key + '=jsonForFunction[key+1]');
                        makeAnonymousFuncDeRegisterBody(key);
                    }
                },
                /**
                 * This Api is used to process the addAfter methods and deregister them accordingly
                 *
                 * @param {string}  key         - The original initial method
                 * @param {function} meth       - new method
                 */
                afterArrayProcessing = function(key, meth) {
                    var dummyObject = jsonForFunction[key];
                    var afterArray = dummyObject[key]['after'];
                    for (var j = 0; j < afterArray.length; j++) {
                        if (afterArray[j] == meth.name) {
                            afterArray.splice(j, 1);
                            dummyObject[key]['after'] = afterArray;
                            jsonForFunction[key] = dummyObject;
                        }
                    }
                },
                /**
                 * This Api is used to process the addBefore methods and deregister them accordingly
                 *
                 * @param {string}  key         - The original initial method
                 * @param {function} meth       - new method
                 */
                beforeArrayProcessing = function(key, meth) {
                    var dummyObject = jsonForFunction[key];
                    var beforeArray = dummyObject[key]['before'];
                    for (var k = 0; k < beforeArray.length; k++) {
                        if (beforeArray[k] == meth.name) {
                            beforeArray.splice(k, 1);
                            dummyObject[key]['before'] = beforeArray;
                            jsonForFunction[key] = dummyObject;
                        }
                    }
                },
                /**
                 * This Api is used to call the methods for deRegistering purpose
                 *
                 * @param {class}    claz    - The class which contains various methods
                 * @param {function} method    - new method
                 */
                deRegisterClassMember = function(claz, method) {
                    var refClass = claz;
                    for (var key in method) {
                        var meth = method[key];
                        var dummyObject = refClass[key + '_orig' + 1];
                        classAfterArrayProcessing(refClass, key, meth);
                        classBeforeArrayProcessing(refClass, key, meth);
                        refClass[key] = refClass[key + '_orig'];
                        makeClassDeRegisterFunctionBody(claz, key);
                    }
                },
                /**
                 * This Api is used to process the addAfter methods and deregister them accordingly
                 *
                 * @param {class}   refClass- The class which contains prototype of the original class.
                 * @param {string}  key         - The original initial method
                 * @param {function} meth       - new method
                 */
                classAfterArrayProcessing = function(refClass, key, meth) {
                    var dummyObject = refClass[key + '_orig' + 1];
                    var afterArray = dummyObject[key]['after'];
                    for (var j = 0; j < afterArray.length; j++) {
                        for (var keyValue in afterArray[j]) {
                            if (keyValue == meth.name) {
                                afterArray.splice(j, 1);
                                dummyObject[key]['after'] = afterArray;
                                refClass[key + '_orig' + 1] = dummyObject;
                            }
                        }
                    }
                },
                /**
                 * This Api is used to process the addBefore methods and deregister them accordingly
                 *
                 * @param {class}   refClass- The class which contains prototype of the original class.
                 * @param {string}  key         - The original initial method
                 * @param {function} meth       - new method
                 */
                classBeforeArrayProcessing = function(refClass, key, meth) {
                    var dummyObject = refClass[key + '_orig' + 1];
                    var beforeArray = dummyObject[key]['before'];
                    for (var k = 0; k < beforeArray.length; k++) {
                        for (var keyValue in beforeArray[k]) {
                            if (keyValue == meth.name) {
                                beforeArray.splice(k, 1);
                                dummyObject[key]['before'] = beforeArray;
                                refClass[key + '_orig' + 1] = dummyObject;
                            }
                        }
                    }
                };
            /**
             * This Api is used to construct the json for addAfter and addBefore scenarios
             *
             * @param {string} key       - original function
             * @param {boolean} flag     - deciding factor to construct JSON Object for before or after methods
             * @param {function} meth    - new method
             * @param {class}   refClass- The class which contains prototype of the original class.
             */
            makeClassJson = function(key, flag, method, refClass) {
                    var dummyObject = refClass[key + '_orig' + 1];
                    var innerLevelObject = {};
                    innerLevelObject['after'] = [];
                    innerLevelObject['before'] = [];
                    innerinnerObject = {};
                    innerinnerObject[method[key].name] = method[key];
                    if (flag == 1) {
                        innerLevelObject['after'].push(innerinnerObject);
                    } else {
                        innerLevelObject['before'].push(innerinnerObject);
                    }
                    dummyObject[key] = innerLevelObject;
                    refClass[key + '_orig'] = refClass[key];
                    refClass[key + '_orig' + 1] = dummyObject;
                }, this.constructor = function(arg) {},
                /**
                 * This function adds a new member function to an existing class definition
                 *
                 * @param {class} claz   - The class for which a new member has to be added.
                 * @param {JSON}  method - The member which has to be added to the class.
                 */
                this.addMethod = function(claz, method) {
                    if (claz) {
                        var refClass = claz;
                    }
                    for (var key in method) {
                        if (!refClass[key]) {
                            refClass[key] = method[key];
                        }
                    }
                },
                /**
                 * This function adds a new sequence to an existing member function of a class definition. 
                 * The new sequence of code is executed after executing the default behaviour
                 *
                 * @param {class} claz   - The class for which addAfter functionality has to be extended.
                 * @param {JSON}  method - The member which has to be extended after to existing member of the class.
                 */
                this.addAfter = function(claz, method) {
                    if (method === undefined) {
                        anonymousFuncAdd(claz, method, 1);
                    } else {
                        classMemberAdd(claz, method, 1);
                    }
                },
                /**
                 * This function adds a new sequence to an existing member function of a class definition. 
                 * The new sequence of code is executed before executing the default behaviour
                 *
                 * @param {class} claz   - The class for which addBefore functionality has to be extended.
                 * @param {JSON}  method - The member which has to be extended before to existing member of the class.
                 */
                this.addBefore = function(claz, method) {
                    if (method === undefined) {
                        anonymousFuncAdd(claz, method, 0);
                    } else {
                        classMemberAdd(claz, method, 0);
                    }
                },
                /**
                 * This function removes an existing member function
                 *
                 * @param {class} claz       - The class for which a member has to be removed.
                 * @param {JSON}  method - The member which has to be removed from the class.
                 */
                this.removeMethod = function(claz, method) {
                    if (claz) {
                        var refClass = claz;
                    }
                    for (var key in methodName) {
                        delete refClass[key];
                    }
                },
                /**
                 * This function overrides an existing member behaviour with a new behaviour.
                 *
                 * @param {class} claz   - The class for which a member has to be updated.
                 * @param {JSON}  method - The member which has to be updated in the class.
                 */
                this.updateMethod = function(claz, method) {
                    if (method === undefined) {
                        method = claz;
                        for (var key in method) {
                            if (method[key] !== undefined) {
                                eval(key + '=method[key];');
                            }
                        }
                    } else {
                        for (var key in method) {
                            if (claz) {
                                var refClass = claz;
                            }
                            if (refClass[key]) {
                                refClass[key] = method[key];
                            }
                        }
                    }
                },
                /**
                 * This function deregisters an existing member function of a class definition. 
                 *
                 * @param {class} claz   - The class for which a member has to be deregistered.
                 * @param {JSON}  method - The member which has to be deRegistered from the sequence of member in the class.
                 */
                this.deRegister = function(claz, method) {
                    if (method === undefined) {
                        deRegisterAnonyFunc(claz, method);
                    } else {
                        deRegisterClassMember(claz, method);
                    }
                };
        }
        return ClassExtensionUtility;
    }();
    BusinessController_CommandExecutionEngine = function(Command, CommandHandler, ClassExtensionUtility) {
        function CommandExecutionEngine() {
            this.commandHandlers = [];
        }
        CommandExecutionEngine.prototype.registerCommandHandler = function(commandHandler) {
            var commandHandlerArray = [
                commandHandler.commandId,
                commandHandler,
                commandHandler.commandHandlerExtension
            ];
            if (commandHandlerArray[2]) {
                if (commandHandlerArray[2].execute) {
                    var extensionInstance = new ClassExtensionUtility();
                    extensionInstance.addBefore(commandHandlerArray[2], {
                        execute: commandHandlerArray[2].addBefore
                    });
                    extensionInstance.addBefore(commandHandlerArray[2], {
                        sendResponse: commandHandlerArray[2].addAfter
                    });
                } else {
                    var extensionInstance = new ClassExtensionUtility();
                    extensionInstance.addBefore(commandHandlerArray[1], {
                        execute: commandHandlerArray[2].addBefore
                    });
                    extensionInstance.addBefore(commandHandlerArray[1], {
                        sendResponse: commandHandlerArray[2].addAfter
                    });
                }
            }
            this.commandHandlers.push(commandHandlerArray); //kony.print("MDA2*** commandHandlers is :" + this.commandHandlers);
        };
        CommandExecutionEngine.prototype.unRegisterHandler = function(commandId) {
            for (var i = 0; i < this.commandHandlers.length; i++) {
                var commandHandlerArray = this.commandHandlers[i];
                if (commandHandlerArray[0] === commandId) {
                    this.commandHandlers.splice(i, 1);
                    break;
                }
            }
        };
        CommandExecutionEngine.prototype._executeCommand = function(command, params) {
            kony.print('MDA2*** CommandExecutionEngine execute : ' + command);
            if (this.isCommandRegistered(command.id) === true) {
                for (var i = 0; i < this.commandHandlers.length; i++) {
                    var commandHandlerArray = this.commandHandlers[i];
                    if (commandHandlerArray[0] === command.id) {
                        commandHandler = commandHandlerArray[1];
                        commandHandler.validate(params);
                        commandHandler.execute(command);
                        break;
                    }
                }
            } else {
                kony.print('Not registered ');
                throw new Exception('ERROR_CODE_300', 'Error at Command Execution Engine, Missing or Wrong CommandID');
            }
        };
        CommandExecutionEngine.prototype.execute = function(command) {
            kony.print('MDA2*** CommandExecutionEngine execute : ' + command);
            if (this.isCommandRegistered(command.id) === true) {
                for (var i = 0; i < this.commandHandlers.length; i++) {
                    var commandHandlerArray = this.commandHandlers[i];
                    if (commandHandlerArray[0] === command.id) {
                        commandHandler = commandHandlerArray[1];
                        commandHandlerExtension = commandHandlerArray[2];
                        if (commandHandlerExtension != null && commandHandlerExtension.execute) {
                            commandHandlerExtension.super = commandHandler.execute;
                            var returnVal = commandHandlerExtension.execute(command);
                            if (returnVal === false) {
                                commandHandler.sendResponse(command, kony.mvc.constants.STATUS_ABORT, null);
                            }
                        } else {
                            commandHandler.execute(command);
                        }
                        break;
                    }
                }
            } else {
                kony.print('Not registered ');
                throw new Exception('ERROR_CODE_300', 'Error at Command Execution Engine, Missing or Wrong CommandID ');
            }
        };
        CommandExecutionEngine.prototype.isCommandRegistered = function(commandId) {
            for (var i = 0; i < this.commandHandlers.length; i++) {
                var commandHandlerArray = this.commandHandlers[i];
                if (commandHandlerArray[0] === commandId) {
                    return true;
                }
            }
            return false;
        };
        return CommandExecutionEngine;
    }(BusinessController_Command, BusinessController_CommandHandler, commonUtils_ExtensibilityApi);
    BusinessController_BusinessController = function(CommandExecutionEngine, CommandHandler, Command) {
        function BusinessController() {
            //this.context = context;
            this.cmdEngine = new CommandExecutionEngine();
            this.initializeBusinessController();
        }
        BusinessController.prototype.initializeBusinessController = function() {};
        BusinessController.prototype.executeCommand = function(command, params) {
            this.cmdEngine._executeCommand(command, params);
        };
        BusinessController.prototype.execute = function(command) {
            //kony.print ("In BC executing :" + command.id);
            this.cmdEngine.execute(command);
        };
        BusinessController.prototype.registerCommandHandlers = function(commandHandlers, callback) {
            if (callback == '' || callback == undefined) {
                for (var i = 0; i < commandHandlers.length; i++) {
                    var commandId = commandHandlers[i].CommandId;
                    var commandHandler = require(commandHandlers[i].CommandHandler);
                    if (commandHandlers[i].CommandHandlerExtension && commandHandlers[i].CommandHandlerExtension != null) {
                        var commandHandlerExtn = commandHandlers[i].CommandHandlerExtension;
                        try {
                            var commandExtension = require(commandHandlerExtn);
                        } catch (err) {
                            throw new Exception('ERROR_CODE_300', 'Missing Command Handler Extension : ' + err);
                        }
                    } else {
                        var commandExtension = null;
                    }
                    var handler = new commandHandler(commandId);
                    handler.commandHandlerExtension = commandExtension;
                    if (commandExtension && commandExtension.execute) commandExtension.sendResponse = handler.sendResponse;
                    handler.businessController = this;
                    this.cmdEngine.registerCommandHandler(handler);
                } //var handler = eval('new '+commandHandler+'("'+commandId+'");');
            } else {
                var self = this;
                var handlersarray = [],
                    commandId = [],
                    commandHandlerExtn = [];
                for (var i = 0; i < commandHandlers.length; i++) {
                    commandId[i] = commandHandlers[i].CommandId;
                    commandHandlerExtn[i] = commandHandlers[i].CommandHandlerExtension;
                    handlersarray[i] = commandHandlers[i].CommandHandler;
                }
                var handlerinstances;
                var commandHandler = require(handlersarray, function() {
                    for (var i = 0; i < arguments.length; i++) {
                        try {
                            handlerinstances = arguments;
                            var HandlerExtn = commandHandlerExtn[i];
                            var instanceCommandHandler = handlerinstances[i];
                            var handler = new instanceCommandHandler(commandId[i]);
                            if (commandHandlerExtn[i] != null || commandHandlerExtn[i] != undefined) {
                                var commandExtension = require([HandlerExtn], function(instanceCommandHandlerExtn) {
                                    handler.commandHandlerExtension = instanceCommandHandlerExtn;
                                    if (instanceCommandHandlerExtn && instanceCommandHandlerExtn.execute) instanceCommandHandlerExtn.sendResponse = handler.sendResponse;
                                });
                            } else {
                                var commandExtension = null;
                            }
                            handler.businessController = self;
                            self.cmdEngine.registerCommandHandler(handler); //callback();
                        } catch (err) {
                            throw new Exception('ERROR_CODE_300', 'Missing Command Handler Extension : ' + err);
                        }
                    }
                });
            }
        };
        return BusinessController;
    }(BusinessController_CommandExecutionEngine, BusinessController_CommandHandler, BusinessController_Command);
    BusinessController_BusinessDelegator = function() {
        function BusinessDelegator() {
            this.superParams = {
                counter: 0,
                level: null,
                refStack: []
            };
        }
        BusinessDelegator.prototype.super = function(methodName, argList) {
            var scope = this;
            var returnValue = null;
            if (this.superParams.level === null) {
                this.superParams.level = 0;
                while (scope['extensionLevel' + this.superParams.level.toString()]) {
                    this.superParams.level++;
                }
            }
            if (this.superParams.counter === 0) {
                for (var i = 0; i < this.superParams.level; i++) {
                    if (scope['extensionLevel' + i.toString()][methodName]) {
                        this.superParams.refStack.push(i);
                    }
                }
            }
            this.superParams.refStack.pop();
            if (this.superParams.refStack.length !== 0) {
                var callLvl = this.superParams.refStack[this.superParams.refStack.length - 1];
                this.superParams.counter++;
                returnValue = scope['extensionLevel' + callLvl.toString()][methodName].apply(this, argList);
                this.superParams.counter--;
            } else {
                kony.print('#MDA2 : Can\'t find any super for the ' + methodName + ' Method.');
            }
            if (this.superParams.counter === 0) {
                this.superParams.refStack = [];
                this.superParams.level = null;
            }
            return returnValue;
        };
        return BusinessDelegator;
    }();
    DataModel_QueryBuilder = function() {
        function QueryBuilder() {}
        /**
         * @function buildSelectList creates a list of fields for given model
         * @param  {BaseModel} baseModel model defination
         * @param  {Json} config    config for corresponding model
         * @return {String} select list
         */
        QueryBuilder.prototype.buildSelectList = function(baseModel, config) {
            var selectList = '';
            for (var key in baseModel.relations) {
                var relationship = baseModel.relations[key];
                var modelstr = relationship.targetObject;
                var modeldefination = kony.mvc.MDAApplication.getSharedInstance().modelStore.getModelDefinition(modelstr);
                var configdefination = kony.mvc.MDAApplication.getSharedInstance().modelStore.getConfig(modelstr);
                selectList = selectList + QueryBuilder.prototype.buildSelectList(modeldefination, configdefination);
            }
            for (var column in config.mappings) {
                selectList = selectList + '`' + config.tableName + '`.`' + config.mappings[column] + '` as ' + config.tableName + '_' + config.mappings[column] + ',';
            }
            return selectList;
        };
        /**
         * @function buildTableName creates list of table names for given model including inner join with related models if any
         * @param  {BaseModel} baseModel model defination
         * @param  {Json} config    config for corresponding model
         * @param  {String} parent   parent table name
         * @param  {Json} parentRelation json describing model relation with parent
         * @return {String} list of table names including inner join with related models if any
         */
        QueryBuilder.prototype.buildTableName = function(baseModel, config, parent, parentRelation) {
            var fromList = '`' + config.tableName + '`';
            if (parentRelation !== undefined) {
                var relations = parentRelation.relationFields;
                var relation = relations[0];
                fromList = fromList + ' ON `' + parent + '`.`' + relation.sourceField + '`=`' + parentRelation.targetObject + '`.`' + relation.targetField + '`';
                for (var i = 1; i < relations.length; i++) {
                    relation = relations[i];
                    fromList = fromList + ' AND `' + parent + '`.`' + relation.sourceField + '`=`' + parentRelation.targetObject + '`.`' + relation.targetField + '`';
                }
            }
            for (var key in baseModel.relations) {
                var relationship = baseModel.relations[key];
                var modelstr = relationship.targetObject;
                var modeldefination = kony.mvc.MDAApplication.getSharedInstance().modelStore.getModelDefinition(modelstr);
                var configdefination = kony.mvc.MDAApplication.getSharedInstance().modelStore.getConfig(modelstr);
                fromList = fromList + ' LEFT OUTER JOIN ' + QueryBuilder.prototype.buildTableName(modeldefination, configdefination, config.tableName, relationship);
            }
            return fromList;
        };
        /**
         * @function buildConditions create a where condition based on criteria
         * @param  {Json} criteria Json object describing criteria
         * @param  {Json} config   config object
         * @return {String} where condition
         */
        QueryBuilder.prototype.buildConditions = function(criteria, config) {
            var finalCriteria = '';
            var leftcondition = '';
            var rightcondition = '';
            if (criteria !== undefined) {
                if (criteria.hasOwnProperty('expr')) {
                    if (!(criteria['lhs'].constructor == {}.constructor) && !(criteria['rhs'].constructor == {}.constructor)) {
                        finalCriteria = criteria['lhs'] + '' + criteria['expr'] + '' + criteria['rhs'];
                    } else {
                        if (criteria.hasOwnProperty('lhs') && criteria['lhs'].constructor == {}.constructor) {
                            leftcondition = leftcondition + QueryBuilder.prototype.buildConditions(criteria['lhs'], config);
                        } else {
                            leftcondition = criteria['lhs'];
                        }
                        if (criteria.hasOwnProperty('rhs') && criteria['rhs'].constructor == {}.constructor) {
                            rightcondition = rightcondition + QueryBuilder.prototype.buildConditions(criteria['rhs'], config);
                        } else {
                            rightcondition = criteria['rhs'];
                        }
                        finalCriteria = leftcondition + ' ' + criteria['expr'] + ' ' + rightcondition;
                    }
                }
            }
            return finalCriteria;
        };
        QueryBuilder.prototype.constructPrimaryKeyODataQuery = function(primaryKeyObj) {
            var filterQuery = '$filter=';
            var primaryKeys = Object.keys(primaryKeyObj);
            var length = primaryKeys.length;
            var query = '';
            for (var index in primaryKeys) {
                query = query + primaryKeys[index] + ' eq ' + primaryKeyObj[primaryKeys[index]];
                if (index < length - 1) query = query + ' and ';
            }
            if (query == '') {
                return null;
            } else {
                return filterQuery + query;
            }
            return query;
        };
        return QueryBuilder;
    }();
    DataModel_constants = {
        SESSIONTOKEN: 'session_token',
        DATA_OBJECT: 'dataObject',
        HEADERS_STRING: 'headers',
        QUERY_PARAMS: 'queryParams',
        LHS_STRING: 'lhs',
        RHS_STRING: 'rhs',
        ACCESS: 'access',
        ONLINE: 'online',
        OFFLINE: 'offline',
        SELECT_STRING: 'select ',
        FROM_STRING: ' from ',
        WHERE_STRING: ' where ',
        EXPR: 'expr',
        MESSAGE_FOR_RECORDCREATED: 'record created',
        MESSAGE_FOR_RECORDPARIALUPDATE: 'record partial update',
        MESSAGE_FOR_RECORDUPDATED: 'record updated',
        MESSAGE_FOR_RECORDDELETED: 'Record deleted',
        ERROR_IN_RECORD_DELETION: 'Error in record deletion',
        MODEL_STRING: 'Model',
        SYMBOL_UNDERSCORE: '_',
        MF_CONFIG_STRING: '_MF_Config',
        FORM_CONTROLLER_TYPE: 'kony.mvc.MDAFormController',
        HTTP_REQUEST_OPTIONS: 'httpRequestOptions',
        XML_REQUEST_OPTIONS: 'xmlHttpRequestOptions'
    };
    DataModel_Error = function() {
        //error object
        var Error = function() {
            this.errcode = null;
            this.errmsg = null;
            this.opstatus = null;
        };
        return Error;
    }();
    DataModel_DBAssembler = function(Error) {
        var assembler = {};
        /**
         * @function {function toDBJson}
         * @param  {BaseModel} BaseModelInstance {instance obj of BaseModel subType}
         * @param  {json object} config {config Json Mapping property names in BaseModel to db column names}
         * @return {json object} {Json object with instance values mapped to db column names}
         */
        assembler.toDBJson = function(BaseModelInstance, config) {
            /*if BaseModelInstance is an instance of model then object to json conversion is performed using toJsonInternal utility to ensure
             **getters are not invoked for this operation.
             **else if BaseModelInstance is an instance of BaseRepository not model instance, standard js methods could be used for conversion.
             */
            if (BaseModelInstance.toJsonInternal) {
                return BaseModelInstance.toJsonInternal();
            } else {
                var dbJson = {};
                Object.keys(config.mappings).forEach(function(key) {
                    dbJson[config.mappings[key]] = BaseModelInstance[key];
                });
                return dbJson;
            }
        };
        //create Error Object
        assembler.createError = function(BaseModelInstance, config, error) {
            var err = new Error();
            if (error.opstatus == 0) {
                if (config.mappings.text == undefined) {
                    err.errcode = 300;
                    err.errmsg = 'Invalid Params';
                    err.opstatus = error.opstatus;
                } else {
                    for (key in error) {
                        err[key] = error[key];
                    }
                }
            } else {
                for (key in error) {
                    err[key] = error[key];
                }
            }
            return err;
        };
        /**
         * @function {function fromDBJson}
         * @param  {BaseModelClass} BaseModelClass {Class of BaseModel subType for object creation}
         * @param  {json object} config         {config Json Mapping property names in BaseModel to db column names}
         * @param  {json object} dbJson         {Json object with instance values mapped to db column names}
         * @return {BaseModel} {BaseModel subType instance object}
         */
        assembler.fromDBJson = function(BaseModelClass, config, dbJson) {
            var modelJson = {};
            Object.keys(config.mappings).forEach(function(key) {
                modelJson[key] = dbJson[config.mappings[key]];
            });
            /*According to the new requirement internal layers shouldn't invoke getters and setters for object instantiation, below statements could be used
             **to instantiate object without invoking getters and setters.
             */
            var retModel = new BaseModelClass();
            if (retModel.fromJsonInternal) retModel.fromJsonInternal(modelJson);
            else retModel = new BaseModelClass(modelJson);
            var baseMap = BaseModelClass.prototype.attributeMap;
            var attributeMap = JSON.parse(JSON.stringify(baseMap));
            for (var attribute in attributeMap) {
                var model = attributeMap[attribute].model;
                var attributeDBValue = dbJson[attribute];
                if (model) {
                    var modelDefinition = kony.mvc.MDAApplication.getSharedInstance().modelStore.getModelDefinition(model);
                    var modelConfig = kony.mvc.MDAApplication.getSharedInstance().modelStore.getConfig(model);
                    if (Array.isArray(attributeDBValue)) {
                        var modelArray = [];
                        for (var record in attributeDBValue) {
                            var modelAttributeJson = {};
                            Object.keys(modelConfig.mappings).forEach(function(key) {
                                modelAttributeJson[key] = attributeDBValue[record][modelConfig.mappings[key]];
                            });
                            var attributeModel = new modelDefinition();
                            if (attributeModel.fromJsonInternal) attributeModel.fromJsonInternal(modelAttributeJson);
                            else attributeModel = new modelDefinition(modelAttributeJson);
                            modelArray.push(attributeModel);
                        }
                        retModel[attribute] = modelArray;
                    } else {
                        var modelAttributeJson = {};
                        Object.keys(modelConfig.mappings).forEach(function(key) {
                            modelAttributeJson[key] = attributeDBValue[modelConfig.mappings[key]];
                        });
                        var attributeModel = new modelDefinition();
                        if (attributeModel.fromJsonInternal) attributeModel.fromJsonInternal(modelAttributeJson);
                        else attributeModel = new modelDefinition(modelAttributeJson);
                        retModel[attribute] = attributeModel;
                    }
                } else {
                    retModel[attribute] = attributeDBValue;
                }
            }
            return retModel;
        };
        return assembler;
    }(DataModel_Error);
    DataModel_DataSource = function(QueryBuilder, constants, DBAssembler) {
        DataSource = function() {};
        /**
         * @function getByPrimaryKey  fetches data for the specified model based on the primary keys
         * @param  {BaseModel} BaseModel model defination
         * @param  {Json} config      config of corresponding model
         * @param  {String/JSON} primaryKey   primitive in case of one primary key and json in case of composite primary key
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return 
         */
        DataSource.prototype.getByPrimaryKey = function(BaseModel, config, primaryKey, onCompletion, accessMode, headerParams, dtoOptions) {
            var modelobject;
            var primaykeyobj = {};
            var primarykey;
            if (primaryKey == null || primaryKey == '' || primaryKey == undefined) {
                throw new Exception('ERROR_CODE_500', 'Invalid Primary Key');
            }
            for (var key in config.primaryKeys) {
                if (!(config.primaryKeys[key] in primaryKey)) {
                    var errPk = new Error();
                    errPk.opstatus = 0;
                    var errorobject = DBAssembler.createError(null, config, errPk);
                    errorobject.errmsg = 'Primary Key ' + config.primaryKeys[key] + ' is missing in the the input record.';
                    //User defines attributes with model object in attributeMap. Each API takes care of deleting the attributes defined
                    //for its usage. With each new invocation of the API, old attributes might be retained if not deleted which might
                    //cause inconsistency, if used.
                    for (var attribute in BaseModel.prototype.attributeMap) {
                        delete BaseModel.prototype.attributeMap[attribute];
                    }
                    onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, errorobject);
                    return;
                }
            }
            if (primaryKey.constructor == {}.constructor) {
                primaykeyobj = primaryKey;
            } else {
                for (var key in config.primaryKeys) {
                    primarykey = config.primaryKeys[key];
                    primaykeyobj[primarykey] = primaryKey;
                }
            }
            var objSvc;
            if (accessMode === undefined) {
                accessMode = kony.mvc.MDAApplication.getSharedInstance().getAppMode();
            }
            objSvc = kony.sdk.getCurrentInstance().getObjectService(config.serviceName, accessMode);
            var headers = {};
            headers[constants.SESSIONTOKEN] = kony.mvc.MDAApplication.getSharedInstance().appContext.session_token;
            for (var headKey in headerParams) {
                headers[headKey] = headerParams[headKey];
            }
            var dataObject = new kony.sdk.dto.DataObject(config.tableName);
            DataSource.prototype.addOptionsToDTO(dataObject, dtoOptions);
            var odataQueryFlag = kony.mvc.MDAApplication.getSharedInstance().getODataStatus();
            var options = {};
            if (odataQueryFlag) {
                var queryBuilder = new QueryBuilder();
                var odataQuery = queryBuilder.constructPrimaryKeyODataQuery(primaykeyobj);
                if (odataQuery) dataObject.setOdataUrl(odataQuery);
            } else {
                options[constants.QUERY_PARAMS] = primaykeyobj;
            }
            options[constants.DATA_OBJECT] = dataObject;
            options[constants.HEADERS_STRING] = headers;
            var httpOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.httpRequestOptions;
            var xmlOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.xmlRequestOptions;
            if (httpOptions) options[constants.HTTP_REQUEST_OPTIONS] = httpOptions;
            if (xmlOptions) options[constants.XML_REQUEST_OPTIONS] = xmlOptions;
            objSvc.fetch(options, function(response) {
                if (response && response.records && response.records.length == 1) {
                    modelobject = DBAssembler.fromDBJson(BaseModel, config, response.records[0]);
                }
                for (var attribute in BaseModel.prototype.attributeMap) {
                    delete BaseModel.prototype.attributeMap[attribute];
                }
                //callback sends status, data, error
                onCompletion(kony.mvc.constants.STATUS_SUCCESS, modelobject, null);
            }, function(err) {
                //callback sends status, data, error
                errorobject = DBAssembler.createError(BaseModel, config, err);
                for (var attribute in BaseModel.prototype.attributeMap) {
                    delete BaseModel.prototype.attributeMap[attribute];
                }
                onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, errorobject);
            });
        };
        /**
         * @function checkObj   forms the valid JSON to be passed as criteria to fetch data for ONLINE calls
         * @param  {JSON} criteria      JSON including "EXPR","lhs" and "rhs" as criteria object for ONLINE calls
         * @param  {JSON} finalCriteria  JSON including pairs as value["lhs"] : value["rhs"] 
         * @return {JSON} finalCriteria
         */
        DataSource.prototype.checkObj = function(criteria, finalCriteria) {
            if (criteria.hasOwnProperty(constants.LHS_STRING) && criteria[constants.LHS_STRING].constructor == kony.mvc.Expression) {
                DataSource.prototype.checkObj(criteria[constants.LHS_STRING], finalCriteria);
            } else {
                finalCriteria[criteria[constants.LHS_STRING]] = criteria[constants.RHS_STRING];
            }
            if (criteria.hasOwnProperty(constants.RHS_STRING) && criteria[constants.RHS_STRING].constructor == kony.mvc.Expression) {
                DataSource.prototype.checkObj(criteria[constants.RHS_STRING], finalCriteria);
            } else {
                finalCriteria[criteria[constants.LHS_STRING]] = criteria[constants.RHS_STRING];
            }
            return finalCriteria;
        };
        /**
         * @function customVerb fetches data for the specified model using specified customVerb
         * @param  {BaseModel} BaseModel    model defination
         * @param  {Json}      config      config of corresponding model
         * @param  {String} customVerb   name of the custom verb to be executed
         * @param  {Json} params       parameters in the form of key value pairs
         * @param  {function} onCompletion success callback
         * @return 
         */
        DataSource.prototype.customVerb = function(BaseModel, config, customVerb, params, onCompletion, headerParams, dtoOptions) {
            var modelobject;
            var basemodel = new BaseModel();
            var models = [];
            var access = {};
            access[constants.ACCESS] = constants.ONLINE;
            var objSvc = kony.sdk.getCurrentInstance().getObjectService(config.serviceName, access);
            var headers = {};
            headers[constants.SESSIONTOKEN] = kony.mvc.MDAApplication.getSharedInstance().appContext.session_token;
            for (var headKey in headerParams) {
                headers[headKey] = headerParams[headKey];
            }
            var dataObject = new kony.sdk.dto.DataObject(config.tableName);
            DataSource.prototype.addOptionsToDTO(dataObject, dtoOptions);
            for (var key in params) {
                dataObject.addField(key, params[key]);
            }
            var options = {};
            options[constants.DATA_OBJECT] = dataObject;
            options[constants.HEADERS_STRING] = headers;
            var httpOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.httpRequestOptions;
            var xmlOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.xmlRequestOptions;
            if (httpOptions) options[constants.HTTP_REQUEST_OPTIONS] = httpOptions;
            if (xmlOptions) options[constants.XML_REQUEST_OPTIONS] = xmlOptions;
            objSvc.customVerb(customVerb, options, function(response) {
                if (response[config.tableName]) {
                    for (var key in response[config.tableName]) {
                        modelobject = DBAssembler.fromDBJson(BaseModel, config, response[config.tableName][key]);
                        models.push(modelobject);
                    }
                    for (var attribute in BaseModel.prototype.attributeMap) {
                        delete BaseModel.prototype.attributeMap[attribute];
                    }
                    onCompletion(kony.mvc.constants.STATUS_SUCCESS, models, null);
                } else {
                    for (var attribute in BaseModel.prototype.attributeMap) {
                        delete BaseModel.prototype.attributeMap[attribute];
                    }
                    if (response.text === null) {
                        errorObject = DBAssembler.createError(BaseModel, config, response);
                        if (errorObject.code == 300) {
                            onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, errorObject);
                        } else {
                            onCompletion(kony.mvc.constants.STATUS_SUCCESS, errorObject, null);
                        }
                    }
                    onCompletion(kony.mvc.constants.STATUS_SUCCESS, response, null);
                }
            }, function(err) {
                //callback sends status, data, error
                errorObject = DBAssembler.createError(BaseModel, config, err);
                for (var attribute in BaseModel.prototype.attributeMap) {
                    delete BaseModel.prototype.attributeMap[attribute];
                }
                onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, errorObject);
            });
        };
        /**
         * @function createModelResponse  converts the backend response into required models
         * @param  {Json} response  response from backend
         * @param  {BaseModel} baseModel model defination
         * @param  {Json} config    config of corresponding model
         * @return {Json} backend responde in the form of models
         */
        DataSource.prototype.createModelResponse = function(response, baseModel, config) {
            var modelresponse = {};
            for (var key in baseModel.relations) {
                var relationship = baseModel.relations[key];
                var modelstr = relationship.targetObject;
                var modeldefination = kony.mvc.MDAApplication.getSharedInstance().modelStore.getModelDefinition(modelstr);
                var configdefination = kony.mvc.MDAApplication.getSharedInstance().modelStore.getConfig(modelstr);
                for (var relations in relationship.relationFields) {
                    var relation = relationship.relationFields[relations];
                    var res = DataSource.prototype.createModelResponse(response, modeldefination, configdefination);
                    response[config.tableName + constants.SYMBOL_UNDERSCORE + relation.sourceField] = res;
                }
            }
            for (var column in config.mappings) {
                try {
                    modelresponse[config.mappings[column]] = response[config.tableName + constants.SYMBOL_UNDERSCORE + config.mappings[column]];
                } catch (err) {}
            }
            var modelObject = DBAssembler.fromDBJson(baseModel, config, modelresponse);
            return modelObject;
        };
        /**
         * @function getByCriteria  fetches data for the specified model based on the criteria passed
         * @param  {BaseModel} modelDefination   model defination
         * @param  {Json} config          config of corresponding model
         * @param  {Json} criteria        criteria object based on which query is build in case of ONLINE and OFFLINE
         * @param  {function} onCompletion    success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return 
         */
        DataSource.prototype.getByCriteria = function(modelDefination, config, criteria, onCompletion, accessMode, headerParams, dtoOptions) {
            if (accessMode === undefined) {
                accessMode = kony.mvc.MDAApplication.getSharedInstance().getAppMode();
            }
            var modelobject;
            var models = [];
            var objSvc;
            var finalCriteria = {};
            var access = {};
            if (accessMode[constants.ACCESS] == constants.OFFLINE) {
                var queryString;
                var query = new QueryBuilder();
                var selectList = query.buildSelectList(modelDefination, config);
                var fromList = query.buildTableName(modelDefination, config);
                selectList = selectList.slice(0, -1);
                queryString = constants.SELECT_STRING + selectList + constants.FROM_STRING + fromList + constants.WHERE_STRING + query.buildConditions(criteria, config);
                var tables = [config.tableName];
                for (var key in modelDefination.relations) {
                    var relationship = modelDefination.relations[key];
                    tables.push(relationship.targetObject);
                }
                access[constants.ACCESS] = constants.OFFLINE;
                objSvc = kony.sdk.getCurrentInstance().getObjectService(config.serviceName, access);
                objSvc.executeSelectQuery(queryString, function(response) {
                    kony.print(JSON.stringify(response));
                    var modelresponse = [];
                    for (var key in response) {
                        modelobject = DataSource.prototype.createModelResponse(response[key], modelDefination, config);
                        modelresponse.push(modelobject);
                    }
                    onCompletion(modelresponse);
                }, function(err) {
                    errorObject = DBAssembler.createError(modelDefination, config, err);
                    onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, errorObject);
                });
            } else {
                if (criteria !== undefined) {
                    if (criteria.hasOwnProperty(constants.EXPR)) {
                        if (criteria.hasOwnProperty(constants.LHS_STRING) && criteria[constants.LHS_STRING].constructor == kony.mvc.Expression) {
                            finalCriteria = DataSource.prototype.checkObj(criteria[constants.LHS_STRING], finalCriteria);
                        }
                        if (criteria.hasOwnProperty(constants.RHS_STRING) && criteria[constants.RHS_STRING].constructor == kony.mvc.Expression) {
                            finalCriteria = DataSource.prototype.checkObj(criteria[constants.RHS_STRING], finalCriteria);
                        }
                        if (!(criteria[constants.LHS_STRING].constructor == kony.mvc.Expression && criteria[constants.RHS_STRING].constructor == kony.mvc.Expression)) {
                            finalCriteria[criteria[constants.LHS_STRING]] = criteria[constants.RHS_STRING];
                        }
                    }
                }
                access[constants.ACCESS] = constants.ONLINE;
                objSvc = kony.sdk.getCurrentInstance().getObjectService(config.serviceName, access);
                var headers = {};
                headers[constants.SESSIONTOKEN] = kony.mvc.MDAApplication.getSharedInstance().appContext.session_token;
                for (var headKey in headerParams) {
                    headers[headKey] = headerParams[headKey];
                }
                var dataObject = new kony.sdk.dto.DataObject(config.tableName);
                DataSource.prototype.addOptionsToDTO(dataObject, dtoOptions);
                var options = {};
                options[constants.DATA_OBJECT] = dataObject;
                options[constants.HEADERS_STRING] = headers;
                options[constants.QUERY_PARAMS] = finalCriteria;
                var httpOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.httpRequestOptions;
                var xmlOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.xmlRequestOptions;
                if (httpOptions) options[constants.HTTP_REQUEST_OPTIONS] = httpOptions;
                if (xmlOptions) options[constants.XML_REQUEST_OPTIONS] = xmlOptions;
                objSvc.fetch(options, function(response) {
                    for (var key in response.records) {
                        modelobject = DBAssembler.fromDBJson(modelDefination, config, response.records[key]);
                        models.push(modelobject);
                    }
                    for (var attribute in modelDefination.prototype.attributeMap) {
                        delete modelDefination.prototype.attributeMap[attribute];
                    }
                    //callback sends status, data, error
                    onCompletion(kony.mvc.constants.STATUS_SUCCESS, models, null);
                }, function(err) {
                    //callback sends status, data, error
                    errorObject = DBAssembler.createError(modelDefination, config, err);
                    for (var attribute in modelDefination.prototype.attributeMap) {
                        delete modelDefination.prototype.attributeMap[attribute];
                    }
                    onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, errorObject);
                });
            }
        };
        /**
         * @function save saves the given model data in the backend
         * @param  {BaseModel} BaseModel    model defination
         * @param  {JSON} config       config of corresponding model
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return 
         */
        DataSource.prototype.save = function(BaseModel, config, onCompletion, accessMode, headerParams, dtoOptions) {
            var objSvc;
            if (accessMode === undefined) {
                accessMode = kony.mvc.MDAApplication.getSharedInstance().getAppMode();
            }
            objSvc = kony.sdk.getCurrentInstance().getObjectService(config.serviceName, accessMode);
            var headers = {};
            headers[constants.SESSIONTOKEN] = kony.mvc.MDAApplication.getSharedInstance().appContext.session_token;
            for (var headKey in headerParams) {
                headers[headKey] = headerParams[headKey];
            }
            var dataObject = new kony.sdk.dto.DataObject(config.tableName);
            DataSource.prototype.addOptionsToDTO(dataObject, dtoOptions);
            var dbobject = DBAssembler.toDBJson(BaseModel, config);
            for (var key in dbobject) {
                if (dbobject[key] !== null) {
                    dataObject.addField(key, dbobject[key]);
                }
            }
            var baseMap = BaseModel.attributeMap;
            if (baseMap) {
                /*Removing JSON.parse(JSON.stringify(baseMap) since it calls getters which in turn calls post processor.Internal layer should not call getters and setters.
                 **Instead of cloning, pushing all the keys in baseMap to attributeMap and then iterating over attributeMap fixes our requirement.
                 */
                var attributeMap = [];
                for (var i in baseMap) {
                    attributeMap.push(i);
                }
                for (var attribute in attributeMap) {
                    var model = baseMap[attributeMap[attribute]].model;
                    var attributeValue = baseMap[attributeMap[attribute]].value;
                    if (model) {
                        var modelArray = [];
                        var modelConfig = kony.mvc.MDAApplication.getSharedInstance().modelStore.getConfig(model);
                        if (Array.isArray(attributeValue)) {
                            for (var eachRecord in attributeValue) {
                                var dbobject = DBAssembler.toDBJson(attributeValue[eachRecord], modelConfig);
                                modelArray.push(dbobject);
                            }
                        } else {
                            var dbobject = DBAssembler.toDBJson(attributeValue, modelConfig);
                            modelArray.push(dbobject);
                        }
                        dataObject.addField(attributeMap[attribute], modelArray);
                    } else {
                        dataObject.addField(attributeMap[attribute], attributeValue);
                    }
                    delete BaseModel.attributeMap[attributeMap[attribute]];
                }
            }
            var options = {};
            options[constants.DATA_OBJECT] = dataObject;
            options[constants.HEADERS_STRING] = headers;
            var httpOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.httpRequestOptions;
            var xmlOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.xmlRequestOptions;
            if (httpOptions) options[constants.HTTP_REQUEST_OPTIONS] = httpOptions;
            if (xmlOptions) options[constants.XML_REQUEST_OPTIONS] = xmlOptions;
            objSvc.create(options, function(res) {
                kony.print(constants.MESSAGE_FOR_RECORDCREATED + JSON.stringify(res));
                kony.print(constants.MESSAGE_FOR_RECORDCREATED);
                //callback sends status, data, error
                if (res.text === null) {
                    errorObject = DBAssembler.createError(BaseModel, config, response);
                    onCompletion(kony.mvc.constants.STATUS_SUCCESS, errorObject, null);
                }
                onCompletion(kony.mvc.constants.STATUS_SUCCESS, res, null);
            }, function(err) {
                kony.print(JSON.stringify(err));
                errorObject = DBAssembler.createError(BaseModel, config, err);
                onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, errorObject); //callback sends status, data, error
                //onCompletion(kony.mvc.constants.STATUS_FAILURE,undefined,err);
            });
        };
        /**
         * @function partialUpdate partially update the model data to the backend
         * @param  {BaseModel} BaseModel    model defination
         * @param  {JSON} config       config of corresponding model
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return 
         */
        DataSource.prototype.partialUpdate = function(BaseModel, config, onCompletion, accessMode, headerParams, dtoOptions) {
            var objSvc;
            if (accessMode === undefined) {
                accessMode = kony.mvc.MDAApplication.getSharedInstance().getAppMode();
            }
            objSvc = kony.sdk.getCurrentInstance().getObjectService(config.serviceName, accessMode);
            var headers = {};
            headers[constants.SESSIONTOKEN] = kony.mvc.MDAApplication.getSharedInstance().appContext.session_token;
            for (var headKey in headerParams) {
                headers[headKey] = headerParams[headKey];
            }
            var dataObject = new kony.sdk.dto.DataObject(config.tableName);
            DataSource.prototype.addOptionsToDTO(dataObject, dtoOptions);
            var dbobject = DBAssembler.toDBJson(BaseModel, config);
            for (var key in dbobject) {
                if (dbobject[key] !== null) {
                    dataObject.addField(key, dbobject[key]);
                }
            }
            var baseMap = BaseModel.attributeMap;
            if (baseMap) {
                /*Removing JSON.parse(JSON.stringify(baseMap) since it calls getters which in turn calls post processor.Internal layer should not call getters and setters.
                 **Instead of cloning, pushing all the keys in baseMap to attributeMap and then iterating over attributeMap fixes our requirement.
                 */
                var attributeMap = [];
                for (var i in baseMap) {
                    attributeMap.push(i);
                }
                for (var attribute in attributeMap) {
                    var model = baseMap[attributeMap[attribute]].model;
                    var attributeValue = baseMap[attributeMap[attribute]].value;
                    if (model) {
                        var modelArray = [];
                        var modelConfig = kony.mvc.MDAApplication.getSharedInstance().modelStore.getConfig(model);
                        if (Array.isArray(attributeValue)) {
                            for (var eachRecord in attributeValue) {
                                var dbobject = DBAssembler.toDBJson(attributeValue[eachRecord], modelConfig);
                                modelArray.push(dbobject);
                            }
                        } else {
                            var dbobject = DBAssembler.toDBJson(attributeValue, modelConfig);
                            modelArray.push(dbobject);
                        }
                        dataObject.addField(attributeMap[attribute], modelArray);
                    } else {
                        dataObject.addField(attributeMap[attribute], attributeValue);
                    }
                    delete BaseModel.attributeMap[attributeMap[attribute]];
                }
            }
            var options = {};
            options[constants.DATA_OBJECT] = dataObject;
            options[constants.HEADERS_STRING] = headers;
            var httpOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.httpRequestOptions;
            var xmlOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.xmlRequestOptions;
            if (httpOptions) options[constants.HTTP_REQUEST_OPTIONS] = httpOptions;
            if (xmlOptions) options[constants.XML_REQUEST_OPTIONS] = xmlOptions;
            objSvc.partialUpdate(options, function(res) {
                kony.print(constants.MESSAGE_FOR_RECORDPARIALUPDATE + JSON.stringify(res));
                kony.print(constants.MESSAGE_FOR_RECORDPARIALUPDATE);
                //callback sends status, data, error
                if (res.text === null) {
                    errorObject = DBAssembler.createError(BaseModel, config, response);
                    onCompletion(kony.mvc.constants.STATUS_SUCCESS, errorObject, null);
                }
                onCompletion(kony.mvc.constants.STATUS_SUCCESS, res, null);
            }, function(err) {
                kony.print(JSON.stringify(err));
                errorObject = DBAssembler.createError(BaseModel, config, err);
                onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, errorObject); //callback sends status, data, error
            });
        };
        /**
         * @function getAll fetches  all the records for the specified model
         * @param  {BaseModel} BaseModel    model defination
         * @param  {JSON} config       config of corresponding model
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return 
         */
        DataSource.prototype.getAll = function(BaseModel, config, onCompletion, accessMode, headerParams, dtoOptions) {
            var modelobject;
            var models = [];
            var objSvc;
            if (accessMode === undefined) {
                accessMode = kony.mvc.MDAApplication.getSharedInstance().getAppMode();
            }
            objSvc = kony.sdk.getCurrentInstance().getObjectService(config.serviceName, accessMode);
            var headers = {};
            headers[constants.SESSIONTOKEN] = kony.mvc.MDAApplication.getSharedInstance().appContext.session_token;
            for (var headKey in headerParams) {
                headers[headKey] = headerParams[headKey];
            }
            var dataObject = new kony.sdk.dto.DataObject(config.tableName);
            DataSource.prototype.addOptionsToDTO(dataObject, dtoOptions);
            var options = {};
            options[constants.DATA_OBJECT] = dataObject;
            options[constants.HEADERS_STRING] = headers;
            var httpOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.httpRequestOptions;
            var xmlOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.xmlRequestOptions;
            if (httpOptions) options[constants.HTTP_REQUEST_OPTIONS] = httpOptions;
            if (xmlOptions) options[constants.XML_REQUEST_OPTIONS] = xmlOptions;
            objSvc.fetch(options, function(response) {
                for (var key in response.records) {
                    modelobject = DBAssembler.fromDBJson(BaseModel, config, response.records[key]);
                    models.push(modelobject);
                }
                for (var attribute in BaseModel.prototype.attributeMap) {
                    delete BaseModel.prototype.attributeMap[attribute];
                }
                //callback sends status, data, error
                onCompletion(kony.mvc.constants.STATUS_SUCCESS, models, null);
            }, function(err) {
                //callback sends status, data, error
                errorObject = DBAssembler.createError(BaseModel, config, err);
                for (var attribute in BaseModel.prototype.attributeMap) {
                    delete BaseModel.prototype.attributeMap[attribute];
                }
                onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, errorObject); // onCompletion(kony.mvc.constants.STATUS_FAILURE,undefined,err);
            });
        };
        /**
         * @function update updates the specified model into the backend
         * @param  {BaseModel} BaseModel    model defination
         * @param  {JSON} config       config of corresponding model
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return 
         */
        DataSource.prototype.update = function(BaseModel, config, onCompletion, accessMode, headerParams, dtoOptions) {
            var objSvc;
            if (accessMode === undefined) {
                accessMode = kony.mvc.MDAApplication.getSharedInstance().getAppMode();
            }
            objSvc = kony.sdk.getCurrentInstance().getObjectService(config.serviceName, accessMode);
            var headers = {};
            headers[constants.SESSIONTOKEN] = kony.mvc.MDAApplication.getSharedInstance().appContext.session_token;
            for (var headKey in headerParams) {
                headers[headKey] = headerParams[headKey];
            }
            var dataObject = new kony.sdk.dto.DataObject(config.tableName);
            DataSource.prototype.addOptionsToDTO(dataObject, dtoOptions);
            var dbobject = DBAssembler.toDBJson(BaseModel, config);
            for (var key in dbobject) {
                if (dbobject[key] !== null) {
                    dataObject.addField(key, dbobject[key]);
                }
            }
            var baseMap = BaseModel.attributeMap;
            if (baseMap) {
                /*Removing JSON.parse(JSON.stringify(baseMap) since it calls getters which in turn calls post processor.Internal layer should not call getters and setters.
                 **Instead of cloning, pushing all the keys in baseMap to attributeMap and then iterating over attributeMap fixes our requirement.
                 */
                var attributeMap = [];
                for (var i in baseMap) {
                    attributeMap.push(i);
                }
                for (var attribute in attributeMap) {
                    var model = baseMap[attributeMap[attribute]].model;
                    var attributeValue = baseMap[attributeMap[attribute]].value;
                    if (model) {
                        var modelArray = [];
                        var modelConfig = kony.mvc.MDAApplication.getSharedInstance().modelStore.getConfig(model);
                        if (Array.isArray(attributeValue)) {
                            for (var eachRecord in attributeValue) {
                                var dbobject = DBAssembler.toDBJson(attributeValue[eachRecord], modelConfig);
                                modelArray.push(dbobject);
                            }
                        } else {
                            var dbobject = DBAssembler.toDBJson(attributeValue, modelConfig);
                            modelArray.push(dbobject);
                        }
                        dataObject.addField(attributeMap[attribute], modelArray);
                    } else {
                        dataObject.addField(attributeMap[attribute], attributeValue);
                    }
                    delete BaseModel.attributeMap[attributeMap[attribute]];
                }
            }
            var options = {};
            options[constants.DATA_OBJECT] = dataObject;
            options[constants.HEADERS_STRING] = headers;
            var httpOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.httpRequestOptions;
            var xmlOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.xmlRequestOptions;
            if (httpOptions) options[constants.HTTP_REQUEST_OPTIONS] = httpOptions;
            if (xmlOptions) options[constants.XML_REQUEST_OPTIONS] = xmlOptions;
            objSvc.update(options, function(res) {
                kony.print(constants.MESSAGE_FOR_RECORDUPDATED + JSON.stringify(res));
                kony.print(constants.MESSAGE_FOR_RECORDUPDATED);
                //callback sends status, data, error
                if (res.text === null) {
                    errorObject = DBAssembler.createError(BaseModel, config, response);
                    onCompletion(kony.mvc.constants.STATUS_SUCCESS, errorObject, null);
                }
                onCompletion(kony.mvc.constants.STATUS_SUCCESS, res, null);
            }, function(err) {
                kony.print(JSON.stringify(err));
                //callback sends status, data, error
                errorObject = DBAssembler.createError(BaseModel, config, err);
                onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, errorObject); //onCompletion(kony.mvc.constants.STATUS_FAILURE,undefined,err);
            });
        };
        /**
         * @function remove deletes the specified model from the backend
         * @param  {BaseModel} BaseModel    model defination
         * @param  {Json} config      config of corresponding model
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return
         */
        DataSource.prototype.remove = function(BaseModel, config, onCompletion, accessMode, headerParams, dtoOptions) {
            var dbobject = DBAssembler.toDBJson(BaseModel, config);
            var headers = {};
            headers[constants.SESSIONTOKEN] = kony.mvc.MDAApplication.getSharedInstance().appContext.session_token;
            for (var headKey in headerParams) {
                headers[headKey] = headerParams[headKey];
            }
            var objSvc;
            if (accessMode === undefined) {
                accessMode = kony.mvc.MDAApplication.getSharedInstance().getAppMode();
            }
            objSvc = kony.sdk.getCurrentInstance().getObjectService(config.serviceName, accessMode);
            var dataObject = new kony.sdk.dto.DataObject(config.tableName);
            DataSource.prototype.addOptionsToDTO(dataObject, dtoOptions);
            for (var key in dbobject) {
                if (dbobject[key] !== null) {
                    dataObject.addField(key, dbobject[key]);
                }
            }
            var options = {};
            options[constants.DATA_OBJECT] = dataObject;
            options[constants.HEADERS_STRING] = headers;
            var httpOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.httpRequestOptions;
            var xmlOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.xmlRequestOptions;
            if (httpOptions) options[constants.HTTP_REQUEST_OPTIONS] = httpOptions;
            if (xmlOptions) options[constants.XML_REQUEST_OPTIONS] = xmlOptions;
            objSvc.deleteRecord(options, function(res) {
                kony.print(constants.MESSAGE_FOR_RECORDDELETED);
                onCompletion(kony.mvc.constants.STATUS_SUCCESS, res, null);
            }, function(err) {
                kony.print(constants.ERROR_IN_RECORD_DELETION + JSON.stringify(err));
                errorObject = DBAssembler.createError(BaseModel, config, err);
                onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, errorObject); //onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, err);
            });
        };
        /**
         * @function removeById deletes the specified model from the backend
         * @param  {BaseModel} BaseModel    model defination
         * @param  {Json} config      config of corresponding model
         * @param  {function} onCompletion success callback
         * @param {JSON/STRING} primaryKey primary key value or json representing the key and value
         * @param  {JSON} accessMode   json specifing access mode
         * @return
         */
        DataSource.prototype.removeById = function(BaseModel, config, primaryKey, onCompletion, accessMode, headerParams, dtoOptions) {
            var modelobject;
            var primaykeyobj = {};
            var primarykey;
            if (primaryKey == null || primaryKey == '' || primaryKey == undefined) {
                throw new Exception('ERROR_CODE_500', 'Invalid  Primary Key');
            }
            if (primaryKey.constructor == {}.constructor) {
                primaykeyobj = primaryKey;
            } else {
                for (var key in config.primaryKeys) {
                    primarykey = config.primaryKeys[key];
                    primaykeyobj[primarykey] = primaryKey;
                }
            }
            var objSvc;
            if (accessMode === undefined) {
                accessMode = kony.mvc.MDAApplication.getSharedInstance().getAppMode();
            }
            objSvc = kony.sdk.getCurrentInstance().getObjectService(config.serviceName, accessMode);
            var headers = {};
            headers[constants.SESSIONTOKEN] = kony.mvc.MDAApplication.getSharedInstance().appContext.session_token;
            for (var headKey in headerParams) {
                headers[headKey] = headerParams[headKey];
            }
            var dataObject = new kony.sdk.dto.DataObject(config.tableName);
            DataSource.prototype.addOptionsToDTO(dataObject, dtoOptions);
            var keys = Object.keys(primaykeyobj);
            for (var records in keys) {
                dataObject.addField(keys[records], primaykeyobj[keys[records]]);
            }
            var options = {};
            options[constants.DATA_OBJECT] = dataObject;
            options[constants.HEADERS_STRING] = headers;
            //options[constants.QUERY_PARAMS]= primaykeyobj;
            var httpOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.httpRequestOptions;
            var xmlOptions = kony.mvc.MDAApplication.getSharedInstance().appContext.xmlRequestOptions;
            if (httpOptions) options[constants.HTTP_REQUEST_OPTIONS] = httpOptions;
            if (xmlOptions) options[constants.XML_REQUEST_OPTIONS] = xmlOptions;
            objSvc.deleteRecord(options, function(res) {
                kony.print(constants.MESSAGE_FOR_RECORDDELETED);
                onCompletion(kony.mvc.constants.STATUS_SUCCESS, res, null);
            }, function(err) {
                kony.print(constants.ERROR_IN_RECORD_DELETION + JSON.stringify(err));
                errorObject = DBAssembler.createError(BaseModel, config, err);
                onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, errorObject); // onCompletion(kony.mvc.constants.STATUS_FAILURE, undefined, err);
            });
        };
        DataSource.prototype.addOptionsToDTO = function(dataObject, dtoOptions) {
            for (var key in dtoOptions) {
                dataObject[key] = dtoOptions[key];
            }
        };
        return DataSource;
    }(DataModel_QueryBuilder, DataModel_constants, DataModel_DBAssembler);
    DataModel_BaseRepository = function(DataSource) {
        function BaseRepository(modelDefinition, config, injectedDataSource) {
            this.modelDefinition = modelDefinition;
            this.config = config;
            this.datasource = injectedDataSource || new DataSource();
            this.headerParams = null;
        }
        /**
         * @function initialize initalize the base repository
         * @param  {JSON} context 
         * @return 
         */
        BaseRepository.prototype.initialize = function(context) {};
        /**
         * @function save saves the given model data in the backend
         * @param  {BaseModel} modelInstance model object
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return
         */
        BaseRepository.prototype.save = function(modelInstance, onCompletion, accessMode, options) {
            this.datasource.save(modelInstance, this.config, onCompletion, accessMode, this.headerParams, options);
            this.clearHeaderParams();
        };
        /**
         * @function update updates the specified model into the backend
         * @param  {BaseModel} modelInstance model object
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return
         */
        BaseRepository.prototype.update = function(modelInstance, onCompletion, accessMode, options) {
            this.datasource.update(modelInstance, this.config, onCompletion, accessMode, this.headerParams, options);
            this.clearHeaderParams();
        };
        /**
         * @function partialUpdate partially update the model data to the backend
         * @param  {BaseModel} modelInstance model object
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return 
         */
        BaseRepository.prototype.partialUpdate = function(modelInstance, onCompletion, accessMode, options) {
            this.datasource.partialUpdate(modelInstance, this.config, onCompletion, accessMode, this.headerParams, options);
            this.clearHeaderParams();
        };
        /**
         * @function remove deletes the specified model from the backend
         * @param  {BaseModel} modelInstance model object
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return
         */
        BaseRepository.prototype.remove = function(modelInstance, onCompletion, accessMode, options) {
            this.datasource.remove(modelInstance, this.config, onCompletion, accessMode, this.headerParams, options);
            this.clearHeaderParams();
        };
        /**
         * @function removeById deletes the specified model from the backend
         * @param  {BaseModel} modelInstance model object
         * @param {JSON/STRING} primaryKey primary key value or json representing the key and value
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return
         */
        BaseRepository.prototype.removeById = function(modelInstance, primaryKey, onCompletion, accessMode, options) {
            this.datasource.removeById(modelInstance, this.config, primaryKey, onCompletion, accessMode, this.headerParams, options);
            this.clearHeaderParams();
        };
        /**
         * @function getByPrimaryKey  fetches data for the specified model based on the primary keys
         * @param  {String/JSON} primaryKey   primitive in case of one primary key and json in case of composite primary key
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return 
         */
        BaseRepository.prototype.getByPrimaryKey = function(PrimaryKey, onCompletion, accessMode, options) {
            this.datasource.getByPrimaryKey(this.modelDefinition, this.config, PrimaryKey, onCompletion, accessMode, this.headerParams, options);
            this.clearHeaderParams();
        };
        /**
         * @function getAll fetches  all the records for the specified model
         * @param  {type} onCompletion success callback
         * @param  {type} accessMode   json specifing access mode
         * @return 
         */
        BaseRepository.prototype.getAll = function(onCompletion, accessMode, options) {
            this.datasource.getAll(this.modelDefinition, this.config, onCompletion, accessMode, this.headerParams, options);
            this.clearHeaderParams();
        };
        /**
         * @function customVerb fetches data for the specified model using specified customVerb
         * @param  {String} customVerb   name of the custom verb to be executed
         * @param  {JSON} params       parameters in the form of key value pairs
         * @param  {function} onCompletion success callback
         * @return 
         */
        BaseRepository.prototype.customVerb = function(customVerb, params, onCompletion, options) {
            this.datasource.customVerb(this.modelDefinition, this.config, customVerb, params, onCompletion, this.headerParams, options);
            this.clearHeaderParams();
        };
        /**
         * @function getByCriteria  fetches data for the specified model based on the criteria passed
         * @param  {Json} criteria        criteria object based on which query is build in case of online and offline
         * @param  {function} onCompletion    success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return
         */
        BaseRepository.prototype.getByCriteria = function(criteria, onCompletion, accessMode, options) {
            this.datasource.getByCriteria(this.modelDefinition, this.config, criteria, onCompletion, accessMode, this.headerParams, options);
            this.clearHeaderParams();
        };
        BaseRepository.prototype.setHeaderParams = function(headers) {
            this.headerParams = headers;
        };
        BaseRepository.prototype.clearHeaderParams = function() {
            this.headerParams = null;
        };
        return BaseRepository;
    }(DataModel_DataSource);
    DataModel_RepositoryManager = function(BaseRepository) {
        RepositoryManager = function() {
            this.repoMap = {};
            this.repo = undefined;
            this.repoConfig = undefined;
            this.initializeRepoConfig('RepoManagerConfig');
        };
        RepositoryManager.prototype.initialize = function(context) {};
        /**
         * @function initializeRepoConfig intializes repoManagerConfig which is generated 
         * @param  {String} repoconfig repoManagerConfig file name
         * @return 
         */
        RepositoryManager.prototype.initializeRepoConfig = function(repoconfig) {
            this.repoConfig = require(repoconfig);
        };
        /**
         * @function getRepository
         * @param  {String} model model name as per repoManagerConfig file
         * @return {BaseRepository} repository for given model
         */
        RepositoryManager.prototype.getRepository = function(model) {
            var repo = this.repoMap[model];
            if (repo === undefined) {
                var modelConfig = this.repoConfig[model];
                var modelPath = modelConfig['model'];
                var configPath = modelConfig['config'];
                var repoPath = modelConfig['repository'];
                var repository;
                if (repoPath == '') {
                    repository = BaseRepository;
                } else {
                    repository = require(repoPath);
                }
                this.setRepository(model, modelPath, configPath, repository);
            }
            return this.repoMap[model];
        };
        /**
         * @function getAllRepository gives all the repositories which are set in repository manager
         * @return {Array} list of repositories
         */
        RepositoryManager.prototype.getAllRepository = function() {
            var repositories = [];
            for (var model in this.repoMap) {
                repositories.push(this.repoMap[model]);
            }
            return repositories;
        };
        /**
         * @function setRepository sets repository in repository manager
         * @param  {String} modelName       name of model as per repoManagerConfig file
         * @param  {String} modelPath       Path of model which used to require the corresponding model 
         * @param  {String} configPath      Path of config which used to require the corresponding config
         * @param  {function} ModelRepository repository defination
         * @return 
         */
        RepositoryManager.prototype.setRepository = function(modelName, modelPath, configPath, ModelRepository) {
            var model = require(modelPath);
            var config = require(configPath);
            var repository = new ModelRepository(model, config);
            this.repoMap[modelName] = repository;
        };
        return RepositoryManager; //}();
    }(DataModel_BaseRepository);
    PresentationController_MDABasePresenter = function() {
        function MDABasePresenter() {
            this.navigator = null;
            this.businessController = null;
            this.superParams = {
                counter: 0,
                level: null,
                refStack: []
            };
            this.initialize();
        }
        MDABasePresenter.prototype.initialize = function() {};
        MDABasePresenter.prototype.asyncUpdateUI = function(uiTag, context) {
            var formInStack = false;
            for (var i = 0; i < this._presentationStack.length; i++) {
                if (this._presentationStack[i].formName == uiTag) {
                    formInStack = true;
                    break;
                }
            }
            if (formInStack) {
                var controller = _kony.mvc.GetController(uiTag, true);
                controller.updateUI(context);
            } else {
                kony.print('## MDA: Trying to asyncUpdateUI. Can\'t find the FORM: ' + uiTag + ' as Loaded.');
            }
        };
        MDABasePresenter.prototype.presentUserInterface = function(uiTag, context, isBack) {
            isBack = isBack ? isBack : false;
            if (!isBack) {
                this._pushToPresentationStack(this, uiTag, context);
            }
            //TO DO: Will move to individial Derived class
            this.navigator.presentUserInterface(uiTag, context);
        };
        MDABasePresenter.prototype._onEventRaised = function(sender, eventId, eventContext) {
            if ('on' + eventId in this) {
                this['on' + eventId].call(this, sender, eventContext);
            } else {
                this.onEventRaised(sender, eventId, eventContext);
            }
        };
        MDABasePresenter.prototype.onEventRaised = function(sender, eventId, eventContext) {};
        MDABasePresenter.prototype._presentationStack = [];
        MDABasePresenter.prototype._createPresentationStackObject = function(presenter, formName, context) {
            var stackObj = {};
            stackObj.presenter = presenter;
            stackObj.formName = formName;
            stackObj.context = context;
            return stackObj;
        };
        MDABasePresenter.prototype._pushToPresentationStack = function(presenter, formName, context) {
            if (this._presentationStack.length != 0) {
                var top = this._presentationStack.length - 1;
                var topStackObj = this._presentationStack[top];
                if (topStackObj.formName == formName) {
                    topStackObj.context = context;
                } else {
                    this._presentationStack.push(this._createPresentationStackObject(presenter, formName, context));
                }
            } else {
                this._presentationStack.push(this._createPresentationStackObject(presenter, formName, context));
            }
        };
        MDABasePresenter.prototype._popFromPresentationStack = function() {
            var poppedStackObject = this._presentationStack.pop();
            var stackLength = this._presentationStack.length;
            if (stackLength != 0) return this._presentationStack[stackLength - 1];
            else return null;
        };
        MDABasePresenter.prototype.clearPresentationStackUntil = function(formName) {
            if (formName) {
                var top = this._presentationStack.length - 1;
                while (this._presentationStack[top].formName != formName) {
                    this._presentationStack.pop();
                    top -= 1;
                }
            } else {
                kony.print('mention form name parameter to clear until that object in stack');
            }
        };
        MDABasePresenter.prototype.presentPreviousScreen = function(context) {
            var previousStackContext = this._popFromPresentationStack();
            if (previousStackContext) {
                var presenter = previousStackContext.presenter;
                var formName = previousStackContext.formName;
                var context = context ? context : previousStackContext.context;
                presenter.presentUserInterface(formName, context, true);
            } else {
                kony.print('No previous forms available');
            }
        };
        MDABasePresenter.prototype.attachBackPresentationFlow = function(formName, context) {
            this._pushToPresentationStack(this, formName, context);
        };
        MDABasePresenter.prototype.detachFromPresentationFlow = function(formName) {
            var poppedArray = [];
            var top = this._presentationStack.length - 1;
            while (this._presentationStack[top].formName != formName) {
                var poppedObject = this._presentationStack.pop();
                poppedArray.push(poppedObject);
                top -= 1;
            }
            //Removing the from
            this._presentationStack.pop();
            Array.prototype.push.apply(this._presentationStack, poppedArray);
        };
        MDABasePresenter.prototype.getCurrentForm = function() {
            var top = this._presentationStack.length - 1;
            var topStackObj = this._presentationStack[top];
            return topStackObj.formName;
        };
        MDABasePresenter.prototype.super = function(methodName, argList) {
            var scope = this;
            var returnValue = null;
            if (this.superParams.level === null) {
                this.superParams.level = 0;
                while (scope['extensionLevel' + this.superParams.level.toString()]) {
                    this.superParams.level++;
                }
            }
            if (this.superParams.counter === 0) {
                for (var i = 0; i < this.superParams.level; i++) {
                    if (scope['extensionLevel' + i.toString()][methodName]) {
                        this.superParams.refStack.push(i);
                    }
                }
            }
            this.superParams.refStack.pop();
            if (this.superParams.refStack.length !== 0) {
                var callLvl = this.superParams.refStack[this.superParams.refStack.length - 1];
                this.superParams.counter++;
                returnValue = scope['extensionLevel' + callLvl.toString()][methodName].apply(this, argList);
                this.superParams.counter--;
            } else {
                kony.print('#MDA2 : Can\'t find any super for the ' + methodName + ' Method.');
            }
            if (this.superParams.counter === 0) {
                this.superParams.refStack = [];
                this.superParams.level = null;
            }
            return returnValue;
        };
        return MDABasePresenter;
    }();
    BaseNavigator_MDABaseNavigator = function() {
        function MDABaseNavigator() {
            this.presentationController = null;
            this.config = null;
            this.initialize();
        }
        MDABaseNavigator.prototype.initialize = function() {};
        MDABaseNavigator.prototype.presentUserInterface = function(uiTag, context) {
            var formToPresent = uiTag;
            this.presentForm(formToPresent, uiTag, context);
        };
        MDABaseNavigator.prototype.presentForm = function(form, uiTag, viewModel) {
            var context = {};
            context['viewModel'] = viewModel;
            context._presenter = this.presentationController;
            var config = this.getConfig(form);
            context._formConfig = config;
            var _currentForm = kony.application.getCurrentForm();
            if (_currentForm && form == _currentForm.id) {
                var controller = _kony.mvc.GetController(form, true);
                controller.updateUI(context['viewModel']);
            } else {
                try {
                    var frmNavObject = new kony.mvc.Navigation(form);
                    frmNavObject.navigate(context);
                } catch (err) {
                    throw new Exception('ERROR_CODE_300', 'Error at Navigator, Missing or Wrong UITag : ' + err);
                }
            }
        };
        MDABaseNavigator.prototype.getConfig = function(form) {
            var name;
            try {
                this.name = eval(form + 'Config');
            } catch (err) {
                return null;
            }
            return this.name;
        };
        return MDABaseNavigator;
    }();
    ModuleManager_MDAModule = function(MDABasePresenter, MDABaseNavigator, BusinessController, constants, BusinessDelegator) {
        function MDAModule(moduleName, moduleMode, channel, callback, isStartup) {
            this.businessController = null;
            this.presentationController = null;
            this.navigator = null;
            this.moduleName = moduleName;
            this.channel = channel;
            try {
                this.moduleConfig = eval(this.moduleName + 'Config');
                if (this.moduleConfig[moduleMode]) {
                    this.moduleConfig = this.moduleConfig[moduleMode];
                    this.moduleMode = moduleMode;
                } else {
                    this.moduleMode = 'Default';
                    kony.print('MDA2***..module: ' + moduleName + '- Default Mode');
                }
            } catch (e) {
                throw new Exception('ERROR_CODE_600', 'Module Config expected ' + e);
            }
            if (isStartup == 1) {
                this.setStartupModule(callback);
            } else {
                this.setupModule(callback);
            }
        }
        MDAModule.prototype.setStartupModule = function(callback) {
            kony.print('MDA2*** Setup Startup module');
            if (callback !== undefined) {
                this.setUpBusinessPresentationController(callback);
                this.setUpNavigator();
            } else {
                this.setUpBusinessController();
                this.setUpPresentationController();
                this.setUpNavigator();
                this.presentationController.navigator = this.navigator;
                this.presentationController.businessController = this.businessController;
                this.navigator.presentationController = this.presentationController;
            }
        };
        MDAModule.prototype.setupModule = function(callback) {
            kony.print('MDA2*** Setup module');
            if (callback !== undefined) {
                this.setUpForms();
                this.setUpBusinessPresentationController(callback);
                this.setUpNavigator();
            } else {
                this.setUpForms();
                this.setUpBusinessController();
                this.setUpPresentationController();
                this.setUpNavigator();
                this.presentationController.navigator = this.navigator;
                this.presentationController.businessController = this.businessController;
                this.navigator.presentationController = this.presentationController;
            }
        };
        MDAModule.prototype.setUpBusinessPresentationController = function(callback) {
            if (this.moduleConfig === undefined) {
                this.businessController = this.createBusinessController();
                this.presentationController = this.createPresentationController();
                if (this.businessController === null && this.presentationController === null) {
                    kony.print('MDA2*** Derived module does not provide a Business controller');
                    this.businessController = this.createDefaultBusinessController();
                }
            } else {
                var businessControllerClass, presentationControllerClass, businessExtensions, presentationExtensions;
                if (this.moduleConfig.BusinessControllerConfig) {
                    businessControllerClass = this.moduleConfig.BusinessControllerConfig.BusinessControllerClass;
                    if (this.moduleConfig.BusinessControllerConfig.CommandHandler) {
                        var commandHandlers = this.moduleConfig.BusinessControllerConfig.CommandHandler;
                        var handlersarray = [],
                            commandId = [],
                            commandHandlerExtn = [];
                        for (var i = 0; i < commandHandlers.length; i++) {
                            commandId[i] = commandHandlers[i].CommandId;
                            commandHandlerExtn[i] = commandHandlers[i].CommandHandlerExtension;
                            handlersarray[i] = commandHandlers[i].CommandHandler;
                        }
                    }
                }
                if (this.moduleConfig.BusinessControllerConfig.BusinessExtensions) businessExtensions = this.moduleConfig.BusinessControllerConfig.BusinessExtensions;
                //If buisnessController class is not supplied in config file, 
                //create from derived module else default Buisness controller
                var currentChannel = kony.sdk.getChannelType();
                //TO DO: Platform team to generate channel correctly
                currentChannel = currentChannel.charAt(0).toUpperCase() + currentChannel.slice(1);
                if (this.channel === undefined) {
                    if (this.moduleConfig.PresentationControllerConfig) {
                        var defaultPresentation = this.moduleConfig.PresentationControllerConfig['Default'];
                        var channelPresentation = this.moduleConfig.PresentationControllerConfig[currentChannel];
                        this.channel = channelPresentation ? currentChannel : 'Default';
                        presentationControllerClass = this.moduleConfig.PresentationControllerConfig[this.channel].PresentationControllerClass;
                        presentationExtensions = this.moduleConfig.PresentationControllerConfig[this.channel].PresentationExtensions;
                    } else presentationControllerClass = undefined;
                } else {
                    if (this.moduleConfig.PresentationControllerConfig && this.moduleConfig.PresentationControllerConfig[this.channel]) {
                        presentationControllerClass = this.moduleConfig.PresentationControllerConfig[this.channel].PresentationControllerClass;
                        presentationExtensions = this.moduleConfig.PresentationControllerConfig[this.channel].PresentationExtensions;
                    } else presentationControllerClass = undefined;
                }
                if (businessControllerClass === undefined || businessControllerClass === '' || presentationControllerClass === undefined || presentationControllerClass === '') {
                    kony.print(' MDA2*** Config does not provide a Business controller');
                    kony.print('MDA2*** Config does not provide a Presentation controller');
                    this.businessController = this.createBusinessController();
                    this.presentationController = this.createPresentationController();
                    if (this.businessController === null && this.presentationController === null) {
                        kony.print('MDA2*** Derived module does not provide a Business controller');
                        this.businessController = this.createDefaultBusinessController();
                        kony.print('MDA2*** Derived module does not provide a Presentation controller');
                        this.presentationController = this.createDefaultPresentationController();
                    }
                } else {
                    kony.print('MDA2*** Config  provides a Presentation controller');
                    try {
                        var pController, bController;
                        var self = this;
                        var params = [
                            presentationControllerClass,
                            businessControllerClass
                        ];
                        params = params.concat(businessExtensions);
                        params = params.concat(presentationExtensions);
                        if (handlersarray) params = params.concat(handlersarray);
                        if (commandHandlerExtn) params = params.concat(commandHandlerExtn);
                        var DerivedController = require(params, function() {
                            presentationControllerClass = arguments[0];
                            businessControllerClass = arguments[1];
                            pController = new presentationControllerClass();
                            bController = new businessControllerClass();
                            self.presentationController = pController;
                            self.businessController = bController;
                            self.navigator.presentationController = self.presentationController;
                            self.presentationController.businessController = self.businessController;
                            self.presentationController.navigator = self.navigator;

                            function Callback() {
                                callback(self);
                            }
                            self.createPresentationExtensionsAsync(function() {
                                if (BusinessController.prototype.isPrototypeOf(bController)) {
                                    self.createCommandHandlers(Callback);
                                } else {
                                    self.createBusinessExtensionsAsync(businessExtensions, Callback);
                                } //callback(self);
                            });
                            kony.print('MDA2*** Config  provides a Business controller');
                        });
                    } catch (err) {
                        throw new Exception('ERROR_CODE_300', ' Invalid Presentation Controller Class ' + err);
                    }
                }
            }
        };
        MDAModule.prototype.createBusinessExtensionsAsync = function(businessExtensions, callback) {
            var self = this;
            if (businessExtensions !== undefined) {
                var extNModule;
                try {
                    (function() {
                        return this;
                    }()['require'](businessExtensions, function() {
                        extNModule = [self.businessController].concat(Array.prototype.slice.call(arguments));
                        kony.print('MDA2**** extNModule : ' + extNModule);
                        _kony.mvc.assignFunctions2Controller(self.businessController, extNModule);
                        callback(self);
                    }));
                } catch (err) {
                    throw new Exception('ERROR_CODE_300', 'Business Controller Extension invalid ' + err);
                }
                kony.print('MDA2**** extNModule : ' + extNModule);
            } else {
                callback(self);
                kony.print('MDA2**** invalid businessExtensions: ' + businessExtensions);
            }
        };
        MDAModule.prototype.createPresentationExtensionsAsync = function(callback) {
            var self = this;
            if (this.moduleConfig !== undefined) {
                var presentationExtensions;
                if (this.channel === undefined) {
                    extChannel = 'Default';
                }
                if (this.moduleConfig.PresentationControllerConfig && this.moduleConfig.PresentationControllerConfig[this.channel]) presentationExtensions = this.moduleConfig.PresentationControllerConfig[this.channel].PresentationExtensions;
                if (presentationExtensions !== undefined) {
                    var extNModule;
                    try {
                        (function() {
                            return this;
                        }()['require'](presentationExtensions, function() {
                            extNModule = [self.presentationController].concat(Array.prototype.slice.call(arguments));
                            kony.print('MDA2**** extNModule : ' + extNModule);
                            _kony.mvc.assignFunctions2Controller(self.presentationController, extNModule);
                            callback();
                        }));
                    } catch (err) {
                        throw new Exception('ERROR_CODE_300', 'Presentation Controller Extension invalid ' + err);
                    }
                }
            }
        };
        MDAModule.prototype.setUpBusinessController = function() {
            if (this.moduleConfig === undefined) {
                this.businessController = this.createBusinessController();
                if (this.businessController === null) {
                    kony.print('MDA2*** Derived module does not provide a Business controller');
                    this.businessController = this.createDefaultBusinessController();
                }
            } else {
                var businessControllerClass;
                if (this.moduleConfig.BusinessControllerConfig) businessControllerClass = this.moduleConfig.BusinessControllerConfig.BusinessControllerClass;
                //If buisnessController class is not supplied in config file, 
                //create from derived module else default Buisness controller
                if (businessControllerClass === undefined || businessControllerClass === '') {
                    kony.print(' MDA2*** Config does not provide a Business controller');
                    this.businessController = this.createBusinessController();
                    if (this.businessController === null) {
                        kony.print('MDA2*** Derived module does not provide a Business controller');
                        this.businessController = this.createDefaultBusinessController();
                    }
                } else {
                    kony.print('MDA2*** Config  provides a Business controller');
                    try {
                        var DerivedBusinessController = require(businessControllerClass);
                        this.businessController = new DerivedBusinessController();
                    } catch (err) {
                        throw new Exception('ERROR_CODE_300', 'Invalid Business Controller Class ' + err);
                    }
                }
            }
            if (BusinessController.prototype.isPrototypeOf(this.businessController)) {
                this.createCommandHandlers();
            } else {
                this.createBusinessExtensions();
            }
        };
        MDAModule.prototype.setUpPresentationController = function() {
            if (this.moduleConfig === undefined) {
                this.presentationController = this.createPresentationController();
                if (this.presentationController === null) {
                    kony.print('MDA2*** Derived module does not provide a Presentation controller');
                    this.presentationController = this.createDefaultPresentationController();
                }
            } else {
                var presentationControllerClass;
                var currentChannel = kony.sdk.getChannelType();
                //TO DO: Platform team to generate channel correctly
                currentChannel = currentChannel.charAt(0).toUpperCase() + currentChannel.slice(1);
                if (this.channel === undefined) {
                    if (this.moduleConfig.PresentationControllerConfig) {
                        var defaultPresentation = this.moduleConfig.PresentationControllerConfig['Default'];
                        var channelPresentation = this.moduleConfig.PresentationControllerConfig[currentChannel];
                        this.channel = channelPresentation ? currentChannel : 'Default';
                        presentationControllerClass = this.moduleConfig.PresentationControllerConfig[this.channel].PresentationControllerClass;
                    } else presentationControllerClass = undefined;
                } else {
                    if (this.moduleConfig.PresentationControllerConfig && this.moduleConfig.PresentationControllerConfig[this.channel]) presentationControllerClass = this.moduleConfig.PresentationControllerConfig[this.channel].PresentationControllerClass;
                    else presentationControllerClass = undefined;
                }
                if (presentationControllerClass === undefined || presentationControllerClass === '') {
                    kony.print('MDA2*** Config does not provide a Presentation controller');
                    this.presentationController = this.createPresentationController();
                    if (this.presentationController === null) {
                        kony.print('MDA2*** Derived module does not provide a Presentation controller');
                        this.presentationController = this.createDefaultPresentationController();
                    }
                } else {
                    kony.print('MDA2*** Config  provides a Presentation controller');
                    try {
                        var DerivedPresentationController = require(presentationControllerClass);
                        this.presentationController = new DerivedPresentationController();
                    } catch (err) {
                        throw new Exception('ERROR_CODE_300', ' Invalid Presentation Controller Class ' + err);
                    }
                }
            }
            this.createPresentationExtensions();
        };
        MDAModule.prototype.setUpNavigator = function() {
            this.navigator = this.createNavigator();
            if (this.navigator === null) {
                this.navigator = this.createDefaultNavigator();
            }
        };
        MDAModule.prototype.setUpForms = function() {
            if (this.moduleConfig !== undefined) {
                var forms = this.moduleConfig.Forms;
                var channel = kony.sdk.getChannelType();
                //Call some API here
                if (forms && channel && forms[channel]) {
                    var formsList = Object.keys(forms[channel]);
                    for (var eachForm in formsList) {
                        if (kony.mvc.registry.getControllerType(eachForm) != constants.FORM_CONTROLLER_TYPE) {
                            var formNameKey = formsList[eachForm];
                            var formPath = forms[channel][formNameKey].FormName;
                            var friendlyName = forms[channel][formNameKey].friendlyName || formPath;
                            var controller = forms[channel][formNameKey].Controller;
                            var formController = forms[channel][formNameKey].FormController;
                            var controllerExtensions = forms[channel][formNameKey].ControllerExtensions;
                            var controllerExtName = [];
                            Array.prototype.push.apply(controllerExtName, controllerExtensions);
                            kony.mvc.registry.remove(friendlyName);
                            kony.mvc.registry.add(friendlyName, formPath, {
                                'controllerName': controller,
                                'controllerType': formController,
                                'controllerExtName': controllerExtName
                            });
                        }
                    }
                }
            }
        };
        MDAModule.prototype.createBusinessController = function() {
            return null;
        };
        MDAModule.prototype.createPresentationController = function() {
            return null;
        };
        MDAModule.prototype.createNavigator = function() {
            return null;
        };
        MDAModule.prototype.createDefaultNavigator = function() {
            return new MDABaseNavigator();
        };
        MDAModule.prototype.createDefaultBusinessController = function() {
            var businessController = new BusinessController();
            return businessController;
        };
        MDAModule.prototype.createDefaultPresentationController = function() {
            var presentationController = new MDABasePresenter();
            return presentationController;
        };
        MDAModule.prototype.createCommandHandlers = function(callback) {
            if (this.moduleConfig !== undefined && this.moduleConfig.BusinessControllerConfig) {
                var commandHandlers = this.moduleConfig.BusinessControllerConfig.CommandHandler;
                kony.print(commandHandlers);
                this.businessController.registerCommandHandlers(commandHandlers, callback);
                if (callback) {
                    callback();
                }
            }
        };
        MDAModule.prototype.createPresentationExtensions = function() {
            if (this.moduleConfig !== undefined) {
                var presentationExtensions;
                if (this.channel === undefined) {
                    extChannel = 'Default';
                }
                if (this.moduleConfig.PresentationControllerConfig && this.moduleConfig.PresentationControllerConfig[this.channel]) presentationExtensions = this.moduleConfig.PresentationControllerConfig[this.channel].PresentationExtensions;
                if (presentationExtensions !== undefined) {
                    var extNModule = [];
                    extNModule.push(this.presentationController);
                    for (var i = 0; i < presentationExtensions.length; i++) {
                        try {
                            extNModule.push(require(presentationExtensions[i]));
                        } catch (err) {
                            throw new Exception('ERROR_CODE_300', 'Presentation Controller Extension invalid ' + err);
                        }
                        kony.print('MDA2**** extNModule : ' + extNModule);
                    }
                    _kony.mvc.assignFunctions2Controller(this.presentationController, extNModule);
                } else {
                    kony.print('MDA2**** invalid presentationExtensions: ' + presentationExtensions);
                }
            }
        };
        MDAModule.prototype.createBusinessExtensions = function() {
            if (this.moduleConfig !== undefined) {
                var businessExtensions;
                if (this.moduleConfig.BusinessControllerConfig.BusinessExtensions) businessExtensions = this.moduleConfig.BusinessControllerConfig.BusinessExtensions;
                if (businessExtensions !== undefined) {
                    var extNModule = [];
                    extNModule.push(this.businessController);
                    for (var i = 0; i < businessExtensions.length; i++) {
                        try {
                            extNModule.push(require(businessExtensions[i]));
                        } catch (err) {
                            throw new Exception('ERROR_CODE_300', 'Business Controller Extension invalid ' + err);
                        }
                        kony.print('MDA2**** extNModule : ' + extNModule);
                    }
                    _kony.mvc.assignFunctions2Controller(this.businessController, extNModule);
                } else {
                    kony.print('MDA2**** invalid businessExtensions: ' + businessExtensions);
                }
            }
        };
        return MDAModule;
    }(PresentationController_MDABasePresenter, BaseNavigator_MDABaseNavigator, BusinessController_BusinessController, DataModel_constants, BusinessController_BusinessDelegator);
    ModuleManager_MDAModuleManager = function(MDAModule) {
        function MDAModuleManager() {
            this.moduleMap = {};
            this.initialize();
        }
        MDAModuleManager.prototype.initialize = function() {};
        MDAModuleManager.prototype.loadModule = function(moduleName, moduleMode, channel, callback) {
            if (moduleMode == null) moduleMode = 'Default';
            kony.print('MDA2***..loadModule: ' + moduleName + '-' + moduleMode + 'Mode');
            var self = this;
            if (!this.moduleMap[moduleName]) {
                var module = null;
                var moduleConfig;
                try {
                    moduleConfig = eval(this.moduleName + 'Config');
                } catch (e) {}
                if (moduleConfig !== undefined) {
                    var moduleClass = moduleConfig.ModuleClass;
                    if (moduleClass !== undefined || moduleClass !== '') {
                        var Module = require(moduleClass);
                        module = new Module(moduleName, moduleMode, channel, callback);
                        this.moduleMap[moduleName] = module;
                    } else {
                        if (callback !== undefined) {
                            new MDAModule(moduleName, moduleMode, channel, function(module) {
                                self.moduleMap[moduleName] = module;
                                callback(module);
                            });
                        } else {
                            module = new MDAModule(moduleName, moduleMode, channel, callback);
                            this.moduleMap[moduleName] = module;
                        }
                    }
                } else {
                    var self = this;
                    if (callback !== undefined) {
                        new MDAModule(moduleName, moduleMode, channel, function(module) {
                            self.moduleMap[moduleName] = module;
                            callback(module);
                        });
                    } else {
                        module = new MDAModule(moduleName, moduleMode, channel, callback);
                        this.moduleMap[moduleName] = module;
                    }
                }
            }
        };
        MDAModuleManager.prototype.getModule = function(moduleName, moduleMode, channel, callback) {
            // kony.print('Returned MDA2*** Module: ' + moduleName + '-' + this.moduleMap[moduleName].moduleMode + ' Mode Instance'); 
            if (!this.moduleMap[moduleName]) {
                this.loadModule(moduleName, moduleMode, channel, callback);
                return this.moduleMap[moduleName];
            } else {
                if (callback === undefined) {
                    return this.moduleMap[moduleName];
                } else {
                    callback(this.moduleMap[moduleName]);
                }
            }
        };
        MDAModuleManager.prototype.loadStartupModule = function(moduleName, moduleMode, channel, callback) {
            if (moduleMode == null) moduleMode = 'Default';
            kony.print('MDA2***..loadStartupModule: ' + moduleName + '-' + moduleMode + 'Mode');
            var self = this;
            var isStartup = 1;
            if (!this.moduleMap[moduleName]) {
                var module = null;
                var moduleConfig;
                try {
                    moduleConfig = eval(this.moduleName + 'Config');
                } catch (e) {}
                if (moduleConfig !== undefined) {
                    var moduleClass = moduleConfig.ModuleClass;
                    if (moduleClass !== undefined || moduleClass !== '') {
                        var Module = require(moduleClass);
                        module = new Module(moduleName, moduleMode, channel, callback, isStartup);
                        this.moduleMap[moduleName] = module;
                    } else {
                        if (callback !== undefined) {
                            new MDAModule(moduleName, moduleMode, channel, function(module) {
                                self.moduleMap[moduleName] = module;
                                callback(module);
                            }, isStartup);
                        } else {
                            module = new MDAModule(moduleName, moduleMode, channel, callback, isStartup);
                            this.moduleMap[moduleName] = module;
                        }
                    }
                } else {
                    var self = this;
                    if (callback !== undefined) {
                        new MDAModule(moduleName, moduleMode, channel, function(module) {
                            self.moduleMap[moduleName] = module;
                            callback(module);
                        }, isStartup);
                    } else {
                        module = new MDAModule(moduleName, moduleMode, channel, callback, isStartup);
                        this.moduleMap[moduleName] = module;
                    }
                }
            }
        };
        MDAModuleManager.prototype.getStartupModule = function(moduleName, moduleMode, channel, callback) {
            if (!this.moduleMap[moduleName]) {
                this.loadModule(moduleName, moduleMode, channel, callback);
                return this.moduleMap[moduleName];
            } else {
                if (callback === undefined) {
                    return this.moduleMap[moduleName];
                } else {
                    callback(this.moduleMap[moduleName]);
                }
            }
        };
        return MDAModuleManager;
    }(ModuleManager_MDAModule);
    UIBinder_UIBinder = function() {
        var includesInArray = function(array, obj) {
            if (Array.isArray(array)) {
                for (var ele in array) {
                    if (obj == array[ele]) {
                        return true;
                    }
                }
            }
            return false;
        };

        function UIBinder() {
            this.map = {};
        }
        UIBinder.prototype.registerWidgetMapper = function(widgetType, widgetDataMapper) {
            //Mapping widget with its mapper
            this.map[widgetType.toLowerCase()] = widgetDataMapper;
        };
        UIBinder.prototype.mapWidgetData = function(config, data, form, widgetId) {
            var dataModelKeys = Object.keys(data);
            var widgetDataModel = config[widgetId].entityId;
            for (var eachDataModel in dataModelKeys) {
                if (widgetDataModel == dataModelKeys[eachDataModel]) {
                    screenRefreshFlag = true;
                    var componentTag = config[widgetId].componentId;
                    var widget;
                    if (componentTag) widget = form[componentTag][widgetId];
                    else widget = form[widgetId];
                    var widgetConfig = config[widgetId];
                    widgetConfig['widgetId'] = widgetId;
                    var widgetType = widgetConfig.widgetType.toLowerCase();
                    if (widgetType in this.map) {
                        var mapper = this.map[widgetType];
                        try {
                            mapper.mapData(widgetConfig, data, widget);
                        } catch (err) {
                            kony.print('Widget Data Mapper error while mapping: ' + err);
                        }
                    } else {
                        kony.print('Widget doesn\'t exist with UIBinder ' + widgetType);
                    }
                } else {
                    kony.print('View Model ' + dataModelKeys[eachDataModel] + ' is not for widget:' + widgetId + ' with View Model:' + widgetDataModel);
                }
            }
        };
        UIBinder.prototype.mapData = function(config, data, form, groupSelect) {
            if (config && data) {
                if (config.groups) {
                    for (var groupId in config.groups) {
                        if (groupSelect) {
                            if (includesInArray(groupSelect, groupId) || groupId === groupSelect) {
                                for (var widgetid in config.groups[groupId]) {
                                    this.mapWidgetData(config.groups[groupId], data, form, widgetid);
                                }
                            }
                        } else {
                            for (var widgetid in config.groups[groupId]) {
                                this.mapWidgetData(config.groups[groupId], data, form, widgetid);
                            }
                        }
                    }
                    if (config.widgets === null || config.widgets === undefined) {
                        config.widgets = {};
                    }
                }
                if (config.widgets) {
                    for (var widgetId in config.widgets) {
                        this.mapWidgetData(config.widgets, data, form, widgetId);
                    }
                } else {
                    //Config Format Old
                    var newConfig = {};
                    //Setting the formid to formId
                    newConfig['formId'] = config['formid'];
                    delete config.formid;
                    //Getting Object Service name, online/offline, entity details
                    newConfig['objectServiceName'] = config[newConfig.formId]['objectServiceName'];
                    newConfig['objectServiceOptions'] = config[newConfig.formId]['objectServiceOptions'];
                    newConfig['entityId'] = config[newConfig.formId]['entity'];
                    delete config[newConfig.formId];
                    //Add widgets object
                    newConfig['widgets'] = {};
                    //Adding widgets to config
                    for (var widget in config) {
                        newConfig.widgets[widget] = {};
                        newConfig.widgets[widget]['widgetType'] = config[widget].fieldprops.widgettype.toLowerCase();
                        newConfig.widgets[widget]['entityId'] = config[widget].fieldprops.entity;
                        if (config[widget].fieldprops.widgettype.toLowerCase() == 'segment') {
                            newConfig.widgets[widget]['objectServiceName'] = newConfig.objectServiceName;
                            newConfig.widgets[widget]['fields'] = {};
                            for (var eachField in config[widget].fieldprops.field) {
                                newConfig.widgets[widget].fields[eachField] = {};
                                newConfig.widgets[widget].fields[eachField]['widgetType'] = config[widget].fieldprops.field[eachField].widgettype.toLowerCase();
                                newConfig.widgets[widget].fields[eachField]['fieldId'] = config[widget].fieldprops.field[eachField].field;
                            }
                        } else {
                            newConfig.widgets[widget]['fieldId'] = config[widget].fieldprops.field;
                        }
                    }
                    //Recursively calling map data
                    this.mapData(newConfig, data, form);
                }
                form.forceLayout();
            }
        };
        UIBinder.prototype.getWidgetData = function(config, formId, widgetId, dataMap) {
            var widget = formId[widgetId];
            var widgetConfig = config[widgetId];
            if (dataMap[widgetConfig.entityId] == null) dataMap[widgetConfig.entityId] = {};
            var widgetType = widgetConfig.widgetType.toLowerCase();
            if (widgetType in this.map) {
                if (widgetType !== 'segment') {
                    var mapper = this.map[widgetType];
                    dataMap[widgetConfig.entityId][widgetConfig.fieldId] = mapper.getPropertyData(widget);
                } else {
                    var mapper = this.map[widgetType];
                    dataMap[widgetConfig.entityId] = mapper.getPropertyData(widget);
                }
            }
        };
        //Get Data
        UIBinder.prototype.getData = function(config, formId, groupSelect) {
            if (config) {
                var dataMap = {};
                if (config.groups) {
                    for (var groupId in config.groups) {
                        if (groupSelect) {
                            if (includesInArray(groupSelect, groupId) || groupId === groupSelect) {
                                for (var widgetid in config.groups[groupId]) {
                                    this.getWidgetData(config.groups[groupId], formId, widgetid, dataMap);
                                }
                            }
                        } else {
                            for (var widgetid in config.groups[groupId]) {
                                this.getWidgetData(config.groups[groupId], formId, widgetid, dataMap);
                            }
                        }
                    }
                }
                if (config.widgets) {
                    for (var widgetId in config.widgets) {
                        this.getWidgetData(config.widgets, formId, widgetId, dataMap);
                    }
                }
                return dataMap;
            }
        };
        return UIBinder;
    }();

    function GenericPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    GenericPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    //Bottom Property
    function BottomPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    BottomPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    BottomPropertyMapper.prototype.propertyHandler = function() {};
    //CenterX Property
    function CenterXPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    CenterXPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    CenterXPropertyMapper.prototype.propertyHandler = function() {};
    //CenterY Property
    function CenterYPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    CenterYPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    CenterYPropertyMapper.prototype.propertyHandler = function() {};
    //Height Property
    function HeightPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    HeightPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    HeightPropertyMapper.prototype.propertyHandler = function() {};
    //Is Visible Property
    function IsVisiblePropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    IsVisiblePropertyMapper.prototype.mapProperty = function(data, widget) {
        if (data == 'true') data = true;
        else if (data == 'false') data = false;
        var property = this.map.propName;
        widget[property] = data;
    };
    IsVisiblePropertyMapper.prototype.propertyHandler = function() {};
    //Skin Property
    function SkinPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    SkinPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    SkinPropertyMapper.prototype.propertyHandler = function() {};
    //Top Property
    function TopPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    TopPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    TopPropertyMapper.prototype.propertyHandler = function() {};
    //Width Property
    function WidthPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    WidthPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    WidthPropertyMapper.prototype.propertyHandler = function() {};
    //Left Property
    function LeftPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    LeftPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    LeftPropertyMapper.prototype.propertyHandler = function() {};
    //Background Color
    function BackgroundColorPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    BackgroundColorPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    BackgroundColorPropertyMapper.prototype.propertyHandler = function() {};
    //Right Property
    function RightPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    RightPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    RightPropertyMapper.prototype.propertyHandler = function() {};
    //MaxWidth Property
    function MaxWidthPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    MaxWidthPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    MaxWidthPropertyMapper.prototype.propertyHandler = function() {};
    //MinWidth Property
    function MinWidthPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    MinWidthPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    MinWidthPropertyMapper.prototype.propertyHandler = function() {};
    //MaxHeight Property
    function MaxHeightPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    MaxHeightPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    MaxHeightPropertyMapper.prototype.propertyHandler = function() {};
    //MinHeight Property
    function MinHeightPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    MinHeightPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    MinHeightPropertyMapper.prototype.propertyHandler = function() {};
    //ZIndex Property
    function ZIndexPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    ZIndexPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    ZIndexPropertyMapper.prototype.propertyHandler = function() {};
    UIBinder_PropertyDataMapper_GenericProperties = undefined;
    UIBinder_WidgetDataMapper_WidgetDataMapper = function() {
        function WidgetDataMapper(widgetType) {
            this.propertyMap = {
                'width': new WidthPropertyMapper('width'),
                'height': new HeightPropertyMapper('height'),
                'isvisible': new IsVisiblePropertyMapper('isVisible'),
                'top': new TopPropertyMapper('top'),
                'bottom': new BottomPropertyMapper('bottom'),
                'centerx': new CenterXPropertyMapper('centerX'),
                'centery': new CenterYPropertyMapper('centerY'),
                'skin': new SkinPropertyMapper('skin'),
                'left': new LeftPropertyMapper('left'),
                'backgroundcolor': new BackgroundColorPropertyMapper('backgroundColor'),
                'right': new RightPropertyMapper('right'),
                'maxwidth': new MaxWidthPropertyMapper('maxWidth'),
                'minwidth': new MinWidthPropertyMapper('minWidth'),
                'maxheight': new MaxHeightPropertyMapper('maxHeiht'),
                'minheight': new MinHeightPropertyMapper('minHeight'),
                'zindex': new ZIndexPropertyMapper('zIndex')
            };
            this.widgetType = widgetType;
        }
        //Register property mapper or base property mapper
        WidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            this.propertyMap[propertyType.toLowerCase()] = propertyMapper;
        };
        WidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            if (widgetConfig.propertyMapper) {
                kony.print('Mapping properties with widgets');
                var properties = Object.keys(widgetConfig.propertyMapper);
                for (var property in properties) {
                    //alert(properties[property].toLowerCase());
                    var mapper = this.propertyMap[properties[property].toLowerCase()];
                    try {
                        if (widgetConfig.scope.toLowerCase() == 'context') {} else {
                            var dataKey = data[widgetConfig.entityId][widgetConfig.fieldId];
                            var keyVal = widgetConfig.propertyMapper[properties[property]].split('.');
                            var key = keyVal[keyVal.length - 1];
                            var dataVal = dataKey[key];
                            try {
                                mapper.mapProperty(dataVal, widget);
                            } catch (err) {
                                kony.print('MapData function error while mapping property ' + err);
                            }
                        }
                    } catch (err) {
                        kony.print('Error in data format : MapData WidgetDataMapper ' + err);
                    }
                }
            } else {
                //If no property map exists
                //Backward compatibility
                kony.print('Mapping default properties with widgets');
                var defaultMapper = this.propertyMap['default'];
                if (typeof data[widgetConfig.entityId][widgetConfig.fieldId] == 'object') {
                    type = defaultMapper.map.propName;
                    try {
                        defaultMapper.mapProperty(data[widgetConfig.entityId][widgetConfig.fieldId][type], widget);
                    } catch (err) {
                        kony.print('Error while Mapping default property with widget ' + err);
                    }
                } else {
                    try {
                        defaultMapper.mapProperty(data[widgetConfig.entityId][widgetConfig.fieldId], widget);
                    } catch (err) {
                        kony.print('Error while Mapping default property with widget ' + err);
                    }
                }
            }
        };
        WidgetDataMapper.prototype.getPropertyData = function(widget) {
            var txtMapper = this.propertyMap['text'];
            var data = txtMapper.getPropertyValue(widget);
            return data;
        };
        return WidgetDataMapper;
    }();
    commonUtils_inheritsFrom = function() {
        var inheritsFrom = function(child, parent) {
            child.prototype = Object.create(parent.prototype);
            child.prototype.constructor = child;
        };
        return inheritsFrom;
    }();

    function SourcePropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    SourcePropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    SourcePropertyMapper.prototype.propertyHandler = function() {};
    SourcePropertyMapper.prototype.getPropertyValue = function(widget) {
        var srcVal = widget[this.map['propName']];
        return srcVal;
    };
    //BASE64 PROPERTY
    function Base64PropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    Base64PropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    Base64PropertyMapper.prototype.propertyHandler = function() {};
    //IMAGE WHEN FAIL PROPERTY
    function ImageWhenFailedPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    ImageWhenFailedPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    ImageWhenFailedPropertyMapper.prototype.propertyHandler = function() {};
    //IMAGE WHILE DOWNLOAD PROPERTY
    function ImageWhileDownloadPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    ImageWhileDownloadPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    ImageWhileDownloadPropertyMapper.prototype.propertyHandler = function() {};
    UIBinder_PropertyDataMapper_ImageProperties = undefined;
    UIBinder_WidgetDataMapper_ImageWidgetDataMapper = function(WidgetDataMapper, inheritsFrom) {
        //Image
        function ImageWidgetDataMapper(widgetType) {
            WidgetDataMapper.call(this, widgetType);
            this.registerPropertyMapper('default', new SourcePropertyMapper('src'));
        }
        inheritsFrom(ImageWidgetDataMapper, WidgetDataMapper);
        ImageWidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            WidgetDataMapper.prototype.registerPropertyMapper.call(this, propertyType, propertyMapper);
        };
        ImageWidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            WidgetDataMapper.prototype.mapData.call(this, widgetConfig, data, widget);
        };
        ImageWidgetDataMapper.prototype.getPropertyData = function(widget) {
            var srcMapper = this.propertyMap['source'];
            var data = srcMapper.getPropertyValue(widget);
            return data;
        };
        return ImageWidgetDataMapper;
    }(UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom);

    function PlaceholderPropertyMappper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    PlaceholderPropertyMappper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    PlaceholderPropertyMappper.prototype.propertyHandler = function() {};

    function PlaceholderSkinPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    PlaceholderSkinPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    PlaceholderSkinPropertyMapper.prototype.propertyHandler = function() {};

    function TextPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    TextPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    TextPropertyMapper.prototype.propertyHandler = function() {};
    TextPropertyMapper.prototype.getPropertyValue = function(widget) {
        var textValue = widget[this.map['propName']];
        return textValue;
    };

    function MaxTextLengthPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    MaxTextLengthPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = parseInt(data);
    };
    MaxTextLengthPropertyMapper.prototype.propertyHandler = function() {};
    UIBinder_PropertyDataMapper_TextboxProperties = undefined;
    UIBinder_WidgetDataMapper_TextboxWidgetDataMapper = function(WidgetDataMapper, inheritsFrom) {
        //TextBox
        function TextboxWidgetDataMapper(widgetType) {
            WidgetDataMapper.call(this, widgetType.toLowerCase());
            inheritsFrom(TextboxWidgetDataMapper, WidgetDataMapper);
            this.registerPropertyMapper('default', new TextPropertyMapper('text'));
        }
        TextboxWidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            WidgetDataMapper.prototype.registerPropertyMapper.call(this, propertyType, propertyMapper);
        };
        TextboxWidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            WidgetDataMapper.prototype.mapData.call(this, widgetConfig, data, widget);
        };
        TextboxWidgetDataMapper.prototype.getPropertyData = function(widget) {
            WidgetDataMapper.prototype.getPropertyData.call(this, widget);
        };
        return TextboxWidgetDataMapper;
    }(UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom);

    function TextPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    TextPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    TextPropertyMapper.prototype.propertyHandler = function() {};
    TextPropertyMapper.prototype.getPropertyValue = function(widget) {
        var textValue = widget[this.map['propName']];
        return textValue;
    };

    function TextStylePropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    TextStylePropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    TextStylePropertyMapper.prototype.propertyHandler = function() {};

    function TextCopyablePropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    TextCopyablePropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        if (data == 'true') widget[property] = true;
        else if (data == 'false') widget[property] = false;
    };
    TextCopyablePropertyMapper.prototype.propertyHandler = function() {};

    function WrappingPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    WrappingPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    WrappingPropertyMapper.prototype.propertyHandler = function() {};
    UIBinder_PropertyDataMapper_LabelProperties = undefined;
    UIBinder_WidgetDataMapper_LabelWidgetDataMapper = function(WidgetDataMapper, inheritsFrom) {
        //Label
        function LabelWidgetDataMapper(widgetType) {
            WidgetDataMapper.call(this, widgetType);
            inheritsFrom(LabelWidgetDataMapper, WidgetDataMapper);
            this.registerPropertyMapper('default', new TextPropertyMapper('text'));
        }
        LabelWidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            WidgetDataMapper.prototype.registerPropertyMapper.call(this, propertyType, propertyMapper);
        };
        LabelWidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            WidgetDataMapper.prototype.mapData.call(this, widgetConfig, data, widget);
        };
        LabelWidgetDataMapper.prototype.getPropertyData = function(widget) {
            WidgetDataMapper.prototype.getPropertyData.call(this, widget);
        };
        return LabelWidgetDataMapper;
    }(UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom);
    //shadowtype, showclosebutton, showprogressindicator, textInputMode, toolTip, wrapText
    function ShadowTypePropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    ShadowTypePropertyMapper.prototype.propertyHandler = function() {};
    ShadowTypePropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = parseInt(data);
    };

    function ShowCloseButtonPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    ShowCloseButtonPropertyMapper.prototype.propertyHandler = function() {};
    ShowCloseButtonPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };

    function ShowProgressIndicatorPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    ShowProgressIndicatorPropertyMapper.prototype.propertyHandler = function() {};
    ShowProgressIndicatorPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };

    function TextInputModePropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    TextInputModePropertyMapper.prototype.propertyHandler = function() {};
    TextInputModePropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = parseInt(data);
    };

    function ToolTipPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    ToolTipPropertyMapper.prototype.propertyHandler = function() {};
    ToolTipPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };

    function WrapTextPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    WrapTextPropertyMapper.prototype.propertyHandler = function() {};
    WrapTextPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };

    function PlaceholderPropertyMappper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    PlaceholderPropertyMappper.prototype.propertyHandler = function() {};
    PlaceholderPropertyMappper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };

    function TextPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    TextPropertyMapper.prototype.propertyHandler = function() {};
    TextPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };
    TextPropertyMapper.prototype.getPropertyValue = function(widget) {
        var textValue = widget[this.map['propName']];
        return textValue;
    };
    UIBinder_PropertyDataMapper_TextAreaProperties = undefined;
    UIBinder_WidgetDataMapper_TextAreaWidgetDataMapper = function(WidgetDataMapper, inheritsFrom) {
        //Textarea
        function TextAreaWidgetDataMapper(widgetType) {
            WidgetDataMapper.call(this, widgetType.toLowerCase());
            inheritsFrom(TextAreaWidgetDataMapper, WidgetDataMapper);
            this.registerPropertyMapper('default', new TextPropertyMapper('text'));
        }
        TextAreaWidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            WidgetDataMapper.prototype.registerPropertyMapper.call(this, propertyType, propertyMapper);
        };
        TextAreaWidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            WidgetDataMapper.prototype.mapData.call(this, widgetConfig, data, widget);
        };
        TextAreaWidgetDataMapper.prototype.getPropertyData = function(widget) {
            WidgetDataMapper.prototype.getPropertyData.call(this, widget);
        };
        return TextAreaWidgetDataMapper;
    }(UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom);

    function SelectedIndexPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    SelectedIndexPropertyMapper.prototype.mapProperty = function(data, widget) {
        data = parseInt(data);
        var property = this.map.propName;
        widget[property] = data;
    };
    SelectedIndexPropertyMapper.prototype.propertyHandler = function() {};
    SelectedIndexPropertyMapper.prototype.getPropertyValue = function(widget) {
        var textValue = widget[this.map['propName']];
        return textValue.toString();
    };

    function OpacityPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    OpacityPropertyMapper.prototype.propertyHandler = function() {};
    OpacityPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };
    UIBinder_PropertyDataMapper_SwitchProperties = undefined;
    UIBinder_WidgetDataMapper_SwitchWidgetDataMapper = function(WidgetDataMapper, inheritsFrom) {
        //Switch
        function SwitchWidgetDataMapper(widgetType) {
            WidgetDataMapper.call(this, widgetType.toLowerCase());
            inheritsFrom(SwitchWidgetDataMapper, WidgetDataMapper);
            this.registerPropertyMapper('default', SelectedIndexPropertyMapper('selectedIndex'));
        }
        SwitchWidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            WidgetDataMapper.prototype.registerPropertyMapper.call(this, propertyType, propertyMapper);
        };
        SwitchWidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            WidgetDataMapper.prototype.mapData.call(this, widgetConfig, data, widget);
        };
        SwitchWidgetDataMapper.prototype.getPropertyData = function(widget) {
            var switchMapper = this.propertyMap['selectedindex'];
            var data = switchMapper.getPropertyValue(widget);
            return data;
        };
        return SwitchWidgetDataMapper;
    }(UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom);

    function SelectedValuePropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    SelectedValuePropertyMapper.prototype.mapProperty = function(data, widget) {
        data = parseInt(data);
        var property = this.map.propName;
        widget[property] = data;
    };
    SelectedValuePropertyMapper.prototype.propertyHandler = function() {};
    SelectedValuePropertyMapper.prototype.getPropertyValue = function(widget) {
        var value = widget[this.map['propName']];
        return value.toString();
    };

    function ThicknessPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    ThicknessPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    ThicknessPropertyMapper.prototype.propertyHandler = function() {};

    function MinWidthPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    MinWidthPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = parseInt(data);
    };
    MinWidthPropertyMapper.prototype.propertyHandler = function() {};

    function MaxWidthPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    MaxWidthPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = parseInt(data);
    };
    MaxWidthPropertyMapper.prototype.propertyHandler = function() {};
    UIBinder_PropertyDataMapper_SliderProperties = undefined;
    UIBinder_WidgetDataMapper_SliderWidgetDataMapper = function(WidgetDataMapper, inheritsFrom) {
        //Slider
        function SliderWidgetDataMapper(widgetType) {
            WidgetDataMapper.call(this, widgetType.toLowerCase());
            inheritsFrom(SliderWidgetDataMapper, WidgetDataMapper);
            this.registerPropertyMapper('default', SelectedValuePropertyMapper('selectedValue'));
        }
        SliderWidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            WidgetDataMapper.prototype.registerPropertyMapper.call(this, propertyType, propertyMapper);
        };
        SliderWidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            WidgetDataMapper.prototype.mapData.call(this, widgetConfig, data, widget);
        };
        SliderWidgetDataMapper.prototype.getPropertyData = function(widget) {
            var sliderMapper = this.propertyMap['selectedvalue'];
            var data = sliderMapper.getPropertyValue(widget);
            return data;
        };
        return SliderWidgetDataMapper;
    }(UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom);

    function TextPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    TextPropertyMapper.prototype.propertyHandler = function() {};
    TextPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };
    TextPropertyMapper.prototype.getPropertyValue = function(widget) {
        var textValue = widget[this.map['propName']];
        return textValue;
    };

    function OpacityPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    OpacityPropertyMapper.prototype.propertyHandler = function() {};
    OpacityPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = parseInt(data);
    };
    UIBinder_PropertyDataMapper_RichTextProperties = undefined;
    UIBinder_WidgetDataMapper_RichTextWidgetDataMapper = function(WidgetDataMapper, inheritsFrom) {
        //RichText
        function RichTextWidgetDataMapper(widgetType) {
            WidgetDataMapper.call(this, widgetType.toLowerCase());
            inheritsFrom(RichTextWidgetDataMapper, WidgetDataMapper);
            this.registerPropertyMapper('default', new TextPropertyMapper('text'));
        }
        RichTextWidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            WidgetDataMapper.prototype.registerPropertyMapper.call(this, propertyType, propertyMapper);
        };
        RichTextWidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            WidgetDataMapper.prototype.mapData.call(this, widgetConfig, data, widget);
        };
        RichTextWidgetDataMapper.prototype.getPropertyData = function(widget) {
            WidgetDataMapper.prototype.getPropertyData.call(this, widget);
        };
        return RichTextWidgetDataMapper;
    }(UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom);
    //TEXT PROPERTY MAPPER
    function TextPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    TextPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    TextPropertyMapper.prototype.propertyHandler = function() {};
    TextPropertyMapper.prototype.getPropertyValue = function(widget) {
        var textValue = widget[this.map['propName']];
        return textValue;
    };
    UIBinder_PropertyDataMapper_ButtonProperties = undefined;
    UIBinder_WidgetDataMapper_ButtonWidgetDataMapper = function(WidgetDataMapper, inheritsFrom) {
        //Button
        function ButtonWidgetDataMapper(widgetType) {
            WidgetDataMapper.call(this, widgetType.toLowerCase());
            inheritsFrom(ButtonWidgetDataMapper, WidgetDataMapper);
            this.registerPropertyMapper('default', new TextPropertyMapper('text'));
        }
        ButtonWidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            WidgetDataMapper.prototype.registerPropertyMapper.call(this, propertyType, propertyMapper);
        };
        ButtonWidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            WidgetDataMapper.prototype.mapData.call(this, widgetConfig, data, widget);
        };
        ButtonWidgetDataMapper.prototype.getPropertyData = function(widget) {
            WidgetDataMapper.prototype.getPropertyData.call(this, widget);
        };
        return ButtonWidgetDataMapper;
    }(UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom);
    UIBinder_WidgetDataMapper_SegmentWidgetDataMapper = function(WidgetDataMapper, inheritsFrom) {
        //SEGMENT
        function SegmentWidgetDataMapper(widgetType) {
            WidgetDataMapper.call(this, widgetType);
            inheritsFrom(SegmentWidgetDataMapper, WidgetDataMapper);
        }
        SegmentWidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            WidgetDataMapper.prototype.registerPropertyMapper.call(this, propertyType, propertyMapper);
        };
        SegmentWidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            //CONSTRUCT SEGMENT WIDGET DATA MAP
            var widgetDataMap = {};
            var segmentFields = [];
            var entity = widgetConfig.entityId;
            var field = widgetConfig.fieldId;
            for (var fieldWidget in widgetConfig.fields) {
                var widgetField = widgetConfig.fields[fieldWidget].fieldId;
                widgetDataMap[fieldWidget] = widgetField;
                segmentFields.push(widgetField);
            }
            widget.widgetDataMap = widgetDataMap;
            //construct array of json to pass to segment.addAll();
            // var dataArr=[];
            // for(var eachRecord in data[entity][field] ){
            //     var recordMap={};
            //     for(var eachField in segmentFields){
            //         if(data[entity][field][eachRecord][segmentFields[eachField]] !== null){
            //             if(typeof data[entity][field][eachRecord][segmentFields[eachField]]==="object"){
            //                 //data in field->JSON format
            //                 recordMap[segmentFields[eachField]]=data[entity][field][eachRecord][segmentFields[eachField]].text;
            //             }
            //             else{
            //                 //normal data format
            //                 recordMap[segmentFields[eachField]]=data[entity][field][eachRecord][segmentFields[eachField]];
            //             }
            //         }
            //         //SET other properties for the widget fields
            //     }
            //     dataArr.push(recordMap);
            // }
            widget.removeAll();
            widget.addAll(data[entity][field]);
        };
        SegmentWidgetDataMapper.prototype.getPropertyData = function(widget) {
            return widget.data;
        };
        return SegmentWidgetDataMapper;
    }(UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom);

    function ShadowTypePropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    ShadowTypePropertyMapper.prototype.propertyHandler = function() {};
    ShadowTypePropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = parseInt(data);
    };

    function ShadowDepthPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    ShadowDepthPropertyMapper.prototype.propertyHandler = function() {};
    ShadowDepthPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = parseInt(data);
    };

    function TickedImagePropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    TickedImagePropertyMapper.prototype.propertyHandler = function() {};
    TickedImagePropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };

    function HoverSkinPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    HoverSkinPropertyMapper.prototype.propertyHandler = function() {};
    HoverSkinPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };

    function MasterDataPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    MasterDataPropertyMapper.prototype.propertyHandler = function() {};
    MasterDataPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };
    MasterDataPropertyMapper.prototype.getPropertyValue = function(widget) {
        var data = [];
        for (var item in widget[this.map['propName']]) {
            data.push(item);
        }
        return data;
    };

    function SelectedKeyPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    SelectedKeyPropertyMapper.prototype.propertyHandler = function() {};
    SelectedKeyPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };
    SelectedKeyPropertyMapper.prototype.getPropertyValue = function(widget) {
        return widget[this.map['propName']];
    };

    function SelectedKeysPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    SelectedKeysPropertyMapper.prototype.propertyHandler = function() {};
    SelectedKeysPropertyMapper.prototype.mapProperty = function(data, widget) {
        //sets string as data
        var property = this.map.propName;
        widget[property] = data;
    };
    SelectedKeysPropertyMapper.prototype.getPropertyValue = function(widget) {
        return widget[this.map['propName']];
    };
    UIBinder_PropertyDataMapper_ListboxProperties = undefined;
    UIBinder_WidgetDataMapper_ListboxWidgetDataMapper = function(WidgetDataMapper, inheritsFrom) {
        //Listbox
        function ListboxWidgetDataMapper(widgetType) {
            WidgetDataMapper.call(this, widgetType.toLowerCase());
            inheritsFrom(ListboxWidgetDataMapper, WidgetDataMapper);
            this.registerPropertyMapper('default', SelectedKeyPropertyMapper('selectedKey'));
        }
        ListboxWidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            WidgetDataMapper.prototype.registerPropertyMapper.call(this, propertyType, propertyMapper);
        };
        ListboxWidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            WidgetDataMapper.prototype.mapData.call(this, widgetConfig, data, widget);
        };
        ListboxWidgetDataMapper.prototype.getPropertyData = function(widget) {
            var listboxMapper = this.propertyMap['selectedkey'];
            var data = listboxMapper.getPropertyValue(widget);
            return data;
        };
        return ListboxWidgetDataMapper;
    }(UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom);
    UIBinder_WidgetDataMapper_FlexContainerWidgetDataMapper = function(WidgetDataMapper, inheritsFrom) {
        //Button
        function FlexContainerWidgetDataMapper(widgetType) {
            WidgetDataMapper.call(this, widgetType.toLowerCase());
            inheritsFrom(FlexContainerWidgetDataMapper, WidgetDataMapper);
            this.registerPropertyMapper('default', null);
        }
        FlexContainerWidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            WidgetDataMapper.prototype.registerPropertyMapper.call(this, propertyType, propertyMapper);
        };
        FlexContainerWidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            WidgetDataMapper.prototype.mapData.call(this, widgetConfig, data, widget);
        };
        FlexContainerWidgetDataMapper.prototype.getPropertyData = function(widget) {
            WidgetDataMapper.prototype.getPropertyData.call(this, widget);
        };
        return FlexContainerWidgetDataMapper;
    }(UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom);
    //DATE COMPONENT PROPERTY
    function DateComponentsPropertyMapper(property) {
        this.map = {};
        this.map['propName'] = property;
    }
    DateComponentsPropertyMapper.prototype.mapProperty = function(data, widget) {
        var property = this.map.propName;
        widget[property] = data;
    };
    DateComponentsPropertyMapper.prototype.propertyHandler = function() {};
    DateComponentsPropertyMapper.prototype.getPropertyValue = function(widget) {
        var datecompValue = widget[this.map['propName']];
        return datecompValue;
    };
    UIBinder_PropertyDataMapper_CalendarProperties = undefined;
    UIBinder_WidgetDataMapper_CalendarWidgetDataMapper = function(WidgetDataMapper, inheritsFrom) {
        //CALENDAR
        function CalendarWidgetDataMapper(widgetType) {
            WidgetDataMapper.call(this, widgetType.toLowerCase());
            inheritsFrom(CalendarWidgetDataMapper, WidgetDataMapper);
            this.registerPropertyMapper('default', new DateComponentsPropertyMapper('dateComponents'));
        }
        CalendarWidgetDataMapper.prototype.registerPropertyMapper = function(propertyType, propertyMapper) {
            WidgetDataMapper.prototype.registerPropertyMapper.call(this, propertyType, propertyMapper);
        };
        CalendarWidgetDataMapper.prototype.mapData = function(widgetConfig, data, widget) {
            WidgetDataMapper.prototype.mapData.call(this, widgetConfig, data, widget);
        };
        CalendarWidgetDataMapper.prototype.getPropertyData = function(widget) {
            var datecompMapper = this.propertyMap['dateComponents'];
            var data = datecompMapper.getPropertyValue(widget);
            return data;
        };
        return CalendarWidgetDataMapper;
    }(UIBinder_WidgetDataMapper_WidgetDataMapper, commonUtils_inheritsFrom);
    UIBinder_UIBinderBuilder = function(UIBinder, WidgetDataMapper, ImageWidgetDataMapper, TextboxWidgetDataMapper, LabelWidgetDataMapper, TextAreaWidgetDataMapper, SwitchWidgetDataMapper, SliderWidgetDataMapper, RichTextWidgetDataMapper, ButtonWidgetDataMapper, SegmentWidgetDataMapper, ListboxWidgetDataMapper, FlexContainerWidgetDataMapper, CalendarWidgetDataMapper) {
        var binderInstance = null;
        UIBinderBuilder = function() {
            this.initialize();
        };
        UIBinderBuilder.prototype.initialize = function() {
            if (binderInstance === null) {
                binderInstance = new UIBinder();
            }
            this.register();
        };
        UIBinderBuilder.prototype.register = function() {
            var imageMapper = new ImageWidgetDataMapper('image');
            var textBoxMapper = new TextboxWidgetDataMapper('textbox');
            var labelMapper = new LabelWidgetDataMapper('label');
            var textAreaMapper = new TextAreaWidgetDataMapper('textarea');
            var switchMapper = new SwitchWidgetDataMapper('switch');
            var sliderMapper = new SliderWidgetDataMapper('slider');
            var richTextMapper = new RichTextWidgetDataMapper('richtext');
            var buttonMapper = new ButtonWidgetDataMapper('button');
            var segmentMapper = new SegmentWidgetDataMapper('segment');
            var listBoxMapper = new ListboxWidgetDataMapper('listbox');
            var flexContainerMapper = new FlexContainerWidgetDataMapper('flexcontainer');
            var calendarMapper = new CalendarWidgetDataMapper('calendar');
            //Registering properties
            imageMapper.registerPropertyMapper('src', new SourcePropertyMapper('src'));
            imageMapper.registerPropertyMapper('base64', new Base64PropertyMapper('base64'));
            textBoxMapper.registerPropertyMapper('placeholder', new PlaceholderPropertyMappper('placeholder'));
            textBoxMapper.registerPropertyMapper('text', new TextPropertyMapper('text'));
            textBoxMapper.registerPropertyMapper('maxtextlength', new MaxTextLengthPropertyMapper('maxTextLength'));
            labelMapper.registerPropertyMapper('text', new TextPropertyMapper('text'));
            labelMapper.registerPropertyMapper('textstyle', new TextStylePropertyMapper('textStyle'));
            labelMapper.registerPropertyMapper('textcopyable', new TextCopyablePropertyMapper('textCopyable'));
            textAreaMapper.registerPropertyMapper('text', new TextPropertyMapper('text'));
            textAreaMapper.registerPropertyMapper('shadowtype', new ShadowTypePropertyMapper('shadowType'));
            textAreaMapper.registerPropertyMapper('textinputmode', new TextInputModePropertyMapper('textInputMode'));
            textAreaMapper.registerPropertyMapper('tooltip', new ToolTipPropertyMapper('toolTip'));
            textAreaMapper.registerPropertyMapper('placeholder', new PlaceholderPropertyMappper('placeholder'));
            switchMapper.registerPropertyMapper('selectedindex', new SelectedIndexPropertyMapper('selectedIndex'));
            sliderMapper.registerPropertyMapper('selectedvalue', new SelectedValuePropertyMapper('selectedValue'));
            sliderMapper.registerPropertyMapper('minwidth', new MinWidthPropertyMapper('minWidth'));
            sliderMapper.registerPropertyMapper('maxWidth', new MaxWidthPropertyMapper('maxWidth'));
            richTextMapper.registerPropertyMapper('text', new TextPropertyMapper('text'));
            richTextMapper.registerPropertyMapper('opacity', new OpacityPropertyMapper('opacity'));
            buttonMapper.registerPropertyMapper('text', new TextPropertyMapper('text'));
            listBoxMapper.registerPropertyMapper('shadowtype', new ShadowTypePropertyMapper('shadowType'));
            listBoxMapper.registerPropertyMapper('shadowdepth', new ShadowDepthPropertyMapper('shadowDepth'));
            listBoxMapper.registerPropertyMapper('hoverskin', new HoverSkinPropertyMapper('hoverSkin'));
            listBoxMapper.registerPropertyMapper('masterdata', new MasterDataPropertyMapper('masterData'));
            listBoxMapper.registerPropertyMapper('selectedkey', new SelectedKeyPropertyMapper('selectedKey'));
            listBoxMapper.registerPropertyMapper('selectedkeys', new SelectedKeysPropertyMapper('selectedKeys'));
            calendarMapper.registerPropertyMapper('datecomponents', new DateComponentsPropertyMapper('dateComponents'));
            //Registering Widgets
            binderInstance.registerWidgetMapper('image', imageMapper);
            binderInstance.registerWidgetMapper('textbox', textBoxMapper);
            binderInstance.registerWidgetMapper('label', labelMapper);
            binderInstance.registerWidgetMapper('textarea', textAreaMapper);
            binderInstance.registerWidgetMapper('switch', switchMapper);
            binderInstance.registerWidgetMapper('slider', sliderMapper);
            binderInstance.registerWidgetMapper('richtext', richTextMapper);
            binderInstance.registerWidgetMapper('button', buttonMapper);
            binderInstance.registerWidgetMapper('segment', segmentMapper);
            binderInstance.registerWidgetMapper('listbox', listBoxMapper);
            binderInstance.registerWidgetMapper('flexcontainer', flexContainerMapper);
            binderInstance.registerWidgetMapper('calendar', calendarMapper);
        };
        UIBinderBuilder.prototype.getBinder = function() {
            return binderInstance;
        };
        return UIBinderBuilder;
    }(UIBinder_UIBinder, UIBinder_WidgetDataMapper_WidgetDataMapper, UIBinder_WidgetDataMapper_ImageWidgetDataMapper, UIBinder_WidgetDataMapper_TextboxWidgetDataMapper, UIBinder_WidgetDataMapper_LabelWidgetDataMapper, UIBinder_WidgetDataMapper_TextAreaWidgetDataMapper, UIBinder_WidgetDataMapper_SwitchWidgetDataMapper, UIBinder_WidgetDataMapper_SliderWidgetDataMapper, UIBinder_WidgetDataMapper_RichTextWidgetDataMapper, UIBinder_WidgetDataMapper_ButtonWidgetDataMapper, UIBinder_WidgetDataMapper_SegmentWidgetDataMapper, UIBinder_WidgetDataMapper_ListboxWidgetDataMapper, UIBinder_WidgetDataMapper_FlexContainerWidgetDataMapper, UIBinder_WidgetDataMapper_CalendarWidgetDataMapper);
    commonUtils_MDAApplication = function(RepositoryManager, MDAModuleManager, UIBinderBuilder) {
        var appInstance = null;

        function MDAApplication() {
            if (appInstance !== null) {
                throw new Error(' Cannot instantiate more than one MDAApplication, use MDAApplication.getSharedInstance()');
            }
            this.initialize();
        }
        MDAApplication.prototype = {
            initialize: function() {
                this.repositoryManager = new RepositoryManager();
                this.moduleManager = new MDAModuleManager();
                this.UIBinder = new UIBinderBuilder().getBinder();
                this.appContext = {};
                this.accessMode = {
                    'access': 'online'
                };
                this.oDataQueryFlag = false;
                var scope = this;
                this.modelStore = {
                    getModelDefinition: function(modelName) {
                        var modelConfig = scope.repositoryManager.repoConfig[modelName];
                        var modelPath = modelConfig['model'];
                        var model = require(modelPath);
                        return model;
                    },
                    getConfig: function(modelName) {
                        var modelConfig = scope.repositoryManager.repoConfig[modelName];
                        var configPath = modelConfig['config'];
                        var config = require(configPath);
                        return config;
                    }
                };
            }
        };
        MDAApplication.getSharedInstance = function() {
            if (appInstance === null) {
                appInstance = new MDAApplication();
            }
            return appInstance;
        };
        MDAApplication.prototype.getRepoManager = function() {
            return this.repositoryManager;
        };
        MDAApplication.prototype.setRepoManager = function(repoManagerInstance) {
            this.repositoryManager = repoManagerInstance;
        };
        MDAApplication.prototype.getModuleManager = function() {
            return this.moduleManager;
        };
        MDAApplication.prototype.setModuleManager = function(moduleManagerInstance) {
            this.moduleManager = moduleManagerInstance;
        };
        MDAApplication.prototype.getUIBinder = function() {
            return this.UIBinder;
        };
        MDAApplication.prototype.setUIBinder = function(uiBinderInstance) {
            this.UIBinder = uiBinderInstance;
        };
        MDAApplication.prototype.setAppMode = function(appMode) {
            this.accessMode['access'] = appMode;
        };
        MDAApplication.prototype.getAppMode = function() {
            return this.accessMode;
        };
        MDAApplication.prototype.getODataStatus = function() {
            return this.oDataQueryFlag;
        };
        MDAApplication.prototype.setOdataStatus = function(flag) {
            this.oDataQueryFlag = flag;
        };
        return MDAApplication;
    }(DataModel_RepositoryManager, ModuleManager_MDAModuleManager, UIBinder_UIBinderBuilder);
    commonUtils_Logger = function() {
        function Logger() {}
        Logger.logExecutionTimes = function(targetObject, targetMethod, args) {
            function callbackTimeStamping(callback) {
                return function() {
                    var startTime = Date.now();
                    kony.print('MDA PERF :: Start Time executing callback ' + callback.name + '() : ' + startTime);
                    callback.apply(null, arguments);
                    var endTime = Date.now();
                    kony.print('MDA PERF :: End Time executing callback ' + callback.name + '() : ' + endTime);
                    kony.print('MDA PERF :: Total time executing callback ' + callback.name + '() : ' + (endTime - startTime) + 'ms');
                };
            }
            var argArr = [];
            for (var i = 0; i < args.length; i++) {
                if (typeof args[i] === 'function') {
                    argArr.push(callbackTimeStamping(args[i]));
                } else if (args[i] instanceof kony.mvc.Business.Command) {
                    var target = {};
                    for (var key in args[i]) {
                        if (args[i].hasOwnProperty(key)) {
                            target[key] = args[i][key];
                        }
                    }
                    target.completionCallback = callbackTimeStamping(args[i].completionCallback);
                    argArr.push(target);
                } else {
                    argArr.push(args[i]);
                }
            }
            var targetFunction = null;
            var _targetObject = targetObject == null ? this : targetObject;
            var targetFunctionName = '';
            if (typeof targetMethod === 'function') {
                targetFunction = targetMethod;
                targetFunctionName = targetFunction.name;
            } else if (typeof targetMethod === 'string') {
                targetFunction = _targetObject[targetMethod];
                targetFunctionName = targetMethod;
            }
            if (targetFunctionName == null || targetFunctionName.trim() === '') {
                targetFunctionName = '<anonymous>';
            }
            var startTimeLogPrefix = 'MDA PERF :: Start Time executing ' + _targetObject.constructor.name + '.' + targetFunctionName + '() : ';
            var endTimeLogPrefix = 'MDA PERF :: End Time executing ' + _targetObject.constructor.name + '.' + targetFunctionName + '() : ';
            var totalTimeLogPrefix = 'MDA PERF :: Total Time executing ' + _targetObject.constructor.name + '.' + targetFunctionName + '() : ';
            var startTime = Date.now();
            kony.print(startTimeLogPrefix + startTime);
            var returnVal = targetFunction.apply(_targetObject, argArr);
            var endTime = Date.now();
            kony.print(endTimeLogPrefix + endTime);
            kony.print(totalTimeLogPrefix + (endTime - startTime) + 'ms');
            return returnVal;
        };
        return Logger;
    }();
    commonUtils_InitializeForms = function(constants) {
        function InitializeForms(moduleName) {
            this.moduleConfig = eval(moduleName + 'Config');
            if (this.moduleConfig !== undefined) {
                var forms = this.moduleConfig.Forms;
                var channel = kony.sdk.getChannelType();
                //Call some API here
                if (forms && channel && forms[channel]) {
                    var formsList = Object.keys(forms[channel]);
                    for (var eachForm in formsList) {
                        if (kony.mvc.registry.getControllerType(eachForm) != constants.FORM_CONTROLLER_TYPE) {
                            var formNameKey = formsList[eachForm];
                            var formPath = forms[channel][formNameKey].FormName;
                            var friendlyName = forms[channel][formNameKey].friendlyName || formPath;
                            var controller = forms[channel][formNameKey].Controller;
                            var formController = forms[channel][formNameKey].FormController;
                            var controllerExtensions = forms[channel][formNameKey].ControllerExtensions;
                            var controllerExtName = [];
                            Array.prototype.push.apply(controllerExtName, controllerExtensions);
                            kony.mvc.registry.remove(friendlyName);
                            kony.mvc.registry.add(friendlyName, formPath, {
                                'controllerName': controller,
                                'controllerType': formController,
                                'controllerExtName': controllerExtName
                            });
                        }
                    }
                }
            }
        }
        return InitializeForms;
    }(DataModel_constants);
    commonUtils_ProcessorUtils = function() {
        function ProcessorUtils() {}
        ProcessorUtils.applyFunction = function(fnToApply, val, context) {
            //Context fetch from sdk metadata
            if (fnToApply && context['metadata']) {
                var config = kony.mvc.MDAApplication.getSharedInstance().modelStore.getConfig(context['object']);
                context['datatype'] = config.typings[context['field']];
                val = fnToApply(val, context);
            }
            return val;
        };
        ProcessorUtils.getMetadataForObject = function(serviceName, objectName, options, successCallback, failureCallback) {
            kony.sdk.getCurrentInstance().getObjectService(serviceName, {
                'access': 'online'
            }).getMetadataOfObject(objectName, options, successCallback, failureCallback);
        };
        ProcessorUtils.convertObjectMetadataToFieldMetadataMap = function(objectMetadata) {
            var metadataMap = {};
            if (objectMetadata) {
                var columns = objectMetadata.columns;
                for (var colIndex in columns) {
                    if (columns[colIndex].metadata) {
                        metadataMap[columns[colIndex].displayName] = columns[colIndex].metadata;
                    }
                }
            }
            return metadataMap;
        };
        return ProcessorUtils;
    }();
    ParallelCommandExecuter_ParallelCommandExecuter = function() {
        function ParallelCommandExecuter() {}
        ParallelCommandExecuter.executeCommands = function(businessController, commands, callback) {
            var responseList = [];

            function successCallback(response) {
                if (response !== undefined) {
                    responseList.push(response);
                }
                if (responseList.length === commands.length) {
                    var responseListInOrder = [];
                    for (var i = 0; i < commands.length; i++) {
                        var alias = commands[i].getAlias();
                        for (var j = 0; j < responseList.length; j++) {
                            if (alias === responseList[j].alias) {
                                responseListInOrder.push(responseList[j]);
                            }
                        }
                    }
                    callback(responseListInOrder);
                }
            }
            for (var i = 0; i < commands.length; i++) {
                commands[i].setCompletionCallback(successCallback);
                businessController.execute(commands[i]);
            }
        };
        return ParallelCommandExecuter;
    }();
    DataModel_ModelRelation = function() {
        var Relation = function(name, targetObject) {
            this.name = name;
            this.targetObject = targetObject;
            this.relationFields = [];
            this.addRelationField = function(source, target) {
                this.relationFields.push({
                    sourceField: source,
                    targetField: target
                });
            };
            this.isValid = function() {
                if (this.relationFields.length === 0) {
                    throw Error('atleast one relationfield should be added use addRelationField(sourceProperty,targetProperty)');
                } else {
                    return true;
                }
            };
            this.type = 'OneToMany';
            this.cascade = 'false';
        };
        return Relation;
    }();
    DataModel_BaseModel = function(ModelRelation) {
        var BaseModel = function() {};
        //BaseModel.prototype.attributeMap={};
        BaseModel.prototype.getId = function() {
            if (this.config.primaryKeys.length === 1) {
                return this[this.config.primaryKeys[0]];
            } else {
                throw Error('getId() for Composite keys is not implemented yet.');
            }
        };
        BaseModel.isParentOf = function(child) {
            var _this = this;
            child.prototype = Object.create(this.prototype);
            child.prototype.constructor = child;
            child.prototype.attributeMap = {};
            Object.keys(this).forEach(function(key) {
                child[key] = _this[key];
            });
        };
        BaseModel.prototype.toDBJson = function(config) {
            var _this2 = this;
            var dbMapObj = {};
            Object.keys(config.mappings).forEach(function(e) {
                dbMapObj[config.mappings[e]] = _this2[e];
            });
            return dbMapObj;
        };
        /**
         * @function addRelation adds new relation to existing model
         * @param  {relation} relation object
         * @return
         */
        BaseModel.addRelation = function(relationObject) {
            var existingrelation;
            var relationexists = false;
            var modelrelations = this.relations;
            for (var i = 0; i < modelrelations.length; i++) {
                existingrelation = modelrelations[i];
                if (relationObject['targetObject'] == existingrelation['targetObject']) {
                    relationexists = true;
                }
            }
            if (!relationexists) {
                if (relationObject instanceof ModelRelation && relationObject.isValid()) {
                    this.relations.push(relationObject);
                }
            }
        };
        //Making attribute map part of Child model so depricating this
        //BaseModel.prototype.attributeMap={};
        /**
         * @function prototype function add Attribute adds new attribute and value to existing model instance
         * @param  {attributeKey} attribute key
         * @param  {modelDef} model defination
         * @return
         */
        BaseModel.prototype.addAttribute = function(attributeKey, attributeValue, modelName) {
            this.attributeMap[attributeKey] = {
                'model': modelName,
                'value': attributeValue
            };
        };
        /**
         * @function function add Attribute adds new attribute and value to existing model
         * @param  {attributeKey} attribute key
         * @param  {modelDef} model defination
         * @return
         */
        BaseModel.addAttribute = function(attributeKey, attributeValue, modelName) {
            this.prototype.attributeMap[attributeKey] = {
                'model': modelName,
                'value': null
            };
        };
        /**
         * @function save saves the given model data in the backend
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return
         */
        BaseModel.prototype.save = function(onCompletion, accessMode, options) {
            var model = this.objModelName;
            options = options ? options : null;
            kony.mvc.MDAApplication.getSharedInstance().getRepoManager().getRepository(model).save(this, onCompletion, accessMode, options);
        };
        /**
         * @function getByPrimaryKey  fetches data for the specified model based on the primary keys
         * @param  {String/JSON} primaryKey   primitive in case of one primary key and json in case of composite primary key
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return 
         */
        BaseModel.getByPrimaryKey = function(PrimaryKey, onCompletion, accessMode, options) {
            var model = this.prototype.objModelName;
            options = options ? options : null;
            kony.mvc.MDAApplication.getSharedInstance().getRepoManager().getRepository(model).getByPrimaryKey(PrimaryKey, onCompletion, accessMode, options);
        };
        /**
         * @function update  updates the record into the backend
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return
         */
        BaseModel.prototype.update = function(onCompletion, accessMode, options) {
            var model = this.objModelName;
            options = options ? options : null;
            kony.mvc.MDAApplication.getSharedInstance().getRepoManager().getRepository(model).update(this, onCompletion, accessMode, options);
        };
        /**
         * @function partialUpdate partially update the model data to the backend
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return 
         */
        BaseModel.prototype.partialUpdate = function(onCompletion, accessMode, options) {
            var model = this.objModelName;
            options = options ? options : null;
            kony.mvc.MDAApplication.getSharedInstance().getRepoManager().getRepository(model).partialUpdate(this, onCompletion, accessMode, options);
        };
        /**
         * @function remove deletes the specified model from the backend
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return
         */
        BaseModel.prototype.remove = function(onCompletion, accessMode, options) {
            var model = this.objModelName;
            options = options ? options : null;
            kony.mvc.MDAApplication.getSharedInstance().getRepoManager().getRepository(model).remove(this, onCompletion, accessMode, options);
        };
        /**
         * @function removeById deletes the specified model from the backend with a specific id
         * @param {JSON/STRING} primaryKey primary key value or json representing the key and value
         * @param  {function} onCompletion success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return
         */
        BaseModel.removeById = function(primaryKey, onCompletion, accessMode, options) {
            var model = this.prototype.objModelName;
            options = options ? options : null;
            kony.mvc.MDAApplication.getSharedInstance().getRepoManager().getRepository(model).removeById(this, primaryKey, onCompletion, accessMode, options);
        };
        /**
         * @function getAll  fetches  all the data for the specified model
         * @param  {type} onCompletion success callback
         * @param  {type} accessMode   json specifing access mode
         * @return 
         */
        BaseModel.getAll = function(onCompletion, accessMode, options) {
            var model = this.prototype.objModelName;
            options = options ? options : null;
            kony.mvc.MDAApplication.getSharedInstance().getRepoManager().getRepository(model).getAll(onCompletion, accessMode, options);
        };
        /**
         * @function customVerb fetches data for the specified model using specified customVerb
         * @param  {String} customVerb   name of the custom verb to be executed
         * @param  {JSON} params       parameters in the form of key value pairs
         * @param  {function} onCompletion success callback
         * @return 
         */
        BaseModel.customVerb = function(customVerb, params, onCompletion, options) {
            var model = this.prototype.objModelName;
            options = options ? options : null;
            kony.mvc.MDAApplication.getSharedInstance().getRepoManager().getRepository(model).customVerb(customVerb, params, onCompletion, options);
        };
        /**
         * @function getByCriteria  fetches data for the specified model based on the criteria passed
         * @param  {Json} criteria        criteria object based on which query is build in case of online and offline
         * @param  {function} onCompletion    success callback
         * @param  {JSON} accessMode   json specifing access mode
         * @return
         */
        BaseModel.getByCriteria = function(criteria, onCompletion, accessMode, options) {
            var model = this.prototype.objModelName;
            options = options ? options : null;
            kony.mvc.MDAApplication.getSharedInstance().getRepoManager().getRepository(model).getByCriteria(criteria, onCompletion, accessMode, options);
        };
        /**
         * @function {function name}
         * @param  {type} injectedNamedValMap    {description}
         * @param  {type} injectedPropertyValMap {description}
         * @return {type} {description}
         */
        BaseModel.Validator = function(injectedNamedValMap, injectedPropertyValMap) {
            var NamedValidatorMap = injectedNamedValMap ? injectedNamedValMap : {};
            var PropertyToValidatorMap = injectedPropertyValMap ? injectedPropertyValMap : {};
            var getValidations = function(propName) {
                if (PropertyToValidatorMap[propName]) {
                    return PropertyToValidatorMap[propName];
                } else {
                    return [];
                }
            };
            this.isValid = function(obj, propName, value) {
                if (propName) {
                    return getValidations(propName).every(function(fn) {
                        return fn(value, propName, obj);
                    });
                } else {
                    return Object.keys(PropertyToValidatorMap).filter(function(prop) {
                        return PropertyToValidatorMap[prop];
                    }).every(function(prop) {
                        return PropertyToValidatorMap[prop].every(function(fn) {
                            return fn(obj[prop], prop, obj);
                        });
                    });
                }
            };
            this.registerValidator = function(propName, validationFn, validationName) {
                var errMsg = 'Unable to register Validator ';
                if (!propName) {
                    throw Error(errMsg + '-> Property Name should be specified');
                }
                if (!validationFn) {
                    throw Error(errMsg + '-> Validation Function should be specified');
                }
                var validationFnToStore = validationFn;
                if (validationName) {
                    if (NamedValidatorMap[validationName] && NamedValidatorMap[validationName] != null) {
                        throw Error(errMsg + '-> Validation Function named "' + validationName + '" already exists.');
                    } else {
                        validationFnToStore = function validationFnToStore() {
                            if (validationFn.apply(undefined, arguments)) {
                                return true;
                            } else {
                                throw Error('Validation "' + validationName + '" failed for property : ' + propName);
                            }
                        };
                        validationFnToStore.name = validationName;
                        validationFnToStore.onProperty = propName;
                        NamedValidatorMap[validationName] = validationFnToStore;
                    }
                }
                if (!PropertyToValidatorMap[propName]) {
                    PropertyToValidatorMap[propName] = [];
                }
                PropertyToValidatorMap[propName].push(validationFnToStore);
            };
            this.deRegisterValidator = function(validationName) {
                if (NamedValidatorMap[validationName]) {
                    var fnToRemove = NamedValidatorMap[validationName];
                    PropertyToValidatorMap[fnToRemove.onProperty] = PropertyToValidatorMap[fnToRemove.onProperty].filter(function(e) {
                        return e != fnToRemove;
                    });
                    NamedValidatorMap[validationName] = null;
                } //else{throw 'No such validator was registered';}
            };
            this.clearAllValidators = function(forPropName) {
                if (forPropName) {
                    if (PropertyToValidatorMap[forPropName]) {
                        //clear named validations for the property
                        Object.keys(NamedValidatorMap).filter(function(key) {
                            return NamedValidatorMap[key] != null;
                        }).filter(function(key) {
                            return NamedValidatorMap[key].onProperty === forPropName;
                        }).forEach(function(key) {
                            NamedValidatorMap[key] = null;
                        });
                        //reset all the validataions for property
                        PropertyToValidatorMap[forPropName] = [];
                    }
                } else {
                    //clear all named validations
                    Object.keys(NamedValidatorMap).forEach(function(key) {
                        NamedValidatorMap[key] = null;
                    });
                    //reset all validations for all properties
                    Object.keys(PropertyToValidatorMap).forEach(function(key) {
                        PropertyToValidatorMap[key] = [];
                    });
                }
            };
            this.getNamedValidations = function() {
                return Object.keys(NamedValidatorMap).filter(function(key) {
                    return NamedValidatorMap[key];
                });
            };
        };
        return BaseModel;
    }(DataModel_ModelRelation);
    DataModel_ORMSession = function() {
        ORMSession = function(appContext) {
            this.appContext = appContext;
        };
        ORMSession.prototype.intialize = function() {};
        ORMSession.prototype.save = function(QueryBuilder) {};
        ORMSession.prototype.remove = function(QueryBuilder) {};
        ORMSession.prototype.get = function(QueryBuilder) {
            //Put Validation Logic
            //Put Execution Logic  
            //get query from QueryBuilder 
            //execute and return result
            console.log('in ormsession get method');
            var query = QueryBuilder.getQuery();
            console.log('execute ' + query);
        };
        return ORMSession;
    }();
    DataModel_Expression = function() {
        Expression = function() {
            this.expr = null;
            this.lhs = null;
            this.rhs = null;
        };
        Expression.and = function() {
            var rootExpression = Expression.eq(null, null);
            for (var expression in arguments) {
                if (rootExpression.lhs == null) {
                    rootExpression.lhs = arguments[expression];
                    continue;
                } else if (rootExpression.rhs == null) {
                    rootExpression.rhs = arguments[expression];
                    continue;
                } else {
                    var temp = rootExpression;
                    rootExpression = Expression.eq(null, null);
                    rootExpression.lhs = temp;
                    rootExpression.rhs = arguments[expression];
                }
            }
            return rootExpression;
        };
        Expression.eq = function(lexpr, rexpr) {
            var expr = new Expression();
            expr.expr = 'eq';
            expr.lhs = lexpr;
            expr.rhs = rexpr;
            return expr;
        };
        return Expression;
    }();
    FormController_MDAFormController = function(inheritsFrom) {
        function MDAFormController(viewId1) {
            this.eventDelegate = null;
            this.presenter = null;
            this.config = null;
            this.superParams = {
                counter: 0,
                level: null,
                refStack: []
            };
            kony.mvc.FormController.call(this, viewId1);
        }
        inheritsFrom(MDAFormController, kony.mvc.FormController);
        MDAFormController.prototype.show = function(context, isBackNavigation) {
            kony.mvc.FormController.prototype.show.call(this, context, isBackNavigation);
        };
        MDAFormController.prototype.raiseEvent = function(eventId, eventContext) {
            if (this.eventDelegate !== null) {
                this.eventDelegate._onEventRaised(this, eventId, eventContext);
            }
        };
        MDAFormController.prototype.setStartupContext = function() {};
        MDAFormController.prototype.onNavigate = function(context, isBackNavigation) {
            this.setStartupContext();
            if (context) {
                this.eventDelegate = context._presenter;
                this.presenter = context._presenter;
                this.config = context._formConfig;
                if ('viewModel' in context) {
                    this.updateUI(context.viewModel);
                }
            }
        };
        MDAFormController.prototype.updateUI = function(viewModel) {
            var uiInstance = kony.mvc.MDAApplication.getSharedInstance().getUIBinder();
            if (this.shouldUpdateUI(viewModel)) {
                this.willUpdateUI(viewModel);
                uiInstance.mapData(this.config, viewModel, this.view);
                this.didUpdateUI(viewModel);
            }
        };
        MDAFormController.prototype.shouldUpdateUI = function(context) {
            //code
            return true;
        };
        MDAFormController.prototype.willUpdateUI = function(context) {};
        MDAFormController.prototype.didUpdateUI = function(context) {};
        MDAFormController.prototype.attachToModule = function(module) {
            this.presenter = module.presentationController;
            this.presenter._pushToPresentationStack(this.presenter, this.view.id, null);
        };
        MDAFormController.prototype.super = function(methodName, argList) {
            var scope = this;
            var returnValue = null;
            if (this.superParams.level === null) {
                this.superParams.level = 0;
                while (scope['extensionLevel' + this.superParams.level.toString()]) {
                    this.superParams.level++;
                }
            }
            if (this.superParams.counter === 0) {
                for (var i = 0; i < this.superParams.level; i++) {
                    if (scope['extensionLevel' + i.toString()][methodName]) {
                        this.superParams.refStack.push(i);
                    }
                }
            }
            this.superParams.refStack.pop();
            if (this.superParams.refStack.length !== 0) {
                var callLvl = this.superParams.refStack[this.superParams.refStack.length - 1];
                this.superParams.counter++;
                returnValue = scope['extensionLevel' + callLvl.toString()][methodName].apply(this, argList);
                this.superParams.counter--;
            } else {
                kony.print('#MDA2 : Can\'t find any super for the ' + methodName + ' Method.');
            }
            if (this.superParams.counter === 0) {
                this.superParams.refStack = [];
                this.superParams.level = null;
            }
            return returnValue;
        };
        return MDAFormController;
    }(commonUtils_inheritsFrom);
    commonUtils_ControllerGetterAPI = function() {
        function getController(formId) {
            var tempController = kony.mvc.registry.get(formId);
            var controllerType = 'kony.mvc.MDAFormController';
            var isForm = true;
            if (tempController != null) {
                var tempControllerType = kony.mvc.registry.getControllerType(formId);
                if (tempControllerType == controllerType) {
                    return _kony.mvc.GetController(formId, isForm);
                } else {
                    var friendlyName = kony.mvc.registry.getFriendlyName(formId);
                    var controllerName = kony.mvc.registry.getControllerName(formId);
                    var controllerExtName = kony.mvc.registry.getControllerExtName(formId);
                    kony.mvc.registry.remove(formId);
                    kony.mvc.registry.add(formId, formId, {
                        'controllerName': controllerType,
                        'controllerType': controllerType,
                        'controllerExtName': controllerExtName
                    });
                    return _kony.mvc.GetController(formId, isForm);
                }
            } else {
                return null;
            }
        }
        return getController;
    }();
    main = function(require) {
        if (typeof kony === 'undefined') {
            kony = {};
        }
        kony.mvc = kony.mvc ? kony.mvc : {};
        const mda = kony.mvc;
        mda.Business = {};
        mda.Business.Controller = BusinessController_BusinessController;
        mda.Business.Command = BusinessController_Command;
        mda.Business.CommandExecutionEngine = BusinessController_CommandExecutionEngine;
        mda.Business.CommandHandler = BusinessController_CommandHandler;
        mda.Business.CommandResponse = BusinessController_CommandResponse;
        mda.Business.Delegator = BusinessController_BusinessDelegator;
        mda.util = mda.util ? mda.util : {};
        mda.MDAApplication = commonUtils_MDAApplication;
        mda.util.ClassExtensionUtility = commonUtils_ExtensibilityApi;
        mda.util.Logger = commonUtils_Logger;
        mda.util.InitializeForms = commonUtils_InitializeForms;
        mda.util.ProcessorUtils = commonUtils_ProcessorUtils;
        //mda.util.sync = mda.util.sync ? mda.util.sync : {};
        //mda.util.sync.Sync_Initialize_CommandHandler = require('commonUtils/syncController/Sync_Initialize_CommandHandler');
        //mda.util.sync.Sync_PresentationController = require('commonUtils/syncController/Sync_PresentationController');
        //mda.util.sync.SyncModuleConfig = require('commonUtils/syncController/SyncModuleConfig');
        mda.util.ParallelCommandExecuter = ParallelCommandExecuter_ParallelCommandExecuter;
        mda.Data = mda.Data ? mda.Data : {};
        mda.Data.BaseModel = DataModel_BaseModel;
        mda.Data.BaseRepository = DataModel_BaseRepository;
        mda.Data.DataSource = DataModel_DataSource;
        mda.Data.ORMSession = DataModel_ORMSession;
        mda.Data.QueryBuilder = DataModel_QueryBuilder;
        mda.Data.RepositoryManager = DataModel_RepositoryManager;
        mda.Data.ModelRelation = DataModel_ModelRelation;
        mda.Expression = DataModel_Expression;
        mda.MDAFormController = FormController_MDAFormController;
        mda.MDAModule = ModuleManager_MDAModule;
        mda.MDAModuleManager = ModuleManager_MDAModuleManager;
        mda.Presentation = mda.Presentation ? mda.Presentation : {};
        mda.Presentation.BasePresenter = PresentationController_MDABasePresenter;
        mda.Presentation.BaseNavigator = BaseNavigator_MDABaseNavigator;
        mda.UIBinder = mda.UIBinder ? mda.UIBinder : {};
        mda.UIBinder.UIBinder = UIBinder_UIBinder;
        mda.UIBinder.UIBinderBuilder = UIBinder_UIBinderBuilder;
        mda.UIBinder.WidgetDataMapper = UIBinder_WidgetDataMapper_WidgetDataMapper;
        mda.UIBinder.PropertyDataMapper = mda.UIBinder.PropertyDataMapper ? mda.UIBinder.PropertyDataMapper : {};
        mda.UIBinder.PropertyDataMapper.ButtonProperties = UIBinder_PropertyDataMapper_ButtonProperties;
        mda.UIBinder.PropertyDataMapper.CalendarProperties = UIBinder_PropertyDataMapper_CalendarProperties;
        mda.UIBinder.PropertyDataMapper.GenericProperties = UIBinder_PropertyDataMapper_GenericProperties;
        mda.UIBinder.PropertyDataMapper.ImageProperties = UIBinder_PropertyDataMapper_ImageProperties;
        mda.UIBinder.PropertyDataMapper.LabelProperties = UIBinder_PropertyDataMapper_LabelProperties;
        mda.UIBinder.PropertyDataMapper.ListboxProperties = UIBinder_PropertyDataMapper_ListboxProperties;
        mda.UIBinder.PropertyDataMapper.RichTextProperties = UIBinder_PropertyDataMapper_RichTextProperties;
        mda.UIBinder.PropertyDataMapper.SliderProperties = UIBinder_PropertyDataMapper_SliderProperties;
        mda.UIBinder.PropertyDataMapper.SwitchProperties = UIBinder_PropertyDataMapper_SwitchProperties;
        mda.UIBinder.PropertyDataMapper.TextAreaProperties = UIBinder_PropertyDataMapper_TextAreaProperties;
        mda.UIBinder.PropertyDataMapper.TextboxProperties = UIBinder_PropertyDataMapper_TextboxProperties;
        mda.UIBinder.WidgetDataMapper = mda.UIBinder.WidgetDataMapper ? mda.UIBinder.WidgetDataMapper : {};
        mda.UIBinder.WidgetDataMapper.ButtonWidgetDataMapper = UIBinder_WidgetDataMapper_ButtonWidgetDataMapper;
        mda.UIBinder.WidgetDataMapper.CalendarWidgetDataMapper = UIBinder_WidgetDataMapper_CalendarWidgetDataMapper;
        mda.UIBinder.WidgetDataMapper.ImageWidgetDataMapper = UIBinder_WidgetDataMapper_ImageWidgetDataMapper;
        mda.UIBinder.WidgetDataMapper.LabelWidgetDataMapper = UIBinder_WidgetDataMapper_LabelWidgetDataMapper;
        mda.UIBinder.WidgetDataMapper.ListboxWidgetDataMapper = UIBinder_WidgetDataMapper_ListboxWidgetDataMapper;
        mda.UIBinder.WidgetDataMapper.RichTextWidgetDataMapper = UIBinder_WidgetDataMapper_RichTextWidgetDataMapper;
        mda.UIBinder.WidgetDataMapper.SegmentWidgetDataMapper = UIBinder_WidgetDataMapper_SegmentWidgetDataMapper;
        mda.UIBinder.WidgetDataMapper.SliderWidgetDataMapper = UIBinder_WidgetDataMapper_SliderWidgetDataMapper;
        mda.UIBinder.WidgetDataMapper.SwitchWidgetDataMapper = UIBinder_WidgetDataMapper_SwitchWidgetDataMapper;
        mda.UIBinder.WidgetDataMapper.TextAreaWidgetDataMapper = UIBinder_WidgetDataMapper_TextAreaWidgetDataMapper;
        mda.UIBinder.WidgetDataMapper.TextboxWidgetDataMapper = UIBinder_WidgetDataMapper_TextboxWidgetDataMapper;
        mda.UIBinder.WidgetDataMapper.FlexContainerWidgetDataMapper = UIBinder_WidgetDataMapper_FlexContainerWidgetDataMapper;
        mda.UIBinder.WidgetDataMapper.WidgetDataMapper = UIBinder_WidgetDataMapper_WidgetDataMapper;
        mda.getController = commonUtils_ControllerGetterAPI;
        //constants
        mda.constants = mda.constants ? mda.constants : {};
        mda.constants.STATUS_SUCCESS = 100;
        mda.constants.STATUS_FAILURE = 200;
        mda.constants.STATUS_ABORT = 99;
        define('kony.mvc.MDAFormController', kony.mvc.MDAFormController);
        define('kony/mvc/MDAFormController', kony.mvc.MDAFormController);
        define('MDAFormController', kony.mvc.MDAFormController);
        return mda;
    }({});
}());