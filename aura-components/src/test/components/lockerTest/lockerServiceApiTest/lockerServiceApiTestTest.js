({

    testLockerServiceCreate: {
        test: [
            function() {
                var key = $A.lockerService.getKeyForNamespace("lockerServiceApiTest");
                var expected = $A.lockerService.getEnv(key);
                var evalFunc = "return window;";
                var actual = $A.lockerService.create(evalFunc, key).returnValue;
                $A.test.assertEquals(expected, actual, "Expected evaled code to execute in the context of Secure Window.");
            },
            function() {
                var expected = 33;
                var key = $A.lockerService.getKeyForNamespace("lockerServiceApiTest");
                var evalFunc = "var evaluation = function(a,b){ return a + b; }; return evaluation;";
                var actual = $A.lockerService.create(evalFunc, key).returnValue(11, 22);
                $A.test.assertEquals(expected, actual, "Expected evaled function to return correct result.");
            }
        ]
    }
})