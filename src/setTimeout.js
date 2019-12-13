/************************************
 *      MonkeyPatch Timeout         *
 * **********************************
 * Version: 1.0.0
 *
 * Description:
 * Defines the setTimeout and clearTimeout functions for non-browser
 * environments -i.e. Native mobile. This helps the Kony platform play
 * nice with other javascript modules that might depend on these function definitions
 * -e.g. Promises polyfills and Kris Kowal's Q.
 *
 * Implementation Notes:
 * 1) Uses the eval function to avoid declaring a setTimeout or clearTiemout
 * variable/function unless it's necessary. Declaring it and not initializing it
 * will lead to breaking the natively defined namespace on browser environments.
 *
 * 2) Can't wrap in closure notation as there seems to be no global variable -equialent
 * to window or self- in non-browser environments, so there would be nothing to attach
 * it to. Therefore it just has to be declared as a global variable.
 *
 * 3) When used on its own, give this module prefix "aaa" to force this to be loaded before
 * any other javascript libraries that might be dependant setTimeout and clearTimeout
 * being already defined.
 */

var _setTimeout = (function(){ // eslint-disable-line no-unused-vars
	var timeoutId = 7000;
	return function (fn, msDelay){
		kony.timer.schedule(""+timeoutId, fn, msDelay/1000, false);
		return timeoutId++;
	};
})();

var _clearTimeout = function(timeoutId){ // eslint-disable-line no-unused-vars
	kony.timer.cancel(timeoutId);
};

if(typeof window === "undefined" && typeof self === "undefined"){
	eval("var setTimeout = _setTimeout"); // eslint-disable-line no-eval
	eval("var clearTimeout = _clearTimeout"); // eslint-disable-line no-eval
	kony.print("Kronin says: defined setTimeout to: " + setTimeout);
}
else{
	kony.print("Kronin says: setTimeout is natively supported as: " + setTimeout);
}
