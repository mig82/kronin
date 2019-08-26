require("./ui.getDescendants.js");

/**
* getComponents - Returns an array containing all the component instances nested
* within a form or container widget. The container widget may be a Form, a Flex
* Container, Scroll Flex Container or any other widget capable of containing components.
*
* @param  {FlexForm|FlexContainer|FlexFormContainer|Segment} containerWidget The parent form or container widget
* for which you wish to get all descendants.
* @param  {Boolean} includeParent   Whether to include the parent container widget in the
* resulting array if it is a component.
* @return {Array} An array containing all components within a form or container widget.
*
* @author Miguelángel Fernández
*/
((definition) => {
	kony.ui.getComponents = definition;
})(function getComponents(containerWidget){

	return kony.ui.getDescendants(containerWidget, false, (child) => {
		return child.name === "kony.ui.KComponent";
	});
});
