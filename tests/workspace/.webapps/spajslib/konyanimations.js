
$KW.Animator = function(animationDef) {
    this.validateKeyFrame(animationDef);
    this.animationDef = animationDef;
};

$KW.Animator.prototype = {
    getNextAnimationValue: function() {
        return($KW.Animator.indexCounter >= 0) ? (++$KW.Animator.indexCounter) : ($KW.Animator.indexCounter = 0);
    },

    getAnimationTime: function() {
        return new Date().getTime();
    },

    validateKeyFrame: function(animationDef) {
        for(var i in animationDef) {
            if(i > 100) {
                throw new KonyError(1000, "AnimationError", "Invalid Animation Definition Exception: Animation Definition can not be greater than 100");
            }
        }
        if(animationDef["100"] == undefined) {
            throw new KonyError(1000, "AnimationError", "Invalid Animation Definition Exception: Animation Definition does not have 100 value");
        }
    },

    
    getComputedAnimationFrames: function(widgetModel, node, flexNode) {
        var stepFrame = {};
        var animationDef = this.animationDef;
        var widgetAnimationDef = {};
        var layoutFrames = {};
        var skinFrames = {};
        widgetModel.originalFrames = {};
        this.flexDepFrames = {};
        var imageFrames = {};
        var flexprops = ["width", "height", "centerX", "centerY", "left", "top", "bottom", "left", "right", "minWidth", "maxWidth", "minHeight", "maxHeight", "transform", "opacity", "zIndex", "anchorPoint", "shadowColor", "shadowRadius", "shadowOffset"];

        var flexFrame = {};
        var flexComputedFrame = null;

        
        for(var i = 0; i < flexprops.length; i++) {
            var j = flexprops[i];
            flexFrame[j] = widgetModel[j];
        }

        
        if(!animationDef[0]) {
            this.flexDepFrames[0] = $KW.FlexLayoutEngine.computeKeyFrameValues(widgetModel, node, flexNode, flexFrame);
            flexComputedFrame = this.flexDepFrames[0][0];

            if(widgetModel.wType == "Image") {
                var imgNode = node.childNodes[0];
                var dimensions = {
                    width: flexComputedFrame.width,
                    height: flexComputedFrame.height
                };
                if(widgetModel.imagescalemode == constants.IMAGE_SCALE_MODE_MAINTAIN_ASPECT_RATIO) {
                    dimensions = $KU.setImgAspectRatio(widgetModel, imgNode, dimensions, false);
                    var margintop = $KU.getImageCenterAlign(imgNode, false, {
                        spanHeight: flexComputedFrame.height,
                        imgHeight: dimensions.height
                    });
                    if(margintop > 0) {
                        stepFrame.margintop = margintop;
                    }
                } else
                    dimensions = $KU.setImgDimensions(widgetModel, imgNode, dimensions, false);
                stepFrame.width = dimensions.width;
                stepFrame.height = dimensions.height;
            }

            layoutFrames[0] = flexComputedFrame;
            skinFrames[0] = stepFrame;
            if(widgetModel.wType == "Slider") {
                imageFrames[0] = {};
                imageFrames[0].left = $KW.Slider.animSlider(layoutFrames[0].width, widgetModel, "left");
                skinFrames[0].width = $KW.Slider.animSlider(layoutFrames[0].width, widgetModel, "width");
            }
        }

        var animsteps = [];
        for(var i in animationDef) {
            animsteps.push(i);
        }
        animsteps.sort(function(a, b) {
            return a - b
        });

        for(var i = 0; i < animsteps.length; i++) {
            var step = animsteps[i];
            stepFrame = $KU.cloneObj(animationDef[step]);
            for(var j in stepFrame) {
                if(flexprops.contains(j)) {
                    flexFrame[j] = stepFrame[j];
                    delete stepFrame[j];
                }
            }

            
            
            this.flexDepFrames[step] = $KW.FlexLayoutEngine.computeKeyFrameValues(widgetModel, node, flexNode, flexFrame);
            flexComputedFrame = this.flexDepFrames[step][0];

            
            if(widgetModel.wType == "Image") {
                var imgNode = node.childNodes[0];
                var dimensions = {
                    width: flexComputedFrame.width,
                    height: flexComputedFrame.height
                };
                if(widgetModel.imagescalemode == constants.IMAGE_SCALE_MODE_MAINTAIN_ASPECT_RATIO) {
                    dimensions = $KU.setImgAspectRatio(widgetModel, imgNode, dimensions, false);
                    var margintop = $KU.getImageCenterAlign(imgNode, false, {
                        spanHeight: flexComputedFrame.height,
                        imgHeight: dimensions.height
                    });
                    if(margintop > 0) {
                        stepFrame.margintop = margintop;
                    }
                } else
                    dimensions = $KU.setImgDimensions(widgetModel, imgNode, dimensions, false);
                stepFrame.width = dimensions.width;
                stepFrame.height = dimensions.height;
            }

            if(flexFrame.transform)
                flexComputedFrame.transform = flexFrame.transform;
            if(typeof(flexFrame.opacity) != "undefined")
                flexComputedFrame.opacity = flexFrame.opacity;
            if(flexFrame.zIndex)
                flexComputedFrame.zIndex = flexFrame.zIndex;
            if(flexFrame.anchorPoint)
                flexComputedFrame.anchorPoint = flexFrame.anchorPoint;
            if(flexFrame.shadowColor || flexFrame.shadowRadius || flexFrame.shadowOffset)
                flexComputedFrame.shadow = $KW.animUtils.getComputedShadowString(flexFrame);

            if(stepFrame["stepConfig"]) {
                stepFrame.timingFunction = flexComputedFrame.timingFunction = stepFrame["stepConfig"].timingFunction;
                for(var k in this.flexDepFrames[step]) {
                    this.flexDepFrames[step][k].timingFunction = stepFrame["stepConfig"].timingFunction;
                }
            }

            
            if(flexComputedFrame["min-height"] != undefined) {
                stepFrame["min-height"] = flexComputedFrame["min-height"];
            }

            layoutFrames[step] = flexComputedFrame;
            skinFrames[step] = stepFrame;
            var cloneFrame = owl.deepCopy(flexFrame);
            cloneFrame.backgroundColor = stepFrame.backgroundColor;
            widgetModel.originalFrames[step] = cloneFrame;

            if(widgetModel.wType == "Slider") {
                imageFrames[step] = {};
                imageFrames[step].left = $KW.Slider.animSlider(layoutFrames[step].width, widgetModel, "left");
                skinFrames[step].width = $KW.Slider.animSlider(layoutFrames[step].width, widgetModel, "width");
            }
        }
        this.cellFrame = layoutFrames;
        this.skinFrame = skinFrames;
        if(widgetModel.wType == "Slider")
            this.imageFrame = imageFrames;
    },

    createKeyFrames: function(widgetModel, animationFrames, animationName, frametype) {
        var currentStyleSheet = $KG["animStyleSheet"];
        if(currentStyleSheet && animationFrames) {
            var cssFrame = "";
            for(var i in animationFrames) {
                var stepFrame = "",
                    stepAnimation = "";
                var stepObj = animationFrames[i];
                var isPresent = {
                    transform: false,
                    anchorPoint: false
                };
                for(var j in stepObj) {
                    if(j == "timingFunction") {
                        if(typeof stepObj[j] == "string") {
                            stepAnimation += $KU.cssPrefix + "animation-timing-function :" + stepObj[j] + ";";
                        } else {
                            stepAnimation += $KU.cssPrefix + "animation-timing-function : cubic-bezier(" + stepObj[j] + ");";
                        }
                    } else if(j == "zIndex") {
                        stepFrame += "z-index" + ":" + stepObj[j] + ";";
                    } else if(j == "transform") {
                        var style = $KW.animUtils.applyTransform(widgetModel, stepObj[j]);
                        stepFrame += $KU.cssPrefix + "transform" + ":" + style + ";";
                        isPresent.transform = true;
                    } else if(j == "anchorPoint") {
                        if(stepObj[j]) {
                            if((stepObj[j].x >= 0) && (stepObj[j].x <= 1) && (stepObj[j].y >= 0) || (stepObj[j].y <= 1))
                                stepFrame += $KU.cssPrefix + "transform-origin" + ":" + (stepObj[j].x * 100) + "% " + (stepObj[j].y * 100) + "%; ";
                            isPresent.anchorPoint = true;
                        }
                    } else if(j == "backgroundColor" || j == "borderColor") {
                        if(j == "backgroundColor" && typeof stepObj[j] == "object") {
                            stepFrame += $KW.animUtils.parseGradientParams(stepObj[j]);
                        } else {
                            var validate = $KW.skins.validateHexValue(stepObj[j]);
                            if(validate) {
                                var result = $KW.skins.convertHexValuetoRGBA(stepObj[j]);
                            }
                            if(j == "backgroundColor") {
                                if(widgetModel.wType == "ComboBox" || widgetModel.wType == "ListBox")
                                    stepFrame += "background-color:" + result + ";";
                                else
                                    stepFrame += "background:" + result + ";";
                            } else if(j == "borderColor")
                                stepFrame += "border-color:" + result + ";";
                        }
                    } else if(j == "margintop") {
                        stepFrame += "margin-top:" + stepObj[j] + "px;";
                    } else if(j == "shadow") {
                        stepFrame += "box-shadow:" + stepObj[j];
                    } else if(j == "borderWidth") {
                        stepFrame += "border-width : " + stepObj[j] + ";";
                    } else if(j == "cornerRadius") {
                        stepFrame += "border-radius : " + stepObj[j] + ";";
                    } else {
                        stepFrame += j + ":" + stepObj[j] + ";";
                    }
                }
                if(isPresent.transform && !isPresent.anchorPoint) 
                    stepFrame += $KU.cssPrefix + "transform-origin" + ": 50% 50%;";

                cssFrame += " " + i + "%{" + stepFrame + " " + stepAnimation + "}";
            }
            
            if($KG.appbehaviors["captureAniamtionData"]) {
                $KG.animataionData[this.animatorID].data[frametype] = cssFrame;
            }
            currentStyleSheet.insertRule("@" + $KU.cssPrefix + "keyframes " + animationName + " { " + cssFrame + "}", currentStyleSheet.cssRules.length);

        } else {
            kony.web.logger("warn", "kony css style sheet is not found");
        }
    },

    
    animate: function(widgetModel, animationConfig, callBackConfig, context) {
        if(widgetModel) {
            var node, flexNode;
            if(context) {
                node = context.node;
                flexNode = context.flexNode;
            } else if($KW.Utils.isBelongsToCollectionView(widgetModel)) {
                context = $KW.CollectionView.Animation.getAnimationContext(widgetModel);
                node = context.node;
                flexNode = context.flexNode;
            } else {
                node = $KW.Utils.getWidgetNode(widgetModel);
            }
            if(!node) {
                return;
            }

            this.animatorID = "anim_" + widgetModel.id + "_" + this.getNextAnimationValue();
            this.animator1ID = this.animatorID + "_skin";
            if($KG.appbehaviors["captureAniamtionData"]) {
                if(!$KG.animataionData) {
                    $KG.animataionData = {};
                }
                $KG.animataionData[this.animatorID] = {};
                var animInfo = $KG.animataionData[this.animatorID];
                animInfo.animationID = this.animatorID
                animInfo.data = {
                    startFrame: widgetModel.frame
                };
                animInfo.animationRequestTime = animInfo.animationRequestHandleBeginTime = this.getAnimationTime();
            }
            if(widgetModel.wType == 'Image' && !widgetModel.loaded) {
                widgetModel.animInfo = {
                    instance: this,
                    animConfig: animationConfig,
                    animCallback: callBackConfig
                };
                return;
            }
            if((widgetModel.isTemplate && widgetModel.containerType == 'CollectionView') || (widgetModel.parent.wType == "FlexContainer" || widgetModel.parent.wType == "FlexScrollContainer" || ((widgetModel.parent.wType == 'Form' || widgetModel.parent.wType == 'Popup') && widgetModel.parent.layouttype != kony.flex.VBOX_LAYOUT))) {
                this.getComputedAnimationFrames(widgetModel, node, flexNode);
                var depKeyFrames = this.flexDepFrames;

                this.createKeyFrames(widgetModel, this.cellFrame, this.animatorID, "widgetFrame");
                this.createKeyFrames(widgetModel, this.skinFrame, this.animator1ID, "skinFrame");

                
                
                var wrapper;
                if(widgetModel.isTemplate && widgetModel.containerType == 'CollectionView') {
                    wrapper = node;
                    node = node.firstChild;
                } else {
                    wrapper = node.parentNode;
                    if(widgetModel.wType == "FlexContainer" || widgetModel.wType == "FlexScrollContainer") {
                        node = node.firstChild;
                    }
                }
                wrapper.wModel = widgetModel;
                wrapper.context = context;
                var animConfig = this.getAnimConfig(animationConfig, wrapper);

                var animKey = $KU.animation;
                var animSkinDef = this.animator1ID + " " + animConfig;
                var animCellDef = this.animatorID + " " + animConfig;

                if(widgetModel.wType == "Slider") {
                    this.animator2ID = this.animatorID + "_image";
                    this.createKeyFrames(widgetModel, this.imageFrame, this.animator2ID);
                    var imgCellDef = this.animator2ID + " " + animConfig;
                    node.childNodes[0].childNodes[0].childNodes[0].style[animKey] = imgCellDef;
                }

                if(widgetModel.wType == "Image") {
                    node.childNodes[0].style[animKey] = animSkinDef;
                } else if(widgetModel.wType == "Slider") {
                    node.childNodes[0].childNodes[0].style[animKey] = animSkinDef;
                } else {
                    node.style[animKey] = animSkinDef;
                }

                if($KW.animUtils.isTransform3D(this.cellFrame) && wrapper.style.transform) {
                    wrapper.initialTransform = wrapper.style.transform;
                    wrapper.style.transform = "";
                }
                wrapper.style[animKey] = animCellDef;

                if($KG.appbehaviors["captureAniamtionData"]) {
                    animInfo.animationRequestHandleEndTime = animInfo.animationInvokeTime = this.getAnimationTime();
                }

                this.saveWidgetState(widgetModel, wrapper, animationConfig);
                this.registerAnimCallbacks(wrapper, callBackConfig);
                if(widgetModel.isTemplate && widgetModel.containerType == 'CollectionView') return;
                var parentModel = widgetModel.parent;
                if(parentModel.layoutType == kony.flex.FLOW_HORIZONTAL || parentModel.layoutType == kony.flex.FLOW_VERTICAL) {
                    widgetIndex = $KW.Utils.getWidgetIndex(widgetModel);
                    
                    if(widgetIndex != -1) {
                        var widgets = parentModel.widgets();
                        var length = widgets.length;
                        var j = 1;
                        for(var i = (widgetIndex + 1); i < length; i++) {
                            var siblingModel = widgets[i];
                            if(!siblingModel.isvisible)
                                continue;
                            var animFrame = {};
                            for(var k in depKeyFrames) {
                                animFrame[k] = depKeyFrames[k][j];
                            }

                            var siblingNode;
                            if(context) {
                                siblingNode = $KW.Segment.getNodeByContext(context.containerModel, context, siblingModel);
                            } else
                                siblingNode = $KW.Utils.getWidgetNode(siblingModel);
                            if(siblingNode) {
                                var depAnimId = "dep_" + widgetModel.id + "_" + this.getNextAnimationValue(); 
                                var depAnimDef = depAnimId + " " + animConfig;
                                this.createKeyFrames(widgetModel, animFrame, depAnimId, "depFrame" + i);
                                j++;

                                siblingNode.parentNode.style[animKey] = depAnimDef;
                                var endEvent;
                                if(kony.appinit.isFirefox || kony.appinit.isIE11) {
                                    endEvent = "animationend";
                                } else {
                                    endEvent = $KU.animationEnd;
                                }
                                kony.events.addEventListener(siblingNode.parentNode, endEvent, function(e) {
                                    var ct = e.currentTarget;
                                    setTimeout(function() {
                                        ct.style[$KU.animation] = "";
                                    },500);
                                }, false);
                            }
                        }
                    }
                }

            }
        }
    },

    saveWidgetState: function(widgetModel, wrapper, animationConfig, animType) {
        
        var fillMode = animationConfig["fillMode"] || "none";
        if(fillMode == kony.anim.FILL_MODE_BACKWARDS || fillMode == kony.anim.FILL_MODE_BOTH) {
            var applyFrame = [];
            var initialPosition = [];
            var direction = animationConfig["direction"] || "normal";
            if(direction == kony.anim.DIRECTION_NONE || direction == kony.anim.DIRECTION_ALTERNATE) {
                applyFrame = this.animationDef[0];
            }

            for(var i in applyFrame) {
                initialPosition[i] = widgetModel[i];
                if(animType != 'segmentRow') 
                    widgetModel[i] = applyFrame[i];
            }
            wrapper.initialPosition = initialPosition;
        }
    },

    getAnimConfig: function(animConfig, node) {
        if(!animConfig)
            return "";
        var duration = animConfig["duration"] || 0;
        var iterations = animConfig["iterationCount"] || 1;
        if(animConfig["iterationCount"] == 0)
            iterations = "infinite";
        var direction = animConfig["direction"] || "normal";
        var animationDelay = animConfig["delay"] || 0;
        var fillMode = animConfig["fillMode"] || "none";

        if(node) {
            node.direction = direction;
            node.fillMode = fillMode;
            node.iterations = iterations;
        }

        return duration + "s " + animationDelay + "s " + iterations + " " + direction + " " + fillMode + " ";
    },

    registerAnimCallbacks: function(wrapper, callBackConfig) {
        wrapper.callBackConfig = callBackConfig || {};
        var startEvent, iterEvent, endEvent;
        if(kony.appinit.isFirefox || kony.appinit.isIE11) {
            startEvent = "animationstart";
            iterEvent = "animationiteration";
            endEvent = "animationend";
        } else {
            startEvent = $KU.animationStart;
            iterEvent = $KU.animationIteration;
            endEvent = $KU.animationEnd;
        }
        kony.events.addEventListener(wrapper, startEvent, this, false);
        kony.events.addEventListener(wrapper, iterEvent, this, false);
        kony.events.addEventListener(wrapper, endEvent, this, false);
    },

    handleEvent: function(event) {
        var node = event.target;
        if(!node.childNodes[0])
            return;

        var widgetModel = node.wModel;
        if(!widgetModel)
            return;

        
        switch(event.type) {
            case $KU.animationStart:
            case "animationstart":
                this.start(node);
                break;

            case $KU.animationIteration:
                this.move(node);
                break;

            case $KU.animationEnd:
            case "animationend":
                this.end(node);

        }
    },


    start: function(node) {
        var widgetModel = node.wModel;
        if($KG.appbehaviors["captureAniamtionData"]) {
            $KG.animataionData[this.animatorID].animationBeginTime = this.getAnimationTime();
        }
        
        var context = node.context;
        if(context) {
            var animInstance = context.instance;
            if(animInstance && typeof animInstance.startEventCounter != 'undefined') {
                animInstance.startEventCounter++;
                if(animInstance.animatableNodesCounter != animInstance.startEventCounter)
                    return;
            }
        }
        var eventhandler = node.callBackConfig && $KU.returnEventReference(node.callBackConfig.animationStart);
        this.execute(eventhandler, widgetModel);
    },

    move: function(node) {
        
    },

    end: function(node, eventhandler) {
        var widgetModel = node.wModel;
        var fillMode = node.fillMode;
        var direction = node.direction;
        var iterations = node.iterations;
        var context = node.context;

        if(!widgetModel)
            return;

        var animType;
        var needToUpdateModel = true;

        var flexprops = ["width", "height", "centerX", "centerY", "left", "top", "bottom", "right", "minWidth", "maxWidth", "minHeight", "maxHeight", "transform", "opacity", "zIndex", "anchorPoint", "backgroundColor", "shadowColor", "shadowRadius", "shadowOffset"];
        if($KG.appbehaviors["captureAniamtionData"]) {
            $KG.animataionData[this.animatorID].animationEndTime = this.getAnimationTime();
        }

        
        var applyFrame = [];
        if(fillMode == kony.anim.FILL_MODE_FORWARDS || fillMode == kony.anim.FILL_MODE_BOTH) {
            if(direction == kony.anim.DIRECTION_NONE) {
                applyFrame = widgetModel.originalFrames[100];
            } else if(direction == kony.anim.DIRECTION_ALTERNATE) {
                if(iterations % 2 == 0) {
                    applyFrame = widgetModel.originalFrames[0];
                } else {
                    applyFrame = widgetModel.originalFrames[100];
                }
            }
        }
        if(fillMode == kony.anim.FILL_MODE_BACKWARDS) {
            
            applyFrame = node.initialPosition;
        }

        for(var i in applyFrame) {
            if(flexprops.contains(i)) {
                widgetModel[i] = applyFrame[i];
            }
        }

        if(context) {
            animType = context.animType;
            var animInstance = context.instance;
            if(animInstance) {
                var action = animInstance.action;
                if(action == 'removeall' || action == 'removeat' || action == 'removesectionat')
                    needToUpdateModel = false;
            }
            needToUpdateModel && $KW.Segment.updateDataByContext(context, applyFrame);
        }

        this.removeListeners(node);
        
        if(fillMode != kony.anim.FILL_MODE_NONE && context && needToUpdateModel) {
            this.updateLayoutProps(widgetModel, node, applyFrame, animType);
        }

        if(fillMode != kony.anim.FILL_MODE_NONE && animType != 'segmentRow') {
            if(context)
                $KW.FlexUtils.updateLayoutConfig(widgetModel);
            if(widgetModel.parent.forceLayout) {
                if(context)
                    $KW.FlexContainer.forceLayout(widgetModel.parent, context.flexNode);
                else
                    widgetModel.parent.forceLayout();
            }
        }
        node.style[$KU.animation] = "";
        if($KG.appbehaviors["captureAniamtionData"]) {
            $KG.animataionData[this.animatorID].data["endFrame"] = widgetModel.frame;
        }
        if(widgetModel.wType == 'Image')
            delete widgetModel.animInfo;

        if(context) {
            var animInstance = context.instance;
            if(animInstance) {
                if(typeof animInstance.endEventCounter != 'undefined') {
                    animInstance.endEventCounter++;
                    if(animInstance.animatableNodesCounter != animInstance.endEventCounter)
                        return;
                }
                animInstance.onAnimationEnd && animInstance.onAnimationEnd(node);
            }
        }

        var eventhandler = node.callBackConfig && $KU.returnEventReference(node.callBackConfig.animationEnd);
        this.execute(eventhandler, widgetModel);
    },

    execute: function(eventhandler, widgetModel) {
        var animationHandle = {};
        eventhandler && setTimeout(function() {
            $KU.executeWidgetEventHandler(widgetModel, eventhandler, animationHandle);
            $KU.onEventHandler(widgetModel);
        }, 0)
    },

    updateLayoutProps: function(wModel, wNode, frameObj, animType) {
        var props = ['zIndex', 'opacity', 'transform', 'anchorPoint', 'backgroundColor'];
        if(wNode.context && wNode.context.containerModel.wType == 'CollectionView') {
            for(var property in frameObj) {
                var value = frameObj[property];
                var node = wNode.firstChild;
                if(value) {
                    wModel[property] = value;
                    if(props.indexOf(property) != -1) {
                        kony.model.updateLayoutProps(wModel, property.toLowerCase(), value, node, animType);
                    } else {
                        $KW.Utils.updateClonedModelData(wModel, wNode.context.containerModel, property);
                    }
                }
            }
            $KW.FlexUtils.isFlexContainer(wModel) && $KW.FlexContainer.forceLayout(wModel, wNode);
            var cvModel = wNode.context.containerModel;
            $KW.CollectionView.applyLineSpaceAndItemSpace(cvModel, $KW.Utils.getContentNodeFromNodeByModel(cvModel));
        } else {
            for(var i = 0; i < props.length; i++) {
                var prop = props[i];
                if(prop in frameObj) {
                    var node = wNode;
                    var value = frameObj[prop];
                    if(typeof value != 'undefined')
                        kony.model.updateLayoutProps(wModel, prop.toLowerCase(), value, node, animType);
                }
            }
            $KW.FlexUtils.isFlexContainer(wModel) && $KW.FlexContainer.forceLayout(wModel, wNode);
        }

    },

    removeListeners: function(target) {
        if(kony.appinit.isFirefox || kony.appinit.isIE11) {
            kony.events.removeEventListener(target, "animationstart", this, false);
            kony.events.removeEventListener(target, "animationiteration", this, false);
            kony.events.removeEventListener(target, "animationend", this, false);
        } else {
            kony.events.removeEventListener(target, $KU.animationStart, this, false);
            kony.events.removeEventListener(target, $KU.animationIteration, this, false);
            kony.events.removeEventListener(target, $KU.animationEnd, this, false);
        }

    },

    cancel: function(widgetModel) {
        
    },

    applyRowAnimation: function(rowNode, config, callbacks) {
        var widgetModel = rowNode.wModel;
        var animName = "anim_" + this.getNextAnimationValue();
        var animationDef = this.processRowAnimationKeyFrames(widgetModel, this.animationDef);
        this.createKeyFrames('', animationDef, animName, "rowFrame");
        var animConfig = this.getAnimConfig(config, rowNode);
        var animKey = $KU.animation;
        var animDef = animName + " " + animConfig;
        rowNode.style[animKey] = animDef;

        widgetModel.originalFrames = this.animationDef;
        this.saveWidgetState(widgetModel, rowNode, config);
        this.registerAnimCallbacks(rowNode, callbacks);
    },

    processRowAnimationKeyFrames: function(wModel, animDef) {
        var animFrame = {};
        for(var i in animDef) {
            var stepObj = animDef[i];
            stepFrame = {};
            for(j in stepObj) {
                stepFrame[j] = stepObj[j];
                if(j == "height") {
                    var resultObj = $KW.FlexUtils.getValueAndUnit(wModel, stepObj[j]);
                    stepFrame[j] = resultObj.value + resultObj.unit;
                }
            }
            animFrame[i] = stepFrame;
        }
        return animFrame;
    },

    getAnimationName: function(config, name) {
        var animName = name + "_" + this.getNextAnimationValue();
        this.createKeyFrames('', this.animationDef, animName, name + "Frame");
        var animConfig = this.getAnimConfig(config);
        var animKey = $KU.animation;
        return animName + " " + animConfig;
    }
};


