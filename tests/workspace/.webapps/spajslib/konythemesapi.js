
$KI.themes = (function() {
    
    

    var module = {
        relativePath: true,

        setcurrenttheme: function(themeid, successcallback, errorcallback) {
            $KU.logExecuting('kony.theme.setCurrentTheme');
            $KU.logExecutingWithParams('kony.theme.setCurrentTheme', themeid, successcallback, errorcallback);
            if(!($KU.inArray($KG["themes"], themeid, true))) {
                errorcallback();
                $KU.logExecutingFinished('kony.theme.setCurrentTheme VIA if !($KU.inArray($KG["themes"], themeid, true)) is true');
                return;
            }
            if(themeid == module.getcurrenttheme()) {
                successcallback();
                $KU.logExecutingFinished('kony.theme.setCurrentTheme VIA if themeid == module.getcurrenttheme() is true');
                return;
            }
            try {
                var styleSheetObjs = window.document.styleSheets;
                var styleSheetIndex = $KW.skins.getKonyStyleSheetIndex(styleSheetObjs);

                var hrefStyleCount = "";
                var requiredStyleSheet = "";
                if(styleSheetIndex == -1 && $KG[$KG["theme"] + 'remoteurl'] && $KG["lastStyleSheet"]) {
                    hrefStyleCount = $KG["lastStyleSheet"].lastIndexOf("/");
                    if($KG["theme"] && $KG["theme"] != "default") {
                        var aplledThemePath = $KG["lastStyleSheet"].substring(0, hrefStyleCount);
                        if(aplledThemePath.indexOf($KG["theme"]))
                            hrefStyleCount = aplledThemePath.lastIndexOf("/");
                    }
                    requiredStyleSheet = $KG["lastStyleSheet"];
                } else {
                    hrefStyleCount = styleSheetObjs[styleSheetIndex].href.lastIndexOf("/");
                    requiredStyleSheet = styleSheetObjs[styleSheetIndex].href;
                }

                var cssFileName = "";
                if(this.relativePath || this.relativePath === undefined) {
                    this.relativePath = false;
                    var relativePath = requiredStyleSheet.substring(0, hrefStyleCount + 1);
                    $KG["relativepath"] = relativePath;
                    cssFileName = requiredStyleSheet.substring(requiredStyleSheet.lastIndexOf("/"), requiredStyleSheet.length);
                    $KG["themerelcssfile"] = cssFileName;
                }
                cssFileName = $KG["themerelcssfile"];
                
                var link = document.createElement('link');
                link.type = "text/css";
                link.rel = "stylesheet";
                var headTag = document.getElementsByTagName("head");

                var req = new XMLHttpRequest();
                if($KG["relativepath"])
                    relativePath = $KG["relativepath"];
                var imagecat = $KG["imagecat"];

                var cssFile = relativePath + (themeid == "default" ? "" : themeid) + cssFileName;

                var currentTheme = $KG["theme"];
                if($KG[currentTheme + 'remoteurl']) cssFileName = $KG[currentTheme + 'remoteurl'];

                $KG[themeid + 'remoteurl'] && (cssFile = $KG[themeid + 'remoteurl']);
                req.open("GET", cssFile, true);
                req.timeout = 60000;

                req.onreadystatechange = function() {
                    if(this.readyState == 4) {
                        if(this.status == 200) {
                            for(var i = 0; i < headTag[0].childNodes.length; i++) {
                                if(headTag[0].childNodes[i].nodeName == "LINK") {
                                    if(headTag[0].childNodes[i].getAttribute("href").indexOf(cssFileName) != -1) {
                                        $KG["lastStyleSheet"] = headTag[0].childNodes[i].href;

                                        var media = headTag[0].childNodes[i].getAttribute("media") || "screen";
                                        var newLink = document.createElement("link");
                                        newLink.rel = "stylesheet";
                                        newLink.type = "text/css";
                                        newLink.href = cssFile;
                                        newLink.media = media;
                                        headTag[0].replaceChild(newLink, headTag[0].childNodes[i]);
                                        
                                        var img = document.createElement('img');
                                        img.onerror = function() {
                                            var styleSheetObjs = window.document.styleSheets;
                                            $KG["currentStyleSheet"] = styleSheetObjs[$KW.skins.getKonyStyleSheetIndex(styleSheetObjs)];
                                            $KG["theme"] = themeid;
                                            successcallback();
                                            req = null;
                                        }
                                        img.src = cssFile;
                                        break;
                                    }
                                }
                            }
                        } else {
                            errorcallback();
                        }
                    }
                };

                req.ontimeout = function() {
                    errorcallback();
                };

                req.send(null);
                $KU.logExecutingFinished('kony.theme.setCurrentTheme return 3');

            } catch(e) {
                errorcallback();
            }
        },

        deletetheme: function(theme, successcallback, errorcallback) {
            $KU.logExecuting('kony.theme.deleteTheme');
            $KU.logExecutingWithParams('kony.theme.deleteTheme', theme, successcallback, errorcallback);
            var themeList = $KG["themes"];
            var initialThemeListLength = themeList.length;
            var finalThemeListLength = themeList.length;
            try {
                for(var i = 0; i < themeList.length; i++) {
                    if(themeList[i] == theme)
                        themeList.splice(i, 1);
                }
                $KG["themes"] = themeList;
                if($KG["theme"] == theme) {
                    module.setcurrenttheme("default", successcallback, errorcallback);
                    $KU.logExecutingFinished('kony.theme.deleteTheme VIA if ($KG["theme"] == theme) is true');
                    return;
                }
                finalThemeListLength = themeList.length;
                $KU.logExecutingFinished('kony.theme.deleteTheme VIA end of the function');
                if(initialThemeListLength - 1 == finalThemeListLength)
                    successcallback();
                else
                    errorcallback();
            } catch(e) {
                $KU.logErrorMessage('Error' + e);
                errorcallback();
            }
        },

        isthemepresent: function(theme) {
            $KU.logExecuting('kony.theme.isThemePresent');
            $KU.logExecutingWithParams('kony.theme.isThemePresent', theme);
            $KU.logExecutingFinished('kony.theme.isThemePresent');
            return $KU.inArray($KG["themes"], theme, true);
        },

        createtheme: function(url, themeIdentifer, onsuccesscallback, onerrorcallback) {
            
            $KU.logExecuting('kony.theme.createTheme');
            $KU.logExecutingWithParams('kony.theme.createTheme', url, themeIdentifer, onsuccesscallback, onerrorcallback);
            if(($KU.inArray($KG["themes"], themeIdentifer, true))) {
                onsuccesscallback();
                $KU.logExecutingFinished('kony.theme.createTheme VIA if ($KU.inArray($KG["themes"], themeIdentifer, true)) is true');
                return;
            }
            try {
                var req = new XMLHttpRequest();
                var cssFile = url;
                req.open("GET", cssFile, true);
                req.timeout = 60000;
                var headTag = document.getElementsByTagName("head");
                $KG[themeIdentifer + 'remoteurl'] = url;

                req.onreadystatechange = function() {
                    if(this.readyState == 4) {
                        if(this.status == 200) {
                            $KG["themes"].push(themeIdentifer);
                            onsuccesscallback();
                            req = null;
                        } else {
                            onerrorcallback();
                        }

                    }
                };
                req.ontimeout = function() {
                    onerrorcallback();
                };
                req.send(null);
                $KU.logExecutingFinished('kony.theme.createTheme VIA try block');
            } catch(e) {
                $KU.logErrorMessage('Error ' + e);
                onerrorcallback();
            }
        },

        allthemes: function() {
            return $KG["themes"];
        },

        getcurrentthemedata: function() {
            $KU.logExecuting('kony.theme.getCurrentThemeData');
            $KU.logExecutingWithParams('kony.theme.getCurrentThemeData');
            $KU.logExecutingFinished('kony.theme.getCurrentThemeData');
            return true;
        },

        getcurrenttheme: function() {
            $KU.logExecuting('kony.theme.getCurrentTheme');
            $KU.logExecutingWithParams('kony.theme.getCurrentTheme');
            $KU.logExecutingFinished('kony.theme.getCurrentTheme');
            return $KG["theme"];
        },

        packagedthemes: function(list) {
            var themeArray = [];
            if(IndexJL == 1) themeArray.push(null);
            for(var i = IndexJL; i < (list.length); i++) {
                themeArray.push(list[i]);
            }
            $KG["themes"] = themeArray;
            $KG["theme"] = "default";
        }
    };


    return module;
}());
