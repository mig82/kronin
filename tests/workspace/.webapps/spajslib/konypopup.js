$KW.Popup = (function() {
    
    

    var module = {
        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            switch(propertyName) {
                case "ismodal":
                case "transparencybehindthepopup":
                    var opacity = 1 - (widgetModel.transparencybehindthepopup / 100);
                    var popuplayer = document.getElementById('__popuplayer');
                    var popupcontainer = document.getElementById(widgetModel.id + '_container');
                    if(popuplayer) {
                        popuplayer.style.opacity = opacity;
                    }
                    if(propertyName == "ismodal" && popupcontainer)
                        module.modalPopupWorker(widgetModel, popupcontainer);
                    break;
            }
        },

        render: function(popupModel) {
            if($KG["localization"]) {
                
                $KI.i18n.translateFormModel(popupModel);
            }

            var popupId = popupModel.id;
            if($KG.nativeScroll && !(popupModel.ismodal) && !($KU.isWindowsPhone && $KU.isIE9)) {
                
                
                
                
                kony.events.addEventListener(document.body, $KU.isIDevice ? $KW.touch.events.touchstart : 'click', module.dismissPopup, false);
                
                

                if(!$KU.isIDevice) {
                    kony.events.addEventListener(document.body, $KW.touch.events.touchstart, module.dismissPopup, false);
                    kony.events.addEventListener(window, 'scroll', module.onScrollDismissPopup, false);
                }
            }

            if(popupModel.enableScroll) {
                $KW.Form.checkBackwardCompatibility(popupModel);
                $KW.Form.render(popupModel);
                if($KG.nativeScroll && !(popupModel.ismodal) && !($KU.isWindowsPhone && $KU.isIE9)) {
                    
                    
                    
                    
                    kony.events.addEventListener(document.body, $KU.isIDevice ? $KW.touch.events.touchstart : 'click', module.dismissPopup, false);
                    
                    

                    if(!$KU.isIDevice)
                        kony.events.addEventListener(window, 'scroll', module.dismissPopup, false);
                }
                
                var id = popupModel.id + "_container";
                var popupContainer = document.getElementById(id);
                if(popupModel.containerheight || popupModel.containerheight === 0) {
                    popupModel.needScroller = true;
                    $KU.setScrollHeight(popupModel, popupModel.ismodal ? popupContainer.childNodes[1] : popupContainer);
                    if($KG.nativeScroll) {
                        if(popupModel.ismodal)
                            popupContainer.childNodes[1].style.overflow = 'auto';
                        else
                            popupContainer.style.overflow = 'auto';
                    } else {
                        $KW.Scroller.initializeFormScroller(id);
                    }
                }
                var popupElement = document.getElementById(popupId);
                module.updateZIndex(popupElement);
                return;
            }

            var opacity = 1 - (popupModel.transparencybehindthepopup / 100);
            
            var bgcolor = (popupModel.ismodal && popupModel.popupbgcolor) ? "background-color:" + popupModel.popupbgcolor : "";
            var cwtSkin = $KW.skins.getMarPadAdjustedContainerWeightSkin(popupModel);
            var htmlString = "";
            htmlString = "<div id='__popuplayer' style='opacity:" + opacity + ";" + bgcolor + "'" + (!popupModel.ismodal && !(popupModel.ptran || popupModel.ptranOut) && popupModel.context ? "" : " class='popuplayer absoluteContainer'") + "></div>";
            htmlString += "<div id='" + popupId + "_group' style='z-index:9;position: absolute;' class='" + cwtSkin + "' kformname='" + popupId + "' kwidgettype='Popup'>";
            if(popupModel.header) {
                htmlString += "<div id='header_container' kformname='" + popupId + "'>";
                htmlString += $KW.Form.generateHeader(popupModel, "header");
                htmlString += "</div>";
            }
            htmlString += "<form id='" + popupId + "' class='" + (popupModel.skin || "") + "' style='" + $KW.skins.getPaddingSkin(popupModel) +
                (!popupModel.skin ? ";background-color:white" : "") + "'>";

            
            if(popupModel.children) {
                for(var i = 0; i < popupModel.children.length; i++) {
                    htmlString += $KW.Form.generateWidget(popupModel, popupModel[popupModel.children[i]]);
                }
            }

            htmlString += "</form>";
            if(popupModel.footer) {
                htmlString += "<div id='footer_container' kformname='" + popupId + "'>";
                htmlString += $KW.Form.generateHeader(popupModel, "footer");
                htmlString += "</div>";
            }
            htmlString += "</div>";

            var popup = document.createElement("div");
            popup.id = popupId + "_container";

            popup.className = "popupmain popupcontainer absoluteContainer";
            popup.style.visibility = "hidden";
            popup.innerHTML = htmlString;

            module.updateZIndex(popup);

            module.modalPopupWorker(popupModel, popup);

            var main = $KU.getElementById("__MainContainer");
            if(!main) {
                var mainClass = $KG["stickyScroll"] ? "main_container" : "";
                htmlString = "<div id='__MainContainer' class='" + mainClass + "'></div>";
                document.body.innerHTML = htmlString;
                main = $KU.getElementById("__MainContainer");
            }
            main.appendChild(popup);

            if($KG["nativeScroll"]) {
                
                
                if(!popupModel.context) {
                    
                    if(opacity == 1) {
                        var header = document.getElementById("header_container");
                        var footer = document.getElementById("footer_container");
                        var appmenu = document.getElementById("appmenu_container");
                        var form = document.getElementById($KG["__currentForm"].id);
                        header && (header.style.display = "none");
                        footer && (footer.style.display = "none");
                        appmenu && (appmenu.style.display = "none");
                        form && (form.style.display = "none");
                    }
                }

                
                var mainContainerHeight = document.getElementById("__MainContainer").clientHeight;
                var __popuplayer = popup.children[0]; 
                if(mainContainerHeight < (window.innerHeight || document.body.clientHeight)) {
                    if(opacity == 1  && !popupModel.context)
                        popup.style.height = (window.innerHeight || document.body.clientHeight) + "px";
                    if(popupModel.ismodal)
                        __popuplayer.style.height = (window.innerHeight || document.body.clientHeight) + "px";
                } else {
                    if(opacity == 1  && !popupModel.context)
                        popup.style.height = mainContainerHeight + "px";
                    if(popupModel.ismodal)
                        __popuplayer.style.height = mainContainerHeight + "px";
                }
            }

            
            popup.setAttribute("dummy", "");
            popup.children[0].setAttribute("dummy", "");
            popup.children[1].setAttribute("dummy", "");
        },

        
        updateZIndex: function(element) {
            if(element) {
                module.zindex = module.zindex || 10;
                element.style.zIndex = ++module.zindex;
            }
        },

        modalPopupWorker: function(popupModel, popup) {
            if(popupModel.ismodal == false || ($KU.isWindowsPhone && $KU.isIE9)) {
                popup.onclick = function(eventObject) {
                    eventObject = eventObject || window.event;
                    var src = eventObject.target || eventObject.srcElement;
                    if(src.id == "__popuplayer") {
                        if(!popupModel.ismodal)
                            module.dismiss(popupModel, true);
                    }
                };
            } else {
                popup.onclick = null;
            }
        },

        show: function(popupModel) {
            var formElem = "";
            if($KG.__currentForm) {
                formElem = document.getElementById($KG.__currentForm.id);
                formElem && formElem.setAttribute('aria-hidden', true);
            }
            
            if(document.activeElement) {
                var wType = document.activeElement.getAttribute("kwidgettype");
                if(wType == "TextField" || wType == "TextArea")
                    document.activeElement.blur();
            }

            
            $KW.Calendar && $KW.Calendar.destroyCalendar();

            !kony.system.activity.hasActivity() && $KW.skins.removeBlockUISkin();

            var popupContainer = $KU.getElementById(popupModel.id + "_container");
            if(popupContainer) {
                this.dismiss(popupModel);
            }

            var containerHeight = (popupModel.containerHeight || popupModel.containerHeight === 0) ? parseInt(popupModel.containerheight, 10) : null;
            if(popupModel.header || popupModel.footer) {
                if(!containerHeight) {
                    popupModel.containerheight = "80";
                    containerHeight = 80;
                }
            }
            if(popupModel.layouttype != kony.flex.VBOX_LAYOUT)
                popupModel.containerheight = "80"; 

            if((containerHeight || containerHeight === 0) && containerHeight >= 0 && !$KU.isBlackBerryNTH && !($KU.isWindowsPhone && $KU.isIE9))
                popupModel.enableScroll = true;
            else
                popupModel.enableScroll = false;

            
            this.render(popupModel);
            $KW.Form.initializeFlexContainers(popupModel);

            var popupContainer = $KU.getElementById(popupModel.id + "_container");
            if($KU.getPlatformName() == "androidtablet")
                popupContainer.style[$KU.transform] = 'translate3d(0,0,0)'; 

            $KW.TPW.renderWidget(popupModel.id);
            popupelem = popupContainer.children[1];

            if(!$KG["disableTransition"] || $KU.isBlackBerryNTH) {
                
                $KW.Form.initializeTouchWidgets(popupModel.id)
            } else {
                popupelem.parentNode.style.visibility = "visible";
                $KW.Form.initializeView(popupModel.id);
            }
            
            $KW.Utils.initializeGestures(popupModel);

            
            if(!popupModel.context) {
                
                if($KU.isWindowsPhone && $KU.isIE9) {
                    popupelem.style.left = Math.floor((100 - Math.floor((popupelem.offsetWidth * 100) / popupelem.parentNode.offsetWidth)) / 2) + "%";
                    popupContainer.style.top = 0;
                    window.scrollTo(0, 1);
                } else {
                    this.adjustPosition(popupModel, popupelem);
                }
            }

            if(!popupModel.containerHeight && popupModel.containerHeight != 0 && !popupModel.ismodal) {
                var scroller = $KU.getElementById(popupModel.id + "_scroller");
                scroller && (scroller.style.overflow = 'visible');
                popupContainer.style.height = 'auto';
            }

            if((!$KG["disableTransition"] || $KU.isBlackBerryNTH)) {
                this.applyTransition(popupModel, popupelem);
            }
            $KW.Form.accessibilityTitleCall(popupModel, true);
            formElem && window.setTimeout(function() {
                formElem.setAttribute('aria-hidden', false);
            }, 2000);
            
            $KW.Utils.initializeGestures(popupModel);
        },

        dismiss: function(model, flag) {
            
            
            var popupelemMain = model ? $KU.getElementById(model.id + "_container") : document.querySelector("div[class~='popupmain']");
            if(popupelemMain) {
                
                var currentForm = $KG["__currentForm"];
                if(currentForm) {
                    var _scrollerId = currentForm.id + "_scroller";
                    var scrollerInstance = $KG[_scrollerId];
                    scrollerInstance && $KW.Scroller.checkDOMChanges(_scrollerId, currentForm.header, currentForm.footer);
                }
                var popupelem = popupelemMain.children[1];
                if(!model) {
                    var id = popupelem.id.split("_")[0];
                    model = window[id]; 
                }

                if(flag) {
                    module.domremove(popupelem.id);
                } else {
                    if((model.ptranOut && model.ptranOut.toLowerCase() != "none") && (!$KG["disableTransition"] || $KU.isBlackBerryNTH))
                        this.applyTransition(model, popupelem, true);
                    else
                        module.domremove(popupelem.id);
                }
                var hideref = $KU.returnEventReference(model.onhide || model.onHide);
                hideref && hideref.call(model, model);
            }
        },

        domremove: function(id) {
            var popupelem = $KU.getElementById(id);
            if(popupelem) {
                id = id.split("_")[0];
                var popupModel = $KG.allforms[id];
                if(popupModel.enableScroll) {
                    
                    if(popupModel.scrollerTimer) {
                        clearInterval(popupModel.scrollerTimer);
                    }
                    $KW.Form.destroyTouchWidgets($KG["transitAll"] ? (popupModel.id + "_container") : ($KG.needScroller ? popupModel.id + "_scroller" : popupModel.id));
                }
                popupelem = $KU.getElementById(id + "_group");
                $KW.Form.destroyTouchWidgets(popupModel.id, true);

                var popupelemMain = popupelem.parentNode;
                var opacity = popupelemMain.children[0].style.opacity;
                popupelemMain.parentNode.removeChild(popupelemMain);

                if($KG["nativeScroll"] && !popupModel.context) {
                    if(opacity == 1) {
                        var header = document.getElementById("header_container");
                        var footer = document.getElementById("footer_container");
                        var appmenu = document.getElementById("appmenu_container");
                        var form = document.getElementById($KG["__currentForm"].id);
                        header && (header.style.display = "");
                        footer && (footer.style.display = "");
                        appmenu && (appmenu.style.display = "");
                        form && (form.style.display = "");
                    }
                }
            }
        },
        applyTransition: function(model, popupelem, endTrans) {
            var transitionDuration = (model.transitionduration && model.transitionduration >= 0) ? model.transitionduration : 1;

            var popupHeight = popupelem.offsetHeight;
            var popupWidth = popupelem.offsetWidth;
            var transtype = !endTrans ? (model.ptran) : (model.ptranOut);
            model.height = Math.floor(popupHeight + (Math.abs($KU.getWindowHeight() - popupHeight) / 2)); 
            model.width = Math.floor(popupWidth + ((popupelem.parentNode.offsetWidth - popupWidth) / 2));

            if(transtype == "rightCenter") {
                model.width = popupelem.parentNode.offsetWidth + popupWidth;
            }

            if(transtype == "bottomCenter") {
                model.height = $KU.getWindowHeight() + popupHeight;
            }

            var orientationEvent = ($KU.isOrientationSupported && !$KU.isAndroid) ? "onorientationchange" : "onresize";
            kony.events.addEvent(orientationEvent, "popup", module.adjustPopupDimensions.bind(null, model, popupelem));
            popupelem.style[$KU.animationDuration] = transitionDuration + "s";
            this.setAnchorPosition(model, popupelem, endTrans);

            var konyStyleSheetIndex = $KW.skins.getKonyStyleSheetIndex(document.styleSheets);
            var lastSheet = document.styleSheets[konyStyleSheetIndex];
                if(transtype) {
                    var event = "AnimationEnd";
                    if(kony.appinit.isFirefox || $KU.isIE11)
                        event = event.toLowerCase();
                    else
                        event = $KU.animationEnd;
                    kony.events.addEventListener(popupelem, event, module.animationEnd(model.id, !!endTrans));
                }
                else {
                    if(!model.ismodal)
                        popupelem.parentNode.style.height = "auto";
                }
                switch(transtype) {
                    case 'topCenter':
                    case 'bottomCenter':
                        var topY = (transtype == "topCenter") ? ("-" + model.height) : model.height;
                        if(endTrans) {
                            lastSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + model.id + "endanimation { from { " + $KU.cssPrefix + "transform: translateY(0px); } to {" + $KU.cssPrefix + "transform: translateY( " + topY + "px);} }", lastSheet.cssRules.length);
                            popupelem.style[$KU.animationName] = model.id + "endanimation";
                        } else {
                            lastSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + model.id + "animation { from { " + $KU.cssPrefix + "transform: translateY( " + topY + "px); } to {" + $KU.cssPrefix + "transform: translateY(0px);} }", lastSheet.cssRules.length);
                            popupelem.style[$KU.animationName] = model.id + "animation";
                        }
                        break;

                    case 'leftCenter':
                    case 'rightCenter':
                        var rightX = (transtype == "leftCenter") ? ("-" + model.width) : model.width;
                        if(endTrans) {
                            lastSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + model.id + "endanimation { from { " + $KU.cssPrefix + "transform: translateX( 0px); } to {" + $KU.cssPrefix + "transform: translateX(" + rightX + "px);} }", lastSheet.cssRules.length);
                            popupelem.style[$KU.animationName] = model.id + "endanimation";
                        } else {
                            lastSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + model.id + "animation { from { " + $KU.cssPrefix + "transform: translateX( " + rightX + "px); } to {" + $KU.cssPrefix + "transform: translateX(0px);} }", lastSheet.cssRules.length);
                            popupelem.style[$KU.animationName] = model.id + "animation";
                        }
                        break;
                    case 'fadeAnimation':
                        if(endTrans) {
                            popupelem.style[$KU.animationName] = $KW.formEndTransitionsMatrix[transtype];
                        } else {
                            popupelem.style[$KU.animationName] = $KW.formTransitionsMatrix[transtype];
                        }
                        break;
                    case 'slidedown':
                        if(endTrans) {
                            lastSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + model.id + "endanimation { from {height:" + popupHeight + "px;} to {height:0px;} }", lastSheet.cssRules.length);
                            popupelem.style[$KU.animationName] = model.id + "endanimation";
                        } else {
                            popupelem.style.overflow = "hidden";
                            lastSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + model.id + "animation { from {height:0px;} to {height:" + popupHeight + "px;} }", lastSheet.cssRules.length);
                            popupelem.style[$KU.animationName] = model.id + "animation";
                        }
                        break;
                }
            
            var popupMenuContainer = document.querySelector('#' + model.id + '_container');
            popupMenuContainer.style.visibility = 'visible';
            
            
            if(!transtype || transtype == "None") {
                popupelem.tabIndex = -1;
                popupelem.focus();
            }
        },

        setAnchorPosition: function(model, popupelem, endTrans) {
            var context = model.context;
            if(context && context.widget) {
                if(model.enableScroll && !model.ismodal) {
                    popupelem = popupelem.parentNode;
                }
                var widget = context.widget;
                var elem;
                if(widget.wType == "Form") {
                    elem = document.getElementById(widget.id);
                } else {
                    elem = $KU.getNodeByModel(widget);
                }
                if(elem && widget.wType != "Form") {
                    var scroller = $KU.getElementById(model.id + "_scroller");
                    var popupHeight = model.enableScroll && model.ismodal ? scroller.offsetHeight : popupelem.offsetHeight;
                    var popupWidth = popupelem.offsetWidth;
                    var transtype = !endTrans ? (model.ptran) : (model.ptranOut);

                    var pos = $KU.getPosition(elem, model);
                    
                    var elmViewportTop = pos.top;
                    var elmViewportBottom;
                    var anchorPos = $KU.getAnchorPosition(model, popupelem);
                    var winInnerHeight = window.innerHeight;
                    var docBodyclientHeight = document.body.clientHeight;
                    var bodyHeight = winInnerHeight || docBodyclientHeight;
                    if(typeof winInnerHeight === 'number' && typeof docBodyclientHeight === 'number') {
                        bodyHeight = Math.max(winInnerHeight, docBodyclientHeight);
                    }

                    if(context["anchor"] == "bottom") {
                        popupelem.style.left = anchorPos.leftPos + 'px';
                        elmViewportBottom = elmViewportTop + elem.clientHeight; 
                        if($KG.nativeScroll) {
                            
                            popupelem.style.top = elmViewportBottom + "px";
                            model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportBottom) : (popupHeight + elmViewportBottom);
                        } else {
                            if(context["isenabled"] == true && elmViewportTop == 0) {
                                popupelem.style.top = 0;
                                model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportBottom) : (popupHeight + elmViewportBottom);
                            } else if(bodyHeight == elmViewportBottom) { 
                                popupelem.style.bottom = "0px";
                                model.height = (transtype == "bottomCenter") ? popupHeight : (popupHeight + elmViewportBottom); 
                            } else if(bodyHeight - elmViewportBottom > popupHeight) { 
                                popupelem.style.top = elmViewportBottom + "px";
                                model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportBottom) : (popupHeight + elmViewportBottom);
                            } else if(elmViewportTop > popupHeight) { 
                                popupelem.style.top = (elmViewportTop - popupHeight) + "px";
                                model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportTop) : (popupHeight + elmViewportTop);
                            } else { 
                                popupelem.style.top = Math.floor((100 - Math.floor((popupHeight * 100) / popupelem.parentNode.offsetHeight)) / 2) + "%";
                                popupelem.style.left = Math.floor((100 - Math.floor((popupWidth * 100) / popupelem.parentNode.offsetWidth)) / 2) + "%";

                            }
                        }
                    }
                    if(context["anchor"] == "top") {
                        popupelem.style.left = anchorPos.leftPos + 'px';
                        
                        if(!elmViewportTop) {
                            popupelem.style.top = 0;
                        } else if(elmViewportTop > popupHeight) {
                            popupelem.style.top = (elmViewportTop - popupHeight) + "px";
                            model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportTop) : (popupHeight + elmViewportTop);
                        } else { 
                            popupelem.style.top = Math.floor((100 - Math.floor((popupHeight * 100) / popupelem.parentNode.offsetHeight)) / 2) + "%";
                            popupelem.style.left = Math.floor((100 - Math.floor((popupWidth * 100) / popupelem.parentNode.offsetWidth)) / 2) + "%";
                        }
                    }
                    if(context["anchor"] == "left" || context["anchor"] == "right") {
                        popupelem.style.top = anchorPos.topPos + 'px';
                        popupelem.style.left = anchorPos.leftPos + 'px';
                    }
                } else if(elem && widget.wType == "Form") {
                    if(!$KG.nativeScroll) {
                        var pos = $KU.getPosition(document.getElementById(elem.id + "_scroller"));
                        } else {
                            var pos = $KU.getPosition(elem);
                        }
                        var elmViewportTop = pos.top;
                        var elmViewportBottom = elmViewportTop + pos.height;
                        var scroller;
                        if($KG.nativeScroll)
                            scroller = $KU.getElementById(model.id);
                        else
                            scroller = $KU.getElementById(model.id + "_scroller");
                        var popupHeight = scroller.offsetHeight; 
                        var popupWidth = scroller.offsetWidth; 
                        var transtype = !endTrans ? (model.ptran) : (model.ptranOut);

                        if(context["anchor"] == "bottom") {
                            if($KG.nativeScroll) {
                                popupelem.style.top = (document.body.querySelector('form').offsetHeight - popupHeight) + "px";
                            } else {
                                popupelem.style.top = (window.innerHeight - popupHeight) + "px";
                            }
                            popupelem.style.left = "0px";
                            model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportBottom) : (popupHeight + elmViewportBottom)
                        }

                        if(context["anchor"] == "top") {
                            popupelem.style.top = "0px";
                            popupelem.style.left = "0px";
                            model.height = (transtype == "bottomCenter") ? (popupHeight + bodyHeight - elmViewportTop) : (popupHeight + elmViewportTop);
                        }
                        if(context["anchor"] == "left") {
                            popupelem.style.top = "0px";
                            popupelem.style.left = "0px";
                        }

                        if(context["anchor"] == "right") {
                            popupelem.style.top = "0px";
                            popupelem.style.right = "0px";
                        }
                    }
                    popupelem.style.position = "absolute";
                }
                if(!model.ismodal) {
                    var popupContainer = $KU.getElementById(model.id + "_container");
                    if(popupContainer && !(model.containerHeight)) {
                        popupContainer.style.height = "auto";
                    }
                }
        },

        adjustPopupDimensions: function(model, popupelem) {
            if(!document.getElementById(popupelem.id)) return;

            var popupContainer = $KU.getElementById(model.id + "_container");
            $KU.setScrollHeight(model, model.ismodal ? popupContainer.childNodes[1] : popupContainer);
            if(!model.context) {
                module.adjustPosition(model, popupelem);
            }

            module.setAnchorPosition(model, popupelem);

            
            if($KG["nativeScroll"] && model.ismodal) {
                var __popuplayer = popupelem.previousSibling;
                var mainContainerHeight = document.getElementById("__MainContainer").clientHeight;
                if(mainContainerHeight < (window.innerHeight || document.body.clientHeight))
                    __popuplayer.style.height = (window.innerHeight || document.body.clientHeight) + "px";
                else
                    __popuplayer.style.height = mainContainerHeight + "px";
            }
            var scrollInstance = $KG[model.id + "_scroller"];
            scrollInstance && scrollInstance.refresh();
        },

        adjustPosition: function(popupModel, popupelem) {
            var elem = popupModel.ismodal ? popupelem : popupelem.parentNode;
            if($KG.nativeScroll) {
                popupelem.parentNode.style.position = "fixed";
            }
            var contentNode = ((popupModel.containerheight || popupModel.containerheight == 0) ? $KU.getElementById(popupModel.id + '_group') : $KU.getElementById(popupModel.id + '_scroller')) || popupelem;
            var screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            var screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

            var top = Math.floor((100 - Math.floor((contentNode.offsetHeight * 100) / screenHeight)) / 2) + "%";
            var left = Math.floor((100 - Math.floor((contentNode.offsetWidth * 100) / screenWidth)) / 2) + "%";
            
            if(parseInt(top, 10) < 0)
                elem.style.top = 0;
            else
                elem.style.top = top;

            elem.style.left = left;
        },

        animationEnd: function(id, endTrans) {
            return function() {
                var event = "AnimationEnd";
                if(kony.appinit.isFirefox || $KU.isIE11)
                    event = event.toLowerCase();
                else
                    event = $KU.animationEnd;
                var popupelem = $KU.getElementById(id);
                var model = $KG.allforms[id];
                if(popupelem) {
                    kony.events.removeEventListener(popupelem, event, arguments.callee);
                    if(endTrans)
                        module.domremove(id);
                    else
                    if(!model.ismodal)
                        popupelem.parentNode.style.height = "auto";
                    popupelem.style[$KU.animationName] = "";
                }

                
                var className = endTrans ? id + "endanimation" : id + "animation";
                var styleSheetIndex = $KW.skins.getKonyStyleSheetIndex(document.styleSheets);
                var lastSheet = document.styleSheets[styleSheetIndex];
                var index = lastSheet.cssRules.length - 1;
                if(lastSheet.cssRules[index] && lastSheet.cssRules[index].name == className) {
                    if(lastSheet.deleteRule)
                        lastSheet.deleteRule(index);
                    else
                        lastSheet.removeRule(index);
                }
                
                
                if(!endTrans || endTrans == "None") {
                    popupelem.tabIndex = -1;
                    popupelem.focus();
                }
            };
        },

        setcontext: function(popupModel, context) {
            if(popupModel instanceof Object && context instanceof Object) {
                popupModel.context = context;
            }
        },

        add: function() {
            var formmodel = arguments[0];
            if("add" in formmodel) {
                var widarray = [].slice.call(arguments, 1);
                formmodel.add(widarray)
            }
        },

        addAt: function(popupModel, widgetref, index) {
            if(widgetref == null) return;
            popupModel.addAt && popupModel.addAt(widgetref, index);
        },

        widgets: function(popupModel) {
            if(popupModel.widgets) return popupModel.widgets();
        },

        remove: function(popupModel, widgetref) {
            popupModel.remove && popupModel.remove(widgetref);
        },

        removeAt: function(popupModel, index) {
            popupModel.removeAt && popupModel.removeAt(index);
        },

        scrollToBeginning: function(popupModel) {
            if(!popupModel)
                return;
            
            var scrollerInstance = $KG[popupModel.id + '_scroller'];
            var top = ($KU.isWindowsPhone && $KU.isIE9) ? 0 : 1;
            scrollerInstance ? scrollerInstance.scrollTo(0, scrollerInstance.minScrollY, 500) : $KW.Utils.scrollToElement(document.getElementById(popupModel.id) || null, 500, null, top);
        },

        scrollToEnd: function(popupModel) {
            if(!popupModel)
                return;
            
            var scrollerInstance = $KG[popupModel.id + '_scroller'];
            if(scrollerInstance) {
                scrollerInstance.scrollTo(0, scrollerInstance.maxScrollY, 500);
            } else {
                var bottom = document.body.scrollHeight - (!($KU.isWindowsPhone && $KU.isIE9) ? (window.innerHeight || document.body.clientHeight) : 0);
                $KW.Utils.scrollToElement(document.getElementById(popupModel.id) || null, 500, null, bottom);
            }
        },

        scrollToWidget: function(popupref, widgetref) {
            $KW.APIUtils.setfocus(widgetref, popupref);
        },

        handleshow: function(popupModel) {
            if("show" in popupModel)
                popupModel.show();
        },

        destroy: function(model) {
            if("destroy" in model)
                model.destroy(model);
        },
        onScrollDismissPopup: function(event) {
            
            if(window.pageYOffset > 1)
                module.dismissPopup(event);
        },

        dismissPopup: function(pf) {
            var e = pf;
            if(pf && typeof pf == "object") {
                var targetWidget = pf.target || pf.srcElement;
                targetWidget = $KU.getParentByAttribute(targetWidget, kony.constants.KONY_WIDGET_TYPE);
                pf = targetWidget ? ($KU.getContainerForm(targetWidget) || (targetWidget.getAttribute && targetWidget.getAttribute("kformname"))) : null;
                
                if(e.type === $KW.touch.events.touchstart) {
                    if(pf && (window[pf] && window[pf].wType === "Popup"))
                        $KG.isPopupScrolling = true;
                    else
                        $KG.isPopupScrolling = false;
                    return;
                }

                if($KG.isPopupScrolling)
                    return;
            }


            if(!pf || (window[pf] && window[pf].wType != "Popup")) {
                var popup = document.querySelector("div.popupcontainer");
                if(popup) {
                    var popupId = popup.id.split("_")[0];
                    if(window[popupId] && window[popupId].wType == "Popup") {
                        if(!window[popupId].ismodal) {
                            module.dismiss();
                            if($KG.nativeScroll && !($KU.isWindowsPhone && $KU.isIE9)) {
                                
                                kony.events.removeEventListener(document.body, $KU.isIDevice ? $KW.touch.events.touchstart : 'click', module.dismissPopup, false);
                                if(!$KU.isIDevice) {
                                    kony.events.removeEventListener(document.body, $KW.touch.events.touchstart, module.dismissPopup, false);
                                    kony.events.removeEventListener(window, 'scroll', module.onScrollDismissPopup, false);
                                    
                                }
                                
                                
                                
                                if(e)
                                    kony.touchClickNotifier && kony.touchClickNotifier.preventDefault(e);
                                kony.events.preventDefault(e);
                            }
                            return true;
                        }
                    }
                }


            }
            return false;
        }
    };


    return module;
}());
