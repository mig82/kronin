kony.modules = (function() {
    
    

    var module = {
        
        loadModule: function(moduleid) {
            $KU.logExecuting('kony.modules.loadFunctionalModule');
            if(typeof $KG.functionalModules[moduleid] === "undefined") {
                $KU.logErrorMessage('Invalid type functionalModules ');
                return false;
            }
            $KU.logExecutingWithParams('kony.modules.loadFunctionalModule', moduleid);
            try {
                var fm = $KG.functionalModules[moduleid];
                if(fm.loaded == 1) return true;

                fm.loaded = 1;
                if(module.preInitCheck(moduleid)) {
                    $KU.logExecutingFinished('kony.modules.loadFunctionalModule VIA if module.preInitCheck(moduleid) exists ')
                    return true;
                }
                
                if(typeof importScripts === "function") {
                    importScripts(moduleid + "_kfm.js");
                    module.moduleCallback(moduleid);
                } else {
                    var url = kony.appinit.getStaticContentPath() + $KG.platformver + "appjs/" + moduleid + "_kfm.js";
                    $KI.net.loadJSFile(url, false, function(moduleScript) {
                        try {
                            module.addScript(moduleScript);
                            module.moduleCallback(moduleid);
                        } catch(e) {
                            $KU.logErrorMessage('Unable to load module ' + moduleid + '. Error ' + e.message);
                            kony.print('Unable to load module ' + moduleid + '. Error ' + e.message);
                        }
                    });
                }

                if($KG.functionalModules[moduleid].loaded === 1) {
                    $KU.logExecutingFinished('kony.modules.loadFunctionalModule VIA if $KG.functionalModules[moduleid].loaded === 1');
                    return true;
                } else {
                    $KU.logErrorMessage('functionalModules not loaded');
                    return false;
                }
            } catch(e) {
                $KU.logErrorMessage(e.message);
                kony.print(e.message);
                return false;
            }
        },

        
        preInitCheck: function(moduleid) {
            var fm = $KG.functionalModules[moduleid];
            
            for(var i = 0; i < fm.depends.length; i++) {
                var m = fm.depends[i];
                if(typeof $KG.functionalModules[m] == "undefined") {
                    throw new Error('Invalid module : ' + m);
                }
                if(typeof $KG.functionalModules[m].loaded == "undefined") {
                    if(!module.loadModule(m)) {
                        throw new Error('Unable to load module : ' + m);
                    }
                }
            }
            return false;
        },

        
        moduleCallback: function(m) {
            var fm = $KG.functionalModules[m];
            if(typeof fm !== "undefined") {
                var init = null;
                if(typeof(fm.init) === "string") {
                    init = window[fm.init];
                    if(typeof init !== "function") {
                        fm.inProgress = false;
                        fm.loaded = undefined;
                        throw new Error('Invalid module init function : ' + m);
                    }
                }

                
                if(typeof fm.errorcode === "undefined" && init !== null) {
                    init();
                }
                fm.inProgress = false;
                fm.loaded = 1;


            }
        },

        
        loadModuleAsync: function(moduleid, callback, errorcallback) {
            $KU.logExecuting('kony.modules.loadFunctionalModuleAsync');
            $KU.logExecutingWithParams('kony.modules.loadFunctionalModuleAsync', moduleid, callback, errorcallback);
            try {
                var fm = $KG.functionalModules[moduleid];
                if(typeof fm === "undefined") {
                    $KU.logErrorMessage('Invalid type functionalModules');
                    return errorcallback(moduleid, 1250);
                }
                var loadComplete = function(e) {
                    if(typeof fm.loaded == "undefined") {
                        try {
                            module.moduleCallback(moduleid);
                        } catch(exp) {
                            
                            $KU.logErrorMessage('unknown error' + exp);
                            e = 1251;
                        }
                    }
                    if(e) {
                        errorcallback(moduleid, e);
                    } else {
                        callback(moduleid);
                    }
                };

                if(fm.loaded == 1) {
                    $KU.logExecutingFinished('kony.modules.loadFunctionalModuleAsync');
                    callback(moduleid);
                    return true;
                }
                if(fm.inProgress) {
                    
                    $KU.logWarnMessage('unable to load functionalModules or still in progress ');
                    return;
                }

                fm.inProgress = true;
                module.loadDependentModules(moduleid, callback, errorcallback);

                

                if(typeof importScripts === "function") {
                    importScripts(moduleid + "_kfm.js");
                    loadComplete();
                } else {
                    var url = kony.appinit.getStaticContentPath() + $KG.platformver + "appjs/" + moduleid + "_kfm.js";
                    $KI.net.loadJSFile(url, true, function(moduleScript) {
                        module.checkForDependents(moduleid, moduleScript, loadComplete);
                    });
                }
            } catch(e) {
                kony.web.logger('error', 'unknown error' + e);
                errorcallback(moduleid, 1251);
            }
        },

        checkForDependents: function(moduleid, moduleScript, loadComplete, counter) {
            var dependentsLoaded = true;
            var errorOnLoad = null;
            var fm = $KG.functionalModules[moduleid];
            if(typeof fm.errorcode !== "undefined") {
                errorOnLoad = fm.errorcode;
            }

            
            if(typeof counter === "undefined") {
                counter = 0;
            } else {
                if(counter > 30) {
                    loadComplete(1251);
                    return;
                } else {
                    counter++;
                }
            }

            for(var i = 0; i < fm.depends.length; i++) {
                var m = fm.depends[i];
                if(typeof $KG.functionalModules[m] !== "undefined") {
                    if(typeof $KG.functionalModules[m].loaded == "undefined") {
                        dependentsLoaded = false;
                    }
                    if(typeof $KG.functionalModules[m].errorcode !== "undefined") {
                        errorOnLoad = $KG.functionalModules[m].errorcode;
                    }
                }
            }

            
            if(dependentsLoaded && errorOnLoad === null) {
                if(moduleScript === null) {
                    loadComplete();
                } else {
                    module.addScript(moduleScript, loadComplete);
                }
            } else if(errorOnLoad !== null) {
                loadComplete(errorOnLoad);
            } else {
                setTimeout(function() {
                    module.checkForDependents(moduleid, moduleScript, loadComplete, counter);
                }, 100);
            }
        },

        loadDependentModules: function(moduleid, sc, ec) {
            var mod = $KG.functionalModules[moduleid];
            
            

            
            for(var i = 0; i < mod.depends.length; i++) {
                var m = mod.depends[i];
                if(typeof $KG.functionalModules[m] === "undefined") {
                    ec(moduleid, 1250); 
                } else if(typeof $KG.functionalModules[m].loaded == "undefined" && $KG.functionalModules[m].inProgress !== true) {
                    module.loadModuleAsync(m, module.onLoadComplete, module.onLoadComplete);
                }
            }
            return false;
        },

        onLoadComplete: function(moduleid, errorcode) {
            $KG.functionalModules[moduleid].errorcode = errorcode;
        },

        addScript: function(moduleScript, callback) {
            
            var script = document.createElement('script');
            script.type = "text/javascript";
            script.text = moduleScript;
            try {
                document.getElementsByTagName('head')[0].appendChild(script);
                if(callback) {
                    callback();
                }
            } catch(e) {
                if(callback) {
                    callback(e);
                }
            } finally {
                document.getElementsByTagName('head')[0].removeChild(script);
            }
        }
    };

    module.loadFunctionalModule = module.loadModule;

    module.loadFunctionalModuleAsync = module.loadModuleAsync;


    return module;
}());
