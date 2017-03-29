({
    testPassObjectBackToOriginFunction: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var actual;
        var expected = "expected";
        var key = { foo: "bar" };
        var weakMap = new WeakMap();
        weakMap.set(key, expected);
        function getter(thisKey) {
            actual = weakMap.get(thisKey);
        }

        cmp.find("facet").callPassedFunction(getter, key);

        testUtils.assertEquals(expected, actual, "Did not get expected value from WeakMap when called from SecureFunction");
    },

    testPassOtherLockerParams: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var otherWindow;
        var otherDocument;
        var otherString;

        function func(obj, doc, string) {
            otherWindow = obj.windowKey;
            otherDocument = doc;
            otherString = string;
        }

        cmp.find("facet").callPassedFunctionNewParams(func);

        testUtils.assertEquals("foo", otherString, "String passed via SecureFunction from other Locker not filtered properly");
        testUtils.assertTrue(otherDocument.toString().indexOf("SecureDocument") === 0,
                "Document passed via SecureFunction from other Locker not filtered properly");
        testUtils.assertTrue(otherWindow.toString().indexOf("SecureWindow") === 0,
                "Window passed via SecureFunction from other Locker not filtered properly");
        
        // TODO(W-3835420): window/document should be refilterd to this Lockers window
        //testUtils.assertTrue(otherWindow.toString().indexOf("lockerTestOtherNamespace") === -1,
        //        "Window passed via SecureFunction from other Locker should be own window, not other Locker window");
    }
})
