
$KW.TextField.AutoComplete = {
    
    __AutoCompleteClass: 'autocomplete_base',
    __AutoComplete: new Array(),
    __AutoCompleteElementId: null,

    
    isIE: document.all ? true : false,
    isGecko: navigator.userAgent.toLowerCase().indexOf('gecko') != -1,
    isOpera: navigator.userAgent.toLowerCase().indexOf('opera') != -1,

    AutoSuggestOrientation: function() {
        if(this.__AutoCompleteElementId != null) {

            this.AutoComplete_HideAll();
            
            this.AutoComplete_CreateDropdownZeroSize(this.__AutoCompleteElementId);
            this.AutoComplete_ShowDropdown(this.__AutoCompleteElementId);
            this.AutoComplete_HideAll();
            this.AutoComplete_CreateDropdown(this.__AutoCompleteElementId);
            this.AutoComplete_ShowDropdown(this.__AutoCompleteElementId);
            
        }
    },

    
    AutoComplete_Create: function(id, data) {
        this.__AutoComplete[id] = {
            'data': data,
            'isVisible': false,
            'element': document.getElementById(id),
            'dropdown': null,
            'highlighted': null,
            'styleclass': this.__AutoCompleteClass
        };

        this.__AutoComplete[id]['element'].setAttribute(this.__AutoCompleteClass, 'off');
        this.__AutoComplete[id]['element'].onkeydown = function(e) {
            return $KW.TextField.AutoComplete.AutoComplete_KeyDown(this.getAttribute('id'), e);
        }
        this.__AutoComplete[id]['element'].onkeyup = function(e) {
            return $KW.TextField.AutoComplete.AutoComplete_KeyUp(this.getAttribute('id'), e);
        }
        this.__AutoComplete[id]['element'].onkeypress = function(e) {
            if(!e) e = window.event;
            if(e.keyCode == 13 || this.isOpera) return false;
        }
        this.__AutoComplete[id]['element'].ondblclick = function() {
            $KW.TextField.AutoComplete.AutoComplete_ShowDropdown(this.getAttribute('id'));
        }
        this.__AutoComplete[id]['element'].onclick = function(e) {
            if(!e) e = window.event;
            e.cancelBubble = true;
            e.returnValue = false;
        }

        
        var docClick = function() {
            for(id in this.__AutoComplete) {
                $KW.TextField.AutoComplete.AutoComplete_HideDropdown(id);
            }
        }

        if(document.addEventListener) {
            document.addEventListener('click', docClick, false);
        } else if(document.attachEvent) {
            document.attachEvent('onclick', docClick, false);
        }


        
        if(arguments[2] != null) {
            this.__AutoComplete[id]['maxitems'] = arguments[2];
            this.__AutoComplete[id]['firstItemShowing'] = 0;
            this.__AutoComplete[id]['lastItemShowing'] = arguments[2] - 1;
        }

        this.AutoComplete_CreateDropdown(id);

        
        if(this.isIE) {
            this.__AutoComplete[id]['iframe'] = document.createElement('iframe');
            this.__AutoComplete[id]['iframe'].id = id + '_iframe';
            this.__AutoComplete[id]['iframe'].style.position = 'absolute';
            this.__AutoComplete[id]['iframe'].style.top = '0';
            this.__AutoComplete[id]['iframe'].style.left = '0';
            this.__AutoComplete[id]['iframe'].style.width = '0px';
            this.__AutoComplete[id]['iframe'].style.height = '0px';
            this.__AutoComplete[id]['iframe'].style.zIndex = '98';
            this.__AutoComplete[id]['iframe'].style.visibility = 'hidden';

            this.__AutoComplete[id]['element'].parentNode.insertBefore(this.__AutoComplete[id]['iframe'], this.__AutoComplete[id]['element']);
        }
    },

    
    AutoComplete_CreateDropdown: function(id) {
        var left = this.AutoComplete_GetLeft(this.__AutoComplete[id]['element']);
        var top = this.AutoComplete_GetTop(this.__AutoComplete[id]['element']) + this.__AutoComplete[id]['element'].offsetHeight;
        var width = this.__AutoComplete[id]['element'].offsetWidth;
        
        this.__AutoComplete[id]['dropdown'] = document.createElement('div');
        this.__AutoComplete[id]['dropdown'].className = this.__AutoCompleteClass; 

        this.AutoComplete_RemoveDivs(id);

        this.__AutoComplete[id]['element'].parentNode.insertBefore(this.__AutoComplete[id]['dropdown'], this.__AutoComplete[id]['element']);
        
        this.__AutoComplete[id]['dropdown'].style.left = left + 'px';
        this.__AutoComplete[id]['dropdown'].style.top = top + 'px';
        this.__AutoComplete[id]['dropdown'].style.width = width + 'px';
        this.__AutoComplete[id]['dropdown'].style.zIndex = '99';
        this.__AutoComplete[id]['dropdown'].style.visibility = 'hidden';

        
        var el = document.getElementById(id);
        if(el.getAttribute('autosuggestskin') != null) {
            this.__AutoComplete[id]['styleclass'] = el.getAttribute('autosuggestskin');
            this.__AutoComplete[id]['dropdown'].className = this.__AutoComplete[id]['styleclass'];
            this.__AutoComplete[id]['dropdown'].style.position = 'absolute';
            this.__AutoComplete[id]['dropdown'].style.borderStyle = 'solid';
            this.__AutoComplete[id]['dropdown'].style.borderWidth = '1px';
            this.__AutoComplete[id]['dropdown'].style.borderColor = 'black';
            this.__AutoComplete[id]['dropdown'].style.backgroundColor = 'white';
            this.__AutoComplete[id]['dropdown'].style.overflow = 'auto';
            this.__AutoComplete[id]['dropdown'].style.overflowX = 'hidden';

        } else {
            this.__AutoComplete[id]['dropdown'].style.fontFamily = this.getElementStyle(el, 'font-family');
            this.__AutoComplete[id]['dropdown'].style.fontSize = this.getElementStyle(el, 'font-size');
            this.__AutoComplete[id]['dropdown'].style.fontStyle = this.getElementStyle(el, 'font-style');
            this.__AutoComplete[id]['dropdown'].style.fontWeight = this.getElementStyle(el, 'font-weight');
            this.__AutoComplete[id]['dropdown'].style.color = this.getElementStyle(el, 'color');
        }
        this.AutoComplete_RemoveDivs(id);

        this.__AutoComplete[id]['element'].parentNode.insertBefore(this.__AutoComplete[id]['dropdown'], this.__AutoComplete[id]['element']);
    },

    getElementStyle: function(el, styleProp) {
        var elementstyle = null;
        if(el.currentStyle)
            elementstyle = el.currentStyle[styleProp];
        else if(window.getComputedStyle)
            elementstyle = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
        return elementstyle;
    },

    AutoComplete_RemoveDivs: function(id) {
        var autoCompleteParent = document.getElementById(id).parentNode;
        if(this.__AutoComplete[id]) {
            var autoCompleteDivs = document.getElementsByClassName(this.__AutoComplete[id]['styleclass']);
            if(autoCompleteDivs.length > 0) {
                for(var i = 0; i < autoCompleteDivs.length; i++) {
                    if(autoCompleteDivs[i].nextSibling.id === id)
                        autoCompleteParent.removeChild(autoCompleteDivs[i]);
                }
            }
        }
    },

    
    AutoComplete_CreateDropdownZeroSize: function(id) {
        
        this.__AutoComplete[id]['dropdown'].style.left = '1px';
        this.__AutoComplete[id]['dropdown'].style.top = '1px';
        this.__AutoComplete[id]['dropdown'].style.width = '10px';
        this.__AutoComplete[id]['dropdown'].style.zIndex = '99';
        this.__AutoComplete[id]['dropdown'].style.visibility = 'hidden';
    },

    
    AutoComplete_GetLeft: function(element) {
        var curNode = element;
        var left = 0;

        do {
            left += curNode.offsetLeft;
            curNode = curNode.offsetParent;

        } while (curNode.tagName.toLowerCase() != 'body');

        return left;
    },

    
    AutoComplete_GetTop: function(element) {
        var curNode = element;
        var top = 0;

        do {
            top += curNode.offsetTop;
            curNode = curNode.offsetParent;

        } while (curNode.tagName.toLowerCase() != 'body');

        return top;
    },

    
    AutoComplete_ShowDropdown: function(id) {
        this.AutoComplete_HideAll();
        this.__AutoCompleteElementId = id;
        var value = this.__AutoComplete[id]['element'].value;
        var toDisplay = new Array();
        var newDiv = null;
        var text = null;
        var numItems = this.__AutoComplete[id]['dropdown'].childNodes.length;

        
        while(this.__AutoComplete[id]['dropdown'].childNodes.length > 0) {
            this.__AutoComplete[id]['dropdown'].removeChild(this.__AutoComplete[id]['dropdown'].childNodes[0]);
        }

        
        value = value.ltrim().toUpperCase();
        for(i = 0; i < this.__AutoComplete[id]['data'].length; ++i) {
            if(this.__AutoComplete[id]['data'][i].toUpperCase().indexOf(value) != -1) {
                toDisplay[toDisplay.length] = this.__AutoComplete[id]['data'][i];
            }
        }

        
        if(toDisplay.length == 0) {
            this.AutoComplete_HideDropdown(id);
            return;
        }

        var target = document.getElementById(id);
        var space = target.getAttribute('suggestionspace');
        if(space)
            space = parseInt(space) / 2;

        
        for(i = 0; i < toDisplay.length; ++i) {
            newDiv = document.createElement('div');
            newDiv.className = 'autocomplete_item'; 
            newDiv.setAttribute('id', 'autocomplete_item_' + i);
            newDiv.setAttribute('index', i);
            newDiv.style.zIndex = '99';

            
            if(toDisplay.length > this.__AutoComplete[id]['maxitems'] && navigator.userAgent.indexOf('MSIE') == -1) {
                newDiv.style.width = this.__AutoComplete[id]['element'].offsetWidth - 22 + 'px';
            }

            newDiv.onmouseover = function() {
                $KW.TextField.AutoComplete.AutoComplete_HighlightItem($KW.TextField.AutoComplete.__AutoComplete[id]['element'].getAttribute('id'), this.getAttribute('index'));
            };
            newDiv.onclick = function() {
                $KW.TextField.AutoComplete.AutoComplete_SetValue($KW.TextField.AutoComplete.__AutoComplete[id]['element'].getAttribute('id'));
                $KW.TextField.AutoComplete.AutoComplete_RemoveDivs(id);
            }

            text = document.createTextNode(toDisplay[i]);
            newDiv.appendChild(text);

            this.AutoComplete_HideAllDropdowns()

            if(space) {
                newDiv.style.paddingBottom = space + "px";
                newDiv.style.paddingTop = space + "px";
            }
            this.__AutoComplete[id]['dropdown'].appendChild(newDiv);
        }


        
        if(toDisplay.length > this.__AutoComplete[id]['maxitems']) {
            this.__AutoComplete[id]['dropdown'].style.height = (this.__AutoComplete[id]['maxitems'] * 15) + 2 + 'px';

        } else {
            this.__AutoComplete[id]['dropdown'].style.height = '';
        }


        
        this.__AutoComplete[id]['dropdown'].style.left = this.AutoComplete_GetLeft(this.__AutoComplete[id]['element']) + 'px';
        this.__AutoComplete[id]['dropdown'].style.top = this.AutoComplete_GetTop(this.__AutoComplete[id]['element']) + this.__AutoComplete[id]['element'].offsetHeight + 'px';


        
        if(this.isIE) {
            this.__AutoComplete[id]['iframe'].style.top = this.__AutoComplete[id]['dropdown'].style.top;
            this.__AutoComplete[id]['iframe'].style.left = this.__AutoComplete[id]['dropdown'].style.left;
            this.__AutoComplete[id]['iframe'].style.width = this.__AutoComplete[id]['dropdown'].offsetWidth;
            this.__AutoComplete[id]['iframe'].style.height = this.__AutoComplete[id]['dropdown'].offsetHeight;

            this.__AutoComplete[id]['iframe'].style.visibility = 'visible';
        }


        
        if(!this.__AutoComplete[id]['isVisible']) {
            this.__AutoComplete[id]['dropdown'].style.visibility = 'visible';
            this.__AutoComplete[id]['isVisible'] = true;
        }


        
        if(this.__AutoComplete[id]['dropdown'].childNodes.length != numItems) {
            this.__AutoComplete[id]['highlighted'] = null;
        }
    },

    
    AutoComplete_HideDropdown: function(id) {
        if(this.__AutoComplete[id]['iframe']) {
            this.__AutoComplete[id]['iframe'].style.visibility = 'hidden';
        }

        if(this.__AutoComplete[id]['dropdown']) {
            this.__AutoComplete[id]['dropdown'].style.visibility = 'hidden';
        }
        this.__AutoComplete[id]['highlighted'] = null;
        this.__AutoComplete[id]['isVisible'] = false;
    },

    
    AutoComplete_HideAll: function() {
        for(id in this.__AutoComplete) {
            this.AutoComplete_HideDropdown(id);
        }
    },

    AutoComplete_HideAllDropdowns: function() {
        var autocompdivs = document.getElementsByClassName(this.__AutoComplete[id]['styleclass']);
        if(autocompdivs != null) {
            for(var i = 0; i < autocompdivs.length; i++) {
                autocompdivs[i].style.visibility = 'hidden';
            }
        }
    },

    
    AutoComplete_HighlightItem: function(id, index) {
        if(this.__AutoComplete[id]['dropdown'].childNodes[index]) {
            for(var i = 0; i < this.__AutoComplete[id]['dropdown'].childNodes.length; ++i) {
                if(this.__AutoComplete[id]['dropdown'].childNodes[i].className == 'autocomplete_item_highlighted') {
                    this.__AutoComplete[id]['dropdown'].childNodes[i].className = 'autocomplete_item';
                }
            }

            this.__AutoComplete[id]['dropdown'].childNodes[index].className = 'autocomplete_item_highlighted';
            this.__AutoComplete[id]['highlighted'] = index;
        }
    },

    
    AutoComplete_Highlight: function(id, index) {
        
        if(index == 1 && this.__AutoComplete[id]['highlighted'] == this.__AutoComplete[id]['dropdown'].childNodes.length - 1) {
            this.__AutoComplete[id]['dropdown'].childNodes[this.__AutoComplete[id]['highlighted']].className = 'autocomplete_item';
            this.__AutoComplete[id]['highlighted'] = null;

        } else if(index == -1 && this.__AutoComplete[id]['highlighted'] == 0) {
            this.__AutoComplete[id]['dropdown'].childNodes[0].className = 'autocomplete_item';
            this.__AutoComplete[id]['highlighted'] = this.__AutoComplete[id]['dropdown'].childNodes.length;
        }

        
        if(this.__AutoComplete[id]['highlighted'] == null) {
            this.__AutoComplete[id]['dropdown'].childNodes[0].className = 'autocomplete_item_highlighted';
            this.__AutoComplete[id]['highlighted'] = 0;

        } else {
            if(this.__AutoComplete[id]['dropdown'].childNodes[this.__AutoComplete[id]['highlighted']]) {
                this.__AutoComplete[id]['dropdown'].childNodes[this.__AutoComplete[id]['highlighted']].className = 'autocomplete_item';
            }

            var newIndex = this.__AutoComplete[id]['highlighted'] + index;

            if(this.__AutoComplete[id]['dropdown'].childNodes[newIndex]) {
                this.__AutoComplete[id]['dropdown'].childNodes[newIndex].className = 'autocomplete_item_highlighted';

                this.__AutoComplete[id]['highlighted'] = newIndex;
            }
        }
    },

    
    AutoComplete_SetValue: function(id) {
        this.__AutoComplete[id]['element'].value = this.__AutoComplete[id]['dropdown'].childNodes[this.__AutoComplete[id]['highlighted']].innerHTML;
    },
    
    AutoComplete_ScrollCheck: function(id) {
        
        if(this.__AutoComplete[id]['highlighted'] > this.__AutoComplete[id]['lastItemShowing']) {
            this.__AutoComplete[id]['firstItemShowing'] = this.__AutoComplete[id]['highlighted'] - (this.__AutoComplete[id]['maxitems'] - 1);
            this.__AutoComplete[id]['lastItemShowing'] = this.__AutoComplete[id]['highlighted'];
        }

        
        if(this.__AutoComplete[id]['highlighted'] < this.__AutoComplete[id]['firstItemShowing']) {
            this.__AutoComplete[id]['firstItemShowing'] = this.__AutoComplete[id]['highlighted'];
            this.__AutoComplete[id]['lastItemShowing'] = this.__AutoComplete[id]['highlighted'] + (this.__AutoComplete[id]['maxitems'] - 1);
        }

        this.__AutoComplete[id]['dropdown'].scrollTop = this.__AutoComplete[id]['firstItemShowing'] * 15;
    },

    
    AutoComplete_KeyDown: function(id) {
        
        if(arguments[1] != null) {
            event = arguments[1];
        }

        var keyCode = event.keyCode;

        switch(keyCode) {

            
            case 13:
                if(this.__AutoComplete[id]['highlighted'] != null) {
                    this.AutoComplete_SetValue(id);
                    this.AutoComplete_HideAllDropdowns();
                }

                
                break;

                
            case 27:
                this.AutoComplete_HideAllDropdowns();
                event.returnValue = false;
                event.cancelBubble = true;
                break;

                
            case 38:
                if(!this.__AutoComplete[id]['isVisible']) {
                    this.AutoComplete_ShowDropdown(id);
                }

                this.AutoComplete_Highlight(id, -1);
                this.AutoComplete_ScrollCheck(id, -1);
                return false;
                break;

                
            case 9:
                if(this.__AutoComplete[id]['isVisible']) {
                    this.AutoComplete_HideAllDropdowns();
                }
                return;

                
            case 40:
                if(!this.__AutoComplete[id]['isVisible']) {
                    this.AutoComplete_ShowDropdown(id);
                }

                this.AutoComplete_Highlight(id, 1);
                this.AutoComplete_ScrollCheck(id, 1);
                return false;
                break;
        }
    },

    
    AutoComplete_KeyUp: function(id) {
        
        if(arguments[1] != null) {
            event = arguments[1];
        }

        var keyCode = event.keyCode;

        switch(keyCode) {
            case 13:
                event.returnValue = false;
                event.cancelBubble = true;
                break;

            case 27:
                this.AutoComplete_HideAllDropdowns();
                event.returnValue = false;
                event.cancelBubble = true;
                break;

            case 38:
            case 40:
                return false;
                break;

            default:
                this.AutoComplete_ShowDropdown(id);
                break;
        }
    },

    
    AutoComplete_isVisible: function(id) {
        return this__AutoComplete[id]['dropdown'].style.visibility == 'visible';
    }
};
