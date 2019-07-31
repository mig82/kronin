var kony = kony || {};

var constants = constants || {};

kony.defaults = {};
kony.defaults.widget = {};


kony.defaults.merge = function(config1, config2, config3) {
    var merge = {};

    for(x in config1) {
        merge[x] = config1[x];
    }
    for(x in config2) {
        merge[x] = config2[x];
    }
    for(x in config3) {
        merge[x] = config3[x];
    }

    return merge;
};

kony.defaults.getAllDefaults = function(widget) {
    var defaultValues = kony.defaults["widget"][widget];
    
    defaultValues.id = null;
    
    if(defaultValues.data)
        defaultValues.data = null;
    if(defaultValues.masterData)
        defaultValues.masterData = null;
    return defaultValues;
};



kony.defaults.Form2 = function(config1, config2, config3) {
    kony.formDefaults = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Form2 = kony.formDefaults;
};

kony.defaults.Form09ed48c1d517041 = new kony.defaults.Form2({
    "id": "Form2",
    "type": constants.FORM_TYPE_NATIVE,
    "title": null,
    "skin": "slForm",
    "needAppMenu": true,
    "enabledForIdleTimeout": false,
    "addWidgets": null,
    "init": null,
    "preShow": null,
    "postShow": null,
    "onHide": null,
    "onOrientationChange": null,
    "onDestroy": null
}, {
    "displayOrientation": constants.FORM_DISPLAY_ORIENTATION_PORTRAIT,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false
}, {
    "titleBar": true,
    "titleBarSkin": "slTitleBar",
    "titleBarConfig": {
        "renderTitleText": true,
        "titleBarLeftSideView": "button",
        "labelLeftSideView": "Back",
        "titleBarRightSideView": "button",
        "labelRightSideView": "Edit"
    },
    "menuPosition": constants.FORM_MENU_POSITION_AFTER_APPMENU,
    "windowSoftInputMode": constants.FORM_ADJUST_RESIZE,
    "onDeviceBack": null,
    "onDeviceMenu": null,
    "footerOverlap": false,
    "headerOverlap": false,
    "retainScrollPosition": false,
    "inTransitionConfig": {
        "formTransition": "None"
    },
    "outTransitionConfig": {
        "formTransition": "None"
    },
    "configureExtendTop": false,
    "configureExtendBottom": false,
    "configureStatusBarStyle": false,
    "bounces": true
});





kony.defaults.TextArea2 = function(config1, config2, config3) {
    kony.textAreaDefaults = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.TextArea2 = kony.textAreaDefaults;
};

kony.defaults.TextArea0a4bbfc9a405e43 = new kony.defaults.TextArea2({
    "id": "TextArea2",
    "skin": "slTextArea",
    "onDone": null,
    "isVisible": true,
    "text": "Textarea text ",
    "textInputMode": constants.TEXTAREA_INPUT_MODE_ANY,
    "keyBoardStyle": constants.TEXTAREA_KEY_BOARD_STYLE_DEFAULT,
    "secureTextEntry": false,
    "onTextChange": null,
    "autoCapitalize": constants.TEXTAREA_AUTO_CAPITALIZE_NONE,
    "placeholder": null,
    "numberOfVisibleLines": 3
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "contentAlignment": constants.CONTENT_ALIGN_TOP_LEFT,
    "containerWeight": 100,
    "padding": [2, 2, 2, 2],
    "paddingInPixel": false,
    "margin": [2, 2, 2, 2],
    "marginInPixel": false,
    "hExpand": true
}, {
    "onBeginEditing": null,
    "onEndEditing": null
});






kony.defaults.TextBox2 = function(config1, config2, config3) {
    kony.textBoxDefaults = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.TextBox2 = kony.textBoxDefaults;
};

