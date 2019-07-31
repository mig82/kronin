
$KW.Form = (function() {
    
    var _newFormTransitionApplicable = function(model, type) {
        var applicable = false, transition = model[(type+'transitionconfig')];

        if(!transition) return applicable;

        if(typeof transition.formAnimation === 'number'
        || typeof transition.formanimation === 'number') {
            applicable = true;
        }

        return applicable;
    };

    var _normalizeTransition = {
        number: function(inConfig, outConfig) {
            var inTrans = {effect:'none', duration:'0.5s'},
                outTrans = {effect:'none', duration:'0.5s'};

            if(typeof inConfig.formAnimation === 'number') {
                inTrans.effect = inConfig.formAnimation.toString();
            } else if(typeof inConfig.formanimation === 'number') {
                inTrans.effect = inConfig.formanimation.toString();
            }
            if(inTrans.effect === '0') inTrans.effect = 'none';
            else inTrans.effect = $KW.formTransitionsMatrix[('anim'+inTrans.effect)];

            if(outConfig) {
                if(typeof outConfig.formAnimation === 'number') {
                    outTrans.effect = outConfig.formAnimation.toString();
                } else if(typeof outConfig.formAnimation === 'number') {
                    outTrans.effect = outConfig.formanimation.toString();
                }
            }
            if(outTrans.effect === '0') outTrans.effect = 'none';
            else outTrans.effect = $KW.formEndTransitionsMatrix[('anim'+outTrans.effect)];

            if(!inTrans.effect || inTrans.effect === 'none') inTrans = null;
            if(!outTrans.effect || outTrans.effect === 'none') outTrans = null;

            return {inTrans:inTrans, outTrans:outTrans};
        },

        string: function(inConfig) {
            var inTrans = {effect:'none', duration:'0.5s'},
                effect = inConfig.formTransition || inConfig.formtransition;

            if(!effect || effect === 'none') inTrans = null;
            else inTrans.effect = $KW.formTransitionsMatrix[effect];

            return {inTrans:inTrans, outTrans:null};
        }
    };
    

    var module = {
        initialize: function() {
            kony.events.addEvent("onorientationchange", "Form", this.orientationHandler);
        },

        initializeView: function(formId, isForm) {
            
            var widgetsSupported = [$KW.Label, $KW.Calendar, $KW.HStrip, $KW.Segment, $KW.ScrollBox, $KW.TabPane, $KW.Line, $KW.Switch, $KW.TextField, $KW.DataGrid, $KW.Media, $KW.MenuContainer, $KW.ComboBox, $KW.Slider, $KW.Map, $KW.FlexContainer, $KW.FlexScrollContainer, $KW.Browser, $KW.CollectionView, $KW.ListBox];
            for(var i = 0; i < widgetsSupported.length; i++) {
                if(widgetsSupported[i]) {
                    widgetsSupported[i].initializeView && widgetsSupported[i].initializeView(formId);
                }
            }
            if(isForm) {
                module.resizeForm(formId);
            }

        },

        updateView: function(formModel, propertyName, propertyValue, oldPropertyValue) {
            switch(propertyName) {
                case "title":
                    document.title = propertyValue || $KG.apptitle || $KG.appid;
                    formModel.i18n_title = "";
                    break;

                case "padding":
                    var element = document.getElementById(formModel.id);
                    if(!$KG.needScroller)
                        element && (element.style[propertyName] = $KU.joinArray(propertyValue, "% ") + "%");
                    break;
            }
        },

        orientationHandler: function(formId, orientation) {
            var formModel = $KG.allforms[formId];
            var formevntref = $KU.returnEventReference(formModel.preorientationchange);
            formevntref && $KU.executeWidgetEventHandler(formModel, formevntref, orientation);
            
            if(formModel) {
                spaAPM && spaAPM.sendMsg(formModel, 'onorientationchange', {
                    "orientation": orientation
                });
                var formref = $KU.returnEventReference(formModel.onorientationchange);
                formref && $KU.executeWidgetEventHandler(formModel, formref, orientation);
                module.setFormDimensions(formModel);
                module.initializeFlexContainers(formModel);
            }
        },

        setFormDimensions: function(formModel) {
            if($KW.FlexUtils.isFlexContainer(formModel)) {
                var formNode = document.getElementById(formModel.id);
                var scrollerNode = document.getElementById(formModel.id + "_scroller");
                if(formNode && scrollerNode) {
                    formNode.style.height = scrollerNode.offsetHeight + 'px';
                    
                }
            }
        },

        generateAppmenu: function(formModel) {
            var more_container = document.getElementById('appmenumore_container');
            if(more_container)
                more_container.parentNode.removeChild(more_container);
            if($KG.__appmenu && formModel.needappmenu)
                return $KW["Appmenu"] && $KW["Appmenu"].render($KG.__appmenu);
            else
                return "";
        },

        initializeTemplates: function(tempID) {
            $KW.touch.computeSnapWidths(tempID, "Segment");
            this.initializeTouchWidgets(tempID);
        },

        initializeTouchWidgets: function(formId, isForm) {
            $KW.Scroller.initializeScrollBoxes(formId); 
            $KW.Scroller.initializePageViews(formId); 
            this.initializeView(formId, isForm);
        },

        initializeFlexContainers: function(formModel) {
            $KG.isUILayedOut = false;
            if(!formModel)
                return;
            var formId = $KG.needScroller ? formModel.id + "_container" : formModel.id;
            $KW.touch.computeSnapWidths(formId, "Segment"); 
            this.initializeFlexContainersInTemplate(formModel);
            
            if($KG[formModel.id + '_scroller']) 
                $KW.Scroller.setHeight(formModel.id);
            this.initializeAllFlexContainers(formModel);
            $KG.isUILayedOut = true;
        },

        initializeFlexContainersInTemplate: function(formModel) {
            if(formModel.headers && formModel.headers.length > 0) {
                this.initializeBox(formModel.headers[0], $KG["needScroller"] ? formModel.id + "_header" : 'header_container');
            }
            if(formModel.footers && formModel.footers.length > 0) {
                this.initializeBox(formModel.footers[0], $KG["needScroller"] ? formModel.id + "_footer" : 'footer_container');
            }
        },

        initializeBox: function(boxModel, id){
            var flexNode;
            if(boxModel.wType == 'FlexContainer') {
                flexNode = document.querySelector('#' + id + ' div[kwidgettype="FlexContainer"]');
                if(flexNode) {
                    flexNode = flexNode.parentNode;
                }
                $KW.FlexContainer.forceLayout(boxModel, flexNode);
            } else {
                this.initializeFlexContainersInBox(boxModel);
            }
        },

        initializeAllFlexContainers: function(containerModel) {
            if($KW.FlexUtils.isFlexContainer(containerModel)) {
                containerModel.forceLayout();
                module.initializeAllFlexScrollContainers(containerModel);
                return;
            }
            this.initializeFlexContainersInBox(containerModel);
        },

        initializeAllFlexScrollContainers: function(formModel) {
            var flexNode, flexScrollModel, id, flexScrollElements, i, flexScrollNode;
            id = formModel.id;
            flexScrollElements = document.querySelectorAll('#' + id + ' div[kwidgettype="FlexScrollContainer"]');
            if(flexScrollElements) {
                for(i = 0; i < flexScrollElements.length; i++) {
                    flexScrollNode = flexScrollElements[i];
                    flexScrollModel = $KU.getModelByNode(flexScrollNode);
                    $KW.FlexContainer.forceLayout(flexScrollModel);
                }
            }
        },

        initializeFlexContainersInBox: function(boxModel) {
            var wArray = boxModel.ownchildrenref;
            var containerType = boxModel.wType;
            for(var i = 0; i < wArray.length; i++) {
                var widgetModel = wArray[i];
                var wType = widgetModel.wType;
                if(containerType == 'TabPane' && !$KW.TabPane.isActiveTab(boxModel, widgetModel)) {
                    if(boxModel.viewtype != constants.TABPANE_VIEW_TYPE_PAGEVIEW)
                        continue;
                }
                switch(wType) {
                    case "FlexContainer":
                    case "FlexScrollContainer":
                        widgetModel.forceLayout();
                        break;
                    case "Segment":
                        var segNode = $KU.getNodeByModel(widgetModel);
                        if(segNode) {
                            if(widgetModel.layoutConfig.self)
                                $KU.needOptimization = false;
                            widgetModel.isvisible && $KW.FlexContainer.adjustFlexContainers(widgetModel, segNode);
                            if(widgetModel.viewtype == constants.SEGUI_VIEW_TYPE_PAGEVIEW)
                                $KW.touch.computeWidths(segNode, widgetModel);
                            $KU.needOptimization = true;
                        }
                        break;
                }

                if((widgetModel.wType == 'HBox' || widgetModel.wType == 'VBox' || widgetModel.wType == 'TabPane' || widgetModel.wType == 'ScrollBox') && widgetModel.ownchildrenref) {
                    this.initializeFlexContainersInBox(widgetModel);
                }
            }
        },

        updateContaineri18nProperties: function(formModel) {
            if(formModel.headers && formModel.headers.length > 0) {
                for(var header in formModel.headers) {
                    $KI.i18n.translateFormModel(formModel.headers[header]);
                }
            }

            if(formModel.footers && formModel.footers.length > 0) {
                for(var footer in formModel.footers) {
                    $KI.i18n.translateFormModel(formModel.footers[footer]);
                }
            }
        },

        destroyTouchWidgets: function(formId, isNonForm) {
            if(!isNonForm)
                $KW.Scroller.destroyFormScroller(formId);
            $KW.Scroller.destroyScrollBoxes(formId);
            $KW.Scroller.destroyCollectionViewScroller(formId);
            $KW.Scroller.destroyImageStripStripViews(formId);
            $KW.Scroller.destroyPageViews(formId);
        },

        formRendered: function(formId) {
            kony.events.browserback.updateURLWithLocation(formId);
            module.enlistSystemTimerActions();
            if($KU.isWindowsPhone && $KU.isIE9)
                window.scrollTo(0, 0);
            else if($KG.nativeScroll)
                window.scrollTo(0, 1);
        },

        resizeForm: function(formId, orientation) {
            var formModel = $KG.allforms[formId];
            
            if($KG["nativeScroll"]) {
                var viewPortHeight = ($KU.isWindowsPhone && $KU.getPlatform().version == "7.5") ? ($KW.Utils.getViewPortHeight() + 10) : $KW.Utils.getViewPortHeight();
                document.body.style.minHeight = viewPortHeight + "px";
            }

            if(kony.appinit.isTablet && kony.appinit.isAndroid && (kony.constants.APPLICATION_MODE_HYBRID || kony.constants.APPLICATION_MODE_WRAPPER)) {
                document.body.style.minHeight = (screen.height / window.devicePixelRatio - window.screenTop) + 'px';
            }

            if(formModel.resizeForm && $KG["nativeScroll"]) {
                var windowHeight = window.innerHeight || document.body.clientHeight;
                var formNode = document.getElementById(formId);
                var totalHeight, formHeight;

                var totalHeight = __MainContainer.clientHeight;
                var formHeight = formNode.clientHeight;

                
                if(!orientation) {
                    totalHeight = __MainContainer.__clientHeight = __MainContainer.clientHeight;
                    formHeight = formNode.__clientHeight = formNode.clientHeight;
                } else {
                    totalHeight = __MainContainer.__clientHeight;
                    formHeight = formNode.__clientHeight;
                }

                
                if(totalHeight < windowHeight) {
                    var bias = windowHeight - totalHeight;
                    formHeight = formHeight + bias;
                    formNode.style.minHeight = formHeight + "px";

                    if($KU.isWindowsPhone && $KU.isIE9)
                        setTimeout(function() {
                            window.scrollTo(0, 0)
                        }, 10);
                    else
                        setTimeout(function() {
                            window.scrollTo(0, 1)
                        }, 10);
                }
            }
        },

        enlistSystemTimerActions: function() {
            
            if($KU.hashChange) {
                kony.events.addEventListener(window, 'hashchange', kony.events.browserback.handleBrowserBackEvent);
            } else {
                var browserBackAction = new kony.system.timers.TimerAction(kony.events.browserback.handleBrowserBackEvent, 300);
                kony.system.timers.registerTimerAction(browserBackAction);
            }
        },

        delistSystemTimerActions: function() {
            kony.system.timers.clearTimerAction();
        },

        addChild: function(formModel, wArray, bVisibility) {
            if(($KG["__currentForm"] && formModel.id == $KG["__currentForm"].id) || formModel.wType == 'Popup') {

                var formNode = $KU.getElementById(formModel.id);


                if(!formNode)
                    return;
                $KU.updatei18nProperties(wArray);
                var htmlString = "";
                if(wArray.length > 0) {
                    htmlString = this.renderChildren(formModel, wArray);
                }

                
                var screenlLevelWidgetModel = $KU.getScreenLevelWidgetModel(formModel);
                
                if(screenlLevelWidgetModel && (screenlLevelWidgetModel.containerheight == null || !(screenlLevelWidgetModel.containerheight >= 0))) {
                    formNode.innerHTML = htmlString;
                } else {
                    var wrapper = document.createElement("div");
                    wrapper.innerHTML = htmlString;
                    if(bVisibility) {
                        formNode.innerHTML = htmlString;
                    } else {
                        while(wrapper.children.length > 0) {
                            formNode.appendChild(wrapper.children[0]);
                        }
                    }
                }
                $KU.layoutNewWidgets(formModel, wArray);
                $KW.Utils.initializeNewWidgets(wArray);
            }
        },

        addChildAt: function(formModel, widget, index) {
            if(($KG["__currentForm"] && formModel.id == $KG["__currentForm"].id) || formModel.wType == 'Popup') {
                var formNode = $KU.getElementById(formModel.id);


                if(!formNode)
                    return;
                $KU.updatei18nProperties(wArray);
                var screenlLevelWidgetModel = $KU.getScreenLevelWidgetModel(formModel);
                var screenlLevelWidgetNode = $KU.getNodeByModel(screenlLevelWidgetModel);
                if(screenlLevelWidgetNode)
                    return;

                var htmlString = "";
                var isFlexContainer = $KW.FlexUtils.isFlexContainer(formModel);
                if(isFlexContainer)
                    htmlString = $KW.FlexContainer.renderChildren(formModel, [formModel[widget.id]], {});
                else
                    htmlString = module.generateWidget(formModel, formModel[widget.id]);

                
                var outerDiv = document.createElement("div");
                outerDiv.innerHTML = htmlString;
                var wArray = [widget];
                if(screenlLevelWidgetModel) {
                    formNode.innerHTML = htmlString;
                    $KW.Scroller.destroyFormScroller(formNode.id);
                    $KW.Utils.initializeNewWidgets(wArray);
                    return;
                }

                formNode.insertBefore(outerDiv.childNodes[0], formNode.children[index] || null);
                $KU.layoutNewWidgets(formModel, wArray);
                $KW.Utils.initializeNewWidgets(wArray);
            }
        },

        DOMremove: function(formModel, widgetref) {
            if($KG["__currentForm"] && (formModel.id == $KG["__currentForm"].id || formModel.wType == 'Popup') && widgetref) {
                var isFlexContainer = $KW.FlexUtils.isFlexContainer(formModel);
                if(isFlexContainer) {
                    var node = $KW.Utils.getWidgetNode(widgetref);
                    if(node) {
                        node = node.parentNode;
                        node.parentNode.removeChild(node);
                    }
                } else {
                    var node = document.getElementById(formModel.id + "_" + widgetref.id);
                    if(node) {
                        node = $KU.returnParentChildBloatAdjustedNode(widgetref, node);
                        node.parentNode.removeChild(node);
                    }
                }
            }
        },

        DOMremoveAt: function(formModel, index) {
            module.DOMremove(formModel, formModel.ownchildrenref[index]);
        },

        DOMremoveAll: function(formModel) {
            var form = document.getElementById(formModel.id);
            if(form) {
                form.innerHTML = "";
            }
        },

        
        add: function() {
            var formmodel = arguments[0];
            if("add" in formmodel) {
                var widarray = [].slice.call(arguments, 1);
                formmodel.add(widarray)
            }
        },

        addAt: function(formModel, widgetref, index) {
            if(widgetref == null) return;
            formModel.addAt && formModel.addAt(widgetref, index);
        },

        remove: function(formModel, widgetref) {
            formModel.remove && formModel.remove(widgetref);
        },

        removeAt: function(formModel, index) {
            if(formModel.removeAt)
                return formModel.removeAt(index);
        },

        widgets: function(formModel) {
            return formModel.widgets && formModel.widgets();
        },

        scrollToBeginning: function(formModel) {
            var scrollerInstance = $KG[$KG["__currentForm"].id + '_scroller'];
            var top = ($KU.isWindowsPhone && $KU.isIE9) ? 0 : 1;
            scrollerInstance ? scrollerInstance.scrollTo(0, scrollerInstance.minScrollY, 500) : $KW.Utils.scrollToElement(null, 500, null, top);
        },

        scrollToEnd: function(formModel) {
            var scrollerInstance = $KG[$KG["__currentForm"].id + '_scroller'];
            scrollerInstance ? scrollerInstance.scrollTo(0, scrollerInstance.maxScrollY, 500) : $KW.Utils.scrollToElement(null, 500, null, document.body.scrollHeight - (!($KU.isWindowsPhone && $KU.isIE9) ? (window.innerHeight || document.body.clientHeight) : 0));
        },

        scrollToWidget: function(formref, widgetref) {
            $KW.APIUtils.setfocus(widgetref);
        },

        destroy: function(formID) {
            if(formID && "destroy" in formID) formID.destroy();
        },


        getCurrentForm: function() {
            $KU.logExecuting('kony.application.getCurrentForm');
            $KU.logExecutingWithParams('kony.application.getCurrentForm');
            $KU.logExecutingFinished('kony.application.getCurrentForm');
            return $KG["__currentForm"];
        },

        getPreviousForm: function() {

            $KU.logExecuting('kony.application.getPreviousForm');
            $KU.logExecutingWithParams('kony.application.getPreviousForm');
            $KU.logExecutingFinished('kony.application.getPreviousForm');
            return $KG["__previousForm"];
        },

        
        handleshow: function(formModel) {
            if("show" in formModel)
                formModel.show();
        },

        
        generateWidget: function(formModel, childModel) {
            var context = new $KW.WidgetGenerationContext(formModel.id);
            var childType = childModel.wType;
            var htmlString = "";

            
            if(childType == "Line" || childType == "HBox" || childType == "ScrollBox" || childType == "TabPane" || childType == "FlexContainer" || childType == "FlexScrollContainer") {
                context.setTopLevelBox(true);
                htmlString += $KW[childType] && $KW[childType].render(childModel, context);
            } else {
                htmlString += "<div class = 'ktable kwt100' style='table-layout:fixed;'>";
                htmlString += "<div class = 'krow kwt100' >";
                
                if(childType == "Image")
                    childModel.containerweight = 100;
                var layoutDirection = $KW.skins.getWidgetAlignmentSkin(childModel);
                htmlString += "<div class = 'kcell kwt100 " + layoutDirection + "' " + (formModel.wType == "Popup" ? style = "'" + $KW.skins.getChildMarginAsPaddingSkin(childModel) + "'" : "") + ">";
                htmlString += $KW[childType] && $KW[childType].render(childModel, context);
                htmlString += "</div></div></div>";
            }
            return htmlString;
        },



        
        render: function(formModel) {
            var htmlString = "";
            var formId = formModel.id.trim();
            this.createFormSkeleton(formModel);
            var isForm = (formModel.wType == "Form") ? true : false;

            var header_wrapper, form_wrapper, footer_wrapper, appmenu_wrapper;

            if($KG.needScroller) {
                header_wrapper = $KU.getElementById(formId + "_header");
                footer_wrapper = $KU.getElementById(formId + "_footer");
            } else {
                header_wrapper = isForm ? document.querySelector("#__MainContainer>#header_container") : document.querySelectorAll('#' + formModel.id + "_group #header_container")[0];
                footer_wrapper = isForm ? document.querySelector("#__MainContainer>#footer_container") : document.querySelectorAll('#' + formModel.id + "_group #footer_container")[0];
            }

            form_wrapper = $KU.getElementById(formId);
            isForm && (appmenu_wrapper = $KU.getElementById("appmenu_container"));

            
            var headerStr = this.generateHeader(formModel, "header");
            

            
            if($KG["__previousForm"]) {
                var prevformhintid = $KG["__previousForm"].id + "-hint";
                var hintwraper = document.getElementById(prevformhintid);
                if(hintwraper) {
                    document.body.removeChild(hintwraper);
                }
            }

            
            var formStr = this.generateForm(formModel);
            form_wrapper.innerHTML = formStr;

            
            var footerStr = this.generateHeader(formModel, "footer");
            footer_wrapper.innerHTML = footerStr;

            
            if(isForm) {
                var appmenuStr = this.generateAppmenu(formModel);
                appmenu_wrapper.innerHTML = appmenuStr;
                var appmenuNode = $KU.getElementById("konyappmenudiv");
                if(appmenuNode && !$KG["nativeScroll"] && $KU.isIOS7)
                    appmenuNode.style.position = "fixed";
            }

            if($KW.Map && $KW.Map.isMainContaineraVailable == false)
                $KW.Map.loadMapScripts();

            header_wrapper.innerHTML = headerStr;

            
            (headerStr && formModel.header) && this.initializeTemplates(formModel.header);
            (footerStr && formModel.footer) && this.initializeTemplates(formModel.footer);

            if(isForm) {
                
                document.title = ($KI.i18n && $KI.i18n.getI18nTitle(formModel)) || $KG.apptitle || $KG.appid;

                if(($KU.isWindowsPhone || $KU.isWindowsTablet) && !$KG.nativeScroll)
                    if($KU.isEdge)
                        document.documentElement.style.touchAction = "none";
                    else
                        document.documentElement.style.msTouchAction = "none";
                else
                    document.documentElement.style.msTouchAction = "auto";
            }
            $KU.deduceTopLevelFlexModal(formModel);
        },

        setMainContainerStyle: function(formModel) {
            if($KG["nativeScroll"]) {
                var main = $KU.getElementById("__MainContainer");
                if(!main)
                    return;
                if($KW.FlexUtils.isFlexContainer(formModel)) {
                    main.style.position = 'absolute';
                    main.style.width = '100%';
                    main.style.height = '100%';
                } else {
                    main.style.position = 'static';
                    main.style.height = 'auto';
                }
            }
        },

        createFormSkeleton: function(formModel) {
            
            var formId = formModel.id;
            var mainContainer = document.getElementById("__MainContainer");
            var isForm = (formModel.wType == "Form") ? true : false;
            var style = "";
            var className = "";
            var htmlString = "";

            if($KG.needScroller)
                className = "absoluteContainer";
            else
                className = (!isForm && $KG.nativeScroll) ? "" : (formModel.skin || "");

            className += " hidden " + (isForm ? "" : "absoluteContainer popupcontainer popupmain");


            if(!isForm) {
                var width = $KW.skins.getMarPadAdjustedContainerWeightSkin(formModel).substr(3);
                style += "width:" + width + "% !important;";
            }

            
            if($KG.needScroller || !isForm) {
                htmlString += "<div id='" + formModel.id + "_container' class='" + className + "'" + (!isForm && !formModel.ismodal ? "style='" + style + "'" : "") + ">";

                if(!isForm) {
                    var opacity = 1 - (formModel.transparencybehindthepopup / 100);
                    var bgcolor = (formModel.ismodal == true && formModel.popupbgcolor) ? "background-color:" + formModel.popupbgcolor : "";
                    htmlString += "<div id='__popuplayer' style='opacity:" + opacity + ";" + bgcolor + "'" + (formModel.ismodal == false && !(formModel.ptran || formModel.ptranOut) && formModel.context ? "" : " class='absoluteContainer popuplayer'") + "></div>"

                    if(!formModel.ismodal) {
                        style = "z-index:8;width:100%;";
                        if(formModel.containerheight)
                            style += "height:100%";
                    }
                    className = $KG.nativeScroll ? (formModel.skin || "") : "";
                    htmlString += "<div id='" + formModel.id + "_group' class='" + className + "' style='" + style + ";position: absolute;' kformname='" + formModel.id + "' kwidgettype='Popup'></div>";
                }

                htmlString += "</div>";

                var div = document.createElement('div');
                div.innerHTML = htmlString;
                mainContainer.appendChild(div.childNodes[0]);
            }

            if(!formModel.dockableheader && $KG.needScroller)
                this.generateScroller(formModel);

            this.generateHeaderWrapper(formModel, "header");
            if(formModel.dockableheader == true && $KG.needScroller)
                this.generateScroller(formModel);
            this.generateFormWrapper(formModel);
            this.generateHeaderWrapper(formModel, "footer");
            isForm && this.generateAppmenuWrapper(formModel);
        },

        generateHeaderWrapper: function(formModel, type) {
            var isForm = (formModel.wType == "Form") ? true : false;
            if(isForm && ($KG.nativeScroll || $KG.useMixedScroll)) {
                var container = isForm ? document.querySelector("#__MainContainer>#" + type + "_container") : document.querySelector('.popupcontainer #' + type + '_container');
                if(container) {
                    container.parentNode.removeChild(container);
                }
            }

            
            var formId = formModel.id;
            var dockable = true;
            if((type == "header" && !formModel.dockableheader) || (type == "footer" && !formModel.dockablefooter))
                dockable = false;

            var className = type + "_scroller";
            if($KG["nativeScroll"] || !dockable)
                className += " relativePos";
            else
                className += " absolutePos";

            var div = document.createElement('div');
            div.setAttribute('id', $KG.needScroller ? formId + "_" + type : type + "_container");
            div.setAttribute("kformname", formId);
            div.className = className;

            var formContainer;

            if(!isForm)
                formContainer = document.getElementById(formId + "_group");
            else if($KG.needScroller)
                formContainer = document.getElementById(dockable ? formId + "_container" : formId + "_scrollee");
            else
                formContainer = document.getElementById(formId + "_scrollee");

            if($KG.nativeScroll && isForm)
                formContainer = document.getElementById("__MainContainer");

            formContainer.appendChild(div);
        },

        generateScroller: function(formModel) {
            var htmlString = "";
            var style = "";
            var formId = formModel.id;
            var skin = formModel.skin || "";
            var isForm = (formModel.wType == "Form") ? true : false;

            htmlString += "<div  id='" + formId + "_wrapper'>";

            
            if($KU.isAndroid && ($KG["appmode"] == constants.APPLICATION_MODE_HYBRID || $KG["appmode"] == constants.APPLICATION_MODE_WRAPPER)) {
                style = "style='overflow:visible;'";
            }

            var swipeDirection = (formModel.layouttype == kony.flex.VBOX_LAYOUT) ? "vertical" : $KW.stringifyScrolldirection[formModel.scrolldirection];
            htmlString += "<div  id='" + formId + "_scroller' class='form_scroller " + skin + "' kwidgettype='KFormScroller' name='touchcontainer_KScroller' widgetType='form' swipeDirection ='" + swipeDirection + "'" + style + (!isForm ? " kformname='" + formId + "'" : "") + ">";
            htmlString += "<div id='" + formId + "_scrollee' class='form_scrollee' kwidgettype='KTouchscrollee' style='" + (formModel.layouttype != kony.flex.VBOX_LAYOUT ? "height:100%" : "") + "'>";
            htmlString += "</div></div>";

            htmlString += "</div>";

            var div = document.createElement('div');
            div.innerHTML = htmlString;

            var formContainer;
            if(isForm)
                formContainer = document.getElementById(formId + "_container");
            else
                formContainer = document.getElementById(formId + "_group");

            formContainer.appendChild(div.childNodes[0]);
        },

        generateFormWrapper: function(formModel) {
            var htmlString = "";
            var formId = formModel.id;
            var isForm = (formModel.wType == "Form") ? true : false;
            var flexStyle = (formModel.layouttype != kony.flex.VBOX_LAYOUT ? ";position:relative;height:100%;" : "");
            
            var style = "style='border:none;table-layout:fixed;" + $KW.skins.getPaddingSkin(formModel) + flexStyle + ";'";
            var layoutClass = "";

            if($KG.nativeScroll) {
                layoutClass = "form_nativeScroller ";
                if($KU.isWindowsPhone && $KU.isIE9)
                    layoutClass += " hidden ";
            }

            var fClass = "class='" + "kwt100 " + layoutClass + "'";

            if(isForm)
                htmlString += "<form id='" + formId + "' action='javascript:;' " + fClass + " " + style + "></form>";
            else {
                htmlString += "<form kwidgettype='Popup' id='" + formId + "' action='javascript:;'" + " class='kwt100' style='z-index:9;" + $KW.skins.getPaddingSkin(formModel) + ((!formModel.context || !formModel.context.dockable) ? "xmax-height:80%;xoverflow:auto;xposition: absolute;" : "overflow-x:hidden;overflow-y:auto;xposition:relative;") + "" + (!formModel.skin ? "background-color:white" : "") + flexStyle + "'>";
            }

            var div = document.createElement('div');
            div.innerHTML = htmlString;

            if($KG.nativeScroll) {
                if(isForm)
                    formContainer = document.getElementById("__MainContainer");
                else
                    formContainer = document.getElementById(formId + "_group");
            } else
                formContainer = document.getElementById(formId + "_scrollee");

            formContainer.appendChild(div.childNodes[0]);
        },

        generateAppmenuWrapper: function(formModel) {
            
            var appmenu_container = document.getElementById("appmenu_container");
            if(appmenu_container)
                appmenu_container.parentNode.removeChild(appmenu_container);
            var more_container = document.getElementById('appmenumore_container');
            if(more_container)
                more_container.parentNode.removeChild(more_container);

            var div = document.createElement("div");
            div.id = "appmenu_container";
            var parentContainer;
            if(!formModel.dockableappmenu && $KG.needScroller)
                parentContainer = document.getElementById(formModel.id + "_scrollee")
            else
                parentContainer = document.getElementById("__MainContainer");
            parentContainer.appendChild(div);
        },

        generateForm: function(formModel) {
            var htmlString = "";
            var wArrary = formModel.widgets();
            if(wArrary.length > 0)
                return this.renderChildren(formModel, wArrary);
            return htmlString;
        },

        renderChildren: function(formModel, wArrary) {
            var htmlString = "";
            var screenlLevelWidgetModel = $KU.getScreenLevelWidgetModel(formModel);
            
            if(screenlLevelWidgetModel && (screenlLevelWidgetModel.containerheight == null || !(screenlLevelWidgetModel.containerheight >= 0))) {
                return module.generateWidget(formModel, screenlLevelWidgetModel);
            }
            if(formModel.layouttype == kony.flex.VBOX_LAYOUT) {
                for(var i = 0; i < wArrary.length; i++) {
                    var childModel = wArrary[i];
                    htmlString += module.generateWidget(formModel, childModel);
                }
            } else {
                htmlString += $KW.FlexContainer.renderChildren(formModel, wArrary, {});
            }
            return htmlString;
        },

        generateHeader: function(formModel, type) {
            var htmlString = "";
            var headerID = formModel[type];

            if(headerID)
                return this.generateTemplate(headerID, type);
            else
                return "";
        },

        
        generateTemplate: function(headerID, type, context) {
            var headerModel = kony.model.getWidgetModel(headerID) || headerID;
            var htmlString = "",
                context = context || new $KW.WidgetGenerationContext(headerModel.id),
                childModel;
            if(headerModel.children) {
                if(context && context.template_generator && typeof context.template_generator == "object") {
                    return $KW[context.template_generator.wType].render(headerModel, context);
                }
                
                for(var i = IndexJL; i < headerModel.children.length; i++) {
                    childModel = headerModel[headerModel.children[i]];
                    context.setTopLevelBox(true);
                    htmlString += $KW[childModel.wType].render(childModel, context);
                }
                
            }
            return htmlString;
        },

        checkBackwardCompatibility: function(formModel) {
            var isForm = formModel.wType;
            
            if((formModel.dockableheader == undefined && formModel.header) || $KG.nativeScroll)
                formModel.dockableheader = true;
            if((formModel.dockablefooter == undefined && formModel.footer) || $KG.nativeScroll)
                formModel.dockablefooter = true;
            if(isForm && ((formModel.dockableappmenu == undefined && formModel.needappmenu) || $KG.nativeScroll))
                formModel.dockableappmenu = true;
            if(($KG.useMixedScroll && formModel.renderinnative == undefined) || $KG.nativeScroll)
                formModel.renderinnative = true;
        },

        show: function(formModel) {
            if($KG["localization"] && !$KG["i18nInitialized"])
                $KI.i18n.setdefaultlocale($KG["defaultlocale"], null, null, module.extendShow(formModel));
            else
                module.extendShow(formModel)();
        },

        extendShow: function(formModel) {
            return function() {

                
                
                

                function checkformmode(form) {
                    
                    if($KG["appmode"] == constants.APPLICATION_MODE_HYBRID) {
                        
                        if(internal && (form.type == constants.FORM_TYPE_NATIVE)) {
                            kony.print("checkformmode: nativeformid : " + form.id);
                            internal.shownativeform(form.id);
                            return false;
                        } else {
                            if(internal && (form.type == constants.FORM_TYPE_DYNAMIC)) {
                                kony.print("checkformmode: dynamicformid : " + form.id);
                                internal.showdynamicform(form.id)
                                return false;

                            } else if(form.type == constants.FORM_TYPE_STATIC) {
                                kony.print("------shell status: " + internal.isshellinbackground());

                                if(internal && internal.isshellinbackground && internal.isshellinbackground()) {
                                    kony.print("checkformmode: shellinbackground for form : " + form.id);
                                    form.callspaform = true;
                                    
                                    if(form.isfromBrowserBack) {
                                        form.callspaform = false;
                                    }
                                }
                                kony.print("checkformmode: shellinforeground for form : " + form.id);
                                return true;
                            }
                            kony.print("checkformmode: Invalid Form Type");
                            return false;
                        }
                    } else
                        return true;
                };

                if(checkformmode(formModel)) {
                    
                    module.checkBackwardCompatibility(formModel);
                    $KU.createa11yDynamicElement();

                    
                    if(formModel.enabledforidletimeout && $KG["__idletimeout"] && $KG["__idletimeout"].expired && $KG["__idletimeout"].enabled) {
                        $KG["__idletimeout"].cb && $KG["__idletimeout"].cb(formModel);
                        $KG["__idletimeout"].cb = null;
                        $KG["__idletimeout"].expired = false;
                        $KG["__idletimeout"].enabled = false;
                        return;
                    }

                    
                    if($KG["__currentForm"]) {
                        $KW.Popup && $KW.Popup.dismiss(null, true);
                        $KW.unLoadWidget();
                    }

                    var curForm = $KG["__currentForm"];
                    if(curForm && curForm.id != formModel.id) {
                        kony.events.executeActionOnContainer(curForm, "onhide", false);
                        spaAPM && spaAPM.sendMsg(curForm, 'onhide');
                    }
                    if(curForm && curForm.onhide && curForm.id != formModel.id) {
                        var curref = $KU.returnEventReference(curForm.onhide);
                        curref && $KU.executeWidgetEventHandler(curForm, curref);
                    }

                    if($KG["__currentForm"])
                        $KG["__previousForm"] = $KG["__currentForm"];

                    var rendered = false;
                    kony.isformRendered = false;
                    $KG["__currentForm"] = formModel;

                    var prevForm = $KG["__previousForm"];
                    if(prevForm && prevForm.id == formModel.id) {
                        kony.isformRendered = true;
                        rendered = true;
                    }

                    if(formModel.preshow) {
                        var preref = $KU.returnEventReference(formModel.preshow);
                        $KU.executeWidgetEventHandler(formModel, preref);
                    }
                    kony.events.executeActionOnContainer(formModel, "preshow", true);

                    
                    if(!rendered) {
                        if($KG["localization"]) {
                            $KI.i18n.translateFormModel(formModel);
                            module.updateContaineri18nProperties(formModel);
                        }

                        
                        if(prevForm) {
                            if(prevForm.retainscrollposition) {
                                var prevFormScroller = $KG[prevForm.id + "_scroller"];
                                
                                if(prevFormScroller)
                                    prevForm.__y = prevFormScroller.y;
                                else
                                    prevForm.__y = document.body.scrollTop || document.documentElement.scrollTop;
                            }
                            module.destroyTouchWidgets($KG.needScroller ? prevForm.id + "_container" : prevForm.id);
                        }
                        

                        
                        
                        if($KG.useMixedScroll) {
                            if(formModel.renderinnative && ((!formModel.dockableheader && !formModel.dockablefooter && !(formModel.needappmenu && formModel.dockableappmenu)) || (!formModel.header && !formModel.footer && !($KG.__appmenu && formModel.needappmenu)))) {
                                $KG.needScroller = false;
                                $KG.nativeScroll = true;
                            } else {
                                $KG.needScroller = true;
                                $KG.nativeScroll = false;
                            }
                        }

                        
                        var formId = $KG.needScroller ? formModel.id + "_container" : formModel.id;

                        module.setMainContainerStyle(formModel);
                        module.render(formModel);
                        module.formRendered(formModel.id);

                        
                        $KW.Scroller.initializeFormScroller(formId);

                        module.initializeFlexContainers(formModel);


                        module.initializeTouchWidgets(formModel.id, true);
                        module.applyTransition($KG["__previousForm"], formModel);
                        
                        
                        var wrapperDiv = document.getElementById('splashDiv');
                        if(wrapperDiv)
                            wrapperDiv.parentElement.removeChild(wrapperDiv);
                        if(!kony.system.activity.hasActivity()) {
                            $KW.skins.removeBlockUISkin();
                            $KW.unLoadWidget();
                        }
                        if(appConfig.testAutomation && window.jasmineOnload) {
                            window.jasmineOnload();
                        }
                        if(kony.constants.APPSTATE == 0) {
                            kony.constants.APPSTATE = 1;
                            
                            kony.events.registerDocumentEvents();
                        }
                        kony.isformRendered = true;
                    } else {
                        var formId = $KG.needScroller ? formModel.id + "_container" : formModel.id;
                        
                        $KW.Scroller.destroyFormScroller(formId);
                        $KW.Scroller.initializeFormScroller(formId);

                        if($KU.isWindowsPhone && $KU.isIE9)
                            window.scrollTo(0, 0);
                        else if($KG.nativeScroll)
                            window.scrollTo(0, 1);

                        kony.events.executeActionOnContainer(formModel, "postshow", false);
                        spaAPM && spaAPM.sendMsg(formModel, 'show');
                        if(formModel.postshow) {
                            var postref = $KU.returnEventReference(formModel.postshow);
                            postref && $KU.executeWidgetEventHandler(formModel, postref);
                        }
                        $KW.FlexUtils.isFlexContainer(formModel) && formModel.forceLayout();
                        if(spaAPM && typeof appStartTime !== "undefined") {
                            var curTime = new Date().getTime();
                            var timeDiff = curTime - appStartTime;
                            spaAPM.sendMsg(formModel, 'AppLoad', {
                                "loaddur": timeDiff
                            });
                        }
                    }

                    module.accessibilityTitleCall(formModel);

                    $KW.TPW.renderWidget(formModel.id);

                    if(formModel.callspaform) {
                        kony.print("@@@@ invoking internal.showspaform : " + formModel.id);
                        internal.showspaform(formModel.id);
                        formModel.isfromBrowserBack = false;
                        formModel.callspaform = false;
                    }

                    formModel.initialized = true;
                }
            }
        },

        accessibilityTitleCall: function(formModel, isPopup) {
            var accessObj = formModel.accessibilityConfig;
            var title = accessObj ? accessObj.a11yLabel : "";
            title && $KU.changea11yDynamicElement(title);
        },

        applyTransition: function(previousForm, currentForm) {
            var src, dest;

            previousForm && (src = $KU.getElementById(previousForm.id + "_container") || $KU.getElementById(previousForm.id));
            dest = $KU.getElementById(currentForm.id + "_container") || $KU.getElementById(currentForm.id);

            var outTrans, inTrans;
            outTrans = (previousForm && previousForm.outtransitionconfig) ? previousForm.outtransitionconfig.formTransition || previousForm.outtransitionconfig.formtransition : '';
            inTrans = (currentForm.intransitionconfig) ? currentForm.intransitionconfig.formTransition || currentForm.intransitionconfig.formtransition : '';

            if(!$KG["disableTransition"] && ((inTrans && inTrans.toLowerCase() !== "none") || (outTrans && outTrans.toLowerCase() !== "none"))) {
                var outTransAnimation, inTransAnimation;
                if(!inTrans || inTrans.toLowerCase() == "none")
                    inTransAnimation = $KW.formTransitionsMatrix[outTrans];
                else
                    inTransAnimation = $KW.formTransitionsMatrix[inTrans];

                if(!outTrans || outTrans.toLowerCase() == "none")
                    outTransAnimation = $KW.formEndTransitionsMatrix[inTrans];
                else
                    outTransAnimation = $KW.formEndTransitionsMatrix[outTrans];

                if(src) {
                    src.style.zIndex = 1;
                }
                if(dest) {
                    dest.style.zIndex = 2;
                    var ev = (kony.appinit.isFirefox || kony.appinit.isIE11) ? "animationend" : $KU.animationEnd;
                    currentForm.__ev = function(srcForm, destForm, currForm, prevForm, ev) {
                        return function(event) {
                            if(!event)
                                event = window.event;
                            currForm.__ev = "";
                            if(event.type == ev) {
                                kony.events.removeEventListener(destForm, event.type, arguments.callee);
                                this.style[$KU.animationName] = "";
                            }
                            module.endTransition(srcForm, destForm, currForm, prevForm);
                        }
                    }(src, dest, currentForm, previousForm, ev);

                    kony.events.addEventListener(dest, ev, currentForm.__ev);


                    
                    
                    if(src) {
                        src.style[$KU.animationDuration] = "0.5s";
                        src.style[$KU.animationName] = outTransAnimation;
                    }
                    
                    dest.style[$KU.animationDuration] = "0.5s";
                    dest.style[$KU.animationName] = inTransAnimation;

                    $KU.removeClassName(dest, "hidden");
                    dest.style.display = "";
                }
            } else {
                $KU.removeClassName(dest, "hidden");
                dest.style.display = "";
                this.endTransition(src, dest, currentForm, previousForm);
            }
        },

        endTransition: function(src, dest, currentForm, previousForm) {
            if(src) {
                if(previousForm.__ev) {
                    previousForm.__ev();
                }
                src.style.display = "none";
                clearInterval(previousForm.scrollerTimer);

                var main = $KU.getElementById("__MainContainer");
                main.removeChild(src);
            }

            if($KG.nativeScroll) {
                document.body.className = currentForm.skin || "";
            }

            var mapCanvasElement = document.getElementsByName("map_canvas")[0];
            var scriptloaded = $KG["mapScriptLoaded"];
            if(mapCanvasElement && scriptloaded)
                $KW.Map.setUpInteractiveCanvasMap();

            
            if(currentForm.retainscrollposition) {
                var currentFormScroller = $KG[currentForm.id + "_scroller"];
                if(currentFormScroller)
                    currentFormScroller.scrollTo(0, currentForm.__y || 1);
                else if($KU.isWindowsPhone && $KU.isIE9)
                    window.scrollTo(0, currentForm.__y || 0); 
                else
                    window.scrollTo(0, currentForm.__y || 1); 
            } else if($KG["nativeScroll"]) {
                window.scrollTo(0, 0);
            }
            
            
            
            
            $KW.Utils.initializeFormGestures(currentForm);

            kony.events.executeActionOnContainer(currentForm, "postshow", false);
            spaAPM && spaAPM.sendMsg(currentForm, 'show');
            if(currentForm.postshow) {
                var postref = $KU.returnEventReference(currentForm.postshow);
                $KU.executeWidgetEventHandler(currentForm, postref);
            }
            $KW.FlexUtils.isFlexContainer(currentForm) && currentForm.forceLayout();
            if(spaAPM && typeof appStartTime !== "undefined") {
                var curTime = new Date().getTime();
                var timeDiff = curTime - appStartTime;
                spaAPM.sendMsg(currentForm, 'AppLoad', {
                    "loaddur": timeDiff
                });
            }
            if($KG.appbehaviors["recording"] == true) {
                this.parseWidgetDimensions(currentForm, null);
                this.addDomChangeEvents();
            }
        },


        parseWidgetDimensions: function(widgetModel, parentModel, widgetPositions) {
            widgetPositions = widgetPositions || this.getWidgetPosition(widgetModel);
            this.getPositionValues(widgetPositions, widgetModel, parentModel);


            if(!widgetModel.children || widgetModel.children.length == 0)
                return widgetPositions;

            widgetPositions.Children = [];
            for(var i = 0; i < widgetModel.children.length; i++) {
                kony.print("i is :" + i);

                var childModel = widgetModel[widgetModel.children[i]];
                var childPositions = {};
                widgetPositions.Children.push(childPositions);
                this.parseWidgetDimensions(childModel, widgetModel, childPositions)
            }

            return widgetPositions;
        },

        getWidgetPosition: function(widgetModel) {
            var parentWP = null;
            if(widgetModel.parent) {
                parentWP = this.getWidgetPosition(widgetModel.parent);
                if(parentWP && parentWP.Children) {
                    for(var i = 0; i < parentWP.Children.length; i++) {
                        if(parentWP.Children[i].ID === widgetModel.id) {
                            return parentWP.Children[i];
                        }
                    }
                } else if(parentWP.ID && !parentWP.Type) {
                    this.parseWidgetDimensions(widgetModel.parent, null, parentWP);
                    return parentWP;
                }
                return null;
            } else {
                return this.getAllWidgets(widgetModel.id);
            }
        },

        getAllWidgets: function(widgetid) {
            if(!$KG.widgetPositions) {
                $KG.widgetPositions = {};
            }

            if(!$KG.widgetPositions.AllWidgets) {
                $KG.widgetPositions.AllWidgets = new Array();
                $KG.widgetPositions.AppName = kony.globals["appid"];
                $KG.widgetPositions.ScreenHeight = $KU.getWindowHeight();
                $KG.widgetPositions.ScreenWidth = $KU.getWindowWidth();
            }


            for(var index in $KG.widgetPositions.AllWidgets) {
                var widget = $KG.widgetPositions.AllWidgets[index];
                if(widget.ID === widgetid) {
                    return widget;
                }
            }
            var widget = {
                "ID": widgetid
            };
            $KG.widgetPositions.AllWidgets.push(widget);
            return widget;

        },

        getPositionValues: function(widgetData, childModel, widgetModel) {
            var Info = widgetData || {}

            Info.Type = childModel.name;
            Info.ID = childModel.id;
            Info.Margin = childModel.margin;
            Info.Padding = childModel.padding;

            
            var cNode = $KU.getNodeByModel(childModel);
            if(cNode == null) return Info;

            Info.Width = cNode.offsetWidth;
            Info.Height = cNode.offsetHeight;


            
            

            var childPos = $KW.Utils.getPosition(cNode);

            Info.LeftFromScreen = childPos.left;
            Info.TopFromScreen = childPos.top;
            

            Info["VisibilityChanged"] = false;

            if(widgetModel) {
                var wNode = $KU.getNodeByModel(widgetModel);
                if(!wNode) return Info;
                var parentPos = $KW.Utils.getPosition(wNode);
                Info.Left = childPos.left - parentPos.left;
                Info.Top = childPos.top - parentPos.top;
            } else {
                Info.Top = 0;
                Info.Left = 0;
            }

            if(!Info["VaryingScreenLefts"]) {
                Info["VaryingHeights"] = [Info.Height, Info.Height];
                Info["VaryingLefts"] = [Info.Left, Info.Left];
                Info["VaryingScreenLefts"] = [Info.LeftFromScreen, Info.LeftFromScreen];
                Info["VaryingScreenTops"] = [Info.TopFromScreen, Info.TopFromScreen];
                Info["VaryingTops"] = [Info.Top, Info.Top];
                Info["VaryingWidths"] = [Info.Width, Info.Width];
            }
            Info["VaryingHeights"][0] = Math.min(Info["VaryingHeights"][0], Info.Height);
            Info["VaryingHeights"][1] = Math.max(Info["VaryingHeights"][0], Info.Height);

            Info["VaryingLefts"][0] = Math.min(Info["VaryingLefts"][0], Info.Left);
            Info["VaryingLefts"][1] = Math.max(Info["VaryingLefts"][0], Info.Left);

            Info["VaryingScreenLefts"][0] = Math.min(Info["VaryingScreenLefts"][0], Info.LeftFromScreen);
            Info["VaryingScreenLefts"][1] = Math.max(Info["VaryingScreenLefts"][0], Info.LeftFromScreen);

            Info["VaryingScreenTops"][0] = Math.min(Info["VaryingScreenTops"][0], Info.TopFromScreen);
            Info["VaryingScreenTops"][1] = Math.max(Info["VaryingScreenTops"][0], Info.TopFromScreen);

            Info["VaryingTops"][0] = Math.min(Info["VaryingTops"][0], Info.Top);
            Info["VaryingTops"][1] = Math.max(Info["VaryingTops"][0], Info.Top);

            Info["VaryingWidths"][0] = Math.min(Info["VaryingWidths"][0], Info.Width);
            Info["VaryingWidths"][1] = Math.max(Info["VaryingWidths"][0], Info.Width);


            return Info;
        },

        addDomChangeEvents: function() {
            if(domChangeObserver === null)
                domChangeObserver = new MutationObserver(this.domChangeListener);

            domChangeObserver.observe(document, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
        },

        removeDomChangeEvents: function() {
            if(domChangeObserver != null)
                domChangeObserver.disconnect();
        },

        domChangeListener: function(mutations) {
            mutations.forEach(function(mutation) {
                var widgetModel = $KU.getModelByNode(mutation.target)
                if(widgetModel && widgetModel.name) {
                    kony.web.logger("log", mutation.type + ' -- ' + widgetModel.id);
                    module.parseWidgetDimensions(widgetModel, widgetModel.parent);
                }
            })
        },
        

        


        

    };


    return module;
}());


var domChangeObserver = null;
