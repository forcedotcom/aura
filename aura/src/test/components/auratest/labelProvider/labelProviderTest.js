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
                        sv2 === "<DOESNT:EXIST>",
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
    }


})