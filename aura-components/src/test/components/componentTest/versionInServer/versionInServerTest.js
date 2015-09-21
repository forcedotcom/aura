({
    /**
     * Verify version in component's server controller is same as required version.
     */
    testVersionFromServerController: {
        test: [
            function(cmp) {
                var targetComponent = cmp.find("auratest_requireWithServerAction");
                targetComponent.updateVersionFromServerController();

                $A.test.addWaitFor(true, function(){return targetComponent.get("v.actionDone")});
            },
            function(cmp) {
                var actual = cmp.find("auratest_requireWithServerAction").get("v.version");
                this.updateVersion(cmp, actual);
                $A.test.assertEquals("2.0", actual);
            }
        ]
    },

    /**
     * Verify version is always default when request is from same namespace component.
     */
    testVersionFromSameNamespaceServerController: {
        test:[
            function(cmp) {
                var action = cmp.get("c.updateVersionFromSameNamespaceServerController");
                $A.enqueueAction(action);

                $A.test.addWaitFor(true,function(){return cmp.get("v.actionDone")});
            },
            function(cmp) {
                // version is null in default
                $A.test.assertNull(cmp.get("v.version"));
            }
        ]
     },

    /**
     * Verify version in server controller of multi layer nested component is same as required version of
     * its container component.
     */
     testVersionFromGrandchildComponentServerController: {
        test: [
            function(cmp) {
                var component = cmp.find("auratest_requireConsumer");
                component.fireTestComponentVersionEvent();

                $A.test.addWaitForWithFailureMessage(true,function() {return component.get("v.actionDone")});
            },
            function(cmp) {
                var actual = cmp.find("auratest_requireConsumer").get("v.versionInConsumedCmp");
                this.updateVersion(cmp, actual);
                $A.test.assertEquals("123456.0", actual);
            }
        ]
     },

     /**
     * Verify version in server controller function is same as required version of when the function
     * is triggered by a self fired event.
     */
     testVersionFromEventHandlerWithSelfFiredEvent: {
        test: [
            function(cmp) {
                var targetComponent = cmp.find("auratest_requireWithServerAction");
                targetComponent.fireVersionEvent();

                $A.test.addWaitFor(true, function() {return targetComponent.get("v.actionDone")});
            },
            function(cmp) {
                var actual = cmp.find("auratest_requireWithServerAction").get("v.version");
                this.updateVersion(cmp, actual);
                $A.test.assertEquals("2.0", actual);
            }
        ]
     },

     /**
      * Create an auratest:requireWithServerAction in controller and verify the version
      * in client controller of the created component is same as the require version
      * declared in testing component for auratest namespace.
      */
    testVersionFromClientControllerOfCreatedCmpWithModel: {
        test:[
            function(cmp) {
                var action = cmp.get("c.updateVersionFromCreatedComponent");
                $A.enqueueAction(action);

                $A.test.addWaitFor(true, function(){return cmp.get("v.actionDone")});
            },
            function(cmp) {
                $A.test.assertEquals("2.0", cmp.get("v.version"));
            }
        ]
    },

    /**
      * Create an auratest:requireWithServerAction in controller and verify the version
      * in server controller of the created component is same as the require version
      * declared in testing component for auratest namespace.
      */
    testVersionFromServerControllerOfCreatedCmp: {
        test:[
            function(cmp) {
                var action = cmp.get("c.updateVersionFromCreatedComponentServerController");
                $A.enqueueAction(action);

                $A.test.addWaitFor(false, function(){return $A.util.isUndefinedOrNull(cmp.get("v.newComponent"))});
            },
            function(cmp) {
                var targetComponent = cmp.get("v.newComponent");
                $A.test.addWaitFor(true,
                    function(){return targetComponent.get("v.actionDone")},
                    function(){
                        var actual = targetComponent.get("v.version");
                        this.updateVersion(cmp, actual);
                        $A.test.assertEquals("2.0", actual);
                    });
            }
        ]
    },

    /**
     * Verify calling descriptor is set when the server action is called by a root component
     */
    testCallingDescriptorWhenRootComponentSendServerAction: {
        test: [
            function(cmp) {
                var action = cmp.get("c.getContextAccessVersion");
                action.setCallback(cmp, function(a) {
                    $A.test.assertEquals("SUCCESS", a.getState());
                    // verify version is null since it's root component
                    $A.test.assertNull(a.getReturnValue());
                });
                $A.enqueueAction(action);
                $A.test.addWaitFor(true, function() {return $A.test.areActionsComplete([action]);});
            },
            function(cmp) {
                var expect = cmp.getDef().getDescriptor().getQualifiedName();
                var callbackCalled = false;
                var action = cmp.get("c.currentCallingDescriptor");
                action.setCallback(cmp, function(a) {
                    $A.test.assertEquals("SUCCESS", a.getState());
                    // When server side controller is in a different namespace than the component,
                    // we still need to send calling descriptor, which is the current component
                    // instead of parent, since it can define the version of the controller.
                    // verify calling descriptor is testing component
                    $A.test.assertEquals(expect, a.getReturnValue());
                    callbackCalled = true;
                });
                $A.enqueueAction(action);
                $A.test.addWaitFor(true,
                    function() {return $A.test.areActionsComplete([action]);},
                    // make sure callback gets called.
                    function() {$A.test.assertTrue(callbackCalled);}
                );
            }
        ]
    },

    /**
     * Verify calling descriptor is set when component is versioned.
     * Testing component has require version declaration for auratest namespace.
     */
    testCallingDescriptorWhenComponentIsVersioned: {
        test: [
            function(cmp) {
                var targetComponent = cmp.find("auratest_requireWithServerAction");
                targetComponent.updateTextWithCallingDescriptor();

                $A.test.addWaitFor(true, function(){return targetComponent.get("v.actionDone")});
            },
            function(cmp) {
                var targetComponent = cmp.find("auratest_requireWithServerAction");
                var expect = targetComponent.getDef().getDescriptor().getQualifiedName();
                $A.test.assertEquals(expect, targetComponent.get("v.text"),
                        "Calling component should be " + expect);
            }
        ]
    },

   /**
     * test for W-2717580
     * Verify calling descriptor in server action is null when the calling component is not versioned.
     * Test component does NOT has require version declaration for test namespace.
     */
    testCallingDescriptorIsNullWhenNonVersioned: {
        test: [
            function(cmp) {
                var targetComponent = cmp.find("test_cmpWithServerAction");
                targetComponent.updateTextWithCallingDescriptor();

                $A.test.addWaitFor(true, function(){return targetComponent.get("v.actionDone")});
            },
            function(cmp) {
                var targetComponent = cmp.find("test_cmpWithServerAction");
                $A.test.assertNull(targetComponent.get("v.text"),
                        "Calling component should be null.");
            }
        ]
    },

    updateVersion: function(cmp, version) {
        cmp.set("v.version", version);
    }
})
