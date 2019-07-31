
$KW.HStrip = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "HStrip", this.eventHandler);
            kony.events.addEvent("onorientationchange", "HStrip", this.orientationHandler);
        },

        initializeView: function(formId) {
            this.initializePageViews(formId);
            $KW.touch.computeSnapWidths(formId, "HStrip");
            this.initializeSlotViews(formId);
            this.initializeStripViews(formId);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);

            switch(propertyName) {
                case "viewtype":
                    if(!element)
                        return;
                    element.parentNode.innerHTML = this.render(widgetModel, new $KW.WidgetGenerationContext(widgetModel.pf));
                    if(propertyValue == "pageview") {
                        this.initializePageView(widgetModel, false, element);
                        $KW.touch.computeWidths(element, widgetModel);
                        var pScrollerInstance = new $KW.touch.pageviewScroller(element, {
                            widgetModel: widgetModel
                        });
                        $KG[element.id] = pScrollerInstance;
                    }
                    if(propertyValue == "slotview") {
                        this.initializeSlotView(widgetModel);
                    }
                    if(propertyValue == "stripview") {
                        this.initializeStripView(element);
                    }
                    break;

                case "data":
                    if(propertyValue && $KU.isArray(propertyValue)) {
                        widgetModel.masterdata = propertyValue[0 + IndexJL];
                        widgetModel.key = propertyValue[1 + IndexJL];
                    }
                    module.setData(widgetModel, widgetModel.masterdata, widgetModel.key);
                    break;

                case "showscrollbars":
                    widgetModel.scrollInstance = null;
                    
                    module.initializeStripViews(widgetModel.pf);
                    break;

                case "selectedindex":
                case "focusedindex":
                    if(widgetModel.viewtype == "pageview")
                        $KW.touch.computeSnapWidths(widgetModel.pf, "HStrip");
                    widgetModel.focuseditem = widgetModel.selectedItem = widgetModel.selecteditem = widgetModel.masterdata[propertyValue];
                    break;

                case "referenceheight":
                case "referencewidth":
                case "imagescalemode":
                    module.setData(widgetModel, widgetModel.masterdata, widgetModel.key);
                    break;

                case "viewconfig":
                    var viewconfig = widgetModel.viewconfig;
                    widgetModel.scrollbounce = viewconfig && viewconfig.stripviewConfig && viewconfig.stripviewConfig.enableScrollBounce;
                    if(widgetModel.scrollbounce == undefined)
                        widgetModel.scrollbounce = viewconfig && viewconfig.stripviewconfig && viewconfig.stripviewconfig.enablescrollbounce;

                    var scrollInstance = widgetModel.scrollInstance;
                    if(scrollInstance)
                        scrollInstance.options.bounce = (widgetModel.scrollbounce != undefined ? widgetModel.scrollbounce : true);
                    break;
            }
        },

        render: function(stripModel, context) {
            var masterdata = stripModel.masterdata = (stripModel.data && stripModel.data[0 + IndexJL]) || stripModel.masterdata || [];
            if(stripModel.data)
                stripModel.key = stripModel.data[1 + IndexJL];
            stripModel.focusedindex = stripModel.selectedindex = stripModel.focusedindex || stripModel.selectedindex || null;
            stripModel.focuseditem = stripModel.selecteditem = stripModel.focuseditem || stripModel.selecteditem || null;

            stripModel.context = context;
            
            var computedSkin = $KW.skins.getWidgetSkinList(stripModel, context);
            var computedMarginPadding = $KW.skins.getMarginSkin(stripModel, context) + " " + $KW.skins.getPaddingSkin(stripModel);
            var view = stripModel.viewtype;
            var htmlString = "";
            var html = $KW.Utils.getBaseHtml(stripModel, context);
            var wID = stripModel.pf + "_" + stripModel.id;

            
            if(stripModel.imagewhiledownloading)
                new Image().src = $KU.getImageURL(stripModel.imagewhiledownloading);

            stripModel.imagewhiledownloading = stripModel.imagewhiledownloading || $KG["imagewhiledownloading"] || "imgload.gif";
            if(!$KU.isTouchSupported && $KU.isMob) {
                stripModel.showarrows = true;
                stripModel.leftarrowimage = stripModel.leftarrowimage || "prvarw.png";
                stripModel.rightarrowimage = stripModel.rightarrowimage || "nxtarw.png";
            }

            if(view == "slotview") {
                htmlString = "<div " + html + "name='ImageStrip_SlotView' class='" + computedSkin + "' style='" + computedMarginPadding + "'><div></div>";
                if(stripModel.paginationconfig)
                    htmlString += module.generateSlotFooter(stripModel, computedSkin);

                htmlString += "</div>";
            } else if(view == "pageview") {
                htmlString = "<div" + html + "name='touchcontainer_HStrip' class='" + computedSkin + " kstripcontainer' style='" + computedMarginPadding + "'>";
                htmlString += "<div id='imgs' class='kstrip'>";

                
                
                htmlString += "</div>";

                if(stripModel.showarrows && stripModel.leftarrowimage && stripModel.rightarrowimage) {
                    htmlString += module.fadeArrowImages(stripModel);

                }
                htmlString += "</div>";
                
                if(!stripModel.ispageindicatorneeded == false)
                    htmlString += "<div class='ktable kwt100' id='" + stripModel.pf + "_" + stripModel.id + "_footer'></div>";
                if(stripModel.viewtype == "pageview") stripModel.count = 0; 
            } else { 
                if(context.ispercent === false)
                    htmlString += "<div class = '' style='table-layout:fixed; display: inline-block;'>";
                else
                    htmlString += "<div class = 'ktable kwt100' style='table-layout:fixed;'>";
                htmlString += "<div class = 'krow kwt100' >";
                var layoutDirection = $KW.skins.getWidgetAlignmentSkin(stripModel);
                htmlString += "<div class = 'kcell kwt100 " + layoutDirection + "' >";
                htmlString += "<div" + html + "class='scrollerX " + computedSkin + "' name='ImageStrip_StripView' style='" + computedMarginPadding + "'>";

                if(stripModel.showarrows && stripModel.leftarrowimage && stripModel.rightarrowimage) {
                    htmlString += $KW.touch.fadeHImages(stripModel);
                }
                htmlString += "<div id='" + wID + "_scroller' class='kwt100 scrollerX'><div id='" + wID + "_scrollee' class='scrolleeX'>";
                htmlString += this.generateImages("setdata", stripModel, masterdata, IndexJL);
                htmlString += "</div></div></div>";
                htmlString += "</div></div></div>";
                if(stripModel.viewtype == "stripview") stripModel.count = 0; 
            }
            return htmlString;
        },

        initializePageViews: function(formId, orientChange) {
            var swipeElements = document.querySelectorAll("#" + formId + " div[name='touchcontainer_HStrip']");
            for(var i = 0; i < swipeElements.length; i++) {
                var swipeElement = swipeElements[i];
                var imgsElement = swipeElement.children[0];
                var id = $KU.getElementID(swipeElement.id);
                var pf = swipeElement.getAttribute("kformname");
                var model = $KU.getModelByNode(swipeElement);
                this.initializePageView(model, orientChange, swipeElement);
            }
        },

        initializePageView: function(model, orientChange, swipeElement) {
            var imgsElement = swipeElement.children[0];
            var id = $KU.getElementID(swipeElement.id);
            imgsElement.innerHTML = "";
            var masterdata = model.masterdata || [];
            var landscape = (window.orientation == 90 || window.orientation == -90);
            var portrait = (window.orientation == 0 || window.orientation == 180);
            var swipeContext = model.swipeContext;
            if(typeof window.orientation == "undefined")
                portrait = true;

            

            var stripWidth = swipeElement.parentNode.clientWidth;


            var borderWidth = parseInt($KU.getStyle(swipeElement, "border-left-width").replace("px", ""), 10) + parseInt($KU.getStyle(swipeElement, "border-right-width").replace("px", ""), 10);
            stripWidth = stripWidth - borderWidth;

            var imgwidth = model.heightwidth ? parseInt(model.heightwidth.split(",")[1]) : model.referencewidth || 0;
            var noofimgs = model.recperpage = (imgwidth != 0) ? Math.floor(stripWidth / imgwidth) : 3;
            
            if(!noofimgs || isNaN(noofimgs))
                noofimgs = 3;

            if(!model.ptImgs && portrait) {
                model.ptImgs = noofimgs;
            }
            if(!model.lsImgs && landscape) {
                model.lsImgs = noofimgs;
            }
            var mgn = stripWidth % parseInt(imgwidth, 10);
            var spacebetweenimages = Math.floor(mgn / noofimgs);
            if(spacebetweenimages && !isNaN(spacebetweenimages))
                model.spacebetweenimages = Math.floor(mgn / noofimgs);

            imgsElement.innerHTML = this.generateImages("setdata", model, masterdata, IndexJL);

            if(orientChange) {
                this.updateCurrentPage(swipeContext, model, portrait); 
            }
            var stripFooter = $KU.getElementById(model.pf + "_" + id + "_footer");
            stripFooter && (stripFooter.innerHTML = this.generateStripFooter(model, imgsElement, swipeContext));
        },

        updateCurrentPage: function(context, model, portrait) {
            if(context && model.masterdata && context.currentPage != 0) {
                var currentPage = context.currentPage;
                if(portrait) {
                    var imgIndex = (model.lsImgs * currentPage) + 1;
                    var imgsperpage = model.ptImgs;
                } else {
                    var imgIndex = (model.ptImgs * currentPage) + 1;
                    var imgsperpage = model.lsImgs;
                }
                var pageNo = 0;

                for(var i = IndexJL; i < (model.masterdata.length); i++) {
                    if(i % imgsperpage == 0) {
                        pageNo++;
                    }
                    if(i == imgIndex) {
                        context.currentPage = pageNo;
                        break;
                    }
                }
            }
        },

        getPadding: function(elem) {
            return parseInt($KU.getStyle(elem, "padding-left").replace(/px/, ""), 10) + parseInt($KU.getStyle(elem, "padding-right").replace(/px/, ""), 10);
        },

        generateImages: function(action, imageViewModel, masterdata, index, key, addAllIndex) {
            var htmlString = "";
            var imageKey = "";
            if(action == "setdata") {
                if(key)
                    imageKey = key;
                else if(imageViewModel.key)
                    imageKey = imageViewModel.key;
                else
                    imageKey = "";

            }
            
            var size = masterdata.length;
            var view = imageViewModel.viewtype;
            var rcPerPage = imageViewModel.recperpage;
            
            rcPerPage = rcPerPage && ((size > 0 && size < rcPerPage) ? size : rcPerPage) || 3;

            var reccount = (IndexJL == 0) ? 1 : 0;
            for(var i = IndexJL; i < (masterdata.length); i++) {
                for(var key in masterdata[i]) {
                    !imageKey && (imageKey = key);
                    break;
                }

                if(i - 1 == addAllIndex) { 
                    imageKey = key;
                }

                var src = masterdata[i][imageKey];
                var accessObj = masterdata[i].accessibilityConfig;
                var accessAttr = $KU.getAccessibilityValues(imageViewModel, accessObj, i + 1); 
                var style = "";
                if(src) {

                    var isWaitAllowed = true;
                    if($KU.inArray($KU.imgCache, src, true))
                        isWaitAllowed = false;

                    if((i - IndexJL) % rcPerPage == 0 && view == "pageview") {
                        htmlString += "<div style='float: left;width:100%' kwidgettype='KTouchhstrip'>";
                    }

                    src = $KU.getImageURL(src);

                    if(imageViewModel.spacebetweenimages && rcPerPage > 1 && i != masterdata.length - 1) 
                        style += "margin-right:" + imageViewModel.spacebetweenimages + "px;";

                    htmlString += "<span " + (isWaitAllowed ? ("style='background:url(" + $KU.getImageURL(imageViewModel.imagewhiledownloading) + ") center center no-repeat;display:inline-block;" + style + "'") : "style='" + style + "'") + ">";

                    if(imageViewModel.heightwidth || (imageViewModel.referencewidth || imageViewModel.referenceheight)) {
                        var dimensions = imageViewModel.heightwidth ? imageViewModel.heightwidth.split(",") : [imageViewModel.referenceheight, imageViewModel.referencewidth];
                        style = (parseInt(dimensions[1]) != 0 ? ("width:" + dimensions[1] + "px;") : "") + (parseInt(dimensions[0]) != 0 ? ("height:" + dimensions[0] + "px;") : "");
                    }

                    htmlString += "<img " + accessAttr + (kony.appinit.isOpera ? "draggable='false'" : "") + " src='" + src + "' id='" + imageViewModel.pf + '_' + imageViewModel.id + "_img' kformname = '" + imageViewModel.pf + "' index= " + index + " kwidgettype='" + imageViewModel.wType + "'" + (imageViewModel.context.tabpaneID ? " ktabpaneid='" + imageViewModel.context.tabpaneID + "'" : "") + " onload='$KU.imgLoadHandler(arguments[0],this)' onerror='$KU.imgLoadHandler(arguments[0],this)'";
                    
                    if(isWaitAllowed)
                        style += "opacity:0;";
                    htmlString += (style ? ("style= '" + style + "'") : "") + " /></span>";

                    if(((i + reccount) % rcPerPage == 0 || i == size - 1) && view == "pageview")
                        htmlString += "</div>";

                }
                index++;
            }
            return htmlString;
        },

        generateStripFooter: function(stripModel, imgsElement, swipeContext) {
            var htmlString = "";
            var pages = imgsElement.childNodes.length;
            var index = swipeContext ? swipeContext.currentPage : 0;
            if(pages > 1) {
                var src = "";
                htmlString += "<div class='krow kwt100' align='center' ><div class='kcell' >";
                for(var i = 0; i < pages; i++) {
                    src = (i == index) ? (stripModel.pageOnDotImage || "whitedot.gif") : (stripModel.pageOffDotImage || "blackdot.gif");
                    htmlString += "<span onclick='$KW.touch.navigationDotsHandler(this)' index='" + (i + 1) + "'><img style='padding-left:4px' src='" + $KU.getImageURL(src) + "' /></span>";
                }
                htmlString += "</div></div>";
            }
            return htmlString;
        },

        generateSlotFooter: function(imageStripModel, compskin) {
            var htmlString = "";
            var style = "";
            var pagcng = imageStripModel.paginationconfig;

            if(imageStripModel.heightwidth) {
                var dimensions = imageStripModel.heightwidth.split(",");
                style += (dimensions[1] != "0" ? ("width:" + dimensions[1] + "px;") : "") + (dimensions[0] != "0" ? ("xheight:" + dimensions[0] + "px;") : "");
            }

            htmlString += "<div id='" + imageStripModel.pf + "_" + imageStripModel.id + "_slotfooter' class='ktable " + compskin + "' style='position:relative;top:" + (pagcng.vdistance ? (-pagcng.vdistance) + "px" : "-30px") + ";" + style + "'>\
                                <div class='krow middlecenteralign kwt100'>\
                                    <div class='kcell kwt50 middleleftalign'>\
                                        <span class='kbasemargin kbasepadding' style='display: inline-block; width: 100%;position:relative;left: " + (pagcng.hdistance ? pagcng.hdistance + "px" : "0px") + ";'>\
                                            <img " + (kony.appinit.isOpera ? "draggable='false'" : "") + " src='" + $KU.getImageURL(pagcng.leftimageurl ? pagcng.leftimageurl : "rotate-left-slotfooter.png") + "'>\
                                        </span>\
                                    </div>\
                                    <div class='kcell kwt50 middlerightalign'>\
                                        <span class='kbasemargin kbasepadding' style='display: inline-block; width: 100%;position:relative;right: " + (pagcng.hdistance ? pagcng.hdistance + "px" : "0px") + ";'>\
                                            <img " + (kony.appinit.isOpera ? "draggable='false'" : "") + " src='" + $KU.getImageURL(pagcng.rightimageurl ? pagcng.rightimageurl : "rotate-right-slotfooter.png") + "'>\
                                        </span>\
                                    </div>\
                                </div>\
                            </div>";

            return htmlString;
        },

        
        setData: function(imageViewModel, dataArray, key) {
            if(dataArray && $KU.isArray(dataArray))
                this.modifyContent(imageViewModel, dataArray, "setdata", null, key);
            else {
                var strip = $KU.getNodeByModel(imageViewModel);
                if(strip) {
                    $KU.toggleVisibilty(strip, dataArray, imageViewModel)
                }
            }
        },

        addAll: function(imageViewModel, dataArray, key) {
            (dataArray && $KU.isArray(dataArray)) && this.modifyContent(imageViewModel, dataArray, "addall", null, key);
        },

        removeAll: function(imageViewModel) {
            this.modifyContent(imageViewModel, [], "removeall");
        },

        removeAt: function(imageViewModel, index) {
            (!isNaN(index) && index >= IndexJL) && this.modifyContent(imageViewModel, [], "removeat", index);
        },

        
        setDataAt: function(imageViewModel, dataObj, index) {
            (!isNaN(index) && index >= IndexJL && dataObj instanceof Object) && this.modifyContent(imageViewModel, dataObj, "setdataat", index);
        },

        addDataAt: function(imageViewModel, dataObj, index) {
            (!isNaN(index) && index >= IndexJL && dataObj instanceof Object) && this.modifyContent(imageViewModel, dataObj, "addat", index);
        },

        modifyContent: function(imageViewModel, dataArray, action, index, key) { 
            if(imageViewModel) {


                $KW.Utils.updateContent(imageViewModel, "masterdata", dataArray, action, index);
                imageViewModel.canUpdateUI = false;
                imageViewModel.data = IndexJL ? [null, imageViewModel.masterdata, key] : [imageViewModel.masterdata, key]; 
                imageViewModel.canUpdateUI = true;
                key && (imageViewModel.key = key);

                if(imageViewModel.viewtype == "slotview") {
                    this.initializeSlotView(imageViewModel);
                    return;
                }

                var imageStrip = $KU.getNodeByModel(imageViewModel);
                if(imageStrip) {

                    
                    var imgsDiv = (imageViewModel.viewtype == "stripview") ? imageStrip.childNodes[imageStrip.childNodes.length - 1].childNodes[0] : imageStrip.childNodes[imageStrip.childNodes.length - 1]; 
                    switch(action) {

                        case "setdata":
                        case "setdataat":
                        case "addall":
                        case "removeat":
                        case "addat":
                            if(action == "addall" && key) var addAllIndex = this.getImgsLen(imgsDiv);
                            imgsDiv.innerHTML = this.generateImages(action, imageViewModel, imageViewModel.masterdata || [], IndexJL, key, addAllIndex);
                            break;

                        case "removeall":
                            imgsDiv.innerHTML = "";
                            break;
                    }
                    imageViewModel.masterdata && $KU.toggleVisibilty(imageStrip, imageViewModel.masterdata, imageViewModel);

                    if(imageViewModel.viewtype == "pageview") {
                        $KW.touch.computeWidths(imageStrip, imageViewModel);
                        var stripFooter = $KU.getElementById(imageViewModel.pf + "_" + imageViewModel.id + "_footer");
                        stripFooter && (stripFooter.innerHTML = this.generateStripFooter(imageViewModel, imgsDiv));
                    } else if(imageViewModel.viewtype == "stripview")
                        this.refreshScroller(imageViewModel, imageStrip);
                }
            }
        },

        getImgsLen: function(imgsDiv) {
            var count = 0;
            var slides = imgsDiv.childNodes;
            for(var i = 0; i < slides.length; i++) {
                var imgs = slides[i].childNodes;
                for(var j = 0; j < imgs.length; j++) {
                    count++;
                }
            }
            return count;
        },

        orientationHandler: function(formId, orientation) {

            module.initializePageViews(formId, true);
            $KW.touch.orientationHandler(formId, orientation, "HStrip");
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
        },

        initializeStripViews: function(formId) {
            var strips = document.querySelectorAll("#" + formId + " div[name='ImageStrip_StripView']");
            for(var i = 0; i < strips.length; i++) {
                this.initializeStripView(strips[i]);
            }
        },

        initializeStripView: function(strip) {
            var widgetModel = $KU.getModelByNode(strip);
            var formId = strip.getAttribute("kformname");
            var stripID = $KU.getElementID(strip.id);
            var options = {
                
                hScrollbar: widgetModel.showscrollbars != undefined ? widgetModel.showscrollbars : false,
                vScroll: false,
                formid: formId,
                hScroll: true,
                scrollbox: true,
                HStrip: true,
                bounce: widgetModel.scrollbounce != undefined ? widgetModel.scrollbounce : true,
                showImages: widgetModel.showarrows && widgetModel.leftarrowimage && widgetModel.rightarrowimage,
                widgetID: stripID,
                widgetModel: widgetModel
                
            };
            var stripDomNode = widgetModel.showarrows && widgetModel.leftarrowimage && widgetModel.rightarrowimage ? strip.children[1] : strip.children[0]; 
            widgetModel.scrollInstance = new $KW.touch.konyScroller(stripDomNode, options);
            this.refreshScroller(widgetModel, strip);
        },

        refreshScroller: function(model, strip) {
            if(!strip)
                strip = $KU.getNodeByModel(model);
            if(strip) {
                var scroller = model.showarrows && model.leftarrowimage && model.rightarrowimage ? strip.children[1] : strip.children[0];
                if(typeof scroller != "undefined" && scroller.children[0].scrollWidth)
                    scroller.children[0].style.width = scroller.children[0].scrollWidth + "px";
                model.scrollInstance && model.scrollInstance.refresh();
            }
        },

        initializeSlotViews: function(formId) {
            
            var slotstrips = document.querySelectorAll("#" + formId + " div[name='ImageStrip_SlotView']");
            for(var i = 0; i < slotstrips.length; i++) {
                formId = slotstrips[i].getAttribute("kformname");
                var widgetModel = $KU.getModelByNode(slotstrips[i]);
                this.initializeSlotView(widgetModel);
            }
        },

        initializeSlotView: function(widgetModel) {
            var masterdata = widgetModel.masterdata;
            if(!masterdata)
                return;

            var imageKey = "iurl";
            for(var key in masterdata[1]) {
                imageKey = key;
                break;
            }
            

            
            var imagesArray = [];
            for(var i = IndexJL; i < masterdata.length; i++) {
                imagesArray.push(masterdata[i][imageKey]);
            }

            var wID = widgetModel.pf + "_" + widgetModel.id;
            var widget = $KU.getElementById(wID);
            if(!widget) return;
            
            

            
            var slotviewInstance = $KG[wID + '_slotviewInstance'];
            if(slotviewInstance) {
                
                slotviewInstance.destroy();
                if(widget && widget.children[0] && widget.children[0].children[0])
                    widget.children[0].removeChild(widget.children[0].children[0]);
            }

            
            if(widget.children[0]) {
                var imagewhiledownloading = widgetModel.imagewhiledownloading || $KG["imagewhiledownloading"] || "imgload.gif";
                widget.children[0].innerHTML = "<img " + (kony.appinit.isOpera ? "draggable='false'" : "") + " src='" + $KU.getImageURL(imagewhiledownloading) + "' style='margin:auto;' />";
            }

            var slotviewInstance = new $KW.SlotView(wID, imagesArray, {
                model: widgetModel
            });
            $KG[wID + "_slotviewInstance"] = slotviewInstance;
        },

        onBeforeScrollStartHandler: function() {
            return function(e) {
                var target = e.target || e.srcElement;
                while(target.nodeType != 1)
                    target = target.parentNode;

                if(target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
                    kony.events.preventDefault(e);
                kony.events.stopPropagation(e); 
            }
        },

        fadeArrowImages: function(model) {
            var style = "display:none;";
            var leftSrc = $KU.getImageURL(model.leftarrowimage);
            var rightSrc = $KU.getImageURL(model.rightarrowimage);
            var wID = model.pf + "_" + model.id;
            var str = "<div id='" + wID + "_scrollFades' class='scroll_view'>" +
                "<div id='" + wID + "_leftimg' class='scroll_fades leftfade' style='" + style + "'>" +
                "<img type='HImg' src='" + leftSrc + "' onclick='$KW.HStrip.previousImage(this)' onload='$KW.touch.setHeight(this)' >" +
                "</div>" +
                "<div id='" + wID + "_rightimg' class='scroll_fades rightfade' style='" + style + "'>" +
                "<img type='HImg' src='" + rightSrc + "' onclick='$KW.HStrip.nextImage(this)' onload='$KW.touch.setHeight(this)' >" +
                "</div>" +
                "</div>";

            return str;
        },

        previousImage: function(src) {
            var segment = src.parentNode.parentNode.parentNode;
            if(segment) {
                var widgetModel = $KU.getModelByNode(segment);
                var swipeContext = widgetModel.swipeContext;
                $KW.touch.previousImage(segment, swipeContext, false);
                $KW.touch.updatePageIndicator(segment, swipeContext, widgetModel);
            }
        },

        nextImage: function(src) {
            var segment = src.parentNode.parentNode.parentNode;
            if(segment) {
                var widgetModel = $KU.getModelByNode(segment);
                var swipeContext = widgetModel.swipeContext;

                $KW.touch.nextImage(segment, swipeContext, false);
                $KW.touch.updatePageIndicator(segment, swipeContext, widgetModel);
            }
        }
    };


    return module;
}());
