
$KW.Video = $KW.Audio = $KW.Media = (function() {
    
    

    var module = {
        initializeView: function(formId) {
            if(!$KU.isAndroid)
                return;
            var videos = document.querySelectorAll("#" + formId + " video");
            for(var i = 0; i < videos.length; i++) {
                var video = videos[i];
                kony.events.addEventListener(video, 'click', function(event) {
                    event = event || window.event;
                    if(event.srcElement.getAttribute("kdisabled") == "true") {
                        kony.events.stopPropagation(event);
                        kony.events.preventDefault(event);
                        return;
                    } else
                        event.srcElement.play();
                }, false);
                kony.events.addEventListener(video, 'playing', function(event) {
                    event = event || window.event;
                    event.srcElement.playing = true;
                }, false);
            }
        },

        updateView: function(widgetModel, propertyName, propertyValue, oldPropertyValue) {
            var element = $KU.getNodeByModel(widgetModel);
            if(!element)
                return;

            switch(propertyName) {
                case "source":
                    var srcDiv = this.getSrc(widgetModel);
                    var computedSkin = $KW.skins.getWidgetSkinList(widgetModel, {
                        formID: widgetModel.pf
                    });
                    element.setAttribute("class", computedSkin + srcDiv[1]);
                    element.innerHTML = srcDiv[0];
                    break;
            }
        },

        render: function(mediaModel, context) {
            var computedSkin = $KW.skins.getWidgetSkinList(mediaModel, context);
            var html = $KW.Utils.getBaseHtml(mediaModel, context)
            var tabpane = context.tabpaneID ? (" ktabpaneid=" + context.tabpaneID) : "";
            var autoplay = mediaModel.autoplay ? " autoplay='autoplay'" : "";
            var poster = mediaModel.poster ? (" poster=" + $KU.getImageURL(mediaModel.poster)) : "";
            var style = " style='" + $KW.skins.getMarginSkin(mediaModel, context) + ";" + $KW.skins.getPaddingSkin(mediaModel) + "'";
            var loop = mediaModel.loop ? " loop='loop'" : "";
            
            var controls = (mediaModel.controls || mediaModel.controls == undefined) ? " controls='controls'" : "";
            var heightwidth = mediaModel.heightwidth; 
            if(heightwidth) 
            {
                heightwidth = heightwidth.split(",");
                heightwidth = (heightwidth[1] != "0" ? (" width=" + heightwidth[1] + "px ") : "") + (heightwidth[0] != "0" ? ("height=" + heightwidth[0] + "px ") : "");
            }
            var htmlString = "";

            if(mediaModel.wType == "Video")
                htmlString = "<video" + html + controls + heightwidth + autoplay + poster + loop + tabpane;
            else
                htmlString = "<audio" + html + " controls='controls'" + autoplay + loop + tabpane;

            htmlString += style;
            var src = this.getSrc(mediaModel);
            htmlString += " class = '" + computedSkin + src[1] + "'>";

            if(mediaModel.wType == "Video")
                htmlString += src[0] + (mediaModel.text || "") + "</video>";
            else
                htmlString += src[0] + (mediaModel.text || "") + "</audio>";

            return htmlString;
        },

        

        
        getSrc: function(mediaModel) {
            var notype = false;
            var platform = $KU.getPlatform();
            if(platform.name == "android" && platform.version <= 2.2)
                notype = true;

            var wType = mediaModel.wType.toLowerCase();
            var srcString = skin = "";
            var total = count = 0;
            var source = mediaModel.source;
            if($KU.isArray(source)) {
                for(var i = 1; i < source.length; i++) {
                    total++;
                    if(source[i][2]) {
                        var type = wType + "/" + source[i][1];
                        srcString += "<source src='" + source[i][2] + "'" + (source[i][1] == "mp4" && notype ? "" : " type='" + type + "'") + "/>";
                    } else
                        count++;
                }

            } else {
                for(var key in source) {
                    total++;
                    if(source[key]) {
                        var type = wType + "/" + key;
                        srcString += "<source src='" + source[key] + "'" + (key == "mp4" && notype ? "" : " type='" + type + "'") + "/>";
                    } else
                        count++;
                }
            }

            if(total == count && mediaModel.isvisible)
                skin = " hide";
            return [srcString, skin];
        },

        eventHandler: function(eventObject, target) {},

        play: function(widgetModel) {
            var video = $KU.getNodeByModel(widgetModel);
            if(video) {
                video.currentTime = 0;
                video.play();
            }
        },

        pause: function(widgetModel) {
            var video = $KU.getNodeByModel(widgetModel);
            if(video) {
                video.pause();
            }
        },

        resume: function(widgetModel) {
            var video = $KU.getNodeByModel(widgetModel);
            if(video) {
                video.play();
            }
        },

        stop: function(widgetModel) {
            var video = $KU.getNodeByModel(widgetModel);
            if(video) {
                video.pause();
                video.currentTime = 0;
            }
        },

        isPlaying: function(widgetModel) {
            var video = $KU.getNodeByModel(widgetModel);
            var isPlaying = false;
            if(video) {
                isPlaying = !video.paused && !video.ended;
            }
            return isPlaying;
        },

        getCurrentPosition: function(widgetModel) {
            var video = $KU.getNodeByModel(widgetModel);
            if(video) {
                return video.currentTime;
            }
            return 0;
        },

        getDuration: function(widgetModel) {
            var video = $KU.getNodeByModel(widgetModel);
            if(video) {
                return video.duration;
            }
            return 0;
        },

        getBufferPercentage: function(widgetModel) {
            var video = $KU.getNodeByModel(widgetModel);
            var buffPercentage = 0;
            if(video) {
                var totalDuration = video.duration;
                var bufferDuration = 0;
                for(i = 0; i < video.buffered.length; i++) {
                    bufferDuration = bufferDuration + video.buffered.end(i) - video.buffered.start(i)
                }
                buffPercentage = 100 * bufferDuration / totalDuration
            }
            return buffPercentage;
        },

        seekTo: function(widgetModel, seekTime) {
            var video = $KU.getNodeByModel(widgetModel);
            if(video) {
                video.pause();
                video.currentTime = seekTime;
                video.play();
            }
        }
    };


    return module;
}());
