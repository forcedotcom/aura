({
    /**
     * Note that this test file operates in system mode (objects are not Lockerized) so the tests delegate logic and
     * verification to the controller and helper files, which operate in user mode.
     */

    // LockerService not supported on IE
    // TODO(W-3674741, W-4446969): FF and LockerService disabled for iOS browser in 212
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-SAFARI", "-IPHONE", "-IPAD"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testAddClass: {
        test: function(cmp) {
            cmp.addClass();
            var cmpTarget = cmp.find('changeIt');
            $A.test.assertTrue($A.util.hasClass(cmpTarget, 'changeMe'), "Failed to set class using $A.util.addClass()");
        }
    },
    testRemoveClass: {
        test: function(cmp) {
            var cmpTarget = cmp.find('changeIt');
            $A.util.addClass(cmpTarget, 'changeMe');
            cmp.removeClass();
            $A.test.assertFalse($A.util.hasClass(cmpTarget, 'changeMe'), "Failed to remove class using $A.util.removeClass()");
        }
    },
    testHasClass: {
        test: [function(cmp) {
            var cmpTarget = cmp.find('changeIt');
            cmp.set("v.hasClassSet", true);
            $A.util.addClass(cmpTarget, 'changeMe');
            cmp.hasClass();
        }, function(cmp) {
            var cmpTarget = cmp.find('changeIt');
            cmp.set("v.hasClassSet", false);
            $A.util.removeClass(cmpTarget, 'changeMe');
            cmp.hasClass();
        }
        ]
    },
    testToggleClass: {
        test: [function(cmp) {
            var cmpTarget = cmp.find('changeIt');
            $A.util.addClass(cmpTarget, 'changeMe');
            cmp.toggleClass(cmpTarget, 'changeMe');
            $A.test.assertFalse($A.util.hasClass(cmpTarget, 'changeMe'), "Failed to remove class using $A.util.toggleClass()");
        }, function(cmp) {
            var cmpTarget = cmp.find('changeIt');
            cmp.toggleClass(cmpTarget, 'changeMe');
            $A.test.assertTrue($A.util.hasClass(cmpTarget, 'changeMe'), "Failed to add class using $A.util.toggleClass()");
        }]
    },

    testAddClass_Element: {
        test: function(cmp) {
            cmp.addClass_Element();
            var cmpTarget = cmp.find('changeIt');
            $A.test.assertTrue($A.util.hasClass(cmpTarget.getElement(), 'changeElement'), "Failed to set class using $A.util.addClass(element)");
        }
    },
    testRemoveClass_Element: {
        test: function(cmp) {
            var cmpTarget = cmp.find('changeIt');
            $A.util.addClass(cmpTarget.getElement(), 'changeElement');
            cmp.removeClass_Element();
            $A.test.assertFalse($A.util.hasClass(cmpTarget.getElement(), 'changeElement'), "Failed to remove class using $A.util.removeClass(element)");
        }
    },
    testHasClass_Element: {
        test: [function(cmp) {
            var cmpTarget = cmp.find('changeIt');
            cmp.set("v.hasClassSet", true);
            $A.util.addClass(cmpTarget.getElement(), 'changeElement');
            cmp.hasClass_Element();
        }, function(cmp) {
            var cmpTarget = cmp.find('changeIt');
            cmp.set("v.hasClassSet", false);
            $A.util.removeClass(cmpTarget.getElement(), 'changeElement');
            cmp.hasClass_Element();
        }
        ]
    },
    testToggleClass_Element: {
        test: [function(cmp) {
            var cmpTarget = cmp.find('changeIt');
            $A.util.addClass(cmpTarget.getElement(), 'changeElement');
            cmp.toggleClass_Element(cmpTarget, 'changeElement');
            $A.test.assertFalse($A.util.hasClass(cmpTarget.getElement(), 'changeElement'), "Failed to remove class using $A.util.toggleClass(element)");
        }, function(cmp) {
            var cmpTarget = cmp.find('changeIt');
            cmp.toggleClass_Element(cmpTarget, 'changeElement');
            $A.test.assertTrue($A.util.hasClass(cmpTarget.getElement(), 'changeElement'), "Failed to add class using $A.util.toggleClass(element)");
        }]
    },
    testAddClassToSecureComponentRef: {
        test: function(cmp) {
            var otherNamespaceCmp = cmp.find("uiButton");
            $A.util.addClass(otherNamespaceCmp, 'oldClass');
            $A.test.assertTrue($A.util.hasClass(otherNamespaceCmp, 'oldClass'), "Failed to add class on cross-namespace cmp in system mode");
            cmp.testAddClassToSecureComponentRef();
            $A.test.assertTrue($A.util.hasClass(otherNamespaceCmp, 'changeMe'), "Failed to add class on cross-namespace cmp in secure mode");
        }
    },

    testIsEmpty_negativeCases: {
        test: function(cmp) {
            cmp.testIsEmpty_negativeCases();
        }
    },

    testIsEmpty_positiveCases: {
        test: function(cmp) {
            cmp.testIsEmpty_positiveCases();
        }
    }
})