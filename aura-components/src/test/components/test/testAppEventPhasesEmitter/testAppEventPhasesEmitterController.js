({  init: function (cmp) {
        var root = $A.getRoot();
        if (root) {
            root.sources = root.sources || {};
            var source = cmp.get("v.logId");
            root.sources[source] = cmp;
        }
    },
    fireEvent : function(cmp, event, helper) {
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