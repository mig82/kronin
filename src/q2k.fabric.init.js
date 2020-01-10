const Q = require("./q");
require("./q2k.fabric");

((definition) => {
	/**
	 * Create or re-initialise an instance of the kony SDK.
	 * */
	kony.q2k.fabric.init = definition;
})((appKey, appSecret, serviceUrl, createNew) => {

	return Q.Promise(function(resolve, reject/*, notify*/) {

		var client = createNew ? new kony.sdk() : kony.sdk.getCurrentInstance();
		client.init(appKey, appSecret, serviceUrl, function(/*config*/){
			resolve(client);
		}, function(e){
			reject({message: 'Could not initialize an instance of the Fabric client/sdk for\n\t' +
					`key: ${appKey}\n\t` +
					`secret: ${appSecret.substring(appSecret.length - 4)}` +
					`error: ${JSON.stringify(e)}`
			});
		});
	});
});
