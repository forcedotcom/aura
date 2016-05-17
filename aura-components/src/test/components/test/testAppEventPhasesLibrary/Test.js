function Test() {

    function doAction(evtAction, cmp, event) {
        if($A.util.isFunction(evtAction.action)) {
            evtAction.action(cmp);
        }
        else {
            switch(evtAction.action) {
                case "preventDefault":
                    event.preventDefault();
                    break;
                case "stopPropagation":
                    event.stopPropagation();
                    break;
                case "pause":
                    event.pause();
                    break;
                case "resume":
                    event.resume();
                    break;
                case "destroy":
                    cmp.destroy();
                    break;
            }
        }
    }

    return {
        runCommand: function(cmp, event, logIdOverride) {
            var params = event.getParams();
            var myLogId = logIdOverride || cmp.get("v.logId");

            if(params.sourceId === myLogId) {
                // The command points at me, so I'll fire my emitter

                var e = $A.getEvt(params.eventName || "test:testAppEventPhasesEvent");
                e.setParams({
                    sourceId: myLogId,
                    actions: params.actions || [],
                    skipLog: !!params.skipLog
                });

                if(!params.skipLog) {
                    $A.logger.info("fire " + myLogId);
                }

                if(params.actions) {
                    params.actions.forEach(function(evtAction) {
                        if(evtAction.before) {
                            doAction(evtAction, cmp, e);
                        }
                    });
                }

                params.eventList.push(e);
                e.fire();
            }
        },

        handle: function(cmp, event, currentPhase, logIdOverride) {
            var myLogId = logIdOverride || cmp.get("v.logId");
            var evtSourceId = event.getParam("sourceId");
            var evtActions = event.getParam("actions");

            var parts = [currentPhase, "handle", evtSourceId, "in", myLogId];
            
            if(!event.getParam("skipLog")) {
                // Log first before we take any actions
                $A.logger.info(parts.join(" "));
            }

            if(evtActions) {
                evtActions.forEach(function(evtAction) {
                    if(evtAction.targetId == myLogId && evtAction.phase == currentPhase) {
                        doAction(evtAction, cmp, event);
                    }
                });
            }
        }
    };
}