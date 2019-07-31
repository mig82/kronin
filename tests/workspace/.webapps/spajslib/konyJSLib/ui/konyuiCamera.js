

kony.ui.Camera = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Camera"));

    kony.ui.Camera.baseConstructor.call(this, bconfig, lconfig, pspconfig);
    this.wType = "Camera";
};

kony.inherits(kony.ui.Camera, kony.ui.Widget);

kony.ui.Camera.prototype.startVideoCapture =
kony.ui.Camera.prototype.stopVideoCapture =
kony.ui.Camera.prototype.takePicture =
kony.ui.Camera.prototype.getSupportedCameraSources =
kony.ui.Camera.prototype.releaseRawBytes =
kony.ui.Camera.prototype.openCamera =
kony.ui.Camera.prototype.closeCamera = function() {
    kony.web.logger("warn", "This Camera method is not supported in SPA");
};