({
    testChangeEventFired: {
        test: function(cmp) {
            var expected = "true";

            cmp.updateGvpValue("isVoiceOver", "true");

            // Update it once, see that it changes.
            // Because of a quirk in the ContextValueProvider
            // this is working. So we do it twice to ensure our fix works.
            $A.test.addWaitFor(expected, function() {
                return cmp.find("data").getElement().textContent;
            }, function() {
                
                // The real test that fails and we need to fix.                
                expected = Date.now()+"";
                cmp.updateGvpValue("isVoiceOver", expected);

                 $A.test.addWaitFor(expected, function() {
                    // We verify the DOM vs $A.get() as we want to track
                    // if the change event fired which would cause a rerender
                    // and update of the expression.
                    return cmp.find("data").getElement().textContent;
                });
            });
        }
    },


    testChangeEventFiredWithBooleans: {
        test: function(cmp) {
            var expected = "true";

            cmp.updateGvpValue("isVoiceOver", true);

            // Update it once, see that it changes.
            // Because of a quirk in the ContextValueProvider
            // this is working. So we do it twice to ensure our fix works.
            $A.test.addWaitFor(expected, function() {
                return cmp.find("data").getElement().textContent;
            }, function() {
                
                // The real test that fails and we need to fix.                
                expected = Date.now();
                cmp.updateGvpValue("isVoiceOver", expected);

                 $A.test.addWaitFor(expected+"", function() {
                    // We verify the DOM vs $A.get() as we want to track
                    // if the change event fired which would cause a rerender
                    // and update of the expression.
                    return cmp.find("data").getElement().textContent;
                });
            });
        }
    },

    /**
     * Update $Global.isVoiceOver on the client.
     * Update $Global.dynamicTypeSize on the server.
     * Ensure $Global.isVoiceOver was not updated from the server.
     * @type {Object}
     */
    testClientValueNotOverridden: {
        test: function(cmp) {
            var isVoiceOver = "isVoiceOver" + new Date().getTime();
            var typeSize = "typeSize" + new Date().getTime();

            $A.set("$Global.isVoiceOver", isVoiceOver);

            cmp.updateGvpValue("dynamicTypeSize", typeSize);

            // Update it once, see that it changes.
            // Because of a quirk in the ContextValueProvider
            // this is working. So we do it twice to ensure our fix works.
            $A.test.addWaitFor(typeSize, function() {
                return cmp.find("dynamicTypeSize").getElement().textContent;
            }, function() {
                // The real test that fails and we need to fix.                
                typeSize = "typeSize" + new Date().getTime();
                cmp.updateGvpValue("dynamicTypeSize", typeSize);

                 $A.test.addWaitFor(isVoiceOver, function() {
                    // We verify the DOM vs $A.get() as we want to track
                    // if the change event fired which would cause a rerender
                    // and update of the expression.
                    return cmp.find("data").getElement().textContent;
                });
            });
        }
    },

    testClientServerUpdateServerPriority: {
        test: function(cmp) {
            var value1 = "true";
            var value2 = "false"

            $A.set("$Global.isVoiceOver", value1);
            cmp.updateGvpValue("isVoiceOver", value2);

            // Update it once, see that it changes.
            // Because of a quirk in the ContextValueProvider
            // this is working. So we do it twice to ensure our fix works.
            $A.test.addWaitFor(value2, function() {
                return cmp.find("data").getElement().textContent;
            });
        }
    },

    testClientServerClientUpdate: {
        test: function(cmp) {
            var value1 = "true";
            var value2 = "false"

            $A.set("$Global.isVoiceOver", value1);
            cmp.updateGvpValue("isVoiceOver", value2);

            // Update it once, see that it changes.
            // Because of a quirk in the ContextValueProvider
            // this is working. So we do it twice to ensure our fix works.
            $A.test.addWaitFor(value2, function() {
                return cmp.find("data").getElement().textContent;
            }, function() {
                $A.set("$Global.isVoiceOver", value1);

                 $A.test.addWaitFor(value1, function() {
                    // We verify the DOM vs $A.get() as we want to track
                    // if the change event fired which would cause a rerender
                    // and update of the expression.
                    return cmp.find("data").getElement().textContent;
                });
            });
        }
    },




    testServerRegistersNewValue : {
        test : [ function(cmp) {
            $A.test.expectAuraError("Attempting to retrieve an unknown global item 'aNewValue'. Global items must be pre-registered and have a default value");
            $A.get("$Global.aNewValue");
        }, function(cmp) {
            var valueName = "aNewValue";
            var defaultValue = "just a default";
            var finished = false;

            var thiscmp = cmp;
            $A.test.addCleanup(function(){
                var a = thiscmp.get("c.unregisterContextVPValue");
                a.setParams({ name : valueName });
                $A.test.callServerAction(a, true);
            });
            var a = cmp.get("c.registerContextVPValue");
            a.setParams({
                name : valueName,
                writable : true,
                defaultValue : defaultValue
            });
            a.setCallback(this, function(action) {
                // values should have been merged by this point
                finished = true;
                $A.test.assertEquals(defaultValue, $A.get("$Global.aNewValue"));
            });
            $A.enqueueAction(a);

            $A.test.addWaitFor(true, function() {
                return finished;
            });
        } ]
    },

    testServerReceivesUnregisteredValue : {
        test : [ function(cmp) {
            // register a value initially
            var valueName = "originalValue";
            var defaultValue = "just a default";
            var finished = false;

            var thiscmp = cmp;
            $A.test.addCleanup(function(){
                var a = thiscmp.get("c.unregisterContextVPValue");
                a.setParams({ name : valueName });
                $A.test.callServerAction(a, true);
            });

            var a = cmp.get("c.registerContextVPValue");
            a.setParams({
                name : valueName,
                writable : true,
                defaultValue : defaultValue
            });
            a.setCallback(this, function(action) {
                finished = true;
                $A.test.assertEquals(defaultValue, $A.get("$Global.originalValue"));
            });
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() {
                return finished;
            });
        }, function(cmp) {
            // unregister the previous value
            var valueName = "originalValue";
            var defaultValue = "just a default";
            var finished = false;
            var a = cmp.get("c.unregisterContextVPValue");
            a.setParams({ name : valueName });
            a.setCallback(this, function(action) {
                // even if missing from response, previously set value remains on client
                finished = true;
                $A.test.assertEquals(defaultValue, $A.get("$Global.originalValue"));
            });
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() {
                return finished;
            });
        }, function(cmp) {
            // now, try to get the value from the server, which should not be aware of it anymore
            var valueName = "originalValue";
            var finished = false;
            var a = cmp.get("c.getContextVPValue");
            a.setParams({ name : valueName });
            a.setCallback(this, function(action){
                finished = true;
                $A.test.assertEquals("ERROR", action.getState());
                var msg = action.getError()[0].message;
                if (msg.indexOf("AuraRuntimeException: Attempt to retrieve unknown $Global variable: originalValue") < 0) {
                    $A.test.fail("Unexpected error returned: " + msg);
                }
            });
            $A.enqueueAction(a);
            $A.test.addWaitFor(true, function() {
                return finished;
            });
        } ]
    }
})
