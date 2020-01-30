require("./timer.cancel2");

((definition) => {
	/**
	 * kony.timer.schedule2 - Safely schedule a timer. It behaves just like
	 * kony.timer.schedule but, instead of expecting a unique timerId, it just
	 * generates one for you and returns it, thus avoiding the need to specify
	 * a unique ID every time.
	 *
	 * @param  {function} fn The function to be invoked.
	 * @param  {number} delay the time, in seconds, the timer should wait before fn is executed.
	 * @param  {boolean} repeat Whether or not to execute fn more than once.
	 * @return {string} The unique identifier of the newly created timer.
	 */
	kony.timer.schedule2 = definition;
})((fn, delay, repeat) => {  //eslint-disable-line no-unused-vars

	var timerId = "kronin." + repeat?"intr_":"tout_" + Math.random();
	kony.timer.schedule(timerId, () => {
		fn();
		if(!repeat) kony.timer.cancel2(timerId);
	}, delay || 0, repeat);
	return timerId;
});
