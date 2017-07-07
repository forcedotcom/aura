({
    testFacetFromAnotherNamespaceIsSecureComponentRef: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("facet");
        testUtils.assertStartsWith("SecureComponentRef", secureComponentRef.toString(), "Expected facet from another namesapce"
                + " to be of type SecureComponentRef");
    },

    testUnexposedPlatformAPIs: function(cmp, event, helper) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("facet");
        var unexposedPlatformApis = event.getParam("arguments").unexposedPlatformApis;
        for (var i = 0; i < unexposedPlatformApis; i++) {
            testUtils.assertUndefined(secureComponentRef[unexposedPlatformApis[i]]);
        }
    },

    testGetCThrowsError: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("facet");
        try {
            secureComponentRef.get("c");
            testUtils.fail("Expected error when executing SecureComponent.get('c')");
        } catch (e) {
            testUtils.assertEquals("Invalid key c", e.message);
        }
    },

    testGetFacetActionThrowsError: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("facet");
        try {
            secureComponentRef.get("c.press");
            testUtils.fail("Expected error when trying to retrieve facet action via get()");
        } catch (e) {
            testUtils.assertEquals("Invalid key c.press", e.message);
        }
    },
    
    testGetComponentEvent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var eventSource = cmp.find("eventSource");
        testUtils.assertStartsWith("SecureComponentRef", eventSource.toString());
        
        var foo = eventSource.get("e.foo");
        testUtils.assertDefined(foo);

        foo = eventSource.getEvent("foo");
        testUtils.assertDefined(foo);
    },
    
    testAuraMethod: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        
        var eventSource = cmp.find("eventSource");
        testUtils.assertStartsWith("SecureComponentRef", eventSource.toString());
        
        eventSource.sayHello();
        testUtils.assertEquals("Hello from sayHello()", eventSource.get("v.message"));
    },
    
    testAddHandler: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        
        var eventSource = cmp.find("eventSource");
        eventSource.addHandler("foo", cmp, "c.onFooDynamic");
        eventSource.get("e.foo").fire();
        
        testUtils.assertEquals("Hello from onFooDynamic()", cmp.get("v.message"));       
    },

    testAddValueHandler: function(cmp) {
        var testUtils = cmp.get("v.testUtils");

        var secureComponentRef = cmp.find("facet");
        testUtils.assertDefined(secureComponentRef.addValueHandler, "addValueHandler should be defined on SecureComponenentRef");

        var handlerCalled = false;
        secureComponentRef.addValueHandler({
            event: "change",
            value: "v.label",
            method: function(event) {
                testUtils.assertStartsWith("SecureAuraEvent", event.toString(), "Event passed to addValueHandler callback" +
                        " should be SecureAuraEvent");
                testUtils.assertStartsWith("SecureWindow", window.toString(), "window inside addValueHandler callback" +
                        " should be SecureWindow");
                handlerCalled = true;
            }
        });
        secureComponentRef.set("v.label", "New label");
        testUtils.assertTrue(handlerCalled, "Value handler never called on SecureComponentRef via addValueHandler");
    },

    testDestroy: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureComponentRef = cmp.find("facet");
        testUtils.assertNotUndefinedOrNull(secureComponentRef.destroy);
        secureComponentRef.destroy();

        testUtils.addWaitForWithFailureMessage(
            false,
            function () {
                return secureComponentRef.isValid();
            },
            "SecureComponentRef never destroyed",
            function () {
                testUtils.assertUndefined(cmp.find("facet"));
            });
    },

    onFooDynamic: function(cmp) {
        cmp.set("v.message", "Hello from onFooDynamic()");	
    },
    
    doFoo: function(cmp) {
    	// Do nothing
    }
})