kony.defaults.TextField04aca556080344f = new kony.defaults.TextBox2({
    "id": "TextBox2",
    "skin": "slTextBox",
    "onDone": null,
    "isVisible": true,
    "text": "to verify the text field",
    "textInputMode": constants.TEXTBOX_INPUT_MODE_ANY,
    "keyBoardStyle": constants.TEXTBOX_KEY_BOARD_STYLE_DEFAULT,
    "secureTextEntry": false,
    "onTextChange": null,
    "autoCapitalize": constants.TEXTBOX_AUTO_CAPITALIZE_NONE,
    "placeholder": null
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "contentAlignment": constants.CONTENT_ALIGN_MIDDLE_LEFT,
    "containerWeight": 100,
    "padding": [3, 6, 1, 6],
    "paddingInPixel": false,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "hExpand": true,
    "containerHeightMode": constants.TEXTBOX_FONT_METRICS_DRIVEN_HEIGHT,
    "containerHeight": null
}, {
    "autoFilter": false
});





kony.defaults.Box = function(config1, config2, config3) {
    kony.boxDefaults = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.HBox = kony.boxDefaults;
};

kony.defaults.HBox0bd2902f6e28b48 = new kony.defaults.Box({
    "id": "HBox",
    "skin": "slHbox",
    "onClick": null,
    "isVisible": true,
    "orientation": constants.BOX_LAYOUT_HORIZONTAL,
    "position": constants.BOX_POSITION_AS_NORMAL
}, {
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "percent": true,
    "layoutAlignment": constants.BOX_LAYOUT_ALIGN_FROM_LEFT,
    "widgetAlignment": constants.WIDGET_ALIGN_TOP_LEFT,
    "containerWeight": 100,
    "vExpand": false
}, {});





kony.defaults.Button = function(config1, config2, config3) {
    kony.buttonDefaults = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Button = kony.buttonDefaults;
};


kony.defaults.Button06920f593d51b4c = new kony.defaults.Button({
    "id": "Button",
    "skin": "btnNormal",
    "focusSkin": "btnFocus",
    "onClick": null,
    "isVisible": true,
    "text": "Testthis"
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "contentAlignment": constants.CONTENT_ALIGN_CENTER,
    "containerWeight": 100,
    "padding": [4, 4, 4, 4],
    "paddingInPixel": false,
    "margin": [6, 6, 6, 6],
    "marginInPixel": false,
    "hExpand": true,
    "vExpand": false,
    "displayText": true
}, {});




kony.defaults.CheckBoxGroup = function(config1, config2, config3) {
    kony.checkBoxGroupDefaults = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.CheckBoxGroup = kony.checkBoxGroupDefaults;

}



kony.defaults.CheckBoxGroup0e0355477e5b741 = new kony.defaults.CheckBoxGroup({
    "id": "CheckBoxGroup",
    "skin": "slCheckBoxGroup",
    "onSelection": null,
    "isVisible": true,
    "masterData": [
        ["cbg1", "Checkbox One"],
        ["cbg2", "Checkbox Two"],
        ["cbg3", "Checkbox Three"]
    ],
    "selectedKeys": null,
    "selectedKeyValues": null
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "containerWeight": 100,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "itemOrientation": constants.CHECKBOX_ITEM_ORIENTATION_VERTICAL
}, {});



kony.defaults.ListBox = function(config1, config2, config3) {
    kony.listBoxDefaults = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.ListBox = kony.listBoxDefaults;

}


kony.defaults.ListBox02f4edc04ce8c44 = new kony.defaults.ListBox({
    "id": "ListBox",
    "skin": "slListBox",
    "onSelection": null,
    "isVisible": true,
    "masterData": [
        ["lb1", "Listbox One"],
        ["lb2", "Listbox Two"],
        ["lb3", "Listbox Three"]
    ],
    "selectedKey": "lb1",
    "selectedKeyValue": ["lb1", "Listbox One"],
    "onDone": null
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "contentAlignment": constants.CONTENT_ALIGN_MIDDLE_LEFT,
    "containerWeight": 100,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "hExpand": true,
    "vExpand": false
}, {
    "applySkinsToPopup": true,
    "viewType": constants.LISTBOX_VIEW_TYPE_LISTVIEW,
    "placeholder": null
});





kony.defaults.Label = function(config1, config2, config3) {
    kony.labelDefaults = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Label = kony.labelDefaults;
}


