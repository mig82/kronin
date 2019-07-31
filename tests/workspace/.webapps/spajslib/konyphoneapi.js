$KI.phone = (function() {
    
    

    var module = {
        dial: function(phoneno) {
            $KW.unLoadWidget();
            var href;
            var platform = $KU.getPlatform();
            if(platform.name == "iphone" && platform.version >= "5" && platform.version < "8")
                href = "tel://" + phoneno;
            else
                href = "tel:" + phoneno;

            window.location.href = href;
        },
        myLocation: function() {
            kony.web.logger("warn", "DEPRECATED API. Instead use geolocation.");
        },
        openmediagallery: function(onselectioncallback, querycontext, widgetref) {

            if(!window.File || !window.FileReader || !window.FileList) { 
                kony.print("openMediaGallery error:: 2103, Cannot open media gallery. Not supported."); 
                return;
            }

            var input = document.createElement('input');
            input.type = 'file';
            input.setAttribute('style', 'display:none;');
            input.setAttribute('id', 'openmediagallery');
            if(querycontext && querycontext.mimetype) { 
                input.setAttribute('accept', querycontext.mimetype);
            }
            var form = document.getElementsByTagName('form')[0];
            form.appendChild(input); 
            kony.events.addEventListener(input, 'change', handleFiles);
            input.click();

            function handleFiles() {
                kony.events.removeEventListener(input, 'change', handleFiles);
                form.removeChild(input); 

                if(onselectioncallback && onselectioncallback instanceof Function) {
                    var reader = new FileReader();
                    var mimetype = this.files[0].type;
                    var info;

                    reader.onload = function(evt) { 
                        var chars = new Uint8Array(evt.target.result);
                        var CHUNK_SIZE = 0x8000,
                            index = 0,
                            result = '',
                            slice;
                        while(index < chars.length) {
                            slice = chars.subarray(index, Math.min(index + CHUNK_SIZE, chars.length));
                            result += String.fromCharCode.apply(null, slice);
                            index += CHUNK_SIZE;
                        }
                        info = new kony.utils.konyRawBytes(result, "utf8");

                        onselectioncallback(info, kony.application.PERMISSION_GRANTED, mimetype); 
                    };
                    reader.onerror = function(evt) { 
                        if(evt.target.error instanceof FileError) { 
                            switch(evt.target.error.code) {
                                case FileError.NOT_FOUND_ERR:
                                    kony.print("openMediaGallery error:: The file resource couldn't be found at the time the read was processed.");
                                    break;
                                case FileError.NOT_READABLE_ERR:
                                    kony.print("openMediaGallery error:: 2101, The resource couldn't be read. Insufficient Permissions.");
                                    break;
                                case FileError.ENCODING_ERR:
                                    kony.print("openMediaGallery error:: The resource couldn't be encoded.");
                                    break;
                                case FileError.SECURITY_ERR:
                                default:
                                    kony.print("openMediaGallery error:: The file resource is unsafe/changed/other unspecified security error.");
                            }
                        } else 
                            kony.print("openMediaGallery error:: " + evt.target.error.name + ", " + evt.target.error.message);
                    };
                    reader.readAsArrayBuffer(this.files[0]); 
                } else {
                    kony.print("openMediaGallery error:: callback function not provided.");
                }
            }
        },

        addCalendarEvent: function() {
            kony.web.logger("warn", "The addCalendarEvent API is not supported.");
        },

        findCalendarEvents: function() {
            kony.web.logger("warn", "The findCalendarEvents API is not supported.");
        },

        openEmail: function() {
            kony.web.logger("warn", "The openEmail API is not supported.");
        },

        removeCalendarEvent: function() {
            kony.web.logger("warn", "The removeCalendarEvent API is not supported.");
        },

        sendSMS: function() {
            kony.web.logger("warn", "The sendSMS API is not supported.");
        }
    };


    return module;
}());
