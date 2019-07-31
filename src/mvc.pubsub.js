((defintion) => {
	kony.PubSub = definition;
})(() => {
	function PubSub(){
		var subscriptions = {};
	}

	PubSub.prototype.subscribe = (topic, listener) => {
		// Create the array for the subscribers of a topic if it has not been created yet.
		if ( !subscriptions[ topic ] ) {
			//subscriptions[ topic ] = [];
			subscriptions[ topic ] = new Set();
		}

		// Add the listener to queue
		var index = subscriptions[topic].push(listener) -1;
		//alert(`Topic: ${topic}\nCount: ${subscriptions[topic].length}`);
		alert(`Topic: ${topic}\nCount: ${subscriptions[topic].size}`);

		// Provide handle back for removal of topic
		return {
			remove: () => {
				//delete subscriptions[topic][index];
				subscriptions[topic].delete(listener);
			}
		};
	};

	PubSub.prototype.publish = (topic /*, ...*/) => {
		// If the topic doesn't exist, or there's no listeners in queue, just leave
		if ( !subscriptions[ topic ] ) { return; }

		//Convert all remaining arguments besides topic into an array.
		var args = slice.call( arguments, 1 );

		// Cycle through subscriptions queue, fire!
		subscriptions[topic].forEach((listener) => {
			listener(info !== undefined ? info : {});
		});
	};

	return PubSub;
})
