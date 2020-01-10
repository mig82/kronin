const Q = require("./q");
require("./q2k.theme");

((definition) => {

	/**
	* Change the current theme in a promisy way.<br>
	* Just like <em>kony.theme.setCurrentTheme</em>, but using Q promises rather
	* than evil callbacks.
	* <pre>
	*   kony.theme.setCurrentTheme2(themeName)
	*   .then((themeMetadata) => {
	*		//success
	*	})
	*	.fail((error) => {
	*		//error
	*	});
	* </pre>
	*/
	kony.q2k.theme.setCurrentTheme = definition;

	/**
	* Just like <em>kony.q2k.theme.setCurrentTheme</em> but also added here for better discoverability.
	*/
	kony.theme.setCurrentTheme2 = kony.q2k.theme.setCurrentTheme;

})((theme) => {
	return Q.Promise(function(resolve, reject/*, notify*/) {
		kony.theme.setCurrentTheme(
			theme,
			function () {
				resolve(kony.theme.getCurrentThemeData());
			},
			function (code, message) {
				reject(new Error(`code ${code}:${message}`));
			}
		);
	});
});
