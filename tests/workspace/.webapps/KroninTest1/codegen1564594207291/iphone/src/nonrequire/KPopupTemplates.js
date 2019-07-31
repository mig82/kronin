var flxMainAV;
var flxExitAppAV;
var flxExitAppAVNew;
var platformName = (kony.os.deviceInfo().name).toLowerCase();

function addWidgets_flexContainer() {
    flxMainAV = new kony.ui.FlexContainer({
        "autogrowMode": kony.flex.AUTOGROW_NONE,
        "clipBounds": true,
        "height": "100%",
        "id": "flxMainAV",
        "isVisible": true,
		"bounces": false,
		"isModalContainer": true,
		 "blur": {
                "enabled": true,
                 "value": 0
                },
        "layoutType": kony.flex.FREE_FORM,
        "left": "0dp",
        "skin": "sknFlxMainAv",
        "top": "0dp",
        "width": "100%",
        "zIndex": 1
    }, {}, {});
    flxMainAV.setDefaultUnit(kony.flex.DP);
    var flxNoteAV = new kony.ui.FlexContainer({
        "autogrowMode": kony.flex.AUTOGROW_NONE,
        "clipBounds": true,
        "height": "38%",
        "id": "flxNoteAV",
        "isVisible": true,
        "layoutType": kony.flex.FLOW_VERTICAL,
        "left": "0dp",
        "skin": "sknFlxNoteAV",
        "width": "100%",
        "top": "62%",
        "zIndex": 100
    }, {}, {});
    flxNoteAV.setDefaultUnit(kony.flex.DP);
    var flxSCNoteAV = new kony.ui.FlexContainer({
        "bounces": false,
        "clipBounds": true,
        "height": "100%",
        "id": "flxSCNoteAV",
        "isVisible": true,
		"IsModalContainer": true,
        "layoutType": kony.flex.FREE_FORM,
        "left": "0dp",
        "skin": "sknFlxSCNoteAV",
        "bottom": "1%",
        "width": "100%",
        "zIndex": 100
    }, {}, {});
    flxSCNoteAV.setDefaultUnit(kony.flex.DP);
	var flxNoteHeader = new kony.ui.FlexContainer({
        "autogrowMode": kony.flex.AUTOGROW_NONE,
        "clipBounds": true,
        "height": "12%",
        "id": "flxNoteHeader",
        "isVisible": true,
        "layoutType": kony.flex.FREE_FORM,
        "left": "0dp",
        "skin": "sknFlxHeaderBG3D6E92OP11",
        "top": "0dp",
        "width": "100%",
        "zIndex": 10
    }, {}, {});
    flxNoteHeader.setDefaultUnit(kony.flex.DP);
    var lblNoteHdrAV = new kony.ui.Label({
        "centerY": "50%",
        "id": "lblNoteHdrAV",
        "isVisible": true,
        "left": "5%",
        "skin": "sknLblNoteHeader",
        "text": "NOTES",
        "textStyle": {
            "letterSpacing": 0,
            "strikeThrough": false
        },
        "width": kony.flex.USE_PREFFERED_SIZE,
        "height": kony.flex.USE_PREFFERED_SIZE,
        "zIndex": 100
    }, {
        "contentAlignment": constants.CONTENT_ALIGN_MIDDLE_LEFT,
        "padding": [0, 0, 0, 0],
        "paddingInPixel": false
    }, {
        "textCopyable": false
    });
	
	var right_dp;
	if(platformName == "iphone" || platformName == "android") {
		right_dp = "45dp";
	}
	else {
		right_dp = "55dp";
	}
    var btnNoteCloseAV = new kony.ui.Button({
        "centerY": "50.00%",
        "focusSkin": "sknBtnNoteCloseAV",
        "height": "18dp",
        "id": "btnNoteCloseAV",
        "isVisible": true,
        "onTouchStart": btnCloseCallBack,
        "right": "2.7%",
        "skin": "sknBtnNoteCloseAV",
        "top": "0dp",
        "width": "18dp",
        "zIndex": 1
    }, {
        "contentAlignment": constants.CONTENT_ALIGN_CENTER,
        "displayText": true,
        "padding": [0, 0, 0, 0],
        "paddingInPixel": false
    }, {
        "showProgressIndicator": true
    });

    var btnUpArrowNoteAV = new kony.ui.Button({
        "centerY": "50%",
        "focusSkin": "sknBtnNotesUPAV",
        "height": "18dp",
        "id": "btnUpArrowNoteAV",
        "isVisible": true,
        "onTouchStart": btnUpArrowCallBack,
        "skin": "sknBtnNotesUPAV",
        "top": "0dp",
        "width": "18dp",
		"right": right_dp,
        "zIndex": 1
    }, {
        "contentAlignment": constants.CONTENT_ALIGN_CENTER,
        "displayText": true,
        "padding": [0, 0, 0, 0],
        "paddingInPixel": false
    }, {
        "showProgressIndicator": true
    });
    var btnDownArrowNoteAV = new kony.ui.Button({
        "centerY": "50%",
        "focusSkin": "dynSkinDownAV",
        "height": "16dp",
        "id": "btnDownArrowNoteAV",
        "isVisible": false,
        "onTouchStart": btnDownArrowCallBack,
        "skin": "dynSkinDownAV",
        "top": "0dp",
        "width": "18dp",
		"right": right_dp,
        "zIndex": 1
    }, {
        "contentAlignment": constants.CONTENT_ALIGN_CENTER,
        "displayText": true,
        "padding": [0, 0, 0, 0],
        "paddingInPixel": false
    }, {
        "showProgressIndicator": true
    });
    flxNoteHeader.add(lblNoteHdrAV, btnNoteCloseAV, btnUpArrowNoteAV, btnDownArrowNoteAV);
       	
    var richtxtNoteAV = new kony.ui.RichText({
        "id": "richtxtNoteAV",
        "isVisible": true,
        "left": "0%",
        "linkSkin": "defRichTextLink",
        "skin": "SknRchTxt37414BSFPROReg",
        "text": "RichText",
        "top": "10px",
        "width": "100%",
        "zIndex": 1
    }, {
        "contentAlignment": constants.CONTENT_ALIGN_MIDDLE_LEFT,
        "padding": [5, 0, 0, 0],
        "paddingInPixel": false,
        "widgetAlignment": constants.WIDGET_ALIGN_CENTER
    }, {
        "wrapping": constants.WIDGET_TEXT_WORD_WRAP
    });
    
    var flxSegNoteAV = new kony.ui.FlexContainer({
        "autogrowMode": kony.flex.AUTOGROW_HEIGHT,
        "clipBounds": true,
        "id": "flxSegNoteAV",
        "isVisible": true,
        "layoutType": kony.flex.FLOW_HORIZONTAL,
        "left": "0%",
        "isModalContainer": false,
        "skin": "slFbox",
        "top": "0dp",
		"bottom": "11px",
        "width": "100%",
        "zIndex": 1
    }, {
        "padding": [0, 0, 0, 0]
    }, {});
    
	var lblSegNoteAV = new kony.ui.Label({
        "id": "lblSegNoteAV",
        "isVisible": true,
        "left": "0%",
        "skin": "sknLblName",
        "text": "Label",
        "textStyle": {},
        "top": "0dp",
        "width": kony.flex.USE_PREFFERED_SIZE,
        "zIndex": 1
    }, {
        "contentAlignment": constants.CONTENT_ALIGN_MIDDLE_LEFT,
        "padding": [5, 3, 1, 1],
        "paddingInPixel": false,
        "widgetAlignment": constants.WIDGET_ALIGN_CENTER
    }, {
        "textCopyable": false,
        "wrapping": constants.WIDGET_TEXT_WORD_WRAP
    });
	
	flxSegNoteAV.add(lblSegNoteAV);
	
    var lblSegNoteTSAV = new kony.ui.Label({
        "id": "lblSegNoteTSAV",
        "isVisible": true,
        "left": "0%",
        "skin": "sknLblName",
        "text": "Label",
        "textStyle": {},
        "top": "0dp",
        "width": kony.flex.USE_PREFFERED_SIZE,
        "zIndex": 1
    }, {
        "contentAlignment": constants.CONTENT_ALIGN_MIDDLE_LEFT,
        "padding": [5, 3, 1, 1],
        "paddingInPixel": false,
        "widgetAlignment": constants.WIDGET_ALIGN_CENTER
    }, {
        "textCopyable": false,
        "wrapping": constants.WIDGET_TEXT_WORD_WRAP
    });
    flxSegNoteAV.add(lblSegNoteTSAV);
	
	var flxDeleteFP = new kony.ui.FlexContainer({
        "autogrowMode": kony.flex.AUTOGROW_HEIGHT,
        "clipBounds": true,
        "id": "flxDeleteFP",
        "isVisible": true,
        "layoutType": kony.flex.FLOW_VERTICAL,
        "left": "0dp",
        "isModalContainer": false,
        "onTouchEnd": function(){
			var currentfrmFP = kony.application.getCurrentForm();
			__deleteCommentFP(currentfrmFP.segPopupPreview.selectedRowItems);},
        "skin": "sknFlxLightRedFP",
        "width": "27dp",
		"top": "15dp",
        "zIndex": 5

    }, {}, {});

    flxDeleteFP.setDefaultUnit(kony.flex.DP);

	var flxContent = new kony.ui.FlexContainer({
        "autogrowMode": kony.flex.AUTOGROW_HEIGHT,
        "clipBounds": true,
        "id": "flxContent",
        "isVisible": true,
        "layoutType": kony.flex.FLOW_VERTICAL,
        "left": "0%",
        "isModalContainer": false,
        "skin": "slFbox",
        "top": "0dp",
        "width": "73%",
        "zIndex": 1
    }, {
        "padding": [0, 0, 0, 0]
    }, {});
	
	flxContent.add(richtxtNoteAV,flxSegNoteAV);
	
	 var flxMainTemplate = new kony.ui.FlexContainer({
        "autogrowMode": kony.flex.AUTOGROW_HEIGHT,
        "clipBounds": true,
        "id": "flxMainTemplate",
        "isVisible": true,
        "layoutType": kony.flex.FLOW_HORIZONTAL,
        "left": "0%",
        "isModalContainer": false,
        "skin": "slFbox",
        "top": "0dp",
        "width": "138%",
        "zIndex": 1
    }, {
        "padding": [0, 0, 0, 0]
    }, {});

	
	flxMainTemplate.add(flxContent,flxDeleteFP)
	
	var segTemplateAV = new kony.ui.FlexContainer({
        "autogrowMode": kony.flex.AUTOGROW_HEIGHT,
        "clipBounds": true,
        "id": "segTemplateAV",
        "isVisible": true,
        "layoutType": kony.flex.FREE_FORM,
        "left": "0dp",
        "isModalContainer": false,
        "skin": "slFbox",
        "top": "0dp",
        "width": "100%"
    }, {
        "padding": [0, 0, 0, 0]
    }, {});

	
    segTemplateAV.add(flxMainTemplate);
	
	var btnDeleteFP = new kony.ui.Button({
        "centerX": "50%",
        "focusSkin": "sknBtnWhiteMLFP",
        "height": kony.flex.USE_PREFFERED_SIZE,
        "id": "btnDeleteFP",
        "isVisible": true,
        "skin": "sknBtnWhiteMLFP",
        "text": "Delete",
        "width": "100%",
        "zIndex": 5
    }, {

        "contentAlignment": constants.CONTENT_ALIGN_BOTTOM_CENTER,
        "displayText": false,
        "padding": [0, 0, 0, 0],
        "paddingInPixel": false
    }, {

        "showProgressIndicator": true
    });
	flxDeleteFP.add(btnDeleteFP);


    var segPopupPreview = new kony.ui.SegmentedUI2({
        "autogrowMode": kony.flex.AUTOGROW_NONE,
        "id": "segPopupPreview",
        "height": "50%",
        "width": "90%",
        "centerX": "50%",
        "isVisible": true,
        "retainSelection": false,
        "widgetDataMap": {
            "lblSegNoteAV": "createdBy",
            "lblSegNoteTSAV": "formattedlmt",
            "richtxtNoteAV": "comment"
        },
        "data": [],
        "rowTemplate": segTemplateAV,
        "widgetSkin": "segTrans",
        "rowSkin": "segRowTrans",
        "rowFocusSkin": "segRowTrans",
        "sectionHeaderSkin": "seg2Header",
        "separatorRequired": true,
		"metaInfo":{editMode:constants.SEGUI_EDIT_MODE_DELETE,
					editModeCustomConfig : [{title:"Delete", backgroundColor:"f35a56", callback:delete_callback}]
		},
        "separatorThickness": 1,
        "separatorColor": "788ea91e",
        "showScrollbars": false,
        "groupCells": false,
        "screenLevelWidget": false,
		"editStyle": constants.SEGUI_EDIT_MODE_DELETE,
        "selectionBehavior": constants.SEGUI_DEFAULT_BEHAVIOR,
        "viewType": constants.SEGUI_VIEW_TYPE_TABLEVIEW,
        "top": "16%",
        "zIndex": 1
		
    }, {
        "padding": [0, 0, 0, 0],
        "paddingInPixel": false
    }, {
		"bounces": false,
        "editStyle": constants.SEGUI_EDITING_STYLE_NONE,
        "enableDictionary": false,
        "indicator": constants.SEGUI_NONE,
        "progressIndicatorColor": constants.PROGRESS_INDICATOR_COLOR_WHITE,
        "showProgressIndicator": true
	});
	
	var textArea_width;
	var doneBtn_visible;
	var currentfrmFP = kony.application.getCurrentForm();

	if(platformName == "android") {
		textArea_width = "82%";
		textArea_centerX = "40%";
		flxTextAreaWidth = "90%";
	}
	else {
		textArea_width = "75%";
		textArea_centerX = "42%";
		flxTextAreaWidth = "100%";
	}

	var btnTextAreaDoneAV = new kony.ui.Button({
        "focusSkin": "dynSkinSubmitAV",
        "height": "44dp",
        "id": "btnTextAreaDoneAV",
        "isVisible": true,
        "onClick": __addAppendCommentFP,
        "right": "3%",
        "skin": "dynSkinSubmitAV",
        "text": "",
        "top": "72.20%",
        "width": "44dp",
		"centerY": "50%",
        "zIndex": 100
    }, {
        "contentAlignment": constants.CONTENT_ALIGN_CENTER,
        "displayText": true,
        "padding": [0, 0, 0, 0],
        "paddingInPixel": false
    }, {
        "showProgressIndicator": true
    });

     var txtAreaNotesAV = new kony.ui.TextArea2({
        "autoCapitalize": constants.TEXTAREA_AUTO_CAPITALIZE_NONE,
        "centerX": textArea_centerX,
        "focusSkin": "sknTxtAreaBG788EA9Focus",
        "top": "0.2%",
        "height": constants.PREFERRED,
        "id": "txtAreaNotesAV",
        "isVisible": true,
        "keyBoardStyle": constants.TEXTAREA_KEY_BOARD_STYLE_DEFAULT,
		"onTextChange": txtAreaCallback,
        "placeholder": "Add a note",
        "skin": "sknTxtAreaBG788EA9Normal",
        "textInputMode": constants.TEXTAREA_INPUT_MODE_ANY,
        "bottom": "4%",
        "width": textArea_width,
        "zIndex": 10,
        "onDone": __addAppendCommentFP
    }, {
        "contentAlignment": constants.CONTENT_ALIGN_TOP_LEFT,
        "padding": [2, 2, 2, 2],
        "paddingInPixel": false
    }, {
	
        "inputAccessoryViewType": constants.TEXTAREA_INPUTACCESSORYVIEW_NEXTPREV,
    });	
    
    var lblNoNotes = new kony.ui.Label({
        "centerX": "50%",
        "height": "50%",
        "id": "lblNoNotes",
        "isVisible": false,
        "left": "0dp",
        "skin": "sknLblNoNotes",
        "text": "Collaborate on prototypes  by adding notes to screens",
        "textStyle": {
            "letterSpacing": 0,
            "strikeThrough": false
        },
        "top": "15%",
        "width": "90%",
        "zIndex": 100
    }, {
        "contentAlignment": constants.CONTENT_ALIGN_CENTER,
        "padding": [0, 0, 0, 0],
        "paddingInPixel": false
    }, {
        "textCopyable": false
    });
	
	 var flxTextAreaNotesAV = new kony.ui.FlexContainer({
        "autogrowMode": kony.flex.AUTOGROW_HEIGHT,
        "clipBounds": true,
        "id": "flxTextAreaNotesAV",
        "isVisible": true,
        "layoutType": kony.flex.FREE_FORM,
        "left": "0dp",
		"right": "4%",
		"centerX": "50%",
        "skin": "flxTextAreaSkin",
        "top": "72%",
        "width": flxTextAreaWidth,
		"height": "60dp",
        "zIndex": 100
    }, {
        "padding": [0, 0, 0, 0]
    }, {});
	
    flxTextAreaNotesAV.setDefaultUnit(kony.flex.DP);
	flxTextAreaNotesAV.add(txtAreaNotesAV,btnTextAreaDoneAV);
	
    flxSCNoteAV.add(flxNoteHeader, segPopupPreview,flxTextAreaNotesAV,lblNoNotes);
    flxNoteAV.add(flxSCNoteAV);
    flxExitAppAV = new kony.ui.FlexContainer({
        "autogrowMode": kony.flex.AUTOGROW_NONE,
        "centerX": "50%",
        "centerY": "61%",
		"clipBounds": true,
        "bounces": false,
        "id": "flxExitAppAV",
        "isVisible": true,
        "layoutType": kony.flex.FREE_FORM,
        "width": "100%",
        "zIndex": 1
    }, {}, {});
    flxExitAppAV.setDefaultUnit(kony.flex.DP);
	
	var btnNotesExitAV = new kony.ui.Button({
        "focusSkin": "SknBtnExitApp",
        "height": "20%",
		"centerX": "50%",
        "id": "btnNotesExitAV",
        "isVisible": true,
        "skin": "SknBtnExitApp",
        "text": "EXIT APP",
        "top": "5dp",
        "onClick": btnExitAppNotesCallBack,
        "width": "60%",
        "zIndex": 200
    }, {
        "contentAlignment": constants.CONTENT_ALIGN_CENTER,
        "displayText": true,
        "padding": [0, 0, 0, 0],
        "paddingInPixel": false
    }, {
        "showProgressIndicator": true
    });

	flxExitAppAV.add(btnNotesExitAV);
	flxMainAV.add(flxNoteAV, flxExitAppAV);
	segTemplateAV.addGestureRecognizer(constants.GESTURE_TYPE_PAN, {
            fingers: 1,
            continuousEvents: false
        }, panGestureHandler);
};
