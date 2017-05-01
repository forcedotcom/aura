({
    handleDocumentQuerySelector: function(cmp, event, helper) {
        var args = event.getParam("arguments");
        helper.querySelector(document, args.selectors, args.results);
    },
    handleElementQuerySelector: function(cmp, event, helper) {
        var args = event.getParam("arguments");
        helper.querySelector(cmp.getElement(), args.selectors, args.results);
    },
    inspectMethodParams : function(cmp, event) {
        var args = event.getParam("arguments");

        var testUtils = args.testUtils;
        var caller = args.cmpParam;
        testUtils.assertStartsWith("SecureComponentRef", caller.toString(), "Expected component to be a SecureComponentRef");

        // Plain objects and arrays are visible across locker
        testUtils.assertEquals("callingIntoMethod", args.strParam, "Access in different locker: Failed to read string param");
        var listParam = args.listParam;
        testUtils.assertEquals(5, listParam.length);
        testUtils.assertEquals(3, listParam[2], "Access in different locker:Failed to get expected element from array by index");
        testUtils.assertEquals("foo", listParam[3][0], "Access in different locker:Failed to get value from nested array");
        testUtils.assertStartsWith("SecureComponentRef", listParam[4].toString(), "Access in different locker:Expected component in an array to be a SecureComponentRef");

        var objParam = args.objParam;
        testUtils.assertEquals(2, Object.keys(objParam).length, "Access in different locker: Failed to inspect object param");
        testUtils.assertEquals("Giants", objParam.stringLiteral, "Access in different locker: Failed to inspect object values");
        testUtils.assertEquals(3, objParam.arrayEntry.length, "Access in different locker: Failed to inspect nested array");
        testUtils.assertEquals("2014", objParam.arrayEntry[0], "Access in different locker: Failed to access element in nested array");
        testUtils.assertStartsWith("SecureComponentRef", objParam.arrayEntry[2].toString(), "Access in different locker: Expected component in nested array to be a SecureComponentRef");
        cmp.set("v.methodCalled", true);
    }
})
