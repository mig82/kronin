require("./animations");

((definition) => {
	/**
	 * Create a linear rotation animation without having to create multi-step
	 * animation. This function will dynamically generate all the animation
	 * steps needed to do the rotation and proportionally(as best as possible)
	 * assign each a part of the duration you specify in order to make it as
	 * smooth as possible.
	 *
	 * @param {widget} widget Any UI component.
	 * @param {number} degrees rotation in unsigned degrees.
	 * @param {boolean} clockwise Whether or not the rotation should be clockwise. If not, the rotation will be counter-clockwise.
	 * @param {number} duration The duration of the rotation in seconds. If specified it will override the duration of the Config Object.
	 * @param {object} Config The object containing the duration, delay, iterationCount, direction and fillMode. It's optional and the defaults are duration of 1 second,
	 * delay of 0 seconds, iterationCount 1, direction none, fillMode forwards.
	 * @param {object} callbacks The optional object containing the callbacks for a <widget>.animate() call. If not specified it will default to an empty callbacks object
	 */
	kony.animations.rotate = definition;
})(() => {

	var BREAK_POINT = 90;
	var stepConfig = {timingFunction: kony.anim.LINEAR};

	var DEFAULT_CONFIG = {
		duration: 1,
		delay: 0,
		iterationCount: 1,
		direction: kony.anim.DIRECTION_NONE,
		fillMode: kony.anim.FILL_MODE_FORWARDS
	};

	var DEFAULT_CALLBACKS = {animationEnd: function(){}};

	function _rotate(widget, deg, clockwise, config, callbacks){

		//Calculate how much time should the rotation of each degree last.
		var tick = 100 / deg;
		kony.print("tick:"+tick);

		var steps = {};
		var stepKey = 0;

		var sign = 1;
		clockwise? sign = -1: sign = 1;

		var absRotation = 0;

		/* TODO: Calculate the steps so that each rotates the same amount of
		 * degrees. Need the greatest common divisor for 90 (BREAK_POINT),
		 * 100 (Total animation steps) and deg.
		 * Use https://mathjs.org/docs/reference/functions/gcd.html
		 * The calculation would be gcd(90, 100, deg)
		 * 115 degrees: gcd(90, 100, 115)=5 -> So 20 (100/5) steps x 23 (115/5) degrees each.
		 * */

		//Calculate each step.
		do{
			var rotation = Math.min(deg, BREAK_POINT); //Calculate partial rotation for this step.
			deg = deg - BREAK_POINT; //Calculate how much pending rotation will be left after this step.

			//Prepare transformation with rotation degrees.
			var xfrm = kony.ui.makeAffineTransform();
			absRotation += sign * rotation;
			xfrm.rotate(absRotation);

			//Calculate the key for this step.
			if(deg > 0){
				stepKey += Math.floor(tick * rotation);
			}
			else{ //If this is the last step, the key must be 100.
				stepKey = 100;
			}
			//console.log("key: %s, rotation: %s, absRotation: %s, deg: %s ", stepKey, rotation, absRotation, deg);
			//Add the step to the steps object.
			steps[stepKey] = {
				transform: xfrm,
				stepConfig: stepConfig
			};
		}while(deg > 0);

		kony.print(steps);
		var anim = kony.ui.createAnimation(steps);

		widget.animate(anim, config, callbacks);
	}

	return function(widget, deg, clockwise, duration, _config, _callbacks){
		kony.print("deg: " + deg + ", clockwise: " + clockwise);
		var config, callbacks;
		_config? config = _config: config = DEFAULT_CONFIG;
		_callbacks? callbacks = _callbacks: callbacks = DEFAULT_CALLBACKS;

		if(typeof duration == 'number' && !isNaN(duration) && isFinite(duration)){
			config.duration = duration;
		}

		_rotate(widget, deg, clockwise, config, callbacks);
	};
});
