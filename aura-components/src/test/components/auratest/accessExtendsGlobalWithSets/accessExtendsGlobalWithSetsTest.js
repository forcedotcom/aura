({
    /**
     * aura:set should work for all types except PRIVATE access.
     */
    testAuraSetAttributeAccess: {
        auraErrorsExpectedDuringInit:["Access Check Failed!","Access Check Failed!"],
        test: function(cmp) {
            $A.test.assertEquals("PRIVATEPUBLICChanged!Changed!", cmp.getElement().textContent);
        }
    }
})