({    
    testSetNullOnClientThenSetOnServer: {
        test: [
        function setGvpToNullOnClient(cmp) {
            var expected = null;
            $A.set("$Global.isVoiceOver", expected);

            // Setting GVP to null should clear value on client
            $A.test.addWaitFor("", function() {
                return cmp.find("isVoiceOver").getElement().textContent;
            });
        },
        function setGvpToValueOnServer(cmp) {
            var expected = "afterNull";
            cmp.updateGvpValue("isVoiceOver", expected);

             $A.test.addWaitFor(expected, function() {
                return cmp.find("isVoiceOver").getElement().textContent;
            });
        }]
    },

    testSetNullOnServerDoesNotAffectClientValue: {
        test: [
        function setGvpToValueOnServer(cmp) {
            var expected = "newValue";
            
            cmp.updateGvpValue("isVoiceOver", expected);
            
            $A.test.addWaitFor(expected, function() {
                return cmp.find("isVoiceOver").getElement().textContent;
            });
        },
        function setGvpToNullOnServer(cmp) {
            var expected = null;
            cmp.updateGvpValue("isVoiceOver", expected);

            // Value does not change so just wait for all actions to complete
            $A.test.addWaitFor(false, $A.test.isActionPending, function() {
                $A.test.assertEquals("newValue", cmp.find("isVoiceOver").getElement().textContent,
                    "Setting GVP to null on server should not affect client value");
            });
        },
        function setGvpToAnotherValueOnServer(cmp) {
            var expected = "afterNull";
            cmp.updateGvpValue("isVoiceOver", expected);

             $A.test.addWaitFor(expected, function() {
                return cmp.find("isVoiceOver").getElement().textContent;
            });
        }]
    },

    testRegisterAndSetGvpOnServer: {
        test: [
        function registerAndSetGvpOnServer(cmp) {
            var thiscmp = cmp;
            cmp._gvpName = "testRegisterAndSetGvpOnServer";

            $A.test.addCleanup(function(){
                var a = thiscmp.get("c.unregisterContextVPValue");
                a.setParams({ name : cmp._gvpName });
                $A.test.callServerAction(a, true);
            });

            var a = cmp.get("c.registerAndSetContextVPValue");
            a.setParams({
                name : cmp._gvpName,
                writable : true,
                defaultValue : "defaultValue",
                value: "newValue"
            });
            $A.enqueueAction(a);
            
            $A.test.addWaitFor(true, function() {
                return $A.test.areActionsComplete([a]);
            });
        },
        function verifyGvpValueOnClient(cmp) {
            $A.test.assertEquals("newValue", $A.get("$Global")[cmp._gvpName]);
        }]
    },

   /**
     * Update GVP value on the server. We update the value twice here to verify the server correctly tracks the value
     * changes and serialization of the value between the client and server does not mess up the value.
     */
    testChangeEventFired: {
        test: function(cmp) {
            var expected = "true";

            cmp.updateGvpValue("isVoiceOver", "true");

            $A.test.addWaitFor(expected, function() {
                return cmp.find("isVoiceOver").getElement().textContent;
            }, function() {
                expected = Date.now()+"";
                cmp.updateGvpValue("isVoiceOver", expected);

                 $A.test.addWaitFor(expected, function() {
                    // We verify the DOM vs $A.get() as we want to track
                    // if the change event fired which would cause a rerender
                    // and update of the expression.
                    return cmp.find("isVoiceOver").getElement().textContent;
                });
            });
        }
    },

    testChangeEventFiredWithBooleans: {
        test: function(cmp) {
            var expected = "true";

            cmp.updateGvpValue("isVoiceOver", true);

            $A.test.addWaitFor(expected, function() {
                return cmp.find("isVoiceOver").getElement().textContent;
            }, function() {
                expected = Date.now();
                cmp.updateGvpValue("isVoiceOver", expected);

                 $A.test.addWaitFor(expected+"", function() {
                    // We verify the DOM vs $A.get() as we want to track
                    // if the change event fired which would cause a rerender
                    // and update of the expression.
                    return cmp.find("isVoiceOver").getElement().textContent;
                });
            });
        }
    },

    /**
     * Update $Global.isVoiceOver on the client.
     * Update $Global.dynamicTypeSize on the server.
     * Update $Global.dynamicTypeSize a second time on the server.
     * Ensure $Global.isVoiceOver was not updated from the server.
     */
    testClientValueNotOverridden: {
        test: function(cmp) {
            var isVoiceOver = "isVoiceOver" + new Date().getTime();
            var typeSize = "typeSize" + new Date().getTime();

            $A.set("$Global.isVoiceOver", isVoiceOver);
            cmp.updateGvpValue("dynamicTypeSize", typeSize);

            $A.test.addWaitFor(typeSize, function() {
                return cmp.find("dynamicTypeSize").getElement().textContent;
            }, function() {
                typeSize = "typeSize" + new Date().getTime();
                cmp.updateGvpValue("dynamicTypeSize", typeSize);

                $A.test.addWaitFor(typeSize,
                    function() {
                        return cmp.find("dynamicTypeSize").getElement().textContent;
                    }, function() {
                        $A.test.assertEquals(isVoiceOver, cmp.find("isVoiceOver").getElement().textContent);
                    }
                );
            });
        }
    },

    /**
     * Setting a GVP on the client then firing a server action to set on the server should result in the GVP having
     * the server set value.
     */
    testClientServerUpdateServerPriority: {
        test: function(cmp) {
            var clientSet = "clientSet";
            var serverSet = "serverSet"

            $A.set("$Global.isVoiceOver", clientSet);
            cmp.updateGvpValue("isVoiceOver", serverSet);

            $A.test.addWaitFor(serverSet, function() {
                return cmp.find("isVoiceOver").getElement().textContent;
            });
        }
    },

    /**
     * Update $Global.isVoiceOver on the client.
     * Update $Global.isVoiceOver on the server.
     * Update $Global.isVoiceOver on the client.
     * Verify $Global.isVoiceOver is the final value set on the client.
     */
    testClientServerClientUpdate: {
        test: function(cmp) {
            var clientSet = "clientSet";
            var serverSet = "serverSet"

            $A.set("$Global.isVoiceOver", clientSet);
            cmp.updateGvpValue("isVoiceOver", serverSet);

            $A.test.addWaitFor(serverSet, function() {
                return cmp.find("isVoiceOver").getElement().textContent;
            }, function() {
                $A.set("$Global.isVoiceOver", clientSet);

                 $A.test.addWaitFor(clientSet, function() {
                    return cmp.find("isVoiceOver").getElement().textContent;
                });
            });
        }
    },

    testServerRegistersNewValue : {
        test : [ function(cmp) {
            try {
                $A.get("$Global.aNewValue");
            } catch (e) {
                $A.test.assertEquals("Attempting to retrieve an unknown global item 'aNewValue'. Global items must be pre-registered and have a default value", e.message);
            }
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
