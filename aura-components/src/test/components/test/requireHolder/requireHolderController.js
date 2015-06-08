({
    getVersionInChildCmp: function(cmp) {
        var targetComponent = cmp.get("v.cmp");
        targetComponent.version();
        cmp.set("v.requestVersionInChild", targetComponent.get("v.requestVersion"));
    }
})
