kony.type = function(arg) {
	$KU.logExecuting('kony.type');
	$KU.logExecutingWithParams('kony.type', arg);
    var result  = $KI.type(arg);

    if (result == "table" || result == "object") {
          result = arg.name == undefined ? result : arg.name;
    }
    $KU.logExecutingFinished('kony.type');
    return result;
};
