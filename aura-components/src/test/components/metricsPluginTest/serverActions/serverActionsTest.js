({
    /**
     * Tests for ServerActionsMetricsPlugin.js
     */

    /**
     * Verify the method the plugin binds to is accessible.
     */
    testMethodAccessible: {
        test: function(cmp) {
            $A.test.assertDefined($A.clientService["ActionQueue"].prototype["getServerActions"]);
        }
    },

    /**
     * Verify the Action APIs ServerActionsMetricsPlugin.js uses are valid. If any of these asserts fails, the plugin
     * most likely need to be updated to reflect a change in production API.
     */
    testActionApi: {
        test: function(cmp) {
            // We're just checking the API, we don't need the plugin enabled
            $A.metricsService.disablePlugin("serverActions");

            var action = $A.get("c.aura://LabelController.getLabel"),
                name = "dynamic_label_for_test",
                section = "AuraTestLabelSection";

            action.setParams({
                "name": name,
                "section": section
            });
            action.setCallback(this, function(){}, "SUCCESS");
            action.setCallback(this, function(){}, "ERROR");
            action.setCallback(this, function(){}, "INCOMPLETE");

            $A.test.assertDefined(action.getId);
            $A.test.assertDefined(action.isAbortable);
            $A.test.assertDefined(action.isStorable);
            $A.test.assertEquals(name, action.getParams()["name"]);
            $A.test.assertEquals(section, action.getParams()["section"]);
            $A.test.assertTrue(action.getDef().isServerAction());
            $A.test.assertEquals("aura://LabelController/ACTION$getLabel", action.getDef().toString());

            var successCallback = action.getCallback("SUCCESS");
            var errorCallback = action.getCallback("ERROR");
            var incompleteCallback = action.getCallback("INCOMPLETE");
            $A.test.assertDefined(successCallback);
            $A.test.assertDefined(errorCallback);
            $A.test.assertDefined(incompleteCallback);
            $A.test.assertNotEquals(successCallback, errorCallback);
            $A.test.assertNotEquals(successCallback, incompleteCallback);
            $A.test.assertNotEquals(errorCallback, incompleteCallback);
            $A.test.assertDefined(successCallback["s"]);
            $A.test.assertDefined(successCallback["fn"]);

            $A.enqueueAction(action);
            var queuedActions = $A.test.getActionQueue().getQueuedActions();
            var found = false;
            for (var i=0; i<queuedActions.length; i++) {
                var def = queuedActions[i].getDef().toString();
                if (def.indexOf("aura://LabelController/ACTION$getLabel") === 0) {
                    found = true;
                }
            }
            $A.test.assertTrue(found, "Enqueued action not found in ActionQueue via ActionQueue.getQueuedActions()");
        }
    },

    /**
     * Verify plugin handles only success callback being set. Error and incomplete callbacks will be undefined.
     */
    testOnlySuccessCallbackSet: {
        test: function(cmp) {
            var action = $A.get("c.aura://LabelController.getLabel"),
                name = "dynamic_label_for_test",
                section = "Section1",
                callbackCalled = false;

            action.setParams({
                "name": name,
                "section": section
            });
            action.setCallback(this, function(){ callbackCalled = true;}, "SUCCESS");
            $A.enqueueAction(action);
            
            $A.test.addWaitForWithFailureMessage(true, function() {return callbackCalled;},
                    "Server action fails through MetricsService when only success callback set");
        }
    },

    /**
     * Verify we can override the default callback with a callback for a specific state (SUCCESS in this case).
     */
    testOverrideCallback: {
        test: function(cmp) {
            var action = $A.get("c.aura://LabelController.getLabel"),
                name = "dynamic_label_for_test",
                section = "Section1",
                callbackCalled = false;

            action.setParams({
                "name": name,
                "section": section
            });
            // Set default callback, which should include SUCCESS, ERROR, and INCOMPLETE
            action.setCallback(this, function(){});
            // Now override SUCCESS to something new and verify this one gets called
            action.setCallback(this, function(){ callbackCalled = true;}, "SUCCESS");
            $A.enqueueAction(action);

            $A.test.addWaitForWithFailureMessage(true, function() {return callbackCalled;},
                    "Success callback not called after overriding default action callbacks");
        }
    }
})