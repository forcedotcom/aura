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
                        var expected = "Instance #1Instance #2Instance #3"
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
                        var expected = "Instance #2Instance #4"
                        var actual = $A.util.getText($A.getRoot().find("content").getElement());
                        $A.test.assertEquals(expected, actual, "Unexpected content after adding additional dynamically created component")
                    }
                );
            }
        ]
    }
})