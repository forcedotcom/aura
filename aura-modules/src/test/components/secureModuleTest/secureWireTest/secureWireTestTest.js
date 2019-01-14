({
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],

    testWirePropertiesCannotBeAccessedViaCustomElement: {
        test: function(cmp) {
            cmp.find("secureDecoratorComponentParent").testWirePropertiesCannotBeAccessedViaCustomElement();
        }
    }
})
