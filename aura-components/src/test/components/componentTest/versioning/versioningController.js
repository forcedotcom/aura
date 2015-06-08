({
    getVersionInExp: function(cmp) {
        var targetComponent = cmp.find("auratestCmp");
        targetComponent.version();
        cmp.set("v.requestVersion", targetComponent.get("v.requestVersion"));
    },

    getVersionInCntlr: function (cmp) {
        var targetComponent = cmp.find("auratestCmp");
        targetComponent.version();
        cmp.set("v.requestVersion", targetComponent.get("v.requestVersion"));
    },

    getVersionByValProvider: function(cmp) {
        var targetComponent = cmp.find("auratestCmp");
        targetComponent.versionByValProvider();
        cmp.set("v.requestVersion", targetComponent.get("v.requestVersion"));
    },

    getVersionInCreatedCmp: function(cmp) {
        $A.createComponent("auratest:require", null, function(newCmp) {
                newCmp.version()
                cmp.set("v.requestVersion", newCmp.get("v.requestVersion"));
            });
    },

    getVersionInSameNsCmp: function(cmp) {
        var targetComponent = cmp.find("sameNamespaceCmp");
        targetComponent.version();
        cmp.set("v.requestVersion", targetComponent.get("v.requestVersion"));
    },

    // version in grandchild component
    getVersionInNoRequireCmp: function(cmp) {
        var targetComponent = cmp.find("noVersionRequireCmp");
        targetComponent.version();
        cmp.set("v.requestVersion", targetComponent.get("v.requestVersion"));
    },

    getVersionInGchildCmp: function(cmp) {
        var targetComponent = cmp.find("auratestHolder");
        targetComponent.versionInTestCmp();
        cmp.set("v.requestVersion", targetComponent.get("v.requestVersionInChild"));
    },

    getVersionInMultiParentCmp: function(cmp) {
        $A.createComponent("componentTest:require", null, function(newCmp) {
                var holderComponent = cmp.find("auratestHolder");
                holderComponent.set("v.cmp", newCmp);
                holderComponent.versionInChild();

                holderComponent = cmp.find("testHolder");
                holderComponent.set("v.cmp", newCmp);
                holderComponent.versionInChild();
            });
    }
})
