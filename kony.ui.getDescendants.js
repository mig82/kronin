((definition) => {
	kony.ui.getDescendants = definition;
})(function getDescendants(containerWidget, includeParent, test){

	//A function that given a widget, returns its children matching a test
	function getChildren(parent, t){
		var filtered = typeof t === "function";
		var descendants = [];
		if(typeof parent.widgets === "function"){
			let children = parent.widgets();
			if(filtered) children = children.filter(t);
			descendants = descendants.concat(children);
		}
		return descendants;
	}

	//If a widget is considered a descendant of itself, then start by putting it in the array.
	var descendants = includeParent?[containerWidget]:[];
	if(typeof test === "function") descendants = descendants.filter(test);

	//Then add the children of the parent.
	descendants = getChildren(containerWidget, test);

	//Then add the children of each child already known.
	for(var k = 0; k < descendants.length; k++){
		descendants = getChildren(descendants[k], test);
	}
	return descendants;
});
