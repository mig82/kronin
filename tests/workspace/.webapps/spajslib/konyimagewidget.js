
$KW.Image = (function() {
    
    var _renderOverlayWidgets = function(imageModel, widgetsList) {
        var htmlString, overlayWidgets = widgetsList || imageModel.overlayWidgets;

        htmlString = $KW.FlexContainer.renderChildren(imageModel, overlayWidgets, {});

        return htmlString;
    };
    var _getAcceptedWidgets = function(imageModel, widgetsList) {
        var acceptedWidgetList = [
            'Label',
            'Image',
            'Button'
        ], i, widgetLength = widgetsList.length, finalizedWidgets = [];

        for(i = 0; i < widgetLength; i++) {
            if(acceptedWidgetList.indexOf(widgetsList[i].wType) !== -1) {
                widgetsList[i].isImageOverlayWidget = true;
                widgetsList[i].index = i;
                widgetsList[i].pf = imageModel.id;
                widgetsList[i].parent = imageModel;
                finalizedWidgets.push(widgetsList[i]);
            }
        }

        return finalizedWidgets;
    };
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "Image", this.eventHandler);
            kony.events.addEvent("onorientationchange", "Image", this.imgOrientationHandler);
        },

        imgOrientationHandler: function() {
            var widgetNode = arguments[0] ? $KU.getNodeByModel(arguments[0]) : document;
            var editImages = widgetNode && widgetNode.querySelectorAll("img[kwidgettype='Image']");
            if(editImages) {
                for(var i = 0; i < editImages.length; i++) {
                    var editImage = editImages[i];
                    module.imgResizeHandler(editImage, "orientationchange");
                }
            }
        },

        
        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel), imageParent, scrollerNode;

            switch(propertyName) {
                case "src":

                    
                    widgetModel.srcType = 1;
                    if(!element)
                        return;
                    element.parentNode.parentNode.innerHTML = this.render(widgetModel, new $KW.WidgetGenerationContext(widgetModel.pf));

                    
                    if(widgetModel.touches) {
                        element = $KU.getNodeByModel(widgetModel);
                        var touchtypes = ["touchstart", "touchmove", "touchend"];
                        for(var i =0; i < touchtypes.length; i++) {
                            var eventtype = touchtypes[i];
                            if(widgetModel.touches[eventtype]){
                                $KW.Utils.removetouch(widgetModel, eventtype, false);
                                $KW.Utils.updateModelWithTouches(widgetModel, eventtype, widgetModel.touches[eventtype].callback);
                                widgetModel.touches[eventtype]["instance"] = new $KW.touch.TouchEvents(widgetModel, element.parentNode, eventtype,  widgetModel.touches[eventtype].callback);
                            }
                        }
                    }
                    break;

                case "base64":
                    widgetModel.srcType = 2;
                    
                    if(element && propertyValue) {
                        element.src = this.getBase64String(propertyValue);
                    }
                    break;

                case "referenceheight":
                case "referencewidth":
                case "imagescalemode":
                    element && (element.parentNode.parentNode.innerHTML = this.render(widgetModel, new $KW.WidgetGenerationContext(widgetModel.pf)));
                    $KW.FlexContainer.attachDragEvent(widgetModel);
                    break;

                case "zoomenabled":
                    widgetModel.overlayWidgets = [];
                    if(element) {
                        imageParent = $KW.Utils.getWidgetNodeFromNodeByModel(widgetModel, element).parentNode;
                        widgetModel.zoomenabled = propertyValue;
                        imageParent.innerHTML = $KW.Image.render(widgetModel, {});
                        if(propertyValue) {
                            widgetModel.zoomvalue = 1;
                            widgetModel.pinchRecognizer = {
                                instance : new kony.gestures.imagePinchZoom()
                            };
                            widgetModel.pinchRecognizer.instance.registerPinch(widgetModel);
                        } else {
                            delete widgetModel.zoomvalue;
                            delete widgetModel.pinchRecognizer;
                        }
                        $KW.FlexUtils.setLayoutConfig(widgetModel, propertyValue, !propertyValue);
                        widgetModel.parent.forceLayout();
                    } else {
                        widgetModel.zoomenabled = propertyValue;
                    }
                    break;

                case "zoomvalue":
                    widgetModel.zoomvalue = propertyValue;
                    if(element) {
                        $KW.Image.resizeImageScale(widgetModel, element, widgetModel.originalFrame);
                        widgetModel.pinchRecognizer.instance.finalScale = widgetModel.pinchRecognizer.instance.completeScale = propertyValue;
                    }
                    break;
            }
        },

        
        render: function(imageModel, context) {
            var computedSkin = $KW.skins.getSplitSkinsBetweenWidgetAndParentDiv(imageModel, context);
            var htmlString = "";
            var style = "";
            imageModel.loaded = false;
            var isFlexWidget = $KW.FlexUtils.isFlexWidget(imageModel);
            var imgId = imageModel.pf + "_" + imageModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(imageModel);
            if(kmasterObj.id != "") {
                imgId = kmasterObj.id;
            }

            if(context.scrollBoxID)
                imageModel.scrollBoxID = context.scrollBoxID;

            var isWaitAllowed = true;
            if($KU.inArray($KU.imgCache, imageModel.src, true))
                isWaitAllowed = false;
            
            if(isWaitAllowed && imageModel.imagewhiledownloading)
                new Image().src = $KU.getImageURL(imageModel.imagewhiledownloading);

            imageModel.imagewhiledownloading = imageModel.imagewhiledownloading || $KG["imagewhiledownloading"] || "imgload.gif";
            var css = $KW.skins.getVisibilitySkin(imageModel) + (isFlexWidget ? " middlecenteralign" : "");
            var useWidgetSize = '';

            if(context.ispercent === false) {
                useWidgetSize = context.layoutDir ? "float:" + context.layoutDir : "";
            } else {
                useWidgetSize = "width:100%";
            }

            if(imageModel.srcType == 2)
                imgsrc = this.getBase64String(imageModel.base64);
            else
                imgsrc = $KU.getImageURL(imageModel.src)

            var onimgonload = "$KU.imgLoadHandler(arguments[0],this)";


            var dimensions = this.getImageDimensions(imageModel, context.ispercent);

            style += (dimensions.width != undefined ? ("width:" + dimensions.width + "px;") : "") + (dimensions.height != undefined ? ("height:" + dimensions.height + "px;") : "") + (isFlexWidget ? "font-size:0px;display:block;" : "");

            onimgonload = dimensions.onimgonload || onimgonload;
            if(dimensions.maxwidth) {
                style = dimensions.maxwidth;
            }

            
            
            

            if(imageModel.zoomenabled) {
                imageModel.enablescrolling = true;
                imageModel.bounce = false;
                htmlString += "<div id='" + imgId + "_scroller'";
                htmlString += " kwidgettype='KImageContainer'";
                htmlString += " name='touchcontainer_KScroller' widgettype='Image'";
                htmlString += " swipedirection='both'";
                htmlString += " style='top: 0px; bottom: 0px;overflow: hidden;'>"
                htmlString +=     "<div id='" + imgId + "_scrollee'";
                htmlString +=     " kwidgettype='KTouchscrollee' position: absolute;>";
            }

            htmlString += "<span id='" + imgId + "_span' class='" + css + " " + computedSkin[0] + "' style='display:inline-block;" + (isWaitAllowed && imageModel.src ? "background:url(" + $KU.getImageURL(imageModel.imagewhiledownloading) + ") center center no-repeat;" : ";") + $KW.skins.getMarginSkin(imageModel, context) + $KW.skins.getPaddingSkin(imageModel, context) + useWidgetSize + ";" + style + "' " + kmasterObj.kmasterid + " >";

            
            style += $KW.skins.getBlurStyle(imageModel);

            htmlString += "<img class='" + "' src='" + imgsrc + "'" + $KW.Utils.getBaseHtml(imageModel, context) + "onload= " + onimgonload + " onerror='$KU.imgLoadHandler(arguments[0],this)' ";

            if(!(imageModel.name == "kony.ui.Image2" || imageModel.name == "konyLua.Image2") && imageModel.scalemode == "maintainaspectratio") {
                style = "width:100%;";
            } else if(imageModel.scalemode == "retaininitialimagedimensions") {
                style = "";
            }

            if(isWaitAllowed && imageModel.src) {
                style += "opacity:0;";
            }
            style += "visibility:hidden;";
            var downloadComplete = imageModel.ondownloadcomplete || "";
            if(downloadComplete) {
                downloadComplete = (typeof(downloadComplete) == 'function') ? $KU.getFunctionName(imageModel.ondownloadcomplete) : imageModel.ondownloadcomplete;
                downloadComplete = " ondownloadcomplete= '" + downloadComplete + "'";
            }
            htmlString += "style= '" + style + "'" + downloadComplete + "/></span>";

            if(imageModel.zoomenabled) {
                if(imageModel.overlayWidgets && imageModel.overlayWidgets.length > 0) {
                    htmlString += _renderOverlayWidgets(imageModel, imageModel.overlayWidgets);
                }
                htmlString += "</div></div>";
            }

            return htmlString;
        },

        getImageDimensions: function(imageModel, contextIsPercent) {
            var dimensions = {}; 
            if(imageModel.imagescalemode == constants.IMAGE_SCALE_MODE_FIT_TO_DIMENSIONS) 
            {
                var isFlexWidget = $KW.FlexUtils.isFlexWidget(imageModel);
                if(!isFlexWidget) {
                    if(imageModel.referencewidth) {
                        if(contextIsPercent == false)
                            dimensions.width = imageModel.referencewidth;
                        else
                            dimensions.width = (((screen.width * (imageModel.containerweight / 100)) > imageModel.referencewidth) ? imageModel.referencewidth : (screen.width * (imageModel.containerweight / 100)));

                        dimensions.height = imageModel.referenceheight;
                    } else
                        dimensions.maxwidth = "max-width:100%;";
                }
            } else if((imageModel.name == "kony.ui.Image2" || imageModel.name == "konyLua.Image2") && imageModel.imagescalemode == constants.IMAGE_SCALE_MODE_MAINTAIN_ASPECT_RATIO) 
            {
                imageModel.ispercent = contextIsPercent;
                dimensions.onimgonload = "$KW.Image.imgLoadHandler2(arguments[0])";
            } else if(!imageModel.referencewidth && imageModel.heightwidth && imageModel.imagescalemode != constants.IMAGE_SCALE_MODE_MAINTAIN_ASPECT_RATIO) {
                var dim = (imageModel.heightwidth).split(",");
                dimensions.width = dim[1];
                dimensions.height = dim[0];
            } else {
                dimensions.maxwidth = "max-width:100%;";
            }
            return dimensions;
        },

        getBase64String: function(propertyValue) {
            return "data:image/png;base64," + propertyValue;
        },

        eventHandler: function(eventObject, target) {
            var imgWidgetModel = $KU.getModelByNode(target),
                containerId = target.getAttribute("kcontainerID");
            

            $KAR && $KAR.sendRecording(imgWidgetModel, 'click', {'target': target, 'eventType': 'uiAction'});
            if(containerId) {
                $KW.Utils.updateContainerData(imgWidgetModel, target, true);
            } else {
                var executed = kony.events.executeBoxEvent(imgWidgetModel);
                var tabId = target.getAttribute("ktabid");
                if(!executed && tabId) {
                    $KW.TabPane && $KW.TabPane.executeTabEvent(imgWidgetModel, target, true);
                }
            }
        },

        imgLoadHandler2: function(event) {
            event = event || window.event;
            img = event.target || event.srcElement;
            if(!img.parentNode || (img.parentNode && !img.parentNode.parentNode)) return;
            this.imgResizeHandler(img, event.type);
        },

        imgResizeHandler: function(img, eventType) {
            if(!document.body.contains(img)) {
                return;
            }
            var tabPaneID = img.getAttribute("ktabpaneid");
            var type = img.getAttribute("kwidgettype");

            var targetWidgetID = (type == 'Image') ? $KU.getElementID(img.getAttribute("id")) : img.getAttribute("id");
            var src = img.src;
            var imageModel = $KU.getModelByNode(img);
            if(img.getAttribute("kcontainerID")) {
                imageModel = $KW.Utils.getClonedModelByContainer(imageModel, img, img.getAttribute("kcontainerID"));
            }

            var actimgdim = module.getNaturalDimensions(img);

            if(eventType == "load") {
                var isWaitAllowed = true;
                if($KU.inArray($KU.imgCache, imageModel.src, true))
                    isWaitAllowed = false;
                else
                    $KU.imgCache.push(imageModel.src);
                
                if(isWaitAllowed || img.parentNode.style.background.indexOf("url") != -1) {
                    var span = img.parentNode;
                    if(span) {
                        if(span.style.removeProperty)
                            span.style.removeProperty("background");
                        else
                            span.style.background = "none";
                    }
                    if($KU.isBlackBerry && $KU.getPlatformVersion("blackberry").startsWith("7")) 
                        img.style.opacity = 1;
                    else {
                        
                        if($KU.isiPhone || $KU.isiPad || kony.appinit.isSafari) {
                            setTimeout(function(){
                                img.style[$KU.transition] = "";
                            },500);
                        }
                        img.style[$KU.transition] = "opacity 500ms ease-in-out";
                        img.style.opacity = 1;
                    }
                }
            }

            
            imageModel.loaded = true;
            if(imageModel.animInfo) {
                var info = imageModel.animInfo;
                info.instance.animate(imageModel, info.animConfig, info.animCallback);
            }

            
            if(!img.parentNode || (img.parentNode && !img.parentNode.parentNode)) return;

            var ondownloadcompleteref = $KU.returnEventReference(imageModel.ondownloadcomplete);
            if(ondownloadcompleteref) {
                $KU.executeWidgetEventHandler(imageModel, ondownloadcompleteref, src, true);
            }

            var imgwidth = img.parentNode.parentNode.offsetWidth;
            if(imageModel.containerWeight >= 0 && imgwidth == 0)
                imgwidth = actimgdim.width;

            var isFlexWidget = $KW.FlexUtils.isFlexWidget(imageModel);
            
            if(!isFlexWidget) {
                var dimensions = []; 
                dimensions = module.imgDimCalculation(imageModel, actimgdim, imgwidth);
                img.style.width = img.parentNode.style.width = dimensions[1] + "px";
                img.style.height = img.parentNode.style.height = dimensions[0] + "px";
            }
            img.style.display = "";
            img.style.visibility = "visible";
            img.parentNode.parentNode.style["font-size"] = "0px";

            $KU.onImageLoadComplete(imageModel, img);

            var parentModel = imageModel.parent;
            if(parentModel.wType == 'HBox') {
                var parentNode = $KU.getParentByAttribute(img.parentNode, "kwidgettype");
                if(parentNode) {
                    var vLineNodes = parentNode.querySelectorAll("div[kwidgettype='Line'][direction='V']");
                    for(var i = 0; i < vLineNodes.length; i++) {
                        $KW.Line.resizeVLine(vLineNodes[i]);
                    }
                }
            }
        },

        getNaturalDimensions: function(img) {
            var actimgdim = {};
            if(typeof img.naturalWidth == "undefined") { 
                var i = new Image();
                i.src = img.src;
                actimgdim.width = i.width;
                actimgdim.height = i.height;
            } else {
                actimgdim.width = img.naturalWidth;
                actimgdim.height = img.naturalHeight;
            }
            return actimgdim;
        },

        imgDimCalculation: function(imageModel, actimgdim, imgwidth) {
            var dimensions = [];
            var aspectRatio = (actimgdim.width / actimgdim.height);
            if(!imageModel.referencewidth) {
                if(imageModel.ispercent === false) {
                    dimensions[1] = actimgdim.width;
                    dimensions[0] = actimgdim.height;
                } else {
                    if(actimgdim.width <= imgwidth) {
                        if(imageModel.referenceheight && actimgdim.height > imageModel.referenceheight) {
                            dimensions[0] = imageModel.referenceheight;
                            dimensions[1] = dimensions[0] * aspectRatio;
                        } else {
                            dimensions[1] = actimgdim.width;
                            dimensions[0] = actimgdim.height;
                        }
                    } else {
                        dimensions[1] = imgwidth;
                        if(!imageModel.referenceheight)
                            dimensions[0] = dimensions[1] / aspectRatio;
                        else {
                            dimensions[0] = dimensions[1] / aspectRatio;
                            if(dimensions[0] > imageModel.referenceheight) {
                                dimensions[0] = imageModel.referenceheight;
                                dimensions[1] = dimensions[0] * aspectRatio;
                            }
                        }
                    }

                }
            } else {
                if(imageModel.ispercent === false) {
                    if(actimgdim.width < imageModel.referencewidth) {
                        dimensions[1] = actimgdim.width;
                        dimensions[0] = actimgdim.height;
                    } else {
                        dimensions[1] = imageModel.referencewidth;
                        dimensions[0] = dimensions[1] / aspectRatio;
                    }

                } else {
                    var computedimgwidth = (imageModel.referencewidth <= imgwidth) ? imageModel.referencewidth : imgwidth;
                    if(!imageModel.referenceheight) {
                        if(actimgdim.width < computedimgwidth) {
                            dimensions[0] = actimgdim.height;
                            dimensions[1] = actimgdim.width;
                        } else {
                            dimensions[1] = computedimgwidth;
                            dimensions[0] = dimensions[1] / aspectRatio;
                        }
                    } else {
                        var checkDim = (actimgdim.width < computedimgwidth) ? (actimgdim.height < imageModel.referenceheight ? true : false) : false;
                        if(!checkDim) {
                            dimensions[1] = (((imgwidth) > imageModel.referencewidth) ? imageModel.referencewidth : (imgwidth));
                            dimensions[0] = imageModel.referenceheight;
                            var imgdim = (dimensions[1] / aspectRatio) < dimensions[0] ? (dimensions[1] / aspectRatio) : false;
                            if(imgdim === false)
                                dimensions[1] = (dimensions[0] * aspectRatio <= imageModel.referencewidth) ? dimensions[0] * aspectRatio : false;
                            else
                                dimensions[0] = imgdim;
                        } else {
                            dimensions[0] = actimgdim.height;
                            dimensions[1] = actimgdim.width;
                        }
                    }
                }
            }

            if(dimensions[1] > 0 && dimensions[1] < 1)
                dimensions[1] = 1;

            if(dimensions[0] > 0 && dimensions[0] < 1)
                dimensions[0] = 1;

            return dimensions;
        },

        setBase64Img: function(widgetModel) {
            if(widgetModel.src && !widgetModel.src.startsWith("http")) { 
                var req = new XMLHttpRequest();
                req.onreadystatechange = function() {
                    if(req.readyState == 4 && req.status == 200) {
                        widgetModel.base64 = $KU.getBase64(req.responseText) || null;
                    }
                }
                req.open('GET', $KU.getImageURL(widgetModel.src), true);
                if(req.overrideMimeType)
                    req.overrideMimeType('text/plain; charset=x-user-defined');
                req.send(null);
            } else
                widgetModel.base64 = null;
        },

        addOverlayWidgets: function(imageModel, widgetsList) {
            var imageNode, wrapper;
            if($KU.isArray(widgetsList) && widgetsList.length > 0) {
                widgetsList = _getAcceptedWidgets(imageModel, widgetsList);
                if(!imageModel.overlayWidgets) {
                    imageModel.overlayWidgets = [];
                }
                if(widgetsList.length > 0) {
                    imageModel.overlayWidgets = imageModel.overlayWidgets.concat(widgetsList);
                    imageNode = $KU.getNodeByModel(imageModel);
                    if(imageNode) {
                        imageNode = $KW.Utils.getWidgetNodeFromNodeByModel(imageModel, imageNode).childNodes[0];
                        wrapper = document.createElement("div");
                        wrapper.innerHTML = _renderOverlayWidgets(imageModel, widgetsList);
                        while(wrapper.children.length > 0) {
                            imageNode.appendChild(wrapper.childNodes[0]);
                        }
                        module.adjustImageOverlayWidgets(imageModel, widgetsList);
                        $KW.Image.registerLongPress(imageModel, widgetsList);
                    }
                }
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        adjustImageOverlayWidgets: function(imageModel, widgetsList) {
            var parentFrame = imageModel.frame;
            var wModel, wNode, dimensions, i, imageNode,
            widgets = widgetsList || imageModel.overlayWidgets || [], scaleValue;

            if(!widgets.length) {
                return;
            }
            imageNode = $KW.Utils.getWidgetNodeFromNodeByModel(imageModel, $KU.getNodeByModel(imageModel));

            for(i = 0; i < widgets.length; i++) {
                wModel = widgets[i];

                if(!$KW.FlexLayoutEngine.canLayoutUI(imageModel, wModel, imageNode)) {
                    continue;
                }

                wNode = imageNode.querySelector('#' + wModel.id);
                wNode = $KW.Utils.getWidgetNodeFromNodeByModel(wModel, wNode);
                if(!wNode) {
                    continue;
                }
                wNode = wNode.parentNode;
                wModel.finalFrame = {};
                $KW.FlexLayoutEngine.computeLayoutValues(wModel, imageNode, parentFrame);
                $KW.FlexLayoutEngine.determineSize(imageNode, wModel, wNode);
                dimensions = $KW.FlexUtils.getWidgetDimensions(wModel, wNode);
                $KW.FlexLayoutEngine.determineX(wModel, dimensions, imageNode, parentFrame);
                $KW.FlexLayoutEngine.determineY(wModel, dimensions, imageNode, parentFrame);
                $KW.FlexUtils.setWidgetPosition(wModel, wModel.finalFrame, wNode);
                wModel.frame = $KW.FlexLayoutEngine.getWidgetFrame(wModel, dimensions, wModel.finalFrame);
                scaleValue = imageModel.zoomvalue;
                wModel.originalFrame = {
                    x: wModel.frame.x / scaleValue,
                    y: wModel.frame.y / scaleValue,
                    width: wModel.frame.width,
                    height: wModel.frame.height
                };
                wModel.layoutConfig.self = false;
            }
        },

        registerLongPress: function(imageModel, overlayWidgets) {
            var overlayWidgets = overlayWidgets || imageModel.overlayWidgets || [],
            i, wModel, diff, wNode, imageNode;

            if(!overlayWidgets) {
                return;
            }
            imageNode = $KW.Utils.getWidgetNode(imageModel);
            for(i = 0; i < overlayWidgets.length; i++) {
                wModel = overlayWidgets[i];
                wNode = imageNode.querySelector('#' + wModel.id);
                wNode = $KW.Utils.getWidgetNodeFromNodeByModel(wModel, wNode);
                if(!wNode) {
                    continue;
                }
                new kony.gestures.longPress().registerLongPress(wNode, wModel);
            }
        },

        removeOverlayWidgets: function(imageModel, widgetsList) {
            var i, overlayWidgets = imageModel.overlayWidgets, j, finalizedWidgets,
            imageNode, removingNode;

            if($KU.isArray(widgetsList) && widgetsList.length > 0) {
                finalizedWidgets = overlayWidgets.slice(0);
                imageNode = $KU.getNodeByModel(imageModel);
                if(imageNode) {
                    imageNode = $KW.Utils.getWidgetNodeFromNodeByModel(imageModel, imageNode).childNodes[0];

                    for(i = 0; i < widgetsList.length; i++) {
                        for(j = 0; j < finalizedWidgets.length; j++) {
                            if(widgetsList[i].id === finalizedWidgets[j].id) {
                                removingNode = imageNode.childNodes[j + 1];
                                imageNode.removeChild(removingNode);
                                finalizedWidgets.slice(j);
                                break;
                            }
                        }
                    }
                    imageModel.overlayWidgets = finalizedWidgets;
                }
            } else {
                throw new KonyError(102, "Error", "Invalid input.");
            }
        },

        onClickHandler: function(widgetNode) {
            
            var widgetModel = $KU.getModelByNode(widgetNode);
            if(widgetModel.onclick) {
                $KU.executeWidgetEventHandler(widgetModel, widgetModel.onclick);
            }
        },

        overlayWidgetTouchHandler: function(event, targetWidget) {
            
        },

        resizeImageScale: function(imageModel, imageNode, frame) {
            var spanNode, frame = frame || imageModel.frame, zoomvalue = imageModel.zoomvalue,
            imgTagNode, imgTagRects;

            if(zoomvalue > 1) {
                spanNode = imageNode.parentNode;
                spanNode.style.height = (frame.height * zoomvalue) + 'px';
                spanNode.style.width = (frame.width * zoomvalue) + 'px';
                imgTagNode = spanNode.childNodes[0];
                imgTagRects = imgTagNode.getBoundingClientRect();
                imgTagNode.style.height = (imgTagRects.height * zoomvalue) + 'px';
                imgTagNode.style.width = (imgTagRects.width * zoomvalue)+ 'px';
                scrollerInstance = $KG[$KW.Utils.getKMasterWidgetID(imageModel) + '_scroller'];
                if(scrollerInstance) {
                    scrollerInstance.contentoffsetmove = true;
                    scrollerInstance.scrollTo(0, 0, 0); 
                    scrollerInstance.moved = false;
                    scrollerInstance.contentoffsetmove = false;
                    scrollerInstance.refresh();
                }
            }
        }
    };


    return module;
}());
