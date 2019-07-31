
$KW.RadioButtonGroup = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("change", "RadioButtonGroup", this.eventHandler);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);
            switch(propertyName) {
                case "masterdatamap":
                case "masterdata":
                    var data = $KW.Utils.getMasterData(widgetModel);
                    widgetModel.selectedkey = data.length > 1 ? data[IndexJL][IndexJL] : null;

                    $KW.Utils.setSelectedValueProperty(widgetModel, data, "selectedkey");
                    if(element) {
                        element.innerHTML = this.generateList(widgetModel, data, widgetModel.context);
                        $KU.toggleVisibilty(element, data, widgetModel);
                    }
                    break;

                case "selectedkey":
                    var choices = document.querySelectorAll("#" + widgetModel.pf + " input[name='" + widgetModel.id + "']");
                    
                    
                    for(var i = 0; i < choices.length; i++) {
                        if(widgetModel.selectedkey == choices[i].value)
                            choices[i].checked = true;
                        else
                            choices[i].checked = false;
                    }
                    widgetModel.selectedkey && $KW.Utils.setSelectedValueProperty(widgetModel, $KW.Utils.getMasterData(widgetModel), "selectedkey");
                    if(!widgetModel.selectedkey) {
                        widgetModel.selectedKeyValue = widgetModel.selectedkeyvalue = null;
                    }
                    break;

                case "viewtype":
                    widgetModel.propertyName = propertyValue;
                    var data = $KW.Utils.getMasterData(widgetModel);
                    if(element) {
                        element.innerHTML = this.generateList(widgetModel, data, widgetModel.context);
                        $KU.toggleVisibilty(element, data, widgetModel);
                    }
                    break;

                case "checkedimage":
                    var data = $KW.Utils.getMasterData(widgetModel);
                    if(element) {
                        element.innerHTML = this.generateList(widgetModel, data, widgetModel.context);
                        $KU.toggleVisibilty(element, data, widgetModel);
                    }
                    break;

                case "uncheckedimage":
                    var data = $KW.Utils.getMasterData(widgetModel);
                    if(element) {
                        element.innerHTML = this.generateList(widgetModel, data, widgetModel.context);
                        $KU.toggleVisibilty(element, data, widgetModel);
                    }
                    break;

                case "size":
                    
                    var data = $KW.Utils.getMasterData(widgetModel);
                    if(element) {
                        element.innerHTML = this.generateList(widgetModel, data, widgetModel.context);
                        $KU.toggleVisibilty(element, data, widgetModel);
                    }
                    break;
            }
        },

        render: function(radiobuttonModel, context) {
            var data = $KW.Utils.getMasterData(radiobuttonModel);
            var computedSkin = $KW.skins.getWidgetSkinList(radiobuttonModel, context, data);

            var htmlString = "<div" + $KW.Utils.getBaseHtml(radiobuttonModel, context) + "class = '" + computedSkin + "' style='" + $KW.skins.getBaseStyle(radiobuttonModel, context) + (context.ispercent === false ? "display:inline-block" : "") + "'>";

            radiobuttonModel.context = context;
            htmlString += this.generateList(radiobuttonModel, data, context);

            htmlString += "</div>";
            return htmlString;
        },

        generateList: function(radiobuttonModel, data, context) {
            var htmlString = "";
            if(data.length > IndexJL) {
                var key = radiobuttonModel.selectedkey;
                radiobuttonModel.selectedkey = key ? key : null; 
                $KW.Utils.setSelectedValueProperty(radiobuttonModel, data, "selectedkey");

                for(var i = IndexJL; i < data.length; i++) {
                    if(data[i][IndexJL] != null && data[i][1 + IndexJL] != null) {
                        var selected = (radiobuttonModel.selectedkey == data[i][IndexJL]) ? "checked" : "";
                        if(radiobuttonModel.viewtype == "customview") {
                            if(radiobuttonModel.itemorientation == "vertical") {
                                htmlString += "<div style = 'height: auto;'  class='kwt100'>";
                            } else {
                                htmlString += "<div style = ' display: inline-block; height: auto;' >";
                            }

                            var imgsrc;
                            if(selected == "checked") {
                                imgsrc = "url(" + $KU.getImageURL(radiobuttonModel.checkedimage) + ")"
                            } else {
                                imgsrc = "url(" + $KU.getImageURL(radiobuttonModel.uncheckedimage) + ")"
                            };

                            var name = (context && context.container ? (radiobuttonModel.id + "_" + context.container.counter) : radiobuttonModel.id); 

                            htmlString += "<input style='display : none;' id ='" + radiobuttonModel.id + "radio" + i + "' class='middlecenteralign' kformname='" + radiobuttonModel.pf + "' kwidgettype='" + radiobuttonModel.wType + "' type='radio' " + selected + ($KW.Utils.isWidgetDisabled(radiobuttonModel, context) ? " disabled='true'" : "") + " value='" + data[i][IndexJL] + "' name='" + name + "' style='  margin-right:3px;' />";
                            htmlString += "<label id ='" + radiobuttonModel.id + "_label" + i + "' selected ='" + selected + "'  for ='" + radiobuttonModel.id + "radio" + i + "'  name = '" + radiobuttonModel.id + "_label" + i + "' style=' background-image: " + imgsrc + "; width: " + radiobuttonModel.size + "px; height: " + radiobuttonModel.size + "px; -webkit-background-size: 100%; background-size:100%; margin-right: 3px; vertical-align: middle; display: inline-block;' ></label>"
                            htmlString += "<label style=' position: relative; padding-left: 5px; vertical-align: middle; display: inline-block;'>"
                            htmlString += $KU.escapeHTMLSpecialEntities(data[i][1 + IndexJL]);
                            htmlString += (radiobuttonModel.itemorientation == constants.RADIOGROUP_ITEM_ORIENTATION_VERTICAL) ? "</label><br/></div>" : "</div></label>&nbsp;";

                        } else {

                            if(radiobuttonModel.itemorientation == "vertical") {
                                htmlString += "<div style = 'height: auto;'  class='kwt100'>";
                            } else {
                                htmlString += "<div style = ' display: inline-block; height: auto; text-decoration: inherit;' >";
                            }
                            var name = (context && context.container ? (radiobuttonModel.id + "_" + context.container.counter) : radiobuttonModel.id); 

                            var ariaString = $KU.getAccessibilityValues(radiobuttonModel, data[i][2 + IndexJL], data[i][IndexJL]);
                            if(ariaString.indexOf('aria-label') < 0)
                                ariaString += " aria-label='" + $KU.escapeHTMLSpecialEntities(data[i][1 + IndexJL]) + "' ";

                            htmlString += "<input  " + ariaString + "type='radio' kwidgettype='" + radiobuttonModel.wType + "' name='" + name + "' " + selected + ($KW.Utils.isWidgetDisabled(radiobuttonModel, context) ? " disabled='true'" : "") + " class='middlecenteralign' value='" + data[i][IndexJL] + "' style='margin-right:3px;' kformname='" + radiobuttonModel.pf + "'/>";
                            htmlString += "<span aria-hidden='true' class='middlecenteralign'>" + $KU.escapeHTMLSpecialEntities(data[i][1 + IndexJL]) + "</span>";

                            htmlString += (radiobuttonModel.itemorientation == "vertical") ? "<br/></div>" : "</div>&nbsp;";

                        }
                    }
                }
            }
            return htmlString;

        },

        changeImage: function(target, radiobuttonModel, newselectedkey) {
            if(radiobuttonModel.selectedkey != newselectedkey) {
                var data = $KW.Utils.getMasterData(radiobuttonModel);
                var checksrc = "url(" + $KU.getImageURL(radiobuttonModel.checkedimage) + ")";
                var unchecksrc = "url(" + $KU.getImageURL(radiobuttonModel.uncheckedimage) + ")";

                for(var i = IndexJL; i < data.length; i++) {
                    if(data[i][IndexJL] != null && data[i][1 + IndexJL] != null) {

                        var node = $KU.getElementById(radiobuttonModel.id + "_label" + i);
                        if(node.getAttribute("selected") == "checked") {
                            node.style.backgroundImage = "url(" + $KU.getImageURL(radiobuttonModel.uncheckedimage) + ")";
                            node.setAttribute("selected", "");
                        }
                    }
                }

                target.style.backgroundImage = "url(" + $KU.getImageURL(radiobuttonModel.checkedimage) + ")";
                target.setAttribute("selected", "checked");
            }
        },

        eventHandler: function(eventObject, target) {
            var radioGrp = target.parentNode.parentNode;
            var radiobuttonModel = $KU.getModelByNode(radioGrp);

            var inputElements = radioGrp.getElementsByTagName("input");
            for(var i = 0; i < inputElements.length; i++) {
                inputElements[i].removeAttribute("checked");
            }

            target.setAttribute("checked", "");

            if(radiobuttonModel) {

                if(radiobuttonModel.viewtype == "customview") {
                    module.changeImage($KU.getNextSibling(target), radiobuttonModel, target.value);
                }

                radiobuttonModel.selectedkey = target.value;
                spaAPM && spaAPM.sendMsg(radiobuttonModel, 'onselection');
                $KAR && $KAR.sendRecording(radiobuttonModel, 'click', {'key': target.value, 'target': radioGrp, 'eventType': 'uiAction'});
                if(radioGrp.getAttribute("kcontainerID"))
                    $KW.Utils.updateContainerData(radiobuttonModel, target, false);
                else {
                    $KW.Utils.setSelectedValueProperty(radiobuttonModel, $KW.Utils.getMasterData(radiobuttonModel), "selectedkey");
                    var radioref = $KU.returnEventReference(radiobuttonModel.onselection);
                    if(radioref) {
                        $KU.executeWidgetEventHandler(radiobuttonModel, radioref);
                        $KU.onEventHandler(radiobuttonModel);
                    }
                }
            }
        }
    };


    return module;
}());
