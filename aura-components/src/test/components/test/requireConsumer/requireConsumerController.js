({
    updateWithVersionInConsumedComponent: function(cmp) {
        var targetComponent = cmp.get("v.consumedCmp");
        targetComponent.updateVersion();
        cmp.set("v.versionInConsumedCmp", targetComponent.get("v.version"));
    }
})

