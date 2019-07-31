
kony.ui.Box = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("HBox"));

    kony.ui.Box.baseConstructor.call(this, bconfig, lconfig, pspconfig);
    bconfig.i18n_tabName && (this.i18n_tabname = bconfig.i18n_tabName);

    this.position = pspconfig && pspconfig.position; 

    this.name = "kony.ui.Box";
    this.allboxes = []; 
    if(this.orientation == constants.BOX_LAYOUT_HORIZONTAL)
        this.wType = "HBox";
    else
        this.wType = "VBox";

    var backgroundimage = pspconfig.backgroundimage;
    defineGetter(this, "backgroundimage", function() {
        return backgroundimage;
    });
    defineSetter(this, "backgroundimage", function(val) {
        backgroundimage = val;
        kony.model["updateView"](this, "backgroundimage", val);
    });


};

kony.inherits(kony.ui.Box, kony.ui.ContainerWidget);



kony.ui.Box.prototype.add = function() {
    var widgetarray = [].slice.call(arguments);
    boxWidgetExtendAdd.call(this, widgetarray);
};

kony.ui.Box.prototype.addAt = function(widgetref, index) {
    boxWidgetExtendAddAt.call(this, widgetref, index)
};

kony.ui.Box.prototype.remove = function(widgetref) {
    boxWidgetExtendRemove.call(this, widgetref);
};

kony.ui.Box.prototype.removeAt = function(index) {
    return boxWidgetExtendRemoveAt.call(this, index);
};

kony.ui.Box.prototype.widgets = function() {
    return kony.ui.ContainerWidget.prototype.widgets.call(this);
};

kony.ui.Box.prototype.updateBoxWeight = function(widgetarray) {
    boxWidgetExtendUpdateBoxWeight.call(this, widgetarray);
};