kony.defaults.Label011bd5c1421a849 = new kony.defaults.Label({
    "id": "Label",
    "skin": "lblNormal",
    "text": "Label",
    "isVisible": true
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "contentAlignment": constants.CONTENT_ALIGN_MIDDLE_LEFT,
    "containerWeight": 100,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "margin": [1, 1, 1, 1],
    "marginInPixel": false,
    "hExpand": true,
    "vExpand": false
}, {
    "textCopyable": false
});






kony.defaults.RadioButtonGroup = function(config1, config2, config3) {
    kony.radioButtonGroupDefaults = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.RadioButtonGroup = kony.radioButtonGroupDefaults;

}


kony.defaults.RadioButtonGroup07b5a00f7a5464a = new kony.defaults.RadioButtonGroup({
    "id": "RadioButtonGroup",
    "skin": "slRadioButtonGroup",
    "onSelection": null,
    "isVisible": true,
    "masterData": [
        ["rbg1", "Table view of iTems on Radio button"],
        ["rbg2", "Radiobutton Two"],
        ["rbg3", "Radiobutton Three"]
    ],
    "selectedKey": null,
    "selectedKeyValue": null
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "containerWeight": 100,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "hExpand": true,
    "vExpand": false,
    "itemOrientation": constants.RADIOGROUP_ITEM_ORIENTATION_VERTICAL
}, {});





kony.defaults.SegmentedUI2 = function(config1, config2, config3) {
    kony.segmentedUI2Defaults = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.SegmentedUI2 = kony.segmentedUI2Defaults;
}


kony.defaults.Segment0d6ae5ed6c4e14d = new kony.defaults.SegmentedUI2({
    "id": "SegmentedUI2",
    "rowSkin": "seg2Normal",
    "rowFocusSkin": "seg2Focus",
    "sectionHeaderSkin": "sliPhoneSegmentHeader",
    "widgetDataMap": null,
    "rowTemplate": null,
    "isVisible": true,
    "sectionHeaderTemplate": null,
    "data": null,
    "separatorRequired": true,
    "separatorThickness": 1,
    "separatorColor": "E9E9E900",
    "viewType": constants.SEGUI_VIEW_TYPE_TABLEVIEW,
    "onRowClick": null,
    "screenLevelWidget": false,
    "groupCells": false,
    "retainSelection": false,
    "needPageIndicator": true,
    "pageOnDotImage": "pageOnDot.png",
    "pageOffDotImage": "pageOffDot.png",
    "onSwipe": null,
    "showScrollbars": false,
    "scrollingEvents": {
        "onPull": null,
        "onPush": null,
        "onReachingBegining": null,
        "onReachingEnd": null
    },
    "selectionBehavior": constants.SEGUI_DEFAULT_BEHAVIOR,
    "selectedIndex": null,
    "selectedItems": null,
    "selectedIndices": null
}, {
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "containerWeight": 100
}, {
    "indicator": constants.SEGUI_ROW_SELECT,
    "enableDictionary": false,
    "showProgressIndicator": false,
    "progressIndicatorColor": constants.PROGRESS_INDICATOR_COLOR_WHITE,
    "bounces": true,
    "searchCriteria": constants.SEGUI_SEARCH_CRITERIA_STARTSWITH,
    "editStyle": constants.SEGUI_EDITING_STYLE_NONE,
    "onEditing": null
});





kony.defaults.Browser = function(config1, config2, config3) {
    kony.Browser = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Browser = kony.Browser;
}

kony.defaults.Browser0d2862f0e24a549 = new kony.defaults.Browser({
    "id": "Browser",
    "onSuccess": null,
    "onFailure": null,
    "htmlString": null,
    "screenLevelWidget": false,
    "enableZoom": false,
    "detectTelNumber": true,
    "isVisible": true
}, {
    "containerWeight": 100,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false
}, {});




kony.defaults.Camera = function(config1, config2, config3) {
    kony.Camera = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Camera = kony.Camera;
}

