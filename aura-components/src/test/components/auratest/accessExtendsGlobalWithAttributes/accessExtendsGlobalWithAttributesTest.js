({
    testCanAccessGlobalAttributeOnBaseComponent: {
        test: function(cmp) {
            cmp.testAttributeAccess("Global");
            $A.test.assertEquals("GLOBAL", cmp.get("v.output"));
        }
    },

    testCanAccessPublicAttributeOnBaseComponent: {
        test: function(cmp) {
            cmp.testAttributeAccess("Public");
            $A.test.assertEquals("PUBLIC", cmp.get("v.output"));
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
            cmp.testAttributeAccess("Private");
            $A.test.assertEquals(undefined, cmp.get("v.output"));
        }
    }
})