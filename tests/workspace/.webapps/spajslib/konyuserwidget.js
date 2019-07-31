
$KW.KComponent = (function() {
    
    

    var module = {
        registerComponent: function(userObj) {
            if(!userObj)
                return 100;
            if(typeof userObj != 'object') {
                return 101;
            }

            var classname = userObj.classname;
            var name = userObj.name;
            var namespace = userObj.namespace;

            if(classname == null || classname.length <= 0) {
                return 102;
            }
            if(name == null || name.length <= 0) {
                return 102;
            }

            var userWidgetNamespace = window;
            if(namespace != null && namespace != "") {
                var namspaceArr = namespace.split(".");
                for(var i = 0; i < namspaceArr.length; i++) {
                    userWidgetNamespace = module.getNSObj(userWidgetNamespace, namspaceArr[i]);
                }
            }
            if(userWidgetNamespace[classname])
                return 103;

            userWidgetNamespace[classname] = function(bconfig, lconfig, pspconfig) {
                var retObj;
                if(bconfig.masterType == constants.MASTER_TYPE_USERWIDGET) {
                    retObj = kony.ui.KComponentTemplate(bconfig, lconfig, pspconfig, name);
                } else {
                    retObj = kony.ui.KMasterTemplate(bconfig, lconfig, pspconfig, name);
                }
                retObj.instancename = name;
                return retObj;
            }
            return 0;
        },

        getNSObj: function(userNS1, userNS2) {
            if(!userNS1[userNS2]) {
                userNS1[userNS2] = new Object();
            }
            return userNS1[userNS2];
        },

        render: function(UserWidgetModel, context) {
            var wModel = UserWidgetModel.userWidgetProxyObject;
            wModel.parent = UserWidgetModel.parent;
            return $KW[wModel.wType].render(wModel, context);
        },

        forceLayout: function(UserWidgetModel) {
            $KW.FlexContainer.forceLayout(UserWidgetModel.parent);
        }
    };


    return module;
}());
