({
    doInit: function(cmp) {
        $A.createComponent(
                'lockerTest:cmpWithMethod', {
                    'aura:id': 'dynamicChild'
                },
                function (newCmp) {
                    cmp.set('v.childCmp', newCmp);
                }
        );
    },

    callFacetMethodFromMarkupComponent: function (component, event, helper) {
        var child = component.find('child');
        child.getDivFromMarkup();
    },

    callFacetMethodFromDynamicComponent: function (component, event, helper) {
        var child = component.get('v.childCmp');
        child.getDivFromMarkup();
    },

    testBlockedAPI: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertUndefined(cmp.removeDocumentLevelHandler, "An unexposed API (removeDocumentLevelHandler)"
                + " is exposed on SecureComponent");
    },

    testFindReturnsSecureComponent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var cmpViaFind = cmp.find("innerCmp");
        testUtils.assertStartsWith("SecureComponent", cmpViaFind.toString(), "Expected component found via find()"
                + " to be a SecureComponent");
    },

    testFindOnInnerComponentsMarkup: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var innerCmp = cmp.find("innerCmp");
        // Reach for the component inside my facet
        var deepInnerCmp = innerCmp.find("outputText");
        testUtils.assertStartsWith("SecureComponentRef", deepInnerCmp.toString(), "Expected deep inner component found via find()"
            + " to be a SecureComponentRef");
    },

    testGetElementReturnsSecureElement: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureElement = cmp.getElement();
        testUtils.assertStartsWith("SecureElement", secureElement.toString(), "Expected return of cmp.getElement()"
                + " to be a SecureElement");
    },

    testGetElementsReturnsArrayOfSecureElements: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var elements = cmp.getElements();
        elements.forEach(function(element) {
                testUtils.assertStartsWith("SecureElement", element.toString(), "Expected return of cmp.getElements()"
                    + " to be an array of SecureElements");
        });
    },

    testGetEventReturnsSecureEvent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var secureEvent = cmp.getEvent("press");
        testUtils.assertStartsWith("SecureAuraEvent", secureEvent.toString(), "Expected return of cmp.getEvent()"
                + " to be a SecureAuraEvent");
    },

    testGetCThrowsError: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        try {
            cmp.get("c");
            testUtils.fail("Expected error when executing SecureComponent.get('c')");
        } catch (e) {
            testUtils.assertEquals("Invalid key c", e.message);
        }
    },

    testAddValueProviderExploit: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var vp = {
            get: function(key, comp) {
                testUtils.assertStartsWith("SecureComponent", comp.toString(), "Component passed to value provider should be SecureComponent");
            }
        }
        cmp.addValueProvider('foo', vp); 
        cmp.get('foo.x');
    },
    
    testAuraMethod: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        cmp.sayHello();
        testUtils.assertEquals("Hello from sayHello()", cmp.find("message").textContent);
    },
    
    testCyclicObject: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        
        var cyclicObject = {};
        cyclicObject.parent = cyclicObject;
                
        cmp.set("v.cyclicObject", cyclicObject);
                
        cmp.get("v.cyclicObject");
    },  

    testGet_AttributeValue: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertEquals("Locker", cmp.get("v.attrString"), "Failed to get string attribute value");
        testUtils.assertEquals(3, cmp.get("v.attrList").length, "Failed to get list attribute value");
        var map = cmp.get("v.attrMap");
        testUtils.assertTrue(map.hasOwnProperty("Key"), "Failed to get map attribute value");
        testUtils.assertEquals("Value", cmp.get("v.attrMap").Key);
    },

    testGet_ModelMemberValue: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertEquals("Model", cmp.get("m.string"), "Failed to get simple model value");
        var modelMap = cmp.get("m.map");
        testUtils.assertEquals("apple", modelMap.fruit, "Failed to get map type model value");
    },

    testGet_ActionReturnsSecureAction: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var clientAction = cmp.get("c.sayHello");
        testUtils.assertStartsWith("SecureAction", clientAction.toString(), "Expected to receive a SecureAction" +
            "when requesting a client action using component.get()");

        var serverAction = cmp.get("c.getNamedComponent")
        testUtils.assertStartsWith("SecureAction", serverAction.toString(), "Expected to receive a SecureAction" +
            "when requesting a server action using component.get()");
    },

    testGet_ComponentEventReturnsSecureAuraEvent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        var pressEvent = cmp.get("e.press");
        testUtils.assertStartsWith("SecureAuraEvent", pressEvent.toString(), "Expected to receive SecureAuraEvent" +
            "when requesting a event using component.get()");
    },

    testGet_InvalidAction: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        try {
            cmp.get('c.unknownAction');
            testUtils.fail("Expected error when executing SecureComponent.get('c.unknownAction')");
        } catch (e) {
            testUtils.assertEquals("Unable to find 'unknownAction' on 'compound://lockerTest.secureComponentTest'.", e.message);
        }
    },

    testGet_InvalidAttr: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.expectAuraError("Access Check Failed!");
        cmp.get('v.unknownAttribute');
    },

    testGet_InvalidEvent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertNull(cmp.get('e.unknownEvent'), "Expected null when executing SecureComponent.get('c.unknownEvent')");
    },

    testGetEvent_InvalidEvent: function(cmp) {
        var testUtils = cmp.get("v.testUtils");
        testUtils.assertNull(cmp.getEvent('v.unknownEvent'), "Expected null when executing SecureComponent.getEvent('c.unknownEvent')");
    },

    sayHello: function(cmp) {
		cmp.find("message").textContent = "Hello from sayHello()";
	}
})