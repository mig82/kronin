define(function() {

	//A place to keep a reference to kony.print so we can proxy it.
	var realKonyPrint;

	//The text area or label into which we will print.
	var outputWidget;

	//The text box where the user types the filter.
	var filterWidget;

	const fakeKonyPrint = (text) => {

		if(printOn){
			if(!filterOn){
				outputWidget.text += text + "\n";
			}
			else if(text.indexOf(filterWidget.text) >= 0){
				outputWidget.text += text + "\n";
			}
		}
		realKonyPrint(text);
	};

	var printOn = false;
	var filterOn = false;

	return {
		toggleFiltering: function(){
			if(filterOn){
				this.view.filterFlex.isVisible = true;
				this.view.outputFlexScroll.top = "20dp";
			}
			else{
				this.view.filterFlex.isVisible = false;
				this.view.outputFlexScroll.top = "0dp";
			}
		},

		toggleButtonSkin: function(button){
			if(!this.buttonFocusSkin){
				this.buttonFocusSkin = button.focusSkin;
				this.buttonNormalSkin = button.skin;
			}
			button.skin = button.skin === this.buttonNormalSkin?this.buttonFocusSkin:this.buttonNormalSkin;
		},

		bindButtons: function(){
			this.view.clearButton.onClick = () => {
				this.view.debugArea.text = "";
			};

			this.view.filterButton.onClick = () => {
				filterOn = !filterOn;
				this.toggleFiltering();
				this.toggleButtonSkin(this.view.filterButton);
			};

			this.view.powerButton.onClick = () => {
				printOn = !printOn;
				this.toggleButtonSkin(this.view.powerButton);
			};
		},

		print: function(text){
			if(printOn){
				if(!this.isFiltering()){
					this.printOutput(text);
				}
				else if(text.indexOf(this.view.filterTextBox.text) >= 0){
					this.printOutput(text);
				}
			}
			realKonyPrint(text);
		},

		overridePrint: function(){
			//Every instance of this component will set it's output widget as the current.
			outputWidget = this.view.debugArea;

			//Override kony.print if it has not been overriden already.
			if(typeof realKonyPrint === "undefined") {
				realKonyPrint = kony.print;
				kony.print = fakeKonyPrint;
			}
		},

		bindFilterBox: function(){
			filterWidget = this.view.filterTextBox;
			this.view.filterTextBox.onDone = () => {
				this.view.filterTextBox.text = this.view.filterTextBox.text.trim();
			};
		},

		preShow: function(){
			this.overridePrint();
		},

		postShow: function(){
			this.bindButtons();
			this.toggleButtonSkin(this.view.powerButton);
			this.toggleButtonSkin(this.view.filterButton);
			this.bindFilterBox();
			//this.toggleFiltering();
		},

		constructor: function(/*baseConfig, layoutConfig, pspConfig*/) {
			//Avoid the text being null.
			this.view.debugArea.text = "";
			//Disable typing into the text area.
			this.view.debugArea.setEnabled(false);

			this.view.preShow = this.preShow;
			this.view.postShow = this.postShow;
		},
		//Logic for getters/setters of custom properties
		initGettersSetters: function() {
			defineGetter(this, "printOn", () => {return printOn;});
			defineSetter(this, "printOn", (on) => {printOn = on;});

			defineGetter(this, "filterOn", () => {return filterOn;});
			defineSetter(this, "filterOn", (on) => {filterOn = on;});
		}
	};
});
