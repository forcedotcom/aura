({
    testProxyIsNative : function(cmp) {
        $A.test.assertUndefined(Proxy.getKey, "Proxy has been polyfilled using xProxy");
    },

    testSymbolIsNative : function(cmp) {
        $A.test.assertEquals("Symbol(foo)", Symbol("foo").toString(), "Expected native Symbol implementation but found a polyfill");
    },

    testIntrinsicsAreFrozen : function(cmp, evt, helper) {
        var testData = [
            [Object.prototype, "Object prototype"],
            // TODO @JF: We used to previously freeze Array.prototype when StrictCSP was turned on.
            // [Array.prototype, "Array prototype"]
        ];
        testData.forEach(function(entry){
            helper.testIntrinsicsAreFrozen(entry[0], entry[1]);
        });
    }
})