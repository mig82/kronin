((definition) => {
	kony.mvc.patch = definition;
})((controller) => {

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
					if(eventName === "preShow" && view.name === "kony.ui.Form2"){
						kony.router.setCurrent(view.id);
					}
					controller[eventName]();
				}
				catch(e){
					alert(e);
				}
			};
		}
	});

	//TODO: Make this a require module so it can be applied to the component like: return kony.mvc.patch({controller here})
	/*var ctrlEvents = ["onNavigate", "onDestroy"];
	ctrlEvents.forEach((eventName) => {
		if(typeof controller[eventName] === "function"){
			controller[eventName] = function(){
				try{
					kony.print(`*******Controller event fired: ${controller.view.id}.${eventName}`);
					controller[eventName]();
				}
				catch(e){
					alert(e);
				}
			};
		}
	});

	return controller;*/
});
