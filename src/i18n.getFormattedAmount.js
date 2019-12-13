require("./i18n.getCurrentLocale2");

((definition) => {
	/**
	 * Formats an amount by using the decimal separator and digit
	 * grouping appropriate for the current locale.
	 * @param {number} number The number to be formatted.
	 * @param {number} decimalPlaces The number of decimal places required. The default is 2. —e.g. formatting 100 with 2 decimal places will result in "100,00" or "100.00" depending on the locale.
	 * @param {boolean} asPercentage Whether the amount should be formatted as a percentage or not. The default is false.
	 * */
	kony.i18n.getFormattedAmount = definition;
})((number, decimalPlaces, asPercentage) => {

	var locale = kony.i18n.getCurrentLocale2();

	/*globals Intl*/
	return new Intl.NumberFormat(locale, {
		style: asPercentage ? "percent": "decimal",
		minimumFractionDigits: decimalPlaces || 2,
		maximumFractionDigits: decimalPlaces || 2
	}).format(number);
});
