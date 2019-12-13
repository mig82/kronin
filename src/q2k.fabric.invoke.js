require("./q2k.fabric");

function invoke(client, serviceName, operationName, headers, data, options){

	return Q.Promise(function(resolve, reject/*, notify*/) {

		function onSuccess(response){
			if(response.opstatus === 0 || response.opstatus === "0"){
				resolve(response);
			}
			else{
				reject(response);
			}
		}

		function onFailure(error){
			reject(error);
		}

		try{
			var service = client.getIntegrationService(serviceName);
			service.invokeOperation(operationName, headers, data, onSuccess, onFailure, options);
		}
		catch(e){
			var errorMsg = e.details.errmsg;
			if (errorMsg.indexOf('Invalid session') >= 0 || errorMsg.indexOf('session expired') >= 0) {
				reject(e);
			}
			else{
				reject(new Error(`Could not find or call ${serviceName}.${operationName}:\n\t${e}`));
			}
		}
	});
}
