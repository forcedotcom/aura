({
    /**
     * Note that the test is not in the locker so many of the test cases must delegate to the controller or helper
     * to get objects and then return them to the test for verification.
     */

    testFacetFromAnotherNamespaceIsSecureComponentRef: {
        test: function(cmp) {
            cmp.getFacet();
            var wrapped = cmp.get("v.log");
            $A.test.assertStartsWith("SecureComponentRef", wrapped.toString(), "Expected facet from another namesapce"
                    + " to be of type SecureComponentRef");
        }
    },
    
    testUnexposedPlatformAPIs: {
        test: function(cmp) {
            var unexposedPlatformApis = ["addHandler", "destroy", "getSuper", "getElement", "getElements", "getReference",
                                         "clearReference", "getConcreteComponent", "autoDestroy", "isConcrete",
                                         "addValueProvider", "getEvent", "find", "getElements"];
            cmp.getFacet();
            var wrapped = cmp.get("v.log");
            for (var i = 0; i < unexposedPlatformApis; i++) {
                $A.test.assertUndefined(wrapped[unexposedPlatformApis[i]]);
            }
        }
    }
})