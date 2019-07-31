$KI.geolocation = (function() {
    
    

    var module = {
        getcurrentposition: function(successCallback, errorCalback, positionOptions) {
            $KU.logExecuting('kony.location.getCurrentPosition');
            $KU.logExecutingWithParams('kony.location.getCurrentPosition', successCallback, errorCalback, positionOptions);
            if(navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(successCallback, errorCalback, positionOptions);
            }
            $KU.logExecutingFinished('kony.location.getCurrentPosition');
        },

        watchposition: function(successCallback, errorCalback, positionOptions) {
            $KU.logExecuting('kony.location.watchPosition');
            $KU.logExecutingWithParams('kony.location.watchPosition', successCallback, errorCalback, positionOptions);
            if(navigator.geolocation) {
                $KU.logExecutingFinished('kony.location.watchPosition');
                return(navigator.geolocation.watchPosition(successCallback, errorCalback, positionOptions));
            }
        },

        clearwatch: function(watchid) {
            $KU.logExecuting('kony.location.clearWatch');
            $KU.logExecutingWithParams('kony.location.clearWatch', watchid);
            if(navigator.geolocation) {
                navigator.geolocation.clearWatch(watchid);
            }
            $KU.logExecutingFinished('kony.location.clearWatch');
        }
    };


    return module;
}());
