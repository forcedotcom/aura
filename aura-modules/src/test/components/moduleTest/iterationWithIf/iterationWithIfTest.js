({

    testFlipAuraIfFromFalseToTrueAndReorder: {
        attributes: {
            list: ['Skip', 'One']
        },
        test: [
            function(cmp) {
                cmp.set("v.list", ['Skip', 'One', 'Two']);

                var containerElement = cmp.find("container").getElement();

                $A.test.addWaitForWithFailureMessage(true, function() {
                    return $A.test.getText(containerElement).indexOf("Two") > -1;
                },
                "Aura Iteration has not been re-rendered correctly: " + $A.test.getText(containerElement),
                function() {
                    var children = containerElement.children;
                    // div, moduletest-simple-cmp, moduletest-simple-cmp, div
                    $A.test.assertEquals(4, children.length, "There should be 4 elements in the container.");
                    $A.test.assertEquals("MODULETEST-SIMPLE-CMP", children[1].tagName, "The 2nd element should be 'moduletest-simple-cmp'");
                    $A.test.assertEquals("MODULETEST-SIMPLE-CMP", children[2].tagName, "The 3rd element should be 'moduletest-simple-cmp'");
                });
            }
        ]
    }
})
