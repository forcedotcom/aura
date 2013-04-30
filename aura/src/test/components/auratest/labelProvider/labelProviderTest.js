({
    testAsyncLabelProvider: {
        test: function(cmp) {

            $A.test.addWaitFor(
                false,
                $A.test.isActionPending,
                function(){
                    $A.test.assertEquals("Today", cmp.get("v.simplevalue1.value"), "Failed to get Label");
                }
            );
        }
    },

    testNonExistingSection: {
        test: function(cmp) {
            $A.test.addWaitFor(
                false,
                $A.test.isActionPending,
                function(){

                    var sv2 = cmp.get("v.simplevalue2.value");

                    $A.test.assertTrue(
                        sv2 === "FIXME - LocalizationAdapter.getLabel() needs implemenation!" ||
                        sv2 === "[DOESNT.EXIST]",
                        "Failed to get expected error message");
                }
            );

        }
    },

    testNonExistingLabel: {
        test: function(cmp) {
            $A.test.addWaitFor(
                false,
                $A.test.isActionPending,
                function(){

                    var sv3 = cmp.get("v.simplevalue3.value");

                    $A.test.assertTrue(
                        sv3 === "FIXME - LocalizationAdapter.getLabel() needs implemenation!" ||
                        sv3 === "__MISSING LABEL__ PropertyFile - val DOESNTEXIST not found in section Related_Lists",
                        "Failed to get expected error message");
                }
            );

        }
    },

    testGVPCallback: {
        test: [
            function(cmp) {

                $A.getGlobalValueProviders().get("$Label.Related_Lists.task_mode_today", cmp, function(res) {
                   $A.test.assertEquals("Today", res, "Failed: Wrong label value in callback");
                });
            },

            function(cmp) {

                var tmt = $A.getGlobalValueProviders().getValue("$Label.Related_Lists.task_mode_today", cmp, function(res) {

                    $A.test.assertEquals("Today", res.getValue(), "Failed: Wrong label value in callback");
                    $A.test.assertEquals("SimpleValue", res.toString(), "Failed: Return value not a SimpleValue");
                });

                $A.test.assertEquals("Today", tmt.getValue(), "Label should already be context so it should be the return value");
            }
        ]
    },

    testInvalidGVPExpressions: {
        test: function(cmp) {
            var result = $A.getGlobalValueProviders().get("v.simplevalue3.value");
            $A.test.assertEquals(undefined, result, "Invalid GVP expression should return undefined");
        }
    }


})