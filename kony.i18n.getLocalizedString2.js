((definition) => {
	kony.i18n.getLocalizedString2 = definition;
})(
	function getLocalizedString2(key, scope) {
		var s = kony.i18n.getLocalizedString(key);
		if(!s) return key;

		for (var property in scope) {
			if (scope.hasOwnProperty(property)) {
				s = s.replace("${" + property + "}", scope[property]); 
			}
		}
		return s;
	}
);