kony.defaults.Camera01313e592e53c4e = new kony.defaults.Camera({
    "id": "Camera",
    "skin": "slCamera",
    "text": "Camera",
    "isVisible": true,
    "onCapture": null
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "contentAlignment": constants.CONTENT_ALIGN_CENTER,
    "containerWeight": 100,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "hExpand": true,
    "vExpand": false
}, {
    "enableOverlay": false,
    "accessMode": constants.CAMERA_IMAGE_ACCESS_MODE_PUBLIC,
    "enablePhotoCropFeature": false,
    "nativeUserInterface": true
});





kony.defaults.HorizontalImageStrip2 = function(config1, config2, config3) {
    kony.HorizontalImageStrip2 = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.HorizontalImageStrip2 = kony.HorizontalImageStrip2;
}


kony.defaults.HStrip0cbc4590b15084f = new kony.defaults.HorizontalImageStrip2({
    "id": "HorizontalImageStrip2",
    "skin": "Borderskin",
    "isVisible": true,
    "selectedIndex": null,
    "data": [
        [{
            "iurl": "imagedrag.png"
        }, {
            "iurl": "imagedrag.png"
        }, {
            "iurl": "imagedrag.png"
        }, {
            "iurl": "imagedrag.png"
        }], "iurl"
    ],
    "selectedItem": null,
    "imageWhileDownloading": null,
    "imageWhenFailed": null,
    "spaceBetweenImages": 0,
    "onSelection": null,
    "viewType": constants.HORIZONTAL_IMAGESTRIP_VIEW_TYPE_STRIPVIEW,
    "viewConfig": {
        "stripviewConfig": {
            "enableScrollBounce": true
        }
    },
    "showArrows": false,
    "showScrollbars": false
}, {
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "referenceWidth": 50,
    "referenceHeight": 50,
    "imageScaleMode": constants.IMAGE_SCALE_MODE_MAINTAIN_ASPECT_RATIO,
    "containerWeight": 100,
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER
}, {});






kony.defaults.ImageGallery2 = function(config1, config2, config3) {
    kony.ImageGallery2 = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.ImageGallery2 = kony.ImageGallery2;
}

kony.defaults.IGallery0995b1ec215b54c = new kony.defaults.ImageGallery2({
    "id": "ImageGallery2",
    "skin": "slImageGallery",
    "isVisible": true,
    "selectedIndex": null,
    "data": [
        [{
            "iurl": "imagedrag.png"
        }, {
            "iurl": "imagedrag.png"
        }, {
            "iurl": "imagedrag.png"
        }, {
            "iurl": "imagedrag.png"
        }, {
            "iurl": "imagedrag.png"
        }, {
            "iurl": "imagedrag.png"
        }, {
            "iurl": "imagedrag.png"
        }, {
            "iurl": "imagedrag.png"
        }, {
            "iurl": "imagedrag.png"
        }], "iurl"
    ],
    "selectedItem": null,
    "imageWhileDownloading": null,
    "imageWhenFailed": null,
    "spaceBetweenImages": 0,
    "onSelection": null
}, {
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "referenceWidth": 50,
    "referenceHeight": 50,
    "imageScaleMode": constants.IMAGE_SCALE_MODE_MAINTAIN_ASPECT_RATIO,
    "containerWeight": 100
}, {});






kony.defaults.Phone = function(config1, config2, config3) {
    kony.Phone = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Phone = kony.Phone;
}

kony.defaults.Phone0e0761018182e43 = new kony.defaults.Phone({
    "id": "Phone",
    "skin": "slPhone",
    "onClick": null,
    "isVisible": true,
    "text": "+91-999-999-8888"
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "contentAlignment": constants.CONTENT_ALIGN_CENTER,
    "containerWeight": 100,
    "padding": [2, 2, 2, 2],
    "paddingInPixel": false,
    "margin": [3, 3, 3, 3],
    "marginInPixel": false,
    "hExpand": true,
    "vExpand": false,
    "displayText": true
}, {

    "glowEffect": false,
    "showProgressIndicator": false

});






kony.defaults.PickerView = function(config1, config2, config3) {
    kony.PickerView = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.PickerView = kony.PickerView;
}