$KW.Transform = function() {
    this.transform = {};
    this.is3D = false;
};

$KW.Transform.prototype = {
    rotate: function(angle) {
        if(angle == "undefined")
            angle = 0;
        if(angle <= 0)
            this.transform.rotate = "rotate(" + Math.abs(angle) + "deg) ";
        else
            this.transform.rotate = "rotate( -" + angle + "deg) ";
        return this;

    },

    translate: function(x, y) {
        if(x == "undefined")
            x = 0;
        if(y == "undefined")
            y = 0;
        var translate = {};
        translate.x = x;
        translate.y = y;
        this.transform.translate = "translate(" + translate.x + "px, " + translate.y + "px) ";
        return this;
    },

    scale: function(x, y) {
        if(x == "undefined")
            x = 1;
        if(y == "undefined")
            y = 1;
        this.transform.scale = "scale(" + x + ", " + y + ") ";
        return this;
    },

    
    setPerspective: function(p) {
        if(arguments.length < 1)
            throw new KonyError(101, "Transform3D Error", "Set perspective Exception: Incomplete input");
        else if(typeof p != "number" || p <= 0)
            throw new KonyError(100, "Transform3D Error", "Set perspective Exception: Invalid input.");

        this.transform.perspective = "perspective(" + p + "px) ";
        return this;
    },

    rotate3D: function(angle, x, y, z) {
        if(arguments.length < 4)
            throw new KonyError(101, "Transform3D Error", "Set rotate3D Exception: Incomplete input");
        if(typeof angle != "number" || typeof x != "number" || typeof y != "number" || typeof z != "number")
            throw new KonyError(100, "Transform3D Error", "Set rotate3D Exception: Invalid input.");
        if((x < 0 || x > 1) || (y < 0 || y > 1) || (z < 0 || z > 1))
            throw new KonyError(100, "Transform3D Error", "Set rotate3D Exception: Invalid input.");

        if(angle <= 0)
            angle = Math.abs(angle) + "deg";
        else
            angle = "-" + angle + "deg";

        this.transform.rotate = "rotate3d(" + x + ", " + y + ", " + z + ", " + angle + ") ";
        this.is3D = true;
        return this;
    },

    translate3D: function(x, y, z) {
        if(arguments.length < 3)
            throw new KonyError(101, "Transform3D Error", "Set translate3D Exception: Incomplete input");
        if(typeof x != "number" || typeof y != "number" || typeof z != "number")
            throw new KonyError(100, "Transform3D Error", "Set translate3D Exception: Invalid input.");

        this.transform.translate = "translate3d(" + x + "px, " + y + "px, " + z + "px) ";
        this.is3D = true;
        return this;
    },

    scale3D: function(x, y, z) {
        if(arguments.length < 3)
            throw new KonyError(101, "Transform3D Error", "Set scale3D Exception: Incomplete input");
        if(typeof x != "number" || typeof y != "number" || typeof z != "number")
            throw new KonyError(100, "Transform3D Error", "Set scale3D Exception: Invalid input.");
        
        

        this.transform.scale = "scale3d(" + x + ", " + y + ", " + z + ") ";
        this.is3D = true;
        return this;
    }
};

