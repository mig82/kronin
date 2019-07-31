define("userForm2Controller", function() {
    return {
        init: function() {
            kony.print(`${this.view.id}.init`);
        },
        preShow: function() {
            kony.print(`${this.view.id}.preShow`);
        },
        postShow: function() {
            kony.print(`${this.view.id}.postShow`);
            this.view.myButton.onTouchEnd = () => {
                kony.router.goto("Form1");
            };
        },
        onHide: function() {
            kony.print(`${this.view.id}.onHide`);
        },
        onNavigate: function() {
            kony.mvc.patch(this);
        }
    };
});
define("Form2ControllerActions", {
    /* 
    This is an auto generated file and any modifications to it may result in corruption of the action sequence.
    */
});
define("Form2Controller", ["userForm2Controller", "Form2ControllerActions"], function() {
    var controller = require("userForm2Controller");
    var controllerActions = ["Form2ControllerActions"];
    return kony.visualizer.mixinControllerActions(controller, controllerActions);
});
