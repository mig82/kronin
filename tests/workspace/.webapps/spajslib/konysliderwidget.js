
$KW.Slider = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("onorientationchange", "Slider", module.changeOrientation);
        },

        initializeView: function(formId, node) {
            var sliderNodes = node ? node.querySelectorAll("img[kwttype ='kSlider']") : document.querySelectorAll("#" + formId + " img[kwttype ='kSlider']");
            for(var i = 0; i < sliderNodes.length; i++) {
                this.attachSliderEvents(sliderNodes[i]);
            }

            var sliderouterNodes = node ? node.querySelectorAll("div[kwttype ='kSlider']") : document.querySelectorAll("#" + formId + " div[kwttype ='kSlider']");
            for(var i = 0; i < sliderouterNodes.length; i++) {
                kony.events.addEventListener(sliderouterNodes[i], "click", module.slideClick);
            }
        },

        attachSliderEvents: function(sliderNode) {
            kony.events.addEventListener(sliderNode, "touchstart", module.sliderStart);
            kony.events.addEventListener(sliderNode, "mousedown", module.sliderStart);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;

            switch(propertyName) {
                case "text":
                case "isvisible":
                    element.value = propertyValue;
                    break;

                case "leftskin":
                    widgetModel.leftskin = propertyValue;
                    $KU.removeClassName(element, oldPropertyValue);
                    $KU.addClassName(element, propertyValue);
                    break;
                case "rightskin":
                    widgetModel.rightskin = propertyValue;
                    $KU.removeClassName(element.parentNode, oldPropertyValue);
                    $KU.addClassName(element.parentNode, propertyValue);
                    break;
                case "thumbimage":
                    element.childNodes[0].src = $KU.getImageURL(propertyValue);
                    element.childNodes[0].setAttribute("thumbimage", $KU.getImageURL(propertyValue));
                    break;
                case "focusthumbimage":
                    element.childNodes[0].setAttribute("focusimage", $KU.getImageURL(propertyValue));
                    break;
                case "selectedvalue":
                    module.sliderUpdate(element, propertyValue);
                    break;
                case "containerweight":
                    
                    
                    this.imgLoad(element.firstChild);
                    break;
                case "minlabel":
                    var minLabelNode = document.getElementById(element.id + "_minLabel");
                    minLabelNode && (minLabelNode.innerHTML = propertyValue);
                    break;
                case "maxlabel":
                    var maxLabelNode = document.getElementById(element.id + "_maxLabel");
                    maxLabelNode && (maxLabelNode.innerHTML = propertyValue);
                    break;
                case "minlabelskin":
                    var minLabelNode = document.getElementById(element.id + "_minLabel");
                    $KU.removeClassName(minLabelNode, oldPropertyValue);
                    $KU.addClassName(minLabelNode, propertyValue);
                    break;
                case "maxlabelskin":
                    var maxLabelNode = document.getElementById(element.id + "_maxLabel");
                    $KU.removeClassName(maxLabelNode, oldPropertyValue);
                    $KU.addClassName(maxLabelNode, propertyValue);
                    break;
            }
        },

        validateSelectedValue: function(sliderModel) {
            if(sliderModel.selectedValue < sliderModel.min) {
                sliderModel.selectedValue = sliderModel.min
            }
            if(sliderModel.selectedValue > sliderModel.max) {
                sliderModel.selectedValue = sliderModel.max;
            }
        },

        render: function(sliderModel, context) {
            if(!sliderModel.buiskin) sliderModel.buiskin = sliderModel.blockeduiskin;

            var htmlString = "";
            var id = sliderModel.pf + "_" + sliderModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(sliderModel);
            if(kmasterObj.id != "") {
                id = kmasterObj.id;
            }
            module.validateSelectedValue(sliderModel);
            sliderModel.thickness = sliderModel.thickness || $KU.isIDevice && 2 || 5;
            var sliderleftskin = sliderModel.leftskin || sliderModel.leftSkin || "konysliderleft";
            var sliderrighttskin = sliderModel.rightskin || sliderModel.rightSkin || "konysliderright";
            var hideSkin = $KW.skins.getVisibilitySkin(sliderModel);
            var diff = sliderModel.max - sliderModel.min;

            var thumbimage = $KU.getImageURL(sliderModel.thumbimage) || $KU.getImageURL("slider.png");
            var focusthumbimage = $KU.getImageURL(sliderModel.focusthumbimage) || $KU.getImageURL("sliderfocus.png");
            var minlabeltext = sliderModel.minlabel || "";
            var maxlabeltext = sliderModel.maxlabel || "";
            sliderModel.view = sliderModel.view || "default";
            sliderModel.orientation = sliderModel.orientation || "horizontal";
            var horizontalleftstyle = '';
            if($KW.FlexUtils.isFlexWidget(sliderModel)) {
                horizontalleftstyle = 'height:0px;';
            }
            if(sliderModel.orientation == "horizontal") {
                htmlString += '<div' + " tabindex='0'" + 'style=" ' + $KW.skins.getMarginSkin(sliderModel, context) + '" class = "' + $KW.skins.getMarAdjustedContainerWeightSkin(sliderModel, 100) + hideSkin + '">';
                htmlString += '<div min= "' + sliderModel.min + '" max="' + sliderModel.max + '" diff ="' + diff + '" step ="' + sliderModel.step + '" kwttype ="kSlider" ';
                htmlString += 'id="' + id + '_outer" class="' + sliderrighttskin + '"  style=" height: ' + sliderModel.thickness + 'px;"';
                htmlString += ' kformname="' + sliderModel.pf + '" ' + kmasterObj.kmasterid + '>';

                htmlString += '<div role="slider" aria-valuenow="' + sliderModel.selectedvalue + '" ' + ' align="left"' + $KW.Utils.getBaseHtml(sliderModel, context) + ' class="' + sliderleftskin + '"';
                htmlString += 'style= "vertical-align:middle;  position: relative;' + horizontalleftstyle + ' ">';

                htmlString += '<img onload = "$KW.Slider.imgLoad(this, false)" kwttype ="kSlider" kformname="' + sliderModel.pf + '" id ="' + id + '_image" src ="' + thumbimage + '" thumbimage="' + thumbimage + '" focusimage ="' + focusthumbimage + '" style="  position: relative;  vertical-align:top;" ' + kmasterObj.kmasterid + '></img>';

                htmlString += '</div></div>';
                htmlString += '<div style="overflow:auto;position:relative;">';
                htmlString += '<label id="' + id + '_minLabel" style="float: left; "class="' + sliderModel.minlabelskin + '" ' + kmasterObj.kmasterid + '>' + minlabeltext + '</label>';
                htmlString += '<label id="' + id + '_maxLabel" style="float: right; "class="' + sliderModel.maxlabelskin + '" ' + kmasterObj.kmasterid + '>' + maxlabeltext + '</label>'
                htmlString += '</div>';

                htmlString += '</div>';
            } else {
                htmlString += '<div style="margin: 5%; width:90%;" class="' + hideSkin + '">';
                
                htmlString += '<div style="margin-bottom: 2px;" >';
                htmlString += '<label id="' + id + '_maxLabel" class="' + sliderModel.maxlabelskin + '" ' + kmasterObj.kmasterid + '>' + maxlabeltext + '</label>';
                htmlString += '</div>';

                htmlString += '<div min= "' + sliderModel.min + '" max="' + sliderModel.max + '" diff ="' + diff + '" step ="' + sliderModel.step + '" kwttype ="kSlider" ';
                htmlString += 'id="' + id + '_outer" class="' + sliderrighttskin + '"  style="height: 150px; width: ' + sliderModel.thickness + 'px;"';
                htmlString += ' kformname="' + sliderModel.pf + '" ' + kmasterObj.kmasterid + '>';

                htmlString += '<div  align="left"' + $KW.Utils.getBaseHtml(sliderModel, context) + ' class="' + sliderleftskin + '"';
                htmlString += 'style= "vertical-align:middle;  position: relative; ">';

                htmlString += '<img onload = "$KW.Slider.imgLoad(this, false)" kwttype ="kSlider" kformname="' + sliderModel.pf + '" id ="' + id + '_image" src ="' + thumbimage + '" thumbimage="' + thumbimage + '" focusimage ="' + focusthumbimage + '"style="  position: relative;  vertical-align:top;" ' + kmasterObj.kmasterid + '></img>';

                htmlString += '</div></div>';
                htmlString += '<div style="margin-top: 2px;" >';
                htmlString += '<label id="' + id + '_minLabel" class="' + sliderModel.minlabelskin + '" ' + kmasterObj.kmasterid + '>' + minlabeltext + '</label>'
                htmlString += '</div>';


                htmlString += '</div>';
            }
            sliderModel.context = context;
            return htmlString;
        },

        completeMove: function(event) {
            
            if(!event)
                event = window.event;
            kony.events.preventDefault(event);

            var node = kony.globals["__activeSlider"];
            if(!node || !$KW.Utils.isWidgetInteractable(node)) return;
            var sliderModel = $KU.getModelByNode(node);
            var containerId = node.getAttribute("kcontainerID");
            if(containerId) {
                sliderModel = $KW.Utils.getClonedModelByContainer(sliderModel, node, containerId);
                if(!sliderModel)
                    return;
            }
            var touch = event.touches && event.touches[0] || event;
            var imgNode = node.firstChild;
            var outerNode = node.parentNode;
            imgNode.src = imgNode.getAttribute("focusimage");

            if(sliderModel.orientation == "horizontal") {
                var imgoffset = imgNode.offsetWidth / 2;
                var move = (touch.pageX || touch.clientX) - imgoffset;
                var cwidth = outerNode.offsetWidth;
                var bodyoffset = $KW.Utils.getPosition(outerNode).left - imgoffset;

                if(move < (bodyoffset))
                    move = bodyoffset;
                if(move >= (cwidth + bodyoffset)) {
                    move = cwidth + bodyoffset;
                }

                var nearstep = Math.round((move - bodyoffset) / sliderModel.stepwidth);
                if(nearstep * sliderModel.step <= (sliderModel.max - sliderModel.min)) {
                    sliderModel.selectedvalue = sliderModel.min + (nearstep * sliderModel.step);
                    var slidemovement = Math.round(nearstep * sliderModel.stepwidth);
                    node.style.width = (imgoffset + slidemovement) + "px";
                    var maxWidth = node.parentNode.offsetWidth;
                    var width = imgoffset + slidemovement;
                    node.style.width = (width > maxWidth ? maxWidth : width) + "px";
                    imgNode.style.left = (slidemovement - imgoffset) + "px";
                } else {
                    
                    sliderModel.selectedvalue = sliderModel.max;
                    node.style.width = (cwidth + imgoffset) + "px";
                    imgNode.style.left = (cwidth + imgoffset) + "px";
                }
            } else {
                var imgoffset = imgNode.offsetHeight / 2;
                var move = (touch.pageY || touch.clientY) - imgoffset;

                var cwidth = outerNode.offsetHeight;
                var bodyoffset = $KW.Utils.getOffset(outerNode).top - imgoffset;

                if(move < (bodyoffset))
                    move = bodyoffset;
                if(move >= (cwidth + bodyoffset)) {
                    move = cwidth + bodyoffset;
                }

                var nearstep = Math.round((move - bodyoffset) / sliderModel.stepwidth);
                if(nearstep * sliderModel.step <= (sliderModel.max - sliderModel.min)) {
                    sliderModel.selectedvalue = sliderModel.min + (nearstep * sliderModel.step);
                    var slidemovement = Math.round(nearstep * sliderModel.stepwidth);
                    node.style.height = (imgoffset + slidemovement) + "px";
                    imgNode.style.top = (slidemovement - imgoffset) + "px";
                }

            }

            if(sliderModel.view != "progress") {
                spaAPM && spaAPM.sendMsg(sliderModel, 'onslide');
                $KAR && $KAR.sendRecording(sliderModel, 'slide', {'selectedValue': sliderModel.selectedValue, 'target': node, 'eventType': 'uiAction'});
                $KU.callTargetEventHandler(sliderModel, node, 'onslide');
            }
        },

        sliderStart: function(event) {
            
            if(!event)
                event = window.event;
            var target = event.target || event.srcElement;
            kony.globals["__activeSlider"] = target.parentNode;
            var sliderModel = $KU.getModelByNode(target.parentNode);

            if($KW.Utils.isWidgetInteractable(target.parentNode, true)) {
                kony.events.addEventListener(document, "mousemove", module.completeMove);
                kony.events.addEventListener(document, "mouseup", module.completeEnd);

                kony.events.addEventListener(document, "touchmove", module.completeMove);
                kony.events.addEventListener(document, "touchend", module.completeEnd);
                kony.events.preventDefault(event);
            }
        },

        completeEnd: function(event) {
            
            if(!event)
                event = window.event;
            var target = event.target || event.srcElement;
            kony.events.removeEventListener(document, "mousemove", module.completeMove);
            kony.events.removeEventListener(document, "touchmove", module.completeMove);

            module.sliderEnd(event);
        },

        slideClick: function(event) {
            
            if(!event)
                event = window.event;
            var target = event.target || event.srcElement;
            kony.globals["__activeSlider"] = event.currentTarget.childNodes[0];

            
            if(!target.firstChild)
                return;
            var sliderModel = $KU.getModelByNode(target.firstChild) || $KU.getModelByNode(target);

            if($KW.Utils.isWidgetInteractable(target.parentNode, true) && sliderModel && sliderModel.view != "progress") {
                kony.events.addEventListener(target, "click", module.completeMove);
                
            }
        },

        sliderEnd: function(event) {
            

            if(!event)
                event = window.event;

            var node = kony.globals["__activeSlider"];
            if(!node) return;

            kony.events.removeEventListener(document, "mouseup", module.completeEnd);
            kony.events.removeEventListener(document, "touchend", module.completeEnd);
            var sliderModel = $KU.getModelByNode(node);
            var containerId = node.getAttribute("kcontainerID");
            if(containerId) {
                sliderModel = $KW.Utils.getClonedModelByContainer(sliderModel, node, containerId);
                if(!sliderModel)
                    return;
            }
            if(sliderModel.view != "progress") {
                spaAPM && spaAPM.sendMsg(sliderModel, 'onselection');
                
                var sliderhandler = $KU.returnEventReference(sliderModel.onselection);
                $KU.callTargetEventHandler(sliderModel, node, 'onselection');
                sliderhandler && $KU.onEventHandler(sliderModel);
            }

            var imgNode = node.firstChild;
            imgNode.src = imgNode.getAttribute("thumbimage");
            kony.globals["__activeSlider"] = '';
            return;
        },


        changeOrientation: function(target) {
            var sliderNodes = document.querySelectorAll("img[kwttype ='kSlider']");
            for(var i = 0; i < sliderNodes.length; i++) {
                module.imgLoad(sliderNodes[i]);
            }
        },

        imgLoad: function(target) {
            if(!target.complete)
                return;
            var slider = target.parentNode.parentNode;
            var wNode = target.parentNode;
            var sliderModel = $KU.getModelByNode(wNode);
            var containerId = wNode.getAttribute("kcontainerID");
            if(containerId) {
                sliderModel = $KW.Utils.getClonedModelByContainer(sliderModel, wNode, containerId);
            }
            if(!sliderModel)
                return;

            if($KU.isAndroid && window.event && window.event.type == "load" && slider.offsetWidth == 0)
                return;

            if(sliderModel.view == "progress") {
                target.style.display = "none";
            }

            var noofsteps = (sliderModel.max - sliderModel.min) / sliderModel.step;

            if(sliderModel.orientation == "horizontal") {
                var imght = target.offsetHeight - sliderModel.thickness;
                var imgwt = target.width;
                target.style.top = (-(imght) / 2) + "px";
                if(sliderModel.view == "progress")
                    target.parentNode.style.width = 0 + "px";
                else
                    target.parentNode.style.width = (imgwt / 2) + "px";

                target.parentNode.style.height = sliderModel.thickness + "px";
                var sliderwidth = slider.offsetWidth;
                var parentNode = slider.parentNode;
                var height = parentNode.offsetHeight;
                if($KW.FlexUtils.isFlexWidget(sliderModel) && height > imght) {
                    slider.style.position = 'relative';
                    var lblHeight = 0;
                    if(sliderModel.minlabel || sliderModel.maxlabel)
                        lblHeight = slider.nextSibling.offsetHeight;
                    var top = (height - lblHeight - (slider.offsetHeight / 2)) / 2;
                    slider.style.top = top + 'px';
                    slider.style.marginTop = slider.style.marginBottom = '';
                    if(sliderModel.minlabel || sliderModel.maxlabel)
                        slider.nextSibling.style.top = top + 3 + 'px';
                } else {
                    if(imght > 0) {
                        slider.style.marginTop = (imght / 2) + "px";
                        slider.style.marginBottom = (imght / 2) + "px";
                    }
                }
                parentNode.style.paddingLeft = (imgwt / 2) + "px";
                parentNode.style.paddingRight = (imgwt / 2) + "px";
                sliderwidth = parentNode.childNodes[0].offsetWidth;
            } else {
                var imght = target.height;
                var imgwt = target.offsetWidth - sliderModel.thickness;
                target.style.left = -((imgwt) / 2) + "px";
                if(sliderModel.view == "progress")
                    target.parentNode.style.height = "0px";
                else
                    target.parentNode.style.height = (imght / 2) + "px";

                target.parentNode.style.width = sliderModel.thickness + "px";
                var sliderwidth = slider.offsetHeight;

            }

            var stepwidth = sliderwidth / noofsteps;
            sliderModel.noofsteps = noofsteps;
            sliderModel.stepwidth = stepwidth;
            sliderModel.imgwt = imgwt;
            module.sliderLoad(sliderModel, target.parentNode);
        },

        sliderLoad: function(sliderModel, sliderNode) {
            var duration = 500;
            var imgNode = sliderNode.firstChild;
            if(sliderModel.orientation == "horizontal") {

                var imgoffset = imgNode.offsetWidth / 2;

                var outerNode = sliderNode.parentNode;
                var cwidth = outerNode.offsetWidth;
                var bodyoffset = $KW.Utils.getOffset(outerNode).left - imgoffset;

                var nearstep = sliderModel.selectedvalue - sliderModel.min;

                var move = (nearstep * sliderModel.stepwidth) / sliderModel.step;

                if(sliderModel.view == "progress") {
                    if(kony.appinit.useTransition) {
                        sliderNode.style[$KU.transition] = 'width ' + duration + 'ms ease';
                        sliderNode.style.width = (move + imgoffset) + "px";
                    } else {
                        $(sliderNode).animate({
                            width: (move + imgoffset) + "px"
                        }, duration);
                    }
                } else {
                    

                    sliderNode.style.width = (move) + "px";
                }

                imgNode.style.left = (move - imgoffset) + "px";
            } else {
                var imgoffset = imgNode.offsetHeight / 2;

                var outerNode = sliderNode.parentNode;
                var cwidth = outerNode.offsetHeight;
                var bodyoffset = $KW.Utils.getOffset(outerNode).top - imgoffset;

                var nearstep = sliderModel.selectedvalue - sliderModel.min;

                var move = (nearstep * sliderModel.stepwidth) / sliderModel.step;

                if(sliderModel.view == "progress") {
                    if(kony.appinit.useTransition) {
                        sliderNode.style[$KU.transition] = 'height ' + duration + 'ms ease';
                        sliderNode.style.height = (move + imgoffset) + "px";
                    } else {
                        $(sliderNode).animate({
                            height: (move + imgoffset) + "px"
                        }, duration);
                    }
                } else {
                    sliderNode.style.height = (move + imgoffset) + "px";
                }

                imgNode.style.top = (move - imgoffset) + "px";


            }

        },

        sliderUpdate: function(sliderNode, value, clonedModel) {
            var sliderModel = clonedModel || $KU.getModelByNode(sliderNode);
            if(value >= sliderModel.max)
                value = sliderModel.max;
            if(value <= sliderModel.min)
                value = sliderModel.min;
            
            var abc = value % sliderModel.step;
            if(abc != 0) {
                value = sliderModel.step * Math.round(value / sliderModel.step);
            }
            sliderModel.selectedvalue = value;
            module.sliderLoad(sliderModel, sliderNode);
        },

        adjustSliders: function(container) {
            var sliderNodes = document.querySelectorAll("#" + formId + " img[kwttype ='kSlider']");
            for(var i = 0; i < sliderElements.length; i++) {
                var sliderElement = sliderElements[i];
                module.imgLoad(sliderElement);
            }
        },

        animSlider: function(width, sliderModel, property) {
            if(!width) return 0;
            var sliderNode = $KU.getNodeByModel(sliderModel);
            var imgWidth = sliderNode.childNodes[0].naturalWidth;

            var valueObj = {
                value: parseFloat(width),
                unit: $KW.FlexUtils.getUnit(width)
            };
            var width = $KW.FlexUtils.getValueByParentFrame(sliderModel, valueObj, 'x');
            var width = parseInt(width, 10);
            var selectedValue = sliderModel.selectedvalue;

            width = (width - imgWidth) / 100;
            var nearstep = selectedValue - sliderModel.min;
            var move = (nearstep * width) / sliderModel.step;

            if(property == 'width')
                return(move + (imgWidth / 2)) + "px";
            else
                return(move - (imgWidth / 2)) + "px";
        }
    };


    return module;
}());
