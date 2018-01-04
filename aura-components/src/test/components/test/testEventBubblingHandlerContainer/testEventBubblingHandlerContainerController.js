({
    handleContainer : function(cmp, event, helper) {
        var name = event.getParam("name");
        $A.logger.info("handleContainer " + name + " in " + cmp.get("v.logId"));
    }
})
