/*
* Define a component's setters and getters in one line by just listing the fields -e.g.:
* initGettersSetters: function() {kony.mvc.genAccessors(this, ["foo","bar"]);}
*/
((definition) => {
	kony.mvc.genAccessors = definition;
})((compCtrl, fields) => {

	fields.forEach((fieldName) => {
		//The internal field name is prefixed with underscore -e.g.: "_foo" for field "foo"
		var internalFieldName = "_" + fieldName;
		defineGetter(compCtrl, fieldName, function () {
			return compCtrl[internalFieldName];
		});
		defineSetter(compCtrl, fieldName, function (message) {
			compCtrl[internalFieldName] = message;
		});
	});
});
