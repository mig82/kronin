kony.system = (function() {
    
    

    var module = {
        activity: {
            activityCounter: 0,

            increment: function() {
                this.activityCounter++;
            },

            decrement: function() {
                if(this.activityCounter != 0)
                    this.activityCounter--;
            },

            hasActivity: function() {
                if(this.activityCounter > 0)
                    return true;
                else
                    return false;
            }
        },

        timers: {
            timerActions: new Array(),

            TimerAction: function(actionName, frequency) {
                this.actionName = actionName;
                this.frequency = frequency;
                this.timer = null;
                
                this.elapsedTimeSinceLastCall = 0;
            },

            registerTimerAction: function(timerAction) {
                if(this.timerActions.containsTimerAction(timerAction) === false) {
                    this.timerActions.push(timerAction);
                }
            },

            executeTimerActions: function() {
                if(this.timerActions.length > 0) {
                    for(var i = 0; i < this.timerActions.length; i++) {
                        var timerAction = this.timerActions[i];
                        timerAction.timer = setInterval(timerAction.actionName, timerAction.frequency);
                    }
                }
            },

            removeTimerAction: function(timerAction) {
                var tempActions = new Array();
                if(this.timerActions.length > 0) {
                    for(var i = 0; i < this.timerActions.length; i++) {
                        if(this.timerActions[i].actionName !== timerAction.actionName) {
                            tempActions.push(this.timerActions[i]);
                        }
                    }

                    this.timerActions = tempActions;
                }
            },

            clearTimerAction: function(timerAction) {
                if(this.timerActions.length > 0) {
                    for(var i = 0; i < this.timerActions.length; i++) {
                        timerAction = this.timerActions[i];
                        clearTimeout(timerAction.timer);
                    }
                }
            }
        }
    };


    return module;
}());
