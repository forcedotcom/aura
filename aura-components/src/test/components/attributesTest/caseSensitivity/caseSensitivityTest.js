({
    /**
     * Trying to get a simple attribute with the wrong case will return undefined. Note that no errors are thrown.
     */
    testGetWrongCaseReturnsUndefined: {
        test: function(cmp) {
            $A.test.assertEquals("An Aura of Lightning Lumenated the Plume", cmp.get("v.attr"));
            $A.test.assertUndefined(cmp.get("v.Attr"));
        }
    },

    /**
     * Trying to get a simple attribute with the wrong case will be a no-op. Note that no errors are thrown.
     */
    testSetWrongCaseDoesNothing: {
        test: function(cmp) {
            cmp.set("v.Attr", "Something new");
            $A.test.assertEquals("An Aura of Lightning Lumenated the Plume", cmp.get("v.attr"),
                    "Should not be able to set attribute ");
        }
    }
})