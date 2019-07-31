((definition) => {
	kony.mvc.patch = definition;
})((controller, bindComponents) => {

	if (!controller.constructor || controller.constructor.name !== "BaseController"){
		throw new Error("Cannot use extension kony.mvc.patch on anything other than a form controller");
	}

	const events = [ //Form events.
		"init",
		//"onDestroy" //Controllers already have their own onDestroy event.
		"preShow",
		"postShow",
		"onHide",
		"onBreakpointChange",
		"onOrientationChange"
	];

	var view = controller.view;
	events.forEach((eventName) => {
		if(typeof controller[eventName] === "function"){
			view[eventName] = function(){
				try{
					kony.print(`*******Event fired: ${view.id}.${eventName}`);
					controller[eventName]();
				}
				catch(e){
					alert(e);
				}
			};
		}
	});

	/*global amplify*/
	if(bindComponents){
		if(typeof amplify !== "undefined" && typeof kony.ui.getDescendants !== "undefined"){
			var components = kony.ui.getDescendants(controller.view, false, (child) => {
				return child.name === "kony.ui.KComponent";
			});
			//kony.print(`Found ${components.length} components in form ${view.id}*******`);

			components.forEach((component) => {
				events.forEach((event) => {
					if(typeof component[event] === "function"){
						amplify.subscribe(`${view.id}.${event}`, component[event]);
					}
					else{
						kony.print(
							`${view.id}.${component.id}.${event} is ether ` +
							"not defined or not exposed. Expose it as a custom method."
						);
					}
				});
			});
		}
		else{
			kony.print(
				"Cannot bind component events to form events " +
				"without amplify and extension kony.ui.getDescendants"
			);
		}
	}

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
