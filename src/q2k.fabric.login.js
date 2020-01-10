require("./q2k.fabric");

((definition) => {
	/**
	 * Invoke a Fabric identity service to authenticate in a promisy way.
	 * */
	kony.q2k.fabric.login = definition;
})((idServiceName, getProfile, options) => {

	var client = kony.sdk.getCurrentInstance();
	return Q.Promise(function(resolve, reject/*, notify*/) {
		var idp = client.getIdentityService(idServiceName);
		idp.login(options, (/*response*/)=>{ //onSuccess

			idp.getProfile(getProfile,
					(response) => {
						kony.print(`Logged in with profile: ${JSON.stringify(response.user_attributes)}`);
						resolve(response.user_attributes);
					},
					(response)=>{
						kony.print(
							`Failed to fetch profile: ${JSON.stringify(response)}.\n` +
							`Resolving login without a full user profile.`
						);
						resolve(response.user_attributes);
					}
				);
		}, (response)=>{ //onFailure
			kony.print(`Error invoking identity service ${idServiceName}\nerror:${JSON.stringify(response)}`);
			reject(response);
		});
	});
});
