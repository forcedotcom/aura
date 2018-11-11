({
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-FIREFOX", "-SAFARI", "-IPHONE", "-IPAD"],

    testWirePropertiesCannotBeAccessedViaCustomElement: {
        test: function(cmp) {
            cmp.find("secureDecoratorComponentParent").testWirePropertiesCannotBeAccessedViaCustomElement();
        }
    }
})
