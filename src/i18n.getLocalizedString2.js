
/**
 * getLocalizedString2 - Get the localised string for an i18n key or return the key itself
 * if no localised string is found for the current locale. This is useful because if there
 * are gaps in a language bundle, seeing the actual key on screen is useful to quickly determine
 * what translations are missing — as opposed to just seeing a blank label and wondering what
 * that is for.
 * This function also supports substitution variables specified with curly brackets — e.g.:
 * If the localised string of an i18n key <em>"LABELS.GREETING"</em> is <em>"Hello {name}"</em>, then the example
 * below will render <em>"Hello Miguel"</em>.
 * @example kony.i18n.getLocalizedString2("LABELS.GREETING", {"name": "Miguel"});
 *
 * @name getLocalizedString2
 * @namespace kony.i18n
 *
 * @author Miguelángel Fernández
 *
 */
((definition) => {
	kony.i18n.getLocalizedString2 = definition;
})(
	/** @lends getLocalizedString2
	 * @param  {String} key   The i18n key to be localised.
	 * @param  {Object} scope Any substitution variables required for the placeholders in the localised string.
	 * @return {String}       The localised string.
	 **/
	function getLocalizedString2(key, scope) {
		var s = kony.i18n.getLocalizedString(key);
		if(!s) return key;

		for (var property in scope) {
			if (scope.hasOwnProperty(property)) {
				s = s.replace(new RegExp("\\{" + property + "\\}", "g"), scope[property]);
			}
		}
		return s;
	}
);
