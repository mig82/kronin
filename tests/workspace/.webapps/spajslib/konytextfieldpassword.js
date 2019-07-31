

function MaskedPassword(passfield, symbol) {
    
    
    if(typeof document.getElementById == 'undefined' ||
        typeof document.styleSheets == 'undefined') {
        return false;
    }

    
    if(passfield == null) {
        return false;
    }

    
    this.symbol = symbol;

    
    this.maskingTimerId = null;

    
    this.isIE = typeof document.uniqueID != 'undefined';

    
    passfield.value = '';
    passfield.defaultValue = '';

    
    
    
    
    passfield._contextwrapper = this.createContextWrapper(passfield);

    
    
    
    
    
    
    
    
    
    
    
    this.fullmask = true;

    
    
    
    
    
    
    

    
    var wrapper = passfield._contextwrapper;

    
    
    var hiddenfield = '<input type="hidden" id="' + passfield.id + '_value" name="' + passfield.name + '">';

    
    var textfield = this.convertPasswordFieldHTML(passfield);

    
    wrapper.innerHTML = hiddenfield + textfield;

    
    
    passfield = wrapper.lastChild;
    passfield.className += ' masked';

    
    
    
    
    
    passfield.setAttribute('autocomplete', 'off');

    
    
    passfield._realfield = wrapper.firstChild;

    
    passfield._contextwrapper = wrapper;

    
    
    
    
    
    this.limitCaretPosition(passfield);

    
    var self = this;

    
    this.addListener(passfield, 'change', function(e) {
        self.fullmask = false;
        self.doPasswordMasking(self.getTarget(e));
    });
    this.addListener(passfield, 'input', function(e) {
        self.fullmask = false;
        if(self.maskingTimerId) {
            window.clearTimeout(self.maskingTimerId);
            self.maskingTimerId = null;
        }
        self.doPasswordMasking(self.getTarget(e));
        if(!self.maskingTimerId) {
            self.maskingTimerId = window.setTimeout(function() {
                self.forceMasking(passfield);
            }, 500);
        }
    });
    
    this.addListener(passfield, 'propertychange', function(e) {
        self.doPasswordMasking(self.getTarget(e));
    });

    
    
    
    
    
    
    this.addListener(passfield, 'keyup', function(e) {
        if(!/^(9|1[678]|224|3[789]|40)$/.test(e.keyCode.toString())) {
            self.fullmask = false;
            if(self.maskingTimerId) {
                window.clearTimeout(self.maskingTimerId);
                self.maskingTimerId = null;
            }
            var widgetModel = $KU.getModelByNode(passfield);
            widgetModel.text = passfield.previousSibling.value;
            self.doPasswordMasking(self.getTarget(e));
            if(!self.maskingTimerId) {
                self.maskingTimerId = window.setTimeout(function() {
                    self.forceMasking(passfield);
                }, 500);
            }
        }
    });

    
    
    this.addListener(passfield, 'blur', function(e) {
        self.fullmask = true;
        self.forceMasking(passfield);
    });

    
    
    

    
    
    this.forceFormReset(passfield);

    
    return true;
}


