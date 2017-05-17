({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741,W-3674751): FF and iOS browser versions in autobuilds are too far behind
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testGetEventSourceReturnsSecureComponent: {
        test: function(cmp) {
            cmp.testGetEventSourceReturnsSecureComponent();
        }
    },

    /**
     * Verify getSource returns SecureComponentRef when the event is created in
     * a component under different namespace.
     */
    testGetSourceReturnsSecureComponentRefWhenNoAccess: {
        test:function(cmp) {
            $A.test.clickOrTouch(cmp.find("button").getElement());
        }
    },

    testExerciseEventAPIs: {
        test: function(cmp) {
            cmp.testExerciseEventAPIs();
        }
    },

    testGetType: {
        test: function(cmp) {
            cmp.testGetType();
        }
    },

    testGetEventType: {
        test: function(cmp) {
            cmp.testGetEventType();
        }
    },

    testGetSetParamAndParams: {
        test: function(cmp) {
            cmp.testGetSetParamAndParams();
        }
    },

    testSetParamFilter: {
        test: function(cmp) {
            cmp.addEventHandler("lockerTest:applicationEvent", function(event) {
                var params = event.getParams();
                $A.test.assertEquals("[object Window]", params.paramBag.data.toString(), "Expected raw object in system mode when passing secure object as event parameter");
            });
            cmp.testSetParamFilter();
        }
    },

    testSetParamsFilter: {
        test: function(cmp) {
            cmp.addEventHandler("lockerTest:applicationEvent", function(event) {
                var params = event.getParams();
                $A.test.assertEquals("[object Window]", params.paramBag.data.toString(), "Expected raw object in system mode when passing secure object as event parameter");
            });
            cmp.testSetParamsFilter();
        }
    },

    testGetParamFilter: {
        test: function(cmp) {
            cmp.testGetParamFilter();
            $A.get("e.lockerTest:applicationEvent").setParams({paramBag: {data: window}}).fire();
        }
    },

   testGetParamsFilter: {
        test: function(cmp) {
            cmp.testGetParamsFilter();
            $A.get("e.lockerTest:applicationEvent").setParams({paramBag: {data: window}}).fire();
        }
    },

    testEventParamsFilteringNonLockerHandler: {
        test: function(cmp) {
            cmp.testEventParamsFilteringNonLockerHandler();
        }
    },

    testEventParamsFilteringSameLocker: {
        test: function(cmp) {
            cmp.testEventParamsFilteringSameLocker();
        }
    },

    testEventParamsFilteringDifferentLocker: {
        test: function(cmp) {
            cmp.testEventParamsFilteringDifferentLocker();
        }
    }
})
