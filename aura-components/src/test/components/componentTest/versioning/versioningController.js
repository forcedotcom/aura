({
    updateWithVersionInMultiHostedComponent: function(cmp) {
        $A.createComponent("componentTest:require", null, function(newCmp) {
                var consumerInAuraTest = cmp.find("requireConsumerInAuraTest");
                var consumerInTest = cmp.find("requireConsumerInTest");
                consumerInAuraTest.set("v.consumedCmp", newCmp);
                consumerInTest.set("v.consumedCmp", newCmp);

                consumerInAuraTest.updateWithVersionInConsumedComponent();
                consumerInTest.updateWithVersionInConsumedComponent();
                cmp.set("v.actionDone", true);
            });
    },

    updateWithVersionInCreatedComponent: function(cmp, evt, helper) {
        $A.createComponent("auratest:require", null, function(newCmp) {
                newCmp.updateVersionFromGetVersionMethod()
                helper.updateVersion(cmp, newCmp.get("v.version"));
                cmp.set("v.actionDone", true);
            });
    },

    updateWithVersionInAuraTestCmpController: function(cmp, evt, helper) {
        var targetComponent = cmp.find("auratestCmp");
        targetComponent.updateVersionFromGetVersionMethod();
        helper.updateVersion(cmp, targetComponent.get("v.version"));
    },

    updateWithVersionFromVersionComparisonInAuraTestCmp: function(cmp, evt, helper) {
        var targetComponent = cmp.find("auratestCmp");
        targetComponent.updateVersionIfLargerThanOne();
        helper.updateVersion(cmp, targetComponent.get("v.version"));
    },

    updateWithVersionInAuraTestCmpUnrender: function(cmp, evt, helper) {
        var targetComponent = cmp.find("auratestCmp");
        cmp.unrender();
        helper.updateVersion(cmp, targetComponent.get("v.version"));
    }
})

