
$KW.TextArea = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("change", "TextArea", this.eventHandler);
            kony.events.addEvent("keyup", "TextArea", this.keyUpEventHandler);
            kony.events.addEvent("keydown", "TextArea", this.keyDownEventHandler);
            kony.events.addEvent("input", "TextArea", this.textAreaInputEventHandler);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;
            element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);

            switch(propertyName) {
                case "text":
                    element.value = propertyValue;
                    break;

                case "maxtextlength":
                case "length":
                    element.maxLength = propertyValue;
                    break;

                case "placeholder":
                    element.setAttribute("placeholder", propertyValue);
                    break;

                case "placeholderskin":
                    if($KG.appbehaviors[constants.API_LEVEL] >= constants.API_LEVEL_8200) {
                        element.setAttribute("kplaceholderskin", propertyValue);
                    }

                    break;

                case "numberofvisiblelines":
                    element.setAttribute("rows", propertyValue);
                    break;

                    
                case "numberofrows":
                    element.setAttribute("rows", propertyValue);
                    break;

                case "mode":
                case "textinputmode":
                    if(propertyValue == constants.TEXTAREA_INPUT_MODE_ANY)
                        element.setAttribute("type", "text");
                    else if(propertyValue == constants.TEXTAREA_INPUT_MODE_NUMERIC)
                        element.setAttribute("type", "number");
                    break;

                case "autocapitalize":
                    var value = propertyValue;
                    if($KU.isiPhone && parseInt($KU.getPlatformVersion("iphone")) <= 4 && propertyValue != constants.TEXTAREA_AUTO_CAPITALIZE_NONE) {
                        value = 'on';
                    }
                    element.setAttribute("autocapitalize", value);
                    var transform = $KU.getTextTrasform(widgetModel)
                    transform && (element.style.textTransform = transform);
                    break;

                case "keyboardtype":
                case "keyboardstyle":
                    (textModel.mode != "P") && element.setAttribute("type", propertyValue);
                    break;
            }
        },

        render: function(textAreaModel, context) {
            if(typeof textAreaModel.mode == 'undefined') textAreaModel.mode = textAreaModel.textinputmode;
            var computedSkin = $KW.skins.getWidgetSkinList(textAreaModel, context);
            var phstyle = '';
            var placeholderSkin = textAreaModel.placeholderskin;
            if(placeholderSkin && $KG.appbehaviors[constants.API_LEVEL] >= constants.API_LEVEL_8200) {
                phstyle += "kplaceholderskin = " + placeholderSkin;
            }
            switch(textAreaModel.mode) {
                case constants.TEXTAREA_INPUT_MODE_NUMERIC:
                    type = "number";
                    break;
                default:
                    type = "text";
            }
            if(textAreaModel.keyboardtype) {
                switch(textAreaModel.keyboardtype) {
                    case constants.TEXTAREA_KEY_BOARD_STYLE_EMAIL:
                        type = "email";
                        break;
                    case constants.TEXTAREA_KEY_BOARD_STYLE_URL:
                        type = "url";
                        break;
                    case constants.TEXTAREA_KEY_BOARD_STYLE_CHAT:
                        type = "chat";
                        break;
                    case constants.TEXTAREA_KEY_BOARD_STYLE_DECIMAL:
                    case constants.TEXTAREA_KEY_BOARD_STYLE_NUMBER_PAD:
                        type = "number";
                        break;
                    case constants.TEXTAREA_KEY_BOARD_STYLE_PHONE_PAD:
                        type = "tel";
                        break;
                }
            }
            var style = $KG.disableViewPortScroll ? "pointer-events:none;" : "";
            style += ";text-align:" + $KW.skins.getContentAlignment(textAreaModel) + ";";
            var transform = $KU.getTextTrasform(textAreaModel);
            style += transform ? 'text-transform:' + transform + ';' : '';
            var maxtextlength = textAreaModel.length || textAreaModel.maxtextlength; 
            var htmlString = "<textarea" + $KW.Utils.getBaseHtml(textAreaModel, context) + phstyle + " " + "class = '" + computedSkin + "' " + (textAreaModel.disabled ? "disabled='true'" : "") + " cols='15' rows='" + (textAreaModel.numberofvisiblelines || textAreaModel.numberofrows) + (textAreaModel.placeholder ? "' placeholder='" + $KU.escapeHTMLSpecialEntities(textAreaModel.placeholder) + "'" : "'") + (typeof maxtextlength === "number" ? "'  maxlength='" + maxtextlength + "'" : "'") + "' style='" + style + $KW.skins.getBaseStyle(textAreaModel, context) + $KU.cssPrefix + "text-security:" + (textAreaModel.securetextentry ? "circle" : "none") + (context.layoutDir && context.ispercent === false ? ";float:" + context.layoutDir : "") + "' type = '" + type + "' " + ((textAreaModel.autocapitalize) ? " autocapitalize='on'" : " autocapitalize='off'") + "  onblur='$KW.TextArea.onblurEventHandler(arguments[0], this)' onfocus='$KW.TextArea.onFocusEventHandler(arguments[0], this)'>" + textAreaModel.text + "</textarea>";
            return htmlString;
        },

        onblurEventHandler: function(eventObject, target) {
            $KW.Utils.resetScrollTopToContainer(eventObject);
            var textModel = $KU.getModelByNode(target);
            textModel && $KU.onHideKeypad(textModel);
        },
        onFocusEventHandler: function(eventObject, target) {
            $KU.setActiveInput(target);
            $KW.Utils.focusBringToView(eventObject);
        },

        eventHandler: function(eventObject, target) {
            var textModel = $KU.getModelByNode(target);
            if(textModel) {
                textModel.canUpdateUI = false;
                textModel.text = target.value;
                textModel.canUpdateUI = true;
                spaAPM && spaAPM.sendMsg(textModel, 'ontextchange');
                var textref = $KU.returnEventReference(textModel.ontextchange);
                $KU.callTargetEventHandler(textModel, target, 'ontextchange');
                textref && $KU.onEventHandler(textModel);
            }
        },

        textAreaInputEventHandler: function(eventObject, target) {
            var textModel = $KU.getModelByNode(target);

            $KAR && $KAR.sendRecording(textModel, 'enterText', {'text': target.value, 'target': target, 'eventType': 'uiAction'});
            if(target.getAttribute("kcontainerID")) {
                $KW.Utils.updateContainerData(textModel, target, false, "input");
            } else {
                $KW.Utils.restrictCharactersSet(target, textModel);
            }
        },

        keyUpEventHandler: function(eventObject, target) {
            var textModel = $KU.getModelByNode(target);

            if(textModel) {
                textModel.canUpdateUI = false;
                textModel.text = target.value;
                textModel.canUpdateUI = true;
            }

            if(eventObject.keyCode == 10 || eventObject.keyCode == 13) {
                spaAPM && spaAPM.sendMsg(textModel, 'ondone');
                if(textModel.ondone && textModel) {
                    var textref = $KU.returnEventReference(textModel.done || textModel.ondone);
                    (textModel.blockeduiskin) && $KW.Utils.applyBlockUISkin(textModel);
                    $KU.callTargetEventHandler(textModel, target, 'ondone');
                    textref && $KU.onEventHandler(textModel);
                }
            }
            spaAPM && spaAPM.sendMsg(textModel, 'onkeyup');
            $KU.callTargetEventHandler(textModel, target, 'onkeyup');
        },

        keyDownEventHandler: function(eventObject, target) {
            var textModel = $KU.getModelByNode(target);
            spaAPM && spaAPM.sendMsg(textModel, 'onkeydown');
            $KU.callTargetEventHandler(textModel, target, 'onkeydown');
        }

    };


    return module;
}());
