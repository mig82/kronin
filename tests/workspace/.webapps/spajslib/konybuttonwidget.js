
$KW.Button = (function() {
    
    

    var module = {
        
        initialize: function() {
            kony.events.addEvent("click", "Button", this.eventHandler);
        },

        
        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {

            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;
            element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);

            switch(propertyName) {
                case "text":
                    if($KU.isWindowsTablet)
                        element.innerHTML = $KU.escapeHTMLSpecialEntities(propertyValue);
                    else
                        element.value = propertyValue;
                    break;
            }
        },

        render: function(buttonModel, context) {
            if(!buttonModel.buiskin)
                buttonModel.buiskin = buttonModel.blockeduiskin;
            var computedSkin = $KW.skins.getWidgetSkinList(buttonModel, context);
            var htmlString = "";
            var skin = buttonModel.skin || "";
            var cAlign = $KW.skins.getContentAlignment(buttonModel);

            if($KU.isWindowsTablet) {
                htmlString = "<button" + $KW.Utils.getBaseHtml(buttonModel, context) + "type='button' class = '" + computedSkin + "'" + " style='text-align:" + $KW.skins.getContentAlignment(buttonModel) + ";white-space:normal;word-wrap:break-word;" + $KW.skins.getBaseStyle(buttonModel, context) + (context.layoutDir && context.ispercent === false ? ";float:" + context.layoutDir : "") + "' kprogressskin='" + skin + "'>" + (buttonModel.displaytext.toString() == "true" ? $KU.escapeHTMLSpecialEntities(buttonModel.text) : "") + "</button>";
            } else {
                htmlString = "<input" + $KW.Utils.getBaseHtml(buttonModel, context) + "type='button' class = '" + computedSkin + "'" + " style='text-align:" + $KW.skins.getContentAlignment(buttonModel) + ";white-space:normal;word-wrap:break-word;" + $KW.skins.getBaseStyle(buttonModel, context) + (context.layoutDir && context.ispercent === false ? ";float:" + context.layoutDir : "") + "'" + (buttonModel.displaytext.toString() == "true" ? " value='" + $KU.escapeHTMLSpecialEntities(buttonModel.text) + "'" : "") + " kprogressskin='" + skin + "'/>";
            }

            return htmlString;
        },

        
        eventHandler: function(eventObject, target) {
            var buttonModel = $KU.getModelByNode(target),
                containerId = target.getAttribute("kcontainerID");

            spaAPM && spaAPM.sendMsg(buttonModel, 'onclick');
            $KAR && $KAR.sendRecording(buttonModel, 'click', {'target': target, 'eventType': 'uiAction'});
            
            if(containerId) {
                $KW.Utils.updateContainerData(buttonModel, target, true);
            } else if(buttonModel.onclick) {
                var buttonhandler = $KU.returnEventReference(buttonModel.onclick);
                if(buttonhandler && buttonModel.blockeduiskin) $KW.skins.applyBlockUISkin(buttonModel);
                
                target.setAttribute("selected", "progress");
                

                $KU.executeWidgetEventHandler(buttonModel, buttonhandler);
                $KU.onEventHandler(buttonModel);
            }
        }
    };


    return module;
}());
