
$KW.skins = (function() {
    
    

    var module = {
        
        getBaseStyle: function(widgetModel, context) {
            var style = "";
            if(widgetModel.backgroundColor) {
                var validate = module.validateHexValue(widgetModel.backgroundColor);
                if(validate) {
                    style += "background : " + module.convertHexValuetoRGBA(widgetModel.backgroundColor) + "; ";
                }
            }
            if(widgetModel.borderColor) {
                var validate = module.validateHexValue(widgetModel.borderColor);
                if(validate) {
                    style += "border-color : " + module.convertHexValuetoRGBA(widgetModel.borderColor) + "; ";
                }
            }

            if(widgetModel.borderWidth) {
                style += "border-width : " + widgetModel.borderWidth + "px; ";
            }

            if(widgetModel.cornerRadius) {
                style += "border-radius : " + widgetModel.cornerRadius + "px; ";
            }

            if(widgetModel.cursortype) {
                style += "cursor : " + $KW.Utils.getCursorStyle(widgetModel);
            }

            if(widgetModel.wType != "DataGrid")
                style += module.getMarginSkin(widgetModel, context);

            if(widgetModel.wType != "Browser" && widgetModel.wType != "Segment" && widgetModel.wType != "FlexContainer" && widgetModel.wType != "FlexScrollContainer")
                style += module.getPaddingSkin(widgetModel);

            style += this.getBlurStyle(widgetModel);

            return style;
        },

        
        getMarginSkin: function(widgetModel, context) {
            if($KW.FlexUtils.isFlexWidget(widgetModel))
                return "";
            context = context || {};

            var parentmodel = widgetModel.parent;
            var margin = widgetModel.margin;

            if($KG.appbehaviors && $KG.appbehaviors["applyMarginPaddingInBCGMode"] == true) {
                if($KU.isArray(margin))
                    return "margin:" + $KU.joinArray(margin, "% ") + "%;";
                else
                    return "margin:0;";
            } else {
                if((!parentmodel || (parentmodel.wType == "HBox" && context.ispercent == false)) || (parentmodel.wType != "HBox" && !(parentmodel.wType == "ScrollBox" && parentmodel.orientation == constants.BOX_LAYOUT_HORIZONTAL))) {
                    if($KU.isArray(margin))
                        return "margin:" + $KU.joinArray(margin, "% ") + "%;";
                    else
                        return "margin:0;";
                } else
                    return "";
            }
        },

        

        
        getChildMarginAsPaddingSkin: function(widgetModel) {
            var parentmodel = $KU.getParentModel(widgetModel);
            if(($KG.appbehaviors["applyMarginPaddingInBCGMode"] == true))
                return "";
            var margin = widgetModel.margin;
            var i = 0;
            
            if($KU.isArray(margin) && parentmodel && parentmodel.wType == "ScrollBox" && parentmodel.orientation == constants.BOX_LAYOUT_HORIZONTAL) {
                var totalWt = parentmodel.totalWt;
                while(i < 4) {
                    margin[i] = totalWt && (margin[i] * 100) / totalWt;
                    i++;
                }
                return "padding:" + $KU.joinArray(margin, "% ") + "%;";
            }
            if($KU.isArray(margin))
                return "padding:" + $KU.joinArray(margin, "% ") + "%;";
            else
                return "";
        },

        
        getPaddingSkin: function(widgetModel) {
            if(widgetModel.wType != "DataGrid" && ($KW.FlexUtils.isFlexContainer(widgetModel) || $KW.FlexUtils.isFlexWidget(widgetModel)))
                return "";

            if(widgetModel.wType == 'ListBox' || widgetModel.wType == 'ComboBox')
                return "padding:0% ";

            var parentmodel = widgetModel.parent;
            var padding = widgetModel.padding;
            var margin = widgetModel.margin;
            
            if((typeof($KG.appbehaviors["parentLevelPadding"]) == 'undefined' || $KG.appbehaviors["parentLevelPadding"] == true) && $KG.appbehaviors["applyMarginPaddingInBCGMode"] == false && parentmodel != null && parentmodel.wType == "HBox" && parentmodel.percent == true && widgetModel.id != widgetModel.pf) {
                if(padding && $KU.isArray(padding) && margin && $KU.isArray(margin)) {
                    var excesspadding = 100 / (widgetModel.containerweight - (parseInt(margin[0 + IndexJL]) + parseInt(margin[2 + IndexJL])));
                    var x = [];
                    var y = widgetModel.padding;
                    for(var i = 0; i < y.length; i++) {
                        x[i] = y[i] * excesspadding;
                    }
                    return "padding:" + $KU.joinArray(x, "% ") + "%;";
                }
            } else {
                if($KU.isArray(padding))
                    return "padding:" + $KU.joinArray(padding, "% ") + "%;";
                else
                    return "padding:0%;";
            }
        },

        setMarginPadding: function(element, propertyName, widgetModel, propertyValue, referenceCWt) {
            var element = $KW.Utils.getWidgetNode(widgetModel);
            if(element) {
                if(typeof referenceCWt != "number")
                    referenceCWt = 100;
                var kwidth = module.getMarPadAdjustedContainerWeightSkin(widgetModel, referenceCWt);
                element.className = element.className.replace(/\kwt/g, '_');

                var parentModel = widgetModel.parent;
                if(($KG.appbehaviors && $KG.appbehaviors["applyMarginPaddingInBCGMode"] == false) && (parentModel && parentModel.percent && (parentModel.wType == "HBox" || (parentModel.wType == "ScrollBox" && parentModel.orientation == constants.BOX_LAYOUT_HORIZONTAL)))) {
                    $KU.addClassName(element, "kwt100");
                    propertyName = "padding";
                    element = element.parentNode;
                    element.style[propertyName] = $KU.joinArray(propertyValue, "% ") + "%";
                } else {
                    if(!((parentModel.wType == "HBox" || parentModel.wType == "ScrollBox") && !parentModel.percent))
                        $KU.addClassName(element, kwidth);
                    element.style[propertyName] = $KU.joinArray(propertyValue, "% ") + "%";
                }
            }
        },

        
        getMarAdjustedContainerWeightSkin: function(widgetModel, referenceCWt) {
            var cwt = referenceCWt || ((widgetModel.wType == "HBox") ? "100" : widgetModel.containerweight);
            if(cwt) {
                var margin = widgetModel.margin;
                if(margin) {
                    cwt -= (parseInt(margin[0 + IndexJL]) + parseInt(margin[2 + IndexJL]));
                }
                module.addWidthRule(cwt);
                return "kwt" + cwt;
            } else
                return "kwt100";
        },

        addWidthRule: function(cwt) {
            if(cwt > 100 && $KG["cwtexists"].indexOf(cwt) == -1) {
                $KG["cwtexists"].push(cwt);
                var styleSheetObjs = window.document.styleSheets;
                var konyStyleSheetIndex = module.getKonyStyleSheetIndex(styleSheetObjs);
                if(konyStyleSheetIndex != -1) {
                    var styleSheetObj = styleSheetObjs[konyStyleSheetIndex];
                    var rules = styleSheetObj.cssRules || styleSheetObj.rules;
                    if(styleSheetObj.insertRule)
                        styleSheetObj.insertRule(".kwt" + cwt + "{width:" + cwt + "%;}", rules.length);
                    else
                        styleSheetObj.addRule(".kwt" + cwt, "width:" + cwt + "%;");
                }
            }
        },

        
        getMarPadAdjustedContainerWeightSkin: function(widgetModel, referenceCWt) {
            var cwt = referenceCWt || widgetModel.containerweight;

            if(cwt) {
                try {
                    var margin = widgetModel.margin;
                    if(margin) {
                        cwt -= (parseInt(margin[0 + IndexJL]) + parseInt(margin[2 + IndexJL]));
                    }
                    return "kwt" + cwt;
                } catch(e) {
                    kony.web.logger("error", "Error occured in getting container weight " + e);
                }
            } else
                return "kwt100";
        },

        
        getWidgetSkin: function(widgetModel, context) {
            var skin;
            if(context && context.container && context.container.widgetsData) {
                var data = context.container.widgetsData;
                var wData = data[widgetModel.id];
                if(wData && wData.skin)
                    skin = wData.skin;
            }
            return skin || widgetModel.skin || this.getDefaultSkin(widgetModel) || "";
        },

        getDefaultSkin: function(widgetModel) {
            var skin = "";

            if(widgetModel.wType == "Link" || widgetModel.wType == "Label" || widgetModel.wType == "Button" || widgetModel.wType == "DataGrid" || widgetModel.wType == "RichText" || widgetModel.wType == "CheckBoxGroup" || widgetModel.wType == "RadioButtonGroup" || widgetModel.wType == "ComboBox" || widgetModel.wType == "ListBox" || widgetModel.wType == "Switch")
                skin = 'konycustomcss';
            return skin;
        },

        
        getWidgetSkinList: function(widgetModel, context, data) {
            var skins = [];
            context = context || {};

            
            skins.push(this.getWidgetWeight(widgetModel, context));
            skins.push(this.getWidgetSkin(widgetModel, context));
            if(['Calendar', 'Label'].indexOf(widgetModel.wType) != -1 && $KW.FlexUtils.isFlexWidget(widgetModel))
                skins.push(this.getFlexContentAlignmentSkin(widgetModel.contentalignment));
            skins.push(this.getWidgetSelectionSkin(widgetModel));

            var isFlexWidget = $KW.FlexUtils.isFlexWidget(widgetModel);
            if(!isFlexWidget && (!$KW.Utils.isWidgetVisible(widgetModel, context) || (data && data.length <= IndexJL))) 
                skins.push("hide");
            return skins.join(" ");
        },

        getVisibilitySkin: function(wModel) {
            var isFlexWidget = $KW.FlexUtils.isFlexWidget(wModel);
            return(!isFlexWidget && !wModel.isvisible) ? ' hide ' : '';
        },

        getWidgetWeight: function(widgetModel, context) {

            var parentmodel = widgetModel.parent;
            if(parentmodel && ((parentmodel.wType == "HBox" || parentmodel.wType == 'ScrollBox') && parentmodel.percent == false) || $KW.FlexUtils.isFlexWidget(widgetModel))
                return "";

            
            

            if(parentmodel && ($KG.appbehaviors && $KG.appbehaviors["applyMarginPaddingInBCGMode"] == false && parentmodel.wType == "HBox")) {
                return "kwt100";
            } else {
                return module.getMarAdjustedContainerWeightSkin(widgetModel, 100);
            }
        },

        getWidgetSelectionSkin: function(widgetModel) {
            if(widgetModel.wType == "Label" || widgetModel.wType == "Button" || widgetModel.wType == "Line" || widgetModel.wType == "Link" || widgetModel.wType == "Switch" || widgetModel.wType == "ListBox" || widgetModel.wType == "CheckBoxGroup" || widgetModel.wType == "ComboBox" || widgetModel.wType == "RadioButtonGroup" || widgetModel.wType == "Calendar") {
                return(widgetModel.wType == "Label" && widgetModel.textCopyable) ? "enableSelection" : "disableSelection";
            }
            return "";
        },

        getSplitSkinsBetweenWidgetAndParentDiv: function(widgetModel, context) {
            var splitSkins = new Array();
            var marginSkin = "";
            var paddingSkin = "";
            var weightSkin = "";
            if(widgetModel.wType == "HBox" || widgetModel.wType == "VBox") {
                weightSkin = this.getMarPadAdjustedContainerWeightSkin(widgetModel, 100)
            } else {
                weightSkin = module.getMarAdjustedContainerWeightSkin(widgetModel, 100);
            }
            var widgetSkin = this.getWidgetSkin(widgetModel, context);
            splitSkins[0] = marginSkin + " " + paddingSkin + " " + " " + widgetSkin + " ";
            splitSkins[1] = weightSkin;
            splitSkins[2] = marginSkin + " " + paddingSkin + " " + " " + widgetSkin + " " + weightSkin;

            return splitSkins;
        },

        getWidgetAlignmentSkin: function(widgetModel) {
            var alignment = (widgetModel.wType == "IGallery" ? "middleleftalign" : "middlecenteralign");
            if(widgetModel.wType == "HBox" || widgetModel.wType == "ScrollBox") {
                return this.getBoxAlignment(widgetModel);
            }
            return this.getAlignment(widgetModel.widgetalign || widgetModel.widgetalignment) || alignment;
        },

        getBlurStyle: function(widgetModel) {
            var filter = '', blur = widgetModel.flexblur,
                enabled = (blur) ? blur.enabled : false,
                value = (enabled) ? blur.value : 0;

            if(enabled) {
                value = (value < 0) ? 0 : (value > 100) ? 100 : value;

                if(value) {
                    filter = 'filter:blur(' + value + 'px);';
                }
            }

            return filter;
        },

        getAlignment: function(align) {
            switch(parseInt(align)) {
                case 1:
                    return "topleftalign";

                case 2:
                    return "topcenteralign";

                case 3:
                    return "toprightalign";

                case 4:
                    return "middleleftalign";

                case 5:
                    return "middlecenteralign";

                case 6:
                    return "middlerightalign";

                case 7:
                    return "bottomleftalign";

                case 8:
                    return "bottomcenteralign";

                case 9:
                    return "bottomrightalign";
            }
            return "";
        },

        
        getFlexContentAlignmentSkin: function(align) {
            switch(parseInt(align)) {
                case 1:
                    return "cnttopleftalign";

                case 2:
                    return "cnttopcenteralign";

                case 3:
                    return "cnttoprightalign";

                case 4:
                    return "cntmiddleleftalign";

                case 5:
                    return "cntmiddlecenteralign";

                case 6:
                    return "cntmiddlerightalign";

                case 7:
                    return "cntbottomleftalign";

                case 8:
                    return "cntbottomcenteralign";

                case 9:
                    return "cntbottomrightalign";
            }
            return "";
        },

        getContentAlignment: function(widgetModel, align) {
            var align = align || widgetModel.contentalignment;
            if(widgetModel.wType == "DataGrid") {
                return this.getAlignment(align);
            }
            switch(parseInt(align)) {
                case 1:
                case 4:
                case 7:
                    return "left";

                case 2:
                case 5:
                case 8:
                    return "center";

                case 3:
                case 6:
                case 9:
                    return "right";
            }
            return "left"; 
        },

        getBoxAlignment: function(widgetModel) {
            var widgetlayoutdirection = "middlecenteralign";
            if(widgetModel.wType == "VBox") {
                switch(parseInt(widgetModel.widgetdirection)) {
                    case 0:
                        widgetlayoutdirection = "topcenteralign";
                        break;
                    case 1:
                        widgetlayoutdirection = "middlecenteralign";
                        break;
                    case 2:
                        widgetlayoutdirection = "bottomcenteralign";
                        break;
                }
            } else {
                switch(parseInt(widgetModel.widgetdirection)) {
                    case constants.BOX_LAYOUT_ALIGN_FROM_LEFT:
                        widgetlayoutdirection = "middleleftalign";
                        break;
                    case constants.BOX_LAYOUT_ALIGN_FROM_CENTER:
                        widgetlayoutdirection = "middlecenteralign";
                        break;
                    case constants.BOX_LAYOUT_ALIGN_FROM_RIGHT:
                        widgetlayoutdirection = "middlerightalign";
                        break;
                }
            }
            return widgetlayoutdirection;
        },

        validateHexValue: function(value) {
            return(/(^[0-9A-F]{8}$)|(^[0-9A-F]{6}$)/i.test(value));
        },


        convertHexValuetoRGBA: function(value) {
            var r = value.charAt(0) + value.charAt(1);
            var g = value.charAt(2) + value.charAt(3);
            var b = value.charAt(4) + value.charAt(5);
            var a = 0;
            if(value.length == 6) {
                return "#" + r + g + b;
            }
            if(value.length > 6 && value.length <= 8)
                a = value.charAt(6) + value.charAt(7);

            r = parseInt(r, 16);
            g = parseInt(g, 16);
            b = parseInt(b, 16);
            a = ((100 - parseInt(a, 16)) / 100).toFixed(2);
            return "rgba(" + r + "," + g + "," + b + "," + a + ")";
        },

        
        applyBlockUISkin: function(model) {
            var scrolledHeight = $KW.Utils.getScrolledHeight();
            var viewPortHeight = $KW.Utils.getViewPortHeight();
            var currentViewPortPosition = viewPortHeight + scrolledHeight - 15;
            viewPortHeight = viewPortHeight / 2 + scrolledHeight;

            var viewPortWidth = $KW.Utils.getViewPortWidth();
            viewPortWidth = viewPortWidth / 2;

            
            


            
            var cachedEL = undefined
            var imgWidth = undefined;
            var imgHeight = undefined;

            
            if(!model) {
                if(!$KG.blockedSkinModel)
                    return;

                cachedEL = $KU.getElementById('blurDiv');
                if(!cachedEL) { 
                    console && console.error && kony.web.logger("error", 'wrong call . look into it');
                    return;
                }
                model = $KG.blockedSkinModel;
                imgWidth = $KG.blockedSkinWidth;
                imgHeight = $KG.blockedSkinHeight;
            }
            
            var blockUIDivElement = cachedEL || document.createElement("div");
            $KG.blockedSkinModel = model; 


            
            blockUIDivElement.id = "blurDiv";
            blockUIDivElement.className = model.blockeduiskin;

            var height = window.innerHeight;
            var tempHeight = screen.availHeight;
            blockUIDivElement.style.backgroundImage = "none";

            
            
            !cachedEL && document.body.appendChild(blockUIDivElement);

            
            var el = blockUIDivElement || $KU.getElementById("blurDiv");

            blockUIDivElement.style.backgroundImage = "";
            var progressindicatorposition = $KU.getStyle(el, "font-family");

            

            var heightofimage = imgHeight || $KU.getStyle(el, "height");
            var widthofimage = imgWidth || $KU.getStyle(el, "width");

            
            if(!imgHeight)
                $KG.blockedSkinHeight = heightofimage;

            if(!imgWidth)
                $KG.blockedSkinWidth = widthofimage;

            heightofimage = heightofimage.replace("px", "");
            widthofimage = widthofimage.replace("px", "");
            blockUIDivElement.style.width = "100%";

            

            var scrimHeight;
            if($KG["nativeScroll"]) {
                
                var mainContainerHeight = document.getElementById("__MainContainer").clientHeight;
                if(mainContainerHeight < (window.innerHeight || document.body.clientHeight))
                    scrimHeight = (window.innerHeight || document.body.clientHeight) + "px";
                else
                    scrimHeight = mainContainerHeight + "px";
            } else
                scrimHeight = "100%";
            blockUIDivElement.style.height = scrimHeight;

            if(progressindicatorposition == "Sans-Serif") 
            {
                el.style.backgroundImage = "";
                if(widthofimage != "auto")
                    el.style.backgroundPosition = (viewPortWidth - (widthofimage / 2)) + "px " + (scrolledHeight) + "px";
            } else if(progressindicatorposition == "Verdana") 
            {
                if(widthofimage != "auto")
                    el.style.backgroundPosition = (viewPortWidth - (widthofimage / 2)) + "px " + (viewPortHeight - (heightofimage / 2)) + "px";
            } else 
            {
                
                var yoffsetforbottom = $KW.Utils.getViewPortHeight() + scrolledHeight;
                if(widthofimage != "auto")
                    el.style.backgroundPosition = (viewPortWidth - (widthofimage / 2)) + "px " + (yoffsetforbottom - heightofimage) + "px";
            }

        },

        
        removeBlockUISkin: function() {
            
            $KG.blockedSkinModel = undefined;
            $KG.blockedSkinWidth = $KG.blockedSkinHeight = undefined;
            var blockingPlaceHolder = $KU.getElementById("blurDiv");
            blockingPlaceHolder && blockingPlaceHolder.parentNode.removeChild(blockingPlaceHolder);
        },

        
        updateDOMSkin: function(widgetModel, newSkin, oldSkin, element) {
            if(widgetModel.wType == "Phone") {
                var childElement = element.childNodes[0];
                $KU.removeClassName(childElement, oldSkin);
                $KU.addClassName(childElement, newSkin);
            }
            if(widgetModel.wType == "Switch") {
                if($KW.Switch.isCustomSwitch(widgetModel)) {
                    var switchState = ['on', 'off'][widgetModel.selectedIndex];
                    var switchTrackElement = element.childNodes[0];
                    $KU.removeClassName(switchTrackElement, oldSkin + switchState);
                    $KU.addClassName(switchTrackElement, newSkin + switchState);
                } else {
                    var switchOnElement = element.childNodes[0];
                    $KU.removeClassName(switchOnElement, oldSkin + 'on');
                    $KU.addClassName(switchOnElement, newSkin + 'on');
                    var switchOffElement = element.childNodes[2];
                    $KU.removeClassName(switchOffElement, oldSkin + 'off');
                    $KU.addClassName(switchOffElement, newSkin + 'off');
                }
            }
            
            if(widgetModel.wType == "ScrollBox") {
                while(element.parentNode.id != $KW.Utils.getKMasterWidgetID(widgetModel) + "_parent") {
                    element = element.parentNode;
                }
            }
            $KU.removeClassName(element, oldSkin);
            $KU.addClassName(element, newSkin);
        },

        
        updateFocusSkin: function(widgetModel, type) {
            if(widgetModel.isCloned == true && $KW.Utils.isBelongsToCollectionView(widgetModel)) {
                var containerModel = $KW.Utils.getContainerModel(widgetModel);
                $KW.CollectionView.Skin.applyWidgetFocusSkin(null, widgetModel, containerModel);
                return;
            }

            var focusskin = widgetModel[type];
            var focusskin2;
            if(widgetModel.wType === "TabPane")
                focusskin = widgetModel.activefocusskin;
            var classSelector, classSelector2;
            var wID = "#" + $KW.Utils.getKMasterWidgetID(widgetModel); 

            switch(widgetModel.wType) {
                case "TextArea":
                case "RichText":
                case "TextField":
                    classSelector = wID;
                    break;
                case "RadioButtonGroup":
                case "CheckBoxGroup":
                    classSelector = wID + ">div";
                    break;
                case "DataGrid":
                    classSelector = wID + " tbody tr";
                    break;
                case "Segment":
                    classSelector = wID + " [index]";
                    break;
                case "Calendar":
                    classSelector = wID;
                    break;
                case "HStrip":
                case "IGallery":
                    classSelector = wID + "_img";
                    break
                case "TabPane":
                    if(widgetModel.viewtype && (widgetModel.viewtype === 'tabview')) {
                        focusskin = focusskin + "lia";
                        focusskin2 = widgetModel.activefocusskin + "li";
                        classSelector = wID + "_Header li a";
                        classSelector2 = wID + "_Header li";
                    } else {
                        classSelector = wID + " div[active]";
                    }
                    break;
                case "MenuContainer":
                    classSelector = wID + " .KMenu li > div";
                    break;
                case "Link":
                    classSelector = wID;
                    break;
                default:
                    classSelector = wID;
            }
            var pseudo = (type == "focusskin" || type == "rowfocusskin") ? ":active" : ":hover";
            if((!$KU.isBlackBerryNTH) && (widgetModel.wType == "TextArea" || widgetModel.wType == "TextField"))
                pseudo = ":focus";

            classSelector += pseudo;
            module.applyStyle(focusskin, classSelector, widgetModel.wType);

            if(widgetModel.wType == 'MenuContainer') {
                module.applyStyle(focusskin, wID + " .KMenu li td > div:hover", widgetModel.wType);
            }
            if(widgetModel.viewtype && (widgetModel.viewtype == 'tabview')) {
                classSelector2 += pseudo;
                module.applyStyle(focusskin2, classSelector2);
            }
        },

        applyStyle: function(skin, classSelector, wType) {
            var styleSheetObjs = window.document.styleSheets;
            var konyStyleSheetIndex = module.getKonyStyleSheetIndex(styleSheetObjs);
            if(konyStyleSheetIndex != -1) {
                var styleSheetObj = styleSheetObjs[konyStyleSheetIndex];
                var skinRuleIndex = module.getClassIndex(styleSheetObj, skin, wType);
                module.removeCSSRule(styleSheetObj, classSelector, wType);
                if(skinRuleIndex != -1) {
                    var rules = styleSheetObj.cssRules || styleSheetObj.rules;
                    if(styleSheetObj.insertRule)
                        styleSheetObj.insertRule(classSelector + "{" + rules.item(skinRuleIndex).style.cssText + "}", rules.length);
                    else
                        styleSheetObj.addRule(classSelector, rules.item(skinRuleIndex).style.cssText);
                } else {
                    kony.print("Specified skin: " + skin + " is  not defined in kony.css");
                }
            } else {
                kony.print("Style class not found!");
            }
        },

        removeCSSRule: function(styleSheetObj, classSelector) {
            var elementFocusRuleIndex = module.getClassIndex(styleSheetObj, classSelector);
            
            if(elementFocusRuleIndex != -1) {
                if(styleSheetObj.deleteRule)
                    styleSheetObj.deleteRule(elementFocusRuleIndex);
                else
                    styleSheetObj.removeRule(elementFocusRuleIndex);
            }
        },

        getKonyStyleSheetIndex: function(styleObjs) {
            var category = $KG["imagecat"];
            for(var k = 0; k < styleObjs.length; k++) {
                var hrefObj = styleObjs[k].href;
                if(hrefObj) {
                    var cssurl = hrefObj && hrefObj.split('/');
                    var lastname = cssurl[cssurl.length - 1];
                    if(lastname && lastname.indexOf("kony") != -1 && lastname.indexOf("konyspaiphoneretina") == -1) {
                        if(category) {
                            if(hrefObj.match(category.substring(0, category.length - 1) + ".css"))
                                return k;
                        } else
                            return k;
                    }
                }
            }
            kony.web.logger("warn", "SPA Stylesheet could not be loaded");
            return -1;
        },

        getClassIndex: function(styleObj, className) {
            if(className.indexOf("#") == -1) 
                className = "." + className;
            var rules = styleObj.cssRules || styleObj.rules;
            for(var k = 0; k < rules.length; k++) {
                if(rules[k].selectorText == className) {
                    return k;
                }
            }
            return -1;
        },
    };


    return module;
}());
