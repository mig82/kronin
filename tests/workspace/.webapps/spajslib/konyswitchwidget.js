
$KW.Switch = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "Switch", this.eventHandler);
            kony.events.addEvent("onorientationchange", "Switch", this.adjustSwitchWidth);
        },

        initializeView: function(formId, node) {
            this.adjustSwitchWidth(formId, true, node);
            this.adjustSwitchHeight(formId, node);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            var isCustomSwitch = module.isCustomSwitch(widgetModel);

            if(!element)
                return;
            element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);

            var nodesInSwitch = module.getNodesInSwitch(element, widgetModel);

            switch(propertyName) {
                case "selectedindex":
                    if($KU.isIOSgt6)
                        this.adjustSwitch(widgetModel, element, "all 0.4s ease-in-out");
                    else
                    this.adjustSwitch(widgetModel, element, "all 0.125s ease-in-out");
                    break;
                case "leftsidetext":
                    if(!$KW.Utils.belongsToSegment(element) && isCustomSwitch) {
                        nodesInSwitch.leftTextNode.innerHTML = $KU.escapeHTMLSpecialEntities(propertyValue);
                    } else if(!$KW.Utils.belongsToSegment(element)) {
                        nodesInSwitch.onNode.innerHTML = $KU.escapeHTMLSpecialEntities(propertyValue);
                    }
                    break;
                case "rightsidetext":
                    if(!$KW.Utils.belongsToSegment(element) && isCustomSwitch) {
                        nodesInSwitch.rightTextNode.innerHTML = $KU.escapeHTMLSpecialEntities(propertyValue);
                    } else if(!$KW.Utils.belongsToSegment(element)) {
                        nodesInSwitch.offNode.innerHTML = $KU.escapeHTMLSpecialEntities(propertyValue);
                    }
                    break;
                case "thumbwidth":
                case "thumbheight":
                case "trackwidth":
                case "trackheight":
                    if(!$KW.Utils.belongsToSegment(element) && isCustomSwitch) {
                        var htmlString = this.render(widgetModel, {
                            tabpaneID: element.getAttribute("ktabpaneid")
                        }); 
                        element = element.parentNode;
                        element.innerHTML = htmlString;
                        this.adjustSwitch(widgetModel, element.firstElementChild, "all 0.4s ease-in-out");
                    }
                    break;
                case "thumbtext":
                    if(!$KW.Utils.belongsToSegment(element) && isCustomSwitch)
                        nodesInSwitch.thumbTextNode.innerHTML = $KU.escapeHTMLSpecialEntities(propertyValue);
                    break;
                case "thumbskin":
                    if(module.isCustomSwitch(widgetModel)) {
                        var switchState = ['thumbon', 'thumboff'][widgetModel.selectedIndex];
                        $KU.removeClassName(nodesInSwitch.thumbNode, oldPropertyValue + switchState);
                        $KU.addClassName(nodesInSwitch.thumbNode, propertyValue + switchState);
                    }
                    break;
            }
        },

        addA11YAttribute: function(switchModel, switchDiv, forceAriaLabel) {
            if(!switchModel.accessibilityConfig || forceAriaLabel) {
                if(switchModel.leftsidetext && switchModel.selectedIndex === 0) {
                    switchDiv.setAttribute('aria-label', switchModel.leftsidetext);
                } else if(switchModel.rightsidetext) {
                    switchDiv.setAttribute('aria-label', switchModel.rightsidetext);
                }
            }
        },

        renderIOSgt6Switch: function(switchModel, context, params) {
            var switchStyle = [
                "",
                "background-image : none",
                "height   : 31px;",
                "padding  : 0",
                "position : relative",
                "width    : 51px",
                "-webkit-border-radius: 15.5px;",
                "background-size:100%",
                "display : inline-block;",
                ""
            ].join(";");
            var thumbStyle = [
                "",
                "border     : 0",
                "background : #FFF",
                "height     : 28px",
                "position   : relative",
                "width      : 28px",
                "top        : 1.5px",
                "z-index    : 3",
                "-webkit-border-radius:14px",
                "-webkit-box-shadow:1px 1px 3px 0 rgba(0,0,0,0.3)",
                ""
            ].join(";");
            var onStyle = [
                "",
                "display:none",
                ""
            ].join(";");
            var thumbSpanStyle = [
                "",
                "display:none",
                ""
            ].join(";");
            var offStyle = [
                "",
                "background       : #FFF",
                "background-image : none",
                "border   : 1px solid #ccc",
                "height   : 31px",
                "left     : 0",
                "margin   : 0",
                "padding  : 0",
                "position : absolute",
                "top      : 0",
                "width    : 51px",
                "z-index  : 2",
                "-webkit-border-radius:15.5px",
                ""
            ].join(";");

            switchStyle += $KW.skins.getBlurStyle(switchModel);

            var htmlString = "<div role='option' aria-selected='" + ['true', 'false'][switchModel.selectedIndex] +
                "' " + params.substituteAccessAttr + $KW.Utils.getBaseHtml(switchModel, context) + "class='switch " +
                params.computedSkin + " " + (switchModel.skin ? switchModel.skin + "on" : "") + "' style='" +
                params.margin + switchStyle + (!switchModel.skin ? ";background: #4FD065" : "") + "'>" +
                "<div  id='" + switchModel.id + "_on' style='" + onStyle + "'>" + params.lText + "</div>" +
                "<div class='thumb' id='" + switchModel.id + "_thumb' style='" +
                thumbStyle + "'>" + "<span style='" +
                thumbSpanStyle + "'></span></div>" +
                "<div  id='" + switchModel.id + "_off' style='" +
                offStyle + "'>" + params.rText + "</div>" +
                "</div>";
            return htmlString;
        },

        renderSwitchOtherThanIOSgt6: function(switchModel, context, params) {
            var switchStyle = $KW.skins.getBlurStyle(switchModel);
            var htmlString = "<div role='option' aria-selected='" + ['true', 'false'][switchModel.selectedIndex] + "' " +
                params.substituteAccessAttr + $KW.Utils.getBaseHtml(switchModel, context) + "class='kwt100 switch " +
                params.computedSkin + "' style='" + params.margin + switchStyle + "'>" +
                "<div aria-hidden='true' class='" + (switchModel.skin ? (switchModel.skin + "on") : "on konycustomcss") +
                "' id='" + switchModel.id + "_on'>" + params.lText + "</div>" +
                "<div aria-hidden='true' class='thumb' id='" + switchModel.id + "_thumb'> <span></span></div>" +
                "<div aria-hidden='true' class=' " + (switchModel.skin ? (switchModel.skin + "off") : "off konycustomcss") +
                "' id='" + switchModel.id + "_off'>" + params.rText + "</div>" +
                "</div>";
            return htmlString;
        },

        render: function(switchModel, context) {
            var computedSkin = $KW.skins.getWidgetSkinList(switchModel, context);
            var margin = $KW.skins.getMarginSkin(switchModel, context);
            var lText = switchModel.leftsidetext || "ON";
            var rText = switchModel.rightsidetext || "OFF";
            var isCustomSwitch = module.isCustomSwitch(switchModel);
            var substituteAccessAttr = "";
            if(switchModel.accessibilityConfig == undefined) {
                if(switchModel.leftsidetext && switchModel.selectedIndex === 0) {
                    substituteAccessAttr = " aria-label='" + switchModel.leftsidetext + "' ";
                } else if(switchModel.rightsidetext) {
                    substituteAccessAttr = " aria-label='" + switchModel.rightsidetext + "' ";
                }
            }
            if($KU.isIOSgt6 && !isCustomSwitch) {
                lText = "";
                rText = "";
            }

            if(isCustomSwitch) {
                lText = switchModel.leftsidetext;
                rText = switchModel.rightsidetext;
            }

            switchModel.selectedindex = (switchModel.selectedindex == IndexJL) ? IndexJL : IndexJL + 1;
            var params = {
                "computedSkin": computedSkin,
                "margin": margin,
                "lText": lText,
                "rText": rText,
                "substituteAccessAttr": substituteAccessAttr
            };

            if(isCustomSwitch) {
                return module.renderCustomSwitch(switchModel, context, params);
            } else {
                if($KU.isIOSgt6) {
                    return module.renderIOSgt6Switch(switchModel, context, params);
                } else {
                return module.renderSwitchOtherThanIOSgt6(switchModel, context, params);
                }
            }
            return htmlString;
        },

        adjustSwitchWidth: function(formId, attachEvent, node) {
            var switches = node ? node.querySelectorAll("div[kwidgettype='Switch']") : document.querySelectorAll("#" + formId + " div[kwidgettype='Switch'], div[class~='popupmain'] div[kwidgettype='Switch']");
            for(var i = 0; i < switches.length; i++) {
                var switchModel = $KU.getModelByNode(switches[i]);
                var containerId = switches[i].getAttribute("kcontainerID");
                if(containerId) {
                    switchModel = $KW.Utils.getClonedModelByContainer(switchModel, switches[i], containerId);
                }
                module.adjustWidth(switchModel, switches[i], attachEvent);
            }
        },

        adjustWidthOtherThanIOSgt6: function(switchModel, switchNode, attachEvent) {
            var nodesInSwitch = module.getNodesInSwitch(switchNode, switchModel);
            nodesInSwitch.onNode.style.marginRight = "-6px";
            nodesInSwitch.offNode.style.marginLeft = "-6px";
            switchModel.cWidth = (Math.floor(switchNode.clientWidth / 2));
            switchModel.sWidth = switchModel.cWidth + (switchNode.clientWidth % 2) + 6;
            nodesInSwitch.onNode.style.width = (switchModel.sWidth - 2) + "px"; 
            nodesInSwitch.offNode.style.width = switchModel.sWidth + "px"; 
            nodesInSwitch.thumbSpan.style.width = switchModel.cWidth + "px"; 
            module.adjustSwitch(switchModel, switchNode, "none"); 

            if($KU.isIE11) {
                for(var i = 0; i < switchNode.children.length; i++) {
                    switchNode.children[i].style.flex = 'none';
                }
            }
        },

        adjustWidth: function(switchModel, switchNode, attachEvent) {
            if(module.isCustomSwitch(switchModel)) {
                module.adjustSwitch(switchModel, switchNode, "none");
            } else {
                if($KU.isIOSgt6) {
                    switchModel.cWidth = Math.floor(switchNode.clientWidth);
                    switchModel.sWidth = switchModel.cWidth + (switchNode.clientWidth % 2) + 6;
                    module.adjustSwitch(switchModel, switchNode, "none"); 
                } else {
                module.adjustWidthOtherThanIOSgt6(switchModel, switchNode, attachEvent);
                }
            }
        },

        toggleSwitch: function(model, target) {
            var switchDiv = target; 
            var kdisabled = switchDiv.getAttribute("kdisabled");
            var containerId = target.getAttribute("kcontainerID");
            var nodesInSwitch = module.getNodesInSwitch(switchDiv, model);
            if(containerId) {
                model = $KW.Utils.getClonedModelByContainer(model, target, containerId);
            }
            if(switchDiv && kdisabled != "true") {
                this.applyTrans(switchDiv, model, $KU.isIOSgt6 && "all 0.4s ease-in-out" || "all 0.125s ease-in-out");
                if(model.selectedindex == IndexJL) {
                    model.selectedindex = IndexJL + 1;
                    if((module.isCustomSwitch(model))) {
                        this.applyTrans(switchDiv, model, "all 0.4s ease-in-out");
                        nodesInSwitch.thumbNode.style[$KU.transform] = translateOpen + nodesInSwitch.onNode.offsetLeft + "px,0" + translateClose;
                    } else {
                        if($KU.isIOSgt6) {
                            nodesInSwitch.thumbNode.style[$KU.transform] = translateOpen + 1.5 + "px,0" + translateClose;
                            nodesInSwitch.offNode.style[$KU.transform] = "scale(1)";
                        } else {
                            nodesInSwitch.onNode.style[$KU.transform] = translateOpen + (-(model.cWidth + 8)) + "px,0" + translateClose;
                            nodesInSwitch.thumbNode.style[$KU.transform] = translateOpen + (-model.cWidth + 2) + "px,0" + translateClose;
                            nodesInSwitch.offNode.style[$KU.transform] = translateOpen + (-model.cWidth) + "px,0" + translateClose;
                        }
                    }
                } else {
                    model.selectedindex = IndexJL;
                    if((module.isCustomSwitch(model))) {
                        this.applyTrans(switchDiv, model, "all 0.4s ease-in-out");
                        var size = module.getAbsoluteDimensions(model, nodesInSwitch);
                        var transValue = (parseInt(size.trackWidth) - parseInt(size.thumbWidth) + nodesInSwitch.onNode.offsetLeft - nodesInSwitch.thumbNode.offsetLeft) + kony.flex.PX;
                        nodesInSwitch.thumbNode.style[$KU.transform] = translateOpen + transValue + ",0" + translateClose;
                    } else {
                        nodesInSwitch.onNode.style[$KU.transform] = translateOpen + "0,0" + translateClose;
                        if($KU.isIOSgt6) {
                            nodesInSwitch.thumbNode.style[$KU.transform] = translateOpen + 21.5 + "px,0" + translateClose;
                            nodesInSwitch.offNode.style[$KU.transform] = "scale(0.01)";
                        } else {
                            nodesInSwitch.thumbNode.style[$KU.transform] = translateOpen + "0,0" + translateClose;
                            nodesInSwitch.offNode.style[$KU.transform] = translateOpen + "0,0" + translateClose;
                        }
                    }
                }
                spaAPM && spaAPM.sendMsg(model, 'onslide');
                var eventRef = $KU.returnEventReference(model.onslide || model.onslidercallback);
                switchDiv.setAttribute("aria-selected", [true, false][model.selectedIndex]); 
                module.addA11YAttribute(model, switchDiv); 
                if(module.isCustomSwitch(model)) {
                    module.adjustLabelsForCustomSwitch(model, switchDiv);
                    nodesInSwitch.onNode.className = (model.skin ? model.skin + (["on", "off"][model.selectedIndex]) :
                        (["on switch", "off switch"][model.selectedIndex]));
                    nodesInSwitch.thumbNode.className = (model.thumbskin ? model.thumbskin + (["thumbon", "thumboff"][model.selectedIndex]) :
                        (["on switch", "off switch"][model.selectedIndex]));
                }
                $KAR && $KAR.sendRecording(model, 'toggle', {'target': target, 'eventType': 'uiAction'});
                $KU.callTargetEventHandler(model, target, "onslide");
                eventRef && $KU.onEventHandler(model);
            }
        },

        adjustSwitch: function(model, switchDiv, trans) {
            var nodesInSwitch = module.getNodesInSwitch(switchDiv, model);
            this.applyTrans(switchDiv, model, trans);
            if(module.isCustomSwitch(model)) {
                module.adjustSwitchAlignment(model, switchDiv);
                module.adjustLabelsForCustomSwitch(model, switchDiv);
            }

            if(model.selectedindex == IndexJL) {
                nodesInSwitch.onNode.style[$KU.transform] = translateOpen + nodesInSwitch.onNode.offsetLeft + ",0" + translateClose;
                if((module.isCustomSwitch(model))) {
                    var size = module.getAbsoluteDimensions(model, nodesInSwitch);
                    var transValue = (parseInt(size.trackWidth) - parseInt(size.thumbWidth) + nodesInSwitch.onNode.offsetLeft - nodesInSwitch.thumbNode.offsetLeft) + kony.flex.PX;
                    nodesInSwitch.thumbNode.style[$KU.transform] = translateOpen + transValue + ",0" + translateClose;
                    return;
                }
                if($KU.isIOSgt6) {
                    nodesInSwitch.thumbNode.style[$KU.transform] = translateOpen + "21.5px,0" + translateClose;
                    nodesInSwitch.offNode.style[$KU.transform] = "scale(0.01)";
                } else {
                    nodesInSwitch.thumbNode.style[$KU.transform] = translateOpen + "0,0" + translateClose;
                    nodesInSwitch.offNode.style[$KU.transform] = translateOpen + "7px,0" + translateClose;
                }
            } else {
                if((module.isCustomSwitch(model))) {
                    nodesInSwitch.thumbNode.style[$KU.transform] = translateOpen + 0 + "px,0" + translateClose;
                    return;
                }
                nodesInSwitch.onNode.style[$KU.transform] = translateOpen + (-(model.cWidth + 6)) + "px,0" + translateClose;
                if($KU.isIOSgt6) {
                    nodesInSwitch.thumbNode.style[$KU.transform] = translateOpen + 1.5 + "px,0" + translateClose;
                    nodesInSwitch.offNode.style[$KU.transform] = "scale(1)";
                } else {
                    nodesInSwitch.thumbNode.style[$KU.transform] = translateOpen + (-model.cWidth + 2) + "px,0" + translateClose;
                    nodesInSwitch.offNode.style[$KU.transform] = translateOpen + (-model.cWidth) + "px,0" + translateClose
                }
            }
        },

        applyTrans: function(switchDiv, model, trans) {
            var nodesInSwitch = module.getNodesInSwitch(switchDiv, model);
            nodesInSwitch.thumbNode.style[$KU.transition] = trans;
            nodesInSwitch.onNode.style[$KU.transition] = trans;
            if(nodesInSwitch.offNode) nodesInSwitch.offNode.style[$KU.transition] = trans;
        },

        eventHandler: function(eventObject, target) {
            var switchModel = $KU.getModelByNode(target);
            module.toggleSwitch(switchModel, target);
        },

        adjustThumbHeight: function(node, model, event) {
            var nodesInSwitch = module.getNodesInSwitch(node, model);
            event.target.naturalHeight = event.target.naturalHeight || event.target.height;
            nodesInSwitch.onNode.style.height = nodesInSwitch.offNode.style.height = (event.target.naturalHeight + "px");
            nodesInSwitch.thumbSpan.style.height = ((event.target.naturalHeight - 2) + "px");
        },

        adjustSwitchHeight: function(formId, node) {
            var switches = node ? node.querySelectorAll("div[kwidgettype='Switch']") : document.querySelectorAll("#" + formId + " div[kwidgettype='Switch']");
            for(var i = 0; i < switches.length; i++) {
                var switchModel = $KU.getModelByNode(switches[i]);
                module.adjustHeight(switchModel, switches[i]);
            };
        },

        adjustHeight: function(switchModel, switchNode) {
            var nodesInSwitch = module.getNodesInSwitch(switchNode, switchModel);
            if(module.isCustomSwitch(switchModel)) {
                return;
            }
            if($KU.isIOSgt6) {
                return;
            }
            nodesInSwitch.onNode.style.minHeight = "27px";
            nodesInSwitch.offNode.style.minHeight = "27px";

            if(switchModel.skin)
                var skinBackground = $KU.getCSSPropertyFromRule((switchModel.skin + 'on'), 'background-image');
            if(skinBackground) {
                var imageSwitchOn = skinBackground.replace(/url\(([^\)]*)\)/, '$1');
                $KU.imagePreloader(imageSwitchOn, function(node) {
                    return function(e) {
                        kony.events.preventDefault(e);
                        module.adjustThumbHeight(node, switchModel, e);
                    }
                }(switchNode));
            }
        },

        adjustLabelsForCustomSwitch: function(model, switchDiv) {
            var nodesInSwitch = module.getNodesInSwitch(switchDiv, model);
            var trackLabelLeft = nodesInSwitch.leftTextNode;
            var trackLabelRight = nodesInSwitch.rightTextNode;
            var thumbLabel = nodesInSwitch.thumbTextNode;

            trackLabelLeft.style.display = ["block", "none"][model.selectedIndex];
            trackLabelRight.style.display = ["none", "block"][model.selectedIndex];
            thumbLabel.style.display = "block";
        },

        getAbsoluteDimensions: function(model, nodesInSwitch) {
            var switchLayout = module.computeValuesForCustomSwtich(model),
                size = {};

            size.trackHeight = (switchLayout.trackheight.indexOf('%')) ? nodesInSwitch.onNode.offsetHeight : parseFloat(switchLayout.trackheight.replace('px', ''));
            size.thumbHeight = (switchLayout.thumbheight.indexOf('%')) ? nodesInSwitch.thumbNode.offsetHeight : parseFloat(switchLayout.thumbheight.replace('px', ''));
            size.trackWidth = (switchLayout.trackwidth.indexOf('%')) ? nodesInSwitch.onNode.offsetWidth : parseFloat(switchLayout.trackwidth.replace('px', ''));
            size.thumbWidth = (switchLayout.thumbwidth.indexOf('%')) ? nodesInSwitch.thumbNode.offsetWidth : parseFloat(switchLayout.thumbwidth.replace('px', ''));
            return size;
        },

        adjustTopMargin: function(model, nodesInSwitch, size) {
            var trackMarginTop = -1,
                thumbMarginTop = -1;

            trackMarginTop = '-' + (size.trackHeight / 2) + 'px';
            thumbMarginTop = '-' + (size.thumbHeight / 2) + 'px';

            nodesInSwitch.onNode.style.marginTop = trackMarginTop;
            nodesInSwitch.thumbNode.style.marginTop = thumbMarginTop;
        },

        adjustLabelAlignment: function(model, nodesInSwitch, size) {
            nodesInSwitch.leftTextNode.style.lineHeight = size.trackHeight + 'px';
            nodesInSwitch.rightTextNode.style.lineHeight = size.trackHeight + 'px';
            nodesInSwitch.thumbTextNode.style.lineHeight = size.thumbHeight + 'px';
        },

        adjustSwitchAlignment: function(model, switchDiv) {
            var nodesInSwitch = module.getNodesInSwitch(switchDiv, model);
            var size = module.getAbsoluteDimensions(model, nodesInSwitch);

            module.adjustTopMargin(model, nodesInSwitch, size);
            module.adjustLabelAlignment(model, nodesInSwitch, size);
        },

        isCustomSwitch: function(switchModel) {
            if(switchModel.thumbwidth && switchModel.thumbheight && switchModel.trackwidth && switchModel.trackheight)
                return true;
        },

        renderCustomSwitch: function(switchModel, context, params) {
            params.thumbText = switchModel.thumbtext;
            var switchLayout = module.computeValuesForCustomSwtich(switchModel);

            var switchStyle = 'background-image : none; padding  : 0; display : inline-block;' +
                ' background-size:100%; height : 100%; width : 100%;';

            switchStyle += $KW.skins.getBlurStyle(switchModel);

            var onStyle = 'display: inline-block; position: absolute; height:' + switchLayout.trackheight +
                '; width: ' + switchLayout.trackwidth + ' ; top : 50%; left : 0px;';

            var thumbStyle = 'height : ' + switchLayout.thumbheight + '; width : ' + switchLayout.thumbwidth +
                '; position : absolute; top : 50%; z-index : 3;' +
                ' -webkit-box-shadow:1px 1px 3px 0 rgba(0,0,0,0.3); overflow: hidden';

            var htmlString = '<div role="option" aria-selected="' + ["true", "false"][switchModel.selectedIndex] + '" ' +
                params.substituteAccessAttr + $KW.Utils.getBaseHtml(switchModel, context) +
                ' style="' + params.margin + switchStyle + (!switchModel.skin ? ';background: #4FD065' : '') + '"' +
                ' class="switch ' + params.computedSkin + '">';

            htmlString += '<div  id="' + switchModel.id + '" style="' + onStyle + '"' + 'class=" ' +
                ' ' + (switchModel.skin ? (switchModel.selectedindex == 0 ? switchModel.skin + 'on"' : switchModel.skin + 'off"') : 'on switch"') +
                '>' + '<label style="float:left; padding-left: 5px;">' +
                (params.lText ? params.lText : " ") + '</label>' +
                '<label style="float:right; padding-right: 5px;">' +
                (params.rText ? params.rText : " ") + '</label>' + '</div>';

            htmlString += '<div id="' + switchModel.id + '_thumb" style="' + thumbStyle + '"' + ' class=" ' + ' ' +
                (switchModel.thumbskin ? (switchModel.selectedindex == 0 ? switchModel.thumbskin + 'thumbon"' : switchModel.thumbskin + 'thumboff"') :
                    'off switch"') + '">' + '<label style="">' + (params.thumbText ? params.thumbText : " ") +
                '</label>' + '</div>' + '</div>';

            return htmlString;
        },

        computeValuesForCustomSwtich: function(switchModel) {
            var switchLayout = {};
            switchLayout.trackwidth = this.getComputedCustomSwtichValue(switchModel, switchModel.trackwidth);
            switchLayout.trackheight = this.getComputedCustomSwtichValue(switchModel, switchModel.trackheight);
            switchLayout.thumbwidth = this.getComputedCustomSwtichValue(switchModel, switchModel.thumbwidth);
            switchLayout.thumbheight = this.getComputedCustomSwtichValue(switchModel, switchModel.thumbheight);
            switchLayout.height = this.getComputedCustomSwtichValue(switchModel, switchModel.height);
            switchLayout.width = this.getComputedCustomSwtichValue(switchModel, switchModel.width);
            return switchLayout;
        },

        getComputedCustomSwtichValue: function(switchModel, value, propertyName) {
            if(!$KU.isValidCSSLength(value)) {
                return null;
            }
            var resultObj = $KW.FlexUtils.getValueAndUnit(switchModel, value);
            return resultObj.value + resultObj.unit;
        },

        getNodesInSwitch: function(element, switchModel) {
            var nodesInSwitch = {};
            nodesInSwitch.thumbNode = element.children[1];
            nodesInSwitch.onNode = element.children[0];

            if(module.isCustomSwitch(switchModel)) {
                nodesInSwitch.leftTextNode = element.children[0].firstElementChild;
                nodesInSwitch.rightTextNode = element.children[0].lastElementChild;
                nodesInSwitch.thumbTextNode = element.children[1].firstElementChild;
            } else {
                nodesInSwitch.thumbSpan = element.children[1].firstElementChild;
                nodesInSwitch.offNode = element.children[2];
            }
            return nodesInSwitch;
        }
    };


    return module;
}());
