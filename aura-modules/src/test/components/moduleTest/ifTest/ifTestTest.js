({
    testInteropModuleInIf: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                var module = cmp.getElements()[2];
                $A.test.assertEquals(module.tagName, 'MODULETEST-SIMPLE-CMP');
                $A.test.clickOrTouch(cmp.find("hide").getElement());
            },
            function (cmp) {
                $A.test.assertEquals(cmp.getElements().length, 2);
                $A.test.clickOrTouch(cmp.find("show").getElement());
            },
            function (cmp) {
                var module = cmp.getElements()[2];
                $A.test.assertEquals(module.tagName, 'MODULETEST-SIMPLE-CMP');
            }
        ]
    }
})