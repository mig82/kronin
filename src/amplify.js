(function(undefined) {

	var slice = [].slice,
		subscriptions = {};

	var duplicatesAllowed = false;

	function getFunctionBody(func){
		var funcString = func.toString();
		var funcBody = funcString.substring(funcString.indexOf("{"));
		//funcBody = funcBody.replace(/\n/g, '').replace(/\s{2}/g, ' ');
		return funcBody;
	}

	function equalsFunction(f1, f2){
		//If both are named functions.
		if(f1.name && f2.name){
			return f1 === f2;
		}
		//If both are unnamed functions.
		else if (!f1.name && !f2.name){
			return getFunctionBody(f1) === getFunctionBody(f2);
		}
	}

	/**
	 * A pub/sub mechanism taken and adapted from the core module of the
	 * AmplifyJS library.<br>
	 * It allows for total decoupling of event publishers and event subscribers,
	 * and it's particularly useful if events from a single component or module
	 * need to be communicated to several others in the application.
	 * Read more at https://amplifyjs.com/api/pubsub/
	 * */
	kony.amplify = {

		allowDuplicates: function(allow){
			duplicatesAllowed = allow;
		},

		getSubscriptions: function(topic){
			//Generate a read-only copy of the subscriptions.
			return JSON.parse(JSON.stringify(subscriptions[ topic ]));
		},

		isSubscribed: function (topic, callback){
			var found = false;
			for (var i = subscriptions[ topic ].length - 1; i >= 0 ; i--) {

				if(equalsFunction(subscriptions[ topic ][i].callback, callback)){
					found = true;
					break;
				}
			}
			return found;
		},

		publish: function( topic ) {
			if ( typeof topic !== "string" ) {
				throw new Error( "You must provide a valid topic to publish." );
			}

			var args = slice.call( arguments, 1 ),
				topicSubscriptions,
				subscription,
				length,
				i = 0,
				ret;

			if ( !subscriptions[ topic ] ) {
				return true;
			}

			topicSubscriptions = subscriptions[ topic ].slice();
			for ( length = topicSubscriptions.length; i < length; i++ ) {
				subscription = topicSubscriptions[ i ];
				ret = subscription.callback.apply( subscription.context, args );
				if ( ret === false ) {
					break;
				}
			}
			return ret !== false;
		},

		subscribe: function( topic, context, callback, priority ) {
			if ( typeof topic !== "string" ) {
				throw new Error( "You must provide a valid topic to create a subscription." );
			}

			if ( arguments.length === 3 && typeof callback === "number" ) {
				priority = callback;
				callback = context;
				context = null;
			}
			if ( arguments.length === 2 ) {
				callback = context;
				context = null;
			}
			priority = priority || 10;

			var topicIndex = 0,
				topics = topic.split( /\s/ ),
				topicLength = topics.length,
				added;
			for ( ; topicIndex < topicLength; topicIndex++ ) {
				topic = topics[ topicIndex ];
				added = false;
				if ( !subscriptions[ topic ] ) {
					subscriptions[ topic ] = [];
				}

				if(duplicatesAllowed || !this.isSubscribed(topic, callback)){
					var i = subscriptions[ topic ].length - 1,
						subscriptionInfo = {
							callback: callback,
							context: context,
							priority: priority
						};

					for ( ; i >= 0; i-- ) {
						if ( subscriptions[ topic ][ i ].priority <= priority ) {
							subscriptions[ topic ].splice( i + 1, 0, subscriptionInfo );
							added = true;
							break;
						}
					}

					if ( !added ) {
						subscriptions[ topic ].unshift( subscriptionInfo );
					}
				}
			}

			return callback;
		},

		unsubscribe: function( topic, context, callback ) {
			if ( typeof topic !== "string" ) {
				throw new Error( "You must provide a valid topic to remove a subscription." );
			}

			if ( arguments.length === 2 ) {
				callback = context;
				context = null;
			}

			if ( !subscriptions[ topic ] ) {
				return;
			}

			var length = subscriptions[ topic ].length,
				i = 0;

			for ( ; i < length; i++ ) {
				if ( subscriptions[ topic ][ i ].callback === callback ) {
					if ( !context || subscriptions[ topic ][ i ].context === context ) {
						subscriptions[ topic ].splice( i, 1 );

						// Adjust counter and length for removed item
						i--;
						length--;
					}
				}
			}
		}
	};
}());
