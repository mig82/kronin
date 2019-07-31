
$KW.HBox = (function() {
    
    

    var module = {
        initialize: function() {
            kony.events.addEvent("click", "HBox", this.eventHandler);
            kony.events.addEvent("onorientationchange", "HBox", this.orientationHandler);
        },

        orientationHandler: function(formId, orientation) {
            var aspectratioNodes = document.querySelectorAll("div[aspect-ratio]");
            for(var i = 0; i < aspectratioNodes.length; i++) {
                var node = aspectratioNodes[i];
                var aspectratio = node.getAttribute("aspect-ratio");
                var width = node.clientWidth;
                var newHeight = Math.round(1 / aspectratio * width);
                node.style.height = newHeight + 'px';
            }
        },

        
        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            
        },

        getExtraNodeWidth: function(boxModel) {
            var sumOfChildwidth = 0;
            for(var i = 0; i < boxModel.children.length; i++) {
                sumOfChildwidth += boxModel[boxModel.children[i]].containerweight;
            }
            return(sumOfChildwidth > 100) ? 0 : (100 - sumOfChildwidth);
        },

        render: function(boxModel, context) {
            if(!boxModel.buiskin) boxModel.buiskin = boxModel.blockeduiskin;
            var parentModel = kony.model.getWidgetModel(boxModel.pf, context.tabpaneID);

            var layoutDirection = $KW.skins.getWidgetAlignmentSkin(boxModel);
            var topLevel = context.topLevelBox;
            var skinArray = $KW.skins.getSplitSkinsBetweenWidgetAndParentDiv(boxModel, context);
            var computedSkin = skinArray[2];
            computedSkin += " " + $KW.skins.getWidgetAlignmentSkin(boxModel);
            var htmlString = "";

            if(!topLevel) {
                htmlString += "<div class = 'krow kwt100' >";
                htmlString += "<div class = 'kcell kwt100' >";
            }
            computedSkin += $KW.skins.getVisibilitySkin(boxModel);
            var boxstyle = " table-layout:fixed;" + $KW.skins.getBaseStyle(boxModel, context);

            htmlString += "<div  class = 'ktable " + computedSkin + "'" + $KW.Utils.getBaseHtml(boxModel, context) + " style='" + boxstyle + "'>";
            htmlString += "<div class = 'krow " + layoutDirection + " kwt100' >";
            if(boxModel.children) {
                for(var i = 0; i < boxModel.children.length; i++) {
                    var childModel = boxModel[boxModel.children[i]];
                    context.vLine = (childModel.wType == "Line") ? true : false;
                    if(childModel.wType === "HBox" || childModel.wType === "VBox") {
                        context.topLevelBox = false;
                        context.ispercent = boxModel.percent;
                        if(childModel.wType == "HBox") {
                            htmlString += $KW["HBox"].render(childModel, context);
                        } else {
                            htmlString += $KW["VBox"].render(childModel, context);
                        }
                    } else {
                        
                        if(boxModel.percent === true) {
                            context.ispercent = true;
                            var containerWt;
                            if(childModel.containerweight)
                                containerWt = "kwt" + childModel.containerweight;
                            else
                                containerWt = "auto";
                            var alignment = $KW.skins.getWidgetAlignmentSkin(childModel);
                            htmlString += "<div class = 'kcell " + containerWt + " " + alignment + (childModel.wType == 'TPW' ? ' konycustomcss' : '') + "' style='" + $KW.skins.getChildMarginAsPaddingSkin(childModel) + "' >";

                        } else {
                            context.ispercent = false;
                        }

                        htmlString += $KW[childModel.wType].render(childModel, context);

                        if(boxModel.percent === true) {
                            htmlString += "</div>";
                        }

                    }
                }
                
                if($KG.appbehaviors.adherePercentageStrictly == true && boxModel.percent === true) {
                    boxModel.dummyNodeWidth = this.getExtraNodeWidth(boxModel);
                    htmlString += "<div class = 'kcell kwt" + boxModel.dummyNodeWidth + "'  ></div>";
                }
            }
            htmlString += "</div></div>";
            if(!topLevel) {
                htmlString += "</div></div>";
            }
            return htmlString;
        },

        eventHandler: function(eventObject, target) {
            var widgetModel = $KU.getModelByNode(target),
                containerId = target.getAttribute("kcontainerID");

            widgetModel.blockeduiskin && $KW.skins.applyBlockUISkin(widgetModel);
            spaAPM && spaAPM.sendMsg(widgetModel, 'onclick');
            $KAR && $KAR.sendRecording(widgetModel, 'click', {'target': target, 'eventType': 'uiAction'});
            
            if(containerId) {
                $KW.Utils.updateContainerData(widgetModel, target, true);
            } else {
                var executed = kony.events.executeBoxEvent(widgetModel);
                var tabId = target.getAttribute("ktabid");
                if(!executed && tabId) {
                    $KW.TabPane && $KW.TabPane.executeTabEvent(widgetModel, target, true);
                }
            }
        },

        setProgressIndicator: function(link) {
            var progressdiv = $KW.Utils.setProgressIndicator(link);
            link.parentNode.insertBefore(progressdiv, link);
        },

        addChild: function(boxModel, wArray) {
            var box = $KU.getNodeByModel(boxModel);
            if(box && wArray.length > 0) {
                $KU.updatei18nProperties(wArray);
                var wrapper = document.createElement("div");
                wrapper.innerHTML = module.appendChildren(boxModel, wArray);
                if(boxModel.wType == "HBox" || boxModel.orientation == constants.BOX_LAYOUT_HORIZONTAL)
                    box = box.children[0]; 
                while(wrapper.children.length > 0) {
                    if((boxModel.wType == "HBox" || boxModel.wType == "ScrollBox") && $KG.appbehaviors.adherePercentageStrictly == true && boxModel.percent === true)
                        box.insertBefore(wrapper.children[0], box.lastChild || null);
                    else
                        box.appendChild(wrapper.children[0]);
                }

                if($KG.appbehaviors.adherePercentageStrictly == true && boxModel.orientation == constants.BOX_LAYOUT_HORIZONTAL) {
                    for(var i = 0; i < wArray.length; i++) {
                        boxModel.dummyNodeWidth -= wArray[i].containerweight;
                    }
                    box.lastChild.className = "kcell kwt" + boxModel.dummyNodeWidth;
                }

                if(kony.appinit.isIE && boxModel.wType == "ScrollBox" && boxModel.orientation == constants.BOX_LAYOUT_HORIZONTAL) {
                    $KW.ScrollBox.adjustScrollChildrenWidth(boxModel);
                }
                $KU.layoutNewWidgets(boxModel, wArray);
                $KW.Utils.initializeNewWidgets(wArray);
            }
        },

        addChildat: function(boxModel, wArray, index) {
            var box = $KU.getNodeByModel(boxModel);
            if(box) {
                $KU.updatei18nProperties(wArray);
                var wrapper = document.createElement("div");
                wrapper.innerHTML = module.appendChildren(boxModel, wArray);
                if(boxModel.wType == "HBox" || boxModel.orientation == constants.BOX_LAYOUT_HORIZONTAL)
                    box = box.children[0];
                index = index < 0 ? 0 : index;
                box.insertBefore(wrapper.childNodes[0], box.childNodes[index] || null);

                if(kony.appinit.isIE && boxModel.wType == "ScrollBox" && boxModel.orientation == constants.BOX_LAYOUT_HORIZONTAL) {
                    $KW.ScrollBox.adjustScrollChildrenWidth(boxModel);
                }
                $KU.layoutNewWidgets(boxModel, wArray);
                $KW.Utils.initializeNewWidgets(wArray);

                if($KG.appbehaviors.adherePercentageStrictly == true && boxModel.orientation == constants.BOX_LAYOUT_HORIZONTAL) {
                    for(var i = 0; i < wArray.length; i++) {
                        boxModel.dummyNodeWidth -= wArray[i].containerweight;
                    }
                    box.lastChild.className = "kcell kwt" + boxModel.dummyNodeWidth;
                }
            }
        },

        appendChildren: function(boxModel, wArray) {
            var context = new $KW.WidgetGenerationContext(boxModel.pf);
            if(boxModel.wType == "FlexContainer" || boxModel.wType == "FlexScrollContainer") {
                return $KW.FlexContainer.renderChildren(boxModel, wArray, context);
            }

            var htmlString = '';
            for(var i = 0; i < wArray.length; i++) {
                var childModel = wArray[i];
                if(childModel.wType == "HBox" || childModel.wType == "VBox") {
                    context.toplevel = false;
                    if(childModel.wType == "HBox") {
                        htmlString += $KW["HBox"].render(childModel, context);
                    } else {
                        htmlString += $KW["VBox"].render(childModel, context);
                    }
                } else {
                    if(boxModel.wType == "HBox" || boxModel.orientation == constants.BOX_LAYOUT_HORIZONTAL) {
                        if(boxModel.percent == true) {
                            context.ispercent = true;
                            var containerWt = "kwt" + childModel.containerweight;
                            var alignment = $KW.skins.getWidgetAlignmentSkin(childModel);
                            htmlString += "<div class = 'kcell " + containerWt + " " + alignment + "' style='" + $KW.skins.getChildMarginAsPaddingSkin(childModel) + "' >";
                        } else {
                            context.ispercent = false;
                        }

                        htmlString += $KW[childModel.wType].render(childModel, context);
                        if(boxModel.percent == true) {
                            htmlString += "</div>";
                        }
                    } else {
                        var vboxComputedSkin = " krow kwt100 ";
                        htmlString += "<div class = '" + vboxComputedSkin + "' >";
                        layoutDirection = $KW.skins.getWidgetAlignmentSkin(childModel)
                        vboxComputedSkin = "kwt100";
                        vboxComputedSkin += " kcell " + layoutDirection;
                        htmlString += "<div class = '" + vboxComputedSkin + "' style='" + $KW.skins.getChildMarginAsPaddingSkin(childModel) + "' >";
                        htmlString += $KW[childModel.wType].render(childModel, context);
                        htmlString += "</div></div>";
                    }
                }
            }
            return htmlString;
        },

        
        add: function() {
            var boxobj = arguments[0];

            if(boxobj && "add" in boxobj) {
                var widarray = [].slice.call(arguments, 1);
                boxobj.add(widarray);
            }
        },

        addAt: function(boxModel, widgetref, index) {
            if(widgetref == null) return;
            boxModel && boxModel.addAt(widgetref, index);
        },

        remove: function(boxModel, widgetref) {
            boxModel && boxModel.remove(widgetref);
        },

        removeAt: function(boxModel, index) {
            return boxModel && boxModel.removeAt(index);
        },

        widgets: function(boxModel) {
            return boxModel && boxModel.widgets();
        },

        DOMremove: function(boxModel, widgetref) {
            var box = $KU.getNodeByModel(boxModel);
            if(box && widgetref) {
                if(boxModel.wType == "HBox" || (boxModel.wType == "ScrollBox" && boxModel.orientation == constants.BOX_LAYOUT_HORIZONTAL))
                    box = box.children[0];
                for(var i = 0; i < boxModel.children.length; i++) {
                    if(widgetref.id == boxModel.children[i]) {
                        box.removeChild(box.children[i]);
                        break;
                    }
                }
            }
        },

        DOMremoveAll: function(boxModel) {
            var box = $KU.getNodeByModel(boxModel);
            if(box) {
                if(boxModel.wType == "HBox" || (boxModel.wType == "ScrollBox" && boxModel.orientation == constants.BOX_LAYOUT_HORIZONTAL))
                    box = box.children[0];
                box.innerHTML = "";
            }
        }
    };


    return module;
}());