kony.defaults.PickerView0356232459d694c = new kony.defaults.PickerView({
    "id": "PickerView",
    "skin": "slPickerView",
    "masterData": [
        [
            ["y1", "2009"],
            ["y2", "2010"],
            ["y3", "2011"], 40
        ],
        [
            ["m1", "Jan"],
            ["m2", "Feb"],
            ["m3", "Mar"],
            ["m4", "Apr"],
            ["m5", "May"],
            ["m6", "Jun"],
            ["m7", "Jul"], 60
        ]
    ],
    "isVisible": true,
    "onSelection": null,
    "selectedKeyValues": ["2009", "Jan"],
    "selectedKeys": null
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "containerWeight": 100,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "hExpand": true
}, {});





kony.defaults.Switch = function(config1, config2, config3) {
    kony.Switch = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Switch = kony.Switch;
}

kony.defaults.Switch09683e5aca10244 = new kony.defaults.Switch({
    "id": "Switch",
    "skin": "slSwitch",
    "leftSideText": "ON",
    "rightSideText": "OFF",
    "onSlide": null,
    "selectedIndex": 0,
    "isVisible": true
}, {
    "containerWeight": 100,
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false
}, {});





kony.defaults.ScrollBox = function(config1, config2, config3) {
    kony.ScrollBox = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.ScrollBox = kony.ScrollBox;
}

kony.defaults.ScrollBox0445c0945b29641 = new kony.defaults.ScrollBox({
    "id": "ScrollBox",
    "skin": "slScrollBox",
    "isVisible": true,
    "orientation": constants.BOX_LAYOUT_HORIZONTAL,
    "position": constants.BOX_POSITION_AS_NORMAL,
    "showScrollbars": true,
    "scrollingEvents": {
        "onPull": null,
        "onPush": null,
        "onReachingBegining": null,
        "onReachingEnd": null
    },
    "enableScrollByPage": false,
    "scrollDirection": constants.SCROLLBOX_SCROLL_HORIZONTAL
}, {
    "padding": [5, 0, 5, 0],
    "paddingInPixel": false,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "containerWeight": 100,
    "layoutAlignment": constants.BOX_LAYOUT_ALIGN_FROM_LEFT,
    "containerHeight": 30,
    "containerHeightReference": constants.CONTAINER_HEIGHT_BY_FORM_REFERENCE,
    "percent": true
}, {});




kony.defaults.Image2 = function(config1, config2, config3) {
    kony.Image2 = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Image2 = kony.Image2;
}

kony.defaults.Image01ec4259a156040 = new kony.defaults.Image2({
    "id": "Image2",
    "isVisible": true,
    "onDownloadComplete": null,
    "src": "imagedrag.png"
}, {
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "imageScaleMode": constants.IMAGE_SCALE_MODE_MAINTAIN_ASPECT_RATIO,
    "containerWeight": 100,
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER
}, {});





kony.defaults.Line = function(config1, config2, config3) {
    kony.Line = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Line = kony.Line;
}


kony.defaults.Line014280b6840c84d = new kony.defaults.Line({
    "id": "Line",
    "skin": "slLine",
    "isVisible": true
}, {
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "thickness": 1
}, {});






kony.defaults.Link = function(config1, config2, config3) {
    kony.Link = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Link = kony.Link;
}

kony.defaults.Link0b0d8f8c40dc445 = new kony.defaults.Link({
    "id": "Link",
    "skin": "slLink",
    "isVisible": true,
    "text": "Link",
    "onClick": null
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "contentAlignment": constants.CONTENT_ALIGN_CENTER,
    "containerWeight": 100,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "hExpand": true
}, {});





kony.defaults.RichText = function(config1, config2, config3) {
    kony.RichText = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.RichText = kony.RichText;
}

kony.defaults.RichText0af113743c6c049 = new kony.defaults.RichText({
    "id": "RichText",
    "skin": "slRichText",
    "onClick": null,
    "text": "RichText",
    "isVisible": true
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "contentAlignment": constants.CONTENT_ALIGN_MIDDLE_LEFT,
    "containerWeight": 100,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "hExpand": true,
    "vExpand": false
}, {});






