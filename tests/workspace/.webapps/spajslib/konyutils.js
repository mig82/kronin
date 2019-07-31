

function accessorDescriptor(field, fun) {
    var desc = {
        enumerable: true,
        configurable: true
    };
    desc[field] = fun;
    return desc;
}

function defineGetter(obj, prop, get) {
    if(Object.defineProperty)
        return Object.defineProperty(obj, prop, accessorDescriptor("get", get));
    if(Object.prototype.__defineGetter__)
        return obj.__defineGetter__(prop, get);

    throw new Error("browser does not support getters");
}

function defineSetter(obj, prop, set) {
    if(Object.defineProperty)
        return Object.defineProperty(obj, prop, accessorDescriptor("set", set));
    if(Object.prototype.__defineSetter__)
        return obj.__defineSetter__(prop, set);

    throw new Error("browser does not support setters");
}



var vendor = ((/webkit/i).test(navigator.userAgent) && !(/edge/i).test(navigator.userAgent)) ? 'webkit' : (/firefox/i).test(navigator.userAgent) ? 'Moz' : 'opera' in window ? 'o' : ((/msie/i).test(navigator.userAgent) || (/rv:([1][0-9])/i).test(navigator.userAgent)) ? 'ms' : '';
var nextFrame = window['requestAnimationFrame'] || window[vendor + 'RequestAnimationFrame'] || function(callback) {
    return setTimeout(callback, 1);
};
var cancelFrame = window['cancelAnimationFrame'] || window[vendor + 'CancelRequestAnimationFrame'] || clearTimeout;
var Rectangle = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
};
Rectangle.prototype.contains = function(targetR) {
    return(targetR.x >= this.x) && (targetR.y >= this.y) &&
        (targetR.x + targetR.width <= this.x + this.width) && (targetR.y + targetR.height <= this.y + this.height);
};
Rectangle.prototype.intersects = function(targetR) {
    return !((targetR.x + targetR.width <= this.x) ||
        (targetR.y + targetR.height <= this.y) ||
        (targetR.x >= this.x + this.width) ||
        (targetR.y >= this.y + this.height)
    );

};
$KU = kony.utils = {
    Rectangle: Rectangle,

    getValueFromObjectByPath: function(keys, obj, delimiter) {
        var k=0, klen = 0, ref = null;

        if(!(typeof delimiter === 'string' && delimiter)) {
            delimiter = '.';
        }

        if(typeof keys === 'string' && keys) {
            keys = keys.split(delimiter);
        }

        if(keys instanceof Array && typeof obj === 'object' && obj) {
            ref = obj;
            klen = keys.length;

            for(k=0; k<klen; k++) {
                if(typeof ref === 'object' && ref && ref[keys[k]]) {
                    ref = ref[keys[k]];
                } else {
                    break;
                }
            }
        }

        return ref;
    },

    deduceTopLevelFlexModal: function(formModel) {
        var flexPopupModals, activePopup, nodes;

        var _dequeue = function(queue) {
            return queue.shift();
        };
        var _enqueue = function(queue, topLevelObject) {
            if(topLevelObject instanceof Array) {
                queue = queue.concat(topLevelObject);
            } else {
                queue.push(topLevelObject);
            }

            return queue;
        };
        var _getActivePopupFlex = function(flexPopupModals) {
            var activePopup = flexPopupModals[0], i;

            if(flexPopupModals.length > 1) {
                for(i = 1; i < flexPopupModals.length; i++) {
                    if(activePopup.zIndex[1] <= flexPopupModals[i].zIndex[1]) {
                        activePopup = flexPopupModals[i];
                    }
                }
            }

            return activePopup;
        };
        var _getPopupPossibleFlexes = function(flexModals) {
            var possiblePopups = [], i, indexLength = flexModals[0].zIndex.length - 1;

            if(flexModals.length > 1) {

                
                flexModals.sort(function (a, b) {
                    a = a.zIndex[indexLength];
                    b = b.zIndex[indexLength];
                    if (a > b) {
                        return -1;
                    } else {
                        return 1;
                    }
                });

                
                for(i = 0; i < flexModals.length; i++) {
                    possiblePopups.push(flexModals[i]);
                    if(flexModals[i].model.isModalContainer) {
                        break;
                    }
                }

                
                possiblePopups.sort(function (a, b) {
                    a = a.path[indexLength];
                    b = b.path[indexLength];
                    if (a <= b) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
            } else {
                possiblePopups = flexModals;
            }

            return possiblePopups;
        };
        var _isContainerVisible = function(widgetModel) {
            var isContainerVisible = false, activePopup;

            if($KW.FlexUtils.canContainFlexModel(widgetModel) && widgetModel.isVisible) {
                isContainerVisible = true;
            }
            return isContainerVisible;
        };
        var _searchHighestIndexedElement = function(formModel) {
            var queue = [{model: formModel, path: [0], zIndex: [0]}], flexObject, path, zIndex,
                parent, child, children, currentChildModel, popupModals = [], tempList, flexPopupNode;

            while(queue.length > 0) {
                parent = _dequeue(queue);
                children = $KW.Utils.getActualWidgetModel(parent.model).widgets();
                tempList = [];

                for(child = 0; child < children.length; child++) {
                    currentChildModel = children[child];
                    if(_isContainerVisible(currentChildModel)) {
                        path = parent.path.slice(0);
                        path.push(child);
                        zIndex = parent.zIndex.slice(0);
                        zIndex.push(currentChildModel.zIndex);
                        flexObject = {
                            model: currentChildModel,
                            path: path,
                            zIndex: zIndex
                        };

                        tempList.push(flexObject);

                        if(currentChildModel.wType === 'FlexContainer' && currentChildModel.isModalContainer) {
                            popupModals.push(flexObject);
                        }
                    }
                }
                if(tempList.length > 0) {
                    tempList = _getPopupPossibleFlexes(tempList);
                    queue = _enqueue(queue, tempList);
                }
            }
            return popupModals;
        };

        if(!formModel.topLayerFCModal) {
            
            nodes = $KU.getNonFlexModalNodes(formModel);
            $KU.setFlexModalAttribute(nodes, false);
            flexPopupModals = _searchHighestIndexedElement(formModel);

            if(flexPopupModals.length > 0) {
                activePopup = _getActivePopupFlex(flexPopupModals);
            }
            if(activePopup) {
                formModel.topLayerFCModal = activePopup.model;
            }
        }

        if(formModel.topLayerFCModal) {
            
            nodes = $KU.getNonFlexModalNodes(formModel);
            $KU.setFlexModalAttribute(nodes, true);
        }

        return formModel.topLayerFCModal;
    },

    
    nodeIterator: function(parentNode, widgetNodes, popupModalID) {
        var children = parentNode.children, i = 0, childLength = children.length,
            currentChild;

        for(i = 0; i < childLength; i++) {
            currentChild = children[i];
            if(currentChild.id !== popupModalID) {
                if(currentChild.getAttribute('kwidgettype')) {
                    widgetNodes.push(currentChild);
                }
                if(currentChild.children && currentChild.children.length > 0) {
                    $KU.nodeIterator(currentChild, widgetNodes, popupModalID);
                }
            }
        }
    },

    getNonFlexModalNodes: function(formModel) {
        var currentChild, i, id = formModel.id,
            widgetNodes = [], formNode = document.getElementById(id),
            popupModalID =$KU.getPopupModalID(formModel);

        if(formNode) {
            $KU.nodeIterator(formNode, widgetNodes, popupModalID);
        }

        return widgetNodes;
    },

    getPopupModalID: function(formModel) {
        return formModel.topLayerFCModal ? $KW.Utils.getKMasterWidgetID(formModel.topLayerFCModal) : null;
    },

    setFlexModalAttribute: function(nodes, value) {
        var i, nodeCount = nodes.length;

        for(i = 0; i < nodeCount; i++) {
            $KU.setDisabledProperty(nodes[i], 'notinmodal', 'readonly', value);
        }
    },

    shouldRemoveDisabled: function(node) {
        var shouldRemove = true;

        if(node.getAttribute('kdisabled') || node.getAttribute('notinmodal')) {
            shouldRemove = false;
        }
        return shouldRemove;
    },

    setDisabledProperty: function(node, konyAttribute, htmlAttribute, value, widgetModel) {
        var widgettype = node.getAttribute('kwidgettype'), aEle,
            i, attributeFunction = value ? 'setAttribute' : 'removeAttribute', 
            widgetModel = widgetModel || $KU.getModelByNode(node),
            propertyValue, tabHeader, id, removeDisabled;

        
        node[attributeFunction](konyAttribute, value);

        removeDisabled = $KU.shouldRemoveDisabled(node);

        if(konyAttribute === 'kdisabled') {
            widgetModel.disabled = value;
        }

        
        if($KU.isWindowsPhone && $KU.isIE9 && node.tagName === 'SELECT'
        && (removeDisabled || value)) {
            for(i = 0; i < node.childNodes.length; i++) {
                node.children[i].disabled = value;
            }
        }

        
        if(widgettype !== 'Link' && widgettype !== 'Label' && widgettype !== 'HBox' && widgettype !== 'VBox') {
            if(value || removeDisabled) {
                node.disabled = value;
            }
        }

        if(widgettype === 'Link') {
            node.childNodes[0][attributeFunction](konyAttribute, value);
        }

        if(widgetModel && widgetModel.wType === 'Label' && konyAttribute === 'kdisabled') {
            if(!!(!value && widgetModel.textCopyable)) {
                $KU.addClassName(node, 'enableSelection');
                $KU.removeClassName(node, 'disableSelection');
            } else {
                $KU.addClassName(node, 'disableSelection');
                $KU.removeClassName(node, 'enableSelection');
            }
        }

        
        if(widgettype === 'RichText') {
            aEle = document.querySelectorAll("#" + node.id + " a");
        }

        if(widgettype == "RichText" && aEle && value) {
            node.ishref = true;
            node.innerHTML = node.innerHTML.replace(/href=["'].*?["']/g, "href='javascript:void(0)'");
        } else if(node.ishref) {
            node.innerHTML = widgetModel.text;
        }


        if(widgettype == "Video") {
            if(!value && removeDisabled) {
                node.oncontextmenu = "";
                node.playing && node.paused && node.play();
                if(widgetModel.controls)
                    node.setAttribute("controls", "controls");
            } else {
                node.playing && node.pause();
                node.removeAttribute("controls");
                node.oncontextmenu = function() {
                    return false
                };
            }
        }

        
        if(widgetModel && widgetModel.wType === "Map"
        && (node.getAttribute("kwidgettype") === "Map"
        || node.getAttribute("kwidgettype") === "googlemap")) {
            if(removeDisabled || value) {
                if(konyAttribute === 'kdisabled') {
                    widgetModel.disabled = value;
                }
                $KW.Map.setEnabledMap(widgetModel, node);
            }
        }
    },

    checkAndReCalculateTopFlexModal: function(widgetModel, formModel) {
        var checkRequired = $KW.FlexUtils.canContainFlexModel(widgetModel);

        formModel = formModel || $KG.allforms[widgetModel.pf];
        if(checkRequired && formModel) {
            if(document.getElementById(formModel.id)) {
                formModel.topLayerFCModal = null;
                $KU.deduceTopLevelFlexModal(formModel);
            }
        }
    },

    getLocalStorage: function() {
        var store = null,
            data = localStorage.getItem($KG.appid);

        if(typeof data === 'string' && data) {
            try {
                store = JSON.parse(data);
            } catch(e) {
                store = data;
            }
        }

        return store;
    },

    createBlankLocalStorage: function() {
        return {
            migrated: false,
            data: []
        };
    },

    callTargetEventHandler: function(wModel, target, eventType) {
        var containerId = target.getAttribute("kcontainerID");
        if(containerId) {
            $KW.Utils.updateContainerData(wModel, target, false, eventType);
        } else {
            var eventref = $KU.returnEventReference(wModel[eventType]);
            eventref && $KU.executeWidgetEventHandler(wModel, eventref);
        }
    },

    getAllDefaults: function(widget) {
        return kony.defaults.getAllDefaults(widget);
    },

    mergeProperties: function(baseConfig, finalObj, prop) {
        var value = baseConfig[prop];
        if(value && typeof value == "object" && !value.wType) {
            finalObj[prop] = finalObj[prop] || {};
            for(var key in value) {
                $KU.mergeProperties(value, finalObj[prop], key);
            }
        } else {
            finalObj[prop] = value;
        }
    },

    mergeDefaults: function(baseConfig, defaultValuesObject) {
        var finalObj = owl.deepCopy(defaultValuesObject);
        if(baseConfig instanceof Object) {
            for(var prop in baseConfig) {
                if(baseConfig.hasOwnProperty(prop)) {
                    if(typeof finalObj[prop] == "undefined" || finalObj[prop] == null || $KU.isArray(finalObj[prop]))
                        finalObj[prop] = baseConfig[prop];
                    else
                        $KU.mergeProperties(baseConfig, finalObj, prop);
                }
            }
        }

        if(typeof finalObj["id"] == 'undefined' || finalObj["id"] == null) {
            finalObj["id"] = "konyRandomId" + ($KG["uniqueId"]++);
        }

        return finalObj;
    },

    equals: function(arg1, arg2) {
        if(Object.prototype.toString.call(arg1) !== Object.prototype.toString.call(arg2)) {
            return false;
        } else if(Object.prototype.toString.call(arg1) === '[object Array]') {
            if(arg1.length !== arg2.length) {
                return false;
            }
            for(var i = 0; i < arg2.length; i++) {
                if(!$KU.equals(arg1[i], arg2[i])) {
                    return false;
                }
            }
            return true;
        } else if(Object.prototype.toString.call(arg1) === '[object Object]') {
            for(var k in arg2) {
                if(Object.prototype.toString.call(arg2[k]) !== '[object Function]') {
                    if(!$KU.equals(arg1[k], arg2[k])) {
                        return false;
                    }
                }
            }
            return true;
        } else if(Object.prototype.toString.call(arg2) !== '[object Function]') {
            return(arg1 === arg2);
        }
    },

    isMouseEventSupported: function() {
        var flag = false;

        try {
            document.createEvent("MouseEvent");
            flag = true;
        } catch(e) {
            flag = false;
        }

        return flag;
    },

    isArray: function(value) {
        return(Object.prototype.toString.call(value) === '[object Array]');
    },

    addArray: function(srcArray, targetArray) {
        srcArray.push.apply(srcArray, targetArray);
        return srcArray;
    },

    arrayIndex: function(arr, val) {
        for(var i = 0; i < arr.length; i++) {
            if($KU.equals(arr[i], val)) {
                return i;
            }
        }
        return -1;
    },

    inArray: function(array, elem, noindex) {
        var index = -1;
        if(array) {
            index = $KU.arrayIndex(array, elem);
        }
        if(noindex) {
            return(index == -1) ? false : true;
        } else {
            return(index == -1) ? [false, -1] : [true, index];
        }
    },

    removeArray: function(arr) {
        var what, a = arguments,
            L = a.length,
            ax;
        while(L > 1 && arr && arr.length) {
            what = a[--L];
            while((ax = arr.indexOf(what)) != -1) {
                arr.splice(ax, 1);
            }
        }
        return arr;
    },

    joinArray: function(arr, seperator) {
        seperator = seperator || ",";
        return arr[1 + IndexJL] + seperator + arr[2 + IndexJL] + seperator + arr[3 + IndexJL] + seperator + arr[0 + IndexJL];
    },

    mergeObjects: function(target, source) {
        var target = target || {};
        var empty = {};
        if(source) {
            var name, s;
            for(name in source) {
                s = source[name];
                if(empty[name] !== s) {
                    target[name] = s;
                }
            }
        }
        return target;
    },

    convertObjectToArray: function(obj) {
        var arr = [];
        for(var key in obj) {
            arr[key] = obj[key];
        }
        return arr;
    },

    getkeys: function(anobject) {
        return(Object.keys && Object.keys(anobject)) || (function() {
            var keylist = [];
            for(var i in anobject) {
                keylist.push(i);
            }
            return keylist;
        }());
    },

    getKey: function(obj, value) {
        for(var key in obj) {
            if(obj[key] === value) return key;
        }
    },

    adjustNodeIndex: function(node, startIndex, attr) { 
        var rows = node.childNodes;
        startIndex = startIndex - IndexJL;
        startIndex = (rows.length > startIndex) ? startIndex : (rows.length - 1);
        if(rows && rows.length > 0) {
            for(var i = startIndex; i < rows.length; i++) {
                rows[i].setAttribute(attr, i + IndexJL);
            }
        }
    },

    toggleVisibilty: function(node, data, model, needWidgetNode) {
        var isFlexWidget = $KW.FlexUtils.isFlexWidget(model);
        if(needWidgetNode != false) {
            if(isFlexWidget || (model.wType == 'Segment' && model.viewtype === constants.SEGUI_VIEW_TYPE_PAGEVIEW))
                node = node.parentNode;
        }
        if(data && data.length > 0 && model.isvisible) {
            this.removeClassName(node, "hide");
        } else {
            this.addClassName(node, "hide");
        }
    },

    
    removeClassNames: function(elem, selector) {
        
    },

    addClassNames: function(elem, selector) {
        
    },

    removeClassName: function(elem, selector) {
        if(elem.classList && selector) {
            elem.classList.remove(selector);
        } else if($KU.hasClassName(elem, selector)) {
            var className = elem.className;
            elem.className = className.replace(new RegExp("(^|\\s+)" + selector + "(\\s+|$)"), ' ');
        }
    },

    hasClassName: function(elem, className) {
        return(elem.classList && className) ? elem.classList.contains(className) : (elem.className.length > 0 && (elem.className == className || new RegExp("(^|\\s)" + className + "(\\s|$)").test(elem.className)));
    },

    addClassName: function(elem, className) {
        if(elem.classList && className) {
            elem.classList.add(className);
        } else if(!$KU.hasClassName(elem, className))
            elem.className += (elem.className ? ' ' : '') + className;
    },

    getElementById: function(id, doc) {
        return(typeof id == "string") ? ((doc || document).getElementById(id) || null) : null;
    },

    getPosition: function(el) {
        var left = 0,
            top = 0,
            box = el.getBoundingClientRect();

        if(box) {
            left = box.left;
            top = box.top;
        }

        if(window.pageYOffset) {
            left += window.pageXOffset;
            top += window.pageYOffset;
        } else if(el.ownerDocument.documentElement.scrollTop) {
            left += el.ownerDocument.documentElement.scrollLeft;
            top += el.ownerDocument.documentElement.scrollTop;
        } else if(document.body.scrollTop) {
            left += document.body.scrollLeft;
            top += document.body.scrollTop;
        }

        if(el.ownerDocument.documentElement.clientTop) {
            left -= el.ownerDocument.documentElement.clientLeft;
            top -= el.ownerDocument.documentElement.clientTop;
        } else if(document.body.clientTop) {
            left -= document.body.clientLeft;
            top -= document.body.clientTop;
        }

        return {
            top: top,
            left: left,
            bottom: top + el.offsetHeight,
            right: left + el.offsetWidth,
            width: el.offsetWidth,
            height: el.offsetHeight
        };
    },

    getAnchorPosition: function(widgetModel, anchorElement) {
        var widgetContext = widgetModel.context;
        var leftPos = 0,
            topPos = 0;
        var contextElementPosition = $KU.getPosition($KU.getNodeByModel(widgetContext.widget));
        var bodyWidth = 0;
        var bodyHeight = 0;

        var documentBody = document.body;
        var documentHeight;
        if(document.height != undefined) {
            documentHeight = document.height;
        } else {
            if(documentBody.scrollHeight != undefined && documentBody.offsetHeight != undefined) {
                documentHeight = Math.max(documentBody.scrollHeight, documentBody.offsetHeight);
            } else {
                documentHeight = documentBody.scrollHeight || documentBody.offsetHeight;
            }
        }

        if($KU.isMobile() == true && window.orientation != undefined) {
            if(window.orientation === 90 || window.orientation === -90) { 
                bodyWidth = window.innerHeight;
                bodyHeight = documentHeight; 
            }
            if(window.orientation === 0 || window.orientation === 180) { 
                bodyWidth = window.innerWidth;
                bodyHeight = documentHeight; 
            }
        } else {
            bodyWidth = window.innerWidth;
            bodyHeight = screen.height;
        }

        if(widgetContext.anchor == "bottom") {
            if(contextElementPosition.bottom + anchorElement.offsetHeight > bodyHeight)
                topPos = contextElementPosition.bottom - (contextElementPosition.bottom + anchorElement.offsetHeight - bodyHeight);
            else
                topPos = contextElementPosition.bottom;

            if(contextElementPosition.left + anchorElement.offsetWidth > bodyWidth)
                leftPos = 0;
            else
                leftPos = contextElementPosition.left;
        }

        if(widgetContext.anchor == "top") {
            if(contextElementPosition.top - anchorElement.offsetHeight < 0)
                topPos = 0;
            else
                topPos = contextElementPosition.top - anchorElement.offsetHeight;

            if(contextElementPosition.left + anchorElement.offsetWidth > bodyWidth)
                leftPos = 0;
            else
                leftPos = contextElementPosition.left;
        }

        if(widgetContext.anchor == "right") {
            if(contextElementPosition.top + anchorElement.offsetHeight > bodyHeight)
                topPos = contextElementPosition.top - (contextElementPosition.top + anchorElement.offsetHeight - bodyHeight);
            else
                topPos = contextElementPosition.top;

            if(contextElementPosition.left + contextElementPosition.width + anchorElement.offsetWidth > bodyWidth) {
                leftPos = contextElementPosition.left + contextElementPosition.width - (contextElementPosition.left + contextElementPosition.width + anchorElement.offsetWidth - bodyWidth);
            } else {
                leftPos = contextElementPosition.left + contextElementPosition.width;
            }
        }

        if(widgetContext.anchor == "left") {
            if(contextElementPosition.top + anchorElement.offsetHeight > bodyHeight)
                topPos = contextElementPosition.top - (contextElementPosition.top + anchorElement.offsetHeight - bodyHeight);
            else
                topPos = contextElementPosition.top;

            if(contextElementPosition.left - anchorElement.offsetWidth < 0) {
                leftPos = 0;

            } else {
                leftPos = contextElementPosition.left - anchorElement.offsetWidth;
            }
        }
        return {
            leftPos: leftPos,
            topPos: topPos
        };
    },

    getNodeByModel: function(model) {
        if(model && model.kmasterid) {
            return document.getElementById(model.pf + "_" + model.kmasterid + "_" + model.id);
        }
        return model ? (document.getElementById(model.pf + "_" + model.id) || document.getElementById(model.id)) : null;
    },

    getElementID: function(id) {
        return(id && typeof id == "string") ? id.substring(id.indexOf("_") + 1, id.length) : null;
    },

    getModelByNode: function(target) {
        if(target.hasAttribute('overlay')) {
            var parentNode = $KU.getParentByAttribute(target.parentNode, 'kwidgettype');
            var parentModel = this.getModelByNode(parentNode.childNodes[0].childNodes[0]);
            var targetID = target.getAttribute('id');
            var overlayWidgets = parentModel.overlayWidgets;
            var i, targetWidget;

            for(i = 0; i < overlayWidgets.length; i++) {
                if(overlayWidgets[i].id === targetID) {
                    targetWidget = overlayWidgets[i];
                    break;
                }
            }
            return targetWidget;
        }
        if(target == null)
            return;
        if(target.getAttribute("kmasterid")) {
            return this.getWidgetModelByID(target.getAttribute("id")); 
        }
        var widgetID = this.getElementID(target.getAttribute("id")); 
        var tabPaneID = target.getAttribute("ktabpaneid");
        var formID = target.getAttribute("kformname") || target.id;
        return kony.model.getWidgetModel(formID, widgetID, tabPaneID);
    },

    getScreenLevelWidgetModel: function(formModel) {
        
        var screenlLevelWidgetModel;
        if(formModel['screenLevelWidgets']) {
            for(var slw in formModel['screenLevelWidgets']) {
                if(formModel['screenLevelWidgets'][slw].isvisible && formModel['screenLevelWidgets'][slw].needScroller != true) {
                    screenlLevelWidgetModel = formModel['screenLevelWidgets'][slw];
                    break;
                }
            }
        }
        return screenlLevelWidgetModel;
    },

    getPullString: function(scroller) {
        var idString = scroller.pf + "_" + scroller.id + "_pullDown";
        
        return "<div class='pullDown' id='" + idString + "'>\
                    <span class='pullDownIcon'></span>\
                    <span class='pullDownLabel'>Pull down to refresh...</span>\
                </div>";
    },

    getPushString: function(scroller) {
        var idString = scroller.pf + "_" + scroller.id + "_pullUp";
        
        return "<div class='pullUp' id='" + idString + "'>\
                    <span class='pullUpIcon'></span>\
                    <span class='pullUpLabel'>Pull up to refresh...</span>\
                </div>";
    },

    getFSCPullString: function(model) {
        var idString = $KW.Utils.getKMasterWidgetID(model) + "_pullDown";
        var pullText = "", icon, iconStyle = "", name ="";
        var htmlstring = "";
        var direction = $KW.stringifyScrolldirection[model.scrolldirection];

        model._pullPreference = "text";
        if(direction == "horizontal") {
            model._pullPreference = "icon";
        } else if(model.pullkey || model.releasepullkey) {
            model._pullPreference = "text";
        } else if(model.pullicon) {
            model._pullPreference = "icon";
        }

        if(model._pullPreference == "text") {
            pullText = model.pullkey || "Pull to refresh";
        } else {
            icon = model.pullicon ? model.pullicon : "fsc_left.png";
            iconStyle = "background-image: url(./"+$KU.getImageURL(icon)+")";
        }

        name = model.animateicons ? "pullDownAnimate" : "pullDown";

        htmlstring += "<div name = '"+ name +"' class='pullDown' id='" + idString + "'>";
        if(model._pullPreference == "icon") {
            htmlstring += "<span class='pullDownIcon' style = '"+iconStyle+"'></span>";
        } else  {
            htmlstring +="<span class='pullDownLabel "+ model.pullskin +"'>"+ pullText +"</span>";
        }
        htmlstring += "</div>";
        return htmlstring;
    },

    getFSCPushString: function(model) {
        var idString = $KW.Utils.getKMasterWidgetID(model) + "_pullUp";
        var pushText = "", icon, iconStyle = "", name = "";
        var htmlstring = "";
        var direction = $KW.stringifyScrolldirection[model.scrolldirection];

        model._pushPreference = "text";
        if(direction == "horizontal") {
            model._pushPreference = "icon";
        } else if(model.pushkey || model.releasepushkey) {
            model._pushPreference = "text";
        } else if(model.pushicon) {
            model._pushPreference = "icon";
        }

        if(model._pushPreference == "text") {
            pushText = model.pushkey || "Push to refresh";
        } else {
            icon = model.pushicon ? model.pushicon : "fsc_right.png";
            iconStyle = "background-image: url(./"+$KU.getImageURL(icon)+")";
        }

        name = model.animateicons ? "pullUpAnimate" : "pullUp";

        htmlstring += "<div name = '"+ name +"' class='pullUp' id='" + idString + "'>";
        if(model._pushPreference == "icon") {
            htmlstring += "<span class='pullUpIcon' style = '"+iconStyle +"'></span>";
        } else {
            htmlstring +="<span class='pullUpLabel " + model.pushskin + "'>"+ pushText +"</span>";
        }
        htmlstring += "</div>";
        return htmlstring;
    },
    getModelByScroller: function(_scroller) {
        var srollbox = _scroller.substring(0, _scroller.lastIndexOf("_"));
        var scrollboxNode = $KU.getElementById(srollbox);
        return $KU.getModelByNode(scrollboxNode);
    },

    getNextSibling: function(node) {
        var x = node.nextSibling;
        while(x.nodeType != 1) {
            x = x.nextSibling;
        }
        return x;
    },

    
    getWidgetModelByID: function(targetID) {
        if(!targetID) return;
        var strArr = targetID.split("_");
        var childModel = kony.model.getWidgetRef(strArr.shift());
        while(strArr.length > 0) {
            childModel = $KW.Utils.getActualWidgetModel(childModel);
            childModel = childModel[strArr.shift()];
        }
        return childModel;
    },

    checkHeaderFooterTemplate: function(formModel, flexModel) {
        if(formModel.headers) {
            for(var list = 0; list < formModel.headers.length; list++) {
                if(flexModel.id == formModel.headers[list].id) {
                    return true;
                }
            }
        }
        if(formModel.footers) {
            for(var list = 0; list < formModel.footers.length; list++) {
                if(flexModel.id == formModel.footers[list].id) {
                    return true;
                }
            }
        }
        return false;
    },

    updatei18nProperties: function(wArray) {
        for(var model in wArray) {
            var widgetref = wArray[model];
            $KI.i18n && $KI.i18n.translateFormModel(widgetref);
        }
    },

    applyFade: function(elem, trans, dur) {
        elem.style[$KU.animationDuration] = dur + "ms";
        elem.style[$KU.animationName] = trans;
        if(trans == "fadeIn")
            elem.style.display = "";
        else {
            elem.style.display = "none";
            elem.style[$KU.animationName] = "none";
        }
    },

    getParentByAttribute: function(node, attribute) {
        var cur = node;
        while(cur) {
            var type = cur.getAttribute && cur.getAttribute(attribute);
            if(type) {
                return cur;
            }
            cur = cur.parentNode;
        }
    },

    getParentByAttributeValue: function(node, attribute, value) {
        var cur = node;
        while(cur) {
            var type = cur.getAttribute && cur.getAttribute(attribute);
            if(type == value) {
                return cur;
            }
            cur = cur.parentNode;
        }
    },

    getParentByTagName: function(node, localName) {
        while(node && (node.nodeType != 1 || node.nodeName.toLowerCase() != localName)) {
            node = node.parentNode;
        }
        return node;
    },

    getParentModel: function(childModel) {
        return childModel.parent;
    },

    getContainerForm: function(node) {
        var containerId = node.getAttribute("kcontainerid");
        if(containerId) {
            var cur = node;
            var id;
            while(cur) {
                id = cur.id && cur.id.split("_")[1];
                if(id == containerId && cur.getAttribute("kformname")) {
                    return cur.getAttribute("kformname");
                }
                cur = cur.parentNode;
            }
        } else {
            var formName = node.getAttribute("kformname");
            if(formName) {
                var topModel = kony.model.getWidgetRef(formName); 
                if(topModel.wType == 'Form' || topModel.wType == 'Popup') {
                    return formName;
                } else { 
                    var topNode = $KU.getNodeByModel(topModel);
                    return topNode.parentNode.getAttribute("kformname");
                }
            }
        }
        return "";
    },

    cloneObj: function(srcInstance) {
        if(typeof(srcInstance) != "object" || srcInstance == null)
            return srcInstance;
        var newInstance = srcInstance.constructor();
        for(var i in srcInstance) {
            if(srcInstance.hasOwnProperty(i))
                newInstance[i] = this.cloneObj(srcInstance[i]);
        }
        return newInstance;
    },

    
    invokeAddWidgets: function(widget) {
        if(!widget.addWidgetsdone) {
            widget.addWidgetsdone = true;
            widget.ownchildrenref = [];
            widget.children = [];
            if(widget.addWidgets) {
                if(typeof widget.addWidgets == "string") {
                    window[widget.addWidgets](widget);
                } else if(typeof widget.addWidgets == "function") {
                    widget.addWidgets(widget);
                }
            }
        }
    },

    
    invokeWidgetInit: function(widget) {
        !widget.initdone && widget.init && $KU.executeWidgetEventHandler(widget, widget.init);
        widget.initdone = true;
    },

    returnEventReference: function(eventObj) {
        return typeof(eventObj) == 'function' ? eventObj : (typeof(eventObj) == 'string' ? window[eventObj] : undefined);
    },

    returnObjectReference: function(obj) {
        return typeof(obj) == 'object' ? obj : (typeof(obj) == 'string' ? window[obj] : undefined);
    },

    
    getStringFromBase64: function(s) {
        var e = {},
            i, b = 0,
            c, x, l = 0,
            a, r = '',
            w = String.fromCharCode,
            L = s.length;
        var A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for(i = 0; i < 64; i++) {
            e[A.charAt(i)] = i;
        }
        for(x = 0; x < L; x++) {
            c = e[s.charAt(x)];
            b = (b << 6) + c;
            l += 6;
            while(l >= 8) {
                ((a = (b >>> (l -= 8)) & 0xff) || (x < (L - 2))) && (r += w(a));
            }
        }
        return r;
    },

    
    getDecodedPropValue: function(propValue) {
        if(!(propValue.substr(0, 1) == "{")) {
            propValue = $KU.getStringFromBase64(propValue);
        }
        return propValue;
    },

     konyRawBytes: function(rawBytes, type) {
        this.rawBytes = rawBytes;
        this.type = type;
    },

    getBase64: function(data) {
        
        
        
        
        
        
        
        if(data instanceof kony.utils.konyRawBytes) {
            if(data.type == "utf8") {
                return btoa(data.rawBytes);
            }
        }

        if(!data) return data;

        if(typeof data != "string") {
            return data;
        }

        if('btoa' in window)
            return window.btoa(unescape(encodeURIComponent(data)));

        var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
            ac = 0,
            enc = "",
            tmp_arr = [];

        do { 
            o1 = data.charCodeAt(i++) & 0xff;
            o2 = data.charCodeAt(i++) & 0xff;
            o3 = data.charCodeAt(i++) & 0xff;

            bits = o1 << 16 | o2 << 8 | o3;

            h1 = bits >> 18 & 0x3f;
            h2 = bits >> 12 & 0x3f;
            h3 = bits >> 6 & 0x3f;
            h4 = bits & 0x3f;

            tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        } while (i < data.length);

        enc = tmp_arr.join('');

        switch(data.length % 3) {
            case 1:
                enc = enc.slice(0, -2) + '==';
                break;
            case 2:
                enc = enc.slice(0, -1) + '=';
                break;
        }

        return enc;
    },

    
    isValidDate: function(dtStr, format) {
        var dEY = {};
        dtStr = dtStr.split('/');
        format = format.split('/');
        for(var i = 0, l = format.length; i < l; i++) {
            dEY[format[i]] = dtStr[i];
        }
        var date = new Date(dEY.yyyy || ((dEY.yy * 1) + 2000), dEY.mm - 1, dEY.dd);
        if(Object.prototype.toString.call(date) === "[object Date]" && (date.getFullYear() == (dEY.yyyy || ((dEY.yy * 1) + 2000)) && date.getFullYear() >= 1900 && date.getFullYear() <= 2100 && date.getMonth() + 1 == dEY.mm && date.getDate() == dEY.dd)) {
            return true;
        } else {
            return false;
        }
    },

    daysArray: function(n) {
        var y = new Date().getFullYear();
        for(var i = 1; i <= n; i++) {
            this[i] = new Date(y, n, 0).getDate();
        }
        return this;
    },

    daysInFebruary: function(year) {
        return new Date(year, 2, 0).getDate();
    },

    isInteger: function(s) {
        var i;
        for(i = 0; i < s.length; i++) {
            
            var c = s.charAt(i);
            if(((c < "0") || (c > "9")))
                return false;
        }
        
        return true;
    },

    getInt: function(i) {
        var n = parseInt(i);
        return n == null || isNaN(n) ? 0 : n;
    },

    getDate: function(date, format) {
        var dateObj;
        if(typeof date === "string" && typeof format === "string") {
            var dateParts = date.split("/");
            var yr = new Date().getFullYear().toString().substr(0, 2);
            if(format.indexOf("yyyy") == -1 || dateParts[2].length == 2)
                dateParts[2] = yr + dateParts[2];

            if(format == "mm/dd/yyyy" || format == "mm/dd/yy")
                dateObj = new Date(dateParts[0] + "/" + dateParts[1] + "/" + dateParts[2]);
            else
                dateObj = new Date(dateParts[1] + "/" + dateParts[0] + "/" + dateParts[2]);

            return dateObj;
        }
    },

    getDayOfYear: function(day, month, year) {
        return(Math.ceil((new Date(year, month - 1, day) - new Date(year, 0, 1)) / 86400000)) + 1;
    },

    
    getIntegerDirection: function(strDirection) {
        switch(strDirection) {
            case "LEFT":
                return 1;
            case "RIGHT":
                return 2;
            case "UP":
                return 3;
            case "DOWN":
                return 4;
        }
    },

    getSwipeDirection: function(deltaX, deltaY) {
        
        var radians = Math.atan2(-deltaY, -deltaX); 
        var angle = Math.round(radians * 180 / Math.PI); 

        
        if(angle < 0)
            angle = 360 - Math.abs(angle);

        var direction;

        if((angle <= 45) && (angle >= 0))
            direction = $KW.touch.TouchContext.LEFT;
        else if((angle <= 360) && (angle >= 315))
            direction = $KW.touch.TouchContext.LEFT;
        else if((angle >= 135) && (angle <= 225))
            direction = $KW.touch.TouchContext.RIGHT;
        else if((angle > 45) && (angle < 135))
            direction = $KW.touch.TouchContext.UP;
        else
            direction = $KW.touch.TouchContext.DOWN;

        return direction;
    },

    getDistanceMoved: function(deltaX, deltaY) {
        var absDeltaX = Math.abs(deltaX);
        var absDeltaY = Math.abs(deltaY);
        return(Math.round(Math.sqrt(Math.pow(absDeltaX, 2) + Math.pow(absDeltaY, 2))));
    },

    isMobile: function() {
        if(navigator.userAgent.match(/Mobile/i) && (navigator.userAgent.match(/AppleWebKit/i) || navigator.userAgent.match(/Phone/i))) {
            return true;
        }
    },

    getPlatform: function() {
        if(!$KU.platform) {
            var platform = {};
            platform.name = $KU.getPlatformName();
            platform.version = $KU.getPlatformVersion(platform.name);
            $KU.platform = platform
        }
        return $KU.platform;
    },

    getPlatformName: function() {
        if($KU.isAndroid && $KU.isTablet)
            return "androidtablet";
        if($KU.isAndroid)
            return "android";
        if($KU.isiPhone)
            return "iphone";
        if($KU.isiPad)
            return "ipad";
        if($KU.isBlackBerryNTH)
            return "blackberryNTH";
        if($KU.isBlackBerry || $KU.isPlaybook)
            return "blackberry";
        if($KU.isTouchPad)
            return "webos";
        if($KU.isWindowsPhone)
            return "windowsphone";
        if($KU.isWindowsTablet)
            return "windowstablet";
        if(!navigator.userAgent.match(/Mobile/i))
            return "desktop";
        else
            return "";
    },

    getPlatformVersion: function(name) {
        var ver = "";
        var userAgent = navigator.userAgent;
        switch(name) {
            case "android":
            case "androidtablet":
                userAgent.match(/Android ([0-9.]+)/);
                ver = RegExp.$1;
                break;
            case "iphone":
                userAgent.match(/iPhone OS ([0-9_]+)/);
                ver = RegExp.$1.replace(/_/g, ".");
                break;
            case "ipad":
                userAgent.match(/CPU OS ([0-9_]+)/);
                ver = RegExp.$1.replace(/_/g, ".");
                break;
            case "blackberryNTH":
            case "blackberry":
                userAgent.match(/Version\/([0-9.]+)/);
                ver = RegExp.$1;
                break;
            case "windowsphone":
                userAgent.match(/(Windows Phone OS|Windows Phone) ([0-9]{1,}[\.0-9]{0,})/) || userAgent.match(/rv:(\d+)/);
                ver = RegExp.$2;
                break;
            case "windowstablet": 
                userAgent.match(/MSIE ([0-9]{1,}[\.0-9]{0,})/) || userAgent.match(/rv:(\d+)/);
                ver = RegExp.$1;
                break;
            default:
                ver = 0;
        }
        return ver;
    },

    getDeviceId: function() {
        var id = '', store = null, data = null;

        function generateGUID() {
            var guid = '';

            if(window.crypto) {
                guid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function (c) {
                    return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
                });
            } else {
                guid = new Date().getTime();

                if(window.performance && typeof performance.now === 'function') {
                    guid += performance.now();
                }

                guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = (guid + Math.random() * 16) % 16 | 0;

                    guid = Math.floor(guid / 16);

                    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
                });
            }

            return guid.toUpperCase();
        }

        if(window.localStorage && typeof localStorage.getItem === 'function') {
            data = localStorage.getItem($KG.appid);

            if(typeof data === 'string' && data) {
                try {
                    store = JSON.parse(data);
                } catch(e) {
                    store = data;
                }
            }

            if(typeof store === 'object' && store) {
                if(typeof store.deviceId === 'string' && store.deviceId) {
                    id = store.deviceId;
                } else {
                    store.deviceId = id = generateGUID();
                    localStorage.setItem($KG.appid, JSON.stringify(store));
                }
            }
        } else if(typeof $KG.appid === 'string' && $KG.appid) {
            id = generateGUID();
        }

        return id;
    },


    detectDevice: function() {
        var platform = $KU.getPlatform();
        var platformName = platform.name;
        var platformVersion = platform.version;

        

        if(platformName == "iphone" || platformName == "ipad") {
            $KU.iOS = true;
            if(platformVersion < "5")
                $KU.iOS4 = true;
        }

        var delay = $KU.orientationDelayMatrix[platformName];
        if($KU.isAndroid) {
            if($KU.isAndroid_SonyXPeria)
                delay = $KU.orientationDelayMatrix["SonyXPeria"];
            else if($KU.isAndroid_Galaxy && $KU.isMob) {
                if(window.devicePixelRatio && window.devicePixelRatio > 1.5)
                    delay = 500; 
                else
                    delay = $KU.orientationDelayMatrix["GT"];
            } else if($KU.isAndroid_Nexus)
                delay = $KU.orientationDelayMatrix["Nexus"];
        }
        $KU.orientationDelay = delay || 100;

        if(platformName == "blackberryNTH") {
            $KG["nativeScroll"] = true;
            $KG["disableTransition"] = true;
        } else if(platformName == "windowsphone" && $KU.isIE9) {
            $KG["nativeScroll"] = true;
            $KG["disableTransition"] = true;
        }

        
        if($KG["useNativeScroll"]) {
            $KG["nativeScroll"] = true;
            $KG["disableTransition"] = false;
        }

        if($KG["nativeScroll"])
            $KG["needScroller"] = false;
        else {
            $KG["needScroller"] = true;
            document.body.style.overflowY = "hidden";
        }

        
        if($KU.isiPhone && $KU.getPlatformVersion("iphone").startsWith("4") && !$KG["nativeScroll"]) {
            $KG.disableViewPortScroll = true;
        }
    },

    detectOrientation: function() {
        var orientation = window.orientation;
        if(typeof orientation == "undefined" && window.matchMedia) { 
            if(window.matchMedia("(orientation: portrait)").matches)
                orientation = "portrait";
            else if(window.matchMedia("(orientation: landscape)").matches)
                orientation = "landscape";
            else
                orientation = "";
        } else {
            switch(orientation) {
                case 0:
                case 180:
                    orientation = ($KU.isAndroid && $KU.isTablet) ? "landscape" : "portrait";
                    break;
                case 90:
                case -90:
                    orientation = ($KU.isAndroid && $KU.isTablet) ? "portrait" : "landscape";
                    break;
            }
        }
        return orientation;
    },

    getBrowserLanguage: function() {
        var language;
        var httpheaders = kony.globals["httpheaders"];
        if(httpheaders && httpheaders["Accept-Language"]) {
            language = httpheaders["Accept-Language"].split(",")[0];
        } else {
            language = navigator.language || navigator.userLanguage || $KG["defaultlocale"];
        }

        return language;
    },

    domRefresh: function(element) {
        if(element) {
            var currentMargin = element.style["margin"];
            element.style["margin"] = "1px";
            setTimeout(function() {
                element.style["margin"] = currentMargin;
            }, 10);
        }
    },

    convertjsontoluaobject: function(jsonobj) {
        
    },

    getWindowWidth: function() {
        return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    },

    getWindowHeight: function() {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    },

    
    getScrollBarWidth: function() {
        var inner = document.createElement('p');
        inner.style.width = "100%";
        inner.style.height = "200px";

        var outer = document.createElement('div');
        outer.style.position = "absolute";
        outer.style.top = "0px";
        outer.style.left = "0px";
        outer.style.visibility = "hidden";
        outer.style.width = "200px";
        outer.style.height = "150px";
        outer.style.overflow = "hidden";
        outer.appendChild(inner);

        document.body.appendChild(outer);
        var w1 = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        var w2 = inner.offsetWidth;
        if(w1 == w2)
            w2 = outer.clientWidth;

        document.body.removeChild(outer);

        return(w1 - w2);
    },

    convertluatojsonobject: function(luaobj) {

    },

    getImageCenterAlign: function(imgNode, updateUI, dimensions) {
        
        if(imgNode.naturalWidth) {
            var spanHeight = dimensions ? dimensions.spanHeight : imgNode.parentNode.clientHeight;
            var imgHeight = dimensions ? dimensions.imgHeight : imgNode.offsetHeight;
            var mtop = parseInt(spanHeight, 10) - parseInt(imgHeight, 10);
            if(updateUI) {
                if(mtop > 0) {
                    imgNode.style.marginTop = mtop / 2 + "px";
                } else {
                    imgNode.style.marginTop = "";
                }
            } else {
                return mtop / 2;
            }
        }
    },

    setImgAspectRatio: function(widgetModel, img, dimensions, updateUI) {
        if(!img) return;
        var isFlexWidget = $KW.FlexUtils.isFlexWidget(widgetModel);
        var referencewidth, referenceheight, explicitlyMadeVisible;
        if(widgetModel.wType == 'Image' && isFlexWidget) {
            referencewidth = $KU.getReferenceWidth(widgetModel, img, dimensions.width);
            referenceheight = $KU.getReferenceHeight(widgetModel, img, dimensions.height);
        } else {
            referencewidth = widgetModel.referencewidth;
            referenceheight = widgetModel.referenceheight;
        }

        var actimgdim = $KW.Image.getNaturalDimensions(img);
        var nWidth = actimgdim.width;
        var nHeight = actimgdim.height;

        var aspectRatio = nWidth / nHeight;
        var hasWidth = $KU.isPositiveInteger(referencewidth);
        var hasHeight = $KU.isPositiveInteger(referenceheight);
        if(!isNaN(aspectRatio) && (hasWidth || hasHeight)) {
            referencewidth = referencewidth;
            referenceheight = referenceheight;
            if(nWidth > referencewidth || nHeight > referenceheight) {
                var width = (hasWidth && (nWidth > referencewidth) && referencewidth > 0) ? referencewidth : nWidth;
                var height = referenceheight > 0 ? referenceheight : nHeight;
                var imgdim = ((width / aspectRatio) < height || !hasHeight) ? (width / aspectRatio) : false;
                if(imgdim == false)
                    width = (height * aspectRatio <= referencewidth || !hasWidth) ? height * aspectRatio : width;
                else
                    height = imgdim;

                if(height > 0 && height < 1)
                    height = 1;

                if(width > 0 && width < 1)
                    width = 1;

                if(typeof updateUI == 'undefined') {
                    if(isFlexWidget) {
                        img.style.width = width + "px";
                        img.style.height = height + "px";
                    } else {
                        if(widgetModel.wType == "HStrip" && widgetModel.viewtype == constants.HORIZONTAL_IMAGESTRIP_VIEW_TYPE_SLOTVIEW) {
                            img.style.width = width + "px";
                            img.style.height = height + "px";

                        } else {
                            img.style.width = img.parentNode.style.width = width + "px";
                            img.style.height = img.parentNode.style.height = height + "px";
                        }
                    }
                } else if(isFlexWidget) {
                    dimensions.width = width + "px";
                    dimensions.height = height + "px";
                }
            } else if(updateUI == false && isFlexWidget) {
                dimensions.width = nWidth + "px";
                dimensions.height = nHeight + "px";
            }
        }
        if(updateUI == false)
            return dimensions;
    },

    setImgDimensions: function(imageModel, imgNode, dimensions, updateUI) {
        var referencewidth = $KU.getReferenceWidth(imageModel, imgNode, dimensions.width);
        var referenceheight = $KU.getReferenceHeight(imageModel, imgNode, dimensions.height);
        if(updateUI == false)
            return {
                width: "100%",
                height: +"100%"
            };
        if(referencewidth >= 0) {
            imgNode.style.width = "100%"
            if(referenceheight >= 0) {
                imgNode.style.height = "100%";
            }
        }
    },

    getReferenceWidth: function(imgModel, imgNode, width) {
        var refWidth = imgModel.referencewidth;
        if(imgModel.wType == 'Image' && $KW.FlexUtils.isFlexWidget(imgModel)) {
            var valueObj = {
                value: parseFloat(width),
                unit: $KW.FlexUtils.getUnit(width)
            };
            refWidth = $KW.FlexUtils.getValueByParentFrame(imgModel, valueObj, 'x');
            var span = imgNode.parentNode;
            var computedStyle = $KU.getComputedStyle(span);
            if(computedStyle) {
                
                
                var hBorder = parseInt(computedStyle["border-left-width"], 10) + parseInt(computedStyle["border-right-width"], 10);
                var hPadding = parseInt(computedStyle["padding-left"], 10) + parseInt(computedStyle["padding-right"], 10);
                refWidth = refWidth - hPadding - hBorder;
            }

        }
        return refWidth;
    },

    getReferenceHeight: function(imgModel, imgNode, height) {
        var refheight = imgModel.referenceheight;
        if(imgModel.wType == 'Image' && $KW.FlexUtils.isFlexWidget(imgModel)) {
            var valueObj = {
                value: parseFloat(height),
                unit: $KW.FlexUtils.getUnit(height)
            };
            refheight = $KW.FlexUtils.getValueByParentFrame(imgModel, valueObj, 'y');
            var span = imgNode.parentNode;
            var computedStyle = $KU.getComputedStyle(span);
            if(computedStyle) {
                
                
                var vBorder = parseInt(computedStyle["border-top-width"], 10) + parseInt(computedStyle["border-bottom-width"], 10);
                var vPadding = parseInt(computedStyle["padding-top"], 10) + parseInt(computedStyle["padding-bottom"], 10);
                refheight = refheight - vBorder - vPadding;
            }
        }
        return refheight;
    },

    imgLoadHandler: function(event, img) {
        event = event || window.event;
        img = event.target ? event.target : event.srcElement;

        if(!img) return;
        
        if(!document.body.contains(img)) {
            return;
        }

        
        if(!img.parentNode || (img.parentNode && !img.parentNode.parentNode)) return;

        var tabPaneID = img.getAttribute("ktabpaneid");
        var type = img.getAttribute("kwidgettype");
        var targetWidgetID = (type == 'Image') ? $KU.getElementID(img.getAttribute("id")) : img.getAttribute("id");
        var src;
        if(type != "Image") { 
            targetWidgetID = targetWidgetID.split("_")[1];
            src = img.src;
            src && (src = src.substring(src.lastIndexOf("/") + 1, src.length));
        }
        var widgetModel;
        if(!img.hasAttribute('overlay')) {
            widgetModel = kony.model.getWidgetModel(img.getAttribute("kformname"), targetWidgetID, tabPaneID);
        }

        if(!widgetModel) {
            widgetModel = $KU.getModelByNode(img); 
        }

        if(type == "Image") src = widgetModel.src;

        if(event.type == "load") {
            var isWaitAllowed = true;
            if($KU.inArray($KU.imgCache, src, true))
                isWaitAllowed = false;
            else
                $KU.imgCache.push(src);

            if(widgetModel.imagescalemode == constants.IMAGE_SCALE_MODE_MAINTAIN_ASPECT_RATIO) {
                $KU.setImgAspectRatio(widgetModel, img);
            }

            if(type == "IGallery") {
                img.style.display = "";
            }
            img.style.visibility = "visible";
            img.style.opacity = 1;
            
            widgetModel.loaded = true;
            if(widgetModel.animInfo) {
                var info = widgetModel.animInfo;
                info.instance.animate(widgetModel, info.animConfig, info.animCallback);
            }
            if(isWaitAllowed || (img && img.parentNode && img.parentNode.style.background.indexOf("url") != -1)) {
                var span = img.parentNode;
                if(span) {
                    if(span.style.removeProperty)
                        span.style.removeProperty("background");
                    else
                        span.style.background = "none";
                }
            }

            if(type == "Image") {
                if(widgetModel.scrollBoxID) {
                    var scrollerID = widgetModel.pf + "_" + widgetModel.scrollBoxID + "_scroller";
                    var scrollerNode = $KU.getElementById(scrollerID);
                    if(scrollerNode) {
                        
                        
                        var scrollerInstance = $KG[scrollerID];
                        scrollerInstance && scrollerInstance.refresh();
                    }
                }

                var ondownloadcompleteref = $KU.returnEventReference(img.getAttribute("ondownloadcomplete"));
                ondownloadcompleteref && ondownloadcompleteref.call(widgetModel, widgetModel, src, true);
            }
        } else { 
            img.onerror = "";
            img.style.opacity = 1;
            var imgParentNode = img.parentNode;
            imgParentNode && (imgParentNode.style.background = "none");
            if(type == "Image")
                widgetModel.base64 = null;
            if(widgetModel.imagewhenfailed)
                img.src = $KU.getImageURL(widgetModel.imagewhenfailed);
            var ondownloadcompleteref = $KU.returnEventReference(img.getAttribute("ondownloadcomplete"));
            ondownloadcompleteref && ondownloadcompleteref.call(widgetModel, widgetModel, src, false);
        }
        if(type == "HStrip" && (widgetModel.viewtype == "stripview" || widgetModel.viewtype == "pageview")) {
            widgetModel.count++;
            if(widgetModel.masterdata.length - IndexJL == widgetModel.count) {
                widgetModel.count = 0;
                if(widgetModel.viewtype == "stripview" && widgetModel.scrollInstance) {
                    var scrolleele = img.getAttribute("kformname") + "_" + targetWidgetID + "_scrollee";
                    scrolleele = document.getElementById(scrolleele);
                    if(scrolleele) scrolleele.style.width = "auto";
                    $KW.HStrip.refreshScroller(widgetModel);
                } else if(widgetModel.view == "pageview") {
                    var pageview = document.getElementById(img.getAttribute("kformname") + "_" + targetWidgetID);
                    pageview.style.height = "auto";
                    pageview.style.height = pageview.clientHeight + "px";
                }
                var imgelement = document.getElementById(img.getAttribute("kformname") + "_" + targetWidgetID + "_scrollFades");
                imgelement && $KW.touch.setHeight(imgelement.childNodes[0].childNodes[0]);
                imgelement && $KW.touch.setHeight(imgelement.childNodes[1].childNodes[0]);
            }
        }
        if(img.parentNode)
            img.parentNode.parentNode.style["font-size"] = "0px";
        $KU.onImageLoadComplete(widgetModel, img);
    },

    onImageLoadComplete: function(widgetModel, img) {
        var containerId = img.getAttribute("kcontainerID");
        var parentModel, containerModel, flexNode, context, widgetNode;

        if(containerId) {
            containerModel = $KW.Utils.getContainerModelById(img, containerId);
        }

        parentModel = widgetModel.parent;

        if($KW.FlexUtils.isFlexWidget(widgetModel)) {
            if((typeof widgetModel.height === 'number' || (typeof widgetModel.height === 'string' && widgetModel.height))
            && (typeof widgetModel.width === 'number' || (typeof widgetModel.width === 'string' && widgetModel.width))) {
                $KW.FlexUtils.handleImageScaleMode(widgetModel, img, {
                    width: (widgetModel.frame.width + 'px'),
                    height: (widgetModel.frame.height + 'px')
                });
                if(widgetModel.zoomenabled) {
                    widgetNode = $KW.Utils.getWidgetNode(widgetModel);
                    $KW.Scroller.initialize([widgetNode], 'FlexScrollContainer');
                    $KW.Utils.initializeScrollEvents([widgetNode], widgetModel);
                    $KW.Image.resizeImageScale(widgetModel, img);
                }
            } else if(containerModel) {
                flexNode = $KU.getParentByAttributeValue(img, "kwidgettype", parentModel.wType);

                if(flexNode) {
                    if(['Segment', 'CollectionView'].indexOf(containerModel.wType) != -1
                    && $KW.FlexUtils.isFlexWidget(containerModel) && containerModel.autoGrowHeight) {
                        containerModel.layoutConfig = {
                            self: true,
                            children: false
                        };
                        $KW.FlexContainer.forceLayout(containerModel.parent);
                    } else {
                        if(containerModel.wType == 'Segment') {
                            context = $KW.Segment.getContextByNode(containerModel, flexNode);
                            parentModel = $KW.Segment.getClonedModel(containerModel, context.rowIndex, context.sectionIndex);

                            if(parentModel) {
                                widgetModel = parentModel[widgetModel.id];
                                widgetModel.layoutConfig = {
                                    self: true,
                                    children: false
                                };
                                widgetModel.loaded = true;
                                parentModel = $KW.FlexUtils.getAutoGrowFlexConfigContainer(widgetModel);
                                flexNode = $KW.Segment.getNodeByContext(containerModel, context, parentModel);
                            }
                        }

                        if(containerModel.wType == 'CollectionView') { 
                            context = $KW.CollectionView.Utils.getContextByNode(containerModel, flexNode);
                            parentModel = $KW.CollectionView.Utils.getClonedModel(containerModel, context.itemIndex, context.sectionIndex);

                            if(parentModel) {
                                widgetModel = parentModel[widgetModel.id];
                                widgetModel.layoutConfig = {
                                    self: true,
                                    children: false
                                };
                                widgetModel.loaded = true;
                                parentModel = $KW.FlexUtils.getAutoGrowFlexConfigContainer(widgetModel);
                                flexNode = $KW.CollectionView.Utils.getNodeByContext(containerModel, context, parentModel);
                            }
                        }

                        $KW.FlexContainer.forceLayout(parentModel, flexNode);
                    }
                }
            } else {
                $KW.FlexUtils.updateLayoutConfig(widgetModel);
                parentModel = $KW.FlexUtils.getAutoGrowFlexConfigContainer(widgetModel);
                $KW.FlexContainer.forceLayout(parentModel);
                if(widgetModel.zoomenabled) {
                    widgetNode = $KW.Utils.getWidgetNode(widgetModel);
                    $KW.Scroller.initialize([widgetNode], 'FlexScrollContainer');
                    $KW.Utils.initializeScrollEvents([widgetNode], widgetModel);
                    $KW.Image.resizeImageScale(widgetModel, img);
                }
            }
        }

        if(containerModel) {
            var topLevelModel = $KG.allforms[containerModel.pf];
            if(topLevelModel && topLevelModel.wType == 'Popup') {
                var popupConatiner = $KU.getElementById(topLevelModel.id + '_container');
                
                popupConatiner && $KW.Popup.adjustPopupDimensions(topLevelModel, popupConatiner.childNodes[1] || popupConatiner.childNodes[0]);
            }
        }
    },

    
    getImageURL: function(imageSrc) {
        
        if(imageSrc) {
            if(imageSrc.startsWith("http"))
                return imageSrc;
            else {
                if((imageSrc.match(/^([^.]+)$/) != null)) {
                    imageSrc = imageSrc + ".svg";
                }
                var imageCat = "";
                var platformver = "";
                if($KG["imagecat"])
                    imageCat = $KG["imagecat"];
                if($KG["platformver"])
                    platformver = $KG["platformver"];
                return kony.appinit.getStaticContentPath() + platformver + "images/" + $KG["retina"] + imageCat + imageSrc;
            }
        }
        return "";
    },

    getCSSPropertyFromRule: function(ruleName, propertyName) {
        var styleSheetIndex = $KW.skins.getKonyStyleSheetIndex(document.styleSheets);
        var styleSheet = document.styleSheets[styleSheetIndex];
        var cssRuleObjects = styleSheet.rules || styleSheet.cssRules;

        for(var i = 0; i < cssRuleObjects.length; i++) {
            var rule = cssRuleObjects[i];
            if(rule.selectorText == ("." + ruleName))
                return((rule.style.getPropertyValue && rule.style.getPropertyValue(propertyName)) || rule.style[propertyName]);
        }
        return null;
    },

    imagePreloader: function(imageSrc, callback) {
        var imagePreLoad = new Image();
        imagePreLoad.src = imageSrc;
        imagePreLoad.onload = callback;
        imagePreLoad.onerror = callback;
    },

    
    getInnerHeight: function(timeInterval) {
        setTimeout(function() {
            $KG['__innerHeight'] = window.innerHeight;
        }, timeInterval);
    },

    getgesturePosition: function(x, y, x2, y2, x1, y1) {
        var position;
        if(x <= (x2 - x1) / 3 && y <= (y2 - y1) / 3) {
            position = 1;
        } else if(x > (x2 - x1) / 3 && x <= (x2 - x1) * 2 / 3 && y <= (y2 - y1) / 3) {
            position = 2;
        } else if(x > (x2 - x1) * 2 / 3 && y <= (y2 - y1) / 3) {
            position = 3;
        } else if(x <= (x2 - x1) / 3 && y > (y2 - y1) / 3 && y <= (y2 - y1) * 2 / 3) {
            position = 4;
        } else if(x > (x2 - x1) / 3 && x <= (x2 - x1) * 2 / 3 && y > (y2 - y1) / 3 && y <= (y2 - y1) * 2 / 3) {
            position = 5;
        } else if(x > (x2 - x1) * 2 / 3 && y > (y2 - y1) / 3 && y <= (y2 - y1) * 2 / 3) {
            position = 6;
        } else if(x <= (x2 - x1) / 3 && y > (y2 - y1) * 2 / 3) {
            position = 7;
        } else if(x > (x2 - x1) / 3 && x <= (x2 - x1) * 2 / 3 && y > (y2 - y1) * 2 / 3) {
            position = 8;
        } else if(x > (x2 - x1) * 2 / 3 && y > (y2 - y1) * 2 / 3) {
            position = 9;
        } else if(x == (x2 - x1) / 2 && y == (y2 - y1) / 2) {
            position = 10;
        }
        return position;
    },

    addThirdPartyMeta: function(meta) {
        if(meta && typeof meta == 'object') {
            if(!$KG['thirdPartyWidgetsMeta']) {
                $KG['thirdPartyWidgetsMeta'] = {};
            }
            $KG['thirdPartyWidgetsMeta'][meta.id] = meta;
        }
    },

    getWidgetTypeByNameSapce: function(namespace) {
        if(namespace && typeof namespace == 'string') {
            namespace = namespace.split('.');
            return namespace[namespace.length - 1];
        } else {
            return "";
        }
    },

    getStyle: function(el, cssprop) {
        try {
            var value = "";
            if(document.defaultView && document.defaultView.getComputedStyle) {
                value = document.defaultView.getComputedStyle(el, "").getPropertyValue(cssprop);
            } else if(el.currentStyle) { 
                cssprop = cssprop.replace(/\-(\w)/g, function(strMatch, p1) {
                    return p1.toUpperCase();
                });
                value = el.currentStyle[cssprop];
            } else 
                value = el.style[cssprop];
        } catch(e) {

        }
        return value;
    },

    getComputedStyle: function(el) {
        var value;
        if(document.defaultView && document.defaultView.getComputedStyle) {
            value = document.defaultView.getComputedStyle(el, "");
        }
        return value;
    },

    getContainerParentDivMappings: function() {
        return {
            Form: 3,
            Popup: 3,
            ScrollBox: 3,
            HBox: 0,
            VBox: 0,
            Line: 0,
            TabPane: 0,
            Image: 4,
            Slider: 5,
            FlexContainer: 1,
            FlexScrollContainer: 2
        };
    },

    returnParentChildBloatAdjustedNode: function(childModel, node) {
        var map = $KU.getContainerParentDivMappings();
        for(var i = typeof map[childModel.wType] == 'undefined' ? 3 : map[childModel.wType]; i > 0; --i)
            node = node.parentNode;
        return node;
    },

    extend: function(sub, sup) {
        for(var k in sup) {
            if(typeof sub[k] == 'undefined') {
                sub[k] = sup[k];
            }
        }

        return sub;
    },

    fireEvent: function(el, type, data) {
        if(document.createEventObject) {
            var evt = document.createEventObject();
            evt.data = data;
            return el.fireEvent('on' + type, evt);
        } else {
            var evt = document.createEvent("HTMLEvents");
            evt.data = data;
            evt.initEvent(type, true, true);
            return !el.dispatchEvent(evt);
        }
    },

    elementIndex: function(el) {
        var index = 0;
        while(el && el.previousSibling) {
            el = el.previousSibling;
            index++;
        }
        return index;
    },

    closestElement: function(el, attrName, attrValue) {
        while(el && el.tagName) {
            var val = el.getAttribute(attrName);
            if(attrName === 'class') {
                if($KU.hasClassName(el, attrValue)) {
                    return el;
                }
            } else {
                if(arguments.length === 3) {
                    if(el.getAttribute(attrName) === attrValue) {
                        if(attrName == 'kwidgettype' && attrValue == 'ScrollBox') {
                            var wModel = $KU.getModelByNode(el);
                            if(wModel.scrolldirection != constants.SCROLLBOX_SCROLL_NONE)
                                return el;
                        } else {
                            return el;
                        }

                    }
                } else if(arguments.length === 2) {
                    if(el.hasAttribute(attrName)) {
                        return el;
                    }
                }
            }
            el = el.parentNode;
        }
        return null;
    },

    filterElements: function(els, type) {
        var elms = [];
        if(els.length) {
            if(type === 'visible') {
                for(var i = 0; i < els.length; i++) {
                    if(els[i].style.display !== 'none') {
                        elms.push(els[i]);
                    }
                }
            }
        }
        return elms;
    },

    mediaSupport: function() {
        var video = document.createElement('video');
        return {
            mpeg4: "" !== video.canPlayType('video/mp4; codecs="mp4v.20.8"'),
            h264: "" !== (video.canPlayType('video/mp4; codecs="avc1.42E01E"') || video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')),
            ogg: "" !== video.canPlayType('video/ogg; codecs="theora"'),
            webm: "" !== video.canPlayType('video/webm; codecs="vp8, vorbis"')
        }
    },

    loadJSSynchronously: function(file) {
        
    },

    getFunctionName: function(func) {
        return func.name ? func.name : func.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
    },

    
    cssPrefix: (vendor) ? "-" + vendor + "-" : "",
    nativeScrollMatrix: {
        iphone: "5",
        ipad: "5",
        android: "2.3.6",
        blackberry: "7",
        desktop: "0"
    },
    isAndroid: (/android/gi).test(navigator.userAgent) && !((/trident/gi).test(navigator.userAgent)) && !((/edge/gi).test(navigator.userAgent)),
    isIDevice: (/iphone|ipad/gi).test(navigator.userAgent) && !((/trident/gi).test(navigator.userAgent)),
    isiPhone: (/iphone/gi).test(navigator.userAgent) && !((/trident/gi).test(navigator.userAgent)),
    isiPod: (/ipod/gi).test(navigator.userAgent),
    isiPad: (/ipad/gi).test(navigator.userAgent),
    isIOS7: (/(iPad|iPhone);.*CPU.*OS 7_\d/i).test(navigator.userAgent),
    isIOSgt6: (/(iPad|iPhone);.*CPU.*OS ([7-9]|[1-9][0-9])_\d/i).test(navigator.userAgent), 
    isPlaybook: (/playbook/gi).test(navigator.userAgent),
    isBlackBerry: ((/blackberry/gi).test(navigator.userAgent) || (/BB10/gi).test(navigator.userAgent)) && typeof bbnth == "undefined",
    isBlackBerryNTH: (/blackberry/gi).test(navigator.userAgent) && typeof bbnth != "undefined" && bbnth,
    isTouchPad: (/hp-tablet/gi).test(navigator.userAgent),
    isWindowsPhone: (/Windows Phone/gi).test(navigator.userAgent),
    isWindowsTouch: ((/Windows/gi).test(navigator.userAgent) && (/Touch/gi).test(navigator.userAgent)) || ((/trident/gi).test(navigator.userAgent)),
    isWindowsTablet: ((/Windows NT/gi).test(navigator.userAgent) && (/Touch/gi).test(navigator.userAgent)) || (typeof spaMarkup != "undefined" && spaMarkup == "spawindowstablet"),
    isIE: (/MSIE/gi).test(navigator.userAgent),
    isIE9: navigator.userAgent.match(/MSIE (\d+)/) != null && RegExp.$1 == "9",
    isIE10: navigator.userAgent.match(/MSIE (\d+)/) != null && RegExp.$1 == "10",
    isIE11: (/rv:([1][1-9])/i).test(navigator.userAgent),
    isMob: (/mobile/gi).test(navigator.userAgent),
    isTablet: (/hp-tablet|ipad|playbook/gi).test(navigator.userAgent) || (((/android/gi).test(navigator.userAgent) || ((/Windows NT/gi).test(navigator.userAgent) && (/Touch/gi).test(navigator.userAgent) || (typeof spaMarkup != "undefined" && spaMarkup == "spawindowstablet"))) && !(/mobile/gi).test(navigator.userAgent)),
    isEdge: (/edge/gi).test(navigator.userAgent),
    
    isAndroid_SonyXPeria: (/android/gi).test(navigator.userAgent) && (/SonyEricsson/gi).test(navigator.userAgent),
    isAndroid_Galaxy: (/android/gi).test(navigator.userAgent) && (/GT/gi).test(navigator.userAgent),
    isAndroid_HTC: (/android/gi).test(navigator.userAgent) && (/HTC/gi).test(navigator.userAgent),
    isAndroid_Nexus: (/android/gi).test(navigator.userAgent) && (/Nexus/gi).test(navigator.userAgent),
    orientationDelayMatrix: {
        iphone: 100,
        ipad: 100,
        blackberry: 100,
        android: 250,
        GT: 150,
        SonyXPeria: 100,
        Nexus: 500,
        androidtablet: 300
    },
    isTouchSupported: (typeof Touch != "undefined" || "ontouchstart" in window) && typeof bbnth == "undefined",
    isPointerSupported: navigator.msPointerEnabled || navigator.pointerEnabled,
    isOrientationSupported: 'onorientationchange' in window,
    placeholderSupported: ("placeholder" in document.createElement('input')),

    
    has3d: 'WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix() || 'MSCSSMatrix' in window && 'm11' in new MSCSSMatrix(),
    hasTransform: 'webkitTransform' in document.documentElement.style || 'msTransform' in document.documentElement.style || 'transform' in document.documentElement.style,
    hasWebkitTransform: 'webkitTransform' in document.documentElement.style,
    hasMsTransform: 'msTransform' in document.documentElement.style,
    hashChange: "onhashchange" in window,

    translatableWidgets: ["Button", "Label", "Link", "RichText", "TextArea", "TextField", "Phone", "Switch", "Form", "Popup", "FlexContainer", "Box"],
    segmentKeyMap: {
        visible: "isvisible",
        enable: "disabled",
        multiSelect: "multiple",
        blur: "flexblur"
    },
    dpi: window.devicePixelRatio || 1,
    minTouchMoveDisplacement: (window.devicePixelRatio || 1) * 6,
    swipeDuration: 500,
    imgCache: [],
    isAjaxUploadSupported: window.File && window.FileList && new XMLHttpRequest().upload,
    defaultunit: '%',
    flexUnits: ['%', 'px', 'dp'],
    contentDrivenWidgets: ["Label", "Button", "RichText", "Link", "Phone"],
    widgetsWidthMap: {
        HBox: '200dp',
        VBox: '200dp',
        ScrollBox: '200dp',
        TabPane: '100%',
        Calendar: '200dp',
        DataGrid: '100%',
        CheckBoxGroup: '100%',
        RadioButtonGroup: '260dp',
        Slider: '260dp',
        Switch: '200dp',
        HStrip: '200dp',
        IGallery: '200dp',
        Segment: '100%',
        Browser: '100%',
        Line: '50dp',
        Map: '100%',
        FlexContainer: '100%',
        FlexScrollContainer: '100%',
        TPW: '200dp',
        TextField: '260dp',
        TextArea: '260dp',
        ComboBox: '260dp',
        ListBox: '260dp',
        CollectionView: '120dp'
    },
    widgetsHeightMap: {
        Segment: '120dp',
        Browser: '220dp',
        Map: '75%',
        TabPane: '220dp',
        FlexContainer: '220dp',
        FlexScrollContainer: '220dp',
        Line: '2dp',
        Slider: '100dp',
        ListBox: '40dp',
        ComboBox: '40dp',
        CheckBoxGroup: '120dp',
        RadioButtonGroup: '40dp',
        TextArea: '120dp',
        TextField: '40dp',
        DataGrid: '120dp',
        CollectionView: '120dp'
    },
    changeFlag: false,
    needOptimization: true,

    animationDuration: (vendor) ? vendor + "AnimationDuration" : "animationDuration",
    animationName: (vendor) ? vendor + "AnimationName" : "animationName",
    transition: (vendor) ? vendor + "Transition" : "transition",
    transform: (vendor) ? vendor + "Transform" : "transform",
    transitionDelay: (vendor) ? vendor + "TransitionDelay" : "transitionDelay",
    transitionDuration: (vendor) ? vendor + "TransitionDuration" : "transitionDuration",
    transitionProperty: (vendor) ? vendor + "TransitionProperty" : "transitionProperty",
    transformOrigin: (vendor) ? vendor + "TransformOrigin" : "transformOrigin",
    animationStart: (vendor) ? vendor + "AnimationStart" : "animationstart",
    animationEnd: (vendor) ? vendor + "AnimationEnd" : "animationend",
    animationIteration: (vendor) ? vendor + "AnimationIteration" : "animationiteration",
    animation: (vendor) ? vendor + "Animation" : "animation",

    hideKeyboard: function(callback, scope) {
        var activeElement = document.activeElement;
        activeElement.setAttribute('readonly', 'readonly'); 
        activeElement.setAttribute('disabled', 'true'); 
        setTimeout(function() {
            activeElement.blur();
            
            activeElement.removeAttribute('readonly');
            activeElement.removeAttribute('disabled');
            if(callback) {
                callback(scope);
            }
        }, 100);
    },

    setActiveInput: function(target) {
        if(document.activeElement) {
            var wType = document.activeElement.getAttribute("kwidgettype");
            if((wType == "TextField" || wType == "TextArea") && !$KU.isWindowsPhone) {
                $KG.activeInput = document.activeElement;
            }
        }

        if($KG.disableViewPortScroll && target) {
            target.value = target.value;
            setTimeout(function() {
                target.style.pointerEvents = 'none'
            }, 100);
        }
    },

    
    onHideKeypad: function(wModel) {
        if(!$KG["nativeScroll"] && $KU.isIOS7) {
            var formContainer = $KG["__currentForm"] && document.getElementById($KG["__currentForm"].id + "_container");
            formContainer && (formContainer.style.height = "100%");
        }
        $KG.activeInput = "";
        this.adjustScrollBoxesOnResize();
    },

    adjustScrollBoxesOnResize: function(isKeypadOpened) {
        if($KG["__currentForm"]) {
            window.clearTimeout($KG.resizeTimeoutId);
            $KG.resizeTimeoutId = setTimeout(function() {
                $KW.ScrollBox.adjustBoxDimensions($KG["__currentForm"].id);
                if($KU.isAndroid && document.activeElement && isKeypadOpened) {
                    var inputModel = $KU.getModelByNode(document.activeElement);
                    if(inputModel && (inputModel.wType == "TextField" || inputModel.wType == "TextArea")) {
                        $KW.Utils.bringToView(document.activeElement, true);
                    }
                }
            }, 300);
        }
    },

    setPointerEvents: function(srcEle, val) {
        srcEle = srcEle && srcEle.children && srcEle.children.length == 1 && srcEle.firstChild;
        if(srcEle && (srcEle.tagName == "INPUT" || srcEle.tagName == "TEXTAREA"))
            srcEle.style.pointerEvents = val;
    },

    setMainHeight: function() {
        var main = $KU.getElementById("__MainContainer");
        if(main) {
            main.style.height = window.innerHeight + "px";
        }
    },

    getI18NValue: function(value) {
        var regExp = /\((\'|\")([^)]+)(\'|\")\)/;
        var matches = regExp.exec(value);
        var key = "";
        if(matches && matches[2]) {
            key = matches[2];
        }
        return(key && $KI.i18n.getlocalizedstring(key)) || "";
    },

    
    createa11yDynamicElement: function() {
        var ariaDiv = document.getElementById("ariaTag");
        if(!ariaDiv) {
            var ariaText = "<span  id='ariaTag' style='opacity:0;display:inline-block;height:0;width:0'  aria-live='assertive'></span>";
            ariaDiv = ariaDiv || document.createElement('div');
            ariaDiv.innerHTML = ariaText;
            document.body.appendChild(ariaDiv.firstChild);
        }
    },

    
    changea11yDynamicElement: function(title) {
        var ariaEle = document.getElementById('ariaTag');
        window.setTimeout(function() {
            if(ariaEle) {
                ariaEle.removeAttribute('aria-hidden');
                ariaEle.innerHTML = title;
                window.setTimeout(function() {
                    ariaEle.setAttribute('aria-hidden', 'true')
                }, 10);
            }
        }, 100);
        if(ariaEle) ariaEle.innerHTML = "title set";
    },

    
    isRoleRequired: function(widgetModel) {
        if($KU.isIDevice && (widgetModel.wType === "HBox" || widgetModel.wType === "Label" || widgetModel.wType === "VBox" || widgetModel.wType == "Segment" || widgetModel.wType == "ScrollBox" || widgetModel.wType == "HStrip" || widgetModel.wType == "Slider" || widgetModel.wType == "RichText" || widgetModel.wType == "FlexContainer" || widgetModel.wType == "FlexScrollContainer"))
            return true;
        else
            return false;
    },

    isTabIndexRequired: function(widgetModel) {
        if(widgetModel.wType == "FlexContainer") return true;

        return false;
    },

    addAriatoElement: function(element, propertyValue, widgetModel, oldPropertyValue) {
        
        if(element && oldPropertyValue && oldPropertyValue.a11yARIA) {
            for(attr in oldPropertyValue.a11yARIA)
                element.removeAttribute(attr);
        }
        
        if(element && propertyValue) {
            
            
            var accessLabel = (propertyValue.a11yLabel || propertyValue.a11yLabel == "") ? propertyValue.a11yLabel : propertyValue.hint;

            var accessValue = propertyValue.a11yValue;

            if(accessLabel != null && typeof accessLabel != undefined && accessLabel.trim() == "") {
                if(widgetModel.wType != "Calendar") {
                    accessLabel = " ";
                } else {
                    accessLabel = widgetModel.date ? widgetModel.date : widgetModel.placeholder;
                }

            }

            if(accessValue != null && typeof accessValue != undefined && accessValue.trim() == "") {
                accessValue = " ";
            }

            if(widgetModel.wType != 'Calendar') {

                accessLabel = accessLabel ? accessLabel + " " + (accessValue ? accessValue : "") : (accessValue ? accessValue : null);
            }


            if(accessLabel) {
                if(widgetModel.wType == "Image") {
                    element.setAttribute("alt", accessLabel);
                } else {
                    element.setAttribute("aria-label", accessLabel);
                }
                if($KU.isRoleRequired(widgetModel))
                    element.setAttribute("role", "option");
                if($KU.isTabIndexRequired(widgetModel))

                    element.setAttribute("tabindex", 0);
            } else {
                if(widgetModel.wType == "Image") {
                    element.removeAttribute("alt");
                } else {
                    if(widgetModel.wType != "Calendar") {
                        element.removeAttribute("aria-label");
                    } else {
                        accessLabel = widgetModel.date ? widgetModel.date : widgetModel.placeholder;
                        element.setAttribute("aria-label", accessLabel);
                    }
                }
                if($KU.isRoleRequired(widgetModel))
                    element.removeAttribute("role");
                if(!accessLabel && widgetModel.wType == "Switch")
                    $KW.Switch.addA11YAttribute(widgetModel, element, true);
            }

            var accessHint = propertyValue.a11yHint || "";
            if(accessHint.trim() != "") {
                if(!($KU.isBlackBerryNTH || $KU.isBlackBerry)) {
                    var widgetId = widgetModel.pf + "_" + widgetModel.id;
                    var kmasterObj = $KW.Utils.getMasterIDObj(widgetModel);
                    if(kmasterObj.id != "") {
                        widgetId = kmasterObj.id;
                    }
                    var hintID = widgetId + "-hint";
                    element.setAttribute("aria-describedby", hintID);
                    $KU.createHintWrapper(widgetModel, hintID, accessHint);
                    if($KU.isRoleRequired(widgetModel))
                        element.setAttribute("role", "option");
                    if($KU.isTabIndexRequired(widgetModel))

                        element.setAttribute("tabindex", 0);
                }
            } else {
                element.removeAttribute("aria-describedby");
                if($KU.isRoleRequired(widgetModel) && !accessLabel)
                    element.removeAttribute("role");
                if(!accessLabel && widgetModel.wType == "Switch")
                    $KW.Switch.addA11YAttribute(widgetModel, element, true);
            }
            propertyValue.a11yHidden ? element.setAttribute("aria-hidden", true) : element.removeAttribute("aria-hidden");
            propertyValue.required ? element.setAttribute("aria-required", propertyValue.required) : element.removeAttribute("aria-required");

            
            if(propertyValue.a11yARIA) {
                for(attr in propertyValue.a11yARIA)
                    element.setAttribute(attr, propertyValue.a11yARIA[attr])
            }
        } else {
            
            if(widgetModel.wType == "Image") {
                element.removeAttribute("alt");
            } else if(widgetModel.wType == "Calendar") {
                element.childNodes[1].alt = "Calendar";
            } else {
                element.removeAttribute("aria-label");
                if(widgetModel.wType == "Switch") {
                    $KW.Switch.addA11YAttribute(widgetModel, element);
                }
            }
            element.removeAttribute("aria-hidden");
            element.removeAttribute("aria-describedby");
            element.removeAttribute("aria-required");
            if($KU.isRoleRequired(widgetModel))
                element.removeAttribute("role");
        }
    },

    
    createHintWrapper: function(widgetModel, id, desc) {
        var wrapperId = widgetModel.pf + "-hint";
        var wrapper = document.getElementById(wrapperId);
        if(desc) {
            var hintString = "<div id='" + id + "'>" + desc + "</div>";
            var hintElem = document.getElementById(id);
            if(!wrapper) {
                var wrapper = document.createElement('div');
                wrapper.id = wrapperId;
                wrapper.style.display = 'none';
                document.body.appendChild(wrapper);
            }
            if(hintElem) {
                if(hintElem.textContent)
                    hintElem.textContent = desc;
                else
                    hintElem.innerText = desc;
            } else {
                wrapper.innerHTML += hintString;
            }
        }
    },

    
    getAccessibilityValues: function(widgetModel, accessibilityObj, groupWidgetValue, rowIndex) {
        var accessObj = accessibilityObj || widgetModel.accessibilityconfig;

        
        if(groupWidgetValue && groupWidgetValue != "") {
            groupWidgetValue = groupWidgetValue ? "_" + groupWidgetValue : "";
            
            accessObj = accessibilityObj;
        }
        
        var accessAttr = " ";
        if(accessObj) {
            
            var accessLabel = (accessObj.a11yLabel || accessObj.a11yLabel == "") ? accessObj.a11yLabel : accessObj.hint;
            var accessValue = accessObj.a11yValue;

            var accessHint = accessObj.a11yHint;
            var segrowIndex = rowIndex || "";
            var hintID = "";
            var widgetId = widgetModel.pf + "_" + widgetModel.id;
            var kmasterObj = $KW.Utils.getMasterIDObj(widgetModel);
            if(kmasterObj.id != "") {
                widgetId = kmasterObj.id;
            }
            if(groupWidgetValue)
                hintID = widgetId + segrowIndex + groupWidgetValue + "-hint";
            else
                hintID = widgetId + segrowIndex + "-hint";

            if(accessLabel != null && typeof accessLabel != undefined && accessLabel.trim() == "") {
                accessLabel = " ";
            }
            if(accessValue != null && typeof accessValue != undefined && accessValue.trim() == "") {
                accessValue = " ";
            }
            if(widgetModel.wType != 'Calendar') {
                accessLabel = accessLabel ? accessLabel + " " + (accessValue ? accessValue : "") : (accessValue ? accessValue : null);
                accessLabel = accessLabel ? (widgetModel.wType == "Image" ? "  alt='" + accessLabel + "' " : "  aria-label='" + accessLabel + "' ") : "";
            } else {
                accessLabel = accessLabel ? accessLabel : "";
                accessLabel = accessLabel + ' ' + (widgetModel.date ? widgetModel.date : widgetModel.placeholder);
                accessLabel = accessLabel ? ("aria-label='" + accessLabel + "' ") : "";
            }
            if(accessLabel && widgetModel.wType == "FlexContainer")
                accessLabel += " tabindex = 0";

            if(accessLabel && $KU.isRoleRequired(widgetModel)) 
                accessLabel += "  role='option'";

            var accessHintAttr = "";
            if(accessHint) {
                accessHintAttr = " aria-describedby='" + hintID + "' ";
                if($KU.isRoleRequired(widgetModel))
                    accessLabel += "  role='option'";
                if(accessLabel && widgetModel.wType == "FlexContainer")
                    accessLabel += " tabindex = 0";
            }

            var accessHidden = accessObj.a11yHidden ? " aria-hidden ='" + true + "'" : "";

            $KU.createHintWrapper(widgetModel, hintID, accessHint);

            
            if(accessObj.a11yARIA) {
                for(attr in accessObj.a11yARIA) {
                    accessAttr += attr + "= '" + accessObj.a11yARIA[attr] + "' ";
                }
            }
            if(widgetModel.wType == 'HBox' || widgetModel.wType == 'VBox')
                accessAttr += ' tabindex=-1 ';
            accessAttr += (accessLabel + "  " + accessHintAttr + " " + accessHidden);
        } else {
            if(widgetModel.wType == 'Calendar') {
                accessLabel = "Calendar " + widgetModel.placeholder;
                accessLabel = ("aria-label='" + accessLabel + "' ");
                accessAttr = (accessLabel);
            }
        }
        return accessAttr;
    },

    setScrollBoxesHeight: function(formID, widgetType) {
        
        var scrollBoxes = document.querySelectorAll("#" + formID + " div[kwidgettype='" + widgetType + "']");
        for(var i = 0; i < scrollBoxes.length; i++) {
            var boxModel = $KU.getModelByNode(scrollBoxes[i]);
            $KU.setScrollHeight(boxModel, scrollBoxes[i]);
        }
    },

    setScrollHeight: function(boxModel, scrollBox) {
        var parentModel = boxModel.parent;
        var topLevelModel = $KG.allforms[boxModel.pf];


        
        if((parentModel && (parentModel.wType == 'FlexContainer' || parentModel.wType == 'FlexScrollContainer')) || (topLevelModel && topLevelModel.wType == 'Form' && topLevelModel.layouttype != kony.flex.VBOX_LAYOUT)) {
            return;
        }

        scrollBox = scrollBox || $KU.getNodeByModel(boxModel);

        if(boxModel.wType == "Map" || boxModel.wType == "Popup") {
            var scroller = scrollBox;
        } else
            var scroller = $KU.getElementById(scrollBox.id + "_scroller");

        if(!scroller) return;

        var parentNode = $KU.getElementById(scrollBox.id + "_parent");
        var scrolldirection = $KW.stringifyScrolldirection[boxModel.scrolldirection];
        var pageIndicator;
        if(boxModel.wType == "Segment" && boxModel.viewType == "pageview" && boxModel.needpageindicator) {
            pageIndicator = document.getElementById($KW.Utils.getKMasterWidgetID(boxModel) + "_footer");
            pageIndicator && $KU.removeClassName(pageIndicator, "hide")
        }
        
        
        
        if((scrolldirection != "horizontal" && boxModel.wType == 'ScrollBox') || boxModel.needScroller) {
            var boxhtPercent = boxModel.containerheight >= 0 ? boxModel.containerheight : boxModel.container_height;
            boxhtPercent = parseFloat(boxhtPercent);
            var kht = 0;
            if($KU.isPositiveInteger(boxhtPercent) && (boxModel.containerheightreference || boxModel.heightreference)) {
                if([boxModel.containerheightreference, boxModel.heightreference].contains(1)) 
                {
                    
                    var formScroller = document.getElementById($KG["__currentForm"].id + '_scroller');
                    var formHeight = (formScroller && formScroller.offsetHeight) || $KU.getWindowHeight();
                    kht = Math.round((boxhtPercent * formHeight) / 100);
                } else if([boxModel.containerheightreference, boxModel.heightreference].contains(2)) 
                {
                    var parentModel = $KU.getParentModel(boxModel);
                    var parent = $KU.getNodeByModel(parentModel);
                    var parentWidth = (parent && parent.offsetWidth) || scroller.parentNode.offsetWidth;
                    kht = Math.round((boxhtPercent * parentWidth) / 100);
                } else if([boxModel.containerheightreference, boxModel.heightreference].contains(3)) 
                {
                    kht = Math.round((boxhtPercent * screen.height) / 100);
                }

                var border = padding = 0;
                if(parentNode) {
                    border = parseInt($KU.getStyle(parentNode, "border-top-width").replace("px", ""), 10) + parseInt($KU.getStyle(parentNode, "border-bottom-width").replace("px", ""), 10);
                    padding = parseInt($KU.getStyle(parentNode, "padding-top").replace("px", ""), 10) + parseInt($KU.getStyle(parentNode, "padding-bottom").replace("px", ""), 10);
                    parentNode.style.height = kht + "px";
                }

                kht = kht - border - padding;
                scroller.style.height = kht + "px";
                var scrollerInstance = $KG[scroller.id];
                scrollerInstance && scrollerInstance.refresh();

                if(boxModel.wType == "Segment" && boxModel.viewType == "pageview" && boxModel.containerheight == 0) {
                    pageIndicator && $KU.addClassName(pageIndicator, "hide");
                }
            }

            if(boxModel.wType == "ScrollBox") {
                if(boxModel.scrollbar == "arrows" && boxModel.bottomarrowimage && boxModel.toparrowimage) {
                    var scrollFades = parentNode.childNodes[0];
                    scrollFades.style.height = kht + "px";
                    scrollFades.style.top = $KU.getStyle(parentNode, "padding-top");

                    if(scroller.childNodes[0].clientHeight > parentNode.clientHeight)
                        $KU.applyFade(scrollFades.childNodes[1], "fadeIn", 500);
                }

                $KW.ScrollBox.adjustArrowPosition(scrollBox.id);
            }
        } else {
            if(boxModel.wType == "Segment" && boxModel.screenLevelWidget == true)
                return;
            if(boxModel.wType == "Segment" || boxModel.wType == "TabPane" || boxModel.wType == "ScrollBox" || boxModel.wType == "Browser" || boxModel.wType == "Popup") {
                kht = 'auto';
            } else if(boxModel.wType == "Map") {
                kht = '500px';
            }
            scroller.style.height = kht;
            var scrollerInstance = $KG[scroller.id];
            if(scrollerInstance && boxModel.wType !== "ScrollBox") {
                scrollerInstance.scroller.style[$KU.transform] = ''
                scrollerInstance.destroy();
                $KG[scroller.id] = '';
            }
        }

    },

    isFlexWidget: function(wModel) {
        var parentModel = wModel.parent;
        if(parentModel) {
            var wType = parentModel.wType;
            if(wType == "FlexContainer" || wType == "FlexScrollContainer" || (wType == 'Form' && parentModel.layouttype && parentModel.layouttype != kony.flex.VBOX_LAYOUT && parentModel.layouttype != constants.CONTAINER_LAYOUT_GRID))
                return true;
        }
        return false;
    },

    isFlexContainer: function(wModel) {
        if(wModel) {
            var wType = wModel.wType;
            if(wType == "FlexContainer" || wType == "FlexScrollContainer" || (wType == 'Form' && wModel.layouttype && wModel.layouttype != kony.flex.VBOX_LAYOUT && wModel.layouttype != constants.CONTAINER_LAYOUT_GRID))
                return true;
        }
        return false;
    },

    isMasterContainer: function(wModel) {
        if(wModel) {
            return ['KComponent', 'FlexContainer', 'FlexScrollContainer'].indexOf(wModel.wType) > -1;
        }
    },

    
    executeWidgetEventHandler: function() {
        var widgetModel = arguments[0];
        var widgetHandler = arguments[1];
        var args = [].slice.call(arguments);
        var contextParams = [widgetModel];
        if(arguments.length > 2) {
            contextParams = contextParams.concat(args.slice(2, args.length));
        }

        return widgetHandler.apply(widgetModel, contextParams);
    },

    onEventHandler: function(wModel) {
        var topLevelModel;
        if(wModel && !wModel.isCloned) { 
            var isFlexWidget = $KW.FlexUtils.isFlexWidget(wModel);
            if(isFlexWidget) {
                topLevelModel = $KG.allforms[wModel.pf];
            }
        } else {
            topLevelModel = $KG["__currentForm"];
        }

        if(topLevelModel) {
            $KW.Form.initializeAllFlexContainers(topLevelModel);
            $KW.Form.initializeFlexContainersInTemplate(topLevelModel);
        }
    },

    setMainHeight: function() {
        var main = $KU.getElementById("__MainContainer");
        if(main) {
            main.style.height = window.innerHeight + "px";
        }
    },

    
    escapeHTMLSpecialEntities: function(text) {
        if(typeof text !== 'string') return text;
        
        if($KG.appbehaviors && $KG.appbehaviors["skipEscapeHtml"] == true)
            return text;

        var escapedText = "";
        var escapeAllHtmlEntities = ($KG.appbehaviors && $KG.appbehaviors["escapeHtml"] == true) ? true : false;

        
        if(!escapeAllHtmlEntities) {
            escapedText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&rsquo;').replace(/"/g, '&rdquo;');
        } else { 
            var entityMap = {
                34: 'quot',
                38: 'amp',
                39: 'apos',
                60: 'lt',
                62: 'gt',
                160: 'nbsp',
                161: 'iexcl',
                162: 'cent',
                163: 'pound',
                164: 'curren',
                165: 'yen',
                166: 'brvbar',
                167: 'sect',
                168: 'uml',
                169: 'copy',
                170: 'ordf',
                171: 'laquo',
                172: 'not',
                173: 'shy',
                174: 'reg',
                175: 'macr',
                176: 'deg',
                177: 'plusmn',
                178: 'sup2',
                179: 'sup3',
                180: 'acute',
                181: 'micro',
                182: 'para',
                183: 'middot',
                184: 'cedil',
                185: 'sup1',
                186: 'ordm',
                187: 'raquo',
                188: 'frac14',
                189: 'frac12',
                190: 'frac34',
                191: 'iquest',
                192: 'Agrave',
                193: 'Aacute',
                194: 'Acirc',
                195: 'Atilde',
                196: 'Auml',
                197: 'Aring',
                198: 'AElig',
                199: 'Ccedil',
                200: 'Egrave',
                201: 'Eacute',
                202: 'Ecirc',
                203: 'Euml',
                204: 'Igrave',
                205: 'Iacute',
                206: 'Icirc',
                207: 'Iuml',
                208: 'ETH',
                209: 'Ntilde',
                210: 'Ograve',
                211: 'Oacute',
                212: 'Ocirc',
                213: 'Otilde',
                214: 'Ouml',
                215: 'times',
                216: 'Oslash',
                217: 'Ugrave',
                218: 'Uacute',
                219: 'Ucirc',
                220: 'Uuml',
                221: 'Yacute',
                222: 'THORN',
                223: 'szlig',
                224: 'agrave',
                225: 'aacute',
                226: 'acirc',
                227: 'atilde',
                228: 'auml',
                229: 'aring',
                230: 'aelig',
                231: 'ccedil',
                232: 'egrave',
                233: 'eacute',
                234: 'ecirc',
                235: 'euml',
                236: 'igrave',
                237: 'iacute',
                238: 'icirc',
                239: 'iuml',
                240: 'eth',
                241: 'ntilde',
                242: 'ograve',
                243: 'oacute',
                244: 'ocirc',
                245: 'otilde',
                246: 'ouml',
                247: 'divide',
                248: 'oslash',
                249: 'ugrave',
                250: 'uacute',
                251: 'ucirc',
                252: 'uuml',
                253: 'yacute',
                254: 'thorn',
                255: 'yuml',
                402: 'fnof',
                913: 'Alpha',
                914: 'Beta',
                915: 'Gamma',
                916: 'Delta',
                917: 'Epsilon',
                918: 'Zeta',
                919: 'Eta',
                920: 'Theta',
                921: 'Iota',
                922: 'Kappa',
                923: 'Lambda',
                924: 'Mu',
                925: 'Nu',
                926: 'Xi',
                927: 'Omicron',
                928: 'Pi',
                929: 'Rho',
                931: 'Sigma',
                932: 'Tau',
                933: 'Upsilon',
                934: 'Phi',
                935: 'Chi',
                936: 'Psi',
                937: 'Omega',
                945: 'alpha',
                946: 'beta',
                947: 'gamma',
                948: 'delta',
                949: 'epsilon',
                950: 'zeta',
                951: 'eta',
                952: 'theta',
                953: 'iota',
                954: 'kappa',
                955: 'lambda',
                956: 'mu',
                957: 'nu',
                958: 'xi',
                959: 'omicron',
                960: 'pi',
                961: 'rho',
                962: 'sigmaf',
                963: 'sigma',
                964: 'tau',
                965: 'upsilon',
                966: 'phi',
                967: 'chi',
                968: 'psi',
                969: 'omega',
                977: 'thetasym',
                978: 'upsih',
                982: 'piv',
                8226: 'bull',
                8230: 'hellip',
                8242: 'prime',
                8243: 'Prime',
                8254: 'oline',
                8260: 'frasl',
                8472: 'weierp',
                8465: 'image',
                8476: 'real',
                8482: 'trade',
                8501: 'alefsym',
                8592: 'larr',
                8593: 'uarr',
                8594: 'rarr',
                8595: 'darr',
                8596: 'harr',
                8629: 'crarr',
                8656: 'lArr',
                8657: 'uArr',
                8658: 'rArr',
                8659: 'dArr',
                8660: 'hArr',
                8704: 'forall',
                8706: 'part',
                8707: 'exist',
                8709: 'empty',
                8711: 'nabla',
                8712: 'isin',
                8713: 'notin',
                8715: 'ni',
                8719: 'prod',
                8721: 'sum',
                8722: 'minus',
                8727: 'lowast',
                8730: 'radic',
                8733: 'prop',
                8734: 'infin',
                8736: 'ang',
                8743: 'and',
                8744: 'or',
                8745: 'cap',
                8746: 'cup',
                8747: 'int',
                8756: 'there4',
                8764: 'sim',
                8773: 'cong',
                8776: 'asymp',
                8800: 'ne',
                8801: 'equiv',
                8804: 'le',
                8805: 'ge',
                8834: 'sub',
                8835: 'sup',
                8836: 'nsub',
                8838: 'sube',
                8839: 'supe',
                8853: 'oplus',
                8855: 'otimes',
                8869: 'perp',
                8901: 'sdot',
                8968: 'lceil',
                8969: 'rceil',
                8970: 'lfloor',
                8971: 'rfloor',
                9001: 'lang',
                9002: 'rang',
                9674: 'loz',
                9824: 'spades',
                9827: 'clubs',
                9829: 'hearts',
                9830: 'diams',
                338: 'OElig',
                339: 'oelig',
                352: 'Scaron',
                353: 'scaron',
                376: 'Yuml',
                710: 'circ',
                732: 'tilde',
                8194: 'ensp',
                8195: 'emsp',
                8201: 'thinsp',
                8204: 'zwnj',
                8205: 'zwj',
                8206: 'lrm',
                8207: 'rlm',
                8211: 'ndash',
                8212: 'mdash',
                8216: 'lsquo',
                8217: 'rsquo',
                8218: 'sbquo',
                8220: 'ldquo',
                8221: 'rdquo',
                8222: 'bdquo',
                8224: 'dagger',
                8225: 'Dagger',
                8240: 'permil',
                8249: 'lsaquo',
                8250: 'rsaquo',
                8364: 'euro'
            }

            for(var i = 0; i < text.length; i++) {
                var charCode = text.charCodeAt(i);

                if(entityMap[charCode])
                    escapedText += "&" + entityMap[charCode] + ";";
                else
                    escapedText += text[i];
            }
        }

        return escapedText;
    },

    createStyleSheet: function(id) {
        var stylesheet = document.createElement('style');
        stylesheet.type = "text/css";
        stylesheet.rel = "stylesheet";
        stylesheet.id = id;
        document.head && document.head.appendChild(stylesheet);
        return stylesheet.sheet;
    },

    updateScrollFlag: function(wModel) {
        var parentModel = wModel.parent || wModel;
        var height = parseFloat(wModel.containerheight);
        wModel.needScroller = $KW.FlexUtils.isFlexContainer(parentModel) || !!($KU.isPositiveInteger(height) && wModel.containerheightreference);
    },

    isValidCSSLength: function(value) {
        return /^[-+]?([0-9]+)(\.[0-9]+)?(px|%|dp)?$/.test(value);
    },

    isPositiveInteger: function(value) {
        return(typeof value == "number" && value >= 0);
    },

    layoutNewWidgets: function(boxModel, wArray) {
        if(wArray && wArray.length > 0) {
            $KW.FlexUtils.updateWidgetsConfig(boxModel, wArray);
            var isFlexContainer = $KW.FlexUtils.isFlexContainer(boxModel);
            if(isFlexContainer) {
                $KW.FlexUtils.updateLayoutConfig(boxModel);
                $KW.FlexUtils.updateAutoGrowFlexConfig(boxModel);
                $KW.FlexContainer.adjustFlexContainer(boxModel);
            }
            else
                $KW.Form.initializeFlexContainersInBox(boxModel);
        }
    },

    checkProp: function(prop, value, skipValueTest) {
        var prefixes = 'Webkit Moz O ms';
        var cssPrefixes = prefixes.split(' ');
        var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
            props = (prop + ' ' + cssPrefixes.join(ucProp + ' ') + ucProp).split(' ');

        
        var result = this.nativeTestProps(props, value);
        if(typeof result != 'undefined') {
            return result;
        }

        var i, prop, before;
        if(!$KU.testNode)
            $KU.testNode = document.createElement('test');
        var nStyle = $KU.testNode.style;

        for(i in props) {
            prop = props[i];
            before = nStyle[prop];

            if(!this.contains(prop, "-") && nStyle[prop] !== undefined) {
                
                
                
                if(!skipValueTest && typeof value != 'undefined') {
                    
                    
                    try {
                        nStyle[prop] = value;
                    } catch(e) {}

                    if(nStyle[prop] != before) {
                        return true;
                    }
                }
                
                
                else {
                    return true;
                }
            }
        }
        return false;
    },

    nativeTestProps: function(props, value) {
        var i = props.length;
        if('CSS' in window && 'supports' in window.CSS) {
            
            while(i--) {
                if(window.CSS.supports(this.domToHyphenated(props[i]), value)) {
                    return true;
                }
            }
            return false;
        }
        return undefined;
    },

    domToHyphenated: function(name) {
        return name.replace(/([A-Z])/g, function(str, m1) {
            return '-' + m1.toLowerCase();
        }).replace(/^ms-/, '-ms-');
    },

    
    jsonReplacer: function(key, value) {
        if(key === "parent" || key == "rowtemplate" || key == "rowTemplate") {
            return value && (value.id || value);
        } else if(key == "scrollerInstance" || key == "scrollingevents" || key == "scrollingEvents" || key == "ownchildrenref" || key == "touches") {
            return undefined;
        }
        return value;
    },

    
    contains: function(str, substr) {
        return !!~('' + str).indexOf(substr);
    },

    preventClickEvent: function(event, target) {
        var eType = event.type;
        var tagName = target.tagName;
        if(tagName == 'INPUT' || tagName == 'SELECT') {
            if(eType == 'change')
                $KU.changeFlag = true;
            else if(eType == 'click' && $KU.changeFlag) {
                $KU.changeFlag = false;
                return true;
            }
        }
        return false;
    },

    getTextTrasform: function(wModel, needValue) {
        var value = '';
        switch(wModel.autocapitalize) {
            case constants.TEXTBOX_AUTO_CAPITALIZE_WORDS:
            case constants.TEXTAREA_AUTO_CAPITALIZE_WORDS:
                value = "capitalize";
                break;
            case constants.TEXTBOX_AUTO_CAPITALIZE_ALL:
            case constants.TEXTAREA_AUTO_CAPITALIZE_ALL:
                value = "uppercase";
                break;
            case constants.TEXTBOX_AUTO_CAPITALIZE_SENTENCES:
            case constants.TEXTBOX_AUTO_CAPITALIZE_NONE:
            case constants.TEXTAREA_AUTO_CAPITALIZE_SENTENCES:
            case constants.TEXTAREA_AUTO_CAPITALIZE_NONE:
                value = "none";
                break;
        }
        return value;
    },

    isDefined: function(value) {
        return(typeof value == 'undefined') ? false : true;
    },

    logExecuting: function(apiName) {
        kony.web.logger('trace', 'ENTER '+ apiName);
    },

    logExecutingWithParams: function(apiName) {
    },

    logExecutingFinished: function(apiName) {
        kony.web.logger('trace', 'EXIT '+ apiName);
    },

    logWarnMessage: function(msg) {
        kony.web.logger('warn', msg);
    },

    logErrorMessage: function(msg) {
        kony.web.logger('error', msg);
    },

    logDebugMessage: function(msg) {
        kony.web.logger('debug', msg);
    },

    logPerfMessage: function(msg) {
        kony.web.logger('perf', msg);
    }


};


$KU.widgets = {
    
    invokeAddWidgetsEventForInternalWidgets: function(widgetsList) {
        if(widgetsList && widgetsList.length > 0) {
            var widget;
            while(widget = widgetsList.shift()) {
                $KU.invokeAddWidgets(widget);
            }
        }
    },

    
    invokeInitEventForInternalWidgets: function(widgetsList) {
        if(widgetsList && widgetsList.length > 0) {
            var widget;
            while(widget = widgetsList.shift()) {
                $KU.invokeWidgetInit(widget);
            }
        }
    }
};








var Arraycontains = function(val) {
    var len = this.length;
    if(len == 0)
        return false;
    else {
        for(var i = 0; i < len; i++) {
            if(this[i] == val)
                return true;
        }
    }
    return false;
};

var ArraycontainsTimerAction = function(val) {
    var len = this.length;
    if(len == 0)
        return false;
    else {
        for(var i = 0; i < len; i++) {
            if((this[i].actionName == val.actionName))
                return true;
        }
    }
    return false;
};

var Arrayremove = function(val) {
    var len = this.length;
    if(len == 0)
        return null;
    else {
        for(var i = 0; i < len; i++) {
            if(this[i] == val) {
                return this.removeRange(i);
            }
        }
    }
    return this;
};

var ArrayremoveRange = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

if(!Array.prototype.contains) {
    Object.defineProperty(Array.prototype, "contains", {
        value: Arraycontains,
        enumerable: false
    });
}
if(!Array.prototype.containsTimerAction) {
    Object.defineProperty(Array.prototype, "containsTimerAction", {
        value: ArraycontainsTimerAction,
        enumerable: false
    });
}
if(!Array.prototype.remove) {
    Object.defineProperty(Array.prototype, "remove", {
        value: Arrayremove,
        enumerable: false
    });
}
if(!Array.prototype.removeRange) {
    Object.defineProperty(Array.prototype, "removeRange", {
        value: ArrayremoveRange,
        enumerable: false
    });
}


String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
};

String.prototype.ltrim = function() {
    return this.replace(/^\s+/, "");
};

String.prototype.rtrim = function() {
    return this.replace(/\s+$/, "");
};

String.prototype.startsWith = function(str) {
    return this.slice(0, str.length) === str;
};

kony.json = {
    concat: function(obj1, obj2) {

        for(var key in obj2) {
            obj1[key] = obj2[key];
        }

        return obj1;
    }
};


if(!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if(typeof this !== "function")
            throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function() {},
            fBound = function() {
                return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}


if($KU.isBlackBerry && $KU.getPlatformVersion("blackberry").startsWith("10"))
    $KU.has3d = false;
if(($KU.isBlackBerry || $KU.isBlackBerryNTH) && $KU.getPlatformVersion("blackberry").startsWith("7"))
    $KU.BB7 = true;
if(($KU.isBlackBerry || $KU.isBlackBerryNTH) && $KU.getPlatformVersion("blackberry").startsWith("6"))
    $KU.BB6 = true;
if($KU.isAndroid && $KU.getPlatformVersion("android").startsWith("4.1"))
    $KU.placeholderSupported = false;

var elemInput = document.createElement("input");
$KU.isAutoCapitalizeSupported = "autocapitalize" in elemInput;

var translateOpen = 'translate' + ($KU.has3d ? '3d(' : '(');
var translateClose = $KU.has3d ? ',0)' : ')';
$KU.flexbox = false; 



owl = (function() {
    
    function Clone() {}

    
    function clone(target) {
        if(typeof target == 'object') {
            Clone.prototype = target;
            return new Clone();
        } else {
            return target;
        }
    }


    
    function copy(target) {
        if(typeof target !== 'object') {
            return target; 
        } else {
            var value = target.valueOf();
            if(target != value) {
                
                
                return new target.constructor(value);
            } else {
                
                
                
                
                if(target instanceof target.constructor && target.constructor !== Object) {
                    var c = clone(target.constructor.prototype);

                    
                    
                    for(var property in target) {
                        if(target.hasOwnProperty(property)) {
                            c[property] = target[property];
                        }
                    }
                } else {
                    var c = {};
                    for(var property in target) c[property] = target[property];
                }

                return c;
            }
        }
    }

    
    var deepCopiers = [];

    function DeepCopier(config) {
        for(var key in config) this[key] = config[key];
    }
    DeepCopier.prototype = {
        constructor: DeepCopier,

        
        canCopy: function(source) {
            return false;
        },

        
        
        
        create: function(source) {},

        
        
        
        
        
        populate: function(deepCopyAlgorithm, source, result) {}
    };

    function DeepCopyAlgorithm() {
        
        
        this.copiedObjects = [];
        thisPass = this;
        this.recursiveDeepCopy = function(source) {
            return thisPass.deepCopy(source);
        }
        this.depth = 0;
    }
    DeepCopyAlgorithm.prototype = {
        constructor: DeepCopyAlgorithm,

        maxDepth: 256,

        
        
        cacheResult: function(source, result) {
            this.copiedObjects.push([source, result]);
        },

        
        
        getCachedResult: function(source) {
            var copiedObjects = this.copiedObjects;
            var length = copiedObjects.length;
            for(var i = 0; i < length; i++) {
                if(copiedObjects[i][0] === source) {
                    return copiedObjects[i][1];
                }
            }
            return undefined;
        },

        
        
        
        deepCopy: function(source) {
            
            if(source === null) return null;

            
            if(typeof source !== 'object') return source;

            var cachedResult = this.getCachedResult(source);

            
            
            
            if(cachedResult) return cachedResult;

            
            
            
            for(var i = 0; i < deepCopiers.length; i++) {
                var deepCopier = deepCopiers[i];
                if(deepCopier.canCopy(source, this.newIdPrefix)) {
                    return this.applyDeepCopier(deepCopier, source);
                }
            }
            
            throw new Error("no DeepCopier is able to copy " + source);
        },

        
        
        
        
        
        applyDeepCopier: function(deepCopier, source) {
            
            var result = deepCopier.create(source);

            
            
            
            this.cacheResult(source, result);

            
            
            
            this.depth++;
            if(this.depth > this.maxDepth) {
                throw new Error("Exceeded max recursion depth in deep copy.");
            }

            
            deepCopier.populate(this.recursiveDeepCopy, source, result, this.newIdPrefix);

            this.depth--;

            return result;
        }
    };

    
    
    
    function deepCopy(source, maxDepth, newIdPrefix) {
        var deepCopyAlgorithm = new DeepCopyAlgorithm();
        if(maxDepth) deepCopyAlgorithm.maxDepth = maxDepth;
        if(typeof newIdPrefix != 'undefined') deepCopyAlgorithm.newIdPrefix = newIdPrefix;
        return deepCopyAlgorithm.deepCopy(source);
    }

    
    deepCopy.DeepCopier = DeepCopier;

    
    deepCopy.deepCopiers = deepCopiers;

    
    
    deepCopy.register = function(deepCopier) {
        if(!(deepCopier instanceof DeepCopier)) {
            deepCopier = new DeepCopier(deepCopier);
        }
        deepCopiers.unshift(deepCopier);
    }

    
    
    
    deepCopy.register({
        canCopy: function(source) {
            return true;
        },

        create: function(source) {
            if(source instanceof source.constructor) {
                return clone(source.constructor.prototype);
            } else {
                return {};
            }
        },

        populate: function(deepCopy, source, result) {
            for(var key in source) {
                if(source.hasOwnProperty(key) && key != 'gestures') {

                    var g = source.__lookupGetter__(key),
                        s = source.__lookupSetter__(key);

                    if(kony.enableGettersSetters && (g || s)) {
                        if(g)
                            result.__defineGetter__(key, g);
                        if(s)
                            result.__defineSetter__(key, s);
                    } else {
                        result[key] = deepCopy(source[key]);
                    }
                }
                if(key === 'gestures') {
                    result[key] = source[key];
                }
            }
            if(result.wType) {
                result.isCloned = true;
            }

            return result;
        }
    });

    
    
    deepCopy.register({
        canCopy: function(source, newIdPrefix) {
            return newIdPrefix !== false && (source instanceof kony.ui.Widget)
        },

        create: function(source) {
            var constructor = source.constructor;
            var instance = Object.create(constructor.prototype);
            constructor.apply(instance, source.constructorList);
            return instance;
        },

        populate: function(deepCopy, source, result, newIdPrefix) {

            if(newIdPrefix && source.id) {
                result.id = newIdPrefix + source.id;
                result.constructorList[0].id = result.id;
            }
            for(var key in source) {
                if(source.hasOwnProperty(key) && !this.excludeList[key]) {
                    var srcObj = source[key];
                    if(srcObj && !(srcObj instanceof kony.ui.Widget)) {
                        result[key] = deepCopy(srcObj);
                    }
                }
            }

            if(source instanceof kony.ui.ContainerWidget && source.ownchildrenref && source.ownchildrenref.length > 0) {
                for(var i = 0; i < source.ownchildrenref.length; i++) {
                    var child = source.ownchildrenref[i];
                    result.add(child.clone(newIdPrefix));
                }
            }

            

            return result;
        },

        excludeList: {
            "constructorList": true,
            "children": true,
            "ownchildrenref": true,
            "parent": true,
            "pf": true,
            "layoutConfig": true,
            "gestures": true,
            "id": true,
            "immediateMaster": true
        }
    });

    
    deepCopy.register({
        canCopy: function(source) {
            return(source instanceof Array);
        },

        create: function(source) {
            return new source.constructor();
        },

        populate: function(deepCopy, source, result) {
            for(var i = 0; i < source.length; i++) {
                result.push(deepCopy(source[i]));
            }
            return result;
        }
    });

    
    deepCopy.register({
        canCopy: function(source) {
            return(source instanceof Date);
        },

        create: function(source) {
            return new Date(source);
        }
    });

    

    
    
    
    function isNode(source) {
        if(window.Node) {
            return source instanceof Node;
        } else {
            
            
            if(source === document) return true;
            return(
                typeof source.nodeType === 'number' &&
                source.attributes &&
                source.childNodes &&
                source.cloneNode
            );
        }
    }

    
    deepCopy.register({
        canCopy: function(source) {
            return isNode(source);
        },

        create: function(source) {
            
            if(source === document) return document;

            
            
            return source.cloneNode(false);
        },

        populate: function(deepCopy, source, result) {
            
            if(source === document) return document;

            
            if(source.childNodes && source.childNodes.length) {
                for(var i = 0; i < source.childNodes.length; i++) {
                    var childCopy = deepCopy(source.childNodes[i]);
                    result.appendChild(childCopy);
                }
            }
        }
    });

    return {
        DeepCopyAlgorithm: DeepCopyAlgorithm,
        copy: copy,
        clone: clone,
        deepCopy: deepCopy
    };
})();
