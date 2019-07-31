
$KW.RichText = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "RichText", this.eventHandler);
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;
            element = $KW.Utils.getClonedTemplateNode(element, widgetModel, propertyName);

            switch(propertyName) {
                case "text":
                    element.innerHTML = propertyValue;
                    break;
                case "linkskin":
                    this.setLinkSkin(widgetModel, element);
                    break;
                case "linkfocusskin":
                    this.setLinkFocusSkin(widgetModel, element);
                    break;
            }
        },

        render: function(richTextModel, context) {
            
            
            
            if($KU.isAndroid) {
                this.setLinkSkin(richTextModel);
                this.setLinkFocusSkin(richTextModel);
            }
            var computedSkin = $KW.skins.getWidgetSkinList(richTextModel, context);
            var htmlString = "<div" + $KW.Utils.getBaseHtml(richTextModel, context) + "class='" + computedSkin + "' style='white-space:pre-wrap;word-wrap:break-word;" + $KW.skins.getBaseStyle(richTextModel, context);
            if(context.ispercent === false)
                htmlString += "display:inline-block;" + (context.layoutDir ? ("float:" + context.layoutDir) : "");
            htmlString += ";text-align:" + $KW.skins.getContentAlignment(richTextModel) + "'>" + richTextModel.text + "</div>";
            if($KW.Utils.isWidgetDisabled(richTextModel, context))
                htmlString = htmlString.replace(/href=["'].*?["']/g, "href='javascript:void(0)'");
            return htmlString;
        },

        eventHandler: function(eventObject, target, data) {
            var richWidgetModel = $KU.getModelByNode(target),
                containerId = target.getAttribute("kcontainerID");
            
            spaAPM && spaAPM.sendMsg(richWidgetModel, 'onclick');

            $KAR && $KAR.sendRecording(richWidgetModel, 'click', {'data': data, 'target': target, 'eventType': 'uiAction'});

            if(containerId) {
                $KW.Utils.updateContainerData(richWidgetModel, target, true);
            } else if(richWidgetModel.onclick) {
                var richtextref = $KU.returnEventReference(richWidgetModel.onclick);
                if(richtextref) {
                    if(data) {
                        
                        $KU.executeWidgetEventHandler(richWidgetModel, richtextref, data[0], {
                            href: data[1]
                        });
                    } else {
                        $KU.executeWidgetEventHandler(richWidgetModel, richtextref);
                    }
                    $KU.onEventHandler(richWidgetModel);
                }
            } else if(data && data[1]) { 
                if(data[1].charAt(0) == "#") { 
                    
                    kony.events.stopPropagation(eventObject);
                    kony.events.preventDefault(eventObject);
                }
                var aLink = data[1].substring(1, data[1].length);
                var element = document.querySelector('a[name="' + aLink + '"]');
                var scrollerInstance = $KG[$KG["__currentForm"].id + '_scroller'];
                if(scrollerInstance && element) {
                    scrollerInstance.scrollToElement(element, 200);
                }
            }
        },

        setLinkSkin: function(richTextModel, node) {
            var linkSkin = richTextModel.linkskin;
            if(!linkSkin)
                return;

            if(node) {
                
                var selector = "#" + node.id + " > a"
                $KW.skins.applyStyle(linkSkin, selector);
            }

        },

        setLinkFocusSkin: function(richTextModel, node) {
            var linkFocusSkin = richTextModel.linkfocusskin;
            if(!linkFocusSkin)
                return;

            if(node) {
                
                var selector = "#" + node.id + " > a:active"
                $KW.skins.applyStyle(linkFocusSkin, selector);
            }
        }
    };


    return module;
}());
