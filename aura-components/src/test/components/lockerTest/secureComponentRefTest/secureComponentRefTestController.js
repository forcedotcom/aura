({
    testFacetFromAnotherNamespaceIsSecureComponentRef: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("facet");
        testUtils.assertStartsWith("SecureComponentRef", secureComponentRef.toString(), "Expected facet from another namesapce"
                + " to be of type SecureComponentRef");
    },

    testUnexposedPlatformAPIs: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("facet");
        var unexposedPlatformApis = event.getParam("arguments").unexposedPlatformApis;
        for (var i = 0; i < unexposedPlatformApis; i++) {
            testUtils.assertUndefined(secureComponentRef[unexposedPlatformApis[i]]);
        }
    }
})