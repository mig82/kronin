//TODO: This entire module needs to be rewritten as a closure or a require module.

//((definition) => {
//	kony.q2k.push.register = definition
//})((username) => {
//
//	function setPushCallbacks() {
//	var callbacks = {
//		onsuccessfulregistration: regSuccess,
//		onfailureregistration: regError,
//		onlinenotification: onlinenotification,
//		offlinenotification: offlinenotification,
//		onsuccessfulderegistration: deregSuccess,
//		onfailurederegistration: deregFailure
//	};
//	kony.push.setCallbacks(callbacks);
//	registerPush();
//	}
//
//	function registerPush() {
//	var config;
//	if (kony.os.deviceInfo().name === "iPad" || kony.os.deviceInfo().name === "iPhone") {
//		config = [0, 1, 2];
//	} else {
//		config = {
//			senderid: "607725285131"
//		};
//	}
//	try {
//		kony.push.register(config);
//	} catch (err) {
//		kony.print(err);
//	}
//	}
//
//	/**
//	* @function
//	*
//	*/
//	function regSuccess(ident) {
//	//   alert("reg success");
//	var info = kony.os.deviceInfo();
//	var deviceID = info.deviceid;
//	var messagingClient = KNYMobileFabric.getMessagingService();
//	if (kony.os.deviceInfo().name === "iPad") {
//		messagingClient.register("ipad", username, ident, username + "@kony.com", registerSubscriberPushCallback, regError);
//	} else if (kony.os.deviceInfo().name === "iPhone") {
//		messagingClient.register("iphone", username, ident, username + "@kony.com", registerSubscriberPushCallback, regError);
//	} else {
//		messagingClient.register("androidgcm", username, ident, username + "@kony.com", registerSubscriberPushCallback, regError);
//	}
//	kony.application.dismissLoadingScreen();
//	}
//
//	function registerSubscriberPushCallback( /*response*/ ) {
//	kony.application.dismissLoadingScreen();
//	}
//
//	function regError(error) {
//	kony.application.dismissLoadingScreen();
//	kony.print("Registration failed due to--" + JSON.stringify(error));
//	}
//
//	function deregSuccess( /*response*/ ) {
//	kony.print("De-registration success");
//	}
//
//	function deregFailure( /*response*/ ) {
//	kony.print("De-registration failure");
//	}
//
//	var promotionPushName = "";
//	var pushTitle = "";
//
//	function onlinenotification(pushMsg) {
//	if (kony.os.deviceInfo().name === "android") {
//		promotionPushName = pushMsg["content"];
//		pushTitle = pushMsg["title"];
//	} else {
//		if (typeof pushMsg.alert === "string") {
//
//			promotionPushName = pushMsg.alert;
//			pushTitle = pushMsg.title;
//		} else {
//			promotionPushName = pushMsg.alert.body;
//			pushTitle = pushMsg.alert.title;
//		}
//	}
//	kony.ui.Alert({
//		message: promotionPushName,
//		alertType: constants.ALERT_TYPE_INFO,
//		alertTitle: pushTitle,
//		yesLabel: "Ok",
//		noLabel: "Cancel",
//		alertHandler: null
//	}, {});
//	}
//
//	function offlinenotification(pushMsg) {
//	if (kony.os.deviceInfo().name === "android") {
//		promotionPushName = pushMsg["content"];
//		pushTitle = pushMsg["title"];
//	} else {
//		if (typeof pushMsg.alert === "string") {
//			promotionPushName = pushMsg.alert;
//		} else {
//			promotionPushName = pushMsg.alert.body;
//			pushTitle = pushMsg.alert.title;
//		}
//	}
//	}
//});
