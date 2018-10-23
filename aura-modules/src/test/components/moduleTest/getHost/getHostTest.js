({
    // LockerService not supported on IE
    // TODO(W-3674741): FF browser versions in autobuilds is too far behind
    // TODO W-4363273: Bug in BrowserCompatibilityServiceImpl, serving compat version of aura fw js in Safari 11
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-IPHONE", "-IPAD"],
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
