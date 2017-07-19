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
        
        testUtils.assertEquals(true, args.booleanParam, "Access in different locker : Failed to get expected value from Boolean.");
        testUtils.assertEquals("1888-08-08", args.dateParam, "Access in different locker : Failed to get expected value from Date.");
        testUtils.assertEquals("1888-08-08T08:08:08.888Z", args.dateTimeParam, "Access in different locker : Failed to get expected value from DateTime.");
        testUtils.assertEquals(88.88, args.decimalParam, "Access in different locker : Failed to get expected value from Decimal.");
        testUtils.assertEquals(5/7, args.doubleParam, "Access in different locker : Failed to get expected value from Double.");
        testUtils.assertEquals(8888, args.integerParam, "Access in different locker : Failed to get expected value from Integer.");
        testUtils.assertEquals(Infinity, args.longParam, "Access in different locker : Failed to get expected value from Long.");
        testUtils.assertEquals("GoldenState", args.stringParam, "Access in different locker : Failed to get expected value from String.");

        var stringArrayParam = args.stringArrayParam;
        testUtils.assertEquals(3, stringArrayParam.length);
        testUtils.assertEquals("\"ONE\"", stringArrayParam[0], "#1: Access in same locker: Failed to get expected value from String[].");
        testUtils.assertEquals("!@#$%^&*()", stringArrayParam[1], "#2: Access in same locker: Failed to get expected value from String[].");
        testUtils.assertEquals("Äéįœû", stringArrayParam[2], "#3: Access in same locker: Failed to get expected value from String[].");

        var objectParam = args.objectParam;
        testUtils.assertEquals(2, Object.keys(objectParam).length);
        testUtils.assertEquals("Warriors", objectParam["GoldenState"], "#1: Access in same locker: Failed to get expected value from Object.");
        testUtils.assertEquals("2017", objectParam["arrayEntry"][1], "#2: Access in same locker: Failed to get expected value from Object.");

        var caller = args.cmpParam;
        var listParam = args.listParam;
        testUtils.assertEquals(5, listParam.length);
        testUtils.assertEquals(2, listParam[1], "#1: Access in non-locker: Failed to get expected value from List.");
        testUtils.assertEquals("foo", listParam[3][0], "#2: Access in non-locker: Failed to get expected value from List.");
        testUtils.assertEquals("bar", listParam[3][1], "#3: Access in non-locker: Failed to get expected value from List.");
        testUtils.assertEquals(caller, listParam[4], "#4: Access in non-locker: Failed to get expected value from List.");

        var mapParam = args.mapParam;
        testUtils.assertEquals(3, Object.keys(mapParam).length);
        testUtils.assertEquals(88, mapParam.b, "#1: Access in non-locker: Failed to get expected value from Map.");
        testUtils.assertEquals(caller, mapParam.c, "#2: Access in non-locker: Failed to get expected value from Map.");

        var setParam = args.setParam;
        testUtils.assertEquals(7, setParam.length);
        testUtils.assertEquals("red", setParam[0], "#1: Access in non-locker: Failed to get expected value from Set.");
        testUtils.assertEquals("green", setParam[4], "#2: Access in non-locker: Failed to get expected value from Set.");
        testUtils.assertEquals(caller, setParam[6], "#3: Access in same locker: Failed to get expected value from Set.");

        testUtils.assertStartsWith("SecureComponentRef:", caller.toString(), "Access in different locker : Expected component to be a SecureComponent.");
        testUtils.assertStartsWith("SecureComponentRef:", objectParam.arrayEntry[2].toString(), "Access in different locker : Expected SecureComponent in Object.");
        testUtils.assertStartsWith("SecureComponentRef:", listParam[4].toString(), "Access in different locker : Expected SecureComponent inside List.");
        testUtils.assertStartsWith("SecureComponentRef:", mapParam.c.toString(), "Access in different locker : Expected SecureComponent inside Map.");
        testUtils.assertStartsWith("SecureComponentRef:", setParam[6].toString(), "Access in different locker : Failed to get expected value from Set.");
        
        cmp.set("v.methodCalled", true);
    }
})
