({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on  IE
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testBlockedAPI: {
        test: function(cmp) {
            cmp.testBlockedAPI();
        }
    },

    testFindReturnsSecureComponent: {
        test: function(cmp) {
            cmp.testFindReturnsSecureComponent();
        }
    },

    testGetElementReturnsSecureElement: {
        test: function(cmp) {
            cmp.testGetElementReturnsSecureElement();
        }
    },

    testGetElementsReturnsArrayOfSecureElements: {
        test: function(cmp) {
            cmp.testGetElementsReturnsArrayOfSecureElements();
        }
    },

    testGetEventReturnsSecureEvent: {
        test: function(cmp) {
            cmp.testGetEventReturnsSecureEvent();
        }
    },

    testGetCThrowsError: {
        test: function(cmp) {
            cmp.testGetCThrowsError();
        }
    },
    
    testAddValueProviderExploit: {
        test: function(cmp) {
            cmp.testAddValueProviderExploit();
        }
    },
    
    testAuraMethod: {
        test: function(cmp) {
            cmp.testAuraMethod();
        }
    },
    
    testCyclicObject: {
        test: function(cmp) {
            cmp.testCyclicObject();
        }
    },

    testFindOnInnerComponentsMarkupShouldGetSecureComponentRef: {
        test: function(cmp) {
            cmp.testFindOnInnerComponentsMarkup();
        }
    },

    testGet_AttributeValue: {
        attributes :{
            attrList : ["A", "B", "C"],
            attrString : "Locker",
            attrMap : {"Key" : "Value"}
        },
        test: function(cmp) {
            cmp.testGet_AttributeValue();
        }
    },

    testGet_ModelMemberValue: {
        test: function(cmp) {
            cmp.testGet_ModelMemberValue();
        }
    },

    testGet_ActionReturnsSecureAction: {
        test: function(cmp) {
            cmp.testGet_ActionReturnsSecureAction();
        }
    },

    testGet_ComponentEventReturnsSecureAuraEvent: {
        test: function (cmp) {
            cmp.testGet_ComponentEventReturnsSecureAuraEvent();
        }
    },

    testGet_InvalidAction: {
        test: function(cmp) {
            cmp.testGet_InvalidAction();
        }
    },

    testGet_InvalidAttr: {
        test: function(cmp) {
            cmp.testGet_InvalidAttr();
        }
    },

    testGet_InvalidEvent: {
        test: function(cmp) {
            cmp.testGet_InvalidEvent();
        }
    },

    testGetEvent_InvalidEvent: {
        test: function(cmp) {
            cmp.testGetEvent_InvalidEvent();
        }
    },

    testDynamicComponentAccessToFacet: {
        test: [
           function(cmp) {
                $A.test.addWaitFor(true, function() {
                    return cmp.get("v.childCmp") !== null
                });
            },
            function(cmp) {
                cmp.callFacetMethodFromDynamicComponent();
                $A.test.assertTrue(cmp.get("v.childCmp").get("v.isSecureComponent"), 
                        "Expected dynamically created (but not rendered) component to get back SecureComponent when calling find() on markup element");
            }
        ]
    },
    
    testMarkupComponentAccessToFacet: {
        test: function(cmp) {
            cmp.callFacetMethodFromMarkupComponent();
            $A.test.assertTrue(cmp.find("child").get("v.isSecureComponent"), 
            "Expected component in markup to get back SecureComponent when calling find() on markup element");
        }
    }
})