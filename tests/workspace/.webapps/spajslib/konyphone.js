
$KW.Phone = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "Phone", this.eventHandler);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;

            switch(propertyName) {
                case "text":
                    if(element.childNodes[0]) {
                        var anchorNode = element.childNodes[0];
                        if(!widgetModel.image)
                            anchorNode.innerHTML = propertyValue;
                        anchorNode.href = "tel:" + propertyValue;
                    }
                    break;
            }
        },

        render: function(phoneModel, context) {
            var computedSkin = $KW.skins.getWidgetSkinList(phoneModel, context);
            var skin = phoneModel.skin || "";
            var htmlString = "<div" + $KW.Utils.getBaseHtml(phoneModel, context) + "class = '" + computedSkin + "'";

            if(context.ispercent === false)
                htmlString += " style='display:inline-block;' "

            htmlString += "><a class='" + skin + "' style='border:none;min-height:28px;' href='tel:" + phoneModel.text + "' >";
            if(!phoneModel.image) {
                htmlString += phoneModel.text;
            } else {
                var phoneImageSrc = $KU.getImageURL(phoneModel.image);
                htmlString += "<img alt='Call' src='" + phoneImageSrc + "' />";
            }
            htmlString += "</a></div>";
            return htmlString;
        },


        
        eventHandler: function(eventObject, target) {
            var phoneWidgetModel = $KU.getModelByNode(target);
            
            target.getAttribute("kcontainerID") && $KW.Utils.updateContainerData(phoneWidgetModel, target, false);

            var href;
            if(phoneWidgetModel.segmentID)
                href = target.childNodes[0].innerText || "";
            else
                href = phoneWidgetModel.text;

            href = href.replace(/[-\s]+/g, '');
            if(isNaN(href))
                href = $KW.Utils.convertPhoneAlphabetToNumber(href);
            $KI.phone.dial(href);
        }
    };


    return module;
}());
