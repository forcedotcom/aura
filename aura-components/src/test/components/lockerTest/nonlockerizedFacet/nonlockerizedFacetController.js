({
    inspectMethodParams : function(cmp, event) {
        var args = event.getParam("arguments");

        var testUtils = args.testUtils;

        var caller = args.cmpParam;
        testUtils.assertTrue(caller.toString().indexOf("SecureComponent") === -1, "Expected raw component in non lockerized component");

        testUtils.assertEquals("callingIntoMethod", args.strParam, "Failed to read string param");

        var listParam = args.listParam;
        testUtils.assertEquals(5, listParam.length);
        testUtils.assertEquals(3, listParam[2], "Failed to get expected element from array by index");
        testUtils.assertEquals("foo", listParam[3][0], "Failed to get value from nested array");
        testUtils.assertTrue(listParam[4].toString().indexOf("SecureComponent") === -1, "Expected raw component array");

        var objParam = args.objParam;
        testUtils.assertEquals(2, Object.keys(objParam).length, "Failed to inspect object param");
        testUtils.assertEquals("Giants", objParam.stringLiteral, "Failed to inspect object values");
        testUtils.assertEquals(3, objParam.arrayEntry.length, "Failed to inspect nested array");
        testUtils.assertEquals("2014", objParam.arrayEntry[0], "Failed to access element in nested array");
        testUtils.assertTrue(objParam.arrayEntry[2].toString().indexOf("SecureComponent") === -1, "Expected raw component in nested array");
        cmp.set("v.methodCalled", true);

        // Just for visual verification
        var span = document.createElement("span");
        span.textContent = JSON.stringify(args.strParam);
        args.resultHolder.appendChild(span);

        span = document.createElement("span");
        span.textContent = JSON.stringify(args.listParam);
        args.resultHolder.appendChild(span);

        span = document.createElement("span");
        span.textContent = JSON.stringify(args.objParam);
        args.resultHolder.appendChild(span);
    }
})