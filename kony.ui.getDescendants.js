((definition) => {
	kony.ui.getDescendants = definition;
})(function getDescendants(containerWidget, includeParent){

	var children = includeParent?[containerWidget]:[];
	if(typeof containerWidget.widgets === "function"){
		children = containerWidget.widgets();
	}

	for(var k = 0; k < children.length; k++){
		var child = children[k];
		if(typeof child.widgets === "function"){
			children = children.concat(child.widgets());
		}
	}
	return children;
});
