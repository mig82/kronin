require("./timer.cancel2");

((definition) => {
	/**
	 * kony.timer.schedule2 - Safely schedule a timer. It behaves just like kony.timer.schedule but
	 * instead of expecting a unique timerId, it just expects a prefix —which is
	 * not required to be unique— and then appends a randomised suffix to it, thus
	 * guaranteeing that the timer will always be created.
	 *
	 * @param  {string} idPrefix The prefix that will be used to compose a unique identifier for the timer.
	 * @param  {function} fn The function to be invoked.
	 * @param  {number} delay the time, in seconds, the timer should wait before fn is executed.
	 * @param  {boolean} repeat Whether or not to execute fn more than once.
	 * @return {string} The unique identifier of the newly created timer.
	 */
	kony.timer.schedule2 = definition;
})((idPrefix, fn, delay, repeat) => {  //eslint-disable-line no-unused-vars
	
	var timerId = idPrefix + "_" + Math.random();
	kony.timer.schedule(timerId, () => {
		fn();
		if(!repeat) kony.timer.cancel2(timerId);
	}, delay || 0, repeat);
	return timerId;
});