$KW.animUtils = {
    isTransform3D: function(frames) { 
        var have3D = false;
        if(!frames) return have3D;

        for(var i in frames) {
            if(frames[i].transform && frames[i].transform.is3D) {
                have3D = true;
                break;
            }
        }
        return have3D;
    },

    applyTransform: function(widgetModel, propertyValue) {
        if(!propertyValue) {
            
            
            return "";
        }

        var style = "";

        if(propertyValue.transform.perspective) 
            style += propertyValue.transform.perspective;
        if(propertyValue.transform.scale)
            style += propertyValue.transform.scale;
        if(propertyValue.transform.translate)
            style += propertyValue.transform.translate;
        if(propertyValue.transform.rotate)
            style += propertyValue.transform.rotate;

        return style;
    },

    AnimationDataComapre: function(mode) {
        if(mode == "record") {
            var recordedInfo = JSON.stringify($KG["animataionData"]);
            localStorage.setItem("animataionData", recordedInfo);
        } else if(mode == "play") {
            var recordedStr = localStorage.getItem("animataionData");
            var recordedInfo = JSON.parse(recordedStr);
            var capturedInfo = $KG["animataionData"];
            for(var anim in recordedInfo) {
                kony.web.logger("log", "Animation Testing for: " + recordedInfo[anim].animationID);
                var recordedData = recordedInfo[anim].data;
                var capturedData = capturedInfo[anim].data;

                for(var frames in recordedData) {
                    if(frames != "startFrame" && frames != "endFrame") {
                        if(recordedData[frames] == capturedData[frames]) {
                            kony.web.logger("log", "PASSED Frame is \n" + recordedData[frames] + " \n" + capturedData[frames]);
                        } else
                            kony.web.logger("log", "FAILED Frame is \n" + recordedData[frames] + " \n" + capturedData[frames]);
                    }
                }
            }

        }
    },

    getComputedShadowString: function(flexFrame) {
        var shadowColor = flexFrame.shadowColor || "#000000";
        var shadowRadius = (flexFrame.shadowRadius || 0) + "px ";
        var shadowOffsetX = (flexFrame.shadowOffset.x || 0) + "px ";
        var shadowOffsetY = (flexFrame.shadowOffset.y || 0) + "px ";
        if(flexFrame.shadowColor) {
            var validate = $KW.skins.validateHexValue(flexFrame.shadowColor);
            if(validate) {
                shadowColor = $KW.skins.convertHexValuetoRGBA(flexFrame.shadowColor);
            }
        }

        return shadowOffsetX + shadowOffsetY + shadowRadius + shadowColor;
    },

    parseGradientParams: function(gradientModel) {
        var stepGradientAnimation = "";
        var validate = (gradientModel.colors && gradientModel.colorStops) && (gradientModel.colors.length == gradientModel.colorStops.length);
        var angle = gradientModel.angle ? gradientModel.angle : "0";
        var prefix = $KU.cssPrefix;
        if(prefix == "-Moz-") {
            prefix = "";
        }
        angle += "deg";
        stepGradientAnimation += "background:" + prefix + "linear-gradient(" + angle;
        if(validate) {
            for(var j in gradientModel['colors']) {
                stepGradientAnimation += ", #" + gradientModel['colors'][j] + " " + gradientModel['colorStops'][j] + "%";
            }
        } else {
            kony.web.logger("warn", "colors or colorStops are either undefined or unequal in length");
        }
        return stepGradientAnimation += ");";
    }
};