kony.defaults.Slider = function(config1, config2, config3) {
    kony.Slider = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Slider = kony.Slider;
}


kony.defaults.Slider054a9c1893eae41 = new kony.defaults.Slider({
    "id": "Slider",
    "min": 0,
    "max": 100,
    "step": 1,
    "selectedValue": 40,
    "onSlide": null,
    "onSelection": null,
    "leftSkin": "konysliderleft",
    "rightSkin": "konysliderright",
    "thumbImage": "slider.png",
    "isVisible": true
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "containerWeight": 100,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "hExpand": true,
    "vExpand": false
}, {
    "thickness": 15
});






kony.defaults.Calendar = function(config1, config2, config3) {
    kony.Calendar = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Calendar = kony.Calendar;
}


kony.defaults.Calendar08566e3be5ea045 = new kony.defaults.Calendar({
    "id": "Calendar",
    "skin": "calNormal",
    "isVisible": true,
    "date": [1, 8, 2014],
    "day": 1,
    "month": 8,
    "year": 2014,
    "hour": 12,
    "minutes": 59,
    "seconds": 59,
    "dateComponents": [1, 8, 2014, 12, 59, 59],
    "dateFormat": "dd/MM/yyyy",
    "formattedDate": "",
    "calendarIcon": "calbtn.png",
    "viewType": constants.CALENDAR_VIEW_TYPE_DEFAULT,
    "onSelection": null
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "contentAlignment": constants.CONTENT_ALIGN_CENTER,
    "containerWeight": 100,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "hExpand": true,
    "vExpand": false
}, {});






kony.defaults.DataGrid = function(config1, config2, config3) {
    kony.DataGrid = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.DataGrid = kony.DataGrid;
}


kony.defaults.DataGrid05af006b031d349 = new kony.defaults.DataGrid({
    "id": "DataGrid",
    "isVisible": true,
    "headerSkin": "slDataGridHead",
    "rowNormalSkin": "slDataGridRow",
    "rowFocusSkin": "slDataGridFocusedRow",
    "rowAlternateSkin": "slDataGridAltRow",
    "showColumnHeaders": true,
    "columnHeadersConfig": [{
        "columnContentAlignment": constants.CONTENT_ALIGN_CENTER,
        "columnHeaderText": "Col 1",
        "columnID": "col1",
        "columnOnClick": null,
        "columnType": constants.DATAGRID_COLUMN_TYPE_TEXT,
        "columnWidthInPercentage": 33,
        "isColumnSortable": false
    }, {
        "columnContentAlignment": constants.CONTENT_ALIGN_CENTER,
        "columnHeaderText": "Col 2",
        "columnID": "col2",
        "columnOnClick": null,
        "columnType": constants.DATAGRID_COLUMN_TYPE_TEXT,
        "columnWidthInPercentage": 34,
        "isColumnSortable": false
    }, {
        "columnContentAlignment": constants.CONTENT_ALIGN_CENTER,
        "columnHeaderText": "Col 3",
        "columnID": "col3",
        "columnOnClick": null,
        "columnType": constants.DATAGRID_COLUMN_TYPE_TEXT,
        "columnWidthInPercentage": 33,
        "isColumnSortable": false
    }, ],
    "onRowSelected": null,
    "isMultiSelect": false,
    "selectedItem": {
        "col1": "RC 41",
        "col2": "RC 42",
        "col3": "RC 43"
    },
    "selectedItems": [{
        "col1": "RC 41",
        "col2": "RC 42",
        "col3": "RC 43"
    }],
    "selectedIndices": [3],
    "selectedIndex": 3,
    "rowCount": 4,
    "data": [{
        "col1": "RC 11",
        "col2": "RC 12",
        "col3": "RC 13"
    }, {
        "col1": "RC 21",
        "col2": "RC 22",
        "col3": "RC 23"
    }, {
        "col1": "RC 31",
        "col2": "RC 32",
        "col3": "RC 33"
    }, {
        "col1": "RC 41",
        "col2": "RC 42",
        "col3": "RC 43"
    }]
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "contentAlignment": constants.CONTENT_ALIGN_CENTER,
    "containerWeight": 100,
    "margin": [0, 0, 0, 0],
    "padding": [4, 4, 4, 4],
    "marginInPixel": false,
    "paddingInPixel": false
}, {
    "gridlineColor": "F4F4F4"
});







