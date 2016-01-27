({
    /**
     * aura:set should work for all types except PRIVATE access.
     */
    testAuraSetAttributeAccess: {
        auraErrorsExpectedDuringInit:["Access Check Failed!"],
        test: function(cmp) {
            $A.test.assertEquals("PRIVATEChanged!Changed!Changed!", cmp.getElement().textContent);
        }
    }
})