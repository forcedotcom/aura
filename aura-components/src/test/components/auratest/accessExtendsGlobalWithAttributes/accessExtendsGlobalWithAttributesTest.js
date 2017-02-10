({
	labels : ["UnAdaptableTest"],
	
    testCanAccessGlobalAttributeOnBaseComponent: {
        test: function(cmp) {
            cmp.testAttributeAccess("Global");
            $A.test.assertEquals("GLOBAL", cmp.get("v.output"));
        }
    },

    testCanNotAccessPublicAttributeOnBaseComponentFromDifferentNamespace: {
        test: function(cmp) {
            $A.test.expectAuraError("Access Check Failed!");
            
            cmp.testAttributeAccess("Public");
            $A.test.assertEquals(undefined, cmp.get("v.output"));
            $A.test.addWaitForWithFailureMessage(
                    true, 
                    function() {
                        return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                    },
                    "Didn't get ACF error box",
                    function() {
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AttributeSet.get(): attribute \'Public\' of component \'markup://auratest:accessExtendsGlobalWithAttributes",
                                    "markup://auratest:accessExtendsGlobalWithAttributes");
             });
        }
    },

    testCanAccessInternalAttributeOnBaseComponent: {
        test: function(cmp) {
            cmp.testAttributeAccess("Internal");
            $A.test.assertEquals("INTERNAL", cmp.get("v.output"));
        }
    },

    testCanNotAccessPrivateAttributeOnBaseComponent: {

        test: function(cmp) {
            // One for the final read into v.output
            $A.test.expectAuraError("Access Check Failed!");
            
            cmp.testAttributeAccess("Private");
            $A.test.assertEquals(undefined, cmp.get("v.output"));
            $A.test.addWaitForWithFailureMessage(
                    true, 
                    function() {
                        return ($A.test.getAuraErrorMessage().indexOf("Access Check Failed!") !== -1);
                    },
                    "Didn't get ACF error box",
                    function() {
                        $A.test.getPopOverErrorMessage($A.test.getAuraErrorMessage(),"\' is not visible to \'",
                                "Access Check Failed! AttributeSet.get(): attribute \'Private\' of component \'markup://auratest:accessExtendsGlobalWithAttributes",
                                    "markup://auratest:accessExtendsGlobalWithAttributes");
             });
        }
    }
})