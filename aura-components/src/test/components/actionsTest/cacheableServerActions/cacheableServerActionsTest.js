({
    // mark these tests unadaptable for core because core has specific rules for enabling publicly cacheable actions
    // that are tested separately there
    labels: ['UnAdaptableTest'],

    /*
     * Make sure publicly cacheable actions are sent as GET requests
     */
    testCacheableActionIsSentAsGetRequest : {
        test : [
            function(cmp, helper) {
                // override XMLHttpRequest.open so that we can check the requests sent
                var xhrs = [];

                this.wrapXhrOpen(function (method, url, async) {
                    xhrs.push({
                        method: method,
                        url: url
                    });
                });

                // send the cacheable action
                var action = $A.test.getAction(cmp, "c.executeWithPublicCachingWithReturn", {i : 1});
                $A.run(function() {
                    $A.enqueueAction(action);
                });

                // assert the action has been sent as a GET request
                $A.test.addWaitForWithFailureMessage(
                        true,
                        function() {
                            return xhrs.length > 0;
                        },
                        "No XHR sent!",
                        function() {
                            $A.test.assertEquals(1, xhrs.length, "Unexpected number of XHRs sent");
                            $A.test.assertEquals("GET", xhrs[0].method, "Unexpected method used for XHRs");
                            $A.test.assertTrue(xhrs[0].url.indexOf('executeWithPublicCachingWithReturn') > 0, "Unexpected action name in URL");
                        }
                    );
            }
        ]
    },

    /*
     * Make sure publicly cacheable actions execute end-to-end with expected return values
     */
    testCacheableAction : {
        test : [
            function(cmp, helper) {
                var returnValue;

                // send the cacheable action
                var action = $A.test.getAction(cmp, "c.executeWithPublicCachingWithReturn", {i : 1});
                action.setCallback(this, function(a){
                    returnValue = a.getReturnValue();
                });

                $A.run(function() {
                    $A.enqueueAction(action);
                });

                // assert the action has been sent as a GET request
                $A.test.addWaitForWithFailureMessage(
                    true,
                    function() {
                        return returnValue !== undefined;
                    },
                    "Result not returned!",
                    function() {
                        $A.test.assertTruthy(returnValue, "Expected non-empty return value");
                        $A.test.assertEquals(1, returnValue.id, "Expected ID to be '1'");
                        $A.test.assertTrue(returnValue.callCount > 0, "Expected call count to be greater than 0");
                    }
                );
            }
        ]
    },

    /**
     * Use execute hotspot on cacheable action. Verify that the action is sent using a GET request,
     * and that it is executed using flow through (without being enqueued).
     */
    testFlowThroughCacheableAction: {
        test: [
            function (cmp, helper) {
                var method;
                var actionCallbackExecuted;

                this.wrapXhrOpen(function (meth) {
                    method = meth;
                });

                // send the cacheable action
                var action = $A.test.getAction(cmp, "c.executeWithPublicCachingWithReturn", {i : 1});

                action.setCallback(action, function () {
                    actionCallbackExecuted = true;
                });

                $A.run(function() {
                    $A.executeHotspot(function () {
                        $A.enqueueAction(action);
                    });
                });

                $A.test.addWaitForWithFailureMessage(
                        true,
                        function () {
                            return actionCallbackExecuted;
                        },
                        "expected action callback to be executed"
                    );

                // we expect the xhr to be sent immediately, i.e. not wait for it to be picked up from the queue (waiting one cycle).
                $A.test.assertTruthy(method, "Expected method to have been set.");
                $A.test.assertEquals("GET", method, "Expected method to be GET");

            }
        ]
    },

    /****************************************************************
     ********************* Helper Functions *************************
     ****************************************************************/

    wrapXhrOpen: function (callback) {
        var open = XMLHttpRequest.prototype.open;
        var override = $A.test.overrideFunction(XMLHttpRequest.prototype, 'open', function(method, url, async) {
            callback.call(this, method, url, async);
            open.call(this, method, url, async);
        });

        $A.test.addCleanup(function() {
            override.restore();
        });
    }

})