kony.defaults.Map = function(config1, config2, config3) {
    kony.Map = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Map = kony.Map;
}

kony.defaults.Map05662dfdfdfa642 = new kony.defaults.Map({
    "id": "Map",
    "provider": constants.MAP_PROVIDER_GOOGLE,
    "defaultPinImage": "pinb.png",
    "isVisible": true,
    "onSelection": null,
    "onPinClick": null,
    "onClick": null,
    "locationData": [{
        "desc": "Phoenix infocity, Gachibowli",
        "lat": "17.447326",
        "lon": "78.371358",
        "name": "KonyLabs(New)"
    }, {
        "desc": "Mindspace, Hitech City",
        "lat": "17.441839",
        "lon": "78.380928",
        "name": "KonyLabs(Old)"
    }, {
        "desc": "Jaihind Enclave, Madhapur",
        "lat": "17.450378",
        "lon": "78.388398",
        "name": "My Residence"
    }],
    "screenLevelWidget": false,
    "calloutWidth": 80
}, {
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "containerWeight": 100
}, {
    "showZoomControl": true,
    "zoomLevel": 15,
    "mode": constants.MAP_VIEW_MODE_NORMAL
});






kony.defaults.TabPane = function(config1, config2, config3) {
    kony.TabPane = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.TabPane = kony.TabPane;
}

kony.defaults.TabPane0d9081410504040 = new kony.defaults.TabPane({
    "id": "TabPane",
    "activeSkin": "tabCanvas",
    "inactiveSkin": "tabCanvasInactive",
    "isVisible": true,
    "viewType": constants.TABPANE_VIEW_TYPE_TABVIEW,
    "viewConfig": {
        "collapsibleViewConfig": {
            "collapsedImage": "",
            "collapsedimage": "",
            "expandedImage": "",
            "expandedimage": "",
            "imagePosition": constants.TABPANE_COLLAPSIBLE_IMAGE_POSITION_RIGHT,
            "imageposition": "right",
            "tabNameAlignment": constants.TABPANE_COLLAPSIBLE_TABNAME_ALIGNMENT_LEFT,
            "tabnamealignment": "left",
            "toggleTabs": false,
            "toggletabs": false
        },
        "collapsibleviewconfig": {
            "collapsedImage": "",
            "collapsedimage": "",
            "expandedImage": "",
            "expandedimage": "",
            "imagePosition": constants.TABPANE_COLLAPSIBLE_IMAGE_POSITION_RIGHT,
            "imageposition": "right",
            "tabNameAlignment": constants.TABPANE_COLLAPSIBLE_TABNAME_ALIGNMENT_LEFT,
            "tabnamealignment": "left",
            "toggleTabs": false,
            "toggletabs": false
        },
        "pageViewConfig": {
            "needPageIndicator": true,
            "pageOffDotImage": "",
            "pageOnDotImage": ""
        },
        "panoramaViewConfig": {
            "panoramaImage": "",
            "panoramaTitle": "",
            "panoramaTitleImage": ""
        },
        "tabViewConfig": {
            "headerPosition": constants.TAB_HEADER_POSITION_TOP,
            "image1": "arrow-left.png",
            "image2": "arrow-right.png"
        },
    },
    "screenLevelWidget": false,
    "activeTabs": [0]
}, {
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "layoutType": constants.CONTAINER_LAYOUT_BOX,
    "containerWeight": 100
}, {
    "tabHeaderHeight": 64
});






kony.defaults.Video = function(config1, config2, config3) {
    kony.Video = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Video = kony.Video;
}

