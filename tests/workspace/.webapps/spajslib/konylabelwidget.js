
$KW.Label = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "Label", this.eventHandler);
        },

        initializeView: function(formId) {
            module.updateLineSpacing(formId);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;

            switch(propertyName) {
                
                case "linespacing":
                    this.updateLineHeight(widgetModel, element);
                    break;
                case "textCopyable":
                    if(propertyValue && !widgetModel.disabled) {
                        $KU.addClassName(element, "enableSelection");
                        $KU.removeClassName(element, "disableSelection");
                    } else {
                        $KU.addClassName(element, "disableSelection");
                        $KU.removeClassName(element, "enableSelection");
                    }
                    break;

                case "text":
                    if(!$KW.Utils.belongsToSegment(element))
                        element.childNodes[0].innerHTML = $KU.escapeHTMLSpecialEntities(propertyValue);
                    break;
            }
        },

        
        updateLineHeight: function(labWidgetModel, element) {
            var lineSpacingValue = labWidgetModel.linespacing;
            element = element.childNodes[0]; 
            if(lineSpacingValue > 0) {
                var fontSize = parseInt($KU.getStyle(element, "font-size"), 10);
                if(fontSize > 0) {
                    element.style.lineHeight = (fontSize + parseInt(lineSpacingValue, 10)) + "px";
                }
            } else {
                element.style.lineHeight = "";
            }
        },

        
        updateLineSpacing: function(formId) {
            var labelNodes = document.querySelectorAll("#" + formId + " div[kwidgettype='Label']");
            for(var i = 0; i < labelNodes.length; i++) {
                var labelNode = labelNodes[i];
                var labWidgetModel = $KU.getModelByNode(labelNode);
                this.updateLineHeight(labWidgetModel, labelNode);
            }
        },

        render: function(labelModel, context) {
            var computedSkin = $KW.skins.getWidgetSkinList(labelModel, context);
            var cAlign = $KW.skins.getContentAlignment(labelModel);
            var htmlString = "";
            htmlString = "<div" + $KW.Utils.getBaseHtml(labelModel, context) + "class = '" + computedSkin + "' style='text-align:" + cAlign + ";xoverflow:hidden;" + $KW.skins.getBaseStyle(labelModel, context);

            if(context.ispercent === false)
                htmlString += "display:inline-block;" + (context.layoutDir ? ("float:" + context.layoutDir) : "");

            htmlString += "'";

            var accessAttr = $KU.getAccessibilityValues(labelModel);

            htmlString += "><label  " + accessAttr + " style='white-space:pre-wrap;word-wrap:break-word;text-align:" + cAlign + ";'>" + $KU.escapeHTMLSpecialEntities(labelModel.text) + "</label></div>";
            return htmlString;
        },

        eventHandler: function(eventObject, target) {
            var labWidgetModel = $KU.getModelByNode(target),
                containerId = target.getAttribute("kcontainerID");

            $KAR && $KAR.sendRecording(labWidgetModel, 'click', {'target': target, 'eventType': 'uiAction'});
            
            if(containerId) {
                $KW.Utils.updateContainerData(labWidgetModel, target, true);
            } else {
                var executed = kony.events.executeBoxEvent(labWidgetModel);
                var tabId = target.getAttribute("ktabid");
                if(!executed && tabId) {
                    $KW.TabPane && $KW.TabPane.executeTabEvent(labWidgetModel, target, true);
                }
            }
        }
    };


    return module;
}());
