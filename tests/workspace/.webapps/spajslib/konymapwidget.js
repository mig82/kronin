
$KW.Map = (function() {
    
    
    var getMarkerByIndex = function(index, locationDataList, mapWidget) {
        if(!module.map) {
            return;
        }
        
        if(mapWidget.markers.length) {
            marker = mapWidget.markers[index];
            return marker;
        }
        if(!locationDataList) {
            
            var locationDataList = mapWidget.locationdata;
        }

        var map = module.map;
        var urlt = null;
        var imageURL = (locationDataList[index].lat == undefined) ? locationDataList[index][4 + IndexJL] : (locationDataList[index].image || mapWidget.defaultpinimage);
        urlt = getPinImageURL(imageURL);

        var lat = (locationDataList[index].lat == undefined) ? locationDataList[index][IndexJL] : locationDataList[index].lat;
        var lon = (locationDataList[index].lat == undefined) ? locationDataList[index][1 + IndexJL] : locationDataList[index].lon;
        var desc = (locationDataList[index].lat == undefined) ? locationDataList[index][3 + IndexJL] : locationDataList[index].desc;
        var name = (locationDataList[index].lat == undefined) ? locationDataList[index][2 + IndexJL] : locationDataList[index].name;
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            map: map,
            icon: urlt,
            html: desc,
            hdrdescp: name,
            indexpoint: index
        });
        
        return marker;
    };

    var ConvertDataMaptoData = function(Model, data) {
        var map = Model.widgetdatamapforcallout || {}; 
        var masterdata = {};
        var keys = $KU.getkeys(map);
        var newmap = {};
        for(var i = 0; i < keys.length; i++) {
            newmap[map[keys[i]]] = keys[i];
        }
        var newkeys = $KU.getkeys(newmap);
        for(var j = 0; j < newkeys.length; j++) {
            
            var value = data[newkeys[j]];
            if(value && typeof value != "object" && typeof value !== "number" && value.toLowerCase().indexOf("i18n.getlocalizedstring") != -1)
                masterdata[newkeys[j]] = $KU.getI18NValue(value);
            else
                masterdata[keys[j]] = value;
        }
        return masterdata;
    };

    var CreateMarker = function(markerobj) {
        $KG.__markers = {};
        var mapModel = getMapModel();
        var index = 0;
        var mapCanvasElement = document.querySelectorAll('[name=map_canvas]')[0];
        var mapid = mapCanvasElement.getAttribute("id");
        var contentString = '<div kwidgettype="Kinfowindow" kinfoid="' + mapid + '"';
        var contentStringEnd = '</div>';
        for(var i = IndexJL; i < (markerobj.length - 1); i++) {
            var id = i;
            imageURL = markerobj[i].image;
            urlt = getPinImageURL(imageURL);
            var myLatlng1 = new google.maps.LatLng(markerobj[i].lat, markerobj[i].lon);
            var cmarker = new google.maps.Marker({
                id: id,
                position: myLatlng1,
                map: map,
                icon: urlt,
                html: markerobj[i].desc,
                hdrdescp: markerobj[i].name,
                indexpoint: i,

                draggable: true
            });
            $KG.__markers[id] = cmarker;

            google.maps.event.addListener(cmarker, 'dragend', function(marker) {
                return function() {

                    geocoder.geocode({
                        'latLng': cmarker.getPosition()
                    }, function(results, status) {
                        if(status == google.maps.GeocoderStatus.OK) {
                            module.RenderTheDirection($KG.__markers[0].getPosition(), $KG.__markers[1].getPosition(), markerobj[2]);
                        }
                    });

                }
            }(cmarker));
            new google.maps.event.addListener(cmarker, "click", function() {

                mapModel.onpinselect && mapModel.onpinselect(mapModel.locationdata[parseInt(this.indexpoint)]);


                if(this.showcallout || this.showcallout == undefined) {
                    var infowindow = new google.maps.InfoWindow({
                        content: contentString + ' mappointno="' + index + '">' + "<b>" + name + "</b> <br />" + desc + contentStringEnd
                    });
                    infowindow.setContent(contentString + ' mappointno="' + this.indexpoint + '">' + "<b>" + this.hdrdescp + "</b> <br />" + this.html + contentStringEnd);
                    infowindow.open(map, this);
                }
            });
            cmarker.setMap(map);

        }
    };

    var getInfoWindowByIndex = function(index, locationDataList) {
        if(!module.map) {
            return;
        }
        if(!locationDataList) {
            var mapWidget = getMapModel();
            var locationDataList = mapWidget.locationdata;
        }

        
        
        var mapCanvasElement = document.querySelectorAll('[name=map_canvas]')[0];
        var mapid = mapCanvasElement.getAttribute("id");
        var contentString = '<div kwidgettype="Kinfowindow" kinfoid="' + mapid + '"';
        var contentStringEnd = '</div>';
        var desc = (locationDataList[index].lat == undefined) ? locationDataList[index][3 + IndexJL] : locationDataList[index].desc;
        var name = (locationDataList[index].lat == undefined) ? locationDataList[index][2 + IndexJL] : locationDataList[index].name;
        return new google.maps.InfoWindow({
            content: contentString + ' mappointno="' + index + '">' + "<b>" + name + "</b> <br />" + desc + contentStringEnd
        });
    };

    var setParentForTemplateChildren = function(boxModel, children, parentModel) {
        boxModel.pf = parentModel.id;
        if(children && children.length > 0) {
            for(var i = 0; i < children.length; i++) {
                boxModel[children[i]].pf = parentModel.id;
                setParentForTemplateChildren(boxModel[children[i]], boxModel[children[i]].children, parentModel);
            }
        }
        kony.ui.Form2.prototype.createFormLevelHierarchy.call(parentModel, parentModel.ownchildrenref);
    };

    var _setEnabledMap = function(widgetModel, node) {
        var targetEl = node;

        if(widgetModel && (widgetModel.mapsrc === "static" || $KU.isBlackBerryNTH || ($KU.isWindowsPhone && $KU.isIE9))) {
            targetEl = node.getElementsByTagName("table")[0];
        }

        if(!targetEl) return;

        if(widgetModel.disabled === true || node.getAttribute("kdisabled") === "true") {
            var mask = document.createElement("div");
            mask.style.background = "#fff";
            mask.style.bottom = "0";
            mask.style.left = "0";
            mask.style.opacity = "0.5";
            mask.style.position = "absolute";
            mask.style.right = "0";
            mask.style.top = "0";
            mask.style.zIndex = "2147483647";
            mask.className = "google_map_mask";

            if(!!targetEl && !targetEl.querySelectorAll(".google_map_mask")[0]) {
                widgetModel.oldPosition = targetEl.style.position;
                targetEl.style.position = "relative";
                targetEl.appendChild(mask);
            }
        }
        if(widgetModel.disabled === false || node.getAttribute("kdisabled") === "false" && targetEl) {
            var mask = targetEl.querySelectorAll(".google_map_mask")[0];
            targetEl.style.position = !!widgetModel.oldPosition && widgetModel.oldPosition;
            !!mask && mask.parentNode.removeChild(mask);
        }
    };

    
    var initializeInfoBox = function() {
        if(typeof InfoBox === "undefined") {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "//cdn.rawgit.com/googlemaps/v3-utility-library/master/infobox/src/infobox.js";
            document.body.appendChild(script);
            
            var callback = function() {
                infobox = new InfoBox();
            }
            if(!script.addEventListener) {
                script.onreadystatechange = function() {
                    (this.readyState == 'complete' || this.readyState == 'loaded') && callback();
                };
            } else
                script.onload = callback;
        }
    };

    
    var mapClickEventHandler = function(event) {
        var mapModel = getMapModel();
        if(mapModel.onclick) {
            var maphandler = $KU.returnEventReference(mapModel.onclick);
            var lat = event.latLng && event.latLng.lat();
            var lng = event.latLng && event.latLng.lng();
            
            maphandler && maphandler.call(mapModel, mapModel, {
                "lat": lat,
                "lon": lng
            });
        }
        $KAR && $KAR.sendRecording(mapModel, 'click', {'clickData': event, 'eventType': 'uiAction'});
        
        event.preventDefault && event.preventDefault();
        event.stopPropagation && event.stopPropagation();
    };

    var createInfobox = function(infobox, infoOptions) {
        initializeInfoBox();
        var mapModel = getMapModel();
        if(mapModel.enablemultiplecallouts) {
            infobox = new InfoBox();
        } else {
            pinInfoWindowCloseAll(mapModel);
        }
        var mapElement = $KU.getNodeByModel(mapModel);
        if(mapModel.calloutwidth < 1 || mapModel.calloutwidth > 100)
            mapModel.calloutwidth = 80;
        var infobox_width = mapModel.calloutwidth && (((mapElement.offsetWidth) * mapModel.calloutwidth * 0.01) + "px") || "280px";
        var infobox_left = parseInt(infobox_width, 10) / -2;
        var infobox_top = 0;
        var calloutPostion = mapModel.calloutPostion || "top";
        if(calloutPostion != "bottom") {
            infobox.alignBottom_ = true;
            var mIcon = infoOptions.icon;
            
            if(typeof infoOptions.icon == 'object') {
                mIcon = infoOptions.icon.url;
            }
            var mapKey = mIcon.slice(mIcon.lastIndexOf("/") + 1);
            infobox_top = -(module.pinImageSize[mapKey] ? module.pinImageSize[mapKey].height : 30);
        }
        infobox.content_ = getContentString(infoOptions.coData),
            infobox.disableAutoPan_ = false,
            infobox.position_ = infoOptions.position,
            infobox.maxWidth_ = 450,
            infobox.pixelOffset_ = new google.maps.Size(infobox_left, infobox_top),
            infobox.zIndex_ = 10,
            infobox.boxStyle_ = {
                opacity: 1,
                width: infobox_width,
                background: "none"
            },
            infobox.enableEventPropagation_ = true,
            infobox.closeBoxURL_ = "",
            infoOptions.data && $KW.Utils.updateLayoutData(mapModel, infoOptions.coData, infoOptions.data); 
        infobox.infoBoxClearance_ = new google.maps.Size(0, 0);
        return infobox;
    };

    var getContentString = function(mapCalloutData) {
        var contentString = "";
        var mapModel = getMapModel();
        var mapInfoTemplateData = mapCalloutData.template || mapModel.callouttemplate;
        if(typeof mapInfoTemplateData == "string") {
            mapInfoTemplateData = _kony.mvc.initializeSubViewController(mapInfoTemplateData);
        }
        if(mapInfoTemplateData) {
            mapInfoTemplateData.isTemplate = true;
            mapInfoTemplateData.formPathId = mapModel.formPathId;
            $KG.allTemplates[mapInfoTemplateData.id] = mapInfoTemplateData;
            setParentForTemplateChildren(mapInfoTemplateData, mapInfoTemplateData.children, mapInfoTemplateData);
            var data = ConvertDataMaptoData(mapModel, mapCalloutData);
            data && $KW.Utils.updateLayoutData(mapModel, mapInfoTemplateData, data);
            
            if(mapInfoTemplateData.wType == "FlexContainer") {
                var mapCanvasElement = document.querySelectorAll('[name=map_canvas]')[0];
                $KG.isUILayedOut = false;
                contentString = $KW.FlexContainer.render(mapInfoTemplateData, {});
                if(mapModel.calloutwidth < 1 || mapModel.calloutwidth > 100)
                    mapModel.calloutwidth = 80;
                var infobox_width = mapModel.calloutwidth && (((mapCanvasElement.offsetWidth) * mapModel.calloutwidth * 0.01) + "px") || "280px";
                var wrapper = document.createElement("DIV");
                wrapper.innerHTML = contentString;
                wrapper.style.width = infobox_width;
                mapCanvasElement.appendChild(wrapper);
                $KW.FlexContainer.forceLayout(mapInfoTemplateData, wrapper.children[0]);
                contentString = wrapper.innerHTML;
                mapCanvasElement.removeChild(wrapper);
                $KG.isUILayedOut = true;
                $KW.Utils.initializeGestures(mapInfoTemplateData);
            } else {
                contentString = $KW.HBox.render(mapInfoTemplateData, {
                    topLevelBox: true
                });
            }
            setTimeout(function() {
                $KW.Utils.initializeGestures(mapInfoTemplateData);
            }, 500);
        }
        return contentString;
    };

    var getPinImageURL = function(imageURL) {
        if(typeof imageURL == 'object')
            imageURL = imageURL.source;
        return $KU.getImageURL(imageURL);
    };

    var createDataObjects = function(mapModel) {
        mapModel.pinMarkers = {};
        mapModel.pinInfowindow = {};
        mapModel.circleDataMap = {};
        mapModel.circleData = {};
        mapModel.polygonDataMap = {};
        mapModel.polygonData = {};
        mapModel.polylineDataMap = {};
        mapModel.polylineData = {};
    };

    var _loadMapScripts = function() {
        
        if((typeof google === "undefined" || typeof google.maps === "undefined") && !module.mapScriptRequested) {
            module.mapScriptRequested = true;
            
            
            var mapModel = getMapModel();
            var clientId = mapModel && mapModel.mapClientId;
            var mapApiKey = mapModel.mapApiKey;
            var script = document.createElement("script");
            script.type = "text/javascript";
            
            
            var appProtocol = "https:";
            if(window.location.protocol.indexOf("http") != -1) {
                appProtocol = window.location.protocol;
            }
            if(mapApiKey) {
                script.src = appProtocol + "//maps-api-ssl.google.com/maps/api/js?sensor=false"+ ("&key=" + mapApiKey) +"&callback=$KW.Map.setUpInteractiveCanvasMap";
            }
            else {
                script.src = appProtocol + "//maps-api-ssl.google.com/maps/api/js?sensor=false"+ ( !!clientId && ("&client=" + clientId) || "") +"&callback=$KW.Map.setUpInteractiveCanvasMap";
            }

            document.body.appendChild(script);
        } else {
            return;
        }
        
        var main = $KU.getElementById("__MainContainer");
        if(!main) {
            module.isMainContaineraVailable = false;
        } else {
            module.isMainContaineraVailable = true;
        }
    };

    var mapEventHandler = function(eventObject, target) {
        var id = target.id;
        var mapElem = document.getElementById(target.getAttribute("kformname") + "_static_map");
        var imgsrc = mapElem.getAttribute("src");
        var arr = imgsrc.match(/center=(.*)&/);
        var arr2 = arr[1].split(",");
        if(id.indexOf("_left") != -1) {
            arr2[1] = parseFloat(arr2[1]) - 0.002;
            mapElem.src = imgsrc.replace(/center=(.*)&/, "center=" + arr2[0] + "," + arr2[1] + "&");
        } else if(id.indexOf("_right") != -1) {
            arr2[1] = parseFloat(arr2[1]) + 0.002;
            mapElem.src = imgsrc.replace(/center=(.*)&/, "center=" + arr2[0] + "," + arr2[1] + "&");
        } else if(id.indexOf("_up") != -1) {
            arr2[0] = parseFloat(arr2[0]) - 0.002;
            mapElem.src = imgsrc.replace(/center=(.*)&/, "center=" + arr2[0] + "," + arr2[1] + "&");
        } else if(id.indexOf("_down") != -1) {
            arr2[0] = parseFloat(arr2[0]) + 0.002;
            mapElem.src = imgsrc.replace(/center=(.*)&/, "center=" + arr2[0] + "," + arr2[1] + "&");
        } else if(id.indexOf("_zoomin") != -1) {
            var zoomarr = imgsrc.match(/zoom=(.*)&size/);
            zoomarr = parseInt(zoomarr[1]) + 1;
            mapElem.src = imgsrc.replace(/zoom(.*)&size/, "zoom=" + zoomarr + "&size");
        } else if(id.indexOf("_zoomout") != -1) {
            var zoomarr = imgsrc.match(/zoom=(.*)&size/);
            zoomarr = parseInt(zoomarr[1]) - 1;
            mapElem.src = imgsrc.replace(/zoom(.*)&size/, "zoom=" + zoomarr + "&size");
        }
        

    };

    var mapInfoWindowEventHandler = function(eventObject, target) {
        while(!target.getAttribute("kwidgettype"))
            target = target.parentNode;
        var targetWidgetInfo = target.getAttribute("kinfoid");
        var targetWidgetID = $KU.getElementID(targetWidgetInfo); 
        var mapPointNo = target.getAttribute("mappointno");
        var mapModel = kony.model.getWidgetModel(module.formID, targetWidgetID);
        if(!mapModel) mapModel = getMapModel();
        var selectEvent = $KU.returnEventReference(mapModel.onselection);
        if(isNaN(parseInt(mapPointNo, 10))) {
            selectEvent && $KU.executeWidgetEventHandler(mapModel, selectEvent, mapModel[mapModel.id + "navigatetoloc"]);
            $KAR && $KAR.sendRecording(mapModel, 'clickOnPinCallout', {'locationData': mapModel[mapModel.id + "navigatetoloc"], 'eventType': 'uiAction'});
            
        } else {
            selectEvent && $KU.executeWidgetEventHandler(mapModel, selectEvent, mapModel.locationdata[parseInt(mapPointNo, 10)]);
            $KAR && $KAR.sendRecording(mapModel, 'clickOnPinCallout', {'locationData': mapModel.locationdata[parseInt(mapPointNo, 10)], 'eventType': 'uiAction'});
            
        }
    };

    var _setMapsHeight = function(formId) {
        var mapElementsBody = document.querySelectorAll("#" + formId + " div[kwidgettype='googlemap']");

        if(mapElementsBody) {
            for(var i = 0; i < mapElementsBody.length; i++) {
                var mapElement = mapElementsBody[i];
                var mapModel = $KU.getModelByNode(mapElement);
                if(!mapModel) {
                    var targetWidgetID = mapElement.getAttribute("id").split('_')[1];
                    var sourceFormID = mapElement.getAttribute("id").split('_')[0];
                    var tabPaneID = mapElement.getAttribute("ktabpaneid");
                    mapModel = kony.model.getWidgetModel(sourceFormID, targetWidgetID, tabPaneID);
                }
                $KU.setScrollHeight(mapModel);
            }
        }
    };

    var setPins = function(mapModel, mapData) {
        var data = mapModel.locationData;
        var newData = [];
        if(data && data.length > 0) {
            for(var i = 0; i < mapData.length; ++i) {
                var addItFlag = true;
                for(var j = 0; j < data.length; ++j) {
                    if(data[j].id == mapData[i].id) {
                        addItFlag = false;
                        break;
                    }
                }
                addItFlag && newData.push(mapData[i]);
            }
            newData = data.concat(newData);
        } else {
            newData = mapData;
        }
        mapModel.locationData = newData;
    };

    var getPinAndIndexFromLocationData = function(mapModel, pinId) {
        var data = mapModel.locationData;
        if(data && data.length > 0) {
            for(var i = 0; i < data.length; i++) {
                if(data[i].id == pinId) {
                    return {
                        index: i,
                        data: data[i]
                    };
                }
            }
        }
        return;
    };

    var removeShape = function(mapModel, shapeType, shapeId) {
        if(mapModel[shapeType + "DataMap"][shapeId]) {
            mapModel[shapeType + "DataMap"][shapeId].setMap(null);
            delete mapModel[shapeType + "DataMap"][shapeId];
            delete mapModel[shapeType + "Data"][shapeId];
        }
    };

    var drawShapes = function(mapModel) {
        for(var circleId in mapModel.circleData) {
            drawCircle(mapModel, mapModel.circleData[circleId]);
        }
        for(var polygonId in mapModel.polygonData) {
            drawPolygon(mapModel, mapModel.polygonData[polygonId]);
        }
        for(var polylineId in mapModel.polylineData) {
            drawPolyline(mapModel, mapModel.polylineData[polylineId]);
        }
    };

    var drawCircle = function(mapModel, circledt) {
        var lineColor = '#FF0000',
            fillColor = "white",
            lineWidth = 2;
        var navigateandzoom = true;
        if(circledt) {
            var latValue = circledt.centerLocation.lat;
            var lonValue = circledt.centerLocation.lon;
            var radius = circledt.radius * 10000;
            if(circledt.circleConfig) {
                lineColor = circledt.circleConfig.lineColor;
                fillColor = circledt.circleConfig.fillColor;
                lineWidth = circledt.circleConfig.lineWidth;
            }
            if(circledt.navigateAndZoom)
                navigateandzoom = circledt.navigateAndZoom;

            
            var centerLoc = new google.maps.LatLng(latValue, lonValue);
            if(navigateandzoom)
                module.map.panTo(centerLoc);

            var _circle = new google.maps.Circle({
                strokeColor: lineColor,
                strokeWeight: lineWidth,
                fillColor: fillColor,
                map: module.map,
                center: centerLoc,
                radius: radius
            });
            mapModel.circleDataMap[circledt.id] = _circle;
        }
    };

    var drawPolygon = function(mapModel, polygondt) {
        var lineColor = '#FF0000',
            fillColor = "white",
            lineWidth = 2,
            polyArrya = [];
        if(polygondt) {
            var polyCoords = polygondt.locations;
            if(polyCoords && polyCoords.length > 0 && polyCoords[0].lon) {
                for(var i = 0; i < polyCoords.length; i++) {
                    polyCoords[i].lng = polyCoords[i].lon;
                    polyCoords[i].lat = parseFloat(polyCoords[i].lat);
                    polyCoords[i].lng = parseFloat(polyCoords[i].lng);
                    delete polyCoords[i].lon;
                }
            }
            polyArrya.push(polyCoords);

            if(polygondt.polygonConfig) {
                lineColor = polygondt.polygonConfig.lineColor;
                fillColor = polygondt.polygonConfig.fillColor;
                lineWidth = polygondt.polygonConfig.lineWidth;

                if(polygondt.polygonConfig.innerPolygons) {
                    var innerPolyCoords = polygondt.polygonConfig.innerPolygons;
                    var inner, index;
                    for(index = 0; index < innerPolyCoords.length; index++) {
                        inner = innerPolyCoords[index];
                        polyArrya.push(inner);
                        if(inner && inner[0].lon) {
                            for(var i = 0; i < inner.length; i++) {
                                inner[i].lng = inner[i].lon;
                                inner[i].lat = parseFloat(inner[i].lat);
                                inner[i].lng = parseFloat(inner[i].lng);
                                delete inner[i].lon;
                            }
                        }
                    }
                }
            }
        }
        var polyGon = new google.maps.Polygon({
            strokeColor: lineColor,
            strokeWeight: lineWidth,
            fillColor: fillColor
        });
        
        polyGon.setMap(module.map);
        polyGon.setPaths(polyArrya);
        mapModel.polygonDataMap[polygondt.id] = polyGon;
    };

    var setPolylinePinData = function(polylinedata, pindata, locationpt) {
        if(!polylinedata) return;
        var pinLocation = polylinedata[locationpt];
        if(pinLocation) {
            if(!pinLocation.id)
                pinLocation.id = polylinedata.id + "_" + locationpt;
            pindata.push(pinLocation);
        }
    };

    var drawPolyline = function(mapModel, polylinedata) {
        var lineColor = '#FF0000',
            lineWidth = 2,
            polylineCoordinates = [],
            pindata = [];
        if(polylinedata) {
            setPolylinePinData(polylinedata, pindata, "startLocation");
            setPolylinePinData(polylinedata, pindata, "endLocation");
            if(pindata.length > 0) {
                createMarkersForLocations(mapModel, pindata);
            }
            var polyCoords = polylinedata.locations;
            if(polyCoords && polyCoords.length > 0 && polyCoords[0].lon) {
                for(var i = 0; i < polyCoords.length; i++) {
                    polyCoords[i].lng = polyCoords[i].lon;
                    polyCoords[i].lat = parseFloat(polyCoords[i].lat);
                    polyCoords[i].lng = parseFloat(polyCoords[i].lng);
                    delete polyCoords[i].lon;
                }
            }
            polylineCoordinates = polyCoords;
            if(polylinedata.polygonConfig) {
                lineColor = polylinedata.polygonConfig.lineColor;
                lineWidth = polylinedata.polygonConfig.lineWidth;
            }
        }
        var polyLine = new google.maps.Polyline({
            path: polylineCoordinates,
            strokeColor: lineColor,
            strokeWeight: lineWidth
        });
        polyLine.setMap(module.map);
        mapModel.polylineDataMap[polylinedata.id] = polyLine;
    };

    var pinInfoWindowCloseAll = function(mapModel) {
        var pinInfowindow = mapModel.pinInfowindow;
        for(var pinId in pinInfowindow) {
            if(pinInfowindow.hasOwnProperty(pinId)) {
                pinInfoWindowClose(mapModel, pinId);
            }
        }
    };

    var pinInfoWindowClose = function(mapModel, pinId) {
        var infowindow = mapModel.pinInfowindow[pinId];
        infowindow && infowindow.close();
        delete mapModel.pinInfowindow[pinId];
    };

    
    var cachePinSizeAndSetupMarkers = function(mapModel, imageObj, markerOptions, navigateToFlag) {
        
        if(typeof module.pinImageSize === 'undefined')
            module.pinImageSize = {};

        var urlt = getPinImageURL(imageObj);
        var img = new Image();
        img.src = urlt;
        var mapKey = urlt.slice(urlt.lastIndexOf("/") + 1);
        markerOptions.icon = urlt;

        var anchorPosition = kony.map.PIN_IMG_ANCHOR_BOTTOM_CENTER;
        if(typeof imageObj == 'object' && imageObj.anchor) {
            anchorPosition = imageObj.anchor;
        }
        if(anchorPosition == kony.map.PIN_IMG_ANCHOR_BOTTOM_CENTER) {
            if(navigateToFlag) setMarkerNavigateTo(mapModel, markerOptions);
            else setMarkerOnMap(mapModel, markerOptions);
        }
        if(!module.pinImageSize[mapKey]) {
            
            img.onload = function() {
                module.pinImageSize[mapKey] = {
                    height: this.naturalHeight,
                    width: this.naturalWidth
                };
                invokeAnchorMarker(mapModel, markerOptions, urlt, anchorPosition, this.naturalHeight, this.naturalWidth, navigateToFlag);
            }
        } else {
            invokeAnchorMarker(mapModel, markerOptions, urlt, anchorPosition, module.pinImageSize[mapKey].height, module.pinImageSize[mapKey].width, navigateToFlag);
        }
    };

    var invokeAnchorMarker = function(mapModel, markerOptions, url, anchorPosition, height, width, navigateToFlag) {
        if(anchorPosition != kony.map.PIN_IMG_ANCHOR_BOTTOM_CENTER) {
            markerOptions.icon = getAnchorMarkerIcon(url, anchorPosition, height, width);
            if(navigateToFlag) setMarkerNavigateTo(mapModel, markerOptions);
            else setMarkerOnMap(mapModel, markerOptions);
        }
    };

    
    var getAnchorMarkerIcon = function(url, anchorPosition, height, width) {
        switch(anchorPosition) {
            case kony.map.PIN_IMG_ANCHOR_TOP_LEFT:
                height = height + height;
                width = width;
                break;
            case kony.map.PIN_IMG_ANCHOR_TOP_RIGHT:
                height = height + height;
                width = 0;
                break;
            case kony.map.PIN_IMG_ANCHOR_TOP_CENTER:
                height = height + height;;
                width = parseInt(width / 2, 10);
                break;
            case kony.map.PIN_IMG_ANCHOR_CENTER:
                height = parseInt(height / 2, 10) + height;
                width = parseInt(width / 2, 10);
                break;
            case kony.map.PIN_IMG_ANCHOR_BOTTOM_LEFT:
                height = height;
                width = width;
                break;
            case kony.map.PIN_IMG_ANCHOR_BOTTOM_RIGHT:
                height = height;
                width = 0;
                break;
            case kony.map.PIN_IMG_ANCHOR_MIDDLE_LEFT:
                height = parseInt(height / 2, 10) + height;
                width = width;
                break;
            case kony.map.PIN_IMG_ANCHOR_MIDDLE_RIGHT:
                height = parseInt(height / 2, 10) + height;
                width = 0;
                break;
            case kony.map.PIN_IMG_ANCHOR_BOTTOM_CENTER:
                height = height;
                width = parseInt(width / 2, 10);
                break;
        }

        return {
            url: url,
            anchor: new google.maps.Point(width, height)
        };
    };

    var createMarkersForLocations = function(mapModel, mapdata) {
        for(var i = IndexJL; i < (mapdata.length); i++) {
            var imageURL = '';
            var myLatlng1 = new google.maps.LatLng(mapdata[i].lat, mapdata[i].lon);
            if(mapdata[IndexJL].lat == undefined) {
                imageURL = (mapdata[i][4 + IndexJL] || mapModel.defaultpinimage);
                myLatlng1 = new google.maps.LatLng(mapdata[i][IndexJL], mapdata[i][1 + IndexJL]);
            } else {
                imageURL = (mapdata[i].image || mapModel.defaultpinimage);
            }
            var desc = (mapdata[IndexJL].lat == undefined) ? mapdata[i][3 + IndexJL] : mapdata[i].desc;
            var name = (mapdata[IndexJL].lat == undefined) ? mapdata[i][2 + IndexJL] : mapdata[i].name;
            var showcallout = (mapdata[IndexJL].lat == undefined) ? mapdata[i][5 + IndexJL] : (mapdata[i].showcallout || mapdata[i].showCallout);
            var coData = mapdata[i].calloutData || mapdata[i].calloutdata;
            var pinId = mapdata[i].id || "noPinId";
            var markerOptions = {
                position: myLatlng1,
                html: desc,
                hdrdescp: name,
                map: module.map,
                indexpoint: i,
                pinId: pinId,
                coData: coData,
                showcallout: showcallout
            };
            cachePinSizeAndSetupMarkers(mapModel, imageURL, markerOptions, false); 
        }
    };

    var setMarkerOnMap = function(mapModel, markerOptions) {
        var marker1 = new google.maps.Marker(markerOptions);
        mapModel.markers.push(marker1);
        delete mapModel.pinMarkers[markerOptions.pinId];
        mapModel.pinMarkers[markerOptions.pinId] = marker1;
        new google.maps.event.addListener(marker1, "click", function() {
            if(!this.eventFromNavigateTo) {
                var pinClickEvent = $KU.returnEventReference(mapModel.onpinclick);
                pinClickEvent && pinClickEvent.call(mapModel, mapModel, mapModel.locationdata[parseInt(this.indexpoint)]);
                $KAR && $KAR.sendRecording(mapModel, 'clickOnPin', {'locationData': mapModel.locationdata[parseInt(this.indexpoint)], 'eventType': 'uiAction'});
            } 
            pinInfoWindowClose(mapModel, this.pinId);
            if(this.showcallout || this.showcallout == undefined || this.forceShowcallout) {
                if(this.coData) {
                    infobox = createInfobox(infobox, markerOptions);
                    infobox.open(this.map, this);
                    mapModel.pinInfowindow[this.pinId] = infobox;
                } else {
                    var infowindow = new google.maps.InfoWindow({
                        content: "holding..."
                    });
                    var contentString = '<div kwidgettype="Kinfowindow" kinfoid="' + mapModel.id + '"';
                    infowindow.setContent(contentString + ' mappointno="' + this.indexpoint + '">' + '<b kwidgettype="Kinfowindow" kinfoid="' + mapModel.id + '" mappointno="' + this.indexpoint + '">' + this.hdrdescp + "</b> <br />" + this.html + '</div>');
                    infowindow.open(this.map, this);
                    if(mapModel.autocenterpinonclick) {
                        this.map.setCenter(this.getPosition());
                    }
                    mapModel.pinInfowindow[this.pinId] = infowindow;
                }
            }
            this.forceShowcallout = false; 
            this.eventFromNavigateTo = false; 
        });
        marker1.setMap(markerOptions.map);
    };

    var setMarkerNavigateTo = function(mapModel, markerOptions) {
        var locationData = markerOptions.locationData;
        var index = "navigatetoloc";
        marker = new google.maps.Marker(markerOptions);
        if(!markerOptions.visible) marker.setMap(null);
        mapModel[mapModel.id + index] = locationData;
        if(markerOptions.showcallout) {
            var coData = locationData.calloutData || locationData.calloutdata;
            if(coData) {
                markerOptions.coData = coData;
                infobox = createInfobox(infobox, markerOptions);
                new google.maps.event.addListener(marker, "click", function() {
                    if(mapModel.autocenterpinonclick) {
                        this.map.setCenter(this.getPosition());
                    }
                    infobox.open(this.map, infobox);
                });
                infobox.open(this.map, infobox);
            } else {
                var infowindow = new google.maps.InfoWindow({
                    content: '<div kwidgettype="Kinfowindow" kinfoid="' + mapModel.id + '" mappointno="' + index + '"> <b>' + markerOptions.hdrdescp + '</b> <br />' + markerOptions.html + '</div>',
                });
                if(locationData && locationData.showcallout) {
                    new google.maps.event.addListener(marker, "click", function() {
                        if(mapModel.autocenterpinonclick) {
                            this.map.setCenter(this.getPosition());
                        }
                        infowindow.open(this.map, this);
                    });
                }
                infowindow.open(this.map, marker);
            }
        }
    };

    
    var onMapLoadedHandler = function() {
        var mapModel = getMapModel();
        if(!mapModel.loadedFlag) {
            mapModel.loadedFlag = true;
            
            if(mapModel.onmaploaded) {
                var maploadedhandler = $KU.returnEventReference(mapModel.onmaploaded);
                
                maploadedhandler && maploadedhandler.call(mapModel, mapModel);
            }
        }
        new google.maps.event.removeListener(module.tilesLoadedEventListener);
    };

    
    var mapBoundsChangeHandler = function() {
        var mapModel = getMapModel();
        if(mapModel.onboundschanged) {
            var boundschangedhandler = $KU.returnEventReference(mapModel.onboundschanged);
            if(boundschangedhandler) {
                var bounds = module.map.getBounds();
                var boundsval = {
                    "center": [bounds.getCenter().lat(), bounds.getCenter().lng()],
                    "northEast": [bounds.getNorthEast().lat(), bounds.getNorthEast().lng()],
                    "southWest": [bounds.getSouthWest().lat(), bounds.getSouthWest().lng()],
                    "latspan": bounds.toSpan().lat(),
                    "lonspan": bounds.toSpan().lng()
                };
                boundschangedhandler.call(mapModel, mapModel, boundsval);
            }
        }
    };

    var getMarkerDataforStaticMaps = function(mapModel) {
        var mapdata = mapModel.locationdata || mapModel.address;
        var markers = "";
        for(var i = IndexJL; i < mapdata.length; i++) {
            var lat = (mapdata[IndexJL].lat == undefined) ? mapdata[i][IndexJL] : mapdata[i].lat;
            var lon = (mapdata[IndexJL].lat == undefined) ? mapdata[i][1 + IndexJL] : mapdata[i].lon;
            (typeof mapModel.newPinimage != undefined) && (markers += "icon:" + mapModel.newPinimage + "%7C");
            
            markers += lat + "," + lon;
            if(i != mapdata.length)
                markers += "&markers=";
        }
        return markers;
    };

    var getMapModel = function() {
        var mapModel;
        if(module.kmasterID) {
            mapModel = $KU.getWidgetModelByID(module.formID + "_" + module.kmasterID + "_" + module.mapID);
        } else {
            mapModel = kony.model.getWidgetModel(module.formID, module.mapID);
        }
        return mapModel;
    };
    

    var module = {
        formID: null,
        mapID: null,
        kmasterID: null,
        map: null,
        navigateToArgs: null,
        navigateToLocationArgs: null,
        mapScriptRequested: false,
        mapScriptLoaded: false,
        currentLatitude: null,
        currentLongitude: null,
        currentZoom: 15,
        routeToLocationArgs: null,
        circleData: null,
        polygonData: null,
        circleDataMap: null,
        polygonDataMap: null,

        initialize: function() {
            kony.events.addEvent("click", "Kinfowindow", mapInfoWindowEventHandler);
            kony.events.addEvent("click", 'Kstaticmap', mapEventHandler);
            kony.events.addEvent("onorientationchange", "Map", _setMapsHeight);
        },

        initializeView: function(formId) {
            
            if(document.querySelectorAll("div[name=map_canvas]").length > 0) {
                _loadMapScripts();
            }
            
            
            var screenlLevelWidgetModel = $KG["__currentForm"] ? $KU.getScreenLevelWidgetModel($KG["__currentForm"]) : '';
            if(!screenlLevelWidgetModel)
                _setMapsHeight(formId);

        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            switch(propertyName) {
                case "address":
                case "locationdata":
                    if((widgetModel.mapsrc === "static") || $KU.isBlackBerryNTH || ($KU.isWindowsPhone && $KU.isIE9)) {
                        var mapElem = document.getElementById(widgetModel.pf + "_static_map");
                        if(!mapElem)
                            return;
                        var imgsrc = mapElem.getAttribute("src");
                        if(propertyName == "locationdata") {
                            var markers = getMarkerDataforStaticMaps(widgetModel);
                            if(imgsrc.indexOf("&markers") != -1) {
                                mapElem.src = imgsrc;
                                mapElem.src = mapElem.src.replace(/center=(.*)$/, "");
                                var center = "center=" + (!!propertyValue.length && propertyValue[0].lat || 0) + "," + (!!propertyValue.length && propertyValue[0].lon || 0) + "&";
                                mapElem.src += center;
                                mapElem.src += imgsrc.match(/markers=(.*)$/)[0] + markers;
                            } else
                                mapElem.src = imgsrc + "&markers=" + markers;
                        } else {
                            if(imgsrc.indexOf("&markers") != -1) {
                                imgsrc = imgsrc.replace(/markers=(.*)$/, "").replace("&markers=", "");
                            }
                            mapElem.src = imgsrc.replace(/center=(.*)&/, "center=" + propertyValue.location + "&markers=color:red%7C" + propertyValue.location);
                        }

                    } else {
                        var mapNode = $KU.getNodeByModel(widgetModel);
                        if(!mapNode)
                            return;
                        if(module.mapScriptLoaded) {
                            var main = $KU.getElementById("__MainContainer"); 
                            if(!main) {
                                module.isMainContaineraVailable = false;
                            } else {
                                this.setUpInteractiveCanvasMap();
                            }
                        } else {
                            _loadMapScripts();
                        }
                    }
                    break;

                case "zoom":
                case "zoomlevel":
                case "mode":
                    if($KU.isBlackBerryNTH || ($KU.isWindowsPhone && $KU.isIE9)) {
                        var mapElem = document.getElementById(widgetModel.pf + "_static_map");
                        if(!mapElem)
                            return;
                        var imgsrc = mapElem.getAttribute("src");
                        var mapMode = "";

                        switch(parseInt(widgetModel.mode, 10)) {
                            case 2:
                                mapMode = "satellite";
                                break;

                            case 3:
                                mapMode = "hybrid";
                                break;

                            case 5:
                                mapMode = "polygon";
                                break;

                            case 7:
                                mapMode = "terrain";
                                break;

                            default:
                                mapMode = "normal";
                        }
                        if(propertyName == "mode")
                            mapElem.src = imgsrc.replace(/maptype=(.*)&mobile/, ("maptype=" + mapMode + "&mobile"));
                        else if(propertyName == "zoom" || propertyName == "zoomlevel")
                            mapElem.src = imgsrc.replace(/zoom(.*)&size/, "zoom=" + parseInt(propertyValue) + "&size");
                    } else {
                        var mapCanvasElement = document.querySelectorAll('[name=map_canvas]')[0];
                        mapCanvasElement && this.setUpInteractiveCanvasMap();
                    }
                    break;

                case "defaultpinimage":
                    var mapCanvasElement = document.querySelectorAll('[name=map_canvas]')[0];
                    if((widgetModel && widgetModel.mapsrc === "static") || $KU.isBlackBerryNTH || ($KU.isWindowsPhone && $KU.isIE9)) {
                        var pinimageurl = getPinImageURL(propertyValue);
                        pinimageurl = widgetModel.newPinimage = location.origin + "/" + pinimageurl;
                        this.setUpInteractiveCanvasMap();
                    } else {
                        widgetModel.defaultpinimage = propertyValue;
                        mapCanvasElement && this.setUpInteractiveCanvasMap();
                    }
                    break;
            }

        },

        render: function(mapModel, context) {
            mapModel.needScroller = true;
            mapModel.loadedFlag = false; 
            createDataObjects(mapModel);
            this.formID = mapModel.pf;
            this.mapID = mapModel.id;
            var computedSkin = $KW.skins.getWidgetSkinList(mapModel, context);
            var htmlString = "",
                controls = "";
            var mapsrc = mapModel.mapsrc || mapModel.mapsource;
            var appProtocol = "https:";
            if(window.location.protocol.indexOf("http") != -1) {
                appProtocol = window.location.protocol;
            }

            if((mapsrc === "static") || $KU.isBlackBerryNTH || ($KU.isWindowsPhone && $KU.isIE9)) {
                var visibility = $KW.skins.getVisibilitySkin(mapModel);
                var mapMode = "";
                switch(parseInt(mapModel.mode, 10)) {
                    case 2:
                        mapMode = "satellite";
                        break;

                    case 3:
                        mapMode = "hybrid";
                        break;

                    case 5:
                        mapMode = "polygon";
                        break;

                    case 7:
                        mapMode = "terrain";
                        break;

                    default:
                        mapMode = "normal";
                }
                var mapdata = mapModel.locationdata || mapModel.address;
                var centrallat = 0;
                var centrallon = 0;
                var markers = "";
                
                if(mapdata && mapdata[IndexJL]) {
                    centrallat = (mapdata[IndexJL].lat == undefined) ? mapdata[IndexJL][IndexJL] : mapdata[IndexJL].lat;
                    centrallon = (mapdata[IndexJL].lat == undefined) ? mapdata[IndexJL][1 + IndexJL] : mapdata[IndexJL].lon;
                    markers = getMarkerDataforStaticMaps(mapModel);
                }

                var upimage = getPinImageURL(mapModel.upimg ? mapModel.upimg : "tupF.png");
                var downimage = getPinImageURL(mapModel.downimg ? mapModel.downimg : "tdownF.png");
                var rightimage = getPinImageURL(mapModel.rightimg ? mapModel.rightimg : "trightF.png");
                var leftimage = getPinImageURL(mapModel.leftimg ? mapModel.leftimg : "tleftF.png");
                var zoominimage = getPinImageURL(mapModel.zoomin ? mapModel.zoomin : "zoomin.png");
                var zoomoutimage = getPinImageURL(mapModel.zoomout ? mapModel.zoomout : "zoomout.png");

                controls = "<table>" +
                    "<tr><td><img kwidgettype ='Kstaticmap' kformname='" + mapModel.pf + "' id='" + mapModel.id + "_up_event' src = '" + upimage + "'/></td>" +
                    "<td><img kwidgettype ='Kstaticmap' kformname='" + mapModel.pf + "' id='" + mapModel.id + "_down_event' src = '" + downimage + "'/></td>" +
                    "<td><img kwidgettype ='Kstaticmap' kformname='" + mapModel.pf + "' id='" + mapModel.id + "_right_event' src = '" + rightimage + "'/></td>" +
                    "<td><img kwidgettype ='Kstaticmap' kformname='" + mapModel.pf + "' id='" + mapModel.id + "_left_event' src = '" + leftimage + "'/></td>" +
                    "<td><img kwidgettype ='Kstaticmap' kformname='" + mapModel.pf + "' id='" + mapModel.id + "_zoomin_event' src = '" + zoominimage + "'/></td>" +
                    "<td><img kwidgettype ='Kstaticmap' kformname='" + mapModel.pf + "' id='" + mapModel.id + "_zoomout_event' src = '" + zoomoutimage + "'/></td></tr></table>";

                if(mapModel.disabled) {
                    controls = "<table style='position:relative;'>" +
                        "<tr><td>" +
                        "<div style='background:#fff;bottom:0;left:0;opacity:0.5;filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=50);filter:alpha(opacity=50);position:absolute;right:0;top:0;z-index:2147483647' class='google_map_mask'></div>" +
                        "<img kwidgettype ='Kstaticmap' kformname='" + mapModel.pf + "' id='" + mapModel.id + "_up_event' src = '" + upimage + "'/></td>" +
                        "<td><img kwidgettype ='Kstaticmap' kformname='" + mapModel.pf + "' id='" + mapModel.id + "_down_event' src = '" + downimage + "'/></td>" +
                        "<td><img kwidgettype ='Kstaticmap' kformname='" + mapModel.pf + "' id='" + mapModel.id + "_right_event' src = '" + rightimage + "'/></td>" +
                        "<td><img kwidgettype ='Kstaticmap' kformname='" + mapModel.pf + "' id='" + mapModel.id + "_left_event' src = '" + leftimage + "'/></td>" +
                        "<td><img kwidgettype ='Kstaticmap' kformname='" + mapModel.pf + "' id='" + mapModel.id + "_zoomin_event' src = '" + zoominimage + "'/></td>" +
                        "<td><img kwidgettype ='Kstaticmap' kformname='" + mapModel.pf + "' id='" + mapModel.id + "_zoomout_event' src = '" + zoomoutimage + "'/></td></tr>" +
                        "</table>";
                    
                    
                }

                
                htmlString = "<div id='" + mapModel.pf + "_" + mapModel.id + "'class='" + visibility + "' style='" + $KW.skins.getMarginSkin(mapModel, context) + $KW.skins.getPaddingSkin(mapModel) + "' kwidgettype='Map' >" + controls;
                htmlString += "<img id='" + mapModel.pf + "_static_map' alt='Map Widget' style='width:100%;' src='"+appProtocol+"'://maps.google.com/maps/api/staticmap?sensor=false&zoom=15&size=400x400&format=png32&maptype=" + mapMode + "&mobile=true&center=" + centrallat + "," + centrallon +
                    "&markers=" + markers + "'/></div>";

            } else if(mapsrc == "native") {
                mapModel.widgetdata = appProtocol + "//maps.google.com/maps?q=17.447326,78.371358";
                htmlString = "<a style='text-decoration:none;' href='" + mapModel.widgetdata + "'>Google Map Name</a>"
            } else {
                var isPolygonview = "";
                if(mapModel.mapview === "5" || mapModel.mode == "5") {
                    isPolygonview = " mapview='polygon' ";
                }
                mapModel.formPathId = mapModel.pf + '_' + mapModel.id;


                htmlString = "<div kwidgettype='googlemap'  " + $KW.Utils.getBaseHtml(mapModel, context) + "  name='map_canvas'" + isPolygonview + " style='height:500px;" + $KW.skins.getMarginSkin(mapModel, context) + $KW.skins.getPaddingSkin(mapModel) + "' class='" + computedSkin +
                    "' konywidgetdata='" + mapModel.widgetdata + "'></div>";

                if(mapModel.kmasterid) mapModel.formPathId = mapModel.pf + '_' + mapModel.kmasterid + '_' + mapModel.id;

                this.kmasterID = mapModel.kmasterid;

            }
            return htmlString;
        },

        setUpInteractiveCanvasMap: function() {
            if("undefined" === typeof google) {
                
                $KG["mapScriptLoaded"] = false;
                module.mapScriptLoaded = false;
                return;
            }
            var mapModel = getMapModel();
            if(!mapModel)
                return;
            $KG["mapScriptLoaded"] = true;
            module.mapScriptLoaded = true;
            mapModel.markers = []; 
            
            if(mapModel && mapModel.mapsrc === "static" && ($KU.isBlackBerryNTH || ($KU.isWindowsPhone && $KU.isIE9))) {
                var mapElem = document.getElementById(mapModel.pf + "_static_map");
                var imgsrc = mapElem.getAttribute("src");
                var markers = getMarkerDataforStaticMaps(mapModel);
                imgsrc = imgsrc.replace(/markers=(.*)$/, "");
                mapElem.src = imgsrc + "&markers=" + markers;

            } else {
                var mapCanvasElement = document.querySelectorAll('[name=map_canvas]')[0];

                $KG["mapScriptLoaded"] = "false";
                if(mapCanvasElement) {
                    try {
                        var mapModel = getMapModel();
                        switch(parseInt(mapModel.mode, 10)) {
                            case 2:
                                var mapMode = google.maps.MapTypeId.SATELLITE;
                                break;

                            case 3:
                                var mapMode = google.maps.MapTypeId.HYBRID;
                                break;

                            case 7:
                                var mapMode = google.maps.MapTypeId.TERRAIN;
                                break;

                            default:
                                var mapMode = google.maps.MapTypeId.ROADMAP;
                        }
                    } catch(e) {
                        window.console && kony.web.logger("log", "google : map script has not loaded yet");
                        return;
                    }
                    
                    var mapview = mapCanvasElement.getAttribute("mapview");

                    var mapdata = mapModel.locationdata || mapModel.address;
                    var mapjsondata = mapdata;
                    var centralzoom = mapModel.zoomlevel || 15;
                    var myOptions = {
                        zoom: centralzoom,
                        disableDefaultUI: true,
                        zoomControl: true,
                        navigationControl: true,
                        mapTypeControl: mapModel.displaymaptypecontrols,
                        scaleControl: true,
                        mapTypeId: mapMode
                    };
                    var map;
                    
                    if(mapdata) {
                        var geocoder = new google.maps.Geocoder();
                        if(mapdata.location) {
                            map = new google.maps.Map(mapCanvasElement, myOptions)
                            geocoder.geocode({
                                'address': mapdata.location
                            }, function(results, status) {
                                if(status == google.maps.GeocoderStatus.OK) {
                                    map.setCenter(results[0].geometry.location);
                                    var marker = new google.maps.Marker({
                                        map: map,
                                        position: results[0].geometry.location
                                    });
                                }
                            });
                        } else if(mapdata.length >= 1 + IndexJL) {
                            var centrallat = mapdata[IndexJL].lat,
                                centrallon = mapdata[IndexJL].lon;
                            var points = [],
                                myLatlng, myOptions;

                            if(mapdata[IndexJL].lat == undefined) {
                                centrallat = mapdata[IndexJL][IndexJL];
                                centrallon = mapdata[IndexJL][1 + IndexJL];
                            }
                            
                            myLatlng = new google.maps.LatLng(centrallat, centrallon);
                            myOptions.center = myLatlng, myOptions.zoomControl = undefined;
                            map = new google.maps.Map(mapCanvasElement, myOptions);
                            module.map = map;
                            mapModel.map = map;

                            initializeInfoBox();

                            if(mapview == null && mapModel.mode != "5") {
                                createMarkersForLocations(mapModel, mapdata);
                            } else {
                                var polyPoint = '';
                                for(var i = IndexJL; i < (mapdata.length); i++) {

                                    if(mapdata[IndexJL].lat == undefined) {
                                        polyPoint = new google.maps.LatLng(mapdata[i][IndexJL], mapdata[i][IndexJL]);
                                    } else {
                                        polyPoint = new google.maps.LatLng(mapdata[i].lat, mapdata[i].lon);
                                    }
                                    points.push(polyPoint);
                                }
                                var bermudaTriangle = new google.maps.Polygon({
                                    paths: points,
                                    strokeColor: "#FF0000",
                                    strokeOpacity: 0.8,
                                    strokeWeight: 3,
                                    fillColor: "#FF0000",
                                    fillOpacity: 0.35
                                });
                                bermudaTriangle.setMap(map);
                            }

                        } else if(mapdata.length == 0) {
                            
                            myOptions.center = new google.maps.LatLng(0, 0);
                            map = new google.maps.Map(mapCanvasElement, myOptions);
                            module.map = map;
                            mapModel.map = map;
                        }
                    } else {
                        myOptions.center = new google.maps.LatLng(0, 0);
                        map = new google.maps.Map(mapCanvasElement, myOptions);
                        module.map = map;
                        mapModel.map = map;
                        
                    }
                    _setEnabledMap(mapModel, mapCanvasElement);
                    if(module.navigateToArgs) {
                        module.navigateTo(module.navigateToArgs.mapModel, module.navigateToArgs.index, module.navigateToArgs.showCallOut);
                    }
                    if(module.navigateToLocationArgs) {
                        module.navigateToLocation(module.navigateToLocationArgs.mapModel, module.navigateToLocationArgs.locationData, module.navigateToLocationArgs.showCallOut, module.navigateToLocationArgs.dropPin);
                    }
                    if(module.routeToLocationArgs) {
                        module.navigateToLocation(module.routeToLocationArgs.mapModel, module.routeToLocationArgs.startlocationData, module.routeToLocationArgs.endlocationData, module.routeToLocationArgs.waypointslocation, module.routeToLocationArgs.routeConfig);
                    }
                    new google.maps.event.addListener(this.map, 'click', mapClickEventHandler);
                    new google.maps.event.addListener(this.map, 'bounds_changed', mapBoundsChangeHandler);
                    var tilesLoadedEventListener = new google.maps.event.addListener(this.map, 'tilesloaded', onMapLoadedHandler);
                    module.tilesLoadedEventListener = tilesLoadedEventListener;
                    drawShapes(mapModel);
                }
            }
        },

        routeLocations: function(mapWidget, startLocation, endLocation, locations, routeConfig) {
            if(!this.map) {
                return;
            }
            markers = {};
            
            var rendererOptions = {
                draggable: true,
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: routeConfig.lineColor,
                    strokeOpacity: 1,
                    strokeWeight: routeConfig.lineWidth
                }
            };
            directionsService = new google.maps.DirectionsService();
            directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
            geocoder = new google.maps.Geocoder();
            var startlocation = new google.maps.LatLng(startLocation.lat, startLocation.lon);
            var endlocation = new google.maps.LatLng(endLocation.lat, endLocation.lon);
            var mapCanvasElement = document.querySelectorAll('[name=map_canvas]')[0];
            var myOptions = {
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                center: startlocation
            };


            map = new google.maps.Map(mapCanvasElement, myOptions);
            directionsDisplay.setMap(map);
            this.map = map;
            mapWidget.map = map;

            this.RenderTheDirection(startlocation, endlocation, locations);
            var markerObject = [startLocation, endLocation, locations];
            CreateMarker(markerObject);
        },

        navigateTo: function(mapWidget, index, showcallout) {
            if(!this.navigateToArgs) {
                this.navigateToArgs = {
                    'mapModel': mapWidget,
                    'index': index,
                    'showCallOut': showcallout
                };
            }
            if(!this.map) {
                return;
            }
            var index = parseInt(index);
            var map = this.map;
            var centrallat = '';
            var centrallon = '';
            var mapdata = mapWidget.locationdata;

            
            if(index < 1 && index >= mapdata.length) {
                return;
            }
            if(mapdata[index]) {
                centrallat = mapdata[index].lat;
                centrallon = mapdata[index].lon;
                if(mapdata[index].lat == undefined) {
                    centrallat = mapdata[index][IndexJL];
                    centrallon = mapdata[index][1 + IndexJL];
                }
            }

            map.setCenter(new google.maps.LatLng(centrallat, centrallon));

            if(showcallout) {
                
                var marker = getMarkerByIndex(index, mapdata, mapWidget);
                marker.forceShowcallout = true; 
                marker.eventFromNavigateTo = true; 
                google.maps.event.trigger(marker, "click");
            }
            this.navigateToArgs = null;
        },

        navigateToLocation: function(mapWidget, locationData, showcallout, dropPin) {
            if(!this.navigateToLocationArgs) {
                this.navigateToLocationArgs = {
                    'mapModel': mapWidget,
                    'locationData': locationData,
                    'showCallOut': showcallout,
                    'dropPin': dropPin
                };
            }
            if(!this.map) {
                return;
            }

            var lat = (locationData.lat) ? locationData.lat : locationData[IndexJL];
            var lon = (locationData.lon) ? locationData.lon : locationData[1 + IndexJL];
            var desc = (locationData.lat == undefined) ? locationData[3 + IndexJL] : locationData.desc;
            var name = (locationData.lat == undefined) ? locationData[2 + IndexJL] : locationData.name;
            var imageURL = (locationData.lat == undefined) ? locationData[4 + IndexJL] : (locationData.image || mapWidget.defaultpinimage);
            var urlt = (dropPin) ? getPinImageURL(imageURL) : null;
            var urlt = "";
            if(dropPin) {
                dropPin = true;
                urlt = getPinImageURL(imageURL);
            } else {
                if(typeof(marker) != 'undefined')
                    marker.setMap(null);
            }
            if(typeof(infowindow) != 'undefined') {
                infowindow.close();
            }
            var position = new google.maps.LatLng(lat, lon);
            this.map.setCenter(position);
            var markerOptions = {
                position: position,
                html: desc,
                icon: urlt,
                hdrdescp: name,
                visible: dropPin,
                map: this.map,
                locationData: locationData,
                showcallout: showcallout
            };
            cachePinSizeAndSetupMarkers(mapWidget, urlt, markerOptions, true);
            this.navigateToLocationArgs = null;
        },

        setEnabledMap: function(widgetModel, node) {
            _setEnabledMap(widgetModel, node);
        },

        loadMapScripts: function() {
            _loadMapScripts();
        },

        setMapsHeight: function(formId) {
            _setMapsHeight(formId);
        },

        RenderTheDirection: function(startLocation, endLocation, locations) {
            var waypointslocation = [];
            if(locations && locations != undefined) {
                for(var i = 0; i < locations.length; i++) {
                    waypointslocation[i] = new google.maps.LatLng(locations[i].lat, locations[i].lon);
                    waypointslocation[i] = {
                        location: waypointslocation[i] + ""
                    };
                }
            }
            var request = {
                origin: startLocation,
                destination: endLocation,
                waypoints: waypointslocation,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function(result, status) {
                if(status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(result);
                }
            });

        },

        dismissCallout: function(mapid, location) {
            if(!mapid.enablemultiplecallouts) {
                if(typeof infobox != "undefined") infobox.close();
                
            } else if(location) {
                var pinId;
                if(location instanceof Array) {
                    pinId = location[0].id;
                } else {
                    pinId = location.id;
                }
                pinInfoWindowClose(mapid, pinId);
            }
        },

        
        addPin: function(mapModel, pindata) {
            setPins(mapModel, [pindata]);
        },

        
        addPins: function(mapModel, pindataArr) {
            setPins(mapModel, pindataArr);
        },

        
        updatePin: function(mapModel, pindata) {
            var existingPindataObj = getPinAndIndexFromLocationData(mapModel, pindata.id);
            if(!existingPindataObj)
                return;
            var existingPindata = existingPindataObj.data;
            this.removePin(mapModel, pindata, false);
            for(var key in pindata) {
                if(pindata.hasOwnProperty(key)) {
                    existingPindata[key] = pindata[key]
                }
            }
            mapModel.locationData[existingPindataObj.index] = existingPindata;
            createMarkersForLocations(mapModel, [existingPindata]);
        },

        
        updatePins: function(mapModel, pindataArr) {
            for(var i = 0; i < pindataArr.length; i++) {
                this.updatePin(mapModel, pindataArr[i]);
            }
        },

        
        removePin: function(mapModel, pindata, delLocDataFlag) {
            var marker = mapModel.pinMarkers[pindata.id];
            marker && marker.setMap(null);
            delete mapModel.pinMarkers[pindata.id];
            if(delLocDataFlag) {
                var existingPindataObj = getPinAndIndexFromLocationData(mapModel, pindata.id);
                if(!existingPindataObj)
                    return;
                mapModel.locationData.splice(existingPindataObj.index, 1);
            }
        },

        
        removePins: function(mapModel, pindataArr, delLocDataFlag) {
            
            for(var i = 0; i < pindataArr.length; i++) {
                this.removePin(mapModel, pindataArr[i], true);
            }
        },

        addPolygon: function(mapModel, polydata) {
            removePolygon(mapModel, polydata.id);
            mapModel.polygonData[polydata.id] = polydata;
            drawPolygon(mapModel, polydata);
        },

        addCircle: function(mapModel, circledata) {
            removeCircle(mapModel, circledata.id);
            mapModel.circleData[circledata.id] = circledata;
            drawCircle(mapModel, circledata);
        },

        addPolyline: function(mapModel, polylinedata) {
            if(mapModel.polylineData[polylinedata.id])
                removePolyline(mapModel, polylinedata.id);
            mapModel.polylineData[polylinedata.id] = polylinedata;
            drawPolyline(mapModel, polylinedata);
        },

        removePolygon: function(mapModel, polygonID) {
            removeShape(mapModel, "polygon", polygonID);
        },

        removeCircle: function(mapModel, circleID) {
            removeShape(mapModel, "circle", circleID);
        },

        removePolyline: function(mapModel, polylineID) {
            var pindata = [];
            setPolylinePinData(mapModel.polylineData[polylineID], pindata, "startLocation");
            setPolylinePinData(mapModel.polylineData[polylineID], pindata, "endLocation");
            if(pindata.length > 0)
                this.removePins(mapModel, pindata);
            removeShape(mapModel, "polyline", polylineID);
        },

        
        setCalloutVisibility: function(mapModel, visibilityFlag, pindataArr) {
            if(!mapModel.enablemultiplecallouts)
                return;
            
            for(var i = 0; i < pindataArr.length; i++) {
                if(visibilityFlag) {
                    var marker = mapModel.pinMarkers[pindataArr[i].id];
                    marker && google.maps.event.trigger(marker, "click");
                } else {
                    pinInfoWindowClose(mapModel, pindataArr[i].id);
                }
            }
        },

        clear: function(mapModel) {
            for(var circleId in mapModel.circleDataMap) {
                removeCircle(mapModel, circleId);
            }
            for(var polygonId in mapModel.polygonDataMap) {
                removePolygon(mapModel, polygonId);
            }
            for(var polylineId in mapModel.polylineDataMap) {
                removePolyline(mapModel, polylineId);
            }
            mapModel.locationData = []; 
        }
    };


    return module;
}());
