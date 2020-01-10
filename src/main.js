
require("./aaa");

require("./router");
require("./mvc.wire");

require("./ui.getDescendants");
require("./ui.getComponents");

require("./getOs");
require("./amplify");
require("./application.setAppBarColor");
require("./i18n.getLocalizedString2");
require("./mvc.genAccessors");

require("./i18n.getCurrentLocale2");
require("./i18n.getCurrencyAmount");
require("./i18n.getFormattedAmount");
require("./i18n.getThousandsSeparator");

require("./animations");
require("./animations.rotate");

//In order to use Q, we'll need to first define a global setTimeout function.
require("./setTimeout");
// The npm postinstall script will have placed a minified version of Q in the
// src folder. Since Q's set-up will consider this a CommonJS environment, we
// can require it and then declare it as a global.
//var self = kony;
//require("./q");
require("q");
var Q = kony.Q;
if(typeof Q === "undefined"){
	alert("Q was not properly defined!");
}
else{
	kony.print("kronin says: Q is set up and ready to go!");
	Q.longStackSupport = true;
	require("./q2k.ui.animate");
	require("./q2k.theme.setCurrentTheme");
	require("./q2k.fabric.init");
	require("./q2k.fabric.login");
	require("./q2k.fabric.invoke");
}
module.exports = Q;
