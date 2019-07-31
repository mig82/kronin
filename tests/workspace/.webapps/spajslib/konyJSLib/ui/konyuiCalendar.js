
kony.ui.Calendar = function(bconfig, lconfig, pspconfig) {
    if(arguments.length < 3)
        bconfig = lconfig = pspconfig = $KU.mergeDefaults(bconfig, $KU.getAllDefaults("Calendar"));

    kony.ui.Calendar.baseConstructor.call(this, bconfig, lconfig, pspconfig);

    
    this.wType = "Calendar";
    this.name = "kony.ui.Calendar";
    this.datecomponents = bconfig.dateComponents || [];
    this.dateformat = this.format = bconfig.dateFormat || constants.CALENDAR_DATE_FORMAT_DEFAULT;
    this.formatteddate = this.date; 
    this.validstartdate = bconfig.validStartDate;
    this.validenddate = bconfig.validEndDate;
    this.viewtype = this.advview = bconfig.viewType || constants.CALENDAR_VIEW_TYPE_DEFAULT;
    this.viewconfig = bconfig.viewConfig;
    this.calendaricon = this.Image = bconfig.calendarIcon;
    this.onselection = bconfig.onSelection;
    this.titleonpopup = this.title = pspconfig.titleOnPopup;
    this.noofmonths = pspconfig.noOfMonths || pspconfig.noofmonths || 1;
    this.dateeditable = true;
    this.calimgheight = pspconfig.calImgHeight;
    this.gridtheme = pspconfig.gridTheme;
    this.celltemplate = pspconfig.cellTemplate;
    this.widgetdatamapforcell = pspconfig.widgetDataMapForCell;

    var data = pspconfig.data;
    defineGetter(this, "data", function() {
        return data;
    });
    defineSetter(this, "data", function(val) {
        data = val;
        this.canUpdateUI && $KW[this.wType]["updateView"](this, "data", val);
    });

    defineGetter(this, "widgetDataMapForCell", function() {
        return this.widgetdatamapforcell;
    });
    defineSetter(this, "widgetDataMapForCell", function(val) {
        this.widgetdatamapforcell = val;
    });
    defineGetter(this, "calImgHeight", function() {
        return this.calimgheight;
    });
    defineSetter(this, "calImgHeight", function(val) {
        this.calimgheight = val;
    });

    var placeholder = bconfig.placeholder;
    defineGetter(this, "placeholder", function() {
        return placeholder;
    });

    defineSetter(this, "placeholder", function(val) {
        placeholder = val;
        this.canUpdateUI && $KW[this.wType]["updateView"](this, "placeholder", val);
    });

    defineGetter(this, "dateEditable", function() {
        return this.dateeditable;
    });

    defineSetter(this, "dateEditable", function(val) {
        if(!val == true || !!val == true) {
            this.dateeditable = val;
            this.canUpdateUI && $KW[this.wType]["updateView"](this, "dateeditable", val);
        }
    });

    defineGetter(this, "gridTheme", function() {
        return this.gridtheme;
    });

    defineSetter(this, "gridTheme", function(val) {
        var oldValue = this.gridtheme;
        if(oldValue !== val) {
            this.gridtheme = val;
            this.canUpdateUI && $KW[this.wType]["updateView"](this, "gridtheme", val);
        }
    });

    this.selectiontype = pspconfig.selectionType;
    defineGetter(this, "selectionType", function() {
        return this.selectiontype;
    });

    defineSetter(this, "selectionType", function(val) {
        var oldValue = this.selectiontype;
        if(oldValue !== val) {
            this.selectiontype = val;
            this.canUpdateUI && $KW[this.wType]["updateView"](this, "selectiontype", val);
        }
    });

    this.selecteddates = bconfig.selectedDates;
    defineGetter(this, "selectedDates", function() {
        return this.selecteddates;
    });

    defineSetter(this, "selectedDates", function(val) {
        var oldValue = this.selecteddates,
            isValidDateSet;
        if($KW.Calendar.isMultiRangeCalendar(this) &&
            !$KU.equals(oldValue, val)) {
            isValidDateSet = $KW.Calendar.isSelectedDatesValid(this, val);
            if(isValidDateSet) {
                this.selecteddates = $KW.Calendar.setTimeInDateComponents(val);
                this.canUpdateUI && $KW[this.wType]["updateView"](this, "selecteddates", val);
            } else {
                kony.web.logger("error", "Invalid date selection");
            }
        }
    });


    var date = bconfig.date;
    defineGetter(this, "date", function() {
        if($KW.Calendar.isMultiRangeCalendar(this)) {
            return;
        }
        $KW.Calendar.updateCalDOMNode(this);
        if(this.formatteddate) {
            return this.formatteddate;
        } else {
            return null;
        }
    });

    defineSetter(this, "date", function(val) {
        if($KW.Calendar.isMultiRangeCalendar(this)) {
            return;
        }
        this.Date = val;
        if(!val || !val.length) {
            return false;
        }
        if(typeof val == "string") {
            var dEY = $KW.Calendar.getDat(val, this);
        } else {
            var dEY = {
                dd: val[0],
                mm: val[1],
                yyyy: val[2]
            };
        }
        if(val && val.length) {
            this.day = dEY.dd;
            this.month = dEY.mm;
            this.year = dEY.yyyy || dEY.yy;

            if(!this.datecomponents) {
                this.datecomponents = [];
            }

            this.datecomponents[0] = dEY.dd;
            this.datecomponents[1] = dEY.mm;
            this.datecomponents[2] = dEY.yyyy || dEY.yy;
            this.datecomponents[3] = 0;
            this.datecomponents[4] = 0;
            this.datecomponents[5] = 0;
        } else {
            this.day = this.month = this.year = null;
        }
        this.hour = this.minutes = this.seconds = 0;
        this.canUpdateUI && $KW[this.wType]["updateView"](this, "date", val);
    });
    this.showcurrentdate = pspconfig.showCurrentDate;
    this.setGetterSetter();
};

