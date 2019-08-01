/**
 * setAppBarColor - Sets the background color of the Android status bar.
 *
 * @param  {String} color An RGB hex-based color code —e.g. #cc0000 for a dark red.
 * @author Miguelángel Fernández
 */
(() => {
	function setAppBarColor(color) {
		kony.application.setApplicationProperties({
			statusBarColor: color
		});
	}
	kony.application.setAppBarColor = setAppBarColor;
})();
