require("./i18n.getLocalizedString2");

((definition) => {
	/**
	 * Shorthand function to localize the text on a widget.
	 * */
	kony.i18n.localizeWidget = definition;
})(() => {
	(widget) => {
		var localize = kony.i18n.getLocalizedString2 || kony.i18n.getLocalizedString;
		if(widget.text){
			widget.text = localize(widget.text) || widget.text;
		}
	}
});
