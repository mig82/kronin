
$KW.VBox = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "VBox", this.eventHandler);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            
        },

        render: function(vBoxModel, context) {
            var parentModel = vBoxModel.parent;

            var topLevelBox = context.topLevelBox;
            var layoutDirection = $KW.skins.getWidgetAlignmentSkin(vBoxModel);
            var htmlString = "";
            var boxstyle = " table-layout:fixed;" + $KW.skins.getBaseStyle(vBoxModel, context);

            var visibleClass = $KW.skins.getVisibilitySkin(vBoxModel);


            if(topLevelBox) {
                var vboxComputedSkin = $KW.skins.getWidgetSkinList(vBoxModel, context);

                htmlString += "<div class = 'ktable " + vboxComputedSkin + " " + visibleClass + "'" + $KW.Utils.getBaseHtml(vBoxModel, context) + " style='" + boxstyle + "'>";

            } else {
                var cwt = vBoxModel.containerweight;
                if(parentModel && parentModel.wType == "ScrollBox" && parentModel.totalWt && kony.appinit.isIE)
                    cwt = Math.floor((100 * cwt) / parentModel.totalWt);

                $KW.skins.addWidthRule(cwt);
                var vboxComputedSkin = "kwt" + cwt + " " + layoutDirection;
                htmlString += "<div class = ' kcell " + vboxComputedSkin + "' style='" + $KW.skins.getChildMarginAsPaddingSkin(vBoxModel) + "' >";
                
                
                vboxComputedSkin = $KW.skins.getWidgetSkinList(vBoxModel, context);
                htmlString += "<div class = 'ktable " + vboxComputedSkin + " " + visibleClass + "'" + $KW.Utils.getBaseHtml(vBoxModel, context) + " style='" + boxstyle + "'>";

            }

            var len = vBoxModel.children ? vBoxModel.children.length : 0;
            for(var i = 0; i < len; i++) {
                var childModel = vBoxModel[vBoxModel.children[i]];
                if(childModel.wType === "HBox" || childModel.wType === "VBox" || childModel.wType === "ScrollBox") {
                    context.topLevelBox = false;
                    if(childModel.wType == "HBox") context.ispercent = vBoxModel.percent;
                    htmlString += $KW[childModel.wType].render(childModel, context);
                } else {
                    context.ispercent = true;
                    vboxComputedSkin = " krow kwt100 ";
                    htmlString += "<div class = '" + vboxComputedSkin + "' >";
                    layoutDirection = $KW.skins.getWidgetAlignmentSkin(childModel);
                    vboxComputedSkin = "kwt100 kcell " + layoutDirection + (childModel.wType == 'TPW' ? ' konycustomcss' : '');
                    htmlString += "<div class = '" + vboxComputedSkin + "' >";
                    htmlString += $KW[childModel.wType].render(childModel, context);
                    htmlString += "</div></div>";
                }

            }
            htmlString += "</div>";
            if(!topLevelBox) {
                htmlString += "</div>";
            }
            return htmlString;
        },

        eventHandler: function(eventObject, target) {
            $KW.HBox.eventHandler(eventObject, target);
        }
    };


    return module;
}());
