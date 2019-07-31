
kony.ui.CheckBoxGroup = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("CheckBoxGroup"));

    kony.ui.CheckBoxGroup.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.itemorientation = lconfig.itemOrientation || constants.CHECKBOX_ITEM_ORIENTATION_VERTICAL;

    
    this.wType = "CheckBoxGroup";
    this.name = "kony.ui.CheckBoxGroup";

    this.selectedkeys = bconfig.selectedKeys || null;
    this.selectedkeyvalues = null;

    this.viewtype = pspconfig.viewType || "defaultview";

    this.size = pspconfig.size || 18;
    this.checkedimage = pspconfig.checkedImage || "checkboxselected.png";
    this.uncheckedimage = pspconfig.uncheckedImage || "checkboxnormal.png";

    kony.ui.CheckBoxGroup.prototype.setGetterSetter.call(this);
};

kony.inherits(kony.ui.CheckBoxGroup, kony.ui.GroupWidget);

kony.ui.CheckBoxGroup.prototype.setGetterSetter = function() {
    defineGetter(this, "selectedKeys", function() {
        return this.selectedkeys;
    });
    defineSetter(this, "selectedKeys", function(val) {
        this.selectedkeys = val;
        $KW[this.wType]["updateView"](this, "selectedkeys", val);
    });

    defineGetter(this, "selectedKeyValues", function() {
        return this.selectedkeyvalues;
    });


    defineSetter(this, "viewType", function(val) {
        this.viewtype = val;
        $KW[this.wType]["updateView"](this, "viewtype", val);
    });

    defineGetter(this, "viewType", function() {
        return this.viewtype;
    });

    defineSetter(this, "checkedImage", function(val) {
        this.checkedimage = val;
        $KW[this.wType]["updateView"](this, "checkedimage", val);
    });

    defineGetter(this, "checkedImage", function() {
        return this.checkedimage;
    });

    defineSetter(this, "uncheckedImage", function(val) {
        this.uncheckedimage = val;
        $KW[this.wType]["updateView"](this, "uncheckedimage", val);
    });

    defineGetter(this, "uncheckedImage", function() {
        return this.uncheckedimage;
    });


    defineSetter(this, "dimension", function(val) {
        this.size = val;
        $KW[this.wType]["updateView"](this, "size", val);
    });

    defineGetter(this, "dimension", function() {
        return this.size;
    });


};


kony.ui.ComboBox = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("ComboBox"));

    kony.ui.ComboBox.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.wType = "ComboBox";
    this.name = "kony.ui.ComboBox";
};

kony.inherits(kony.ui.ComboBox, kony.ui.GroupWidget);


kony.ui.ListBox = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("ListBox"));

    kony.ui.ListBox.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    
    this.wType = "ListBox";
    this.name = "kony.ui.ListBox";
    this.selectedkeys = (bconfig.selectedKey && (IndexJL ? [null, bconfig.selectedKey] : [bconfig.selectedKey])) || null;
    this.selectedkeyvalues = null;
    defineGetter(this, "selectedKeys", function() {
        return this.selectedkeys;
    });
    defineSetter(this, "selectedKeys", function(val) {
        this.selectedkeys = val;
        $KW[this.wType]["updateView"](this, "selectedkeys", val);
    });

    defineGetter(this, "selectedKeyValues", function() {
        return this.selectedkeyvalues;
    });
};

kony.inherits(kony.ui.ListBox, kony.ui.GroupWidget);


kony.ui.RadioButtonGroup = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("RadioButtonGroup"));

    kony.ui.RadioButtonGroup.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.itemorientation = lconfig.itemOrientation || constants.RADIOGROUP_ITEM_ORIENTATION_VERTICAL;

    
    this.wType = "RadioButtonGroup";
    this.name = "kony.ui.RadioButtonGroup";

    this.viewtype = pspconfig.viewType || "defaultview";
    this.size = pspconfig.size || 18;
    this.checkedimage = pspconfig.checkedImage || "radiobuttonselected.png";
    this.uncheckedimage = pspconfig.uncheckedImage || "radiobuttonnormal.png";

    kony.ui.RadioButtonGroup.prototype.setGetterSetter.call(this);
};

kony.inherits(kony.ui.RadioButtonGroup, kony.ui.GroupWidget);

kony.ui.RadioButtonGroup.prototype.setGetterSetter = function() {
    defineSetter(this, "viewType", function(val) {
        this.viewtype = val;
        $KW[this.wType]["updateView"](this, "viewtype", val);
    });

    defineGetter(this, "viewType", function() {
        return this.viewtype;
    });

    defineSetter(this, "checkedImage", function(val) {
        this.checkedimage = val;
        $KW[this.wType]["updateView"](this, "checkedimage", val);
    });

    defineGetter(this, "checkedImage", function() {
        return this.checkedimage;
    });

    defineSetter(this, "uncheckedImage", function(val) {
        this.uncheckedimage = val;
        $KW[this.wType]["updateView"](this, "uncheckedimage", val);
    });

    defineGetter(this, "uncheckedImage", function() {
        return this.uncheckedimage;
    });

    defineSetter(this, "dimension", function(val) {
        this.size = val;
        $KW[this.wType]["updateView"](this, "size", val);
    });

    defineGetter(this, "dimension", function() {
        return this.size;
    });



};


kony.ui.PickerView = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("PickerView"));

    kony.ui.PickerView.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    
    this.wType = "PickerView";
    this.name = "kony.ui.PickerView";

    this.onselect = bconfig.onSelect;
    this.setGetterSetter();
};

kony.inherits(kony.ui.PickerView, kony.ui.CheckBoxGroup);


kony.ui.PickerView.prototype.setComponentData = function(compIndex, compData) {
    $KW.PickerView.setcomponentdata(this, compIndex, compData);
};

kony.ui.PickerView.prototype.setSelectedKeyInComponent = function(key, compIndex) {
    $KW.PickerView.setselectedkeyincomponent(this, key, compIndex);
};

kony.ui.PickerView.prototype.setGetterSetter = function() {
    defineGetter(this, "onSelect", function() {
        return this.onselect;
    });

    defineSetter(this, "onSelect", function(val) {
        this.onselect = val;
    });
};
