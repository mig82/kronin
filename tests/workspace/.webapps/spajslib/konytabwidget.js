

$KW.TabPane = (function() {



    var module = {
        ANIMATION_DELAY : 500,

        initialize: function(){
            kony.events.addEvent("click", "Tab", this.eventHandler);
            kony.events.addEvent("onorientationchange", "TabPane", this.orientationHandler);
        },

        initializeView: function(formId){
            this.toggleDisable(formId); 
            setTimeout(function(){
                module.setTabsHeight(formId);
            }, 1);

            $KU.setScrollBoxesHeight(formId, "TabPane");
        },

        orientationHandler: function(formId, orientation) {
            $KU.setScrollBoxesHeight(formId, "TabPane");
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue){
            var tabView = widgetModel.viewtype;
            switch (propertyName) {
                case "activeskin":
                    if (tabView === 'tabview') {
                        for (var i = 0; i < widgetModel.children.length; i++) {
                            var cTabID = $KW.Utils.getKMasterWidgetID(widgetModel[widgetModel.children[i]]);
                            var tabWidgetBody = $KU.getElementById(cTabID + "_Body");
                            var tabWidgetLi = $KU.getElementById(cTabID + "_Li");
                            var tabWidgetA = $KU.getElementById(cTabID + "_A");

                            if (tabWidgetBody && tabWidgetBody.getAttribute('activebody') === '1') {
                                $KU.removeClassName(tabWidgetLi, oldPropertyValue + 'li');
                                $KU.removeClassName(tabWidgetA, oldPropertyValue + 'lia');
                                $KU.addClassName(tabWidgetLi, propertyValue + 'li');
                                $KU.addClassName(tabWidgetA, propertyValue + 'lia');
                            }
                        }

                    }else{
                        for (var i = 0; i < widgetModel.children.length; i++) {
                            var cTabID = $KW.Utils.getKMasterWidgetID(widgetModel[widgetModel.children[i]]);
                            var tabElementHeader = $KU.getElementById(cTabID + '_Header');
                            if (tabElementHeader) {
                                if (tabElementHeader.getAttribute('active') === '1') {
                                    $KU.removeClassName(tabElementHeader, oldPropertyValue);
                                    $KU.addClassName(tabElementHeader, propertyValue);
                                }
                            }
                        }
                    }
                    break;

                case "inactiveskin":
                     if (tabView === 'tabview') {
                         for (var i = 0; i < widgetModel.children.length; i++) {
                             var cTabID = $KW.Utils.getKMasterWidgetID(widgetModel[widgetModel.children[i]]);
                             var tabWidgetBody = $KU.getElementById(cTabID + "_Body");
                             var tabWidgetLi = $KU.getElementById(cTabID + "_Li");
                             var tabWidgetA = $KU.getElementById(cTabID + "_A");

                             if (tabWidgetBody && tabWidgetBody.getAttribute('activebody') === '0') {
                                 $KU.removeClassName(tabWidgetLi, oldPropertyValue + 'li');
                                 $KU.removeClassName(tabWidgetA, oldPropertyValue + 'lia');
                                 $KU.addClassName(tabWidgetLi, propertyValue + 'li');
                                 $KU.addClassName(tabWidgetA, propertyValue + 'lia');
                             }
                         }

                    }else{
                        for (var i = 0; i < widgetModel.children.length; i++) {
                            var cTabID = $KW.Utils.getKMasterWidgetID(widgetModel[widgetModel.children[i]]);
                            var tabElementHeader = $KU.getElementById(cTabID + '_Header');
                            if (tabElementHeader) {
                                if (tabElementHeader.getAttribute('active') === '0') {
                                    $KU.removeClassName(tabElementHeader, oldPropertyValue);
                                    $KU.addClassName(tabElementHeader, propertyValue);
                                }
                            }
                        }
                    }
                    break;

                    case "activetab":
                        var tabPaneWidget = $KU.getElementById($KW.Utils.getKMasterWidgetID(widgetModel));
                        if(propertyValue >= 0 && propertyValue < widgetModel.children.length){
                        widgetModel.activetab = propertyValue;
                        if(widgetModel.activetabs)
                            widgetModel.activetabs[IndexJL] = propertyValue;


                        this.repaint(tabPaneWidget, widgetModel);

                        }
                    break;

                    case "activetabs":
                        var tabPaneWidget = $KU.getElementById($KW.Utils.getKMasterWidgetID(widgetModel));

                        this.repaint(tabPaneWidget, widgetModel);



                        break;

                    case "viewconfig":

                        var tabPaneWidget = $KU.getElementById($KW.Utils.getKMasterWidgetID(widgetModel));

                        this.repaint(tabPaneWidget, widgetModel);
                        break;

                    case "viewtype":
                        var tabPaneWidget = $KU.getElementById($KW.Utils.getKMasterWidgetID(widgetModel));
                        widgetModel.viewtype = propertyValue;

                        if(widgetModel.viewconfig)
                            widgetModel.toggletabs = widgetModel.viewconfig.collapsibleviewconfig.toggletabs;

                        this.repaint(tabPaneWidget, widgetModel);
                        break;



            }
        },

        render: function(tabPaneModel, context){
            var tabView = tabPaneModel.viewtype;
            var htmlString = "";
            $KU.updateScrollFlag(tabPaneModel);
            if(tabPaneModel.containerheight){
                tabPaneModel.needScroller = !!(tabPaneModel.containerheight >= 0 && tabPaneModel.containerheightreference);
            }
            if(tabView == "tabview"){
                this.adjustActiveTabs(tabPaneModel);
                htmlString = this.generateTabView(tabPaneModel,context);
            }else{
                if (tabPaneModel.toggletabs === true){
                    this.adjustActiveTabs(tabPaneModel);
                    htmlString = this.generateAccordionView(tabPaneModel,context);
                }else{
                    htmlString = this.generateCollapsibleView(tabPaneModel,context);
                }
            }

            return htmlString;
        },

        repaint: function(tabPaneWidget, widgetModel){
            if(tabPaneWidget){
                if(widgetModel.viewtype === 'tabview' || widgetModel.viewtype == constants.TABPANE_VIEW_TYPE_PAGEVIEW){
                    tabPaneWidget.innerHTML = module.generateTabView(widgetModel,widgetModel.context,true);
                    module.adjustFlexContainers(widgetModel);
                }
                else if(widgetModel.viewtype === 'collapsibleview' && widgetModel.toggletabs === 'true'){
                    tabPaneWidget.innerHTML = module.generateAccordionView(widgetModel,widgetModel.context,true);
                    setTimeout(function(){
                        module.setTabsHeight(widgetModel.pf);
                    }, 1);
                }
                else{
                    tabPaneWidget.innerHTML = module.generateCollapsibleView(widgetModel,widgetModel.context,true);
                    setTimeout(function(){
                        module.setTabsHeight(widgetModel.pf);
                    }, 1);
                }
            }
        },

        adjustFlexContainers: function(tabPaneModel){
            $KU.needOptimization = false;
            $KW.Form.initializeFlexContainersInBox(tabPaneModel);
            $KU.needOptimization = true;
        },

        generateTabView: function(tabPaneModel,context,updateViewFlag){
            var htmlString = '';
            var formModel = tabPaneModel;
            var margin = $KW.skins.getBaseStyle(tabPaneModel, context);
            var padding = $KW.skins.getPaddingSkin(tabPaneModel);
            var css = $KW.skins.getVisibilitySkin(tabPaneModel);
            var baseHtml = " ktabpaneid='" + tabPaneModel.id + "' kformname='" + tabPaneModel.pf + "' ";

            var paneId = tabPaneModel.pf + "_" + tabPaneModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(tabPaneModel);
            if(kmasterObj.id != ""){
                paneId = kmasterObj.id;
            }
            var kmasterid = kmasterObj.kmasterid;
            var tabId;
            if(!updateViewFlag){
                htmlString += "<div  id='" + paneId + "_scroller' class='scrollerX " + css + "' kwidgettype='KScrollBox' name='touchcontainer_KScroller' swipeDirection ='vertical' style='" + margin + "' "+kmasterid+">" +
                                "<div id='" + paneId + "_scrollee' class='form_scrollee' kwidgettype='KTouchscrollee' "+kmasterid+">";

                htmlString += "<div id = '" + paneId + "' style='" + padding + "' kformname='" + tabPaneModel.pf + "' kwidgettype='TabPane' "+kmasterid+">";
            }


            htmlString += "<div id = '" + paneId + "_Header' "+kmasterid+">";
            htmlString += "<ul id = '" + paneId + "_Ul' class='middleleftalign' style='padding-bottom: 3px;' "+kmasterid+">";




            for (var i = 0; i < tabPaneModel.children.length; i++) {

                var tabModel = formModel[tabPaneModel.children[i]];
                htmlString += this.generateTabViewLi(tabPaneModel,tabModel,i);
            }

            htmlString += "</ul>";
            htmlString += "</div>";


            htmlString += "<div id = '" + paneId + "_Body' "+kmasterid+">";



            for (var j = 0; j < tabPaneModel.children.length; j++) {
                var tabModel = formModel[tabPaneModel.children[j]];
                tabPaneModel.context = context;
                htmlString += this.generateTabViewBody(tabPaneModel,tabModel,j,context);

            }
            htmlString += "</div>";


            if(!updateViewFlag)
                htmlString += "</div></div></div>";

            return htmlString;
        },

        generateTabViewLi: function(tabPaneModel,tabModel,index){
            var activeSkin = tabPaneModel.activeskin || "";
            var inActiveSkin = tabPaneModel.inactiveskin || "";
            var baseHtml = " ktabpaneid='" + tabPaneModel.id + "' kformname='" + tabPaneModel.pf + "' ";
            var htmlString = "";

            var tabId = tabModel.pf + "_" + tabModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(tabModel);
            if(kmasterObj.id != ""){
                tabId = kmasterObj.id;
            }
            htmlString += "<li id = '" + tabId + "_Li' index=" + index + " style='display:inline' class='" + (index != (tabPaneModel.activetab - IndexJL) ? inActiveSkin : activeSkin) + "li' kwidgettype='Tab'" + baseHtml + " "+kmasterObj.kmasterid+">";

            htmlString += "<a id = '" + tabId + "_A' style='display:inline-block' index=" + index + " kwidgettype='Tab'" + baseHtml + "href='#' class='" + (index != (tabPaneModel.activetab - IndexJL) ? inActiveSkin : activeSkin) + ((inActiveSkin || activeSkin) ? "lia'" : "'" ) + " "+kmasterObj.kmasterid+">";

            if(tabModel.image)
                htmlString += "<img id = '"+ tabId+"_Header_Image' src='" + $KU.getImageURL(tabModel.image) + "' "+kmasterObj.kmasterid+" />";

            if(tabModel.tabname){
                htmlString += "<div ";
                if(tabModel.image)
                    htmlString += " style='float:right' ";
                htmlString += ">"+tabModel.tabname+"</div>";
            }

            htmlString += "</a>";
            htmlString += "</li>";

            return htmlString;
        },

        generateTabViewBody: function(tabPaneModel,tabModel,index,context){
            var htmlString = "";
            var baseHtml = " ktabpaneid='" + tabPaneModel.id + "' kformname='" + tabPaneModel.pf + "' ";
            var marginPadding = $KW.skins.getMarginSkin(tabModel, context) + $KW.skins.getPaddingSkin(tabModel);
            var skin = (tabModel.wType == 'FlexContainer') ? "" : (tabModel.skin || "");

            tabId = tabModel.pf + "_" + tabModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(tabModel);
            if(kmasterObj.id != ""){
                tabId = kmasterObj.id;
            }
            htmlString += "<div id = '" + tabId + "_Body' kwidgettype='tabviewTabBody'" + baseHtml;
            if (index != (tabPaneModel.activetab - IndexJL)) {

                    htmlString += "class='hide " + skin + "' activebody='0' ";

            }
            else {
                htmlString += "class='show " + skin + "' activebody='1' ";
            }

            htmlString += " style='"+marginPadding+"' "+kmasterObj.kmasterid+">";

            htmlString += this.renderTab(tabPaneModel, tabModel, context);
            htmlString += "</div>";

            return htmlString;
        },

        generateCollapsibleView: function(tabPaneModel, context, updateViewFlag){
            var formModel = tabPaneModel;
            var htmlString = '';
            var margin = $KW.skins.getMarginSkin(tabPaneModel, context);
            var padding = $KW.skins.getPaddingSkin(tabPaneModel);
            var css = $KW.skins.getVisibilitySkin(tabPaneModel);
            var tabPaneId = tabPaneModel.pf+"_"+ tabPaneModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(tabPaneModel);
            if(kmasterObj.id != ""){
                tabPaneId = kmasterObj.id;
            }
            if(!updateViewFlag){
                htmlString += "<div id='" + tabPaneId + "_scroller' class='scrollerX " + css + "' kwidgettype='KScrollBox' name='touchcontainer_KScroller' swipeDirection ='vertical' style='" + margin + "' "+kmasterObj.kmasterid+">" +
                                "<div id='" + tabPaneId + "_scrollee' class='form_scrollee' kwidgettype='KTouchscrollee' "+kmasterObj.kmasterid+">";

                htmlString += "<div class='" + css + "' style='" + padding + "' id = '" + tabPaneId + "' kformname='" + tabPaneModel.pf + "' kwidgettype='TabPane' "+kmasterObj.kmasterid+">";
            }

            tabPaneModel.context = context;

            for (var i = 0; i < tabPaneModel.children.length; i++) {

                var tabModel = formModel[tabPaneModel.children[i]];
                tabPaneModel.context = context;
                htmlString += this.generateCollapsibleViewTab(tabPaneModel,tabModel,i,context);
            }

            if(!updateViewFlag){
                htmlString += "</div></div></div>";
            }
            return htmlString;
        },

        generateCollapsibleViewTab : function(tabPaneModel,tabModel,index,context){
            var htmlString = "";
            var activeSkin = tabPaneModel.activeskin || "";
            var inActiveSkin = tabPaneModel.inactiveskin || "";

            var baseHtml = " ktabpaneid='" + tabPaneModel.id + "' kformname='" + tabPaneModel.pf + "' ";
            var collapsibleImgSrc = tabPaneModel.collapsedimage ? $KU.getImageURL(tabPaneModel.collapsedimage) : "";
            var expandedImgSrc = tabPaneModel.expandedimage ? $KU.getImageURL(tabPaneModel.expandedimage) : "";
            var marginPadding = $KW.skins.getMarginSkin(tabModel, context) + $KW.skins.getPaddingSkin(tabModel);

            var isActive = this.isActiveTab(tabPaneModel,tabModel);

            var tabId = tabModel.pf + "_" + tabModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(tabModel);
            if(kmasterObj.id != ""){
                tabId = kmasterObj.id;
            }
            htmlString += "<div id = '" + tabId + "_Tab' "+kmasterObj.kmasterid+">";
            htmlString += "<div id = '" + tabId + "_Header' index=" + index + baseHtml + "kwidgettype='Tab' tabHeader='true' class='" + (isActive ? activeSkin : inActiveSkin) + "'" + (isActive ? " active='1'" : " active='0'") + " "+kmasterObj.kmasterid+">";



            htmlString += "<div class = 'ktable kwt100' style='text-decoration: inherit;table-layout: auto;'>";
            htmlString += "<div class = 'krow kwt100' >";

            if (tabPaneModel.imageposition == 'left') {

                htmlString += "<div class = 'kcell kwt2 middleleftalign' >";
                htmlString += "<img ";
                if (isActive) {
                    if (tabPaneModel.collapsedimage)
                        htmlString += "src='" + collapsibleImgSrc + "'";
                }
                else {
                    if (tabPaneModel.expandedimage)
                        htmlString += "src='" + expandedImgSrc + "'";
                }
                htmlString += " id='" + tabId + "_Img' kwidgettype='Tab'" + baseHtml + " "+kmasterObj.kmasterid+"/>";
                htmlString += "</div>";
            }
            htmlString += "<div class = 'kcell kwt98 middleleftalign' >";
            if(tabModel.image)
                htmlString += "<div style='float:left'><img id = '"+ tabId+"_Header_Image' src='" + $KU.getImageURL(tabModel.image) + "' "+kmasterObj.kmasterid+" /></div>";

            htmlString += "<div id = '" + tabId + "_Div' kwidgettype='Tab' " + baseHtml;

            if (tabPaneModel.tabnamealignment)
                htmlString += "style='text-align:" + tabPaneModel.tabnamealignment + "' ";
            htmlString += " "+kmasterObj.kmasterid+">";
            if(tabModel.tabname)
                htmlString += tabModel.tabname;

            htmlString += "</div>";

            htmlString += "</div>";

            if (tabPaneModel.imageposition === 'right') {
                htmlString += "<div class = 'kcell kwt2 middleleftalign' >";
                htmlString += "<img style='vertical-align: middle' ";
                if (isActive) {
                    if (tabPaneModel.collapsedimage)
                        htmlString += "src='" + collapsibleImgSrc + "'";
                }
                else {
                    if (tabPaneModel.expandedimage)
                        htmlString += "src='" + expandedImgSrc + "'";
                }
                htmlString += " id='" + tabId + "_Img' kwidgettype='Tab'" + baseHtml + " "+kmasterObj.kmasterid+"/>";
                htmlString += "</div>";
            }
            htmlString += "</div></div>";


            htmlString += "</div>";

            htmlString += "<div id = '" + tabId + "_Body' class='" + (isActive ? "tabactivebody " : "tabinactivebody ") + (tabModel.skin || "") + "' kwidgettype='collapsibleTabBody' style='display:none;"+marginPadding+"' "+kmasterObj.kmasterid+">";

            tabPaneModel.context = context;
            htmlString += this.renderTab(tabPaneModel, tabModel, context);
            htmlString += "</div>";
            htmlString += "</div>";


            return htmlString;
        },

        isActiveTab: function(tabPaneModel,tabModel){
            if(!tabPaneModel.activetabs)
                 return false;

            for (var i = 0; i < tabPaneModel.children.length; i++) {
                if(tabPaneModel.children[i] == tabModel.id)
                    break;
             }
             for (var j = IndexJL; j < tabPaneModel.activetabs.length; j++) {
                if(tabPaneModel.activetabs[j] == (i+IndexJL))
                    return true;
             }
             return false;
        },

        generateAccordionView: function(tabPaneModel, context, updateViewFlag){
            var formModel = tabPaneModel;
            var htmlString = "";
            var margin = $KW.skins.getMarginSkin(tabPaneModel, context);
            var padding = $KW.skins.getPaddingSkin(tabPaneModel);
            var css = $KW.skins.getVisibilitySkin(tabPaneModel);
            var tabPaneId = tabPaneModel.pf+"_"+ tabPaneModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(tabPaneModel);
            if(kmasterObj.id != ""){
                tabPaneId = kmasterObj.id;
            }
            if(!updateViewFlag){
                htmlString += "<div  id='" + tabPaneId + "_scroller' class='scrollerX " + css + "' kwidgettype='KScrollBox' name='touchcontainer_KScroller' swipeDirection ='vertical' style='" + margin + "' "+kmasterObj.kmasterid+">" +
                                "<div id='" + tabPaneId + "_scrollee' class='form_scrollee' kwidgettype='KTouchscrollee' "+kmasterObj.kmasterid+">";

                htmlString += "<div class='" + css + "' style='" + padding + "' id = '" + tabPaneId + "' kformname='" + tabPaneModel.pf + "' kwidgettype='TabPane' "+kmasterObj.kmasterid+">";
            }

               var activeSkin = tabPaneModel.activeskin || "";
            var inActiveSkin = tabPaneModel.inactiveskin || "";
            var tabId;
            var baseHtml = " ktabpaneid='" + tabPaneModel.id + "' kformname='" + tabPaneModel.pf + "' ";

            var collapsibleImgSrc = tabPaneModel.collapsedimage ? $KU.getImageURL(tabPaneModel.collapsedimage) : "";
            var expandedImgSrc = tabPaneModel.expandedimage ? $KU.getImageURL(tabPaneModel.expandedimage) : "";

            tabPaneModel.context = context;

            for (var i = 0; i < tabPaneModel.children.length; i++) {

                var tabModel = formModel[tabPaneModel.children[i]];
                htmlString += this.generateAccordionViewTab(tabPaneModel,tabModel,i,context);
            }
            if(!updateViewFlag){
                htmlString += "</div></div></div>";
            }
            return htmlString;
        },

        generateAccordionViewTab :function(tabPaneModel,tabModel,index,context){
            var tabId = tabModel.pf + "_" + tabModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(tabModel);
            if(kmasterObj.id != ""){
                tabId = kmasterObj.id;
            }
            var baseHtml = " ktabpaneid='" + tabPaneModel.id + "' kformname='" + tabPaneModel.pf + "' ";
            var activeSkin = tabPaneModel.activeskin || "";
            var inActiveSkin = tabPaneModel.inactiveskin || "";
            var collapsibleImgSrc = tabPaneModel.collapsedimage ? $KU.getImageURL(tabPaneModel.collapsedimage) : "";
            var expandedImgSrc = tabPaneModel.expandedimage ? $KU.getImageURL(tabPaneModel.expandedimage) : "";
            var marginPadding = $KW.skins.getMarginSkin(tabModel, context) + $KW.skins.getPaddingSkin(tabModel);

            var htmlString = "";

            htmlString += "<div id = '" + tabId + "_Tab' "+kmasterObj.kmasterid+">";

            htmlString += "<div id = '" + tabId + "_Header' index=" + index + baseHtml + "kwidgettype='Tab' "+kmasterObj.kmasterid+" tabHeader='true' class='" + ((index == (tabPaneModel.activetab - IndexJL)) ? activeSkin + "' active='1'>" : inActiveSkin + "' active='0'>");


            htmlString += "<div class = 'ktable kwt100' style='text-decoration: inherit;table-layout: auto;'>";
            htmlString += "<div class = 'krow kwt100' >";

            if (tabPaneModel.imageposition === 'left') {
                htmlString += "<div class = 'kcell kwt2 middleleftalign' >";
                htmlString += "<img ";
                if (index == (tabPaneModel.activetab - IndexJL)) {
                    if (tabPaneModel.collapsedimage)
                        htmlString += "src='" + collapsibleImgSrc + "'";
                }
                else {
                    if (tabPaneModel.expandedimage)
                        htmlString += "src='" + expandedImgSrc + "'";
                }
                htmlString += " id='" + tabId + "_Img' kwidgettype='Tab'" + baseHtml + " "+kmasterObj.kmasterid+"/>";
                htmlString += "</div>";

            }
            htmlString += "<div class = 'kcell kwt98 middleleftalign' >";
            if(tabModel.image)
                htmlString += "<div style='float:left'><img id = '"+ tabId+"_Header_Image' src='" + $KU.getImageURL(tabModel.image) + "' "+kmasterObj.kmasterid+" /></div>";
            htmlString += "<div id = '" + tabId + "_Div' kwidgettype='Tab'" + baseHtml;
            if (tabPaneModel.tabnamealignment)
                htmlString += "style='text-align:" + tabPaneModel.tabnamealignment + "' ";
            htmlString += ""+kmasterObj.kmasterid+" >";

            if(tabModel.tabname)
                htmlString += tabModel.tabname;

            htmlString += "</div>";

            htmlString += "</div>";

            if (tabPaneModel.imageposition === 'right') {
                htmlString += "<div class = 'kcell kwt2 middleleftalign' >";
                htmlString += "<img ";
                if (index == (tabPaneModel.activetab - IndexJL)) {
                    if (tabPaneModel.collapsedimage)
                        htmlString += "src='" + collapsibleImgSrc + "'";
                }
                else {
                    if (tabPaneModel.expandedimage)
                        htmlString += "src='" + expandedImgSrc + "'";
                }
                htmlString += " id='" + tabId + "_Img' kwidgettype='Tab'" + baseHtml + " "+kmasterObj.kmasterid+"/>";
                htmlString += "</div>";
            }

            htmlString += "</div></div>";


            htmlString += "</div>";

            htmlString += "<div id = '" + tabId + "_Body' class='" + (index == (tabPaneModel.activetab-IndexJL) ? "tabactivebody " : "tabinactivebody ") + (tabModel.skin || "") + "' kwidgettype='collapsibleTabBody' style='display:none;"+marginPadding+"' "+kmasterObj.kmasterid+">";

            htmlString += this.renderTab(tabPaneModel, tabModel, context);
            htmlString += "</div>";
            htmlString += "</div>";

            return htmlString;
        },

        renderTab: function(tabPaneModel, tabModel, context){
            var htmlString = "";
            context = context || {};
            context.tabpaneID = tabPaneModel.id;
            if(tabModel.wType == 'FlexContainer'){
                htmlString = $KW.FlexContainer.render(tabModel, context);
            }
            else if (tabModel.children) {
                if (tabModel.layouttype == constants.CONTAINER_LAYOUT_GRID) {
                    htmlString = $KW.Grid.render(tabModel, context);
                }
                else{
                    for (var k = 0; k < tabModel.children.length; k++) {
                        var childModel = tabPaneModel[tabModel.children[k]];
                        context.topLevelBox = true;
                        htmlString += $KW[childModel.wType].render(childModel, context);
                        context.topLevelBox = false;
                    }
                }
            }
            context.tabpaneID = "";
            return htmlString;
        },

        setTabsHeight: function(formId){
            var tabviewElementsBody = document.querySelectorAll("#" + formId + " div[kwidgettype='tabviewTabBody']");
            var taboninithandler;
            if(tabviewElementsBody)
            {
                for(var i=0; i<tabviewElementsBody.length; i++ )
                {
                     var tabviewElementBody = tabviewElementsBody[i];
                    var tabModel;
                    if(tabviewElementBody.getAttribute("kmasterid")){
                        var id = tabviewElementBody.getAttribute("id");
                        tabModel = $KU.getWidgetModelByID(id.substring(0, id.lastIndexOf("_")));  
                    }else{
                         var targetWidgetID = tabviewElementBody.getAttribute("id").split('_')[1];
                         var tabPaneID = tabviewElementBody.getAttribute("ktabpaneid");
                         var sourceFormID = tabviewElementBody.getAttribute("kformname");
                         tabModel = kony.model.getWidgetModel(sourceFormID, targetWidgetID, tabPaneID);
                     }


                     if(tabviewElementBody.getAttribute("activebody") === '1'){
                        taboninithandler = $KU.returnEventReference(tabModel.oninit);
                         tabModel.oninit && $KU.executeWidgetEventHandler(tabModel, taboninithandler);
                         if(tabModel.oninit)
                            delete tabModel.oninit;
                    }
                 }
            }

            var tabElementsBody = document.querySelectorAll("#" + formId + " div[kwidgettype='collapsibleTabBody']");
            if(tabElementsBody)
            {
                for (var i = 0; i < tabElementsBody.length; i++) {
                    var tabElementBody = tabElementsBody[i];
                    var tabModel;
                    if(tabElementBody.getAttribute("kmasterid")){
                        var id = tabElementBody.getAttribute("id");
                        tabModel = $KU.getWidgetModelByID(id.substring(0, id.lastIndexOf("_")));  
                    }else{
                        var targetWidgetID = tabElementBody.parentNode.getAttribute("id").split('_')[1];
                        var tabPaneID = tabElementBody.previousSibling.getAttribute("ktabpaneid");
                        var sourceFormID = tabElementBody.previousSibling.getAttribute("kformname");
                        tabModel = kony.model.getWidgetModel(sourceFormID, targetWidgetID, tabPaneID);
                    }


                    if (tabElementBody.previousSibling.getAttribute("active") === '1') {
                        taboninithandler = $KU.returnEventReference(tabModel.oninit);
                         tabModel.oninit && $KU.executeWidgetEventHandler(tabModel, taboninithandler);
                        module.expandTab(tabModel, tabElementBody);
                    }
                    else {
                        module.collapseTab(tabModel, tabElementBody);
                    }

                    if (tabElementBody.previousSibling.getAttribute("active") === '1') {
                        if (tabModel.oninit)
                            delete tabModel.oninit;
                    }
                }

            }
        },

        toggleDisable: function(formId){
            var tabPanes = document.querySelectorAll("#" + formId + " div[kwidgettype='TabPane']");
            for(var i=0; i<tabPanes.length; i++ ){
                var tabPaneModel = $KU.getModelByNode(tabPanes[i]);
                tabPaneModel.disabled != undefined && $KW.APIUtils.setenabled(tabPaneModel, (tabPaneModel.disabled == true ? false : true));
                var tabs = tabPaneModel.children;
                if(tabs){
                    for(var j=0; j<tabs.length; j++ ){
                        var tabModel = tabPaneModel[tabs[j]];
                        (tabModel && tabModel.disabled != undefined) && $KW.APIUtils.setenabled(tabModel, (tabModel.disabled == true ? false : true));
                    }
                }
            }
        },

        collapseTab: function(tabModel, tabWidget){
            tabWidget.style.height = tabWidget.scrollHeight + 'px';
            var duration = tabModel.transDuration ? parseInt(tabModel.transDuration): module.ANIMATION_DELAY;
            setTimeout(function(){
                tabWidget.style.overflow = 'hidden';
                tabWidget.style[$KU.transition] = 'height ' + duration + 'ms ease';
                tabWidget.style.height = '0px';

            }, 1);

            setTimeout(function(){
                $KU.addClassName(tabWidget, 'hide');
            }, duration);
        },

        expandTab: function(tabModel, tabWidget){
            tabWidget.style.display = 'block';
            tabWidget.style.overflow = 'hidden';

            $KU.removeClassName(tabWidget, 'hide');
            module.adjustFlexContainers(tabModel.parent);
            var duration = tabModel.transDuration ? parseInt(tabModel.transDuration): module.ANIMATION_DELAY;
            tabWidget.style[$KU.transition] = 'height ' + duration + 'ms ease';
            tabWidget.style.height = tabWidget.scrollHeight + 'px';
            setTimeout(function(){
                module.setTabsHeightAuto(tabWidget);
            }, duration + 100);
        },

        setTabsHeightAuto: function(tabElementBody){
            tabElementBody.style[$KU.transition] = '';
            tabElementBody.style.height = 'auto';
        },

        
        addTab: function(tabPaneModel, tabId, tabName, tabImage, box, masterDataLoad) {
            tabPaneModel.addTab(tabId, tabName, tabImage, box, masterDataLoad);
        },

        addChildTab: function(tabPaneModel,tabModel){
            var tabPaneElement = $KU.getNodeByModel(tabPaneModel);
            var tabLiId = $KW.Utils.getKMasterWidgetID(tabModel)+"_Li";
            var tabLiElement = $KU.getElementById(tabLiId);

            if(tabPaneElement && !tabLiElement){
                var index = tabPaneModel.children.length;
                this.addChildTabAt(tabPaneModel,tabModel,index);
            }
        },

        removeTabAt: function(tabPaneModel, index, isFromById) {
            index = parseInt(index);
            if(index >= IndexJL && !isFromById)
                index = index - IndexJL;

            if(index >= 0 && index <= tabPaneModel.children.length){
                var tabModel = tabPaneModel[tabPaneModel.children[index]];
                if(tabModel)
                    _konyConstNS.ContainerWidget.prototype.remove.call(tabPaneModel, tabModel);

                if(tabPaneModel.viewtype == "tabview" || (tabPaneModel.toggletabs && (tabPaneModel.toggletabs === true))){


                    if(tabPaneModel.activetab == (index+IndexJL)){
                        tabPaneModel.activetab = IndexJL;
                        tabPaneModel.activetabs[IndexJL] = tabPaneModel.activetab;
                        this.updateView(tabPaneModel,"activetab",tabPaneModel.activetab,tabPaneModel.activetab);
                        return;


                    }
                    if(tabPaneModel.activetab > (index+IndexJL)){
                        tabPaneModel.activetab -= 1;
                        tabPaneModel.activetabs[IndexJL] = tabPaneModel.activetab;
                    }
                }else{
                    var indexAvailable = $KU.inArray(tabPaneModel.activetabs,parseInt(index)+IndexJL);
                    if(indexAvailable[0])
                        tabPaneModel.activetabs.splice(indexAvailable[1],1);

                    if(tabPaneModel.activetabs.length == IndexJL){
                        if(IndexJL)
                            tabPaneModel.activetabs = [null,1];
                        else
                            tabPaneModel.activetabs = [0];

                        this.updateView(tabPaneModel,"activetabs",tabPaneModel.activetabs,tabPaneModel.activetabs);
                        return;
                    }else{
                        for(var i=IndexJL; i<tabPaneModel.activetabs.length; i++ ){
                            var temp = tabPaneModel.activetabs[i];
                            if(temp > index)
                                tabPaneModel.activetabs[i] = temp - 1;
                        }
                    }
                }

                if(tabPaneModel.viewtype == "tabview"){

                    var tabpaneElement = $KU.getNodeByModel(tabPaneModel);
                    if(tabpaneElement){
                        var tabpaneUlElement = $KU.getElementById($KW.Utils.getKMasterWidgetID(tabPaneModel) + "_Ul");
                        if(tabpaneUlElement.children[index])
                            tabpaneUlElement.removeChild(tabpaneUlElement.children[index]);

                        var tabpaneBodyElement = $KU.getElementById($KW.Utils.getKMasterWidgetID(tabPaneModel) + "_Body");
                        if(tabpaneBodyElement.children[index])
                            tabpaneBodyElement.removeChild(tabpaneBodyElement.children[index]);
                    }

                    

                }else{
                    var tabElement = $KU.getElementById($KW.Utils.getKMasterWidgetID(tabModel)+"_Tab");
                    if(tabElement){
                        tabElement.parentNode.removeChild(tabElement);
                    }
                }

                this.adjustTabIndex(tabPaneModel);
                module.initializeView(tabPaneModel.pf);
            }
        },

        removeTabById: function(tabPaneModel, tabID) {
            if(tabID && tabID.id)
                tabID = tabID.id;

            var removeTabID = "";
            if(tabPaneModel[tabID]) {
                removeTabID = $KW.Utils.getKMasterWidgetID(tabPaneModel[tabID]);
            }
            else {
                return;
            }

            if(tabPaneModel.viewtype == "tabview"){
                var tabElement = $KU.getElementById(removeTabID + "_Li");
                if(tabElement){
                    var index = tabElement.getAttribute("index");
                    module.removeTabAt(tabPaneModel,index,true);
                }
            }else{
                var tabElementHeader = $KU.getElementById(removeTabID + "_Header");
                if(tabElementHeader){
                    var index = tabElementHeader.getAttribute("index");
                    module.removeTabAt(tabPaneModel,index,true);
                }
            }
        },

        
        setTabName: function(tabPaneModel, tabId, tabName){
            var tabModel = tabPaneModel[tabId];
            if(tabModel){
                tabModel.tabname = tabName;
                var tabId = $KW.Utils.getKMasterWidgetID(tabModel);
                if(tabPaneModel.viewtype == "tabview"){
                    var anchorElem = $KU.getElementById(tabId + '_A');
                    if(anchorElem){
                        var tabDiv = anchorElem.childNodes[0];
                        if(tabModel.image)
                            tabDiv = anchorElem.childNodes[1];
                        tabDiv.innerText = tabName;
                    }
                }
                else if(tabPaneModel.viewtype === 'collapsibleview'){
                    var divElem = $KU.getElementById(tabId + '_Div');
                    if(divElem)
                        divElem.innerText = tabName;
                }
            }
        },

        addTabAt: function(tabPaneModel, tabId, tabName, tabImage, box,index){
            tabPaneModel.addTabAt( tabId, tabName, tabImage, box, index);
        },

        addChildTabAt:function(tabPaneModel, tabModel, index){
            index = parseInt(index);
            var tabPaneElement = $KU.getNodeByModel(tabPaneModel);

            if(index < IndexJL)
                index = IndexJL;
            if(index >= tabPaneModel.children.length)
                index = tabPaneModel.children.length - 1 + IndexJL;

            if(tabPaneModel.viewtype == "tabview"){

                var tabLiId = $KW.Utils.getKMasterWidgetID(tabModel) + "_Li";
                var tabLiElement = $KU.getElementById(tabLiId);
                if(tabPaneElement && !tabLiElement){

                    var htmlString = "";
                    var activeSkin = tabPaneModel.activeskin || "";
                    var inActiveSkin = tabPaneModel.inactiveskin || "";
                    var baseHtml = " ktabpaneid='" + tabPaneModel.id + "' kformname='" + tabPaneModel.pf + "'";
                    var uLElement = $KU.getElementById($KW.Utils.getKMasterWidgetID(tabPaneModel) + '_Ul');
                    var bodyElement = $KU.getElementById($KW.Utils.getKMasterWidgetID(tabPaneModel) + '_Body');


                    if(index < tabPaneModel.activetab){
                        tabPaneModel.activetab += 1;
                        tabPaneModel.activetabs[IndexJL] = tabPaneModel.activetab;
                    }
                    else if(index == tabPaneModel.activetab){
                        if(uLElement.childNodes.length > 0){
                            var activeLi = uLElement.childNodes[index];
                            var activeLia = uLElement.childNodes[index].childNodes[0];
                            var activeBody = bodyElement.childNodes[index];
                            $KU.removeClassName(activeLi, tabPaneModel.activeskin+'li');
                            $KU.addClassName(activeLi, tabPaneModel.inactiveskin+'li');
                            $KU.removeClassName(activeLia, tabPaneModel.activeskin+'lia');
                            $KU.addClassName(activeLia, tabPaneModel.inactiveskin+'lia');
                            $KU.removeClassName(activeBody, 'show');
                            $KU.addClassName(activeBody, 'hide');
                            activeBody.setAttribute('activebody','0');
                        }
                    }

                    htmlString = this.generateTabViewLi(tabPaneModel,tabModel,index);

                    var wrapper = document.createElement("div");
                    wrapper.innerHTML = htmlString;

                    if(uLElement.children[index - IndexJL])
                        uLElement.insertBefore(wrapper.children[0], uLElement.children[index - IndexJL]);
                    else
                        uLElement.appendChild(wrapper.children[0]);

                    htmlString = this.generateTabViewBody(tabPaneModel,tabModel,index,tabPaneModel.context);

                    wrapper = document.createElement("div");
                    wrapper.innerHTML = htmlString;

                    if(bodyElement.children[index - IndexJL])
                        bodyElement.insertBefore(wrapper.children[0], bodyElement.children[index - IndexJL]);
                    else
                        bodyElement.appendChild(wrapper.children[0]);


                }

            }else if(tabPaneModel.viewtype === 'collapsibleview'){
                var tabElement = $KU.getElementById($KW.Utils.getKMasterWidgetID(tabModel) + "_Tab");
                if(tabPaneElement && !tabElement){
                    if(tabPaneModel.toggletabs === false)
                        htmlString = this.generateCollapsibleViewTab(tabPaneModel,tabModel,index,tabPaneModel.context);
                    else
                        htmlString = this.generateAccordionViewTab(tabPaneModel,tabModel,index,tabPaneModel.context);

                    wrapper = document.createElement("div");
                    wrapper.innerHTML = htmlString;

                    var tapPaneNode = $KU.getNodeByModel(tabPaneModel);
                    if(tapPaneNode.children[index - IndexJL])
                        tapPaneNode.insertBefore(wrapper.children[0], tapPaneNode.children[index - IndexJL]);
                    else
                        tapPaneNode.appendChild(wrapper.children[0]);

                    if(tabPaneModel.toggletabs){
                        tabElement = $KU.getElementById($KW.Utils.getKMasterWidgetID(tabModel) + "_Tab");
                        this.collapseTab(tabModel, tabElement.children[1]);
                    }
                    for(var i=IndexJL; i<tabPaneModel.activetabs.length; i++ ){
                        var temp = tabPaneModel.activetabs[i];
                        if(temp >= index)
                            tabPaneModel.activetabs[i] = temp + 1;
                    }
                    tabPaneModel.activetab = tabPaneModel.activetabs[IndexJL];
                }
            }
            this.adjustTabIndex(tabPaneModel);
            tabPaneElement && $KW.Utils.initializeNewWidgets(tabModel.ownchildrenref);
            module.initializeView(tabPaneModel.pf);
        },

        adjustTabIndex: function(tabPaneModel) {
            var tabpaneElement = $KU.getNodeByModel(tabPaneModel);
            if(tabpaneElement){
                if(tabPaneModel.viewtype == "tabview"){
                    var tabpaneUlElement = $KU.getElementById($KW.Utils.getKMasterWidgetID(tabPaneModel) + "_Ul");
                    for (var i = 0; i < tabpaneUlElement.children.length; i++) {
                        var tabLi = tabpaneUlElement.children[i];
                        tabLi.setAttribute("index",i);
                        tabLi.children[0].setAttribute("index",i);
                    }
                }else{
                    for (var j = 0; j < tabpaneElement.children.length; j++) {
                        var tab = tabpaneElement.children[j];
                        tab.children[0].setAttribute("index",j);
                    }
                }
            }
        },

        setTabImage: function(tabPaneModel, tabId,tabImage){
            var tabModel = tabPaneModel[tabId];
            if(tabModel && tabModel.image && !tabModel.header){
                tabModel.image = tabImage;
                var tabId = $KW.Utils.getKMasterWidgetID(tabModel);
                if(tabPaneModel.viewtype == "tabview" || tabPaneModel.viewtype === 'collapsibleview'){
                    var imgElem = $KU.getElementById(tabId + '_Header_Image');
                    if(imgElem)
                        imgElem.src= $KU.getImageURL(tabImage);
                }
            }
        },

        
        executeTabEvent: function (wModel, target, canSwitch) {
            
            var tabNode = $KU.getParentByAttribute(target, "index");
            var tabId = target.getAttribute("ktabid");
            var tabPaneId = target.getAttribute("ktabpaneid");
            var formId = target.getAttribute("kformname");

            var tabModel = kony.model.getWidgetModel(formId, tabId, tabPaneId);
            var tabPaneModel = kony.model.getWidgetModel(formId, tabPaneId);

            module.changeActiveTabSkin(tabPaneModel,tabId);
        },

        eventHandler: function(eventObject, target, srcElement, canExecute){
            var tabModel,tabPaneModel,tabID,baseTabID;
            if(target.getAttribute("kmasterid")){
                var id = target.getAttribute("id");
                tabModel = $KU.getWidgetModelByID(id.substring(0, id.lastIndexOf("_")));  
                tabPaneModel = tabModel.parent; 
                tabID = tabModel.id;
                baseTabID = $KW.Utils.getKMasterWidgetID(tabModel);
            }else{
                var targetWidgetID = target.getAttribute("id");
                var tabPaneID = target.getAttribute("ktabpaneid");
                var sourceFormID = target.getAttribute("kformname");
                var tabArray = targetWidgetID.split("_");
                tabID = tabArray[1];
                baseTabID = tabArray[0] + "_" +tabArray[1];
                tabModel = kony.model.getWidgetModel(sourceFormID, tabID, tabPaneID);
                tabPaneModel = kony.model.getWidgetModel(sourceFormID, tabPaneID);
            }
            var duration = tabModel.transDuration ? parseInt(tabModel.transDuration): module.ANIMATION_DELAY;
            var taboninithandler = $KU.returnEventReference(tabModel.oninit);
            var isExpanded = false;
            if(tabModel.oninit) {
                $KU.executeWidgetEventHandler(tabModel, taboninithandler);
            }
            $KAR && $KAR.sendRecording(tabPaneModel, 'click', {'tabID': tabID, 'target': target, 'eventType': 'uiAction'});


            var tabWidget = $KU.getElementById(baseTabID + "_Body");
            var tabWidgetHeader = $KU.getElementById(baseTabID + "_Header");
            var tabWidgetImg = $KU.getElementById(baseTabID + "_Img");
            var tabWidgetClickedLi = $KU.getElementById(baseTabID + "_Li");

            
            if(tabPaneModel.viewtype === 'collapsibleview' && tabPaneModel.toggletabs === false ){
                if(tabWidget.style.height === "auto"){

                    module.collapseTab(tabModel, tabWidget);
                    if(tabPaneModel.inactiveskin){
                        setTimeout(
                            function (){
                                if(tabPaneModel.inactiveskin)
                                    tabWidgetHeader.className = tabPaneModel.inactiveskin;
                            }, duration);
                    }

                    tabWidgetHeader.setAttribute("active",'0');
                    var index = tabWidgetHeader.getAttribute("index");
                    tabPaneModel.activetabs = tabPaneModel.activetabs || [];
                    var indexAvailable = $KU.inArray(tabPaneModel.activetabs,parseInt(index)+IndexJL);

                    if(indexAvailable[0])
                        tabPaneModel.activetabs.splice(indexAvailable[1],1);

                    if(tabPaneModel.expandedimage && tabWidgetImg){
                        setTimeout(
                            function (){
                                tabWidgetImg.src = $KU.getImageURL(tabPaneModel.expandedimage);
                            }, duration);
                    }

                }
                else{
                    isExpanded = true;
                    tabPaneModel.activetabs = tabPaneModel.activetabs || [];
                    var index = tabWidgetHeader.getAttribute("index");
                    var indexAvailable = $KU.inArray(tabPaneModel.activeTabs, parseInt(index)+IndexJL);
                    if(!indexAvailable[0]){
                        tabPaneModel.activetabs.push(parseInt(index)+IndexJL);
                        if(IndexJL)
                            $KI.table.sort(tabPaneModel.activetabs)
                        else
                            tabPaneModel.activetabs.sort();
                    }
                    tabWidget.style.display = 'block';
                    module.expandTab(tabModel, tabWidget);
                    if(tabPaneModel.activeskin)
                        tabWidgetHeader.className = tabPaneModel.activeskin;
                    tabWidgetHeader.setAttribute("active",'1');

                    if(tabPaneModel.collapsedimage && tabWidgetImg)
                        tabWidgetImg.src = $KU.getImageURL(tabPaneModel.collapsedimage);
                }
                
            }


                else if(tabPaneModel.viewtype === 'tabview'){  
                for (var i = 0; i < tabPaneModel.children.length; i++) {
                    var childTabId = $KW.Utils.getKMasterWidgetID(tabPaneModel[tabPaneModel.children[i]]);
                    var tabWidgetBody = $KU.getElementById(childTabId + "_Body");
                    var tabWidgetLi = $KU.getElementById(childTabId + "_Li");
                    var tabWidgetA = $KU.getElementById(childTabId + "_A");

                    if (tabPaneModel.children[i] === tabID) {
                        tabPaneModel.activetab = i + IndexJL;
                        tabPaneModel.activetabs[IndexJL] = tabPaneModel.activetab;
                        tabWidgetBody.className = 'show ' + ((tabPaneModel[tabPaneModel.children[i]].skin) ? tabPaneModel[tabPaneModel.children[i]].skin : "");
                        if (tabPaneModel.activeskin) {
                            
                            
                            $KU.removeClassName(tabWidgetLi, tabPaneModel.inactiveskin + 'li');
                            $KU.removeClassName(tabWidgetA, tabPaneModel.inactiveskin + 'lia');
                            $KU.addClassName(tabWidgetLi, tabPaneModel.activeskin + 'li');
                            $KU.addClassName(tabWidgetA, tabPaneModel.activeskin + 'lia');
                            tabWidgetBody.setAttribute("activebody", '1');
                        }
                        
                        $KG.isUILayedOut = false;
                        module.adjustFlexContainers(tabPaneModel);
                        $KG.isUILayedOut = true;
                        tabPaneModel.activetab = i + IndexJL;
                        tabPaneModel.activetabs[IndexJL] = tabPaneModel.activetab;
                    }
                    else {
                        tabWidgetBody.className = 'hide ' + ((tabPaneModel[tabPaneModel.children[i]].skin) ? tabPaneModel[tabPaneModel.children[i]].skin : "");
                        
                        tabWidgetBody.setAttribute("activebody", '0');

                        $KU.removeClassName(tabWidgetLi, tabPaneModel.activeskin + 'li');
                        $KU.removeClassName(tabWidgetA, tabPaneModel.activeskin + 'lia');

                        $KU.addClassName(tabWidgetLi, tabPaneModel.inactiveskin + 'li');
                        $KU.addClassName(tabWidgetA, tabPaneModel.inactiveskin + 'lia');
                    }
                }


            }
            else if(tabPaneModel.viewtype === 'collapsibleview' && tabPaneModel.toggletabs === true )
            { 
                var isActive = tabWidgetHeader.getAttribute('active');
                for (var i = 0; i < tabPaneModel.children.length; i++) {
                    var childTabId = $KW.Utils.getKMasterWidgetID(tabPaneModel[tabPaneModel.children[i]]);
                    var childTab = $KU.getElementById(childTabId + "_Body");
                    var childTabHeader = $KU.getElementById(childTabId + "_Header");
                    var childTabImg = $KU.getElementById(childTabId + "_Img");

                    if (tabPaneModel.children[i] === tabID) {
                        if (tabWidget.style.height === "0px") {
                            if (tabPaneModel.activetab == 0){
                                tabPaneModel.activetab = i + IndexJL;
                                tabPaneModel.activetabs[IndexJL] = tabPaneModel.activetab;
                            }
                            isExpanded = true;
                            module.expandTab(tabModel, tabWidget);
                            if (tabPaneModel.activeskin)
                                tabWidgetHeader.className = tabPaneModel.activeskin;

                            tabWidgetHeader.setAttribute("active", '1');

                            if (tabPaneModel.collapsedimage && tabWidgetImg)
                                tabWidgetImg.src = $KU.getImageURL(tabPaneModel.collapsedimage);

                            tabPaneModel.activetab = i + IndexJL;
                            tabPaneModel.activetabs = IndexJL ? [null, tabPaneModel.activetab] : [tabPaneModel.activetab];
                        }
                        else {
                            module.collapseTab(tabModel, tabWidget);
                            if (tabPaneModel.inactiveskin)
                                setTimeout(function(){
                                    tabWidgetHeader.className = tabPaneModel.inactiveskin;
                                    tabWidgetHeader.setAttribute("active", '0');
                                }, duration);

                            if (tabPaneModel.expandedimage && tabWidgetImg)
                                setTimeout(function(){
                                    tabWidgetImg.src = $KU.getImageURL(tabPaneModel.expandedimage);
                                }, duration);

                            tabPaneModel.activetab = null;
                            tabPaneModel.activetabs = null;
                        }
                    }
                    else {
                        if (childTab.style.height !== '0px') {
                            childTab.style.display = 'block';
                            module.collapseTab(tabModel, childTab);
                            if (tabPaneModel.inactiveskin)
                                childTabHeader.className = tabPaneModel.inactiveskin;
                            if (tabPaneModel.expandedimage && tabWidgetImg)
                                childTabImg.src = $KU.getImageURL(tabPaneModel.expandedimage);

                            childTabHeader.setAttribute("active", '0');
                        }
                    }
                }
            }

            if(tabModel.oninit)
                delete tabModel.oninit;

            
            $KW.Utils.reinitializeWidgets(tabPaneModel);
            

            spaAPM && spaAPM.sendMsg(tabPaneModel, 'ontabclick');
            var tabpaneonclickhandler = $KU.returnEventReference(tabPaneModel.onclick || tabPaneModel.ontabclick);
            if((canExecute == true || typeof canExecute == 'undefined') && tabpaneonclickhandler){
                $KU.executeWidgetEventHandler(tabModel,tabpaneonclickhandler,tabPaneModel.activetab, isExpanded);
                $KU.onEventHandler(tabModel);
            }

            
            if($KW.Map && $KW.Map.map && google){
                $KW.Map.setMapsHeight(tabPaneModel.pf);
                google.maps.event.trigger($KW.Map.map, 'resize');
            }
        },

        adjustActiveTabs: function(tabPaneModel){
            if(!tabPaneModel.activetabs)
                return;
            var tempArray = IndexJL ? [null] : [];
            tempArray.push(tabPaneModel.activetabs[IndexJL]);
            tabPaneModel.activetabs = tempArray;
        }

    };


    return module;
}());