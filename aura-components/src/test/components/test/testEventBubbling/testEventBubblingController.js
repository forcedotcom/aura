({
    handleInit : function(cmp, event, helper) {
        $A.logger.info('handleInit');
        if (cmp.get("v.iterationIds").length === 0) {
            cmp.set("v.iterationIds", [ "" ]);
        }
    },

    handle : function(cmp, event, helper) {
        var name = event.getParam("name");
        if (event.getPhase() == "capture") {
            $A.logger.info("handle CAPTURE " + name + " in " + cmp.get("v.logId"));
        } else {
            $A.logger.info("handle " + name + " in " + cmp.get("v.logId"));
        }
    }
})
