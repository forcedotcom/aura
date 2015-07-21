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
     * This test has same behavior with a passing test:
     * componentTest.versioningTest.testVersionInDynamicallyCreatedComponent
     * The only difference is the created component in this test is associated with a model.
     * If set up break point in updateVersionFromClientController in auratest:requireWithServerAction's
     * controller, when cmp.getVersion() gets called, this test component doesn't exist in
     * accessStack.
     *
     * TODO: W-2609199
     * This is caused by access stack issue. Since the component has model, it may have to go to server.
     * Every time we go to server, we lose the context. So in createComponent callback, it currently push
     * undefined to access stack. For getVersion, we rely on the component in access stack, so it uses
     * undefined in this case.
     */
    _testVersionFromClientControllerOfCreatedCmpWithModel: {
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
     * TODO: W-2609199
     */
    _testVersionFromServerControllerOfCreatedCmp: {
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

    updateVersion: function(cmp, version) {
        cmp.set("v.version", version);
    }
})
