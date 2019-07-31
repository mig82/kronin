
$KW.ComboBox = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("change", "ComboBox", this.eventHandler);
            kony.events.addEvent("click", "ComboBox", this.initializeEvents);
        },


        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);

            switch(propertyName) {
                case "masterdatamap":
                case "masterdata":
                    var data = $KW.Utils.getMasterData(widgetModel);
                    widgetModel.selectedkey = data.length > 1 ? data[IndexJL][IndexJL] : null;
                    $KW.Utils.setSelectedValueProperty(widgetModel, data, "selectedkey");
                    if(element) {
                        
                        var temp = document.createElement("div");
                        temp.innerHTML = this.generateList(widgetModel, data, {
                            tabpaneID: element.getAttribute("ktabpaneid")
                        });
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

                case "selectedkey":
                    if(element) {
                        var key = widgetModel.selectedkey;
                        widgetModel.selectedkey = key ? key : element.firstChild.value;
                        if(element.tagName == 'SELECT') {
                            element.value = widgetModel.selectedkey;
                        } else if(element.tagName == 'DIV') {
                            for(var i = 1; i < widgetModel.masterdata.length; i++) {
                                if(widgetModel.selectedkey === widgetModel.masterdata[i][1]) {
                                    element.innerText = widgetModel.masterdata[i][2];
                                    break;
                                }
                            }
                        }
                    }
                    $KW.Utils.setSelectedValueProperty(widgetModel, $KW.Utils.getMasterData(widgetModel), "selectedkey");
                    break;


            }
        },

        render: function(comboboxModel, context) {
            if(typeof $KW.konyPicker !== 'function' || comboboxModel.view === 'popup') {
                comboboxModel.view = 'native';
            }
            if(!comboboxModel.buiskin)
                comboboxModel.buiskin = comboboxModel.blockeduiskin;
            var data = $KW.Utils.getMasterData(comboboxModel);
            data.ispercent = context.ispercent;
            return this.generateList(comboboxModel, data, context);
        },

        generateList: function(comboboxModel, data, context) {
            var htmlString = "";
            var computedSkin = $KW.skins.getWidgetSkinList(comboboxModel, context, data) + " kselect";
            if(!comboboxModel.view || comboboxModel.view == 'native') {
                if(data.length > IndexJL) {
                    var key = comboboxModel.selectedkey;
                    comboboxModel.selectedkey = key ? key : data[IndexJL][IndexJL]; 
                    $KW.Utils.setSelectedValueProperty(comboboxModel, data, "selectedkey");
                }
            }

            if(!comboboxModel.view || comboboxModel.view == 'native') {
                htmlString = "<select " + $KW.Utils.getBaseHtml(comboboxModel, context) + "class='" + computedSkin + "'" + (comboboxModel.disabled ? " disabled='true'" : "") + " style='" + $KW.skins.getBaseStyle(comboboxModel, context) + "'>";
                for(var i = IndexJL; i < (data.length); i++) {
                    if(data[i][IndexJL] != null && data[i][1 + IndexJL] != null) {
                        var selected = (comboboxModel.selectedkey == data[i][IndexJL]) ? "selected" : "";
                        var ariaString = $KU.getAccessibilityValues(comboboxModel, data[i][2 + IndexJL], data[i][IndexJL]);
                        htmlString += "<option  " + ariaString + " value='" + data[i][IndexJL] + "' " + selected + ">" + $KU.escapeHTMLSpecialEntities(data[i][1 + IndexJL]) + "</option>";
                    }
                }
                htmlString += "</select>";

            } else { 
                var skin = 'kselect ';
                skin += (comboboxModel.skin) ? comboboxModel.skin : 'klistbox';
                htmlString += '<div id="' + comboboxModel.pf + '_' + comboboxModel.id + '"' + (context.tabpaneID ? ' ktabpaneid="' + context.tabpaneID + '"' : '') + ' kformname="' + comboboxModel.pf + '" kwidgettype="' + comboboxModel.wType + '"  class="' + skin + ' ' + computedSkin + ' idevice kddicon" ' + (comboboxModel.disabled ? 'disabled="true" ' : '') + ' style="text-align:left;">';

                if(comboboxModel.masterdata) {
                    if(!comboboxModel.selectedkey) {
                        comboboxModel.selectedkey = comboboxModel.masterdata[0 + IndexJL][0 + IndexJL];
                        $KW.Utils.setSelectedValueProperty(comboboxModel, data, "selectedkey");
                        htmlString += comboboxModel.masterdata[0 + IndexJL][1 + IndexJL];
                    } else {
                        for(var d = IndexJL; d < comboboxModel.masterdata.length; d++) {
                            if(comboboxModel.masterdata[d][0 + IndexJL] === comboboxModel.selectedkey) {
                                htmlString += comboboxModel.masterdata[d][1 + IndexJL];
                                break;
                            }
                        }
                    }
                }

                htmlString += '</div>';
            }

            return htmlString;
        },

        initializeEvents: function(eventObject, target, sourceFormID) {
            var comboboxModel = $KU.getModelByNode(target);
            if(comboboxModel) {
                if(target.tagName === 'DIV' && eventObject.type == 'click') {
                    var data = $KW.Utils.getMasterData(comboboxModel);
                    var picker = $KG[target.id];
                    config = {
                        display: 'popup',
                        wheels: [{
                            '': data
                        }]
                    }; 

                    if(comboboxModel.view === 'spinningWheel') {
                        config.mode = 'scroller';
                        if(comboboxModel.viewstyle === 'iphone') {
                            config.theme = 'ios';
                            config.dock = ($KU.isiPhone) ? 'bottom' : '';
                        } else if(comboboxModel.viewstyle === 'android') {
                            config.theme = 'android';
                            config.dock = '';
                        } else if(comboboxModel.viewstyle === 'native') {
                            if($KU.isIDevice) {
                                config.theme = 'ios';
                                config.dock = ($KU.isiPhone) ? 'bottom' : '';
                            } else if($KU.isAndroid) {
                                config.theme = 'android';
                                config.dock = '';
                            }
                        }
                    } else if(comboboxModel.view === 'clickPick') {
                        config.mode = 'clickpick';
                        if(comboboxModel.viewstyle === 'iphone') {
                            config.theme = 'ios';
                            config.dock = '';
                        } else if(comboboxModel.viewstyle === 'android') {
                            config.theme = 'android';
                            config.dock = '';
                        } else if(comboboxModel.viewstyle === 'native') {
                            if($KU.isIDevice) {
                                config.theme = 'ios';
                                config.dock = '';
                            } else if($KU.isAndroid) {
                                config.theme = 'android';
                                config.dock = '';
                            }
                        }
                    } else if(comboboxModel.view === 'popup') {
                        if(comboboxModel.viewstyle === 'iphone') {
                            
                        } else if(comboboxModel.viewstyle === 'android') {
                            
                        } else if(comboboxModel.viewstyle === 'native') {
                            if($KU.isIDevice) {
                                
                            } else if($KU.isAndroid) {
                                
                            }
                        }
                    }

                    if(picker) {
                        picker.show();
                    } else {
                        picker = new $KW.konyPicker(target.id, config);
                    }
                }
            }
        },

        eventHandler: function(eventObject, target) {
            var comboboxModel = $KU.getModelByNode(target);

            if(comboboxModel) {
                var selectedkey = null;
                if(target.tagName == 'SELECT') {
                    selectedkey = target.value;
                } else if(target.tagName == 'DIV') {
                    var prevSelectedKey = comboboxModel.selectedkey;
                    var picker = $KG[target.id];
                    if(picker) {
                        selectedkey = picker.val;
                    }
                }
                comboboxModel.selectedkey = selectedkey;
                spaAPM && spaAPM.sendMsg(comboboxModel, 'onselection');
                $KAR && $KAR.sendRecording(comboboxModel, 'selectItem', {'selection': selectedkey, 'target': target, 'eventType': 'uiAction'});
                if(target.getAttribute("kcontainerID"))
                    $KW.Utils.updateContainerData(comboboxModel, target, false, true);
                else {
                    var data = $KW.Utils.getMasterData(comboboxModel);
                    $KW.Utils.setSelectedValueProperty(comboboxModel, data, "selectedkey");
                    if((comboboxModel.ondone || comboboxModel.onselection) && comboboxModel.blockeduiskin) {
                        $KW.skins.applyBlockUISkin(comboboxModel);

                    }
                    var comboBoxHandlr = $KU.returnEventReference(comboboxModel.ondone || comboboxModel.onselection);
                    if(comboBoxHandlr && ((target.tagName == 'DIV' && picker && prevSelectedKey !== picker.val) || (target.tagName == 'SELECT'))) {
                        $KU.executeWidgetEventHandler(comboboxModel, comboBoxHandlr);
                        $KU.onEventHandler(comboboxModel);
                    }
                }
            }
        }

    };



    return module;
}());
