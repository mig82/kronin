
$KW.IGallery = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "IGallery", this.eventHandler);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);

            switch(propertyName) {
                case "data":
                    if(propertyValue && $KU.isArray(propertyValue)) {
                        widgetModel.masterdata = propertyValue[0 + IndexJL];
                        widgetModel.key = propertyValue[1 + IndexJL];
                    }
                    this.setData(widgetModel, widgetModel.masterdata, widgetModel.key);
                    break;

                case "focusedindex":
                case "selectedindex":
                    if(element) {
                        element = document.querySelector("#" + element.id + " [index='" + propertyValue + "']");
                        element && $KW.APIUtils.setfocus(widgetModel, null, element);
                        widgetModel.focuseditem = widgetModel.selectedItem = widgetModel.selecteditem = widgetModel.masterdata[propertyValue];
                    }
                    break;

                case "referencewidth":
                case "referenceheight":
                case "imagescalemode":
                    this.setData(widgetModel, widgetModel.masterdata, widgetModel.key);
                    break;

                case "viewtype":
                case "noofrowsperpage":
                    if(element) {
                        element.parentNode.innerHTML = this.render(widgetModel, {
                            tabpaneID: element.getAttribute("ktabpaneid")
                        });;
                        if(widgetModel.viewtype == "pageview") {
                            element = $KU.getNodeByModel(widgetModel);
                            $KW.HStrip.initializePageView(widgetModel, false, element);
                            $KW.touch.computeWidths(element, widgetModel);
                            var pScrollerInstance = new $KW.touch.pageviewScroller(element, {
                                widgetModel: widgetModel
                            });
                            $KG[element.id] = pScrollerInstance;
                        }
                    }
                    break;
            }
        },

        render: function(galleryModel, context) {
            if(galleryModel.data) {
                galleryModel.masterdata = galleryModel.data[0 + IndexJL];
                galleryModel.key = galleryModel.data[1 + IndexJL];
            }
            galleryModel.focusedindex = galleryModel.selectedindex = galleryModel.focusedindex || galleryModel.selectedindex || null;
            galleryModel.focuseditem = galleryModel.selecteditem = galleryModel.focuseditem || galleryModel.selecteditem || null;
            galleryModel.context = context;

            var marginPaddding = $KW.skins.getMarginSkin(galleryModel, context) + $KW.skins.getPaddingSkin(galleryModel);
            var computedSkin = (!$KW.Utils.isWidgetVisible(galleryModel, context) ? " hide" : "") + (galleryModel.skin ? (" " + galleryModel.skin) : "");

            if(context.ispercent === false)
                marginPaddding += " display: inline-block;"
            else
                computedSkin += " " + $KW.skins.getMarAdjustedContainerWeightSkin(galleryModel, 100);


            if(galleryModel.imagewhiledownloading)
                new Image().src = $KU.getImageURL(galleryModel.imagewhiledownloading);
            galleryModel.imagewhiledownloading = galleryModel.imagewhiledownloading || $KG["imagewhiledownloading"] || "imgload.gif";

            var html = $KW.Utils.getBaseHtml(galleryModel, context);
            var htmlString = "<div" + html + "class='" + computedSkin + "' style='" + marginPaddding + "'>";
            htmlString += this.generateImages(galleryModel, galleryModel.masterdata || [], IndexJL);
            htmlString += "</div>";
            return htmlString;
        },

        generateImages: function(galleryModel, masterdata, index, key) {
            var htmlString = "";
            var imageKey = key || galleryModel.key || "iurl";

            for(var i = IndexJL; i < (masterdata.length); i++) {
                var src = masterdata[i][imageKey];
                if(src) {
                    var isWaitAllowed = true;
                    if($KU.inArray($KU.imgCache, src, true))
                        isWaitAllowed = false;

                    var style = "";
                    src = $KU.getImageURL(src);
                    
                    htmlString += "<span " + (isWaitAllowed ? ("style='background:url(" + $KU.getImageURL(galleryModel.imagewhiledownloading) + ") center center no-repeat;display:inline-block;min-height:30px;min-width:30px'") : "") + ">";
                    
                    htmlString += "<img " + (kony.appinit.isOpera ? "draggable='false'" : "") + " src='" + src + "' id='" + galleryModel.pf + '_' + galleryModel.id + "_img' kformname = '" + galleryModel.pf + "' index= " + index + " kwidgettype='" + galleryModel.wType + "'" + (galleryModel.context.tabpaneID ? "ktabpaneid='" + galleryModel.context.tabpaneID + "'" : "") + " onload='$KU.imgLoadHandler(arguments[0],this)' onerror='$KU.imgLoadHandler(arguments[0],this)' ";

                    if(galleryModel.spacebetweenimages) {
                        var space = Math.ceil(parseInt(galleryModel.spacebetweenimages) / 4);
                        style += "margin:" + space + "px;";
                    }

                    if(galleryModel.heightwidth || ((galleryModel.referencewidth || galleryModel.referenceheight) && galleryModel.imagescalemode == constants.IMAGE_SCALE_MODE_FIT_TO_DIMENSIONS)) {
                        var dimensions = galleryModel.heightwidth ? galleryModel.heightwidth.split(",") : [galleryModel.referenceheight, galleryModel.referencewidth];
                        style += (parseInt(dimensions[1]) != 0 ? ("width:" + dimensions[1] + "px;") : "") + (parseInt(dimensions[0]) != 0 ? ("height:" + dimensions[0] + "px;") : "");
                    }

                    
                    style += "opacity:0;display:none";

                    htmlString += (style ? ("style= '" + style + "'") : "") + " /></span>";
                }
                index++;
            }
            return htmlString;

        },

        
        setData: function(galleryModel, dataArray, key) {
            if(dataArray && $KU.isArray(dataArray))
                this.modifyContent(galleryModel, dataArray, "setdata", null, key);
            else {
                var gal = $KU.getNodeByModel(galleryModel);
                if(gal) {
                    $KU.toggleVisibilty(gal, dataArray, galleryModel)
                }
            }
        },

        addAll: function(galleryModel, dataArray, key) {
            (dataArray && $KU.isArray(dataArray)) && this.modifyContent(galleryModel, dataArray, "addall", null, key);
        },

        removeAll: function(galleryModel) {
            this.modifyContent(galleryModel, [], "removeall");
        },

        addDataAt: function(galleryModel, dataObj, index) {
            (!isNaN(index) && index >= IndexJL && dataObj instanceof Object) && this.modifyContent(galleryModel, dataObj, "addat", index, galleryModel.key);
        },

        removeAt: function(galleryModel, index) {
            (!isNaN(index) && index >= IndexJL) && this.modifyContent(galleryModel, [], "removeat", index);
        },

        
        setDataAt: function(galleryModel, dataObj, index) {
            (!isNaN(index) && index >= IndexJL && dataObj instanceof Object) && this.modifyContent(galleryModel, dataObj, "setdataat", index, galleryModel.key);
        },

        modifyContent: function(galleryModel, dataArray, action, index, key) { 
            if(galleryModel) {
                $KW.Utils.updateContent(galleryModel, "masterdata", dataArray, action, index);
                galleryModel.canUpdateUI = false;
                galleryModel.data = IndexJL ? [null, galleryModel.masterdata, key] : [galleryModel.masterdata, key]; 
                galleryModel.canUpdateUI = true;
                key && (galleryModel.key = key);
                var imageGal = $KU.getNodeByModel(galleryModel);
                if(imageGal) {

                    switch(action) {

                        case "addat":
                        case "setdata":
                            imageGal.innerHTML = this.generateImages(galleryModel, galleryModel.masterdata, IndexJL, key);
                            break;

                        case "setdataat":
                            var existingImg = imageGal.childNodes[IndexJL ? (index - 1) : index] && imageGal.childNodes[IndexJL ? (index - 1) : index].childNodes[0];
                            if(existingImg)
                                existingImg.src = $KU.getImageURL(dataArray[galleryModel.key]);
                            break;

                        case "addall":
                            var index = imageGal.childNodes.length;
                            imageGal.innerHTML += this.generateImages(galleryModel, dataArray, index + IndexJL, key);
                            break;

                        case "removeall":
                            imageGal.innerHTML = "";
                            break;

                        case "removeat":
                            if(imageGal.childNodes[index - IndexJL]) {
                                imageGal.removeChild(imageGal.childNodes[index - IndexJL]);
                                $KU.adjustNodeIndex(imageGal, index, "index");
                            }
                            break;
                        default:

                    }
                    galleryModel.masterdata && $KU.toggleVisibilty(imageGal, galleryModel.masterdata, galleryModel);

                }
            }
        },

        eventHandler: function(eventObject, target) {
            var widgetID = target.id;
            widgetID = (target.tagName == 'IMG') ? widgetID.split("_")[1] : $KU.getElementID(widgetID);
            var imageViewModel = $KU.getModelByNode($KU.getElementById(target.getAttribute("kformname") + "_" + widgetID));
            var index = target.getAttribute("index");

            if(index && imageViewModel) {
                imageViewModel.canUpdateUI = false;
                imageViewModel.focusedindex = imageViewModel.selectedindex = index;
                imageViewModel.canUpdateUI = true;
                imageViewModel.focuseditem = imageViewModel.selecteditem = imageViewModel.masterdata[index];

                $KAR && $KAR.sendRecording(imageViewModel, 'click', {'selection': index, 'target': target, 'eventType': 'uiAction'});

                var imageViewref = $KU.returnEventReference(imageViewModel.onclick || imageViewModel.onselection);
                imageViewref && imageViewref.call(imageViewModel, imageViewModel);
            }
        }
    };


    return module;
}());
