({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],

    testClickEvent: {
        test: function(cmp) {
            cmp.domEventTester("testClickEvent");
        }
    },

    testInitEventOnDynamicElement: {
        test: function(cmp) {
            cmp.domEventTester("testInitEventOnDynamicElement");
        }
    },

    // Automation for W-4437423
    testInitEventOnTemplateElement: {
        test: function(cmp) {
            cmp.domEventTester("testInitEventOnTemplateElement");
        }
    },

    testRemoveEventListenerOnTemplateElement: {
        test: function(cmp) {
            cmp.domEventTester("testRemoveEventListenerOnTemplateElement");
        }
    },

    testEventView: {
        test: function(cmp) {
            cmp.domEventTester("testEventView");
        }
    },

    testEventTargetOfHtmlElementHandler: {
        test: function(cmp) {
            cmp.domEventTester("testEventTargetOfHtmlElementHandler");
        }
    },

    testInitEventOnElementOfChildModule: {
        test: function(cmp) {
            cmp.domEventTester("testInitEventOnElementOfChildModule");
        }
    },

    testCustomEvent: {
        test: function(cmp) {
            cmp.domEventTester("testCustomEvent");
        }
    }
})
