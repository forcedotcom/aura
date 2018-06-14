({
    testInteropModuleInIf: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var container = cmp.find("container").getElement();

                var module = container.children[0];
                $A.test.assertEquals('MODULETEST-SIMPLE-CMP', module.tagName);

                cmp.set("v.readyToRender", false);

                $A.test.addWaitFor(true, function() {
                        return $A.test.getText(container).indexOf("I'm modules!") < 0;
                    },
                    function() {
                        $A.test.assertEquals(0, container.children.length);
                    });
            },
            function (cmp) {
                cmp.set("v.readyToRender", true);

                var container = cmp.find("container").getElement();
                $A.test.addWaitFor(true, function() {
                        return $A.test.getText(container).indexOf("I'm modules!") > -1;
                    },
                    function() {
                        $A.test.assertEquals(1, container.children.length);
                    });
            }
        ]
    }
})
