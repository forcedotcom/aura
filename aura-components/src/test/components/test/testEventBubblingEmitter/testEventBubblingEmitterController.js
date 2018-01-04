({
    fireEvent : function(cmp, event, helper) {
        var name = cmp.get("v.logId");
        var e = cmp.get("e.bubblingEvent");
        e.setParam("name", name);
        $A.logger.info("fire " + name);
        e.fire();
    }
})
