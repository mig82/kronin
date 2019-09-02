define(function(){ 

	return{
		getChildren: function(){
			kony.print("Fetching all descendants");
			var children = kony.ui.getDescendants(this.view, true);
			this.postResults(children);
		},
		getComponents: function(){
			kony.print("Fetching components");
			var components = kony.ui.getComponents(this.view);
			this.postResults(components);
		},
		postResults: function(children){
			this.view.results.text = `Count: ${children.length}`;
			children.forEach((child) => {
				this.view.results.text += `\nid: ${child.id}`;
			});
		},
		postShow: function(){
			this.view.getComponentsButton.onTouchEnd = this.getComponents;
			this.view.getDescendantsButton.onTouchEnd = this.getChildren;
		},
		onNavigate: function(){
			kony.mvc.patch(this);
		}
	};
});