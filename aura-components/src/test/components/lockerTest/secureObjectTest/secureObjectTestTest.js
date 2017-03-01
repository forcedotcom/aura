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

    testMultipleDynamicComponentsRendered: {
        test: [
            function addDynamicComponents(cmp) {
                cmp.createComponent();
                cmp.createComponent();
                cmp.createComponent();
                $A.test.addWaitForWithFailureMessage(
                        3,
                        function() {
                            return cmp.helper._createCmpCompletionCount;
                        },
                        "Failed to dynamically create initial components",
                        function() {
                            var expected = "Instance #1Instance #2Instance #3";
                            var actual = $A.util.getText($A.getRoot().find("content").getElement());
                            $A.test.assertEquals(expected, actual, "Unexpected content of initial components dynamically created")
                        }
                );
            },
            function removeFirstAndLastComponents(cmp) {
                cmp.deleteFirstComponent();
                cmp.deleteLastComponent();
                $A.test.addWaitForWithFailureMessage(
                        true,
                        function() {
                            return cmp.helper._deleteLastComponentCount === 1 && cmp.helper._deleteFirstComponentCount === 1;
                        },
                        "Failed to remove first and last dynamically created components from list",
                        function() {
                            var expected = "Instance #2";
                            var actual = $A.util.getText($A.getRoot().find("content").getElement());
                            $A.test.assertEquals(expected, actual);
                        }
                );
            },
            function addAnotherDynamicComponent(cmp) {
                cmp.createComponent();
                $A.test.addWaitForWithFailureMessage(
                        4,
                        function() {
                            return cmp.helper._createCmpCompletionCount;
                        },
                        "Failed to add an additional dynamically created component to list",
                        function() {
                            var expected = "Instance #2Instance #4";
                            var actual = $A.util.getText($A.getRoot().find("content").getElement());
                            $A.test.assertEquals(expected, actual, "Unexpected content after adding additional dynamically created component")
                        }
                );
            }
            ]
    },

    /**
     * Verify when objects in Locker are wrapped/unwrapped in their secure wrappers the backing object can still be
     * successfully modified.
     */
    testWrappingUnwrappingUpdatesBackingObject: {
        test: function(cmp) {
            cmp.setWrapUnwrapObject();
            cmp.checkWrapUnwrapObject();

            $A.test.addWaitForWithFailureMessage(
                    "Value 1,Value 2,Value 3",
                    function() {
                        return $A.util.getText(document.getElementById("wrapUnwrapTestObj"));
                    },
                    "Property added to the Object by wrapUnwrapFacet is not getting rendered"
            );
        }
    },

    testInputBindingToNewPropOnBackingObject: {
        test: function(cmp) {
            cmp.find("in_inputValue1").set("v.value","input value 1");
            cmp.verifyInputBindingToNewPropOnBackingObject();
            $A.test.addWaitForWithFailureMessage(
                    "input value 1",
                    function() {
                        return $A.util.getText(document.getElementById("out_inputValue1"));
                    },
                    "Property added to the Object via input element not getting rendered"
            );
        }
    },

    testMethodWithParams: {
        test: function(cmp) {
            cmp.testMethodWithParams();
        }
    },

    testRawObjectsConstructorAndProperties: {
        test: function(cmp) {
            cmp.testRawObjectsConstructorAndProperties();
        }
    },

    testUnfilteringOfArrayBuffer: {
        test: function(cmp) {
            cmp.testUnfilteringOfArrayBuffer();
        }
    }
})