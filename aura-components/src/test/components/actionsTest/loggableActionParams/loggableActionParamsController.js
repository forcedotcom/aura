({
    init: function(cmp,helper,event){
        $A.metricsService.registerBeacon({"sendData" : function(id,transaction){
            if(id === "test:actionParams"){
                var loggedParam = transaction.marks.actions[0].context.params;
                cmp.set("v.actualParam",loggedParam["strparam"]);
            }
        }});
        $A.metricsService.transactionStart("test","actionParams");
        var action = cmp.get("c.getSelectedParamLogging");
        action.setParams({
            strparam: cmp.get("v.expectedParam"),
            intparam: 3
        });
        $A.enqueueAction(action);
        action.setCallback(cmp, function(){
            window.setTimeout($A.getCallback(function() {
                $A.metricsService.transactionEnd("test","actionParams");
            }),0);
        });
    }
})