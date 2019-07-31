
	var project_params = null;
	var annotationDataPREVIEW = null;
	var doEdit = false;
	var editSelectedItem = null;
	var currIndices = {};
	var coords = [];
	var rowreset = false;
	var swipedIndices = {};
	var animationObj;
	/*
	* project details params [project_guid, channel etc.].
	*/	
	var __projectDetailsParams = function(ann_id){
		
		var proj_details = kony.ds.read("kv_project");
		var params = {};
		if(proj_details != null && proj_details.length > 0)
		{
			params.proj_guid = proj_details[0]["project_guid"];
            params.acc_guid = proj_details[0]["account_guid"];
			params.annotation_id = ann_id;
            params.widget_id = ann_id;
			params.channel = proj_details[0]["channel"];
		}
		kony.print("@@@project_params: "+JSON.stringify(params));
		
		return params;
	}

	/*
	* active comments data for segment.
	*/
	var segmentData = function(annotationData){
		
		kony.print("Inside segmentData method");
		var seg_data = [];
        var widgetId = project_params.widget_id;
		if(annotationData == null || annotationData["comments"][widgetId] == null) return seg_data;
        
		for(var key in annotationData["comments"][widgetId])
		{
            var comments = annotationData["comments"][widgetId];
			kony.print("Inside for loop:"+JSON.stringify(comments));

		if(comments[key]['active'] == 1)
			{
                var lmt = comments[key].lastModifiedTime;
                lmt = new Date(lmt);
               // var days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
                var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                var dn = "AM";
                var hour = lmt.getHours();
                var minutes = lmt.getMinutes();
                if(hour > 12){
                    hour = hour - 12;
                    dn = "PM";
                }
                if(hour == 0){
                    hour = 12;
                }
                if(minutes <= 9){
                    minutes = "0"+minutes;
                }
                var dateString = months[lmt.getMonth()] + " " + lmt.getDate() + ", " + hour + ":"+ minutes + " " + dn;
                comments[key].formattedlmt = dateString;
				seg_data.push(comments[key]);
			}
		}
		function compare(a,b) {
          if (a.lastModifiedTime < b.lastModifiedTime)
             return -1;
          if (a.lastModifiedTime > b.lastModifiedTime)
            return 1;
          return 0;
        }
		
		kony.print("Inside segment method before sorting:"+JSON.stringify(seg_data));
		seg_data.sort(function(a,b){return new Date(b.lastModifiedTime) - new Date(a.lastModifiedTime)});
		kony.print("Inside segment method after sorting:"+JSON.stringify(seg_data));
        //seg_data.sort(compare);
		return seg_data;
	}
	
	/*
	*  set segment data for popupBottomPreview.
	*/
	var setSegmentData_popupBottomPreview = function(data){
		
		annotationDataPREVIEW = data;
		var annLength = data.length;
		currentfrmFP = kony.application.getCurrentForm();
		
        var kvsession = kony.ds.read("kvsession")[0];
        var userDetails = kvsession['userDetails'];
		var key;
        
		if((data == null) || data.length == 0) {
			
			if(currentfrmFP.segPopupPreview) {
				currentfrmFP.segPopupPreview.isVisible = false;
			}
			if(currentfrmFP.lblNoNotes) {
				currentfrmFP.lblNoNotes.setVisibility(true);
			}
			
		}
		else {
			if(currentfrmFP.lblNoNotes) {
				currentfrmFP.lblNoNotes.setVisibility(false);
			}
			if(currentfrmFP.segPopupPreview){
				currentfrmFP.segPopupPreview.setData(data);
				currentfrmFP.segPopupPreview.setVisibility(true);
			}
		}		
	}
    
	/*
	*  read annotation from DataStore
	*/	
	var __annotationData = function(){
        
		var annotations = fpas.readAnnotationFromDataStore(project_params);
		kony.print("@@@@annotationData: "+JSON.stringify(annotations));
		
		return segmentData(annotations);
	}

	var __showPopupWidBottomContext = function(){
            var segment_data = __annotationData();
			setSegmentData_popupBottomPreview(segment_data);
	}
    
    var __refreshSegmentData = function(){
            var segment_data = __annotationData();
			setSegmentData_popupBottomPreview(segment_data);
	}
	
	
	function txtAreaCallback() {
	}
		
	/*
	* Add & appends new notes in popup [call addOrAppendAnnotation function] 
	*/
	var __addAppendCommentFP = function(){
		
		kony.print("Inside text area done");
		var currentfrmFP = kony.application.getCurrentForm();
		var platformName = (kony.os.deviceInfo().name).toLowerCase();		
			
		if(platformName == "Android") {
			currentfrmFP.windowSoftInputMode = constants.FORM_ADJUST_PAN;
		}
		
		doEdit = false;
		var annotation = {};
		var comment = currentfrmFP.txtAreaNotesAV.text && currentfrmFP.txtAreaNotesAV.text.trim();
		if(comment == null || comment == "") return;
		annotation.comment = comment;
		fpas.addOrAppendAnnotationTODS(project_params, annotation, function(result){
						if(result['status'] == 400)
						{
							kony.print("@@@@@@result['data']: "+JSON.stringify(result['data']));
							var seg_data = segmentData(result['data']);
							
							 kony.print("SEG DATA :" + JSON.stringify(seg_data));
							setSegmentData_popupBottomPreview(seg_data);
							currentfrmFP.txtAreaNotesAV.text = "";
                           // setSegmentData_popupTopPreview(seg_data);
							syncWithCloudDBUtil(function(res){
                                             if(res.status == 200){
                                                 kony.print("Successfully synced with DB.");
                                                __refreshSegmentData();
                                             }
                                            });
                            //currentfrmFP.txtAreaNotesAV.text = null;
						}else 
						kony.print("Error: "+result['err']);
					});
				
	}
	
	function getTransAnimDefinition(leftVal) {
	try{
     	var transAnimDef1 = {
        	"100": {
            	"left": leftVal
        	}
    	};
    	var transAnimDefObject = kony.ui.createAnimation(transAnimDef1);

    	return {
        	definition: transAnimDefObject,
        	config: {
            	"duration": 1,
            	"iterationCount": 1,
            	"delay": 0,
            	"fillMode": kony.anim.FILL_MODE_FORWARDS
        	}
    	};
	} 
  	catch(err){
      	kony.print("CATCH: getTransAnimDefinition "+err);
    }
}

