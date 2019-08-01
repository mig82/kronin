(()=>{

	const OS_ANDROID = "android";
	const OS_IOS = "ios";
	const MOBILE_WEB = "mobile_web";

	var os;
	var deviceInfo = kony.os.deviceInfo();

	//TODO: Break this module into one per function.
	function getOs(){
		//#ifdef iphone
		os = OS_IOS;
		kony.print("ifdef iphone: true");
		//alert("ifdef iphone: true");
		//#endif

		//#ifdef android
		os = OS_ANDROID;
		kony.print("ifdef android: true");
		//alert("ifdef android: true");
		//#endif

		if(typeof os === "undefined"){

			// Mobile web -> kony.os.deviceInfo().name === thinclient.
			var message1 = `kony.os.deviceInfo().name: ${deviceInfo.name}\n` +
				  `kony.os.deviceInfo().osname: ${deviceInfo.osname}`;
			kony.print(message1);
			//alert(message1);
			os = deviceInfo.name /*android*/ ||
				deviceInfo.osname /*iPhone*/;
			if(os === "i-phone" || os === "i-pad"){
				os = OS_IOS;
			}
			else if(os === "thinclient"){
				//TODO:This needs more thought. Web is not really an OS.
				os = MOBILE_WEB;
			}
		}
		var message2 = `os: ${os}`;
		kony.print(message2);
		//alert(message2);
		return os;
	}

	kony.os.getOs = getOs;

	kony.os.isIos = () => {
		return getOs() === OS_IOS;
	}

	kony.os.isAndroid = () => {
		return getOs() === OS_ANDROID;
	}

	kony.os.isWeb = () => {
		//TODO: Determine which other values other than thinclient mean it's a web app -e.g. responsive, PWA, desktop web, etc.
		return getOs() === MOBILE_WEB;
	}
})();
