({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on older IE
    browsers: ["-IE8", "-IE9", "-IE10"],

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

    testGetElementsReturnsArrayOfSecureElement: {
        test: function(cmp) {
            cmp.testGetElementsReturnsArrayOfSecureElement();
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
        test: function(cmp){
            cmp.testGet_ComponentEventReturnsSecureAuraEvent();
        }
    }
})