((definition) => {
	/**
	 * The same as <em>kony.i18n.getCurrentLocale</em> but using a hyphen
	 * instead of an underscore to separate the country and language ISO codes.
	 * */
	kony.i18n.getCurrentLocale2 = definition;
})(() => {
	return kony.i18n.getCurrentLocale().replace("_", "-");
});
