
$KW.Appmenu = (function() {
    
    

    var module = {
        focusIndex: "",

        initialize: function() {
            kony.events.addEvent("click", "Appmenu", this.eventHandler);
        },

        updateView: function(currentFormID, widgetModel, propertyName, propertyValue, oldPropertyValue) {
            
        },

        render: function(widgetID, widgetGenerationContext) {
            var appmenuWidgetModel = $KG["__appmenu"]; 
            var appmenuData = appmenuWidgetModel.data;
            var totalItems = appmenuWidgetModel.data.length;
            var moreExists = false;
            var count = 0;
            for(var i = IndexJL; i < appmenuData.length; i++) {
                if(appmenuData[i][IndexJL + 4])
                count++;

            }
            
            var widgetWeight = "";
            var weightofItem = 25;
            if((count + IndexJL) > 4) {
                moreExists = true;
                widgetWeight = "kwt" + (100 / 5);
                weightofItem = Math.floor(100 / 5);
            } else {
                widgetWeight = "kwt" + (100 / count);
                weightofItem = Math.floor(100 / count);
            }
            weightofItem = weightofItem + "%";

            var htmlString = "";
            if(!widgetGenerationContext) {
                var className = "";
                if($KU.isTablet || $KU.isMob) {
                    className = "appmenu_scroller";
                    var formModel = $KG["__currentForm"];
                    if(formModel.dockableappmenu === false || $KG["nativeScroll"])
                        className += " relativePos";
                    else {
                        className += " absolutePos";
                    }
                }
                htmlString += "<div id='konyappmenudiv'  class='" + className + "'>";
            }

            htmlString += "<div class='kbasemargin kwt100 ktable' style='table-layout:fixed;' ><div class='kwt100 krow'>";

            if(moreExists)
                totalItems = IndexJL + 4;

            var nxtIndex = 0;

            var focusIndex = module.focusIndex;
            var appmenuSkin;
            for(var i = IndexJL, cnt = IndexJL - 1; i < appmenuData.length; i++) {
                if(focusIndex !== "" && focusIndex === i && appmenuWidgetModel.focusskin)
                    appmenuSkin = appmenuWidgetModel.focusskin || "";
                else
                    appmenuSkin = appmenuWidgetModel.skin || "";

                if(focusIndex !== "" && focusIndex === i && appmenuWidgetModel.focusskin)
                    appmenuSkin = appmenuWidgetModel.focusskin || "";
                else
                    appmenuSkin = appmenuWidgetModel.skin || "";
                if(appmenuData[i][IndexJL + 4]) {
                    cnt++;
                    var closure = ""; 
                    var label = appmenuData[i][1 + IndexJL] || "";
                    var image = $KU.getImageURL(appmenuData[i][2 + IndexJL]) || "";
                    if($KG["localization"] && label.toLowerCase().indexOf("i18n.getlocalizedstring") != -1) {
                        label = $KU.getI18NValue(label);
                    }

                    htmlString += "<div style='width:" + weightofItem + ";' class='" + appmenuSkin + " middlecenteralign kcell' index='" + i + "'><a id='" + appmenuData[i][IndexJL] + "' " + closure + " href='#' kwidgettype='Appmenu' event='yes' index='" + i + "' style='text-decoration:none;'><div>";

                    if(image)
                        htmlString += "<img  style='border:none;' src='" + image + "' width='30px' height='30px' align='middle'/>";

                    htmlString += "</div><div><label class='" + appmenuSkin + "' style='background:inherit; border: none; white-space:pre-wrap;     word-wrap:break-word; '>" + label + "</label></div></a></div>";
                    
                    if(moreExists && cnt == 3) {
                        nxtIndex = i + 1;
                        break;
                    }
                }
            }

            if(moreExists) {
                appmenuSkin = appmenuWidgetModel.skin || "";
                htmlString += "<div id='konyappmenudiv_more' class='" + appmenuSkin + " middlecenteralign " + " kcell' style='width:" + weightofItem + ";'><a id='appmenumore' href='#' kwidgettype='Appmenu' event='yes' index='5' style='text-decoration:none;'><div>";
                htmlString += "<img  style='border:none;' src='" + $KU.getImageURL("appmore.png") + "' width='30px' height='30px' align='middle' kwidgettype='Appmenu'/></div><div><label class='" + appmenuSkin + "' style='background:inherit; border: none;' kwidgettype='Appmenu'>more</label></div></a></div>";

                
                var moreContainerClass = $KG["nativeScroll"] ? 'position:fixed' : 'height:auto;top:0px;';

                var moreHtmlString = "<div id='appmenumore_container' class='popupcontainer absoluteContainer' dummy='' style='display: none;z-index: 11; " + moreContainerClass + "'><div id='__popuplayer' style='opacity:0;filter:alpha(opacity=0);' class='popuplayer absoluteContainer' dummy=''></div><div id='more' class='frm' style='z-index: 9; position: absolute; padding: 0%; right:0%;bottom:0px; -webkit-animation: 1s;' dummy=''><div id='containerLayer' style='display:table;' class='container'>";

                for(var i = nxtIndex; i < appmenuData.length; i++) {
                    if(appmenuData[i][IndexJL + 4]) {
                        var closure = appmenuData[i][IndexJL + 3];
                        if(closure)
                            closure = "closure='" + closure + "'";
                        else
                            closure = "";
                        var label = appmenuData[i][1 + IndexJL] || "";
                        var image = $KU.getImageURL(appmenuData[i][2 + IndexJL]) || "";
                        if($KG["localization"] && label.toLowerCase().indexOf("i18n.getlocalizedstring") != -1)
                            label = $KU.getI18NValue(label);

                        moreHtmlString += "<div class='kwt100 krow " + appmenuSkin + "'><div class='" + appmenuSkin + " middlecenteralign kcell' index ='" + i + "'><a id='" + appmenuData[i][IndexJL] + "' " + closure + " href='#' kwidgettype='Appmenu' event='yes' index='" + i + "' style='text-decoration: none;'><div style='padding:2px;'>";

                        if(image)
                            moreHtmlString += "<img  style='border:none;' src='" + $KU.getImageURL(appmenuData[i][2 + IndexJL]) + "'  width='30px' height='30px' align='middle' kwidgettype='Appmenu'/>";

                        moreHtmlString += "<label class='" + appmenuSkin + "' style='background:inherit; border: none; white-space:pre-wrap;     word-wrap:break-word;margin-left:5px;' kwidgettype='Appmenu' index='" + i + "'>" + label + "</label></div></a></div></div>";
                    }
                }
                moreHtmlString += "</div></div>";
                var mainContainer = document.getElementById('__MainContainer');

                var appmoreCont = document.getElementById("appmenumore_container");
                if(appmoreCont) appmoreCont.parentElement.removeChild(appmoreCont);
                var popupContainer = document.createElement('div');
                popupContainer.innerHTML = moreHtmlString;
                mainContainer.appendChild(popupContainer.firstChild);
            }

            htmlString += "</div></div></div>";
            return htmlString;
        },

        eventHandler: function(eventObject, target, sourceFormID) {
            var appmenuWidgetModel = $KG["__appmenu"]; 
            var appmenuData = appmenuWidgetModel.data;
            var targetNode = $KU.getParentByTagName(target, 'a');
            var closure;
            var appmenuId = targetNode.id;

            if(appmenuId == 'appmenumore') {
                
                closure = module.showmoreappmenuitems;
            } else {
                module.hidemoreappmenuitems();
                var index = targetNode.parentNode.getAttribute("index");
                closure = appmenuData[index][3 + IndexJL];
            }

            if(appmenuWidgetModel.focusskin) {
                if(module.focusIndex != "") {
                    var focusClass = document.querySelectorAll('div.' + appmenuWidgetModel.focusskin + ', a label.' + appmenuWidgetModel.focusskin);
                    var focusLen = focusClass.length;
                    if(!(targetNode.id == "appmenumore")) {
                        
                        for(var k = focusLen - 1; k >= 0; k--) {
                            if(focusClass[k].tagName.toLowerCase() == 'label')
                                focusClass[k].className = appmenuWidgetModel.skin;
                            else
                                focusClass[k].className = appmenuWidgetModel.skin + " middlecenteralign kcell";
                        }
                    }
                }

                module.focusIndex = index;
                
                if(!(targetNode.id == "appmenumore")) {
                    targetNode.parentNode.className = appmenuWidgetModel.focusskin + " middlecenteralign kcell";
                    var labelEle = document.querySelectorAll('#' + targetNode.id + '  label');
                    if(labelEle) labelEle[0].className = appmenuWidgetModel.focusskin;
                }
            }
            if($KU.getPlatformVersion('windowsphone') == "7.5") {
                var moreContainer = document.getElementById('appmenumore_container');
                if(moreContainer) {
                    var mainContainer = document.getElementById('__MainContainer');
                    var appmenuHeight = document.getElementById('konyappmenudiv').offsetHeight;
                    var mainHeight = ((mainContainer.offsetHeight) - (appmenuHeight)) + "px";
                    moreContainer.style.height = mainHeight;
                }
            }
            $KAR && $KAR.sendRecording(appmenuWidgetModel, 'click', {'target': target, 'wType': 'appMenu', 'appmenuid': appmenuId, 'eventType': 'uiAction'});
            var appmenuEvent = $KU.returnEventReference(closure);
            appmenuEvent && appmenuEvent.call(appmenuWidgetModel, appmenuWidgetModel);
            
        },

        setappmenu: function(appmenu, skin, focusSkin) {
            var appmenuWidgetModel = $KG["__appmenu"]; 
            for(var i = IndexJL; i < appmenu.length; i++) {
                appmenu[i][4 + IndexJL] = true;
            }

            if(!appmenuWidgetModel) {
                var tempmenu = new Object();
                tempmenu.data = appmenu;
                tempmenu.skin = skin;
                tempmenu.focusskin = focusSkin;
                $KG["__appmenu"] = tempmenu;
            } else {
                appmenuWidgetModel.data = appmenu;
                appmenuWidgetModel.skin = skin;
                appmenuWidgetModel.focusskin = focusSkin;
            }
        },

        setappmenufocusindex: function(index) {
            var appmenuWidgetModel = $KG["__appmenu"]; 
            var appmenuNode = $KU.getElementById("konyappmenudiv");
            if(!appmenuNode) 
                return;
            var appmenuData = appmenuWidgetModel.data;
            if(appmenuWidgetModel.focusskin) {
                var focusClass = document.querySelectorAll('div.' + appmenuWidgetModel.focusskin + ', a label.' + appmenuWidgetModel.focusskin);
                var focusLen = focusClass.length;
                for(var k = focusLen - 1; k >= 0; k--) {
                    if(focusClass[k].tagName.toLowerCase() == 'label')
                        focusClass[k].className = appmenuWidgetModel.skin;
                    else
                        focusClass[k].className = appmenuWidgetModel.skin + " middlecenteralign kcell";
                }
                var targetNode = document.querySelectorAll("div a[index='" + (index - IndexJL) + "']")[0];
                if(targetNode) targetNode.parentNode.className = appmenuWidgetModel.focusskin + " middlecenteralign kcell";
                var labelEle = document.querySelectorAll('#' + targetNode.id + '  label');
                if(labelEle) labelEle[0].className = appmenuWidgetModel.focusskin;
                module.focusIndex = index - IndexJL;
            }
        },

        hideappmenuitems: function(menulist) {
            var appmenuWidgetModel = $KG["__appmenu"]; 
            var tempmodel = appmenuWidgetModel.data;
            for(var i = IndexJL; i < (menulist.length); i++) {
                for(var j = IndexJL; j < appmenuWidgetModel.data.length; j++) {
                    if(tempmodel[j][IndexJL] == menulist[i]) {
                        tempmodel[j][4 + IndexJL] = false;
                    }
                }
            }
            var appmenuNode = $KU.getElementById("konyappmenudiv");
            var widgetGenerationContext = new $KW.WidgetGenerationContext();
            widgetGenerationContext.setdynamically = true;
            
            appmenuNode && (appmenuNode.innerHTML = module.render("__appmenu", widgetGenerationContext));
        },

        showappmenuitems: function(menulist) {
            var appmenuWidgetModel = $KG["__appmenu"];
            var tempmodel = appmenuWidgetModel.data;
            for(var i = IndexJL; i < appmenuWidgetModel.data.length; i++) {
                var itemexists = false;
                for(var j = IndexJL; j < menulist.length; j++) {
                    if(tempmodel[i][IndexJL] == menulist[j]) {
                        itemexists = true;
                        break;
                    }
                }
                tempmodel[i][4 + IndexJL] = itemexists;
            }
            var appmenuNode = $KU.getElementById("konyappmenudiv");
            var widgetGenerationContext = new $KW.WidgetGenerationContext();
            widgetGenerationContext.setdynamically = true;
            if(appmenuNode) {
                appmenuNode.innerHTML = module.render("__appmenu", widgetGenerationContext);
            } else {
                var appmenu_wrapper = $KU.getElementById("appmenu_container");
                
                if(!appmenu_wrapper)
                    return;
                var temp = document.createElement("DIV");

                var className = "appmenu_scroller";
                if($KG["nativeScroll"])
                    className += " relativePos";
                else
                    className += " absolutePos";

                temp.className = className;
                temp.setAttribute("id", "konyappmenudiv");
                temp.innerHTML = module.render("__appmenu", widgetGenerationContext);
                appmenu_wrapper.appendChild(temp);

            }
        },

        removeappmenuitem: function(id) {
            var appmenuWidgetModel = $KG["__appmenu"]; 
            var appmenuData = appmenuWidgetModel.data;
            
            for(var i = IndexJL; i < appmenuWidgetModel.data.length; i++) {
                if(appmenuData[i][IndexJL] == id) {
                    
                    appmenuData.splice(i, 1);
                    if(module.focusIndex == i)
                        module.focusIndex = "";
                    break;
                }
            }
            var appmenuNode = $KU.getElementById("konyappmenudiv");
            var widgetGenerationContext = new $KW.WidgetGenerationContext();
            widgetGenerationContext.setdynamically = true;
            appmenuNode.innerHTML = module.render("__appmenu", widgetGenerationContext);
        },

        addappmenuitem: function(appmenu, index) {
            var appmenuWidgetModel = $KG["__appmenu"]; 
            var appmenuData = appmenuWidgetModel.data;
            var itemExists = false; 
            for(i = IndexJL; i < (appmenuData.length); i++) {
                if(appmenuData[i][IndexJL] == appmenu[IndexJL]) {
                    itemExists = true;
                    break;
                }
            }
            if(itemExists)
                return;
            appmenu[4 + IndexJL] = true;
            appmenuData.splice(index, 0, appmenu);
            var appmenuNode = $KU.getElementById("konyappmenudiv");
            var widgetGenerationContext = new $KW.WidgetGenerationContext();
            widgetGenerationContext.setdynamically = true;
            appmenuNode.innerHTML = module.render("__appmenu", widgetGenerationContext);
        },

        showmoreappmenuitems: function() {
            var moreContainer = document.getElementById('appmenumore_container');
            if(moreContainer) {
                var appMenuEle = document.getElementById('konyappmenudiv');
                var paddingTop = parseInt($KU.getStyle(appMenuEle, 'padding-top')) || 0;
                var marginTop = parseInt($KU.getStyle(appMenuEle, 'margin-top')) || 0;
                var bottom = document.getElementById('konyappmenudiv').offsetHeight;
                bottom = bottom - (marginTop + paddingTop);
                moreContainer.style.bottom = bottom + "px";
                if(moreContainer.style.display == 'none')
                    moreContainer.style.display = 'block';
                else if(moreContainer.style.display == 'block')
                    moreContainer.style.display = 'none';
            }
        },

        hidemoreappmenuitems: function() {
            var moreContainer = document.getElementById('appmenumore_container');
            if(moreContainer) moreContainer.style.display = 'none';
        },

        createappmenu: function(appmenuid, appmenu, skinid, onfocusSkinid) {
            for(var i = IndexJL; i < appmenu.length; i++) {
                appmenu[i][4 + IndexJL] = true;
            }
            var tempmenu = new Object();
            tempmenu.data = appmenu;
            tempmenu.skin = skinid;
            tempmenu.focusskin = tempmenu.focusSkin = onfocusSkinid;
            if($KG["__appmenu"])
                $KG["__appmenu"][appmenuid] = tempmenu;
            else {
                $KG["__appmenu"] = tempmenu;
            }
        },

        setcurrentappmenu: function(appmenuid) {
            if($KG["__appmenu"][appmenuid])
                $KG["__appmenu"] = $KG["__appmenu"][appmenuid];
            else
                $KG["__appmenu"] = $KG["__appmenu"];

            var appmenuWidgetModel = $KG["__appmenu"]; 
            var appmenuData = appmenuWidgetModel.data;
            
            var appmenuNode = $KU.getElementById("konyappmenudiv");
            var widgetGenerationContext = new $KW.WidgetGenerationContext();
            widgetGenerationContext.setdynamically = true;
            if(appmenuNode) {
                appmenuNode.innerHTML = module.render("__appmenu", widgetGenerationContext);
            } else {
                var appmenu_wrapper = $KU.getElementById("appmenu_container");
                
                if(!appmenu_wrapper) return;

                var temp = document.createElement("DIV");

                var className = "appmenu_scroller";
                if($KG["nativeScroll"])
                    className += " relativePos";
                else
                    className += " absolutePos";

                temp.className = className;
                temp.setAttribute("id", "konyappmenudiv");
                temp.innerHTML = module.render("__appmenu", widgetGenerationContext);

                if($KG["__currentForm"].needappmenu)
                    appmenu_wrapper.appendChild(temp);

                var appmenuEvent = $KU.returnEventReference(appmenuData[IndexJL][3 + IndexJL]);
                appmenuEvent && appmenuEvent.call(appmenuWidgetModel, appmenuWidgetModel);
            }
            $KG["currappmenu"] = appmenuid;
        },

        getcurrentappmenu: function() {
            return $KG["currappmenu"];
        },

        setappmenufocusbyid: function(appMenuItemId) {
            var appmenuData = $KG["__appmenu"].data;
            var i;
            var itemExists = false;
            for(i = IndexJL; i < (appmenuData.length); i++) {
                if(appmenuData[i][IndexJL] == appMenuItemId) {
                    itemExists = true;
                    break;
                }
            }
            if(itemExists)
                module.setappmenufocusindex(i);
        },

        addappmenuitemat: function(appmenuid, index, appmenuitem) {
            module.addappmenuitem(appmenuitem, index);
            module.focusIndex = "";
        },

        removeappmenuitemat: function(appmenuid, index) {
            var appmenuData = $KG["__appmenu"].data;
            module.removeappmenuitem(appmenuData[index][IndexJL]);
            if(module.focusIndex == index)
                module.focusIndex = "";
        }
    };


    return module;
}());
