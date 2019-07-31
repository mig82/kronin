if(typeof(hybrid) === "undefined") {
    hybridfunc = function(funcname, params) {
        var arg = [];
        if(params.length) {
            var paramslength = IndexJL ? params.length + 1 : params.length;
            for(i = IndexJL; i < params.length; i++) {
                arg[i] = params[i];
            }
        }
        var funcobj = window[funcname];
        funcobj && funcobj(arg[IndexJL], arg[IndexJL + 1], arg[IndexJL + 2], arg[IndexJL + 3], arg[IndexJL + 4], arg[IndexJL + 5], arg[IndexJL + 6], arg[IndexJL + 7], arg[IndexJL + 8], arg[IndexJL + 9], arg[IndexJL + 10]);
    };

    hybrid = {};
    kony.hybrid = {};

    kony.hybrid.executeFunctionInSPAContext = hybrid.executefunctioninspacontext = hybridfunc;
    kony.hybrid.executeFunctionInTCContext = hybrid.executefunctionintccontext = function(funcname, params) {
        kony.print("hybrid.executefunctionintccontext <-");
        if($KG["appmode"] == constants.APPLICATION_MODE_HYBRID || $KG["appmode"] == constants.APPLICATION_MODE_WRAPPER) {
            kony.print("invoked internal.executefunctionintccontext");
            internal && internal.executefunctionintccontext(funcname, params)
        } else {
            hybridfunc(funcname, params);
        }
        kony.print("hybrid.executefunctionintccontext ->");

    };

    kony.hybrid.executeFunctionInNativeContext = hybrid.executefunctioninnativecontext = function(funcname, params) {
        kony.print("hybrid.executefunctioninnativecontext <--");
        if($KG["appmode"] == constants.APPLICATION_MODE_HYBRID || $KG["appmode"] == constants.APPLICATION_MODE_WRAPPER) {
            kony.print("invoked internal.executefunctioninnativecontext");
            internal && internal.executefunctioninnativecontext(funcname, params);

        } else {
            hybridfunc(funcname, params);
        }
        kony.print("hybrid.executefunctioninnativecontext ->");
    };
}


if(typeof(konyhybrid) === "undefined") {
    var konyhybrid = {
        
        
        showspaform: function(formid) {
            kony.print("showspaform <- :formid: " + formid);
            if(typeof(formid) == "string") {
                var formmodel = $KG.allforms[formid];
                if(formmodel) {
                    $KW.Form.handleshow(formmodel);
                }
            }
            kony.print("showspaform ->");
        }
    };
}
