
$KW.TextField = (function() {
    
    

    var module = {
        goeventTriggerd: null, 
        focusedTextfieldId: null,

        initialize: function() {
            kony.events.addEvent("keydown", "TextField", this.textfieldGoButtonEventHandler);
            kony.events.addEvent("keyup", "TextField", this.textfieldKeyUpEventHandler);
            kony.events.addEvent("onorientationchange", "TextField", this.adjustHeight);
            kony.events.addEvent("change", "TextField", this.eventHandler);
            kony.events.addEvent("input", "TextField", this.textfieldInputEventHandler);
        },

        initializeView: function(formId) {
            this.adjustHeight(formId);
            setTimeout(function() {
                module.initPasswordField(formId);
            }, 1);
        },

        initPasswordField: function(formId) {
            var passElements = document.querySelectorAll("#" + formId + " input[name='konypassword']");
            for(var i = 0; i < passElements.length; i++) {
                var passElement = passElements[i];
            }
        },

        
        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;
            element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);

            switch(propertyName) {
                case "text":
                    if(propertyValue) {
                        element.value = propertyValue;
                    }
                    else {
                        element.value = "";
                        if(($KU.isBlackBerry || $KU.isBlackBerryNTH) && element.getAttribute("type") == "number") {
                            var activeElemId = document.activeElement.id;
                            var elemId = element.id;
                            var temp = document.createElement("div");
                            temp.innerHTML = this.render(widgetModel, {
                                tabpaneID: element.getAttribute("ktabpaneid")
                            });
                            element.parentNode.replaceChild(temp.firstChild, element);
                            if(elemId == activeElemId) { 
                                element = $KU.getNodeByModel(widgetModel);
                                element.focus();
                            }
                        }
                    }
                    this.setPlaceholder(widgetModel, element);
                    break;

                case "placeholder":
                    element.setAttribute("placeholder", propertyValue);
                    this.setPlaceholder(widgetModel, element);
                    break;

                case "placeholderskin":
                    if($KG.appbehaviors[constants.API_LEVEL] >= constants.API_LEVEL_8200) {
                        element.setAttribute("kplaceholderSkin", propertyValue);
                    }
                    break;

                case "maxtextlength":
                    element.maxLength = propertyValue;
                    break;

                case "pattern":
                    element.setAttribute("pattern", propertyValue);
                    break;

                case "autocapitalize":
                    var value = propertyValue;
                    if($KU.isiPhone && parseInt($KU.getPlatformVersion("iphone")) <= 4 && propertyValue != constants.TEXTBOX_AUTO_CAPITALIZE_NONE) {
                        value = 'on';
                    }
                    element.setAttribute("autocapitalize", value);
                    var transform = $KU.getTextTrasform(widgetModel)
                    transform && (element.style.textTransform = transform);
                    break;

                case "mode":
                case "textinputmode":
                    if(propertyValue == constants.TEXTBOX_INPUT_MODE_ANY)
                        element.setAttribute("type", "text");
                    else if(propertyValue == constants.TEXTBOX_INPUT_MODE_NUMERIC)
                        element.setAttribute("type", "number");
                    break;

                case "securetextentry":
                    if(propertyValue)
                        element.setAttribute("type", "password");
                    else {
                        var textsecurity = $KU.cssPrefix + "text-security";
                        element.style.removeProperty(textsecurity);
                        this.updateView(widgetModel, "textinputmode", widgetModel.textinputmode);
                    }
                    break;

                case "keyboardtype":
                case "keyboardstyle":
                    (widgetModel.mode != "P") && element.setAttribute("type", propertyValue);
                    break;
                case "containerheightmode":
                case "containerheight":
                case "containerheightreference":
                    if(widgetModel.containerheightmode == constants.TEXTBOX_DEFAULT_PLATFORM_HEIGHT) {
                        $KU.addClassName(element, "kheight");
                        element.style.height = "";
                    } else if(widgetModel.containerheightmode == constants.TEXTBOX_FONT_METRICS_DRIVEN_HEIGHT) {
                        $KU.removeClassName(element, "kheight");
                        element.style.height = "";
                    } else if(widgetModel.containerheightmode == constants.TEXTBOX_CUSTOM_HEIGHT && widgetModel.containerheight && widgetModel.containerheightreference) {
                        $KU.removeClassName(element, "kheight");
                        this.adjustBoxDimensions(element.id, true);
                    }
                    break;

                case "name":
                    element.name = propertyValue;
                    break;
            }
        },

        render: function(textModel, context) {
            if(typeof textModel.keyboardtype == 'undefined') textModel.keyboardtype = textModel.keyboardstyle;
            if(typeof textModel.mode == 'undefined') textModel.mode = textModel.textinputmode;
            if(!textModel.buiskin) textModel.buiskin = textModel.blockeduiskin;

            var computedSkin = $KW.skins.getWidgetSkinList(textModel, context);
            var placeholderSkin = textModel.placeholderskin;
            if(textModel.containerheightmode == constants.TEXTBOX_DEFAULT_PLATFORM_HEIGHT) computedSkin += " kheight ";
            var tabpaneID = context.tabpaneID || "";

            var type = "text";
            var isDafultPad = false;
            switch(textModel.mode) {
                case constants.TEXTBOX_INPUT_MODE_PASSWORD:
                    type = "password";
                    break;
                case constants.TEXTBOX_INPUT_MODE_NUMERIC:
                    type = "number";
                    break;
                default:
                    type = "text";
            }

            if(textModel.securetextentry)
                type = "password";

            if(textModel.keyboardtype && textModel.mode != "P") {
                switch(textModel.keyboardtype) {
                    case constants.TEXTBOX_KEY_BOARD_STYLE_EMAIL:
                        type = "email";
                        break;
                    case constants.TEXTBOX_KEY_BOARD_STYLE_URL:
                        type = "url";
                        break;
                    case constants.TEXTBOX_KEY_BOARD_STYLE_PHONE_PAD:
                        type = "tel";
                        break;
                    case constants.TEXTBOX_KEY_BOARD_STYLE_NUMBER_PAD:
                        type = "number";
                        break;
                    case constants.TEXTBOX_KEY_BOARD_STYLE_DECIMAL:
                        type = "number"; 
                        break;
                    case constants.TEXTBOX_VIEW_TYPE_SEARCH_VIEW:
                        type = "search";
                        break;
                    default:
                        if($KU.isiPhone && textModel.mode == "N") {
                            type = "number"; 
                            isDafultPad = false;
                        }
                        break;
                }
            }
            if(textModel.placeholder && !textModel.text && !kony.utils.placeholderSupported && type == "number") {
                type = "text";
                textModel.__initialMode = constants.TEXTBOX_INPUT_MODE_NUMERIC;
            }
            var htmlString = "";
            var style = $KW.skins.getBaseStyle(textModel, context);

            style += ";text-align:" + $KW.skins.getContentAlignment(textModel) + ";";
            var transform = $KU.getTextTrasform(textModel);
            style += transform ? 'text-transform:' + transform + ';' : '';
            style += $KG.disableViewPortScroll ? "pointer-events:none;" : "";

            var value = textModel.text;
            var encodedText = "";
            if(value && value != "" && (typeof value == "string" || value instanceof String))
                encodedText = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&rsquo;').replace(/"/g, '&rdquo;');
            else
                encodedText = value;

            if(!kony.utils.placeholderSupported && (textModel.__initialMode == constants.TEXTBOX_INPUT_MODE_NUMERIC)) {
                encodedText = encodedText || textModel.placeholder || "";
                computedSkin += (textModel.placeholder && !textModel.text) ? " konyplaceholder " : "";
            }
            var isFlexWidget = $KW.FlexUtils.isFlexWidget(textModel);
            var displayStyle = (context.ispercent === false) ? "display:inline-block;" : "";
            var wrapperDivOpen = ($KU.isiPhone && !isFlexWidget) ? "<div style='" + displayStyle + "overflow:hidden;'>" : "";
            var wrapperDivClose = ($KU.isiPhone && !isFlexWidget) ? "</div>" : "";
            htmlString += wrapperDivOpen + "<input" + $KW.Utils.getBaseHtml(textModel, context) + "value='" + encodedText + "' class = '" + computedSkin + "'";

            htmlString += textModel.name ? " name='" + textModel.name + "'" : "";
            htmlString += " autocapitalize='" + textModel.autocapitalize + "'";
            htmlString += textModel.autocorrect ? " autocorrect='on'" : " autocorrect='off'";
            htmlString += textModel.autocomplete ? " autocomplete='on'" : " autocomplete='off'";
            
            htmlString += " type = '" + type + "'";
            htmlString += (textModel.pattern) ? " pattern=" + textModel.pattern : "";
            if(placeholderSkin && $KG.appbehaviors[constants.API_LEVEL] >= constants.API_LEVEL_8200) {
                htmlString += "kplaceholderSkin = " + placeholderSkin;
            }


            if((textModel.keyboardtype == "digitpad" && textModel.mode == "P") || isDafultPad) {
                var pattern = "[0-9]*";
                htmlString += " pattern = '" + pattern + "'";
            }

            htmlString += (textModel.disabled) ? " disabled='true'" : "";
            htmlString += " onfocus='$KW.TextField.onfocusEventHandler(arguments[0],this)' onblur='$KW.TextField.onblurEventHandler(arguments[0],this)' ";
            htmlString += (textModel.placeholder) ? " placeholder='" + $KU.escapeHTMLSpecialEntities(textModel.placeholder) + "'" : "";

            htmlString += (textModel.maxtextlength) ? " maxlength='" + textModel.maxtextlength + "'" : "";
            htmlString += " style='" + style + (textModel.securetextentry ? $KU.cssPrefix + "text-security:disc" : "") + "'";
            htmlString += "/>" + wrapperDivClose;
            return htmlString;
        },



        textfieldGoButtonEventHandler: function(eventObject, target) {
            var textModel = $KU.getModelByNode(target);
            eventObject = eventObject || window.event; 
            if(textModel.ondone && (eventObject.keyCode == 10 || eventObject.keyCode == 13)) {
                textModel.canUpdateUI = false;
                textModel.text = target.value;
                textModel.canUpdateUI = true;
                
                kony.events.preventDefault(eventObject);
                kony.events.stopPropagation(eventObject);
                try {
                    if(eventObject.srcElement)
                        eventObject.srcElement.blur();
                    else
                        eventObject.target.blur();
                } catch(e) {}


                (textModel.blockeduiskin) && $KW.skins.applyBlockUISkin(textModel);
                spaAPM && spaAPM.sendMsg(textModel, 'ondone');

                var textondoneref = $KU.returnEventReference(textModel.ondone);
                $KU.callTargetEventHandler(textModel, target, 'ondone');
                if(textondoneref) {
                    $KU.onEventHandler(textModel);
                }
            }
            if(eventObject.keyCode == 10 || eventObject.keyCode == 13) {
                if($KU.isAndroid && eventObject.keyCode == 13)
                    target.blur();
                $KU.onHideKeypad(textModel);
            }
            $KU.callTargetEventHandler(textModel, target, 'onkeydown');
        },

        HandleTextFieldFilterData: function(response, eventObject, target) {
            var textfieldId = target.getAttribute("id");
            response.shift(); 
            var value = target.value;
            value = value.ltrim();

            if(value.length < 1) return;

            if(response.length > 0) {
                this.AutoComplete.AutoComplete_Create(textfieldId, response, 8);
                this.AutoComplete.AutoComplete_ShowDropdown(textfieldId);
            }
        },

        eventHandler: function(eventObject, target) {
            var textModel = $KU.getModelByNode(target);
            if(textModel) {
                textModel.canUpdateUI = false;
                textModel.text = target.value;
                textModel.canUpdateUI = true;
                spaAPM && spaAPM.sendMsg(textModel, 'ontextchange');
            }
        },

        textfieldInputEventHandler: function(eventObject, target) {
            var textModel = $KU.getModelByNode(target);

            $KAR && $KAR.sendRecording(textModel, 'enterText', {'text': target.value, 'target': target, 'eventType': 'uiAction'});
            if(target.getAttribute("kcontainerID")) {
                $KW.Utils.updateContainerData(textModel, target, false, "input");
            } else {
                $KW.Utils.restrictCharactersSet(target, textModel);
            }
        },

        textfieldKeyUpEventHandler: function(eventObject, target) {
            var textModel = $KU.getModelByNode(target),
                targetWidgetID = $KU.getElementID(target.getAttribute("id"));

            if(textModel.text != target.value) {
                textModel.canUpdateUI = false;
                textModel.text = target.value;
                textModel.canUpdateUI = true;

                if(textModel.autocomplete && $KU.isArray(textModel.filterlist) && textModel.filterlist.length > IndexJL) {
                    var value = target.value.ltrim();
                    if(value.length >= 1) {
                        this.HandleTextFieldFilterData(textModel.filterlist, eventObject, target);
                    } else {
                        this.AutoComplete.AutoComplete_RemoveDivs(textModel.pf + '_' + targetWidgetID);
                    }
                }
            }
            spaAPM && spaAPM.sendMsg(textModel, 'ontextchange');
            $KU.callTargetEventHandler(textModel, target, 'ontextchange');
        },

        onfocusEventHandler: function(eventObject, target) {
            $KW.Utils.focusBringToView(eventObject);

            if(($KU.isWindowsPhone || $KU.isWindowsTablet) && !$KG["nativeScroll"])
                if($KU.isEdge)
                    document.documentElement.style.touchAction = "auto";
                else
                    document.documentElement.style.msTouchAction = "auto";

            
            if($KU.isAndroid && target.getAttribute('type') != "number") {
                var androidVersion = $KU.getPlatformVersion("android");
                if(parseFloat(androidVersion) >= 4.4 || kony.appinit.isChrome) {
                    setTimeout(function() {
                        $KU.setActiveInput(target);
                    }, 100);
                }
            } else {
                $KU.setActiveInput(target);
            }
            var textModel = $KU.getModelByNode(target);

            if(!kony.utils.placeholderSupported && !textModel.text && textModel.placeholder && (textModel.__initialMode == constants.TEXTBOX_INPUT_MODE_NUMERIC)) {
                if(target.type == "text") {
                    target.setAttribute("type", "number");
                }
                target.focus();
                $KU.removeClassName(target, 'konyplaceholder');
            }
            spaAPM && spaAPM.sendMsg(textModel, 'onbeginediting');
            $KU.callTargetEventHandler(textModel, target, 'onbeginediting');
        },

        onblurEventHandler: function(eventObject, target) {
            var textModel = $KU.getModelByNode(target);
            if(textModel && textModel.text != target.value) {
                textModel.canUpdateUI = false;
                textModel.text = target.value;
                textModel.canUpdateUI = true;
            }
            $KW.Utils.resetScrollTopToContainer(eventObject);
            module.setPlaceholder(textModel, target);
            if(($KU.isWindowsPhone || $KU.isWindowsTablet) && !$KG["nativeScroll"])
                if($KU.isEdge)
                    document.documentElement.style.msTouchAction = "none";
                else
                    document.documentElement.style.touchAction = "none";
            $KU.onHideKeypad(textModel);
            spaAPM && spaAPM.sendMsg(textModel, 'onendediting');
            $KU.callTargetEventHandler(textModel, target, 'onendediting');
            
        },


        getSelection: function(model) {
            var widgetNode = $KU.getNodeByModel(model);
            if(widgetNode) {
                var obj = module.getInputSelection(widgetNode);
                return {
                    startIndex: obj.start,
                    endIndex: obj.end
                };
            } else
                return null;
        },

        setSelection: function(model, startIndex, endIndex) {
            var widgetNode = $KU.getNodeByModel(model);
            model.startIndex = startIndex;
            model.endIndex = endIndex;
            widgetNode && $KW.APIUtils.setfocus(model, '', '', true);
        },

        
        setCaretPosition: function(elem, startcaretPos, endcaretPos) {
            if(arguments.length == 1) {
                if(!elem.getAttribute('kwidgettype'))
                    elem = elem.childNodes[0];
                var wModel = $KU.getModelByNode(elem);
                startcaretPos = wModel.startIndex;
                endcaretPos = wModel.endIndex;
            }
            var needFocus = (arguments.length == 1) ? false : true;
            if(typeof endcaretPos == "undefined")
                endcaretPos = startcaretPos;
            if(elem) {
                if(typeof elem.selectionStart == "number") {
                    needFocus && elem.focus();
                    elem.setSelectionRange(startcaretPos, endcaretPos);
                } else if(elem.createTextRange) {
                    var range = elem.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', endcaretPos);
                    range.moveStart('character', startcaretPos);
                    range.select();
                } else
                    needFocus && elem.focus();
            }
        },

        
        getInputSelection: function(el) {
            var start = 0,
                end = 0,
                normalizedValue, range,
                textInputRange, len, endRange;

            if(typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
                start = el.selectionStart;
                end = el.selectionEnd;
            } else {
                range = document.selection.createRange();

                if(range && range.parentElement() == el) {
                    len = el.value.length;
                    normalizedValue = el.value.replace(/\r\n/g, "\n");

                    
                    textInputRange = el.createTextRange();
                    textInputRange.moveToBookmark(range.getBookmark());

                    
                    
                    
                    endRange = el.createTextRange();
                    endRange.collapse(false);

                    if(textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                        start = end = len;
                    } else {
                        start = -textInputRange.moveStart("character", -len);
                        start += normalizedValue.slice(0, start).split("\n").length - 1;

                        if(textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                            end = len;
                        } else {
                            end = -textInputRange.moveEnd("character", -len);
                            end += normalizedValue.slice(0, end).split("\n").length - 1;
                        }
                    }
                }
            }

            return {
                start: start,
                end: end
            };
        },

        setPlaceholder: function(textModel, target) {
            if(!kony.utils.placeholderSupported && textModel.placeholder && (textModel.__initialMode == constants.TEXTBOX_INPUT_MODE_NUMERIC)) {
                var id = target.id;
                if(textModel.text) {
                    if(target.type == "text") {
                        target.setAttribute("type", "number");
                        target.value = textModel.text;
                        $KU.removeClassName(element, 'konyplaceholder');
                    }
                } else {
                    if(target.type == "number") {
                        target.setAttribute("type", "text");
                    }
                    target.value = textModel.placeholder;
                    $KU.addClassName(target, 'konyplaceholder');
                }
            }
        },

        adjustHeight: function(formId) {
            var formModel = $KG.allforms[formId];
            if(!formModel) return;
            if(!$KG.nativeScroll && formModel.dockablefooter) {
                module.adjustBoxDimensions(formModel.footer);
                $KW.Scroller.checkDOMChanges(formModel.id + "_scroller", null, formModel.footer);
            }
            module.adjustBoxDimensions(formId);
        },

        adjustBoxDimensions: function(elemID, updateView) {
            var textBoxes = updateView ? document.querySelectorAll("#" + elemID) : document.querySelectorAll("#" + elemID + " input[kwidgettype='TextField']");
            for(var i = 0; i < textBoxes.length; i++) {
                var boxModel = $KU.getModelByNode(textBoxes[i]);
                if(boxModel.containerheightmode == constants.TEXTBOX_CUSTOM_HEIGHT) {
                    var boxhtPercent = boxModel.containerheight || 10;
                    var kht = 28;
                    if(boxhtPercent > 0) {
                        if(boxModel.containerheightreference == constants.CONTAINER_HEIGHT_BY_PARENT_WIDTH) {
                            var parent = $KU.getElementById($KW.Utils.getKMasterWidgetID(boxModel.parent));
                            if(parent && boxModel.parent.wType == "ScrollBox") 
                                parent = $KU.getElementById($KW.Utils.getKMasterWidgetID(boxModel.parent) + "_parent");
                            if(!parent) {
                                if(textBoxes[i].getAttribute("ktabpaneid")) 
                                    parent = $KU.getElementById(boxModel.pf + "_" + textBoxes[i].getAttribute("ktabpaneid"));
                                else if(window[boxModel.pf].wType == "Popup")
                                parent = document.getElementById(boxModel.pf);
                                else
                                    parent = document.getElementById(boxModel.pf + '_scroller');
                            }
                            var parentWidth = (parent && parent.offsetWidth) || window.innerWidth || document.body.clientWidth;
                            kht = Math.round((boxhtPercent * parentWidth) / 100);
                        } else if(boxModel.containerheightreference == constants.CONTAINER_HEIGHT_BY_FORM_REFERENCE) {
                            var formScroller = document.getElementById(boxModel.pf + '_scroller');
                            var formHeight = (formScroller && formScroller.offsetHeight) || $KU.getWindowHeight() || window.innerHeight || document.body.clientHeight;
                            kht = Math.round((boxhtPercent * formHeight) / 100);
                        }
                    }
                    textBoxes[i].style.height = kht + "px";
                }
            }
        }
    };


    return module;
}());