function panGestureHandler(commonWidget, gestureInfo, context) {
	try{
      	var secIndex = context["sectionIndex"];
       	var rowIndex = context["rowIndex"];
       	var panRowList = [{ sectionIndex: secIndex, rowIndex: rowIndex }];
       	var segInfo = context["widgetInfo"];
       	var segName = context["widgetInfo"]["id"];
       	currIndices["secIndex"] = context["sectionIndex"];
       	currIndices["rowIndex"] = context["rowIndex"];
       	var diff = 0;
       	var leftVal1 = 0;
       	var diffConst,animConst;
		var platformName = (kony.os.deviceInfo().name).toLowerCase();
       	leftVal1 = (parseInt(gestureInfo.translationX));
        coords.push(leftVal1);       
        if (gestureInfo.gestureState == 3) {
            kony.print("coords" + JSON.stringify(coords));
            diff = ((coords.length == 1) ? coords[0] : coords[coords.length - 1] - coords[0]);
            if(segName == "segPopupPreview" ){
              diffConst = -256
              if(/^(androidtab||windows)$/.test(platformName)){
                 animConst = "-21%"
               }
              else
             	animConst = "-10%"
            }
            else{
              diffConst = -140
              animConst = "-18.5%"
            }
            if (diff > diffConst ) {
                animationObj = getTransAnimDefinition("0%");
                coords = [];
                segInfo.animateRows({
                    rows: [{
                        sectionIndex: context["sectionIndex"],
                        rowIndex: context["rowIndex"]
                    }],
                    widgets: ["flxMainTemplate"],
                    animation: animationObj
                });
            } else {
				if( swipedIndices["rowIndex"] == context["rowIndex"]&& swipedIndices["secIndex"] == context["sectionIndex"]){
				 swipedIndices={};
				}
				else{
                swipedIndices["rowIndex"] = context["rowIndex"];
                swipedIndices["secIndex"] = context["sectionIndex"];
				}
                animationObj = getTransAnimDefinition(animConst);
                segInfo.animateRows({
                    rows: [{
                        sectionIndex: context["sectionIndex"],
                        rowIndex: context["rowIndex"]
                    }],
                    widgets: ["flxMainTemplate"],
                    animation: animationObj
                });
				
            }

        } else if (gestureInfo.gestureState == 2) {

            animationObj = getTransAnimDefinition(leftVal1 + "px");
            segInfo.animateRows({
                rows: [{
                    sectionIndex: context["sectionIndex"],
                    rowIndex: context["rowIndex"]
                }],
                widgets: ["flxMainTemplate"],
                animation: animationObj
            });

        }
	} 
  	catch(err){
      	kony.print("CATCH: panGestureHandler "+err);
    }
} 
		
