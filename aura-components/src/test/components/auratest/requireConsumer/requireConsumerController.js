({
    // call the getVersion in a component in namespace "test".
    updateWithVersionInConsumedComponentInTest: function(cmp) {
        var targetComponent = cmp.find("testCmp");
        targetComponent.updateVersion();
        cmp.set("v.versionInConsumedCmp", targetComponent.get("v.version"));
    },

    updateWithVersionInConsumedComponentInSamenamespace: function(cmp) {
        var targetComponent = cmp.find("auratest_require");
        targetComponent.updateVersionFromGetVersionMethod();
        cmp.set("v.versionInConsumedCmp", targetComponent.get("v.version"));
    },

    updateWithVersionInConsumedComponent: function(cmp) {
        var targetComponent = cmp.get("v.consumedCmp");
        targetComponent.updateVersion();
        cmp.set("v.versionInConsumedCmp", targetComponent.get("v.version"));
    },

    fireTestComponentVersionEvent: function(cmp) {
        cmp.find("testCmp").fireEventWithVersionInServerController();
    },

    updateVersionFromVersionEvent: function(cmp, evt) {
        cmp.set("v.versionInConsumedCmp", evt.getParam("att1"));
        cmp.set("v.actionDone", true);
    }
})
