
$KW.Browser = (function() {
    
    var _getIFrameNode = function(widgetModel){
        var widgetNode, iFrameNode;

        if(widgetModel.url && !module.isExternalUrl(widgetModel.url)) {
            widgetNode = $KW.Utils.getContentNodeFromNodeByModel(widgetModel);
            if(widgetNode) {
                iFrameNode = widgetNode.childNodes[0];
                return iFrameNode;
            }
        }
        return null;
    };
    

    var module = {
        initialize: function() {
            kony.events.addEvent("onorientationchange", "Browser", this.orientationHandler);
        },

        initializeView: function(formId) {
            $KU.setScrollBoxesHeight(formId, "Browser");
        },

        orientationHandler: function(formId, orientation) {
            $KU.setScrollBoxesHeight(formId, "Browser");

        },

        localFileRenderImpl: function(widgetModel, computedSkin, context) {
            var platformver = $KG["platformver"] ? $KG["platformver"] : "";
            var height = "height:100%;";
            var htmlString = "";
            var browserModel = widgetModel;
            var iframesrc = kony.appinit.getStaticContentPath() + platformver + "web/localfiles/" + browserModel.url;
            var baseHtmlStr = $KW.Utils.getBaseHtml(browserModel, context);
            htmlString += "<div " + baseHtmlStr + " style='" + height + $KW.skins.getPaddingSkin(browserModel) + "'>";
            htmlString += "<div  id='" + $KW.Utils.getKMasterWidgetID(browserModel) + "_scroller' class='scrollerX  " + computedSkin + "' kwidgettype='KScrollBox' name='touchcontainer_KScroller' swipeDirection ='vertical' style='" + height + $KW.skins.getBaseStyle(browserModel, context) + "'>" +
                "<div id='" + $KW.Utils.getKMasterWidgetID(browserModel) + "_scrollee' class='form_scrollee' kwidgettype='KTouchscrollee' style='" + height + "'>";
            htmlString += "<iframe width='100%' height='100%' style='overflow:auto;-webkit-overflow-scrolling: touch !important;' onLoad='$KW.Browser.prepareIframe(this," + widgetModel + ")' src='";
            htmlString += iframesrc;
            htmlString += "' id = 'iframe_" + browserModel.id + "' name='" + browserModel.id + "' kwidgettype='KonyLocalFrame'></iframe>";
            htmlString += "</div></div></div>";

            return htmlString;
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            switch(propertyName) {
                case "requesturlconfig":
                    if(IndexJL) {
                        widgetModel.url = propertyValue.url;
                        widgetModel.method = propertyValue.requestmethod;
                        widgetModel.data = propertyValue.requestdata;
                    }
                    var element = $KU.getNodeByModel(widgetModel);
                    var platformver = $KG["platformver"] ? $KG["platformver"] : "";
                    if(propertyValue.URL.startsWith("http") || propertyValue.URL.startsWith("https") || propertyValue.URL.startsWith("www.")) {
                        this.openUrllink(widgetModel.url, widgetModel.method, widgetModel.data, [widgetModel.pf, widgetModel.id].join('_'));
                    } else {
                        if(element) {
                            var iframeNode = element.querySelector('iframe[kwidgettype="KonyLocalFrame"]');

                            if(iframeNode) {
                                iframeNode.src = kony.appinit.getStaticContentPath() + platformver + "\\" + "web\\localfiles\\" + propertyValue.URL;
                            } else {
                                var htmlString = "";
                                var computedSkin = $KW.skins.getWidgetSkinList(widgetModel, {});
                                htmlString = module.localFileRenderImpl(widgetModel, computedSkin, {});
                                element.parentNode.innerHTML = htmlString;
                            }
                        }
                    }
                    break;

                case "htmlstring":
                    var element = $KU.getNodeByModel(widgetModel);
                    if(element)
                        element.innerHTML = propertyValue;
                    break;
            }
        },

        openUrllink: function(url, method, data, name) {
            if(url) {
                if(url.startsWith("www.")) {
                    url = "http://" + url;
                }
                if(data && !data[0].length == 0) {
                    var args = [];
                    if(data instanceof Array && data[0] instanceof Array) {
                        for(var i = 0; i < data.length; i++) {
                            args.push([data[i][0], data[i][1]].join("="));
                        }
                    } else {
                        for(var k in data) {
                            args.push(k + "=" + data[k]);
                        }
                    }
                    args = args.join("&");
                    if(args)
                        url = url + "?" + args;
                }
                return window.open(url);
            }
        },

        isExternalUrl: function(url) {
            if(url.startsWith("http") || url.startsWith("https") || url.startsWith("www."))
                return true;
            else
                return false;
        },

        render: function(browserModel, context) {
            var computedSkin = $KW.skins.getWidgetSkinList(browserModel, context);
            $KU.updateScrollFlag(browserModel);
            var htmlString = "";
            if(browserModel.htmlstring) {
                var htmlString = "";
                var baseHtmlStr = $KW.Utils.getBaseHtml(browserModel, context);
                var heightWidthString = "";
                if($KW.FlexUtils.isFlexWidget(browserModel)) {
                    heightWidthString = " height:100%; width:100%;";
                }
                htmlString += "<div " + baseHtmlStr + " style='" + $KW.skins.getPaddingSkin(browserModel) + "'>";
                htmlString += "<div  id='" + $KW.Utils.getKMasterWidgetID(browserModel) + "_scroller' class='scrollerX  " + computedSkin + "' kwidgettype='KScrollBox' name='touchcontainer_KScroller' swipeDirection ='vertical' style='" + $KW.skins.getBaseStyle(browserModel, context) + heightWidthString + "'>" +
                    "<div id='" + $KW.Utils.getKMasterWidgetID(browserModel) + "_scrollee' class='form_scrollee' kwidgettype='KTouchscrollee'>";
                htmlString += browserModel.htmlstring;
                htmlString += "</div></div></div>";

                return htmlString;
            } else if(browserModel.url) {
                if(this.isExternalUrl(browserModel.url)) {
                    
                    var windowHandler = "webView" + browserModel.id;
                    $KG[windowHandler] = this.openUrllink(browserModel.url, browserModel.method, browserModel.data, $KW.Utils.getKMasterWidgetID(browserModel));
                    
                } else {
                    htmlString = module.localFileRenderImpl(browserModel, computedSkin, {});
                }
            }
            return htmlString;
        },

        eventHandler: function(eventObject, target) {},

        unloadEventHandler: function(widget) {

        },
        cangoback: function(webwidgetID) {

        },

        cangoforward: function(webwidgetID) {

        },

        clearhistory: function(webwidgetID) {

        },

        prepareIframe: function(that, browserModel) {
            var iFrame = that;
            var iFrameHead = iFrame.contentDocument.head;
            var myscript = document.createElement('script');
            if(browserModel.enablenativecommunication) {
                myscript.text = "if(typeof(kony) == 'undefined' || kony){kony={}};var executeInNativeCtx = function(userCallBackInNative){var parentdocument = parent['document'];var scriptTag = parentdocument.createElement('script');scriptTag.text=userCallBackInNative;parentdocument.head.appendChild(scriptTag);};kony.evaluateJavaScriptInNativeContext = executeInNativeCtx;";
            } else {
                myscript.text = "if(typeof(kony) == 'undefined' || kony){kony={}};var executeInNativeCtx = function(){throw ('enableNativeCommunciation property of the browser widget is set to false. Please set to true before invoking kony.executeInNativeContext !');};kony.evaluateJavaScriptInNativeContext = executeInNativeCtx;";
            }
            iFrameHead.appendChild(myscript);
        },

        evaluateJavaScript: function(widgetModel, jscript) {
            var element = $KW.Utils.getContentNodeFromNodeByModel(widgetModel);
            var thislocalframe = element.querySelector("iframe[kwidgettype='KonyLocalFrame']");
            if(thislocalframe) {
                kony.web.logger("log", "executing javascript in " + widgetModel.id + " window handler");
                var iframeHead = thislocalframe.contentDocument.head;
                if(iframeHead == null || iframeHead == undefined) {
                    var appendHead = document.createElement("head");
                    thislocalframe.contentDocument.appendChild(appendHead);
                    iframeHead = thislocalframe.contentDocument.head;
                }
                var iframeDocument = thislocalframe.contentDocument;
                var iframeScript = iframeDocument.createElement("script");
                iframeScript.text = jscript;
                iframeHead.appendChild(iframeScript);
            }
        },

        goBack: function(widgetModel) {
            var iFrameNode = _getIFrameNode(widgetModel);

            
            if(iFrameNode) {
                iFrameNode.contentWindow.history.back();
            }
        },
        goForward: function(widgetModel) {
            var iFrameNode = _getIFrameNode(widgetModel);

            
            if(iFrameNode) {
                iFrameNode.contentWindow.history.forward();
            }
        },
        reload: function(widgetModel) {
            var iFrameNode = _getIFrameNode(widgetModel);

            
            if(iFrameNode) {
                iFrameNode.contentWindow.location.reload(true);
            }
        }
    };


    return module;
}());