MaskedPassword.prototype = {
    
    doPasswordMasking: function(textbox, fullmask) {
        if(typeof fullmask == 'undefined') {
            fullmask = this.fullmask;
        }

        
        var plainpassword = '';

        
        
        if(textbox._realfield.value != '') {
            
            
            
            for(var i = 0; i < textbox.value.length; i++) {
                if(textbox.value.charAt(i) == this.symbol) {
                    plainpassword += textbox._realfield.value.charAt(i);
                } else {
                    plainpassword += textbox.value.charAt(i);
                }
            }
        }

        
        
        else {
            plainpassword = textbox.value;
        }

        
        
        var maskedstring = this.encodeMaskedPassword(plainpassword, fullmask, textbox);
        

        
        
        
        
        
        
        
        if(textbox._realfield.value != plainpassword || textbox.value != maskedstring) {
            
            textbox._realfield.value = plainpassword;

            
            textbox.value = maskedstring;
        }
    },


    
    encodeMaskedPassword: function(passwordstring, fullmask, textbox) {
        
        
        
        
        var characterlimit = fullmask === true ? 0 : 1;

        
        
        for(var maskedstring = '', i = 0; i < passwordstring.length; i++) {
            
            
            if(i < passwordstring.length - characterlimit) {
                maskedstring += this.symbol;
            }
            
            else {
                maskedstring += passwordstring.charAt(i);
            }
        }

        
        return maskedstring;
    },


    
    forceMasking: function(passfield) {
        var widgetModel = $KU.getModelByNode(passfield);
        widgetModel.text = passfield.previousSibling.value;
        this.doPasswordMasking(passfield, true);
    },


    
    createContextWrapper: function(passfield) {
        
        
        var wrapper = document.createElement('span');

        
        wrapper.style.position = 'relative';

        
        passfield.parentNode.insertBefore(wrapper, passfield);

        
        wrapper.appendChild(passfield);

        
        return wrapper;
    },


    
    forceFormReset: function(textbox) {
        
        
        while(textbox) {
            if(/form/i.test(textbox.nodeName)) {
                break;
            }
            textbox = textbox.parentNode;
        }
        
        
        if(!/form/i.test(textbox.nodeName)) {
            return null;
        }

        
        
        
        
        
        
        this.addSpecialLoadListener(function() {
            textbox.reset();
        });

        
        return textbox;
    },


    
    
    
    convertPasswordFieldHTML: function(passfield, addedattrs) {
        
        var textfield = '<input';

        
        
        
        
        
        
        for(var fieldattributes = passfield.attributes, j = 0; j < fieldattributes.length; j++) {
            
            
            
            if(fieldattributes[j].specified && !/^(_|type|name)/.test(fieldattributes[j].name)) {
                textfield += ' ' + fieldattributes[j].name + '="' + fieldattributes[j].value + '"';
            }
        }

        
        
        
        
        
        textfield += ' type="text" autocomplete="off">';

        
        return textfield;
    },


    
    
    limitCaretPosition: function(textbox) {
        
        var timer = null,
            start = function() {
                
                if(timer == null) {
                    
                    if(this.isIE) {
                        
                        
                        timer = window.setInterval(function() {
                            
                            
                            
                            
                            
                            var range = textbox.createTextRange(),
                                valuelength = textbox.value.length,
                                character = 'character';
                            range.moveEnd(character, valuelength);
                            range.moveStart(character, valuelength);
                            range.select();

                            
                            
                        }, 100);
                    }
                    
                    else {
                        
                        
                        timer = window.setInterval(function() {
                            
                            
                            var valuelength = textbox.value.length;
                            if(!(textbox.selectionEnd == valuelength && textbox.selectionStart <= valuelength)) {
                                textbox.selectionStart = valuelength;
                                textbox.selectionEnd = valuelength;
                            }

                            
                        }, 100);
                    }
                }
            },

            
            stop = function() {
                window.clearInterval(timer);
                timer = null;
            };

        
        this.addListener(textbox, 'focus', function() {
            start();
        });
        this.addListener(textbox, 'blur', function() {
            stop();
        });
    },


    
    
    
    addListener: function(eventnode, eventname, eventhandler) {
        if(typeof document.addEventListener != 'undefined') {
            return eventnode.addEventListener(eventname, eventhandler, false);
        } else if(typeof document.attachEvent != 'undefined') {
            return eventnode.attachEvent('on' + eventname, eventhandler);
        }
    },


    
    
    
    addSpecialLoadListener: function(eventhandler) {
        
        
        
        if(this.isIE) {
            return window.attachEvent('onload', eventhandler);
        } else {
            return document.addEventListener('DOMContentLoaded', eventhandler, false);
        }
    },


    
    
    
    
    getTarget: function(e) {
        
        if(!e) {
            return null;
        }

        
        return e.target ? e.target : e.srcElement;
    }

};
