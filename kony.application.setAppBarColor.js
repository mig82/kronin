(() => {
	function setAppBarColor(color) {
		kony.application.setApplicationProperties({
			statusBarColor: color
		});
	}
	kony.application.setAppBarColor = setAppBarColor;
})();
