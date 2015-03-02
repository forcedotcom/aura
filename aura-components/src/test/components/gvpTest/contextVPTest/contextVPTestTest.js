({
    testIsVoiceOverDefault : {
        test : function(cmp) {
            $A.test.assertEquals("" + $A.get("$Global.isVoiceOver"), $A.test.getTextByComponent(cmp.find("data")));
        }
    },

    _testIsVoiceOverChange : {
        test : [ function(cmp) {
            $A.set("$Global.isVoiceOver", true)
        }, function(cmp) {
            $A.test.assertEquals("true", $A.test.getTextByComponent(cmp.find("data")));
            $A.set("$Global.isVoiceOver", false)
        }, function(cmp) {
            $A.test.assertEquals("false", $A.test.getTextByComponent(cmp.find("data")));
            $A.set("$Global.isVoiceOver", true)
        }, function(cmp) {
            $A.test.assertEquals("true", $A.test.getTextByComponent(cmp.find("data")));
        } ]
    },

    insertClientSide : function(cmp) {
        var finished = false;

        $A.componentService.newComponentAsync(this, function(newCmp) {
            cmp.find("insertion").set("v.body", [ newCmp ]);
            finished = true;
        }, {
            "componentDef" : "gvpTest:contextVPTest"
        });
        // wait for our component to be inserted.
        $A.test.addWaitFor(true, function() {
            return finished
        });
    },

    insertServerSide : function(cmp) {
        var finished = false;
        var action = $A.get("c.aura://ComponentController.getComponent");

        action.setParams({
            "name" : "markup://gvpTest:contextVPTest"
        });
        action.setCallback(this, function(a) {
            var newCmp = $A.newCmpDeprecated(a.getReturnValue());
            cmp.find("insertion").set("v.body", [ newCmp ])
            finished = true;
        }, "SUCCESS");
        $A.enqueueAction(action);
        // wait for our component to be inserted.
        $A.test.addWaitFor(true, function() {
            return finished
        });
    },

    testIsVoiceOverTrueOnCreate : {
        test : [ function(cmp) {
            $A.set("$Global.isVoiceOver", true);
            this.insertClientSide(cmp);
        }, function(cmp) {
            $A.test.assertEquals("true", $A.test.getTextByComponent(cmp.find("insertion")));
        } ]
    },

    testIsVoiceOverFalseOnCreate : {
        test : [ function(cmp) {
            $A.set("$Global.isVoiceOver", false);
            this.insertClientSide(cmp);
        }, function(cmp) {
            $A.test.assertEquals("false", $A.test.getTextByComponent(cmp.find("insertion")));
        } ]
    },

    testIsVoiceOverTrueOnServerCreate : {
        test : [ function(cmp) {
            $A.set("$Global.isVoiceOver", true);
            this.insertServerSide(cmp);
        }, function(cmp) {
            $A.test.assertEquals("true", $A.test.getTextByComponent(cmp.find("insertion")));
        } ]
    },

    testIsVoiceOverFalseOnServerCreate : {
        test : [ function(cmp) {
            $A.set("$Global.isVoiceOver", false);
            this.insertServerSide(cmp);
        }, function(cmp) {
            $A.test.assertEquals("false", $A.test.getTextByComponent(cmp.find("insertion")));
        } ]
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