kony.defaults.Video0ec83655440d845 = new kony.defaults.Video({
    "id": "Video",
    "isVisible": true,
    "skin": "slVideo",
    "text": "Video"
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "containerWeight": 100,
    "margin": [0, 0, 0, 0],
    "padding": [0, 0, 0, 0],
    "marginInPixel": false,
    "paddingInPixel": false
}, {
    "controls": true,
    "poster": "defvideoposter.png"
});




kony.defaults.ComboBox = function(config1, config2, config3) {
    kony.ComboBox = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.ComboBox = kony.ComboBox;
}

kony.defaults.ComboBox08a335260d2e546 = new kony.defaults.ComboBox({
    "id": "ComboBox",
    "skin": "slComboBox",
    "onSelection": null,
    "isVisible": true,
    "masterData": [
        ["cb1", "Combobox One"],
        ["cb2", "Combobox Two"],
        ["cb3", "Combobox Three"]
    ],
    "selectedKey": null,
    "selectedKeyValue": null
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_CENTER,
    "contentAlignment": constants.CONTENT_ALIGN_MIDDLE_LEFT,
    "containerWeight": 100,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false,
    "margin": [0, 0, 0, 0],
    "marginInPixel": false,
    "hExpand": true,
    "vExpand": false
}, {
    "viewType": constants.COMBOBOX_VIEW_TYPE_LISTVIEW,
    "viewConfig": {
        "toggleViewConfig": {
            "viewStyle": constants.COMBOBOX_TOGGLE_VIEW_STYLE_PLAIN
        }
    },
    "groupCells": false
});





kony.defaults.Popup = function(config1, config2, config3) {
    kony.Popup = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.Popup = kony.Popup;
}

kony.defaults.MyPopup08a335360d4e546 = new kony.defaults.Popup({
    "id": "MyPopup",
    "skin": "slPopup",
    "title": null,
    "addWidgets": null,
    "init": null,
    "isVisible": true,
    "isModal": false,
    "transparencyBehindThePopup": 100,
    "onHide": null
}, {
    "containerWeight": 80,
    "padding": [0, 0, 0, 0],
    "paddingInPixel": false
}, {
    "inTransitionConfig": {
        "popupTransition": "None"
    },
    "outTransitionConfig": {
        "popupTransition": "None"
    }
});





kony.defaults.FlexContainer = function(config1, config2, config3) {
    kony.FlexContainer = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.FlexContainer = kony.FlexContainer;
}


kony.defaults.FlexContainer08a3676260d2e546 = new kony.defaults.FlexContainer({
    "id": "FlexContainer",
    "isVisible": true,
    "skin": "slFbox",
    "layoutType": kony.flex.FREE_FORM,
    "clipBounds": true,
    "onSwipe": null
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_TOP_LEFT,
    "containerWeight": 100,
    "padding": [0, 0, 0, 0],
    "hExpand": true,
    "vExpand": false,
    "layoutType": kony.flex.FREE_FORM
}, {});






kony.defaults.FlexScrollContainer = function(config1, config2, config3) {
    kony.FlexScrollContainer = kony.defaults.merge(config1, config2, config3);
    kony.defaults.widget.FlexScrollContainer = kony.FlexScrollContainer;
}


kony.defaults.FlexScroll08a3353460d2e546 = new kony.defaults.FlexScrollContainer({
    "id": "FlexScrollContainer",
    "isVisible": true,
    "skin": "slFSbox",
    "enableScrolling": true,
    "scrollDirection": kony.flex.SCROLL_HORIZONTAL,
    "horizontalScrollIndicator": true,
    "verticalScrollIndicator": true,
    "left": "159dp",
    "top": "215dp",
    "width": "150dp",
    "height": "200dp",
    "zIndex": 1,
    "layoutType": kony.flex.FREE_FORM,
    "clipBounds": true,
    "bounces": true,
    "allowHorizontalBounce": true,
    "allowVerticalBounce": true,
    "onSwipe": null
}, {
    "widgetAlignment": constants.WIDGET_ALIGN_TOP_LEFT,
    "containerWeight": 100,
    "padding": [0, 0, 0, 0],
    "hExpand": true,
    "vExpand": false,
    "layoutType": kony.flex.FREE_FORM
}, {});


