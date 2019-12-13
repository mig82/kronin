require("./router");

((definition) => {
	/**
	 * Wire any init, preShow, postShow, onHide and onOrientationChange
	 * functions in a controller to the form's events, without the need to use
	 * actions or additional code. <br>
	 * It also wraps these functions into try/catch statements so you won't have
	 * to.<br>
	 * Finally, it keeps the <em>kony.router</em> object informed of which form
	 * is the current one.
	 * */
	kony.mvc.wire = definition;

	/**
	 * Deprecated in favour of <em>kony.mvc.wire</em>
	 * */
	kony.mvc.patch = kony.mvc.wire;
})((controller) => {

	if(!controller.patched){
		kony.print(`Kronin is patching ${controller.view.id}`);

		if (!controller.constructor || controller.constructor.name !== "BaseController"){
			throw new Error("Cannot use extension kony.mvc.patch on anything other than a form controller");
		}

		const events = [ //Form events.
			"init",
			//"onDestroy" //Controllers already have their own onDestroy event.
			"preShow",
			"postShow",
			"onHide",
			"onOrientationChange"
		];

		var view = controller.view;
		events.forEach((eventName) => {
			if(typeof controller[eventName] === "function"){
				view[eventName] = function(){
					try{
						//kony.print(`*******Event fired: ${view.id}.${eventName}`);

						//If this is the preShow event of a form, then update current form in router.
						if(eventName === "preShow" && kony.router){
							kony.router.setCurrent(view);
						}
						controller[eventName]();
					}
					catch(e){
						alert(e);
					}
				};
			}
		});
		controller.patched = true; //So we don't patch any controller twice.
	}
});