/** 

Below method is used to handle the delete on swipe in segment.

**/

function delete_callback(seguiWidget, section, row)
{
	try{
	var segData = currentfrmFP.segPopupPreview.data;
	var selectedItem =[];
	selectedItem.push(segData[row]);
    __deleteCommentFP(selectedItem);

    }
   catch(err){

      kony.print("CATCH: delete_callback "+err);

    }
}
	/*
	* delete notes in popup [call addOrAppendAnnotation function] 
	*/
	var __deleteCommentFP = function(selectedItem){
		currentfrmFP = kony.application.getCurrentForm();
	
		if(selectedItem != null && selectedItem.length > 0)
		{
			var comment = selectedItem[0];
            var kvsession = kony.ds.read("kvsession")[0];
            var userDetails = kvsession['userDetails'];
            if(comment.createdById == userDetails['user_guid']){
				
                delete comment.template;
                kony.print("@@@@@comment: "+JSON.stringify(comment));
                fpas.deleteCommentFROMDS(project_params, comment, function(result){
                            if(result['status'] == 400)
                            {
                                var seg_data = segmentData(result['data']);
                                setSegmentData_popupBottomPreview(seg_data);
                                syncWithCloudDBUtil(function(res){
                                                 if(res.status == 200){
                                                     kony.print("Successfully synced with DB.");
                                                     __refreshSegmentData();
                                                 }
                                                });
                            }else kony.print("Error: "+result['err']);
                        });
            }
		}
	}
	
	var syncWithCloudDBUtil = function(callback){
		var segment_data = [];
		fpnotes.updateNotesToRemoteDB(project_params,function(result){
            if(result.status == 200){
                fpnotes.fetchNotesFromRemoteDB(project_params,function (fetchresult){
                    if(fetchresult.status == 200 && fetchresult.data != null){
                        segment_data = segmentData(fetchresult.data);
                    } else {
                        var annotation = fpas.readAnnotationFromDataStore(project_params);
                        segment_data = segmentData(annotation);
                    }
                    setSegmentData_popupBottomPreview(segment_data);
                    //setSegmentData_popupTopPreview(segment_data);
                    callback({status:200});
                });
            } else {
                callback({status:200});
            }
		});
	}
		
	/*
	* Shake Gesture for notes popup
	*/ 
	
	var onShakeFpApp = function (){
	
		var currentfrm = kony.application.getCurrentForm();	
			if(currentfrm.flxMainAV == null) {
				kony.print("Inside if block of onshake app");
			currentfrm.remove(flxMainAV);
			currentfrm.add(flxMainAV);			
			currentfrm.flxMainAV.setVisibility(true);
			currentfrm.flxExitAppAV.setVisibility(true);
			}
			else {
				currentfrm.flxMainAV.setVisibility(true);
			}
                
               if(currentfrm == null || currentfrm == undefined) return;
               if(currentfrm.info == null || currentfrm.info == undefined) return;			
               ann_id = currentfrm.info.kuid;
               project_params = __projectDetailsParams(ann_id);
		
		
		__showPopupWidBottomContext();
		syncWithCloudDBUtil(function(res){
        //no matter whether it is synced with remote or not, status will be 200 and this will be executed
        if(res.status == 200){
        currentfrm.txtAreaNotesAV.text = "";
        __refreshSegmentData();
        }
        });
	}
	
//startup.js file

