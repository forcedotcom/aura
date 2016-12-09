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
                    var label = "$Label.DOESNT.EXIST";
                    var sv2 = cmp.get("v.simplevalue2");

                    $A.test.assertTrue(
                        sv2 === null ||
                        sv2.indexOf(label + " does not exist") !== -1,
                        "Failed to get expected error message: " + sv2);
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
                    var label = "$Label.Related_Lists.DOESNTEXIST";
                    var sv3 = cmp.get("v.simplevalue3");

                    $A.test.assertTrue(
                        sv3 === null ||
                        sv3.indexOf(label + " does not exist") !== -1,
                        "Failed to get expected error message: " + sv3);
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

    testPartialLabelExpressions: {
        test: [
            //Wait for all labels to be fetched and GVP to be ready
            function (cmp) {
                $A.test.addWaitFor(
                    false,
                    $A.test.isActionPending
                );
            },

// JBUCH: HALO: FIXME: THIS PATTERN IS CURRENTLY ALLOWED. MORE DISCUSSION NECESSARY.
            //Section and name missing from label expression
//            function (cmp) {
//                var labels = $A.get("$Label");
//                $A.test.assertUndefinedOrNull(labels, "$Label should be undefined");
//            },
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
    testGetWithCallback: {
        test: [
            //Fetch a new label from server
            function (cmp) {
                var label = "$Label.Related_Lists.FooBar";
                $A.get(label,
                    function (value) {
                        cmp._callBack = true;
                        cmp._label = value;
                    });
                $A.test.addWaitForWithFailureMessage(
                    true,
                    function () {
                        return cmp._callBack;
                    },
                    "Failed to run call back after fetching label from server",
                    function () {
                        $A.test.assertTrue(
                            cmp._label === null ||
                            cmp._label.indexOf(label + " does not exist") !== -1,
                            "$Label.Related_Lists.FooBar should have error value: " + cmp._label
                        );
                    });
            },
            //Fetch existing GVPs at client
            function (cmp) {
                var label = "$Label.Related_Lists.FooBar";
                cmp._callBack = false;
                $A.get(label,
                    function (value) {
                        cmp._callBack = true;
                        cmp._label = value;
                    });
                //No need to wait for unlike previous case, call backs are immediate as value is available at client
                $A.test.assertTrue(cmp._callBack);
                $A.test.assertTrue(
                    cmp._label === null ||
                    cmp._label.indexOf(label + " does not exist") !== -1,
                    "$Label.Related_Lists.FooBar should have error value: " + cmp._label
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
     * Verify that $Label is not processed by JSON.resolveRefs.
     * Labels retrieved via $A.get go via a different path, so we need to access the provider via an expression.
     */
    testLabelJsonIsNotResolved: {
        test: [
            function (cmp) {
                $A.test.assertEquals("serialId", $A.test.getText(cmp.find("json_s").getElement()),
                    "'s' should not have been resolved within $Label");
                $A.test.assertEquals("serialIdShort", $A.test.getText(cmp.find("json_sid").getElement()),
                    "'sid' should not have been resolved within $Label");
                $A.test.assertEquals("serialRefId", $A.test.getText(cmp.find("json_r").getElement()),
                    "'r' should not have been resolved within $Label");
                $A.test.assertEquals("serialRefIdShort", $A.test.getText(cmp.find("json_rid").getElement()),
                    "'rid' should not have been resolved within $Label");
            }
        ]
    }
})
