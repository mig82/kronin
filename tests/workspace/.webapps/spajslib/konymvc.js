_kony.mvc = {
    Form2: function(bconfig, lconfig, pspconfig) {
        var formInstance;
        if(!bconfig._konyControllerName) {
            kony.web.logger("warn", "This API is applicable only for MVC projects");
            return;
        }
        if(arguments.length < 3) {
            formInstance = new kony.ui.Form2(bconfig);
        } else {
            formInstance = new kony.ui.Form2(bconfig, lconfig, pspconfig);
        }
        formInstance.destroy = undefined;
        return formInstance;
    },

    showForm: function(formModel) {
        if(formModel._konyControllerName) {
            formModel._show();
        } else {
            kony.web.logger("warn", "This API is applicable only for MVC projects");
        }
    },

    destroyForm: function(formModel) {
        $KU.logExecuting('kony.application.destroyForm');
        if(formModel._konyControllerName && formModel) {
            $KU.logExecutingWithParams('kony.application.destroyForm', formModel);
            formModel._destroy({"isMVC": true});
            $KU.logExecutingFinished('kony.application.destroyForm');
        } else {
            $KU.logWarnMessage("This API is applicable only for MVC projects");
        }
    }
};
