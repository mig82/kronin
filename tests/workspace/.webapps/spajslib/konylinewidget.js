
$KW.Line = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("onorientationchange", "Line", this.resizeVLines);
        },

        initializeView: function(formId) {
            module.resizeVLines(formId);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;

            switch(propertyName) {
                case "thickness":
                    if(widgetModel.parent.wType != 'FlexContainer') {
                        if(element.getAttribute("direction") == "V")
                            element.style.width = propertyValue + "px";
                        else
                            element.style.borderTopWidth = propertyValue + "px";
                    }
                    break;
            }
        },

        render: function(lineModel, context) {
            var skins = $KW.skins.getWidgetSkinList(lineModel, context);
            
            var bgColor = (lineModel.skin && this.getColor(lineModel.skin)) || 'black';

            var htmlString;
            if(context.vLine || $KW.FlexUtils.isFlexWidget(lineModel)) {
                var width = context.vLine ? 'width:' + lineModel.thickness + 'px;' : '';
                var height = context.vLine ? 'height:1px;' : '';
                var direction = context.vLine ? 'V' : 'flex';
                htmlString = "<div" + $KW.Utils.getBaseHtml(lineModel, context) + "class='" + skins + "' direction='" + direction + "' style='background-color:" + bgColor + ";" + width + height + "margin:auto;" + $KW.skins.getBaseStyle(lineModel, context) + (context.ispercent === false ? "display:inline-block" : "") + "'></div>"
            } else {
                htmlString = "<div" + $KW.Utils.getBaseHtml(lineModel, context) + "class='" + skins + "' style='border-top:" + lineModel.thickness + "px solid " + bgColor + ";" + $KW.skins.getBaseStyle(lineModel, context) + "'></div>";
            }

            return htmlString;
        },

        resizeVLines: function(formId, orientation) {
            
            var vLineNodes = document.querySelectorAll("#" + formId + " div[kwidgettype='Line'][direction='V']");

            
            if(orientation) {
                for(var i = 0; i < vLineNodes.length; i++) {
                    var vLineNode = vLineNodes[i];
                    vLineNode.style.height = "1px";
                }
            }
            for(var i = 0; i < vLineNodes.length; i++) {
                module.resizeVLine(vLineNodes[i]);
            }
        },

        resizeVLine: function(vLineNode) {
            vLineNode.style.height = 'auto';
            vLineNode.style.height = vLineNode.parentNode.clientHeight + "px";
            vLineNode.parentNode.style.width = vLineNode.style.width;
        },

        applySkin: function(element, skin) {
            var bgColor = (skin && this.getColor(skin)) || "black";
            if(element.getAttribute("direction") == "V" || element.getAttribute("direction") == "flex")
                element.style.backgroundColor = bgColor;
            else
                element.style.borderTopColor = bgColor;

        },

        getColor: function(skin) {
            if(!$KG['line' + skin]) {
                var temp = document.createElement("div");
                temp.className = skin;
                document.body.appendChild(temp);
                $KG['line' + skin] = $KU.getStyle(temp, "color");
                document.body.removeChild(temp);
            }
            return $KG['line' + skin];
        }
    };


    return module;
}());
