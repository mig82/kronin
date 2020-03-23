require("./animations");

((definition) => {
	/**
	 * Shorthand function to create an animation on an arbitrary property of a widget by
	 * simply providing an initial value and a final value for it, and by using common
	 * default settings such as kony.anim.FILL_MODE_FORWARDS.
	 *
	 * @param {widget} widget Any UI component.
	 * @param {string} animProperty The name of the property in the widget to be animated.
	 * @param {string} initialValue The initial value of the property to be animated.
	 * @param {string} finalValue The final value of the property to be animated.
	 * @param {number} duration How long the animation will take, measured in seconds.
	 * @param {number} delay How long to wait before firing the animation, measured in seconds.
	 * @param {number} timing A constant from kony.anim namespace, defining the acceleration for the animation —e.g. kony.anim.EASE_IN_OUT.
	 */
	kony.animations.animate = definition;
})((
		widget,
		animProperty, initialValue, finalValue,
		duration, delay, timing) => {

	var steps = { 0: {}, 100: {} };
	steps[0][animProperty] = initialValue;
	steps[100][animProperty] = finalValue;
	steps[100].stepConfig = {
		timingFunction: timing || kony.anim.EASE_IN_OUT
	};

	var config = {
		duration: duration || 0.5,
		iterationCount: 1,
		delay: delay || 0,
		fillMode: kony.anim.FILL_MODE_FORWARDS
	};

	return new Promise((resolve, reject) => {
		try{
			var animation = kony.ui.createAnimation(steps);
			widget.animate(animation, config, {
				animationStart: () => {},
				animationEnd: (source, animationHandle, elapsedTime) => {
					resolve({source, animationHandle, elapsedTime});
				}
			});
		}
		catch(e){
			kony.print(`kronin.animations.animate failed to animate:\n\t${e}`);
			reject(e);
		}
	});
});
