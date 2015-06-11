({
    // call the getVersion in a component in namespace "test".
    getVersionInTestCmp: function(cmp) {
        var targetComponent = cmp.find("testCmp");
        targetComponent.version();
        cmp.set("v.requestVersionInChild", targetComponent.get("v.requestVersion"));
    },

    getVersionInChildCmp: function(cmp) {
        var targetComponent = cmp.get("v.cmp");
        targetComponent.version();
        cmp.set("v.requestVersionInChild", targetComponent.get("v.requestVersion"));
    }
})