kony.inherits(kony.ui.Calendar, kony.ui.Widget);

kony.ui.Calendar.prototype.setGetterSetter = function() {
    defineGetter(this, "titleOnPopup", function() {
        return this.title;
    });
    defineSetter(this, "titleOnPopup", function(val) {
        this.titleonpopup = this.title = val;
    });

    defineGetter(this, "onSelection", function() {
        return this.onselection;
    });
    defineSetter(this, "onSelection", function(val) {
        this.onselection = val;
    });

    defineGetter(this, "calendarIcon", function() {
        return this.calendaricon;
    });
    defineSetter(this, "calendarIcon", function(val) {
        this.calendaricon = this.Image = val;
        $KW[this.wType]["updateView"](this, "calendaricon", val);
    });

    defineGetter(this, "viewConfig", function() {
        return this.viewconfig;
    });
    defineSetter(this, "viewConfig", function(val) {
        this.viewconfig = val;
        $KW[this.wType]["updateView"](this, "viewconfig", val);
    });

    defineGetter(this, "viewType", function() {
        return this.advview;
    });
    defineSetter(this, "viewType", function(val) {
        this.advview = val;
        $KW[this.wType]["updateView"](this, "viewtype", val);
    });

    defineGetter(this, "validEndDate", function() {
        return this.validenddate;
    });
    defineSetter(this, "validEndDate", function(val) {
        this.validenddate = val;
        $KW[this.wType]["updateView"](this, "validenddate", val);
    });

    defineGetter(this, "validStartDate", function() {
        return this.validstartdate;
    });
    defineSetter(this, "validStartDate", function(val) {
        this.validstartdate = val;
        $KW[this.wType]["updateView"](this, "validstartdate", val);
    });

    defineGetter(this, "dateFormat", function() {
        return this.format;
    });
    defineSetter(this, "dateFormat", function(val) {
        var oldval = this.dateformat;
        this.dateformat = this.format = val;
        $KW[this.wType]["updateView"](this, "dateformat", val);
        if(this.placeholder == oldval) {
            $KW[this.wType]["updateView"](this, "placeholder", val);
        } else {
            $KW[this.wType]["updateView"](this, "placeholder", this.placeholder || val);
        }
    });

    defineGetter(this, "dateComponents", function() {
        if($KW.Calendar.isMultiRangeCalendar(this)) {
            return;
        }
        if(this.hour === undefined) {
            this.hour = this.datecomponents[3];
        }
        if(this.minutes === undefined) {
            this.minutes = this.datecomponents[4];
        }
        if(this.seconds === undefined) {
            this.seconds = this.datecomponents[5];
        }
        return [this.day, this.month, this.year, this.hour, this.minutes, this.seconds];
    });
    defineSetter(this, "dateComponents", function(val) {
        if($KW.Calendar.isMultiRangeCalendar(this)) {
            return;
        }
        this.datecomponents = this.date = val.slice(0, 3);
        $KW[this.wType]["updateView"](this, "datecomponents", val);
    });

    defineGetter(this, "formattedDate", function() {
        $KW.Calendar.updateCalDOMNode(this);
        return this.formatteddate;
    });

    defineSetter(this, "showCurrentDate", function(val) {
        this.showcurrentdate = val;
    });

    defineGetter(this, "showCurrentDate", function() {
        return this.showcurrentdate;
    });
};


kony.ui.Calendar.prototype.setEnabled = function(dates, skin, enable) {
    if(typeof dates == "boolean") { 
        $KW.APIUtils.setenabled(this, dates);
        return false;
    } else {
        $KW.Calendar.setEnabled(this, dates, 0, skin, enable);
    }
};

kony.ui.Calendar.prototype.displayedMonth = function(month, year) {
    $KW.Calendar.displayedMonth(this, month, year);
};
kony.ui.Calendar.prototype.navigateToPreviousMonth = function() {
    $KW.Calendar.navigateToPreviousMonth(this);
};
kony.ui.Calendar.prototype.navigateToNextMonth = function() {
    $KW.Calendar.navigateToNextMonth(this);
};

kony.ui.Calendar.prototype.enableRangeOfDates = function(startdate, enddate, skin, enable) {
    $KW.Calendar.setEnabled(this, startdate, enddate, skin, enable);
};

kony.ui.Calendar.prototype.setEnableAll = function() {
    $KW.Calendar.setEnableAll(this);
};

kony.ui.Calendar.prototype.setDatesSkin = function(dates, skin) {
    $KW.Calendar.setDateSkin(this, dates, skin, true);
};

kony.ui.Calendar.prototype.clear = function() {
    $KW.Calendar.clear(this)
};

kony.ui.Calendar.prototype.open = function() {
    $KW.Calendar.open(this);
};

kony.ui.Calendar.prototype.dismiss = function() {
    $KW.Calendar.dismiss(this);
};

kony.ui.Calendar.prototype.setContext = function(context) {
    $KW.Calendar.setcontext(this, context);
};

kony.ui.Calendar.prototype.clearAppointments =
kony.ui.Calendar.prototype.clearData =
kony.ui.Calendar.prototype.deleteAppointments =
kony.ui.Calendar.prototype.getAppointments =
kony.ui.Calendar.prototype.modifyAppointment =
kony.ui.Calendar.prototype.removeDataAt =
kony.ui.Calendar.prototype.setData =
kony.ui.Calendar.prototype.setDataAt =
kony.ui.Calendar.prototype.switchToDate = function() {
    kony.web.logger("warn", "This Calendar method is not supported in SPA");
};
