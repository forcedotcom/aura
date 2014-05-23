({
    testAsyncLabelProvider: {
        test: function (cmp) {

            $A.test.addWaitFor(
                false,
                $A.test.isActionPending,
                function () {
                    $A.test.assertEquals("Today", cmp.get("v.simplevalue1"), "Failed to get Label");
                }
            );
        }
    },

    testNonExistingSection: {
        test: function (cmp) {
            $A.test.addWaitFor(
                false,
                $A.test.isActionPending,
                function () {

                    var sv2 = cmp.get("v.simplevalue2");

                    $A.test.assertTrue(
                        sv2 === "FIXME - LocalizationAdapter.getLabel() needs implementation!" ||
                        sv2 === "PropertyFile - section DOESNT not found.",
                        "Failed to get expected error message");
                }
            );

        }
    },

    testNonExistingLabel: {
        test: function (cmp) {
            $A.test.addWaitFor(
                false,
                $A.test.isActionPending,
                function () {

                    var sv3 = cmp.get("v.simplevalue3");

                    $A.test.assertTrue(
                        sv3 === "FIXME - LocalizationAdapter.getLabel() needs implementation!" ||
                        sv3 === "__MISSING LABEL__ PropertyFile - val DOESNTEXIST not found in section Related_Lists",
                        "Failed to get expected error message");
                }
            );

        }
    },

    testGVPCallback: {
        test: [
            function (cmp) {

                $A.get("$Label.Related_Lists.task_mode_today", cmp, function (res) {
                    $A.test.assertEquals("Today", res, "Failed: Wrong label value in callback");
                });
            },

            function (cmp) {

                var tmt = $A.get("$Label.Related_Lists.task_mode_today", function (res) {

                    $A.test.assertEquals("Today", res, "Failed: Wrong label value in callback");
                });

                $A.test.addWaitFor(
                    false,
                    $A.test.isActionPending,
                    function () {
                        $A.test.assertEquals("Today", $A.get("$Label.Related_Lists.task_mode_today"), "Label should already be context so it should be the return value");
                    }
                );
            }
        ]
    },

    testInvalidGVPExpressions: {
        test: function (cmp) {
            var result = $A.get("v.simplevalue3");
            $A.test.assertEquals(undefined, result, "Invalid GVP expression should return undefined");
        }
    },

    testPartialLabelExpressions: {
        test: [
            //Wait for all labels to be fetched and GVP to be ready
            function (cmp) {
                $A.test.addWaitFor(
                    false,
                    $A.test.isActionPending
                );
            },
            //Section and name missing from label expression
            function (cmp) {
                var labels = $A.get("$Label");
                $A.test.assertUndefinedOrNull(labels, "$Label should be undefined");
            },
            //Expression without Name missing but valid section
            function (cmp) {
                var section = $A.get("$Label.Related_Lists");
                $A.test.assertUndefinedOrNull(section, "$Label.Related_Lists should be undefined");
            },
            //Expression without an invalid section only
            function (cmp) {
                $A.test.addWaitFor(
                    false,
                    $A.test.isActionPending,
                    function () {
                        var sv4 = cmp.get("v.simplevalue4");
                        $A.test.assertUndefinedOrNull(sv4, "v.simplevalue4 should be undefined");
                    }
                );
            }
        ]
    },

    /**
     * General tests for Global Value Providers
     */

    testNonGVP: {
        test: function (cmp) {
            $A.test.assertUndefinedOrNull($A.get("undefined"));
            $A.test.assertUndefinedOrNull($A.get(""));
            $A.test.assertUndefinedOrNull($A.get("$Foo.bar"));
            $A.test.assertUndefinedOrNull($A.get({}));
            $A.test.assertUndefinedOrNull($A.get([]));
            $A.test.assertUndefinedOrNull($A.get());
            $A.test.assertUndefinedOrNull($A.get(null));
        }
    },
    testGetWithCallback: {
        test: [
            //Fetch a new label from server
            function (cmp) {
                $A.get("$Label.Related_Lists.FooBar",
                    function (label) {
                        cmp._callBack = true;
                        cmp._label = label;
                    });
                $A.test.addWaitForWithFailureMessage(
                    true,
                    function () {
                        return cmp._callBack
                    },
                    "Failed to run call back after fetching label from server",
                    function () {
                        $A.test.assertTrue(
                            cmp._label === "FIXME - LocalizationAdapter.getLabel() needs implementation!" ||
                            cmp._label === "__MISSING LABEL__ PropertyFile - val FooBar not found in section Related_Lists",
                            "$Label.Related_Lists." + "FooBar should have error value"
                        );
                    })
            },
            //Fetch existing GVPs at client
            function (cmp) {
                cmp._callBack = false;
                $A.get("$Label.Related_Lists.FooBar",
                    function (label) {
                        cmp._callBack = true;
                        cmp._label = label;
                    });
                //No need to wait for unlike previous case, call backs are immediate as value is available at client
                $A.test.assertTrue(cmp._callBack);
                $A.test.assertTrue(
                    cmp._label === "FIXME - LocalizationAdapter.getLabel() needs implementation!" ||
                        cmp._label === "__MISSING LABEL__ PropertyFile - val FooBar not found in section Related_Lists",
                    "$Label.Related_Lists." + "FooBar should have error value"
                );
            }
        ]
    },
    
    testGetWithNonFunctionCallback: {
    	test : function (cmp) {
            $A.test.addWaitFor("Today + Overdue", function(){return $A.get("$Label.Related_Lists.task_mode_today_overdue","Mary Poppins")});
            $A.test.addWaitFor("Today + Overdue", function(){return $A.get("$Label.Related_Lists.task_mode_today_overdue","undefined")});
    	}
    },
    /**
     * Verify that label expressions with the expression delimiter is evaluated by $A.get() 
     */
    testGetWithExpressionDelimiters: {
    	test : function (cmp) {
            $A.test.addWaitFor("Today + Overdue", function(){return $A.get("{!$Label.Related_Lists.task_mode_today_overdue}")});
    	}
    }
})
