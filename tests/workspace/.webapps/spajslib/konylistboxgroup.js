
$KW.ListBox = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("change", "ListBox", this.eventHandler);
        },


        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);
            switch(propertyName) {

                case "masterdatamap":
                case "masterdata":
                    var data = $KW.Utils.getMasterData(widgetModel);
                    widgetModel.selectedkey = widgetModel.selectedkeys = widgetModel.selectedkeyvalue = widgetModel.selectedkeyvalues = null;
                    if(element) {
                        
                        widgetModel.context.ispercent = "";

                        var temp = document.createElement("div");
                        temp.innerHTML = this.generateList(widgetModel, data, widgetModel.context);
                        element.parentNode.replaceChild(temp.firstChild, element);
                        
                        element = $KU.getNodeByModel(widgetModel);
                        var isFlexWidget = $KW.FlexUtils.isFlexWidget(widgetModel);
                        if(isFlexWidget) {
                            $KW.FlexUtils.setPaddingByParent(widgetModel, element);
                            $KW.FlexUtils.setDimensions(widgetModel, element.parentNode);
                        }
                        $KU.toggleVisibilty(element, data, widgetModel);
                    }
                    break;

                case "selectedkeys":
                    $KW.Utils.setSelectedValueProperty(widgetModel, $KW.Utils.getMasterData(widgetModel), "selectedkeys");
                    if(element) {
                        if(element.tagName == 'SELECT') {
                            var choices = element.options;
                            if(choices.length > 0) {
                                for(var i = 0; i < choices.length; i++) {
                                    if(widgetModel.selectedkeys &&
                                        $KU.inArray(widgetModel.selectedkeys, choices[i].value)[0]) {
                                        choices[i].selected = true;
                                    } else {
                                        choices[i].selected = false;
                                    }
                                }
                                if(!widgetModel.selectedkeys) {
                                    if(!widgetModel.multiple) choices[0].selected = true; 
                                    widgetModel.selectedkeyvalues = null;
                                }
                            }
                        } else if(element.tagName == 'DIV') {
                            if(widgetModel.selectedkeys) {
                                element.innerText = widgetModel.selectedkeyvalues[1][2];
                            } else {
                                element.innerText = widgetModel.masterdata[1][2];
                            }
                        }
                    }
                    break;

                case "selectedkey":
                    var key = widgetModel.selectedkey;
                    if(element) {
                        
                        element.value = widgetModel.selectedkey;
                    }
                    $KW.Utils.setSelectedValueProperty(widgetModel, $KW.Utils.getMasterData(widgetModel), "selectedkey");
                    widgetModel.selectedkeys = (widgetModel.selectedkey && ($KU.isArray(widgetModel.selectedkey) ? widgetModel.selectedkey : (IndexJL ? [null, widgetModel.selectedkey] : [widgetModel.selectedkey]))) || null;
                    $KW.Utils.setSelectedValueProperty(widgetModel, $KW.Utils.getMasterData(widgetModel), "selectedkeys");
                    break;
            }
        },

        render: function(listboxModel, context) {
            if(!listboxModel.buiskin) listboxModel.buiskin = listboxModel.blockeduiskin;
            var data = $KW.Utils.getMasterData(listboxModel);
            data.ispercent = context.ispercent;
            listboxModel.context = context;
            return this.generateList(listboxModel, data, context);
        },

        generateList: function(listboxModel, data, context) {
            if(listboxModel.isCloned && data.length == 0) {
                return "";
            }
            var computedSkin = $KW.skins.getWidgetSkinList(listboxModel, context, data) + " kselect";
            var multiple = listboxModel.multiple ? " multiple" : "";
            var size = listboxModel.multiselectrows ? " size=" + parseInt(listboxModel.multiselectrows) : ""
            var htmlString = "";

            
            var align = listboxModel.contentalignment == constants.CONTENT_ALIGN_MIDDLE_RIGHT ? " dir='rtl'" : '';
            htmlString = "<select" + align + $KW.Utils.getBaseHtml(listboxModel, context) + "class='" + computedSkin + "' " + (listboxModel.disabled ? "disabled='true' " : "") + multiple + size + " style='" + $KW.skins.getBaseStyle(listboxModel, context) + "'";
            htmlString += " onblur='$KW.ListBox.onBlurEventHandler(arguments[0],this)' onfocus='$KW.ListBox.onFocusEventHandler(arguments[0],this)' >";

            if(data.length > IndexJL) {
                listboxModel.selectedkey && $KW.Utils.setSelectedValueProperty(listboxModel, data, "selectedkey");
                listboxModel.selectedkeys && $KW.Utils.setSelectedValueProperty(listboxModel, data, "selectedkeys");
                if(listboxModel.needsectionheaders) {
                    htmlString += this.generateGroupOptions(listboxModel, data);
                } else {
                    htmlString += this.generateOptions(listboxModel, data);
                }
            }
            htmlString += "</select>";
            return htmlString;
        },

        generateGroupOptions: function(listboxModel, data) {
            var htmlString = "";
            for(var i = 1; i < data.length; i++) {
                if(data[i][1] != null && $KU.isArray(data[i][2])) {
                    htmlString += "<optgroup label='" + data[i][1] + "' class='" + (listboxModel.sectionskin || "") + "'>";
                    htmlString += this.generateOptions(listboxModel, data[i][2]);
                    htmlString += "</optgroup>";
                }
            }
            return htmlString;
        },

        generateOptions: function(listboxModel, data) {
            var htmlString = "";
            if(data.length > IndexJL) {
                var key = listboxModel.selectedkey;
                listboxModel.selectedkey = key ? key : data[IndexJL][IndexJL]; 
                $KW.Utils.setSelectedValueProperty(listboxModel, data, "selectedkey");
            }
            var selected = false;
            for(var i = IndexJL; i < data.length; i++) {
                if(data[i][IndexJL] != null) {
                    if(listboxModel.multiple)
                        selected = (listboxModel.selectedkeys && $KU.inArray(listboxModel.selectedkeys, data[i][IndexJL])[0]) ? "selected" : "";
                    else
                        selected = (listboxModel.selectedkey && listboxModel.selectedkey == data[i][IndexJL]) ? "selected" : "";
                    var ariaString = $KU.getAccessibilityValues(listboxModel, data[i][2 + IndexJL], data[i][IndexJL]);
                    htmlString += "<option value=\"" + data[i][IndexJL] + "\" " + selected + ariaString + ">" + $KU.escapeHTMLSpecialEntities(data[i][1 + IndexJL]) + "</option>";
                }
            }
            return htmlString;
        },

        printFunctionality: function(listboxModel, target, data) {
            var inputElements = target.childNodes;
            for(var i = 0; i < inputElements.length; i++) {
                inputElements[i].removeAttribute("selected");
            }

            if(listboxModel.multiple) {
                for(var j = 0; j < listboxModel.selectedkeys.length; j++) {
                    for(var i = 0; i < inputElements.length; i++) {
                        var selectElement = (listboxModel.selectedkeys[j] == data[i][0]) ? "selected" : "";
                        if(selectElement == "selected") {
                            target.childNodes[i].setAttribute("selected", "");
                            break;
                        }
                    }
                }
            } else {
                for(var i = 0; i < inputElements.length; i++) {
                    var selectElement = (listboxModel.selectedkey == data[i][0]) ? "selected" : "";
                    if(selectElement == "selected") {
                        target.childNodes[i].setAttribute("selected", "");
                        break;
                    }
                }
            }
        },

        eventHandler: function(eventObject, target, srcElement) {
            var listboxModel = $KU.getModelByNode(target);
            if(!listboxModel) {
                return
            }

            
            if(eventObject.type == 'click' && target.tagName == "SELECT") {
                return;
            }
            var data = $KW.Utils.getMasterData(listboxModel);

            $KAR && $KAR.sendRecording(listboxModel, 'selectItem', {selection: target.value, 'target': target, 'eventType': 'uiAction'});
            if(target.getAttribute("kcontainerID")) {

                
                $KW.ListBox.updateListboxKey(listboxModel, target);
                $KU.callTargetEventHandler(listboxModel, target, 'onselection');
            }
            else {

                if(listboxModel.viewtype == "editableview") {
                    $KW.ListBox.setSelectedKeysEditableListBox(listboxModel, target, eventObject);
                }
                else {
                    $KW.ListBox.updateListboxKey(listboxModel, target);
                    $KW.ListBox.printFunctionality(listboxModel, target, data);

                    $KW.Utils.setSelectedValueProperty(listboxModel, data, "selectedkey");
                    $KW.Utils.setSelectedValueProperty(listboxModel, data, "selectedkeys");
                    $KW.ListBox.processListBoxEvents(listboxModel, target);
                }

            }
        },

        updateListboxKey: function(listboxModel, target) {
            var selectedkeys = (IndexJL == 1 ? [null] : []);
            if(target.tagName == 'SELECT') {
                for(var i = 0; i < target.options.length; i++) {
                    if(target.options[i].selected) {
                        listboxModel.selectedkey = target.options[i].value;
                        selectedkeys.push(target.options[i].value);
                    }
                }
            }
            listboxModel.selectedkeys = selectedkeys;
        },

        processListBoxEvents: function(widgetModel, widgetNode) {

            if((widgetModel.ondone || widgetModel.onselection) && widgetModel.blockeduiskin) {
                $KW.skins.applyBlockUISkin(widgetModel);
            }

            if(widgetNode.tagName == 'SELECT'
            || widgetNode.tagName == 'DIV') {
                var listboxHandlr = $KU.returnEventReference(widgetModel.ondone || widgetModel.onselection);
                spaAPM && spaAPM.sendMsg(widgetModel, 'onselection');
                
                if(listboxHandlr) {
                    $KU.executeWidgetEventHandler(widgetModel, listboxHandlr);
                    $KU.onEventHandler(widgetModel);
                }
            }

        },
        setSelectedKeysEditableListBox: function(widgetModel, widgetNode, eventRef) {
            var srcEle = eventRef.srcElement,
                instanceId = widgetNode.id + "_autoComplete",
                key,
                instance = null,
                optionsDiv = widgetNode.children[2],
                data = $KW.Utils.getMasterData(widgetModel);

            instanceId = module.createEditableListInstance(widgetNode, instanceId);
            instance = $KG[instanceId];
            if(srcEle.tagName == 'IMG') {
                if(optionsDiv.style.display == 'block') {
                    instance.hideDropdown();
                } else {
                    if(widgetModel.autosuggest) {
                        instance.renderDropdown(data);
                    }
                    instance.showDropdown(widgetNode);
                    module.setSelectedSkin(widgetModel, optionsDiv.children);
                }
            } else if(srcEle.getAttribute("name") == 'SelectOptionList') {
                key = srcEle.getAttribute("value");
                widgetNode.children[0].value = srcEle.innerText || srcEle.textContent;
                srcEle.style.backgroundColor = "#3169C6";
                srcEle.style.color = "#FFFFFF";
                instance.hideDropdown();
                widgetModel["selectedkeyvalue"] = IndexJL ? [null, key, srcEle.innerText || srcEle.textContent] : [key, srcEle.innerText || srcEle.textContent];
                widgetModel.selectedkey = key;
                $KW.ListBox.processListBoxEvents(widgetModel, widgetNode);
            } else { 
                if(eventRef.type == "click") {
                    instance.hideDropdown();
                }
                key = srcEle.value;
                widgetModel["selectedkeyvalue"] = IndexJL ? [null, key, key] : [key, key];
                widgetModel.selectedkey = key;
            }

        },

        onBlurEventHandler: function(eventObject, target) {
            $KW.Utils.resetScrollTopToContainer(eventObject);
        },
        onFocusEventHandler: function(eventObject, target) {
            $KW.Utils.focusBringToView(eventObject);
        }
    };



    return module;
}());
