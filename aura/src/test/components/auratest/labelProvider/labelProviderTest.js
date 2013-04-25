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

    testNonExistingLabel: {
        testLabels : ["UnAdaptableTest"],
        test: function(cmp) {

            var value = $A.expressionService.getValue(cmp, "$Label.DOESNT.EXIST");

            $A.test.addWaitFor(
                false,
                $A.test.isActionPending,
                function(){
                    $A.test.assertEquals("FIXME - LocalizationAdapter.getLabel() needs implemenation!",
                        cmp.get("v.simplevalue2.value"),
                        "Failed to get expected error message");
                }
            );

        }
    }
})