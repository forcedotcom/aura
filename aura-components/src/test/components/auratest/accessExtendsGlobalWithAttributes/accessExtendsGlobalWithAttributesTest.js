({
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
        }
    }
})