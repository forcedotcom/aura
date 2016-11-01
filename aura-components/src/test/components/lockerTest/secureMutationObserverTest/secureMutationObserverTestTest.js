({
    // LockerService not supported on IE
    browsers: ["-IE8", "-IE9", "-IE10", "-IE11"],
   
    setUp: function(cmp) {
        cmp.set("v.testUtils", $A.test);
    },

    testSecureMutationObserver: {
        test: function(cmp) {
            cmp.testSecureMutationObserver();
        }
    }
})