function apppostappinitFuncPreview() {
		
		addWidgets_flexContainer();
		var flxMainAV1 = new kony.ui.FlexContainer({
        "autogrowMode": kony.flex.AUTOGROW_NONE,
        "clipBounds": true,
        "height": "100%",
        "id": "flxMainAV",
        "isVisible": true,
        "layoutType": kony.flex.FREE_FORM,
        "left": "0dp",
        "skin": "CopyslFbox0e4fbf5879e9d4a",
        "top": "0dp",
        "width": "100%",
        "zIndex": 1
    }, {}, {});
    flxMainAV1.setDefaultUnit(kony.flex.DP);

		popupOptionsPreview = new kony.ui.Popup({
			"id": "popupOptionsPreview",
			"title": null,
			"transparencyBehindThePopup": 100,
			"skin": "notesPopBG",
			"isModal": true,
			"addWidgets": "addWidgetspopupOptionsFPreview"
		}, {
			"padding": [8, 0, 8, 0],
			"containerWeight": 100,
			"containerHeight": 37,
			"containerHeightReference": constants.HEIGHT_BY_DEVICE_REFERENCE,
			"paddingInPixel": false,
			"layoutType": constants.CONTAINER_LAYOUT_BOX
		}, {
			"windowSoftInputMode": constants.POPUP_ADJUST_RESIZE,
			"inTransitionConfig": {
				"animation": 0
			},
			"outTransitionConfig": {
				"animation": 0
			},
			"directChildrenIDs": ["segPopupFPreview"]
		});

    //Registering the 2 finger press gesture event
	var platName = (kony.os.deviceInfo().name).toLowerCase();
	var x = {};
	if ( platName == 'windows' || platName == 'windowsphone') {
		x = {
	        fingers: 1,
	        pressDuration: 1
	    };
	} else {
		x = {
	        fingers: 2,
	        pressDuration: 1
	    };
	}
    try {
        gestureIDForMenuInChildApp = kony.application.setGestureRecognizerForAllForms(3, x, function(widgetRef, gestureInfo) {
		if (kony.os.toNumber(gestureInfo["gestureType"]) == 3 && kony.os.toNumber(gestureInfo["gesturesetUpParams"]["pressDuration"]) == 1) {
				kony.print("gestureInfo : " + JSON.stringify(gestureInfo));
                 onShakeFpApp();
            }
        });
    } catch (err) {
        alert(typeof err);
        alert("error in function callbackSingleTapGesture:" + err.message);
    }
    
    //Registering the 2 finger swipe gesture event
	//Checking for Windows as it does not set the 'swipevelocity' value accurately
	var platName = (kony.os.deviceInfo().name).toLowerCase();
	kony.print("platName : " + platName);
	var y = {};
	if ( platName == 'windows' || platName == 'windowsphone') {
		y = {
		fingers: 2,
        swipedistance: 30
		};
	} else {
		y = {
        fingers: 2,
        swipedistance: 30,
        swipevelocity: 60
		};
	}
	
    try {
        gestureIDForTwoFingerSwipe = kony.application.setGestureRecognizerForAllForms(2, y, function(widgetRef, gestureInfo) {
            if (kony.os.toNumber(gestureInfo["gestureType"]) == 2) {
                if (kony.os.toNumber(gestureInfo["swipeDirection"]) == 2) {
                    kony.accelerometer.unregisterAccelerationEvents(["shake"]);
					kony.application.removeGestureRecognizerForAllForms(gestureIDForMenuInChildApp);
                    kony.application.removeGestureRecognizerForAllForms(gestureIDForTwoFingerSwipe);
                    kony.application.launchApplication(null);
                }
            }
        });
    } catch (err) {
        alert(typeof err);
        alert("error in function callbackSingleTapGesture:" + err.message);
    }

    //Registering the shake gesture event
	var events = {shake:onShakeFpApp};
	kony.accelerometer.registerAccelerationEvents(events);
};

function btnUpArrowCallBack() {
	var currentfrmFP = kony.application.getCurrentForm();
	currentfrmFP.flxNoteAV.top = "15%";
	currentfrmFP.flxExitAppAV.centerY = "17%";
	currentfrmFP.btnDownArrowNoteAV.isVisible = true;
	currentfrmFP.btnUpArrowNoteAV.isVisible = false;
	
	currentfrmFP.flxExitAppAV.isVisible = true;
}

function btnDownArrowCallBack() {
	var currentfrmFP = kony.application.getCurrentForm();
	currentfrmFP.flxNoteAV.top = "62%";
	currentfrmFP.flxExitAppAV.centerY = "61%";
	currentfrmFP.btnDownArrowNoteAV.isVisible = false;
	currentfrmFP.btnUpArrowNoteAV.isVisible = true;
	
	currentfrmFP.flxExitAppAV.isVisible = true;
}

function btnCloseCallBack() {
	var currentfrmFP = kony.application.getCurrentForm();
	currentfrmFP.flxMainAV.isVisible = false;
}	
	
function btnExitAppNotesCallBack() {
	var currentfrmFP = kony.application.getCurrentForm();
	currentfrmFP.flxMainAV.setVisibility(false);
	kony.accelerometer.unregisterAccelerationEvents(["shake"]);
	kony.application.removeGestureRecognizerForAllForms(gestureIDForMenuInChildApp);
    kony.application.removeGestureRecognizerForAllForms(gestureIDForTwoFingerSwipe);
	kony.application.launchApplication(null);
}