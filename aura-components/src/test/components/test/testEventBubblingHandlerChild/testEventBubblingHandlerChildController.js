({
    handleChild : function(cmp, event, helper) {
        var name = event.getParam("name");
        $A.logger.info("handleChild " + name + " in " + cmp.get("v.logId"));
    }
})