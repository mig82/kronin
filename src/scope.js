function watchViewCallback(binding, widExp, widgetValue){
	kony.print("Updating "+binding.model+" with "+binding.wid+" with value "+widgetValue);
	this.$eval(binding.model + "=" + widExp);
}

function watchModelCallback(binding, modelValue){
	kony.print("Updating "+binding.wid+" with "+binding.model+" with value "+modelValue);
	this[binding.wid][binding.value] = modelValue;
}

var Scope = (function(){

	var scopeCount = 0;

	//var Scope = function(form){
	var Scope = function(){
		this.$id = "digest-" + scopeCount;
		this.$$watchers = [];
		scopeCount++;
		//ScopeHelper.bindScopeToForm(this, form, form);
	}

	Scope.prototype.$eval = function(exp) {
		var val;
		if (typeof exp === 'function'){
			val = exp.call(this);
		}
		else{
			try{
				with(this){
					val = eval(exp);
				}
			}
			catch(err){
				val = undefined;
			}
		}
		return val;
	};

	Scope.prototype.$watch = function(exp, fn){
		this.$$watchers.push({
			exp: exp,
			fn: fn,
			last: _.clone(this.$eval(exp), true)
		});
	};

	//Binds the values of UI components to the underlying models. A substitute for the declarative ng-model directives in AngularJs.
	Scope.prototype.$bind = function(form, bindings){
		var b;
		for(var k = 0; k < bindings.length; k++){
			b = bindings[k];

			//Makes sure the scope has a ref to the observed widget in order to evaluate expressions that use it.
			this[b.wid] = form[b.wid];

			//Listen for changes to the View and notify Model.
			var widExp = b.wid + "." + b.value;
			var boundWatchViewCallback = watchViewCallback.bind(this, b, widExp);
			this.$watch(widExp, boundWatchViewCallback);

			//Listen for changes to the Model and notify the View.
			var boundWatchModelCallback = watchModelCallback.bind(this, b);
			this.$watch(b.model, boundWatchModelCallback);

			//Finally, make sure digest is triggered for relevant event in the observed widget.
			this[b.wid][b.trigger] = function(widget){
				this.$digest();
			}.bind(this) //Execute event handler in the context of the scope instance, not the widget.
		}
	};

	Scope.prototype.$digest = function () {
		var dirty, watcher, current, i;
		do{
			dirty = false;
			for (i = 0; i < this.$$watchers.length; i += 1) {
				watcher = this.$$watchers[i];
				current = this.$eval(watcher.exp);

				if (!_.isEqual(watcher.last, current)) {
					var old = watcher.last;
					watcher.last = _.clone(current, true);
					dirty = true;
					watcher.fn(current, old);
				}
			}
		} while(dirty);
	};

	Scope.prototype.$destroy = function(){
		this.$$watchers = [];
	}

	return Scope;
})();
