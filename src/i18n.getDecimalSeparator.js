require("./i18n.getFormattedAmount");

((definition) => {
	/**
	 * Returns the decimal separator according to the current locale.
	 * */
	kony.i18n.getDecimalSeparator = definition;
})(() => {
	return kony.i18n.getFormattedAmount(1.5, 2)[1];
});
