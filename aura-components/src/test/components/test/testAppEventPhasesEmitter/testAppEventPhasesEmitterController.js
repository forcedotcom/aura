({
    fireEvent : function(cmp, event, helper) {
        var params = event.getParam("arguments") || {};
        var source = cmp.get("v.logId");
        var e = $A.getEvt("test:testAppEventPhasesEvent");
        e.setParams({
            sourceId: source,
            actions: []
        });
        $A.logger.info("fire " + source);
        e.fire();
    }
})