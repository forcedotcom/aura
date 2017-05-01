({
    setCallback: function(cmp, event) {
        var params = event.getParam('arguments');
        var callback = params.callback;
        cmp.set("v.callback", callback);
    },

    executeCallback: function(cmp) {
        var callback = cmp.get("v.callback");
        callback();
    },

    inspectMethodParams : function(cmp, event) {
        var args = event.getParam("arguments");

        var testUtils = args.testUtils;
        var caller = args.cmpParam;
        testUtils.assertStartsWith("SecureComponent:", caller.toString(), "Expected component to be a SecureComponent");

        testUtils.assertEquals("callingIntoMethod", args.strParam, "Access in same locker: Failed to read string param");
        var listParam = args.listParam;
        testUtils.assertEquals(5, listParam.length);
        testUtils.assertEquals(3, listParam[2], "Access in same locker: Failed to get expected element from array by index");
        testUtils.assertEquals("foo", listParam[3][0], "Access in same locker: Failed to get value from nested array");
        testUtils.assertStartsWith("SecureComponent:", listParam[4].toString(), "Access in same locker: Expected SecureComponent inside array");

        var objParam = args.objParam;
        testUtils.assertEquals(2, Object.keys(objParam).length, "Access in same locker: Failed to inspect object param");
        testUtils.assertEquals("Giants", objParam.stringLiteral, "Access in same locker: Failed to inspect object values");
        testUtils.assertEquals(3, objParam.arrayEntry.length, "Access in same locker: Failed to inspect nested array");
        testUtils.assertEquals("2014", objParam.arrayEntry[0], "Access in same locker: Failed to access element in nested array");
        testUtils.assertStartsWith("SecureComponent:", objParam.arrayEntry[2].toString(), "Access in same locker: Expected SecureComponent in nested array");
        cmp.set("v.methodCalled", true);
    }
})