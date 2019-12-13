require("./i18n.getFormattedAmount");

((definition) => {
	/**
	 * Returns the thousands separator according to the current locale.
	 * */
	kony.i18n.getThousandsSeparator = definition;
})(() => {
	return kony.i18n.getFormattedAmount(1000, 0)[1];
});
