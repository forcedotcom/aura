({
    testGetEventSourceReturnsSecureComponent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAuraEvent = cmp.getEvent("debugLog");
        testUtils.assertStartsWith("SecureComponent", secureAuraEvent.getSource().toString());
    },

    testGetSourceReturnsSecureComponentRefWhenNoAccess: function(cmp, event) {
        var testUtils = cmp.get("v.testUtils");
        var actual = event.getSource();
        testUtils.assertStartsWith("SecureComponentRef", actual.toString());
    },

    testExerciseEventAPIs: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureAuraEvent = cmp.getEvent("debugLog");
        var params = { "type": "event", "message": "testMessage" };
        secureAuraEvent.setParams(params);
        testUtils.assertEquals("debugLog", secureAuraEvent.getName());
        testUtils.assertEquals(params.message, secureAuraEvent.getParams().message);
        testUtils.assertEquals("function", typeof secureAuraEvent.fire);
        testUtils.assertEquals("function", typeof secureAuraEvent.stopPropagation);
    },

    testGetType: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var expected = "aura:debugLog";
        var secureAuraEvent = cmp.getEvent("debugLog");
        testUtils.assertEquals(expected, secureAuraEvent.getType(), "Unexpected type returned from Event.js#getType");
    },

    testGetEventType: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var expected = "APPLICATION";
        var secureAuraEvent = cmp.getEvent("debugLog");
        testUtils.assertEquals(expected, secureAuraEvent.getEventType(), "Unexpected type returned from Event.js#getEventType");
    },

    testGetSetParamAndParams: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var event = $A.get("e.lockerTest:applicationEvent");

        testUtils.assertStartsWith("SecureAuraEvent", event.toString());

        var setParam = event.setParam("name", "123");
        testUtils.assertUndefined(setParam, "Unexpected value returned from Event.js#setParam");
        testUtils.assertEquals("123", event.getParam("name"), "Unexpected value returned from Event.js#setParam followed by Event.js#getParam");

        var setParams = event.setParams({ name: "abc" });
        testUtils.assertStartsWith("SecureAuraEvent", setParams.toString(), "Unexpected value returned from Event.js#setParams");
        testUtils.assertEquals("abc", event.getParam("name"), "Unexpected value returned from Event.js#setParams followed by Event.js#getParam");

        event.setParam("name", "456");
        testUtils.assertEquals("456", event.getParams().name, "Unexpected value returned from Event.js#setParam followed by Event.js#getParams");

        event.setParams({ name: "def" });
        testUtils.assertEquals("def", event.getParams().name, "Unexpected value returned from Event.js#setParams followed by Event.js#getParams");
    },

    testSetParamFilter: function() {
        var event = $A.get("e.lockerTest:applicationEvent");
        event.setParam("paramBag", {data: window});
        event.fire();
    },

    testSetParamsFilter: function() {
        $A.get("e.lockerTest:applicationEvent").setParams({paramBag: {data: window}}).fire();
    },

    testGetParamFilter: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        cmp.addEventHandler("lockerTest:applicationEvent", function(event) {
            var paramBag = event.getParam("paramBag");
            testUtils.assertStartsWith("SecureWindow", paramBag.data.toString(), "Expected a secure object from Event.js#getParam when passing raw object in systen mode as event parameter");
        });
    },

    testGetParamsFilter: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        cmp.addEventHandler("lockerTest:applicationEvent", function(event) {
            var params = event.getParams();
            testUtils.assertStartsWith("SecureWindow", params.paramBag.data.toString(), "Expected a secure object from Event.js#getParams when passing raw object in systen mode as event parameter");
        });
    },

    testEventParamsFilteringNonLockerHandler: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var onCreateCalled = false;
        var callbackParam;

        $A.createComponent("lockerTest:facet", {}, function(newCmp, status, statusMessage) {
            $A.get("e.ui:createPanel").setParams({
                panelType: "modal",
                visible: true,
                panelConfig: { body: newCmp },
                onCreate: function(panel) {
                    onCreateCalled = true;
                    callbackParam = panel;
                }
            }).fire();
        });

        testUtils.addWaitForWithFailureMessage(
                true,
                function() { return onCreateCalled; },
                "ui:createPanel onCreate callback never called creating a panel",
                function() {
                    testUtils.assertStartsWith("SecureComponentRef", callbackParam.toString(), "Expected event param callback to filter component");
                }
        );
    },

    testEventParamsFilteringSameLocker: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var callbackCalled = false;
        var callbackParam;

        cmp.addEventHandler("lockerTest:applicationEvent", function(event) {
            var params = event.getParams();
            var paramBag = params.paramBag;
            testUtils.assertStartsWith("SecureComponent", paramBag.foo.toString(), "Expected SecureComponent when passing cmp as event parameter");

            // pass back a DOM element to verify filtering logic
            var callback = event.getParams().callback;
            var div = document.getElementById("title");
            callback(div);
        });

        $A.get("e.lockerTest:applicationEvent").setParams({
            paramBag: { foo: cmp },
            callback: function(param) {
                callbackCalled = true;
                callbackParam = param;
            }
        }).fire();

        testUtils.addWaitForWithFailureMessage(
                true,
                function() { return callbackCalled; },
                "Event callback set as param never called",
                function() {
                    testUtils.assertStartsWith("SecureElement", callbackParam.toString(), "Expected SecureElement when event handler passes DOM element back");
                }
        );
    },

    testEventParamsFilteringDifferentLocker: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var callbackCalled = false;
        var callbackParam;

        $A.get("e.lockerTest:applicationEvent").setParams({
            paramBag: {
                foo: cmp,
                otherNamespaceTest: true
            },
            callback: function(param) {
                callbackCalled = true;
                callbackParam = param;
            }
        }).fire();

        testUtils.addWaitForWithFailureMessage(
                true,
                function() { return callbackCalled; },
                "Event callback set as param never called",
                function() {
                    testUtils.assertStartsWith("SecureComponentRef", callbackParam.toString(),
                            "Expected SecureComponentRef when event handler from another namespace passes own component ref back in callback function");
                }
        );
    }
})
