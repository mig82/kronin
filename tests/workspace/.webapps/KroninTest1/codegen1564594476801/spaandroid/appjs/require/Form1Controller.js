define("userForm1Controller", function() {
    return {
        init: function() {
            kony.print(`${this.view}.init`);
        },
        preShow: function() {
            kony.print(`${this.view}.preShow`);
        },
        postShow: function() {
            kony.print(`${this.view}.postShow`);
        },
        onHide: function() {
            kony.print(`${this.view}.onHide`);
        },
        onNavigate: function() {
            kony.mvc.patch(this);
        }
    };
});
define("Form1ControllerActions", {
    /* 
    This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
});
define("Form1Controller", ["userForm1Controller", "Form1ControllerActions"], function() {
    var controller = require("userForm1Controller");
    var controllerActions = ["Form1ControllerActions"];
    return kony.visualizer.mixinControllerActions(controller, controllerActions);
});
