require("./animations.animate");

((definition) => {
	/**
	 * Shorthand function to create an animation to reveal a widget from opacity 0
	 * to opacity 1, using common default settings such as kony.anim.FILL_MODE_FORWARDS.
	 *
	 * @param {widget} widget Any UI component.
	 * @param {number} duration How long the animation will take, measured in seconds.
	 * @param {number} delay How long to wait before firing the animation, measured in seconds.
	 * @param {number} timing A constant from kony.anim namespace, defining the acceleration for the animation —e.g. kony.anim.EASE_IN_OUT.
	 */
	kony.animations.reveal = definition;
})((widget, duration, delay, timing) => {

	return kony.animations.animate(
		widget,
		"opacity", 0, 1,
		duration || 0.5,
		delay || 0.25,
		timing || kony.anim.EASE_IN_OUT
	);
});
