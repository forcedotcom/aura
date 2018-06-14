({
    testFlipFirstAuraIfFromFalseToTrue: {
        attributes: {
            list: ["Skip1", "Skip2", "One", "Two"]
        },
        test: [
            function(cmp) {
                // Change "Skip1" to "Zero"
                cmp.set("v.list", ["Zero", "Skip2", "One", "Two"]);

                var containerElement = cmp.find("container").getElement();

                $A.test.addWaitForWithFailureMessage(true, function() {
                        return $A.test.getText(containerElement).indexOf("Zero") > -1;
                    },
                    "Aura Iteration has not been re-rendered correctly: " + $A.test.getText(containerElement),
                    function() {
                        var actual = $A.test.getText(containerElement);
                        $A.test.assertEquals("ZeroOneTwo", actual);
                    });
            }
        ]
    },

    testFlipFirstAuraIfFromTrueToFalse: {
        attributes: {
            list: ["Zero", "Skip2", "One", "Two"]
        },
        test: [
            function(cmp) {
                // Change "Zero" to "Skip1"
                cmp.set("v.list", ["Skip1", "Skip2", "One", "Two"]);

                var containerElement = cmp.find("container").getElement();

                $A.test.addWaitForWithFailureMessage(true, function() {
                        return $A.test.getText(containerElement).indexOf("Zero") < 0;
                    },
                    "Aura Iteration has not been re-rendered correctly: " + $A.test.getText(containerElement),
                    function() {
                        var actual = $A.test.getText(containerElement);
                        $A.test.assertEquals("OneTwo", actual);

                        var childNodes = containerElement.childNodes;
                        // comment, comment, div, div
                        $A.test.assertEquals(4, childNodes.length);

                        var iteration = cmp.find("iteration");
                        var iterationMaker = $A.renderingService.getMarker(iteration);
                        $A.test.assertTrue(iterationMaker === childNodes[0], "Iteration should share same marker with the first element.");
                    });
            }
        ]
    },

    testRemoveFirstAuraAndAddNewElement: {
        attributes: {
            list: ["Skip1", "Skip2", "One", "Two"]
        },
        test: [
            function(cmp) {
                // Remove "Skip1" and add "Three"
                // The marker of Iteration gets changed.
                cmp.set("v.list", ["Skip2", "One", "Two", "Three"]);

                var containerElement = cmp.find("container").getElement();

                $A.test.addWaitForWithFailureMessage(true, function() {
                        return $A.test.getText(containerElement).indexOf("Three") > -1;
                    },
                    "Aura Iteration has not been re-rendered correctly: " + $A.test.getText(containerElement),
                    function() {
                        var actual = $A.test.getText(containerElement);
                        $A.test.assertEquals("OneTwoThree", actual);
                    });
            }
        ]
    },

    testRemoveSharedCommentMarkerAndSetBack: {
        attributes: {
            list: ["Skip1", "Skip2", "One", "Two"]
        },
        test: [
            function(cmp) {
                // Remove "Skip1" and add "Three"
                cmp.set("v.list", ["Skip2", "One", "Two", "Three"]);

                var containerElement = cmp.find("container").getElement();

                $A.test.addWaitForWithFailureMessage(true, function() {
                    return $A.test.getText(containerElement).indexOf("Three") > -1;
                },
                "Aura Iteration has not been re-rendered correctly: " + $A.test.getText(containerElement),
                function() {
                    var actual = $A.test.getText(containerElement);
                    $A.test.assertEquals("OneTwoThree", actual);
                });
            },
            function(cmp) {
                // Add "Skip1" back to the first
                cmp.set("v.list", ["Skip1", "Skip2", "One", "Two"]);

                var containerElement = cmp.find("container").getElement();

                $A.test.addWaitForWithFailureMessage(true, function() {
                        return $A.test.getText(containerElement).indexOf("Three") < 0;
                    },
                    "Aura Iteration has not been re-rendered correctly: " + $A.test.getText(containerElement),
                    function() {
                        var actual = $A.test.getText(containerElement);
                        $A.test.assertEquals("OneTwo", actual);

                        var childNodes = containerElement.childNodes;
                        // comment, comment, div, div
                        $A.test.assertEquals(4, childNodes.length);

                        var iteration = cmp.find("iteration");
                        var iterationMaker = $A.renderingService.getMarker(iteration);
                        $A.test.assertTrue(iterationMaker === childNodes[0], "Iteration should share same marker with the first element.");
                    });
            }
        ]
    },

    testRemoveSharedCommentMarkerAndSetAllAuraIfToTrue: {
        attributes: {
            list: ["Skip1", "Skip2", "One", "Two"]
        },
        test: [
            function(cmp) {
                // Remove "Skip1" and add "Three"
                cmp.set("v.list", ["Skip2", "One", "Two", "Three"]);

                var containerElement = cmp.find("container").getElement();

                $A.test.addWaitForWithFailureMessage(true, function() {
                        return $A.test.getText(containerElement).indexOf("Three") > -1;
                    },
                    "Aura Iteration has not been re-rendered correctly: " + $A.test.getText(containerElement),
                    function() {
                        var actual = $A.test.getText(containerElement);
                        $A.test.assertEquals("OneTwoThree", actual);
                    });
            },
            function(cmp) {
                cmp.set("v.list", ["One", "Two", "Three", "Four", "Five"]);

                var containerElement = cmp.find("container").getElement();

                $A.test.addWaitForWithFailureMessage(true, function() {
                        return $A.test.getText(containerElement).indexOf("Five") > -1;
                    },
                    "Aura Iteration has not been re-rendered correctly: " + $A.test.getText(containerElement),
                    function() {
                        var actual = $A.test.getText(containerElement);
                        $A.test.assertEquals("OneTwoThreeFourFive", actual);

                        var children = containerElement.children;
                        $A.test.assertEquals(5, children.length, "There should be 5 elements in the container.");

                        var iteration = cmp.find("iteration");
                        var iterationMaker = $A.renderingService.getMarker(iteration);
                        $A.test.assertTrue(iterationMaker === children[0], "Iteration should share same marker with the first element.");
                    });
            }
        ]
    },

    testFlipFirstAuraIfFromFalseToTrueByReordering: {
        attributes: {
            list: ["Skip1", "Skip2", "One", "Two"]
        },
        test: [
            function(cmp) {
                // Swap "Skip1" with "Two"
                cmp.set("v.list", ["Two", "Skip2", "One", "Skip1"]);

                var containerElement = cmp.find("container").getElement();

                $A.test.addWaitForWithFailureMessage(true, function() {
                        return $A.test.getText(containerElement).indexOf("TwoOne") > -1;
                    },
                    "Aura Iteration has not been re-rendered correctly: " + $A.test.getText(containerElement),
                    function() {
                        var childNodes = containerElement.childNodes;
                        // div, comment, div, comment
                        $A.test.assertEquals(4, childNodes.length);

                        var iteration = cmp.find("iteration");
                        var iterationMaker = $A.renderingService.getMarker(iteration);
                        $A.test.assertTrue(iterationMaker === childNodes[0], "Iteration should share same marker with the first element.");
                    });
            }
        ]
    },

    testRemoveAllAuraIf: {
        attributes: {
            list: ["Skip1", "Skip2", "One", "Two"]
        },
        test: [
            function(cmp) {
                cmp.set("v.list", []);

                var containerElement = cmp.find("container").getElement();

                $A.test.addWaitForWithFailureMessage(true, function() {
                        return $A.test.getText(containerElement).indexOf("One") < 0;
                    },
                    "Aura Iteration has not been re-rendered correctly: " + $A.test.getText(containerElement),
                    function() {
                        var childNodes = containerElement.childNodes;
                        // comment
                        $A.test.assertEquals(1, childNodes.length);

                        var iteration = cmp.find("iteration");
                        var iterationMaker = $A.renderingService.getMarker(iteration);
                        $A.test.assertTrue(iterationMaker === childNodes[0], "Iteration should share same marker with the first element.");
                    });
            }
        ]
    }
})
