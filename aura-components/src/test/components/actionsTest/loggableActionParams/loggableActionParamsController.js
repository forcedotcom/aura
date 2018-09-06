({
    init: function(cmp,helper,event){
        $A.metricsService.registerBeacon({"sendData" : function(id,transaction){
            if(id === "test:actionParams"){
                var loggedParams = transaction.marks.actions[0].params;
                cmp.set("v.actualStringParam", loggedParams ? loggedParams["strparam"] : "failed");
                cmp.set("v.actualObjectParam", loggedParams ? loggedParams["logparam"] : "failed");
            }
        }});
    }
})