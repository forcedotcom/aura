({
    testInteropModuleInIf: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var module = cmp.getElements()[1];
                $A.test.assertEquals(module.tagName, 'MODULETEST-SIMPLE-CMP');
                $A.test.clickOrTouch(cmp.find("clickme").getElement());
            },
            function (cmp) {
                $A.test.assertEquals(cmp.getElements().length, 1);
            }
        ]
    }
})