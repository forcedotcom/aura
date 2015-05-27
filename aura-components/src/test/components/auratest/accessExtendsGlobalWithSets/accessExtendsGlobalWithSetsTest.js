({
    /**
     * aura:set should work for all types except PRIVATE access.
     */
    testAuraSetAttributeAccess: {
        test: function(cmp) {
            $A.test.assertEquals("PRIVATEChanged!Changed!Changed!", cmp.getElement().textContent);
        }
    }
})