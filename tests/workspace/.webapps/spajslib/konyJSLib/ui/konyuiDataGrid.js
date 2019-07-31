
kony.ui.DataGrid = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("DataGrid"));

    kony.ui.DataGrid.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    this.focusedindex = this.focuseditem = this.selecteditems = this.selectedindices = null;
    this.headerskin = bconfig.headerSkin;
    this.rownormalskin = bconfig.rowNormalSkin;
    this.rowfocusskin = bconfig.rowFocusSkin;
    this.rowalternateskin = bconfig.rowAlternateSkin;
    this.showcolumnheaders = bconfig.showColumnHeaders;
    this.columnheadersconfig = bconfig.columnHeadersConfig;
    this.onrowselected = bconfig.onRowSelected;
    this.ismultiselect = bconfig.isMultiSelect;
    this.gridlinecolor = pspconfig.gridlineColor;
    var data = bconfig.data;
    defineGetter(this, "data", function() {
        return data;
    });

    defineSetter(this, "data", function(val) {
        data = val;
        this.canUpdateUI && $KW[this.wType]["updateView"](this, "data", val);
    });

    this.rowcount = (data && data.length - IndexJL) || 0;

    
    this.wType = "DataGrid";
    this.name = "kony.ui.DataGrid";
    this.canUpdateUI = true;
    var config = bconfig.columnHeadersConfig;
    if(config) {
        var hConfig = [];
        for(var i = 0; i < config.length; i++) {
            var col = {};
            col.columnid = config[i].columnID;
            col.columntype = config[i].columnType;
            col.columnheadertext = config[i].columnHeaderText;
            col.columnheadertemplate = config[i].columnHeaderTemplate;
            col.columndatatemplate = config[i].columnDataTemplate;
            col.columnwidthinpercentage = config[i].columnWidthInPercentage;
            col.columncontentalignment = config[i].columnContentAlignment
            col.columnonclick = config[i].columnOnClick;
            hConfig.push(col);
        }
        this.columnheadersconfig = hConfig;
    }
    this.setGetterSetter();
};

kony.inherits(kony.ui.DataGrid, kony.ui.Widget);

kony.ui.DataGrid.prototype.setGetterSetter = function() {
    defineGetter(this, "rowNormalSkin", function() {
        return this.rownormalskin;
    });

    defineSetter(this, "rowNormalSkin", function(val) {
        var oldvalue = this.rownormalskin;
        this.rownormalskin = val;
        $KW[this.wType]["updateView"](this, "rownormalskin", val, oldvalue);
    });

    defineGetter(this, "headerSkin", function() {
        return this.headerskin;
    });

    defineSetter(this, "headerSkin", function(val) {
        this.headerskin = val;
        $KW[this.wType]["updateView"](this, "headerskin", val);
    });

    defineGetter(this, "isMultiSelect", function() {
        return this.ismultiselect;
    });

    defineSetter(this, "isMultiSelect", function(val) {
        this.ismultiselect = val;
        $KW[this.wType]["updateView"](this, "ismultiselect", val);
    });

    defineGetter(this, "rowFocusSkin", function() {
        return this.rowfocusskin;
    });

    defineSetter(this, "rowFocusSkin", function(val) {
        this.rowfocusskin = val;
    });

    defineGetter(this, "rowAlternateSkin", function() {
        return this.rowalternateskin;
    });

    defineSetter(this, "rowAlternateSkin", function(val) {
        this.rowalternateskin = val;
        $KW[this.wType]["updateView"](this, "rowalternateskin", val);
    });

    defineGetter(this, "showColumnHeaders", function() {
        return this.showcolumnheaders;
    });

    defineSetter(this, "showColumnHeaders", function(val) {
        this.showcolumnheaders = val;
        $KW[this.wType]["updateView"](this, "showcolumnheaders", val);
    });

    defineGetter(this, "columnHeadersConfig", function() {
        return this.columnheadersconfig;
    });

    defineSetter(this, "columnHeadersConfig", function(config) {

        if(config) {
            var hConfig = [];
            for(var i = 0; i < config.length; i++) {
                var col = {};
                col.columnid = config[i].columnid || config[i].columnID;
                col.columntype = config[i].columntype || config[i].columnType;
                col.columnheadertext = config[i].columnheadertext || config[i].columnHeaderText;
                col.columnheadertemplate = config[i].columnheadertemplate || config[i].columnHeaderTemplate;
                col.columndatatemplate = config[i].columndatatemplate || config[i].columnDataTemplate;
                col.columnwidthinpercentage = config[i].columnwidthinpercentage || config[i].columnWidthInPercentage;
                col.columncontentalignment = config[i].columncontentalignment || config[i].columnContentAlignment
                col.columnonclick = config[i].columnonclick || config[i].columnOnClick;
                hConfig.push(col);
            }
            this.columnheadersconfig = hConfig;
        }
        
        $KW[this.wType]["updateView"](this, "columnheadersconfig", config);
    });

    defineGetter(this, "gridlineColor", function() {
        return this.gridlinecolor;
    });

    defineSetter(this, "gridlineColor", function(val) {
        this.gridlinecolor = val;
        $KW[this.wType]["updateView"](this, "gridlinecolor", val);
    });

    defineSetter(this, "onRowSelected", function(val) {
        this.onrowselected = val;
    });

    defineGetter(this, "selectedIndex", function() {
        return this.focusedindex;
    });

    defineGetter(this, "selectedItem", function() {
        return this.focuseditem;
    });

    defineGetter(this, "selectedItems", function() {
        return this.selecteditems;
    });

    defineGetter(this, "selectedIndices", function() {
        return this.selectedindices;
    })

    defineGetter(this, "rowCount", function() {
        return this.rowcount;
    });
};


kony.ui.DataGrid.prototype.applyCellSkin = function(rowindex, columnid, skin) {
    $KW.DataGrid.applyCellSkin(this, rowindex, columnid, skin);
}

kony.ui.DataGrid.prototype.setData = function(dataarray) {
    $KW.DataGrid.setData(this, dataarray);
};

kony.ui.DataGrid.prototype.setDataAt = function(dataobj, index) {
    $KW.DataGrid.setDataAt(this, dataobj, index);
};

kony.ui.DataGrid.prototype.addDataAt = function(dataobj, index) {
    $KW.DataGrid.addDataAt(this, dataobj, index);
};

kony.ui.DataGrid.prototype.addAll = function(dataarray) {
    $KW.DataGrid.addAll(this, dataarray);
};

kony.ui.DataGrid.prototype.removeAt = function(index) {
    $KW.DataGrid.removeAt(this, index);
};

kony.ui.DataGrid.prototype.removeAll = function() {
    $KW.DataGrid.removeAll(this);
};

kony.ui.DataGrid.prototype.selectAllRows = function(flag) {
    $KW.DataGrid.selectAll(this, flag);
};

kony.ui.DataGrid.prototype.setCellDataAt = function(rowIndex, columnID, data) {
    $KW.DataGrid.setCellData(this, rowIndex, columnID, data);
};

kony.ui.DataGrid.prototype.setHeaderCellDataAt = function(columnID, data) {
    $KW.DataGrid.setHeaderCellDataAt(this, columnID, data);
};
