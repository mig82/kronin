
$KW.Link = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "Link", this.eventHandler);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;

            switch(propertyName) {
                case "text":

                    element.childNodes[0].innerHTML = $KU.escapeHTMLSpecialEntities(propertyValue);
                    break;
            }
        },

        render: function(linkModel, context) {
            if(!linkModel.buiskin) linkModel.buiskin = linkModel.blockeduiskin;
            var computedSkin = $KW.skins.getWidgetSkinList(linkModel, context);
            computedSkin += " konylink";
            var htmlString = "<div" + $KW.Utils.getBaseHtml(linkModel, context) + "class = '" + computedSkin + "' style='display:inline-block;text-align:" + $KW.skins.getContentAlignment(linkModel) + ";" + $KW.skins.getBaseStyle(linkModel, context) + (context.layoutDir && context.ispercent === false ? ";float:" + context.layoutDir : "") + "'>";

            var accessAttr = $KU.getAccessibilityValues(linkModel);

            htmlString += "<a";
            if(linkModel.externalurl) {
                htmlString += " " + "onclick='window.open('" + linkModel.externalurl + "');return false;'";
            }
            var IEMobileStyle = " style='display:inline-block;width:100%;height:100%'";
            htmlString += " href='javascript:void(0)' " + ($KU.isWindowsPhone ? IEMobileStyle : "") + accessAttr + ">" + $KU.escapeHTMLSpecialEntities(linkModel.text) + "</a>";
            htmlString += "</div>";
            return htmlString;
        },

        eventHandler: function(eventObject, target) {
            var linkModel = $KU.getModelByNode(target),
                containerId = target.getAttribute("kcontainerID");

            $KAR && $KAR.sendRecording(linkModel, 'click', {'target': target, 'eventType': 'uiAction'});

            
            spaAPM && spaAPM.sendMsg(linkModel, 'onclick');
            if(containerId) {
                $KW.Utils.updateContainerData(linkModel, target, true);
            } else if(linkModel.onclick) {
                var linkhandler = $KU.returnEventReference(linkModel.onclick);
                target.setAttribute("selected", "progressindtr");
                target.setAttribute("progressskin", linkModel.skin);
                linkModel.blockeduiskin && $KW.skins.applyBlockUISkin(linkModel);
                $KU.executeWidgetEventHandler(linkModel, linkhandler);
                $KU.onEventHandler(linkModel);
            }
        }
    };


    return module;
}());
