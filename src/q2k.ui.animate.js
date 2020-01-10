const Q = require("./q");
require("./q2k.ui");

((definition) => {
	/**
	* Change the current theme in a promisy way.<br>
	* Just like <em>kony.theme.setCurrentTheme</em>, but using Q promises rather
	* than evil callbacks.
	* <pre>
	*   kony.theme.setCurrentTheme2(themeName)
	*   .then(() => {
	*		//success
	*	})
	*	.fail((error) => {
	*		//error
	*	});
	* </pre>
	*/

	/**
	* Animate Kony widgets in a promisy way -e.g:<br>
	* <pre>
	* 	kony.q2k.ui.animate(widget, steps, config)
	*		.progress(function(widget, animationHandle, elapsedTime){
	*			//The animation has started.
	*		})
	*		.then(function(widget, animationHandle, elapsedTime){
	*			//The animation has ended.
	*		})
	*		.fail(function(error){
	*			//The animation failed.
	*		});
	* </pre>
	*/
	kony.q2k.ui.animate = definition;
	if(typeof kony.ui.animate === "undefined"){

		/**
		* Just like <em>kony.q2k.ui.animate</em> but also added here for better discoverability.
		*/
		kony.ui.animate = kony.q2k.ui.animate;
	}
	else{
		/**
		* Just like <em>kony.q2k.ui.animate</em> but also added here for better discoverability.
		*/
		kony.ui.animate2 = kony.q2k.ui.animate;
	}
})((widget, steps, config) => {

	return Q.Promise(function(resolve, reject, notify) {

		try{
			var animation = kony.ui.createAnimation(steps);
			widget.animate(animation, config, {
				/*eslint no-shadow: ["error", { "allow": ["widget"] }]*/
				animationStart: (widget, animationHandle, elapsedTime) => {
					notify({ widget, animationHandle, elapsedTime });
				},
				animationEnd: (widget, animationHandle, elapsedTime) => {
					resolve({ widget, animationHandle, elapsedTime });
				}
			});
		}
		catch(e){
			reject(new Error(
				`Problem animating widget ${widget.id}:\n\t${e}`
			));
		}
	});
});
