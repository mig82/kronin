/*!
*
* Krōnin is a collection of convenient extensions to enhance the Kony SDK.
* @author Miguelángel Fernández.
*/

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

require("./animations.rotate");

//In order to use Q, we'll need to first define a global setTimeout function.
require("./setTimeout");
//Make it possible for Q.js to attach itself to the kony global var as kony.Q.
if (typeof self === "undefined"){
	self = kony;
}
require("q");
var Q = kony.Q;
Q.longStackSupport = true;
require("./q2k.ui.animate");
require("./q2k.theme.setCurrentTheme");
require("./q2k.fabric.init");
require("./q2k.fabric.login");
require("./q2k.fabric.invoke");
