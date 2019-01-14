({
    // LockerService not supported on IE
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],
    
    testHostOfElementInTemplate:{
        test: function(cmp) {
            const tester = cmp.find('tester');
            tester.assertHostOfElementInTemplate();
        }
    },
    testHostOfDynamicallyCreatedElementInTemplate: {
        test: function(cmp) {
            const tester = cmp.find('tester');
            tester.assertHostOfDynamicallyCreatedElementInTemplate();
        }
    },
    testHostOfNestedElementInTemplate: {
        test: function(cmp) {
            const tester = cmp.find('tester');
            tester.assertHostOfNestedElementInTemplate();
        }
    },
    testHostOfInnerTemplateElement: {
        test: function(cmp) {
            const tester = cmp.find('tester');
            tester.assertHostOfInnerTemplateElement();
        }
    },
    testHostOfTextNode: {
        test: function(cmp) {
            const tester = cmp.find('tester');
            tester.assertHostOfTextNode();
        }
    },
    testHostOfCustomElement: {
        test: function(cmp) {
            const tester = cmp.find('tester');
            tester.assertHostOfCustomElement();
        }
    },
    testHostOfShadowRoot: {
        test: function(cmp) {
            const tester = cmp.find('tester');
            tester.assertHostOfShadowRoot();
        }
    },
    testHostOfSlotContent: {
        test: function(cmp) {
            const tester = cmp.find('tester');
            tester.assertHostOfSlotContent();
        }
    },
    testHostOfDefaultSlotContentInChild: {
        test: function(cmp) {
            const tester = cmp.find('tester');
            tester.assertHostOfDefaultSlotContentInChild();
        }
    },
    testHostOfAssignedSlotContentInReceivingChild: {
        test: function(cmp) {
            const tester = cmp.find('tester');
            tester.assertHostOfAssignedSlotContentInReceivingChild();
        }
    },
    testHostOfSlotNodeInReceivingChild: {
        test: function(cmp) {
            const tester = cmp.find('tester');
            tester.assertHostOfSlotNodeInReceivingChild();
        }
    },
})
