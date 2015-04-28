({
    handle : function(cmp, event, helper) {
        var name = event.getParam("name");
        $A.logger.info("handle " + name + " in " + cmp.get("v.logId"));
    }
})