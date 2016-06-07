({
    testFuelGauges:{
        test:function(cmp){
            var actionsGauge = cmp.find("actionsGauge");
            var savingsGauge = cmp.find("savingsGauge");
            $A.test.assertTruthy(actionsGauge);
            $A.test.assertTruthy(savingsGauge);
        }
    },

    testDuplicateGauge:{
        test:function(cmp){
            var checkingGauge1 = cmp.find("checkingGauge1");
            var checkingGauge2 = cmp.find("checkingGauge2");
            $A.test.assertTruthy(checkingGauge1);
            $A.test.assertTruthy(checkingGauge2);
            $A.test.assertTrue(checkingGauge1.getGlobalId() !== checkingGauge2.getGlobalId(),
                     "Duplicate fuel gauge for same storage object should be allowed.");
        }
    },

    /**
     * W-1560159: We don't complain about invalid storage names, keep quite or flag an error?
     */
    testInvalidStorageNames:{
        test:function(cmp){
            var bogusGauge = cmp.find("bogusGauge");
            $A.test.assertTruthy(bogusGauge);
            $A.test.assertFalse(bogusGauge.get('v.enabled'))

            var noName = cmp.find("noName");
            $A.test.assertTruthy(noName);
            $A.test.assertFalse(noName.get('v.enabled'))
        }
    },

    testFuelGaugeUnaffectedByOtherStores:{
        test:[
            function captureCurrentValues(cmp){
                var actionsGauge = cmp.find("actionsGauge");
                cmp._actionsValue = actionsGauge.get("v.value");
                var savingsGauge = cmp.find("savingsGauge");
                cmp._savingsValue = savingsGauge.get("v.value");
                var checkingGauge1 = cmp.find("checkingGauge1");
                cmp._checkingValue = checkingGauge1.get("v.value");
            },
            function updateStores(cmp) {
                var completed = false;
                $A.storageService.getStorage("actions").set("big", new Array(4096).join("x"))
                    .then(function() {
                        return $A.storageService.getStorage("savings").set("small", new Array(512).join("x"))
                    })
                    .then(function() {
                        completed = true;
                    })["catch"](function(e) {
                        $A.test.fail("storage error thrown", e);
                    });

                $A.test.addWaitFor(true, function() { return completed; });
            },
            function verifyUpatedValues(cmp) {
                $A.test.addWaitForWithFailureMessage(true, function() {
                     var actionsValue = cmp.find("actionsGauge").get("v.value");
                     var savingsValue = cmp.find("savingsGauge").get("v.value");
                     return cmp._actionsValue !== actionsValue && cmp._savingsValue !== savingsValue;
                },
                "actions gauge or savings gauge not updated",
                function() {
                    var actionsValue = cmp.find("actionsGauge").get("v.value");
                    var savingsValue = cmp.find("savingsGauge").get("v.value");
                    var checkingValue = cmp.find("checkingGauge1").get("v.value");
                    $A.test.assertEquals(cmp._checkingValue, checkingValue, "checking guage should not have changed");
                    $A.test.assertTrue(actionsValue > savingsValue, "actions guage should be larger than savings guage");
                });
            }
        ]
    },
})