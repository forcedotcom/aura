({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO: Re-enable for Firefox and iOS when autobuilds use a version that supports all Proxy traps we implement
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPAD", "-IPHONE"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testGetPrototypeOfReturnsDivProto: {
        test: function(cmp) {
            cmp.testGetPrototypeOfReturnsDivProto();
        }
    },

    testInstanceOf: {
        test: function(cmp) {
            cmp.testInstanceOf();
        }
    },

    testSetPrototypeOfBaseElementThrowsError: {
        test: function(cmp) {
            cmp.testSetPrototypeOfBaseElementThrowsError();
        }
    },

    testSetGetExpandos: {
        test: function(cmp) {
            cmp.testSetGetExpandos();
        }
    },

    testSetUnsupportedProperty: {
        test: function(cmp) {
            cmp.testSetUnsupportedProperty();
        }
    },

    testInOperation: {
        test: function(cmp) {
            cmp.testInOperation();
        }
    },

    testObjectKeys: {
        test: function(cmp) {
            cmp.testObjectKeys();
        }
    },

    testGetOwnPropertyNames: {
        test: function(cmp) {
            cmp.testGetOwnPropertyNames();
        }
    },

    testDelete: {
        test: function(cmp) {
            cmp.testDelete();
        }
    },

    testAddOptionsToSelect: {
        test: function(cmp) {
            cmp.testAddOptionsToSelect();
        }
    }
})
