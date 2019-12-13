((definition) => {
	/**
	* setAppBarColor - Sets the background color of the Android status bar.
	*
	* @param  {String} color An RGB hex-based color code —e.g. #cc0000 for a dark red.
	*/
	kony.application.setAppBarColor = definition;
})((color) => {

	if(typeof color === "undefined" || color.length === 0){
		return;
	}
	if(color[0] !== "#"){
		color = "#" + color;
	}
	if(typeof kony.application.setApplicationProperties === "function"){
		try{
			kony.application.setApplicationProperties({
				statusBarColor: color
			});
		}
		catch(e){
			kony.print(`Error trying to set the app's bar color to ${color}.`);
		}
	}
});
