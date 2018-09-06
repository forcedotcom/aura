({
    testLoggableActionParams: {
        attributes: { "expectedStringParam": "testParam", "expectedObjectParam": {"log" : {"this" : "param"}}},
        test: function(cmp) {
            $A.metricsService.transactionStart("test","actionParams");
            var action = cmp.get("c.getSelectedObjectParamLogging");
            action.setParams({
                logparam: JSON.parse(cmp.get("v.expectedObjectParam")),
                strparam: cmp.get("v.expectedStringParam"),
                otherparam: {"dontLog" : {"this" : "object"}}
            });
            $A.enqueueAction(action);
            action.setCallback(cmp, function(){
                window.setTimeout($A.getCallback(function() {
                    $A.metricsService.transactionEnd("test","actionParams");
                }),0);
            });
            $A.test.addWaitFor(true, function() {
                return cmp.get("v.expectedStringParam") === cmp.get("v.actualStringParam") && cmp.get("v.expectedObjectParam") === cmp.get("v.actualObjectParam")
            });
        }
    }
})
