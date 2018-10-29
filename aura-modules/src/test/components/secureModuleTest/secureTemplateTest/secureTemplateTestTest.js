({
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-SAFARI", "-IPHONE", "-IPAD"],

    testHost: {
        test: function(cmp) {
            cmp.secureTemplateTester("testHost");
        }
    },

    // TODO: Enable After @W-5452159@
    _testHostOtherNamespace: {
        test: function(cmp) {
            cmp.secureTemplateTester("testHostOtherNamespace");
        }
    }
})
