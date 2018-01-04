({
    handleSuper : function(cmp, event, helper) {
        var name = event.getParam("name");
        $A.logger.info("handleSuper " + name + " in " + cmp.get("v.logId"));
    }
})
