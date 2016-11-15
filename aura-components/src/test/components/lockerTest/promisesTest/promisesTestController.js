({
    verifyPromiseResolve: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var resolveFunctionCalled = false;
        helper.getSimplePromise(true).then(function(){
            resolveFunctionCalled = true;
        }, function(){
            testUtils.fail("Promise expected to be successfully resolved but was rejected");
        });
        testUtils.addWaitForWithFailureMessage(true, function() { return resolveFunctionCalled; }, "Promise was not resolved successfully");

    },

    verifyPromiseReject: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var rejectFunctionCalled = false;
        helper.getSimplePromise(false).then(function(){
            testUtils.fail("Promise expected to be rejected but was successfully resolved");
        }, function(){
            rejectFunctionCalled = true;
        });
        testUtils.addWaitForWithFailureMessage(true, function() { return rejectFunctionCalled; }, "Promise was expected fail and invoke reject callback");
    },

    verifyNestedPromiseWithAuraCallBacks: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var nestedResolveCalled = false;
        Promise.resolve(1).then($A.getCallback(function() {
            // Nested promise returned as the resolve result of outer promise
            return new Promise($A.getCallback(function(resolve){
                setTimeout($A.getCallback(function(){
                    resolve();
                }), 5);
            }));
        })).then($A.getCallback(function(){
                nestedResolveCalled = true;
            })
        );
        testUtils.addWaitForWithFailureMessage(true, function() { return nestedResolveCalled; }, "Nested Promise was not resolved successfully");
    }
})