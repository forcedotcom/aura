({
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],

    testTrackPropertiesCannotBeAccessedViaCustomElement: {
        test: function(cmp) {
            cmp.find("secureDecoratorComponentParent").testTrackPropertiesCannotBeAccessedViaCustomElement();
        }
    }
})
