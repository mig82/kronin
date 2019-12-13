require("./i18n.getCurrentLocale2");

((definition) => {
	/**
	 * Formats a currency amount by using the decimal separator and digit
	 * grouping appropriate for the current locale.
	 * @param {number} number The number to be formatted.
	 * @param {number} decimalPlaces The number of decimal places required —e.g. formatting 100 with 2 decimal places will result in "100,00" or "100.00" depending on the locale.
	 * @param {string} currency The currency to use in currency formatting. Possible values are the ISO 4217 currency codes —e.g. "EUR" or "USD".
	 * @param {string} currencyDisplay Use "symbol" to display symbols such as € or £, "code" to use the ISO currency code, "name" to use a localized name such as "dollar"; the default is "symbol".
	 * */
	kony.i18n.getCurrencyAmount = definition;
})((number, decimalPlaces, currency, currencyDisplay) => {

	var locale = kony.i18n.getCurrentLocale2();

	/*globals Intl*/
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency,
		currencyDisplay: currencyDisplay || "symbol",
		minimumFractionDigits: decimalPlaces,
		maximumFractionDigits: decimalPlaces
	}).format(number);
});
