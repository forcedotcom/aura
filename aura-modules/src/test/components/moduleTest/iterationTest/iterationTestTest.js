({
    testInteropModulesInInteration: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function (cmp) {
                $A.test.assertEquals(cmp.getElement().tagName, 'MODULETEST-SIMPLE-CMP');
                $A.test.assertEquals(cmp.getElements().length, 3);
            }
        ]
    }
})