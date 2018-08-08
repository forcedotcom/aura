({
    // LockerService not supported on IE
    // TODO(W-3674741, W-4446969): FF and LockerService disabled for iOS browser in 212
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11", "-SAFARI", "-IPHONE", "-IPAD"],

    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testLocationAccessorsEquality: {
        test: function(cmp) {
            cmp.testLocationAccessorsEquality();
        }
    },

    testJavascriptPseudoScheme: {
        test: function(component) {
            component.testJavascriptPseudoScheme();
        }
    },

    testLocationAssign: {
        test: function(component) {
            component.testLocationAssign();
        }
    }
})
