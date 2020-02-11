define(function(){ 

	return{
		init: function(){
			kony.print(`${this.view.id}.init`);
		},
		preShow: function(){
			kony.print(`${this.view.id}.preShow`);
		},
		postShow: function(){
			kony.print(`${this.view.id}.postShow`);
			this.view.myButton.onTouchEnd = ()=>{
				kony.router.goto("Form2");
			};
		},
		onHide: function(){
			kony.print(`${this.view.id}.onHide`);	
		},
		onNavigate: function(){
			kony.mvc.patch(this);
		}
	};
});
