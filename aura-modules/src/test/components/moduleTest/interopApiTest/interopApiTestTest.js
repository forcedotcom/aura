({
    testGetDef: {
        test: [
            function(cmp) {
                var target = cmp.find('target');
                var actual = target.getDef();
                $A.test.assertEquals(actual.getDescriptor().getQualifiedName(), 'markup://moduleTest:simpleCmp');
            }
        ]
    },

    testIsInstanceOf: {
        test: [
            function(cmp) {
                var target = cmp.find('target');
                var actual = target.isInstanceOf('moduleTest:simpleCmp');
                $A.test.assertTrue(actual);
            }
        ]
    },

    testAfterRender: {
        test: [
            function(cmp) {
                var target = cmp.find('target');
                var actual = target.afterRender();
                $A.test.assertUndefined(actual);
            }
        ]
    },

    testGetReference: {
        test: [
            function(cmp) {
                var target = cmp.find('target');
                var actual = target.getReference('v.literal');
                target.getElement().literal = 'foo';
                $A.test.assertEquals(actual.evaluate(), 'foo');
            }
        ]
    },

    testAddEventHandler: {
        browsers : [ 'GOOGLECHROME' ],
        test: [
            function(cmp) {
                var actual;
                var target = cmp.find('target');
                
                target.addEventHandler("aura:doneRendering", function(){
                    // Should be added without an exception.
                    // Can't test that it actually happens since its already rendered.
                });
            }
        ]
    },
})