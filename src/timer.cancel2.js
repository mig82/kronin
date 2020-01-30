((definition) => {
	/**
	 * kony.timer.cancel2 - Safely cancels a timer. It behaves just like kony.timer.cancel, but without
	 * assuming the timer is scheduled. It does not throw errors if
	 * the timer does not exist or has been cancelled already. This is useful if the
	 * timer you mean to cancel may be cancelled from several places in your logic,
	 * and you wish to avoid possible errors due to race conditions.
	 *
	 * @param  {string} timerId The unique identifier of a timer —which may or may not exist.
	 */
	kony.timer.cancel2 = definition;
})((timerId) => { // eslint-disable-line no-unused-vars
	try{kony.timer.cancel(timerId);}
	catch(e){
		kony.print(`WARN: ${timerId} already canceled or does not exist.`);
	}
});
