({
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-SAFARI", "-IPHONE", "-IPAD"],

    testElement: {
        test: function(cmp) {
            cmp.secureSlotTester("testElement");
        }
    },

    testNamedSlot: {
        test: function(cmp) {
            cmp.secureSlotTester("testNamedSlot");
        }
    },

    testDefaultSlot: {
        test: function(cmp) {
            cmp.secureSlotTester("testDefaultSlot");
        }
    }
})
