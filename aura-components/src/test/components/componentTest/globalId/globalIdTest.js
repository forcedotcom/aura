({
    testGlobalIdOfComponetFromServerSuffixWithActionId: {
        test: function(cmp) {
            var targetComponent;
            var action = cmp.get("c.createComponentsOnServer");
            action.setParams({ descriptors: ["actionsTest:actionId"] });
            action.setCallback(cmp, function(result) {
                $A.test.assertEquals("SUCCESS", result.getState(),
                            "Failed to retrieve component configs from server.");

                var configs = result.getReturnValue();
                targetComponent = $A.createComponentFromConfig(configs[0]);
            });
            $A.enqueueAction(action);

            var expected = action.getId();
            $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action]); },
                function verifyActionIdExistsInGlobalId() {
                    var globalId = targetComponent.getGlobalId();
                    var actual = globalId.split(":")[1];
                    $A.test.assertEquals(expected, actual,
                            "Failed to find action Id in component's global Id: " + globalId);
                });
        }
    },

    testGlobalIdSuffixWithActionIdWhenMultiComponentsInSingleAction: {
        test: function(cmp) {
            var targetComponents = [];
            var action = cmp.get("c.createComponentsOnServer");
            action.setParams({
                descriptors: [
                    "actionsTest:actionId",
                    "ui:button"
                    ]
                });
            action.setCallback(cmp, function(result) {
                $A.test.assertEquals("SUCCESS", result.getState(),
                            "Failed to retrieve component configs from server.");

                var configs = result.getReturnValue();
                targetComponents.push($A.createComponentFromConfig(configs[0]));
                targetComponents.push($A.createComponentFromConfig(configs[1]));
            });
            $A.enqueueAction(action);

            var expected = action.getId();
            $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action]); },
                function verifyActionIdExistsInGlobalId() {
                    var targetComponent = targetComponents[0];
                    var globalId = targetComponent.getGlobalId();
                    var actual = globalId.split(":")[1];
                    $A.test.assertEquals(expected, actual,
                            "Failed to find action Id in " + targetComponent.getType() + "'s global Id: " + globalId);

                    targetComponent = targetComponents[1];
                    globalId = targetComponent.getGlobalId();
                    actual = globalId.split(":")[1];
                    $A.test.assertEquals(expected, actual,
                            "Failed to find action Id in " + targetComponent.getType() + "'s global Id: " + globalId);
                });
        }
    },

    /**
     * Verify that global Ids should always contain the action Id generated when action is created,
     * and action scoped global Id doesn't get messed with callback execution order.
     */
    testGlobalIdSuffixWtihActionIdWhenEarlyCreatedActionGetsResponseLater: {
        test: [
            function(cmp) {
                var targetComponent;
                // create two server actions
                cmp._firstAction = cmp.get("c.createComponentsOnServer");
                cmp._expectedActionId = cmp._firstAction.getId();
                var secondAction = cmp.get("c.createComponentsOnServer");

                secondAction.setParams({ descriptors: ["actionsTest:actionId"] });
                secondAction.setCallback(cmp, function(result) {
                    $A.test.assertEquals("SUCCESS", result.getState(),
                                "Failed to retrieve component configs from server.");

                    var configs = result.getReturnValue();
                    targetComponent = $A.createComponentFromConfig(configs[0]);
                });
                // Excute the second created action first
                $A.enqueueAction(secondAction);

                var expected = secondAction.getId();
                $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([secondAction]); },
                    function() {
                        var globalId = targetComponent.getGlobalId();
                        var actual = globalId.split(":")[1];
                        $A.test.assertEquals(expected, actual,
                                "Failed to find action Id in component's global Id: " + globalId);
                    });
            },
            function (cmp) {
                var targetComponent;
                var targetAction = cmp._firstAction;
                targetAction.setParams({ descriptors: ["actionsTest:actionId"] });
                targetAction.setCallback(cmp, function(result) {
                    $A.test.assertEquals("SUCCESS", result.getState(),
                                "Failed to retrieve component configs from server.");

                    var configs = result.getReturnValue();
                    targetComponent = $A.createComponentFromConfig(configs[0]);
                });
                $A.enqueueAction(targetAction);

                var expected = cmp._expectedActionId;
                $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([targetAction]); },
                    function verifyActionIdExistsInGlobalId() {
                        var globalId = targetComponent.getGlobalId();
                        var actual = globalId.split(":")[1];
                        $A.test.assertEquals(expected, actual,
                                "Failed to find action Id in component's global Id: " + globalId);
                    });
            }
        ]
    },

    testServerComponentGlobalIdSuffixWithActionId: {
        test: function(cmp) {
            var globalId;
            var action = cmp.get("c.retrieveServerComponentGlobalId");
            action.setParams({ descriptor: "actionsTest:actionId" });
            action.setCallback(cmp, function(result) {
                $A.test.assertEquals("SUCCESS", result.getState(),
                            "Failed to retrieve component globalId from server.");

                globalId = result.getReturnValue();
            });
            $A.enqueueAction(action);

            var expected = action.getId();
            $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action]); },
                function verifyGlobalIdOnServer() {
                    var actual = globalId.split(":")[1];
                    $A.test.assertEquals(expected, actual,
                            "Failed to find action Id in component's global Id: " + globalId);
                });
        }
    },

    testGlobalIdSuffixWithActionIdWhenComponentFromStorage: {
        test: [
            function initActionStorageAndPrimeAction(cmp) {
                var completed = false;

                $A.test.addCleanup(function(){ this.deleteStorage("actions"); }.bind(this));
                $A.storageService.initStorage({
                    name: "actions",
                    maxSize: 4096,
                    defaultExpiration: 3600,
                    persistent: true,
                    debugLogging: true,
                    clearOnInit: true
                });

                var action = cmp.get("c.createComponentsOnServer");
                action.setParams({ descriptors: ["actionsTest:actionId"] });
                action.setStorable();
                $A.enqueueAction(action);

                $A.test.addWaitFor(true, function(){ return $A.test.areActionsComplete([action]); },
                    function() {
                        $A.test.assertEquals("SUCCESS", action.getState(), "Priming action failed.");
                    });
            },
            function verifyGlobalIdWhenActionResultFromStorage(cmp) {
                var completed = false;
                var targetComponent;
                var action = cmp.get("c.createComponentsOnServer");
                action.setParams({ descriptors: ["actionsTest:actionId"] });
                action.setCallback(cmp, function(result) {
                    $A.test.assertEquals("SUCCESS", result.getState(),
                            "Failed to retrieve component configs.");
                    $A.test.assertTrue(result.isFromStorage(),
                            "Result should from storage.");
                    var configs = result.getReturnValue();

                    targetComponent = $A.createComponentFromConfig(configs[0]);
                    completed = true;
                });
                action.setStorable();
                $A.enqueueAction(action);

                var expected = action.getId();
                $A.test.addWaitFor(true, function(){ return completed; },
                    function verifyActionIdExistsInGlobalId() {
                        var globalId = targetComponent.getGlobalId();
                        var actual = globalId.split(":")[1];
                        $A.test.assertEquals(expected, actual,
                                "Failed to find action Id in component's global Id: " + globalId);
                    });
            }
        ]
    },

    deleteStorage: function(storageName) {
        var completed = false;

        $A.storageService.deleteStorage(storageName)
            .then(function() {completed = true;})
            .catch(function(e) {
                var msg = "Failed to delete storage [" + storageName + "] :" + e.toString();
                $A.test.fail(msg);
            });

        $A.test.addWaitFor(true, function() {return completed;});
    }

})
