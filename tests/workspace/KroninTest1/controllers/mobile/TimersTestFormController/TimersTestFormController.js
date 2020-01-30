define(function(){

	return{
		init: function(){
			//Stuff you only want done once the first time the screen is visited.
		},
		preShow: function(){
			//Move stuff out of sight if you want to then animate back in.
		},
		postShow: function(){
			kony.print("Time typeof kony.timer.schedule2 " + typeof kony.timer.schedule2);
			kony.print("Time typeof kony.timer.cancel2 " + typeof kony.timer.cancel2);

			var timeouts = [];
			var intervals = [];

			this.view.setTimeoutButton.onClick = () => {
				var start = Date.now();
				var timerId = kony.timer.schedule2(() => {
					var duration = Date.now() - start;
					kony.print("kony.timer.schedule2 fired after " + duration);
				}, this.view.timeoutDelayTextBox.text, false);
				timeouts.push(timerId);
				kony.print("New timeout: " + JSON.stringify(timeouts));
			};

			this.view.setIntervalButton.onClick = () => {
				var start = Date.now();
				var timerId = kony.timer.schedule2(() => {
					var duration = Date.now() - start;
					kony.print("kony.timer.schedule2 fired after " + duration);
				}, this.view.intervalDelayTextBox.text, true);
				intervals.push(timerId);
				kony.print("New interval:" + JSON.stringify(intervals));
			};

			this.view.cancelTimeoutButton.onClick = () => {
				var timerId = timeouts.pop();
				kony.timer.cancel2(timerId);
				kony.print("kony.timer.cancel2 cleared " + timerId);
			};

			this.view.cancelIntervalButton.onClick = () => {
				var timerId = intervals.pop();
				kony.timer.cancel2(timerId);
				kony.print("kony.timer.cancel2 cleared " + timerId);
			};
		},
		onNavigate: function(){
			//Wire it all together.
			this.view.init = this.init;
			this.view.preShow = this.preShow;
			this.view.postShow = this.postShow;
		},
		onDestroy: function(){
			//Rarely used. Just keep in mind it exists.
		}
	};
});
